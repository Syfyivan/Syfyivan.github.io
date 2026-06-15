---
title: "Kodama：给飞书机器人做一个本机分身 —— 没有 UI 经验，怎么做一只会同步状态的 Live2D 桌宠"
date: 2026-06-15 18:00:00
tags: [Electron, Live2D, AI, Agent, 桌宠, 飞书, 前端]
categories: [技术笔记, 项目工坊]
---

这篇是一次从零做桌面应用的落地记录。起点是一个挺幼稚的愿望——我想要一只可爱的桌宠；但真正驱动我把它做出来的，是一个具体的痛点：**我有一个飞书机器人（`lark-codex-bridge`），别人在群里 @ 它、它替我跑 Codex 任务，可我坐在工位上完全看不到它在干嘛。** 于是这只桌宠的定位很快就清楚了——它不是装饰，是这个飞书机器人的**本机分身**：同一个机器人在飞书里收发消息，桌宠在我屏幕上同步它的状态、动作和气泡。

> 我没有 UI / 美术经验，这正是这篇想讲的：在没有美术能力的前提下，怎么把"可爱、动画丰富"这件事拆成"能解决"和"不用自己画"两块，以及把一个已有的机器人服务的状态实时映射到本机的工程细节。

技术栈是 **Electron + PixiJS + Live2D**（桌宠本体）加 **SSE 事件同步**（机器人 → 桌宠）。下面按踩坑顺序讲。

## 一、最大的认知错位：卡住我的不是代码，是资产

一开始我以为难点是"怎么写一个桌宠"，写了几次发现根本不是。桌宠可以拆成三层：

- **壳**：一个透明、置顶、可拖动的小窗口（纯工程，AI 能帮我写到八九成）
- **行为**：待机、被点反应、定时提醒（也是纯逻辑）
- **资产**：那个会动的可爱角色本身（这才是没美术经验时真正卡人的）

把前两层和第三层混在一起，是我之前每次想"更新一下"都很痛苦的根因。分开之后，结论很简单：**壳和行为自己写，资产用现成的，绝不自己画。** 资产这块我选了 **Live2D + 官方原创 Sample 模型**——社区有现成的萌系模型，自带眨眼、呼吸、待机、点头等动作，"动画丰富"这个需求天然被满足，我只做集成。

这里有个授权的坑要先记住：**模型授权和 Cubism SDK 授权是两件独立的事，两套都得过关。** 官方原创 Sample 授权最宽松（小团队可商用），但必须保留版权署名，且不能单独再分发模型文件。联名角色（如部分官方示例）只能非商用，要避开。

## 二、透明置顶穿透窗：Electron 上每一项都有坑

桌宠窗口要同时满足：透明背景、无边框、始终置顶（压住全屏应用）、可拖动、而且**点空白处不能挡住后面的桌面**（点击穿透）。这几条单独都好做，凑在一起全是坑。

```js
// kodama/src/main/index.js  createWindow
win = new BrowserWindow({
  transparent: true,
  frame: false,
  hasShadow: false, // 关键：否则模型周围会有一圈灰色矩形阴影
  resizable: false, // 透明窗口在某些平台设 true 会让透明失效
  skipTaskbar: true,
  alwaysOnTop: true,
})
win.setAlwaysOnTop(true, 'screen-saver') // 最高层级，压住全屏 App
win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
win.setIgnoreMouseEvents(true, { forward: true }) // 默认穿透
```

最容易栽的是**点击穿透**。`setIgnoreMouseEvents(true)` 会让整个窗口变透明可穿透，但这样连桌宠身上也点不到了。诀窍是加 `{ forward: true }`——窗口虽然穿透，但鼠标移动事件仍然转发给渲染层。于是渲染层可以一边做命中检测，一边在"鼠标移到模型身上"时临时关掉穿透：

```js
// kodama/src/renderer/renderer.js  setupInteraction
window.addEventListener('mousemove', (e) => {
  const over = overModel(e.clientX, e.clientY)
  if (over && ignoring) {
    ignoring = false
    window.pet.setIgnoreMouse(false) // 移到身上：可交互
  } else if (!over && !ignoring) {
    ignoring = true
    window.pet.setIgnoreMouse(true, { forward: true }) // 移开：恢复穿透
  }
})
```

第二个坑是**拖拽**。直觉是用 CSS 的 `-webkit-app-region: drag`，但它会吞掉所有 pointer 事件，和命中检测、点击反应全冲突，而且是矩形区域、贴不住角色轮廓。正确做法是 JS 手动拖：监听 `mousedown/mousemove`，用屏幕绝对坐标 `screenX/screenY` 算增量，通过 IPC 让主进程 `setPosition`。用 `screenX` 而不是 `clientX` 是因为窗口一移动，`clientX` 的参考系就漂了。

## 三、Live2D 渲染：一个"不能 npm install 解决"的依赖

渲染层我用 **PixiJS + pixi-live2d-display**。这里有个反直觉的点：**Live2D Cubism Core 是闭源专有的，不能作为普通 npm 依赖打包进去**，必须用 `<script>` 单独引入，而且插件靠 `window.PIXI` 找到 Pixi 实例。所以加载顺序很讲究：

```html
<!-- kodama/src/renderer/index.html -->
<script src="https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/pixi.js@6.5.10/dist/browser/pixi.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/pixi-live2d-display@0.4.0/dist/cubism4.min.js"></script>
```

模型加载本身很简单，`autoInteract:false` 是因为我要自己接管命中和穿透，不想让插件的内置交互和我的逻辑打架：

```js
// kodama/src/renderer/renderer.js  init
model = await Live2DModel.from(MODEL_URL, { autoInteract: false })
app.stage.addChild(model)
```

待机、眨眼、呼吸是插件自动播的，这正是"没美术经验也能动画丰富"的来源——动作数据都在模型里。

## 四、核心架构决策：同步点放在 bridge，不让桌宠去读飞书

到这里桌宠本体已经能动了，真正有意思的是怎么把飞书机器人的状态同步过来。我一度想过让桌宠自己去连飞书、读消息，很快否决了——那等于做了**第二个机器人**，要重新处理鉴权、去重、@ 判断，还和现有 bridge 抢着干同一件事。

正确的边界是：**桌宠是机器人的分身，不是另一个机器人。** 所有关键动作本来就都流经 bridge——收到 @、判断是否处理、起 Codex 任务、发"处理中"卡片、更新进度、发最终回复、失败/取消。所以同步点应该埋在 bridge 里，每发生一件事就往本机额外 emit 一个 pet event，桌宠只订阅、不决策。

```text
飞书消息 → lark-codex-bridge → Codex 执行 / 回复飞书
                            └→ emit pet event → GET /pet/events (SSE) → 桌宠动作 + 气泡
```

bridge 侧加了一个零依赖的事件总线（全局单流 + 环形缓冲 + 订阅 + replay 补发）：

```js
// lark-codex-bridge/src/pet-event-bus.mjs  createPetEventBus
function emit(type, payload = {}) {
  const event = { seq: ++seq, type, ts: Date.now(), ...payload }
  recent.push(event)
  if (recent.length > maxBuffer) recent.shift()
  state = { status: STATUS_BY_TYPE[type] || state.status, updatedAt: event.ts, lastEvent: event }
  for (const fn of subscribers) {
    try { fn(event) } catch { /* 订阅者出错绝不能搞挂总线 */ }
  }
}
```

然后在主文件里包一层 `emitPet()`，在六个节点埋点（收消息 / 起任务 / 进度 / 回复 / 完成 / 失败）。整个特性用一个默认关闭的开关包住，对正在跑的机器人零影响：

```js
// lark-codex-bridge/lark-codex-bridge.mjs  emitPet
function emitPet(type, payload = {}) {
  if (!petBus) return // PET_SYNC_ENABLED 关闭时直接 no-op
  const out = { ...payload }
  if (typeof out.text === 'string') {
    const cleaned = config.petSyncMode === 'full' ? out.text : redactForCard(out.text)
    out.text = clampText(cleaned, config.petSyncMaxMessageChars)
  }
  out.source = out.source || 'lark'
  petBus.emit(type, out)
}
```

### 为什么是 SSE 而不是 WebSocket

桌宠和 bridge 的关系是**单向广播**：bridge 推、桌宠收，桌宠不需要往回说话。这种场景 **SSE（Server-Sent Events）就够了**，不必上 WebSocket——SSE 是纯 HTTP，浏览器端 `EventSource` 自带断线自动重连，服务端实现也就十几行。WebSocket 的双向能力在这里是浪费。把 SSE 路由挂在 bridge 已有的 HTTP server 上，绑 `127.0.0.1`，本机访问免鉴权即可。

```js
// lark-codex-bridge/lark-codex-bridge.mjs  handlePetEventStream
response.writeHead(200, { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-cache' })
const send = (event) => {
  response.write(`event: ${event.type}\n`)
  response.write(`data: ${JSON.stringify(event)}\n\n`)
}
const unsubscribe = petBus.subscribe(send, { replay: 5 }) // 新连接补发最近 5 条，立即对齐当前状态
response.on('close', unsubscribe)
```

### 一个必须先定的产品边界：默认只同步摘要

飞书消息和 Codex 输出里可能有 PRD、代码、内部链接、日志、token 片段。桌宠气泡**绝不能无脑展示完整内容**。所以做成两档模式：**SAFE**（默认，脱敏 + 截断成摘要）和 **FULL**（本机 owner 手动开启才看完整内容）。复用了 bridge 现成的 `redactForCard()`（抹掉 bearer/token/secret）和 `clampText()`（截断）。这是把一个内部工具往"会对外冒泡"的方向改造时，最该先想清楚的一条。

## 五、一只桌宠，还是两只？—— 用来源标签收敛

做到这里冒出一个真实的纠结：桌宠既要提示**飞书机器人**的活动，又要展示我**本地终端**里跑完的 Agent Session（Claude Code / Codex），那是不是该做两只桌宠？

想清楚之后答案是**一只**。这两个需求本质是同一件事的两个**来源**：

- 本地 session：我自己在工位主动驱动的任务
- 飞书机器人：别人触发、异步跑、我可能不在

但对桌宠来说模型完全一样：`agent 发生了某事 → 状态 → 动作 + 气泡`。两只桌宠才是"乱"的根源——屏幕上两个会动的东西抢注意力、要摆两个位置、窗口/托盘/拖拽逻辑写两套，还破坏了"它是我的小伙伴"这个唯一性。

正确做法是**一只桌宠 + 给事件打来源标签**。给每个事件加一个 `source` 字段（`lark` / `local`），气泡按来源加图标前缀区分：

```text
💬 飞书：我刚替你回了那个 MR —— 主要问题是空值判断
💻 本地：测试跑完啦 🎉
```

两路事件汇进同一个渲染入口，一套逻辑。本地那一路接 Claude Code 的 hooks（`Stop` = 任务完成、`Notification` = 需要你确认），POST 到桌宠主进程的本地接收口，同样打上 `source: 'local'`，和飞书事件走完全相同的反应管线。

为了让"加新反应只改配置、不动代码"，事件到反应的映射抽成了一张动作表，模板里用 `{icon}` / `{label}` / `{text}` 占位：

```js
// kodama/src/renderer/config/pet-config.js  PET_CONFIG.events（节选）
task_done:   { status: 'done',   motion: 'TapBody', bubble: '{icon} {label}搞定啦 🎉 {text}' },
task_failed: { status: 'failed', motion: null,      bubble: '{icon} {label}任务失败了… 去看日志 😣' },
```

## 小结

两个结论值得记下来：

第一，**把"引擎"和"资产"分开**。没有美术经验不是做不了桌宠的理由——可爱和动画丰富是资产问题，用现成的 Live2D 模型解决；剩下的壳和行为是纯工程，配上把动作做成配置表，迭代时只改数据不改逻辑。

第二，**同步点放在已经掌握全部状态的那一层**。桌宠不该自己去读飞书，而应该让 bridge 在它本来就要做的每个动作旁边多 emit 一个本机事件。一只桌宠 + 来源标签，就能同时承载"飞书机器人在干嘛"和"本地 Agent 跑完了"，而不会变成两个互相打架的东西。
