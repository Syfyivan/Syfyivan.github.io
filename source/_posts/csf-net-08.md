---
title: "《计算机基本功路线图 · 计算机网络》第08讲 · 状态码与响应头：一眼看出「大概谁的锅」"
date: 2026-07-05 17:00:00
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

<div class="csf-key-note">上一讲我们把 HTTP 报文拆开来看，发现响应的第一行写着一个数字，比如 <code>200</code>。这一讲就专门盯住这个数字。它叫<strong>状态码</strong>，是服务器对你这次请求的「一句话表态」。学会读它，你就能在请求失败的那一秒，先不慌——抬眼看一下数字，心里大致就有数：这锅，大概是我（客户端）的，还是它（服务端）的。</div>

## 🎯 这一讲你会学到什么

- 状态码分成 5 大类（1xx～5xx），每一类大概是什么意思，怎么<strong>一眼分清「客户端的锅」还是「服务端的锅」</strong>。
- 几个你天天都会撞见的具体码：301/302（重定向）、304（缓存命中——「缓存」就是浏览器把上次下载过的东西在本地存了一份副本，下次没变就直接用、不重新下；「命中」就是这次正好用上了那份副本，所以 304 是好事）、403/404（你这边有问题）、500/502（服务器那边崩了）。
- 响应头里几个最该认识的：<code>Content-Type</code>（这坨返回的到底是网页还是图片还是数据）、缓存相关的头、重定向相关的头。
- 亲手用 <code>curl</code> 故意触发一个 404，再跟踪一次完整的重定向链，看着数字一步步跳。

<div class="csf-note">说在前面：状态码不需要背全。HTTP 标准里有几十个，但日常排障真正高频的就十来个。这一讲只教你<strong>分类的直觉</strong>和<strong>最常见的那几个</strong>。直觉到位了，遇到没见过的码，你也能靠它所在的「百位区间」猜个八九不离十。</div>

## 🛠 跟我做

### 先认地图：百位数字定大类 <span class="csf-b csf-core">必读</span>

状态码是个三位数。<strong>看第一位（百位）就能定性</strong>，这是整讲最值钱的一句话：

<div class="csf-legend">1xx —— 「收到了，你继续」：信息类，日常基本看不到，不用管。<br>2xx —— 「成功」：最想看到的，比如 200。<br>3xx —— 「东西不在这，去别处」：重定向，让你换个地址再要一次。<br>4xx —— 「<strong>你</strong>请求得有问题」：客户端的锅，比如地址打错了、没权限。<br>5xx —— 「<strong>我</strong>这边出毛病了」：服务端的锅，服务器自己崩了或转不动。</div>

记不住没关系，记一个对子就够用：<strong>4 开头看自己，5 开头看服务器</strong>。这一个对子，能帮你在 90% 的场景里第一时间把锅甩对方向。

<div class="csf-why">为什么这么分类不是拍脑袋？因为 HTTP 是「请求—响应」的一问一答。一次失败，要么是「问的人问错了」（4xx），要么是「答的人答不上来」（5xx），要么是「答的人说你该去别处问」（3xx）。这个划分对应的就是一次对话里责任落在谁身上，所以它天然好用。</div>

### 第一练：亲手造一个 404 <span class="csf-b csf-key">重点</span>

404 是全网最有名的状态码，意思是「你要的这个东西，我这儿没有」。我们故意去要一个不存在的页面，把它逼出来。

先打开你电脑的<strong>终端</strong>（就是前面几讲里装好、认过门的那个「黑框框」，Mac 上叫「终端 / Terminal」，Windows 上可以用「PowerShell」）。我们这一讲一直会用到一个叫 <code>curl</code> 的小工具——它是个命令行里的「网络请求小助手」，你在终端里敲一行 <code>curl 加网址</code>，它就替你去访问那个网址、再把服务器的回应原样打印出来给你看。

先猜后做：你觉得下面这条命令，返回的第一行数字会是几？先在心里写下你的答案，再把下面这行粘进终端、敲回车。

```bash
# -I 表示「只要响应头，不要正文」
# （这种只问头、不要正文的请求，有个专门名字叫 HEAD 请求，名字记不住没关系）
# 我们故意访问一个明显不存在的路径
curl -I https://httpbin.org/status/404
```

<div class="csf-note">这里用到了 <code>httpbin.org</code> —— 一个专门给人练手的网站，你让它返回几它就返回几。<code>/status/404</code> 就是「请给我一个 404」。它是练状态码的绝佳陪练，下面还会反复用到它。</div>

你应该会看到类似这样的开头（数字之后的文字叫「原因短语」，给人看的，程序一般只认数字）：

```
HTTP/2 404
date: ...
content-type: text/html; charset=utf-8
...
```

开头那个 <code>HTTP/2</code> 是这次用的「协议版本」（你可以理解成这次对话用的是 HTTP 的第 2 版），这一讲不用管它，盯住后面的数字就行。看到那个 <code>404</code> 了吗？这就是你亲手造出来的「客户端的锅」。注意：是「你要的路径不对」，所以归到 4xx——但请记住一个关键细节：<strong>能返回 404，恰恰说明服务器是活着的</strong>。它清醒地告诉你「没这个东西」，这跟服务器整个崩掉（5xx）是两码事。

再造一个对照组，把 5xx 也亲手摸一下：

```bash
curl -I https://httpbin.org/status/500
```

这次第一行是 <code>500</code>。同样是「出错」，但 500 是<strong>服务器自己内部出岔子了</strong>——你这边啥都没做错。感受一下这两条命令的区别：404 是「你找错门」，500 是「人家屋里着火了」。锅的归属，天差地别。

### 第二练：跟踪一条重定向链（3xx） <span class="csf-b csf-key">重点</span>

3xx 是「这东西不在这，去 XX 地址要」。最常见的是 301（永久搬家）和 302（临时搬家）。浏览器收到 3xx，会自动再去新地址要一次，整个过程飞快，你平时根本察觉不到。我们用 curl 把这个「暗中跳转」摊在阳光下。

关键是 <code>-L</code> 参数：它让 curl <strong>跟随</strong>重定向（Location 头指向的新地址）。配合 <code>-I</code>，就能看到一整条跳转链。

先猜后做：访问一个会跳转的地址，你猜会看到<strong>几段</strong>响应头？

```bash
# /redirect/2 表示「连续跳转 2 次后到达终点」
curl -IL https://httpbin.org/redirect/2
```

你会看到<strong>三段</strong>响应头依次打印出来，大致是：

```
HTTP/2 302                          ← 第 1 次：服务器说「去别处」
location: /relative-redirect/1      ← 它告诉你新地址在哪
...

HTTP/2 302                          ← 第 2 次：又跳一下
location: /get
...

HTTP/2 200                          ← 终于到站，成功！
content-type: application/json
...
```

看明白这条链没有？每一个 302 都配着一个 <code>location</code> 头告诉你「下一站在哪」，curl 顺着 location 一路追，直到撞上 200 才停。<strong>301/302 本身不是错误</strong>，它是「正常引路」。真正的内容在最后那个 200 里。

<details class="csf-fold"><summary>301 和 302 到底差在哪<span class="csf-b csf-skim">细究 · 可跳读</span></summary>
<div>简单说：<strong>301 = 永久搬家，302 = 临时搬家</strong>。<br>301 告诉浏览器和搜索引擎「这地址永远换了，以后直接记新的，别再来问旧的」，所以浏览器可能会把这个跳转<strong>缓存</strong>下来。常见于网站从 http 升级到 https、或老域名换新域名。<br>302（以及更精确的 307）是「这次先去那边，但旧地址还有效，下次可能还从这儿走」，浏览器不会长期记住。常见于「未登录访问个人主页 → 临时跳到登录页」这种场景。<br>对初学排障来说，先分清「这是个跳转、不是错误」就够了，301/302 的细微差别等你真遇到 SEO（搜索引擎优化，简单说就是让你的网页更容易被百度、谷歌这些搜索引擎搜到）或登录跳转问题时再深究不迟。</div>
</details>

### 第三练：看清返回的是什么——Content-Type <span class="csf-b csf-core">必读</span>

状态码说「成功没成功」，而响应头说「我给你的这坨东西，到底是什么、该怎么处理」。其中最该认识的就是 <code>Content-Type</code>，它告诉浏览器：这是网页、是图片、还是一坨数据？

下面这条命令访问的是一个「接口」。「接口」你可以先理解成：一个专门用来要数据、而不是给人看的网址——浏览器里打开网址通常是给人看的网页，而接口返回的往往是一坨给程序读的数据。

```bash
# 访问一个返回 JSON 数据的接口，只看头
curl -I https://httpbin.org/json
```

在输出里找这一行：

```
content-type: application/json
```

<code>application/json</code> 的意思是「我返回的是 JSON 格式的数据」（一种程序之间传数据的通用格式，后面课程会专门讲）。对比一下，如果你访问一个普通网页，这一行通常是 <code>text/html</code>（网页）；访问一张图片则可能是 <code>image/png</code>。浏览器正是靠这一行决定：是把内容画成页面，还是当图片显示，还是直接下载。

<div class="csf-why">为什么 Content-Type 这么重要？因为同样一串字节，浏览器不知道该拿它当什么。声明成 <code>text/html</code> 它就当网页渲染，声明成 <code>text/plain</code> 它就当纯文本原样显示。前后端联调（写网页的「前端」和写服务器的「后端」把各自的代码接到一起、互相调试的那个阶段）时，有一类高频 bug 就是「后端返回的明明是 JSON，Content-Type 却写成了 text/html」，导致前端解析失败——这时候你打开响应头一看 Content-Type 对不对，立刻能定位问题。学会看这一行，以后碰到这类问题你就能自己先判断个大概，而不用干等别人。</div>

### 第四练（动手记录） <span class="csf-b csf-key">重点</span>

今天接下来上网，无论是刷网页还是用 App，打开浏览器的 DevTools（按 F12，切到 Network 面板，第07讲我们已经认过门），<strong>把你遇到的每一个状态码记下来</strong>，列一张小表：

```
我今天遇到的状态码（示例，自己填真实的）：
200  打开博客首页              → 2xx 成功
304  刷新页面，图片没变        → 3xx 缓存命中（没出错！）
404  点了个失效的旧链接        → 4xx 我这边地址不对
302  没登录点了「我的」        → 3xx 被引到登录页
```

记满 8～10 条，你对「状态码分布」的体感会比读十遍文章都强。这一步别让 AI 替你编——必须是你<strong>真实环境里真实抓到的</strong>，因为 AI 看不到你的屏幕。

## 💡 自己复述一遍

合上屏幕，用一句话回答：<strong>4 开头和 5 开头的状态码，分别意味着锅大概在谁那边？</strong>

（提示：4 开头看自己——客户端请求有问题；5 开头看服务器——服务端自己出毛病了。能脱口而出，这一讲的核心就拿下了。）

## 🔧 翻车现场

<div class="csf-note"><strong>翻车一：把 4xx 和 5xx 搞反，甩错锅。</strong><br>这是新手最常见、也最伤团队协作的错。看到接口报错就喊「后端崩了」，结果一看是 <code>403</code>（你没带登录凭证）或 <code>404</code>（你接口地址拼错了）——这是 4xx，是<strong>你自己</strong>的锅，跟后端没关系。反过来，看到 <code>500</code> 还在自己代码里翻来覆去找半天，其实是服务器内部炸了，得找后端。<strong>解法</strong>：失败第一反应是看百位数字。4 开头先查自己（地址、参数、权限、有没有登录），5 开头再去找服务端。</div>

<div class="csf-note"><strong>翻车二：以为 304 是出错了。</strong><br>304 的意思是「你要的东西没变化，用你本地缓存的那份就行，我不重发了」。它是<strong>好事</strong>——省流量、加载快。很多新手在 Network 面板看到一片 304 以为页面坏了，其实恰恰说明缓存在正常工作。<strong>解法</strong>：记住 304 = 「没变，用缓存」，是省事不是出错。真要看服务器重新发的完整内容，按「强制刷新」（Mac 是 Cmd+Shift+R，Windows 是 Ctrl+F5）绕过缓存即可。</div>

<div class="csf-note"><strong>翻车三：把 3xx 当失败。</strong><br>看到 301/302 就以为请求挂了。其实它只是「换个地址再要一次」的引路标，浏览器会自动跟过去。用 curl 时如果没加 <code>-L</code>，你会只看到一个 302「就停住了」，误以为没结果——加上 <code>-L</code> 让它跟到底，就能看到最后的 200。</div>

## ✅ 自检三问

1. 朋友说「我这接口 500 了」，你能不能立刻判断该先去查客户端还是服务端？为什么？
2. 你在 Network 面板看到一个请求是 <code>304</code>，这是出错了吗？它在帮你做什么？
3. 用 curl 跟踪重定向，必须加哪个参数才能看到最后到站的 200？只加 <code>-I</code> 不加它会怎样？

<details class="csf-fold"><summary>对一下答案<span class="csf-b csf-skim">点开看</span></summary>
<div>1. 先查<strong>服务端</strong>。500 是 5xx，意味着服务器内部出错，跟你的请求姿势无关（你的请求它收到了、只是它自己处理崩了）。<br>2. 不是出错，是<strong>好事</strong>。304 表示「内容没变，用你本地缓存」，省流量、加载更快，说明缓存机制正常工作。<br>3. 必须加 <code>-L</code>（跟随重定向）。只加 <code>-I</code> 的话，curl 看到第一个 302 就停了，只给你看到「跳转指令」而看不到最终内容。</div>
</details>

## 🚀 挑战

给你一个不靠 httpbin、用真实网站练手的小任务：

1. 用 <code>curl -IL</code> 跟踪一个你常用的网站首页（比如 <code>curl -IL http://github.com</code>，故意用 <code>http</code> 而不是 <code>https</code>）。观察它是不是先返回一个 3xx 把你从 http 跳到 https，最后才 200。把整条链抄下来，标出每一段是「跳转」还是「到站」。
2. 在 DevTools 的 Network 面板里，随便刷新一个页面，<strong>找出至少一个 304</strong>，点开它看看请求头里有没有 <code>If-None-Match</code> 或 <code>If-Modified-Since</code>（这是浏览器在问「我手里这份还新鲜吗」）。
3. 想想看：如果一个接口该返回 JSON，前端却报「解析失败」，你会先去看响应头里的哪一行来判断？（答案在第三练里）

这三步全程自己敲、自己看，别把命令丢给 AI 让它告诉你结果——它看不到你的网络环境，跑出来的也不是你的链路。亲手跑过，状态码才真正长在你脑子里。

## 📦 复制带走

<div class="csf-card"><strong>① 百位定大类，一句话甩对锅：</strong>2xx 成功、3xx 重定向（去别处）、4xx 客户端的锅（看自己）、5xx 服务端的锅（看服务器）。失败第一反应：看第一位数字。</div>

<div class="csf-card"><strong>② 别冤枉这几个：</strong>301/302 是「引路」不是错误；304 是「缓存命中」是好事；404 说明服务器活着、只是没你要的东西；500/502 才是服务器那边真出了问题。</div>

<div class="csf-card"><strong>③ 响应头里先认 Content-Type：</strong>它声明返回的是网页（text/html）、数据（application/json）还是图片（image/png）。前后端联调「解析失败」类 bug，常常就是它写错了。</div>

<div class="csf-card"><strong>④ 排障三件套已上手：</strong><code>curl -I</code> 看响应头、<code>curl -IL</code> 跟重定向链、DevTools Network 面板看真实状态码。下一讲《Cookie 与 Session》，我们解决一个新谜题：HTTP 每次请求都是「失忆」的，那它到底怎么记住你已经登录了？</div>
