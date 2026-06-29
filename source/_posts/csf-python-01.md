---
title: "《计算机基本功路线图 · 编程语言入门（Python）》第01讲 · 环境与第一行：让电脑跑出你的第一句话"
date: 2026-07-03 10:00:00
tags: [计算机基础, 编程语言入门（Python）, 零基础, 编程入门, 课程]
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

<div class="csf-key-note">上一讲我们把"自己能写"定成了唯一目标。这一讲不谈大道理，只做一件事：在你自己的电脑上，让 Python 真正跑起来，并亲手让它说出第一句话。读完你会拥有两样东西——一个能用的环境，和一份"我真的让电脑听我的了"的踏实感。这是后面所有讲的地基，一砖一瓦都要自己砌。</div>

## 🎯 这一讲你会学到什么

- **Python 解释器是什么**：为什么你写的字，电脑能看懂并执行。
- **怎么把它装到自己电脑上**：Windows 和 macOS 分开讲，照着做就行。
- **终端（命令行）长什么样**：那个黑乎乎的窗口不可怕，它只是你和电脑对话的一种方式。
- **编辑器 VS Code 怎么用**：写代码的地方。
- **`.py` 文件和 `print()`**：写一个文件，让它输出"你好，世界"，并在终端把它跑出来。

<div class="csf-note">这一讲会有点"装修"的味道——配环境本来就是最容易让人卡住、也最容易劝退的一关。我把每一步都拆细了。哪怕你只完成"看到一行输出"，今天就算赢了。慢一点没关系，每个程序员都是从这一步走过来的。</div>

## 🛠 跟我做

### 第一步：先搞清楚三个角色 <span class="csf-b csf-core">必读</span>

在动手之前，先认识三样东西，后面就不会乱：

- **Python 解释器**：一个真正"读懂并执行你代码"的程序。你写的是文字，它负责一行一行翻译成电脑能做的动作。**没有它，你的代码只是一堆字符。**
- **终端（也叫命令行）**：一个用打字来下命令的窗口。你在里面敲一句话，电脑就做一件事。它不好看，但极其直接。
- **编辑器（VS Code）**：你写代码的"稿纸"。它能帮你高亮、对齐、提示，让写代码舒服很多。

<div class="csf-why">为什么要分清这三个？因为初学者最常见的混乱就是："我代码写在哪了？我怎么让它跑？" 记住这条流水线就够了：<strong>在编辑器里写</strong> → 存成一个 <code>.py</code> 文件 → <strong>在终端里喊解释器来跑这个文件</strong>。三个角色，各司其职。</div>

### 第二步：安装 Python <span class="csf-b csf-core">必读</span>

请按你的系统选一边做。**先猜一下**：装完之后，你打算怎么确认"它真的装上了"？把你的猜测记在心里，第三步揭晓。

#### 如果你用 Windows

1. 打开浏览器，访问官网 `https://www.python.org/downloads/`。
2. 点页面上那个大大的"Download Python 3.x.x"按钮（3 后面具体数字不重要，是 3 就行）。
3. 下载完双击安装包。**这一步最关键**：安装界面最下方有一个勾选框 **"Add python.exe to PATH"（把 Python 加入 PATH）**，一定要勾上！再点"Install Now"。（PATH 你可以理解成电脑的一张"常用程序通讯录"，把 Python 记进这张通讯录，以后你在电脑的任何地方喊一声 `python`，电脑都知道该去哪儿找到它来干活；不勾上，电脑就会两手一摊说"我不认识这个 python"。）
4. 等它装完，点"Close"。

<div class="csf-note">那个 "Add to PATH" 的勾，是 Windows 用户第一关最大的坑。勾了，你才能在任何地方直接敲 <code>python</code>；忘了勾，终端就会一脸茫然地说"找不到这个命令"。如果你没勾就装完了，最省事的办法是：重新运行安装包，选 "Modify" 或直接卸载重装，这次记得勾上。</div>

#### 如果你用 macOS

macOS 自带的 Python 可能是老旧版本，我们装一个干净的新版。推荐两种方式，任选其一：

- **方式 A（最简单）**：同样去 `https://www.python.org/downloads/`，下载 macOS 安装包（`.pkg`），双击一路"继续"装完即可。
- **方式 B（用包管理器 Homebrew，适合愿意多学一点的人）**：包管理器是一个帮你自动下载、安装软件的小工具，Homebrew 就是 mac 上很常用的一个；用它装软件，敲一行命令就行，不用自己去网页上找安装包。如果你电脑已经装过 Homebrew，在终端里敲 `brew install python` 就能装好。如果你没听过 Homebrew，完全不用管这一段，按上面的方式 A 做就行，别在第一讲就给自己加难度。

### 第三步：打开终端，确认安装成功 <span class="csf-b csf-key">重点</span>

先找到终端：

- **Windows**：按开始菜单，搜索 "PowerShell" 或 "命令提示符（cmd）"，打开它。
- **macOS**：按 `Command + 空格` 打开聚焦搜索，输入 "终端" 或 "Terminal"，回车。

现在，在终端里敲下面这行，然后按回车。**先猜后做**：你觉得它会回你什么？

```bash
python --version
```

如果一切顺利，它会回你类似这样的一行（数字可能不同）：

```text
Python 3.12.4
```

看到这个，说明解释器装好了，恭喜！

<div class="csf-note">在 macOS（以及部分 Windows 环境）上，如果 <code>python</code> 没反应，请试 <code>python3 --version</code>。很多 mac 系统里，新版 Python 的命令名是 <code>python3</code> 而不是 <code>python</code>。如果 <code>python3</code> 能出版本号，那就一切正常，后面你把命令里的 <code>python</code> 都换成 <code>python3</code> 即可。</div>

<details class="csf-fold"><summary>为什么有的叫 python、有的叫 python3<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
历史原因：Python 2 和 Python 3 曾经长期并存，为了避免冲突，很多系统把新版命名为 <code>python3</code>，把 <code>python</code> 这个名字留给了旧版（或干脆不绑定）。Python 2 早已停止维护，你只需要用 3。<br>所以记住一句话：<strong>哪个命令能打印出 "Python 3.x" 版本号，后面你就用哪个。</strong>不用纠结名字，能跑的就是对的。</details>

### 第四步：装好编辑器 VS Code

去 `https://code.visualstudio.com/` 下载并安装 VS Code（Windows、macOS 都有对应版本，下载页会自动认出你的系统）。装完打开它。

第一次打开时，建议做一件事：在左侧竖排图标里找到"扩展（Extensions，像四个方块的图标）"，搜索 "Python"，安装微软官方那个 Python 扩展。它能给你代码高亮和错误提示，新手很受用。

### 第五步：写下你的第一行代码 <span class="csf-b csf-core">必读</span>

这是今天的主菜。**这段代码请你自己一个字一个字敲，不要复制、更不要让 AI 替你写**——它只有一行，意义却是"你亲手让电脑开口说话"。肌肉记忆就是从这一行开始攒的。

1. 在你的电脑上建一个专门放代码的文件夹，比如桌面上建一个叫 `python-learn` 的文件夹。
2. 在 VS Code 里，点菜单 "文件 → 打开文件夹（Open Folder）"，选中这个文件夹。
3. 在 VS Code 左侧的文件区（那一栏会显示你刚打开的文件夹名字）新建一个文件：把鼠标移到文件夹名字那一行，它右边会冒出几个小图标，点最左边那个"新建文件"图标（图标长得像一张带折角的纸）；如果你找不到那几个图标，也可以在文件区下方的空白处点鼠标右键，选 "New File / 新建文件"。然后输入文件名 `hello.py`，按回车确认（**后缀一定是 `.py`**，这是 Python 文件的标志）。
4. 在文件里敲下这一行，然后保存（`Ctrl + S` / `Command + S`）：

```python
print("你好，世界")
```

<div class="csf-note">敲引号时务必用<strong>英文半角引号</strong> <code>"</code>，不要用中文输入法打出来的全角引号 <code>“ ”</code>。这是新手第一天最高频的报错来源，没有之一。一个小技巧：敲引号前先把输入法切回英文。</div>

### 第六步：把它跑出来 <span class="csf-b csf-key">重点</span>

现在我们用终端来运行这个文件。VS Code 里就自带终端：点菜单 "终端（Terminal）→ 新建终端（New Terminal）"，下方会弹出一个终端窗口，而且它已经自动停在你的项目文件夹里了。

在这个终端里敲（如果你的命令是 `python3`，就把 `python` 换成 `python3`）：

```bash
python hello.py
```

**先猜后做**：按回车之前，先猜一下屏幕会出现什么？

按下回车，你应该看到：

```text
你好，世界
```

看到了吗？这一行字，是你写的指令、由解释器执行、最后吐回到屏幕上的。**你刚刚完成了一个完整的"写 → 跑 → 看到结果"的闭环。** 这就是编程最基本的心跳节奏，后面再复杂的程序，也都是这个节奏的放大。

<details class="csf-fold"><summary>这行命令到底发生了什么<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
<code>python hello.py</code> 拆开看是两部分：<code>python</code> 是"叫解释器来"，<code>hello.py</code> 是"要它读的那个文件"。<br>合起来的意思就是："Python 解释器，请打开 hello.py 这个文件，从上到下一行一行执行里面的代码。"<br>它读到 <code>print("你好，世界")</code>，就明白：把引号里的内容原样显示到屏幕上。<code>print</code> 就是"打印 / 显示"的意思——注意，它不是打印到纸上，是显示在屏幕上。</details>

## 💡 自己复述一遍

合上屏幕，用一句话对自己说清楚：**我在编辑器里写好一个 `.py` 文件，然后在终端里用 `python 文件名` 这条命令，让解释器把它跑起来，结果就显示在屏幕上。**

说不顺也没关系，回头再看一眼第一步那三个角色。能把"写在哪、用什么跑、结果在哪看"讲明白，这一讲的核心你就拿到了。

## 🔧 翻车现场

<div class="csf-note"><strong>翻车一：敲 <code>python</code> 提示"不是内部或外部命令"/"command not found"。</strong><br>原因：解释器没装好，或者 PATH 没配上（Windows 多半是安装时忘了勾 "Add to PATH"）。<br>解法：先试试 <code>python3 --version</code>，能出版本号就用 <code>python3</code>。还不行就重装，Windows 务必勾上 "Add python.exe to PATH"。</div>

<div class="csf-note"><strong>翻车二：代码报错 <code>SyntaxError</code>（语法错误，意思是你的代码写法不符合 Python 的规矩），箭头指着引号。</strong><br>原因：用了中文全角引号 <code>“ ”</code> 而不是英文 <code>"</code>。<br>解法：把引号删掉，切到英文输入法重新敲一遍。记住这个规律：<strong>Python 代码里的符号（引号、括号、冒号、逗号）几乎都要用英文半角。</strong>引号里面的中文内容不受影响，可以放心写中文。</div>

<div class="csf-note"><strong>翻车三：提示 <code>can't open file 'hello.py'</code> 或"找不到文件"。</strong><br>原因：你运行命令时所在的文件夹，不是 <code>hello.py</code> 所在的文件夹。<br>解法：最稳的办法是用 VS Code 的"打开文件夹"打开你的项目，再用 "终端 → 新建终端"，这样终端会自动停在正确的位置。也可以在终端先敲 <code>ls</code>（Windows 用 <code>dir</code>）看看当前文件夹里有没有 <code>hello.py</code>。</div>

<div class="csf-note"><strong>翻车四：输出的中文变成乱码。</strong><br>原因：极少数老旧 Windows 终端，对中文的显示方式没设对（电脑表示中文有好几种"方式"，老终端用的那种可能跟 Python 输出的对不上，就花了）。<br>解法：换用 VS Code 自带的终端跑（它默认用的那种方式对中文很友好，这里你不需要懂背后的细节），通常就正常了。如果你看到的本来就是正确的"你好，世界"，那这条就不用管。</div>

## ✅ 自检三问

1. 终端、解释器、编辑器，这三个分别是干什么的？你能各用一句话说清吗？
2. 一个文件要被 Python 当成代码运行，它的后缀必须是什么？
3. 如果敲 `python hello.py` 时报"找不到文件"，你会先检查什么？

如果某一问答不上来，别急着往下走，回到对应小节再读一遍、再动手试一次。这一讲的东西，是用手记住的，不是用眼睛。

## 🚀 挑战

给你留个小任务，**全程自己敲，别叫 AI 代写**：

1. 在 `hello.py` 里再加一行，让它**连续输出两行**：第一行是"你好，世界"，第二行换成你自己的名字（比如"我是小明，我开始学 Python 了"）。提示：再写一个 `print(...)` 就行，一行一个。
2. 跑之前，**先猜**：屏幕上会出现一行还是两行？顺序是什么？
3. 跑出来，看看和你猜的一样吗？如果不一样，想想为什么。

进阶一点（可选）：试着把其中一个 `print` 里的英文引号故意改成中文引号，跑一次，**亲眼看看那个 `SyntaxError` 长什么样**。主动制造一次报错、再把它改回来，比躲着报错更能让你记住它。

## 📦 复制带走

<div class="csf-card">
<strong>这一讲的四块砖：</strong><br>
1. <strong>三个角色</strong>：解释器（执行代码）、终端（打字下命令）、编辑器（写代码）。流水线是"编辑器写 → 存成 .py → 终端跑"。<br>
2. <strong>装好就验证</strong>：敲 <code>python --version</code>（或 <code>python3 --version</code>）能看到 "Python 3.x" 才算成功；Windows 装时记得勾 "Add to PATH"。<br>
3. <strong>第一行代码</strong>：<code>print("你好，世界")</code>，引号必须用英文半角；运行命令是 <code>python 文件名.py</code>。<br>
4. <strong>闭环最重要</strong>：写 → 跑 → 看到结果，这个心跳节奏，是后面所有程序的底子——而且每一步都要自己亲手做一遍。
</div>

下一讲（第02讲《变量与类型：给数据起名字、分清四种基础类型》），我们就开始往这间空房子里搬东西——学会给数据起名字，并认识 Python 里最常用的几种基础数据类型。环境备好了，接下来才是真正写程序的开始。
