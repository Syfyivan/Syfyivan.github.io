---
title: "《计算机基本功路线图 · 数据结构与算法》第09讲 · 树与二叉树：会分叉的数据结构"
date: 2026-07-04 18:00:00
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

<div class="csf-key-note">前面我们走的都是"一条线"的结构：链表是一串、栈和队列是排队、二分是在有序的一排里折半。这一讲，数据第一次"长出了分叉"。<br>树不是为了好看才分叉的——它是用"分叉"换"速度"。一棵长得好的树，能让查找、插入像二分那样，每走一步就甩掉一半的数据。学会它，你才真正理解后面的图、以及无处不在的"目录""分类""索引"是怎么回事。</div>

## 🎯 这一讲你会学到什么 <span class="csf-b csf-core">必读</span>

- 用自己的话说清楚树的几个零件：**节点、根、叶子、父子关系**，以及**深度**和**高度**的区别。
- 知道什么是**二叉树**——为什么偏偏限制成"最多两个孩子"。
- 亲手用一个**类**搭出一棵二叉树，并写出**前序、中序、后序**三种递归遍历，看懂它们的差别只在一行的位置。
- 建一棵**二叉搜索树（BST）**，亲眼验证它的中序遍历**正好是从小到大排好的**。
- 避开三个新手最容易栽的坑：遍历时机搞混、BST 左右插反、以及"以为树都是平衡的"。

<div class="csf-note">说在前面：这一讲的遍历代码很短，但短不等于简单。遍历的递归是初学者第一次"被绕晕"的地方，所以我请你<strong>务必自己一行行敲、一行行猜</strong>，不要让 AI 替你写。AI 三秒钟能给你一份正确的遍历，但你真正想要的，是"脑子里能跟着跑一遍这段递归"的感觉——这个只能靠自己一行行敲、一行行猜慢慢长出来。</div>

## 🛠 跟我做 <span class="csf-b csf-core">必读</span>

### 第一步：先把"树"画在纸上，别急着写代码

在敲键盘之前，请你拿张纸，画下面这棵树（真的去画，手画一遍胜过看十遍）：

```
        1
       / \
      2   3
     / \   \
    4   5   6
```

对着这张图，我们把术语一个个钉死：

<div class="csf-legend"><strong>节点（node）</strong>：图里每个圆圈/数字，就是一个节点。<br><strong>根（root）</strong>：最上面那个、没有父亲的节点，这里是 <code>1</code>。一棵树只有一个根。<br><strong>父子关系</strong>：<code>1</code> 是 <code>2</code> 和 <code>3</code> 的<strong>父节点</strong>；<code>2</code>、<code>3</code> 是 <code>1</code> 的<strong>子节点</strong>。<code>4</code> 和 <code>5</code> 互为<strong>兄弟</strong>（同一个爹）。<br><strong>叶子（leaf）</strong>：没有任何孩子的节点。这里是 <code>4</code>、<code>5</code>、<code>6</code>。<br><strong>子树（subtree）</strong>：随便揪住一个节点，它和它下面的所有后代，自己又是一棵小树。比如以 <code>2</code> 为根的就是一棵子树。</div>

<div class="csf-note"><strong>一个反直觉但很重要的点</strong>：计算机里的树是<strong>头朝上、根在顶、叶子在底</strong>，跟现实里的树正好倒过来。别纠结，记住"根在上"就行。</div>

#### 深度 vs 高度：别背，理解 <span class="csf-b csf-key">重点</span>

这俩最容易混。用一句话区分：**深度是"从根往下数到你"，高度是"从你往下数到最远的叶子"。**

- **深度（depth）**：某个节点到根的距离。根的深度是 0，往下每层 +1。上图里 `4` 的深度是 2。
- **高度（height）**：某个节点到它最深叶子的距离。叶子的高度是 0，往上每层 +1。整棵树的高度 = 根的高度，上图是 2。

<div class="csf-why">为什么要分这么细？因为后面所有"树快不快"的讨论，都落在<strong>高度</strong>上。一棵装了 n 个节点的树，如果高度只有 log₂n 那么矮，查一个东西就只需走 log₂n 步——这就是二分的威力搬到了树上。<br>这里的 <strong>log₂n</strong> 不用怕，意思就是"把 n 不断除以 2，能除多少次"：n 是 8 就除 3 次（8→4→2→1），n 是 1000 也只要 10 次左右。所以哪怕数据很多，步数也少得惊人，非常快。<br>反过来，如果树长得又细又长（高度接近 n，也就是有多少个数据就要走多少步），那它就退化成了一条链表，啥优势都没了。<strong>树的价值，全在"矮"这个字上。</strong></div>

### 第二步：为什么偏偏是"二叉"树

树可以让每个节点有任意多个孩子。但我们这门入门课，主攻**二叉树**：**每个节点最多两个孩子**，明确分成**左孩子**和**右孩子**。

为什么限制成两个？因为"二"恰好对应"是/否""大/小""左/右"这种**二选一的判断**。而二选一，正是二分思想的灵魂。把"最多两个孩子"和"左小右大"这两条规矩一合并，就得到了这一讲的主角——二叉搜索树。先按住不表，我们先把树搭出来。

### 第三步：用类搭一棵二叉树 <span class="csf-b csf-core">必读</span>

我们用一个 `Node` 类表示节点：每个节点存一个值 `val`，和指向左右孩子的 `left`、`right`（没有孩子就是 `None`）。新建一个文件 `tree.py`，照着敲：

<div class="csf-note"><strong>下面三行可能是你第一次见到 class、__init__、self，先用大白话说清楚：</strong><br>· <code>class</code> 就是给"节点"画一张设计图，规定每个节点身上有哪些东西。<br>· <code>__init__</code> 是"造一个新节点时自动执行的初始化步骤"（前后两个下划线是 Python 的固定写法，照抄即可，先不用追究为什么）。<br>· <code>self</code> 你就理解成"这个节点自己"，那么 <code>self.val</code> 就是"这个节点自己的值"，<code>self.left</code> 就是"这个节点自己的左孩子"。<br>看不懂没关系，照着敲，跑通了再回头看这段解释。</div>

```python
class Node:
    def __init__(self, val):
        self.val = val          # 这个节点存的值
        self.left = None        # 左孩子，暂时没有
        self.right = None       # 右孩子，暂时没有

# 手动搭出第一步画的那棵树
root = Node(1)
root.left = Node(2)
root.right = Node(3)
root.left.left = Node(4)
root.left.right = Node(5)
root.right.right = Node(6)
```

读一遍这段：`root` 是根，`root.left` 顺着左边走一步到 `2`，`root.left.left` 再走一步到 `4`。**树就是节点用 left/right 串起来的，本质和链表一样是"对象指向对象"，只不过链表每个节点指 1 个，树指 2 个。**

### 第四步：三种遍历——核心就一行的位置 <span class="csf-b csf-core">必读</span>

"遍历"就是把每个节点都访问一遍（这里"访问"就是打印它的值）。对二叉树，经典的有三种**递归**遍历。

**先说清楚"递归"是什么**：递归就是一个函数自己调用自己——处理完当前这个节点后，对它的左孩子、右孩子用同一套办法再做一遍，左孩子又会对它自己的孩子再做一遍……一直往下，直到走到空节点为止。你可以理解成"同一件事，对每个节点重复做"。

这三种遍历的代码长得几乎一模一样，**区别只在"打印当前节点"这一行放在哪**：

- **前序（preorder）**：先打印自己，再左，再右 →「**根** 左 右」
- **中序（inorder）**：先左，再打印自己，再右 →「左 **根** 右」
- **后序（postorder）**：先左，再右，最后打印自己 →「左 右 **根**」

把下面这段接在 `tree.py` 后面：

```python
def preorder(node):
    if node is None:        # 走到空了就返回，这是递归的"刹车"
        return
    print(node.val, end=" ")  # 访问当前节点：放最前 = 前序；end=" " 表示打印完不换行，只接一个空格，所以结果排在同一行、用空格隔开
    preorder(node.left)
    preorder(node.right)

def inorder(node):
    if node is None:
        return
    inorder(node.left)
    print(node.val, end=" ")  # 访问放中间 = 中序
    inorder(node.right)

def postorder(node):
    if node is None:
        return
    postorder(node.left)
    postorder(node.right)
    print(node.val, end=" ")  # 访问放最后 = 后序

print("前序:", end=" "); preorder(root);  print()
print("中序:", end=" "); inorder(root);   print()
print("后序:", end=" "); postorder(root); print()
```

<div class="csf-note"><strong>先猜后做（别跳过这一步）</strong>：在运行之前，对着第一步画的那棵树，<strong>用纸笔自己推一遍</strong>这三种遍历分别会打印出什么顺序。写下你的三个答案，再去跑代码对照。<br>提示：递归就是"对每个孩子，把同样的事再做一遍"。前序到一个节点先喊出自己的名字，再去管左孩子、右孩子。</div>

跑 `python3 tree.py`，你应该看到：

```
前序: 1 2 4 5 3 6 
中序: 4 2 5 1 3 6 
后序: 4 5 2 6 3 1 
```

猜中了吗？没猜中也很正常——重点是**回头看哪里和你想的不一样**，把那一步的递归在脑子里重走一遍。

<details class="csf-fold"><summary>中序为什么走出 4 2 5 1 3 6？一步步带你走<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
中序的规则是「左 → 自己 → 右」。从根 <code>1</code> 出发，它得先把<strong>左子树（以 2 为根）</strong>整个处理完，才轮到打印自己。<br>进到 <code>2</code>：同样先处理它的左子树 <code>4</code>。<br>进到 <code>4</code>：左孩子是 None（直接返回），于是打印 <code>4</code>，右孩子也是 None。<code>4</code> 处理完，回到 <code>2</code>。<br>轮到 <code>2</code> 自己：打印 <code>2</code>。再处理 <code>2</code> 的右孩子 <code>5</code>：打印 <code>5</code>。<code>2</code> 这棵子树全做完，回到 <code>1</code>。<br>轮到 <code>1</code> 自己：打印 <code>1</code>。再处理 <code>1</code> 的右子树（以 <code>3</code> 为根）。<br>进到 <code>3</code>：它<strong>没有左孩子</strong>，所以先打印自己 <code>3</code>，再去处理右孩子 <code>6</code>：打印 <code>6</code>。<br>把打印顺序连起来：<code>4 2 5 1 3 6</code>。<strong>每一步都对得上图，这就是"自己把递归走通"的感觉——比背口诀牢得多。</strong></details>

<div class="csf-note"><strong>动手核对</strong>：上面只带你走了中序。请你照同样的方式，<strong>自己用纸笔把前序和后序也走一遍</strong>，确认能走出 <code>1 2 4 5 3 6</code> 和 <code>4 5 2 6 3 1</code>。遍历这种东西，靠"自己走通"才记得住，靠背口诀第二天就忘。</div>

### 第五步：二叉搜索树（BST）——让中序自动升序 <span class="csf-b csf-core">必读</span>

现在加上那条魔法规矩，得到 **BST（Binary Search Tree，二叉搜索树）**：

> 对**任意**一个节点，它**左子树里的所有值都比它小，右子树里的所有值都比它大**。

就因为这一条规矩，BST 有个漂亮的性质：**对它做中序遍历，结果一定是从小到大排好的。** 想想为什么——中序是「左 → 自己 → 右」，左边全比自己小、右边全比自己大，所以每个节点都被夹在"比它小的"和"比它大的"中间打印出来，整体自然升序。

我们来亲手验证。新建 `bst.py`：

```python
class Node:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

def insert(root, val):
    if root is None:            # 空位置，就把新节点放这儿
        return Node(val)
    if val < root.val:          # 比当前小 → 往左边塞
        root.left = insert(root.left, val)
    else:                       # 比当前大（或相等）→ 往右边塞
        root.right = insert(root.right, val)
    return root

def inorder(node):
    if node is None:
        return
    inorder(node.left)
    print(node.val, end=" ")
    inorder(node.right)

# 故意用一个乱序的列表来建树
nums = [5, 3, 8, 1, 4, 7, 9, 2, 6]
root = None
for n in nums:
    root = insert(root, n)

print("插入顺序:", nums)
print("中序遍历:", end=" ")
inorder(root)
print()
```

<div class="csf-note"><strong>先猜后做</strong>：<code>nums</code> 是乱的 <code>[5, 3, 8, 1, 4, 7, 9, 2, 6]</code>。运行前先猜——中序遍历会打印出什么？写下你的猜测再跑。</div>

跑 `python3 bst.py`，你会看到：

```
插入顺序: [5, 3, 8, 1, 4, 7, 9, 2, 6]
中序遍历: 1 2 3 4 5 6 7 8 9 
```

输入是乱的，中序出来却是**完美升序**。这不是巧合——是 BST 的"左小右大"规矩 + 中序"左中右"顺序，两者咬合出来的必然结果。**你刚刚用一棵树，完成了一次排序。** 这也解释了为什么后面学排序、查找时，树会反复出现。

<details class="csf-fold"><summary>insert 里为什么要 <code>return</code>，还要 <code>root.left = insert(...)</code>？<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
这是初学者读 BST 代码的第一个卡点。关键在于：<code>insert</code> 每次都<strong>返回那棵子树的新根</strong>。<br>当遇到空位（<code>root is None</code>），它新建一个节点并返回——这个返回值会被上一层用 <code>root.left = ...</code> 或 <code>root.right = ...</code> <strong>接住并挂上去</strong>，新节点才真正长在了树上。<br>如果当前位置不空，它就把值递归地塞进左或右子树，子树可能因此变化，于是用 <code>root.left = insert(root.left, val)</code> 把"可能更新过的左子树"重新接回来，最后 <code>return root</code> 把自己交还给上一层。<br>这种"改完再返回、上层接住"的写法，在树的代码里极其常见，先眼熟它。</details>

## 💡 自己复述一遍 <span class="csf-b csf-key">重点</span>

合上屏幕，用**一句话**回答：树和链表的根本区别是什么？BST 的中序遍历为什么一定是升序？

<div class="csf-note">参考（先自己说，再看）：链表每个节点只指向 1 个后继，是一条线；树每个节点可以指向多个孩子，会分叉，价值在于"长得矮 → 查得快"。BST 因为"左小右大"，中序的"左→自己→右"顺序恰好把每个值按从小到大吐出来。</div>

## 🔧 翻车现场 <span class="csf-b csf-core">必读</span>

**翻车一：三种遍历的"访问时机"搞混。**
最常见的是把"打印当前节点"那一行放错位置，或者以为前/中/后序是指"先访问左还是右"。其实**左永远在右前面**，三者唯一的区别是**打印自己这件事，排在第几位**：前序排第一、中序排第二、后序排第三。记不住时，盯着"序"字前面那个字——**前序就是把"根"放在最前**。

**翻车二：BST 插入时左右插反。**
口诀是"**比它小往左，比它大往右**"。一旦写成 `if val < root.val: root.right = ...`（小的塞到了右边），整棵树的"左小右大"就全乱了，中序遍历也不再升序。验证方法很简单：建完树跑一次中序，**只要结果不是升序，插入方向 100% 错了**。把这个中序检查当成你的"体温计"。

**翻车三：默认所有树都是平衡的。**
这是最隐蔽、也最值钱的一个认知。试试把 `bst.py` 里的 `nums` 换成**已经排好序的** `[1, 2, 3, 4, 5, 6, 7, 8, 9]` 再跑——中序依然是升序（功能没错），但这棵树的形状已经悄悄变成了一条**只往右长的链**！

```
1
 \
  2
   \
    3
     \
      ...
```

<div class="csf-why">这时树的高度从理想的 ~3 变成了 8，查找一个数要走 8 步而不是 3 步——<strong>BST 退化成了链表，二分的优势彻底消失</strong>。这就是为什么现实中有"平衡二叉树"这种进阶结构，专门在插入时自动把树"掰矮"，保证它一直很矮。<br>常见的平衡二叉树有两种：<strong>红黑树</strong>，还有 <strong>AVL 树</strong>（AVL 读作"A-V-L"，是用三位发明者名字的首字母命名的）。它俩的共同点就是会在插入时自动调整形状、不让树长歪。这门入门课不要求你实现它们，你现在只要知道"有这么个东西"就行。<br>另外这里出现了 <strong>O(log n)</strong>、<strong>O(n)</strong> 这种带大写 O 的写法，第一次见也补一句：O(...) 是衡量"数据变多时要多花多少功夫"的写法，<strong>O(log n)</strong> 表示数据涨很多、功夫也几乎不怎么涨（很快），<strong>O(n)</strong> 表示数据翻倍、功夫也跟着翻倍（慢）。<br>所以这里真正要记住的前提是：<strong>BST 只有在平衡的时候查找才是 O(log n)，最坏情况（比如按顺序插入退化成链）就是 O(n)。</strong> 记住这个前提，以后别人说"用了 BST 所以查找一定很快"时，你自然会想到追问一句：它是平衡的吗？</div>

## ✅ 自检三问

1. 节点 `4` 在第一步那棵树里，**深度**是多少？整棵树的**高度**是多少？（说不清就回去看深度/高度那一节）
2. 给你一棵 BST，你不画图、不写代码，能立刻说出"它的中序遍历是什么样的特征"吗？
3. 有人告诉你"我用了 BST，所以查找一定是 O(log n)"。你应该追问哪一个关键前提？

## 🚀 挑战 <span class="csf-b csf-key">重点</span>

在 `bst.py` 的基础上，**自己动手**（别让 AI 代写，写完可以让它帮你挑错）加两个函数：

1. `search(root, target)`：在 BST 里查一个值，找到返回 `True`，找不到返回 `False`。**要求利用"左小右大"，每一步只走一边**（这样才是 log n 而不是把整棵树都遍历一遍）。
2. `tree_height(root)`：返回整棵树的高度。提示：一个节点的高度 = 左右子树高度的较大者 + 1；空树高度按 -1 算（这样叶子高度刚好是 0）。

写完用两组数据各跑一次：一组是乱序的 `[5,3,8,1,4,7,9]`，一组是顺序的 `[1,2,3,4,5,6,7]`，**打印两棵树的高度做对比**——亲眼见证"翻车三"说的退化。你会看到两个高度差很多：乱序那棵很矮，顺序那棵高得离谱（退化成了一条链）。**如果你能讲清楚为什么会差这么多，这一讲你就真的吃透了。**

## 📦 复制带走

<div class="csf-card">1. <strong>树 = 会分叉的链表</strong>：节点用 left/right 指向孩子；根在上、叶子在下；价值全在"长得矮 → 查得快"。<br>2. <strong>三种遍历只差一行位置</strong>：前序「根左右」、中序「左根右」、后序「左右根」——左永远在右前，区别只是"打印自己"排第几。<br>3. <strong>BST 的中序必升序</strong>：靠"左小右大"+"左中右"咬合而成；建完树跑一次中序，是检查插入方向对不对的体温计。<br>4. <strong>别默认树是平衡的</strong>：BST 只有平衡时查找才是 O(log n)（很快），最坏（按序插入）退化成链表，变成 O(n)（慢）。记住这个前提，以后听到"用了 BST 所以一定快"，就能想起追问一句：它是平衡的吗？</div>

下一讲（第10讲《图的直觉与 BFS / DFS：点和线的世界》），我们把"分叉"再放开一层——节点之间不再只有父子，而是可以随便连线、甚至连成环。树其实是图的一种特例，学完这一讲，你已经一只脚踏进图的门了。
