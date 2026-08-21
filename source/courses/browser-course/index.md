---
title: "从 URL 到页面显示 · 运行主线课"
date: 2026-08-21 08:00:00
description: "沿「地址栏输入 URL 到页面显示」这条真实运行主线，把浏览器、计算机网络、操作系统和前端运行时缝成一条因果链。不背孤立八股，讲清每一步为什么触发下一步。"
---

<style>
.bc-hero{margin:18px 0;padding:16px 18px;line-height:1.85;border-radius:10px;background:rgba(63,93,126,.09);border-left:4px solid #3f5d7e}
.bc-note{margin:16px 0;padding:14px 16px;line-height:1.8;border-radius:8px;background:var(--wash);border-left:4px solid var(--line);color:var(--muted)}
.bc-row{display:flex;align-items:center;gap:14px;padding:13px 15px;margin:8px 0;border:1px solid var(--line);border-radius:10px;text-decoration:none;background:var(--panel)}
.bc-row:hover{border-color:#3f5d7e}
.bc-num{flex:none;width:42px;height:42px;display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;background:#3f5d7e;border-radius:9px;font-size:14px}
.bc-num.done{background:#2f765f}
.bc-rt{flex:1;min-width:0}
.bc-rt h4{margin:0 0 3px;font-size:16px;line-height:1.3}
.bc-rt p{margin:0;font-size:13px;color:var(--muted);line-height:1.5}
.bc-badge{display:inline-block;font-size:11px;font-weight:700;padding:1px 8px;border-radius:999px;margin-left:6px;color:#2f765f;background:rgba(47,118,95,.12);border:1px solid rgba(47,118,95,.25)}
.bc-sub{margin:30px 0 6px;font-size:14px;letter-spacing:2px;color:#3f5d7e;font-weight:800}
html[data-user-color-scheme="dark"] .bc-hero{background:rgba(63,93,126,.2)}
</style>

<div class="bc-hero"><strong>一条主线，四门课。</strong><br>在地址栏敲下网址、按下回车，到页面完整显示，中间跨了浏览器、计算机网络、操作系统和前端运行时。这套课不把它们当四门课分开背，而是缝回一条线上：<strong>上一层的输出，正好是下一层的输入。</strong>顺着输入输出走，知识自然连成一条运行主线。</div>

<div class="bc-note"><strong>这套课和纯八股有什么不同？</strong>不做并列罗列，每一段都承接上一段产生的状态——上一步产出一个结果，这个结果触发下一步的机制。正文只讲当前场景真正走的主路径，旁支、实现细节、加分细节用带色块的引用单独标出，删掉也不影响主线连贯。每个节点固定给：一句话结论、理解原理、主线整理、设计取舍、一段 60–90 秒的面试回答、常见追问。</div>

<div class="bc-sub">开篇</div>

<a class="bc-row" href="/2026/08/21/browser-course-00/"><span class="bc-num done">00</span><div class="bc-rt"><h4>课程总纲：一条运行主线，把四门课缝起来</h4><p>写作原则（段落间必有因果）、主线与旁支的阅读约定、三个层次（通用机制/Chromium 实现/平台差异），以及十二节点的因果地图。</p></div></a>

<div class="bc-sub">主线节点（12 讲全部完成）</div>

<a class="bc-row" href="/2026/08/21/browser-course-01/"><span class="bc-num done">01</span><div class="bc-rt"><h4>用户输入与导航创建</h4><p>地址栏为什么属于浏览器进程、URL 规范化、导航≠网络请求、站点隔离的进程模型，以及浏览器进程如何通过 Mojo 把加载任务交给网络服务。</p></div></a>
<a class="bc-row" href="/2026/08/21/browser-course-02/"><span class="bc-num done">02</span><div class="bc-rt"><h4>主机解析</h4><p>代理决议、IP 字面量与 localhost、各级缓存、DNS 层级结构——把主机名变成一组可连接的 IP。</p></div></a>
<a class="bc-row" href="/2026/08/21/browser-course-03/"><span class="bc-num done">03</span><div class="bc-rt"><h4>网络路径与出口选择</h4><p>候选地址、路由表最长前缀匹配、源地址选择、Happy Eyeballs 赛跑与连接池复用，定出一条确定的出口路径。</p></div></a>
<a class="bc-row" href="/2026/08/21/browser-course-04/"><span class="bc-num done">04</span><div class="bc-rt"><h4>TCP 与 QUIC 连接</h4><p>为什么 IP 之上还要传输层，TCP 三次握手为何是三次、如何做到可靠有序，以及 QUIC 怎样合并握手、绕开队头阻塞。</p></div></a>
<a class="bc-row" href="/2026/08/21/browser-course-05/"><span class="bc-num done">05</span><div class="bc-rt"><h4>TLS 握手</h4><p>TLS 1.3 用 ECDHE 而非 RSA 交换密钥、证书链如何追溯到可信根、Finished 互验，建成一条已认证已加密的通道。</p></div></a>
<a class="bc-row" href="/2026/08/21/browser-course-06/"><span class="bc-num done">06</span><div class="bc-rt"><h4>HTTP 请求与响应</h4><p>强缓存与协商缓存两级拦截、请求/响应结构、状态码分段、重定向回卷，以及 HTTP/1.1→2→3 围绕队头阻塞的演进。</p></div></a>
<a class="bc-row" href="/2026/08/21/browser-course-07/"><span class="bc-num done">07</span><div class="bc-rt"><h4>响应处理与导航提交</h4><p>渲染还是下载、按站点隔离挑渲染进程、用数据管道接流，以及「导航提交」那一刻为何才更新地址栏和安全锁。</p></div></a>
<a class="bc-row" href="/2026/08/21/browser-course-08/"><span class="bc-num done">08</span><div class="bc-rt"><h4>HTML 解析与子资源发现</h4><p>字节流如何变成 DOM、边解析边拉子资源、预加载扫描器抢跑，以及同步脚本为何阻塞解析、CSS 又怎样间接卡住它。</p></div></a>
<a class="bc-row" href="/2026/08/21/browser-course-09/"><span class="bc-num done">09</span><div class="bc-rt"><h4>CSS 与 JavaScript 执行调度</h4><p>CSS 建 CSSOM 是渲染阻塞、JS 与渲染共用单线程、事件循环怎样调度宏微任务，以及 DOMContentLoaded 与 load 的分界。</p></div></a>
<a class="bc-row" href="/2026/08/21/browser-course-10/"><span class="bc-num done">10</span><div class="bc-rt"><h4>样式计算与布局</h4><p>DOM+CSSOM 合成渲染树、层叠与继承算出计算后样式、布局求出每个盒子的几何，以及回流与重绘的开销差异。</p></div></a>
<a class="bc-row" href="/2026/08/21/browser-course-11/"><span class="bc-num done">11</span><div class="bc-rt"><h4>绘制、栅格化与合成</h4><p>绘制记录如何定顺序、内容为何分合成层、栅格化怎样把矢量变像素、GPU 合成上屏，以及 transform/opacity 动画为何流畅。</p></div></a>
<a class="bc-row" href="/2026/08/21/browser-course-12/"><span class="bc-num done">12</span><div class="bc-rt"><h4>性能指标与完整复盘</h4><p>把十二节点串成一条因果链，并挂上 TTFB/FCP/LCP/INP/CLS——每个指标卡在主线哪一步、怎样反推优化。</p></div></a>

<div class="bc-note">主线十二节点已全部完成，从「地址栏输入」一路讲到「像素上屏」并做了性能复盘。后续三条独立分支（WebRTC、操作系统机制、Web 存储与安全）从主线相应节点岔出，作为可选深水区延展，会陆续补上并同步到本页。</div>
