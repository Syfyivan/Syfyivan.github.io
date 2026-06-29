---
title: "《写给高考生的编程第一课》第11讲 · AI 会骗你：什么时候别全信它"
date: 2026-07-02 15:00:00
tags: [AI, 编程入门, 零基础, 高考, vibe coding, 判断力, 安全, 课程]
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

<div class="gkc-key-note"><strong>整门课我都在教你"用"AI。这一讲反过来——教你"判断"AI。</strong>这是从"会用 AI"升级到"会用 AI 的人"最关键的一步，也是序里那个"会不会被 AI 牵着走"问题的最终答案：<strong>能判断，你就永远是那个做主的人。</strong></div>

## AI 会一本正经地胡说 <span class="gkc-b gkc-core">必读</span>

最该刻进脑子的一件事：**AI 不知道的时候，也会用非常自信的口气，编一个答案出来。** 这叫"幻觉"。它不是故意骗你，但效果是一样的。

所以记住这个不等式：

<div class="gkc-key-note"><strong>自信 ≠ 正确。</strong>语气笃定的答案，完全可能是错的——尤其是具体的事实、数字、日期、链接、名字、引用。你不能因为"它说得很有把握"就信。越重要的事，越要自己验一下。</div>

<div class="gkc-note"><strong>这一点，对刚要上大学的你尤其重要。</strong>以后写论文、查资料、做课程作业，你一定会用 AI。但如果 AI 编的假参考文献、假数据被你原样交上去，那是要出大问题的。从现在就养成"信前先验"的习惯，会让你少踩很多坑。</div>

## 什么时候要格外警惕 <span class="gkc-b gkc-core">必读</span>

<div class="gkc-card"><strong>这些场景，多留个心眼</strong><br>① <strong>事实 / 数字 / 日期 / 链接</strong>（它最爱编这些）<br>② 你要<strong>公开发布</strong>、或拿去给别人看的东西<br>③ 碰<strong>钱、密码、删除数据</strong>的操作<br>④ 你<strong>完全看不懂</strong>、但它让你"照做就行"的命令</div>

## 三条安全红线 <span class="gkc-b gkc-core">必读</span>

- **① key / 密码**：不进代码、不发群、不贴进来路不明的网站（第 07、10 讲那条铁律的延伸）。
- **② 看不懂的命令**：AI 给的命令，尤其是"删除 / 清空 / 改系统"那种，看不懂**先别跑**，先问它"这条会做什么、有没有风险"。
- **③ 隐私机密**：别把别人的隐私、家里的敏感信息，随手喂给 AI。

## "这代码、这图，我能用吗？" <span class="gkc-b gkc-key">重点</span>

版权和来源，也值得多问一句。AI 生成的东西，大多数个人小项目用没问题，但——要拿去**商用**、或它可能"借鉴"了有版权的素材时，心里要有这根弦。

不确定就直接问 AI："这个用在【某场景】，有没有版权风险？"养成"问一句"的习惯就够了。

## 怎么低成本地验证 <span class="gkc-b gkc-key">重点</span>

<div class="gkc-why">你不需要每件事都查，但要养成"对重要的事，顺手验一下"的反射：<strong>让它给出处</strong>（"这个结论的依据是什么？"）、<strong>让它自己复核</strong>（"你确定吗？再核对一遍"）、<strong>交叉问</strong>（换个问法再问，看答案一不一致）、<strong>亲自验</strong>（代码就跑一下，事实就搜一下）。就这一下小小的验证，就是你和"AI 说啥信啥"的人之间，最大的区别。</div>

## 周末裸考：关掉 AI，自己走一遍 <span class="gkc-b gkc-key">重点</span>

这门课快结束了，最后给你一个检验"独立"的动作——

<div class="gkc-key-note"><strong>造物者习惯 · 周末裸考</strong><br>找个时间，<strong>不开 AI</strong>，自己做一件小事：在代码里改一处文字、读懂某一段在干嘛、复述一遍"上线要注意什么"。<br>卡住的地方，就是你还依赖 AI 的地方——记下来，下次专门补上。</div>

裸考不是为了为难你，是为了让你看清：哪些本事已经真的长在你身上了。能独立走过的部分，越来越多，你就越来越"独立"。

## 🔧 翻车现场：让它自信地编一个给你看 <span class="gkc-b gkc-key">重点</span>

故意试一次：问 AI 一个非常具体、冷门的问题——你高中母校某位老师的全名、某本小众书某一页讲了什么、某个只有你清楚的细节。看它是不是一脸笃定地、编了一个。

<div class="gkc-why">亲眼见它"自信地错一次"，比我说十遍都管用。从此你心里有了那根弦：<strong>笃定的语气，不等于事实。</strong>这根弦，会保护你一辈子——不只在写代码时，在你以后用 AI 做任何事的时候。</div>

## ✅ 自检三问

- **它在干嘛**：AI 最爱在什么东西上"自信地编"？（事实 / 数字 / 链接等）
- **它对吗**：你最近一次信 AI，验证过吗？如果该验，你会怎么验？
- **坏了怎么办**：它给你一条看不懂的"删除"命令，你会怎么做？（先别跑，问清楚它会干嘛）

## 🚀 留个挑战（本讲产出）

写下你自己的 **"AI 协作避坑清单"**：3–5 条你以后要提醒自己的话（比如"涉及数字先核对""key 不进代码""看不懂的命令先问清楚"）。

贴在你看得见的地方。这份清单，是你这门课带走的"护身符"，上大学也带着。

## 📦 复制带走

<div class="gkc-card"><strong>📦 复制带走</strong><br>① AI <strong>自信 ≠ 正确</strong>；它不知道也会编（幻觉）。<br>② 越重要越要验：事实 / 数字 / 链接、要公开的、碰钱碰密码的。<br>③ 红线：key 密码不外泄、看不懂的命令先问、别喂隐私机密。<br>④ <strong>会判断 AI ＞ 会用 AI</strong>——这才是你不被取代的地方。</div>

你不仅会用 AI 造东西，现在还会判断它、给它把关。最后一讲 **第 12 讲**，我们一起回头看看你这个暑假走了多远，再聊聊那个你最关心的问题：**这门课，跟我马上要选的专业、要上的大学，到底什么关系？**
