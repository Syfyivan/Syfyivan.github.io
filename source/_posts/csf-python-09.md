---
title: "《计算机基本功路线图 · 编程语言入门（Python）》第09讲 · 文件读写：把数据存下来、下次读回来"
date: 2026-07-03 18:00:00
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

<div class="csf-key-note">到现在为止，你写的程序有个共同的毛病：<b>一关掉，啥都没了</b>。待办列表敲了一堆，回车关掉窗口，下次打开又是空的。<br>这一讲我们给程序装上"记忆"——把数据写进一个文件，下次启动时再读回来。学完这一讲，你的小程序第一次真正"记住"了你昨天做的事。</div>

## 🎯 这一讲你会学到什么

- 用 `open()` 打开文件，知道 `"r"` / `"w"` / `"a"` 三种模式分别干什么；
- 用 `write()` 把字符串写进文件，用 `read()` / `readlines()` 把内容读回来；
- 理解为什么大家都用 `with` 开文件，而不是手动 `open` 再 `close`；
- 知道写中文为什么要加 `encoding="utf-8"`，不加会出什么乱子；
- 亲手把第 07 讲那个待办列表存进 `todo.txt`，下次运行能读回来。

<div class="csf-note">前置：这一讲会用到前面四讲的内容，最好先确认自己都还记得——循环（第 05 讲）、函数（第 06 讲）、列表（第 07 讲）、字符串处理（第 08 讲，也就是上一讲）。<br>特别提醒：本讲的核心练习里会大量出现 <code>def 函数名():</code> 和 <code>return</code> 这种"函数"写法，它们正是第 06 讲讲的内容。如果你看到 <code>def</code> 会发懵，请先回去把第 06 讲（函数）复习好，再来跟这一讲。<br>另外如果 <code>for</code> 循环和 <code>列表.append()</code> 你还不太熟，也建议先回去过一遍，这一讲会一直用到它们。</div>

## 🛠 跟我做

### 文件其实就是硬盘上的一段文字 <span class="csf-b csf-core">必读</span>

先建立一个朴素的画面：所谓"文本文件"，就是硬盘上存着的一长串字符，跟你在记事本里打的字一模一样。Python 操作文件，本质就三步：

1. **打开**它（告诉系统：我要动这个文件，是读还是写）；
2. **读 或 写**；
3. **关上**它（告诉系统：我用完了）。

打开用的就是 `open()` 函数。它要两样东西：文件名，和"打开模式"。

```python
f = open("hello.txt", "w")   # 以"写"模式打开（没有就新建）
f.write("你好，文件！\n")      # \n 是换行
f.close()                     # 用完一定要关
```

<div class="csf-note">把这段代码存成一个 <code>.py</code> 文件运行一下。运行完，你会看到多出一个 <code>hello.txt</code>，打开它，里面正是那句话。这就是你的程序第一次往硬盘上写东西。<br>它会出现在哪个文件夹？这里只写了文件名 <code>hello.txt</code>、没写完整路径，这种情况下文件会生成在"你运行这个脚本时所在的那个目录"，通常就是你的 <code>.py</code> 文件所在的文件夹。<br>如果在某些编辑器里点了运行却找不到它，别急着以为没成功、反复重跑：可以在电脑里全盘搜索文件名 <code>hello.txt</code>，或者先看看自己到底是从哪个目录运行的（很多编辑器的"运行目录"不一定等于 <code>.py</code> 所在目录）。</div>

### 三种模式：r、w、a，别记混 <span class="csf-b csf-key">重点</span>

`open()` 的第二个参数是模式。初学阶段你只要记牢这三个：

<div class="csf-legend"><b>r</b>（read，读）：只读，文件必须已经存在，否则报错。<br><b>w</b>（write，写）：写入，<b>会把原文件内容全部清空</b>再写；文件不存在就新建。<br><b>a</b>（append，追加）：在文件<b>末尾</b>接着写，不动原有内容；文件不存在也新建。</div>

这里有个**最常见的坑**，先猜一下：下面这段代码跑完，`note.txt` 里会有几行字？

```python
f = open("note.txt", "w")
f.write("第一句\n")
f.close()

f = open("note.txt", "w")   # 注意：又用 w 打开了
f.write("第二句\n")
f.close()
```

<div class="csf-note">先在心里写下你的答案，再往下看。</div>

揭晓：文件里**只有"第二句"**。因为第二次用 `"w"` 打开时，Python 直接把文件清空了，"第一句"被冲掉了。如果你想要两句都在，第二次得用 `"a"`（追加）：

```python
f = open("note.txt", "a")   # 改成 a
f.write("第二句\n")
f.close()
```

这下文件里就是"第一句""第二句"两行了。**`w` 是覆盖，`a` 是接着写**——这八个字记死，能帮你躲掉无数次"我数据怎么没了"的崩溃。

### 把内容读回来：read 和 readlines <span class="csf-b csf-core">必读</span>

写进去了，怎么读出来？两个常用方法：

```python
f = open("note.txt", "r")
content = f.read()        # 一次性读成一整个字符串
f.close()
print(content)
```

`read()` 把整个文件读成**一个字符串**，换行符 `\n` 也原样在里面。如果你想**一行一行**处理（比如待办列表，一行一条），用 `readlines()`：

```python
f = open("note.txt", "r")
lines = f.readlines()     # 读成一个列表，每个元素是一行
f.close()
print(lines)
```

先猜：上面 `lines` 打印出来长什么样？

<div class="csf-note">想好再看。很多人以为是 <code>['第一句', '第二句']</code>，干干净净。</div>

实际结果是 `['第一句\n', '第二句\n']`——**每行末尾的换行符 `\n` 会被一起读进来**。这是初学者第一次用 `readlines()` 几乎都会被绊一下的地方。要去掉行尾的 `\n`，用上一讲学过的 `.strip()`：

```python
f = open("note.txt", "r")
for line in f.readlines():
    print(line.strip())   # strip() 去掉行首尾的空白和换行
f.close()
```

### with：让 Python 替你关门 <span class="csf-b csf-key">重点</span>

到这你应该发现了：每段代码都得记着 `f.close()`。忘了会怎样？文件可能没真正写完、被占用、数据丢失——而且程序中途一旦报错，`close()` 那行就根本执行不到了。

Python 给了个更省心的写法：`with`。

```python
with open("note.txt", "r", encoding="utf-8") as f:
    content = f.read()
    print(content)
# 缩进结束，文件自动关好了，你一个字都不用写 close
```

`with open(...) as f:` 的意思是：在这个缩进块里用 `f`，**块结束（不管是正常结束还是中途报错）Python 都会自动帮你关文件**。从今往后，<b>开文件就用 with，别再手动 open/close</b>——这是 Python 圈子里的标准做法。

<details class="csf-fold"><summary>为什么 with 这么"智能"<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
<div>这背后是 Python 的"上下文管理器"机制。文件对象内部约定了"进入时做什么、离开时做什么"，<code>with</code> 负责在离开代码块时自动调用那个"离开时"的动作（也就是关闭文件）。你现在不用懂细节，只要知道：<b>凡是"用完要收尾"的资源</b>（文件、网络连接、数据库等），Python 里都倾向于用 <code>with</code> 来管，省得你忘记收尾。等你以后学到第 10 讲的异常处理，会更理解它的价值：哪怕中途炸了，门也照样关好。</div>
</details>

### encoding="utf-8"：中文不乱码的护身符 <span class="csf-b csf-core">必读</span>

你可能注意到上面我悄悄加了 `encoding="utf-8"`。这是什么？

简单说：电脑存字时存的是数字，"用哪套数字表对应哪些字"就叫**编码**。`utf-8` 是目前全世界通用、能正确表示中文的那套。不同操作系统默认的编码不一样（有些 Windows 默认不是 utf-8），于是就会发生：你这台机器写的中文，到另一台机器读出来变成一堆"锟斤拷""鈻"。

**结论很简单**：只要文件里**可能有中文**，`open()` 时就老老实实加上 `encoding="utf-8"`，读和写都要加，且两边保持一致。

```python
with open("zh.txt", "w", encoding="utf-8") as f:
    f.write("中文不乱码\n")

with open("zh.txt", "r", encoding="utf-8") as f:
    print(f.read())     # 中文不乱码
```

### 动手练：给待办列表装上记忆 <span class="csf-b csf-core">必读</span>

现在把第 07 讲那个待办列表升级一下：**程序启动时从 `todo.txt` 读回上次的待办，结束时把新列表存回去**。完整可运行，照着敲（提醒一句：<b>这段务必自己一行行敲，别让 AI 代写</b>——文件读写的手感就是这么练出来的）：

```python
# todo_file.py —— 带存档的待办列表
FILENAME = "todo.txt"

def load_todos():
    """从文件读回待办；文件不存在就返回空列表。"""
    todos = []
    try:
        with open(FILENAME, "r", encoding="utf-8") as f:
            for line in f.readlines():
                item = line.strip()      # 去掉行尾换行
                if item:                 # 跳过空行
                    todos.append(item)
    except FileNotFoundError:
        pass                             # 第一次运行还没有文件，正常
    return todos

def save_todos(todos):
    """把待办写回文件，每条一行。"""
    with open(FILENAME, "w", encoding="utf-8") as f:
        for item in todos:
            f.write(item + "\n")

# 主程序
todos = load_todos()
print("上次的待办：", todos if todos else "（暂无）")

new_item = input("加一条新待办：")
todos.append(new_item)

save_todos(todos)
print("已保存！下次启动还在。")
```

<div class="csf-note">敲到一半可能你会卡在这行：<code>"""从文件读回待办；文件不存在就返回空列表。"""</code>。它不是命令、也不会报错——函数名（<code>def load_todos():</code>）下面用三个引号 <code>"""..."""</code> 包起来的一句话，是专门写给这个函数的"说明书"，正式名字叫<b>文档字符串</b>（docstring）。它的作用只是告诉你和别人"这个函数是干嘛的"，写不写都不影响程序运行。<br>所以你照着敲上、或者干脆不敲，程序都能正常跑；它和你以前用 <code>#</code> 写的注释是一类东西，只是放在函数开头、用三引号包起来这种更正式的写法。</div>

先猜：**第一次**运行会打印什么？**第二次**呢？

<div class="csf-note">想好再跑。第一次：还没有 todo.txt，所以 load 时走 except，打印"（暂无）"，然后你输入一条、保存。第二次：load 能读到上次那条，打印出来，你再加一条……每跑一次，列表就长一条。打开 todo.txt 看看，里面正一行行躺着你的待办——你的程序"记住"了。</div>

这里偷偷用了一个 `try / except FileNotFoundError`，作用是"文件还没建出来时别让程序崩"。这正是**下一讲（第 10 讲）异常处理**的主角，这里你先照抄、有个印象即可。

## 💡 自己复述一遍

合上屏幕，用一句话说出来：**`with open(文件名, 模式, encoding="utf-8") as f:` 里，`r` 是读、`w` 是覆盖写、`a` 是追加，`with` 会帮我自动关文件。** 能顺出来，这一讲的骨架就立住了。

## 🔧 翻车现场

<div class="csf-legend"><b>翻车一：用 w 把数据全冲没了。</b><br>本来想往文件里"再加一条"，结果用了 <code>"w"</code>，原来的内容瞬间清空。<br>解法：要保留旧内容、在末尾追加，用 <code>"a"</code>；只有"整体重写"时才用 <code>"w"</code>。本讲待办的 save 是把整个列表重写，所以用 w 是对的；分清"重写"和"追加"是关键。</div>

<div class="csf-legend"><b>翻车二：不用 with，又忘了 close。</b><br>手动 <code>open</code> 后忘记 <code>close()</code>，或者中途报错没执行到 close，导致内容没写全、文件被占用。<br>解法：一律用 <code>with open(...) as f:</code>，让 Python 自动收尾，从根上免疫。</div>

<div class="csf-legend"><b>翻车三：中文乱码 / 报 UnicodeDecodeError。</b><br>没写 <code>encoding="utf-8"</code>，或者写文件和读文件用了不同编码。<br>解法：只要可能有中文，读和写都加 <code>encoding="utf-8"</code>，两边一致。</div>

<div class="csf-legend"><b>翻车四：readlines 后每行多了个 \n。</b><br>打印出来发现行尾都带着换行符，拼接、比较时各种对不上。<br>解法：读出来的每行先 <code>.strip()</code> 一下再用。</div>

<div class="csf-legend"><b>翻车五：FileNotFoundError —— 读一个不存在的文件。</b><br>用 <code>"r"</code> 打开还没创建的文件，直接报错。<br>解法：要么先确保文件存在，要么像本讲那样用 try/except 兜住（第 10 讲细讲）。注意 <code>w</code>/<code>a</code> 不会报这个错，它们会自动新建。</div>

## ✅ 自检三问

1. `w` 模式和 `a` 模式打开同一个已有文件，分别会对原内容做什么？
2. 为什么推荐用 `with open(...)` 而不是手动 `open` 再 `close`？
3. `readlines()` 读出来的每行，末尾通常多了什么？怎么去掉？

<details class="csf-fold"><summary>对照参考答案<span class="csf-b csf-skim">先自己答 · 再展开</span></summary>
<div>1. <code>w</code> 会先把原内容<b>全部清空</b>再写；<code>a</code> 不动原内容，在<b>末尾追加</b>。<br>2. 因为 <code>with</code> 会在代码块结束时<b>自动关闭文件</b>，哪怕中途报错也会关，省得你忘记 close、也避免数据没写全。<br>3. 末尾多了换行符 <code>\n</code>；用 <code>.strip()</code> 去掉行首尾的空白和换行。</div>
</details>

## 🚀 挑战

给本讲的待办程序加两个小功能，自己动手（别让 AI 代写，卡住了让它解释概念就好）：

1. **菜单化**：启动后让用户选择 `1 查看 / 2 添加 / 3 删除 / 4 退出`，用第 05 讲的 `while` 循环让它一直跑，直到选退出才 `save_todos` 并结束。
2. **删除一条**：列出带编号的待办，让用户输入编号删掉对应那条（提示：列表的下标从 0 开始，用户看到的编号可能要减 1）。

做完你会发现：菜单 + 列表 + 文件读写凑齐，一个"重启也不丢数据"的命令行小工具，雏形已经出来了。

## 📦 复制带走

<div class="csf-card"><b>1. 三步与三模式：</b>文件操作就是开→读/写→关；模式 <code>r</code> 读、<code>w</code> 覆盖写、<code>a</code> 末尾追加。"w 是覆盖，a 是接着写"记死。</div>

<div class="csf-card"><b>2. 一律用 with：</b><code>with open(名, 模式, encoding="utf-8") as f:</code>，块结束自动关文件，从此不用手写 close、也不怕忘。</div>

<div class="csf-card"><b>3. 中文加 encoding="utf-8"：</b>读和写都加、两边一致，乱码和 UnicodeDecodeError 一起免疫。</div>

<div class="csf-card"><b>4. readlines 记得 strip：</b>读出的每行末尾带 <code>\n</code>，用 <code>.strip()</code> 清掉再用。下一讲（第 10 讲）我们学异常处理，让程序读不到文件、输入出错时也不崩。</div>
