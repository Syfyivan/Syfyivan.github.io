---
title: "【Open Agent SDK 源码精讲·F4讲】Commands 批量解析：112 个命令的注册机制与 3 种类型"
date: 2026-06-22
tags:
  - Open Agent SDK
  - Claude Code
  - 源码精讲
  - 全量路线
  - Commands
categories:
  - 技术深潜
series: open-agent-sdk
---

> **系列导航** → [课程目录](/courses/open-agent-sdk/) · 上一讲：[F3·终端组件批量解析](/2026/06/22/open-agent-sdk-f3-components-batch/)
>
> 本讲属于「全量逐行路线」F 系列，批量过讲。

---

## 引言：`/compact` 背后发生了什么

你输入 `/compact`，Claude Code 触发上下文压缩。

这不是魔法——整个命令系统有清晰的注册、分发、执行链路，而且只有 112 个命令目录（不是课程目录里说的 381，那是计划中的更大版本）。

---

## 第一节：Command 类型系统

### 1.1 三种命令类型

```typescript
// types/command.ts
export type Command = CommandBase & (
  | PromptCommand      // Markdown 提示词命令
  | LocalCommand       // TypeScript 函数命令
  | LocalJSXCommand    // 返回 React UI 的命令
)
```

| 类型 | 实现方式 | 典型例子 |
|------|---------|---------|
| `PromptCommand` | Markdown 文件，展开为系统提示 | 自定义 Skill、`/init` 生成的规则 |
| `LocalCommand` | TypeScript 函数，同步/异步都可 | `/compact`, `/cost`, `/model` |
| `LocalJSXCommand` | 返回 React 节点，渲染为 Ink UI | `/config`, `/mcp`, `/onboarding` |

### 1.2 CommandBase：所有命令共享的字段

```typescript
type CommandBase = {
  name: string              // 命令名（如 'compact'）
  description: string       // 显示在 /help 里的说明
  aliases?: string[]        // 别名（如 ['h'] for 'help'）
  argumentHint?: string     // 参数提示（灰色文字）
  isEnabled?: () => boolean // GrowthBook/env/平台动态开关
  isHidden?: boolean        // 是否从自动补全/help 中隐藏
  availability?: CommandAvailability[]  // 谁能用：'claude-ai' | 'console'
  immediate?: boolean       // 是否绕过队列立即执行
  isSensitive?: boolean     // 参数是否在历史里脱敏
  kind?: 'workflow'         // 是否是 workflow 命令（自动补全里有特殊徽章）
  disableModelInvocation?: boolean  // 禁止模型触发此命令
}
```

**availability vs isEnabled 的区别**：
- `availability`：静态的"谁能用"（claude.ai 订阅用户、API key 用户）
- `isEnabled()`：动态的"现在是否开启"（Feature Flag、环境变量、平台检测）

两个都过才能使用。

### 1.3 LocalCommand：最常见的命令类型

```typescript
type LocalCommand = {
  type: 'local'
  supportsNonInteractive: boolean  // 能否在非交互模式（--no-interactive）下运行
  load: () => Promise<{            // 惰性加载！触发时才 import
    call: (args: string, context: LocalJSXCommandContext) => Promise<LocalCommandResult>
  }>
}
```

`load()` 是惰性加载——在用户实际触发命令之前，不 import 实现文件。这让 CLI 启动更快，也避免了"所有命令的依赖全部加载"的问题。

```typescript
// 典型 LocalCommand 定义（commands/compact/index.ts）
const compact = {
  type: 'local',
  name: 'compact',
  description: 'Clear conversation history but keep a summary in context...',
  isEnabled: () => !isEnvTruthy(process.env.DISABLE_COMPACT),
  supportsNonInteractive: true,
  argumentHint: '<optional custom summarization instructions>',
  load: () => import('./compact.js'),  // 实现文件：compact.js
} satisfies Command
```

### 1.4 LocalCommandResult：命令的返回值

```typescript
type LocalCommandResult =
  | { type: 'text'; value: string }           // 显示一段文字
  | { type: 'compact'; compactionResult: ... } // 触发压缩
  | { type: 'skip' }                           // 不显示任何内容
```

加上 `display` 选项：`'skip'`（隐藏）/ `'system'`（系统消息）/ `'user'`（用户消息）。

### 1.5 LocalJSXCommand：带 UI 的命令

```typescript
type LocalJSXCommand = {
  type: 'local-jsx'
  load: () => Promise<{
    call: (
      onDone: LocalJSXCommandOnDone,  // 完成时的回调
      context: ToolUseContext & LocalJSXCommandContext,
      args: string,
    ) => Promise<React.ReactNode>      // 返回 Ink UI 组件
  }>
}
```

用于需要交互式 UI 的命令（如 `/config` 打开配置面板，`/mcp` 展示 MCP 管理界面）。

### 1.6 PromptCommand：Markdown 技能命令

```typescript
type PromptCommand = {
  type: 'prompt'
  getPromptForCommand(args, context): Promise<ContentBlockParam[]>
  context?: 'inline' | 'fork'  // 展开进当前对话，或在子 Agent 里运行
  agent?: string                // fork 时使用的 Agent 类型
  paths?: string[]              // 只在触碰特定文件后显示
  allowedTools?: string[]       // 限制可用工具
  effort?: EffortValue          // 推理力度
}
```

**`paths` 字段**是一个精妙设计：技能只在模型修改了匹配的文件之后才在自动补全里出现。比如一个"React 组件文档生成"技能，只在模型触碰 `.tsx` 文件后才提示。

---

## 第二节：命令注册机制

### 2.1 commands.ts：集中式注册

```typescript
// commands.ts — 集中 import 所有命令（简化版）
import compact from './commands/compact/index.js'
import config from './commands/config/index.js'
import mcp from './commands/mcp/index.js'
// ... (约 60 个静态 import)

// ant-only 命令：动态 require（避免外部构建包含这些代码）
const agentsPlatform =
  process.env.USER_TYPE === 'ant'
    ? require('./commands/agents-platform/index.js').default
    : null

// Feature flag 门控命令
const proactive =
  feature('PROACTIVE') || feature('KAIROS')
    ? require('./commands/proactive.js').default
    : null
```

**为什么 ant-only 命令用 `require()` 而不是 `import`？** Bun 打包时可以对 `feature()` 返回 `false` 的分支做死代码消除（DCE），但 `import` 语句即使在 `if (false)` 里也会被保留。`require()` 在运行时求值，可以被 bundler 在 `process.env.USER_TYPE !== 'ant'` 时移除。

### 2.2 命令目录规范（112 个命令目录的共同结构）

```
commands/
  <command-name>/
    index.ts       ← 命令声明（CommandBase + 类型 + load()）
    <command>.ts   ← 实现文件（被 load() 延迟加载）
    UI.tsx         ← 可选：Ink 渲染组件（LocalJSXCommand 用）
```

这个约定让所有命令的结构一目了然。

---

## 第三节：命令按功能分类速览

### A. 会话管理（Session）

| 命令 | 类型 | 用途 |
|------|------|-----|
| `/compact` | LocalCommand | 压缩上下文（保留摘要） |
| `/clear` | LocalCommand | 清除所有消息 |
| `/resume` | LocalCommand | 恢复之前的会话 |
| `/context` | LocalCommand | 查看当前上下文用量 |
| `/cost` | LocalJSXCommand | 显示 token 消耗和成本 |
| `/export` | LocalJSXCommand | 导出对话记录 |

### B. 模型/配置

| 命令 | 类型 | 用途 |
|------|------|-----|
| `/model` | LocalJSXCommand | 切换模型 |
| `/config` | LocalJSXCommand | 管理配置文件 |
| `/permissions` | LocalJSXCommand | 查看/编辑权限规则 |
| `/effort` | LocalCommand | 设置推理力度 |
| `/fast` | LocalCommand | 切换 Fast Mode |
| `/plan` | LocalJSXCommand | 进入计划模式 |

### C. 代码/Git 辅助

| 命令 | 类型 | 用途 |
|------|------|-----|
| `/commit` | LocalCommand | 生成并提交 commit |
| `/diff` | LocalCommand | 显示 git diff |
| `/pr_comments` | LocalCommand | 查看 PR 评论 |
| `/review` | PromptCommand | 代码审查（ultrareview） |
| `/init` | LocalCommand | 生成 CLAUDE.md |
| `/files` | LocalJSXCommand | 文件浏览 |

### D. MCP / 工具管理

| 命令 | 类型 | 用途 |
|------|------|-----|
| `/mcp` | LocalJSXCommand | MCP 服务器管理面板 |
| `/skills` | LocalJSXCommand | 技能列表 |
| `/hooks` | LocalJSXCommand | 钩子配置 |
| `/tasks` | LocalJSXCommand | 任务追踪面板 |

### E. 调试/内部

| 命令 | 类型 | 可见性 |
|------|------|-------|
| `/break-cache` | LocalCommand | 隐藏 |
| `/heapdump` | LocalCommand | 隐藏 |
| `/mock-limits` | LocalCommand | ant-only |
| `/torch` | LocalCommand | ant-only |
| `/debug-tool-call` | LocalCommand | 隐藏 |
| `/doctor` | LocalJSXCommand | 公开（诊断） |

---

## 第四节：命令执行流程

```
用户输入 /compact args
  │
  getCommand('compact')       ← 从注册表查找
  │
  meetsAvailabilityRequirement(cmd, authState)  ← availability 检查
  │
  isCommandEnabled(cmd)       ← isEnabled() 检查
  │
  cmd.load()                  ← 惰性加载实现文件
  │
  module.call(args, context)  ← 执行
  │
  onDone(result, options)     ← 结果处理
      ├── display: 'user'  → 显示为用户消息
      ├── display: 'system' → 显示为系统消息
      ├── display: 'skip'  → 不显示
      └── shouldQuery: true → 触发模型调用
```

---

## 小结

```
commands/ (112 目录)
  │
  ├── 命令类型
  │   ├── LocalCommand — TypeScript 函数，最常见
  │   ├── LocalJSXCommand — 返回 Ink React UI
  │   └── PromptCommand — Markdown 技能展开
  │
  ├── 注册机制
  │   ├── 静态 import → 核心命令（~60 个）
  │   └── 动态 require() → ant-only / feature-gated（DCE 友好）
  │
  └── 共同设计
      ├── load() 惰性加载（触发才 import）
      ├── availability = 谁能用（静态）
      ├── isEnabled() = 现在是否开（动态）
      └── paths = 只在特定文件被触碰后显示
```

Commands 层是 Agent 引擎最薄的一层——它的职责只是"把用户输入的 /xxx 翻译成对应的函数调用"，实际的业务逻辑全在实现文件里，或者转交给 Agent 引擎处理。

---

> **下一讲**：F6 将拆解生成类型（`types/generated`）与插件体系（`hooks/`、`skills/`、`plugins/`），系列至此全部完成。
