---
title: "llm.c 源码逐行"
date: 2026-06-29 11:00:00
description: "读 Karpathy 的 llm.c：用纯 C 训练 GPT-2，连反向传播都是手写的。它把 micrograd 那颗手写 autograd 的种子，放大成了一个真 GPT-2 的 C 版——这条玩具 AI 源码线的终点与闭环。"
---

<style>
.lc-page{--ink:#1d2127;--text:#2a2f36;--muted:#69727d;--line:rgba(29,33,39,.12);--panel:#fff;--wash:#f4f5f3;--blue:#3f5d7e;--red:#b73a2c;color:var(--text)}
.lc-page *{box-sizing:border-box;min-width:0}
.lc-hero{padding:32px;border:1px solid var(--line);border-radius:6px;background:linear-gradient(135deg,rgba(183,58,44,.07),rgba(63,93,126,.08)),var(--panel)}
.lc-kicker{display:inline-flex;align-items:center;margin-bottom:14px;padding:6px 10px;border:1px solid rgba(63,93,126,.2);border-radius:999px;color:var(--blue);background:rgba(63,93,126,.08);font-size:13px;font-weight:760}
.lc-hero h2{margin:0 0 14px;color:var(--ink);font-size:30px;line-height:1.25}
.lc-hero p{margin:0;color:var(--muted);line-height:1.8}
.lc-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:20px 0 6px}
.lc-stat{padding:14px;border:1px solid var(--line);border-radius:4px;background:rgba(255,255,255,.6)}
.lc-stat strong{display:block;color:var(--ink);font-size:22px;line-height:1.1}
.lc-stat span{color:var(--muted);font-size:13px}
.lc-legend{display:flex;flex-wrap:wrap;gap:14px;margin:22px 0 6px;padding:14px 18px;border:1px solid var(--line);border-radius:6px;background:var(--wash)}
.lc-legend span{font-size:13px;color:var(--muted)}
.lc-b{display:inline-block;font-size:12px;font-weight:700;padding:1px 8px;border-radius:999px;line-height:1.7;white-space:nowrap}
.lc-core{color:#fff;background:var(--red)}
.lc-key{color:var(--red);background:rgba(183,58,44,.1);border:1px solid rgba(183,58,44,.3)}
.lc-skim{color:var(--blue);background:rgba(63,93,126,.1);border:1px solid rgba(63,93,126,.25)}
.lc-list{display:grid;gap:10px;margin-top:18px}
.lc-row{display:grid;grid-template-columns:46px 1fr auto;gap:14px;align-items:center;padding:14px 16px;border:1px solid var(--line);border-radius:5px;background:var(--panel);text-decoration:none!important;color:var(--text)}
.lc-row:hover{border-color:rgba(183,58,44,.4);transform:translateY(-1px);box-shadow:0 6px 18px rgba(22,32,42,.07)}
.lc-num{font-size:20px;font-weight:800;color:var(--blue);text-align:center}
.lc-rt h4{margin:0 0 3px;color:var(--ink);font-size:16px}
.lc-rt p{margin:0;color:var(--muted);font-size:13px;line-height:1.6}
.lc-tag{font-size:12px;font-weight:700;color:var(--muted);white-space:nowrap}
html[data-user-color-scheme="dark"] .lc-page{--ink:#e8eaed;--text:#c9cdd4;--muted:#9aa3ad;--line:rgba(255,255,255,.14);--panel:#1c2026;--wash:#23272e;--blue:#9fc1ec;--red:#ef9a8e}
html[data-user-color-scheme="dark"] .lc-stat{background:rgba(255,255,255,.03)}
@media(max-width:575px){.lc-stats{grid-template-columns:repeat(2,1fr)}.lc-row{grid-template-columns:38px 1fr}.lc-tag{display:none}}
</style>

<div class="lc-page"><section class="lc-hero"><span class="lc-kicker">Source Deep Dive · 源码逐行</span><h2>llm.c 源码逐行</h2><p>读 <a href="https://github.com/karpathy/llm.c">Karpathy 的 llm.c</a>——用<strong>纯 C 训练 GPT-2</strong>，连<strong>反向传播都是手写</strong>的（每个运算一对 forward/backward，梯度靠 <code>+=</code> 累加）。它把 <a href="/courses/micrograd/">micrograd</a> 那颗手写 autograd 的种子，放大成了一个真 GPT-2 的 C 版——这条"玩具 AI 源码"线的<strong>终点与闭环</strong>。读完，"训练时 <code>loss.backward()</code> 到底逐行在干什么"，你再没有黑箱。</p><div class="lc-stats"><div class="lc-stat"><strong>~1000</strong><span>行纯 C</span></div><div class="lc-stat"><strong>训练</strong><span>GPT-2</span></div><div class="lc-stat"><strong>手写</strong><span>反向传播</span></div><div class="lc-stat"><strong>6</strong><span>讲（00–05）</span></div></div></section><div class="lc-legend"><span><span class="lc-b lc-core">必读</span> 核心，必吃透</span><span><span class="lc-b lc-key">重点</span> 关键细节</span><span><span class="lc-b lc-skim">可跳读</span> 知道即可</span></div><div class="lc-list"><a class="lc-row" href="/2026/06/29/llmc-00-intro/"><span class="lc-num">00</span><div class="lc-rt"><h4>导论 · 纯 C 训练 GPT-2，回到 micrograd 闭环</h4><p>llm.c 是什么 / forward·backward 成对 / 和 micrograd 同构（手写 _backward + 梯度累加）</p></div><span class="lc-tag">已完成 ✔</span></a><a class="lc-row" href="/2026/06/29/llmc-01-memory/"><span class="lc-num">01</span><div class="lc-rt"><h4>内存管理 · 参数与激活</h4><p>一个大数组 + 16 个指针；grads 同形累加；activations 缓存供 backward 复用</p></div><span class="lc-tag">已完成 ✔</span></a><a class="lc-row" href="/2026/06/29/llmc-02-forward/"><span class="lc-num">02</span><div class="lc-rt"><h4>前向层（一）· encoder/layernorm/matmul/gelu/residual</h4><p>裸 C 写的几个层；只有注意力跨 token，其余逐 (b,t) 独立</p></div><span class="lc-tag">已完成 ✔</span></a><a class="lc-row" href="/2026/06/29/llmc-03-attention-forward/"><span class="lc-num">03</span><div class="lc-rt"><h4>注意力前向 + gpt2_forward 编排</h4><p>4-pass 注意力 / softmax+crossentropy / 把层串成一个 GPT-2 Block</p></div><span class="lc-tag">已完成 ✔</span></a><a class="lc-row" href="/2026/06/29/llmc-04-backward/"><span class="lc-num">04</span><div class="lc-rt"><h4>手写反向传播（全课灵魂）</h4><p>每层 backward 逐行 / dlogits=probs−onehot / 注意力逐 pass 逆推 / 回到 micrograd</p></div><span class="lc-tag">已完成 ✔</span></a><a class="lc-row" href="/2026/06/29/llmc-05-adamw/"><span class="lc-num">05</span><div class="lc-rt"><h4>AdamW 优化器 + 训练循环（终）</h4><p>手写 AdamW（动量+偏差校正+权重衰减）/ forward→zero_grad→backward→update / 四课收尾</p></div><span class="lc-tag">已完成 ✔</span></a></div></div>

> 本课配套源码：[github.com/karpathy/llm.c](https://github.com/karpathy/llm.c)（MIT）。这是"玩具 AI 源码"四课的终点，建议顺序：[micrograd](/courses/micrograd/) → [nanoGPT](/courses/nanogpt/) → [llama2.c](/courses/llama2c/) → llm.c，从一颗手写 autograd 种子，到纯 C 训练一个真 GPT-2。
