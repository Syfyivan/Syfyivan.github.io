---
title: "《秋招计网面试实战课》第08讲 · UDP 与 QUIC（UDP 为什么快、HTTP/3 为何基于 UDP、QUIC 如何重建可靠性）"
date: 2026-07-09 16:00:00
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
讲完 TCP，面试官八成会来一句「那 UDP 呢？」这题看着简单，其实是个组合拳：先问 UDP 为什么快、为什么不可靠、用在哪；再顺势追到「HTTP/3 为什么要基于 UDP」；最后落到「既然 UDP 不可靠，QUIC 是怎么在它上面重建可靠传输的」。很多人只会背「UDP 无连接、不可靠」，一往下追就哑火。这一讲帮你把 UDP 和 QUIC 讲成一条逻辑线，最后再给你一套「TCP 和 UDP 怎么选」的话术。
</div>

## 🎯 这一讲能答对哪些面试题

- UDP 为什么比 TCP 快？它「不可靠」体现在哪？<span class="niv-b niv-core">高频必背</span>
- UDP 适合哪些场景？为什么这些场景不用 TCP？
- HTTP/3 为什么要基于 UDP，而不是继续用 TCP？<span class="niv-b niv-key">场景追问</span>
- QUIC 在 UDP 之上是怎么重新实现可靠传输和多路复用的？
- QUIC 的连接迁移是什么？0-RTT 又是什么、有什么风险？<span class="niv-b niv-adv">进阶加分</span>
- TCP 和 UDP 到底怎么选？

## 📖 核心八股：先讲清楚定义

**UDP（User Datagram Protocol，用户数据报协议）**是传输层的另一个主角，跟 TCP 完全是两种性格。TCP 是「负责到底」的可靠管家，UDP 是「发完就走」的快递投递。

先看 UDP 的三个特点，也是它「快」的根源：

- **无连接**：不需要三次握手，想发就发，第一个数据报就能带业务数据，省掉了建立连接的往返时延。
- **不保证可靠**：不确认、不重传、不排序。丢了就丢了，乱了就乱了，UDP 自己不管。
- **无拥塞控制、无流量控制**：不会因为网络拥堵就自己降速，也不看接收方缓冲区。想发多快发多快（后果自负）。

<div class="niv-a">
<strong>标准回答模板（UDP 为什么快）：</strong>UDP 快在「省」。它无连接，不需要握手就能发数据，省掉建连的往返；它不做确认、重传、排序，也没有拥塞控制和流量控制，头部只有 8 字节（源端口、目的端口、长度、校验和），协议开销极小。代价是不可靠：可能丢包、乱序、重复，这些都得由应用层自己按需处理。
</div>

<div class="niv-why">
UDP 头部固定 8 个字节，只有源端口、目的端口、长度、校验和四个字段。对比 TCP 头部（最小 20 字节，还有序列号、确认号、各种标志位和窗口），你就能直观感受到 UDP 的「轻」。轻意味着开销小、处理快，但也意味着可靠性得靠上层自己补。
</div>

```text
UDP 报文头部（固定 8 字节）
0                16               31
+----------------+----------------+
|   源端口(16)    |  目的端口(16)   |
+----------------+----------------+
|    长度(16)     |  校验和(16)     |
+----------------+----------------+
|              数据 ...            |
+---------------------------------+
```

**UDP 的适用场景**，核心特征是「实时性 / 低延迟 比 完整性 更重要」，或者「上层自己做了可靠性」：

- **DNS 查询**：一问一答、报文小，用 UDP 快；丢了重问一次即可。（超过限制或区域传送等场景会改用 TCP，这点第 09 讲会讲。）
- **音视频通话、直播、在线游戏**：宁可丢一两帧、掉一点数据，也不能为了重传旧数据而卡顿；旧的画面重传出来反而没意义。
- **QUIC / HTTP/3**：在 UDP 之上由应用层（用户态）自己重建可靠性，兼顾灵活和性能，这正是这一讲的重点。

### HTTP/3 为什么基于 UDP

要理解这个，得先接上一讲和第 04 讲的线索：**HTTP/2 虽然在应用层做了多路复用，但底层还是 TCP，仍然逃不掉「TCP 层队头阻塞」。**

<div class="niv-why">
什么是 TCP 层队头阻塞？TCP 向上提供的是「按序的字节流」，它必须保证交付给应用的数据是有序的。HTTP/2 在一条 TCP 连接上并行跑多个流（stream），但只要底层 TCP 有一个报文段丢了，TCP 为了保证顺序，就会把它后面所有已经到达的数据都压着不交给应用，哪怕那些数据属于别的、完全没丢包的流。结果一个包丢失卡住了所有流，这就是 TCP 层的队头阻塞。HTTP/2 的应用层多路复用解决不了它，因为问题出在下面的 TCP。
</div>

HTTP/3 的答案是：**换掉 TCP，改用 QUIC，而 QUIC 跑在 UDP 之上。** UDP 本身不保证顺序、不做「必须按序交付」这件事，QUIC 就可以在用户态自己按「流」为粒度管理顺序——某个流丢包只影响它自己，不会阻塞其它流。于是队头阻塞被从传输层根子上解决了。

<div class="niv-a">
<strong>标准回答模板（HTTP/3 为何基于 UDP）：</strong>HTTP/2 的多路复用是在应用层做的，底层还是 TCP，而 TCP 提供的是按序字节流，一个报文丢失会把后面所有流的数据都卡住，这就是 TCP 层队头阻塞，应用层多路复用解决不了。HTTP/3 改用 QUIC，QUIC 基于 UDP，UDP 不强制按序交付，QUIC 就能在用户态以流为粒度独立管理可靠性和顺序，某个流丢包只影响自己，从根上消除了队头阻塞。选 UDP 不是因为 UDP 好，而是因为 UDP 「什么都不管」，给了 QUIC 在用户态自由重建协议栈的空间。
</div>

<div class="niv-why">
还有个现实原因：TCP 是内核实现的，改一个特性要等操作系统升级，迭代极慢；而 QUIC 跑在用户态，协议逻辑在应用程序里，可以随浏览器/客户端快速升级迭代。选 UDP 相当于「借 UDP 的壳，在用户态造一个更灵活的传输层」。
</div>

### QUIC 是怎么在 UDP 上重建可靠性的

**QUIC（Quick UDP Internet Connections）**把 TCP 丢掉的东西在用户态一件件补回来，还顺手加了几个 TCP 做不到的能力：

- **可靠传输**：QUIC 自己实现了序号、确认、重传和拥塞控制，所以虽然底层是「不可靠」的 UDP，整体依然是可靠的。可靠性是 QUIC 给的，不是 UDP 给的。
- **多路复用（无队头阻塞）**：一条 QUIC 连接上有多个独立的 stream，每个流单独维护顺序和重传，一个流丢包不影响其它流。这是相对 HTTP/2 over TCP 的关键改进。
- **内建加密**：QUIC 把传输和加密（基于 TLS 1.3）整合在一起，握手时就完成密钥协商，减少了「先 TCP 握手再 TLS 握手」的分层往返。
- **连接迁移**：QUIC 用一个**连接 ID（Connection ID）**标识连接，而不是像 TCP 那样用「源 IP + 源端口 + 目的 IP + 目的端口」四元组。所以你从 Wi-Fi 切到 4G、IP 变了，连接 ID 没变，连接还能延续，不必重新握手。这对手机场景特别有用。
- **0-RTT**：对之前连接过的服务器，QUIC 可以复用缓存的握手信息，在第一个数据包里就带上业务数据，握手往返进一步减少。首次连接一般是 1-RTT，恢复连接则可能做到 0-RTT。

```text
连接建立往返对比（示意，实际取决于版本与实现）
TCP + TLS1.3(HTTPS):  TCP三次握手(1 RTT) + TLS握手(约1 RTT) 才能发数据
QUIC(HTTP/3) 首次:    握手与加密合并，约 1 RTT 即可发数据
QUIC 恢复连接:        0-RTT，首个数据包即可携带业务数据
```

<div class="niv-a">
<strong>标准回答模板（QUIC 重建可靠性）：</strong>QUIC 基于 UDP，但在用户态自己实现了序号、确认、重传和拥塞控制，所以整体是可靠的。它以流为单位做多路复用，每个流独立管理顺序和重传，避免了 TCP 层队头阻塞；它内建 TLS 1.3 加密，把传输握手和加密握手合并，减少往返；它用连接 ID 而非四元组标识连接，支持 IP 变化时的连接迁移；对已连接过的服务器还能用 0-RTT 让首个数据包就带业务数据。一句话：QUIC 借 UDP 这个不设限的底座，在用户态重造了一个比 TCP 更灵活的可靠传输层。
</div>

<div class="niv-why">
0-RTT 有个安全注意点：因为它在完整握手确认之前就发送了业务数据，这部分数据存在被<strong>重放攻击</strong>的风险。所以协议设计上 0-RTT 一般只用于「幂等」请求（比如 GET 这类重复执行也无副作用的操作），不建议用于会改数据状态的非幂等请求。追问到 0-RTT 时能主动提这一点是加分项。
</div>

## 🔍 场景追问：面试官会顺着问

<div class="niv-scene"><strong>追问：</strong>既然 HTTP/2 已经多路复用了，为什么还会队头阻塞？HTTP/3 又凭什么能解决？</div>

关键在「多路复用发生在哪一层」。HTTP/2 的多路复用在应用层，但底层是 TCP，TCP 提供按序字节流，任何一个 TCP 报文段丢失，为了保证顺序，后面所有已到达的数据（包括其它流的）都得等这个包补齐才能上交，这是 TCP 层的队头阻塞，应用层管不着。HTTP/3 换成 QUIC over UDP，UDP 不强制按序，QUIC 在用户态以流为粒度各自管顺序和重传，一个流丢包只卡它自己，其它流照常前进，所以从传输层根子上解决了。答题要点：**说清阻塞发生在 TCP 层、HTTP/2 解决不了，HTTP/3 靠换传输层解决。**

<div class="niv-scene"><strong>追问：</strong>UDP 不可靠，那基于 UDP 的 QUIC 为什么是可靠的？可靠性到底谁给的？</div>

可靠性是 **QUIC 自己在用户态实现的**，不是 UDP 给的。UDP 只负责把数据报尽力发出去，QUIC 在它上面补齐了序号、ACK 确认、超时/丢包重传、拥塞控制这一整套机制。所以「底层不可靠」和「整体可靠」并不矛盾——就像快递本身不保证不丢件，但你自己做了签收确认和补寄流程，整个寄送过程照样可靠。这题考的就是「分层」意识：不可靠的是传输通道 UDP，重建可靠性的是上面的 QUIC。

<div class="niv-scene"><strong>追问：</strong>手机从 Wi-Fi 切到蜂窝网络，为什么 QUIC 连接不断而 TCP 会断？</div>

因为两者标识连接的方式不同。TCP 用四元组（源 IP、源端口、目的 IP、目的端口）标识一条连接，IP 一变四元组就变了，原连接失效，得重新握手。QUIC 用一个与 IP、端口解耦的**连接 ID** 来标识连接，网络切换导致 IP 变化时，连接 ID 不变，服务端凭连接 ID 就能认出这还是同一条连接，于是连接得以「迁移」并延续，不用重新握手。这就是**连接迁移**，对移动端弱网/切网体验提升明显。

<div class="niv-scene"><strong>追问：</strong>你会怎么在 TCP 和 UDP 之间做选型？</div>

看业务对「可靠 vs 实时」的取舍：

- 需要**数据完整、不能丢、要有序**（文件传输、网页/接口、数据库、邮件、大多数 RPC）：选 **TCP**，它把可靠性都做好了，省心。
- 追求**低延迟、能容忍少量丢包**，或者旧数据重传没意义（实时音视频、直播、在线游戏、DNS 这类小请求）：选 **UDP**，必要的可靠性由应用层按需自己补。
- 既要低延迟又要可靠、还想解决队头阻塞和连接迁移：用 **QUIC / HTTP/3**，等于「UDP 的底 + 用户态自建的可靠层」。

答题要落到「按业务对可靠性和实时性的权衡来选，并知道 QUIC 是第三条路」。

## 🛠 动手验证（可选做）

用命令实际感受一下 UDP 和 HTTP/3：

```bash
# DNS 默认走 UDP，用 dig 查一次域名，观察响应（后面第09讲细讲）
dig www.example.com

# 用 nc 发一个 UDP 报文（-u 表示 UDP），体会「发完就走、不建连」
# 需要对端有 UDP 服务监听时才有响应
nc -u example.com 53
```

```bash
# 用 curl 探测目标站点是否支持 HTTP/3（QUIC over UDP）
# 需要 curl 编译时带 HTTP/3 支持；--http3 强制尝试 h3
curl -sI --http3 https://www.cloudflare.com | head -n 1

# 看响应头里的 alt-svc，含 h3 说明服务端宣告支持 HTTP/3
curl -sI https://www.cloudflare.com | grep -i alt-svc
```

<div class="niv-why">
<code>alt-svc: h3=...</code> 这个响应头是服务器在告诉浏览器「我支持 HTTP/3，下次你可以用 QUIC 来连我」。浏览器首次通常还是走 TCP，拿到这个头之后再尝试升级到 h3。看到这个头就能确认站点开了 HTTP/3。注意不同 curl 构建是否支持 <code>--http3</code> 取决于编译选项，没有该功能属正常。
</div>

## 🧨 高频翻车点

<div class="niv-trap">
<strong>翻车 1：说「UDP 不可靠所以做不了可靠传输」。</strong>UDP 本身确实不保证可靠，但可靠性完全可以在它上面由应用层重建，QUIC 就是活生生的例子。正确说法是「UDP 不负责可靠，但不阻止上层自己实现可靠」。
</div>

<div class="niv-trap">
<strong>翻车 2：说「HTTP/3 用 UDP 是因为 UDP 更快更好」。</strong>更准确的说法是：选 UDP 是因为它「什么都不管」，给了 QUIC 在用户态自由重建可靠性、多路复用、加密、连接迁移的空间，同时绕开了 TCP 内核实现难以快速迭代、以及 TCP 层队头阻塞这两个包袱。不是 UDP 本身快，而是它不设限。
</div>

<div class="niv-trap">
<strong>翻车 3：把 QUIC 的可靠性、加密说成是「UDP 提供的」。</strong>UDP 不提供这些。序号、确认、重传、拥塞控制是 QUIC 自己实现的，加密是 QUIC 整合 TLS 1.3 实现的。把功劳记到 UDP 头上，会暴露对分层的理解不清。
</div>

## 🎤 面试话术模板

<div class="niv-a">
<strong>30 秒口述版（UDP 与 QUIC 一条线）：</strong>UDP 是传输层里「发完就走」的协议，无连接、不重传、不排序、没有拥塞和流量控制，头部只有 8 字节，所以开销小、延迟低，适合 DNS、音视频、游戏这类实时性优先的场景，代价是不可靠、要靠应用层补。HTTP/3 之所以基于 UDP，是因为 HTTP/2 的多路复用在应用层，底层 TCP 一个丢包会卡住所有流，形成 TCP 层队头阻塞，换成 QUIC over UDP 后，QUIC 在用户态以流为粒度各自管顺序和重传，一个流丢包不影响别的流。QUIC 还自己实现了可靠传输和拥塞控制、内建 TLS 1.3 加密、用连接 ID 支持网络切换时的连接迁移、对老服务器还能 0-RTT。选型上：要可靠有序用 TCP，要低延迟容忍丢包用 UDP，既要低延迟又要可靠就用 QUIC。
</div>

## ✅ 自测三问

1. UDP 为什么快？它的「不可靠」具体指哪些方面？
2. HTTP/2 已经多路复用了，为什么还会队头阻塞？HTTP/3 靠什么解决？
3. QUIC 的连接迁移是怎么做到 IP 变了连接还不断的？0-RTT 有什么风险？

<details class="niv-fold"><summary>对答案</summary>
1. 快在「省」：无连接不用握手就能发数据；不做确认、重传、排序；无拥塞控制和流量控制；头部只有 8 字节，开销小。不可靠指：可能丢包、可能乱序、可能重复，UDP 都不管，需要应用层按需处理。<br>
2. 因为 HTTP/2 的多路复用在应用层，底层是 TCP，TCP 提供按序字节流，一个报文丢失会阻塞后面所有流的数据交付，这是 TCP 层队头阻塞，应用层解决不了。HTTP/3 换成 QUIC over UDP，QUIC 在用户态以流为粒度独立管理顺序和重传，一个流丢包只影响自己，从传输层根子上解决。<br>
3. QUIC 用与 IP/端口解耦的连接 ID 标识连接，网络切换导致 IP 变化时连接 ID 不变，服务端凭连接 ID 认出是同一连接，连接得以迁移延续，不必重新握手。0-RTT 在完整握手确认前就发业务数据，存在重放攻击风险，因此一般只用于幂等请求。
</details>

## 📦 复制带走

<div class="niv-card">
<strong>UDP 一句话：</strong>无连接、不重传、不排序、无拥塞/流量控制，头部仅 8 字节，所以快但不可靠。适用 DNS、音视频、直播、游戏、QUIC——都是「实时优先」或「上层自己保可靠」的场景。
</div>

<div class="niv-card">
<strong>HTTP/3 为何基于 UDP：</strong>HTTP/2 多路复用在应用层，底层 TCP 一个丢包卡住所有流（TCP 层队头阻塞）。UDP 不强制按序，QUIC 得以在用户态以流为粒度各自管可靠性，从根上消除队头阻塞；且 QUIC 在用户态可快速迭代。
</div>

<div class="niv-card">
<strong>QUIC 四大能力：</strong>用户态重建可靠传输（序号/确认/重传/拥塞控制）+ 以流为粒度的多路复用（无队头阻塞）+ 内建 TLS 1.3 加密 + 连接迁移（连接 ID 而非四元组）+ 0-RTT（恢复连接首包带数据，注意重放风险）。可靠性是 QUIC 给的，不是 UDP 给的。
</div>

<div class="niv-card">
<strong>TCP vs UDP 选型：</strong>要完整有序、不能丢 → TCP；要低延迟、容忍丢包 → UDP；既要低延迟又要可靠、还想解决队头阻塞和切网 → QUIC / HTTP/3。
</div>

<p style="margin-top:24px"><a href="/courses/net-interview/">← 回到《秋招计网面试实战课》目录</a></p>
