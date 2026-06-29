---
title: "《计算机基本功路线图 · 编程语言入门（Python）》第10讲 · 异常处理：让程序遇错不崩"
date: 2026-07-03 19:00:00
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

<div class="csf-key-note">到现在为止，你写的程序有一个共同的脆弱点：只要用户输入了你没料到的东西，它就会当场<strong>崩溃退出</strong>，吐出一堆红字。这一讲我们要给程序穿上"安全气囊"——用 <code>try/except</code> 把可能出错的地方接住，让它遇到错误时<strong>稳稳地给个提示</strong>，而不是直接死给你看。</div>

## 🎯 这一讲你会学到什么

- 明白程序为什么会"崩溃"，那堆红字（traceback）到底在说什么；
- 学会用 `try` / `except` 把可能出错的代码"接住"，让程序不崩；
- 认识几个最常碰到的错误名字：`ValueError`、`FileNotFoundError`、`ZeroDivisionError`；
- 知道 `finally` 是干嘛的——不管成败都要做的收尾；
- 给第 03 讲那个"问年龄"程序加上保护：输入不是数字时，温和地提示重输，而不是当场报错退出。

<div class="csf-note">先说清楚一件事：这一讲的代码请你<strong>一行一行自己敲</strong>。异常处理是"写程序的肌肉记忆"里很关键的一块，让 AI 替你写一遍，你下次还是不会判断"哪里该接、怎么接"。AI 在这一讲只能当你的陪练——你写完后可以问它"我这么写有没有问题"，但别让它代笔。</div>

## 🛠 跟我做

### 先看看"崩溃"长什么样 <span class="csf-b csf-core">必读</span>

我们先故意制造一次崩溃。新建一个文件 `crash.py`，敲进去：

```python
age = int(input("请输入你的年龄："))
print("你明年", age + 1, "岁")
```

**先猜一下**：如果运行后你输入 `abc`（不是数字），会发生什么？程序会算出什么？还是会出别的状况？把你的猜测写下来再运行。

运行它，输入 `abc`，回车。你大概率会看到类似这样的一坨红字：

```text
Traceback (most recent call last):
  File "crash.py", line 1, in <module>
    age = int(input("请输入你的年龄："))
ValueError: invalid literal for int() with base 10: 'abc'
```

程序没算出任何结果，第二行 `print` 根本没执行——它在第 1 行就**死了**。

### 读懂这坨红字：traceback <span class="csf-b csf-key">重点</span>

很多初学者一看到红字就慌，直接复制去问 AI。但这坨字其实是 Python 在**好心告诉你哪里错了**，它有固定的读法。我们从**最后一行往上读**：

- **最后一行**最重要：`ValueError: invalid literal for int()...`。冒号前面 `ValueError` 是**错误的类型（名字）**，冒号后面是**人话解释**——"int() 没法把 'abc' 这种东西转成整数"。
- **往上看**：`File "crash.py", line 1` 告诉你出事的**文件和行号**，下面还把那一行代码贴给你看。这一行结尾的 `in <module>` 是一句"出错位置说明"——意思是"出错的代码在文件最外层、不在任何函数里"。你现在可以先不用管它，只看文件名和行号就够了。

<div class="csf-note"><strong>读 traceback 的口诀：先看最后一行（什么错），再看行号（哪里错）。</strong>就这两步，90% 的报错你自己就能定位。别一看到红字就两眼一黑去问 AI——你连它错在哪都不知道，怎么判断 AI 改得对不对？</div>

<details class="csf-fold"><summary>为什么叫 "Traceback（回溯）"？<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
当你的代码层层调用（A 调用 B，B 又调用 C）时，错误可能发生在最里面的 C。Traceback 会把"从哪一路调用过来的"整条路径都列出来，方便你顺藤摸瓜。现在你的程序还简单，通常只有一两层，所以看起来就两三行。等以后代码复杂了，traceback 会变长——但读法不变：<strong>永远先看最后一行</strong>，那是离"真正出错点"最近的地方。</details>

<div class="csf-note"><strong>顺便认识几个最常碰到的错误名字</strong>（以后在 traceback 最后一行经常见到它们）：<br>· <code>ValueError</code>：值不对，比如你想把 <code>'abc'</code> 这种非数字转成整数，就报它（这一讲我们主要对付的就是它）。<br>· <code>ZeroDivisionError</code>：除数是 0，比如算 <code>a / 0</code>，就报它（本讲最后的"挑战"会动手处理它）。<br>· <code>FileNotFoundError</code>：程序找不到你要打开的文件时就报它，比如 <code>open("不存在的文件.txt")</code>，文件名写错或文件根本不在，就会看到它。本讲先认个脸，等以后学到"读写文件"时你会再遇到它。</div>

### 用 try/except 把错误接住 <span class="csf-b csf-core">必读</span>

现在上主角。`try/except` 的意思特别直白：

- `try:` 下面放**可能会出错**的代码——"试着做做看"；
- `except:` 下面放**万一真出错了怎么办**——"接住，别让它崩"。

把 `crash.py` 改成这样：

```python
try:
    age = int(input("请输入你的年龄："))
    print("你明年", age + 1, "岁")
except ValueError:
    print("这看起来不像数字哦，请输入数字。")
```

**先猜后做**：这次输入 `abc`，你觉得会看到那坨红字，还是看到那句温和的提示？再试一次输入 `20` 呢？猜完再运行。

运行结果：

- 输入 `abc` → 打印 `这看起来不像数字哦，请输入数字。`，程序**正常结束，没有红字**；
- 输入 `20` → 打印 `你明年 21 岁`。`except` 那段**完全没被碰到**。

看懂这个区别了吗？`try` 里的代码顺利跑完，`except` 就被跳过；一旦 `try` 里某句出错，Python 会**立刻跳到 `except`**，剩下的 `try` 代码不再执行。

<div class="csf-why">这里有个关键细节：上面 <code>except ValueError</code> 我特意写明了要接的是 <strong>ValueError 这一种</strong>错误。这不是多余——它意味着"我知道这里会因为'转不成数字'而出错，我专门接它"。这一点非常重要，等会儿"翻车现场"会重点讲为什么<strong>不能</strong>偷懒写成光秃秃的 <code>except:</code>。</div>

### 加个循环：让他一直重输到对为止 <span class="csf-b csf-key">重点</span>

光提示一句还不够好——用户输错了，程序就结束了，他还得重新运行。我们希望：**输错就再问一次，直到输对**。把第 03 讲那个"问年龄"程序正式升级成这样（这就是本讲的核心动手练，请自己敲完整）：

```python
while True:
    answer = input("请输入你的年龄：")
    try:
        age = int(answer)
    except ValueError:
        print("请输入数字，比如 18。我们再来一次～")
        continue
    print("收到！你明年", age + 1, "岁。")
    break
```

逐句拆给你看：

- `while True:` —— 无限循环，先把人"圈"在这里反复问；
- `try: age = int(answer)` —— 试着把输入转成整数；
- `except ValueError:` 里 `continue` —— 转失败就提示，然后 `continue` **跳回循环开头重新问**；
- 转成功了就走到最后两行：打印结果、`break` **跳出循环**，结束。

**先猜后做**：依次输入 `abc`、`二十`、`20`，你觉得屏幕会依次打印什么？程序会在哪一次结束？猜完再跑一遍验证。

<div class="csf-note">这个"<strong>while True + try/except + continue 重试 / break 退出</strong>"的组合，是命令行小程序里出现频率极高的套路。你在第 11 讲、以及之后做完整小程序时还会反复用到它。现在花点时间把它敲熟、跑顺，绝对值。</div>

### finally：不管成败都要做的收尾 <span class="csf-b csf-skim">可跳读</span>

还有个搭档叫 `finally`：不管 `try` 成功还是失败，`finally` 里的代码**一定会执行**。它常用来做"收尾"，比如关文件、清理资源。

```python
try:
    age = int(input("请输入你的年龄："))
    print("你明年", age + 1, "岁")
except ValueError:
    print("不是数字，跳过。")
finally:
    print("（不管对错，这句都会打印）")
```

不管你输 `20` 还是 `abc`，最后那句"（不管对错……）"都会出现。现在你只要**认识它**就行；等以后处理文件、网络这类"用完必须关掉"的东西时，它会很有用。

## 💡 自己复述一遍

合上屏幕，用一句话说出来：**`try` 里放可能出错的代码，一旦出错就跳到 `except` 去处理，程序就不会崩。**

再加一句也行：**读报错要从最后一行开始看——先看是什么错，再看在哪一行错。** 能顺口说出这两句，这一讲的内核你就抓住了。

## 🔧 翻车现场

<div class="csf-note"><strong>翻车一：用一个光秃秃的 except 把所有错误全吞掉。</strong>这是新手最容易踩、也最坑的一个坑，单独拎出来讲。</div>

很多人图省事，把 `except ValueError:` 写成下面这样：

```python
# 反面教材，别学
try:
    age = int(input("请输入你的年龄："))
    print("你明年", age + 1, "岁")
except:
    print("出错了，请重试。")
```

光秃秃的 `except:` 意思是"**不管什么错我都接住、都不声张**"。表面看更"保险"，其实是**给自己埋雷**：

假设你 `try` 里其实写错了变量名，比如把 `age` 打成了 `aeg`——这是个 `NameError`（程序员自己的 bug——bug 就是程序里的错误、毛病——根本不是用户输入的问题）。但光秃秃的 `except` 会把它也一起接住，屏幕上只显示一句温温柔柔的"出错了，请重试"。**真正的 bug 被你亲手藏起来了**，你还以为是用户输入有问题，对着屏幕怎么也查不出毛病。

正确做法：**你预期会发生什么错，就明确接什么错**。这里只想处理"转不成数字"，那就只接 `ValueError`。其它没预料到的错，就让它正常崩出来——**崩出来是好事**，因为那坨红字会告诉你真正的问题在哪。

<div class="csf-why">记住这个原则：<strong>except 接得越精确越好。</strong>"接住所有错误"听起来很安全，实际上是把"程序在提醒你它病了"这个最有价值的信号给捂住了。能让你看见问题的程序，才是好程序。</div>

**翻车二：遇到报错不读 traceback，直接瞎改 / 直接甩给 AI。** 红字不是来吓你的，是来帮你的。养成习惯：报错了，先深呼吸，**把最后一行读完**——错误类型 + 行号，往往一眼就知道问题在哪。如果实在要问 AI，也请你**先自己读一遍、说出你的判断**，再让 AI 帮你确认。否则它说什么你信什么，你就又把方向盘交出去了。

**翻车三：把 except 写得太宽，把不该重试的也重试了。** 比如你本想在用户输错时重问，结果用 `except Exception` 把所有错误都拉进重试循环（`except Exception` 跟前面那个光秃秃的 `except:` 效果差不多，都是"几乎什么错都接住"，所以同样太宽、有同样的毛病），导致程序里真正的 bug 也跟着无限循环，你以为是用户在乱输，其实是代码在反复撞墙。解决办法同翻车一：**精确接你预期的那一种**。

## ✅ 自检三问

1. `try` 里的代码如果**没有**出错，`except` 里的代码会执行吗？（答：不会，会被跳过。）
2. 看到一坨 traceback，你应该**先看哪一行**？那一行告诉你什么？
3. 为什么不推荐写光秃秃的 `except:`？它会带来什么隐患？

三个都能脱口而出，就继续；卡住的回到对应小节再读一遍——尤其是第 3 问，那是这一讲最值钱的判断力。

## 🚀 挑战

给你一个"小小计算器"打个补丁。下面这段代码在用户输入 `0` 当除数时会崩溃（错误类型是 `ZeroDivisionError`），输入非数字时也会崩（`ValueError`）：

```python
a = int(input("被除数："))
b = int(input("除数："))
print("结果是", a / b)
```

你的任务（请自己动手，别让 AI 代写）：

1. 先**故意**让它崩两次——一次输入 `10` 和 `0`，一次输入 `abc`。把两次的 traceback 最后一行抄下来，确认错误类型分别是什么。
2. 用 `try/except` 给它加保护：除数为 0 时提示"除数不能是 0"，输入不是数字时提示"请输入数字"。**提示：一个 `try` 后面可以跟多个 `except`，分别接不同的错误类型**，像这样：

```python
try:
    ...
except ValueError:
    ...
except ZeroDivisionError:
    ...
```

3. 进阶：套上 `while True` 循环，让用户一直输到正确为止（参考前面"问年龄"的写法）。

做完后，再回头想一想：你**没有**用光秃秃的 `except:` 吧？每个 `except` 都精确对应一种错误吧？这就对了。

## 📦 复制带走

<div class="csf-card">
<strong>本讲要点</strong><br>
1. <code>try:</code> 放可能出错的代码，<code>except 错误类型:</code> 放出错后的处理——程序就不会崩溃退出。<br>
2. 读 traceback 的口诀：<strong>先看最后一行</strong>（什么错），<strong>再看行号</strong>（哪里错）。<br>
3. <strong>except 要精确</strong>：预期什么错就接什么错，别用光秃秃的 <code>except:</code> 把真 bug 一起吞掉。<br>
4. 常用套路：<code>while True</code> + <code>try/except</code>，输错就 <code>continue</code> 重试，输对就 <code>break</code> 退出。
</div>

下一讲（第 11 讲《模块与库：站在别人写好的代码上》），我们换个视角：到目前为止你都在"自己造轮子"，下一讲你会学到怎么**用别人已经写好、还经过千万人验证的代码**——这才是真正写程序的人每天在做的事。我们下讲见。
