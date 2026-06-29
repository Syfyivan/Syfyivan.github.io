---
title: "《micrograd 源码逐行》第01讲 · engine.py 上篇：Value 与“边算边建图”"
date: 2026-06-29 09:32:00
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

<div class="mg-key-note"><strong>最关键</strong>：micrograd 全部的"魔法"都压在一个 <code>Value</code> 类里——它给一个普通标量包了一层壳，让你照常写 <code>a + b</code>、<code>a * b</code>，却在背地里把每一步运算连成一张计算图（DAG）。本讲只读 <code>engine.py</code> 的上半截：<code>Value</code> 存哪些字段、四个运算（<code>+ * ** relu</code>）如何"边算边建图"、尾部那串看着吓人的 dunder 又如何全靠前面三件武器拼出来。真正的反向传播数学（<code>backward()</code> 与各个 <code>_backward</code> 里的求导）留到第 02 讲。</div>

读这一讲时，请始终抓住一个念头：**前向计算和建图是同一件事**。你以为自己只是在算数，其实每算一步，图就长大一个节点、多出几条边。等到要求梯度时，这张图已经现成地躺在那里了。

## Value 是什么：先建立直觉

神经网络训练的核心动作是"求每个参数对最终 loss 的偏导"。要自动做到这一点，光有数字不够——你还得记住**这个数字是怎么算出来的**。于是 micrograd 不直接用 `float`，而是用 `Value` 把每个标量包起来，再重载 `+ - * / **` 这些运算符。这样你写的还是普通表达式，但每个中间结果都变成了一个"知道自己来历"的节点。

## `__init__`：一个节点要存哪五样东西 <span class="mg-b mg-core">必读</span>

```python
class Value:
    """ stores a single scalar value and its gradient """

    def __init__(self, data, _children=(), _op=''):
        self.data = data
        self.grad = 0
        # internal variables used for autograd graph construction
        self._backward = lambda: None
        self._prev = set(_children)
        self._op = _op # the op that produced this node, for graphviz / debugging / etc
```

五个字段，可以分成两层来看——**数值层**（`data`、`grad`）和**图结构层**（`_backward`、`_prev`、`_op`）：

| 字段 | 含义 | 为什么这么初始化 |
|---|---|---|
| `self.data` | 前向值，就是这个节点当下的数 | 直接存传进来的 `data` |
| `self.grad` | 最终输出对本节点的偏导 | 初始 `0`，因为它是个**累加器**，反传时用 `+=` 往上加 |
| `self._backward` | 把梯度往输入们回传的局部函数 | 默认 `lambda: None`，一个**空操作** |
| `self._prev` | 产生本节点的那些**输入节点** | `set(_children)`，建图用 |
| `self._op` | 产生本节点的运算名 | 仅供调试/可视化，**不参与计算** |

<div class="mg-why"><strong>为什么</strong> <code>_backward</code> 默认是 <code>lambda: None</code>：刚 new 出来的"叶子节点"（比如一个输入、一个权重）没有任何上游输入，回传时本就无事可做，所以默认挂一个什么都不干的空函数。等它被某个运算"生"出来时，对应的运算方法会把这个空函数**覆盖**成真正会干活的闭包。</div>

<div class="mg-note"><strong>关键</strong>：<code>_prev = set(_children)</code> 用 <code>set</code> 而不是直接存元组，是为了**去重**——比如 <code>a + a</code> 传进来的 children 是 <code>(a, a)</code>，收成 <code>{a}</code> 后图里同一条输入边不会重复；而 <code>_op</code> 只是个字符串标签（<code>'+'</code>、<code>'*'</code>、<code>'ReLU'</code>），画图和 debug 用，删了也不影响算梯度。</div>

`_children` 默认是空元组 `()`，所以**手动创建的 Value 是叶子节点**，`_prev` 为空集；只有被运算"生"出来的节点才有上游。

## `__add__`：加法，顺手把"边"记下来 <span class="mg-b mg-core">必读</span>

接下来四个运算是全篇的心脏。先记住一句口诀——每个运算符都做**三件事**：

<div class="mg-card"><strong>运算符的"三件事"</strong><br/>① <strong>算</strong>：算出 <code>out.data</code>（前向值）<br/>② <strong>记</strong>：用 <code>(self, other)</code> + <code>_op</code> 记下这条边，建 DAG<br/>③ <strong>挂</strong>：定义 <code>_backward</code> 闭包并挂到 <code>out._backward</code> 上</div>

对着加法看这三件事：

```python
    def __add__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data + other.data, (self, other), '+')

        def _backward():
            self.grad += out.grad
            other.grad += out.grad
        out._backward = _backward

        return out
```

逐行拆：

- `other = other if isinstance(other, Value) else Value(other)`：**类型归一**。如果 `other` 已经是 `Value` 就原样用；否则它是个裸数字（`a + 1` 里的 `1`），就地包成 `Value(1)`。没有这一步，下一行的 `other.data` 会因为裸 `int` 没有 `.data` 而报错。
- `out = Value(self.data + other.data, (self, other), '+')`：**整篇最该盯住的一行**，三件事里的"算"和"记"全在这一次构造里完成——`self.data + other.data` 算出前向和（算）；`(self, other)` 作为 `_children` 传进去，于是 `out._prev = {self, other}`，等于记下了 `out → self`、`out → other` 两条边（记）；`'+'` 给它贴上运算标签。**一行之内，数也算了，图也长了一个节点两条边。**
- `def _backward(): ...`：定义"挂"的内容。它描述加法该怎么把 `out` 的梯度分给两个输入。数学留到第 02 讲，这里只点一句：加法是"梯度原样分给两边"。注意它是个**闭包**，捕获了 `self`、`other`、`out`，所以即使现在 `out.grad` 还是 0，等以后被填好了，闭包读到的也是最新值。
- `out._backward = _backward`：把上面定义的真函数**覆盖**掉 `out` 默认那个 `lambda: None`。从此 `out` 知道自己该怎么回传了。
- `return out`：返回新节点，它可以继续参与下一步运算，图就这样一层层长上去。

<div class="mg-key-note"><strong>最关键</strong>：闭包是<strong>现在（前向时）定义、以后（反向时）才被调用</strong>的。前向跑一遍，不光把图建好了，还顺手给每个节点存了一份"将来怎么往回传梯度"的配方。这正是自动微分省力的根源。</div>

## `__mul__`：乘法，同一套路

```python
    def __mul__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data * other.data, (self, other), '*')

        def _backward():
            self.grad += other.data * out.grad
            other.grad += self.data * out.grad
        out._backward = _backward

        return out
```

结构和加法**一模一样**，只有两处随运算变：构造时 `'+'` 换成 `'*'`、和换成积；`_backward` 里出现了"交叉"——`self` 拿到的是 `other.data * out.grad`，`other` 拿到的是 `self.data * out.grad`。直觉上，乘积对某个因子的局部导数正是**另一个因子**。细节同样留到第 02 讲，这里只确认：建图与挂闭包的套路没变。

## `__pow__`：幂，只允许常数指数 <span class="mg-b mg-key">重点</span>

```python
    def __pow__(self, other):
        assert isinstance(other, (int, float)), "only supporting int/float powers for now"
        out = Value(self.data**other, (self,), f'**{other}')

        def _backward():
            self.grad += (other * self.data**(other-1)) * out.grad
        out._backward = _backward

        return out
```

这里有两个跟前面不同的设计：

- `assert isinstance(other, (int, float))`：**只支持常数指数**，不支持 `Value ** Value`。为什么这么限制？因为 `x**n`（n 是常数）的导数是干净的 `n*x**(n-1)`；而一般的 `a**b` 求导要牵扯对数，对搭一个基础 MLP 完全用不上。这个 `assert` 既是文档也是护栏。
- `out = Value(self.data**other, (self,), f'**{other}')`：注意 `_children` 是 `(self,)`——**只有一个输入**。因为指数 `other` 是个裸数字，从没被包成 `Value`，图里自然就没有连向它的边。`_op` 用 f-string 拼成 `'**2'` 这样的标签。

<div class="mg-note"><strong>关键</strong>：判断一个运算在图里连几条边，就看它的 <code>_children</code> 里塞了几个 <code>Value</code>。<code>__add__</code>/<code>__mul__</code> 是 <code>(self, other)</code> 两条边，<code>__pow__</code> 和 <code>relu</code> 是 <code>(self,)</code> 一条边。</div>

## `relu`：唯一的非线性

```python
    def relu(self):
        out = Value(0 if self.data < 0 else self.data, (self,), 'ReLU')

        def _backward():
            self.grad += (out.data > 0) * out.grad
        out._backward = _backward

        return out
```

- `0 if self.data < 0 else self.data`：就是 ReLU(x) = max(0, x)，用条件表达式写出来。`_children` 同样是 `(self,)`，标签 `'ReLU'`。
- 这是 micrograd 里**唯一的非线性**。它至关重要：没有它，再多层线性变换叠起来还是等价于一层线性，网络学不出弯曲的函数。
- `_backward` 里 `(out.data > 0)` 是个布尔值，被当成 0/1 用——它像一道闸门，激活时（输出>0）放梯度过去，被压成 0 时就把梯度挡住。数学细节，第 02 讲讲。

## 核心洞见：你写 `a+b`，其实在悄悄建图 <span class="mg-b mg-key">重点</span>

回头看这四个运算，它们的骨架完全一致：**算出新值 → 把输入和运算名记进新节点 → 给新节点挂一个"将来怎么回传"的闭包 → 返回它**。于是当你写下一串看似普通的表达式：

```python
z = (a * b + c).relu()
```

你并没有"先算完再单独建图"，而是在求值的**同一时刻**，自底向上长出了一棵节点树：`a*b` 是一个 `'*'` 节点，`+ c` 套出一个 `'+'` 节点，`.relu()` 再套出一个 `'ReLU'` 节点；每个节点的 `_prev` 指回自己的输入，每个节点身上都挂好了局部回传配方。

<div class="mg-why"><strong>为什么</strong>这套设计省事：等到要算梯度时，你<strong>不需要</strong>重新推导整条链路的导数公式——图已经在前向时建好，每个节点也已经各自存好了"我这一步怎么往回传"。第 02 讲的 <code>backward()</code> 要做的，只是把这些现成的局部配方按正确顺序串起来跑一遍。</div>

## 尾部那串 dunder：全靠前面三件武器拼出来 <span class="mg-b mg-key">重点</span>

文件末尾这一长串 `__neg__`/`__sub__`/`__radd__`…… 第一眼很唬人，其实**没有一个新增运算，全是一行委派**：

```python
    def __neg__(self): # -self
        return self * -1

    def __radd__(self, other): # other + self
        return self + other

    def __sub__(self, other): # self - other
        return self + (-other)

    def __rsub__(self, other): # other - self
        return other + (-self)

    def __rmul__(self, other): # other * self
        return self * other

    def __truediv__(self, other): # self / other
        return self * other**-1

    def __rtruediv__(self, other): # other / self
        return other * self**-1

    def __repr__(self):
        return f"Value(data={self.data}, grad={self.grad})"
```

它们全部转译成前面那四个**已经会建图、已经挂好 `_backward`** 的运算：

| 方法 | 实现 | 复用了谁 | 触发场景 |
|---|---|---|---|
| `__neg__` | `self * -1` | `__mul__` | `-a` |
| `__radd__` | `self + other` | `__add__` | `2 + a` |
| `__sub__` | `self + (-other)` | `__add__` + `__neg__` | `a - b` |
| `__rsub__` | `other + (-self)` | `__add__` + `__neg__` | `2 - a` |
| `__rmul__` | `self * other` | `__mul__` | `2 * a` |
| `__truediv__` | `self * other**-1` | `__mul__` + `__pow__` | `a / b` |
| `__rtruediv__` | `other * self**-1` | `__mul__` + `__pow__` | `2 / a` |

注意一个对称性细节：加法、乘法可交换，所以 `__radd__`/`__rmul__` 直接写成 `self + other`、`self * other` 就行；但减法、除法**不可交换**，所以 `__rsub__` 必须写成 `other + (-self)`（对应 `2 - a` → `2 + (-a)`）、`__rtruediv__` 写成 `other * self**-1`，顺序不能调。

<div class="mg-key-note"><strong>最关键</strong>：作者只**手写了 4 个** <code>_backward</code>（<code>+ * ** relu</code>）。减、除、取负都被拆成这四个的组合——<code>a - b</code> 其实是 <code>a + (b*-1)</code>，<code>a / b</code> 其实是 <code>a * b**-1</code>。这些底层节点各自的 <code>_backward</code> 早就备好了，所以减法、除法的梯度是<strong>"白送"的</strong>，你一行求导公式都不用补。这正是这段啰嗦代码背后的优雅。</div>

<details class="mg-fold"><summary>为什么需要 <code>__radd__</code>、<code>__rmul__</code> 这些 "r" 开头的版本？ <span class="mg-b mg-skim">可跳读</span></summary>

Python 的运算符有个回退协议。当你写 `2 + a`（左边是裸 `int`，右边是 `Value`）时，解释器先试 `(2).__add__(a)`——`int` 不认识 `Value`，返回 `NotImplemented`；于是解释器回退去调右操作数的反射方法 `a.__radd__(2)`，也就是这里的 `self + other`。`2 * a`、`2 - a`、`2 / a` 同理，分别落到 `__rmul__`/`__rsub__`/`__rtruediv__`。

所以这些 "r" 方法不是新功能，而是**让 `Value` 能站在运算符右边**和裸数字相处。没有它们，`2 + a` 会直接抛 `TypeError`。

`__repr__` 则纯粹是为了好看：`print(a)` 时打印成 `Value(data=..., grad=...)`，方便 debug，和计算/建图都无关。

</details>

## 关键点

- `Value` = **数值层**（`data` 前向值、`grad` 累加梯度）+ **图结构层**（`_prev` 输入边、`_op` 标签、`_backward` 回传配方）。
- `grad` 初始为 0、`_backward` 初始为 `lambda: None`，都是"等反传时再被填/被覆盖"的占位默认值。
- 每个运算符做**三件事**：算出 `out.data`、用 `(self, other)+_op` 记下边、定义并挂上 `out._backward`。
- **前向计算 = 建图**：你写表达式的同时，DAG 就长好了，每个节点也备好了局部回传配方。
- `__pow__` 只收常数指数、`_children` 只有 `(self,)`；`relu` 是全篇唯一非线性。
- 尾部 dunder 全部委派回 `__add__`/`__mul__`/`__pow__`，所以只需手写 4 个 `_backward`。

## 自测

1. `__init__` 里 `self._prev = set(_children)` 为什么用 `set` 包一层？去掉 `set` 直接存元组会怎样？
2. `Value(2.0) ** 3` 这个节点的 `_prev` 里有几个元素？为什么 `__pow__` 的 `_children` 只写 `(self,)`？
3. 作者只给 `+ * ** relu` 四个运算写了 `_backward`，为什么 `a - b`、`a / b` 也能正确求导？

<details class="mg-fold"><summary>参考答案 <span class="mg-b mg-skim">可跳读</span></summary>

1. 为了**去重**。比如 `a + a`，传进来的 `_children` 是 `(a, a)`，`set` 把它收成 `{a}`，图里同一条输入边就不会重复，后续遍历计算图时也天然只碰一次 `a`。要补一句：梯度的正确性其实靠 `_backward` 里的 `+=` 累加来保证（`a` 被用了两次，两份梯度要加起来），`set` 主要负责让图结构干净、遍历不重复。

2. **1 个**（只有 `self`）。因为指数 `3` 是个裸 Python 数字，从没被包成 `Value`，图里没有连向它的边——它不是一个需要求梯度的节点，只是个常数参数。`assert isinstance(other, (int, float))` 正是强制指数必须是常数 `int/float`，从而保证幂运算的导数是简单的 `n*x**(n-1)`。

3. 因为减、除会被**拆解**成那四个运算的组合：`a - b` 经 `__sub__` 变成 `a + (-b)`，即 `a + (b * -1)`，是一个 `'+'` 节点套在 `b` 的 `'*'` 节点之上；`a / b` 经 `__truediv__` 变成 `a * b**-1`，是一个 `'*'` 节点套在 `b` 的 `'**'` 节点之上。这些底层 `+`/`*`/`**` 节点早就各自挂好了 `_backward`，第 02 讲的链式法则会自动把它们串起来，所以减法、除法的导数无需另写。

</details>

## 小结与下一讲

这一讲我们看清了 micrograd 的地基：`Value` 用五个字段把"一个数"升级成"一个知道自己来历的图节点"；四个运算用同一套"算/记/挂"三件事**边算边建图**，并在每个节点身上预存一份局部回传配方；尾部那串 dunder 则全靠复用前面三件武器，把减、除、取负的梯度白白拿到手。

但到现在为止，图建好了、配方挂好了，梯度却还全是 0——因为没人去**触发**这些 `_backward`。

<div class="mg-note"><strong>下一讲预告</strong>：第 02 讲 · <code>engine.py</code> 下篇——拆 <code>backward()</code>。我们会讲它如何用<strong>拓扑排序</strong>把整张 DAG 排成正确顺序，把根节点的 <code>self.grad = 1</code> 当作起点，再<strong>逆序</strong>逐个调用 <code>v._backward()</code>，让链式法则一路流回每个叶子；同时把今天"点到为止"的加/乘/幂/ReLU 四个 <code>_backward</code> 的求导逐行讲透。</div>
