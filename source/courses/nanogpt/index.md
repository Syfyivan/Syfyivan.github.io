---
title: "nanoGPT 源码逐行"
date: 2026-06-29 10:00:00
description: "读 Karpathy 的 nanoGPT：最简、可读的 GPT 训练/微调实现。model.py 定义一个真正的 Transformer，train.py 把它训成会写字的模型。读完你会懂注意力、Block、自回归生成与训练循环——它是 micrograd 之后的下一站。"
---

<style>
.ng-page{--ink:#1d2127;--text:#2a2f36;--muted:#69727d;--line:rgba(29,33,39,.12);--panel:#fff;--wash:#f4f5f3;--blue:#3f5d7e;--red:#b73a2c;color:var(--text)}
.ng-page *{box-sizing:border-box;min-width:0}
.ng-hero{padding:32px;border:1px solid var(--line);border-radius:6px;background:linear-gradient(135deg,rgba(183,58,44,.07),rgba(63,93,126,.08)),var(--panel)}
.ng-kicker{display:inline-flex;align-items:center;margin-bottom:14px;padding:6px 10px;border:1px solid rgba(63,93,126,.2);border-radius:999px;color:var(--blue);background:rgba(63,93,126,.08);font-size:13px;font-weight:760}
.ng-hero h2{margin:0 0 14px;color:var(--ink);font-size:30px;line-height:1.25}
.ng-hero p{margin:0;color:var(--muted);line-height:1.8}
.ng-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:20px 0 6px}
.ng-stat{padding:14px;border:1px solid var(--line);border-radius:4px;background:rgba(255,255,255,.6)}
.ng-stat strong{display:block;color:var(--ink);font-size:22px;line-height:1.1}
.ng-stat span{color:var(--muted);font-size:13px}
.ng-legend{display:flex;flex-wrap:wrap;gap:14px;margin:22px 0 6px;padding:14px 18px;border:1px solid var(--line);border-radius:6px;background:var(--wash)}
.ng-legend span{font-size:13px;color:var(--muted)}
.ng-b{display:inline-block;font-size:12px;font-weight:700;padding:1px 8px;border-radius:999px;line-height:1.7;white-space:nowrap}
.ng-core{color:#fff;background:var(--red)}
.ng-key{color:var(--red);background:rgba(183,58,44,.1);border:1px solid rgba(183,58,44,.3)}
.ng-skim{color:var(--blue);background:rgba(63,93,126,.1);border:1px solid rgba(63,93,126,.25)}
.ng-list{display:grid;gap:10px;margin-top:18px}
.ng-row{display:grid;grid-template-columns:46px 1fr auto;gap:14px;align-items:center;padding:14px 16px;border:1px solid var(--line);border-radius:5px;background:var(--panel);text-decoration:none!important;color:var(--text)}
.ng-row:hover{border-color:rgba(183,58,44,.4);transform:translateY(-1px);box-shadow:0 6px 18px rgba(22,32,42,.07)}
.ng-num{font-size:20px;font-weight:800;color:var(--blue);text-align:center}
.ng-rt h4{margin:0 0 3px;color:var(--ink);font-size:16px}
.ng-rt p{margin:0;color:var(--muted);font-size:13px;line-height:1.6}
.ng-tag{font-size:12px;font-weight:700;color:var(--muted);white-space:nowrap}
html[data-user-color-scheme="dark"] .ng-page{--ink:#e8eaed;--text:#c9cdd4;--muted:#9aa3ad;--line:rgba(255,255,255,.14);--panel:#1c2026;--wash:#23272e;--blue:#9fc1ec;--red:#ef9a8e}
html[data-user-color-scheme="dark"] .ng-stat{background:rgba(255,255,255,.03)}
@media(max-width:575px){.ng-stats{grid-template-columns:repeat(2,1fr)}.ng-row{grid-template-columns:38px 1fr}.ng-tag{display:none}}
</style>

<div class="ng-page"><section class="ng-hero"><span class="ng-kicker">Source Deep Dive · 源码逐行</span><h2>nanoGPT 源码逐行</h2><p>读 <a href="https://github.com/karpathy/nanoGPT">Karpathy 的 nanoGPT</a>——最简、最可读的 GPT 训练/微调实现：<code>model.py</code>（约 300 行）定义一个真正的 Transformer，<code>train.py</code>（约 300 行）把它训成会写字的模型，<code>sample.py</code> 让它生成文本。它能复现 GPT-2（124M）。读完这一套，你会真正懂<strong>自注意力、Transformer Block、自回归生成与训练循环</strong>——它是 <a href="/courses/micrograd/">micrograd</a> 之后的下一站：从"手写 autograd 种子"走到"训练一个真 GPT"。</p><div class="ng-stats"><div class="ng-stat"><strong>~600</strong><span>行核心源码</span></div><div class="ng-stat"><strong>GPT-2</strong><span>可复现</span></div><div class="ng-stat"><strong>6</strong><span>讲（00–05）</span></div><div class="ng-stat"><strong>Transformer</strong><span>+ 训练</span></div></div></section><div class="ng-legend"><span><span class="ng-b ng-core">必读</span> 核心，必吃透</span><span><span class="ng-b ng-key">重点</span> 关键细节</span><span><span class="ng-b ng-skim">可跳读</span> 知道即可</span></div><div class="ng-list"><a class="ng-row" href="/2026/06/29/nanogpt-00-intro/"><span class="ng-num">00</span><div class="ng-rt"><h4>导论 · 最简可读的 GPT</h4><p>nanoGPT 是什么 / 和 micrograd 的接续 / 整体数据流：token→嵌入→Block→logits→loss</p></div><span class="ng-tag">已完成 ✔</span></a><a class="ng-row" href="/2026/06/29/nanogpt-01-skeleton/"><span class="ng-num">01</span><div class="ng-rt"><h4>model.py 骨架 · 嵌入、权重共享与数据流</h4><p>GPTConfig / wte+wpe 嵌入 / weight tying / forward 逐行标 shape</p></div><span class="ng-tag">已完成 ✔</span></a><a class="ng-row" href="/2026/06/29/nanogpt-02-attention/"><span class="ng-num">02</span><div class="ng-rt"><h4>自注意力 · GPT 的心脏</h4><p>QKV 投影 / 多头 / 缩放点积 + 因果掩码 + softmax + 加权聚合</p></div><span class="ng-tag">已完成 ✔</span></a><a class="ng-row" href="/2026/06/29/nanogpt-03-block/"><span class="ng-num">03</span><div class="ng-rt"><h4>一个 Transformer Block · 残差 / Pre-LN / MLP</h4><p>LayerNorm + 4x MLP + 残差连接；堆 N 层就是 GPT</p></div><span class="ng-tag">已完成 ✔</span></a><a class="ng-row" href="/2026/06/29/nanogpt-04-training/"><span class="ng-num">04</span><div class="ng-rt"><h4>训练循环 · 从一个 batch 到会写字</h4><p>get_batch / lr 调度 / 梯度累积 / AdamW / 裁剪——micrograd 训练循环的工业版</p></div><span class="ng-tag">已完成 ✔</span></a><a class="ng-row" href="/2026/06/29/nanogpt-05-generate/"><span class="ng-num">05</span><div class="ng-rt"><h4>生成 · 自回归采样</h4><p>generate 循环 / temperature / top-k / multinomial；把自己的输出喂回去</p></div><span class="ng-tag">已完成 ✔</span></a></div></div>

> 本课配套源码：[github.com/karpathy/nanoGPT](https://github.com/karpathy/nanoGPT)（MIT）。前置阅读推荐先看 [micrograd 源码逐行](/courses/micrograd/)，理解 autograd 与训练循环的最小形态，再来看它在真 Transformer 上的放大版。
