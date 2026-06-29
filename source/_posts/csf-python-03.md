---
title: "《计算机基本功路线图 · 编程语言入门（Python）》第03讲 · 输入与输出：让程序和人对话"
date: 2026-07-03 12:00:00
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

<div class="csf-key-note">到现在为止，你的程序还是"自言自语"：你在代码里写死了数据，它照着算、照着打印。这一讲要让它学会一件大事——<b>和人对话</b>。它能停下来问你一句话，等你敲键盘回答，再根据你的回答做事。这是程序从"演示"走向"工具"的第一步。<br>但这一步有个全 Python 新手都会栽的坑，藏在一句话里：<b>input() 拿到的，永远是字符串</b>。这一讲我们就把它讲透、踩明白。</div>

## 🎯 这一讲你会学到什么

- 用 `print()` 把信息显示给人看，并学会它的两个小开关：`sep` 和 `end`。
- 用 `input()` 让程序停下来，接收用户从键盘敲进来的内容。
- 牢牢记住一条铁律：**`input()` 的结果永远是字符串**，哪怕你输入的是数字。
- 用 `int()` / `float()` 把"看起来像数字的字符串"转成真正能做算术的数字。
- 把上面几样拼起来，亲手写出一个会问年龄、能算"明年几岁"的小程序。

<div class="csf-note">上一讲（第02讲）我们认识了四种基础类型，其中就有字符串（str）和整数（int）。这一讲你会真切地感受到：<b>分清类型不是为了考试，而是因为搞错了类型，程序当场就会出问题。</b>那一讲埋的伏笔，这一讲要兑现了。</div>

## 🛠 跟我做

### 先把 print 用顺手 <span class="csf-b csf-core">必读</span>

前两讲你已经用过 `print()`，但它其实比你想的能干。先看最普通的用法：

```python
print("你好，世界")
print("我", "在", "学", "Python")
```

**先猜一下**：第二行有四个用逗号隔开的词，打印出来它们之间会有什么？挤在一起，还是中间有空格？

揭晓：

```
你好，世界
我 在 学 Python
```

第二行每个词之间**自动加了一个空格**。这是 `print` 默认的行为：用逗号传多个东西给它，它会用一个空格把它们连起来。这个"用什么连"是可以改的，开关叫 `sep`（separator，分隔符的意思）：

```python
print("2026", "07", "03", sep="-")
print("a", "b", "c", sep="")
```

**先猜后看**，结果是：

```
2026-07-03
abc
```

第一行用 `-` 当分隔符，正好拼成了一个日期的样子；第二行 `sep=""` 是空字符串，等于"什么都不加"，于是三个字母紧紧贴在一起。

还有一个开关叫 `end`，它管的是"这一句打印完，结尾放什么"。默认情况下每个 `print` 打印完会换行——其实就是因为 `end` 默认是一个换行符。我们把它改掉看看：

```python
print("第一句", end="")
print("第二句")
print("A", end=" -> ")
print("B", end=" -> ")
print("C")
```

**先猜**：前两句会各占一行，还是连在一起？

揭晓：

```
第一句第二句
A -> B -> C
```

因为第一个 `print` 的 `end` 被改成了空字符串，它打印完不换行，第二句就直接接在后面了。后面三行用 `end=" -> "`，于是 A、B、C 被串成了一条线。

<div class="csf-why">为什么要花力气讲 sep 和 end？因为它们能让你<b>精确控制输出长什么样</b>，而不是只会一行一个。等你以后打印表格、进度、菜单，这两个小开关会反复用到。现在不用背，知道"有这么回事、能改"就够了。</div>

### input()：让程序停下来听你说 <span class="csf-b csf-key">重点</span>

`print` 是程序"说"，`input` 是程序"听"。当 Python 执行到 `input()` 时，它会**停在那里、等你敲键盘**，直到你按下回车，它才把你输入的内容交还给程序。

和第01讲一样，新建一个文件 `talk.py`：用你的代码编辑器（比如 VS Code）新建一个文件，把它保存到一个你自己记得住的文件夹里（比如桌面上专门建的 `python练习` 文件夹），文件名写成 `talk.py`。这里的 `.py` 是 Python 文件的"姓"，电脑看到这个结尾就知道"这是一段 Python 代码"。然后在里面敲下面这两行（**这段请自己一个字一个字敲，别复制，更别让 AI 替你生成**——你要的是手感）：

```python
name = input("请输入你的名字：")
print("你好，" + name + "！很高兴认识你。")
```

接下来要运行它。我们需要用到**终端**——终端就是一个能让你打字给电脑下命令的黑框框窗口（Windows 上它叫"命令提示符"或"PowerShell"，Mac 上就叫"终端 / Terminal"，打开方法和第01讲一样）。

打开终端后，还有关键一步：要让终端"走进"你刚才存 `talk.py` 的那个文件夹，否则它会找不到这个文件。简单说就是**确保终端当前所在的文件夹里，就有 `talk.py` 这个文件**（第01讲讲过怎么用 `cd` 命令进入文件夹；如果用 VS Code，直接在它内置的终端里打开这个文件夹会更省事）。然后敲：

```
python talk.py
```

（如果你用的是 Mac，这条命令可能要写成 `python3 talk.py`。）

程序会先打印"请输入你的名字："然后**卡住不动**——这不是死机，是它在等你。你敲个名字，比如 `小满`，回车：

```
请输入你的名字：小满
你好，小满！很高兴认识你。
```

成了。几个要点你要看清楚：

- `input("请输入你的名字：")` 括号里的那句话，叫**提示语**，会先打印出来告诉用户该输入什么。可以写，也可以留空写成 `input()`，但留空用户会一脸懵，所以**养成写提示语的习惯**。
- 你敲进去的东西，被 `input()` "交还"出来，我们用 `name =` 把它**存进了变量**（这就是第02讲的"给数据起名字"）。
- `"你好，" + name + "！"` 这里的 `+` 是把几个字符串**拼接**成一个长字符串。注意 `name` 是变量名，不加引号；而 `"你好，"` 是写死的文字，要加引号。

<div class="csf-note"><b>拼接的小提醒：</b>用 <code>+</code> 拼字符串时，空格和标点不会自动出现，全得你自己写进引号里。想让"你好"和名字之间有个空格，就得写成 <code>"你好， " + name</code>。程序一丝不苟，你给什么它拼什么。</div>

### 那条铁律：input() 给你的永远是字符串 <span class="csf-b csf-core">必读</span>

现在到了这一讲最重要的地方。我们做个小实验，让程序把你输入的东西的"类型"也告诉你（`type()` 能查一个数据是什么类型，第02讲见过）：

```python
age = input("请输入你的年龄：")
print("你输入的是：", age)
print("它的类型是：", type(age))
```

运行，输入 `18`，回车。**先猜**：`18` 是个数字，那 `type(age)` 会告诉你它是 int（整数）吗？

揭晓：

```
请输入你的年龄：18
你输入的是： 18
它的类型是： <class 'str'>
```

`<class 'str'>` ——是**字符串**（str），不是整数！

这就是铁律：**`input()` 不管你敲的是字母、汉字还是数字，拿回来的一律是字符串。** 在它眼里，你敲的 `18` 不是"十八这个数"，而是"字符 1 和字符 8 排在一起"这么一串文字。这一点不记牢，下面马上就要翻车。

### 用 int() 把字符串变回数字 <span class="csf-b csf-key">重点</span>

既然 `input()` 给的是字符串，可我们又想拿年龄去算"明年几岁"，要做加法。怎么办？把它**转换**成真正的数字。负责把"看起来像整数的字符串"转成整数的，就是 `int()`：

```python
age_text = input("请输入你的年龄：")
age = int(age_text)
print("它现在的类型是：", type(age))
```

运行输入 `18`，这次 `type(age)` 会显示 `<class 'int'>`——变成真整数了，能做算术了。

<div class="csf-note"><code>int()</code> 转整数（如 18），<code>float()</code> 转带小数的数（如 1.75 的身高、3.5 的评分）。需要小数就用 <code>float()</code>，否则用 <code>int()</code>。第02讲分的那两种数字类型，这里就用上了。</div>

### 动手练：写一个"问年龄"小程序 <span class="csf-b csf-core">必读</span>

把这一讲学的全拼起来，做一个能用的小程序。**这段是本讲的主菜，请务必自己敲、自己跑，遇到报错也先自己读报错再说——别一报错就丢给 AI。** 新建 `age.py`：

```python
# 1. 问用户年龄，input 拿回来的是字符串
age_text = input("请输入你的年龄：")

# 2. 把字符串转成整数，这样才能做加法
age = int(age_text)

# 3. 算出明年的年龄
next_age = age + 1

# 4. 把结果告诉用户
print("明年你就", next_age, "岁了！")
```

**先猜**：你输入 `17`，最后一行会打印出什么？

运行 `python age.py`，输入 `17`：

```
请输入你的年龄：17
明年你就 18 岁了！
```

读懂了它，你就同时用上了这一讲的全部知识点：`input` 接收输入、铁律意识到结果是字符串、`int()` 转换、算术、`print` 输出。这就是一个**真正会和人对话的程序**了。

<details class="csf-fold"><summary>想再进一步：能不能不用中间变量，一行搞定？<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
可以把"接收输入"和"转成整数"套在一起写：<code>age = int(input("请输入你的年龄："))</code>。它的执行顺序是<b>从里往外</b>：先 <code>input(...)</code> 拿到字符串，再交给外面的 <code>int(...)</code> 转成整数，最后存进 <code>age</code>。这种写法更短，老手很常用。<br>但对现在的你，我更建议先用分开两步的写法（先 <code>age_text =</code>，再 <code>age = int(...)</code>）。因为分开写时，万一出错你能一眼看出是哪一步坏了；套在一起写一旦报错，新手往往看不出问题在里层还是外层。<b>等你顺手了，再合并不迟。</b></details>

## 💡 自己复述一遍

合上屏幕，用一句话回答：**`input()` 给我的是什么类型？如果我要拿它做加法，得先做哪一步？**

（如果你能脱口而出"是字符串，要先用 `int()` 转成整数"，这一讲最硬的核你就拿下了。）

## 🔧 翻车现场

**翻车一：忘了转换，直接拿 input 的结果做加法。** <span class="csf-b csf-core">必读</span>

这是本讲点名的头号坑，几乎每个新手都踩过。比如你这么写：

```python
age = input("请输入你的年龄：")
print("明年你就", age + 1, "岁了！")
```

输入 `17`，回车，程序当场报错：

```
TypeError: can only concatenate str (not "int") to str
```

**原因**：`age` 是字符串 `"17"`，你让一个字符串去 `+ 1`（一个整数）。Python 一脸困惑："字符串只能和字符串拼，你给我个整数让我怎么办？"于是罢工报错。`TypeError` 就是"类型用错了"的意思。
**解法**：在做加法前，先 `age = int(age)` 把它转成整数。**先转换，再算术。**

**翻车二：更隐蔽的一种——没报错，但结果离谱。**

如果你写的不是加法而是拼接，比如把两个输入"加"起来：

```python
a = input("第一个数：")
b = input("第二个数：")
print(a + b)
```

输入 `2` 和 `3`，**先猜**结果是 5 吗？运行你会看到打印的是 `23`！因为两个都是字符串，`+` 不是相加而是**拼接**，`"2"` 接上 `"3"` 就成了 `"23"`。这种坑不报错，更阴险——程序不崩，但答案是错的。**解法**：`int(a) + int(b)`，先各自转成整数再相加，才会得到 5。

**翻车三：给 int() 喂了它转不了的东西。**

```python
age = int(input("请输入你的年龄："))
```

如果用户输入的是 `十八` 或者 `abc` 或者直接回车，程序会报错 `ValueError: invalid literal for int()`。**原因**：`int()` 只能转"长得就像整数的字符串"，`"十八"` 它不认识。现在你只要**知道有这种情况**就好；怎么优雅地应对用户乱输入，是第04讲（条件判断）和后面"错误处理"要解决的事，别急。

## ✅ 自检三问

1. 不查资料，说出 `input()` 返回值的类型是什么。
2. 下面这行为什么会报错，怎么改才对？`print(input("身高：") + 10)`
3. `print("a", "b", "c", sep="@", end="!")` 会打印出什么？（先猜，再去运行验证。）

## 🚀 挑战

自己动手，写一个 `next_year.py`：

- 问用户的名字（字符串，不用转换）。
- 问用户今年读大几（输入数字，比如 `1`）。
- 算出明年读大几，打印一句完整的话，比如：`小满，明年你就读大2了！`

**加一点难度**：再问一个带小数的——比如身高（用 `float()` 转），然后打印"你比 1.5 米高出 X 米"。

提示：名字不需要转换，年级和身高需要转换，而且年级用 `int()`、身高用 `float()`。**整个过程自己写、自己调，卡住了先读报错信息**——报错信息就是 Python 在跟你说话，读懂它本身就是这一讲的修行。

## 📦 复制带走

<div class="csf-card"><b>这一讲装进脑子的四件事：</b><br>1. <b>铁律</b>：<code>input()</code> 拿回来的永远是字符串，哪怕你输入的是数字。<br>2. <b>转换</b>：要做算术，先用 <code>int()</code>（整数）或 <code>float()</code>（小数）把字符串转成数字——<b>先转换，再算术</b>。<br>3. <b>输出</b>：<code>print</code> 用逗号传多个值会自动加空格；<code>sep</code> 改分隔符，<code>end</code> 改结尾（默认是换行）。<br>4. <b>看懂报错</b>：<code>TypeError</code> 多半是类型用错了，<code>ValueError</code> 多半是 <code>int()</code> 收到了转不了的内容——报错不可怕，它在帮你定位问题。</div>

下一讲（第04讲《条件判断：让程序学会"看情况办事"》），我们要让程序不再"照单全收"，而是能根据用户输入的不同**做出不同的反应**——比如年龄小于 18 就提示"未成年"。到那时，你这一讲写的对话程序，就真正活起来了。
