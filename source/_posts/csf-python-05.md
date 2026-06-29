---
title: "《计算机基本功路线图 · 编程语言入门（Python）》第05讲 · 循环：让程序不厌其烦地重复"
date: 2026-07-03 14:00:00
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

<div class="csf-key-note">如果说上一讲的条件判断是让程序学会"看情况办事"，那这一讲的循环，就是让程序学会"重复地干同一件事而不喊累"。从 1 加到 100，人手算要几分钟，程序眨眼就出结果——靠的就是循环。这一讲我们只学两种循环：<b>for</b>（重复固定的次数）和 <b>while</b>（重复到某个条件不成立为止）。学会它们，你就拥有了让程序"自动反复跑"的能力。</div>

## 🎯 这一讲你会学到什么

- 用 **for 循环**把一件事重复做固定的次数，并看懂 **range()** 怎么生成一串数字
- 用 **while 循环**让程序"一直做，直到某个条件不成立"
- 用一个 **累加器变量**把每一轮的结果攒起来（比如求总和）
- 用 **break** 提前跳出循环、用 **continue** 跳过这一轮
- 亲手写出两个能跑的程序：从 1 加到 100，以及一个会提示"大了/小了"的猜数字游戏

<div class="csf-note">上一讲我们让程序学会了"如果……就……"。但条件判断只走一次。真正让程序变强的，是把判断放进循环里，让它一遍一遍地做、一遍一遍地判断。这一讲就是连接点。</div>

## 🛠 跟我做

### 为什么需要循环 <span class="csf-b csf-core">必读</span>

假设我要程序打印 3 行"你好"。不会循环的时候，你可能会这样写：

```python
print("你好")
print("你好")
print("你好")
```

3 行还行。那 100 行呢？1000 行呢？总不能复制粘贴 1000 次。**循环就是为了解决"重复"而生的**——你只写一遍要做的事，告诉程序"重复多少次"，剩下的它自己跑。

### for 循环：重复固定的次数 <span class="csf-b csf-key">重点</span>

先看最简单的写法。**先别运行，先猜：下面这段会打印几行、内容分别是什么？**

```python
for i in range(3):
    print("第", i, "次：你好")
```

<div class="csf-note">先在脑子里猜一个答案，再往下看揭晓。猜错没关系，猜错的地方正是你这一讲的收获点。</div>

揭晓——它会打印这三行：

```text
第 0 次：你好
第 1 次：你好
第 2 次：你好
```

两个最容易让新手愣住的点，我们拆开讲：

- **`range(3)` 生成的是 0、1、2，不是 1、2、3**。它从 0 开始，到 3 之前停，**不包含 3**。所以是 3 个数：0、1、2。
- **`i` 是个会变的变量**。循环每跑一轮，`i` 就自动换成下一个值。第一轮 `i` 是 0，第二轮是 1，第三轮是 2。这个 `i` 名字可以随便取（叫 `n`、`count` 都行），但习惯上用 `i`。

再把 `for` 这一行的结构说清楚：

```text
for  i  in  range(3) :
 │   │   │      │     │
 │   │   │      │     └─ 冒号，表示下面缩进的是"循环体"
 │   │   │      └─ 要一个一个取来用的那串东西（这里是 0、1、2）
 │   │   └─ 固定写法，读作"在……里面"
 │   └─ 循环变量，每轮自动取下一个值
 └─ 固定关键字
```

冒号下面那行**必须缩进**（一般是 4 个空格）。缩进的部分就是"每一轮要重复做的事"，这叫**循环体**。这和上一讲 `if` 的缩进是同一套规矩。

<div class="csf-note">"含头不含尾"是 range 的脾气，记死它：<code>range(3)</code> 是 0、1、2；<code>range(1, 5)</code> 是 1、2、3、4。后面那个数字永远取不到。这是新手算错次数的头号原因，本讲后面"翻车现场"还会专门再敲一遍。</div>

<details class="csf-fold"><summary>range 的三种写法<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
<div>range 可以给一个、两个、三个数字：<br>
· <code>range(5)</code> → 0,1,2,3,4（从 0 开始，到 5 之前）<br>
· <code>range(2, 6)</code> → 2,3,4,5（从 2 开始，到 6 之前）<br>
· <code>range(0, 10, 2)</code> → 0,2,4,6,8（第三个数是"步长"，每次加 2）<br>
现在只需记住前两种，第三种用到时再回来看。</div>
</details>

### 累加器：把每一轮的结果攒起来 <span class="csf-b csf-key">重点</span>

光重复打印没意思。循环真正有用，是配上一个**累加器变量**——先准备一个"罐子"，每跑一轮就往里加一点。

我们来完成本讲第一个动手练：**从 1 加到 100 的总和**。先猜：你觉得结果是多少？（提示：传说高斯小时候算过，答案是 5050。）现在我们让程序算给你看。

把下面这段存成 `sum100.py`，然后运行（怎么新建一个 `.py` 文件、保存在哪、怎么把它运行起来，如果忘了，回头翻前面"写下并运行第一个程序"那一讲，照着做一遍就行，别卡在"运行"这两个字上）：

```python
total = 0                # 累加器：先准备一个空罐子，从 0 开始
for i in range(1, 101):  # i 依次取 1,2,3,...,100（注意是 101 才能取到 100）
    total = total + i    # 每一轮把当前的 i 加进罐子
print("1 到 100 的总和是：", total)
```

运行结果：

```text
1 到 100 的总和是： 5050
```

这段代码有三个关键动作，请逐字看懂，别急着往下：

1. **`total = 0`**：循环开始**前**，先建好罐子。这一步必须在循环外面，否则每轮都被清零。
2. **`range(1, 101)`**：要加到 100，就得写 101（含头不含尾，101 取不到，正好停在 100）。
3. **`total = total + i`**：这行是核心。等号右边先算"旧的 total 加上现在的 i"，算完再塞回 total。所以 total 像滚雪球一样越来越大。

<div class="csf-note">看不懂 <code>total = total + i</code> 的话，把它读成"<b>新的 total，等于 旧的 total 加上 i</b>"。等号在编程里不是"相等"，是"把右边算出来的值，存进左边"。这一点上一讲讲过，这里再用一次。</div>

想看清楚雪球怎么滚大的，可以临时把 print 挪进循环里观察（先猜：它会打印多少行？）：

```python
total = 0
for i in range(1, 6):    # 先用小范围 1 到 5，方便观察
    total = total + i
    print("加到", i, "时，total =", total)
```

它会打印 5 行，你能亲眼看到 total 一步步变成 1、3、6、10、15。**先用小数据看懂过程，再放大到 100**——这是"调试"的好习惯，记下来。（调试，就是程序没按你预期跑的时候，你一步一步去检查、找出哪里出了错的过程。新手最常用的调试办法，就是像这样多加几行 print，把中间结果打出来看一眼。）

<div class="csf-note">这两段代码请你<b>亲手一个字一个字敲一遍</b>，不要复制，更不要让 AI 替你写。循环的"肌肉记忆"就是靠这种笨功夫练出来的。AI 能秒写出求和代码，但如果你自己没敲过、没看着 total 滚大过，将来它写错一个边界你都看不出来。</div>

### while 循环：做到条件不成立为止 <span class="csf-b csf-core">必读</span>

for 适合"我知道要重复几次"。但有时候你**不知道要重复几次**——比如猜数字，玩家可能 1 次猜中，也可能猜 8 次。这种"做到满足某个条件为止"的场景，用 **while**。

while 的读法是"**只要……就一直做**"：

```python
count = 1
while count <= 3:           # 只要 count 小于等于 3，就一直循环
    print("这是第", count, "次")
    count = count + 1       # 关键！每轮让 count 长大一点
print("循环结束")
```

先猜它打印什么，再运行。揭晓：

```text
这是第 1 次
这是第 2 次
这是第 3 次
循环结束
```

while 的工作流程是这样的：每次准备开跑前，**先检查条件**（`count <= 3`）。成立就跑一轮循环体，跑完回到开头**再检查**；一旦条件不成立，立刻跳出，去执行循环后面的代码。

<div class="csf-note"><b>那行 <code>count = count + 1</code> 是 while 的命门。</b>它让 count 每轮增长，最终突破 3 让条件变假，循环才停得下来。如果忘了写它，count 永远是 1，条件永远成立，程序就<b>永远跑不完</b>——这就是传说中的"死循环"。后面翻车现场细说，先记住：<b>while 里一定要有"能让条件最终变假"的那一步</b>。</div>

### break 和 continue：循环的两个"遥控键" <span class="csf-b csf-key">重点</span>

循环跑起来后，还有两个能中途插手的关键字：

- **`break`**：立刻**跳出整个循环**，后面几轮都不跑了。
- **`continue`**：跳过**这一轮剩下的代码**，直接进入下一轮。

看个对比，先猜各自打印什么：

```python
# break：找到 3 就停
for i in range(1, 10):
    if i == 3:
        break
    print(i)
# 打印 1、2（到 3 就跳出，3 都没打印）

print("---")

# continue：遇到 3 就跳过，别的照打
for i in range(1, 6):
    if i == 3:
        continue
    print(i)
# 打印 1、2、4、5（独独漏掉 3）
```

记忆口诀：**break 是"我不玩了，整个停掉"；continue 是"这一局跳过，下一局继续"**。猜数字游戏里我们会用 break——猜中了就没必要再循环。

### 动手练：猜数字游戏 <span class="csf-b csf-core">必读</span>

现在把这一讲的东西全用上，写一个真能玩的小游戏。规则：程序心里有个数，你来猜，猜大了它说"大了"，猜小了说"小了"，直到猜中为止。

把下面这段存成 `guess.py` 再运行。**强烈建议你边敲边想每一行在干嘛**：

```python
answer = 42                          # 程序心里想的数（先固定成 42，方便测试）
count = 0                           # 累加器：记录猜了几次

while True:                         # True 永远成立，靠里面的 break 来结束
    guess = int(input("猜一个数字（1-100）："))   # 读入并转成整数
    count = count + 1              # 猜的次数加一

    if guess < answer:
        print("小了，再大一点")
    elif guess > answer:
        print("大了，再小一点")
    else:
        print("猜对啦！你一共猜了", count, "次")
        break                      # 猜中了，跳出循环，游戏结束
```

玩一局可能是这样的（`>` 后面是你输入的）：

```text
猜一个数字（1-100）：50
大了，再小一点
猜一个数字（1-100）：25
小了，再大一点
猜一个数字（1-100）：42
猜对啦！你一共猜了 3 次
```

这段代码里有几个新组合，逐个说明：

- **`while True:`** 是个常用套路。`True` 永远成立，所以循环本身不会自己停，**全靠里面的 `break` 来结束**。这正适合"不知道要猜几次"的场景。
- **`int(input(...))`**：`input` 读进来的永远是文字（哪怕你输的是数字），必须用 `int()` 转成整数，才能和 `answer` 比大小。这点前面讲输入输出时埋过伏笔，这里就是它派上用场的地方。
- **`count` 又是个累加器**：和求和那个罐子一模一样的思路，只不过这次攒的是"次数"。

<div class="csf-note">这个游戏请你<b>自己独立写完整</b>，别让 AI 代写。可以先把上面的看懂、关掉，再凭理解默写一遍。卡住了，去翻前面的 for/while 例子，而不是直接问 AI 要答案。<b>自己跌跌撞撞写出来的第一个"会和人互动"的程序，价值远大于 AI 给你的一百行完美代码。</b></div>

<details class="csf-fold"><summary>想让答案每次都不一样？<span class="csf-b csf-skip">选学</span></summary>
<div>把固定的 <code>answer = 42</code> 换成随机数，游戏才好玩。在文件最上面加一行 <code>import random</code>，再把那行改成 <code>answer = random.randint(1, 100)</code>，程序就会在 1 到 100 里随机想一个数。<code>import</code> 是"借用别人写好的工具箱"，后面讲模块时会专门讲，现在照抄能用即可。</div>
</details>

## 💡 自己复述一遍

合上屏幕，用一句话回答：**for 和 while 各自适合什么时候用？**

参考答案（先自己说，再对）：**次数已知用 for（配 range 数着来），次数未知、靠条件停的用 while（记得让条件最终能变假）。** 如果还能补一句"累加器要在循环外先建好、break 提前跳出、continue 跳过一轮"，那你这一讲就吃透了。

## 🔧 翻车现场

### 翻车一：while 死循环，程序卡住不动 <span class="csf-b csf-core">必读</span>

最经典的错误，几乎人人踩过：

```python
count = 1
while count <= 3:
    print("第", count, "次")
    # 糟糕！忘了写 count = count + 1
```

`count` 永远是 1，`count <= 3` 永远成立，程序会**无穷无尽地打印**，屏幕刷个不停。

- **原因**：while 的条件变量没被更新，条件永远为真。
- **解法**：检查 while 循环体里，**有没有那一步能让条件最终变假**（通常是 `count = count + 1` 这类）。写 while 时，先问自己一句："它靠什么停下来？"
- **急救**：万一真跑成死循环，在**终端**里按 **Ctrl + C** 强制中断程序。（终端，就是你前面运行 `.py` 文件、敲命令的那个命令行窗口——通常是个黑底白字的框框。点一下它让它处于选中状态，再按 Ctrl + C，程序就会被掐断。）

### 翻车二：range 边界算错，少一次或多一次 <span class="csf-b csf-key">重点</span>

想从 1 加到 100，却写成了：

```python
for i in range(1, 100):   # 错！这只到 99
    total = total + i
```

结果会少加一个 100，答案变成 4950，而不是 5050。

- **原因**：忘了 range **含头不含尾**，`range(1, 100)` 最大只到 99。
- **解法**：要包含 100，就写 `range(1, 101)`。**记法：尾巴数字要比你想要的最后一个数大 1。**
- **自查小技巧**：拿不准时，用小范围试一下，比如 `for i in range(1, 4): print(i)`，亲眼看它打印 1、2、3，边界感就有了。

### 翻车三：缩进错乱，循环体范围不对 <span class="csf-b csf-skim">可跳读</span>

```python
total = 0
for i in range(1, 101):
    total = total + i
print("中间值", total)        # 这行没缩进，在循环外面，只打印一次
```

新手常以为 print 在循环里（每轮打印），其实它顶格写、在循环**外面**，只会在循环全跑完后打印一次。

- **原因**：缩进决定了"谁在循环体里"。缩进的归循环管，顶格的不归。
- **解法**：想让某行每轮都执行，就让它和循环体对齐缩进；想让它跑完再执行，就顶格写。多用编辑器自带的缩进，别手敲空格手敲错。

## ✅ 自检三问

1. `range(2, 7)` 会生成哪几个数字？（不确定就写一行 `for i in range(2, 7): print(i)` 验证）
2. while 循环要靠什么才能停下来？如果不小心写成死循环，在终端里按什么键能中断它？
3. break 和 continue 的区别是什么？猜数字游戏里猜中后，用的是哪一个、为什么？

（答得磕巴的题，回到对应小节再读一遍——这比往下赶进度有用得多。）

## 🚀 挑战

给你三个小任务，从易到难，**全部自己写、不要让 AI 代笔**：

1. **基础**：用 for 循环只把 1 到 100 里的**偶数**加起来，打印总和。（提示：可以用 `range` 的第三个参数当步长，或者在循环里用上一讲的 `if` 判断。）
2. **进阶**：给猜数字游戏加一个"最多只能猜 5 次"的限制，超过 5 次还没猜中就提示"游戏结束，正确答案是 XX"。（提示：while 条件里同时盯住"次数"和"是否猜中"。）
3. **挑战**：写个"99 乘法表"，打印出 `1×1=1`、`1×2=2`……一直到 `9×9=81`。这题需要**一个循环套一个循环**，正文还没演示过，下面专门给你搭个梯子。

做完第 1 题就已经很棒了。第 3 题我们一步步来。

"一个循环套一个循环"听着唬人，其实就是：在一个循环的循环体里面，再放一个完整的循环。外层每跑一轮，里层就会**从头到尾整个跑一遍**。先看一个最简单的，打印一个 3×3 的小方阵：

```python
for row in range(1, 4):          # 外层：管"行"，跑 1、2、3 共 3 行
    for col in range(1, 4):      # 内层：管"列"，每一行里都从头跑 1、2、3
        print("*", end=" ")      # end=" " 让它们打在同一行、用空格隔开
    print()                      # 内层跑完一行后，换个行（这行属于外层）
```

它会打印：

```text
* * * 
* * * 
* * * 
```

看懂这个套路，99 乘法表就是把里面的 `*` 换成 `行×列=结果`：外层 `for` 跑 1 到 9（管行），里层再放一个 `for` 跑 1 到 9（管列），里层每轮打印一个 `行×列=积`，里层跑完一轮就 `print()` 换行。卡住很正常，照着上面的小方阵改，慢慢拼。

## 📦 复制带走

<div class="csf-card">
<b>本讲要装进脑子的 4 件事：</b><br>
1. <b>for 数着来</b>：次数已知用 for + range，牢记 range <b>含头不含尾</b>，要到 100 就写 range(1, 101)。<br>
2. <b>while 靠条件停</b>：次数未知用 while，循环体里<b>必须有让条件最终变假的那一步</b>，否则死循环（急救按 Ctrl+C）。<br>
3. <b>累加器先建后用</b>：求和、计次都靠一个变量，<b>在循环外先建好（=0），循环里一轮一轮往里加</b>。<br>
4. <b>break/continue 是遥控键</b>：break 整个跳出、continue 跳过这一轮；猜数字猜中后用 break 结束游戏。<br>
下一讲我们学<b>函数</b>——把这种反复要写的活儿（比如"问玩家要一个数"）打包成一个能反复调用的"工具"，让代码更干净、更好改。
</div>
