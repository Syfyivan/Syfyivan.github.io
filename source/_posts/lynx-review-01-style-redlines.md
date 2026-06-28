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
.lrv-card{margin:16px 0;padding:14px 18px;border:1px solid rgba(183,58,44,.25);border-radius:8px;background:rgba(183,58,44,.03)}
</style>

<div class="lrv-key-note"><strong>本讲定位</strong>：进入两层 bug 里的「样式层」。这些坑的共同点是——<strong>都不报错</strong>。页面照样渲染，只是布局悄悄偏了、文字悄悄没了。审查者的价值就在于：编译器放过的，你拦得住。本讲给你一张总红线表 + 六个高频坑的展开 + 两个实战抓错 + 速查卡。</div>

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
| `:is()` `:where()` `:has()` | 不支持 | 拆成普通选择器 |
| `z-index` 没配 `position` | 不生效 | 配 `position: relative` 等 |
| `text` 没设 `white-space` 却指望换行 | 默认 `nowrap` 不换行 | 显式 `white-space: normal` |
| `float` / `display:block,inline,inline-block,table*` | 不支持或回退 | 用 flex / linear / grid |
| `position: static` | 不支持 | 用 `relative`（默认） |
| `rpx` 单位（要 Web 兼容时） | Lynx 特有，缺 Web 兼容 | 响应式优先 `rem` + `vw` |
| `min-content` / `cm,mm,in,pt,pc` / `ch,ex` | 不支持 | 用 `%`/`auto`/`fit-content`/固定值 |
| `@media` | 不支持 | 视口单位 / flex-wrap / JS 算 |
| `page` 没同步 `body` 默认样式 | Lynx 根元素无默认 margin | 显式给 `page` 设 |

下面挑**最阴、最容易放过**的几条展开——它们是审查的真正分水岭。

## 第 2 章 · 静默失效之王：选择器 <span class="lrv-b lrv-core">必读</span>

这是 Lynx 最坑审查者的地方：**CSS 解析器认得这些选择器，但选择器引擎不去匹配它们**。于是没有任何报错、没有任何警告，样式就是不生效。

```css
/* ❌ 全部静默失效——写了等于没写 */
.item::before { content: '●'; }
.list :first-child { margin-top: 0; }
.row :nth-child(2n) { background: #eee; }
```

完整支持情况（审查时按这张表判）：

| 选择器 | 状态 |
| --- | --- |
| 标签 `view` / 类 `.x` / ID `#x` | ✅ 正常匹配 |
| 后代 `.a .b` / 子 `.a > .b` | ✅ |
| 相邻兄弟 `.a + .b` / 通用兄弟 `.a ~ .b` | ✅ |
| 属性 `[type="text"]` | ✅ |
| `:hover` `:active` `:focus` `:not()` `:root` | ✅ |
| `::placeholder` `::selection` | ✅ |
| `::before` `::after` | ❌ 解析但不渲染 |
| `:first-child` `:last-child` `:nth-child()` | ❌ 解析但不匹配 |
| `:is()` `:where()` `:has()` | ❌ 不支持 |

<div class="lrv-why"><strong>为什么这条最该练？</strong>因为它骗过了所有自动化：lint 不报、编译不错、控制台不警告。AI 又极爱用 <code>::before</code> 做小圆点/角标、用 <code>:nth-child</code> 做斑马纹。只有你这个人肉审查者能拦下来。看到 <code>::before/::after</code> 或结构性伪类，无条件亮红灯。</div>

<div class="lrv-note"><strong>替代方案</strong>：<code>::before/::after</code> → 放一个真实的 <code>&lt;text&gt;</code>/<code>&lt;view&gt;</code>；<code>:nth-child</code> 斑马纹 → 在 <code>map</code> 里按 index 算类名（<code>className={i % 2 ? 'odd' : 'even'}</code>）。</div>

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
.child  { width: 100%; }                    /* 修法 1：显式宽度 */
.child  { linear-layout-gravity: stretch; } /* 修法 2：子元素自己拉伸 */
.parent { linear-cross-gravity: stretch; }  /* 修法 3：父容器统一让子元素拉伸 */
```

<div class="lrv-note"><strong>审查信号</strong>：AI 写的容器里，子元素没设宽度、却期望它和父元素一样宽——尤其是从 Web 迁过来的卡片/列表项，或“裸 view 套裸 view”的多层嵌套。量一眼宽度预期。</div>

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
<summary>展开：margin 合并的常见场景、负 margin、负 padding 的怪行为 <span class="lrv-b lrv-skim">可跳读</span></summary>

| 场景 | Lynx 行为 | 修法 |
| --- | --- | --- |
| 相邻兄弟元素 | 两个 margin 相加 | 只给一个设 margin，或用 gap/padding |
| 父 + 第一个子元素 | 相加 | 移除父 margin，由子元素独立控制 |
| 父 + 最后一个子元素 | 相加 | 同上 |

**负 margin**（无论交叉轴 `margin-left/right` 还是主轴 `margin-top/bottom`）在 Lynx 的 linear 布局里**可以正常工作**，不用特殊 workaround——遇到细微 diff，先查 margin 合并补偿，别先怀疑负 margin。

**负 padding 的坑**：CSS 里 `padding-bottom: -1px` 是非法值会回退为 0；但 Lynx 的长度解析**不做非负校验**，会把负 padding 当有效长度直接应用，造成与 Web 的布局差异。审查/适配时把负 padding 替换为 `0`。
</details>

## 第 5 章 · 单位、calc、var、env <span class="lrv-b lrv-key">重点</span>

**单位支持**：

```text
✅ px  %  vw  vh  rem  em
⚠️ rpx —— Lynx 特有，自适应有效，但缺 Web 兼容；要 Web 兼容优先 rem + vw
❌ min-content（flex-basis 里当 0）、cm/mm/in/pt/pc、ch/ex
✅ max-content / fit-content
```

**响应式推荐写法**（没有 `@media`，靠根元素字号 + rem）：

```css
page { font-size: calc(100vw / 23.4375); } /* 1rem = 16px @ 375px */
.container { padding: 2rem; font-size: 1rem; }
```

**函数支持**：

```css
/* calc()：只在「长度属性」里支持（width/height/margin/padding/flex-basis/font-size…） */
width: calc(100% - 20px);        /* ✅ */
flex-direction: calc(row);       /* ❌ 枚举属性不支持 */
color: calc(#ff0000);            /* ❌ 颜色不支持 */

/* var()：全属性支持 */
color: var(--primary);           /* ✅ */

/* env()：仅 safe-area-inset-* 支持（刘海屏） */
padding-top: env(safe-area-inset-top); /* ✅ */
```

<div class="lrv-note"><strong>审查信号</strong>：见到 <code>calc()</code> 用在颜色、枚举（flex-direction/justify-content）、<code>border-radius</code>、<code>transform</code>、<code>opacity/z-index</code> 这些非长度属性上——无效，要打回。</div>

## 第 6 章 · z-index 与层叠上下文 <span class="lrv-b lrv-key">重点</span>

两条规则，第二条尤其阴：

1. **`z-index` 必须配合 `position`** 才生效（Web 里无 position 也能用 z-index）。
2. **滚动容器里的层叠陷阱**：在 `scroll-view` / `fold-view` 里，子元素设了 `z-index` 会被提升为独立合成层，可能**不跟随滚动**。

```css
/* ✅ 解法：给父容器加 z-index: 0，建立同一个层叠上下文 */
fold-view-header { position: relative; z-index: 0; }
.header-item     { position: relative; z-index: 10; } /* 现在会跟随滚动 */
```

<div class="lrv-why"><strong>为什么值得记</strong>：这种“元素不跟随滚动”的 bug 极难定位，肉眼看代码也不直观。审查到 scroll-view/fold-view 里有子元素带 z-index，就提示作者检查父容器是否建立了层叠上下文。</div>

## 第 7 章 · 文本与 page 的两个小坑 <span class="lrv-b lrv-skim">可跳读</span>

<details class="lrv-fold">
<summary>展开：text 默认不换行 + page 不继承 body 默认样式 <span class="lrv-b lrv-skim">可跳读</span></summary>

**text 默认 `nowrap`**：Web 文字默认换行，Lynx 的 `<text>` 默认不换行，要换行得显式写：

```css
.title { white-space: normal; }           /* 允许换行 */
.ellipsis { white-space: nowrap; text-overflow: ellipsis; overflow: hidden; } /* 单行省略号 */
```

**page 不继承 body 默认样式**：Web 的 `body` 自带浏览器默认 margin/padding，Lynx 根元素 `page` **默认没有**。从 Web 迁移要手动同步：

```css
page { margin: 8px; padding: 0 8px; } /* 对应 Web 的 body 默认 */
```
</details>

## 第 8 章 · 实战抓错 <span class="lrv-b lrv-core">必读</span>

### 案例 A：促销 Banner

**先别翻**，把样式红线圈出来：

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
.banner { width: 300px; display: block; }
.title  { /* 想让标题占满整行 */ }
.badge::before { content: 'NEW'; color: red; }
.title + .badge { margin-top: 12px; }
```

<details class="lrv-fold">
<summary>展开：审查意见（共 4 处）<span class="lrv-b lrv-key">对照你的答案</span></summary>

1. **`限时优惠` 是纯文本写在 `<view>` 里** —— 非法，必须 `<view className="title"><text>限时优惠</text></view>`。
2. **`display: block`** —— Lynx 不支持，会回退并在非标准模式触发控制台警告。容器用 `flex` 或留默认 `linear`。
3. **`.badge::before` 想用伪元素显示 “NEW”** —— `::before` 静默失效，永远不显示。要显示就放一个真实的 `<text>NEW</text>`。
4. **`.title` 想占满整行却没设宽度** —— linear 默认不撑满，标题宽度由内容决定。加 `width: 100%` 或 `linear-layout-gravity: stretch`。

附加观察：`.title + .badge` 这个相邻兄弟选择器本身**是支持的**（别误伤），但要记住此处 margin 不会和上方元素合并。
</details>

### 案例 B：列表项样式

这段更像“能跑但细节全错”的真实代码：

```css
.list :nth-child(odd) { background: #fafafa; }
.row {
  padding-bottom: -2px;
  z-index: 5;
}
.name { width: min-content; }
.desc { } /* 期望长文本自动省略 */
```

<details class="lrv-fold">
<summary>展开：审查意见（4 处）<span class="lrv-b lrv-key">对照你的答案</span></summary>

1. **`:nth-child(odd)` 做斑马纹** —— 静默失效。改为在 `map` 里按 index 给奇偶项加类名。
2. **`padding-bottom: -2px`** —— Lynx 不做非负校验，会真的应用 -2px，造成与预期不符。改为 `0`。
3. **`z-index: 5` 没配 `position`** —— 不生效。补 `position: relative`。若 `.row` 在 scroll-view 内，还要注意层叠上下文是否导致不跟随滚动。
4. **`.name { width: min-content }`** —— `min-content` 不支持。用 `fit-content`、固定值或 `auto`。
5. **`.desc` 想要省略号** —— 单靠空规则不行，且 `<text>` 默认 `nowrap`；要 `white-space: nowrap; text-overflow: ellipsis; overflow: hidden;`。
</details>

## 第 9 章 · 自测错题 <span class="lrv-b lrv-key">重点</span>

<details class="lrv-fold">
<summary>Q1：<code>.list :nth-child(2n) { background:#eee }</code> 做斑马纹，能生效吗？</summary>

**不能**。`:nth-child()` 在 Lynx 里解析但不匹配，静默失效。要做斑马纹，给奇偶项加不同类名（在 `map` 里按 index 算），或在数据层标记。
</details>

<details class="lrv-fold">
<summary>Q2：两个上下相邻的卡片各设了 16px 的 margin，实际间距是多少？</summary>

**32px**。Lynx 不合并 margin，直接相加。想要 16px，只给其中一个设 margin，或用父容器 `flex` + `gap: 16px`。
</details>

<details class="lrv-fold">
<summary>Q3：审查看到 <code>position: static</code> 和 <code>width: 100vw; height: min-content</code>，几处问题？</summary>

两处半。`position: static` 不支持（用 `relative`）；`min-content` 不支持（用 `fit-content`/`auto`）；`100vw` 本身可用，但若用于全宽要小心滚动条/安全区。
</details>

<details class="lrv-fold">
<summary>Q4：<code>color: calc(var(--r) , 0, 0)</code> 这类把 calc 用在颜色上的写法，能用吗？</summary>

**不能**。`calc()` 只在长度属性里支持，颜色、枚举、`transform`、`opacity`、`z-index`、`border-radius` 都不支持。`var()` 倒是全属性支持，所以 `color: var(--primary)` 是对的。
</details>

<details class="lrv-fold">
<summary>Q5：scroll-view 里一个带 <code>z-index</code> 的吸顶元素不跟随滚动，方向怎么修？</summary>

给**父容器**加 `z-index: 0`（配 `position`），让父子处于同一个层叠上下文，子元素就会跟随滚动。根因是带 z-index 的子元素被提升为独立合成层，坐标变换不跟随父容器滚动偏移。
</details>

<details class="lrv-fold">
<summary>Q6（判断）：从 Web 迁移，给 <code>body</code> 设了 margin 就够了。</summary>

**错**。Lynx 根元素是 `page`，不继承 `body` 的浏览器默认样式。要把样式同步到 `page { margin: ... }`。
</details>

## 速查卡 · 01 讲 <span class="lrv-b lrv-core">必读</span>

<div class="lrv-card">
<strong>样式层八条静默红线</strong><br>
① 纯文本必包 <code>&lt;text&gt;</code>；② <code>::before/::after</code>、<code>:nth-child</code> 静默失效；③ margin 不合并（相加）；④ 默认 <code>border-box</code>；⑤ linear 默认不撑满（width:100% / gravity:stretch）；⑥ <code>z-index</code> 必配 <code>position</code>，scroll-view 内防不跟随滚动；⑦ <code>calc()</code> 仅长度属性、<code>min-content</code>/物理单位/<code>@media</code> 不支持；⑧ <code>text</code> 默认 nowrap、<code>page</code> 不继承 body 默认样式。<br>
<strong>核心心法</strong>：这些<u>都不报错</u>，自动化拦不住，正是人肉审查的价值。
</div>

<div class="lrv-key-note"><strong>下一讲预告</strong>：第 02 讲讲「布局选型」——linear / flex / grid / relative 四选一怎么判断，以及选错时代码会散发什么味道（grid 用了 `/` 和 `span` 简写、flex 漏写 justify-content、relative 漏 id）。</div>
