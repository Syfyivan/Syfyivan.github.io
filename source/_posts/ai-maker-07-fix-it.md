---
title: "《AI 造物入门》第07讲 · 独立修好：一次改一处，改完就验证"
date: 2026-06-29 16:30:00
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

<div class="aim-key-note"><strong>debug 的下半场，也是整门课的灵魂。</strong>上一讲你学会了读懂报错；这一讲，我们把它修好——而且尽量<strong>你自己修，AI 只当帮手</strong>。能独立修好东西，你就跨过了"独立"那道线，也就有了序里那个"会不会变成废人"问题的答案。</div>

## 🎯 这一讲你会得到什么 <span class="aim-b aim-core">必读</span>

一套修 bug 的闭环流程，和一次"亲手把坏掉的页面修回来"的实战。从此卡住不慌——因为你手里有步骤，手上有肌肉记忆。

## 修好的闭环：五步走完一圈 <span class="aim-b aim-core">必读</span>

接着上一讲（读报错 = 找线索），完整的一圈是这样：

<div class="aim-card"><strong>Debug 闭环</strong><br><strong>① 描述</strong>：它本该怎样？现在实际怎样？<br><strong>② 找线索 + 先猜</strong>：读报错（上一讲），并猜一个怀疑点。<br><strong>③ 改一处</strong>：一次只改一个地方。<br><strong>④ 就验证</strong>：改完立刻回去刷新，亲眼看好没好。<br><strong>⑤ 没好就再来</strong>：把"试了什么、结果怎样"带上，再走一圈。</div>

## 为什么"一次只改一处" <span class="aim-b aim-key">重点</span>

<div class="aim-why">新手最容易犯的错，是一着急、一口气改五个地方。结果呢？好了，你不知道是哪处起的作用；又坏了，你也不知道是哪处惹的祸——下次照样懵。<strong>改一处、验一次</strong>，看起来慢，其实最快：每一次你都在亲眼确认"这个改动 → 这个结果"，因果直觉就是这么一次次长出来的。</div>

## 关键一步：这次你先修，AI 后确认 <span class="aim-b aim-core">必读</span>

到这里，我要请你做一件以前没做过的事。

前面几讲，遇到问题你都是直接喊 AI。从今天起，加一道"断奶"动作：

<div class="aim-key-note"><strong>遇到 bug，先别急着喊 AI。</strong>根据你猜的怀疑点，<strong>自己先动手改一处</strong>试试，刷新看看。真不行，再把"我猜是这里、我改了什么、结果怎样"一起交给 AI。AI 就从"主刀医生"，退成了你的"陪练"。</div>

<div class="aim-why">这一步，就是你从"叫人来修"变成"自己会修"的唯一通道。哪怕你先改的那一下是错的，也没关系——你的脑子已经转了一圈，这一圈，AI 替不了你。这门课所有"防止你变成只会喊话的人"的设计，都汇聚在这一个动作上。</div>

## 现场实战：亲手弄坏，再亲手修好 <span class="aim-b aim-core">必读</span>

来真的。

**第 1 步 · 弄坏它。** 在编辑器里，自己删掉一个 `</div>`、或一个 `"`，保存、刷新——看页面乱成什么样。

**第 2 步 · 走闭环修回来。** 描述现象 → 读报错、猜怀疑点 → **自己先改那一处** → 刷新验证 → 不行再带着信息问 AI。

修好的那一刻，记住这种感觉：**你没有靠运气，你是靠一套方法，把它修回来的。** 这套方法，就是你今天真正带走的东西。

## 🔧 翻车现场：AI 的第一次修复，也可能是错的

一个必须知道的真相：你把 bug 交给 AI，**它给的第一个修复，不一定对**。它可能改错地方，也可能"修好了 A，又顺手弄坏了 B"。

<div class="aim-why">这很正常，别慌。你的角色是<strong>验证者</strong>：AI 改完，你一定要回去刷新、亲眼确认真的好了；没好，就把新情况告诉它，再来一轮。AI 是超级能干的助手，但它不是神——能"自己验证它修没修对"的你，才是这个项目真正的负责人。怎么判断 AI 靠不靠谱，第 12 讲会专门展开。</div>

## ✅ 自检三问

- **它在干嘛**：修好的闭环，第 ③④ 步是什么？（改一处、就验证）
- **它对吗**：这一讲新加的"断奶"动作是什么？（先自己改一处，再叫 AI）
- **坏了怎么办**：AI 修了一次还没好，你会怎么做？（带着"试过什么、结果怎样"再问，且一次只改一处）

## 🚀 留个挑战

把你的主页弄坏**三种**不同的样子，每一种都**自己先修**——实在卡住了再叫 AI。修完，用一句话写下："我是怎么找到问题的。"

这句话，比修好本身更值钱。

## 📦 复制带走

<div class="aim-card"><strong>📦 复制带走</strong><br>① 修好闭环：<strong>描述 → 找线索+先猜 → 改一处 → 就验证 → 没好再来</strong>。<br>② <strong>一次只改一处</strong>，因果直觉才长得出来。<br>③ 断奶动作：<strong>先自己改一处，再叫 AI</strong>——这是"会修"和"喊话"的分界。<br>④ AI 的修复你要<strong>亲自验证</strong>；你才是项目负责人。</div>

「揭盖周」到此结束。你现在不只是"能用 AI 做出东西"，更是"东西坏了能自己救回来"——这正是"独立"两个字的底气。下一周，我们做最让人兴奋的事：给你的作品，接上一个真正的 AI 大脑。**第 08 讲**见。
