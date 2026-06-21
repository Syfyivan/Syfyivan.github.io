---
title: "Kodama 知识点 01：做桌面悬浮窗，你得先懂这些 macOS 窗口概念"
date: 2026-06-21 18:00:00
tags: [知识点, macOS, 窗口, Electron, 桌宠, 科普]
categories: [技术笔记, 知识点系列]
---

> 这是「知识点系列」的第一篇。和「开发笔记」系列不同——开发笔记讲「我这一步是怎么做的」，知识点系列把里面用到的**名词、概念单独拎出来**，从零讲清楚：是什么、为什么需要、怎么用、想深入去哪学。
>
> 做桌宠（一个浮在桌面上、能穿透点击、还要盖住全屏的小东西）时，我被一堆 macOS 窗口概念绊过。这篇把它们一次讲透。

## 0. 一个心智模型：窗口不只是「一个框」

写网页时，我们的世界就是浏览器这个盒子，`z-index` 决定谁盖谁，仅此而已。

但桌面应用的窗口，是操作系统管理的对象。macOS 用一套叫 **窗口服务（WindowServer）** 的东西统一管理所有 App 的所有窗口：谁在前、谁在哪个桌面、谁能盖住谁、点击落到谁身上。你的窗口想「特立独行」（比如浮在所有人之上、还不抢焦点），就得按它的规则报备一堆属性。

下面这些概念，本质都是「向 WindowServer 报备的属性」。

## 1. NSWindow / NSPanel：窗口的两种「身份」

- **NSWindow**：普通窗口。App 的主界面就是它，比如浏览器主窗口、编辑器主窗口。
- **NSPanel**：面板，是 NSWindow 的一个特殊子类，专门给「辅助工具」用——调色板、Spotlight 搜索框、输入法候选框都是 NSPanel。

为什么要分两种？因为系统对「辅助面板」有特殊待遇：比如允许它浮在全屏应用之上、点它时不把你从当前 App 拉走。这些待遇普通 NSWindow 享受不到。

**怎么用**：在 Electron 里，建窗口时传 `type: 'panel'`，Electron 会在底层把这个窗口标成 NSPanel（加上 `NSWindowStyleMaskNonactivatingPanel` 样式）。

**怎么学**：搜 Apple 文档 `NSPanel`、`NSWindowStyleMask`。

## 2. 窗口层级（Window Level）：谁盖在谁上面

每个窗口有一个「层级」数值，数值大的盖住数值小的。常见层级从低到高：

```
普通窗口 < 浮动(floating) < 状态栏 < 弹出菜单 < 屏保(screen-saver)
```

`z-index` 是同一个网页里元素的前后，**窗口层级是不同窗口之间的前后**——是操作系统级的。

**怎么用**：Electron 里 `win.setAlwaysOnTop(true, 'screen-saver')`——把窗口提到很高的「屏保」层级，基本能盖住普通应用。

**注意**：层级高 ≠ 能盖住全屏应用。盖全屏是另一套规则（见下文 Space），层级只解决「同一个桌面里谁在上面」。这是我一开始最大的误解。

## 3. Space（虚拟桌面）与「原生全屏」

**Space** 就是 macOS 的「虚拟桌面」。你可以有好几个桌面，用三指左右滑切换。

关键点：一个 App 进入**原生全屏**（点绿色按钮 / ⌃⌘F）时，系统会把它**单独丢进一个新的 Space**，像进了一间单独的房间、关上门。

而普通窗口默认「钉」在它创建时所在的那个 Space。所以你切到全屏 App 的房间时，普通窗口（比如桌宠）**没跟过去**——看起来就是「消失了」。它没死，只是被关在别的房间。

这就是为什么「窗口层级再高也盖不住别人全屏」：层级是房间内的前后，跨房间根本不归层级管。

**怎么让窗口进所有房间**：见下面的「集合行为」。

**怎么学**：搜 `mission control spaces`、`NSWindowCollectionBehavior`。

## 4. 集合行为（Collection Behavior）：窗口和 Space 的关系

每个窗口可以声明它「怎么和 Space 相处」，常用几个标志：

- `canJoinAllSpaces`：出现在所有 Space（你切到哪个桌面它都在）。
- `fullScreenAuxiliary`：允许作为「全屏辅助窗口」出现在全屏 Space 里（输入法候选框就靠这个）。

**怎么用**：Electron 里 `win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })`——底层就是设这两个标志。

**坑**：光设这两个标志，普通前台 App 的普通窗口**仍然常常盖不住别人的全屏**。因为还差两个条件：窗口得是「面板」（第 1 节），App 得是「后台辅助身份」（第 5 节）。三者齐了才行。这部分我在「开发笔记 12」里详细写过。

## 5. 激活策略（Activation Policy）：App 的「身份」

不只是窗口有身份，**整个 App 也有身份**：

- **regular（普通前台应用）**：Dock 里有图标、能 ⌘Tab 切到、点它会「激活」抢焦点。浏览器、编辑器都是。
- **accessory（辅助 / 后台应用）**：**没有 Dock 图标**，不抢焦点，被系统当作「背景里的小帮手」。菜单栏小工具就是这种。
- **prohibited**：完全不在 UI 里出现。

为什么重要？因为系统的潜规则是：**只有 accessory 应用的面板，才被允许覆盖任意 Space（包括别人的全屏房间）**。前台应用的窗口被绑在自己活跃的房间里。

**怎么用**：
- 运行时：`app.setActivationPolicy('accessory')`。
- 打包时写死：`Info.plist` 里 `LSUIElement: true`（从启动那一刻就是 accessory，不会闪一下 Dock 图标）。

**代价**：App 从 Dock 和 ⌘Tab 消失，只剩菜单栏入口。对桌宠/托盘工具反而合适。

## 6. 透明窗口（Transparent）与点击穿透（Click-through）

桌宠要「浮在桌面上、只看得到那只宠物、不挡住你干活」，靠两个东西：

**透明窗口**：窗口背景完全透明，你只看到画在上面的内容（宠物、气泡），看不到窗口本身的框/底色。Electron 里 `transparent: true` + `frame: false`（无边框）。

**点击穿透**：一个透明的大窗口，如果会拦鼠标，那你点它覆盖的区域就点不到下面真正的东西了。所以要让鼠标「穿过去」：

```js
win.setIgnoreMouseEvents(true, { forward: true })
```

- `true`：忽略鼠标事件（穿透，点到下面的桌面/其它 App）。
- `forward: true`：即使在穿透状态，**也把鼠标移动事件转发给我**。这很关键——我得知道鼠标什么时候移到了宠物身上，才能临时关掉穿透让宠物可点。

所以桌宠的交互逻辑是：默认穿透；鼠标移到宠物/气泡上方 → 关穿透（可点）；移开 → 重新开穿透。

**安全底线**：一个铺满屏幕的透明窗口，万一穿透逻辑出 bug，整个屏幕就点不动了。所以一定要保证「默认就是穿透」，让最坏情况也只是宠物那一小块异常，而不是整屏锁死。

**怎么学**：Electron 文档 `BrowserWindow`、`win.setIgnoreMouseEvents`；macOS 层面是 `ignoresMouseEvents`。

## 7. 把它们串起来：桌宠是怎么「成立」的

一只能浮在全屏之上、又不挡你干活的桌宠，是上面这些概念的叠加：

```
透明 + 无边框        → 只看到宠物，看不到窗口
点击穿透(forward)    → 不挡你点桌面，移上去才可点
铺满工作区的大窗口    → 宠物能去任意位置、气泡有地方摆不被裁
type:'panel'(NSPanel)→ 能当全屏辅助窗口、点击不抢焦点
accessory 身份       → 它的面板被允许覆盖任意 Space(含别人全屏)
screen-saver 层级    → 在所在桌面里盖在最上面
canJoinAllSpaces +   → 出现在每一个虚拟桌面 / 全屏房间
  fullScreenAuxiliary
```

少任何一层，都会缺一块：要么盖不住全屏、要么挡住你干活、要么抢焦点把你踢出全屏、要么气泡被裁。

## 小结 & 学习路径

如果你也要做这类「桌面悬浮 / overlay」应用，建议按这个顺序理解：

1. 先建立「窗口是操作系统管理的对象，不是网页里的 div」这个心智模型。
2. 分清两个维度：**窗口的身份**（NSWindow / NSPanel）和 **App 的身份**（regular / accessory）。
3. 再分清两个「前后」：同桌面内的**层级**，和跨桌面的 **Space 归属**（集合行为）。
4. 最后是交互层：**透明 + 点击穿透**。

延伸阅读关键词：`NSWindow` / `NSPanel` / `NSWindowLevel` / `NSWindowCollectionBehavior` / `NSApplication.ActivationPolicy` / `LSUIElement`；Electron 侧：`BrowserWindow` 的 `type` / `setAlwaysOnTop` / `setVisibleOnAllWorkspaces` / `setIgnoreMouseEvents` / `app.setActivationPolicy`。

下一篇知识点，打算讲「tty、进程、cwd」这一组——做「点气泡跳回正在跑的终端会话」时绕不开的概念。
