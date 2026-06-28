---
title: "《Lynx 审查者速成课》第00讲 · 地基：双线程心智模型，与为什么 Web/RN 直觉会害你"
date: 2026-06-28 10:00:00
tags: [Lynx, ReactLynx, 前端, 代码审查, 双线程, 课程]
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

<div class="lrv-key-note"><strong>本讲定位</strong>：这门课不教你从零手写 Lynx，而是教你<strong>看得懂 AI 写的 Lynx</strong>——让 AI 写、你来 review，AI 出的坑你一眼能认出来。第 00 讲不碰具体属性，只装两个心智模型：① Lynx 不是浏览器；② Lynx 是双线程。这两个装进脑子，后面所有红线都有地方挂。</div>

## 第 0 章 · 这门课怎么读 <span class="lrv-b lrv-core">必读</span>

### 0.1 这门课的目标，和你的目标一致

你的处境很可能是：要交 Lynx 页面，但更多代码是 AI 写的，你的角色是**审查者**——决定这段代码能不能上线。

审查者要的不是“记住所有 API”，而是**认得出失效模式**：AI 会在哪里把 Lynx 当成 Web 或 React Native 来写，从而自信地写出能编译、却悄悄错了的代码。

<div class="lrv-note"><strong>一句话定调</strong>：手写者学“怎么用”，审查者学“哪里会错”。这门课只教后者。</div>

### 0.2 重要性标记约定 <span class="lrv-b lrv-key">重点</span>

<div class="lrv-legend">
<span><span class="lrv-b lrv-core">必读</span> 审查的核心拦截点，必须吃透</span><br>
<span><span class="lrv-b lrv-key">重点</span> 关键细节，review 时高频用到</span><br>
<span><span class="lrv-b lrv-skim">可跳读</span> 知道有这回事即可，会折叠</span><br>
<span><span class="lrv-b lrv-skip">非核心</span> 边角，第一次学可以略过</span>
</div>

### 0.3 两条读法

- **速查路线**：只看每讲的「红线表」+「实战抓错」，跳过原理。适合明天就要 review、先把眼力练出来。
- **精读路线**：连原理一起读（尤其第 1、2 章的双线程），适合想真正理解“为什么是 bug”。

本讲建议精读——因为双线程是后面运行时红线（05–07 讲）的总地基，跳过它，那些 bug 你只能死记，记不住。

## 第 1 章 · 心智模型一：Lynx 不是浏览器 <span class="lrv-b lrv-core">必读</span>

AI 的训练语料里 99% 是 Web 前端。所以默认情况下，**AI 会把 Lynx 当浏览器写**。而 Lynx 是一个独立的渲染平台（像浏览器，但规则不同），于是产生了第一类 bug。

| 维度 | Web 浏览器 | Lynx |
| --- | --- | --- |
| 元素 | `<div>` `<span>` `<img>` | `<view>` `<text>` `<image>` |
| 纯文本 | 可直接写在容器里 | **必须包在 `<text>` 里**，否则非法 |
| 默认盒模型 | `content-box` | `border-box` |
| 相邻 margin | 会合并（collapse） | **不合并**，直接相加 |
| 默认布局 | block / flow | **linear**（类 flex column） |
| 单位 | px/rem/vw/… | 支持 px/%/vw/rem/em；`rpx` 是 Lynx 特有 |

<div class="lrv-why"><strong>为什么这是审查的金矿？</strong>因为以上每一条，AI 都可能按 Web 习惯写错，而且<strong>大多不会报错</strong>——页面照样渲染，只是布局悄悄偏了。这些就是第 01–04 讲要逐条抓的“样式层红线”。</div>

<div class="lrv-note"><strong>记住这一句</strong>：从 Web 带过来的每一个假设，都是一个潜在 bug。看到 AI 写的 Lynx 里出现 <code>&lt;div&gt;</code>、<code>float</code>、<code>::before</code>、依赖 margin 合并——直接亮红灯。</div>

## 第 2 章 · 心智模型二：Lynx 是双线程 <span class="lrv-b lrv-core">必读</span>

这是 Lynx 真正区别于 Web **和** React Native 的地方，也是第二类 bug——运行时 bug——的根。它比样式 bug 更危险，因为它**完全不可见**：页面看着没问题，但卡顿、数据错乱、或在线上特定场景才炸。

### 2.1 两个线程，各干各的

ReactLynx 把工作劈成两个线程：

| 线程 | 跑什么 |
| --- | --- |
| **主线程（Main）** | 跑 React 组件的 render 函数、求值 JSX、UI 渲染与布局 |
| **后台线程（Background）** | 跑 `useEffect`、事件处理函数、原生模块调用 |

<div class="lrv-key-note"><strong>审查者必须背下来的一张表</strong>——某段代码运行在哪个线程，决定了它能做什么：</div>

| 代码位置 | 线程 | 能否调原生 API |
| --- | --- | --- |
| 组件 render 函数体 | 主线程 | ❌ 不行 |
| `useEffect` / `useLayoutEffect` | 后台线程 | ✅ 可以 |
| 事件处理器（`bindtap` 等） | 后台线程 | ✅ 可以 |
| `ref` 回调 / `useImperativeHandle` | 后台线程 | ✅ 可以 |
| 标了 `'background only'` 的函数 | 后台线程 | ✅ 可以 |

### 2.2 最危险的一类错：在主线程调原生模块 <span class="lrv-b lrv-key">重点</span>

`lynx.getJSModule(...)` 和 `NativeModules.xxx` **只能在后台线程上下文调用**。AI 经常按 Web/React 的直觉，直接写在组件函数体（render 作用域）里：

```tsx
export function App() {
  // ❌ 致命：render 作用域 = 主线程，这里调原生模块
  const mod = lynx.getJSModule('SomeModule');
  NativeModules.SomeModule.call();
  return <view />;
}
```

后果（依据本地 reactlynx-best-practices `detect-background-only` 规则，影响级别 **CRITICAL**）：阻塞 UI 渲染、引发线程同步开销、体验劣化。

正确写法是把它挪进后台线程上下文——`useEffect`、事件处理器，或用 `'background only'` 指令显式标注：

```tsx
export function App() {
  useEffect(() => {
    lynx.getJSModule('SomeModule').doSomething(); // ✅ 后台线程
  }, []);

  function doWork() {
    'background only'; // ✅ 必须是函数体第一句
    NativeModules.Analytics.track('event');
  }

  return <view bindtap={doWork} />;
}
```

<div class="lrv-why"><strong>为什么 AI 特别容易栽这里？</strong>因为在普通 React 里，组件函数体里随手调个方法再正常不过。Lynx 的双线程把“在哪调”变成了对错问题，而这个约束在 Web/RN 里根本不存在——它正是 AI 盲区的正中心。</div>

### 2.3 反过来：该在主线程的别丢后台 <span class="lrv-b lrv-skim">可跳读</span>

<details class="lrv-fold">
<summary>展开：高频交互为什么要 <code>'main thread'</code> <span class="lrv-b lrv-skim">可跳读</span></summary>

事件默认在后台线程处理，所以“手势 → 处理 → 渲染”要跨线程，复杂页面里会**慢半拍**。对滚动联动、跟手动画这类高频交互，要用主线程脚本同步处理：

```tsx
function onScroll(event: MainThread.IScrollEvent) {
  'main thread'; // 函数体第一句
  const top = event.detail.scrollTop;
  event.currentTarget.setStyleProperty('transform', `translateY(${top}px)`);
}
// 用 main-thread: 前缀绑定
<scroll-view main-thread:global-bindscroll={onScroll} />
```

审查时记住这条对称规律：**原生调用/重活该在后台；跟手动画该在主线程**。两边放反了都是 bug，只是一个表现为“阻塞”、一个表现为“卡顿延迟”。
</details>

## 第 3 章 · 审查者的世界观：两层 bug <span class="lrv-b lrv-key">重点</span>

把前两章合起来，你就有了这门课的总框架——Lynx 页面的 bug 分两层，审查时分两副眼镜：

| 层 | 来源心智模型 | 特征 | 本课对应 |
| --- | --- | --- | --- |
| **样式层** | Lynx 不是浏览器 | 肉眼可见（布局偏、文字不显示） | 01–04 讲 |
| **运行时层** | Lynx 是双线程 | 静默、危险（卡顿、数据错、线上才炸） | 05–07 讲 |

<div class="lrv-note"><strong>审查顺序建议</strong>：先扫样式层（快、便宜、肉眼能验证），再用 reactlynx-best-practices 的扫描器过运行时层。后者会在 07 讲变成你能一键跑的工具。</div>

## 第 4 章 · 实战抓错 <span class="lrv-b lrv-core">必读</span>

下面是一段“AI 写的”ReactLynx 组件。**先别往下翻**，自己找：这里有几个会被审查打回的问题？

```tsx
import { useState } from '@lynx-js/react';

export function ProductCard() {
  const price = NativeModules.PriceService.getCurrent();
  const [liked, setLiked] = useState(false);

  return (
    <div className="card">
      商品名称
      <view className="price">{price}</view>
    </div>
  );
}
```

<details class="lrv-fold">
<summary>展开：审查意见（共 3 处）<span class="lrv-b lrv-key">对照你的答案</span></summary>

1. **`NativeModules.PriceService.getCurrent()` 写在 render 作用域** —— <span class="lrv-b lrv-core">CRITICAL</span>。这是主线程调原生模块，阻塞渲染。应挪进 `useEffect`，用 state 承接结果。
2. **用了 `<div>`** —— Lynx 没有 `<div>`，应为 `<view>`。
3. **纯文本「商品名称」直接写在容器里** —— 非法，必须包进 `<text>`。

只发现 1 个？你抓住了肉眼可见的那层。第 1 处才是真正会上线的事故，也是这门课最想训练你的眼力。修正版：

```tsx
import { useState, useEffect } from '@lynx-js/react';

export function ProductCard() {
  const [price, setPrice] = useState('');
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    setPrice(NativeModules.PriceService.getCurrent()); // ✅ 后台线程
  }, []);

  return (
    <view className="card">
      <text>商品名称</text>
      <text className="price">{price}</text>
    </view>
  );
}
```
</details>

## 第 5 章 · 自测错题 <span class="lrv-b lrv-key">重点</span>

<details class="lrv-fold">
<summary>Q1：下面哪个位置可以安全调用 <code>NativeModules</code>？A. 组件函数体 B. <code>useEffect</code> 回调 C. JSX 的 <code>style</code> 里</summary>

**B**。`useEffect` 跑在后台线程。A 是主线程 render 作用域，调原生模块是 CRITICAL 错误；C 不是放副作用的地方。
</details>

<details class="lrv-fold">
<summary>Q2（判断）：这段 Lynx 代码没问题 —— <code>&lt;view&gt;价格：99&lt;/view&gt;</code></summary>

**错**。纯文本必须包在 `<text>` 里：`<view><text>价格：99</text></view>`。
</details>

<details class="lrv-fold">
<summary>Q3：审查时看到 AI 写的页面里有 <code>'background only'</code> 指令，它意味着什么？</summary>

这个函数被显式标记为只在后台线程运行，因此可以安全地调用原生模块；同时它允许编译期对主线程代码做 tree-shaking。指令必须是函数体的**第一句**。看到它通常是好信号——说明作者意识到了线程边界。
</details>

## 小结

- 装好两个心智模型：**Lynx 不是浏览器**（样式层 bug 的根）、**Lynx 是双线程**（运行时 bug 的根）。
- 审查者最该背的是 2.1 那张线程表：render 体=主线程（不能调原生），effect/事件=后台线程（可以）。
- 最危险的一类 bug——主线程调 `NativeModules`/`lynx.getJSModule`——静默、CRITICAL、且正中 AI 盲区。

<div class="lrv-key-note"><strong>下一讲预告</strong>：第 01 讲进入样式层，逐条拆「样式红线」——text 必包、border-box、margin 不合并、linear 不撑满、选择器静默失效。都是 AI 高频踩、却不报错的坑。</div>
