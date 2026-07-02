---
title: "《秋招计网面试实战课》第04讲 · HTTP 进阶与性能（HTTP/1.1、HTTP/2、HTTP/3、队头阻塞、多路复用、QUIC）"
date: 2026-07-09 12:00:00
tags: [计算机网络, 秋招, 面试, 八股文, 校招]
categories: [面试]
toc: true
visibility: public
---

<style>
.niv-b{display:inline-block;font-size:12px;font-weight:700;padding:1px 8px;border-radius:999px;vertical-align:middle;margin-left:6px;line-height:1.7;white-space:nowrap}
.niv-core{color:#fff;background:#b73a2c}
.niv-key{color:#93301f;background:rgba(183,58,44,.12);border:1px solid rgba(183,58,44,.32)}
.niv-adv{color:#7a8390;background:rgba(122,131,144,.1);border:1px solid rgba(122,131,144,.25)}
.niv-q,.niv-a,.niv-why,.niv-scene,.niv-card,.niv-trap{margin:18px 0;padding:14px 16px;line-height:1.78;border-radius:8px}
.niv-q{background:rgba(183,58,44,.08);border-left:4px solid #b73a2c}
.niv-a{background:rgba(63,93,126,.08);border-left:4px solid #3f5d7e}
.niv-why{background:var(--wash);border-left:4px solid var(--line);color:var(--muted)}
.niv-scene{background:rgba(47,118,95,.1);border-left:4px solid #2f765f}
.niv-card{background:rgba(183,58,44,.07);border:1px solid rgba(183,58,44,.34);border-radius:10px}
.niv-trap{background:rgba(155,102,50,.1);border-left:4px solid #9b6632}
.niv-fold{margin:18px 0;padding:4px 16px;border:1px solid var(--line);border-radius:8px;background:var(--wash)}
.niv-fold summary{cursor:pointer;font-weight:700;padding:10px 0}
.niv-fold[open]{padding-bottom:14px}
html[data-user-color-scheme="dark"] .niv-key{color:#e08a7a;background:rgba(183,58,44,.22);border-color:rgba(183,58,44,.5)}
html[data-user-color-scheme="dark"] .niv-q{background:rgba(183,58,44,.2)}
html[data-user-color-scheme="dark"] .niv-a{background:rgba(63,93,126,.2)}
html[data-user-color-scheme="dark"] .niv-scene{background:rgba(47,118,95,.2)}
html[data-user-color-scheme="dark"] .niv-card{background:rgba(183,58,44,.16)}
</style>

<div class="niv-q">
上一讲讲清了 HTTP 怎么用，这一讲面试官要往「性能」和「版本演进」上问：HTTP/1.1 慢在哪、HTTP/2 靠什么变快、为什么 HTTP/2 号称多路复用了还会阻塞、HTTP/3 为什么放着好好的 TCP 不用偏要用 UDP。这条主线几乎是所有大厂前端、后端、客户端面试的必考题。答对的关键，是抓住一条贯穿始终的暗线：队头阻塞（Head-of-Line Blocking），三个版本的演进本质就是在一层层地消灭它。
</div>

## 🎯 这一讲能答对哪些面试题

- HTTP/1.1 有什么性能问题？pipelining 为什么没能救场？<span class="niv-b niv-core">高频必背</span>
- HTTP/2 相比 1.1 做了哪些改进？多路复用是怎么回事？<span class="niv-b niv-core">高频必背</span>
- 既然 HTTP/2 多路复用了，为什么还存在队头阻塞？<span class="niv-b niv-key">场景追问</span>
- HTTP/3 为什么要基于 UDP，而不是继续用 TCP？<span class="niv-b niv-key">场景追问</span>
- QUIC 是什么？它跑在 UDP 上怎么保证可靠？<span class="niv-b niv-core">高频必背</span>
- 什么是 0-RTT？连接迁移又是什么？<span class="niv-b niv-adv">进阶加分</span>
- HTTP/2 的头部压缩和 server push 是干嘛的？<span class="niv-b niv-adv">进阶加分</span>

## 📖 核心八股：先讲清楚定义

先立一个总纲，后面所有内容都挂在它上面：

```text
HTTP/1.1  →  文本协议，一个连接一次只能处理一个请求（串行），有 HTTP 层队头阻塞
HTTP/2    →  二进制分帧 + 多路复用，解决了 HTTP 层队头阻塞，但仍受 TCP 层队头阻塞
HTTP/3    →  基于 QUIC(over UDP)，把可靠传输搬到用户态，连 TCP 层队头阻塞也解决
```

一句话记：**每一代都在解决上一代残留的队头阻塞。**

### 什么是队头阻塞

队头阻塞（Head-of-Line Blocking，队伍最前面那个卡住了，后面全得等）指的是：一个有序队列里，排在前面的任务处理不完，后面的即使已经就绪也没法先走。HTTP 世界里它出现在两个层面，分清这两层是这一讲的核心。

- **HTTP 层队头阻塞**：一条连接上请求必须排队，前一个响应没回来，后一个不能发/不能处理。
- **TCP 层队头阻塞**：TCP 保证字节按序交付，中间某个数据包丢了，后面即使收到也得在内核缓冲区里等它重传补齐，上层拿不到。

### HTTP/1.1：串行与 pipelining 的失败

HTTP/1.1 引入了长连接（Keep-Alive），一条 TCP 连接可以复用发多个请求，省了反复握手。但它有个硬伤：**同一条连接上，请求-响应必须一来一回地串行**，发了请求 A 就得等 A 的响应回来，才能发 B。这就是 HTTP 层队头阻塞。

为缓解，1.1 设计了 **pipelining（管线化）**：允许客户端连续发多个请求不必等响应。但它规定**响应必须按请求顺序返回**，于是第一个响应慢，后面全被堵住，队头阻塞没解决只是换了个位置；再加上很多代理、服务器实现有问题，浏览器基本默认不开 pipelining，它在工程上是失败的。

<div class="niv-why">
<strong>那 1.1 时代前端怎么提速？</strong>靠「土办法」绕开单连接串行：浏览器对同一域名开多个 TCP 连接（数量有上限，取决于浏览器实现）并行下载；再配合域名分片（把资源分散到多个子域名骗过连接数限制）、雪碧图/合并文件（减少请求数）、内联小资源等。这些优化在 HTTP/2 时代大多变成反模式，因为 2 从协议层解决了并发问题。
</div>

### HTTP/2：二进制分帧 + 多路复用

HTTP/2 的核心改动是把文本协议改成了**二进制分帧**：一条 TCP 连接被抽象成多个逻辑「流（Stream）」，每个请求/响应是一个流，数据被切成一个个「帧（Frame）」，帧头里带流 ID。

有了流 ID，不同请求的帧就能在同一条连接上**交错发送、乱序到达再按流 ID 重组**，这就是**多路复用（Multiplexing）**：一条连接上可以同时跑很多请求，谁先好谁先回，不用互相等。HTTP 层的队头阻塞就此解决。

主要特性：

- **多路复用**：一条 TCP 连接并发多个请求/响应，消除 HTTP 层队头阻塞。
- **头部压缩（HPACK）**：HTTP 头部有大量重复字段（Cookie、User-Agent 等），HPACK 用静态表 + 动态表 + 哈夫曼编码压缩，省流量。
- **二进制分帧**：比文本解析更高效、更少歧义。
- **流优先级**：客户端可以给流标注优先级，让重要资源先传。
- **Server Push（服务端推送）**：服务器可以在客户端请求 HTML 时主动把它将要用的 CSS/JS 推过去。

<div class="niv-why">
<strong>关于 Server Push 要客观说。</strong>它的初衷是省一个来回，但实际使用中容易推了客户端已缓存的资源造成浪费，收益和复杂度不成正比，业界对它评价不高、使用有限（部分实现已弱化或移除支持，具体取决于实现）。面试时点出「设计初衷 + 实践中收益有限」即可，不要吹成 HTTP/2 的核心卖点。
</div>

```text
HTTP/1.1（单连接串行）：
  连接 |--请求A--|--响应A--|--请求B--|--响应B--|   B 必须等 A

HTTP/2（单连接多路复用）：
  连接 |A1 B1 A2 B2 C1 B3 ...|   A/B/C 的帧交错并发，按流ID重组
```

### HTTP/2 没解决的：TCP 层队头阻塞

HTTP/2 把多路复用做在了应用层，但底下**仍然是一条 TCP 连接**。TCP 保证字节流按序、可靠交付，一旦某个 TCP 段丢包，TCP 必须等它重传补齐后才能把后续数据按序交给上层。

问题来了：HTTP/2 那么多流共用这一条 TCP 连接，只要有一个包丢了，TCP 就卡住整条连接的交付，**所有流一起被堵**，哪怕别的流的数据早就完整到了。这就是 **TCP 层队头阻塞**——它在 HTTP 层看不见、也管不着，因为病根在传输层。丢包率越高（弱网、移动网络），这个问题越明显。

### HTTP/3 与 QUIC

HTTP/3 的做法很激进：**不用 TCP 了，改用 QUIC**。QUIC 是 Google 提出、后由 IETF 标准化的传输协议，它**跑在 UDP 之上**，在用户态自己实现了可靠传输、拥塞控制、多路复用和加密。

为什么这样能解决 TCP 层队头阻塞？因为 QUIC 把「流」的概念下沉到了传输层：QUIC 自己管理多个流，**各个流之间相互独立，某个流丢包只影响它自己，不会阻塞其他流**。UDP 本身不保证顺序、不重传，正好给了 QUIC 「按流独立恢复」的自由。

QUIC 的关键能力：

- **多路复用且流间独立**：单流丢包不牵连其他流，真正消除队头阻塞。
- **内建加密**：QUIC 把 TLS 1.3 融进握手，传输默认加密，没有「明文 QUIC」。
- **更快的握手 / 0-RTT**：把传输握手和加密握手合并，减少建连往返；对之前连过的服务器可支持 0-RTT，首个请求就能带数据。
- **连接迁移（Connection Migration）**：QUIC 用「连接 ID」标识连接，而不是靠「四元组（源/目的 IP+端口）」。所以手机从 Wi-Fi 切到 4G、IP 变了，连接也不用重建，体验上不断流。

<div class="niv-why">
<strong>为什么偏偏是 UDP？</strong>不是 UDP「快」这么简单。真正原因是：TCP 的按序交付逻辑固化在操作系统内核里，想改（比如做流间独立）几乎不可能推动全网升级。UDP 只是一个「什么都不管」的薄传输层，把可靠性、顺序、多路复用全交给上层自己实现。QUIC 正是利用 UDP 这块「白纸」，在用户态重新造了一套更灵活的可靠传输，还能随版本快速迭代，不受内核升级掣肘。所以「HTTP/3 用 UDP」的本质是「为了可控和可演进」，不是「UDP 天生快」。
</div>

## 🔍 场景追问：面试官会顺着问

<div class="niv-scene"><strong>追问：</strong>你说 HTTP/2 多路复用消除了队头阻塞，那为什么大家又说 HTTP/2 还有队头阻塞？</div>

关键是分层。HTTP/2 消除的是**应用层（HTTP 层）**的队头阻塞：请求不再需要串行排队，多个流能在一条连接上并发。但它底层还是**一条 TCP 连接**，TCP 为了保证字节按序交付，任何一个 TCP 段丢了，都要等重传补齐，期间整条连接的数据都交付不上去，跑在这条连接上的**所有 HTTP/2 流一起被卡**。所以准确表述是：HTTP/2 解决了 HTTP 层队头阻塞，但引入/暴露了 TCP 层队头阻塞，尤其在丢包多的弱网下更明显。这恰恰是 HTTP/3 出场的理由。答这题一定要把「HTTP 层」和「TCP 层」两个词咬清楚。

<div class="niv-scene"><strong>追问：</strong>HTTP/3 用 UDP，UDP 不可靠、会丢包、乱序，那 HTTP/3 怎么保证数据不丢、不乱？</div>

靠上面的 QUIC。UDP 只是个「运输通道」，QUIC 在它之上于用户态重新实现了 TCP 那套可靠性机制：每个数据包有序号，接收方回确认（ACK），丢了就重传；有拥塞控制和流量控制；有自己的流管理保证每个流内部按序。区别在于，QUIC 的顺序保证是**按流独立**的，不是像 TCP 那样对整条连接强制全局有序，所以一个流丢包不会拖累别的流。一句话:「可靠性没丢，是从内核搬到了用户态、并且按流拆开了」。

<div class="niv-scene"><strong>追问：</strong>0-RTT 是什么？它有什么代价？</div>

0-RTT（Zero Round Trip Time）指客户端在**握手的第一个包里就带上应用数据**，不用先来回握手再发请求，适用于之前连接过、缓存了握手参数的服务器，能显著降低首包延迟。代价是安全上的权衡：0-RTT 发送的早期数据存在被**重放攻击**的风险（攻击者截获并重复发送这个数据包），所以规范要求 0-RTT 只用于幂等、可安全重放的请求（比如 GET），不能用来做「下单、转账」这类会改状态的操作。回答时点出「省一个 RTT + 只适合幂等请求 + 有重放风险」这三点就很完整。

<div class="niv-scene"><strong>追问：</strong>连接迁移解决了什么实际问题？</div>

解决「换网就断连」的痛点。传统 TCP 连接由四元组（源 IP、源端口、目的 IP、目的端口）唯一标识，你手机从 Wi-Fi 切到蜂窝网络，本地 IP 变了，四元组就变了，原来的 TCP 连接直接失效，得重新建连、重新握手，视频可能卡一下。QUIC 改用一个和网络地址无关的**连接 ID** 来标识连接，IP/端口变了连接 ID 没变，连接照样延续，不用重建。对移动端体验提升明显，这是 HTTP/3 在 App 场景很受欢迎的原因之一。

## 🛠 动手验证（可选做）

可以用 curl 观察实际协商到的 HTTP 版本，以及尝试指定版本请求。

```bash
# 看这次请求最终用了哪个 HTTP 版本（输出如 HTTP/2 或 HTTP/1.1）
curl -sI -o /dev/null -w '%{http_version}\n' https://www.cloudflare.com

# 强制用 HTTP/2 请求，-v 里能看到 ALPN 协商 h2 的过程
curl -v --http2 https://www.cloudflare.com -o /dev/null

# 尝试用 HTTP/3（需要你的 curl 编译时带 HTTP/3 支持，否则会报不支持）
curl -v --http3 https://www.cloudflare.com -o /dev/null
```

第一条最直观：换几个大站点看看返回的 http_version，你会发现主流站点普遍已经是 HTTP/2，部分支持 HTTP/3。注意 `--http3` 依赖 curl 的编译选项，很多系统自带的 curl 并没有开启，跑不通是正常的，不代表你写错了。

## 🧨 高频翻车点

<div class="niv-trap">
<strong>翻车 1：说「HTTP/2 彻底解决了队头阻塞」。</strong>只解决了 HTTP 层的，TCP 层队头阻塞还在，弱网丢包时所有流一起卡。彻底解决的是基于 QUIC 的 HTTP/3。答题务必区分「HTTP 层」和「TCP 层」。
</div>

<div class="niv-trap">
<strong>翻车 2：说「HTTP/3 用 UDP 是因为 UDP 更快」。</strong>不准确。核心原因是 TCP 的按序交付逻辑固化在内核难以演进，UDP 是可编程的薄层，QUIC 借它在用户态自造更灵活、按流独立、可快速迭代的可靠传输。快是结果，不是动机。
</div>

<div class="niv-trap">
<strong>翻车 3：把 HTTP/2 多路复用等同于「HTTP/1.1 开多个 TCP 连接」。</strong>不一样。1.1 是靠多条连接硬凑并发（连接数有上限、各连接独立握手、抢带宽）；HTTP/2 是**一条**连接上用流并发，更省资源也更好做优先级和头部压缩。
</div>

## 🎤 面试话术模板

<div class="niv-a">
<strong>30 秒口述版（H1/H2/H3 演进主线）：</strong>「HTTP 版本演进就是一条消灭队头阻塞的主线。HTTP/1.1 一条连接请求要串行排队，是 HTTP 层队头阻塞，pipelining 因为响应必须按序返回没能真正解决。HTTP/2 用二进制分帧和多路复用，让多个请求在一条 TCP 连接上并发交错，解决了 HTTP 层队头阻塞，还加了 HPACK 头部压缩；但它底下还是一条 TCP，一旦丢包，TCP 按序交付会把所有流一起卡住，这就是残留的 TCP 层队头阻塞。HTTP/3 干脆改用基于 UDP 的 QUIC，在用户态实现可靠传输并让各个流相互独立，一个流丢包不影响别的流，彻底消除队头阻塞，同时还带来更快握手、0-RTT 和连接迁移。所以 H1 到 H3，本质是把队头阻塞从应用层一路赶到传输层再消灭掉。」
</div>

## ✅ 自测三问

1. HTTP/1.1 的 pipelining 想解决什么问题？为什么没成功？
2. HTTP/2 解决了哪一层的队头阻塞？它没能解决哪一层、为什么？
3. HTTP/3 为什么基于 UDP？QUIC 在 UDP 上怎么保证可靠传输？

<details class="niv-fold"><summary>对答案</summary>

1. pipelining（管线化）想解决 1.1 单连接请求-响应串行的问题，允许连续发多个请求不必逐个等响应。但它要求响应仍按请求顺序返回，第一个响应慢就堵住后面全部，队头阻塞没消除只是换了位置；加上代理/服务器实现不佳，浏览器基本默认不启用，工程上失败。

2. HTTP/2 用多路复用解决了**HTTP 层**（应用层）的队头阻塞，多个流可在一条连接上并发。它没解决**TCP 层**队头阻塞：底层仍是单条 TCP，TCP 保证按序交付，任一数据段丢包就要等重传，期间整条连接上所有流一起被卡，弱网丢包时尤其明显。

3. 因为 TCP 的按序交付逻辑固化在内核、难以改造和全网升级，而 UDP 是可编程的薄传输层。QUIC 在 UDP 之上于用户态重建可靠性：数据包编号 + ACK 确认 + 丢包重传 + 拥塞/流量控制，并让每个流独立按序，一个流丢包不牵连其他流。可靠性没丢，只是搬到了用户态并按流拆开。

</details>

## 📦 复制带走

<div class="niv-card">
<strong>一条主线：</strong>H1 → H2 → H3 就是不断消灭队头阻塞。H1 有 HTTP 层阻塞，H2 解决 HTTP 层但留 TCP 层，H3(QUIC) 连 TCP 层都解决。
</div>

<div class="niv-card">
<strong>HTTP/2 三件套：</strong>二进制分帧 + 多路复用（一条连接并发多流）+ HPACK 头部压缩；流优先级、Server Push 为辅（Push 实践收益有限）。
</div>

<div class="niv-card">
<strong>两层队头阻塞：</strong>HTTP 层=请求排队串行（H2 解决）；TCP 层=丢包导致按序交付卡住整条连接、拖累所有流（H3 解决）。
</div>

<div class="niv-card">
<strong>QUIC 记四点：</strong>UDP 之上用户态可靠传输、流间独立不互堵、内建 TLS1.3 加密、0-RTT 与连接迁移（连接 ID 替代四元组，换网不断连）。
</div>

<p style="margin-top:24px"><a href="/courses/net-interview/">← 回到《秋招计网面试实战课》目录</a></p>
