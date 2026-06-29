---
title: "《llama2.c 源码逐行》第04讲 · SwiGLU FFN + classifier，与 BPE tokenizer"
date: 2026-06-29 10:35:00
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

<div class="l2-key-note"><strong>本讲定位</strong>：第 03 讲拼完了注意力。这一讲先把 <code>forward</code> 收尾——<strong>SwiGLU FFN</strong>（三个矩阵的门控前馈）+ 最后的 classifier 出 logits；然后转到 <strong>tokenizer</strong>：文本和 token 之间怎么互译（<code>decode</code> 看代码，<code>encode</code>/BPE 讲思路）。</div>

## SwiGLU FFN：三个矩阵的门控前馈 <span class="l2-b l2-core">必读</span>

```c
        rmsnorm(s->xb, x, w->rms_ffn_weight + l*dim, dim);  // ffn rmsnorm
        // FFN: w2( silu(w1(x)) * w3(x) )  —— SwiGLU
        matmul(s->hb,  s->xb, w->w1 + l*dim*hidden_dim, dim, hidden_dim);
        matmul(s->hb2, s->xb, w->w3 + l*dim*hidden_dim, dim, hidden_dim);
        for (int i = 0; i < hidden_dim; i++) {
            float val = s->hb[i];
            val *= (1.0f / (1.0f + expf(-val))); // silu(x)=x*sigmoid(x)
            val *= s->hb2[i];                    // 逐元素乘 w3(x)
            s->hb[i] = val;
        }
        matmul(s->xb, s->hb, w->w2 + l*dim*hidden_dim, hidden_dim, dim);
        for (int i = 0; i < dim; i++) x[i] += s->xb[i];     // 残差
```

逐块：

- **`ffn rmsnorm`**：又一次归一化（注意力后、FFN 前），`x → xb`。残差流主干 `x` 依旧不动。
- **两路升维** `w1(x)` 和 `w3(x)`：两个 `matmul` 都把 `dim` 升到 `hidden_dim`，结果分别落在 `hb` 和 `hb2`。注意——**两个矩阵都升维**，这和 GPT 不一样。
- **SwiGLU 非线性**：那个 `for` 循环对每个元素做 `silu(hb[i]) * hb2[i]`。`silu(x) = x·sigmoid(x)`，代码里 `val *= 1/(1+exp(-val))` 就是乘上 sigmoid；再 `val *= hb2[i]` 逐元素乘上 `w3` 那一路。
- **降维** `w2(hb)`：从 `hidden_dim` 压回 `dim`，落 `xb`。
- **残差**：`x[i] += xb[i]`，FFN 这一笔修正也加回主干。

<div class="l2-why"><strong>SwiGLU vs GPT 的 MLP</strong>：GPT 的 FFN 是单路——<code>c_fc</code> 升维 → GELU → <code>c_proj</code> 降维，<strong>两个矩阵</strong>。Llama 用<strong>两路 + 门控</strong>：<code>w1</code> 那路过 silu 当"内容"，<code>w3</code> 那路当"门"（逐元素相乘，控制让多少信息通过），再 <code>w2</code> 降回，<strong>三个矩阵</strong>。门控让网络能动态地"开关"通道，表达力更强，是现代 LLM（Llama、PaLM）的标配。这就是第 00 讲说的"FFN 多一个 <code>w3</code>"的由来。</div>

## forward 收尾：final norm + classifier <span class="l2-b l2-key">重点</span>

```c
    rmsnorm(x, x, w->rms_final_weight, dim);                // 最后 rmsnorm
    matmul(s->logits, x, w->wcls, p->dim, p->vocab_size);  // classifier -> logits
    return s->logits;
```

所有层跑完后：最后一次 `rmsnorm`（注意这里是**原地** `x→x`），然后用分类头 `wcls`（`dim → vocab_size`）做一个 `matmul`，得到 `logits`——长度 `vocab_size`，`logits[v]` 是"下一个 token 是词 `v`"的原始打分。返回 `s->logits`。

<div class="l2-note"><strong>注意</strong>：<code>forward</code> 返回的是 <strong>logits（未归一化的打分）</strong>，不是概率。把它变成概率（softmax）、再据此采样选出下一个 token，是第 05 讲 <code>sampler</code> 的活。<code>forward</code> 只负责"算出每个词的分"。</div>

至此，`forward` 全部讲完——一个 token 进去，经过 N 层（注意力 + FFN，各带 RMSNorm 和残差），最后投影成词表上的打分出来。

## tokenizer：文本 ↔ token 的互译 <span class="l2-b l2-core">必读</span>

模型只认 token id（整数），不认字符串。所以推理前要把文本 `encode` 成 id，生成后要把 id `decode` 回文本。

### decode：token id → 字符串片段

```c
char* decode(Tokenizer* t, int prev_token, int token) {
    char *piece = t->vocab[token];
    if (prev_token == 1 && piece[0] == ' ') { piece++; } // BOS 后去掉前导空格
    unsigned char byte_val;
    if (sscanf(piece, "<0x%02hhX>", &byte_val) == 1) {   // 形如 <0x01> 的原始字节
        piece = (char*)t->byte_pieces + byte_val * 2;
    }
    return piece;
}
```

- `piece = t->vocab[token]`：查词表，拿这个 token 对应的字符串片段。
- BOS（id=1）之后，SentencePiece 习惯去掉前导空格（`piece++` 跳过那个空格字符）。
- 有些 token 表示的是**原始字节**，长得像 `<0x01>`。`sscanf` 把这个十六进制解析成字节值，再从 `byte_pieces` 取出真正的那个字节返回——这样任何字节都能被表示，不会有"打不出来的字符"。

### encode：文本 → token id（BPE 思路）

<div class="l2-why"><strong>BPE（字节对编码）怎么分词</strong>：<code>encode</code> 代码较长，这里讲思路。① 先把文本按 UTF-8 拆成<strong>最小单位</strong>（单字节 / 单字符）的 token 序列；② 然后<strong>贪心地反复合并</strong>：每一轮，在所有相邻 token 对里，找一对"合并起来在词表里存在、且合并 score 最高"的，把它俩合成一个 token；不断重复，直到再没有可合并的相邻对。词表里每个 token 都带一个 <code>score</code>，合并优先级就靠它。SentencePiece 风格还会在最前面加一个 dummy 空格前缀。</div>

<div class="l2-note"><strong>关键认知</strong>：所谓"分词"不是按空格切，而是<strong>数据驱动地把高频字符组合并成子词</strong>——常见词一个 token，生僻词拆成几个子词，未知字符回退到原始字节。这套机制让一个几万大小的词表既能覆盖任意文本、又不至于把序列拉得太长。</div>

## 速查卡 <span class="l2-b l2-core">必读</span>

<div class="l2-card"><strong>FFN + tokenizer 速记</strong><br/>• <strong>SwiGLU FFN</strong>：<code>w2( silu(w1·x) * (w3·x) )</code>——两路升维（w1 内容 / w3 门控）逐元素乘，再降维；三个矩阵 vs GPT 的两个。<br/>• forward 收尾：final rmsnorm → wcls classifier → <strong>logits</strong>（打分，非概率）。<br/>• <strong>decode</strong>：查 vocab；处理 BOS 前导空格、<code>&lt;0x..&gt;</code> 原始字节。<br/>• <strong>encode/BPE</strong>：先拆最小单位，再按 score 贪心合并相邻对，直到无可合并——数据驱动的子词分词。</div>

## 自测 <span class="l2-b l2-skim">可跳读</span>

<details class="l2-fold"><summary>3 题检验 <span class="l2-b l2-skim">可跳读</span></summary>

**Q1.** Llama 的 FFN 为什么需要三个矩阵 `w1/w2/w3`，而 GPT 的 MLP 只要两个？`w3` 那一路起什么作用？

**Q2.** `forward` 最后返回的 `logits` 是概率吗？要得到"下一个 token"还差哪一步？

**Q3.** BPE 分词和"按空格/标点切词"有什么本质不同？生僻词、未知字符怎么处理？

---

**A1.** 因为 SwiGLU 是门控结构：`w1` 那路过 silu 当"内容"，`w3` 那路当"门"，两者逐元素相乘后再用 `w2` 降维。门控让网络能动态控制每个通道让多少信息通过，比 GPT 单路 GELU 的表达力更强，所以多一个 `w3`。

**A2.** 不是，`logits` 是未归一化的打分。要选下一个 token，还需要（可选地按温度缩放后）softmax 成概率，再采样——这是第 05 讲的事。

**A3.** BPE 不按语言规则切，而是数据驱动地把高频字符组合并成子词：常见词→一个 token，生僻词→几个子词，未知字符→回退到原始字节 token。所以它能覆盖任意文本、对任何语言通用，且词表大小可控。

</details>

## 小结与下一讲预告

`forward` 到此全部讲完：注意力（03）+ SwiGLU FFN + classifier（本讲），一个 token 进、一排 logits 出。tokenizer 也打通了文本和 token 的双向翻译。

下一讲（05，终）把它们串起来：**sampler**（怎么从 logits 里挑下一个 token——argmax / 温度 / top-p 核采样）+ **generate 主循环**（encode prompt → 反复 forward + sample → decode 打印），让模型真正"开口说话"。并为整条"玩具 AI 源码"线做收尾。
