---
title: "《从 URL 到页面显示》第 07 讲 · 响应处理与导航提交"
date: 2026-08-21 15:00:00
tags: [浏览器, 站点隔离, 导航提交, Chromium, 校招, 面试]
categories: [面试]
toc: true
visibility: public
---

<style>
.bc-sec{display:flex;align-items:center;gap:12px;margin:42px 0 4px;font-size:15px;letter-spacing:2px;color:#3f5d7e;font-weight:800}
.bc-sec::before{content:"";width:4px;height:18px;background:#3f5d7e;border-radius:2px}
.bc-sec.lead::before{background:#b73a2c}.bc-sec.lead{color:#b73a2c}
.bc-lead{margin:14px 0 22px;padding:16px 18px;line-height:1.85;border-radius:10px;background:rgba(183,58,44,.08);border-left:4px solid #b73a2c;font-size:15px}
.bc-call{margin:18px 0;padding:12px 16px 12px 16px;line-height:1.8;border-radius:8px;background:var(--wash);border-left:4px solid var(--line)}
.bc-call .bc-tag{display:inline-block;font-size:12px;font-weight:800;padding:1px 9px;border-radius:999px;margin-right:8px;color:#fff}
.bc-branch{background:rgba(63,93,126,.07);border-left-color:#3f5d7e}.bc-branch .bc-tag{background:#3f5d7e}
.bc-impl{background:rgba(105,114,125,.09);border-left-color:#69727d}.bc-impl .bc-tag{background:#69727d}
.bc-bonus{background:rgba(47,118,95,.09);border-left-color:#2f765f}.bc-bonus .bc-tag{background:#2f765f}
.bc-source{background:rgba(155,102,50,.09);border-left-color:#9b6632}.bc-source .bc-tag{background:#9b6632}
.bc-platform{background:rgba(120,80,140,.09);border-left-color:#78508c}.bc-platform .bc-tag{background:#78508c}
.bc-refs{margin:34px 0 0;padding-top:14px;border-top:1px solid var(--line);font-size:13px;color:var(--muted);line-height:1.9}
.bc-refs b{color:var(--text)}
.bc-cite{font-size:11px;vertical-align:super;color:#3f5d7e;text-decoration:none;font-weight:700;margin:0 1px}
.bc-nav{display:flex;justify-content:space-between;gap:12px;margin:30px 0 0}
.bc-nav a{flex:1;padding:12px 15px;border:1px solid var(--line);border-radius:10px;text-decoration:none;background:var(--panel);font-size:14px}
.bc-nav a:hover{border-color:#3f5d7e}
.bc-nav .r{text-align:right}
html[data-user-color-scheme="dark"] .bc-lead{background:rgba(183,58,44,.2)}
</style>

<p class="bc-sec lead">一句话结论</p>

响应头一到，浏览器进程先做一个判断：这东西是拿去渲染，还是拿去下载？确定要渲染后，它得挑一个渲染进程来承载，把响应体那条数据流接过去，然后在某个精确的时刻正式「提交」这次导航——旧页面在这一刻被换掉、地址栏更新、安全锁图标刷新。这一节点的产出，是一个已经拿到响应流、准备开始解析的渲染进程。

<p class="bc-sec">理解原理</p>

### 从上一节点的输出开始：响应头到了，但还没人渲染

节点六交出的是一个 HTTP 响应，状态行和响应头已经到手，响应体正在流过来。但这条流此刻还握在**浏览器进程的网络服务**手里。网络服务只负责搬数据，它不会解析 HTML、不会执行 JavaScript——渲染是渲染进程（Renderer Process）的事。所以在真正渲染之前，浏览器进程要先回答三个问题：这内容该怎么处理？交给谁处理？什么时候算数？

### 第一步：这是拿去渲染，还是拿去下载

浏览器拿到响应头，第一件事是看 `Content-Type`。`text/html` 意味着「这是一篇要渲染的文档」，走渲染路径；`application/pdf`、`image/png` 之类交给对应的查看器；而如果响应带了 `Content-Disposition: attachment`，或者是浏览器压根不能内联展示的类型，那这次导航就地转成一次**下载**——注意，下载不进入渲染流程，页面根本不会变。

这里有个安全细节：浏览器不会完全轻信服务器声明的 `Content-Type`，还会结合内容做**MIME 类型嗅探**做交叉判断。但嗅探本身可能被利用（把恶意脚本伪装成图片），所以服务器可以用 `X-Content-Type-Options: nosniff` 明确关掉嗅探。主线上假设这是一篇正常的 `text/html`，继续往下。

### 第二步：谁来渲染——进程模型登场

确定要渲染后，浏览器进程要挑一个渲染进程。这里正是**站点隔离（Site Isolation）** 起作用的地方：Chromium 的原则是「不同站点的文档放进不同的渲染进程」，这样即使一个渲染进程被攻破，也拿不到别的站点的数据 <a class="bc-cite" href="https://www.chromium.org/Home/chromium-security/site-isolation/" target="_blank" rel="noopener">[1]</a>。

所以浏览器进程会判断：这次导航的目标站点，和当前页面是不是同一个站点？

- 跨站点导航（比如从 `a.com` 点到 `b.com`），通常要换一个新的渲染进程，甚至提前就把进程准备好了。
- 同站点导航，可能复用当前进程。

<div class="bc-call bc-platform"><span class="bc-tag">平台差异</span><strong>「站点」不等于「域名」</strong><br>站点隔离里的「站点」指的是 eTLD+1（有效顶级域 + 一级），比如 `mail.example.com` 和 `www.example.com` 属于同一个站点 `example.com`。它和后面 Web 安全分支要讲的「同源（origin）」不是一个粒度——同源要求协议、主机、端口全一致，比站点严格得多。别把这两个概念混用。</div>

### 第三步：把响应流接进渲染进程

选好渲染进程后，得把网络服务手里那条正在流入的响应体交过去。节点四和节点六都埋过伏笔：在 Chromium 里，这靠 **Mojo 的数据管道（Data Pipe）** 完成——网络服务持有写端，渲染进程持有读端，响应体像水流一样从浏览器进程流进渲染进程。这样渲染进程能**边接收边解析**，不用等整篇 HTML 下载完，这也是下一节点流式解析的基础。

### 第四步：导航提交——新旧交替的那一个精确瞬间

现在到了最关键的概念：**导航提交（commit）**。

在提交之前，屏幕上显示的还是**旧页面**。你输入了新网址、请求也发出去了、响应头甚至都到了，但只要还没提交，旧页面就一直在——这就是为什么点了链接后页面会「愣一下」才跳。浏览器这么设计是有意的：万一新导航失败了（比如 DNS 解析不了、服务器 5xx），旧页面还在，体验上不至于变成一片空白。

**提交**是渲染进程确认「我已经准备好接收并展示这个新文档」后，浏览器进程正式切换的那一刻。这一刻同时发生几件事：

- 旧文档被丢弃，新文档正式成为当前页面。
- **地址栏更新**成新 URL——地址栏是在提交时才变的，不是请求发出时。
- **安全指示器**（那把锁）根据新页面的 HTTPS 状态刷新。
- 浏览历史里记下这一条。

<div class="bc-call bc-bonus"><span class="bc-tag">加分细节</span><strong>地址栏为什么在「提交」时才更新</strong><br>如果地址栏在请求一发出就立刻变成新网址，而这次导航最终失败或被重定向到别处，地址栏显示的就会和实际页面对不上——这正是一类地址栏欺骗（URL spoofing）漏洞的来源。把地址栏更新和「提交」绑定，能保证「地址栏显示的，就是当前真正在渲染的文档」。能答到这一层，说明你理解了提交这个时机点的安全意义。</div>

<div class="bc-call bc-branch"><span class="bc-tag">旁支</span><strong>单页应用的「软导航」没有这一整套</strong><br>上面讲的是浏览器发起的真实导航（换文档）。而单页应用（SPA）里用 `history.pushState` 改地址栏、用 JavaScript 换内容，文档根本没换、渲染进程也没换，走的完全是另一条路。它复用同一个文档，只是修改 DOM 和地址栏，不触发这一整套「选进程、接流、提交」的流程。这也是为什么 SPA 切页比真实导航快。</div>

### 汇总：这一节点交出去的是什么

浏览器进程根据响应头判断要渲染、按站点隔离挑好渲染进程、用数据管道把响应流接过去，然后在渲染进程就绪的那一刻正式提交导航——地址栏和安全锁在此刻更新，旧页面退场。产出是一个**已经握着响应流、即将开始解析 HTML 的渲染进程。**

从这里开始，主角从浏览器进程切换到渲染进程。接下来发生的一切——解析、样式、布局、绘制——都在这个渲染进程里进行。

<p class="bc-sec">主线整理</p>

```text
响应头到达（网络服务持有响应流）
        ↓ 先判断：渲染还是下载
看 Content-Type / Content-Disposition（+ nosniff 防嗅探）
        ↓ 是 text/html，走渲染
按站点隔离挑渲染进程（跨站换进程 / 同站可复用）
        ↓ 进程选定
用 Mojo 数据管道把响应体流接进渲染进程（可边收边解析）
        ↓ 渲染进程就绪
提交导航：旧页面退场 + 地址栏更新 + 安全锁刷新 + 记历史
        ↓
产出：一个握着响应流、准备解析 HTML 的渲染进程
```

<p class="bc-sec">设计取舍</p>

**提交前保留旧页面**，用「多等一会儿、旧页面继续显示」换来了导航失败时的稳态——不会一点链接就白屏。代价是跨页跳转会有肉眼可见的延迟感，但比错误的空白页值得。

**站点隔离把不同站点拆进不同进程**，用更多的进程数和内存开销，换来了一道硬性的安全边界：一个渲染进程被攻破也偷不到别站点的数据。代价是内存占用明显上升，这也是 Chrome 常被说「吃内存」的一大来源。

**地址栏与提交时机绑定**，用「晚一点更新地址栏」换来了「地址栏永远和真实文档一致」的安全保证，堵住了一类地址栏欺骗。

<p class="bc-sec">面试回答</p>

响应头到了之后，还在浏览器进程手里，得先决定怎么处理。看 Content-Type：text/html 就渲染，带 Content-Disposition attachment 或不能内联的类型就转成下载、页面不变；浏览器还会做 MIME 嗅探做交叉判断，服务器可以用 nosniff 关掉。确定渲染后，按站点隔离挑渲染进程——跨站点导航一般换新进程，同站点可能复用，这样一个进程被攻破也拿不到别站点数据。然后用 Mojo 数据管道把响应体流接进渲染进程，让它能边收边解析。最关键的是导航提交：提交之前屏幕上还是旧页面，万一新导航失败旧页面还在、不会白屏；等渲染进程就绪、正式提交的那一刻，旧文档退场、地址栏更新成新 URL、安全锁刷新、历史记一条。地址栏特意在提交时才更新，是为了保证地址栏显示的永远是当前真正在渲染的文档，避免地址栏欺骗。提交之后，主角就从浏览器进程切到渲染进程，开始解析 HTML。

<p class="bc-sec">常见追问</p>

**导航提交（commit）到底是什么时刻？**（校招进阶，答出来很加分）
是浏览器进程正式用新文档替换旧文档的那一刻。在此之前屏幕显示的还是旧页面，之后地址栏、安全锁、历史记录都随新文档更新。它是「导航从进行中变成生效」的分界点。

**为什么地址栏不在请求发出时就更新？**（校招进阶）
因为请求可能失败或被重定向，若提前更新，地址栏会和实际页面不一致，产生地址栏欺骗风险。绑定到提交时刻，能保证地址栏显示的就是当前真正渲染的文档。

**站点隔离里的「站点」和「同源」有什么区别？**（校招常问，易混）
站点是 eTLD+1（如 `example.com`），同一站点下的不同子域算一个站点。同源要求协议、主机、端口三者全一致，粒度比站点严得多。站点隔离用来分配进程，同源策略用来限制脚本访问，两者目的不同。

**为什么跨站点导航要换渲染进程？**（校招常问）
为了安全边界。把不同站点放进不同进程，即使一个渲染进程被恶意页面攻破，它的内存里也没有别的站点的数据可偷。代价是进程和内存开销上升。

**MIME 嗅探是什么，有什么风险？**（回答出来加分）
浏览器不完全信任服务器声明的 Content-Type，会结合实际内容推断类型。风险是攻击者可能把脚本伪装成图片等，诱导浏览器按脚本执行；服务器用 `X-Content-Type-Options: nosniff` 可以关掉嗅探来防这类攻击。

**单页应用切页和真实导航有什么不同？**（通常不需要主动展开）
SPA 用 pushState 改地址栏、用 JS 改 DOM，文档和渲染进程都没换，不走「选进程、接流、提交」这套流程，所以更快。真实导航才会换文档、可能换进程、并触发一次完整提交。

---

**本节点产出**：一个已完成导航提交的渲染进程，握着正在流入的响应体，地址栏与安全锁已更新。

**交给谁**：节点八 · HTML 解析与子资源发现。

**下一节点为什么因此开始**：响应流现在在渲染进程里，而且是边收边到的。渲染进程要做的第一件事，就是把这串 HTML 字节解析成一棵能被后续样式和布局使用的树（DOM），并在解析过程中发现页面还依赖哪些 CSS、JS、图片等子资源、尽早把它们拉起来。这就是节点八。


<div class="bc-refs"><b>参考来源</b><br>[1] <a href="https://www.chromium.org/Home/chromium-security/site-isolation/" target="_blank" rel="noopener">https://www.chromium.org/Home/chromium-security/site-isolation/</a></div>

<div class="bc-nav"><a href="/2026/08/21/browser-course-06/">← 06 · HTTP 请求与响应</a><a class="r" href="/2026/08/21/browser-course-08/">08 · HTML 解析与子资源发现 →</a></div>
