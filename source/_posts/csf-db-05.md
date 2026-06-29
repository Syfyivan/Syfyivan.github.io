---
title: "《计算机基本功路线图 · 数据库》第05讲 · 改与删：UPDATE / DELETE，以及手别抖"
date: 2026-07-07 14:00:00
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

<div class="csf-key-note">上一讲我们学会了"查"——只看不动，怎么查都不会出事。这一讲我们要第一次<strong>动手改数据</strong>：把某本书涨价、把卖光的书删掉。改和删的杀伤力和查完全不是一个量级——一条 SELECT 写错了顶多看到错的结果，一条 UPDATE / DELETE 写错了，<strong>数据可能就回不来了</strong>。所以这一讲真正的主角不是语法，而是一个能跟你一辈子的安全习惯：<strong>先 WHERE、先 SELECT 验证、再动手</strong>。</div>

## 🎯 这一讲你会学到什么

- 用 `UPDATE ... SET ... WHERE` 修改已有的数据
- 用 `DELETE FROM ... WHERE` 删除指定的行
- 看懂"影响行数"，知道自己到底动了几行
- 真正学会一个职业级习惯：**改之前先用 SELECT 把 WHERE 跑一遍**，确认命中的就是你想动的那些行
- 理解为什么"忘了 WHERE"是数据库世界里的头号事故，以及怎么把这个坑彻底堵死

<div class="csf-note">这一讲会出现"误删全表"这种吓人的字眼，但别紧张——我们是在自己电脑上的练习库里操作，删错了大不了重建。<strong>恰恰要趁现在没有真实代价的时候，把惊险的场面演一遍</strong>，把肌肉记忆练出来。等你将来碰到的是真用户的真数据，那时候就来不及练了。</div>

## 🛠 跟我做

### 先把练习库准备好 <span class="csf-b csf-core">必读</span>

我们继续用前几讲的 `books` 表。为了让每个人从同样的状态开始，这里给一份完整的"重建脚本"——哪怕你前面的库被改乱了，跑一遍它就回到干净状态。

打开终端，进入你放练习文件的目录（"进入目录"用的是 `cd` 命令，比如你的练习文件放在 `桌面/sql练习` 文件夹，就敲 `cd 桌面/sql练习`；如果还不熟悉怎么用 `cd` 进目录，回看第02讲），然后启动 SQLite：

```bash
cd 桌面/sql练习   # 换成你自己放练习文件的目录
sqlite3 shop.db
```

进入 `sqlite>` 提示符后，把下面这段整段贴进去（`DROP TABLE` 是先删掉旧表重来，第一次运行会提示表不存在，忽略即可）：

```sql
DROP TABLE IF EXISTS books;

CREATE TABLE books (
  id      INTEGER PRIMARY KEY,
  title   TEXT    NOT NULL,
  author  TEXT,
  price   REAL,
  stock   INTEGER
);

INSERT INTO books (title, author, price, stock) VALUES
  ('深入理解计算机系统', 'Bryant',   139.0, 12),
  ('算法导论',           'Cormen',   128.0,  0),
  ('代码大全',           'McConnell', 99.0,  5),
  ('计算机网络',         'Tanenbaum', 89.0,  0),
  ('数据库系统概念',     'Silberschatz', 119.0, 8);
```

为了看得清楚，先把显示模式调好，然后看一眼现在的全表：

```sql
.mode box
.headers on
SELECT * FROM books;
```

你应该看到 5 本书，其中"算法导论"和"计算机网络"的 `stock`（库存）是 0。记住这个起点。

### 第一件事：给某本书涨价 10 元（UPDATE） <span class="csf-b csf-key">重点</span>

需求：给《代码大全》涨价 10 元。

`UPDATE` 的基本句式是这样的：

```sql
UPDATE 表名
SET 列 = 新值
WHERE 条件;
```

读法很直白：在 `表名` 里，把"满足 `WHERE 条件`"的那些行，按 `SET` 把某些列改成新值。

<div class="csf-note"><strong>这一讲最重要的一句话：先别急着写 UPDATE。</strong> 我们要先用一条 SELECT，把<strong>一模一样的 WHERE 条件</strong>跑一遍，亲眼看看它命中了哪些行。</div>

第一步——**先查，确认命中的正是我想动的那本书**：

```sql
SELECT * FROM books WHERE title = '代码大全';
```

**先猜一下**：这条 SELECT 会返回几行？是哪一本？

揭晓：应该正好返回 1 行，就是《代码大全》，原价 99.0。命中数和我们的预期一致——很好，这说明 WHERE 写对了。

第二步——**确认无误，再把 SELECT 改写成 UPDATE**，WHERE 原封不动照搬过来：

```sql
UPDATE books
SET price = price + 10
WHERE title = '代码大全';
```

注意 `price = price + 10` 的意思是"在原来价格的基础上加 10"，而不是"价格等于 10"。这里的等号不是"判断相等"，而是"把右边算出来的结果存回这一列"——这个"把值存回去"的动作就叫赋值。等号右边的 `price`，指的是这一行改之前的旧值。

第三步——**改完一定要再查一遍验证**：

```sql
SELECT * FROM books WHERE title = '代码大全';
```

价格应该从 99.0 变成了 109.0。三步走：查 → 改 → 再查。这套节奏，从现在开始就刻进去。

<div class="csf-note"><strong>关于"影响行数"</strong>：在某些环境里，执行完 UPDATE 会告诉你"改了几行"。在 SQLite 命令行里可以打开这个提示：执行 <code>.changes on</code> 之后，再跑 UPDATE / DELETE，它就会显示类似 <code>changes: 1</code> 的信息。这个数字极其有用——如果你以为只该改 1 行，它却说改了 5 行，那就是 WHERE 写漏了，赶紧停下来。建议现在就开着它。</div>

### 第二件事：把库存为 0 的书删掉（DELETE） <span class="csf-b csf-key">重点</span>

需求：清理掉已经卖光（`stock = 0`）的书。

`DELETE` 的句式比 UPDATE 还短，正因为短，它更危险：

```sql
DELETE FROM 表名
WHERE 条件;
```

注意 DELETE 删的是**整行**，没有"只删某一列"这回事——要把某列清空那是 UPDATE 的活。

同样地，**先查后删**。第一步，先看清楚"库存为 0 的到底是哪些书"：

```sql
SELECT * FROM books WHERE stock = 0;
```

**先猜**：这条会命中几行？

揭晓：应该是 2 行——"算法导论"和"计算机网络"。命中数（2）和我们的预期一致，名字也对得上。确认无误。

第二步，**把 SELECT 换成 DELETE，WHERE 照搬**：

```sql
DELETE FROM books WHERE stock = 0;
```

如果你前面开了 `.changes on`，这里应该看到 `changes: 2`——和刚才 SELECT 命中的行数对上了，完美。

第三步，**验证**：

```sql
SELECT * FROM books;
```

现在应该只剩 3 本书，卖光的两本不见了。

<div class="csf-note">看出这套工作法的精髓了吗？<strong>SELECT 和 UPDATE / DELETE 共用同一个 WHERE</strong>。先用没有杀伤力的 SELECT 把这个 WHERE "试射"一遍，看清楚命中的行，确认没问题，再把动词换成 UPDATE / DELETE。命中行数对不上，就绝不往下走。</div>

### 亲手演一遍"翻车"，再学会怎么不翻 <span class="csf-b csf-core">必读</span>

下面这段请你**一定亲手做一遍**——在练习库里故意闯一次祸，比看一百遍警告都管用。

先重建一次练习库（重新跑最前面那段 `DROP TABLE ... INSERT ...`），让数据回到 5 本书的干净状态。

现在，**先猜**：如果我执行下面这条——注意，它**没有 WHERE**：

```sql
UPDATE books SET price = 0;
```

你觉得会发生什么？改 1 行，还是改 5 行？

```sql
SELECT * FROM books;
```

揭晓：**全部 5 本书的价格都变成 0 了**。没有 WHERE，就等于"对所有行都成立"，于是整张表被一锅端。设想一下：如果这是"线上"的商品表——"线上"就是真实用户此刻正在使用的系统，和我们这种自己电脑上练手的库完全不是一回事——那全店商品就会瞬间变成免费。这种在真实系统上闯出来的祸，就叫"生产事故"（这里的"生产"指真实对外服务的环境，不是工厂车间），而且它在真实世界里反复发生过。

DELETE 更狠。猜猜下面这条的后果：

```sql
DELETE FROM books;
```

```sql
SELECT * FROM books;
```

揭晓：**整张表被清空了，一行不剩**。`DELETE FROM books` 不带 WHERE，意思就是"删掉所有行"。

演完这一出，请你重建练习库恢复数据，然后牢牢记住下面这条铁律。

## 💡 自己复述一遍

合上屏幕，用一句话把这一讲讲给自己听：

<div class="csf-note">改和删之前，<strong>先用同样的 WHERE 跑一条 SELECT，看清楚命中的正是我想动的那些行，再把动词换成 UPDATE / DELETE</strong>；没有 WHERE 的 UPDATE / DELETE 会动全表。</div>

说不顺也没关系，回头再扫一眼"跟我做"。能把这句话讲明白，这一讲最值钱的东西你就拿到了。

## 🔧 翻车现场

### 翻车一：忘了 WHERE，一条命令改/删全表 <span class="csf-b csf-core">必读</span>

这是数据库世界**头号生产事故**，没有之一。`UPDATE books SET price = 0` 少了 WHERE，全表价格清零；`DELETE FROM books` 少了 WHERE，全表蒸发。

**为什么会发生**：人脑里想的是"改这一本书"，但手敲完 `SET price = ...` 就习惯性按了回车，WHERE 还没来得及写。越熟练越容易犯——因为手比脑子快。

**怎么根治**：靠的不是"小心点"，而是固定动作。把"先写 SELECT 看命中行"变成肌肉记忆：永远先 `SELECT ... WHERE ...`，确认命中行数符合预期，再把 `SELECT *` 换成 `UPDATE/DELETE`。**WHERE 一个字都不改**，只换动词。这样你永远不可能漏掉 WHERE——因为 WHERE 是你上一步已经验证过的。

### 翻车二：WHERE 写得太宽，命中了不该动的行 <span class="csf-b csf-key">重点</span>

比如你想给《代码大全》涨价，却写成 `WHERE author = 'McConnell'`，结果这位作者名下三本书全涨了。语法完全正确，但命中范围超出预期。

**怎么发现**：还是先 SELECT。如果你以为该命中 1 行，SELECT 却返回 3 行，或者 `.changes` 显示的数字不对，立刻警觉。**命中行数是你最忠实的报警器。**

### 翻车三：`SET price = 10` 和 `SET price = price + 10` 搞混 <span class="csf-b csf-skim">可跳读</span>

前者是"把价格直接设成 10"，后者是"在原价基础上加 10"。涨价 10 元要用后者。写错了不会报错，但结果完全不是你想要的——这种"不报错的错"最隐蔽，所以改完务必再 SELECT 一眼。

### 翻车四：以为删错了能"撤销" <span class="csf-b csf-key">重点</span>

新手常下意识觉得"删错了 Ctrl+Z 一下就回来"。**数据库里没有这个 Ctrl+Z。** 一条 DELETE 提交之后，数据通常就真没了，除非你有备份。这正是我们如此强调"先看后删"的原因——预防，是唯一可靠的后悔药。

<details class="csf-fold"><summary>那"事务"不是能回滚吗？<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
你可能听过"事务可以回滚（ROLLBACK）"，这是真的，而且是个救命的好东西。在 SQLite 里，你可以先 <code>BEGIN;</code> 开启一个事务，再做 UPDATE / DELETE，觉得不对就 <code>ROLLBACK;</code> 撤销，确认没问题再 <code>COMMIT;</code> 提交。但请注意两点：第一，一旦 <code>COMMIT;</code> 了就真的回不去了，回滚只在提交之前有效；第二，很多人在图形工具里是"自动提交"模式，每条语句一执行就立刻提交，根本没有回滚的窗口。所以事务是第二道防线，<strong>第一道防线永远是"先 SELECT 看清楚"</strong>。事务的完整玩法我们留到本系列后面专门讲，这一讲你先把"先查后改"练扎实就好。<br>一句话：别把希望寄托在"删错了再回滚"，而要让自己根本不删错。
</details>

## ✅ 自检三问

1. 我想给一本书改价，正确的工作顺序是哪三步？（提示：和"先查后改"有关）
2. `UPDATE books SET stock = 0`（没有 WHERE）和 `UPDATE books SET stock = 0 WHERE id = 2` 的结果有什么本质区别？
3. "影响行数 / 命中行数"为什么是个重要的安全信号？如果它和你预期的数字对不上，你该怎么办？

<details class="csf-fold"><summary>看看参考答案<span class="csf-b csf-skim">对照思路即可</span></summary>
1. 先用 <code>SELECT * FROM books WHERE ...</code> 跑一遍，确认命中的正是要改的那一行；再把 SELECT 换成 <code>UPDATE ... SET ... WHERE ...</code>（WHERE 照搬）执行；最后再 SELECT 一次验证结果。<br>2. 前者没有 WHERE，会把<strong>全表所有书</strong>的库存都改成 0；后者只改 id 为 2 的那一行。差别就是"动全表"和"动一行"。<br>3. 因为它直接告诉你这条语句到底动了多少行。如果你以为只动 1 行、它却说动了 5 行（或反之），几乎可以肯定 WHERE 写错了——这时应该立刻停手、回去检查 WHERE，而不是接着往下做。若已经在事务里且发现不对，可以 ROLLBACK 撤销。
</details>

## 🚀 挑战

在你的练习库里完成下面两个任务，**每一步都严格走"先 SELECT 验证 → 再 UPDATE/DELETE → 再 SELECT 确认"**：

1. 把库存大于 10 的书（应该有 1 本）库存减少 5。先 SELECT 看命中几行，再动手。
2. 把作者是 `Tanenbaum` 的书价格改成 79 元，改完验证一下是不是只改了该改的那本。
3. **加练（推荐）**：先 `.changes on`，然后随便挑一条 UPDATE，故意把 WHERE 写宽一点（比如用一个会命中多行的条件），观察 `.changes` 报出来的行数是不是比你预期的多。亲眼看到那个"对不上的数字"，你就真正理解了它为什么是报警器。

<div class="csf-note"><strong>关于 AI</strong>：这一讲的 SQL，请你自己一条条敲、自己验证，<strong>不要让 AI 代写</strong>。原因很实在——将来你工作中一定会用 AI 帮你生成 UPDATE / DELETE，而 AI 完全可能给你一条漏了 WHERE、或者 WHERE 范围过宽的删除语句。你唯一的护身符，就是<strong>拿到任何删改语句，都先把它的 WHERE 抠出来，自己跑一条 SELECT 看命中行，确认无误才执行</strong>。这个判断力只能靠自己一遍遍练出来，AI 替你练不了。</div>

## 📦 复制带走

<div class="csf-card">
<strong>本讲要装进脑子的 4 条：</strong><br>
1. <strong>改/删的铁律</strong>：先用同样的 WHERE 跑一条 SELECT 看命中行 → 确认无误 → 把动词换成 UPDATE/DELETE（WHERE 照搬）→ 再 SELECT 验证。<br>
2. <strong>没有 WHERE 就是动全表</strong>：<code>UPDATE books SET price=0</code> 改光所有行，<code>DELETE FROM books</code> 删光整张表——头号生产事故。<br>
3. <strong>命中行数是报警器</strong>：开 <code>.changes on</code>，影响行数和预期对不上就立刻停手查 WHERE。<br>
4. <strong>删了大概率回不来</strong>：数据库没有 Ctrl+Z，预防（先查后改）才是唯一可靠的后悔药。
</div>

下一讲（第06讲《汇总与分组：聚合函数 + GROUP BY + HAVING》）我们重新回到"只查不改"的安全地带，去学怎么把一堆数据汇总成有用的结论——总共有多少本书、平均价格多少、每个作者各有几本。学会了改和删，你已经能对数据"负责"了；接下来，我们让数据开口说话。
