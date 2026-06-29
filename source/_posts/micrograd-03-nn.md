---
title: "《micrograd 源码逐行》第03讲 · nn.py：用 Value 搭一个神经网络"
date: 2026-06-29 09:34:00
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

<div class="mg-key-note"><strong>最关键</strong>：nn.py 不到 70 行，却搭出了一个能训练的神经网络。它的全部魔法浓缩成一句话——网络里每个权重都是上一讲的 <code>Value</code>，所以前向跑一遍就把整张计算图建好了，第 02 讲的 <code>backward()</code> 自然能把梯度一路送回每个权重。nn.py 自己<strong>不写一行求导代码</strong>。</div>

上一讲我们把 `Value` 这种「会自己求导的数」拆透了：它记得自己是怎么算出来的，调一次 `backward()` 就能把梯度沿计算图回灌。这一讲我们看 micrograd 怎么用这种数搭出真正的神经网络——而你会发现，它做的事情朴素到近乎「只是把 `Value` 拼起来」。

```python
import random
from micrograd.engine import Value
```

<div class="mg-note"><strong>关键</strong>：开篇只导入两样东西——<code>random</code> 用来随机初始化权重，<code>Value</code> 就是上一讲那个自动微分引擎。下面四个类做的全部事情，就是把 <code>Value</code> 的 <code>*</code> / <code>+</code> / <code>relu()</code> 按网络结构组合起来。</div>

## 先看全貌

文件里四个类，一个基类加三个积木，层层套娃：

| 类 | 角色 | 由什么组成 | 核心方法 |
| --- | --- | --- | --- |
| `Module` | 公共基类 | —— | `zero_grad` / `parameters` |
| `Neuron` | 单个神经元 | `nin` 个权重 `Value` + 1 个偏置 `Value` | `__call__` 算 `w·x+b` 再 ReLU |
| `Layer` | 一排神经元 | `nout` 个 `Neuron` | `__call__` 把 `x` 喂给每个神经元 |
| `MLP` | 多层网络 | 若干 `Layer` | `__call__` 逐层接力 |

<div class="mg-why"><strong>为什么这样分</strong>：四个类全部继承自 <code>Module</code>（共享「我有哪些可训练参数」这套接口），而网络结构是靠<strong>组合</strong>搭出来的——<code>MLP</code> 装着 <code>Layer</code>、<code>Layer</code> 装着 <code>Neuron</code>、<code>Neuron</code> 装着 <code>Value</code>。一句话：继承管接口，组合管结构。</div>

## 逐类拆解

### Module：把「有哪些参数」抽象出来

```python
class Module:

    def zero_grad(self):
        for p in self.parameters():
            p.grad = 0

    def parameters(self):
        return []
```

`Module` 只定义了两个方法，是所有网络组件的共同契约。

`zero_grad` 遍历 `self.parameters()`，把每个参数的 `.grad` 清成 0。

<div class="mg-why"><strong>为什么必须清零</strong>：上一讲 <code>backward()</code> 里每个节点是 <code>self.grad += ...</code>——梯度是<strong>累加</strong>的（因为一个节点可能被多处用到，多元链式法则要求把各路贡献相加）。这意味着如果不在每轮反传前手动归零，上一轮的旧梯度会残留并叠进这一轮，更新方向就错了。所以 <code>zero_grad</code> 是训练循环里每次 <code>backward()</code> 之前雷打不动的动作。</div>

`parameters` 默认返回空列表 `[]`，留给子类重写。

<div class="mg-note"><strong>关键</strong>：基类默认 <code>parameters()</code> 返回 <code>[]</code>，保证任何 <code>Module</code> 都「有参数可问」。正因如此，<code>Layer</code>/<code>MLP</code> 才能放心地对下层「层层收集、拍平成一个大列表」而不用担心谁没这个方法。</div>

### Neuron：一个神经元就是 `w·x+b` 再过激活 <span class="mg-b mg-core">必读</span>

```python
class Neuron(Module):

    def __init__(self, nin, nonlin=True):
        self.w = [Value(random.uniform(-1,1)) for _ in range(nin)]
        self.b = Value(0)
        self.nonlin = nonlin

    def __call__(self, x):
        act = sum((wi*xi for wi,xi in zip(self.w, x)), self.b)
        return act.relu() if self.nonlin else act

    def parameters(self):
        return self.w + [self.b]

    def __repr__(self):
        return f"{'ReLU' if self.nonlin else 'Linear'}Neuron({len(self.w)})"
```

**`__init__`** 准备这个神经元的全部家当：

- `self.w = [Value(random.uniform(-1,1)) for _ in range(nin)]`：`nin` 个权重，每个是一个包了随机小数的 `Value`。
- `self.b = Value(0)`：一个偏置，初值 0。
- `self.nonlin = nonlin`：记下要不要套激活，留给 `__call__` 用。

<div class="mg-why"><strong>为什么权重要包成 <code>Value</code></strong>：只有 <code>Value</code> 才带 <code>.grad</code> 和反向传播的本事。写成 <code>Value(random.uniform(-1,1))</code>，每个权重就既是一个具体数值、又是计算图里一个能被求导的叶子节点——这是整篇 nn.py 能训练的根。随机初始化则是为了<strong>打破对称</strong>：若同层权重都一样，这些神经元会学到一模一样的东西，等于白堆。偏置从 0 起步是常见做法。</div>

**`__call__`** 是整个文件最该盯住的一行：

`act = sum((wi*xi for wi,xi in zip(self.w, x)), self.b)`

逐段拆：

- `zip(self.w, x)`：把权重和输入一一配对。
- `wi*xi for ...`：一个生成器，逐对相乘。这里的 `*` 是上一讲给 `Value` 定义的 `__mul__`，每乘一次就在计算图里添一个乘法节点。
- `sum(..., self.b)`：Python 内置 `sum` 的<strong>第二个参数是累加起点</strong>。于是结果是 `self.b + w0*x0 + w1*x1 + ...`，正好等于 `w·x + b`。

<div class="mg-key-note"><strong>最关键的一行</strong>：<code>sum</code> 的第二参把 <code>self.b</code> 当累加起点，于是「点积 + 偏置」一行写完，且全程是 <code>Value</code> 运算——这一句就在计算图里建好了这个神经元的所有乘法和加法节点。</div>

<div class="mg-why"><strong>为什么用 <code>self.b</code> 而不是默认起点</strong>：<code>sum</code> 不传第二参时起点是整数 <code>0</code>，那只会算出 <code>w·x</code>，<strong>偏置被漏掉</strong>（这是语义 bug，不是风格问题）。直接拿 <code>self.b</code> 起头，既把偏置自然纳进求和，又省得依赖「<code>0 + Value</code>」这种要靠上一讲 <code>__radd__</code> 兜底的写法。</div>

`return act.relu() if self.nonlin else act`：要激活就调 `relu()`（上一讲的 ReLU，在图里再加一个节点、引入非线性），否则把线性结果原样返回。

<div class="mg-why"><strong>为什么要有 <code>nonlin</code> 开关</strong>：隐藏层必须有非线性，否则一堆线性层叠起来等价于一个线性层，深度白费；而输出层往往要<strong>线性</strong>的原始值（回归值、未归一化的分数）。一个布尔开关，就让同一个 <code>Neuron</code> 类两用。</div>

**`parameters`** 返回 `self.w + [self.b]`：列表拼接，所有权重再加上偏置——恰好是这个神经元里全部需要求梯度、被更新的 `Value`。

**`__repr__`** 只是给 `print` 看的，输出像 `ReLUNeuron(3)`，标出类型和扇入数。<span class="mg-b mg-skim">可跳读</span> `Layer` 和 `MLP` 的 `__repr__` 同理（把下层 `str` 拼起来），后面不再单独讲。

### Layer：一排神经元并排站

```python
class Layer(Module):

    def __init__(self, nin, nout, **kwargs):
        self.neurons = [Neuron(nin, **kwargs) for _ in range(nout)]

    def __call__(self, x):
        out = [n(x) for n in self.neurons]
        return out[0] if len(out) == 1 else out

    def parameters(self):
        return [p for n in self.neurons for p in n.parameters()]

    def __repr__(self):
        return f"Layer of [{', '.join(str(n) for n in self.neurons)}]"
```

**`__init__`**：建 `nout` 个 `Neuron`，每个都吃 `nin` 个输入。`**kwargs` 把 `nonlin` 这类参数原样透传给每个神经元，所以「整层线性还是 ReLU」由建层时一次性指定。

**`__call__`**：

- `out = [n(x) for n in self.neurons]`：把<strong>同一个 `x`</strong> 喂给本层每个神经元，收集输出（每个输出是一个 `Value`）。
- `return out[0] if len(out) == 1 else out`：如果这层只有一个神经元，就从单元素列表里把它解包出来，直接返回标量 `Value`；否则返回列表。

<div class="mg-note"><strong>关键</strong>：单神经元时<strong>解包</strong>返回 <code>out[0]</code> 而非 <code>[out[0]]</code>，是为了让「最后一层只有一个输出」的网络直接吐出一个 <code>Value</code>，而不是 <code>[Value]</code>——下游算 loss 时就不必再 <code>[0]</code> 一下。</div>

**`parameters`**：`[p for n in self.neurons for p in n.parameters()]`，嵌套列表推导，把每个神经元的参数<strong>拍平</strong>成一个大列表。

### MLP：把 Layer 串成多层网络

```python
class MLP(Module):

    def __init__(self, nin, nouts):
        sz = [nin] + nouts
        self.layers = [Layer(sz[i], sz[i+1], nonlin=i!=len(nouts)-1) for i in range(len(nouts))]

    def __call__(self, x):
        for layer in self.layers:
            x = layer(x)
        return x

    def parameters(self):
        return [p for layer in self.layers for p in layer.parameters()]

    def __repr__(self):
        return f"MLP of [{', '.join(str(layer) for layer in self.layers)}]"
```

**`__init__`**：

- `sz = [nin] + nouts`：把输入维度拼在各层输出维度之前，凑出一串「尺寸」。以 `MLP(3, [4, 4, 1])` 为例，`sz = [3, 4, 4, 1]`。
- `self.layers = [Layer(sz[i], sz[i+1], nonlin=i!=len(nouts)-1) for i in range(len(nouts))]`：建 `len(nouts)` 层，第 `i` 层从 `sz[i]` 维映到 `sz[i+1]` 维，相邻尺寸首尾相接。

<div class="mg-note"><strong>读法</strong>：<code>nonlin=i!=len(nouts)-1</code> 按运算优先级是 <code>nonlin = (i != (len(nouts)-1))</code>——除了最后一层（<code>i</code> 等于最后下标）之外都为 <code>True</code>。于是隐藏层带 ReLU、输出层线性。</div>

接着上面的例子，`MLP(3, [4, 4, 1])` 会建出三层：`Layer(3→4, ReLU)`、`Layer(4→4, ReLU)`、`Layer(4→1, 线性)`。最后一层只有一个神经元，所以 `Layer.__call__` 会解包返回一个标量 `Value`——整张网络的输出就是一个数。

**`__call__`**：

- `for layer in self.layers: x = layer(x)`：前向就是把上一层的输出当下一层的输入，顺序流过去。
- `return x`：最后那层的输出即网络输出。

<div class="mg-key-note"><strong>前向即建图</strong>：<code>x = layer(x)</code> 这一圈跑下来，每层内部的乘、加、ReLU 全是 <code>Value</code> 运算，于是从输入到输出的整张计算图<strong>边算边建</strong>好了。等你拿最终这个 <code>Value</code> 算出 loss、再调 <code>loss.backward()</code>，梯度就能顺着这张图一路回灌到每个权重的 <code>.grad</code>。</div>

**`parameters`**：把每层的参数再拍平一次，得到整网的参数列表——`zero_grad` 和优化器更新就全靠它一把抓。

## nn 与 engine 的接口 <span class="mg-b mg-key">重点</span>

<div class="mg-key-note"><strong>一句话接口</strong>：nn.py <strong>不碰任何求导逻辑</strong>，它只负责把 <code>Value</code> 的 <code>*</code> / <code>+</code> / <code>relu()</code> 按网络结构拼起来；求导全交给上一讲 engine.py 的 <code>backward()</code>。权重是 <code>Value</code> → 前向建图 → <code>backward()</code> 回传梯度 —— 这就是两个文件的全部交界面。</div>

把这条接口落到一个完整训练循环上，大致是这五步（<span class="mg-b mg-skim">可跳读</span> 下一讲细讲，这里先建立全景）：

1. `scores = model(x)`：前向，顺手把计算图建好，得到输出 `Value`。
2. `loss = ...(scores, y)`：用 `Value` 运算算损失，结果仍是一个 `Value`，挂在同一张图上。
3. `model.zero_grad()`：清掉上一轮残留的梯度。
4. `loss.backward()`：梯度沿图回传，填好每个 `p.grad`。
5. `for p in model.parameters(): p.data -= lr * p.grad`：沿负梯度方向微调每个权重，然后回到第 1 步。

看清楚了吗——`model(x)`、`model.parameters()`、`model.zero_grad()` 来自这一讲，`backward()` 来自上一讲，`loss` 和更新是下一讲。三块严丝合缝地咬在一起，全靠「权重是 `Value`」这一个设计。

## 关键点速查

<div class="mg-card"><strong>本讲速查</strong><br/>· <code>Module</code>：<code>parameters()</code> 默认 <code>[]</code>；<code>zero_grad()</code> 把所有参数 <code>.grad=0</code>，每轮反传前必做<br/>· <code>Neuron</code>：<code>nin</code> 个权重 <code>Value</code> + 偏置 <code>Value(0)</code>；<code>__call__</code> 用 <code>sum(..., self.b)</code> 算 <code>w·x+b</code>，再按 <code>nonlin</code> 决定是否 ReLU<br/>· <code>Layer</code>：<code>nout</code> 个 <code>Neuron</code> 并排；单输出时解包成标量 <code>Value</code><br/>· <code>MLP</code>：<code>sz=[nin]+nouts</code> 逐层接力，末层线性；<code>parameters()</code> 层层拍平<br/>· 接口：权重是 <code>Value</code> → 前向建图 → <code>backward()</code> 回传梯度，nn 自己不求导</div>

## 自测

<details class="mg-fold"><summary>自测：3 道题，先想再展开 <span class="mg-b mg-skim">可跳读</span></summary>

**Q1.** 为什么训练时每轮 `backward()` 之前都要先 `zero_grad()`？

**Q2.** `act = sum((wi*xi for wi,xi in zip(self.w, x)), self.b)` 里第二个参数 `self.b` 是干嘛的？如果删掉它、写成 `sum(wi*xi for ...)` 会怎样？

**Q3.** `MLP(3, [4, 4, 1])` 会建出几层？最后一层为什么是线性的？整个网络一共有多少个参数？

---

**答案**

**A1.** 因为上一讲 engine 里梯度是累加的（`self.grad += ...`，多元链式法则要求一个节点把它在各处的梯度贡献相加）。不清零的话，上一轮的旧梯度会残留并叠进这一轮，参数更新方向就被污染了。所以每轮必须先归零再 `backward()`。

**A2.** 它是累加起点，让结果等于 `self.b + w0*x0 + ... = w·x + b`，一行写完「点积 + 偏置」，且全程 `Value` 运算、自动建图。删掉它，`sum` 会从整数 `0` 起步，算出来只剩 `w·x`、偏置被漏掉——这是语义 bug，不是风格问题。

**A3.** 3 层（`len(nouts)==3`）：`Layer(3→4, ReLU)`、`Layer(4→4, ReLU)`、`Layer(4→1, 线性)`。最后一层线性是为了输出未经压缩的原始值（回归值/分数）；若也套 ReLU，会把负的输出强行截成 0、丢掉信息。参数数 = `(3×4+4) + (4×4+4) + (4×1+1)` = 16 + 20 + 5 = **41** 个。

</details>

## 小结与下一讲预告

这一讲我们看清了 nn.py 的真相：它就是<strong>用 `Value` 搭积木</strong>。`Module` 立下「我有哪些参数」的接口，`Neuron`/`Layer`/`MLP` 三级组合搭出结构，前向一跑即建图，求导整包外包给 engine。整个文件没有一行求导代码却完全可训练——这正是把自动微分引擎设计干净之后的红利。

下一讲，我们把 engine 和 nn 正式接起来：写损失函数、写 SGD 训练循环，亲眼看着 `loss` 一步步下降，并把 `zero_grad → backward → 更新` 这三步如何严丝合缝地配合彻底讲透。
