---
title: "《llama2.c 源码逐行》第05讲（终）· 采样与生成：top-p 与 generate 主循环"
date: 2026-06-29 10:36:00
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

<div class="l2-key-note"><strong>终讲</strong>：第 04 讲 <code>forward</code> 算出了 logits（每个词的打分），但还没"选"出下一个词。这一讲：<strong>sampler</strong> 怎么从 logits 挑下一个 token（argmax / 温度 / top-p 核采样）+ <strong>generate</strong> 主循环把一切串成"开口说话"。最后为整条"玩具 AI 源码"线做收尾。</div>

## sampler：从 logits 里挑一个 token <span class="l2-b l2-core">必读</span>

三种基础采样策略，外加一个总入口。

```c
int sample_argmax(float* p, int n) { int mi=0; float mp=p[0]; for(int i=1;i<n;i++) if(p[i]>mp){mi=i;mp=p[i];} return mi; }

int sample_mult(float* p, int n, float coin) { // 按概率分布抽样（coin∈[0,1)）
    float cdf = 0.0f;
    for (int i = 0; i < n; i++) { cdf += p[i]; if (coin < cdf) return i; }
    return n - 1;
}

int sample_topp(float* probabilities, int n, float topp, ProbIndex* probindex, float coin) {
    int n0 = 0;
    const float cutoff = (1.0f - topp) / (n - 1); // 先粗筛掉太小的，提速
    for (int i = 0; i < n; i++) if (probabilities[i] >= cutoff) { probindex[n0].index = i; probindex[n0].prob = probabilities[i]; n0++; }
    qsort(probindex, n0, sizeof(ProbIndex), compare); // 概率降序
    float cumulative_prob = 0.0f; int last_idx = n0 - 1;
    for (int i = 0; i < n0; i++) { cumulative_prob += probindex[i].prob; if (cumulative_prob > topp) { last_idx = i; break; } }
    float r = coin * cumulative_prob; float cdf = 0.0f; // 在截断集里按概率采
    for (int i = 0; i <= last_idx; i++) { cdf += probindex[i].prob; if (r < cdf) return probindex[i].index; }
    return probindex[last_idx].index;
}
```

- **`sample_argmax`**：取概率最大的那个——贪心、确定，每次结果一样。
- **`sample_mult`**：按概率分布抽。`coin` 是 `[0,1)` 的随机数，沿累计分布 `cdf` 走，落到第一个让 `coin < cdf` 的位置。这是多样性的来源。
- **`sample_topp` / nucleus（核采样）**：只在"累计概率刚超过 `topp` 的最小词集"里采。逐步：先用 `cutoff` 粗筛掉太小的候选（提速）→ `qsort` 按概率降序 → 累加到超过 `topp` 时截断（`last_idx`）→ 在这个截断的"核"里按 `coin` 采。避免采到长尾低概率词把句子带跑偏。

```c
int sample(Sampler* sampler, float* logits) {
    int next;
    if (sampler->temperature == 0.0f) {
        next = sample_argmax(logits, sampler->vocab_size); // greedy
    } else {
        for (int q=0; q<sampler->vocab_size; q++) logits[q] /= sampler->temperature; // 温度
        softmax(logits, sampler->vocab_size);
        float coin = random_f32(&sampler->rng_state); // xorshift 随机数
        if (sampler->topp <= 0 || sampler->topp >= 1) next = sample_mult(logits, sampler->vocab_size, coin);
        else next = sample_topp(logits, sampler->vocab_size, sampler->topp, sampler->probindex, coin);
    }
    return next;
}
```

总入口 `sample`：`temperature == 0` 直接贪心 argmax；否则先把 logits **除以温度**、`softmax` 成概率、掷一个随机 `coin`，再按 `topp` 决定走普通采样还是核采样。

<div class="l2-why"><strong>温度 vs top-p 两个旋钮</strong>：<strong>temperature</strong> 调"软硬"——logits 除以它，&lt;1 让分布更尖锐（保守、爱挑高分词），&gt;1 更平（随机、有创意）；<strong>top-p</strong> 调"候选范围"——只在累计概率达 <code>topp</code> 的核里采。两个独立旋钮配合使用。<code>random_f32</code> 是自己实现的 xorshift 伪随机，又一处"零依赖"的体现。</div>

## generate：主循环，让模型开口 <span class="l2-b l2-core">必读</span>

```c
void generate(Transformer *transformer, Tokenizer *tokenizer, Sampler *sampler, char *prompt, int steps) {
    int num_prompt_tokens = 0;
    int* prompt_tokens = (int*)malloc((strlen(prompt)+3) * sizeof(int));
    encode(tokenizer, prompt, 1, 0, prompt_tokens, &num_prompt_tokens); // 1=加BOS, 0=不加EOS

    long start = 0; int next;
    int token = prompt_tokens[0]; // 用 prompt 第一个 token 起步
    int pos = 0;
    while (pos < steps) {
        float* logits = forward(transformer, token, pos); // 前向得下一个 token 的 logits
        if (pos < num_prompt_tokens - 1) {
            next = prompt_tokens[pos + 1]; // 还在喂 prompt：强制用 prompt 的下一个 token
        } else {
            next = sample(sampler, logits); // prompt 喂完：开始真正"生成"
        }
        pos++;
        if (next == 1) { break; } // BOS(=1) 作为序列终止符
        char* piece = decode(tokenizer, token, next);
        safe_printf(piece); fflush(stdout);
        token = next; // 自回归：把刚生成的 token 当下一步输入
    }
    printf("\n");
}
```

- `encode` 把 prompt 变成 token 序列。
- `while (pos < steps)`：每步 `forward(token, pos)` 得 logits，然后分两种情况选 `next`：

<div class="l2-key-note"><strong>两个阶段</strong>：<code>if (pos &lt; num_prompt_tokens - 1)</code> 时还在<strong>喂 prompt</strong>——直接用 <code>prompt_tokens[pos+1]</code>，<strong>不采样</strong>（这叫 prefill / 预填充：把 prompt 的 K/V 灌进 cache、推进到能预测第一个"新"词）；<code>else</code> 时 prompt 喂完，才开始<strong>真正生成</strong>（<code>sample</code> 采样）。</div>

- `pos++`；若 `next == 1`（BOS 用作终止符）则 `break`；否则 `decode` 成字符串、`safe_printf` 打印；`token = next`——**自回归**：把刚生成的 token 当下一步的输入，循环继续。

<div class="l2-note"><strong>对照 nanoGPT</strong>：这和 nanoGPT 的 <code>generate</code> 同构——一个 token 一个 token <strong>串行</strong>生成、把输出喂回输入。差别只是这里是裸 C + KV cache 增量、采样也手写。你在 PyTorch 里见过的"自回归生成"，到这里没有一点黑箱。</div>

## 速查卡 <span class="l2-b l2-core">必读</span>

<div class="l2-card"><strong>采样与生成速记</strong><br/>• <strong>sampler</strong>：argmax（贪心）/ mult（按概率）/ top-p（只在累计概率 topp 的核里采）。<br/>• <code>sample</code>：温度=0 走 argmax；否则 ÷温度 → softmax → 按 topp 选 mult 或 topp。<br/>• <strong>温度</strong>调软硬（&lt;1 保守，&gt;1 随机）、<strong>top-p</strong>调候选范围；两个独立旋钮。<br/>• <strong>generate</strong>：encode prompt → 循环 forward；prompt 阶段强制喂 token（prefill），之后采样生成；BOS 终止；<code>token=next</code> 自回归。</div>

## 自测 <span class="l2-b l2-skim">可跳读</span>

<details class="l2-fold"><summary>3 题检验 <span class="l2-b l2-skim">可跳读</span></summary>

**Q1.** temperature 和 top-p 分别调什么？temperature 调大、调到 0 各是什么效果？

**Q2.** top-p（核采样）相比"在全词表上按概率采"好在哪？

**Q3.** `generate` 里 `if (pos < num_prompt_tokens - 1)` 这个分支在干什么？为什么 prompt 阶段也要一步步 forward 而不是直接跳过？

---

**A1.** temperature 调分布软硬：调大（>1）更随机、有创意但易跑偏；调到 0 走 argmax，变成完全确定的贪心。top-p 调候选范围：只在累计概率达 topp 的最小词集里采。

**A2.** 它砍掉了概率长尾——那些单个概率极低、但加起来也能偶尔被抽中的"奇怪词"。只在高概率的核里采，既保留多样性、又避免句子突然跑偏，比全词表采样更稳。

**A3.** 那是 prefill（预填充）阶段：prompt 已知，不需要采样，直接用 prompt 的下一个 token；但仍要逐步 forward，因为要把 prompt 每个位置的 K/V 写进 KV cache、并把状态推进到"能预测第一个新词"的位置。喂完 prompt 才进入真正按采样生成的阶段。

</details>

## 全系列收尾：从一颗种子到一台裸机 <span class="l2-b l2-core">必读</span>

`forward` 算分、`sampler` 选词、`generate` 自回归——llama2.c 就这么用一个纯 C 文件，把一个真正的 Llama 2 推理跑了起来。回头看这整条"玩具 AI 源码"线：

<div class="l2-key-note"><strong>三课闭环</strong>：<a href="/courses/micrograd/">micrograd</a>（Python 手写 autograd 的<strong>最小种子</strong>，搞懂反向传播）→ <a href="/courses/nanogpt/">nanoGPT</a>（PyTorch <strong>训练</strong>一个真 GPT，搞懂 Transformer 与训练循环）→ <strong>llama2.c</strong>（纯 C <strong>推理</strong> Llama，把模型翻到最底层裸机，每个乘加都看得见）。你已经把"模型到底在算什么"，从一颗标量种子，一路看到了 CPU 上的 for 循环。</div>

<div class="l2-note"><strong>下一站</strong>：这条线还有最后一程 <strong>llm.c</strong>——karpathy 用纯 C/CUDA <strong>训练</strong> GPT-2，连反向传播都是手写的。它正好<strong>回到 micrograd</strong>：micrograd 是 Python 手写 autograd 的种子，llm.c 是同一件事在真 GPT-2 上的 C 版放大。读完它，"训练"这件事你也会没有黑箱。</div>

读到这里，恭喜——你已经把一个真实 LLM 的推理，从权重加载、注意力、FFN，到采样生成，完整地、逐行地看穿了。🔩
