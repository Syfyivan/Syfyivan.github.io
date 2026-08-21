---
title: "《从 URL 到页面显示》第 09 讲 · CSS 与 JavaScript 执行调度"
date: 2026-08-21 17:00:00
tags: [CSS, JavaScript, 事件循环, 前端, 校招, 面试]
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

DOM 说清了「有什么内容」，但要真正渲染，还缺两样：CSS 得解析成 CSSOM 才知道「长什么样」，JS 得在合适时机执行、还可能反过来改 DOM 和样式。这一节点理清这两条资源怎么各自处理、彼此如何牵制，以及浏览器凭什么决定「现在可以第一次画到屏幕上了」。产出，是一棵 DOM 树加一棵 CSSOM 树，二者即将合并成渲染树。

<p class="bc-sec">理解原理</p>

### 从上一节点的输出开始：DOM 在长，CSS 和 JS 已在路上

节点八交出一棵正在成型的 DOM 树，以及一批已经发出去的子资源请求。其中 CSS 和 JS 这两类，正是决定页面「怎么显示、怎么动」的关键。渲染进程现在要处理它们，而处理顺序不是随意的——它直接决定了用户多久能看到第一帧、页面会不会闪。

### 第一步：CSS 解析成 CSSOM

浏览器拿到 CSS（外链下载回来的，或 `<style>` 里的），会像解析 HTML 一样把它解析成一棵树：**CSSOM（CSS Object Model，CSS 对象模型）**。CSSOM 描述了每条规则、每个选择器、每个属性值，以及它们的层叠关系。

为什么 CSS 也要建成树？因为样式有**继承**和**层叠**：子元素会继承父元素的某些属性（如字体色），多条规则命中同一元素时要按优先级层叠出最终值。树结构才能表达这种自上而下的继承关系。

### 第二步：CSS 是「渲染阻塞」资源

这是个关键结论：**CSS 会阻塞渲染，但不阻塞 DOM 解析。**

- 不阻塞解析：DOM 树可以在 CSS 还没到时继续构建。
- 阻塞渲染：浏览器**不会在 CSSOM 没准备好之前做首次绘制**。因为如果 CSS 还没到就先把没样式的内容画出来，等 CSS 一到又得重画，用户会看到一闪而过的「无样式内容」（FOUC，Flash of Unstyled Content）。为了避免这种难看的闪烁，浏览器宁可等 CSSOM 就绪再画第一帧。

所以 CSS 的到达速度直接决定首屏时间——这也是「关键 CSS 内联、非关键 CSS 延后」这类优化的根本原因。

<div class="bc-call bc-bonus"><span class="bc-tag">加分细节</span><strong>CSS 不阻塞解析、却阻塞渲染，还间接阻塞脚本</strong><br>把节点八和这里连起来看，CSS 的三重影响就清楚了：① 不阻塞 DOM 解析；② 阻塞渲染（不等 CSSOM 好不画首帧）；③ 间接阻塞脚本（脚本可能读样式，要等 CSS 好再执行），而脚本又阻塞解析。能一次说清这三层，说明真的理解了 CSS 在关键渲染路径里的角色，而不是背了句「CSS 阻塞渲染」。</div>

### 第三步：JavaScript 在主线程上执行——单线程模型

JS 的执行有个绕不开的前提：**渲染进程里，JS 和渲染共用同一个主线程。** 也就是说，解析、样式、布局、绘制，和 JS 执行，都排在同一条主线程的任务队列上，同一时刻只能做一件事。

这带来一个直接后果：**一段长时间运行的 JS 会卡住渲染。** 脚本跑得太久，主线程被占着，页面就没法响应点击、没法更新画面，表现为「卡顿」「掉帧」甚至「页面无响应」。这也是为什么重计算要么切成小块、要么丢给 Web Worker（在别的线程跑，连到操作系统机制分支）。

<div class="bc-call bc-branch"><span class="bc-tag">旁支</span><strong>事件循环（Event Loop）是怎么协调这一切的</strong><br>主线程靠**事件循环**来调度：它不断从任务队列里取任务执行，一个执行完再取下一个。宏任务（如一次 setTimeout 回调、一个事件处理）之间，会穿插清空微任务队列（如 Promise 回调）。渲染更新也被安排在这个循环里的合适时机（配合 `requestAnimationFrame`）。事件循环解释了「为什么 JS 是单线程却能处理异步」——异步操作完成后把回调塞回队列，主线程空了再执行。这条是理解 JS 运行时的主干，值得单独深挖，但不在本条主线展开。</div>

### 第四步：把两条线合起来看执行顺序

现在可以把 DOM、CSS、JS 三者的相互牵制串成一条完整的因果链（承接节点八的脚本阻塞）：

1. HTML 边解析边建 DOM。
2. 遇到同步 `<script>`，解析暂停。
3. 若这个脚本前面有 CSS 没加载完，脚本还得先等 CSS → CSSOM 就绪（因为脚本可能读样式）。
4. CSS 好了、脚本执行完，解析才继续。
5. 脚本执行时如果修改了 DOM 或样式，相应的树也随之更新。

一句话：**DOM 和 CSSOM 并行构建，但脚本是把两者串到一起的「同步点」。**

### 第五步：DOMContentLoaded 与 load

两个常被问到的时机点，正好卡在这一节点的收尾：

- **`DOMContentLoaded`**：DOM 树构建完、所有同步脚本执行完时触发。注意它**不等图片、样式表等子资源**，只关心「文档结构和脚本就绪」。
- **`load`**：整个页面连同所有子资源（图片、CSS、iframe 等）都加载完才触发。

两者差在「等不等子资源」。需要操作 DOM 的初始化代码挂在 `DOMContentLoaded` 就够了，不必傻等 `load`。

### 汇总：这一节点交出去的是什么

CSS 被解析成 CSSOM（渲染阻塞，保证不画出无样式内容）；JS 在单线程主线程上按调度执行、可能改 DOM 和样式；脚本是把 DOM 和 CSSOM 串起来的同步点。当 DOM 和 CSSOM 都就绪，渲染进程手里就有了**两棵树——DOM 描述内容结构、CSSOM 描述样式规则。**

但这两棵树还是分开的。要算出「每个元素到底长什么样、摆在哪」，得先把它们合并、再依次做样式计算和布局。这是节点十。

<p class="bc-sec">主线整理</p>

```text
DOM 在构建 + CSS/JS 已在下载
        ↓ CSS 解析
CSS → CSSOM（表达继承与层叠）
        ↓ CSS 是渲染阻塞资源
不等 CSSOM 就绪不做首次绘制（避免无样式闪烁 FOUC）
        ↓ JS 在主线程执行（单线程）
同步脚本：暂停解析 →（若 CSS 未完则先等 CSS）→ 执行 → 可能改 DOM/CSSOM
        ↓ 事件循环调度宏/微任务与渲染
DOM 构建完 + 同步脚本跑完 → DOMContentLoaded
        ↓ 子资源全到 → load
产出：一棵 DOM 树 + 一棵 CSSOM 树，准备合并
```

<p class="bc-sec">设计取舍</p>

**CSS 阻塞渲染但不阻塞解析**，用「首屏多等 CSSOM 一会儿」换来了「绝不画出无样式的难看内容」。代价是 CSS 一慢，首屏就跟着慢，逼出了关键 CSS 内联、异步加载非关键样式这类优化。

**JS 与渲染共用单线程**，用一个简单、无需处理多线程数据竞争的模型，换来了心智负担低、DOM 操作天然线程安全。代价是长任务会直接卡住渲染，必须靠切片、异步、Web Worker 来避免掉帧。

**DOMContentLoaded 不等子资源**，用「文档结构一好就触发」让初始化脚本尽早跑，而不必等所有图片下载完。代价是开发者得分清两个时机，用错（该用 DOMContentLoaded 却挂 load）会白白拖慢交互就绪。

<p class="bc-sec">面试回答</p>

DOM 说清了内容，但渲染还差 CSS 和 JS。CSS 会被解析成 CSSOM，之所以也建成树，是因为样式有继承和层叠，要自上而下算最终值。CSS 的定位是渲染阻塞但不阻塞解析：DOM 可以在 CSS 没到时继续建，但浏览器不会在 CSSOM 好之前画第一帧，否则会闪一下无样式内容。JS 这边关键是单线程——渲染进程里 JS 和渲染共用一条主线程，一段长任务会把渲染卡住，所以重计算要切片或丢给 Web Worker。三者的牵制串起来是：HTML 边解析边建 DOM，遇到同步 script 暂停，如果脚本前面 CSS 没好还得先等 CSSOM，因为脚本可能读样式，CSS 好、脚本跑完才继续解析，脚本执行时还可能改 DOM 和样式。调度这一切的是事件循环，它从任务队列取宏任务、之间清空微任务、安排渲染。收尾有两个时机：DOMContentLoaded 是 DOM 建好加同步脚本跑完就触发、不等图片；load 要等所有子资源。最后 DOM 和 CSSOM 两棵树都就绪，准备合并去算样式和布局。

<p class="bc-sec">常见追问</p>

**CSS 阻塞什么、不阻塞什么？**（校招必须掌握）
不阻塞 DOM 解析，DOM 可以边等 CSS 边建。阻塞渲染，不等 CSSOM 就绪不做首次绘制，避免无样式闪烁。还会间接阻塞其后要读样式的脚本执行。

**为什么说 JS 是单线程，它怎么处理异步？**（校招必考）
渲染进程里 JS 和渲染共用主线程，同一时刻只做一件事。异步靠事件循环：异步操作完成后把回调放进任务队列，主线程空闲时再取出执行，所以单线程也能不阻塞地处理异步。

**宏任务和微任务的区别？**（校招常问）
微任务（Promise.then、MutationObserver 等）在当前宏任务结束后、下一个宏任务开始前被一次性清空；宏任务（setTimeout、事件回调、整体脚本）一次执行一个。微任务优先级更高、更早执行完。

**DOMContentLoaded 和 load 的区别？**（校招常问）
DOMContentLoaded 在 DOM 构建完、同步脚本执行完时触发，不等图片、样式表等子资源；load 要等所有子资源都加载完。初始化 DOM 用前者即可。

**长任务为什么会导致页面卡顿？**（回答出来加分）
因为 JS 和渲染共用主线程，一段长 JS 占着主线程时，浏览器无法响应交互、无法更新画面，就掉帧卡顿。解决办法是把任务切片、用 requestIdleCallback，或把计算移到 Web Worker。

**FOUC 是什么？**（回答出来加分）
Flash of Unstyled Content，无样式内容闪烁。若在 CSSOM 就绪前先绘制，用户会先看到没样式的裸内容、CSS 到了再跳变。浏览器让 CSS 阻塞渲染正是为了避免它。

---

**本节点产出**：一棵构建完成的 DOM 树 + 一棵 CSSOM 树，主线程上的脚本已按调度执行。

**交给谁**：节点十 · 样式计算与布局。

**下一节点为什么因此开始**：现在有了内容树（DOM）和样式树（CSSOM），但它们还是分开的，也还不知道每个元素最终的样式值和它在页面上的确切位置、尺寸。渲染进程要把两棵树合并成渲染树、为每个可见元素算出最终样式，再据此算出精确的几何布局。这就是节点十。


<div class="bc-nav"><a href="/2026/08/21/browser-course-08/">← 08 · HTML 解析与子资源发现</a><a class="r" href="/2026/08/21/browser-course-10/">10 · 样式计算与布局 →</a></div>
