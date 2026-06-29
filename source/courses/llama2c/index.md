---
title: "llama2.c 源码逐行"
date: 2026-06-29 10:30:00
description: "读 Karpathy 的 llama2.c：用纯 C、一个文件 run.c 推理 Llama 2，零依赖、CPU 能跑。matmul、RMSNorm、RoPE、注意力全是看得见的 for 循环。读完你会看到一个真实 LLM 在最底层到底怎么算——它是 nanoGPT 之后的下一站。"
---

<style>
.l2-page{--ink:#1d2127;--text:#2a2f36;--muted:#69727d;--line:rgba(29,33,39,.12);--panel:#fff;--wash:#f4f5f3;--blue:#3f5d7e;--red:#b73a2c;color:var(--text)}
.l2-page *{box-sizing:border-box;min-width:0}
.l2-hero{padding:32px;border:1px solid var(--line);border-radius:6px;background:linear-gradient(135deg,rgba(183,58,44,.07),rgba(63,93,126,.08)),var(--panel)}
.l2-kicker{display:inline-flex;align-items:center;margin-bottom:14px;padding:6px 10px;border:1px solid rgba(63,93,126,.2);border-radius:999px;color:var(--blue);background:rgba(63,93,126,.08);font-size:13px;font-weight:760}
.l2-hero h2{margin:0 0 14px;color:var(--ink);font-size:30px;line-height:1.25}
.l2-hero p{margin:0;color:var(--muted);line-height:1.8}
.l2-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:20px 0 6px}
.l2-stat{padding:14px;border:1px solid var(--line);border-radius:4px;background:rgba(255,255,255,.6)}
.l2-stat strong{display:block;color:var(--ink);font-size:22px;line-height:1.1}
.l2-stat span{color:var(--muted);font-size:13px}
.l2-legend{display:flex;flex-wrap:wrap;gap:14px;margin:22px 0 6px;padding:14px 18px;border:1px solid var(--line);border-radius:6px;background:var(--wash)}
.l2-legend span{font-size:13px;color:var(--muted)}
.l2-b{display:inline-block;font-size:12px;font-weight:700;padding:1px 8px;border-radius:999px;line-height:1.7;white-space:nowrap}
.l2-core{color:#fff;background:var(--red)}
.l2-key{color:var(--red);background:rgba(183,58,44,.1);border:1px solid rgba(183,58,44,.3)}
.l2-skim{color:var(--blue);background:rgba(63,93,126,.1);border:1px solid rgba(63,93,126,.25)}
.l2-list{display:grid;gap:10px;margin-top:18px}
.l2-row{display:grid;grid-template-columns:46px 1fr auto;gap:14px;align-items:center;padding:14px 16px;border:1px solid var(--line);border-radius:5px;background:var(--panel);text-decoration:none!important;color:var(--text)}
.l2-row:hover{border-color:rgba(183,58,44,.4);transform:translateY(-1px);box-shadow:0 6px 18px rgba(22,32,42,.07)}
.l2-num{font-size:20px;font-weight:800;color:var(--blue);text-align:center}
.l2-rt h4{margin:0 0 3px;color:var(--ink);font-size:16px}
.l2-rt p{margin:0;color:var(--muted);font-size:13px;line-height:1.6}
.l2-tag{font-size:12px;font-weight:700;color:var(--muted);white-space:nowrap}
html[data-user-color-scheme="dark"] .l2-page{--ink:#e8eaed;--text:#c9cdd4;--muted:#9aa3ad;--line:rgba(255,255,255,.14);--panel:#1c2026;--wash:#23272e;--blue:#9fc1ec;--red:#ef9a8e}
html[data-user-color-scheme="dark"] .l2-stat{background:rgba(255,255,255,.03)}
@media(max-width:575px){.l2-stats{grid-template-columns:repeat(2,1fr)}.l2-row{grid-template-columns:38px 1fr}.l2-tag{display:none}}
</style>

<div class="l2-page"><section class="l2-hero"><span class="l2-kicker">Source Deep Dive · 源码逐行</span><h2>llama2.c 源码逐行</h2><p>读 <a href="https://github.com/karpathy/llama2.c">Karpathy 的 llama2.c</a>——用<strong>纯 C、一个文件 <code>run.c</code></strong>（约 970 行）推理 Llama 2，零依赖、CPU 就能跑。这里没有 PyTorch 的黑箱：<code>matmul</code>、<code>rmsnorm</code>、<code>RoPE</code>、注意力全是<strong>看得见的 for 循环</strong>。读完这一套，你会看到一个真实 LLM 在最底层到底怎么算——它是 <a href="/courses/nanogpt/">nanoGPT</a> 之后的下一站：把 Transformer 从框架翻到裸机。</p><div class="l2-stats"><div class="l2-stat"><strong>~970</strong><span>行纯 C</span></div><div class="l2-stat"><strong>1</strong><span>个文件 run.c</span></div><div class="l2-stat"><strong>6</strong><span>讲（00–05）</span></div><div class="l2-stat"><strong>Llama 2</strong><span>纯 C 推理</span></div></div></section><div class="l2-legend"><span><span class="l2-b l2-core">必读</span> 核心，必吃透</span><span><span class="l2-b l2-key">重点</span> 关键细节</span><span><span class="l2-b l2-skim">可跳读</span> 知道即可</span></div><div class="l2-list"><a class="l2-row" href="/2026/06/29/llama2c-00-intro/"><span class="l2-num">00</span><div class="l2-rt"><h4>导论 · 用一个 C 文件跑 Llama 2</h4><p>llama2.c 是什么 / 和 nanoGPT 的接续 / Llama vs GPT 五处不同 / 三结构体 Config·Weights·RunState</p></div><span class="l2-tag">已完成 ✔</span></a><a class="l2-row" href="/2026/06/29/llama2c-01-structs/"><span class="l2-num">01</span><div class="l2-rt"><h4>权重加载 · mmap 零拷贝</h4><p>read_checkpoint / memory_map_weights：把 .bin 映射进内存、一根游标切出各权重指针</p></div><span class="l2-tag">已完成 ✔</span></a><a class="l2-row" href="/2026/06/29/llama2c-02-primitives/"><span class="l2-num">02</span><div class="l2-rt"><h4>三个数值原语 · rmsnorm / softmax / matmul</h4><p>RMSNorm 为何比 LayerNorm 简单 / softmax 数值稳定 / matmul 就是两层 for</p></div><span class="l2-tag">已完成 ✔</span></a><a class="l2-row" href="/2026/06/29/llama2c-03-attention/"><span class="l2-num">03</span><div class="l2-rt"><h4>forward 的心脏 · RoPE / KV cache / GQA 注意力</h4><p>RoPE 旋转位置编码 / KV cache 增量 / GQA 共享 KV / 裸 for 写的多头注意力</p></div><span class="l2-tag">已完成 ✔</span></a><a class="l2-row" href="/2026/06/29/llama2c-04-ffn-tokenizer/"><span class="l2-num">04</span><div class="l2-rt"><h4>SwiGLU FFN + classifier，与 BPE tokenizer</h4><p>SwiGLU 门控前馈 / 最后 classifier / decode 与 BPE 贪心合并</p></div><span class="l2-tag">已完成 ✔</span></a><a class="l2-row" href="/2026/06/29/llama2c-05-sampling/"><span class="l2-num">05</span><div class="l2-rt"><h4>采样与生成 · top-p + generate 主循环</h4><p>argmax / 温度 / nucleus 采样 / 自回归 generate 循环；全系列收尾</p></div><span class="l2-tag">已完成 ✔</span></a></div></div>

> 本课配套源码：[github.com/karpathy/llama2.c](https://github.com/karpathy/llama2.c)（MIT）。建议按 [micrograd](/courses/micrograd/) → [nanoGPT](/courses/nanogpt/) → llama2.c 的顺序读：从手写 autograd 种子，到 PyTorch 训练 GPT，再到纯 C 裸跑 Llama 推理。
