---
title: "《计算机基本功路线图 · 操作系统》第08讲 · 多个人同时改一个数：并发与竞态"
date: 2026-07-06 17:00:00
tags: [计算机基础, 操作系统, 零基础, 编程入门, 课程]
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

<div class="csf-key-note">上一讲我们把数据稳稳存进了文件，那是"一个人慢慢写"的世界。这一讲我们换个场景：<b>两个人同时改同一个数</b>。你会亲眼看到一段"逻辑明明没错"的加法，在并发下算出一个比正确答案小的数——而且每跑一次都不一样。这不是你写错了，是并发世界的真实规则。看懂它，你才算真正摸到了"程序为什么会时对时错"的门。</div>

## 🎯 这一讲你会学到什么

- 直觉理解什么叫**共享数据**：多个线程能同时看到、同时改的同一份内存。
- 亲手制造一次**竞态条件（race condition）**：两个线程各加 100 万，结果却不到 200 万。
- 搞懂为什么一个"简单加法"会**丢数**——原来 `count += 1` 根本不是一步完成的。
- 建立一个本能：**共享数据 + 同时修改 = 危险**，并理解为什么这类 bug 最难抓。

<div class="csf-note">前面几讲我们说过：CPU 会在多个线程之间飞快地来回切换（第05、06讲）。这一讲就是那个事实第一次"咬人"的地方。如果"线程"这个词你还有点模糊，回头扫一眼第05讲再来，体验会更好。</div>

## 🛠 跟我做

### 一、先做个生活类比 <span class="csf-b csf-core">必读</span>

想象一个共用记账本，上面写着账户余额 `100`。你和室友约好各往里加 `1`，最后应该是 `102`。

但你们俩动作是这样的：

<div class="csf-note">你：看了一眼本子，记住"现在是 100"。<br>室友（同时）：也看了一眼，记住"现在是 100"。<br>你：心算 100 + 1 = 101，把 101 写回去。<br>室友：心算 100 + 1 = 101，也把 101 写回去。<br>本子最终：<b>101</b>，不是 102。</div>

你俩各加了一次，本该 `102`，结果只有 `101`——**有一次加法凭空消失了**。注意：你们俩谁都没算错，逻辑都对，问题出在"同时看、同时改"这件事本身。这就是竞态的核心画面，先把它刻进脑子里。

### 二、先猜后做 <span class="csf-b csf-key">重点</span>

现在我们让电脑来演同一出戏。两个线程，各自把同一个计数器 `counter` 加 100 万次。正确答案显然是 `2000000`。

<div class="csf-note"><b>动手前先猜（写下来或在心里说出口）：</b><br>1）你觉得程序会打印 2000000 吗？<br>2）如果不是，你猜会偏大还是偏小？<br>3）连跑 5 次，结果会每次都一样吗？</div>

### 三、运行这段程序 <span class="csf-b csf-core">必读</span>

我们用 Python，因为它装起来最省事、读起来最像大白话。

<div class="csf-note"><b>两个起手动作，给彻底的新手：</b><br>1）"命令行"就是一个能用打字下命令的小窗口——Mac 上叫"终端"（Terminal），Windows 上叫"命令提示符"或"PowerShell"，前面的入门讲里教过怎么打开它。<br>2）"新建文件"用任意文本编辑器都行（推荐 VS Code，也可以用系统自带的记事本），把下面的代码贴进去后，存成名字叫 <code>race.py</code> 的文件（<code>.py</code> 是 Python 文件的后缀）。<b>记住你把它存在哪个文件夹</b>，待会儿要在那个文件夹里运行它。</div>

先确认你有 Python 3：在命令行里敲 `python3 --version`，按回车，能打印出版本号（比如 `Python 3.11.4`）就说明装好了。然后新建文件 `race.py`，把下面这段**自己一个字一个字敲进去**——别复制，更别让 AI 替你写，敲的过程本身就是在记忆它：

```python
import threading

counter = 0  # 这就是大家共用的那本"记账本"

def add_many():
    global counter
    for _ in range(1_000_000):
        counter += 1   # 看起来一步，其实是三步，下面揭晓

t1 = threading.Thread(target=add_many)
t2 = threading.Thread(target=add_many)

t1.start()   # 两个线程同时开跑
t2.start()
t1.join()    # 等它俩都干完
t2.join()

print("最终结果：", counter)
print("我们期望：", 2_000_000)
print("丢了多少：", 2_000_000 - counter)
```

里面有几个第一次见的写法，逐个说清楚，别怕：

<div class="csf-note"><b>① <code>global counter</code></b>：这句话是在告诉 Python——"我在这个函数里要改的，是外面那个大家共用的 <code>counter</code>（那本共用记账本），不是新建一个我自己的"。如果不写这句，Python 会以为你在函数里另起炉灶、新开了一本只属于函数自己的小本子，你加的数全记在小本子上，外面那本根本没动。所以这句虽短，却是让两个线程真正去抢同一本账本的关键。<br><b>② <code>for _ in range(1_000_000):</code></b>：这是"重复一百万次"的写法。<code>range(1_000_000)</code> 表示从头数到一百万，循环就跟着跑这么多次。那个孤零零的下划线 <code>_</code> 是一个占位的名字，意思是"这次循环是第几次我并不关心，随便给个名字占位"——这是程序员的习惯写法，不是写错。<br><b>③ 数字里的下划线 <code>1_000_000</code></b>：它就等于 <code>1000000</code>（一百万），中间的下划线只是为了让人一眼看清有几个零，Python 允许这样写、对结果毫无影响。所以别把它当成笔误删掉。</div>

运行它：

```bash
python3 race.py
```

然后**连续运行 5 到 10 次**（按方向键上键回车就行）。把每次的结果记下来。

<div class="csf-why"><b>你大概率会看到这样的画面：</b><br>最终结果： 1374521<br>最终结果： 1208866<br>最终结果： 1561023<br>—— 每次都不一样，而且<b>几乎总是小于 200 万</b>。如果某次你恰好跑出了 2000000，别急，多跑几次，迟早会"漏"出来。结果越不稳定，越说明你抓到了竞态本人。</div>

### 四、揭晓：为什么会丢数 <span class="csf-b csf-core">必读</span>

关键在这一行：`counter += 1`。它在你眼里是"一步"，但 CPU 干起来其实是**三步**：

<div class="csf-note">第 1 步｜<b>读</b>：把 counter 现在的值从内存读到 CPU 里（比如读到 100）。<br>第 2 步｜<b>加</b>：在 CPU 里算 100 + 1 = 101。<br>第 3 步｜<b>写</b>：把 101 写回内存里的 counter。</div>

平时一个线程跑没问题。但 CPU 随时可能在这三步**中间**切去跑另一个线程（第05讲讲过的切换）。于是就重演了记账本的悲剧：

<div class="csf-note">线程A 读到 counter = 100<br>—— 切换 ——<br>线程B 读到 counter = 100（A 还没写回呢）<br>线程B 算出 101，写回 → counter = 101<br>—— 切回 ——<br>线程A 接着算 100 + 1 = 101，写回 → counter = 101<br>本该 +2，实际只 +1，<b>丢了一次</b>。</div>

100 万次循环里，这种"撞车"会发生无数次，每次撞掉一点，加起来就少了一大截。而每次程序运行，CPU 切换的时机都略有不同，所以**每次丢的数量都不一样**——这就是你看到结果飘忽不定的原因。

<div class="csf-key-note"><b>两个新词，记住它：</b><br><b>竞态条件（race condition）</b>：结果取决于多个线程"谁先谁后"这种不确定的时序，于是结果变得不可预测。"race"就是"赛跑"，谁先抢到谁影响结果。<br><b>原子性（atomicity）</b>：一个操作要么完整做完、中途不被打断，要么干脆没做，不存在"做了一半被人插队"。`counter += 1` 恰恰<b>不是</b>原子的，这就是祸根。</div>

<details class="csf-fold"><summary>为什么换成别的语言，现象可能不太一样？<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
竞态是并发世界的普遍规律，但"看得有多明显"和语言、运行环境有关。Python 有个叫 GIL（全局解释器锁，Global Interpreter Lock）的机制——简单说就是同一时刻只让一个线程真正在跑、不能真正同时执行，但它仍然可能在 `counter += 1` 的三步中间切换，所以丢数照样发生——这也是我们用它演示的原因：足够明显又足够好装。<br>换成 Java、C++、Go 这类能让多个线程<b>真正同时</b>跑在多个 CPU 核上的语言，竞态往往更凶、更难预测。但反过来，有些语言里某些操作恰好是原子的，你就可能"侥幸"看不到错——注意，<b>看不到错不等于没错</b>，只是这次没撞上而已。这正是并发 bug 最阴险的地方，下面"翻车现场"会专门说。</details>

## 💡 自己复述一遍

合上屏幕，用一句话说给自己听：

<div class="csf-key-note">当多个线程同时读写同一份共享数据，而修改又不是"一步到位"的原子操作时，它们会互相覆盖、丢掉更新，算出一个错误且每次都不一样的结果——这就是竞态条件。</div>

说不顺也没关系，回到记账本那个画面再讲一遍：两个人同时看到 100，各自写回 101。能把这个画面讲清楚，你就懂了。

## 🔧 翻车现场

<div class="csf-note"><b>翻车一：以为"代码逻辑写对了，结果就一定对"。</b><br>这是最致命的误解。我们这段加法逻辑挑不出毛病，结果照样错。<b>原因</b>：单线程世界里"逻辑对 = 结果对"，但并发世界多了一个变量——执行的<b>时序</b>，而时序你控制不了。<b>解法</b>：以后只要看到"多个线程改同一个东西"，就警惕，别再默认结果可靠。怎么修留到下一讲。</div>

<div class="csf-note"><b>翻车二：跑一次得到 2000000，就拍板"没问题"。</b><br>并发 bug 最大的脾气就是<b>难复现</b>：它依赖那个稍纵即逝的切换时机，可能跑 100 次对 99 次，偏偏上线那次错。<b>原因</b>：错与不错取决于运气般的时序。<b>解法</b>：判断并发对不对，不能靠"跑一次没崩"，要靠多跑、加大压力（更多次数、更多线程），更要靠看懂原理去推断。</div>

<div class="csf-note"><b>翻车三：把这种 bug 原样甩给 AI 说"帮我修"。</b><br>你只贴一句"结果不对"，AI 根本不知道这是竞态，给的方案大概率隔靴搔痒。<b>原因</b>：并发问题的关键信息（哪份数据被几个线程同时改、改的操作是否原子）藏在你脑子里，不在报错里。<b>解法</b>：先自己定位到"这是共享数据的竞态"，再带着这个判断去和 AI 协作——你负责判断，它负责打下手。这正是这门课要练的本事。</div>

## ✅ 自检三问

1. `counter += 1` 在 CPU 眼里其实是哪三步？请用"读、加、写"讲一遍它怎么导致丢数。
2. 为什么同样一段代码，每次运行结果都可能不一样？到底是什么在变？
3. "原子性"是什么意思？为什么说一个操作不是原子的，就可能在并发下出错？

<div class="csf-note">三问都能脱口而出，再往下走。卡住的话，回到记账本和"三步分解"那两张图，它们是这一讲的全部。</div>

## 🚀 挑战

动手，别只想：

1. **放大它**：把 `1_000_000` 改成 `10_000_000`，再跑几次，观察"丢的数量"是不是更夸张了。
2. **加人**：再创建 `t3`、`t4` 两个线程一起加（记得 `start` 和 `join` 都要补上），看看四个人抢一本账本会乱成什么样，最终结果离正确值差多远。
3. **先猜后做**：改之前先猜——线程更多了，丢得会更多还是更少？跑完对照你的猜测。
4. **（选做）一句话日记**：用你自己的话写下"我今天亲眼看到竞态长什么样"。这件事 AI 替你写没有任何意义，必须你自己经历、自己写。

<div class="csf-why">做完你可能会忍不住问：那到底怎么才能让结果正确？答案是给共享数据"上锁"，让那三步变成不可打断的一整块。这正是下一讲《排队的艺术：锁与死锁》的主角——但先别急着搜答案，带着今天这个"亲眼见证的错"进下一讲，体会会深得多。</div>

## 📦 复制带走

<div class="csf-card"><b>共享数据 + 同时修改 = 危险。</b>多个线程同时读写同一份数据，是一切竞态的温床，看到就要警觉。<br><br><b>"一步"常常不是一步。</b>`count += 1` 实为读、加、写三步，中途可被切换打断，于是更新互相覆盖、凭空丢数。<br><br><b>竞态条件 = 结果取决于时序。</b>谁先谁后由 CPU 切换决定，你控制不了，所以同样的代码每次结果都可能不同。<br><br><b>并发 bug 难复现，最难抓。</b>跑一次对不代表没问题；判断并发对错要靠原理推断，而不是"碰运气没崩"。</div>
