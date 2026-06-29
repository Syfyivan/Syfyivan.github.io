---
title: "《计算机基本功路线图 · 计算机网络》第02讲 · DNS：把域名翻译成 IP 地址"
date: 2026-07-05 11:00:00
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

<div class="csf-key-note">你在浏览器里敲的是 <code>example.com</code> 这种好记的名字，但网络里的机器只认数字门牌——IP 地址。<strong>DNS 就是那本「电话簿」，负责把域名翻译成 IP。</strong>这一讲我们要亲手查一查：你常用的网站，真实门牌号到底是多少。</div>

上一讲我们建立了「分层」的直觉：一次网页请求会被拆成好几层，每层只管自己的事。从这一讲开始，我们就跟着一次真实的请求，一步一步往下走。

旅程的第一步，是一个很容易被忽略、却人人都在用的环节——**DNS 解析**。你敲下 `example.com` 按回车的那一瞬间，浏览器其实还不知道要去找哪台机器。它得先问一句：「`example.com` 到底住在哪个 IP？」这一问一答，就是 DNS 做的事。

## 🎯 这一讲你会学到什么

- 域名和 IP 是什么关系，为什么我们需要「翻译」这一步
- DNS 解析的完整链路：从你的电脑，一路问到根服务器、顶级服务器、权威服务器
- 「递归查询」和「迭代查询」到底谁帮谁跑腿
- 缓存和 TTL 为什么能让网络快得多
- 亲手用 `dig`、`nslookup` 查任意域名的 IP，并小心地改一次本机 `hosts` 文件（然后改回来）

## 🛠 跟我做

### 先认识两个名字：域名 vs IP <span class="csf-b csf-core">必读</span>

想象你要给朋友寄快递。你脑子里记的是「小明家」，但快递员需要的是「××路 12 号 3 单元 502」。**「小明家」就是域名，「××路 12 号」就是 IP 地址。**

- **域名**（domain name）：给人看的，好记。比如 `example.com`、`www.baidu.com`。
- **IP 地址**（IP address）：给机器用的，是一串数字。比如 `93.184.215.14`（IPv4），或者更长的一串带冒号的（IPv6）。

机器之间通信，最终靠的是 IP。域名只是套在外面的「好记的壳」。所以每次访问网站，都得先把域名翻译成 IP——这就是 DNS（Domain Name System，域名系统）的工作。

<div class="csf-why">为什么不直接让大家记 IP？因为 IP 会变。网站搬家、换服务器、做负载均衡（一个网站用很多台机器一起分担访问量，所以会有好几个 IP），IP 说换就换；但域名可以一直不变，背后指向的 IP 悄悄更新就行。这层「翻译」帮我们把「好记的名字」和「会变的地址」各管各的、互不影响。</div>

### 第一步：装好工具，先猜后做 <span class="csf-b csf-key">重点</span>

我们要用两个命令行工具：`dig` 和 `nslookup`。它们都是用来查 DNS 的。

打开你的终端（macOS 是「终端 Terminal」，Windows 用「PowerShell」或「命令提示符」，Linux 就是系统里那个黑底白字、用来敲命令的窗口，一般也叫终端）：

- **macOS**：`dig` 和 `nslookup` 一般自带，直接能用。
- **Linux**：`dig` 可能要装，Debian/Ubuntu 上是 `sudo apt install dnsutils`（`sudo` 表示用管理员权限运行，敲下去可能会让你输入开机密码，输的时候屏幕上不显示字符是正常的）。
- **Windows**：`nslookup` 自带；`dig` 不一定有，所以 Windows 用户主要用 `nslookup`，下面 `dig` 的部分可以当阅读理解。

<div class="csf-note"><strong>先猜一下：</strong>你觉得 <code>example.com</code> 会解析出几个 IP？查询这一来一回大概要多少毫秒——1 毫秒？10 毫秒？还是 100 毫秒以上？心里记个数，等下对答案。</div>

### 第二步：用 dig 查 example.com

在终端敲：

```bash
dig example.com
```

你会看到一大坨输出，别慌，我们只看关键的几行。重点是 `ANSWER SECTION`（答案区）：

```text
;; ANSWER SECTION:
example.com.		3502	IN	A	93.184.215.14

;; Query time: 23 msec
;; SERVER: 192.168.1.1#53(192.168.1.1)
```

逐字段拆给你看：

- `example.com.` —— 你查的域名（末尾那个点是「根」，后面会讲）。
- `3502` —— **TTL**，这条记录还能缓存多少秒（这里约 58 分钟）。
- `IN` —— 类别，Internet，固定这么写，不用管。
- `A` —— **记录类型**。`A` 记录就是「域名 → IPv4 地址」的映射。
- `93.184.215.14` —— 答案！这就是 `example.com` 此刻对应的 IP。
- `Query time: 23 msec` —— 这次查询花了 23 毫秒。
- `SERVER: 192.168.1.1#53` —— 帮你查询的 DNS 服务器地址，以及它用的端口 **53**。端口你可以先理解成「一台机器上的门牌号，用来区分上面跑的不同服务」，下一讲会细讲；现在只要记住 DNS 用的是 53 号这个数字就行。

<div class="csf-note">对答案时间：你刚才猜的 IP 个数和耗时，对上了吗？不同网站、不同网络环境结果都不一样，没猜中很正常——关键是你现在<strong>看得懂每个字段在说什么</strong>了。</div>

只想要干净的答案、不看一堆杂项？加个 `+short`：

```bash
dig example.com +short
```

输出就一行（或几行）IP，清爽多了。

### 第三步：用 nslookup 查同一个域名

`nslookup` 是另一个更通用的工具（Windows 也有），查同一个域名：

```bash
nslookup example.com
```

输出大概长这样：

```text
Server:		192.168.1.1
Address:	192.168.1.1#53

Non-authoritative answer:
Name:	example.com
Address: 93.184.215.14
```

- `Server` / `Address` —— 同样告诉你是哪台 DNS 服务器、用 53 端口在帮你查。
- `Non-authoritative answer`（非权威答案）—— 意思是「这个答案是从缓存里给你的，不是直接从源头权威服务器拿的」。这很正常，缓存就是用来加速的，下面会讲。
- `Address: 93.184.215.14` —— 和 `dig` 查到的一致。

两个工具结果对得上，说明你查对了。

### 第四步：看懂 DNS 是怎么「一层层问出来」的 <span class="csf-b csf-core">必读</span>

那台帮你查询的 DNS 服务器（通常是你家路由器或运营商提供的，叫**本地/递归 DNS 服务器**），如果它缓存里没有答案，它会替你跑一趟「打听」流程。我们以查 `www.example.com` 为例：

```text
你的电脑 ──问──> 本地DNS服务器（递归服务器）
                      │  我帮你全程问到底！
                      ├─问根服务器：".com 归谁管？"
                      │  根答："去问 .com 顶级服务器，地址是……"
                      ├─问 .com 顶级服务器："example.com 归谁管？"
                      │  顶级答："去问 example.com 的权威服务器，地址是……"
                      ├─问权威服务器："www.example.com 的 IP 是？"
                      │  权威答："是 93.184.215.14"
                      └─把最终答案返回 ──> 你的电脑
```

这里藏着两个关键概念，一定要分清：

- **递归查询**：你对本地 DNS 服务器说「你帮我问到最终答案为止，别让我自己跑」。本地服务器答应了，全程帮你跑腿——这叫递归。
- **迭代查询**：本地 DNS 服务器去问根、顶级、权威这一串服务器时，每台只回它「下一步该去问谁」，而不是替它问到底。本地服务器拿着线索一步步自己接着问——这叫迭代。

<div class="csf-note"><strong>一句话记住：</strong>你 → 本地服务器是<strong>递归</strong>（甩手掌柜，要现成答案）；本地服务器 → 根/顶级/权威是<strong>迭代</strong>（自己拿着线索一站站接力问）。</div>

再认识这三级「管家」：

- **根服务器**（root）：最顶层，知道每个顶级域（`.com`、`.cn`、`.org`……）归谁管。全球就那么一套，地位最高。
- **顶级域名服务器**（TLD）：管某一个后缀，比如管所有 `.com` 域名的服务器。
- **权威服务器**（authoritative）：管某个具体域名，比如 `example.com` 的权威服务器，它手里才有 `www.example.com` 的真正答案。

<details class="csf-fold"><summary>那个域名末尾的「点」是什么<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
你注意到 <code>dig</code> 输出里写的是 <code>example.com.</code>，末尾多了个点吗？这个点代表「根」。完整的域名其实是 <code>www.example.com.</code>，从右往左读是：根（.）→ 顶级（com）→ 二级（example）→ 主机（www）。平时我们省略最后那个点，但 DNS 内部是从右边的「根」开始一级级往左找的。理解了这个层级，上面「根→顶级→权威」的问询顺序就顺理成章了。<br>另外说明一下：现实中本地服务器并不是每次都老老实实从根问起。根、顶级这些上层信息也会被缓存很久，所以多数时候它问一两步、甚至直接命中缓存就拿到答案了。上面的全链路图是「缓存全空」时的最坏情况，帮你理解原理。</details>

### 第五步：缓存与 TTL——为什么第二次特别快 <span class="csf-b csf-key">重点</span>

如果每次访问网站都要把根→顶级→权威跑一遍，那也太慢了。所以 DNS 处处都有**缓存**：你的浏览器、操作系统、本地 DNS 服务器，都会把查到的答案存一会儿。

存多久？由 `dig` 输出里那个 **TTL**（Time To Live，存活时间）决定。比如 TTL 是 `3600`，意思是「这条记录缓存 3600 秒（1 小时），到期前都用缓存，不用再去问」。

你可以亲眼看到 TTL 在倒数：

```bash
dig example.com
# 看一眼 TTL，比如 3502
# 等几秒钟，再敲一次
dig example.com
# TTL 变小了，比如 3495
```

<div class="csf-note"><strong>先猜后做：</strong>连查两次同一个域名，第二次的 <code>Query time</code> 会更快还是更慢？敲一遍验证——多数情况下第二次会快很多，因为答案已经在缓存里，不用再跑一圈了。</div>

### 第六步：动手改 hosts，亲手「劫持」一个域名 <span class="csf-b csf-core">必读</span>

在所有缓存和 DNS 服务器之前，其实还有一个更优先的地方会被查——本机的 **hosts 文件**。它是一张你自己说了算的小电话簿。系统在发起 DNS 查询前，会先翻这张表；如果里面写了，就直接用，根本不去问 DNS。

我们来做个安全的小实验：让一个**测试域名**指向你自己的电脑 `127.0.0.1`（这个地址永远代表「本机」）。

<div class="csf-note"><strong>重要安全提示：</strong>这一步会改系统文件，请<strong>只加我们约定的测试域名 <code>csf-test.local</code></strong>，<strong>千万不要去改 <code>baidu.com</code>、<code>google.com</code> 这类真实网站</strong>，否则你可能上不了那个网站还一头雾水。做完<strong>务必改回来</strong>。这一段请你自己一行行敲、自己看懂每一步，<strong>不要让 AI 替你改系统文件</strong>——动系统配置必须是你自己心里有数。</div>

hosts 文件的位置：

- **macOS / Linux**：`/etc/hosts`
- **Windows**：`C:\Windows\System32\drivers\etc\hosts`

**macOS / Linux 操作步骤：**

```bash
# 1. 先看一眼当前内容（不修改，只查看）
cat /etc/hosts

# 2. 用编辑器打开（需要管理员权限，所以用 sudo）
sudo nano /etc/hosts
```

在文件**最后另起一行**，加上这一行（IP 和域名之间用空格或 Tab 隔开）：

```text
127.0.0.1   csf-test.local
```

在 `nano` 里按 `Ctrl+O` 再按回车保存，按 `Ctrl+X` 退出。

然后验证。这里要用到一个新命令 `ping`：它是用来测试「能不能连到某台机器」的命令，会先把你给的域名解析成 IP、再把那个 IP 显示出来，所以正好能拿来检查 hosts 有没有生效。

```bash
ping csf-test.local
```

<div class="csf-note"><strong>先猜：</strong><code>ping csf-test.local</code> 会显示哪个 IP？</div>

如果生效了，输出大概长这样（按 `Ctrl+C` 可以停下来）：

```text
PING csf-test.local (127.0.0.1): 56 data bytes
64 bytes from 127.0.0.1: icmp_seq=0 ttl=64 time=0.045 ms
64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.071 ms
```

只要看第一行括号里那个 IP——它显示的是 `127.0.0.1`，说明 `csf-test.local` 这个域名被解析到了本机。你成功地把一个域名「劫持」到了自己的电脑上！这就证明 hosts 文件确实在 DNS 之前被优先采用了。

<details class="csf-fold"><summary>Windows 用户怎么改<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
Windows 改 hosts 要用<strong>管理员身份</strong>：在开始菜单搜「记事本」，右键「以管理员身份运行」，然后在记事本里「文件 → 打开」，把路径粘进去：<code>C:\Windows\System32\drivers\etc\hosts</code>（注意右下角文件类型要选「所有文件」才看得见它）。同样在末尾加一行 <code>127.0.0.1   csf-test.local</code>，保存。验证用 <code>ping csf-test.local</code>。如果没生效，试试在命令行运行 <code>ipconfig /flushdns</code> 刷新缓存。</details>

**最关键的一步：改回去！**

实验做完，把刚才加的那行删掉，恢复原样：

```bash
sudo nano /etc/hosts
# 删掉 "127.0.0.1   csf-test.local" 这一行，保存退出
```

养成「改了系统文件就记得复原」的习惯，比这个实验本身更重要。

## 💡 自己复述一遍

合上屏幕，用一句话说给自己听：

> DNS 就是把人记的域名翻译成机器用的 IP；我的电脑把活儿（递归）甩给本地 DNS 服务器，它再从根到顶级到权威一站站（迭代）问出答案，而且大家都用缓存（TTL 控制时长）来加速。

说得磕磕绊绊没关系，能把「域名→IP」「递归 vs 迭代」「缓存/TTL」三个词串进去，就说明你抓住了主线。

## 🔧 翻车现场

<div class="csf-note"><strong>翻车一：改完 hosts 不生效。</strong>最常见三个原因：① <strong>格式错了</strong>——IP 在前、域名在后，中间要有空格或 Tab，别写反、别用逗号；② <strong>没真正保存</strong>——`nano` 要 <code>Ctrl+O</code> 回车才存盘，Windows 记事本可能因没用管理员权限而保存失败；③ <strong>缓存没刷</strong>——系统或浏览器还记着旧答案，macOS 试 <code>sudo dscacheutil -flushcache</code>，Windows 试 <code>ipconfig /flushdns</code>，浏览器干脆重开一个。</div>

<div class="csf-note"><strong>翻车二：想当然以为 DNS 走 TCP。</strong>这里先解释下：TCP 和 UDP 是两种「数据在网上怎么传」的方式（后面的课会细讲），现在只需知道 UDP 更轻快、TCP 更稳重。绝大多数 DNS 查询走的是 <strong>UDP 的 53 端口</strong>——UDP 快、开销小，DNS 这种一问一答正合适。只有在响应内容太长、一个 UDP 包装不下，或者两台 DNS 服务器之间要整体同步数据（行话叫「区域传送」）这类特殊场景时，才会改用更稳重的 TCP。所以记住默认答案：<strong>DNS 主要走 UDP 53</strong>。这也是为什么上面输出里你总看到 <code>#53</code>。</div>

<div class="csf-note"><strong>翻车三：把「非权威答案」当成出错了。</strong><code>nslookup</code> 里的 <code>Non-authoritative answer</code> 不是错误，只是说「这答案来自缓存，不是直接问源头拿的」。这恰恰是缓存在正常工作，放心。</div>

## ✅ 自检三问

1. 域名和 IP 分别是给谁用的？为什么访问网站必须先做 DNS 解析这一步？
2. 「递归查询」和「迭代查询」各发生在链路的哪一段？谁帮谁跑腿？
3. TTL 是干什么的？为什么你连查两次同一个域名，第二次往往更快？

三问都能用自己的话答上来，这一讲就过关了。卡在哪问，就回去重读对应那一节——别急着往下走。

## 🚀 挑战

挑一个你每天都用的网站（比如学校官网、某个购物网站），完成下面三件小事，并把结果记在自己的笔记里：

1. 用 `dig 那个域名 +short`（Windows 用 `nslookup`）查出它的 IP，记下来。
2. 隔几分钟再查一次，看 IP 变了没、TTL 变了没。**先猜**：大网站会不会每次返回的 IP 都一样？（提示：大网站常有多个 IP 做负载均衡，留意 `ANSWER SECTION` 是不是返回了好几行。）
3. 用 `dig 那个域名 AAAA +short` 查查它有没有 IPv6 地址（`AAAA` 是 IPv6 的记录类型，对照前面的 `A`）。有的网站有，有的没有。

这几条命令请你自己敲、自己读输出。看不懂某个字段，可以让 AI 当家教**给你解释**，但**查询和判断要你自己做**——排障时真正救你的，是你看得懂这些字段。

## 📦 复制带走

<div class="csf-card"><strong>DNS 一图记牢：</strong><br>1. <strong>它干嘛的</strong>：把好记的<strong>域名</strong>翻译成机器用的 <strong>IP</strong>，是一次网页请求的第一步。<br>2. <strong>怎么查出来</strong>：你甩给本地 DNS（<strong>递归</strong>），它从根→顶级→权威一站站（<strong>迭代</strong>）问到底。<br>3. <strong>为什么快</strong>：层层<strong>缓存</strong>，存多久由 <strong>TTL</strong> 决定；本机 <strong>hosts</strong> 文件优先级最高。<br>4. <strong>两个易错点</strong>：DNS 默认走 <strong>UDP 53</strong>（不是 TCP）；改完 hosts 不生效多半是格式/保存/缓存的问题，实验完<strong>记得改回去</strong>。</div>

下一讲我们顺着旅程往下走：拿到 IP 之后，怎么用 **IP 找到那台机器、再用端口找到机器上具体的哪个程序**。第03讲《IP 与端口：找到哪台机器、机器上的哪个程序》见。
