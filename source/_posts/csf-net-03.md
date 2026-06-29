---
title: "《计算机基本功路线图 · 计算机网络》第03讲 · IP 与端口：找到哪台机器、机器上的哪个程序"
date: 2026-07-05 12:00:00
tags: [计算机基础, 计算机网络, 零基础, 编程入门, 课程]
categories: [技术笔记]
toc: true
visibility: public
---

<style>
.csf-b{display:inline-block;font-size:12px;font-weight:700;padding:1px 8px;border-radius:999px;vertical-align:middle;margin-left:6px;line-height:1.7;white-space:nowrap}
.csf-core{color:#fff;background:#3f5d7e}
.csf-key{color:#34506e;background:rgba(63,93,126,.12);border:1px solid rgba(63,93,126,.32)}
.csf-skim{color:#7a8390;background:rgba(122,131,144,.1);border:1px solid rgba(122,131,144,.25)}
.csf-skip{color:#69727d;background:rgba(105,114,125,.12);border:1px solid rgba(105,114,125,.25)}
.csf-note,.csf-why,.csf-key-note,.csf-card,.csf-legend{margin:18px 0;padding:14px 16px;line-height:1.78;border-radius:8px}
.csf-note{background:rgba(63,93,126,.08);border-left:4px solid #3f5d7e}
.csf-why{background:var(--wash);border-left:4px solid var(--line);color:var(--muted)}
.csf-key-note{background:rgba(63,93,126,.1);border-left:4px solid #3f5d7e}
.csf-card{background:rgba(63,93,126,.07);border:1px solid rgba(63,93,126,.34);border-radius:10px}
.csf-legend{background:var(--wash);font-size:14px;line-height:2}
.csf-fold{margin:18px 0;padding:4px 16px;border:1px solid var(--line);border-radius:8px;background:var(--wash)}
.csf-fold summary{cursor:pointer;font-weight:700;padding:10px 0}
.csf-fold[open]{padding-bottom:14px}
html[data-user-color-scheme="dark"] .csf-key{color:#8fb6dd;background:rgba(63,93,126,.22);border-color:rgba(63,93,126,.5)}
html[data-user-color-scheme="dark"] .csf-note{background:rgba(63,93,126,.2)}
html[data-user-color-scheme="dark"] .csf-key-note{background:rgba(63,93,126,.22)}
html[data-user-color-scheme="dark"] .csf-card{background:rgba(63,93,126,.16)}
</style>

<div class="csf-key-note">上一讲我们把域名翻译成了一串 IP 地址。这一讲要回答两个更具体的问题：这串 IP 到底指的是<strong>哪台机器</strong>？找到机器之后，又怎么找到机器上<strong>正在干活的那个程序</strong>？答案就是这一讲的主角——<strong>IP</strong> 负责找机器，<strong>端口</strong> 负责找程序。一句话记住它：<strong>IP 是楼号，端口是房间号</strong>。</div>

## 🎯 这一讲你会学到什么

- IP 地址是什么，IPv4 和 IPv6 长什么样、为什么会有两种。
- 「公网 IP」和「内网 IP」的区别——为什么你查到的 IP 常常有两个，而且对不上。
- NAT 是怎么让一屋子设备共用一个公网出口的。
- 端口号是什么，它**不是**机箱后面的物理插口；80 / 443 / 22 这些常见端口分别是谁在用。
- 「IP + 端口」合起来叫 socket（套接字），它精确锁定了「哪台机器上的哪个程序」。
- 亲手查出自己电脑的内网 IP 和公网 IP，并用 `ping` 看一个域名解析到哪、往返多久。

<div class="csf-note">这一讲全程都能在你自己的电脑上敲命令验证。看到 ``` 代码块就动手敲一遍，别只用眼睛扫过去——网络这门课，<strong>看会了等于没会，敲过一遍才算数</strong>。命令本身很短，别怕。</div>

## 🛠 跟我做

### 一、IP 地址：先认清它长什么样 <span class="csf-b csf-core">必读</span>

IP 地址（Internet Protocol address）是每台联网设备在网络里的「门牌号」。数据要送到你这台机器，靠的就是它。现在世界上同时存在两套门牌系统：

- **IPv4**：长这样 `192.168.1.7`，四段数字，每段 0~255，用点隔开。它一共能表示约 43 亿个地址。听起来很多，但全球设备早就远不止 43 亿，所以**不够用了**。
- **IPv6**：长这样 `2408:8214:7a13:b100:1c2e:...`，八段、用冒号隔开。你可能注意到里面有 `a`、`b` 这样的字母，别慌，这是正常的——它用的是「十六进制」这种数字写法。十六进制就是除了我们熟悉的 0~9，还会接着用 `a`、`b`、`c`、`d`、`e`、`f` 这 6 个字母继续往上数（相当于 10、11、12、13、14、15）的一种计数方式。你不用去记它怎么换算，只要知道「地址里冒出字母是正常的，那只是另一种写数字的方式」就够了。IPv6 的地址数量大到几乎用不完（2 的 128 次方）。

<div class="csf-note"><strong>先猜后做：</strong> 你觉得 <code>256.1.1.1</code> 是一个合法的 IPv4 地址吗？先在心里给个答案，理由是什么？（提示：回看上面那句「每段 0~255」。）答案在本讲末尾的「翻车现场」里揭晓。</div>

<details class="csf-fold"><summary>为什么一段最大是 255？<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
IPv4 地址在计算机里其实是一个 32 位的二进制数，被切成 4 段，每段 8 个二进制位（也就是 1 个字节）。8 个二进制位能表示的最大值是 <code>11111111</code>，换算成十进制正好是 255。所以每段的范围是 0~255，不是人为规定的「好看」，而是二进制位数决定的硬上限。这也是为什么 <code>256</code> 越界——它需要第 9 位才装得下。</details>

### 二、查出你自己的内网 IP <span class="csf-b csf-key">重点</span>

打开终端（Mac 叫「终端 / Terminal」，Windows 叫「命令提示符 / PowerShell」），根据你的系统敲对应命令：

```bash
# Mac / Linux
ifconfig
# 如果嫌输出太多，Mac 上可以只看 Wi-Fi 网卡：
ipconfig getifaddr en0
```

```powershell
# Windows
ipconfig
```

输出会有一大堆，你要找的是 **IPv4 地址** 那一行。多半长这样：

```text
inet 192.168.1.7   （Mac/Linux 的 ifconfig 里）
IPv4 地址 . . . . : 192.168.1.7   （Windows 的 ipconfig 里）
```

记下这个数字。它大概率是 `192.168.x.x`、`10.x.x.x` 或 `172.16~31.x.x` 开头的——**这就是你的内网 IP**。

<div class="csf-note"><strong>为什么是这几个开头？</strong> 这三段地址是国际上专门划出来、<strong>只在局域网内部使用</strong>的「私有地址」。你家路由器后面的所有设备（手机、电脑、电视）都从这个范围里分到一个号。它们出了你家这扇门就不认了——所以叫「内网 IP」。</div>

### 三、查出你的公网 IP，并对比两者 <span class="csf-b csf-key">重点</span>

现在打开浏览器，搜索框里输入「**我的 IP**」（或英文 `what is my ip`），第一条结果通常就会直接显示一串地址。把它和你刚才记下的内网 IP 对比一下。

<div class="csf-note"><strong>先猜后做：</strong> 在你看到浏览器给的那串数字之前——你觉得它会和 <code>ifconfig</code> 查到的 <strong>一样</strong> 还是 <strong>不一样</strong>？先猜，再看。</div>

答案是：**几乎一定不一样**。

- `ifconfig` 查到的是你电脑在「家里这个小网」里的门牌号（内网 IP），比如 `192.168.1.7`。
- 浏览器查到的是整个互联网看到的、你家**对外的那个出口**的门牌号（公网 IP），比如 `113.x.x.x`。

更有意思的是：你拿手机连同一个 Wi-Fi，再搜一次「我的 IP」，会发现**手机和电脑的公网 IP 是同一个**——但它们的内网 IP 不同。这就引出了下一个概念。

### 四、NAT：一群设备如何共用一个出口 <span class="csf-b csf-core">必读</span>

你家可能有十几台联网设备，但宽带运营商通常只给你**一个**公网 IP。怎么让十几台设备共享这一个出口、还不会把回来的数据送错？靠的是路由器里的 **NAT**（Network Address Translation，网络地址转换）。

打个比方：

- 你家是一栋楼，**公网 IP 是这栋楼临街的唯一门牌号**。
- 楼里每个房间（每台设备）有自己的**内部房间号**（内网 IP）。
- 楼下有个**前台**（路由器 / NAT）。你要寄信出去，前台帮你把「发件人」改写成楼的门牌号再寄出；对方回信寄到楼门牌号，前台再根据自己记的小本本，把信送回正确的房间。

所以对外面的世界来说，看到的永远只是「这栋楼」，看不到楼里具体哪个房间。这样一来，外面的人就没法绕过前台、直接敲到你某台设备的门——也就顺带起到了一点保护作用：既省下了宝贵的公网地址，又让你家里的设备不会直接暴露在互联网上。

<details class="csf-fold"><summary>前台那本「小本本」记的是什么？<span class="csf-b csf-skip">选学</span></summary>
NAT 之所以能把回信送回正确的房间，关键在于它会记一张映射表，里面同时记了内网 IP、内网端口、和它对外用的端口。正是「端口」让一个公网 IP 能区分同时上网的几十台设备——这也是为什么端口这么重要，下面马上讲。现在你只要先有个印象：<strong>NAT 靠 IP + 端口的组合来记账</strong>。</details>

### 五、端口：找到机器上「哪个程序」 <span class="csf-b csf-core">必读</span>

找到机器只是第一步。一台服务器上同时跑着很多程序：网站服务、邮件服务、远程登录服务……数据到了这台机器，到底该交给哪个程序处理？**靠端口号。**

<div class="csf-note"><strong>端口不是机箱上的物理插口！</strong> 它不是你插网线、插 USB 的那个孔。端口是一个 <strong>纯粹的数字编号</strong>（范围 0~65535），是操作系统用来区分「数据该交给哪个程序」的逻辑标签。你看不见也摸不着它。回到那个比方：IP 是楼号，端口是房间号——房间号当然不是墙上凿的洞，只是个编号。</div>

有些端口号是大家约定俗成、固定给某类服务用的，叫「常见端口」：

<div class="csf-legend"><strong>80</strong> → HTTP 网页（不加密）<br><strong>443</strong> → HTTPS 网页（加密，今天绝大多数网站用它）<br><strong>22</strong> → SSH 远程登录服务器<br><strong>53</strong> → DNS（还记得上一讲吗？域名解析走的就是它）</div>

所以当你访问 `https://example.com` 时，浏览器其实是去找「`example.com` 解析出的那个 IP」上的「**443 号房间**」。端口号通常被网址省略了（因为 https 默认就是 443），但它一直都在。

### 六、Socket：IP + 端口，精确锁定一个程序 <span class="csf-b csf-key">重点</span>

把「IP」和「端口」用冒号拼在一起，就唯一确定了「**哪台机器上的哪个程序**」。这个组合叫 **socket（套接字）**，写法是 `IP:端口`，例如：

```text
93.184.216.34:443    ← 某台机器（93.184.216.34）上的网页加密服务（443）
192.168.1.7:8080     ← 你局域网里那台电脑（192.168.1.7）上、8080 端口的程序
```

一次网络通信，本质上就是**两个 socket 之间在对话**：你电脑上的某个端口，对接对方机器上的某个端口。后面几讲讲的 TCP 连接，建立的就是这样一条「socket 到 socket」的通道。

### 七、ping：看域名解析到哪、往返多久 <span class="csf-b csf-key">重点</span>

最后来个综合动手练。`ping` 命令会向目标发一个小包、等它回弹，借此告诉你两件事：目标域名**解析到了哪个 IP**，以及一来一回**花了多少毫秒**（往返延迟，叫 RTT）。

```bash
ping example.com
```

<div class="csf-note"><strong>先猜后做：</strong> 运行之前先猜：你觉得往返延迟会是几毫秒级、几十毫秒级，还是几百毫秒级？访问国外网站和访问国内网站，哪个会更慢？</div>

你会看到类似这样的输出（数字因人而异）：

```text
PING example.com (93.184.216.34): 56 data bytes
64 bytes from 93.184.216.34: icmp_seq=0 ttl=56 time=152.3 ms
64 bytes from 93.184.216.34: icmp_seq=1 ttl=56 time=149.8 ms
64 bytes from 93.184.216.34: icmp_seq=2 ttl=56 time=151.1 ms
```

读这三行：

- 括号里的 `93.184.216.34` 就是 `example.com` 这次**解析到的 IP**（这正是上一讲 DNS 干的活，你现在亲眼看到了结果）。
- `time=152.3 ms` 是这一个包**往返**用的时间。物理距离越远、链路越绕，这个数越大。
- 同一行里还有 `icmp_seq=0`（这是第几个包的编号）、`ttl=56`、`64 bytes` 这几个值，这一讲先不用管它们，也不是你哪里弄错了——你只需要盯住 **IP** 和 **time** 这两个就够了，其余的以后用到再说。

Mac/Linux 上 `ping` 会一直发下去，按 `Ctrl + C` 停止。Windows 默认发 4 个就停。

```powershell
# Windows 想多发几个或一直发：
ping -t example.com
```

<div class="csf-note">如果 ping 卡着不动、全是超时（<code>Request timeout</code>），<strong>先别慌着断定「我网断了」</strong>。原因很可能不在你——很多服务器为了安全，<strong>故意不回应 ping</strong>。判断自己网通不通，换个一定会回应的目标更靠谱，比如 <code>ping 223.5.5.5</code>（阿里公共 DNS）或 <code>ping baidu.com</code>。</div>

## 💡 自己复述一遍

合上屏幕，用一句话把这一讲讲给一个完全没学过的人听。比如：

> 「**IP 是找哪台机器的楼号，端口是找机器上哪个程序的房间号；我家所有设备共用一个公网 IP 出口，靠路由器的 NAT 来分发。**」

能顺下来，这一讲的骨架你就立住了。

## 🔧 翻车现场

**翻车一：把内网 IP 当公网 IP 去对外用。** <span class="csf-b csf-key">重点</span><br>
最典型的场景：你写了个小服务跑在自己电脑上，`ifconfig` 看到 `192.168.1.7`，就把这个地址发给外地的朋友让他访问——结果他怎么都连不上。原因是 `192.168.x.x` 是**内网地址，只在你家局域网里有效**，出了你家门它就不存在了。外面的人要访问你，得通过你的**公网 IP**，而且通常还要在路由器上做「端口转发」配置。一句话：**对外暴露的服务，地址必须是公网 IP，不是内网 IP。**

**翻车二：以为端口是机箱上的物理插口。** <span class="csf-b csf-key">重点</span><br>
端口是个**数字编号**（0~65535），是软件层面的概念，跟你插网线、插 USB 的孔毫无关系。听到「8080 端口被占用了」，意思是「8080 这个编号已经被某个程序登记使用了」，不是「机箱上某个孔坏了」。

**翻车三：一 ping 不通就断定「网断了」。** <span class="csf-b csf-core">必读</span><br>
`ping` 用的是一种叫 ICMP 的协议，而**很多服务器出于安全考虑，故意屏蔽了 ICMP**——它网站好好的，就是不理你的 ping。所以 ping 不通**只能说明「这个目标不回 ping」，不能直接推出「我的网坏了」**。要判断本机网络，换个一定回应的目标，或者直接用浏览器打开一个网页试试。

<div class="csf-note"><strong>开头那道题揭晓：</strong> <code>256.1.1.1</code> 是 <strong>不合法</strong>的 IPv4 地址。因为每段最多到 255（这是 8 个二进制位的上限），256 已经越界。</div>

## ✅ 自检三问

1. 用「楼号 / 房间号」的比方，说清 IP 和端口各自负责找什么。
2. 你电脑的内网 IP 和公网 IP 为什么不一样？是哪个东西在中间做转换？
3. `ping example.com` 不通，能不能直接得出「我的网络断了」？为什么？

三问都能脱口而出，就过关了。卡在哪一问，就回去重看对应那节。

## 🚀 挑战

留两个**自己动手**的小任务，别让 AI 替你跑——它看不到你此刻的网络：

1. 用手机连上你家 Wi-Fi，在手机和电脑上**分别**查内网 IP 和公网 IP，记成一张小表格。观察：哪一个相同、哪一个不同？想一想这印证了这一讲的哪个概念（NAT）。
2. 挑三个网站 `ping` 一下：一个国内的（如 `baidu.com`）、一个常见国外的、再随便挑一个。把各自的 RTT 记下来排个序。延迟最高的那个，结合「物理距离 / 链路」想想为什么。

<div class="csf-note">这两个任务的命令前面都给过了，凑齐数据、自己解释现象就行。<strong>遇到看不懂的输出再去问 AI「这一行是什么意思」，但别让它替你下结论</strong>——判断「为什么这台延迟高」「为什么这两个 IP 一样」是你该练的硬功夫。</div>

## 📦 复制带走

<div class="csf-card"><strong>① IP 找机器，端口找程序。</strong> IP 是楼号（IPv4 如 <code>192.168.1.7</code>，IPv6 更长更多）；端口是房间号（数字 0~65535，<strong>不是物理插口</strong>）；二者拼成 <code>IP:端口</code> 就是 socket，唯一锁定「哪台机器的哪个程序」。<br><strong>② 内网 IP ≠ 公网 IP。</strong> <code>192.168 / 10 / 172.16~31</code> 开头的是只在局域网有效的内网 IP；对外要用公网 IP。一屋子设备共用一个公网出口，靠路由器的 <strong>NAT</strong> 分发。<br><strong>③ 记住几个常见端口：</strong> 80=HTTP、443=HTTPS、22=SSH、53=DNS。访问 https 网站默认走 443，只是被网址省略了。<br><strong>④ ping 不通 ≠ 网断了。</strong> 很多服务器故意不回应 ping（ICMP）；判断本机网络要换个会回应的目标，或直接开网页验证。</div>

下一讲（第04讲）我们把镜头拉近，看两台机器找到彼此之后，是怎么通过「三次握手」正式建立起一条可靠连接的——也就是 TCP 的开场白。
