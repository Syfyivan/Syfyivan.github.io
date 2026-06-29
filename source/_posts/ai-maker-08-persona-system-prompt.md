---
title: "《AI 造物入门》第08讲 · 给你的 AI 一个人设：做一个“你的数字分身”"
date: 2026-06-29 18:00:00
tags: [AI, 编程入门, 零基础, vibe coding, 提示词, 数字分身, 课程]
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

<div class="aim-key-note"><strong>上一讲，你的对话框能答话了，但谁问都一个样、没有灵魂。</strong>这一讲，我们用一段"人设"，把它调教成<strong>你的数字分身</strong>——用你的口吻，聊你的事。说穿了，就是把第 02 讲的"说"，这次用在 AI 自己身上。</div>

## 🎯 这一讲你会做出什么 <span class="aim-b aim-core">必读</span>

一个会用你的语气、回答关于你的问题的数字分身，挂在你的主页上。访客问"他平时喜欢干嘛"，它能像你一样答上来。

## system prompt：AI 的"出厂设定" <span class="aim-b aim-core">必读</span>

让 AI 有人设，靠的是一段叫 **system prompt** 的东西。

它是你给 AI 的一段"开场设定"，在每次对话的最最开头，悄悄告诉它：你是谁、该怎么说话、知道哪些事。访客看不到它，但它一直在背后起作用。

它和访客打的那句问题，是两回事：

<div class="aim-card"><strong>两种话，别搞混</strong><br><strong>system prompt（出厂设定）</strong>：你设一次，之后每次对话都生效。"你是小明的数字分身，用轻松口吻……"<br><strong>用户消息</strong>：访客当场打进来的那句问题。</div>

打个比方：system prompt 像演员拿到的"角色设定"，用户消息是现场观众的提问——无论谁问什么，演员始终按那个人设来回应。

## 三样东西，让分身像你 <span class="aim-b aim-core">必读</span>

<div class="aim-card"><strong>像你三件套</strong><br>① <strong>身份 + 口吻</strong>：你是谁的分身、用什么语气（轻松 / 正式 / 俏皮）<br>② <strong>事实</strong>：关于你的真实信息（它只会照你给的说）<br>③ <strong>边界</strong>：不知道的事，就老实说"这个他还没告诉我"，绝不瞎编</div>

把这段填好，交给你的 AI 编辑器，说"把它作为 system prompt 加到我上一讲那个对话后端里"：

```
你是【你的名字】的数字分身，用第一人称、轻松友好的口吻回答访客关于我的问题。
关于我：【几条真实信息：你在做什么、喜欢什么、最近在忙什么】
规矩：用我的口吻；回答简短亲切；如果被问到我没告诉你的事，
就说"这个他还没告诉我"，不要编。
```

## 🔮 先猜后做

加人设之前，先用同一个问题（比如"你平时喜欢干嘛？"）问一次**没人设**的版本，记住它有多平淡。加上人设再问一次。

先猜：会差多少？——对照之后，你会亲眼看到"一段设定"的威力。

## 这其实就是第 02 讲的"说" <span class="aim-b aim-key">重点</span>

<div class="aim-why">写 system prompt，和写一条好需求，是同一件事——背景、口吻、规矩、边界，你在第 02 讲早就练过了。区别只在于：好需求是"对一次任务说清楚"，人设是"对 AI 的角色，一次性说清楚、长期生效"。所以你会"说"，就会写人设。看，前面的能力，正在一个个串起来。</div>

## 🔧 翻车现场：人设太空，它就开始编 <span class="aim-b aim-key">重点</span>

- **人设只写"你是我的分身"，没给事实** → 访客一问具体的，它就一本正经地胡编（这叫"幻觉"）。治法：把真实事实喂给它，并加上"不知道就说不知道"。
- **口吻没说清** → 它还是一股官腔。治法：给它一个例句——"像这样说话：'嗨～我最近在捣鼓一个小网站，挺上头的'"。

<div class="aim-why"><strong>AI 不知道也会硬答，这是它的天性，不是它使坏。</strong>你给的事实和边界，就是给它套的缰绳。怎么防它一本正经地胡说，第 11 讲会专门讲——你现在先养成习惯：给人设，必给事实 + 给边界。</div>

## ✅ 自检三问

- **它在干嘛**：system prompt 和访客打的那句问题，有什么不同？（出厂设定 vs 当场提问）
- **它对吗**：你的人设里，有没有给真实事实 + "不知道怎么办"？
- **坏了怎么办**：分身开始一本正经编你的事，你该补什么？（补事实 + 补边界）

## 🚀 留个挑战

把你的数字分身，调到"朋友看了会说‘这还真有点像你’"的程度。多问它几个问题，哪儿不像就回去改人设——这又是一次"边说边改"。

## 📦 复制带走

<div class="aim-card"><strong>📦 复制带走</strong><br>① <strong>system prompt</strong> = AI 的出厂设定 / 人设，设一次、长期生效。<br>② 像你三件套：<strong>身份口吻 + 真实事实 + “不知道就说不知道”</strong>。<br>③ 写人设 = 第 02 讲的"说"，换个地方用。<br>④ 不给事实，它就会编；<strong>边界是缰绳</strong>。</div>

你的分身有灵魂了。但它现在只知道你"写死"在人设里的那点事。下一讲 **第 09 讲**（选学进阶），我们让它能"翻资料"、能"记住事"——给它一点真正的记忆。
