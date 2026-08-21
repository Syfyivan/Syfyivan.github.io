---
title: "《从 URL 到页面显示》第 03 讲 · 网络路径与出口选择"
date: 2026-08-21 11:00:00
tags: [路由, IPv6, HappyEyeballs, 计算机网络, 校招, 面试]
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

<p class="bc-sec lead">一句话结论</p>

上一节点交来一组候选 IP 地址，但「有地址」不等于「知道怎么发出去」。这一节点决定这次连接从哪张网卡出、经过哪个下一跳、先试 IPv4 还是 IPv6，最终把「一组地址」落实成「一条确定的出口路径」，供下一步真正建连。

<p class="bc-sec">理解原理</p>

### 从上一节点的输出开始：一组地址，还没有方向

节点二交出的是目标（或代理）的一组 IPv4 / IPv6 候选地址。但数据包不会自己找路——本机可能同时接了 Wi-Fi、有线网、VPN 虚拟网卡，每一个都是一个可能的出口。操作系统必须先回答一个问题：**要去这个目标 IP，我应该从哪张网卡、把包交给哪个下一跳？** 这就是路由。

### 第一步：查路由表，决定接口和下一跳

操作系统内核维护一张**路由表（routing table）**，本质是「目标网段 → 用哪个接口、下一跳是谁」的规则集合。为一个目标 IP 选路时，内核按「最长前缀匹配」挑出最具体的一条规则：

- 如果目标就在本地子网内（比如同一个局域网），下一跳就是目标本身，直接二层送达。
- 如果目标在外网，匹配到默认路由（`0.0.0.0/0`），下一跳是默认网关，也就是路由器。

选路的产出是两样东西：**用哪个网络接口发**，以及**第一跳交给谁**。注意下一跳只是「交给谁转发」，不是最终目的地——真正的目的地 IP 全程不变，变的是每一跳的链路层地址。

<div class="bc-call bc-impl"><span class="bc-tag">实现细节</span><strong>下一跳要先解析成 MAC 地址</strong><br>确定下一跳 IP 后，在以太网 / Wi-Fi 这类链路上，还得知道它的物理地址（MAC）才能把帧发出去。IPv4 用 ARP 广播「谁是这个 IP，告诉我你的 MAC」，IPv6 用邻居发现（NDP）做同样的事。这一步属于操作系统机制，展开放在分支里，主线只需知道「下一跳 IP 最终会被换成一个 MAC 地址」。</div>

### 第二步：选源地址，也就是「这次用哪个身份出去」

选定接口后，这张网卡上可能配了多个 IP（一个 IPv4、一个或多个 IPv6）。内核要挑一个作为这次连接的**源地址**，它决定了对端看到的「你是谁」，也决定回程包往哪送。源地址选择有一套规则（比如 IPv6 的地址选择偏好、作用域匹配），目的是让来回路径一致、避免用错身份。

到这里，「从哪出、第一跳给谁、以谁的名义」都定了。但候选目标地址往往不止一个，还得决定先连哪个。

### 第三步：候选地址里先试谁——IPv4 与 IPv6 的赛跑

节点二给的是一组地址，可能同时有 IPv6 和 IPv4。历史上如果先试 IPv6、而本机 IPv6 通路其实不通，就得等它超时才回退 IPv4，首屏被硬生生拖慢。

现代浏览器用 **Happy Eyeballs** 解决这个问题：不串行等待，而是让 IPv6 和 IPv4 近乎同时发起连接尝试，谁先握手成功就用谁，另一个取消 <a class="bc-cite" href="https://www.rfc-editor.org/rfc/rfc8305" target="_blank" rel="noopener">[1]</a>。它通常给 IPv6 一点点起跑优势（优先尝试），但不会为它干等到超时。这样既尽量用上 IPv6，又不会因为 IPv6 不通而卡住。

<div class="bc-call bc-bonus"><span class="bc-tag">加分细节</span><strong>这已经不只是「选路」了</strong><br>Happy Eyeballs 让选路和建连有一点重叠——它其实是发起了真实的连接尝试来赛跑。所以严格说，「选出口」和「建连接」不是干净的两段，而是有交叉的。主线上仍把它归在这一节点，因为它的目的还是「从候选里确定用哪条路」。</div>

### 第四步：连接复用——最快的连接是不用新建的连接

在真正三次握手之前，还有一道捷径：**如果到同一个目标已经有一条可用连接，就直接复用，跳过建连。** 浏览器为此维护连接池，按「目标主机 + 端口 + 是否加密」等维度把空闲连接存起来。命中复用，这一节点后面的建连、乃至下一节点的握手都能省掉。

这条捷径解释了为什么同一个站点的第二个请求往往快得多——它根本没重新连。

<div class="bc-call bc-branch"><span class="bc-tag">旁支</span><strong>代理改变整条路径</strong><br>如果节点二判定要走代理，这里的目标就不是源站，而是代理服务器：选路选的是「到代理」的路，建连建的是「到代理」的连接。对 HTTPS，浏览器会先和代理建连，再用 CONNECT 方法请代理开一条通往源站的隧道，之后的数据在隧道里透传。整条出口路径因此改道，但选路、建连、复用这套机制本身不变，只是作用对象从源站换成了代理。</div>

### 汇总：这一节点交出去的是什么

查路由表定了接口和下一跳，选源地址定了出去的身份，Happy Eyeballs 从候选里赛跑出实际要连的地址，连接池先看能不能复用。到这里，网络服务手里是一条**确定的出口路径**：确定的连接对象、选定的目标地址、出口网络接口、第一跳、以及「有没有现成连接可复用」的结论。

如果没有现成连接可用，接下来就要在这条路径上真正建立一条可靠、有序的传输连接——这是节点四。

<p class="bc-sec">主线整理</p>

```text
拿到一组候选 IP（可能含 IPv4 + IPv6）
        ↓ 去这个目标，该从哪出？
查路由表（最长前缀匹配）→ 定出口接口 + 下一跳
        ↓ 下一跳 IP 后续会被解析成 MAC（分支展开）
选源地址 → 定这次连接对外的身份
        ↓ 候选地址先试谁？
Happy Eyeballs：IPv6/IPv4 近乎并发赛跑，谁先成功用谁
        ↓ 建连前先看捷径
连接池复用：有可用连接就直接用，跳过建连
        ↓
产出：一条确定的出口路径（接口 / 目标地址 / 下一跳 / 可否复用）
```

<p class="bc-sec">设计取舍</p>

**内核集中管路由表**，让所有连接共用一套一致的选路逻辑，应用不用各自操心多网卡、VPN。代价是路由配置错了（比如 VPN 抢了默认路由）会影响全局。

**Happy Eyeballs 并发赛跑**，用一点点额外的连接尝试开销，换掉「IPv6 不通就干等超时」的最坏体验。代价是可能同时发起了两个连接，其中一个随后被取消，稍微多耗一点资源。

**连接池复用**，用维护空闲连接的内存和管理成本，换掉重复建连、重复握手的巨大延迟。代价是要处理连接何时过期、对端何时悄悄关闭这些一致性问题。

一条贯穿的观念：这一节点几乎所有机制都在「尽量不新建连接、新建也尽量不等待」上做文章，因为建连和握手正是网络延迟的大头。

<p class="bc-sec">面试回答</p>

拿到一组目标 IP 后，操作系统先查路由表决定从哪张网卡出、第一跳交给哪个网关，靠的是最长前缀匹配，本地子网直接送达，外网走默认路由到网关。选好接口后再选源地址，决定这次连接对外的身份和回程路径。目标地址常常同时有 IPv6 和 IPv4，现代浏览器用 Happy Eyeballs 让两者近乎并发地发起连接、谁先成功用谁，避免 IPv6 不通时干等超时。真正握手之前还有一道复用捷径：如果连接池里已经有到同一目标的可用连接，就直接复用，跳过建连——这就是同站第二个请求为什么明显更快。如果走代理，选路和建连的对象从源站换成代理，HTTPS 还会用 CONNECT 开隧道。最终产出是一条确定的出口路径，交给下一步去建传输连接。

<p class="bc-sec">常见追问</p>

**下一跳和目的地是一回事吗？**（校招必须掌握）
不是。目的地 IP 全程不变，是数据包最终要到的地方。下一跳是「这一段先交给谁转发」，通常是网关，每经过一跳，链路层的 MAC 地址会变，但 IP 目的地不变。

**Happy Eyeballs 解决什么问题？**（回答出来加分）
解决 IPv6 优先但可能不通导致的首连超时。它让 IPv4/IPv6 近乎并发尝试连接，给 IPv6 一点起跑优势，谁先握手成功就用谁，另一个取消，避免为不通的通路干等。

**为什么同一个网站第二个请求更快？**（校招必须掌握）
很大程度是连接复用。浏览器把空闲连接放进连接池，按目标主机、端口、是否加密等维度索引，命中就跳过建连和握手，直接发请求。

**路由表怎么选出一条规则？**（回答出来加分）
按最长前缀匹配，选目标 IP 命中的最具体那条。本地子网内的目标下一跳是自己，外网目标匹配默认路由 0.0.0.0/0，下一跳是默认网关。

**下一跳 IP 怎么变成能发帧的地址？**（通常不需要主动展开）
在以太网/Wi-Fi 上要先拿到下一跳的 MAC。IPv4 用 ARP 广播询问，IPv6 用邻居发现 NDP。拿到 MAC 才能把二层帧发到下一跳。

---

**本节点产出**：一条确定的出口路径——连接对象、选定的目标地址、出口接口、下一跳，以及能否复用现有连接的结论。

**交给谁**：节点四 · TCP 与 QUIC 连接。

**下一节点为什么因此开始**：如果连接池里没有可复用的连接，网络服务就得在这条选定的路径上，从零建立一条能可靠、有序传输数据的连接。用 TCP 还是 QUIC、握手要几个往返、怎么在建连的同时就把加密准备好——这些正是节点四的主题。


<div class="bc-refs"><b>参考来源</b><br>[1] <a href="https://www.rfc-editor.org/rfc/rfc8305" target="_blank" rel="noopener">https://www.rfc-editor.org/rfc/rfc8305</a></div>

<div class="bc-nav"><a href="/2026/08/21/browser-course-02/">← 02 · 主机解析</a><a class="r" href="/2026/08/21/browser-course-04/">04 · TCP 与 QUIC 连接 →</a></div>
