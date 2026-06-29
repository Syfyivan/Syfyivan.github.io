---
title: "《计算机基本功路线图 · 编程语言入门（Python）》第07讲 · 列表与字典：成串的数据和成对的数据"
date: 2026-07-03 16:00:00
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

<div class="csf-key-note">到现在为止，一个变量只装一个值：一个名字、一个数字。可现实里的数据总是成堆出现——一串待办事项、一桌子学生的成绩、一个人的全部资料。这一讲我们认识两种最常用的"容器"：<b>列表（list）</b>装"一串"，<b>字典（dict）</b>装"一对一对的"。学会它们，你才真正开始处理"成规模的数据"，而不是一个一个变量地堆。</div>

## 🎯 这一讲你会学到什么

- 用**列表**把一串数据装进一个变量里，并通过**索引**取出第几个
- 给列表**加一项（append）、删一项（remove）**，用 **len()** 数有多少个
- 用**字典**存"键→值"的成对数据（比如 姓名→张三、年龄→18）
- 用 **in** 判断"某个东西在不在里面"，避免直接撞上报错
- 用 **for 循环遍历**列表和字典，把每一项挨个处理一遍
- 看穿三个新手必踩的坑：索引越界、边遍历边删、访问不存在的键

<div class="csf-note">这一讲是后面所有"小程序"的地基。第08讲处理字符串、再往后把数据存进文件，靠的都是列表和字典撑着。所以这一讲的代码，<b>每一行都自己敲一遍</b>，别复制，更别让 AI 替你写——手指记住的东西，脑子才真记得住。</div>

## 🛠 跟我做

打开你的编辑器，新建一个文件 `lesson07.py`，跟着一步步来。每段代码我们都先**猜结果**，再运行揭晓。

### 一、列表：装"一串"东西 <span class="csf-b csf-core">必读</span>

列表就是用**方括号 `[]`** 把一串值括起来，中间用逗号隔开。它有顺序——第 1 个、第 2 个、第 3 个，记得清清楚楚。

```python
todos = ["买菜", "写作业", "洗碗", "遛狗", "睡觉"]
print(todos)
print(len(todos))
```

先猜：`len(todos)` 会打印几？

运行后你会看到第二行是 `5`。`len()` 是"length（长度）"的缩写，它数的是**里面有几项**。这里有 5 件事，所以是 5。记住这个 5，下面马上要用。

### 二、索引：取出"第几个" <span class="csf-b csf-key">重点</span>

想拿出列表里的某一项，用 `列表[编号]`。**关键的关键：编号从 0 开始，不是从 1。**

```python
todos = ["买菜", "写作业", "洗碗", "遛狗", "睡觉"]
print(todos[0])
print(todos[1])
print(todos[4])
```

先猜：`todos[0]` 是"买菜"还是"写作业"？

运行揭晓：`todos[0]` 是**"买菜"**，也就是第一项。第二项要写 `todos[1]`。所以最后一项不是 `todos[5]`，而是 `todos[4]`——因为 5 件事的编号是 0、1、2、3、4。

<div class="csf-note">为什么从 0 开始？这是计算机的老传统，几乎所有编程语言都这样。你可以这么记：编号是"距离开头有多远"，第一项离开头 0 步，所以是 0。<b>5 个元素，最大编号是 4</b>（也就是 长度减 1）——这句话请刻在脑子里，它能帮你躲开本讲最大的坑。</div>

Python 还有个贴心写法：用 `-1` 表示**倒数第一个**，不用先去数长度。

```python
todos = ["买菜", "写作业", "洗碗", "遛狗", "睡觉"]
print(todos[-1])
print(todos[-2])
```

`todos[-1]` 是"睡觉"（最后一项），`todos[-2]` 是"遛狗"（倒数第二）。

<details class="csf-fold"><summary>切片：一次取一段<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
除了取一个，还能用 <code>列表[起:止]</code> 取一段，这叫<b>切片</b>。规则是"包头不包尾"：从"起"开始，取到"止"之前。<br><br>
<code>todos[0:2]</code> 取的是编号 0 和 1，也就是 <code>["买菜", "写作业"]</code>——注意编号 2 那项不包括在内。<code>todos[1:3]</code> 是 <code>["写作业", "洗碗"]</code>。冒号前后还能省略：<code>todos[:2]</code> 表示从头取到编号 2 之前，<code>todos[2:]</code> 表示从编号 2 一直取到末尾。切片现在先了解，后面处理字符串时还会再见到它。
</details>

### 三、增和删：往列表里加一项、删一项 <span class="csf-b csf-core">必读</span>

列表是"活"的，可以随时改。最常用两个动作：

- **加一项**：`列表.append(新东西)`，加在末尾（append 就是"追加"）
- **删一项**：`列表.remove(要删的东西)`，按内容删

```python
todos = ["买菜", "写作业", "洗碗", "遛狗", "睡觉"]

todos.append("浇花")
print(todos)
print(len(todos))

todos.remove("洗碗")
print(todos)
print(len(todos))
```

先猜：两次 `len()` 分别是几？

运行揭晓：`append` 之后变 6（末尾多了"浇花"），`remove` 之后又变回 5（"洗碗"被删掉了）。注意 `remove` 删的是**内容**——你告诉它删"洗碗"，它去找到"洗碗"那一项删掉，而不是按编号删。

<div class="csf-note">小提醒：<code>append</code> 一次只加<b>一个</b>东西。如果你写 <code>todos.append("浇花", "拖地")</code> 会报错。要加两个就 append 两次。另外，<code>remove</code> 如果列表里<b>没有</b>你要删的那项，会直接报错——后面"翻车现场"会教你怎么先用 <code>in</code> 检查一下。</div>

### 四、字典：装"一对一对"的东西 <span class="csf-b csf-core">必读</span>

列表适合"一串同类"的东西（一串待办、一串成绩）。但有时候数据是**成对**的：姓名对应张三，年龄对应 18，城市对应北京。这时候用**字典**最顺手。

字典用**花括号 `{}`**，里面是一对一对的 `键: 值`，键和值用冒号连，对与对之间用逗号隔开。

```python
person = {"姓名": "张三", "年龄": 18, "城市": "北京"}
print(person)
print(person["姓名"])
print(person["年龄"])
```

先猜：`person["姓名"]` 会打印什么？

运行揭晓：打印 `张三`。**字典靠"键"取值**，不像列表靠编号。你给它键 `"姓名"`，它把对应的值 `"张三"` 还给你。这就像查字典：你按词条（键）去查，查到释义（值）。

<div class="csf-note">"键值对"这个词拆开看就懂：<b>键（key）</b>是你用来查的那个词，<b>值（value）</b>是查出来的内容。字典里键不能重复（一个词条只能有一个释义），但值可以重复。键通常用字符串，值什么都行——数字、字符串，甚至是另一个列表。</div>

改值和加新的一对，写法一模一样，都是 `字典[键] = 值`：

```python
person = {"姓名": "张三", "年龄": 18, "城市": "北京"}

person["年龄"] = 19
person["爱好"] = "篮球"
print(person)
```

先猜：`person["年龄"]` 还在不在？"爱好"会被加进去吗？

运行揭晓：`"年龄"` 的值从 18 变成了 19（键已存在，就是**改**），`"爱好"` 是新键，于是**加**了进去。规则很简单：**键已经有了就覆盖旧值，键没有就新增一对**。

### 五、in 判断：先问"在不在" <span class="csf-b csf-key">重点</span>

`in` 用来问一句"某个东西在不在容器里"，结果是 `True` 或 `False`（还记得第03讲讲过的布尔值吗）。

```python
todos = ["买菜", "写作业", "洗碗"]
print("写作业" in todos)
print("健身" in todos)

person = {"姓名": "张三", "年龄": 18}
print("年龄" in person)
print("身高" in person)
```

注意：对**列表**，`in` 查的是**里面有没有这个值**；对**字典**，`in` 查的是**有没有这个键**（不是值）。所以 `"年龄" in person` 是 `True`，但如果你写 `18 in person` 反而是 `False`——因为 18 是值不是键。

这个判断超级有用，是后面避免程序崩溃的护身符。

### 六、遍历：把每一项挨个处理 <span class="csf-b csf-core">必读</span>

光会取第几个还不够，更多时候我们想**把每一项都过一遍**——这叫"遍历"，用第05讲学过的 `for` 循环。

遍历列表：

```python
todos = ["买菜", "写作业", "洗碗"]
for item in todos:
    print("待办：", item)
```

`item` 是你随便起的名字，循环会让它依次变成"买菜""写作业""洗碗"，每变一次跑一遍里面的代码。先猜会打印几行？——3 行。

遍历字典稍有不同。直接 `for k in person` 拿到的是**键**，再用 `person[k]` 取值：

```python
person = {"姓名": "张三", "年龄": 18, "城市": "北京"}
for k in person:
    print(k, "：", person[k])
```

运行揭晓，你会看到整整齐齐三行：

```text
姓名 ： 张三
年龄 ： 18
城市 ： 北京
```

<details class="csf-fold"><summary>更顺手的 items() 写法<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
上面用 <code>person[k]</code> 再取一次值，有点绕。Python 提供了 <code>.items()</code>，能一次把键和值都拿到：<br><br>
<code>for k, v in person.items():</code><br>
<code>&nbsp;&nbsp;&nbsp;&nbsp;print(k, "：", v)</code><br><br>
效果完全一样，但更清爽。同理还有 <code>.keys()</code>（只要键）和 <code>.values()</code>（只要值）。现在两种写法你用哪个都行，看懂就够了。
</details>

### 七、串起来：一个能用的小练习 <span class="csf-b csf-key">重点</span>

把上面的零件拼起来。下面这段就是本讲的核心动手练——**用列表管理待办、用字典打印个人资料**。请自己敲完、运行，看结果对不对：

```python
# 第一部分：用列表管理 5 件待办
todos = ["买菜", "写作业", "洗碗", "遛狗", "睡觉"]
print("原始待办，共", len(todos), "件：")
for item in todos:
    print(" -", item)

# 加一项
todos.append("浇花")
# 删一项（先检查在不在，避免报错）
if "洗碗" in todos:
    todos.remove("洗碗")

# 下面这句开头的 \n 是一个换行记号（详见代码后的说明）
print("\n调整后，共", len(todos), "件：")
for item in todos:
    print(" -", item)

# 第二部分：用字典存一个人的资料并整齐打印
person = {"姓名": "张三", "年龄": 18, "城市": "北京"}
print("\n个人资料：")
for k in person:
    print(k, "：", person[k])
```

<div class="csf-note">敲到 <code>"\n调整后……"</code> 这里先别懵：<code>\n</code>（一个反斜杠加一个字母 n）是一个<b>特殊记号，表示"换行"</b>，作用是让这一行输出之前先空一行，看起来更清爽。它不是打错了，也不要原样去打"反斜杠 n"那几个字符——就照着 <code>\n</code> 敲进字符串里即可。为什么两个字符能代表换行、还有哪些类似记号，下一讲讲字符串时会细说，现在知道"它能空行"就够了。</div>

先猜：调整后还剩几件待办？

运行揭晓：原来 5 件，加了"浇花"变 6，删了"洗碗"变 5——所以还是 **5 件**，但内容不一样了。个人资料则整整齐齐打印三行。

<div class="csf-note">看到那句 <code>if "洗碗" in todos:</code> 了吗？这就是把 <code>in</code> 当护身符用：<b>先确认它在，再删</b>，这样哪怕哪天列表里没有"洗碗"，程序也不会崩，只是安静地跳过。这个"先检查再动手"的习惯，后面会救你很多次。</div>

## 💡 自己复述一遍

合上屏幕，用一句话说出来：**列表用方括号装一串、靠从 0 开始的编号取；字典用花括号装一对对、靠键取；两者都能加、删、用 in 查、用 for 遍历。** 能说清这一句，这一讲的骨架你就拿住了。

## 🔧 翻车现场

<div class="csf-why"><b>翻车一：索引越界——列表明明有 5 项，<code>列表[5]</code> 却报错。</b><br>报错信息长这样：<code>IndexError: list index out of range</code>。原因就是开头反复强调的：编号从 0 开始，5 个元素的编号是 0~4，<b>最大编号是 长度减 1</b>。<code>列表[5]</code> 指向的是"第 6 个"，根本不存在。<br>解法：要最后一项，写 <code>列表[-1]</code> 最稳，永远不会数错。</div>

<div class="csf-why"><b>翻车二：边遍历边删——循环里 remove，结果删漏了或报错。</b><br>比如有一个列表 <code>nums = ["买菜", "睡觉", "买菜", "洗碗"]</code>，你想把里面所有的"买菜"都删掉，于是一边遍历一边删：<br><br><code>nums = ["买菜", "睡觉", "买菜", "洗碗"]</code><br><code>for x in nums:</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;if x == "买菜":</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;nums.remove(x)</code><br><br>你会发现有些"买菜"没删干净。原因：你正一边读列表一边改它，删掉一个后，后面的元素会"往前挪一位"，可循环的指针还继续往后走，于是<b>跳过了刚挪上来的那一项</b>。<br>解法：别在遍历原列表时改它。最朴素、只用已学语法的办法是<b>先把要删的收集到另一个列表里，循环结束后再删</b>：<br><br><code>to_delete = []</code><br><code>for x in nums:</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;if x == "买菜":</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;to_delete.append(x)</code><br><code>for x in to_delete:</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;nums.remove(x)</code><br><br>这样遍历的时候没动原列表，就不会漏。（补充：以后你还会见到一种一行写完的简洁写法 <code>nums = [x for x in nums if x != "买菜"]</code>，它叫"列表推导式"，下一讲会细讲，现在看个意思就行，不必现在掌握。）</div>

<div class="csf-why"><b>翻车三：访问不存在的键——直接 <code>person["身高"]</code> 报 KeyError。</b><br>报错：<code>KeyError: '身高'</code>。字典里压根没有"身高"这个键，硬取就崩。<br>解法一：先用 <code>in</code> 问一句 <code>if "身高" in person:</code> 再取。<br>解法二：用 <code>person.get("身高")</code>，键不存在时它返回 <code>None</code> 而不报错。这里的 <code>None</code> 是 Python 里表示"空、什么都没有"的一个特殊值，打印出来就显示成 <code>None</code>——它<b>不是报错</b>，程序会照常往下走，只是告诉你"这个键没有对应的内容"。你还能给 <code>get</code> 一个默认值 <code>person.get("身高", "未知")</code>，这样没有这个键时它就返回"未知"而不是 <code>None</code>。处理别人给的、不确定有没有的数据时，<code>get</code> 特别保命。</div>

## ✅ 自检三问

1. 一个有 6 个元素的列表，合法的编号范围是多少？想取最后一个，最稳的写法是什么？
2. 列表用什么取元素、字典用什么取元素？两者分别用什么符号括起来（`[]` 还是 `{}`）？
3. 为什么删字典里某个键之前，最好先用 `in` 检查一下？不检查会发生什么？

（答不上来别急，翻回对应小节再看一遍——能自己找回答案，比记住答案更重要。）

## 🚀 挑战

给自己写一个**"通讯录"小练习**，全程自己敲，别让 AI 代写：

1. 用一个**列表**存 3 个联系人，每个联系人是一个**字典**（含"姓名""电话"两个键）。提示：列表里可以装字典，比如 `contacts = [{"姓名": "张三", "电话": "111"}, ...]`。
2. 用 `for` 遍历这个列表，把每个人整齐打印成"张三 - 111"的样子。
3. 用 `append` 加一个新联系人，再打印一遍，确认多了一个。
4. 进阶：写一句判断，如果某个人的字典里没有"邮箱"这个键，就打印"（无邮箱）"，有就打印邮箱——用上 `in` 或 `.get()`。

卡住了，先回到"跟我做"里找最像的那段抄思路，而不是问 AI 要现成答案。**真正学会的标志，是你能盯着报错把它改对**，这正是下一讲（字符串处理）和再往后做小程序时你最需要的能力。

## 📦 复制带走

<div class="csf-card">
<b>一、列表装"一串"，编号从 0 起。</b><br>方括号 <code>[]</code>，<code>列表[0]</code> 是第一个，<code>列表[-1]</code> 是最后一个；<code>len()</code> 数个数，<b>最大编号 = 长度 − 1</b>。<code>append</code> 加、<code>remove</code> 删。
</div>

<div class="csf-card">
<b>二、字典装"一对对"，靠键取值。</b><br>花括号 <code>{}</code>，写成 <code>键: 值</code>；<code>字典[键]</code> 取值；<code>字典[键] = 值</code> 键在就改、键不在就加。
</div>

<div class="csf-card">
<b>三、in 是护身符，for 是劳模。</b><br>动手前先用 <code>in</code> 问"在不在"，能躲开 remove 报错和 KeyError；<code>for</code> 把每一项挨个处理，字典遍历默认拿到的是键。
</div>

<div class="csf-card">
<b>四、三大坑记牢。</b><br>① 索引别越界（取末项用 <code>-1</code>）；② 别边遍历边删（新建列表装要留的）；③ 取字典键先检查或用 <code>.get()</code>。这三条，每个 Python 初学者都会撞一次——你提前知道了。
</div>
