---
title: "《计算机基本功路线图 · 数据库》第04讲 · 查的艺术：SELECT / WHERE / ORDER BY / LIMIT"
date: 2026-07-07 13:00:00
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

<div class="csf-key-note">上一讲你把书一本一本塞进了 <code>books</code> 表。可一旦数据多起来，"全都倒出来看一遍"就行不通了。这一讲学的是数据库最高频、最值钱的一件事：<strong>从一堆数据里，精确地捞出你想要的那一小撮</strong>。学会了，你就能把一句中文需求——"给我看价格超过 50 块、按贵到便宜排、只要前三本"——稳稳翻译成一条查询。</div>

## 🎯 这一讲你会学到什么

- 用 `SELECT` 挑出你要的**列**，而不是每次都 `SELECT *` 全捞。
- 用 `WHERE` 加**过滤条件**，只留下满足条件的行。
- 把 `>` `<` `=` 这些比较，和 `AND` / `OR` / `NOT` 组合成更复杂的条件。
- 用 `LIKE` 做**模糊匹配**（书名里含某个字）。
- 用 `ORDER BY` **排序**、`LIMIT` **限制条数**，组合出"前 N 名"。
- 用 `DISTINCT` **去重**。
- 看懂一个让无数新手栽跟头的坑：**为什么 `WHERE price = NULL` 什么都查不到**。

<div class="csf-note">这一讲的每条 SQL 都短，但请你一定<strong>亲手敲、亲手回车</strong>。查询是会"手感"的东西——看十遍不如自己写错一遍。文中我会一直让你"先猜后做"，这个"猜"的动作，才是真正在练你的判断力，别跳过。</div>

## 🛠 跟我做

### 先把上一讲的表准备好 <span class="csf-b csf-core">必读</span>

如果你的 `books` 表还在、数据也还在，直接跳到下一节。如果你想要一份和我完全一样的数据好对照结果，就在 SQLite 里把下面这段敲一遍（先 `DROP` 是为了重来时不报"表已存在"）。

打开终端，进入你上一讲建库的那个文件夹，再启动 SQLite。忘了怎么进文件夹的话，回第02讲看 `cd` 命令——简单说就是在终端敲 `cd` 加上那个文件夹的路径（比如 `cd ~/桌面/db练习`），回车后你就"站"到那个文件夹里了。站对了文件夹，再敲下面这行启动 SQLite：

```bash
sqlite3 mylibrary.db
```

然后把这段粘进去（这是建表和造数据，不是这一讲的主角，所以可以放心用现成的）：

```sql
DROP TABLE IF EXISTS books;
CREATE TABLE books (
  id     INTEGER PRIMARY KEY,
  title  TEXT    NOT NULL,
  author TEXT,
  price  REAL
);

INSERT INTO books (title, author, price) VALUES
  ('深入理解计算机系统', '布莱恩特',   139.0),
  ('代码大全',           '麦康奈尔',    98.0),
  ('计算机网络',         '谢希仁',      45.0),
  ('算法导论',           '科尔曼',     128.0),
  ('数据库系统概念',     '西尔伯沙茨',  89.0),
  ('计算机程序的构造',   '艾贝尔森',    79.0),
  ('Python编程',        '马瑟斯',      89.0),
  ('计算机组成原理',     '唐朔飞',      45.0),
  ('未命名草稿',         NULL,         NULL);
```

注意最后一本《未命名草稿》——它的 `author` 和 `price` 都是 `NULL`（未知）。这本"半成品"是我特意埋下的，等下你会亲眼看到它怎么把人坑了。

为了让查询结果看起来更像表格，先开两个显示开关（只影响显示，不影响数据）：

```sql
.headers on
.mode column
```

### 第 0 步：`SELECT *` 全都看一遍 <span class="csf-b csf-skim">可跳读</span>

先把全表打出来，心里有个底：

```sql
SELECT * FROM books;
```

`*` 是"所有列"的意思。你应该看到 9 行。`SELECT * FROM 表` 是你最常用的"看一眼全部"命令。但真正干活时，我们很少全捞——下面开始练"精确捞"。

### 查询①：价格大于 50 的书 <span class="csf-b csf-core">必读</span>

> **先猜**：上面 9 本书里，价格 `> 50` 的有几本？翻回去数一数，把数字记在心里。

```sql
SELECT title, price
FROM books
WHERE price > 50;
```

读这句话的顺序，跟英语语序几乎一样：**从（FROM）`books` 表里，挑出（SELECT）`title` 和 `price` 两列，但只要（WHERE）那些 `price > 50` 的行。**

回车。对一下你刚才猜的数字——价格 > 50 的一共是 6 本：139、98、128、89、79、89。你自己再数一遍，正好对上 6 本就说明数对了。

<div class="csf-why"><strong>为什么这里只写 <code>title, price</code> 两列？</strong><br>因为你这次只关心书名和价格，没必要把 id、author 也拖出来。<code>SELECT</code> 后面跟哪几列，结果就只有哪几列。习惯性 <code>SELECT *</code> 在数据量大、列很多的真实表上会白白搬运一堆你根本不看的数据，又慢又乱。<strong>想清楚自己要什么列</strong>，是好查询的第一步。</div>

### 查询②：书名里含"计算机"的书（LIKE） <span class="csf-b csf-key">重点</span>

> **先猜**：书名里带"计算机"三个字的，有哪几本？先在脑子里点名。

精确相等用 `=`，但"包含某个片段"要用 `LIKE`，再配一个百分号 `%` 当通配符。所谓通配符，就是一个可以替你占位、代表任意字符的符号——你不知道、也不在乎那个位置具体是什么字，就用它顶上：

```sql
SELECT title
FROM books
WHERE title LIKE '%计算机%';
```

`%` 代表"这里可以是任意多个字符（包括没有）"。所以 `'%计算机%'` 的意思是：**前面随便、中间有"计算机"、后面随便**。

回车，对照你点的名。

<details class="csf-fold"><summary>LIKE 的两个通配符，到底怎么用<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
<div>LIKE 里有两个特殊符号：<br>· <code>%</code>：匹配<strong>任意多个</strong>字符（0 个也行）。<br>· <code>_</code>（下划线）：匹配<strong>恰好一个</strong>字符。<br><br>几个例子帮你建立手感：<br>· <code>'计算机%'</code> → 以"计算机"<strong>开头</strong>的（后面随便）。<br>· <code>'%原理'</code> → 以"原理"<strong>结尾</strong>的。<br>· <code>'%数据%'</code> → 任意位置含"数据"的。<br>· <code>'_编程'</code> → 三个字、后两个字是"编程"的（比如"X编程"）。<br><br>小提醒：SQLite 里 LIKE 对英文字母默认<strong>不区分大小写</strong>（<code>'%python%'</code> 也能匹配到 <code>Python编程</code>），这点各数据库不完全一样，先知道有这回事即可。</div>
</details>

### 查询③：最贵的前 3 本（ORDER BY + LIMIT） <span class="csf-b csf-core">必读</span>

这是"排行榜"的标准写法，工作里天天用。

> **先猜**：价格最高的前三名书名，分别是什么？

```sql
SELECT title, price
FROM books
ORDER BY price DESC
LIMIT 3;
```

拆开看：

- `ORDER BY price` —— 按 `price` 这列排序。
- `DESC` —— 降序（descending，从大到小）。想从小到大就写 `ASC`（ascending），不写则默认 `ASC`。
- `LIMIT 3` —— 排好序后，只取前 3 行。

**顺序很关键**：数据库先排序，再砍到 3 行。所以这就是"最贵的 3 本"。如果不写 `ORDER BY` 直接 `LIMIT 3`，那只是"随便给你 3 本"，没有任何意义。

回车，对一下你猜的前三名。

<div class="csf-note"><strong>"前 N 名"= 排序 + 限量。</strong> 记住这个组合：<code>ORDER BY ... DESC LIMIT N</code>。换成"最便宜的 5 本"，你只要把 <code>DESC</code> 换成 <code>ASC</code>、<code>3</code> 换成 <code>5</code> 就行。等下挑战环节会让你自己写。</div>

### 查询④：有哪些作者？（DISTINCT 去重） <span class="csf-b csf-key">重点</span>

> **先猜**：如果只看 `author` 这一列，会不会出现重复？哪几本可能撞作者？（注意那本作者是 NULL 的草稿。）

先不去重，看看原始的样子：

```sql
SELECT author FROM books;
```

你会看到 9 行作者，其中有一行是空的（那本草稿的 NULL）。现在用 `DISTINCT` 把重复的折叠掉：

```sql
SELECT DISTINCT author FROM books;
```

`DISTINCT` 紧跟在 `SELECT` 后面，意思是"重复的行只保留一条"。这下作者列表就干净了。

<div class="csf-why"><strong>NULL 会被去重吗？</strong> 会——所有 NULL 在 DISTINCT 眼里算"同一种空"，会被折叠成一行空值。这其实有点反直觉（NULL 明明代表"未知"，两个未知凭什么算相等？），但 DISTINCT 就是这么处理的。先记住现象，下一节我们专门讲 NULL 的脾气。</div>

### 查询⑤：价格在 30 到 80 之间（BETWEEN / AND） <span class="csf-b csf-core">必读</span>

> **先猜**：价格落在 30 到 80（含两端）之间的，有哪几本？

两种写法，结果一样，都给你看：

```sql
SELECT title, price
FROM books
WHERE price >= 30 AND price <= 80;
```

`AND` 表示"两个条件都要满足"。上面这句读作：价格**既** ≥ 30 **又** ≤ 80。还有个更顺口的写法 `BETWEEN`：

```sql
SELECT title, price
FROM books
WHERE price BETWEEN 30 AND 80;
```

`BETWEEN 30 AND 80` 就是 `>= 30 AND <= 80` 的简写，**包含 30 和 80 两个端点**，这点要记牢。

回车对照。顺便注意：那本价格为 NULL 的草稿，**不会**出现在结果里——这正好引出下一节的大坑。

<details class="csf-fold"><summary>AND / OR / NOT 怎么组合？括号要不要加？<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
<div><code>AND</code>（且）、<code>OR</code>（或）、<code>NOT</code>（非）可以把简单条件拼成复杂条件：<br><br>· "价格大于 100 <strong>或者</strong>作者是谢希仁"：<br><code>WHERE price > 100 OR author = '谢希仁'</code><br><br>· "价格大于 50 <strong>且</strong>书名含计算机"：<br><code>WHERE price > 50 AND title LIKE '%计算机%'</code><br><br><strong>当 AND 和 OR 混用时，一定要加括号。</strong> 因为 AND 的优先级比 OR 高（类似乘法先于加法），不加括号很容易算出你没想要的结果。比如"（贵于 100 或便宜于 50）且 是计算机类"，必须写成：<br><code>WHERE (price > 100 OR price < 50) AND title LIKE '%计算机%'</code><br>把 OR 那组用括号圈起来，意图就清清楚楚，也不怕优先级坑你。</div>
</details>

## 💡 自己复述一遍

合上屏幕，用一句话说出来：

> 一条查询的骨架是 **`SELECT 列 FROM 表 WHERE 条件 ORDER BY 排序 LIMIT 条数`**——挑哪几列、留哪些行、怎么排、要几条，对应中文需求里的每一块。

如果这句话你能不看屏幕讲出来，这一讲的主线就拿下了。

## 🔧 翻车现场

### 翻车一：用 `=` 去比 NULL，结果一片空白 <span class="csf-b csf-core">必读</span>

这是新手最容易栽、而且栽得一脸懵的坑，请重点看。

我们那本《未命名草稿》价格是 NULL。直觉上，想查"哪些书没标价格"，你大概率会写：

```sql
SELECT title FROM books WHERE price = NULL;
```

> **先猜**：这句会返回那本草稿吗？

回车——**一行都没有。** 草稿明明价格是空的，怎么没查出来？

原因在于：在数据库里，**NULL 不是一个"值"，而是"未知"**。"未知 = 未知"这个判断本身也算不出真假，结果是"也未知"，所以 `WHERE` 不会把它当成"成立"，自然一行都不返回。换句话说，**任何东西和 NULL 用 `=`、`>`、`<` 比，结果永远不是"真"**，这一行就被悄悄漏掉了。

正确的写法是用专门的 `IS NULL` / `IS NOT NULL`：

```sql
-- 查"没标价格"的书
SELECT title FROM books WHERE price IS NULL;

-- 查"标了价格"的书
SELECT title FROM books WHERE price IS NOT NULL;
```

这下草稿就乖乖出来了。

<div class="csf-note"><strong>记死这条：判断空，用 <code>IS NULL</code> / <code>IS NOT NULL</code>，永远不要写 <code>= NULL</code> 或 <code>!= NULL</code>。</strong> 这个坑可怕的地方在于：它<strong>不报错</strong>，只是默默少给你几行。线上很多"数据怎么对不上"的事故，根子就在这里。这也正是 AI 帮你写 SQL 时你必须会审的点——AI 偶尔也会写出 <code>= NULL</code>，你得一眼认出来。</div>

### 翻车二：忘了 `ORDER BY` 就直接 `LIMIT`

`LIMIT 3` 只是"截前三行"，至于是哪三行，**完全看数据库心情**（没有排序时顺序是不保证的）。想要"最贵的 3 本"，必须先 `ORDER BY price DESC` 再 `LIMIT`。没排序的 LIMIT，约等于"随机给你几条"。

### 翻车三：字符串忘了加引号

`WHERE author = 谢希仁` 会报错，因为数据库会把"谢希仁"当成某个列名去找。**文字值要用单引号**包起来：`WHERE author = '谢希仁'`。数字才不用引号。

### 翻车四：LIKE 忘了写 `%`

`WHERE title LIKE '计算机'` 只会匹配**整个书名恰好就是"计算机"三个字**的书（一本都没有）。想"包含"，前后都得加 `%`：`'%计算机%'`。

## ✅ 自检三问

1. `SELECT title, price FROM books` 和 `SELECT * FROM books`，结果有什么不同？什么时候该用前者？
2. 想查"最便宜的 5 本书"，这条 SQL 的两个关键部件分别是什么、各写成什么样？
3. `WHERE price = NULL` 为什么查不出价格为空的行？正确写法是什么？

（答不上来不丢人，翻回正文对应小节再读一遍——这比硬背强。）

## 🚀 挑战

打开你的 SQLite，**自己动手**完成下面这几条（先猜结果，再回车对照）。这一关请你亲自写，**不要让 AI 代写**——你可以写完后让 AI 帮你看"有没有写错"，但第一遍必须出自你自己的手，这才是在练真功夫：

1. 查出价格**最便宜的 3 本**书的书名和价格。
2. 查出书名里含"算法"或"程序"的书（用 `LIKE` + `OR`）。这里只有两个条件用 `OR` 连起来、没有和 `AND` 混用，所以不需要加括号；等你以后把 `AND` 和 `OR` 一起用时才要加括号。
3. 查出**作者未知**（author 为空）的书有哪些——故意先写一遍 `= NULL` 看看是不是真的查不到，再改成正确写法。
4. 进阶：查出"价格高于 80 且书名含计算机"的书，按价格从低到高排列。

<div class="csf-note">做完第 3 题，你就亲手复现了一次"NULL 坑"——这种亲手踩过的坑，一辈子忘不了。</div>

## 📦 复制带走

<div class="csf-card"><strong>这一讲的四张底牌：</strong><br>1. <strong>查询骨架</strong>：<code>SELECT 列 FROM 表 WHERE 条件 ORDER BY 排序 DESC/ASC LIMIT N</code>——挑列、筛行、排序、限量，一句话需求对应一段结构。<br>2. <strong>"前 N 名"= 排序 + 限量</strong>：<code>ORDER BY x DESC LIMIT N</code>，缺了 ORDER BY 的 LIMIT 没有意义。<br>3. <strong>模糊匹配用 LIKE + %</strong>：<code>'%片段%'</code> 是包含，<code>'开头%'</code> 是前缀，<code>_</code> 配单个字符。<br>4. <strong>判断空用 <code>IS NULL</code> / <code>IS NOT NULL</code></strong>，绝不用 <code>= NULL</code>——它不报错，只悄悄漏数据，是审查 AI 写的 SQL 时必盯的点。</div>

下一讲——第05讲《改与删：UPDATE / DELETE，以及"手别抖"》——我们要动数据本身了。查询写错最多是没查到，而 UPDATE / DELETE 写错可是会真删真改的。到时我会教你一个能救命的习惯：**改之前先用 SELECT 把 WHERE 验一遍**。我们下讲见。
