---
title: "《从 URL 到页面显示》第 10 讲 · 样式计算与布局"
date: 2026-08-21 18:00:00
tags: [渲染树, 布局, 回流, 前端, 校招, 面试]
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

有了 DOM 和 CSSOM，渲染进程先把它们合并成一棵只含可见元素的渲染树，给每个元素算出最终样式，再据此计算出每个元素在页面上的精确位置和尺寸。这一节点的产出，是一棵带着完整几何信息的布局树——每个盒子该多大、摆在哪，都定下来了。

<p class="bc-sec">理解原理</p>

### 从上一节点的输出开始：两棵各管一头的树

节点九交出 DOM（内容结构）和 CSSOM（样式规则）两棵树。它们各说各话：DOM 只知道「有个 `<p>`」，CSSOM 只知道「`p` 应该是红色 16px」。要渲染，得把两者对上——每个元素配上它最终的样式，再算出它的几何位置。这一步分成前后相扣的两段：样式计算、布局。

### 第一步：合并成渲染树，只保留要显示的东西

浏览器把 DOM 和 CSSOM 合并，生成**渲染树（Render Tree）**。关键点是：渲染树只包含**将要显示在屏幕上的节点**。

- `<head>`、`<meta>`、`<script>` 这些不显示的，不进渲染树。
- `display: none` 的元素，不进渲染树——它彻底不参与布局，就像不存在。
- 但 `visibility: hidden` 的元素**会进**渲染树——它占着位置，只是看不见。

这个区别是常考点：`display: none` 不占位、不进渲染树；`visibility: hidden` 占位、进渲染树只是不可见。

### 第二步：样式计算——为每个元素算出最终值

进了渲染树的每个元素，都要确定它**每一个 CSS 属性的最终值**。这不是简单查一条规则，而是要处理：

- **层叠（Cascade）**：多条规则命中同一元素时，按来源、重要性、选择器优先级（specificity）、书写顺序决出胜者。
- **继承（Inheritance）**：像 `color`、`font` 这类可继承属性，没显式设置就取父元素的值。
- **默认值**：都没有就用浏览器默认样式或属性初始值。

算完，每个元素都有一份**计算后样式（computed style）**，再没有「取决于别处」的悬空值了。

<div class="bc-call bc-impl"><span class="bc-tag">实现细节</span><strong>Chromium 用样式共享做优化</strong><br>一个页面里成百上千个元素，若每个都从头跑一遍层叠计算会很慢。Chromium 会做**样式共享（style sharing）**：结构、类名、状态相同的兄弟元素，可以直接复用同一份计算结果，不必重算。这类优化在大列表、大表格页面上收益明显。属于引擎实现层面的加速，理解「为什么大页面样式计算没有想象中慢」时用得上。</div>

### 第三步：布局——从「长什么样」到「在哪、多大」

样式计算解决了「每个元素是什么样」，但还没解决「它在页面上占哪块、多大」。**布局（Layout，在 Chromium 里也叫 Reflow）** 就是干这个的：从渲染树根节点出发，按盒模型（box model）和排版规则，算出每个元素盒子的确切位置和尺寸。

布局要处理的正是这些相互依赖：

- 一个元素的宽度可能是父元素的百分比 → 得先知道父元素多宽。
- 文字要换行 → 得知道容器多宽才知道换几行、占多高。
- `flex`、`grid` 布局 → 子元素尺寸互相牵制，要统一求解。

所以布局是自上而下、又要回看子元素的一次几何求解，输出是一棵**布局树**，每个节点都带着精确的坐标和大小。

<div class="bc-call bc-bonus"><span class="bc-tag">加分细节</span><strong>为什么布局用的是相对视口的坐标</strong><br>布局算出的位置，是相对于视口（viewport）的几何坐标，还不是屏幕上的物理像素。真正的像素化（考虑设备像素比 DPR、把矢量信息变成一格格像素）发生在下一节点的栅格化。把「布局算几何」和「栅格化画像素」分开，是渲染流水线能高效局部更新的前提。能点出这层区分，说明你对渲染管线的分层有整体认识。</div>

### 第四步：回流与重绘——为什么这一节点的开销要特别小心

理解了布局，就能理解前端性能里最要命的两个词：

- **回流（Reflow / Layout）**：几何信息变了（改宽高、加删元素、改字体大小、读 `offsetTop` 这类会强制同步布局的属性），浏览器得重新算布局。**开销大**，因为可能牵连一大片元素重排。
- **重绘（Repaint）**：只有外观变了、几何没变（改颜色、背景），跳过布局，直接重画。**比回流便宜。**

一条实用推论：**改变布局的操作尽量批量、避免在循环里反复读写几何属性**（会触发「强制同步布局 / layout thrashing」）。这条从布局的原理直接推得出，不用死记。

### 汇总：这一节点交出去的是什么

DOM 和 CSSOM 合并成只含可见元素的渲染树；每个元素经层叠、继承算出计算后样式；再经布局算出精确的位置和尺寸。产出是**一棵带完整几何信息的布局树——每个盒子多大、在哪，全都确定了。**

但布局只是算出了「几何」，屏幕上还是空的。要真正出现像素，得知道每个元素怎么画、按什么顺序画、哪些该合成到一起。这是节点十一。

<p class="bc-sec">主线整理</p>

```text
DOM（内容）+ CSSOM（样式）两棵树
        ↓ 合并，剔除不显示的节点
渲染树（display:none 不进 / visibility:hidden 进）
        ↓ 样式计算
每个元素算出计算后样式（层叠 + 继承 + 默认值）
        ↓ 布局 / Reflow
按盒模型求解每个盒子的精确位置与尺寸
        ↓
产出：一棵带完整几何信息的布局树
（几何变→回流；仅外观变→重绘）
```

<p class="bc-sec">设计取舍</p>

**渲染树只装可见节点**，用「提前剔除 display:none、head 等」换来后续样式、布局只在真正要显示的元素上做，省掉无用计算。代价是要区分 `display:none` 与 `visibility:hidden` 两种「看不见」，开发者容易混。

**样式计算与布局分成两段**，用「先定样式、再定几何」的清晰分层，换来引擎可以对两段各自优化（如样式共享、局部回流）。代价是流程更长，但换来了可维护和可优化的管线。

**布局（几何）与栅格化（像素）分离**，用「布局只算坐标、不碰像素」换来了「外观改动只重绘、不回流」的高效局部更新，也让不同 DPR 屏幕能复用同一份布局。代价是概念更多，得分清回流和重绘。

<p class="bc-sec">面试回答</p>

有了 DOM 和 CSSOM，先合并成渲染树，渲染树只含要显示的节点：head、script、display:none 都不进，visibility:hidden 会进因为它占位只是不可见。然后是样式计算，给渲染树里每个元素算出每个属性的最终值，处理层叠——多条规则按优先级和顺序决胜、继承——color 这类没设就取父元素、还有默认值。Chromium 会用样式共享复用相同元素的计算结果加速。样式算完知道每个元素长什么样，但还不知道在哪多大，这就是布局，也叫 reflow，按盒模型算出每个盒子的精确位置和尺寸，要处理百分比宽度、文字换行、flex/grid 这些相互依赖。产出是带完整几何信息的布局树。由此能理解回流和重绘：几何变了要重新布局叫回流、开销大，可能牵连一片元素；只是颜色背景这种外观变、几何没变叫重绘、便宜些。所以性能上要避免在循环里反复读写几何属性触发强制同步布局。布局只算几何坐标，真正变成屏幕像素是下一步栅格化的事。

<p class="bc-sec">常见追问</p>

**display:none 和 visibility:hidden 在渲染上有什么不同？**（校招必考）
display:none 不进渲染树、不占位、不参与布局，等于不存在。visibility:hidden 进渲染树、占位、参与布局，只是不可见。前者切换会触发回流，后者只是重绘。

**回流和重绘的区别？**（校招必考）
回流是几何信息变化（尺寸、位置、增删元素）导致重新计算布局，开销大且可能连锁。重绘是仅外观变化（颜色、背景）、几何不变，跳过布局直接重画，较便宜。回流必然伴随重绘，重绘不一定回流。

**什么操作会触发回流？怎么减少？**（校招常问）
改宽高/边距/字体、增删元素、改变 display，以及读取 offsetTop、clientHeight、getComputedStyle 等会强制同步布局的属性。减少办法：批量修改、用 class 一次改、缓存几何读数避免读写交替、用 transform 做动画绕开布局。

**CSS 选择器优先级怎么算？**（校招常问）
按内联样式 > ID > 类/属性/伪类 > 元素/伪元素 计权重，同级比数量，权重相同看书写顺序后者胜，!important 最高。这就是层叠里决胜的核心规则。

**渲染树和 DOM 树是一回事吗？**（回答出来加分）
不是。DOM 树是完整文档结构，包含不显示的节点；渲染树是 DOM 与 CSSOM 合并后、只含可见元素的树，且每个元素带样式信息。渲染树是布局的输入。

**布局算出的坐标就是屏幕像素吗？**（回答出来加分）
不是。布局算的是相对视口的几何坐标，真正结合设备像素比、把矢量变成像素点是下一步栅格化做的。布局与栅格化分离，才能让外观改动只重绘、不重算布局。

---

**本节点产出**：一棵带完整几何信息的布局树，每个可见元素的位置和尺寸都已确定。

**交给谁**：节点十一 · 绘制、栅格化与合成。

**下一节点为什么因此开始**：布局定了「每个盒子在哪、多大」，但屏幕上还没有一个像素。渲染进程接下来要决定每个元素怎么画、按什么顺序叠、哪些内容提升为独立图层，然后把矢量信息栅格化成真正的像素，最后交给 GPU 合成上屏。这就是节点十一。


<div class="bc-nav"><a href="/2026/08/21/browser-course-09/">← 09 · CSS 与 JavaScript 执行调度</a><a class="r" href="/2026/08/21/browser-course-11/">11 · 绘制、栅格化与合成 →</a></div>
