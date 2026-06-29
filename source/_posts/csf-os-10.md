---
title: "《计算机基本功路线图 · 操作系统》第10讲 · 程序怎么求操作系统办事：系统调用"
date: 2026-07-06 19:00:00
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

<div class="csf-key-note">你写的程序其实是个"被关起来的人"：它能在自己屋里算数、改自己的变量，但只要想读一个文件、上一次网、开一个新进程，就必须隔着门喊一声，请操作系统这位"大管家"代办。这一声"喊话"，就叫<strong>系统调用（system call）</strong>。这一讲，我们就趴在门缝上，亲眼看看你的程序到底偷偷喊了多少声。</div>

## 🎯 这一讲你会学到什么

- 为什么程序**不能自己**读文件、上网、开进程，非得"求"操作系统？
- 什么是**用户态**和**内核态**，程序"喊话"那一瞬间机器里发生了什么。
- 你天天写的 `print`、`open` 这些，和系统调用到底是什么关系——它们**不是一回事**。
- 几个你一定会遇到的常见系统调用：`open` / `read` / `write` / `fork`，分别对应你平时的哪个动作。
- 亲手用追踪工具，把一条普通命令背后调的系统调用**抓出来看**。

<div class="csf-note">这一讲是承上启下的一讲。前面我们讲了进程、内存、CPU 调度、锁——那些都是操作系统"在管什么"。这一讲讲的是程序和操作系统"怎么对话"。下一讲（第11讲）我们就把这些全串起来，走一遍从开机到程序运行的完整旅程。</div>

## 🛠 跟我做

### 先想清楚：程序为什么要"求"人？ <span class="csf-b csf-core">必读</span>

先做个小实验，在脑子里跑。假设你写了一行代码，想往硬盘上存一个文件。你觉得这行代码是**直接**指挥硬盘转起来、把数据写进去的吗？

先猜一下：**是 / 不是**。

答案是：**不是**。你的程序根本碰不到硬盘。

为什么？因为如果**每个**程序都能直接对硬件下命令，那就乱套了：

- 一个有 bug 的程序可能把你别的文件全覆盖掉；
- 一个恶意程序可以直接读你的银行密码文件、把摄像头打开；
- 两个程序同时抢着用网卡，谁也说不清数据该发给谁。

所以现代操作系统立了一条铁规矩：**硬件和关键资源，普通程序一律不许直接碰。** 想用，就得通过操作系统这道"门"提申请，由操作系统统一审核、统一代办。

<div class="csf-why">这就像住酒店：你不能自己跑进厨房开火做饭（太危险，会烧了整栋楼），但你可以打电话给前台点餐。前台（操作系统）核实你是哪个房间、有没有权限，然后替你去厨房（硬件）办。系统调用，就是你打给前台的那通电话。</div>

### 用户态 vs 内核态：屋里和屋外 <span class="csf-b csf-key">重点</span>

CPU 在跑代码时，有两种"身份模式"，硬件层面就分得清清楚楚：

<div class="csf-legend"><strong>用户态（user mode）</strong>：你的程序平时待的地方。权限低，只能动自己的内存、做自己的计算，碰硬件会被硬件当场拦下。<br><strong>内核态（kernel mode）</strong>：操作系统内核干活的地方。权限最高，能直接指挥硬件、访问任何内存。</div>

平时你的程序一直跑在**用户态**。当它需要读文件时，会触发一次系统调用，这一瞬间 CPU **切换到内核态**，由操作系统内核去真正操作硬件；办完了，再**切回用户态**，把结果交还给你的程序，你的代码接着往下跑。

先猜一下：这个"切过去、办事、再切回来"，比你程序内部算一次加法，是**快一点点 / 慢很多**？

答案是：**慢很多**（往往慢成百上千倍）。所以这也解释了一个很实际的现象——**频繁的小读小写会很慢**，因为每一次都要来回切一趟门。这个点先记住，下一讲排查"为什么慢"时会用到。

<div class="csf-note">关键就一句话：<strong>用户态喊话 → 切到内核态办事 → 切回用户态拿结果</strong>。这一来一回的"切换"，就是系统调用的核心动作，也是它"贵"的原因。</div>

### API、库函数、系统调用：别搞混 <span class="csf-b csf-key">重点</span>

这是初学者最容易绕晕的地方，我们用一张关系图捋清楚。假设你用 Python 写 `print("hi")`：

```text
你写的代码        print("hi")            ← 你调用的是"库函数 / API"
    │
    ↓ 库内部帮你转化
标准库            内部最终调用 write(...)  ← 真正向内核喊话的"系统调用"
    │
    ↓ 切换到内核态
操作系统内核      真正把 "hi" 送到屏幕     ← 内核态干活，碰硬件
```

看明白没有？

- **`print` 是库函数 / API**：是编程语言或库为了方便你而包装好的"友好接口"。它本身不碰硬件。
- **`write` 是系统调用**：是程序向操作系统内核喊话的"那一声"，由内核接管去碰硬件。

一个库函数底下可能压根没有系统调用（比如纯算数学的函数），也可能藏着一个甚至好几个系统调用。**API 是给人用的门面，系统调用是给内核听的暗号。** 这俩不是一回事，但常常一前一后出现。

<details class="csf-fold"><summary>那"系统调用"和"API"这两个词到底差在哪<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
严格说，API（应用程序接口）是个更大的概念：任何一组"别人提供给你调用的函数 / 约定"都能叫 API，比如某个库的 API、某个网站的 API。系统调用是操作系统提供给程序的那一类特殊接口，可以看成"操作系统的 API"。<br>但日常我们说"API"时，多半指库函数那一层（给程序员用的友好接口）；说"系统调用"时，特指真正穿过用户态/内核态边界、请内核办事的那一层。记住它们处在不同的高度就行：你的代码 → 库函数/API → 系统调用 → 内核。</details>

### 几个你天天在用、却没意识到的系统调用 <span class="csf-b csf-core">必读</span>

下面这几个名字，几乎是所有操作系统都有的（名字可能略不同，思路一样）。看的时候，请对照右边"你平时的什么操作"：

<div class="csf-legend"><strong>open</strong>：打开一个文件，拿到一个"号码牌"（叫文件描述符）。← 你双击打开一个文档、程序读配置文件。<br><strong>read</strong>：凭号码牌从文件/网络里读数据进来。← 程序加载存档、网页读取数据。<br><strong>write</strong>：凭号码牌把数据写出去（写文件、发网络、甚至打印到屏幕）。← 你按保存、程序打日志、`print` 输出。<br><strong>fork</strong>（在 Mac、Linux 这类系统上叫这个名字）：复制出一个新进程。← 你在终端敲一条命令、点开一个新标签页。</div>

注意一个反常识的点：连**往屏幕打印**，本质上都是一次 `write` 系统调用（写到一个叫"标准输出"的特殊去处）。所以"程序里最普通的一句 `print`"，背后也藏着一次穿越内核的喊话。这正是这一讲想纠正的最大误解——**系统调用一点都不"高级遥远"，它就在你写的每一行 I/O 里。**

这里第一次冒出"I/O"这个词，先解释清楚再往下走：I/O（读音"爱欧"，就是 Input/Output，输入/输出——说人话就是"读数据进来、写数据出去"这类和外界打交道的活，比如读文件、上网、往屏幕打印）。前面讲的读文件、上网、打印，全都属于 I/O。后面再看到"小 I/O"，指的就是这类活，不用再回头翻。

### 动手练：亲眼抓出系统调用 <span class="csf-b csf-core">必读</span>

光说不练假把式。下面我们用"追踪工具"趴在门缝上，看一条最简单的命令到底喊了哪些系统调用。三个系统选你自己的那个跑就行。

我们追踪的目标命令很简单：**读出一个小文件的内容**。我们先造一个文件：

```bash
echo hello-syscall > demo.txt
```

#### Linux：用 strace

```bash
strace -e trace=open,openat,read,write cat demo.txt
```

这条命令的意思是：用 `strace` 跟踪 `cat demo.txt` 这条命令，并且**只看** `open`/`openat`/`read`/`write` 这几类系统调用（不然刷屏太多）。

<div class="csf-note">如果提示没有 strace，用 <code>sudo apt install strace</code>（Debian/Ubuntu）或 <code>sudo yum install strace</code>（CentOS）装一下。如果想看"全部"系统调用感受一下刷屏，把 <code>-e trace=...</code> 去掉直接 <code>strace cat demo.txt</code>。</div>

#### macOS：用 sudo dtruss

```bash
sudo dtruss cat demo.txt
```

Mac 上对应的工具叫 `dtruss`，**必须加 `sudo`**（要管理员权限才能偷看别人喊话）。输出会很多，慢慢往上翻，找带 `open`、`read`、`write` 字样的行。

<div class="csf-note">如果 dtruss 报权限相关的错（System Integrity Protection / SIP 拦截），这是 Mac 的安全机制在起作用，属正常现象。你可以换个思路：用 <code>sudo dtruss -t write echo hi</code> 只看 write，或者干脆跟着下面 Linux 的输出读懂原理即可，不必死磕环境。</div>

#### Windows：用 Process Monitor

Windows 没有 strace，但有图形化的神器 **Process Monitor**（微软官方 Sysinternals 工具，免费）：

1. 去微软 Sysinternals 官网下载 Process Monitor，解压运行 `Procmon.exe`。
2. 它一打开就疯狂刷屏（整台机器所有进程的活动）。先按工具栏的过滤按钮，加一条过滤：`Process Name is notepad.exe`（或你想观察的程序）。
3. 再用 Filter 把类别限定到 `File System Activity`（文件系统活动）。
4. 然后用记事本打开、保存 `demo.txt`，回到 Process Monitor 看那一串 `CreateFile`、`ReadFile`、`WriteFile`——这些就是 Windows 版的"打开/读/写"调用。

<div class="csf-why">Windows 的系统调用名字和 Unix 不一样（叫 CreateFile / ReadFile / WriteFile 这种），但<strong>干的事一模一样</strong>：打开拿号码牌、按号码牌读、按号码牌写。换了套话术，剧情没变。</div>

#### 你应该看到什么 <span class="csf-b csf-key">重点</span>

在 Linux 上，刷屏的输出里，你大概能从一堆杂七杂八里挑出这么几行关键的（细节因系统而异，看个意思）：

```text
openat(AT_FDCWD, "demo.txt", O_RDONLY) = 3
read(3, "hello-syscall\n", 131072)     = 14
write(1, "hello-syscall\n", 14)        = 14
read(3, "", 131072)                    = 0
```

先别急着划走，我们一行行读懂它——**这是这一讲最值钱的部分**：

- 第 1 行 `openat(... "demo.txt" ...) = 3`：程序请内核打开 `demo.txt`，内核办成了，发回一个号码牌 **3**（文件描述符）。括号里的 `AT_FDCWD`、`O_RDONLY` 是一些参数细节（`O_RDONLY` 意思是"以只读方式打开"），新手现在完全可以先不管，盯住命令名 `openat` 和最后的 `= 3` 就够了。
- 第 2 行 `read(3, ...) = 14`：凭 3 号牌读，读到了 14 个字节，正好是 `hello-syscall` 加一个换行。**注意它读的内容就明晃晃写在那儿**。那个又长又怪的数字 `131072` 是"这次最多允许读这么多字节"的容量上限，实际只读到了 14 个，这个数字新手可以忽略。
- 第 3 行 `write(1, ..., 14) = 14`：把这 14 个字节 `write` 到 **1** 号牌——1 号是"标准输出"，也就是你的屏幕。**看吧，连显示到屏幕都是一次系统调用。**
- 第 4 行 `read(3, "") = 0`：再读一次，返回 0，意思是"文件读完了，没有更多内容"。

一个简单的 `cat demo.txt`，看起来一步到位，背后其实是程序和内核**来来回回喊了好几声**：开门、读、转手写到屏幕、再确认读完。这就是程序真实运行的样子。

<div class="csf-note">这个动手练请你<strong>自己亲手跑一遍并把关键几行抄下来认一认</strong>，别让 AI 替你解读输出。当你能指着自己机器上刷出来的 <code>openat / read / write</code> 说"这是打开、这是读、这是写到屏幕"，系统调用对你就再也不抽象了。AI 可以在你卡住时帮你解释某一行参数是什么意思，但"看懂全过程"这件事，得你自己的眼睛过一遍。</div>

## 💡 自己复述一遍

合上屏幕，用一句话说给自己听：

> 程序想碰硬件（读文件、上网、开进程）自己不许动手，得通过**系统调用**请操作系统代劳；喊话那一刻 CPU 从**用户态**切到**内核态**办事，办完再切回来。

如果这句话你能不看屏幕说出来，这一讲的核心就拿住了。

## 🔧 翻车现场

<div class="csf-card"><strong>翻车一：以为系统调用很"高级"、跟我没关系。</strong><br>真相：你写的每一句 <code>print</code>、每一次读写文件，背后都有系统调用。它不在云端、不在远方，就在你刚刚 strace 出来的那几行里。它是程序和操作系统之间最日常的对话。</div>

<div class="csf-card"><strong>翻车二：把"库函数"和"系统调用"当成一回事。</strong><br>真相：<code>print</code>、<code>open()</code> 这种是库函数 / API（给你用的友好门面），底下可能调了 <code>write</code> / <code>open</code> 这样的系统调用，也可能一个都没调。门面是门面，喊话是喊话，别混。</div>

<div class="csf-card"><strong>翻车三：strace / dtruss 跑出来一报错就慌。</strong><br>真相：Linux 上常见"未安装"，装一下即可；Mac 上 dtruss 常因 SIP 安全机制受限，需要 <code>sudo</code> 甚至换命令，这是系统在保护你，不是你做错了。抓不到也别死磕环境，把上面 Linux 的示例输出读懂，原理是一样的。</div>

<div class="csf-card"><strong>翻车四：以为系统调用"随便调、没成本"。</strong><br>真相：每次系统调用都要做一次用户态↔内核态切换，比普通运算慢得多。这就是为什么"频繁小读小写"会拖慢程序——这个直觉，下一讲排查性能时会派上大用场。</div>

## ✅ 自检三问

1. 你的程序想读硬盘上一个文件，它能自己直接指挥硬盘吗？如果不能，它得怎么办？
2. "用户态切到内核态"发生在什么时候？为什么这个切换是有成本的？
3. `print("hi")` 和系统调用 `write` 是不是同一个东西？它们是什么关系？

（答不上来的那一问，回到对应小节再读一遍，别急着往下走。）

## 🚀 挑战

给你一个**真·动手**的小任务，自己完成、别让 AI 代跑：

1. 用你系统对应的工具（strace / dtruss / Process Monitor），换一个**会上网**的命令来追踪，比如 Linux/Mac 上的 `curl example.com`，或者用浏览器打开一个网页时观察。
2. 这次你重点找**和网络有关**的系统调用——关键词盯着 `socket`、`connect`、`sendto` / `send`、`recvfrom` / `recv`（Windows 上类似 `TCP Connect`、`TCP Send`、`TCP Receive`）。这几个名字用大白话理解就是：`socket` 可以想成程序上网用的"插座"，`connect` 是"拨号连上对方"，`send` 是"把数据发出去"，`recv` 是"把对方的数据收进来"——你只要在刷屏里认出这几个名字就算成功。
3. 把你找到的 2~3 行抄下来，用自己的话写一句：这条命令为了上网，向操作系统"喊"了哪几声？

做完你会有个直观感受：**上网，本质上也是一连串系统调用。** 这跟读文件没有本质区别——都是"自己不许碰，请内核代劳"。

## 📦 复制带走

<div class="csf-card"><strong>① 系统调用 = 程序向操作系统"喊话办事"。</strong>程序自己不许碰硬件（文件、网络、进程），想用就得通过系统调用请内核代劳，这是安全边界。<br><strong>② 喊话那一刻，CPU 从用户态切到内核态</strong>，办完再切回来；这个来回切换有成本，所以频繁的小 I/O 会慢。<br><strong>③ 库函数 / API ≠ 系统调用。</strong><code>print</code>、<code>open()</code> 是给你用的友好门面，底下可能藏着 <code>write</code>、<code>open</code> 这样真正的系统调用。<br><strong>④ 你已经会亲手抓它了。</strong>用 strace / dtruss / Process Monitor，能在刷屏里认出 <code>open / read / write</code>——系统调用从此不再抽象。</div>

下一讲（第11讲），我们把前面学的进程、内存、调度、锁、系统调用**全部串起来**，完整走一遍"从按下开机键到一个程序跑起来"的旅程，并带你做一次真刀真枪的排查实战。这一讲学到的"用户态/内核态切换很贵"，到时候就是你判断"卡在哪"的一把钥匙。我们下一讲见。
