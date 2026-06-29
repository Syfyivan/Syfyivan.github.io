---
title: "《计算机基本功路线图 · 编程语言入门（Python）》第04讲 · 条件判断：让程序学会“看情况办事”"
date: 2026-07-03 13:00:00
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

<div class="csf-key-note">上一讲我们让程序学会了“和人对话”——你问它答。但到现在为止，程序还像个只会照本宣科的复读机：不管你输入什么，它都走同一条路。这一讲，我们要给它装上第一个“大脑开关”：<strong>看情况办事</strong>。分数高就夸一句，分数低就提醒一下；输对密码就放行，输错就拦住。这就是 <code>if</code>，是程序从“死板”走向“聪明”的第一步。</div>

到这一讲为止，你写的程序都是“一条道走到黑”：从第一行执行到最后一行，中间不会拐弯。但真实世界里，几乎所有有用的程序都要拐弯——登录要判断密码对不对，购物车要判断够不够钱，游戏要判断你有没有打中怪。今天学的 `if` 判断，就是让程序学会“如果……就……，否则……”的本事。

## 🎯 这一讲你会学到什么

- 用 `if / elif / else` 让程序根据不同情况，走不同的代码分支
- 看懂并写对比较运算符：`==`、`!=`、`>`、`<`、`>=`、`<=`
- 用 `and / or / not` 把多个条件组合起来（“又……又……”“或者”“不是”）
- 真正搞懂 Python 里**缩进**的意义——它不是排版好看，是语法本身
- 亲手写一个“成绩等级”程序：输入分数，自动告诉你优秀 / 良好 / 及格 / 不及格

<div class="csf-note">这一讲是你写过的程序里第一次出现“分支”。概念不多，但<strong>缩进</strong>和 <code>==</code> 这两个点，几乎每个初学者都会栽一次。别急，我们会专门把坑挖出来给你看。</div>

## 🛠 跟我做

### 第一步：最简单的 if <span class="csf-b csf-core">必读</span>

新建一个文件 `check.py`，敲下面这几行。**请一个字一个字自己敲，别复制**——`if` 的手感要靠手指记住，复制粘贴学不会。

```python
age = 18
if age >= 18:
    print("你已经成年了")
print("程序结束")
```

先别运行。**先猜一下**：屏幕上会打印出几行？哪几行？

……

揭晓：打印两行——`你已经成年了` 和 `程序结束`。

我们来逐行拆解，这是今天最重要的结构：

- `age = 18`：先准备一个变量。
- `if age >= 18:`：这是判断。`age >= 18` 是一个**问句**——“age 大于等于 18 吗？”，答案只有“对”或“不对”。注意行尾那个**冒号 `:`** 不能少。
- 下面那行 `print("你已经成年了")` 前面**缩进了 4 个空格**。这个缩进是在说：“这一行是属于 if 的，只有判断成立时才执行。”
- 最后 `print("程序结束")` **没有缩进**，它不属于 if，所以无论如何都会执行。

现在把第一行改成 `age = 16`，再猜一次：会打印几行？

改完运行，你会发现只剩 `程序结束` 一行——因为 16 不满足 `>= 18`，缩进里的那行被**整个跳过**了。

<div class="csf-note"><strong>缩进就是语法。</strong>在很多别的语言里，代码块用大括号 <code>{ }</code> 框起来；Python 不用大括号，它<strong>用缩进来表示“谁属于谁”</strong>。同一个块里的代码，缩进必须完全一样。这是 Python 最有特色、也最容易让新手摔跤的地方，后面翻车现场会专门讲。</div>

### 第二步：if + else，两条路 <span class="csf-b csf-core">必读</span>

只有“成立时做什么”还不够，我们常常还想说“不成立时做点别的”。这就是 `else`：

```python
age = 16
if age >= 18:
    print("你已经成年了")
else:
    print("你还是未成年人")
print("程序结束")
```

**先猜**：这次打印哪两行？

运行看看：`你还是未成年人` 和 `程序结束`。

`if ... else ...` 像一个岔路口：条件成立走上面那条，不成立走下面那条，**两条路只会走一条**。注意 `else` 后面也有冒号，`else` 自己不带条件（它就是“剩下所有情况”）。

### 第三步：比较运算符——程序怎么“问问题” <span class="csf-b csf-key">重点</span>

`if` 后面跟的那个“问句”，靠的是比较运算符。一共这几个，请记牢：

```python
a = 5
b = 8
print(a == b)   # a 等于 b 吗？  False
print(a != b)   # a 不等于 b 吗？ True
print(a > b)    # a 大于 b 吗？   False
print(a < b)    # a 小于 b 吗？   True
print(a >= 5)   # a 大于等于 5 吗？True
print(a <= 4)   # a 小于等于 4 吗？False
```

每一行运行后都会打印 `True` 或 `False`——这两个是 Python 里的特殊值，叫**布尔值**，代表“真”和“对”、“假”和“不对”。`if` 干的事，本质就是：**算出后面这个问句是 True 还是 False，True 就执行缩进里的代码，False 就跳过。**

<div class="csf-note">这里有个全世界初学者都会犯的错，一定要现在就刻进脑子：判断“相等”用<strong>两个等号 <code>==</code></strong>，不是一个。<strong>一个等号 <code>=</code> 是“赋值”</strong>（把右边装进左边的变量），<strong>两个等号 <code>==</code> 才是“比较是否相等”</strong>。写 <code>if age = 18:</code> 会直接报错。翻车现场我们再细说为什么。</div>

### 第四步：elif——三条以上的路 <span class="csf-b csf-key">重点</span>

人生不止两个岔路口。比如判断天气：很热、适中、很冷，三种情况。这时用 `elif`（它是 “else if” 的缩写，意思是“要不然，如果……”）：

```python
temp = 25
if temp >= 30:
    print("很热，开空调")
elif temp >= 15:
    print("天气适中，舒服")
else:
    print("有点冷，加件衣服")
```

**先猜**：`temp = 25` 时打印哪一句？

运行：`天气适中，舒服`。

这里有个关键机制，请仔细体会：**Python 从上往下一条条检查，碰到第一个成立的就执行，执行完整个结构就结束，后面的一概不再看。**

- `temp >= 30`？25 不满足，跳过。
- `elif temp >= 15`？25 满足！执行 `天气适中，舒服`，然后**直接结束**，`else` 根本不看。

你可能会嘀咕：25 不是也满足 `>= 15` 吗，为什么不接着往下判断？答案是：因为前面的 `elif temp >= 15` 已经是第一个成立的条件了，程序一旦执行完它，就立刻停下，后面的 `else` 统统不看。正因为“从上往下、撞到就停”，**条件的顺序非常重要**。如果你把 `temp >= 15` 写在 `temp >= 30` 前面，那 35 度也会先撞上 `>= 15`，结果报“天气适中”——就错了。

<details class="csf-fold"><summary>为什么不能全用 if，要用 elif？<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
你可能想：我写三个独立的 <code>if</code> 不也行吗？区别在这里——<strong>三个独立 if 是三道独立的判断，每一道都会被检查一遍</strong>，可能同时成立、打印好几句；而 <code>if / elif / else</code> 是<strong>一组互斥的分支，最多只会走进一个</strong>。判断“成绩等级”这种“一个分数只能属于一个等级”的场景，必须用 <code>elif</code>，否则一个 85 分可能既被判“良好”又被判“及格”，逻辑就乱了。记住：<strong>互斥的多选一，用 elif；彼此独立的多个判断，才用多个 if。</strong>
</details>

### 第五步：and / or / not——把条件组合起来 <span class="csf-b csf-key">重点</span>

有时候一个条件不够。“年龄在 18 到 60 之间”就是两个条件要**同时**成立。这时用 `and`（并且）、`or`（或者）、`not`（不是）：

```python
age = 25
if age >= 18 and age <= 60:
    print("属于劳动年龄")

day = "周六"
if day == "周六" or day == "周日":
    print("今天休息")

logged_in = False
if not logged_in:
    print("请先登录")
```

- `and`：**两边都成立**，整体才成立（像“又要会写代码，又要会沟通”）。
- `or`：**只要一边成立**，整体就成立（像“周六或周日，都算周末”）。
- `not`：把真假**反过来**（`logged_in` 是 False，`not logged_in` 就是 True）。

**先猜**：上面三段，哪几句会被打印？

运行确认：`属于劳动年龄`、`今天休息`、`请先登录` 三句都会打印。

### 动手练：成绩等级程序 <span class="csf-b csf-core">必读</span>

现在把今天学的全用上，写一个真正能用的小程序。新建 `grade.py`，**自己一行行敲完它**——这是今天的核心练习，请务必亲手写，写不出来再回头看上面：

```python
score = int(input("请输入分数（0-100）："))

if score >= 90:
    print("优秀")
elif score >= 80:
    print("良好")
elif score >= 60:
    print("及格")
else:
    print("不及格")
```

（还记得上一讲讲过的 `int(input(...))` 吗？`input` 拿到的永远是文字，要用 `int()` 把它变成数字，才能拿来比大小。）

**先猜后做**：在运行之前，先在纸上或心里写下——输入 95 会输出什么？85 呢？60 呢？59 呢？写完再运行验证。

然后多跑几次，每次输入不同的分数试试：`95`、`90`、`89`、`80`、`60`、`59`、`0`。看看每个分数落进了哪个等级，是不是和你猜的一样。

特别留意**边界值**：90 是“优秀”还是“良好”？因为我们写的是 `>= 90`，所以 90 正好是“优秀”。这种“恰好等于”的边界，是最容易出 bug（程序里的错误、毛病，就是让结果不对的地方）的地方，养成习惯专门测它。

<div class="csf-note"><strong>请你自己写，别让 AI 代写。</strong>你完全可以让 AI 几秒钟生成这段代码——但那样你的手指、你的大脑就什么都没记住。<code>if/elif/else</code> 的结构、冒号、缩进、条件顺序，这些“肌肉记忆”只能靠自己敲出来。等你真的写熟了，再用 AI 提速、让它帮你检查，那才是“你指挥 AI”；现在就交给它，你只会变成“看不懂自己程序的人”。</div>

## 💡 自己复述一遍

合上屏幕，用一句话告诉自己：`if` 就是让程序**先算一个问句是真还是假**，真就走缩进里的那条路，假就跳过或走 `else`；多个互斥的情况用 `elif` 从上往下一个个比，**撞到第一个成立的就停**。

如果说不利索，回到第四步“天气”那段再读一遍——把“从上往下、撞到就停”这八个字记住，今天就成功一大半。

## 🔧 翻车现场

<div class="csf-note"><strong>翻车一：缩进忽多忽少 / 空格和 Tab 混用。</strong>这是 Python 新手第一杀手。报错信息通常是 <code>IndentationError: unexpected indent</code>（缩进错误，意思是缩进出了问题）或 <code>TabError</code>（Tab 和空格混用错误）。这两个都是会让程序跑不起来的报错，看到它们说明缩进得改。原因是：同一个块里的代码缩进必须<strong>完全一致</strong>，而且不能一会儿用空格、一会儿按 Tab 键——它俩看起来一样宽，在 Python 眼里却是两种东西。<br><strong>解法：</strong>统一用 <strong>4 个空格</strong>缩进，永远不要按 Tab。好消息是，VS Code 这类编辑器默认会把 Tab 自动转成空格，你基本不用操心；真遇到诡异的缩进报错，把那几行删掉重敲一遍，往往就好了。</div>

<div class="csf-note"><strong>翻车二：用 <code>=</code> 当成了 <code>==</code>。</strong>想判断相等，却写成 <code>if score = 90:</code>，运行直接报 <code>SyntaxError</code>（语法错误，就是写法写错了，程序看不懂，没法运行）。<br><strong>原因：</strong><code>=</code> 是“赋值”，<code>==</code> 才是“比较是否相等”。<br><strong>解法：</strong>记一句口诀——<strong>“问相等用双等号”</strong>。每次在 if 里写相等判断，心里默念一遍。</div>

<div class="csf-note"><strong>翻车三：elif 分支漏写，有些分数无家可归。</strong>比如成绩程序里只写了 <code>>= 90</code> 和 <code>>= 80</code>，忘了 60 那档和 <code>else</code>，那么输入 70 时，程序什么都不打印——它静悄悄地走完了，没报错，但也没干活。这种“不报错但结果不对”的 bug 最阴险。<br><strong>解法：</strong>写完分支，<strong>故意挑每个区间各测一个数</strong>（比如 95、85、70、30），确认每个数都有输出、且输出正确。养成“写完就把各种情况都试一遍”的习惯。</div>

<div class="csf-note"><strong>翻车四：忘了行尾的冒号 <code>:</code>。</strong><code>if</code>、<code>elif</code>、<code>else</code> 这几行的末尾都必须有冒号，漏了会报 <code>SyntaxError</code>。看到这个错，先去检查冒号在不在。</div>

## ✅ 自检三问

1. `if` 后面的条件算出来的结果，本质上是哪两个值之一？（提示：第三步那两个特殊值）
2. 判断“两个东西是否相等”，要用一个等号还是两个等号？写错了会发生什么？
3. 一个分数同时满足 `>= 80` 和 `>= 60`，在 `if score>=80 ... elif score>=60 ...` 结构里，它最终会走进哪个分支？为什么？

（答不上来不丢人，回到对应小节再读一遍，比硬背强得多。）

## 🚀 挑战

给你的成绩等级程序**加一道“防呆”判断**：如果用户输入的分数小于 0 或者大于 100（这是不合理的分数），就先打印一句 `输入的分数不合理`，**不再**去判断等级。

提示：你需要在最前面加一个判断，用上今天学的 `or`——什么情况算“不合理”？是 `score < 0 or score > 100`。

这一步的关键，是要把原来那整段等级判断**放进另一个判断的“里面”**——也就是“一个 if 里面再放一个 if”，行话叫**嵌套**。这里有个新手很容易卡住的点：**放进里面的代码，缩进会多一层**。原来在最外层、顶着行首写的等级判断（每行缩进 4 个空格的那段），整段挪进 `else` 里面之后，每一行都要再往右缩进 4 个空格，变成 8 个空格。

可以照这个骨架来搭，先写好外层判断：

```python
score = int(input("请输入分数（0-100）："))

if score < 0 or score > 100:
    print("输入的分数不合理")
else:
    # 下面这一整段就是原来的等级判断，
    # 注意每一行都比原来又多缩进了 4 个空格（一共 8 个）
    if score >= 90:
        print("优秀")
    # ……剩下的 elif / else 照样往下接，缩进保持和上面一致
```

也就是说：分数不合理时走 `if` 这条路，打印一句提醒就结束；分数合理时走 `else` 这条路，再进去做原来的等级判断。

**先自己写，卡住了再想，实在不行才问 AI“思路”而不是要“答案”。** 写出来你会很有成就感——因为这已经是一个“考虑了异常情况、不会被乱输入坑到”的小程序了。

## 📦 复制带走

<div class="csf-card"><strong>本讲要点</strong><br>1. <strong>if/elif/else 是分支结构</strong>：先算条件的真假，真就走缩进里的代码。<code>elif</code> 用于“互斥的多选一”，从上往下撞到第一个成立的就停，所以<strong>条件顺序很重要</strong>。<br>2. <strong>缩进就是语法</strong>：Python 用缩进（统一 4 个空格、别按 Tab）表示“谁属于谁”，不是为了好看。<br>3. <strong>问相等用双等号 <code>==</code></strong>：单等号 <code>=</code> 是赋值；<code>and</code>（都成立）、<code>or</code>（有一个就行）、<code>not</code>（取反）用来组合条件。<br>4. <strong>写完一定测边界和各区间</strong>：每个分支都喂一个数验证；这种“自己跑一遍”的习惯，比任何 AI 都靠谱。</div>

下一讲（第05讲《循环：让程序不厌其烦地重复》），我们让程序学会“重复干同一件事”——比如让用户一直输入分数、连续判断好几个学生，而不用把代码复制好多遍。条件判断 + 循环，是几乎所有程序的两根顶梁柱，下一讲见。
