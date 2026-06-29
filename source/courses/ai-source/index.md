---
title: "AI 源码逐行 · 从 autograd 种子到纯 C 训练大模型"
date: 2026-06-29 11:10:00
description: "四门源码逐行课串成一条路径：micrograd（手写 autograd 种子）→ nanoGPT（PyTorch 训 GPT）→ llama2.c（纯 C 推理 Llama）→ llm.c（纯 C 训练 GPT-2，手写反向传播）。读完，'模型怎么算、怎么训'从最小种子到最底层，全程无黑箱、首尾闭环。"
---

<style>
.hub-page{--ink:#1d2127;--text:#2a2f36;--muted:#69727d;--line:rgba(29,33,39,.12);--panel:#fff;--wash:#f4f5f3;--blue:#3f5d7e;--red:#b73a2c;color:var(--text)}
.hub-page *{box-sizing:border-box;min-width:0}
.hub-hero{padding:34px;border:1px solid var(--line);border-radius:6px;background:linear-gradient(135deg,rgba(183,58,44,.08),rgba(63,93,126,.09)),var(--panel)}
.hub-kicker{display:inline-flex;align-items:center;margin-bottom:14px;padding:6px 10px;border:1px solid rgba(63,93,126,.2);border-radius:999px;color:var(--blue);background:rgba(63,93,126,.08);font-size:13px;font-weight:760}
.hub-hero h2{margin:0 0 14px;color:var(--ink);font-size:30px;line-height:1.25}
.hub-hero p{margin:0;color:var(--muted);line-height:1.85}
.hub-path{display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin:18px 0 4px;font-size:13px;font-weight:760;color:var(--muted)}
.hub-path b{color:var(--red)}
.hub-list{display:grid;gap:12px;margin-top:18px}
.hub-row{display:grid;grid-template-columns:52px 1fr auto;gap:16px;align-items:center;padding:16px 18px;border:1px solid var(--line);border-radius:6px;background:var(--panel);text-decoration:none!important;color:var(--text)}
.hub-row:hover{border-color:rgba(183,58,44,.4);transform:translateY(-1px);box-shadow:0 6px 18px rgba(22,32,42,.07)}
.hub-n{font-size:13px;font-weight:800;color:#fff;background:var(--blue);border-radius:6px;padding:6px 0;text-align:center}
.hub-rt h4{margin:0 0 4px;color:var(--ink);font-size:17px}
.hub-rt p{margin:0;color:var(--muted);font-size:13px;line-height:1.6}
.hub-tag{font-size:12px;font-weight:700;color:var(--muted);white-space:nowrap}
.hub-note{margin:20px 0 0;padding:14px 18px;border-left:3px solid var(--red);background:rgba(183,58,44,.05);border-radius:0 4px 4px 0;color:var(--text);font-size:14px;line-height:1.8}
html[data-user-color-scheme="dark"] .hub-page{--ink:#e8eaed;--text:#c9cdd4;--muted:#9aa3ad;--line:rgba(255,255,255,.14);--panel:#1c2026;--wash:#23272e;--blue:#9fc1ec;--red:#ef9a8e}
@media(max-width:575px){.hub-row{grid-template-columns:44px 1fr}.hub-tag{display:none}}
</style>

<div class="hub-page"><section class="hub-hero"><span class="hub-kicker">Source Deep Dive · 源码逐行合集</span><h2>AI 源码逐行：从 autograd 种子到纯 C 训练大模型</h2><p>四门"读源码学 AI"的课，串成一条路径。它们各自独立、又首尾呼应：从一颗约 150 行的<strong>手写 autograd 种子</strong>，一路走到用<strong>纯 C 训练一个真 GPT-2</strong>。读完，"模型到底在算什么、怎么训出来"对你不再有黑箱——而且你会看到，<strong>第一课和最后一课讲的其实是同一件事</strong>（手写每个运算的 <code>_backward</code> + 用 <code>+=</code> 累加梯度），只是从标量长成了张量、从玩具网络长成了 GPT-2。</p><div class="hub-path">建议顺序：<b>micrograd</b> → <b>nanoGPT</b> → <b>llama2.c</b> → <b>llm.c</b></div></section><div class="hub-list"><a class="hub-row" href="/courses/micrograd/"><span class="hub-n">①</span><div class="hub-rt"><h4>micrograd 源码逐行 · 最小种子</h4><p>Karpathy 的 ~150 行：scalar autograd 引擎 + 迷你神经网络库。读完真懂反向传播与训练在干嘛——理解 PyTorch 的种子。</p></div><span class="hub-tag">5 讲</span></a><a class="hub-row" href="/courses/nanogpt/"><span class="hub-n">②</span><div class="hub-rt"><h4>nanoGPT 源码逐行 · 训练一个真 GPT</h4><p>最简可读的 GPT 训练/微调：自注意力、Transformer Block、自回归生成、训练循环。从种子到一个能复现 GPT-2 的真 Transformer。</p></div><span class="hub-tag">6 讲</span></a><a class="hub-row" href="/courses/llama2c/"><span class="hub-n">③</span><div class="hub-rt"><h4>llama2.c 源码逐行 · 纯 C 推理 Llama</h4><p>一个 C 文件推理 Llama 2：RMSNorm、RoPE、GQA、KV cache、SwiGLU、top-p 采样，全是看得见的 for 循环。把 Transformer 翻到裸机。</p></div><span class="hub-tag">6 讲</span></a><a class="hub-row" href="/courses/llmc/"><span class="hub-n">④</span><div class="hub-rt"><h4>llm.c 源码逐行 · 纯 C 训练 GPT-2（闭环）</h4><p>纯 C 训练 GPT-2，连反向传播都手写。每层一对 forward/backward + 手写 AdamW。这一课正好回到 micrograd——首尾闭环。</p></div><span class="hub-tag">6 讲</span></a></div><div class="hub-note"><strong>这条路径的内核</strong>：①→④ 始终是同一件事——"前向算 loss → 反向用链式法则求梯度（每个运算手写局部导数、<code>+=</code> 累加）→ 顺梯度更新参数"。micrograd 用 Python 标量手写它、nanoGPT 用 PyTorch 自动求导跑它、llama2.c 只取其前向用纯 C 裸写、llm.c 又用纯 C 把训练（含手写反向传播）整个搬下来。看懂这一条线，你对深度学习的"发动机"就再无黑箱。</div></div>

> 四课配套源码均来自 [Andrej Karpathy](https://github.com/karpathy)（micrograd / nanoGPT / llama2.c / llm.c，MIT）。建议边读边 clone 跟着翻。
