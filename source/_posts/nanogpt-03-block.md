---
title: "《nanoGPT 源码逐行》第03讲 · 一个 Transformer Block：残差、Pre-LN、MLP"
date: 2026-06-29 10:04:00
tags: [AI, 深度学习, GPT, Transformer, nanoGPT, 源码解析, 课程]
categories: [技术笔记]
toc: true
visibility: public
---

<style>
.ng-b{display:inline-block;font-size:12px;font-weight:700;padding:1px 8px;border-radius:999px;vertical-align:middle;margin-left:6px;line-height:1.7;white-space:nowrap}
.ng-core{color:#fff;background:#b73a2c}
.ng-key{color:#b73a2c;background:rgba(183,58,44,.1);border:1px solid rgba(183,58,44,.3)}
.ng-skim{color:#3f5d7e;background:rgba(63,93,126,.1);border:1px solid rgba(63,93,126,.25)}
.ng-note{margin:14px 0;padding:12px 16px;border-left:3px solid #3f5d7e;background:rgba(63,93,126,.06);border-radius:0 4px 4px 0}
.ng-why{margin:14px 0;padding:12px 16px;border-left:3px solid #69727d;background:rgba(105,114,125,.07);border-radius:0 4px 4px 0;color:#3a4049}
.ng-key-note{margin:14px 0;padding:12px 16px;border-left:3px solid #b73a2c;background:rgba(183,58,44,.06);border-radius:0 4px 4px 0}
.ng-fold{margin:14px 0;border:1px solid rgba(29,33,39,.14);border-radius:6px;background:#fafafa;padding:0 16px}
.ng-fold>summary{cursor:pointer;padding:12px 0;font-weight:700;color:#1d2127}
.ng-fold[open]{padding-bottom:8px}
.ng-card{margin:16px 0;padding:14px 18px;border:1px solid rgba(183,58,44,.25);border-radius:8px;background:rgba(183,58,44,.03)}
html[data-user-color-scheme="dark"] .ng-note{background:rgba(126,168,224,.1);border-left-color:#7ea8e0;color:#c9cdd4}
html[data-user-color-scheme="dark"] .ng-why{background:rgba(255,255,255,.04);border-left-color:#8b93a0;color:#aeb4be}
html[data-user-color-scheme="dark"] .ng-key-note{background:rgba(224,108,92,.12);border-left-color:#e0746b;color:#d6dae0}
html[data-user-color-scheme="dark"] .ng-fold{background:rgba(255,255,255,.03);border-color:rgba(255,255,255,.14)}
html[data-user-color-scheme="dark"] .ng-fold>summary{color:#e6e8ec}
html[data-user-color-scheme="dark"] .ng-card{background:rgba(224,108,92,.08);border-color:rgba(224,108,92,.3);color:#d6dae0}
html[data-user-color-scheme="dark"] .ng-key{color:#ef9a8e;background:rgba(224,108,92,.14);border-color:rgba(224,108,92,.4)}
html[data-user-color-scheme="dark"] .ng-skim{color:#9fc1ec;background:rgba(126,168,224,.14);border-color:rgba(126,168,224,.35)}
</style>

## 本讲定位

<div class="ng-key-note"><strong>一句话</strong>：第 01 讲我们看到 GPT 就是堆 N 个 Block，第 02 讲拆了 Block 里的注意力。这一讲把一个<strong>完整的 Block</strong> 讲透——它由 <code>LayerNorm</code>、<code>MLP</code>、<strong>残差连接</strong>拼成。读完你会明白：一个 Block = "注意力混合 token 间信息" + "MLP 逐 token 加工"，各带归一化和残差；而 GPT 不过是把这个结构叠 N 遍。</div>

## LayerNorm：稳住每个 token 的向量 <span class="ng-b ng-key">重点</span>

```python
class LayerNorm(nn.Module):
    """ LayerNorm but with an optional bias. PyTorch doesn't support simply bias=False """
    def __init__(self, ndim, bias):
        super().__init__()
        self.weight = nn.Parameter(torch.ones(ndim))
        self.bias = nn.Parameter(torch.zeros(ndim)) if bias else None
    def forward(self, input):
        return F.layer_norm(input, self.weight.shape, self.weight, self.bias, 1e-5)
```

LayerNorm 对**每个 token 的 C 维向量**做归一化：减去均值、除以标准差，把它拉成均值 0、方差 1，再用可学习的 `weight`（缩放）和 `bias`（平移）调整回来。`1e-5` 是防止除零的小 epsilon。`weight` 初始化为全 1、`bias` 为全 0——所以一开始它近似"恒等变换"，训练中再慢慢学出该怎么缩放平移。

<div class="ng-why"><strong>为什么自己写而不用 <code>nn.LayerNorm</code></strong>：注释点明了——PyTorch 的 <code>nn.LayerNorm</code> 不支持简单地 <code>bias=False</code>。nanoGPT 想要"可选 bias"（GPT-2 带 bias，去掉则略快略好），所以薄薄包一层，把 bias 做成可选。</div>

<div class="ng-note"><strong>是 Layer Norm，不是 Batch Norm</strong>：它在<strong>特征维</strong>（每个 token 自己的 C 维）上归一化，每个 token 独立处理，不跨 batch、不跨序列。所以它对 batch 大小和序列长度都不敏感，特别适合变长文本。</div>

## MLP：逐 token 的前馈加工 <span class="ng-b ng-key">重点</span>

```python
class MLP(nn.Module):
    def __init__(self, config):
        super().__init__()
        self.c_fc    = nn.Linear(config.n_embd, 4 * config.n_embd, bias=config.bias)
        self.gelu    = nn.GELU()
        self.c_proj  = nn.Linear(4 * config.n_embd, config.n_embd, bias=config.bias)
        self.dropout = nn.Dropout(config.dropout)
    def forward(self, x):
        x = self.c_fc(x)
        x = self.gelu(x)
        x = self.c_proj(x)
        x = self.dropout(x)
        return x
```

三步走：`c_fc` 把维度从 `C` 升到 `4C`、`GELU` 做非线性激活、`c_proj` 再从 `4C` 压回 `C`。"先放大再压缩"的 4 倍中间层是 Transformer 的惯例。

<div class="ng-why"><strong>注意力 vs MLP 的分工</strong>：注意力负责"token 之间交换信息"（横向，跨位置）；MLP 负责"对每个 token 自己的向量做非线性加工"（纵向，逐位置）。MLP 是<strong>逐位置独立</strong>作用的——同一个 MLP 套在每个 token 上，彼此不通信。4 倍宽的中间层给它足够的表达容量去"消化"注意力刚混进来的信息。<code>GELU</code> 是比 ReLU 更平滑的激活，GPT 系列标配。</div>

## Block：把它们拼成一层 <span class="ng-b ng-core">必读</span>

```python
class Block(nn.Module):
    def __init__(self, config):
        super().__init__()
        self.ln_1 = LayerNorm(config.n_embd, bias=config.bias)
        self.attn = CausalSelfAttention(config)
        self.ln_2 = LayerNorm(config.n_embd, bias=config.bias)
        self.mlp = MLP(config)
    def forward(self, x):
        x = x + self.attn(self.ln_1(x))
        x = x + self.mlp(self.ln_2(x))
        return x
```

`forward` 这两行，是整个 Transformer 的精华，值得逐字咀嚼：

- `x = x + self.attn(self.ln_1(x))`：先对 `x` 做 LayerNorm，再过注意力，**结果加回 `x`**。
- `x = x + self.mlp(self.ln_2(x))`：先 LayerNorm，再过 MLP，**结果加回 `x`**。

里面藏着两个关键设计：

<div class="ng-key-note"><strong>① 残差连接（residual）</strong>：盯住那个 <code>x +</code>。每个子层不是<strong>替换</strong> <code>x</code>，而是在 <code>x</code> 上"加一笔修正"。好处有二——(a) 梯度有一条<strong>直通路</strong>：<code>x</code> 直接往后传，反向传播时梯度不会层层衰减，于是几十上百层也训得动（这是 ResNet 带来的革命）；(b) 每个子层只需学习"增量"，比从头学一个完整变换容易得多。</div>

<div class="ng-why"><strong>② Pre-LN（前置归一化）</strong>：LayerNorm 放在子层<strong>之前</strong>（<code>ln_1</code> 在 <code>attn</code> 前、<code>ln_2</code> 在 <code>mlp</code> 前），而不是之后。原始 Transformer 论文是 Post-LN（子层后归一化），但 Pre-LN 训练更稳定（尤其深层、大学习率），已成为现代 GPT 的标准。形状上，<code>x</code> 进出都是 <code>(B, T, C)</code>，所以这种 Block 能<strong>无限堆叠</strong>。</div>

## 一个 Block 在干嘛：一句话收束 <span class="ng-b ng-key">重点</span>

<div class="ng-note"><strong>一个 Block</strong> = 注意力（让每个 token 看历史、<strong>混合 token 之间</strong>的信息）+ MLP（对每个 token 的向量<strong>逐个做非线性加工</strong>），两步各自"先归一化、再残差相加"。GPT 就是把这样的 Block 叠 <code>n_layer</code> 遍（第 01 讲的 <code>h = ModuleList</code>）。token 的信息在这一叠一叠中被反复"交换 + 加工"，最后每个位置的向量就富含了预测下一个词所需的上下文。</div>

## 速查卡 <span class="ng-b ng-core">必读</span>

<div class="ng-card"><strong>Block 速记</strong>（形状全程 <code>(B, T, C)</code>）<br/>• <strong>LayerNorm</strong>：对每个 token 的 C 维向量归一化（均值 0 方差 1）+ 可学习缩放/平移；逐 token，不跨 batch/序列。<br/>• <strong>MLP</strong>：<code>C → 4C → GELU → C</code>，逐 token 的非线性加工（注意力混信息，MLP 加工信息）。<br/>• <strong>Block</strong>：<code>x = x + attn(ln_1(x))</code>；<code>x = x + mlp(ln_2(x))</code>。<br/>• 两大设计：<strong>残差</strong>（梯度直通、深层可训）+ <strong>Pre-LN</strong>（先归一化更稳）。GPT = 叠 N 个 Block。</div>

## 自测 <span class="ng-b ng-skim">可跳读</span>

<details class="ng-fold"><summary>3 题检验 <span class="ng-b ng-skim">可跳读</span></summary>

**Q1.** 注意力和 MLP 在一个 Block 里分工有何不同？哪个跨 token、哪个逐 token？

**Q2.** `x = x + self.attn(self.ln_1(x))` 里那个 `x +` 解决了什么问题？为什么深层网络离不开它？

**Q3.** Pre-LN 和 Post-LN 的区别是什么？nanoGPT 用哪个、为什么？

---

**A1.** 注意力跨 token（横向交换信息，每个 token 看历史）；MLP 逐 token（纵向加工，同一个 MLP 独立作用在每个 token 的向量上，彼此不通信）。

**A2.** 残差连接。它给梯度一条直通路，反传时梯度不随深度衰减，于是几十上百层也能训练；同时子层只需学增量，更易优化。没有它，深层 Transformer 几乎训不动。

**A3.** Pre-LN 把 LayerNorm 放在子层之前，Post-LN 放在之后。nanoGPT 用 Pre-LN，因为它训练更稳定（尤其深层、大学习率），是现代 GPT 的标准做法。

</details>

## 小结与下一讲预告

到这里，model.py 的"模型结构"部分全讲完了：嵌入（01）→ 注意力（02）→ Block（03）。你已经能在脑子里把一次前向从 token id 跑到 logits 完整走一遍。

但模型现在还是"生的"——权重是随机初始化的，它什么都不会。下一讲（04）进 `train.py`，看怎么用数据把它**训**出来：从磁盘读 token、前向算 loss、`loss.backward()` 求梯度、AdamW 更新参数，外加学习率调度、梯度累积这些工业护具。你会发现，它的内核就是 micrograd 第 04 讲那个训练循环的放大版。
