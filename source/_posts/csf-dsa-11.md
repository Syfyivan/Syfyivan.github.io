---
title: "《计算机基本功路线图 · 数据结构与算法》第11讲 · 双指针与滑动窗口：数组上的常用套路"
date: 2026-07-04 20:00:00
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

<div class="csf-key-note">很多数组和字符串的题，最朴素的写法是"两层循环挨个试"，时间是 O(n²)。这一讲要换一种眼光：<b>不要每次都从头重来，而是让一两个指针在数组上聪明地往前走，走过的信息不浪费。</b>掌握"对撞指针"和"滑动窗口"这两个套路，你能把一大批 O(n²) 的暴力解压到 O(n)。它们不是高深算法，而是你以后看一眼题目就该条件反射想到的"手感"。</div>

## 🎯 这一讲你会学到什么

- 什么是"双指针"，为什么它能省掉一层循环。
- 两种最常用的双指针：**对撞指针**（一头一尾往中间夹）和**快慢指针**（一前一后同向走）。
- **滑动窗口**：用左右两个指针圈住一段连续区间，靠"扩张"和"收缩"在数组上滑过去。
- 亲手把两道经典题从暴力解优化到 O(n)：有序数组的"两数之和"、字符串里"最长不含重复字符的子串"。
- 看清最容易翻车的地方：窗口收缩条件写错、忘了"有序"前提、指针该谁动判断错。

<div class="csf-note">这一讲不要求你背任何模板。我希望你跟着把每一行代码<b>自己敲出来、自己跑一遍</b>，看到指针怎么动。这种"手感"是 AI 给不了你的——它能秒写出答案，但能判断答案对不对、快不快的人，是你。</div>

## 🛠 跟我做

### 先从最笨的办法说起 <span class="csf-b csf-core">必读</span>

假设有一个**已经从小到大排好序**的数组，比如 `[2, 7, 11, 15]`，我想找出两个数，让它们加起来等于某个目标值 `target`（比如 9）。

最直接的想法：第一个数从头挑，第二个数也挨个试，两层循环：

```python
def two_sum_brute(nums, target):
    n = len(nums)
    for i in range(n):
        for j in range(i + 1, n):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []

print(two_sum_brute([2, 7, 11, 15], 9))
```

<div class="csf-why">先猜一下：这段代码会输出什么？数组长度变成 1 万、10 万时，它大概要做多少次加法？</div>

输出是 `[0, 1]`（因为 2 + 7 = 9）。但问题在于：这是两层循环——你可能觉得是 n×n 次，但因为内层 `j` 是从 `i + 1` 开始的（每一对数只配一次，不重复配对），所以大约是 n×n 的一半，也就是 n×n/2 次。不管是 n×n 还是 n×n/2，去掉常数后都记作 **O(n²)**。数组一大就慢得吓人。

关键观察来了：**这个数组是有序的，而我们却完全没用上"有序"这个信息。** 这就是优化的突破口。

### 套路一：对撞指针 <span class="csf-b csf-key">重点</span>

想象数组排好队，我在**最左**放一个指针 `left`，在**最右**放一个指针 `right`，看它俩指的两个数之和：

- 如果和**正好等于** target —— 找到了，返回。
- 如果和**太小了** —— 说明左边这个数偏小，那就把 `left` 往右挪一格（换个更大的左数）。
- 如果和**太大了** —— 说明右边这个数偏大，那就把 `right` 往左挪一格（换个更小的右数）。

因为数组有序，每次比较都能**确定地排除掉一批不可能的组合**，所以 `left` 和 `right` 一路相向而行，最多走 n 步就收工。

```python
def two_sum_sorted(nums, target):
    left, right = 0, len(nums) - 1
    while left < right:
        s = nums[left] + nums[right]
        if s == target:
            return [left, right]
        elif s < target:
            left += 1      # 和太小，左指针右移换大数
        else:
            right -= 1     # 和太大，右指针左移换小数
    return []

print(two_sum_sorted([2, 7, 11, 15], 9))    # 先猜：输出什么？
print(two_sum_sorted([1, 3, 4, 5, 7], 12))  # 先猜：输出什么？
```

<div class="csf-why">运行前先猜两行的结果。第二行 [1,3,4,5,7] 里哪两个数加起来等于 12？它们的下标是多少？</div>

答案：第一行 `[0, 1]`，第二行 `[2, 4]`（4 + 7 = 12，下标 2 和 4）。两个指针总共只走了 n 步，时间从 O(n²) 降到了 **O(n)**。

<div class="csf-note"><b>一头一尾、相向而行</b>，这就是"对撞指针"。它生效的前提是：数组<b>有序</b>，且"和变大/变小"的方向能指导指针往哪挪。判断回文串、反转数组，也都是对撞指针的活儿。</div>

<details class="csf-fold"><summary>另一种快慢指针，长什么样<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
对撞指针是"一头一尾对着走"，还有一类叫<b>快慢指针</b>，是"两个指针同方向、一快一慢"。最常见的用途是<b>原地去重</b>或<b>原地移除元素</b>。这里的"原地"是指：不另外开一个新数组，而是直接在原来的数组上修改。具体做法是：慢指针 slow 标记"已经整理好的位置"，快指针 fast 一路向前扫，遇到该保留的元素就拷到 slow 的位置再让 slow 前进。<br><br>
```python
def remove_zeros(nums):
    slow = 0
    for fast in range(len(nums)):
        if nums[fast] != 0:
            nums[slow] = nums[fast]
            slow += 1
    # slow 之后的位置补 0
    for k in range(slow, len(nums)):
        nums[k] = 0
    return nums

print(remove_zeros([0, 1, 0, 3, 12]))  # [1, 3, 12, 0, 0]
```
<br>快慢指针在链表里也很常用（比如找中点、判断有没有环），那是后面的内容，这里先有个印象：<b>同向双指针，一个负责读、一个负责写</b>。
</details>

### 套路二：滑动窗口 <span class="csf-b csf-core">必读</span>

对撞指针处理的是"两个孤立的点"。但很多题问的是**一段连续的区间**：最长的、最短的、和为某值的连续子数组/子串。这时候用**滑动窗口**。

什么是窗口？就是用 `left` 和 `right` 两个指针，圈住数组里 `[left, right]` 这一段连续区间。窗口像一条毛毛虫：

- **扩张**：`right` 往右伸一格，把新元素吃进窗口。
- **收缩**：`left` 往右缩一格，把最左的元素吐出窗口。

核心节奏是：**right 不停往右扩张；一旦窗口"不合法"了，就让 left 往右收缩，直到窗口重新合法。** 整个过程 left 和 right 都只朝一个方向走，各走最多 n 步，所以是 O(n)。

我们用它解经典题：**给一个字符串，求"不含重复字符的最长子串"的长度。** 比如 `"abcabcbb"`，最长的是 `"abc"`，长度 3。

先想笨办法：枚举所有起点和终点，逐个检查有没有重复——那是 O(n²) 甚至更差。用滑动窗口怎么做？

- 窗口里始终维持"**没有重复字符**"这个条件（这就是"合法"）。
- `right` 每次吃进一个新字符。如果这个字符**之前已经在窗口里了**，说明窗口不合法了，就一直让 `left` 往右收缩、把字符吐出去，直到那个重复的字符被吐掉。
- 每一步都记录当前窗口长度，取最大值。

代码里我们用一个叫"集合"（set）的东西来装窗口里有哪些字符。它和你之前见过的列表（数组）有点不一样：列表是按顺序排好的一串元素，而集合不讲顺序、也不会装重复的元素，它最大的好处是能**很快判断"某个字符在不在里面"**——这正是这道题反复要做的事。用法也简单：`window.add(x)` 是把 x 放进去，`window.remove(x)` 是把 x 拿出来，`x in window` 是判断 x 在不在里面。

```python
def longest_unique(s):
    window = set()       # 当前窗口里有哪些字符（用集合装，能快速判断在不在）
    left = 0
    best = 0
    for right in range(len(s)):
        # 新字符要进来，但它已经在窗口里 —— 先收缩到不冲突
        while s[right] in window:
            window.remove(s[left])
            left += 1
        window.add(s[right])
        best = max(best, right - left + 1)
    return best

print(longest_unique("abcabcbb"))  # 先猜：?
print(longest_unique("bbbbb"))     # 先猜：?
print(longest_unique("pwwkew"))    # 先猜：?
```

<div class="csf-why">三行都先猜再运行。"pwwkew" 里不含重复字符的最长连续子串是哪一段？注意是连续的、且不能有重复字符。</div>

答案：`3`、`1`、`3`。最后一个 `"pwwkew"` 的答案是 `"wke"`（长度 3），不是 `"pwke"`（那段有两个 w，不合法）。

<div class="csf-note">注意 <code>right - left + 1</code> 就是当前窗口长度——闭区间 [left, right] 里元素的个数。这个小公式以后会反复用到，记牢它：<b>右下标减左下标再加一</b>。</div>

<details class="csf-fold"><summary>窗口的两种风格：每步都收缩 vs 不合法才收缩<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
滑动窗口大致有两种写法手感，别混淆：<br><br>
<b>风格 A（本讲用的）</b>：right 主动扩张，只有当窗口<b>不满足条件</b>时才用 while 收缩 left，期间随时记录答案。常见于"求最长合法区间"。<br><br>
<b>风格 B</b>：right 每扩张一步，left 就尽量往右收缩到"刚好还满足条件"的边界，常见于"求最短合法区间"（比如"和 ≥ target 的最短连续子数组"）。<br><br>
两者的骨架都是"right 向右扩，left 视情况向右缩，两指针各走一遍"。<b>到底用 if 收缩一格还是 while 收缩到底、什么时候记录答案，取决于题目问的是最长还是最短。</b>这点没有一招通吃的万能口诀，只能靠多写几道题练出判断——这正是 AI 替不了你的地方：它能写出某一种，但选错风格、边界错一格时，得你看出来。
</details>

<div class="csf-note">强烈建议：上面这两段代码（two_sum_sorted 和 longest_unique）<b>自己从空白文件敲一遍</b>，不要复制，更不要让 AI 代写。敲的时候在纸上画指针怎么动。卡住了再回来对照——这才是把套路装进脑子的唯一办法。</div>

## 💡 自己复述一遍

合上屏幕，用一句话说说看：

> 双指针的本质，是**让指针只朝一个方向走、不走回头路**，把每一步走过的信息利用起来，从而省掉一层循环；对撞指针靠"有序"决定谁动，滑动窗口靠"是否合法"决定扩张还是收缩。

说不顺也没关系，回头再看一眼代码里指针的移动条件，再复述一遍。

## 🔧 翻车现场

<div class="csf-note"><b>翻车一：忘了对撞指针要求数组有序。</b><br>把 two_sum_sorted 喂给一个<b>没排序</b>的数组（比如 [3, 2, 4]），它会漏解或给错。原因：对撞指针靠"和偏大就缩右、偏小就进左"来排除分支，这套逻辑只有在有序时才成立。<br><b>解法：</b>用之前先确认（或先排序）。如果题目本身无序又要求返回原下标，那对撞指针就不适用，得换成另一种叫"哈希表"的结构（一种能瞬间查到"某个数在不在、在哪"的工具，这是后面课程的内容，这里知道有这条出路即可）。</div>

<div class="csf-note"><b>翻车二：滑动窗口收缩条件写错，要么漏解要么死循环。</b><br>最常见的是把 longest_unique 里的 <code>while s[right] in window</code> 写成 <code>if</code>。当重复字符前面堆了好几个时，一次只缩一格收不干净，窗口里还残留重复，答案就偏大。<br>另一类是收缩时<b>忘了让 left 前进</b>（只 remove 不 <code>left += 1</code>），那 while 条件永远成立，<b>死循环</b>。<br><b>解法：</b>收缩动作必须成对——"吐出 nums[left]"和"left += 1"一起出现，缺一不可；想清楚到底是"收缩一格"还是"收缩到合法为止"。</div>

<div class="csf-note"><b>翻车三：左右指针该谁动、什么时候记录答案，判断错。</b><br>对撞指针里把 <code>s &lt; target</code> 写成 <code>left -= 1</code>（指针往回走），直接出界或死循环。滑动窗口里在"还没收缩干净"时就记录答案，会把不合法的窗口算进去。<br><b>解法：</b>动笔在数组上画一遍指针轨迹，确认每个分支里指针都是<b>朝着收敛的方向</b>走、答案是在<b>窗口合法的时刻</b>记录的。</div>

## ✅ 自检三问

1. 对撞指针为什么必须要求数组**有序**？如果无序，"和偏大就缩右指针"这个判断还成立吗？
2. 滑动窗口里 `right - left + 1` 算的是什么？为什么是"加一"而不是"减一"？
3. 把 `longest_unique` 里收缩用的 `while` 改成 `if`，对 `"abba"` 这种输入会算出什么？为什么会错？（提示：手动走一遍指针。）

<div class="csf-why">第 3 问别直接跑代码，先在纸上把 "abba" 的指针轨迹一步步画出来，预测错误结果，再改成 if 跑一遍验证你的预测。这种"先猜后验"比直接看答案学到的多得多。</div>

## 🚀 挑战

挑一两个自己动手，**不要让 AI 代写，写完自己造几组数据验证**：

1. **三数之和的简化版**：给一个有序数组和 target，判断是否存在三个数加起来等于 target。提示：先固定第一个数，剩下两个数在它右边用**对撞指针**找——这就是"外层一个循环 + 内层双指针"，整体 O(n²)，比纯暴力的 O(n³) 快一档。
2. **和 ≥ target 的最短连续子数组**：给一个全是正数的数组和 target，求最短的连续子数组使其和 ≥ target，返回长度（没有则返回 0）。这是滑动窗口"风格 B"（求最短）的练手题，体会一下"每步都尽量收缩 left"的手感。
3. 给挑战 1 你自己写的代码，**故意造一个会触发翻车的输入**（比如没排序的数组），看它怎么错的——理解错误，比写对一次更值钱。

## 📦 复制带走

<div class="csf-card"><b>这一讲记住这几条：</b><br>① <b>双指针的内核</b>：指针只朝一个方向走、不走回头路，把走过的信息利用起来，省掉一层循环，常把 O(n²) 压到 O(n)。<br>② <b>对撞指针</b>：一头一尾相向而行，靠"和偏大/偏小"决定缩哪边——前提是数组<b>有序</b>。<br>③ <b>滑动窗口</b>：左右指针圈住连续区间，right 扩张、不合法就让 left 收缩；窗口长度 = <code>right - left + 1</code>。<br>④ <b>最爱翻车的三处</b>：忘了有序前提、收缩条件用错 if/while、指针方向或记录答案的时机判断错——动笔画指针轨迹是最好的排错法。</div>

下一讲（第12讲）我们进入很多人觉得"玄"的**动态规划**——其实它和双指针一样，核心也是"别重复算、把算过的存下来"。这一讲练出的"先猜后验、动笔画过程"的习惯，到那边会继续帮你。我们下一讲见。
