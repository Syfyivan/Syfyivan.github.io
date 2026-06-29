---
title: "《计算机基本功路线图 · 数据库》第09讲 · 索引：为什么同一条查询突然快了一百倍"
date: 2026-07-07 18:00:00
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

<div class="csf-key-note">你有没有遇到过这种事：一条查询昨天还秒回，今天数据多了就卡成幻灯片？同一条 SQL，加一行命令就快了一百倍——这不是玄学，是<strong>索引</strong>。这一讲我们不背定义，而是亲手把"慢"造出来，再亲手把它治好，让你真正看见索引在干什么、代价在哪。</div>

上一讲我们学了 JOIN，把拆开的表重新拼回来。但你可能已经隐隐感觉到：表一大，查询就慢。这一讲就来回答那个所有人迟早会问的问题——**为什么慢，以及怎么让它快**。

## 🎯 这一讲你会学到什么

- 数据库找一行数据，到底有"翻箱倒柜"和"查目录"两种方式（全表扫描 vs 索引查找）
- 索引为什么快——用"字典目录"这个你早就会的直觉就能理解
- 怎么用 `EXPLAIN QUERY PLAN` **亲眼看见**数据库是扫全表还是走索引
- 怎么用 `CREATE INDEX` 建索引，并测出加索引前后的真实差别
- 索引不是免费的：它的写入代价、空间代价，以及**到底该给谁建、不该给谁建**

<div class="csf-note">这一讲会让你灌入几万行数据、亲手跑两次同样的查询。请一定打开 SQLite 跟着敲——索引这东西，光读一百遍不如自己卡一次、再自己治好一次。</div>

## 🛠 跟我做

我们沿用前面几讲的 SQLite。如果你忘了怎么启动，回到第02讲：在终端里输入 `sqlite3 practice.db` 就进去了。这一讲我们建一张新表，专门用来"造慢"。

### 第一步：造一张大表 <span class="csf-b csf-core">必读</span>

真实世界的慢查询都发生在"数据很多"的时候。几十行数据,数据库眨眼就扫完了,根本看不出差别。所以我们先灌**五万行**进去。

先建表：

```sql
CREATE TABLE events (
  id    INTEGER PRIMARY KEY,
  user_id  INTEGER,
  action   TEXT,
  created_at  TEXT
);
```

然后灌数据。SQLite 有个递归查询的写法，可以一口气生成五万行，你照抄就行（这段是"造数据"的工具代码，理解不了细节没关系，跑通即可）：

```sql
INSERT INTO events (user_id, action, created_at)
WITH RECURSIVE seq(n) AS (
  SELECT 1
  UNION ALL
  SELECT n + 1 FROM seq WHERE n < 50000
)
SELECT
  abs(random()) % 10000,                 -- user_id：0~9999 之间随机
  'click',
  '2026-01-01'
FROM seq;
```

跑完之后确认一下行数：

```sql
SELECT count(*) FROM events;
```

<div class="csf-why">应该看到 <code>50000</code>。如果你的电脑跑这段有点慢，把 <code>50000</code> 改成 <code>20000</code> 也完全不影响后面的效果——只要数据够多，"扫全表"和"走目录"的差距就藏不住。</div>

### 第二步：先猜后做——查一个用户 <span class="csf-b csf-key">重点</span>

现在我们要查某个特定用户的所有事件：

```sql
SELECT * FROM events WHERE user_id = 42;
```

**先别急着回车。先猜一件事**：数据库要找出 `user_id = 42` 的行，它会怎么找？

它现在没有任何"目录"，所以它只能做一件事：**从第一行翻到第五万行，每一行都看一眼 `user_id` 是不是 42**。这叫**全表扫描（full table scan）**。就像你要在一本没有目录、没有页码的书里找某个词，只能一页一页翻。

我们不靠猜，直接让数据库"自首"。在查询前面加上 `EXPLAIN QUERY PLAN`：

```sql
EXPLAIN QUERY PLAN
SELECT * FROM events WHERE user_id = 42;
```

你会看到类似这样的输出（重点看那个大写的词）：

```
QUERY PLAN
`--SCAN events
```

<div class="csf-why">你的 SQLite 版本不同，文字可能略有出入——比如老一点的版本会显示成 <code>SCAN TABLE events</code>，有的还会多带几个字。这都正常，<strong>只要你看到大写的 <code>SCAN</code> 就对了</strong>，不用和这里一字不差。后面我们会看到的 <code>SEARCH</code> 也是同理。</div>

看到 **`SCAN`** 了吗？这就是"全表扫描"的铁证——数据库老老实实把 events 这张表从头扫到尾。五万行还好，要是五千万行，你就该等到天荒地老了。

### 第三步：建索引，再看一次 <span class="csf-b csf-core">必读</span>

现在见证奇迹。我们给 `user_id` 这一列建一个索引：

```sql
CREATE INDEX idx_events_user ON events(user_id);
```

这一行命令的意思是：**请数据库为 user_id 这列单独建一份"目录"**，按 user_id 排好序，并记下每个值对应的数据在哪。建好之后，**再跑一次一模一样的 EXPLAIN**：

```sql
EXPLAIN QUERY PLAN
SELECT * FROM events WHERE user_id = 42;
```

这次输出变了：

```
QUERY PLAN
`--SEARCH events USING INDEX idx_events_user (user_id=?)
```

`SCAN` 变成了 **`SEARCH ... USING INDEX`**。数据库不再傻翻了——它直接翻"目录"，一下就定位到 user_id = 42 在哪，跳过去取数据。

<div class="csf-note">这就是这一讲最核心的一幕，请你一定亲手看到这两行的区别：<br>没索引 → <code>SCAN</code>（一页页翻）<br>有索引 → <code>SEARCH ... USING INDEX</code>（查目录直达）</div>

### 第四步：测出"快多少" <span class="csf-b csf-key">重点</span>

EXPLAIN 只告诉你"走没走索引"，但快慢得自己掐表。SQLite 命令行里打开计时开关：

```sql
.timer on
```

然后我们做个对照实验。这次我们用 `count(*)` 来统计 `user_id = 42` 一共有多少行——这条查询会逼着数据库把符合条件的行**全部找一遍**，所以最能体现有没有索引的差别。先**删掉**刚才的索引，跑一次统计：

```sql
DROP INDEX idx_events_user;
SELECT count(*) FROM events WHERE user_id = 42;
```

跑完之后，屏幕上会蹦出一行计时，长这样：

```
Run Time: real 0.012 user 0.008 sys 0.002
```

这里有三个数字，别被吓到。**你只要看 `real` 后面那个数（这里是 0.012）就行**——它是你实际等待的秒数，也就是你真正关心的"快慢"。后面 `user` 和 `sys` 这两个先忽略。把这个 `real` 的数字记下来。然后**重新建索引**，再跑同一条：

```sql
CREATE INDEX idx_events_user ON events(user_id);
SELECT count(*) FROM events WHERE user_id = 42;
```

同样只看新的 `real` 数字，和刚才那个对比。在五万行上你可能感受不到"一百倍"那么夸张（现代电脑扫五万行也很快），但你会看到有索引那次的 `real` 明显更小。**而且表越大，差距就拉得越离谱**——标题里的"一百倍"在百万、千万行的真实业务表上每天都在发生。

<div class="csf-why">为什么数据少时差别不明显？因为扫五万行对 CPU 来说只是"喝口水"的功夫。索引真正的威力在于：扫全表的耗时随数据量<strong>线性</strong>增长（数据翻倍，时间翻倍），而走索引的耗时几乎<strong>不随数据量增长</strong>。所以表越大，索引越是救命。这也是为什么小项目早期没人在意索引，一上量就集体翻车。</div>

## 索引到底是什么——字典目录的直觉 <span class="csf-b csf-core">必读</span>

别被"B 树"这种名字吓到。索引的本质，你小学就用过——**字典的目录**。

想象一本《新华字典》。如果它**没有**部首/拼音目录，你要查"森"字，只能从第一页一个字一个字往后翻，翻到天黑（这就是全表扫描）。但字典有目录：按拼音排好序，你想查 "sēn"，翻到 S 区，几下就定位了（这就是索引查找）。

索引就是数据库帮你**预先排好序、单独存一份的"目录"**。它牺牲一点存储空间、牺牲一点写入速度，换来查询时的"直达"。

<details class="csf-fold"><summary>为什么是"B 树"而不是简单排个序<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
你可能会想：排序不就是从小到大列一遍吗？为什么要搞个"树"？<br>因为数据库的索引不只要"有序",还要支持<strong>高效地插入新数据</strong>。如果索引只是一个排好序的长列表，每次插一行都可能要把后面所有数据往后挪一格，代价极高。<br>B 树（以及它的变体 B+ 树）是一种"长得很矮、很胖"的树形结构：几百万行数据，从树根走到任意一行通常只需要 3~4 步。它既保持有序（能快速查找和范围扫描），又能在插入/删除时只改局部、不动全局。<br>你现在<strong>不需要</strong>会画 B 树、会推导它的复杂度。你只需要记住一个直觉：<strong>索引让"查找"从"一页页翻"变成了"查目录、走几步就到"</strong>。这个直觉足够你用很久了。等你将来真正需要调优时，再回头啃 B 树也不迟。
</details>

## 💡 自己复述一遍

合上屏幕，用一句话回答：**索引为什么能让查询变快？**

如果你能说出类似"因为它像字典目录一样预先排好了序，数据库不用一行行翻全表，直接查目录就能定位到数据"——你就抓住了这一讲的魂。如果还说不利索，回到上面"字典目录"那段再读一遍，这是整讲的地基。

## 🔧 翻车现场

### 翻车一：以为"索引越多越好"，给每一列都建 <span class="csf-b csf-core">必读</span>

这是初学者最容易犯、也最贵的错。看到索引这么神，很多人第一反应是："那我把每一列都建上索引，岂不是查什么都快？"

**大错特错。** 索引不是免费的魔法，它有三笔实打实的成本：

- **写入变慢**：每次 `INSERT` / `UPDATE` / `DELETE`，数据库不光要改表，还要把**每一个**相关索引的"目录"也更新一遍。索引越多，写入越慢。一张高频写入的表挂十个索引，可能写性能直接腰斩。
- **占额外空间**：每个索引都是一份单独存储的数据副本，实打实占磁盘。
- **建了也可能没人用**：只有出现在 `WHERE`、`JOIN`、`ORDER BY` 里的列，索引才有意义。给一个从来不参与筛选的列建索引，纯属白白付出成本、换不来任何收益。

<div class="csf-note">记住这句话：<strong>索引是一种权衡（trade-off），不是免费加速</strong>。它用"写得慢一点、占空间多一点"换"读得快很多"。所以索引要<strong>按需建</strong>——查询慢在哪，就给哪条查询的关键列建，而不是无脑全列铺满。</div>

### 翻车二：建了索引，EXPLAIN 却还是 SCAN <span class="csf-b csf-key">重点</span>

有时你建了索引，可 `EXPLAIN QUERY PLAN` 还是显示 `SCAN`。常见原因有两个：

- **你的 WHERE 没用到那一列**。索引建在 `user_id` 上，但你查的是 `WHERE action = 'click'`——那当然走不了 user_id 的索引。索引只服务于"建在它上面的那一列"。
- **你对索引列做了运算或函数**。比如 `WHERE user_id + 1 = 43`，数据库没法直接拿这个表达式去查目录，只能放弃索引、退回全表扫。**保持索引列"干干净净"地出现在比较的一侧**，索引才用得上。

### 翻车三：忘了数据量太小，看不出效果就以为索引没用 <span class="csf-b csf-skim">可跳读</span>

如果你只灌了 100 行就测，会发现加不加索引都一样快，于是怀疑"索引是不是骗人的"。不是。数据少时全表扫本来就快，索引的价值被淹没了。**索引是为"大数据量"准备的**——这也是我们这一讲一上来就灌五万行的原因。

## ✅ 自检三问

1. 同一条 `SELECT ... WHERE user_id = 42`，加索引前后，`EXPLAIN QUERY PLAN` 的输出分别是哪个关键词？这两个词各自意味着数据库在做什么？
2. 索引能让查询变快，那它的代价是什么？说出至少两笔成本。
3. 你的同事说"我把表里每一列都加了索引，这下肯定快了"。你会怎么提醒他？

<div class="csf-why">如果第 1 问你答得出 <code>SCAN</code>（全表扫）和 <code>SEARCH USING INDEX</code>（走索引），第 2 问答得出"写入变慢 + 占空间"，第 3 问能说出"索引有成本、要按需建、没被查询用到的列建了也白建"——恭喜，这一讲你真的学透了，不是背下来的。</div>

## 🚀 挑战

给你一个**自己动手**的小任务（建议先自己写，写不出来再让 AI 帮忙——但一定要让它逐句给你讲清楚，自己看懂了，才算真的拿下这一讲）：

1. 在 events 表上，再写一条按 `created_at` 范围筛选的查询，比如查某天之后的事件。先用 `EXPLAIN QUERY PLAN` 看它是不是 `SCAN`。
2. 给 `created_at` 建一个索引，再 EXPLAIN 一次，确认变成了 `SEARCH`。
3. **进阶思考题**（这一步只想、不一定要写）：如果一条查询同时筛 `user_id` 和 `action` 两列，你觉得建两个单列索引好，还是建一个"同时包含两列"的索引好？把你的猜想写下来——这正是下一阶段"复合索引"要展开的话题，先有个自己的判断，比直接看答案值钱。

<div class="csf-note">关于 AI 这件事，多说一句：你完全可以让 AI 帮你解释 <code>EXPLAIN</code> 的输出、帮你理解 B 树。但"该给哪列建索引""这条查询为什么慢"——这种判断必须长在你自己脑子里。因为 AI 不知道你的业务里哪条查询最高频、哪张表写入最密集。<strong>真正的本事，是学会判断该不该建索引——这正是这门课想帮你练出来的判断力。</strong></div>

## 📦 复制带走

<div class="csf-card"><strong>索引一图流</strong><br>1. <strong>全表扫描 vs 索引查找</strong>：没索引 = 一页页翻整本书（<code>SCAN</code>）；有索引 = 查目录直达（<code>SEARCH USING INDEX</code>）。用 <code>EXPLAIN QUERY PLAN</code> 就能亲眼看出走的是哪种。<br>2. <strong>索引就是"预先排好序的目录"</strong>：本质和字典的拼音目录一模一样，底层用 B 树，但你现在只需记住"查目录、走几步就到"这个直觉。<br>3. <strong>索引不是免费的</strong>：它用"写入变慢、占额外空间"换"读取快很多"，是一种权衡。<br>4. <strong>按需建，别瞎建</strong>：只给出现在 WHERE / JOIN / ORDER BY 里的关键列建索引；"每列都建"是新手最贵的错。</div>

下一讲（第10讲）我们换个方向，聊一个和"快不快"无关、却关乎"对不对"的硬核话题——**事务与 ACID：要么全做，要么全不做**。当你给账户转账时，"扣这边"和"加那边"必须捆在一起，绝不能只成功一半。我们下一讲见。
