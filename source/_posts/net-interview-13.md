---
title: "《秋招计网面试实战课》第13讲 · 高频综合题专项（输入 URL 后发生了什么、HTTPS 全过程、接口慢排查、TCP/UDP 选型、H1/H2/H3 对比、登录态保持）"
date: 2026-07-09 21:00:00
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
前面 12 讲把每个知识点都掰开揉碎了，这一讲是「串讲」：把它们重新拼回成面试官真正会问的那几道大题。计网面试翻来覆去就那几道综合题，「输入 URL 后发生了什么」「HTTPS 全过程」「接口慢怎么查」「TCP 和 UDP 怎么选」「HTTP/1.1、2、3 有什么区别」「登录态怎么保持」。这些题的共同点是：范围大、答不完、极易被追问打穿。这一讲不新增知识，只教你把散点组装成一套可背诵的分层框架，每道题配一份追问预案，让你在白板前答得有条理、扛得住追问。建议对照前面各讲一起看，这一讲就是它们的「索引 + 串词」。
</div>

## 🎯 这一讲能答对哪些面试题

- 从浏览器输入 URL 到页面显示，中间发生了什么？<span class="niv-b niv-core">高频必背</span>
- 说一下 HTTPS 的完整请求过程（加密 + 握手）。<span class="niv-b niv-core">高频必背</span>
- 一个接口很慢，你怎么排查？<span class="niv-b niv-core">高频必背</span>
- TCP 和 UDP 的区别是什么？什么场景选哪个？<span class="niv-b niv-core">高频必背</span>
- HTTP/1.1、HTTP/2、HTTP/3 有什么区别？<span class="niv-b niv-core">高频必背</span>
- 登录状态是怎么保持的？Cookie、Session、Token 怎么选？<span class="niv-b niv-key">场景追问</span>

## 📖 核心八股：先讲清楚定义

综合题的答法就一句话：**先给一个分层框架，再逐层填内容，最后停在场景**。面试官要的不是你背得多全，而是你有没有「一条清晰的主线」。下面把 6 道大题各配一份可背诵框架。

### 大题一：输入 URL 后发生了什么<span class="niv-b niv-core">高频必背</span>

这是贯穿全课的主线题，第02讲已经详解过。答题时把整条链路切成清晰的几段，每段一句话，能追问哪段再展开哪段。

<div class="niv-a">
<strong>标准分层框架（8 段主线）：</strong><br>
1. <strong>URL 解析</strong>：浏览器解析出协议、域名、端口、路径；先查各级缓存 / 判断是否命中强缓存（第03、11讲）。<br>
2. <strong>DNS 解析</strong>：域名换成 IP，走浏览器缓存→系统缓存→hosts→本地 DNS→递归查询（第09讲）。<br>
3. <strong>TCP 建连</strong>：和目标 IP:端口三次握手建立连接（第06讲）。<br>
4. <strong>TLS 握手</strong>（HTTPS）：协商密钥、校验证书，之后用对称密钥加密传输（第05讲）。<br>
5. <strong>发送 HTTP 请求</strong>：构造请求行 + 请求头（+ body）发出去（第03讲）。<br>
6. <strong>服务端处理并返回响应</strong>：返回状态码 + 响应头 + body。<br>
7. <strong>浏览器渲染</strong>：解析 HTML、构建 DOM/CSSOM、加载子资源（可能触发新一轮请求）。<br>
8. <strong>连接处理</strong>：Keep-Alive 复用连接，或按需关闭（第06讲四次挥手）。
</div>

```text
输入URL
  │
  ├─ 1. URL解析 + 查缓存(强缓存命中直接用本地)
  ├─ 2. DNS: 域名 → IP        (浏览器/系统/本地DNS/递归)
  ├─ 3. TCP三次握手            (和 IP:端口 建连)
  ├─ 4. TLS握手               (HTTPS: 协商密钥+校验证书)
  ├─ 5. 发HTTP请求            (请求行+头+body)
  ├─ 6. 服务端返回响应         (状态码+头+body)
  ├─ 7. 浏览器渲染            (解析HTML/加载子资源, 可能再发请求)
  └─ 8. 连接复用或关闭         (Keep-Alive / 四次挥手)
```

<div class="niv-why">
<strong>答这题的关键是「有边界、有顺序、可展开」。</strong>不要一股脑倒知识，而是先报出这条 8 段主线，让面试官知道你脑子里有完整链路；然后主动说「每一段我都可以展开」。面试官往往会挑一段深挖（比如「DNS 具体怎么查」「三次握手为什么三次」），这时你就切到对应讲的细节。主线清晰 + 能随时下钻，就是满分答法。</div>

### 大题二：HTTPS 请求的完整过程<span class="niv-b niv-core">高频必背</span>

本质是在大题一的第 4 步「TLS 握手」上放大。核心记住三件事：**为什么混用两种加密、证书解决什么、握手在协商什么**（第05讲）。

<div class="niv-a">
<strong>标准分层框架：</strong><br>
1. <strong>为什么用 HTTPS</strong>：HTTP 明文传输，会被窃听 / 篡改 / 冒充。HTTPS = HTTP + TLS，解决加密、完整性、身份认证。<br>
2. <strong>为什么混用对称 + 非对称</strong>：非对称加密安全但慢，对称加密快但要安全地共享密钥。方案是用<strong>非对称加密安全地协商出一个对称密钥</strong>，之后的数据传输全用对称密钥加密，兼顾安全与性能。<br>
3. <strong>证书 + CA 解决什么</strong>：防止「协商密钥时对面是冒充的」。服务器把公钥放进由受信任 CA 签发的<strong>数字证书</strong>里，客户端用内置的 CA 公钥验证证书链，确认「这个公钥确实属于这个域名」。<br>
4. <strong>握手在干什么</strong>：校验证书身份 + 协商出双方共享的对称会话密钥。握手完成后进入加密数据传输。TLS 1.3 相比 1.2 简化了握手轮次、更快（具体轮次因版本而异，别硬背固定数字）。
</div>

<div class="niv-why">
<strong>一句话串起来：</strong>用非对称加密安全地交换出一把对称密钥（解决密钥分发难题），用证书 + CA 确认对面身份不是冒充的（解决中间人），握手完成后用对称密钥高速加密传输（解决性能）。三个「为什么」答清楚，这题就稳了。TLS 版本的握手轮次细节取决于具体版本和实现，不确定就说「1.3 比 1.2 更快、握手轮次更少」，不要编造精确交互步骤。</div>

### 大题三：接口很慢怎么排查<span class="niv-b niv-core">高频必背</span>

第12讲的核心题。答法是**分层往下切 + 先测量再下结论**。

<div class="niv-a">
<strong>标准分层框架：</strong>先用 <code>curl -w</code> 把各阶段耗时拆开，定位慢在哪一层，再深入那一层。<br>
1. <strong>DNS 慢</strong>：解析耗时长 → 查解析、换 DNS 对比（<code>dig</code>）。<br>
2. <strong>建连慢</strong>：TCP connect 耗时长 → <code>ping</code> / <code>traceroute</code> 看链路丢包、绕路。<br>
3. <strong>TLS 慢</strong>：握手耗时长 → 看证书链、握手轮次、是否复用会话。<br>
4. <strong>TTFB 长（等响应慢）</strong>：连接建好但服务端迟迟不返回 → 基本是<strong>服务端处理慢</strong>（慢 SQL、下游依赖、线程池满、GC），转去看服务端日志和监控，这已经不是纯网络问题。
</div>

<div class="niv-why">
<strong>这题最容易翻车的地方是「一上来就猜」。</strong>正确姿势是先测量（curl -w 拆阶段耗时），用数据把范围缩小到某一层，再深入。同时要能区分「网络链路问题」和「服务端处理慢」：前者是 DNS/建连/链路，后者体现为 TTFB 长。答出「先分层定位再下钻」这个方法论，比记住命令更重要。</div>

### 大题四：TCP 和 UDP 怎么选<span class="niv-b niv-core">高频必背</span>

第06、08讲。先摆区别表，再落到「选型看要不要可靠」。

| 对比维度 | TCP | UDP |
| --- | --- | --- |
| 连接 | 面向连接（三次握手） | 无连接，直接发 |
| 可靠性 | 可靠：确认重传、按序到达 | 不可靠：可能丢、可能乱序 |
| 传输单位 | 面向字节流（有粘包问题） | 面向报文（一个包一个边界） |
| 流量/拥塞控制 | 有（滑动窗口 + 拥塞控制） | 无 |
| 头部开销 | 较大（20 字节起） | 小（8 字节） |
| 速度/时延 | 相对慢、时延波动大 | 快、时延低 |
| 典型场景 | HTTP、文件传输、要求不丢数据的场景 | DNS、音视频、游戏、直播、QUIC |

<div class="niv-a">
<strong>选型一句话：</strong>要「不丢、按序、可靠」→ 选 TCP；要「快、低时延、丢一点无所谓 / 自己在应用层补可靠」→ 选 UDP。UDP 快是因为它砍掉了握手、确认重传、拥塞控制这些开销；但也因此不可靠，需要业务自己权衡或在应用层补齐（QUIC 就是在 UDP 上用户态重建了可靠性 + 多路复用，见第08讲）。
</div>

### 大题五：HTTP/1.1、HTTP/2、HTTP/3 对比<span class="niv-b niv-core">高频必背</span>

第04讲。核心主线是**队头阻塞在一步步被解决**。

| 对比维度 | HTTP/1.1 | HTTP/2 | HTTP/3 |
| --- | --- | --- | --- |
| 底层传输 | TCP | TCP | QUIC（基于 UDP） |
| 并发方式 | 一个连接一次一个请求，靠多开连接 | 一个连接多路复用（多 stream 并行） | 一个连接多路复用（QUIC stream） |
| 报文格式 | 文本 | 二进制分帧 | 二进制分帧 |
| 头部压缩 | 无（头部冗余大） | 有（HPACK） | 有（QPACK） |
| 队头阻塞 | 应用层就有（一个响应堵住后面） | 应用层解决了，但仍有 <strong>TCP 层</strong>队头阻塞 | 基本解决（QUIC 各 stream 独立，丢包不互相阻塞） |
| 建连 | TCP 握手（+TLS） | TCP 握手（+TLS） | QUIC 握手更快，支持 0-RTT |

<div class="niv-why">
<strong>为什么 HTTP/2 多路复用了还会阻塞？</strong>因为 HTTP/2 是在<strong>一条 TCP 连接</strong>上跑多个逻辑流。应用层不再排队了，但 TCP 保证「按序交付」：只要底层某个 TCP 报文丢了，后面已经到达的数据也必须等它重传补上才能交给上层，于是所有流一起卡住。这就是 <strong>TCP 层队头阻塞</strong>。<br>
<strong>为什么 HTTP/3 改用 UDP？</strong>因为要绕开 TCP 的这个限制。QUIC 基于 UDP，在用户态自己实现可靠性和多路复用，各个 stream 相互独立，某个 stream 丢包只影响它自己，不阻塞其他 stream。UDP 只是「地基」，可靠性由 QUIC 在上面重建（第08讲）。</div>

### 大题六：登录状态怎么保持<span class="niv-b niv-core">高频必背</span>

第10讲。HTTP 本身无状态，登录态靠「一个凭证在多次请求间携带」来维持。

| 方案 | 状态存哪 | 有无状态 | 分布式友好 | 主动登出 |
| --- | --- | --- | --- | --- |
| Cookie + Session | 服务端存 Session，客户端只存 SessionID | 有状态（服务端存） | 差（需共享 Session / 粘性会话） | 容易（服务端删 Session 即可） |
| Token / JWT | 状态编码进 Token 本身，服务端不存 | 无状态 | 好（服务端不用存，天然可横向扩展） | 难（签发后自带效力，需黑名单等额外机制） |

<div class="niv-a">
<strong>标准分层框架：</strong>因为 HTTP 无状态，登录后服务端要给客户端一个凭证，客户端每次请求带上它来证明「我是刚才登录的那个人」。<br>
1. <strong>Cookie + Session</strong>：服务端存会话数据，把 SessionID 通过 Cookie 发给浏览器，之后自动随请求带回。有状态，分布式下要解决 Session 共享。<br>
2. <strong>Token / JWT</strong>：把身份信息（+签名）编码进 Token，服务端不存、只验签。无状态，天生适合分布式；代价是签发后<strong>难以主动作废</strong>（JWT 在过期前一直有效），要主动登出得配合黑名单 / 短有效期 + refresh token。<br>
3. <strong>Cookie 安全</strong>：配 <code>HttpOnly</code>（防 XSS 读取）、<code>Secure</code>（只走 HTTPS）、<code>SameSite</code>（防 CSRF）。
</div>

## 🔍 场景追问：面试官会顺着问

<div class="niv-scene"><strong>追问：</strong>「输入 URL」这题，如果我让你只挑一步深入讲，你会挑哪步？（考察你是否真懂而非背诵）</div>

要点（挑一步下钻，展示深度）：

- 稳妥挑 DNS 或三次握手，这两步细节最多、最能展示。
- 挑 DNS：讲递归 vs 迭代、缓存层级（浏览器→系统→本地 DNS→根/顶级/权威）、TTL、UDP 为主超 512 字节走 TCP（第09讲）。
- 挑三次握手：讲为什么是三次（确认双方收发能力、同步初始序列号 ISN）、握手失败会怎样、半连接队列（第06、07讲）。
- 关键是「点到主线里的哪一段，再展开」，而不是脱离主线单独背一个知识点。

<div class="niv-scene"><strong>追问：</strong>HTTPS 既然用了对称加密传数据，为什么还需要非对称加密和证书？</div>

要点（把三层作用讲清）：

- 非对称加密的作用是「安全地把对称密钥协商 / 传给对方」，解决对称加密的密钥分发难题；数据传输本身仍用对称加密（快）。
- 证书 + CA 的作用是「确认协商密钥的对面不是冒充的」，防止中间人。没有证书，即使加密了，你也可能在和攻击者安全通信。
- 一句话：非对称解决「密钥怎么安全给你」，证书解决「你到底是不是你」，对称解决「传输够不够快」，三者各司其职。

<div class="niv-scene"><strong>追问：</strong>接口慢，你怎么区分是「网络问题」还是「服务端问题」？</div>

要点：

- 用 `curl -w` 看 TTFB（首字节时间）：如果 DNS、建连、TLS 都很快，只有 TTFB（等响应）很长，那连接早就建好了，慢在服务端处理，属于服务端问题（慢 SQL、下游依赖、线程池 / GC）。
- 如果慢在 DNS 解析、TCP 建连或链路（traceroute 看到某跳丢包 / 高延迟），那是网络链路问题。
- 核心是先测量拆阶段，用数据说话，别一上来猜「是不是网络抖动」。

<div class="niv-scene"><strong>追问：</strong>既然 HTTP/2 已经多路复用了，为什么还要搞 HTTP/3？</div>

要点：

- HTTP/2 解决了应用层队头阻塞，但它跑在单条 TCP 上，TCP 的「按序交付」导致底层一个包丢了，所有流都得等重传，这是 TCP 层队头阻塞。
- HTTP/3 用 QUIC（基于 UDP），各 stream 独立，某个 stream 丢包不影响其他 stream，从根上绕开了 TCP 层队头阻塞；还带来更快的握手和 0-RTT、连接迁移。
- 一句话：HTTP/3 是为了解决 HTTP/2 无法解决的 TCP 层队头阻塞。

<div class="niv-scene"><strong>追问：</strong>用了 JWT，用户点「退出登录」怎么让 Token 立刻失效？</div>

要点（点出 JWT 的固有短板）：

- JWT 无状态、服务端不存，一旦签发，在过期前默认一直有效，这就是它「难以主动登出」的固有问题。
- 常见做法：服务端维护一个「失效名单 / 黑名单」，登出时把该 Token 加进去，每次校验时查一下（但这其实又引入了服务端状态，是一种折中）。
- 或者用「短有效期 access token + refresh token」：access token 很快过期，登出时作废 refresh token，让它无法续期。
- 要点明：这正是 JWT 无状态带来的取舍，不能既要完全无状态又要即时撤销。

## 🛠 动手验证（可选做）

综合题最好的验证方式是把「输入 URL 后发生了什么」用一条命令拆开看，各阶段耗时对应主线的各段。

```bash
# 用 curl -w 把一次请求拆成主线各阶段, 对照大题一的 8 段主线看
curl -s -o /dev/null -w \
"DNS解析(第2段):   %{time_namelookup}s\nTCP建连(第3段):   %{time_connect}s\nTLS握手(第4段):   %{time_appconnect}s\n首字节TTFB(第6段): %{time_starttransfer}s\n总耗时:          %{time_total}s\n协议版本:        %{http_version}\nHTTP状态:        %{http_code}\n" \
https://www.example.com/
```

```bash
# 看当前请求走的是 HTTP/2 还是 HTTP/1.1 (--http2 显式协商, 对照大题五)
curl -sI --http2 https://www.example.com/ | head -n 1
```

```bash
# 看 HTTPS 证书信息 (对照大题二: 证书 + CA 那一段)
openssl s_client -connect www.example.com:443 -servername www.example.com </dev/null 2>/dev/null \
  | openssl x509 -noout -subject -issuer -dates
```

<div class="niv-why">
建议对照大题一的主线看 <code>curl -w</code> 的输出：<code>time_namelookup</code> 是 DNS（第2段），<code>time_connect</code> 是 TCP 建连（第3段），<code>time_appconnect</code> 是 TLS 握手完成（第4段），<code>time_starttransfer</code> 是拿到首字节（第6段）。把抽象的主线和真实耗时对上，你在面试里讲起来就有画面感，不再是干背。</div>

## 🧨 高频翻车点

<div class="niv-trap">
<strong>翻车 1：综合题一上来就狂倒细节，没有主线。</strong>面试官问「输入 URL 后发生了什么」，你直接开始讲三次握手的每个标志位，结果 DNS 忘了说、渲染也没提，显得没有全局观。正确：先报出完整主线（8 段），再说「哪段可以展开」，让对方来挑，主线清晰才是加分项。
</div>

<div class="niv-trap">
<strong>翻车 2：说「HTTP/3 用 UDP，所以不可靠」。</strong>正确：HTTP/3 基于 UDP，但可靠性由 QUIC 在用户态重建（确认重传、有序交付、拥塞控制都有），并不是不可靠。用 UDP 只是为了绕开 TCP 层队头阻塞和固化的内核实现，可靠性一点没少。
</div>

<div class="niv-trap">
<strong>翻车 3：说「JWT 比 Session 更安全 / 更好」。</strong>正确：两者是取舍，不是谁绝对好。JWT 无状态、利于分布式扩展，但难以主动撤销、Token 一旦泄露在过期前都有效；Session 有状态、分布式要共享，但能即时登出、便于集中管理。按场景选，别一律吹 JWT。
</div>

## 🎤 面试话术模板

<div class="niv-a">
<strong>30 秒口述版（以「输入 URL」为例，其他综合题同理套「先框架后下钻」）：</strong>我会先给一条完整主线：浏览器先解析 URL 并查缓存，然后 DNS 把域名解析成 IP，接着和目标 IP 端口做 TCP 三次握手，如果是 HTTPS 再做 TLS 握手协商密钥、校验证书，之后发送 HTTP 请求，服务端返回状态码和响应，浏览器解析 HTML、加载子资源并渲染，最后连接靠 Keep-Alive 复用或关闭。这八段里任意一段我都能展开：比如 DNS 的递归迭代和缓存层级、三次握手为什么是三次、TLS 为什么混用对称和非对称加密。答综合题我的习惯是先摆出清晰框架，再根据追问下钻到某一层，同时区分现象在哪一层，比如接口慢我会先用 curl -w 拆各阶段耗时定位是网络还是服务端。核心就是有主线、能展开、用数据说话。
</div>

## ✅ 自测三问

1. 「输入 URL 后发生了什么」的主线有哪几段？答这题的关键姿势是什么？
2. HTTP/2 已经多路复用了，为什么还有队头阻塞？HTTP/3 怎么解决？
3. Cookie+Session 和 Token/JWT 的核心区别是什么？JWT 为什么难以主动登出？

<details class="niv-fold"><summary>对答案</summary>

1. 主线（8 段）：URL 解析 + 查缓存 → DNS 解析 → TCP 三次握手 → TLS 握手（HTTPS）→ 发 HTTP 请求 → 服务端返回响应 → 浏览器渲染并加载子资源 → 连接复用或关闭。关键姿势是「先报完整主线、有边界有顺序，再根据追问下钻到某一段」，不要一上来堆细节。
2. HTTP/2 在单条 TCP 连接上多路复用，解决了应用层队头阻塞，但 TCP 保证按序交付，底层一个包丢了、后面已到达的数据也要等它重传，所有流一起卡住，这是 TCP 层队头阻塞。HTTP/3 改用基于 UDP 的 QUIC，各 stream 相互独立，某个 stream 丢包只影响自己、不阻塞其他 stream，从而绕开了 TCP 层队头阻塞。
3. Cookie+Session 是有状态的：服务端存会话数据，客户端只拿 SessionID，分布式下需要共享 Session，但能即时登出。Token/JWT 是无状态的：身份信息编码进 Token、服务端只验签不存储，天然适合分布式扩展，但签发后在过期前默认一直有效，服务端没存它就无法直接作废，所以难以主动登出，需要黑名单或短有效期 + refresh token 来折中。

</details>

## 📦 复制带走

<div class="niv-card">
<strong>综合题通用答法：</strong>先给分层框架（有边界、有顺序），再逐层填内容，最后停在场景，让面试官挑一段来追问、你再下钻。主线清晰 > 细节堆砌。
</div>

<div class="niv-card">
<strong>输入 URL 主线（8 段）：</strong>URL 解析+查缓存 → DNS → TCP 三次握手 → TLS 握手 → 发 HTTP 请求 → 服务端响应 → 渲染+加载子资源 → 连接复用/关闭。
</div>

<div class="niv-card">
<strong>TCP vs UDP 选型：</strong>要可靠、按序、不丢 → TCP；要快、低时延、丢点无所谓或应用层自己补 → UDP。UDP 快因为砍了握手 / 重传 / 拥塞控制，QUIC 在 UDP 上重建可靠性。
</div>

<div class="niv-card">
<strong>H1/H2/H3 一条线：</strong>队头阻塞被逐步解决。1.1 应用层排队 → 2 多路复用但仍有 TCP 层队头阻塞 → 3 用 QUIC(UDP) 各 stream 独立、丢包不互堵，还带 0-RTT。
</div>

<p style="margin-top:24px"><a href="/courses/net-interview/">← 回到《秋招计网面试实战课》目录</a></p>
