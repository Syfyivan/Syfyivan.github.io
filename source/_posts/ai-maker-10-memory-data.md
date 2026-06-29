---
title: "《AI 造物入门》第10讲 · 让它记住事、会翻资料（给作品一点记忆）"
date: 2026-06-29 19:00:00
tags: [AI, 编程入门, 零基础, vibe coding, 数据, RAG, 课程]
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

<div class="aim-key-note"><strong>这一讲是本周的"选学进阶"。</strong>做完前两讲，你的作品已经能跑、有灵魂了。这一讲再往上走一步：给它一点"记忆"。难度比前面高，<strong>做不完也完全不影响整门课毕业</strong>——先看懂思路，就已经赚了。</div>

## 🎯 这一讲你会做出什么 <span class="aim-b aim-core">必读</span>

给你的作品，多一个"会记事"或"会翻你资料"的能力（二选一，挑你想要的那个）。

## 两种"记忆"，挑一个玩 <span class="aim-b aim-core">必读</span>

第 05 讲说过：能"记住"，靠的是**数据**。给作品加记忆，有两条常见的路：

<div class="aim-card"><strong>给作品记忆，两条路</strong><br><strong>路 A · 记住输入</strong>：访客留句话，它存下来，刷新后还在（留言板）。<br><strong>路 B · 会翻资料</strong>：你给它一份"关于我"的资料，它回答时去翻这份资料，而不是全塞进人设。</div>

两条都行，挑你更想要的那个做。

## 路 A：让它记住事（留言板） <span class="aim-b aim-key">重点</span>

思路：访客填的内容，要"存"到某个地方，刷新还在。

最简单的版本，是存在浏览器本地（关掉再打开还在，但只在这台设备上）。再往上，才是存到后端 / 数据库——那是更大的话题，这里不深入。

交给 AI：

```
给我的主页加一个留言板：访客能留言，留言要保存下来，刷新后还在。
先用最简单的本地保存方式（localStorage），给我完整代码和中文注释。
```

这，就把第 05 讲那个"刷新就没了"的坑，正式补上了。

## 路 B：让分身会翻资料（轻量 RAG 直觉） <span class="aim-b aim-key">重点</span>

思路：别把你所有信息都硬塞进人设（那样又长又难维护）。换个做法——把"关于我"的资料单独存一份，分身回答前，先去这份资料里找相关的，再据此回答。

这就是大名鼎鼎的 **RAG** 最朴素的直觉：不是让 AI 背下一切，而是让它"需要时去翻参考资料"。

<div class="aim-note"><strong>类比：开卷考试。</strong>分身不用记住所有事，但桌上摆着你给的"小抄"，随用随翻。资料更新了，它的回答也跟着更新——比改人设方便多了。</div>

交给 AI：

```
我有一份关于我的资料（贴在下面）。改造我的数字分身：回答前先从这份资料里
找相关内容，再据此回答；资料里没有的，就说不知道。
【粘贴你的资料】
```

## 🔮 先猜后做

做路 A：留言、刷新之前，先猜——这次还会不会没？
做路 B：问一个"只有资料里才有"的问题，先猜它答不答得上。
然后对照结果。

## 🔧 翻车现场：存了却没存对 / 资料没被翻到 <span class="aim-b aim-key">重点</span>

- **路 A**：以为存了，刷新还是没 → 多半是"存"那一步没真正生效。用 debug 五步，把现象交给 AI。
- **路 B**：它还是按老人设答、没翻资料，或资料太长抓不到重点 → 把资料缩短，并强调"必须只根据这份资料回答"。

<div class="aim-why">这两种坑都在提醒你：<strong>"记住"和"翻资料"，都是要专门做对的事，不会自动发生。</strong>而你现在能分辨问题出在"没存上"还是"没翻到"——这正是第 05 讲那张地图、第 06、07 讲那套 debug，给你的底气。</div>

## ✅ 自检三问

- **它在干嘛**：给作品加记忆的两条路，各是什么？
- **它对吗**：你做的那条，真的"记住"或"翻到"了吗？（亲手验证一次）
- **坏了怎么办**：留言刷新就没，你会先怀疑哪一步？（"存"的那一步）

## 🚀 留个挑战（选做）

二选一做出来，并亲手验证它真的记住了 / 翻到了。

做不动也别有压力——把**思路**记住就行：记忆 = 数据，要么存输入，要么翻资料。这个直觉，比代码本身重要得多。

## 📦 复制带走

<div class="aim-card"><strong>📦 复制带走</strong><br>① 记忆靠数据；两条路：<strong>记住输入（留言板）/ 翻你的资料（RAG 直觉）</strong>。<br>② RAG 直觉 = <strong>开卷考</strong>：不背一切，需要时翻参考。<br>③ 记住 / 翻资料都要专门做对，不会自动发生。<br>④ 这讲选学：做不完不影响毕业，思路记住就赚了。</div>

第 3 周收工！你的作品现在能对话、有灵魂、（也许）还有记忆。但它还只活在你自己的电脑上。下一周，我们做最爽的一件事——**把它送上线，变成一个谁都能点开的网址**。下一讲 **第 11 讲**，见证高光时刻。
