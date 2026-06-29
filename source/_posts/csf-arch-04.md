---
title: "《计算机基本功路线图 · 计算机组成原理》第04讲 · 逻辑门:用'开关'做判断"
date: 2026-07-08 13:00:00
tags: [计算机基础, 计算机组成原理, 零基础, 编程入门, 课程]
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

<div class="csf-key-note">上一讲我们把文字、图片、声音都变成了 0 和 1。这一讲做一件听起来玄、其实超朴素的事:<b>让一堆"开关"自己做判断</b>。计算机不会思考,它只会照着几条死规矩,把进来的 0/1 变成出去的 0/1。这几条死规矩,就是<b>逻辑门</b>。今天你会亲手在屏幕上把它们搭出来,看着灯亮、灯灭。</div>

计算机里没有小人在算账,只有电。电要么通(我们记作 **1**),要么不通(记作 **0**)。一个开关控制一盏灯,这是小学就懂的事。可一旦你把开关**串起来、并起来**,让一个开关的输出去当另一个开关的输入,事情就开始有趣了——这堆开关居然能"判断"。

这一讲不需要你买任何器材,一个浏览器就够。我们边讲边用在线模拟器搭,你会发现:所谓"会判断的电路",真的就是几盏灯和几个开关。

## 🎯 这一讲你会学到什么

- **三个基本门**:与门(AND)、或门(OR)、非门(NOT),分别在什么时候输出 1。
- **真值表**:把一个门所有可能的输入和输出列成一张表,这是看懂逻辑门的"标准答案纸"。
- **异或(XOR)**:一个特别有用、又最容易和"或"搞混的门。
- **组合逻辑**:逻辑门**没有记忆**——输出只看此刻的输入,不看上一秒发生过什么。
- **NAND 是万能门**:为什么芯片厂只用一种门,就能搭出全世界所有的电路。
- 动手:在 logic.ly 或 CircuitVerse 里亲手搭出 AND/OR/NOT,填真值表;然后挑战**只用 NAND 搭出 NOT 和 AND**。

<div class="csf-note">这一讲是整门课第一次"从电到计算"的跨越。上一讲是<b>怎么存</b>,这一讲是<b>怎么算</b>的最小零件。下一讲我们就用今天搭的门,拼出一个真能做加法的电路。所以今天一定要<b>自己动手搭一遍</b>,光看是搭不出感觉的。</div>

## 🛠 跟我做

### 第一步:打开一个在线模拟器 <span class="csf-b csf-core">必读</span>

我们不写代码,直接"连电路"。两个免费工具任选其一:

- **logic.ly** — 打开 <https://logic.ly/demo> 就能用,界面像搭积木,最适合第一次。
- **CircuitVerse** — 打开 <https://circuitverse.org/simulator> ,功能更全,免注册也能玩。

下面以 logic.ly 的 demo 为例讲(CircuitVerse 操作几乎一样,元件名一致)。你需要认识三种零件:

- **Toggle Switch / 输入开关**:你用鼠标点它,它在 0 和 1 之间切换。这是"输入"。
- **Light Bulb / 灯泡**:接在最后,亮=1,灭=0。这是"输出",代替你的眼睛读结果。
- **Logic Gate / 逻辑门**:AND、OR、NOT 那几个有形状的小方块,是真正"做判断"的零件。

把它们从左边元件栏拖到画布上,再用鼠标从一个零件的小圆点拉一条线连到另一个零件,就接好了。**接线规矩**:输入开关 → 门 → 灯泡,信号从左往右流。

### 第二步:搭一个非门(NOT),先猜后做 <span class="csf-b csf-key">重点</span>

非门最简单,只有**一个输入**:你给它 0,它吐 1;你给它 1,它吐 0。说人话就是"**取反 / 唱反调**"。

动手:拖一个 Toggle Switch、一个 NOT Gate、一个 Light Bulb,连成一条线:开关 → NOT → 灯泡。

<div class="csf-note"><b>先猜后做</b>:开关现在是 0(没点亮),你觉得灯泡是亮还是灭?……想好了再点开关试。你会看到:开关 0 时灯<b>亮</b>(输出 1),开关 1 时灯<b>灭</b>(输出 0)。它永远跟你对着干。</div>

它的真值表(只有两行,因为只有一个输入,2 个可能):

```text
输入 A   输出 (NOT A)
  0          1
  1          0
```

### 第三步:搭与门(AND)和或门(OR) <span class="csf-b csf-core">必读</span>

这两个门有**两个输入**(我们叫它们 A 和 B),各连一个开关。规矩:

- **与门 AND**:**两个都为 1**,才输出 1;只要有一个是 0,就输出 0。像"**两把钥匙同时插对**才开锁"。
- **或门 OR**:**只要有一个为 1**,就输出 1;两个都为 0 才输出 0。像"**任意一个开关**都能开走廊的灯"。

动手搭 AND:两个开关 A、B → 都连到 AND 门的两个输入 → AND 门 → 灯泡。再照样搭一个 OR。

<div class="csf-note"><b>先猜后做</b>:把 A=1、B=0。你觉得 AND 的灯亮吗?OR 的灯亮吗?……AND 要求"两个都 1",现在 B 是 0,所以 AND <b>灭</b>;OR 只要"有一个 1",所以 OR <b>亮</b>。亲手点开关,把下面两张表逐行验证一遍。</div>

```text
与门 AND                 或门 OR
A  B  | A AND B          A  B  | A OR B
0  0  |   0              0  0  |   0
0  1  |   0              0  1  |   1
1  0  |   0              1  0  |   1
1  1  |   1              1  1  |   1
```

注意:两个输入,所以一共 **2 × 2 = 4 行**,一行都不能漏。这点后面"翻车现场"会重点说。

### 第四步:认识异或(XOR),它不是"或" <span class="csf-b csf-key">重点</span>

异或(XOR)也有两个输入,规矩是:**两个不一样时输出 1,一样时输出 0**。

把它和 OR 摆一起对比,你立刻看出差别就在最后一行:

```text
或门 OR                  异或 XOR
A  B  | A OR B           A  B  | A XOR B
0  0  |   0              0  0  |    0
0  1  |   1              0  1  |    1
1  0  |   1              1  0  |    1
1  1  |   1   ←这里      1  1  |    0   ←区别就在这
```

生活版理解:OR 是"**你来或我来,饭都有人做**"(都来也行);XOR 是"**只能一个人值班,俩人都在反而不算数**"。XOR 在下一讲做加法器时是绝对主角。为什么?二进制里 `1 + 1` 不等于 2,而是等于 `10`——就是说当前这一位(术语叫**本位**)写 0,然后往前面一位送一个 1(术语叫**进位**),跟十进制里 `9 + 1` 满了要往前进一位是同一个道理。你看:`1 + 1` 在当前这一位写下的正好是 0,而这正是 XOR 的脾气(两个 1 相遇,XOR 输出 0)。先记住它,下一讲见。

<details class="csf-fold"><summary>还有 NAND / NOR / XNOR,是怎么回事<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
<div>把基本门的输出再"取反"一下,就得到带 N 的版本:<br><b>NAND</b> = NOT(AND),与门结果再反一下:只有"两个都 1"时输出 0,其余都是 1。<br><b>NOR</b> = NOT(OR):只有"两个都 0"时输出 1。<br><b>XNOR</b> = NOT(XOR):两个"一样"时输出 1(常用来判断"相等")。<br>它们不是新魔法,就是在老门后面挂了个非门。但 NAND 有个惊人的本事,马上讲。</div>
</details>

### 第五步:挑战——只用 NAND 搭出 NOT 和 AND <span class="csf-b csf-core">必读</span>

这是本讲的核心动手题,**请务必自己在模拟器里搭出来,别让 AI 替你连**。NAND 门(与非门)被称为**通用门**:理论上,只用 NAND 一种门,就能搭出世界上所有逻辑电路。我们先验证两个最小的:

**① 用 NAND 搭一个 NOT(取反)**

诀窍:把 NAND 的**两个输入接到同一个开关 A**。

- A=0 时,NAND 看到的是(0,0),"不是都为 1",输出 1。
- A=1 时,NAND 看到的是(1,1),"两个都为 1",AND 本会输出 1,再取反 → 输出 0。

看,输入 0 出 1、输入 1 出 0,这不就是 NOT 吗!

下面这张图里,开关 A 出来的线先分成上下两根,这两根线分别接进 NAND 的两个输入口(NAND 有两个输入口,这里把它们都接到同一个开关 A 上):

```text
        ┌──→ NAND 输入口1 ┐
A ──────┤                 ├──→ NAND ──→ 输出
        └──→ NAND 输入口2 ┘
(上下两根线都来自同一个开关 A,各接进 NAND 的一个输入口)
```

**② 用 NAND 搭一个 AND**

诀窍:AND = NOT(NAND)。NAND 本身就是"与门取了反",那我**再取反一次**就转回 AND 了。而上一步我们刚学会用 NAND 当 NOT。所以:

- 第一个 NAND:输入 A、B,得到 `NAND(A,B)`。
- 第二个 NAND:把它的两个输入都接到第一个的输出(这就是一个 NOT),再取反。
- 结果 = NOT(NAND(A,B)) = AND(A,B)。

```text
A ─┐
   ├─→ NAND ─┬─→ NAND ─→ 输出 (= A AND B)
B ─┘         └─
            (第二个 NAND 两输入都接上一级输出,当 NOT 用)
```

<div class="csf-note"><b>先猜后做</b>:搭好后,把 A、B 四种组合(00、01、10、11)都点一遍,看输出是不是正好等于前面那张 AND 真值表(只有 11 时灯亮)。如果完全对上,恭喜——你刚刚<b>亲手证明了一种门能造出另一种门</b>。这就是芯片世界的基石。</div>

## 💡 自己复述一遍

合上屏幕,用一句话说清楚:**逻辑门就是一条死规矩,把进来的 0/1 按"与/或/非"变成出去的 0/1;真值表是它的标准答案;NAND 一种门就够搭出全部。** 能说出来,这一讲就到位了。

## 🔧 翻车现场

<div class="csf-why"><b>翻车一:把"或(OR)"当成"异或(XOR)"。</b><br>最常见的错。日常说"A 或 B",我们脑子里常默认"二选一"(吃面<b>或</b>吃饭,不能都吃)。但逻辑里的 OR 是"<b>有一个真就真,都真也真</b>",1 OR 1 = 1。真正"不同才真、二选一"的是 XOR。<b>解法</b>:背最后一行——OR 在 (1,1) 出 1,XOR 在 (1,1) 出 0,区别只在这一行。</div>

<div class="csf-why"><b>翻车二:真值表行数数错、漏行。</b><br>行数 = 2 的输入个数次方。1 个输入 → 2 行;2 个输入 → 4 行;3 个输入 → 8 行。很多人写 2 输入只写 3 行(把 01 和 10 当成一种),结果判断全错。<b>解法</b>:像二进制计数一样列输入——00、01、10、11,从小到大一个不落,自然就不漏。</div>

<div class="csf-why"><b>翻车三:以为门电路能"记住"上一次输入。</b><br>逻辑门是<b>组合逻辑</b>:输出只由<b>此刻</b>的输入决定。你这一秒给 (1,1),它就出 1;下一秒改成 (1,0),它立刻变,完全不记得刚才给过什么。"能记住"的电路(寄存器、内存)是另一套东西——要靠把输出再绕回去当成自己的输入这样一种结构(术语叫**反馈环路**),本系列后面才会专门讲。<b>解法</b>:做题时只盯当前这一行输入,别脑补"历史"。</div>

<div class="csf-why"><b>翻车四:模拟器里灯不亮,以为门坏了。</b><br>九成是<b>线没连到点上</b>,或者开关没切到 1。<b>解法</b>:检查每根线两端是不是都吸附在小圆点上(没连上的线通常是灰色/虚的),再确认输入开关确实是亮的状态。</div>

## ✅ 自检三问

1. 与门、或门、非门各在什么情况下输出 1?(分别用一句话说)
2. 一个有 3 个输入的逻辑门,它的真值表有多少行?为什么?
3. 为什么说逻辑门"没有记忆"?这和内存有什么本质区别?

(答不上来别急,回到对应小节再搭一遍模拟器,比硬背管用。)

## 🚀 挑战

在模拟器里**只用 NAND 门搭出一个 OR 门**,并填出它的真值表验证。

提示(想自己憋出来就别看):OR(A,B) = NAND( NOT A, NOT B )。也就是先用 NAND 把 A、B 各自取反,再把这两个取反结果送进一个 NAND。一共要用 **3 个 NAND**。搭完把 00/01/10/11 四种都点一遍,对照前面的 OR 真值表,看是不是只有 (0,0) 灯灭。

<div class="csf-note">这道题<b>请自己搭、自己验</b>。如果卡住了,可以让 AI 给你<b>讲思路</b>(比如"为什么两次取反能变出 OR"),但<b>电路一定自己连</b>——连线时的那点"咔哒对上了"的手感,是 AI 没法替你获得的,也正是这门课要给你的东西。</div>

## 📦 复制带走

<div class="csf-card"><b>本讲要点</b><br>1. <b>三个基本门</b>:AND(都为 1 才 1)、OR(有一个 1 就 1)、NOT(取反)。OR ≠ XOR——XOR 是"不同才 1"。<br>2. <b>真值表</b>是逻辑门的标准答案;行数 = 2 的输入个数次方,列输入要像二进制计数一样一个不漏。<br>3. <b>组合逻辑没有记忆</b>:输出只看此刻输入,不记历史。这和内存有本质区别。<br>4. <b>NAND 是通用门</b>:只用它就能搭出 NOT、AND、OR……乃至整个 CPU。这是芯片制造的地基。</div>

下一讲(第05讲《加法器:用逻辑门搭出会算数的电路》),我们就拿今天这几个门——尤其是 XOR——拼出一个真能做二进制加法的电路。到时你会亲眼看到:**算术,原来真的就是一堆开关。**
