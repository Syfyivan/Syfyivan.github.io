---
title: "Kodama 开发笔记 01：把飞书机器人接成桌宠通知入口"
date: 2026-06-17 16:30:00
tags: [Electron, 飞书, Codex, AI Agent, 桌宠, 工具开发]
categories: [技术笔记, 项目工坊]
---

这是一组开发笔记，记录我把一个飞书机器人和本地 Agent 工作流接到桌宠里的过程。

最后想要的形态很具体：飞书机器人连上以后，桌面上会有一个小桌宠。它不是单纯卖萌，而是像一个本地状态机：

- 飞书机器人收到消息、开始处理、发出回复时，桌宠给出提示。
- 本地 Codex、Claude Code、子 Agent 开始、等待确认、完成或失败时，桌宠也给出提示。
- 用户可以点气泡跳回对应会话；需要分享时，可以把这轮 session 生成一个内网网页链接。
- 桌宠不能影响日常操作：不能挡住鼠标，不能动不动误触，不能把气泡盖到宠物身上。

这个目标看起来像一个小 UI，但真正做下来，它更像一个“本地 Agent 控制平面”的迷你前端。它要同时理解飞书、bridge、本地 hook、Electron 窗口、透明点击、Codex/Claude session、Goofy 分享链路，以及用户在屏幕上真实使用时的感觉。

这篇是系列第一篇，先讲系统是怎么接起来的。

## 系列结构

这一组会按开发推进逐步扩展。目前主线拆成十一篇：

1. 本篇：飞书 bridge、本地 hook、桌宠事件流。
2. 第二篇：桌宠 UI 怎么从“能显示”迭代到“不打扰人”。
3. 第三篇：为什么不能打开 JSONL，以及怎么做会话跳转、悬停摘要和 session 分享。
4. 第四篇：调研开源桌宠，整理能力矩阵和路线图。
5. 第五篇：勿扰、声音和隐藏恢复通道。
6. 第六篇：主题、形象、插件化和桌宠生态路线。
7. 第七篇：打包、开机自启、菜单栏和全屏置顶。
8. 第八篇：Bridge 任务详情页，为什么它不是一张日志表。
9. 第九篇：气泡布局、屏幕边界、误触和桌宠遮挡问题。
10. 第十篇：macOS 全屏桌面为什么会压住 Electron 桌宠。
11. 第十一篇：把桌宠做成 Agent 控制面时踩过的坑。

我会尽量按真实开发顺序写，而不是只写最后架构图。因为这类工具最有价值的部分，往往不是最终代码，而是每一次“这个体验不对”的修正。

## 第 0 步：先区分 bridge 和桌宠

这次不是从零写一个飞书机器人。飞书机器人已经有一个本地 bridge，负责：

- 连接飞书事件。
- 判断消息是否应该处理。
- 调用 Codex 或其他后端。
- 把结果回复到飞书。
- 维护 session-share、task-viewer、Goofy Preview 这些能力。

桌宠的职责不同。它不是新的执行后端，也不应该直接决定“这条飞书消息要不要让 Codex 执行”。桌宠只做本地可视化和轻量交互：

```text
飞书 / 本地 Agent 事件
  -> bridge 或本地 hook
  -> 统一事件模型
  -> Kodama 桌宠
  -> 气泡 / 面板 / 动画 / 跳转 / 分享
```

这个职责边界很重要。否则桌宠很容易变成第二个 bridge：又要管鉴权，又要管飞书事件，又要管 Agent 执行。那样一来，调试时根本分不清到底是谁接管了消息。

所以我的第一条原则是：

> bridge 负责“做事”，Kodama 负责“让我知道现在发生了什么，并让我能回到现场”。

## 第 1 步：从 bridge 拉事件，不直接监听飞书

桌宠要知道飞书机器人发生了什么，最直接的方法是让它也连飞书事件。但这条路我没有选。

原因有三个：

1. 飞书事件订阅本身有单消费者约束。一个 bot app 同时跑两份事件订阅，很容易互相抢。
2. bridge 已经做了消息过滤、去重、owner 确认、bot-to-bot 安全边界；桌宠绕过它会重复踩坑。
3. 桌宠需要的是“已归一化的状态”，不是原始飞书事件。

因此 bridge 侧只需要暴露一个面向桌宠的轻量事件流。Kodama renderer 通过 SSE 连接：

```js
const DEFAULT_BRIDGE_URL = 'http://127.0.0.1:8787';

export function connectAgentSync(onEvent, { bridgeUrl, token, onStatus } = {}) {
  const base = (bridgeUrl || DEFAULT_BRIDGE_URL).replace(/\/$/, '');
  const es = new EventSource(`${base}/pet/events`);

  es.onopen = () => onStatus?.('connected');
  es.onerror = () => onStatus?.('offline');

  for (const type of Object.keys(PET_CONFIG.events)) {
    es.addEventListener(type, (ev) => {
      const payload = JSON.parse(ev.data || '{}');
      onEvent({ ...payload, type, source: payload.source || 'lark' });
    });
  }
}
```

这里用 SSE，而不是 WebSocket。因为桌宠这条链路是单向的：bridge 把事件推给桌宠。它不需要桌宠反向控制 bridge 执行任务。SSE 的好处是实现简单、浏览器原生支持、自动重连逻辑也足够。

同时保留一个 `/pet/state` 探测接口。SSE 的 `error` 有时候只是短暂重连，如果一报错就把 UI 改成“离线”，用户会看到频繁抖动。所以 renderer 在 `error` 后延迟探测 `/pet/state`，确认真的连不上再显示离线。

这个小细节是体验上的第一课：

> 状态提示不要直接等于底层连接事件。连接事件是技术事实，用户状态需要经过防抖和确认。

## 第 2 步：本地 Agent 不走 bridge，走本机 hook

飞书事件从 bridge 来，本地 Codex/Claude Code 的事件则不应该绕回 bridge。因为它们本来就在本机运行，直接 POST 到桌宠即可。

Kodama 主进程启动一个本地 HTTP receiver：

```text
http://127.0.0.1:7766
```

本地 hook 把生命周期事件 POST 到这个端口。主进程把不同来源的 payload 归一化成统一事件：

```js
{
  type: 'task_waiting',
  source: 'local',
  text: 'Agent 需要你确认',
  sessionId,
  threadId,
  transcriptPath,
  cwd,
  agent,
}
```

这一步一开始只保留了 `type/source/text`，后来发现不够。因为桌宠不只是显示一句话，还要做跳转、分享、摘要。这些能力都依赖上下文：

- `sessionId`：用于找 Codex/Claude 会话。
- `threadId`：用于打开 Codex Desktop 会话。
- `transcriptPath`：用于读取本地 JSONL，生成悬停摘要。
- `cwd`：用于让用户知道这个会话属于哪个项目。
- `agent`：用于区分是主 Agent 还是子 Agent。
- `tty`：用于 Claude Code 终端定位。

所以事件模型后面变成了“轻量但带上下文”的结构。这个演化也很典型：

> 通知系统如果只存一句文案，后面一定会卡在“无法回到现场”。通知真正有用的地方，是保留足够的定位信息。

## 第 3 步：把事件分成 lark 和 local 两条来源

一开始很容易把所有事件都叫“Agent 事件”。但实际用起来，飞书机器人消息和本地 Agent 生命周期是两类东西。

它们应该在 UI 上可区分：

```text
source: lark   -> 飞书机器人收消息、回复、处理状态
source: local  -> 本地 Codex/Claude/子 Agent 的生命周期
```

这不是为了代码洁癖，而是为了避免用户误判。

比如一个气泡写着“任务完成”，如果不知道来源，用户不知道是：

- 飞书机器人已经回复别人了；
- 本地 Codex 这一轮执行完了；
- 某个子 Agent 完成了；
- 番茄钟结束了。

所以 Kodama 里每个事件都有 `source` 和 `type`。UI 再根据这两个字段决定标题、颜色、是否进入“待交互”列表、是否常驻气泡。

简单规则如下：

```text
task_waiting       -> 待交互，橙色，常驻
task_done/agent_done -> 完成，蓝/绿，常驻
lark_message_received -> 飞书消息，绿色或飞书色
task_progress      -> 进度提示，可短暂展示
```

这就是“事件模型先行”的好处。后面 UI 怎么变，都不需要重新理解原始 payload。

## 第 4 步：常驻气泡，而不是自动消失

桌宠最早像普通 toast：来了消息，弹一下，几秒后消失。

但 Agent 场景里这不够。因为很多事件是“需要你回来处理”的，而不是“告诉你一下就完了”。

例如：

- Codex 需要权限确认。
- Claude Code 等待输入。
- 飞书机器人收到别人消息，需要 owner 决定是否继续。
- 某个子 Agent 完成了，用户要回去看结果。

如果这些气泡自动消失，桌宠就失去了意义。后来规则改成：

```js
function shouldPersistBubble(event) {
  return Boolean(event?.type);
}
```

也就是说，来自 Agent/bridge 的结构化事件默认常驻；只有普通提示，例如“正在打开会话”“已复制链接”，才短暂消失。

常驻之后又带来两个新问题：

1. 气泡多了会叠起来。
2. 用户需要手动忽略。

所以气泡卡片上加了“忽略”，多条时加“全部忽略”。这看起来只是 UI 小按钮，背后其实是产品定位变化：桌宠从一个通知动画，变成了一个小型 inbox。

## 第 5 步：事件面板是 inbox，不是配置页

用户后来问：“现在这个机器人并不能提示我都有哪些 Agent 完成了操作，需要交互呀？配置面板也找不到。”

这说明单个气泡不够。气泡适合提醒，但不适合回顾。于是加了事件面板：

- 顶部显示 bridge 连接状态。
- 三个指标：待交互、已完成、事件总数。
- tabs：设置、待交互、已完成、会话、最近。
- 每个列表项可点击跳转。

这里学到的点是：

> 对 Agent 状态来说，“提醒”和“回顾”是两个不同界面。气泡解决“我该注意什么”，面板解决“我错过了什么”。

一开始面板把所有列表上下堆在一起，用户需要一直滚。后来改成 tabs，这样切换“待交互 / 已完成 / 会话 / 最近”时不会打断思考。

## 第 6 步：桌宠和 bridge 的重启边界

开发过程中经常要回答一个问题：改完以后需要重启什么？

最后边界很清楚：

- 只改桌宠 UI、Electron main/preload、renderer：重启 Kodama。
- 改 bridge 的事件推送、session-share API、飞书处理逻辑：重启 bridge。
- 只改博客或文章：不需要重启任何运行进程。

这次大多数迭代都只动 Kodama，所以不需要重启 bridge。bridge 一直保持在线，桌宠重启后重新订阅 SSE 即可。

这也是拆边界的好处。如果桌宠直接接飞书事件，每次 UI 迭代都可能影响机器人连调；现在桌宠只是订阅者，重启风险小很多。

## 小结：第一阶段真正完成了什么

第一阶段不是“做了一个会动的宠物”，而是完成了一个稳定事件入口：

```text
bridge SSE -> lark 事件
local hook -> local Agent 事件
统一事件模型 -> bubble/panel/growth/reaction
```

关键学习有四个：

1. 不要让桌宠直接接管飞书原始事件，bridge 才是执行和安全边界。
2. 通知事件必须保留 session/cwd/transcript/agent 等定位上下文。
3. 飞书消息和本地 Agent 生命周期要分 source，否则用户会误判。
4. Agent 通知默认应该常驻，直到用户忽略。

下一篇会讲桌宠 UI 最折腾的部分：透明窗口、鼠标误触、气泡位置、宠物大小、角落适配、配置面板，以及为什么一个小小的 hover 弹窗也需要反复调。
