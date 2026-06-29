---
title: "《写给高考生的编程第一课》第04讲 · 把作品搬出聊天框：文件、编辑器、你的第一个工作台"
date: 2026-06-30 14:00:00
tags: [AI, 编程入门, 零基础, 高考, vibe coding, 编辑器, 文件, 课程]
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

<div class="gkc-key-note"><strong>这是第二站「揭盖」的开头。</strong>前三讲，你都在聊天框里造东西。这一讲，我们把作品搬到你自己的电脑上，放进一个真正的"工作台"。不难，就是换个更顺手的地方干活，顺便搞清楚：你做的东西，到底存在哪。</div>

## 🎯 这一讲你会做出什么 <span class="gkc-b gkc-core">必读</span>

你的主页，从"聊天框里的临时产物"，变成"你电脑里一个能随时打开、随时改的文件"，住进一个属于它的文件夹。从此它是你的，不会因为关掉网页就消失。

## 先搞懂一件事：网页就是一个文件 <span class="gkc-b gkc-core">必读</span>

还记得第 01 讲你存的那个 `index.html` 吗？它就是一个**文件**。

一个网页 = 一个（或几个）文本文件，浏览器负责把它"演"出来给你看。文件有名字，也有类型——`.html` 是网页、`.txt` 是纯文本、`.jpg` 是图片。**类型（那个点后面的后缀）告诉电脑：该拿这个文件怎么办。**

打个比方：文件就像一张纸，文件夹就像装纸的袋子，而一个"项目"，就是装着一摞相关纸张的那个袋子。

## 给你的作品一个家：项目文件夹

动手：新建一个文件夹，名字叫 `my-page`，把你的 `index.html` 放进去。

这就是你的第一个"项目"。以后这个作品的所有东西——更多页面、图片、素材——都放进这个文件夹。一个作品，一个文件夹，干干净净。

<div class="gkc-note"><strong>顺手养个好习惯：</strong>文件夹和文件名用英文、别带空格（用 <code>my-page</code> 不用 <code>我的 主页</code>）。这不是规矩洁癖——上大学后你会发现，很多工具碰到中文名和空格会闹脾气，现在养成习惯，以后少踩坑。</div>

## 换个更顺手的工具：编辑器 <span class="gkc-b gkc-core">必读</span>

记事本也能写网页，但它太简陋了。**"编辑器"就是更聪明的记事本**：它给代码上色、帮你对齐、当场揪出你手滑打错的地方，很多还内置了 AI。

装一个就行。装哪个不那么重要，重要的是有一个：

- **VS Code**：免费、通用、最多人用，新手友好。大学里、公司里也都是它，早点熟悉不亏。
- **Cursor** 这类 AI 原生编辑器：把 AI 直接装进了编辑器里，想深度用 AI 可以试。

<details class="gkc-fold">
<summary>怎么装、装好怎么打开项目<span class="gkc-b gkc-skim">可跳读</span></summary>

以 VS Code 为例：去官网下载，一路"下一步"装好。打开它，选 `文件 → 打开文件夹`，选你刚建的 `my-page`。左边会列出文件夹里的文件，点 `index.html`，右边就是你的代码了。

不确定装哪个、怎么操作？直接问 AI："我是新手，想装一个写网页的编辑器，请一步步教我在 Windows（或 Mac）上装好并打开一个文件夹。"

</details>

## 编辑器 vs 浏览器：一个改，一个看 <span class="gkc-b gkc-key">重点</span>

这是最容易绕晕的一点，记牢它：

<div class="gkc-card"><strong>两个窗口，各管一头</strong><br><strong>编辑器</strong>：你<strong>改</strong>代码的地方（后台操作间）<br><strong>浏览器</strong>：你<strong>看</strong>成品的地方（台前展示台）</div>

完整流程就一句话：**在编辑器里改 → 保存 → 回浏览器刷新 → 看效果。** 改、存、刷——这就是你这一站的新循环，会用很久很久。

## 🔮 先猜后做

在编辑器里打开 `index.html` 之前，先猜一下：我会看到什么？是网页本身，还是花花绿绿的一堆代码？

打开看，对照你猜的。（答案：编辑器里看到的是带颜色的**代码**；想看到网页长什么样，得用**浏览器**打开同一个文件。一个文件，两种看法。）

## 🔧 翻车现场：双击文件，却蹦出一堆代码

故意撞两个几乎人人会踩的坑：

- **双击 `index.html`，弹出来的是代码不是网页** → 因为它被默认用编辑器打开了。右键 → "打开方式" → 选你的浏览器（Chrome / Edge），就好了。
- **存的时候，文件变成了 `index.html.txt`** → 那它就不是网页了，打不开。把后缀改回 `.html` 即可（第 01 讲那个存档折叠里有正确姿势）。

<div class="gkc-note">这两个坑，几乎是每个新手的"成人礼"。踩了别懊恼——你正好借此彻底搞懂了"文件类型"和"用什么打开"这两件事，比看十遍讲解都管用。</div>

## ✅ 自检三问

- **它在干嘛**：编辑器和浏览器，分别是用来干嘛的？
- **它对吗**：你的 `index.html`，现在住进一个专门的文件夹了吗？
- **坏了怎么办**：双击网页文件结果看到一堆代码，你知道怎么办吗？

## 🚀 留个挑战

这次**不靠 AI 预览**：在编辑器里，自己找到你名字那一行，把它改成别的，保存，回浏览器刷新，看它变了没有。

你刚刚独立完成了一次完整的"改 → 存 → 刷"。这就是从今往后你改东西的基本动作。

## 📦 复制带走

<div class="gkc-card"><strong>📦 复制带走</strong><br>① 网页就是<strong>文件</strong>；文件住在<strong>文件夹（项目）</strong>里。<br>② <strong>编辑器=改的地方，浏览器=看的地方</strong>。<br>③ 这一站的新循环：<strong>改 → 存 → 刷</strong>。<br>④ 装一个编辑器（哪个都行，有就行）。</div>

你现在知道东西"存在哪"了。但它是怎么"跑起来"的？下一讲**第 05 讲**，我给你画一张你电脑里的"小宇宙地图"——前端、后端、数据，三个词搞懂，你就知道东西坏了该去哪找。
