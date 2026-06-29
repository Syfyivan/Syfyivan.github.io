---
title: "《计算机基本功路线图 · 编程语言入门（Python）》第06讲 · 函数：把重复的活儿打包起来"
date: 2026-07-03 15:00:00
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

<div class="csf-key-note">一句话点题：<b>函数就是给一段会重复用的代码起个名字</b>。以后想用它，喊一声名字就行，不用每次都把那几行重抄一遍。你已经在用 <code>print()</code>、<code>input()</code>、<code>len()</code> 了——它们都是别人写好的函数。这一讲，我们来学怎么写<b>属于你自己</b>的函数。</div>

## 🎯 这一讲你会学到什么

上一讲（第05讲）我们学了循环，让程序不厌其烦地重复同一件事。但还有另一种"重复"循环管不了：<b>同一段逻辑，在程序的好几个地方都要用到</b>。比如"根据分数判断等级"这件事，可能在录入成绩时用一次，统计时又用一次，打印报告时再用一次。

总不能把那十几行 if-elif 抄三遍吧？抄三遍意味着：改一处规则，你得记得三个地方都改，漏一个就会出 bug（bug 是程序里的错误，俗称"虫子"，会让程序算错结果或干脆跑不起来）。<b>函数</b>就是来解决这个问题的。学完这一讲，你会：

- 用 <code>def</code> 定义自己的函数，把一段代码"打包"起来
- 让函数<b>接收参数</b>（把数据传进去）、<b>返回结果</b>（用 <code>return</code> 把答案传出来）
- 给参数设<b>默认值</b>，让函数用起来更省事
- 分得清函数<b>里面的变量</b>和<b>外面的变量</b>（局部 / 全局）
- 彻底搞懂一个新手必栽的坑：<b>print 不等于 return</b>

<div class="csf-note">这一讲的代码请<b>一行一行自己敲</b>。函数是编程里最基础也最核心的"零件"，肌肉记忆必须靠手练出来。<b>别让 AI 替你写这些示例</b>——你现在练的不是"完成任务"，是"看懂代码是怎么搭起来的"。AI 写的函数你将来天天都要 review（也就是逐行检查、判断它写得对不对），自己看不懂的话，就没法判断好坏了。</div>

## 🛠 跟我做

### 第一步：写出你的第一个函数 <span class="csf-b csf-core">必读</span>

打开你的编辑器，新建一个文件 <code>func.py</code>。我们先写一个最简单的函数——它不接收任何东西，也不返回任何东西，只负责打印一行招呼：

```python
def say_hello():
    print("你好，我是一个函数！")

# 上面只是“定义”，函数不会自己运行。
# 必须“调用”它，加上一对括号：
say_hello()
say_hello()
```

<b>先猜后做</b>：运行前先猜——屏幕上会打印几行？

.

.

.

揭晓：<b>两行</b>。定义函数（<code>def</code> 那几行）只是"写好说明书"，并不会执行里面的代码。只有当你<b>调用</b>它（写 <code>say_hello()</code>）时，里面的代码才真正跑一次。我们调用了两次，所以打印两行。

拆解一下这几个关键字：

<div class="csf-legend"><code>def</code> ：definition（定义）的缩写，告诉 Python“我要定义一个函数了”。<br><code>say_hello</code> ：函数的名字，你自己起，规则和变量名一样（小写、下划线连接）。<br><code>()</code> ：括号，里面放“参数”（这个函数暂时没有，所以空着）。<br><code>:</code> 和缩进 ：和 if、for 一样，冒号下面缩进的部分，才是函数的“身体”。</div>

### 第二步：让函数接收数据——参数 <span class="csf-b csf-core">必读</span>

只会打印固定一句话的函数没什么用。真正的威力在于：<b>你给它不同的输入，它干不同的活儿</b>。括号里的东西就叫<b>参数</b>（parameter），它就是函数对外开的"进料口"：

```python
def greet(name):
    print("你好，" + name + "！欢迎来学 Python")

greet("小明")
greet("小红")
greet("张老师")
```

<b>先猜后做</b>：这次会打印什么？

揭晓：

```text
你好，小明！欢迎来学 Python
你好，小红！欢迎来学 Python
你好，张老师！欢迎来学 Python
```

发生了什么？当你写 <code>greet("小明")</code> 时，字符串 <code>"小明"</code> 被<b>传进</b>函数，临时存进了那个叫 <code>name</code> 的参数里。函数体内一用到 <code>name</code>，就是用你这次传进来的值。下一次调用换成 <code>"小红"</code>，<code>name</code> 就变成 <code>"小红"</code>。<b>一个函数，喂不同的料，出不同的结果</b>——这就是函数好用的地方。

<div class="csf-note">术语小区分（不用背，混了回来看）：写在 <code>def</code> 后面的 <code>name</code> 叫<b>形参</b>（占位用的"形式参数"）；调用时真正传进去的 <code>"小明"</code> 叫<b>实参</b>（实际的值）。说人话：形参是空盒子，实参是往盒子里装的东西。</div>

### 第三步：让函数把答案交回来——return <span class="csf-b csf-key">重点</span>

到目前为止，我们的函数都只是<b>打印</b>。但很多时候，我们要的不是"打印出来给人看"，而是"算个结果，<b>交回给程序继续用</b>"。这就要靠 <code>return</code>。

来看一个算面积的函数：

```python
def area(width, height):
    result = width * height
    return result

# 把函数“交回来”的值接住，存进变量
room = area(3, 4)
print("房间面积是", room)
print("两个房间一共", area(3, 4) + area(2, 5))
```

<b>先猜后做</b>：第二行 print 会输出多少？

揭晓：<code>area(3, 4)</code> 算出 12，<code>area(2, 5)</code> 算出 10，加起来 <b>22</b>。

注意看 <code>return</code> 的妙处：它让 <code>area(3, 4)</code> 这个调用<b>本身就代表了一个值</b>（12）。所以你能把它存进变量、能让两个调用相加、能塞进 print——就像数字 12 能干的事，它都能干。这是 <code>print</code> 做不到的：<code>print</code> 只是把字显示在屏幕上，它<b>不会把值交回给程序</b>。

<div class="csf-note"><b>记住这句话，能省你将来无数小时：</b>print 是“说给人听”，return 是“交给程序”。屏幕上看到数字 ≠ 程序拿到了这个数字。这一讲的翻车现场会专门拿这个开刀。</div>

### 第四步：给参数设默认值 <span class="csf-b csf-key">重点</span>

有时候某个参数大多数情况都用同一个值，每次都写很烦。可以给它一个<b>默认值</b>：调用时不传，就用默认的；传了，就用你给的。

```python
def greet(name, greeting="你好"):
    print(greeting + "，" + name + "！")

greet("小明")              # 不传 greeting，用默认的“你好”
greet("小红", "早上好")    # 传了，就用“早上好”
```

<b>先猜后做</b>：两行分别打印什么？

揭晓：第一行 <code>你好，小明！</code>，第二行 <code>早上好，小红！</code>。带默认值的参数必须放在<b>没默认值的参数后面</b>（不然 Python 会犯迷糊，分不清你传的值对应谁），这点先记住，写错了它会直接报错提醒你。

### 第五步：动手练——把"成绩等级"改写成函数 <span class="csf-b csf-core">必读</span>

还记得第04讲我们写的"成绩等级"判断吗？当时是一长串 if-elif 直接摊在代码里，只能判断一个固定的分数。现在我们把它<b>打包成函数</b>：传进一个分数，返回对应的等级。<b>请自己一行一行敲下来</b>，敲完再运行：

```python
def grade_of(score):
    if score >= 90:
        return "A"
    elif score >= 80:
        return "B"
    elif score >= 60:
        return "C"
    else:
        return "D"

# 现在判断一堆不同的分数，一行一个，干净利落
print("95 分 ->", grade_of(95))
print("82 分 ->", grade_of(82))
print("60 分 ->", grade_of(60))
print("47 分 ->", grade_of(47))

# 还能用循环批量判断
for s in [100, 75, 88, 33]:
    print(s, "分的等级是", grade_of(s))
```

<b>先猜后做</b>：在运行之前，自己把这 8 个分数（95、82、60、47、100、75、88、33）的等级在纸上或心里写一遍，再运行对答案。

这里有个值得你停下来品一下的细节：函数里有<b>四个 return</b>，但每次调用<b>只会执行其中一个</b>。为什么？因为 <code>return</code> 一旦执行，函数<b>立刻结束、马上交出结果</b>，后面的代码根本不会再跑。所以 <code>grade_of(95)</code> 走到第一个 <code>return "A"</code> 就直接出来了，下面的 elif 看都不会看。

<div class="csf-note">体会一下打包成函数后的好处：假如学校把及格线从 60 改成 65，你<b>只要改函数里这一处</b>，所有用到 <code>grade_of</code> 的地方就全更新了。这就是"不要把同一段逻辑抄好几遍"的价值——这也是衡量一个程序写得好不好的重要标准之一。</div>

### 第六步：函数里的变量，出了门就没了——局部与全局 <span class="csf-b csf-skim">可跳读</span>

最后认识一个容易踩的概念。看这段：

```python
def add(a, b):
    total = a + b
    return total

print(add(3, 5))
print(total)   # 这一行会报错！
```

<b>先猜后做</b>：最后一行 <code>print(total)</code> 会怎么样？

揭晓：<b>报错</b>，<code>NameError: name 'total' is not defined</code>。因为 <code>total</code> 是在函数<b>里面</b>创建的，它叫<b>局部变量</b>——只在函数这个"房间"里存在，函数一结束（return 之后），它就被清掉了。外面的世界根本不认识 <code>total</code>。

这其实是<b>好事</b>：它意味着每个函数都是一个独立的小盒子，里面随便用什么变量名都不会污染外面。在函数外面定义的变量叫<b>全局变量</b>，函数内部可以"读"到它，但想"改"它需要特别声明（这部分初学阶段先不展开，知道有这回事即可）。

<details class="csf-fold"><summary>为什么函数要"自扫门前雪"？<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
想象你和十个同学合写一个大程序，每人写几个函数。如果函数里的变量都是全局共享的，那你随手起个 <code>i</code>、<code>temp</code>、<code>data</code>，很可能和别人撞名，互相把对方的值改乱，排查起来要命。<br>局部变量这个机制，等于给每个函数发了一间独立的工作室：你在里面怎么折腾都不影响隔壁。这是大型程序能由很多人协作、能维护下去的根基之一。等你以后写的程序变大，会越来越感激这个设计。</details>

## 💡 自己复述一遍

合上屏幕，用一句话回答：<b>函数是什么？参数和返回值分别干嘛的？</b>

参考答案（先自己说，再看）：函数是给一段重复用的代码起的名字，<b>参数</b>是从外面传数据<b>进去</b>的进料口，<b>return</b> 是把算好的结果<b>交回</b>给程序的出料口。如果你能顺口说出"print 是给人看、return 是给程序用"，那这一讲的精髓你抓住了。

## 🔧 翻车现场

### 翻车一：函数忘了 return，外面拿到的是 None <span class="csf-b csf-core">必读</span>

这是头号大坑。看这段，问题出在哪：

```python
def grade_of(score):
    if score >= 60:
        print("C")        # 错！这里是 print，不是 return
    else:
        print("D")

result = grade_of(80)
print("结果是：", result)
```

<b>先猜后做</b>：最后一行打印什么？

揭晓：

```text
C
结果是： None
```

第一行 <code>C</code> 是函数里那个 <code>print</code> 打的。但 <code>result</code> 却是 <code>None</code>！为什么？因为这个函数<b>只打印、没 return</b>。一个函数如果没有 <code>return</code>（或者 return 后面什么都不跟），Python 默认让它返回 <code>None</code>（表示"啥也没有"）。所以 <code>result</code> 接到的是 <code>None</code>，而不是 <code>"C"</code>。

<b>解法</b>：把函数里的 <code>print</code> 改成 <code>return</code>。记住这个判断方法：<b>如果你要把函数的结果存进变量、继续参与计算，函数里就必须用 return</b>；只有当你纯粹想在屏幕上显示一下时，才用 print。

### 翻车二：定义了函数却忘了调用 <span class="csf-b csf-key">重点</span>

```python
def say_hi():
    print("嗨！")

# 然后……就没有然后了，运行后屏幕一片空白
```

<b>原因</b>：<code>def</code> 只是"写好说明书"，不会自动执行。你必须在下面写一句 <code>say_hi()</code> 去<b>调用</b>它，里面的代码才会跑。新手常常写完函数就以为大功告成，运行后纳闷"怎么没反应"——八成是忘了调用。<b>解法</b>：定义之后，记得喊它的名字（加括号）。

### 翻车三：调用时括号或参数对不上 <span class="csf-b csf-skim">可跳读</span>

<code>greet</code> 需要一个参数 <code>name</code>，你却写成 <code>greet()</code>（没给名字），Python 会报错 <code>missing 1 required positional argument: 'name'</code>。<b>解法</b>：看报错里说缺哪个参数，就把它补上。报错信息其实很贴心地告诉了你缺什么——养成<b>读报错</b>的习惯，比瞎改强一百倍。

## ✅ 自检三问

1. <code>def greet(name)</code> 里的 <code>name</code> 叫什么？它在函数被调用之前有值吗？（提示：形参 / 空盒子）
2. 一个函数里写了 <code>print(x)</code> 但没写 <code>return</code>，外面 <code>y = 这个函数(...)</code> 之后，<code>y</code> 的值是什么？
3. 在函数里 <code>total = a + b</code>，函数外面能直接 <code>print(total)</code> 吗？为什么？

（答得磕巴的题，回正文对应小节再读一遍——别急着往下走。）

## 🚀 挑战

自己动手写一个函数 <code>bmi(weight, height)</code>：传入体重（公斤）和身高（米），<b>返回</b>（注意是 return，不是 print）BMI 值。计算公式是 <code>体重 ÷ (身高 × 身高)</code>。然后：

1. 调用它算出你自己的 BMI，用变量接住，再 print 出来。
2. 进阶：再写一个函数 <code>bmi_level(value)</code>，传入一个 BMI 值，返回 <code>"偏瘦" / "正常" / "偏胖"</code>（界限你自己定，比如低于 18.5 偏瘦、18.5~24 正常、高于 24 偏胖）。
3. 把两个函数<b>串起来</b>用：<code>print(bmi_level(bmi(60, 1.7)))</code>，看看一个函数的返回值怎么直接喂给另一个函数。

<div class="csf-note">这个挑战<b>务必自己写</b>，写不出来就回去重读"动手练"那节，别让 AI 代写。卡住了，可以问 AI"return 和 print 有什么区别"这类<b>原理问题</b>，但代码要从你自己手里敲出来。第 3 小问能跑通，说明你真的理解了"返回值"——这是很多人学完函数都没想明白的一步。</div>

## 📦 复制带走

<div class="csf-card"><b>这一讲，揣走这 4 条：</b><br>1. <b>函数 = 给重复的代码起名字</b>。用 <code>def 名字():</code> 定义，用 <code>名字()</code> 调用；定义不等于运行，必须调用才会执行。<br>2. <b>参数</b>是进料口（把数据传进去），<b>return</b> 是出料口（把结果交回给程序）。<br>3. <b>print ≠ return</b>：print 是说给人看，return 是交给程序用。要把结果继续拿来算，就必须 return；忘了 return，外面拿到的是 None。<br>4. 函数里创建的是<b>局部变量</b>，出了函数就消失——这是好事，让每个函数互不干扰。</div>

下一讲（第07讲）我们学<b>列表与字典</b>：到现在我们的变量都只能装一个值，可现实里数据常常是"一串"（一个班所有人的分数）或"一对一对"（名字配分数）。列表和字典就是用来装这些的，配上你已经会的循环和函数，你就能处理真正成批的数据了。下一讲见。
