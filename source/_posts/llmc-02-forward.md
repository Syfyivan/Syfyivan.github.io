---
title: "《llm.c 源码逐行》第02讲 · 前向层（一）：encoder / layernorm / matmul / gelu / residual"
date: 2026-06-29 11:03:00
tags: [AI, 深度学习, LLM, GPT-2, llm.c, C语言, 反向传播, 源码解析, 课程]
categories: [技术笔记]
toc: true
visibility: public
---

<style>
.lc-b{display:inline-block;font-size:12px;font-weight:700;padding:1px 8px;border-radius:999px;vertical-align:middle;margin-left:6px;line-height:1.7;white-space:nowrap}
.lc-core{color:#fff;background:#b73a2c}
.lc-key{color:#b73a2c;background:rgba(183,58,44,.1);border:1px solid rgba(183,58,44,.3)}
.lc-skim{color:#3f5d7e;background:rgba(63,93,126,.1);border:1px solid rgba(63,93,126,.25)}
.lc-note{margin:14px 0;padding:12px 16px;border-left:3px solid #3f5d7e;background:rgba(63,93,126,.06);border-radius:0 4px 4px 0}
.lc-why{margin:14px 0;padding:12px 16px;border-left:3px solid #69727d;background:rgba(105,114,125,.07);border-radius:0 4px 4px 0;color:#3a4049}
.lc-key-note{margin:14px 0;padding:12px 16px;border-left:3px solid #b73a2c;background:rgba(183,58,44,.06);border-radius:0 4px 4px 0}
.lc-fold{margin:14px 0;border:1px solid rgba(29,33,39,.14);border-radius:6px;background:#fafafa;padding:0 16px}
.lc-fold>summary{cursor:pointer;padding:12px 0;font-weight:700;color:#1d2127}
.lc-fold[open]{padding-bottom:8px}
.lc-card{margin:16px 0;padding:14px 18px;border:1px solid rgba(183,58,44,.25);border-radius:8px;background:rgba(183,58,44,.03)}
html[data-user-color-scheme="dark"] .lc-note{background:rgba(126,168,224,.1);border-left-color:#7ea8e0;color:#c9cdd4}
html[data-user-color-scheme="dark"] .lc-why{background:rgba(255,255,255,.04);border-left-color:#8b93a0;color:#aeb4be}
html[data-user-color-scheme="dark"] .lc-key-note{background:rgba(224,108,92,.12);border-left-color:#e0746b;color:#d6dae0}
html[data-user-color-scheme="dark"] .lc-fold{background:rgba(255,255,255,.03);border-color:rgba(255,255,255,.14)}
html[data-user-color-scheme="dark"] .lc-fold>summary{color:#e6e8ec}
html[data-user-color-scheme="dark"] .lc-card{background:rgba(224,108,92,.08);border-color:rgba(224,108,92,.3);color:#d6dae0}
html[data-user-color-scheme="dark"] .lc-key{color:#ef9a8e;background:rgba(224,108,92,.14);border-color:rgba(224,108,92,.4)}
html[data-user-color-scheme="dark"] .lc-skim{color:#9fc1ec;background:rgba(126,168,224,.14);border-color:rgba(126,168,224,.35)}
</style>

## 本讲定位

<div class="lc-key-note"><strong>本讲定位</strong>：上一讲我们把 GPT-2 的全部参数在内存里摊成了一条连续的 <code>float</code> 数组；这一讲开始顺着 forward 走一遍，先啃掉注意力之外的 5 个"简单层"——encoder、layernorm、matmul、gelu、residual。它们和 nanoGPT 里的层一一对应，只是从 PyTorch 算子退化成了裸 C 的 <code>float*</code> 加 for 循环。记住一句话就能看懂这一讲所有循环的形状：<strong>除了注意力，每一层都在 (b,t) 上各算各的</strong>，token 之间在这里互不通信。本讲只讲 forward，每个层的 backward 留到第 04 讲。</div>

这几个函数放在一起看，会发现一个朴素的事实：所谓"前向传播"，在最底层就是**几层嵌套 for 循环，把一堆 float 加加乘乘**。micrograd 里 `a + b` 会 new 一个 `Value` 节点、挂一个 `_backward`；到了 llm.c，一次 forward 就是一段 for 循环扫过 `float*`，没有图、没有节点。等到第 04 讲我们会看到，每个 forward 都配一个手写的 backward，靠 `+=` 累加梯度——和 micrograd 一模一样的种子，只是标量长成了张量。

先约定本系列通用的形状记号（GPT-2 small 的取值放在括号里）：

| 记号 | 含义 | 典型值 |
|---|---|---|
| `B` | batch size，一批几条序列 | 4 |
| `T` | 序列长度，即 token 个数（time steps） | ≤ 1024 |
| `C` | channels，embedding 维度（nanoGPT 里的 `n_embd`） | 768 |
| `OC` | output channels，线性层的输出维度 | 视层而定 |
| `V` | 词表大小（vocab size） | 50257 |

### 读码前提：(B,T,C) 在内存里是一条直线 <span class="lc-b lc-core">必读</span>

后面每个函数你都会看到 `out + b * T * C + t * C` 这种指针算术，先把它讲透，剩下的就都是顺水推舟。

llm.c 里所有"张量"都不是什么结构体，就是一块裸内存（`float*`）。一个逻辑上 `(B, T, C)` 的张量，按 **row-major（行优先）** 平铺成长度 `B*T*C` 的一维数组，元素 `(b, t, i)` 的下标是：

```c
b * (T * C) + t * C + i
```

<div class="lc-why"><strong>为什么</strong>：你可以把它读成"先跳过 b 条完整序列（每条 <code>T*C</code> 个 float），再跳过 t 个 token（每个 <code>C</code> 个 float），最后落到第 i 个通道"。于是 <code>out + b*T*C + t*C</code> 就是一个指向 <strong>第 (b,t) 个 token 那一行（长 C）起点</strong>的指针，拿到它之后 <code>out_bt[i]</code> 就是这一行的第 i 个数。</div>

记住这个"切出 (b,t) 行"的动作，下面 5 个函数里它会反复出现。

### 1. encoder_forward：token 嵌入 + 位置嵌入 <span class="lc-b lc-core">必读</span>

```c
void encoder_forward(float* out, int* inp, float* wte, float* wpe, int B, int T, int C) {
    for (int b = 0; b < B; b++) for (int t = 0; t < T; t++) {
        float* out_bt = out + b * T * C + t * C;
        int ix = inp[b * T + t];                 // token id
        float* wte_ix = wte + ix * C;            // token 嵌入行
        float* wpe_t = wpe + t * C;              // 位置嵌入行
        for (int i = 0; i < C; i++) out_bt[i] = wte_ix[i] + wpe_t[i]; // 相加
    }
}
```

这是整个网络的入口，把整数 token id 变成向量。注意三个指针类型不一样：

- `inp` 是 `int*`，形状 `(B, T)`——这是**整数 token id**，不是浮点。`inp[b*T+t]` 取出第 (b,t) 个位置上的 token id，记为 `ix`。
- `wte` 是 token 嵌入表，形状 `(V, C)`，每行是一个 token 的向量。`wte + ix*C` 就是第 `ix` 行（用 token id 当行号去查表，这就是"embedding lookup"）。
- `wpe` 是位置嵌入表，形状 `(maxT, C)`，每行对应一个**位置**。`wpe + t*C` 是第 `t` 行。

最后一行 `out_bt[i] = wte_ix[i] + wpe_t[i]`，把"这个 token 是什么"和"它在第几个位置"两条 C 维向量逐元素相加，写进输出。

<div class="lc-note"><strong>关键</strong>：位置嵌入用的下标是 <code>t</code>，<strong>不带 b</strong>——同一个位置在整批数据里共享同一行位置向量；而 token 嵌入用的是 <code>ix</code>（token id），跟 b、t 都没有直接关系，只看"这个格子里装的是哪个词"。</div>

最外层 `for b for t` 第一次出现：每个 (b,t) 输出只依赖自己那一个 token，彼此独立。这正是开头那句话的第一例证。

### 2. layernorm_forward：逐 token 归一化，并把统计量缓存起来 <span class="lc-b lc-core">必读</span>

```c
void layernorm_forward(float* out, float* mean, float* rstd, float* inp, float* weight, float* bias, int B, int T, int C) {
    float eps = 1e-5f;
    for (int b = 0; b < B; b++) for (int t = 0; t < T; t++) {
        float* x = inp + b * T * C + t * C;
        float m = 0.0f; for (int i=0;i<C;i++) m += x[i]; m = m/C;          // 均值
        float v = 0.0f; for (int i=0;i<C;i++){ float d=x[i]-m; v += d*d; } v = v/C; // 方差
        float s = 1.0f / sqrtf(v + eps);                                   // rstd
        float* out_bt = out + b * T * C + t * C;
        for (int i=0;i<C;i++){ float n=(s*(x[i]-m)); out_bt[i] = n*weight[i]+bias[i]; } // 归一化+缩放平移
        mean[b*T+t] = m; rstd[b*T+t] = s; // 缓存给 backward 用
    }
}
```

还是 `for b for t`，对**每个 token 的那条 C 维向量 `x`** 独立做四步：

1. 求均值 `m`：把 C 个数加起来除以 C。
2. 求方差 `v`：`(x[i]-m)²` 的平均。
3. 求 `rstd`（reciprocal std，标准差的倒数）`s = 1/√(v+eps)`。`eps = 1e-5f` 是防止方差为 0 时除爆。
4. 归一化再缩放平移：`n = s*(x[i]-m)` 把这条向量拉成均值 0、方差 1，再 `n*weight[i]+bias[i]`。这里 `weight`、`bias` 形状都是 `(C,)`，就是 LayerNorm 里可学习的 γ（缩放）和 β（平移），逐通道一个。

<div class="lc-note"><strong>关键</strong>：归一化是沿 <strong>C 这一维</strong>做的——对单个 token 的 768 个通道求均值方差，<strong>既不跨 token 也不跨 batch</strong>。所以它和 encoder 一样是逐 (b,t) 独立的。</div>

最值得停下来看的是最后一行：`mean[b*T+t] = m; rstd[b*T+t] = s;`。它把每个 token 算出来的均值和 rstd **存进了两个 `(B,T)` 的小数组**（每个 token 各一个标量）。

<div class="lc-why"><strong>为什么要缓存</strong>：layernorm 的反向传播需要用到前向时的 <code>mean</code> 和 <code>rstd</code>。与其在 backward 里重新扫一遍 <code>x</code> 把它们再算一次，不如在 forward 顺手存下来——这就是"用显存换算力"的 activation 缓存。micrograd 里整张计算图都驻留在内存中，反向时随便取；llm.c 没有图，于是要<strong>手动决定哪些中间量值得留到 backward</strong>，<code>mean</code>/<code>rstd</code> 就是被点名留下的。</div>

这两个数组从哪来、backward 怎么用，是第 04 讲的事；这一讲你只要记住"forward 顺手存了统计量"这个动作。

### 3. matmul_forward：线性层，全网最耗时的一块 <span class="lc-b lc-core">必读</span>

```c
void matmul_forward(float* out, const float* inp, const float* weight, const float* bias, int B, int T, int C, int OC) {
    // inp (B,T,C), weight (OC,C), bias (OC), out (B,T,OC)；最耗时
    #pragma omp parallel for collapse(2)
    for (int b=0;b<B;b++) for (int t=0;t<T;t++) {
        float* out_bt = out + b*T*OC + t*OC; const float* inp_bt = inp + b*T*C + t*C;
        for (int o=0;o<OC;o++) {
            float val = (bias!=NULL)?bias[o]:0.0f; const float* wrow = weight + o*C;
            for (int i=0;i<C;i++) val += inp_bt[i] * wrow[i]; // 点积
            out_bt[o] = val;
        }
    }
}
```

这就是 PyTorch 里的 `nn.Linear`，数学上是 `out = inp @ weight^T + bias`。形状注释写得很清楚：`inp (B,T,C)`、`weight (OC,C)`、`bias (OC)`、`out (B,T,OC)`。

拆开三层循环看：

- `for b for t` 切出当前 token 的输入行 `inp_bt`（长 `C`）和输出行 `out_bt`（长 `OC`）。
- `for o` 遍历 `OC` 个输出通道。对每个输出通道 `o`，`wrow = weight + o*C` 取出权重矩阵的**第 o 行**（长 `C`）。
- 最内层 `for i` 做一次**点积**：`val += inp_bt[i] * wrow[i]`，把输入向量和这一行权重对应相乘累加，最后加上 `bias[o]` 写进 `out_bt[o]`。

<div class="lc-why"><strong>为什么是 <code>weight^T</code></strong>：权重存成 <code>(OC, C)</code>——第 o 个输出通道的全部权重是连续的一行 <code>wrow</code>。计算 <code>out_bt[o]</code> 时点乘的是 <code>inp_bt · wrow = Σ inp[i]·weight[o,i]</code>，写成矩阵就是 <code>inp @ weight^T</code>。这么存的好处是 <code>inp_bt</code> 和 <code>wrow</code> 在内存里都连续，点积顺着扫，对 cache 友好。这也正是 nanoGPT 里 <code>nn.Linear</code> 的权重布局 <code>(out_features, in_features)</code>。</div>

两个工程细节：

- `bias` 可以是 `NULL`（有些线性层不带 bias），所以用 `(bias!=NULL)?bias[o]:0.0f` 兜底。
- 这是这一讲里**唯一**带 `#pragma omp` 的函数。`collapse(2)` 把 `for b` 和 `for t` 两层合并成一个 `B*T` 的迭代空间再交给 OpenMP 多线程。若只并行最外层 `for b`，迭代数只有 `B`（可能才 4），喂不饱多核；合并后有 `B*T`（比如 4×1024）份活，并行度才够。

<div class="lc-note"><strong>关键</strong>：注释里"最耗时"不是随口说的。一次 matmul 是 <code>B·T·OC·C</code> 次乘加；而一个 transformer block 里有好几次 matmul（QKV 投影 OC=3C、输出投影 OC=C、MLP 升维 OC=4C、MLP 降维），再乘上 12 层——线性层吃掉了绝大部分算力，所以唯独它（和注意力）值得上 OpenMP。<strong>同一个 <code>matmul_forward</code> 靠传不同的 OC 复用给了所有线性层</strong>，这也是它写得这么通用的原因。</div>

### 4. gelu_forward：逐元素激活（tanh 近似） <span class="lc-b lc-key">关键</span>

```c
#define GELU_SCALING_FACTOR sqrtf(2.0f / M_PI)
void gelu_forward(float* out, float* inp, int N) {
    for (int i=0;i<N;i++){ float x=inp[i]; float cube=0.044715f*x*x*x; out[i]=0.5f*x*(1.0f+tanhf(GELU_SCALING_FACTOR*(x+cube))); }
}
```

到这里循环更简单了：没有 `b`、`t`、`o`，只有一个 `for i` 扫过 `N` 个元素。

<div class="lc-why"><strong>为什么只用一层循环</strong>：GELU 是<strong>逐元素</strong>函数，每个数的输出只取决于它自己。既然和邻居无关，那张量是 <code>(B,T,C)</code> 还是别的形状都无所谓，直接把它当成 <code>N = B*T*C</code> 个 float 拍平了扫——比逐 (b,t) 还要独立一档：逐元素独立。在 MLP 里它作用在升维后的隐藏层 <code>(B,T,4C)</code> 上，此时 <code>N = B*T*4C</code>。</div>

公式是 GELU 的 **tanh 近似**：

```
GELU(x) ≈ 0.5 · x · (1 + tanh( √(2/π) · (x + 0.044715·x³) ))
```

代码里 `cube = 0.044715f*x*x*x` 就是那项 `x³`，`GELU_SCALING_FACTOR` 是预先用宏算好的常数 `√(2/π)`。GELU 的精确定义是 `x·Φ(x)`（Φ 是标准正态 CDF，要用 `erf`），但 GPT-2 当年用的就是这个 tanh 近似版。**llm.c 照搬这个近似式，是为了能精确复现 GPT-2 的原始权重和数值**，不是图省事。

### 5. residual_forward：逐元素相加，最像 micrograd 的一层 <span class="lc-b lc-skim">可跳读</span>

```c
void residual_forward(float* out, float* inp1, float* inp2, int N) { for (int i=0;i<N;i++) out[i]=inp1[i]+inp2[i]; }
```

一行就讲完了：`out[i] = inp1[i] + inp2[i]`，把两个长度 `N` 的张量逐元素相加。这就是残差/跳连：`out = x + sublayer(x)`，让梯度有一条不被中间层削弱的"高速公路"。同样是逐元素，无所谓形状。

<details class="lc-fold"><summary>剧透：它的 backward 和 micrograd 加法一模一样 <span class="lc-b lc-skim">可跳读</span></summary>

micrograd 里 `a + b` 的 `_backward` 做的事，是把上游梯度原样 `+=` 给两个加数（`a.grad += out.grad; b.grad += out.grad`）——因为"和"对每个加数的偏导都是 1。llm.c 的 `residual_backward` 写出来就是 `dinp1[i]+=dout[i]; dinp2[i]+=dout[i];`，源码注释干脆直接写着"和 micrograd 加法 backward 一模一样"。这是整条 micrograd → llm.c 血缘里最直白的一处：标量 `Value` 换成了 `float*`，`+=` 累加梯度的灵魂没变。完整的 backward 讲解放在第 04 讲，这里先埋个扣。

</details>

## 关键点

<div class="lc-card"><strong>一图记住这一讲</strong>：5 个层 = 嵌套 for 循环里做加法和点积；循环的形状由"信息在哪一维流动"决定。encoder/layernorm 逐 (b,t)，matmul 逐 (b,t,o)，gelu/residual 逐元素——<strong>没有一个跨 token</strong>。token 之间真正开始"通信"要等下一讲的注意力。</div>

| 层 | 输入 → 输出形状 | 循环结构 | 独立粒度 | 本质运算 |
|---|---|---|---|---|
| encoder | `(B,T)` ids → `(B,T,C)` | `for b for t` | 逐 (b,t) | 查表两次相加 |
| layernorm | `(B,T,C)` → `(B,T,C)` | `for b for t` | 逐 (b,t) | 沿 C 归一化 + γβ |
| matmul | `(B,T,C)` → `(B,T,OC)` | `for b for t for o` | 逐 (b,t,o) | 点积（最耗时） |
| gelu | `(N,)` → `(N,)` | `for i` | 逐元素 | tanh 近似激活 |
| residual | `(N,)+(N,)` → `(N,)` | `for i` | 逐元素 | 相加 |

- **`ptr + b*T*C + t*C` 是贯穿全篇的 C 惯用法**：row-major 平铺下"切出第 (b,t) 行"的指针运算。
- **layernorm 在 forward 顺手缓存了 `mean`/`rstd`**：没有计算图，就得手动决定哪些中间量留给 backward。
- **matmul 是算力大头、也是唯一上 OpenMP 的层**，`collapse(2)` 是为了凑够并行度；同一个函数靠不同 `OC` 复用给所有线性层。
- **"除注意力外逐 (b,t) 独立"** 不是巧合，而是 transformer 的结构事实——它直接决定了这些函数为什么都长成 `for b for t`。

## 自测

<details class="lc-fold"><summary>三道小题，检验是否读懂 <span class="lc-b lc-skim">可跳读</span></summary>

**Q1：encoder 里位置嵌入为什么写 `wpe + t*C`，而不是 `wpe + (b*T+t)*C`？**
因为位置嵌入只跟"第几个位置"有关，和这条数据在 batch 里的编号 `b` 无关——整批数据里所有第 t 个位置共享同一行位置向量。而 token 嵌入用的是 token id `ix`（`wte + ix*C`），跟 b、t 都没有直接关系，只看格子里装的是哪个词。

**Q2：layernorm_forward 为什么要把 `mean` 和 `rstd` 写回数组里？**
留给 backward 用。layernorm 的反向传播要用到前向的均值和 rstd，llm.c 没有 micrograd 那样常驻的计算图，重算一遍又浪费，于是在 forward 顺手把每个 token 的这两个统计量缓存进 `(B,T)` 的小数组里——典型的"用显存换算力"。

**Q3：本讲这 5 个层里，哪个会让不同 token 之间交换信息？**
一个都没有。encoder、layernorm 逐 (b,t) 独立，matmul 逐 (b,t,o)（不同 t 互不影响），gelu、residual 逐元素。唯一跨 token 混信息的是注意力——正好是下一讲的主角。

</details>

## 小结与下一讲预告

这一讲我们把 GPT-2 forward 里的 5 个"非注意力"层逐行读完了。剥掉 PyTorch 之后，它们朴素得近乎透明：查表相加（encoder）、逐 token 归一化（layernorm）、点积（matmul）、逐元素激活（gelu）、逐元素相加（residual）。把它们串起来看，会得到一个能一直用下去的心智模型——**信息只在注意力那一层跨 token 流动，其余层都在 (b,t) 上各算各的**，这就是所有 `for b for t` 的来由。

下一讲 **第 03 讲 · 前向层（二）：attention**，我们去看唯一打破"逐 token 独立"的那一层：`attention_forward` 怎么用 Q·K 算注意力分数、按因果掩码屏蔽未来、softmax 归一化、再加权求和 V——以及它为什么是除 matmul 外第二个需要 OpenMP 的硬骨头。把这 6 个 forward 凑齐，一个 transformer block 的前向就完整了；再往后（第 04 讲起）才轮到手写 backward，届时这一讲埋下的 `mean`/`rstd` 缓存和"`+=` 累加"就该派上用场了。
