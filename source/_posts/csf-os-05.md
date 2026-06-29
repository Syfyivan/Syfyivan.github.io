---
title: "《计算机基本功路线图 · 操作系统》第05讲 · 你的程序住在哪：内存是怎么分的"
date: 2026-07-06 14:00:00
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

<div class="csf-key-note">📍 <strong>一句话点题：</strong>程序运行时，它的代码和数据并不是住在硬盘里，而是被搬进了一块"通电才有、断电就没"的临时工作台——内存。这一讲我们就弄清楚：内存到底是什么、它和硬盘有什么区别、一个程序在内存里被分成了哪几块，以及"内存不足"到底是怎么回事。</div>

上一讲我们看了一个 CPU 怎么靠飞快地切换，"同时"伺候几十个程序。但这里有个问题被我们悄悄跳过了：CPU 要执行一个程序，得先知道这个程序的**指令和数据放在哪**。它们放在哪？放在**内存**里。

内存是初学者最容易和硬盘搞混的东西，也是日常最常听到的词："内存不够了""这软件太吃内存""加根内存条就快了"。这一讲，我们把它彻底讲清楚。

## 🎯 这一讲你会学到什么

<div class="csf-note">读完并动手做完，你应该能做到：<br>1. 用自己的话说清 <strong>内存(RAM)</strong> 和 <strong>硬盘(存储)</strong> 到底有什么不同，不再把两者搞混。<br>2. 知道一个程序在内存里大致被分成 <strong>代码区 / 栈 / 堆</strong> 几块，各自装什么。<br>3. 理解什么叫 <strong>进程地址空间</strong>——每个程序都觉得自己有一整块内存。<br>4. 明白 <strong>"内存不足"（也叫 OOM，第四步会细讲这个缩写）</strong> 发生时，电脑会变慢甚至杀进程，而这跟你硬盘还剩多少 G 毫无关系。</div>

## 🛠 跟我做 <span class="csf-b csf-core">必读</span>

先讲清楚概念，再动手观察。这一讲的动手练不需要写代码，**靠你自己的眼睛去看内存数字在涨在落**——这比任何讲解都直观。

### 第一步：分清内存和硬盘 <span class="csf-b csf-key">重点</span>

这是整讲最重要的一刀，必须先切清楚。打个比方：

<div class="csf-note">把电脑想象成一个<strong>厨房</strong>。<br>🗄️ <strong>硬盘</strong> = 储藏室（冰箱、橱柜）。东西平时都囤在这里，<strong>关灯锁门也不会丢</strong>，但你没法直接在储藏室里切菜炒菜——太远、太挤。<br>🍳 <strong>内存(RAM)</strong> = 料理台（操作台面）。你要做哪道菜，就把对应的食材从储藏室<strong>搬到台面上</strong>，在这里切、炒、装盘。台面又快又顺手，但<strong>面积有限</strong>，而且<strong>一停电、一打烊，台面就被收空了</strong>。</div>

把这个比方翻译成计算机的话：

| | 硬盘 / SSD（存储，SSD 是更快的一种硬盘，先当硬盘看就行） | 内存 / RAM |
|---|---|---|
| 作用 | 长期**存放**文件、程序、照片 | 程序**运行时**临时存放代码和数据 |
| 断电后 | 数据**还在** | 数据**全没**（这点最关键） |
| 速度 | 慢（相对而言） | 快得多 |
| 容量 | 大，常见 256G～2T | 小，常见 8G～32G |
| 日常说法 | "我硬盘还有 500G" | "我内存 16G" |

<div class="csf-key-note">🔑 记住这一句就够了：<strong>硬盘是"存"，内存是"用"。</strong> 程序双击之后，操作系统会把它需要的部分从硬盘<strong>搬进内存</strong>，CPU 只跟内存打交道。所以"硬盘还剩 500G"和"内存够不够用"是<strong>两件完全不相干的事</strong>——这正是本讲要掰清的头号误区，记住它。</div>

<details class="csf-fold"><summary>那为什么不干脆全用内存，不要硬盘？<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
<div class="csf-note">因为内存有两个硬伤：<strong>一断电就清空</strong>，<strong>而且贵、容量小</strong>。你写了一晚上的文档如果只在内存里，电脑一关机就灰飞烟灭了——所以"保存"这个动作，本质就是把内存里的数据<strong>写回硬盘</strong>，让它能长期留存。反过来，硬盘虽然能长期存又便宜，但速度太慢，CPU 直接从硬盘读指令会被拖死。于是就有了这套分工：硬盘负责"留得住"，内存负责"跑得快"，操作系统在中间来回搬运。</div>
</details>

### 第二步：一个程序在内存里分成哪几块 <span class="csf-b csf-key">重点</span>

当一个程序跑起来（也就是变成一个**进程**，回忆第02、03讲），操作系统会给它划一块内存，叫**地址空间**。你可以理解成：操作系统给每个程序发了一块"专属工作台"，程序在自己台子上爱怎么摆怎么摆，**还以为整张桌子都是自己的**（下一讲《虚拟内存》会揭穿这个"美好的错觉"）。

这块工作台内部，大致分成这么几个区，每块装的东西不一样：

<div class="csf-legend">📦 <strong>代码区</strong>：放程序的指令本身（你写的代码"编译"后的样子；编译就是把你写的、人能看懂的代码，翻译成电脑能直接执行的指令）。只读，跑的时候一般不变。<br>🧱 <strong>栈(Stack)</strong>：放函数调用时的"临时小账本"——比如函数的局部变量、参数、返回地址（这些都是函数运行时用到的小数据，是什么后面学编程时再细说，这里有个印象就行）。函数一调用就摞上去一层，函数一返回就<strong>自动收掉</strong>，整齐、自动、快。<br>🗃️ <strong>堆(Heap)</strong>：放你<strong>主动申请</strong>的、生命周期不定的大块数据。需要时手动（或由语言）申请，<strong>不用时要还回去</strong>，否则就堆着不走（这就是"内存泄漏"的来源）。</div>

栈和堆的区别，初学者常背不下来，再用一个比方拴牢：

<div class="csf-note">🧱 <strong>栈</strong>像叠盘子：你进一个函数，就在最上面叠一摞盘子（这函数用的变量）；函数结束，<strong>这摞盘子整摞端走</strong>，干净利落。它"后进先出"，所以叫"栈"。<br>🗃️ <strong>堆</strong>像一间大仓库：你想存点东西就去仓库要个货位（申请内存），地址给你；东西不要了得<strong>主动去登记退掉</strong>，不然这个货位就一直被占着，仓库慢慢就满了。</div>

<div class="csf-why">为什么要分这么细？因为<strong>管理方式不同</strong>。栈能自动回收、速度快，但放不下太大、太久的东西；堆灵活、能放大块数据、能活很久，但管理麻烦、容易出错（忘了还）。后面学编程时，"栈溢出""内存泄漏"这些词全是从这儿来的——你今天先有个画面就够了，不用现在就背术语。</div>

<details class="csf-fold"><summary>"栈溢出 / Stack Overflow"是怎么来的？<span class="csf-b csf-skip">选学</span></summary>
<div class="csf-note">栈这摞盘子是有高度上限的。如果一个函数<strong>无限地调用自己</strong>（写错的递归），盘子越叠越高，叠到超过上限，"哗"地塌了——这就是栈溢出（没错，那个著名问答网站 Stack Overflow 就是用它命名的）。你现在不用会写递归，只要知道：<strong>栈不是无限大的</strong>，一个函数没完没了地一层套一层调用自己，就会把栈撑爆。</div>
</details>

### 第三步：亲眼看内存涨落（动手练）<span class="csf-b csf-core">必读</span>

概念讲完了，现在请你**离开阅读、打开电脑**，亲眼确认"内存是被实时占用和释放的"。

<div class="csf-key-note">✋ <strong>先猜后做：</strong>在动手前，先在心里押个数——你觉得你现在打开的所有程序里，<strong>最吃内存的会是哪 3 个</strong>？浏览器？聊天软件？还是某个游戏？记下你的猜测，等会儿对答案。</div>

**① 打开任务管理器，按内存排序**

- **Windows**：按 <code>Ctrl + Shift + Esc</code> 打开"任务管理器"，进"进程"标签，点一下**"内存"那一列的列头**，让它从高到低排序。
- **macOS**：先按 <code>Command + 空格</code> 调出"聚焦搜索"（屏幕正中间会弹出一个搜索框），输入 <code>活动监视器</code>（英文系统是 Activity Monitor）回车打开它；然后切到**"内存"**标签页，点"内存"列头排序。

看最上面 3 个进程——它们就是当前最吃内存的。**和你刚才的猜测对一下**。很多人会惊讶：原来浏览器这么能吃。

**② 让内存数字涨起来**

打开浏览器，**先记下它当前占用的内存数字**。然后做一件事：

```text
1. 在浏览器里"哗哗哗"连开 10 个标签页，
   每个都打开一个内容多的网页（视频站、购物站、新闻站都行）。
2. 切回任务管理器 / 活动监视器，盯着浏览器那一行的内存数字。
3. 你会看到这个数字在往上涨。把它记下来。
```

<div class="csf-key-note">✋ <strong>再猜一次：</strong>如果我现在把这 10 个标签页<strong>全部关掉</strong>，那个内存数字会怎样？掉回原来的水平？掉一部分？还是纹丝不动？先押一个再往下做。</div>

**③ 让内存数字落下去**

把刚才开的 10 个标签页**全部关掉**，等几秒，再看那个内存数字。你会看到它**明显往下掉**——刚才那些网页占的内存，被**释放**回去了。

<div class="csf-note">📝 把三个数字记成一行小账：<br><strong>开 10 个标签前</strong>：____ MB　→　<strong>开满后</strong>：____ MB　→　<strong>全关后</strong>：____ MB<br>看着这三个数字，你就亲手验证了这一讲最核心的一句话：<strong>内存是被程序实时占用、又实时释放的临时空间</strong>，不是硬盘那种"存进去就一直在"的仓库。</div>

> 小提示：全关后的数字可能不会**完全**掉回最初值，这很正常——浏览器会留一点"以备再用"，操作系统的内存管理也比"用完立刻全还"更聪明。下一讲会解释为什么"剩余内存少"不一定是坏事。你今天看到"明显下降"就达到目的了。

### 第四步：内存不够时会发生什么（OOM）<span class="csf-b csf-key">重点</span>

内存这张料理台是**有限**的。如果你同时开的程序要用的内存，**加起来超过了你的内存条容量**，会发生什么？

操作系统不会立刻崩，它有几招应急：

<div class="csf-legend">1️⃣ <strong>先腾挪</strong>：把暂时不用的数据，从内存偷偷挪到硬盘上一块叫"<strong>交换区 / 虚拟内存</strong>"的地方，给当前要用的腾位置。代价是——硬盘比内存慢得多，于是你电脑开始<strong>变卡、转圈、半天没反应</strong>。<br>2️⃣ <strong>实在不够，就杀</strong>：如果腾挪也救不了，系统会狠心<strong>杀掉</strong>某个吃内存的进程，腾出空间保住整机。这就是大名鼎鼎的 <strong>OOM（Out Of Memory，内存耗尽）</strong>——你可能见过程序"啪"地闪退、或手机里后台 App 被自动清掉，很多就是它干的。</div>

<div class="csf-key-note">🔑 把这条钉进脑子：<strong>"内存不足"和"硬盘满了"是两回事。</strong> 程序卡死、闪退、提示 Out of Memory，多半是<strong>内存（RAM）不够</strong>，跟你硬盘还剩多少 G <strong>没有直接关系</strong>。下面"翻车现场"会专门拿这句话开刀。</div>

<details class="csf-fold"><summary>这跟 AI 帮我写代码有什么关系？<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
<div class="csf-note">关系很大。等你开始跑程序、跑 AI 模型、处理大文件，最常撞上的报错之一就是各种 <code>Out of Memory</code> / <code>内存不足</code> / 进程被杀。如果你脑子里没有"内存是有限的、用超了就会被腾挪甚至被杀"这个画面，你只会把报错原样甩给 AI，然后照单全收它的方案——可它给的方案对不对、是真省内存还是只是绕过了报错，你<strong>判断不了</strong>。看懂内存这一层，你才有资格审查 AI 的答案，而不是盲信。这正是这门课反复强调的：<strong>原理你得自己懂，AI 只当陪练。</strong></div>
</details>

## 💡 自己复述一遍

合上屏幕，用**一句话**回答："硬盘和内存有什么不同，一个程序在内存里大致分成哪几块？"

<div class="csf-note">能顺出这个意思就过关：<strong>硬盘是断电也不丢的长期仓库（管"存"），内存是断电就清空的临时工作台（管"用"）；程序跑起来后，它在内存里大致分成放指令的代码区、自动收放局部变量的栈、和手动申请大块数据的堆。</strong> 说不全？回到"跟我做"第一、二步再看一遍那两个比方。</div>

## 🔧 翻车现场

<div class="csf-note">🚩 <strong>翻车一：把内存和硬盘当成一回事。</strong><br>典型台词："我硬盘还有 500G，怎么会提示<strong>内存不足</strong>？"<br><strong>原因：</strong>把"存东西的地方"和"跑程序的地方"混成了一个。硬盘大≠内存大，两者是独立的两块硬件、两个数字。<br><strong>解法：</strong>记住"硬盘管存、内存管用"。内存不足 → 看任务管理器里内存这一列、考虑关程序或加内存条；硬盘满了 → 是另一回事，去清磁盘空间。两个问题，两套药，别拿错。</div>

<div class="csf-note">🚩 <strong>翻车二：以为关了窗口内存就立刻全部还清。</strong><br><strong>原因：</strong>有些程序关掉主窗口其实还在后台运行（屏幕右下角、Mac 是右上角那一排小图标的地方，也就是"托盘"，里面还有它的图标）；而且系统/浏览器会"留点缓存以备再用"，不会用完立刻全还。<br><strong>解法：</strong>如果想真正释放，去任务管理器里确认进程是否真的退出了；看到"全关后没完全掉回原值"别慌，这通常是<strong>正常且聪明</strong>的行为，不是 bug。</div>

<div class="csf-note">🚩 <strong>翻车三：看到"可用内存很少"就吓得拼命清理。</strong><br>典型台词："我 16G 内存被用了 14G，是不是要爆了？"<br><strong>原因：</strong>现代操作系统会主动拿空闲内存做缓存来加速——<strong>内存空着才是浪费</strong>。"用得多"不等于"不够用"。<br><strong>解法：</strong>真正该看的是有没有<strong>卡顿、疯狂读写硬盘、程序闪退</strong>这些"不够用"的症状，而不是单看那个占用百分比。这点下一讲《虚拟内存》会讲透。</div>

## ✅ 自检三问

<div class="csf-legend">1️⃣ 我能不用比喻、直接说出<strong>内存和硬盘最关键的一个区别</strong>吗？（提示：断电之后……）<br>2️⃣ <strong>栈</strong>和<strong>堆</strong>分别大致装什么、谁是"自动收摊"、谁要"手动归还"？<br>3️⃣ 朋友说"我硬盘还有 1T，程序却报内存不足，肯定是电脑坏了"，我能<strong>当场给他讲明白</strong>哪里想错了吗？</div>

三问都能顺下来，这一讲就扎实了。卡在第 3 问，说明头号误区还没掰透，回头重看"跟我做"第一步。

## 🚀 挑战

<div class="csf-key-note">🎯 <strong>动手任务（请自己做，别让 AI 代答）：</strong><br>1. 打开任务管理器/活动监视器，<strong>找出此刻最吃内存的 3 个程序</strong>，把名字和占用数字记下来。<br>2. 完整做一遍"开 10 个标签 → 记数字 → 全关 → 再记数字"，<strong>写下那一行三个数字的小账</strong>，并用一句话说说你看到了什么。<br>3. 进阶（可选）：去查一下你这台电脑<strong>装了多大内存（多少 GB RAM）</strong>，再查一下<strong>硬盘总容量</strong>，把这两个数字并排写下来——亲手确认它们是两个不同的数。</div>

<div class="csf-why">为什么这个挑战值得认真做：这一讲所有概念，都能被你电脑上那几个会涨会落的数字<strong>当场验证</strong>。亲眼看过一次"内存涨上去又掉下来"，胜过把定义背十遍。这种"自己观察、自己确认"的习惯，会跟着你走完整门课。AI 可以陪你讨论你看到的现象，但<strong>那个去打开任务管理器、盯着数字变化的人，必须是你。</strong></div>

## 📦 复制带走

<div class="csf-card">🗄️ <strong>硬盘管"存"，内存管"用"。</strong> 硬盘断电不丢、大而慢，负责长期存放；内存断电清空、小而快，负责程序运行时临时干活。"硬盘剩多少 G"和"内存够不够"是两件不相干的事。<br>🧱 <strong>一个程序在内存里分块住。</strong> 代码区放指令；栈放局部变量、自动收放（像叠盘子）；堆放主动申请的大块数据、要手动归还（像租仓库货位）。<br>💥 <strong>内存有限，用超了会出事。</strong> 先把闲数据挪到硬盘（电脑变卡），实在不够就杀进程（OOM、闪退）。这跟硬盘容量无关。<br>👀 <strong>眼见为实。</strong> 任务管理器里那个会涨会落的内存数字，就是这一讲所有道理的现场证据——亲手看一次，胜过背十遍。</div>

下一讲（第06讲《人人都以为自己独占内存：虚拟内存》），我们就来揭穿这一讲埋下的那个"美好错觉"——为什么每个程序都觉得整块内存是自己的，操作系统又是怎么用一个巧妙的把戏圆下这个谎的。到时见。
