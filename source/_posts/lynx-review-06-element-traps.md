---
title: "《Lynx 审查者速成课》第06讲 · 高频元素陷阱：scroll-view / list / text / image / input"
date: 2026-06-28 16:00:00
tags: [Lynx, ReactLynx, 前端, 代码审查, 元素, 课程]
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

<div class="lrv-key-note"><strong>本讲定位</strong>：样式和布局之外，<strong>每个高频元素自己也有 Lynx 专属陷阱</strong>，AI 常按 Web 的 <code>&lt;img&gt;</code>/<code>&lt;input&gt;</code>/列表习惯写错。本讲逐个过 scroll-view、list、text、image、input 的“最容易被审查放过”的坑，配实战抓错与速查卡。</div>

## 第 1 章 · scroll-view vs list：选型先决 <span class="lrv-b lrv-core">必读</span>

Lynx 的滚动有两个元素，**选错是性能事故**：

| 用 `<scroll-view>` | 用 `<list>` |
| --- | --- |
| 有限、已知的一组子元素（约 < 50） | 大量 / 可增长 / 虚拟化的列表（成百上千） |
| 混合布局的有界内容 | feed、瀑布流、长列表（按 `<list-item>` 建模） |

<div class="lrv-key-note"><strong>两条最常被忽略的事实</strong>：① <code>&lt;page&gt;</code> 默认 <code>overflow: hidden</code>、<strong>自己不滚动</strong>——从 Web 迁长页面要用 <code>&lt;scroll-view&gt;</code> 包起来才有“整页滚动”。② 把内容塞进 <code>&lt;scroll-view&gt;</code> 会<strong>改变滚动上下文</strong>，影响 <code>position: fixed</code> 的参照系和 <code>z-index</code> 层叠（呼应第 01 讲）。</div>

<div class="lrv-note"><strong>审查信号</strong>：① 用 <code>&lt;scroll-view&gt;</code> 渲染成百上千项 → 应改 <code>&lt;list&gt;</code> 做虚拟化。② 见到 <code>scroll-x</code> / <code>scroll-y</code>（已废弃）→ 改 <code>scroll-orientation="horizontal/vertical"</code>。③ “整页不滚动” → 检查是否漏了外层 scroll-view。</div>

## 第 2 章 · list 的护栏 <span class="lrv-b lrv-key">重点</span>

`<list>` 性能好，但有几条硬约束，缺一就出问题：

- **必须有确定高度**（如 `height: 100vh`），否则滚动区无法测量 → 列表不滚或塌陷。
- **`key` 和 `item-key` 要稳定且唯一**（别用数组下标当 key）。
- `list-item` 高度尽量**可预测**，渲染更顺。
- **别把大 `<list>` 嵌进另一个大 `<list>`**。
- 子项小而静态时，用 `<scroll-view>` 反而更简单。

<div class="lrv-why"><strong>审查信号</strong>：<code>&lt;list&gt;</code> 没给高度、用 <code>key={index}</code>、或大列表套大列表——都是会上线的性能/错乱隐患。</div>

## 第 3 章 · text：多行截断别用 Web 写法 <span class="lrv-b lrv-key">重点</span>

复习第 01 讲：所有可见文字必须包在 `<text>` 里。本讲补两个 text 专属坑：

```tsx
// ✅ 多行截断：用 text-maxline（不是 Web 的 -webkit-line-clamp）
<text text-maxline={3}>很长的段落……</text>
```

```css
/* ✅ 单行省略：四件套缺一不可 */
.single-line { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; }
```

<div class="lrv-note"><strong>审查信号</strong>：见到 <code>-webkit-line-clamp</code> 做多行省略 → Lynx 用 <code>text-maxline</code>。单行省略缺了 <code>white-space:nowrap</code> 或没给宽度 → 省略号不生效。嵌套 <code>&lt;text&gt;</code> 会继承外层文字样式，可用于富文本拼接。</div>

## 第 4 章 · image：四个 Web 习惯会害你 <span class="lrv-b lrv-core">必读</span>

| Web 习惯 | Lynx 现实 |
| --- | --- |
| `<img>` 不给尺寸也能显示 | `<image>` **要给确定尺寸**（`style` 宽高，或 `prefetch-width/height`，或 `auto-size`），否则加载不可靠 |
| `<img alt="...">` | 当前 `<image>` **没有 `alt` 属性**；无障碍要走外层策略 |
| `<img src="x.svg">` | 原生路径 `<image>` **不渲染 SVG**，用 `<svg>` |
| 用 `<img>` 做装饰背景 | 装饰背景用 CSS `background-image` 挂在 `<view>` 上，别用 `<image>` |

常用：`mode`（默认 `scaleToFill`，可选 `aspectFit`/`aspectFill`/`center`）、`placeholder`（占位图）、`bindload`/`binderror`（加载/失败回调）。

<div class="lrv-why"><strong>审查信号</strong>：<code>&lt;image&gt;</code> 没尺寸、用 <code>alt</code>、<code>src</code> 指向 <code>.svg</code>、或拿 <code>&lt;image&gt;</code> 当纯装饰背景——四个都该提。</div>

## 第 5 章 · input：事件名和 maxlength 是重灾区 <span class="lrv-b lrv-key">重点</span>

```tsx
// ✅ 单行输入：事件用 bindinput/bindconfirm（不是 React 的 onChange）
<input
  type="text" placeholder="搜索" confirm-type="search"
  maxlength={50}                 // ✅ 显式设；Harmony 不设默认只给 140
  bindinput={onInput} bindconfirm={onSearch} bindfocus={onFocus} bindblur={onBlur}
/>
```

要点：单行用 `<input>`，**多行用 `<textarea>`**；`type`（text/number/password/tel/email…）控制键盘；`disabled`（完全禁用）与 `readonly`（只读但焦点行为不同）有别；`beforeinput`/`keyboard` 是 **iOS 专属**事件，`keyboardheightchange` 才是跨端的键盘高度事件。

<div class="lrv-note"><strong>审查信号</strong>：<code>&lt;input&gt;</code> 用 <code>onChange</code>/<code>value+onChange</code> 受控写法 → 应是 <code>bindinput</code>；没设 <code>maxlength</code>（Harmony 会被默默截到 140）；多行需求却用 <code>&lt;input&gt;</code> → 应 <code>&lt;textarea&gt;</code>。</div>

## 第 6 章 · 实战抓错 <span class="lrv-b lrv-core">必读</span>

### 案例 A：千项长列表用了 scroll-view

```tsx
function Feed({ posts }) {  // posts 有几千条
  return (
    <scroll-view scroll-y>
      {posts.map((p, i) => (
        <view key={i}><image src={p.cover} /><text>{p.title}</text></view>
      ))}
    </scroll-view>
  );
}
```

<details class="lrv-fold">
<summary>展开：审查意见（3 处）<span class="lrv-b lrv-key">对照你的答案</span></summary>

1. **几千条用 `<scroll-view>`** —— 性能事故，全部一次性渲染。应改 `<list>` + `<list-item>` 做虚拟化，并给 list 确定高度。
2. **`key={i}` 用下标** —— 列表增删会错乱，用稳定唯一 id（`key={p.id}`，list-item 还要 `item-key`）。
3. **`<image src={p.cover}>` 没给尺寸** —— 加载不可靠，给确定宽高或 `auto-size`。

修正骨架：

```tsx
<list scroll-y style={{ height: '100vh' }}>
  {posts.map(p => (
    <list-item key={p.id} item-key={p.id}>
      <view><image src={p.cover} style={{width:'100%',height:'180px'}} /><text>{p.title}</text></view>
    </list-item>
  ))}
</list>
```
</details>

### 案例 B：受控输入框 + 多行需求

```tsx
function CommentBox({ value, onChange }) {
  return (
    <input value={value} onChange={e => onChange(e.target.value)} placeholder="写评论…（可多行）" />
  );
}
```

<details class="lrv-fold">
<summary>展开：审查意见（3 处）<span class="lrv-b lrv-key">对照你的答案</span></summary>

1. **`onChange`** —— Lynx input 用 `bindinput`，回调里从 `event.detail.value` 取值（不是 `e.target.value`）。
2. **多行需求却用 `<input>`** —— input 只单行，评论应用 `<textarea>`。
3. **没设 `maxlength`** —— 建议显式设，避免 Harmony 默认 140 的隐性截断。

修正：`<textarea bindinput={e => onChange(e.detail.value)} maxlength={500} placeholder="写评论…" />`。
</details>

## 第 7 章 · 自测错题 <span class="lrv-b lrv-key">重点</span>

<details class="lrv-fold">
<summary>Q1：一个会无限加载的信息流，用 scroll-view 还是 list？</summary>

**list**。大量/可增长/虚拟化的列表用 `<list>` + `<list-item>`；scroll-view 适合少量（约 <50）有界内容。别忘了给 list 确定高度。
</details>

<details class="lrv-fold">
<summary>Q2：多行文本截断成 3 行，Lynx 用什么？</summary>

**`text-maxline={3}`**。不是 Web 的 `-webkit-line-clamp`。单行省略才用 `white-space:nowrap + overflow:hidden + text-overflow:ellipsis +` 确定宽度。
</details>

<details class="lrv-fold">
<summary>Q3：<code>&lt;image src="icon.svg" alt="logo"&gt;</code> 有几处问题？</summary>

两处。`<image>` 原生路径不渲染 SVG（用 `<svg>`）；且没有 `alt` 属性（无障碍走外层策略）。另外别忘了给尺寸。
</details>

<details class="lrv-fold">
<summary>Q4：input 用 <code>onChange</code> 取 <code>e.target.value</code>，对吗？</summary>

**不对**。Lynx input 用 `bindinput`，从 `event.detail.value` 取值。`onChange`/`e.target.value` 是 Web/React 写法。
</details>

<details class="lrv-fold">
<summary>Q5：整页内容超出一屏却不滚动，最先查什么？</summary>

查是否漏了外层 `<scroll-view>`。Lynx 的 `<page>` 默认 `overflow:hidden` 不自己滚，长内容要包在 scroll-view 里。
</details>

## 源码核对 <span class="lrv-b lrv-key">源码为证</span>

<details class="lrv-fold">
<summary>展开：元素默认值对照 lynx-family/lynx 源码 <span class="lrv-b lrv-skim">确认</span></summary>

`core/style/default_computed_style.h` 里：

- `DEFAULT_OVERFLOW = OverflowType::kHidden` —— 实锤“`page`/容器默认 `overflow: hidden`、自己不滚”，所以长内容要包 `<scroll-view>`。
- `DEFAULT_TEXT_OVERFLOW = TextOverflowType::kClip` —— 实锤“默认裁切不带省略号，要 ellipsis 得显式设”。
- `DEFAULT_TEXT_MAX_LINE = -1` —— `text-maxline` 是引擎一等公民，默认 `-1`（不限行数），多行截断用它而非 Web 的 `-webkit-line-clamp`。

`scroll-view`/`list` 的渲染分别落在 `core/renderer/ui_component`、`core/list` 等目录——大列表走 list 的虚拟化路径，与本讲选型一致。
</details>

## 速查卡 · 06 讲 <span class="lrv-b lrv-core">必读</span>

<div class="lrv-card">
<strong>scroll-view vs list</strong>：少量有界用 scroll-view，大量/虚拟化用 list（给高度+稳定 key/item-key）；page 默认不滚要包 scroll-view；<code>scroll-x/y</code> 已废弃。<br>
<strong>text</strong>：多行截断 <code>text-maxline</code>（非 -webkit-line-clamp）；单行省略四件套+宽度。<br>
<strong>image</strong>：给尺寸、无 <code>alt</code>、SVG 用 <code>&lt;svg&gt;</code>、装饰背景用 CSS。<br>
<strong>input</strong>：<code>bindinput</code> 取 <code>detail.value</code>（非 onChange）；显式 <code>maxlength</code>；多行用 <code>&lt;textarea&gt;</code>。
</div>

<div class="lrv-key-note"><strong>下一讲预告</strong>：第 07 讲（终）——把第 00 讲讲的双线程红线<strong>自动化</strong>：用 reactlynx-best-practices 的扫描器一键扫 AI 写的代码，几秒钟列出违规。附真实扫描输出。</div>
