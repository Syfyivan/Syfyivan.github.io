---
title: "《llm.c 源码逐行》第04讲 · 手写反向传播（全课灵魂，回到 micrograd）"
date: 2026-06-29 11:05:00
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

<div class="lc-key-note"><strong>全课灵魂</strong>：llm.c 区别于 llama2.c（只推理）、与 micrograd 闭环的地方，全在这一讲。原则一句话——<strong>每个 forward 配一个 backward，backward 接收下游梯度、算本运算的局部梯度、用 <code>+=</code> 累加到输入的梯度槽</strong>。和 micrograd 的 <code>_backward</code> 完全同构。下面逐个看代表性的 backward。</div>

## 总原则：每个 backward 在干什么 <span class="lc-b lc-core">必读</span>

<div class="lc-note"><strong>看签名就懂</strong>：<code>xxx_backward(d&lt;输入们&gt;, dout, &lt;前向的输入/缓存&gt;, ...)</code>。它拿到下游梯度 <code>dout</code>，算"本运算对各输入的局部导数"，乘上 <code>dout</code>，<code>+=</code> 到对应的 <code>d&lt;输入&gt;</code>。这和 micrograd 的 <code>_backward</code>（<code>self.grad += 局部导 * out.grad</code>）<strong>一模一样</strong>，只是这里输入是 <code>float*</code> 数组、梯度槽是 <code>d</code> 数组、手工调用而非沿图自动。</div>

## ① crossentropy_softmax_backward：起点，极简 <span class="lc-b lc-core">必读</span>

```c
void crossentropy_softmax_backward(float* dlogits, float* dlosses, float* probs, int* targets, int B, int T, int V, int Vp) {
    for (int b=0;b<B;b++) for (int t=0;t<T;t++){ float* dlogits_bt=dlogits+b*T*Vp+t*Vp; float* probs_bt=probs+b*T*Vp+t*Vp; float dloss=dlosses[b*T+t]; int ix=targets[b*T+t];
        for(int i=0;i<V;i++){ float p=probs_bt[i]; float ind=i==ix?1.0f:0.0f; dlogits_bt[i]+=(p-ind)*dloss; } }
}
```

反向的**起点**是 loss。softmax + crossentropy 合起来，梯度极简：`dlogits = probs - onehot(target)`，逐 `(b,t)` 逐词 `dlogits[i] += (probs[i] - [i==target]) * dloss`。

<div class="lc-why"><strong>为什么这么简洁</strong>：softmax 和 crossentropy 单独的梯度都很啰嗦，但<strong>合起来数学上消成了 <code>probs - onehot</code></strong>——"预测概率分布减去真实分布"。这是深度学习里最优雅的梯度之一。llm.c 把 softmax 和 crossentropy 的 backward 合成一个函数，正是为了直接用这个简化（不必先算 softmax 的雅可比再乘 crossentropy 的梯度）。</div>

## ② matmul_backward：线性层 <span class="lc-b lc-core">必读</span>

```c
void matmul_backward(float* dinp, float* dweight, float* dbias, const float* dout, const float* inp, const float* weight, int B, int T, int C, int OC) {
    #pragma omp parallel for collapse(2)
    for (int b=0;b<B;b++) for (int t=0;t<T;t++) {        // 回传到 inp
        const float* dout_bt=dout+b*T*OC+t*OC; float* dinp_bt=dinp+b*T*C+t*C;
        for (int o=0;o<OC;o++){ const float* wrow=weight+o*C; float d=dout_bt[o]; for (int i=0;i<C;i++) dinp_bt[i]+=wrow[i]*d; }
    }
    #pragma omp parallel for
    for (int o=0;o<OC;o++) for (int b=0;b<B;b++) for (int t=0;t<T;t++) { // 回传到 weight/bias
        const float* dout_bt=dout+b*T*OC+t*OC; const float* inp_bt=inp+b*T*C+t*C; float* dwrow=dweight+o*C; float d=dout_bt[o];
        if (dbias!=NULL) dbias[o]+=d;
        for (int i=0;i<C;i++) dwrow[i]+=inp_bt[i]*d;
    }
}
```

`out = inp @ W^T + bias` 的三个梯度：`dinp += W^T·dout`、`dweight += inp·dout`、`dbias += dout`。全是 `+=`。两个并行块分别回传到 inp（按 B,T 并行）和 weight/bias（按 OC 并行）。

<div class="lc-note"><strong>就是 micrograd 乘法 backward 的张量版</strong>：乘法的梯度是"乘上另一个输入"——matmul 对 <code>inp</code> 的梯度乘 <code>W</code>，对 <code>W</code> 的梯度乘 <code>inp</code>。一模一样的链式法则，只是从标量乘变成了矩阵乘。</div>

## ③ residual_backward + encoder_backward：加法与查表 <span class="lc-b lc-key">重点</span>

```c
void residual_backward(float* dinp1, float* dinp2, float* dout, int N) { for (int i=0;i<N;i++){ dinp1[i]+=dout[i]; dinp2[i]+=dout[i]; } }
void encoder_backward(float* dwte, float* dwpe, float* dout, int* inp, int B, int T, int C) {
    for (int b=0;b<B;b++) for (int t=0;t<T;t++){ float* dout_bt=dout+b*T*C+t*C; int ix=inp[b*T+t];
        for (int i=0;i<C;i++){ float d=dout_bt[i]; dwte[ix*C+i]+=d; dwpe[t*C+i]+=d; } }
}
```

- **`residual_backward`**：梯度原样分给两个输入（都 `+= dout`）——和 micrograd 加法 `__add__` 的 `_backward` **一字不差**（本课开篇就点过）。
- **`encoder_backward`**：嵌入是"查表"，反向就是把 `dout` 累加回被查的那一行（`dwte[ix] += d`、`dwpe[t] += d`）。

<div class="lc-why"><strong>注意 encoder_backward 的 <code>+=</code></strong>：同一个 token id 在一批数据里出现多次，它们的梯度会<strong>自动累加</strong>到 <code>dwte</code> 的同一行——正是 micrograd 里"一个节点被多处用到，梯度要累加"的张量版。<code>+=</code> 不是随手写的，是多元链式法则的要求。</div>

## ④ layernorm_backward：用前向缓存的统计量 <span class="lc-b lc-key">重点</span>

<details class="lc-fold"><summary>展开：layernorm_backward 逐行（稍复杂，可跳读）<span class="lc-b lc-skim">可跳读</span></summary>

```c
void layernorm_backward(float* dinp, float* dweight, float* dbias, float* dout, float* inp, float* weight, float* mean, float* rstd, int B, int T, int C) {
    for (int b=0;b<B;b++) for (int t=0;t<T;t++) {
        ... float mean_bt=mean[b*T+t], rstd_bt=rstd[b*T+t];  // 用前向缓存的 mean/rstd
        float dnorm_mean=0.0f, dnorm_norm_mean=0.0f;          // 两个 reduce
        for (int i=0;i<C;i++){ float norm=(inp_bt[i]-mean_bt)*rstd_bt; float dn=weight[i]*dout_bt[i]; dnorm_mean+=dn; dnorm_norm_mean+=dn*norm; }
        dnorm_mean/=C; dnorm_norm_mean/=C;
        for (int i=0;i<C;i++){ float norm=(inp_bt[i]-mean_bt)*rstd_bt; float dn=weight[i]*dout_bt[i];
            dbias[i]+=dout_bt[i]; dweight[i]+=norm*dout_bt[i];   // weight/bias 梯度
            float dval=dn - dnorm_mean - norm*dnorm_norm_mean; dval*=rstd_bt; dinp_bt[i]+=dval; } // input 梯度(3项)
    }
}
```

不必背公式，记两点就够：① 它用了前向**缓存**的 `mean`/`rstd`（第 01/02 讲埋的 activation 缓存，在这里取用）；② `dweight`/`dbias` 直接累加，`dinp` 由三项组成（`dnorm` 项 − 均值项 − 方差项）再 `× rstd`，每个梯度都是 `+=`。LayerNorm 的输入梯度复杂，是因为均值和方差让每个输出都依赖了整条向量的所有元素。

</details>

## ⑤ attention_backward：逐 pass 逆推 <span class="lc-b lc-core">必读</span>

```c
void attention_backward(float* dinp, float* dpreatt, float* datt, float* dout, float* inp, float* att, int B, int T, int C, int NH) {
    ... for (int b=0;b<B;b++) for (int t=0;t<T;t++) for (int h=0;h<NH;h++) {
        // 逆 pass4：穿过 value 加权
        for (int t2=0;t2<=t;t2++){ ... for(int i=0;i<hs;i++){ datt_bth[t2]+=value_t2[i]*dout_bth[i]; dvalue_t2[i]+=att_bth[t2]*dout_bth[i]; } }
        // 逆 pass2&3：穿过 softmax（雅可比 att[t2]*(δ - att[t3])）
        for (int t2=0;t2<=t;t2++) for (int t3=0;t3<=t;t3++){ float ind=t2==t3?1.0f:0.0f; float ld=att_bth[t2]*(ind-att_bth[t3]); dpreatt_bth[t3]+=ld*datt_bth[t2]; }
        // 逆 pass1：穿过 q·k matmul
        for (int t2=0;t2<=t;t2++){ ... for(int i=0;i<hs;i++){ dquery_t[i]+=key_t2[i]*dpreatt_bth[t2]*scale; dkey_t2[i]+=query_t[i]*dpreatt_bth[t2]*scale; } }
    }
}
```

全课最精彩的一段。它把 attention_forward 的 4 个 pass **逆序**反推：

- **逆 pass 4**（value 加权）：`datt += value·dout`、`dvalue += att·dout`。
- **逆 pass 2&3**（softmax）：用 softmax 的雅可比 `att[t2]·(δ − att[t3])`，`dpreatt += 雅可比·datt`。（用了前向缓存的 `att`。）
- **逆 pass 1**（q·k 点积）：`dquery += key·dpreatt·scale`、`dkey += query·dpreatt·scale`。

<div class="lc-key-note"><strong>这就是"手写反向传播"的极致</strong>：前向有几步，反向就逆着推几步，每步用本步的局部导数。它没有任何 autograd 帮忙，完全是手推数学 + 手写循环。读懂它，你就彻底明白——<strong>反向传播不是魔法，是链式法则的机械执行</strong>。</div>

## gpt2_backward：把它们按逆序串一遍 <span class="lc-b lc-key">重点</span>

<div class="lc-note"><code>gpt2_backward</code> 就是把上面这些 backward 按 forward 的<strong>逆序</strong>调一遍：先 <code>crossentropy_softmax_backward</code> 从 loss 出发，然后 lnf、logits matmul，再<strong>逐层从最后一层往第 0 层</strong>（residual→fcproj→gelu→fc→ln2→attproj→attention→qkv→ln1），最后 <code>encoder_backward</code>。一路把梯度 <code>+=</code> 回 <code>grads_memory</code> 里每个参数。这就是 PyTorch <code>loss.backward()</code> 的手写版。</div>

<div class="lc-key-note"><strong>整条线在这里闭环</strong>：micrograd 的 <code>Value.backward()</code> 做拓扑排序、按逆序调每个节点的 <code>_backward</code>；llm.c 的 <code>gpt2_backward</code> 手工按逆序调每个层的 backward。<strong>原理完全相同</strong>——按前向逆序、每步用局部导数、<code>+=</code> 累加梯度。区别只是 micrograd 自动（有图）、llm.c 手动（没图）。你在 micrograd 手写过的那套，在这里放大成了真 GPT-2。</div>

## 速查卡 <span class="lc-b lc-core">必读</span>

<div class="lc-card"><strong>反向传播速记</strong><br/>• 每个 backward = "局部导数 × 下游 dout，<code>+=</code> 到输入梯度"，同 micrograd 的 _backward。<br/>• <strong>crossentropy_softmax</strong>：<code>dlogits = probs − onehot</code>（起点，最优雅）。<br/>• <strong>matmul</strong>：dinp+=W·dout、dW+=inp·dout、db+=dout（乘法梯度的张量版）。<br/>• <strong>residual</strong>：分给两输入(=micrograd 加法)；<strong>encoder</strong>：累加回查表行。<br/>• <strong>attention</strong>：逐 pass 逆推（value→softmax 雅可比→q·k）。<br/>• <strong>gpt2_backward</strong>：按 forward 逆序串一遍，+= 回 grads_memory——=micrograd backward 的放大版。</div>

## 自测 <span class="lc-b lc-skim">可跳读</span>

<details class="lc-fold"><summary>3 题检验 <span class="lc-b lc-skim">可跳读</span></summary>

**Q1.** 为什么所有 backward 用 `+=` 而不是 `=`？（提示：回想 micrograd 与 encoder 的查表）

**Q2.** `crossentropy_softmax_backward` 把 softmax 和 crossentropy 合成一个函数算梯度，好处是什么？梯度是什么形式？

**Q3.** `gpt2_backward` 和 micrograd 的 `Value.backward()` 在做同一件事，区别在哪？

---

**A1.** 因为一个量可能被多处使用（如同一 token id 出现多次、残差让一个张量流向两条路径），多条路径的梯度按链式法则要累加。`+=` 把它们叠加，`=` 会覆盖。这和 micrograd 的 `grad +=` 同源。

**A2.** 单独算 softmax 的雅可比再乘 crossentropy 梯度很啰嗦；合起来数学上消成 `probs - onehot(target)`，一行就出，又快又稳。

**A3.** 都是"按前向逆序、每步用局部导数、`+=` 累加梯度"。区别：micrograd 有计算图，`backward()` 拓扑排序后自动逐节点调 `_backward`；llm.c 没有图，`gpt2_backward` 由人手工按逆序调每个层的 backward。

</details>

## 小结与下一讲预告

这一讲把"训练里 `loss.backward()` 到底逐行在干什么"彻底拆开了：每个层一个手写 backward，从 loss 按 forward 逆序、用链式法则、`+=` 回每个参数的梯度——micrograd 那颗种子在真 GPT-2 上的完整形态。

最后一讲（05）把梯度用起来：手写 **AdamW** 优化器更新参数，再把 `forward → zero_grad → backward → update` 拼成训练循环，跑起来——并为整条"玩具 AI 源码"四课收尾。
