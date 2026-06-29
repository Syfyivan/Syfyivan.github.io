---
title: "《llama2.c 源码逐行》第00讲 · 导论：用一个 C 文件跑 Llama 2"
date: 2026-06-29 10:31:00
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

<div class="l2-key-note"><strong>本讲定位</strong>：这是《llama2.c 源码逐行》的第 00 讲，先看全景、不抠单行算法。读完 nanoGPT 那一季，你已经知道一个 GPT 在 PyTorch 里怎么训练、怎么推理；这一季换个视角——karpathy 用一个纯 C 文件 <code>run.c</code>（约 970 行）把 Llama 2 的<strong>推理</strong>从头裸写出来，零依赖、CPU 就能跑。本讲把 <code>Config / TransformerWeights / RunState</code> 三个结构体和 <code>forward</code> 签名摆出来，给你一张地图：数据放在哪、算到哪一步、和 GPT 到底差在哪几处。后面每一讲，都会落到这张地图上的某一块。</div>

## 一、llama2.c 是什么：一个文件，只做推理 <span class="l2-b l2-core">必读</span>

llama2.c 的核心就是一个 `run.c`。它做的事情非常克制：

- **只做推理（inference），不做训练**。它不算梯度、不更新权重，只负责"给定权重和一段提示词，一个 token 一个 token 地往外吐"。
- **纯 C、零依赖**。没有 PyTorch、没有 BLAS、不需要 GPU。`gcc run.c -o run` 就能编译，CPU 上就能跑起来一个真正的 Llama 2。
- **权重来自一个二进制文件**。它读一个 `.bin`（你自己训练的小 Llama，或官方权重转出来的），把里面的浮点数当作模型参数加载进来。

为什么这件事值得专门读一季？因为在 nanoGPT 里，`matmul`、`softmax`、`LayerNorm` 这些都被 PyTorch 算子和 autograd 包起来了——你看得到调用，看不到"乘法到底怎么一格一格加出来"。llama2.c 把这层包装全撕掉了：**每一个张量运算都是手写的 `for` 循环**，矩阵乘就是三层循环，归一化就是平方求和开方。它是 nanoGPT 之后，"把 Transformer 翻到最底层"的那一站。

<div class="l2-why"><strong>为什么先读结构体</strong>：C 里没有 Tensor 对象，所有"形状"只活在程序员脑子里和注释里。所以读 llama2.c 的正确顺序，不是先读算法，而是先把"内存里摆了哪些东西、各自多大"搞清楚——这就是本讲要做的事。</div>

## 二、和 nanoGPT：从 PyTorch 训练到 C 推理 <span class="l2-b l2-key">重点</span>

先把两季的工程形态对照一下，建立"接续感"：

| 维度 | nanoGPT | llama2.c |
|---|---|---|
| 语言 / 依赖 | Python + PyTorch | 纯 C，单文件 `run.c`，零依赖 |
| 覆盖范围 | 训练 + 推理 | 只做推理 |
| 张量运算 | torch 算子，autograd 自动求导 | 手写 `for` 循环，`matmul`/`rmsnorm` 都看得见 |
| 跑在哪 | 通常要 GPU | CPU 就能跑 |
| 权重从哪来 | checkpoint `.pt` | 二进制 `.bin`（自训练或官方小 Llama）|

一句话：**nanoGPT 是"会训练的 GPT 教科书"，llama2.c 是"会推理的 Llama 裸机实现"**。前者教你模型怎么学，后者教你模型在最底层怎么算。

## 三、Llama vs GPT：五处不一样 <span class="l2-b l2-key">重点</span>

Llama 不是"换了个名字的 GPT"。它在四个组件上做了替换，外加一种推理方式。这一季会逐个落到代码，这里先给地图——注意最后一列，每一处差异在源码里都有对应的"信号"：

| 组件 | GPT（nanoGPT）| Llama（llama2.c）| 代码里的信号 |
|---|---|---|---|
| 归一化 | LayerNorm：减均值、有 `weight`+`bias` | RMSNorm：不减均值、只有一个缩放向量、无 bias | `rms_att_weight` / `rms_ffn_weight` / `rms_final_weight` |
| 位置编码 | 学习式位置嵌入表 `wpe` | RoPE 旋转位置编码：实时算，不存权重 | （没有位置嵌入字段）|
| FFN | GELU-MLP，两个矩阵 | SwiGLU，三个矩阵：`silu(w1·x) * (w3·x)` 再过 `w2` | `w1` / `w2` / `w3` |
| 注意力 | MHA：query 头数 = KV 头数 | GQA：`n_kv_heads` 可小于 `n_heads`，多个 query 头共享一组 KV | `wq` 与 `wk`/`wv` 形状不同 |
| 推理方式 | 训练为主，前向吃整批 | KV cache 增量：一次只算一个 token | `key_cache` / `value_cache` |

记住这张表，下一节看结构体时你会发现：**这些差异不是抽象概念，它们就明晃晃地写在字段名和形状注释里**。

## 四、三张表读懂全景：Config / Weights / RunState <span class="l2-b l2-core">必读</span>

llama2.c 把整个模型拆成三类东西：**蓝图、权重、草稿纸**。分别对应三个结构体。

### Config：蓝图（超参数）

```c
typedef struct {
    int dim; // transformer dimension
    int hidden_dim; // for ffn layers
    int n_layers;
    int n_heads; // number of query heads
    int n_kv_heads; // number of key/value heads (can be < query heads, multiquery/GQA)
    int vocab_size;
    int seq_len; // max sequence length
} Config;
```

七个整数，就是这个模型的全部超参数：残差流宽度 `dim`、FFN 中间维度 `hidden_dim`、层数 `n_layers`、query 头数 `n_heads`、KV 头数 `n_kv_heads`、词表大小 `vocab_size`、最大序列长度 `seq_len`。它会从 `.bin` 文件的文件头最先被读出来，之后所有循环边界、所有矩阵的维度，都从这里取值。

注意两点：第一，**没有 `head_size` 字段**——它是算出来的，`head_size = dim / n_heads`，所以 `n_heads * head_size` 就等于 `dim`。第二，`n_heads` 和 `n_kv_heads` 是两个独立字段，注释已经把话挑明了：`can be < query heads, multiquery/GQA`。GQA 的伏笔从 Config 就埋下了。

<div class="l2-why"><strong>为什么单独一个小结构体</strong>：因为 C 里没有"模型对象自带超参"这回事，下游每一段循环都得手动知道"我要循环几次、跨多大步"。把这 7 个数集中成 <code>Config</code>，相当于给整份代码一个唯一的事实来源——<code>head_size = dim / n_heads</code> 这种推导，全代码都按它来。</div>

### TransformerWeights：权重，看形状就能读出架构

```c
typedef struct {
    float* token_embedding_table;    // (vocab_size, dim)
    float* rms_att_weight; // (layer, dim) rmsnorm weights
    float* rms_ffn_weight; // (layer, dim)
    float* wq; // (layer, dim, n_heads * head_size)
    float* wk; // (layer, dim, n_kv_heads * head_size)
    float* wv; // (layer, dim, n_kv_heads * head_size)
    float* wo; // (layer, n_heads * head_size, dim)
    float* w1; // (layer, hidden_dim, dim)
    float* w2; // (layer, dim, hidden_dim)
    float* w3; // (layer, hidden_dim, dim)
    float* rms_final_weight; // (dim,)
    float* wcls; // (optional) classifier weights for logits
} TransformerWeights;
```

这是全讲最关键的一块。先看一个共同点：**每个字段都是 `float*`，一个裸指针，而不是多维数组**。注释里那些 `(layer, dim, ...)` 是"逻辑形状"，只活在我们脑子里；内存里它们全是一维、按行优先（row-major）铺平的浮点数。比如取第 `l` 层的 `wq`，在代码里就是从这个指针偏移 `l * dim * dim` 个 `float` 开始的一段（因为 `n_heads * head_size == dim`）。**在 C 里没有自动的多维索引，所有偏移都得自己乘出来**——这正是后面每一讲都要反复打交道的事。

现在对着上一节那张架构表，逐组读：

- **`token_embedding_table` `(vocab_size, dim)`**：词嵌入表，每个 token 一行长度 `dim` 的向量。这一项和 GPT 一样。
- **`rms_att_weight` / `rms_ffn_weight` `(layer, dim)`**：这就是 RMSNorm 的权重。注意它每层**只有一个长度 `dim` 的缩放向量，没有 bias**——对照 LayerNorm 的 weight+bias，这里"少了一半参数"正是 RMSNorm 比 LayerNorm 简单的体现。
- **`wq` / `wk` / `wv`**：注意力的三组投影。关键在形状差异——`wq` 是 `(layer, dim, n_heads * head_size)`，而 `wk` / `wv` 是 `(layer, dim, n_kv_heads * head_size)`。当 `n_kv_heads < n_heads` 时，**`wk`/`wv` 比 `wq` 更窄**，这就是 GQA：KV 头比 query 头少，多个 query 头共享同一组 K、V。
- **`wo` `(layer, n_heads * head_size, dim)`**：注意力之后的输出投影，把多头拼回 `dim`。
- **`w1` / `w2` / `w3`**：FFN 的三个矩阵——**三个，不是两个**。这就是 SwiGLU：`w1` 和 `w3` 都把 `dim` 映到 `hidden_dim`（`w3` 当门控），逐元素 `silu(w1·x) * (w3·x)` 之后再用 `w2` 映回 `dim`。GPT 的 MLP 只有"升维 + 降维"两个矩阵，多出来的 `w3` 就是 Llama 和 GPT 在 FFN 上的肉眼可见差异。
- **`rms_final_weight` `(dim,)`**：最后一层归一化，出 logits 之前用。
- **`wcls`**：分类头，把 `dim` 投到 `vocab_size` 得到 logits。注释标了 `(optional)`——因为很多模型**权重共享（weight tying）**：分类头和 `token_embedding_table` 是同一块数据，这时 `wcls` 直接指向词嵌入表，不再单独占内存。

<div class="l2-note"><strong>关键</strong>：<code>TransformerWeights</code> 里全是 <code>float*</code>，因为它们都指进同一块连续内存（下一节的 mmap）。注释里的 <code>(layer, dim, ...)</code> 是逻辑形状，真实内存是一维铺平的，索引要手动算偏移——"形状靠注释、寻址靠乘法"是读这份代码的基本功。</div>

### RunState：激活缓冲，那"一阵波"

```c
typedef struct {
    float *x;   // activation at current time stamp (dim,)
    float *xb;  // same, but inside a residual branch (dim,)
    float *xb2; // an additional buffer (dim,)
    float *hb;  // buffer for hidden dim in ffn (hidden_dim,)
    float *hb2; // buffer for hidden dim in ffn (hidden_dim,)
    float *q, *k, *v; // query/key/value (dim,)
    float *att; // scores/attention values (n_heads, seq_len)
    float *logits;
    float* key_cache;   // (layer, seq_len, dim)  -- KV cache
    float* value_cache; // (layer, seq_len, dim)
} RunState;
```

如果说 `TransformerWeights` 是"静止不变的权重"，那 `RunState` 就是"流过网络的那一阵激活波"。这些全是**预先分配好、每次 forward 反复复用的草稿纸**：

- **`x` `(dim,)`**：残差流本体——一路从输入流到输出、不断被加东西的那条主干向量。
- **`xb` / `xb2` `(dim,)`**：残差分支里的临时拷贝。比如先把 `x` 归一化到 `xb`，在 `xb` 上算注意力，最后再加回 `x`，主干 `x` 在分支计算期间保持不变。
- **`hb` / `hb2` `(hidden_dim,)`**：FFN 专用的中间缓冲，`w1·x` 和 `w3·x` 的结果就落在这里。
- **`q` / `k` / `v` `(dim,)`**：当前这个 token 的 query / key / value。
- **`att` `(n_heads, seq_len)`**：注意力分数，每个头对最多 `seq_len` 个历史位置各一个分数。
- **`logits`**：最终输出，长度 `vocab_size`。
- **`key_cache` / `value_cache` `(layer, seq_len, dim)`**：**KV cache**，整份代码里最占内存、也最体现"推理"特性的两块。每一层、每一个历史位置，都缓存一份 K 和一份 V；下一个 token 来时，直接拿缓存里的历史 K/V 做注意力，不必把前面所有 token 重算一遍。（严格说，在 GQA 下每个位置缓存的宽度是 `n_kv_heads * head_size`，当 `n_kv_heads == n_heads` 时正好等于注释里写的 `dim`。）

<div class="l2-why"><strong>为什么要预分配草稿纸</strong>：C 没有 autograd、没有自动内存管理。如果每算一步都 <code>malloc</code> 一块再 <code>free</code>，又慢又容易漏。所以 llama2.c 在开跑前一次性把所有缓冲都分配好，每个 token 的 forward 都往同一批 buffer 里覆盖写——"权重是河床（静止），激活是河水（流动）"，<code>RunState</code> 就是那条河。</div>

### Transformer：把三者打包 + mmap

```c
typedef struct {
    Config config;              // hyperparameters (the blueprint)
    TransformerWeights weights;
    RunState state;             // buffers for the "wave" of activations
    int fd; float* data; ssize_t file_size; // for the mmap
} Transformer;
```

顶层对象，把蓝图、权重、草稿纸三者装在一起，再加上三个和文件相关的字段：`fd`（打开的文件描述符）、`data`（映射进内存的基地址）、`file_size`（文件大小，用于解除映射）。

最后一行注释里的 `mmap` 是点睛之笔。权重文件可能上百 MB 甚至更大，llama2.c **不是把它读进来再 parse**，而是用 `mmap` 把这个 `.bin` 文件**直接映射进进程地址空间**：操作系统把文件内容当作一段内存，`data` 就是这段内存的起点。然后——还记得上面 `TransformerWeights` 全是 `float*` 吗？——那些指针全都指进这块 mmap 区域的不同偏移处。**不拷贝、不解析，指过去就能用**。这是 C 里又快又省内存的经典手法。

<div class="l2-note"><strong>关键</strong>：<code>Transformer</code> = 蓝图(<code>config</code>) + 权重(<code>weights</code>) + 草稿纸(<code>state</code>) + 一块 mmap 进来的文件(<code>data</code>)。<code>weights</code> 里的每个 <code>float*</code> 都指进 <code>data</code> 这块映射内存——这也是为什么权重字段必须是裸指针，而不是真正持有数据的数组。</div>

## 五、forward：全景的心脏 <span class="l2-b l2-core">必读</span>

所有结构体都是为这一个函数服务的：

```c
float* forward(Transformer* t, int token, int pos);
```

把签名读三遍，你就懂了 llama2.c 的运转方式：它**一次只吃一个 token，外加这个 token 所在的位置 `pos`**，返回一个 `float*`——长度 `vocab_size` 的 logits。**不是一个 batch，不是一整句话，就是一个 token**。

对照 nanoGPT：那边的前向吃 `(B, T)` 一整批序列、返回 `(B, T, vocab)`。这边是它的"单流、增量、为推理而生"的版本。一整句话是靠**外层的 generate 循环**反复调它生成的：

1. 喂入提示词的第 0 个 token、`pos = 0` → `forward` → 一串 logits → 采样出下一个 token；
2. 把刚采到的 token 当输入、`pos = 1` → `forward` → 再采样；
3. ……如此自回归，`pos` 一路递增，靠 KV cache 复用历史，直到吐出结束符或写满 `seq_len`。

而每一次 `forward` 内部，干的就是这条流水线（细节是这一季后面各讲的主菜）：

1. 用 `token` 查 `token_embedding_table`，把嵌入向量拷进 `x`；
2. 对每一层：RMSNorm → 注意力（给 q/k 施加 RoPE → 把当前 k/v 写进 KV cache → 在缓存上做注意力）→ 残差加回 → RMSNorm → FFN（SwiGLU）→ 残差加回；
3. 最后 `rms_final_weight` 归一化 → `wcls` 投影 → 写满 `logits` 返回。

<div class="l2-key-note"><strong>记住这句</strong>：<code>forward(t, token, pos)</code> = 吃"一个 token + 它的位置"，吐一串 logits；它内部读 <code>weights</code>、用 <code>state</code> 当草稿、往 KV cache 里追加历史。外层 generate 循环反复调它，就把一个 token 滚成了一整段文本。这一季的每一讲，本质上都是在拆 <code>forward</code> 里的某一步。</div>

## 关键点

<div class="l2-card"><strong>速查 · 五个名字</strong>：<code>Config</code> = 蓝图（7 个超参） · <code>TransformerWeights</code> = 权重（全是指进 mmap 的 <code>float*</code>） · <code>RunState</code> = 草稿纸（预分配、反复复用，含 KV cache） · <code>Transformer</code> = 三者打包 + mmap 文件 · <code>forward(t, token, pos)</code> = 一次一个 token → logits，全景的心脏。</div>

- llama2.c = 纯 C 单文件 `run.c`，**只做推理**、零依赖、CPU 可跑；nanoGPT 是 PyTorch 训练+推理，这边是把推理翻到最底层、每个张量运算都是手写 `for` 循环。
- 读这份代码先读结构体：**形状靠注释、寻址靠乘法**，所有 `float*` 都指进同一块 mmap 内存。
- Llama 对 GPT 的五处替换，全写在字段里：RMSNorm（`rms_*_weight`，无 bias）、RoPE（无位置嵌入字段）、SwiGLU（`w1/w2/w3` 三矩阵）、GQA（`wq` 与 `wk/wv` 形状不同）、KV cache（`key_cache/value_cache`）。
- `forward` 一次只算一个 token，generate 循环靠 `pos` 递增 + KV cache 自回归生成。

## 自测

<details class="l2-fold"><summary>三道题，检验这张地图你拿稳了没 <span class="l2-b l2-skim">可跳读</span></summary>

**Q1. 为什么 `TransformerWeights` 里全是 `float*`，而不是多维数组？**
因为权重文件是被 `mmap` 成一整块连续内存的，每个 `float*` 只是指进这块内存的不同偏移处——不拷贝、不解析。注释里的 `(layer, dim, ...)` 是逻辑形状，真实内存一维铺平，多维索引得自己用乘法算偏移。C 本来也没有原生的多维张量对象。

**Q2. `wq` 形状是 `(layer, dim, n_heads * head_size)`，`wk`/`wv` 是 `(layer, dim, n_kv_heads * head_size)`。当 `n_kv_heads < n_heads` 时这说明什么？**
说明这是 GQA：KV 头数比 query 头数少，`wk`/`wv` 因此比 `wq` 更窄。多个 query 头共享同一组 K、V，既省了投影参数，也让 `key_cache`/`value_cache` 更小、推理更省内存。当 `n_kv_heads == n_heads` 时就退化回普通 MHA。

**Q3. `forward(t, token, pos)` 一次只吃一个 token，那一整句话是怎么生成的？**
靠外层 generate 循环自回归：喂第一个 token（`pos=0`）→ forward 出 logits → 采样下一个 token → 用它当输入、`pos` 加一再 forward……每一步都把当前 token 的 k/v 写进 KV cache，后续直接复用历史，不重算前文，直到吐出结束符或写满 `seq_len`。

</details>

## 小结与下一讲预告

这一讲我们没碰一行算法，但拿到了整季最重要的东西：一张地图。你现在知道 llama2.c 把模型拆成**蓝图 / 权重 / 草稿纸**三个结构体，知道权重全是指进一块 mmap 内存的裸指针，知道 Llama 对 GPT 的五处架构替换分别藏在哪些字段里，也知道 `forward` 是"一次一个 token"的心脏。

但有个坑还没填：`TransformerWeights` 里那一堆 `float*`，到底是**怎么**精确地指到 `.bin` 文件里正确位置的？文件头怎么读出 `Config`？mmap 之后又怎么按 `Config` 把基地址 `data` 切成 `token_embedding_table`、`wq`、`w1`…… 这一连串偏移计算？

**下一讲（第 01 讲）**：从 `build_transformer` / `memory_map_weights` 入手，逐行看权重是怎么被 mmap 进来、再按 `Config` 把一块裸内存"切"成那十二个指针的——把今天这张地图，第一次真正接到磁盘上的字节。
