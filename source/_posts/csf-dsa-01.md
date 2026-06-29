---
title: "《计算机基本功路线图 · 数据结构与算法》第01讲 · 复杂度直觉：大 O 是怎么估出来的"
date: 2026-07-04 10:00:00
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

<div class="csf-key-note">大 O 不是用来"精确算出一段代码跑几毫秒"的，它回答的是一个更聪明的问题：<b>当数据规模变大时，时间会怎么涨？</b>翻倍、平方、还是几乎不变？这一讲我们不背公式，就用一把尺子——"输入翻倍，时间怎么变"——把这件事看穿。</div>

上一讲（第00讲）我们说好了：这门课的内功，是**自己心里有数**。这一讲就是第一块内功——你要能瞄一眼一段代码，心里大概知道它是"快"还是"会越跑越慢"。

这事为什么 AI 替不了？因为 AI 能秒写出一段能跑的代码，但它写的到底是 O(n) 还是 O(n²)（O(n)、O(n²) 是后面要讲的一种记号，第一次见不用怕，先把它当成一个标签——"数据变大时这段代码会不会越跑越慢"的标签），跑到一百万条数据时会不会卡死，**得你看得出来**。看不出来，你就只能照单全收，等程序真正上线、给很多人用的时候卡死或崩掉了，才发现出了问题（"上线"指程序正式交付给用户使用的那个环境，区别于你自己电脑上的测试）。

## 🎯 这一讲你会学到什么

- 用一句大白话理解什么是**时间复杂度**、什么是**大 O 记号**；
- 学会用"**输入翻倍，时间怎么变**"这把尺子，对一段代码估出 O(1) / O(n) / O(n²)；
- 知道为什么我们**只看数量级、忽略常数项**，以及为什么默认看**最坏情况**；
- 顺带认识**空间复杂度**——内存也要算账；
- 亲手写两个函数、亲眼看到 O(n) 和 O(n²) 随数据翻倍的差距越拉越大。

<div class="csf-note">这一讲会让你动手写代码、跑计时。请<b>自己敲</b>，别让 AI 代写——尤其是动手练那两个函数。看懂和自己写出来，中间隔着一整门内功。</div>

## 🛠 跟我做

### 先建立一把尺子 <span class="csf-b csf-core">必读</span>

忘掉"几毫秒"这种说法。机器有快有慢，今天的电脑和十年前的不是一个速度，纠结毫秒没意义。我们换一个问法：

> **如果输入数据翻一倍，这段代码花的时间大概会怎么变？**

这把尺子能把代码分成几个最常见的档：

<div class="csf-legend"><b>O(1) 常数</b>：数据翻倍，时间几乎不变。<br><b>O(n) 线性</b>：数据翻倍，时间也翻倍。<br><b>O(n²) 平方</b>：数据翻倍，时间变成大约 <b>4 倍</b>。<br><b>O(log n) 对数</b>：数据翻倍，时间只多一点点（下一讲讲到二分时再细说）。</div>

大 O 记号（写作 O(n)、O(n²) 这种）就是这把尺子的标准写法。`n` 代表**输入的规模**——通常是列表里有多少个元素。O 里面装的，是"时间随 n 增长的趋势"。

<div class="csf-why">为什么是"趋势"而不是"具体数字"？因为我们关心的是<b>这段代码扛不扛得住数据变大</b>。一段 O(n) 的代码，数据从 1 万涨到 100 万，时间涨 100 倍，还能忍；一段 O(n²) 的代码，同样的数据变化，时间涨 1 万倍，那就从"等一下"变成"喝杯咖啡回来还没跑完"。趋势，决定生死。</div>

### 怎么"数"出大 O <span class="csf-b csf-key">重点</span>

估大 O 有个朴素办法：**看核心操作大概要执行多少次**，把次数写成关于 n 的式子，再只保留增长最快的那一项。

看几个例子，先别急着往下看答案——**先猜一猜**每段是哪个档。

```python
# 例 A：取列表第一个元素
def first(arr):
    return arr[0]
```

猜到了吗？不管列表有 10 个还是 1000 万个元素，`arr[0]` 都是一步到位。数据翻倍，时间不变 → **O(1)**。

```python
# 例 B：把列表里所有数加起来
def total(arr):
    s = 0
    for x in arr:       # 循环 n 次
        s += x
    return s
```

循环要走 n 遍，n 越大走得越多。数据翻倍，时间翻倍 → **O(n)**。

```python
# 例 C：打印列表里每一对元素
def all_pairs(arr):
    for x in arr:           # 外层 n 次
        for y in arr:       # 内层每次又 n 次
            print(x, y)
```

外层走 n 次，每次内层又走 n 次，总共大约 n × n = n² 次。数据翻倍，时间约变 4 倍 → **O(n²)**。

<div class="csf-note">抓住一个直觉：<b>循环套了几层，n 大概就是几次方。</b>一层循环是 O(n)，两层套在一起的循环是 O(n²)（也就是 n 的平方）。但要小心——是不是真的"套着"、内层走的次数是不是真的跟 n 一样多，得看清楚，别一看到两个 for 就喊 O(n²)。后面翻车现场会专门拆这个坑。</div>

### 动手练：两种"查重"，亲眼看差距 <span class="csf-b csf-core">必读</span>

这是这一讲的主菜。我们要写两个函数，都解决同一个问题——**判断一个列表里有没有重复的元素**——但用两种思路。然后用真实计时，看它们随数据翻倍的不同涨法。

**第一步：先猜。** 下面两个函数，你觉得哪个是 O(n²)、哪个是 O(n)？数据从 1 万涨到 4 万（4 倍）时，慢的那个时间大概会涨几倍？把你的猜测写在纸上，等会儿对答案。

新建一个文件 `bigo.py`，**自己一行一行敲进去**（别复制 AI 的，敲的过程就是在练手感）：

```python
import time
import random

# 方法一：双重循环，两两比较
def has_dup_loop(arr):
    n = len(arr)
    for i in range(n):
        for j in range(i + 1, n):   # 只比 i 后面的，避免重复比较
            if arr[i] == arr[j]:
                return True
    return False

# 方法二：用集合(set)，边走边记
def has_dup_set(arr):
    seen = set()
    for x in arr:
        if x in seen:               # 在集合里查找，平均一步到位
            return True
        seen.add(x)
    return False

def make_data(size):
    # 造一组"几乎没有重复"的数据，逼算法走到最坏情况附近。
    # range(size * 10) 表示 0 到 size*10 这么一大堆整数（一个从 0 开始数的范围）；
    # random.sample(范围, size) 表示从这堆数里随机抽出 size 个、而且互不相同的数。
    # 为什么范围要乘 10？因为"池子"越大，随机抽出来的数越不容易撞在一起，重复就越少。
    # 不乘 10（比如只用 range(size)）也能跑，只是抽到重复的概率会高一些，没那么"干净"。
    return random.sample(range(size * 10), size)

def timeit(func, data):
    # 给任意一个函数计时：跑之前读一次当前时间，跑完再读一次，两者相减就是耗时（秒）。
    # time.perf_counter() 读取一个高精度的"当前时刻"；func 是被传进来的那个函数。
    # 注意：函数在 Python 里也能当普通值传来传去，所以这里能把 has_dup_loop 整个塞进来调用。
    start = time.perf_counter()
    func(data)
    return time.perf_counter() - start

for size in [10000, 20000, 40000]:
    data = make_data(size)
    t_loop = timeit(has_dup_loop, data)
    t_set = timeit(has_dup_set, data)
    # 下面这行只是把结果排版成对齐的表格。f"..." 是 Python 的"格式化字符串"，
    # 大括号 {} 里写变量，会被替换成它的值；冒号后面是"怎么显示"的格式：
    # {size:>6} 表示把 size 右对齐、占 6 个字符宽；{t_loop:8.4f} 表示占 8 位宽、保留 4 位小数。
    # 这些只是为了让表格整齐好看，看不懂可以先一字不差地照抄。
    print(f"规模 {size:>6} | 双重循环 {t_loop:8.4f}s | 集合 {t_set:8.4f}s")
```

**第二步：跑。** 我们要打开"终端"来运行它。终端是一个让你**用打字的方式命令电脑**的小窗口（你平时是用鼠标点图标，它是用文字下命令）。怎么打开：Windows 在开始菜单里搜"PowerShell"或"命令提示符"，点开即可；Mac 在"启动台"或"应用程序 → 实用工具"里找到"终端（Terminal）"打开。（如果忘了这些，可以回看第00讲里讲环境准备的那一节。）

打开后还有关键一步：终端要先"走到" `bigo.py` 所在的文件夹，才能找到它。用 `cd` 命令切过去——比如你把文件存在了桌面，就先输入 `cd Desktop` 回车（`cd` 是 change directory，切换文件夹的意思）。到了正确的文件夹后，再执行：

```bash
python bigo.py
```

（如果提示找不到 `python`，可以试试把命令换成 `python3 bigo.py`；如果提示找不到文件，多半是还没 `cd` 到 `bigo.py` 所在的文件夹。）

你会看到类似这样的表格（**具体秒数因机器而异**，重点看"涨的倍数"，不是看绝对值）：

```
规模  10000 | 双重循环   1.8231s | 集合   0.0021s
规模  20000 | 双重循环   7.3104s | 集合   0.0043s
规模  40000 | 双重循环  29.5680s | 集合   0.0089s
```

**第三步：对答案，看趋势。** 把每一行和上一行比：

| 规模变化 | 双重循环 时间变化 | 集合 时间变化 |
| --- | --- | --- |
| 1万 → 2万（×2） | 约 ×4 | 约 ×2 |
| 2万 → 4万（×2） | 约 ×4 | 约 ×2 |

看见了吗？数据每翻一倍：**双重循环的时间翻约 4 倍**（这就是 O(n²) 的指纹——平方），**集合的时间只翻约 2 倍**（这就是 O(n) 的指纹——线性）。

这不是巧合。双重循环里两层 for 套着，最坏情况要比较约 n²/2 次；集合靠"查找几乎一步到位"的特性，只需要走一遍列表，约 n 次。一开始数据小的时候差距还不吓人，但因为**涨法不同**，数据越大差距越离谱。把规模再加到 16 万，双重循环可能要跑好几分钟，而集合还在零点几秒。

<div class="csf-why">为什么集合查找能"几乎一步到位"？这背后是<b>哈希</b>，本系列后面会有专门一讲拆开讲。现在你只需要记住结论：<code>x in 一个set</code> 平均是 O(1)，而 <code>x in 一个list</code> 是 O(n)（要从头找到尾）。选对了数据结构，复杂度就从 O(n²) 掉到了 O(n)——这就是"会选数据结构的人值钱"的最朴素例子。</div>

### 顺手认识空间复杂度 <span class="csf-b csf-skim">可跳读</span>

时间要算账，**内存也要算账**，这叫空间复杂度，写法一样用大 O。

回头看上面两个函数：`has_dup_loop` 没有额外开新的大容器，空间是 **O(1)**；`has_dup_set` 多了一个 `seen` 集合，最坏情况要装下几乎所有元素，空间是 **O(n)**。

这就是一个典型的**权衡**：集合方法用 O(n) 的额外内存，换来了时间从 O(n²) 降到 O(n)。很多时候"快"是拿"多占点内存"换的。能不能换、值不值得换，又是一个需要你自己判断的点。

<details class="csf-fold"><summary>为什么常数项和低次项可以扔掉<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
假设一段代码的精确次数是 <code>3n² + 100n + 50</code>。当 n 很大时（比如 n = 100 万），<code>3n²</code> 是 3 万亿量级，<code>100n</code> 才 1 亿量级，<code>50</code> 更是可以忽略不计。<br>也就是说，<b>n 一大，最高次项就彻底主导了一切</b>，前面的系数 3、后面的 100n 和 50 都不影响"它是平方级"这个本质。所以大 O 直接写成 O(n²)。<br>这正是大 O 聪明的地方：它故意"看不清"常数和细节，好让你一眼看清<b>最要命的那个趋势</b>。反过来说，如果你纠结"我这个是 2n 还是 3n"，那你其实是在用显微镜看地图——方向反而丢了。</details>

## 💡 自己复述一遍

合上屏幕，用一句话回答：**大 O 到底在描述什么？**

…想好了再往下看。

一个能让你睡得着觉的版本是：**大 O 描述的是"输入规模变大时，时间（或内存）的增长趋势"——O(1) 不随数据变，O(n) 跟着翻倍，O(n²) 翻倍后变约 4 倍。** 能用自己的话说出这句，这一讲的内功你就拿到一半了。

## 🔧 翻车现场

**翻车一：一看到两个循环就喊 O(n²)。**

```python
for i in range(n):
    print(i)
for j in range(n):
    print(j)
```

这两个循环是**并排**的，不是嵌套的。总次数是 n + n = 2n，扔掉常数，是 **O(n)**，不是 O(n²)。判断关键看循环是**套在一起**还是**前后排队**：套在一起才相乘，排队是相加。

**翻车二：被提前 return 骗了，误判最坏情况。**

```python
def has_dup_loop(arr):
    for i in range(len(arr)):
        for j in range(i + 1, len(arr)):
            if arr[i] == arr[j]:
                return True   # 一找到就跑路
    return False
```

有人会想："它找到重复就 return 了，那不就很快吗？"——对，但那是**走运的情况**。如果列表开头就有重复，确实一下就返回；可万一**没有重复**呢？那它必须把每一对都比完才能确定，这才是**最坏情况**，是 O(n²)。<br>**大 O 默认看最坏情况**，因为你不能赌运气——你得保证代码在最差的输入下也扛得住。这也是上面动手练里我们特意用"几乎没重复"的数据的原因：把它逼到最坏情况，指纹才看得清。

**翻车三：把内层循环的次数数错。** 上面 `has_dup_loop` 里内层是 `range(i + 1, n)`，比"每次都走满 n 次"少一半，总次数约 n²/2。但**扔掉常数 1/2 后，它还是 O(n²)**。这里的教训是：常数（这个 1/2）确实让它实际快一倍，但**改变不了数量级**。别为了这一半的常数沾沾自喜，也别因此就把它当成更低的档——数量级才是你真正要盯的东西。

## ✅ 自检三问

1. 一段代码里两层 for **嵌套**、内层走 n 次，它大概是哪个大 O？如果两层 for 是**并排**的呢？
2. "数据翻倍，时间约变 4 倍"对应哪个复杂度？"数据翻倍，时间几乎不变"又是哪个？
3. 为什么我们估大 O 时**默认看最坏情况**，而且**忽略常数项**？各用一句话说清。

（答不上来不丢人，回到对应小节再读一遍——这比往下赶进度有用得多。）

## 🚀 挑战

给你一段新代码，**先猜后验**：

```python
def count_smaller(arr):
    result = []
    for i in range(len(arr)):
        cnt = 0
        for j in range(len(arr)):
            if arr[j] < arr[i]:
                cnt += 1
        result.append(cnt)
    return result
```

1. **先猜**：它是 O(1) / O(n) / O(n²) 里的哪个？说出你的理由（数一数循环怎么套的）。
2. **再验**：把它接到你刚写的 `bigo.py` 计时框架里，跑 1 万 / 2 万 / 4 万三档，看时间是不是每翻倍就涨约 4 倍。
3. **进阶（选做）**：这段代码"对每个元素，数有多少个比它小"，能不能想办法让它更快？先**自己**琢磨十分钟——这种"我能不能换个思路降复杂度"的念头，正是这门课要练出来的判断力。想不出来也没关系，记下你的疑问，后面学到排序时会有答案。

<div class="csf-note">挑战里这段代码<b>务必自己分析、自己跑</b>。可以把你的结论讲给 AI 听、让它当陪练帮你挑错，但别让它直接给你答案——你要练的是"看一眼就有数"，不是"问一句就有答案"。</div>

## 📦 复制带走

<div class="csf-card">1. <b>大 O 量的是趋势，不是秒数</b>：核心尺子是"输入翻倍，时间怎么变"——不变是 O(1)，翻倍是 O(n)，变约 4 倍是 O(n²)。<br>2. <b>循环嵌套相乘，循环排队相加</b>：两层套着的循环常是 O(n²)，两个并排的循环是 O(n)；但要看清内层真正走多少次，别被提前 return 或并排循环骗了。<br>3. <b>只看数量级，扔掉常数和低次项</b>：n 一大，最高次项主导一切；纠结 2n 还是 3n 是捡了芝麻丢了西瓜。<br>4. <b>选对数据结构能直接降一个数量级</b>：查重用 set（O(n)）而不是双重循环（O(n²)），就是"会选结构的人值钱"的第一个实例——下一讲我们就从最基础的两种结构开始拆。</div>

下一讲（第02讲《数组与链表：数据在内存里怎么排队》），我们钻进内存里，看看数据到底是怎么排列的——这会解释为什么"查找""插入"在不同结构上快慢天差地别，也是你以后选结构的底层依据。我们下一讲见。
