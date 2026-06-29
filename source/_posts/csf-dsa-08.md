---
title: "《计算机基本功路线图 · 数据结构与算法》第08讲 · 二分查找：有序里的折半思维"
date: 2026-07-04 17:00:00
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

<div class="csf-key-note">猜数字游戏里，我说"我心里有个 1 到 100 的数，你猜"，你绝不会从 1 一个一个往上数——你会先猜 50。大了就往下、小了就往上，每猜一次范围砍一半。这个"砍一半"的本能，就是<strong>二分查找</strong>。这一讲我们把这份本能写成一段一个字符都不能错的代码，并搞懂它最爱坑人的地方：边界。</div>

## 🎯 这一讲你会学到什么

- 为什么二分查找快得离谱：100 万个数，最多猜 20 次就到底。
- 二分查找的三个主角：`left`、`right`、`mid`，以及它们怎么一步步逼近答案。
- 边界到底怎么定：用 `<=` 还是 `<`？`mid` 要不要 `+1` / `-1`？为什么一错就死循环或漏查。
- 一个最致命的前提：<strong>数据必须有序</strong>。没排序就用二分，等于闭着眼找东西。
- 进阶一小步：把"找到没有"改造成"找第一个 ≥ target 的位置"——这是二分真正值钱的用法。

<div class="csf-note">上一讲我们用分治把排序做快了。这一讲是分治思想的另一个亲戚：每一步都把问题规模砍成一半。如果你上一讲对"砍一半"还没什么手感，这一讲会帮你补上。</div>

## 🛠 跟我做 <span class="csf-b csf-core">必读</span>

### 先用纸笔人肉走一遍

别急着写代码。我们先当一回 CPU（CPU 就是电脑里负责一步一步执行计算的那个核心部件），拿脑子按规则一步步走一遍。准备一个<strong>已经从小到大排好</strong>的数组：

```
下标:   0   1   2   3   4   5   6
值:     2   5   8   12  16  23  38
```

我们要找的目标是 `target = 23`，看它在哪个下标。

规则就三条，记住它：

1. 在当前范围的<strong>正中间</strong>取一个位置 `mid`，看它的值。
2. 如果中间值正好等于 target，找到了，收工。
3. 如果中间值<strong>太小</strong>，说明 target 在右半边，把左边界往右挪；如果中间值<strong>太大</strong>，target 在左半边，把右边界往左挪。

<strong>先猜一下</strong>：从 0 到 6 这 7 个数里找 23，你觉得需要看几次中间值？把你猜的数字记在心里，我们走一遍验证。

第一步：范围是下标 `0 ~ 6`。中间 `mid = (0 + 6) / 2 = 3`，值是 `12`。12 比 23 小，太小了，说明 23 在右边。把左边界挪到 `mid + 1 = 4`。

第二步：范围是 `4 ~ 6`。中间 `mid = (4 + 6) / 2 = 5`，值是 `23`。正好等于 target，找到了！返回下标 `5`。

只看了两次。如果你猜的是 2 或者 3，恭喜，你已经有感觉了；如果你猜的是 5、6 这种"挨个找"的数，没关系，正是这一讲要帮你扭过来的直觉。

<div class="csf-why">注意第一步里左边界挪的是 <code>mid + 1</code>，不是 <code>mid</code>。因为下标 3 的值我们已经看过了、确定不是答案，没必要再把它留在范围里。这个 <strong>+1 / -1</strong> 是二分不死循环的关键，后面"翻车现场"会专门说。</div>

### 把它写成代码

打开你的 Python 环境（前几讲装好的那个），新建一个文件 `binary_search.py`，把下面这段<strong>自己一个字一个字敲进去</strong>——别复制，更别让 AI 代写。二分查找全世界就十来行，但能不能写对，全在你手指头记没记住边界。

先说一个待会儿会在注释里反复出现的词：<strong>闭区间</strong>。它说的就是 `left` 和 `right` 这两个端点本身都算在搜索范围里、都还要被检查——下标从 `left` 到 `right`、连头带尾一个都不漏。记住这一句，下面的代码就好读了。

```python
def binary_search(nums, target):
    left = 0
    right = len(nums) - 1   # right 指向最后一个有效下标

    while left <= right:    # 注意是 <=，范围里还有数就继续
        mid = (left + right) // 2   # // 是整除，向下取整
        if nums[mid] == target:
            return mid              # 找到了，返回下标
        elif nums[mid] < target:
            left = mid + 1          # 中间值太小，去右半边
        else:
            right = mid - 1         # 中间值太大，去左半边

    return -1   # 范围空了还没找到，说明不存在


nums = [2, 5, 8, 12, 16, 23, 38]
print(binary_search(nums, 23))   # 先猜：会打印几？
print(binary_search(nums, 7))    # 这个数组里没有 7，先猜会打印几？
```

<strong>先猜后跑</strong>：第一行你应该已经能猜到是 `5`（我们手算过）。第二行找的是 `7`，数组里根本没有，你觉得会打印什么？把你的猜测写下来，再运行。

跑出来应该是：

```
5
-1
```

`-1` 是我们约定的"没找到"信号。为什么找 `7` 会停下来而不是无限找？因为每次循环范围都在缩小，缩到 `left > right`（范围空了）时 `while` 条件不成立，循环自然结束，返回 `-1`。

<div class="csf-note">这里有三个名字你要彻底吃透：<code>left</code> 是当前还没排除的最左下标，<code>right</code> 是最右下标，<code>mid</code> 是它俩正中间。整个算法就是 <code>left</code> 和 <code>right</code> 像两堵墙一样不断往中间挤，直到夹住答案、或者挤到一起还没找到。</div>

### 给二分装上"探照灯"

光看结果不够，我们要亲眼看见 `left`、`right`、`mid` 怎么变化——这比任何讲解都管用。给函数加几行打印：

下面会用到一个前面没出现过的写法，叫 Python 的 <strong>f-字符串</strong>。它和普通字符串只差一个字母：在引号前面加一个 `f`，引号里就能用 `{}` 把变量的当前值直接填进文字里。比如 `f"第{step}次"`，运行时 `{step}` 会被换成 `step` 此刻的数字，假如 `step` 是 3，打印出来就是「第3次」。一行字里想插几个变量都行，比一段段拼接方便得多。

```python
def binary_search_verbose(nums, target):
    left = 0
    right = len(nums) - 1
    step = 0
    while left <= right:
        step += 1
        mid = (left + right) // 2
        print(f"第{step}次  范围[{left},{right}]  mid={mid}  nums[mid]={nums[mid]}")
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1


nums = [2, 5, 8, 12, 16, 23, 38]
binary_search_verbose(nums, 23)
```

运行后你会看到每一步的范围怎么收缩，和你纸笔走的那一遍一模一样。把它和上面手算的过程对照着看，"折半"这件事就从抽象变成了你眼睛能跟住的东西。

<div class="csf-why"><strong>为什么这么快？</strong>每看一次中间值，范围就少一半。100 万个数：100 万 → 50 万 → 25 万……一路砍下去，大约 20 次就只剩 1 个。这就是 <code>O(log n)</code>。对比从头挨个找的 <code>O(n)</code>（最坏要看 100 万次），差距是天和地。第04、05讲讲的大 O，在这里第一次让你看到这种省法有多夸张：数据翻一万倍，要看的次数才多十几下。</div>

### 进阶：找"第一个 ≥ target 的位置" <span class="csf-b csf-key">重点</span>

上面那个二分只能回答"在不在"。但真实工作里，更常见的问题是：<strong>"第一个大于等于某个值的位置在哪？"</strong> 比如"成绩排好序了，第一个及格（≥60）的人排第几"。这才是二分真正的主场。

思路变一点点：我们不再要求"正好相等"，而是要找<strong>满足条件（≥ target）的最左边那个位置</strong>。

```python
def lower_bound(nums, target):
    left = 0
    right = len(nums)       # 注意！这次 right 取 len(nums)，是开区间
    while left < right:     # 注意！这次是 <，不是 <=
        mid = (left + right) // 2
        if nums[mid] < target:
            left = mid + 1      # mid 太小，第一个达标的在更右
        else:
            right = mid         # mid 已达标，但它可能就是答案，不能 -1
    return left   # left 最终停在第一个 >= target 的位置


nums = [2, 5, 8, 12, 16, 23, 38]
print(lower_bound(nums, 16))   # 先猜：16 在下标几？
print(lower_bound(nums, 17))   # 17 不存在，先猜会返回几？
print(lower_bound(nums, 100))  # 比所有数都大，先猜返回几？
```

<strong>先猜后跑</strong>：三行分别会输出什么？想清楚再运行。

答案是 `4`、`5`、`7`。第一行 16 就在下标 4；第二行 17 虽然不在数组里，但"第一个 ≥17 的"是 23（下标 5）；第三行 100 比谁都大，没有任何数 ≥100，于是返回 `7`，也就是数组长度——表示"得排到末尾之后"。

<div class="csf-note">看出区别了吗？这一版有三处和上一版不同：<code>right = len(nums)</code>（不是 <code>len-1</code>）、循环是 <code>left &lt; right</code>（不是 <code>&lt;=</code>）、达标时 <code>right = mid</code>（不是 <code>mid - 1</code>）。这三处是配套的，它们共同定义了一种叫"左闭右开"的区间写法。<strong>别死记，要理解：到底哪些下标还可能是答案，区间和判断就照着这个来。</strong></div>

<details class="csf-fold"><summary>为什么两种写法的边界不一样？<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
关键在于"区间里的数<strong>是否都还可能是答案</strong>"。<br><br>
第一版 <code>binary_search</code> 用的是<strong>闭区间</strong> <code>[left, right]</code>：left 和 right 指向的下标都还没被检查、都可能是答案。所以循环条件是 <code>left &lt;= right</code>（当 left==right 时区间里还剩一个数，得检查），排除一个数时要 <code>mid+1</code> 或 <code>mid-1</code>（因为 mid 这个位置已经亲眼看过、确定排除）。<br><br>
第二版 <code>lower_bound</code> 用的是<strong>左闭右开</strong> <code>[left, right)</code>：right 指向的位置是"哨兵"，永远不被检查，代表"答案可能在末尾之后"。所以循环是 <code>left &lt; right</code>（相等时区间为空，停），而且当 mid 达标时写 <code>right = mid</code>（mid 自己可能就是答案，不能丢，只是把它右边的全排除）。<br><br>
两种写法都对，但<strong>不能混用</strong>：闭区间配 <code>&lt;=</code> 和 <code>±1</code>，开区间配 <code>&lt;</code> 和 <code>right=mid</code>。混着写就是死循环或漏查的来源。新手建议<strong>先把一种练到不假思索</strong>，再学另一种。</details>

## 💡 自己复述一遍

合上屏幕，用一句话告诉自己：二分查找就是 ___（提示：在有序数据里，每次看正中间，根据大小把搜索范围砍掉一半，直到找到或范围为空）。

如果你能顺带说出"它快是因为每次范围减半，所以是 O(log n)"，那这一讲的内核你已经拿到了。

## 🔧 翻车现场 <span class="csf-b csf-core">必读</span>

<strong>翻车一：在没排序的数据上用二分。</strong> 这是最致命、也最隐蔽的错。二分的全部魔法都建立在"中间值小 → 目标一定在右边"这个推理上，而这个推理<strong>只有在有序时才成立</strong>。数据是乱的，中间值小并不代表右边一定有更大的，二分会自信地走错方向、给你一个错误答案，而且<strong>不报错</strong>。AI 生成的二分代码也常常默认"输入已排序"——用之前你必须自己确认这个前提。解法：用二分前，先确认数据真的有序（或者先排序，但排序本身是 O(n log n)，只查一次的话还不如直接遍历）。

<strong>翻车二：循环条件 `<=` 和 `<` 搞混。</strong> 闭区间 `[left, right]` 必须用 `while left <= right`；如果写成 `<`，当范围缩到只剩一个数（`left == right`）时循环就提前退出，<strong>漏查最后一个数</strong>。反过来，开区间写法配错条件，又可能死循环。解法：记住"区间写法和循环条件、边界更新是一整套"，别东拼西凑。

<strong>翻车三：更新边界时忘了 `mid + 1` / `mid - 1`。</strong> 在闭区间写法里，如果中间值太小你写成 `left = mid`（而不是 `mid + 1`），当范围只剩两个数时 `mid` 永远算出同一个值，`left` 和 `right` 再也不动——<strong>死循环</strong>，程序卡死。解法：闭区间里，凡是"这个 mid 已经检查过、确定排除"，就必须跨过它，用 `mid ± 1`。

<div class="csf-why">死循环为什么可怕？它不会报错、不会停，CPU 空转，程序像卡住一样。第一次遇到别慌：按 <code>Ctrl + C</code> 强制中断，然后回头检查边界更新那两行。八成是某个 <code>mid</code> 忘了加减一。</div>

## ✅ 自检三问

1. 二分查找能用的<strong>前提</strong>是什么？如果数据没排序会发生什么（会报错还是会悄悄给错答案）？
2. 在闭区间写法里，为什么排除某个 `mid` 后要写 `mid + 1` 而不是 `mid`？不写会怎样？
3. `lower_bound` 找"第一个 ≥ target"时，如果 target 比数组里所有数都大，它返回什么？这个返回值代表什么含义？

<div class="csf-note">三问都能不看代码答上来，再往下走。答不上来很正常——回到"跟我做"，把那个带探照灯的 <code>binary_search_verbose</code> 多跑几个不同的 target，看着 left/right 的变化重新理解一遍。</div>

## 🚀 挑战

给你一个排好序的数组 `nums = [1, 3, 3, 3, 7, 9]`，里面有<strong>重复的 3</strong>。请你<strong>自己动手</strong>完成两件事（不要让 AI 写，写完可以让它帮你挑错）：

1. 用本讲的 `lower_bound` 跑一下 `target = 3`，先猜返回几，再验证——你会发现它返回的是<strong>第一个</strong> 3 的下标。想清楚为什么。
2. 仿照 `lower_bound`，自己写一个 `upper_bound`，返回<strong>第一个 > target 的位置</strong>（注意是严格大于）。提示：只需要把判断条件里的一个符号改一改。写完用 `nums` 和 `target = 3` 验证：`upper_bound - lower_bound` 应该正好等于 3 出现的次数。

<div class="csf-why">这个挑战不是为了刷题。它让你亲手体会：二分一旦理解透，稍微改一两个符号就能解决"有多少个""第一个/最后一个"一大类问题。这种"举一反三"的判断力，正是 AI 替不了你的地方。</div>

## 📦 复制带走

<div class="csf-card">
1. <strong>二分查找 = 有序里折半</strong>：每次看正中间，按大小把范围砍一半，O(log n)，100 万个数 20 次到底。<br>
2. <strong>三件套要配套</strong>：闭区间 <code>[left,right]</code> 配 <code>while left&lt;=right</code> 和 <code>mid±1</code>；左闭右开 <code>[left,right)</code> 配 <code>while left&lt;right</code> 和 <code>right=mid</code>。先练熟一种。<br>
3. <strong>最致命的坑是前提</strong>：数据没排序就用二分，不会报错，但会悄悄给错答案。用前必须确认有序。<br>
4. <strong>二分的真正价值在变体</strong>：不止"在不在"，更是"第一个 ≥ / 第一个 > 的位置"。改一个符号，解一整类问题。
</div>

下一讲我们离开"一条线"的数组，走进会分叉的世界——第09讲《树与二叉树：会分叉的数据结构》。你会发现，这一讲的"折半"思维，到了"二叉搜索树"上会以另一种形态重新出现。
