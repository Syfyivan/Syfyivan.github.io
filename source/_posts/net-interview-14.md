---
title: "《秋招计网面试实战课》第14讲 · 模拟面试题库（基础题、追问题、场景题、项目结合题）"
date: 2026-07-09 22:00:00
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
这是全课最后一讲，不再讲新知识，而是把前面十三讲揉成一套「模拟面试题库」让你自测。真实面试就是这样一层层推进：先来两句基础定义看你会不会，答对了立刻追问「为什么」「换个场景呢」，最后落到你简历里的项目问「你这里的网络是怎么处理的」。下面按基础题、追问题、场景题、项目结合题四类给你出题，每道题先自己张嘴说一遍，再点开折叠对照参考要点。答不上来的，回对应讲次补。最后一节专门教你怎么把计网知识自然地缝进自己的项目讲述里，这才是拉开差距的地方。
</div>

## 🎯 怎么用这份题库

- 每道题先合上答案，出声讲一遍（面试是说出来，不是想明白就行）。
- 说完再点开折叠对答案，重点看「有没有讲到关键词」和「有没有讲错」。
- 讲错 / 答不出的，记下来回对应讲次重看，别囫囵背答案。
- 四类题难度递进：基础题(定义) → 追问题(为什么) → 场景题(怎么排) → 项目结合题(结合你自己)，模拟真实面试节奏。

## 📖 第一类 · 基础题（定义与概念）<span class="niv-b niv-core">高频必背</span>

这类题考「你到底懂不懂概念」，要求定义准确、能一句话说清。答得磕巴，后面根本没机会。

<div class="niv-q">
Q1. 说一下从输入 URL 到页面显示，中间发生了什么？
</div>

<details class="niv-fold"><summary>参考答案要点</summary>

分层串起来讲（对应第02讲）：

1. URL 解析：浏览器解析出协议、域名、端口、路径。
2. DNS 解析：把域名解析成 IP（先查浏览器 / 系统 / hosts 缓存，没有再走本地 DNS 递归查询）。
3. TCP 建连：和目标 IP 的端口做三次握手。
4. TLS 握手（HTTPS 才有）：协商密钥、验证证书。
5. 发 HTTP 请求 → 服务端处理 → 返回响应。
6. 浏览器渲染：解析 HTML、构建 DOM/CSSOM、布局、绘制；期间对 CSS/JS/图片等资源再发请求。
7. 连接复用：Keep-Alive 复用 TCP 连接，避免每个资源都重新建连。

关键是分层、有顺序、能点到每一段，不用每段展开很深，但边界要清楚。

</details>

<div class="niv-q">
Q2. TCP 和 UDP 有什么区别？
</div>

<details class="niv-fold"><summary>参考答案要点</summary>

对应第06、08讲。核心对比：

- 连接：TCP 面向连接（先三次握手），UDP 无连接（直接发）。
- 可靠性：TCP 可靠（确认重传、按序到达、去重），UDP 不可靠（尽力而为，可能丢 / 乱序 / 重复）。
- 传输方式：TCP 面向字节流（所以有「粘包」问题，本质是流没有消息边界），UDP 面向报文（一个包一个包，有边界）。
- 拥塞 / 流量控制：TCP 有（滑动窗口 + 拥塞控制），UDP 没有，所以更快、开销更小。
- 头部开销：TCP 头至少 20 字节，UDP 头固定 8 字节。
- 适用：TCP 用在要求可靠的场景（网页、文件、大多数 API）；UDP 用在要求低延迟、可容忍少量丢包的场景（DNS、音视频、游戏、QUIC）。

</details>

<div class="niv-q">
Q3. HTTP 和 HTTPS 的区别？HTTPS 为什么安全？
</div>

<details class="niv-fold"><summary>参考答案要点</summary>

对应第05讲。

- HTTPS = HTTP + TLS，在 HTTP 和 TCP 之间加了一层 TLS 做加密和身份验证；HTTP 默认 80 端口，HTTPS 默认 443。
- 安全体现在三点：机密性（内容加密，中间人看不懂）、完整性（防篡改）、身份认证（通过证书确认对方是不是真的目标服务器）。
- 加密方式：握手阶段用非对称加密安全地协商出对称密钥，之后用对称加密传数据。原因是非对称慢、对称快，用非对称解决「密钥怎么安全交换」，用对称解决「大量数据高效加密」。
- 身份靠数字证书 + CA 信任链：服务器出示由受信任 CA 签发的证书，客户端用内置的根 CA 验证证书链是否可信。

</details>

<div class="niv-q">
Q4. 常见的 HTTP 状态码有哪些，分别代表什么？
</div>

<details class="niv-fold"><summary>参考答案要点</summary>

对应第03讲。按类分：

- 1xx 信息、2xx 成功（200 OK、204 无内容）、3xx 重定向、4xx 客户端错误、5xx 服务端错误。
- 301 永久重定向 vs 302 临时重定向：301 会被缓存 / 影响 SEO，302 表示临时。
- 304 Not Modified：协商缓存命中，资源没变，用本地缓存（对应第11讲）。
- 403 禁止访问（有权限概念，服务器懂你但拒绝）、404 找不到资源。
- 500 服务器内部错误、502 网关拿到坏响应 / 上游挂、504 网关等上游超时（502 vs 504 是重点，对应第12讲）。

</details>

<div class="niv-q">
Q5. DNS 用的是 TCP 还是 UDP？
</div>

<details class="niv-fold"><summary>参考答案要点</summary>

对应第09讲。

- 以 UDP 为主：普通域名查询用 UDP（端口 53），因为查询和响应通常很小，UDP 无需建连、更快。
- 两种情况用 TCP：一是响应报文过大（传统上超过 512 字节的界限，触发 TC 截断标志后客户端改用 TCP 重查）；二是区域传送（主从 DNS 同步数据，数据量大且要求可靠）。
- 补充加分：现代还有 DoT（DNS over TLS）、DoH（DNS over HTTPS）用于加密 DNS，走 TCP/TLS，但这属于隐私增强，不是传统 UDP/TCP 选择的原因。

</details>

<div class="niv-q">
Q6. Cookie 和 Session 有什么区别？
</div>

<details class="niv-fold"><summary>参考答案要点</summary>

对应第10讲。

- Cookie 存在客户端（浏览器），Session 数据存在服务端，客户端通常只拿一个 Session ID（往往就放在 Cookie 里带回来）。
- Cookie 有大小限制、可被用户查看 / 篡改，敏感数据不能直接放；Session 数据在服务端更安全。
- Session 是有状态的：服务端要存会话，分布式部署下需要共享存储（如 Redis）或粘性会话，否则换台机器就找不到会话。
- 对比 Token/JWT：Token 是无状态方案，服务端不存会话，靠签名自验证，适合分布式 / 前后端分离，代价是签发后难以主动撤销。

</details>

## 🔍 第二类 · 追问题（为什么 / 深一层）<span class="niv-b niv-key">场景追问</span>

基础题答对了，面试官立刻追一句「为什么」。这类题是筛人的关键，背定义没用，得懂原理。

<div class="niv-q">
Q7. TCP 为什么是三次握手，两次不行吗？四次呢？
</div>

<details class="niv-fold"><summary>参考答案要点</summary>

对应第06讲。

- 核心目的：让双方都确认「我能发、我能收；对方能发、对方能收」，并同步各自的初始序列号 ISN。
- 两次不行：只有两次的话，服务端无法确认客户端是否收到了自己的 SYN-ACK，客户端的接收能力没被确认；而且历史的、延迟到达的旧 SYN 可能让服务端误建连接，造成资源浪费（这就是「防止已失效的连接请求突然又到达」）。
- 四次没必要：服务端的 ACK 和 SYN 可以合并成一个包发（SYN-ACK），所以三次就够，不用拆成四次。
- 顺带：ISN 是随机的，作用是防止旧连接的数据串到新连接、以及增加安全性。

</details>

<div class="niv-q">
Q8. TIME_WAIT 是什么？为什么要等 2MSL？大量 TIME_WAIT 说明什么？
</div>

<details class="niv-fold"><summary>参考答案要点</summary>

对应第06讲。

- TIME_WAIT 出现在主动关闭连接的一方，在发出最后一个 ACK 后进入，等待一段时间才彻底关闭。
- 等 2MSL（MSL = 报文最大生存时间，具体秒数取决于操作系统实现，不要背死一个数）的原因有两个：一是保证最后那个 ACK 能可靠到达对端（万一丢了，对端会重发 FIN，本端还能重发 ACK）；二是让本次连接的旧报文在网络中自然消亡，避免串到后续用相同四元组的新连接里。
- 大量 TIME_WAIT 通常出现在主动关闭连接很频繁的一方，常见于高并发短连接的客户端 / 反向代理。它一般不是「故障」，但会占用端口 / 连接资源。缓解思路：用长连接 / 连接池减少频繁开关连接；不要盲目改内核参数去「复用」，那要理解清楚副作用。

</details>

<div class="niv-q">
Q9. CLOSE_WAIT 堆积是谁的锅？
</div>

<details class="niv-fold"><summary>参考答案要点</summary>

对应第06讲。

- CLOSE_WAIT 出现在被动关闭方：对端发来 FIN、本端回了 ACK 后进入 CLOSE_WAIT，等待本端应用调用 close 再发自己的 FIN。
- 如果 CLOSE_WAIT 大量堆积不消失，说明本端应用收到了对方的关闭，却迟迟没有调用 close（比如代码没关连接、连接泄漏、线程卡住没走到关闭逻辑）。
- 所以 CLOSE_WAIT 堆积基本是「本端自己的锅」，是应用层没正确关闭连接的信号，要去查代码里的连接释放逻辑，而不是怪网络或对端。

</details>

<div class="niv-q">
Q10. HTTP/2 已经多路复用了，为什么还有队头阻塞？HTTP/3 怎么解决？
</div>

<details class="niv-fold"><summary>参考答案要点</summary>

对应第04、08讲。

- HTTP/1.1 的队头阻塞在应用层：一个连接上请求要排队，前一个响应没回来后面的干等。
- HTTP/2 用多路复用把多个请求 / 响应拆成流并发在一个 TCP 连接上，解决了 HTTP 层的队头阻塞。但它跑在 TCP 上，TCP 要求字节按序交付，一旦某个 TCP 段丢了，整个连接上所有流都得等这个段重传补齐，这就是 TCP 层的队头阻塞。
- HTTP/3 把传输层换成基于 UDP 的 QUIC。QUIC 在用户态实现多路复用，各个流独立管理，一个流丢包只影响它自己，不会卡住其他流，从而消除了 TCP 层的队头阻塞。
- 补充：QUIC 还带来更快的握手（1-RTT，甚至恢复连接时 0-RTT）和连接迁移（换网络 IP 变了连接不断）。

</details>

<div class="niv-q">
Q11. 流量控制和拥塞控制有什么区别？
</div>

<details class="niv-fold"><summary>参考答案要点</summary>

对应第07讲。

- 流量控制解决的是「接收方处理不过来」的问题：接收方通过滑动窗口（通告 window 大小）告诉发送方还能收多少，防止发太快把接收缓冲区撑爆。是端到端、发送方和接收方之间的事。
- 拥塞控制解决的是「网络中间链路堵了」的问题：发送方根据丢包 / 延迟等信号推断网络拥塞程度，动态调整发送速率，避免把网络压垮。经典四阶段：慢启动、拥塞避免、快重传、快恢复。
- 一句话：流量控制是照顾接收方，拥塞控制是照顾整个网络。两者同时作用，实际发送窗口取二者的较小值。

</details>

<div class="niv-q">
Q12. 抓包工具为什么能看到 HTTPS 的明文？这不是破解加密了吗？
</div>

<details class="niv-fold"><summary>参考答案要点</summary>

对应第05讲。

- 不是破解加密，而是做了「中间人」，前提是你在本机主动信任了它的自签根证书。
- 流程：抓包工具在本地生成一个根证书并让你安装到系统信任列表；之后它拦在你和服务器中间，对你伪装成服务器（用它自己签发的证书，因为你信任了它的根证书，所以浏览器不报错），对服务器伪装成客户端。于是它左右各建一条 TLS，中间就能看到明文。
- 关键点：这依赖「你自己安装并信任了它的根证书」。如果不安装，浏览器会因为证书不被信任而报错。所以它没有破解 TLS，只是利用了你授予的信任。这也说明证书信任体系的重要性。

</details>

<div class="niv-q">
Q13. JWT 能主动登出吗？登录态为什么会失效？
</div>

<details class="niv-fold"><summary>参考答案要点</summary>

对应第10讲。

- JWT 是无状态的：服务端不存它，只靠签名验证有效性。所以标准 JWT 在签发后、过期前，服务端无法直接让某个 token「立刻失效」，这就是「不可撤销」问题。
- 想要主动登出 / 踢人，常见做法是引入服务端状态：维护一个黑名单 / 吊销列表，或者用短有效期 access token + refresh token，登出时让 refresh token 失效。但这其实又回到了有状态，属于取舍。
- 登录态失效的常见原因：token / session 过期；服务端主动清了会话；密钥轮换导致旧签名验不过；Cookie 被清除或域 / 路径 / SameSite 设置导致没带上；分布式下会话没共享，换台机器找不到 session。

</details>

## 🛠 第三类 · 场景题（怎么定位 / 怎么排查）<span class="niv-b niv-key">场景追问</span>

这类题考「知识能不能落地」。答题套路是先给分层 / 分类框架，再说具体动作，别一上来乱猜。

<div class="niv-q">
Q14. 一个接口很慢，从网络角度你怎么一步步排查？
</div>

<details class="niv-fold"><summary>参考答案要点</summary>

对应第12讲。先测量再分层，别猜：

1. 先用 `curl -w` 拆各阶段耗时（DNS 解析 / TCP 连接 / TLS 握手 / 首字节 TTFB / 总耗时），一眼看出慢在哪一段。
2. DNS 慢：查解析（dig，换个 DNS 对比）。
3. 建连慢：ping / traceroute 看链路时延和丢包 / 绕路。
4. TLS 慢：看握手轮次、证书链是否要额外验证。
5. TTFB 长（连上了但迟迟不返回）：基本是服务端处理慢，转去看服务端日志和监控（慢 SQL、下游依赖慢、线程池满、Full GC），这已经不是纯网络问题。

核心：先分层定位是「网络链路慢」还是「服务端处理慢」，缩小范围再深入。

</details>

<div class="niv-q">
Q15. 服务端出现大量 CLOSE_WAIT，你怎么定位？
</div>

<details class="niv-fold"><summary>参考答案要点</summary>

对应第06讲。

- 先确认状态：用 `ss -ant` 或 `netstat -ant` 统计各 TCP 状态数量，确认确实是 CLOSE_WAIT 堆积。
- 判断责任方：CLOSE_WAIT 在被动关闭方，说明对端已经关了、本端应用没调用 close。所以问题在本端应用代码。
- 定位方向：查本端服务里有没有连接用完不关（数据库连接、HTTP client、下游 RPC 连接泄漏），或者某段逻辑卡住 / 异常导致没走到关闭；结合线程栈看是不是卡在某处。
- 别乱改内核参数，这不是内核问题，是应用没正确释放连接。

</details>

<div class="niv-q">
Q16. 前端调接口报跨域，怎么解决？能靠前端改吗？
</div>

<details class="niv-fold"><summary>参考答案要点</summary>

对应第12讲。

- 先说本质：跨域是浏览器同源策略的限制（协议 / 域名 / 端口任一不同即跨域），请求其实往往已经到服务端并返回了，只是浏览器因响应缺少 CORS 头，把结果拦下不给页面 JS 读。用 curl / Postman 不会跨域。
- 根治：服务端在响应头加 `Access-Control-Allow-Origin` 等 CORS 字段（或由网关统一加）；非简单请求还会先发 OPTIONS 预检，服务端要正确响应预检的 Allow-Methods / Allow-Headers。
- 开发期变通：本地用 devServer 代理走同源转发；线上用 Nginx 反代把接口挂到同一域名下。但这些是「绕开同源」，真正授权还是服务端说了算。
- 别把 JSONP 当唯一答案：老技术、只支持 GET、有安全问题，现代用 CORS。

</details>

<div class="niv-q">
Q17. 用户反馈网站打不开，你手上只有一台能上网的机器，怎么初步定位？
</div>

<details class="niv-fold"><summary>参考答案要点</summary>

对应第12讲。把命令串成分层排查：

- `ping 域名`：先看能不能解析 + 通不通。报「无法解析主机」→ DNS 问题；能解析但全超时 → 网络不通或对方禁 ICMP（注意 ping 不通不代表挂了）。
- `dig 域名`：确认解析出的 IP 对不对，是不是解析被污染 / 指错了。
- `nc -vz ip 443` 或 `telnet ip 443`：测目标端口通不通，排查端口 / 防火墙。
- `traceroute 域名`：看路由走到哪一跳断 / 变慢，判断是本地、中间链路还是接近目标处出问题。
- `curl -v https://域名/`：看完整过程卡在 DNS、连接、TLS 还是拿到了状态码，直接定位到层。

强调分层、每一步排除一种可能。

</details>

<div class="niv-q">
Q18. 你改了 DNS 解析记录，但部分用户还在访问旧 IP，为什么？
</div>

<details class="niv-fold"><summary>参考答案要点</summary>

对应第09、11讲。

- 核心原因是 DNS 缓存 + TTL。DNS 记录有多级缓存：浏览器缓存、操作系统缓存、本地 DNS（运营商 / 公共 DNS）缓存。每条记录带 TTL，在 TTL 到期前，缓存里还是旧 IP，用户就会继续访问旧地址。
- 所以修改解析后不会全网立刻生效，要等各级缓存的 TTL 过期。
- 实践建议：计划切换 IP 前，提前把该记录的 TTL 调小（比如降到很短），等生效后再改 IP，这样切换后旧缓存很快过期，收敛更快；切完再把 TTL 调回正常。
- 补充：有的本地 DNS 不严格遵守 TTL，或用户手动配了 hosts，也会导致个别用户长期访问旧 IP。

</details>

## 🧩 第四类 · 项目结合题（把计网缝进你的经历）<span class="niv-b niv-adv">进阶加分</span>

这类是校招拉开差距的题：面试官指着你简历上的项目问「你这块网络是怎么做的」。答不出等于项目白写。下面是几个通用问法和参考思路，套进你真实的项目细节里讲。

<div class="niv-q">
Q19. 你项目里前后端是怎么通信的？为什么这么选？
</div>

<details class="niv-fold"><summary>参考答案要点</summary>

要能把技术选型和计网知识挂上钩：

- 说清用的是什么：HTTP/HTTPS 的 REST 接口、还是 WebSocket、还是 RPC；数据格式（JSON 等）。
- 讲为什么：普通请求 / 响应式交互用 HTTP 就够（对应第03讲）；需要服务端主动推送 / 实时双向（聊天、通知）才上 WebSocket；内部服务间高性能调用可能用 RPC。
- 加分点：提到用了 HTTPS 保证传输安全（第05讲）、用 Keep-Alive / 连接复用减少建连开销（第03、11讲）、接口做了缓存（强缓存 / 协商缓存，第11讲）。
- 关键：不要只说「用了 axios 调接口」，要能说出背后走的是 HTTP、为什么够用、有没有性能 / 安全上的考虑。

</details>

<div class="niv-q">
Q20. 你项目的登录 / 鉴权是怎么做的？
</div>

<details class="niv-fold"><summary>参考答案要点</summary>

对应第10讲，套进你的真实实现：

- 说清方案：是 Session + Cookie（有状态，会话存服务端 / Redis），还是 Token / JWT（无状态，前端存着每次带上）。
- 讲取舍：前后端分离 / 多端 / 分布式部署，为什么倾向 Token（不用共享 session）；单体、需要能随时踢人下线，为什么 Session 更省心（能主动失效）。
- 安全细节能加分：Cookie 设了 HttpOnly（防 XSS 偷）、Secure（只走 HTTPS）、SameSite（防 CSRF）；Token 放哪、怎么防 XSS；有没有做过期 / 刷新机制。
- 如果用 JWT，主动提一句「JWT 不可撤销」的问题和你的处理（短有效期 + refresh、或黑名单），说明你想过它的坑。

</details>

<div class="niv-q">
Q21. 你项目做过哪些性能 / 网络优化？
</div>

<details class="niv-fold"><summary>参考答案要点</summary>

对应第11讲，挑你真做过的讲，别硬编：

- 缓存：静态资源用强缓存（Cache-Control）、接口用协商缓存（ETag / Last-Modified）减少重复传输；讲清强缓存不请求服务器、协商缓存问一下没变就返回 304。
- 连接：开启 Keep-Alive / 用连接池复用连接，减少反复三次握手 + TLS 握手的开销。
- CDN：静态资源上 CDN，就近访问 + 边缘缓存降低延迟和源站压力。
- 传输：开启 gzip / br 压缩减小体积；合并请求、预连接、图片懒加载。
- 协议：升级到 HTTP/2 利用多路复用减少连接数。
- 核心是能说出「优化了什么指标、原理是什么」，而不是罗列名词。没做过的别编，说「了解但项目里没用上」也比编强。

</details>

<div class="niv-q">
Q22. 你项目上线后遇到过什么网络相关的问题，怎么解决的？
</div>

<details class="niv-fold"><summary>参考答案要点</summary>

这是展示工程能力的黄金机会，讲一个真实小故事（STAR 式）：

- 场景：比如「上线后偶发接口 502 / 超时」「切了域名部分用户访问不了」「前端联调一直报跨域」。
- 排查：用上分层思路和命令（curl -v / -w、ping、traceroute、看状态码、看服务端日志），说清你怎么一步步缩小范围的（对应第12讲）。
- 结论 + 修复：定位到根因（比如上游服务挂了导致 502、DNS TTL 没到导致旧 IP、后端没配 CORS 头导致跨域），以及怎么改的。
- 复盘：讲一句你从中学到什么 / 后来怎么预防。
- 提醒：一定要用你真实经历，细节经得起追问。没有真实经历就诚实说「项目里没踩到大坑，但我了解排查思路是……」，切忌编造具体报错和数据。

</details>

## 🎤 如何把计网结合到自己项目里讲

<div class="niv-a">
<strong>三步缝合法：</strong>很多同学项目做得不错，但一被问「你这里网络怎么处理的」就卡壳，是因为平时只用框架、没往协议层想。练一个动作：<strong>拿你简历里每一条项目，问自己三个问题</strong>——(1) 这条功能背后走的是什么协议 / 什么请求？(2) 我为什么这么选，有没有更合适的？(3) 它在性能 / 安全 / 稳定性上有没有可讲的点？把答案提前想好，面试时就能从「我用了 XX 框架」自然过渡到「它底层是 HTTP，我做了缓存和连接复用来优化」。
</div>

<div class="niv-why">
<strong>为什么这样讲能加分？</strong>校招面试官清楚你项目不会多复杂，他真正想确认的是：你是「只会调 API 的人」，还是「知道自己在调什么、为什么这么调」的人。能把项目里一个普通的接口调用，讲出它走 HTTP、用了 HTTPS 加密、开了 Keep-Alive、加了缓存、鉴权用了 Token 并考虑了 Cookie 安全——这就把八股从「背诵」变成了「我真的用过、我懂取舍」，可信度和深度立刻不一样。</div>

<div class="niv-scene"><strong>示范：</strong>把「我做了一个博客系统」升级成有网络深度的讲法。</div>

普通讲法：「我用 Vue + Node 做了一个博客，前端调后端接口拿数据。」

升级讲法（自然缝入计网）：「前后端通过 HTTPS 的 REST 接口通信，数据用 JSON。为了减少延迟，静态资源上了 CDN 并配了强缓存，接口数据用 ETag 做协商缓存，没变就返回 304。鉴权用 JWT，token 存在带 HttpOnly、Secure、SameSite 的 Cookie 里防 XSS 和 CSRF。上线时遇到过一次前端跨域报错，排查发现是后端没配 CORS 响应头，加上 `Access-Control-Allow-Origin` 就好了。」——同样一个项目，后者把第 03、05、10、11、12 讲的知识全用上了。

<div class="niv-a">
<strong>话术提醒：</strong>(1) 只讲你真做过的，编造的一追问就露馅；(2) 主动埋钩子，比如说到「用了 Token」就等着他问「为什么不用 Session」，你早想好答案；(3) 把八股词落到你的场景里，别背课本原句；(4) 遇到没做过的优化，诚实说「了解原理但这个项目规模没必要上」，比硬吹更显成熟。
</div>

## ✅ 结课自测：能独立讲完这 5 道，就出师了

<div class="niv-q">
把这五道当成结课考，不看答案、连续讲完，每道 1-2 分钟：
</div>

<details class="niv-fold"><summary>五道结课大题（含对应讲次）</summary>

1. 输入 URL 后到页面显示，完整讲一遍链路。（第02讲，贯穿全课）
2. HTTPS 从建连到能安全传数据的全过程。（第05讲）
3. 一个接口又慢又偶发报错，你怎么排查。（第12讲）
4. TCP 和 UDP 怎么选，HTTP/1.1、2、3 有什么区别。（第04、08讲）
5. 你项目的登录态和网络优化是怎么做的。（第10、11讲 + 你的项目）

五道都能条理清晰讲完、经得起「为什么」追问，你的计网面试基本稳了。讲不顺的那几道，回对应讲次再过一遍。

</details>

## 📦 复制带走

<div class="niv-card">
<strong>面试四层节奏：</strong>基础题(定义准) → 追问题(讲原理) → 场景题(会排查) → 项目结合题(缝进经历)。层层递进，前一层答砸就没后面了，所以定义一定要张口就来。
</div>

<div class="niv-card">
<strong>答题万能框架：</strong>先给分层 / 分类的结构（如请求链路、分层排障、TCP/UDP 对比），再往里填细节，最后落到场景。有结构比堆知识点更显专业。
</div>

<div class="niv-card">
<strong>项目缝合三问：</strong>每条项目问自己——走什么协议？为什么这么选？性能 / 安全 / 稳定性有什么可讲？答好这三问，就能把八股讲成「我真的懂」。
</div>

<div class="niv-card">
<strong>诚信底线：</strong>不确定的数值说「取决于实现」，没做过的优化说「了解但没用上」，编造的报错和数据一追问就崩。诚实 + 有排查思路，比硬吹更拿分。
</div>

<p style="margin-top:24px"><a href="/courses/net-interview/">← 回到《秋招计网面试实战课》目录</a></p>

全课到这里就结束了。你已经从「知道概念但怕被追问」走到了「有框架、能排查、能结合项目讲」。剩下的就是张开嘴多练几遍，把这些变成你自己的话。祝你秋招顺利，拿到心仪的 offer。
