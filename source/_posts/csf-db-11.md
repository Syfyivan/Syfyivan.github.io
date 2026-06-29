---
title: "《计算机基本功路线图 · 数据库》第11讲 · 范式直觉 + 综合实战：设计一个不埋雷的数据库"
date: 2026-07-07 20:00:00
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

<div class="csf-key-note">这是《数据库》这门课的最后一讲。前面十讲我们学了表、主键、外键、增删改查、JOIN、分组统计、索引、事务。今天不教新语法，而是回答一个更根本的问题：<strong>同样的数据，到底该拆成几张表、每张表放什么？</strong>设计错了，再快的查询、再严的事务都救不了你。我们会用一个朴素的直觉——「一个事实只存一处」——去审查、改进一份烂设计，然后你将<strong>从零独立设计并实现一个完整的小型数据库</strong>，把整门课串成你的第一个作品。</div>

## 🎯 这一讲你会学到什么

- 看懂**数据冗余**为什么是一种「定时炸弹」：它不是浪费一点空间那么简单。
- 掌握一条够用一辈子的**范式直觉**：每一列都只描述主键，一个事实只存一份。
- 知道什么时候该**故意违反**范式（适度反范式），以及代价是什么。
- 走一遍**从需求到表设计**的完整流程，并亲手实现出来。
- 学会**审查 AI 生成的表设计**——它给的方案，哪些对、哪些会埋雷，你要能逐条判断。

<div class="csf-note">这一讲是「综合实战」，前面的语法你得能调出来用。如果 JOIN、GROUP BY、外键、CREATE INDEX 这些词你看着发怵，建议先回去把第 5～9 讲翻一遍再来。本讲的动手练是整门课的毕业作品，请务必自己写——这正是 AI 替不了你的地方。</div>

## 🛠 跟我做

### 一、先看一张「烂表」长什么样 <span class="csf-b csf-core">必读</span>

假设你要给一个读书会记账：谁、什么时候、买了哪本书、花了多少钱。一个新手很容易这样建表，把所有信息塞进一张表：

```sql
-- 这是一张「反面教材」表，先别急着学，先看出问题
CREATE TABLE bad_records (
    id INTEGER PRIMARY KEY,
    member_name   TEXT,    -- 成员名
    member_phone  TEXT,    -- 成员电话
    book_title    TEXT,    -- 书名
    book_author   TEXT,    -- 作者
    book_price    REAL,    -- 单价
    buy_date      TEXT
);

INSERT INTO bad_records VALUES
(1, '小满', '13800000001', '深入理解计算机系统', 'Bryant', 128.0, '2026-03-01'),
(2, '小满', '13800000001', 'SQL基础教程', 'MICK',   79.0,  '2026-03-05'),
(3, '阿杰', '13800000002', '深入理解计算机系统', 'Bryant', 128.0, '2026-03-08'),
(4, '小满', '13800000001', '算法导论',          'CLRS',  158.0, '2026-03-10');
```

把这段在 SQLite 里跑起来（`sqlite3 bad.db`，第 1 讲教过），然后**先别往下看，先猜**：这张表如果用久了，会出哪三类麻烦？

把你的猜测写在纸上。然后看下面揭晓。

<div class="csf-why">三类经典麻烦——<br><strong>① 改一处要改很多行（更新异常）：</strong>小满换了电话号，你得把所有出现「小满」的行全改一遍，漏一行数据就自相矛盾了。<br><strong>② 删一行丢掉别的信息（删除异常）：</strong>如果《算法导论》这条记录被删，而它恰好是「算法导论 / CLRS / 158 元」唯一出现的地方，那么这本书的作者和定价信息就跟着没了。<br><strong>③ 没法单独记录（插入异常）：</strong>有本新书还没人买，你想先把它登记进系统？对不起，这张表必须有「谁买的」才能插入一行——你被迫塞假数据。</div>

这三类异常的根子是同一个：**同一个事实，被存了很多份。**「小满的电话是 13800000001」这件事，在表里出现了 3 次；「《深入理解计算机系统》作者是 Bryant、定价 128」出现了 2 次。**重复，就意味着早晚会对不上。** 这就是数据冗余真正的危害——不是费那点存储，而是**让数据失去了唯一可信的来源**。

### 二、范式直觉：一句话版本 <span class="csf-b csf-key">重点</span>

教科书会跟你讲第一范式、第二范式、第三范式、BCNF……一堆术语。零基础阶段，你**先不用背这些名字**。你只要记住这一句话，就抓住了八成的精髓：

<div class="csf-key-note"><strong>一个事实，只存一处；每一列，都只描述这张表主键所代表的那个东西。</strong></div>

拿这句话去扫上面那张烂表：

- `member_phone`（电话）描述的是「成员」，不是「这一条购买记录」。→ 它不该待在购买记录表里，该搬去「成员表」。
- `book_author`、`book_price`（作者、定价）描述的是「书」，不是「这一条购买记录」。→ 该搬去「书表」。
- 真正只属于「这一条购买记录」的，只有：谁买的、买的哪本、什么时候买。

于是这张表自然就裂成了三张：**成员表、书表、购买记录表**。购买记录表里只留「指向成员的编号」和「指向书的编号」（也就是外键，第 4 讲讲过）。

```sql
-- 改造后：一个事实只存一处
CREATE TABLE member (
    id    INTEGER PRIMARY KEY,
    name  TEXT NOT NULL,
    phone TEXT
);

CREATE TABLE book (
    id     INTEGER PRIMARY KEY,
    title  TEXT NOT NULL,
    author TEXT,
    price  REAL
);

CREATE TABLE purchase (
    id        INTEGER PRIMARY KEY,
    member_id INTEGER NOT NULL REFERENCES member(id),  -- 外键：指向成员
    book_id   INTEGER NOT NULL REFERENCES book(id),    -- 外键：指向书
    buy_date  TEXT NOT NULL
);
```

现在小满换电话，只改 `member` 表里的**一行**；新书没人买也能先登记进 `book` 表；删掉一条购买记录，书和成员的信息都还在。三类异常一次性消失。**这就是范式直觉的全部威力：把会重复的事实，挤到只剩一份。**

<details class="csf-fold"><summary>那「第几范式」到底指什么？<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
简单对一下号，知道术语指什么就行，不用背：<br><strong>第一范式（1NF）：</strong>每个格子只放一个值，不要在一列里塞「Bryant,MICK,CLRS」这种逗号串，也不要搞 `book1`、`book2`、`book3` 这种重复列。<br><strong>第二范式（2NF）：</strong>每一列都要依赖「完整的主键」，不能只依赖主键的一部分。这条主要在「联合主键」时才有意义（联合主键＝用两列或更多列合起来才能唯一确定一行，而不是单独靠一列。零基础阶段你基本碰不到，这条看不懂可以直接跳过）。<br><strong>第三范式（3NF）：</strong>每一列都要直接描述主键，不能「绕一道」——比如购买记录表里存了 `book_price`，价格其实是描述「书」的，是绕着 `book_id` 才间接关联到记录，这就违反了 3NF。<br>你会发现，前面那句「每一列都只描述主键所代表的东西」基本就把 2NF + 3NF 讲完了。所以记直觉，不用记编号。</details>

### 三、但别走极端：适度反范式 <span class="csf-b csf-key">重点</span>

读到这你可能想：那我把所有重复都消灭掉，拆得越细越好？**不对。** 这是新手的另一个极端。

范式是「减少重复」的直觉，**不是越多表越光荣的教条**。拆得太碎，会带来真实的代价：查一个简单的东西，要 JOIN 七八张表，写起来累、跑起来也未必快。真实工程是在**「少冗余」**和**「查得方便、查得快」**之间做权衡。

有两种情况，**故意留一点冗余反而是对的**：

1. **存「历史快照」。** 比如一笔购买记录，应该记下「**当时**的成交价」。因为书的定价以后可能涨，但这笔历史订单成交价是多少，是不能变的事实。这时在 `purchase` 里加一列 `paid_price` 不是冗余，而是记录了一个**独立的事实**——成交价 ≠ 现价。
2. **为了省一次高频 JOIN。** 如果某个页面每秒都要显示「成员名」，而它总要 JOIN `member` 表才能拿到，在数据量极大、性能吃紧时，工程师**可能**会选择把 `member_name` 冗余一份进来。但这要付出代价：成员改名时你得记得同步多处。**这是一种用一致性风险换查询速度的交易**，只在确实需要时才做，而不是默认就做。

<div class="csf-note">怎么判断该不该反范式？问自己一句：「我留的这份重复，是<strong>同一个事实</strong>，还是一个<strong>独立的事实</strong>？」成交价是独立事实（留它天经地义）；冗余的成员名是同一个事实的副本（留它要承担同步责任）。想清楚这一点，你就不会乱拆也不会乱塞了。</div>

### 四、从需求到表设计：一套可复用的流程 <span class="csf-b csf-core">必读</span>

这是本讲最值钱的部分。下次你面对任何一个「要存数据」的需求，按这五步走，基本不会埋大雷：

<div class="csf-legend"><strong>第 1 步｜找名词：</strong>把需求里的「东西」圈出来——成员、书、购买。每个名词大概率是一张表。<br><strong>第 2 步｜定字段：</strong>每张表里，只放「描述这个东西本身」的属性。问自己「这一列是在描述谁？」放错地方立刻能发现。<br><strong>第 3 步｜理关系：</strong>表和表之间是「一对多」还是「多对多」？一个成员买多本书、一本书被多人买——多对多，就需要一张中间表（purchase）来牵线。<br><strong>第 4 步｜加约束：</strong>主键（每行唯一身份）、外键（指向别的表）、NOT NULL（不能空的列）。这是给数据上的「安全带」。<br><strong>第 5 步｜想查询：</strong>先想「我以后要怎么查」，再回头看表设计撑不撑得住，高频查询要不要加索引。</div>

注意第 3 步里的「多对多」：当两个东西是多对多关系，你**几乎总是**需要一张中间表去承载它。`purchase` 表就是「成员」和「书」之间的中间表，它把一个多对多关系，拆成了两个一对多。这是设计里出现频率最高的套路，记牢它。

### 五、动手练：从零设计你的第一个数据库 <span class="csf-b csf-core">必读</span>

下面是这门课的毕业作品。**请务必自己从头做一遍**，做完再让 AI 看。这里给一个完整范例（追番清单），你照着学会流程后，**换成你自己的场景**重做一遍。

<div class="csf-note">三选一，挑你最熟的：<strong>个人记账</strong>（账户 / 分类 / 流水）、<strong>追番清单</strong>（番剧 / 平台 / 观看记录）、<strong>社团成员管理</strong>（成员 / 活动 / 报名）。下面用「追番清单」演示，你做你自己的那个。</div>

**① 画表与关系（先用嘴说清楚）：** 一部番在多个平台能看、一个平台有很多番——番和平台是多对多，需要中间表。我要记「我在哪个平台、看了哪部番、看到第几集、打几分」，所以观看记录 `watch` 就是这张中间表。

**② 建表（含主键 / 外键 / 约束）：先猜一下，下面三张表里，哪一列你觉得最该加 NOT NULL？**

```sql
-- anime: 番剧本身的信息
CREATE TABLE anime (
    id        INTEGER PRIMARY KEY,
    title     TEXT NOT NULL,
    year      INTEGER,
    eps_total INTEGER          -- 总集数
);

-- platform: 平台本身的信息
CREATE TABLE platform (
    id   INTEGER PRIMARY KEY,
    name TEXT NOT NULL
);

-- watch: 我的观看记录（anime 和 platform 之间的中间表）
CREATE TABLE watch (
    id          INTEGER PRIMARY KEY,
    anime_id    INTEGER NOT NULL REFERENCES anime(id),
    platform_id INTEGER NOT NULL REFERENCES platform(id),
    ep_watched  INTEGER NOT NULL DEFAULT 0,   -- 看到第几集
    score       INTEGER,                       -- 我的评分 1-10，没看完可为空
    updated_at  TEXT NOT NULL
);
```

<div class="csf-note">这里第一次出现 <code>DEFAULT 0</code>，解释一下：<strong>DEFAULT 是「默认值」的意思——插入数据时如果你没填这一列，系统就自动帮你填上你指定的那个值。</strong>这里 <code>DEFAULT 0</code> 就是说：新加一条观看记录时如果忘了写「看到第几集」，系统自动填 0（代表一集都还没看）。它不是必须写的，但写上能省去你每次都手动填 0 的麻烦，也避免这一列变成空值。</div>

**③ 灌入真实数据**（注意：先有 anime 和 platform，才能插 watch，因为外键得指向已存在的行——第 4 讲讲过的顺序）：

```sql
INSERT INTO anime (id, title, year, eps_total) VALUES
(1, '钢之炼金术师', 2009, 64),
(2, '葬送的芙莉莲',  2023, 28),
(3, '间谍过家家',    2022, 25);

INSERT INTO platform (id, name) VALUES
(1, 'B站'),
(2, 'Netflix');

INSERT INTO watch (anime_id, platform_id, ep_watched, score, updated_at) VALUES
(1, 2, 64, 10, '2026-05-01'),
(2, 1, 28,  9, '2026-06-10'),
(3, 1, 12, NULL, '2026-06-20'),
(2, 2, 28,  9, '2026-06-25');
```

**④ 写至少 3 条有业务含义的查询（含 JOIN 和 GROUP BY）。先猜每条会输出什么，再运行对答案：**

```sql
-- 查询 A：列出我每条观看记录，番名 + 平台名（两次 JOIN）
SELECT a.title, p.name AS platform, w.ep_watched, w.score
FROM watch w
JOIN anime a    ON a.id = w.anime_id
JOIN platform p ON p.id = w.platform_id
ORDER BY w.updated_at DESC;

-- 查询 B：统计每个平台上我看了几部番（GROUP BY + COUNT）
SELECT p.name AS platform, COUNT(*) AS watched_count
FROM watch w
JOIN platform p ON p.id = w.platform_id
GROUP BY p.name;

-- 查询 C：找出我已经追完的番（看到的集数 >= 总集数）
SELECT a.title, w.ep_watched, a.eps_total, w.score
FROM watch w
JOIN anime a ON a.id = w.anime_id
WHERE w.ep_watched >= a.eps_total;
```

**⑤ 给一个高频查询加索引。** 假设你最常做的事是「按某部番查我在各平台的进度」，那 `watch.anime_id` 就是高频过滤列，给它加索引（第 9 讲讲过索引为什么快）：

```sql
CREATE INDEX idx_watch_anime ON watch(anime_id);

-- 加完后用 EXPLAIN QUERY PLAN 验证它真的被用上了（第 9 讲的招）
EXPLAIN QUERY PLAN
SELECT * FROM watch WHERE anime_id = 2;
-- 看输出里有没有出现 USING INDEX idx_watch_anime
```

到这一步，你已经独立完成了一个**多表、有主外键、能 JOIN、能分组统计、有索引**的真实数据库。这就是整门课的能力总和。

### 六、最后一步：让 AI 审查，但你来判分 <span class="csf-b csf-core">必读</span>

现在，也只有现在，把你的建表语句丢给 AI，让它审查：「帮我看看这份表设计有没有问题、有没有可以改进的地方。」

<div class="csf-key-note"><strong>关键不是看 AI 说什么，而是你能不能逐条判断它说得对不对。</strong>这正是这门课要练的判断力，也是 AI 替不了你的地方。</div>

AI 常会给这几类建议，你要能分辨：

- **「建议给 `watch(anime_id, platform_id)` 加唯一约束。」** → 八成是对的。先解释两个词：**「唯一约束」是给某列（或某几列）加的一条规则，被它管住的内容不能重复，重复插入会被数据库直接拒绝。**而写成 `watch(anime_id, platform_id)` 两列的意思，是指**「这两列的组合」不能重复**——也就是同一部番（anime_id）＋ 同一平台（platform_id）只能有一条记录，但同一部番在不同平台、或同一平台上的不同番，都是允许的。它正好挡住「同一部番在同一平台被你记了两次」这种重复。写法是在建表语句里加一行：`UNIQUE(anime_id, platform_id)`。**采纳。**
- **「建议把 `score` 限制在 1-10。」** → 对的，可以加 `CHECK(score BETWEEN 1 AND 10)`。解释一下：**CHECK 是「写在建表语句里的一条规则」**，`CHECK(score BETWEEN 1 AND 10)` 表示 score 只能填 1 到 10（`BETWEEN 1 AND 10` 是包含两端的，1 和 10 都算合法），填别的值会被数据库拒绝。它写在 `score` 这一列的类型后面，像这样：`score INTEGER CHECK(score BETWEEN 1 AND 10)`。这是好的防御。**采纳。**
- **「建议把番名 `title` 直接冗余进 `watch` 表，查询更快。」** → 要警惕。这是用一致性风险换速度，对你这种小数据量**完全没必要**，番改名时还得多处同步。**多半拒绝**，除非你能说清为什么需要。
- **「`year` 应该用 DATE 类型。」** → 看情况。SQLite 类型很灵活，年份用 INTEGER 完全够；如果是别的数据库另说。**视场景判断。**

发现没有？**每一条你都得调动这门课学过的东西去判断**——冗余的代价、约束的意义、索引的作用、类型的取舍。能做出这些判断的人，才是「对数据负责的人」。如果只是复制粘贴而不去判断，下次换个场景可能又会卡住；而你只要把上面这几条判断练熟，就能慢慢摆脱这种依赖，越用越有底气。

## 💡 自己复述一遍

合上屏幕，用一句话说出来：**「为什么同样的数据，要拆成多张表，而不是堆在一张大表里？」** 如果你能讲到「一个事实只存一处，这样改一处不用改很多处、也不会自相矛盾」，你就真的懂了范式直觉。

## 🔧 翻车现场

<div class="csf-card"><strong>翻车一：完全不拆表，所有东西堆一张大表。</strong><br>症状：改一个人的电话要改几十行、删一行丢掉别的信息。<br>原因：每个事实都存了很多份。<br>解法：用「这一列是在描述谁」去扫每一列，描述别的东西的列就搬出去单独建表。</div>

<div class="csf-card"><strong>翻车二：矫枉过正，拆得过碎。</strong><br>症状：查个简单信息要 JOIN 七八张表，写得头晕。<br>原因：把范式当教条，以为表越多越「专业」。<br>解法：范式是直觉不是军规。该合并的合并，高频要一起查的东西别强行拆开。</div>

<div class="csf-card"><strong>翻车三：把「历史快照」当冗余给消灭了。</strong><br>症状：删掉了订单里的成交价，以为反正能从书表查到现价。<br>原因：没分清「同一个事实的副本」和「独立的事实」。<br>解法：成交价是下单当时的独立事实，必须单独存；它和书的现价是两回事。</div>

<div class="csf-card"><strong>翻车四：插入 watch 时外键指向了不存在的行。</strong><br>症状：报 FOREIGN KEY constraint failed，或在 SQLite 默认配置下悄悄存进了脏数据（脏数据＝指向了根本不存在的行的错误数据，比如 watch 里写了一个 anime 表里压根没有的编号）。<br>原因：先插中间表、还没插主表；或 SQLite 默认没开外键检查。<br>解法：先插被指向的表（anime / platform），再插 watch；并打开外键检查。<strong>PRAGMA 是 SQLite 自己的「开关命令」，不是普通的 SQL。</strong>具体做法是：每次用 <code>sqlite3</code> 打开数据库后，先敲一行 <code>PRAGMA foreign_keys = ON;</code>，这次会话的外键检查才会生效——关掉再重开，要再敲一次。</div>

## ✅ 自检三问

1. 给你那张「读书会烂表」，你能说出它会出哪三类异常，并把它改成三张干净的表吗？
2. 「成交价存进订单表」是冗余吗？「把成员名冗余进订单表」又是不是？两者区别在哪？
3. 你自己设计的那个数据库里，哪两张表是「多对多」关系，你用哪张中间表牵的线？

## 🚀 挑战

把你在动手练里做的那个数据库（记账 / 追番 / 社团，挑一个）**完整地做出来并存成一个 `.db` 文件**，要求至少 3 张表、含主外键、灌进至少 10 行真实数据、写出 4 条查询（其中至少 2 条带 JOIN、1 条带 GROUP BY）、加 1 个索引并用 `EXPLAIN QUERY PLAN` 证明它被用上了。

做完后，把建表语句发给 AI 审查，然后**写一段话**：AI 给了哪几条建议，你**采纳了哪些、拒绝了哪些，为什么**。这段「判断说明」，比那些 SQL 本身更重要——它是你这门课真正学到东西的证据。

## 📦 复制带走

<div class="csf-card">📌 <strong>范式直觉一句话：</strong>一个事实只存一处，每一列都只描述本表主键所代表的那个东西。重复 = 早晚对不上。</div>

<div class="csf-card">📌 <strong>设计五步流程：</strong>找名词（定表）→ 定字段（描述谁）→ 理关系（多对多就加中间表）→ 加约束（主键/外键/NOT NULL）→ 想查询（高频加索引）。</div>

<div class="csf-card">📌 <strong>别走极端：</strong>范式是「减少重复」的直觉，不是「表越多越好」的教条。真实设计在「少冗余」和「查得方便」之间权衡；历史快照（如成交价）该单独存，那不是冗余。</div>

<div class="csf-card">📌 <strong>审查 AI 的本事：</strong>AI 能写 SQL，但表怎么设计、会不会埋雷，要你判断。能逐条说清 AI 的建议对不对，你才是对数据负责的人。</div>

---

到这里，《数据库》这门课就讲完了。回头看看你走过的路：从「数据记在哪、怎么不弄丢」开始，你学会了建表、定主键、连外键，用 SQL 完成增删改查、分组统计、多表 JOIN，理解了索引为什么快、事务为什么要么全做要么全不做，最后还能从零设计一个不埋雷的数据库、并审查 AI 写的 SQL。这些不是「看过」，是你**亲手敲过、踩过坑、自己判断过**的基本功——它们不会因为 AI 越来越强而贬值，反而会让你成为那个能驾驭 AI 的人。

数据库管的是「数据怎么存」。但数据存好了，得有程序去用它、有网络把它送到用户面前。**系列的下一门课，我们会去看这些数据是怎么通过网络流动的**——同样是动手、同样不靠 AI 代写。带上你在这门课练出的「对底层负责」的习惯，我们下一门课见。
