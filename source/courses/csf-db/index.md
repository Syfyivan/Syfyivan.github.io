---
title: "计算机基本功 · 数据库"
date: 2026-07-08 09:00:00
description: "从把数据记在哪、怎么不弄丢、怎么查得快出发，用 SQLite 亲手敲 SQL，把认真记住数据这件基本功练扎实。"
---

<style>
.csf-key-note{margin:18px 0;padding:14px 16px;line-height:1.78;border-radius:8px;background:rgba(63,93,126,.1);border-left:4px solid #3f5d7e}
.csf-row{display:flex;align-items:center;gap:14px;padding:13px 15px;margin:8px 0;border:1px solid var(--line);border-radius:10px;text-decoration:none;background:var(--panel)}
.csf-row:hover{border-color:#3f5d7e}
.csf-num{flex:none;width:40px;height:40px;display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;background:#3f5d7e;border-radius:9px;font-size:14px}
.csf-rt{flex:1;min-width:0}
.csf-rt h4{margin:0 0 3px;font-size:16px;line-height:1.3}
.csf-rt p{margin:0;font-size:13px;color:var(--muted);line-height:1.5}
.csf-why{margin:18px 0;padding:14px 16px;line-height:1.78;border-radius:8px;background:var(--wash);border-left:4px solid var(--line);color:var(--muted)}
html[data-user-color-scheme="dark"] .csf-key-note{background:rgba(63,93,126,.22)}
</style>

<div class="csf-key-note"><strong>从把数据记在哪、怎么不弄丢、怎么查得快出发，用 SQLite 亲手敲 SQL，把认真记住数据这件基本功练扎实。</strong><br>这门课是《计算机基本功路线图》的一站，<strong>扎实讲原理 + 自己动手练 + 练判断，不让 AI 代写</strong>。学完后你能独立设计一个多表的小型数据库（含主外键），用 SQL 完成增删改查、分组统计和多表 JOIN，能解释清楚索引为什么快、事务为什么不能少，并能审查一条 AI 生成的 SQL 是否安全、是否会出错。</div>

<div class="csf-why"><strong>为什么 AI 时代更要学好这门？</strong>AI 能帮你写出一条 SQL，但它不知道你的表该怎么设计、这条语句会不会误删全表、为什么线上突然变慢——这些判断只能来自你脑子里的数据模型。会读懂、会改、会验证 AI 生成的 SQL，比会复制粘贴重要一百倍；而所有应用最终都要把状态落进数据库，看不懂数据存储的人永远只能在表面打转。把数据库基本功练透，你才有资格当那个对数据负责的人。</div>

按顺序从 00 跟到底，每讲 30–60 分钟，主线必做、细究可跳。

<a class="csf-row" href="/2026/07/07/csf-db-00/"><span class="csf-num">00</span><div class="csf-rt"><h4>序：把"记住数据"当回事——装好你的练习台</h4><p>理解这门课为什么"不能让 AI 代写"，搞清楚我们要练的到底是什么本事；在自己电脑上跑通第一…</p></div></a>
<a class="csf-row" href="/2026/07/07/csf-db-01/"><span class="csf-num">01</span><div class="csf-rt"><h4>为什么要数据库：Excel 和文本文件撑不住的那一天</h4><p>能说清"用文件/Excel 存数据"在多人、多条、要查询、要不丢时的具体崩溃点，从而理解数据…</p></div></a>
<a class="csf-row" href="/2026/07/07/csf-db-02/"><span class="csf-num">02</span><div class="csf-rt"><h4>关系模型：表、行、列、键的世界观</h4><p>能把一个现实事物（一本书、一个用户）正确地拆成"一张表的一行"，分清列(字段)、行(记录)、…</p></div></a>
<a class="csf-row" href="/2026/07/07/csf-db-03/"><span class="csf-num">03</span><div class="csf-rt"><h4>建第一张表 + 增：CREATE TABLE 与 INSERT</h4><p>能用 SQL 亲手创建一张结构正确的表，并往里插入数据；看得懂建表语句里每一段在说什么。</p></div></a>
<a class="csf-row" href="/2026/07/07/csf-db-04/"><span class="csf-num">04</span><div class="csf-rt"><h4>查的艺术：SELECT / WHERE / ORDER BY / LIMIT</h4><p>能从表里精确捞出"我想要的那部分数据"：会筛选、会排序、会限制条数，能把一句中文需求翻译成一…</p></div></a>
<a class="csf-row" href="/2026/07/07/csf-db-05/"><span class="csf-num">05</span><div class="csf-rt"><h4>改与删：UPDATE / DELETE，以及"手别抖"</h4><p>能安全地修改和删除数据，并养成职业级的安全习惯：永远先 WHERE、先 SELECT 验证、…</p></div></a>
<a class="csf-row" href="/2026/07/07/csf-db-06/"><span class="csf-num">06</span><div class="csf-rt"><h4>汇总与分组：聚合函数 + GROUP BY + HAVING</h4><p>能从一堆明细数据里算出"统计结论"：总数、平均、最大最小，并能按某个维度分组统计、再对分组结…</p></div></a>
<a class="csf-row" href="/2026/07/07/csf-db-07/"><span class="csf-num">07</span><div class="csf-rt"><h4>表设计与主外键：一张表装不下整个世界</h4><p>能识别"一张大表里塞了多类事物"的坏味道，把它拆成多张表，并用外键正确表达表与表之间的关系。</p></div></a>
<a class="csf-row" href="/2026/07/07/csf-db-08/"><span class="csf-num">08</span><div class="csf-rt"><h4>JOIN：把拆开的表重新拼回来</h4><p>能用 JOIN 把分散在多张表的数据按关系连接起来查询，理解 INNER JOIN 和 LE…</p></div></a>
<a class="csf-row" href="/2026/07/07/csf-db-09/"><span class="csf-num">09</span><div class="csf-rt"><h4>索引：为什么同一条查询突然快了一百倍</h4><p>能解释索引为什么能加速查询、它的代价是什么、什么时候该建什么时候不该建，并能亲手测出加索引前…</p></div></a>
<a class="csf-row" href="/2026/07/07/csf-db-10/"><span class="csf-num">10</span><div class="csf-rt"><h4>事务与 ACID：要么全做，要么全不做</h4><p>能说清为什么"转账"这类操作必须打包成一个整体，会用事务把多条语句变成不可分割的一组，理解 …</p></div></a>
<a class="csf-row" href="/2026/07/07/csf-db-11/"><span class="csf-num">11</span><div class="csf-rt"><h4>范式直觉 + 综合实战：设计一个不埋雷的数据库</h4><p>能用"一个事实只存一处"的范式直觉审查并改进一份表设计，独立从零设计并实现一个多表小型数据库…</p></div></a>

<p style="margin-top:24px"><a href="/courses/csf/">← 回到《计算机基本功路线图》总览</a></p>
