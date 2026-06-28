---
title: "《Lynx 审查者速成课》第01讲 · 样式红线：那些不报错、却悄悄错的坑"
date: 2026-06-28 11:00:00
tags: [Lynx, ReactLynx, 前端, 代码审查, CSS, 课程]
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

<div class="lrv-key-note"><strong>本讲定位</strong>：进入两层 bug 里的「样式层」。这些坑的共同点是——<strong>都不报错</strong>。页面照样渲染，只是布局悄悄偏了、文字悄悄没了。审查者的价值就在于：编译器放过的，你拦得住。</div>

## 第 1 章 · 一张总红线表 <span class="lrv-b lrv-core">必读</span>

先给你能贴在显示器边上的速查表。审查 Lynx 样式时，逐行扫这些信号：

| 看到这个 | 为什么是坑 | 正确做法 |
| --- | --- | --- |
| 纯文本直接写在 `<view>` 里 | Lynx 非法，文本必须有载体 | 包进 `<text>` |
| `<div>` `<span>` `<img>` | Lynx 没有这些元素 | `<view>` `<text>` `<image>` |
| 依赖相邻 margin 合并 | Lynx **不合并**，margin 相加 | 只给一边设 margin，或用 gap/padding |
| 子元素以为会自动撑满父宽 | linear 默认**不撑满** | `width:100%` 或 `linear-layout-gravity:stretch` |
| 心里默认 `content-box` | Lynx 默认 `border-box` | 知道 width 已含 padding/border |
| `::before` `::after` | 解析但**不渲染** | 用真实元素替代 |
| `:first-child` `:nth-child()` | 解析但**不匹配** | 加类名，或在数据层处理 |
| `z-index` 没配 `position` | 不生效 | 配 `position: relative` 等 |
| `text` 没设 `white-space` 却指望换行 | 默认 `nowrap` 不换行 | 显式 `white-space: normal` |
| `float` / `display:block,inline,inline-block` | 不支持或回退 | 用 flex / linear |
| `rpx` 单位 | Lynx 特有，缺 Web 兼容 | 响应式优先 `rem` + `vw` |
| `min-content` / `cm,mm,in,pt,pc` | 不支持 | 用 `%`/`auto`/固定值 |

下面挑**最阴、最容易放过**的几条展开——它们是审查的真正分水岭。

## 第 2 章 · 静默失效之王：选择器 <span class="lrv-b lrv-core">必读</span>

这是 Lynx 最坑审查者的地方：**CSS 解析器认得这些选择器，但选择器引擎不去匹配它们**。于是没有任何报错、没有任何警告，样式就是不生效。

```css
/* ❌ 全部静默失效——写了等于没写 */
.item::before { content: '●'; }
.list :first-child { margin-top: 0; }
.row :nth-child(2n) { background: #eee; }
```

| 选择器 | 状态 |
| --- | --- |
| 标签 / 类 / ID / 后代 / 子 / 兄弟 / 属性 | ✅ 正常匹配 |
| `:hover` `:active` `:focus` `:not()` `:root` | ✅ 支持 |
| `::placeholder` `::selection` | ✅ 支持 |
| `::before` `::after` | ❌ 解析但不渲染 |
| `:first-child` `:last-child` `:nth-child()` | ❌ 解析但不匹配 |
| `:is()` `:where()` `:has()` | ❌ 不支持 |

<div class="lrv-why"><strong>为什么这条最该练？</strong>因为它骗过了所有自动化：lint 不报、编译不错、控制台不警告。AI 又极爱用 <code>::before</code> 做小圆点、用 <code>:nth-child</code> 做斑马纹。只有你这个人肉审查者能拦下来。看到这两类选择器，无条件亮红灯。</div>

## 第 3 章 · 布局直觉陷阱：linear 不撑满 <span class="lrv-b lrv-key">重点</span>

Web 的 block 布局里，块级子元素默认 `width: 100%`，自动填满父元素。**Lynx 默认是 linear 布局，子元素尺寸由内容决定，不会自动撑满。**

```css
/* Web 直觉：.child 会占满 200px */
/* Lynx 实际：.child 宽度由内容决定，可能远小于 200px */
.parent { width: 200px; }      /* 默认 linear */
.child  { /* 没写 width —— 这就是 bug */ }
```

更隐蔽的是**嵌套**：多层 `view` 如果都不写宽高，里层可能直接塌成 0（尤其空 view）。三个修法任选：

```css
.child { width: 100%; }                 /* 修法 1：显式宽度 */
.child { linear-layout-gravity: stretch; } /* 修法 2：子元素拉伸 */
.parent { linear-cross-gravity: stretch; } /* 修法 3：父容器统一拉伸 */
```

<div class="lrv-note"><strong>审查信号</strong>：AI 写的容器里，子元素没设宽度、却期望它和父元素一样宽——尤其是从 Web 迁过来的卡片/列表项。看到“裸 view 套裸 view”，量一眼宽度预期。</div>

## 第 4 章 · margin 不合并 & 盒模型 <span class="lrv-b lrv-key">重点</span>

```css
/* Web：上下 margin 合并为 20px */
/* Lynx：不合并，间距 = 20 + 20 = 40px */
.item1 { margin-bottom: 20px; }
.item2 { margin-top: 20px; }
```

从 Web 迁移的页面，间距经常莫名其妙变大一倍，根因就是这个。修法：只给一边设 margin，或父容器用 `flex`/`gap`。

盒模型同理：**Lynx 默认 `border-box`**（width 已含 padding 和 border），Web 默认 `content-box`。审查算尺寸时别用 Web 的算法去验。

<details class="lrv-fold">
<summary>展开：margin 合并的几种常见场景与修法 <span class="lrv-b lrv-skim">可跳读</span></summary>

| 场景 | Lynx 行为 | 修法 |
| --- | --- | --- |
| 相邻兄弟元素 | 两个 margin 相加 | 只给一个设 margin，或用 gap/padding |
| 父 + 第一个子元素 | 相加 | 移除父 margin，由子元素独立控制 |
| 父 + 最后一个子元素 | 相加 | 同上 |

负 margin（无论交叉轴还是主轴）在 Lynx 的 linear 布局里**可以正常工作**，不用特殊 workaround——遇到细微 diff，先查 margin 合并补偿，别先怀疑负 margin。
</details>

## 第 5 章 · 实战抓错 <span class="lrv-b lrv-core">必读</span>

下面是“AI 写的”一段卡片样式 + 结构。**先别翻**，把你能抓到的样式红线圈出来：

```tsx
function Banner() {
  return (
    <view className="banner">
      <view className="title">限时优惠</view>
      <view className="badge" />
    </view>
  );
}
```

```css
.banner {
  width: 300px;
  display: block;
}
.title {
  /* 想让标题占满整行 */
}
.badge::before {
  content: 'NEW';
  color: red;
}
.title + .badge {
  margin-top: 12px;
}
```

<details class="lrv-fold">
<summary>展开：审查意见（共 4 处）<span class="lrv-b lrv-key">对照你的答案</span></summary>

1. **`限时优惠` 是纯文本写在 `<view>` 里** —— 非法，必须 `<view className="title"><text>限时优惠</text></view>`。
2. **`display: block`** —— Lynx 不支持，会回退并在非标准模式触发控制台警告。容器用 `flex` 或留默认 `linear`。
3. **`.badge::before` 想用伪元素显示 “NEW”** —— `::before` 静默失效，永远不显示。要显示就放一个真实的 `<text>NEW</text>`。
4. **`.title` 想占满整行却没设宽度** —— linear 默认不撑满，标题宽度由内容决定。加 `width: 100%` 或 `linear-layout-gravity: stretch`。

附加观察：`.title + .badge { margin-top }` 这个相邻兄弟选择器本身**是支持的**（别误伤），但要记住此处 margin 不会和上方元素合并。
</details>

## 第 6 章 · 自测错题 <span class="lrv-b lrv-key">重点</span>

<details class="lrv-fold">
<summary>Q1：<code>.list :nth-child(2n) { background:#eee }</code> 做斑马纹，能生效吗？</summary>

**不能**。`:nth-child()` 在 Lynx 里解析但不匹配，静默失效。要做斑马纹，给奇偶项加不同类名（在 `map` 里按 index 算），或在数据层标记。
</details>

<details class="lrv-fold">
<summary>Q2：两个上下相邻的卡片各设了 16px 的 margin，实际间距是多少？</summary>

**32px**。Lynx 不合并 margin，直接相加。想要 16px，只给其中一个设 margin，或用父容器 `flex` + `gap: 16px`。
</details>

<details class="lrv-fold">
<summary>Q3：审查看到 <code>position: static</code>，对不对？</summary>

**不对**。Lynx 不支持 `position: static`，默认是 `relative`。另外 `z-index` 必须配合 `position` 才生效。
</details>

## 小结

- 样式层 bug 的杀伤力在于**静默**：选择器（`::before`/`:nth-child`）静默失效、margin 静默翻倍、子元素静默不撑满。
- 把第 1 章那张红线表练成肌肉记忆，扫到信号词就停。
- 自动化拦不住这些，正是人肉审查的价值所在。

<div class="lrv-key-note"><strong>下一讲预告</strong>：第 02 讲讲「布局选型」——linear / flex / grid / relative 四选一怎么判断，以及选错时代码会散发什么味道（比如 grid 用了简写、relative 漏了 id）。</div>
