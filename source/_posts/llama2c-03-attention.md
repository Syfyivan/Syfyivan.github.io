---
title: "《llama2.c 源码逐行》第03讲 · forward 的心脏：RoPE、KV cache、GQA 注意力"
date: 2026-06-29 10:34:00
tags: [AI, 深度学习, LLM, Llama, llama2.c, C语言, 源码解析, 课程]
categories: [技术笔记]
toc: true
visibility: public
---

<style>
.l2-b{display:inline-block;font-size:12px;font-weight:700;padding:1px 8px;border-radius:999px;vertical-align:middle;margin-left:6px;line-height:1.7;white-space:nowrap}
.l2-core{color:#fff;background:#b73a2c}
.l2-key{color:#b73a2c;background:rgba(183,58,44,.1);border:1px solid rgba(183,58,44,.3)}
.l2-skim{color:#3f5d7e;background:rgba(63,93,126,.1);border:1px solid rgba(63,93,126,.25)}
.l2-note{margin:14px 0;padding:12px 16px;border-left:3px solid #3f5d7e;background:rgba(63,93,126,.06);border-radius:0 4px 4px 0}
.l2-why{margin:14px 0;padding:12px 16px;border-left:3px solid #69727d;background:rgba(105,114,125,.07);border-radius:0 4px 4px 0;color:#3a4049}
.l2-key-note{margin:14px 0;padding:12px 16px;border-left:3px solid #b73a2c;background:rgba(183,58,44,.06);border-radius:0 4px 4px 0}
.l2-fold{margin:14px 0;border:1px solid rgba(29,33,39,.14);border-radius:6px;background:#fafafa;padding:0 16px}
.l2-fold>summary{cursor:pointer;padding:12px 0;font-weight:700;color:#1d2127}
.l2-fold[open]{padding-bottom:8px}
.l2-card{margin:16px 0;padding:14px 18px;border:1px solid rgba(183,58,44,.25);border-radius:8px;background:rgba(183,58,44,.03)}
html[data-user-color-scheme="dark"] .l2-note{background:rgba(126,168,224,.1);border-left-color:#7ea8e0;color:#c9cdd4}
html[data-user-color-scheme="dark"] .l2-why{background:rgba(255,255,255,.04);border-left-color:#8b93a0;color:#aeb4be}
html[data-user-color-scheme="dark"] .l2-key-note{background:rgba(224,108,92,.12);border-left-color:#e0746b;color:#d6dae0}
html[data-user-color-scheme="dark"] .l2-fold{background:rgba(255,255,255,.03);border-color:rgba(255,255,255,.14)}
html[data-user-color-scheme="dark"] .l2-fold>summary{color:#e6e8ec}
html[data-user-color-scheme="dark"] .l2-card{background:rgba(224,108,92,.08);border-color:rgba(224,108,92,.3);color:#d6dae0}
html[data-user-color-scheme="dark"] .l2-key{color:#ef9a8e;background:rgba(224,108,92,.14);border-color:rgba(224,108,92,.4)}
html[data-user-color-scheme="dark"] .l2-skim{color:#9fc1ec;background:rgba(126,168,224,.14);border-color:rgba(126,168,224,.35)}
</style>

## 本讲定位

<div class="l2-key-note"><strong>这是全课心脏</strong>：第 01 讲权重就位、第 02 讲三个原语备好，这一讲进 <code>forward</code>，看 llama2.c 怎么用裸 C 把一层注意力拼出来——RMSNorm → QKV → <strong>RoPE</strong> 旋转位置编码 → <strong>KV cache</strong> 增量 → <strong>GQA</strong> 多头注意力 → 输出投影 + 残差。读完你会看到 nanoGPT 里那张 <code>(B, nh, T, T)</code> 注意力矩阵，在这里变成了一圈圈手写的 <code>for</code> 循环。</div>

## forward 的签名与开场 <span class="l2-b l2-core">必读</span>

```c
float* forward(Transformer* transformer, int token, int pos) {
    Config* p = &transformer->config; TransformerWeights* w = &transformer->weights; RunState* s = &transformer->state;
    float *x = s->x;
    int dim = p->dim;
    int kv_dim = (p->dim * p->n_kv_heads) / p->n_heads; // KV 总宽（GQA 下 < dim）
    int kv_mul = p->n_heads / p->n_kv_heads;            // 几个 query 头共享一组 KV
    int head_size = dim / p->n_heads;
    float* content_row = w->token_embedding_table + token * dim;
    memcpy(x, content_row, dim*sizeof(*x)); // 把该 token 的嵌入复制进残差流 x
```

<div class="l2-key-note"><strong>看签名就懂推理的本质</strong>：<code>forward</code> 一次只吃<strong>一个 token</strong> + 它的<strong>位置 pos</strong>。这就是推理的"增量"特性——不像训练一次喂一整批序列，推理是一个 token 一个 token 来，每次只算当前这一个。</div>

三个派生量先记住：`kv_dim`（KV 的总宽，GQA 下比 `dim` 小）、`kv_mul`（几个 query 头共享一组 KV）、`head_size`。开场 `memcpy` 把该 token 的嵌入行复制进 `x`——`x` 就是这一讲反复提到的**残差流**。

## 逐层循环 ①：归一化 + KV cache 取址 <span class="l2-b l2-key">重点</span>

```c
    for(unsigned long long l = 0; l < p->n_layers; l++) {
        rmsnorm(s->xb, x, w->rms_att_weight + l*dim, dim); // attention rmsnorm
        int loff = l * p->seq_len * kv_dim;
        s->k = s->key_cache + loff + pos * kv_dim;
        s->v = s->value_cache + loff + pos * kv_dim;
```

`rmsnorm` 把残差流 `x` 归一化到分支缓冲 `xb`（`x` 本身不动，等注意力算完再加回）。注意 `+ l*dim` 取第 `l` 层的 norm 权重——第 01 讲那套偏移寻址。

<div class="l2-key-note"><strong>KV cache 是这段最妙的设计</strong>：<code>s->k</code> / <code>s->v</code> 不是新分配的，而是<strong>直接指向 KV cache 里"当前层 <code>loff</code>、当前位置 <code>pos</code>"那一格</strong>。于是下面算出的 K/V 会直接写进缓存。而之前所有位置的 K/V 早缓存好了，注意力时直接读、不重算——这就是 <code>generate</code> 一个 token 一个 token 还能高效的原因。</div>

## 逐层循环 ②：QKV 投影 + RoPE 旋转 <span class="l2-b l2-core">必读</span>

```c
        matmul(s->q, s->xb, w->wq + l*dim*dim, dim, dim);       // Q：dim 宽
        matmul(s->k, s->xb, w->wk + l*dim*kv_dim, dim, kv_dim); // K：kv_dim 宽（GQA 更窄）
        matmul(s->v, s->xb, w->wv + l*dim*kv_dim, dim, kv_dim); // V：kv_dim 宽

        // RoPE：把每个 head 内相邻两维当复数旋转
        for (int i = 0; i < dim; i+=2) {
            int head_dim = i % head_size;
            float freq = 1.0f / powf(10000.0f, head_dim / (float)head_size);
            float val = pos * freq;
            float fcr = cosf(val); float fci = sinf(val);
            int rotn = i < kv_dim ? 2 : 1; // 2 = 同时转 q,k；1 = 只转 q
            for (int v = 0; v < rotn; v++) {
                float* vec = v == 0 ? s->q : s->k;
                float v0 = vec[i]; float v1 = vec[i+1];
                vec[i]   = v0 * fcr - v1 * fci;
                vec[i+1] = v0 * fci + v1 * fcr;
            }
        }
```

QKV 三个 `matmul`：注意 **Q 是 `dim` 宽，K/V 是 `kv_dim` 宽**（更窄）——GQA 的体现。

**RoPE** 是 Llama 区别于 GPT 的关键。逐块看：对每两维 `(i, i+1)` 看成一个复数 `(v0, v1)`，按位置 `pos` 和频率 `freq` 算出旋转角，用 `(cos, sin)` 把这个复数旋转（`vec[i], vec[i+1]` 那两行就是复数乘法 / 平面旋转公式）。`freq = 1/10000^(head_dim/head_size)`——不同维度对用**不同频率**（低维转得快、高维转得慢），编码出多尺度的位置。`rotn` 那行：`i < kv_dim` 时同时旋转 q 和 k，否则只转 q（GQA 下 k 比 q 窄，超出 `kv_dim` 的高维部分只有 q 有）。

<div class="l2-why"><strong>RoPE 的直觉</strong>：它把<strong>绝对位置编码成旋转角</strong>。等会儿算 <code>q·k</code> 点积时，两个 token 各自的旋转角会相减，于是点积里天然带上了它们的<strong>相对位置</strong>——模型不需要单独的位置嵌入表，就能感知"谁离谁多远"，还能外推到训练没见过的更长序列。这就是 Llama 用 RoPE 替掉 GPT 学习式 <code>wpe</code> 的好处。</div>

## 逐层循环 ③：GQA 多头注意力 <span class="l2-b l2-core">必读</span>

```c
        int h;
        #pragma omp parallel for private(h)
        for (h = 0; h < p->n_heads; h++) {
            float* q = s->q + h * head_size;
            float* att = s->att + h * p->seq_len;
            for (int t = 0; t <= pos; t++) { // 只看 0..pos（因果）
                float* k = s->key_cache + loff + t * kv_dim + (h / kv_mul) * head_size; // GQA 共享
                float score = 0.0f;
                for (int i = 0; i < head_size; i++) score += q[i] * k[i];
                score /= sqrtf(head_size);
                att[t] = score;
            }
            softmax(att, pos + 1);
            float* xb = s->xb + h * head_size;
            memset(xb, 0, head_size * sizeof(float));
            for (int t = 0; t <= pos; t++) { // 按注意力权重加权求和 value
                float* v = s->value_cache + loff + t * kv_dim + (h / kv_mul) * head_size;
                float a = att[t];
                for (int i = 0; i < head_size; i++) xb[i] += a * v[i];
            }
        }
```

外层逐 head（OpenMP 并行，各头独立）。对每个 head：

- **打分**：对每个历史位置 `t`（`t <= pos`，**因果**：只能看当前及过去），取该位置的 K，算 `q·k`，再 `/ sqrt(head_size)`（第 02 讲说的缩放点积），存进 `att[t]`。
- **GQA 的核心就在取 K 的那行**：`(h / kv_mul) * head_size`——多个 query 头 `h` 通过整除 `kv_mul` 映射到**同一组 KV**，于是它们共享 K、V。这就是"分组查询注意力"在代码里的全部秘密。
- **softmax**：把分数归一化成注意力权重（`pos+1` 个）。
- **加权求和 value**：`xb[i] += att[t] * v[i]`，V 同样用 `(h/kv_mul)` 取址。结果写回 `xb`。

<div class="l2-note"><strong>对照 nanoGPT</strong>：那边这一整套是 <code>att = q@k^T/sqrt(d)</code> → <code>softmax</code> → <code>att@v</code> 三个张量算子，PyTorch 批量并行；这里是裸 <code>for</code> 循环，一个 head、一个时间步、一个元素地手算。<strong>数学完全一样</strong>，只是 llama2.c 把"批量张量运算"摊开成了"显式循环"，每一次乘加你都看得见。</div>

## 逐层循环 ④：输出投影 + 残差 <span class="l2-b l2-key">重点</span>

```c
        matmul(s->xb2, s->xb, w->wo + l*dim*dim, dim, dim); // 输出投影
        for (int i = 0; i < dim; i++) x[i] += s->xb2[i];    // 残差
```

把多头拼好的 `xb` 过输出投影 `wo` 得 `xb2`，再 `x[i] += xb2[i]` **加回残差流**——注意力对主干 `x` 的"一笔修正"就完成了。（FFN 那半在下一讲。）

## 速查卡 <span class="l2-b l2-core">必读</span>

<div class="l2-card"><strong>注意力心脏速记</strong><br/>• <code>forward(t, token, pos)</code>：一次一个 token，推理是增量的。<br/>• <strong>KV cache</strong>：s->k/s->v 直指缓存当前格，历史 K/V 不重算。<br/>• <strong>RoPE</strong>：相邻两维当复数按 <code>pos·freq</code> 旋转，把绝对位置编进 q/k，点积时自带相对位置。<br/>• <strong>GQA</strong>：K/V 用 <code>kv_dim</code>(更窄)，取址 <code>(h/kv_mul)</code> 让多个 query 头共享一组 KV。<br/>• 注意力 = 逐 head：对 0..pos 算 q·k/√head_size → softmax → 加权求和 v → wo 投影 → 残差加回 x。</div>

## 自测 <span class="l2-b l2-skim">可跳读</span>

<details class="l2-fold"><summary>3 题检验 <span class="l2-b l2-skim">可跳读</span></summary>

**Q1.** `forward` 一次只处理一个 token，那"看前面所有历史"是靠什么实现的？为什么不用把前面 token 重算一遍？

**Q2.** GQA 在代码里体现在哪两处？`(h / kv_mul)` 起什么作用？

**Q3.** RoPE 为什么能让模型感知相对位置？它替掉了 GPT 里的什么？

---

**A1.** 靠 **KV cache**：每个位置算出的 K/V 都写进 `key_cache`/`value_cache`，注意力时遍历 `t=0..pos` 直接从缓存读历史 K/V，所以历史不必重算，只需算当前这个 token 的 Q 去和缓存里的历史 K/V 打分。

**A2.** 一是 K/V 投影矩阵 `wk`/`wv` 用 `kv_dim`（`n_kv_heads * head_size`，比 Q 的 `dim` 窄）；二是注意力里取 K/V 用 `(h / kv_mul) * head_size`，把多个 query 头映射到同一组 KV，实现共享。`kv_mul = n_heads / n_kv_heads` 就是"几个 query 头共享一组 KV"。

**A3.** RoPE 把绝对位置编码成对 q/k 的旋转，q·k 点积时两者的旋转角相减，结果只依赖于它们的位置之差（相对位置）。它替掉了 GPT 里学习式的位置嵌入表 `wpe`，且不存权重、实时算、能外推长度。

</details>

## 小结与下一讲预告

一层注意力的裸 C 实现拆完了：归一化、QKV、RoPE 旋转、KV cache 增量、GQA 共享、加权聚合、输出投影、残差。这是 Llama 和 GPT 差异最集中的地方——RoPE、GQA、KV cache 三处不同全在这段里。

下一讲（04）看 `forward` 的后半——**SwiGLU FFN**（三个矩阵的门控前馈，区别于 GPT 的两矩阵 GELU-MLP）+ 最后的 classifier，然后转到 **BPE tokenizer**：文本和 token 之间怎么互相翻译。
