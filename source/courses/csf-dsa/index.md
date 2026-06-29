---
title: "计算机基本功 · 数据结构与算法"
date: 2026-07-08 09:00:00
description: "程序的内功——从大 O 直觉到动态规划，全靠自己手写推导加 Python 小练习练出来的那点真本事。"
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

<div class="csf-key-note"><strong>程序的内功——从大 O 直觉到动态规划，全靠自己手写推导加 Python 小练习练出来的那点真本事。</strong><br>这门课是《计算机基本功路线图》的一站，<strong>扎实讲原理 + 自己动手练 + 练判断，不让 AI 代写</strong>。学完你能徒手写出常见数据结构（链表、栈、队列、哈希、树、图）和经典算法（几种排序、二分、BFS/DFS、双指针、入门 DP），用大 O 估算一段代码的快慢，并在面对一个新问题时判断该用哪种结构、哪种思路——而不是只会让 AI 生成然后照单全收。</div>

<div class="csf-why"><strong>为什么 AI 时代更要学好这门？</strong>AI 能秒写出排序和二分，但它写错时、写慢时、答非所问时，能看出来、能改对、能选对数据结构的人才值钱。算法是你判断代码好坏、和 AI 对话不被它忽悠的底层标尺。越是 AI 满天飞，越要自己心里有数：知道一段代码是 O(n) 还是 O(n²)，知道这题该用哈希还是该用栈——这是 AI 替不了的判断力。</div>

按顺序从 00 跟到底，每讲 30–60 分钟，主线必做、细究可跳。

<a class="csf-row" href="/2026/07/04/csf-dsa-00/"><span class="csf-num">00</span><div class="csf-rt"><h4>序：内功是什么，为什么这门课不能让 AI 代写</h4><p>知道数据结构与算法是程序的"内功"，理解为什么这门课要靠自己手写推导而不是让 AI 代笔；配…</p></div></a>
<a class="csf-row" href="/2026/07/04/csf-dsa-01/"><span class="csf-num">01</span><div class="csf-rt"><h4>复杂度直觉：大 O 是怎么估出来的</h4><p>能对一段代码估出大致是 O(1) / O(n) / O(n²)，并说清理由；学会用"输入翻倍…</p></div></a>
<a class="csf-row" href="/2026/07/04/csf-dsa-02/"><span class="csf-num">02</span><div class="csf-rt"><h4>数组与链表：数据在内存里怎么排队</h4><p>讲清数组和链表在内存里的根本区别，知道两者的"查、改、增、删"各自谁快谁慢、为什么。</p></div></a>
<a class="csf-row" href="/2026/07/04/csf-dsa-03/"><span class="csf-num">03</span><div class="csf-rt"><h4>栈与队列：进出顺序的两种规矩</h4><p>用自己的话讲清后进先出（LIFO）和先进先出（FIFO），能判断一个问题该用栈还是队列，并用…</p></div></a>
<a class="csf-row" href="/2026/07/04/csf-dsa-04/"><span class="csf-num">04</span><div class="csf-rt"><h4>哈希表：用空间换时间的查找神器</h4><p>理解哈希表为什么能做到近似 O(1) 的查找，会用 dict / set 解决查重、计数、快…</p></div></a>
<a class="csf-row" href="/2026/07/04/csf-dsa-05/"><span class="csf-num">05</span><div class="csf-rt"><h4>递归：自己调用自己的思维</h4><p>能写出带正确出口的简单递归函数，能在纸上画出调用栈、讲清每一层到底在干什么。</p></div></a>
<a class="csf-row" href="/2026/07/04/csf-dsa-06/"><span class="csf-num">06</span><div class="csf-rt"><h4>排序（一）：从笨办法看清思路</h4><p>能徒手写出冒泡、选择、插入三种排序，讲清每种的核心思路，以及它们为什么都是 O(n²)。</p></div></a>
<a class="csf-row" href="/2026/07/04/csf-dsa-07/"><span class="csf-num">07</span><div class="csf-rt"><h4>排序（二）：分治的力量</h4><p>理解"分而治之"的思想，能讲清归并排序和快速排序如何把大问题拆小，知道它们大约是 O(n l…</p></div></a>
<a class="csf-row" href="/2026/07/04/csf-dsa-08/"><span class="csf-num">08</span><div class="csf-rt"><h4>二分查找：有序里的折半思维</h4><p>能在有序数组上手写一个不出错的二分查找，讲清边界条件和循环何时终止。</p></div></a>
<a class="csf-row" href="/2026/07/04/csf-dsa-09/"><span class="csf-num">09</span><div class="csf-rt"><h4>树与二叉树：会分叉的数据结构</h4><p>能用自己的话描述树和二叉树的结构，会用类建一棵二叉树并完成三种遍历。</p></div></a>
<a class="csf-row" href="/2026/07/04/csf-dsa-10/"><span class="csf-num">10</span><div class="csf-rt"><h4>图的直觉与 BFS / DFS：点和线的世界</h4><p>理解图就是"一堆点加连接它们的边"，会用邻接表表示一张图，能写出 BFS 和 DFS 走遍所…</p></div></a>
<a class="csf-row" href="/2026/07/04/csf-dsa-11/"><span class="csf-num">11</span><div class="csf-rt"><h4>双指针与滑动窗口：数组上的常用套路</h4><p>掌握双指针和滑动窗口两种套路，能识别哪些数组 / 字符串问题适合它们，把 O(n²) 的暴力…</p></div></a>
<a class="csf-row" href="/2026/07/04/csf-dsa-12/"><span class="csf-num">12</span><div class="csf-rt"><h4>动态规划入门：把大问题拆成小问题</h4><p>理解 DP 的本质就是"记住小问题的答案，不重复计算"，能写出"状态定义 + 转移方程"来解…</p></div></a>

<p style="margin-top:24px"><a href="/courses/csf/">← 回到《计算机基本功路线图》总览</a></p>
