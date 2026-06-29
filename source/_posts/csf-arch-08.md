---
title: "《计算机基本功路线图 · 计算机组成原理》第08讲 · 指令与机器码:CPU 能直接读的'命令'"
date: 2026-07-08 17:00:00
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

<div class="csf-key-note">你写的 <code>a = b + c</code>,CPU 其实看不懂。它只认一串串 0 和 1。这一讲我们就来当一回翻译,看清楚那行人类语言,是怎么一步步变成 CPU 能"直接读"的命令的——以及在它和 0/1 之间,还藏着一个常被忽略的中间人。</div>

上一讲我们拆开了 CPU 这座"微型工厂",看到了里面的运算器、寄存器、控制器。但工厂建好了不会自己干活,得有人下命令。这一讲就讲这些命令长什么样:它们叫**指令**,而 CPU 真正吃进去的,是指令的二进制形态——**机器码**。

## 🎯 这一讲你会学到什么

- 什么是**指令集(ISA)**,为什么说它是 CPU 的"说明书"
- 一条指令的两个零件:**操作码(opcode)** 和 **操作数(operand)**
- **汇编语言**和**机器码**到底差在哪——它们不是一回事
- 为什么 x86 的程序拿到 ARM 芯片上跑不了(你手机和电脑可能就是这俩)
- 动手:在网页工具里把 3 行 C 代码"看穿"成汇编;再用纸笔把一条指令亲手编成二进制

<div class="csf-note">这一讲有一处必须你<strong>亲手算</strong>的环节(把指令编成二进制)。别让 AI 替你编——它一秒就给你答案,但你会错过"原来命令就是这么拼出来的"那个开窍瞬间。AI 在这一讲只配当你的对答案的同桌,不是代笔。</div>

## 🛠 跟我做 <span class="csf-b csf-core">必读</span>

### 第一步:先认识"指令"这个词

你平时写的代码,比如 Python 的 `c = a + b`,是给**人**看的、给**编译器**看的。但 CPU 不认识 `+`,也不认识变量名 `a`。它能做的事情,其实少得可怜,无非是:把某个数搬进来、把两个数加起来、跟某个数比大小、跳到另一个地方继续干……

这些 CPU 天生就会、能一口吃下去的最小动作,每一个就叫一条**指令(instruction)**。

<div class="csf-why">打个比方:CPU 像一个只会照菜谱执行的厨工,而且菜谱上只能写他认识的几十个动作——"取一个鸡蛋""打散""倒进锅"。你不能直接对他说"做个蛋炒饭",得拆成一连串他认识的小动作。一连串指令排起来,就是一段程序。</div>

### 第二步:CPU 认识的全部命令,写在一张"说明书"里 <span class="csf-b csf-key">重点</span>

每一种 CPU 在出厂时,就规定死了"我认识哪些指令、每条指令长什么样"。这张清单,就叫**指令集架构**,英文 Instruction Set Architecture,缩写 **ISA**。

你可以把 ISA 理解成 CPU 的"说明书"或"合同":它向写程序的人承诺——"只要你按我这上面的格式下命令,我保证照做"。

常见的 ISA 有这么几种,先眼熟一下:

| ISA 名字 | 谁在用 | 风格 |
|---|---|---|
| **x86 / x86-64** | 绝大多数台式机、笔记本、服务器(Intel / AMD) | 指令多、花样杂 |
| **ARM** | 几乎所有手机、平板,以及苹果 M 系列芯片的 Mac | 指令精简、省电 |
| **RISC-V** | 新兴的开放架构,教学和很多新硬件爱用 | 开源、干净 |

<div class="csf-note">记住一句话:<strong>ISA 不通用</strong>。x86 的指令和 ARM 的指令是两套完全不同的"语言"。这正是本讲一个大坑的根源,后面"翻车现场"细说。</div>

### 第三步:拆开一条指令——操作码 + 操作数 <span class="csf-b csf-core">必读</span>

随便拿一条人能读的指令来看,比如:

```text
ADD R1, R2, R3
```

它的意思是:把寄存器 R2 和 R3 里的数加起来,结果放进 R1。读出来就是"R1 = R2 + R3"。

<div class="csf-why">小提醒:这里的<strong>寄存器</strong>是 CPU 内部用来临时存数的小格子(上一讲讲过),你可以把 R1、R2、R3 想成 CPU 手边的几个小盒子。CPU 干活时要算的数,得先放进这些小盒子里,它才够得着。</div>

这条指令拆成两部分:

- **操作码(opcode)**:`ADD`,告诉 CPU"要做什么动作"——这里是"加法"。
- **操作数(operand)**:`R1, R2, R3`,告诉 CPU"对谁动手、结果放哪"。

<div class="csf-why">就像一句命令:"<strong>搬</strong>(操作码)<strong>那箱书</strong>到<strong>三楼</strong>(操作数)"。动词决定干什么,后面的名词决定对谁干、干到哪。几乎每条指令都是这个结构:一个动作,加上几个对象。</div>

`ADD`、`R1` 这种人能读的写法,叫**助记符(mnemonic)**——专门为了让人好记。CPU 并不认识 "ADD" 这三个字母,它最终要的是一串二进制。这就引出了下一步。

### 第四步:先猜后做——把一条指令编成二进制 <span class="csf-b csf-key">重点</span>

现在我们自己定一套超简化的"迷你 ISA",亲手把 `ADD R1, R2, R3` 编码成机器码。规则如下(这套规则是我们自己约定的,真实 CPU 复杂得多,但道理一模一样):

```text
一条指令固定 16 位(bit),从左到右分成 4 段,每段 4 位:

[操作码 opcode][目标寄存器][源寄存器1][源寄存器2]
   4 位          4 位         4 位        4 位

操作码对照表:
  ADD = 0001
  SUB = 0010
  MOV = 0011

寄存器编号(用二进制 0~15):
  R0 = 0000   R1 = 0001   R2 = 0010
  R3 = 0011   R4 = 0100   ...
```

现在,**先别往下看,自己拿张纸,试着把 `ADD R1, R2, R3` 写成 16 位二进制**。

先猜:它应该是哪四段拼起来?

……

揭晓:

```text
ADD  ->  0001   (操作码)
R1   ->  0001   (目标)
R2   ->  0010   (源1)
R3   ->  0011   (源2)

拼起来: 0001 0001 0010 0011
```

所以 `ADD R1, R2, R3` 这条人话指令,在我们的迷你 CPU 眼里就是 `0001000100100011` 这 16 个 0 和 1。**这串二进制,才是真正的机器码。** CPU 取到这 16 位,先看头 4 位 `0001` 知道是加法,再依次读出三个寄存器编号,然后老老实实算 R2+R3 放进 R1。

<div class="csf-note">体会一下这个过程:CPU 不"理解"加法,它只是按位置切开二进制、查表、执行。所谓"看懂命令",本质就是<strong>按固定格式切片 + 查表</strong>。这就是 ISA 这张说明书最实在的作用——它规定了每一段在哪、各是几位。</div>

再练一条(这条**你自己来**,答案藏在折叠里,先做完再核对):把 `SUB R4, R4, R1`(意思是 R4 = R4 - R1)编成 16 位二进制。

<details class="csf-fold"><summary>核对答案<span class="csf-b csf-skim">先自己做 · 再点开</span></summary>
SUB = 0010,R4 = 0100,R4 = 0100,R1 = 0001。<br>
拼起来:<code>0010 0100 0100 0001</code>,即 <code>0010010001000001</code>。<br>
如果你算对了——恭喜,你已经手动当了一回汇编器的一小部分工作。如果错了,大概率错在寄存器编号或者段的顺序上,回去对着格式再切一遍。
</details>

### 第五步:用真工具看真东西——Compiler Explorer <span class="csf-b csf-core">必读</span>

迷你 ISA 是玩具,现在看点真的。打开浏览器,访问 **godbolt.org**(Compiler Explorer,一个免费在线工具,不用安装、不用注册)。

左边是 C 代码框,右边会**实时**显示它编译出来的汇编。先把左边清空,贴进这 3 行:

```c
int add(int a, int b) {
    return a + b;
}
```

在页面上方的编译器下拉框里,选一个 x86-64 的 gcc。这里的 **gcc** 是一种很常见的编译器(就是前面说的、把 C 代码翻成汇编的那种工具),下拉框里会列出一堆类似 "x86-64 gcc 13.2" 的选项——只要是**带 gcc 字样、并且前面是 x86-64** 的那个就行,默认通常已经选好了,不用纠结具体版本号。**先猜一下**:这么简单一个加法,右边会冒出几行汇编?三行?十行?

看右边结果,核心通常就这么几行(不同版本略有差异,抓主干看):

```asm
add:
        mov     eax, edi      ; 把第一个参数 a 放进 eax
        add     eax, esi      ; eax = eax + 第二个参数 b
        ret                   ; 返回(eax 里就是结果)
```

<div class="csf-why">这里冒出来的 <code>eax</code>、<code>edi</code>、<code>esi</code>,和我们迷你 ISA 里自己起的 R1、R2 一样,都是寄存器的名字——只不过这是真实 x86 给寄存器起的官方名字。<br>那 <code>edi</code> 里怎么一上来就装着"第一个参数 a"呢?这是因为函数被调用时,系统有一套固定约定:第一个参数 a 会被预先放进 <code>edi</code> 寄存器,第二个参数 b 放进 <code>esi</code>。所以函数一开头不用自己去取参数,它们已经在寄存器里等着了。(这套约定后面讲"函数调用"时会细说,现在你只要知道"参数被预先放进了寄存器"即可。)</div>

看到 `add eax, esi` 了吗?这就是真实 x86 里的加法指令,和我们迷你 ISA 的 `ADD` 是一个意思,只是寄存器叫 `eax`、`esi`,格式更复杂。你写的一行 `a + b`,落到这里就是一条 `add` 指令。

<div class="csf-note">玩一下"先猜后做":把上方编译器换成一个 <strong>ARM gcc</strong>(下拉框里搜 "ARM"),同样 3 行 C 代码,猜猜右边汇编会不会变?——会变,而且指令名都不一样了(ARM 里加法是 <code>add w0, w0, w1</code> 这种味道)。同一段 C,换个 ISA,机器码完全是另一套。这就亲眼证实了"指令不通用"。</div>

<details class="csf-fold"><summary>为什么右边有时还冒出一堆 push/pop?<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
如果你没开优化,编译器会生成很多"保管现场"的指令,比如把寄存器先存到内存(push)、用完再取回(pop),还有操作栈的代码。这些是为了函数调用规规矩矩、不互相踩,属于后面讲操作系统/函数调用时的内容。现在你只要能在一堆指令里认出那条 <code>add</code> 主角就够了。<br>怎么开优化呢?在 godbolt 上,编译器下拉框的<strong>右边</strong>有一个一长条的输入框,通常叫 "Compiler options"(编译选项);把光标点进去,直接敲进 <code>-O2</code> 这三个字符(注意是<strong>大写字母 O</strong>,不是数字 0),不用回车,右边的汇编会自动刷新。加上 <code>-O2</code> 再看一遍,会清爽很多——编译器把废动作都优化掉了。
</details>

## 💡 自己复述一遍

合上屏幕,用一句话说清楚:**从 `a + b` 到一串 0/1,中间经过了哪几道手?谁负责把人话翻译成机器码?**

(提示要点:源码 → 编译/汇编 → 机器码;助记符 `ADD` 不是机器码;汇编器是那个翻译。)

## 🔧 翻车现场 <span class="csf-b csf-core">必读</span>

### 翻车一:以为"汇编 = 机器码"

这是头号误区。`ADD R1, R2, R3` 这种汇编,是给**人看的助记符**;`0001000100100011` 才是 CPU 吃的机器码。中间**还差一步翻译**,干这活的程序叫**汇编器(assembler)**。

```text
你的源码 (c = a + b)
      │  编译器 compiler
      ▼
汇编代码 (add eax, esi)   ← 人能读,但 CPU 不能直接读
      │  汇编器 assembler
      ▼
机器码 (一串 0/1)         ← CPU 直接读这个
```

记住:汇编和机器码是**一一对应、但形态不同**的两样东西。汇编是机器码的"人类可读版",不是机器码本身。

### 翻车二:以为指令在所有电脑上通用

很多初学者会很自然地以为"程序就是程序,哪台电脑都能跑"——其实不行,我们看看为什么。一个为 x86 编译好的程序,直接拿到 ARM 芯片(比如你的手机、苹果 M 系列 Mac)上,**CPU 根本读不懂那些机器码**,跑不起来。

因为 x86 和 ARM 是两套不同的 ISA,同一个"加法"动作,opcode 的二进制都不一样,指令格式也不一样。这就是为什么软件要分"Windows x64 版""Mac ARM 版""安卓 ARM 版"——它们得各编译一份。

<div class="csf-why">那为什么苹果 M 芯片的 Mac 还能跑一些老的 x86 程序?因为系统里有个叫 Rosetta 的"翻译层",在运行时把 x86 指令现场翻译成 ARM 指令。这是"翻译",不是"通用",而且要付出性能代价。能翻译,恰恰说明它们本来不互通。</div>

### 翻车三:把助记符 `ADD` 当成 CPU 能直接读的东西

`ADD`、`MOV`、`SUB` 这些大写词是**给人记的标签**,CPU 里没有"认字"的部件。CPU 的译码器认的是二进制位:看到头几位是 `0001` 就知道该走加法那条电路。别把人类的便利,误当成机器的能力。

## ✅ 自检三问

1. 一条指令由哪两大部分组成?各自回答 CPU 的什么问题?(提示:做什么 / 对谁做)
2. 汇编语言和机器码的区别是什么?谁把前者变成后者?
3. 为什么同一个程序在 x86 电脑和 ARM 手机上不能直接互换运行?

(三问都能不看上文答出来,这一讲就过关了。卡住的那条,回去重读对应小节。)

## 🚀 挑战

给你这套迷你 ISA 的扩充规则:

```text
MOV = 0011,格式是 [opcode][目标][源][0000]
(MOV 只用两个寄存器,最后 4 位填 0000 占位)
含义: MOV R目标, R源  ->  把源寄存器的值复制到目标寄存器
```

**任务**:用纸笔,把下面这小段"程序"逐条编成机器码,写出 3 串 16 位二进制:

```text
MOV R1, R2        ; R1 = R2
ADD R3, R1, R0    ; R3 = R1 + R0
SUB R3, R3, R2    ; R3 = R3 - R2
```

编完后,再去 godbolt 上贴一段你自己写的 3~4 行 C(比如一个减法函数、一个返回常数的函数),换 x86 和 ARM 各看一遍汇编,找出里面对应的那条核心指令。**这两步都自己动手,别问 AI 要现成答案**;真想验证,可以把你的结果发给 AI 让它当判卷老师——但判卷前,先自己写满那张纸。

## 📦 复制带走

<div class="csf-card">
<strong>1. 指令 = 操作码 + 操作数。</strong>操作码说"做什么"(如 ADD),操作数说"对谁做、放哪"(如 R1,R2,R3)。<br>
<strong>2. ISA 是 CPU 的说明书。</strong>它规定了这颗 CPU 认识哪些指令、每条几位、各段在哪。x86 / ARM / RISC-V 是不同的 ISA,互不通用。<br>
<strong>3. 汇编 ≠ 机器码。</strong>ADD 这种助记符是给人看的,要经过<strong>汇编器</strong>翻译成一串 0/1(机器码),CPU 才能直接读。<br>
<strong>4. "看懂命令"本质是切片+查表。</strong>CPU 不理解加法,它只是按固定格式切开二进制、查 opcode 表、执行对应电路。
</div>

下一讲(第09讲《取指-译码-执行:CPU 的心跳》),我们就盯着这串机器码,看 CPU 是怎么一拍一拍地把它取进来、切开看懂、再真正执行的——也就是 CPU 永不停歇的那个"心跳"循环。
