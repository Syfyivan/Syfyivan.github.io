---
title: "Kodama 续：给桌宠做可插拔渲染后端，以及 CSP 与素材版权踩的坑"
date: 2026-06-15 20:30:00
tags: [Electron, Live2D, 桌宠, CSP, 前端, 工程实践]
categories: [技术笔记, 项目工坊]
---

上一篇把桌宠和飞书机器人接通了——bridge 发事件、桌宠 SSE 订阅、一只桌宠两个来源。这一篇是纯工程记录：怎么让它**离线可跑**、怎么**换形象**、以及一个我觉得最值的架构决策——**同一套引擎，对外用 Live2D、自己私用换 GIF**。中间踩的 CSP 坑也一起写了，那几个错误信息很典型。

> 一句话主线：把"会变的东西"都挡在接口后面（渲染方式、模型、动作组名），核心逻辑就不用动；再加一条——**让错误可见**，能省掉无数次开 DevTools。

## 一、离线化：按 model3.json 自己把模型下全，版权决定什么进 git

最初渲染栈和模型都从 CDN 加载，演示要联网。要离线，就得把 PixiJS、pixi-live2d-display、Cubism Core 和模型都拉到本地。但这里有个**版权约束直接决定了工程做法**：Cubism Core 与官方 Sample 模型受再分发限制，**不能提交进公开仓库**。所以做法是——写一个 setup 脚本按需下载，并把这些资产 `.gitignore`。

模型不是单文件，`.model3.json` 只是入口，真正的依赖（moc3、贴图、physics、各组 motion）都写在它的 `FileReferences` 里。脚本递归解析、保持相对目录下载：

```js
// scripts/setup-assets.mjs  collectModelRefs
function collectModelRefs(json) {
  const refs = new Set()
  const fr = json.FileReferences || {}
  for (const key of ['Moc', 'Physics', 'Pose', 'DisplayInfo', 'UserData']) {
    if (fr[key]) refs.add(fr[key])
  }
  for (const t of fr.Textures || []) refs.add(t)
  for (const exp of fr.Expressions || []) if (exp.File) refs.add(exp.File)
  for (const group of Object.values(fr.Motions || {})) {
    for (const m of group) if (m.File) refs.add(m.File)
  }
  return [...refs]
}
```

一个实战细节：有些被引用的文件（`cdi3` 显示信息、`pose`）在源站会 404，且贴图排在它们后面。所以单个文件下载必须**容错跳过**，否则一个可选文件 404 就把必需的贴图给阻断了。

结论：**版权不只是 footer 里一句署名，它会反过来定义你的工程结构**——proprietary 的东西走脚本下载、进 gitignore，而不是 commit。

## 二、CSP 三连坑：从白屏到能跑

本地化之后，窗口起来了，但是**一片透明、什么都没有**。这种"没报错也没画面"最难查。我做的第一件事不是去开 DevTools，而是**给自己加一个错误兜底**——任何加载/运行错误都冒一个可见气泡出来：

```html
<!-- src/renderer/index.html -->
<script>
  window.addEventListener('error', function (e) {
    var b = document.getElementById('bubble')
    if (b) {
      b.textContent = '⚠️ ' + (e.message || 'load error')
      b.classList.remove('hidden')
    }
  })
</script>
```

这一步直接把后面两个坑都照出来了，省掉了反复开控制台。

**坑 1：`unsafe-eval`。** 气泡弹出来：`Current environment does not allow unsafe-eval, please use @pixi/unsafe-eval module`。原因是 **PixiJS v6 用 `new Function()` 在运行时编译着色器**，被 CSP 挡了。本地桌面应用放开它即可。

**坑 2：`file:`。** 页面是 `loadFile` 加载的 `file://` 页，pixi-live2d-display 用 XHR 读本地 `.model3.json / .moc3 / 贴图`。而 **CSP 的 `'self'` 对 `file://` 源并不可靠匹配**，得显式放开 `file:`，否则模型文件加载被拦。

最终能跑的 CSP：

```html
<meta http-equiv="Content-Security-Policy"
  content="default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: file:;
           img-src 'self' data: blob: file:;
           connect-src 'self' data: blob: file: http://127.0.0.1:* http://localhost:*;" />
```

（`connect-src` 留着 `127.0.0.1:*` 是给桌宠订阅 bridge 的 SSE 用的。）

实践沉淀：**先让错误可见，再谈调试。** 一个 8 行的 `window.onerror → 气泡`，比盲猜或来回开 DevTools 高效得多。

## 三、别把代码绑死在某一个模型上

换了官方的圆胖小狗 Wanko 之后发现：它的动作组叫 `Idle` / `TapBody`，而之前的 Haru 叫 `Idle` / `Tap`。**每个模型动作组命名都不一样**，硬编码 `model.motion('Tap')` 换个模型就只会发呆。

所以加一层"逻辑名 → 模型实际组名"的解析：

```js
// src/renderer/renderer.js  resolveGroup（Live2D 后端内）
function resolveGroup(pref) {
  if (motionGroups.includes(pref)) return pref
  if (/tap|touch/i.test(pref)) {
    const t = motionGroups.find((g) => /tap|touch/i.test(g))
    if (t) return t
  }
  return motionGroups.find((g) => !/idle/i.test(g)) || motionGroups[0] || 'Idle'
}
```

`motionGroups` 在模型加载后从 `model.internalModel.settings` 里读出来。配置表里只写逻辑名 `Idle`/`Tap`，落到哪个模型都能对上。顺手还把气泡从"窗口顶部"改成"浮在模型头顶"——用 `model.getBounds()` 实时定位，气泡就跟着角色走了。

## 四、可插拔渲染后端：对外 Live2D，私人 GIF

最值的一笔。需求是：**对外给别人用要合规**（只能用免费可商用的 Live2D 模型），但**自己私下想用网上找的 GIF 形象**（比如水豚），那些 GIF 多半有版权、不能公开分发。

这正好是上一篇"引擎 / 资产分离"的兑现时刻——窗口、点击穿透、拖拽、agent 事件同步、动作表，**全都与"用什么渲染"无关**。于是把渲染抽成一个后端接口，两套实现：

```js
// 后端接口：{ getBounds(), playMotion(pref), setStatus(status) }
// Live2D 后端用 PixiJS 渲染模型；GIF 后端是一个按 status 切换 src 的 <img>
```

```js
// src/renderer/backends/gif.js（节选）
export function initGifBackend(cfg = {}) {
  const base = `./pets/${cfg.set || 'default'}/`
  const img = document.createElement('img')
  document.body.appendChild(img)
  // ...
  return {
    getBounds() { const r = img.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height } },
    playMotion(pref) { if (/tap|touch/i.test(pref)) show('tap', true) },
    setStatus(status) { if (status) show(status, TRANSIENT.has(status)) },
  }
}
```

选哪个后端，靠一个**被 gitignore 的本地配置**决定——有 `render.local.js` 且 `backend: 'gif'` 就走 GIF，否则默认 Live2D：

```js
// src/renderer/renderer.js  init()
let local = null
try { local = await import('./config/render.local.js') } catch (_) { /* 没有就走 Live2D */ }
if (local?.RENDER?.backend === 'gif') {
  const { initGifBackend } = await import('./backends/gif.js')
  backend = initGifBackend(local.RENDER.gif || {})
} else {
  backend = await initLive2D()
}
```

关键在于**这条边界同时是版权边界**：`render.local.js` 和私人 GIF 目录 `src/renderer/pets/*` 全部 gitignore——它们只在本机存在，永远不进仓库、不进分发包。公开的版本永远是干净的 Live2D；删掉 `render.local.js` 就回到对外形态。窗口交互、agent 同步、动作表一行没改。

## 小结

两条工程原则，这次体会很深：

第一，**让错误可见**。在透明窗口这种"出错也悄无声息"的环境里，一个把异常显示成气泡的 8 行兜底，胜过反复开控制台猜。

第二，**把"会变的"挡在接口后面**。渲染方式（Live2D / GIF）、模型选择、动作组名，全做成可替换的——于是换形象是一行命令，换渲染方式是一个 gitignore 的本地文件，而"公开合规 / 私人随意"这条产品边界，恰好和 git 的提交边界重合。架构对了，合规和自由可以同时拿到。
