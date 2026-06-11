---
title: "计网与代理 02：DNS，代理工具里最容易被低估的一层"
date: 2026-06-11 20:20:00
tags: [计网, DNS, DoH, DoT, 代理工具, 分流]
categories: [技术笔记, 计网与代理]
---

代理工具里最容易被低估的一层是 DNS。

很多人以为 DNS 只是“把域名变 IP”。但在代理工具里，DNS 还决定规则能不能按域名命中、代理节点域名由谁解析、最终连到哪个地址、IPv4 和 IPv6 谁先被使用，以及日志里能不能把 IP 还原成可理解的域名。

## DNS 先解决什么问题

应用想访问：

```text
www.example.com
```

网络层真正需要的是 IP。DNS 的基础任务就是查询资源记录，比如：

```text
www.example.com -> A    -> 93.184.216.34
www.example.com -> AAAA -> 2606:2800:220:1:248:1893:25c8:1946
```

常见记录先记这些就够：

- A：域名到 IPv4；
- AAAA：域名到 IPv6；
- CNAME：这个名字只是别名，要继续查另一个名字；
- HTTPS/SVCB：告诉客户端服务端支持的连接参数，现代浏览器和 HTTP/3 场景会遇到；
- TTL：这个结果可以缓存多久。

DNS 不是每次请求都从根服务器一路查到底。系统、浏览器、递归解析器、代理客户端都可能缓存结果。

## 递归解析和权威解析

新手容易把 DNS 服务器都叫成“DNS”。更准确地看，常见链路是：

```text
应用 / 系统 stub resolver
  -> 递归解析器
  -> 根服务器
  -> TLD 服务器
  -> 权威服务器
```

大多数设备直接问的是递归解析器。它可以是运营商 DNS、公共 DNS、公司内网 DNS，也可以是代理工具内置的 DNS 客户端。

递归解析器负责替你继续问后面的服务器，并缓存结果。权威服务器负责回答某个域名真正的记录。

这件事对代理工具很重要：如果一个域名应该走代理出口，但 DNS 已经在本地被解析成了另一个结果，后续规则看到的就可能只是 IP，而不是域名。

## 为什么代理规则很关心 DNS

假设规则是：

```text
DOMAIN-SUFFIX,example.com,PROXY
```

如果代理客户端收到的是一个 HTTP 代理请求，它天然能看到域名，规则好匹配。

如果代理客户端收到的是 TUN 里的 IP 包，它一开始可能只看到：

```text
目标 IP：93.184.216.34
目标端口：443
```

这时它要按域名规则分流，就需要额外信息。常见办法有几种：

- DNS 由代理客户端接管，记录“哪个域名解析到了哪个 IP”；
- 使用 fake-ip，把域名映射到一个保留地址段，再用映射表还原域名；
- 做协议嗅探，从 TLS SNI 或 HTTP Host 里推断域名；
- 退化到 IP-CIDR、GeoIP 或兜底规则。

这些办法都有边界。比如 SNI 可能被加密趋势影响，IP 可能被多个域名共享，fake-ip 要求 DNS 和连接路径配套，否则就会出现“解析到了假地址但连接没被代理接管”的问题。

## DoH 和 DoT 解决的是隐私，不是万能加速

传统 DNS 通常是明文 UDP/TCP 53。DoT 是把 DNS 放进 TLS，常见端口是 853。DoH 是把 DNS 查询映射成 HTTPS 交换，走 443。

它们解决的核心问题是：减少 DNS 查询在本机到递归解析器之间被旁路观察或篡改的机会。

但它们不是万能加速按钮：

- 加密 DNS 仍然需要选择可信递归解析器；
- 远距离公共 DNS 可能带来更高延迟或不同 CDN 调度结果；
- 浏览器自己启用 DoH 可能绕开代理客户端的 DNS 设计；
- DoH 走 HTTPS，排障时更难从普通网络层日志里直接看出来。

所以在代理工具里，DoH/DoT 要和规则、入口接管、节点域名解析一起看。

## 代理节点域名也要解析

很多配置里，代理节点本身也是域名：

```text
proxy.example.net:443
```

这和你要访问的网站域名不是一回事。

访问目标网站的 DNS，决定“目标站点怎么连”。

代理节点的 DNS，决定“代理出口服务器怎么连”。

如果这两类 DNS 混在一起，可能出现循环或错误路径：为了连接代理节点，DNS 查询先走代理；但代理还没连上，于是整个链路卡住。

这也是为什么一些工具会单独提供 `proxy-server-nameserver`、`default-nameserver`、`nameserver-policy` 这类配置。它们不是装饰，而是在避免启动链路自相矛盾。

## IPv6 也是 DNS 问题的一部分

有些问题看起来是代理问题，实际是 IPv6 优先级问题。

域名同时返回 A 和 AAAA 时，客户端可能优先尝试 IPv6。如果本地 IPv6 路由不通、代理入口没有接管 IPv6、规则只覆盖 IPv4，表现就会很奇怪：

- 同一个域名有时能通有时不能；
- curl 指定 `-4` 能通，默认不通；
- 日志里只看到 IPv4，但应用实际先尝试了 IPv6；
- TUN 接管 IPv4 正常，IPv6 流量漏走。

不要简单地把 IPv6 关掉当作永久方案。更好的做法是确认入口、DNS、规则和出口是否一致支持 IPv6；如果暂时不用 IPv6，也要知道自己是在主动收窄路径。

## DNS 排障的顺序

遇到问题时，可以按这个顺序问：

```text
1. 应用实际问的是谁？
2. 代理客户端有没有接管 DNS？
3. 域名返回 A、AAAA、CNAME 还是失败？
4. 结果是否被缓存？
5. 目标域名 DNS 和代理节点 DNS 是否分开？
6. 规则命中基于域名、IP，还是 fake-ip 映射？
7. IPv6 是否改变了实际连接路径？
```

不要只看“能不能解析”。要看“谁解析、解析成什么、这个结果被谁使用、后续规则拿不拿得到域名上下文”。

## 一个容易记的判断

代理工具里的 DNS 不是附属功能，而是分流系统的一部分。

如果 DNS 不归代理工具管，代理工具可能只是在追赶一个已经发生过的决定。

如果 DNS 归代理工具管，但连接不进代理工具，fake-ip 和映射表可能失效。

如果目标 DNS 和节点 DNS 混在一起，启动链路可能自循环。

先把 DNS 路径画清楚，很多“玄学网络问题”会变成普通工程问题。

## 参考资料

- [RFC 1034：Domain Names - Concepts and Facilities](https://datatracker.ietf.org/doc/html/rfc1034)
- [RFC 1035：Domain Names - Implementation and Specification](https://datatracker.ietf.org/doc/html/rfc1035)
- [RFC 8484：DNS Queries over HTTPS](https://datatracker.ietf.org/doc/html/rfc8484)
- [RFC 7858：DNS over TLS](https://datatracker.ietf.org/doc/html/rfc7858)
- [mihomo DNS 配置文档](https://wiki.metacubex.one/en/config/dns/)
- [Surge Manual：DNS 与核心工作流](https://manual.nssurge.com/)
