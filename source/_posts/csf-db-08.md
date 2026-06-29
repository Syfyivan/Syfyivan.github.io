---
title: "《计算机基本功路线图 · 数据库》第08讲 · JOIN：把拆开的表重新拼回来"
date: 2026-07-07 17:00:00
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

<div class="csf-key-note">上一讲我们把"一张表装不下整个世界"的东西拆成了好几张表：顾客是顾客，书是书，订单只记下"谁买了哪本"的编号。拆得很干净，可问题也来了——老板要看一张报表："每笔订单是谁买的、买了什么、花了多少钱"，这些信息现在散在三张表里。<strong>JOIN 就是把拆开的表，沿着主键-外键这条线，重新拼回成一张完整的表来查。</strong>这一讲你会亲手拼一次。</div>

## 🎯 这一讲你会学到什么

- 为什么"拆表"之后必须有 JOIN，它到底在拼什么；
- 一条最常用的写法：`A JOIN B ON A.外键 = B.主键`，以及怎么连第三张表；
- `INNER JOIN`（内连接）和 `LEFT JOIN`（左连接）的差别，什么时候该选哪个；
- 表别名（`c`、`o`、`b`）怎么让长查询变清爽；
- 怎么一眼看出 AI 写的 JOIN 漏了 `ON`、会炸成"笛卡尔积"。

<div class="csf-note">这一讲会让你敲不少 SQL。<strong>请一行一行自己敲，别让 AI 代写。</strong>JOIN 是数据库里最容易"看懂了，一上手就错"的地方——只有你自己拼错过一次、看到结果行数爆炸，再亲手改对，这个手感才真正长在你身上。AI 可以在你卡住时解释报错，但别让它替你写第一遍。</div>

## 🛠 跟我做

### 第 0 步：把三张表建好 <span class="csf-b csf-core">必读</span>

为了让你能独立把这一讲跑通，我们重新建一套干净的小数据。打开终端，进入 SQLite（前面几讲装过，没装的话回第02讲）：

```bash
sqlite3 join_demo.db
```

进去后，把下面这段**整段**粘进去。它建三张表，并填好数据：

```sql
-- 顾客表：每位顾客一行
CREATE TABLE customers (
  id   INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT
);

-- 书表：每本书一行
CREATE TABLE books (
  id    INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  price REAL NOT NULL   -- REAL 就是带小数的数字，比如 59.0；TEXT 是文字
);

-- 订单表：每笔订单一行，靠 customer_id / book_id 指向上面两张表
CREATE TABLE orders (
  id          INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  book_id     INTEGER NOT NULL,
  qty         INTEGER NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (book_id)     REFERENCES books(id)
);

INSERT INTO customers (id, name, city) VALUES
  (1, '小满', '杭州'),
  (2, '阿杰', '成都'),
  (3, '林夕', '广州'),
  (4, '老周', '西安');  -- 老周注册了，但一笔订单都没下

INSERT INTO books (id, title, price) VALUES
  (1, '深入浅出SQL', 59.0),
  (2, '算法图解',   79.0),
  (3, '代码大全',   128.0);

INSERT INTO orders (id, customer_id, book_id, qty) VALUES
  (1, 1, 1, 2),   -- 小满 买 2 本《深入浅出SQL》
  (2, 1, 3, 1),   -- 小满 又买 1 本《代码大全》
  (3, 2, 2, 1),   -- 阿杰 买 1 本《算法图解》
  (4, 3, 1, 1);   -- 林夕 买 1 本《深入浅出SQL》
```

注意：`orders` 表里**只有编号**，没有顾客名、没有书名、没有价格。这正是上一讲教的"拆表"——同一个信息只存一份，要用的时候再连回去。

<div class="csf-why">为什么不直接在 orders 里也存一份顾客名和书价？因为那样书一改价、顾客一改名，订单里的就成了过期的假数据，还到处对不上。拆开存、用 JOIN 连，才是"一份事实只有一个地方说了算"。这是上一讲主外键设计的延续。</div>

<div class="csf-note">先说一件容易让你以为"自己敲错了"的事：<strong>SQLite 默认的查询结果是用竖线 <code>|</code> 把每列隔开、而且不显示标题行的</strong>，长这样 <code>1|小满|深入浅出SQL</code>。本讲后面有些结果我特意排成了对齐、带「订单号/顾客/书名」表头的漂亮表格，方便你看清每列是什么。如果你也想看到那种样子，进 SQLite 后先敲这两条命令（它俩是给 SQLite 改显示样式的开关，敲一次本次会话一直有效）：<br><br><code>.mode column</code> —— 让各列对齐成表格<br><code>.headers on</code> —— 把每列的标题显示出来<br><br>不敲也完全没关系，竖线样式的结果一样是对的，只是没那么好看。下面凡是带表头的结果，都是敲过这两条命令后的样子；只有竖线的，就是默认样子。两边对不上不是你的错，是显示开关没打开而已。</div>

### 第 1 步：先猜一下 <span class="csf-b csf-key">重点</span>

我们的目标是查出这样一张表：**每笔订单 → 谁买的 → 买的哪本 → 单价多少 → 这笔一共花多少钱**。

先别看下面。`orders` 有 4 行，那么这张拼出来的报表应该有几行？每行长什么样？在心里（或纸上）写下你的猜测，再往下。

### 第 2 步：连两张表，先把"谁买的"拼上 <span class="csf-b csf-core">必读</span>

我们一步步来，先只连 `orders` 和 `customers`，把订单和顾客名对上：

```sql
SELECT orders.id, customers.name
FROM orders
JOIN customers ON orders.customer_id = customers.id;
```

读法很重要，从左往右念：**从 orders 出发，去连 customers，连接的条件是"orders 里的 customer_id 等于 customers 里的 id"**。这个 `ON` 后面的等式，就是把两张表对齐的"线"——它正是上一讲说的外键指向主键。

运行，你会看到：

```
1|小满
2|小满
3|阿杰
4|林夕
```

4 笔订单，4 行，每行的顾客名都对上了。`ON` 做的事就是：拿 orders 的每一行，去 customers 里找 `id` 跟它 `customer_id` 相等的那一行，配成一对。

### 第 3 步：再连第三张表，把书名和价格也拼上 <span class="csf-b csf-core">必读</span>

连第三张表，就是再写一句 `JOIN ... ON ...`。同时我们给表起**别名**（`o`、`c`、`b`），不然每个字段前都写全名太啰嗦：

```sql
SELECT
  o.id            AS 订单号,
  c.name          AS 顾客,
  b.title         AS 书名,
  b.price         AS 单价,
  o.qty           AS 数量,
  b.price * o.qty AS 金额
FROM orders AS o
JOIN customers AS c ON o.customer_id = c.id
JOIN books     AS b ON o.book_id     = b.id;
```

`orders AS o` 的意思是"接下来 `o` 就代表 orders 表"。`AS 订单号` 则是给输出的列改个中文标题。先猜：结果几行？金额那一列你能口算出来吗？

揭晓：

```
订单号  顾客  书名          单价   数量  金额
1       小满  深入浅出SQL    59.0   2     118.0
2       小满  代码大全       128.0  1     128.0
3       阿杰  算法图解       79.0   1     79.0
4       林夕  深入浅出SQL    59.0   1     59.0
```

成了。散在三张表里的信息，被 JOIN 沿着两条"线"重新拼成了一张完整的报表。`b.price * o.qty` 还顺手算出了每笔的金额——这就是上一讲拆表、这一讲连表的完整闭环。

<div class="csf-note">规律记住：<strong>连接键，连的就是"外键 = 主键"。</strong>orders 的 customer_id（外键）连 customers 的 id（主键），orders 的 book_id（外键）连 books 的 id（主键）。要连几张表，就接几句 ON。这条线写错，整张报表就全乱。</div>

### 第 4 步：LEFT JOIN——找出"一笔都没下过的顾客" <span class="csf-b csf-key">重点</span>

刚才的 `JOIN`（全称 `INNER JOIN`，内连接）只会留下**两边都能配上对**的行。所以老周——注册了但没下单——在上面所有结果里**根本不出现**，因为 orders 里没有他的订单去跟他配对。

可老板偏偏想知道：**哪些顾客一笔都没买过？** 这时要用 `LEFT JOIN`（左连接）。它的脾气是：**左边那张表的每一行都保留，右边配不上的就用空值（NULL）补。**

先猜：下面这句以 customers 为左表去连 orders，结果会有几行？老周那行的 `o.id` 会是什么？

```sql
SELECT c.name, o.id AS 订单号
FROM customers AS c
LEFT JOIN orders AS o ON c.id = o.customer_id;
```

揭晓：

```
小满|1
小满|2
阿杰|3
林夕|4
老周|       <- 订单号是空的（NULL）
```

看到没？老周被保留下来了，但他没订单，所以订单号那格是空的。这正是 LEFT 和 INNER 的关键差别：**INNER 会把老周丢掉，LEFT 会把他留下、用 NULL 占位。**

那"一笔都没下过的顾客"怎么精确捞出来？就是筛出"订单号为空"的行——下单的人这一格不可能为空：

```sql
SELECT c.name
FROM customers AS c
LEFT JOIN orders AS o ON c.id = o.customer_id
WHERE o.id IS NULL;
```

结果只剩：

```
老周
```

<div class="csf-note">"找出没有对应记录的一方"是 LEFT JOIN 最经典的用法：<strong>LEFT JOIN 把人全留下，再用 <code>WHERE 右表的键 IS NULL</code> 把"配不上对"的那些挑出来。</strong>没下单的顾客、没人买的书、没交作业的学生——全是这个套路。判断 NULL 要用 <code>IS NULL</code>，不能写 <code>= NULL</code>，这个第04讲提过。</div>

<details class="csf-fold"><summary>还有 RIGHT JOIN、FULL JOIN 吗？<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
理论上有四种：INNER（只留两边都配上的）、LEFT（左表全留）、RIGHT（右表全留）、FULL（两边都全留）。但实战里 <strong>90% 的场景只用 INNER 和 LEFT 就够了</strong>——RIGHT 永远可以把两张表调个位置写成 LEFT，所以很多人干脆不用它。<br>另外提一句：SQLite 早期版本只支持到 LEFT JOIN，新版本才补上 RIGHT/FULL。现在你只要把 INNER 和 LEFT 这两把刀练到顺手，绝大多数报表都能拼出来。剩下两种等你真遇到了再查文档，不急。</details>

## 💡 自己复述一遍

合上屏幕，用一句话回答：**JOIN 是干嘛的，它靠什么把两张表对齐？**

参考（先自己说，再看）：JOIN 是把拆开存的多张表，沿着 `ON` 指定的"外键 = 主键"这条线重新拼成一张表来查；INNER 只留两边都配上对的行，LEFT 把左表全留下、右边配不上的用 NULL 补。

## 🔧 翻车现场

### 翻车一：漏写 ON，结果炸成"笛卡尔积" <span class="csf-b csf-core">必读</span>

这是 JOIN 的头号杀手。试试看（先猜：customers 有 4 行，orders 有 4 行，下面这句没写 ON，结果会有几行？）：

```sql
SELECT c.name, o.id
FROM customers AS c
JOIN orders AS o;        -- 故意不写 ON
```

结果是 **4 × 4 = 16 行**！因为没告诉数据库"按什么对齐"，它就把左表每一行和右表每一行**两两组合**了一遍——这堆东西叫"笛卡尔积"，里面绝大多数是毫无意义的乱配（比如老周配上了小满的订单）。

<div class="csf-why">为什么会这样？数据库不会猜你的意图。你不给配对条件，它的默认行为就是"全都配一遍"。两张几万行的表这么一乘，就是几亿行，查询直接卡死、机器内存爆掉——线上事故很多就是这么来的。<strong>看到结果行数异常多，第一反应永远是：ON 写了吗？写对了吗？</strong></div>

加回 `ON o.customer_id = c.id`，立刻回到正常的 4 行。记住：**有几张表 JOIN，就该有相应数量的 ON 条件把它们一条条串起来**，少一条就少对齐一层，结果就乘起来。

### 翻车二：ON 的字段连错方向

写成 `ON o.customer_id = c.name` 或者把两个表的 id 互相连错，SQLite 不一定报错，但结果会安静地全错——配不上的行直接消失或乱配。**连接键两边必须是"在讲同一件事"的字段**：customer_id 对的是 customers 的 id，绝不是 name，也不是 books 的 id。

### 翻车三：用了 LEFT JOIN，却被 WHERE 偷偷变回 INNER

新手很容易踩：你想"保留所有顾客"，于是用了 LEFT JOIN，却又在 WHERE 里写了对右表的普通筛选，比如 `WHERE o.qty > 0`。这样一来，老周那行（qty 是 NULL）被 WHERE 过滤掉了，LEFT JOIN 白用了——效果退化成 INNER。**LEFT JOIN 想保住"配不上的那些行"，对右表的条件要小心，别在 WHERE 里把 NULL 行筛没了。**（进阶写法是把条件挪到 ON 里，以后会讲，现在先知道这个坑。）

## ✅ 自检三问

1. INNER JOIN 和 LEFT JOIN 查同样两张表，什么情况下结果**行数不一样**？请用"老周"举例说清楚。
2. 一句 `A JOIN B ON A.x = B.y`，这里的 `x` 和 `y` 通常分别扮演什么角色（提示：外键、主键）？
3. 你拿到一条 AI 写的三表 JOIN，跑出来几十万行、明显不对。你会**第一个**检查什么？为什么？

## 🚀 挑战

全部自己动手，不准让 AI 代写（卡住了可以让它解释报错，但 SQL 自己敲）：

1. **统计每位顾客的消费总额**：用 JOIN 连 orders 和 books，再配合前面学过的 `GROUP BY`（第06讲）和 `SUM`，算出每位顾客一共花了多少钱。先猜小满应该是多少（118 + 128），再验证。你可能会纠结：题目说"每位顾客"，可顾客名字明明在 customers 表里，为什么只让连 orders 和 books？说清楚——顾客编号 `customer_id` 本来就存在 orders 这张表里，按它 `GROUP BY` 就能把每位顾客的订单分到一组、各自求和，所以这题不连 customers 也能区分出每位顾客（只是结果里显示的是编号 1/2/3，不是名字）。如果你想让结果直接显示顾客名字，那就再连上 customers 这张表，多写一句 `JOIN customers ...` 即可。两种做法都对。
2. **找出"一本都没被买过的书"**：仿照"没下单的顾客"那套，这次以 books 为左表 LEFT JOIN orders，再 `WHERE ... IS NULL`。猜猜会是哪本？
3. **加一笔脏数据再排查**：脏数据，就是不干净、对不上的数据——比如一笔订单的顾客编号指向了一个根本不存在的顾客，连过去找不到人。我们故意造一笔：手动 `INSERT` 一笔 `customer_id = 99`（数据库里压根没有编号 99 这位顾客）的订单，然后分别用 INNER JOIN 和 LEFT JOIN（以 orders 为左表）连 customers，观察这笔订单在两种结果里出现还是消失，想清楚为什么。这能帮你真正理解两种 JOIN 的"去留规则"。

把第 1 题你写出的 SQL 存下来，下一讲会用它当例子。

## 📦 复制带走

<div class="csf-card"><strong>JOIN = 把拆开的表拼回来。</strong>上一讲拆表是为了"一份事实只存一处"，这一讲 JOIN 沿着 <code>ON 外键 = 主键</code> 这条线把它们重新连成一张完整的表来查。<br><br><strong>INNER 只留配上对的，LEFT 把左表全留、配不上的补 NULL。</strong>"找出没有对应记录的一方"（没下单的顾客、没人买的书）就用 <code>LEFT JOIN ... WHERE 右表键 IS NULL</code>。<br><br><strong>连几张表就接几句 ON。</strong>表别名（<code>o</code> / <code>c</code> / <code>b</code>）让长查询清爽，<code>AS</code> 还能给输出列改标题。<br><br><strong>结果行数暴增，第一反应查 ON。</strong>漏写或写错 ON 会炸成笛卡尔积（每行两两相乘），这是审查 AI 生成 SQL 时最该警惕的红灯。</div>

下一讲（第09讲）我们换个问题：当表里的数据从 4 行变成 400 万行，同样一条查询为什么会突然慢得让人抓狂——又怎么靠**索引**让它快回一百倍。
