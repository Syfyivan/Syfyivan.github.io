---
title: "《从 URL 到页面显示》分支 A · WebRTC 实时通信"
date: 2026-08-21 18:00:00
tags: [浏览器, WebRTC, 网络, NAT穿透, 校招, 面试]
categories: [面试]
toc: true
visibility: public
---

<style>
.bc-sec{display:flex;align-items:center;gap:12px;margin:42px 0 4px;font-size:15px;letter-spacing:2px;color:#3f5d7e;font-weight:800}
.bc-sec::before{content:"";width:4px;height:18px;background:#3f5d7e;border-radius:2px}
.bc-sec.lead::before{background:#b73a2c}.bc-sec.lead{color:#b73a2c}
.bc-lead{margin:14px 0 22px;padding:16px 18px;line-height:1.85;border-radius:10px;background:rgba(183,58,44,.08);border-left:4px solid #b73a2c;font-size:15px}
.bc-call{margin:18px 0;padding:12px 16px 12px 16px;line-height:1.8;border-radius:8px;background:var(--wash);border-left:4px solid var(--line)}
.bc-call .bc-tag{display:inline-block;font-size:12px;font-weight:800;padding:1px 9px;border-radius:999px;margin-right:8px;color:#fff}
.bc-branch{background:rgba(63,93,126,.07);border-left-color:#3f5d7e}.bc-branch .bc-tag{background:#3f5d7e}
.bc-impl{background:rgba(105,114,125,.09);border-left-color:#69727d}.bc-impl .bc-tag{background:#69727d}
.bc-bonus{background:rgba(47,118,95,.09);border-left-color:#2f765f}.bc-bonus .bc-tag{background:#2f765f}
.bc-source{background:rgba(155,102,50,.09);border-left-color:#9b6632}.bc-source .bc-tag{background:#9b6632}
.bc-platform{background:rgba(120,80,140,.09);border-left-color:#78508c}.bc-platform .bc-tag{background:#78508c}
.bc-refs{margin:34px 0 0;padding-top:14px;border-top:1px solid var(--line);font-size:13px;color:var(--muted);line-height:1.9}
.bc-refs b{color:var(--text)}
.bc-cite{font-size:11px;vertical-align:super;color:#3f5d7e;text-decoration:none;font-weight:700;margin:0 1px}
.bc-nav{display:flex;justify-content:space-between;gap:12px;margin:30px 0 0}
.bc-nav a{flex:1;padding:12px 15px;border:1px solid var(--line);border-radius:10px;text-decoration:none;background:var(--panel);font-size:14px}
.bc-nav a:hover{border-color:#3f5d7e}
.bc-nav .r{text-align:right}
html[data-user-color-scheme="dark"] .bc-lead{background:rgba(183,58,44,.2)}
</style>

> 这是一条从主线岔出去的独立分支。主线讲的是浏览器怎么去服务器**取**一篇文档（请求-响应模型）。而 WebRTC 要解决的是完全不同的问题：两个浏览器之间**直接、实时、双向**地传音视频和数据，不经过中转服务器搬运媒体。所以它走的是和 HTTP 几乎全然不同的建连与传输路径。

<p class="bc-sec lead">一句话结论</p>

WebRTC（Web Real-Time Communication，网页实时通信）让两个浏览器点对点直连，实时传音视频和任意数据。它最难的不是传数据，而是**在各自躲在 NAT 和防火墙后面的两台机器之间，先凿出一条能直连的通路**——这一步叫 NAT 穿透，靠 ICE、STUN、TURN 三件套完成。

<p class="bc-sec">理解原理</p>

### 为什么 HTTP 那套在这里不够用

主线里浏览器连的是服务器，服务器有公网 IP、在固定端口等着被连，是天然的「被连接方」。但 WebRTC 要连的是**另一个浏览器**——它和你一样躲在家用路由器的 NAT（Network Address Translation，网络地址转换）后面，没有公网 IP、也没在任何端口等着被连。两个都藏在 NAT 后的机器想直连，就像两个只知道对方公司总机、却不知道分机号的人想直接通话。这就是 WebRTC 的核心难题。

而且实时音视频对**延迟**极度敏感，宁可丢几帧也不能卡。所以它不能用 TCP（丢包必重传、必然引入延迟），底层选了 UDP。

### 第一步：信令——先交换「怎么找到我」的信息

有意思的是，WebRTC 标准**不规定信令（signaling）怎么做**。因为两个浏览器一开始根本没法直接对话，必须借助一个双方都能连上的服务器（用 WebSocket、HTTP 都行）来交换建连所需的元信息。这一步叫信令，交换的内容主要两类：

- **SDP（Session Description Protocol，会话描述协议）**：描述「我支持哪些音视频编解码、什么参数」，双方通过 offer / answer 协商出一致的媒体格式。
- **ICE candidate（候选地址）**：描述「可以从哪些地址找到我」，是下一步穿透的原料。

信令服务器只帮忙**牵线**（交换这些描述信息），一旦直连建成，媒体数据就不再经过它。

### 第二步：ICE / STUN / TURN——凿穿 NAT

这是 WebRTC 面试的绝对重点。三者是层层兜底的关系：

- **STUN（Session Traversal Utilities for NAT）**：一台公网服务器，你向它发个包，它把「它看到的你的公网 IP 和端口」告诉你。这样你就知道了自己在 NAT 外面长什么样（公网映射地址），把这个地址作为候选交给对方，很多情况下双方就能直连了 <a class="bc-cite" href="https://datatracker.ietf.org/doc/html/rfc8489" target="_blank" rel="noopener">[1]</a>。STUN 只帮你「问出地址」，不转发数据，成本极低。
- **TURN（Traversal Using Relays around NAT）**：当 NAT 类型太严格（如对称型 NAT），STUN 问出的地址也连不通时，只能退而求其次，用一台 TURN 中继服务器**转发所有媒体流量**。这时就不是点对点了，但至少能通。TURN 要承担全部流量，成本高，是最后的兜底。
- **ICE（Interactive Connectivity Establishment，交互式连接建立）**：它是把上面两者统筹起来的**框架**。ICE 收集所有可能的候选地址（本地地址、STUN 问到的公网地址、TURN 中继地址），然后让双方的候选两两配对、并发地做连通性检查，**谁先通就用谁**，优先选直连、实在不行才用 TURN 中继 <a class="bc-cite" href="https://datatracker.ietf.org/doc/html/rfc8445" target="_blank" rel="noopener">[2]</a>。

<div class="bc-call bc-bonus"><span class="bc-tag">加分细节</span><strong>ICE 的候选优先级和 Happy Eyeballs 是同一种思路</strong><br>主线节点三讲过 Happy Eyeballs——IPv6/IPv4 并发赛跑、谁先通用谁。ICE 的连通性检查是同一种工程哲学：与其费劲预判哪条路能通，不如把所有候选都试一遍、让实际结果说话，只是优先级排序上偏向「直连 > STUN 直连 > TURN 中继」。能把这两处联系起来，说明你抓住了网络工程里「并发探测优于静态预判」的通用模式。</div>

### 第三步：连通之后——DTLS 加密 + SRTP 传输

穿透成功、通路建好，还不能直接裸传。WebRTC 强制加密：

- 先在这条 UDP 通路上做一次 **DTLS**（Datagram TLS，UDP 版的 TLS）握手，协商出密钥——这和主线节点五的 TLS 是近亲，只是跑在 UDP 上。
- 然后音视频用 **SRTP**（Secure RTP）加密传输，任意应用数据走 **DataChannel**（基于 SCTP over DTLS）。

所以 WebRTC 的安全模型和主线一脉相承：**先握手协商密钥，再对称加密传输。** 差别只是载体从 TCP 换成了 UDP。

### 汇总：一次 WebRTC 连接的完整骨架

信令服务器牵线交换 SDP 和候选 → ICE 用 STUN 问公网地址、必要时用 TURN 兜底 → 连通性检查选出最优通路 → DTLS 握手协商密钥 → SRTP / DataChannel 加密实时传输。媒体一旦直连，就绕开了信令服务器。

<p class="bc-sec">主线整理</p>

```text
两个浏览器都在 NAT 后，无公网 IP
        ↓ 先借第三方牵线
信令服务器：交换 SDP（媒体能力）+ ICE 候选（怎么找到我）
        ↓ 开始凿 NAT
ICE 框架收集候选：本地 / STUN 问到的公网 / TURN 中继
        ↓ 候选两两并发做连通性检查
选出最优通路（直连优先，实在不行走 TURN 中继）
        ↓ 通路建好但要加密
DTLS 握手协商密钥（UDP 版 TLS）
        ↓
SRTP 传音视频 / DataChannel 传数据（实时、低延迟、绕开信令服务器）
```

<p class="bc-sec">设计取舍</p>

**底层用 UDP 而非 TCP**，用「可能丢包」换来了「绝不因重传而卡顿」的低延迟，这对实时音视频是对的取舍——丢一帧画面无所谓，卡半秒无法接受。代价是可靠性要由上层（如 SRTP 的选择性重传、前向纠错）自己补。

**信令交给应用自己实现**，用「标准不管信令」换来了灵活性——用 WebSocket、长轮询、甚至扫码都行，适配各种业务。代价是开发者得自己搭信令通道，上手门槛高。

**TURN 中继兜底**，用「牺牲点对点、承担服务器流量成本」换来了「再严格的 NAT 也能连通」的可用性下限。代价是 TURN 服务器带宽开销大，所以工程上总是优先直连、把 TURN 当最后手段。

<p class="bc-sec">面试回答</p>

WebRTC 解决的是两个浏览器之间实时点对点传音视频和数据，和主线的请求-响应完全不同。最难的是两台机器都躲在 NAT 后、没有公网 IP，怎么直连。它先靠一个信令服务器牵线，双方交换 SDP 协商编解码能力、交换 ICE 候选地址；标准不规定信令怎么做，用 WebSocket 就行。然后 ICE 框架来穿透 NAT：STUN 是一台公网服务器，帮你问出自己在 NAT 外的公网 IP 和端口，多数情况这样双方就能直连；如果 NAT 太严格连不通，就用 TURN 中继服务器转发所有流量兜底，但成本高。ICE 把本地、STUN、TURN 这些候选都收集起来，两两并发做连通性检查，谁先通用谁，优先直连、实在不行才走 TURN。通路建好后还要加密，先做 DTLS 握手也就是 UDP 版的 TLS 协商密钥，再用 SRTP 传音视频、DataChannel 传数据。底层用 UDP 不用 TCP，是因为实时场景宁可丢帧也不能因重传卡顿。媒体一旦直连就绕开信令服务器了。

<p class="bc-sec">常见追问</p>

**STUN 和 TURN 的区别？**（校招必考）
STUN 只帮你问出自己在 NAT 外的公网映射地址，不转发数据、成本低，用于让双方尝试直连。TURN 是在双方无法直连时，用一台中继服务器转发全部媒体流量，能保证连通但承担带宽成本高。优先用 STUN 直连，TURN 是兜底。

**ICE 是什么，它和 STUN/TURN 什么关系？**（校招常问）
ICE 是统筹穿透的框架，不是具体服务器。它收集所有候选地址（本地、STUN 问到的、TURN 中继的），让双方候选两两并发做连通性检查，选出能通且最优的一条。STUN 和 TURN 是 ICE 用来获取候选的两种工具。

**WebRTC 为什么用 UDP 而不是 TCP？**（校招常问）
实时音视频对延迟极敏感，TCP 丢包必重传会引入延迟和卡顿。UDP 不保证可靠，允许丢包，宁可丢一帧也不卡，更适合实时。可靠性由上层按需补（选择性重传、前向纠错）。

**信令服务器在连接建成后还需要吗？**（回答出来加分）
建成直连后，媒体数据不再经过信令服务器。但信令通道通常保留，用于后续协商（如重新协商编解码、通知挂断、传递新的 ICE 候选应对网络切换）。

**WebRTC 怎么保证安全？**（回答出来加分）
强制加密。先在 UDP 通路上做 DTLS 握手协商密钥，音视频用 SRTP 加密、数据用基于 DTLS 的 DataChannel。模型和主线的 TLS 一致——先握手再对称加密，只是载体是 UDP。

**DataChannel 和 WebSocket 有什么不同？**（通常不需要主动展开）
WebSocket 是浏览器到服务器的可靠有序通道，走 TCP。DataChannel 是浏览器到浏览器的点对点通道，基于 SCTP over DTLS，可配置成不可靠/无序以追求低延迟，适合游戏状态同步这类场景。

---

**这条分支和主线的关系**：主线是「向服务器取文档」，WebRTC 是「和另一个浏览器直连」。两者共享同一套底层哲学（并发探测选路、先握手再加密），但面对的连接对象和延迟要求完全不同，所以走了独立的建连与传输路径。


<div class="bc-refs"><b>参考来源</b><br>[1] <a href="https://datatracker.ietf.org/doc/html/rfc8489" target="_blank" rel="noopener">https://datatracker.ietf.org/doc/html/rfc8489</a><br>[2] <a href="https://datatracker.ietf.org/doc/html/rfc8445" target="_blank" rel="noopener">https://datatracker.ietf.org/doc/html/rfc8445</a></div>

<div class="bc-nav"><a href="/courses/browser-course/">← 课程目录</a><a class="r" href="/courses/browser-course/">课程目录 →</a></div>
