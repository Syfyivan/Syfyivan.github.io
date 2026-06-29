---
title: "《计算机基本功路线图 · 数据库》第03讲 · 建第一张表 + 增：CREATE TABLE 与 INSERT"
date: 2026-07-07 12:00:00
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

<div class="csf-key-note">上一讲我们在纸上把 <code>books</code> 表的"表、行、列、键"想清楚了。这一讲，我们要把图纸真正变成实物——用 <code>CREATE TABLE</code> 在 SQLite 里建出这张表，再用 <code>INSERT</code> 把 5 本你真喜欢的书一条条放进去。这是你和数据库的第一次真正"动手"：从这一刻起，数据不再是脑子里的想象，而是硬盘上一份你亲手写下、能查得到的记录。</div>

## 🎯 这一讲你会学到什么

- 用 `CREATE TABLE` 创建一张表，并能逐字解释建表语句里每一段在说什么。
- 认识 SQLite 的三种核心数据类型：`INTEGER`（整数）、`TEXT`（文字）、`REAL`（小数）。
- 用 `NOT NULL` 给关键列加约束，让"这一列不许空着"成为铁律。
- 理解 `PRIMARY KEY` 和 `AUTOINCREMENT` 在干什么——为什么每条记录都需要一个独一无二的编号。
- 用 `INSERT INTO ... VALUES` 插入一行、再一次插入多行。
- 养成一个能让你少踩无数坑的习惯：**插入时显式写出列名**。

<div class="csf-note">本讲假设你已经按第 01 讲装好了 SQLite，并且会用 <code>sqlite3</code> 打开一个数据库文件。如果还没装，回到第 01 讲跟着做一遍再来——这一讲全程都要你亲手敲。</div>

## 🛠 跟我做 <span class="csf-b csf-core">必读</span>

### 第一步：打开一个数据库

先在命令行里打开（或顺手创建）一个数据库文件。我们整门课都用同一个文件，叫 `library.db`：

```bash
sqlite3 library.db
```

回车后，你会看到屏幕左边那行"等你输入的标记"（这行标记就叫**提示符**——它由系统显示，不是你打的字，作用是告诉你"现在轮到你敲了"）从原来的样子变成了 `sqlite>`。这说明你已经进到 SQLite 的交互界面里了——从现在起，你敲的就是 SQL，不再是普通命令。

<div class="csf-note">小提醒：SQLite 里每条 SQL 语句要用分号 <code>;</code> 结尾。如果你回车后提示符变成了 <code>...&gt;</code>，别慌——这表示"这句话还没说完"，SQLite 在等你的分号。补一个 <code>;</code> 再回车就好。</div>

### 第二步：读懂这条建表语句（先别敲）

下面是我们要建的 `books` 表。**先别急着敲**，我们一行一行把它读懂，再动手：

```sql
CREATE TABLE books (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    title     TEXT    NOT NULL,
    author    TEXT    NOT NULL,
    year      INTEGER,
    rating    REAL
);
```

逐行拆解（这一段值得你慢慢看）：

- `CREATE TABLE books (` —— "我要创建一张表，名字叫 `books`，下面括号里是它的列。"
- `id INTEGER PRIMARY KEY AUTOINCREMENT` —— 一列叫 `id`，类型是整数；它是**主键**（每行的唯一身份证），`AUTOINCREMENT` 表示每插一行让 SQLite 自动 +1 编号，你不用自己填。
- `title TEXT NOT NULL` —— 书名，文字类型；`NOT NULL` 表示**这一列不许空着**，一本没名字的书在我们这儿不成立。
- `author TEXT NOT NULL` —— 作者，文字类型，同样不许空。
- `year INTEGER` —— 出版年份，整数；没加 `NOT NULL`，意思是"允许暂时不知道、可以空着"。
- `rating REAL` —— 你给的评分，小数类型（比如 4.5）；也允许空着。
- `);` —— 括号收尾，分号结束这条语句。

<div class="csf-why">为什么 <code>id</code> 要单独搞个自增列？因为"书名"可能重复（两本不同的书可能同名），"作者"更会重复，没有任何一个真实信息能保证全表唯一。所以我们专门造一个谁也不会撞车的编号当主键——这正是第 02 讲说的"主键"落到实处的样子。</div>

<details class="csf-fold"><summary>细究：SQLite 的类型为什么这么"宽松"<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
和很多数据库不同，SQLite 的类型系统叫"动态类型"：你写的 <code>INTEGER</code> / <code>TEXT</code> / <code>REAL</code> 更像是"亲和性建议"，SQLite 并不会因为你往 <code>year</code> 里塞了个文字就立刻报错。<br>这对新手是把双刃剑：好处是不容易因为类型不匹配而被拦住；坏处是它"太好说话"，可能默默存下你本不想要的脏数据（脏数据就是混进表里那些不对劲的内容——比如本该是数字却被存成了文字、或者明显写错、多余、对不上的值，统称"脏数据"）。所以现阶段你只要做到一件事：<strong>该是数字的列就老老实实存数字，该是文字的就存文字</strong>，别依赖数据库帮你纠错。等后面学到约束和数据校验，我们再细聊怎么让数据库"严格起来"。</details>

### 第三步：真正建表

读懂了，现在动手。在 `sqlite>` 提示符后把建表语句敲进去（可以分多行敲，SQLite 会等你的分号）：

```sql
CREATE TABLE books (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    title     TEXT    NOT NULL,
    author    TEXT    NOT NULL,
    year      INTEGER,
    rating    REAL
);
```

回车后如果**什么都没提示、直接回到 `sqlite>`**，恭喜——表建好了。SQL 的世界里"没消息就是好消息"：成功往往悄无声息，只有出错才会喊。

验证一下表真的建出来了。敲这两条：

```sql
.tables
```

```sql
.schema books
```

`.tables` 会列出当前库里所有的表，你应该能看到 `books`。`.schema books` 会把这张表的"出生证明"（也就是你刚写的建表语句）原样打印出来。这两个以点开头的是 SQLite 的**特殊命令**（不是 SQL，所以不用加分号），专门用来"看看现状"。

### 第四步：插入第一本书（先猜后做）<span class="csf-b csf-key">重点</span>

现在往表里放数据。我们用最稳的写法——**显式写出列名**：

```sql
INSERT INTO books (title, author, year, rating)
VALUES ('小王子', '圣埃克苏佩里', 1943, 4.8);
```

读一下这句话：往 `books` 表里，按 `title, author, year, rating` 这个顺序，插入一行，值依次是 `'小王子'`、`'圣埃克苏佩里'`、`1943`、`4.8`。

注意两个细节：

- 文字要用**英文单引号**包起来（`'小王子'`），数字不用引号（`1943`、`4.8`）。
- 我们**没有**写 `id`！因为 `id` 是自增列，SQLite 会自动给它填 `1`。

<div class="csf-note">先猜后做：你觉得这条 <code>INSERT</code> 会成功吗？我们没给 <code>id</code> 赋值，会不会因为"少了一列"而报错？……先在心里下个判断，再回车。</div>

回车。如果没报错，说明成功了——`id` 由 SQLite 自动补上了 `1`，你的判断对不对？这就是 `AUTOINCREMENT` 在替你干活：自增列不需要你管，硬要管反而是给自己添乱。

### 第五步：一次插入多行

一条条插太慢。`INSERT` 支持一次插多行，用逗号把多组 `VALUES` 隔开。把下面这条改成**你自己真喜欢的 4 本书**，凑满 5 本：

```sql
INSERT INTO books (title, author, year, rating)
VALUES
    ('活着', '余华', 1993, 4.9),
    ('三体', '刘慈欣', 2008, 4.7),
    ('人类简史', '尤瓦尔·赫拉利', 2011, 4.6),
    ('百年孤独', '加西亚·马尔克斯', 1967, 4.8);
```

<div class="csf-note">先猜后做：这一条会一次性插入 4 行。回车前先猜——它们的 <code>id</code> 会分别是几？（提示：第一本已经占了 1。）回车后我们去查。</div>

### 第六步：确认数据真的在里面 <span class="csf-b csf-core">必读</span>

下一讲才正式讲查询，但现在我们先用最简单的一条来"亲眼确认"数据进去了：

```sql
SELECT * FROM books;
```

`SELECT *` 的意思是"把所有列都查出来"，`FROM books` 是"从 books 表里查"。回车，你应该能看到 5 行，`id` 从 1 到 5 整整齐齐：

```
1|小王子|圣埃克苏佩里|1943|4.8
2|活着|余华|1993|4.9
3|三体|刘慈欣|2008|4.7
4|人类简史|尤瓦尔·赫拉利|2011|4.6
5|百年孤独|加西亚·马尔克斯|1967|4.8
```

看到这一幕，你刚才对 `id` 的猜测被验证了吗？这就是数据库给你的第一份"实物反馈"：你写下的，它真的记住了，而且原样还得回来。

<div class="csf-why">为什么我每一步都让你"先猜再回车"？因为学数据库最危险的状态不是"不会写"，而是"不知道自己写的会发生什么就按下了回车"。在真实工作里，一条没想清楚的语句可能误删整张表。从第一天起就练"先在脑子里跑一遍、再让机器跑"，这是你将来对数据负责的底气。</div>

<div class="csf-note">这一段动手练，请<strong>自己一个字一个字敲</strong>，别让 AI 替你生成再粘贴。建表和插入的肌肉记忆，只有亲手敲过才长得出来——AI 能在三秒内给你五条 INSERT，但它替不了你"看着 id 跳到 5 时那一下'原来如此'"。AI 这一讲的正确用法是：你敲完报错了，把报错原文贴给它问"这是什么意思"，而不是让它从头写。</div>

## 💡 自己复述一遍

合上屏幕，用一句话说出来：

> `CREATE TABLE` 是______（画图纸、定好每列的名字和类型），`INSERT INTO ... VALUES` 是______（按列名往表里放一行行真实数据），而带 `AUTOINCREMENT` 的主键 `id` 会______（自动编号，不用我管）。

能顺下来，这一讲的核心就握住了。

## 🔧 翻车现场

<div class="csf-card">
<strong>翻车 1：列的数量/顺序和值对不上</strong><br>
你写了 <code>INSERT INTO books (title, author) VALUES ('活着', '余华', 1993);</code> —— 列名给了 2 个，值却给了 3 个。报错：<code>table books has 2 columns but 3 values were supplied</code>。<br>
<strong>原因</strong>：列名和值必须一一对应、数量相等。<br>
<strong>解法</strong>：数一数括号里的列、再数一数值，让两边数量一致；顺序也要对应（第一个值给第一个列）。
</div>

<div class="csf-card">
<strong>翻车 2：漏给 NOT NULL 列赋值</strong><br>
你写了 <code>INSERT INTO books (title) VALUES ('活着');</code>，但 <code>author</code> 是 <code>NOT NULL</code>。报错：<code>NOT NULL constraint failed: books.author</code>。<br>
<strong>原因</strong>：被标了 <code>NOT NULL</code> 的列必须有值，不能空着。这不是 bug，是约束在<strong>正确地保护你</strong>——它替你拦住了一本没有作者的书。<br>
<strong>解法</strong>：把 <code>author</code> 也补上。报错里那句 <code>books.author</code> 已经精准告诉你是哪一列出了问题，学会读它。
</div>

<div class="csf-card">
<strong>翻车 3：不写列名直接插</strong><br>
有时为了少打几个字，会写成 <code>INSERT INTO books VALUES ('活着', '余华', 1993, 4.9);</code>（不写列名）。这看起来只给了 4 个值，但 <code>books</code> 表其实有 5 列（<code>id</code>、<code>title</code>、<code>author</code>、<code>year</code>、<code>rating</code>）。不写列名时，SQLite 会要求你按表里的真实顺序、把 5 列的值一个不少地都给齐，所以这条会直接报错：<code>table books has 5 columns but 4 values were supplied</code>（表 books 有 5 列，但只给了 4 个值）。<br>
更隐蔽的情况是：就算你凑巧给够了 5 个值，因为表的第一列其实是 <code>id</code>，这 5 个值会从 <code>id</code> 那一列开始往后排，于是书名被塞进了 <code>id</code>、作者被塞进了 <code>title</code>……整行错位，但 SQLite 不一定会报错，数据就这么悄悄存歪了。<br>
<strong>解法</strong>：永远显式写 <code>INSERT INTO books (列名...) VALUES (...)</code>。多打几个字，换来"改了表结构也不会悄悄插错"的安心，这笔买卖非常划算。
</div>

<div class="csf-card">
<strong>翻车 4：用了中文标点</strong><br>
把单引号打成了中文的 <code>‘活着’</code>，或逗号打成了 <code>，</code>。报错往往是看不懂的 <code>syntax error</code>。<br>
<strong>原因</strong>：SQL 只认英文半角标点。<br>
<strong>解法</strong>：写 SQL 时把输入法切到英文，引号、逗号、括号、分号全用半角。
</div>

## ✅ 自检三问

1. 我们的 `books` 表里，为什么 `title` 和 `author` 加了 `NOT NULL`，而 `year` 和 `rating` 没加？这背后是一个什么判断？
2. 插入时我没有给 `id` 赋值，它从哪来的、为什么我不该自己填？
3. `INSERT INTO books (title, author) VALUES (...)` 里，括号中列的顺序，必须和建表时的列顺序一样吗？（想一想，再回到例子里验证。）

<details class="csf-fold"><summary>看看思路（自己先想过再展开）<span class="csf-b csf-skim">可跳读</span></summary>
1. 因为在真实使用场景里，"一本没有书名或作者的书"根本说不通，必须拦住（这里说的"业务"就是指你这张表实际拿来干嘛、要记录什么——比如"记书"这件事本身，下面再出现"业务"都是这个意思）；而"暂时不知道哪年出版、还没评分"是合理的，所以允许空。<strong>加不加 NOT NULL，本质是你对"这列能不能缺"的判断——也就是看这张表实际要记什么</strong>，不是语法问题——这正是 AI 替不了你的地方。<br>
2. <code>id</code> 是 <code>AUTOINCREMENT</code> 自增主键，由 SQLite 自动分配且保证不重复；你自己填反而可能撞车或打乱它的计数。<br>
3. 不需要一样。<strong>只要你写的列名顺序和后面 VALUES 里的值顺序对应得上即可</strong>——这正是"显式写列名"的好处：你掌握配对关系，不依赖表的物理顺序。</details>

## 🚀 挑战

给自己留个真动手的小任务：

1. 用 `.schema books` 把建表语句再看一遍，确认你能逐行讲出每段含义（讲给空气听也行）。
2. 再插入 **2 本**你喜欢的书，这次故意制造一次翻车：先写一条**漏掉 `author`** 的 `INSERT`，亲眼看看那句 `NOT NULL constraint failed` 长什么样，再把它改对、插进去。
3. 最后 `SELECT * FROM books;`，数一数现在一共几行、`id` 排到了几。

<div class="csf-note">主动去踩一次坑、再亲手爬出来，比顺顺当当做对五遍记得牢得多。把报错当朋友，它每次都在精准地告诉你哪里需要修。</div>

## 📦 复制带走

<div class="csf-card">
<strong>1. 建表 = 画图纸。</strong> <code>CREATE TABLE 表名 (列名 类型 约束, ...)</code>。三种常用类型：整数 <code>INTEGER</code>、文字 <code>TEXT</code>、小数 <code>REAL</code>。<br>
<strong>2. 主键自增不用管。</strong> <code>id INTEGER PRIMARY KEY AUTOINCREMENT</code> 让每行有唯一编号，插入时别给它赋值，SQLite 自动 +1。<br>
<strong>3. 插入永远写列名。</strong> 用 <code>INSERT INTO 表 (列名...) VALUES (...)</code>，文字加英文单引号、数字不加；一次插多行就用逗号隔开多组 VALUES。<br>
<strong>4. NOT NULL 是判断，不是语法。</strong> 该不该让一列空着，取决于这张表实际要记什么（也就是它的真实用途）；这种判断只能来自你脑中的数据模型，AI 替不了。
</div>

下一讲（第04讲《查的艺术：SELECT / WHERE / ORDER BY / LIMIT》），我们就把这 5 本书"查出花来"——按条件筛、按评分排、只看前几名。你今天亲手存进去的数据，正是下一讲的练兵场。
