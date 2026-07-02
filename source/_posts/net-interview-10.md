---
title: "《秋招计网面试实战课》第10讲 · 登录态与安全（Cookie、Session、Token、JWT、SameSite、CSRF、XSS 与 Cookie 安全）"
date: 2026-07-09 18:00:00
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
「HTTP 是无状态的，那你登录一次之后，服务器怎么知道后面每个请求还是你？」这是登录态这块的开场题，几乎每个后端/前端岗都会问。顺着往下：「Cookie、Session、Token 有啥区别」「JWT 长啥样、能不能主动登出」「SameSite/HttpOnly/Secure 是干嘛的」「CSRF 是怎么发生的、怎么防」「XSS 为什么能偷走你的 Cookie」。这一讲把「怎么保持登录」和「怎么保护登录态不被偷」两条线一起讲清楚，这也是安全岗和大厂后端的高频区。
</div>

## 🎯 这一讲能答对哪些面试题

- HTTP 无状态，登录后服务器怎么认出你？Cookie 和 Session 的关系？<span class="niv-b niv-core">高频必背</span>
- Cookie/Session（有状态）和 Token/JWT（无状态）有什么区别，分布式下怎么选？<span class="niv-b niv-core">高频必背</span>
- JWT 的结构是什么？为什么说它「不可撤销」？能不能主动登出？<span class="niv-b niv-key">场景追问</span>
- SameSite、HttpOnly、Secure 这几个 Cookie 属性各防什么？<span class="niv-b niv-core">高频必背</span>
- CSRF 的原理是什么，怎么防？<span class="niv-b niv-key">场景追问</span>
- XSS 是什么，它怎么偷走用户的 Cookie？<span class="niv-b niv-adv">进阶加分</span>
- 为什么用着用着登录态就失效了？

## 📖 核心八股：先讲清楚定义

先把术语用大白话落地：

- Cookie：服务器让浏览器存的一小段数据，之后浏览器每次请求同源地址都会自动带上。它是「运输方式」，本身不代表任何机制。
- Session：会话状态存在服务端（内存/Redis/数据库），服务端给每个会话一个 Session ID，通过 Cookie 发给浏览器。服务端「有状态」。
- Token：一段代表身份的凭证字符串，客户端拿着它，每次请求主动放到请求头里（一般是 `Authorization: Bearer xxx`）。
- JWT（JSON Web Token）：一种自包含的 Token 格式，本身就带着用户信息和签名，服务端不用查存储就能验证，所以「无状态」。

### HTTP 无状态，登录态怎么保持

<div class="niv-a">
<strong>标准回答模板：</strong>HTTP 每个请求之间互相独立，服务器天生不记得你上一个请求是谁。要保持登录，就得让客户端在每个请求里都带上一个「身份凭证」。经典做法有两条路线：一是 Session + Cookie（服务端记状态）——登录成功后服务端创建一个 Session 存起来，生成 Session ID 通过 Cookie 下发，之后浏览器自动带上 Cookie，服务端拿 ID 查出你是谁；二是 Token/JWT（服务端不记状态）——登录后签发一个 Token 给客户端，客户端每次请求手动带上，服务端验证签名/查 Token 就知道你是谁。
</div>

### Cookie、Session、Token/JWT 的关系与区别

先厘清一个常见误解：Cookie 和 Session 不是并列的东西。Session 是「服务端存状态」的机制，Cookie 常常只是用来「运送 Session ID」的载体。

```text
【Session + Cookie 方案（有状态）】
登录成功 → 服务端建 Session（存 Redis） → 返回 Set-Cookie: sid=abc
之后请求 → 浏览器自动带 Cookie: sid=abc → 服务端拿 abc 查 Redis 认出你

【Token / JWT 方案（无状态）】
登录成功 → 服务端签发 Token（自带用户信息+签名）→ 返回给前端存起来
之后请求 → 前端手动带 Authorization: Bearer <token> → 服务端验签名即可
```

<div class="niv-why">
核心区别在「状态存哪」。Session 把状态存在服务端，服务端要为每个在线用户维护数据；JWT 把状态（用户信息）塞进 Token 里交给客户端保管，服务端只负责验证签名，自己不存。这直接决定了分布式下的体验：Session 方案在多台服务器间要共享 Session（否则请求打到别的机器就认不出你），常见做法是把 Session 集中存到 Redis；JWT 天生无状态，任何一台服务器只要有密钥就能验证，横向扩展更省事。
</div>

分布式下怎么选，一句话给结论：

- 追求水平扩展简单、服务端不想存会话、多端/跨服务：偏向 Token/JWT。
- 需要能随时让某个登录态立刻失效（强制下线、改密即失效）、对撤销要求高：Session 更好控制，或 JWT 配合服务端「黑名单/短有效期」来补。

### JWT 的结构

JWT 由三段用点隔开：`Header.Payload.Signature`。

```text
Header（头部）    : 声明算法和类型，如 {"alg":"HS256","typ":"JWT"}
Payload（载荷）   : 存放声明，如 {"userId":123,"exp":1735689600}
Signature（签名） : 用密钥对前两段签名，防篡改

最终形态（三段 Base64Url 编码后用 . 拼接）：
xxxxx.yyyyy.zzzzz
```

<div class="niv-why">
关键认知：Header 和 Payload 只是 Base64Url 编码，不是加密，任何人都能解开看到里面的内容。所以千万别在 Payload 里放密码、敏感信息。它的安全性来自 Signature：服务端用只有自己知道的密钥对前两段签名，别人改了 Payload 但没有密钥就签不出正确签名，服务端一验就发现被篡改了。所以 JWT 保证的是「不可篡改」，不是「不可读」。
</div>

### JWT 的「不可撤销」问题

<div class="niv-a">
<strong>标准回答模板：</strong>JWT 是无状态的，服务端不存储它，只靠验证签名和过期时间来判断有效性。这带来一个天生的问题：只要 Token 没到过期时间、签名又是对的，服务端就认它，没法单方面「作废」某一个已经签发出去的 Token。所以像「点击退出登录立即失效」「改密码后旧 Token 立刻失效」「管理员强制某用户下线」这类需求，纯 JWT 做不到干净利落。
</div>

<div class="niv-why">
为什么不可撤销？因为「有没有效」这个判断完全靠 Token 自身携带的信息 + 签名，服务端没有一张「这个 Token 还有效吗」的表可查。要弥补，常见几招：一是设短有效期 + Refresh Token（访问令牌很快过期，靠可撤销的刷新令牌续期）；二是服务端维护一个「黑名单/吊销列表」，登出时把 Token 加进去，验证时多查一步——但这等于又引入了服务端状态，牺牲了 JWT 无状态的初衷。面试时能点出这个「取舍」就很加分。
</div>

### Cookie 的三个安全属性

- HttpOnly：设了之后，JavaScript 读不到这个 Cookie（`document.cookie` 拿不到）。主要用来防 XSS 偷 Cookie。
- Secure：设了之后，Cookie 只在 HTTPS 加密连接下才会被发送，防止明文 HTTP 传输时被窃听。
- SameSite：控制「跨站请求」时要不要带上 Cookie，主要用来防 CSRF。取值：
  - `Strict`：完全不跨站带 Cookie，最严格；
  - `Lax`：大多数跨站请求不带，但顶级导航的 GET（比如点链接跳过去）会带，是现代浏览器的常见默认；
  - `None`：跨站也带，但必须同时加 Secure。

### CSRF 原理与防御

<div class="niv-a">
<strong>标准回答模板：</strong>CSRF（跨站请求伪造）利用的是「浏览器会自动带上 Cookie」这个特性。你在 A 网站登录着（浏览器存了 A 的 Cookie），此时被诱导访问了恶意网站 B，B 页面里藏了一个指向 A 的请求（比如自动提交的表单、img 标签）。浏览器发这个请求时会自动带上 A 的 Cookie，于是 A 服务器以为是你本人操作，就执行了转账、改密等敏感动作。攻击者全程并不需要知道你的 Cookie 内容，他只是「借」了浏览器自动带 Cookie 这个行为。
</div>

防御要点：

- CSRF Token：服务端在表单/页面里放一个随机 token，提交时校验。恶意站点拿不到这个随机值，伪造的请求就过不了。
- SameSite Cookie：设成 Lax 或 Strict，跨站请求就不自动带 Cookie，CSRF 直接失效一大半。
- 校验 Origin / Referer：判断请求来源是不是本站。
- 敏感操作二次确认（如输密码、验证码）。

### XSS 如何窃取 Cookie

<div class="niv-a">
<strong>标准回答模板：</strong>XSS（跨站脚本）是攻击者把恶意 JavaScript 注入到网页里，让它在其他用户的浏览器上执行。一旦脚本跑起来，它就能读 <code>document.cookie</code>，把 Cookie 拼到一个 URL 上发到攻击者的服务器，攻击者拿到你的会话 Cookie 后就能冒充你登录。防御核心是：对用户输入输出做转义/过滤，别让输入被当成代码执行；同时给会话 Cookie 加 HttpOnly，这样即使被 XSS，脚本也读不到 Cookie。
</div>

<div class="niv-why">
CSRF 和 XSS 的区别是常考对比点：CSRF 是「借你的身份（Cookie）替你发请求」，攻击者拿不到也不需要 Cookie 内容；XSS 是「在你浏览器里跑代码」，能力更强，可以直接偷 Cookie、改页面、发任意请求。所以 HttpOnly 防的是 XSS 偷 Cookie，SameSite 防的是 CSRF 自动带 Cookie，两者防的不是同一类攻击，别搞混。
</div>

## 🔍 场景追问：面试官会顺着问

<div class="niv-scene"><strong>追问：</strong>用户点了「退出登录」，用 JWT 方案能真的让这个 Token 立刻失效吗？</div>

要点：纯 JWT 做不到。因为服务端不存 Token，只验签名和过期时间，那个已经发出去的 Token 只要没过期、签名对，服务端还是认。常见解决办法：

- 前端删除本地存的 Token：只能防「本人这台设备之后不再带」，但如果 Token 已经泄露给别人，别人手里那份照样有效，所以这不算真正的失效。
- 短有效期 + Refresh Token：Access Token 几分钟就过期，登出时不再刷新，很快自然失效；Refresh Token 是可撤销的。
- 服务端维护吊销黑名单：登出时把该 Token（或其 jti）加进黑名单，验证时多查一次。代价是重新引入了服务端状态。
结论：要「即时、可靠地登出」，就得牺牲一点无状态性，靠黑名单或短期 Token 来补。

<div class="niv-scene"><strong>追问：</strong>为什么我登录着登录着，过一会儿就自动退出了、要重新登录？</div>

登录态失效的常见原因：

- 过期：Session 有过期时间、Cookie 有 Max-Age/Expires、JWT 有 exp，到点就失效。
- 服务端会话被清：Session 存在内存里而服务重启，或存 Redis 但被淘汰/清理，服务端查不到你的会话。
- 主动失效：改了密码、后台强制下线、检测到异地登录等，服务端把会话作废。
- 服务端多实例但 Session 没共享：请求被负载均衡打到另一台没有你 Session 的机器，认不出你（这正是要把 Session 集中存 Redis 的原因）。
- 客户端侧：Cookie 被清理、换了设备/浏览器、开了隐私模式、Secure Cookie 在 HTTP 下发不出去等。

<div class="niv-scene"><strong>追问：</strong>把 Token 存在 localStorage 和存在 Cookie 里，安全上有什么权衡？</div>

- 存 Cookie（尤其加 HttpOnly）：JS 读不到，能抵御 XSS 偷取；但 Cookie 会被浏览器自动携带，天然有 CSRF 风险，要靠 SameSite/CSRF Token 补。
- 存 localStorage：不会被自动带上，天然没有 CSRF 那种「自动带」问题；但 localStorage 能被 JS 直接读取，一旦有 XSS，Token 就直接被偷。
- 结论：没有绝对安全，关键看你更怕哪类攻击、防护是否到位。用 HttpOnly Cookie + SameSite + CSRF Token 是较稳的组合；用 localStorage 则必须把 XSS 防死。

## 🛠 动手验证（可选做）

登录态相关的行为可以直接在浏览器和 curl 里看到。

看服务器怎么下发 Cookie，重点看 `Set-Cookie` 里的属性：

```bash
curl -i https://example.com/login -X POST -d 'user=xx&pwd=xx'
```

响应头里可能看到类似（示意，实际字段以站点为准）：

```http
Set-Cookie: sid=abc123; Path=/; HttpOnly; Secure; SameSite=Lax
```

`HttpOnly` 表示 JS 读不到、`Secure` 表示只走 HTTPS、`SameSite=Lax` 表示跨站基本不带。

带着 Cookie 访问，模拟浏览器「自动带 Cookie」：

```bash
# 先把 Cookie 存下来，再带着请求，看服务端是否认出登录态
curl -c cookie.txt https://example.com/login -X POST -d 'user=xx&pwd=xx'
curl -b cookie.txt https://example.com/profile
```

在浏览器里也很直观：打开开发者工具 → Application/存储 → Cookies，能看到每个 Cookie 的 HttpOnly、Secure、SameSite 列；在 Console 里执行 `document.cookie`，你会发现带了 HttpOnly 的那条根本读不出来，这就是它防 XSS 的直观效果。

如果你手上有一个 JWT，可以把中间的 Payload 段单独 Base64Url 解码，会发现里面的内容明文可读（所以别放敏感信息）：

```bash
# 把 JWT 第二段（Payload）解码看看，能直接读出里面的字段
echo '<jwt中间那段>' | base64 -d
```

## 🧨 高频翻车点

<div class="niv-trap">
<strong>翻车 1：把 Cookie 和 Session 当成对立的两种方案来比较。</strong>Session 是服务端存状态的机制，Cookie 通常只是运送 Session ID 的载体，两者是配合关系。正确的对立面是「Session（有状态）」vs「Token/JWT（无状态）」。
</div>

<div class="niv-trap">
<strong>翻车 2：说「JWT 是加密的，放里面很安全」。</strong>错。JWT 的 Header 和 Payload 只是 Base64Url 编码，谁都能解开读，它靠签名保证「不可篡改」而非「不可读」。敏感信息绝不能放 Payload。
</div>

<div class="niv-trap">
<strong>翻车 3：把 CSRF 和 XSS 的防御手段张冠李戴。</strong>HttpOnly 防的是 XSS 偷 Cookie，SameSite/CSRF Token 防的是 CSRF。CSRF 是借你身份发请求、不需要拿到 Cookie 内容；XSS 是在你浏览器里跑脚本、能力更大。别用「设 HttpOnly」去回答「怎么防 CSRF」。
</div>

## 🎤 面试话术模板

<div class="niv-a">
<strong>30 秒口述版：</strong>HTTP 无状态，保持登录就得每次请求带身份凭证。两条路线：Session + Cookie 是服务端存状态，下发 Session ID，浏览器自动带回来查；Token/JWT 是无状态，登录后签发一段自带用户信息和签名的凭证，客户端每次手动带上，服务端验签名即可，分布式下扩展更方便。JWT 由 Header.Payload.Signature 三段组成，前两段只是编码可读、靠签名防篡改，所以它无法被主动撤销，要即时登出得配短有效期或服务端黑名单。安全上，HttpOnly 让 JS 读不到 Cookie、防 XSS 偷取，Secure 只走 HTTPS，SameSite 防跨站自动带 Cookie、抵御 CSRF；CSRF 是借浏览器自动带 Cookie 冒充你发请求，用 CSRF Token 加 SameSite 防；XSS 是注入脚本读 document.cookie 偷会话，用输入输出转义加 HttpOnly 防。
</div>

## ✅ 自测三问

1. Cookie、Session、Token/JWT 三者的关系和核心区别是什么？
2. 为什么说 JWT「不可撤销」？要实现主动登出有哪些办法？
3. CSRF 和 XSS 分别是怎么发生的？HttpOnly 和 SameSite 各防哪个？

<details class="niv-fold"><summary>对答案</summary>

1. Session 是服务端存状态的机制，Cookie 通常是运送 Session ID 的载体，两者配合。核心区别在「状态存哪」：Session 存服务端（有状态，分布式要共享如存 Redis）；JWT 把用户信息塞进 Token 交客户端保管（无状态，服务端只验签名，扩展方便）。

2. JWT 无状态，服务端不存它，只靠验签名和过期时间判断有效，所以已签发且未过期的 Token 没法被单方面作废。实现主动登出：短有效期 + 可撤销的 Refresh Token；或服务端维护吊销黑名单（登出时加入，验证时查询），代价是重新引入服务端状态。

3. CSRF 利用「浏览器自动带 Cookie」，诱导你在已登录状态下访问恶意站，替你向目标站发请求，攻击者不需拿到 Cookie 内容；XSS 是把恶意脚本注入网页，在受害者浏览器里执行、读取 document.cookie 偷走会话。HttpOnly 防 XSS 偷 Cookie（JS 读不到），SameSite 防 CSRF（跨站不自动带 Cookie）。

</details>

## 📦 复制带走

<div class="niv-card">
<strong>有状态 vs 无状态：</strong>Session+Cookie＝服务端存状态，分布式要共享（Redis）；Token/JWT＝无状态，服务端只验签名，扩展省事。Cookie 是载体，别和 Session 并列比较。
</div>

<div class="niv-card">
<strong>JWT：</strong>三段 Header.Payload.Signature，前两段只是 Base64Url 编码可读、靠签名防篡改（不是加密，别放敏感信息）。无状态导致不可撤销，主动登出要靠短有效期 + Refresh Token 或服务端黑名单。
</div>

<div class="niv-card">
<strong>Cookie 三属性：</strong>HttpOnly＝JS 读不到（防 XSS 偷 Cookie）；Secure＝只走 HTTPS；SameSite＝跨站不带（防 CSRF），None 必须配 Secure。
</div>

<div class="niv-card">
<strong>CSRF vs XSS：</strong>CSRF＝借浏览器自动带 Cookie 冒充你发请求，防：CSRF Token + SameSite + 校验 Origin；XSS＝注入脚本偷 Cookie/发请求，防：输入输出转义 + HttpOnly。两者防护手段别张冠李戴。
</div>

<p style="margin-top:24px"><a href="/courses/net-interview/">← 回到《秋招计网面试实战课》目录</a></p>
