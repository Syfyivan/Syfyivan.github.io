---
title: "《秋招计网面试实战课》第11讲 · 网络性能优化（减少 DNS 查询、连接复用、HTTP 缓存、CDN、压缩、HTTP/2、静态资源优化）"
date: 2026-07-09 19:00:00
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
「你做过什么性能优化？」这是面试从八股转向工程的关键一问。很多人只会答一句「加了缓存」，就被追问打穿：加的是强缓存还是协商缓存？两者区别是什么？为什么 CDN 能加速？连接复用是复用了什么？这一讲把一次请求「从发起到拿到资源」这条链路上能做的优化点全部串起来：从减少 DNS 查询、连接复用，到 HTTP 缓存、CDN、压缩、HTTP/2 多路复用，再到前端静态资源的合并、预连接、懒加载。目标是让你能顺着一条清晰的链路把优化点讲成一套体系，而不是零散地报名词。
</div>

## 🎯 这一讲能答对哪些面试题

- 你做过哪些网络 / 前端性能优化？<span class="niv-b niv-core">高频必背</span>
- 强缓存和协商缓存的区别？分别用哪些 Header？<span class="niv-b niv-core">高频必背</span>
- CDN 为什么能加速？它的原理是什么？<span class="niv-b niv-core">高频必背</span>
- 连接复用 / Keep-Alive / 连接池是什么，复用了什么？<span class="niv-b niv-key">场景追问</span>
- gzip 和 br 压缩是怎么协商的？<span class="niv-b niv-key">场景追问</span>
- HTTP/2 相比 HTTP/1.1 在性能上做了什么？<span class="niv-b niv-adv">进阶加分</span>
- 前端还有哪些减少请求 / 加快加载的手段（合并、预连接、懒加载）？

## 📖 核心八股：先讲清楚定义

先把优化的思路框住。一次请求的耗时可以拆成几段：DNS 解析、TCP 建连、TLS 握手、请求发出到拿到第一个字节（TTFB）、内容下载。性能优化本质就是围绕这几段做文章：要么让某一段更快，要么直接省掉某一段（比如缓存命中就完全不发请求）。

```text
一次请求耗时构成 (优化就是缩短或省掉其中某几段)
┌────────┬──────────┬──────────┬──────────┬──────────┐
│  DNS   │  TCP连接 │  TLS握手 │  等待响应 │  内容下载 │
│ 减少查询│ 连接复用 │  会话复用 │  CDN就近  │ 压缩/缓存 │
└────────┴──────────┴──────────┴──────────┴──────────┘
最强的优化: 命中缓存 → 上面几段全部省掉
```

术语先落地：

- DNS 查询：把域名翻译成 IP 的过程，第一次访问一个域名要走一遍解析，有耗时。
- 连接复用：一条 TCP 连接建好后，多个请求接着用，不用每次重新握手。
- 缓存：把资源存起来，下次直接用本地或就近的副本，减少甚至免去请求。
- CDN：内容分发网络，把资源提前铺到离用户近的节点上。

### 减少 DNS 查询

DNS 解析虽然通常不慢，但一个页面如果引用了很多不同域名的资源，每个新域名首次访问都要解析一次，累加起来就有感知。优化方向：

- 减少页面用到的不同域名数量（域名收敛），能少一次解析就少一次。
- 利用浏览器 / 系统 / 递归解析器的多级 DNS 缓存，命中缓存就不再查（缓存时长由 TTL 决定，这在第09讲讲过）。
- 对确定要访问的关键域名，用 `dns-prefetch` 让浏览器提前把解析做掉。

### 连接复用（Keep-Alive / 连接池）

<div class="niv-a">
<strong>标准回答模板：</strong>连接复用指的是一条已经建好的 TCP 连接，被多个 HTTP 请求接着使用，而不是每个请求都新建一条连接再关掉。它省掉的是「重复的 TCP 三次握手 + TLS 握手」的开销。<br>
- 浏览器侧：HTTP/1.1 默认开启 Keep-Alive（持久连接），一条连接处理完一个请求后不马上关，可以继续发下一个请求。<br>
- 服务端 / 后端调用侧：用「连接池」预先建好一批连接放着复用，需要时取一条用完还回去，避免高频建连断连。
</div>

<div class="niv-why">
<strong>为什么复用连接能提速？</strong>建一条 TCP 连接要三次握手（一个往返 RTT），HTTPS 还要再叠加 TLS 握手（又是一到两个 RTT，具体轮次取决于 TLS 版本，见第05讲）。如果每个请求都重新建连，这些握手的往返时延会重复付出很多遍。复用连接就把这些一次性开销摊掉了，尤其在高延迟网络下收益明显。注意 Keep-Alive 是「持久连接」的意思，不要和 TCP 自身的保活探测机制混为一谈，虽然名字像。
</div>

### HTTP 缓存：强缓存 vs 协商缓存（重点）

这是本讲最高频、也最容易答混的点。HTTP 缓存分两类，一定要分清楚。

<div class="niv-a">
<strong>标准回答模板：</strong>HTTP 缓存分强缓存和协商缓存。<br>
<strong>强缓存</strong>：浏览器直接判断本地缓存有没有过期，没过期就直接用本地副本，<strong>根本不发请求</strong>给服务器，返回状态在开发者工具里显示为「from cache」。控制它的 Header 是 <code>Cache-Control</code>（如 <code>max-age=3600</code>）和老的 <code>Expires</code>。<br>
<strong>协商缓存</strong>：强缓存过期后，浏览器<strong>会发一个请求带上标识去问服务器</strong>「我这份还能用吗」，服务器如果判断没变就返回 <strong>304 Not Modified</strong>（不带响应体），浏览器继续用本地副本；变了才返回 200 加新内容。控制它的 Header 是 <code>ETag</code> / <code>If-None-Match</code> 和 <code>Last-Modified</code> / <code>If-Modified-Since</code>。
</div>

两者的关键差异，用一张对照记牢：

```text
                 强缓存                    协商缓存
是否发请求      不发, 直接用本地           发, 但只问"变没变"
命中表现        200 (from cache)          304 Not Modified (无响应体)
控制Header      Cache-Control / Expires   ETag/If-None-Match
                                          Last-Modified/If-Modified-Since
判断在哪        浏览器本地判断             服务器判断
省的是什么      整个请求                   响应体的传输 (仍有一次往返)
```

<div class="niv-why">
<strong>为什么有了强缓存还要协商缓存？</strong>强缓存最省（连请求都不发），但它是「盲信」本地副本没过期，如果资源提前变了、而 max-age 还没到，用户就会看到旧内容。协商缓存牺牲一次「问一下」的往返，换来「内容变了能及时拿到新的、没变则只回一个轻量的 304 不重复传内容」的安全性。实际工程里两者配合：先看强缓存有没有命中，没命中（过期了）再走协商缓存去问服务器。
</div>

<div class="niv-why">
<strong>Cache-Control vs Expires，ETag vs Last-Modified 谁优先？</strong><code>Cache-Control</code> 是 HTTP/1.1 引入的，用相对时间（max-age 秒数），优先级高于用绝对时间的 <code>Expires</code>；因为 Expires 依赖客户端本地时间，时钟不准就会失效。协商缓存里 <code>ETag</code>（内容指纹）优先级高于 <code>Last-Modified</code>（最后修改时间），因为 Last-Modified 只精确到秒、且「修改时间变了但内容没变」也会误判，ETag 对内容更精确。</div>

### CDN：为什么能加速

<div class="niv-a">
<strong>标准回答模板：</strong>CDN 加速靠两件事：<strong>就近访问</strong>和<strong>边缘缓存</strong>。<br>
1. <strong>就近</strong>：CDN 在全国 / 全球部署了很多边缘节点，用户请求会被调度（通常通过 DNS 解析把域名指到最近的节点）到地理和网络上离自己最近的节点，物理距离短、往返时延小。<br>
2. <strong>边缘缓存</strong>：静态资源（图片、JS、CSS、视频等）被提前或首次访问后缓存在这些边缘节点上，用户直接从近处的节点拿，不用每次都回到遥远的源站，既快又给源站减压。
</div>

<div class="niv-why">
<strong>CDN 是怎么把用户调度到最近节点的？</strong>常见做法是基于 DNS 的调度：你访问的域名 CNAME 指向 CDN 的调度域名，CDN 的权威 DNS 根据请求来源（解析器所在地/IP）返回一个就近节点的 IP。所以「就近」在很大程度上是通过 DNS 解析这一步完成的。边缘节点没命中缓存时会回源站取一次，再缓存下来供后续用户使用。</div>

### 压缩：gzip / br

传输前把文本类资源（HTML/CSS/JS/JSON）压缩，能显著减小体积、缩短下载时间。图片、视频这类本身已压缩的二进制通常不再用 gzip。

<div class="niv-why">
<strong>压缩是怎么协商的？</strong>浏览器在请求头带 <code>Accept-Encoding: gzip, br</code> 表示「我支持这些压缩算法」，服务器从中选一种压缩，然后用响应头 <code>Content-Encoding: br</code>（或 gzip）告诉浏览器「我用了这个」，浏览器再解压。br（Brotli）通常比 gzip 压缩率更高，但兼容与开销要看场景，服务器一般根据客户端支持情况择优。这是典型的「内容协商」。</div>

### HTTP/2 带来的性能提升

HTTP/2 的细节在第04讲讲过，这里从「优化」的角度归纳它为什么快：

- 多路复用：一条 TCP 连接上并行跑多个请求 / 响应，不再像 HTTP/1.1 那样受限于「一条连接一次一个请求」的队头阻塞。
- 头部压缩（HPACK）：请求头很多字段是重复的，压缩后省流量。
- 服务器推送（server push）：服务器可主动把关联资源推给客户端（实际使用中收益有限、逐渐被冷落，答的时候点到即可，别吹过头）。

<div class="niv-why">
<strong>有了 HTTP/2，之前的一些 HTTP/1.1 优化技巧还要做吗？</strong>像「雪碧图合并小图」「域名分片」这类是为了绕开 HTTP/1.1 并发连接数少、队头阻塞的问题。到了 HTTP/2 多路复用后，这些技巧收益变小甚至可能有反效果（合并成一个大文件反而不利于按需缓存）。所以优化手段要看协议版本，别机械照搬。</div>

### 前端静态资源优化

- 合并 / 拆分要平衡：HTTP/1.1 时代倾向合并减少请求数；HTTP/2 下更倾向合理拆分以利用多路复用和精细化缓存。
- 预连接：用 `preconnect` 对关键第三方域名提前完成 DNS + TCP + TLS，等真正要请求时直接用；`dns-prefetch` 是更轻的只做 DNS 解析。
- 懒加载：首屏用不到的图片 / 组件延迟到即将进入视口时再加载，减少首屏请求量和体积。
- 资源指纹 + 长强缓存：给文件名加内容 hash（如 `app.3f9a.js`），内容不变文件名不变，就能放心设很长的强缓存；内容变了文件名变，天然刷新缓存。这招把「强缓存要激进」和「更新要及时」两个矛盾漂亮地解决了。

## 🔍 场景追问：面试官会顺着问

<div class="niv-scene"><strong>追问：</strong>强缓存和协商缓存到底有什么区别？请求发不发？状态码分别是什么？</div>

要点（这题必须一字不含糊）：

- 强缓存：命中时浏览器<strong>不发请求</strong>，直接用本地副本。控制 Header 是 `Cache-Control`（如 `max-age`）和 `Expires`。开发者工具里表现为 200 (from disk/memory cache)。
- 协商缓存：强缓存过期后，浏览器<strong>发请求</strong>带上 `If-None-Match`（对应 `ETag`）或 `If-Modified-Since`（对应 `Last-Modified`）去问服务器。没变返回 <strong>304</strong>（无响应体，浏览器用本地副本）；变了返回 200 加新内容。
- 一句话点破区别：强缓存省的是「整个请求」，协商缓存省的是「响应体的重复传输」（仍要一次往返去问）。二者是配合关系，先强缓存后协商缓存。

<div class="niv-scene"><strong>追问：</strong>CDN 加速的原理讲一下？为什么从 CDN 拿比回源站快？</div>

要点：

- 两个核心：就近 + 边缘缓存。就近靠 DNS 调度把用户导向最近节点，缩短物理 / 网络距离降低 RTT；边缘缓存把静态资源存在近处节点，命中就不用回源站。
- 回源站慢的原因：源站可能在很远的机房，跨地域甚至跨国，往返时延大、还可能有网络拥塞；而且所有用户都回源站会给源站带来压力。CDN 把大部分流量在边缘就地消化了。
- 补充加分：CDN 一般缓存静态资源（图片、JS、CSS、视频），动态接口通常不缓存或只做很短缓存 / 动态加速。别说「CDN 能缓存一切」。

<div class="niv-scene"><strong>追问：</strong>连接复用具体复用了什么？为什么能省时间？</div>

要点：

- 复用的是已经建好的 TCP 连接（HTTPS 场景还连带复用了 TLS 会话），后续请求不用再走三次握手和 TLS 握手。
- 省的是握手带来的往返时延（RTT），在高延迟网络下每次握手都是实打实的等待。
- HTTP/1.1 用 Keep-Alive 持久连接实现，但一条连接同一时刻只能处理一个请求（有队头阻塞）；HTTP/2 更进一步在一条连接上多路复用并发多个请求。后端服务之间调用则常用连接池维持一批可复用连接。

<div class="niv-scene"><strong>追问：</strong>一个页面加载很慢，你从优化角度会怎么排查该优化哪一段？</div>

要点：先测量再优化，别拍脑袋。

- 用浏览器开发者工具的 Network / Performance 面板，或 `curl -w` 看各阶段耗时（DNS、连接、TLS、TTFB、下载），找出瓶颈在哪一段。
- DNS 慢 → 域名收敛 + 预解析；建连慢 → 连接复用 / HTTP/2 / CDN 就近；TTFB 慢 → 可能是后端处理慢（超出纯网络范畴）；下载慢 → 压缩 + 缓存 + 减小资源体积。
- 能免则免：能命中强缓存的直接不发请求，是收益最大的优化。

## 🛠 动手验证（可选做）

用 `curl` 亲手看缓存 Header 和各阶段耗时，把八股和现象对上。

```bash
# 1) 看响应里的缓存相关 Header (强缓存/协商缓存的标识都在这里)
# -I 只取响应头, -s 安静, -L 跟随跳转
curl -sI https://www.example.com/ | grep -iE 'cache-control|expires|etag|last-modified|content-encoding'
```

```bash
# 2) 验证协商缓存: 先拿到 ETag, 再带着它请求, 未变应返回 304
etag=$(curl -sI https://www.example.com/ | awk -F'"' '/[Ee][Tt]ag/{print $2}')
curl -s -o /dev/null -w "HTTP状态: %{http_code}\n" \
     -H "If-None-Match: \"$etag\"" https://www.example.com/
# 命中协商缓存时应看到 304
```

```bash
# 3) 用 -w 拆解一次请求各阶段耗时, 定位瓶颈在哪一段
curl -s -o /dev/null -w \
"DNS解析:   %{time_namelookup}s\nTCP连接:   %{time_connect}s\nTLS握手:   %{time_appconnect}s\n首字节TTFB: %{time_starttransfer}s\n总耗时:    %{time_total}s\n" \
https://www.example.com/
```

```bash
# 4) 验证压缩: 主动声明支持 gzip/br, 看服务器是否返回 Content-Encoding
curl -sI -H "Accept-Encoding: gzip, br" https://www.example.com/ | grep -i content-encoding
```

看第 3 条的输出，如果第二次请求（连接可复用时）`time_connect` 和 `time_appconnect` 明显变小，就直观感受到了连接复用省下的握手时间。

## 🧨 高频翻车点

<div class="niv-trap">
<strong>翻车 1：把强缓存和协商缓存说反或说混。</strong>常见错误是「强缓存返回 304」「协商缓存不发请求」，全反了。正确：强缓存不发请求、直接用本地（200 from cache），协商缓存发请求去问、未变返回 304。强缓存看 Cache-Control/Expires，协商缓存看 ETag/Last-Modified。
</div>

<div class="niv-trap">
<strong>翻车 2：说「CDN 能缓存所有内容 / 能加速动态接口」。</strong>正确：CDN 主要缓存静态资源；动态、个性化、频繁变化的接口通常不缓存或只做很短缓存 / 走动态加速。加速原理要落到「就近 + 边缘缓存」，别只甩一句「CDN 快」。
</div>

<div class="niv-trap">
<strong>翻车 3：把 HTTP Keep-Alive（持久连接）和 TCP 的保活探测混为一谈。</strong>正确：HTTP Keep-Alive 指一条 TCP 连接复用给多个 HTTP 请求；TCP 的 keepalive 是内核定期探测对端是否还活着的机制，两者不是一回事。面试里说「连接复用」时指的是前者。
</div>

## 🎤 面试话术模板

<div class="niv-a">
<strong>30 秒口述版：</strong>网络性能优化就是围绕一次请求的各阶段做文章：减少 DNS 查询（域名收敛 + 预解析）、连接复用（Keep-Alive / 连接池省掉重复握手）、HTTP 缓存、CDN、压缩和 HTTP/2 多路复用。缓存要分清强缓存和协商缓存：强缓存靠 Cache-Control 或 Expires，命中就直接用本地、不发请求；协商缓存靠 ETag 或 Last-Modified，会发请求去问服务器，没变返回 304 用本地、变了返回 200 拿新的，两者先强后协商配合使用。CDN 靠就近访问加边缘缓存加速，用 DNS 调度把用户导到最近节点、静态资源就地缓存。压缩通过 Accept-Encoding 和 Content-Encoding 协商 gzip/br。前端再叠加合并拆分、preconnect 预连接、懒加载和带内容 hash 的长强缓存。核心原则是先测量定位瓶颈、再针对性优化，能命中缓存免掉请求收益最大。
</div>

## ✅ 自测三问

1. 强缓存和协商缓存分别用哪些 Header？命中时请求发不发、状态码是什么？
2. CDN 为什么能加速？它一般缓存什么、不缓存什么？
3. 连接复用复用的是什么？为什么能省时间？HTTP/1.1 和 HTTP/2 在这点上有何不同？

<details class="niv-fold"><summary>对答案</summary>

1. 强缓存用 `Cache-Control`（如 max-age）和 `Expires`，命中时浏览器不发请求、直接用本地副本，表现为 200 (from cache)；协商缓存用 `ETag`/`If-None-Match` 和 `Last-Modified`/`If-Modified-Since`，命中时会发请求去问服务器，未变返回 304（无响应体，用本地），变了返回 200 加新内容。二者先强后协商配合使用。
2. CDN 靠「就近访问 + 边缘缓存」加速：通过 DNS 调度把用户导向最近的边缘节点降低 RTT，把静态资源缓存在边缘节点上就地响应、减少回源。一般缓存图片、JS、CSS、视频等静态资源，不缓存或只极短缓存动态 / 个性化接口。
3. 复用的是已建好的 TCP 连接（HTTPS 还连带 TLS 会话），后续请求不用重复三次握手和 TLS 握手，省下的是握手的往返时延。HTTP/1.1 用 Keep-Alive 持久连接，但一条连接同一时刻只能处理一个请求（队头阻塞）；HTTP/2 在一条连接上多路复用，可并发多个请求。

</details>

## 📦 复制带走

<div class="niv-card">
<strong>缓存两类别搞反：</strong>强缓存（Cache-Control / Expires）不发请求、直接用本地、200 from cache；协商缓存（ETag / Last-Modified）发请求去问、未变 304 用本地、变了 200 拿新。先强后协商。
</div>

<div class="niv-card">
<strong>CDN 加速两支柱：</strong>就近（DNS 调度到最近边缘节点，降 RTT）+ 边缘缓存（静态资源就地命中、减少回源）。只缓存静态，动态接口一般不缓存。
</div>

<div class="niv-card">
<strong>连接复用：</strong>复用已建好的 TCP（+TLS）连接，省掉重复握手的 RTT。HTTP/1.1 Keep-Alive 一次一个请求，HTTP/2 一条连接多路复用并发多个请求。
</div>

<div class="niv-card">
<strong>优化清单速记：</strong>减少 DNS 查询、连接复用、强/协商缓存、CDN 就近、gzip/br 压缩、HTTP/2 多路复用与头部压缩、前端合并拆分 + preconnect + 懒加载 + 内容 hash 长缓存。先测量后优化。
</div>

<p style="margin-top:24px"><a href="/courses/net-interview/">← 回到《秋招计网面试实战课》目录</a></p>
