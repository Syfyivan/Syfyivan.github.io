---
title: "计算机基本功 · 计算机组成原理"
date: 2026-07-08 09:00:00
description: "从一个开关到一段能跑的程序，看懂计算机到底怎么把电变成计算。"
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

<div class="csf-key-note"><strong>从一个开关到一段能跑的程序，看懂计算机到底怎么把电变成计算。</strong><br>这门课是《计算机基本功路线图》的一站，<strong>扎实讲原理 + 自己动手练 + 练判断，不让 AI 代写</strong>。学完你能用自己的话讲清楚一行代码从源码到电信号的完整旅程：数据怎么用二进制编码、逻辑门怎么搭出运算、CPU 怎么一条条取指执行、数据在寄存器/缓存/内存间怎么流动；并能动手做到——手算数制与补码转换、用模拟器搭出一个加法器、用纸笔手动模拟一个迷你 CPU 跑完一段程序。</div>

<div class="csf-why"><strong>为什么 AI 时代更要学好这门？</strong>AI 能帮你写代码、解释报错，但它给的解释是真懂还是在一本正经地编，得你自己能判断。当程序莫名变慢、内存爆掉、数字算错时，根因往往藏在底层——只有懂组成原理的人才知道去哪儿找、能问出对的问题。这门基本功是你和 AI 平等对话、不被忽悠的底气，也是上层一切（操作系统、编译、性能优化）的地基。</div>

按顺序从 00 跟到底，每讲 30–60 分钟，主线必做、细究可跳。

<a class="csf-row" href="/2026/07/08/csf-arch-00/"><span class="csf-num">00</span><div class="csf-rt"><h4>序：从开关到程序——这门课带你过的那座桥</h4><p>建立一张'电路→数据→运算→指令→程序'的全景地图，知道这门课每一讲在地图的哪一格，并接受'…</p></div></a>
<a class="csf-row" href="/2026/07/08/csf-arch-01/"><span class="csf-num">01</span><div class="csf-rt"><h4>二进制:为什么机器只认 0 和 1</h4><p>能手算十进制↔二进制互转,说清'位(bit)'和'字节(byte)'的区别,以及 1KB 到…</p></div></a>
<a class="csf-row" href="/2026/07/08/csf-arch-02/"><span class="csf-num">02</span><div class="csf-rt"><h4>负数与十六进制:补码和给人看的简写</h4><p>能写出一个负整数的 8 位补码,理解十六进制是二进制的'人类速记',并能解释整数溢出(环绕)…</p></div></a>
<a class="csf-row" href="/2026/07/08/csf-arch-03/"><span class="csf-num">03</span><div class="csf-rt"><h4>文字、图片、声音怎么都变成数</h4><p>能解释字符、图像、声音是如何被编码成二进制的,并能动手把一段文字转成字节、看懂一个文件的十六…</p></div></a>
<a class="csf-row" href="/2026/07/08/csf-arch-04/"><span class="csf-num">04</span><div class="csf-rt"><h4>逻辑门:用'开关'做判断</h4><p>能读写与/或/非门的真值表,理解逻辑门是组合逻辑(没有记忆),并知道为什么一种门(NAND)…</p></div></a>
<a class="csf-row" href="/2026/07/08/csf-arch-05/"><span class="csf-num">05</span><div class="csf-rt"><h4>加法器:用逻辑门搭出会算数的电路</h4><p>能用逻辑门搭出半加器和全加器,并把它们串成多位加法器,亲眼看到'加法'是怎么从门里长出来的。</p></div></a>
<a class="csf-row" href="/2026/07/08/csf-arch-06/"><span class="csf-num">06</span><div class="csf-rt"><h4>记住一个比特:触发器、时钟和寄存器</h4><p>能解释电路靠'反馈'记住数据,理解时钟边沿决定何时存值,并说清寄存器和内存的区别。</p></div></a>
<a class="csf-row" href="/2026/07/08/csf-arch-07/"><span class="csf-num">07</span><div class="csf-rt"><h4>CPU 里到底有什么:一座微型工厂</h4><p>能画出 CPU 的核心框图(ALU、寄存器组、控制器、PC、IR)并说清每一部分的职责,理解…</p></div></a>
<a class="csf-row" href="/2026/07/08/csf-arch-08/"><span class="csf-num">08</span><div class="csf-rt"><h4>指令与机器码:CPU 能直接读的'命令'</h4><p>能说清指令集(ISA)、操作码、操作数的关系,理解汇编与机器码的差别,并能照给定格式把一条简…</p></div></a>
<a class="csf-row" href="/2026/07/08/csf-arch-09/"><span class="csf-num">09</span><div class="csf-rt"><h4>取指-译码-执行:CPU 的心跳</h4><p>能用纸笔走完一个迷你 CPU 执行几条指令的全过程,理解 PC 如何推进、跳转指令如何改变流…</p></div></a>
<a class="csf-row" href="/2026/07/08/csf-arch-10/"><span class="csf-num">10</span><div class="csf-rt"><h4>存储层次与缓存:为什么要分这么多层</h4><p>能按速度和容量排出寄存器/缓存/内存/硬盘的层次,解释'局部性原理'和缓存为什么有效,并能亲…</p></div></a>
<a class="csf-row" href="/2026/07/08/csf-arch-11/"><span class="csf-num">11</span><div class="csf-rt"><h4>总线:部件之间怎么通话</h4><p>能区分地址总线、数据总线、控制总线的分工,理解地址总线位宽决定能寻址多大空间,并能描述一次内…</p></div></a>
<a class="csf-row" href="/2026/07/08/csf-arch-12/"><span class="csf-num">12</span><div class="csf-rt"><h4>从源代码到能跑:编译、汇编、链接、装载</h4><p>能讲清一段 C 代码经过预处理→编译→汇编→链接→装载变成可运行程序的全过程,并把前面所有层…</p></div></a>

<p style="margin-top:24px"><a href="/courses/csf/">← 回到《计算机基本功路线图》总览</a></p>
