---
title: "Kodama 开发笔记 05：隐藏不能变失踪，桌宠需要勿扰和恢复通道"
date: 2026-06-17 23:10:00
tags: [Electron, 桌宠, 交互设计, AI Agent, 产品细节]
categories: [技术笔记, 项目工坊]
---

这一篇来自一个很具体的使用问题：

> 我把桌宠隐藏了，但是不知道怎么打开它。

这句话一下子暴露了一个设计错误：我把“隐藏桌宠”当成一个简单状态，却没有把“如何恢复”当成同等重要的功能。

桌宠和普通窗口不一样。普通 App 隐藏后，还有 Dock、任务栏、窗口菜单、应用切换器可以找回来。桌宠为了不打扰用户，往往会做成透明窗口、跳过任务栏、点击穿透、菜单栏小入口。这样一来，一旦隐藏入口也不明显，用户就会真的找不到它。

所以这轮改动的目标不是“再加一个按钮”，而是补齐桌宠的控制面。

## 问题 1：菜单栏入口并不可靠

最开始我给 Kodama 做的是菜单栏入口。macOS 右上角会显示一个树形标题，点它可以打开菜单。

但真实截图里，用户根本看不到它。

原因可能有很多：

- 菜单栏图标太多，被系统挤掉。
- 全屏 App 自动隐藏菜单栏。
- emoji 标题在某些状态下不够明显。
- 用户不知道这个图标和桌宠有关。
- 桌宠隐藏后，右键桌宠本身当然也不能用了。

这意味着“菜单栏里有入口”不等于“用户能找到入口”。

于是我先把菜单栏标题从单独 emoji 改成 `Kodama` 文本。这样它更可发现。但这还不够，因为菜单栏本身仍可能被隐藏。

## 问题 2：隐藏功能必须有至少三条恢复路径

我给 Kodama 定了一个规则：

> 任何隐藏功能，都必须有菜单、快捷键、命令行/接口三条恢复路径。

最终实现了四条：

1. 菜单栏 Kodama：显示/隐藏。
2. `⌘⌥K`：全局快捷键显示/隐藏。
3. `pnpm run show`：命令行恢复。
4. `http://127.0.0.1:7766/pet/show`：本地控制接口恢复。

这几个入口覆盖不同场景：

- 用户在图形界面里：点菜单。
- 菜单栏找不到：按快捷键。
- 快捷键忘了：进项目目录运行命令。
- 桌宠没启动：`pnpm run show` 会先启动再显示。
- 自动化脚本需要控制：调用本地 HTTP 接口。

这比“再加一个关闭按钮”重要得多。

## 本地控制接口

Kodama 原来已经有一个本地 hook 端口：`127.0.0.1:7766`。Claude Code / Codex 的 hook 会 POST 到这里，桌宠把 payload 转成事件。

这次我把同一个端口扩展成轻量控制面：

```text
GET/POST /pet/show
GET/POST /pet/hide
GET/POST /pet/toggle
GET/POST /pet/panel
GET      /healthz
```

它仍然只绑本机回环地址，不暴露到网络。这样设计有几个好处：

- 不需要新增服务。
- 不需要依赖 Electron UI 是否可见。
- 可以被脚本调用。
- 可以复用现有健康检查。

接口返回当前状态：

```json
{
  "ok": true,
  "action": "show",
  "petHidden": false,
  "windowReady": true
}
```

## 命令行恢复脚本

只提供 curl 还不够。用户不会记 `/pet/show`。

于是我加了 `scripts/kodama-control.mjs`，并挂到 package scripts：

```json
{
  "show": "node scripts/kodama-control.mjs show",
  "hide": "node scripts/kodama-control.mjs hide",
  "toggle": "node scripts/kodama-control.mjs toggle",
  "panel": "node scripts/kodama-control.mjs panel",
  "healthz": "node scripts/kodama-control.mjs healthz"
}
```

现在如果桌宠被隐藏，可以直接：

```bash
pnpm run show
```

如果桌宠没有启动，脚本会调用 `start-detached.mjs` 先拉起 Electron，再调用 `/pet/show`。

这个细节很关键：恢复命令不应该要求用户先判断“进程还在不在”。用户只想要桌宠回来。

## 隐藏时要主动告诉用户怎么恢复

我还加了隐藏后的系统通知：

```text
Kodama 已隐藏
按 ⌘⌥K 恢复，或在 kodama 目录运行 pnpm run show。
```

这个通知并不是为了炫技，而是降低记忆成本。

用户第一次点隐藏时，应该立刻知道怎么找回来。如果等用户真的找不到时再去翻 README，这个功能已经失败了。

## 勿扰模式不是隐藏

调研 Clawd on Desk 时，我注意到它有 Do Not Disturb。这个能力和“隐藏桌宠”不一样：

- 隐藏：窗口不显示。
- 勿扰：窗口可以在，但事件不打断用户。

之前 Kodama 只有隐藏，没有真正的勿扰。这样会导致用户为了避免气泡打扰，只能把桌宠隐藏掉，然后又找不到。

所以我加了勿扰模式：

- 事件仍进入事件面板。
- 事件仍然喂养和记录。
- 不弹气泡。
- 不播放声音。
- 不发系统通知。

这个策略比直接丢弃事件安全。因为勿扰不是“不要记录”，而是“先不要打断我”。

## 声音和系统通知也要独立控制

桌宠提醒有三层：

1. 桌宠动作。
2. 桌宠气泡。
3. 系统通知和声音。

这三层不应该绑死。

有些时候用户想看桌宠动作，但不想听声音。有些时候用户只想保留系统通知，不想桌宠一直冒泡。有些时候用户开会，需要全关。

这次先做了两个开关：

- 声音。
- 系统通知。

声音目前是 Web Audio 合成的短提示音，不引入素材和依赖。后续主题包可以带自己的音效资源。

## 为什么勿扰仍然记录事件

这是我刻意保留的行为。

Agent 事件和普通 UI 通知不一样。普通通知错过了可能没关系，但 Agent 的待确认、失败、完成、会话链接都可能需要回溯。

因此勿扰时只抑制“打扰动作”，不抑制“信息入库”：

```text
事件进入
  -> recordAgentEvent
  -> feedGrowth / token accounting
  -> 如果勿扰：停止可见反应
  -> 如果非勿扰：动作 + 气泡 + 通知 + 声音
```

这也让事件面板变得更重要。用户退出勿扰后，可以打开面板补看刚刚发生了什么。

## 遇到的一个工程细节

勿扰开关在 renderer 里，托盘菜单在 main process 里。

如果只在 renderer 里保存设置，托盘就不知道当前是“进入勿扰”还是“退出勿扰”。所以我加了一个轻量 IPC：

```text
renderer -> main: pet:ui-menu-state
main -> renderer: pet:set-dnd-mode
```

renderer 每次应用设置时，把 `dndMode / soundEnabled / notificationsEnabled` 同步给 main。main 刷新菜单。用户在托盘点“进入勿扰模式”时，main 再发事件给 renderer 更新设置。

这个设计没有把 UI 设置持久化搬到 main process，避免扩大改动面；但托盘可以保持正确状态。

## 验证方式

这轮我做了几类验证：

```bash
pnpm run check
pnpm test
git diff --check
pnpm run hide
pnpm run healthz
pnpm run show
pnpm run healthz
```

验证点包括：

- 新增脚本有语法检查。
- 单测没有被 reaction 改动破坏。
- 隐藏后 `petHidden:true`。
- show 后 `petHidden:false`。
- bridge 的 `/pet/state` 仍有 subscriber，没有因为重启桌宠断掉。

## 这一轮的结论

桌宠不是只有“显示一个可爱角色”。

真正难的是控制权：

- 用户想让它出现时，它必须出现。
- 用户想让它安静时，它必须安静。
- 用户隐藏它以后，它不能失踪。
- 重要事件不能因为勿扰或隐藏而完全丢失。

这轮改动之后，Kodama 更接近一个可长期运行的桌面工具，而不只是一个会动的窗口。

后续还要继续补：

- 定时勿扰。
- 会议/屏幕共享时自动勿扰。
- 迷你停靠模式。
- 更完整的主题包和音效包。
- Agent 权限 approve/deny 的安全适配。

但至少现在，“隐藏桌宠”不再是一个危险按钮了。
