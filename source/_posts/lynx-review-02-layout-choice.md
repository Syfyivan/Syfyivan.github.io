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
.lrv-card{margin:16px 0;padding:14px 18px;border:1px solid rgba(183,58,44,.25);border-radius:8px;background:rgba(183,58,44,.03)}
</style>

<div class="lrv-key-note"><strong>本讲定位</strong>：Lynx 有四套布局——linear / flex / grid / relative。审查时你要判两件事：① 这个场景选对布局了吗？② 选对了，写法有没有踩 Lynx 与 Web 的差异？本讲给你一张决策表 + 每种布局的完整属性与“选错/写错的味道” + 两个实战抓错 + 速查卡。</div>

## 第 1 章 · 四选一决策表 <span class="lrv-b lrv-core">必读</span>

| 场景 | 该用 | 一句话理由 | 性能 |
| --- | --- | --- | --- |
| 简单列表 / 单方向排列 | **linear**（默认） | 类 flex column，更快 | 最佳 |
| 需要 wrap、order、多行对齐、复杂弹性 | **flex** | 标准 Flexbox | 稍慢 |
| 二维网格 | **grid** | CSS Grid 子集 | 中 |
| 相对某元素定位（头像+名+按钮、聊天气泡） | **relative** | 类 Android RelativeLayout | 中 |

<div class="lrv-note"><strong>审查默认值</strong>：没特殊需求时，linear（默认布局）就是对的，性能也最好。看到简单纵向列表却写了一堆 <code>display:flex</code> + 对齐属性，不一定错，但可以问一句“这里需要 flex 吗”。</div>

## 第 2 章 · linear：默认布局，最大坑是“不撑满” <span class="lrv-b lrv-key">重点</span>

linear 类似 Android LinearLayout，不写 `display` 就是它，默认纵向（`column`）。复习上一讲的核心坑：**子元素不会自动撑满父宽**。

它的专属属性是审查识别点（看到这些就知道是 linear），分清「容器属性」和「子元素属性」：

```css
/* 容器属性 */
.row {
  display: linear;
  linear-orientation: horizontal;   /* 或 row；2.2+ 可用 linear-direction */
  linear-gravity: center;           /* 子元素整体在主轴的对齐 */
  linear-cross-gravity: stretch;    /* 所有子元素在交叉轴的默认对齐（1.6+） */
}
/* 子元素属性 */
.main { linear-weight: 1; }              /* 占据剩余空间，类似 flex-grow */
.item { linear-layout-gravity: stretch; }/* 单个子元素交叉轴拉伸/对齐 */
```

<div class="lrv-why"><strong>选错的味道</strong>：需要换行（wrap）、需要 <code>order</code> 调序、需要多行对齐（align-content）——这些 linear <strong>都不支持</strong>。看到 AI 在 linear 容器上写 <code>flex-wrap</code> / <code>order</code> / <code>align-content</code>，说明它该用 flex 却用了 linear，属性会被静默忽略。</div>

<details class="lrv-fold">
<summary>展开：linear 的 gravity 家族与 weight 分配 <span class="lrv-b lrv-skim">可跳读</span></summary>

- `linear-gravity`（容器，主轴对齐）：`top/bottom/left/right`（物理方向，按 orientation 映射）、`center/center-vertical/center-horizontal`、`start/end`、`space-between`。
- `linear-layout-gravity`（子元素，交叉轴）：`stretch`（1.6+）、`fill-vertical/fill-horizontal`、`center`、`start/end`（1.6+）等。注意 `stretch` 是逻辑方向填充，和 `fill-*` 不同。
- `linear-cross-gravity`（容器，统一交叉轴）：`start/end/center/stretch`。
- `linear-weight` + `linear-weight-sum`：按权重分剩余空间。`weight-sum: 100` + 两个子元素 `weight: 30 / 70` = 30% / 70%。
</details>

## 第 3 章 · flex：最像 Web，但两个默认值不一样 <span class="lrv-b lrv-key">重点</span>

flex 基本和 Web 一致，但有两个 Lynx 差异是审查高频点：

<div class="lrv-key-note"><strong>差异 1：<code>justify-content</code> 默认值是 <code>stretch</code></strong>（Web 是 <code>flex-start</code>）。AI 按 Web 直觉以为子元素靠左起始排，实际可能被拉伸。要靠左请<strong>显式</strong>写 <code>justify-content: flex-start</code>。</div>

```css
/* 差异 2：flex-basis: min-content 不支持，会被当成 0px */
.item { flex-basis: min-content; } /* ❌ */
.item { flex-basis: auto; }        /* ✅ */
```

其余和 Web 一致的部分（审查时按 Web 知识即可）：`flex-direction`、`flex-wrap`、`align-items`（默认 stretch）、`align-self`、`align-content`（需 wrap）、`order`、`flex`/`flex-grow`/`flex-shrink`、`gap`/`row-gap`/`column-gap`。别忘上一讲的：flex 子元素若是 `<text>`，可能要 `white-space: nowrap` 防止意外换行。

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
.item { grid-row-span: 2; }
```

<div class="lrv-note"><strong>审查信号</strong>：看到 <code>grid-column: span 2</code> 或 <code>grid-row: 1 / 3</code> 这种 Web 常见写法，直接判错——会被静默忽略，元素不跨格。</div>

其它要点（按这张表审）：

| 特性 | Lynx grid |
| --- | --- |
| `grid-template-columns/rows`、`repeat()` | ✅ |
| `grid-auto-flow`（row/column/dense…） | ✅ |
| `grid-column/row-start/end`、`*-span` | ✅ |
| `grid-column` `grid-row` `grid-area` 简写 | ❌ 静默失效 |
| 命名网格线、subgrid | ❌ |
| `minmax()` | ⚠️ 基本支持，复杂场景可能与 Web 不一致 |
| `@media` 响应式 | ❌ 不支持 |
| `align-items` 的值 | 用 flex 系 `flex-start/flex-end`，**不是** Grid 的 `start/end` |

<details class="lrv-fold">
<summary>展开：没有 @media 怎么响应式 + Table 布局怎么迁移 <span class="lrv-b lrv-skim">可跳读</span></summary>

**响应式**（Lynx 无 `@media`）：用视口单位，或用 `flex-wrap` + `flex-basis: 1 1 40vw` 让列数自适应，或 JS 动态算列数。看到 AI 用 `@media` 写 Lynx 栅格——错。

**Table → Grid**：Lynx **完全不支持** `display: table*`（及 `border-spacing`/`border-collapse`/`table-layout`）。用 grid 替代：`<table>` → `display:grid` 容器，`<td>` → 子 `<view>`，`border-spacing` → `gap`，固定列宽 → `grid-template-columns: repeat(N, width)`。若 Web 语义依赖 table 本身（如 `table-cell` 垂直对齐、自动列宽算法），则无法精确还原。
</details>

## 第 5 章 · relative：漏 id 就全堆左上角 <span class="lrv-b lrv-key">重点</span>

relative 类似 Android RelativeLayout，每个元素用 `relative-id` 标识，再引用别人的 id 定位。适合卡片（头像+文字+按钮）、聊天气泡、复杂表单项。

```css
.container { display: relative; }
.avatar { relative-id: 1; relative-align-left: parent; relative-align-top: parent; }
.name   { relative-id: 2; relative-right-of: 1; relative-align-top: 1; } /* 头像右边、顶部对齐 */
.desc   { relative-id: 3; relative-right-of: 1; relative-bottom-of: 2; } /* 名字下方 */
```

定位属性：`relative-align-top/bottom/left/right`（对 parent 或某 id）、`relative-top-of/bottom-of/left-of/right-of`（在某 id 的某侧）、`relative-center: vertical/horizontal/both`。

<div class="lrv-why"><strong>选错/写错的味道（审查三查）</strong>：① 元素<strong>没设任何相对属性</strong> → 全部堆叠在左上角（经典“东西叠一起”）。② <strong>循环引用</strong>（A 依赖 B、B 又依赖 A）→ 布局错乱。③ 同一父容器内 <code>relative-id</code> <strong>重复</strong> → 定位失效。审查 relative，先数 id 唯一性、再看有没有元素漏了定位属性。</div>

<details class="lrv-fold">
<summary>展开：RTL（阿拉伯语等）用逻辑方向属性 <span class="lrv-b lrv-skim">可跳读</span></summary>

要适配从右到左语言，用逻辑方向替代物理方向（2.0+）：`relative-align-left` → `relative-align-inline-start`、`relative-align-right` → `relative-align-inline-end`、`relative-left-of` → `relative-inline-start-of`、`relative-right-of` → `relative-inline-end-of`。它们在 LTR/RTL 下自动镜像。审查国际化页面时，看到硬编码的 left/right 可以提示改逻辑方向。
</details>

## 第 6 章 · 实战抓错 <span class="lrv-b lrv-core">必读</span>

### 案例 A：图片宫格

“AI 写的”一个 2×N 宫格 + 大图跨格。**先别翻**，找问题：

```css
.gallery {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}
.gallery .big  { grid-column: span 2; }      /* 想让大图横跨两列 */
.gallery .item { justify-content: flex-start; }
@media (min-width: 600px) {
  .gallery { grid-template-columns: repeat(4, 1fr); }
}
```

<details class="lrv-fold">
<summary>展开：审查意见（2 处硬错 + 1 处观察）<span class="lrv-b lrv-key">对照你的答案</span></summary>

1. **`grid-column: span 2`** —— <span class="lrv-b lrv-core">静默失效</span>。Lynx 不支持该简写，大图不会跨列。改为 `grid-column-span: 2`。
2. **`@media (min-width: 600px)`** —— Lynx 不支持 `@media`，这段响应式完全不生效。改用 `vw` 单位、`flex-wrap` 方案，或 JS 动态算列数。
3. **观察**：`.item { justify-content: flex-start }` 写在 grid 子项上意义不大（`justify-content` 是容器属性）；作者可能想要 `justify-self`。不致命，但提示对 grid 属性归属有混淆。
</details>

### 案例 B：用户卡片

这段在 linear/flex 之间犯了糊涂：

```css
.card {
  display: linear;
  linear-orientation: horizontal;
  flex-wrap: wrap;          /* 想换行 */
}
.card .name {
  /* 想和头像等高、占满剩余宽度 */
}
.card .tags { order: 2; }   /* 想让标签排到最后 */
```

<details class="lrv-fold">
<summary>展开：审查意见（3 处）<span class="lrv-b lrv-key">对照你的答案</span></summary>

1. **linear 上写 `flex-wrap`** —— linear 不支持换行，属性被忽略。要换行就**改用 `display: flex` + `flex-wrap: wrap`**。
2. **linear 上写 `order`** —— linear 不支持 `order`，标签不会排到最后。同样需要 flex。
3. **`.name` 想占满剩余宽度/等高** —— 在 linear 里应是 `linear-weight: 1`（占剩余）+ `linear-layout-gravity: stretch`（等高）；若整体改 flex，则是 `flex: 1` + `align-items: stretch`。

结论：这个卡片同时要 wrap 和 order，**根本就该用 flex**，作者选错了布局。这是“选型错”而非“写法错”，审查时要点出根因。
</details>

## 第 7 章 · 自测错题 <span class="lrv-b lrv-key">重点</span>

<details class="lrv-fold">
<summary>Q1：一个纵向简单列表，AI 用了 <code>display:flex; flex-direction:column</code>，要打回吗？</summary>

**不必当错**，但可优化。纵向简单列表用默认 linear 性能更好。属于“可以更好”而非“错误”，给建议即可，别误判为 bug。
</details>

<details class="lrv-fold">
<summary>Q2：<code>grid-row: 1 / 3</code> 让元素跨两行，能生效吗？</summary>

**不能**。grid 的 `/` 简写在 Lynx 静默失效。用 `grid-row-start: 1; grid-row-end: 3;` 或 `grid-row-span: 2;`。
</details>

<details class="lrv-fold">
<summary>Q3：一个 flex 行，AI 没写 <code>justify-content</code>，以为子元素靠左排，对吗？</summary>

**不对**。Lynx 中 `justify-content` 默认是 `stretch`，不是 Web 的 `flex-start`。要靠左必须显式写 `justify-content: flex-start`。
</details>

<details class="lrv-fold">
<summary>Q4：linear 容器里写了 <code>flex-wrap: wrap</code> 和 <code>order: 2</code>，会发生什么？根因是什么？</summary>

两个属性都被**静默忽略**（linear 不支持 wrap 和 order）。根因是布局**选型错误**——需要 wrap/order 的场景应该用 flex。审查要点出“改用 flex”，而不是逐条修属性。
</details>

<details class="lrv-fold">
<summary>Q5：一个 relative 布局里，三个子元素全堆在左上角，最可能是什么原因？</summary>

子元素**没设相对定位属性**（或 `relative-id` 重复 / 循环引用）。relative 布局里不设任何相对属性的元素会堆叠在左上角。检查每个子元素是否都有唯一 `relative-id` 和明确的对齐/相对属性。
</details>

<details class="lrv-fold">
<summary>Q6：要做一个会换行的标签云（tag cloud），选哪种布局？</summary>

**flex** + `flex-wrap: wrap` + `gap`。linear 不支持换行；grid 是固定网格不适合不定数量的标签；flex-wrap 最自然。
</details>

## 速查卡 · 02 讲 <span class="lrv-b lrv-core">必读</span>

<div class="lrv-card">
<strong>选型口诀</strong>：简单列表 <b>linear</b>、要 wrap/order/多行 <b>flex</b>、二维网格 <b>grid</b>、相对定位 <b>relative</b>。<br>
<strong>每种的“味道”</strong>：linear 上出现 <code>flex-wrap/order/align-content</code> → 该用 flex；flex 漏 <code>justify-content</code>（默认 stretch 非 flex-start）；grid 用 <code>/</code> 或 <code>grid-column: span</code> 简写、用 <code>@media</code> → 静默失效；relative 漏 <code>relative-id</code> / 漏定位属性 → 全堆左上角。<br>
<strong>记两颗静默雷</strong>：grid 定位简写、<code>@media</code>。
</div>

<div class="lrv-key-note"><strong>三讲回顾</strong>：00 装心智模型（不是浏览器 + 双线程）、01 样式红线、02 布局选型——你已经能拦住样式层的大部分 AI 坑了。后续 03–04 继续样式层（选择器与伪类细节、高频元素 scroll-view/list/text 的属性陷阱），05–07 进运行时层（双线程实战、性能、把 reactlynx 扫描器变成你能一键跑的 review 工具）。</div>
