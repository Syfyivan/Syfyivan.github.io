---
title: "《计算机基本功路线图 · 计算机网络》第06讲 · UDP：不握手、不保证，但够快"
date: 2026-07-05 15:00:00
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

<div class="csf-key-note">上一讲我们花了很大力气，看 TCP 怎么在不靠谱的网络上做到「不丢、不乱」。这一讲来看它的另一面：有一种传输方式，<strong>偏偏不要这些保证</strong>——不握手、不确认、不重传，发出去就不管了。它叫 UDP。听起来很「偷懒」，但你每天用的 DNS、视频通话、网游、还有最新的 HTTP/3，背后都是它。读完你会明白：可靠不是越多越好，<strong>合适才是好</strong>。</div>

## 🎯 这一讲你会学到什么

- 说清 UDP 和 TCP 到底差在哪：一句话——**TCP 像挂号信，UDP 像往窗外喊一嗓子**。
- 理解三个关键词：**无连接**、**不保证可靠**、**低延迟**，以及它们其实是一回事的三个侧面。
- 知道为什么 DNS、音视频、游戏、还有最新的网页传输方式（也就是 QUIC / HTTP3，这一讲后面会讲到它们是什么）这些场景**主动选择**了「不可靠」的 UDP。
- 亲手用 `nc` 跑一次 UDP 的自发自收，再回头看第 02 讲 `dig` 的输出，确认 DNS 真的走 UDP。
- 练一个判断力：什么时候该用 UDP、什么时候千万别用——这是 AI 不会替你做的取舍。

<div class="csf-note">先约定一下：这一讲假设你已经跟下来了第 05 讲，知道 TCP 的「三次握手 + 确认重传」是怎么回事。如果忘了也没关系，下面会用大白话再点一句。</div>

## 🛠 跟我做

### 先把上一讲的 TCP 在脑子里摆好 <span class="csf-b csf-core">必读</span>

上一讲的 TCP，为了「不丢不乱」，做了一堆事：

- 先**三次握手**建立连接（你好 / 你好我收到了 / 好的开始吧），确认双方都在线。
- 每发一段数据，对方要**回一个确认**（ACK）；没收到确认，就**重传**。
- 数据到了对方那里，会按**编号排好序**再交给程序，保证顺序。

这些都很好，代价是：**慢、啰嗦**。光是握手就要一来一回好几趟，丢一个包还得停下来等重传。

现在请你**先猜一下** <span class="csf-b csf-key">重点</span>：如果有一种传输方式，把上面这些「保证」**全砍掉**——不握手、不确认、不重传、不排序，发出去就完事——它会有什么好处？又会有什么坏处？心里有个答案，再往下看。

### UDP 是什么：发出去就不管了

UDP 的全名是「用户数据报协议」（User Datagram Protocol）。它的行为简单到几乎没什么可说的：

> 把你的数据塞进一个**数据报（datagram）**，写上目标 IP 和端口，**扔到网络上**，结束。

就这样。它**不关心**：

- 对方在不在线（不握手，所以叫**无连接**）。
- 这个包有没有到（不等确认，**不保证可靠**）。
- 丢了要不要补发（不重传）。
- 几个包谁先到谁后到（不排序）。

听起来很不负责任？换个角度：**正因为什么都不管，它就什么都不用等。** 没有握手的来回，没有等确认的停顿——数据准备好就发，这就是 **低延迟**。

<div class="csf-note">所以「无连接 / 不保证可靠 / 低延迟」其实是<strong>同一件事的三个说法</strong>：因为无连接、不保证，所以才低延迟。砍掉的安全保障，换来的是速度。这是一笔<strong>交易</strong>，不是缺陷。</div>

打个比方帮你记牢：

- **TCP = 寄挂号信**。要先确认地址对方在、签收了给你回执、丢了邮局负责补。稳，但慢、手续多。
- **UDP = 往楼下喊一嗓子**。"吃饭啦！" 喊出去就完事——对方听没听见、有没有回应，你不知道，也不等。快，但可能没人听见。

### 动手练一：用 nc 让 UDP 自己跟自己说话 <span class="csf-b csf-core">必读</span>

光说没用，我们亲手跑一次。`nc`（netcat）是个万能的网络小刀，平时默认走 TCP，加上 `-u` 就切到 **UDP 模式**。

你需要开**两个终端窗口**（macOS 用「终端」开两个标签页就行）。

<div class="csf-note"><strong>Windows 用户看这里：</strong>下面这些命令是在 Linux/macOS 的命令行里跑的，Windows 自带的「命令提示符」不一定有 <code>nc</code>。最省事的办法是用 <strong>WSL</strong>——它是 Windows 自带的一个功能，开启后能在 Windows 里直接开一个 Linux 命令行环境，跑 Linux 命令。<br>开启方法很简单：用管理员身份打开 PowerShell，敲 <code>wsl --install</code> 回车，按提示重启电脑，之后在开始菜单搜「Ubuntu」打开，就是一个 Linux 命令行了（更详细的安装步骤可参考微软官方的 WSL 安装文档）。<br>如果你现在不想折腾安装，也<strong>完全没关系</strong>：可以先跳过亲手敲，对照下面监听方/发送方的命令和说明，把「一句话发出去、另一边原样收到」这个过程看懂即可，不影响后面的学习。</div>

**第一个终端**——当「监听方」，守在本机的 9999 端口等消息：

```bash
nc -u -l 9999
```

- `-u`：用 UDP。
- `-l`：listen，监听（守着一个端口等别人发来的数据）。
- `9999`：端口号，随便挑一个没被占用的就行。

敲完回车，这个终端会**卡住不动**——这是正常的，它在等。

**第二个终端**——当「发送方」，往本机的 9999 端口发：

```bash
nc -u 127.0.0.1 9999
```

- `127.0.0.1` 是「本机」的固定地址（叫 loopback，自己连自己，前面讲过）。
- 没有 `-l`，所以它是去**连接 / 发送**那一方。

敲完回车，光标也会停在那等你打字。现在**先猜一下**：你在第二个终端里打一行字按回车，会发生什么？

……揭晓：你在**发送方**敲的每一行，按下回车后，会**原样出现在第一个（监听方）终端里**。比如你在发送方打 `hello udp` 回车，监听方那边立刻就蹦出来一行 `hello udp`。

试着多发几行，感受一下：没有任何「连接建立」的提示，没有握手，你打一句它到一句，**直来直去**。这就是 UDP 的手感。

<div class="csf-note">小提示：想结束，在任意一个终端按 <code>Ctrl + C</code> 即可。如果你的 <code>nc</code> 行为和这里不完全一样（不同系统的 nc 实现略有差异），别慌，翻到下面「翻车现场」对照一下。</div>

### 动手练二：回头确认 DNS 真的走 UDP <span class="csf-b csf-key">重点</span>

第 02 讲我们用 `dig` 查过域名。那时候你可能没注意——DNS 默认就是**坐 UDP 的车**。现在我们来亲眼确认。

再跑一次 `dig`（换成你想查的域名都行）：

```bash
dig example.com
```

输出最下面有几行统计信息，**重点看这一行**（先猜：它会写 UDP 还是 TCP？）：

```text
;; SERVER: 192.168.1.1#53(192.168.1.1) (UDP)
```

先别被这一行吓到，把它拆开看：开头的 `192.168.1.1` 是**你这台电脑当前正在用的 DNS 服务器地址**——每个人的网络不一样，你跑出来的数字多半和这里不同（可能是你家路由器、也可能是运营商或公共 DNS 的地址），这都很正常，不用怀疑自己搞错了。紧跟着的 `#53` 里的 `53` 是**端口号**，53 是 DNS 固定使用的端口（就像 DNS 服务的「门牌号」）。而我们这次真正要确认的重点，是**末尾那个 `(UDP)`**——它说明你这次域名查询，就是用 UDP 发出去的。再看另一行：

```text
;; Query time: 12 msec
```

12 毫秒就查完了。**想想为什么 DNS 偏要用 UDP**：你打开一个网页，浏览器要先查域名拿到 IP，这一步**越快越好**，不能让用户干等。一次 DNS 查询通常就是「问一句、答一句」，数据量很小。如果用 TCP，光握手就得先来回三趟，太亏了。用 UDP，一个包问出去、一个包答回来，省掉所有客套，快。

<div class="csf-why">那万一这个 UDP 包丢了怎么办？答案很朴素：<strong>没收到回答，过一会儿再问一遍就是了</strong>。DNS 查询很小、重发很便宜，与其为了"保证不丢"背上 TCP 那一整套开销，不如丢了重问。你看——可靠性不是非得放在 UDP 这一层，"丢了再问一次"这种简单补救，由上层自己做反而更划算。</div>

<details class="csf-fold"><summary>那 DNS 会用到 TCP 吗？<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
会。当一次 DNS 回答太大（比如记录很多，一个 UDP 数据报装不下），或者做区域传送（DNS 服务器之间同步整个域的数据）时，会改用 TCP。也就是说：<strong>小而快的日常查询走 UDP，大而需要可靠的场合走 TCP</strong>。这正好说明——选 UDP 还是 TCP，看的是<strong>场景需要什么</strong>，不是谁更高级。<br>另外现在还有「加密 DNS」（DoH / DoT），为了安全会跑在 TCP/TLS 甚至 HTTPS 上，那是另一个话题了，这里先不展开。</details>

### UDP 到底用在哪：四个典型场景 <span class="csf-b csf-core">必读</span>

记住一个判断标准：**当「快」和「实时」比「一个都不能丢」更重要时，就该考虑 UDP。**

- **DNS 域名解析**：问一句答一句，要快，丢了重问就行。（刚才亲手验证过了。）
- **音视频通话 / 直播**：实时性是命。视频里**丢一两帧画面**，你顶多看到一瞬间的卡顿/花屏，无所谓；但如果像 TCP 那样「丢了就停下来等重传」，画面就会**卡死、累积延迟**，越拖越糟。宁可丢一帧，也不要卡。
- **网络游戏**：你的角色坐标每秒发几十次。**旧的位置数据补发回来毫无意义**——等你重传到了，人早跑远了。直接用最新的覆盖，丢了的就让它丢。
- **QUIC / HTTP3**：这是最有意思的反转——现代浏览器访问很多大网站，底层用的是 **QUIC**，而 QUIC 正是**建在 UDP 之上**的。它在 UDP 的「快」基础上，自己**重新实现**了一套更聪明、更灵活的可靠和加密机制，绕开了 TCP 的一些历史包袱。（这块第 07 讲之后还会再遇到。）

<div class="csf-note">看出门道了吗？QUIC 这个例子告诉你：UDP 不是"残废版 TCP"，而是一块<strong>干净的画布</strong>。你想要可靠？可以自己在上面盖。系统给你一个"什么都不管、但很快"的底座，剩下的取舍交给你——这恰恰是 UDP 的价值。</div>

## 💡 自己复述一遍

合上屏幕，用一句话说给自己听：

> **UDP 就是「发出去就不管」——不握手、不确认、不重传，用「可能丢」换「足够快」；当实时比可靠更重要时（DNS、音视频、游戏、QUIC），就该用它。**

如果你能顺带说出"DNS 默认走 UDP，因为它要快、丢了重问就行"，那这一讲的核就握住了。

## 🔧 翻车现场

<div class="csf-note"><strong>翻车一：以为「UDP 更快，所以更高级，什么都该用它」。</strong><br>这是最常见的误解。快是<strong>有代价</strong>的——它把"保证送达""保证顺序"全扔了。你用 UDP 传一个文件、付一笔款、发一条聊天消息？丢了你都不知道，那是灾难。<strong>没有"更高级"，只有"更合适"。</strong> 要稳（网页、文件、登录、支付）用 TCP；要快且能容忍丢失（实时音视频、游戏、DNS）用 UDP。这是<strong>选择题，不是优劣题</strong>。</div>

<div class="csf-note"><strong>翻车二：以为「用了 UDP 就一定大量丢包、根本没法用」。</strong><br>另一个极端。事实是：在正常的网络里，UDP 包<strong>绝大多数都能到</strong>，丢包只是<strong>没人兜底</strong>而已，不代表它就疯狂丢。而且谁说 UDP 就一定不可靠？需要的话，<strong>应用层完全可以自己加一层补救</strong>——DNS 的"丢了重问"、QUIC 的整套可靠机制，都是建在 UDP 上的。UDP 给你自由，可靠不可靠，看你上面怎么搭。</div>

<div class="csf-note"><strong>翻车三：nc 实验里两个终端连不上 / 收不到。</strong><br>常见原因：① 两个终端的<strong>端口号没对上</strong>（都得是 9999）；② 监听方那条命令<strong>漏了 <code>-u</code></strong>，变成了 TCP，自然和 UDP 的发送方对不上；③ 端口被别的程序占用了——换一个大一点的端口（比如 <code>50000</code>）再试；④ 某些精简版系统自带的 <code>nc</code> 功能不全。这时可以装 <code>ncat</code> 替代——<code>nmap</code> 是一套很常用的网络工具包，<code>ncat</code> 是它里面附带的一个更完整的 <code>nc</code> 替代品，用法基本一样（把命令里的 <code>nc</code> 换成 <code>ncat</code> 即可）。安装命令：macOS 用 <code>brew install nmap</code>；Ubuntu/WSL 用 <code>sudo apt install ncat</code>（装不到的话试 <code>sudo apt install nmap</code>）。先把这四点逐个排查，<strong>别急着复制报错去问 AI</strong>——自己定位"卡在哪一层"，正是这门课要练的功夫。</div>

## ✅ 自检三问

1. 用「挂号信」和「喊一嗓子」的比方，分别对应 TCP 和 UDP，并说出各自的一个优点和一个缺点。
2. DNS 为什么默认用 UDP？如果那个查询包丢了，会发生什么？
3. 视频通话为什么宁可丢一帧画面，也不愿意用 TCP「丢了就停下来等重传」？

（三问都能不看屏幕答上来，就过关。答不利索的，回到对应小节再读一遍——别跳过。）

## 🚀 挑战

给你一个**判断力**练习，动手 + 动脑，**不要让 AI 替你下结论**：

把下面这几个场景，逐个判断"该用 TCP 还是 UDP"，并**写一句话说明你的理由**（理由比答案更重要）：

1. 在线下载一个 2GB 的安装包。
2. 一场多人在线射击游戏里，同步玩家的实时位置。
3. 网页上提交一个注册表单。
4. 一场上百人的直播，把主播画面推给所有观众。
5. 智能手表每 30 秒上报一次心率读数（偶尔漏一两次也无所谓）。

<div class="csf-why">提示：每道题先问自己两件事——"丢一个包会不会出大问题？""慢一点用户受得了吗？"。<strong>能容忍丢、且追求快/实时的，倾向 UDP；一个都不能错的，倾向 TCP。</strong> 写完你自己的答案和理由后，<em>再</em>去和 AI 对一对——这时候 AI 是帮你校验思路的陪练，而不是替你思考的代笔。重点看：它给的理由，和你想的是不是一回事？</div>

进阶（选做 <span class="csf-b csf-skip">选学</span>）：用你刚学的 `nc -u`，让**两台在同一个 Wi-Fi 下的电脑**互发 UDP 消息（把 `127.0.0.1` 换成对方电脑的局域网 IP）。能跑通的话，你就真正"看见"了一个数据报跨设备飞过去的样子。

## 📦 复制带走

<div class="csf-card"><strong>① 一句话本质：</strong>UDP = 无连接 + 不保证可靠 + 低延迟，发出去就不管，用「可能丢」换「足够快」。<br><strong>② 不是优劣，是取舍：</strong>要稳用 TCP（网页/文件/支付），要快且容忍丢失用 UDP（DNS/音视频/游戏）。没有"更高级"，只有"更合适"。<br><strong>③ 可靠可以自己加：</strong>UDP 是干净底座——DNS"丢了重问"、QUIC/HTTP3 在 UDP 上重建了整套可靠机制，都说明这一点。<br><strong>④ 排障心法：</strong>nc 收不到先查端口/<code>-u</code>/占用，自己定位"卡在哪一层"，再考虑问 AI——这正是 AI 替不了你的硬功夫。</div>

下一讲（第 07 讲《HTTP 请求与响应：报文到底长什么样》），我们把镜头拉到更上面一层：当连接（不管是 TCP 还是 QUIC）建好之后，浏览器和服务器之间到底**说了些什么话**、那些「话」长什么样。咱们把一个真实的 HTTP 报文一行一行拆开看。下一讲见。
