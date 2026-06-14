---
title: "计网与代理 10：抓包实战，用 tcpdump、Wireshark 和 mitmproxy 看清每一层"
date: 2026-06-13 20:40:00
tags: [计网, 抓包, tcpdump, Wireshark, mitmproxy, 网络调试]
categories: [技术笔记, 计网与代理]
---

前面九篇讲的都是“应该发生什么”。这一篇讲怎么用工具看到“实际发生了什么”。第 06 篇的排障原则是“先看证据再改配置”，抓包就是拿证据最直接的方式。关键是选对层级的工具——看错层，再怎么抓也看不到想要的东西。

## 三类工具，对应三个层级

```text
tcpdump / Wireshark   ->  L3/L4 + TLS 元数据（看连接、握手、丢包，看不到加密内容）
mitmproxy             ->  L7 解密后的 HTTP（看 URL、header、body，但要做 MITM）
代理工具自带日志       ->  规则命中、策略选择、出站结果（看决策，不看字节）
```

选工具的判断很简单：

- 想知道**连没连上、握手成没成、有没有丢包重传**——tcpdump / Wireshark；
- 想知道**请求的 URL、header、body 到底是什么**——mitmproxy；
- 想知道**这条流量为什么走了直连/某个节点**——代理工具的日志（第 05、06 篇）。

## tcpdump：最轻量的一层

tcpdump 在命令行就能用，适合在服务器或没有图形界面的环境快速抓。

```bash
# 抓某主机、某端口的包，保存成文件
sudo tcpdump -i any host example.com and port 443 -w capture.pcap

# 实时看 DNS 查询（呼应第 02 篇）
sudo tcpdump -i any port 53

# 只看握手相关的 TCP 标志位
sudo tcpdump -i any 'tcp[tcpflags] & (tcp-syn|tcp-rst) != 0'
```

抓下来的 `.pcap` 可以直接丢进 Wireshark 做图形化分析。注意：tcpdump 看得到 TCP 握手、SNI（明文部分，见第 07 篇）、包大小和时序，但**看不到 TLS 加密后的 HTTP 内容**。

## Wireshark：把一次连接看明白

Wireshark 是图形化的分析利器。几个最常用的过滤表达式：

```text
ip.addr == 93.184.216.34        # 只看和某 IP 的往来
tcp.port == 443                 # 只看 443
tls.handshake.type == 1         # 只看 ClientHello（能看到 SNI）
dns                             # 只看 DNS
quic                            # 只看 QUIC（第 09 篇）
tcp.analysis.retransmission     # 只看重传，定位丢包
```

排查流程通常是：先看 DNS 解出了什么地址（呼应第 08 篇 IPv6），再看 TCP 三次握手成没成，再看 TLS 握手停在哪一步（第 07 篇），最后看有没有大量重传或 RST。每一层都能对上前面文章里的概念。

### 想解密 TLS 内容怎么办

Wireshark 本身不做 MITM，但可以用应用导出的会话密钥来解密：

```bash
export SSLKEYLOGFILE=$HOME/tls-keys.log
# 启动浏览器或 curl，让它把密钥写进这个文件
# 在 Wireshark 里指定该文件，即可解密自己发起的 TLS / QUIC 流量
```

这只对“你自己掌控、能拿到密钥的客户端”有效，不是破解别人的加密。

## mitmproxy：看 HTTPS 里的 HTTP

要直接看请求的 URL、header、body，需要解密——这就是第 04 篇讲的 MITM。mitmproxy 是常用工具：

```bash
# 启动交互式界面，监听 8080
mitmproxy -p 8080

# 客户端把流量指向这个代理，并信任 mitmproxy 的 CA 证书
# 之后就能在界面里看到完整的 HTTP 请求和响应
```

它能做的远不止看：拦截、改写、重放、mock、脚本化处理都行，调试接口非常顺手。

## 抓包看得到什么，看不到什么

把第 04、07 篇的结论落到工具上，一张表就清楚了：

```text
不解密（tcpdump / Wireshark 直接抓）：
  看得到：目标 IP、端口、SNI 域名、握手过程、包大小、时序、丢包重传
  看不到：URL path、请求/响应 header、body、业务错误

解密（mitmproxy，或导出密钥喂给 Wireshark）：
  看得到：完整的 HTTP 内容
  代价：客户端要信任额外的 CA，信任边界被改变
```

## 安全和隐私边界

抓包是把双刃刀，几条纪律要记住：

- **只抓自己的设备和流量**，不要去解密别人的通信；
- mitmproxy 的 CA 一旦被信任，所有走它的 HTTPS 都能被解密——**调试完就移除信任**，别让它常驻；
- 抓包文件里常含 token、cookie、个人信息，**分享前务必脱敏**，用完即删；
- 敏感目标（银行、支付、公司内网）默认不要解密。

调试能力越强，越要清楚什么时候不该开——这和第 04 篇对 MITM 的告诫是同一句话。

## 一句话总结

抓包的第一步不是“抓”，是“选层”：看连接和握手用 tcpdump / Wireshark，看 HTTP 内容用 mitmproxy，看分流决策看代理日志。不解密只能看到元数据，解密就意味着改变信任边界。先按层级拿到对的证据，再回头改配置，排障才有可解释性。这门课到这里，从一次请求的路径一路走到了能亲手验证每一层。

## 参考资料

- [tcpdump 官方手册](https://www.tcpdump.org/manpages/tcpdump.1.html)
- [Wireshark 用户指南](https://www.wireshark.org/docs/wsug_html_chunked/)
- [Wireshark：用 SSLKEYLOGFILE 解密 TLS](https://wiki.wireshark.org/TLS#using-the-pre-master-secret)
- [mitmproxy 官方文档](https://docs.mitmproxy.org/stable/)
- [MDN：HTTP 概览](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview)
