---
title: "《从 URL 到页面显示》第 08 讲 · HTML 解析与子资源发现"
date: 2026-08-21 16:00:00
tags: [HTML, DOM, 解析, 前端, 校招, 面试]
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

渲染进程拿到的是一串 HTML 字节，但样式和布局需要的是一棵树。这一节点做两件交织的事：把字节流解析成 DOM 树，同时在解析过程中一边发现页面还依赖哪些外部资源、一边尽早把它们拉起来。它的产出，是一棵正在成长的 DOM 树，加上一批已经在路上的子资源请求。

<p class="bc-sec">理解原理</p>

### 从上一节点的输出开始：一条正在流入的字节流

节点七把响应体接进了渲染进程，而且是**边收边到**的。所以渲染进程不会傻等整篇 HTML 下载完再动手——它一拿到前面的字节就开始解析。解析器要把「一串字符」变成浏览器能操作的结构：**DOM（Document Object Model，文档对象模型）树**。

### 第一步：字节 → 字符 → 词法单元 → 节点 → 树

解析不是一步到位，是一条流水线：

- **解码**：先按编码（如 UTF-8）把字节还原成字符。
- **分词（Tokenize）**：把字符流切成一个个词法单元——开始标签、结束标签、文本、注释等。
- **建树**：解析器按 HTML 规范维护一个栈，边读词法单元边把节点挂到树上，处理好嵌套关系，最终长成一棵 DOM 树。

HTML 解析有个和 XML 很不同的特点：**极其宽容**。标签没闭合、属性没引号、嵌套写错，解析器都会按规范里定义好的容错规则「猜」出一个合理的树，而不是报错停下。这是为了兼容互联网上海量不规范的历史页面。

### 第二步：一边解析，一边发现子资源

一篇 HTML 很少是自给自足的。解析器读到某些标签时，就知道页面还依赖别的东西：

- `<link rel="stylesheet">` → 需要一个 CSS 文件。
- `<script src>` → 需要一个 JS 文件。
- `<img>`、`<video>` → 需要图片、媒体。

发现即触发：解析器一读到这些引用，就通过节点七建立的机制向网络层发起子资源请求。这些请求走的正是前面节点讲的整条链路（可能命中缓存、可能复用连接池里的连接）。**边解析边发请求**，是为了尽早让下载和解析并行起来，别等 DOM 全建完才开始下载 CSS。

<div class="bc-call bc-impl"><span class="bc-tag">实现细节</span><strong>预加载扫描器（Preload Scanner）</strong><br>主解析器会因为脚本而暂停（见下），但 Chromium 还有一个轻量的**预加载扫描器**在旁边跑：它抢先扫描后面的 HTML 文本，把里面的 `<img>`、`<link>`、`<script src>` 等资源引用提前挑出来发请求，不受主解析暂停的影响。所以即使主解析卡在一个脚本上，后面的图片和样式表也早就在下载了。这是浏览器一个很重要、但容易被忽略的性能优化。</div>

### 第三步：遇到脚本——解析被迫停下

发现子资源大多不会打断解析，唯独 `<script>` 是个例外。

浏览器读到一个普通的 `<script>`（没有 `async`/`defer`），必须**停下 HTML 解析**，先把这段脚本下载（如果是外链）并执行完，才继续往下解析。为什么必须停？因为脚本里可能有 `document.write`，能直接往当前解析位置插入内容，甚至改写后面的文档结构——解析器没法预判脚本会怎么改 DOM，只能停下等它跑完。

这就是经典的「**脚本阻塞解析**」，也是「把 `<script>` 放在 `<body>` 底部」这条老规矩的由来：放底部，等于让脚本在大部分 DOM 都建好之后才执行，不挡住前面内容的解析和呈现。

### 第四步：CSS 也会间接卡住脚本

更微妙的一层：脚本能读取元素的样式（比如 `getComputedStyle`）。所以如果一个脚本前面还有 CSS 没加载完，浏览器为了保证脚本读到的样式是准的，会让**脚本等 CSS 下载解析完再执行**。于是就出现了这样一条因果链：CSS 没下完 → 脚本被卡 → 脚本卡住 HTML 解析。这解释了为什么 CSS 虽然自己不阻塞 DOM 解析，却能通过脚本间接拖慢整个解析过程。

<div class="bc-call bc-bonus"><span class="bc-tag">加分细节</span><strong>async 和 defer 怎么解开这个结</strong><br>两个属性都让外链脚本的下载和 HTML 解析**并行**，区别在执行时机：`async` 一下载完就执行、可能插在解析中间，谁先下完谁先跑、顺序不保证；`defer` 会等 HTML 解析完、按文档顺序依次执行。需要保证执行顺序、依赖 DOM 就绪的，用 `defer`；相互独立的（如统计脚本），用 `async`。能把这两个和「脚本阻塞解析」串起来讲，比单独背定义强。</div>

### 汇总：这一节点交出去的是什么

渲染进程把流入的 HTML 字节解析成一棵 DOM 树，过程中不断发现并拉取子资源（还有预加载扫描器在旁边抢跑），遇到同步脚本会暂停解析、且脚本可能被前面的 CSS 拖住。产出是**一棵基本建好的 DOM 树，外加一批正在下载或已到达的 CSS、JS、图片等子资源。**

DOM 树只描述了「文档有哪些内容、什么结构」，但没有「长什么样」——那要靠 CSS。而 JS 可能还要改这棵树。这两样怎么被处理、按什么顺序执行，是节点九的事。

<p class="bc-sec">主线整理</p>

```text
渲染进程收到流入的 HTML 字节
        ↓ 解码 → 分词 → 建树（容错极强）
边解析边生成 DOM 节点，挂成一棵 DOM 树
        ↓ 读到资源引用即发请求
发现子资源：CSS / JS / 图片…（预加载扫描器抢跑）
        ↓ 读到同步 <script>
暂停解析：下载并执行脚本（可能被前面未完成的 CSS 卡住）
        ↓ 脚本跑完，继续解析
DOM 树逐步建完
        ↓
产出：一棵 DOM 树 + 一批在途/已到的子资源
```

<p class="bc-sec">设计取舍</p>

**HTML 解析极度宽容**，用「几乎不因语法错误停下、按规范容错猜树」换来了对海量不规范历史页面的兼容。代价是行为复杂、边界情况多，也让「同一段错误 HTML 各浏览器结果一致」全靠规范把容错规则写死才做得到。

**同步脚本阻塞解析**，用「停下等脚本」换来了 `document.write` 这类能改写文档流的能力可以正确工作。代价是脚本会挡住后续内容呈现，只能靠放底部、`async`/`defer` 来缓解。

**预加载扫描器**，用一个额外的抢跑扫描器，换来「主解析被脚本卡住时，后续资源仍能提前下载」的并行度。代价是实现更复杂，且偶尔会预取到最终没用上的资源。

<p class="bc-sec">面试回答</p>

渲染进程拿到的是流入的 HTML 字节，要先解析成 DOM 树：解码成字符、分词成标签等词法单元、按规范维护栈建成树，过程极其容错，写错也会猜出合理结构。解析是边收边做的。过程中读到 link、script、img 这些引用就立刻发子资源请求，让下载和解析并行；Chromium 还有个预加载扫描器抢先扫后面的资源提前下。关键卡点是脚本：读到没有 async/defer 的 script 必须暂停 HTML 解析，先下载执行完再继续，因为脚本可能用 document.write 改文档结构。而且如果脚本前面有 CSS 没加载完，脚本要等 CSS 好了再执行，于是 CSS 会间接卡住解析。解开这个结靠 async 和 defer：都让下载和解析并行，async 下完就执行、顺序不保证，defer 等解析完按顺序执行。所以老规矩把 script 放 body 底部，就是让它别挡住前面内容。最后产出一棵 DOM 树和一批在途的子资源，接下来交给样式和脚本调度。

<p class="bc-sec">常见追问</p>

**为什么 script 会阻塞 HTML 解析？**（校招必须掌握）
因为脚本可能通过 document.write 直接改写当前解析位置的文档内容，解析器无法预知，只能停下等脚本下载并执行完再继续。这就是同步脚本阻塞解析。

**async 和 defer 的区别？**（校招必考）
两者都让外链脚本下载与 HTML 解析并行。async 下载完立刻执行、可能打断解析、多个脚本顺序不定；defer 等 HTML 解析完再按文档顺序执行。要顺序和 DOM 就绪用 defer，独立脚本用 async。

**CSS 会阻塞 DOM 解析吗？**（校招常问，易答错）
CSS 本身不阻塞 DOM 树的构建。但它会阻塞其后脚本的执行（脚本可能读样式），而脚本又阻塞解析，所以 CSS 会间接拖慢解析。此外 CSS 会阻塞渲染（不等 CSSOM 好不首次绘制）。

**为什么建议把 script 放在 body 底部？**（校招常问）
因为同步脚本会暂停解析。放在底部时，大部分 DOM 已经建好，脚本执行不再挡住前面内容的解析和呈现，用户能更早看到页面。

**HTML 解析为什么这么容错？**（回答出来加分）
为了兼容互联网上大量不规范的历史页面。HTML 规范把容错规则明确写死，让各浏览器面对错误标签也能解析出一致的 DOM，而不是像 XML 那样直接报错。

**预加载扫描器解决什么问题？**（回答出来加分）
主解析器被同步脚本暂停时，预加载扫描器会抢先扫描后续 HTML，把 img、link、script 等资源引用提前发起请求，避免下载被脚本白白拖住，提升并行度。

---

**本节点产出**：一棵基本建成的 DOM 树，以及一批正在下载或已到达的子资源（CSS、JS、图片等）。

**交给谁**：节点九 · CSS 与 JavaScript 执行调度。

**下一节点为什么因此开始**：DOM 只说明了「有什么内容」，没说「长什么样」，这要靠 CSS 解析成 CSSOM。同时下载回来的 JS 要在合适的时机执行、还可能反过来改 DOM 和样式。这两条资源怎么各自处理、彼此如何影响首次渲染的时机，是节点九要理清的。


<div class="bc-nav"><a href="/2026/08/21/browser-course-07/">← 07 · 响应处理与导航提交</a><a class="r" href="/2026/08/21/browser-course-09/">09 · CSS 与 JavaScript 执行调度 →</a></div>
