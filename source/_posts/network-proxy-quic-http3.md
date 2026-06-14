---
title: "计网与代理 09：QUIC 和 HTTP/3，代理工具为什么要单独对待 UDP"
date: 2026-06-13 20:30:00
tags: [计网, QUIC, HTTP3, UDP, TLS, 代理工具]
categories: [技术笔记, 计网与代理]
---

第 06 篇的排障清单里提到过一句：UDP 和 QUIC 要单独看。这一篇展开讲——为什么一个基于 UDP 的协议，会让原本工作正常的代理工具突然“漏流量”或者变慢。

## QUIC 是什么：把可靠性搬到 UDP 上

传统 HTTPS 是 `HTTP over TLS over TCP`。QUIC 换了地基：

```text
HTTP/2  =  HTTP over TLS over TCP
HTTP/3  =  HTTP over QUIC over UDP
```

QUIC 跑在 UDP 上，但自己实现了 TCP 那套可靠传输（确认、重传、拥塞控制），并且把 TLS 1.3 直接内建进握手。它带来几个实打实的好处：

- **更快建连**：传输握手和加密握手合并，常见 1-RTT，复用时 0-RTT；
- **没有队头阻塞**：TCP 丢一个包会卡住整条连接上的所有流，QUIC 的多路复用流彼此独立，丢包只影响那一条流；
- **连接迁移**：用连接 ID 而不是四元组标识连接，从 Wi-Fi 切到蜂窝时连接不断；
- **几乎全程加密**：连很多传输层元数据都被加密，链路上能看到的信息比 TCP+TLS 更少。

## 浏览器怎么发现并切到 HTTP/3

客户端不会一上来就用 QUIC，而是先走 TCP，再通过 **Alt-Svc** 被告知“我也支持 h3”：

```http
Alt-Svc: h3=":443"; ma=86400
```

下次访问同一站点，客户端就会尝试 UDP/443 上的 QUIC，同时保留 TCP 作为回退（这是 Happy Eyeballs 思路在协议层的延伸）。DNS 的 HTTPS/SVCB 记录也能直接告知 h3 支持，省掉第一次的 TCP 探路。

## 问题来了：很多代理只接管 TCP

代理工具的麻烦在于：**QUIC 走 UDP，而不少代理链路对 UDP 的支持是缺位或受限的**。

- **入口没接管 UDP**：系统代理（见第 03 篇）通常只代理 TCP，UDP/QUIC 直接从物理网卡逃逸出去，造成和第 08 篇 IPv6 类似的“绕过规则”现象；
- **出站协议不支持 UDP relay**：链路中某一跳只转发 TCP，QUIC 包无处可去；
- **中间设备干脆丢弃 UDP/443**：QUIC 连不通，客户端**回退到 TCP**。功能不受影响，但你白白损失了 QUIC 的速度，还可能误以为“网络很慢”。

所以同一个站点，开不开 QUIC、代理接不接管 UDP，体验可能完全不同。

## 怎么判断 QUIC 在不在路径上

```bash
# curl 支持的话，强制用 HTTP/3 访问
curl --http3 -v https://example.com

# 强制回退到 HTTP/2，对比速度和成功率
curl --http2 -v https://example.com

# 看响应头里有没有 Alt-Svc 广播 h3
curl -sI https://example.com | grep -i alt-svc
```

浏览器里也可以在开发者工具的 Network 面板看 Protocol 列，`h3` 就是 QUIC，`h2` 是 TCP。

## 实用处理策略

- **要么让代理完整接管 UDP**：确认 TUN 模式开启、链路支持 UDP relay，让 QUIC 也走代理；
- **要么主动关掉 QUIC**：在浏览器禁用 HTTP/3，或在规则里拦掉 UDP/443，强制全部回退 TCP。当 QUIC 总是连不通、不断重试拖慢首屏时，这反而更稳定；
- **排障时先统一变量**：怀疑慢或丢流量，先 `--http2` 把协议钉死在 TCP，排除 QUIC 因素后再逐项往下查。

哪种好取决于场景：追求速度且链路支持 UDP，就接管它；链路对 UDP 不友好，关掉 QUIC 往往更省心。

## 一个常被忽略的点：抓包更难了

QUIC 几乎全程加密，传统基于 TCP/TLS 元数据的抓包能看到的东西大幅减少。想看 QUIC 内容，往往需要应用导出 TLS 密钥（`SSLKEYLOGFILE`）配合 Wireshark 解密——这部分留到第 10 篇抓包实战里讲。

## 一句话总结

QUIC 把可靠传输和 TLS 一起搬到了 UDP 上，换来更快建连、无队头阻塞和连接迁移。但代价是：只接管 TCP 的代理会让 QUIC 流量逃逸或被迫回退。遇到“慢、漏、时好时坏”，先看协议是 h3 还是 h2，再决定是把 UDP 一起接管，还是干脆关掉 QUIC。

## 参考资料

- [RFC 9000：QUIC 传输协议](https://datatracker.ietf.org/doc/html/rfc9000)
- [RFC 9114：HTTP/3](https://datatracker.ietf.org/doc/html/rfc9114)
- [RFC 7838：HTTP Alternative Services（Alt-Svc）](https://datatracker.ietf.org/doc/html/rfc7838)
- [MDN：HTTP/3](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Evolution_of_HTTP#http3_-_http_over_quic)
- [Cloudflare：QUIC 与 HTTP/3 入门](https://blog.cloudflare.com/the-road-to-quic/)
