---
title: "《nanoGPT 源码逐行》第02讲 · 自注意力：CausalSelfAttention（GPT 的心脏）"
date: 2026-06-29 10:03:00
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

## 本讲定位 <span class="ng-b ng-core">必读</span>

<div class="ng-key-note"><strong>最关键</strong>：这一讲只讲一个类 <code>CausalSelfAttention</code>——它是 GPT 真正"读上下文"的地方，整张网络其余部分（embedding、MLP、残差、LayerNorm）都在为它服务。读完你要能一句话复述：注意力 = 每个 token 用自己的 <em>query</em> 去和所有"历史 token"的 <em>key</em> 打分，再按分数加权汇总它们的 <em>value</em>。</div>

上一季《micrograd 源码逐行》里我们手写了 autograd——一个标量级的反向传播种子。nanoGPT 不再手写求导，而是**站在 PyTorch 的 autograd 之上**：本讲所有的 `@`（矩阵乘）、`softmax`、`view` 都会被 PyTorch 自动记录计算图、自动求导，我们只负责把**前向**写对。所以这一讲的全部功夫，就是把"前向每一步在做什么、张量形状怎么变"看透。

先约定贯穿全课的形状记号：

| 记号 | 含义 | 默认值 |
|---|---|---|
| `B` | batch size，一批几条序列 | — |
| `T` | 序列长度（token 数，必须 ≤ `block_size`） | ≤ 1024 |
| `C` | `n_embd`，每个 token 的向量维度 | 768 |
| `nh` | `n_head`，注意力头数 | 12 |
| `hs` | head size = `C // nh` | 64 |

永远成立的一条等式：`nh * hs == C`（12 × 64 = 768）。后面所有 reshape 都靠它。

---

## 先安顿一下：LayerNorm 与注意力的位置 <span class="ng-b ng-skim">可跳读</span>

注意力不是裸跑的，它被夹在一个 `Block` 里。先看 `LayerNorm` 和 `Block.forward`，只为搞清"attention 拿到的 `x` 长什么样、输出又要还回什么形状"：

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

<div class="ng-note"><strong>关键</strong>：LayerNorm 对每个 token 的 C 维向量单独做"零均值、单位方差"归一化，再用可学习的 <code>weight</code> 缩放、<code>bias</code> 平移；这个自定义版只是给 PyTorch 原生 LayerNorm 补了个"可以关掉 bias"的开关（<code>nn.LayerNorm</code> 不好直接设 bias=False）。</div>

```python
    def forward(self, x):
        x = x + self.attn(self.ln_1(x))
        x = x + self.mlp(self.ln_2(x))
        return x
```

这是 `Block.forward`。看清两件事就够了：① 进 attention 前先过 `ln_1`（**pre-norm**，先归一化再算）；② 结果用 `x = x + ...` **加回残差流**。残差相加要求 `attn(...)` 的输出形状和 `x` **完全一致**——记住这点，它决定了 attention 末尾为什么要把形状还原成 `(B, T, C)`。Block / MLP / 残差的细节留到下一讲，本讲只认一件事：**attention 拿到的 `x` 是 `(B, T, C)`，吐出来也得是 `(B, T, C)`**。

---

## CausalSelfAttention.__init__：先备好零件 <span class="ng-b ng-key">重点</span>

```python
class CausalSelfAttention(nn.Module):
    def __init__(self, config):
        super().__init__()
        assert config.n_embd % config.n_head == 0
        # key, query, value projections for all heads, but in a batch
        self.c_attn = nn.Linear(config.n_embd, 3 * config.n_embd, bias=config.bias)
        # output projection
        self.c_proj = nn.Linear(config.n_embd, config.n_embd, bias=config.bias)
        self.attn_dropout = nn.Dropout(config.dropout)
        self.resid_dropout = nn.Dropout(config.dropout)
        self.n_head = config.n_head
        self.n_embd = config.n_embd
        self.dropout = config.dropout
        # flash attention only in PyTorch >= 2.0
        self.flash = hasattr(torch.nn.functional, 'scaled_dot_product_attention')
        if not self.flash:
            self.register_buffer("bias", torch.tril(torch.ones(config.block_size, config.block_size))
                                        .view(1, 1, config.block_size, config.block_size))
```

逐个零件看：

- `assert config.n_embd % config.n_head == 0`：C 必须能被 `n_head` 整除，否则没法把它平均切成 `nh` 个头。
- `self.c_attn = nn.Linear(n_embd, 3 * n_embd)`：**一个** Linear，输出维度 `3 * n_embd`。它把 Q、K、V 三套投影**合并成一次矩阵乘**，前向时再切成三份。
- `self.c_proj = nn.Linear(n_embd, n_embd)`：输出投影，C→C，把多头拼接后的结果再混合一次。
- `attn_dropout` / `resid_dropout`：两个 dropout，分别作用在**注意力权重**和**最终输出**上（默认 `dropout=0`，预训练时常关）。
- `self.flash = hasattr(...)`：探测当前 PyTorch 有没有 `scaled_dot_product_attention` 这个融合算子（PyTorch ≥ 2.0 才有）。有就走 flash 快路径。
- `register_buffer("bias", torch.tril(...))`：只有**没有** flash 时才注册这个因果 mask。`torch.tril(torch.ones(block_size, block_size))` 是一个**下三角全 1**矩阵，`.view(1, 1, block_size, block_size)` 整成 4 维，方便后面广播到 `(B, nh, T, T)`。

<div class="ng-why"><strong>为什么</strong> c_attn 要把 Q/K/V 合成一个 Linear：三次小矩阵乘合并成一次大矩阵乘，GPU 上吞吐更高、kernel 启动更少——数学上和分开写三个 Linear 等价，纯粹是工程上的"批处理"优化。</div>

<div class="ng-note"><strong>关键</strong>：这个 buffer 取名 <code>bias</code> 极易误解——它<strong>不是</strong>线性层的偏置，而是因果 mask（下三角矩阵）。<code>register_buffer</code> 表示它属于模块状态（会随 <code>.to(device)</code> 一起搬、会进 <code>state_dict</code>），但<strong>不是参数、不求梯度</strong>。</div>

---

## CausalSelfAttention.forward：注意力的全过程 <span class="ng-b ng-core">必读</span>

这是全课最该看透的一段。我们把 `forward` 拆成五小段，每段都标住 shape。

### ① 一次投影，切出 Q、K、V

```python
    def forward(self, x):
        B, T, C = x.size() # batch, sequence length, embedding dim (n_embd)
        # q,k,v for all heads in batch; move head forward to be the batch dim
        q, k, v  = self.c_attn(x).split(self.n_embd, dim=2)
```

- `x`：`(B, T, C)`。
- `self.c_attn(x)`：Linear 把最后一维 C 投到 3C → `(B, T, 3C)`。
- `.split(self.n_embd, dim=2)`：沿最后一维（3C）按每块 `n_embd = C` 切，得到 **3 块**，各 `(B, T, C)`，分别赋给 `q, k, v`。

到这里，序列里**每个 token 都拿到了三个 C 维向量**。它们的含义是理解注意力的钥匙：

<div class="ng-key-note"><strong>最关键</strong>：把注意力想成一次"软字典检索"——<strong>query（q）</strong>= 我在找什么；<strong>key（k）</strong>= 我是什么、我的标签；<strong>value（v）</strong>= 如果你选中我，我能给你的内容。每个 token 的 q 去和所有 token 的 k 比相似度，相似度当权重，对它们的 v 取加权平均。这就是注意力的全部。</div>

<div class="ng-note"><strong>关键</strong>：这叫 <em>self</em>-attention，因为 q、k、v 全部来自<strong>同一个序列</strong> <code>x</code>（区别于翻译模型里 q 来自一句、k/v 来自另一句的 cross-attention）。</div>

### ② 切成多头：把 C 维分给 nh 个头

```python
        k = k.view(B, T, self.n_head, C // self.n_head).transpose(1, 2) # (B, nh, T, hs)
        q = q.view(B, T, self.n_head, C // self.n_head).transpose(1, 2) # (B, nh, T, hs)
        v = v.view(B, T, self.n_head, C // self.n_head).transpose(1, 2) # (B, nh, T, hs)
```

每行两步，三套向量同样处理：

- `.view(B, T, nh, hs)`：把 `(B, T, C)` 的最后一维 C **拆成 `nh × hs`**（`C // n_head` 就是 `hs`），得到 `(B, T, nh, hs)`。这一步**不动数据**，只是重新解读内存：每个 token 那条 768 维向量，被切成 12 段、每段 64 维，分给 12 个头。
- `.transpose(1, 2)`：交换 `T` 轴和 `nh` 轴 → `(B, nh, T, hs)`。把"头"提到前面，当作类似 batch 的维度。

<div class="ng-why"><strong>为什么</strong> 要 transpose 把头提前：提前到第 2 维后，后面 <code>q @ k^T</code> 这种矩阵乘只作用在最后两维 <code>(T, hs)</code> 上，<code>(B, nh)</code> 被当成"批"自动并行——于是 <strong>每个头在自己的 64 维子空间里各算各的注意力</strong>，互不干扰。</div>

<div class="ng-note"><strong>关键</strong>：所谓"多头"，就是把 C 维切成 <code>nh</code> 份，每份独立做一套注意力。不同的头能学到不同关系（有的盯语法、有的盯指代、有的盯就近词……），最后再拼回来——比单头一锅烩表达力强。</div>

### ③ 注意力本体：两条路，重点拆手动那条

```python
        if self.flash:
            y = torch.nn.functional.scaled_dot_product_attention(q, k, v, attn_mask=None, dropout_p=self.dropout if self.training else 0, is_causal=True)
```

flash 分支只有一行：`scaled_dot_product_attention` 把"缩放点积 + 因果 mask + softmax + dropout + 加权 value"**全部融合进一个高效 kernel**，中途不显式生成 `(T, T)` 那张大矩阵，省显存又快。`is_causal=True` 让它内部自动加下三角 mask（所以这条路用不到那个 `bias` buffer）；`dropout_p=... if self.training else 0` 表示**只在训练时** dropout。输出 `y`：`(B, nh, T, hs)`。

为了把原理讲透，我们重点拆 `else` 这条手动分支——**flash 只是把下面这五步压成一个算子，数学上完全等价**：

```python
        else:
            att = (q @ k.transpose(-2, -1)) * (1.0 / math.sqrt(k.size(-1)))
            att = att.masked_fill(self.bias[:,:,:T,:T] == 0, float('-inf'))
            att = F.softmax(att, dim=-1)
            att = self.attn_dropout(att)
            y = att @ v # (B, nh, T, T) x (B, nh, T, hs) -> (B, nh, T, hs)
```

**第 1 步 · 打分（缩放点积）**：`att = (q @ k.transpose(-2, -1)) * (1.0 / math.sqrt(k.size(-1)))`

- `k.transpose(-2, -1)`：`(B, nh, T, hs)` → `(B, nh, hs, T)`。
- `q @ k^T`：`(B, nh, T, hs) @ (B, nh, hs, T)` → `(B, nh, T, T)`。这张 `T×T` 的方阵里，`att[b, h, i, j]` = 第 `i` 个 token 的 query 和第 `j` 个 token 的 key 的**点积**，也就是"token i 对 token j 的原始注意力分数"。
- `* (1.0 / math.sqrt(k.size(-1)))`：`k.size(-1) = hs = 64`，开方得 8，给每个分数除以 8。

<div class="ng-why"><strong>为什么</strong> 要除以 √hs：q、k 各维近似独立、方差约 1，点积是 hs 个乘积之和，方差随 hs 线性增长（≈ hs）。hs 越大、点积绝对值越大，<code>softmax</code> 会被推进<strong>饱和区</strong>（某个值≈1、其余≈0），梯度趋近 0 就学不动了。除以 √hs 把方差拉回约 1，让 softmax 待在"软"的健康区间。这一招出自《Attention is All You Need》。</div>

**第 2 步 · 戴上因果面具**：`att = att.masked_fill(self.bias[:,:,:T,:T] == 0, float('-inf'))`

- `self.bias[:,:,:T,:T]`：取下三角 mask 的前 `T×T` 子块，`(1, 1, T, T)`，广播到 `(B, nh, T, T)`。
- 下三角的含义：`bias[i, j] = 1` 当 `j ≤ i`，`= 0` 当 `j > i`。
- `masked_fill(... == 0, -inf)`：凡是 `bias == 0`（即 `j > i`，"未来"位置）的分数，统统填成 `-inf`。

<div class="ng-key-note"><strong>最关键</strong>：这就是名字里的 <strong>Causal</strong>（因果）——生成第 t 个 token 时，它只能看见 ≤ t 的内容，绝不许偷看未来。下面紧跟 softmax，<code>exp(-inf) = 0</code>，所以未来位置的权重<strong>恰好为 0</strong>。这也是 GPT 能"自回归"逐字生成、且训练时一次并行算完所有位置的根本原因。</div>

`T = 4` 时这张 mask 长这样（`i` 是 query 行、`j` 是 key 列）：

```text
        k0  k1  k2  k3      (key 位置 j →)
q0       1   .   .   .
q1       1   1   .   .
q2       1   1   1   .
q3       1   1   1   1
(query 位置 i ↓)    1 = 可见     . = 被填 -inf
```

**第 3 步 · 归一化成权重**：`att = F.softmax(att, dim=-1)`

沿**最后一维**（key 维 `j`）做 softmax，把每个 query 那一行的分数变成"和为 1"的权重。形状仍是 `(B, nh, T, T)`。

<div class="ng-note"><strong>关键</strong>：<code>dim=-1</code> 不能错——它是对"某个 query 看所有 key"的那<strong>一行</strong>归一化，让每个 token 的注意力权重加起来等于 1。换成别的维就彻底变味了。</div>

**第 4 步 · dropout**：`att = self.attn_dropout(att)`

训练时随机丢弃一部分注意力权重做正则，形状不变 `(B, nh, T, T)`（默认 dropout=0 时是恒等）。

**第 5 步 · 加权聚合 value**：`y = att @ v`

- `att`：`(B, nh, T, T)`，`v`：`(B, nh, T, hs)`，矩阵乘 → `y`：`(B, nh, T, hs)`。
- 写成求和就一目了然：`y[b, h, i] = Σ_j att[b, h, i, j] · v[b, h, j]`——第 `i` 个 token 的输出 = 按注意力权重，对所有**可见的** token 的 value 做加权求和。"读历史、聚合信息"就发生在这一行。

### ④ 合并多头，投影回残差流

```python
        y = y.transpose(1, 2).contiguous().view(B, T, C) # re-assemble all head outputs side by side
        y = self.resid_dropout(self.c_proj(y))
        return y
```

- `y.transpose(1, 2)`：`(B, nh, T, hs)` → `(B, T, nh, hs)`，把"头"维换回到中间。
- `.contiguous()`：transpose 只改了 stride（返回一个**视图**，底层内存没动、不连续），而 `.view` 要求内存连续，所以先 `contiguous()` 把数据真正重排成连续布局。
- `.view(B, T, C)`：把 `nh、hs` 两维合并回 `C`（`nh * hs = C`）——等于把每个 token 的 12 个头、各 64 维的输出**并排拼接**成一条 768 维向量。
- `self.c_proj(y)`：Linear C→C，把拼接后的多头结果**再线性混合一次**（让各头之间的信息交流融合），输出 `(B, T, C)`。
- `self.resid_dropout(...)`：输出 dropout。
- `return y`：`(B, T, C)`——**和输入 `x` 形状完全一致**。

<div class="ng-why"><strong>为什么</strong> 必须 contiguous()：<code>transpose</code> / <code>permute</code> 返回的是"换了 stride 的视图"，不复制数据；而 <code>view</code> 不能跨非连续内存重排元素，所以得先 <code>contiguous()</code> 把数据复制成连续布局（等价写法：直接用 <code>reshape</code>，它会在需要时自动复制）。</div>

<div class="ng-note"><strong>关键</strong>：输出形状回到 <code>(B, T, C)</code> 不是巧合——Block 里要做 <code>x = x + self.attn(self.ln_1(x))</code>，<strong>残差相加要求两边形状一致</strong>。注意力的"分头→算→合并"绕了一圈，本质就是为了在不改变接口形状的前提下，让 token 之间交换一次信息。</div>

---

## 关键点：一张表跟住整条数据流 <span class="ng-b ng-key">重点</span>

| 步骤 | 操作 | 输出 shape |
|---|---|---|
| 输入 | `x` | `(B, T, C)` |
| 投影 | `c_attn(x)` | `(B, T, 3C)` |
| 拆分 | `split` → `q, k, v` | 各 `(B, T, C)` |
| 分头 | `view` + `transpose(1,2)` | 各 `(B, nh, T, hs)` |
| 打分 | `q @ kᵀ × (1/√hs)` | `(B, nh, T, T)` |
| 掩码 | `masked_fill(... == 0, -inf)` | `(B, nh, T, T)` |
| 归一 | `softmax(dim=-1)` | `(B, nh, T, T)` |
| 聚合 | `att @ v` | `(B, nh, T, hs)` |
| 合并 | `transpose(1,2)` + `view` | `(B, T, C)` |
| 输出 | `c_proj` | `(B, T, C)` |

再把"为什么这么写"浓缩成几条：

- **一个 `c_attn` 同时投 Q/K/V**：合并矩阵乘，工程提速，数学等价。
- **多头 = 切 C 维 + transpose 把头变 batch 维**：各头在子空间里并行、学不同关系。
- **缩放点积除 √hs**：稳住方差，防 softmax 饱和、梯度消失。
- **下三角 mask 填 -inf**：实现因果，位置 `t` 只能看 ≤ `t`。
- **softmax `dim=-1`**：在 key 维归一，每个 query 的权重和为 1。
- **`att @ v`**：注意力的"加权聚合"那一下，唯一让 token 间交换信息的地方。
- **合并 + `c_proj`，形状 `(B, T, C)` 不变**：好接回残差流。

---

<details class="ng-fold"><summary>自测：三道题验收本讲 <span class="ng-b ng-skim">可跳读</span></summary>

**Q1.** `att = q @ k^T` 之后为什么要乘 `1/√hs`？如果不除会怎样？

**Q2.** `self.bias[:,:,:T,:T] == 0` 选出的是哪些位置？为什么填 `-inf` 而不是填 `0`？

**Q3.** `y.transpose(1, 2)` 之后，为什么必须 `.contiguous()` 才能 `.view(B, T, C)`？

---

**A1.** `q`、`k` 各维近似独立、方差约 1，它们的点积是 `hs` 个乘积之和，方差随 `hs` 增大而增大（≈ `hs`）。`hs` 大则分数绝对值大，softmax 被推进饱和区（输出近似 one-hot），梯度趋近 0、训练困难。除以 `√hs` 把方差拉回约 1，softmax 工作在"软"的健康区间。不除：训练初期注意力几乎硬选一个 token，梯度极小，很难学起来。

**A2.** 选出的是 `j > i` 的"未来"位置（下三角 mask 中为 0 的那块严格上三角）。填 `-inf` 是因为紧接着就是 softmax：`exp(-inf) = 0`，这些位置的权重**恰好为 0**，等于看不见未来。若改填 `0`，softmax 后 `exp(0) = 1` 仍是非零权重，模型就"偷看"到了未来 token——因果性被破坏。

**A3.** `transpose` 返回的是改了 stride 的**视图**，底层内存并未按新顺序重排、不连续；而 `view` 只是换一种方式解读同一块连续内存，无法跨非连续布局重组元素。所以要先 `contiguous()` 把数据真正复制成连续布局，`view` 才能合法地把 `(nh, hs)` 合并成 `C`。（也可以直接用 `reshape`，它会在必要时自动帮你复制。）

</details>

---

## 小结 / 下一讲预告

<div class="ng-card"><strong>一句话记住本讲</strong>：CausalSelfAttention 让每个 token 用 query 去和所有历史 token 的 key 打分、softmax 成权重、再加权聚合它们的 value——下三角 mask 保证只看过去，多头让它在多个子空间并行地学不同关系。这是整张网络里<strong>唯一让 token 之间交换信息</strong>的模块（后面的 MLP 是逐 token 独立的）。</div>

**下一讲（第 03 讲）· Block 与 MLP：把注意力堆成深网络**。我们会讲透 `Block.forward` 里那两行 `x = x + self.attn(self.ln_1(x))` / `x = x + self.mlp(self.ln_2(x))`——为什么是 **pre-norm + 残差**、`MLP` 里 `4 * n_embd` 那个"先升维 4 倍再降回来"在干什么、以及 `GPT` 如何用 `n_layer` 个 Block 叠成完整的 Transformer。本讲的 `(B, T, C)` 进、`(B, T, C)` 出，正是它们能无限堆叠的前提。
