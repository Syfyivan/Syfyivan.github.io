---
title: "《llm.c 源码逐行》第05讲（终）· AdamW 优化器 + 训练循环"
date: 2026-06-29 11:06:00
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

<div class="lc-key-note"><strong>一句话</strong>：前四讲我们把 GPT-2 的前向（算 loss）和反向（手写 backward 求梯度）都拆完了，这一讲补上训练的最后一块——优化器 <code>gpt2_update</code>，看 llm.c 怎么用纯 C 把 <code>torch.optim.AdamW</code> 的公式整个摊开手写；再把 <code>main</code> 里"前向→清梯度→反向→更新"那个循环拼起来，给整个系列收尾。</div>

到第 04 讲为止，`gpt2_backward` 已经把每个参数的梯度都算好、塞进了 `grads_memory`。但梯度只是"该往哪个方向改、改多少"的建议，**真正动手改参数**的是优化器。这一讲就一个主角函数，外加一个十几行的训练循环。

---

## 一、gpt2_update：把 AdamW 摊开手写 <span class="lc-b lc-core">必读</span>

先看完整的函数。注意：这就是 nanoGPT 里那行 `optimizer = torch.optim.AdamW(...)` 背后的全部数学，PyTorch 把它藏在 C++ kernel 里，llm.c 把它原样写在你眼前：

```c
// gpt2_update —— 手写 AdamW（对 params_memory 整块一次更新）
void gpt2_update(GPT2 *model, float learning_rate, float beta1, float beta2, float eps, float weight_decay, int t) {
    if (model->m_memory == NULL) { // 懒分配一阶/二阶动量
        model->m_memory = (float*)calloc(model->num_parameters, sizeof(float));
        model->v_memory = (float*)calloc(model->num_parameters, sizeof(float));
    }
    for (size_t i = 0; i < model->num_parameters; i++) {
        float param = model->params_memory[i];
        float grad = model->grads_memory[i];
        float m = beta1*model->m_memory[i] + (1.0f-beta1)*grad;        // 一阶动量
        float v = beta2*model->v_memory[i] + (1.0f-beta2)*grad*grad;   // 二阶动量(RMSprop)
        float m_hat = m / (1.0f - powf(beta1, t));                      // 偏差校正
        float v_hat = v / (1.0f - powf(beta2, t));
        model->m_memory[i] = m; model->v_memory[i] = v;
        model->params_memory[i] -= learning_rate * (m_hat/(sqrtf(v_hat)+eps) + weight_decay*param); // 更新+权重衰减
    }
}
```

### 1.1 关键前提：参数是"一整块"扁平数组

整个函数只有一层 `for`，从 `0` 扫到 `num_parameters`。为什么不需要区分"这是词嵌入、那是某层的 attention 权重"？因为在 llm.c 里：

| 数组 | 类型 | 长度 | 装的是 |
|---|---|---|---|
| `params_memory` | `float*` | `num_parameters` | GPT-2 全部参数，首尾相接的一整块 |
| `grads_memory` | `float*` | 同上，同布局 | `grads_memory[i]` 就是 `params_memory[i]` 的梯度 |
| `m_memory` | `float*` | 同上，同布局 | 第 `i` 个参数的一阶动量 |
| `v_memory` | `float*` | 同上，同布局 | 第 `i` 个参数的二阶动量 |

GPT-2 small 的 `num_parameters` 大约是 1.24 亿。词嵌入、位置嵌入、每一层的 LayerNorm / attention / MLP 权重……全部 `malloc` 成一条连续的 `float` 缓冲区，各个权重张量只是这条缓冲区上的不同切片（前几讲见过的那些命名指针都指向它内部）。

<div class="lc-why"><strong>为什么能这么粗暴</strong>：AdamW 是<strong>逐元素(element-wise)</strong>的——每个标量参数独立更新，公式里没有任何跨维度的运算。所以优化器根本不关心张量形状 (B,T,C) 长什么样，四个同布局的数组用同一个下标 <code>i</code> 并排走一遍就行。</div>

这正是 **micrograd 的回声**：micrograd 里是 `for p in self.parameters(): p.data -= lr * p.grad`，遍历一串标量 `Value`，各取 `.data` 和 `.grad`。这里只是把"一串 Value"换成"两条并行的扁平数组 `params_memory[i]` / `grads_memory[i]`"，再多挂两条数组 `m_memory` / `v_memory` 存 Adam 的状态。本质一模一样。

### 1.2 懒分配 m 和 v

```c
    if (model->m_memory == NULL) { // 懒分配一阶/二阶动量
        model->m_memory = (float*)calloc(model->num_parameters, sizeof(float));
        model->v_memory = (float*)calloc(model->num_parameters, sizeof(float));
    }
```

第一次调用 `gpt2_update` 时 `m_memory` 还是 `NULL`，这里才分配——这就是"懒分配(lazy allocation)"：不在建模型时就占这两块大内存，等真要训练了再开。

两个细节：

- 用 **`calloc` 而不是 `malloc`**：`calloc` 会把内存清零。Adam 要求动量从 0 起步，第一步的滑动平均和后面的偏差校正都建立在"初始值是 0"这个前提上。
- 之后每步进来 `m_memory != NULL`，跳过分配，直接复用——所以 `m`、`v` 是**跨整个训练过程持续累积**的，这才叫得上"滑动平均"。

### 1.3 逐元素四步：动量 → 自适应 → 校正 → 更新

循环体内，对第 `i` 个参数依次做四件事。先取出当前参数值和它的梯度：

```c
        float param = model->params_memory[i];
        float grad = model->grads_memory[i];
```

**第一步——一阶动量 m（带惯性的梯度）：**

```c
        float m = beta1*model->m_memory[i] + (1.0f-beta1)*grad;        // 一阶动量
```

`m` 是梯度的**指数滑动平均(EMA)**：90% 沿用上一步的 `m`，10% 吸收当前梯度（`beta1=0.9`）。效果上相当于把最近约 10 步的梯度做了平滑，抹掉单步噪声，让更新有"惯性"——这就是动量(momentum)，Adam 里叫一阶矩。

**第二步——二阶动量 v（自适应学习率）：**

```c
        float v = beta2*model->v_memory[i] + (1.0f-beta2)*grad*grad;   // 二阶动量(RMSprop)
```

`v` 是**梯度平方**的滑动平均（`beta2=0.999`，约平均最近 1000 步）。它逐元素估计"这个参数最近的梯度有多大"，也就是 RMSprop 的思路：梯度一直很大的参数，`v` 大；偶尔才动一下的参数，`v` 小。后面 `v` 会拿去开方做分母，给每个参数定制各自的步长。

**第三步——偏差校正 m_hat / v_hat：**

```c
        float m_hat = m / (1.0f - powf(beta1, t));                      // 偏差校正
        float v_hat = v / (1.0f - powf(beta2, t));
```

因为 `m`、`v` 都从 0 起步，训练刚开始那几步它们被"拽"向 0、偏小。`t` 是当前步数，分母 `1 - β^t` 在早期很小（`t=1` 时 `1-0.9=0.1`），一除就把 `m`、`v` 放大回真实量级；随着 `t` 变大，`β^t → 0`、分母 `→ 1`，校正自动消失。

<div class="lc-note"><strong>关键</strong>：<code>t</code> 必须从 1 开始（看下面 main 里传的是 <code>step+1</code>）。若 <code>t=0</code>，分母变成 <code>1 - β⁰ = 0</code>，直接除零爆炸。</div>

**第四步——写回状态 + 更新参数：**

```c
        model->m_memory[i] = m; model->v_memory[i] = v;
        model->params_memory[i] -= learning_rate * (m_hat/(sqrtf(v_hat)+eps) + weight_decay*param); // 更新+权重衰减
```

先把这一步算出的 `m`、`v` 写回数组（供下一步继续滑动平均），再原地更新参数。更新量拆成括号里两项：

- `m_hat / (sqrtf(v_hat) + eps)`：**自适应步长**。方向来自动量 `m_hat`，大小被最近梯度的均方根 `√v_hat` 归一化——梯度一向很大的参数被压小步子，梯度小而稀的参数相对放大步子，每个参数都有自己的"有效学习率"。`eps`（`1e-8`）只是防止除零。
- `weight_decay * param`：**解耦权重衰减**，AdamW 里的那个 "W"。它每步把参数往 0 拉一点点，且**直接正比于 `param`、与梯度无关**——注意它是加在这里，而不是混进 `grad` 再去算 `m`、`v`。这个"解耦"正是 AdamW 区别于"Adam + L2 正则"的核心。

<div class="lc-why"><strong>对照 nanoGPT</strong>：那一课你写的是 <code>torch.optim.AdamW(..., betas=(0.9,0.999), weight_decay=0.1)</code> 然后 <code>optimizer.step()</code>，一行调用，公式全在框架里。这一讲的循环体，逐字就是那行 <code>.step()</code> 摊开后的样子。</div>

---

## 二、AdamW 拆成四件事 <span class="lc-b lc-key">重点</span>

把上面四步抽象一下，AdamW 就是这四件事叠加：

| 部件 | 对应代码 | 作用 |
|---|---|---|
| 动量 | `m = β1·m + (1-β1)·grad` | 平滑梯度噪声，给更新加惯性 |
| 自适应学习率 | `v = β2·v + (1-β2)·grad²`，再 `m_hat/√v_hat` | 每个参数按自己梯度大小定制步长（RMSprop） |
| 偏差校正 | `/(1-β^t)` | 修正 m、v 从 0 起步带来的早期偏差 |
| 解耦权重衰减 | `+ weight_decay·param` | 每步把参数轻轻拉向 0，独立于梯度（AdamW 的 W） |

<div class="lc-card"><strong>速查 · 一次 AdamW 更新</strong><br/>① <code>m ← β1·m + (1-β1)·g</code>　② <code>v ← β2·v + (1-β2)·g²</code><br/>③ <code>m̂ = m/(1-β1ᵗ)</code>，<code>v̂ = v/(1-β2ᵗ)</code><br/>④ <code>θ ← θ − lr·( m̂/(√v̂+ε) + λ·θ )</code><br/>四条扁平数组 <code>params/grads/m/v</code> 同下标 <code>i</code> 并行走一遍。</div>

---

## 三、训练循环 main：前向 → 清梯度 → 反向 → 更新 <span class="lc-b lc-key">重点</span>

优化器有了，`main` 里的训练循环就水到渠成。每个 step 四步：

```c
// 训练循环(main)：for step:
//   gpt2_forward(model, X, Y)                              -> 前向，算激活 + loss
//   gpt2_zero_grad(model)                                  -> 清空梯度
//   gpt2_backward(model)                                   -> 手写反向，填满 grads_memory
//   gpt2_update(model, lr, 0.9, 0.999, 1e-8, 0.0, step+1)  -> AdamW 更新
```

逐步看：

1. **`gpt2_forward(model, X, Y)`**——前向（第 03 讲）。`X`、`Y` 是这一批的输入/目标 token，形状 `(B, T)`；前向跑完填好所有激活，并用 `Y` 算出交叉熵 loss。
2. **`gpt2_zero_grad(model)`**——把 `grads_memory` 清零。**必须在 backward 之前**，因为 backward 是用 `+=` **累加**梯度进来的——梯度不清，上一步的残留会叠加进这一步。
3. **`gpt2_backward(model)`**——手写反向（第 04 讲），逐个算子调 `_backward`、把梯度 `+=` 进 `grads_memory[i]`。
4. **`gpt2_update(model, lr, 0.9, 0.999, 1e-8, 0.0, step+1)`**——AdamW 更新。

这次调用传进去的超参，正好对上 `gpt2_update` 的签名：

| 形参 | 传入值 | 含义 |
|---|---|---|
| `beta1` | `0.9` | 一阶动量衰减 |
| `beta2` | `0.999` | 二阶动量衰减 |
| `eps` | `1e-8` | 防除零 |
| `weight_decay` | `0.0` | 权重衰减——这里**关掉了**，所以更新退化成 `θ -= lr·m̂/(√v̂+ε)` |
| `t` | `step+1` | 步数从 1 起，喂给偏差校正 |

<div class="lc-note"><strong>关键</strong>：第 2 步 <code>zero_grad</code> 之所以能放在 <code>forward</code> 之后，是因为前向根本不碰梯度数组；它只要卡在 <code>backward</code> 之前即可。这个 <code>+=</code> 累加 + 用前先清零的约定，就是 micrograd 第一课 <code>self.grad += ...</code> 一路放大到真 GPT-2 的同一件事。</div>

把这四步和前两课叠在一起看，会发现它们是同一个循环的三种身形：

```
micrograd   loss = ...;        zero grad;          loss.backward();    p.data -= lr*p.grad
nanoGPT     logits,loss=m(X,Y);optimizer.zero_grad();loss.backward();   optimizer.step()
llm.c       gpt2_forward(...);  gpt2_zero_grad(...); gpt2_backward(...); gpt2_update(...)
```

同样的四拍——**前向出 loss、清梯度、反向求梯度、按梯度更新**——只是这一次是纯 C、真 GPT-2、连优化器都手写。

---

## 四、四课闭环：从 micrograd 到 llm.c <span class="lc-b lc-skim">收尾</span>

走到这里，本号这条"模型怎么算、怎么训"的主线就闭环了。回头看四课各自补上了哪块拼图：

| 课 | 语言/形态 | 它教会你的那块 | 还是黑箱的部分 |
|---|---|---|---|
| **micrograd** | Python，手写 autograd 种子 | 标量 `Value`、`_backward` 闭包、拓扑序、`+=` 累加梯度 | 玩具网络，没有真模型 |
| **nanoGPT** | PyTorch 训 GPT | 真 GPT 架构 + 训练配方（数据、循环、AdamW 调用） | autograd 和优化器都在 PyTorch 里 |
| **llama2.c** | 纯 C 推理 Llama | 不靠框架、把前向的矩阵运算写到裸 C | 只推理，不训练，没有反向 |
| **llm.c** | 纯 C 训练 GPT-2 + 手写反向 | 前向(像 llama2.c) + 反向(像 micrograd，手写) + AdamW(手写)，全在裸 C 上、真 GPT-2 | —— 黑箱被全部拆开 |

micrograd 给了**种子**：每个运算都有自己的 `_backward`、梯度靠 `+=` 累加。llm.c 做的，就是把这颗种子从"标量、玩具网络"放大到"张量 (B,T,C)、真 GPT-2"——前向逐算子算激活，反向逐算子调 `_backward` 累加梯度，最后这一讲的 `gpt2_update` 逐元素跑 AdamW。

<div class="lc-key-note"><strong>首尾呼应</strong>：llm.c 训练循环最后那行 <code>params_memory[i] -= lr·(...)</code>，本质就是 micrograd 第一课的 <code>p.data -= lr*p.grad</code>，只是放大成了真 GPT-2。四课走完，从一颗标量 autograd 种子，到一个能在纯 C 里训起来的 GPT-2，"数据进去 → 权重更新"这条链上，<strong>没有一处你指不出它的 _backward 和 +=</strong>。黑箱清零。</div>

---

## 自测

<details class="lc-fold"><summary>Q1：<code>gpt2_update</code> 为什么能无视所有张量的形状，只用一层 <code>for</code> 扫 <code>num_parameters</code>？ <span class="lc-b lc-skim">可跳读</span></summary>

因为 AdamW 是**逐元素(element-wise)**算法：每个标量参数独立更新，公式里没有任何跨维度的运算。`params_memory` / `grads_memory` / `m_memory` / `v_memory` 是四条**同长度、同布局**的扁平数组，第 `i` 个参数和它的梯度、动量、二阶动量都在同一个下标 `i` 上。于是优化器完全不必知道"谁是词嵌入、谁是某层权重、形状是不是 (B,T,C)"，四条数组并排走一遍即可。

</details>

<details class="lc-fold"><summary>Q2：<code>t</code> 为什么从 <code>step+1</code> 开始？传 <code>t=0</code> 会怎样？ <span class="lc-b lc-skim">可跳读</span></summary>

`t` 喂给偏差校正 `m / (1 - powf(beta1, t))`。若 `t=0`，分母变成 `1 - β⁰ = 1 - 1 = 0`，直接除零。从 `t=1` 起：`1 - 0.9¹ = 0.1`，给第一步最大的放大（因为此时 `m`、`v` 刚从 0 起步、被低估得最厉害）；之后 `β^t → 0`、分母 `→ 1`，校正逐渐淡出。所以 `main` 里传 `step+1` 而不是 `step`。

</details>

<details class="lc-fold"><summary>Q3：更新式里的 <code>weight_decay*param</code> 为什么直接乘 <code>param</code>，而不是先加进 <code>grad</code>？ <span class="lc-b lc-skim">可跳读</span></summary>

这是 AdamW 的"解耦权重衰减(decoupled weight decay)"，也是它名字里 W 的由来。如果把衰减加进 `grad` 再去算 `m`、`v`（那是老式的 "Adam + L2 正则"），衰减项也会被 `√v̂` 那套自适应缩放扭曲，强度变得不可控。AdamW 把它**单拎出来直接正比于 `param`**、加在自适应步长之外，让"按梯度更新"和"把参数拉向 0"两件事互不干扰。注意本讲 `main` 里传的是 `weight_decay=0.0`，所以这次调用里这一项是关着的。

</details>

---

## 小结

- `gpt2_update` 把 `torch.optim.AdamW` 的内部公式整个摊开手写：**懒分配 `m`/`v`（calloc 清零）→ 逐元素跑 动量 / 自适应学习率 / 偏差校正 / 解耦权重衰减**，靠四条同布局扁平数组并行更新，不碰张量形状。
- 训练循环就四拍：`gpt2_forward`（出 loss）→ `gpt2_zero_grad`（清梯度）→ `gpt2_backward`（手写反向、`+=` 累加）→ `gpt2_update`（AdamW）。这就是 micrograd、nanoGPT 同一个循环的**纯 C、真 GPT-2 版**。
- 四课闭环：**micrograd**（手写 autograd 种子）→ **nanoGPT**（PyTorch 训 GPT）→ **llama2.c**（纯 C 推理）→ **llm.c**（纯 C 训练 + 手写反向）。从一颗标量 autograd 种子，到能在裸 C 里训起来的 GPT-2，全程无黑箱、首尾呼应。

这是《llm.c 源码逐行》的**终讲**，也是这条"模型怎么算、怎么训"主线的收官。下一步想往哪走，都已经站在没有黑箱的地基上了：往上，可以去读 llm.c 的 CUDA 版（`train_gpt2.cu`），看同一套前向/反向/AdamW 怎么搬上 GPU、怎么做 kernel 融合；往下，可以回头给自己的玩具任务，从零手写一遍 forward + backward + AdamW，验证你真的能指出每一处的 `_backward` 和 `+=`。
