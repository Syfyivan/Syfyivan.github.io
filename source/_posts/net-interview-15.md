---
title: "《秋招计网面试实战课》第15讲 · 代理专题：正向/反向代理、抓包中间人与 AI 时代的 API 代理"
date: 2026-07-09 23:00:00
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
第02讲我们在「输入 URL 后发生了什么」的链路里补了一步：代理决策。这一讲把代理单独讲透。为什么值得单独一讲？因为在如今这个 AI 时代，代理几乎无处不在——科学上网、公司统一出口、本地抓包调试、给国外大模型 API 配转发。你排查一个「本机连不上但换个环境就好」的问题，八成绕不开代理。面试里代理也是个高区分度话题：会的人能把正向代理、反向代理、CONNECT 隧道、中间人抓包一口气讲清楚，不会的人连「代理和网关有啥区别」都答得含糊。
</div>

## 🎯 这一讲能答对哪些面试题

- 正向代理和反向代理有什么区别？各自典型场景是什么？
- 代理和网关（Nginx、API Gateway）是不是一回事？
- HTTP 代理是怎么转发 HTTPS 流量的？为什么它看不到明文？
- 抓包工具（Charles / Fiddler / mitmproxy）为什么能看到 HTTPS 明文？
- SOCKS 代理和 HTTP 代理有什么区别？
- 为什么本机 ping 不通、但浏览器/带代理的程序能访问？
- 给大模型 API（如 OpenAI）配代理时，是在哪一层做的转发？

## 📖 核心八股：先讲清楚定义

### 什么是代理：一个替你跑腿的中间人

代理（Proxy）就是夹在「客户端」和「目标服务器」之间的一个中间节点。你不直接连目标，而是把请求交给代理，由它替你去访问目标，再把结果带回来。加了这么一层，能干的事就多了：隐藏真实来源、集中管控、缓存加速、安全过滤、负载分发。

关键要先分清两个方向——**正向代理**和**反向代理**。这是本讲最高频的考点，也是最容易混的地方。

```text
正向代理（Forward Proxy）：代理站在“客户端”这边，替客户端出去
  你(客户端) ──► 正向代理 ──► 目标服务器(它不知道你是谁)
  典型：科学上网、公司上网出口、爬虫换 IP、本地抓包工具
  特征：服务器只看到代理的 IP，看不到真实客户端；客户端要主动配置代理

反向代理（Reverse Proxy）：代理站在“服务器”这边，替服务器接客
  客户端 ──► 反向代理 ──► 后端服务器集群(客户端不知道有几台)
  典型：Nginx、负载均衡、API 网关、CDN 边缘节点
  特征：客户端以为在直接访问网站，其实先到了反向代理；对客户端透明
```

<div class="niv-a">
<strong>一句话区分（背这个）：</strong>正向代理是「替客户端」发请求，隐藏的是客户端，客户端要主动配置它；反向代理是「替服务器」收请求，隐藏的是后端服务器，对客户端是透明的。同一台机器，站在客户端一侧就是正向、站在服务器一侧就是反向——区别在「它代表谁、隐藏谁」，不在软件本身。
</div>

<div class="niv-why">
为什么最好用「代表谁」来判断，而不是死记场景？因为 Nginx 既能做反向代理，也能配成正向代理；一个东西是不是反向代理，取决于它部署在链路的哪一侧、隐藏的是谁。抓住「隐藏客户端=正向、隐藏服务器=反向」这个本质，什么变种都能判断。
</div>

### 代理和网关、负载均衡的关系

面试常追问「反向代理、网关、负载均衡是不是一个东西」。它们高度重叠但侧重点不同：

| 概念 | 本质 | 侧重 |
|---|---|---|
| 反向代理 | 站在服务器侧转发请求的中间层 | 转发、隐藏后端、缓存 |
| 负载均衡 | 把请求分摊到多台后端 | 分流、高可用、扩容 |
| API 网关 | 反向代理 + 统一入口能力 | 鉴权、限流、路由、协议转换 |

可以这样理解：反向代理是底座能力，负载均衡是它常干的一件事（往多台后端分流），API 网关是在反向代理之上再叠加鉴权、限流、路由、监控等一整套「统一入口」功能。Nginx 常同时扮演反向代理 + 负载均衡；网关（如各类 API Gateway）则更偏业务管控。

### HTTP 代理怎么转发 HTTPS：CONNECT 隧道

这是代理里最容易被追问、也最能体现理解深度的一块。HTTP 代理转发**明文 HTTP** 很简单：客户端把完整请求发给代理，代理解析后替你去请求目标。但 HTTPS 是加密的，代理没有密钥，怎么转发？答案是 `CONNECT` 隧道：

```text
客户端想通过 HTTP 代理访问 https://api.example.com：

1. 客户端 ──► 代理：  CONNECT api.example.com:443 HTTP/1.1
2. 代理 ──► 目标：    和 api.example.com:443 建立 TCP 连接
3. 代理 ──► 客户端：  HTTP/1.1 200 Connection Established
4. 此后代理只做“字节搬运工”，双向透传加密数据
5. TLS 握手在【客户端 ↔ 目标】之间端到端完成，代理看不到密钥
```

<div class="niv-why">
为什么这样设计代理就看不到 HTTPS 明文？因为 TLS 握手是客户端和真实目标服务器直接完成的，会话密钥只有这两端有，代理全程只是在两个 TCP 连接之间来回倒腾加密字节，它既没有私钥也没参与密钥协商，自然解不开。这正是 HTTPS「端到端加密」的体现——中间多几个转发节点都偷看不到内容。
</div>

### SOCKS 代理 vs HTTP 代理

另一类常见代理是 SOCKS（常见 SOCKS5）。简单对比：HTTP 代理工作在应用层，理解 HTTP 语义，只适合代理 HTTP/HTTPS 流量；SOCKS 代理工作在更底层，只负责转发 TCP（SOCKS5 也支持 UDP）字节，不关心上层是什么协议，所以更通用（能代理各种协议，不限于 Web）。SOCKS5 还支持把域名解析交给代理端来做（remote DNS），这也是「本机不解析、代理解析」的一种典型情况。

## 🔍 场景追问：面试官会顺着问

<div class="niv-scene"><strong>追问：</strong>「Nginx 反向代理是什么？为什么网站前面都要放一层它？」</div>

Nginx 作为反向代理，是把它放在后端服务集群前面，作为统一入口接收所有客户端请求，再转发给后面的应用服务器。放这一层的收益很多：一是隐藏和保护后端（客户端不知道真实服务器地址和数量）；二是负载均衡，把请求分摊到多台后端提高吞吐和可用性；三是集中处理 TLS（在 Nginx 上做 HTTPS 卸载，后端用明文，省后端算力）；四是静态资源缓存、gzip 压缩、限流等都能在这一层统一做。一句话：反向代理让「一个域名后面能藏一整套复杂架构」，对客户端却表现得像一台服务器。

<div class="niv-scene"><strong>追问：</strong>「抓包工具能看到 HTTPS 明文，不是说好端到端加密看不到吗？矛盾吗？」</div>

不矛盾。默认情况下代理确实看不到（就是上面 CONNECT 隧道那套）。抓包工具能看到，是因为它做了「你授权的中间人（MITM）」：你在本机**主动安装并信任了它的自签根证书**之后，它就对你伪装成服务器、对服务器伪装成你，把一条端到端的 TLS 拆成「客户端↔抓包工具」和「抓包工具↔服务器」两段，各做一次 TLS，于是中间那段能拿到明文。前提是你自己信任了它的根证书；没装这个证书，浏览器会直接报证书不受信任、连接被拒。所以这不是 HTTPS 被破解，而是「信任链被你本人主动打开了一个口子」——正好反证了证书信任链的价值。

<div class="niv-scene"><strong>追问：</strong>「我给程序配了 HTTP_PROXY，但有的请求还是没走代理，可能是什么原因？」</div>

常见几种：一是 `NO_PROXY`（或 `no_proxy`）里配了例外域名/网段，命中的就直连不走代理；二是有些程序不读环境变量，只认自己配置文件里的代理设置（环境变量代理不是强制标准，是约定俗成）；三是 HTTPS 请求要看程序是否正确处理 `HTTPS_PROXY`，只配了 `HTTP_PROXY` 可能不覆盖 https；四是有些底层库直接走系统代理设置而非环境变量。排查时先确认「这个程序到底从哪读代理配置」，再看有没有被 NO_PROXY 命中。

<div class="niv-scene"><strong>追问：</strong>「本机 ping 一个地址不通，但带代理的程序能访问，怎么解释？」</div>

这就是第02讲那道题的延伸。`ping` 用 ICMP、且是本机直连、本机做 DNS；而带代理的程序把 DNS 解析和 TCP 连接都交给代理去做。所以「本机直连探测失败」和「经代理访问成功」是两条完全不同的路径，可以同时成立。反过来也一样：代理挂了的时候，ping 目标可能是通的，但浏览器（走代理）反而打不开。判断问题时，一定要先问「这条请求到底走没走代理」。

<div class="niv-scene"><strong>追问：</strong>「AI 时代大家常给大模型 API 配代理，这个代理是在哪一层、怎么工作的？」</div>

这里要分两种常见做法，答清楚很加分。第一种是**网络层代理**：给调用方配 `HTTPS_PROXY` 指向一个正向代理（或用 CONNECT 隧道），请求原样加密转发到官方 API，代理只解决「网络可达」问题，看不到内容。第二种是**应用层 API 代理/网关**：自己搭一个反向代理服务（比如改写 base_url 指向自建网关），由它统一做鉴权、换 key、限流、计费、日志、模型路由，再转发到上游大模型服务——这本质就是一个反向代理/API 网关，属于服务器侧。面试时能区分「我是在网络层配代理让请求出得去，还是在应用层搭了个网关统一管控」，说明你对代理的两个方向都吃透了。

## 🛠 动手验证（可选做）

用 `curl` 显式走代理，能直观看到代理是怎么参与请求的。

```bash
# 让 curl 通过 HTTP 代理访问目标（-x 指定代理地址）
# 访问 https 时，curl 会先向代理发 CONNECT 建隧道，可加 -v 看到这个过程
curl -v -x http://127.0.0.1:7890 https://www.example.com -o /dev/null

# 走 SOCKS5 代理（socks5h 表示让代理端做 DNS 解析，即 remote DNS）
curl -v -x socks5h://127.0.0.1:1080 https://www.example.com -o /dev/null

# 通过环境变量配置代理（很多命令行程序会自动读取）
export HTTPS_PROXY=http://127.0.0.1:7890
export HTTP_PROXY=http://127.0.0.1:7890
export NO_PROXY=localhost,127.0.0.1,.internal.company.com   # 这些不走代理
curl -v https://www.example.com -o /dev/null
```

```text
加了 -v 访问 https 时，你会在输出里看到类似这样的关键行（说明走了 CONNECT 隧道）：
  * Establish HTTP proxy tunnel to www.example.com:443
  > CONNECT www.example.com:443 HTTP/1.1
  < HTTP/1.1 200 Connection established
  * 之后才是 TLS 握手（SSL connection using ...）
```

<div class="niv-why">
看到 `CONNECT ... 200 Connection established` 再接 TLS 握手，就印证了前面讲的：代理先建隧道，TLS 是在隧道里客户端和目标端到端完成的。把地址换成你本机实际的代理端口再跑，数值和端口以你的环境为准，别照抄示例里的 7890/1080。
</div>

## 🧨 高频翻车点

<div class="niv-trap">
<strong>翻车一：把正向代理和反向代理背反，或只会举例子不会说本质。</strong><br>
记死「代表谁、隐藏谁」：正向代理代表客户端、隐藏客户端、客户端要主动配；反向代理代表服务器、隐藏后端、对客户端透明。只会说「科学上网是正向、Nginx 是反向」而讲不出本质，一追问变种就露馅。
</div>

<div class="niv-trap">
<strong>翻车二：以为 HTTP 代理能看到 HTTPS 明文。</strong><br>
普通 HTTP 代理转发 HTTPS 用的是 CONNECT 隧道，只透传加密字节，看不到明文。能看到明文的是「你主动信任了其根证书的中间人抓包工具」，这是两码事。把这俩混为一谈是常见错误。
</div>

<div class="niv-trap">
<strong>翻车三：认为「配了代理环境变量所有程序就一定走代理」。</strong><br>
环境变量代理是约定俗成不是强制标准，很多程序不读、或有自己的配置、或被 NO_PROXY 命中而直连。排查问题时不要想当然，先确认目标程序到底从哪读代理、有没有例外规则。
</div>

## 🎤 面试话术模板

<div class="niv-a">
「代理就是客户端和目标服务器之间的中间人，分正向和反向两种：正向代理代表客户端、替客户端出去访问、对服务器隐藏了真实客户端，比如科学上网、公司出口、抓包工具，客户端需要主动配置；反向代理代表服务器、部署在后端集群前面接收请求再转发，对客户端是透明的，比如 Nginx、负载均衡、API 网关、CDN。判断一个代理是正向还是反向，看它隐藏的是客户端还是服务器就行。HTTP 代理转发 HTTPS 靠 CONNECT 隧道，只透传加密字节、看不到明文；抓包工具能看到明文是因为你在本机主动信任了它的自签根证书，让它做了授权的中间人。现在给大模型 API 配代理也很常见，网络层是配 HTTPS_PROXY 让请求出得去，应用层则是自建一个反向代理网关做鉴权、换 key、限流和模型路由。」
</div>

## ✅ 自测三问

1. 正向代理和反向代理的本质区别是什么？各举一个典型场景。
2. HTTP 代理转发 HTTPS 时为什么看不到明文？抓包工具又为什么能看到？
3. 给自建的大模型 API 网关做统一鉴权和限流，它属于正向代理还是反向代理？

<details class="niv-fold"><summary>对答案</summary>

1. 本质区别在「代表谁、隐藏谁」：正向代理代表并隐藏客户端、客户端需主动配置（如科学上网、抓包工具）；反向代理代表并隐藏后端服务器、对客户端透明（如 Nginx、负载均衡、API 网关）。

2. HTTP 代理转发 HTTPS 走 CONNECT 隧道，TLS 握手在客户端和真实目标之间端到端完成，代理只透传加密字节、没有会话密钥，所以看不到明文。抓包工具能看到，是因为你在本机主动安装并信任了它的自签根证书，它据此做「授权的中间人」，把一条 TLS 拆成两段各自加密，中间那段拿到明文。

3. 属于反向代理（更确切说是反向代理之上的 API 网关）。它部署在上游大模型服务前面、对调用方表现为统一入口、隐藏了真实上游，并叠加了鉴权、限流、路由等能力，是典型的服务器侧反向代理/网关。

</details>

## 📦 复制带走

<div class="niv-card">
<strong>正向 vs 反向：</strong>看「代表谁、隐藏谁」。正向=代表客户端、隐藏客户端、需主动配置（科学上网/抓包）；反向=代表服务器、隐藏后端、对客户端透明（Nginx/负载均衡/API 网关/CDN）。
</div>

<div class="niv-card">
<strong>HTTPS 转发：</strong>HTTP 代理用 CONNECT 建隧道、只透传加密字节、看不到明文；抓包工具看到明文靠的是你主动信任其自签根证书做的授权中间人，不是破解 HTTPS。
</div>

<div class="niv-card">
<strong>SOCKS vs HTTP 代理：</strong>HTTP 代理在应用层、懂 HTTP、只代理 Web；SOCKS 在更底层、只转发 TCP/UDP 字节、更通用。socks5h 让代理端做 DNS 解析（remote DNS）。
</div>

<div class="niv-card">
<strong>AI 时代代理：</strong>网络层配 HTTPS_PROXY 解决「出得去」；应用层自建反向代理网关解决「统一鉴权/换 key/限流/模型路由」。前者看不到内容，后者是服务器侧的 API 网关。
</div>

<p style="margin-top:24px"><a href="/courses/net-interview/">← 回到《秋招计网面试实战课》目录</a></p>
