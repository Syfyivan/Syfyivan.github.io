---
title: "Kodama 开发笔记 07：从开发态桌宠到可恢复、可自启、可打包"
date: 2026-06-17 23:45:00
tags: [Electron, 桌宠, macOS, 打包发布, AI Agent]
categories: [技术笔记, 项目工坊]
---

这篇记录 Kodama 从“开发态能跑”走向“日常可用”的一轮收尾。

用户的要求很直接：

> 我接下来就要用这个 Bridge 和飞书机器人联调。桌宠要能提示、能恢复、能调小、能打包、能开机自启。

这类需求看起来不像核心算法，但它决定了项目到底是不是能每天用。

## 开发态启动不是产品体验

一开始 Kodama 的启动方式是：

```bash
pnpm start
```

这对开发可以，但对真实使用不够：

- 关掉终端后不一定知道桌宠还在不在。
- 隐藏后如果菜单栏入口被挤掉，用户找不到。
- 开机后不会自动起来。
- 不能给别人一个安装包。

所以这轮补的是控制和发布链路，而不是模型动作。

## 恢复入口要比隐藏入口更多

桌宠天然会做透明窗口、点击穿透、跳过任务栏。这些都是为了“不打扰”，但副作用是“难找回”。

因此我给 Kodama 做了几层恢复入口：

```text
菜单栏 Kodama
  -> 显示/隐藏
  -> 事件 / 配置面板

全局快捷键
  -> Command + Option + K 显示/隐藏
  -> Command + Option + P 打开面板

本地命令
  -> pnpm run show
  -> pnpm run panel

本地 HTTP
  -> /pet/show
  -> /pet/panel
```

这里的原则是：只要用户能打开终端，桌宠就不应该失踪。

## 开机自启

开机自启用 Electron 的 login item API：

```text
app.setLoginItemSettings(...)
```

但开发态和打包态要分开处理。

打包态可以直接注册应用自己：

```text
openAtLogin: true
```

开发态则需要告诉系统用当前 Electron 二进制加 app 路径启动：

```text
path: process.execPath
args: [app.getAppPath()]
```

这样菜单栏里的“开机自启”在开发态也能测试，打包后也能继续工作。

## 打包：先能生成，再谈正式发布

这轮引入了 `electron-builder`：

```bash
pnpm run pack
pnpm run dist:mac
```

配置重点是文件边界：

```json
{
  "files": [
    "package.json",
    "src/**/*",
    "scripts/**/*",
    "!src/renderer/config/*.local.js",
    "!src/renderer/pets/**"
  ]
}
```

这保证公开包不会带上：

- `render.local.js`
- `agent.local.js`
- `accessories.local.js`
- 私人 GIF / pets 目录

本机验证结果：

```text
pnpm run pack     -> 通过，生成 dist/mac-arm64
pnpm run dist:mac -> 通过，生成 Kodama-0.1.0-arm64.dmg
```

但这还不是“正式发布完成”。当前 DMG 是未签名的，公开分发还需要：

- 应用 icon。
- Developer ID 签名。
- notarization。
- 首次启动引导。
- 自动更新策略。

这个边界必须写清楚，否则很容易把“能打出来”误当成“能给所有人稳定安装”。

## 全屏置顶的现实边界

Electron 能做的方案是：

```js
win.setVisibleOnAllWorkspaces(true, {
  visibleOnFullScreen: true,
  skipTransformProcessType: true,
})
win.setAlwaysOnTop(true, 'screen-saver', 1)
win.moveTop()
```

Kodama 还会在窗口 show/focus/blur、显示器变化和定时器里反复 reassert。

这能覆盖大多数全屏场景，但不是 macOS 上绝对的 NSPanel 语义。Electron issue 里也提到过，真正类似 Spotlight / 1Password 的 panel 行为需要 NSPanel，而 Electron 原生 API 没有完整暴露。

社区方案有 `electron-panel-window` 一类库，但它们带来原生依赖和系统版本兼容风险。

所以当前结论是：

- 默认继续用纯 Electron 能力。
- 若用户遇到特定全屏 App 压住 Kodama，再引入 NSPanel 方案。
- 不把 NSPanel 当成默认硬依赖。

这是一个务实选择：先让主路径稳定，再对特定机器补强。

## token 进账验收

飞书任务的 token 链路跨两个进程：

```text
bridge app-server
  -> turn.usage
  -> tokens
  -> emitPet(task_done, { tokens })
  -> Kodama SSE
  -> addLarkTokens
  -> kodama-lark-tokens.json
```

问题是：如果真实飞书任务跑完后 token 仍然是 0，需要判断到底是 bridge 没取到 usage，还是 Kodama 没入账。

所以我给 Kodama 加了本地验收入口：

```bash
pnpm run token:test
pnpm run tokens
```

`token:test` 会向本地 `/pet/lark-token-test` 注入一笔模拟 Feishu token 事件。这样可以先证明 Kodama 侧链路没问题。

真实飞书任务跑完后，再看：

```bash
pnpm run tokens
```

如果飞书栏自然增长，说明 `turn.usage -> tokens -> SSE -> Kodama` 稳定。如果不增长，再去 bridge 的 `raw.usage` 看字段形状。

## 细粒度 Agent 事件

之前本地 hook 只能显示“正在用工具：Bash”。这不够。

用户真正关心的是：

- 正在跑测试。
- 测试失败。
- 正在构建。
- 构建失败。
- 正在做 Git 操作。

所以这轮在 `hook-events.js` 里从 Bash 命令识别：

```text
pnpm test / npm test / go test / pytest / vitest / jest
pnpm build / tsc / vite build / go build
git status / git commit / git push
```

并把失败映射成 `task_failed`。这样气泡和系统通知能更接近真实工作流，而不是一堆无意义的“工具完成”。

## 番茄钟配置化

番茄钟原来写死：

```text
25 / 5 / 15
45 min 久坐提醒
```

这不适合真实使用。有人习惯 45 分钟专注，有人只想 10 分钟提醒一次站起来。

现在右键面板能配置：

- 专注时长。
- 短休时长。
- 长休时长。
- 长休间隔。
- 久坐提醒时长。

设置写入主进程的 `kodama-pomodoro.json`。主进程负责定时器，renderer 只负责 UI。这样不会出现两个计时器各算各的。

如果番茄钟正在跑，修改时长时不会把剩余时间突然拉长，只会把当前剩余时间 cap 到新时长。这是为了避免正在专注时改设置导致倒计时反直觉。

## 当前进度判断

到这一轮为止，Kodama 已经不只是“能显示一只宠物”：

- 可以连接飞书桥和本地 Agent。
- 可以提示待交互、完成、失败、测试、构建、Git。
- 可以跳转会话和生成分享链接。
- 可以隐藏并恢复。
- 可以勿扰。
- 可以开机自启。
- 可以配置番茄钟。
- 可以打出 macOS DMG。

但它还不是一个完整公开产品：

- 还没正式签名和公证。
- Windows/Linux 还没系统实机 QA。
- icon、安装引导、自动更新还没做。
- NSPanel 只作为特定全屏问题的后续增强。

这就是当前真实状态：日常自用已经成立，公开发布还需要最后一层工程化。
