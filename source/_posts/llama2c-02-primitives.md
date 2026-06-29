---
title: "《llama2.c 源码逐行》第02讲 · 三个数值原语：rmsnorm / softmax / matmul"
date: 2026-06-29 10:33:00
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

<div class="l2-key-note"><strong>本讲</strong>：吃透 forward() 反复调用的三个底层函数——rmsnorm、softmax、matmul。把它们看懂，你就掌握了 llama2.c 推理的全部算术；剩下的工作只是用几层 for 循环，把它们按 Transformer 的顺序串起来。</div>

读过本号《nanoGPT 源码逐行》你会记得：那边是 PyTorch，张量、自动求导、`nn.Linear`、`F.softmax`、`LayerNorm` 全是现成积木。llama2.c 走到了另一个极端——纯 C、一个 `run.c`、零依赖，把**推理**用最朴素的方式裸写出来。这里没有张量类，没有 autograd，连"矩阵"这个类型都没有。所有东西都是 `float*`：一段连续的内存、一个长度。

而 Llama 与 GPT 在架构上有几处关键不同，本讲先碰到两处：**归一化用 RMSNorm 而非 LayerNorm**，以及**线性层一律没有 bias**。这两点恰好就藏在下面 rmsnorm 和 matmul 的几行代码里。

---

## ① rmsnorm：按均方根缩放 <span class="l2-b l2-core">必读</span>

```c
void rmsnorm(float* o, float* x, float* weight, int size) {
    float ss = 0.0f;
    for (int j = 0; j < size; j++) ss += x[j] * x[j];
    ss /= size; ss += 1e-5f; ss = 1.0f / sqrtf(ss);
    for (int j = 0; j < size; j++) o[j] = weight[j] * (ss * x[j]);
}
```

先看四个形参。`o`、`x`、`weight` 都是指向 `float` 数组的指针，长度都是 `size`：`x` 是输入向量（某个 token 的 `dim` 维隐藏状态），`o` 是输出向量，`weight` 是这一层可学习的逐通道缩放参数。`size` 就是向量长度。注意——这里**没有任何形状信息附着在指针上**，"这段内存有 `size` 个 float"完全靠 `size` 这个参数和调用方的约定来保证。这是读 C 版的第一道坎：指针只知道起点，不知道长度。

第一行循环 `ss += x[j] * x[j]`：把所有元素平方后累加，得到平方和 Σx²。

接下来这一行 `ss /= size; ss += 1e-5f; ss = 1.0f / sqrtf(ss);` 把同一个 `ss` 变量连续改写了三次，值得逐步拆开看：

| 语句 | `ss` 变成 | 含义 |
|---|---|---|
| `ss /= size` | (1/n)·Σx² | 均方（mean of squares） |
| `ss += 1e-5f` | 均方 + 1e-5 | 加 epsilon |
| `ss = 1.0f / sqrtf(ss)` | 1 / √(均方+ε) | 即 1/RMS，缩放因子 |

所谓 RMS（root mean square，均方根）就是 `√(均方)`，所以 `1.0f / sqrtf(均方)` 正是 **1/RMS**。函数名 rmsnorm 由此而来：用 RMS 去归一化。

<div class="l2-why"><strong>为什么</strong>加 1e-5f：如果某个 token 的隐藏状态恰好全是 0，均方就是 0，`1.0f / sqrtf(0)` 会得到 inf。加一个极小的 epsilon 兜底，保证分母永远非零、数值稳定。</div>

最后一行 `o[j] = weight[j] * (ss * x[j])`：先用缩放因子 `ss` 乘每个 `x[j]`（这一步把整个向量按 1/RMS 缩放），再逐元素乘上可学习权重 `weight[j]`。展开就是 `o[j] = weight[j] · x[j] / RMS(x)`。

关键在于把它和 nanoGPT 的 LayerNorm 摆在一起比——你会立刻看出 Llama 砍掉了什么：

| | LayerNorm（nanoGPT） | RMSNorm（llama2.c） |
|---|---|---|
| 是否中心化 | 减均值 `x − μ` | **不减均值** |
| 缩放分母 | `√(方差 + ε)` | `√(均方 + ε)` = RMS |
| 可学习参数 | `gamma` + `bias`（γ、β） | 只有 `weight`（**无 bias**） |
| 每元素运算 | `(x−μ)/σ · γ + β` | `x/RMS · weight` |

<div class="l2-note"><strong>关键</strong>：RMSNorm 比 LayerNorm 简单——不减均值（不做中心化）、没有偏置项，只做"按 RMS 缩放 + 逐通道权重"。这不是偷工减料，而是 Llama 的刻意选择：经验上效果相当，但运算更少、实现更短，正好对应你眼前这 6 行 C 代码。</div>

---

## ② softmax：减 max 再指数归一 <span class="l2-b l2-key">关键</span>

```c
void softmax(float* x, int size) {
    float max_val = x[0];
    for (int i = 1; i < size; i++) if (x[i] > max_val) max_val = x[i];
    float sum = 0.0f;
    for (int i = 0; i < size; i++) { x[i] = expf(x[i] - max_val); sum += x[i]; }
    for (int i = 0; i < size; i++) x[i] /= sum;
}
```

只有两个形参 `x` 和 `size`，而且**没有输出指针**——它是**原地（in-place）**操作，直接把结果写回 `x` 自己。这一点和 rmsnorm 不同，调用前要清楚 `x` 里的原始值会被覆盖掉。

三段循环对应三个步骤：

1. **找最大值**。`max_val` 先初始化为 `x[0]`，所以扫描从 `i = 1` 开始，遍历找出整段里的最大元素。
2. **减 max、取 exp、求和**。`x[i] = expf(x[i] - max_val)` 把每个元素减去 `max_val` 再做指数，同时 `sum += x[i]` 把它们累加起来。
3. **归一化**。`x[i] /= sum`，每个元素除以总和，得到一组和为 1 的概率。

整段算的就是标准 softmax：`x_i ← exp(x_i − max) / Σ_j exp(x_j − max)`。

<div class="l2-why"><strong>为什么</strong>先减 max：`expf` 对大正数会指数爆炸——比如 `expf(89.0f)` 在 float 下就溢出成 inf，后面全盘崩坏。而 softmax 有个性质：给所有输入同时加减一个常数，结果不变（常数在分子分母里约掉了）。所以减去最大值是"免费"的——数学结果一模一样，但让最大那一项的指数变成 `exp(0)=1`、其余都 ≤ 1，彻底杜绝溢出。这正是 PyTorch 的 `F.softmax` 内部默默替你做的事，这里把它手写了出来。</div>

<div class="l2-note"><strong>关键</strong>：forward() 里 softmax 会用在两处——把注意力打分（scores）变成注意力权重，以及把最后的 logits 变成采样用的概率分布。两处都是原地改写传进来的那段缓冲区。</div>

---

## ③ matmul：两层 for 的矩阵-向量乘 <span class="l2-b l2-core">必读</span>

```c
void matmul(float* xout, float* x, float* w, int n, int d) {
    // W (d,n) @ x (n,) -> xout (d,)；by far the most time is spent here
    int i;
    #pragma omp parallel for private(i)
    for (i = 0; i < d; i++) {
        float val = 0.0f;
        for (int j = 0; j < n; j++) val += w[i * n + j] * x[j];
        xout[i] = val;
    }
}
```

这是整个文件里最重要、也最耗时的函数。注释写得很直白：`W (d,n) @ x (n,) -> xout (d,)`，做的是矩阵 `W` 乘向量 `x`。把形状对齐看清楚：

- `x` 是输入向量，长度 `n`；
- `w` 是 `d × n` 的权重矩阵；
- `xout` 是输出向量，长度 `d`。

换句话说，这就是一个线性层 `y = W·x`：输入维度 `n`，输出维度 `d`。对照 nanoGPT，它等价于 `nn.Linear(n, d, bias=False)`——**注意没有 bias**，这又一次印证了 Llama 线性层一律无偏置，所以这里只有乘加、没有加 bias 的那一步。

接下来是本讲最该刻进脑子的一句：**C 里没有二维数组，"矩阵"就是一段一维 `float` 数组 + 行优先（row-major）的索引约定**。`W` 在内存里是连续的 `d*n` 个 float，第 `i` 行第 `j` 列的元素位置就是 `w[i * n + j]`。`i * n` 把指针跳到第 `i` 行的开头，`+ j` 再在行内偏移到第 `j` 列。

举个具体例子，设 `d=2, n=3`，矩阵 `W = [[W00,W01,W02],[W10,W11,W12]]`，它在内存里平铺成：

| 一维索引 | 0 | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|---|
| 逻辑位置 | W[0][0] | W[0][1] | W[0][2] | W[1][0] | W[1][1] | W[1][2] |
| 代码取法 | `w[0*3+0]` | `w[0*3+1]` | `w[0*3+2]` | `w[1*3+0]` | `w[1*3+1]` | `w[1*3+2]` |

于是两层循环就清楚了：外层 `i` 走 `0..d`，对应输出的每一行；内层 `j` 走 `0..n`，用 `val += w[i * n + j] * x[j]` 把 `W` 的第 `i` 行和 `x` 做点积；算完 `xout[i] = val` 落盘。一个输出元素 = 一行点积，`d` 个输出就是 `d` 次点积。

<div class="l2-note"><strong>关键</strong>：`w[i * n + j]` 这个索引是 llama2.c 全篇的命脉。整个模型的权重最终都是一根根扁平 `float` 数组，靠 `行号 * 行宽 + 列号` 来寻址。回忆上一讲（mmap），权重就是这么从文件里一段段切出来的——今天把这条寻址公式焊死，后面 `forward` 里满屏都是它。</div>

再看并行那行 `#pragma omp parallel for private(i)`：

<details class="l2-fold"><summary>OpenMP 这行到底做了什么 <span class="l2-b l2-skim">可跳读</span></summary>

`#pragma omp parallel for` 让编译器把外层这 `d` 次循环拆给多个 CPU 线程并行跑。为什么能放心并行？因为每个 `i` 只写自己的 `xout[i]`、只读共享的 `w` 和 `x`，迭代之间互不干扰——这是典型的"易并行"（embarrassingly parallel）。

`private(i)` 是说给每个线程一份自己的循环变量 `i`，避免线程间抢同一个 `i` 出错。注意内层的 `j` 和累加器 `val` 都是在循环体里 `int j` / `float val` 声明的，本就是线程私有，只有外层的 `int i` 声明在循环外，才需要显式 `private`。

还有个好处：如果编译时没开 `-fopenmp`，这条 `#pragma` 会被直接忽略，函数自动退化成单线程串行版照样能跑——这正是 llama2.c"哪儿都能编、CPU 就能推理"的底气。

</details>

<div class="l2-why"><strong>为什么</strong>注释说"by far the most time is spent here"：Transformer 的绝大部分浮点运算量都集中在几个大矩阵乘上——Q/K/V 投影、注意力输出投影、FFN 的两三个大矩阵。这些全都走 matmul。所以哪怕函数只有几行，它才是真正吃满 CPU 的地方，也因此唯独它挂了并行 pragma。</div>

---

## 关键点

<div class="l2-card"><strong>三原语速查</strong><br/>rmsnorm(o, x, weight, size)：o = weight ⊙ x / √(mean(x²)+1e-5)；逐通道缩放，不减均值、无 bias<br/>softmax(x, size)：原地，x ← exp(x−max) / Σ exp(x−max)；减 max 纯为防溢出，结果不变<br/>matmul(xout, x, w, n, d)：xout(d) = W(d,n) · x(n)；w 行优先寻址 w[i*n+j]，无 bias，性能热点 + OpenMP 并行</div>

- **C 里矩阵 = 一维 `float` 数组 + `w[i*n+j]` 行优先索引**，没有张量类型，长度全靠参数约定。
- **rmsnorm 比 LayerNorm 简单**：不中心化、无偏置，只做"按 RMS 缩放 + 逐通道权重"——Llama 的选择。
- **softmax 减 max 是数值安全技巧**，不改变数学结果，只防 `expf` 溢出；且它是原地改写。
- **matmul 是运行时瓶颈**，独享 `#pragma omp` 并行；线性层无 bias，对应 Llama 架构。
- 三个原语 + 几层 for 循环，就足以拼出整个 Transformer——这是 llama2.c 最震撼的地方。

---

## 自测

<details class="l2-fold"><summary>自测 1：rmsnorm 里那个 ss 被改写了几次，各代表什么 <span class="l2-b l2-skim">看答案</span></summary>

同一个 `float ss` 被复用、连改三次：先在循环里累成**平方和** Σx²；`ss /= size` 变成**均方**（平方均值）；`ss += 1e-5f` 加上 **epsilon** 防止为零；`ss = 1.0f / sqrtf(ss)` 变成 **1/RMS** 缩放因子。最后 `o[j] = weight[j] * (ss * x[j])` 用它去缩放每个元素并乘权重。

</details>

<details class="l2-fold"><summary>自测 2：softmax 为什么先减 max？不减会怎样？数学结果会变吗 <span class="l2-b l2-skim">看答案</span></summary>

减 max 是为了**数值稳定**：`expf` 遇到较大正数会溢出成 inf，整段就崩了。softmax 对"所有输入同加同一常数"具有不变性（常数在分子分母约掉），所以减去最大值后**数学结果完全不变**，只是把最大项的指数压到 `exp(0)=1`、其余 ≤ 1，避免溢出。不减的话，输入一大就可能 inf/NaN。

</details>

<details class="l2-fold"><summary>自测 3：matmul 里 w[i*n+j] 为何这么写？取 W 第 2 行第 3 列（从 0 数）该写什么？n、d 哪个是输出维度 <span class="l2-b l2-skim">看答案</span></summary>

因为 `W` 是 `d×n` 矩阵以**行优先**铺成一维数组：第 `i` 行起点在 `i*n`，行内再偏移 `j`，故第 `i` 行第 `j` 列是 `w[i*n+j]`。第 2 行第 3 列写 `w[2*n+3]`。`d` 是**输出维度**（外层循环 `d` 次、`xout` 有 `d` 个元素），`n` 是输入维度（内层点积长度、`x` 有 `n` 个元素）。

</details>

---

## 小结与下一讲

这一讲我们把 llama2.c 的三块"算术地基"逐行拆开了：rmsnorm 用均方根做无偏置、不中心化的归一化；softmax 靠减 max 在指数前稳住数值；matmul 用两层 for 把"一维数组 + 行优先索引"当矩阵来乘，并独享 OpenMP 并行。它们加起来不到二十行 C，却是整个推理过程里唯一真正在做浮点运算的地方。

这三个原语本身简单到一眼能看穿，但它们就是整个 Transformer 的全部"积木"——结构体（第 00 讲）和权重加载（第 01 讲）我们都铺好了，算术地基也焊死了，接下来该把它们拼成模型了。**下一讲（第 03 讲）** 进 `forward` 的心脏：看 llama2.c 怎么用 rmsnorm + matmul + softmax 这几块积木，配上 RoPE 旋转位置编码、KV cache 与 GQA，把一层注意力裸手拼出来。今天焊死的 `w[i*n+j]` 和这三个 for 循环，马上就要在真实模型里反复出现。
