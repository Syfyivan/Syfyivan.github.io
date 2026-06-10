---
title: "Surge 和免费代理工具的差别：从流量接管到规则引擎"
date: 2026-06-10 19:30:00
tags: [Surge, 代理工具, 网络, DNS, TUN, 技术原理]
categories: [技术笔记, 网络]
---

很多人第一次接触 Surge、Clash、sing-box、v2rayN 这类工具时，最容易把它们看成同一种东西：都是“开一个开关，让流量走另一条路”。但真正用久之后会发现，它们的差异不只是收费和免费，而是产品边界、内核能力、配置模型、可观测性、平台集成和维护方式的差异。

这篇只讨论技术机制和工程取舍，不讨论节点购买、绕过策略或具体配置。

## 先把概念拆开

这类工具至少有四层：

```text
用户界面 / 配置管理
  -> 流量接管层
  -> DNS 与规则引擎
  -> 出站协议与连接管理
```

把这几层拆开后，Surge 和免费工具的差别就清楚了。

Surge 更像一个集成度很高的商业网络工具箱：它把 GUI、配置文件、规则、DNS、策略组、MITM 调试、脚本、日志、抓包和 Apple 平台的 Network Extension 集成在一起。免费工具阵营则更分散：sing-box、mihomo 这类偏“内核”；v2rayN、NekoBox、Clash Verge 类工具偏“GUI 壳”；订阅转换、规则集、面板和路由器插件又是另一层生态。

所以比较时不能只问“哪个免费”，而应该问：

- 谁负责接管流量；
- 谁负责解析 DNS；
- 谁负责按规则选出口；
- 谁负责实现协议；
- 谁负责调试和展示状态；
- 谁承担长期维护和安全更新。

## 第一层：流量怎么被接管

本机程序发起网络请求后，代理客户端必须先“看见”这些请求。常见接管方式有三种。

### 系统代理

这是最轻量的方式。

```text
应用
  -> 系统 HTTP/SOCKS 代理设置
  -> 本地代理端口
  -> 规则判断
  -> 直连或转发
```

优点是性能好、侵入低、容易理解。缺点是并不是所有应用都遵守系统代理，有些程序会自己建连接、自己做 DNS，或者只支持部分协议。

Surge Mac 的“设置为系统代理”、mihomo 的 `mixed-port` / `port` / `socks-port`、v2rayN 的系统代理模式，本质上都属于这一类。

### TUN / 虚拟网卡

TUN 模式会在系统里创建一个虚拟网络接口，把 IP 层流量导入用户态程序。

```text
应用
  -> 操作系统路由表
  -> 虚拟网卡 TUN
  -> 用户态网络栈 / 连接还原
  -> DNS、嗅探、规则判断
  -> 直连或转发
```

它的优势是覆盖面大，不依赖应用是否支持系统代理。代价是复杂度更高：路由表、DNS 劫持、UDP、IPv6、回环、局域网共享、系统权限都会影响结果。

Surge iOS 使用 Apple 的 Network Extension 建立虚拟网卡；Surge Mac 的增强模式也属于这一路径。sing-box 和 mihomo 也都支持 TUN，只是它们通常需要用户或 GUI 壳处理权限、路由和平台细节。

### 透明代理和路由器接管

在 Linux、OpenWrt 或软路由上，还可以通过防火墙规则、策略路由、TProxy、redir 等方式把局域网设备流量导入代理内核。

这类方案适合“让整个家庭网络共用一套策略”，但它的调试成本也最高：客户端不知道自己被接管了，问题可能出在 DNS、NAT、防火墙、策略路由、内核参数或代理规则任意一层。

## 第二层：DNS 不是附属功能

很多代理问题表面上是“连不上”，根因其实是 DNS。

DNS 至少影响三件事：

- 规则匹配时看到的是域名还是 IP；
- 代理服务器自己的域名由谁解析；
- 最终连接的目标地址是否和规则预期一致。

Surge 有自己的 DNS 客户端，可以配置上游 DNS、本地映射、加密 DNS，并把 DNS 行为纳入整体工作流。mihomo 支持 fake-ip、nameserver-policy、proxy-server-nameserver 等配置；sing-box 的 DNS 规则更像一套独立的可编程路由系统，可以按域名、进程、入站、规则集、响应结果等条件处理。

这也是为什么“同一个节点，在两个客户端上表现不同”并不奇怪。节点只是出口；真正决定链路的是：

```text
域名解析 -> 规则匹配 -> 出站选择 -> 协议握手 -> 连接复用 / UDP / TLS 行为
```

如果两个客户端的 DNS 策略不同，后面的规则和出口自然可能不同。

## 第三层：规则引擎决定“走哪条路”

这类工具最核心的能力不是“代理”，而是“分流”。

一个规则引擎通常会做这件事：

```text
拿到请求属性：
  domain / ip / port / protocol / process / inbound / network

按顺序匹配规则：
  命中第一条可用规则

得到动作：
  DIRECT / REJECT / 某个代理 / 某个策略组
```

Surge 和 mihomo 都强调规则从上到下匹配，优先级由顺序决定。sing-box 的规则模型更通用，route rule 和 DNS rule 都可以有丰富的匹配字段。

规则引擎的难点不在语法，而在信息何时可得。

比如：

- HTTP 代理请求天然带域名；
- HTTPS 直连只在 TLS ClientHello 里暴露 SNI，且 ECH 普及后还会变少；
- TUN 先看到的是 IP 包，不一定立刻知道域名；
- DNS 先解析再连接时，可以把“域名 -> IP”的关系缓存起来辅助后续匹配；
- QUIC/HTTP3 走 UDP，对透明代理和中间处理更敏感。

所以，高级客户端会同时做 DNS 关联、协议嗅探、进程识别和规则集索引。用户看到的是一条规则，内核背后要解决的是“怎么在正确时间拿到足够多的上下文”。

## 第四层：策略组不是 UI 小按钮

策略组看起来只是“香港、日本、自动选择、故障转移”这些按钮，实际是运行时决策器。

常见策略包括：

- 手动选择：用户固定选一个出口；
- 延迟测试：周期性请求测试 URL，选择延迟最低的出口；
- 故障转移：当前出口失败后切到下一个；
- 负载均衡：在多个出口之间分摊连接；
- 链式代理：一个出口再通过另一个出口拨出。

Surge 的优势在于这些策略和 UI、日志、脚本、面板联动得比较完整。mihomo 的策略组生态也很强，尤其适合规则集和订阅组合。sing-box 则更偏“基础设施内核”，配置能力强，但 GUI 体验取决于外层客户端。

免费工具能做到很多 Surge 能做的事，但往往需要你理解更多拼装边界。

## 第五层：MITM 和脚本是开发工具能力

Surge 和普通代理客户端拉开差距的一个地方，是 HTTP 处理能力。

不开 MITM 时，客户端最多只能看见：

```text
目标域名 / IP / 端口 / 协议 / 连接时序
```

开启 MITM 并信任本地 CA 后，客户端可以在本机调试场景中解密 HTTPS，再做：

- URL rewrite；
- header rewrite；
- body rewrite；
- mock 本地响应；
- JavaScript 请求/响应脚本；
- 定时脚本或事件脚本。

这很适合开发者调试 API、复现线上请求、临时 mock、定位移动端网络问题。但它也改变了 TLS 信任边界。原则上只应该在自己设备、自己掌控的测试目标上开启，并且尽量限制域名范围。银行、支付、账号、企业内网这类请求不应该随手纳入 MITM。

免费工具阵营也有脚本、覆写、插件或面板生态，但一致性取决于具体客户端。很多开源内核更关注“把连接路由出去”，不是把自己做成完整的 HTTP 调试平台。

## Surge 贵在哪里

Surge 的价格买的不是某个神秘协议，而是集成度和产品化。

具体说，它的价值主要在这些地方：

- Apple 平台集成：iOS/macOS 的 Network Extension、系统代理、虚拟网卡、权限和后台限制都处理得比较完整；
- 可观测性：请求列表、日志、策略命中、DNS、脚本、连接状态适合日常排障；
- 规则和策略体验：配置文件仍然是文本，但 GUI 能把策略组、测试、切换和日志组织起来；
- 开发者工具链：MITM、rewrite、mock、脚本、HTTP API、模块化配置适合调试；
- 稳定维护：商业软件要为兼容性、文档、发行节奏和用户支持负责；
- 低拼装成本：不必在“内核、GUI、规则集、订阅转换、系统权限”之间自己协调太多。

缺点也明确：

- 收费；
- 闭源，内部实现不可审计；
- 平台重心偏 Apple；
- 很多高级功能仍要求用户理解网络基础；
- 配置生态和开源内核不是完全兼容。

所以 Surge 不是“免费工具的高级皮肤”，而是一个商业化的网络调试与代理平台。

## 免费工具强在哪里

免费工具不能一概而论。更准确地说，它们强在开放生态。

### sing-box

sing-box 更像一个通用代理平台。它把 inbound、outbound、route、DNS、rule-set、TUN 等能力做成结构化配置，适合服务端、路由器、Linux、Android、自动化部署和需要可组合能力的场景。

它的优势是边界清晰、跨平台、配置表达力强。代价是学习曲线高，很多体验取决于 GUI 壳或你自己的工程能力。

### mihomo

mihomo 继承并扩展了 Clash 风格：规则、规则提供者、代理提供者、代理组、fake-ip DNS、TUN、外部控制 API。这套生态非常适合“订阅 + 规则集 + 策略组”的日常使用方式。

它的优势是社区规则和配置生态成熟，很多 GUI 都围绕这套模型构建。代价是历史包袱也多：Clash、Clash.Meta、mihomo、不同 GUI、不同配置格式之间容易让新手混淆。

### v2rayN

v2rayN 更像 Windows/Linux/macOS 桌面上的多内核控制台。它本身是 GUI 客户端，可以调用 Xray、sing-box、mihomo 等不同内核。理解 v2rayN 时，不要把 GUI 和内核混为一谈：真正处理连接的是后面的 core，v2rayN 负责导入、转换、启动、切换和展示。

这类工具的优势是免费、可替换、选择多。问题是组合越多，兼容性、日志定位和安全来源就越需要自己把关。

## 为什么免费工具也有“成本”

免费不等于没有成本，只是成本从钱变成了时间和风险。

常见隐性成本包括：

- 不同客户端配置格式不完全兼容；
- GUI 和内核版本不同步；
- 老项目停更、分叉、改名后信息混乱；
- 订阅转换会引入额外信任链；
- 规则集来源不清楚时可能产生隐私和安全问题；
- 报错可能只出现在内核日志，GUI 不一定解释清楚；
- TUN、DNS、IPv6、UDP 问题需要系统网络知识。

从工程角度看，免费工具适合愿意理解系统边界的人；Surge 适合愿意用钱换集成体验、调试效率和较稳定维护的人。

## 一个实用判断框架

如果你主要是 Apple 设备，并且经常需要调试移动端接口、看请求日志、写 rewrite 或脚本，Surge 的价值会比较明显。

如果你主要在 Windows 上日常使用，多内核 GUI 比较合适，v2rayN 这类工具的性价比更高。

如果你要跑在 Linux、软路由、服务器、容器或自动化环境里，sing-box / mihomo 这类内核更自然。

如果你非常在意开源可审计、可迁移、可脚本化，免费工具更有优势。

如果你不想理解 DNS、TUN、规则顺序、策略组和日志，那么无论收费还是免费，都会踩坑。Surge 只是把坑包装得更可见，不会让网络基础消失。

## 这类工具的共同原理

最后把原理压缩成一张图：

```text
应用发起连接
  -> 系统代理 / TUN / 透明代理接管
  -> 客户端解析或关联 DNS
  -> 获取请求上下文：域名、IP、端口、协议、进程、入站
  -> 自上而下匹配规则
  -> 选中 DIRECT、REJECT、代理节点或策略组
  -> 策略组按手动、测速、故障转移等逻辑选具体出口
  -> 出站协议建立连接
  -> 日志、面板、脚本、MITM 按需介入
```

Surge 和免费工具的区别，本质上是这条链路里“哪些层由一个商业产品统一负责，哪些层由开源组件和社区生态拼装完成”。

所以我会这样总结：

```text
Surge = 高集成商业网络工具箱
sing-box = 通用、强表达力的代理内核
mihomo = Clash 风格规则/策略生态的主流延续
v2rayN = 多内核桌面 GUI 管理器
```

选哪个，不是看谁“更高级”，而是看你的主要场景在哪一层：调试、日常分流、跨平台部署、软路由、开源可控，还是低维护成本。

## 参考资料

- [Surge Manual: Start Here](https://manual.nssurge.com/)
- [Surge Manual: Understanding Surge](https://manual.nssurge.com/book/understanding-surge/en/)
- [Surge Manual: Traffic Routing](https://manual.nssurge.com/rule.html)
- [Surge Manual: DNS](https://manual.nssurge.com/dns/dns-override.html)
- [Surge Manual: HTTP Processing and Scripting](https://manual.nssurge.com/http-processing.html)
- [Apple Developer: NEPacketTunnelProvider](https://developer.apple.com/documentation/NetworkExtension/NEPacketTunnelProvider)
- [sing-box: TUN inbound](https://sing-box.sagernet.org/configuration/inbound/tun/)
- [sing-box: Route Rule](https://sing-box.sagernet.org/configuration/route/rule/)
- [sing-box: DNS Rule](https://sing-box.sagernet.org/configuration/dns/rule/)
- [mihomo docs: Route Rules](https://wiki.metacubex.one/en/config/rules/)
- [mihomo docs: DNS](https://wiki.metacubex.one/en/config/dns/)
- [mihomo docs: Proxy Groups](https://wiki.metacubex.one/en/config/proxy-groups/)
- [mihomo docs: Rule Providers](https://wiki.metacubex.one/en/config/rule-providers/)
- [v2rayN GitHub](https://github.com/2dust/v2rayN)
- [v2rayN Wiki: supported cores](https://github.com/2dust/v2rayn/wiki/List-of-supported-cores)
- [Great Firewall Report: deleted or archived proxy-tool repositories in 2023](https://gfw.report/blog/developers_deleted_repos/en/)
