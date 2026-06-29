---
title: "《计算机基本功路线图 · 编程语言入门（Python）》第02讲 · 变量与类型：给数据起名字、分清四种基础类型"
date: 2026-07-03 11:00:00
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

<div class="csf-key-note">上一讲我们让电脑说出了第一句话。但那句话是写死的——程序里写了什么，它就只会说什么。今天我们让程序学会一件大事：<b>把数据存起来、起个名字，以后随时叫得出、改得动</b>。这就是「变量」。学会它，你的程序才算从「念稿子」变成了「会记事」。</div>

## 🎯 这一讲你会学到什么

- 什么是「变量」，为什么写程序离不开它；
- 一个等号 `=` 到底在干什么（它不是数学里的「等于」）；
- 四种最常用的数据类型：整数 `int`、小数 `float`、字符串 `str`、布尔 `bool`；
- 用 `type()` 亲手看出每个数据是什么类型；
- 给变量起名字的规则，以及新手最容易踩的几个坑。

学完你会写一个小程序：把一个人的姓名、年龄、身高、是否学生这四样信息存进变量，全部打印出来，再逐个打印它们的类型。这是后面所有程序的地基，咱们慢慢来，不赶。

## 🛠 跟我做

### 先认识：变量就是一个贴了标签的盒子 <span class="csf-b csf-core">必读</span>

想象桌上有个盒子，你往里放了数字 `18`，然后在盒子上贴了张标签写着 `age`。以后你只要喊一声 `age`，电脑就知道你说的是盒子里那个 `18`。

把这件事写成代码，就是一行：

```python
age = 18
```

读法是：「把 `18` 这个值，装进名叫 `age` 的盒子里」。

<div class="csf-note">注意读的方向：<b>从右往左</b>。先有右边的 <code>18</code>，再把它放进左边的 <code>age</code>。这个 <code>=</code> 叫「赋值」，意思是「把右边的东西赋给左边的名字」，不是数学课上「两边相等」的那个等号。这是新手最容易绕进去的第一个坎，记牢它。</div>

放进去之后，盒子随时能打开看，也能换里面的东西：

```python
age = 18
print(age)      # 打开盒子看看：18

age = 20        # 把盒子里的东西换成 20
print(age)      # 再看看：20
```

**先猜后做**：上面这段，屏幕会打出几行？分别是什么？心里先有个答案，再去跑。

跑出来是两行：先 `18`，后 `20`。第二次赋值把盒子里的旧值盖掉了——变量的「变」就在这儿，它的值是可以变的。

### 四种最常用的类型 <span class="csf-b csf-key">重点</span>

盒子里能装的东西不止数字。Python 里数据分很多「类型」，刚入门你先把这四种认全就够用很久了：

<div class="csf-legend"><b>int（整数）</b>：没有小数点的数，比如 <code>18</code>、<code>0</code>、<code>-7</code>。<br><b>float（小数）</b>：带小数点的数，比如 <code>1.75</code>、<code>3.14</code>、<code>0.0</code>。<br><b>str（字符串）</b>：一段文字，必须用引号包起来，比如 <code>"小明"</code>、<code>'你好'</code>。<br><b>bool（布尔）</b>：只有两个值，<code>True</code>（真）和 <code>False</code>（假），用来表示「是/否、对/错」。</div>

几个一上来就要记住的细节：

- 字符串两边的**引号是必须的**。单引号 `'...'` 和双引号 `"..."` 都行，但要成对，左边用什么右边就用什么。
- `"18"` 是字符串，`18` 是整数。**长得像，但根本不是一回事**——一个是「写着 18 的纸条」，一个是「真正的数字 18」。后面翻车现场会专门让你看它俩的区别。
- 布尔的 `True` / `False` **首字母必须大写**，而且不加引号。写成 `true` 或 `"True"` 都不对。

### 动手写：把一个人的信息存起来 <span class="csf-b csf-core">必读</span>

现在把四种类型凑齐，写一个完整的小程序。新建一个文件叫 `person.py`，一行一行**自己敲**进去（别复制，敲一遍手会记住）：

```python
# 用四个变量存一个人的信息
name = "小明"          # str：姓名，文字要加引号
age = 18               # int：年龄，整数
height = 1.75          # float：身高，带小数点
is_student = True      # bool：是否学生，True 或 False

# 把它们都打印出来
print(name)
print(age)
print(height)
print(is_student)
```

**先猜后做**：运行前先猜，这四行 `print` 会打出什么？尤其是最后一行——会打 `True` 还是 `"True"` 还是别的？猜完再跑。

现在去运行它。终端就是上一讲那个能敲命令的黑窗口（Mac 用「终端 Terminal」，Windows 用「命令提示符」或「PowerShell」）。打开它，先用 `cd` 命令进入 `person.py` 所在的文件夹（比如文件放在桌面，就敲 `cd Desktop`），再输入下面这行回车：

```bash
python person.py
```

（如果忘了怎么打开终端、怎么进文件夹，回看上一讲「跑通第一个程序」那一节，照着再做一遍就行。）

你会看到：

```text
小明
18
1.75
True
```

注意最后一行是 `True`，没有引号——因为它本来就是布尔值，不是文字。

### 用 type() 看清每个变量是什么类型 <span class="csf-b csf-key">重点</span>

光看值还不够，咱们让 Python 亲口告诉你每个变量是什么类型。工具就是 `type()`，把变量放进它的括号里，它就报出类型。继续在 `person.py` 末尾加上：

```python
print(type(name))         # 猜猜是什么类型？
print(type(age))
print(type(height))
print(type(is_student))
```

**先猜后做**：四行分别会报哪种类型？把你的四个答案写在纸上再运行。

再跑一次 `python person.py`，新增的四行会输出：

```text
<class 'str'>
<class 'int'>
<class 'float'>
<class 'bool'>
```

`<class 'str'>` 的意思就是「这是一个 str（字符串）类型」，前面那串 `<class ...>` 是 Python 的固定说法，你只要看引号里的词：`str`、`int`、`float`、`bool`，一一对上了，恭喜，四种类型你已经能亲眼分辨了。

<div class="csf-note">这一段务必<b>自己敲、自己跑、自己核对猜测</b>，别让 AI 替你写或替你解释。能分清类型，是后面调 bug（bug 就是程序里的毛病、错误；调 bug 就是把这些毛病找出来、修好它）的核心本事——很多报错的根子，就是「你以为是数字，其实是字符串」。这种判断力只能靠自己手上练出来，AI 替你跑一遍，你的手是不会记住的。</div>

<details class="csf-fold"><summary>为什么 Python 不用我提前声明类型？<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
有些语言（比如 Java、C）要求你写变量时就先说清「这是个整数」。Python 不用——你写 <code>age = 18</code>，它自己看右边是 <code>18</code>，就明白 <code>age</code> 是整数；你改成 <code>age = "十八"</code>，它又自动认成字符串。这叫「动态类型」，好处是省事、上手快，代价是<b>类型错误要等到运行时才暴露</b>，不会提前拦你。所以新手更要养成用 <code>type()</code> 随手确认的习惯，别等程序崩了才发现类型搞错了。这个点现在了解即可，不必深究。</details>

## 💡 自己复述一遍

合上屏幕，用一句话说清楚：**变量是什么？一个等号在做什么？四种基础类型分别叫什么？** 能顺畅说出来，这一讲的骨架你就立住了。说不利索也没关系，回头再看一眼上面的盒子比喻。

## 🔧 翻车现场

<div class="csf-card"><b>翻车一：变量名用中文，或者以数字开头</b><br>这里有两种情况，分开说：<br>① 数字开头的名字，比如 <code>1age = 18</code>，运行会直接报 <code>SyntaxError</code>（语法错误，意思是这行写法不合规矩，程序根本跑不起来）；<br>② 中文名字，比如 <code>年龄 = 18</code>，在新版 Python 里其实能跑，但<b>不推荐</b>——换台电脑或换个环境容易出问题，别人和 AI 看你的代码也更费劲。所以养成习惯，变量名一律用英文。<br><b>规则</b>：变量名只能用<b>字母、数字、下划线</b>，且<b>不能以数字开头</b>，中间不能有空格。<code>age</code>、<code>my_age</code>、<code>age2</code> 都行；<code>2age</code>、<code>my age</code> 不行。<br><b>建议</b>：起英文名、用下划线连接多个词（如 <code>is_student</code>），这是 Python 的通行习惯，也能让 AI 和别人更容易看懂你的代码。</div>

<div class="csf-card"><b>翻车二：把 = 当成「相等判断」</b><br>初学者常把 <code>age = 18</code> 读成「age 等于 18 吗」。不对，它是「把 18 装进 age」。真正问「相不相等」用的是两个等号 <code>==</code>，那是后面讲条件判断时的事。现在你只要死记：<b>一个 = 是赋值（往盒子里放），两个 == 才是判断相等</b>。</div>

<div class="csf-card"><b>翻车三：字符串和数字直接相加</b><br>试试运行 <code>print("年龄" + 18)</code>，会报错：<code>TypeError: can only concatenate str (not "int") to str</code>。<br><b>原因</b>：Python 不知道你想干嘛——是把它俩拼成文字 <code>"年龄18"</code>，还是做别的？文字和数字是两种类型，不能直接用 <code>+</code> 凑一起。<br><b>解法</b>：要么把数字转成文字再拼，<code>print("年龄" + str(18))</code>，得到 <code>年龄18</code>；要么干脆用逗号交给 print 分开打，<code>print("年龄", 18)</code>，得到 <code>年龄 18</code>。<br>这个错你一定要<b>亲手触发一次</b>，看清报错长什么样——以后再遇到 <code>TypeError</code>，你就认得它了。</div>

## ✅ 自检三问

1. `=` 和 `==` 有什么区别？各自是干什么的？
2. `18` 和 `"18"` 分别是什么类型？怎么用一行代码验证你的判断？
3. 下面这两个变量名，哪个会报错，为什么：`user_name = "小红"` 和 `2nd_name = "小刚"`？

三问都能不查资料答上来，就可以进下一讲了。

## 🚀 挑战

给你自己布置个小任务，全程**自己写，不许让 AI 代写**：

> 用变量存下**你自己**的四样信息——名字、今年多少岁、身高（米，带小数）、是不是学生。先把四个变量都 `print` 出来，再用 `type()` 把四个类型都打出来。**运行前，先把每个 `type()` 的结果猜在纸上**，跑完对一对，看全不全中。

进阶一点（想挑战再做）：故意写一行 `print("我今年" + age)`（假设 `age` 是整数），让它报错；然后用今天学的两种办法各修一次，让它正常打出「我今年18岁」之类的话。能自己制造 bug 又自己修好，你就真的懂了。

## 📦 复制带走

<div class="csf-card"><b>变量 = 贴了标签的盒子</b>：<code>名字 = 值</code>，把右边的值装进左边的名字，以后用名字就能取出来、也能改。<br><b>= 是赋值，不是相等</b>：一个 <code>=</code> 往盒子里放东西；判断相等是后面才学的 <code>==</code>。<br><b>四种基础类型</b>：<code>int</code> 整数、<code>float</code> 小数、<code>str</code> 字符串（要加引号）、<code>bool</code> 布尔（<code>True</code>/<code>False</code>，大写不加引号）；用 <code>type(变量)</code> 随手确认。<br><b>命名规则</b>：只用字母/数字/下划线，不能以数字开头、不能用中文、不能有空格；推荐英文小写加下划线。</div>

下一讲（第03讲《输入与输出：让程序和人对话》），我们让程序不再只会自言自语——它会停下来等你输入，再根据你输入的内容回应你。到时候你存进变量的，就不再是写死的值，而是用户现场敲进来的。咱们下讲见。
