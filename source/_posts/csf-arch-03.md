---
title: "《计算机基本功路线图 · 计算机组成原理》第03讲 · 文字、图片、声音怎么都变成数"
date: 2026-07-08 12:00:00
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

<div class="csf-key-note">上一讲我们让数字学会了带正负号、还学会了用十六进制给人看。可计算机里装的不只是数字——还有你正在读的这些字、相册里的照片、耳机里的歌。它们最后<strong>全都是数</strong>。这一讲就拆开看：一个"你"字、一个像素、一段声音，到底是怎么变成一串 0 和 1 的。说穿了只有一句话——<strong>计算机不认识"字"，它只认识数；所有内容,都是先约定好"什么数代表什么",再存下来。</strong></div>

## 🎯 这一讲你会学到什么

- 为什么计算机存什么都得先变成数,这件事根本绕不开
- **ASCII**:最早的"字符↔数字"对照表,以及它为什么只够用一阵子
- **Unicode 与 UTF-8**:全世界的字怎么塞进一张表,又怎么省着存
- **字符**和屏幕上的**字形**到底是不是一回事
- 图片怎么用**像素 + RGB**变成数,声音怎么用**采样 + 量化**变成数
- 动手:用 Python 查一个字的编码、看汉字占几个字节,再用 `xxd` 把一个文件"摊开"成十六进制看个明白

<div class="csf-note">这一讲代码不多,但每一段都建议<strong>自己敲一遍、自己先猜结果</strong>。编码这东西,光看会觉得"懂了",一上手才发现"咦怎么和我想的不一样"——那个"咦"的瞬间,才是真学到了。</div>

## 🛠 跟我做

### 第一步:为什么非得变成数 <span class="csf-b csf-core">必读</span>

回忆第01讲:计算机底层只有一种东西——**开关的通或断**,我们记成 1 和 0。它没有"眼睛"能看字,也没有"耳朵"能听声。

所以想让它存一个"A",只有一个办法:**事先约定**——"我们就规定数字 65 代表 A"。存的时候存 65,显示的时候查表把 65 翻回 A。这张"数字↔内容"的对照表,就叫**编码**。

<div class="csf-why">关键认知:编码不是计算机"算"出来的,是<strong>人定的约定</strong>。就像摩尔斯电码规定"嘀嗒"是 A——电报机本身不懂英文,是人和人约好了。计算机的所有编码,本质都是这种"约好的对照表"。理解这一点,后面全部豁然开朗。</div>

### 第二步:ASCII——最早的对照表 <span class="csf-b csf-key">重点</span>

上世纪 60 年代,美国人定了一张表叫 **ASCII**(读作"阿斯克依")。它把英文字母、数字、标点、还有一些控制符号,各分配一个 0~127 之间的数字。

几个值得记住的:

| 字符 | ASCII 数字 |
|------|-----------|
| `A` | 65 |
| `a` | 97 |
| `0`(字符零) | 48 |
| 空格 | 32 |

注意 `A` 是 65、`a` 是 97,刚好差 32。还有,字符 `0`(键盘上敲的那个零)对应的是数字 **48**,**不是** 0——这是初学者最容易混的一点:屏幕上的"0"是个字符,它内部存的是 48。

为什么范围是 0~127?因为 ASCII 用 **7 个二进制位**,$2^7 = 128$,刚好 128 个位置(0 到 127)。不过计算机习惯一次按 **8 位(也就是 1 字节)** 来存,所以存的时候会在这 7 位前面补一个 0、凑够 8 位;最左边那一位(它在二进制里份量最大,所以也叫**最高位**)暂时空着没用。

<div class="csf-note"><strong>先猜后做</strong>:`a` 是 97,那 `b`、`c` 是多少?字符 `1`(字符一)又是多少?在脑子里答一下,等会儿用代码验证。</div>

### 第三步:动手查编码——ord 和 chr <span class="csf-b csf-core">必读</span>

打开终端,敲 `python3` 进入交互环境(第00讲装过 Python;没装的回去补一下)。`ord()` 把字符变成数字,`chr()` 把数字变回字符——正好一对。

**先别运行,先猜**:`ord('A')` 会输出几?`chr(97)` 会输出什么?

<div class="csf-note">下面代码块里每行开头的 <code>>>></code> 是 Python 自己显示的<strong>提示符</strong>,意思是"该你输入了",<strong>不用你敲</strong>。你只需要敲 <code>>>></code> 后面那部分(比如 <code>ord('A')</code>),然后回车;下面那些<strong>没有</strong> <code>>>></code> 的行,是电脑算完回给你的<strong>结果</strong>。</div>

```python
>>> ord('A')
65
>>> ord('a')
97
>>> ord('0')        # 字符"0",不是数字 0
48
>>> chr(97)
'a'
>>> chr(66)
'B'
```

猜中了吗?`ord('0')` 是 48 这一条,没猜中很正常,记住就好。

<div class="csf-why">这两个函数的名字也有来历:<code>ord</code> 是 ordinal(序号),<code>chr</code> 是 character(字符)。一个问"这个字符排第几",一个问"第几号是哪个字符"。</div>

### 第四步:128 个不够用——Unicode 登场 <span class="csf-b csf-key">重点</span>

ASCII 只有 128 个位置,装英文够了。可中文有几万个字,日文、韩文、阿拉伯文、emoji……全世界的符号加起来几十万个,128 个位置塞不下。

于是有了 **Unicode**:一张**超级大表**,目标是给世界上每一个字符都分一个唯一的编号(叫**码点**,code point)。比如:

| 字符 | Unicode 码点 |
|------|-------------|
| `A` | 65(和 ASCII 兼容,故意的) |
| `你` | 20320 |
| `好` | 22909 |
| `😀` | 128512 |

<div class="csf-note">注意:Unicode 只负责"<strong>谁是几号</strong>"这件事,它<strong>不规定</strong>这个号在硬盘里到底用几个字节、怎么摆。"怎么存"是另一个问题——那是 UTF-8 干的活。这两件事一定要分开,后面翻车现场会专门讲。</div>

### 第五步:UTF-8——聪明地存 Unicode <span class="csf-b csf-core">必读</span>

问题来了:`你` 的码点是 20320,这个数一个字节(最多 255)装不下。最笨的办法是干脆每个字符都用 4 字节——但这样存英文太浪费,一个 `A` 本来 1 字节就够,凭什么撑到 4 字节?

**UTF-8** 的聪明之处:**变长**。常用的省着存,生僻的多花几字节:

- ASCII 里的字符(英文、数字、常见标点):**1 字节**
- 大部分汉字:**3 字节**
- emoji 之类:常是 **4 字节**

来动手看一眼。**先猜**:`'你好'` 两个汉字,用 UTF-8 编码后一共多少字节?很多人会脱口而出"4 个"(以为一字两字节)——记住你的猜测,我们验证:

```python
>>> 'A'.encode('utf-8')
b'A'
>>> len('A'.encode('utf-8'))
1
>>> '你好'.encode('utf-8')
b'\xe4\xbd\xa0\xe5\xa5\xbd'
>>> len('你好'.encode('utf-8'))
6
```

<div class="csf-note">结果里那个 <code>b'A'</code>、还有 <code>b'\xe4\xbd\xa0...'</code>,开头那个字母 <strong>b</strong> 不是内容的一部分——它是 Python 在告诉你"<strong>这是一串字节(英文 bytes),不是普通文字</strong>"。你只要看引号里面的内容就行。</div>

是 **6**,不是 4!两个汉字、每个 3 字节,合计 6。如果你刚才猜的是 4,这就是今天最值钱的一个"咦"。

看那串 `b'\xe4\xbd\xa0\xe5\xa5\xbd'`:`\x` 后面跟两位就是上一讲讲的**十六进制**。前三个 `e4 bd a0` 是"你",后三个 `e5 a5 bd` 是"好"。下面我们就要在真实文件里,亲眼认出这 6 个字节。

<details class="csf-fold"><summary>UTF-8 怎么知道一个字符到底占几字节?<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
秘密在每个字节的<strong>开头几位</strong>。UTF-8 用字节最高位当"路标":<br>· 字节以 <code>0</code> 开头 → 这是个单字节字符(就是 ASCII)。<br>· 字节以 <code>110</code> 开头 → 这是一个 2 字节字符的"第一字节",后面还跟 1 个。<br>· 字节以 <code>1110</code> 开头 → 3 字节字符的开头,后面跟 2 个。<br>· 跟在后面的"续字节"一律以 <code>10</code> 开头。<br>所以解码器从左往右读,看一眼开头就知道该往后再吞几个字节。这套设计还有个好处:它和 ASCII <strong>完全兼容</strong>——一个纯英文文件,用 ASCII 读和用 UTF-8 读结果一模一样。这就是为什么 UTF-8 能成为今天互联网的事实标准。</details>

### 第六步:用 xxd 把文件摊开看 <span class="csf-b csf-key">重点</span>

光在 Python 里看不过瘾,我们造一个真文件,再用 `xxd` 把它的每个字节"摊"成十六进制看清楚。`xxd` 是一个"把文件按字节摊开、用十六进制显示出来"的小工具(英文叫 hex dump,dump 就是"一股脑倒出来"的意思)。它在 macOS / Linux 上一般自带。<strong>如果你用的是 Windows,最省事的办法是直接看下面折叠里的"备选方案"</strong>(用 PowerShell 自带命令或在线工具,不用装任何东西);如果你愿意折腾,也可以装 WSL("Windows 里的 Linux 子系统",一个能在 Windows 上跑 Linux 命令的官方功能,需要单独安装)。

在终端里(不是 Python 里,先 `exit()` 退出 Python),一步步来:

```bash
# 1. 造一个文件,内容是"你好A"(printf 不会自动加换行,干净)
printf '你好A' > hello.txt

# 2. 用 xxd 摊开看
xxd hello.txt
```

**先猜**:这个文件一共几个字节?(你好 = 6,A = 1,合计……) 输出大概长这样:

```
00000000: e4bd a0e5 a5bd 41                        ....A
```

逐段对照,这就是今天的高光时刻:

- 最左边 `00000000` 是**偏移量**(从文件第几个字节算起,十六进制)。
- 中间 `e4bd a0e5 a5bd 41` 是**每个字节的十六进制值**(两两一组只是为了好看)。数一下:`e4 bd a0 e5 a5 bd 41`,共 **7** 个字节。
- 最右边 `....A` 是把这些字节"当 ASCII 字符显示"的结果:`41` 是可打印字符 `A`,所以显示 A;前 6 个字节不是可打印 ASCII,xxd 就用 `.` 占位。

把它和上一步 Python 的输出对上了吗?`e4 bd a0` = 你,`e5 a5 bd` = 好,`41` = A(还记得吗,`A` 的 ASCII 是 65,十六进制正是 `41`)。**整条链路打通了**:字符 → Unicode 码点 → UTF-8 字节 → 硬盘上的十六进制。

<details class="csf-fold"><summary>没有 xxd?三个备选方案<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
· macOS / Linux 一般自带 <code>xxd</code>;如果提示找不到,试 <code>od -A x -t x1z hello.txt</code>(<code>od</code> 几乎一定有)。<br>· Windows:装了 WSL 就和 Linux 一样;或用 PowerShell 的 <code>Format-Hex hello.txt</code>。<br>· 实在不行:浏览器搜 "online hex viewer",把文件拖进去,一样能看到这串十六进制。<br>看到的十六进制值应该和上面完全一致——编码是跨平台的约定,不挑机器。</details>

### 第七步:图片和声音,一样的套路 <span class="csf-b csf-key">重点</span>

文字搞懂了,图片和声音其实是**同一个思路**:把连续的世界切成小块,每块记成数。

**图片 = 像素 + RGB**。一张照片是密密麻麻的小方格,每个小方格叫一个**像素**(pixel)。每个像素的颜色用三个数表示:红、绿、蓝(**RGB**),每个数 0~255。比如纯红是 (255, 0, 0),纯白是 (255, 255, 255),纯黑是 (0, 0, 0)。一张 1000×1000 的图,就是一百万个像素、每个三个数——说到底还是一大堆数。

<div class="csf-why">为什么是 0~255?因为每个颜色分量用 <strong>1 字节(8 位)</strong>存,<span></span>$2^8 = 256$,刚好 0 到 255。这又和我们前两讲的"字节"对上了。三个分量合起来 $256^3 \approx 1677$ 万种颜色,就是常说的"1600 万色 / 24 位真彩"。</div>

**声音 = 采样 + 量化**。声音本是连续起伏的波。计算机存不了"连续",于是:每隔极短的一小段时间,**测一次**波的高度——这叫**采样**(比如 CD 每秒测 44100 次);测出来的高度再四舍五入成一个整数——这叫**量化**。一秒钟几万个数串起来,放的时候按原速度还原,你的耳朵就听成了连续的声音。

<div class="csf-note">发现规律了吗?<strong>切块 + 给每块记个数</strong>,是计算机表示一切"连续内容"的通用招式。图片在空间上切成像素,声音在时间上切成采样点。切得越细(分辨率越高、采样率越高),越接近真实,但占的数也越多、文件越大。这就是清晰度和文件大小之间的取舍。</div>

## 💡 自己复述一遍

合上屏幕,用一句话说清楚:**计算机不认识字、图、声,它只认识数;所有内容都是先约定一张"内容↔数字"的对照表(编码),把内容切成块、每块记成数存下来,读的时候再照表翻回去。**

如果能顺带说出"汉字在 UTF-8 下常占 3 字节、不是 2",那这一讲的核心你就拿住了。

## 🔧 翻车现场

**翻车一:把乱码当成"文件坏了"。** 你下了个文件,打开全是"锘挎垜浣犲ソ"这种鬼画符,第一反应"完了文件损坏了"。**大概率没坏**——是**编码不匹配**:文件是用 UTF-8 存的,你的程序却当成 GBK(另一种中文编码)来读,对照表错了,翻出来当然是乱码。解法:换个编码重新打开(很多编辑器右下角能切换编码),或在代码里指定正确编码,比如 Python `open('x.txt', encoding='utf-8')`。**记住:乱码是"翻译用错了字典",不是"书被撕了"。**

**翻车二:以为一个汉字固定 2 字节。** 这是个流传很广的误会(它来自更老的 GBK 编码,那里汉字确实多是 2 字节)。但今天到处都用 **UTF-8,汉字常是 3 字节**。所以"我这字符串 10 个汉字,应该 20 字节吧"——错,UTF-8 下大概是 30 字节。`len('你好'.encode('utf-8'))` 等于 6 就是铁证。

**翻车三:把"字符"和"字形"混为一谈。** "字符"是抽象的那个东西(码点 20320 就是"你"这个字),"**字形**"是它画在屏幕上的样子。同一个"你",用宋体、楷体、黑体显示,长得完全不同,但它们是**同一个字符、同一个码点、存的字节完全一样**——区别只在显示时用了哪套字体。所以换字体不会改变文件内容;反过来,文件里存的也从来不是"那个图案",而是"那个号码"。

<div class="csf-note">这三个坑你<strong>自己造一遍最划算</strong>:故意用错编码读一次文件看看乱码长啥样,亲手 <code>len()</code> 数一次汉字字节数。别让 AI 直接告诉你结论——自己撞一次,才会真的记住。</div>

## ✅ 自检三问

1. 字符 `A` 的 ASCII 是 65,那它存进 UTF-8 文件里占几个字节、十六进制是多少?(提示:回看第六步 `xxd` 里的 `41`)
2. 为什么 `'你好'.encode('utf-8')` 的长度是 6 而不是 4?
3. 用宋体和黑体显示同一个"好"字,它们在文件里存的字节一样吗?为什么?

<details class="csf-fold"><summary>对答案<span class="csf-b csf-skim">点开前先自己答</span></summary>
1. 占 <strong>1 字节</strong>,十六进制是 <code>41</code>(因为 65 = 十六进制 41,且 UTF-8 对 ASCII 字符就是 1 字节,与 ASCII 完全兼容)。<br>2. 因为 UTF-8 是变长编码,每个汉字通常占 <strong>3</strong> 字节,两个汉字就是 3+3=6;"一字两字节"是老编码 GBK 的情况。<br>3. <strong>完全一样</strong>。字体只影响"字形"(显示出来的样子),不影响"字符"本身存的码点和字节。</details>

## 🚀 挑战

给自己出一道小题,亲手做:

1. 用 `printf` 造一个内容是 `'Hi你'` 的文件(`printf 'Hi你' > test.txt`)。**先在纸上猜**:它一共几个字节?`xxd` 出来会是哪几个十六进制值?(提示:`H`、`i` 各 1 字节,`你` 3 字节)
2. 用 `xxd test.txt` 验证,看偏移量、十六进制、右侧 ASCII 三栏能不能逐字节对上你的猜测。
3. 进阶(选做):在 Python 里跑 `'😀'.encode('utf-8')`,看这个 emoji 占几字节、是哪几个十六进制值,再写进文件用 `xxd` 验一遍。

把你的猜测和实际结果记下来,哪里猜错了就是你今天最大的收获。**这一步千万别让 AI 替你跑——它跑得再对,长记性的也是它不是你。** 你可以做完之后,把你的理解讲给 AI 听,让它帮你挑错,这才是把 AI 当家教的正确姿势。

## 📦 复制带走

<div class="csf-card"><strong>本讲精华(随手能背)</strong><br>1. <strong>一切皆数</strong>:计算机只认识数,文字/图片/声音都是"先约定对照表(编码),再把内容切块记成数"。<br>2. <strong>编码三层要分清</strong>:字符(抽象的字)→ Unicode 码点(它是几号)→ UTF-8(这个号用几字节怎么存);字形只是显示的样子,不改变存的字节。<br>3. <strong>UTF-8 是变长的</strong>:英文 1 字节、汉字常 3 字节、emoji 常 4 字节;"汉字固定 2 字节"是老黄历。<br>4. <strong>乱码 ≠ 文件坏</strong>:多半是编码用错(如 GBK 当 UTF-8),换对编码就好;<code>xxd</code> 能把文件摊成十六进制,让你看清每一个字节。</div>

下一讲我们从"存"走到"算"——第04讲《逻辑门:用"开关"做判断》。这一讲我们一直在说"0 和 1",下一讲就来看:几个开关怎么搭在一起,就能做出"判断"和"运算",这是 CPU 会算数的最底层秘密。
