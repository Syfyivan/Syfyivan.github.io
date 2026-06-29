---
title: "《AI 造物入门》第06讲 · 故意把它弄坏：你的第一次真 debug"
date: 2026-06-29 16:00:00
tags: [AI, 编程入门, 零基础, vibe coding, debug, 调试, 课程]
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

<div class="aim-key-note"><strong>这一讲，是整门课的灵魂。</strong>今天我们故意把东西弄坏，然后教你一套"卡住也能自己爬出来"的流程。学完，"报错"对你就不再是世界末日，而是一道有标准解法的关。这一讲，悄悄决定了你将来是"独立造物者"，还是"AI 一掉线就抓瞎的人"。</div>

前面你学会了做、说、读，也有了一张架构地图。但真正上手，你一定会撞上那个时刻：**它坏了，我懵了。** 今天，我们就专门练这个。

## 🎯 这一讲你会得到什么 <span class="aim-b aim-core">必读</span>

一套能反复套用的 debug 流程，和一次"亲手把坏掉的页面修好"的实战。从此卡住不慌——因为你手里有步骤。

## 先把心态摆正：坏，是常态，不是你的错 <span class="aim-b aim-core">必读</span>

先说一个真相，能让你轻松一大半：

**所有人的代码都会坏**，包括写了二十年的人。区别从来不是"谁不出 bug"，而是"谁出了 bug 能冷静修好"。

所以"卡住"不代表你笨、不代表你不适合干这个——它就是造东西的日常，跟做饭会糊锅、打球会投丢一样普通。你要练的不是"避免卡住"，而是**从卡住里爬出来的本事**。

<div class="aim-key-note">还记得序里那个问题吗——"会不会变成只会喊话、一坏就废的人？"<strong>答案就在这一讲。</strong>能不能自己 debug，正是"独立"和"废掉"之间，那道唯一的、真正的分界线。</div>

## 一套五步 debug 流程 <span class="aim-b aim-core">必读</span>

下次东西坏了，照这五步走，别乱：

<div class="aim-card"><strong>Debug 五步</strong><br><strong>① 描述</strong>：它本该怎样？现在实际怎样？（说清楚"哪里不对"，你就解决了一半）<br><strong>② 找线索</strong>：有没有报错信息？读不懂也别忽略它——它是线索，不是骂你。<br><strong>③ 先猜</strong>：丢给 AI 之前，先说出"我怀疑是这里"。<br><strong>④ 改一处就验证</strong>：一次只改一个地方，改完立刻回去刷新看。<br><strong>⑤ 还不行就带信息再问</strong>：把"我试了什么、结果怎样"一起告诉 AI。</div>

<details class="aim-fold">
<summary>报错信息看不懂，怎么办？<span class="aim-b aim-skim">可跳读</span></summary>

不用全看懂。两招就够：①只看**第一行**——它通常最接近真正的问题；②看不懂就**原样复制**，丢给 AI 说"这是报错，帮我看看哪里出了问题"。报错信息是写给"修它的人"的线索，你把它当藏宝图上的提示就好。

</details>

## 为什么"先猜一个怀疑点"最关键 <span class="aim-b aim-key">重点</span>

五步里，第 ③ 步最容易被跳过，却最重要。

<div class="aim-why"><strong>如果你每次都是把报错原样一甩、"帮我修"——修好了，你也什么都没学到。</strong>你练的是"叫人来修"，不是"修"。而先逼自己猜一个怀疑点，哪怕猜错，你的脑子就开始建立"什么会导致什么"的因果直觉。猜一百次，你就有了一百次这种直觉的积累。这，就是你和"只会喊话的人"之间，慢慢拉开的那道沟。顺带一提：把你的怀疑也告诉 AI，它的修复往往更准——因为你多给了它一条线索。</div>

## 现场实战：亲手弄坏，再修好 <span class="aim-b aim-core">必读</span>

光说没用，来真的。

**第 1 步 · 弄坏它。** 跟 AI 说：

```
帮我把这个页面改出一个小毛病：删掉一个关键的结束标签，让它显示乱掉。
先别告诉我你删了哪里。
```

（或者你自己在编辑器里，随手删掉一个 `</div>`、一个 `"`。）

**第 2 步 · 用五步修回来。** 先描述现在乱成什么样 → 先猜是哪里 → 让 AI 帮你确认 → 改一处 → 刷新验证。

修好的那一刻，你会发现：原来"修好"是有套路的，不是靠运气。**这套套路，就是你今天真正带走的东西。**

## 🔧 翻车现场：AI 的第一次修复，也可能是错的

一个必须知道的真相：你把 bug 丢给 AI，**它给的第一个修复，不一定对**。它可能改错地方，也可能"修好了 A，又顺手弄坏了 B"。

<div class="aim-why">这很正常，别因此慌。你的角色是<strong>验证者</strong>：AI 改完，你一定要回去刷新、亲眼确认真的好了。没好，就把新情况告诉它，再来一轮。AI 是你超级能干的助手，但它不是神——能"自己验证它修没修对"的你，才是这个项目真正的负责人。怎么判断 AI 靠不靠谱，第 11 讲会专门展开。</div>

## ✅ 自检三问

- **它在干嘛**：遇到 bug，你的第一步是什么？（描述：本该怎样 vs 实际怎样）
- **它对吗**：debug 五步里，哪一步是"先猜怀疑点"？（第 ③ 步）
- **坏了怎么办**：AI 修了一次还没好，你会怎么做？（带着"试过什么、结果怎样"再问，且一次只改一处）

## 🚀 留个挑战

故意把你的主页弄坏**三种**不同的样子（删个标签、写错个颜色词、删掉一段文字），每一种都用五步流程自己修回来。

修完，用一句话写下："我是怎么找到问题的。" ——这句话，比修好本身更值钱。

## 📦 复制带走

<div class="aim-card"><strong>📦 复制带走</strong><br>① 坏是常态，不是你的错；<strong>会修的人 ≠ 不出 bug 的人</strong>。<br>② Debug 五步：<strong>描述 → 找线索 → 先猜怀疑点 → 改一处就验证 → 不行再带信息问</strong>。<br>③ 丢给 AI 前先猜一个怀疑点——这是"学会"和"喊话"的分界。<br>④ AI 的修复你要<strong>亲自验证</strong>；你才是项目负责人。</div>

「揭盖周」到此结束。你现在不只是"能用 AI 做出东西"，更是"东西坏了能自己救回来"——这正是"独立"两个字的底气。

下一周，我们进入最让人兴奋的部分：给你的作品，接上一个真正的 AI 大脑，让它自己会思考、会说话。下一讲，**第 07 讲**见。
