---
title: "《micrograd 源码逐行》第00讲 · 导论：神经网络的最小种子"
date: 2026-06-29 09:31:00
tags: [AI, 深度学习, 神经网络, 反向传播, micrograd, 源码解析, 课程]
categories: [技术笔记]
toc: true
visibility: public
---

<style>
.mg-b{display:inline-block;font-size:12px;font-weight:700;padding:1px 8px;border-radius:999px;vertical-align:middle;margin-left:6px;line-height:1.7;white-space:nowrap}
.mg-core{color:#fff;background:#b73a2c}
.mg-key{color:#b73a2c;background:rgba(183,58,44,.1);border:1px solid rgba(183,58,44,.3)}
.mg-skim{color:#3f5d7e;background:rgba(63,93,126,.1);border:1px solid rgba(63,93,126,.25)}
.mg-note{margin:14px 0;padding:12px 16px;border-left:3px solid #3f5d7e;background:rgba(63,93,126,.06);border-radius:0 4px 4px 0}
.mg-why{margin:14px 0;padding:12px 16px;border-left:3px solid #69727d;background:rgba(105,114,125,.07);border-radius:0 4px 4px 0;color:#3a4049}
.mg-key-note{margin:14px 0;padding:12px 16px;border-left:3px solid #b73a2c;background:rgba(183,58,44,.06);border-radius:0 4px 4px 0}
.mg-fold{margin:14px 0;border:1px solid rgba(29,33,39,.14);border-radius:6px;background:#fafafa;padding:0 16px}
.mg-fold>summary{cursor:pointer;padding:12px 0;font-weight:700;color:#1d2127}
.mg-fold[open]{padding-bottom:8px}
.mg-card{margin:16px 0;padding:14px 18px;border:1px solid rgba(183,58,44,.25);border-radius:8px;background:rgba(183,58,44,.03)}
html[data-user-color-scheme="dark"] .mg-note{background:rgba(126,168,224,.1);border-left-color:#7ea8e0;color:#c9cdd4}
html[data-user-color-scheme="dark"] .mg-why{background:rgba(255,255,255,.04);border-left-color:#8b93a0;color:#aeb4be}
html[data-user-color-scheme="dark"] .mg-key-note{background:rgba(224,108,92,.12);border-left-color:#e0746b;color:#d6dae0}
html[data-user-color-scheme="dark"] .mg-fold{background:rgba(255,255,255,.03);border-color:rgba(255,255,255,.14)}
html[data-user-color-scheme="dark"] .mg-fold>summary{color:#e6e8ec}
html[data-user-color-scheme="dark"] .mg-card{background:rgba(224,108,92,.08);border-color:rgba(224,108,92,.3);color:#d6dae0}
html[data-user-color-scheme="dark"] .mg-key{color:#ef9a8e;background:rgba(224,108,92,.14);border-color:rgba(224,108,92,.4)}
html[data-user-color-scheme="dark"] .mg-skim{color:#9fc1ec;background:rgba(126,168,224,.14);border-color:rgba(126,168,224,.35)}
</style>

## 本讲定位

<div class="mg-key-note"><strong>最关键</strong>：本讲不逐行读代码，只做一件事——把整张地图铺在你面前。micrograd 是一颗"神经网络的最小种子"：约 150 行 Python，却包含了现代深度学习框架最核心的发动机——自动微分（反向传播）。读完本系列，你对 PyTorch 里那句 <code>loss.backward()</code> 就不再是"框架黑魔法"，而是"我知道它在背后干了什么"。</div>

这一讲讲清三件事：① micrograd 到底是什么；② 它凭什么值得你花时间读；③ 两个文件各管什么。最后给你一张"本系列怎么读"的路线图。

## micrograd 是什么：150 行的"神经网络种子" <span class="mg-b mg-core">必读</span>

micrograd 是 Andrej Karpathy 写的教学项目（开源），全部加起来约 150 行，干净利落地切成两半：

- **`engine.py`（约 100 行）**：autograd 引擎，核心是一个 `Value` 类。它负责"存数字 + 自动求导"。
- **`nn.py`（约 50 行）**：一个极简神经网络库，用 `Value` 搭出 `Neuron`（神经元）、`Layer`（层）、`MLP`（多层感知机）。

它最重要的一条设计约束是：**只在 scalar（单个标量数字）上运算**。没有张量，没有矩阵，没有向量化。一个神经元里的 `w·x + b`，在 micrograd 里不是一次矩阵乘法，而是被拆成一个个最小的乘法和加法，每一个中间结果都是一个独立的 `Value`。

<div class="mg-why"><strong>为什么这么"笨"</strong>：因为拆到 scalar 这一层，反向传播的链式法则就退化成了最朴素的形式——每个节点只需要知道"我这一步的局部导数"（比如 <code>d(a*b)/da = b</code>），剩下的交给图去串。没有任何为了性能而堆的抽象挡在你和原理之间，你看到的是"裸的"链式法则。</div>

代价当然是慢、跑不了真实规模的任务。但对"学懂原理"这件事来说，这恰恰是优点：**该藏的它一点不藏**。

## 先看一眼"魔法"：你只写算式，它替你求导 <span class="mg-b mg-key">重点</span>

下面这段来自 micrograd 的 README，是点燃整门课的"动机样例"。先别管中间那串运算有多绕，看两头就行：

```python
from micrograd.engine import Value
a = Value(-4.0)
b = Value(2.0)
c = a + b
d = a * b + b**3
c += c + 1
c += 1 + c + (-a)
d += d * 2 + (b + a).relu()
d += 3 * d + (b - a).relu()
e = c - d
f = e**2
g = f / 2.0
g += 10.0 / f
print(f'{g.data:.4f}') # 24.7041，前向结果
g.backward()
print(f'{a.grad:.4f}') # 138.8338，即 dg/da
print(f'{b.grad:.4f}') # 645.5773，即 dg/db
```

这段代码读起来就是**普通的 Python 算术**：加、乘、幂 `**`、`relu()`、取负 `-a`、相减、除法。`a` 和 `b` 是两个输入标量，中间一通运算，最后 `print(f'{g.data:.4f}')` 打出 `24.7041`——这跟你拿计算器一步步硬算出来的结果完全一样，没什么神奇。

神奇的是 `g.backward()` 这一句。**调用它之后**，`a.grad` 变成了 `138.8338`，`b.grad` 变成了 `645.5773`。你从头到尾没有手写过任何一条求导公式。

<div class="mg-key-note"><strong>这就是全部动机</strong>：你只是正常写算式，micrograd 在背后把每一次运算都悄悄记进一张"计算图"；<code>g.backward()</code> 沿着这张图从 <code>g</code> 倒着走回 <code>a</code> 和 <code>b</code>，用链式法则把一路上的局部导数乘起来，自动填好每个输入的梯度。<code>a.grad</code> 的含义就是 <code>dg/da</code>——"<code>a</code> 这个输入每动一点点，最终输出 <code>g</code> 会跟着变多少"。</div>

再留意一个细节：例子里 `Value` 和裸数字是混着写的——`c + 1`、`1 + c`、`3 * d`、`10.0 / f`、`-a`，它全都接得住。这说明 `Value` 把 Python 的算术运算符都**重载**了，还能把裸数字自动包成 `Value`。这正是 `engine.py` 的心脏，我们 01–02 讲会逐行拆开它。而 `a.grad = dg/da` 这个"输出对输入的敏感度"，到了训练里换个名字就叫**梯度**——它告诉我们每个参数该往哪个方向调，这是 04 讲训练的全部依据。

## 两文件全景地图

| 文件 | 行数 | 角色 | 核心内容 |
|---|---|---|---|
| `engine.py` | ~100 | autograd 引擎 | `Value` 类：存数据 `.data` 与梯度 `.grad`，重载 `+ * ** relu` 等运算，悄悄记录计算图，提供 `.backward()` |
| `nn.py` | ~50 | 神经网络库 | 用 `Value` 搭 `Neuron` / `Layer` / `MLP`，把每个权重、偏置也都做成 `Value` |

依赖方向是单向的：**`nn.py` 完全建立在 `engine.py` 之上**。`Value` 是唯一的"积木"，所谓神经网络，无非是把成千上万个 `Value` 按某种结构连起来、再让它们一起 `backward()`。

<div class="mg-note"><strong>关键</strong>：搞懂了 <code>Value</code>，神经网络就只剩"怎么搭积木"这一个问题了——所以本系列先啃 <code>engine.py</code>，再看 <code>nn.py</code>。</div>

## 为什么值得读：它是理解 PyTorch 的种子

反向传播（backpropagation）是**整个深度学习的发动机**。PyTorch、TensorFlow、JAX，核心都是一个 autograd 引擎，原理和 micrograd 一模一样——只是把 scalar 换成 tensor，加上 GPU、加上一大堆工程优化和算子。micrograd 做的事，是把这台发动机缩小到"一个下午能读完、能在脑子里完整跑一遍"的尺寸。

读懂它，你会得到两样东西：一是真正理解"反向传播"在计算图上到底做了什么；二是真正理解"训练在干嘛"——无非是 **前向算出损失 → 反向求出每个参数的梯度 → 顺着梯度把参数挪一小步**，循环往复。

而且这 150 行不是花架子。README 里给了一个能跑的训练 demo：

> demo.ipynb 用 `MLP(2,[16,16,1])` 对 moon 数据集做二分类，损失用 svm "max-margin"，优化用 SGD；两个 16 节点隐藏层。

也就是说，靠这套最小积木，真的能训练出一个会分类的神经网络。我们 04 讲会把它从头跑一遍。

## 本系列怎么读 <span class="mg-b mg-core">必读</span>

建议**严格按顺序读**，因为 `engine.py` 是整座楼的地基：

| 讲 | 对应文件 | 你会搞懂 |
|---|---|---|
| 00（本讲） | — | 全景地图与动机：为什么读、读什么、怎么读 |
| 01–02 | `engine.py` | `Value` 怎么用运算符重载偷偷建计算图，`backward()` 怎么按拓扑序沿图把梯度求出来 |
| 03 | `nn.py` | 怎么用 `Value` 搭出 `Neuron` / `Layer` / `MLP`，参数为什么也是 `Value` |
| 04 | demo | 一次完整训练：forward → 算 loss → backward → 用梯度更新参数 |

<div class="mg-note"><strong>提示</strong>：如果你只想先建立直觉，01–02 是性价比最高的两讲；它们讲透了，后面 03、04 基本是水到渠成。</div>

## 关键点

<div class="mg-card"><strong>本讲速记</strong><br/>• micrograd ≈ 150 行：<code>engine.py</code>（~100 行 autograd 引擎）+ <code>nn.py</code>（~50 行神经网络库）。<br/>• 只在 scalar 上运算——刻意"笨"，好让链式法则裸露出来，原理零遮挡。<br/>• 你写普通算式，它在背后建计算图；一句 <code>.backward()</code> 自动求出每个输入的梯度。<br/>• <code>a.grad</code> = <code>dg/da</code> = 输出对输入的敏感度；在训练里这就是指导参数更新的"梯度"。<br/>• <code>nn.py</code> 建立在 <code>Value</code> 之上，所以先读引擎、再读网络、最后看训练。</div>

## 自测

<details class="mg-fold"><summary>读完先别走，试着答这 3 题 <span class="mg-b mg-skim">可跳读</span></summary>

**Q1.** micrograd 只在 scalar 上运算，相比 PyTorch 的 tensor 有什么取舍？为什么这个"笨"对学习反而是好事？

**Q2.** README 例子里你一行求导公式都没写，`a.grad = 138.8338` 究竟是怎么冒出来的？是 `g.data` 那一步算出来的吗？

**Q3.** `engine.py` 和 `nn.py` 谁依赖谁？为什么本系列要先读引擎？

---

**A1.** 取舍是：放弃了向量化与 GPU，跑得慢、扛不了真实规模。但好处是每次运算都发生在两个单独的数字之间，局部导数简单到一眼能看穿（`d(a+b)/da = 1`、`d(a*b)/da = b`），反向传播就是"局部导数 × 下游传来的梯度"这么朴素。原理一点不被性能抽象遮挡，正适合学。

**A2.** 不是 `g.data` 那步。前向只算出了数值 `24.7041`。真正的关键是：你写 `c = a + b` 时，micrograd 不只算出 `-2`，还顺手记下了"这个节点由 `a` 和 `b` 经 `+` 得到"。每次运算都这样记，于是从 `a`、`b` 到 `g` 形成了一整张计算图。`g.backward()` 先把 `g.grad` 置 1，再沿图反向逐节点套链式法则，等走回 `a`、`b` 时，它们的 `.grad` 里装的就是 `dg/da`、`dg/db`。（具体怎么实现，01–02 讲逐行看。）

**A3.** `nn.py` 依赖 `engine.py`。`Value` 是唯一的积木，神经网络只是把大量 `Value` 连起来；地基不懂，上层只会一头雾水，所以先啃引擎。

</details>

## 小结与下一讲预告

这一讲我们没读一行引擎代码，但把最重要的直觉立住了：**micrograd 是把深度学习的发动机——自动微分——缩到 150 行的种子**；你写普通算式，它建计算图，一句 `.backward()` 就替你求出所有梯度，而这正是"训练"的核心依据。

下一讲（01）开始我们正式进 `engine.py`，从 `Value` 的诞生讲起：它的构造函数都存了哪些字段、为什么除了 `data` 和 `grad` 还要藏一个 `_prev`（孩子集合）和一个 `_backward`（局部求导函数）。搞懂这几个字段，"计算图是怎么被悄悄建起来的"就揭晓了。
