---
title: "《秋招计网面试实战课》第06讲 · TCP 面试核心（可靠传输、三次握手、四次挥手、TIME_WAIT、CLOSE_WAIT、粘包、滑动窗口）"
date: 2026-07-09 14:00:00
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
TCP 是计网面试的绝对主角，没有之一。面试官几乎一定会问：「三次握手为什么是三次，两次行不行、四次呢」「四次挥手为什么比握手多一次」「TIME_WAIT 是什么、为什么等 2MSL」「服务器上一堆 CLOSE_WAIT 是谁的锅」「什么是粘包，怎么解决」。这些题背下来只是及格线，真正拉开差距的是你能不能讲清每个设计「为什么这么做」，以及能不能把 TIME_WAIT / CLOSE_WAIT 这类状态和线上真实故障对应起来。这一讲就带你把 TCP 的核心机制和它们背后的原因串成一条线。
</div>

## 🎯 这一讲能答对哪些面试题

- TCP 凭什么叫「可靠传输」，靠哪些机制保证？<span class="niv-b niv-core">高频必背</span>
- 三次握手过程说一下，为什么是三次不是两次？<span class="niv-b niv-core">高频必背</span>
- 四次挥手过程，为什么挥手要四次而握手只要三次？<span class="niv-b niv-core">高频必背</span>
- TIME_WAIT 是什么，为什么要等 2MSL？大量 TIME_WAIT 说明什么、怎么缓解？<span class="niv-b niv-key">场景追问</span>
- 服务端出现大量 CLOSE_WAIT，是谁的问题？<span class="niv-b niv-key">场景追问</span>
- 什么是粘包 / 拆包，本质是什么，怎么解决？
- 滑动窗口是干嘛的？<span class="niv-b niv-adv">进阶加分</span>

## 📖 核心八股：先讲清楚定义

先落地几个术语：

- TCP：面向连接、可靠、面向字节流的传输层协议。通俗说：传数据前要先建连接（握手），传的过程保证不丢不乱不重复，数据在它眼里是一条连续的字节流而不是一个个独立消息。
- 序列号（Seq）：给每个字节编号，用来排序、去重、检测丢失。
- 确认号（Ack）：告诉对方「我已经收到了到某个字节为止的数据，接下来该发这个编号」。
- ISN（初始序列号）：连接建立时双方各自随机生成的起始序号。

### TCP 靠什么保证「可靠传输」

<div class="niv-a">
<strong>标准回答模板：</strong>TCP 的可靠性由一整套机制共同保证，不是单靠某一个：<br>
1. 序列号 + 确认应答（ACK）：每段数据编号，收到就回 ACK，没收到 ACK 就重传；<br>
2. 超时重传 + 快速重传：发出去一段时间没等到 ACK 就重发，或收到 3 个重复 ACK 立即重发；<br>
3. 校验和：检测数据在途中是否损坏，坏了丢弃并重传；<br>
4. 数据排序与去重：靠序列号把乱序到达的段重新排好，重复的丢掉；<br>
5. 流量控制（滑动窗口）：防止发太快把接收方缓冲区撑爆；<br>
6. 拥塞控制：防止发太快把网络压垮（慢启动/拥塞避免等，下一讲展开）。
</div>

### 三次握手

```text
客户端                                     服务器
 CLOSED                                    LISTEN
   │  ── SYN, seq=x ──────────────────────>  │   进入 SYN_RCVD
 SYN_SENT                                   │
   │  <──────────── SYN+ACK, seq=y, ack=x+1 │
   │  ── ACK, ack=y+1 ───────────────────>   │
 ESTABLISHED                              ESTABLISHED
```

<div class="niv-why">
<strong>为什么必须三次，两次不行？</strong>核心目的是让双方都确认「我发的对方能收到、对方发的我能收到」，即双向的收发能力都被验证。<br>
- 第 1 次：客户端发 SYN，服务器收到 → 服务器确认「客户端的发送能力 + 自己的接收能力」正常。<br>
- 第 2 次：服务器回 SYN+ACK，客户端收到 → 客户端确认「双向都通」。<br>
- 第 3 次：客户端再回 ACK，服务器收到 → 服务器才确认「自己的发送能力 + 客户端的接收能力」正常。<br>
如果只有两次，服务器无法确认客户端到底收到没有自己的 SYN+ACK，双向确认不完整。<br>
另一个经典理由：三次握手能防止「已失效的历史连接请求」误建连接。一个早就超时、在网络里滞留的旧 SYN 如果晚到，两次握手会让服务器直接建连并占用资源；三次握手下客户端能通过第三次发现这不是自己想要的连接而拒绝，避免资源浪费。
</div>

顺带一个高频小追问：ISN 为什么要随机？防止旧连接的报文串到新连接里被误认（序号可预测还会带来安全风险，易被伪造报文注入）。

### 四次挥手

```text
主动关闭方(如客户端)                        被动关闭方(如服务器)
 ESTABLISHED                               ESTABLISHED
   │  ── FIN, seq=u ──────────────────────>  │
 FIN_WAIT_1                                CLOSE_WAIT   (收到FIN, 回ACK)
   │  <──────────────────────── ACK, ack=u+1 │
 FIN_WAIT_2                                   │  (被动方可能还有数据要发, 发完才关)
   │  <──────────────── FIN, seq=w ────────  │
   │                                       LAST_ACK
   │  ── ACK, ack=w+1 ──────────────────>    │
 TIME_WAIT                                 CLOSED
   │  (等待 2MSL)
 CLOSED
```

<div class="niv-why">
<strong>为什么挥手要四次，握手只要三次？</strong>因为握手时服务器可以把「确认收到 SYN(ACK)」和「自己也要建连(SYN)」合并成一个包发出去，所以三次。而挥手时，一方发 FIN 表示「我没数据要发了」，另一方先回 ACK 确认收到，但它自己可能还有数据没发完，不能马上关，得等把数据发完再单独发一个 FIN。于是 ACK 和 FIN 分成了两个包，一共四次。本质区别：关闭是「半关闭」的，两个方向要各自独立关闭。
</div>

### TIME_WAIT 与 2MSL

MSL（Maximum Segment Lifetime）指一个报文段在网络中最长的存活时间。主动关闭方在发出最后一个 ACK 后进入 TIME_WAIT，等待 2MSL 才真正关闭。

<div class="niv-why">
<strong>为什么等 2MSL（不是随便一个值）？</strong>两个原因：<br>
1. <strong>保证最后那个 ACK 能到达对方。</strong>如果这个 ACK 丢了，被动关闭方会重发 FIN；主动方停留在 TIME_WAIT 就能收到重发的 FIN 并再回一个 ACK。一来一回最多两个 MSL，所以等 2MSL。<br>
2. <strong>让本次连接的旧报文在网络中自然消亡</strong>，避免它们串到后续用相同四元组（源IP/源端口/目的IP/目的端口）建立的新连接里造成混乱。<br>
<strong>诚实边界：MSL 的具体秒数取决于操作系统实现</strong>（协议里给的是一个建议值，各系统默认不同，有的默认取几十秒级），所以 2MSL 的实际时长因系统而异，面试时别报一个绝对秒数当标准答案，说「取决于实现」更稳。
</div>

## 🔍 场景追问：面试官会顺着问

<div class="niv-scene"><strong>追问：</strong>线上服务器出现大量 TIME_WAIT，说明什么？有什么影响？怎么缓解？</div>

要点：

- TIME_WAIT 出现在「主动关闭连接」的那一方。服务器上大量 TIME_WAIT，通常说明是服务器在主动断开连接，最常见于短连接场景（比如没开 Keep-Alive、每次请求都新建再关闭连接）。
- 影响：TIME_WAIT 会占用本地端口和一部分内核资源，极端情况下（作为客户端角色高频对同一目标发起短连接）可能把本地端口耗尽，导致新连接建不出来。
- 缓解思路（按优先级）：
  1. 从根上减少短连接，改用长连接 / 连接池（Keep-Alive、连接复用），这是最治本的；
  2. 内核参数层面可以开启 TIME_WAIT 复用类选项（如 `tcp_tw_reuse`，用于主动连接的复用场景），但要理解适用条件，不能无脑开；
  3. 不建议粗暴地大幅调小或关闭 TIME_WAIT，那会牺牲上面说的两条安全保证。

一句话总结：大量 TIME_WAIT 一般不是「病」，而是短连接模式的正常产物，优先改连接复用。

<div class="niv-scene"><strong>追问：</strong>服务端有大量 CLOSE_WAIT，是谁的锅？怎么排查？</div>

这是最能区分「背过」和「懂了」的一道题。

- CLOSE_WAIT 出现在「被动关闭」的一方：对端发来了 FIN，本端内核自动回了 ACK 进入 CLOSE_WAIT，但本端应用程序迟迟没有调用 `close()` 去发出自己的 FIN。
- 所以大量 CLOSE_WAIT 堆积，锅在本端应用程序：说明代码没有正确关闭连接。常见原因：连接用完忘了 close、异常路径下没走到 close、连接池管理有 bug、或者线程卡住导致 close 没被执行。
- 排查方向：先用 `ss` / `netstat` 确认是本机哪个进程持有这些连接，再回到代码里检查连接的关闭逻辑是否在所有分支（含异常）都被执行。

<div class="niv-why">
对比记忆：<strong>TIME_WAIT 是主动关闭方的正常状态</strong>（会自己消失，别慌）；<strong>CLOSE_WAIT 堆积是被动关闭方的程序 bug</strong>（不会自己消失，因为它在等你的代码 close）。看到 CLOSE_WAIT 一直涨，先查自己的代码，不是网络问题。
</div>

<div class="niv-scene"><strong>追问：</strong>什么是粘包？为什么会粘包？怎么解决？</div>

- 现象：接收方一次读取，读到了多个「消息」粘在一起，或者一个消息被拆成几次才读全。
- 本质：TCP 是面向字节流的，它根本没有「消息边界」这个概念。你 send 两次，对方可能一次 recv 就全拿到，也可能分多次拿到。发送侧还有 Nagle 算法会攒小包一起发。所以「粘包」严格说不是 TCP 的 bug，而是应用层没定义消息边界导致的。
- 解决（都在应用层做）：
  1. 固定长度：每条消息定长，不够补齐；
  2. 分隔符：用特殊字符标记消息结尾（如 HTTP 的 `\r\n`）；
  3. 长度前缀：消息头里先写明这条消息有多长，接收方按长度读（最常用，如很多 RPC 协议）。
- 补充：UDP 是面向数据报的，有明确边界，所以不存在粘包问题。这个对比常被追问。

## 🛠 动手验证（可选做）

用 `ss` / `netstat` 观察真实的连接状态，把八股和现象对上：

```bash
# 按 TCP 状态统计连接数量，一眼看出 TIME_WAIT / CLOSE_WAIT 多不多 (Linux)
ss -ant | awk 'NR>1{print $1}' | sort | uniq -c | sort -rn
```

```bash
# 只看 CLOSE_WAIT 的连接，并找出是哪个进程持有 (需要权限, -p 显示进程)
ss -antp state close-wait
# 传统写法: netstat -antp | grep CLOSE_WAIT
```

```bash
# 抓握手/挥手报文，肉眼看 SYN / FIN 标志位 (需要 tcpdump)
sudo tcpdump -i any 'tcp port 443 and (tcp[tcpflags] & (tcp-syn|tcp-fin) != 0)' -nn
```

## 🧨 高频翻车点

<div class="niv-trap">
<strong>翻车 1：把 TIME_WAIT 和 CLOSE_WAIT 搞混，或都当成故障。</strong>正确：TIME_WAIT 在主动关闭方，是正常状态、会自动消失；CLOSE_WAIT 在被动关闭方，堆积说明本端应用没 close，是代码 bug。方向和归属别说反。
</div>

<div class="niv-trap">
<strong>翻车 2：说「TIME_WAIT 等 2MSL 是 60 秒 / 120 秒」当成标准答案。</strong>MSL 的具体值取决于操作系统实现，不同系统默认不同。正确说法是解释清楚为什么是「2 个 MSL」（等重传的 FIN + 让旧报文消亡），并注明具体秒数因实现而异。
</div>

<div class="niv-trap">
<strong>翻车 3：把粘包说成「TCP 的缺陷 / bug」。</strong>正确：TCP 面向字节流、本就没有消息边界，粘包是应用层没定义边界的结果。解决办法（定长/分隔符/长度前缀）都在应用层做，不是去改 TCP。
</div>

## 🎤 面试话术模板

<div class="niv-a">
<strong>30 秒口述版：</strong>TCP 是面向连接、可靠、面向字节流的协议。可靠性靠序列号加确认应答、超时与快速重传、校验和、排序去重、以及流量控制和拥塞控制一整套机制。建连接要三次握手，目的是双向确认收发能力、并防止失效的旧连接请求误建连；关闭要四次挥手，因为关闭是双向独立的半关闭，被动方回 ACK 后可能还有数据要发，所以 ACK 和 FIN 分开发。主动关闭方最后会进入 TIME_WAIT 等待 2MSL，一是保证最后的 ACK 能到、对方重发 FIN 时还能应答，二是让旧报文自然消亡，具体秒数取决于系统实现。线上大量 TIME_WAIT 一般是短连接太多，改连接复用即可；大量 CLOSE_WAIT 则是被动方应用没调 close，属于代码问题。粘包是因为 TCP 面向字节流没有消息边界，用定长、分隔符或长度前缀在应用层解决。
</div>

## ✅ 自测三问

1. 三次握手为什么不能是两次？三次分别确认了什么？
2. TIME_WAIT 为什么要等 2MSL？大量 TIME_WAIT 和大量 CLOSE_WAIT 分别是谁的问题？
3. 粘包的本质是什么？为什么 UDP 不粘包？

<details class="niv-fold"><summary>对答案</summary>

1. 两次握手服务器无法确认客户端是否收到了自己的 SYN+ACK，双向收发能力确认不完整；三次也能防止失效的历史 SYN 误建连接。三次分别让：服务器确认客户端发送/自己接收正常、客户端确认双向都通、服务器确认自己发送/客户端接收正常。
2. 等 2MSL 是为了：保证最后一个 ACK 能到达对方（若丢了对方会重发 FIN，本端还在 TIME_WAIT 就能再应答），以及让本连接的旧报文在网络里自然消亡不干扰新连接；具体秒数取决于实现。大量 TIME_WAIT 出现在主动关闭方，通常是短连接过多，属正常现象，改连接复用缓解；大量 CLOSE_WAIT 出现在被动关闭方，是本端应用没调用 close，属于代码 bug。
3. 本质是 TCP 面向字节流、没有消息边界，加上发送方可能合并小包，导致接收方读到的字节和「消息」不一一对应。UDP 面向数据报，每个数据报有明确边界，所以不存在粘包。

</details>

## 📦 复制带走

<div class="niv-card">
<strong>可靠传输六件套：</strong>序列号+ACK、超时/快速重传、校验和、排序去重、流量控制（滑动窗口）、拥塞控制。可靠不是单靠一个机制。
</div>

<div class="niv-card">
<strong>握手三次 vs 挥手四次：</strong>握手能把 ACK 和 SYN 合成一个包；挥手时被动方回完 ACK 可能还要发数据，FIN 要单独发，所以多一次。关闭是双向独立的半关闭。
</div>

<div class="niv-card">
<strong>状态别搞混：</strong>TIME_WAIT = 主动关闭方，正常、会自动消失、等 2MSL（秒数取决于实现）。CLOSE_WAIT = 被动关闭方堆积，说明本端应用没 close，查代码。
</div>

<div class="niv-card">
<strong>粘包：</strong>根因是 TCP 面向字节流无消息边界。应用层用定长 / 分隔符 / 长度前缀解决；长度前缀最常用。UDP 有边界，不粘包。
</div>

<p style="margin-top:24px"><a href="/courses/net-interview/">← 回到《秋招计网面试实战课》目录</a></p>
