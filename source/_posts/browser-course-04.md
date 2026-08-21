---
title: "《从 URL 到页面显示》第 04 讲 · TCP 与 QUIC 连接"
date: 2026-08-21 12:00:00
tags: [TCP, QUIC, 传输层, 计算机网络, 校招, 面试]
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

<p class="bc-sec lead">一句话结论</p>

出口路径已经确定，如果没有连接可复用，网络服务就要在这条路径上建立一条能可靠、有序传输数据的连接。走 TCP 就先三次握手建通道、加密另算；走 QUIC 则把建连和加密合并成一次握手。这一节点的产出，是一条可用的传输连接。

<p class="bc-sec">理解原理</p>

### 从上一节点的输出开始：路径有了，但还没有「管道」

节点三交出一条确定的出口路径，也告诉我们连接池里没有现成连接可复用。于是现在要从零建立一条传输连接。IP 只负责把一个个包尽力送到目的地，它不保证送到、不保证顺序、不保证不重复。可网页加载需要「完整、有序、不丢」的字节流。补上这层保证的，就是传输层。

主线走最经典的一条：**基于 TCP 建立可靠有序的字节流。**

### TCP 为什么要三次握手：双方都得确认「我能发、也能收」

TCP（Transmission Control Protocol，传输控制协议）要在不可靠的 IP 之上造出可靠有序的字节流。双方在传数据前，必须先各自确认一件事：我发出去的对方能收到，对方发出来的我也能收到。三次握手就是用最少的往返把这件事确认清楚 <a class="bc-cite" href="https://www.rfc-editor.org/rfc/rfc9293" target="_blank" rel="noopener">[1]</a>：

- 客户端发 SYN，带上自己的初始序列号，意思是「我要建连，我从这个号开始编」。
- 服务端回 SYN + ACK，既确认收到客户端的 SYN，又带上自己的初始序列号。
- 客户端再发 ACK，确认收到服务端的序列号。

关键在于**为什么是三次、不是两次**：序列号是 TCP 保证有序和去重的基础，双方都必须确认「对方已经知道我的起始序列号」。两次握手只能让服务端确认客户端、无法让客户端确认服务端已收到自己的信息，也无法防住旧的、延迟的重复连接请求造成的错误连接。三次是同步双向序列号所需的最小次数。

握手一旦完成，双方就同步了序列号，一条可靠有序的字节流通道就建好了。

<div class="bc-call bc-impl"><span class="bc-tag">实现细节</span><strong>握手时顺便谈妥能力</strong><br>三次握手不只是确认序列号，还在 SYN 里携带一批选项：最大报文段长度（MSS）、窗口缩放、是否支持选择性确认（SACK）等。这些能力协商决定了后续传输的效率，但不影响「三次握手建连」这条主线的理解。</div>

### 可靠是怎么做到的：序号、确认、重传、按序交付

通道建好后，TCP 靠一套机制维持可靠有序：每段数据都有序列号，接收方用 ACK 确认收到；发送方在一定时间没等到 ACK，就判定丢了并重传；接收方按序列号把乱序到达的数据重新排好，再交给上层。所以上层拿到的永远是完整、有序的字节流——这正是网页加载想要的。

<div class="bc-call bc-bonus"><span class="bc-tag">加分细节</span><strong>流量控制与拥塞控制的分工</strong><br>可靠之外，TCP 还管「发多快」。流量控制靠接收窗口，防止发得太快淹没接收方；拥塞控制靠慢启动、拥塞避免等算法，防止发得太快压垮网络。两者一个看接收方能力、一个看网络能力，共同决定实际发送速率。这部分不进主线，追问时能分清两者面向的对象即可。</div>

### 建连有成本：TCP 的三次握手是「上网前的等待」

三次握手意味着：真正发第一个字节之前，已经花掉大约一个往返（RTT）。如果这次访问还要加密（HTTPS），TCP 握手之上还要再叠一层 TLS 握手，又是一到两个往返。也就是说，普通 HTTPS 请求在发出真正的 HTTP 请求前，要先花掉「TCP 握手 + TLS 握手」的若干个往返。这笔固定开销，正是 QUIC 想砍掉的。

### QUIC：把「建连」和「加密」合并成一次握手

**QUIC** 是构建在 UDP 之上的传输协议，也是 HTTP/3 的底层 <a class="bc-cite" href="https://www.rfc-editor.org/rfc/rfc9000" target="_blank" rel="noopener">[2]</a>。这里要先破除一个说法：**HTTP/3 不等于「就是 UDP」。** 准确说，HTTP/3 跑在 QUIC 上，QUIC 用 UDP 作为承载，但 QUIC 自己在 UDP 之上重新实现了可靠有序、拥塞控制，并把加密（TLS 1.3）直接内建进握手 <a class="bc-cite" href="https://www.rfc-editor.org/rfc/rfc9001" target="_blank" rel="noopener">[3]</a>。

它带来的直接好处：

- **握手合并**：TCP 场景下「TCP 三次握手 + TLS 握手」是分开的两层，QUIC 把传输握手和加密握手合并，通常一个往返就能既建连又完成加密，明显省掉首次连接的等待。
- **没有 TCP 层的队头阻塞**：QUIC 原生支持在一条连接里跑多个独立的流，一个流丢包不会卡住其它流（这一点对 HTTP/2 的痛点尤其关键，留到节点六讲清楚）。
- **连接迁移**：QUIC 用连接 ID 而非「IP + 端口」来标识连接，手机从 Wi-Fi 切到蜂窝网、IP 变了，连接仍能延续，不必重连。

<div class="bc-call bc-branch"><span class="bc-tag">旁支</span><strong>为什么不是所有请求都走 QUIC</strong><br>QUIC 走 UDP，而部分网络会限制或降速 UDP。所以浏览器通常先按 TCP + TLS 连接，同时通过响应头（Alt-Svc）等机制得知服务器支持 HTTP/3，之后才把后续连接升级到 QUIC。首次访问一个站点往往仍从 TCP 起步，QUIC 更多在「已知支持」后发挥作用。主线因此仍以 TCP 为默认路径来讲。</div>

### 汇总：这一节点交出去的是什么

无论走 TCP 还是 QUIC，这一节点的目标一致：造出一条**可靠、有序的传输连接**。TCP 用三次握手同步序列号、用序号确认重传维持可靠，代价是建连与加密分层、往返更多；QUIC 把建连与加密合并，省往返、免队头阻塞、还能迁移连接。

连接建好了，但如果这是 HTTPS，通道现在还是明文的——任何在路径上的人都能看内容。发真正的 HTTP 请求之前，必须先在这条连接上协商出加密。这正是节点五。

<div class="bc-call bc-impl"><span class="bc-tag">实现细节</span><strong>QUIC 已经不用单独的 TLS 节点</strong><br>走 QUIC 时，加密已经在这一节点的握手里完成，逻辑上把节点五「合并」进了节点四。下一节点的 TLS 握手，主要针对「TCP + TLS」这条经典路径展开；理解了它，也就理解了 QUIC 内建的那部分加密。</div>

<p class="bc-sec">主线整理</p>

```text
出口路径已定，且无连接可复用
        ↓ IP 不保证可靠有序，需传输层补上
【TCP 路径（主线）】
三次握手：SYN → SYN+ACK → ACK，双向同步序列号
        ↓ 为什么三次：双方都要确认对方已知自己的序列号
建立可靠有序字节流（序号 / ACK / 重传 / 按序交付）
        ↓ 若为 HTTPS
通道仍是明文，需再叠 TLS 握手（→ 节点五）

【QUIC 路径（旁路）】
基于 UDP，握手合并建连 + TLS 1.3 加密（约 1 RTT）
        ↓ 无 TCP 队头阻塞 / 支持连接迁移
连接建好，加密已就绪
        ↓
产出：一条可用的传输连接
```

<p class="bc-sec">设计取舍</p>

**TCP 三次握手**，用一个往返的等待，换来双向可靠、有序、可去重的字节流基础。代价是这个往返是固定成本，HTTPS 还要再叠 TLS 的往返，首次连接明显慢。

**TCP 的可靠机制（序号/确认/重传/按序交付）**，把「造可靠」的复杂度收进传输层，让上层应用直接享用干净的字节流。代价是严格按序交付会带来队头阻塞——前面的包没到，后面到了的也得等。

**QUIC 合并握手、内建加密**，用「自己在 UDP 上重造一套传输 + 直接内建 TLS 1.3」的复杂度，换来更少往返、无传输层队头阻塞、可连接迁移。代价是实现复杂、依赖 UDP 通路，且首次访问常仍需从 TCP 起步。

<p class="bc-sec">面试回答</p>

IP 只尽力送包，不保证到达和顺序，可靠有序的字节流要靠传输层。走 TCP 就先三次握手：客户端发 SYN 带初始序列号，服务端回 SYN+ACK，客户端再 ACK。之所以三次而不是两次，是因为序列号是保证有序去重的基础，双方都得确认对方已经知道自己的起始序列号，两次做不到，还挡不住旧的重复连接请求。握手完靠序号、确认、超时重传、按序交付维持可靠。代价是建连要一个往返，HTTPS 还得在上面再叠 TLS 握手,首个字节前要花好几个 RTT。QUIC 就是来砍这笔开销的：它基于 UDP，但自己重造了可靠有序，还把 TLS 1.3 内建进握手，通常一个往返就同时建连加密，而且没有 TCP 的队头阻塞、支持连接迁移。要强调 HTTP/3 不等于就是 UDP，是跑在 QUIC 上、QUIC 用 UDP 承载。连接建好后如果是 HTTPS，通道还是明文，得先做 TLS 握手才能发 HTTP 请求。

<p class="bc-sec">常见追问</p>

**TCP 为什么是三次握手，不是两次？**（校招必须掌握）
序列号是 TCP 有序去重的基础，双方都要确认「对方已知我的初始序列号」。两次只能让服务端确认客户端，客户端无法确认服务端收到了自己的信息，也防不住延迟的旧连接请求建立错误连接。三次是双向同步序列号的最小次数。

**四次挥手为什么比握手多一次？**（回答出来加分）
关闭是双向的，且 TCP 允许半关闭：一方发 FIN 表示自己不再发数据，对方先 ACK，但它可能还有数据要发，发完才发自己的 FIN，对方再 ACK。ACK 和 FIN 不能合并，所以比握手多一步。

**HTTP/3 是不是就是 UDP？**（回答出来加分）
不是。HTTP/3 跑在 QUIC 上，QUIC 用 UDP 承载，但在 UDP 之上自己实现了可靠有序、拥塞控制，并内建 TLS 1.3 加密。说「HTTP/3 就是 UDP」忽略了 QUIC 这一层。

**QUIC 相比 TCP+TLS 快在哪？**（校招常问）
一是握手合并，TCP 三次握手加 TLS 握手是分层的多个往返，QUIC 通常一个往返就同时建连加密；二是没有 TCP 层队头阻塞，一条连接里多个流互不影响；三是连接迁移，换网络 IP 变了连接也能延续。

**为什么首次访问常常还是走 TCP？**（通常不需要主动展开）
QUIC 依赖 UDP，部分网络限制 UDP。浏览器通常先用 TCP+TLS，通过 Alt-Svc 等得知服务器支持 HTTP/3，再把后续连接升级到 QUIC。

---

**本节点产出**：一条可用的、可靠有序的传输连接（TCP 通道，或已含加密的 QUIC 连接）。

**交给谁**：节点五 · TLS 握手。

**下一节点为什么因此开始**：走 TCP 时，这条连接建好后仍是明文的。而目标是 HTTPS，发出任何 HTTP 请求之前，必须先在这条连接上协商出一套加密——确认对方身份、商定密钥。节点五就讲这套握手，尤其是 TLS 1.3 如何用更少往返、以 ECDHE 而非 RSA 交换密钥来完成它。


<div class="bc-refs"><b>参考来源</b><br>[1] <a href="https://www.rfc-editor.org/rfc/rfc9293" target="_blank" rel="noopener">https://www.rfc-editor.org/rfc/rfc9293</a><br>[2] <a href="https://www.rfc-editor.org/rfc/rfc9000" target="_blank" rel="noopener">https://www.rfc-editor.org/rfc/rfc9000</a><br>[3] <a href="https://www.rfc-editor.org/rfc/rfc9001" target="_blank" rel="noopener">https://www.rfc-editor.org/rfc/rfc9001</a></div>

<div class="bc-nav"><a href="/2026/08/21/browser-course-03/">← 03 · 网络路径与出口选择</a><a class="r" href="/2026/08/21/browser-course-05/">05 · TLS 握手 →</a></div>
