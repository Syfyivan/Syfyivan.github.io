---
title: "《写给高考生的编程第一课》第10讲 · 一键上线：把作品变成谁都能点开的网址"
date: 2026-07-02 14:00:00
tags: [AI, 编程入门, 零基础, 高考, vibe coding, 部署, 上线, 课程]
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

<div class="gkc-key-note"><strong>最后一站「交付」开始，这是全课最高光的一讲。</strong>今天，你的作品从"只能在我电脑上跑"，变成"发个链接，全世界都能点开"。等开学把这个链接甩进新生群、发给室友的那一刻，就是你这个暑假的毕业典礼。</div>

## 🎯 这一讲你会做出什么 <span class="gkc-b gkc-core">必读</span>

一个**公开网址**。任何人、在任何设备上，点开就是你的作品。

## "上线"到底是把什么、放到哪 <span class="gkc-b gkc-core">必读</span>

你的作品现在住在你电脑里——电脑一关，或者别人不在你身边，就访问不了。

**上线（部署）= 把作品放到一台"永远开着、永远连着网"的电脑（服务器）上，并给它一个网址。** 从此它 7×24 在线，谁都能访问。

打个比方：之前你的作品，是画在自己笔记本上的一幅画；上线，就是把它挂到一面所有人都会路过的画廊墙上。

## 跟我做：挑个平台，让 AI 带你上线 <span class="gkc-b gkc-core">必读</span>

重活照样交给 AI 加平台。新手友好的平台有：**GitHub Pages、Netlify、Vercel** 等，基本都有免费额度。

分两种情况：

- **路线一 · 只有网页（没接 AI 后端）**：最简单。很多平台支持"把文件夹拖上去"或"连上代码就自动上线"。
- **路线二 · 带第 07 讲那个 AI 对话后端**：要选支持"后端 / 函数"的平台（如 Vercel、Netlify、Render 等），稍复杂，但 AI 能一步步带你走。

让 AI 带路：

```
我想把这个项目部署上线、拿到一个公开网址。我是新手，请一步步教我。
我用的是 Windows（或 Mac），我的项目里 [有 / 没有] 一个调用 AI 的后端。
```

## 一条红线继续生效：key 放平台的"环境变量" <span class="gkc-b gkc-key">重点</span>

还记得第 07 讲那条铁律吗？上线时它继续生效：

<div class="gkc-key-note">你的 key <strong>绝不能跟着代码一起传上去</strong>（代码可能被人看到）。正确做法：平台的设置里有个叫"<strong>环境变量（Environment Variables）</strong>"的地方，把 key 填在那儿。平台会偷偷把它喂给你的后端，但谁都看不到。这就是"key 只待后端"的线上版。</div>

## 🔮 先猜后做

点"部署"之前，先猜：有没有哪一步，可能本地好好的、线上却会出问题？（提示：想想 key。）上线后对照，你对"环境差异"会有第一手的体感。

## 🔧 翻车现场："我电脑上明明能跑啊！" <span class="gkc-b gkc-key">重点</span>

这是全宇宙最经典的上线 bug：本地一切正常，一上线就崩。两个最常见的原因：

- **key 忘了在平台上配环境变量** → 后端拿不到 key，AI 功能挂掉。
- **一些路径 / 设置，本地和线上不一样。**

<div class="gkc-why">别慌，这太常见了，常见到几乎人人都会撞一次。处理方式还是第 06 讲那套 debug：看平台给的报错 / 日志（线索就在那里）→ 先猜（八成是 key 没配）→ 改一处 → 重新部署验证。能淡定处理"本地能跑、线上不行"，你就真正拥有了"上线"这门本事——它比做出来更接近"交付"。</div>

## ✅ 自检三问

- **它在干嘛**："上线"是把作品放到哪、为了什么？
- **它对吗**：你拿到公开网址了吗？用手机（关掉 WiFi、用流量）打开试过吗？
- **坏了怎么办**：线上 AI 功能挂了，你第一个怀疑什么？（key 没在平台配环境变量）

## 🚀 留个挑战（就是高光本身）

拿到你的公开链接，用手机打开，然后——**发给一个人**。你的爸妈、你最好的死党，谁都行。

看着"这是我做的"这句话，第一次，有了凭证。等开学，它就是你和新同学之间，最特别的一句"你好"。

## 📦 复制带走

<div class="gkc-card"><strong>📦 复制带走</strong><br>① 上线 = 把作品放到永远开着的电脑 + 给个网址。<br>② key 放平台的<strong>"环境变量"</strong>，绝不跟代码一起上传。<br>③ <strong>"本地能跑、线上不行"</strong>是头号经典坑，用 debug 流程，先查 key / 环境。<br>④ 拿到链接，一定亲手用手机打开、发给一个人。</div>

你上线了。这已经超过了绝大多数"想试试编程"的人能走到的地方。但还有最后一件大事——你越来越会**用** AI 了，可你会**判断** AI 吗？下一讲 **第 11 讲**，我们聊聊：AI 什么时候会骗你，你什么时候千万别全信。
