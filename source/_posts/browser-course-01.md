---
title: "《从 URL 到页面显示》第 01 讲 · 用户输入与导航创建"
date: 2026-08-21 09:00:00
tags: [浏览器, Chromium, 站点隔离, Mojo, 校招, 面试]
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

这一节点把用户在地址栏敲下的一串字符，变成一次结构化的导航，并最终交给网络服务一份明确的加载任务。在这份任务被交出去之前，网络世界里还什么都没发生。

<p class="bc-sec">理解原理</p>

### 从总纲的输出开始：我们手里只有一张字符串和一个「回车」

上一章交给这一节的，是一张标好输入输出的节点地图，以及一个尚未被处理的原始事件——用户在地址栏里输入了内容，按下了回车。此刻浏览器手上只有一串字符，比如 `github.com`、`如何准备校招`、或者 `localhost:8080/api`。这串字符还不是一次导航，也还不是一个网络请求。这一节要做的，就是把它一步步变成网络服务能执行的东西。

要理解后面每一步，得先分清一件容易被忽略的事：**你正在输入的地址栏，本身不是网页的一部分。**

### 地址栏为什么属于浏览器，而不属于网页

地址栏、前进后退按钮、标签页、菜单，这些都由**浏览器进程（Browser Process）**绘制和控制。浏览器进程是整个浏览器的中枢，负责协调所有其他进程、管理界面、接收操作系统传来的输入，并最终把网页的图像放到屏幕上 <a class="bc-cite" href="https://www.chromium.org/developers/how-tos/trace-event-profiling-tool/trace-event-reading/" target="_blank" rel="noopener">[1]</a>。

网页内容则运行在另一类进程里——**渲染进程（Renderer Process）**。它负责解析 HTML、执行 JavaScript、计算样式和布局，也就是真正「画出网页」的地方。

这个边界不是为了整洁而人为划出来的，它是一条安全防线。网页来自互联网，随时可能包含恶意代码。如果地址栏和网页跑在同一个进程里，一个被攻破的网页就有机会伪造地址栏、读取你在别的标签页里的数据。所以浏览器把不可信的网页内容关进权限受限、彼此隔离的渲染进程，而把界面和最高权限的操作留在浏览器进程里。这条边界会贯穿后面所有节点：**凡是涉及信任和权限的决定，最终都由浏览器进程说了算。**

理解了这条边界，就能回答一个常见误区——为什么地址栏里的输入要由浏览器进程处理，而不是交给当前网页。因为当前网页是不可信的、随时会被替换的渲染进程；而输入一个新地址意味着要离开它、可能去往一个完全不同的站点。这个决定必须由更高权限、更稳定的浏览器进程来做。

于是这串字符落进了浏览器进程手里。它的第一件事，是搞清楚这到底是什么。

### 地址栏怎样判断这是网址、搜索词还是别的东西

浏览器进程拿到字符串后，会把它交给地址栏背后的候选生成逻辑，同时判断它更像哪一类：

- 像一个网址（含有点号和合法域名结构，或带协议前缀），就当作 URL 处理。
- 不像网址（比如一句中文、几个带空格的词），就交给默认搜索引擎，拼成一条搜索 URL。
- 介于两者之间（比如单个词 `router`，既可能是内网主机名也可能是搜索词），浏览器会保留多个候选，并可能同时发起一次后台探测：把它当主机名试着解析一下，看能不能连通。

这里已经埋下了对后面节点的第一个连接点：地址栏的「猜测」有时需要提前解析一次域名，而解析这件事正是节点二的主题。但在主线上，我们固定一个最普通的场景：**用户输入的是一个明确的网址，浏览器判定它是 URL。**

<div class="bc-call bc-branch"><span class="bc-tag">旁支</span><strong>搜索词分支</strong><br>如果输入被判定为搜索词，浏览器会用默认搜索引擎的模板拼出一条搜索结果页的 URL，之后的流程和访问任何普通网页完全一样。分支只在「拼 URL」这一步不同，拼好之后重新汇入主线。</div>

### 一个 URL 在被使用前，要先被规范化

判定成 URL 之后，这串字符还不能直接拿去用，因为人写的地址往往不完整、不规范。浏览器会先按标准把它整理成一个结构清晰的 URL。这一步叫**规范化（normalization）**，做的事情包括：

- 补全缺失的协议：`github.com` 被补成 `https://github.com`。
- 把主机名转成小写，把国际化域名（含中文、非拉丁字符）按标准编码成 ASCII 形式（这套编码叫 Punycode）。
- 整理路径里的 `.`、`..`，处理多余的斜杠。
- 对路径、查询参数里的特殊字符做百分号编码。

规范化之后，这个 URL 被拆解成几个明确的部分：协议（scheme）、主机（host）、端口（port）、路径（path）、查询串（query）、片段（fragment，也就是 `#` 后面的部分）。这些部分马上就要被后面的流程分别用到——主机交给解析，协议决定要不要加密，端口决定连哪里，片段则通常不参与网络请求。

拿到一个干净、拆解好的 URL 之后，浏览器进程才有资格说：我要发起一次导航了。

### 什么是「导航」，它和「网络请求」不是一回事

**导航（navigation）**指的是浏览器把某个标签页或框架从当前文档切换到另一个文档的整个过程。它是一个比「发一个网络请求」大得多的概念。一次导航可能包含零个、一个或多个网络请求，也可能一个都不发。

这个区分很重要，因为它解释了后面很多行为：

- 访问 `https://github.com` 是一次导航，它会触发网络请求。
- 点击页面里的 `#section2` 锚点，也是一次导航，但它只是滚动到页面内的某个位置，**不发任何网络请求**。
- 从浏览器的前进后退历史里回到上一页，可能是一次导航，但如果命中了往返缓存（后面节点会讲），同样不发网络请求。

所以「导航」是浏览器内部的状态切换动作，「网络请求」只是它在需要时才使用的手段之一。把两者分开，才能理解「为什么不是所有导航都需要网络」。

浏览器进程为这次导航创建一个内部对象来跟踪它的整个生命周期，在 Chromium 里这个对象承担导航的状态机角色。

<div class="bc-call bc-impl"><span class="bc-tag">实现细节</span><strong>NavigationRequest</strong><br>Chromium 用 `NavigationRequest` 来表示和驱动一次导航的完整生命周期，从开始、可能的重定向，到最终提交。这个源码名称不必进入基础主线，知道「有一个对象在浏览器进程里全程跟踪这次导航」就够了。</div>

### 导航正式开始前，旧页面有权拦一道

导航对象创建后，并不能立刻头也不回地离开当前页面。当前页面可能有未保存的表单、正在进行的编辑。所以在真正发起网络请求之前，浏览器会先给旧文档一个机会：触发它的 `beforeunload` 事件。

如果旧页面注册了 `beforeunload` 处理函数（常见于「你有未保存的更改，确定要离开吗」这种提示），浏览器会弹出确认框。用户选择留下，这次导航就此中止，网络请求根本不会发出；用户选择离开，导航才继续。

这一步之所以放在网络请求之前，是因为它可能直接取消整次导航——先问清楚要不要走，再决定要不要拨号。Chromium 的导航观测接口里，「开始导航」这个时间点正是定义在「执行完 `beforeunload` 处理函数之后、发出首个网络请求之前」 <a class="bc-cite" href="https://netsekure.org/" target="_blank" rel="noopener">[2]</a>。

<div class="bc-call bc-branch"><span class="bc-tag">旁支</span><strong>不需要网络的导航</strong><br>如果这次导航是页面内锚点跳转，或是命中往返缓存的前进后退，流程走到这里就基本结束了：浏览器直接更新地址栏和历史、滚动或恢复页面，不进入后面的网络节点。主线继续往下走的前提是——这是一次真正需要去网络上取文档的导航。</div>

### 为什么在这里就要决定「谁来渲染」，以及进程模型的真相

导航确认要继续、要走网络了，浏览器进程还要盘算一件事：这次导航的目标文档，将来由哪个渲染进程来承载。

这就牵出一个被广泛误传的说法——「一个标签页对应一个渲染进程」。这句话不准确。Chromium 的进程分配依据不是标签页，而是**站点（site）**。它默认采用「按站点实例分配进程」的模型：来自同一个站点的、能互相脚本访问的一组页面，会被归到同一个 SiteInstance，每个 SiteInstance 对应一个渲染进程 <a class="bc-cite" href="https://www.chromium.org/developers/design-documents/site-isolation/" target="_blank" rel="noopener">[3]</a>。

这带来几个和「一标签页一进程」完全不同的结论：

- 一个标签页在其生命周期里可能从一个站点导航到另一个站点，于是它先后由不同的渲染进程承载。
- 一个页面里如果嵌入了来自其他站点的 `iframe`，这个 `iframe` 会被放进另一个独立的渲染进程——这套机制叫跨进程 iframe（Out-of-Process iframes） <a class="bc-cite" href="https://www.chromium.org/developers/design-documents/oop-iframes/" target="_blank" rel="noopener">[4]</a>。所以「一个标签页」里可能同时有多个渲染进程在工作。
- 反过来，同属一个站点的多个标签页，在某些模型下可能共享同一个渲染进程。

这套按站点隔离的设计叫**站点隔离（Site Isolation）**，它的核心目的是安全：把不同站点关进不同进程，一个站点里的漏洞就读不到另一个站点的内存，跨站点的攻击（包括利用 CPU 侧信道的 Spectre 类攻击）被进程边界挡住 <a class="bc-cite" href="https://www.chromium.org/Home/chromium-security/site-isolation/" target="_blank" rel="noopener">[5]</a>。

<div class="bc-call bc-impl"><span class="bc-tag">实现细节</span><strong>同站不同子域可能共享进程</strong><br>Chromium 的隔离粒度大致是「可注册域 + 协议」（常说的 eTLD+1）。`mail.google.com` 和 `docs.google.com` 属于同一个站点，可能共享渲染进程；而 `github.com` 和 `google.com` 一定分开。所以准确说法是「按站点」，不是「按域名」，更不是「按标签页」。</div>

<div class="bc-call bc-platform"><span class="bc-tag">平台差异</span><strong>移动端的取舍</strong><br>站点隔离在桌面端对所有站点开启，但在内存受限的 Android 上，默认只对一部分站点（比如用户登录过、输入过密码的站点）启用，以控制进程数量带来的内存开销 <a class="bc-cite" href="https://www.chromium.org/Home/chromium-security/site-isolation/" target="_blank" rel="noopener">[5]</a>。这正是「Chromium 实现」和「平台差异」两层需要分开看的例子。</div>

至于为什么用「进程」来隔离、而不是用「线程」——这正是进程和线程在这里各自解决的问题。进程之间内存空间彼此独立，一个进程崩溃或被攻破，不会直接波及另一个进程的内存，所以浏览器用**进程边界来做安全和稳定性的隔离**：不可信的、来自不同站点的网页各自关在独立进程里。而在单个进程内部，浏览器又用**多个线程来做并发**：渲染进程里有主线程跑 JavaScript 和布局、有合成线程管画面、有栅格线程转像素，它们共享同一份内存、协作完成一个页面的渲染。一句话：**进程负责「隔离」，线程负责「并发」。**

现在浏览器进程已经决定了：这是一次要走网络的导航，将来大概由哪个（哪类）渲染进程承载也已心里有数。接下来它要真正去取资源了。但取资源这件事，它自己不做。

### 浏览器进程不自己上网，它把活儿派给网络服务

在现代 Chromium 里，实际的网络工作——建立连接、发请求、收响应——由**网络服务（Network Service）**负责。它是一个独立的服务模块，通常运行在自己的进程里，与浏览器进程分开。

这里要修正一个常见的粗糙说法：网络服务不能简单等同于「网络进程」。它是一个逻辑上的服务，默认跑在独立进程里以获得隔离和稳定性的好处，但在某些平台或配置下（比如资源紧张时），它也可能被放进浏览器进程内运行。所以准确的说法是「网络服务」这个逻辑组件，而不是绑定死一个叫「网络进程」的东西。

把网络单独拆成服务，好处和站点隔离一脉相承：网络栈要处理来自互联网的、格式复杂甚至恶意的数据，让它跑在受限的独立进程里，即使被攻破或崩溃，也不至于拖垮整个浏览器；崩了还能单独重启。

问题随之而来：浏览器进程和网络服务是两个不同的进程，它们怎么把一份「加载任务」从一边传到另一边？

### 两个进程之间怎么说话：IPC 与 Mojo

不同进程之间不能直接读写对方的内存（这正是进程隔离的意义），要通信就得走**进程间通信（IPC，Inter-Process Communication）**。IPC 是操作系统层面的通用概念，泛指一切让不同进程交换数据的机制。

而 **Mojo** 是 Chromium 自己实现的一套跨进程通信框架，是 IPC 的一种具体实现，不是操作系统提供的原语。这里要避免一个混淆：Mojo 不等于 Socket。Socket 是操作系统提供的、偏底层的通信端点；Mojo 是 Chromium 在其之上封装出来的、带强类型接口定义的高层通信框架。Mojo 底层可能借助操作系统的管道、共享内存等机制，但它对上层暴露的是「接口和消息」这种更好用的抽象。

Mojo 提供三种传输原语，分别解决不同的问题：

| 原语 | 解决什么问题 |
| --- | --- |
| 消息管道（Message Pipe） | 传结构化的、强类型的消息，双向、带顺序。用于「调用一个接口方法」这类控制性通信 |
| 数据管道（Data Pipe） | 高效传输大块的、流式的字节数据，比如响应体 |
| 共享内存（Shared Memory） | 让两个进程直接访问同一块内存，传递大块数据时避免反复拷贝 |

其中消息管道是最常用的：它是一对端点，一端写消息就等于把消息放进另一端的队列里，因此是双向的 <a class="bc-cite" href="https://github.com/0x26xyz/chromium/blob/main/docs/mojo_and_services.md" target="_blank" rel="noopener">[6]</a>。基于它，Chromium 定义一个个强类型接口，一端作为调用方发消息，另一端作为实现方收消息并处理。这套「调用方 / 实现方」的端点角色，在源码里就是 `Remote` 和 `Receiver`。

<div class="bc-call bc-source"><span class="bc-tag">源码追问</span><strong>Remote 与 Receiver</strong><br>给定一个接口和一条消息管道，发消息的一端叫 `Remote`，收消息并绑定到具体实现的一端叫 `Receiver`。`Remote` 上的方法调用会作为一条调度任务，触发实现对象上对应方法的执行 <a class="bc-cite" href="https://github.com/0x26xyz/chromium/blob/main/docs/mojo_and_services.md" target="_blank" rel="noopener">[6]</a>。这些名称放在源码层，不进基础主线。</div>

三种原语的分工在后面节点会各自派上用场：控制信息（「去加载这个 URL」「响应头来了」）走消息管道，大块的响应体走数据管道。这一节点交出的「加载任务」，正是通过消息管道从浏览器进程送到网络服务的。

### 这份「加载任务」里到底装了什么

浏览器进程通过 Mojo 把一份结构化的加载任务交给网络服务。这份任务不是光秃秃一个 URL，它至少包含：

- 规范化后的目标 URL（协议、主机、端口、路径、查询都在里面）。
- 请求方法（普通导航是 GET）。
- 这次导航的上下文信息：从哪里发起的、是不是用户亲手触发的、referrer 是什么。
- 需要附带的凭证策略、缓存策略等（具体怎么用留给后面的网络节点）。

网络服务收到它，就有了一份明确的、可执行的工作说明。它接下来要做的第一件事，不是立刻上网，而是先搞清楚「这个主机名到底对应哪个 IP、我该连谁」——这正好是节点二的入口。

<p class="bc-sec">主线整理</p>

```text
用户在地址栏输入字符串 + 回车
        ↓ 地址栏属于浏览器进程（不可信网页无权触碰）
浏览器进程接手，判断它是 URL / 搜索词 / 待定
        ↓ 判定为 URL
规范化并拆解 URL（补协议、编码、拆出 host/port/path...）
        ↓ 得到干净、结构化的 URL
创建导航对象，开始跟踪这次导航的生命周期
        ↓ 导航 ≠ 网络请求
触发旧页面 beforeunload，用户可在此中止导航
        ↓ 用户确认离开，且这是一次需要走网络的导航
按「站点」而非「标签页」盘算由哪个渲染进程承载（站点隔离）
        ↓ 网络的活儿不自己干
浏览器进程通过 Mojo 消息管道，把结构化加载任务交给网络服务
        ↓
网络服务收到加载任务，准备确定「连谁」
```

<p class="bc-sec">设计取舍</p>

这一节点的每个设计，几乎都是拿复杂度换安全和稳定。

**多进程 + 站点隔离**，换来的是安全和崩溃隔离：一个站点被攻破读不到别的站点，一个页面崩了不拖垮整个浏览器。代价是内存开销显著上升（每个进程都有固定成本），进程间还得靠 IPC 通信，比进程内直接调用慢、也更麻烦。移动端因此不得不放宽隔离范围来省内存，这就是取舍的直接证据。

**把网络单独拆成服务**，同样是把最危险的、直面互联网数据的部分关进受限进程，崩了能单独重启。代价还是那一份：多一层进程边界，多一层 Mojo 通信。

**用 Mojo 而不是直接用操作系统 Socket 或裸 IPC**，换来的是强类型接口、跨平台一致的抽象、以及针对不同数据形态（控制消息 / 流式数据 / 大块内存）分别优化的传输原语。代价是引入了一套需要学习和维护的框架，多了一层封装。

**导航和网络请求分离**，让锚点跳转、往返缓存这类「不用上网」的场景能走捷径，不必无谓地发请求。代价是导航状态机本身变复杂，要处理「有网络 / 无网络 / 中途被 beforeunload 取消 / 中途重定向」等多种路径。

一条贯穿性的取舍观：现代浏览器几乎所有「看起来多余」的进程拆分，本质都是在用性能和内存成本，买安全性和稳定性。

<p class="bc-sec">面试回答</p>

在地址栏输入网址回车，第一件事是浏览器进程接手——地址栏属于浏览器界面，不属于当前网页，这是一条安全边界，网页跑在权限受限、彼此隔离的渲染进程里。浏览器进程先判断输入是网址还是搜索词，是网址就做规范化：补全协议、编码国际化域名、拆出主机端口路径。然后它创建一次导航。导航和网络请求不是一回事，一次导航可能不发任何请求，比如锚点跳转或命中往返缓存的前进后退。发请求之前还会触发旧页面的 `beforeunload`，用户可以在这里取消整次导航。确认要走网络后，浏览器进程按「站点」而不是「标签页」来决定用哪个渲染进程——这是站点隔离，同一个站点一个进程，跨站的 iframe 会进独立进程，目的是让一个站点的漏洞读不到另一个站点的内存。真正的网络工作交给网络服务，它通常是独立进程；浏览器进程通过 Chromium 的跨进程通信框架 Mojo，把一份结构化的加载任务发过去。到这里，网络服务拿到了明确的加载任务，接下来才开始解析主机名。

<p class="bc-sec">常见追问</p>

**导航和网络请求有什么区别？**（校招必须掌握）
导航是浏览器把标签页从一个文档切换到另一个文档的整个过程，是内部状态切换；网络请求只是它在需要取远程资源时才使用的手段。锚点跳转、命中往返缓存的前进后退都是导航但不发网络请求。

**「一个标签页一个渲染进程」对吗？**（校招必须掌握）
不准确。Chromium 按站点（大致是可注册域 + 协议）而不是按标签页分配进程。一个标签页导航到不同站点会换进程，一个页面里的跨站 iframe 会进独立进程，同站的多个标签页可能共用进程。这套机制叫站点隔离，目的是安全。

**进程和线程在浏览器里分别解决什么？**（校招必须掌握）
进程负责隔离：不同站点、网络栈各自关进独立进程，内存互不可见，崩溃和攻击被进程边界挡住。线程负责并发：单个渲染进程内部用主线程、合成线程、栅格线程等协作渲染一个页面，它们共享内存。

**Mojo 和 Socket、IPC 是什么关系？**（回答出来加分）
IPC 是操作系统层面进程间通信的通用概念，Socket 是操作系统提供的底层通信端点之一。Mojo 是 Chromium 在这些底层机制之上封装的跨进程通信框架，提供强类型接口和消息管道、数据管道、共享内存三种原语。Mojo 不等于 Socket，它是更高层的抽象。

**网络服务就是「网络进程」吗？**（回答出来加分）
不能画等号。网络服务是一个逻辑服务组件，默认跑在独立进程里以获得隔离和稳定性，但在某些平台或资源受限配置下也可能被放进浏览器进程内运行。所以准确说法是「网络服务」，而不是固定的「网络进程」。

**`beforeunload` 具体在什么时机触发？**（通常不需要主动展开）
在浏览器决定发起导航之后、发出首个网络请求之前触发。它可以弹确认框让用户取消导航，用户选择留下则整次导航中止，网络请求不会发出。

---

**本节点产出**：网络服务收到一份结构化的加载任务，里面有规范化的目标 URL、请求方法和导航上下文。

**交给谁**：节点二 · 主机解析。

**下一节点为什么因此开始**：这份任务里的目标 URL 带的是主机名（比如 `github.com`），而网络连接只能建立在 IP 地址上。网络服务在能连接任何东西之前，必须先把主机名变成一组可以连接的 IP 地址——但它也不会拿到主机名就无条件去查 DNS，中间还有代理决议、IP 字面量、`localhost`、各级缓存要先走一遍。这正是节点二要讲的第一件事。


<div class="bc-refs"><b>参考来源</b><br>[1] <a href="https://www.chromium.org/developers/how-tos/trace-event-profiling-tool/trace-event-reading/" target="_blank" rel="noopener">https://www.chromium.org/developers/how-tos/trace-event-profiling-tool/trace-event-reading/</a><br>[2] <a href="https://netsekure.org/" target="_blank" rel="noopener">https://netsekure.org/</a><br>[3] <a href="https://www.chromium.org/developers/design-documents/site-isolation/" target="_blank" rel="noopener">https://www.chromium.org/developers/design-documents/site-isolation/</a><br>[4] <a href="https://www.chromium.org/developers/design-documents/oop-iframes/" target="_blank" rel="noopener">https://www.chromium.org/developers/design-documents/oop-iframes/</a><br>[5] <a href="https://www.chromium.org/Home/chromium-security/site-isolation/" target="_blank" rel="noopener">https://www.chromium.org/Home/chromium-security/site-isolation/</a><br>[6] <a href="https://github.com/0x26xyz/chromium/blob/main/docs/mojo_and_services.md" target="_blank" rel="noopener">https://github.com/0x26xyz/chromium/blob/main/docs/mojo_and_services.md</a></div>

<div class="bc-nav"><a href="/2026/08/21/browser-course-00/">← 00 · 课程总纲：一条运行主线，把四门课缝起来</a><a class="r" href="/2026/08/21/browser-course-02/">02 · 主机解析 →</a></div>
