---
title: "《计算机基本功路线图 · 计算机网络》第11讲 · 抓包看一次真实请求：把整条链路串起来"
date: 2026-07-05 20:00:00
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

<div class="csf-key-note">这是整门《计算机网络》的最后一讲。前面十讲我们把一次网页请求拆成了一段段：DNS 把域名换成 IP，IP 和端口找到机器和门牌，TCP 三次握手建好连接，TLS 加上锁，HTTP 在上面来回搬运数据。今天不讲新概念——我们打开抓包工具，亲眼把这条链路从头到尾看一遍。<br>你会发现一件让人安心的事：那些抽象的名词，其实都能在屏幕上被你一个个指出来。"看不见"才让人怕，"看得见"就成了你的本事。</div>

## 🎯 这一讲你会学到什么

- 什么是"抓包"，它和你之前用的 `curl`、`ping` 有什么不一样；
- 两个工具：浏览器自带的 **DevTools Network 面板**（最容易上手），和专业的 **Wireshark / tcpdump**（看得最底层）；
- 怎么用**过滤器**，从成千上万条数据里只挑出你要的那几条；
- 亲手抓一次真实访问，把 **DNS 查询 → TCP 三次握手 → TLS 握手 → HTTP 请求响应** 一段段找出来；
- 翻出第 00 讲你写下的"先猜后做"，复盘哪里猜对了、哪里猜错了。

<div class="csf-note">这一讲是"动手为主"的复盘课。如果前面某一讲的概念你有点模糊，别担心——把链路完整走一遍，很多原本悬着的点反而会"咔哒"一声落地。</div>

## 🛠 跟我做

### 第 0 步：抓包到底是什么 <span class="csf-b csf-core">必读</span>

你前面用过 `ping`（看通不通）、`dig`（查域名）、`curl`（发请求）。这些命令都是你**主动发一个东西、看一个结果**。

**抓包不一样。** 抓包是在你的网卡（电脑收发数据的那张"门"）旁边架一台摄像机，把**经过这张门的每一个数据包**都录下来。你不用主动发什么，只要打开摄像机，然后正常上网，所有来来往往的包都会被记录。

打个比方：`curl` 像你自己打了个电话、记下对方说了啥；抓包像在电话线上接了个录音机，**所有人**打进打出的每一句都录下来——包括那些你平时根本看不见的"接线员对话"（DNS、握手这些）。

<div class="csf-why">为什么要这么"笨"地全录下来？因为排障时，问题常常出在你看不见的地方。页面打不开，可能是 DNS 没返回、可能是 TCP 连不上、可能是服务器回了个 403。（403 是服务器返回的一个状态码，意思是"我收到了你的请求，但不让你看这个页面"，也就是没权限。）光看浏览器那句"无法访问此网站"，你猜不出是哪一层。抓包让你把每一层都摊在桌面上看——这正是 AI 替不了你的地方：它看不到你这台电脑此刻的网卡上流过了什么。</div>

### 第 1 步：先用最简单的——浏览器 DevTools <span class="csf-b csf-core">必读</span>

不用装任何东西，每个浏览器都自带。我们先用它热个身。

1. 打开 Chrome 或 Edge（Firefox 也行），按 **F12**（Mac 上是 `Cmd+Option+I`），打开开发者工具；
2. 点上方的 **Network（网络）** 标签；
3. 勾上 **Preserve log（保留日志）**，再确认录制按钮是红的（亮着就是在录）。录制按钮是面板左上角那个小圆点：红色实心 = 正在录，灰色空心 = 没在录，点一下可以在两种状态之间切换；
4. 在地址栏输入一个**你以前没访问过**的网站，比如 `https://example.com`，回车。

<div class="csf-note"><strong>先别看结果，先猜一下：</strong>你觉得为了打开这一个页面，浏览器一共会发出几个请求？是 1 个，还是十几个？猜个数字，记在心里，再往下看。</div>

回车后，Network 面板里会刷出一排横条，这叫**瀑布图（Waterfall）**。每一横条是一个请求，从上到下按时间排开。你大概率会发现：**不止一个**——一个网页通常要拉 HTML、CSS、图片、字体、脚本……几个到几十个请求很常见。猜的是 1 个的同学，这就是第一个"先猜后做"的小惊喜。

点开其中第一个请求（一般就是那个网页文档本身），右边会出来几个子标签。重点看这两个：

- **Headers（标头）**：能看到 `Request URL`、请求方法（GET）、状态码（比如 `200 OK`）、还有请求头和响应头——这些就是第 8、9 讲讲的 HTTP 报文内容；
- **Timing（计时）**：这是今天的宝藏。它把这一个请求的耗时**按阶段拆开**了，你会看到类似这些条目：

```text
Queued / Stalled        排队、等待
DNS Lookup              ← 域名解析（第 3 讲）
Initial connection      ← TCP 建立连接（第 5、6 讲）
  └ SSL                 ← TLS 握手加锁（第 10 讲）
Request sent            ← 把请求发出去
Waiting (TTFB)          ← 等服务器返回第一个字节
Content Download        ← 把响应内容下载下来
```

<div class="csf-note"><strong>看到 SSL 别慌：它就是我们前面讲的 TLS。</strong>SSL 是这套加密协议的老名字，TLS 是它后来的新名字，很多工具（包括这里的 DevTools）至今还沿用着老叫法 SSL。所以你在 Timing 里看到的 "SSL"，可以直接当成前面第 10 讲讲的 TLS，两者就是同一个东西，不是你看错地方、也不是抓错了。</div>

看到没？**这一整条链路，DevTools 已经帮你分好段、标好时间了。** DNS、TCP、SSL（也就是 TLS）、请求、等待、下载——和你前面十讲学的顺序一模一样。

<div class="csf-note"><strong>动手定个小目标：</strong>找到你那条请求的 Timing，把 "DNS Lookup"、"Initial connection"、"SSL"、"Waiting (TTFB)" 这四个阶段各自花了多少毫秒抄下来。这就是你人生第一次"亲眼测量"一条网络链路。</div>

<div class="csf-why">为什么有时 DNS Lookup 显示 0 毫秒？因为结果被缓存了（第 3 讲的 DNS 缓存）。想看到真实的 DNS 耗时，就访问一个你从没去过的域名，或者清一下缓存。这也解释了为什么第二次打开同一个网站总是更快——很多阶段都被缓存"抄了近路"。</div>

### 第 2 步：上专业工具——Wireshark <span class="csf-b csf-key">重点</span>

DevTools 已经很好了，但它站在浏览器的角度，看的是"应用层"的请求。想看**最底层**真实流过网卡的每一个数据包（包括 TCP 三次握手那几个连应用层都看不到的小包），就要请出抓包界的"显微镜"——**Wireshark**。

**装它：** 去 [wireshark.org](https://www.wireshark.org/) 下载安装。Mac 用 `brew install --cask wireshark` 也行——不过这里的 `brew` 是 Mac 上一个常用的"软件安装器"（全名叫 Homebrew），得先把它装好，这条命令才能用；如果你没装过 brew，直接照敲会看到终端报 `command not found`，这时别卡住，用上面的官网下载方式最省事。安装时如果问你要不要装抓包驱动 / 给权限，**要同意**——不然抓不到包（这是最常见的翻车点，后面会专门说）。

打开后你会看到一排网卡（网络接口）的名字，每个名字后面有一条小小的、还在跳动的波形线。**那条线在动的，就是你正在用的网卡。**

- 用 Wi-Fi 上网：通常选名字带 `Wi-Fi`、`en0`、`wlan0` 的；
- 插网线：选带 `Ethernet`、`eth0` 的。

<div class="csf-note"><strong>选错网卡是 90% 新手抓不到包的原因。</strong>诀窍就一个：哪条波形线在跳，就双击哪个。双击之后，屏幕开始唰唰刷出一行行的包——录像机开始转了。</div>

### 第 3 步：抓一次真实访问，按层过滤 <span class="csf-b csf-core">必读</span>

包太多了，刷得眼花。别急，我们用**过滤器**一层层挑出来。Wireshark 顶部有一个长输入框（绿色那条），那就是过滤器。

**完整流程，跟着做一遍：**

1. 先别访问任何网站。在过滤器框里输入下面这条，回车——这是为了让画面"干净"一点：

```text
dns or tcp
```

2. **挑一个你刚才没访问过的网站**（缓存清掉效果最好）。回到 Wireshark，确认它在抓包（左上角有红色方块按钮亮着就是在抓）；
3. 切到浏览器，访问比如 `https://example.com`，等页面出来；
4. 回到 Wireshark，**点红色方块停止抓包**（包不再增加，方便你慢慢看）。

现在开始一层层过滤。**每输入一条，先猜你会看到什么，再回车揭晓。**

<div class="csf-legend"><strong>过滤器速查（直接抄进框里，回车）</strong><br>① <code>dns</code> —— 只看域名解析<br>② <code>tcp.flags.syn==1</code> —— 只看 TCP 握手相关的包<br>③ <code>tls.handshake</code> —— 只看 TLS 加锁握手<br>④ <code>http</code> —— 只看明文 HTTP（注意：HTTPS 看不到这一层，正常！）</div>

**① 过滤 `dns` —— 找到"问路"的那一刻**

你会看到成对出现的包：一个 `Standard query`（你问："example.com 的 IP 是多少？"），紧跟一个 `Standard query response`（DNS 服务器答："是 93.184.x.x"）。点开 response 那一行，往下展开，就能看到返回的 IP 地址。

<div class="csf-note">这就是第 3 讲的 DNS，活生生在你眼前发生了一次。把那个返回的 IP 记下来——下一步它还会出现。</div>

**② 过滤 `tcp.flags.syn==1` —— 找到三次握手**

你应该能看到这样三条（去往你刚才那个 IP 的）：

```text
1)  本机 → 服务器   [SYN]            我想连你
2)  服务器 → 本机   [SYN, ACK]       行，我也想连你
3)  本机 → 服务器   [ACK]            成，握手完成
```

<div class="csf-why">第 1、3 条只有 SYN 或只是 ACK，第 2 条同时有 SYN 和 ACK——这正是第 5 讲讲的"三次握手"。课本上那张抽象的图，现在变成了你抓包里实实在在的三行。指着屏幕跟自己说一遍："看，第二次握手把两个动作合并了。"这一刻，概念就真的是你的了。</div>

**③ 过滤 `tls.handshake` —— 找到"加锁"**

你会看到 `Client Hello`（客户端打招呼，亮出自己支持的加密方式）、`Server Hello`（服务器回应，选定方式、亮出证书）等。点开 `Client Hello` 往里翻，常常能看到一个叫 `Server Name (SNI)` 的字段，里面明明白白写着你访问的域名。

<div class="csf-note">这就是第 10 讲的 TLS 握手。注意：连接里搬运的真正内容（你的密码、页面正文）这时已经被加密了，你<strong>看不到明文</strong>——这不是抓失败，恰恰说明加密生效了。能看到握手过程和这些"元数据"（谁在和谁连、用什么加密），就够你排障了。</div>

**④ 过滤 `http` —— 看明文 HTTP**

如果你访问的是 `https://`（现在绝大多数网站都是），这个过滤器**很可能一条都不显示**，因为 HTTP 内容被 TLS 包在里面加密了。

<div class="csf-note"><strong>这是今天最重要的一个"别慌"：</strong>过滤 <code>http</code> 没东西、或者你点开 HTTPS 的包看到一堆乱码——<strong>都是正常的</strong>。那是加密后的样子。想亲眼看到明文 HTTP 长啥样，可以特意访问一个 <strong>http://</strong>（不带 s）的老网站，比如 <code>http://example.com</code> 有时会先走一次明文再跳转，或找个仍支持纯 http 的测试站。这时过滤 <code>http</code> 就能看到第 8 讲那个明文请求行 <code>GET / HTTP/1.1</code> 和一堆请求头，赤裸裸的，毫无遮挡——这也正是第 10 讲说"明文为什么危险"的最直观证据。</div>

<details class="csf-fold"><summary>不想装 Wireshark？用命令行 tcpdump 也能抓<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
Mac / Linux 自带 <code>tcpdump</code>，是 Wireshark 的命令行版。它没有图形界面，但胜在轻、快、随处可用（很多服务器上只有它）。<br><br>抓 DNS（53 端口）的包看看：<br><br><code>sudo tcpdump -n -i any port 53</code><br><br>然后在另一个终端 <code>dig example.com</code> 或随便访问个网站，你会看到 tcpdump 打印出一问一答两行 DNS。<br><br>抓某个网站的 TCP 握手（把 IP 换成你 dig 出来的）：<br><br><code>sudo tcpdump -n -i any host 93.184.215.14 and tcp</code><br><br><code>-n</code> 表示不把 IP 翻译成域名（看得更清楚），<code>-i any</code> 表示监听所有网卡（省得你纠结选哪个）。要存下来用 Wireshark 慢慢看，加 <code>-w cap.pcap</code> 写文件，之后双击 <code>cap.pcap</code> 用 Wireshark 打开即可。命令行抓、图形界面看，是很常见的组合。</details>

### 第 4 步：翻出第 00 讲的猜测，复盘 <span class="csf-b csf-core">必读</span>

还记得本门**第 00 讲**结尾，我请你写下的那段"先猜后做"吗？——在还没学之前，你猜一次网页请求里都发生了什么。现在，把那张纸（或那个备忘录）翻出来。

对着你今天抓到的包，一条条核对：

- 你当时猜到"要先把域名变成 IP"了吗？——`dns` 过滤里看到了；
- 你猜到"建立连接要来回打招呼"了吗？——`tcp.flags.syn` 里那三行就是；
- 你之前是不是以为抓包能直接看到密码？如果是，正好——今天你已经亲眼看到了为什么看不到，这其实是好事，说明加密在替你工作；
- 有没有哪一步是你完全没想到、今天才第一次见的？

<div class="csf-note">这一步别省。猜对的地方，是你建立的直觉被验证了；<strong>猜错的地方，才是这门课真正改变你的地方。</strong>把"我原来以为 ×××，其实是 ○○○"这样的句子写下来两三条——这比读十遍课本都管用。</div>

## 💡 自己复述一遍

合上屏幕，用一句话说给自己听：

> "抓包就是把流过我网卡的所有数据包录下来；用过滤器一层层挑，我能亲眼看到 DNS 问路、TCP 三次握手、TLS 加锁、然后 HTTP 来回搬数据——HTTPS 的内容是乱码很正常，那是加密生效了。"

说得磕巴没关系，多说几遍。能用大白话讲清楚，才算真的是你的。

## 🔧 翻车现场

<div class="csf-card"><strong>翻车 1：Wireshark 一个包都抓不到。</strong><br>九成是<strong>选错网卡</strong>了。回到接口列表，看哪条小波形线在跳动，双击那个。Wi-Fi 一般是 <code>en0</code> / <code>Wi-Fi</code>，网线一般是 <code>Ethernet</code> / <code>eth0</code>。<br>另一成是<strong>没给权限</strong>：装的时候没装抓包驱动，或没用管理员权限。Windows 重装时勾上 Npcap；Mac 重新安装并允许相关权限；Linux 用 <code>sudo</code> 跑，或把自己加进 <code>wireshark</code> 用户组。</div>

<div class="csf-card"><strong>翻车 2：看到 HTTPS 内容是乱码，以为抓失败了。</strong><br>这是<strong>本讲最常见的误会</strong>。HTTPS 的正文被 TLS 加密了，抓到的就该是乱码——这恰恰证明加密在工作。你能看到的是"握手过程"和"元数据"（谁连谁、用什么加密、SNI 里的域名），这些足够排障。想看明文，去访问纯 <code>http://</code> 的站。</div>

<div class="csf-card"><strong>翻车 3：过滤 <code>dns</code> 啥也没有。</strong><br>多半是<strong>缓存</strong>——你最近访问过，IP 早被缓存了，压根没发新的 DNS 查询。换一个你没去过的域名，或者抓包前先清 DNS 缓存（Mac：<code>sudo dscacheutil -flushcache</code>；Windows：<code>ipconfig /flushdns</code>），再试。<br>提示：Mac 那条命令开头的 <code>sudo</code> 表示用管理员权限运行；回车后它可能让你输开机密码，注意输的时候屏幕不会显示任何字符（连小圆点都没有），这是正常的安全设计，不是卡住了也不是你敲错了，照常把密码打完直接回车即可。</div>

<div class="csf-card"><strong>翻车 4：包刷得太快，根本看不清。</strong><br>别想着"边访问边看"。正确节奏是：<strong>开始抓 → 访问网站 → 立刻停止抓包 → 再慢慢用过滤器分析</strong>。停下来的画面是静止的，你想看多久看多久。</div>

## ✅ 自检三问

1. 抓包和 `curl` 最大的区别是什么？（提示：一个是主动发一次、一个是把经过网卡的**所有**包都录下来）
2. 你访问一个 HTTPS 网站，过滤 `http` 却一条都看不到，是哪里出问题了吗？该怎么解释？
3. 在抓包里，怎么一眼认出 TCP 的"三次握手"那三个包？（它们的标志位分别是什么？）

答不上来的，回到对应那一步再走一遍——这一讲的价值全在"亲手做过"，不在"读过"。

## 🚀 挑战

挑一个你**每天都用**的网站（视频站、社交、购物都行），完整抓一次它的首页加载，然后做三件事：

1. 用 `dns` / `tcp.flags.syn==1` / `tls.handshake` 三个过滤器，分别截一张图，标出 DNS 应答的 IP、三次握手的三行、TLS 的 Client Hello；
2. 在 DevTools 的 Network 里看这个站首页，数一数它一共发了多少个请求、总共下载了多少 KB；
3. 用**三句话**把这次请求的旅程讲给一个完全不懂技术的朋友（或家人）听，看他们能不能听懂。能把外行讲明白，你就真懂了。

<div class="csf-note">这一题没有标准答案，请<strong>务必自己动手抓、自己写那三句话</strong>，别让 AI 替你描述。AI 没在你的网卡旁边，它编不出你这次真实抓到的包；而你写出来的每一句，都是你刚刚亲眼见过的东西。这正是这门课从头到尾想交给你的能力。</div>

## 📦 复制带走

<div class="csf-card">📌 <strong>抓包 = 给网卡架摄像机</strong>，把经过的每个数据包都录下来；它和 <code>curl</code>/<code>ping</code> 的区别是"全程监听"而非"发一次看一次"。<br><br>📌 <strong>两个工具分层用</strong>：DevTools Network 看应用层请求、还自动按 DNS/TCP/SSL 分好了计时；Wireshark / tcpdump 看最底层每一个包，连三次握手都看得见。<br><br>📌 <strong>过滤器是关键</strong>：<code>dns</code>、<code>tcp.flags.syn==1</code>、<code>tls.handshake</code>、<code>http</code> 四条，就能把整条链路一段段挑出来。<br><br>📌 <strong>HTTPS 乱码是正常的</strong>，那是加密生效；能看到握手和元数据就够排障。抓不到包先查"网卡选错 / 没给权限"。</div>

---

### 写在整门课的末尾

到这里，《计算机网络》这门课就走完了。回头看看你这一路：从"网络是什么"，到 DNS 问路、IP 和端口找门牌、TCP 握手建连接、HTTP 搬数据、HTTPS 加锁，最后今天，你**亲手把这条链路从头到尾看了一遍**。

那个曾经写着"无法访问此网站"就让你束手无策的黑盒，现在被你拆成了一层一层、看得见摸得着的东西。**下次再遇到打不开的页面，你不会只会复制报错去问 AI 了**——你会想：是 DNS 没解析？TCP 没连上？还是服务器回了个 403？然后打开 DevTools 或抓个包，自己一层层定位。这就是从"用网络的人"变成"懂网络的人"。

别担心还没"精通"——没有人靠一门入门课就精通网络，这很正常，也很诚实。但你已经有了最重要的东西：**一张能在脑子里画出来的链路图，和亲手验证它的能力。**往后每一次排障、每读一篇更深的资料，都是在这张图上加细节。

接下来去哪？这门是《计算机网络》。整个《计算机基本功路线图》系列里还有别的课在等你——无论是继续往下走操作系统、数据库，还是回去补补编程基础，记住今天这门课教你的那个核心姿势就好：**不把它当黑盒，亲手把它打开看一眼。**

辛苦了。下一门课，我们再见。
