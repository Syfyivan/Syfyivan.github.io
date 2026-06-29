---
title: "《计算机基本功路线图 · 数据结构与算法》第10讲 · 图的直觉与 BFS / DFS：点和线的世界"
date: 2026-07-04 19:00:00
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

<div class="csf-key-note">上一讲的树，是一种"不会绕回来"的特殊结构：从根往下分叉，越走越散，永远走不回出发点。这一讲我们把"不会绕回来"这个限制拿掉——允许任意两个点之间连线，允许成环、允许互相指。于是树变成了<strong>图</strong>。地铁线路、朋友关系、网页之间的链接、导航里的路口，全是图。而走遍一张图的两种最基本走法——<strong>BFS（一圈一圈往外）</strong>和 <strong>DFS（一条道走到黑）</strong>——是你接下来刷题、看懂别人代码、判断 AI 写得对不对的硬通货。</div>

## 🎯 这一讲你会学到什么

- 图到底是什么：**顶点（点）** 和 **边（线）**，以及 **有向 / 无向** 的区别。
- 怎么在代码里"画"一张图：用 Python 的 `dict` 写 **邻接表**。
- 两种走遍全图的方法：**BFS 广度优先**（靠队列，一圈圈扩散）和 **DFS 深度优先**（靠递归或栈，一条路走到底）。
- 一个关键开关：**`visited` 标记**——没有它，有环的图会让你的程序无限打转。
- 用 BFS 求**两点之间最少几步**，用 DFS **打印出一条从起点到终点的路径**。

<div class="csf-note">老规矩：这一讲所有代码，<strong>请你自己一行一行敲进去跑</strong>。不要让 AI 替你生成 BFS、DFS 然后照抄——这两个算法是"肌肉记忆"级别的基本功，AI 几秒就能写出来，但正因为它太容易被生成，<strong>你能不能一眼看出它写错了</strong>，才是你的价值。亲手写错几次、调对了，远比抄一份对的有用。</div>

## 🛠 跟我做

### 第一步：先在纸上画一张图 <span class="csf-b csf-core">必读</span>

别急着写代码。拿张纸，画 5 个圈，分别写上 A、B、C、D、E，这就是 **5 个顶点**。再画几条线把它们连起来，比如：

```
    A --- B
    |     |
    C --- D
          |
          E
```

这几条横线竖线，就是 **边**。一条边表示"这两个点之间能直接走"。比如 A 和 B 之间有线，说明从 A 能一步到 B，从 B 也能一步回 A。

这种"你能到我、我也能到你"的图，叫 **无向图**（线没有箭头）。如果边是带箭头的——比如微博的"关注"，你关注了某明星不代表他关注你——那就是 **有向图**。这一讲我们主要玩无向图。

<div class="csf-legend">小词典：<br>• <strong>顶点 / 节点（vertex / node）</strong>：图里的"点"，上图的 A、B、C、D、E。<br>• <strong>边（edge）</strong>：连接两个点的"线"，表示它们直接相连。<br>• <strong>邻居（neighbor）</strong>：和某个点有边直接相连的点。比如 D 的邻居是 B、C、E。<br>• <strong>有向 / 无向</strong>：边有没有方向。无向 = 双向都能走；有向 = 只能顺箭头走。</div>

### 第二步：用 dict 把这张图写进代码 <span class="csf-b csf-key">重点</span>

怎么让程序"记住"这张图？最常用、最好理解的办法叫 **邻接表（adjacency list）**：给每个点列一个清单，写下"我直接连着谁"。在 Python 里，用一个 `dict` 就够了——**键是点，值是这个点所有邻居的列表**。

把上面那张图翻译成代码：

```python
# 邻接表：每个点 -> 它的邻居列表
graph = {
    "A": ["B", "C"],
    "B": ["A", "D"],
    "C": ["A", "D"],
    "D": ["B", "C", "E"],
    "E": ["D"],
}

# 验证一下：D 的邻居是谁？
print(graph["D"])   # 先猜：会打印什么？
```

<div class="csf-note">🔮 <strong>先猜后做</strong>：在运行前，先在心里回答 <code>graph["D"]</code> 会打印什么？……揭晓：<code>['B', 'C', 'E']</code>。因为在图里 D 和 B、C、E 三个点都有线相连。</div>

注意一个**关键细节**：因为是无向图，A 连 B，那么 A 的清单里有 B，**B 的清单里也必须有 A**。每条边都要"两个方向都登记"。这一点初学者极容易漏，后面"翻车现场"会专门说。

<details class="csf-fold"><summary>为什么不用"邻接矩阵"？<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
还有一种表示法叫<strong>邻接矩阵</strong>：开一个 N×N 的二维表，<code>matrix[i][j] = 1</code> 表示 i、j 之间有边。它查"两个点之间有没有边"是 O(1)，很快。但它有个大问题：不管图里边多边少，都要占 N×N 的空间。现实里的图大多是"稀疏"的（点很多、边相对少，比如社交网络里你不可能认识所有人），用矩阵会浪费海量空间。所以入门和大多数刷题场景，<strong>邻接表是默认选择</strong>。你先把邻接表练熟，矩阵知道有这么回事即可。</details>

### 第三步：BFS——一圈一圈往外扩，求最短步数 <span class="csf-b csf-core">必读</span>

现在问一个问题：从 A 出发，到 E **最少要走几步**？

BFS（Breadth-First Search，广度优先搜索）的思路特别符合直觉：**先看离我一步的所有点，再看两步的所有点，再看三步的……** 像往水里扔块石头，波纹一圈圈扩出去。第几圈碰到 E，答案就是几步。

实现 BFS 要用 **队列（queue）**——还记得第08讲讲的"先进先出"吗？谁先排进队列，谁先被处理。这正好保证了"离起点近的先被探索"。

```python
from collections import deque   # deque 是高效的队列

def bfs_shortest_steps(graph, start, target):
    # visited：记录哪些点已经走过，避免在环里打转
    # 注意：这里的 {start} 不是字典，而是一个"集合(set)"——
    # 可以理解成一个不放重复元素的袋子，专门用来打勾记录"这个点走过没有"。
    # 空集合写成 set()，加元素用 .add()，判断在不在用 in。
    visited = {start}
    # 队列里存 (当前点, 从起点到这里走了几步)
    queue = deque([(start, 0)])

    while queue:
        node, steps = queue.popleft()   # 从队头取出（先进先出）
        if node == target:
            return steps                # 第一次碰到目标，步数一定最少
        for neighbor in graph[node]:
            if neighbor not in visited: # 没走过的邻居才加进队列
                visited.add(neighbor)
                queue.append((neighbor, steps + 1))

    return -1   # 队列空了还没找到，说明走不到

# 先猜：从 A 到 E，最少几步？
print(bfs_shortest_steps(graph, "A", "E"))
```

<div class="csf-note">🔮 <strong>先猜后做</strong>：对着你画的图数一数，A 到 E 最少几步？A→B→D→E 是 3 步，A→C→D→E 也是 3 步……运行结果应该是 <code>3</code>。你猜对了吗？</div>

**为什么 BFS 第一次碰到目标就是最短？** 因为它严格按"圈"扩散：所有 1 步能到的点先全部处理完，才会处理 2 步的点。所以当它第一次把 E 取出来时，不可能存在更短的路径——更短的早就该在前面的圈里碰到了。

补一句话：我们这张图的每条边都是"走一步"，没有谁远谁近的差别（这种图专业上叫**无权图**，"权"就是边上标的距离/花费，比如地铁两站之间的实际公里数）。如果哪天边上带了数字，那就是"有权图"了，求最短就要换别的办法。而在"每条边都一样、只数步数"的无权图里求最少步数，正是 BFS 的看家本领。

### 第四步：DFS——一条道走到黑，打印一条路径 <span class="csf-b csf-core">必读</span>

DFS（Depth-First Search，深度优先搜索）的脾气和 BFS 相反：**选一个邻居就一直往深里走，走到不能走了再退回来换一条**。像走迷宫时"始终摸着右墙走"，撞到死胡同再往回退。

DFS 最自然的写法是 **递归**（第07讲的老朋友）——函数自己调用自己，天然就有"走进去、再退回来"的味道。我们用 DFS 找一条 A 到 E 的路径并打印出来：

```python
def dfs_find_path(graph, current, target, visited, path):
    visited.add(current)
    path.append(current)            # 把当前点加进路径

    if current == target:
        return True                 # 找到了！路径就在 path 里

    for neighbor in graph[current]:
        if neighbor not in visited:
            if dfs_find_path(graph, neighbor, target, visited, path):
                return True         # 深处找到了，一路返回 True

    path.pop()                      # 这条路走不通，回退：把当前点拿掉
    return False

# 调用
path = []
found = dfs_find_path(graph, "A", "E", set(), path)
print(found, path)
```

<div class="csf-note">为什么调用时要从外面多传两个空东西进去？这里先准备一个空集合 <code>set()</code>（用来打勾走过的点）和一个空列表 <code>path</code>（用来记录走过的路），把它们传进函数里。函数在递归的过程中，会一路往这两个袋子里填东西：每走到一个点，就往 <code>set()</code> 里打个勾、把这个点塞进 <code>path</code>。等整个过程跑完，<code>path</code> 里装的就是找到的那条路径。<br>（BFS 那个函数是在函数内部自己 <code>visited = {start}</code> 新建集合的，所以不用外面传；DFS 因为要让外面的 <code>path</code> 在递归里被一路填满、跑完还能拿到结果，才把它从外面传进去。）</div>

<div class="csf-note">🔮 <strong>先猜后做</strong>：先猜 <code>path</code> 会是什么。注意 A 的邻居列表是 <code>["B", "C"]</code>，DFS 会先试 B。一种可能的结果是 <code>True ['A', 'B', 'D', 'E']</code>。<strong>DFS 找到的不保证是最短路径</strong>——它只保证"是一条能走通的路"。这正是它和 BFS 的关键区别。</div>

那行 `path.pop()` 是 DFS 的灵魂：当一条路被证明走不到终点，要把当前点从路径里**拿掉再回退**，否则打印出来的路径里会混进死胡同上的点。

<details class="csf-fold"><summary>DFS 也能用栈写，不用递归<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
递归的本质，就是程序帮你维护了一个"调用栈"。所以 DFS 也可以自己拿一个<strong>栈（stack，后进先出）</strong>来写，效果一样：
<br>
<pre><code class="language-python">def dfs_iterative(graph, start):
    visited = set()
    stack = [start]
    order = []
    while stack:
        node = stack.pop()        # 从栈顶取（后进先出）
        if node in visited:
            continue
        visited.add(node)
        order.append(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                stack.append(neighbor)
    return order</code></pre>
对比着记最省脑子：<strong>BFS 用队列（popleft，先进先出），DFS 用栈（pop，后进先出）</strong>。把它俩的容器换一下，走法就从"扩散"变成"钻深"。</details>

## 💡 自己复述一遍

合上屏幕，用一句话说清楚：

> 图就是点加连点的边；走遍它有两招——**BFS 用队列一圈圈扩散，适合求最短步数；DFS 用递归/栈一条路走到底，适合找一条路径或走遍全图**；两招都必须用 `visited` 记住走过的点，否则有环就无限打转。

说不顺没关系，回去把那张 5 个点的图重画一遍，对着代码再走一遍流程。

## 🔧 翻车现场

<div class="csf-note"><strong>翻车一：忘了 <code>visited</code>，程序卡死 / 爆栈。</strong><br>图和树最大的不同就是<strong>可能有环</strong>（A→B→D→C→A 绕回来了）。如果不记录走过的点，BFS 会把同一个点反复塞进队列、DFS 会顺着环无限递归下去，轻则死循环，重则 <code>RecursionError</code>。<strong>解法</strong>：任何图的遍历，第一反应就是"我的 visited 在哪"。</div>

<div class="csf-note"><strong>翻车二：把 BFS 写成了栈、DFS 写成了队列。</strong><br>如果你在"BFS"里用了 <code>stack.pop()</code>（取栈顶），它就退化成 DFS 了，求出来的"最短步数"会是错的。<strong>解法</strong>：死记——<strong>BFS = 队列 = <code>popleft()</code>；DFS = 栈/递归 = <code>pop()</code></strong>。容器选错，算法的灵魂就变了。</div>

<div class="csf-note"><strong>翻车三：无向图只加了一个方向的边。</strong><br>写邻接表时只写了 <code>graph["A"] = ["B"]</code>，却忘了在 <code>graph["B"]</code> 里也加上 A。结果从 A 能到 B，从 B 却"看不见"A，遍历少走一大半。<strong>解法</strong>：无向图每条边都要登记两次。可以写个小函数 <code>add_edge(g, u, v)</code> 同时往两边加，从源头杜绝漏写。</div>

<div class="csf-note"><strong>翻车四：visited 标记的时机错了（BFS 里）。</strong><br>正确做法是<strong>在入队的那一刻就标记 visited</strong>（上面代码里 <code>visited.add(neighbor)</code> 和 <code>queue.append</code> 紧挨着）。如果改成"出队时才标记"，同一个点可能被多次塞进队列，既慢又可能算错。<strong>解法</strong>：BFS 记住"一加入队列就立刻打勾"。</div>

## ✅ 自检三问

1. 无向图里，A 和 B 之间有一条边，那么在邻接表里，`graph["A"]` 和 `graph["B"]` 分别应该包含谁？（提示：互相要登记）
2. BFS 用队列、DFS 用栈/递归。如果我把 BFS 代码里的 `popleft()` 改成 `pop()`，它还能正确求出最短步数吗？为什么？
3. 为什么图的遍历一定要 `visited`，而上一讲遍历树时却可以不用？（提示：想想"环"）

<div class="csf-why">能流畅答出第 3 问，说明你真的理解了"图 vs 树"的本质区别——树是一种特殊的图：没有环、而且所有点都连成一片、能互相走到（"所有点都能互相走到"这件事专业上叫"连通"），所以从根往下走天然不会绕回来；而一般的图会成环，不打勾就会鬼打墙。这一问答不上来，建议把这一讲和上一讲再串一遍。</div>

## 🚀 挑战

给你一张稍大一点的"地铁图"，自己动手，**别让 AI 代写**：

```python
metro = {
    "中心站": ["东门", "西门", "南广场"],
    "东门":   ["中心站", "图书馆"],
    "西门":   ["中心站", "体育场"],
    "南广场": ["中心站", "体育场", "美术馆"],
    "体育场": ["西门", "南广场", "美术馆"],
    "美术馆": ["南广场", "体育场"],
    "图书馆": ["东门"],
}
```

完成三个任务：

1. 用 **BFS** 求"图书馆"到"美术馆"最少坐几站，并先猜后验证。
2. 用 **DFS** 打印一条从"图书馆"到"体育场"的可行路径。
3. **进阶**：改造 BFS，让它不仅返回步数，还能返回**最短路径本身**（提示：队列里除了存点和步数，也可以存"到这里为止走过的路径列表"，或者另用一个 `parent` 字典记录"每个点是从谁那儿第一次被发现的"，最后从终点回溯）。

写完后，你可以把自己的实现贴给 AI，让它当**陪练**——问它"我这段 BFS 有没有 bug、时间复杂度是多少"，但**先自己判断一遍再看它怎么说**。如果它给的答案和你想的不一样，别急着信它，回到代码里跑一跑、验证谁对。这就是这门课要练的判断力。

## 📦 复制带走

<div class="csf-card">1. <strong>图 = 顶点 + 边</strong>。无向图边双向、有向图边带箭头；代码里用 <code>dict</code> 邻接表表示（点 → 邻居列表）最顺手。<br>2. <strong>BFS 用队列</strong>（<code>deque</code> + <code>popleft</code>），一圈圈扩散，<strong>第一次碰到目标就是最短步数</strong>。<br>3. <strong>DFS 用递归 / 栈</strong>（<code>pop</code>），一条路走到黑，适合找一条路径或走遍全图，但<strong>不保证最短</strong>。<br>4. <strong>遍历图必带 <code>visited</code></strong>：图会成环，不打勾就无限打转——这是图区别于树最该记住的一条。</div>

下一讲（第11讲《双指针与滑动窗口：数组上的常用套路》），我们从"点和线的世界"回到最朴素的数组，学两个套路：能把那种"数据翻一倍、耗时翻好几倍"的笨办法（俗称"暴力解"，就是不动脑筋、一个个全试的最直接写法），变成"数据翻一倍、耗时大致也只翻一倍"的快办法。这两种快慢分别记作 O(n²) 和 O(n)（这套表示快慢的记号下一讲会细讲，现在看不懂完全没关系，不用慌）。我们下讲见。
