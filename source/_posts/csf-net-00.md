---
title: "《计算机基本功路线图 · 计算机网络》第00讲 · 一次网页请求的完整旅程（先建一张地图）"
date: 2026-07-05 09:00:00
tags: [计算机基础, 计算机网络, 零基础, 编程入门, 课程]
categories: [技术笔记]
toc: true
visibility: public
---

<style>
.csf-b{display:inline-block;font-size:12px;font-weight:700;padding:1px 8px;border-radius:999px;vertical-align:middle;margin-left:6px;line-height:1.7;white-space:nowrap}
.csf-core{color:#fff;background:#3f5d7e}
.csf-key{color:#34506e;background:rgba(63,93,126,.12);border:1px solid rgba(63,93,126,.32)}
.csf-skim{color:#7a8390;background:rgba(122,131,144,.1);border:1px solid rgba(122,131,144,.25)}
.csf-skip{color:#69727d;background:rgba(105,114,125,.12);border:1px solid rgba(105,114,125,.25)}
.csf-note,.csf-why,.csf-key-note,.csf-card,.csf-legend{margin:18px 0;padding:14px 16px;line-height:1.78;border-radius:8px}
.csf-note{background:rgba(63,93,126,.08);border-left:4px solid #3f5d7e}
.csf-why{background:var(--wash);border-left:4px solid var(--line);color:var(--muted)}
.csf-key-note{background:rgba(63,93,126,.1);border-left:4px solid #3f5d7e}
.csf-card{background:rgba(63,93,126,.07);border:1px solid rgba(63,93,126,.34);border-radius:10px}
.csf-legend{background:var(--wash);font-size:14px;line-height:2}
.csf-fold{margin:18px 0;padding:4px 16px;border:1px solid var(--line);border-radius:8px;background:var(--wash)}
.csf-fold summary{cursor:pointer;font-weight:700;padding:10px 0}
.csf-fold[open]{padding-bottom:14px}
html[data-user-color-scheme="dark"] .csf-key{color:#8fb6dd;background:rgba(63,93,126,.22);border-color:rgba(63,93,126,.5)}
html[data-user-color-scheme="dark"] .csf-note{background:rgba(63,93,126,.2)}
html[data-user-color-scheme="dark"] .csf-key-note{background:rgba(63,93,126,.22)}
html[data-user-color-scheme="dark"] .csf-card{background:rgba(63,93,126,.16)}
</style>

<div class="csf-key-note">你在地址栏敲下 <code>www.example.com</code>，按下回车，零点几秒后页面出现了。<br>这中间到底发生了什么？很多人学了很久编程，对这段路依然是一团迷雾——以为「输入网址=直接连上那台服务器」。<br>这门课要做的，就是<strong>带你跟着一次真实的网页请求，把这条路亲手走一遍</strong>。这一讲先不深挖，我们只做一件事：<strong>画一张地图</strong>，让你知道接下来每一讲走到了哪儿。</div>

## 🎯 这一讲你会学到什么

- 知道「按下回车到页面出现」之间，**不是一步，而是一长串接力**：DNS（查地址）、IP 与端口（门牌号——IP 是哪栋楼、端口是楼里的哪个房间）、TCP 握手（先打个招呼）、HTTP/HTTPS（要东西 / 加密地要东西）……这几个英文缩写现在一个都不用记，看括号里的大白话有个模糊画面就够了。
- 能用自己的话，**粗略地**说出这条旅程的几个大站点（不用记术语，记住「在干嘛」就行）。
- 拿到这门课的**整张地图**：知道每一讲对应旅程的哪一段，心里有数。
- 学会这门课的两个习惯：**先猜后做**，以及**快学 / 细究双路线**怎么用。
- 把环境和心态都准备好，包括一个你马上能打开的工具：浏览器的 **Network 面板**。

<div class="csf-note">说在最前面：这门课<strong>不是教你让 AI 替你写代码</strong>。网络排障最值钱的能力，恰恰是 AI 替不了的那部分——它看不到你此刻的网络环境，判断不了你这次到底是「名字没翻译成功（DNS）、连接没建立起来（握手），还是服务器拒绝了你（403 是一种『没权限』的错误，后面会专门讲）」。所以这门课会让你<strong>自己敲命令、自己抓包（抓包，就是把你电脑收发的网络数据记录下来、摊开给你看，后面会教你具体怎么做）、自己看面板</strong>。AI 可以当你的陪练和家教，帮你解释一个名词、看一段报错；但「这次卡在哪一层」这个判断，必须长在你自己脑子里。课程里我会反复提醒你：哪些地方<strong>请自己动手，别让 AI 代写</strong>。</div>

<div class="csf-note"><strong>再说说这门课怎么读。</strong>正文里会出现几种小标签：带 <span class="csf-b csf-core">必读</span> 或 <span class="csf-b csf-key">重点</span> 的段落，是「快学路线」——照着读、照着做就能跟上主线，不会漏掉关键，时间紧只看这些也行。带 <span class="csf-b csf-skim">细究 · 可跳读</span> 的折叠框，是「细究路线」——留给想多挖一层的人，第一遍完全可以直接跳过，不影响你理解后面的内容。这就是上面目标里说的「快学 / 细究双路线」：哪条都行，你随时可以自己选。</div>

## 🛠 跟我做

序这一讲不堆代码，但有两个**动手**任务，都很简单，请务必真的做——它们会贯穿整门课。

### 任务一：先猜 <span class="csf-b csf-core">必读</span>

先别打开任何工具。找一张纸，或者打开一个空白记事本，凭你现在的直觉，写下这句话的答案：

> 「我在浏览器输入 `www.example.com` 并按下回车后，到页面显示出来，中间大概发生了什么？」

不用怕写错，**写错才是这门课的价值所在**。哪怕你只能写出「电脑连上服务器，服务器把网页发回来」这一句，也照样写下来。然后——

<div class="csf-note"><strong>把它拍照存好，或者另存为一个文件。</strong>到整门课最后一讲，我会请你回来看这张照片。你会非常清楚地看到自己这段时间长进了多少。这是「先猜后做」最大的一次。</div>

### 任务二：数一数一个页面到底发了多少条请求 <span class="csf-b csf-key">重点</span>

现在打开你电脑上的浏览器（Chrome、Edge、Firefox 都行），跟着做：

```text
1. 随便打开一个你常用的网站（比如某个新闻站、购物站、视频站）。
2. 按下 F12 键（Mac 上是 Option + Command + I），打开「开发者工具」。
3. 在顶部一排标签里，点 “Network”（中文版叫「网络」）。
4. 此时面板大概率是空的——这正常，它只记录“打开之后”发生的请求。
5. 保持面板开着，按 F5（或 Command + R）刷新一下这个页面。
6. 看着下面的列表，密密麻麻地刷出一长串条目。
```

**先猜一下**：你觉得「打开一个网页」会向网络发出几条请求？1 条？还是几条？

把你的猜测记在心里，再去看面板最下方的统计（通常写着 `xx requests` 或「xx 个请求」）。

<div class="csf-note">大多数人都会猜「就 1 条嘛，不就是要那个网页」。但真实数字往往是<strong>几十条、上百条</strong>——一个图片是一条、一段脚本是一条、一个字体是一条、一段广告或统计是一条……「打开一个网页」从来不是一次请求，而是<strong>一大群请求的协作</strong>。如果这个数字让你有点意外，那很好，这门课就是要把这群请求讲明白。</div>

随便点开列表里的**任意一条**，你会在右边看到 `Headers`（请求头）、`Status Code`（状态码）这些字段。现在完全看不懂没关系——我只想让你**亲眼看到它们存在**。这些字段，就是后面好几讲要逐个拆开的东西。

<details class="csf-fold"><summary>细究 · Network 面板里那几列都是啥<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
你不需要现在记住，留个印象即可：<br><strong>Name</strong>：请求的资源名（哪个文件 / 接口）。<br><strong>Status</strong>：状态码，比如 200 表示成功、404 表示找不到、403 表示没权限——后面专门讲。<br><strong>Type</strong>：资源类型，文档、图片、脚本、样式……<br><strong>Time</strong>：这条请求花了多久。<br><strong>Waterfall（瀑布图）</strong>：把每条请求的耗时画成横条，让你一眼看出谁慢、谁在等谁。<br>这一面板，是你今后排查「网页为什么慢、为什么白屏、为什么加载失败」时最常用的窗口。我们整门课，某种意义上就是在教你<strong>看懂这一屏</strong>。</details>

## 💡 自己复述一遍

合上屏幕，用**一句话**回答：

> 「打开一个网页，到底是『一次请求』还是『一群请求』？输入网址到页面出现，是『一步到位』还是『一段有很多站点的旅程』？」

如果你能脱口而出「是一群请求」「是一段有很多站点的旅程」，这一讲的核心就拿到了。

## 🔧 翻车现场

<div class="csf-note"><strong>翻车一：以为「输入网址 = 直接连到那台服务器」。</strong><br>这是最普遍的误解。真相是：你敲的是一个<strong>名字</strong>（域名），电脑并不知道这名字对应世界上哪台机器。它得先去问「<strong>DNS</strong>」要到一个门牌号（IP 地址），才知道该往哪儿连；连过去还要先「<strong>握手</strong>」确认双方都在、能通话；如果是 https 还要<strong>加密协商</strong>；中途可能还撞上<strong>缓存</strong>（之前存下来的副本，省得重新跟服务器要一遍）、<strong>重定向</strong>（服务器跟你说『你要的东西搬到别处了，去那边拿』）。中间这一长串，正是这门课要带你走的路。</div>

<div class="csf-note"><strong>翻车二：一上来就死背「七层模型」的名词。</strong><br>很多教材开篇就让你背「物理层、数据链路层、网络层……」七个名字。背下来了，却完全不知道每一层在干嘛、跟你打开网页有什么关系，于是越学越枯燥、越学越虚。<br>这门课反过来：<strong>先跟着真实请求把事情走通，理解每一步在解决什么问题，再回头看分层模型，你会发现它只是把这些步骤分了类</strong>。下一讲就专门讲「为什么网络要分层」，到时你会带着今天数到的那几十条请求去理解它，而不是干背。</div>

<div class="csf-note"><strong>翻车三：把 F12 面板当成「只有前端才用的东西」。</strong><br>不管你以后想做前端、后端、测试、运维还是算法，只要你的程序要联网，<strong>看懂一次请求</strong>就是基本功。今天你数请求用的这个面板，会一路陪你到职业生涯很久很久。</div>

## ✅ 自检三问

1. 「打开一个网页」通常会发出大约多少条网络请求？是 1 条，还是几十上百条？为什么？
2. 你在地址栏输入的是一个**名字**还是一个**门牌号**？电脑要靠什么把名字换成门牌号？（答得出「DNS」最好，答不出也没关系，记住「要先翻译一下」就行。）
3. 这门课为什么主张「先走通真实请求，再回头看分层模型」，而不是一上来背七层？

## 🚀 挑战

给自己留一个小任务，**自己动手，别问 AI 要答案**：

- 用 Network 面板分别打开**三个不同**的网站（比如一个文字博客、一个图片很多的购物站、一个视频站），各刷新一次，记下每个站的请求条数。
- 观察并写下：**哪种网站请求最多？你觉得是为什么？**（提示：想想图片、视频、脚本各算几条。）
- 把这三个数字和你的猜想，记在你任务一那张纸的旁边。

这个练习没有标准答案，重点是你开始**用自己的眼睛观察网络**，而不是把它当黑盒。

<div class="csf-note">什么时候可以叫上 AI？当你点开某条请求，看到一个看不懂的字段名（比如 <code>Cache-Control</code>）想知道它大概是干嘛的，可以让 AI 给你<strong>解释</strong>一句。但「我这次三个网站的请求数为什么不一样」这种<strong>需要你结合自己屏幕去判断</strong>的事，请自己先想——这正是这门课要练的肌肉。</div>

## 📦 复制带走

<div class="csf-card"><strong>本讲一句话地图</strong><br>① 「打开网页」不是一次请求，而是<strong>一群请求的协作</strong>——你已经亲眼用 F12 数过了。<br>② 输入网址到页面出现，是一段<strong>有很多站点的旅程</strong>：名字→门牌号(DNS)→连接(握手)→可能加密(https)→请求与响应(HTTP)，沿途还有缓存和重定向。<br>③ 这门课的路线：<strong>先跟着真实请求走通，再回头理解分层模型</strong>，全程你自己抓包、自己敲命令、自己做判断，AI 只当陪练。<br>④ 记得完成两个动手任务：<strong>写下你现在的猜想并拍照存好</strong>，到最后一讲回来对照。</div>

下一讲我们就从这张地图的第一个问题开始：**为什么网络非要「分层」不可？** 带着你今天数到的那几十条请求来，我们把「分层」这件事讲成你一看就懂的直觉。
