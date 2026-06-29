---
title: "《写给高考生的编程第一课》第03讲 · 它给我这坨代码，到底在干嘛？"
date: 2026-06-29 17:00:00
tags: [AI, 编程入门, 零基础, 高考, vibe coding, HTML, 读代码, 课程]
categories: [技术笔记]
toc: true
visibility: public
---

<style>
.gkc-b{display:inline-block;font-size:12px;font-weight:700;padding:1px 8px;border-radius:999px;vertical-align:middle;margin-left:6px;line-height:1.7;white-space:nowrap}
.gkc-core{color:#fff;background:#b73a2c}
.gkc-key{color:#a3331f;background:rgba(183,58,44,.12);border:1px solid rgba(183,58,44,.32)}
.gkc-skim{color:#3f5d7e;background:rgba(63,93,126,.1);border:1px solid rgba(63,93,126,.25)}
.gkc-skip{color:#69727d;background:rgba(105,114,125,.12);border:1px solid rgba(105,114,125,.25)}
.gkc-note,.gkc-why,.gkc-key-note,.gkc-card,.gkc-legend{margin:18px 0;padding:14px 16px;line-height:1.78;border-radius:8px}
.gkc-note{background:rgba(63,93,126,.08);border-left:4px solid #3f5d7e}
.gkc-why{background:var(--wash);border-left:4px solid var(--line);color:var(--muted)}
.gkc-key-note{background:rgba(183,58,44,.09);border-left:4px solid #b73a2c}
.gkc-card{background:rgba(183,58,44,.07);border:1px solid rgba(183,58,44,.34);border-radius:10px}
.gkc-legend{background:var(--wash);font-size:14px;line-height:2}
.gkc-fold{margin:18px 0;padding:4px 16px;border:1px solid var(--line);border-radius:8px;background:var(--wash)}
.gkc-fold summary{cursor:pointer;font-weight:700;padding:10px 0}
.gkc-fold[open]{padding-bottom:14px}
html[data-user-color-scheme="dark"] .gkc-key{color:#e89180;background:rgba(183,58,44,.2);border-color:rgba(183,58,44,.46)}
html[data-user-color-scheme="dark"] .gkc-note{background:rgba(63,93,126,.18)}
html[data-user-color-scheme="dark"] .gkc-key-note{background:rgba(183,58,44,.18)}
html[data-user-color-scheme="dark"] .gkc-card{background:rgba(183,58,44,.14)}
</style>

<div class="gkc-key-note"><strong>这一讲练第三个能力：读。</strong>不是教你写代码、背语法，而是让你拿到 AI 给的一坨东西时，能一眼认出"这块是干嘛的"。读得懂个大概，你才说得清哪里要改，也才看得出 AI 有没有糊弄你。</div>

前两讲你已经会"描述 → 生成 → 看 → 改"，也会把需求说清楚了。但每次 AI 甩给你一大段代码，你是不是直接划过去、复制粘贴？这一讲，我们把这份"看不懂的恐惧"拆掉。

## 🎯 这一讲你会得到什么 <span class="gkc-b gkc-core">必读</span>

一个"看代码不慌"的本事：拿到任何一段 AI 生成的网页代码，你能大概说出它分几块、哪块管什么。不用会写，只要会认。

<div class="gkc-note"><strong>说句掏心窝的话：</strong>大学里计算机专业的课，很大一部分就是在教"读懂程序怎么运转"。你这个暑假先把"读个大概"这层窗户纸捅破，开学真上课时，会比身边同学轻松不少。</div>

## 读代码，像看房子的平面图 <span class="gkc-b gkc-core">必读</span>

你不会去数一栋房子用了多少块砖。但你看一眼平面图，立刻就知道：这是客厅、这是卧室、这是厨房。

读 AI 的代码也一样。**你不需要看懂每一个字，只需要认出"房间"**——这块是标题、这块是正文、这块管颜色、这块管点击。能认出房间，你就能在房子里找东西、改东西了。

## 网页就三类东西：结构 / 样式 / 行为 <span class="gkc-b gkc-core">必读</span>

不管 AI 给你的代码多长，它基本就在干三件事：

<div class="gkc-card"><strong>一张网页 = 结构 + 样式 + 行为</strong><br><strong>结构（HTML）</strong>：页面上"有什么"——标题、段落、图片、按钮<br><strong>样式（CSS）</strong>：这些东西"长什么样"——颜色、大小、间距、位置<br><strong>行为（JS）</strong>：点了之后"会发生什么"——弹窗、变色、跳转</div>

你前面做的那张主页，里面其实就这三样混在一起。学会一眼分出"这段是结构、那段是样式"，代码就不再是一坨，而是三个抽屉。

<div class="gkc-note"><strong>怎么快速分辨？</strong>带尖括号的标签（像 <code>&lt;h1&gt;</code>、<code>&lt;p&gt;</code>）多半是<strong>结构</strong>；出现 color、background、font、margin 这些词的，是<strong>样式</strong>；看到 function、click 这类词的，是<strong>行为</strong>。认个大概就行，不用精确。</div>

## 三招，把"看不懂"变成"看个大概" <span class="gkc-b gkc-core">必读</span>

**第 1 招 · 让 AI 给你"人话注释"。** 这是最省力的一招。把代码发给 AI，说：

```
请在这段代码每一块前面，加一行中文注释，用大白话说这块是干嘛的。
```

瞬间，一坨代码就变成了带路标的地图。**养成习惯：看不懂，先让它加人话注释。**

**第 2 招 · 顺着关键词找。** 想改什么，就找你在页面上看到的那个词。想改标题文字？在代码里搜你那句标题，就在那儿。想改颜色？搜 color。代码是搜得到的，不用从头读到尾。

**第 3 招 · 不懂就直接问。** AI 是你 24 小时不嫌烦的家教，指着任意一行问它：

- "这一行是干嘛的？"
- "如果我把这个数字改大，会发生什么？"
- "这段能删吗？删了会怎样？"

## 🔮 先猜后做：给自己的代码贴标签 <span class="gkc-b gkc-core">必读</span>

现在动手。打开你那张主页的代码，从上往下，**一块一块先自己猜**："这块大概是干嘛的？"——猜完，再用第 1 招让 AI 加上人话注释，对照你猜得对不对。

猜错的地方，正是你今天学到最多的地方。做完你会发现：原来这坨东西，我能看懂个七七八八。

## 🔧 翻车现场：AI 也会解释错、塞废话

读的另一个用处，是**抓 AI 的小动作**。

试试看：让 AI 给你的页面"加个分享按钮"，然后读它给的代码。有时你会发现——它加了按钮，但按钮点了根本没反应（只有结构，没有行为）；或者它塞了一大段你根本用不到的东西。

<div class="gkc-why"><strong>这就是"读"的价值。</strong>如果你完全不看，这个"假按钮"就这么上线了，你还以为做好了。能读个大概，你才能发现"它说做了，其实没做全"。AI 不是故意骗你，但它确实会出错、会画蛇添足——<strong>你这双能扫一眼的眼睛，就是质量的最后一道关。</strong>这一点，第 11 讲我们还会专门展开。</div>

## ✅ 自检三问

- **它在干嘛**：网页的三类东西是哪三类？（结构 / 样式 / 行为）
- **它对吗**：你能在自己的代码里，指出哪一段是"管颜色的"吗？
- **坏了怎么办**：看到一整块完全看不懂的代码，你的第一反应是什么？（让 AI 加人话注释，或直接问它）

## 🚀 留个挑战

让 AI 给你的主页加一个小功能（比如"一个按钮，点一下弹出一句话"）。先读它给的代码，**自己猜哪段是"行为"**，再让 AI 确认。然后试着把弹出的那句话，自己在代码里找到、改掉——这一次不靠 AI 改，你自己改。

## 📦 复制带走

<div class="gkc-card"><strong>📦 复制带走</strong><br>① 读代码像看平面图：<strong>认房间，不数砖</strong>。<br>② 网页就三类：<strong>结构（有什么）/ 样式（长啥样）/ 行为（能干啥）</strong>。<br>③ 看不懂的万能第一招：<strong>让 AI 加"人话注释"</strong>。<br>④ 能读个大概，你才看得出 AI 有没有糊弄你。</div>

会描述、会说清、会读懂——第一站，你已经把"和 AI 协作"的地基打好了。下一站我们揭开盖子：你做的这些东西，到底**存在哪、怎么跑起来的**。下一讲**第 04 讲**，我们把作品从聊天框里搬出来，放进一个真正的"工作台"。
