---
title: "《llm.c 源码逐行》第01讲 · 内存管理：参数与激活，一个大数组 + 一串指针"
date: 2026-06-29 11:02:00
tags: [AI, 深度学习, LLM, GPT-2, llm.c, C语言, 反向传播, 源码解析, 课程]
categories: [技术笔记]
toc: true
visibility: public
---

<style>
.lc-b{display:inline-block;font-size:12px;font-weight:700;padding:1px 8px;border-radius:999px;vertical-align:middle;margin-left:6px;line-height:1.7;white-space:nowrap}
.lc-core{color:#fff;background:#b73a2c}
.lc-key{color:#b73a2c;background:rgba(183,58,44,.1);border:1px solid rgba(183,58,44,.3)}
.lc-skim{color:#3f5d7e;background:rgba(63,93,126,.1);border:1px solid rgba(63,93,126,.25)}
.lc-note{margin:14px 0;padding:12px 16px;border-left:3px solid #3f5d7e;background:rgba(63,93,126,.06);border-radius:0 4px 4px 0}
.lc-why{margin:14px 0;padding:12px 16px;border-left:3px solid #69727d;background:rgba(105,114,125,.07);border-radius:0 4px 4px 0;color:#3a4049}
.lc-key-note{margin:14px 0;padding:12px 16px;border-left:3px solid #b73a2c;background:rgba(183,58,44,.06);border-radius:0 4px 4px 0}
.lc-fold{margin:14px 0;border:1px solid rgba(29,33,39,.14);border-radius:6px;background:#fafafa;padding:0 16px}
.lc-fold>summary{cursor:pointer;padding:12px 0;font-weight:700;color:#1d2127}
.lc-fold[open]{padding-bottom:8px}
.lc-card{margin:16px 0;padding:14px 18px;border:1px solid rgba(183,58,44,.25);border-radius:8px;background:rgba(183,58,44,.03)}
html[data-user-color-scheme="dark"] .lc-note{background:rgba(126,168,224,.1);border-left-color:#7ea8e0;color:#c9cdd4}
html[data-user-color-scheme="dark"] .lc-why{background:rgba(255,255,255,.04);border-left-color:#8b93a0;color:#aeb4be}
html[data-user-color-scheme="dark"] .lc-key-note{background:rgba(224,108,92,.12);border-left-color:#e0746b;color:#d6dae0}
html[data-user-color-scheme="dark"] .lc-fold{background:rgba(255,255,255,.03);border-color:rgba(255,255,255,.14)}
html[data-user-color-scheme="dark"] .lc-fold>summary{color:#e6e8ec}
html[data-user-color-scheme="dark"] .lc-card{background:rgba(224,108,92,.08);border-color:rgba(224,108,92,.3);color:#d6dae0}
html[data-user-color-scheme="dark"] .lc-key{color:#ef9a8e;background:rgba(224,108,92,.14);border-color:rgba(224,108,92,.4)}
html[data-user-color-scheme="dark"] .lc-skim{color:#9fc1ec;background:rgba(126,168,224,.14);border-color:rgba(126,168,224,.35)}
</style>

## 本讲定位

<div class="lc-key-note"><strong>本讲定位</strong>：C 里没有 <code>nn.Module</code>、没有自动求导、没有自动内存管理。GPT-2 的上亿个参数、加一大堆中间激活，全靠<strong>手动摆放</strong>。这一讲把内存讲清楚：<code>GPT2Config</code>（超参）、<code>ParameterTensors</code>（16 个指针指进一块大数组）、<code>grads</code> 与之同形、<code>ActivationTensors</code>（缓存中间激活供 backward 复用）。看懂这个，后面 forward/backward 里满屏的指针偏移就都有了归宿。</div>

## GPT2Config：6 个超参 <span class="lc-b lc-key">重点</span>

```c
typedef struct {
    int max_seq_len, vocab_size, padded_vocab_size, num_layers, num_heads, channels; // 6 个超参
} GPT2Config;
```

| 字段 | 含义（GPT-2 small） |
| --- | --- |
| `max_seq_len` | 最大序列长度（1024） |
| `vocab_size` | 真实词表大小（50257） |
| `padded_vocab_size` | padding 到 128 倍数（50304） |
| `num_layers` | 层数（12） |
| `num_heads` | 注意力头数（12） |
| `channels` | 通道数 C，即 embedding 维度（768） |

<div class="lc-note"><strong>padded_vocab_size 为什么</strong>：把 50257 padding 到 50304（128 的倍数），让词表维度对齐，矩阵乘在 GPU/SIMD 上更快——和 llama2.c、nanoGPT 里那个 50304 是同一个工程动作。算 softmax/loss 时只用前 <code>vocab_size</code> 个，padding 出来的几十个永远是 0。</div>

## ParameterTensors：16 个指针 + 一块大内存 <span class="lc-b lc-core">必读</span>

```c
#define NUM_PARAMETER_TENSORS 16
typedef struct {
    float* wte;      // (V, C)     token 嵌入
    float* wpe;      // (maxT, C)  位置嵌入
    float* ln1w; float* ln1b;        // (L, C)   每层第一个 LayerNorm
    float* qkvw; float* qkvb;        // (L, 3C, C)/(L, 3C)  QKV 投影
    float* attprojw; float* attprojb; // (L, C, C)/(L, C) 注意力输出投影
    float* ln2w; float* ln2b;        // (L, C)   第二个 LayerNorm
    float* fcw; float* fcb;          // (L, 4C, C)/(L, 4C)  FFN 升维
    float* fcprojw; float* fcprojb;  // (L, C, 4C)/(L, C) FFN 降维
    float* lnfw; float* lnfb;        // (C)      最后 LayerNorm
} ParameterTensors;
```

16 个 `float*`，正好覆盖 GPT-2 一个 Block 的全部权重 + 头尾的嵌入与归一化。对着看就是一个 Transformer Block 的零件清单：两个 LayerNorm（ln1/ln2）、QKV 投影、注意力输出投影、FFN 的升维和降维，加上最外层的词/位置嵌入和最后的 LayerNorm。

<div class="lc-key-note"><strong>"一个大数组 + 一串指针"</strong>：<code>malloc_and_point_parameters</code> 的套路是——先算出这 16 块各自多大（每块 = 形状各维相乘，带 <code>L</code> 的还要 ×<code>num_layers</code>），加起来得总数 <code>num_parameters</code>（GPT-2 small ≈ 124M），<strong>一次性 <code>malloc</code> 一整块 <code>params_memory</code></strong>，再把这 16 个指针依次指进这块内存的对应偏移。和 llama2.c 那根游标切 mmap 内存是同一个思路，区别是这里用 <code>malloc</code>（训练要<strong>可写</strong>），不是 mmap 只读。</div>

<div class="lc-why"><strong>为什么挤在一块连续内存</strong>：优化器更新时，一个 <code>for</code> 循环扫过 <code>params_memory</code> 整块就能更新所有参数（第 05 讲 AdamW 就是这么干的），不必挨个张量分别处理。"参数是一根连续的大数组"这个视角，是 llm.c 简洁的关键。</div>

## grads_memory：每个参数配一个梯度槽 <span class="lc-b lc-key">重点</span>

<div class="lc-note"><strong>训练比推理多花的内存，一大半在这</strong>：<code>grads_memory</code> 和 <code>params_memory</code> <strong>同形同大</strong>——每个参数对应一个梯度。backward 往里 <code>+=</code> 累加梯度，update 读它更新参数。AdamW 还要 <code>m_memory</code>/<code>v_memory</code> 两块动量（也同形，第 05 讲）。所以训练时，光参数相关的内存就约 <strong>4 份</strong>（params / grads / m / v）。</div>

## ActivationTensors：缓存中间激活 <span class="lc-b lc-core">必读</span>

```c
#define NUM_ACTIVATION_TENSORS 23
// ActivationTensors：缓存前向每层的中间结果——
// 每层的 ln1 输出、ln1 的 mean/rstd、qkv、atty、preatt/att、residual2/3、ln2、fch、fch_gelu... 共 23 类
```

<div class="lc-key-note"><strong>为什么要缓存这 23 块</strong>：因为 <strong>backward 要用前向的中间结果</strong>——比如 <code>layernorm_backward</code> 需要前向算出的 <code>mean</code>/<code>rstd</code>，<code>attention_backward</code> 需要前向的 <code>att</code>（注意力权重）。micrograd 里整张计算图驻留内存、反向时随便取；llm.c 没有图，只能<strong>手动把前向的中间激活都存下来</strong>，反向才取得到。</div>

<div class="lc-why"><strong>这正是"训练为什么比推理吃内存"的核心</strong>：推理可以"算完就扔"（llama2.c 那样只复用几个小 buffer）；训练必须把整条前向的 activations 全留着等反向用。所以训练显存 = 参数(×4) + <strong>激活缓存</strong>，后者随 batch 和序列长度涨——这也是大模型训练显存吃紧的根源。</div>

## 速查卡 <span class="lc-b lc-core">必读</span>

<div class="lc-card"><strong>内存速记</strong><br/>• 没有 nn.Module / autograd / GC——全手动。<br/>• <strong>ParameterTensors</strong>：16 个指针指进一块 <code>malloc</code> 的连续 <code>params_memory</code>（≈124M）；malloc_and_point 算大小→分配→指针就位。<br/>• <strong>grads_memory</strong> 与参数同形，backward <code>+=</code> 累加；AdamW 再加 m/v 两块同形动量 → 训练参数内存 ≈4 份。<br/>• <strong>ActivationTensors</strong>(23)：缓存前向中间激活供 backward 复用——训练比推理多吃内存就在这。</div>

## 自测 <span class="lc-b lc-skim">可跳读</span>

<details class="lc-fold"><summary>3 题检验 <span class="lc-b lc-skim">可跳读</span></summary>

**Q1.** `ParameterTensors` 里全是 `float*` 指针，但它们指向的是什么？malloc_and_point 干了什么？

**Q2.** 训练时为什么参数相关内存大约是推理的 4 倍？

**Q3.** 为什么要单独缓存 ActivationTensors（如 layernorm 的 mean/rstd、注意力的 att）？推理为什么不用？

---

**A1.** 它们都指进**同一块**连续的 `params_memory`（一次 malloc 的大数组）的不同偏移。malloc_and_point 先算出 16 块各自大小、求和、一次性 malloc 整块，再把 16 个指针依次指到对应起点——和 llama2.c 切 mmap 内存同思路，只是用可写的 malloc。

**A2.** 因为除了参数本身（params），训练还要为每个参数配：梯度（grads）、AdamW 一阶动量（m）、二阶动量（v）——四块同形内存。

**A3.** 因为反向传播要用前向的中间结果（layernorm_backward 用 mean/rstd，attention_backward 用 att）。llm.c 没有计算图，只能手动把这些中间激活存下来供反向取用。推理只前向、不反向，算完即弃，所以不用缓存。

</details>

## 小结与下一讲预告

GPT-2 在 llm.c 里就是几块连续的大数组：参数（params + grads + m + v）+ 激活缓存。没有对象、没有图，全靠指针偏移和手动分配。

下一讲（02）正式进 forward，先啃注意力之外的 5 个"简单层"——encoder、layernorm、matmul、gelu、residual，看它们怎么在这些 `float*` 上用几层 for 循环把数据算出来。
