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
.lrv-card{margin:16px 0;padding:14px 18px;border:1px solid rgba(183,58,44,.25);border-radius:8px;background:rgba(183,58,44,.03)}
</style>

<div class="lrv-key-note"><strong>本讲定位</strong>：这门课不教你从零手写 Lynx，而是教你<strong>看得懂 AI 写的 Lynx</strong>——让 AI 写、你来 review，AI 出的坑你一眼能认出来。第 00 讲不碰具体属性，只装两个心智模型：① Lynx 不是浏览器；② Lynx 是双线程。这两个装进脑子，后面所有红线都有地方挂。读完你会有一张「线程上下文表」和一张「00 讲速查卡」，那是整门课的承重墙。</div>

## 第 0 章 · 这门课怎么读 <span class="lrv-b lrv-core">必读</span>

### 0.1 这门课的目标，和你的目标一致

你的处境很可能是：要交 Lynx 页面，但更多代码是 AI 写的，你的角色是**审查者**——决定这段代码能不能上线。

审查者要的不是“记住所有 API”，而是**认得出失效模式**：AI 会在哪里把 Lynx 当成 Web 或 React Native 来写，从而自信地写出能编译、却悄悄错了的代码。

<div class="lrv-note"><strong>一句话定调</strong>：手写者学“怎么用”，审查者学“哪里会错”。这门课只教后者——所以它很短、很密、每一条都能直接用在 review 评论里。</div>

### 0.2 重要性标记约定 <span class="lrv-b lrv-key">重点</span>

<div class="lrv-legend">
<span><span class="lrv-b lrv-core">必读</span> 审查的核心拦截点，必须吃透</span><br>
<span><span class="lrv-b lrv-key">重点</span> 关键细节，review 时高频用到</span><br>
<span><span class="lrv-b lrv-skim">可跳读</span> 知道有这回事即可，会折叠</span><br>
<span><span class="lrv-b lrv-skip">非核心</span> 边角，第一次学可以略过</span>
</div>

### 0.3 两条读法

- **速查路线**：只看每讲的「红线表」+「实战抓错」+「速查卡」，跳过原理。适合明天就要 review、先把眼力练出来。
- **精读路线**：连原理一起读（尤其本讲第 2、3 章的双线程），适合想真正理解“为什么是 bug”。

本讲强烈建议精读——因为双线程是后面运行时红线（05–07 讲）的总地基，跳过它，那些 bug 你只能死记，记不住、也不会举一反三。

## 第 1 章 · 心智模型一：Lynx 不是浏览器 <span class="lrv-b lrv-core">必读</span>

AI 的训练语料里绝大多数是 Web 前端。所以默认情况下，**AI 会把 Lynx 当浏览器写**。而 Lynx 是一个独立的渲染平台（像浏览器，但规则不同），于是产生了第一类 bug——“样式层 bug”。

### 1.1 六个最容易被带歪的维度

| 维度 | Web 浏览器 | Lynx | 审查信号 |
| --- | --- | --- | --- |
| 元素 | `<div>` `<span>` `<img>` | `<view>` `<text>` `<image>` | 出现 div/span/img 即红灯 |
| 纯文本 | 可直接写在容器里 | **必须包在 `<text>` 里** | `<view>文字</view>` 即错 |
| 默认盒模型 | `content-box` | `border-box` | 用 Web 算法量尺寸会错 |
| 相邻 margin | 会合并（collapse） | **不合并**，直接相加 | 上下都设 margin → 间距翻倍 |
| 默认布局 | block / flow | **linear**（类 flex column） | 子元素不自动撑满父宽 |
| 单位 | px/rem/vw/… | px/%/vw/vh/rem/em；`rpx` 特有 | 见到 `cm/pt/min-content` 即错 |

### 1.2 为什么这是审查的金矿

<div class="lrv-why"><strong>因为以上每一条 AI 都可能按 Web 习惯写错，而且大多<u>不会报错</u></strong>——页面照样渲染，只是布局悄悄偏了、文字悄悄没了。编译器、lint、控制台都不拦，唯一能拦的就是你这个人肉审查者。这些就是第 01–04 讲要逐条拆的“样式层红线”。</div>

<div class="lrv-note"><strong>记住这一句</strong>：从 Web 带过来的每一个假设，都是一个潜在 bug。看到 Lynx 代码里出现 <code>&lt;div&gt;</code>、<code>float</code>、<code>::before</code>、<code>display:block</code>、依赖 margin 合并——先亮黄灯，再逐一核。</div>

## 第 2 章 · 心智模型二：Lynx 是双线程 <span class="lrv-b lrv-core">必读</span>

这是 Lynx 真正区别于 Web **和** React Native 的地方，也是第二类 bug——运行时 bug——的根。它比样式 bug 更危险，因为它**完全不可见**：页面看着没问题，但卡顿、数据错乱、或只在线上特定场景才炸。

### 2.1 为什么要搞两个线程 <span class="lrv-b lrv-key">重点</span>

一句话：**为了让界面始终跟手。** 把“画界面/算布局”和“跑业务逻辑/调原生能力”分到两个线程，重活就不会卡住界面。

- **主线程（Main）**：跑 React 组件的 render 函数、求值 JSX、UI 渲染与布局。它要尽量轻，才能保证滚动、动画顺滑。
- **后台线程（Background）**：跑 `useEffect`、事件处理函数、原生模块调用。业务逻辑和耗时操作都该在这里。

<div class="lrv-why"><strong>由此推出一条铁律</strong>：凡是“重”的、会卡住界面的事（调原生模块、网络请求、重计算），都不该出现在主线程（render 作用域）里。这正是下面那张表和那个 CRITICAL 错误的来源。</div>

### 2.2 审查者必须背下来的一张表 <span class="lrv-b lrv-core">必读</span>

某段代码运行在哪个线程，决定了它能做什么。这张表是本讲的承重墙：

| 代码位置 | 线程 | 能否调原生 API（`NativeModules`/`lynx.getJSModule`） |
| --- | --- | --- |
| 组件 render 函数体 | **主线程** | ❌ 不行（会阻塞渲染） |
| `useEffect` / `useLayoutEffect` | 后台线程 | ✅ 可以 |
| 事件处理器（`bindtap`/`catchtap` 等） | 后台线程 | ✅ 可以 |
| `ref` 回调 | 后台线程 | ✅ 可以 |
| `useImperativeHandle` | 后台线程 | ✅ 可以 |
| 标了 `'background only'` 的函数 | 后台线程 | ✅ 可以 |

### 2.3 最危险的一类错：在主线程调原生模块 <span class="lrv-b lrv-key">重点</span>

`lynx.getJSModule(...)` 和 `NativeModules.xxx` **只能在后台线程上下文调用**。AI 经常按 Web/React 的直觉，直接写在组件函数体（render 作用域）里：

```tsx
export function App() {
  // ❌ 致命：render 作用域 = 主线程，这里调原生模块
  const mod = lynx.getJSModule('SomeModule');
  NativeModules.SomeModule.call();
  return <view />;
}
```

后果（依据本地 reactlynx-best-practices 的 `detect-background-only` 规则，影响级别 **CRITICAL**）：阻塞 UI 渲染、引发线程同步开销、体验劣化。

正确写法是把它挪进后台线程上下文。下面四种都对，审查时见到任一种都算合规：

```tsx
// ✅ 方式 1：useEffect
useEffect(() => { lynx.getJSModule('M').doSomething(); }, []);

// ✅ 方式 2：'background only' 指令（必须是函数体第一句）
function doWork() {
  'background only';
  NativeModules.Analytics.track('event');
}

// ✅ 方式 3：事件处理器里（本身就在后台线程）
function handleTap() { lynx.getJSModule('M').call(); }

// ✅ 方式 4：ref 回调里
<text ref={(r) => { lynx.getJSModule('M'); }} />
```

<div class="lrv-why"><strong>为什么 AI 特别容易栽这里？</strong>因为在普通 React 里，组件函数体里随手调个方法再正常不过。Lynx 的双线程把“在哪调”变成了对错问题，而这个约束在 Web/RN 里根本不存在——它正是 AI 盲区的正中心。审查 ReactLynx，第一眼就扫 render 作用域里有没有原生调用。</div>

### 2.4 `'background only'` 指令到底意味着什么 <span class="lrv-b lrv-key">重点</span>

看到这个指令，通常是**好信号**——说明作者意识到了线程边界。它的作用：

- 显式把函数标记为只在后台线程执行；
- 允许在函数内安全调用原生模块；
- 让编译器对主线程代码做 tree-shaking（摇掉不必要的部分）；
- 充当文档，提醒其他开发者这里有线程边界。

规则：必须是函数体**第一句**；单双引号都行；纯计算函数不需要它；在 render 期间被调用的函数不能用它（会报错）。

### 2.5 反过来：该在主线程的别丢后台 <span class="lrv-b lrv-skim">可跳读</span>

<details class="lrv-fold">
<summary>展开：高频交互为什么要 <code>'main thread'</code>（05 讲细讲，这里先建立意识）<span class="lrv-b lrv-skim">可跳读</span></summary>

事件默认在后台线程处理，所以“手势 → 处理 → 渲染”要跨线程，复杂页面里会**慢半拍**。对滚动联动、跟手动画这类高频交互，要用主线程脚本同步处理：

```tsx
function onScroll(event: MainThread.IScrollEvent) {
  'main thread'; // 函数体第一句
  const top = event.detail.scrollTop;
  event.currentTarget.setStyleProperty('transform', `translateY(${top}px)`);
}
// 用 main-thread: 前缀绑定事件
<scroll-view main-thread:global-bindscroll={onScroll} />
```

几个会在 05 讲展开、但现在值得先眼熟的点：

- 主线程函数能**读**捕获的外部变量，但**不能改**；捕获值必须可 JSON 序列化；改了的值要等组件重渲染后才同步回主线程。
- `useMainThreadRef()` 拿到可在主线程操作的节点 / 可跨调用保持的状态。
- `runOnMainThread()` / `runOnBackground()` 做跨线程调用。

审查时记住这条对称规律：**原生调用/重活该在后台；跟手动画该在主线程**。两边放反了都是 bug，只是一个表现为“阻塞”、一个表现为“卡顿延迟”。
</details>

## 第 3 章 · 渲染管线视角：一次点击发生了什么 <span class="lrv-b lrv-skim">可跳读</span>

<details class="lrv-fold">
<summary>展开：把两个线程串成一条时间线（帮你真正理解，而非死记）<span class="lrv-b lrv-skim">可跳读</span></summary>

把双线程想成一条流水线，你就不会记混“谁在哪”：

1. **渲染**：主线程跑你的组件函数、求值 JSX，算出界面长什么样并完成布局。→ 所以 render 函数体里别放重活。
2. **副作用**：渲染落地后，`useEffect` 在后台线程执行。→ 所以拉数据、调原生、订阅都放这。
3. **交互**：用户点击，事件在后台线程触发你的 `bindtap` 处理器。→ 所以事件处理器里调原生是安全的。
4. **高频交互的捷径**：滚动/手势若要跟手，用 `main-thread:` 把处理器钉在主线程，省掉跨线程往返。

一句话总览：**主线程负责“呈现与跟手”，后台线程负责“逻辑与脏活”。** 审查时你只要问一句“这段代码属于呈现还是逻辑”，就知道它该在哪个线程、能不能调原生。
</details>

## 第 4 章 · 审查者的世界观：两层 bug <span class="lrv-b lrv-key">重点</span>

把前面合起来，你就有了这门课的总框架——Lynx 页面的 bug 分两层，审查时分两副眼镜：

| 层 | 来源心智模型 | 特征 | 怎么查 | 本课对应 |
| --- | --- | --- | --- | --- |
| **样式层** | Lynx 不是浏览器 | 肉眼可见（布局偏、文字不显示） | 对红线表 + 看预览 | 01–04 讲 |
| **运行时层** | Lynx 是双线程 | 静默、危险（卡顿、数据错、线上才炸） | 看线程归属 + 跑扫描器 | 05–07 讲 |

<div class="lrv-note"><strong>审查顺序建议</strong>：先扫样式层（快、便宜、肉眼能验证），再用 reactlynx-best-practices 的扫描器过运行时层。后者会在 07 讲变成你能一键跑的工具——`detect-background-only` 这类规则就是把本讲 2.3 的人肉检查自动化。</div>

## 第 5 章 · 实战抓错 <span class="lrv-b lrv-core">必读</span>

### 案例 A：商品卡片

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

1. **`NativeModules.PriceService.getCurrent()` 写在 render 作用域** —— <span class="lrv-b lrv-core">CRITICAL</span>。主线程调原生模块，阻塞渲染。应挪进 `useEffect`，用 state 承接结果。
2. **用了 `<div>`** —— Lynx 没有 `<div>`，应为 `<view>`。
3. **纯文本「商品名称」直接写在容器里** —— 非法，必须包进 `<text>`。

只发现 1 个？你抓住了肉眼可见的那层。第 1 处才是真正会上线的事故。修正版：

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

### 案例 B：埋点按钮

再来一段，这次更隐蔽——它能编译、点击也“看起来正常”：

```tsx
export function BuyButton({ skuId }) {
  function track() {
    NativeModules.Analytics.report('buy_click', { skuId });
  }
  const label = lynx.getJSModule('I18n').t('buy_now');

  return <view bindtap={track}><text>{label}</text></view>;
}
```

<details class="lrv-fold">
<summary>展开：审查意见（1 处 CRITICAL + 1 处建议）<span class="lrv-b lrv-key">对照你的答案</span></summary>

1. **`lynx.getJSModule('I18n').t(...)` 在 render 作用域** —— <span class="lrv-b lrv-core">CRITICAL</span>。这行在主线程跑原生调用。注意对比：`track` 函数里的 `NativeModules.Analytics` 是**对的**，因为它在事件处理器（后台线程）里执行；错的只是 render 体里那行 `label`。这正是审查的精度所在——同一个组件里，一个原生调用对、一个错，区别只在“它在哪个作用域”。
2. **建议**：给 `track` 加上 `'background only'` 指令，既是文档也利于 tree-shaking。

修正：把 i18n 文案也挪进后台线程（或在更上层预取），例如用 state + `useEffect` 承接，或改用编译期注入的文案方案。
</details>

## 第 6 章 · 自测错题 <span class="lrv-b lrv-key">重点</span>

<details class="lrv-fold">
<summary>Q1：下面哪个位置可以安全调用 <code>NativeModules</code>？A. 组件函数体 B. <code>useEffect</code> 回调 C. JSX 的 <code>style</code> 里</summary>

**B**。`useEffect` 跑在后台线程。A 是主线程 render 作用域，调原生模块是 CRITICAL 错误；C 不是放副作用的地方。
</details>

<details class="lrv-fold">
<summary>Q2（判断）：这段 Lynx 代码没问题 —— <code>&lt;view&gt;价格：99&lt;/view&gt;</code></summary>

**错**。纯文本必须包在 `<text>` 里：`<view><text>价格：99</text></view>`。
</details>

<details class="lrv-fold">
<summary>Q3：审查时看到 AI 写的页面里有 <code>'background only'</code> 指令，它意味着什么？放在函数哪个位置？</summary>

表示该函数只在后台线程运行，因此可以安全调用原生模块，同时利于主线程代码 tree-shaking。必须是函数体的**第一句**。看到它通常是好信号——说明作者意识到了线程边界。
</details>

<details class="lrv-fold">
<summary>Q4：为什么把 <code>NativeModules</code> 写在 render 函数体里是 CRITICAL，而写在 <code>bindtap</code> 处理器里就没事？</summary>

因为 render 函数体在**主线程**执行，主线程要负责渲染和布局，调原生会阻塞它、引发线程同步开销；而 `bindtap` 事件处理器在**后台线程**执行，原生调用在那里是安全的。同一行代码的对错，只取决于它所在的线程上下文。
</details>

<details class="lrv-fold">
<summary>Q5：一个滚动跟手的动画，处理器写成普通 <code>bindscroll</code> 后台函数，体验“慢半拍”，怎么改方向？</summary>

改用主线程脚本：事件用 `main-thread:` 前缀绑定（如 `main-thread:global-bindscroll`），处理函数体第一句写 `'main thread'`，在函数内直接用 `event.currentTarget.setStyleProperty(...)` 同步改样式，避免“事件(主)→处理(后台)→渲染(主)”的跨线程往返。（细节见 05 讲。）
</details>

<details class="lrv-fold">
<summary>Q6（判断）：Lynx 和 React Native 差不多，RN 的经验基本能直接套。</summary>

**错**。Lynx 有自己的元素集、CSS 规则（border-box 默认、不合并 margin、linear 默认布局），以及 RN 没有的**双线程模型**。把 RN（或 Web）经验直接套，正是这门课要训练你拦截的错误来源。
</details>

## 速查卡 · 00 讲 <span class="lrv-b lrv-core">必读</span>

<div class="lrv-card">
<strong>装进脑子的两句 + 一张表</strong><br>
① <strong>Lynx 不是浏览器</strong> → 元素/盒模型/margin/布局/单位都不同，样式 bug 之源。<br>
② <strong>Lynx 是双线程</strong> → render 体=主线程（不能调原生）；useEffect / 事件 / ref / useImperativeHandle / 'background only' = 后台线程（可调原生）。<br>
③ <strong>最危险红线</strong>：render 作用域里出现 <code>NativeModules</code> / <code>lynx.getJSModule</code> = CRITICAL，静默、阻塞、正中 AI 盲区。<br>
④ <strong>审查动作</strong>：每段代码先问“它是呈现还是逻辑” → 定线程 → 判原生调用合不合规。
</div>

<div class="lrv-key-note"><strong>下一讲预告</strong>：第 01 讲进入样式层，逐条拆「样式红线」——text 必包、border-box、margin 不合并、linear 不撑满、选择器静默失效、z-index 与层叠、单位与 calc。都是 AI 高频踩、却不报错的坑。</div>
