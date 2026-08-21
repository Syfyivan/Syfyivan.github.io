---
title: "《从 URL 到页面显示》第 11 讲 · 绘制、栅格化与合成"
date: 2026-08-21 19:00:00
tags: [渲染, 合成层, GPU, 前端, 校招, 面试]
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

布局定了每个盒子的几何，但屏幕上还没有一个像素。这一节点把布局树变成真正显示的画面：先定出「怎么画、按什么顺序画」的绘制指令，把内容分成若干图层，把每层栅格化成一格格像素，最后交给 GPU 把这些层合成上屏。这一节点的产出，就是用户眼中真正显示出来的页面——URL 到显示的主线，到这里闭合。

<p class="bc-sec">理解原理</p>

### 从上一节点的输出开始：几何有了，像素还没有

节点十交出一棵带完整几何信息的布局树：每个元素多大、在哪都定了。但「知道一个红色方块在 (100,100)、宽 50 高 50」离「屏幕上真的亮起这些红色像素」还有几步。渲染进程接下来把几何信息一步步变成像素，再送上屏幕。

### 第一步：绘制记录——先列出「画的步骤」，还不真画

第一步不是直接往屏幕涂色，而是生成一份**绘制记录（paint records / display list）**：一串有序的绘制指令，比如「先画这个背景、再画那个边框、然后画这段文字」。

为什么要先列指令、而不直接画？因为**绘制顺序影响正确性**。元素之间有层叠关系（z-index、透明、定位),后画的会盖住先画的。浏览器要按正确的**层叠上下文（stacking context）** 顺序来排这份指令列表，才能保证遮挡关系对。这一步只是「排好画的步骤」，还没产生像素。

### 第二步：分层——把页面拆成若干独立图层

接着，渲染进程会把页面内容分成若干**合成层（compositing layer）**。不是每个元素一层，而是把「可能独立变化、单独处理更划算」的内容提升为单独的层，典型触发条件：

- `transform`、`opacity` 动画。
- `will-change: transform`。
- `<video>`、`<canvas>`、3D 变换等。

为什么要分层？因为分了层，某一层变化时（比如一个元素在做位移动画），只需重新处理那一层、再重新合成，**不必惊动整页的绘制和布局**。这是现代浏览器动画能流畅的关键。

<div class="bc-call bc-bonus"><span class="bc-tag">加分细节</span><strong>为什么 transform/opacity 动画比改 left/top 流畅</strong><br>改 `left`/`top` 会改变元素几何 → 触发回流 → 重绘 → 重新合成，整条链都要跑。而 `transform`、`opacity` 作用在已经分好的合成层上，**跳过布局和绘制，只在合成阶段调整层的位置或透明度**，而且这步通常交给 GPU 做。所以动画优先用 transform/opacity。能把它连回节点十的回流重绘，说清「省掉了哪几步」，比只背「transform 更快」有力得多。</div>

### 第三步：栅格化——把矢量变成像素

分好层后，每一层要被**栅格化（Rasterization）**：把「一段文字」「一个圆角矩形」这类矢量描述，转换成一格一格具体的像素颜色值，填进位图。这一步计算量大，Chromium 通常把它交给**合成线程**配合 GPU 完成，而不是占用主线程——这样即使主线程在跑 JS，栅格化也能并行推进。

栅格化还会考虑**设备像素比（DPR）**：高清屏（如 DPR=2）上，一个 CSS 像素要对应 2×2 个物理像素，栅格化时按物理像素密度来画，才不会糊。这正是节点十「布局算的是视口坐标、不是物理像素」那句话的下文。

<div class="bc-call bc-impl"><span class="bc-tag">实现细节</span><strong>分块栅格化与 GPU</strong><br>一整层可能很大（比如长页面），Chromium 会把层切成一个个**瓦片（tile）** 分块栅格化，优先栅格化视口附近的瓦片，滚动时再补其余的。栅格化结果作为纹理（texture）交给 GPU。这套「分层 + 分块 + GPU」的设计，让浏览器能只处理可见区域、复用没变的瓦片，是滚动和动画流畅的底层支撑。</div>

### 第四步：合成上屏——GPU 把各层拼成一帧

各层栅格化成纹理后，**合成线程**按正确的顺序、位置、透明度、变换，指挥 **GPU** 把这些层拼合（composite）成最终的一帧画面，输出到屏幕。到这一刻，用户才真正**看到页面**。

合成的好处在增量更新时尤其明显：如果只有某一层的 transform 变了，合成线程直接拿现成的纹理、换个位置重新合成即可，**连主线程都不用打扰**——所以这类动画即使主线程被 JS 卡住也能保持流畅。

### 第五步：主线程 vs 合成线程——一张分工图

把整条渲染管线的分工收束一下：

- **主线程**：解析、样式计算、布局、生成绘制记录、（部分）JS。这些一旦触发，代价高。
- **合成线程 + GPU**：栅格化、合成、纯合成动画。相对轻、可并行、不卡主线程。

一条实用推论：想要流畅，就尽量把变化留在合成线程能独立搞定的范围内（transform/opacity），别动不动触发主线程的布局和绘制。

### 汇总：这一节点交出去的是什么，以及主线闭合

绘制记录排好画的顺序、内容分成合成层、每层栅格化成像素、GPU 把各层合成上屏。产出就是**用户屏幕上真正显示出来的页面。**

从节点一「地址栏输入 URL」到这里「像素点亮屏幕」，整条主线正式闭合：输入与导航 → 主机解析 → 路径选择 → 建连 → TLS → HTTP 收发 → 导航提交 → 解析建 DOM → CSS/JS 调度 → 样式与布局 → 绘制合成上屏。节点十二会把这条链完整复盘一遍，并挂上衡量它快慢的性能指标。

<p class="bc-sec">主线整理</p>

```text
带几何信息的布局树
        ↓ 按层叠顺序排绘制指令
绘制记录（display list，还没产生像素）
        ↓ 提升可独立变化的内容
分层：合成层（transform/opacity/video 等触发）
        ↓ 矢量 → 像素（合成线程 + GPU，按 DPR，分瓦片）
栅格化：每层画成位图纹理
        ↓ GPU 按顺序/位置/透明度拼合
合成上屏：输出最终一帧
        ↓
产出：用户真正看到的页面（主线闭合）
```

<p class="bc-sec">设计取舍</p>

**先生成绘制记录、不直接画**，用「多一层指令列表」换来了绘制顺序可控（保证遮挡正确）和可缓存、可增量重放。代价是多一层抽象，但这是分层合成的前提。

**分层 + 合成**，用额外的内存（每层一份纹理）换来了「某层变化只重合成、不惊动全页」的高效增量更新，让动画能交给 GPU 跑得流畅。代价是层过多会吃内存、甚至适得其反（层爆炸），`will-change` 要克制着用。

**栅格化/合成放到合成线程与 GPU**，用「把重活挪出主线程」换来了主线程卡顿时动画仍能流畅、滚动仍能跟手。代价是引擎复杂度大增，要维护主线程与合成线程之间的协作和同步。

<p class="bc-sec">面试回答</p>

布局只算出了几何，屏幕上还没有像素，这一步负责把它变成画面。先生成绘制记录，也就是一串有序的绘制指令，按层叠上下文排好顺序，保证谁盖谁正确，这时还没真画。然后分层，把 transform、opacity 动画、video、will-change 这类可能独立变化的内容提升成单独的合成层，好处是某层变了只处理那层、不惊动整页。接着栅格化，把文字、圆角这些矢量描述变成一格格像素填进位图，这步计算大，Chromium 交给合成线程配合 GPU、还会按设备像素比在高清屏上画得更密、并把大层切成瓦片优先画视口附近的。最后合成线程指挥 GPU 把各层按顺序位置透明度拼成一帧上屏，用户才真正看到页面。这套设计的价值在增量更新：只有某层 transform 变了，合成线程拿现成纹理换个位置重合成就行，连主线程都不打扰，所以这类动画即使主线程被 JS 卡住也流畅。这也是为什么动画优先用 transform 和 opacity——它跳过布局和绘制，只在合成阶段调整。到这里，从地址栏输入到像素上屏的主线就闭合了。

<p class="bc-sec">常见追问</p>

**为什么 transform/opacity 动画比改 left/top、width 流畅？**（校招必考）
改 left/top、width 改变几何，触发回流、重绘、再合成，整条链都跑在主线程。transform/opacity 作用在已有的合成层上，跳过布局和绘制，只在合成阶段由 GPU 调整位置或透明度，不占主线程，所以流畅。

**什么是合成层，什么会触发单独分层？**（校招常问）
合成层是能被单独栅格化、单独合成的内容层。transform/opacity 动画、will-change:transform、video、canvas、3D 变换等会触发提升。分层是为了让局部变化只重合成该层，不影响整页。

**栅格化是什么？为什么放在合成线程/GPU？**（校招常问）
栅格化是把矢量绘制指令转成具体像素填进位图。放到合成线程配合 GPU，是为了不占用主线程，让主线程跑 JS 时栅格化也能并行，并借 GPU 并行能力加速，还能按 DPR 和瓦片只画需要的部分。

**主线程和合成线程各负责渲染管线的哪些阶段？**（回答出来很加分）
主线程：解析、样式计算、布局、生成绘制记录、部分 JS。合成线程+GPU：栅格化、合成、纯合成动画。想流畅就尽量把变化限制在合成线程能独立完成的范围（transform/opacity）。

**will-change 是不是越多越好？**（回答出来加分）
不是。will-change 会提前把元素提升为合成层，层太多会占大量内存、增加合成开销，反而变慢，叫层爆炸。应只在确实要频繁动画的元素上、临时使用。

**首次把内容画上屏对应哪个性能指标？**（承接下一节点）
首次真正绘制出内容对应 FCP（First Contentful Paint）。而最大内容元素画完对应 LCP。它们衡量的正是这条渲染管线走到「上屏」的快慢，下一节点展开。

---

**本节点产出**：用户屏幕上真正显示出来的页面帧。URL → 显示 的主线到此闭合。

**交给谁**：节点十二 · 性能指标与完整复盘。

**下一节点为什么因此开始**：主线跑通了，但工程上还得能衡量它「快不快、卡不卡」，并能把整条链从头到尾串成一张图复盘。节点十二会挂上 FCP、LCP、TTFB、INP、CLS 这些核心指标，说明它们分别卡在主线的哪一步，并做一次完整的端到端回顾。


<div class="bc-nav"><a href="/2026/08/21/browser-course-10/">← 10 · 样式计算与布局</a><a class="r" href="/2026/08/21/browser-course-12/">12 · 性能指标与完整复盘 →</a></div>
