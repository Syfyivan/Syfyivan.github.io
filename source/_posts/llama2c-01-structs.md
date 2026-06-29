---
title: "《llama2.c 源码逐行》第01讲 · 权重加载：mmap 与一根指针切出整个模型"
date: 2026-06-29 10:32:00
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

<div class="l2-key-note"><strong>本讲定位</strong>：第 00 讲把 <code>TransformerWeights</code> 的字段都摆出来了，但留了个坑——那一堆 <code>float*</code> 到底<strong>怎么</strong>精确指到 <code>.bin</code> 文件里正确的位置？本讲从 <code>build_transformer</code> / <code>read_checkpoint</code> / <code>memory_map_weights</code> 入手，看权重怎么被 <strong>mmap</strong> 进来、再按 <code>Config</code> 把一块裸内存"切"成那十几个指针。这是 C 程序"零拷贝加载大模型"的经典手法。</div>

<div class="l2-note"><strong>checkpoint 长什么样</strong>：<code>.bin</code> 文件 = 一个 <code>Config</code> 结构的文件头（7 个 int）+ 紧接着一大块按固定顺序铺平的 <code>float</code> 权重。加载就两步：先读头拿超参，再把后面那块权重映射进来、按超参切。</div>

## read_checkpoint：读头 + 把文件映射进内存 <span class="l2-b l2-core">必读</span>

```c
void read_checkpoint(char* checkpoint, Config* config, TransformerWeights* weights, int* fd, float** data, ssize_t* file_size) {
    FILE *file = fopen(checkpoint, "rb");
    fread(config, sizeof(Config), 1, file);        // read the config header
    int shared_weights = config->vocab_size > 0 ? 1 : 0; // negative vocab_size = unshared
    config->vocab_size = abs(config->vocab_size);
    fseek(file, 0, SEEK_END); *file_size = ftell(file); fclose(file);
    *fd = open(checkpoint, O_RDONLY);
    *data = mmap(NULL, *file_size, PROT_READ, MAP_PRIVATE, *fd, 0); // memory-map weights, zero-copy
    float* weights_ptr = *data + sizeof(Config)/sizeof(float);
    memory_map_weights(weights, config, weights_ptr, shared_weights);
}
```

逐步：

- `fread(config, sizeof(Config), 1, file)`：把文件**最前面 `sizeof(Config)` 字节**直接读成一个 `Config` 结构——这就是那 7 个 int 的文件头。读完，所有超参就有了。
- `shared_weights = config->vocab_size > 0`：一个小 hack——用 `vocab_size` 的**正负号**标记"分类头是否和词嵌入共享"。负数表示不共享；读出标记后立刻 `abs` 取回正值。
- `fseek` + `ftell`：拿到文件总字节数。
- **`mmap(NULL, file_size, PROT_READ, MAP_PRIVATE, fd, 0)`**：本讲的主角。它把整个文件**映射**进进程地址空间，返回指针 `data`。之后你像访问普通内存一样访问 `data`，但底层是**操作系统按需把用到的页从磁盘换进来**——并不真的一次性读进内存。

<div class="l2-why"><strong>mmap 的妙处</strong>：① <strong>零拷贝</strong>——不用 <code>malloc</code> 一大块再 <code>fread</code> 进去，省一倍内存和时间；② <strong>按需分页</strong>——几 GB 的权重，只有真正算到的那几页才进物理内存；③ 多个进程能<strong>共享</strong>同一份只读权重。这就是为什么 llama2.c 加载一个大模型几乎瞬间、常驻内存又低。</div>

- `weights_ptr = *data + sizeof(Config)/sizeof(float)`：把指针从文件开头**跳过文件头**，指到权重区的第一个 `float`。
- `memory_map_weights(...)`：拿这个基地址，去切出每一个权重指针。

## memory_map_weights：一根游标走天下 <span class="l2-b l2-core">必读</span>

```c
void memory_map_weights(TransformerWeights *w, Config* p, float* ptr, int shared_weights) {
    int head_size = p->dim / p->n_heads;
    unsigned long long n_layers = p->n_layers;
    w->token_embedding_table = ptr; ptr += p->vocab_size * p->dim;
    w->rms_att_weight = ptr;        ptr += n_layers * p->dim;
    w->wq = ptr; ptr += n_layers * p->dim * (p->n_heads * head_size);
    w->wk = ptr; ptr += n_layers * p->dim * (p->n_kv_heads * head_size);
    w->wv = ptr; ptr += n_layers * p->dim * (p->n_kv_heads * head_size);
    w->wo = ptr; ptr += n_layers * (p->n_heads * head_size) * p->dim;
    w->rms_ffn_weight = ptr; ptr += n_layers * p->dim;
    w->w1 = ptr; ptr += n_layers * p->dim * p->hidden_dim;
    w->w2 = ptr; ptr += n_layers * p->hidden_dim * p->dim;
    w->w3 = ptr; ptr += n_layers * p->dim * p->hidden_dim;
    w->rms_final_weight = ptr; ptr += p->dim;
    ptr += p->seq_len * head_size / 2; // skip old freq_cis_real (RoPE, now computed on the fly)
    ptr += p->seq_len * head_size / 2; // skip old freq_cis_imag
    w->wcls = shared_weights ? w->token_embedding_table : ptr; // weight tying optional
}
```

整个函数就一个套路：**一根游标 `ptr` 从权重区开头出发，每赋值一个权重指针，就把 `ptr` 往后推过这块权重的大小**。

- `token_embedding_table = ptr; ptr += vocab_size * dim;`：词嵌入表占 `vocab_size × dim` 个 float，记下起点、游标越过它。
- `rms_att_weight`：每层一个 `dim` 长的缩放向量，`n_layers` 层 → `n_layers * dim`。
- `wq` 占 `n_layers * dim * (n_heads*head_size)`；而 **`wk`/`wv` 用 `n_kv_heads`**——`n_kv_heads < n_heads` 时它们更窄，这正是 **GQA** 在加载阶段的体现。
- `w1`/`w2`/`w3`：FFN 的三个矩阵（**三个**，SwiGLU）。
- 然后是两行 **`ptr += seq_len * head_size / 2`**：直接**跳过**两块。注释说得明白——这里以前存的是 RoPE 的 `freq_cis` 预计算表，现在 RoPE 改成在 `forward` 里实时算了，所以新格式这两块是空的，游标跳过即可。
- `wcls = shared_weights ? token_embedding_table : ptr`：**weight tying**——若共享，分类头直接指回词嵌入表，不再单独占内存；否则指向剩下那块。

<div class="l2-key-note"><strong>最关键</strong>：整个函数<strong>没有一次内存分配、没有一次拷贝</strong>。它只是把一根 <code>ptr</code> 在 mmap 出来的只读内存上"走一遍"，边走边记下每段权重的起点。权重的"形状"全靠这套偏移算术维持——这就是第 00 讲那句"形状靠注释、寻址靠乘法"在加载阶段的样子。</div>

## build_transformer：总入口 <span class="l2-b l2-key">重点</span>

```c
void build_transformer(Transformer *t, char* checkpoint_path) {
    read_checkpoint(checkpoint_path, &t->config, &t->weights, &t->fd, &t->data, &t->file_size);
    malloc_run_state(&t->state, &t->config); // 给 RunState 的激活 buffer 分配内存
}
```

两步：`read_checkpoint`（读 Config + mmap 权重 + 切指针）+ `malloc_run_state`（给 `RunState` 那些激活缓冲分配内存）。

<div class="l2-note"><strong>一静一动</strong>：权重是 <code>mmap</code> 来的<strong>只读共享内存</strong>（河床，不变）；激活是 <code>malloc</code> 出来的<strong>可写草稿纸</strong>（河水，每个 token 反复覆写）。两者泾渭分明——这也是为什么权重能在多进程间共享、而每个推理过程有自己的一份 <code>RunState</code>。</div>

## 速查卡 <span class="l2-b l2-core">必读</span>

<div class="l2-card"><strong>加载速记</strong><br/>• <code>.bin</code> = <code>Config</code> 文件头 + 一大块按固定顺序铺平的 float 权重。<br/>• <code>read_checkpoint</code>：fread 读头 → <strong>mmap 零拷贝映射</strong>整个文件 → 跳过文件头得权重基址。<br/>• <code>memory_map_weights</code>：一根 <code>ptr</code> 游标，<strong>赋值即后推</strong>，把裸内存切成各权重指针；wk/wv 用 n_kv_heads(GQA)、w1/w2/w3(SwiGLU)、跳过废弃的 RoPE 表、wcls 可共享词嵌入(weight tying)。<br/>• 全程<strong>零分配、零拷贝</strong>，权重形状靠偏移算术维持。</div>

## 自测 <span class="l2-b l2-skim">可跳读</span>

<details class="l2-fold"><summary>3 题检验 <span class="l2-b l2-skim">可跳读</span></summary>

**Q1.** mmap 相比"malloc 一块大内存 + fread 整个文件"好在哪？

**Q2.** `memory_map_weights` 里游标 `ptr += ...` 的每一步在干什么？为什么 `wk`/`wv` 的步长用 `n_kv_heads` 而 `wq` 用 `n_heads`？

**Q3.** `wcls = shared_weights ? token_embedding_table : ptr` 这行表达了什么设计？`shared_weights` 又是怎么从文件里读出来的？

---

**A1.** 零拷贝（不复制一份到堆上，省一倍内存与时间）+ 按需分页（只有用到的页才进物理内存，几 GB 权重也能在小内存机跑）+ 只读权重可多进程共享。

**A2.** 每一步记下当前权重的起点指针，再把游标推过这块权重的元素个数（行数 × 行宽），从而把一块连续内存切成一段段。`wk`/`wv` 用 `n_kv_heads` 是因为 GQA 下 KV 头比 query 头少，K/V 投影矩阵更窄，占的内存也更小。

**A3.** weight tying——分类头与词嵌入表共享同一份参数时，`wcls` 直接指回 `token_embedding_table`，省下一大块内存。`shared_weights` 由文件头里 `vocab_size` 的正负号编码（负数表示不共享），读出后 `abs` 还原真实词表大小。

</details>

## 小结与下一讲预告

这一讲把"模型从磁盘到内存"那段补齐了：`mmap` 零拷贝映射整个 `.bin`，再用一根游标按 `Config` 把裸内存切成各权重指针，全程不分配、不拷贝。现在权重都在内存里、指针也都就位了。

下一讲（02）我们去看三个**数值原语**——`rmsnorm`、`softmax`、`matmul`。它们是后面 `forward` 反复调用的"算术地基"，尤其 `matmul`，你会看到它怎么用 `w[i*n+j]` 这套行优先寻址，把本讲切出来的权重指针真正"乘"起来。
