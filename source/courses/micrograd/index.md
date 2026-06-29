---
title: "micrograd 源码逐行"
date: 2026-06-29 09:30:00
description: "读 Karpathy 的 micrograd（约 150 行）：一个 scalar 自动微分引擎 + 一个迷你神经网络库。逐行读完，你会真正懂反向传播和训练在干嘛——它是理解 PyTorch 的种子。"
---

<style>
.mg-page{--ink:#1d2127;--text:#2a2f36;--muted:#69727d;--line:rgba(29,33,39,.12);--panel:#fff;--wash:#f4f5f3;--blue:#3f5d7e;--red:#b73a2c;color:var(--text)}
.mg-page *{box-sizing:border-box;min-width:0}
.mg-hero{padding:32px;border:1px solid var(--line);border-radius:6px;background:linear-gradient(135deg,rgba(183,58,44,.07),rgba(63,93,126,.08)),var(--panel)}
.mg-kicker{display:inline-flex;align-items:center;margin-bottom:14px;padding:6px 10px;border:1px solid rgba(63,93,126,.2);border-radius:999px;color:var(--blue);background:rgba(63,93,126,.08);font-size:13px;font-weight:760}
.mg-hero h2{margin:0 0 14px;color:var(--ink);font-size:30px;line-height:1.25}
.mg-hero p{margin:0;color:var(--muted);line-height:1.8}
.mg-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:20px 0 6px}
.mg-stat{padding:14px;border:1px solid var(--line);border-radius:4px;background:rgba(255,255,255,.6)}
.mg-stat strong{display:block;color:var(--ink);font-size:22px;line-height:1.1}
.mg-stat span{color:var(--muted);font-size:13px}
.mg-legend{display:flex;flex-wrap:wrap;gap:14px;margin:22px 0 6px;padding:14px 18px;border:1px solid var(--line);border-radius:6px;background:var(--wash)}
.mg-legend span{font-size:13px;color:var(--muted)}
.mg-b{display:inline-block;font-size:12px;font-weight:700;padding:1px 8px;border-radius:999px;line-height:1.7;white-space:nowrap}
.mg-core{color:#fff;background:var(--red)}
.mg-key{color:var(--red);background:rgba(183,58,44,.1);border:1px solid rgba(183,58,44,.3)}
.mg-skim{color:var(--blue);background:rgba(63,93,126,.1);border:1px solid rgba(63,93,126,.25)}
.mg-list{display:grid;gap:10px;margin-top:18px}
.mg-row{display:grid;grid-template-columns:46px 1fr auto;gap:14px;align-items:center;padding:14px 16px;border:1px solid var(--line);border-radius:5px;background:var(--panel);text-decoration:none!important;color:var(--text)}
.mg-row:hover{border-color:rgba(183,58,44,.4);transform:translateY(-1px);box-shadow:0 6px 18px rgba(22,32,42,.07)}
.mg-num{font-size:20px;font-weight:800;color:var(--blue);text-align:center}
.mg-rt h4{margin:0 0 3px;color:var(--ink);font-size:16px}
.mg-rt p{margin:0;color:var(--muted);font-size:13px;line-height:1.6}
.mg-tag{font-size:12px;font-weight:700;color:var(--muted);white-space:nowrap}
html[data-user-color-scheme="dark"] .mg-page{--ink:#e8eaed;--text:#c9cdd4;--muted:#9aa3ad;--line:rgba(255,255,255,.14);--panel:#1c2026;--wash:#23272e;--blue:#9fc1ec;--red:#ef9a8e}
html[data-user-color-scheme="dark"] .mg-stat{background:rgba(255,255,255,.03)}
@media(max-width:575px){.mg-stats{grid-template-columns:repeat(2,1fr)}.mg-row{grid-template-columns:38px 1fr}.mg-tag{display:none}}
</style>

<div class="mg-page"><section class="mg-hero"><span class="mg-kicker">Source Deep Dive · 源码逐行</span><h2>micrograd 源码逐行</h2><p>逐行读 <a href="https://github.com/karpathy/micrograd">Karpathy 的 micrograd</a>——约 100 行的 scalar <strong>自动微分引擎</strong>（<code>engine.py</code>）+ 约 50 行的 <strong>迷你神经网络库</strong>（<code>nn.py</code>）。它把每个神经元拆成一个个最小的加法与乘法，却足以训练一个真正能二分类的神经网络。读完这一套，你会真正懂<strong>反向传播</strong>和<strong>训练在干嘛</strong>——它是理解 PyTorch 的种子。</p><div class="mg-stats"><div class="mg-stat"><strong>~150</strong><span>行源码</span></div><div class="mg-stat"><strong>2</strong><span>个文件</span></div><div class="mg-stat"><strong>5</strong><span>讲（00–04）</span></div><div class="mg-stat"><strong>autograd</strong><span>+ 训练</span></div></div></section><div class="mg-legend"><span><span class="mg-b mg-core">必读</span> 核心，必吃透</span><span><span class="mg-b mg-key">重点</span> 关键细节</span><span><span class="mg-b mg-skim">可跳读</span> 知道即可</span></div><div class="mg-list"><a class="mg-row" href="/2026/06/29/micrograd-00-intro/"><span class="mg-num">00</span><div class="mg-rt"><h4>导论 · 神经网络的最小种子</h4><p>micrograd 是什么 / 为什么值得读 / 两文件全景 / 一句 backward 自动求梯度的魔法预告</p></div><span class="mg-tag">已完成 ✔</span></a><a class="mg-row" href="/2026/06/29/micrograd-01-engine-forward/"><span class="mg-num">01</span><div class="mg-rt"><h4>engine.py 上篇 · Value 与“边算边建图”</h4><p>Value 的五个字段 / 运算符重载如何在算的同时建计算图 / dunder 复用</p></div><span class="mg-tag">已完成 ✔</span></a><a class="mg-row" href="/2026/06/29/micrograd-02-engine-backward/"><span class="mg-num">02</span><div class="mg-rt"><h4>engine.py 下篇 · 反向传播（高潮）</h4><p>每个 op 的局部梯度 / 为什么 grad += / 拓扑排序 + 逆序应用链式法则</p></div><span class="mg-tag">已完成 ✔</span></a><a class="mg-row" href="/2026/06/29/micrograd-03-nn/"><span class="mg-num">03</span><div class="mg-rt"><h4>nn.py · 用 Value 搭一个神经网络</h4><p>Module / Neuron / Layer / MLP；每个权重都是一个 Value，前向一跑就建好图</p></div><span class="mg-tag">已完成 ✔</span></a><a class="mg-row" href="/2026/06/29/micrograd-04-training/"><span class="mg-num">04</span><div class="mg-rt"><h4>训练 demo · 把一切串成一次迭代</h4><p>前向建图 → 算 loss → backward → SGD 更新；深度学习训练的内核</p></div><span class="mg-tag">已完成 ✔</span></a></div></div>

> 本课配套源码：[github.com/karpathy/micrograd](https://github.com/karpathy/micrograd)（MIT）。建议边读边 clone 跟着翻；每讲都对照真实源码逐行。
