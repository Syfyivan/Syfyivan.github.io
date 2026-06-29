---
title: "《AI 造物入门》第02讲 · 把想要的，说成 AI 一次就能听懂的话"
date: 2026-06-29 12:00:00
tags: [AI, 编程入门, 零基础, vibe coding, 提示词, 课程]
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

<div class="aim-key-note"><strong>这一讲只练一件事：把"我想要"说清楚。</strong>它是整门课里最值钱的手艺——AI 做得准不准，八成不取决于它多聪明，而取决于你说得多清楚。学完，你会有一个能反复套用的"好需求配方"。</div>

上一讲结尾我们故意翻了车："帮我做个好看的网站"，AI 给了个跟你毫无关系的通用模板。这一讲，我们就把这种"含糊"治好。

## 🎯 这一讲你会得到什么 <span class="aim-b aim-core">必读</span>

一个能套一辈子的**好需求配方**，和一次"亲手把烂需求改成好需求、AI 立刻做对"的体验。以后无论让 AI 做网页、写文案、还是查资料，都用得上。

## 一个核心事实：AI 不会读心 <span class="aim-b aim-core">必读</span>

想象你去找一位画像师，描述一个人。

你说"画个人"——他只能画一张最普通的脸，十有八九不像。
你说"圆脸、单眼皮、左边眉毛有道疤、笑起来有酒窝、戴黑框眼镜"——一张能用的画像就出来了。

AI 就是那位画像师。**它不会读你的心，只会照你给的信息画。** 你给得越具体，它越像你要的；你给得越含糊，它就只能拿"最大众的样子"来填。

<div class="aim-key-note"><strong>不是 AI 要的多，是你给的少。</strong>"做得不像我要的"几乎从来不是因为 AI 笨，而是它根本没拿到足够的信息。你的任务，就是把脑子里那张清晰的画面，搬到 AI 面前。</div>

<div class="aim-note">顺手记一句：AI 会<strong>照你说的</strong>去做，但它不保证<strong>说得对</strong>——你说得含糊，它就瞎猜；你说错了，它也照做。这根"别全信、要自己把关"的弦，我们从这一讲起一路绷着，到第 12 讲收口。</div>

## 好需求配方：说清四件事 <span class="aim-b aim-core">必读</span>

下次让 AI 做东西，照这四块说，基本不会差：

<div class="aim-card"><strong>好需求 = 背景 + 清单 + 规矩 + 例子</strong><br><strong>① 背景</strong>：我是谁、给谁用、想解决什么<br><strong>② 清单</strong>：具体要哪些东西／功能（一条条列出来，别笼统）<br><strong>③ 规矩</strong>：风格、长度、必须有什么、千万别有什么<br><strong>④ 例子</strong>：像某个东西那样，或直接给个样例</div>

最后再加一句**你要的产出形式**——"请直接给我完整的 HTML"、"列成表格"、"先给我三个方案"。

不用每次四块都写满。但当你对结果不满意时，**回头看看是不是漏了哪一块**——十有八九，就是漏了。

## 现场重做：从一句废话，到 AI 一次做对

**烂需求**（上一讲那个）：

```
帮我做个好看的网站。
```

AI 只能猜：什么网站？给谁？放什么？"好看"是哪种好看？

**好需求**（套上配方）：

```
【背景】我想做一个个人主页，发给新认识的朋友看，让他们快速认识我。
【清单】① 顶部：我的名字 + 一句话介绍；② “关于我”一段；③ “我做过的三件小事”列表；④ 底部放我的邮箱。
【规矩】风格干净、配色温暖（米色/橙色系），手机上也好看；不要花哨动画；全中文。
【例子】整体感觉像 Notion 个人页那样：留白多、字大、清清爽爽。
请直接给我一个完整的 HTML 文件。
```

把这两段分别发给 AI，你会亲眼看到差距有多大。

<div class="aim-key-note"><strong>🔮 先猜后做</strong>：发之前先猜——这两次结果会差多少？哪一版会更像"你的"？发完再对照，你对"具体"的威力就有了体感。</div>

## 给例子，胜过堆形容词 <span class="aim-b aim-key">重点</span>

新手最容易踩的坑，是把一堆形容词当需求：

> "做得高级一点、大气一点、有质感、年轻化。"

这些词对 AI 几乎没用——"高级"在一千个人脑子里是一千个样子，AI 只能取个平均值，于是又回到"通用模板"。

**治法：把每个形容词，换成一个具体的例子或规则。**

| 形容词（没用） | 换成具体（有用） |
|---|---|
| 高级 | 黑白灰为主、大量留白、字体细 |
| 年轻 | 亮色、圆角、活泼的短句 |
| 干净 | 一屏不超过三种颜色、不要边框 |
| 像大厂那种 | 像 Apple 官网首页那种 |

<div class="aim-why"><strong>为什么例子这么管用？</strong>因为一个例子里，藏着几十个你说不清的细节——间距、颜色、字重、节奏。你说一句"像 Apple 官网"，AI 一下就接收到了这一整套感觉，这是任何形容词都给不了的信息量。</div>

## 说不好？那就边说边改 <span class="aim-b aim-key">重点</span>

好消息：**你不需要一次就把需求说完美。** 真实的造物，从来都是边说边改的：

先说个大方向 → 看 AI 给的 → 指出哪不对 → 它再改 → 再看……

比如：

- "整体不错，但配色太暗了，换成暖色。"
- "‘关于我’那段太长，压成三句话。"
- "把邮箱换成一个‘联系我’按钮。"

每一句小修改，都是一次小小的"说清楚"。**所以别怕开口不完美——先开口，再一步步逼近。** 这比憋半天想一个完美 prompt 高效得多。

## 💡 刚才到底发生了什么 <span class="aim-b aim-key">重点</span>

合上屏幕，自己回答：好需求的四块，是哪四块？

……背景、清单、规矩、例子。

现在动手：把你上一讲做主页时用的那段话，**用这四块重写一遍**。哪怕原来就还行，也试着补一个"例子"进去。写完发给 AI，看页面有没有变得更"像你"。

## 🔧 翻车现场：形容词糊一脸

再故意翻一次车。给 AI 发这种"形容词汤"：

```
帮我把主页做得高级、大气、有格调、高端、要有设计感。
```

看结果——大概率还是个平淡的通用页，甚至有点"用力过猛"的别扭。

<div class="aim-why"><strong>问题出在哪？</strong>整段话没有一个 AI 能落地的具体信息，全是主观形容词，它只能瞎蒙。换成"黑白灰、大留白、像 Apple 官网首页"，立刻就不一样了。<strong>记住：形容词是给人听的，例子和规则才是给 AI 听的。</strong></div>

**当场救回来**：把那句"形容词汤"换成——"配色黑白灰为主、大量留白，首屏只放标题和一句介绍，像 Apple 官网首页那种"——再发一次。看，立刻就对了。

记住这个手感：**烂需求 → 一句话改具体 → 马上变好**。卡住从来不可怕，改一句话就回来了。

## ✅ 自检三问

- **它在干嘛**：好需求的四块，你能脱口而出吗？（背景 / 清单 / 规矩 / 例子）
- **它对吗**：你重写后的需求里，有没有至少一个"具体例子"，而不是只有形容词？
- **坏了怎么办**：如果 AI 还是没做对，你知道下一步该补哪一块、或怎么一句话纠偏吗？

## 🚀 留个挑战

给你上一讲的主页，写**一条**真正讲究的需求（四块齐全 + 至少一个例子），让它明显升一个档次。

老规矩：**先猜**改完会是什么样，再发给 AI，再对照。把"你最满意的那版需求"存下来——那就是你的第一份"提示词模板"。

## 📦 复制带走

<div class="aim-card"><strong>📦 复制带走</strong><br>① AI 不会读心，<strong>你给多少有效信息，它还你多少精准</strong>。<br>② 好需求配方：<strong>背景 + 清单 + 规矩 + 例子</strong>，再加"我要什么形式"。<br>③ <strong>给例子 &gt; 堆形容词</strong>——例子里藏着说不清的几十个细节。<br>④ 说不好就<strong>边说边改</strong>，别憋完美 prompt。</div>

会"说"，你就握住了指挥 AI 的方向盘。但 AI 给回来的那一坨代码，你还看不懂——下一讲**第 03 讲**，我们练第三个能力：**读**。不学语法，只教你一眼认出"这块是干嘛的"。
