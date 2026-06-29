---
title: "《AI 造物入门》第01讲 · 半小时，让你的第一张网页活过来"
date: 2026-06-29 11:00:00
tags: [AI, 编程入门, 零基础, vibe coding, HTML, 网页, 课程]
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

<div class="aim-key-note"><strong>这一讲，你会真的做出一个网页。</strong>零安装、半小时，你描述一句，它就出现在屏幕上。你还会顺手学到造物者的第一个习惯——<strong>先猜后做</strong>。它就是"自己学会"和"只会喊话"之间那条分界线。</div>

上一讲你写下了一句"我想做一个 ___"。现在我们让它，第一次，变成屏幕上能看的东西。

## 🎯 这一讲你会做出什么 <span class="aim-b aim-core">必读</span>

你对 AI 说一段话——你的名字、一句自我介绍、你喜欢的几样东西。几秒钟后，浏览器里出现一张属于你的网页：顶上是你的名字，下面是介绍和"我喜欢的"。然后你再多说几句，它就跟着换颜色、加板块、改文字。

半小时后，你手里有两样东西：**一张能看的网页**，和**一个会跟你一辈子的工作循环**。

## 🔮 先装一个习惯：先猜后做 <span class="aim-b aim-core">必读</span>

<div class="aim-key-note"><strong>造物者习惯 #1 · 先猜后做</strong><br>每次让 AI 干活<strong>之前</strong>，先用一句话猜一下：它大概会给我什么？做完再对照真实结果。<br>猜对了，说明你开始懂了；猜错了——<strong>恰恰是你猜错的地方，印象最深、学得最牢。</strong></div>

为什么把它放在第一位？因为"看 AI 做"和"自己学会"之间，差的就是这一下。只是看，AI 一关掉，你心里就空了；而先自己猜一下，脑子会主动转一圈，知识才会留在你身上，而不是留在 AI 身上。

接下来每一步，我都会先请你"猜猜看"。**别跳过那一下**，它才是你真正在学的地方。

<details class="aim-fold">
<summary>这个习惯有讲究吗？<span class="aim-b aim-skim">细究 · 可跳读</span></summary>

有。学习科学里管它叫**生成效应**：自己先尝试产出一个答案（哪怕是错的），再看正确答案，比直接看正确答案记得牢得多。名字记不记得无所谓，养成"先猜一下"的反射最值钱。这门课从头到尾都在用它。

</details>

## 🛠 跟我做

**第 0 步 · 找一个能聊天的 AI。** 用任意一个你能稳定打开的 AI 就行。最省事的是带"**实时预览**"的——你描述，它在旁边直接把网页画出来。海外的 Claude、ChatGPT 这类有；国内能直连的豆包、通义千问、Kimi 等也在做这种预览，**有就用，没有也完全不影响**——第 3 步教你怎么看到它，任何 AI 都行。

**第 1 步 · 先猜（10 秒）。** 在动手前，对自己说一句：*"我把自己介绍给 AI、让它做张网页，出来大概是什么样子？"* 有没有图？什么颜色？随便猜，记心里。

**第 2 步 · 把下面这段话填好，发给它。** 【】里换成你自己的：

```
请帮我做一个个人主页，输出一个完整的 HTML 文件，能直接在浏览器打开。

关于我：
- 名字：【你的名字】
- 一句话介绍：【比如：一个喜欢打篮球和科幻片的人】
- 我喜欢的三样东西：【比如：篮球、《三体》、深夜的炒面】

要求：
- 页面干净好看，配色温暖，手机上也要正常显示
- 顶部放我的名字和那句介绍
- 中间分两块：「关于我」和「我喜欢的」
- 全部用中文

请直接给我完整的 HTML 代码。
```

**第 3 步 · 看见它。** 两种情况，对号入座：

- **你的 AI 有预览**：它已经把网页画在旁边了。看一眼——和你第 1 步猜的，差多少？
- **你的 AI 只给了代码**：别慌，把代码存成文件打开就行，30 秒，看下面这个折叠：

<details class="aim-fold">
<summary>怎么把代码变成能打开的网页（没有预览就看这个）</summary>

**Windows：**
1. 打开"记事本"。
2. 把 AI 给的代码**全部**粘贴进去。
3. 文件 → 另存为 → 文件名写 `index.html` → "保存类型"选**所有文件** → 保存。
4. 找到这个文件，**双击**，它会用浏览器打开。

**Mac：**
1. 打开"文本编辑"。
2. 顶部菜单 格式 → **制作纯文本**（很重要）。
3. 粘贴代码 → 文件 → 存储 → 名字写 `index.html` → 如果弹出扩展名提示，选"使用 .html"。
4. 双击这个文件打开。

记住这个文件在哪——它就是你的第一个作品，后面几讲都围着它转。

</details>

**第 4 步 · 改三处（这步最好玩）。** 每改一处之前，还是**先猜**它会变成什么样，再发给 AI：

1. "把主色调换成【你喜欢的颜色，比如蓝绿色】。"
2. "加一块『我的目标』，写上【你的一个小目标】。"
3. "把介绍那句改成【新的一句】。"

看着它一次次变样。**恭喜——你已经在造东西了。**

## 💡 刚才到底发生了什么 <span class="aim-b aim-key">重点</span>

先别往下看。合上屏幕，用一句话对自己说：**刚才这套流程，是哪几步？**

……想好了再看：**描述 → 生成 → 看 → 改**。就这四步，转圈。你这门课剩下的所有东西，都是这个圈在转，只是越转越大。

那 AI 给你的"代码"到底是什么？别怕它。**一个网页，本质就是一个文本文件**，里面用一些"标签"告诉浏览器每一块是什么。比如：

```html
<h1>张三</h1>
<p>一个喜欢篮球的人</p>
```

`<h1>` 是"大标题"，`<p>` 是"一段文字"。尖括号里的就是**标签**，浏览器看到它们，就知道该怎么显示。你现在不用会写——**能大概认出"这块是标题、那块是文字"就够了**，第 03 讲专门练这个。

## 🔧 翻车现场：含糊一句，看它瞎猜

来，故意翻一次车。新开一段对话，只发这一句：

```
帮我做个好看的网站。
```

看它给你什么。大概率是一个跟你毫无关系、谁都能用的"通用模板"——没有你的名字、没有你喜欢的东西，甚至看不出是干什么用的。

<div class="aim-why"><strong>为什么会这样？</strong>这不怪 AI，是它没拿到足够的信息。你说得越含糊，它就越只能猜，用最大众的默认值把页面填满。对比一下第 2 步那段又长又具体的话——信息给够了，它自然就做得准。<strong>"把想要的说清楚"本身就是一门手艺</strong>，下一讲（第 02 讲）专门教你这个。</div>

<div class="aim-note"><strong>万一网页白屏 / 乱掉了？</strong>第一次很常见，先别慌，也别钻进代码里。最简单两招：①跟 AI 说"打开是白屏，帮我修"或"重新给我一份完整的"；②把出问题的样子描述给它。真正的"修 bug"是第 06 讲的主场，今天你只要知道——卡住是正常的，喊一声就能继续。</div>

## ✅ 自检三问

- **它在干嘛**：你能不能用一句话，说出你这张网页有哪几块？
- **它对吗**：页面上的名字、介绍，是你要的那个吗？哪里还不对？
- **坏了怎么办**：如果现在想再改一处，你知道下一步该做什么吗？（对，再说一句话。）

三个都能答上来，这一讲就真的过了。

## 🚀 留个挑战

别照我的，**自己写一句话**，给网页加一样我没让你加的东西——一张你喜欢的图片？一份你的歌单？一个倒数到某个你期待的日子的小牌子？

老规矩：**先猜**它会怎么做，再发给 AI，再对照。

## 📦 复制带走

<div class="aim-card"><strong>📦 复制带走</strong><br>① 造物的循环就四步：<strong>描述 → 生成 → 看 → 改</strong>，一直转。<br>② 习惯 #1：<strong>先猜后做</strong>——你猜错的地方，恰恰学得最牢。<br>③ 网页 = 一个文本文件，<strong>标签</strong>告诉浏览器每一块是什么。<br>④ 改网页，就是<strong>再说一句话</strong>。</div>

你大概已经发现了：**说得越准，它做得越对。** 这不是错觉，这是整件事的命脉。

下一讲——**第 02 讲**，我们专门练这门最值钱的手艺：把脑子里的画面，说成 AI 一次就能听懂的话。
