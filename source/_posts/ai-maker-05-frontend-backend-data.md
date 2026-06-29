---
title: "《AI 造物入门》第05讲 · 你电脑里的小宇宙：前端、后端、数据是什么"
date: 2026-06-29 15:00:00
tags: [AI, 编程入门, 零基础, vibe coding, 前端, 后端, 课程]
categories: [技术笔记]
toc: true
visibility: public
---

<style>
.aim-b{display:inline-block;font-size:12px;font-weight:700;padding:1px 8px;border-radius:999px;vertical-align:middle;margin-left:6px;line-height:1.7;white-space:nowrap}
.aim-core{color:#fff;background:#d9742b}
.aim-key{color:#c2611c;background:rgba(217,116,43,.12);border:1px solid rgba(217,116,43,.32)}
.aim-skim{color:#3f5d7e;background:rgba(63,93,126,.1);border:1px solid rgba(63,93,126,.25)}
.aim-skip{color:#69727d;background:rgba(105,114,125,.12);border:1px solid rgba(105,114,125,.25)}
.aim-note,.aim-why,.aim-key-note,.aim-card,.aim-legend{margin:18px 0;padding:14px 16px;line-height:1.78;border-radius:8px}
.aim-note{background:rgba(63,93,126,.08);border-left:4px solid #3f5d7e}
.aim-why{background:var(--wash);border-left:4px solid var(--line);color:var(--muted)}
.aim-key-note{background:rgba(217,116,43,.09);border-left:4px solid #d9742b}
.aim-card{background:rgba(217,116,43,.07);border:1px solid rgba(217,116,43,.34);border-radius:10px}
.aim-legend{background:var(--wash);font-size:14px;line-height:2}
.aim-fold{margin:18px 0;padding:4px 16px;border:1px solid var(--line);border-radius:8px;background:var(--wash)}
.aim-fold summary{cursor:pointer;font-weight:700;padding:10px 0}
.aim-fold[open]{padding-bottom:14px}
html[data-user-color-scheme="dark"] .aim-key{color:#e8a36a;background:rgba(217,116,43,.18);border-color:rgba(217,116,43,.42)}
html[data-user-color-scheme="dark"] .aim-note{background:rgba(63,93,126,.18)}
html[data-user-color-scheme="dark"] .aim-key-note{background:rgba(217,116,43,.16)}
html[data-user-color-scheme="dark"] .aim-card{background:rgba(217,116,43,.13)}
</style>

<div class="aim-key-note"><strong>这一讲给你一张"地图"。</strong>不背术语，就把三个词搞懂：前端、后端、数据。有了这张图，以后东西坏了你知道去哪找，想加功能你知道缺哪块——它会一直挂在你脑子里当导航。</div>

上一讲你把作品搬进了编辑器。这一讲，我们看看这小小一张网页背后，藏着一个怎样的"世界"。

## 🎯 这一讲你会得到什么 <span class="aim-b aim-core">必读</span>

一张你能看懂的"作品由哪几块组成"的地图，外加一个很实用的直觉：遇到问题时，能判断"这是前端的事，还是后端的事"。

## 用一家餐厅，讲清三个词 <span class="aim-b aim-core">必读</span>

别被术语吓到，想象一家餐厅就够了：

- **前端 = 菜单 + 餐厅大堂**：你看得见、能点能坐的地方。
- **后端 = 后厨**：你看不见，但菜是它做的。
- **数据 = 菜谱 + 订单记录**：被记下来、能反复查的东西。

搬到网页上，一模一样：

<div class="aim-card"><strong>一个完整的作品 = 前端 + 后端 + 数据</strong><br><strong>前端</strong>：你在浏览器里看到、点到的一切（你前几讲做的，全是这个）<br><strong>后端</strong>：幕后那个"干活的程序"——算东西、连别的服务、做你看不见的事<br><strong>数据</strong>：被存下来、关掉还在的东西（你的清单、别人填的内容）</div>

## 你现在的作品，是纯前端 <span class="aim-b aim-core">必读</span>

看看你的个人主页：它目前 **100% 是前端**——一张好看的、能看能点的页面，没有后厨，也没有账本。

这解释了两件事：

- 它**记不住**任何东西（你关掉再打开，一切回到原样）——因为它没有"数据"。
- 它没法自己去**问 AI**、或做任何幕后计算——因为它没有"后端"。

<div class="aim-key-note"><strong>第 3 周的"飞跃"，就是给它接上一个后端。</strong>那时它才能去跟真正的 AI 说话、才能"记住"东西。今天这张图，就是为下周那一跳，先在你脑子里搭好脚手架。</div>

## 这张图到底有什么用 <span class="aim-b aim-key">重点</span>

最实在的用处：**东西坏了、或想加功能时，先给它归个类。**

| 现象 | 多半是哪一块 |
|---|---|
| 按钮颜色不对、字太小 | 前端（样子） |
| 点了没反应、算出来是错的 | 后端（逻辑） |
| 一刷新就全没了 | 数据（记忆） |

归对了类，你才知道该让 AI 改哪儿、或去哪儿找问题。这就是从"一坏就慌"到"知道往哪看"的关键一步。

## 🔮 先猜后做

看着你的主页，先猜：它有前端吗？有后端吗？有数据吗？——先写下你的判断。

（答案：只有前端。）别小看这一猜——你正是在用这张新地图，给自己的作品做第一次"体检"。

## 🔧 翻车现场："为什么我的网页记不住东西？"

故意制造一个经典困惑：让 AI 给你做一个"待办清单"，你填几条进去，然后刷新页面——

全没了。

<div class="aim-why"><strong>为什么？</strong>因为这个清单只有前端，没有数据。你填的内容从没被"存下来"，刷新就回到一张白纸。这<strong>不是 bug，是你还没给它一个"账本"</strong>。第 3 周我们会补上"记住"的能力。现在你心里有这张图，遇到这种事就不会白白困惑——你一眼就知道：哦，缺数据。</div>

## ✅ 自检三问

- **它在干嘛**：前端 / 后端 / 数据，各用一句话说说是干嘛的？
- **它对吗**：你的作品现在有哪几块？（就一块：前端）
- **坏了怎么办**："刷新就没了"是哪一块的问题？（数据）

## 🚀 留个挑战

用一句话、或一张随手画的草图，把你的作品拆开：它现在由哪几块组成？你未来想给它加的那个功能（比如一个能和访客对话的 AI），又需要补上哪一块？

## 📦 复制带走

<div class="aim-card"><strong>📦 复制带走</strong><br>① <strong>前端</strong>=看得见的台前 / <strong>后端</strong>=看不见的后厨 / <strong>数据</strong>=记下来的账本。<br>② 你现在的作品是<strong>纯前端</strong>；下周接上后端+数据，它才会"活"、会"记得住"。<br>③ 东西坏了先归类：<strong>前端样子 / 后端逻辑 / 数据记忆</strong>。</div>

地图有了。但真上手，你一定会撞上"它坏了、我懵了"的时刻——这才是新手最大的劝退点。所以本周的压轴，下一讲**第 06 讲**，我们专门**故意把东西弄坏**，练一套"卡住也能自己爬出来"的本事。这一讲，是整门课的灵魂。
