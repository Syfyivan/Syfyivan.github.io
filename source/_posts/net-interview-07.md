---
title: "《秋招计网面试实战课》第07讲 · TCP 进阶追问（流量控制、拥塞控制、慢启动、快重传、半连接队列、SYN Flood）"
date: 2026-07-09 15:00:00
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
上一讲你把三次握手、四次挥手、TIME_WAIT 讲清楚了，面试官通常不会就此收手，而是顺着往深里挖：「那 TCP 怎么保证不把接收方冲垮？」「网络堵了 TCP 会怎么办？」「慢启动、拥塞避免、快重传、快恢复分别在干嘛？」「半连接队列和全连接队列有什么区别？」「SYN Flood 是怎么打的、怎么防？」这些就是把普通候选人和「答得深」的候选人区分开的追问。这一讲专门啃这些硬骨头，帮你把 TCP 从「会背」升级到「能讲透」。
</div>

## 🎯 这一讲能答对哪些面试题

- 流量控制和拥塞控制有什么区别？<span class="niv-b niv-core">高频必背</span>
- TCP 的滑动窗口是怎么做流量控制的？窗口为 0 了怎么办？
- 拥塞控制的四个阶段（慢启动、拥塞避免、快重传、快恢复）分别做什么？
- 拥塞窗口 cwnd 和接收窗口 rwnd 是什么关系？实际发送窗口取哪个？
- 超时重传和快重传有什么区别？为什么要有快恢复？<span class="niv-b niv-key">场景追问</span>
- 半连接队列和全连接队列是什么？各在握手的哪一步？
- SYN Flood 攻击原理是什么？SYN Cookie 怎么防？<span class="niv-b niv-adv">进阶加分</span>

## 📖 核心八股：先讲清楚定义

先把这一讲最容易被混为一谈的两个概念钉死：**流量控制**和**拥塞控制**是两回事。

- **流量控制（Flow Control）**：保护**接收方**。发送方发太快，接收方的接收缓冲区处理不过来会溢出丢包，所以接收方要告诉发送方「你最多还能发多少」。这是**端到端**的事，只跟通信双方有关。
- **拥塞控制（Congestion Control）**：保护**整个网络**。就算接收方处理得过来，中间的路由器、链路也可能被塞满，导致大面积丢包和延迟。拥塞控制让发送方感知网络的拥挤程度，主动收敛发送速率。这是**面向网络**的事。

一句话背下来：**流量控制怕撑坏对方，拥塞控制怕堵坏网络。**

### 流量控制：靠滑动窗口和 rwnd

TCP 头部里有一个 16 位的**窗口字段（Window Size）**，接收方用它告诉发送方：「我的接收缓冲区现在还能接收这么多字节」，这个值叫**接收窗口 rwnd**。发送方保证「已发送但未确认的数据量」不超过 rwnd，就不会把接收方撑爆。

<div class="niv-why">
为什么叫「滑动」窗口？把发送方要发的字节流想象成一条尺子，窗口就是尺子上一段可以「现在就发」的区间。接收方每确认（ACK）一批数据，窗口左边界就右移，新的字节进入可发送区间，窗口整体像往右滑一样，所以叫滑动窗口。
</div>

```text
发送方视角的字节流（滑动窗口）
已确认    | 已发送未确认 |  可发送未发送  | 不能发
========  [============    ================]  --------
          ^窗口左边界                       ^窗口右边界
                     收到 ACK 后整个窗口向右滑动
```

<div class="niv-a">
<strong>标准回答模板（流量控制）：</strong>TCP 的流量控制靠滑动窗口实现。接收方在 ACK 报文里通过窗口字段（rwnd）告诉发送方自己接收缓冲区的剩余空间，发送方保证在途未确认的数据不超过这个窗口，从而不会把接收方缓冲区冲垮。这是端到端的控制。
</div>

**窗口变成 0 怎么办？** 如果接收方缓冲区满了，会通告窗口为 0，发送方就停止发送数据。但发送方不能干等着——万一后来接收方腾出空间、发的「窗口更新」ACK 又丢了，双方就死锁了。所以 TCP 用**坚持定时器（Persist Timer）**：发送方定期发一个 1 字节的**窗口探测报文（Zero Window Probe）**去问「你现在窗口多大了」，逼接收方重新通告窗口，打破僵局。

<div class="niv-why">
零窗口探测是流量控制里最容易被追问的细节。核心是「防止窗口更新 ACK 丢失导致的死锁」。记住这个点，追问「窗口 0 了怎么办」时你能多说一层。
</div>

### 拥塞控制：四个阶段，围绕 cwnd 做文章

拥塞控制的核心是发送方自己维护一个**拥塞窗口 cwnd**（congestion window）。注意：cwnd 是发送方本地的一个状态变量，不在报文里传输，接收方看不到它，它是发送方对「网络能吃多少」的估计。

**真正的发送窗口 = min(cwnd, rwnd)**。也就是同时受「网络能不能扛」和「对方能不能收」两者的较小值约束。这一句是把流量控制和拥塞控制串起来的关键。

经典的拥塞控制算法（以 Reno / NewReno 这一脉为例）有四个阶段：

```text
cwnd
 |                              /\        超时→回到慢启动
 |            拥塞避免(线性+1)  /  \
 |          ________________ /    \___  快恢复(收到3个重复ACK)
 |         /ssthresh 门限                  cwnd 减半后线性增长
 |        /
 |       /  慢启动(指数翻倍)
 |      /
 |_____/______________________________________________ 时间
```

<div class="niv-a">
<strong>标准回答模板（拥塞控制四阶段）：</strong>
<br>1) <strong>慢启动</strong>：连接刚建立时 cwnd 从一个较小值开始，每收到一个 ACK 就增大，效果上每个 RTT 让 cwnd 大致翻倍，指数增长，快速探测网络容量。
<br>2) <strong>拥塞避免</strong>：当 cwnd 达到慢启动门限 ssthresh 后，改为每个 RTT 大约只加 1 个 MSS，线性增长，谨慎地继续探测。
<br>3) <strong>快重传</strong>：如果发送方连续收到 3 个重复 ACK（说明某个报文丢了但后面的到了），不必等超时定时器，立即重传那个丢失的报文。
<br>4) <strong>快恢复</strong>：配合快重传，此时认为网络只是轻微丢包而非彻底拥塞，于是把 ssthresh 设为当前 cwnd 的一半，cwnd 也降到这个水平，然后进入拥塞避免线性增长，而不是像超时那样把 cwnd 打回起点。
</div>

<div class="niv-why">
为什么「超时」和「3 个重复 ACK」处理方式不一样？超时通常意味着网络严重拥塞（连 ACK 都回不来），所以反应最激进：ssthresh 减半、cwnd 直接回到初始值、重新慢启动。而 3 个重复 ACK 说明后续报文还能到达接收方，网络只是丢了个别包，情况没那么糟，所以用快恢复温和处理，不把速率打回零。区分这两种「丢包信号」是拿高分的关键。
</div>

<div class="niv-why">
注意别把具体数值背死。慢启动初始 cwnd、ssthresh 初值在不同操作系统、不同内核版本里不一样，现代 Linux 默认拥塞控制算法也早已不是 Reno，而是 CUBIC（还有 BBR 这类基于带宽和时延建模的算法）。面试讲清楚「四阶段的思想」即可，不确定的初值就说「取决于实现和内核版本」，别硬报数字。
</div>

### 半连接队列 vs 全连接队列

这俩队列都发生在**服务端**处理三次握手的过程中，是 SYN Flood 那道题的前置知识。

```text
三次握手与两个队列
客户端                                服务端
  |  --- SYN --------------------->  |  收到 SYN，创建半连接，放入
  |                                  |  【半连接队列 SYN queue】
  |  <-- SYN + ACK ---------------   |  连接处于 SYN_RCVD 状态
  |  --- ACK --------------------->  |  收到 ACK，握手完成，连接
  |                                  |  从半连接队列移到
  |                                  |  【全连接队列 accept queue】
  |                                  |  等待应用调用 accept() 取走
```

- **半连接队列（SYN queue）**：服务端收到 SYN、回了 SYN+ACK、但还没收到客户端第三次 ACK 的连接，暂存在这里，状态是 `SYN_RCVD`。
- **全连接队列（accept queue）**：三次握手已经完成、但应用程序还没来得及 `accept()` 取走的连接，暂存在这里，状态已是 `ESTABLISHED`。

<div class="niv-why">
为什么要拆成两个队列？因为「握手完成」和「应用取走连接」是两个速度不同的环节。内核负责完成握手，应用负责 accept。全连接队列就是内核和应用之间的缓冲：应用忙不过来时，握手好的连接先在这排队。如果全连接队列满了，新完成握手的连接可能被丢弃（具体行为由内核参数控制），表现就是客户端以为连上了、服务端却迟迟不响应。
</div>

### SYN Flood 与 SYN Cookie

<span class="niv-b niv-adv">进阶加分</span> SYN Flood 是一种经典的 DoS 攻击，正是拿半连接队列开刀。

攻击者伪造大量源 IP 疯狂发 SYN，服务端每收到一个就回 SYN+ACK 并占用一个半连接队列名额，然后傻等第三次 ACK。但这些源 IP 是伪造的，第三次 ACK 永远不会来。很快半连接队列被占满，正常用户的 SYN 再也进不来，服务就被拒绝了。

**SYN Cookie** 是应对手段：当半连接队列快满时，服务端**不再在队列里为半连接分配存储**，而是把必要的连接信息（如序列号相关状态）用一个算法编码进 SYN+ACK 的**初始序列号**里发出去。这样即使不占队列名额也能记住状态。等客户端回第三次 ACK（其中的确认号 = 服务端 ISN + 1）时，服务端用同样的算法校验这个值合不合法，合法才真正建立连接。

<div class="niv-a">
<strong>标准回答模板（SYN Cookie）：</strong>SYN Cookie 的核心思路是「不预先为半连接占用内存」。服务端把连接状态编码进 SYN+ACK 的初始序列号里，靠客户端第三次 ACK 带回来的确认号做校验来还原状态。因为伪造源 IP 的攻击者收不到 SYN+ACK、也就回不出正确的 ACK，攻击流量自然被挡在门外，而合法用户不受影响。代价是它省略了部分 TCP 选项协商，属于队列吃紧时的降级保护手段。
</div>

## 🔍 场景追问：面试官会顺着问

<div class="niv-scene"><strong>追问：</strong>流量控制和拥塞控制到底有什么区别？能不能一句话说清？</div>

一句话：**流量控制保护接收方，拥塞控制保护网络。** 展开说，流量控制是端到端的，靠接收方通告的 rwnd 限制发送速率，怕的是把对方缓冲区撑爆；拥塞控制是面向整个网络的，靠发送方自己维护的 cwnd 感知网络拥挤，怕的是把中间链路堵死。两者同时生效，实际发送窗口取 `min(cwnd, rwnd)`。答的时候一定要把「保护对象不同 + 两者共同约束发送窗口」这两层都点到，才算答透。

<div class="niv-scene"><strong>追问：</strong>超时重传和快重传的区别是什么？为什么有了超时重传还要快重传？</div>

超时重传是「兜底」：发送方给每个报文段设了重传定时器，超时还没收到 ACK 就重传。问题是超时时间（RTO）通常比较保守，等它超时会浪费不少时间，吞吐直接掉下来。快重传是「加速」：如果接收方收到失序报文，会对最后一个按序收到的字节反复发重复 ACK；发送方一旦连续收到 3 个重复 ACK，就判断中间某个包丢了，不等定时器超时立即重传。所以快重传能在个别丢包时更快恢复，而且它触发的是快恢复而不是慢启动，速率跌得没那么狠。

<div class="niv-scene"><strong>追问：</strong>服务端大量连接卡在建立阶段、客户端超时，可能是什么原因？</div>

从这一讲的知识切入排查：一是**全连接队列满了**——应用 `accept()` 太慢或线程被阻塞，握手完成的连接堆在 accept 队列里被丢弃，客户端看似连上实则没响应；二是**半连接队列吃紧**，可能是正常高并发，也可能是遭到 SYN Flood；三是网络层丢包导致握手报文反复重传。定位时可以看队列是否溢出的计数、看连接状态分布（大量 `SYN_RCVD` 指向半连接问题）。回答要体现「先分清是半连接还是全连接的问题」这个分层思路。

<div class="niv-scene"><strong>追问：</strong>接收方通告窗口为 0 之后，发送方是不是就永远发不了了？</div>

不是。发送方会启动**坚持定时器**，周期性发送零窗口探测报文（通常携带 1 字节数据）去询问接收方当前窗口。这样即使之前接收方发的「窗口已恢复」的 ACK 丢了，发送方也能通过探测重新拿到窗口值，避免双方永久死锁。这个点能体现你对流量控制细节的掌握。

## 🛠 动手验证（可选做）

用 `ss` 看半连接和全连接队列，以及连接状态分布，把八股和真实系统对上：

```bash
# 查看处于监听状态的套接字，Recv-Q / Send-Q 对 LISTEN 套接字含义特殊：
# Recv-Q = 当前全连接队列(accept queue)已占用数
# Send-Q = 全连接队列(accept queue)的最大长度
ss -ltn

# 查看各类 TCP 连接状态的数量分布，SYN-RECV 多可能是半连接积压
ss -tan | awk 'NR>1{print $1}' | sort | uniq -c

# 观察某端口的连接状态（把 80 换成你的端口）
ss -tan '( dport = :80 or sport = :80 )'
```

```bash
# 用 tcpdump 抓握手包，直观看到 SYN / SYN-ACK / ACK 和窗口大小
# (需要相应权限，win 字段就是通告窗口)
sudo tcpdump -i any -nn 'tcp[tcpflags] & (tcp-syn) != 0' -c 10
```

<div class="niv-why">
不同系统 <code>ss</code>/<code>netstat</code> 对 Recv-Q、Send-Q 在 LISTEN 与非 LISTEN 状态下的语义不同，这点本身就是加分项。看到 LISTEN 行的 Recv-Q 持续接近 Send-Q，往往就是全连接队列被打满的信号。
</div>

## 🧨 高频翻车点

<div class="niv-trap">
<strong>翻车 1：把流量控制和拥塞控制混为一谈。</strong>很多人张口就是「TCP 用滑动窗口做拥塞控制」，错。滑动窗口 + rwnd 是流量控制（保护接收方）；拥塞控制靠的是 cwnd 和慢启动那一套（保护网络）。两者机制、保护对象都不同，混着说会被当场纠正。
</div>

<div class="niv-trap">
<strong>翻车 2：把慢启动的「慢」理解成「增长慢」。</strong>慢启动其实是<strong>指数增长</strong>（每个 RTT 大致翻倍），一点都不慢。它的「慢」指的是「起点低、从小窗口开始试探」，相对拥塞避免的线性增长反而更快。别把名字当字面意思讲。
</div>

<div class="niv-trap">
<strong>翻车 3：硬背拥塞控制的初始参数和算法名。</strong>说「慢启动初始 cwnd 就是 1」「Linux 用 Reno」这类话很危险，初值随内核版本和实现而变，现代 Linux 默认是 CUBIC。不确定的数字就讲思想、加一句「取决于实现」，别报死数字给面试官抓漏洞。
</div>

## 🎤 面试话术模板

<div class="niv-a">
<strong>30 秒口述版（拥塞控制 + 与流量控制的关系）：</strong>TCP 里有两套「刹车」。流量控制保护接收方，靠接收方通告的 rwnd 限制发送方在途数据量；拥塞控制保护整个网络，发送方自己维护一个拥塞窗口 cwnd，实际发送窗口取 rwnd 和 cwnd 的较小值。拥塞控制分四个阶段：慢启动阶段 cwnd 指数增长快速探测容量；达到门限 ssthresh 后进入拥塞避免，改成线性增长谨慎试探；如果连续收到 3 个重复 ACK 就快重传丢失的包，并进入快恢复，把 cwnd 减半后继续线性增长而不是打回起点；只有真的超时才认为网络严重拥塞，重新回到慢启动。具体的初始参数和默认算法取决于操作系统和内核版本，现在 Linux 默认是 CUBIC。
</div>

## ✅ 自测三问

1. 实际发送窗口由哪两个量决定？取它们的什么值？
2. 「超时」和「收到 3 个重复 ACK」这两种丢包信号，TCP 分别怎么反应？为什么不一样？
3. SYN Flood 攻击打的是哪个队列？SYN Cookie 靠什么原理在不占队列的情况下还能建立连接？

<details class="niv-fold"><summary>对答案</summary>
1. 由拥塞窗口 cwnd（拥塞控制，保护网络）和接收窗口 rwnd（流量控制，保护接收方）共同决定，实际发送窗口取两者的最小值 min(cwnd, rwnd)。<br>
2. 超时意味着网络可能严重拥塞，反应最激进：ssthresh 减半、cwnd 回到初始值、重新慢启动；连续 3 个重复 ACK 说明后续报文还能到达、只是个别丢包，走快重传立即补发，并用快恢复把 cwnd 减半后进入拥塞避免线性增长，不打回起点。因为两种信号反映的网络严重程度不同。<br>
3. 打的是服务端的半连接队列（SYN queue），用伪造源 IP 的 SYN 占满它。SYN Cookie 不为半连接预分配内存，而是把连接状态编码进 SYN+ACK 的初始序列号，靠客户端第三次 ACK 带回的确认号做校验来还原状态；伪造 IP 的攻击者收不到 SYN+ACK 也就回不出合法 ACK，攻击被挡住而合法用户不受影响。
</details>

## 📦 复制带走

<div class="niv-card">
<strong>一句话记牢两种控制：</strong>流量控制怕撑坏「对方」（靠 rwnd，端到端）；拥塞控制怕堵坏「网络」（靠 cwnd，面向全网）。实际发送窗口 = min(cwnd, rwnd)。
</div>

<div class="niv-card">
<strong>拥塞控制四阶段：</strong>慢启动（指数涨，起点低不是涨得慢）→ 拥塞避免（过 ssthresh 后线性涨）→ 快重传（3 个重复 ACK 立即补发）→ 快恢复（cwnd 减半后线性涨，避免回慢启动）。超时才回慢启动。初值和默认算法取决于实现（现代 Linux 默认 CUBIC）。
</div>

<div class="niv-card">
<strong>两个队列：</strong>半连接队列（SYN queue，SYN_RCVD 态，握手中）；全连接队列（accept queue，ESTABLISHED 态，等 accept 取走）。全连接满了会丢新连接，表现为客户端连上却无响应。
</div>

<div class="niv-card">
<strong>SYN Flood / SYN Cookie：</strong>攻击用伪造 IP 的 SYN 占满半连接队列。SYN Cookie 不预占内存，把状态编码进初始序列号，靠第三次 ACK 的确认号校验还原，挡住回不出 ACK 的伪造流量。
</div>

<p style="margin-top:24px"><a href="/courses/net-interview/">← 回到《秋招计网面试实战课》目录</a></p>
