---
title: "《计算机基本功路线图 · 编程语言入门（Python）》第08讲 · 字符串处理：切割、查找、替换、排版"
date: 2026-07-03 17:00:00
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

<div class="csf-key-note">文字是程序里最常见的数据：用户输入的名字、从文件读出来的一行、网页上抓下来的内容，全是字符串。<br>这一讲就教你把一段文字"拿在手里翻来覆去地处理"——切一段出来、按符号拆开、查里面有没有某个词、把脏东西擦掉、再排成你想要的样子。学完它，你处理文字就像切菜一样顺手。</div>

上一讲我们学了列表和字典——成串的数据和成对的数据。这一讲我们回到第02讲就见过的老朋友：字符串。只不过这次，我们要真正把它"拆开揉碎"地用起来。

## 🎯 这一讲你会学到什么

- 用**索引和切片**从一段文字里取出某个字符、某一段。
- 用 **split / join** 把一行文字按符号拆成几块，或者反过来拼回去。
- 用 **strip / replace / lower** 把文字洗干净、换内容、统一大小写。
- 用 **in / find** 判断"这段文字里有没有某个词"，以及它在第几个位置。
- 用 **f-string** 把变量塞进文字里，排成整整齐齐的输出。
- 搞懂一个关键事实：**字符串是不可变的**——你不能改它里面的某个字，只能造一个新的。

## 🛠 跟我做

下面每一段都建议你**亲手敲进去跑一遍**。先在脑子里猜结果，再按回车看真相。光看不敲，等于没学。

### 1. 索引：取出某一个字 <span class="csf-b csf-core">必读</span>

字符串里每个字符都有一个编号，叫**索引**，从 **0** 开始数。注意是从 0，不是从 1，这是初学者最容易卡住的地方。

```python
word = "Python"
print(word[0])   # 第 1 个字符
print(word[1])   # 第 2 个字符
print(word[-1])  # 倒数第 1 个字符
```

先猜：`word[0]` 会打印什么？是 `P` 还是 `y`？

揭晓：`word[0]` 是 `P`（第一个字符就是 0 号），`word[1]` 是 `y`，`word[-1]` 是最后一个 `n`。**负数索引从右边数**，`-1` 就是最后一个，很方便。

<div class="csf-note">记住这张图，把 "Python" 拆开看：<br>字符：　P　y　t　h　o　n<br>正索引：0　1　2　3　4　5<br>负索引：-6 -5 -4 -3 -2 -1<br>取一个字符用 <code>word[编号]</code>，编号必须在范围内，超出去就会报错。</div>

### 2. 切片：取出一整段 <span class="csf-b csf-core">必读</span>

只取一个字不够用，更多时候我们要取"一段"。这就是**切片**，写法是 `字符串[起点:终点]`。

```python
word = "Python"
print(word[0:3])   # 从 0 号取到 3 号之前
print(word[2:])    # 从 2 号一直到结尾
print(word[:3])    # 从开头取到 3 号之前
print(word[:])     # 整个复制一份
```

先猜：`word[0:3]` 是 `Pyt` 还是 `Pyth`？

揭晓：是 `Pyt`。切片有一条铁律——**包含起点，不包含终点**（数学上叫"左闭右开"）。`[0:3]` 取的是 0、1、2 号，正好三个字符，到 3 号就停，不含 3 号。

<div class="csf-note">为什么"不含终点"反而方便？因为 <code>word[0:3]</code> 的长度正好就是 <code>3 - 0 = 3</code>，一眼能算出取了几个。而且 <code>word[:3]</code> 和 <code>word[3:]</code> 拼起来正好是完整的原串，不重不漏。习惯了你会觉得很顺。</div>

<details class="csf-fold"><summary>切片还能跳着取（带步长）<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
切片其实有第三个参数，叫步长：<code>字符串[起点:终点:步长]</code>。<br><code>"Python"[::2]</code> 每隔一个取一个，结果是 <code>Pto</code>；<code>"Python"[::-1]</code> 步长为 -1，等于把整个字符串倒过来，结果是 <code>nohtyP</code>。倒序这招在面试里常被拿来考"怎么反转字符串"，记一下没坏处，但主线先把正常切片用熟。</details>

### 3. 字符串不可变：一个必须先知道的坑 <span class="csf-b csf-key">重点</span>

很多人学完索引，第一反应是"那我能不能改其中一个字？"比如把 "Python" 的首字母改成 "J"。试试看：

```python
word = "Python"
word[0] = "J"   # 想把 P 改成 J
print(word)
```

先猜：这能成功吗？

揭晓：**会报错**，错误信息是 `TypeError: 'str' object does not support item assignment`。意思是字符串**不支持给某一项重新赋值**。

这就是 Python 里一个重要规则：**字符串是不可变的（immutable）**。一旦造出来，就不能就地修改里面的内容。那想要"改"怎么办？答案是——**造一个新的**：

```python
word = "Python"
new_word = "J" + word[1:]   # 拿 J 拼上原串从 1 号往后的部分
print(new_word)             # Jython
print(word)                 # 原来的 word 没变，还是 Python
```

<div class="csf-why">为什么 Python 要把字符串设计成不可变？一个直观的好处是"安全"：你把一个字符串传给别的函数，不用担心它被偷偷改掉。代价是每次"修改"其实都生成了新字符串。现在你只要记住结论：<b>想改字符串，就用切片、replace、拼接等方式造一个新的，再赋值回去</b>。</div>

### 4. split 和 join：拆开与拼回 <span class="csf-b csf-core">必读</span>

`split` 是这一讲的主角之一。它能把一行文字**按某个符号拆成一个列表**（列表是上一讲学的）：

```python
line = "苹果,香蕉,橙子"
fruits = line.split(",")   # 按逗号拆
print(fruits)              # ['苹果', '香蕉', '橙子']
print(fruits[1])           # 香蕉
```

反过来，`join` 能把一个列表**用某个符号拼成一整行**：

```python
fruits = ["苹果", "香蕉", "橙子"]
line = " / ".join(fruits)   # 用 " / " 把它们连起来
print(line)                 # 苹果 / 香蕉 / 橙子
```

<div class="csf-note"><code>join</code> 的写法有点反直觉：是"连接符".join(列表)，连接符在前、用点号去调用。读成"用这个符号把这一串东西串起来"就顺了。注意列表里必须都是字符串，否则会报错。</div>

### 5. strip / replace / lower：把文字洗干净 <span class="csf-b csf-key">重点</span>

真实世界的文字往往很脏：前后有空格、有换行、大小写不统一。这三个方法专治这些：

```python
text = "  Hello World  "
print(text.strip())            # 去掉两头的空格："Hello World"
print(text.replace("o", "0"))  # 把所有 o 换成 0
print(text.lower())            # 全部变小写
print(text.upper())            # 全部变大写
```

先猜：`text.replace("o", "0")` 之后，原来的 `text` 变了吗？

揭晓：**没变**。还记得"字符串不可变"吗？`replace`、`strip`、`lower` 这些方法**都不会改原字符串，而是返回一个新的**。所以你想保留结果，必须用变量接住它：

```python
text = "  Hello World  "
text.strip()          # 这一行算了个新串，但没人接，白算了
print(text)           # 还是 "  Hello World  "，两头空格还在

clean = text.strip()  # 用 clean 接住结果
print(clean)          # "Hello World"
```

<div class="csf-note">这是新手第二个高频翻车点：以为 <code>text.strip()</code> 会把 text 本身改掉。记住口诀——<b>字符串的方法都是"返回新值"，必须用变量接住才有用</b>。</div>

### 6. in 和 find：里面有没有、在哪儿 <span class="csf-b csf-key">重点</span>

判断"一段文字里有没有某个词"，用 `in`，结果是 `True` 或 `False`（第04讲的布尔值）：

```python
sentence = "我今天学了 Python"
print("Python" in sentence)   # True
print("Java" in sentence)     # False
```

如果还想知道"它在第几个位置"，用 `find`，它返回**第一次出现的索引**；找不到就返回 `-1`：

```python
sentence = "我今天学了 Python"
print(sentence.find("Python"))   # 返回它出现的起始位置
print(sentence.find("Java"))     # 找不到，返回 -1
```

<div class="csf-why">判断"有没有"用 <code>in</code>（简洁、读起来像英语），需要"在哪儿"才用 <code>find</code>。别用 <code>find(...) == -1</code> 这种写法去判断有没有——能用 <code>in</code> 就用 <code>in</code>，可读性更好。</div>

### 7. f-string：把变量排进文字里 <span class="csf-b csf-core">必读</span>

到这里你可能想问：怎么把变量和文字拼成一句话输出？最好用的工具叫 **f-string**。做法是：在字符串引号前加一个字母 **f**，然后在字符串里用**花括号 `{}`** 把变量括起来：

```python
name = "小明"
age = 18
print(f"我叫{name}，今年{age}岁")   # 我叫小明，今年18岁
```

花括号里不止能放变量，还能放表达式（表达式就是一段会算出结果的算式，像 `price * count` 这种，Python 会先把它算出来再填进去）：

```python
price = 5
count = 3
print(f"总共 {price * count} 元")   # 总共 15 元
```

先猜：如果忘了写那个 `f`，会怎样？

揭晓：花括号会被**原样打印**出来，变成 `我叫{name}，今年{age}岁`——一字不差地把花括号和变量名都印出来了。这是新手第三个高频坑：**忘写 f**。所以看到输出里出现了花括号，第一反应就是"f 漏了"。

<details class="csf-fold"><summary>f-string 还能控制对齐和小数位<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
在花括号里变量后面加冒号，可以排版：<br><code>f"{name:>6}"</code> 表示右对齐占 6 格，<code>f"{name:&lt;6}"</code> 左对齐；<br><code>f"{3.14159:.2f}"</code> 表示保留 2 位小数，结果是 <code>3.14</code>。<br>这些在打印表格、对齐金额时很有用，但主线你先把"变量塞进花括号"这件事用熟，对齐留到需要时再查。</details>

### 8. 综合动手练：拆名片 <span class="csf-b csf-core">必读</span>

现在把这一讲的招式串起来，做一个真能跑的小程序。需求：用户输入一行 `姓名,电话` 格式的文字，程序把它拆成两部分，再排成 `姓名：xxx 电话：xxx` 输出。

**这段请你自己动手敲，别让 AI 代写。** 这是本讲的核心练习，亲手敲一遍，split 和 f-string 才会真正长进你手里。

```python
# 1. 读入一行，格式形如：小明,13800001234
raw = input("请输入 姓名,电话：")

# 2. 先把两头可能多打的空格擦掉
raw = raw.strip()

# 3. 按逗号拆成两块
parts = raw.split(",")
name = parts[0]
phone = parts[1]

# 4. 用 f-string 排成想要的样子
#    注意 {name} 和「电话」之间我打了一个空格，用来把姓名和电话隔开，普通空格就行
print(f"姓名：{name} 电话：{phone}")
```

先猜：如果你输入 `小明,13800001234`，输出会是什么？

揭晓：`姓名：小明 电话：13800001234`（小明和「电话」之间就是那个用来隔开的空格）。跑通之后，试着输入别的名字和号码，确认它每次都拆得对。

<div class="csf-note">想让程序更稳，可以在第 4 步前对 name 和 phone 也各做一次 <code>.strip()</code>，这样即使用户在逗号后面多打了空格（比如 <code>小明, 138...</code>），号码前也不会带空格。这一步留给你自己加，加完跑一遍验证。</div>

## 💡 自己复述一遍

合上屏幕，用一句话说出来：**字符串可以按索引取字、按符号拆开和拼回、查里面有没有某个词、把脏东西洗掉，但它本身不可变——所有"修改"都是造一个新串，要用变量接住；最后用 f-string 把变量塞进花括号排成想要的样子。**

说不顺也没关系，回去把对应那一节再敲一遍。能讲出来，才算真的会了。

## 🔧 翻车现场

<div class="csf-card"><b>翻车 1：想直接改字符串里的某个字</b><br>写了 <code>word[0] = "J"</code>，报错 <code>'str' object does not support item assignment</code>。<br><b>原因：</b>字符串不可变。<br><b>解法：</b>用切片拼一个新的，比如 <code>"J" + word[1:]</code>，再赋值回去。</div>

<div class="csf-card"><b>翻车 2：方法调用了，结果却没变</b><br>写了 <code>text.strip()</code> 然后发现 text 还是带空格。<br><b>原因：</b><code>strip / replace / lower</code> 都返回新串，不改原串，你没接住返回值。<br><b>解法：</b>用变量接住：<code>text = text.strip()</code> 或 <code>clean = text.strip()</code>。</div>

<div class="csf-card"><b>翻车 3：f-string 忘写 f，或花括号里放错东西</b><br>输出里赫然出现 <code>{name}</code> 这种花括号，或者报 <code>NameError</code>。<br><b>原因：</b>引号前漏了 <code>f</code>；或者花括号里写成了字符串 <code>{"name"}</code> 而不是变量 <code>{name}</code>。<br><b>解法：</b>确认引号前有 <code>f</code>；花括号里放变量名或表达式，不要加引号。</div>

<div class="csf-card"><b>翻车 4：split 之后取错了索引（也就是前面说的位置编号）</b><br>拆完用 <code>parts[1]</code> 报 <code>IndexError: list index out of range</code>。<br><b>原因：</b>输入里压根没有那个逗号，<code>split</code> 没拆出第二块，列表只有一个元素。<br><b>解法：</b>先确认输入格式对；进阶可以判断 <code>len(parts)</code> 够不够再取，这是后面"防崩溃"会细讲的。</div>

## ✅ 自检三问

1. `"Python"[1:4]` 的结果是什么？为什么不是 4 个字符？（说出"左闭右开"这条规则）
2. 执行 `text.replace("a", "b")` 之后，原来的 `text` 会变吗？想保留结果该怎么写？
3. 下面这行为什么会把花括号原样打印出来，怎么修？`print("我叫{name}")`

三问都能不查资料答上来，就可以进下一讲了。答不上来的那条，回去把对应小节再敲一遍。

## 🚀 挑战

在"拆名片"程序的基础上，自己加两个功能，**全程自己写，卡住了让 AI 给提示而不是给答案**：

1. 让用户一次输入**多张名片**，每张之间用分号 `;` 隔开，比如 `小明,138...;小红,139...`。提示：先用 `split(";")` 拆成多张，再对每一张 `split(",")`，配合上一讲学的 `for` 循环逐张处理。
2. 把电话号码**中间四位打码**成 `*`，输出 `138****1234` 这种形式。提示：电话是字符串，用切片取前 3 位和后 4 位，中间拼上 `"****"`。

做完跑几组不同输入，确认它都对。这两个小功能把切片、split、for、f-string 全用上了，做出来你就真的把这一讲消化了。

## 📦 复制带走

<div class="csf-card">1. <b>索引从 0 开始，切片左闭右开</b>：<code>s[0]</code> 是第一个字符，<code>s[a:b]</code> 取 a 到 b 之前，长度正好是 b-a；负数从右边数。</div>

<div class="csf-card">2. <b>字符串不可变</b>：不能 <code>s[0]="x"</code>。所有"修改"（replace / strip / lower / 切片拼接）都返回新串，<b>必须用变量接住</b>才生效。</div>

<div class="csf-card">3. <b>拆开用 split，拼回用 join，找词用 in/find</b>：<code>line.split(",")</code> 拆成列表，<code>"符号".join(列表)</code> 拼回字符串，<code>"词" in 文本</code> 判断有没有。</div>

<div class="csf-card">4. <b>排版用 f-string</b>：引号前加 <code>f</code>，变量放进 <code>{}</code>。漏了 f 就会把花括号原样打印——这是最常见的错。</div>

下一讲我们学**文件读写**：把这一讲处理好的文字真正**存进文件**，下次再**读回来**——你的程序终于能"记住东西"了。
