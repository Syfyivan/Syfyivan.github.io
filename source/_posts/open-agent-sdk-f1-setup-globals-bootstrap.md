---
title: "【Open Agent SDK 源码精讲·F1讲】启动引导：MACRO 全局、Bun 垫片与 State 单例"
date: 2026-06-22
tags:
  - Open Agent SDK
  - Claude Code
  - 源码精讲
  - 全量路线
  - AI Agent
categories:
  - 技术深潜
series: open-agent-sdk
---

> **系列导航** → [课程目录](/courses/open-agent-sdk/) · 核心路线末讲：[第16讲·API客户端](/2026/06/22/open-agent-sdk-16-api-client/)
>
> 本讲属于「全量逐行路线」的 F 系列（非核心模块批量讲解）。

---

## 引言：为什么 sdk.ts 第一行是副作用导入

```typescript
// src/sdk.ts — 第 1 行
import './setup-globals.js'  // 必须最先执行！
```

这不是随意的顺序。`setup-globals.ts` 在其他任何模块被加载之前，向 `globalThis` 注入几个关键全局变量。如果顺序错了，后续模块读到 `MACRO.VERSION` 或 `Gates.*` 时会得到 `undefined`。

本讲拆解这套"引导基础设施"：

| 文件 | 行数 | 职责 |
|------|------|------|
| `setup-globals.ts` | 39 | 注入 MACRO / Gates / Bun + 初始化 CWD |
| `bun-shim.ts` | 25 | Node.js 运行时下的 Bun 宏替代实现 |
| `global.d.ts` | 666 | TypeScript 类型声明（让 tsc 不报错） |
| `bootstrap/state.ts` | 1762 | 全会话状态单例（约 70 个字段） |

---

## 第一节：setup-globals.ts —— 3 个全局 + CWD 初始化

### 1.1 MACRO：构建时常量

```typescript
// setup-globals.ts
if (!_global.MACRO) {
  _global.MACRO = {
    VERSION: '0.1.0',
    VERSION_CHANGELOG: '',
    ISSUES_EXPLAINER: 'report the issue at ...',
    BUILD_TIME: new Date().toISOString(),
    COMMIT_HASH: 'dev',
  }
}
```

在原版 Claude Code 里，`MACRO` 是 Bun 打包器（bundler）在**编译阶段**注入的常量——版本号、构建时间、commit hash 都在 `bun build` 时写死进二进制。

在 Open Agent SDK（Node.js 环境）里，无法使用 Bun 的编译时注入，所以在运行时通过 `setup-globals.ts` 补充一个兜底实现。`if (!_global.MACRO)` 的判断是为了防止重复初始化（比如测试环境多次 import）。

### 1.2 Gates：Feature Flag 的布尔开关

```typescript
// setup-globals.ts
if (!_global.Gates) {
  _global.Gates = new Proxy({}, { get: () => false })
}
```

`Gates` 是一个 `Proxy`——读取任何属性都返回 `false`。在原版里，`Gates.xxx` 是通过 GrowthBook 或 Statsig 动态分发的 A/B 测试开关。

Node.js 版本全部默认关闭（`false`），这和 `bun-shim.ts` 的 `feature()` 一样——所有实验性功能在开源版本中都不激活。

### 1.3 Bun：最小化运行时垫片

```typescript
// setup-globals.ts
if (typeof _global.Bun === 'undefined') {
  _global.Bun = {
    env: process.env,
    version: '0.0.0',
    sleep: (ms: number) => new Promise(r => setTimeout(r, ms)),
  }
}
```

原版代码里有部分路径直接读 `Bun.env` 而不是 `process.env`，也会调用 `Bun.sleep()`。这个垫片让这些调用在 Node.js 下也能正常工作，不需要修改大量代码。

### 1.4 CWD 状态初始化

```typescript
// setup-globals.ts
import { enableConfigs } from './utils/config.js'
enableConfigs()

import { setOriginalCwd, setCwdState, setProjectRoot } from './bootstrap/state.js'
const _cwd = process.cwd()
try { setOriginalCwd(_cwd) } catch {}
try { setCwdState(_cwd) } catch {}
try { setProjectRoot(_cwd) } catch {}
```

三个 `try/catch` 都是防御性的——如果 state 模块因某种原因未初始化（测试环境隔离等），不让崩溃传播。

---

## 第二节：bun-shim.ts —— feature() 的替身

```typescript
// bun-shim.ts — 原版从 'bun:bundle' 导入
// import { feature, embed, MACRO } from 'bun:bundle'

// Node.js 版本：
export function feature(_name: string): boolean {
  return false  // 所有 feature flag 默认关闭
}

export function embed(_path: string): any {
  return null   // 原版用于把文件打包进二进制，Node.js 不支持
}

export const MACRO: any = {
  VERSION: '2.1.88',
  // ...
}
```

**设计决策**：`feature()` 永远返回 `false` 意味着 Claude Code 里所有用 `feature('xxx')` 包裹的实验性代码路径都不会执行。这大大简化了移植——不用一一测试每个 feature flag，直接关掉就是安全的默认行为。

`embed()` 在原版里把文件内容打包进二进制（比如把 `skills/` 目录的内容嵌入），Node.js 没有对等机制，返回 `null` 让调用方走降级路径。

---

## 第三节：global.d.ts —— TypeScript 的"谎言"

`global.d.ts` 不是运行时代码，纯粹是让 TypeScript 编译器闭嘴的：

```typescript
// global.d.ts
// 告诉 tsc：bun:bundle 模块存在这些导出
declare module 'bun:bundle' {
  export function feature(name: string): boolean;
  export function embed(path: string): any;
  export const MACRO: any;
}

// 告诉 tsc：这些全局变量存在
declare const MACRO: any;
declare const Gates: any;
declare const Bun: any;
```

剩余 600+ 行是类似的存根（stub）——OpenTelemetry、react-compiler-runtime、内部私有包等的类型声明。凡是代码里 `import` 了但不在 `node_modules` 里的东西，都在这里声明一个 `any` 类型，让 `tsc --noEmit` 不报错。

**代价**：类型安全性降低（这些 `any` 不会被类型检查）。**收益**：无需安装所有可选依赖才能编译，开发体验大幅改善。

---

## 第四节：bootstrap/state.ts —— 全会话状态单例

### 4.1 State 类型的规模

`bootstrap/state.ts` 定义了一个约 70 个字段的 `State` 类型，是整个 Claude Code 进程的"全局大脑"。文件开头有一行注释：

```typescript
// DO NOT ADD MORE STATE HERE - BE JUDICIOUS WITH GLOBAL STATE
```

说明这个文件已经有点"过重"了。

### 4.2 状态分类

| 类别 | 主要字段 |
|------|---------|
| **会话身份** | `sessionId`, `parentSessionId`, `originalCwd`, `projectRoot` |
| **CWD 跟踪** | `cwd`（随 EnterWorktree 变化），`originalCwd`（启动时锁定） |
| **成本/性能** | `totalCostUSD`, `totalAPIDuration`, `totalToolDuration` |
| **模型状态** | `mainLoopModelOverride`, `initialMainLoopModel`, `modelUsage` |
| **UI 模式** | `isInteractive`, `clientType`, `questionPreviewFormat` |
| **Feature** | `kairosActive`, `scheduledTasksEnabled`, `useCoworkPlugins` |
| **遥测** | `meter`, `loggerProvider`, `meterProvider`, `tracerProvider` |
| **Agent 渲染** | `agentColorMap`, `agentColorIndex`（颜色分配） |
| **Hooks** | `registeredHooks`（SDK callbacks + plugin native hooks） |
| **调试** | `lastAPIRequest`, `inMemoryErrorLog`, `slowOperations` |
| **缓存** | `systemPromptSectionCache`, `planSlugCache`, `invokedSkills` |
| **会话标志** | `hasExitedPlanMode`, `sessionBypassPermissionsMode` 等 |

### 4.3 originalCwd vs cwd vs projectRoot 三者的区别

这三个字段经常让人混淆：

```typescript
// bootstrap/state.ts
originalCwd: string         // 启动时的目录，EnterWorktree 后也不变
projectRoot: string         // 也在启动时锁定（含 --worktree 标志），用于会话历史/技能标识
cwd: string                 // 当前工作目录，随 EnterWorktree / ExitWorktree 变化
```

- `originalCwd`：在 `autoDream`、transcript 路径等地方使用，代表"这个会话从哪里开始"
- `cwd`：工具调用（Bash、文件操作）使用的实际当前目录
- `projectRoot`：用于确定会话历史存放路径，不被 worktree 操作改变

### 4.4 为什么是单例模块

Node.js 的 ES 模块系统会缓存 module。`bootstrap/state.ts` 第一次被导入时，模块顶层的变量初始化一次，之后所有模块拿到的都是同一个对象引用。

这是 Node.js 中实现进程级单例的标准模式——比 Class + getInstance() 更简单，也没有 WeakMap 或 Symbol 的开销。

---

## 小结

```
sdk.ts
  │
  └── import './setup-globals.js'   ← 必须第一个执行
          │
          ├── globalThis.MACRO = { VERSION, BUILD_TIME, ... }
          ├── globalThis.Gates = Proxy → false
          ├── globalThis.Bun = { env: process.env, sleep: setTimeout }
          ├── enableConfigs()
          └── setOriginalCwd / setCwdState / setProjectRoot

bun-shim.ts
  ├── feature(_name) → false        ← 所有实验性功能关闭
  ├── embed(_path)   → null
  └── MACRO = { VERSION: '2.1.88', ... }

global.d.ts
  └── TypeScript 存根：bun:bundle, MACRO, Gates, Bun, OpenTelemetry, ...

bootstrap/state.ts
  └── State 单例：约 70 个字段，覆盖会话全生命周期
      ├── originalCwd / cwd / projectRoot（三者有别！）
      ├── totalCostUSD / modelUsage（成本统计）
      ├── registeredHooks（SDK 钩子）
      └── systemPromptSectionCache（减少重复计算）
```

引导层的设计哲学是**最小依赖**：`bootstrap/state.ts` 是整个 import DAG 的叶节点，不能反向依赖上层模块（有 `eslint-plugin custom-rules/bootstrap-isolation` 规则强制检查）。

---

> **下一讲**：F2 将拆解 CLI 入口 `cli.tsx` 与 Ink 渲染——为什么终端 UI 本质是 React，以及它如何与 Agent 引擎解耦。
