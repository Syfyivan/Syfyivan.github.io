---
title: "《计算机基本功路线图 · 数据库》第00讲 · 把记住数据当回事——装好你的练习台"
date: 2026-07-07 09:00:00
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

<div class="csf-key-note">欢迎来到《数据库》这门课。这一讲不堆代码，只做三件事：<br>① 想清楚我们到底要练的是什么本事；② 把练习台装好；③ 让你亲手敲下人生第一条 SQL，看到它回话。<br>记住一句话：<strong>AI 能帮你写出一条 SQL，但它不知道你的数据该长什么样、这条语句会不会误删全表。</strong>这门课练的，就是那个 AI 替不了的"你"。</div>

你的手机相册记得每一张照片，微信记得你和谁聊过天，外卖 App 记得你昨天点了什么——这些"记住"，背后几乎都是同一样东西在默默干活：**数据库**。

它平时不出现在屏幕上，但所有应用最后都要把状态"落"进它。一旦你搞懂了数据存在哪、怎么不弄丢、怎么查得快，你就能看到应用表面之下到底是怎么运作的——这门课，就是带你一步步走下去。

## 🎯 这一讲你会学到什么

- 搞清楚四个最容易混的词：**数据库、数据库管理系统（DBMS）、SQL、SQLite**，到底谁是谁。
- 明白这门课的铁规矩：**为什么不能让 AI 替你写 SQL**，以及我们要练的"判断力"到底指什么。
- 在你自己的电脑上**装好 SQLite**，跑通**人生第一条 SQL**，确认练习台可用。
- 学会这门课贯穿始终的学习姿势：**先猜后做**。

这一讲很轻，几乎没有代码负担。但请认真做完最后的动手练——后面每一讲，都站在你今天搭好的这张台子上。

## 🛠 跟我做

### 先把四个词分清楚 <span class="csf-b csf-core">必读</span>

初学者最容易把这几个词搅成一锅粥。我们用一个生活类比，一次讲透。

想象一个**巨大的档案仓库**：

- **数据库（Database）**：就是这个仓库里**实际堆放的资料本身**——一排排表格、一条条记录。它是"被记住的东西"。
- **数据库管理系统（DBMS）**：是仓库的**管理员 + 整套管理制度**。你不能自己冲进去乱翻，得通过管理员存取、查找、保证别丢、别乱。我们常听到的 MySQL、PostgreSQL、SQLite，都是不同的管理员。
- **SQL**：是你和管理员沟通用的**那门语言**。你说一句 `SELECT ...`，管理员就照着去取。它是一门专门用来"问数据、改数据"的语言。
- **SQLite**：是一位**特别轻便的管理员**——不用单独请、不用搭服务器，它直接住在一个 `.db` 文件里。这门课就用它当练习对象。

<div class="csf-note">把它们的关系串成一句话：<strong>你用 <em>SQL</em> 这门语言，对着 <em>SQLite</em> 这个 DBMS 下命令，让它去管理存在 <code>.db</code> 文件里的那份数据库。</strong>读三遍，这门课的舞台就立起来了。</div>

<details class="csf-fold"><summary>为什么这门课选 SQLite，而不是 MySQL<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
MySQL、PostgreSQL 这类"重型管理员"功能更全，但要装服务、配端口、建账号，对零基础非常劝退——很多人卡在"装不上"就放弃了。<br>SQLite 把整个数据库塞进一个文件，零配置、跨平台、Mac 还自带。它麻雀虽小五脏俱全：建表、增删改查，连这些进阶能力都不缺——JOIN（把几张表的数据拼起来一块查）、索引（让查找变快的一种小目录）、事务（把一组操作捆在一起，要么全部成功、要么全部取消）。这些词你现在<strong>完全不用懂</strong>，后面每一讲都会单独拿出来讲清楚，这里只是先让你知道"它该有的都有"。正好够我们把基本功练扎实。你真实手机里的微信、浏览器、很多 App，本地存数据用的恰恰就是 SQLite——它不是玩具。<br>等基本功练成了，换到 MySQL 只是"换个管理员、规矩多一点"，SQL 这门语言是相通的。</details>

### 这门课的铁规矩：SQL 你自己敲 <span class="csf-b csf-key">重点</span>

现在 AI 写 SQL 又快又顺。那我们为什么还要自己学、自己敲？

因为**会让 AI 生成 SQL，和懂数据库，是两件完全不同的事**。

打个比方：AI 像一个英语很溜的翻译。你说"帮我查上个月消费最多的前十个用户"，它能秒翻成一条 SQL。但是——

- 它不知道你的表**该怎么设计**：用户、订单、商品该拆成几张表、谁连谁。
- 它不知道你这条语句**会不会出事**：一条少写了 `WHERE` 的 `DELETE`，可能瞬间清空整张表。
- 它不知道线上**为什么突然变慢**：是少了一个索引，还是查法本身就错了。

这些判断，**只能来自你脑子里那张数据模型图**。这门课要练的，不是"会不会写 SQL"，而是**会读懂、会改、会验证**一条 SQL——尤其是 AI 给你的那条对不对、安不安全。这比会复制粘贴重要一百倍。

<div class="csf-why">所以从下一讲开始，正文里凡是动手练，规矩都一样：<strong>每一条 SQL，先自己手敲，先在心里猜结果，再回车看真相。</strong>遇到不会的，可以问 AI "这是什么意思""我哪里写错了"，把它当家教；但别让它替你把答案直接生成出来贴上去。只复制粘贴的人，到第 07 讲设计表时一定会卡死——因为那时候考的就是你脑子里有没有那张图。</div>

### 装好你的练习台 <span class="csf-b csf-core">必读</span>

下面按你的系统选一条路。目标只有一个：在终端里能敲出 `sqlite3` 并进入它。

**第一步：打开终端。**

- **Mac**：按 `Command + 空格`，输入 `Terminal`（终端），回车打开。
- **Windows**：按 `Win` 键，输入 `cmd`，回车打开"命令提示符"。

<div class="csf-note">什么是"终端 / 命令行"？就是一个<strong>用打字代替点鼠标</strong>的黑框框。你输一行命令、回车，电脑执行、回话。它看着朴素，却是程序员每天打交道最多的工具之一。别怕它——这门课会带你一句一句敲熟。</div>

**第二步：装上 / 找到 sqlite3。**

Mac 用户运气好，系统自带。先验证一下，在终端里输入：

```bash
sqlite3 --version
```

如果回显出一串版本号（类似 `3.43.2 2023-10-10 ...`），恭喜，**你不用装任何东西**，直接跳到第三步。

如果提示 `command not found`（Mac 偶尔）或你是 **Windows 用户**，按下面来：

- **Windows**：去官网 [sqlite.org/download.html](https://sqlite.org/download.html)，找 "Precompiled Binaries for Windows" 一栏，下载名字里带 `sqlite-tools-win` 的那个压缩包。下载完按下面几步走，慢慢来，每一步都不难：
  1. **解压**：右键那个压缩包，选"全部解压缩"，解出来的文件夹里有个 `sqlite3.exe`——**这一个文件就是整个数据库管理系统**，不用再安装。
  2. **新建一个固定文件夹**：打开"此电脑"进入 C 盘，在空白处右键 →「新建」→「文件夹」，把它改名叫 `sqlite`。这样就有了一个 `C:\sqlite` 文件夹（`C:\` 就是 C 盘的根目录）。
  3. **把 exe 放进去**：把第 1 步解压出来的 `sqlite3.exe` 拖进刚建好的 `C:\sqlite` 文件夹里。
  4. **打开命令提示符并进入这个文件夹**：按 `Win` 键输入 `cmd` 回车打开命令提示符，输入 `cd C:\sqlite` 再回车（`cd` 是"切换到某个文件夹"的命令）。看到提示符开头变成了 `C:\sqlite>`，就说明你已经进对地方了。
- **Mac 没自带的情况**：如果你装过 [Homebrew](https://brew.sh)，一行 `brew install sqlite` 即可；没装也没关系，绝大多数 Mac 都自带，重开个终端再试一次 `sqlite3 --version`。

<div class="csf-why">注意体会一件事：SQLite 的"安装"轻到几乎不像安装——Mac 自带、Windows 一个 exe 就完事。这正是我们选它的原因。换成 MySQL，光"装好能跑"就够新手折腾半天了。</div>

**第三步：敲出你的第一条 SQL。** <span class="csf-b csf-key">重点</span>

现在见证时刻到了。在终端里输入这行（Windows 用户如果还没进文件夹，先输入 `cd C:\sqlite` 回车——`cd` 是命令行里"进入某个文件夹"的命令；因为 `sqlite3.exe` 放在 `C:\sqlite` 里，得先走进这个文件夹，电脑才找得到它、才能直接敲 `sqlite3`。进去后再敲）：

```bash
sqlite3 mydb.db
```

回车。这条命令的意思是：**请 SQLite 这位管理员，打开（没有就新建）一个叫 `mydb.db` 的数据库文件，我要开始干活了。** 你会看到提示符变成了 `sqlite>`，表示你已经"进到管理员屋里"了。

<div class="csf-note"><strong>先猜一下</strong>：接下来我要让 SQLite 帮我"算"出一句话 <code>hello, database</code>。你觉得它会原样回给我这句话，还是会报错说"我不认识这句话"？把你的猜测放心里，再敲下一行。</div>

在 `sqlite>` 提示符后面，输入（注意：`hello, database` 两边是**英文单引号**，结尾有个**英文分号** `;`）：

```sql
SELECT 'hello, database';
```

回车。你应该看到它一本正经地回了你一行：

```text
hello, database
```

成了！这就是你**人生第一条 SQL**。`SELECT` 是 SQL 里最常用的词，意思是"查询 / 取出"。这里我们还没建任何表，只是让它把一句固定的话原样取出来——相当于跟管理员打了声招呼，确认他在、听得懂话。

接着再敲两个"管家命令"看看：

```sql
.tables
```

回车后……大概率**什么都没有**。先猜：为什么？

因为我们这个 `mydb.db` 是全新的，**里面一张表都还没建**。`.tables` 是"列出所有表"的命令，空仓库自然列不出东西。这很正常，下一讲我们就开始往里放表。

<div class="csf-why">留意到没有：<code>SELECT ...;</code> 要带分号，<code>.tables</code> 不带分号、也不带分号结尾。这是因为以点开头的（如 <code>.tables</code> <code>.quit</code>）是 <strong>SQLite 自己的"管家命令"</strong>，不是标准 SQL；而真正的 SQL 语句（如 <code>SELECT</code>）习惯用分号收尾。这个区别先有个印象，后面会反复见到。</div>

最后，体面地退出来：

```sql
.quit
```

回车，你就回到了普通终端。这时如果你看一眼当前文件夹，会发现多了一个 **`mydb.db` 文件**——你的数据，从此就存在这一个文件里。把它删了，数据就没了；把它拷给别人，整个数据库就带走了。这就是 SQLite "一个文件即一个数据库"的含义。

**第四步：截图存档。** 把你看到 `hello, database` 回显的那一屏截下来，存好。这是你这门课的**第一张毕业凭证**——"我的练习台已就绪"。后面学有所成回头看，会想起就是从这一行开始的。

## 💡 自己复述一遍

合上屏幕，用一句话回答：**我刚才用什么语言、对着什么管理员、做了一件什么事？**

（参考答案：我用 SQL 这门语言，对着 SQLite 这个数据库管理系统，让它打开一个 `.db` 文件，并取出了一句 `hello, database`。）能顺畅说出来，这一讲的概念就稳了。

## 🔧 翻车现场

<div class="csf-card"><strong>翻车一：敲完 <code>SELECT</code> 没回显，光标停在 <code>...&gt;</code> 那里不动。</strong><br>原因：你<strong>漏了结尾的英文分号 <code>;</code></strong>。SQLite 以为你的话还没说完，在等你继续。<br>解法：直接补一个 <code>;</code> 再回车即可；或者输入 <code>;</code> 让它执行。记住：SQL 语句用分号收尾。</div>

<div class="csf-card"><strong>翻车二：报错 <code>unrecognized token</code> 或引号相关错误。</strong><br>原因：用了<strong>中文引号</strong>（'' 或 ""）或中文分号（；）。中文输入法下的标点和英文的不一样，SQLite 不认。<br>解法：切回英文输入法，单引号用 <code>'</code>，分号用 <code>;</code> 重敲一遍。</div>

<div class="csf-card"><strong>翻车三：终端提示 <code>sqlite3: command not found</code>。</strong><br>原因：要么没装/没找到，要么（Windows）没进到放 <code>sqlite3.exe</code> 的那个文件夹。<br>解法：Mac 重开终端再试或 <code>brew install sqlite</code>；Windows 先 <code>cd</code> 到解压目录（如 <code>cd C:\sqlite</code>）再敲。</div>

<div class="csf-card"><strong>翻车四：进了 <code>sqlite&gt;</code> 出不来，乱敲也没用。</strong><br>原因：你已经在 SQLite 内部了，普通终端命令（如 <code>ls</code>）在这儿不一定好使。<br>解法：输入 <code>.quit</code> 回车，干净退出；万一卡死，按 <code>Ctrl + C</code> 强制中断。</div>

## ✅ 自检三问

1. 数据库、DBMS、SQL、SQLite 四个词，你能各用一句话说清谁是谁、谁管谁吗？
2. 这门课为什么要求"每条 SQL 先自己敲、先猜结果"？AI 替你写有什么是它替不了的？
3. `SELECT 'hello';` 和 `.tables` 这两条，一个要分号一个不要，区别在哪？

三问都能不查资料答上来，就可以进下一讲了。答不上来的那条，回到对应小节再读一遍——不丢人，打地基本就该慢。

## 🚀 挑战

进 `sqlite3 mydb.db`，**先猜再敲**下面这条，看看 SQLite 会回你什么：

```sql
SELECT 1 + 1;
```

它会回 `2` 吗，还是会原样回 `1 + 1`？敲完验证你的猜测。

再加一道：试着让它同时取出两样东西——

```sql
SELECT 'hi', 100;
```

回显会是一行还是两行？中间用什么分隔？猜完再回车。做完别忘了 `.quit`。把这两条的结果记在你的笔记里，这就是你"先猜后做"练习的第一页。

## 📦 复制带走

<div class="csf-card">📌 <strong>一句话理清舞台</strong>：用 <strong>SQL</strong> 这门语言，对着 <strong>SQLite</strong>（一个住在 <code>.db</code> 文件里的轻便 DBMS）下命令，去管理那份<strong>数据库</strong>。<br>📌 <strong>这门课的铁规矩</strong>：每条 SQL 先自己手敲、先猜结果再回车；AI 当家教问思路，别当代笔贴答案。<br>📌 <strong>练习台已就绪</strong>：<code>sqlite3 mydb.db</code> 进入 → <code>SELECT 'hello, database';</code> 看到回显 → <code>.quit</code> 退出，目录里留下一个 <code>.db</code> 文件。<br>📌 <strong>两个小坑记牢</strong>：SQL 语句结尾要英文分号 <code>;</code>；引号、分号都要用英文输入法。</div>

下一讲我们正式开干：**第01讲《为什么要数据库：Excel 和文本文件撑不住的那一天》**——先搞明白一个最朴素的问题：明明有 Excel、有记事本，为什么还非要数据库不可？到时见。
