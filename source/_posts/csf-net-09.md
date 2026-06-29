---
title: "《计算机基本功路线图 · 计算机网络》第09讲 · Cookie 与 Session：HTTP 没记性，怎么记住你登录了"
date: 2026-07-05 18:00:00
tags: [计算机基础, 计算机网络, 零基础, 编程入门, 课程]
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

<div class="csf-key-note">你登录一次，之后翻好几页都不用再输密码——可上一讲我们说过，HTTP 每个请求都是「独立的、互不认识的」。那服务器到底凭什么认出「这次来的还是刚才那个人」？答案就两个词：<strong>Cookie</strong> 和 <strong>Session</strong>。今天我们把这件每天都在发生、却没人跟你讲过的事，亲手拆开看一遍。</div>

## 🎯 这一讲你会学到什么

- 为什么说 HTTP 是「无状态」的，这个词到底坑在哪。
- 服务器怎么靠一张「小纸条」（Cookie）记住你。
- Cookie 和 Session 的分工：一个存在**你的浏览器**里，一个存在**服务器**里。
- 登录之后，服务器是怎么一步步「认出」你的（这是本讲的主线）。
- Cookie 上那几个属性——过期时间、`Secure`、`HttpOnly`——分别管什么。
- 用 DevTools 看真实 Cookie，用 `curl` 亲手「带凭证」发一次请求。

<div class="csf-note">这一讲不需要你会任何后端语言。我们不写服务器，只做两件事：<strong>观察</strong>真实网站的 Cookie，和用命令行<strong>模拟</strong>一次「带凭证」的请求。看懂「凭证是怎么传来传去的」，比会写登录功能更重要。</div>

## 🛠 跟我做

### 先想清楚：HTTP 为什么「没记性」 <span class="csf-b csf-core">必读</span>

上一讲讲状态码时我们提过一句：HTTP 是**无状态**（stateless）的。这是本讲所有内容的起点，我们把它讲透。

「无状态」的意思是：**服务器处理完一个请求，就把你忘得一干二净。** 下一个请求来的时候，它根本不知道这是不是同一个人发的。

打个比方。你去一家**没有记性的奶茶店**，每次走到柜台，店员都像第一次见你：

- 第一次：「您好，要点什么？」你说「一杯奶茶」。做好，给你。
- 第二次你来加个椰果：「您好，要点什么？」——它完全不记得刚才那杯是你的。

这听起来很蠢，但对服务器其实是**好事**：它不用为每个访客记一堆东西，每个请求独立处理，简单、扛得住海量「并发」（也就是同一时间成千上万人一起访问也不卡）。代价就是——它天生记不住「你是谁」。

<div class="csf-why">那问题来了：如果服务器啥都不记，登录后我点开「我的订单」，它怎么知道该给我看<strong>我的</strong>订单而不是别人的？这正是 Cookie 要解决的问题。带着这个疑问往下读，效果最好。</div>

### 关键一招：给你发一张「小纸条」 <span class="csf-b csf-key">重点</span>

既然店员记不住，那就**换个办法**：店员给你一张写着号码的小纸条，说「下次来把这张纸条给我看」。

- 你第一次来，店员给你一张纸条：**「7 号」**。
- 你下次来，把「7 号」递过去。店员一查本子：「哦，7 号是那位点了奶茶加椰果的客人。」

这张**小纸条，就是 Cookie**；店员手里那个记着「7 号 = 谁、点了啥」的**本子，就是 Session**。

看懂这组对应关系，今天就成功了一半：

<div class="csf-legend">🍪 <strong>Cookie</strong>：服务器发给你、存在<strong>你浏览器</strong>里的一小段数据。之后每次请求，浏览器会自动把它带上。<br>📒 <strong>Session</strong>：服务器在<strong>自己这边</strong>保存的、关于「你」的信息（比如你的用户 ID、登录状态）。<br>🔑 <strong>会话 ID（Session ID）</strong>：纸条上那个「号码」。Cookie 里通常就存这么个号码，服务器靠它去本子里翻出你是谁。</div>

<div class="csf-note">很多人一上来就把 Cookie 和 Session 搞混，根源是没分清「东西存在哪」。记死一句话：<strong>Cookie 在客户端（你的浏览器），Session 在服务端（服务器）。</strong> 纸条在你兜里，本子在店员手上。</div>

### 看技术细节：Set-Cookie 和 Cookie 两个头 <span class="csf-b csf-core">必读</span>

这「发纸条 / 递纸条」的动作，在 HTTP 里就靠**两个头**完成。上一讲我们学过响应头，这俩就是其中的主角：

- 服务器发纸条：在**响应**里加一行 `Set-Cookie`（「请你存下这个」）。
- 浏览器递纸条：在之后每个**请求**里加一行 `Cookie`（「这是你上次让我存的」）。

一次登录的完整往返，大致长这样（简化版）：

```text
① 你提交登录表单（请求）
POST /login
   username=xiaoming&password=******

② 服务器验证通过，发响应，附带一张纸条
HTTP/1.1 200 OK
Set-Cookie: session_id=a1b2c3d4; HttpOnly
   （服务器同时在自己的"本子"里记下：a1b2c3d4 = 小明，已登录）

③ 之后你点"我的订单"，浏览器自动把纸条带上（请求）
GET /my/orders
Cookie: session_id=a1b2c3d4

④ 服务器拿 a1b2c3d4 去本子里一查："哦是小明"，返回小明的订单
HTTP/1.1 200 OK
```

**先猜后做**：注意第 ③ 步那行 `Cookie`，是**你手动写的吗**？还是浏览器自己加的？先猜一下，下面的动手练会给你答案。

<div class="csf-note">关键就在第 ③ 步：<strong>浏览器会自动</strong>把对应网站的 Cookie 加到每个请求上，不用你写一行代码。正是这个"自动",让你登录一次之后翻好多页都不用重输密码。</div>

### 动手练 1：用 DevTools 看真实的 Cookie <span class="csf-b csf-key">重点</span>

光说不练记不牢。我们去看一个**真实网站**的 Cookie。

1. 打开浏览器（Chrome / Edge 都行），随便访问一个你常用、**需要登录**的网站，比如知乎、B 站、GitHub。先**别登录**。
2. 按 `F12`（Mac 上是 `Cmd+Option+I`）打开开发者工具。
3. 找到顶部的 **Application** 面板（有的中文版叫「应用」；Firefox 里在「存储 / Storage」面板）。
4. 左侧展开 **Cookies**，点开当前网站的域名。右边就会列出一张表：`Name`（名字）、`Value`（值）、`Expires`（过期时间）、`HttpOnly`、`Secure` 等等。

你大概率已经能看到一些 Cookie——网站为了统计、记住语言偏好等，没登录也会种一些。

5. **现在登录这个网站。** 登录成功后，回到 Application 面板，**对比一下**：是不是多出了一两条 Cookie？或者某条的值变了？

<div class="csf-why">那条登录后才出现 / 变化的 Cookie，十有八九就是你的"登录态凭证"（名字常见的有 <code>session</code>、<code>sessionid</code>、<code>SESSID</code>、<code>token</code>、各家自定义的名字）。它就是你那张"7 号纸条"。看一眼它的 Value——一串看不懂的乱码——这正是服务器故意设计的：让别人猜不出来。</div>

**先猜后做**：在 Application 面板里**手动删掉**那条登录相关的 Cookie（右键 → Delete），然后刷新页面。猜猜会发生什么？

……刷新后，你**被退登了**，又得重新登录。这不是 bug，恰恰说明你抓对了东西：纸条丢了，店员就不认识你了。这也正是本讲「翻车现场」要讲的那个经典困惑。

### 动手练 2：用 curl 亲手「带凭证」 <span class="csf-b csf-core">必读</span>

浏览器帮你把 Cookie 自动收发了，你反而看不清「凭证传递」的过程。我们用命令行 `curl` 把这个过程**手动走一遍**，看得清清楚楚。

先别急着复制下面的命令。**它们要在「终端 / 命令行」里敲**——那是一个能用文字给电脑下命令的黑框框，不是浏览器，也不是 Word：

- **Windows**：按 `Win` 键，搜「PowerShell」或「命令提示符」，回车打开。
- **Mac**：打开「启动台 → 终端」（或按 `Cmd+空格` 搜「终端 / Terminal」）。

打开后你会看到一个一闪一闪的光标，在那儿把下面的命令一行行敲进去（或粘贴进去）、按回车就行。`curl` 是系统自带的一个小工具，作用是**「不用浏览器，直接用命令发一个网络请求」**——正好让我们把「带凭证」这件事看个明白。

我们用一个专门给人练手的测试网站 `httpbin.org`，它有两个「接口」。**接口你就理解成「网站上一个有特定功能的网址」——访问它，它就帮你做一件固定的事。** 这里一个接口能让你「设置一个 Cookie」，另一个接口能「回显你带来的 Cookie」。

**第一步：让服务器给我们发一张纸条，并保存下来。**

```bash
curl -c cookie.txt "https://httpbin.org/cookies/set?course=network09"
```

- `-c cookie.txt` 的意思是：把服务器通过 `Set-Cookie` 发来的 Cookie，**存**到本地一个文件 `cookie.txt` 里（curl 管这个存 Cookie 的文件叫 cookie jar，直译「饼干罐」，就是个放纸条的小盒子，知道是这个意思就行）。`-c` 你就记成 cookie 的 c。
- 这个网址会让服务器返回一个名叫 `course`、值为 `network09` 的 Cookie。

跑完后，看看这张「纸条」长什么样：

```bash
cat cookie.txt
```

你会看到类似这样的一行（前面几行是注释）：

```text
httpbin.org	FALSE	/	FALSE	0	course	network09
```

最后两列 `course` 和 `network09` 就是纸条上写的内容。**这就是服务器发给你、存在你这边的 Cookie。**

**第二步：带上这张纸条，再发一次请求。**

```bash
curl -b cookie.txt "https://httpbin.org/cookies"
```

- `-b cookie.txt` 的意思是：把 `cookie.txt` 里的 Cookie **带上（带凭证）**发出去。`-b` 记成「带上 / bring」。
- `https://httpbin.org/cookies` 这个接口的作用是：把你带来的 Cookie **原样回显**给你看。

**先猜后做**：在敲回车前先猜——返回的内容里，会不会出现 `course: network09`？

揭晓，你会看到：

```json
{
  "cookies": {
    "course": "network09"
  }
}
```

服务器**看见**了你带去的 Cookie。这就是「带凭证发请求」的本质——你把上次存的小纸条递了回去。

**第三步：做个对比，体会「不带凭证」。** 这次故意**不加** `-b`：

```bash
curl "https://httpbin.org/cookies"
```

返回会变成空的：

```json
{
  "cookies": {}
}
```

没带纸条，服务器就「不认识」你。把第二步和第三步放在一起看，你就彻底懂了：**登录态能保持，全靠每次请求都默默把那张纸条带上。** 浏览器替你自动做了这件事，而 `curl` 让你亲手做了一遍。

<div class="csf-note">提醒一句：这两个 <code>curl</code> 命令请<strong>自己动手敲一遍、亲眼看输出</strong>，别让 AI 替你"想象"结果。命令很短、网站是公开的练手站，正是你建立直觉的好机会。看到 <code>course: network09</code> 出现的那一刻，比读十遍解释都管用。</div>

### Cookie 上那几个属性是干嘛的 <span class="csf-b csf-key">重点</span>

回到动手练 1 里 DevTools 那张表，每条 Cookie 后面还有几列属性。它们不是摆设，挑三个最该懂的：

- **过期时间（Expires / Max-Age）**：纸条的「保质期」。到点了浏览器就自动扔掉这条 Cookie。没设过期时间的叫**会话 Cookie**，浏览器一关就没了——这就是为什么有些网站关掉浏览器再开就要重新登录。
- **`Secure`**：带这个标记的 Cookie，**只在 HTTPS（加密连接）下才发送**，明文 HTTP 不发。防止纸条在路上被人偷看。（HTTPS 到底怎么加密，正是下一讲的内容。）
- **`HttpOnly`**：带这个标记的 Cookie，**网页里的 JavaScript 读不到它**，只有浏览器在发请求时自动带上。这里解释一句：JavaScript 是网页里运行的小程序（也叫「脚本」），网页上很多动态效果都是它做的；但坏人也可能偷偷塞一段恶意脚本来偷你的 Cookie——`HttpOnly` 就是不让任何脚本碰这条 Cookie。所以你会发现，登录态那条 Cookie 往往是 `HttpOnly` 的。

<details class="csf-fold"><summary>细究：Session 一定要靠 Cookie 吗？还有 SameSite 是什么<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
<div>会话 ID 不是非得放 Cookie 不可——历史上也有把它拼在 URL 里（<code>?sessionid=...</code>）的做法，但那样容易泄露（链接被转发就连登录态一起送人了），现在基本淘汰。<br><br>另外你在 DevTools 里可能还看到一列 <strong>SameSite</strong>。它管的是"跨站请求要不要带这条 Cookie",是用来防一类叫 CSRF 的攻击的（CSRF 是一类"冒用你身份偷偷发请求"的攻击，名字记不住没关系，知道 SameSite 是用来防它的就够了）。现在只要知道有这么个东西、是管"跨站时带不带纸条"的就够了，等你以后做 Web 开发会专门学。<br><br>还有：Session 的"本子"存在哪？小项目可能就放服务器内存里，大网站会放进专门的存储（如 Redis）甚至做成无状态的 Token（JWT）。这些都是后话，今天抓住"纸条在客户端、本子在服务端"这条主线就好。</div>
</details>

## 💡 自己复述一遍

合上屏幕，用一句话回答：**HTTP 明明没记性，登录后服务器是怎么认出我的？**

如果你能说出类似——「服务器登录时给我发一张写着号码（会话 ID）的小纸条（Cookie）存我浏览器里，之后每次请求浏览器都自动把它带上，服务器拿号码去自己的本子（Session）里翻出我是谁」——那这一讲的核心你就拿下了。

## 🔧 翻车现场

**翻车一：把 Cookie 和 Session 当成一回事。**

最常见的混淆。一句话区分：**Cookie 存在你的浏览器，Session 存在服务器。** Cookie 通常只装一个「号码」（会话 ID），真正关于你的信息（你是谁、登录没登录）放在服务器的 Session 里。纸条在你兜里，本子在店员手上，别搞反。

**翻车二：删了 Cookie，纳闷「为什么要重新登录」。**

这正是动手练 1 第 5 步看到的现象。你的登录态凭证就**在那条 Cookie 里**，删掉它 = 把纸条扔了。下次请求带不出号码，服务器自然「不认识」你，只能请你重新登录、领一张新纸条。这不是网站抽风，而是机制本该如此。

**翻车三：以为 `curl` 不加 `-b` 也会自动带 Cookie。**

浏览器会「自动带」，但 `curl` 默认**不会**——它是个老实的工具，你不用 `-b` 明确告诉它带哪个文件，它就什么都不带（动手练 2 第三步那个空 `{}` 就是证据）。这其实是好事：它让你看清了「带凭证」是一个**实实在在的动作**，而不是魔法。

**翻车四：把 `-c`（保存）和 `-b`（带上）记反。**

`-c` = 把服务器发来的 Cookie **存下来**（cookie jar，c 对应 cookie）；`-b` = 把存好的 Cookie **带上去**发请求（bring）。记混了就会出现「没存到 / 没带上」。实在记不住，就回想动手练 2 的顺序：**先 `-c` 领纸条，再 `-b` 递纸条。**

## ✅ 自检三问

1. 「HTTP 是无状态的」这句话是什么意思？它和「需要 Cookie」之间是什么关系？
2. Cookie 和 Session 分别存在哪里？一条登录 Cookie 里通常装的是什么？
3. 用 `curl` 时，`-c` 和 `-b` 各自做什么？为什么不加 `-b` 时服务器「认不出」你？

（三问都能不看上文答出来，再往下走；卡住了就回到对应的动手练重看一遍。）

## 🚀 挑战

给你一个**纯观察 + 动手**的小任务，不用写代码：

1. 用动手练 2 的方法，但把网址换成 `https://httpbin.org/cookies/set?user=你的名字拼音&level=beginner`，用 `-c` 存下来。
2. `cat cookie.txt` 看看这次的纸条上多了几条记录。
3. 用 `-b` 带上它请求 `https://httpbin.org/cookies`，确认两条 Cookie 都被服务器看到了。
4. **加餐**：给第一步的 `curl` 加上 `-v`（verbose，啰嗦模式），在一大堆输出里找出那行 `Set-Cookie:` 和（第二步请求里的）`Cookie:`。亲眼确认我们前面画的「① 发纸条 / ③ 递纸条」两个头，是真实存在的。

做完后，试着用自己的话跟朋友（或对着空气）讲一遍：「我刚才让服务器给我发了张纸条，存下来，又带着它去找服务器，它就认出我了。」能讲明白，你就真懂了。

## 📦 复制带走

<div class="csf-card">📌 <strong>HTTP 无状态</strong>：服务器处理完一个请求就把你忘了，天生记不住"你是谁"——这是需要 Cookie 的根本原因。<br>🍪 <strong>Cookie vs Session</strong>：Cookie 是存在<strong>你浏览器</strong>里的小纸条（常只装会话 ID）；Session 是存在<strong>服务器</strong>里、记着你是谁的本子。纸条在你兜里，本子在店员手上。<br>🔄 <strong>登录态怎么保持</strong>：登录时服务器用 <code>Set-Cookie</code> 发纸条，之后浏览器在每个请求里自动用 <code>Cookie</code> 头把它带上，服务器靠号码认出你。删了 Cookie 就得重新登录。<br>🧪 <strong>curl 带凭证</strong>：<code>-c</code> 存纸条、<code>-b</code> 带纸条；不带就被当陌生人。下一讲我们解决一个新问题：纸条在网上传来传去，怎么不被人偷看——这就是 <strong>HTTPS</strong>。</div>
