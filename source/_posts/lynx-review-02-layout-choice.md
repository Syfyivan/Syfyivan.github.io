---
title: "《Lynx 审查者速成课》第02讲 · 布局选型：四选一怎么判，选错是什么味道"
date: 2026-06-28 12:00:00
tags: [Lynx, ReactLynx, 前端, 代码审查, 布局, 课程]
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
</style>

<div class="lrv-key-note"><strong>本讲定位</strong>：Lynx 有四套布局——linear / flex / grid / relative。审查时你要判两件事：① 这个场景选对布局了吗？② 选对了，写法有没有踩 Lynx 与 Web 的差异？本讲给你一张决策图 + 每种布局“选错/写错的味道”。</div>

## 第 1 章 · 四选一决策表 <span class="lrv-b lrv-core">必读</span>

| 场景 | 该用 | 一句话理由 |
| --- | --- | --- |
| 简单列表 / 单方向排列（性能优先） | **linear**（默认） | 类 flex column，但更快 |
| 需要 wrap、order、复杂弹性 | **flex** | 标准 Flexbox |
| 二维网格 | **grid** | CSS Grid 子集 |
| 相对某元素定位（头像+名+按钮） | **relative** | 类 Android RelativeLayout |

<div class="lrv-note"><strong>审查默认值</strong>：没特殊需求时，linear（默认布局）就是对的，性能也最好。看到简单的纵向列表却写了一堆 <code>display:flex</code> + 对齐属性，不一定是错，但可以问一句“这里需要 flex 吗”。</div>

## 第 2 章 · linear：默认布局，最大的坑是“不撑满” <span class="lrv-b lrv-key">重点</span>

linear 类似 Android LinearLayout，不写 `display` 就是它。复习上一讲的核心坑：**子元素不会自动撑满父宽**。

它的专属属性是审查识别点（看到这些就知道是 linear）：

```css
.row {
  display: linear;
  linear-orientation: horizontal;   /* 或 row；2.2+ 也可用 linear-direction */
}
.main   { linear-weight: 1; }        /* 占据剩余空间，类似 flex-grow */
.center { linear-gravity: center; }  /* 主轴对齐 */
.item   { linear-layout-gravity: stretch; } /* 单个子元素交叉轴拉伸 */
```

<div class="lrv-why"><strong>选错的味道</strong>：需要换行（wrap）、需要 <code>order</code> 调序、需要多行对齐（align-content）——这些 linear <strong>都不支持</strong>。看到 AI 在 linear 容器上写 <code>flex-wrap</code> / <code>order</code>，说明它该用 flex 却用了 linear，属性会被忽略。</div>

## 第 3 章 · flex：最像 Web，但有两个默认值不一样 <span class="lrv-b lrv-key">重点</span>

flex 基本和 Web 一致，但有两个 Lynx 差异是审查高频点：

<div class="lrv-key-note"><strong>差异 1：<code>justify-content</code> 默认值是 <code>stretch</code></strong>（Web 是 <code>flex-start</code>）。AI 按 Web 直觉以为子元素会靠左起始排，实际可能被拉伸。要靠左请<strong>显式</strong>写 <code>justify-content: flex-start</code>。</div>

```css
/* 差异 2：flex-basis: min-content 不支持，会被当成 0px */
.item { flex-basis: min-content; } /* ❌ */
.item { flex-basis: auto; }        /* ✅ */
```

另外别忘上一讲的：flex 子元素若是 `<text>`，可能要 `white-space: nowrap` 防止意外换行。

## 第 4 章 · grid：能用，但简写全是雷 <span class="lrv-b lrv-core">必读</span>

Lynx 的 grid 是**子集**。最容易被放过的雷是：**所有定位简写都不支持，而且静默失效**。

```css
/* ❌ 以下简写在 Lynx 全部无效（不报错，但不生效） */
.item { grid-column: 1 / 3; }
.item { grid-column: span 2; }
.item { grid-row: 1 / 3; }
.item { grid-area: 1 / 1 / 2 / 3; }

/* ✅ 必须用拆开写法 */
.item { grid-column-start: 1; grid-column-end: 3; }
.item { grid-column-span: 2; }   /* Lynx 特有简写，这个可以 */
```

<div class="lrv-note"><strong>审查信号</strong>：看到 <code>grid-column: span 2</code> 这种 Web 常见写法，直接判错——它会被静默忽略，元素不会跨列。改成 <code>grid-column-span: 2</code> 或 <code>grid-column-start/end</code>。</div>

<details class="lrv-fold">
<summary>展开：grid 的其它限制 + 没有 @media 怎么响应式 <span class="lrv-b lrv-skim">可跳读</span></summary>

不支持：命名网格线、`grid-area` 简写、subgrid。`minmax()` 基本支持，复杂场景可能与 Web 不一致。

**Lynx 不支持 `@media`**。想响应式，要么用视口单位（`vw`），要么用 `flex-wrap` + `flex-basis: 1 1 40vw` 让列数自适应，要么 JS 动态算列数。看到 AI 用 `@media` 写 Lynx 响应式栅格——错。

另外 grid 的 `align-items` 用的是 flex 系的值（`flex-start`/`flex-end`），不是 Web Grid 的 `start`/`end`。
</details>

## 第 5 章 · relative：漏 id 就全堆左上角 <span class="lrv-b lrv-skim">可跳读</span>

relative 类似 Android RelativeLayout，每个元素用 `relative-id` 标识，再引用别人的 id 定位。它的两个典型 bug：

```css
.container { display: relative; }
.avatar   { relative-id: 1; relative-align-left: parent; relative-align-top: parent; }
.name     { relative-id: 2; relative-right-of: 1; }   /* 在头像右边 */
```

<div class="lrv-why"><strong>选错/写错的味道</strong>：① 元素<strong>没设任何相对属性</strong>——会全部堆叠在左上角（经典“所有东西叠一起”）。② <strong>循环引用</strong>（A 依赖 B、B 又依赖 A）——布局错乱。③ 同一父容器内 <code>relative-id</code> 重复——定位失效。审查 relative 布局，先数 id 唯一性和有没有元素漏了定位属性。</div>

## 第 6 章 · 实战抓错 <span class="lrv-b lrv-core">必读</span>

“AI 写的”一个 2×2 图片宫格 + 一个大图跨格。**先别翻**，找问题：

```css
.gallery {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}
.gallery .big {
  grid-column: span 2;   /* 想让大图横跨两列 */
}
.gallery .item {
  justify-content: flex-start;
}
@media (min-width: 600px) {
  .gallery { grid-template-columns: repeat(4, 1fr); }
}
```

<details class="lrv-fold">
<summary>展开：审查意见（共 2 处硬错 + 1 处观察）<span class="lrv-b lrv-key">对照你的答案</span></summary>

1. **`grid-column: span 2`** —— <span class="lrv-b lrv-core">静默失效</span>。Lynx 不支持该简写，大图不会跨列。改为 `grid-column-span: 2`。
2. **`@media (min-width: 600px)`** —— Lynx 不支持 `@media`，这段响应式完全不生效。要么用 `vw` 单位，要么用 `flex-wrap` 方案，要么 JS 动态算列数。
3. **观察**：`.item { justify-content: flex-start }` 写在 grid 子项上意义不大（`justify-content` 是容器属性）；作者可能想要 `justify-self`。不算致命，但提示作者对 grid 属性归属有混淆。

修正方向：

```css
.gallery .big { grid-column-span: 2; }   /* ✅ */
/* 响应式改用视口单位或 flex-wrap，去掉 @media */
```
</details>

## 第 7 章 · 自测错题 <span class="lrv-b lrv-key">重点</span>

<details class="lrv-fold">
<summary>Q1：一个纵向的简单列表，AI 用了 <code>display:flex; flex-direction:column</code>，要打回吗？</summary>

**不必当错**，但可优化。纵向简单列表用默认的 linear 性能更好。这属于“可以更好”而非“错误”，审查时给建议即可，别误判为 bug。
</details>

<details class="lrv-fold">
<summary>Q2：<code>grid-row: 1 / 3</code> 让元素跨两行，能生效吗？</summary>

**不能**。grid 的 `/` 简写在 Lynx 静默失效。用 `grid-row-start: 1; grid-row-end: 3;` 或 `grid-row-span: 2;`。
</details>

<details class="lrv-fold">
<summary>Q3：一个 flex 行，AI 没写 <code>justify-content</code>，以为子元素会靠左排，对吗？</summary>

**不对**。Lynx 中 `justify-content` 默认是 `stretch`，不是 Web 的 `flex-start`。要靠左必须显式写 `justify-content: flex-start`。
</details>

## 小结

- 选型口诀：简单列表 **linear**、弹性 **flex**、二维 **grid**、相对定位 **relative**。
- 每种都有“选错/写错的味道”：linear 上写 `flex-wrap`、flex 漏写 `justify-content`、grid 用 `/` 和 `span` 简写、relative 漏 id。
- grid 的简写和 `@media` 是本讲最该记的两颗静默雷。

<div class="lrv-key-note"><strong>三讲回顾</strong>：00 装心智模型（不是浏览器 + 双线程）、01 样式红线、02 布局选型——你已经能拦住样式层的大部分 AI 坑了。后续 03–04 继续样式层（选择器细节、高频元素陷阱），05–07 进运行时层（双线程实战、性能、把 reactlynx 扫描器变成你的工具）。</div>
