---
title: "《计算机基本功路线图 · 数据结构与算法》第04讲 · 哈希表：用空间换时间的查找神器"
date: 2026-07-04 13:00:00
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

<div class="csf-key-note">想象一本一万页的字典，但没有按字母排序。要查一个词，你只能从第一页一页页翻——这就是"一个个找"。哈希表干的事是：给你一个魔法公式，把词直接换算成页码，你翻到那一页，词就在那儿。<br><br>这一讲就讲清这个"魔法公式"是什么、为什么这么快、什么时候会失灵。讲透了，你以后看到"查重""计数""快速查找"这类需求，脑子里第一反应就是它。</div>

## 🎯 这一讲你会学到什么

上一讲我们学了栈和队列，它们管的是"进出顺序"。这一讲换一个完全不同的本事：**怎么飞快地找到一个东西**。

学完这一讲，你应该能做到：

- 用自己的话说清**哈希表为什么能做到近似 O(1) 的查找**，而不是只会说"它很快"。（O(1) 读作"大 O 一"，意思是"不管数据有多少，查一次花的时间几乎不变"，后面会细讲，先有个印象就行。）
- 看懂**键值对、哈希函数、冲突**这三个核心词，知道它们各自在干嘛。
- 会用 Python 的 `dict`（字典）和 `set`（集合）解决三类常见问题：**查重、计数、快速查找**。
- 知道哈希表的**坑**在哪：哪些东西不能当 key、为什么不能按下标取、极端情况下它会变慢成什么样。

<div class="csf-note">这一讲的代码都很短，但请你<strong>亲手一行行敲进去跑</strong>，不要复制粘贴、更不要让 AI 替你写。哈希表的"快"是要你自己在脑子里建立画面感的——你跑过、猜过、翻过车，这个画面才是你的。AI 这会儿只当陪练：你卡住了再问它"为什么"，而不是让它直接给你答案。</div>

## 🛠 跟我做

### 先从一个慢办法说起 <span class="csf-b csf-core">必读</span>

假设有一个名单（一个列表），我要判断"张三"在不在里面。最朴素的写法是**一个个比对**：

```python
names = ["李四", "王五", "赵六", "张三", "孙七"]

# 一个个找
found = False
for n in names:
    if n == "张三":
        found = True
        break

print(found)  # True
```

这个循环最坏情况要把整个列表扫一遍。如果名单有 100 万个人，它就可能比 100 万次。我们在第02讲说过，这种"长度翻倍、工作量也翻倍"的做法是 **O(n)**。

<div class="csf-why">先猜一下：如果名单变成 1000 万人，这种一个个找的写法，最坏要比多少次？……对，1000 万次。数据量涨多少，它就慢多少倍。这就是我们要干掉的东西。</div>

### 魔法公式：哈希函数 <span class="csf-b csf-key">重点</span>

哈希表的核心想法是：**别一个个找，直接算出它在哪**。

怎么算？靠一个叫**哈希函数**的东西。你给它一个数据（比如字符串 "张三"），它吐给你一个数字（比如 `7`）。这个数字就当作"格子编号"，我们把 "张三" 存进第 7 号格子。

下次要找 "张三"，不用翻遍所有格子——再用同一个公式算一次，还是 `7`，**直接跳到第 7 号格子**看一眼就行。算一次、跳一次，跟名单多长没关系。这就是近似 **O(1)**：不管有多少数据，查找花的时间几乎是固定的。

我们可以用 Python 内置的 `hash()` 函数亲眼看看这个"换算"：

```python
print(hash("张三"))
print(hash("李四"))
print(hash(42))
```

<div class="csf-why">先猜：上面三行会打印出什么样的东西？……跑一下你会看到三个很大的、看起来乱七八糟的整数（每个人电脑上数字可能不同，这正常）。重点不是数字本身，而是：<strong>同一个输入，每次算出来都一样</strong>——这是哈希函数能用来"定位"的根本前提。算出来的大整数再对格子总数取余，就得到一个具体的格子编号。</div>

这套"算编号 → 直接定位"的机制，Python 已经帮你封装好了，就叫 `dict` 和 `set`。你平时**不用自己写哈希函数**，但你得知道底下是这么转的——这样你才明白它为什么快、什么时候会失灵。

<details class="csf-fold"><summary>细究：取余、格子和"装填因子"<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
哈希表内部其实是一块连续的格子（数组）。`hash("张三")` 算出一个大整数后，会对格子总数取余（比如 `% 8`），落到 0~7 中的某一格。<br><br>当存的东西越来越多、格子快满了，哈希表会自动"扩容"——开一块更大的格子区，把老数据重新算编号搬过去。装得多满才扩容，这个比例叫<strong>装填因子（load factor）</strong>。这些都是 Python 自动做的，你现在只要知道"有这么回事"即可，不必深究。</details>

### 动手练一：用 dict 统计词频 <span class="csf-b csf-core">必读</span>

`dict`（字典）存的是**键值对**：一个"键"（key）配一个"值"（value），就像"词 → 出现次数"。键就是用上面那套哈希机制定位的，所以**按键存取近似 O(1)**。

我们来数一段英文里每个单词出现几次，再排出前 5 名。请**自己敲一遍**：

```python
text = """
the quick brown fox jumps over the lazy dog
the dog barks and the fox runs the fox is quick
"""

# 1) 切成单词列表
words = text.split()

# 2) 用 dict 计数
counts = {}
for w in words:
    # 如果 w 已经出现过，取它现在的次数加 1；没出现过就当作 0
    counts[w] = counts.get(w, 0) + 1

print(counts)

# 3) 按出现次数从多到少排序，取前 5 名
top5 = sorted(counts.items(), key=lambda pair: pair[1], reverse=True)[:5]
for word, n in top5:
    print(f"{word}: {n}")
```

<div class="csf-why">先猜后看：这段文字里 "the" 出现了几次？"fox" 呢？先数一下心里有个数，再跑代码对答案。（提示：数一数那两行里 "the" 出现的位置。）</div>

这里有几个新东西，挨个说清：

- `text.split()`：把一大段字符串按空白切成单词列表。
- `counts.get(w, 0)`：去字典里取 `w` 的当前次数；如果 `w` 还没进过字典，就**返回默认值 0**，而不是报错。这是计数的常用招式。
- `counts.items()`：把字典变成一串 `(键, 值)` 对，方便排序。
- `key=lambda pair: pair[1]`：这里出现了一个新词 **lambda**。它就是"临时造一个一次性的小函数"，写法是 `lambda 输入: 输出`。这一行的意思是：给它一个 `pair`（每一对 `(键, 值)`，也就是 `(单词, 次数)`），它就交出 `pair[1]`——也就是这对里的第二个元素，次数。合起来就是告诉 `sorted` "拿每对里的次数来比大小"。其中 `pair` 这个名字是我随便起的，你改成 `p`、`x` 都行，只要前后一致。`reverse=True` 是从大到小。
- `print(f"{word}: {n}")`：开头带字母 `f` 的字符串 `f"..."` 叫**格式化字符串**。在大括号 `{}` 里写变量名，运行时就会把变量当时的值填进去——比如 `{word}` 会被换成真正的单词、`{n}` 换成真正的次数，于是打印出 `the: 4` 这样的结果。

<div class="csf-note">这个 <code>counts[w] = counts.get(w, 0) + 1</code> 的写法，是 Python 里数数的"标准动作"，值得你背下来并理解透。请合上这篇文章，自己换一段文字、从空字典开始，把这段重写一遍。卡住了先别问 AI 要完整代码，先问自己："字典里现在有什么？这一步在改哪个键？"</div>

### 动手练二：用 set 把"两数之和"从 O(n²) 砍到 O(n) <span class="csf-b csf-key">重点</span>

`set`（集合）是哈希表的另一个面孔：它只存"键"、不存"值"，而且**自动去重**。它最擅长回答一个问题："这个东西在不在里面？"——同样近似 O(1)。

经典题"两数之和"：给一个数字列表和一个目标值 `target`，问里面有没有**两个数加起来等于 target**。

先看朴素写法——**双重循环**，每个数都去和后面所有数配对：

```python
nums = [2, 7, 11, 15, 3]
target = 9

# 朴素：两层循环，O(n²)
found = False
for i in range(len(nums)):
    for j in range(i + 1, len(nums)):
        if nums[i] + nums[j] == target:
            found = True
print(found)  # 2 + 7 == 9 → True
```

这段循环和前面 `for n in names` 那种"直接拿出每个东西"的写法不太一样，第一次见会有点懵，挨句拆开说：

- `len(nums)`：列表里有几个数。这里 `nums` 有 5 个，所以 `len(nums)` 就是 `5`。
- `range(len(nums))`：生成一串编号 `0, 1, 2, 3, 4`（注意从 0 开始数，到 4 为止，正好 5 个）。
- `i`、`j`：都是"第几个数"的编号，`nums[i]` 就是"第 `i` 个数"。我们这次不直接拿数本身，而是拿编号，是因为下面要让两个数互相配对，用编号更好控制。
- `range(i + 1, len(nums))`：让 `j` 从 `i + 1` 开始。这样每个数只和**排在它后面**的数配对——既不重复算一对，也不会让一个数和自己配。

两层循环套在一起，长度翻倍工作量翻四倍，这是 **O(n²)**——数据一大就很慢。

<div class="csf-why">先猜：换成哈希表，我们能不能<strong>只扫一遍</strong>列表就答出来？关键的转念是——遍历到数字 <code>x</code> 时，我真正想知道的是"我前面有没有出现过 <code>target - x</code>"。而"在不在前面出现过"正是 set 最快的活儿。</div>

下面是 set 优化版，**只扫一遍**：

```python
nums = [2, 7, 11, 15, 3]
target = 9

seen = set()          # 记录"我已经走过的数字"
found = False
for x in nums:
    need = target - x     # 我还差这个数，就能凑成 target
    if need in seen:      # 前面出现过吗？近似 O(1) 的查询
        found = True
        break
    seen.add(x)           # 没凑成，就把当前数记下来，留给后面的数配对

print(found)  # True
```

这一版只有一层循环，循环里那句 `need in seen` 是近似 O(1) 的，所以整体是 **O(n)**。我们用一个 `set`（多花了点内存）换来了快得多的速度——这就是这一讲标题里说的**空间换时间**。

<div class="csf-note">这道题是哈希表"换思路"的代表作。请你<strong>不看上面的答案</strong>，自己从 <code>seen = set()</code> 开始把 O(n) 版重写一遍，并改几组 <code>nums</code> 和 <code>target</code> 验证（包括"凑不出"的情况，确认它打印 False）。先猜每组结果，再跑。把"是 True 还是 False"在心里答对，比代码跑通更重要。</div>

## 💡 自己复述一遍

合上屏幕，用一句话说说看：

> 哈希表为什么能做到近似 O(1) 的查找？

如果你能说出类似"**它用一个哈希函数把要找的东西直接算成一个位置，所以不用一个个翻，跳过去看一眼就行**"——那你抓住了这一讲的命根子。说不顺也没关系，回头再看一眼"魔法公式"那节，然后再合上试一次。

## 🔧 翻车现场

### 翻车一：拿 list 当 key，直接报错 <span class="csf-b csf-core">必读</span>

```python
d = {}
d[[1, 2]] = "x"   # TypeError: unhashable type: 'list'
```

**原因**：能当 key 的东西必须是"**可哈希的**"——简单说就是它得**不可变**，这样哈希函数每次算出来的编号才稳定。`list` 是可变的（你随时能往里加东西），它一变、编号就该变了，哈希表就找不着北了，所以 Python 直接禁止。

**解法**：把 list 换成**元组 `tuple`**（用小括号，不可变），就能当 key 了：

```python
d = {}
d[(1, 2)] = "x"   # 没问题
print(d[(1, 2)])  # x
```

字符串、数字、元组都可哈希，可以当 key；list、dict、set 不可哈希，不能当 key。

### 翻车二：以为 dict 能像数组那样按下标取 <span class="csf-b csf-key">重点</span>

```python
counts = {"the": 5, "fox": 3}
print(counts[0])   # KeyError: 0
```

**原因**：`dict` 是**按键取值**，不是按位置取值。`counts[0]` 是去找"键为 `0`"的那项，而字典里根本没有 `0` 这个键，于是报 `KeyError`。它不像列表那样有"第 0 个、第 1 个"的概念。

**解法**：想看某个键在不在、安全地取值，用 `in` 或 `.get()`：

```python
print("the" in counts)        # True
print(counts.get("cat", 0))   # 0，键不存在时给默认值，不报错
print(counts["the"])          # 5，确定键存在时直接取
```

### 翻车三：忘了极端冲突会让它退化成 O(n) <span class="csf-b csf-skim">可跳读</span>

**冲突**是指：两个不同的数据，被哈希函数算出了**同一个格子编号**。这很正常，哈希表本来就有处理冲突的办法（比如在同一个格子里挂一串）。

但如果**几乎所有数据都挤到同一个格子**里，那查找又变回"在这一长串里一个个找"——**退化成 O(n)**。在你日常用 Python 的 `dict`/`set` 时，这种极端情况基本不会自己撞上（Python 的哈希做得很稳）。

**你需要记住的**：哈希表的 O(1) 是"**平均/近似**"，不是"铁定保证"。所以当有人（或 AI）拍胸脯说"用哈希表就一定是 O(1)、绝对最快"，你心里要有这根弦——通常对，但不是物理定律。记住 O(1) 是"平均/近似"而不是"铁定保证"，以后遇到"哈希一定 O(1)"的说法，心里就能多一份判断。

## ✅ 自检三问

1. 哈希表凭什么能近似 O(1)？请说出"哈希函数"在这里起了什么作用，而不是只说"它快"。
2. 为什么 `list` 不能当 dict 的 key，而 `tuple` 可以？关键词是哪两个字？（提示：可……）
3. "两数之和"用 set 优化后是 O(n)。循环里**哪一句**是近似 O(1) 的查询？换成朴素双重循环又是 O 几？

（答不上来不丢人，翻回对应小节再读一遍——能自己找回答案，就是真学会了。）

## 🚀 挑战

给你一个列表，找出里面**第一个重复出现**的元素。比如 `[3, 1, 4, 1, 5, 9, 4]`，第一个重复出现的是 `1`（因为第二个 `1` 比第二个 `4` 先出现）。

要求：

- **只扫一遍**列表（O(n)），用一个 `set` 记录"见过哪些"。
- 自己先**猜**几组输入的答案，再跑代码验证；特意造一组"没有任何重复"的输入，想清楚这时该返回什么（比如 `None`），并验证。
- 这段**务必自己写**，别让 AI 代笔。写不出来时，回头看"动手练二"的 `seen` 套路，它和这题是同一个心法。

写完且自己验证通过后，你可以让 AI 帮你 **review**："我这样写有没有更简洁的方式？时间复杂度是多少？"——让它当你的陪练，给你挑刺、解释，而不是给你答案。

## 📦 复制带走

<div class="csf-card"><strong>哈希表 · 带走这几条</strong><br><br>1. <strong>核心思想</strong>：哈希函数把数据直接算成"格子编号"，于是不用一个个翻、跳过去看一眼就行——这就是近似 O(1) 的来历，本质是<strong>空间换时间</strong>。<br><br>2. <strong>两个工具</strong>：<code>dict</code> 存键值对（查重、计数、键→值映射），<code>set</code> 只存键且自动去重（最擅长回答"在不在"）。<br><br>3. <strong>三个坑</strong>：可变对象（list）不能当 key，要用 tuple；dict 按键取值、不是按下标；O(1) 是平均值，极端冲突会退化成 O(n)。<br><br>4. <strong>判断力</strong>：看到"查重 / 计数 / 快速查找"，先想哈希表；别人说"哈希一定 O(1)"时，记得它是"近似"。</div>

下一讲（第05讲）我们换一种思维方式：**递归——自己调用自己**。它会让你重新认识"重复"这件事，也是后面学树和图绕不开的基本功。到时见。
