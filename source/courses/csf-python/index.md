---
title: "计算机基本功 · 编程语言入门（Python）"
date: 2026-07-08 09:00:00
description: "从装好环境到独立写出一个命令行小程序，一行一行亲手敲，真正学会用 Python 写代码。"
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

<div class="csf-key-note"><strong>从装好环境到独立写出一个命令行小程序，一行一行亲手敲，真正学会用 Python 写代码。</strong><br>这门课是《计算机基本功路线图》的一站，<strong>扎实讲原理 + 自己动手练 + 练判断，不让 AI 代写</strong>。学完你能独立写出一个有菜单、能把数据存进文件再读回来、遇到错误也不会直接崩溃的命令行小程序，并能读懂、看出毛病、动手修改简单的 Python 代码。</div>

<div class="csf-why"><strong>为什么 AI 时代更要学好这门？</strong>AI 能帮你生成整段代码，但你看不懂、调不动、改不对，就等于把方向盘交了出去。把语法和“写程序”的肌肉记忆练扎实，你才能指挥 AI、判断它写得对不对，而不是被它牵着走。会写的人用 AI 提速，不会写的人被 AI 蒙在鼓里。</div>

按顺序从 00 跟到底，每讲 30–60 分钟，主线必做、细究可跳。

<a class="csf-row" href="/2026/07/03/csf-python-00/"><span class="csf-num">00</span><div class="csf-rt"><h4>序：把“自己能写”当成唯一目标</h4><p>想清楚这门课为什么不让 AI 代写、分清“看懂代码”和“自己能写”是两回事，建立“先猜后做、…</p></div></a>
<a class="csf-row" href="/2026/07/03/csf-python-01/"><span class="csf-num">01</span><div class="csf-rt"><h4>环境与第一行：让电脑跑出你的第一句话</h4><p>在自己电脑上装好 Python，能分别在终端和编辑器里把一个 .py 文件运行起来。</p></div></a>
<a class="csf-row" href="/2026/07/03/csf-python-02/"><span class="csf-num">02</span><div class="csf-rt"><h4>变量与类型：给数据起名字、分清四种基础类型</h4><p>会用变量把数据存起来，能分清整数、小数、字符串、布尔这四种最常用的类型。</p></div></a>
<a class="csf-row" href="/2026/07/03/csf-python-03/"><span class="csf-num">03</span><div class="csf-rt"><h4>输入与输出：让程序和人对话</h4><p>能让程序接收用户输入并给出回应，牢牢记住 input() 拿到的永远是字符串。</p></div></a>
<a class="csf-row" href="/2026/07/03/csf-python-04/"><span class="csf-num">04</span><div class="csf-rt"><h4>条件判断：让程序学会“看情况办事”</h4><p>能用 if/elif/else 让程序根据不同情况执行不同代码，并写出正确的判断条件。</p></div></a>
<a class="csf-row" href="/2026/07/03/csf-python-05/"><span class="csf-num">05</span><div class="csf-rt"><h4>循环：让程序不厌其烦地重复</h4><p>能用循环让程序重复做事，会用 for 遍历、用 while 反复执行，并控制循环的开始和结束…</p></div></a>
<a class="csf-row" href="/2026/07/03/csf-python-06/"><span class="csf-num">06</span><div class="csf-rt"><h4>函数：把重复的活儿打包起来</h4><p>会把重复的代码封装成函数，理解参数怎么传进去、返回值怎么传出来。</p></div></a>
<a class="csf-row" href="/2026/07/03/csf-python-07/"><span class="csf-num">07</span><div class="csf-rt"><h4>列表与字典：成串的数据和成对的数据</h4><p>会用列表存一串数据、用字典存键值对，并能对它们做增、删、改、查和遍历。</p></div></a>
<a class="csf-row" href="/2026/07/03/csf-python-08/"><span class="csf-num">08</span><div class="csf-rt"><h4>字符串处理：切割、查找、替换、排版</h4><p>会对字符串做切片、拆分、查找、替换，并用 f-string 把内容排成想要的样子。</p></div></a>
<a class="csf-row" href="/2026/07/03/csf-python-09/"><span class="csf-num">09</span><div class="csf-rt"><h4>文件读写：把数据存下来、下次读回来</h4><p>会把程序里的数据写进文件，再从文件读回来，理解 with 为什么比手动开关文件更省心。</p></div></a>
<a class="csf-row" href="/2026/07/03/csf-python-10/"><span class="csf-num">10</span><div class="csf-rt"><h4>异常处理：让程序遇错不崩</h4><p>能预判可能出错的地方并用 try/except 捕获，让程序在出错时给出友好提示而不是直接崩…</p></div></a>
<a class="csf-row" href="/2026/07/03/csf-python-11/"><span class="csf-num">11</span><div class="csf-rt"><h4>模块与库：站在别人写好的代码上</h4><p>会用 import 调用标准库，会用 pip 安装第三方库并在自己程序里用起来。</p></div></a>
<a class="csf-row" href="/2026/07/03/csf-python-12/"><span class="csf-num">12</span><div class="csf-rt"><h4>小项目收尾：把基本功串成一个能用的程序</h4><p>独立做出一个能跑、能存数据、不会一报错就崩的命令行小程序，把前面学的所有东西串起来。</p></div></a>

<p style="margin-top:24px"><a href="/courses/csf/">← 回到《计算机基本功路线图》总览</a></p>
