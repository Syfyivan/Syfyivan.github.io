---
title: "Kodama 开发笔记 10：为什么全屏桌面上桌宠会消失"
date: 2026-06-18 18:40:00
tags: [Electron, macOS, 桌宠, NSPanel, 全屏, 工具开发]
categories: [技术笔记, 项目工坊]
---

桌宠做到后期，一个看起来很离谱的问题出现了：

> 为什么桌宠在普通桌面能显示，但到了 macOS 全屏应用里就不见了？

这不是简单的 `z-index` 问题，也不是图片没加载。它涉及 macOS 的窗口层级、Spaces、全屏桌面、Electron `BrowserWindow` 的能力边界，以及是否需要用原生 `NSPanel`。

这一篇把这个问题单独写清楚。

## 普通置顶不等于全屏置顶

在 Electron 里，让窗口置顶通常会写：

```js
win.setAlwaysOnTop(true);
```

对普通桌面来说，这已经够用。但 macOS 全屏应用不是普通窗口最大化。它会进入独立 Space，系统会把这个全屏应用放到自己的桌面层级里。

所以你会看到这种现象：

- 桌面上：桌宠正常显示。
- 飞书普通窗口上：桌宠正常显示。
- Chrome 全屏或演示全屏：桌宠消失。
- 切回普通桌面：桌宠又出现。

这说明桌宠进程没挂，窗口也没关闭，只是被当前全屏 Space 的窗口层级压住了。

## Electron 能做的第一层处理

Electron 提供了几个相关 API：

```js
win.setVisibleOnAllWorkspaces(true, {
  visibleOnFullScreen: true,
  skipTransformProcessType: true,
});

win.setAlwaysOnTop(true, 'screen-saver', 1);
win.moveTop();
```

它们分别解决不同问题。

`setVisibleOnAllWorkspaces` 让窗口尽量出现在所有桌面空间里。`visibleOnFullScreen` 告诉 macOS：即使当前是全屏 Space，也希望这个窗口可见。

`setAlwaysOnTop(true, 'screen-saver', 1)` 把窗口提升到更高的层级。`screen-saver` 是 Electron 暴露的一个高层级，比普通 `floating` 更强。

`moveTop()` 用来在窗口被系统或其它应用压下去后重新抬起来。

这套组合能覆盖很多情况，但它不是百分百保证。

## 为什么还会失败

失败原因在于 Electron 的窗口本质上还是 `NSWindow` 的封装，而 macOS 对全屏 Space 的规则很严格。

一些全屏应用会：

- 独占自己的 Space。
- 把其它普通窗口排除在当前全屏桌面外。
- 在切 Space 时重置窗口层级。
- 抢回 key window 或 main window。
- 对 screen-saver 层级有额外限制。

所以 Electron 层面的做法更像“尽量维持置顶”，而不是“系统级保证”。

这也是为什么我在 Kodama 里做了 reassert：

```text
启动时设置全屏可见
窗口 show 后 moveTop
切换焦点后 moveTop
定时检查并重新 setAlwaysOnTop
```

这个做法能提升稳定性，但仍然属于 Electron 能力范围内的最佳努力。

## 真正稳定的方向：NSPanel

如果要做得更像系统级桌宠，下一步应该接 macOS 原生 `NSPanel`，或者使用类似 `electron-panel-window` 的方案。

`NSPanel` 可以设置更适合悬浮工具的属性：

```text
NSWindowCollectionBehaviorCanJoinAllSpaces
NSWindowCollectionBehaviorFullScreenAuxiliary
NSPanelStyleMaskNonactivatingPanel
floating / screenSaver 级别
```

这些能力的意义是：

- `CanJoinAllSpaces`：允许窗口进入所有 Spaces。
- `FullScreenAuxiliary`：允许窗口作为全屏应用的辅助窗口出现。
- `NonactivatingPanel`：点击面板时不抢走主应用焦点。
- 更高层级：避免被普通应用覆盖。

这正是桌宠需要的：它要显示在全屏桌面上，但又不应该把用户从当前 App 里拉出来。

## 为什么没有第一时间上 NSPanel

听起来 NSPanel 是正解，那为什么不一开始就做？

因为它会增加几个成本。

第一，跨平台成本。Kodama 目标不只是 macOS。Windows 和 Linux 的置顶、穿透、托盘、全屏行为完全不同。如果一开始就把核心窗口做成 macOS 原生扩展，后面抽象会更重。

第二，打包成本。原生模块意味着构建、签名、notarization、架构兼容都要处理。桌宠还处于功能快速迭代阶段时，先用 Electron 原生 API 验证产品形态更快。

第三，调试成本。全屏置顶问题不只看代码，还要在不同应用全屏模式下手动验证。比如 Chrome 全屏、飞书全屏、视频会议全屏、Keynote 演示、远程桌面，它们表现可能不同。

所以当前策略是：

1. Electron 内做到 `screen-saver + visibleOnFullScreen + reassert`。
2. 明确记录它是 best-effort。
3. 如果用户日常全屏场景仍然压住，再接 NSPanel。

这是一个工程取舍：先让大多数场景可用，再为最难场景补原生层。

## 全屏问题怎么验证

这个问题不能靠截图一次就说完成。需要列测试矩阵。

我会按这些场景验证：

```text
普通桌面 + 飞书窗口
普通桌面 + 浏览器窗口
Chrome 全屏
飞书全屏
终端全屏
视频播放全屏
外接显示器全屏
切换 Space 后返回
睡眠唤醒后
隐藏/恢复桌宠后
```

每个场景都要看三件事：

- 桌宠是否可见。
- 鼠标点击是否仍然穿透或只命中小范围。
- 气泡和设置面板是否仍在屏幕内。

如果只验证“窗口出现”，还不够。全屏下最容易同时出现窗口层级、点击范围和气泡边界三类问题。

## 菜单栏入口为什么也不稳定

用户问过：菜单栏里怎么看到它？为什么我隐藏后不知道怎么打开？

macOS 菜单栏也是一个不可靠入口。图标太多时，系统或者 Bartender 这类工具会把图标挤掉、折叠或隐藏。桌宠如果只靠菜单栏恢复，就会出现“我把它藏了，然后找不到入口”的尴尬。

所以恢复入口应该有三层：

1. 菜单栏 `Kodama` 图标。
2. 全局快捷键。
3. 开发态命令或本地 health endpoint。

菜单栏是主入口，快捷键是兜底入口。隐藏功能必须同时提供恢复方式，否则它不是隐藏，是丢失。

## 开发结论

桌宠在全屏桌面不展示，通常不是业务代码坏了，而是 macOS 全屏 Space 把 Electron 窗口排除或压住了。

当前 Electron 能做的是：

- `visibleOnFullScreen`
- `setVisibleOnAllWorkspaces`
- `screen-saver` 级别置顶
- `moveTop`
- 定时 reassert
- 菜单栏和快捷键恢复

如果这些仍然不稳定，就需要进入原生窗口层：

- NSPanel
- FullScreenAuxiliary
- CanJoinAllSpaces
- NonactivatingPanel

这也是桌宠和普通网页最大的不同：网页只要在浏览器里排版，桌宠要和操作系统窗口管理器协商自己的存在感。
