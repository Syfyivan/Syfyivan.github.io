---
title: "《Lynx 审查者速成课》第05讲 · 番外：为什么 AI 操作 Lynx 页面比 Web 难、总点不准？"
date: 2026-06-28 15:00:00
tags: [Lynx, ReactLynx, 自动化, Agent, DevTool, CDP, 课程]
categories: [技术笔记]
toc: true
visibility: public
---

<style>
.lrv-b{display:inline-block;font-size:12px;font-weight:700;padding:1px 8px;border-radius:999px;vertical-align:middle;margin-left:6px;line-height:1.7;white-space:nowrap}
.lrv-core{color:#fff;background:#b73a2c}
.lrv-key{color:#b73a2c;background:rgba(183,58,44,.1);border:1px solid rgba(183,58,44,.3)}
.lrv-skim{color:#3f5d7e;background:rgba(63,93,126,.1);border:1px solid rgba(63,93,126,.25)}
.lrv-skip{color:#69727d;background:rgba(105,114,125,.12);border:1px solid rgba(105,114,125,.25)}
.lrv-note{margin:14px 0;padding:12px 16px;border-left:3px solid #3f5d7e;background:rgba(63,93,126,.06);border-radius:0 4px 4px 0}
.lrv-why{margin:14px 0;padding:12px 16px;border-left:3px solid #69727d;background:rgba(105,114,125,.07);border-radius:0 4px 4px 0;color:#3a4049}
.lrv-key-note{margin:14px 0;padding:12px 16px;border-left:3px solid #b73a2c;background:rgba(183,58,44,.06);border-radius:0 4px 4px 0}
.lrv-fold{margin:14px 0;border:1px solid rgba(29,33,39,.14);border-radius:6px;background:#fafafa;padding:0 16px}
.lrv-fold>summary{cursor:pointer;padding:12px 0;font-weight:700;color:#1d2127}
.lrv-fold[open]{padding-bottom:8px}
.lrv-legend{margin:14px 0;padding:12px 16px;border:1px dashed rgba(29,33,39,.2);border-radius:6px;background:#fcfcfc;font-size:14px;line-height:2}
.lrv-card{margin:16px 0;padding:14px 18px;border:1px solid rgba(183,58,44,.25);border-radius:8px;background:rgba(183,58,44,.03)}
html[data-user-color-scheme="dark"] .lrv-note{background:rgba(126,168,224,.1);border-left-color:#7ea8e0;color:#c9cdd4}
html[data-user-color-scheme="dark"] .lrv-why{background:rgba(255,255,255,.04);border-left-color:#8b93a0;color:#aeb4be}
html[data-user-color-scheme="dark"] .lrv-key-note{background:rgba(224,108,92,.12);border-left-color:#e0746b;color:#d6dae0}
html[data-user-color-scheme="dark"] .lrv-fold{background:rgba(255,255,255,.03);border-color:rgba(255,255,255,.14)}
html[data-user-color-scheme="dark"] .lrv-fold>summary{color:#e6e8ec}
html[data-user-color-scheme="dark"] .lrv-card{background:rgba(224,108,92,.08);border-color:rgba(224,108,92,.3);color:#d6dae0}
html[data-user-color-scheme="dark"] .lrv-legend{background:rgba(255,255,255,.03);border-color:rgba(255,255,255,.18)}
html[data-user-color-scheme="dark"] .lrv-key{color:#ef9a8e;background:rgba(224,108,92,.14);border-color:rgba(224,108,92,.4)}
html[data-user-color-scheme="dark"] .lrv-skim{color:#9fc1ec;background:rgba(126,168,224,.14);border-color:rgba(126,168,224,.35)}
html[data-user-color-scheme="dark"] .lrv-skip{color:#aab1bb;background:rgba(170,180,190,.14);border-color:rgba(170,180,190,.3)}
</style>

<div class="lrv-key-note"><strong>本讲定位</strong>：这是番外篇，跳出“审查代码”，回答一个很多人困惑的问题——让 AI / 自动化（hdt）去操作手机上的 Lynx 页面，为什么比操作 Web 难得多、点击老是偏？一句话答案：<strong>大多数失败是因为“从截图里猜坐标”，而 Lynx 的正确做法是“从 DevTool 的 DOM 几何里取坐标”。</strong>下面讲清根因、给出精确点击的标准流程，以及点偏了怎么排错。</div>

## 第 1 章 · 现象 <span class="lrv-b lrv-core">必读</span>

典型流程是：截图 → 让模型看图找按钮 → 估算坐标 → 点。在 Web 上这套也能用，但在 Lynx 上**点击经常偏、点空、或点到旁边**，重试也不稳定。问题不在模型“眼神不好”，而在**坐标是怎么来的**。

## 第 2 章 · 为什么 Web 容易 <span class="lrv-b lrv-key">重点</span>

Web 页面天然暴露两样东西，让自动化很好做：

- **DOM 树**：可以用 CSS 选择器 / XPath 精确定位元素，拿到它的精确包围盒（`getBoundingClientRect`）。
- **无障碍树（accessibility tree）**：元素有 role / label / name，自动化框架（如 Selenium/Playwright/Appium-web）按语义点击，不依赖像素。

所以 Web 自动化是**按元素**点，不是按像素点——元素在哪、多大，框架直接知道。

## 第 3 章 · 为什么 Lynx 难（根因） <span class="lrv-b lrv-core">必读</span>

Lynx 页面是**原生渲染**的（自绘视图），不是浏览器里的 HTML 文档。于是：

1. **没有现成的 Web DOM / 无障碍树**暴露给 OS 级自动化去“按元素点”。默认能拿到的只有一张**截图**。
2. **截图 → 坐标是“猜”**：从像素反推元素位置本就有误差，按钮小一点、风格统一一点就容易认错位置。
3. **坐标空间不匹配**（最隐蔽）：截图像素坐标 ≠ Lynx 引擎的 CDP 逻辑坐标。中间隔着设备像素比（DPR）/ density / scale；Android `fullscreen` 模式还要减去 LynxView 的物理屏幕原点；iOS `lynxview` 模式要把点转换到 key window；各平台换算还不一样。**你自己做这套换算极易错。**
4. **动态布局让坐标漂移**：linear 默认不撑满、list 回收复用、任何 relayout，都会让元素位置变化；你读到坐标、还没点，页面可能已经变了。
5. **双线程异步渲染**：UI 在主线程渲染、逻辑在后台线程（见第 00 讲），截图那一刻的画面可能**滞后**于真实状态，于是点到“旧位置”。

<div class="lrv-why"><strong>归一句</strong>：Web 自动化是“按元素”，Lynx 默认只能“按截图像素”，而像素到真实可点坐标之间隔着一串容易出错的换算与时序问题——这就是“总点不准”的根因。</div>

## 第 4 章 · 解法：别用截图坐标，用 DevTool 的 DOM 几何 <span class="lrv-b lrv-core">必读</span>

好消息：Lynx 虽然不暴露 Web DOM，但 **Lynx DevTool 暴露了一套 CDP（Chrome DevTools Protocol）接口**，能拿到元素的**真实几何**。正确姿势是用它取坐标，而不是从截图猜。标准五步：

1. **找节点**：`DOM.querySelector` / `DOM.performSearch` / 或遍历 `DOM.getDocument`。最好让页面给可交互元素加**稳定标识**（如 `lynx-test-tag`），用它来 query。
2. **滚到可见**：`DOM.scrollIntoViewIfNeeded`。
3. **取包围盒**：`DOM.getBoxModel`，算 `model.content` 的中心点（太小/空就用 `model.border`）。
4. **校验命中**：`DOM.getNodeForLocation` 验这个点；**返回 `{nodeId: 0}` 就先别点**。
5. **下发点击**：`Input.emulateTouchFromMouseEvent` 发 `mousePressed` + `mouseReleased`，**用同一个 x/y**，两条消息背靠背发。

关键代码（精简自 DevTool 程序化点击示例）：

```js
async function getPointFromDom(selector) {
  const doc = await cdp("DOM.getDocument", { depth: 0 });
  const { nodeId } = (await cdp("DOM.querySelector", { nodeId: doc.root.nodeId, selector })).result;
  if (!nodeId) throw new Error("no node: " + selector);
  await cdp("DOM.scrollIntoViewIfNeeded", { nodeId });
  const box = (await cdp("DOM.getBoxModel", { nodeId })).result.model;
  const q = box.content;                          // [x1,y1,x2,y2,x3,y3,x4,y4]
  const point = { x: (Math.min(q[0],q[4]) + Math.max(q[0],q[4]))/2,
                  y: (Math.min(q[1],q[5]) + Math.max(q[1],q[5]))/2 };
  const hit = (await cdp("DOM.getNodeForLocation", point)).result;
  if (!hit.nodeId) throw new Error("point hit nothing");  // 不命中，别点
  return point;                                   // 已是 Input 所需的 CDP 逻辑坐标
}
// 然后：Input.emulateTouchFromMouseEvent mousePressed → mouseReleased（同 x/y）
```

<div class="lrv-key-note"><strong>为什么这样就准了</strong>：<code>DOM.getBoxModel</code> / <code>DOM.getNodeForLocation</code> 返回的就是引擎层的逻辑坐标，<strong>可以直接喂给 <code>Input</code></strong>——引擎内部会自己做 density / 原点 / key-window 换算。你不碰换算，自然不会换算错。</div>

## 第 5 章 · 铁律（直接照做） <span class="lrv-b lrv-key">重点</span>

<div class="lrv-legend">
<span>① <strong>不要</strong>从截图取点击坐标。</span><br>
<span>② <strong>不要</strong>自己做 density / DPR / scale / 平台换算——引擎会做。</span><br>
<span>③ <strong>不要</strong>用 <code>Lynx.getRectToWindow</code> / <code>getViewLocationOnScreen</code> 作为点击坐标来源。</span><br>
<span>④ 滚动 / reload / 布局变化 / 新开 session 后，<strong>重新取 box model</strong>。</span><br>
<span>⑤ <code>DOM.getNodeForLocation</code> 返回 0 时，<strong>先别下发 Input</strong>。</span><br>
<span>⑥ 截图只用于看可见性 / 遮挡 / 明显布局变化，<strong>不</strong>回算成点击坐标。</span>
</div>

## 第 6 章 · 点了还是偏？排错 <span class="lrv-b lrv-key">重点</span>

<details class="lrv-fold">
<summary>展开：<code>getNodeForLocation</code> 返回 0 的常见原因 <span class="lrv-b lrv-skim">可跳读</span></summary>

- 点在可视 Lynx 视图之外；
- 目标隐藏、已分离、或还没布局完成；
- 目标被 overlay 遮挡（这时去 query overlay 节点、算它的点）；
- 这个点其实来自截图或宿主窗口几何，而非 DOM 几何；
- 读完 `getBoxModel` 后页面又变了。

处理：`scrollIntoViewIfNeeded` → 再 `getBoxModel` → 先用 `content` 中心、不行用 `border` → 再 `getNodeForLocation` 校验。
</details>

<details class="lrv-fold">
<summary>展开：校验通过、但 Input 仍然点偏 <span class="lrv-b lrv-skim">可跳读</span></summary>

- 校验和下发之间，有截图命令或 `Page.startScreencast` 改了坐标模式；
- 两步之间页面发生了 relayout；
- `mousePressed` 和 `mouseReleased` 的 x/y 不一致；
- 用程序化 stream 让两条 Input 背靠背发，避免中间插入其它操作；
- session 过期（stale）：重新 `list-sessions`，过期 session 会把正确的点打到错的页面上。
</details>

## 第 7 章 · 对开发者 / 审查者的启示 <span class="lrv-b lrv-core">必读</span>

这一讲虽是讲自动化，但对你写/审 Lynx 页面有直接启发：

<div class="lrv-note"><strong>给可交互元素加稳定的可定位标识</strong>（如约定的 <code>lynx-test-tag</code> / 稳定 <code>id</code>）。有了它，自动化和 Agent 就能用 <code>DOM.querySelector</code> 精确定位，不必猜坐标——稳定性立刻上一个台阶。</div>

所以 review 时可以多提一句：**“这个关键按钮/入口没有稳定的可定位标识，会拖累自动化测试与 Agent 操作。”** 这是一条很多人想不到、但很值钱的审查意见。

## 第 8 章 · 自测错题 <span class="lrv-b lrv-key">重点</span>

<details class="lrv-fold">
<summary>Q1：AI 操作 Lynx 点击总是偏，最该先怀疑哪一步？</summary>

**坐标是不是从截图猜的**。Lynx 自动化点偏，绝大多数是因为用截图像素当点击坐标。改用 `DOM.getBoxModel` 取真实几何。
</details>

<details class="lrv-fold">
<summary>Q2：从 <code>DOM.getBoxModel</code> 拿到点后，要不要按 DPR/density 自己换算再发给 Input？</summary>

**不要**。DOM 几何返回的就是 CDP 逻辑坐标，直接喂给 `Input.emulateTouchFromMouseEvent`，引擎内部会做密度/原点/窗口换算。自己换算反而会错。
</details>

<details class="lrv-fold">
<summary>Q3：<code>DOM.getNodeForLocation</code> 返回 <code>{nodeId: 0}</code>，该怎么办？</summary>

**先别点**。说明该点没命中可点节点：可能在视图外、未布局、被遮挡、或坐标来源错。先 `scrollIntoViewIfNeeded` + 重取 `getBoxModel` + 重新校验；若被 overlay 挡，改点 overlay 节点。
</details>

<details class="lrv-fold">
<summary>Q4：为什么 Web 自动化按选择器点就很稳，Lynx 默认不行？</summary>

Web 暴露 DOM + 无障碍树，框架按元素/语义定位；Lynx 是原生渲染，默认只给截图，没有 Web DOM 供 OS 级自动化按元素点。解法是用 Lynx DevTool 的 CDP DOM 接口取元素几何。
</details>

<details class="lrv-fold">
<summary>Q5：作为页面开发者，能为“让 Agent 操作更准”做的最简单一件事是什么？</summary>

给关键可交互元素加**稳定的可定位标识**（test tag / id），让自动化能用 `DOM.querySelector` 精确定位，不必从截图猜坐标。
</details>

## 速查卡 · 05 讲 <span class="lrv-b lrv-core">必读</span>

<div class="lrv-card">
<strong>根因</strong>：Lynx 原生渲染、无 Web DOM 暴露给 OS 自动化 → 默认只能截图猜坐标 → 像素到逻辑坐标之间隔着 DPR/原点/平台换算 + 动态布局 + 双线程时序，于是总偏。<br>
<strong>解法（五步）</strong>：querySelector 找节点 → scrollIntoViewIfNeeded → getBoxModel 取 content 中心 → getNodeForLocation 校验(返 0 别点) → Input 同坐标 press+release。<br>
<strong>铁律</strong>：不用截图坐标、不自己换算 DPR、布局变了重取 box、截图只用于看可见性。<br>
<strong>开发侧</strong>：给可交互元素加稳定 test tag / id。
</div>

<div class="lrv-key-note"><strong>系列说明</strong>：00–02 是地基与样式/布局红线，03 交互、04 动画、05 自动化番外。后续可继续 06 高频元素（scroll-view / list / text 陷阱）、07 把 reactlynx 扫描器变成你能一键跑的 review 工具。想先看哪讲、或想要某讲更深，随时说。</div>
