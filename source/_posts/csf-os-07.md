---
title: "《计算机基本功路线图 · 操作系统》第07讲 · 数据怎么长期存住：文件系统"
date: 2026-07-06 16:00:00
tags: [计算机基础, 操作系统, 零基础, 编程入门, 课程]
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

<div class="csf-key-note">上一讲我们说，内存是程序的"临时工作台"——一断电就清空。可你的照片、作业、代码为什么关机后还在？因为它们躺在硬盘里，由操作系统的另一位管家——<strong>文件系统</strong>——按一套规矩长期保管着。这一讲，我们就掀开"文件夹"这个图标，看看数据到底是怎么被存住、被找到、又被"删掉"的。</div>

上一讲的虚拟内存解决的是"程序运行时的内存怎么用"。但内存是易失的：断电即忘。要把数据**长期**留住，得交给硬盘（或固态盘、U 盘）。而硬盘本身只是一大块能存 0 和 1 的空间，它不认识什么叫"照片""文件夹"。把这块空间组织成你能理解的目录树、文件、权限——这件事，就是文件系统在干。

这一讲很贴近日常：学完你每天看到的那些文件、文件夹、属性面板，背后是什么，你都能说清楚。哪一段读着慢，停下来多看两眼就好，这很正常。

## 🎯 这一讲你会学到什么

- **文件和目录到底是什么**：为什么文件夹能套文件夹，形成一棵"树"。
- **路径怎么读**：`/Users/你/桌面/作业.docx` 这一串斜杠是在说什么。
- **文件的"身份证"——元数据**：大小、修改时间、权限这些信息存在哪、怎么看。
- **inode 直觉**：文件名和文件内容其实是两回事，理解这点能解开很多谜题。
- **"删除"和"格式化"真相**：为什么删掉的文件常常还能恢复。

动手部分，你会在自己电脑上用几个命令亲眼观察一个目录：看出每一列是什么意思，看磁盘还剩多少空间，看某个文件夹占了多大。这些命令程序员每天都在用，今天就让它们成为你的工具。

<div class="csf-note">先约定：本讲命令以 <strong>Mac / Linux</strong> 的终端为主（Mac 上打开"终端 Terminal"，Linux 打开任意终端）。<strong>Windows</strong> 用户我会在每处给出对应写法（用"命令提示符 cmd"或"PowerShell"）。两边原理完全一样，只是命令拼写不同。</div>

## 🛠 跟我做

### 第一步：先认门牌——什么是路径 <span class="csf-b csf-core">必读</span>

你电脑里所有文件，都住在一棵**树**上。最顶上是"根"，往下一层层分叉成文件夹，文件夹里再放文件或更多文件夹。一个文件的**路径（path）**，就是从根走到它的那条"门牌地址"。

- Mac / Linux：根是 `/`，分隔用 `/`。例如 `/Users/lin/Desktop/hw.txt`。
- Windows：根是盘符如 `C:\`，分隔用 `\`。例如 `C:\Users\lin\Desktop\hw.txt`。

先认两个随时要用的概念：

- **当前目录（你现在"站"在哪）**：终端刚打开时，通常站在你的"家目录"。家目录就是属于你这个登录用户的私人文件夹，存着你的桌面、下载、文档这些东西；Mac 上一般是 `/Users/你的名字`，Windows 上一般是 `C:\Users\你的名字`。后面会用 `~` 这个符号来代表它。
- **`.` 表示当前目录，`..` 表示上一层目录。** 这两个小点后面常用到。

试着在终端里输入下面两行，看你现在站在哪、这里有什么（**先猜**：你觉得会列出哪些熟悉的文件夹？比如"桌面""下载"？）：

```bash
pwd        # print working directory，打印我现在站在哪个目录
ls         # list，列出当前目录里有什么
```

Windows（cmd 或 PowerShell）对应（这里的 `::` 和上面 bash 里的 `#` 一样，都是"注释"——只是给人看的说明，不用照着敲）：

```bat
cd         :: 单独输 cd 会显示当前目录（PowerShell 里用 pwd 也行）
dir        :: 列出当前目录内容
```

揭晓：`pwd` 多半会显示类似 `/Users/你的名字`，`ls` 会列出 `Desktop`、`Documents`、`Downloads` 这些。看到了吗？你平时在访达/资源管理器里点的那些文件夹，在终端里就是这一行行名字。**图形界面和命令行，看的是同一棵树。**

### 第二步：看懂文件的"身份证"——`ls -l` 每一列 <span class="csf-b csf-key">重点</span>

光有名字不够。每个文件还带着一堆"档案信息"：多大、什么时候改的、谁能动它。这些信息叫**元数据（metadata）**。用 `ls` 加上 `-l`（long，详细）参数就能看到：

```bash
ls -l
```

你会看到类似这样的几行（数字会不一样，结构一样）：

```text
-rw-r--r--  1 lin  staff   2048 Jun 29 14:30 hw.txt
drwxr-xr-x  5 lin  staff    160 Jun 28 09:12 photos
```

**先猜**：这两行里，哪一行是文件、哪一行是文件夹？哪个数字最可能是"文件大小"？猜完再往下看拆解。

我们把第一行从左到右拆开：

<div class="csf-legend">① <code>-rw-r--r--</code> → 类型 + 权限（最关键，下面单独讲）<br>② <code>1</code> → 链接数（先不用管，理解成"有几个名字指向它"）<br>③ <code>lin</code> → 文件的拥有者（owner）<br>④ <code>staff</code> → 拥有者所在的组（group）<br>⑤ <code>2048</code> → <strong>文件大小</strong>，单位是字节（byte）。2048 字节 = 2KB<br>⑥ <code>Jun 29 14:30</code> → <strong>最后修改时间</strong><br>⑦ <code>hw.txt</code> → 文件名</div>

对照看第二行 `drwxr-xr-x ... photos`：开头是 `d`，说明它是 **directory（目录/文件夹）**，不是普通文件。这就是第一步留的悬念答案。

<div class="csf-note">想让大小看得更舒服？加个 <code>-h</code>（human-readable，人类友好）：<code>ls -lh</code>，它会把 2048 显示成 <code>2.0K</code>，把一百万字节显示成 <code>1.0M</code>。<br>Windows 的 <code>dir</code> 默认就会列出大小和修改时间，权限那套机制不同，这里先不展开。</div>

### 第三步：读懂权限那 10 个字符 <span class="csf-b csf-core">必读</span>

最左边那串 `-rw-r--r--` 是最容易"看着像乱码"的部分，其实它非常有规律。一共 10 个字符，分成 1 + 3 + 3 + 3 四段：

```text
-  rw-  r--  r--
│   │    │    └─ 其他人（others）能干什么
│   │    └────── 同组的人（group）能干什么
│   └─────────── 拥有者（owner）能干什么
└─────────────── 类型：- 是普通文件，d 是目录
```

每一段的三个位置固定是 **r、w、x** 的顺序：

- **r** = read，可读
- **w** = write，可写（修改/删除内容）
- **x** = execute，可执行（对程序文件是"能运行"，对目录是"能进得去"）

是哪个字母就表示有该权限，是 `-` 就表示没有。所以 `-rw-r--r--` 读作：这是个普通文件；拥有者可读可写（`rw-`）；同组的人只读（`r--`）；其他人也只读（`r--`）。

**先猜再验证**：下面这一行权限，"其他人"能不能修改这个文件？

```text
-rwxrw-r--  1 lin  staff  500 Jun 29 root.sh
```

揭晓：最后一段是 `r--`，只有 r，没有 w——所以**其他人不能改**，只能读。（拥有者 `rwx` 可读可写可执行，同组 `rw-` 可读可写不可执行。）能自己读出来，说明你已经会看权限了。

### 第四步：看磁盘还剩多少、某个文件夹有多大 <span class="csf-b csf-key">重点</span>

两个常用命令，名字很好记：**df**（disk free，磁盘剩余）和 **du**（disk usage，磁盘占用）。

看整块磁盘的总量和剩余：

```bash
df -h        # -h 同样是人类友好单位
```

输出里重点看这几列：`Size`（总大小）、`Used`（已用）、`Avail`（剩余可用）、`Use%`（已用百分比）。哪天你电脑提示"磁盘空间不足"，先跑这条看一眼到底满到什么程度。

看**某个文件夹**占了多大（比如你的下载文件夹）：

```bash
du -sh ~/Downloads        # -s 只给总和(summary)，-h 友好单位；~ 代表你的家目录
```

`du -sh` 会算上这个文件夹里所有子文件夹和文件，给你一个总数，比如 `12G`。想找出"到底是哪个文件夹在吃空间"时，这条命令是利器。

Windows 对应：

```powershell
# 看磁盘剩余：直接打开"此电脑"就能看到每个盘的进度条，或在 PowerShell 里：
Get-PSDrive C
```

看某个文件夹有多大，Windows 上**最省事的办法**：在资源管理器里**右键点这个文件夹 → 属性**，弹出的窗口里"大小"那一栏就是答案，不用碰命令行。

<details class="csf-fold"><summary>想用命令算文件夹大小？这一行 PowerShell（看不懂可跳过）<span class="csf-b csf-skim">进阶 · 可跳读</span></summary>PowerShell 没有像 <code>du</code> 那样的现成命令，得自己把文件夹里所有文件的大小加起来。下面这行就是干这件事的，逐段拆开看其实不吓人。<br>完整命令（一整行）：<br><code>"{0:N0} MB" -f ((Get-ChildItem $HOME\Downloads -Recurse | Measure-Object Length -Sum).Sum / 1MB)</code><br>拆解（从里往外读）：<br>① <code>Get-ChildItem $HOME\Downloads -Recurse</code>：列出"家目录里的 Downloads 文件夹"中的所有东西，<code>-Recurse</code> 表示连子文件夹里的也一个不漏地翻出来。<br>② <code>| Measure-Object Length -Sum</code>：把上一步列出的文件，按 <code>Length</code>（文件大小）这一项做汇总，<code>-Sum</code> 表示求和——也就是把所有文件大小加在一起。<br>③ <code>.Sum / 1MB</code>：取出上一步算好的总和，再除以 <code>1MB</code>，把单位从"字节"换算成"MB"。<br>④ <code>"{0:N0} MB" -f (...)</code>：这是 PowerShell 的格式化写法，把算出来的数字塞进 <code>{0}</code> 的位置，<code>N0</code> 表示"保留 0 位小数、每三位加个千分逗号"，最后拼出像 <code>12,000 MB</code> 这样好读的结果。<br>看不懂也完全没关系——前面右键"属性"的办法能得到同样的答案。</details>

### 第五步：亲手建一个文件，再看它的属性 <span class="csf-b csf-core">必读</span>

现在动手造一个文件，全程观察它的元数据怎么"长出来"。

```bash
cd ~                       # 回到家目录，找得到东西
echo "hello file system" > myfirst.txt   # 把这句话写进一个新文件
ls -lh myfirst.txt         # 看看它的属性
```

**先猜**：这个文件大小大概是多少字节？（提示：数一下 `hello file system` 有几个字符，再加上结尾一个看不见的换行符。）

揭晓：`hello file system` 是 17 个字符，加上 `echo` 自动补的换行符共 18 字节。`ls -lh` 里大小应当显示约 `18B`。修改时间应该就是你刚刚操作的此刻——因为这个文件刚刚诞生。

再做一个小实验，体会"修改时间会变"：

```bash
echo "one more line" >> myfirst.txt   # 注意是 >> ，追加一行而不是覆盖
ls -lh myfirst.txt                     # 再看，大小变大了，修改时间也更新了
cat myfirst.txt                        # cat 把文件内容打印出来看看
```

<div class="csf-note">划重点：<code>&gt;</code> 是<strong>覆盖</strong>（清空原内容再写），<code>&gt;&gt;</code> 是<strong>追加</strong>（在末尾加）。这俩差一个字符，后果差很远——记牢它。Windows 的 cmd / PowerShell 里 <code>&gt;</code> 和 <code>&gt;&gt;</code> 含义相同。</div>

<details class="csf-fold"><summary>细究：文件名和文件内容，其实是两回事（inode 直觉）<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
你可能默认"文件名就是文件"。但在文件系统里，它俩是分开存的。<br>系统给每个文件的<strong>真身</strong>（内容在硬盘哪些块、多大、权限、时间……这些元数据）一个编号，在 Linux/Mac 上叫 <strong>inode</strong>。而你看到的"文件名"，只是某个目录里的一条记录：<code>名字 → inode 编号</code>。<br>这解释了几件怪事：<br>① <strong>改名很快</strong>：给几个 G 的电影改名是一瞬间的事——因为只改了"名字→编号"这条小记录，没动内容。<br>② <strong>同一份内容可以有多个名字</strong>（硬链接）：两个名字指向同一个 inode，删掉一个名字，内容还在。<br>③ 上一讲讲虚拟内存时说过"程序看到的地址是假的、由系统翻译成真地址"——这里是同一种智慧：<strong>给你一个好记的名字，背后用编号管理真身。</strong>计算机里这种"加一层翻译"的套路，你会反复遇到。<br>用 <code>ls -i</code> 可以看到每个文件的 inode 编号。</details>

## 💡 自己复述一遍

合上屏幕，用一句话说说看：**文件系统是干什么的？`ls -l` 里那个最长的字符串（如 `-rw-r--r--`）在说什么？**

（参考：文件系统是操作系统把硬盘组织成"目录树 + 文件 + 元数据"的那套规矩；那串字符的第一位是类型、后九位按 owner/group/others 三组、每组按 r/w/x 顺序，表示谁能读、写、执行。）能说个八九不离十，这一讲的核心就拿下了。

## 🔧 翻车现场

**翻车一：以为"删除文件 = 数据立刻从硬盘上消失"。** <span class="csf-b csf-key">重点</span><br>这是本讲最重要的一个认知纠偏。你按下删除（甚至清空回收站），绝大多数情况下，操作系统并没有真的去硬盘上把那片数据擦成 0。它只是做了件轻巧的事：把那块空间在"账本"上**标记为可覆盖**，并删掉"名字 → inode"那条记录。数据本身还原封不动躺在原处，直到将来某次写入新文件时，恰好被盖在那片空间上，才真正消失。<br>**这正是"删掉的文件常常还能被恢复"的原因**——只要还没被新数据覆盖，专门的恢复软件就能把它捞回来。<br>**两个现实提醒**：① 重要文件误删，先别急、别再往那块盘大量写东西，越早恢复成功率越高。② 反过来，想彻底销毁隐私文件，普通"删除"并不够，需要专门的"安全擦除/覆写"工具或加密手段。

**翻车二：分不清 `>` 和 `>>`，一不小心把文件清空了。**<br>`>` 会先清空再写。如果你想往日志里追加却写成了 `>`，原内容就没了。养成习惯：要保留旧内容，永远用 `>>`。

**翻车三：路径里有空格或中文，命令报错。**<br>比如文件夹叫 `My Docs`，直接 `cd My Docs` 会被当成两个参数而失败。解决：用引号包起来 `cd "My Docs"`，或给空格前加反斜杠 `cd My\ Docs`。

**翻车四：`du` 看文件夹大小跑得很慢、或权限报错。**<br>对很大的目录（比如整个家目录），`du` 要逐个统计，慢是正常的，耐心等。看到几行 `Permission denied` 也别慌，那是有些系统文件夹不让你看，不影响其余结果。

## ✅ 自检三问

1. `ls -l` 输出里，怎么一眼区分"普通文件"和"文件夹"？文件大小和修改时间分别在哪一列？
2. 权限串 `-rwxr-xr--` 拆开看，拥有者、同组、其他人各能做什么？
3. 你"删除并清空回收站"后，那份数据通常处于什么状态？为什么有时还能恢复？

（答不上来的，回到对应步骤再看一眼，比硬背强。）

## 🚀 挑战

在你电脑上**真刀真枪**走一遍，把观察写成三四行笔记（自己写，别让 AI 替你跑也别让它替你编结果）：

1. 用 `df -h` 看你的磁盘**总共多大、还剩多少**，记下 `Use%`。
2. 挑你最大的两三个文件夹（比如 `~/Downloads`、`~/Movies`），分别用 `du -sh` 量一下，看谁是"空间大户"。
3. 进阶（可选）：新建一个文件，用 `ls -li` 记下它的 inode 编号；然后给它改名（`mv 旧名 新名`），再 `ls -li` 看 inode 编号变了没有。**先猜**：改名后编号会变吗？跑出来对照你的猜测，想一想这说明文件名和内容是什么关系。

<div class="csf-note">这个挑战的价值不在命令本身，而在"我能亲手观察自己的电脑、并解释看到的现象"。这种"动手 + 解释"的能力，正是后面排查"卡了/慢了/满了"的底子。让 AI 当你的陪练——看不懂某列输出可以问它"这一列是什么意思"，但命令要你自己敲、结果要你自己读。</div>

## 📦 复制带走

<div class="csf-card">1. <strong>文件系统</strong>是操作系统把硬盘组织成"目录树 + 文件 + 元数据"的规矩；图形界面里的文件夹，和终端里看到的，是同一棵树。<br>2. <code>ls -l</code> 一行里：开头 <code>d/-</code> 区分目录/文件，接着 9 位权限按 owner/group/others × r/w/x，后面跟拥有者、大小（字节）、修改时间、文件名。<br>3. 看空间用 <code>df -h</code>（整盘剩余）和 <code>du -sh 目录</code>（某文件夹多大）；建文件、看属性用 <code>echo &gt; 文件</code> 配 <code>ls -lh</code>，<code>&gt;</code> 覆盖、<code>&gt;&gt;</code> 追加别搞混。<br>4. "删除"通常只是把空间标记为可覆盖、抹掉名字记录，数据还在——所以误删常能恢复，而真要销毁隐私得用专门擦除工具。</div>

下一讲（第08讲《多个人同时改一个数：并发与竞态》），我们离开"数据怎么存"，去看一个更烧脑也更有意思的问题：当多个程序、多个线程**同时**去动同一份数据，结果为什么会时对时错？那是 AI 写的并发代码最容易翻车、也最难讲清的地方，咱们一步步拆。
