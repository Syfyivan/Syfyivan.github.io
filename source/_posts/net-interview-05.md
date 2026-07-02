---
title: "《秋招计网面试实战课》第05讲 · HTTPS 面试核心（对称/非对称加密、数字证书、CA、TLS 握手、中间人攻击）"
date: 2026-07-09 13:00:00
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
HTTPS 是校招面试里几乎必考的一段，问法非常固定：「HTTPS 和 HTTP 有什么区别」「TLS 握手过程说一下」「为什么要同时用对称和非对称加密」「证书是干嘛的、CA 又是谁」。这些题本身不难，难点在于面试官会一层层往下追：既然非对称加密安全，为啥不全程用？证书怎么保证不被伪造？为什么你电脑上的抓包工具能看到 HTTPS 明文？这一讲就把这条链路讲透，让你从「背概念」升级到「能讲清一次安全连接是怎么建立的」。
</div>

## 🎯 这一讲能答对哪些面试题

- HTTPS 和 HTTP 到底差在哪？<span class="niv-b niv-core">高频必背</span>
- 对称加密和非对称加密的区别，为什么 HTTPS 两个都要用？<span class="niv-b niv-core">高频必背</span>
- 数字证书里有什么？CA 在信任链里扮演什么角色？
- TLS 握手完整过程说一下（TLS 1.2 和 1.3 有什么不同）？<span class="niv-b niv-core">高频必背</span>
- 中间人攻击是怎么回事，HTTPS 怎么防？
- 为什么 Charles / Fiddler / mitmproxy 能抓到 HTTPS 的明文？<span class="niv-b niv-key">场景追问</span>
- 证书过期 / 域名不匹配 / 自签证书，浏览器分别会怎样？<span class="niv-b niv-key">场景追问</span>

## 📖 核心八股：先讲清楚定义

先给三个大白话定义，术语第一次出现就落地：

- 对称加密：加密和解密用同一把钥匙。速度快，但「怎么把这把钥匙安全地给对方」是难题。常见算法 AES、ChaCha20。
- 非对称加密：一对钥匙，公钥和私钥。公钥加密只有私钥能解，私钥签名只有公钥能验。安全，但运算慢。常见算法 RSA、ECDSA。
- 数字证书：一份由权威机构（CA）签过名的文件，用来证明「这个公钥确实属于这个域名」。CA（Certificate Authority）就是这个大家都信任的第三方发证机构。

HTTPS 本质就是：`HTTP + TLS`。HTTP 报文本身不变，只是套了一层 TLS（Transport Layer Security，传输层安全协议，SSL 的后继者）来做加密、身份认证和完整性校验。

<div class="niv-a">
<strong>标准回答模板（HTTPS vs HTTP）：</strong>HTTP 是明文传输，任何中间节点都能看和改；HTTPS 在 HTTP 和 TCP 之间加了一层 TLS，解决三件事：加密（防偷看）、身份认证（确认你连的是真服务器，靠数字证书）、完整性校验（防篡改，靠 MAC / AEAD）。代价是多了 TLS 握手的耗时和一点 CPU 开销。默认端口也不同，HTTP 是 80，HTTPS 是 443。
</div>

### 为什么同时用对称 + 非对称加密

这是最爱考的一个「为什么」。

<div class="niv-why">
非对称加密安全但慢，如果整个通信都用它，性能会很差；对称加密快，但双方得先有同一把密钥，而这把密钥在公网上直接传又会被偷看。于是 HTTPS 取长补短：<strong>用非对称加密在握手阶段安全地协商出一个对称密钥（会话密钥），之后的应用数据全部用这个对称密钥加密</strong>。既解决了密钥分发问题，又保证了后续传输的速度。一句话：非对称负责「安全地交换钥匙」，对称负责「高效地传数据」。
</div>

补充一个精确说法：现代 TLS 的密钥协商基本都用 ECDHE（椭圆曲线的 Diffie-Hellman 密钥交换），它能让双方在不直接传输密钥的情况下各自算出同一个共享密钥，并且天然具备「前向安全性」（就算私钥以后泄露了，也解不开之前录下来的流量）。所以严格说，现在不是「用 RSA 公钥加密会话密钥传过去」，而是「用 ECDHE 协商 + 证书里的公钥做身份签名验证」。这个点如果能说出来，是加分项。<span class="niv-b niv-adv">进阶加分</span>

### 证书链与 CA 信任是怎么回事

服务器给你的不是一张证书，通常是一条证书链：

```text
根 CA 证书 (Root CA)         <- 预装在操作系统/浏览器的信任库里
   │  签发
中间 CA 证书 (Intermediate)  <- 服务器一般会一起发过来
   │  签发
服务器证书 (叶子证书)         <- 里面有域名、公钥、有效期
```

验证过程是「自下而上验签」：浏览器用中间 CA 的公钥验证服务器证书的签名，再用根 CA 的公钥验证中间 CA 的签名，一直验到某个「本机信任库里已经内置的根证书」为止。只要这条链每一环签名都对、且根在信任库里，证书就被认可。

<div class="niv-why">
为什么需要 CA？因为公钥本身只是一串数字，谁都能生成一对。你怎么知道拿到的公钥真是「淘宝」的而不是攻击者的？CA 的作用就是用自己的私钥给「域名 + 公钥」这份绑定关系签个名做背书。你信任 CA（因为它的根证书预装在你系统里），就间接信任了它签发的证书。信任是「传递」下来的。
</div>

数字证书里主要包含：域名（Common Name / SAN 里的一堆域名）、服务器公钥、颁发者（CA）信息、有效期（起止时间）、以及 CA 用私钥打的数字签名。

### TLS 握手流程（先给一版通用图）

以传统 TLS 1.2 + ECDHE 为例，握手大致是：

```text
客户端                                          服务器
  │  ── ClientHello ──────────────────────────>  │  (支持的TLS版本/密码套件/随机数)
  │  <────────────────────────── ServerHello ──  │  (选定版本/套件/随机数)
  │  <──────────────── Certificate + 密钥交换参数 │  (证书链 + ECDHE公开参数 + 签名)
  │                                               │
  │  验证证书链、验证签名                          │
  │  双方用ECDHE参数各自算出相同的会话密钥          │
  │                                               │
  │  ── (客户端密钥交换参数) + Finished ────────>  │
  │  <──────────────────────────── Finished ────  │
  │                                               │
  │  ===== 之后用对称会话密钥加密应用数据 =====     │
```

<div class="niv-why">
握手里那两个随机数 + ECDHE 协商出来的共享秘密，一起通过密钥派生算法生成最终的会话密钥。两个随机数的作用是保证「即使其他参数相同，每次会话的密钥也不一样」，防重放。Finished 消息则是对之前所有握手报文做一次校验，确认握手过程没被人中途改动。
</div>

## 🔍 场景追问：面试官会顺着问

<div class="niv-scene"><strong>追问：</strong>TLS 1.2 和 TLS 1.3 握手有什么区别？说 1.3 更快，快在哪？</div>

要点（版本差异务必说准，不要编造轮次数字）：

- TLS 1.2 的完整握手通常需要 2 个 RTT（往返）才能开始发应用数据：一来一回交换 Hello 和证书、再一来一回确认。
- TLS 1.3 把握手压缩到 1 个 RTT（1-RTT）：客户端在 ClientHello 里就直接带上自己的密钥交换参数，服务器一次回复就基本把密钥定下来了。
- TLS 1.3 还支持 0-RTT（会话恢复场景下，客户端可以在第一个包里就带上应用数据），代价是 0-RTT 数据有被重放的风险，一般只用于幂等请求。
- TLS 1.3 大幅精简了密码套件，砍掉了不安全的算法（比如静态 RSA 密钥交换、RC4、老的 CBC 模式），强制前向安全的密钥交换。

诚实边界：不同实现和是否会话复用，实际 RTT 会有差异；上面说的是「完整握手」的典型情况，别把它当成绝对固定值背。

<div class="niv-scene"><strong>追问：</strong>什么是中间人攻击（MITM）？HTTPS 靠什么防住它？</div>

中间人攻击：攻击者夹在你和服务器中间，分别和两边建立连接，转发并偷看/篡改数据。纯 HTTP 完全无法防。

HTTPS 防它靠的是「证书 + CA 信任链」这一套身份认证：攻击者就算截了流量，它没有目标域名对应的、被受信任 CA 签发的证书。它要么拿不出合法证书（浏览器直接报错），要么只能拿自签证书（浏览器警告红页）。所以只要用户不无脑点「继续访问」，中间人就无法冒充服务器。加密只能防偷看，真正防冒充的是证书验证这一步，这点一定要讲清楚。

<div class="niv-scene"><strong>追问：</strong>那为什么我用 Charles / Fiddler 就能看到 HTTPS 的明文？不是说防中间人吗？</div>

这是本讲最经典的一道「看似矛盾」的题，答案恰恰印证了上面的原理：

抓包工具做的就是一次「你自己授权的中间人攻击」。它的工作方式是：

1. 抓包工具在本机生成一个自己的根证书，并引导你把它安装进系统/浏览器的受信任根证书库。
2. 当你访问 HTTPS 网站时，抓包工具拦截连接，动态签发一张该域名的证书（用它自己的根证书签名），冒充服务器和你握手。
3. 因为它的根证书已经被你「主动信任」了，浏览器验证证书链时发现根在信任库里，就不报错，于是明文就被工具解开了。
4. 工具再以客户端身份去和真实服务器建立另一条 HTTPS 连接。

<div class="niv-why">
关键点：抓包能成功的<strong>前提是你手动信任了它的根证书</strong>。如果没装这个根证书，抓包工具签的证书验不过 CA 链，浏览器照样报错、看不到明文。所以这不是 HTTPS 被攻破，而是「信任链的起点被你自己人为放进去了」。反过来说，这也解释了为什么绝不能随便安装来路不明的根证书，一旦装了，对方就能解密你所有的 HTTPS 流量。
</div>

<div class="niv-scene"><strong>追问：</strong>证书过期、域名不匹配、自签证书，浏览器分别会怎样？</div>

- 证书过期：超出有效期，浏览器报「证书过期」错误，拦截页面。服务器侧要靠自动续期（比如 ACME/Let's Encrypt）避免。
- 域名不匹配：访问的域名不在证书的 CN/SAN 列表里，报「名称不匹配」。常见于用 IP 访问、或证书没覆盖某个子域名。
- 自签证书：没有受信任 CA 背书，链验不到内置根，报「不受信任」。内网/测试环境常见，正式环境不该用。

## 🛠 动手验证（可选做）

用 `openssl` 直接看服务器发的证书链，肉眼确认颁发者、有效期、域名：

```bash
# 连上目标站点的 443，打印证书链概要（-servername 触发 SNI，多域名主机必需）
openssl s_client -connect example.com:443 -servername example.com < /dev/null 2>/dev/null \
  | openssl x509 -noout -subject -issuer -dates
```

```bash
# 看完整握手细节：协商出的 TLS 版本、密码套件、证书链层级
openssl s_client -connect example.com:443 -servername example.com < /dev/null
# 输出里关注：Protocol（如 TLSv1.3）、Cipher（密码套件）、Certificate chain（证书链）
```

```bash
# 用 curl 观察 TLS 阶段耗时，直观感受握手开销
curl -w "dns:%{time_namelookup}s connect:%{time_connect}s tls:%{time_appconnect}s ttfb:%{time_starttransfer}s\n" \
  -o /dev/null -s https://example.com
```

## 🧨 高频翻车点

<div class="niv-trap">
<strong>翻车 1：「HTTPS 就是用非对称加密传数据」。</strong>错。非对称只用在握手阶段做密钥协商和身份认证，真正传应用数据用的是对称加密（会话密钥）。说反了会被直接判定基础不牢。
</div>

<div class="niv-trap">
<strong>翻车 2：「HTTPS 加密了所以能防篡改和防冒充」这句话糊在一起。</strong>要拆开：加密防偷看，完整性校验（MAC/AEAD）防篡改，证书 + CA 验证防冒充。三件事对应三个机制，面试官爱追问「加密怎么防冒充」，你得答「加密防不了冒充，防冒充是证书的功劳」。
</div>

<div class="niv-trap">
<strong>翻车 3：把「抓包能看到 HTTPS 明文」说成「HTTPS 不安全 / 被破解了」。</strong>正确说法是：那是你主动信任了抓包工具的根证书，等于自己授权了一次中间人。不装它的根证书就抓不到明文，HTTPS 机制本身没被攻破。
</div>

## 🎤 面试话术模板

<div class="niv-a">
<strong>30 秒口述版：</strong>HTTPS 就是 HTTP 加一层 TLS，解决加密、身份认证、完整性三件事。它同时用对称和非对称加密：非对称加密慢但安全，用在握手阶段做身份认证和密钥协商（现代主要用 ECDHE，具备前向安全）；协商出会话密钥后，应用数据全部用对称加密传，快。身份认证靠数字证书，证书由受信任的 CA 签发，浏览器用内置根证书自下而上验证整条证书链，验通过才信任，这样就防住了中间人冒充。TLS 1.3 相比 1.2 把握手从 2-RTT 压到 1-RTT，还砍掉了不安全的算法。至于为什么抓包工具能看到 HTTPS 明文，是因为你手动信任了它的根证书，它才能合法地做一次中间人，这恰恰说明证书信任链才是 HTTPS 安全的根基。
</div>

## ✅ 自测三问

1. 为什么 HTTPS 要同时用对称和非对称加密，各自负责什么？
2. 中间人攻击靠什么防住？只靠加密够不够？
3. 抓包工具能看到 HTTPS 明文的前提是什么？这说明了什么？

<details class="niv-fold"><summary>对答案</summary>

1. 非对称加密安全但慢，用在握手阶段做身份认证和密钥协商；对称加密快，用协商出来的会话密钥加密后续应用数据。取长补短：非对称安全交换钥匙，对称高效传数据。
2. 靠数字证书 + CA 信任链做身份认证。只靠加密不够，加密只防偷看，防冒充是证书验证这一步的功劳。攻击者拿不出受信任 CA 签发的目标域名证书，就无法冒充服务器。
3. 前提是你手动把抓包工具的根证书装进了系统/浏览器的受信任根证书库。这说明 HTTPS 的安全根基是「信任链的起点（根证书）没被污染」，一旦随便信任来路不明的根证书，流量就可能被解密。

</details>

## 📦 复制带走

<div class="niv-card">
<strong>加密分工：</strong>非对称（RSA/ECDSA/ECDHE）在握手阶段做身份认证 + 密钥协商；对称（AES/ChaCha20）用会话密钥加密应用数据。现代用 ECDHE 协商，具备前向安全。
</div>

<div class="niv-card">
<strong>信任链：</strong>服务器证书 ← 中间 CA ← 根 CA（内置在系统信任库）。浏览器自下而上验签，验到内置根为止。CA 用私钥为「域名 + 公钥」背书。
</div>

<div class="niv-card">
<strong>版本差异（别编数字）：</strong>TLS 1.2 完整握手约 2-RTT；TLS 1.3 约 1-RTT，支持 0-RTT（有重放风险），并强制前向安全、砍掉不安全算法。实际 RTT 受会话复用影响。
</div>

<div class="niv-card">
<strong>抓包看明文的真相：</strong>抓包工具 = 你授权的中间人。它靠你手动安装的根证书动态签发域名证书。不装根证书就抓不到明文，HTTPS 本身没被破解。三件事分开记：加密防偷看、MAC/AEAD 防篡改、证书防冒充。
</div>

<p style="margin-top:24px"><a href="/courses/net-interview/">← 回到《秋招计网面试实战课》目录</a></p>
