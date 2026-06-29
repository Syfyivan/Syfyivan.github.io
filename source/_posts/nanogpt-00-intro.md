---
title: "《nanoGPT 源码逐行》第00讲 · 导论：最简可读的 GPT，与它和 micrograd 的接续"
date: 2026-06-29 10:01:00
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

<div class="ng-key-note"><strong>一句话</strong>：nanoGPT 是 karpathy 写的「最简可读」GPT 实现——一个 <code>model.py</code> 定义模型、一个 <code>train.py</code> 跑训练、一个 <code>sample.py</code> 做生成。本讲不抠每一行，先用 <code>GPT.forward</code> 把「一串 token 进去、下一个 token 的概率分布出来」这条主线走通，并把它接回你已经读过的 micrograd。</div>

如果你读完了《micrograd 源码逐行》，你手里已经有一颗种子：一个 `Value` 标量、一套手写的反向传播、几十行就能训练一个小网络。nanoGPT 就是这颗种子长成的树——**同样的「前向 → loss → backward → 更新」内核**，只是把标量换成张量、把手写 autograd 换成 PyTorch、把几个神经元换成一个真正的 Transformer。

读完本讲，你应该能回答：这堆文件各管什么？数据从 token id 到 loss 中间经过了哪些形状变化？以及——它和我手写过的那套求导，到底是不是一回事。

## nanoGPT 是什么

它的卖点是「少而清楚」：核心就三个文件，加起来不到一千行，却能从零训练、也能微调 GPT-2，约 124M 参数那档能复现出 OpenAI 的 GPT-2 small。

| 文件 | 体量 | 管什么 |
|---|---|---|
| `model.py` | ~300 行 | **定义模型**：`LayerNorm` / `CausalSelfAttention` / `MLP` / `Block` / `GPT`；`forward` 算 `logits` 和 `loss`，外加 `generate`(采样)、`configure_optimizers`(建优化器)、`from_pretrained`(加载 GPT-2 权重) |
| `train.py` | ~300 行 | **训练循环**：读数据 → 前向 → `loss.backward()` → AdamW 更新；含学习率调度、梯度累积、混合精度、DDP 多卡、存/读 checkpoint |
| `sample.py` | 短 | **生成**：加载 checkpoint，调 `model.generate` 自回归地把文本续写出来 |

<div class="ng-note"><strong>124M 从哪来</strong>：默认配置 <code>n_layer=12, n_head=12, n_embd=768, block_size=1024, vocab_size=50304</code>，就是 GPT-2 small 的规格。本系列后面所有「具体形状」都用这套数字举例。</div>

## 它和 micrograd 怎么接上

micrograd 教会你一件事：神经网络训练 = 在一张计算图上做链式法则。nanoGPT 没有推翻这件事，只是把每个零件换成了工业版。

| | micrograd | nanoGPT（PyTorch） |
|---|---|---|
| 计算单元 | `Value`（标量） | `torch.Tensor`（张量，一次装一批数） |
| 反向传播 | 手写 `_backward` + 拓扑排序 | `loss.backward()`（autograd 引擎，C++/CUDA 实现，**原理同链式法则**） |
| 参数 | 一堆 `Value` | `nn.Parameter`（就是 `requires_grad=True` 的 Tensor） |
| 模块封装 | `Neuron / Layer / MLP` | `nn.Module / nn.Linear / nn.Embedding` |
| 参数更新 | 手写 `p.data -= lr * p.grad` | `torch.optim.AdamW`（`optimizer.step()`） |

把这张表立起来，nanoGPT 的训练循环你其实早就见过。下面这段是**示意**（逐行细节留到第 04 讲），但骨架就是这四步：

```python
# one training step (示意；逐行见第 04 讲)
logits, loss = model(X, Y)   # forward
loss.backward()              # backward
optimizer.step()             # update
optimizer.zero_grad()        # zero grad
```

和你在 micrograd 里写的 `loss.backward()` 后 `for p in parameters(): p.data -= lr*p.grad` 是同一套节奏：**算损失、回传梯度、按梯度改参数、清空再来**。

<div class="ng-key-note"><strong>接续点</strong>：从 micrograd 到 nanoGPT，变的是「规模和实现」（标量→张量、手写→PyTorch、小网络→Transformer），不变的是「训练内核」（前向→loss→backward→更新）。所以接下来你要花力气理解的，主要是<strong>模型结构</strong>本身，而不是怎么求导——求导这件事 PyTorch 替你做了。</div>

## 主线：`GPT.forward` 一次走完数据流

整个模型最该先读的就是 `forward`：它是数据的主干道，其余零件都挂在这条路上。先把约定立好：**b** = batch（一批几条序列）、**t** = 序列长度（几个 token）、**C** = `n_embd`（每个 token 向量多宽）、**V** = `vocab_size`（词表多大）。

```python
def forward(self, idx, targets=None):
    device = idx.device
    b, t = idx.size()
    assert t <= self.config.block_size
    pos = torch.arange(0, t, dtype=torch.long, device=device) # shape (t)
    tok_emb = self.transformer.wte(idx) # (b, t, n_embd)
    pos_emb = self.transformer.wpe(pos) # (t, n_embd)
    x = self.transformer.drop(tok_emb + pos_emb)
    for block in self.transformer.h:
        x = block(x)
    x = self.transformer.ln_f(x)
    if targets is not None:
        logits = self.lm_head(x)
        loss = F.cross_entropy(logits.view(-1, logits.size(-1)), targets.view(-1), ignore_index=-1)
    else:
        # inference: only forward lm_head on the very last position
        logits = self.lm_head(x[:, [-1], :])
        loss = None
    return logits, loss
```

**第一步，token id 进来。** 输入 `idx` 是 `(b, t)` 的整数张量，每个元素是 `[0, V)` 区间里的 token id——它还不是向量，只是「第几个词」的编号。

**第二步，查两张表得到向量。** `wte`（token embedding）把每个 id 查成一个 C 维向量；`wpe`（position embedding）把每个位置 `0,1,…,t-1` 也查成一个 C 维向量，两者相加。

<div class="ng-note"><strong>形状</strong>：<code>tok_emb = wte(idx)</code> 得 <code>(b, t, C)</code>；<code>pos_emb = wpe(pos)</code> 得 <code>(t, C)</code>；相加靠广播（broadcasting）把 <code>(t, C)</code> 沿 batch 维铺开，对齐成 <code>(b, t, C)</code>——即每条序列都加上同一组位置向量。</div>

<div class="ng-why"><strong>为什么要位置嵌入</strong>：注意力本身对顺序「无感」——把 token 顺序打乱，它算出的两两关系不变。<code>wpe</code> 把「第几个位置」也编码进向量里，模型才分得清谁先谁后。</div>

**第三步，过 N 个 Block。** `for block in self.transformer.h: x = block(x)`，`x` 始终是 `(b, t, C)`。一个 Block 长这样：

```python
def forward(self, x):
    x = x + self.attn(self.ln_1(x))
    x = x + self.mlp(self.ln_2(x))
    return x
```

<div class="ng-key-note"><strong>残差主干</strong>：一个 Block 做两件事——先 <code>x = x + attn(ln_1(x))</code>，再 <code>x = x + mlp(ln_2(x))</code>。盯住那个 <code>x +</code>：每层都是「在主干上加一笔修正」，而不是把 x 覆盖掉。这条贯穿始终、宽度恒为 C 的 <code>x</code> 就是<strong>残差流</strong>，也是为什么所有形状一路保持 <code>(b, t, C)</code> 不变。注意力内部怎么算（第 02 讲）、MLP / LayerNorm 细节（第 03 讲）这里先放过。</div>

**第四步，收尾归一化。** `x = ln_f(x)` 再做一次 LayerNorm，形状仍是 `(b, t, C)`。

**第五步，投影到词表 + 算 loss。** `lm_head` 是一个 `C → V` 的线性层，把每个位置的向量投影成「词表上每个词的打分」`logits`。

<div class="ng-why"><strong>为什么要 view(-1, …)</strong>：训练分支里 <code>logits</code> 是 <code>(b, t, V)</code>、<code>targets</code> 是 <code>(b, t)</code>，而 <code>F.cross_entropy</code> 要的是 <code>(N, V)</code> 对 <code>(N,)</code>。<code>logits.view(-1, V)</code> 把 batch 和时间压平成 <code>(b·t, V)</code>，<code>targets.view(-1)</code> 成 <code>(b·t,)</code>——于是 b·t 个位置被当成 b·t 个独立的「预测下一个词」样本，一次算完取平均。<code>ignore_index=-1</code> 表示 target 为 -1 的位置不计损失（用来屏蔽 padding）。</div>

<div class="ng-note"><strong>推理省算</strong>：<code>targets is None</code> 时只对最后一个位置过 <code>lm_head</code>——<code>x[:, [-1], :]</code> 用<strong>列表</strong>下标 <code>[-1]</code>（而非整数）保留那一维，得 <code>(b, 1, C)</code>，输出 <code>(b, 1, V)</code>。生成下一个 token 只需要最后一步的分布，没必要为前面每个位置都白算一遍 V 维投影。</div>

### targets 是什么？输入右移一位

语言模型的任务朴素到一句话：**看着前面，猜下一个词**。所以 `targets` 不是另外标注的，它就是输入 `idx` 整体右移一位（`train.py` 取数据时 `X = data[i:i+t]`、`Y = data[i+1:i+1+t]`）。举个例子（真实 GPT-2 用 BPE 子词，这里用整词示意）：

```
输入  X:  他   站   在   桥
目标  Y:  站   在   桥   上
```

也就是：看到「他」要预测「站」，看到「他站」要预测「在」……配合注意力里的**因果掩码**（位置 t 只能看见 ≤ t 的内容，第 02 讲细讲），每个位置都在独立地做「given 过去、预测下一个」。这就是为什么一次前向能同时拿到 t 个位置的损失——**t 个位置 = t 个训练样本**，Transformer 把它们并行算了。

<div class="ng-card"><strong>数据流速查</strong>（b=batch, t=序列长, C=n_embd, V=vocab_size）<br/>idx <code>(b,t)</code> → wte+wpe → <code>(b,t,C)</code> → ×N 个 Block → <code>(b,t,C)</code> → ln_f → lm_head → <code>(b,t,V)</code> → cross_entropy（对比右移一位的 targets）→ loss <code>标量</code></div>

## 关键点

- <span class="ng-b ng-key">重点</span> `forward` 是主干道：**id → 嵌入 → N 个 Block → 归一化 → 投影成 logits → 对比下一个词算 loss**，全程 `x` 都是 `(b, t, C)`。
- <span class="ng-b ng-key">重点</span> Block 的 `x = x + sublayer(ln(x))` 是「残差流 + Pre-LN」，是形状始终不变、深层网络能训得动的关键。
- <span class="ng-b ng-key">重点</span> 监督信号是免费的：`targets` = 输入右移一位，不需要人工标注，这叫自监督。
- <span class="ng-b ng-core">必读</span> 训练内核和 micrograd 完全同构，`loss.backward()` 就是你手写过的那套链式法则的张量版、工业版。后面真正要啃的是**结构**，不是求导。
- 还有两个挂件这一讲先记个名字：`generate`（自回归采样，第 05 讲）、`configure_optimizers`（建 AdamW、给谁加 weight decay，第 04 讲）。

## 自测

试着不翻上文回答，再展开对答案。

1. `forward` 里 `tok_emb + pos_emb` 两个张量形状分别是 `(b, t, C)` 和 `(t, C)`，怎么能直接相加？
2. 训练时 `logits` 是 `(b, t, V)`，为什么喂给 `cross_entropy` 前要 `view(-1, V)`？这步在语义上意味着什么？
3. `targets` 和输入 `idx` 是什么关系？为什么这样设置就能让模型学会「续写」？

<details class="ng-fold"><summary>参考答案 <span class="ng-b ng-skim">可跳读</span></summary>

1. **广播（broadcasting）**。`(t, C)` 缺一个 batch 维，相加时会沿 batch 维自动复制成 `(b, t, C)`，结果 `(b, t, C)`。含义是：一批里每条序列都加上**同一组**位置嵌入（位置编码和具体是哪条序列无关）。

2. 把 batch 维和时间维压平成一个「样本」维：`logits.view(-1, V)` 得 `(b·t, V)`、`targets.view(-1)` 得 `(b·t,)`。语义上是把 b·t 个位置当成 b·t 个独立的「预测下一个 token」分类样本，一次性算它们的平均交叉熵——这正是 Transformer 能并行训练所有位置的体现。

3. `targets` 就是 `idx` **右移一位**（位置 i 的目标是原序列第 i+1 个 token）。于是每个位置都在做「看着到 i 为止的内容，预测第 i+1 个词」；再配合注意力的因果掩码保证「只能看过去」，模型被逼着学会根据上文预测下文，也就学会了续写。

</details>

## 小结 & 下一讲预告

这一讲我们站在山顶看了全景：nanoGPT 是「model / train / sample」三件套；`GPT.forward` 把 token id 一路变成下一个词的概率分布，再和右移一位的 targets 算 loss；而整套训练，骨架和你手写过的 micrograd 一模一样——这也是我们接下来能放心把注意力全压在「结构」上的底气。

建议的阅读路线（顺序可按需微调）：

| 讲 | 主题 | 对应代码 |
|---|---|---|
| 00（本讲） | 全景 · 数据流 · 接续 micrograd | `GPT.forward` 主干 |
| 01 | 配置、骨架与嵌入 | `GPTConfig` / `GPT.__init__` / `wte`+`wpe` / 权重共享 / 参数初始化 |
| 02 | 因果自注意力 | `CausalSelfAttention` |
| 03 | MLP、LayerNorm、Block 与残差 | `MLP` / `LayerNorm` / `Block` |
| 04 | 训练循环 | `train.py`（前向→backward→AdamW→学习率调度→梯度累积） |
| 05 | 采样生成 | `sample.py` / `GPT.generate` |

**下一讲（01）**：我们钻进 `GPT.__init__`，看这棵模型树是怎么搭起来的——`wte` 和 `lm_head` 为什么能 `self.transformer.wte.weight = self.lm_head.weight` 共享同一张权重矩阵（weight tying），`vocab_size` 为什么要从 50257 垫到 50304，以及那行 `std=0.02/math.sqrt(2 * n_layer)` 的缩放初始化到底在防什么。
