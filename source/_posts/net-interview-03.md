---
title: "《秋招计网面试实战课》第03讲 · HTTP 面试核心（请求/响应、GET/POST、状态码、Header、Cookie、缓存、长连接）"
date: 2026-07-09 11:00:00
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
HTTP 是面试里出现频率最高的协议，没有之一。面试官问它，不是想听你背「超文本传输协议」几个字，而是想确认你真的用过、真的懂：一条请求长什么样、GET 和 POST 到底差在哪、看到 502 你会不会甩锅给自己、缓存为什么有时候「改了不生效」。这一讲把 HTTP 里最容易被追问打穿的点全部铺开，让你答得出、也扛得住往下问。
</div>

## 🎯 这一讲能答对哪些面试题

- 一次 HTTP 请求/响应报文由哪几部分组成？<span class="niv-b niv-core">高频必背</span>
- GET 和 POST 的真实区别是什么？（不要答「POST 更安全」）<span class="niv-b niv-core">高频必背</span>
- 常见状态码有哪些？301 和 302、502 和 504、403 和 404 分别什么区别？<span class="niv-b niv-core">高频必背</span>
- 强缓存和协商缓存怎么工作？为什么我改了文件浏览器还拿旧的？<span class="niv-b niv-key">场景追问</span>
- Cookie 是干嘛的？它和 Session 什么关系？<span class="niv-b niv-key">场景追问</span>
- HTTP 是无状态的，那 Keep-Alive（长连接）又是什么？<span class="niv-b niv-adv">进阶加分</span>
- GET 请求能不能带 body？表单为什么默认用 POST？<span class="niv-b niv-adv">进阶加分</span>

## 📖 核心八股：先讲清楚定义

HTTP（超文本传输协议）就是浏览器和服务器之间约定的「说话格式」：客户端发一个请求，服务器回一个响应，一问一答。它跑在 TCP 之上（HTTP/3 例外，见下一讲），本身是**无状态**的，意思是服务器默认不记得你上一次请求是谁发的。

### 请求报文的结构

一条 HTTP 请求分四块：请求行、请求头、空行、请求体。

```http
POST /api/login HTTP/1.1        ← 请求行：方法 + 路径 + 协议版本
Host: example.com               ← 请求头开始
Content-Type: application/json
Content-Length: 34
Cookie: session=abc123
                                ← 一个空行，代表头部结束
{"user":"tom","password":"***"}  ← 请求体（GET 通常没有）
```

响应报文结构几乎对称：状态行、响应头、空行、响应体。

```http
HTTP/1.1 200 OK                 ← 状态行：协议版本 + 状态码 + 原因短语
Content-Type: application/json
Content-Length: 27
Set-Cookie: session=abc123; HttpOnly
                                ← 空行
{"code":0,"msg":"login ok"}     ← 响应体
```

<div class="niv-a">
<strong>标准回答模板：</strong>HTTP 请求由「请求行 + 请求头 + 空行 + 请求体」四部分构成。请求行放方法、路径和版本；请求头是一堆 key-value 元信息，比如 Host、Content-Type；空行标志头部结束；请求体放实际数据，GET 一般没有。响应结构对称，只是请求行换成了「版本 + 状态码 + 原因短语」的状态行。
</div>

### 常见的 HTTP 方法

- **GET**：获取资源，语义上是「只读」，应该是安全（不改服务器状态）且幂等的。
- **POST**：提交数据，创建资源或触发操作，不幂等（点两次可能下两个单）。
- **PUT**：整体替换资源，幂等（同样的请求发多次结果一致）。
- **DELETE**：删除资源，幂等。
- **HEAD**：和 GET 一样但只要响应头、不要 body，常用来探测。
- **OPTIONS**：查询服务器支持哪些方法，跨域预检就靠它（第12讲展开）。

<div class="niv-why">
<strong>为什么强调「幂等」和「安全」？</strong>因为面试官经常借 GET/POST 引出这两个词。安全 = 不改变服务器状态；幂等 = 重复执行结果一致。GET/HEAD 既安全又幂等，PUT/DELETE 幂等但不安全，POST 两者都不是。注意：这是 HTTP 语义上的「约定」，服务器完全可以写一个会改数据的 GET 接口，但那是不规范的做法。
</div>

### GET 和 POST 的真实区别

这是重灾区。先说结论：**GET 和 POST 的本质区别是语义不同**（GET 取数据、POST 提交数据），其他差异大多是「习惯」或「浏览器/服务器实现」带来的，不是协议强制的。

| 对比点 | GET | POST |
| --- | --- | --- |
| 语义 | 获取资源 | 提交/创建 |
| 参数位置 | 通常放 URL 查询串 | 通常放请求体 |
| 是否幂等 | 是 | 否 |
| 能否被缓存 | 默认可被缓存 | 默认不缓存 |
| 浏览器后退/刷新 | 无副作用，直接重取 | 会提示「确认重新提交表单」 |
| URL 长度 | 受浏览器/服务器限制 | 不受此限（body 里） |

<div class="niv-why">
<strong>为什么说「POST 更安全」是错的？</strong>GET 参数在 URL 里，会进浏览器历史、服务器访问日志、Referer，确实更容易泄露；但 POST 的 body 在 HTTP 明文传输下同样是裸奔的，抓包一样能看。真正保证传输安全的是 HTTPS，不是选 GET 还是 POST。所以「POST 比 GET 安全」这个说法站不住脚，顶多说「GET 参数更容易被无意记录下来」。
</div>

<div class="niv-why">
<strong>「GET 有长度限制」也要说清楚。</strong>HTTP 协议本身没规定 URL 最大长度，这个限制来自浏览器和服务器的实现（不同产品阈值不同，取决于实现），所以严谨说法是「URL 长度受实现限制」，而不是「协议规定 GET 最多多少字节」。
</div>

### 状态码：面试必问的几组对比

状态码按第一位分五类：

- **1xx** 信息，很少见（如 100 Continue）。
- **2xx** 成功：200 OK、201 Created、204 No Content（成功但无返回体）。
- **3xx** 重定向：301、302、304。
- **4xx** 客户端错误：400、401、403、404。
- **5xx** 服务端错误：500、502、503、504。

重点几组区别：

```text
301 永久重定向  →  资源永久搬家，浏览器/搜索引擎会记住，下次直接走新地址
302 临时重定向  →  临时跳转，下次仍请求原地址（307 是更严格的临时重定向，不改方法）
304 Not Modified → 协商缓存命中，资源没变，直接用本地缓存，不返回 body

400 请求本身格式错  ←→  401 没认证（未登录）  ←→  403 认证了但没权限  ←→  404 资源不存在

500 服务器内部错误（代码抛异常了）
502 Bad Gateway    → 网关/代理拿到了上游一个坏响应（上游挂了/返回非法）
503 Service Unavailable → 服务暂时不可用（过载、维护中）
504 Gateway Timeout → 网关等上游响应超时，上游没在规定时间内回
```

<div class="niv-why">
<strong>502 和 504 的区别是高频追问点。</strong>两者都出现在「有网关/反向代理」的架构里。502 是网关**收到了**上游的响应，但这个响应是坏的、非法的；504 是网关**根本没等到**上游响应，超时了。一句话记：502=上游给了个烂东西，504=上游没吭声。第12讲会专门讲怎么排。
</div>

### 重要的 Header

- **Host**：请求哪个域名，HTTP/1.1 强制要求（一个 IP 上跑多个站点靠它区分）。
- **Content-Type**：body 的格式，如 `application/json`、`application/x-www-form-urlencoded`、`multipart/form-data`。
- **Content-Length**：body 字节数。
- **User-Agent**：客户端标识。
- **Cache-Control**：缓存策略核心（下面讲）。
- **Set-Cookie / Cookie**：服务器种 Cookie / 客户端带 Cookie。
- **Connection: keep-alive**：控制长连接。

### Cookie 与 Session

HTTP 无状态，服务器认不出「你是谁」。**Cookie** 就是解决方案：服务器通过响应头 `Set-Cookie` 让浏览器存一小段数据，之后浏览器每次请求同域名都自动带上 `Cookie` 头，服务器就能认出你。

**Session** 是服务端的会话机制：服务器给你分配一个 session id，通过 Cookie 发给浏览器；真正的用户数据（登录态、购物车等）存在服务端。所以常见组合是「Cookie 存 session id + 服务端存 session 内容」。

```text
第一次登录：
  浏览器 → POST /login → 服务器
  服务器验证通过，生成 session，Set-Cookie: session=abc123
  浏览器把 abc123 存起来

之后每次请求：
  浏览器 → GET /profile   Cookie: session=abc123 → 服务器
  服务器拿 abc123 查出「这是 tom」，返回 tom 的数据
```

<div class="niv-why">
<strong>Cookie 是「机制」，Session 是「用途」。</strong>Cookie 只是浏览器存数据、自动回传的通用能力；Session 是「用 Cookie 携带的 id 来维持登录态」这种具体玩法。登录态、Token、JWT、SameSite、CSRF 这些更深的内容在第10讲专门讲，这里只要说清 Cookie/Session 的基本关系即可。
</div>

### HTTP 缓存：强缓存与协商缓存

浏览器缓存分两层，先查强缓存，没命中再问协商缓存。

**强缓存**：浏览器自己判断本地副本还没过期，压根不发请求。

- `Cache-Control: max-age=3600`：3600 秒内直接用本地缓存（推荐，优先级高）。
- `Expires: <绝对时间>`：老字段，指定一个过期时间点，受本地时钟影响，现在多被 Cache-Control 取代。

**协商缓存**：强缓存过期后，浏览器带上「校验信息」问服务器「我这份还能用吗」，能用就返回 **304 Not Modified**，不用重传 body。

- `Last-Modified` / `If-Modified-Since`：基于文件最后修改时间。
- `ETag` / `If-None-Match`：基于内容指纹（哈希），比时间更精确。

```text
第一次请求 style.css：
  服务器返回 200 + Cache-Control: max-age=600 + ETag: "v1"

600 秒内再次请求：
  强缓存命中，浏览器不发请求，直接用本地（Network 里显示 from disk/memory cache）

600 秒后再次请求：
  浏览器发请求，带 If-None-Match: "v1"
  文件没变 → 服务器返回 304，浏览器继续用本地（省了 body 传输）
  文件变了 → 服务器返回 200 + 新内容 + 新 ETag
```

## 🔍 场景追问：面试官会顺着问

<div class="niv-scene"><strong>追问：</strong>你说 GET 一般没有 body，那 GET 到底能不能带请求体？</div>

可以带，但不建议、也不保证有效。HTTP 规范并没有禁止 GET 携带 body，但也明确说 GET 的 body 没有被定义的语义，很多服务器、代理、缓存会直接忽略甚至丢弃它（具体行为取决于实现）。所以工程上：需要传复杂结构化查询条件时，要么塞进 URL 查询串，要么干脆用 POST，不要指望 GET body 到处都能被正确处理。回答时点出「协议不禁止，但语义未定义 + 中间设备处理不一致」就到位了。

<div class="niv-scene"><strong>追问：</strong>那表单为什么默认用 POST，什么时候用 GET？</div>

HTML 表单 `method` 默认其实是 GET，但涉及「提交数据、改状态」的表单我们习惯写成 POST，原因有几个：一是语义正确，注册/下单是「提交」不是「获取」；二是 GET 会把字段拼到 URL 上，密码之类的敏感字段会进历史记录、日志、Referer；三是 GET 表单刷新/后退会无副作用地重发，而 POST 会提示「确认重新提交」，能避免重复下单。反过来，搜索框这种「取数据、希望能收藏/分享结果链接」的场景，用 GET 更合适，因为参数在 URL 里可以直接分享。

<div class="niv-scene"><strong>追问：</strong>我改了 CSS 文件重新发布，为什么用户还看到旧样式？怎么解决？</div>

八成是强缓存在作祟：文件名没变，`Cache-Control: max-age` 还没到期，浏览器根本没来问服务器，直接用了本地旧文件。解决办法是**给静态资源加内容指纹**，也就是文件名带上哈希（如 `style.a1b2c3.css`），内容一变文件名就变，URL 变了自然不会命中旧缓存，这叫缓存失效（cache busting）。对 HTML 入口文件则通常设为不强缓存或短缓存 + 协商缓存，保证它能及时拿到新的资源引用。回答时把「强缓存导致不发请求」这个根因说清楚，再给「哈希文件名」这个标准解法，就是满分。

<div class="niv-scene"><strong>追问：</strong>HTTP 是无状态的，那 Keep-Alive 到底保持了什么？</div>

要区分两个「状态」。HTTP 的**无状态**指的是「请求之间业务上互不记忆」，服务器不会因为这次是 keep-alive 就记得你上次是谁，那是 Cookie/Session 干的事。Keep-Alive（长连接）保持的是**底层 TCP 连接不立刻关闭**，让同一个连接上能连续发多个 HTTP 请求，省掉每次都三次握手建连、四次挥手断连的开销。HTTP/1.1 默认开启长连接，用 `Connection: keep-alive`，可以用 `Connection: close` 显式关闭。所以「无状态」和「长连接」不矛盾：一个说业务不记忆，一个说传输通道复用。

## 🛠 动手验证（可选做）

用 `curl -v` 可以看到完整的请求头和响应头，包括状态码、Set-Cookie、缓存字段。

```bash
# -v 打印请求和响应的头部；下面这条能直观看到状态行、响应头、redirect 等
curl -v https://httpbin.org/get

# 看重定向：httpbin 的 redirect 接口会回 302，-v 里能看到 Location 头
curl -v https://httpbin.org/redirect-to?url=https://example.com

# 发一个 POST 并带 JSON body，观察请求里的 Content-Type / Content-Length
curl -v -X POST https://httpbin.org/post \
  -H 'Content-Type: application/json' \
  -d '{"user":"tom"}'

# 只看响应头（等价于发 HEAD），方便观察 Cache-Control / ETag
curl -I https://httpbin.org/cache
```

跑第一条时重点看输出里 `>` 开头的行（你发出去的请求头）和 `<` 开头的行（服务器回来的响应头），把前面讲的报文结构和真实输出对上号，记忆会牢很多。

## 🧨 高频翻车点

<div class="niv-trap">
<strong>翻车 1：「POST 比 GET 安全」。</strong>错。明文 HTTP 下两者 body/参数都能被抓包看到，安全靠 HTTPS。正确说法：GET 参数在 URL 里更容易被日志/历史/Referer 无意记录，但这不等于 POST「安全」。
</div>

<div class="niv-trap">
<strong>翻车 2：把 301 和 302 说反，或分不清 502/504。</strong>301 永久（会被缓存、SEO 传递权重），302 临时（下次仍请求原地址）。502=网关收到上游坏响应，504=网关等上游超时。答之前先想清楚「有没有网关」「是没等到还是等到坏的」。
</div>

<div class="niv-trap">
<strong>翻车 3：说「304 会重新下载文件」。</strong>恰恰相反，304 Not Modified 表示资源没变，服务器不返回 body，浏览器继续用本地缓存，正是为了省下这次传输。会重新下载完整内容的是 200。
</div>

## 🎤 面试话术模板

<div class="niv-a">
<strong>30 秒口述版（GET vs POST）：</strong>「HTTP 请求由请求行、请求头、空行、请求体组成，响应结构对称。GET 和 POST 最本质的区别是语义：GET 是获取资源、约定上安全且幂等，参数一般放 URL；POST 是提交数据、不幂等，参数放请求体。至于常说的『POST 更安全』『GET 有长度限制』其实不准确：明文下两者都能被抓包，安全靠 HTTPS；URL 长度限制来自浏览器和服务器实现而非协议。所以选 GET 还是 POST，我主要看语义——取数据用 GET、改状态用 POST，比如搜索用 GET 便于分享链接，登录下单用 POST 避免参数进日志和重复提交。」
</div>

## ✅ 自测三问

1. 一条 HTTP 响应报文由哪几部分组成？304 属于哪一类、代表什么？
2. 强缓存和协商缓存分别靠哪些 Header 工作？为什么改了文件用户还拿旧的、怎么解决？
3. 502 和 504 有什么区别？分别说明上游发生了什么？

<details class="niv-fold"><summary>对答案</summary>

1. 状态行（版本 + 状态码 + 原因短语）+ 响应头 + 空行 + 响应体。304 是 3xx 重定向类里的 Not Modified，表示协商缓存命中、资源未变、不返回 body，浏览器用本地缓存。

2. 强缓存靠 `Cache-Control: max-age`（优先）和 `Expires`，命中时不发请求；协商缓存靠 `ETag`/`If-None-Match` 和 `Last-Modified`/`If-Modified-Since`，未变返回 304。改了还拿旧的是因为强缓存没过期、根本没发请求；解决办法是给静态资源用带内容哈希的文件名，内容变则 URL 变，绕开旧缓存。

3. 都在有网关/代理的场景下出现。502 Bad Gateway 是网关收到了上游的坏响应（上游挂了或返回非法）；504 Gateway Timeout 是网关等上游响应超时、根本没等到。记法：502=给了烂东西，504=没吭声。

</details>

## 📦 复制带走

<div class="niv-card">
<strong>报文结构：</strong>请求 = 请求行 + 头 + 空行 + 体；响应 = 状态行 + 头 + 空行 + 体。空行是头部结束的标志。
</div>

<div class="niv-card">
<strong>GET vs POST 一句话：</strong>本质是语义（取 vs 交）。GET 安全幂等可缓存、参数在 URL；POST 不幂等默认不缓存、参数在 body。「POST 更安全」「GET 协议限长」都是误区。
</div>

<div class="niv-card">
<strong>状态码速记：</strong>301 永久 / 302 临时 / 304 缓存未变；401 没登录 / 403 没权限 / 404 不存在；500 服务端崩 / 502 上游坏响应 / 504 上游超时。
</div>

<div class="niv-card">
<strong>缓存 + 长连接：</strong>强缓存不发请求（Cache-Control/Expires），协商缓存发请求换 304（ETag/Last-Modified）；Keep-Alive 复用的是 TCP 连接，和 HTTP 无状态不冲突。
</div>

<p style="margin-top:24px"><a href="/courses/net-interview/">← 回到《秋招计网面试实战课》目录</a></p>
