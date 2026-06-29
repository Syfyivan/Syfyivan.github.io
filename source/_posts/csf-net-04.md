---
title: "《计算机基本功路线图 · 计算机网络》第04讲 · TCP 三次握手：连接是怎么「建立」起来的"
date: 2026-07-05 13:00:00
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

<div class="csf-key-note"><strong>这一讲点题：</strong>上一讲我们靠 IP 找到了对的机器、靠端口找到了机器上对的程序。但「找到」不等于「接上」。在真正发送任何数据之前，两台机器要先打个招呼、互相确认「你能听到我吗？我也能听到你」——这套招呼有个固定流程，叫<strong>三次握手</strong>。这一讲我们把这个招呼亲手敲一遍：你会用一条命令真的连上一台远方服务器的 80 端口，手打一行 HTTP 请求，看它回话。（HTTP 是浏览器和网站服务器之间约定的一套「说话格式」，你平时打开的网页基本都靠它来传输，这一讲你会第一次亲手敲一句这种格式的话。）</div>

## 🎯 这一讲你会学到什么

- 什么叫「面向连接」，以及为什么 TCP 在发数据前非要先建立连接。
- 三次握手到底握的是哪三次（SYN / SYN-ACK / ACK），以及为什么是三次、不是两次也不是四次。
- 连接用完怎么「好好说再见」——四次挥手。
- 一条 TCP 连接在它的一生里会经历哪些**状态**。
- 亲手用 `nc` 或 `telnet` 连上一个真实服务器端口，手敲请求拿到响应。

<div class="csf-note">这一讲是「先猜后做」的好场子。每个命令我都会先让你猜结果，再让你亲手敲、亲眼看。<strong>请一定要真的动手</strong>——光读你只会「觉得懂了」，敲过一遍你才会「真的会了」。还有：本讲所有命令都让你自己敲、自己看返回，别截图丢给 AI 让它替你解释，先自己读一遍。</div>

## 🛠 跟我做

### 先聊聊：什么叫「面向连接」 <span class="csf-b csf-core">必读</span>

打电话和发短信，是理解 TCP 的最好类比。

**发短信**是这样的：你写好内容，按发送，消息就出去了。你不知道对方手机是不是开机、有没有看到、是不是按收到的顺序看的。你只管「扔出去」。这种风格叫**无连接**——下一讲会讲到的 UDP 就是这样。

**打电话**不一样。你拨号，对面响铃，对方拿起来「喂？」，你「喂，能听到吗？」，对方「能听到，你说」——**确认双方都能听见之后**，你才开始讲正事。讲完还要说「那就这样，拜拜」，互相道别才挂。这种「先接通、确认、再通话、最后好好挂断」的风格，就叫**面向连接**。

<div class="csf-key-note"><strong>TCP 就是打电话那一派。</strong>它在发任何真正的数据之前，一定先和对方建立一条「连接」，确认双方都准备好了、都能正常收发。这个「确认双方都能收发」的开场仪式，就是<strong>三次握手</strong>。</div>

为什么非要这么麻烦？因为网络是不靠谱的：线路会丢包、对方程序可能没在听、防火墙可能挡着。与其闷头把一大堆数据发出去然后石沉大海，不如先用极小的代价试探一下「这条路通不通、对面在不在」。握手成功，才说明这条路是活的，后面发数据才有意义。

### 三次握手：到底握哪三次 <span class="csf-b csf-key">重点</span>

假设你的电脑（客户端）要连服务器。三次握手就是来回三条消息。我先把话说在前头，你**先别看解释，先猜**：你觉得要让「双方都确认对方能收能发」，最少需要几条消息？记下你的猜测，再往下看。

揭晓——是三条：

```text
客户端                                     服务器
   |                                          |
   |  1. SYN（我想连你，我的起始序列号是 x）     |
   | ---------------------------------------> |
   |                                          |
   |  2. SYN + ACK（好，收到你的 x；            |
   |     我也想连你，我的起始序列号是 y）        |
   | <--------------------------------------- |
   |                                          |
   |  3. ACK（收到你的 y，握手完成）            |
   | ---------------------------------------> |
   |                                          |
   |  === 连接建立，现在才开始发真正的数据 ===   |
```

逐条拆开看：

- **第一次（SYN）**：客户端喊话——「我想和你建立连接」。SYN 是 synchronize（同步）的缩写。这条消息里还带了一个客户端自己选的**起始序列号**，我们叫它 `x`——上面示意图里写的那个 `x`，就是这个起始序列号（「序列号」和「编号」是同一个东西，后面统一叫它起始序列号；先记住有这么个号，下一讲专门讲它干嘛用）。
- **第二次（SYN-ACK）**：服务器回话，这一条消息其实是**两件事合在一起**——ACK 表示「你那条 SYN 我收到了」（ACK 是 acknowledge（确认收到）的缩写，和 SYN 一样是个英文词的简写），同时它自己也发一个 SYN，带上服务器这边的起始序列号 `y`，意思是「我也准备好和你连了」。
- **第三次（ACK）**：客户端再回一条「你的那条我也收到了」。到这里，握手完成，连接正式建立。

<div class="csf-why"><strong>为什么偏偏是三次？</strong>核心目的是：让<strong>双方都确认「对方能收、也能发」</strong>。<br>第一条 SYN 之后，服务器知道了「客户端能发」；服务器回的 SYN-ACK 之后，客户端知道了「服务器能收也能发」；但此时<strong>服务器还不确定客户端到底能不能收到自己的回话</strong>。所以需要客户端再回最后一条 ACK，服务器收到它，才确认「客户端也能收」。两条不够（服务器没法确认对方收到了自己的话），四条多余（第三条已经够了）。三，是「让双方都确认双向通路」的最小次数。</div>

<details class="csf-fold"><summary>那两次握手到底差在哪？<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
经典的解释是防止「已失效的旧连接请求」突然到达造成误会。<br>设想：客户端发的第一个 SYN 在网络里堵车了，迟迟没到，客户端等不及超时重发了一个新 SYN，正常连上又正常用完。结果那个堵车的旧 SYN 这时候慢悠悠到了服务器。如果只要两次握手（服务器一收到 SYN 就认为连接建立、就开始准备资源），服务器就会为这个早已作废的请求白白建立一个连接、傻等数据。<br>有了第三次握手，服务器在收到客户端最后的 ACK 之前不会真正认为连接建立。对那个旧 SYN，客户端早就不认了，自然不会回 ACK，服务器等不到 ACK，这个误开的连接就会被丢弃。所以第三次握手不只是「礼貌」，它能帮服务器避免被过期请求骗着浪费资源。
</details>

<div class="csf-note"><strong>最容易记混的一点：握手 ≠ 发数据。</strong>三次握手只是「接通电话」，全程没有传输任何你要的网页内容。握手成功，连接才建立；建立之后，你发出的 <code>GET / HTTP/1.0</code> 这种请求才是真正的「数据」。下面的动手练会让你亲身体会这个先后顺序。</div>

### 动手练一：亲手完成一次握手并发请求 <span class="csf-b csf-core">必读</span>

理论看够了，我们来真的连一台服务器。你不用写任何代码，用系统自带的 `nc`（netcat）命令就能手动完成握手并发请求。

<div class="csf-note">macOS 和大多数 Linux 自带 <code>nc</code>。Windows 用户：可在 PowerShell 里用，或在「设置 → 应用 → 可选功能」里打开 Telnet 客户端后用 <code>telnet</code>，下面也给了 telnet 的版本。</div>

**先猜**：当你敲下面这条命令、然后手打一行 `GET / HTTP/1.0` 再敲两下回车，你觉得服务器会回给你什么？是一段网页的 HTML？一个错误？还是什么都不回？先把你的猜测写下来。

现在动手。打开终端，输入：

```bash
nc -v example.com 80
```

`-v` 是 verbose（啰嗦模式），它会把连接过程打印出来。回车后你大概会看到类似这样的一行：

```text
Connection to example.com port 80 [tcp/http] succeeded!
```

<div class="csf-key-note">看到 <code>succeeded</code> 这一刻，<strong>三次握手已经在你看不见的地方悄悄完成了</strong>。<code>nc</code> 替你发了 SYN、收了 SYN-ACK、回了 ACK。现在连接是通的，光标在那闪，等你说话——但<strong>到目前为止你一个字节的网页内容都还没拿到</strong>。这就是「握手 ≠ 发数据」最直观的体感。</div>

现在轮到你「说正事」了。马上要敲的这行 `GET / HTTP/1.0`，看着像咒语，其实拆开就三个词，每个都有大白话意思：

- `GET`：表示「我想取一份东西」——就是向服务器要内容。
- `/`：表示你要的是「网站的首页」（也叫根路径，`/` 就代表最顶层那一层）。
- `HTTP/1.0`：表示「我用 HTTP 这种对话格式跟你说话，用的是 1.0 这个版本」。

连起来读就是：「请用 HTTP 1.0 的格式，把首页那份内容给我。」知道每个字什么意思之后，手动敲入这一行（注意大小写），然后**回车，再按一次回车**（这一下空行至关重要，下面翻车现场会专门讲）：

```text
GET / HTTP/1.0
（在这里再按一次回车，留出一个空行）
```

如果一切正常，服务器会哗啦啦回给你一大段东西，开头长这样：

```text
HTTP/1.0 200 OK
Content-Type: text/html
...

<!doctype html>
<html>
...
```

先看第一行 `HTTP/1.0 200 OK`：这里的 `200` 叫**状态码**，是服务器用一个数字告诉你「这次请求成功了」，`200` 就表示「一切正常、内容给你」（记住「状态码」这个词，后面挑战部分还会用到它）。

再看那段 `<!doctype html>` 开始的，就是网页的真身 HTML——和你平时在浏览器看到的页面，是同一份原料。你刚刚**用手，完成了浏览器在你按下回车后自动做的事**：建立连接、发出请求、接收响应。

<details class="csf-fold"><summary>用 telnet 的等价版本（Windows 友好）<span class="csf-b csf-skim">可跳读</span></summary>
如果没有 <code>nc</code>，用 telnet 一样：<br><code>telnet example.com 80</code><br>连上后同样手打 <code>GET / HTTP/1.0</code>，回车，再回车留空行，即可看到响应。telnet 的界面可能更简陋，回显行为也略有不同（「回显」就是你敲的字会不会即时显示在屏幕上——有的 telnet 不会把你打的字显示出来，看着像没输入，其实已经收到了），但握手与请求的本质完全一样。
</details>

### 动手练二：让浏览器替你做同一件事 <span class="csf-b csf-key">重点</span>

现在对照看一眼浏览器是怎么做这同一件事的。

1. 打开浏览器，按 `F12`（或右键「检查」）打开开发者工具，切到 **Network（网络）** 面板。
2. 在地址栏访问 `http://example.com`，回车。
3. 看 Network 面板里冒出来的请求，点开第一条（通常就是那个 `example.com` 文档）。

你会看到「请求标头」里赫然写着 `GET / HTTP/1.1`——和你刚才手敲的几乎一模一样。区别只是：浏览器把握手、发请求、收响应、解析渲染，**全自动、几毫秒内**做完了，你平时只看到「页面出现了」这个结果。

<div class="csf-note">在某些浏览器的请求 <strong>Timing（计时）</strong> 标签里，你还能看到一段叫 <code>Initial connection</code>（初始连接）甚至 <code>SSL</code> 的耗时——那段「初始连接」时间，里面就包含了三次握手。你手动 <code>nc</code> 时感觉「一瞬间就 succeeded」，浏览器把这一瞬间的耗时实实在在地量给你看了。</div>

### 用完怎么挂断：四次挥手 <span class="csf-b csf-skim">可跳读但建议看</span>

电话打完要好好说再见，TCP 连接用完也要好好关闭。关闭比建立多一步，是**四次挥手**：

```text
客户端                                     服务器
   |  1. FIN（我说完了，要关了）              |
   | ---------------------------------------> |
   |  2. ACK（知道了，等我把手头的发完）       |
   | <--------------------------------------- |
   |  3. FIN（我也说完了，可以关了）           |
   | <--------------------------------------- |
   |  4. ACK（好，再见）                       |
   | ---------------------------------------> |
```

图里的 `FIN` 是 finish（结束）的缩写，表示「我这边说完了，要关了」；`ACK` 还是前面那个 acknowledge（确认收到）。所以这四步说白了就是：一方说「我说完了」，另一方先回「知道了」，等它也说完再回一句「我也说完了」，最后对方回「好，再见」。

<div class="csf-why"><strong>为什么关闭要四次，建立只要三次？</strong>建立连接时，服务器可以把「我收到了」和「我也想连」打包成一条 SYN-ACK 发出去，所以省了一步。但关闭时不行：一方说「我没有数据要发了」（FIN），不代表另一方也讲完了——对方可能还有没发完的内容要继续发。所以「我收到你的关闭请求」（ACK）和「我这边也讲完了」（FIN）这两件事<strong>往往不能合并</strong>，必须分两步，于是变成四次。说白了：关电话时，不能因为你说完了就强行替对方也挂了，得等对方也说完。</div>

### 一条连接的「一生」：连接状态 <span class="csf-b csf-skip">选学</span>

TCP 内部用一组**状态**来记录连接走到哪一步了。你不需要背，但见过一次，以后排障看到这些词就不会慌。常见的几个：

<div class="csf-legend"><code>LISTEN</code>：服务器在某端口上待命，等人来连。<br><code>SYN_SENT</code>：客户端发出了 SYN，正等服务器回应。<br><code>ESTABLISHED</code>：握手完成，连接建立，<strong>这是「正常通话中」的状态</strong>。<br><code>TIME_WAIT</code>：主动关闭的一方在彻底放手前，会停留一小段时间，确保最后的消息对方收到了。</div>

想亲眼看看？在连着网的时候，终端里敲（不同系统参数略有差异）：

```bash
# macOS / Linux 通用，看看你机器上现在有哪些 TCP 连接
netstat -an | grep ESTABLISHED
```

这一行拆开看：`netstat` 是「查看网络连接」的命令；`-an` 是它的两个开关，`a` 表示「列出所有连接」、`n` 表示「地址用数字显示」（不去翻译成域名，跑得更快也更直观）；中间那个竖线 `|` 念作「管道」，作用是「把左边命令的输出，交给右边的命令接着处理」；`grep ESTABLISHED` 则是「在这些输出里，只挑出含有 `ESTABLISHED` 这个词的行」。连起来就是：列出所有连接，再只留下处于「正常通话中」的那些。

你会看到一堆 `ESTABLISHED`，那是你电脑此刻正开着的真实连接——浏览器、聊天软件、后台更新，每一行都是一次活着的「通话」。

## 💡 自己复述一遍

合上屏幕，用一句话说给自己听：

> TCP 在发数据前先用 **SYN / SYN-ACK / ACK 三次握手**接通连接，目的是让双方都确认「对方能收也能发」；握手只是接通、不是发数据；用完再用**四次挥手**好好关闭。

如果这句话你能不看屏幕说出大概，这一讲的骨架你就立住了。

## 🔧 翻车现场

<div class="csf-note"><strong>翻车一：把「握手成功」当成「已经拿到数据」。</strong><br><code>nc</code> 显示 <code>succeeded</code> 后光标就在那闪，很多人以为「连上了怎么没反应、是不是坏了」，然后就关掉了。其实它在等你发请求。<strong>握手只负责接通，接通后你得自己开口说话</strong>（敲 GET 那一行），服务器才会回。记住这个先后顺序，比记任何术语都重要。</div>

<div class="csf-note"><strong>翻车二（最高频）：忘了请求结尾那个空行。</strong><br>你敲完 <code>GET / HTTP/1.0</code> 回车后，如果只按了一次回车就干等，服务器会<strong>一直沉默</strong>，让你以为连不上、网坏了。原因是：HTTP 协议规定，请求的头部要用<strong>一个空行</strong>来表示「我说完了」。你少了这个空行，服务器就认为「你话还没说完」，于是礼貌地继续等你。解法：敲完那行请求，<strong>连按两次回车</strong>（一次结束该行，一次留出空行），服务器立刻就回话了。</div>

<div class="csf-note"><strong>翻车三：分不清「连不上」是哪一层的问题。</strong><br>如果 <code>nc -v</code> 卡很久最后报 <code>Connection refused</code>，通常是对方那个端口没有程序在听（回想上一讲的端口概念），握手第一步 SYN 就被拒了；如果是 <code>Operation timed out</code>（超时），更可能是网络不通或被防火墙默默丢弃。<strong>能从报错大致判断卡在哪一层，正是这门课要练的、AI 替不了你的判断力</strong>——因为 AI 看不到你此刻的网络环境。</div>

## ✅ 自检三问

1. 三次握手的三条消息分别叫什么？为什么必须是三次、两次为什么不够？
2. 「三次握手完成」和「开始传输网页数据」，这两件事谁先谁后？它们是不是同一件事？
3. 用 `nc` 连上 80 端口后，为什么手敲完 `GET / HTTP/1.0` 还要留一个空行才会有响应？

（三问都能不查资料答上来，就可以进下一讲；卡住了就回到对应小节再做一遍动手练。）

## 🚀 挑战

换一个目标自己再走一遍全程，并加一点观察：

1. 把动手练一里的 `example.com` 换成另一个你常用的网站域名，用 `nc -v 那个域名 80` 连上，手敲 `GET / HTTP/1.0` 加空行，看它回什么。
2. 留意响应的第一行：有的网站会回 `301` 或 `302`，并在头部给你一个 `Location:`——猜猜这是什么意思？（提示：很多网站会把 `http` 自动跳转到 `https`。这正是我们后面几讲要展开的内容。）
3. **进阶**：故意敲一个不存在的路径，比如 `GET /this-page-does-not-exist HTTP/1.0` 再加空行，看看服务器回的状态码和刚才有什么不同。

把你观察到的状态码记下来。下一讲我们会讲：连接建立之后，TCP 是**怎么保证你发的数据不丢、不乱**地送到对面的——这才是 TCP 最硬核的本事。

## 📦 复制带走

<div class="csf-card"><strong>本讲要点：</strong><br>1. <strong>TCP 面向连接</strong>，像打电话：发数据前先三次握手接通，确认双方都能收能发。<br>2. <strong>三次握手 = SYN → SYN-ACK → ACK</strong>，三次是「让双方都确认双向通路」的最小次数；关闭用四次挥手。<br>3. <strong>握手 ≠ 发数据</strong>：<code>nc</code> 显示 succeeded 只是接通了，你还得手敲请求服务器才回。<br>4. <strong>HTTP 请求结尾要留一个空行</strong>，否则服务器一直等你、看着像连不上——这是新手最常踩的坑。</div>
