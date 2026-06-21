---
title: "Kodama 知识点 03：Electron 的进程模型、IPC 与 preload —— 桌宠为什么能「点一下就去操作系统」"
date: 2026-06-21 21:00:00
tags: [知识点, Electron, IPC, preload, 安全, 科普]
categories: [技术笔记, 知识点系列]
---

> 「知识点系列」第三篇。桌宠点一下气泡，后台就能去跑 `ps`/`lsof`、遥控 cmux、读 token 文件；管理窗口拖个滑块，桌宠立刻变大——这些跨「网页」和「系统」的事，靠的是 Electron 的 **进程模型 + IPC + preload** 这套机制。这篇讲清楚它，以及为什么要这么设计（答案是：安全）。

## 1. Electron 有两种进程

一个 Electron 应用里有两类进程，分工明确：

- **主进程（main）**：只有一个。它是 Node.js 环境，能干「系统级」的事——开窗口、读写文件、跑子进程（`ps`/`lsof`/`cmux`）、调原生 API。桌宠的 `index.js` 就跑在这里。
- **渲染进程（renderer）**：每个窗口一个。它是「浏览器环境」，负责画界面（HTML/CSS/JS）。桌宠的 `renderer.js`、管理窗口的 `manage.js` 跑在这里。

类比：主进程是「后厨」（能动火、能进库房），渲染进程是「前厅」（负责展示和接待）。前厅不能直接进库房，得通过传菜口下单。

## 2. 为什么不让渲染进程直接干系统的事？

最自然的想法是：让界面代码直接 `require('fs')` 读文件、`require('child_process')` 跑命令，不就省事了？

**因为不安全。** 渲染进程在加载网页内容。一旦页面里混入了恶意脚本（比如你的应用加载了第三方内容、或有 XSS），而这个渲染进程又能直接碰文件系统和 shell，那恶意脚本就能读你的文件、跑任意命令。后果不堪设想。

所以 Electron 的安全最佳实践是：

```
渲染进程：nodeIntegration: false   ← 关掉 Node 能力
          contextIsolation: true   ← 隔离上下文
```

这样渲染进程就是个「干净的浏览器」，碰不到 Node。那它怎么让后厨干活？通过**传菜口**——IPC + preload。

## 3. IPC：两个进程之间的「传菜口」

**IPC**（Inter-Process Communication，进程间通信）就是主进程和渲染进程之间传消息的通道。Electron 提供两种模式：

- **send / on（单向，发了不等回）**：渲染进程 `ipcRenderer.send('频道', 数据)`，主进程 `ipcMain.on('频道', handler)` 收。适合「通知型」操作，比如「把桌宠藏起来」。
- **invoke / handle（双向，发了等返回）**：渲染进程 `await ipcRenderer.invoke('频道', 数据)`，主进程 `ipcMain.handle('频道', async handler)` 处理并返回。适合「要结果」的操作，比如「打开这个会话，告诉我成功没」。

桌宠里的例子：

```js
// 渲染进程：点气泡 → 请主进程去跳转终端，并等结果
const result = await window.pet.openTarget({ kind: 'terminal-session', tty, cwd })

// 主进程：收到后跑 ps/lsof/cmux，跳转，返回成功与否
ipcMain.handle('pet:open-target', async (_e, target) => { /* ... */ return { ok: true } })
```

界面只管「下单」，真正去跑 `ps`/`cmux` 的脏活累活都在主进程。前厅碰不到刀，但能让后厨切菜。

## 4. preload：一份「受控的菜单」

但 IPC 还有个问题：如果直接把整个 `ipcRenderer` 暴露给页面，页面就能往**任意频道**发消息，等于又开了个口子。

**preload 脚本**解决这个。它是一段在「渲染进程加载页面之前」运行的特殊脚本，能同时碰到 Node 和页面。它的作用是：**只挑选** App 真正需要的几个操作，包装成安全的函数，挂到 `window` 上给页面用。其它一概不暴露。

```js
// preload.js —— 只暴露这几个，像一份固定菜单
contextBridge.exposeInMainWorld('pet', {
  openTarget: (target) => ipcRenderer.invoke('pet:open-target', target),
  setHidden: (hidden) => ipcRenderer.send('pet:set-hidden', hidden),
  patchUiSettings: (patch) => ipcRenderer.send('pet:patch-ui-settings', patch),
  // ……只有列在这里的，页面才用得到
})
```

`contextBridge.exposeInMainWorld('pet', {...})` 的意思是：在页面的 `window` 上挂一个 `pet` 对象，里面只有我列的这些方法。页面只能点「菜单」上有的菜，点不了没列的。这就是「最小权限」——把攻击面收到最小。

所以页面里写的 `window.pet.openTarget(...)`，背后是：preload 暴露的函数 → `ipcRenderer.invoke` → 主进程 `ipcMain.handle` → 真正干活。一层层都是受控的。

## 5. 串起来：管理窗口改个滑块，桌宠为什么会变

这正好用上前面全部概念。管理窗口和桌宠是**两个不同的渲染进程**，它们不能直接对话，得让主进程当中间人：

```
管理窗口(renderer A)  --IPC-->  主进程(main)  --IPC-->  桌宠(renderer B)
   拖动「大小」滑块                  转发设置补丁              收到补丁→应用→保存
   window.pet.patchUiSettings()     sendToPet('pet:apply-ui-patch')   桌宠变大
```

- 管理窗口拖滑块 → `window.pet.patchUiSettings({ petScale: 0.9 })`（preload 暴露的）
- → IPC 到主进程 → 主进程 `sendToPet('pet:apply-ui-patch', patch)` 转发给桌宠窗口
- → 桌宠收到 → 合并设置、保存、重新布局 → 你看到桌宠变大

两个前厅之间传话，必须过后厨这个总机。这也是为什么管理窗口要存在感很弱地通过 main 同步，而不是直接改桌宠——进程隔离决定的。

## 小结 & 学习路径

- **两种进程**：main（Node，干系统的事）／renderer（浏览器，画界面）。
- **为什么隔离**：渲染进程不该直接碰文件/shell，否则页面被注入就完蛋。
- **IPC**：进程间传菜口。`send/on`（单向）、`invoke/handle`（要返回）。
- **preload + contextBridge**：只暴露一份「受控菜单」给页面，最小权限。
- **跨窗口**：两个渲染进程不直接对话，靠主进程转发。

延伸关键词：`ipcMain` / `ipcRenderer` / `contextBridge` / `contextIsolation` / `nodeIntegration` / `webPreferences` / Electron「Process Sandboxing」「Security Checklist」官方文档。想动手就在桌宠里加一个 `console.log` 到 preload 和主进程 handler，点一次气泡，看消息怎么从前厅流到后厨再流回来。

至此「知识点系列」前三篇覆盖了桌宠最硬核的三块地基：窗口（01）、终端定位（02）、进程通信（03）。后面会按需补充 Live2D 渲染、养成系统持久化等专题。
