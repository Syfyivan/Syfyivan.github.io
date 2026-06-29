---
title: "《计算机基本功路线图 · 数据库》第07讲 · 表设计与主外键：一张表装不下整个世界"
date: 2026-07-07 16:00:00
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

<div class="csf-key-note">前六讲我们一直在和**一张表**打交道：书店里的 <code>books</code>。但真实世界从来不是一张表能装下的——书店除了书，还有**顾客**，还有**订单**。如果硬把这些都塞进一张表，你会得到一张又宽又乱、改一处错一片的"灾难表"。这一讲我们学会一件事：<strong>把一张大表，拆成几张各司其职的小表，再用外键把它们正确地连起来。</strong>这是数据库设计真正的开始。</div>

## 🎯 这一讲你会学到什么

- 看一眼就能闻出"一张表里塞了好几类东西"的**坏味道**（数据冗余）。
- 理解什么叫**一对多关系**：一个顾客可以下很多张订单。
- 学会**拆表**：让每张表只负责描述"一类事物"。
- 用**外键（foreign key）**把表连起来，并打开 SQLite 的外键开关，亲眼看见它如何**拒绝**一条非法数据。
- 学会画一张**关系示意图**（也叫 ER 图，ER 是英文 Entity-Relationship 的缩写，就是"实体关系"的意思，说白了就是"谁和谁有关系"的草图）：把每张表画成一个方块，表之间用一条线连起来，一眼看出它们是怎么靠编号关联的。

<div class="csf-note">这一讲会动手建两张新表、故意制造一次失败。请打开终端，跟着敲——光看是学不会表设计的，手感全在敲的过程里。前面几讲建好的 <code>bookstore.db</code> 和 <code>books</code> 表我们还要继续用。</div>

## 🛠 跟我做

### 先看一张"灾难表"长什么样 <span class="csf-b csf-core">必读</span>

假设你刚学会建表，兴冲冲想记录"谁买了哪本书"。一个很自然（但错误）的念头是：**反正都是订单信息，塞进一张表不就行了？**

于是你建了这样一张 `orders_bad` 表：

```
id | customer_name | customer_phone | customer_city | book_title      | price | order_date
---+---------------+----------------+---------------+-----------------+-------+-----------
 1 | 张三           | 13800000001    | 杭州           | 活着             | 45.0  | 2026-06-01
 2 | 张三           | 13800000001    | 杭州           | 三体             | 59.0  | 2026-06-03
 3 | 张三           | 13800000001    | 杭州           | 小王子           | 28.0  | 2026-06-05
 4 | 李四           | 13800000002    | 上海           | 活着             | 45.0  | 2026-06-06
```

**先猜后做**：张三在这张表里出现了几次？如果有一天张三换了手机号，你要改几行？再想想：万一你改第 1 行的时候手滑没改第 2 行，会发生什么？

<div class="csf-why">猜到了吧——张三出现了 <strong>3 次</strong>，手机号也跟着重复存了 3 份。换号要改 3 行，<strong>漏改一行</strong>，数据库里就同时存在"张三两个手机号"的矛盾，而数据库根本不知道哪个是对的。这种"同一份信息被重复存好多遍"的现象，就叫<strong>数据冗余（redundancy）</strong>。冗余不只是浪费空间，它真正的毒在于：<strong>一处事实，多处存储，迟早不一致。</strong></div>

这张表的根本病因是：**它想一个人干三个人的活**。它既想描述"顾客是谁"，又想描述"书是什么"，还想描述"这一单买了啥"。一张表塞了三类事物，于是顾客信息和书的信息都被迫跟着订单一遍遍重抄。

### 治病的思路：一张表只描述一类事物 <span class="csf-b csf-key">重点</span>

正确的做法，是把三类事物拆到三张表里：

<div class="csf-legend"><strong>📒 books</strong>：只描述"书"——书名、价格。每本书只存一行。<br><strong>👤 customers</strong>：只描述"顾客"——姓名、电话、城市。每个顾客只存一行。<br><strong>🧾 orders</strong>：只描述"哪个顾客、在哪天、买了哪本书"。它<strong>不重抄</strong>顾客姓名和书名，只记下"是谁"和"是哪本"的<strong>编号</strong>。</div>

关键就在最后这句：`orders` 表里不再写"张三""活着"这种文字，而是写 `customer_id = 1`、`book_id = 3` 这样的**编号**。想知道顾客叫什么、书叫什么？顺着编号去对应的表里查一次就好。这个"指向另一张表某一行"的编号，就是**外键**。

<div class="csf-note"><strong>一对多关系</strong>：一个顾客可以下<strong>很多</strong>张订单，但一张订单只属于<strong>一个</strong>顾客。这种"一边是一，另一边是多"的关系，就叫一对多。它在现实里到处都是：一个作者写多本书、一个班级有多个学生、一个用户发多条评论。学会识别一对多，你就抓住了表设计的大半。</div>

### 动手：建 customers 和 orders 两张表 <span class="csf-b csf-core">必读</span>

打开终端，进入上一讲的数据库（如果文件不在当前目录，换成你自己的路径）：

```bash
sqlite3 bookstore.db
```

进入 `sqlite>` 提示符后，**第一件事**——打开外键开关。这一步极其重要，等会儿解释为什么：

```sql
PRAGMA foreign_keys = ON;
```

<div class="csf-note"><strong>PRAGMA 是个啥？</strong> 它是 SQLite 专门用来调整自身设置的一类命令（你可以把它理解成 SQLite 的"设置开关面板"），和你平时写的 <code>SELECT</code>、<code>INSERT</code> 这种操作数据的命令不一样——PRAGMA 改的是数据库的行为参数。照着原样敲、大写 <code>PRAGMA</code> 就行。这里这句话的意思就是：把"是否强制检查外键"这个开关拨到"开"。</div>

<div class="csf-why"><strong>为什么必须手动开？</strong> 出于历史兼容原因，SQLite <strong>默认不强制外键约束</strong>——也就是说，不开这个开关，你写的外键就只是一句"注释"，数据库不会真的去检查。每次新连接进来都要重新开一次（它不是永久设置）。很多新手以为自己设了外键就高枕无忧，结果脏数据照进不误，根子就在这里。<strong>请养成"连上就先 ON"的肌肉记忆。</strong></div>

接着建顾客表。请你**先自己读一遍这段 SQL，再敲**——别让 AI 替你生成，你要的是亲手写出表结构的手感：

```sql
CREATE TABLE customers (
    id    INTEGER PRIMARY KEY,
    name  TEXT    NOT NULL,
    phone TEXT,
    city  TEXT
);
```

再建订单表。注意最后两行的 `FOREIGN KEY`，这是这一讲的主角：

```sql
CREATE TABLE orders (
    id          INTEGER PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    book_id     INTEGER NOT NULL,
    order_date  TEXT    NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (book_id)     REFERENCES books(id)
);
```

逐句读懂这段（这是本讲最该看懂的几行）：

- `customer_id INTEGER` ——这一列存的是**顾客的编号**，不是顾客的名字。
- `FOREIGN KEY (customer_id) REFERENCES customers(id)` ——这句话在向数据库**郑重声明**："`orders.customer_id` 里的每个值，都必须是 `customers` 表里真实存在的 `id`。"
- 同理，`book_id` 必须指向 `books` 表里真实存在的书。

<div class="csf-note"><strong>主键 vs 外键，一句话分清：</strong> 主键（PRIMARY KEY）是一张表给自己每一行发的<strong>身份证号</strong>，本表内唯一；外键（FOREIGN KEY）是一张表里<strong>指向别张表身份证号</strong>的那一列。<code>customers.id</code> 是 customers 的主键；<code>orders.customer_id</code> 是 orders 的外键，它指向前者。</div>

### 填点真实数据进去 <span class="csf-b csf-key">重点</span>

先放两个顾客：

```sql
INSERT INTO customers (id, name, phone, city) VALUES
  (1, '张三', '13800000001', '杭州'),
  (2, '李四', '13800000002', '上海');
```

下面要给张三建订单。这里假设你的 `books` 表里 id=1 和 id=3 的书是存在的（前几讲建过）。可以先查一眼确认：

```sql
SELECT id, title FROM books;
```

确认好书的编号后，下三张订单——注意，**全是编号，没有一个字的姓名或书名**：

```sql
INSERT INTO orders (customer_id, book_id, order_date) VALUES
  (1, 1, '2026-06-01'),
  (1, 3, '2026-06-03'),
  (2, 1, '2026-06-06');
```

<div class="csf-note"><strong>等一下，订单怎么不写 id 了？</strong> 你大概注意到了：前面插顾客时我们手动写了 id（<code>(1, '张三'...)</code>、<code>(2, '李四'...)</code>），可这里插订单却一个 id 都没写。你没抄漏，这是故意的。两张表的 id 列都是 <code>INTEGER PRIMARY KEY</code>，SQLite 对这种列有个贴心规则：<strong>你不写它，数据库就自动从 1 开始往上编号</strong>（1、2、3……）。所以订单的 id 会被自动填成 1、2、3。前面给顾客手动写 id，只是想让张三正好是 1 号、李四正好是 2 号，方便下面对照讲解；其实顾客那边不写 id、让它自动生成，效果完全一样。两种写法都对，自己写时省略 id 更省事。</div>

对比一下开头那张 `orders_bad`：同样是三张订单，这里"张三"两个字一次都没重复写，他的手机号只在 `customers` 表里**存了唯一一份**。哪天张三换号，你只改 `customers` 里那**一行**，所有订单自动"看到"新号码。这就是拆表的回报。

### 把这三张表的连线画出来 <span class="csf-b csf-key">重点</span>

开头说过，这一讲要学会画一张**关系示意图**（ER 图）。现在三张表都建好了，我们就把它们之间的连线画出来。不用任何画图工具，用文字就能画——你也可以照着在纸上描一遍：

```
┌───────────┐          ┌───────────┐          ┌───────────┐
│ customers │          │  orders   │          │  books    │
│-----------│          │-----------│          │-----------│
│ id (主键) │◄──────── │customer_id│ ────────►│ id (主键) │
│ name      │  1 对 多  │ book_id   │  多 对 1  │ title     │
│ phone     │          │ order_date│          │ price     │
│ city      │          │ id (主键) │          │           │
└───────────┘          └───────────┘          └───────────┘
```

这张图怎么读：

- 中间的 `orders` 表，靠两根线分别连到左右两张表。
- **箭头永远从"外键"指向它引用的"主键"。** 左边这根线：`orders.customer_id`（外键）指向 `customers.id`（主键），意思是"这一单是哪个顾客下的"。右边这根线：`orders.book_id`（外键）指向 `books.id`（主键），意思是"这一单买的是哪本书"。
- 线上标的"1 对 多"提醒你关系的方向：**一个**顾客可以对应 `orders` 里的**很多**行（下很多单），反过来一行订单只对应**一个**顾客。`books` 那侧同理：一本书可以被很多张订单买到。

<div class="csf-note">记住这张图的画法，以后每设计一组表，你都可以先在纸上画方块、连箭头：<strong>方块是表，箭头从外键出发、扎进它引用的主键。</strong> 能把图画出来，说明你已经想清楚"谁和谁有关系、靠哪一列关联"——这正是表设计最核心的那一步。</div>

### 高潮：亲眼看外键拒绝你 <span class="csf-b csf-core">必读</span>

现在我们故意干一件坏事：插入一条订单，让它的 `customer_id = 999`——而 999 号顾客**根本不存在**。

**先猜后做**：你觉得数据库会（A）默默接受，留下一条"幽灵订单"；还是（B）报错拒绝，根本不让你插进去？敲下面这句之前，先在心里押一个答案。

```sql
INSERT INTO orders (customer_id, book_id, order_date)
VALUES (999, 1, '2026-06-10');
```

揭晓——如果你前面认真打开了外键开关，你会看到：

```
Runtime error: FOREIGN KEY constraint failed
```

数据库**拒绝**了你。它说：你让这条订单指向 999 号顾客，可我翻遍 `customers` 表都找不到 999 号，这条订单要是收下了就成了"无主订单"，我不能让数据出现这种矛盾。

<div class="csf-why">这种保护机制有个正经名字，叫<strong>引用完整性（referential integrity）</strong>：<strong>任何外键，都必须指向一个真实存在的目标行，绝不允许指向空气。</strong> 它帮你挡住一整类灾难——比如"订单关联了一个已被删除的顾客""评论挂在一个不存在的帖子下"。这些在没有外键的系统里是真实会发生、且极难排查的脏数据。</div>

最后做个对照实验，你就彻底明白外键开关的分量了。退出再重进，这次**故意不开**外键，重放刚才那条非法插入：

```sql
.quit
```

```bash
sqlite3 bookstore.db
```

```sql
-- 注意：这次我们故意不写 PRAGMA foreign_keys = ON;
INSERT INTO orders (customer_id, book_id, order_date)
VALUES (999, 1, '2026-06-10');
```

**先猜后做**：这次会成功还是失败？

这次它会**静悄悄成功**——一条指向不存在顾客的幽灵订单，就这样混进了你的表。这正是无数线上数据事故的剧本。所以记牢那句话：**SQLite 默认不强制外键，连上就先 `ON`。**（如果你不小心插进去了，可以 `DELETE FROM orders WHERE customer_id = 999;` 把它清掉。）

## 💡 自己复述一遍

合上屏幕，用一句话说给自己听：

<div class="csf-note">把同一份信息重复存很多遍叫<strong>冗余</strong>；治它的办法是<strong>一张表只描述一类事物</strong>，表与表之间用<strong>外键</strong>（存编号、不存名字）连起来，外键保证你<strong>永远指向真实存在的行</strong>。</div>

说不顺也没关系，回去把"灾难表 → 拆三张表 → 外键报错"这条线再走一遍。能把这条线讲清楚，这一讲就到位了。

## 🔧 翻车现场

<div class="csf-card"><strong>翻车 1：把顾客名字、地址直接抄进每条订单。</strong><br>这就是本讲开头那张灾难表。后果：顾客一改信息，你要改无数行，还容易改漏，最终数据自相矛盾。<br><strong>解法：</strong>订单只存 <code>customer_id</code>，姓名电话只在 <code>customers</code> 表里存唯一一份。记住口诀——<strong>存编号，不存名字。</strong></div>

<div class="csf-card"><strong>翻车 2：建了外键，却忘了 <code>PRAGMA foreign_keys = ON;</code></strong><br>你以为有约束保护，其实 SQLite 默认没开，脏数据照进不误。而且这个开关<strong>每次新连接都要重开</strong>，不是一劳永逸的。<br><strong>解法：</strong>连上数据库的第一句就是它。</div>

<div class="csf-card"><strong>翻车 3：插数据顺序搞反，先插订单再插顾客。</strong><br>外键要求"指向的目标必须先存在"。你还没建 1 号顾客就插他的订单，会被直接拒绝。<br><strong>解法：</strong>先插"被指向"的表（customers、books），再插"指向别人"的表（orders）。一句话：<strong>先有爹，再有娃。</strong></div>

<div class="csf-card"><strong>翻车 4：以为外键报错是自己 SQL 写错了。</strong><br>看到 <code>FOREIGN KEY constraint failed</code> 别慌，它<strong>不是语法错</strong>，而是数据库在尽职保护你——你这条数据想指向一个不存在的目标。<br><strong>解法：</strong>去对应的表查一下，你引用的那个 id 到底存不存在。</div>

## ✅ 自检三问

1. 一张 `orders_bad` 表里，"张三"出现了三次。请说出这叫什么问题，以及它最大的危害是什么？
2. `customers.id` 和 `orders.customer_id`，哪个是主键、哪个是外键？它们分别起什么作用？
3. 你执行一条插入订单的语句，得到了 `FOREIGN KEY constraint failed`。在不看答案的情况下，列出**两个**可能的原因。

<details class="csf-fold"><summary>看看参考答案<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
1. 这叫<strong>数据冗余</strong>。最大危害不是占空间，而是"一处事实多处存储"，一旦某处改了别处没改，数据就<strong>自相矛盾</strong>，且数据库无从判断谁对谁错。<br>2. <code>customers.id</code> 是 customers 表的<strong>主键</strong>（这张表的身份证号，唯一标识每个顾客）；<code>orders.customer_id</code> 是 orders 表的<strong>外键</strong>（指向 customers 主键，表达"这单是谁下的"）。<br>3. 可能原因：① 你引用的 <code>customer_id</code> 或 <code>book_id</code> 在目标表里不存在；② 插入顺序反了，被指向的顾客/书还没插。（额外一个常见情况：你确实想测试约束，那报错就是<strong>对的</strong>。）
</details>

## 🚀 挑战

给书店再加一类事物：**作者（authors）**。

1. 建一张 `authors` 表（至少有 `id` 主键和 `name`）。
2. 给 `books` 表表达"一本书属于一个作者"——想想这是不是又一个**一对多**（一个作者写多本书）。在新建表时给 books 加一个指向 `authors(id)` 的外键列 `author_id`。
3. 插两个作者、几本指向他们的书。
4. 然后**故意**插一本 `author_id` 指向不存在作者的书，确认外键拦下了你。

<div class="csf-note">提示：给已存在的表加外键列在 SQLite 里比较绕（<code>ALTER TABLE</code> 支持有限），初学阶段最省事的做法是<strong>新建一张带 author_id 的表</strong>来练手，别死磕改旧表。这一步请自己动手设计表结构，写完后<strong>再</strong>让 AI 帮你审一眼"这个外键写对了吗"——让它当审稿人，不当代笔。这正是我们下一讲要练的能力。</div>

## 📦 复制带走

<div class="csf-card">
<strong>1. 一张表只描述一类事物。</strong>顾客归 customers，书归 books，订单归 orders。一张表塞多类事物，就是冗余的源头。<br>
<strong>2. 存编号，不存名字。</strong>订单里写 <code>customer_id=1</code>，而不是抄一遍"张三"。改一处，处处生效。<br>
<strong>3. 外键 = 指向别张表主键的那一列。</strong><code>FOREIGN KEY (customer_id) REFERENCES customers(id)</code>，它保证你永远指向真实存在的行（引用完整性）。<br>
<strong>4. SQLite 默认不强制外键，连上就先 <code>PRAGMA foreign_keys = ON;</code></strong>，且每次新连接都要重开。
</div>

下一讲（第08讲《JOIN：把拆开的表重新拼回来》），我们要回答一个你可能已经在嘀咕的问题：表是拆开了，可我想一次看到"张三买了《活着》"这种完整信息，怎么把编号还原成名字？答案就是 JOIN——把这几张表，沿着外键，重新拼回一张完整的视图。我们下一讲见。
