---
title: "《AI 造物入门》第00讲 · 序：零基础，做中学，独立做出你的第一个作品"
date: 2026-06-29 10:00:00
tags: [AI, 编程入门, 零基础, vibe coding, 造物, 课程]
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

<div class="aim-key-note"><strong>这一讲是序，不写一行代码。</strong>它只把三件事说清楚：这门课<strong>给谁</strong>、<strong>怎么学</strong>、<strong>学完你能干嘛</strong>。读到最后，你会写下一句话——你要造的那个东西。下一讲起，我们就把它做出来。</div>

你刚高考完，或者刚进大学。你想试试编程和 AI，于是翻开一份教程——

第一页：变量。第二页：循环。第三页：函数。第四页，你关掉了。

**别从那儿开始。** 这门课换一条路走。

## 学完，你能做到什么 <span class="aim-b aim-core">必读</span>

> 一个月后，你能**独立**做出一个小作品，并把它发布成一个**公开网址**——好看、能交互、背后还连着一个真正的 AI。你可以把这个链接发给同学、发给爸妈、放进简历。

请盯住那两个字：**独立**。

不是"AI 在边上喂着、你才做得出来"，而是 AI 不在、它出错、它掉线的时候，你也能自己往下走。这门课和"让 AI 替你做完"最大的区别，就在这里——

<div class="aim-key-note"><strong>我们卸载的是语法，不是你的判断。</strong>那些查字典式的死记硬背（标签怎么拼、函数叫什么名字）交给 AI；但该由你来的——想清楚要做什么、把要求讲明白、看懂它给的东西、它错了你能修——一样都不替你做。这样你出来是一个会指挥 AI 的人，而不是 AI 一关掉就抓瞎的人。</div>

## 这门课给谁 <span class="aim-b aim-core">必读</span>

**真 · 零基础，完全 OK。** 没写过一行代码、分不清前端后端、平时没怎么用过 AI——这门课就是为你写的。

你需要的只有三样：一台电脑、一点好奇心、一个"我会卡住但不慌"的心态。
不需要的：数学好、英语好、买过别的课、所谓的天赋。

## 怎么学：你当导演，AI 是剧组

你不是来"当程序员"的，你是来**当导演**的。美术、敲代码、写文案，AI 这个剧组全包；你负责的是：想清楚要拍什么、把要求讲明白、看回放、喊"这里重来"。好导演不需要会演每一个角色。

而"独立"的底气，是下面这四个换任何工具都不过时的能力——整门课，其实都在偷偷练它们：

<div class="aim-card"><strong>4 个不会过时的能力</strong><br><strong>拆</strong>：把"我想要个网站"拆成 AI 能下手的具体步骤<br><strong>说</strong>：把脑子里的画面，精确地翻译给 AI<br><strong>读</strong>：看懂 AI 给的东西在干嘛（看结构，不抠语法）<br><strong>修</strong>：它出错时（它一定会），不慌，自己定位、自己修好</div>

每一讲，我都会让你做两个小动作，专门防止你变成"只会喊话"的人：**先猜后做**（AI 出手前，先猜它会怎么写）、**周末裸考**（关掉 AI，自己过一小关）。别怕，到时候你会感谢这两个动作。

## 怎么读 <span class="aim-b aim-key">重点</span>

每讲铺两条路，按需走：

- **快做**：照着抄，把今天的东西做出来。第一次学，走这条，最快尝到甜头。
- **细究**：想顺便搞懂"刚才到底发生了什么"，会用折叠块单独标出来，不耽误快做。

正文里还有几个小徽章，帮你分轻重：

<div class="aim-legend"><span class="aim-b aim-core">必读</span> 必须做 / 必须懂，全课的承重墙<br><span class="aim-b aim-key">重点</span> 关键细节，做的时候高频用到<br><span class="aim-b aim-skim">可跳读</span> 知道有这回事即可<br><span class="aim-b aim-skip">选学</span> 进阶边角，第一次学可以直接跳过</div>

节奏：4 周、13 讲（含这一讲），每讲 30–60 分钟封顶。每周一个小高潮，第 4 周一个大高潮——上线。

## 开课前，备齐这几样 <span class="aim-b aim-core">必读</span>

花 10 分钟，第 01 讲就能直接开做：

- **一台电脑**（Windows 或 Mac 都行）。手机、平板能看课，但做东西请用电脑。
- **一个浏览器**：Chrome 或 Edge。
- **一个能用的 AI**：第 1 周"零安装"，网页版就行。具体怎么挑，第 01 讲手把手带你选（国内、国外方案都给）。
- **一个轻松的心态**：你会卡住，那是课程故意设计的，不是你笨。

<details class="aim-fold">
<summary>打不开海外网站 / 要不要花钱？<span class="aim-b aim-skim">可跳读</span></summary>

**网络**：某个海外 AI 打不开，也不用折腾翻墙——每一步我都会给"国内能直连"的替代方案，保证你跟得上。

**费用**：前两周基本零成本（网页版 / 免费额度）。第 3 周给作品接真 AI 时，会用到一点点付费额度，我会带你走最省钱的路（免费额度 + 小模型），整个月大概几块到几十块，完全可控，而且每一步花不花钱我都提前说清楚。

</details>

## 你现在就做一件事：定下你的点子 <span class="aim-b aim-core">必读</span>

别等到第 01 讲。**现在**，把下面这句话填完，记在备忘录里：

> 我想做一个 **____**，它能 **____**，我想发给 **____** 看。

三个例子，帮你找找感觉：

- 我想做一个**个人主页**，它能**用我的语气回答别人对我的提问**，我想发给**新认识的同学**看。
- 我想做一个**"今天吃什么"小工具**，它能**帮纠结的我随机选一家**，我想发给**室友**看。
- 我想做一个**高数公式速查页**，它能**让我考前快速翻**，我想发给**全班**看。

一时想不出来也没关系——默认就做"个人主页"，跟着第 01 讲做，就有了。

<div class="aim-card"><strong>📦 复制带走</strong><br>① 这门课给<strong>真 · 零基础</strong>：没碰过代码也能学。<br>② 怎么学：<strong>做中学</strong>，你当导演、AI 当剧组。<br>③ 学完：能<strong>独立</strong>做出并上线一个能分享的小作品。<br>④ 今天唯一的作业：把"我想做一个 ___"那句话写下来。</div>

下一讲——**第 01 讲**，半小时，让你的第一张网页**活过来**。你会亲眼看着脑子里的想法，变成浏览器里能点开的东西。

带着你那句话，我们开始。
