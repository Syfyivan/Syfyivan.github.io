---
title: "《秋招计网面试实战课》第09讲 · DNS、IP、MAC、ARP（域名→IP、DNS 缓存、DNS 用 TCP 还是 UDP、IP vs MAC、ARP、ping 原理）"
date: 2026-07-09 17:00:00
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
从「输入 URL 到看到页面」的第一步，就是 DNS。面试官特别爱在这里挖坑：「域名是怎么变成 IP 的」「DNS 用 TCP 还是 UDP，为什么」「递归和迭代有啥区别」「你都有 IP 了为什么还要 MAC 地址」「ARP 是干嘛的」「ping 走的是什么协议」。再往下追一步就是那道经典场景题：「我把域名解析改到新服务器了，为什么有些用户还在访问旧 IP？」这一讲就把 DNS、IP、MAC、ARP 这套「找到对方在哪」的机制讲透，让你被追问也不慌。
</div>

## 🎯 这一讲能答对哪些面试题

- 在浏览器输入域名后，它是怎么变成 IP 地址的？<span class="niv-b niv-core">高频必背</span>
- 递归查询和迭代查询有什么区别？根、顶级、权威 DNS 各是什么？<span class="niv-b niv-core">高频必背</span>
- DNS 用的是 TCP 还是 UDP？为什么？<span class="niv-b niv-core">高频必背</span>
- 已经有 IP 地址了，为什么还需要 MAC 地址？两个都要干嘛？<span class="niv-b niv-key">场景追问</span>
- ARP 是做什么的，什么时候会用到？<span class="niv-b niv-adv">进阶加分</span>
- ping 用的是什么协议，它能说明什么、不能说明什么？
- 我改了域名解析，为什么有些用户还在访问旧服务器？<span class="niv-b niv-key">场景追问</span>

## 📖 核心八股：先讲清楚定义

先把几个术语用大白话落地：

- DNS（域名系统）：一套把「域名」翻译成「IP 地址」的分布式查询系统。通俗说，就是互联网的「通讯录」，你只记得名字（www.baidu.com），它帮你查出电话号码（IP）。
- IP 地址：网络层的逻辑地址，用来在整个互联网范围内标识「一台主机在哪个网络、哪个位置」，可以跨网段路由。
- MAC 地址：数据链路层的物理地址，烧录在网卡上，用来在同一个局域网内标识「具体是哪块网卡」。
- ARP（地址解析协议）：在同一网段内，根据 IP 地址查出对应 MAC 地址的协议。
- TTL：这里指 DNS 记录的「缓存有效期」（单位秒），告诉各级缓存这条记录能存多久。注意别和 IP 报文里那个「跳数 TTL」混淆，是两回事。

### 域名是怎么一步步变成 IP 的

先看整个查询链路，从上到下问一圈：

```text
浏览器缓存
   ↓ 没命中
操作系统缓存 / hosts 文件
   ↓ 没命中
本地 DNS 服务器（递归解析器，一般是运营商或 8.8.8.8 这类）
   ↓ 由它代替你去问
根域名服务器(.)        → 返回 .com 顶级域服务器的地址
顶级域服务器(.com)     → 返回 baidu.com 权威服务器的地址
权威域名服务器(baidu.com) → 返回 www.baidu.com 的最终 IP
   ↓
本地 DNS 把结果缓存并返回给你
```

<div class="niv-a">
<strong>标准回答模板：</strong>浏览器先查自己的缓存，没有就查操作系统缓存和 hosts，再没有就把请求发给「本地 DNS 服务器」（递归解析器）。本地 DNS 如果也没缓存，就代替我们去做迭代查询：先问根服务器，根告诉它去问 .com 顶级域服务器；再问顶级域，顶级域告诉它去问 baidu.com 的权威服务器；最后问权威服务器拿到 www.baidu.com 的真实 IP。本地 DNS 拿到结果后缓存起来，再返回给浏览器。这样一次查询后，同一域名短时间内就不用再走全程了。
</div>

### 递归查询 vs 迭代查询

这是最容易被追问、也最容易答混的点。

- 递归查询：你把活儿全甩给别人，「你必须帮我把最终答案查出来，别让我自己一步步问」。我们的电脑对本地 DNS 就是递归：我只发一次请求，坐等最终 IP。
- 迭代查询：对方不直接给你答案，而是给你「下一步该去问谁」的线索，你自己继续问。本地 DNS 对根、顶级、权威服务器通常就是迭代：根说「去问 .com」，它再自己去问 .com。

<div class="niv-why">
为什么要这么分工？因为根服务器全球就那么十三组逻辑地址（背后是大量镜像），如果全世界的电脑都让根「递归」帮忙查到底，根早就被压垮了。让根只做「指路」（迭代），把真正查到底的累活交给分散在各地的本地 DNS，整个系统才扛得住海量请求。
</div>

### 根、顶级、权威分别是什么

- 根域名服务器（.）：DNS 树的最顶层，它不知道具体 IP，只知道各个顶级域（.com/.cn/.org…）的服务器在哪。
- 顶级域服务器（TLD，如 .com）：管一类后缀，它知道 baidu.com 这种二级域的权威服务器在哪。
- 权威域名服务器：某个域名真正「说了算」的地方，你在域名商那里配置的 A 记录、CNAME 就存在这里，它返回最终 IP。

### DNS 缓存与 TTL

DNS 不可能每次都走全程，否则又慢又给根服务器添乱。所以每一层都有缓存：浏览器缓存、操作系统缓存、本地 DNS 服务器缓存。每条记录都带一个 TTL，比如 TTL=300 表示这条记录缓存 300 秒，到期才会重新去查。

<div class="niv-why">
TTL 是把双刃剑：设得大，缓存命中率高、解析快、根/权威压力小，但你改了解析后要等很久才全网生效；设得小，切换 IP 时能快速生效，但查询更频繁。所以做迁移前，通常会提前把 TTL 调小。
</div>

### DNS 用 TCP 还是 UDP

<div class="niv-a">
<strong>标准回答模板：</strong>DNS 以 UDP 为主，端口 53。因为绝大多数查询请求和响应都很小，UDP 无需建连、开销小、速度快，一问一答就够了，丢了大不了重问。但有两种情况会用 TCP：一是响应数据太大、超过 UDP 单包能装下的限度（传统上以 512 字节为界，超过会置「截断」标志，客户端改用 TCP 重发）；二是主从 DNS 之间做区域传送（zone transfer，同步整个域的记录），数据量大且必须可靠有序，走 TCP。
</div>

<div class="niv-why">
为什么默认选 UDP？DNS 查询的特点是「短、频、可容忍偶尔丢失」。UDP 不用三次握手、不维护连接状态，一个包发过去一个包回来，延迟最低。而如果用 TCP，光建连接的握手开销就比查询本身还贵。至于 512 字节这个门槛，是传统 DNS 的经典约定；现代还有 EDNS 扩展机制可以协商更大的 UDP 报文，但面试答「超过 512 字节改用 TCP」这个经典结论是稳妥的，如果想加分可以补一句「EDNS0 允许协商更大的 UDP 包」。
</div>

### IP 逻辑寻址 vs MAC 物理寻址：为什么两个都要

这是本讲的重头戏，几乎必被追问。

```text
IP 地址：网络层，逻辑地址，可跨网段，路由器靠它决定"往哪个网络转"
   类比：收件人的"省市区街道门牌"，全国范围唯一定位
MAC 地址：链路层，物理地址，只在同一局域网内有效
   类比：这栋楼里"具体哪一间房"，出了这栋楼就没意义
```

<div class="niv-a">
<strong>标准回答模板：</strong>IP 和 MAC 各管一段。IP 是逻辑地址，负责「端到端」的宏观定位与路由，让数据能跨越一个个网络最终找到目标主机所在的网段；MAC 是物理地址，负责「点到点」的局部投递，在同一个局域网里把帧交到具体那块网卡手上。一次通信里，源 IP 和目的 IP 从头到尾基本不变（它标识最终的收发双方），但 MAC 地址每经过一个路由器就会被改写成「下一跳」的地址。所以两个都要：IP 解决「大方向去哪」，MAC 解决「这一段交给谁」。
</div>

<div class="niv-why">
为什么不能只用其中一个？只用 MAC：MAC 是平坦的、无层次结构，全球几十亿网卡没法靠它做路由聚合，路由表会爆炸，根本没法跨网段找路。只用 IP：底层网卡实际收发数据靠的是 MAC 帧，交换机也是按 MAC 转发的，链路层这一段绕不开物理地址。所以是分层设计的必然：网络层用 IP 做全局路由，链路层用 MAC 做本地投递。
</div>

### ARP：同网段里 IP 找 MAC

当主机要给「同一网段」的某个 IP 发数据时，它知道对方 IP，但链路层发帧需要对方的 MAC，这时就靠 ARP：

```text
主机A 想发给 192.168.1.5，但不知道它的 MAC
A 广播：谁是 192.168.1.5？请把你的 MAC 告诉我（发给全网段）
192.168.1.5 单播回应：我是，我的 MAC 是 xx:xx:xx:xx:xx:xx
A 收到后写入 ARP 缓存表，之后一段时间内直接用
```

<div class="niv-why">
如果目标 IP 不在同一网段呢？主机不会去 ARP 那个远端 IP，而是把帧发给「默认网关（路由器）」，所以它 ARP 的是网关的 MAC。数据到了网关，再由网关一跳跳往后转。这也解释了前面那句「MAC 每经过一个路由器就变」：每一跳都是一次局域网内的投递，都要用 ARP 找下一跳的 MAC。
</div>

### ping 的原理

<div class="niv-a">
<strong>标准回答模板：</strong>ping 用的是 ICMP（网络层协议），不是 TCP 也不是 UDP，没有端口号。它发一个 ICMP Echo Request（回显请求），对方回一个 Echo Reply（回显应答），通过是否收到回应、以及往返时间（RTT）来判断「网络层能不能通、通得快不快」。
</div>

<div class="niv-why">
ping 通说明什么、不说明什么？ping 通只能说明网络层（IP 层）到对方主机是可达的、链路基本正常，但它不能说明对方的某个应用/端口是好的。比如网站 80 端口挂了但主机还在，ping 照样通，服务却打不开。反过来，ping 不通也不一定是真的不通，很多服务器或防火墙会故意屏蔽 ICMP，这时得用 telnet/nc 去测具体端口。
</div>

## 🔍 场景追问：面试官会顺着问

<div class="niv-scene"><strong>追问：</strong>我把域名的解析记录改到新服务器的 IP 了，为什么还有一部分用户在访问旧服务器？</div>

这是本讲的招牌场景题，考的就是 DNS 缓存 + TTL。要点：

- 根因是缓存分层 + TTL 没到期。你改的是权威服务器上的记录，但用户到权威之间隔着好几层缓存：本地 DNS 服务器缓存、操作系统缓存、浏览器缓存，甚至有些程序自己还缓存了 IP。
- 在旧记录的 TTL 到期之前，这些缓存里存的还是旧 IP，用户自然还连旧服务器。TTL 越大，这个「尾巴」拖得越长。
- 部分本地 DNS（运营商）还可能不严格遵守 TTL，缓存得更久，导致个别地区生效更慢。
- 正确做法：迁移前提前几天把 TTL 调小（比如从 一天 调到 几百秒），等旧 TTL 过期、小 TTL 全网生效后再切 IP；切换后新旧服务器并行运行一段时间（灰度/双写），等缓存全部过期再下线旧机器。

<div class="niv-scene"><strong>追问：</strong>为什么 DNS 大多用 UDP，什么时候必须用 TCP？</div>

- 用 UDP：查询短小、要求快、无需连接，一问一答，偶尔丢包重问代价很低，这是绝大多数场景。
- 用 TCP：一是响应报文过大（传统以 512 字节为界，超过会被截断，客户端据此改用 TCP 重查）；二是主从服务器之间的区域传送，要把整个域的大量记录可靠、有序地同步，必须用 TCP。
- 加分点：现代有 EDNS0 扩展，可以协商更大的 UDP 报文以减少「被迫转 TCP」的情况，但经典结论不变。

<div class="niv-scene"><strong>追问：</strong>同一个局域网里两台机器通信，和跨网段访问一个公网服务器，在寻址上有什么不同？</div>

- 同网段：源主机直接 ARP 出对方的 MAC，把帧点对点交过去，不经过路由器。IP 和 MAC 的目的地都是对方本身。
- 跨网段：源主机发现目的 IP 不在本网段，就把目的 MAC 填成「网关的 MAC」（通过 ARP 网关得到），但目的 IP 仍是最终服务器的 IP。数据到网关后，网关查路由表决定下一跳，再改写 MAC 继续转发。整条路径上目的 IP 不变，目的 MAC 一跳一换。

## 🛠 动手验证（可选做）

用 `dig` 亲手看一次解析。下面是真实执行的输出（域名可换成你自己的）：

```bash
dig www.baidu.com
```

真实返回（节选）：

```text
;; ANSWER SECTION:
www.baidu.com.          976     IN      CNAME   www.a.shifen.com.
www.a.shifen.com.       19      IN      A       110.242.69.21
www.a.shifen.com.       19      IN      A       110.242.70.57

;; Query time: 33 msec
;; SERVER: ::1#53(::1)
;; MSG SIZE  rcvd: 138
```

几个点值得说：`CNAME` 说明 www.baidu.com 是个别名，真实域名是 www.a.shifen.com；一个域名返回了多个 A 记录（多个 IP），这就是最朴素的负载均衡；ANSWER 前的数字 976 和 19 就是各记录的 TTL（秒），会随缓存时间倒数递减；最后一行 `MSG SIZE rcvd: 138` 说明这次响应只有 138 字节，远没到 512，用 UDP 完全够。

只想要 IP、不看废话，加 `+short`：

```bash
dig +short www.baidu.com
```

```text
www.a.shifen.com.
110.242.69.21
110.242.70.57
```

想亲眼看到「递归/迭代」的分层过程，用 `+trace`，它会从根服务器开始一层层问下来：

```bash
dig +trace www.baidu.com
```

```text
.                       3331    IN      NS      a.root-servers.net.
.                       3331    IN      NS      b.root-servers.net.
... (根服务器列表)
www.baidu.com.          973     IN      CNAME   www.a.shifen.com.
www.a.shifen.com.       16      IN      A       110.242.69.21
;; Received 90 bytes from 199.7.91.13#53(d.root-servers.net) ...
```

Windows 或不想装 dig 时，用系统自带的 `nslookup` 也能看：

```bash
nslookup www.baidu.com
```

```text
Server:         ::1
Address:        ::1#53

Non-authoritative answer:
www.baidu.com   canonical name = www.a.shifen.com.
Name:   www.a.shifen.com
Address: 110.242.69.21
Address: 110.242.70.57
```

注意 `Non-authoritative answer`（非权威应答）这行：它表示结果来自本地 DNS 的缓存，而不是直接问权威服务器拿的，正好印证了缓存的存在。

想看 ARP 缓存表和 ping，可以：

```bash
arp -a          # 查看本机 ARP 缓存里 IP 到 MAC 的映射
ping www.baidu.com   # 发 ICMP Echo，看是否可达和 RTT
```

## 🧨 高频翻车点

<div class="niv-trap">
<strong>翻车 1：说「DNS 就是用 UDP 的」，一口咬死不提 TCP。</strong>面试官立刻追问「那什么时候用 TCP」，你答不上就露馅。正确说法：以 UDP 为主，响应超过 512 字节（截断）或区域传送时用 TCP。
</div>

<div class="niv-trap">
<strong>翻车 2：把「有了 IP 为什么还要 MAC」答成「MAC 是备用的」或「MAC 更安全」。</strong>这完全跑偏。正确说法是分层职责：IP 做跨网段的全局路由（逻辑寻址），MAC 做同网段的本地投递（物理寻址），一次通信里目的 IP 不变、目的 MAC 逐跳改写，两者缺一不可。
</div>

<div class="niv-trap">
<strong>翻车 3：说「ping 通了就说明服务没问题」。</strong>ping 走 ICMP，只验证网络层可达，跟具体端口/应用是否正常无关。服务挂了但主机在，照样 ping 通；很多主机屏蔽 ICMP，ping 不通也不代表真不通。判断服务要用 telnet/nc/curl 测端口。
</div>

## 🎤 面试话术模板

<div class="niv-a">
<strong>30 秒口述版：</strong>DNS 是把域名翻译成 IP 的分布式系统。浏览器输入域名后，先查本地各级缓存，没命中就交给本地 DNS 服务器；它对我们是递归，对根/顶级/权威是迭代：先问根拿到 .com 服务器地址，再问顶级拿到权威地址，最后问权威拿到真实 IP，然后按 TTL 缓存起来。DNS 以 UDP 为主，图的是快，但响应超过 512 字节或做区域传送时会转 TCP。拿到 IP 后，网络层靠 IP 做跨网段路由（逻辑寻址），链路层靠 MAC 在局域网内投递（物理寻址），同网段用 ARP 把 IP 解析成 MAC，跨网段则先发给网关。整条路径上目的 IP 不变、MAC 逐跳改写。而 ping 用的是 ICMP，只能验证网络层通不通，不能证明应用正常。
</div>

## ✅ 自测三问

1. 递归查询和迭代查询的区别是什么？为什么根服务器只做迭代？
2. DNS 什么情况下会从 UDP 切到 TCP？
3. 一次通信里，源/目的 IP 和源/目的 MAC 各自会不会变？为什么？

<details class="niv-fold"><summary>对答案</summary>

1. 递归是「你帮我查到最终答案」（本机对本地 DNS）；迭代是「我告诉你下一步问谁，你自己继续」（本地 DNS 对根/顶级/权威）。根只做迭代是为了不被海量请求压垮，只负责指路，把查到底的累活交给分散的本地 DNS。

2. 两种情况：一是响应报文过大、超过传统 512 字节限制被截断，客户端改用 TCP 重查；二是主从服务器之间做区域传送（同步整个域的记录），数据大且要可靠有序。

3. 源/目的 IP 从头到尾基本不变，它标识最终的收发双方；源/目的 MAC 每经过一个路由器（每一跳）都会改写成下一跳的地址，因为 MAC 只在同一局域网内有效，每一段都是一次本地投递。

</details>

## 📦 复制带走

<div class="niv-card">
<strong>解析链路：</strong>浏览器缓存 → OS/hosts → 本地 DNS（递归解析器）→ 根(.) → 顶级(.com) → 权威(baidu.com) → 真实 IP。本机对本地 DNS 是递归，本地 DNS 对上游是迭代。
</div>

<div class="niv-card">
<strong>DNS 走 UDP 还是 TCP：</strong>默认 UDP（端口 53，短平快）。两种转 TCP 的情况：响应超过 512 字节被截断、主从区域传送。加分：EDNS0 可协商更大 UDP 包。
</div>

<div class="niv-card">
<strong>IP vs MAC：</strong>IP 逻辑地址、跨网段、做全局路由；MAC 物理地址、同网段、做本地投递。一次通信目的 IP 不变、目的 MAC 逐跳改写。同网段 ARP 找对方 MAC，跨网段先发网关。
</div>

<div class="niv-card">
<strong>缓存与场景题：</strong>改了解析用户还连旧 IP＝各级缓存 + TTL 未过期。迁移前先调小 TTL，切换后新旧并行等缓存过期。ping＝ICMP，只验网络层可达，不代表应用正常。
</div>

<p style="margin-top:24px"><a href="/courses/net-interview/">← 回到《秋招计网面试实战课》目录</a></p>
