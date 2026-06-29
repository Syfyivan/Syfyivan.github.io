---
title: "《nanoGPT 源码逐行》第05讲 · 生成：generate() 的自回归采样"
date: 2026-06-29 10:06:00
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

<div class="ng-key-note"><strong>一句话</strong>：第 04 讲把模型训出来、权重存进了 <code>ckpt.pt</code>。最后一讲，让它"说话"。<code>generate()</code> 是一个<strong>自回归采样循环</strong>——把模型自己刚生成的 token 喂回去，一个接一个地续写。读完你会搞懂 <code>temperature</code> 和 <code>top-k</code> 这两个采样旋钮，以及 <code>sample.py</code> 怎么把"加载权重 → 编码 prompt → 生成 → 解码"串起来。这也是全系列的收尾。</div>

## generate：自回归采样循环 <span class="ng-b ng-core">必读</span>

```python
@torch.no_grad()
def generate(self, idx, max_new_tokens, temperature=1.0, top_k=None):
    for _ in range(max_new_tokens):
        # crop context to block_size if growing too long
        idx_cond = idx if idx.size(1) <= self.config.block_size else idx[:, -self.config.block_size:]
        logits, _ = self(idx_cond)
        # pluck logits at final step and scale by temperature
        logits = logits[:, -1, :] / temperature
        if top_k is not None:
            v, _ = torch.topk(logits, min(top_k, logits.size(-1)))
            logits[logits < v[:, [-1]]] = -float('Inf')
        probs = F.softmax(logits, dim=-1)
        idx_next = torch.multinomial(probs, num_samples=1)
        idx = torch.cat((idx, idx_next), dim=1)
    return idx
```

`@torch.no_grad()` 先声明：生成不需要梯度，关掉它省显存、加速。然后循环 `max_new_tokens` 次，每次吐一个 token。逐步拆：

- **① 裁上下文** `idx_cond`：如果当前序列已经超过 `block_size`，只保留最后 `block_size` 个 token——模型一次最多看这么长，更早的内容只能丢掉。
- **② 前向** `logits, _ = self(idx_cond)`：注意这里 `targets=None`，走的是第 00 讲那条**推理分支**——只对最后一个位置算 `lm_head`，输出 `(B, 1, V)`，省掉前面位置的无用投影。
- **③ 取最后位置 + 温度** `logits[:, -1, :] / temperature`：取出最后一个位置的 logits `(B, V)`，除以 `temperature`。

<div class="ng-why"><strong>temperature（温度）旋钮</strong>：控制随机性。logits 除以 T 再 softmax——<code>T &lt; 1</code> 时 logits 被放大、分布更<strong>尖锐</strong>，模型更确定/保守（总挑高概率词）；<code>T &gt; 1</code> 时分布更<strong>平</strong>，更随机/有创意（也更容易胡说）；<code>T = 1</code> 不变。<code>sample.py</code> 默认 0.8，略偏保守。</div>

- **④ top-k 截断**：只在最可能的 `k` 个 token 里采。`torch.topk` 找出第 `k` 大的 logit（`v[:, [-1]]`），把所有比它小的 logits 设成 `-inf`（softmax 后概率为 0）。

<div class="ng-note"><strong>top-k 在做什么</strong>：砍掉概率长尾，避免偶尔采到一个莫名其妙的低概率词把句子带跑偏。<code>sample.py</code> 默认 <code>top_k=200</code>。它和 temperature 是两个独立旋钮：temperature 调"整体软硬"，top-k 调"候选范围"。</div>

- **⑤ softmax** → `probs (B, V)`：把 logits 变成概率分布。
- **⑥ 采样** `idx_next = torch.multinomial(probs, num_samples=1)`：按概率**随机抽**一个 token——注意不是取 `argmax`（最大值），而是按概率掷骰子，这样输出才有多样性、不会每次都一模一样。
- **⑦ 拼回去** `idx = torch.cat((idx, idx_next), dim=1)`：把新 token 接到序列末尾。下一轮，它会作为输入的一部分被一起喂回去。

<div class="ng-key-note"><strong>"自回归"就在第 ⑦ 步</strong>：把自己刚生成的 token 拼回输入，作为下一步的条件，再预测下一个——用自己的历史输出，推测下一个输出。一个 token 一个 token、<strong>串行</strong>地写下去。这也是为什么生成比训练慢：训练一次前向能并行算 t 个位置的损失，生成却必须一步一个 token、排着队来。</div>

## sample.py：把生成串成一个脚本 <span class="ng-b ng-key">重点</span>

```python
# 1) 载入模型：从训练 checkpoint 恢复，或直接用 GPT-2
if init_from == 'resume':
    checkpoint = torch.load(ckpt_path, map_location=device)
    model = GPT(GPTConfig(**checkpoint['model_args']))
    model.load_state_dict(checkpoint['model'])
elif init_from.startswith('gpt2'):
    model = GPT.from_pretrained(init_from, dict(dropout=0.0))
model.eval(); model.to(device)

# 2) 编/解码器：GPT-2 的 BPE 分词（tiktoken）
enc = tiktoken.get_encoding("gpt2")
encode = lambda s: enc.encode(s, allowed_special={"<|endoftext|>"})
decode = lambda l: enc.decode(l)

# 3) 编码 prompt → 生成 → 解码
start_ids = encode(start)
x = (torch.tensor(start_ids, dtype=torch.long, device=device)[None, ...])
with torch.no_grad():
    for k in range(num_samples):
        y = model.generate(x, max_new_tokens, temperature=temperature, top_k=top_k)
        print(decode(y[0].tolist()))
```

三段：

- **载入模型**：`'resume'` 从第 04 讲训练存下的 `ckpt.pt` 恢复（用 `model_args` 重建 `GPTConfig`，再 `load_state_dict` 灌权重）；或 `'gpt2'` 直接用 `from_pretrained` 下载 OpenAI 的 GPT-2 权重。`model.eval()` 关掉 dropout（推理要确定性的网络）。
- **编/解码器**：`tiktoken` 是 GPT-2 的 BPE 分词器。`encode` 把文本切成 token id 列表，`decode` 反过来把 id 拼回文本。（若数据集自带 `meta.pkl`，则改用字符级编码——比如莎士比亚 char 级 demo。）
- **生成**：把起始 prompt 编码成 `x`（形状 `(1, t)`），调 `model.generate` 拿到续写后的整条 token 序列 `y`，再 `decode` 回文本打印。循环 `num_samples` 次，得到多个不同的样本（因为第 ⑥ 步是随机采样）。

<div class="ng-note"><strong>闭环了</strong>：00–03 讲搭出模型、04 讲把它训成会预测下一个词、05 讲让它把"预测下一个词"反复自回归地用起来，就把一个句子写了出来。从随机初始化的权重，到能续写文本，整条链路你现在都看过了。</div>

## 速查卡 <span class="ng-b ng-core">必读</span>

<div class="ng-card"><strong>生成速记</strong><br/>• <code>generate</code> = 自回归循环，每步：裁上下文 → 前向取最后位置 logits → ÷temperature（控随机）→ top-k（砍长尾）→ softmax → <code>multinomial</code> 随机采样 → 拼回序列、喂下一步。<br/>• <strong>temperature</strong>：&lt;1 更稳/保守，&gt;1 更野/有创意；<strong>top-k</strong>：只在最可能的 k 个里采。<br/>• 采样用 <code>multinomial</code>（按概率掷骰）而非 <code>argmax</code>，才有多样性。<br/>• <code>sample.py</code>：载入权重 → tiktoken 编码 prompt → <code>generate</code> → decode 成文本。</div>

## 自测 <span class="ng-b ng-skim">可跳读</span>

<details class="ng-fold"><summary>3 题检验 <span class="ng-b ng-skim">可跳读</span></summary>

**Q1.** generate 每一步为什么只取 `logits[:, -1, :]`（最后一个位置）？前面位置的预测哪去了？

**Q2.** temperature 和 top-k 分别在调什么？调大 temperature 会让输出更怎样？

**Q3.** 为什么用 `torch.multinomial` 而不是直接取 `argmax`？"自回归"具体指代码里哪一步？

---

**A1.** 因为 prompt 和已生成的 token 都是已知的，只有"下一个"要猜，而预测"下一个"靠的就是最后一个位置的输出分布。前面位置的预测在生成时用不上（它们的"下一个"已经定了），所以推理分支干脆只算最后一个位置，省算力。

**A2.** temperature 调整体随机性（logits 除以它再 softmax，<1 更尖锐/保守，>1 更平/随机）；top-k 限定候选范围（只在概率最高的 k 个 token 里采）。调大 temperature 输出更随机、更有创意，但也更容易跑偏胡说。

**A3.** argmax 每次都选最高概率词，输出僵硬且无多样性；multinomial 按概率分布随机采，才能生成丰富、每次不同的文本。"自回归"指第 ⑦ 步 `idx = torch.cat((idx, idx_next), dim=1)`——把自己刚生成的 token 接回输入，作为下一步的条件。

</details>

## 全系列小结 <span class="ng-b ng-core">必读</span>

六讲走完，一个真正的 GPT 你已经从里到外看过一遍：

- **00** 数据流全景：token id → 嵌入 → N 个 Block → logits → loss。
- **01** 骨架：两张嵌入表、weight tying、残差缩放初始化。
- **02** 自注意力：QKV、多头、因果掩码下的缩放点积——GPT 的心脏。
- **03** Block：LayerNorm + MLP + 残差 + Pre-LN，叠 N 层就是 GPT。
- **04** 训练循环：get_batch、lr 调度、梯度累积、AdamW——micrograd 训练循环的工业版。
- **05** 生成：自回归采样，把"预测下一个词"反复用起来写出文本。

<div class="ng-key-note"><strong>从 micrograd 到 nanoGPT</strong>：你先在 <a href="/courses/micrograd/">micrograd</a> 里手写了 autograd 与训练循环的<strong>最小种子</strong>，又在 nanoGPT 里看到这颗种子长成一个能复现 GPT-2 的<strong>真 Transformer</strong>——变的是规模和工程，不变的是"前向 → loss → backward → 更新"那个内核。读到这，你对"大模型到底在算什么"应该已经没有黑箱了。</div>

<div class="ng-note"><strong>下一站</strong>：这条"玩具 AI 源码"线再往前，是 <strong>llama2.c</strong>（用一个 C 文件做推理，看 Transformer 怎么脱离 PyTorch 裸跑）。你已经懂了 GPT 的全貌，剩下的都是把它"翻译"到更底层。</div>

读完整个 nanoGPT，恭喜——你已经把一个能写字的 GPT，从结构到训练到生成，完整地看穿了。🚀
