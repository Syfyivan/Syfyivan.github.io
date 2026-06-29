---
title: "《计算机基本功路线图 · 数据结构与算法》第07讲 · 排序（二）：分治的力量"
date: 2026-07-04 16:00:00
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

<div class="csf-key-note">上一讲我们用冒泡和选择排序看清了"排序"这件事的笨办法——它们都是 O(n²)，数据一多就慢得肉眼可见。这一讲换个脑子：与其老老实实一个一个挪，不如把大问题<strong>劈成两半</strong>，各自解决，再拼回来。这套"分而治之"的思路，能把排序从 O(n²) 提速到 O(n log n)，而且它远不止用在排序上——它是后面很多算法的母版。</div>

<div class="csf-note">先回顾一个上一讲的记号，免得你看着发懵：<strong>O(...)</strong> 读作"大 O"，它是上一讲讲过的"时间复杂度"记号，括号里写的是"数据量变大时，耗时大概按什么速度增长"。<br>· <strong>O(n²)</strong>：数据翻一倍，耗时翻四倍（增长很快，数据一多就慢）。<br>· <strong>O(n log n)</strong>：数据翻一倍，耗时只多一点点（增长很慢，对大数据友好）。<br>本讲会反复出现这两个记号，记住"括号里是耗时随数据量增长的速度"就够了，log 是什么后面还会再解释。</div>

## 🎯 这一讲你会学到什么

- 什么是"分治"（divide and conquer）：把大问题拆成同类的小问题，分别解决，再合并。
- **归并排序**：先把数组一劈两半，各自排好，再把两个有序的半边"合并"成一个有序的整体。
- 怎么手写"合并两个有序列表"——这是归并排序的心脏。
- **快速排序**：选一个基准（pivot），把比它小的甩左边、比它大的甩右边，再对左右各自重复。
- 为什么这两种排序大约是 **O(n log n)**，以及快排在最坏情况下为什么会退化成 O(n²)。

<div class="csf-note">提前打个预防针：这一讲有递归。如果你看到"函数自己调用自己"会发懵，别慌，我们会一步步把它拆开。递归不是魔法，它只是"把同样的事在更小的输入上再做一遍"。</div>

## 🛠 跟我做

### 先建立直觉：分治是什么 <span class="csf-b csf-core">必读</span>

想象你要给一摞 100 张考卷按分数排序。一个人从头排到尾很累。换个办法：

1. 把这摞卷子**分成两半**，左手一摞 50 张，右手一摞 50 张。
2. 把左边那 50 张交给同桌排，右边那 50 张你自己排。（这就是"分"——同一件事，规模减半。）
3. 等两边各自排好了，你们俩把两摞**已经有序**的卷子合并成一摞有序的。（这就是"治"之后的"合"。）

而同桌排他那 50 张时，他也可以再劈成两个 25 张……一直劈到每摞只剩 1 张——**1 张卷子天然就是有序的**，不用排了。这就是分治：

<div class="csf-note"><strong>分</strong>（divide）：把问题切成更小的同类子问题。<br><strong>治</strong>（conquer）：子问题小到不能再小（比如只剩 1 个元素）时，直接给出答案。<br><strong>合</strong>（combine）：把子问题的答案拼成原问题的答案。</div>

归并排序的难点在"合"，快速排序的难点在"分"。我们先啃归并。

### 第一步：手写"合并两个有序列表" <span class="csf-b csf-key">重点</span>

归并排序里最关键、也最容易写错的，是这个动作：给你两个**已经各自有序**的列表，把它们拼成一个整体有序的列表。

先别看代码。**先猜一下**：`[1, 3, 5]` 和 `[2, 4, 6]` 合并后是什么？……对，`[1, 2, 3, 4, 5, 6]`。

怎么做到的？想象两摞牌都正面朝上、从小到大叠好。你每次只看**两摞最上面那张**，谁小就抽谁放进结果里。抽走一张后，那一摞露出下一张，继续比。直到某一摞抽空了，就把另一摞剩下的整个倒进去。

把这个过程翻译成代码（自己跟着敲，别复制，更别让 AI 替你写——这段逻辑你必须亲手走一遍才能记住）：

```python
def merge(left, right):
    result = []
    i = 0  # 指向 left 当前最上面那张
    j = 0  # 指向 right 当前最上面那张
    # 两摞都还有牌时，比较"最上面两张"，谁小抽谁
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    # 跳出循环时，必有一摞抽空了；把另一摞剩下的整个倒进去
    result += left[i:]   # 如果 left 还有剩，加上；没剩就是空
    result += right[j:]  # right 同理
    return result

print(merge([1, 3, 5], [2, 4, 6]))
```

**先猜再运行**：上面会打印什么？跑一下，看是不是 `[1, 2, 3, 4, 5, 6]`。

<div class="csf-note">先解释一个第一次出现的写法——方括号里带冒号，叫"切片"，意思是"从列表里切出一段"。<br>· <code>left[i:]</code> 表示"从第 i 个元素一直取到结尾"（冒号左边是起点，右边空着就代表"到最后"）。所以当 left 还剩没倒进去的牌时，<code>left[i:]</code> 就是那段剩下的；如果已经倒空了，它就是空的、加上去也没影响。<br>记住：<strong>冒号就是"从哪切到哪"</strong>，左边写起点、右边写终点（不含），哪边空着就代表"从头"或"到尾"。下面 merge_sort 里还会用到它。</div>

<div class="csf-note">划重点：最后那两行 <code>result += left[i:]</code> 和 <code>result += right[j:]</code> 是<strong>整道菜的命门</strong>。while 循环只在"两摞都还有牌"时才转，一旦一摞空了就立刻停——这时另一摞往往还剩着没倒进去的牌。漏了这两行，结果就会缺尾巴。这正是本讲的头号翻车点，下面还会专门说。</div>

### 第二步：用递归把数组劈到底，再合并 <span class="csf-b csf-core">必读</span>

有了 `merge`，归并排序就顺理成章了：把数组劈成两半，**分别排序**（这里就是递归——对半边再调用归并排序自己），然后 `merge` 起来。

```python
def merge_sort(arr):
    # 出口：长度 0 或 1 的列表，天然有序，直接返回
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2          # 取中点（// 是整除）
    left = merge_sort(arr[:mid]) # 递归排左半
    right = merge_sort(arr[mid:])# 递归排右半
    return merge(left, right)    # 合并两个有序半边

data = [5, 2, 9, 1, 7, 3]
print(merge_sort(data))
```

**先猜再运行**：输出应该是 `[1, 2, 3, 5, 7, 9]`。

<div class="csf-note">这里又用到了上面那个"切片"：<code>arr[:mid]</code> 是"从开头取到第 mid 个（不含）"，也就是左半段；<code>arr[mid:]</code> 是"从第 mid 个取到结尾"，也就是右半段。两段拼起来正好是完整的 arr，互不重叠——这就是把数组"一劈两半"的写法。</div>

这里最容易卡住的是"递归怎么就把数组排好了"。把它想成一棵树：往下是不停地"劈"，到底（长度 1）后往上是不停地"合"。

```
              [5, 2, 9, 1, 7, 3]
             /                   \
        [5, 2, 9]              [1, 7, 3]
        /      \               /      \
     [5]     [2, 9]         [1]     [7, 3]
             /    \                 /    \
          [2]    [9]             [7]    [3]

往上合并（每一层都用 merge）：
   [2]+[9]=[2,9]      [7]+[3]=[3,7]
   [5]+[2,9]=[2,5,9]  [1]+[3,7]=[1,3,7]
   [2,5,9]+[1,3,7] = [1,2,3,5,7,9]
```

<div class="csf-note">看懂这棵树，就看懂了 O(n log n) 的来历：从上到下"劈"了大约 log n 层（每层规模减半，能减多少次就是 log₂n 次），而<strong>每一层</strong>把所有元素合并一遍要花 O(n)。log n 层 × 每层 O(n) = O(n log n)。</div>

<details class="csf-fold"><summary>为什么"减半多少次"就是 log n<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
log₂n 的直白意思就是"n 连续除以 2，除多少次能到 1"。8 → 4 → 2 → 1，除了 3 次，所以 log₂8 = 3；1024 除 10 次到 1，log₂1024 = 10。归并排序每往下一层规模就减半，所以总层数就是 log₂n（取整）。这就是为什么 n 翻倍时，log n 只增加 1——这类算法对大数据特别友好。对比上一讲的 O(n²)：n 从 1000 涨到 100 万，O(n²) 慢了一百万倍，而 O(n log n) 只慢了大约两千倍。差距悬殊。
</details>

### 第三步：手写快速排序，并打印每次的 pivot 和划分 <span class="csf-b csf-key">重点</span>

快速排序换了个分治的角度：不在"合"上下功夫，而是在"分"上做文章。

思路：从数组里挑一个元素当**基准（pivot）**，然后把数组**划分（partition）**成三块——比 pivot 小的、等于 pivot 的、比 pivot 大的。小的那块和大的那块再各自快排。因为小的永远在左、大的永远在右，最后直接首尾相接就有序了，**根本不需要 merge**。

为了让你**亲眼看见**"分"的过程，我们在每一步打印 pivot 和划分结果（按题目要求，这版用最直观的写法，方便观察）：

```python
def quick_sort(arr, depth=0):
    indent = "  " * depth  # 缩进，体现递归层级
    if len(arr) <= 1:      # 出口：0 或 1 个元素，直接返回
        return arr
    pivot = arr[len(arr) // 2]  # 选中间那个当基准
    left  = [x for x in arr if x < pivot]   # 比 pivot 小
    mid   = [x for x in arr if x == pivot]  # 等于 pivot
    right = [x for x in arr if x > pivot]   # 比 pivot 大
    print(f"{indent}pivot={pivot}  左={left}  中={mid}  右={right}")
    return quick_sort(left, depth + 1) + mid + quick_sort(right, depth + 1)

data = [5, 2, 9, 1, 7, 3, 8]
print("结果:", quick_sort(data))
```

<div class="csf-note">这段代码里有几个第一次出现的写法，逐个用大白话拆开：<br>· <code>left = [x for x in arr if x &lt; pivot]</code> 叫"列表推导式"，读作：把 arr 里每个数 x 拿出来，只要它比 pivot 小，就放进新列表——其实就是一句话写完的筛选循环。它等价于下面这段普通 for 循环：<br><code>left = []</code><br><code>for x in arr:</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;if x &lt; pivot:</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;left.append(x)</code><br>两种写法结果完全一样，列表推导式只是更短。下面 mid、right 两行同理，只是把条件换成"等于"和"大于"。<br>· <code>def quick_sort(arr, depth=0)</code> 里的 <code>depth=0</code> 是"默认值"：调用时如果不传 depth，就默认从 0 开始，所以最外层 <code>quick_sort(data)</code> 不用写 depth 也能跑。<br>· <code>"  " * depth</code> 是"把两个空格这个字符串重复 depth 次"（字符串乘数字＝重复几遍）。递归越深 depth 越大，缩进就越多，打印出来就有层次感。<br>· <code>f"{indent}pivot={pivot} ..."</code> 里开头的 f 表示"格式化字符串"：字符串里用大括号 <code>{}</code> 包住变量名，就会被替换成该变量当前的值。比如 <code>{pivot}</code> 会变成 pivot 实际的数字。</div>

**先猜再运行**：结果会是排好序的 `[1, 2, 3, 5, 7, 8, 9]`；但更值得你盯着看的是中间那些 `pivot=... 左=... 右=...` 的打印——它们让"分而治之"从抽象变成你能看见的过程。运行后，对照打印想一想：每一行的"左"和"右"是不是又被下一行继续劈了？

<div class="csf-note">小提醒：上面这版快排为了"看得清"，用了三个列表推导式、额外开了内存，这在教学上最清楚。工业界更常见的是"原地划分"（不额外开数组，用指针在原数组里交换），但那个写法对初学者不直观。<strong>先把思路吃透，效率写法以后再说。</strong></div>

<details class="csf-fold"><summary>原地划分长什么样（看个眼熟就行）<span class="csf-b csf-skip">选学</span></summary>
原地版本不新建左右数组，而是在原数组里用一个指针把"已知比 pivot 小"的元素往前堆，最后把 pivot 换到中间。它省内存、对缓存友好，是真实库里快排的样子。但它的指针交换对初学者很容易写错下标。建议：<strong>现在先用上面的列表推导版把"分治直觉"练扎实</strong>，等你对快排的思想完全没有疑问了，再去挑战原地划分。一上来就抠原地版的下标，往往是"既没懂思路、又卡在细节"，得不偿失。
</details>

### 归并 vs 快排：一张对照表 <span class="csf-b csf-skim">可跳读</span>

<div class="csf-legend"><strong>归并排序</strong>：稳扎稳打。无论数据长什么样，都是 O(n log n)；缺点是要额外开内存放合并结果。<br><strong>快速排序</strong>：平均更快、常数小、可原地省内存；但"运气差"时（pivot 老是选到最大或最小）会退化成 O(n²)。<br><strong>一句话</strong>：要稳、要可预测，选归并；要平均速度快、内存省，选快排（并把 pivot 选好）。</div>

## 💡 自己复述一遍

合上屏幕，用一句话说清楚："分治排序就是把数组**劈成两半**、各自排好、再**______**起来；归并的功夫花在______，快排的功夫花在______，两者大约都是 O(______)。"

（参考：拼/合并；合并两个有序半边；按 pivot 划分；n log n。能用自己的话说出来，比背下来重要得多。）

## 🔧 翻车现场

**翻车一：合并时漏掉某一边的剩余元素。** <span class="csf-b csf-core">必读</span><br>
这是归并排序最经典的 bug。while 循环条件是"两摞都还有牌"，一旦一摞空了循环就停——但另一摞通常还剩着没倒进去的。如果你忘了写 `result += left[i:]` 和 `result += right[j:]`，结果就会**莫名其妙少几个数**，而且往往是较大的那几个。**解法**：合并的最后，永远记得把两边的"尾巴"都接上。自检小技巧：合并 `[1,2,3]` 和 `[9]`，正确结果该有 4 个数，少了就是漏尾巴。

**翻车二：快排在已经有序的数据上退化成 O(n²)。** <span class="csf-b csf-key">重点</span><br>
如果每次都固定选**第一个元素**当 pivot，遇到 `[1,2,3,4,5]` 这种已经有序的数据，pivot 永远是最小的，划分后"左边"是空、"右边"是其余全部——等于每次只剥掉一个元素，递归 n 层，每层还要扫一遍，退化成 O(n²)，和上一讲的冒泡一个速度。**解法**：别固定选头/尾。选中间元素（像我们代码里那样）能避开"有序数据"这个常见陷阱；更稳妥的是**随机选 pivot**。这也是为什么真实世界里"对已经差不多有序的数据用朴素快排"会出人意料地慢。

**翻车三：递归忘写出口。** <span class="csf-b csf-core">必读</span><br>
递归函数必须有"小到不用再拆"的出口——这里是 `if len(arr) <= 1: return arr`。漏了它，函数会无穷无尽地调用自己，Python 直接报 `RecursionError: maximum recursion depth exceeded`。**解法**：写任何递归，第一件事先写出口，再写"往下拆"的部分。养成"先写 base case"的肌肉记忆。

## ✅ 自检三问

1. 归并排序里，`merge` 函数的 while 循环跳出后，为什么还必须额外接上两边的剩余元素？哪种情况会真的有剩余？
2. 快速排序为什么不需要像归并那样写 `merge`？（提示：想想划分后左、右两块之间的大小关系。）
3. 同样是 O(n log n)，为什么说归并"稳"而快排"快但可能翻车"？翻车的具体触发条件是什么？

## 🚀 挑战

给你自己留三道，**全部自己写、自己调，卡住了先回去看上面的树状图，别直接问 AI 要答案**（你可以让 AI 帮你解释报错，但代码逻辑自己想）：

1. **给归并排序加打印**：仿照快排那一版，在 `merge_sort` 里也打印出"正在合并哪两个半边、合并结果是什么"，亲眼看一遍那棵"合并树"是怎么从下往上长起来的。
2. **造一个能让朴素快排翻车的输入**：把快排的 pivot 改成固定选 `arr[0]`，然后喂给它一个已经升序的列表（比如 `list(range(2000))`），用上一讲学的 `time` 计时；再喂同样长度的**打乱**列表对比耗时。感受一下"同样的算法、不同的数据"差出多少。
3. **比一比**：用 `import random; data = random.sample(range(100000), 100000)` 生成十万个不重复的乱序数，分别用你的归并排序和 Python 自带的 `sorted()` 排，计时对比。别灰心——自带的 `sorted()` 是 C 写的、优化了几十年，你的纯 Python 版慢很多是完全正常的。重点是你的结果**正确**（可以用 `my_result == sorted(data)` 验证）。

<div class="csf-note">挑战 3 的彩蛋：Python 的 <code>sorted()</code> 用的排序叫 Timsort，它其实是<strong>归并排序的升级版</strong>——会先找出数据里"本来就有序的片段"再聪明地合并。你今天手写的归并，正是它的地基。所以这一讲学的不是"过时的老古董"，而是真实标准库的内核思想。</div>

## 📦 复制带走

<div class="csf-card"><strong>分治三步</strong>：分（劈成同类小问题）→ 治（小到底就直接给答案）→ 合（把小答案拼回大答案）。它是后面很多算法的母版，不止用于排序。<br><strong>归并排序</strong>：劈到单个元素，再一层层 merge 回来；功夫在"合并两个有序半边"，最后<strong>千万别漏剩余元素</strong>。无论数据如何都是稳定的 O(n log n)，代价是额外内存。<br><strong>快速排序</strong>：选 pivot，划分成"小/等/大"，左右各自再快排，无需合并。平均 O(n log n)、可省内存；但 pivot 选得差（如对有序数据固定选头）会退化成 O(n²)，选中间或随机能避坑。<br><strong>递归铁律</strong>：先写出口（base case），再写往下拆的部分；忘了出口就无限递归报错。</div>

下一讲我们换个主题，进入**第08讲《二分查找：有序里的折半思维》**——你会发现，"折半"这个动作不只能用来排序，更能让"在一堆有序数据里找东西"快到飞起。今天练熟的分治直觉，到那里会再次派上用场。先猜个问题热身：在 100 万个有序数字里找一个数，最多需要查多少次？带着这个疑问，我们下一讲见。
