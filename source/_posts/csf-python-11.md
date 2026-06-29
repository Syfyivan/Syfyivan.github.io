---
title: "《计算机基本功路线图 · 编程语言入门（Python）》第11讲 · 模块与库：站在别人写好的代码上"
date: 2026-07-03 20:00:00
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

<div class="csf-key-note">到这一讲为止，你写的每一行代码都是从零敲出来的。但真实世界里，没人会自己写"生成随机数""读取当前时间"这种轮子——这些早有人写好了，而且写得比你我都好。<strong>这一讲学的，就是怎么把别人的代码搬过来用：一句 <code>import</code>，你就站到了成千上万人的肩膀上。</strong>注意：站在肩膀上不等于把脑子也交出去。你得知道自己在用什么、为什么这么用。</div>

## 🎯 这一讲你会学到什么

- 什么是"模块"和"库"，为什么你不该什么都自己写。
- 用 `import` 和 `from ... import` 把标准库请进自己的程序。
- 认识三个超常用的标准库：`random`（随机）、`datetime`（时间）、`os`（和操作系统打交道）。
- 用 `pip install` 安装别人发布的第三方库，并在程序里用起来。
- 学会一项比记语法更重要的本事：<strong>查文档</strong>——遇到不认识的库，自己找到答案。

<div class="csf-note">上一讲我们学了异常处理，让程序遇错不崩。这一讲我们给程序"招兵买马"。两件事会在下一讲（第12讲，小项目收尾）合流：一个有菜单、能存文件、出错不崩、还会随机和记时间的小程序，就快成型了。</div>

## 🛠 跟我做

### 先搞清楚：模块、库、包，到底是什么 <span class="csf-b csf-core">必读</span>

别被术语吓到，其实特别朴素：

- <strong>模块（module）</strong>：就是<strong>一个 `.py` 文件</strong>。你之前写的 `todo.py` 也是一个模块。里面的函数、变量，别的文件可以借来用。
- <strong>库 / 包（library / package）</strong>：<strong>一堆模块打包在一起</strong>，对外提供一组相关功能。比如 `random` 库专管"随机"，`datetime` 库专管"时间"。
- <strong>标准库</strong>：Python 安装时<strong>自带</strong>的库，不用额外下载，`import` 就能用。
- <strong>第三方库</strong>：别人写好、发布到网上的库，要先用 `pip` <strong>装</strong>下来才能用。

<div class="csf-why">为什么要有这套东西？因为"重复造轮子"是巨大的浪费。生成一个高质量随机数、正确处理闰年和时区，这些都是有坑的难题，前人已经趟平了。你把精力花在<strong>自己程序独有的逻辑</strong>上，通用部分交给库——这是所有程序员的日常。</div>

### 第一步：import 一个标准库 <span class="csf-b csf-core">必读</span>

新建一个文件 `demo_import.py`，敲下面这几行。<strong>先猜：</strong>`random.randint(1, 6)` 会打印出什么样的数？范围是多少？

```python
import random

dice = random.randint(1, 6)
print("掷骰子，点数是：", dice)
```

运行几次（命令行里 `python demo_import.py`）。揭晓：`randint(1, 6)` 会随机给你一个 <strong>1 到 6 之间的整数，包括 1 也包括 6</strong>。多跑几次，数字会变——这就是随机。

拆解这句 `import random`：

- `import random` 的意思是"把 `random` 这个库请进来"。
- 请进来之后，要用它的功能，得写成 `random.功能名()`——<strong>库名 + 点 + 功能名</strong>。这个点号读作"的"：`random.randint` 就是"random 的 randint"。
- 为什么要带前缀 `random.`？这样 Python 才知道这个 `randint` 是从哪来的，不会和你自己写的同名函数打架。

<div class="csf-note">习惯：<code>import</code> 语句一律写在文件<strong>最上面</strong>，所有 import 放一起。这不是规定语法，但是全世界公认的好习惯，一眼就能看出这个程序依赖了哪些库。</div>

### 第二步：from ... import，只取你要的那一样 <span class="csf-b csf-key">重点</span>

有时候你只想用库里的某一个东西，懒得每次都写库名前缀。可以这样：

```python
from random import randint

dice = randint(1, 6)
print("点数是：", dice)
```

`from random import randint` 的意思是"从 `random` 库里，单独把 `randint` 拿出来"。拿出来之后就能<strong>直接写 `randint(...)`，不用再加 `random.` 前缀</strong>了。

两种写法对比，记住这张表：

| 写法 | 调用时 | 适合 |
| --- | --- | --- |
| `import random` | `random.randint(1,6)` | 想用库里好多东西，或想明确看出来源 |
| `from random import randint` | `randint(1,6)` | 只用一两样，想写得简短 |

<div class="csf-why">该用哪种？给初学者一个朴素建议：<strong>默认用 <code>import random</code> 这种带前缀的</strong>。因为代码读起来更清楚——别人（和三个月后的你）一看 <code>random.randint</code> 就知道它来自哪个库。<code>from ... import *</code>（带星号，意思是"全都拿出来"）这种写法看着省事，但会把一堆名字一股脑塞进来，容易撞车，初学阶段<strong>别用</strong>。</div>

### 第三步：动手练① —— 用 random 改造猜数字游戏 <span class="csf-b csf-core">必读</span>

还记得前面讲过的猜数字游戏吗？之前答案是我们自己写死的，比如 `answer = 42`，每次都一样，玩两次就腻了。现在让<strong>电脑随机出题</strong>。

<strong>先猜：</strong>下面这段代码运行后，`answer` 每次会一样吗？你能在屏幕上看到 `answer` 是几吗？

```python
import random

answer = random.randint(1, 100)  # 电脑随机想一个 1~100 的数

print("我想好了一个 1 到 100 之间的数，你来猜！")

while True:
    guess = input("请输入你猜的数字：")
    guess = int(guess)          # input 拿到的是字符串，要转成整数

    if guess < answer:
        print("猜小了，再试试")
    elif guess > answer:
        print("猜大了，再试试")
    else:
        print("猜对啦！答案就是", answer)
        break
```

揭晓：每次运行 `answer` 都<strong>不一样</strong>，而且你在屏幕上<strong>看不到</strong>它是几——因为它存在程序内部的变量里，没被打印出来，直到你猜对才揭晓。这才像个游戏。

<div class="csf-note">这段是这一讲的主菜，<strong>请自己一行一行敲一遍、跑通</strong>。别让 AI 替你生成。哪怕你已经"看懂了"，亲手敲、亲眼看它跑起来，和"看懂"是两种完全不同的掌握程度。手会比脑子先记住。</div>

<details class="csf-fold"><summary>想加点料：让它有"猜了几次"和"次数上限"<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
真游戏会记录你猜了几次，还可能限制次数。试着自己改（先别看下面）：<br>① 在循环外加一个 <code>count = 0</code>；<br>② 每次猜完 <code>count += 1</code>；<br>③ 猜对时打印"你用了 X 次"。<br>进阶：用 <code>random.choice(["简单","困难"])</code> 让程序随机挑个难度词打印出来——<code>choice</code> 是 random 库另一个超有用的功能，从一个列表里随便挑一个。这两个改动都不难，<strong>自己试，卡住了再回来对照思路</strong>。</details>

### 第四步：认识 datetime —— 程序怎么知道"现在几点" <span class="csf-b csf-core">必读</span>

时间是另一个你绝对不该自己算的东西（闰年、月份天数、时区……全是坑）。Python 自带 `datetime` 库专门干这个。

<strong>先猜：</strong>下面这句会打印出什么格式的东西？

```python
from datetime import datetime

now = datetime.now()
print(now)
```

揭晓：你会看到类似 `2026-07-03 20:00:15.123456` 这样——<strong>年-月-日 时:分:秒.微秒</strong>。这就是运行那一刻的真实时间。

<div class="csf-note">注意这里有个容易绕晕的地方：<code>from datetime import datetime</code>——前一个 <code>datetime</code> 是<strong>库名</strong>，后一个 <code>datetime</code> 是库里那个<strong>同名的工具</strong>。它俩真的重名，这是 Python 的历史遗留，记住就好。所以才有 <code>datetime.now()</code> 这种写法。</div>

直接打印出来的时间太长太丑。我们通常用 `strftime`（读作 string-format-time，"把时间格式化成字符串"）裁成想要的样子：

```python
from datetime import datetime

now = datetime.now()
nice = now.strftime("%Y-%m-%d %H:%M")
print("现在是：", nice)
```

这里的 `%Y %m %d %H %M` 是<strong>占位符</strong>：`%Y` 是四位年份，`%m` 是月，`%d` 是日，`%H` 是时（24 小时制），`%M` 是分。运行后会得到干净的 `2026-07-03 20:00`。

<div class="csf-why">这些 <code>%Y</code> 谁记得住？<strong>没人靠背</strong>。这正是下面要讲的"查文档"的用武之地——用的时候搜一下 "python strftime" 就有完整对照表。会查，比死记强一百倍。</div>

### 第五步：动手练② —— 给每条待办加上写入时间 <span class="csf-b csf-key">重点</span>

我们之前写过把待办存进文件的程序。现在让每条待办<strong>带上它被记下来的时间</strong>。核心就一句：拼字符串时把时间拼进去。

```python
from datetime import datetime

def add_todo(text):
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    line = f"[{now}] {text}\n"     # f-string 把时间和内容拼成一行
    with open("todos.txt", "a", encoding="utf-8") as f:
        f.write(line)
    print("已记下：", line.strip())

add_todo("学完第11讲")
add_todo("自己敲一遍猜数字游戏")
```

<strong>先猜：</strong>运行后 `todos.txt` 里每一行长什么样？跑完打开文件看看，应该是 `[2026-07-03 20:00] 学完第11讲` 这种带时间戳的格式。

<div class="csf-note">这里复用了前面学的：<code>f-string</code>（<code>f"..."</code> 里用 <code>{}</code> 塞变量）、<code>with open(...)</code> 写文件、<code>"a"</code> 追加模式、还有 <code>encoding="utf-8"</code>（告诉文件用通用编码存中文，前面写文件那一讲讲过，照抄即可）。新东西只有"取时间"这一点。<strong>看见没——学新库，往往只是给你已经会的程序加一小块零件。</strong>这一段也请自己敲。</div>

### 第六步：os —— 和操作系统说话 <span class="csf-b csf-skim">可跳读</span>

`os` 库让你的程序能问操作系统一些事，比如"这个文件存在吗""我现在在哪个文件夹"。在我们的小程序里，它最有用的场景是：<strong>读文件前先确认文件在不在</strong>，免得程序一上来就崩。

```python
import os

if os.path.exists("todos.txt"):
    print("待办文件已存在，可以读取")
else:
    print("还没有待办文件，等你添加第一条")
```

`os.path.exists("文件名")` 会返回 `True` 或 `False`。配合上一讲的异常处理，你的程序就更稳了。`os` 库很大，现在认识 `os.path.exists` 一个就够，其余用到再查。

### 第七步：pip —— 安装别人写的第三方库 <span class="csf-b csf-key">重点</span>

前面几个库都是 Python 自带的。但世界上还有海量库是<strong>别人写好放在网上</strong>的，要用得先<strong>装</strong>。装库的工具叫 `pip`，它在<strong>命令行里运行</strong>（不是在 Python 代码里）。

我们装一个又好玩又直观的库 `requests`（专门用来从网上抓数据，非常常用）来练手。在命令行敲：

```bash
pip install requests
```

<div class="csf-note">如果 <code>pip</code> 这个命令报"找不到"，试试 <code>pip3 install requests</code>，或者最稳的写法 <code>python -m pip install requests</code>（意思是"用当前这个 python 去运行它自带的 pip"）。这个写法能避开很多"装到别处去了"的坑，<strong>推荐当成默认习惯</strong>，原因下面翻车现场会讲。</div>

看到一堆下载进度、最后出现 `Successfully installed requests-...` 就是装好了。装好之后，在 Python 代码里 `import` 它的方式和标准库<strong>一模一样</strong>：

```python
import requests

resp = requests.get("https://httpbin.org/get")
print("服务器回了状态码：", resp.status_code)
```

<div class="csf-note">代码里这个 <code>httpbin.org</code> 是什么？它是一个专门给人练手、测试网络请求的网站，安全无害：你向它要数据，它会原样回给你，拿来练 <code>requests</code> 正合适。所以这里我们就是让程序向它要了一次数据。</div>

<strong>先猜：</strong>`status_code` 会是几？（联网正常的话，多半是 `200`，那是"一切正常"的意思；这个数字我们后面的网络课会专门讲。）

<div class="csf-why">为什么标准库不用装、第三方库要装？因为标准库随 Python 一起装在你电脑上了；第三方库在别人的服务器上，<code>pip install</code> 就是去把它<strong>下载</strong>到你电脑、归到你这个 Python 名下。装一次，以后就能反复 <code>import</code>。</div>

### 第八步：查文档 —— 这一讲最该带走的能力 <span class="csf-b csf-core">必读</span>

库太多了，没人能背下来。<strong>真正的高手不是记得多，而是查得快、看得懂。</strong>给你一套可复用的查法：

1. <strong>搜索时带上"python"</strong>：搜 "python random randint"，而不是光搜 "randint"。
2. <strong>认准官方文档</strong>：标准库看 `docs.python.org`；第三方库一般在它的官网或 PyPI（`pypi.org`，pip 装的库都在这上面）。
3. <strong>在命令行里现场问 Python</strong>：这招最快。<br>注意，这次不是输入 `python demo_import.py` 去跑某个文件，而是要进到一个能<strong>直接和 Python 对话</strong>的模式：先在命令行输入 `python` 并回车，你会看到提示符变成 `>>>`，这就说明你进来了。然后再一行一行敲下面这几句（每敲一行回车一次）：

```python
import random
help(random.randint)        # 打印出这个函数怎么用
print(dir(random))          # 列出 random 里所有能用的功能名
```

`help()` 会当场告诉你函数的用法说明，`dir()` 会列出一个库里有哪些功能。不用开浏览器，立等可取。看完想退出这个 `>>>` 模式、回到普通命令行，输入 `exit()` 回车就行。

<div class="csf-note">AI 当然能帮你查、帮你解释文档，这是它的好用之处。但<strong>看懂文档、判断"它说的对不对、适不适合我的场景"，必须是你自己的能力</strong>。你可以让 AI 解释 <code>strftime</code> 的占位符，但拼出你要的时间格式、跑一遍验证对不对，要自己来。把"理解和判断"留给自己，把"打字和检索"交给工具——这条线，从现在就守住。</div>

## 💡 自己复述一遍

合上屏幕，用一句话说出来：<strong>`import` 是把别人写好的代码请进我的程序；标准库自带、直接 import，第三方库要先 `pip install` 再 import；不认识的库，靠"查文档"而不是靠背。</strong>说不顺就回去翻，顺了再往下走。

## 🔧 翻车现场

<strong>翻车一：把自己的文件命名成 `random.py`</strong> <span class="csf-b csf-key">重点</span>

这是新手最经典的坑。你写了个文件叫 `random.py`，然后里面 `import random`——结果 Python 把<strong>你自己这个文件</strong>当成了 random 库，于是 `random.randint` 直接报错 `AttributeError`（意思是「找不到这个功能」——因为你的文件里压根没有 `randint`），或者行为变得很诡异。原因：Python 找库时会<strong>先在当前文件夹找</strong>，你的 `random.py` 把真正的标准库挡住了。
解法：<strong>永远别把自己的文件起成和库一样的名字</strong>。已经起了就改名（比如改成 `my_random.py`）。另外，你运行过 Python 文件后，Python 会偷偷在旁边生成一个叫 `__pycache__` 的文件夹和 `.pyc` 结尾的文件——那是它给自己存的"加速缓存"，平时你根本不用管它。但这次改名后，请把这个 `__pycache__` 文件夹<strong>整个删掉</strong>（在文件管理器里像删普通文件夹一样删就行），免得里面的旧缓存继续把你引向错误的文件。删掉它不会影响你的代码。

<strong>翻车二：没装就 import，报 ModuleNotFoundError</strong> <span class="csf-b csf-core">必读</span>

`import requests` 时如果蹦出 `ModuleNotFoundError: No module named 'requests'`，意思就一个：<strong>这个库还没装</strong>（或者装到别的 Python 环境去了）。先别慌，照着这个顺序排查：① 它是第三方库吗？是的话先 `pip install 它`。② 名字拼对了吗？③ 装是装了还报错，看翻车三。

<strong>翻车三：装在了 A 环境，代码跑在 B 环境</strong> <span class="csf-b csf-key">重点</span>

电脑上可能装了不止一个 Python（系统自带一个、你自己又装一个）。`pip install` 装到了其中一个，而你运行代码用的是另一个，于是"明明装了却说没装"。
解法：用 <strong>`python -m pip install 库名`</strong> 代替 `pip install 库名`。`python -m pip` 的意思是"用<strong>当前这个</strong> python 自带的 pip 去装"，这样装的位置和你跑代码的 python 永远是同一个，从根上避开这个坑。

<strong>翻车四：分不清 `import` 后还要不要写前缀</strong> <span class="csf-b csf-skim">可跳读</span>

`import random` 之后必须写 `random.randint(...)`；`from random import randint` 之后直接写 `randint(...)`。两种混着用就会报 `NameError`（名字找不到）。记法：<strong>怎么 import 进来的，就怎么用</strong>。

## ✅ 自检三问

1. `import math` 和 `from math import sqrt` 这两句，分别让你之后怎么调用 `sqrt`？（提示：一个要前缀，一个不要。）
2. 你写 `import pandas` 报了 `ModuleNotFoundError`，你脑子里第一反应应该是哪个命令？（提示：它是第三方库。）
3. 为什么不该把自己的练习文件命名为 `os.py` 或 `datetime.py`？

<details class="csf-fold"><summary>对照答案<span class="csf-b csf-skim">点开看</span></summary>
1. <code>import math</code> 后写 <code>math.sqrt(9)</code>；<code>from math import sqrt</code> 后直接写 <code>sqrt(9)</code>。<br>2. 先在命令行跑 <code>python -m pip install pandas</code>（pandas 是第三方库，得先装）。<br>3. 因为 Python 找库时先看当前文件夹，你的同名文件会把真正的标准库挡住，导致 import 串了、报错。</details>

## 🚀 挑战

给你上一讲做的待办程序（或这一讲第五步的版本）加两个真实功能，<strong>全程自己写</strong>：

1. <strong>随机一句鼓励</strong>：准备一个列表 `cheers = ["干得漂亮！", "再接再厉！", "今天也很棒"]`，每添加完一条待办，用 `random.choice(cheers)` 随机打印一句。
2. <strong>启动报时</strong>：程序一打开，用 `datetime` 打印一句"现在是 2026-07-03 20:00，今天的待办："。
3. <strong>选做</strong>：用 `os.path.exists` 判断 `todos.txt` 在不在——不在就友好提示"还没有任何待办"，而不是直接报错崩掉（顺便复习上一讲的异常处理）。

做完留意一个感受：你这次几乎没写什么"难"代码，只是把几个库的功能像积木一样拼了进去。<strong>这就是真实编程的样子</strong>——你的价值在于"拼得对、拼得清楚"，而不是什么都从零造。遇到不会的功能，记得用第八步的查文档三招，别一上来就让 AI 把整段替你写了。

## 📦 复制带走

<div class="csf-card">
<strong>① 模块=一个 .py 文件，库=一堆模块。</strong>标准库自带（直接 import），第三方库要先 <code>pip install</code> 再 import，用法完全一样。<br>
<strong>② 两种 import：</strong><code>import random</code> → 用时写 <code>random.randint()</code>；<code>from random import randint</code> → 直接写 <code>randint()</code>。新手默认用带前缀那种，读起来清楚。<br>
<strong>③ 装库用 <code>python -m pip install 库名</code>，</strong>能避开"装到别的 Python 去了"的经典坑；报 <code>ModuleNotFoundError</code> 第一反应就是"没装/装错环境"。<br>
<strong>④ 最该带走的是"查文档"：</strong>搜索带 "python"、认准官方站、命令行用 <code>help()</code> 和 <code>dir()</code> 现场查。会查胜过死记——这条本事比这一讲任何一个库都值钱。
</div>

下一讲（第12讲，小项目收尾），我们就把前面这一整门课的零件——菜单、文件存取、异常处理、还有这一讲的随机和时间——串成一个真正能用、能交出去的命令行小程序。你练过的每一段，都会在那里派上用场。
