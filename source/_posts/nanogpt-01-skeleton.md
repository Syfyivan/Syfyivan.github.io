---
title: "《nanoGPT 源码逐行》第01讲 · model.py 骨架：嵌入、权重共享与初始化"
date: 2026-06-29 10:02:00
tags: [AI, 深度学习, GPT, Transformer, nanoGPT, 源码解析, 课程]
categories: [技术笔记]
toc: true
visibility: public
---

<style>
.ng-b{display:inline-block;font-size:12px;font-weight:700;padding:1px 8px;border-radius:999px;vertical-align:middle;margin-left:6px;line-height:1.7;white-space:nowrap}
.ng-core{color:#fff;background:#b73a2c}
.ng-key{color:#b73a2c;background:rgba(183,58,44,.1);border:1px solid rgba(183,58,44,.3)}
.ng-skim{color:#3f5d7e;background:rgba(63,93,126,.1);border:1px solid rgba(63,93,126,.25)}
.ng-note{margin:14px 0;padding:12px 16px;border-left:3px solid #3f5d7e;background:rgba(63,93,126,.06);border-radius:0 4px 4px 0}
.ng-why{margin:14px 0;padding:12px 16px;border-left:3px solid #69727d;background:rgba(105,114,125,.07);border-radius:0 4px 4px 0;color:#3a4049}
.ng-key-note{margin:14px 0;padding:12px 16px;border-left:3px solid #b73a2c;background:rgba(183,58,44,.06);border-radius:0 4px 4px 0}
.ng-fold{margin:14px 0;border:1px solid rgba(29,33,39,.14);border-radius:6px;background:#fafafa;padding:0 16px}
.ng-fold>summary{cursor:pointer;padding:12px 0;font-weight:700;color:#1d2127}
.ng-fold[open]{padding-bottom:8px}
.ng-card{margin:16px 0;padding:14px 18px;border:1px solid rgba(183,58,44,.25);border-radius:8px;background:rgba(183,58,44,.03)}
html[data-user-color-scheme="dark"] .ng-note{background:rgba(126,168,224,.1);border-left-color:#7ea8e0;color:#c9cdd4}
html[data-user-color-scheme="dark"] .ng-why{background:rgba(255,255,255,.04);border-left-color:#8b93a0;color:#aeb4be}
html[data-user-color-scheme="dark"] .ng-key-note{background:rgba(224,108,92,.12);border-left-color:#e0746b;color:#d6dae0}
html[data-user-color-scheme="dark"] .ng-fold{background:rgba(255,255,255,.03);border-color:rgba(255,255,255,.14)}
html[data-user-color-scheme="dark"] .ng-fold>summary{color:#e6e8ec}
html[data-user-color-scheme="dark"] .ng-card{background:rgba(224,108,92,.08);border-color:rgba(224,108,92,.3);color:#d6dae0}
html[data-user-color-scheme="dark"] .ng-key{color:#ef9a8e;background:rgba(224,108,92,.14);border-color:rgba(224,108,92,.4)}
html[data-user-color-scheme="dark"] .ng-skim{color:#9fc1ec;background:rgba(126,168,224,.14);border-color:rgba(126,168,224,.35)}
</style>

## 本讲定位

<div class="ng-key-note"><strong>一句话</strong>：第 00 讲走通了 <code>forward</code> 这条数据主干道；这一讲回到 <code>GPT.__init__</code>，看模型是怎么"搭"出来的——配置、两张嵌入表、N 个 Block 的堆叠、输出投影，以及两个容易被略过却很关键的设计：<strong>权重共享</strong>（weight tying）和<strong>残差缩放初始化</strong>。读完，你对"一个 GPT 由哪些零件、按什么规格拼成"了如指掌。</div>

## GPTConfig：模型的规格单 <span class="ng-b ng-key">重点</span>

```python
@dataclass
class GPTConfig:
    block_size: int = 1024
    vocab_size: int = 50304 # GPT-2 50257 padded up to nearest multiple of 64
    n_layer: int = 12
    n_head: int = 12
    n_embd: int = 768
    dropout: float = 0.0
    bias: bool = True
```

整个模型的"规格"就这七个数：

| 字段 | 含义 |
|---|---|
| `block_size` | 最大上下文长度（一次最多看多少个 token） |
| `vocab_size` | 词表大小（能认识多少个不同 token） |
| `n_layer` | Block 层数（叠多少层 Transformer） |
| `n_head` | 注意力头数（第 02 讲） |
| `n_embd` | 每个 token 向量的宽度，全文记作 **C** |
| `dropout` | 随机失活比例（默认 0，预训练通常不开） |
| `bias` | Linear / LayerNorm 要不要 bias（False 略快略好） |

这套默认值 `n_layer=12, n_head=12, n_embd=768, block_size=1024` 就是 **GPT-2 small（124M 参数）** 的规格。

<div class="ng-note"><strong>为什么是 50304 不是 50257</strong>：GPT-2 真实词表是 50257，这里 padding 到 64 的倍数（50304）。多出来的几十个 token 永远不会出现、无害，但让词表维度对齐到 64，<strong>矩阵乘法在 GPU 上更快</strong>。一个"免费午餐"式的工程小动作。</div>

## GPT.__init__：把零件拼起来 <span class="ng-b ng-core">必读</span>

```python
self.transformer = nn.ModuleDict(dict(
    wte = nn.Embedding(config.vocab_size, config.n_embd),
    wpe = nn.Embedding(config.block_size, config.n_embd),
    drop = nn.Dropout(config.dropout),
    h = nn.ModuleList([Block(config) for _ in range(config.n_layer)]),
    ln_f = LayerNorm(config.n_embd, bias=config.bias),
))
self.lm_head = nn.Linear(config.n_embd, config.vocab_size, bias=False)
```

逐个看（`ModuleDict` 只是个能按名字取子模块的容器，方便 `forward` 里写 `self.transformer.wte(...)`）：

- **`wte`（token embedding）**：一张 `(vocab_size, n_embd)` 的查找表，第 `i` 行就是 token `i` 的向量。`nn.Embedding` 的本质就是"用整数 id 去索引矩阵的某一行"——所谓"把词变成向量"，其实就是查表。
- **`wpe`（position embedding）**：一张 `(block_size, n_embd)` 的查找表，第 `p` 行是"位置 `p`"的向量。
- **`drop`**：嵌入后的 dropout。
- **`h`**：`n_layer` 个 `Block` 组成的 `ModuleList`——这就是"堆 N 层 Transformer"那句话的代码。每个 Block 内部是注意力 + MLP（第 02、03 讲）。
- **`ln_f`**：所有 Block 之后的最后一次 LayerNorm。
- **`lm_head`**：一个 `n_embd → vocab_size` 的线性层（无 bias），把每个位置的 C 维向量投影成"词表上每个词的打分"——也就是 `logits`。

<div class="ng-note"><strong>对照 00 讲</strong>：这些零件正是 <code>forward</code> 里被依次用到的那些（<code>wte(idx)+wpe(pos)</code> → <code>drop</code> → 逐个 <code>h</code> → <code>ln_f</code> → <code>lm_head</code>）。__init__ 负责"造零件"，forward 负责"走流程"。</div>

## 权重共享：wte 和 lm_head 是同一张矩阵 <span class="ng-b ng-core">必读</span>

```python
self.transformer.wte.weight = self.lm_head.weight # weight tying
```

这一行容易被一眼扫过，但它很重要。

<div class="ng-key-note"><strong>weight tying（权重绑定）</strong>：输入端的 token 嵌入矩阵是 <code>(vocab_size, n_embd)</code>，输出端的投影矩阵是 <code>(n_embd, vocab_size)</code>——两者互为转置。nanoGPT 让它们<strong>共享同一份参数</strong>。好处有二：① <strong>省一大坨参数</strong>（词表约 5 万 × 768 ≈ 3900 万个数，省下整整一份）；② 直觉上，"把 token 编码成向量"和"把向量解码回 token 的打分"本就该用同一套语义，共享反而更合理、效果更好。这是 GPT-2 起就在用的技巧。</div>

<div class="ng-note"><strong>Python 细节</strong>：这行让两个 <code>.weight</code> 指向<strong>同一个 Tensor 对象</strong>。所以训练时它们的梯度天然合并、一起更新，不会"各练各的"。</div>

## 初始化：普通 + 残差缩放 <span class="ng-b ng-key">重点</span>

```python
self.apply(self._init_weights)
# scaled init to the residual projections, per GPT-2 paper
for pn, p in self.named_parameters():
    if pn.endswith('c_proj.weight'):
        torch.nn.init.normal_(p, mean=0.0, std=0.02/math.sqrt(2 * config.n_layer))
```

```python
def _init_weights(self, module):
    if isinstance(module, nn.Linear):
        torch.nn.init.normal_(module.weight, mean=0.0, std=0.02)
        if module.bias is not None:
            torch.nn.init.zeros_(module.bias)
    elif isinstance(module, nn.Embedding):
        torch.nn.init.normal_(module.weight, mean=0.0, std=0.02)
```

第一步 `apply(self._init_weights)`：所有 Linear、Embedding 的权重用正态分布 `N(0, 0.02)` 初始化，bias 置 0。常规操作。

第二步是点睛：只对名字以 `c_proj.weight` 结尾的参数（每个 Block 里注意力和 MLP 的**输出投影**）额外缩小，标准差变成 `0.02 / sqrt(2 · n_layer)`。

<div class="ng-why"><strong>为什么单独缩放 c_proj？</strong>因为残差流是层层<strong>相加</strong>的（00 讲的 <code>x = x + sublayer(...)</code>）。如果每层残差分支的输出方差都是 0.02，叠加 N 层后方差会越累越大，深层数值容易爆炸。把每个残差分支的<strong>出口</strong>（c_proj）按 <code>1/sqrt(2·n_layer)</code> 缩小，让 N 层加完后总方差仍然受控。<code>2·n_layer</code> 里的 2 是因为每个 Block 有<strong>两个</strong>残差分支（注意力 + MLP）。这是 GPT-2 论文里的稳定性技巧。</div>

<details class="ng-fold"><summary>顺带：get_num_params 怎么数出 124M <span class="ng-b ng-skim">可跳读</span></summary>

```python
def get_num_params(self, non_embedding=True):
    n_params = sum(p.numel() for p in self.parameters())
    if non_embedding:
        n_params -= self.transformer.wpe.weight.numel()
    return n_params
```

默认把位置嵌入 `wpe` 的参数减掉，报告"非嵌入"参数量（更能反映模型的"算力"规模）。注意它**没有**减 `wte`——因为 `wte` 和 `lm_head` 共享，这份参数在最后一层当投影权重实际参与了计算，所以算进去。默认配置下这么一数，就是约 124M。

</details>

## 速查卡 <span class="ng-b ng-core">必读</span>

<div class="ng-card"><strong>骨架速记</strong><br/>• <code>GPTConfig</code> = 规格单：layer / head / embd / block_size / vocab。默认 = GPT-2 small（124M）。<br/>• <code>__init__</code> 拼装：<code>wte</code>+<code>wpe</code> 两张嵌入查找表 → <code>h</code>（N 个 Block）→ <code>ln_f</code> → <code>lm_head</code> 投影到词表。<br/>• <strong>weight tying</strong>：<code>wte.weight = lm_head.weight</code>，输入嵌入与输出投影共享一份参数，省参数也更好。<br/>• <strong>残差缩放初始化</strong>：c_proj 权重按 <code>1/sqrt(2·n_layer)</code> 缩小，防深层残差累加数值爆炸。</div>

## 自测 <span class="ng-b ng-skim">可跳读</span>

<details class="ng-fold"><summary>3 题检验 <span class="ng-b ng-skim">可跳读</span></summary>

**Q1.** `nn.Embedding(vocab_size, n_embd)` 本质上是什么操作？给一个 token id，它怎么变出向量？

**Q2.** weight tying 把哪两个矩阵绑成一份？为什么这么做合理（说出两个理由）？

**Q3.** 为什么只对 `c_proj.weight` 做额外的缩放初始化，而不是所有层？`2 * n_layer` 里的 2 是哪来的？

---

**A1.** 本质是一张 `(vocab_size, n_embd)` 的查找表（矩阵）。给 token id `i`，就取出矩阵的第 `i` 行作为它的嵌入向量——就是按整数索引取行，没有别的。

**A2.** 绑的是输入端 token 嵌入矩阵 `(vocab, n_embd)` 和输出端投影 `lm_head` 的 `(n_embd, vocab)`（互为转置）。理由：① 省下约 3900 万参数；② "编码成向量"和"解码回 token"语义对偶，共享更合理、效果更好。

**A3.** 因为 c_proj 是每个残差分支的出口，残差是层层相加的，不缩放会让方差随深度累积、深层爆炸。只缩放出口就能控住整条残差流。`2` 是因为每个 Block 有注意力、MLP 两个残差分支。

</details>

## 小结与下一讲预告

`__init__` 造零件、`forward` 走流程——这一讲我们把"造零件"看透了：两张嵌入表、N 个 Block、一个共享权重的输出投影，外加防爆炸的缩放初始化。但有个零件我们一直放在黑箱里：**Block 内部的注意力到底在算什么**。

下一讲（02）就钻进 GPT 的心脏——`CausalSelfAttention`：每个 token 如何用 query 去和历史每个 token 的 key 打分、再按分数加权聚合 value，以及"因果掩码"如何保证它只能看过去、不能偷看未来。
