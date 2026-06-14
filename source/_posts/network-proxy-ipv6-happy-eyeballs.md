---
title: "计网与代理 08：IPv6、双栈与 Happy Eyeballs，为什么 IPv6 会绕过你的规则"
date: 2026-06-13 20:20:00
tags: [计网, IPv6, 双栈, Happy Eyeballs, DNS, 分流]
categories: [技术笔记, 计网与代理]
---

很多人遇到过一个怪现象：代理明明开着，规则也写了，某个网站却像没走代理一样直连，甚至时通时不通。排查半天，根因常常是同一个——**IPv6**。这一篇接着第 02 篇（DNS）和第 05 篇（规则引擎）讲，把双栈这件事说清楚。

## 双栈：一台机器同时有两套地址

今天的设备大多是“双栈”的：同时拥有 IPv4 和 IPv6 地址，两套协议并行可用。

- **IPv4**：32 位，形如 `93.184.216.34`，地址早已耗尽，靠 NAT 续命；
- **IPv6**：128 位，形如 `2606:2800:220:1:248:1893:25c8:1946`，地址极大，常常不需要 NAT。

域名解析也因此分成两种记录：

```text
A    记录 -> IPv4 地址
AAAA 记录 -> IPv6 地址
```

一个域名可以同时有 A 和 AAAA。客户端拿到两种地址后，该用哪个、先试哪个，就是问题的起点。

## Happy Eyeballs：两边一起试，谁快用谁

如果客户端傻等 IPv6 超时再回退 IPv4，体验会很差。**Happy Eyeballs（RFC 8305）**的做法是：

```text
同时发起 A 和 AAAA 查询
通常略微偏向 IPv6 先发起连接
给 IPv6 一个很短的时间窗（几十到几百毫秒）
谁先握手成功就用谁，另一条放弃
```

好处是用户几乎无感地用上更快的那条路。但对代理工具来说，这种“两条腿同时跑”的行为正是分流出问题的温床。

## 为什么 IPv6 会“逃逸”出代理

代理工具接管流量时（见第 03 篇），IPv4 和 IPv6 是两套独立的栈，很容易出现“只接管了一半”：

- **规则只写了 IPv4**：规则集里是 IPv4 网段，IPv6 流量没命中任何规则，落到直连；
- **fake-ip 只覆盖 IPv4**：很多 fake-ip 方案默认只对 A 记录发假 IP，AAAA 照常返回真实 IPv6，于是 IPv6 直接绕过代理出去；
- **TUN 没接管 IPv6**：虚拟网卡只配了 IPv4 路由，IPv6 路由仍指向物理网卡；
- **系统代理对 IPv6 失效**：某些应用走 IPv6 时不读系统代理设置。

结果就是：IPv4 老老实实走代理，IPv6 偷偷直连。表现可能是“偶尔能访问、偶尔暴露真实出口、规则像没生效”。

## 怎么判断是不是 IPv6 在捣乱

```bash
# 看域名到底有没有 AAAA 记录
dig AAAA example.com
nslookup -type=AAAA example.com

# 看本机实际出口（v4 / v6 分别看）
curl -4 https://ifconfig.co
curl -6 https://ifconfig.co

# 强制只用 v4 访问，对比行为差异
curl -4 -v https://example.com
```

如果 `curl -6` 能直连而 `curl -4` 走了代理，基本就锁定是 IPv6 逃逸。

## 三种收口思路

按“一次只改一处”（第 06 篇的原则）来选：

- **让代理同时接管 IPv6**：给 TUN 配上 IPv6 路由、给规则补 IPv6 网段、让 fake-ip 也覆盖 AAAA。这是最彻底的做法；
- **在 DNS 层关掉 AAAA**：让解析只返回 A 记录，从源头消灭 IPv6 路径。简单有效，代价是放弃 IPv6 的速度优势；
- **系统层禁用 IPv6**：最粗暴，会影响所有应用，只建议临时排查时用。

没有绝对正确的选择，取决于你是想“用上 IPv6”还是“保证分流可控”。

## 顺带说说 NAT64/DNS64

纯 IPv6 网络访问只有 IPv4 的服务时，会用到 NAT64/DNS64：DNS64 给只有 A 记录的域名合成一个 AAAA，把它映射进一个特殊前缀，再由 NAT64 网关转换回 IPv4。这在某些移动网络和云环境里存在，调试时如果看到莫名其妙的 AAAA，要想到这一层。

## 一句话总结

双栈意味着同一个域名有两条出路，Happy Eyeballs 会两条一起试。代理工具如果只接管了 IPv4，IPv6 就会安静地绕过规则直连。排查“代理像没生效”时，先 `dig AAAA` 看有没有 IPv6，再决定是补齐 IPv6 接管，还是干脆在 DNS 层关掉 AAAA。

## 参考资料

- [RFC 8305：Happy Eyeballs Version 2](https://datatracker.ietf.org/doc/html/rfc8305)
- [RFC 4291：IPv6 Addressing Architecture](https://datatracker.ietf.org/doc/html/rfc4291)
- [RFC 6147：DNS64](https://datatracker.ietf.org/doc/html/rfc6147)
- [MDN：IPv6](https://developer.mozilla.org/en-US/docs/Glossary/IPv6)
- [APNIC：Happy Eyeballs 解析](https://blog.apnic.net/2019/04/29/happy-eyeballs-and-the-internet/)
