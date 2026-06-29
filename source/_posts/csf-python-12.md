---
title: "《计算机基本功路线图 · 编程语言入门（Python）》第12讲 · 小项目收尾：把基本功串成一个能用的程序"
date: 2026-07-03 21:00:00
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

<div class="csf-key-note">这一讲不教新语法。它教你怎么把前面十一讲学的零件——变量、循环、函数、列表、文件、异常——拼成一个<strong>真正能用</strong>的小程序。终点不是"我会写 for 循环"，而是"我独立做出了一个能跑、能存数据、不会一报错就崩的东西"。这才是入行的门槛。</div>

到这一讲，你手里其实已经攒齐了所有零件。

前面你学过：变量怎么存东西、`if` 怎么做判断、`for`/`while` 怎么重复、函数怎么把一段逻辑打包、列表和字典怎么装一堆数据、文件怎么把数据存到硬盘上、`try` 怎么接住错误。每一样你都单独练过。

但单独会用零件，和能造出一台机器，是两回事。这一讲就是那台机器的组装现场。我们从头做一个**命令行待办管理器**：它有菜单、能增删查、能把你的待办存进文件下次还在、输错了也不崩。做完它，你就跨过了"学过 Python"和"会用 Python 写程序"之间那道最关键的坎。

## 🎯 这一讲你会学到什么

- **怎么把一个模糊的想法拆成能写的小步骤**（需求拆解）——这是程序员最核心的功夫，比记语法重要十倍。
- **菜单循环**怎么搭：让程序一直转，等用户选操作，选"退出"才停。
- 怎么用**函数把功能分块**，让几百行代码不变成一锅粥。
- 怎么把列表里的数据**存进文件、再读回来**，做到关掉程序数据还在。
- 怎么用**异常保护**把"用户乱输入"挡在外面，让程序稳稳地活着。
- 最重要的：**怎么一点一点写、写一点测一点**，以及程序出 bug 时怎么靠 `print` 把它揪出来——而不是从头重写。

<div class="csf-note">郑重提醒，而且这一讲尤其重要：<strong>这个项目，请你一行一行自己敲。</strong>别把需求丢给 AI 让它整段生成。原因很简单——这是你的"毕业作品"，是检验前十一讲到底学进去没有的唯一办法。AI 几秒就能吐出一个待办管理器，但那一刻你学到的是零。真正的收获，藏在你"自己卡住、自己 print 调试、自己跑通"的每一个瞬间里。AI 可以当你的陪练：卡住了问它"这个报错什么意思"，但<strong>别让它替你写</strong>。</div>

## 🛠 跟我做

我们要做的东西，先用人话描述一遍：

> 一个在终端里运行的待办清单。打开它，会看到一个菜单：1 添加待办、2 查看全部、3 删除、4 退出。选数字执行对应操作。待办存在一个文件里，关掉程序再打开，之前加的还在。无论我输什么乱七八糟的东西，它都不会崩。

### 第一步：先别写代码，先拆需求 <span class="csf-b csf-core">必读</span>

这是全讲最重要的一步，请慢下来。

新手最爱犯的错，是看到题目立刻噼里啪啦开始敲，写到一半发现不对，推倒重来。老手不是这样——老手会先把大问题切成一个个"小到能立刻动手"的块。我们来切：

<div class="csf-note">把"做一个待办管理器"拆成：<br>① 一个能反复显示菜单、读用户选择的<strong>循环</strong>；<br>② 一个<strong>列表</strong>，在内存里装当前所有待办；<br>③ <strong>添加</strong>功能：让用户输入一条，塞进列表；<br>④ <strong>查看</strong>功能：把列表里的每条带编号打印出来；<br>⑤ <strong>删除</strong>功能：让用户报编号，从列表里删掉那条；<br>⑥ <strong>存盘 / 读盘</strong>：启动时从文件读进列表，每次改完写回文件；<br>⑦ <strong>异常保护</strong>：用户输入不是数字、删除编号不存在时，别崩。</div>

看到没？原本"做个待办管理器"这种让人不知从何下手的大目标，被切成了 7 个每个都"我会写"的小块。**会拆，你就赢了一半。** 接下来我们按块来，每写完一块就跑一下。

### 第二步：先把菜单循环跑起来（最小骨架）

我们不上来就写全部功能。先搭一个空架子：能显示菜单、能选、选 4 能退出。别的先用占位文字顶着。

**先猜一下**：下面这段代码运行后，你输 `1` 会发生什么？输 `4` 呢？输 `9` 呢？心里有答案了再往下跑。

```python
# todo.py —— 第一版：只有菜单骨架
def show_menu():
    print("\n===== 待办管理器 =====")
    print("1. 添加待办")
    print("2. 查看全部")
    print("3. 删除待办")
    print("4. 退出")

def main():
    while True:
        show_menu()
        choice = input("请选择(1-4): ")
        if choice == "1":
            print("[占位] 这里以后会添加待办")
        elif choice == "2":
            print("[占位] 这里以后会查看待办")
        elif choice == "3":
            print("[占位] 这里以后会删除待办")
        elif choice == "4":
            print("再见！")
            break
        else:
            print("没有这个选项，请输入 1-4。")

main()
```

把它存成 `todo.py`。然后打开终端，**先用 `cd` 命令进到 `todo.py` 所在的那个文件夹**（`cd` 就是"切换目录"的意思，比如文件在桌面就敲 `cd Desktop`），再跑 `python todo.py`。如果直接跑，终端很可能报"找不到文件"——那不是你代码写错了，只是终端还没"站到"文件所在的文件夹里。这一步怎么操作，第 1 讲讲过运行方法，记不清可以回头翻一下。

揭晓：输 `1`/`2`/`3` 会打印对应的占位文字然后**回到菜单**；输 `4` 打印"再见"后 `break` 跳出 `while`，程序结束；输 `9`（或任何别的）走到 `else`，提示你重输。

<div class="csf-why">为什么先写这个空壳？因为它<strong>立刻能跑、立刻能验证</strong>。菜单循环是整个程序的脊梁，先把脊梁立稳，后面往里填功能就踏实。这就是"写一点测一点"——每一步都站在一个已经跑通的版本上，错了也只在新加的那几行里，好找。</div>

<div class="csf-note">小知识：<code>input()</code> 拿到的<strong>永远是字符串</strong>，所以我们拿 <code>choice == "1"</code>（带引号的字符串）去比，而不是 <code>choice == 1</code>。这个坑后面还会再遇到，先记住。</div>

### 第三步：加上"添加"和"查看"，用列表存在内存里

现在往骨架里填肉。先要一个列表 `todos` 装待办，然后实现添加和查看。注意我们把每个功能写成**一个函数**——这就是"用函数组织代码"。

```python
# todo.py —— 第二版：能添加、能查看（数据还只在内存里）
def show_menu():
    print("\n===== 待办管理器 =====")
    print("1. 添加待办")
    print("2. 查看全部")
    print("3. 删除待办")
    print("4. 退出")

def add_todo(todos):
    item = input("要添加什么待办？ ").strip()
    if item == "":
        print("空的不能加哦。")
        return
    todos.append(item)
    print(f"已添加：{item}")

def list_todos(todos):
    if not todos:
        print("（还没有任何待办）")
        return
    print("--- 你的待办 ---")
    for i, item in enumerate(todos, start=1):
        print(f"{i}. {item}")

def main():
    todos = []          # 程序运行期间，所有待办都装在这个列表里
    while True:
        show_menu()
        choice = input("请选择(1-4): ")
        if choice == "1":
            add_todo(todos)
        elif choice == "2":
            list_todos(todos)
        elif choice == "3":
            print("[占位] 删除还没做")
        elif choice == "4":
            print("再见！")
            break
        else:
            print("没有这个选项，请输入 1-4。")

main()
```

跑起来：添加两三条，再选 2 看一眼。**先猜**：如果一条都没加就选 2，会看到什么？（答案：`（还没有任何待办）`，因为 `if not todos` 在列表为空时成立。）

<div class="csf-note">这里有两个值得停下来体会的细节：<br>① <code>enumerate(todos, start=1)</code> 让我们一边拿到序号一边拿到内容，序号从 1 开始数，符合人的习惯（程序员数数默认从 0 开始，但给用户看的编号从 1 更友好）。<br>② <code>.strip()</code> 去掉用户输入两头的空格，再判断是不是空字符串——这是一个微小但专业的防护。<br>③ 每个函数都<strong>只干一件事</strong>，名字一看就懂。这就是函数的价值：<code>main</code> 里读起来像一句话——"选 1 就 add_todo，选 2 就 list_todos"。</div>

### 第四步：加上"删除"——开始处理"用户会乱输" <span class="csf-b csf-key">重点</span>

删除比添加难一点点，因为要让用户**报编号**，而编号可能是乱七八糟的东西："abc"、"99"、空的。这正是练异常保护的好地方。

先说一个待会儿会用到的词：**ValueError**。它是 Python 的一种报错，意思就是"值不对"——比如你想把 `abc` 这种根本不是数字的字符串硬转成数字，Python 转不了，就会报这个错。下面的代码里我们会专门把它接住。

**先猜后做**：假设列表里有 3 条待办，用户在删除时输了 `abc`，下面这段会发生什么？输 `99` 呢？

```python
def delete_todo(todos):
    if not todos:
        print("没有待办可删。")
        return
    list_todos(todos)                       # 先把带编号的列表给用户看
    raw = input("删除哪一条？输编号: ")
    try:
        index = int(raw)                    # 这一行可能报 ValueError（值不对时的报错）
    except ValueError:
        print(f"“{raw}”不是数字，没删任何东西。")
        return
    if index < 1 or index > len(todos):     # 编号越界，挡住
        print(f"没有第 {index} 条，没删任何东西。")
        return
    removed = todos.pop(index - 1)          # 用户的 1 对应列表的下标 0
    print(f"已删除：{removed}")
```

把这个函数加进文件，并把 `main` 里第 3 个分支的占位换成 `delete_todo(todos)`。

揭晓：输 `abc` 时，`int("abc")` 会抛 `ValueError`，被 `except` 接住，打印提示后 `return`，**程序稳稳地回到菜单**；输 `99` 时能转成数字，但过不了 `index > len(todos)` 这关，同样被礼貌挡回。两种"乱输"都没能让程序崩溃——这就是异常保护的意义。

<div class="csf-why">注意 <code>index - 1</code> 这个减一。用户看到的编号从 1 开始（第 1 条、第 2 条），但列表下标从 0 开始（todos[0] 是第一条）。这个"差一"是新手最常踩的坑之一，叫 off-by-one。处理"给人看的编号"和"给程序用的下标"之间的转换，要时刻提醒自己减一。</div>

### 第五步：存盘与读盘——让数据活过这次运行 <span class="csf-b csf-core">必读</span>

到现在，程序一关，待办全没。因为 `todos` 只存在内存里，程序一结束就被清空。要让数据"活下来"，得把它写进**文件**（硬盘），下次启动再读回来。这叫**持久化**。

我们用最朴素的办法：一行存一条待办的纯文本文件。

```python
TODO_FILE = "todos.txt"

def load_todos():
    todos = []
    try:
        with open(TODO_FILE, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line:                    # 跳过空行
                    todos.append(line)
    except FileNotFoundError:
        pass                                # 第一次运行还没有文件，正常，返回空列表即可
    return todos

def save_todos(todos):
    with open(TODO_FILE, "w", encoding="utf-8") as f:
        for item in todos:
            f.write(item + "\n")
```

这两个函数写在文件的哪儿？和前面的 `add_todo`、`list_todos`、`delete_todo` 放在一起就行——也就是写在文件上方、`main` 函数之前的那一片函数区里，谁先谁后都不影响。下面第六步的完整版里你能看到它们的最终位置，对照着放即可。

接下来把这两个函数接进程序：

- 在 `main` 开头，把 `todos = []` 改成 `todos = load_todos()`——启动就从文件读。
- 在每次**改动了列表之后**（添加、删除成功后）调用 `save_todos(todos)`——改完立刻写回。

最省心的接法：在 `main` 的循环里，每次操作后统一存一次。改后的 `main` 长这样：

```python
def main():
    todos = load_todos()                    # 启动：从文件读回上次的待办
    while True:
        show_menu()
        choice = input("请选择(1-4): ")
        if choice == "1":
            add_todo(todos)
            save_todos(todos)               # 改完就存
        elif choice == "2":
            list_todos(todos)               # 只看不改，不用存
        elif choice == "3":
            delete_todo(todos)
            save_todos(todos)               # 改完就存
        elif choice == "4":
            print("再见！")
            break
        else:
            print("没有这个选项，请输入 1-4。")
```

**亲手验证持久化**：跑程序，加两条待办，选 4 退出。现在程序完全关闭了。再 `python todo.py` 一次，选 2 查看——刚才那两条还在吗？

在它们还在的那一刻，你应该会有一点小小的成就感：你写的程序，第一次拥有了"记忆"。

<div class="csf-note">为什么 <code>load_todos</code> 里要 <code>try ... except FileNotFoundError</code>？因为第一次运行时 <code>todos.txt</code> 根本不存在，直接 <code>open</code> 读会报错崩溃。我们用异常把"文件还没生成"这种<strong>正常的初次情况</strong>接住，返回空列表。<code>encoding="utf-8"</code> 是为了让中文待办不乱码，养成每次开文件都带上的习惯。</div>

<details class="csf-fold"><summary>为什么不用更"高级"的存法？<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
真实项目里，存结构化数据更常用 <strong>JSON</strong> 格式（Python 标准库 <code>json</code> 模块，能把列表/字典直接存成文件再原样读回），数据量大了还会用<strong>数据库</strong>（比如后面系列里会讲的 SQLite）。我们这里故意用最朴素的"一行一条文本"，是因为它<strong>看得见、摸得着</strong>——你可以直接用记事本打开 <code>todos.txt</code> 看到自己的待办，对"文件到底存了什么"有最直观的感受。等你这个版本跑顺了，把存储换成 <code>json.dump</code> / <code>json.load</code> 就是一个非常好的进阶练习。原理一样，只是格式更结实。</details>

### 第六步：合起来，从头到尾跑一遍

现在把六步拼成完整程序。建议你**别复制**——对照着把整份重敲一遍，敲的过程中你会发现自己已经能预判每一行要干嘛了。

```python
# todo.py —— 完整版
TODO_FILE = "todos.txt"

def load_todos():
    todos = []
    try:
        with open(TODO_FILE, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line:
                    todos.append(line)
    except FileNotFoundError:
        pass
    return todos

def save_todos(todos):
    with open(TODO_FILE, "w", encoding="utf-8") as f:
        for item in todos:
            f.write(item + "\n")

def show_menu():
    print("\n===== 待办管理器 =====")
    print("1. 添加待办")
    print("2. 查看全部")
    print("3. 删除待办")
    print("4. 退出")

def add_todo(todos):
    item = input("要添加什么待办？ ").strip()
    if item == "":
        print("空的不能加哦。")
        return
    todos.append(item)
    print(f"已添加：{item}")

def list_todos(todos):
    if not todos:
        print("（还没有任何待办）")
        return
    print("--- 你的待办 ---")
    for i, item in enumerate(todos, start=1):
        print(f"{i}. {item}")

def delete_todo(todos):
    if not todos:
        print("没有待办可删。")
        return
    list_todos(todos)
    raw = input("删除哪一条？输编号: ")
    try:
        index = int(raw)
    except ValueError:
        print(f"“{raw}”不是数字，没删任何东西。")
        return
    if index < 1 or index > len(todos):
        print(f"没有第 {index} 条，没删任何东西。")
        return
    removed = todos.pop(index - 1)
    print(f"已删除：{removed}")

def main():
    todos = load_todos()
    while True:
        show_menu()
        choice = input("请选择(1-4): ")
        if choice == "1":
            add_todo(todos)
            save_todos(todos)
        elif choice == "2":
            list_todos(todos)
        elif choice == "3":
            delete_todo(todos)
            save_todos(todos)
        elif choice == "4":
            print("再见！")
            break
        else:
            print("没有这个选项，请输入 1-4。")

main()
```

跑一遍完整流程：加几条、查看、删一条、退出、再启动确认还在、试着输几个乱七八糟的东西看它崩不崩。**全部跑通的那一刻，你已经独立完成了一个真正能用的程序。** 别小看它——它具备了一个真实软件的全部骨架：交互、逻辑、存储、容错。

## 💡 自己复述一遍

合上屏幕，用一句话回答：**做一个小程序的正确顺序是什么？** 

（参考：先把大需求拆成几个小到能立刻动手的功能；先搭一个能跑的最小骨架；然后一个功能一个函数地往里加，每加一个就立刻跑一下测一下；数据要持久就读写文件；用户会乱输的地方就用 try 接住。一句话——**拆开、搭骨架、一块一块加、写一点测一点**。）

## 🔧 翻车现场

**翻车一：想一口气把所有功能写完，写到一半全乱了。** <span class="csf-b csf-key">重点</span><br>
这是新手第一大坑。一次写两百行再运行，一堆报错，你根本不知道是哪行的锅。<br>
解法：强制自己"写一点测一点"。每实现一个小功能（哪怕只是菜单骨架）就立刻 `python todo.py` 跑一次。这样一旦出错，问题一定在你刚加的那几行里，定位成本极低。这不是"慢"，这是真正的快。

**翻车二：遇到 bug 就慌，直接用 Ctrl+A（全选快捷键，按下后会选中所有代码）把代码删了重写。**<br>
重写不会让 bug 消失，它只会让你把同样的 bug 再写一遍。正确做法是**定位**：在你怀疑出问题的地方插一行 `print`，把中间变量打出来看看。比如删除老是删错条，就在 `pop` 前面加 `print("index =", index, "列表 =", todos)`，一眼就能看出是不是"差一"问题。这招土，但它是程序员每天都在用的看家本领。

**翻车三：`choice == 1` 永远不成立。**<br>
`input()` 返回的是字符串 `"1"`，不是数字 `1`，两者不相等。要么拿 `choice == "1"` 比字符串，要么先 `int(choice)` 转成数字再比。本讲菜单用的是前者。

**翻车四：第一次运行就报 `FileNotFoundError`。**<br>
文件还没被创建，你就去读它。所以 `load_todos` 里用 `try/except FileNotFoundError` 把"文件不存在"当成正常情况处理，返回空列表。等你第一次添加并 `save_todos` 后，文件就自动有了。

**翻车五：删除时输的编号对不上。**<br>
用户看到的"第 1 条"在列表里是下标 `0`。删除时务必 `todos.pop(index - 1)`，别忘了减一。

## ✅ 自检三问

1. 为什么我们要先写一个只有菜单、功能全是占位文字的"空骨架"，而不是直接写完整功能？
2. `load_todos` 里如果去掉 `try/except FileNotFoundError`，第一次运行会发生什么？为什么会这样？
3. 删除功能里如果把 `todos.pop(index - 1)` 写成 `todos.pop(index)`，用户输"删第 1 条"时实际会删掉哪一条？为什么？

（都能说清楚，说明你不只是抄通了，而是真的懂了每一行在干嘛。）

## 🚀 挑战

在你跑通的版本上，自己动手加**一个**新功能（任选其一，别贪多，挑一个做透）：

- **标记完成**：给每条待办加一个"是否完成"的状态，菜单加一项"5. 标记完成"，查看时已完成的前面打个 `[x]`，未完成打 `[ ]`。（提示：这时一条待办可能不再适合用纯字符串表示，想想要不要换成字典，存盘格式也得跟着调整。）
- **搜索**：加一项"按关键词查找待办"，输入一段文字，把所有包含它的待办列出来。（提示：用 `if 关键词 in item`。）
- **换成 JSON 存储**：把 `save_todos` / `load_todos` 改用标准库 `json` 模块，体会一下结构化存储的好处。

<div class="csf-note">挑战守则：<strong>先自己写，卡住了再问 AI，但只问"思路"和"报错含义"，不要它的整段代码。</strong> 比如你可以问"Python 怎么判断一个字符串里包含另一个字符串"，但要自己把这行写进你的程序。记住，能让你成长的是你敲下并跑通的每一行，不是你复制粘贴的每一行。这是整门课的核心，也是你日后和 AI 协作时不被牵着走的底气。</div>

## 📦 复制带走

<div class="csf-card"><strong>本讲要记住的 4 件事</strong><br>
1. <strong>会拆需求 ＞ 会背语法。</strong> 把大目标切成"小到能立刻动手"的功能块，是程序员最核心的功夫。<br>
2. <strong>写一点测一点。</strong> 先搭能跑的最小骨架，再一个函数一个功能地加，每加一步就运行验证——错了也只在新加的几行里。<br>
3. <strong>程序的四根支柱：</strong> 循环让它转、函数让它有条理、文件让数据活过这次运行、异常让它经得起乱输入。<br>
4. <strong>bug 靠定位不靠重写。</strong> 插 `print` 打中间值、读懂报错信息——这是日常调试的看家本领。</div>

### 写在整门课的最后

走到这里，你从"装好 Python、打印第一行字"，一路练到"独立做出一个能存数据、能容错的命令行程序"。这中间没有任何一步是 AI 替你跨过去的——每一行都是你自己敲的，每一个 bug 都是你自己揪出来的。**这份"我能从零做出一个东西"的底气，就是这门课最想交到你手里的礼物。**

你现在拥有的，不是"听说过 Python"，而是一双能写、能读、能改、能判断的手。以后再用 AI 写代码，你能看得懂它写了什么、能挑出它的错、能自己掌方向盘。这份"能看懂、能挑错"的能力，会让你在用 AI 的时候更有底气，不容易被它牵着走。

接下来往哪走？这门《编程语言入门（Python）》是整个《计算机基本功路线图》的起点。手里有了 Python 这把趁手的工具，系列里下一门课会带你往更底层走一点——去认识**数据是怎么被组织和存取的**（数据结构与算法），或者去搞懂**你写的程序在电脑里到底是怎么跑起来的**（计算机基础）。带着你这个待办管理器留下的手感，继续往前。基本功，慢慢练，会很扎实。

我们下一门课见。
