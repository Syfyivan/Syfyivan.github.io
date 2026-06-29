---
title: "《计算机基本功路线图 · 数据库》第06讲 · 汇总与分组：聚合函数 + GROUP BY + HAVING"
date: 2026-07-07 15:00:00
tags: [计算机基础, 数据库, 零基础, 编程入门, 课程]
categories: [技术笔记]
toc: true
visibility: public
---

<style>
.csf-b{display:inline-block;font-size:12px;font-weight:700;padding:1px 8px;border-radius:999px;vertical-align:middle;margin-left:6px;line-height:1.7;white-space:nowrap}
.csf-core{color:#fff;background:#3f5d7e}
.csf-key{color:#34506e;background:rgba(63,93,126,.12);border:1px solid rgba(63,93,126,.32)}
.csf-skim{color:#7a8390;background:rgba(122,131,144,.1);border:1px solid rgba(122,131,144,.25)}
.csf-skip{color:#69727d;background:rgba(105,114,125,.12);border:1px solid rgba(105,114,125,.25)}
.csf-note,.csf-why,.csf-key-note,.csf-card,.csf-legend{margin:18px 0;padding:14px 16px;line-height:1.78;border-radius:8px}
.csf-note{background:rgba(63,93,126,.08);border-left:4px solid #3f5d7e}
.csf-why{background:var(--wash);border-left:4px solid var(--line);color:var(--muted)}
.csf-key-note{background:rgba(63,93,126,.1);border-left:4px solid #3f5d7e}
.csf-card{background:rgba(63,93,126,.07);border:1px solid rgba(63,93,126,.34);border-radius:10px}
.csf-legend{background:var(--wash);font-size:14px;line-height:2}
.csf-fold{margin:18px 0;padding:4px 16px;border:1px solid var(--line);border-radius:8px;background:var(--wash)}
.csf-fold summary{cursor:pointer;font-weight:700;padding:10px 0}
.csf-fold[open]{padding-bottom:14px}
html[data-user-color-scheme="dark"] .csf-key{color:#8fb6dd;background:rgba(63,93,126,.22);border-color:rgba(63,93,126,.5)}
html[data-user-color-scheme="dark"] .csf-note{background:rgba(63,93,126,.2)}
html[data-user-color-scheme="dark"] .csf-key-note{background:rgba(63,93,126,.22)}
html[data-user-color-scheme="dark"] .csf-card{background:rgba(63,93,126,.16)}
</style>

<div class="csf-key-note">前五讲，你查的都是"一行一行的明细"——这本书叫什么、那本书多少钱。但老板真正想问的，往往是"<b>一句话的结论</b>"：一共多少本？平均多少钱？哪个作者写得最多？这一讲，你要学会把成百上千行明细，<b>压缩成一个数字、一张统计表</b>。这就是聚合（aggregate）。AI 能替你写出 <code>GROUP BY</code>，但它分不清你要的是"过滤行"还是"过滤组"——这一字之差，正是这一讲要练进你脑子的判断。</div>

## 🎯 这一讲你会学到什么

- 用五个聚合函数（COUNT / SUM / AVG / MAX / MIN）把一堆明细算成一个结论；
- 用 `GROUP BY` 按某个维度（比如作者）把数据分成几堆，每堆各算一份统计；
- 用 `HAVING` 对"分组后的统计值"做筛选，并彻底搞清它和 `WHERE` 的分工；
- 用 `AS` 给结果列起个人能看懂的名字；
- 练出一个关键判断：**这条过滤条件，该放 WHERE 还是 HAVING？**

<div class="csf-note">这一讲不需要新软件。打开你第 02 讲建好的那个 <code>library.db</code>，用 <code>sqlite3 library.db</code> 进去就行。如果你忘了表长什么样，先敲一句 <code>.schema books</code> 看一眼，找回手感。</div>

## 🛠 跟我做

### 第 0 步：先把数据喂饱 <span class="csf-b csf-core">必读</span>

聚合统计，数据太少看不出味道。我们先把 `books` 表扩充到 8 本，覆盖几个不同的作者，方便后面分组。

先看看你现在表里有什么（你的数据可能和我不完全一样，没关系）：

```sql
SELECT * FROM books;
```

为了让大家结果一致，我们**重来一遍**：清空再重新插入一批固定数据。下面这段直接复制进 sqlite3 跑：

```sql
DELETE FROM books;

INSERT INTO books (title, author, price, stock) VALUES
  ('活着',         '余华',   45.0, 12),
  ('许三观卖血记', '余华',   39.0,  5),
  ('在细雨中呼喊', '余华',   42.0,  0),
  ('百年孤独',     '马尔克斯', 55.0, 8),
  ('霍乱时期的爱情','马尔克斯', 58.0, 3),
  ('解忧杂货店',   '东野圭吾', 39.5, 20),
  ('白夜行',       '东野圭吾', 59.0, 7),
  ('人类简史',     '赫拉利',   68.0, 4);
```

<div class="csf-why">注意 <code>在细雨中呼喊</code> 的库存（stock）我故意设成了 <b>0</b>。后面算"总库存"和"平均"时，这个 0 会帮你看清聚合函数到底怎么算的——别小看一个零。</div>

确认一下插进去了：

```sql
SELECT title, author, price, stock FROM books;
```

应该是 8 行。好，数据备齐，开始算。

### 第 1 步：COUNT —— 一共多少本？ <span class="csf-b csf-key">重点</span>

**先猜后做**：你觉得下面这句会返回什么？一个数字，还是 8 行？

```sql
SELECT COUNT(*) FROM books;
```

揭晓：它只返回**一个数字** `8`。`COUNT(*)` 的意思是"数一数有多少行"。整张表 8 行，结果就是 8。

注意发生了什么——明明表里有 8 行明细，查询结果却**塌缩成了一行一列**。这就是聚合函数的核心动作：**把多行压成一个值**。

那个列名 `COUNT(*)` 太丑了，我们用 `AS` 给它起个中文名：

```sql
SELECT COUNT(*) AS 图书总数 FROM books;
```

```text
图书总数
--------
8
```

<details class="csf-fold"><summary>COUNT(*) 和 COUNT(列名) 有什么区别？<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
<div>区别在于：<b>对 NULL 的态度</b>。<br><code>COUNT(*)</code> 数的是"行数"，不管这行里有没有空值，照数不误。<br><code>COUNT(列名)</code> 数的是"这一列里非 NULL 的值有几个"——如果某行这一列是 NULL，它<b>不算</b>。<br>举例：如果有些书的 <code>author</code> 没填（是 NULL），<code>COUNT(*)</code> 还是 8，但 <code>COUNT(author)</code> 会小于 8。<br>另外还有 <code>COUNT(DISTINCT author)</code>，意思是"有几个<b>不重复</b>的作者"，我们这批数据里它会返回 4（余华、马尔克斯、东野圭吾、赫拉利）。这个去重计数后面很常用。</div>
</details>

### 第 2 步：AVG / SUM / MAX / MIN —— 平均、合计、最贵、最便宜

这四个和 COUNT 是一家人，都是"把一列多行的数字算成一个值"。一口气来：

```sql
SELECT
  AVG(price) AS 平均价格,
  SUM(stock) AS 库存总和,
  MAX(price) AS 最高价,
  MIN(price) AS 最低价
FROM books;
```

**先猜后做**：平均价格大概在 40 到 60 之间？库存总和呢，把上面 8 个 stock 加起来——12+5+0+8+3+20+7+4，你心算一下。

揭晓（AVG 可能带一长串小数）：

```text
平均价格           库存总和  最高价  最低价
-----------------  --------  ------  ------
50.6875            59        68.0    39.0
```

- `AVG(price)`：8 本书价格的平均数；
- `SUM(stock)`：所有库存相加 = 59（那个 0 也参与了相加，只是加 0 不变）；
- `MAX(price)` / `MIN(price)`：最贵 68（人类简史）、最便宜 39（许三观卖血记）。

平均价那一长串小数不好看，可以用 `ROUND` 保留两位小数：

```sql
SELECT ROUND(AVG(price), 2) AS 平均价格 FROM books;
```

得到 `50.69`，清爽多了。`ROUND(数字, 2)` 里的那个 `2`，意思就是"保留几位小数"——写 2 就保留两位小数，写 1 就保留一位，写 0 就只留整数。

<div class="csf-note"><b>聚合函数会自动忽略 NULL。</b>这点很重要：假设有一本书 <code>price</code> 没填（NULL），<code>AVG(price)</code> 算的是"有价格的那几本的平均"，分母也只数有价格的——它<b>不会</b>把 NULL 当成 0 拉低平均值。SUM/MAX/MIN 同理，都跳过 NULL。但 0 不是 NULL，0 是一个实实在在的数字，会照常参与计算（就像我们的库存 0）。"没填"和"填了 0"是两回事，记牢。</div>

### 第 3 步：GROUP BY —— 按作者分堆，各算各的 <span class="csf-b csf-core">必读</span>

到目前为止，我们都是"对整张表算一个总数"。但老板更常问的是："**每个作者**各有几本书？"——这就要先把书按作者分成几堆，再对每一堆分别 COUNT。

这就是 `GROUP BY`。**先猜后做**：我们有 4 个作者，你猜下面这句返回几行？

```sql
SELECT
  author     AS 作者,
  COUNT(*)   AS 著作数,
  SUM(stock) AS 库存合计
FROM books
GROUP BY author;
```

揭晓：返回 **4 行**——一个作者一行。

```text
作者        著作数  库存合计
----------  ------  --------
东野圭吾    2       27
余华        3       17
马尔克斯    2       11
赫拉利      1       4
```

读懂这张表，你就懂了 `GROUP BY` 的全部精髓：

1. `GROUP BY author` 先把 8 行书按作者**分成 4 堆**；
2. 然后 `COUNT(*)` 和 `SUM(stock)` **不再对整表算，而是对每一堆各算一次**；
3. 余华那一堆有 3 行（活着、许三观、在细雨中），所以著作数=3，库存合计 12+5+0=17。

<div class="csf-why">心里建个画面：<code>GROUP BY</code> 像把一摞混在一起的卡片，按"作者"分成几摞放在桌上。聚合函数则是站到每一摞前面，分别数一数、加一加。没有 <code>GROUP BY</code> 时，全表就是"一大摞"，所以只算出一行结果。</div>

这里有一条**铁律**，新手最容易踩 <span class="csf-b csf-key">重点</span>：

<div class="csf-note">用了 <code>GROUP BY author</code> 之后，<code>SELECT</code> 里能直接出现的"普通列"，<b>只能是你分组依据的那个列</b>（这里是 author）。其他列要么包在聚合函数里（<code>COUNT</code>/<code>SUM</code>...），要么就不能出现。<br>道理很简单：余华那一堆有 3 本书、3 个不同的 title，你写 <code>SELECT title</code> 让数据库回答"这一堆的标题是什么"，它该报哪一个？答不上来。所以要么聚合、要么是分组列，没有第三种。</div>

<details class="csf-fold"><summary>SQLite 的"宽容"是个陷阱<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
<div>严格来说，上面那条铁律是 SQL 标准。但 SQLite 比较"宽容"：你硬写 <code>SELECT author, title, COUNT(*) ... GROUP BY author</code>，它<b>不会报错</b>，而是从每堆里随便挑一行的 title 给你。这看着像"能用"，其实是个坑——它给的那个 title 是<b>不确定</b>的，换台机器、换个版本可能就变了。<br>在别的数据库（如 MySQL 默认严格模式、PostgreSQL）里，这样写会直接报错。所以请养成好习惯：<b>SELECT 里只放分组列和聚合函数</b>，别依赖 SQLite 的宽容。这正是"会读懂、会改 AI 生成的 SQL"的一环——AI 有时会写出这种在 SQLite 能跑、换库就崩的语句。</div>
</details>

### 第 4 步：HAVING —— 只看"高产"作者 <span class="csf-b csf-core">必读</span>

新需求来了："我只关心**写了 2 本及以上**的作者。"

你的第一反应可能是用 `WHERE`。**先猜后做**：下面这句你觉得能跑吗？

```sql
-- 先猜：这句会成功，还是报错？
SELECT author, COUNT(*) AS 著作数
FROM books
WHERE COUNT(*) >= 2
GROUP BY author;
```

揭晓：**报错！** SQLite 会甩给你一句类似 `misuse of aggregate: COUNT()`。

为什么？因为 `WHERE` 是在**分组之前**、对**原始的每一行**做筛选的。那个时候"每个作者有几本"这个统计值**还根本不存在**——书还没分堆呢，COUNT 无从谈起。

要对"分组后算出来的统计值"做筛选，得用专门的 `HAVING`：

```sql
SELECT
  author   AS 作者,
  COUNT(*) AS 著作数
FROM books
GROUP BY author
HAVING COUNT(*) >= 2;
```

```text
作者        著作数
----------  ------
东野圭吾    2
余华        3
马尔克斯    2
```

赫拉利只有 1 本，被 `HAVING` 过滤掉了。成功！

<div class="csf-key-note"><b>一句话记住 WHERE 和 HAVING 的分工：</b><br>· <code>WHERE</code> 在分组<b>之前</b>过滤<b>行</b>——筛的是"哪些原始记录参与统计"；<br>· <code>HAVING</code> 在分组<b>之后</b>过滤<b>组</b>——筛的是"算出来的哪些统计结果留下"。<br>顺口溜：<b>先 WHERE 留行，再分组，后 HAVING 留组。</b></div>

### 第 5 步：把它们串起来 —— WHERE + GROUP BY + HAVING 同台

真实业务里，三者常常一起出现。来个综合题："**只统计有库存（stock > 0）的书**，按作者分组，**只保留库存合计超过 10** 的作者。"

**先猜后做**：余华那本库存 0 的《在细雨中呼喊》会被算进去吗？谁会出现在最终结果里？

```sql
SELECT
  author     AS 作者,
  COUNT(*)   AS 在售本数,
  SUM(stock) AS 库存合计
FROM books
WHERE stock > 0
GROUP BY author
HAVING SUM(stock) > 10;
```

有人会以为结果是这样（先别急着相信，下面会一起核对）↓

```text
作者        在售本数  库存合计
----------  --------  --------
东野圭吾    2         27
余华        2         17
```

逐步拆给你看，体会执行顺序：

1. **WHERE stock > 0**：先把库存为 0 的《在细雨中呼喊》踢掉，剩 7 行参与统计；
2. **GROUP BY author**：剩下的 7 行按作者分堆——注意余华现在只剩 2 本（在售本数=2，库存 12+5=17）；
3. **HAVING SUM(stock) > 10**：马尔克斯库存 8+3=11>10 本该留……等等，它确实是 11，> 10，应该留才对？

<div class="csf-note">停一下——上面那张"有人会以为"的表其实<b>少了一行</b>，是我故意放的一个对照，用来检验你会不会照单全收。马尔克斯库存合计是 8+3=<b>11</b>，<code>HAVING SUM(stock) &gt; 10</code> 对 11 是成立的，所以马尔克斯<b>应该出现</b>在结果里。换句话说，真实结果是 <b>3 行</b>，不是 2 行。<br>正确的完整结果如下，跑完拿它对照确认：<br><br><code>作者&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;在售本数&nbsp;&nbsp;库存合计</code><br><code>东野圭吾&nbsp;&nbsp;&nbsp;&nbsp;2&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;27</code><br><code>余华&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;17</code><br><code>马尔克斯&nbsp;&nbsp;&nbsp;&nbsp;2&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;11</code><br><br>这正是这门课想带给你的习惯：别背我给的表，也别背 AI 给的表，<b>自己跑一遍、拿真实输出核对</b>。结果到底几行、马尔克斯在不在，敲完回车你就知道了。</div>

我之所以放这张少一行的对照表，不是为了为难你，而是想让你建立一个习惯：**任何 SQL 的结果，都用真实运行去验证，而不是脑补，也不是照抄别人写好的表**。这就是审查 AI 写的 SQL 时，你最值钱的能力。

## 💡 自己复述一遍

合上屏幕，用一句话说出来：

> 聚合函数把多行**压成一个值**；`GROUP BY` 先按维度**分堆再各算各的**；过滤行用 `WHERE`（分组前），过滤组用 `HAVING`（分组后）。

如果这句话你能不看屏幕讲顺，这一讲的骨架就立住了。

## 🔧 翻车现场

**翻车一：用 WHERE 去过滤聚合结果** <span class="csf-b csf-key">重点</span>

```sql
WHERE COUNT(*) > 2      -- ❌ 报错：misuse of aggregate
```

原因：`WHERE` 在分组前执行，那时统计值还不存在。
解法：把对统计值的过滤改成 `HAVING COUNT(*) > 2`，并放到 `GROUP BY` 后面。

**翻车二：GROUP BY 后 SELECT 里塞了乱七八糟的列**

```sql
SELECT author, title, COUNT(*) FROM books GROUP BY author;  -- 危险
```

原因：每个作者一堆里有多个 title，title 没法对应到唯一一行。SQLite 不报错但会"随便给一个"，换库就崩。
解法：SELECT 里只放**分组列**（author）和**聚合函数**。想看明细就别用 GROUP BY。

**翻车三：把 NULL 当成 0**

原因：聚合函数会**跳过 NULL**。`AVG(price)` 不会把没填价格的书当 0 算进分母，结果可能比你以为的高。
解法：先用 `SELECT COUNT(*), COUNT(price) FROM books;` 看看两个数一不一样，不一样就说明有 NULL，心里要有数。

**翻车四：HAVING 和 WHERE 的位置、分工搞混了**

原因：初学者常把 `HAVING` 写到 `GROUP BY` 前面（顺序错了），或把"针对单行的条件"（比如 `stock > 0`）写进 HAVING、把"针对统计值的条件"（比如 `COUNT(*) >= 2`）写进 WHERE（分工错了）。
解法：记死顺序——`WHERE … GROUP BY … HAVING …`，三者出现的先后不能乱。再记死分工：针对每一行的条件放 WHERE，针对分组后统计值的条件放 HAVING。

## ✅ 自检三问

1. `COUNT(*)` 和 `COUNT(author)` 在"author 有空值"时，结果会一样吗？为什么？
2. 我想筛选"平均价格高于 50 的作者"，这个条件该写在 `WHERE` 还是 `HAVING` 里？换成"价格高于 50 的书"呢？
3. 一句 SQL 同时有 `WHERE`、`GROUP BY`、`HAVING`，数据库是按什么顺序执行这三者的？

（答不上来别急，回到对应小节再读一遍，然后**到 sqlite3 里亲手验证**。）

## 🚀 挑战

用我们这 8 本书的数据，自己写 SQL 回答下面三个问题。**这一段请务必自己写，别让 AI 代写**——写不出来时，你可以问 AI"GROUP BY 的语法是什么样"，但具体这条语句要你自己拼出来，再用运行结果检验对错。

1. 每个作者的书，**最贵的一本卖多少钱**？（提示：MAX + GROUP BY，给列起中文别名）
2. 哪些作者的书**平均价格超过 50 元**？（提示：AVG + GROUP BY + HAVING，注意是过滤组）
3. 进阶：先**只看库存大于 0 的书**，再按作者分组，统计每个作者**还有几本在售**，并且**只保留在售 2 本及以上**的作者。（提示：WHERE + GROUP BY + HAVING 三件套）

写完后，试着把第 3 题的 SQL 用自己的话翻译成一句中文需求——能翻译得出，才算真懂。

## 📦 复制带走

<div class="csf-card">
1. <b>聚合函数 = 把多行压成一个值</b>：COUNT 数行数、SUM 求和、AVG 平均、MAX/MIN 取极值；它们<b>自动忽略 NULL</b>，但 0 照常参与。<br>
2. <b>GROUP BY = 先分堆再各算各的</b>：按某列把数据分成几组，聚合函数对每组分别计算；SELECT 里只放分组列和聚合函数。<br>
3. <b>WHERE 过滤行（分组前），HAVING 过滤组（分组后）</b>：要拿统计值（如 COUNT(*)、SUM(...)）做条件，只能用 HAVING；顺序永远是 WHERE → GROUP BY → HAVING。<br>
4. <b>用 AS 起人话别名，用运行结果验证一切</b>：别背答案、别信脑补，敲回车看真实输出，才是审查 SQL 的硬功夫。
</div>

下一讲（第07讲《表设计与主外键：一张表装不下整个世界》），我们要离开"一张表"的舒适区——当数据多到一张表装不下、还互相牵连时，怎么把它们拆成多张表、再用主键外键把它们重新连起来。这是从"会查"走向"会设计"的关键一步。
