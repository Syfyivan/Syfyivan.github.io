---
title: "《计算机基本功路线图 · 计算机网络》第10讲 · HTTPS：明文为什么危险，加锁后又安全在哪"
date: 2026-07-05 19:00:00
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

<div class="csf-key-note">上一讲我们让 HTTP「记住」了你登录的状态，靠的是 Cookie 这张小纸条。但有个细思极恐的问题：这张纸条是<strong>裸着</strong>在网线上传的——你的密码、你的登录凭证，途中任何一个设备都能原样看到。这一讲就来回答：明文到底有多危险？给网址加个 s 变成 HTTPS 之后，那把小锁锁住的究竟是什么？还有——锁住了，是不是就等于「绝对安全」了？</div>

## 🎯 这一讲你会学到什么

- 为什么纯 HTTP 是「明文」，明文在传输路上意味着什么风险（窃听、篡改、冒充）。
- 什么是「中间人攻击」，为什么它不是科幻，而是连公共 WiFi 都可能发生的事。
- HTTPS 大致怎么做到「加密 + 验证身份」：TLS 握手、公钥私钥、证书与 CA，用直觉理解，不啃数学。（TLS 旧名 SSL，就是专门给 HTTPS 加密、验身份的那套通信规矩；后面反复说的「握手」，就是 TLS 在干活。所以你在输出里看到 TLS、SSL、SSLv1.3，说的都是同一回事，不用慌。）
- 亲手查看一个网站的真实证书，亲眼看一次 TLS 握手，再去撞一次浏览器的证书警告页。
- 一个超级重要的判断：锁图标到底保证了什么、<strong>没</strong>保证什么。

## 🛠 跟我做

### 先做个思想实验：明信片 vs 信封 <span class="csf-b csf-core">必读</span>

回忆一下前面几讲：你的请求要经过本地路由器、运营商、一路上若干台路由设备，才能到达服务器。这条路上每经过一台设备（行话把经过一台设备叫一「跳」），理论上都能「看到」流过它的数据。

那么 HTTP 传的是什么样的数据？是<strong>明文</strong>——就是没有任何包装的、人能直接读懂的文字。

打个比方：

<div class="csf-legend">📮 <strong>HTTP = 明信片</strong>：内容全写在外面，邮递路上每个经手的人都能看清，甚至能拿笔改两笔。<br>✉️ <strong>HTTPS = 上锁的信封</strong>：只有收件人有钥匙能打开，中途谁都看不见里面写了啥，想改也改不了。</div>

**先猜后做**：假设你连着咖啡店的公共 WiFi，用纯 HTTP 登录一个老网站，输入了账号密码。现在请你猜一猜——同一家咖啡店里，一个稍微懂点技术的人，<strong>能不能</strong>看到你刚输入的密码原文？（在心里给个答案：能 / 不能 / 看运气）

揭晓：**能。** 而且不太需要「运气」，需要的只是几个现成的工具。这就是明文的危险——它不是「可能被偷看」，而是「默认所有人可见」。

### 明文的三种危险，记住这三个词 <span class="csf-b csf-key">重点</span>

明文传输会同时漏掉三件事，正好对应安全的三个目标：

<div class="csf-legend">👁️ <strong>窃听（看得见）</strong>：路上任何人都能读到你的密码、聊天内容、银行卡号。<br>✂️ <strong>篡改（改得了）</strong>：中间人能把你下载的安装包悄悄换成病毒，你毫不知情。<br>🎭 <strong>冒充（认错人）</strong>：你以为在跟银行说话，其实对面是个假银行，你把密码亲手交给了骗子。</div>

注意第三点：很多人以为「加密」就够了。不够。如果你加了密，但加密的对象是骗子假扮的银行，那加密反而帮骗子把你的密码安全地送到了他手里。所以 HTTPS 必须<strong>同时</strong>解决两件事：**加密**（别人看不见）+ **验证身份**（确认对面真的是它声称的那个网站）。

### 中间人攻击：危险不是抽象的

把上面三件事合起来，就是经典的「中间人攻击」（Man-in-the-Middle，常缩写 MITM）：

<div class="csf-note">你 ⟷ <strong>👿 中间人</strong> ⟷ 真服务器<br><br>中间人站在你和服务器之间，对你假装自己是服务器，对服务器假装自己是你。你的数据先到他手里，他看完（可能还改一改）再转发。两边都以为在跟「对的人」说话，实际上全程被他掌控。</div>

公共 WiFi、被入侵的路由器、运营商劫持……都可能是中间人出现的地方。这不是危言耸听，而是 HTTPS 这套东西被发明出来的根本原因。

### 上手第一步：点开锁图标，看一张真实的证书 <span class="csf-b csf-core">必读</span>

打开浏览器，访问 `https://example.com`（或者任何一个 https 网站），看地址栏左边那个 🔒 小锁。点它。

不同浏览器菜单文字略有差别，但都能找到「连接是安全的」→「证书有效 / 证书详情」之类的入口。点进去，你会看到一张「证书」。重点看这三行：

<div class="csf-legend">🏷️ <strong>颁发给（Subject / 域名）</strong>：这张证书是发给哪个域名的，比如 <code>example.com</code>。<br>🏢 <strong>颁发者（Issuer / CA）</strong>：是谁签发了这张证书，比如 DigiCert、Let's Encrypt 这类「证书颁发机构」（CA）。<br>📅 <strong>有效期</strong>：从哪天到哪天有效，过期了浏览器就不认了。</div>

**先猜后做**：你访问的这个网站，它的证书「颁发给」的域名，会和你地址栏里看到的域名<strong>一致</strong>吗？先猜，再去对照一下。

揭晓：正常情况下一定一致。这正是证书在干的事——它像一张「网站身份证」，证明「我确实是 example.com，不是别人冒充的」。如果证书上的域名和你访问的域名对不上，浏览器会直接报警，不让你继续。

### 上手第二步：用 curl 看一次 TLS 握手 <span class="csf-b csf-key">重点</span>

前面几讲我们用过 `curl`。这次加上 `-v`（verbose，啰嗦模式），让它把幕后过程都打印出来。打开终端（Windows 用 PowerShell，macOS/Linux 用终端），运行：

```bash
curl -v https://example.com -o /dev/null
```

> 小提示：`-o /dev/null` 的意思是「网页正文我不要，扔掉」，这样屏幕上只剩下我们关心的过程信息。Windows 上如果 `/dev/null` 不好使，可以换成 `curl -v https://example.com -o nul`。

**先猜后做**：在运行之前猜一下——这条命令打印的内容里，会不会出现 "TLS"、"certificate"、"SSL" 这类字眼？

先说在前头：下面这堆输出**不用每一行都看懂**。像 `ALPN: offers h2` 这种没头没尾的行，直接当它不存在就行——它不影响你理解这一讲。你只要盯着前面带 `*` 号（这是 curl 的过程说明，不是网页内容）的行，重点找这几个词：`TLS handshake`（握手）、`Certificate`（证书）、`subject`、`issuer`。找到它们就够了。

运行后，在一大堆输出里找这几类行：

```text
* Connected to example.com (93.184.x.x) port 443
* ALPN: offers h2
* TLSv1.3 (OUT), TLS handshake, Client hello (1):
* TLSv1.3 (IN), TLS handshake, Server hello (2):
* TLSv1.3 (IN), TLS handshake, Certificate (11):
* SSL connection using TLSv1.3 / TLS_AES_256_GCM_SHA384
* Server certificate:
*  subject: CN=example.com
*  issuer: C=US; O=DigiCert Inc; CN=...
```

看到了吗？这就是「加锁」的全过程被拆开给你看：

- `port 443`：HTTPS 走的是 443 端口（纯 HTTP 是 80），这是第6讲讲过的「端口」在起作用。
- `Client hello` / `Server hello`：你和服务器在「打招呼商量用哪套加密方式」——这就是 **TLS 握手**的开场。
- `Certificate`：服务器把它的<strong>证书</strong>发给你，证明身份。
- `SSL connection using TLSv1.3 ...`：握手成功，双方约定好了一把只有你俩知道的钥匙，之后的数据都用它加密。
- `subject` / `issuer`：和你刚在浏览器里点开锁看到的，是同一张证书的同样信息。这里 `subject` 那行写的是 `CN=example.com`，别被 `CN` 这两个字母绊住——`CN` 是 Common Name 的缩写，可以直接理解成「证书填的那个域名」，所以 `subject: CN=example.com` 的意思就是「这张证书是发给 example.com 的」。

<div class="csf-note">你不需要看懂每一行的术语。你只要建立一个画面感：<strong>在真正发 HTTP 请求之前，HTTPS 先多做了一轮「握手」——验明对方身份、约好一把暗号钥匙</strong>。之后所有内容都用这把钥匙锁起来传。这一讲到此，你已经亲眼看见这轮握手了。</div>

### TLS 握手到底在干嘛：用直觉理解公钥私钥 <span class="csf-b csf-key">重点</span>

这是这一讲唯一稍微烧脑的地方，但我们只用直觉，不碰数学。

想象一种神奇的锁，它有<strong>两把钥匙</strong>，而且分工固定：

<div class="csf-legend">🔓 <strong>公钥（public key）</strong>：随便发给谁都行，公开的。它只能「锁上」，锁上之后它自己也打不开。<br>🔑 <strong>私钥（private key）</strong>：服务器自己死死攥着，绝不外传。只有它能打开公钥锁上的东西。</div>

有了这对「一个负责锁、另一个才能开」的钥匙，握手时大致是这样（简化版）：

1. 服务器把<strong>公钥</strong>（装在证书里）发给你，私钥它自己留着。
2. 你随机想出一个「暗号」，用服务器的<strong>公钥</strong>把它锁起来发回去。
3. 这个锁上的暗号在路上就算被中间人截获也没用——只有攥着<strong>私钥</strong>的服务器才能解开。
4. 现在你和服务器都知道这个暗号了，之后就用它当钥匙，双方互相加密传数据。

<div class="csf-note">为什么不直接全程用公钥私钥加密？因为那种加密<strong>很慢</strong>。所以聪明的做法是：用公钥私钥这套「慢但安全」的方式，只为了安全地传递一个临时暗号；真正的大量数据，用这个暗号配一套「快」的加密来传。握手是开场仪式，正式通信用的是握手时商量好的快钥匙。</div>

<details class="csf-fold"><summary>那「验证身份」这块，证书和 CA 是怎么防冒充的？<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
<div>光有公钥还不够：万一中间人把<strong>自己</strong>的公钥发给你，假装是银行呢？这时候就轮到 <strong>CA（证书颁发机构）</strong>出场了。<br><br>CA 是一批被全世界浏览器和操作系统「预先信任」的权威机构。网站要先向 CA 证明「这个域名确实归我」，CA 才会给它签发一张证书，并用 CA 自己的私钥在证书上盖一个「数字签名」。<br><br>你的浏览器里<strong>内置</strong>了这些 CA 的公钥。收到网站证书时，浏览器用内置的 CA 公钥去验那个签名：签名对得上，说明这张证书确实是可信 CA 盖过章的，没被伪造。这就形成了一条「信任链」：你信任浏览器 → 浏览器信任 CA → CA 担保这个网站的身份。<br><br>中间人没法伪造 CA 的签名（他没有 CA 的私钥），所以他冒充银行时，要么拿不出合法证书，要么证书域名对不上，浏览器立刻报警。这就是为什么「加密」和「身份验证」必须配套——证书 + CA 解决的正是「对面到底是不是它声称的那个人」。</div>
</details>

### 上手第三步：去撞一次证书警告页 <span class="csf-b csf-core">必读</span>

光看正常的还不够，看看「出问题」长什么样，你以后才认得。有些机构专门搭了「坏证书测试站」给大家体验。在浏览器里访问下面这个（证书已过期）：

```text
https://expired.badssl.com
```

**先猜后做**：访问它，浏览器会直接打开页面，还是先拦一道警告？警告里大概会说什么？

揭晓：浏览器会拦一道<strong>红色/灰色的警告页</strong>，类似「你的连接不是私密连接」「NET::ERR_CERT_DATE_INVALID」之类。它在告诉你：这个网站的证书过期了，我没法确认它现在还可信，所以先把你拦下来。

`badssl.com` 还有一整排各种「坏法」的测试域名，可以挨个感受（都先猜再点）：

<div class="csf-legend">⏰ <code>https://expired.badssl.com</code>：证书过期了。<br>🏷️ <code>https://wrong.host.badssl.com</code>：证书上的域名和你访问的对不上（疑似冒充）。<br>✍️ <code>https://self-signed.badssl.com</code>：证书是网站自己给自己签的，没有可信 CA 担保。</div>

<div class="csf-note">这些警告页不是浏览器在「找麻烦」。它正是 HTTPS「验证身份」那一环在替你把关。<strong>请养成习惯：看到证书警告，默认就别继续</strong>，尤其是涉及登录、付款的页面。真要继续，必须确认你完全清楚自己在干嘛。</div>

## 💡 自己复述一遍

合上屏幕，用一句话说说：**为什么 HTTP 是明文很危险，HTTPS 多做的那把「锁」到底锁住了什么、又验证了什么？**

如果一时卡壳，给你个模板：「HTTP 像明信片，路上谁都能看能改还能冒充；HTTPS 在发数据前先握手，用证书验明对方身份、再约一把只有双方知道的钥匙，从此内容加密、别人看不见也改不了。」

## 🔧 翻车现场

<div class="csf-note"><strong>翻车一：以为「有锁 = 这个网站绝对安全、绝对可信」。</strong> 这是最最常见、也最危险的误解。锁图标只保证两件事：① 你和这个网站之间的<strong>传输</strong>是加密的，没人能在中途偷看篡改；② 对面确实是这个域名本身。它<strong>完全不保证</strong>这个网站是「好人」——一个骗子也可以给自己的钓鱼网站（钓鱼网站就是仿冒成正规网站、骗你输账号密码的假站，因为像钓鱼一样下饵等你上钩而得名）申请一张完全合法的 HTTPS 证书。所以钓鱼网站照样能有小绿锁。锁保证的是「这条路是私密的」，不是「路那头站的是好人」。判断对方好坏，要看域名本身对不对、网站是否正规，而不是只看有没有锁。</div>

<div class="csf-note"><strong>翻车二：以为 HTTPS 只是「网址多个 s」而已。</strong> 多的那个 s 背后，是换了端口（443 而非 80）、多了一整轮 TLS 握手、引入了证书和 CA 这套身份验证体系。它不是拼写差异，是实打实多做了「加密 + 验证身份」两件大事。</div>

<div class="csf-note"><strong>翻车三：遇到证书警告，习惯性点「继续访问」。</strong> 警告页就是身份验证在报警：证书过期了、域名对不上、或没有可信机构担保。在不清楚原因时硬闯，可能正好闯进中间人布好的局。涉及账号密码、支付的页面，看到警告一律先停下来。</div>

<div class="csf-note"><strong>翻车四：curl -v 输出太多，找不到关键行而以为「没成功」。</strong> 输出确实很长。记住带 <code>*</code> 的是过程说明，找 <code>TLS handshake</code>、<code>Server certificate</code>、<code>subject</code>、<code>issuer</code> 这几个关键词即可，不用逐行读懂。</div>

## ✅ 自检三问

1. 明文传输会同时漏掉哪三件事？（提示：对应窃听、篡改、冒充三个词）
2. HTTPS 必须同时解决「加密」和「验证身份」两件事，如果只加密不验证身份，会出什么问题？
3. 你在某网站看到了小绿锁，能不能据此断定「这个网站可以放心填银行卡」？为什么？

<details class="csf-fold"><summary>看看参考答案<span class="csf-b csf-skim">对照用 · 可跳读</span></summary>
<div>1. 窃听（内容被看见）、篡改（内容被偷改）、冒充（你以为在跟 A 说话其实是骗子）。<br>2. 你可能把数据「安全地加密」后，原封不动地送进了冒充者手里——加密反而帮了倒忙。所以必须先用证书 + CA 验明对方真身。<br>3. 不能。锁只保证「你和这个域名之间传输是加密的、对面确实是这个域名」，不保证这个域名背后是好人。骗子的钓鱼站也能有合法证书。要先确认域名本身正不正确、网站是否可信。</div>
</details>

## 🚀 挑战

挑一个你<strong>每天都会用</strong>的网站（购物、社交、银行均可），完成下面这套「证书侦探」小任务，把答案记在本子上（这一段请你自己动手查、自己判断，不要把截图丢给 AI 让它替你下结论——你要练的正是「自己看懂证书」）：

1. 点开它的锁图标，记下：证书<strong>颁发给</strong>哪个域名、<strong>颁发者（CA）</strong>是谁、有效期到哪天。
2. 用 `curl -v https://你选的域名 -o /dev/null`，在输出里找出 `TLS handshake`、`Server certificate`、`subject`、`issuer` 四行，确认它们和浏览器里看到的一致。
3. 思考题（写一两句你的判断）：假设有人给你发来一个链接，地址栏有小绿锁，但域名是 `taobao-vip-login.com`（注意不是 `taobao.com`）。这个锁能说明它是淘宝官方吗？你会怎么做？

下一讲（第11讲《抓包看一次真实请求：把整条链路串起来》），我们会动用抓包工具，把从 DNS、TCP 握手、到这一讲的 TLS 握手、再到 HTTP 请求响应的<strong>整条链路</strong>，在一次真实请求里完整地串起来看一遍。这一讲打下的「握手」概念，到那时会变成屏幕上一条条能点开的真实记录。

## 📦 复制带走

<div class="csf-card">🔑 <strong>HTTP 是明文（明信片），HTTPS 是上锁信封</strong>：明文在传输路上默认所有人可见可改可冒充；HTTPS 解决窃听、篡改、冒充三件事。</div>

<div class="csf-card">🤝 <strong>HTTPS = 加密 + 验证身份，缺一不可</strong>：发数据前先 TLS 握手，用证书 + CA 验明对方真身，再用公钥安全地约定一把临时钥匙，之后内容全用它加密传输。</div>

<div class="csf-card">🔒 <strong>锁图标只保证「传输私密 + 对面是这个域名」，不保证「对方是好人」</strong>：钓鱼站也能有合法证书。判断可信与否，要看域名本身对不对，而不是只看有没有锁。</div>

<div class="csf-card">🚨 <strong>证书警告 = 身份验证在报警，默认就别继续</strong>：过期、域名不符、无可信 CA 担保都会触发；涉及登录支付时尤其要停下来。</div>
