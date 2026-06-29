---
title: "《micrograd 源码逐行》第02讲 · engine.py 下篇：反向传播（高潮）"
date: 2026-06-29 09:33:00
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

<div class="mg-key-note"><strong>这是全课高潮</strong>：第 01 讲我们看到，每个运算在算出结果的同时，顺手挂了一个 <code>_backward</code> 闭包、记下了 <code>_prev</code>（输入是谁）。这一讲揭晓那两样东西怎么联手，把梯度自动求出来——先看每个运算的<strong>局部求导</strong>（藏在各自的 <code>_backward</code> 里），再看 <code>backward()</code> 怎么按<strong>拓扑序</strong>把它们串成一次完整的反向传播。读完，"自动微分"对你不再是黑魔法。</div>

## 一句话回顾链式法则 <span class="mg-b mg-key">重点</span>

反向传播 = 链式法则的工程化。若输出 `L` 依赖 `a`、`a` 又依赖 `x`，则：

```text
dL/dx = dL/da · da/dx
```

autograd 的设计哲学是：**让每个节点只操心"我这一步的局部导数"**（比如 `da/dx`），至于全局的 `dL/dx`，交给计算图把一路上的局部导数乘起来。每个 op 的 `_backward` 负责"局部导数"，`backward()` 负责"沿图串起来"。

## 每个 op 的 `_backward`：局部梯度 <span class="mg-b mg-core">必读</span>

回看 01 讲：每个运算都定义了一个 `_backward`，它的活是——**把下游传来的梯度 `out.grad`，乘上本运算的局部导数，累加给各个输入**。逐个看。

**加法**：`out = self + other`

```python
def _backward():
    self.grad += out.grad
    other.grad += out.grad
```

局部导数 `d(self+other)/dself = 1`、`/dother = 1`。链式法则：`self.grad += 1 · out.grad`。所以加法把下游梯度 `out.grad` **原样分发**给两个输入。

<div class="mg-note"><strong>直觉</strong>：加法是"分配器"——下游来多少梯度，两个输入各拿一份原样的。</div>

**乘法**：`out = self * other`

```python
def _backward():
    self.grad += other.data * out.grad
    other.grad += self.data * out.grad
```

`d(self·other)/dself = other`、`/dother = self`。所以各自乘上"**对方的值**"再乘下游梯度。直觉：乘法里，`self` 对结果的影响被 `other` 放大了 `other` 倍，梯度自然也放大同样的倍数。

**幂**：`out = self ** other`（`other` 是常数）

```python
def _backward():
    self.grad += (other * self.data**(other-1)) * out.grad
```

幂法则 `d(x^n)/dx = n·x^(n-1)`，原样照搬：`other * self.data**(other-1)`，再乘 `out.grad`。

**ReLU**：`out = relu(self)`

```python
def _backward():
    self.grad += (out.data > 0) * out.grad
```

`relu(x)=max(0,x)`，导数是 `x>0 ? 1 : 0`。代码用 `out.data > 0`（等价 `x>0`，因为 `out.data` 就是 `max(0,x)`），布尔值当 `0/1` 用。

<div class="mg-why"><strong>直觉</strong>：ReLU 是个"闸门"——正区间放行梯度（×1），负区间直接掐断（×0）。这也是深层网络里"梯度在负区不流动"的来源。</div>

## 为什么是 `grad +=` 而不是 `grad =` <span class="mg-b mg-core">必读</span>

你应该注意到了：每个 `_backward` 都用 `+=`，而 `grad` 在 `__init__` 里初始化为 `0`。这不是随手写的，是**正确性的关键**。

<div class="mg-key-note"><strong>根本原因</strong>：计算图是 DAG（有向无环图），不是树——<strong>一个节点可能被多个下游用到</strong>。来自不同下游路径的梯度，按多元链式法则必须<strong>相加</strong>。所以 <code>grad</code> 是个累加器：每条到达它的反传路径都 <code>+=</code> 一份。若用 <code>=</code>，后到的梯度会覆盖先到的，梯度就错了。</div>

一个最小例子把它说穿——`y = x * x`：

```python
x = Value(2.0)
y = x * x      # y.data = 4
y.backward()
print(x.grad)  # 4.0，即 dy/dx = 2x = 4
```

`x * x` 调 `__mul__`，此时 `self` 和 `other` **是同一个对象 `x`**。它的 `_backward` 执行两句：`self.grad += other.data * out.grad` 和 `other.grad += self.data * out.grad`。两句都作用在 `x` 上、都 `+=`，于是 `x.grad = 2·2·1 = 4`。

<div class="mg-note"><strong>看清了</strong>：同一个 <code>x</code> 被用了两次，两份梯度（各 <code>2</code>）<strong>自动累加</strong>成 <code>2x=4</code>，正是数学上的答案。若用 <code>=</code>，只会剩最后一份 <code>2</code>，错。<code>+=</code> 就是为这种"参数复用"准备的。</div>

## `backward()`：把局部梯度串成全局 <span class="mg-b mg-core">必读</span>

有了每个节点的局部 `_backward`，还差一个"按什么顺序调它们"。这就是 `backward()` 干的：

```python
def backward(self):

    # topological order all of the children in the graph
    topo = []
    visited = set()
    def build_topo(v):
        if v not in visited:
            visited.add(v)
            for child in v._prev:
                build_topo(child)
            topo.append(v)
    build_topo(self)

    # go one variable at a time and apply the chain rule to get its gradient
    self.grad = 1
    for v in reversed(topo):
        v._backward()
```

三步走：

**① 拓扑排序 `build_topo`**：从输出节点 `self` 出发，递归走遍所有祖先（一路回到输入）。注意顺序——先递归 `_prev`（children），**最后**才 `topo.append(v)`。这是后序遍历，保证：一个节点被 append 时，它依赖的所有输入都已经在它前面。于是 `topo` 的末尾是 `self`（输出）。

**② 播种 `self.grad = 1`**：反向传播的起点。输出对它自己的导数是 `1`（`dL/dL = 1`），给整张图的梯度"点火"。

**③ 逆序反传 `for v in reversed(topo): v._backward()`**：`reversed(topo)` 把输出排在最前、输入排在最后。逐个调 `_backward`，把梯度从输出一层层往输入推。

<div class="mg-why"><strong>为什么必须逆拓扑序？</strong>一个节点的梯度，要等<strong>所有用到它的下游都贡献完</strong>才完整，才能再往它的输入传。逆拓扑序恰好保证"先把所有用到我的人处理完，轮到我时我的 <code>grad</code> 已经累加齐了"。顺序错了，就会拿着不完整的梯度往上传，结果全错。</div>

## 手推一遍：三节点反向传播 <span class="mg-b mg-key">重点</span>

```python
a = Value(2.0)
b = Value(3.0)
c = a * b      # c.data = 6
c.backward()
print(a.grad)  # 3.0  (= dc/da = b)
print(b.grad)  # 2.0  (= dc/db = a)
```

- **前向 + 建图**：`c = a*b`，于是 `c._prev = {a, b}`，`c._backward` 被设为"`a.grad += b.data·c.grad`；`b.grad += a.data·c.grad`"。
- **`c.backward()`**：`build_topo` 得到 `topo = [a, b, c]`（叶子在前，`c` 在末）；`reversed = [c, b, a]`；`c.grad = 1`；调 `c._backward()` → `a.grad += 3·1 = 3`、`b.grad += 2·1 = 2`；再调 `b._backward()`、`a._backward()`——它们是叶子，`_backward` 还是默认的空函数，什么都不做。
- **结果**：`a.grad = 3 = dc/da`、`b.grad = 2 = dc/db`。完全正确，而你一行求导公式都没写。

## 自测 <span class="mg-b mg-skim">可跳读</span>

<details class="mg-fold"><summary>答这 3 题，确认你真懂了反向传播 <span class="mg-b mg-skim">可跳读</span></summary>

**Q1.** 加法的 `_backward` 为什么把 `out.grad` 原样分给两个输入，而乘法要各乘"对方的值"？

**Q2.** `grad` 为什么用 `+=` 而不是 `=`？用 `y = x*x` 说明若改成 `=` 会错成什么。

**Q3.** `backward()` 为什么要先拓扑排序、再 `reversed` 逐个调 `_backward`？顺序乱了会怎样？

---

**A1.** 因为局部导数不同：`d(a+b)/da = 1`，所以加法 `×1`，原样传；`d(a·b)/da = b`，所以乘法要乘上对方的 `data`。`_backward` 做的永远是"局部导数 × 下游梯度"。

**A2.** 计算图里一个节点可能被多个下游使用，多条路径的梯度按链式法则要相加，所以 `grad` 是累加器。`y=x*x` 中 `self` 和 `other` 是同一个 `x`，`+=` 让两份梯度累加成 `2x=4`；若用 `=`，第二句覆盖第一句，只剩 `2`，错。

**A3.** 一个节点的梯度必须等所有下游都累加完才完整。逆拓扑序保证"轮到某节点时，用到它的人都处理过了"。顺序乱了，会拿不完整的梯度往上传，得到错误结果。

</details>

## 速查卡 <span class="mg-b mg-core">必读</span>

<div class="mg-card"><strong>反向传播速记</strong><br/>• 每个 op 的 <code>_backward</code> = "本运算局部导数 × 下游梯度"，累加给输入。<br/>• 加法原样传（×1）、乘法乘对方值、幂用幂法则、ReLU 正区放行负区掐断。<br/>• <code>grad +=</code>：一个节点被多处用到，多路径梯度要累加（<code>y=x*x</code> 得 <code>2x</code> 就靠它）。<br/>• <code>backward()</code>：拓扑排序（后序）→ <code>self.grad=1</code> 播种 → <code>reversed(topo)</code> 逐个 <code>_backward()</code>。<br/>• 一句话：<strong>前向建图，反向沿图逆序把局部导数乘起来</strong>，自动微分到此完结。</div>

## 小结与下一讲预告

`engine.py` 到这里就读完了。回头看，自动微分其实朴素得惊人：**前向时每个运算顺手记下"自己是怎么算出来的"和"梯度该怎么往回传"，反向时按逆拓扑序把这些局部规则一路乘起来**。PyTorch 的 autograd 原理与此一模一样，只是把 scalar 换成 tensor、加上 GPU 和海量工程。

下一讲（03）进 `nn.py`：我们用这颗 `Value` 积木，搭出 `Neuron`、`Layer`、`MLP`。关键悬念已经埋好——既然网络里每个权重也都是一个 `Value`，那么前向一跑，整张计算图就建好了；本讲的 `backward()` 自然就能把梯度一路传到每一个权重。
