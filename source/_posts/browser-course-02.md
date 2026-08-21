---
title: "《从 URL 到页面显示》第 02 讲 · 主机解析"
date: 2026-08-21 10:00:00
tags: [DNS, 缓存, 计算机网络, 校招, 面试]
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

网络服务拿到加载任务后，不会拿着主机名直接去查 DNS。它先决定「这次到底要连谁」——是目标服务器还是某个代理，再判断这个名字要不要解析、能不能命中缓存，最后才可能走 DNS。这一节点的产出，是一组可以真正拿去建连接的 IP 地址。

<p class="bc-sec">理解原理</p>

### 从上一节点的输出开始：一份带主机名的加载任务

上一节点交给网络服务的，是一份结构化的加载任务，里面的目标 URL 带着一个主机名，比如 `github.com`。问题在于：网络连接只能建立在 IP 地址上，主机名连不了。所以网络服务在做任何连接动作之前，必须先把「名字」变成「地址」。

但这里有个常被跳过的前提：**在解析名字之前，得先确定这个名字是不是我要连的对象。** 如果这次访问要走代理，真正需要建立连接的其实是代理服务器，而不是 `github.com`。所以第一步不是解析，是代理决议。

### 第一步：先问代理，决定「连目标还是连代理」

网络服务会先查这次请求应该直连还是走代理。代理配置可能来自系统设置，也可能来自一段叫 PAC（Proxy Auto-Config）的 JavaScript 脚本——它按 URL 返回「直连」或「用某个代理」。

这一步的结果直接改变后面要解析谁：

- 判定为直连，那么要解析的就是 `github.com` 本身。
- 判定为走代理，那么大多数情况下要连的是代理服务器，`github.com` 这个名字甚至会原样交给代理去解析（由代理那端负责查），本地不一定解析它。

<div class="bc-call bc-branch"><span class="bc-tag">旁支</span><strong>代理主机名触发一次额外解析</strong><br>如果代理本身是用主机名配置的（比如 `proxy.corp.com:8080`），那么这个代理名也需要先解析成 IP 才能连。这时被解析的对象从目标站点换成了代理，等于把这一整套解析流程套用到另一个名字上。这是总纲里说的「主线中可复用的子过程」的第一个实例。</div>

主线固定最普通的场景：**判定为直连，要解析的就是目标主机名。**

### 第二步：这个名字也许根本不用解析

确定要解析 `github.com` 之后，网络服务还不急着查 DNS，因为有些「名字」压根不需要 DNS：

- 如果地址本身就是 IP 字面量，比如 `http://192.168.1.1` 或 `http://[::1]`，它已经是地址了，直接拿去连，跳过整个解析。
- 如果是 `localhost`，它按约定指向本机回环地址（`127.0.0.1` / `::1`），也不需要真正走外部 DNS。

只有当名字确实是个需要查询的域名时，才进入下一步。

<div class="bc-call bc-impl"><span class="bc-tag">实现细节</span><strong>解析这件事由谁做</strong><br>在 Chromium 里，负责把主机名变成地址的组件叫 HostResolver，它跑在网络服务里。它统一处理「先查缓存、再决定走系统解析器还是内置 DNS 客户端」这套逻辑，上层只管要地址，不关心底层怎么查。这个名字不进基础主线。</div>

### 第三步：先看手边有没有现成答案（缓存）

真正要查询时，第一反应是复用已有结果，避免每次都发起一次网络往返。可用的「现成答案」来自几个不同层面，但**这里要破除一个流传很广的说法：不存在一个对所有环境都成立的固定缓存顺序。**

准确的说法是分层的：

- 浏览器自己维护一份内存里的解析缓存（Chromium 的 HostCache），命中就直接用。
- 操作系统层面也可能有自己的解析缓存（不同系统策略不同）。
- 系统解析器在查询时，通常还会先查本地静态映射文件 hosts。

这些层面各自存在、各有策略，具体先后和是否启用取决于平台与配置，而不是一条「浏览器缓存 → 系统缓存 → hosts → DNS」的铁律。校招里能说清「有多层缓存、目的是省掉重复查询」并指出「顺序不是固定的、依赖实现」，就已经比背顺序的人准确。

缓存全部落空，说明本地没有可用的历史答案，这才需要向外部发起一次真正的 DNS 查询。

### 第四步：DNS 是一棵分层的树，查询在树上逐级问

到这一步，解析器需要把 `github.com` 拿到 DNS（Domain Name System，域名系统）里去问。DNS 不是一台服务器，而是一个分层的分布式数据库 <a class="bc-cite" href="https://www.rfc-editor.org/rfc/rfc1034" target="_blank" rel="noopener">[1]</a>。理解这棵树，才能理解一次查询为什么要问好几方：

- 最顶上是根（root），它不知道 `github.com` 的地址，但知道谁管 `.com`。
- 往下是顶级域（TLD）服务器，管 `.com` 的这台不知道具体地址，但知道谁是 `github.com` 的权威服务器。
- 最下面是**权威服务器（authoritative server）**，它手里才有 `github.com` 真正的地址记录。

一次查询在这棵树上逐级下问，最终从权威服务器拿到答案。

### 第五步：递归与迭代，是「谁替我跑腿」的区别

本机通常不亲自跑遍整棵树。它把域名丢给一个**递归解析器（recursive resolver）**——一般是运营商提供的，或用户手动配置的（比如 `8.8.8.8`）。这里有两种查询姿态，区别在于「谁负责跟到底」：

- **递归查询**：本机对递归解析器说「你把最终答案给我」，跑腿的活儿全交给它。
- **迭代查询**：递归解析器对根、TLD、权威服务器逐个发问，每一台只回「我不知道，但你去问那台」，它顺着线索一路问到权威服务器。

所以本机和递归解析器之间是递归，递归解析器和各级服务器之间是迭代。递归解析器查到结果后按 TTL（Time To Live，生存时间）缓存一段时间，下次同一个域名就能直接回答，不必再跑一遍树。

### 第六步：查询走 UDP 还是 TCP，以及加密的新选择

DNS 查询默认走 UDP 的 53 端口，因为一次问答通常很小、要的是快。但当响应太大（比如记录很多，或启用了 DNSSEC 签名）导致一个 UDP 包装不下时，会回退到 TCP 重查一次 <a class="bc-cite" href="https://www.rfc-editor.org/rfc/rfc1035" target="_blank" rel="noopener">[2]</a>。所以「DNS 只用 UDP」是不准确的——它以 UDP 为主，必要时用 TCP 兜底。

传统 DNS 查询是明文的，路径上的人能看到你在解析什么域名。为此浏览器支持把 DNS 查询加密：DoH（DNS over HTTPS）把查询封装进 HTTPS 请求发出去 <a class="bc-cite" href="https://www.rfc-editor.org/rfc/rfc8484" target="_blank" rel="noopener">[3]</a>，Chromium 里这叫「安全 DNS（Secure DNS）」。

<div class="bc-call bc-bonus"><span class="bc-tag">加分细节</span><strong>解析器返回的可能不止一个地址</strong><br>一个域名常常同时有 IPv4 地址（A 记录）和 IPv6 地址（AAAA 记录），也可能有多个同类地址做负载均衡。所以解析的产出通常是一组候选地址，而不是唯一一个。至于这组地址里先连哪个、IPv4 和 IPv6 怎么取舍，不在解析这一步决定，而是留给下一节点的连接策略。</div>

<div class="bc-call bc-platform"><span class="bc-tag">平台差异</span><strong>系统解析器的差异</strong><br>「查缓存、读 hosts、发 DNS 请求」这套动作，在不使用内置 DNS 客户端时会交给操作系统的系统解析器完成，而 macOS、Linux、Windows 各自的解析器实现、hosts 文件位置、缓存策略都不同。这正是「平台差异」这一层要分开看的地方：解析的目标一致，落地细节因系统而异。</div>

### 汇总：这一节点交出去的是什么

代理决议确定了要连的对象，跳过了不需要解析的字面量，缓存尽力复用了历史答案，DNS 在必要时逐级问到了权威答案。到这里，网络服务手里握着的，是**当前要直接连接的那个对象（目标服务器或代理）的一组 IPv4 / IPv6 候选地址。**

但「有一组地址」还不等于「知道该怎么连出去」。从本机到这些地址，要走哪个网络接口、经过哪个下一跳、实际从哪个出口发出——这些还没定。这正是节点三要解决的。

<p class="bc-sec">主线整理</p>

```text
网络服务拿到带主机名的加载任务
        ↓ 先定「连谁」
代理决议：直连 or 走代理（走代理则解析对象变成代理）
        ↓ 主线取直连
判断名字是否需要解析：IP 字面量 / localhost 直接跳过
        ↓ 是需要查询的域名
查多层缓存（浏览器 HostCache / 系统缓存 / hosts）——顺序非铁律
        ↓ 缓存全落空
向递归解析器发起查询（本机↔解析器 递归；解析器↔各级 迭代）
        ↓ 沿 root → TLD → 权威 逐级问
拿到 A / AAAA 记录（UDP 为主，必要时 TCP；可用 DoH 加密）
        ↓
产出：当前连接对象的一组 IPv4 / IPv6 候选地址
```

<p class="bc-sec">设计取舍</p>

**先做代理决议再解析**，是因为「连谁」直接决定「解析谁」。把顺序倒过来会白白解析一个根本不会去连的名字。代价是每次请求都要先过一遍代理判断逻辑（可能还要跑 PAC 脚本）。

**多层缓存**，用一点内存和一致性风险，换掉大量重复的网络往返。风险在于：域名换了地址而缓存还没过期时，可能连到旧地址——TTL 就是用来限制这个陈旧窗口的。

**DNS 分层 + 递归/迭代分工**，让全球域名不必集中在一处，也让本机不必自己跑遍整棵树。代价是一次冷查询可能要好几个往返，这也是首屏慢时常被怀疑的一环。

**默认 UDP、必要时 TCP**，用无连接的轻量换速度，用 TCP 兜住大响应的可靠。**DoH 加密**用一点性能和「解析走哪台」的可控性，换查询内容的隐私。

<p class="bc-sec">面试回答</p>

网络服务拿到加载任务后，第一步不是查 DNS，是代理决议——先确定这次要连的是目标服务器还是代理，因为这决定了要解析谁。确定直连、要解析目标域名后，还要看它是不是 IP 字面量或 localhost，是的话直接用、不解析。接着查缓存，浏览器自己有解析缓存，系统也可能有，系统解析器还会看 hosts；这里要强调缓存顺序不是一条对所有环境都成立的铁律，是分层的、依赖实现。缓存都没命中，才向递归解析器发起 DNS 查询。DNS 是一棵分层的树，根只知道谁管 .com，TLD 只知道谁是权威，权威才有真正的地址。本机和递归解析器之间是递归查询——我把活儿全交给你；递归解析器再向各级做迭代查询，一路问到权威。查询默认走 UDP 53 端口，响应太大就回退 TCP，还能用 DoH 把查询加密。最终产出是一组 IPv4 和 AAAA 候选地址，交给下一步去决定怎么连出去。

<p class="bc-sec">常见追问</p>

**递归查询和迭代查询有什么区别？**（校招必须掌握）
区别在谁负责跟到底。本机对递归解析器发的是递归查询——「你把最终答案给我」，跑腿全交给它。递归解析器对根、TLD、权威发的是迭代查询——每台只回「我不知道，去问那台」，它顺着线索一路问到权威。

**DNS 用 UDP 还是 TCP？**（校招必须掌握）
默认 UDP 53 端口，因为一次问答小、要快。当响应大到一个 UDP 包装不下（记录多、DNSSEC 签名等），会回退到 TCP 重查。所以是「以 UDP 为主，TCP 兜底」，不是只用 UDP。

**「浏览器缓存 → 系统缓存 → hosts → DNS」这个顺序对吗？**（回答出来加分）
不能当成通用铁律。确实有多层缓存，但具体有哪些层、先后如何、是否启用，取决于平台和配置。准确说法是「分层缓存，目的是省掉重复查询，顺序依赖实现」。

**TTL 是干什么的？**（回答出来加分）
TTL 是一条 DNS 记录能被缓存多久。它在「省查询」和「地址变更后多快生效」之间做权衡：TTL 长省往返但地址切换慢，TTL 短切换快但查询频繁。

**DoH 解决什么问题？**（回答出来加分）
传统 DNS 明文，路径上的人能看到你解析了哪些域名。DoH 把查询封装进 HTTPS，隐藏查询内容、防篡改。代价是多一层加密开销，且解析走哪台服务器变得更集中。

**代理场景下域名由谁解析？**（通常不需要主动展开）
走 HTTP 代理时，目标域名常常原样交给代理，由代理那端解析并连接，本机只解析并连接代理本身。所以「本地一定会解析目标域名」在代理场景下不成立。

---

**本节点产出**：当前要直接连接的对象（目标服务器或代理）的一组 IPv4 / IPv6 候选地址。

**交给谁**：节点三 · 网络路径与出口选择。

**下一节点为什么因此开始**：有了一组候选地址，还不等于知道怎么把数据包发出去。本机可能有多张网卡、多个网络接口，要用哪一个、经过哪个下一跳、IPv4 和 IPv6 先试谁——这些都要在真正建立连接前定下来。节点三就负责把「一组地址」落实成「一条确定的出口路径」。


<div class="bc-refs"><b>参考来源</b><br>[1] <a href="https://www.rfc-editor.org/rfc/rfc1034" target="_blank" rel="noopener">https://www.rfc-editor.org/rfc/rfc1034</a><br>[2] <a href="https://www.rfc-editor.org/rfc/rfc1035" target="_blank" rel="noopener">https://www.rfc-editor.org/rfc/rfc1035</a><br>[3] <a href="https://www.rfc-editor.org/rfc/rfc8484" target="_blank" rel="noopener">https://www.rfc-editor.org/rfc/rfc8484</a></div>

<div class="bc-nav"><a href="/2026/08/21/browser-course-01/">← 01 · 用户输入与导航创建</a><a class="r" href="/2026/08/21/browser-course-03/">03 · 网络路径与出口选择 →</a></div>
