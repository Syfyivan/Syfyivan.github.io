---
title: "计网与代理 07：TLS 与 SNI，握手阶段到底发生了什么"
date: 2026-06-13 20:10:00
tags: [计网, TLS, SNI, ECH, HTTPS, 证书]
categories: [技术笔记, 计网与代理]
---

第 01 篇把一次请求拆成了 DNS、TCP、TLS、HTTP 几段，第 04 篇讲了 MITM 为什么能解密 HTTPS。这一篇把中间那段 TLS 握手单独放大，因为很多“代理设了却连不上”的问题，根因就卡在握手这一步。

## TLS 解决的是三件事

TLS 不只是“加密”，它在一次握手里同时谈妥三件事：

- **身份**：服务器是不是它声称的那个域名（靠证书链验证）；
- **密钥**：双方协商出一把只有彼此知道的对称密钥；
- **参数**：用哪个 TLS 版本、哪套加密算法（cipher suite）。

任何一件谈不拢，握手就失败，连接根本到不了 HTTP 那一层。所以排障时要分清：是握手没成，还是握手成了但业务报错。

## 一次 TLS 1.3 握手的顺序

```text
客户端 -> 服务器：ClientHello
  （支持的版本、cipher、随机数、SNI、ALPN、key_share）
服务器 -> 客户端：ServerHello
  （选定参数、证书、key_share、Finished）
客户端 -> 服务器：Finished
  （验证证书链、算出密钥）
之后：在加密通道里跑 HTTP
```

TLS 1.3 把握手压到 1-RTT，比 1.2 少一个来回。复用会话时还能 0-RTT，但 0-RTT 数据有重放风险，通常只用于幂等请求。

## SNI：握手里那个“明文域名”

ClientHello 里有一个字段叫 **SNI（Server Name Indication）**，告诉服务器“我要访问哪个域名”。一台服务器上常托管很多站点，服务器靠 SNI 才知道该发哪张证书。

关键点是：**经典 TLS 里 SNI 是明文的**。也就是说，即使内容全程加密，链路上的设备仍然能看到你访问的域名。

这对代理有两层影响：

- 中间设备可以基于 SNI 做识别、记录甚至阻断，哪怕看不到具体内容；
- 代理工具的规则引擎（见第 05 篇）也常拿 SNI 来做域名分流，而不必解密流量。

**ECH（Encrypted Client Hello）** 就是来加密 SNI 的：把真实 SNI 装进一个加密的 ClientHello 里，对外只暴露一个公共名字。它能减少域名泄露，但部署还不普遍，且依赖 DNS 里的 HTTPS/SVCB 记录下发公钥。

## 证书校验：握手失败最常见的源头

客户端验证服务器证书时会检查一串条件，任何一条不过都会断在握手：

- **域名匹配**：证书的 SAN 里要包含你访问的域名（CN 已不再被信任）；
- **有效期**：证书没过期、也没还没生效——本机时间不对会直接导致“证书无效”；
- **信任链完整**：从服务器证书一路能链到本机信任的根 CA，**中间证书缺失**是服务端最常见的配置错误；
- **没被吊销**：通过 CRL 或 OCSP 检查。

所以遇到“TLS handshake failed / certificate error”，先按这几条排：本机时间、域名、证书链、根信任。

## 代理场景里，TLS 可能出现两次

不开 MITM 时，代理对 TLS 通常是“隧道转发”，只看得到 SNI 和元数据，看不到内容（这正是第 04 篇 CONNECT 那段的结论）。

开了 MITM 调试时，TLS 实际上发生了两次：

```text
客户端 <-TLS-> 本地代理（代理用自签 CA 为目标域名签证书）
本地代理 <-TLS-> 真实服务器
```

代理在中间解密再重新加密，于是能看到 HTTP 内容。代价是：**客户端的信任边界从“只信目标站点”扩大成“也信代理的 CA”**。这也是为什么 MITM 只该在自己设备、只对需要调试的域名临时开。

## 握手为什么会卡住：几个真实原因

- **本机时间错误**：证书被判过期或未生效，最容易忽略；
- **中间证书缺失**：浏览器有时能补全，curl、移动端、老客户端则直接失败；
- **SNI 被干扰**：明文 SNI 被链路设备识别后重置连接，表现为握手刚开始就断；
- **TLS 版本或 cipher 不兼容**：太老的客户端连只支持 TLS 1.3 的服务器；
- **ALPN 协商不一致**：客户端想要 h2/h3，服务器只给 http/1.1，应用层行为随之变化。

## 怎么看握手发生了什么

```bash
# 看完整握手、证书链、协商出的版本和 cipher
openssl s_client -connect example.com:443 -servername example.com

# curl 看 TLS 细节
curl -v https://example.com

# 只验证证书链是否完整
openssl s_client -connect example.com:443 -showcerts
```

`-servername` 就是手动指定 SNI。对比“带 SNI”和“不带 SNI”的结果，常能定位到底是域名层面还是网络层面的问题。

## 一句话总结

TLS 握手在一个来回里谈妥身份、密钥和参数；SNI 在经典 TLS 里是明文，所以域名会泄露、也能被用来分流；证书校验失败八成是时间、证书链或信任根的问题；开 MITM 等于多了一段 TLS，也多了一份信任。把握手看懂，HTTPS 的“连不上”就不再是黑盒。

## 参考资料

- [RFC 8446：TLS 1.3](https://datatracker.ietf.org/doc/html/rfc8446)
- [RFC 6066：TLS Extensions（含 SNI）](https://datatracker.ietf.org/doc/html/rfc6066)
- [MDN：TLS](https://developer.mozilla.org/en-US/docs/Web/Security/Transport_Layer_Security)
- [Cloudflare：Encrypted Client Hello (ECH)](https://blog.cloudflare.com/announcing-encrypted-client-hello/)
- [OpenSSL：s_client 手册](https://www.openssl.org/docs/man3.0/man1/openssl-s_client.html)
