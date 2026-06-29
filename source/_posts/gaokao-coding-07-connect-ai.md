---
title: "《写给高考生的编程第一课》第07讲 · 给作品接上一个真的 AI（踩不到坑的那条路）"
date: 2026-07-01 14:00:00
tags: [AI, 编程入门, 零基础, 高考, vibe coding, API, 课程]
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

<div class="gkc-key-note"><strong>第三站「通电」开始。</strong>前两站你的作品是"死"的——一张纯前端的页面。这一讲，我们给它接上一个真正的 AI。这是全课技术含量最高的一讲，所以我给你铺一条<strong>踩不到坑的水泥路</strong>：用现成模板，key 填在平台后台，<strong>全程不碰本地服务器、不碰原始计费</strong>。重活交给模板和 AI，你只要看懂"东西怎么流动"。</div>

## 🎯 这一讲你会做出什么 <span class="gkc-b gkc-core">必读</span>

一个能输入问题、由真 AI 回答的对话框，**跑起来、能用**了。你的作品，第一次"活"了。

<div class="gkc-note"><strong>关于"部署"和"上线"，先说清楚，免得后面你犯迷糊：</strong>这一讲为了让 key 待在安全的后端，会把作品<strong>放到一个平台上</strong>（这个动作就叫"<strong>部署</strong>"），所以你很可能这一讲结束时就<strong>顺手拿到了一个能打开的网址</strong>。这很棒，等于提前尝到了甜头。但"上线 / 部署"这件事到底是怎么回事、怎么做才稳，我们留到<strong>第 10 讲</strong>正式讲透（那一讲也会帮没接 AI 的纯网页作品上线）。这一讲你只管把 AI <strong>接通、能对话</strong>就算过关。</div>

## 先认识两个词：API 和 key <span class="gkc-b gkc-core">必读</span>

- **API**：你的程序"打电话"给另一个服务（这里是 AI），问个问题、拿回答案的方式。你不用懂它内部，只要知道：通过 API，你的网页能"叫"一个真模型来帮它干活。
- **key（密钥）**：你用这个服务的"通行证 + 账单"。它证明"是你在用"，用了要花钱（很便宜）。所以——**key 必须保密**。

打个比方：API 像餐厅的点餐窗口；key 像你的会员卡，一刷就扣你的钱，不能给别人。

<div class="gkc-note"><strong>这两个词，记下来。</strong>"调 API""填 key"是你以后做任何带 AI 的东西都绕不开的两件事，上大学做项目、找实习也天天用。今天第一次接触，慢慢来。</div>

## 一条铁律：key 绝不能写进网页 <span class="gkc-b gkc-core">必读</span>

<div class="gkc-key-note">网页（前端）的源码，<strong>所有人都能看到</strong>。如果你把 key 写进网页，等于把会员卡密码贴在店门口。所以 key 必须放在<strong>后端</strong>（用户看不见的那层）。这就是为什么我们需要一个"后端"——但别担心，下面这条水泥路，连后端都不用你亲手搭。key 的安全，第 11 讲还会细讲。</div>

## 它是怎么流动的 <span class="gkc-b gkc-key">重点</span>

```
你在页面打字 → 前端发给后端 → 后端拿着 key 去调 AI → AI 返回答案 → 后端转回前端 → 显示
```

第 05 讲那张"前端 / 后端"的图，这就用上了。

## 跟我做：走"现成模板"这条水泥路 <span class="gkc-b gkc-core">必读</span>

**别从零搭后端。** 自己拿 key、本地跑服务器、配环境——那是新手成批掉队的悬崖。我们直接绕开，走现成模板：

**第 1 步 · 拿一个 key。** 挑一个 **provider**（就是给你提供 AI 的那家公司，AI 服务商），在它的"API / 开发者"页面创建 key：

- **国内可直连**：通义千问、豆包、DeepSeek、智谱 等——通常给新用户一些免费额度，适合先用着。
- **海外**：OpenAI、Anthropic（Claude）等——免费政策经常变，可能一上来就要绑卡，介意就先用国内的。

**第 2 步 · 让 AI 帮你找一个现成模板，一键部署。** 套这段：

```
我是新手，想要一个最简单的"网页 + 一个能调用 AI 的后端"的现成模板，
能一键部署到托管平台（如 Vercel / Cloudflare），
然后我只要在平台后台填上我的 key 就能用。
请一步步教我，全程别让我在本地电脑上跑服务器。
我用 [你选的 provider] 的模型。
```

**第 3 步 · 在平台后台填 key。** 部署时，平台会有个"**环境变量（Environment Variables）**"的地方，把 key 填进去 → 部署完成 → 打开它给你的网址，对话框就能用了。

<div class="gkc-note"><strong>"环境变量"是个啥？</strong>你可以把它理解成<strong>平台帮你偷偷保管的小保险箱</strong>：你的代码能从里面取出 key 来用，但访客打开网页怎么翻都看不到它。这就是为什么 key 填这儿才安全——它没跟代码混在一起。</div>

<div class="gkc-note"><strong>这一步可能要先注册账号。</strong>"一键部署到平台"，现实里第一次通常要：注册一个平台账号（很多用 GitHub 账号登录，所以可能还要先注册个 GitHub）→ 把模板导入你的账号 → 点部署。听着步骤多，但每一步平台都有引导，照着点就行；卡住就把你看到的画面截图描述给 AI，让它带你过。<strong>别因为名词多就怕——这是这门课最硬的一关，过了就海阔天空。</strong>用"现成模板 + 同平台部署"，你还能绕开本地环境、跨域（CORS）这些经典坑。</div>

## 会花钱吗？（先把这点说透） <span class="gkc-b gkc-core">必读</span>

会，但很少，而且可控。免费额度通常够你玩很久。**务必做一件事**：去 provider 后台设一个"**花费上限 / 预算告警**"，这样绝不会意外超支，心里就踏实了。整门课这部分，大概也就几块到几十块。

<div class="gkc-note"><strong>提醒：</strong>你现在还没有自己的收入，花钱前最好跟爸妈说一声，或者用支持的最小额度。真不想花，就让 AI 给你"纯免费额度"的方案——一样能跑通。</div>

## 🔮 先猜后做

打开你的对话框、问第一句之前，先猜：我打的这句话，会经过哪几步，才变成屏幕上的回答？（拿上面那条流动链默一遍。）跑通后对照，你对"前端 → 后端 → AI"就彻底有了体感。

## 🔧 翻车现场：就算铺了水泥路，也可能卡 <span class="gkc-b gkc-key">重点</span>

- **key 填错 / 没填 / 额度没开** → 报错。把报错原样（**别把 key 也贴出去**）交给 AI，走第 06 讲那套 debug。
- **连不上某个海外服务** → 换成国内 provider 的模板，整套流程一样。

<div class="gkc-why">这一讲卡住，太正常了。但你现在不是赤手空拳——你刚学完那一整讲 debug，正好拿这一关来练手。卡很久也别硬扛：把全部上下文（做了哪几步、报了什么错）一股脑给 AI，让它带你过。这一关闯过去，你就跨过了新手和"能做真东西"之间最高的那道坎。</div>

<details class="gkc-fold">
<summary>进阶：我就是想自己在本地搭后端，行吗？<span class="gkc-b gkc-skim">细究 · 可跳读</span></summary>

当然行，等你更熟了非常推荐。那条路你会接触到本地服务器、`.env` 文件、跨域设置——能学到更多，但坑也更多。这门课为了让你先尝到甜头，故意走了现成模板这条平路。想挑战自己，就让 AI 带你走一遍本地版，把它当成第 06 讲 debug 能力的实战考试。

</details>

## ✅ 自检三问

- **它在干嘛**：API 和 key 分别是什么？（打电话的方式 / 保密的通行证 + 账单）
- **它对吗**：你的 key 现在放在哪？（平台后台的环境变量里，绝不在网页中）
- **坏了怎么办**：对话框报错，你第一步做什么？（把报错——去掉 key——交给 AI，走 debug）

## 🚀 留个挑战

先让对话框跑通**最朴素**的版本：问啥答啥就行。别急着追求好看或人设——下一讲我们专门给它"灵魂"。先把"能答话"这件事，稳稳拿下。

## 📦 复制带走

<div class="gkc-card"><strong>📦 复制带走</strong><br>① <strong>API</strong>=叫别的服务干活的方式；<strong>key</strong>=保密的通行证 + 账单。<br>② 铁律：<strong>key 只待后端（平台环境变量），绝不进网页</strong>。<br>③ 走<strong>现成模板</strong>，不碰本地服务器和原始计费，绕开掉队悬崖。<br>④ 先设"花费上限"；卡住就用第 06 讲那套 debug。</div>

它现在能答话了，但答得像个没有灵魂的客服。下一讲 **第 08 讲**，我们给它一个"人设"——让它变成**你的数字分身**，用你的口吻、跟新同学聊你的事。
