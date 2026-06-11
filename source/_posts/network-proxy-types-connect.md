---
title: "计网与代理 04：正向代理、反向代理和 CONNECT 隧道"
date: 2026-06-11 20:40:00
tags: [计网, 代理, HTTP, CONNECT, HTTPS, MITM]
categories: [技术笔记, 计网与代理]
---

“代理”这个词很容易混乱，因为正向代理、反向代理、HTTP 代理、SOCKS 代理、透明代理、MITM 代理都叫代理。

最简单的拆法是先问：它代表谁？

## 正向代理：代表客户端

正向代理站在客户端一侧：

```text
客户端
  -> 正向代理
  -> 目标服务器
```

目标服务器看到的直接连接来源是代理，而不是原始客户端。企业网络出口、开发者本机代理、浏览器代理设置，都属于这个方向。

正向代理常见用途包括：

- 统一出口；
- 访问控制；
- 日志审计；
- 缓存；
- 开发调试；
- 按规则选择不同出站路径。

很多个人代理工具，本质上就是在本机或网关上提供正向代理能力。

## 反向代理：代表服务器

反向代理站在服务端一侧：

```text
客户端
  -> 反向代理
  -> 后端服务
```

客户端访问的是反向代理，反向代理再把请求转给后端服务。Nginx、Envoy、CDN、负载均衡、API Gateway 都经常扮演这个角色。

反向代理常见用途包括：

- 隐藏后端服务地址；
- TLS 终止；
- 负载均衡；
- 缓存；
- 压缩；
- 鉴权；
- WAF 和限流；
- 灰度发布。

正向代理解决的是“客户端怎么出去”。反向代理解决的是“服务端怎么接进来”。

## HTTP 代理：能理解 HTTP 请求

HTTP 代理收到的是 HTTP 语义。

访问明文 HTTP 时，客户端可以直接把完整 URL 发给代理：

```http
GET http://example.com/articles/1 HTTP/1.1
Host: example.com
```

代理知道你要访问哪个 URL，可以缓存、改 header、记录日志、转发请求。

但 HTTPS 不一样。HTTPS 里的 HTTP 内容被 TLS 加密了。普通 HTTP 代理不能直接看到完整 URL、header 和 body。

## CONNECT：先让代理帮你打洞

HTTPS 通过 HTTP 代理时，常见方式是 CONNECT。

流程大概是：

```text
客户端 -> 代理：CONNECT example.com:443
代理 -> 目标：建立 TCP 连接
代理 -> 客户端：200 Connection Established
客户端 <-> 目标：在隧道里进行 TLS 握手和 HTTP 通信
```

CONNECT 的关键点是：代理建立隧道后，通常只是转发字节流。它不理解隧道里面的 HTTPS 内容。

所以不开 MITM 时，代理可以知道：

- 你要连接的主机和端口；
- 连接建立、关闭、耗时；
- 大致流量大小；
- 可能看到 TLS 握手里的部分元数据。

它通常不知道：

- 完整 URL path；
- 请求 header；
- 请求 body；
- 响应 body；
- 具体业务错误。

这也是为什么 HTTPS 调试需要额外的 MITM 能力。

## SOCKS：更通用，但不懂 HTTP

SOCKS 代理比 HTTP 代理更低一层。客户端告诉 SOCKS 服务器目标地址和端口，SOCKS 帮它建立连接并转发数据。

SOCKS 不关心里面是不是 HTTP、SSH、数据库协议或别的 TCP 流。SOCKS5 还可以支持 UDP associate。

这带来一个取舍：

- 更通用；
- 对应用层语义知道更少；
- 不适合直接做 HTTP header rewrite 这类操作；
- 很适合作为“把连接转出去”的基础协议。

## MITM：调试能力，也是信任边界变化

MITM 是 man-in-the-middle。开发者代理工具里的 MITM 通常是为了调试自己设备上的 HTTPS 流量。

它的做法是：

```text
客户端
  -> 信任本地代理生成的 CA
  -> 本地代理为目标域名动态签发证书
  -> 本地代理解密请求
  -> 本地代理再和真实目标建立 TLS
```

这样代理就能看到 HTTPS 里的 HTTP 内容，也就能做 rewrite、mock、脚本、抓包。

但这件事改变了 TLS 的原始信任模型。正常情况下，客户端只信任目标站点证书链；开启 MITM 后，客户端也信任本地代理替目标站点签发的证书。

所以 MITM 应该遵守几个原则：

- 只在自己掌控的设备上开；
- 只对需要调试的域名开；
- 不要随手覆盖银行、支付、账号、公司内网等敏感目标；
- 调试结束后关闭，并清理不再需要的证书信任；
- 不要把 MITM 当作普通代理的默认状态。

## Forwarded 和 X-Forwarded

反向代理和负载均衡常会把客户端信息写进 header。

常见有：

```http
Forwarded: for=192.0.2.60; proto=https; host=example.com
X-Forwarded-For: 192.0.2.60
X-Forwarded-Host: example.com
X-Forwarded-Proto: https
```

这些 header 用来把代理前的信息传给后端服务。但要注意：header 本身可以被客户端伪造。服务端只能信任自己边界内的代理追加或覆盖后的值。

这和个人代理工具不是一个场景，但理解它能帮助你区分“代理代表客户端”与“代理代表服务器”。

## 一句话区分

正向代理：客户端知道代理，目标服务不一定知道真实客户端。

反向代理：客户端以为自己访问的是服务，后端服务藏在代理后面。

CONNECT：让 HTTP 代理为 HTTPS 建一条字节隧道。

SOCKS：更通用的连接代理，不理解 HTTP 语义。

MITM：为了调试解密 HTTPS，但会改变信任边界。

把这几件事分开，后面看 Surge、mihomo、sing-box、v2rayN、Nginx、CDN 时就不会混在一起。

## 参考资料

- [MDN：Proxy servers and tunneling](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Proxy_servers_and_tunneling)
- [MDN：CONNECT request method](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/CONNECT)
- [RFC 9110：HTTP Semantics](https://datatracker.ietf.org/doc/html/rfc9110)
- [RFC 8446：TLS 1.3](https://datatracker.ietf.org/doc/html/rfc8446)
- [Surge Manual：HTTP Processing](https://manual.nssurge.com/)
