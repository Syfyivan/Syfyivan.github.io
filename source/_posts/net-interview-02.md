---
title: "《秋招计网面试实战课》第02讲 · 一次 HTTP 请求的完整链路（URL 解析→代理决策→DNS→TCP→TLS→HTTP→渲染→连接复用）"
date: 2026-07-09 10:00:00
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
上一讲说了「输入 URL 后发生了什么」是贯穿全课的主线题。这一讲我们就把这根线从头到尾走一遍，每一段先讲清「它在干嘛、边界在哪、和上一段怎么衔接」，后面各讲再分别深挖。面试官考这道题，真正想看的不是你能背多少细节，而是你脑子里有没有一张清晰的「顺序图」，以及某一步慢了你会往哪儿查。这一讲就帮你把这张图刻进脑子。
</div>

## 🎯 这一讲能答对哪些面试题

- 从输入 URL 到页面显示，完整经过哪些阶段？顺序是什么？
- DNS、TCP、TLS、HTTP 这几步谁先谁后？为什么是这个顺序？
- 走代理的时候，这条链路会有什么不一样？DNS 是谁解析的？
- HTTP 和 HTTPS 的链路差在哪一步？
- 第二次访问同一个网站，为什么比第一次快？
- 一个页面加载很慢，你怎么判断是「哪一段」慢？

## 📖 核心八股：先讲清楚定义

### 完整链路的九个阶段

先给一张总图，把顺序钉死。这是整道题的骨架，后面全是往里填肉：

```text
输入 https://www.example.com/page 回车后：

 ┌─────────────────────────────────────────────────────────┐
 │ 1. URL 解析     拆出：协议=https 域名=www.example.com      │
 │                 端口=443(默认) 路径=/page                  │
 ├─────────────────────────────────────────────────────────┤
 │ 2. 代理决策     该直连还是走代理？读系统/浏览器代理设置、     │
 │                 PAC 脚本、HTTP(S)_PROXY 环境变量。 (第15讲) │
 ├─────────────────────────────────────────────────────────┤
 │ 3. DNS 解析     域名 → IP。先查缓存(浏览器/系统/hosts)，     │
 │                 没有再递归查询拿到 IP。            (第09讲) │
 │                 注意：走代理时可能由代理来解析。            │
 ├─────────────────────────────────────────────────────────┤
 │ 4. TCP 建连     和目标(或代理) IP:端口 三次握手。   (第06讲) │
 ├─────────────────────────────────────────────────────────┤
 │ 5. TLS 握手     HTTPS 才有。协商加密套件、验证证书、          │
 │                 生成会话密钥。                     (第05讲) │
 ├─────────────────────────────────────────────────────────┤
 │ 6. 发 HTTP 请求 发送请求行 + 请求头 + (请求体)。    (第03讲) │
 ├─────────────────────────────────────────────────────────┤
 │ 7. 服务器响应   返回状态行 + 响应头 + 响应体(HTML)。         │
 ├─────────────────────────────────────────────────────────┤
 │ 8. 浏览器渲染   解析 HTML，遇到 CSS/JS/图片再发请求。        │
 ├─────────────────────────────────────────────────────────┤
 │ 9. 连接复用/关闭 Keep-Alive 复用连接，或四次挥手关闭。       │
 └─────────────────────────────────────────────────────────┘
```

<div class="niv-a">
<strong>一句话串讲版（背这个）：</strong>浏览器先解析 URL 拿到协议、域名、端口、路径；接着做代理决策，判断这个请求是直连还是走代理；然后 DNS 把域名解析成 IP（走代理时可能由代理来解析）；接着和目标（或代理）做 TCP 三次握手；<strong>如果是走代理，握手只建好了到代理的连接，还要再告诉代理真正的目标（HTTPS 先发一个 <code>CONNECT 域名:443</code> 让代理建隧道，明文 HTTP 则把完整 URL 写进请求行），代理据此替你连上目标</strong>；如果是 HTTPS 再做一次 TLS 握手协商密钥（走代理时这次握手在隧道里和真实目标端到端完成）；然后发 HTTP 请求；服务器返回响应；浏览器解析 HTML 并继续加载子资源、渲染页面；最后连接被复用或关闭。
</div>

### 逐段看清楚它在干嘛

**第 1 段 · URL 解析。** URL 是「统一资源定位符」，说白了就是资源的地址。浏览器要先把它拆开：`https` 决定用什么协议（也决定要不要 TLS、默认端口是多少），`www.example.com` 是要解析的域名，`443` 是端口（https 默认 443，http 默认 80，URL 里没写就用默认），`/page` 是路径。这一步纯本地操作，不发网络请求。

**第 2 段 · 代理决策。** 拿到目标之后、真正发起连接之前，浏览器（或命令行工具）要先决定一件事：这个请求是**直连**目标服务器，还是**先交给代理服务器**转发。代理就是一个「中间人」，你把请求发给它，由它替你去访问目标、再把结果带回来。判断走不走代理，依据这几处配置（具体以各系统实现为准）：操作系统 / 浏览器里手动设的代理、PAC 脚本（一段返回「该走哪个代理」的 JS 规则）、以及 `HTTP_PROXY` / `HTTPS_PROXY` / `NO_PROXY` 这类环境变量（命令行工具和很多程序读这个）。没有配置代理时，这一步的结论就是「直连」，链路照常往下走。

<div class="niv-why">
为什么要专门把这步拎出来？因为在如今这个 AI 时代，大家用代理非常普遍：科学上网、公司统一出口、本地抓包调试、给国外大模型 API 配代理转发……这些场景下请求都不是直连的。而一旦走代理，后面的 DNS、TCP、TLS 走向都会变（下面第 3、4 段会说）。这也是很多人「本机命令行连不上、但浏览器能开」的根因——浏览器走了代理，命令行没读到代理配置。代理这块本身值得单独学，本课第15讲专门讲透。
</div>

**第 3 段 · DNS 解析。** 计算机之间通信靠 IP，不认域名，所以要先把域名换成 IP。这一步会先查缓存（浏览器缓存 → 操作系统缓存 → hosts 文件），缓存没命中才真正去 DNS 服务器递归查询。<strong>但要注意：如果上一步决定了走代理，这个域名解析往往不是本机做的，而是由代理服务器来解析</strong>（比如 SOCKS5 的 remote DNS、HTTP 代理隧道），本机可能压根不解析这个域名。

<div class="niv-why">
为什么 DNS 一定在 TCP 之前？因为 TCP 握手需要一个明确的目标 IP 和端口，你连对方是谁都不知道，握手往哪儿发？所以顺序天然是「先拿 IP，再建连接」。这也是为什么 DNS 慢会拖累整个请求 —— 它卡在最前面。（走代理时，这个「拿 IP」的动作可能被代理接管，所以直连能 ping 通不代表代理链路通，反之亦然。）
</div>

**第 4 段 · TCP 建连。** 拿到 IP 后，做三次握手建立一条可靠的字节流通道。直连时握手对象是网站的 `IP:443`；走代理时，握手对象其实是**代理的 IP:端口**，再由代理去连目标（HTTPS 走 HTTP 代理时，浏览器会先发一个 `CONNECT 域名:443` 请求让代理建立隧道，这点第15讲细讲）。这一步的产物是一条「连上了」的 TCP 连接。

**第 5 段 · TLS 握手（仅 HTTPS）。** HTTP 是明文，HTTPS = HTTP + TLS。这一步在 TCP 连接之上再协商一套加密参数：确认用什么加密套件、验证服务器证书是不是可信、双方算出一个会话密钥，之后的 HTTP 数据都用它加密。纯 HTTP 没有这一步。

<div class="niv-why">
注意边界：TLS 握手是「在 TCP 连接建好之后」进行的，它跑在 TCP 之上。所以 HTTPS 首次连接比 HTTP 多花了 TLS 握手这一段时间。TLS 具体几个往返轮次和版本有关（TLS 1.2 与 1.3 不同），这里先记住「多了一段握手」，具体轮次第05讲讲，不要现在就背死一个数字。
</div>

**第 6、7 段 · HTTP 请求与响应。** 通道通了、密钥有了，才开始真正「要东西」。浏览器发一个 HTTP 请求（请求行 + 请求头 + 可选请求体），服务器回一个响应（状态行 + 响应头 + 响应体，比如一段 HTML）。这才是业务数据真正流动的一段。

**第 8 段 · 浏览器渲染。** 拿到 HTML 后，浏览器边解析边发现里面还引用了 CSS、JS、图片，于是又对这些子资源发起新的请求（可能复用连接，也可能新建）。这一段严格说属于浏览器工作，但面试常一起问，知道「一个页面通常不止一个请求」就够了。

**第 9 段 · 连接复用或关闭。** HTTP/1.1 默认开启 Keep-Alive，一条 TCP 连接可以连续发多个请求，省掉反复握手的开销。用完之后，连接可能被保留一段时间以便复用，也可能通过四次挥手关闭。

### 三张「顺序图」帮你记牢

面试口述时，脑子里能浮现下面这三条对比图，就不会把顺序说反：

```text
纯 HTTP（无加密）：
  DNS → TCP三次握手 → HTTP请求 → 响应
                     └────── 没有 TLS ──────┘

HTTPS（首次访问）：
  DNS → TCP三次握手 → TLS握手 → HTTP请求 → 响应
                     └ 比 HTTP 多这一段 ┘

HTTPS（二次访问，连接可复用时）：
  (命中DNS缓存) → (复用已有连接，跳过握手) → HTTP请求 → 响应
                └── 快就快在这里 ──┘
```

<div class="niv-why">
把这三条摆在一起，你会一眼看出「HTTP 和 HTTPS 差一段 TLS」「二次访问快在跳过握手」这两个高频考点，本质都是「链路里某几段被省掉或复用了」。理解了这个，你就不用死记结论，看图就能推。
</div>

## 🔍 场景追问：面试官会顺着问

<div class="niv-scene"><strong>追问：</strong>「我在本机 ping 一个域名 ping 不通，但浏览器能正常打开这个网站，为什么？」</div>

这题一问就能看出你懂不懂代理。最常见的原因就是：浏览器走了代理，而 `ping` 没走。`ping` 用的是 ICMP，且直连本机做 DNS、直接发往目标；而浏览器如果配了代理（或系统全局代理、PAC），域名解析和连接都交给代理去完成，本机既不解析这个域名、也不直接连它。所以「直连探测（ping）失败」和「浏览器（走代理）能开」完全可以并存。类似地，命令行 `curl` 连不上但浏览器能开，往往是 `curl` 没读到 `HTTP(S)_PROXY` 环境变量。答这题时点出「两条路径不一样：一条直连、一条走代理」就是满分思路。

<div class="niv-scene"><strong>追问：</strong>「走代理之后，这条链路和直连比，具体变了哪几步？」</div>

主要变三处，按链路顺序说：一是 <strong>DNS</strong>，走代理时域名常常由代理来解析（SOCKS5 remote DNS / HTTP 代理隧道），本机不一定解析；二是 <strong>TCP 握手对象</strong>，从「网站 IP」变成了「代理 IP:端口」，先连上代理，再由代理去连目标；三是 <strong>HTTPS 的建立方式</strong>，浏览器会先给代理发一个 `CONNECT 域名:443` 请求，让代理建立一条隧道，然后 TLS 握手在这条隧道里端到端完成——所以正常的 HTTP 代理是看不到 HTTPS 明文的，它只是转发加密字节。能把这三点串出来，说明你对链路是真理解，不是背的。

<div class="niv-scene"><strong>追问：</strong>「既然走代理，那抓包工具（Charles/Fiddler）为什么能看到 HTTPS 的明文内容？」</div>

这题是代理和 HTTPS 的交叉点。正常代理看不到明文，但抓包工具能看到，是因为它做了「授权的中间人」：它让你在本机**主动信任它的自签根证书**，然后它对你伪装成服务器、对服务器伪装成你，两段分别做 TLS，从而在中间拿到明文。前提是你自己安装并信任了它的根证书；如果没装，浏览器会直接报证书不受信任的错误。这也正说明了 HTTPS 证书信任链的作用——没有你的主动授权，中间人是插不进来的。这块和第05讲、第15讲深度呼应。

<div class="niv-scene"><strong>追问：</strong>「你说第二次访问同一个网站更快，快在哪几步？」</div>

这题考你对「哪些步骤可被缓存/复用」的理解。至少能答三点：一是 DNS 有缓存，第二次不用再解析域名，直接命中缓存拿 IP；二是如果连接还在 Keep-Alive 存活期内，可以直接复用，省掉 TCP 三次握手甚至 TLS 握手；三是 HTTP 缓存（强缓存/协商缓存）可能让部分资源根本不用重新下载。答的时候按「DNS 缓存 → 连接复用 → HTTP 缓存」分层说，显得有条理。具体缓存能省多少时间取决于配置和 TTL，不要报死数字。

<div class="niv-scene"><strong>追问：</strong>「页面加载很慢，你怎么判断是链路里哪一段慢？」</div>

这是本讲最重要的追问，也是把八股拉到工程的关键。思路是「按阶段拆解耗时，逐段定位」：先看 DNS 解析耗时，慢就怀疑 DNS 或本地网络；再看 TCP 建连耗时（connect），慢多半是网络往返或对端负载；再看 TLS 握手耗时，慢可能是证书链、协商开销；再看 TTFB（首字节时间），如果连接都建好了但迟迟不返回第一个字节，问题多半在服务器端处理，而不是网络。工具上，`curl -w` 就能把这几段耗时打出来（下一节动手）。答题的核心是展示你有「分段归因」的意识，而不是笼统说一句「网络慢」。

<div class="niv-scene"><strong>追问：</strong>「HTTP 和 HTTPS 的链路，具体差在哪一步？其他步骤一样吗？」</div>

差别就一处：HTTPS 在「TCP 建连」和「发 HTTP 请求」之间，多插了一段 TLS 握手。前面的 URL 解析、DNS、TCP 三次握手完全一样；后面的 HTTP 请求响应、渲染、连接复用逻辑也一样，只是 HTTPS 传的数据是加密的。所以可以干脆一句话总结：HTTPS = 在 HTTP 链路里，TCP 之后、HTTP 之前，加一段 TLS 握手，之后的报文加密传输。默认端口也不同，HTTP 是 80，HTTPS 是 443。

## 🛠 动手验证（可选做）

`curl -w` 可以把一次请求各阶段的耗时打出来，让你亲眼看到「链路是分段的」。先把格式写进一个变量，输出更清爽：

```bash
# 打印各阶段耗时（单位：秒）。-o /dev/null 丢弃正文，-s 静默，-w 输出统计
curl -o /dev/null -s -w "\
DNS解析:    %{time_namelookup}\n\
TCP建连:    %{time_connect}\n\
TLS握手:    %{time_appconnect}\n\
首字节TTFB: %{time_starttransfer}\n\
总耗时:     %{time_total}\n" \
https://www.example.com
```

```text
你会看到类似输出（数值仅示例，实际取决于网络与对端）：
DNS解析:    0.031
TCP建连:    0.078
TLS握手:    0.152
首字节TTFB: 0.240
总耗时:     0.248
```

<div class="niv-why">
这些时间是「累计值」，即从请求发起到该阶段结束的总耗时。所以某一段自身耗时 = 本阶段值 - 上一阶段值。比如 TLS 握手自身耗时约等于 time_appconnect - time_connect。看懂这个，你就能自己算出「到底是哪一段拖后腿」，这正是上面那道追问的实操答案。注意纯 HTTP（非 https）请求 time_appconnect 会是 0，因为没有 TLS 这一段。
</div>

```bash
# 想看得更细，可以让 curl 打印详细过程（握手、请求头、响应头）
curl -v https://www.example.com -o /dev/null
```

## 🧨 高频翻车点

<div class="niv-trap">
<strong>翻车零：完全忽略代理这一步，默认所有请求都是直连。</strong><br>
很多人背链路时直接从 URL 解析跳到 DNS，漏掉了代理决策。真实环境里（尤其现在挂代理很普遍）请求很可能先走代理，导致 DNS 由代理解析、TCP 连的是代理而不是网站。面试时能主动提一句「这里还有一步判断走不走代理」，就比只会背直连版本的人显得成熟。
</div>

<div class="niv-trap">
<strong>翻车一：把顺序说反或漏掉衔接关系。</strong><br>
常见错误是把 TLS 说在 TCP 之前，或者说 DNS 在 TCP 之后。记死这条因果链：要建连必须先有 IP（所以 DNS 在 TCP 前），要加密必须先有连接（所以 TLS 在 TCP 后、HTTP 前）。顺序不是背出来的，是推出来的。
</div>

<div class="niv-trap">
<strong>翻车二：认为一个页面只有一次 HTTP 请求。</strong><br>
实际上主 HTML 只是第一个请求，浏览器解析后会为 CSS、JS、图片、字体等子资源发起大量后续请求。理解这一点，才能自然衔接到「连接复用」为什么重要 —— 反复握手代价太高。
</div>

<div class="niv-trap">
<strong>翻车三：把「渲染慢」和「网络慢」混为一谈。</strong><br>
链路里第 1 到第 6 段是网络传输，第 7 段渲染是浏览器在本地干活。如果 TTFB 很快但页面还是卡，问题可能在前端渲染（JS 执行、重排重绘），不是网络。面试时能区分「传输耗时」和「渲染耗时」是个加分点，别一律甩锅给网络。
</div>

## 🎤 面试话术模板

<div class="niv-a">
「输入一个 HTTPS 网址回车后，大致九步：先解析 URL 拿到协议、域名、端口、路径；接着做一次代理决策，判断这个请求是直连还是走代理（读系统/浏览器代理设置或 PAC）；然后 DNS 把域名解析成 IP，这一步会先查缓存，走代理时可能由代理来解析；拿到 IP 后和目标（或代理）做 TCP 三次握手；因为是 HTTPS，握手之后再做一次 TLS 握手，验证证书、协商会话密钥；接着发 HTTP 请求，服务器返回响应；浏览器解析 HTML，遇到 CSS、JS、图片再发起子资源请求并渲染；最后连接靠 Keep-Alive 复用或者四次挥手关闭。如果要定位慢在哪一段，我会用 curl -w 把 DNS、connect、TLS、TTFB 各阶段耗时打出来分段归因。HTTP 和 HTTPS 的唯一区别就是中间多了一段 TLS 握手、数据加密传输，默认端口也从 80 变成 443。」
</div>

## ✅ 自测三问

1. 完整链路的九个阶段，按顺序说出来。DNS 为什么必须在 TCP 之前？
2. 本机 ping 一个域名不通、但浏览器能打开，最可能是什么原因？
3. 用 `curl -w` 看到 TCP 建连很快但 TTFB 很慢，最可能是哪一段出问题？

<details class="niv-fold"><summary>对答案</summary>

1. 九段：URL 解析 → 代理决策 → DNS 解析 → TCP 三次握手 → TLS 握手(HTTPS) → 发 HTTP 请求 → 服务器响应 → 浏览器渲染 → 连接复用/关闭。DNS 必须在 TCP 前，是因为 TCP 握手需要明确的目标 IP 和端口，没有 IP 就无处可连。

2. 最可能是浏览器走了代理而 ping 没走：ping 是直连发 ICMP、本机做解析，浏览器走代理时由代理解析域名并转发，两条路径不同，所以直连探测失败和走代理能访问可以同时成立。

3. 连接建好了但迟迟拿不到第一个字节，说明网络通路没问题，问题最可能在服务器端处理请求耗时过长（比如后端逻辑慢、数据库慢），而不是网络链路本身。

</details>

## 📦 复制带走

<div class="niv-card">
<strong>九段顺序：</strong>URL 解析 → 代理决策 → DNS → TCP 三次握手 → TLS 握手(HTTPS) → HTTP 请求 → 服务器响应 → 渲染 → 连接复用/关闭。因果链：先判断走不走代理，再拿 IP 才能建连，先有连接才能加密。
</div>

<div class="niv-card">
<strong>代理改变链路：</strong>走代理时 DNS 常由代理解析、TCP 连的是代理 IP、HTTPS 先发 CONNECT 建隧道。「ping 不通但浏览器能开」多半就是浏览器走代理、ping 直连。详见第15讲。
</div>

<div class="niv-card">
<strong>HTTP vs HTTPS：</strong>只差一段 —— HTTPS 在 TCP 之后、HTTP 之前插入 TLS 握手，之后报文加密。默认端口 80 vs 443，其余流程完全一致。
</div>

<div class="niv-card">
<strong>分段归因：</strong>慢了别甩锅「网络」。用 curl -w 看 DNS / connect / TLS / TTFB。TTFB 慢多半是服务器处理慢；connect/TLS 慢多半是网络或证书；DNS 慢则卡在最前面。
</div>

<div class="niv-card">
<strong>二次访问更快：</strong>DNS 缓存 + 连接复用(Keep-Alive) + HTTP 缓存，三层叠加。一个页面不止一个请求，子资源复用连接才不至于反复握手。
</div>

<p style="margin-top:24px"><a href="/courses/net-interview/">← 回到《秋招计网面试实战课》目录</a></p>
