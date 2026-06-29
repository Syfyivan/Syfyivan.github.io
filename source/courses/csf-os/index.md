---
title: "计算机基本功 · 操作系统"
date: 2026-07-08 09:00:00
description: "从双击图标到程序运行，看懂操作系统这位大管家怎么在幕后调度 CPU、分配内存、管理文件，让你的电脑同时跑得起几十个程序。"
---

<style>
.csf-key-note{margin:18px 0;padding:14px 16px;line-height:1.78;border-radius:8px;background:rgba(63,93,126,.1);border-left:4px solid #3f5d7e}
.csf-row{display:flex;align-items:center;gap:14px;padding:13px 15px;margin:8px 0;border:1px solid var(--line);border-radius:10px;text-decoration:none;background:var(--panel)}
.csf-row:hover{border-color:#3f5d7e}
.csf-num{flex:none;width:40px;height:40px;display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;background:#3f5d7e;border-radius:9px;font-size:14px}
.csf-rt{flex:1;min-width:0}
.csf-rt h4{margin:0 0 3px;font-size:16px;line-height:1.3}
.csf-rt p{margin:0;font-size:13px;color:var(--muted);line-height:1.5}
.csf-why{margin:18px 0;padding:14px 16px;line-height:1.78;border-radius:8px;background:var(--wash);border-left:4px solid var(--line);color:var(--muted)}
html[data-user-color-scheme="dark"] .csf-key-note{background:rgba(63,93,126,.22)}
</style>

<div class="csf-key-note"><strong>从双击图标到程序运行，看懂操作系统这位大管家怎么在幕后调度 CPU、分配内存、管理文件，让你的电脑同时跑得起几十个程序。</strong><br>这门课是《计算机基本功路线图》的一站，<strong>扎实讲原理 + 自己动手练 + 练判断，不让 AI 代写</strong>。学完你能用自己的话讲清一个程序从双击到退出的完整旅程，会在自己电脑上用任务管理器和命令观察进程、线程、CPU、内存，能初步诊断卡了/慢了/内存爆了到底卡在哪，并能解释清楚竞态、死锁和系统调用到底是什么。</div>

<div class="csf-why"><strong>为什么 AI 时代更要学好这门？</strong>AI 能帮你写代码，但代码为什么卡、为什么崩、内存为什么爆、并发结果为什么时对时错——这些问题你描述不清，AI 就帮你修不好。看懂操作系统，你才知道程序真正怎么在机器里跑，才能判断 AI 给的方案靠不靠谱，而不是一出问题只会把报错原样再贴给它一遍。</div>

按顺序从 00 跟到底，每讲 30–60 分钟，主线必做、细究可跳。

<a class="csf-row" href="/2026/07/06/csf-os-00/"><span class="csf-num">00</span><div class="csf-rt"><h4>序：程序跑起来那一刻，电脑里发生了什么</h4><p>建立"操作系统是你和硬件之间的总管"这个整体图景，明确这门课要回答的核心问题——从双击图标到…</p></div></a>
<a class="csf-row" href="/2026/07/06/csf-os-01/"><span class="csf-num">01</span><div class="csf-rt"><h4>操作系统到底在管什么：硬件世界的"大管家"</h4><p>能用自己的话说清操作系统的两件核心工作——管理硬件资源(CPU/内存/磁盘/设备)，以及给程…</p></div></a>
<a class="csf-row" href="/2026/07/06/csf-os-02/"><span class="csf-num">02</span><div class="csf-rt"><h4>一个程序怎么"活"过来：从文件到进程</h4><p>能清楚区分"程序"(躺在硬盘上、不动的文件)和"进程"(正在运行、有生命的活体)；知道双击到…</p></div></a>
<a class="csf-row" href="/2026/07/06/csf-os-03/"><span class="csf-num">03</span><div class="csf-rt"><h4>进程里的"多个分身"：线程是什么</h4><p>理解一个进程内部可以有多个线程同时干活，而这些线程共享进程的同一份内存；能说清进程和线程的区…</p></div></a>
<a class="csf-row" href="/2026/07/06/csf-os-04/"><span class="csf-num">04</span><div class="csf-rt"><h4>一个 CPU 怎么"同时"做几十件事：CPU 调度</h4><p>理解 CPU 是在极快地轮流执行各个进程(分时)，所谓"同时"很大程度是错觉；知道上下文切换…</p></div></a>
<a class="csf-row" href="/2026/07/06/csf-os-05/"><span class="csf-num">05</span><div class="csf-rt"><h4>你的程序住在哪：内存是怎么分的</h4><p>理解内存是程序运行时临时存放代码和数据的地方(断电就没)，并把它和硬盘彻底分清；大致知道一个…</p></div></a>
<a class="csf-row" href="/2026/07/06/csf-os-06/"><span class="csf-num">06</span><div class="csf-rt"><h4>人人都以为自己独占内存：虚拟内存</h4><p>理解每个进程看到的是一套"假的"、连续的内存地址，由操作系统偷偷映射到真实物理内存；知道这样…</p></div></a>
<a class="csf-row" href="/2026/07/06/csf-os-07/"><span class="csf-num">07</span><div class="csf-rt"><h4>数据怎么长期存住：文件系统</h4><p>理解文件系统是操作系统在硬盘上组织数据的方式(目录树、文件、权限)；能看懂文件路径、大小、修…</p></div></a>
<a class="csf-row" href="/2026/07/06/csf-os-08/"><span class="csf-num">08</span><div class="csf-rt"><h4>多个人同时改一个数：并发与竞态</h4><p>直觉理解当多个线程同时读写同一份数据时，结果可能出错(竞态条件)；能说清为什么"看起来很简单…</p></div></a>
<a class="csf-row" href="/2026/07/06/csf-os-09/"><span class="csf-num">09</span><div class="csf-rt"><h4>排队的艺术：锁与死锁</h4><p>理解用"锁"让同时修改变成排队进行，从而修好上一讲的竞态；理解锁用不好会带来死锁(两个人各占…</p></div></a>
<a class="csf-row" href="/2026/07/06/csf-os-10/"><span class="csf-num">10</span><div class="csf-rt"><h4>程序怎么"求"操作系统办事：系统调用</h4><p>理解程序自己不能直接读文件、上网、开进程，必须通过"系统调用"请操作系统代劳；理解用户态到内…</p></div></a>
<a class="csf-row" href="/2026/07/06/csf-os-11/"><span class="csf-num">11</span><div class="csf-rt"><h4>把它串起来：从开机到一个程序的完整旅程 + 排查实战</h4><p>能把前面所有概念串成一条线——开机加载内核、双击启动进程、CPU 调度它、给它分配虚拟内存、…</p></div></a>

<p style="margin-top:24px"><a href="/courses/csf/">← 回到《计算机基本功路线图》总览</a></p>
