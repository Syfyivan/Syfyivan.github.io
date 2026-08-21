---
title: "《从 URL 到页面显示》第 00 讲 · 课程总纲：一条运行主线，把四门课缝起来"
date: 2026-08-21 08:00:00
tags: [浏览器, 计算机网络, 操作系统, 前端, 校招, 面试]
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

这一章不讲某一个具体机制，它负责三件事：给你一张能一眼看到「运行到哪里」的地图，说清楚全课程的写作与阅读约定，最后把十二个节点用一条因果链连起来。读完这一章，后面每一个节点你都知道它接在哪里、为什么接在那里。

## 这套课程只回答一个问题

在地址栏敲下一个网址、按下回车，到页面完整显示，中间发生的事情可以拆成很多层：浏览器界面、导航系统、名称解析、网络路径、传输连接、加密、应用协议、响应处理、文档解析、脚本执行、样式布局、绘制合成。这些层平时被分别当成「浏览器原理」「计算机网络」「操作系统」「前端」四门课来背，彼此割裂。

这套课程把它们重新缝回一条线上。判断标准很简单：**上一层的输出，正好是下一层的输入。** 名称解析的输出是一组 IP 地址，它正好是网络路径选择的输入；网络路径的输出是确定的出口与下一跳，它正好是传输连接的输入。顺着输入输出走，四门课自然连成一条运行主线。

## 写作原则：段落之间必须有因果

这套课程刻意避免一种常见写法——把相关知识点并列摆开，让读者自己去猜「为什么突然讲到这个」。

反例是这样的：

```text
浏览器有缓存。
hosts 可以解析域名。
DNS 有根服务器和权威服务器。
DNS 分为递归查询和迭代查询。
```

四句话每句都对，但它们之间没有关系，读完只是记住了四个孤立事实。正确的写法是让每一句承接上一句产生的状态：

> 当前输入还不是一个可以直接连接的 IP，解析器于是尝试复用已有结果。缓存里没有这条记录，说明浏览器手上没有可用的历史答案，解析流程才继续检查本地静态映射。hosts 文件里也没有匹配项，本地这些「快而近」的来源全部落空，解析器这才需要选择一条外部解析路径。

后一种写法里，每一段的开头都在回应上一段的结果，每一段的结尾都交代了下一步为什么开始。这就是全课程的基本节奏：

```text
上一段产生一个结果
    ↓
这个结果触发当前机制
    ↓
当前机制处理这个结果
    ↓
当前机制产生新的结果
    ↓
新的结果成为下一段的输入
```

课程也不会机械地用「第一道、第二道、第三道」制造流程感，那会把连续的运行过程切成关卡式说明书。要的是自然连贯的技术叙述。

## 阅读约定：主线与旁支怎么分

正文只讲当前场景真正执行的主路径。凡是不在主路径上、但为了准确或加分而补充的内容，一律用弱化引用块标注，分三类：

<div class="bc-call bc-branch"><span class="bc-tag">旁支</span><strong>含义</strong><br>与主路径分岔的另一条可能的路。它告诉你「换个环境会怎样」，但当前场景不走它。</div>

<div class="bc-call bc-impl"><span class="bc-tag">实现细节</span><strong>含义</strong><br>为准确性补充的底层机制，校招口头回答通常不需要主动展开。</div>

<div class="bc-call bc-bonus"><span class="bc-tag">加分细节</span><strong>含义</strong><br>答出来能加分、但不是理解主线必需的内容。</div>

一个判断标准贯穿全程：**把所有旁支引用块删掉，剩下的正文仍然是一条完整、连续的运行主线。** 如果删掉之后主线断了，说明有该在正文里的内容被误放进了旁支。

## 三个层次：不要把一种实现当成标准

课程以 Chromium 桌面浏览器为主要实现背景，因为它源码公开、文档齐全、市场占有率高，讲起来有据可查。但必须始终分清三层：

| 层次 | 含义 | 举例 |
| --- | --- | --- |
| 通用机制 | 协议或操作系统层面，对所有实现都成立 | TCP 三次握手、TLS 1.3 握手、DNS 层级结构 |
| Chromium 实现 | Chromium 具体怎么做，别的浏览器可能不同 | 内置解析器的查询顺序、网络服务进程、Mojo 通信 |
| 平台差异 | macOS / Linux / Windows 之间的不同 | 路由表与接口选择、系统解析器、证书信任库 |

这条纪律直接决定了课程会主动修正一批流传很广、但把「实现策略」写成「协议规则」的说法。下面这些是已经确认要避免的：

- 不把「浏览器缓存 → 系统缓存 → hosts → DNS」当成适用于所有环境的固定顺序。
- 不说严格「一个标签页对应一个渲染进程」。
- 不把网络服务（Network Service）绝对等同于一个独立的网络进程。
- 不把 Mojo 等同于 Socket。
- 不说 HTTP/3 就是 UDP。
- 不把 HTTP Keep-Alive 和 TCP Keepalive 混为一谈。
- 不把 TLS 1.3 主路径讲成 RSA 密钥交换。
- 不说 CSS 永远按一条简单规则阻塞或不阻塞。
- 不说 JavaScript 整体只能单线程。
- 不把闭包直接等同于内存泄漏。
- 不说主线程直接完成全部位图绘制。
- 不把任何浏览器实现策略写成协议强制规则。

每次遇到这些点，课程会先给一个面试够用的简化模型，再说明真实实现近似在哪、为什么不能当成铁律。

## 语言约定

课程用准确、自然的中文技术表达，不过度口语化，也不堆砌英文源码名。术语第一次出现时，用中文说清它是什么、在当前机制里负责什么，必要时只在第一次补英文名。

有一批名称已经普遍直接使用，保留英文：URL、DNS、TCP、UDP、QUIC、TLS、HTTP、Mojo。

有一批需要中英对照后转中文：浏览器进程（Browser Process）之后写「浏览器进程」；网络服务（Network Service）之后写「网络服务」。

还有一批源码级名称，比如 `NavigationRequest`、`URLLoaderFactory`、`Remote`、`Receiver`，不进基础主线，只在「源码追问」或「实现细节」里出现。

## 十二个节点的因果地图

下面这张图是全课程的骨架。每个节点后面跟着它的**输出**，这个输出就是下一个节点的输入。

```text
① 用户输入与导航创建
     产出：一份结构化的加载任务，交给网络服务
        ↓
② 主机解析
     产出：当前直接连接对象的一组 IPv4 / IPv6 候选地址
        ↓
③ 网络路径与出口选择
     产出：确定的连接对象、候选地址、网络接口、下一跳、实际出口
        ↓
④ TCP 或 QUIC 连接
     产出：一条可用的、可靠有序的传输连接
        ↓
⑤ TLS 握手
     产出：在传输连接之上建立的加密安全通道
        ↓
⑥ HTTP 请求与响应
     产出：一个 HTTP 响应（状态行、响应头，以及正在到来的响应体）
        ↓
⑦ 响应处理与导航提交
     产出：选定最终渲染进程，导航提交，响应体开始流向渲染进程
        ↓
⑧ HTML 解析与子资源发现
     产出：逐步构建的 DOM，以及一批新触发的子资源网络请求
        ↓
⑨ CSS 与 JavaScript 执行调度
     产出：CSSOM、脚本执行结果、被修改的 DOM 与样式
        ↓
⑩ 样式计算与布局
     产出：每个可见元素的计算样式、尺寸与位置
        ↓
⑪ 绘制、栅格化与合成
     产出：一帧合成好的图像，进入显示系统
        ↓
⑫ 性能指标与完整复盘
     产出：用一次完整访问把①～⑪重新串起来，并解释各条捷径怎样改变主线
```

值得先记住的一点：这条线不是单向直筒。节点②的解析、节点③～⑥的网络机制会被反复回调——节点③里如果代理选中一个域名节点，会重新触发节点②；节点⑥遇到重定向会带着新 URL 重新进入前面的流程；节点⑧发现子资源时，图片、CSS、脚本、字体又会各自重新走一遍网络机制。主线是一条线，但其中几段是可复用的子过程。

## 三条独立分支

有些内容重要，但不在「普通网页导航」这条主线上，硬塞进来会破坏因果连续性。它们单独成篇，只在相关节点留连接点：

- **WebRTC 与实时通信路径**——不是网页导航的必经步骤，需要先学完 UDP、NAT、代理与路由（节点③④）才展开。它讲 RTCPeerConnection、ICE、host/srflx/relay 候选、STUN 与 TURN、NAT 穿透、UDP/TCP/中继回退，以及 WebRTC 为什么可能绕过普通浏览器代理路径。
- **操作系统机制索引**——不把 Linux 当成整套课程主线。只有当主线真正踩进操作系统时（进程与线程、虚拟地址空间、IPC、Socket、路由表、虚拟网卡、系统调用、页表与 TLB、上下文切换）才在这里展开，供节点按需引用。
- **Web 存储与安全索引**——Cookie、LocalStorage、SessionStorage、IndexedDB、XSS、CSRF、CORS、CSP 不在一个节点里集中背定义，而是连接到真正触发它们的位置：Cookie 连 HTTP 请求，CORS 连跨源请求与响应检查，CSP 连资源加载与脚本执行，XSS 连不可信数据进入 DOM，CSRF 连浏览器自动携带凭证的跨站请求，Web 存储连页面脚本与浏览器存储隔离。

## 从这里往下

总纲到此结束。它的输出是：**你已经拿到一张标好输入输出的节点地图，知道每一节接在哪里、为什么接在那里。** 这张地图交给节点一。

节点一从最开始的地方切入——用户在地址栏敲下的那串字符还不是一次导航，浏览器要先决定它是网址、搜索词还是别的东西，再把它变成一次真正的导航，最后交出一份结构化的加载任务。之所以从这里开始，是因为在拿到「加载任务」之前，网络世界里什么都还没发生。


<div class="bc-nav"><a href="/courses/browser-course/" >← 课程目录</a><a class="r" href="/2026/08/21/browser-course-01/">01 · 用户输入与导航创建 →</a></div>
