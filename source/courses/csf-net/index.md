---
title: "计算机基本功 · 计算机网络"
date: 2026-07-08 09:00:00
description: "跟着一次网页请求，把「从按下回车到页面出现」中间的每一步亲手走一遍。"
---

<style>
.csf-key-note{margin:18px 0;padding:14px 16px;line-height:1.78;border-radius:8px;background:rgba(63,93,126,.1);border-left:4px solid #3f5d7e}
.csf-row{display:flex;align-items:center;gap:14px;padding:13px 15px;margin:8px 0;border:1px solid var(--line);border-radius:10px;text-decoration:none;background:var(--panel)}
.csf-row:hover{border-color:#3f5d7e}
.csf-num{flex:none;width:40px;height:40px;display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;background:#3f5d7e;border-radius:9px;font-size:14px}
.csf-rt{flex:1;min-width:0}
.csf-rt h4{margin:0 0 3px;font-size:16px;line-height:1.3}
.csf-rt p{margin:0;font-size:13px;color:var(--muted);line-height:1.5}
.csf-why{margin:18px 0;padding:14px 16px;line-height:1.78;border-radius:8px;background:var(--wash);border-left:4px solid var(--line);color:var(--muted)}
html[data-user-color-scheme="dark"] .csf-key-note{background:rgba(63,93,126,.22)}
</style>

<div class="csf-key-note"><strong>跟着一次网页请求，把「从按下回车到页面出现」中间的每一步亲手走一遍。</strong><br>这门课是《计算机基本功路线图》的一站，<strong>扎实讲原理 + 自己动手练 + 练判断，不让 AI 代写</strong>。学完你能独立看懂浏览器 Network 面板和一次真实抓包，用自己的话讲清一个网页请求经过 DNS→IP/端口→TCP 握手→HTTP/HTTPS 的完整旅程；当请求失败时能大致判断卡在哪一层，并用 dig/ping/curl/nc 等命令做基础排查。</div>

<div class="csf-why"><strong>为什么 AI 时代更要学好这门？</strong>AI 能帮你写请求代码、解释报错信息，但它看不到你此刻的网络环境，也替你判断不了「是 DNS 没解析、TCP 握手失败、还是服务器返回了 403」。会抓包、懂分层、能定位问题出在哪一层，是排障时 AI 替不了、必须你自己上手的硬功夫。把网络当黑盒的人只会复制报错去问 AI，看得懂链路的人才能真正解决问题。</div>

按顺序从 00 跟到底，每讲 30–60 分钟，主线必做、细究可跳。

<a class="csf-row" href="/2026/07/05/csf-net-00/"><span class="csf-num">00</span><div class="csf-rt"><h4>序：一次网页请求的完整旅程（先建一张地图）</h4><p>能用自己的话说出「在浏览器输入网址、按下回车、到页面出现」中间大致发生了哪几步，并知道这门课…</p></div></a>
<a class="csf-row" href="/2026/07/05/csf-net-01/"><span class="csf-num">01</span><div class="csf-rt"><h4>分层模型直觉：为什么网络要「分层」</h4><p>理解分层是为了把复杂问题拆开、各管一段，能把一次通信对应到分层里，分清 TCP/IP 四（五…</p></div></a>
<a class="csf-row" href="/2026/07/05/csf-net-02/"><span class="csf-num">02</span><div class="csf-rt"><h4>DNS：把域名翻译成 IP 地址</h4><p>说清域名是如何一步步变成 IP 的、为什么这一步在旅程最前面，并会用命令查任意一个域名的 I…</p></div></a>
<a class="csf-row" href="/2026/07/05/csf-net-03/"><span class="csf-num">03</span><div class="csf-rt"><h4>IP 与端口：找到哪台机器、机器上的哪个程序</h4><p>理解 IP 定位「哪台机器」、端口定位「机器上哪个程序」，能查出自己电脑的 IP 并解释公网…</p></div></a>
<a class="csf-row" href="/2026/07/05/csf-net-04/"><span class="csf-num">04</span><div class="csf-rt"><h4>TCP 三次握手：连接是怎么「建立」起来的</h4><p>说清三次握手为什么是三次、一条 TCP 连接是如何建立和关闭的，并能手动连到一个服务器端口发…</p></div></a>
<a class="csf-row" href="/2026/07/05/csf-net-05/"><span class="csf-num">05</span><div class="csf-rt"><h4>TCP 可靠传输：在不靠谱的网络上做到不丢不乱</h4><p>理解 TCP 如何在会丢包、会乱序的网络上做到「不丢、不乱、不淹」，能用直觉解释重传、流量控…</p></div></a>
<a class="csf-row" href="/2026/07/05/csf-net-06/"><span class="csf-num">06</span><div class="csf-rt"><h4>UDP：不握手、不保证，但够快</h4><p>说清 UDP 和 TCP 的根本区别，知道什么场景该用 UDP、为什么。</p></div></a>
<a class="csf-row" href="/2026/07/05/csf-net-07/"><span class="csf-num">07</span><div class="csf-rt"><h4>HTTP 请求与响应：报文到底长什么样</h4><p>能读懂一条 HTTP 报文的结构，分清请求行/请求头/请求体，会用 curl 看到完整的请求…</p></div></a>
<a class="csf-row" href="/2026/07/05/csf-net-08/"><span class="csf-num">08</span><div class="csf-rt"><h4>状态码与响应头：一眼看出「大概谁的锅」</h4><p>看到状态码能立刻判断问题大致在客户端还是服务端，并认识几个最常见的响应头。</p></div></a>
<a class="csf-row" href="/2026/07/05/csf-net-09/"><span class="csf-num">09</span><div class="csf-rt"><h4>Cookie 与 Session：HTTP 没记性，怎么记住你登录了</h4><p>理解 HTTP 无状态为什么需要 Cookie/Session，能解释登录之后服务器是怎么「…</p></div></a>
<a class="csf-row" href="/2026/07/05/csf-net-10/"><span class="csf-num">10</span><div class="csf-rt"><h4>HTTPS：明文为什么危险，加锁后又安全在哪</h4><p>说清纯 HTTP 明文为什么危险，理解 HTTPS 大致是怎么加密和验证身份的，并会查看一个…</p></div></a>
<a class="csf-row" href="/2026/07/05/csf-net-11/"><span class="csf-num">11</span><div class="csf-rt"><h4>抓包看一次真实请求：把整条链路串起来</h4><p>把前面十讲串成一条线，用抓包工具亲眼看到一次请求从 DNS 到响应的全过程，并能讲给别人听。</p></div></a>

<p style="margin-top:24px"><a href="/courses/csf/">← 回到《计算机基本功路线图》总览</a></p>
