---
title: "《micrograd 源码逐行》第04讲 · 训练 demo：把一切串成一次迭代"
date: 2026-06-29 09:35:00
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

<div class="mg-key-note"><strong>收官</strong>：前三讲我们把零件造齐了——<code>Value</code>（边算边建图 + 自动求梯度）、<code>MLP</code>（一堆 <code>Value</code> 连成的网络）。这一讲把它们装进一个<strong>训练循环</strong>，让网络真的"学"会二分类。你会看到：所谓训练，就是<strong>前向建图 → 算 loss → backward 求梯度 → 顺着梯度挪一小步</strong>，循环往复。看懂这个循环，你就看懂了一切深度学习训练。</div>

<div class="mg-note"><strong>说明</strong>：完整 demo 在仓库的 <code>demo.ipynb</code>（notebook，不是单一源文件）。本讲按 README 所述（<code>MLP(2,[16,16,1])</code> + SVM max-margin 损失 + SGD）重建并逐步讲解这个训练循环。</div>

## 第一步：建一个网络 <span class="mg-b mg-key">重点</span>

```python
from micrograd.nn import MLP

model = MLP(2, [16, 16, 1])   # 2 维输入，两个 16 节点隐藏层，1 维输出
```

复习第 03 讲：这一行就造出了一个三层 MLP，里面每一个权重、每一个偏置都是一个 `Value`。换句话说，`model.parameters()` 是一长串 `Value`——它们就是要被"训练"的东西。`moon` 数据集是二维点（所以输入 2 维），输出 1 个分数，正负代表两类。

## 第二步：前向，顺手把整张图建出来 <span class="mg-b mg-core">必读</span>

```python
inputs = [list(map(Value, xrow)) for xrow in X]   # 每个样本的 2 个坐标包成 Value
scores = list(map(model, inputs))                 # 对每个样本跑一遍网络
```

`model(input)` 会一路调 `Layer` → `Neuron` → 一堆 `Value` 的 `+ * relu`。**这一跑，第 01 讲说的"边算边建图"就在发生**：从输入坐标、经过每一层的权重，到最后的 `score`，一整张计算图被悄悄建好了，每个 `score` 都是这张图的输出节点。

## 第三步：算损失（loss）<span class="mg-b mg-key">重点</span>

损失衡量"网络现在错得多狠"。demo 用 SVM 的 max-margin（hinge）损失，再加 L2 正则：

```python
# max-margin：标签 yi∈{-1,+1}，希望 yi*scorei ≥ 1，否则受罚
losses = [(1 + -yi*scorei).relu() for yi, scorei in zip(y, scores)]
data_loss = sum(losses) * (1.0 / len(losses))

# L2 正则：惩罚过大的权重，防过拟合
alpha = 1e-4
reg_loss = alpha * sum((p*p for p in model.parameters()))

total_loss = data_loss + reg_loss
```

注意 `total_loss` 仍然是一个 `Value`——它是那整张大计算图的**根**。`(1 + -yi*scorei).relu()`、`p*p`、`sum(...)` 全都走的是第 01 讲那套运算符重载，所以从 `total_loss` 一路往回，能连到**每一个参数**。

<div class="mg-why"><strong>关键认知</strong>：loss 不是一个普通数字，是一个挂在计算图根上的 <code>Value</code>。正因如此，下一步一句 <code>total_loss.backward()</code> 才能把梯度送到图里每个权重。loss 把"对错"和"每个参数该负多少责任"用一张图连了起来。</div>

## 第四步：清零梯度 + 反向传播 <span class="mg-b mg-core">必读</span>

```python
model.zero_grad()        # 把所有参数的 .grad 清零
total_loss.backward()    # 自动算出每个参数的梯度
```

`backward()` 是第 02 讲的主角：按逆拓扑序，把 loss 对每个参数的偏导填进各自的 `.grad`。一句话，求出了"每个参数动一点点，loss 会变多少"。

但为什么 `backward()` 之前必须先 `zero_grad()`？这正好回扣第 02 讲那个 `+=`：

<div class="mg-key-note"><strong>为什么必须 zero_grad</strong>：梯度是<strong>累加</strong>的（<code>grad +=</code>）。如果不清零，这一轮的梯度会加到上一轮的残留上，越滚越错。每次 <code>backward()</code> 前清零，保证拿到的是"<strong>当前这一步</strong>"的干净梯度。第 03 讲 <code>Module.zero_grad</code> 那个看似不起眼的方法，作用就在这里。</div>

## 第五步：SGD —— 顺着梯度挪一小步 <span class="mg-b mg-core">必读</span>

```python
learning_rate = 1.0 - 0.9 * k / 100      # 学习率随训练衰减
for p in model.parameters():
    p.data -= learning_rate * p.grad
```

梯度 `p.grad` 指向"让 loss **变大**最快的方向"，所以我们往**反方向**走（`-=`），让 loss 变小。`learning_rate` 控制步子大小——太大容易跨过最优、震荡；太小学得慢，所以这里让它随训练慢慢变小。

<div class="mg-note"><strong>只动 <code>.data</code>，不碰图</strong>：更新参数时改的是 <code>p.data</code>（数值），计算图结构不动。下一轮重新前向，会基于新的 <code>.data</code> 再建一张新图。</div>

## 把五步合成一个循环 <span class="mg-b mg-core">必读</span>

```python
model = MLP(2, [16, 16, 1])

for k in range(100):
    # 1) 前向：跑网络，建图
    scores = list(map(model, inputs))
    # 2) 算 loss（max-margin + L2）
    total_loss = compute_loss(scores, y, model)
    # 3) 清零旧梯度
    model.zero_grad()
    # 4) 反向：求每个参数的梯度
    total_loss.backward()
    # 5) SGD：顺梯度反方向更新每个参数
    lr = 1.0 - 0.9 * k / 100
    for p in model.parameters():
        p.data -= lr * p.grad
```

跑上 100 轮，网络就在 moon 数据集上学出了一条弯曲的决策边界——靠的全是这 150 行积木。

<div class="mg-key-note"><strong>这就是深度学习训练的内核</strong>：<code>前向建图 → 算 loss → backward 求梯度 → 顺梯度更新参数</code>，循环往复。PyTorch 的训练循环长得几乎一模一样——<code>optimizer.zero_grad()</code> / <code>loss.backward()</code> / <code>optimizer.step()</code>——只是把 scalar 换成 tensor、SGD 换成更花哨的优化器、加上 GPU。你在 micrograd 里看到的，就是那台发动机的全部原理。</div>

## 自测 <span class="mg-b mg-skim">可跳读</span>

<details class="mg-fold"><summary>3 题检验你是否真把训练循环看透了 <span class="mg-b mg-skim">可跳读</span></summary>

**Q1.** 为什么每轮 `backward()` 之前一定要 `zero_grad()`？不清零会怎样？（提示：回想 02 讲的 `+=`）

**Q2.** `total_loss` 是个普通数字还是 `Value`？这对 `backward()` 能不能工作有什么影响？

**Q3.** SGD 更新为什么是 `p.data -= lr * p.grad`（减号）？为什么改 `.data` 而不是整个 `p`？

---

**A1.** 因为梯度用 `+=` 累加。不清零，这一轮的梯度会叠加到上一轮残留上，方向和大小都错，训练发散。`zero_grad()` 保证每步拿到干净的当前梯度。

**A2.** 是 `Value`，且是整张计算图的根。正因为它是 `Value`、由一连串可微运算从参数算出来，`backward()` 才能沿图把梯度送到每个参数。如果 loss 是个脱离图的裸数字，就无从反传。

**A3.** `p.grad` 指向使 loss 增大最快的方向，要让 loss 减小就往反方向走，所以减号。改 `.data` 是只更新数值、保持参数仍是同一个 `Value` 对象；下一轮前向会基于新 `.data` 重新建图。

</details>

## 速查卡 <span class="mg-b mg-core">必读</span>

<div class="mg-card"><strong>训练循环速记</strong><br/>① 前向 <code>scores = map(model, inputs)</code> —— 跑网络、建图；② 算 loss（一个 <code>Value</code>，图的根）；③ <code>model.zero_grad()</code> —— 清掉累加的旧梯度；④ <code>loss.backward()</code> —— 自动求每个参数梯度；⑤ <code>p.data -= lr * p.grad</code> —— 顺梯度反方向更新。<br/>循环 = 深度学习训练的全部内核，PyTorch 只是放大版。</div>

## 全课小结 <span class="mg-b mg-core">必读</span>

五讲走完，你手里有了一条完整的因果链：

- **00**：micrograd 是把自动微分缩到 150 行的种子。
- **01**：`Value` 用运算符重载"边算边建图"——前向计算和建图是同一件事。
- **02**：每个 op 存了局部导数（`_backward`），`backward()` 按逆拓扑序把它们沿图串起来，自动求梯度；`grad +=` 处理参数复用。
- **03**：用 `Value` 搭 `Neuron/Layer/MLP`，网络每个权重都是 `Value`，前向一跑图就建好。
- **04**：训练 = `前向 → loss → backward → 更新` 的循环。

<div class="mg-note"><strong>下一步</strong>：micrograd 是种子，往上长一级就是 <strong>tinygrad</strong>（同作者，能跑真模型的极简框架），再往上是 <strong>nanoGPT</strong>（用同一套 autograd 思想训练 GPT）。读完这套，你再看 PyTorch 的训练代码，会发现处处是老朋友。</div>

恭喜你读完了整个 micrograd。150 行，一颗种子，却装着整个深度学习的发动机。🌱
