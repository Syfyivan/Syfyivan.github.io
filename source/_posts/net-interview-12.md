---
title: "《秋招计网面试实战课》第12讲 · 网络问题排查（接口超时、502/504、域名解析失败、HTTPS 证书错误、跨域、curl/ping/traceroute 基础）"
date: 2026-07-09 20:00:00
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
「线上一个接口很慢 / 报错了，你怎么排查？」这是把计网知识落到工程能力的终极一问，也是很多同学最虚的地方：知道一堆协议，但真出问题不知道从哪下手，只会说「重启试试」。这一讲教你一套可复用的分层排障思路：从 DNS → 连接 → TLS → 应用一层层往下切，快速定位问题在哪一环。同时讲清几个高频报错的真正含义：502 和 504 到底差在哪、域名解析失败、HTTPS 证书错误、以及前端最烦的跨域 CORS。最后带你用 curl、ping、traceroute 这几个基础命令亲手把现象看出来。这一讲讲完，你面对「怎么排查」这类开放题就有章法了。
</div>

## 🎯 这一讲能答对哪些面试题

- 一个接口很慢 / 超时，你从网络角度怎么一步步排查？<span class="niv-b niv-core">高频必背</span>
- 502 和 504 有什么区别？分别怎么排查？<span class="niv-b niv-core">高频必背</span>
- 域名解析失败可能是什么原因？怎么确认？<span class="niv-b niv-key">场景追问</span>
- HTTPS 证书错误一般是哪些情况？<span class="niv-b niv-key">场景追问</span>
- 跨域是什么？为什么会跨域？怎么解决？<span class="niv-b niv-core">高频必背</span>
- curl / ping / traceroute 分别用来看什么？<span class="niv-b niv-adv">进阶加分</span>

## 📖 核心八股：先讲清楚定义

排查的核心不是记命令，而是有一条「分层往下切」的路线。回想第02讲那条请求链路：URL 解析 → DNS → TCP 建连 → TLS 握手 → 发 HTTP 请求 → 收响应。排障就是顺着这条链路，一层层确认「走到哪一步断了 / 慢了」。

<div class="niv-a">
<strong>标准回答模板（分层排障四步）：</strong><br>
1. <strong>DNS 层</strong>：域名能不能解析成 IP？解析到的 IP 对不对？→ 用 <code>dig</code> / <code>nslookup</code> / <code>ping 域名</code> 看。<br>
2. <strong>连接层（TCP）</strong>：能不能连到目标 IP 的端口？→ 用 <code>ping IP</code> 看通不通、<code>telnet</code> / <code>nc</code> 测端口、<code>traceroute</code> 看路由在哪断。<br>
3. <strong>TLS 层</strong>（HTTPS）：证书握手能不能过？证书有没有过期 / 域名不匹配？→ 用 <code>curl -v</code> / <code>openssl s_client</code> 看。<br>
4. <strong>应用层（HTTP）</strong>：请求发出去了，返回什么状态码？是 4xx（客户端问题）还是 5xx（服务端 / 网关问题）？→ 用 <code>curl -v</code> 看状态码和响应头，结合服务端日志。
</div>

```text
分层排障: 顺着请求链路一层层往下切
  域名解析不了?        → DNS 层    (dig / nslookup)
      │ 能解析
      ▼
  连不上IP:端口?       → 连接层    (ping / telnet / nc / traceroute)
      │ 连得上
      ▼
  证书握手报错?        → TLS 层    (curl -v / openssl s_client)
      │ 握手通过
      ▼
  返回4xx/5xx?         → 应用层    (curl -v 看状态码 + 服务端日志)
```

<div class="niv-why">
<strong>为什么要按这个顺序？</strong>因为下层不通，上层根本无从谈起：DNS 解析不出 IP，就没法建连接；连接建不上，就没法握手；TLS 握手不过，HTTP 请求发不出去。从下往上排能快速缩小范围，避免一上来就盯着业务代码看，结果发现是 DNS 挂了这种尴尬。这个「先分层定位在哪一环，再深入那一环」的思路，是这题的加分核心。</div>

### 接口超时怎么查

超时不是一个原因，先分清「卡在哪一段」：

- 连不上（connect 阶段就超时）：可能是网络不通、目标端口没开、防火墙 / 安全组拦截。先 `ping` 通不通、`telnet ip port` 端口开不开。
- 连得上但迟迟不返回（TTFB 很长）：连接建好了但服务端处理慢，多半是服务端问题（慢查询、下游依赖慢、线程池满），此时要看服务端日志和监控，不是纯网络问题。
- 用 `curl -w` 拆开各阶段耗时，一眼看出是 DNS 慢、建连慢、还是等响应慢，据此决定往哪个方向深挖。

### 502 vs 504（重点，必须分清）

这两个都是 5xx，都常出现在有网关 / 反向代理（如 Nginx）的架构里，但含义完全不同。

<div class="niv-a">
<strong>标准回答模板：</strong>先理解架构：客户端 → 网关 / 反向代理 → 上游服务（真正处理请求的后端）。<br>
<strong>502 Bad Gateway</strong>：网关作为中间人去请求上游，<strong>拿到了一个无效 / 损坏的响应</strong>，或者<strong>根本连不上上游 / 上游挂了直接断开</strong>。关键词是「上游坏了或没了」。<br>
<strong>504 Gateway Timeout</strong>：网关连上了上游、把请求发过去了，但<strong>在规定时间内没等到上游的响应</strong>，超时了。关键词是「上游还在，但太慢，没按时回」。
</div>

```text
客户端 ──► 网关/反向代理 ──► 上游服务
                 │
   502: 上游连不上 / 挂了 / 返回了坏响应   → "拿到坏东西或拿不到"
   504: 上游连上了但迟迟不回, 网关等超时   → "等太久, 超时了"
```

<div class="niv-why">
<strong>一句话区分：</strong>502 是「上游给了个坏响应，或者压根连不上 / 挂了」，504 是「上游还活着但反应太慢，网关等不及超时了」。502 更多指向上游服务本身崩了 / 没启动 / 返回异常；504 更多指向上游处理太慢或网关超时阈值设太短。<br>
<strong>排查方向：</strong>502 先看上游服务是不是挂了 / 端口对不对 / 有没有启动、返回是否符合网关预期；504 先看上游为什么这么慢（慢查询、下游卡住、GC），再看网关的超时时间设置是否合理。</div>

### 域名解析失败

现象通常是 `curl` 报 `Could not resolve host`。可能原因：

- 域名本身不存在或拼错。
- 本地 DNS 配置有问题（如 `/etc/resolv.conf` 里的解析服务器不可用）。
- DNS 服务器故障，或该域名的权威记录配置错误 / 未生效。
- 本地 `hosts` 文件有错误的强制映射，或有过期缓存。

确认方法：换用 `dig` / `nslookup` 直接查该域名能不能解析出 IP；用不同的 DNS 服务器（如 `dig @8.8.8.8 域名`）对比，判断是本地问题还是域名 / 权威侧问题。

### HTTPS 证书错误

浏览器 / curl 报证书错误，常见几类（都在 TLS 握手校验阶段）：

- 证书过期或还没生效（时间不在有效期内）。
- 证书域名不匹配：访问的域名不在证书的 CN / SAN 列表里。
- 证书链不完整或签发它的 CA 不被客户端信任（比如自签证书、中间证书没配全）。
- 客户端本机时间不对，导致误判证书过期。

<div class="niv-why">
<strong>为什么自签证书会报错？</strong>因为客户端只信任内置信任列表里的根 CA 签发的证书链。自签证书没有被信任的 CA 背书，客户端无法验证它的真实性，所以报错。这也解释了第05讲提到的：抓包工具能看 HTTPS 明文，正是因为你在本机手动信任了它的自签根证书，让它能合法地做中间人。</div>

### 跨域（CORS）

<div class="niv-a">
<strong>标准回答模板：</strong>跨域是<strong>浏览器的同源策略</strong>带来的限制，不是后端拒绝、也不是网络不通。<strong>同源</strong>指协议、域名、端口三者完全相同，任一不同就是跨域。同源策略出于安全，默认禁止一个源的页面脚本随意读取另一个源的响应。解决跨域的标准方案是 <strong>CORS</strong>：由<strong>服务端在响应头里加</strong> <code>Access-Control-Allow-Origin</code> 等字段，明确告诉浏览器「我允许这个源来访问」，浏览器才放行。
</div>

<div class="niv-why">
<strong>为什么会有「预检 OPTIONS 请求」？</strong>对于「非简单请求」（比如带自定义头、或方法是 PUT/DELETE、或特定 Content-Type），浏览器会先自动发一个 <code>OPTIONS</code> 方法的<strong>预检请求</strong>去问服务器：「我接下来想用这个方法、带这些头，你允许吗？」服务器在预检响应里用 <code>Access-Control-Allow-Methods</code>、<code>Access-Control-Allow-Headers</code> 等回答；预检通过，浏览器才发真正的请求。这是浏览器的自动行为，目的是在真正操作前先征得服务器同意。</div>

<div class="niv-why">
<strong>关键澄清：跨域是「浏览器」拦的。</strong>请求其实往往已经发到服务器、服务器也返回了，只是浏览器因为响应里没有正确的 CORS 头，把响应<strong>拦下来不给页面 JS 读</strong>。所以：用 curl / Postman 直接请求同一个接口是不会跨域的（它们没有同源策略）；跨域只发生在浏览器里。解决要在<strong>服务端加响应头</strong>，前端改不了别人的同源策略。</div>

## 🔍 场景追问：面试官会顺着问

<div class="niv-scene"><strong>追问：</strong>一个接口很慢，你从网络角度怎么一步步查？</div>

要点（体现分层 + 先测量）：

- 先 `curl -w` 拆各阶段耗时，定位慢在 DNS、建连、TLS 还是等响应（TTFB）。
- DNS 慢 → 查解析（dig / 换 DNS 对比）；建连慢 → ping / traceroute 看链路和丢包 / 绕路；TLS 慢 → 看握手；TTFB 长 → 基本是服务端处理慢，转去看服务端日志和监控（慢 SQL、下游依赖、线程池 / GC）。
- 强调：网络排查先分层缩小范围，确认是「网络链路问题」还是「服务端处理慢」，不要一上来猜。

<div class="niv-scene"><strong>追问：</strong>502 和 504 分别怎么排查？</div>

要点：

- 502：网关拿到坏响应或连不上上游 → 先确认上游服务是不是挂了 / 没启动 / 端口写错 / 崩溃重启中；再看上游返回是否符合网关预期（比如返回了非法响应）。核心是「上游本身有没有问题」。
- 504：网关等上游超时 → 先看上游为什么慢（慢查询、下游卡住、资源打满、Full GC），再看网关的超时阈值是不是设得太短。核心是「上游太慢 / 超时设置」。
- 一句话总结方向：502 查「上游死没死 / 返回对不对」，504 查「上游为什么慢 + 超时够不够」。

<div class="niv-scene"><strong>追问：</strong>前端调接口报跨域，你怎么解决？能靠前端改吗？</div>

要点：

- 先说清本质：跨域是浏览器同源策略的限制，需要服务端在响应头加 CORS 字段（`Access-Control-Allow-Origin` 等）来放行；非简单请求还会先有 OPTIONS 预检，服务端也要正确响应预检。
- 正规解决：让后端配置 CORS 响应头（或由网关统一加）。这是根治方案。
- 前端 / 开发期的变通：本地开发用代理（devServer proxy）让请求走同源转发；线上用 Nginx 反向代理把接口挂到同一个域名下。但要点明这些是「绕开同源」的手段，真正的授权还是服务端说了算。
- 别答 JSONP 当唯一方案：那是老技术、只支持 GET、有安全问题，现代基本用 CORS。

<div class="niv-scene"><strong>追问：</strong>用户说打不开网站，你手上只有一台能上网的机器，怎么初步定位？</div>

要点（把命令串成排查流程）：

- `ping 域名`：能不能解析 + 通不通。若报「无法解析主机」→ DNS 问题；能解析但全部超时 → 可能网络不通或对方禁 ping（注意 ping 不通不一定是挂了，很多服务禁用 ICMP）。
- `dig 域名`：确认解析出的 IP 对不对。
- `telnet ip 443` / `nc -vz ip 443`：测目标端口通不通，排查是不是端口 / 防火墙问题。
- `traceroute 域名`：看路由走到哪一跳断了 / 变慢，判断是本地网络、中间链路还是接近目标处出问题。
- `curl -v https://域名/`：看完整过程，卡在 DNS、连接、TLS 还是拿到了 HTTP 状态码，直接定位到层。

## 🛠 动手验证（可选做）

把分层排障用命令跑一遍，亲手看现象。

```bash
# 1) curl -w 拆各阶段耗时: 一眼定位慢在哪一层 (DNS/连接/TLS/等响应)
curl -s -o /dev/null -w \
"DNS解析:   %{time_namelookup}s\nTCP连接:   %{time_connect}s\nTLS握手:   %{time_appconnect}s\n首字节TTFB: %{time_starttransfer}s\n总耗时:    %{time_total}s\nHTTP状态:  %{http_code}\n" \
https://www.example.com/
```

```bash
# 2) curl -v 看完整链路: DNS 解析到哪个IP、TCP连上没、TLS证书信息、HTTP状态码
# 若卡在 "Could not resolve host" = DNS 问题
# 若卡在 "Connection timed out"  = 连接层问题
# 若报 certificate 相关            = TLS 证书问题
curl -v https://www.example.com/ 2>&1 | head -n 30
```

```bash
# 3) ping: 测连通性与往返时延 (注意很多服务禁用 ICMP, ping 不通不代表服务挂了)
ping -c 4 www.example.com
```

```bash
# 4) traceroute: 逐跳追踪路由, 看在哪一跳开始超时/丢包, 判断链路哪段有问题
# Linux/macOS 用 traceroute; Windows 用 tracert
traceroute www.example.com
```

```bash
# 5) 测端口是否可达 (排查是不是端口没开/被防火墙拦)
nc -vz www.example.com 443
# 或用 telnet www.example.com 443
```

```bash
# 6) 观察跨域: 手动发一个预检 OPTIONS, 看服务端返回的 CORS 响应头
curl -s -X OPTIONS https://api.example.com/data \
  -H "Origin: https://www.myapp.com" \
  -H "Access-Control-Request-Method: POST" \
  -D - -o /dev/null | grep -i 'access-control'
```

<div class="niv-why">
提醒：<code>ping</code> 走的是 ICMP 协议（第09讲讲过），和你的 HTTP 请求走的 TCP 不是一回事。很多服务器出于安全禁用了 ICMP，所以 <strong>ping 不通不能直接断定服务挂了</strong>，还要结合端口探测和 curl 一起判断。这是排查时的常见坑。</div>

## 🧨 高频翻车点

<div class="niv-trap">
<strong>翻车 1：把 502 和 504 说反或混为一谈。</strong>正确：502 Bad Gateway 是网关拿到坏响应 / 连不上上游 / 上游挂了（上游坏了或没了）；504 Gateway Timeout 是网关连上了上游但等响应超时（上游还在但太慢）。一个是「拿到坏东西 / 拿不到」，一个是「等太久超时」。
</div>

<div class="niv-trap">
<strong>翻车 2：把跨域当成后端主动拒绝或网络不通。</strong>正确：跨域是浏览器同源策略的限制，请求经常已经到达服务端也返回了，只是浏览器因缺少 CORS 响应头把结果拦下不给 JS 读。用 curl / Postman 不会跨域。解决靠服务端加 `Access-Control-Allow-Origin` 等响应头，前端改不了别人的同源策略。
</div>

<div class="niv-trap">
<strong>翻车 3：ping 不通就断言「服务器挂了」。</strong>正确：ping 用 ICMP，很多服务器禁用 ICMP，ping 不通可能只是禁了 ping，服务本身好好的。要结合端口探测（nc / telnet）和 curl 拿状态码综合判断，别只凭 ping 下结论。
</div>

## 🎤 面试话术模板

<div class="niv-a">
<strong>30 秒口述版：</strong>排查网络问题我会按分层思路从下往上切：先看 DNS 能不能解析出正确 IP，再看 TCP 能不能连上目标端口，然后看 HTTPS 的 TLS 握手 / 证书有没有问题，最后看应用层返回的状态码是 4xx 还是 5xx。工具上，curl -v 看完整链路和卡在哪层，curl -w 拆各阶段耗时定位慢在哪，ping 测连通（但注意很多服务禁 ICMP），traceroute 看路由哪跳断，nc / telnet 测端口。几个典型报错要分清：502 是网关拿到坏响应或上游挂了，504 是网关等上游超时；域名解析失败查 DNS 配置和权威记录；证书错误看过期 / 域名不匹配 / CA 不信任；跨域是浏览器同源策略限制，请求其实到了服务端，靠服务端加 CORS 响应头解决，非简单请求还会先发 OPTIONS 预检。核心原则是先分层定位在哪一环，再深入那一环，先测量再下结论。
</div>

## ✅ 自测三问

1. 分层排障的四层顺序是什么？为什么从下往上排？
2. 502 和 504 分别是什么含义？排查方向有何不同？
3. 跨域是谁拦的？为什么 curl 请求同一个接口不会跨域？怎么根治？

<details class="niv-fold"><summary>对答案</summary>

1. 顺序：DNS 层（能否解析出正确 IP）→ 连接层 TCP（能否连上目标端口）→ TLS 层（证书 / 握手是否正常）→ 应用层 HTTP（返回 4xx 还是 5xx）。从下往上排是因为下层不通上层无从谈起（解析不出 IP 就没法建连、连不上就没法握手），从下往上能快速缩小问题范围。
2. 502 Bad Gateway：网关去请求上游时拿到了坏 / 无效响应，或连不上上游 / 上游挂了，指向「上游本身有问题」，排查看上游是否挂了 / 端口对不对 / 返回是否合法；504 Gateway Timeout：网关连上了上游但在超时时间内没等到响应，指向「上游太慢或超时设置太短」，排查看上游为什么慢 + 网关超时阈值是否合理。
3. 跨域是浏览器的同源策略拦的，请求往往已经到达服务端并返回，只是浏览器因缺少 CORS 响应头把结果拦下不给页面 JS 读。curl / Postman 没有同源策略，所以直接请求不会跨域。根治靠服务端在响应头加 `Access-Control-Allow-Origin` 等 CORS 字段（非简单请求还需正确响应 OPTIONS 预检），或用同源代理 / 反向代理绕开。

</details>

## 📦 复制带走

<div class="niv-card">
<strong>分层排障四步：</strong>DNS（能否解析）→ TCP 连接（能否连上端口）→ TLS（证书 / 握手）→ HTTP（状态码 4xx/5xx）。从下往上切，先定位在哪一环再深入。
</div>

<div class="niv-card">
<strong>502 vs 504 别搞反：</strong>502 = 网关拿到坏响应 / 上游连不上或挂了（上游坏了）；504 = 网关等上游超时（上游还在但太慢）。502 查上游死没死，504 查上游为啥慢 + 超时够不够。
</div>

<div class="niv-card">
<strong>跨域 CORS：</strong>浏览器同源策略（协议 + 域名 + 端口都同才同源）限制，请求其实到了服务端。靠服务端加 Access-Control-Allow-* 响应头解决；非简单请求先发 OPTIONS 预检。curl / Postman 不受影响。
</div>

<div class="niv-card">
<strong>命令速记：</strong>curl -v 看链路卡在哪层、curl -w 拆各阶段耗时、ping 测连通（禁 ICMP 时 ping 不通≠挂了）、traceroute 看路由哪跳断、nc/telnet 测端口。
</div>

<p style="margin-top:24px"><a href="/courses/net-interview/">← 回到《秋招计网面试实战课》目录</a></p>
