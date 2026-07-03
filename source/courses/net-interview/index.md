---
title: "秋招计网面试实战课"
date: 2026-07-09 08:00:00
description: "不是背协议章节，而是按「面试会怎么问」组织：从一次请求讲透 HTTP、TCP、HTTPS，配场景追问、翻车点和话术模板。"
---

<style>
.niv-key-note{margin:18px 0;padding:14px 16px;line-height:1.78;border-radius:8px;background:rgba(183,58,44,.1);border-left:4px solid #b73a2c}
.niv-row{display:flex;align-items:center;gap:14px;padding:13px 15px;margin:8px 0;border:1px solid var(--line);border-radius:10px;text-decoration:none;background:var(--panel)}
.niv-row:hover{border-color:#b73a2c}
.niv-num{flex:none;width:40px;height:40px;display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;background:#b73a2c;border-radius:9px;font-size:14px}
.niv-rt{flex:1;min-width:0}
.niv-rt h4{margin:0 0 3px;font-size:16px;line-height:1.3}
.niv-rt p{margin:0;font-size:13px;color:var(--muted);line-height:1.5}
.niv-why{margin:18px 0;padding:14px 16px;line-height:1.78;border-radius:8px;background:var(--wash);border-left:4px solid var(--line);color:var(--muted)}
.niv-score{margin:18px 0;border:1px solid var(--line);border-radius:10px;overflow:hidden}
.niv-score div{display:flex;gap:12px;padding:12px 15px;border-top:1px solid var(--line);line-height:1.7}
.niv-score div:first-child{border-top:0}
.niv-score b{flex:none;width:78px;color:#b73a2c}
html[data-user-color-scheme="dark"] .niv-key-note{background:rgba(183,58,44,.22)}
</style>

<div class="niv-key-note"><strong>从一次请求讲透 HTTP、TCP 和 HTTPS。</strong><br>这门课不按「协议章节」排，而是按<strong>面试官到底会怎么问</strong>来排。经典八股必须会，但只会背「三次握手是 SYN、SYN+ACK、ACK」远远不够——面试真正拉开差距的是：能不能把知识点放进真实请求、性能、安全、排障的场景里讲明白，还扛得住一路追问。</div>

<div class="niv-why"><strong>这门课和纯教材、纯题库有什么不同？</strong>每一讲都按同一套结构展开：先讲清核心八股的定义与原理，再给出面试官会顺着问的<strong>场景追问</strong>，标出高频<strong>翻车点</strong>，最后附一段能直接背诵的<strong>话术模板</strong>。配比是：经典八股 40% + 流程串联 30% + 场景排查 20% + 工程实践 10%。目标不是让你背会，而是让你「问到一个点，能先讲定义，再讲原因，再讲流程，最后落到项目场景」。</div>

按顺序从 01 跟到 15，也可按你薄弱的专题跳读。徽章含义：<strong>高频必背</strong> = 面试官最爱问、<strong>场景追问</strong> = 拉开差距处、<strong>进阶加分</strong> = 答上来更亮眼。第 15 讲是代理专题加餐，AI 时代高频，值得单独看。

<a class="niv-row" href="/2026/07/09/net-interview-01/"><span class="niv-num">01</span><div class="niv-rt"><h4>计网面试到底怎么考：不是背协议，是讲清一次请求</h4><p>面试三层结构、答题四段式，以及一张 60/80/90 分自测表——先摆正方向再开学。</p></div></a>
<a class="niv-row" href="/2026/07/09/net-interview-02/"><span class="niv-num">02</span><div class="niv-rt"><h4>一次 HTTP 请求的完整链路</h4><p>URL 解析→DNS→TCP→TLS→HTTP→渲染→连接复用，把整条主线串起来，每段慢了怎么定位。</p></div></a>
<a class="niv-row" href="/2026/07/09/net-interview-03/"><span class="niv-num">03</span><div class="niv-rt"><h4>HTTP 面试核心</h4><p>请求响应、GET/POST 的真区别、状态码、Header、Cookie、缓存、长连接。</p></div></a>
<a class="niv-row" href="/2026/07/09/net-interview-04/"><span class="niv-num">04</span><div class="niv-rt"><h4>HTTP 进阶与性能</h4><p>HTTP/1.1、HTTP/2、HTTP/3、队头阻塞、多路复用、QUIC，追问一串都能接住。</p></div></a>
<a class="niv-row" href="/2026/07/09/net-interview-05/"><span class="niv-num">05</span><div class="niv-rt"><h4>HTTPS 面试核心</h4><p>对称/非对称、数字证书、CA、TLS 握手、中间人——为什么抓包能看到 HTTPS 明文。</p></div></a>
<a class="niv-row" href="/2026/07/09/net-interview-06/"><span class="niv-num">06</span><div class="niv-rt"><h4>TCP 面试核心</h4><p>可靠传输、三次握手、四次挥手、TIME_WAIT、CLOSE_WAIT、粘包、滑动窗口。</p></div></a>
<a class="niv-row" href="/2026/07/09/net-interview-07/"><span class="niv-num">07</span><div class="niv-rt"><h4>TCP 进阶追问</h4><p>流量控制、拥塞控制、慢启动、快重传、半连接队列、SYN Flood。</p></div></a>
<a class="niv-row" href="/2026/07/09/net-interview-08/"><span class="niv-num">08</span><div class="niv-rt"><h4>UDP 与 QUIC</h4><p>UDP 为什么快又不可靠、适合什么、HTTP/3 为何基于 UDP、QUIC 怎么补回可靠性。</p></div></a>
<a class="niv-row" href="/2026/07/09/net-interview-09/"><span class="niv-num">09</span><div class="niv-rt"><h4>DNS、IP、MAC、ARP</h4><p>域名怎么变 IP、DNS 缓存与 TTL、用 TCP 还是 UDP、IP 与 MAC 区别、ARP、ping 原理。</p></div></a>
<a class="niv-row" href="/2026/07/09/net-interview-10/"><span class="niv-num">10</span><div class="niv-rt"><h4>登录态与安全</h4><p>Cookie、Session、Token、JWT、SameSite、CSRF、XSS 与 Cookie 安全。</p></div></a>
<a class="niv-row" href="/2026/07/09/net-interview-11/"><span class="niv-num">11</span><div class="niv-rt"><h4>网络性能优化</h4><p>减少 DNS、连接复用、强缓存与协商缓存、CDN、压缩、HTTP/2、静态资源优化。</p></div></a>
<a class="niv-row" href="/2026/07/09/net-interview-12/"><span class="niv-num">12</span><div class="niv-rt"><h4>网络问题排查</h4><p>接口超时、502/504、解析失败、证书错误、跨域，配 curl/ping/traceroute。</p></div></a>
<a class="niv-row" href="/2026/07/09/net-interview-13/"><span class="niv-num">13</span><div class="niv-rt"><h4>高频综合题专项</h4><p>输入 URL 后发生了什么、HTTPS 全过程、接口慢排查、TCP/UDP 选型、H1/H2/H3 对比。</p></div></a>
<a class="niv-row" href="/2026/07/09/net-interview-14/"><span class="niv-num">14</span><div class="niv-rt"><h4>模拟面试题库</h4><p>基础题、追问题、场景题、项目结合题，附折叠参考答案与项目结合话术。</p></div></a>
<a class="niv-row" href="/2026/07/09/net-interview-15/"><span class="niv-num">15</span><div class="niv-rt"><h4>代理专题（加餐）：正向/反向代理、抓包中间人与 AI 时代的 API 代理</h4><p>正向 vs 反向代理、代理与网关的区别、CONNECT 隧道、SOCKS vs HTTP 代理、MITM 抓包原理，以及给大模型 API 配代理。</p></div></a>

<div class="niv-key-note"><strong>怎么判断自己「够不够用」？</strong>下面这张表对着看，你就知道现在处在哪一档、还差什么。</div>

<div class="niv-score">
  <div><b>60 分</b>能背经典题：三次握手、HTTP/HTTPS 区别、TCP/UDP 区别、DNS 流程、状态码。应付基础面，但容易被追问打穿。</div>
  <div><b>80 分</b>能讲原因和流程：为什么三次不是两次、TIME_WAIT 为何 2MSL、HTTPS 为何对称+非对称、HTTP/2 为何快。够大多数秋招。</div>
  <div><b>90 分</b>能结合场景排查：接口超时怎么查、502/504 什么原因、CLOSE_WAIT 很多说明什么、CDN 为何加速、登录态为何失效。明显像「能进项目的人」。</div>
</div>
