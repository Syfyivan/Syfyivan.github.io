---
title: "《llm.c 源码逐行》第03讲 · 注意力前向 + gpt2_forward 编排"
date: 2026-06-29 11:04:00
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

<div class="lc-key-note"><strong>本讲定位</strong>：第 02 讲讲完了 5 个"简单层"。这一讲补上最硬的一层——<strong>注意力前向</strong>（GPT-2 里唯一跨 token 混信息的层），再加 softmax / crossentropy，最后看 <code>gpt2_forward</code> 怎么把所有 forward <strong>串成一个完整 GPT-2、算到 loss</strong>。</div>

## attention_forward：4 个 pass <span class="lc-b lc-core">必读</span>

```c
void attention_forward(float* out, float* preatt, float* att, float* inp, int B, int T, int C, int NH) {
    int C3=C*3; int hs=C/NH; float scale=1.0/sqrtf(hs);
    #pragma omp parallel for collapse(3)
    for (int b=0;b<B;b++) for (int t=0;t<T;t++) for (int h=0;h<NH;h++) {
        float* query_t = inp + b*T*C3 + t*C3 + h*hs;
        float* preatt_bth = preatt + b*NH*T*T + h*T*T + t*T;
        float* att_bth = att + b*NH*T*T + h*T*T + t*T;
        // pass 1: q·k + maxval（只看 t2<=t，因果）
        float maxval=-10000.0f;
        for (int t2=0;t2<=t;t2++){ float* key_t2=inp+b*T*C3+t2*C3+h*hs+C; float val=0.0f; for(int i=0;i<hs;i++) val+=query_t[i]*key_t2[i]; val*=scale; if(val>maxval)maxval=val; preatt_bth[t2]=val; }
        // pass 2: exp + sum
        float expsum=0.0f; for (int t2=0;t2<=t;t2++){ float e=expf(preatt_bth[t2]-maxval); expsum+=e; att_bth[t2]=e; }
        float inv=expsum==0.0f?0.0f:1.0f/expsum;
        // pass 3: 归一化(softmax)，t2>t 处置0(因果mask)
        for (int t2=0;t2<T;t2++) att_bth[t2] = (t2<=t)? att_bth[t2]*inv : 0.0f;
        // pass 4: 加权求和 value(+C*2)
        float* out_bth = out + b*T*C + t*C + h*hs;
        for (int i=0;i<hs;i++) out_bth[i]=0.0f;
        for (int t2=0;t2<=t;t2++){ float* value_t2=inp+b*T*C3+t2*C3+h*hs+C*2; float a=att_bth[t2]; for(int i=0;i<hs;i++) out_bth[i]+=a*value_t2[i]; }
    }
}
```

一个关键前提：**Q、K、V 打包在 `inp` 的 `(B, T, 3C)` 里**。同一个 token 的 query 在偏移 `+0`、key 在 `+C`、value 在 `+2C`（所以 `key_t2 = inp + ... + h*hs + C`，value 在 `+ C*2`）。这是因为前面 QKV 投影用一个 `matmul` 一次性产出了 `3C` 宽。

逐 `(b, t, h)`（`collapse(3)` 三层并行），分 4 个 pass：

- **pass 1**：对每个历史位置 `t2`（`t2 <= t`，**因果**），算 query 和 key 的点积 `× scale`，并记下最大值 `maxval`，原始分存进 `preatt`。
- **pass 2**：`exp(分 - maxval)`（减 maxval 是数值稳定）并求和。
- **pass 3**：归一化得 softmax 权重，存进 `att`；`t2 > t` 处**显式置 0**（因果 mask，不让看未来）。
- **pass 4**：按权重对 value 加权求和，写进 `out`。

<div class="lc-key-note"><strong>preatt 和 att 都被缓存</strong>（它们是 <code>(B, NH, T, T)</code> 的大块）。第 01 讲说的 activation 缓存在这里就是实例——注意力的 backward 要用前向的 <code>att</code>（权重），所以前向必须把它留着。</div>

<div class="lc-why"><strong>对照 nanoGPT</strong>：那边这一整套是 <code>att = q@k^T/√d</code> → <code>softmax</code> → <code>att@v</code> 三个张量算子；这里摊成裸 for，每个 pass 你都看得见。注意力是 GPT-2 里<strong>唯一跨 token</strong> 的层（每个 <code>t</code> 要看 <code>0..t</code> 全部历史），算力重，所以它和 matmul 一样是第二个上 OpenMP 的硬骨头。</div>

## softmax_forward + crossentropy_forward <span class="lc-b lc-key">重点</span>

```c
void softmax_forward(float* probs, float* logits, int B, int T, int V, int Vp) {
    #pragma omp parallel for collapse(2)
    for (int b=0;b<B;b++) for (int t=0;t<T;t++) {
        float* logits_bt=logits+b*T*Vp+t*Vp; float* probs_bt=probs+b*T*Vp+t*Vp;
        float maxval=-10000.0f; for(int i=0;i<V;i++) if(logits_bt[i]>maxval) maxval=logits_bt[i];
        float sum=0.0f; for(int i=0;i<V;i++){ probs_bt[i]=expf(logits_bt[i]-maxval); sum+=probs_bt[i]; }
        for(int i=0;i<V;i++) probs_bt[i]/=sum;
        for(int i=V;i<Vp;i++) probs_bt[i]=0.0f; // padding 维置 0
    }
}
void crossentropy_forward(float* losses, float* probs, int* targets, int B, int T, int Vp) {
    for (int b=0;b<B;b++) for (int t=0;t<T;t++){ float* probs_bt=probs+b*T*Vp+t*Vp; int ix=targets[b*T+t]; losses[b*T+t]=-logf(probs_bt[ix]); }
}
```

- **`softmax_forward`**：把 logits 变概率。注意它在 `Vp`（padded 词表）的内存上操作，但只算前 `V` 个真实词（`[V, Vp)` 的 padding 维置 0）。照例减 max 防溢出。
- **`crossentropy_forward`**：`loss = -log(probs[target])`，逐 `(b,t)`。`targets` 是每个位置"正确的下一个 token id"（输入右移一位，和 nanoGPT 的 next-token 监督一致）。概率给对了的位置越高，`-log` 越小，loss 越低。

## gpt2_forward：把层串成一个 GPT-2 <span class="lc-b lc-core">必读</span>

```c
encoder_forward(acts.encoded, inputs, params.wte, params.wpe, B, T, C); // 词+位置嵌入 -> residual[0]
for (int l = 0; l < L; l++) {
    residual = l==0 ? acts.encoded : acts.residual3 + (l-1)*B*T*C; // 上一层输出
    layernorm_forward(l_ln1, ..., residual, l_ln1w, l_ln1b, B, T, C);
    matmul_forward(l_qkv, l_ln1, l_qkvw, l_qkvb, B, T, C, 3*C);     // QKV 投影
    attention_forward(l_atty, l_preatt, l_att, l_qkv, B, T, C, NH); // 注意力
    matmul_forward(l_attproj, l_atty, l_attprojw, l_attprojb, B, T, C, C); // 输出投影
    residual_forward(l_residual2, residual, l_attproj, B*T*C);     // 残差①
    layernorm_forward(l_ln2, ..., l_residual2, l_ln2w, l_ln2b, B, T, C);
    matmul_forward(l_fch, l_ln2, l_fcw, l_fcb, B, T, C, 4*C);      // FFN 升维
    gelu_forward(l_fch_gelu, l_fch, B*T*4*C);                       // GELU
    matmul_forward(l_fcproj, l_fch_gelu, l_fcprojw, l_fcprojb, B, T, 4*C, C); // FFN 降维
    residual_forward(l_residual3, l_residual2, l_fcproj, B*T*C);   // 残差②
}
residual = acts.residual3 + (L-1)*B*T*C;
layernorm_forward(acts.lnf, ..., residual, params.lnfw, params.lnfb, B, T, C); // 最后 LayerNorm
matmul_forward(acts.logits, acts.lnf, params.wte, NULL, B, T, C, Vp); // 分类头复用 wte（weight tying）
softmax_forward(acts.probs, acts.logits, B, T, V, Vp);
if (targets != NULL) crossentropy_forward(model->acts.losses, model->acts.probs, targets, B, T, Vp); // loss
```

这是把前两讲所有 forward 函数**编排成一个完整 GPT-2** 的地方。逐层一个 Transformer Block：`ln1 → QKV 投影 → 注意力 → 输出投影 → 残差① → ln2 → FFN 升维 → GELU → FFN 降维 → 残差②`；叠完 `L` 层后，`lnf → logits 投影 → softmax → crossentropy` 出 loss。

<div class="lc-note"><strong>两个细节</strong>：① 每层那些 <code>l_ln1w</code>/<code>l_qkv</code> 指针，都是从 params/acts 大数组里按 <code>+ l*size</code> 偏移切出来的（第 01 讲那套寻址）；② <code>logits</code> 那次 matmul 用的权重是 <code>params.wte</code>——<strong>分类头复用了词嵌入表（weight tying）</strong>，和 nanoGPT 一样。残差用的就是第 02 讲的 <code>residual_forward</code>，把上一层和子层输出相加。</div>

## 速查卡 <span class="lc-b lc-core">必读</span>

<div class="lc-card"><strong>注意力前向 + 编排速记</strong><br/>• Q/K/V 打包在 <code>(B,T,3C)</code>：q 在 +0、k 在 +C、v 在 +2C。<br/>• <strong>attention_forward 4 pass</strong>：q·k×scale(因果 t2≤t) → exp 减 max 求和 → 归一化(t2>t 置0) → 加权求和 v；preatt/att 缓存供 backward。<br/>• softmax 在 Vp 上只算前 V；crossentropy = <code>-log(probs[target])</code>。<br/>• <strong>gpt2_forward</strong> 把层串成 GPT-2 Block（ln1→qkv→attn→proj→残差→ln2→fc→gelu→fcproj→残差），最后 lnf→logits(复用 wte)→softmax→loss。</div>

## 自测 <span class="lc-b lc-skim">可跳读</span>

<details class="lc-fold"><summary>3 题检验 <span class="lc-b lc-skim">可跳读</span></summary>

**Q1.** attention_forward 里取 key 用 `+C`、取 value 用 `+C*2`，为什么？

**Q2.** 因果（causal）体现在代码哪两处？

**Q3.** `gpt2_forward` 最后那次 logits 的 matmul 用了 `params.wte` 当权重，这意味着什么？

---

**A1.** 因为 Q、K、V 三者被一个 matmul 一次性投影、打包在 `inp` 的 `(B,T,3C)` 里：同一 token 的 query 在偏移 0、key 在 `+C`、value 在 `+2C`。所以取 key/value 要加这两个偏移。

**A2.** 一是 pass 1/2/4 的内层循环都是 `for t2 <= t`——只看当前及过去位置；二是 pass 3 显式把 `t2 > t` 的注意力权重置 0（causal mask）。两者保证位置 t 不会看到未来。

**A3.** weight tying（权重共享）——输出端的分类头复用输入端的词嵌入表 `wte`，省一大块参数，也是 GPT-2 的标准做法（nanoGPT 同款）。

</details>

## 小结与下一讲预告

到这里，GPT-2 的整条**前向**就通了：从 token 嵌入，经过 12 个 Block（注意力 + FFN），到 logits、再到 loss。沿途的 mean/rstd、preatt/att 等中间激活都被缓存了下来。

下一讲（04）是全课的灵魂——**手写反向传播**。我们会看到每个 forward 都配一个 backward，从 `loss` 出发，按 forward 的逆序，把梯度一路 `+=` 回每个参数。那一讲，你会真正看懂 micrograd 那颗种子在 GPT-2 上长成了什么。
