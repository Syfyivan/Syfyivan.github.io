---
title: "《从 URL 到页面显示》第 05 讲 · TLS 握手"
date: 2026-08-21 13:00:00
tags: [TLS, HTTPS, 加密, 计算机网络, 校招, 面试]
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

传输连接建好了，但走 TCP 时它还是明文的。发任何 HTTP 请求之前，必须先在这条连接上完成 TLS 握手：验证对方是不是真的目标站点，并协商出一把只有双方知道的会话密钥。这一节点的产出，是一条可以安全收发数据的加密通道。

<p class="bc-sec">理解原理</p>

### 从上一节点的输出开始：一条明文的可靠通道

节点四交出一条可靠有序的 TCP 连接。可靠只解决了「不丢、不乱」，没解决「不被看、不被冒充」。链路上的任何一方都能读走明文、甚至冒充服务器。要访问 HTTPS，就得在这条 TCP 连接之上再建一层安全通道，这层就是 **TLS（Transport Layer Security，传输层安全）**。它要一次性解决三个问题：**对方是不是真的它（身份认证）、内容不被偷看（机密性）、内容不被篡改（完整性）。**

主线以现在的默认版本 **TLS 1.3** 来讲，它相比旧版本更快也更安全 <a class="bc-cite" href="https://www.rfc-editor.org/rfc/rfc8446" target="_blank" rel="noopener">[1]</a>。

### 第一步：ClientHello——客户端亮出能力，还顺手交出密钥材料

握手由客户端发起 ClientHello，里面带上：自己支持的 TLS 版本、密码套件列表、一个随机数，以及要访问的域名（SNI，让一台服务器上的多个站点知道你要哪个）。

这里是 TLS 1.3 提速的关键，也是一个常被讲错的点：**TLS 1.3 的主路径用的是 ECDHE 密钥交换，不是 RSA 密钥交换。** 客户端在 ClientHello 里就直接附上自己的 ECDHE 公钥参数（key_share），不等服务器开口就把「造密钥」的材料先递了出去。

### 第二步：ServerHello——服务器选定参数，也交出自己的密钥材料

服务器回 ServerHello，从客户端给的列表里选定 TLS 版本和密码套件，附上自己的随机数和自己的 ECDHE 公钥参数。到这一步，双方都拿到了对方的 ECDHE 公钥。

**ECDHE 的精髓在于：双方各自用自己的私钥和对方的公钥，能独立算出同一个共享密钥，而这个密钥从不在网络上传输。** 路径上的窃听者即使抓到两边的公钥，也算不出这个共享密钥。由此双方各自导出这次会话的对称密钥。

<div class="bc-call bc-bonus"><span class="bc-tag">加分细节</span><strong>前向保密（Forward Secrecy）</strong><br>ECDHE 里的临时私钥用完即弃，每次握手都新生成。这带来一个重要性质：前向保密——即便某天服务器的长期私钥泄露，攻击者也无法用它解开以前录下的流量，因为每次会话的密钥都是临时算出来的、和长期私钥无关。这正是 TLS 1.3 只保留 ECDHE、淘汰 RSA 密钥交换的核心原因：RSA 密钥交换不具备前向保密。</div>

<div class="bc-call bc-impl"><span class="bc-tag">实现细节</span><strong>RSA 在这里到底还管什么</strong><br>淘汰的是「用 RSA 传递/交换密钥」这个动作，不是 RSA 本身。服务器证书里的密钥可能仍是 RSA，用来对握手内容做数字签名以证明「这些密钥材料确实是我发的」。所以准确说法是：TLS 1.3 用 ECDHE 交换密钥、用证书里的密钥（RSA 或 ECDSA）做签名认证，两件事分开。</div>

### 第三步：证书验证——凭什么相信对面就是目标站点

密钥算出来了，但还有个致命问题：跟你算出共享密钥的这一方，真的是 `github.com` 吗？还是一个中间人？解决靠**证书链**：

- 服务器把自己的证书发来，证书里有它的公钥和域名，并由某个**证书颁发机构（CA）**签名。
- 浏览器验证这条签名链：这张证书是被一个受信任的中间 CA 签的，中间 CA 又被根 CA 签，而根 CA 就在操作系统或浏览器预置的信任库里。链条一路验到可信根，才算通过。
- 同时检查证书没过期、没被吊销，且证书里的域名和你要访问的域名匹配。

任何一环不过——链断了、域名对不上、证书过期——浏览器就拦下连接，弹出安全警告。身份认证就是这样落地的：不是「相信对方自称」，而是「相信一条能追溯到可信根的签名链」。

### 第四步：完成握手，切换到加密

双方用算出的对称密钥，加密一条 Finished 消息发给对方并互相校验，确认握手全过程没被篡改、密钥一致。校验通过，握手结束，此后这条连接上的所有数据都用对称密钥加密传输。

之所以最终用对称加密而不是全程非对称：非对称运算慢，只适合用在握手阶段协商密钥和做认证；真正的大量数据传输用快得多的对称加密。**握手用非对称解决「安全地商定一把钥匙」，数据用对称解决「高效地加密海量内容」**——这是 TLS 的基本分工。

<div class="bc-call bc-bonus"><span class="bc-tag">加分细节</span><strong>TLS 1.3 的 1-RTT 与 0-RTT</strong><br>TLS 1.3 把握手压到通常 1 个往返（客户端在 ClientHello 就交出 key_share，省掉旧版的一轮协商）。对于近期连接过的服务器，还支持 0-RTT：客户端在第一个包里就带上加密的应用数据，握手往返进一步省掉。0-RTT 有重放攻击的风险，所以只用于安全的、幂等的请求。</div>

<div class="bc-call bc-branch"><span class="bc-tag">旁支</span><strong>QUIC 没有独立的这一步</strong><br>走 QUIC（HTTP/3）时，TLS 1.3 握手已经内建在节点四的连接握手里，不再单独出现。本节点讲的密钥交换、证书验证逻辑在 QUIC 里同样成立，只是和传输握手合并到了一起。</div>

### 汇总：这一节点交出去的是什么

ClientHello / ServerHello 交换了随机数和 ECDHE 公钥，双方各自算出了从不上网的共享密钥；证书链验证确认了对面确实是目标站点；Finished 校验确认握手没被篡改。到这里，网络服务手里是一条**已认证、已加密的安全通道**。

现在，也只有到现在，才终于可以发出这次访问真正的目的——一个 HTTP 请求。这是节点六。

<p class="bc-sec">主线整理</p>

```text
TCP 连接建好，但还是明文
        ↓ 需身份认证 + 机密性 + 完整性
ClientHello：版本/密码套件/随机数/SNI + 客户端 ECDHE 公钥
        ↓ TLS 1.3 主路径用 ECDHE，不是 RSA 密钥交换
ServerHello：选定参数/随机数 + 服务器 ECDHE 公钥
        ↓ 双方各自算出同一把共享密钥（密钥从不上网）
证书链验证：追溯到可信根 CA + 域名匹配 + 未过期未吊销
        ↓ 确认对面确实是目标站点
Finished 互验：确认握手未被篡改
        ↓ 切换到对称加密
产出：一条已认证、已加密的安全通道
```

<p class="bc-sec">设计取舍</p>

**非对称握手 + 对称传输的分工**，用非对称运算的高成本只买「安全商定密钥 + 认证身份」这一小段，海量数据用便宜的对称加密。代价是握手阶段的计算和往返开销，这也是连接复用如此重要的原因。

**ECDHE 取代 RSA 密钥交换**，用临时密钥换来前向保密：长期私钥泄露也解不开历史流量。代价是每次握手都要做一次临时密钥运算，但换来的安全性收益远大于此，所以 TLS 1.3 干脆只保留它。

**证书链信任模型**，把「我该信谁」收敛到一小撮预置根 CA，任何站点只要拿到可追溯到根的证书就能被验证。代价是整个体系依赖 CA 不作恶、私钥不泄露；一旦某个 CA 被攻破或误签，信任基础会被动摇。

**TLS 1.3 的 1-RTT / 0-RTT**，用协议设计上的激进优化换更少的握手等待。代价是 0-RTT 有重放风险，只能用于幂等请求。

<p class="bc-sec">面试回答</p>

TCP 连接建好后还是明文，HTTPS 要在上面做 TLS 握手，一次解决身份认证、机密性、完整性。以 TLS 1.3 讲：客户端发 ClientHello，带版本、密码套件、随机数、要访问的域名，并且直接附上自己的 ECDHE 公钥——这里要强调 TLS 1.3 主路径是 ECDHE 密钥交换，不是 RSA。服务器回 ServerHello，选定参数并附上自己的 ECDHE 公钥。双方各自用自己的私钥加对方的公钥，算出同一把共享密钥，而这把密钥从不在网上传输，窃听者抓到公钥也算不出来，还带来前向保密。接着验证服务器证书：沿签名链追到操作系统信任的根 CA，检查域名匹配、没过期没吊销，确认对面真是目标站点。最后互发 Finished 校验握手没被篡改，之后就用对称密钥加密传数据。为什么握手用非对称、传输用对称？非对称慢只适合商定密钥和认证，海量数据用快的对称加密。TLS 1.3 通常一个往返完成握手，对熟悉的服务器还能 0-RTT。握手完成，才终于能发 HTTP 请求。

<p class="bc-sec">常见追问</p>

**TLS 1.3 用 RSA 还是 ECDHE 交换密钥？**（校招必须掌握）
主路径用 ECDHE，不是 RSA 密钥交换。RSA 密钥交换因为没有前向保密，在 TLS 1.3 里被淘汰。证书里的密钥可能还是 RSA，但那是用来做签名认证，不是交换密钥，两件事要分清。

**为什么握手用非对称、传数据用对称？**（校招必须掌握）
非对称加解密慢，但能在不安全信道上安全地协商密钥、验证身份，适合握手这一小段。对称加密快得多，适合加密后续海量数据。TLS 就是用非对称解决「安全地商定钥匙」，用对称解决「高效地加密内容」。

**前向保密是什么，为什么重要？**（回答出来加分）
每次握手用临时的、用完即弃的密钥。即便服务器长期私钥日后泄露，攻击者也解不开之前录下的流量，因为会话密钥和长期私钥无关。ECDHE 提供这个性质，RSA 密钥交换不提供。

**浏览器凭什么信任一张证书？**（校招常问）
沿证书的签名链验证：站点证书被中间 CA 签，中间 CA 被根 CA 签，根 CA 在系统/浏览器预置信任库里。链能追到可信根、域名匹配、未过期未吊销，才通过，否则拦截。

**为什么能对 HTTPS 抓到明文（比如用 Charles）？**（回答出来加分）
抓包工具在客户端装了自己的根证书，让浏览器信任它签发的证书，于是它冒充服务器和客户端握手、再冒充客户端和真服务器握手，成为中间人。前提是本机主动信任了它的根证书；正常情况下证书链验证会挡住陌生中间人。

**0-RTT 有什么风险？**（通常不需要主动展开）
0-RTT 数据可能被攻击者截获后重放。所以它只用于幂等、安全的请求（如 GET），不能用于会改变服务器状态的操作。

---

**本节点产出**：一条已认证、已加密的安全通道（TCP + TLS 1.3，或已含于 QUIC 的等价加密）。

**交给谁**：节点六 · HTTP 请求与响应。

**下一节点为什么因此开始**：安全通道终于就绪，网络服务可以把节点一那份加载任务变成一个真正的 HTTP 请求发出去了。请求怎么组织、服务器怎么回、HTTP/1.1 到 HTTP/2 再到 HTTP/3 在这条通道上如何解决队头阻塞、缓存和重定向如何改变流程——这些都是节点六的内容。


<div class="bc-refs"><b>参考来源</b><br>[1] <a href="https://www.rfc-editor.org/rfc/rfc8446" target="_blank" rel="noopener">https://www.rfc-editor.org/rfc/rfc8446</a></div>

<div class="bc-nav"><a href="/2026/08/21/browser-course-04/">← 04 · TCP 与 QUIC 连接</a><a class="r" href="/2026/08/21/browser-course-06/">06 · HTTP 请求与响应 →</a></div>
