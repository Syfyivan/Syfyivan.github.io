---
title: "《计算机基本功路线图 · 数据库》第10讲 · 事务与 ACID：要么全做，要么全不做"
date: 2026-07-07 19:00:00
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

<div class="csf-key-note">想象你给朋友转账 100 块：你的余额要 <b>减 100</b>，朋友的余额要 <b>加 100</b>。这是两步。如果第一步做完、第二步还没做，手机就没电关机了——会怎样？钱凭空消失了。今天这一讲，就是教你用一个叫"事务"的东西，让这两步<b>捆在一起：要么全成功，要么当作什么都没发生</b>。这是数据库里最像"安全带"的一个概念。</div>

上一讲我们让查询快了一百倍，这一讲不谈快慢，谈**对不对、会不会出乱子**。很多人能写出能跑的 SQL，却从没想过"中途崩了怎么办"——而恰恰是这个问题，分开了"会写 SQL 的人"和"能对数据负责的人"。

## 🎯 这一讲你会学到什么

- 为什么"转账""下单"这类操作**必须打包成一个整体**，分开跑会出什么事故
- 怎么用 `BEGIN;` / `COMMIT;` / `ROLLBACK;` 把多条语句变成**不可分割的一组**
- ACID 四个字母分别在保证什么（用人话，不用背定义）
- 故意制造一次失败，亲眼看到数据库**把没做完的操作整个撤销**

<div class="csf-note">这一讲的动手部分非常重要，因为"事务有没有生效"光看代码是看不出来的，必须自己跑一遍、自己查一遍。<b>这段 SQL 请你自己敲、自己观察结果，别让 AI 替你跑</b>——AI 能告诉你"应该回滚了"，但只有你亲眼 <code>SELECT</code> 一次，才会真正信。</div>

## 🛠 跟我做

我们继续用前面几讲的 SQLite。如果你还没装，回顾一下第 02 讲；这里假设你已经能进入 `sqlite3` 命令行。

### 第一步：建一张"书"表，准备一点库存 <span class="csf-b csf-core">必读</span>

打开终端，新建一个练习数据库：

```bash
sqlite3 shop.db
```

进入后，建两张表：一张存书（含库存），一张存订单。

```sql
CREATE TABLE books (
  id    INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  stock INTEGER NOT NULL CHECK (stock >= 0)
);

CREATE TABLE orders (
  id      INTEGER PRIMARY KEY,
  book_id INTEGER NOT NULL,
  qty     INTEGER NOT NULL
);

INSERT INTO books (title, stock) VALUES ('深入浅出数据库', 3);
```

这几个英文词如果还眼生，先快速对个号（都是第 04 讲讲过的，忘了可以回去翻，这里不用背）：`INTEGER` = 这一列存整数、`TEXT` = 这一列存文字、`PRIMARY KEY`（主键）= 每条记录的唯一编号，不会重复、`NOT NULL` = 这一列不能空着、必须填值。知道每个词大概在干嘛就行，照着敲不会错。

再单独看 `books` 表那行 `CHECK (stock >= 0)`：它规定**库存不允许变成负数**。这个小约束待会儿会成为我们"故意制造错误"的关键，先记住它。

先看一眼初始状态：

```sql
SELECT * FROM books;
```

你会看到库存是 **3**。好，现在我们要模拟"卖出一本书"。

### 第二步：理解"下单"其实是两步 <span class="csf-b csf-key">重点</span>

卖出一本书，要做两件事，**缺一不可**：

1. 在 `orders` 里插一条订单记录（谁买了、买了几本）
2. 把 `books` 里这本书的 `stock` 减 1

如果只做第 1 步不做第 2 步：库存没减，这本书会被**超卖**。<br>如果只做第 2 步不做第 1 步：库存减了，却没有订单——**货发不出去也对不上账**。

所以这两步必须**同生共死**。这就是事务要解决的事。

### 第三步：先用事务走一遍"正常下单" <span class="csf-b csf-core">必读</span>

事务的语法就三个词：

- `BEGIN;` —— 开始记账，从这里起的改动先"挂起"，还没真正落定
- `COMMIT;` —— 确认，把这一组改动**一次性全部落定**
- `ROLLBACK;` —— 反悔，把 `BEGIN` 之后的改动**整组撤销**，当作没发生过

我们先走正常流程。**先猜一下**：执行下面这组之后，库存会是几？

```sql
BEGIN;
INSERT INTO orders (book_id, qty) VALUES (1, 1);
UPDATE books SET stock = stock - 1 WHERE id = 1;
COMMIT;
```

猜好了再查：

```sql
SELECT * FROM books;
SELECT * FROM orders;
```

库存应该从 3 变成了 **2**，并且 `orders` 里多了一条记录。两步都生效了——因为我们 `COMMIT` 了。

### 第四步：故意制造失败，看 ROLLBACK 救场 <span class="csf-b csf-core">必读</span>

现在到了最关键的实验。我们假设程序运行到一半出了岔子——比如算错了数量，想一次扣掉 5 本，但库存只剩 2 本，会撞上我们设的 `CHECK (stock >= 0)`。

**先猜**：下面这组执行完，库存会变成多少？订单会多出来吗？

```sql
BEGIN;
INSERT INTO orders (book_id, qty) VALUES (1, 5);
UPDATE books SET stock = stock - 5 WHERE id = 1;
```

执行第二条 `UPDATE` 时，SQLite 会报错，类似：

```
Runtime error: CHECK constraint failed: stock >= 0
```

库存要变成 `2 - 5 = -3`，违反了约束，这条 `UPDATE` 失败了。但**注意**：此时第一条 `INSERT` 已经执行过了——订单可能已经被写进去了，事务还开着没结束。这正是"做了一半"的危险状态。

现在我们**反悔**，把整组撤销：

```sql
ROLLBACK;
```

然后查验，看看到底有没有留下脏数据（脏数据 = "做了一半、对不上账"的烂账记录，比如有订单却没扣库存，不是病毒）：

```sql
SELECT * FROM books;
SELECT * FROM orders;
```

<div class="csf-note">你应该看到：库存还是 <b>2</b>（没变成 -3，也没莫名其妙少 5），<code>orders</code> 里<b>也没有</b>那条 qty=5 的脏订单——哪怕刚才那条 INSERT 已经"跑过"了，<code>ROLLBACK</code> 把它一起撤销了。这就是事务的威力：<b>BEGIN 之后的所有改动，是一个整体，要么一起留下，要么一起消失。</b></div>

如果你不用事务，把这两条语句各跑各的，那条 `INSERT` 一旦成功就**真的写进去了**，后面 `UPDATE` 失败也撤不回来——你的库里就会躺着一条"有订单、库存却没动"的脏数据。这就是这一讲要让你刻进肌肉记忆的对比。

<details class="csf-fold"><summary>为什么 SQLite 里有时候"忘了 BEGIN"也好像有事务？<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
SQLite 默认是"自动提交"模式：你单独跑一条 INSERT，它其实是被悄悄包进一个只含这一条语句的小事务里，跑完立刻 COMMIT。所以单条语句天然是原子的（原子 = 不可拆分，要么整条成功、要么整条失败，不会只做一半）。<br>但我们关心的是<b>多条语句</b>的整体性——这就必须自己写 <code>BEGIN ... COMMIT</code> 把它们框起来，告诉数据库"这几条是一伙的"。不写 BEGIN，它们就是各自独立的小事务，互不保命。</details>

## 💡 自己复述一遍

合上屏幕，用一句话说说看：**为什么转账、下单这种操作要用事务？**

参考答案（先自己说，再看）：因为它们由多步组成，而这些步必须同生共死；事务能保证"要么全做，要么全不做"，绝不留下做了一半的脏数据。

## 🔧 翻车现场

**翻车一：把该捆在一起的步骤分开各跑各的。** <span class="csf-b csf-key">重点</span><br>这是本讲头号大坑。你写了 `INSERT` 订单、又写了 `UPDATE` 库存，但没有 `BEGIN`/`COMMIT` 框住它们。平时风平浪静看不出问题，可一旦第一条成功、第二条失败（断网、崩溃、约束报错……），就出现"钱扣了货没发""有订单库存没减"的脏数据。**原因**：没有事务，每条语句都是独立的，前一条不会因为后一条失败而撤销。**解法**：凡是"多步必须同生共死"的逻辑，一律用 `BEGIN ... COMMIT` 包起来，中途任何一步出错就 `ROLLBACK`。

**翻车二：`BEGIN` 了却忘了 `COMMIT`。**<br>你开了事务、改了数据，却既没 `COMMIT` 也没 `ROLLBACK` 就直接退出了 `sqlite3`（也就是关掉了这次和数据库的对话，前面我们敲 `sqlite3 shop.db` 进去、操作完退出，这一来一回就叫一次"连接"）。这些改动**不会落定**，下次一看数据没变，以为"代码没生效"。**解法**：记住事务一定要有结尾——成功 `COMMIT`，失败 `ROLLBACK`，二选一，别让它悬着。

**翻车三：以为 `ROLLBACK` 能撤销"已经 COMMIT 的东西"。**<br>`ROLLBACK` 只能撤销**本次** `BEGIN` 之后、还没 `COMMIT` 的改动。一旦 `COMMIT`，数据就真的落定了，再 `ROLLBACK` 也回不来。**解法**：`COMMIT` 之前是你反悔的最后机会，确认无误再提交。

## ✅ 自检三问

1. `COMMIT` 和 `ROLLBACK` 分别是什么意思？什么时候各用哪个？
2. 如果一个事务里有 3 条语句，第 2 条执行失败了，你 `ROLLBACK` 之后，第 1 条的改动还在吗？为什么？
3. 用你自己的话解释 ACID 里的 **A（原子性）**：它到底在保证什么？

<details class="csf-fold"><summary>顺手把 ACID 四个字母一次讲清<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
ACID 是事务的四条承诺，别死背，理解它在防什么事就行：<br><b>A 原子性（Atomicity）</b>：一组操作是不可分割的整体，要么全做要么全不做——就是我们今天演示的 ROLLBACK。<br><b>C 一致性（Consistency）</b>：事务结束后，数据要满足你定的规则（比如库存不为负、账目两边对得上）。我们那条 CHECK 约束就是一致性的守门员。<br><b>I 隔离性（Isolation）</b>：多个事务同时跑时，互相不会看到对方"做了一半"的中间状态，就像各自在单独房间里操作。<br><b>D 持久性（Durability）</b>：一旦 COMMIT 成功，数据就真的写进了磁盘，哪怕下一秒断电也丢不了。<br>这四条里，A 是这一讲的主角，C 你在第 04 讲的约束里已经见过，I 和 D 在并发和数据落盘时才真正发威，未来你做后端会反复打交道。</details>

## 🚀 挑战

给自己出一道题，**自己写、自己验**：

在 `shop.db` 里再插一本书（库存随便设，比如 5 本）。然后写一个事务，模拟"一次买 2 本不同的书"——也就是要**插两条订单、改两本书的库存，共 4 条语句**。先正常 `COMMIT` 一次，查验库存是否各减了对应数量。

进阶：再写一个事务，故意让第 4 条语句撞上 `CHECK` 约束失败（比如某本书库存不够），然后 `ROLLBACK`，**预测并验证**：前面 3 条的改动是不是全都没留下？把你猜的和实际查到的对一下。

<div class="csf-note">做这个挑战时，每一步执行前都先<b>猜一下结果</b>，再 <code>SELECT</code> 验证。SQL 你自己写——如果卡住了，可以让 AI 解释"事务为什么这样设计"，但<b>别让它直接把答案 SQL 给你抄</b>。亲手写错一次、查一次、改对一次，胜过看十遍正确答案。</div>

## 📦 复制带走

<div class="csf-card"><b>这一讲的肌肉记忆：</b><br>1. <b>事务 = 把多步捆成一个整体</b>：<code>BEGIN;</code> 开始、<code>COMMIT;</code> 全部落定、<code>ROLLBACK;</code> 整组撤销。<br>2. <b>凡是"多步必须同生共死"的逻辑（转账、下单……），一律用事务包起来</b>——不然中途崩了就留脏数据。<br>3. <code>ROLLBACK</code> 只能撤销本次还没 <code>COMMIT</code> 的改动；提交之后就反悔不了。<br>4. <b>ACID 里 A（原子性）是核心</b>：要么全做，要么全不做，数据库永远不该停在"做了一半"的状态。</div>

下一讲我们进入这门课的收尾：第 11 讲《范式直觉 + 综合实战：设计一个不埋雷的数据库》，把前面学的表、约束、索引、事务全用上，亲手设计一个经得起推敲的小型数据库。
