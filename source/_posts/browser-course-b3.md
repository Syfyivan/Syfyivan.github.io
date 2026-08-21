---
title: "《从 URL 到页面显示》分支 C · Web 存储与安全"
date: 2026-08-21 20:00:00
tags: [浏览器, Web安全, 同源策略, Cookie, CSRF, XSS, 校招, 面试]
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

> 这是一条紧贴主线、又能独立成篇的分支。主线节点六讲 HTTP 请求时，请求头里那个 `Cookie` 从哪来、凭什么自动带上？主线节点七之后页面在渲染进程里跑起来，脚本能读写哪些本地数据、又被什么规则挡在门外？这条分支把「浏览器存什么」和「浏览器拦什么」放在一起讲——因为存储和安全本就是一体两面：**正因为浏览器会自动携带凭证、会持久保存数据，才必须有一整套同源规则来防止它被滥用。**

<p class="bc-sec lead">一句话结论</p>

浏览器提供 Cookie、localStorage、sessionStorage、IndexedDB 等几种存储，各自的生命周期和访问方式不同；而它们能不能被读、能不能被跨站携带，全由**同源策略**这条地基决定。CSRF、XSS 这些经典攻击，本质都是钻了「浏览器自动携带凭证」或「同源信任被突破」的空子，防御手段也都是围着同源策略打补丁。

<p class="bc-sec">理解原理</p>

### 起点：为什么需要在浏览器端存东西

主线里 HTTP 是**无状态**的——服务器处理完一个请求就忘了你是谁。可登录态、购物车、用户偏好这些必须跨请求记住。于是需要在客户端存一点数据，下次请求带上，服务器才认得出你。最早的答案就是 Cookie，后来又长出了几种用途不同的存储。

### 第一步：Cookie——为「自动携带」而生，也因此成了安全焦点

**Cookie** 是一小段服务器通过响应头 `Set-Cookie` 种到浏览器、之后浏览器**自动**在匹配请求的 `Cookie` 头里带回去的数据。主线节点六里请求头那个 `Cookie` 字段，就是这么来的。

它最关键、也最危险的特性就是「自动携带」：只要请求发往匹配的域名和路径，浏览器**不问脚本、不问用户**就把 Cookie 带上。这让登录态透明好用——但也埋下了 CSRF 的种子（后面讲）。为了给这把双刃剑套上护栏，Cookie 有几个关键属性：

- `HttpOnly`：JS 读不到（`document.cookie` 拿不到它），专门防 XSS 偷 Cookie。
- `Secure`：只在 HTTPS 连接上携带，防明文泄露。
- `SameSite`：控制跨站请求要不要带这个 Cookie——`Strict` 完全不带、`Lax`（现代浏览器默认）只在顶级导航带、`None` 照带但必须配 `Secure`。这个属性是浏览器层面对 CSRF 的釜底抽薪 <a class="bc-cite" href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie" target="_blank" rel="noopener">[1]</a>。

<div class="bc-call bc-bonus"><span class="bc-tag">加分细节</span><strong>SameSite 默认值的变化是近几年安全的分水岭</strong><br>早期 Cookie 不设 SameSite 就等于跨站随便带，CSRF 门槛很低。主流浏览器把默认值改成 `Lax` 后，绝大多数跨站的非导航请求（如第三方页面里发的 POST）默认就不带 Cookie 了，等于给全网站点加了一层默认 CSRF 防护。能说出「默认从无到 Lax」这个演变，比只背 `SameSite` 三个取值更能体现你懂安全的实际落地。</div>

### 第二步：Web Storage 与 IndexedDB——把「存储」和「凭证」解耦

Cookie 每次请求都自动带，数据一多就浪费带宽，而且只能存字符串、容量只有 4KB 左右。于是浏览器又提供了**只存在本地、不自动上传**的存储：

- **localStorage**：同源下持久保存的键值对（关掉浏览器也在），容量约 5–10MB，纯本地，请求不携带。适合存用户偏好这类不敏感数据。
- **sessionStorage**：和 localStorage 一样是键值对，但**生命周期只到标签页关闭**，且每个标签页独立。适合存一次会话内的临时状态。
- **IndexedDB**：浏览器内置的**事务型数据库**，能存结构化数据和大量数据（可达上百 MB），支持索引和异步查询。离线应用、缓存大量业务数据用它。

这些存储和 Cookie 的根本分工是：**Cookie 是给服务器认身份用的（会自动上传），Web Storage / IndexedDB 是给页面自己用的（只在本地）。** 想清楚这条分工，就不会纠结「登录 token 该放哪」——放 Cookie 靠 `HttpOnly` 防 XSS 窃取，放 localStorage 则一旦 XSS 就直接被脚本读走。

<div class="bc-call bc-impl"><span class="bc-tag">实现细节</span><strong>这些存储都按「源」分仓，源之间互不可见</strong><br>localStorage、sessionStorage、IndexedDB、Cookie（在存储层）都是按**源（origin）** 隔离的：`https://a.com` 存的东西，`https://b.com` 的页面读不到，连 `http://a.com`（协议不同）都算另一个源。这正是下一步同源策略在存储层面的体现——所有本地数据的隔离边界，都是「源」。</div>

### 第三步：同源策略——所有隔离和信任的地基

**同源策略（Same-Origin Policy，SOP）** 是浏览器安全的基石。所谓「同源」，指**协议、域名、端口三者完全相同**。同源策略规定：一个源的脚本，默认不能读取另一个源的资源（不能读跨源页面的 DOM、不能读跨源请求的响应体、不能读跨源的存储）。

为什么必须有它？回到第一步：浏览器会**自动携带 Cookie**。假设没有同源策略，你登录了银行网站后，随手打开的恶意页面里的脚本，就能带着你的银行 Cookie 去请求银行接口、并读回你的账户数据。同源策略正是那道墙：**恶意页面可以让浏览器发出跨源请求（Cookie 甚至会被带上），但读不到响应内容。** 记住这个区分——「能不能发」和「能不能读」是两回事，这是理解 CSRF 和 CORS 的钥匙。

### 第四步：CORS——受控地放开同源限制

同源策略太严会挡住正当的跨源 API 调用（前后端分离、调第三方接口都要跨源）。**CORS（Cross-Origin Resource Sharing，跨源资源共享）** 就是官方开的一道受控口子：**由被请求的服务器**通过响应头（如 `Access-Control-Allow-Origin`）明确声明「我允许哪个源来读我的响应」。

关键点是主动权在**服务器**手里，不是前端能绕过的。对可能有副作用的请求（如带自定义头的 POST），浏览器还会先发一个 `OPTIONS` **预检请求**问服务器同不同意，同意了才发真正的请求 <a class="bc-cite" href="https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS" target="_blank" rel="noopener">[2]</a>。所以「CORS 报错」几乎都是服务器没配对响应头，改前端没用——这是校招高频的认知纠偏点。

### 第五步：两大经典攻击——都在钻前面机制的空子

有了上面的机制，两个必考攻击就能顺着讲清楚：

- **CSRF（Cross-Site Request Forgery，跨站请求伪造）**：钻的是「Cookie 自动携带」的空子。恶意页面诱导你的浏览器向已登录的目标站发请求，浏览器自动带上 Cookie，服务器以为是你本人操作。注意它**不需要读响应**，只要「发出去并被执行」就得手。防御：`SameSite` Cookie（浏览器层）、CSRF Token（服务器发一个脚本能读、跨站页面拿不到的随机值）、校验 `Origin`/`Referer`。
- **XSS（Cross-Site Scripting，跨站脚本）**：钻的是「同源信任」的空子。攻击者把恶意脚本注入到你信任的页面里执行，这脚本就是同源的、无所不能——能读 `document.cookie`（除非 `HttpOnly`）、能读 localStorage、能伪造任意同源请求。防御：对输出做转义、用 CSP（内容安全策略）限制可执行脚本的来源、敏感 Cookie 加 `HttpOnly`。

<div class="bc-call bc-bonus"><span class="bc-tag">加分细节</span><strong>一句话点破 CSRF 和 XSS 的本质区别</strong><br>CSRF 是「借你的身份发请求，但攻击者看不到结果」——它利用的是浏览器**自动带凭证**；XSS 是「在你的页面里跑我的代码」——它突破的是**同源信任**，所以危害更大、几乎能做任何事。有人把两者混为一谈，能用「一个偷发请求、一个偷执行代码」把它们劈开，面试就赢了。</div>

### 汇总：存储与安全其实是同一个故事

浏览器为了记住状态而存数据（Cookie 自动带、Web Storage 本地留）→ 自动携带和本地持久带来风险 → 用同源策略划死「谁能读谁」的边界 → 正当跨源用 CORS 由服务器受控放开 → 攻击者钻「自动携带」（CSRF）和「同源信任」（XSS）的空子 → 防御手段（SameSite、HttpOnly、CSP、Token）都是给这些机制打补丁。

<p class="bc-sec">主线整理</p>

```text
HTTP 无状态，但要记住登录态/偏好
        ↓ 在客户端存数据
Cookie（自动上传，给服务器认身份）
Web Storage / IndexedDB（只在本地，给页面自己用）
        ↓ 自动携带 + 本地持久 = 风险
同源策略：默认一个源读不到另一个源的资源
        ↓ 能「发」跨源请求，但不能「读」响应
正当跨源怎么办？CORS：由服务器用响应头受控放开
        ↓ 攻击者钻空子
CSRF 钻「Cookie 自动携带」 / XSS 钻「同源信任」
        ↓ 防御都是给机制打补丁
SameSite / HttpOnly / CSP / CSRF Token / 输出转义
```

<p class="bc-sec">设计取舍</p>

**Cookie 自动携带**：用「透明好用的登录态」换来了「跨站也可能被自动带上」的 CSRF 风险。浏览器后来用 `SameSite` 默认 `Lax` 收紧这道口子，是在「兼容老站点」和「默认更安全」之间重新取点。

**Cookie vs Web Storage 存 token**：放 Cookie 配 `HttpOnly`，脚本读不到、能扛 XSS 窃取，但要自己防 CSRF；放 localStorage 不会自动带、天然免 CSRF，但一旦 XSS 就被脚本直接读走。没有绝对答案，是按「你更怕哪种攻击」来选，通常敏感 token 倾向 `HttpOnly` Cookie。

**同源策略「能发不能读」**：这个看似别扭的设计，是在「不破坏 Web 既有的跨站资源加载能力（图片、脚本、表单提交本就跨站）」和「保护用户数据不被跨源脚本读取」之间的精妙折中。理解了它，CSRF（能发得手）和 CORS（受控放开读）就都通了。

<p class="bc-sec">面试回答</p>

Web 存储和安全其实是一个故事的两面。HTTP 无状态，所以要在浏览器端存数据：Cookie 是服务器种下、浏览器每次请求自动带回去的，专门给服务器认身份，主线里请求头那个 Cookie 就是它；localStorage、sessionStorage、IndexedDB 则只存在本地、不自动上传，给页面自己用，区别在生命周期和容量。正因为 Cookie 会自动携带、本地又持久存着数据，才必须有同源策略这道地基——协议域名端口全相同才算同源，一个源的脚本默认读不到另一个源的资源。关键要分清「能发」和「能读」：跨源请求能发出去、Cookie 甚至会被带上，但响应读不到。正当的跨源调用靠 CORS，由服务器用响应头声明允许哪个源来读，主动权在服务器。顺着这套机制，两个经典攻击就清楚了：CSRF 钻的是 Cookie 自动携带的空子，诱导浏览器带着你的登录 Cookie 去发请求，它不需要读响应，防御靠 SameSite Cookie 和 CSRF Token；XSS 钻的是同源信任，把恶意脚本注入到你信任的页面里当同源代码跑，能偷 Cookie、偷 localStorage，危害更大，防御靠输出转义、CSP 和给 Cookie 加 HttpOnly。所有防御手段本质都是围着同源策略打补丁。

<p class="bc-sec">常见追问</p>

**Cookie、localStorage、sessionStorage 有什么区别？**（校招必考）
Cookie 由服务器种、每次请求自动携带、约 4KB、给服务器认身份用；localStorage 纯本地持久保存、约 5–10MB、不自动上传；sessionStorage 和 localStorage 类似但生命周期只到标签页关闭、且标签页间独立。核心分工：Cookie 给服务器，Web Storage 给页面自己。

**什么是同源策略？同源怎么判定？**（校招必考）
同源策略是浏览器安全基石，规定一个源的脚本默认不能读取另一个源的资源。同源指协议、域名、端口三者完全相同，任一不同就是跨源。它的关键是「能发跨源请求但读不到响应」。

**登录 token 放 Cookie 还是 localStorage？**（校招高频，连主线）
看更怕哪种攻击。放 `HttpOnly` Cookie，脚本读不到、能防 XSS 窃取，但要自己防 CSRF；放 localStorage 天然免 CSRF（不自动带），但 XSS 一来就被读走。敏感 token 通常倾向 `HttpOnly` + `Secure` + `SameSite` 的 Cookie。

**CSRF 和 XSS 的区别与防御？**（校招必考）
CSRF 是借你已登录的身份、利用 Cookie 自动携带偷偷发请求，攻击者看不到响应，防御用 SameSite Cookie、CSRF Token、校验 Origin/Referer；XSS 是把恶意脚本注入页面当同源代码执行，能偷各种数据，危害更大，防御用输出转义、CSP、HttpOnly Cookie。一句话：CSRF 偷发请求，XSS 偷跑代码。

**CORS 报错了改前端能解决吗？**（校招高频认知纠偏）
基本不能。CORS 是否放行由被请求的服务器通过响应头（如 `Access-Control-Allow-Origin`）决定，主动权在服务器。前端改不了别人的响应头，只能让服务端正确配置，或走同源代理转发。

**预检请求（preflight）是什么时候发的？**（回答出来加分）
对可能有副作用的跨源请求（如带自定义头、Content-Type 非简单类型的请求），浏览器会先自动发一个 `OPTIONS` 预检请求，问服务器允不允许这种方法和头，服务器同意后才发真正的请求。简单请求（如普通 GET）不会预检。

**CSP 是干什么的？**（通常不需要主动展开）
内容安全策略，通过响应头声明页面允许加载和执行哪些来源的脚本、样式等资源，从而大幅削弱 XSS——即使注入了脚本，不在白名单来源也执行不了。是 XSS 的纵深防御手段。

---

**这条分支和主线的关系**：主线节点六里自动携带的 `Cookie`、节点七之后渲染进程里脚本能碰的本地数据，边界都由同源策略划定。把存储和安全放在一起看，就能明白浏览器所有的隔离与防护，都是在为「自动携带凭证 + 本地持久存储」这两件便利事，付出的安全代价与补偿。


<div class="bc-refs"><b>参考来源</b><br>[1] <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie" target="_blank" rel="noopener">https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie</a><br>[2] <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS" target="_blank" rel="noopener">https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS</a></div>

<div class="bc-nav"><a href="/courses/browser-course/">← 课程目录</a><a class="r" href="/courses/browser-course/">课程目录 →</a></div>
