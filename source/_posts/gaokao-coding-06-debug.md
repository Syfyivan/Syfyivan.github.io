---
title: "《写给高考生的编程第一课》第06讲 · 故意把它弄坏，再亲手修好（灵魂课）"
date: 2026-06-30 16:00:00
tags: [AI, 编程入门, 零基础, 高考, vibe coding, debug, 报错, 课程]
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

<div class="gkc-key-note"><strong>这是整门课的灵魂课。</strong>"东西坏了、我懵了"——这是劝退新手的头号杀手。今天我们反过来，<strong>主动</strong>把作品弄坏三次，再一次次亲手修好。学完，"卡住"对你就不再是终点，而是一个你知道怎么爬出来的小坑。</div>

很多人学编程半途而废，不是因为难，是因为某次卡住、修不好、又问不到人，就放弃了。所以这一讲我们不躲，专门练"卡住怎么办"。而且——**尽量你自己修，AI 只当帮手。**

## 🎯 这一讲你会得到什么 <span class="gkc-b gkc-core">必读</span>

一套"卡住也能自己爬出来"的固定动作。今天结束时，你会主动制造三个 bug、并把它们一个个修好——这种"我能搞定"的底气，比多学十个标签都值钱。

## 心态先摆正：坏是常态，报错是好事 <span class="gkc-b gkc-core">必读</span>

先把心态摆正，这能让你轻松一大半：**所有人的代码都会坏**，包括写了二十年的人。卡住不代表你笨，它就是造东西的日常。

而且——**报错不是在骂你，是程序在小声告诉你："我在这儿卡住了，因为……"**

<div class="gkc-note"><strong>有报错，是幸运的。</strong>最难缠的反而是"没有任何报错、就是白屏 / 不对劲"那种——因为没线索。所以看到一堆红字别怕，那是程序递给你的藏宝图。</div>

## 报错长什么样、怎么读 <span class="gkc-b gkc-core">必读</span>

一段报错，通常就三个信息：**在哪个文件、第几行、什么类型的问题**。比如：

```
index.html:42  Uncaught SyntaxError: Unexpected end of input
```

拆开看：`index.html` 是**哪个文件**，`42` 是**第几行**，后面那句是**什么问题**（这里大意是"东西没写完整、提前结束了"）。

<div class="gkc-key-note"><strong>你不用看懂每个英文单词。</strong>诀窍就一条：<strong>只看第一行（或最后那句关键的）</strong>，它通常最接近真正的问题。剩下的看不懂，完全没关系——下面就教你怎么办。</div>

<details class="gkc-fold">
<summary>报错藏在哪儿？怎么把它调出来<span class="gkc-b gkc-skim">可跳读</span></summary>

网页的报错，很多藏在浏览器的"开发者工具"里。在 Chrome / Edge 里，页面上按 **F12**（Mac 上是 `Cmd+Option+I`），弹出来的面板里点 **Console（控制台）**，红色的就是报错。第一次看会觉得乱，没关系，你只要会"把红色那段复制出来"就够了。

</details>

## 习惯 #2：报错先假设，再粘贴 <span class="gkc-b gkc-core">必读</span>

这是今天最重要的一个动作，也是"自己会修"和"只会把报错甩给 AI 等答案"的分水岭。

<div class="gkc-key-note"><strong>造物者习惯 #2 · 报错先假设，再粘贴</strong><br>看到报错，<strong>先别急着原封不动丢给 AI</strong>。先花 10 秒，自己猜一句："我觉得是不是【哪里】出了问题？"——然后再把报错交给 AI，并带上你的猜测。<br>猜对了，你在长本事；猜错了，对照之下你印象最深。</div>

为什么这一下这么关键？因为如果你永远只是"复制报错 → 粘贴 → 抄答案"，那修 bug 的能力始终长在 AI 身上，不在你身上。AI 一掉线，你又回到原点。**先假设那一下，是把能力搬到你自己身上的唯一办法。**

## 修 bug 的固定三步 <span class="gkc-b gkc-core">必读</span>

<div class="gkc-card"><strong>修 bug 三步走</strong><br><strong>① 读 + 假设</strong>：只看报错第一行，先猜一个怀疑点（习惯 #2）。<br><strong>② 求助 + 带上猜测</strong>：把报错原样复制给 AI，并加一句"我怀疑是【哪里】，你看对不对、怎么修"。<br><strong>③ 验证 + 复述</strong>：改完刷新看好没好；好了，用一句话对自己说"刚才到底是哪里坏了、怎么修的"。</div>

<div class="gkc-note"><strong>复制报错时注意：</strong>别把你的密码、API key 之类敏感信息一起贴出去（后面接 AI 时你会有 key，要记住这条）。</div>

## 🛠 跟我做：主动弄坏三次，再修好

打开你的主页代码，跟着来。**每弄坏一次，都先按习惯 #2 自己猜，再修。**

**坏法 1 · 删个符号。** 随手删掉某个标签的 `>`，或一对引号里的一个 `"`，保存、刷新。页面大概乱了或白了。→ 先猜哪儿坏了 → 让 AI 帮你确认并修。

**坏法 2 · 写错个单词。** 把某处的 `color`（颜色）故意拼成 `colr`，保存、刷新。看那处样式失效了没。→ 先猜"是不是我把哪个词拼错了" → 修。

**坏法 3 · 删段文字。** 把"关于我"那一整块删掉一半（删到一半故意留个残缺），保存、刷新。→ 观察、假设、修复。

<div class="gkc-note"><strong>你可能会发现：删 HTML 符号，控制台里经常一条红字都没有，页面却乱了。</strong>这很正常——HTML 这种"结构坏了"很多时候不报错。这恰恰是上面说的"<strong>没报错更麻烦</strong>"那一类：没有红字给你当线索，就靠"它<strong>本该</strong>什么样、<strong>实际</strong>什么样"的对比，自己造线索，再交给 AI。有红字的（比如 JS 写错）反而好办。</div>

三次都修好后，你会有个奇妙的感觉：原来坏了不可怕，我有一套动作能让它复活。

## 脚手架，一次比一次少撤一点 <span class="gkc-b gkc-key">重点</span>

这一讲你大量靠 AI 帮你修——很正常，刚开始就该这样。但请记住一个方向：**以后每修一次，试着比上一次多自己做一点点。**

第一次：报错全靠 AI 解释、AI 修。
第二次：自己先读第一行，再让 AI 修。
第三次：自己猜出怀疑点，让 AI 只确认。
第十次：简单的，自己直接就改了。

<div class="gkc-why">这叫<strong>脚手架递减</strong>：盖楼时脚手架不可少，但楼起来了就得一层层拆掉，否则那不是你的楼，是脚手架撑着的壳。学东西也一样——AI 的帮助要逐步减少，能力才会真正长到你身上。第四站的"周末裸考"，就是来检验脚手架拆得怎么样的。</div>

## 🔧 翻车现场：白屏，但没有任何报错

有时候更让人抓狂：页面一片空白，却连个报错都没有。

<div class="gkc-why">没报错时，线索得你自己造。两招：①回到第 05 讲的"对比"——它<strong>本该</strong>显示什么、<strong>实际</strong>显示什么？把这个差别说清楚；②直接问 AI："我的页面打开是白屏，没有报错，可能是哪些原因？"让它帮你列出怀疑清单，再一个个排查。记住：报错是礼物，没报错才真要靠你的描述能力。</div>

## ✅ 自检三问

- **它在干嘛**：一段报错里，通常藏着哪三个信息？（文件、行号、问题类型）
- **它对吗**：看到报错，你的第一个动作是什么？（只看第一行 + 先自己假设一个怀疑点）
- **坏了怎么办**：页面白屏又没报错，你怎么造线索？（用"本该 vs 实际"，或让 AI 列怀疑清单）

## 🚀 留个挑战

让 AI 给你的主页加一个稍微复杂点的小功能（比如"一个按钮，点一下背景换个颜色"）。十有八九第一次不完全对——这次，**你自己读报错、自己提出怀疑点，只让 AI 确认和给最小修改**，把它修通。

修通的那一刻，记住这种感觉。那就是"独立"。

## 📦 复制带走

<div class="gkc-card"><strong>📦 复制带走</strong><br>① 坏是常态，<strong>报错不是骂你，是线索</strong>；没报错才更麻烦。<br>② 读报错：<strong>只看第一行</strong>，认个大概就够。<br>③ 习惯 #2：<strong>报错先假设，再粘贴</strong>——这是能力长到你身上的关键一下。<br>④ <strong>脚手架递减</strong>：每修一次，比上次多自己做一点。</div>

迈过了 debug 这道坎，你就有了"独立"的底气。第二站「揭盖」到此结束——你已经知道作品存在哪、由几块组成、坏了怎么修。下一站，我们**通电**：给你的作品接上一个真正的 AI，让它从"好看的展板"变成"能跟人对话的活物"。下一讲**第 07 讲**，见。
