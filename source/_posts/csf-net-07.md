---
title: "《计算机基本功路线图 · 计算机网络》第07讲 · HTTP 请求与响应：报文到底长什么样"
date: 2026-07-05 16:00:00
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

<div class="csf-key-note">前面几讲我们一路从域名走到 IP、从 TCP 握手走到加密通道。今天终于轮到「车里装的货」了：当浏览器和服务器握完手、建好连接，它俩到底互相说了什么？答案是 <b>HTTP 报文</b>。这一讲我们不背概念，直接用 <code>curl</code> 把这段对话原原本本打印出来——你会发现它其实就是几行人能读懂的纯文本。</div>

## 🎯 这一讲你会学到什么

- HTTP 报文长什么样：原来一次请求就是一段**纯文本**，分成请求行、请求头、请求体三块。
- 怎么看「服务器回了什么」：响应也是同样的结构——状态行、响应头、响应体。
- GET 和 POST 到底差在哪，以及一个常见误会：地址栏其实发不了 POST。
- 「无状态」是什么意思，为什么 HTTP 天生「健忘」。
- 用 `curl -v` 亲眼看到完整的请求与响应，再用一个 POST 看清「请求体」是怎么发出去的。

<div class="csf-note">前置：这一讲会用到 <code>curl</code> 命令。Mac 和大多数 Linux 自带；Windows 10/11 的 PowerShell 也自带。打开终端，敲 <code>curl --version</code>，能打印出版本号就说明装好了。</div>

## 🛠 跟我做

### 1. 先认识「报文」这个词 <span class="csf-b csf-core">必读</span>

「报文」听着唬人，其实就是**通信双方互相发送的一段格式化文本**。HTTP 把它分成两种角色：

- 你（浏览器/curl）发出去的，叫 **请求报文**（request）。
- 服务器回给你的，叫 **响应报文**（response）。

两者结构高度对称，都是三段式：

<div class="csf-legend">第一行：<b>起始行</b>（请求叫请求行，响应叫状态行）<br>接下来若干行：<b>头部 headers</b>（一行一个 键: 值）<br>空一行<br>剩下的：<b>主体 body</b>（可有可无）</div>

记住那个**空行**——它是头部和主体的分界线，特别重要，后面翻车现场会再提到。

### 2. 用 curl 看一条真实的请求与响应 <span class="csf-b csf-key">重点</span>

`curl` 是个命令行工具，作用就是「帮你发一条 HTTP 请求并把结果打印出来」。加上 `-v`（verbose，啰嗦模式）参数，它会把**幕后的请求头和响应头都显示出来**。

先猜后做：下面这条命令，你觉得屏幕上会先出现「你发出去的内容」还是「服务器回来的内容」？发出去的请求里，除了网址，还会带哪些信息？心里有个数，再敲回车。

```bash
curl -v https://example.com
```

`example.com` 是一个专门用来做演示的官方测试域名，永远在线、内容固定，拿它练手最安全。运行后，你会看到一堆带符号的行，重点看这几类前缀：

```text
> GET / HTTP/2
> Host: example.com
> User-Agent: curl/8.4.0
> Accept: */*
>
< HTTP/2 200
< content-type: text/html; charset=UTF-8
< content-length: 1256
<
<!doctype html> ...（这里是网页的 HTML 内容）
```

怎么读这些符号：

- `*` 开头：curl 自己的旁白（比如「正在建立 TLS 连接」，TLS 就是前几讲说的那条加密通道），不是报文内容。
- `>` 开头：**你发出去的请求报文**。
- `<` 开头：**服务器返回的响应报文**。

现在把 `>` 那几行对号入座：

<div class="csf-legend"><code>GET / HTTP/2</code> ← <b>请求行</b>：方法 + 路径 + 协议版本<br><code>Host: example.com</code> ← <b>请求头</b>：告诉服务器我要访问哪个站点<br><code>User-Agent / Accept</code> ← 还是请求头：我是谁、我能接受什么格式<br>（那个孤零零的 <code>></code> 空行）← <b>头和体的分界空行</b><br>GET 请求一般没有请求体，所以下面就没了</div>

再看 `<` 那几行：`HTTP/2 200` 是**状态行**（200 表示成功，下一讲专讲它），后面是**响应头**，空行之后那一大段 HTML 就是**响应体**——也就是浏览器真正拿去渲染成网页的东西。

<div class="csf-note">能把这几行符号对号入座，你就已经摸到 HTTP 的门道了——网页通信不再是黑盒。<br>顺带一提：浏览器自带一套「开发者工具」，在网页上按 F12（Mac 上是 Option+Command+I）就能打开，里面有个「Network 面板」会列出网页发出的所有请求。它界面上花花绿绿的东西，本质就是这几行纯文本，只是换了个好看的外壳。</div>

### 3. 拆解请求行：方法 / 路径 / 版本 <span class="csf-b csf-core">必读</span>

请求行就一行，但信息量最大。以 `GET / HTTP/2` 为例：

| 部分 | 例子 | 含义 |
|---|---|---|
| 方法 | `GET` | 我想干什么（取数据？提交数据？） |
| 路径 | `/` | 我要这个站点下的哪个资源（`/` 是首页） |
| 版本 | `HTTP/2` | 我用的是哪一版 HTTP 协议 |

**方法（method）** 是这里的灵魂。最常用的两个：

- `GET`：**取**。我只是想读点东西，不改服务器上的数据。打开网页、刷新列表都是 GET。
- `POST`：**交**。我要往服务器提交数据，可能产生改变。登录、发帖、下单都是 POST。

<div class="csf-why">还有 PUT（更新）、DELETE（删除）等方法，它们和 GET/POST 是平级的「动词」。这一讲先吃透 GET 和 POST，其余的等你真正写接口时再补，完全来得及。</div>

### 4. 发一个带「请求体」的 POST <span class="csf-b csf-key">重点</span>

GET 没有请求体，光看它不够直观。我们换个能收 POST 的测试服务 `httpbin.org`——它有个特点：**你发什么给它，它就原样回显给你**，特别适合用来「照镜子」。

先猜后做：下面这条命令我发了两段数据：`a=1` 和 `b=hello`。你觉得在返回结果里，这两段数据会出现在哪个位置？会被原封不动地显示出来吗？

```bash
curl -X POST -d 'a=1&b=hello' https://httpbin.org/post
```

参数解释（这步建议你**自己一个字一个字敲**，别复制，手感很重要）：

- `-X POST`：指定方法是 POST（不写的话，一旦带了 `-d`，curl 也会自动切成 POST）。
- `-d 'a=1&b=hello'`：要发送的**请求体数据**。多个字段用 `&` 连接，这是表单最常见的格式。

返回的是一段 JSON——你可以先把它理解成一种用花括号 `{}` 和「键: 值」来组织数据的文本格式，机器和人都能读懂，本质上还是前面说的纯文本，只是排版更规整、能层层嵌套；后面会经常见到它。重点看这几块：

```text
{
  "args": {},
  "data": "",
  "form": {
    "a": "1",
    "b": "hello"
  },
  "headers": {
    "Content-Type": "application/x-www-form-urlencoded",
    "Host": "httpbin.org"
  },
  ...
}
```

看 `form` 字段——你刚才用 `-d` 发的 `a=1&b=hello`，原封不动出现在这里。这说明：**你的请求体确实被装进报文，跨越大半个互联网，送到了服务器手里。** 同时注意 `headers` 里多了一个 `Content-Type`，curl 帮你自动声明了「我发的是表单格式」，服务器靠它才知道该怎么解析你的 body。

<details class="csf-fold"><summary>对比：把 a=1 改成 GET 的查询参数<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
试试 <code>curl 'https://httpbin.org/get?a=1&b=hello'</code>（GET，把参数写在网址 <code>?</code> 后面）。注意网址一定要用单引号包起来：网址里带 <code>&</code> 时，如果不加引号，终端会把 <code>&</code> 理解成「把前面的命令丢到后台运行」，从 <code>&</code> 处把命令截断，结果就不对了。加上引号，终端才会把整个网址原样交给 curl。你会发现这次数据出现在返回的 <code>args</code> 字段里，而不是 <code>form</code>。这就是直观区别：<b>GET 的参数挂在 URL 上（路径里），POST 的数据藏在请求体里</b>。URL 是会被浏览器历史、服务器日志记录的，所以密码这类敏感数据绝不能用 GET 挂在网址上。</details>

### 5. 顺便理解「无状态」 <span class="csf-b csf-skim">可跳读</span>

HTTP 有个性格叫**无状态（stateless）**：服务器处理完你这一条请求，转头就把你忘了，**下一条请求它完全不记得你是谁**。两条请求之间没有「记忆」。

那为什么你登录一次，刷好几个页面都还是登录状态？因为后续每条请求里，都悄悄带上了一个「身份凭证」（通常放在请求头的 `Cookie` 里），相当于每次都重新自我介绍一遍。**不是服务器记住了你，是你每次都主动报了家门。** 这点先有个印象，后面讲到会话和 Cookie 时会展开。

## 💡 自己复述一遍

合上屏幕，用一句话说清楚：**一次 HTTP 请求和响应，分别由哪三部分组成？** 如果你能说出「请求行/请求头/（空行）/请求体」和「状态行/响应头/（空行）/响应体」，这一讲的骨架就立住了。

## 🔧 翻车现场

**翻车一：以为浏览器地址栏能发 POST。** 在地址栏敲网址回车，发出去的**永远是 GET**。POST 必须由表单（网页上那种填了内容、点「提交」按钮的输入框）、JavaScript 代码（网页背后控制各种行为的程序）或 `curl` 这类工具来发。所以「我把参数拼到网址里就能登录了吧」——不行，登录基本都是 POST，参数在请求体里，地址栏给不了。

**翻车二：分不清 GET 和 POST 该用谁。** 一个朴素的判断：**只读、不改、可以分享的链接 → GET；要提交、会改数据、含敏感信息 → POST。** 把删除操作做成 GET 是经典事故——比如一个 `GET /delete?id=5` 的链接，可能被浏览器预加载或被爬虫一访问，数据就没了。

**翻车三：手敲 header 时格式写错。** 头部的格式是严格的 `名字: 值`，**冒号后面有个空格**，名字里不能有空格。比如 `Content-Type: application/json` 写成 `Content-Type:application/json`（少空格）或 `Content Type: ...`（名字里带空格）都可能出问题。另外头部名字大小写不敏感（`Host` 和 `host` 等价），但**值是大小写敏感的**，别记反。还有那个**头部和主体之间的空行不能漏**——漏了服务器会把你的 body 当成 header 接着读，直接解析失败。

## ✅ 自检三问

1. `curl -v` 的输出里，`>` 和 `<` 分别代表什么？哪个是你发的，哪个是服务器回的？
2. 同样是带参数，GET 把参数放在哪、POST 把参数放在哪？为什么密码不该用 GET 传？
3. 「HTTP 是无状态的」是什么意思？那登录状态是靠什么维持的？

## 🚀 挑战

用 `curl` 给 `https://httpbin.org/post` 发一条请求，这次试着**自己手动加一个请求头**，比如告诉它「我发的是 JSON」：

```bash
curl -X POST -H 'Content-Type: application/json' -d '{"name":"你的名字"}' https://httpbin.org/post
```

然后对照返回结果：

- 这次你发的数据出现在了 `json` 字段还是 `form` 字段里？想想为什么——是不是因为你改了 `Content-Type`？
- 把 `-H` 那段里冒号后面的空格删掉再跑一次，看看会不会出问题。亲手制造一次「格式翻车」，比记十遍规则都管用。

这个挑战请**自己动手敲、自己看结果、自己解释为什么**，别一上来就把命令丢给 AI 让它告诉你答案——能亲眼看到报文随你的输入而变化，这种「我看懂了链路」的踏实感，是这门课最值钱的东西。

## 📦 复制带走

<div class="csf-card">1. <b>HTTP 报文就是纯文本</b>，三段式：起始行 → 头部 → 空行 → 主体；请求和响应结构对称。<br>2. <b>请求行 = 方法 + 路径 + 版本</b>，如 <code>GET / HTTP/2</code>；GET 是「取」、POST 是「交」。<br>3. <b>GET 参数挂在 URL 上，POST 数据藏在请求体里</b>；地址栏只能发 GET，敏感数据别用 GET。<br>4. <b><code>curl -v</code> 是看报文的利器</b>：<code>&gt;</code> 是你发的请求，<code>&lt;</code> 是服务器的响应，照着读就能定位问题出在哪一层。</div>

下一讲我们专门盯住响应的第一行——**状态码**：200、404、403、500 这些数字到底在说什么，怎么一眼看出「这次出错大概是谁的锅」。
