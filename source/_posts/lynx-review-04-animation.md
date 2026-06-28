---
title: "《Lynx 审查者速成课》第04讲 · 动画：从零看懂 CSS 动画，与 Lynx 的性能红线"
date: 2026-06-28 14:00:00
tags: [Lynx, ReactLynx, 前端, 代码审查, 动画, CSS, 课程]
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

<div class="lrv-key-note"><strong>本讲定位</strong>：对 CSS 动画不熟也没关系，这讲从零讲起。先记住一句话——动画分两类：<strong>声明式 CSS 动画</strong>（transition / keyframes，本讲）和<strong>跟手交互动画</strong>（主线程脚本，第 03 讲）。选错类型是最大的坑。然后讲 Lynx 的性能红线（哪些属性能动、哪些会拖垮帧率），配实战抓错与速查卡。</div>

## 第 1 章 · CSS 动画两件套（从零） <span class="lrv-b lrv-core">必读</span>

CSS 里做动画只有两种工具，先把它俩分清：

| 工具 | 干什么 | 适合 |
| --- | --- | --- |
| **transition（过渡）** | 让某个属性从 A 值**平滑变到** B 值 | 状态切换：hover、点击、展开/收起 |
| **animation + @keyframes（关键帧）** | 按时间轴走**多个关键帧**，可循环 | 加载转圈、呼吸、骨架屏、入场动画 |

一句话选择：**两个状态之间的平滑过渡用 transition；自己定义一段动画序列（尤其循环）用 keyframes。**

## 第 2 章 · transition 怎么写 <span class="lrv-b lrv-key">重点</span>

```css
.button {
  background-color: #ff351a;
  transform: scale(1);
  /* 语法：transition: 属性 时长 缓动 [延迟]，逗号分隔多条 */
  transition: background-color 0.3s ease, transform 0.2s ease;
}
.button:active {            /* 触发：状态变化时自动过渡 */
  background-color: #e63016;
  transform: scale(0.98);
}
```

触发 transition 的方式：伪类（`:active`/`:hover`/`:focus`）、或通过切换 `className`/`style` 改变属性值。`transition: all 0.3s` 能用但**不推荐**——它会监听所有属性变化，容易误动到昂贵属性（见第 4 章）。

<div class="lrv-note"><strong>移动端提示</strong>：触摸场景下按钮反馈优先用 <code>:active</code>（按下）而非 <code>:hover</code>（悬停）。<code>:hover</code> 在触摸屏上行为不稳定，别把它当作唯一的交互反馈。</div>

## 第 3 章 · @keyframes 怎么写 <span class="lrv-b lrv-key">重点</span>

```css
/* 1) 定义关键帧 */
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes spin   { from { transform: rotate(0); } to { transform: rotate(360deg); } }

/* 2) 应用：animation: 名称 时长 缓动 [次数] [填充模式] */
.fade-in { animation: fadeIn 0.3s ease-out; }
.loading { animation: spin 0.8s linear infinite; }     /* infinite = 无限循环 */
.enter   { opacity: 0; animation: slideIn 0.3s ease-out forwards; } /* forwards = 停在结束态 */
```

常见配方：淡入（opacity）、滑入（translateX + opacity）、转圈加载（rotate infinite）、呼吸/脉冲（scale + opacity 往返）、骨架屏微光（background-position 移动）。列表入场可用 `style={{ animationDelay: \`${i*0.1}s\` }}` 做逐项错峰。

## 第 4 章 · 性能红线：能动什么、不能动什么 <span class="lrv-b lrv-core">必读</span>

这是审查动画时**最该把关**的一条，也是 AI 最常忽视的：

<div class="lrv-key-note"><strong>黄金法则</strong>：动画<strong>只动 <code>transform</code> 和 <code>opacity</code></strong>。这两个属性不触发重排（reflow），最省、最跟手。<strong>避免动 <code>width</code> / <code>height</code> / <code>margin</code> / <code>top/left</code></strong>——它们每帧触发重新布局，掉帧。</div>

```css
/* ✅ 性能友好 */
.good { transition: transform 0.3s ease, opacity 0.3s ease; }

/* ❌ 拖垮帧率：每帧重排 */
.bad  { transition: width 0.3s, height 0.3s, margin 0.3s; }
```

配套手段（来自动画文档的性能建议）：

- `will-change: transform, opacity;` 提前告知引擎要动哪些属性，便于优化；**动画结束后置回 `will-change: auto`**，否则长期占资源。
- 硬件加速：`transform: translateZ(0)` 或 `translate3d(0,0,0)`。
- 限制同时运行的动画数量；复杂动画考虑用 JS（`requestAnimationFrame`）控制。

## 第 5 章 · Lynx 特别注意 <span class="lrv-b lrv-key">重点</span>

把 Web 的 CSS 动画搬到 Lynx，有几条差异要在 review 时盯：

1. **跟手动画不要用 CSS**：拖拽、滚动联动这类“跟着手指走”的动画，CSS transition/keyframes 做不到跟手，要用**主线程脚本**（第 03 讲）。区分清楚：入场/加载/状态切换 → CSS 动画；跟手 → 主线程。
2. **`@media` 不支持**：别用媒体查询切换动画参数；用视口单位或 JS。
3. **`calc()` 不能用于 `transform`**（第 01 讲）：`transform: translateX(calc(...))` 无效，先把值算好再传。
4. **`transform` 支持** translate / scale / rotate；动画优先用它们。
5. **复杂动效**：Lynx 有自研的 C++ 动效框架 **AnimaX**（适合复杂、数据驱动的动画），超出 CSS 能力时可了解；本讲不展开。

<div class="lrv-why"><strong>审查口诀</strong>：看到“跟手/拖拽/滚动联动”却用 CSS 动画 → 提示改主线程脚本；看到动画在动 <code>width/height/margin</code> → 提示改 <code>transform/opacity</code>；看到 <code>@media</code> 控制动画或 <code>transform: ...calc()</code> → 直接判错。</div>

## 第 6 章 · 实战抓错 <span class="lrv-b lrv-core">必读</span>

### 案例 A：展开动画用了 height

```css
.panel {
  height: 0;
  overflow: hidden;
  transition: height 0.3s ease;
}
.panel.open { height: 200px; }
```

<details class="lrv-fold">
<summary>展开：审查意见 <span class="lrv-b lrv-key">对照你的答案</span></summary>

**动画 `height`** —— 性能红线。每帧触发重新布局，展开会卡。可选方案：

- 用 `transform: scaleY()`（注意会拉伸内容，配 `transform-origin: top`）；
- 或用 `opacity` + `transform: translateY()` 做淡入下滑替代“高度展开”的观感；
- 确需真实高度动画时，限制频率、加 `will-change`，并接受其代价。

一句话：能用 transform/opacity 表达的观感，就别动 height。
</details>

### 案例 B：转圈 + 未清理的 will-change

```css
.spinner {
  width: 40px; height: 40px;
  border: 3px solid #f0f0f0; border-top-color: #ff351a; border-radius: 50%;
  will-change: transform, left, top;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { from { left: 0; } to { left: 360px; } }
```

<details class="lrv-fold">
<summary>展开：审查意见（2 处）<span class="lrv-b lrv-key">对照你的答案</span></summary>

1. **转圈却在动 `left`** —— 应该用 `transform: rotate()`。动 `left` 既不是“旋转”语义、又触发重排。`@keyframes spin` 应是 `from{transform:rotate(0)} to{transform:rotate(360deg)}`。
2. **`will-change` 列了 `left`/`top` 且无限动画下永不清理** —— `will-change` 只该列真正会动的属性（这里是 `transform`），且无限动画会让它长期占资源；若是一次性动画，结束后应置回 `auto`。

修正：`will-change: transform; animation: spin 0.8s linear infinite;` + keyframes 用 `transform: rotate`。
</details>

## 第 7 章 · 自测错题 <span class="lrv-b lrv-key">重点</span>

<details class="lrv-fold">
<summary>Q1：做一个无限转圈的加载图标，用 transition 还是 @keyframes？</summary>

**@keyframes**（配 `animation: spin … infinite`）。transition 只在两个状态间过渡一次，做不了自循环。
</details>

<details class="lrv-fold">
<summary>Q2：两个动画方案——A 动 <code>margin-left</code>，B 动 <code>transform: translateX</code>，选哪个？为什么？</summary>

**B**。`transform` 不触发重排，性能好、跟手；`margin` 每帧重新布局，掉帧。动画优先 transform/opacity。
</details>

<details class="lrv-fold">
<summary>Q3：一个拖拽卡片要跟着手指走，用 CSS transition 行不行？</summary>

**不行**。跟手交互 CSS 动画做不到，要用主线程脚本（`main-thread:` + `'main thread'`，第 03 讲），在事件里同步 `setStyleProperty('transform', …)`。
</details>

<details class="lrv-fold">
<summary>Q4：<code>transform: translateX(calc(100% - 20px))</code> 在 Lynx 动画里能用吗？</summary>

**不能**。`calc()` 不支持用于 `transform`。先把目标位移算成具体值再传给 transform。
</details>

<details class="lrv-fold">
<summary>Q5（判断）：移动端按钮按下反馈，用 <code>:hover</code> 最稳。</summary>

**错**。触摸屏上 `:hover` 行为不稳定，按下反馈用 `:active` 更可靠。
</details>

## 速查卡 · 04 讲 <span class="lrv-b lrv-core">必读</span>

<div class="lrv-card">
<strong>两件套</strong>：状态过渡用 <code>transition</code>；关键帧序列/循环用 <code>@keyframes + animation</code>。<br>
<strong>性能黄金法则</strong>：动画<u>只动 <code>transform</code> 和 <code>opacity</code></u>；避免动 <code>width/height/margin/top/left</code>（重排掉帧）；<code>will-change</code> 用完置回 <code>auto</code>。<br>
<strong>Lynx 红线</strong>：跟手动画走主线程脚本（非 CSS）；<code>@media</code> 不支持；<code>transform</code> 里不能用 <code>calc()</code>；触摸反馈用 <code>:active</code> 非 <code>:hover</code>；复杂动效了解 AnimaX。
</div>

<div class="lrv-key-note"><strong>下一讲预告</strong>：第 05 讲是番外篇，回答一个很多人困惑的问题——<strong>为什么 AI（hdt）操作手机上的 Lynx 页面，比操作 Web 难得多、总是点不准？根因是什么、怎么解？</strong>这一讲会从“截图点坐标 vs DOM 取坐标”讲到 Lynx DevTool 的精确点击流程。</div>
