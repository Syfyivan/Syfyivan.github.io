---
title: "《计算机基本功路线图 · 数据结构与算法》第03讲 · 栈与队列：进出顺序的两种规矩"
date: 2026-07-04 12:00:00
tags: [计算机基础, 数据结构与算法, 零基础, 编程入门, 课程]
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

<div class="csf-key-note">上一讲我们把数据排成了一条线（数组和链表）。这一讲要管的是另一件事：<b>这条线，东西从哪头进、从哪头出</b>。就两种规矩——<b>栈</b>是"后进先出"，像把盘子一只只摞起来、只能从最上面拿；<b>队列</b>是"先进先出"，像排队买奶茶。规矩听起来简单到不像个知识点，但它能决定一道题你是三行写完还是绕一大圈。今天我们把这两种规矩讲透，并且亲手写出来。</div>

## 🎯 这一讲你会学到什么

- 用自己的话说清两种规矩：**后进先出（LIFO）** 和 **先进先出（FIFO）**，并知道它们分别长什么样。
- 学会栈的两个动作：**压栈（push）** 和 **弹栈（pop）**；队列的两个动作：**入队（enqueue）** 和 **出队（dequeue）**。
- 用 Python 的 `list` 亲手实现一个栈，并写一个**括号匹配检查器**（能处理 `()[]{}` 嵌套）。
- 用 `collections.deque` 实现一个队列，模拟**银行排队叫号**。
- 搞懂一个新手最常踩的性能坑：**为什么不能用 `list.pop(0)` 当队列**。

<div class="csf-note">这一讲的代码都很短，但请你<b>务必自己敲一遍、自己跑一遍</b>。栈和队列是后面很多内容的地基，比如 BFS / DFS（两种"走迷宫式"地把所有可能性都搜一遍的方法，后面会专门讲，现在完全不用懂）、表达式求值、撤销功能等等。手上过过一遍、有了肌肉记忆，后面学起来会顺很多。这种短小的基础练习，特别适合自己动手——亲手敲、亲手跑，理解才会真正长在你身上；让 AI 直接给答案虽然快，但那份手感是替不来的。</div>

## 🛠 跟我做

### 先建立画面感：两种规矩到底差在哪 <span class="csf-b csf-core">必读</span>

别急着写代码，先在脑子里立两幅画面。

**栈（Stack）= 一摞盘子。** 你只能往**最上面**放盘子，也只能从**最上面**拿盘子。最后放上去的那个，最先被拿走。这就叫 **LIFO**（Last In, First Out，后进先出）。

**队列（Queue）= 排队买奶茶。** 新来的人站到**队尾**，叫号永远从**队头**叫。最先来的人最先买到。这就叫 **FIFO**（First In, First Out，先进先出）。

<div class="csf-legend">📚 四个动作的黑话，记一下：<br>压栈 / push：往栈顶放一个 · 弹栈 / pop：从栈顶拿走一个<br>入队 / enqueue：往队尾加一个 · 出队 / dequeue：从队头拿走一个</div>

**先猜后做**：假设有一个空栈，我依次压入 `A`、`B`、`C`，然后弹出一个，再压入 `D`，再弹出一个。请你先在纸上写下——**两次弹出的分别是谁？** 想好了再往下看。

<div class="csf-why">揭晓：压入 A、B、C 后，栈从底到顶是 [A, B, C]，栈顶是 C。第一次弹出拿走栈顶 → <b>C</b>，现在栈是 [A, B]。再压入 D → [A, B, D]，栈顶是 D。第二次弹出 → <b>D</b>。所以两次弹出是 C 和 D。如果你猜的是 A、B，那说明你心里装的还是"先进先出"——把画面切换成"叠盘子"再想一遍。</div>

### 动手练一：用 list 实现一个栈 <span class="csf-b csf-key">重点</span>

好消息：Python 的 `list` 天生就能当栈用，因为它在**末尾**加东西、取东西都很快。我们约定——**列表的末尾就是栈顶**。

- `append(x)` 就是压栈（往末尾加）。
- `pop()` 不带参数，就是弹栈（取走末尾）。

先猜一下下面这段会打印什么，再运行：

```python
stack = []          # 用一个空列表当栈

stack.append("A")   # 压栈，现在 [A]
stack.append("B")   # 压栈，现在 [A, B]
stack.append("C")   # 压栈，现在 [A, B, C]

print(stack.pop())  # 弹栈，取走栈顶
print(stack.pop())  # 再弹一个
print(stack)        # 看看还剩啥
```

<div class="csf-why">运行结果：先打印 <code>C</code>，再打印 <code>B</code>，最后打印 <code>['A']</code>。后进的 C 最先出来——这就是 LIFO。</div>

为了让"栈"这个概念更清楚，我们把它包装成一个自己的**类**。

<div class="csf-note">先花一分钟认识几个第一次见的词，后面看代码就不慌了：<br>• <b>类（class）</b>：把"一组数据"和"操作这组数据的动作"打包在一起的模板。比如我们这个 <code>Stack</code> 类，里面既存着栈里的东西，又带着 push、pop 这些动作。<br>• <b><code>def</code></b>：定义一个"动作"（也叫函数/方法），<code>def push(...)</code> 就是定义一个叫 push 的动作。<br>• <b><code>__init__</code></b>：一个特殊动作，<b>每次新建一个栈时会自动跑一遍</b>，用来做初始化（这里就是准备一个空列表）。<br>• <b><code>self</code></b>：代表"这个对象自己"。<code>self._items</code> 就是"这个栈自己的那个列表"，这样不同的栈各存各的，不会串。</div>

下面这段我们顺手**处理好空栈的情况**（这点很重要，待会儿翻车现场会专门讲）：

```python
class Stack:
    def __init__(self):
        self._items = []          # 内部用 list 存

    def push(self, x):            # 压栈
        self._items.append(x)

    def pop(self):                # 弹栈
        if self.is_empty():       # 先判断空，别硬弹
            # raise = 主动抛出一个错误，让程序停下并告诉你哪里不对
            # IndexError 是"下标/取值出错"这类错误，空栈取不到东西就属于这种
            raise IndexError("栈是空的，没法弹出")
        return self._items.pop()

    def peek(self):               # 偷看栈顶，但不取走
        if self.is_empty():
            raise IndexError("栈是空的，没法看栈顶")
        return self._items[-1]    # [-1] 在 Python 里表示倒数第一个，也就是列表最末尾——末尾就是栈顶

    def is_empty(self):
        return len(self._items) == 0

    def size(self):
        return len(self._items)


# 试一试
s = Stack()
s.push(1)
s.push(2)
print(s.peek())   # 2，只是偷看，没取走
print(s.pop())    # 2
print(s.pop())    # 1
print(s.is_empty())  # True
```

<div class="csf-note">注意 <code>peek</code> 和 <code>pop</code> 的区别：<b>peek 只看不拿，pop 看完拿走</b>。这个区分以后非常常用，比如"看看栈顶是不是我要的左括号，是的话才弹掉它"。</div>

### 动手练二：括号匹配检查器 <span class="csf-b csf-core">必读</span>

这是栈的**经典应用**，几乎所有代码编辑器帮你检查括号配不配对，背后都是它。

**任务**：给一串只含 `()[]{}` 的字符串，判断括号是否正确匹配。比如 `"([]{})"` 是对的，`"([)]"` 是错的（交叉了），`"(("` 也是错的（没闭合）。

**为什么是栈？** 先猜：你读到一个左括号时，它要等"配对的右括号"来关掉它；而最近打开的括号，必须最先被关掉——`([` 这种，先关 `]` 才轮到关 `)`。**"最近打开、最先关闭"，这不就是后进先出吗？** 所以：遇到左括号就压栈，遇到右括号就看栈顶那个左括号配不配。

自己先在纸上走一遍 `"([)]"`，看看它会在哪一步出问题。

下面代码里会用到一个叫**字典**的东西：`pairs = {")": "(", "]": "[", "}": "{"}`，你可以把 `{}` 里理解成一组"对应关系表"，每一对 `键: 值` 记着一条对应。写成 `pairs[")"]` 就能查到"和 `)` 配对的是 `(`"，很像查字典——给个词，返回它的解释。这里我们就用它来快速查"某个右括号，对应的左括号长什么样"。（字典本身下一讲会专门讲，这里照着用、知道它在查表就够了。）

然后看代码：

```python
def is_balanced(s):
    stack = []
    pairs = {")": "(", "]": "[", "}": "{"}   # 右括号 → 对应的左括号

    for ch in s:
        if ch in "([{":          # 左括号，压栈
            stack.append(ch)
        elif ch in ")]}":        # 右括号，要去配对
            if not stack:        # 栈空了还来右括号 → 没有左的配它
                return False
            if stack.pop() != pairs[ch]:  # 栈顶的左括号和它不配
                return False
        # 题目说只有括号，其它字符这里先不管

    return len(stack) == 0       # 最后栈必须空，否则有左括号没关上


# 自检一下
print(is_balanced("([]{})"))  # True
print(is_balanced("([)]"))    # False（交叉）
print(is_balanced("(("))      # False（没闭合，最后栈不空）
print(is_balanced("]"))       # False（一上来就是右括号）
print(is_balanced(""))        # True（空串算匹配）
```

<div class="csf-why">最后那句 <code>return len(stack) == 0</code> 是很多人会漏的关键。比如 <code>"(("</code>，整个循环里从没遇到右括号，不会触发任何 False，但循环结束时栈里还躺着两个左括号——它们都没被关上。所以"扫完之后栈必须是空的"，才算真正匹配。</div>

<details class="csf-fold"><summary>为什么用字典存配对关系，而不是一堆 if<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
你完全可以写成 <code>if ch == ")" and top != "(": return False</code> 这样一长串 if，逻辑一样对。但用 <code>pairs = {")":"(", "]":"[", "}":"{"}</code> 这个字典，三种括号的规则被压成了一行 <code>stack.pop() != pairs[ch]</code>，读起来更清爽，以后想加新括号也只改字典。<br>这是一种很常见的小技巧：<b>把"分支判断"换成"查表"</b>。下一讲讲哈希表时，你会看到这种"用查表代替挨个判断"的思路被发挥到极致。</details>

### 动手练三：用 deque 实现队列，模拟银行叫号 <span class="csf-b csf-key">重点</span>

队列要的是**一头进、另一头出**。Python 里实现队列的标准做法，是用 `collections` 模块里的 `deque`（读作 "deck"，双端队列）。它在**两头**加和取都很快。

- `append(x)`：从右边（队尾）入队。
- `popleft()`：从左边（队头）出队。

先猜：下面模拟三个人来排队、依次叫号，叫号顺序会是谁先谁后？

```python
from collections import deque

queue = deque()           # 一个空队列

# 三个人陆续来取号排队（入队，加到队尾）
queue.append("1号 张三")
queue.append("2号 李四")
queue.append("3号 王五")

print("当前排队：", list(queue))

# 柜员开始叫号（出队，从队头叫）
while queue:                       # 队列不空就一直叫
    current = queue.popleft()     # 从队头取走
    print("请", current, "到柜台办理")

print("没人排队了，下班")
```

<div class="csf-why">叫号顺序是 张三 → 李四 → 王五，和他们来的顺序一模一样。先来的先被服务，这就是 FIFO。注意 <code>while queue:</code>——空的 deque 在条件判断里相当于 False，所以队列一空循环就停，这也顺手避免了"对空队列 popleft"的崩溃。</div>

同样地，我们把它包装成一个像样的 `Queue` 类，并处理好空队列：

```python
from collections import deque

class Queue:
    def __init__(self):
        self._items = deque()

    def enqueue(self, x):          # 入队，加到队尾
        self._items.append(x)

    def dequeue(self):             # 出队，从队头取
        if self.is_empty():
            raise IndexError("队列是空的，没人可叫")
        return self._items.popleft()

    def is_empty(self):
        return len(self._items) == 0

    def size(self):
        return len(self._items)


q = Queue()
q.enqueue("张三")
q.enqueue("李四")
print(q.dequeue())   # 张三（先来的先走）
print(q.dequeue())   # 李四
print(q.is_empty())  # True
```

<div class="csf-note">把这三段都跑通后，你其实已经手握两件后面会反复用到的工具了。代码虽短，但"为什么栈顶是末尾""为什么队列用 popleft 而不是 pop(0)"这些理解，亲手过一遍会记得格外清楚。</div>

## 💡 自己复述一遍

合上屏幕，用一句话回答：**栈和队列的区别是什么？它们各自从哪头进、哪头出？**

如果你能脱口而出"栈是后进先出，同一头进同一头出，像叠盘子；队列是先进先出，一头进另一头出，像排队"，那这一讲的核心你就拿下了。再补一句更狠的：**遇到'最近的先处理'就用栈，遇到'按来的顺序处理'就用队列。**

## 🔧 翻车现场

### 翻车一：拿 `list.pop(0)` 当队列用，数据一多就变慢 <span class="csf-b csf-core">必读</span>

这是新手最容易踩、而且很难自己发现的坑。`list` 当栈用很爽（末尾进出都快），于是有人想：那队列也用 list 嘛，入队 `append`，出队就 `pop(0)`（取走第一个）。逻辑没错，结果对。但是——

**`list.pop(0)` 是 O(n) 的操作。**（先提醒一句这个符号怎么读：O(n) 读作"大 O n"，粗略表示"花的功夫和数据量 n 成正比，量越大越慢"；O(1) 则表示"不管数据多少都一样快"。上一讲提过，这里复习一下。）还记得上一讲的数组吗？删掉第 0 个元素后，后面**所有元素都得整体往前挪一格**。队列里有 1 万个人，每出队一个就要挪 1 万次；出队一万次，总共挪了上亿次。数据量一大，慢得肉眼可见。

```python
# ❌ 能跑，但慢：每次 pop(0) 都要把后面全部元素往前搬
q = []
q.append("a")
first = q.pop(0)     # O(n)，元素一多就是性能灾难

# ✅ 正确：deque 的 popleft 是 O(1)，两头进出都快
from collections import deque
q = deque()
q.append("a")
first = q.popleft()  # O(1)
```

<div class="csf-why">为什么 deque 快？它内部不是一整块连续数组，而是分段链起来的结构，两头都留着"门"，所以从左边取、从右边加都不用搬动其他元素，都是 O(1)。<b>结论很简单，记死它：要队列，就 import deque，别用 list.pop(0)。</b>这正是这门课想培养的判断力——AI 给你的代码里如果出现 <code>pop(0)</code> 在循环里反复跑，你要能一眼看出"这里会慢"。</div>

### 翻车二：栈/队列已经空了，还去弹出 <span class="csf-b csf-key">重点</span>

对一个空的 `list` 调 `pop()`，或对空 `deque` 调 `popleft()`，Python 会直接抛 `IndexError` 把程序崩掉。

```python
stack = []
stack.pop()   # IndexError: pop from empty list  ← 程序就死在这
```

解法就是我们前面类里写的那句：**弹之前先 `if is_empty()` 判断一下**，要么提前返回、要么给个清楚的报错。括号匹配那道题里 `if not stack: return False` 也是同一个意思——栈空了还来右括号，说明根本没的配，直接判错。养成"取之前先看有没有"的习惯。

### 翻车三：把"看栈顶"和"弹栈顶"搞混 <span class="csf-b csf-skim">可跳读</span>

`peek` 只看不拿，`pop` 看完拿走。有人想"判断一下栈顶是不是 X"，结果直接 `pop()` 了出来——栈顶没了，逻辑就乱了。需要看的时候用 `peek`（也就是 `self._items[-1]`），确实要拿走了再 `pop`。

## ✅ 自检三问

1. 我能用"叠盘子"和"排队"分别讲清 LIFO 和 FIFO，并说出每种各从哪头进、哪头出吗？
2. 括号匹配为什么用栈？循环结束后那句 `len(stack) == 0` 是在防什么情况？
3. 为什么队列要用 `deque` 而不是 `list.pop(0)`？后者慢在哪一步？

<div class="csf-note">如果第 2、3 问有一个答不利索，别往下走，回到对应的"跟我做"和"翻车现场"再读一遍、再把代码跑一遍。这两点是这一讲最值钱的部分。</div>

## 🚀 挑战

给你一个小任务，**建议自己动手写一遍**（万一卡住了，可以让 AI 当家教帮你看看哪里错了，而不是直接要答案——这样你的收获会最大）：

**做一个"撤销"功能的雏形。** 用一个栈记录用户的操作历史：每做一个动作就 `push` 一条（比如字符串 `"输入 a"`），每次"撤销"就 `pop` 出最近的一条并打印"已撤销：xxx"。要求处理好"没有可撤销的操作了"这种情况（栈空时给出友好提示，而不是崩溃）。

想想看：撤销永远是撤销**最近**那一步——这正好是栈的舞台。

<details class="csf-fold"><summary>做完想再进一步？两个加分方向<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
1. 加一个 redo（重做）：再开一个栈，撤销时把弹出的动作压进 redo 栈，重做时从 redo 栈弹回来。这其实就是你每天用的编辑器 Ctrl+Z / Ctrl+Y 的原理骨架。<br>2. 把"银行叫号"扩展成<b>带优先级</b>的：VIP 客户插到普通队列前面。提示：单纯一个 FIFO 队列做不到这件事——这正好埋个伏笔，后面学到"优先队列 / 堆"时你会回头想起这个需求。</details>

## 📦 复制带走

<div class="csf-card">1. <b>栈 = 后进先出（LIFO）</b>，一头进一头出，像叠盘子；动作叫 push / pop。Python 里直接用 list：<code>append</code> 压栈、<code>pop()</code> 弹栈。<br>2. <b>队列 = 先进先出（FIFO）</b>，一头进另一头出，像排队；动作叫 enqueue / dequeue。用 <code>collections.deque</code>：<code>append</code> 入队、<code>popleft</code> 出队。<br>3. <b>判断口诀</b>：要"最近的先处理"（括号匹配、撤销、表达式）就用栈；要"按来的顺序处理"（排队、任务调度、待会儿的 BFS）就用队列。<br>4. <b>两个铁律</b>：队列别用 <code>list.pop(0)</code>（O(n)，慢），用 deque；弹出前先判空，别让程序崩在空栈/空队列上。</div>

下一讲我们进入**第04讲《哈希表：用空间换时间的查找神器》**——你会看到"查一个东西在不在"如何从挨个找的 O(n) 变成几乎一步到位的 O(1)，以及这一讲里"用查表代替挨个 if"的思路是怎么被发挥到极致的。我们下一讲见。
