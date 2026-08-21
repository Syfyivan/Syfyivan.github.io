---
title: "《从 URL 到页面显示》第 06 讲 · HTTP 请求与响应"
date: 2026-08-21 14:00:00
tags: [HTTP, 缓存, HTTP2, HTTP3, 校招, 面试]
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

安全通道就绪，网络服务终于把加载任务变成一个真正的 HTTP 请求发出去。但在真正上网之前，它还会先问一句「这东西缓存里有没有」。这一节点的产出，是一个 HTTP 响应——状态行、响应头，以及正在流过来的响应体；也可能是一次重定向，把流程带回前面重来。

<p class="bc-sec">理解原理</p>

### 从上一节点的输出开始：一条能安全说话的通道

节点五交出一条已认证、已加密的通道。现在网络服务可以把节点一那份加载任务，组织成一个 HTTP（HyperText Transfer Protocol，超文本传输协议）请求发出去。HTTP 是应用层协议，它规定了「请求怎么写、响应怎么回」，但它不关心底层是 TCP 还是 QUIC——这也是它能从 1.1 演进到 3 而语义基本不变的原因。

### 第一步：也许根本不用发——HTTP 缓存先拦一道

发请求前，还有一道捷径：**浏览器缓存。** 它分两种拦截强度：

- **强缓存**：如果之前的响应带了 `Cache-Control: max-age=...`（或旧的 `Expires`），且还没过期，浏览器直接用本地副本，**一个请求都不发**。这是最快的路径。
- **协商缓存**：如果本地副本过期了，但带着校验标识（`ETag` 或 `Last-Modified`），浏览器会发一个带 `If-None-Match` / `If-Modified-Since` 的请求去问服务器「我这份还能用吗」。没变，服务器回 `304 Not Modified`，不带响应体，浏览器继续用本地副本，省下了传输体积。

所以「强缓存省掉整个请求，协商缓存省掉响应体」是两件事。主线上假设缓存未命中或需要协商，继续往下发请求。

### 第二步：请求长什么样

一个 HTTP 请求由三部分组成：请求行（方法 + 路径 + 版本，比如 `GET /path HTTP/1.1`）、请求头、可选的请求体。对一次普通页面导航，方法是 GET，没有请求体。请求头里带着一批关键信息：

- `Host`：要访问的主机名（一台服务器上可能有多个站点）。
- `Cookie`：浏览器自动带上的、该域名下的凭证——这也是登录态能保持的原因，同时是 CSRF 的根源（连到 Web 安全分支）。
- `Accept` / `Accept-Encoding` / `Accept-Language`：告诉服务器我能接受什么类型、什么压缩、什么语言。
- `User-Agent`、`Referer` 等上下文信息。

### 第三步：响应长什么样

服务器处理后回一个 HTTP 响应：状态行（版本 + 状态码 + 原因短语，比如 `HTTP/1.1 200 OK`）、响应头、响应体。状态码是理解结果的第一手信息，按段分类：

- `2xx` 成功，`200` 是最常见的「给你内容」。
- `3xx` 重定向，比如 `301`（永久）、`302`（临时），要带着 `Location` 里的新地址重走流程。
- `4xx` 客户端错，`404` 找不到、`403` 没权限。
- `5xx` 服务端错，`500` 内部错误、`502`/`504` 常和网关、上游超时有关。

响应头里，`Content-Type` 告诉浏览器这是 HTML 还是别的（决定接下来怎么处理），`Content-Encoding` 说明用了什么压缩，`Set-Cookie` 下发凭证，`Cache-Control` / `ETag` 为下次缓存埋伏笔。

### 第四步：重定向——响应把流程带回前面

如果响应是 `3xx` 且带 `Location`，这次请求并没有拿到最终内容，而是被告知「去另一个地址」。浏览器会带着新 URL 重新走一遍前面的流程——可能重新解析主机、重新连接、重新握手。这正是总纲说的「主线不是单向直筒」的典型：一次重定向把流程回卷到节点二到五。常见的 `http` 跳 `https`、裸域名跳 `www`，都是这么发生的。

### 第五步：HTTP 版本演进——同一条通道，怎么把请求发得更快

HTTP 的语义(方法、头、状态码)在各版本基本一致，变的是「怎么在连接上传输」，主题始终围绕**队头阻塞**：

- **HTTP/1.1**：一条连接同一时刻只能处理一个请求-响应，前一个没回完，后一个只能等。这是**应用层的队头阻塞**。浏览器只能靠对同一个域名开多条并行连接来缓解，但连接数有限。
- **HTTP/2**：引入多路复用，一条 TCP 连接上可以同时跑多个流，请求和响应被切成帧交错传输，解决了 HTTP/1.1 的应用层队头阻塞 <a class="bc-cite" href="https://www.rfc-editor.org/rfc/rfc9113" target="_blank" rel="noopener">[1]</a>。但它仍跑在 TCP 上，一旦某个 TCP 段丢了，整条连接上所有流都得等重传——队头阻塞被**下沉到了 TCP 层**，没有根除。
- **HTTP/3**：把传输换成 QUIC（节点四讲过）。QUIC 的多个流各自独立，一个流丢包不影响其它流，**从传输层根除了队头阻塞** <a class="bc-cite" href="https://www.rfc-editor.org/rfc/rfc9114" target="_blank" rel="noopener">[2]</a>。

所以三代演进是一条清晰的因果链：HTTP/1.1 有应用层队头阻塞 → HTTP/2 用多路复用解决它、但把阻塞下沉到 TCP → HTTP/3 换 QUIC 从传输层根除。能把这条链讲顺，比单独背每代特性有力得多。

<div class="bc-call bc-bonus"><span class="bc-tag">加分细节</span><strong>Keep-Alive 不是 TCP Keepalive</strong><br>HTTP 的 `Connection: keep-alive` 指的是「这条连接用完先别关，留着给后续请求复用」，属于应用层的连接复用，对应节点三讲的连接池。而 TCP Keepalive 是传输层用来探测「对方是不是还活着」的保活机制，靠定期发探测包维持。两者名字像，层次和目的都不同，别混为一谈。</div>

<div class="bc-call bc-impl"><span class="bc-tag">实现细节</span><strong>响应体是边到边处理的</strong><br>响应不是等整包收齐才交给上层。状态行和响应头先到，浏览器据此就能做很多决定（比如看 `Content-Type` 决定谁来渲染）；响应体随后像水流一样持续到达。节点四提过，大块响应体在 Chromium 里正是通过 Mojo 的数据管道流向渲染进程的。这个「流式」特性是下一节点边下载边解析的前提。</div>

### 汇总：这一节点交出去的是什么

缓存先做了拦截，未命中才组织请求发出；服务器回来的可能是重定向（回卷到前面重走），也可能是真正的响应。主线走到最终的成功响应：网络服务手里是一个 **HTTP 响应——已拿到状态行和响应头，响应体正在源源不断地流过来。**

响应头里 `Content-Type: text/html` 是个关键信号：这是一篇要渲染的文档。但由谁来渲染、这条流怎么接进渲染进程、地址栏何时更新——这些是节点七「导航提交」要处理的。

<p class="bc-sec">主线整理</p>

```text
安全通道就绪
        ↓ 先看缓存
强缓存命中 → 直接用本地副本，一个请求都不发（最快）
        ↓ 未命中 / 已过期但有校验标识
组织 HTTP 请求（请求行 + 头[Host/Cookie/Accept...]）发出
        ↓ 协商缓存：304 则用本地副本，省响应体
服务器处理，返回响应（状态行 + 响应头 + 响应体）
        ↓ 若 3xx + Location
重定向：带新 URL 回卷到节点二~五重走
        ↓ 若 2xx
拿到最终响应，响应体开始流式到达
        ↓
产出：HTTP 响应（状态行 + 响应头 + 正在流入的响应体）
```

<p class="bc-sec">设计取舍</p>

**HTTP 缓存分强缓存和协商缓存两级**，强缓存省掉整个往返、协商缓存省掉响应体，用「可能用到稍旧内容」的风险换速度。风险由 `max-age`、`ETag` 这些字段精细控制。

**HTTP 语义与传输分离**，让方法、状态码、头这套语义在 1.1/2/3 间保持稳定，传输层可以独立进化。代价是版本协商、兼容处理变复杂（比如要靠 Alt-Svc 才知道能不能上 HTTP/3）。

**多路复用（HTTP/2）**，用一条连接跑多个流，省掉了开多条连接的开销、解决应用层队头阻塞。代价是没能解决 TCP 层的队头阻塞，这个遗留问题最终要靠 HTTP/3 换掉传输层来还。

<p class="bc-sec">面试回答</p>

安全通道建好后才发 HTTP 请求，但发之前先看缓存：强缓存没过期就直接用本地副本、一个请求都不发；过期了但有 ETag 或 Last-Modified，就发协商请求问服务器还能不能用，没变返回 304、不带响应体。真要发，请求由请求行、请求头、可选请求体组成，头里带 Host、Cookie、Accept 这些。服务器回状态行、响应头、响应体，状态码分五段，2xx 成功、3xx 重定向、4xx 客户端错、5xx 服务端错。如果是 3xx 带 Location，就带新地址回到前面重走解析和连接，http 跳 https 就是这样。HTTP 版本演进的主线是队头阻塞：HTTP/1.1 一条连接一次一个请求，是应用层队头阻塞；HTTP/2 多路复用一条连接跑多个流解决了它，但仍在 TCP 上，丢包会卡住所有流，阻塞下沉到 TCP；HTTP/3 换成 QUIC，各流独立，从传输层根除。另外 HTTP 的 keep-alive 是应用层连接复用，和 TCP Keepalive 保活不是一回事。拿到 text/html 的响应后，交给导航提交去决定谁来渲染。

<p class="bc-sec">常见追问</p>

**强缓存和协商缓存区别？**（校招必须掌握）
强缓存靠 Cache-Control/max-age 或 Expires，没过期直接用本地副本，不发请求，最快。协商缓存靠 ETag/Last-Modified，本地副本过期后发条件请求问服务器，没变回 304 不带响应体，省的是传输体积不是请求本身。

**HTTP/1.1、2、3 分别怎么处理队头阻塞？**（校招必须掌握）
1.1 一条连接一次一个请求，有应用层队头阻塞，只能靠多开连接缓解。2 用多路复用一条连接并发多个流，解决应用层队头阻塞，但仍在 TCP 上，丢一个段所有流都等重传，阻塞下沉到 TCP。3 换 QUIC，流之间独立，一个流丢包不影响别的，从传输层根除。

**GET 和 POST 的真正区别？**（校招常问）
语义上 GET 用于获取、应幂等安全，POST 用于提交、会改变状态。GET 参数在 URL、POST 在请求体，GET 更容易被缓存和记录进历史。但「POST 更安全」是误解，两者都得靠 HTTPS 才加密。

**301 和 302 区别？**（回答出来加分）
301 永久重定向，浏览器和搜索引擎会记住、以后直接去新地址；302 临时，每次仍访问原地址再被引导。用错会影响缓存和 SEO。

**keep-alive 和 TCP Keepalive 是一回事吗？**（回答出来加分）
不是。HTTP keep-alive 是应用层的连接复用——用完别关留给后续请求。TCP Keepalive 是传输层探测对端是否存活的保活机制。名字像，层次和目的完全不同。

**502 和 504 通常说明什么？**（通常不需要主动展开）
502 Bad Gateway，网关从上游收到无效响应；504 Gateway Timeout，网关等上游超时。都指向「网关到后端这一段」出了问题，而不是网关本身不可达。

---

**本节点产出**：一个成功的 HTTP 响应——状态行、响应头（含 `Content-Type: text/html`）已到，响应体正在流式到达。

**交给谁**：节点七 · 响应处理与导航提交。

**下一节点为什么因此开始**：响应头一到，浏览器就知道这是一篇要渲染的 HTML。但网络服务不负责渲染，渲染在渲染进程里。现在要决定：由哪个渲染进程承载、怎么把这条数据流接过去、什么时候正式「提交」这次导航并更新地址栏。这就是节点七。


<div class="bc-refs"><b>参考来源</b><br>[1] <a href="https://www.rfc-editor.org/rfc/rfc9113" target="_blank" rel="noopener">https://www.rfc-editor.org/rfc/rfc9113</a><br>[2] <a href="https://www.rfc-editor.org/rfc/rfc9114" target="_blank" rel="noopener">https://www.rfc-editor.org/rfc/rfc9114</a></div>

<div class="bc-nav"><a href="/2026/08/21/browser-course-05/">← 05 · TLS 握手</a><a class="r" href="/2026/08/21/browser-course-07/">07 · 响应处理与导航提交 →</a></div>
