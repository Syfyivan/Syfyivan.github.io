---
title: "《llm.c 源码逐行》第00讲 · 导论：纯 C 训练 GPT-2，回到 micrograd 的闭环"
date: 2026-06-29 11:01:00
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

<div class="lc-key-note"><strong>这是"玩具 AI 源码"线的终点</strong>。前三课：<a href="/courses/micrograd/">micrograd</a>（Python 手写 autograd 的种子）、<a href="/courses/nanogpt/">nanoGPT</a>（PyTorch 训 GPT）、<a href="/courses/llama2c/">llama2.c</a>（纯 C 推理 Llama）。这一课 llm.c——karpathy 用<strong>纯 C 训练 GPT-2，连反向传播都手写</strong>。它正好<strong>回到 micrograd 的闭环</strong>：同样给每个运算手写 forward/backward、用 <code>+=</code> 累加梯度，只是从标量长成张量、从玩具网络长成真 GPT-2。本讲铺全景。</div>

## llm.c 是什么 <span class="lc-b lc-core">必读</span>

一个文件 `train_gpt2.c`（约 1000 行）从零**训练** GPT-2，零依赖、CPU 能跑（另有 CUDA 版 `train_gpt2.cu` 跑 GPU）。

<div class="lc-note"><strong>和 llama2.c 的关键区别</strong>：llama2.c 只做<strong>推理</strong>（前向 + 采样）；llm.c 要<strong>训练</strong>——于是多了两大块：<strong>反向传播</strong>（求梯度）和<strong>优化器</strong>（用梯度更新参数），而且全是手写的。读 llm.c，等于把"训练"这件事彻底拆开看。</div>

## 回到 micrograd：这条线的闭环 <span class="lc-b lc-core">必读</span>

这是整条线最想让你看到的呼应。micrograd 第 02 讲我们手写了每个运算的 `_backward`、用 `grad +=` 累加梯度。llm.c 做的是**同一件事的放大版**——每个层都有一对 forward/backward，backward 里手算局部梯度、用 `+=` 累加。看最直白的 residual：

```c
void residual_forward(float* out, float* inp1, float* inp2, int N) { for (int i=0;i<N;i++) out[i]=inp1[i]+inp2[i]; }
void residual_backward(float* dinp1, float* dinp2, float* dout, int N) { for (int i=0;i<N;i++){ dinp1[i]+=dout[i]; dinp2[i]+=dout[i]; } }
```

`residual_backward` 把下游梯度 `dout` 原样分给两个输入（都 `+=`）。

<div class="lc-key-note"><strong>一字不差</strong>：对比 micrograd 加法 <code>__add__</code> 的 <code>_backward</code>——<code>self.grad += out.grad; other.grad += out.grad</code>。两者完全相同。区别只在形式：micrograd 是标量 <code>Value</code>、有计算图对象，反向时沿图自动调 <code>_backward</code>；llm.c 是 <code>float*</code> 数组、<strong>没有图</strong>，靠程序员手工按 forward 的逆序去调每个 backward。但"<strong>局部导数 × 下游梯度、累加到输入</strong>"这个内核，完全一样。</div>

<div class="lc-why"><strong>所以读 llm.c 不是学新东西，是看那颗种子长成参天大树</strong>：读完你会彻底明白，PyTorch 的 <code>loss.backward()</code>、<code>torch.optim.AdamW</code>，本质就是 llm.c 这样一行行手写出来的，只是被框架封装、自动化、搬上了 GPU。</div>

## 全景：层函数成对 + 三个编排函数 <span class="lc-b lc-key">重点</span>

| 部件 | 干什么 |
| --- | --- |
| **层函数**（各一对 fwd/bwd） | encoder / layernorm / matmul / attention / gelu / residual / softmax / crossentropy——积木 |
| `gpt2_forward` | 把 forward 们按一个 GPT-2 Block 串起来，一路算到 loss |
| `gpt2_backward` | 把 backward 们按 **forward 的逆序**串一遍，从 loss 算回每个参数的梯度 |
| `gpt2_update` | 手写 **AdamW**，用梯度更新参数 |

`gpt2_forward` 的编排（逐层一个 Block）：

```c
encoder_forward(...);                  // 词+位置嵌入
for (int l = 0; l < L; l++) {          // 每层一个 Transformer Block
    layernorm_forward(...);            // ln1
    matmul_forward(... 3*C);           // QKV 投影
    attention_forward(...);            // 注意力
    matmul_forward(... C);             // 输出投影
    residual_forward(...);             // 残差①
    layernorm_forward(...);            // ln2
    matmul_forward(... 4*C);           // FFN 升维
    gelu_forward(...);                 // GELU
    matmul_forward(... C);             // FFN 降维
    residual_forward(...);             // 残差②
}
layernorm_forward(... lnf);            // 最后 LayerNorm
matmul_forward(... logits, wte);       // 分类头复用 wte（weight tying）
softmax_forward(...); crossentropy_forward(...); // 概率 + loss
```

<div class="lc-note"><strong>眼熟吗</strong>：这就是 nanoGPT 那个 GPT 结构（ln1→注意力→残差→ln2→MLP→残差，叠 N 层，最后投影出 logits、算 cross-entropy），只是这里用一个个 C 函数<strong>手工拼</strong>，而不是 PyTorch 的 <code>nn.Module</code> 自动串联。</div>

## 本系列怎么读 <span class="lc-b lc-core">必读</span>

| 讲 | 内容 |
| --- | --- |
| 00（本讲） | 全景 + 回到 micrograd 的闭环 |
| 01 | 内存：参数与激活，一个大数组 + 一串指针 |
| 02 | 前向层（一）：encoder/layernorm/matmul/gelu/residual |
| 03 | 注意力前向 + `gpt2_forward` 编排 |
| 04 | **手写反向传播**（全课灵魂，回到 micrograd） |
| 05 | AdamW 优化器 + 训练循环（终，四课收尾） |

<div class="lc-note"><strong>最该花力气</strong>的是第 04 讲——手写反向传播，那是 llm.c 区别于 llama2.c、也是与 micrograd 闭环的地方。</div>

## 速查卡 <span class="lc-b lc-core">必读</span>

<div class="lc-card"><strong>导论速记</strong><br/>• llm.c = 纯 C <strong>训练</strong> GPT-2，手写反向传播 + 手写 AdamW，零依赖。<br/>• 比 llama2.c（只推理）多了 backward + optimizer。<br/>• <strong>回到 micrograd</strong>：每层一对 forward/backward，backward 手算局部梯度、<code>+=</code> 累加——residual_backward 和 micrograd 加法 _backward 一字不差。<br/>• 三个编排函数：<code>gpt2_forward</code>（串前向到 loss）/ <code>gpt2_backward</code>（逆序串反向）/ <code>gpt2_update</code>（AdamW）。</div>

## 小结与下一讲预告

llm.c 把"训练"翻到了最底层：没有 autograd 引擎替你求导，每个梯度都是手写的，和 micrograd 同源。这一课读完，你对"模型怎么算、怎么训"会形成一个完整闭环。

下一讲（01）先解决一个 C 程序员绕不开的问题：没有 `nn.Module`、没有自动内存管理，GPT-2 的上亿个参数和一大堆中间激活，到底**怎么在内存里摆放**——答案是"一个大数组 + 一串指针"。
