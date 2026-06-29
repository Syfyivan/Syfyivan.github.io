---
title: "《计算机基本功路线图 · 数据结构与算法》第06讲 · 排序（一）：从笨办法看清思路"
date: 2026-07-04 15:00:00
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

<div class="csf-key-note">排序，是几乎每个学算法的人第一道"用手磨"的题。这一讲我们故意先学三种<strong>慢</strong>的排序——冒泡、选择、插入。慢不要紧，它们的好处是：思路简单到你能在脑子里完整跑一遍。等你亲眼看清"一个数是怎么被挪到该去的位置"，下一讲那些聪明又快的排序，你才会真正懂它们聪明在哪。这一讲的代码，请<strong>务必自己一行行敲</strong>，不要让 AI 代写——这是你练"看懂代码在干嘛"的第一块磨刀石。</div>

## 🎯 这一讲你会学到什么

- 两个最基础的动作：**比较**两个数谁大谁小、**交换**它们的位置——排序说到底就是这俩动作的不同排列组合。
- 徒手写出三种经典的"笨"排序：**冒泡排序**、**选择排序**、**插入排序**。
- 讲清每一种的**核心思路**（一句话能说明白的那种），以及它们为什么都是 **O(n²)**。
- 一个常被低估的事实：插入排序在**小规模**或**近乎有序**的数据上，其实跑得飞快。
- 顺带认识一个面试爱问、实际也重要的概念：**稳定性**。

<div class="csf-note">前置：你需要装好 Python，会用 <code>print</code>，懂列表（list）的下标访问 <code>a[0]</code>、<code>for</code> 循环、<code>range</code>。这些在前面几讲都铺过了。第05讲我们刚聊完递归——这一讲反过来，全是老老实实的循环，正好换换脑子。</div>

## 🛠 跟我做

### 第 0 步：排序到底在干嘛 <span class="csf-b csf-core">必读</span>

给你一串乱序的数字 `[5, 2, 4, 1, 3]`，排序就是把它变成 `[1, 2, 3, 4, 5]`。

听起来简单，但**怎么变**有无数种方法。所有方法都建立在两个最小动作上：

- **比较**：看 `a[i]` 和 `a[j]` 谁大谁小（在 Python 里就是 `a[i] > a[j]`）。
- **交换**：把两个位置上的数对调。Python 里有个很爽的写法：

```python
a[i], a[j] = a[j], a[i]   # 一行交换两个位置，不需要临时变量
```

<div class="csf-why">为什么强调这两个动作？因为接下来三种排序，本质都是"用不同的策略，安排比较和交换的顺序"。你抓住这条主线，就不会被一堆循环绕晕。一种排序快不快，很大程度上就看它<strong>比较了多少次、交换了多少次</strong>。</div>

### 第 1 步：冒泡排序——让大数"冒"到末尾 <span class="csf-b csf-core">必读</span>

冒泡排序的名字很形象：想象一列数字竖着排，**大的数像气泡一样，一步步往上（往末尾）浮**。

它的策略是：**从头到尾，相邻两个一对一对地比，谁大就把谁往后挪。** 走完一整趟，最大的那个一定被推到了最末尾。然后对剩下的再走一趟，第二大的就位……如此反复。

**先猜后做**：下面这段代码会打印每一轮结束后的列表。在运行之前，先在纸上猜一猜——第一轮走完，`[5, 2, 4, 1, 3]` 会变成什么样？最大的 5 会跑到哪？

```python
def bubble_sort(a):
    n = len(a)
    for i in range(n - 1):            # 一共走 n-1 趟
        for j in range(n - 1 - i):    # 每趟比到"还没就位"的部分为止
            if a[j] > a[j + 1]:       # 左边比右边大
                a[j], a[j + 1] = a[j + 1], a[j]   # 就交换，把大的往后挪
        print(f"第 {i + 1} 轮结束:", a)   # 亲眼看大数怎么冒上去（f"..." 见下方说明）
    return a

data = [5, 2, 4, 1, 3]
print("初始:    ", data)
bubble_sort(data)
print("最终:    ", data)
```

<div class="csf-note">第一次见 <code>f"..."</code>？它是 Python 的"格式化字符串"：在引号前面加一个字母 <code>f</code>，就能在引号里用花括号 <code>{}</code> 把变量或一小段算式包起来，运行时花括号会被替换成它实际的值。比如这里 <code>i</code> 是 0 时，<code>{i + 1}</code> 就会显示成 1，整句打印出来就是"第 1 轮结束:"。<br><br>如果你觉得这个写法陌生，也可以先用最朴素的逗号写法，效果一样：<code>print("第", i + 1, "轮结束:", a)</code>——用逗号把要打印的东西一段段隔开就行。</div>

把它存成 `bubble.py`，运行 `python bubble.py`。你应该会看到类似这样的过程：

```
初始:     [5, 2, 4, 1, 3]
第 1 轮结束: [2, 4, 1, 3, 5]
第 2 轮结束: [2, 1, 3, 4, 5]
第 3 轮结束: [1, 2, 3, 4, 5]
第 4 轮结束: [1, 2, 3, 4, 5]
```

看第一行结束：`5` 一路被推到了最末尾。这就是"冒泡"。第二轮，`4` 冒到了倒数第二位。每一轮，末尾就多一个**已经就位、不用再动**的数——这正是内层 `range(n - 1 - i)` 里那个 `- i` 的作用：已经就位的尾巴，不用再比了。

<div class="csf-note">猜对了吗？很多人第一次会以为"第一轮就能排好序"，其实不会——一轮只能保证<strong>一个</strong>数（最大的）就位。这就是为什么外层要走 n-1 趟。</div>

<details class="csf-fold"><summary>能不能"提前收工"？<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
如果某一轮走下来，<strong>一次交换都没发生</strong>，说明数组已经有序了，可以直接停。加一个标志位就行：<br><br>
<code>swapped = False</code> 放在内层循环前；发生交换时 <code>swapped = True</code>；内层结束后 <code>if not swapped: break</code>。<br><br>
这个小优化让冒泡排序在"已经有序"的数据上变成 O(n)——只走一趟发现没动静就收工。但在最坏情况（完全倒序）下，它还是 O(n²)。建议你自己加上这个标志位跑一遍试试，体会一下"先猜"的力量。</details>

### 第 2 步：选择排序——每轮挑出最小的 <span class="csf-b csf-key">重点</span>

选择排序的思路换了个角度：**每一轮，从还没排好的部分里挑出最小的那个，把它放到最前面。**

冒泡是"不停地两两交换、慢慢拱"，选择是"先看一圈、找到最小、只换一次"。后者的交换次数明显更少。

**先猜后做**：这次我们让冒泡和选择排同一组数据，并各自统计**交换次数**。运行前先猜：哪个交换次数少？

```python
def selection_sort(a):
    n = len(a)
    swaps = 0
    for i in range(n - 1):
        min_idx = i                   # 先假设当前位置就是最小的
        for j in range(i + 1, n):     # 在后面找有没有更小的
            if a[j] < a[min_idx]:
                min_idx = j           # 记下更小的位置
        if min_idx != i:              # 找到了真正的最小，才交换
            a[i], a[min_idx] = a[min_idx], a[i]
            swaps += 1
    return swaps

def bubble_count(a):
    n = len(a)
    swaps = 0
    for i in range(n - 1):
        for j in range(n - 1 - i):
            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]
                swaps += 1
    return swaps

# 用同一组数据，各复制一份，公平对比
raw = [5, 2, 4, 1, 3, 8, 7, 6]
s1 = bubble_count(raw.copy())
s2 = selection_sort(raw.copy())
print("冒泡交换次数:", s1)
print("选择交换次数:", s2)
```

存成 `compare.py` 运行。你会发现**选择排序的交换次数通常少得多**——因为它每轮最多只换 1 次（找到最小后才换），而冒泡可能换很多次。

<div class="csf-why">这给你一个重要直觉：<strong>"复杂度同为 O(n²)"不代表它们一样快</strong>。大 O 抹掉了常数，但真实运行里，交换一次内存写入是有代价的。如果交换的代价很大（比如挪动的是很重的对象），选择排序的"少交换"就是实打实的优势。学会区分"理论量级"和"实际常数"，是你能压 AI 一头的判断力之一。</div>

### 第 3 步：插入排序——像理扑克牌 <span class="csf-b csf-key">重点</span>

插入排序最贴近生活：你摸扑克牌时是怎么整理的？**抓到一张新牌，往左边已经理好的牌里插到合适的位置。**

它的策略是：把数组看成"左边已排好 + 右边还没碰"。每次拿右边第一个数，**往左边一路比、一路往后挪，直到找到它该待的位置插进去。**

**先猜后做**：对**近乎有序**的数据 `[1, 2, 3, 5, 4]`（只有最后两个反了），插入排序要做多少次"挪动"？先猜，再看代码里的计数。

<div class="csf-note">这一段第一次用到 <code>while</code>，它也是一种循环，但和前面的 <code>for</code> 不一样：<code>for</code> 是"数着次数走"（走完 range 里那么多次就停），而 <code>while</code> 是"只要括号里的条件还成立，就一直重复，条件一旦不成立就立刻停"。<br><br>另外这里出现的 <code>and</code>，意思是"两个条件必须同时成立"——下面 <code>while j >= 0 and a[j] > key</code> 就是说：只有当"还没退到最左边（<code>j >= 0</code>）"并且"左边这个数确实比 key 大（<code>a[j] > key</code>）"两件事同时为真时，才继续往左挪；任意一个不满足，循环就停。</div>

```python
def insertion_sort(a):
    n = len(a)
    moves = 0
    for i in range(1, n):             # 从第 2 个数开始,左边第 1 个算"已排好"
        key = a[i]                    # 当前要插入的牌
        j = i - 1
        while j >= 0 and a[j] > key:  # 左边的数比 key 大,就给 key 腾位置
            a[j + 1] = a[j]           # 把大的往后挪一格
            moves += 1
            j -= 1
        a[j + 1] = key                # 挪到头了,把 key 放进空出来的位置
    print("挪动次数:", moves)
    return a

print(insertion_sort([1, 2, 3, 5, 4]))   # 近乎有序
print("---")
print(insertion_sort([5, 4, 3, 2, 1]))   # 完全倒序,最坏情况
```

和前两步一样，把它存成 `insertion.py`，运行 `python insertion.py`。你会看到：近乎有序那组，挪动次数很少（就 1 次）；完全倒序那组，挪动次数就多了。

<div class="csf-note">这就是插入排序最被低估的优点：<strong>数据越接近有序，它越快</strong>。在已经排好的数据上，它只需走一遍、几乎不挪动，接近 O(n)。所以很多语言的标准库排序，在数据规模很小或基本有序的片段上，会<strong>悄悄切回插入排序</strong>——别小看"笨办法"。</div>

### 第 4 步：为什么它们都是 O(n²) <span class="csf-b csf-core">必读</span>

三种排序代码长得不一样，但骨架都是**"循环套循环"**：外层走一遍 n 个数，内层又要扫一遍剩下的数。两层各跑大约 n 次，乘起来就是 n×n = n²。

回忆第03、04 讲里讲过的大 O：我们只关心**数据量翻倍时，工作量怎么变**。对 O(n²) 来说，**n 翻倍，工作量翻 4 倍**。数据从 100 个变成 1000 个（10 倍），工作量大约变 100 倍。这就是为什么它们在大数据上吃力——但在小数据上，这点差距你根本感觉不到。

<details class="csf-fold"><summary>那"最好情况"也是 O(n²) 吗？<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
不一定，要分开看：<br><br>
<strong>选择排序</strong>：无论数据长啥样，都得老老实实把每一轮的剩余部分扫一遍找最小值——所以它最好、最坏、平均都是 O(n²)，没有捷径。<br><br>
<strong>冒泡排序（带提前收工）</strong>和<strong>插入排序</strong>：在<strong>已经有序</strong>的数据上是 O(n)——走一遍发现不用动就结束。但在<strong>完全倒序</strong>的最坏情况下，仍是 O(n²)。<br><br>
所以严谨的说法是"它们的<strong>最坏/平均</strong>时间复杂度是 O(n²)"。会区分最好、最坏、平均，是你读懂算法分析的基本功。</details>

<details class="csf-fold"><summary>什么是"稳定性"？<span class="csf-b csf-skip">选学</span></summary>
稳定性说的是：值相等的元素，排序后<strong>相对前后顺序会不会被打乱</strong>。<br><br>
先说一下写法：<code>(1,"a")</code> 是用圆括号把两样东西打包成一小组数据（前面我们只用过方括号 <code>[]</code> 的列表，这里的圆括号是另一种"打包"），可以理解成"数字 1 配着一个标签 a"。<br><br>举例：给 <code>[(1,"a"), (1,"b")]</code> 这两组都按前面的数字 1 来排，因为数字一样大，稳定的排序会保证 <code>"a"</code> 仍然排在 <code>"b"</code> 前面，不打乱它们原来的先后。这在"先按价格排、再按销量排"这种多关键字排序里很重要。<br><br>
冒泡和插入是<strong>稳定</strong>的（相等时不交换/不越过）；选择排序的常见写法是<strong>不稳定</strong>的（远距离交换可能打乱相等元素的顺序）。现在记不住没关系，混个眼熟，以后用到会回来翻。</details>

## 💡 自己复述一遍

合上屏幕，用一句话分别说出三种排序的核心思路。比如：

- 冒泡：**相邻两两比，大的往后冒，每轮沉一个最大的到末尾。**
- 选择：**每轮从剩下的里挑最小的，放到前面，只换一次。**
- 插入：**像理扑克牌，把当前这张往左边已排好的里插到位。**

说不出来？回到对应的"跟我做"那一步，把代码再敲一遍、跑一遍——**别看着代码念，要能脱口而出策略**。能用大白话讲清思路，才算真懂，而不是背下了循环。

## 🔧 翻车现场

**翻车一：内外层循环边界写错，少排一轮或越界。**
冒泡里把内层写成 `range(n)` 而不是 `range(n - 1)`，那么 `a[j + 1]` 在 `j = n-1` 时就会访问到 `a[n]`——**下标越界，直接报错** `IndexError`。解法：内层比的是"相邻一对"，最后一对是 `a[n-2]` 和 `a[n-1]`，所以 `j` 最大只能到 `n-2`，写 `range(n - 1 - i)`。**遇到 off-by-one（差一）错误，最稳的办法是拿一个长度 3 的小数组，手动在纸上跑一遍下标。**

**翻车二：以为这些"笨排序"一无是处。**
真实工程里，数据规模小（几十个）或基本有序时，插入排序常常比"高级"排序还快——因为它常数小、没有递归开销。**别一看到 O(n²) 就嫌弃，要看具体场景。** 这正是你该有的判断力。

**翻车三：让 AI 直接给你写排序，然后照单全收。**
AI 能秒写出冒泡排序，但如果你没亲手写过，就看不出它把 `>` 写成 `<`（排反了）、把边界写错（少排一轮）、或者给你一个对你的数据并不合适的方案。**这一讲的代码请务必自己敲。** 你练的不是"会不会写冒泡"，而是"能不能看出一段排序代码对不对、合不合适"——那才是 AI 替不了你的东西。

<div class="csf-why">先猜后做的意义也在这里：你在运行前先预测结果，运行后对照，错了就知道自己哪里理解偏了。这个"预测—验证"的循环，是把别人的代码变成自己的判断力的关键。被动看十遍，不如主动猜一遍。</div>

## ✅ 自检三问

1. 冒泡排序走完**第一整趟**，能保证哪个数一定就位？为什么是它，而不是最小的？
2. 同样是 O(n²)，为什么选择排序的**交换次数**通常比冒泡少？这说明大 O 没告诉你什么？
3. 给你一个"几乎已经排好、只有两三个数错位"的列表，冒泡、选择、插入三个里，你会选哪个？为什么？

答不上来不丢人——回到对应小节再跑一遍代码。能答上来，说明你不只会写，还会**选**。

## 🚀 挑战

自己动手，不要让 AI 代写（写完可以让它帮你 review，但代码要出自你手）：

1. **加计数器对比三剑客**：把冒泡（带提前收工）、选择、插入三种排序，都加上"比较次数"和"交换/挪动次数"的统计。用**同一组随机数据**分别跑，把三组数字打印出来对比。随机数据可以用这一行生成：

   ```python
   import random
   data = [random.randint(1, 100) for _ in range(20)]
   ```

   逐段解释这行在干嘛：`import random` 是借用 Python 自带的随机数工具（用之前要先这样"借"一下）；`random.randint(1, 100)` 表示随机取一个 1 到 100 之间的整数；`[ ... for _ in range(20)]` 这种方括号里写 `for` 的写法，意思是"把里面那件事重复做 20 次、每次的结果装进同一个列表"，所以最后得到一个有 20 个随机整数的列表；那个单独的下划线 `_` 只是个"用不到的计数名字"——这里我们只关心重复 20 次，不关心具体是第几次，按惯例就用 `_` 占个位。
2. **专门测两种极端数据**：分别用「已经有序」`list(range(20))` 和「完全倒序」`list(range(20, 0, -1))` 各跑一遍，看看哪种排序在哪种数据上最省、最费。这里的 `range(20, 0, -1)` 比前面用过的 `range` 多塞了两个数字：它表示"从 20 开始、到 0 之前为止、每次减 1"，所以生成的是 20, 19, 18, ……, 1 这样的倒序；外面再套一个 `list()`，是把它变成一个真正能直接看、直接用的列表。
3. **先猜后做**：在运行第 2 步之前，先在纸上写下你的预测——"已经有序时，____排序最快；完全倒序时，____排序最费"。跑完对照，错了就去想为什么。

把你的预测、结果和"哪里猜错了"记在笔记里。这份对照，比记住三段代码值钱得多。

## 📦 复制带走

<div class="csf-card">
<strong>1. 排序 = 比较 + 交换的不同编排。</strong>三种笨排序的区别，只是"按什么策略安排这两个动作"。抓住这条主线，循环就不绕人了。<br><br>
<strong>2. 一句话记住三种思路。</strong>冒泡：相邻比、大的往后冒；选择：每轮挑最小、放前面；插入：理扑克牌、往左插到位。<br><br>
<strong>3. 都是 O(n²)，但不等于一样快。</strong>选择排序交换最少；插入排序在小规模/近乎有序时接近 O(n)，被标准库当"收尾利器"。大 O 给量级，常数和场景给真实快慢。<br><br>
<strong>4. 这一讲练的是判断力，不是抄代码。</strong>自己敲、先猜后做、对照结果——你练的是"看得出一段排序对不对、合不合适"，这是 AI 替不了你的本事。下一讲我们进入<strong>第07讲《排序（二）：分治的力量》</strong>，看聪明的排序怎么把 O(n²) 压到 O(n log n)。
</div>
