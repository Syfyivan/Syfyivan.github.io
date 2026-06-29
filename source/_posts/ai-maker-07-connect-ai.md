---
title: "《AI 造物入门》第07讲 · 给作品接上一个真的 AI"
date: 2026-06-29 17:00:00
tags: [AI, 编程入门, 零基础, vibe coding, API, 课程]
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

<div class="aim-key-note"><strong>第 3 周「通电周」开始。</strong>前两周你的作品是"死"的——一张纯前端的页面。这一讲，我们给它接上一个真正的 AI：页面上多一个对话框，背后是真模型。这是全课技术含量最高的一讲，所以更要记住那句话：<strong>重活让 AI 干，你只要搞懂"东西是怎么流动的"。</strong></div>

## 🎯 这一讲你会做出什么 <span class="aim-b aim-core">必读</span>

你的页面上，一个能输入问题、由真 AI 回答的小对话框。你的作品，第一次"活"了。

## 先认识两个词：API 和 key <span class="aim-b aim-core">必读</span>

- **API**：你的程序"打电话"给另一个服务（这里是 AI），问个问题、拿回答案的方式。你不用懂它内部，只要知道：通过 API，你的网页能"叫"一个真模型来帮它干活。
- **key（密钥）**：你用这个服务的"通行证 + 账单"。它证明"是你在用"，而且用了要花钱（很便宜，但要花）。所以——**key 必须保密**。

打个比方：API 像餐厅的点餐窗口（你递需求、拿回菜）；key 像你的会员卡（一刷就扣你的钱，不能给别人）。

## 一条铁律：key 绝不能写进网页 <span class="aim-b aim-core">必读</span>

还记得第 05 讲的前端 / 后端吗？现在它救场了：

<div class="aim-key-note">网页（前端）的源码，<strong>所有人都能看到</strong>。如果你把 key 写进网页，等于把会员卡密码贴在店门口——分分钟被人拿去刷爆你的账单。所以 key 必须放在<strong>后端</strong>（用户看不见的那层）。这，就是为什么这一讲我们必须搭一个"小后端"。</div>

key 的安全第 11 讲还会细讲。现在只记一句话：**key 不进前端，只待后端。**

## 东西是怎么流动的 <span class="aim-b aim-key">重点</span>

一句话看懂整条链路：

```
你在页面打字
  → 前端把问题发给你的小后端
    → 后端拿着 key 去调 AI 的 API
      → AI 返回答案
    → 后端把答案转回前端
  → 显示在页面上
```

你看，第 05 讲那张"前端 / 后端"的图，这就用上了：前端负责"看得见的对话框"，后端负责"拿着 key 偷偷去问 AI"。

## 跟我做：让 AI 帮你把这套搭起来 <span class="aim-b aim-core">必读</span>

重活全交给 AI，你只管三步：

**第 1 步 · 拿一个 key。** 挑一个 provider 注册，在它的"API/开发者"页面创建一个 key（通常都有免费额度，先用免费的）：

- **海外**：OpenAI、Anthropic（Claude）等。
- **国内可直连**：通义千问、豆包、DeepSeek、智谱 等。

**第 2 步 · 把活儿描述给你的 AI 编辑器**（第 04 讲装的那个）。直接套这段：

```
我是新手。帮我做一个最简单的网页 + 一个小后端：
页面上有一个输入框和发送按钮，我输入一句话，后端用我的 key
去调用 [你选的 provider] 的聊天模型，把回答显示在页面上。
要求：
① key 放在单独的配置文件里（比如 .env），绝不写进网页；
② 一步步告诉我怎么运行，我是新手；
③ 代码里加中文注释。
我用的是 Windows（或 Mac）。
```

**第 3 步 · 照它给的步骤**，把 key 填进那个配置文件，本地跑起来，在对话框里问一句，看 AI 答你。

成了的话——**恭喜，你的作品通电了。**

## 🔮 先猜后做

运行之前先猜：我打一句话进去，会经过哪几步？（拿上面那条流动链，自己默一遍。）跑通后对照，你会对"前端 → 后端 → AI"这条路，彻底有了体感。

## 🔧 翻车现场：这一讲最容易卡，这很正常 <span class="aim-b aim-key">重点</span>

这是全课最技术的一讲，卡住非常非常正常。常见的几种：

- **key 填错 / 没填** → 报错。把报错原样（注意：**别把 key 也贴出来**）交给 AI，用第 06 讲的五步修。
- **余额 / 权限问题** → 看 provider 的提示，通常要实名或先领一下免费额度。
- **连不上某个海外服务** → 换成国内 provider 的方案，整套流程一模一样。

<div class="aim-why">别因为卡住就怀疑自己——很多老手第一次接 API 也要折腾半天。你现在手里有 debug 五步，正好拿它来闯这一关。卡很久也别硬扛：把<strong>全部上下文</strong>（你做了哪几步、报了什么错）一股脑给 AI，让它带你一步步过。这一关闯过去，你就跨过了新手和"能做点真东西"之间最高的那道坎。</div>

## ✅ 自检三问

- **它在干嘛**：API 和 key 分别是什么？（打电话的方式 / 保密的通行证 + 账单）
- **它对吗**：你的 key 现在放在哪？（后端的配置文件里，绝不在网页中）
- **坏了怎么办**：接口报错，你第一步做什么？（把报错——去掉 key——交给 AI，走 debug 五步）

## 🚀 留个挑战

先让对话框跑通**最朴素**的版本：问啥答啥就行。别急着追求好看或人设——下一讲我们专门给它"灵魂"。先把"能答话"这件事，稳稳拿下。

## 📦 复制带走

<div class="aim-card"><strong>📦 复制带走</strong><br>① <strong>API</strong>=你的程序叫别的服务干活的方式；<strong>key</strong>=保密的通行证 + 账单。<br>② 铁律：<strong>key 只待后端，绝不进网页</strong>。<br>③ 流动：打字 → 前端 → 后端（拿 key）→ AI → 后端 → 前端显示。<br>④ 这一讲最容易卡，卡住正常；用 debug 五步 + 把上下文全给 AI。</div>

它现在能答话了，但答得像个没有灵魂的客服。下一讲 **第 08 讲**，我们给它一个"人设"——让它变成**你的数字分身**，用你的口吻、聊你的事。
