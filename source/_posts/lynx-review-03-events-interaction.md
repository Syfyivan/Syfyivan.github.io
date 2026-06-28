---
title: "《Lynx 审查者速成课》第03讲 · 交互与事件：bindtap / catchtap、线程、跟手"
date: 2026-06-28 13:00:00
tags: [Lynx, ReactLynx, 前端, 代码审查, 事件, 交互, 课程]
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

<div class="lrv-key-note"><strong>本讲定位</strong>：交互 = 事件。Lynx 的事件有三条自己的规矩，AI 容易按 Web/React 直觉写错：① <code>bindtap</code> 冒泡 vs <code>catchtap</code> 阻断；② 事件处理器跑在<strong>后台线程</strong>（所以能安全调原生）；③ 跟手交互要走<strong>主线程脚本</strong>否则慢半拍。本讲把这三条拆开，配实战抓错与速查卡。</div>

## 第 1 章 · 事件绑定：bindtap vs catchtap <span class="lrv-b lrv-core">必读</span>

Lynx 用 `bind*` / `catch*` 前缀绑定事件（不是 Web 的 `onClick`）：

| 写法 | 行为 | 用途 |
| --- | --- | --- |
| `bindtap` | 冒泡到父级 | 点击事件的默认选择 |
| `catchtap` | **阻止冒泡** | 不想让父级处理器也触发时 |

```tsx
// 点 Inner：先 "inner" 后 "outer"（冒泡）
<view bindtap={onOuter}><view bindtap={onInner}>Inner</view></view>

// 点 Inner：只有 "inner"（catchtap 阻断冒泡）
<view bindtap={onOuter}><view catchtap={onInner}>Inner</view></view>
```

<div class="lrv-note"><strong>审查信号</strong>：看到 <code>onClick</code>/<code>onTap</code> 这种 Web/React 写法用在 Lynx 元素上——错，应是 <code>bindtap</code>。需要拦截冒泡却用了 <code>bindtap</code>，会导致父级被误触发。</div>

## 第 2 章 · 事件对象：target vs currentTarget <span class="lrv-b lrv-core">必读</span>

这是审查最容易放过的一处语义坑。事件对象关键字段：

```ts
interface Event {
  type: string;        // 事件类型
  timestamp: number;   // 触发时间戳
  target:        { id: string; uid: number; dataset: Record<string, any> }; // 触发事件的元素
  currentTarget: { id: string; uid: number; dataset: Record<string, any> }; // 监听事件的元素
}
```

<div class="lrv-key-note"><strong>核心区别</strong>：<code>target</code> 是<strong>真正被点</strong>的元素（可能是子节点）；<code>currentTarget</code> 是<strong>挂了处理器</strong>的元素。要取“挂处理器那个元素”的 dataset，<strong>用 <code>currentTarget</code></strong>——用 <code>target</code> 在有子节点时会取错。</div>

```tsx
// ✅ 用 dataset 传数据（优于闭包），并用 currentTarget 读
<view data-item-id="123" data-item-name="Product" bindtap={handleTap}>
  <text>Tap me</text>   {/* 点到 text 时，target 是 text，currentTarget 才是这个 view */}
</view>

function handleTap(event) {
  const { itemId, itemName } = event.currentTarget.dataset; // ✅ 稳
}
```

<div class="lrv-why"><strong>为什么推荐 dataset 而非闭包？</strong>列表里给每个 item 绑事件时，用 <code>data-*</code> 传数据比为每项创建闭包更省、也更利于复用同一个处理器函数。审查时看到 <code>map</code> 里给每项写内联箭头闭包 <code>onTap={() => f(item.id)}</code>，可以建议改 dataset + 函数引用。</div>

## 第 3 章 · 事件在后台线程（复习第 00 讲） <span class="lrv-b lrv-key">重点</span>

事件处理器跑在**后台线程**，所以在里面调原生模块、发网络请求、做重计算都是**安全的**：

```tsx
function handleTap(event) {
  lynx.getJSModule('Analytics').track('tap'); // ✅ 后台线程，安全
  NativeModules.Router.push('/detail');       // ✅ 安全
}
```

这正是第 00 讲那张线程表的实战：同样一行 `NativeModules.xxx`，写在 render 体里是 CRITICAL，写在 `bindtap` 处理器里就对。

<div class="lrv-note"><strong>性能小抄</strong>：优先用<strong>函数引用</strong>（<code>bindtap={handleTap}</code>）而非内联箭头函数，减少每次渲染重建；静态、不依赖 props 的处理器尤其如此。</div>

## 第 4 章 · 冒泡与阻止传播 <span class="lrv-b lrv-key">重点</span>

声明式：`bindtap` 冒泡、`catchtap` 阻断（第 1 章）。程序式阻止要注意——**只能在主线程函数里调**：

```tsx
function handleTap(event: MainThread.ITouchEvent) {
  'main thread';                      // 必须主线程
  event.stopPropagation();            // 停止冒泡
  event.stopImmediatePropagation();   // 停止冒泡 + 阻止同元素其它处理器
}
```

<div class="lrv-why"><strong>审查信号</strong>：在普通后台线程处理器里调 <code>event.stopPropagation()</code> 想阻止冒泡——位置不对。要么改用 <code>catchtap</code> 声明式阻断，要么把处理器变成主线程函数（<code>'main thread'</code>）。</div>

## 第 5 章 · 跟手交互：走主线程脚本 <span class="lrv-b lrv-core">必读</span>

这是交互体验的命门。**事件在主线程触发，但普通 JS 处理器在后台线程执行**，于是“手势→处理→渲染”要跨线程往返，复杂页面里**慢半拍**，页面越复杂延迟越明显。

跟手动画/滚动联动的正解是**主线程脚本**：用 `main-thread:` 前缀绑定，处理函数第一句 `'main thread'`，直接在主线程同步改样式：

```tsx
// ❌ 后台处理：setState 驱动，跨线程，有延迟
function onScroll(e) { setPos(e.detail.scrollTop); }
<scroll-view global-bindscroll={onScroll}><view style={{transform:`translateY(${pos}px)`}}/></scroll-view>

// ✅ 主线程处理：同步改样式，跟手
function onScroll(e: MainThread.IScrollEvent) {
  'main thread';
  e.currentTarget.setStyleProperty('transform', `translateY(${e.detail.scrollTop}px)`);
}
<scroll-view main-thread:global-bindscroll={onScroll}><view/></scroll-view>
```

<details class="lrv-fold">
<summary>展开：主线程脚本的几条约束 + 跨线程调用 <span class="lrv-b lrv-skim">可跳读</span></summary>

- 主线程函数能**读**捕获的外部变量，但**不能改**；捕获值必须可 JSON 序列化；改了的值要等组件重渲染后才同步回主线程。
- `useMainThreadRef()`：拿可在主线程操作的节点，或跨调用保持的状态（如计数器）。
- 跨线程调用：`runOnMainThread(fn)(...)`（后台→主）、`runOnBackground(fn)()`（主→后台）。
- 主线程函数不支持嵌套定义；`MainThreadRef.current` 只在主线程可访问。

审查口诀：**重活/原生 → 后台；跟手/同步改样式 → 主线程。** 放反了，一边表现为“阻塞”、一边表现为“延迟卡顿”。
</details>

## 第 6 章 · 实战抓错 <span class="lrv-b lrv-core">必读</span>

### 案例 A：列表点击取错数据

```tsx
function List({ items }) {
  function onTap(e) {
    const id = e.target.dataset.id;       // 取被点元素的 id
    NativeModules.Router.push(`/item/${id}`);
  }
  return (
    <view>
      {items.map(it => (
        <view key={it.id} data-id={it.id} bindtap={onTap}>
          <image src={it.img} /><text>{it.name}</text>
        </view>
      ))}
    </view>
  );
}
```

<details class="lrv-fold">
<summary>展开：审查意见（1 处隐蔽 bug）<span class="lrv-b lrv-key">对照你的答案</span></summary>

**`e.target.dataset.id`** —— 隐蔽 bug。点击落在子节点 `<image>`/`<text>` 上时，`target` 是那个子节点，它没有 `data-id`，于是取到 `undefined`，跳转就错了。`data-id` 挂在外层 `<view>`（监听者）上，应该用 **`e.currentTarget.dataset.id`**。

这类 bug 在“整块都能点、但点到文字/图片时才出错”的场景里极难复现，正是审查该拦的。其余写法（dataset 传值、函数引用、事件里调原生）都是对的。
</details>

### 案例 B：滚动视差“慢半拍”

```tsx
function Parallax() {
  const [y, setY] = useState(0);
  function onScroll(e) { setY(e.detail.scrollTop * 0.5); }
  return (
    <scroll-view global-bindscroll={onScroll}>
      <view className="bg" style={{ transform: `translateY(${y}px)` }} />
    </scroll-view>
  );
}
```

<details class="lrv-fold">
<summary>展开：审查意见（体验问题，非崩溃）<span class="lrv-b lrv-key">对照你的答案</span></summary>

能跑，但**视差背景会跟不上滚动、慢半拍**。根因：`onScroll` 在后台线程，`setState` 触发重渲染再改 transform，跨线程有延迟。改为**主线程脚本**：

```tsx
function onScroll(e: MainThread.IScrollEvent) {
  'main thread';
  e.currentTarget.setStyleProperty('transform', `translateY(${e.detail.scrollTop * 0.5}px)`);
}
<scroll-view main-thread:global-bindscroll={onScroll}><view className="bg" /></scroll-view>
```

审查“跟手/滚动联动/手势动画”这类需求时，看到用 `setState` + 后台 `bindscroll` 驱动——提示改主线程脚本。
</details>

## 第 7 章 · 自测错题 <span class="lrv-b lrv-key">重点</span>

<details class="lrv-fold">
<summary>Q1：点击一个内部有 <code>&lt;text&gt;</code> 的可点击 <code>&lt;view&gt;</code>，要读这个 view 上的 <code>data-id</code>，用 target 还是 currentTarget？</summary>

**currentTarget**。`target` 可能是被点的子节点 `<text>`，没有 `data-id`；`currentTarget` 才是挂处理器的那个 view。
</details>

<details class="lrv-fold">
<summary>Q2：想让子元素点击时不触发父元素的处理器，最简单的写法？</summary>

子元素用 **`catchtap`** 替代 `bindtap`，声明式阻断冒泡。或在主线程处理器里调 `event.stopPropagation()`（注意要 `'main thread'`）。
</details>

<details class="lrv-fold">
<summary>Q3：一个跟手拖拽动画写成普通 <code>bindtouchmove</code> 后台处理器，体验卡，方向怎么改？</summary>

改主线程脚本：`main-thread:bindtouchmove` + 处理函数 `'main thread'`，在函数内用 `event.currentTarget.setStyleProperty(...)` 直接同步改样式，避免跨线程往返。
</details>

<details class="lrv-fold">
<summary>Q4（判断）：事件处理器里调 <code>NativeModules</code> 是危险的，应该挪走。</summary>

**错**。事件处理器跑在后台线程，调原生是**安全**的。危险的是写在 render 函数体（主线程）里。别把对的也误判了。
</details>

<details class="lrv-fold">
<summary>Q5：列表里给每项写 <code>bindtap={() => go(item.id)}</code>，有什么可优化？</summary>

每次渲染都为每项重建闭包。可改为 `data-id={item.id}` + 统一的函数引用处理器，用 `currentTarget.dataset.id` 取值，更省、更易维护。
</details>

## 速查卡 · 03 讲 <span class="lrv-b lrv-core">必读</span>

<div class="lrv-card">
<strong>交互三规矩</strong>：① 绑定用 <code>bindtap</code>(冒泡)/<code>catchtap</code>(阻断)，不是 <code>onClick</code>；② 取监听元素数据用 <code>currentTarget.dataset</code>（不是 target）；③ 跟手/滚动联动走 <code>main-thread:</code> + <code>'main thread'</code>，否则慢半拍。<br>
<strong>线程归属</strong>：事件处理器=后台线程（调原生安全）；跟手同步改样式=主线程脚本。<br>
<strong>小优化</strong>：函数引用 > 内联闭包；dataset 传值 > 闭包捕获。
</div>

<div class="lrv-key-note"><strong>下一讲预告</strong>：第 04 讲讲「动画」——transition / keyframes 怎么写、哪些属性能动哪些会拖垮性能、以及“声明式 CSS 动画”和“跟手交互动画”到底该用哪种。对 CSS 动画不熟的同学，这讲从零讲起。</div>
