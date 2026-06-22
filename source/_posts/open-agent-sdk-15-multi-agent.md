---
title: "【Open Agent SDK 源码精讲·第15讲】多 Agent：Fork 分裂、worktree 隔离与权限冒泡"
date: 2026-06-22
tags:
  - Open Agent SDK
  - Claude Code
  - 源码精讲
  - 多Agent
  - AI Agent
categories:
  - 技术深潜
series: open-agent-sdk
---

> **系列导航** → [课程目录](/courses/open-agent-sdk/) · 上一讲：[第14讲·MCP客户端](/2026/06/22/open-agent-sdk-14-mcp-client/)

---

## 引言：Agent 是怎么"生出"另一个 Agent 的

你在 Workflow 里写 `agent("分析这个文件")`，背后是什么？

Claude Code 里的多 Agent 系统有两条路径：
- **普通子 Agent（AgentTool）**：用独立的系统提示和工具池，有自己的身份
- **Fork 子 Agent**：继承父 Agent 的完整对话历史，成为"分叉"的自己

本讲拆解这两套机制，以及支撑它们的 worktree 隔离和权限冒泡。

| 文件 | 行数 | 职责 |
|------|------|------|
| `tools/AgentTool/runAgent.ts` | 974 | 子 Agent 的核心执行引擎 |
| `tools/AgentTool/forkSubagent.ts` | 210 | Fork 分裂的消息构建与防递归 |
| `tools/EnterWorktreeTool/EnterWorktreeTool.ts` | 127 | Git worktree 隔离的工具实现 |
| `coordinator/coordinatorMode.ts` | 369 | Coordinator（多 Agent 中央协调）模式 |

---

## 第一节：Agent 定义的结构

每个子 Agent 都有一个 `AgentDefinition`（在 `loadAgentsDir.ts` 中定义），关键字段：

```typescript
type BuiltInAgentDefinition = {
  agentType: string          // 身份名（如 'Explore', 'Plan', 'fork'）
  tools: string[]            // 工具白名单，'*' 表示继承父工具池
  maxTurns: number          // 最大对话轮数
  model: ModelAlias         // 模型选择，'inherit' 表示继承父 Agent
  permissionMode?: string   // 权限模式
  omitClaudeMd?: boolean    // 是否跳过 CLAUDE.md（节省 token）
  mcpServers?: (string | Record<string, ...>)[]  // Agent 专属 MCP 服务器
  source: 'built-in' | 'user' | 'plugin' | ...
}
```

**Agent 加载来源**：
1. 内置 Agent（`built-in/`目录）：Explore、Plan、GeneralPurpose、CodeReviewer 等
2. 用户自定义（`~/.claude/agents/`目录）：YAML/Markdown frontmatter 格式
3. 插件提供（admin-trusted）

---

## 第二节：runAgent() —— 子 Agent 执行引擎

### 2.1 消息历史的两种来源

```typescript
// runAgent.ts
const contextMessages: Message[] = forkContextMessages
  ? filterIncompleteToolCalls(forkContextMessages)
  : []
const initialMessages: Message[] = [...contextMessages, ...promptMessages]
```

- **普通子 Agent**：`forkContextMessages` 为空，只有 `promptMessages`（新的任务指令）
- **Fork 子 Agent**：`forkContextMessages` 是父 Agent 的历史对话，加上新的 directive

### 2.2 token 优化：精简 Explore/Plan Agent 的上下文

```typescript
// runAgent.ts — 两个重要优化
// 1. 只读 Agent 跳过 CLAUDE.md（Explore/Plan 不需要提交/PR 规则）
const shouldOmitClaudeMd = agentDefinition.omitClaudeMd && !override?.userContext
const resolvedUserContext = shouldOmitClaudeMd ? userContextNoClaudeMd : baseUserContext

// 2. 跳过 gitStatus（Explore/Plan 需要时自己跑 git status）
const resolvedSystemContext =
  agentDefinition.agentType === 'Explore' || agentDefinition.agentType === 'Plan'
    ? systemContextNoGit
    : baseSystemContext
```

这两个优化每周为 Anthropic 节省数 TB 级别的 token（Explore Agent 每天被触发数千万次）。

### 2.3 Agent 专属 MCP 服务器

```typescript
// runAgent.ts — initializeAgentMcpServers()

// 两种方式声明：
// 1. 字符串引用：共享父 Agent 已有的连接（memoized，不新建）
if (typeof spec === 'string') {
  config = getMcpConfigByName(spec)  // 父 Agent 已有的连接
}

// 2. 内联定义：Agent 独占，退出时清理
else {
  config = { ...serverConfig, scope: 'dynamic' }
  isNewlyCreated = true   // 标记为"需要清理"
}

// 重要：只清理"新建的"连接，引用型连接让父 Agent 管理生命周期
const cleanup = async () => {
  for (const client of newlyCreatedClients) {  // 不包含引用型
    await client.cleanup()
  }
}
```

---

## 第三节：权限冒泡机制

### 3.1 权限模式继承规则

```typescript
// runAgent.ts — agentGetAppState()
if (
  agentPermissionMode &&
  state.toolPermissionContext.mode !== 'bypassPermissions' &&
  state.toolPermissionContext.mode !== 'acceptEdits' &&
  !(feature('TRANSCRIPT_CLASSIFIER') && state.toolPermissionContext.mode === 'auto')
) {
  toolPermissionContext = { ...toolPermissionContext, mode: agentPermissionMode }
}
```

父 Agent 的 `bypassPermissions` / `acceptEdits` / `auto` 模式**不可被子 Agent 覆盖**——这是安全边界。

### 3.2 bubble 模式

```typescript
// forkSubagent.ts — FORK_AGENT 定义
export const FORK_AGENT = {
  permissionMode: 'bubble',  // 把权限提示"冒泡"到父 Agent 的终端
  // ...
}
```

`bubble` 模式下：
- 子 Agent 需要权限时，不自动拒绝
- 把权限提示"冒泡"到父 Agent（或最终用户的终端）
- 与普通异步 Agent（`shouldAvoidPermissionPrompts = true`）相反

### 3.3 allowedTools：防止权限泄漏

```typescript
// runAgent.ts
if (allowedTools !== undefined) {
  toolPermissionContext = {
    ...toolPermissionContext,
    alwaysAllowRules: {
      cliArg: state.toolPermissionContext.alwaysAllowRules.cliArg,  // 保留 SDK 级别规则
      session: [...allowedTools],  // 替换 session 级别规则（父 Agent 的审批不传给子 Agent）
    },
  }
}
```

父 Agent 曾经批准的工具，默认**不自动传递**给子 Agent。子 Agent 只有通过 `allowedTools` 显式传入的权限。

### 3.4 异步 Agent 的 UI 限制

```typescript
// runAgent.ts
const shouldAvoidPrompts =
  canShowPermissionPrompts !== undefined
    ? !canShowPermissionPrompts
    : agentPermissionMode === 'bubble'
      ? false      // bubble 模式：可以显示
      : isAsync    // 其他异步 Agent：禁止显示权限弹窗
if (shouldAvoidPrompts) {
  toolPermissionContext = { ...toolPermissionContext, shouldAvoidPermissionPrompts: true }
}
```

背景异步 Agent 无法显示权限弹窗（用户可能不在看终端），所以设置 `shouldAvoidPermissionPrompts: true`，遇到需要权限的工具调用直接拒绝。

---

## 第四节：Fork 子 Agent 的消息构建

### 4.1 为什么 Fork 需要特殊的消息格式

普通子 Agent 从空白历史开始。Fork 子 Agent 继承父的历史——但有个问题：

父 Agent 的最后一条 `assistant` 消息里可能有多个 `tool_use` 调用（比如同时调用了 AgentTool N 次）。每个 Fork 子 Agent 只负责其中一个 directive，但 API 要求每个 `tool_use` 都必须有对应的 `tool_result`。

解决方案：**所有 Fork 子 Agent 使用相同的占位符 `tool_result`**，只有最后的 directive 文本不同。

```typescript
// forkSubagent.ts — buildForkedMessages()

// 1. 保留父 Agent 完整的 assistant 消息（所有 tool_use blocks）
const fullAssistantMessage = { ...assistantMessage }

// 2. 为每个 tool_use 生成相同的占位符 tool_result
const toolResultBlocks = toolUseBlocks.map(block => ({
  type: 'tool_result',
  tool_use_id: block.id,
  content: [{ type: 'text', text: 'Fork started — processing in background' }],
  //                                    ↑ 所有 Fork 子 Agent 的这句话完全一样
}))

// 3. 末尾追加本 Fork 的 directive
const toolResultMessage = createUserMessage({
  content: [...toolResultBlocks, { type: 'text', text: buildChildMessage(directive) }],
})

return [fullAssistantMessage, toolResultMessage]
// 结果：[...父历史, 父最后助手消息, {占位符 results × N + 当前 directive}]
```

**为什么这样设计？** 相同的前缀 = 最大化 prompt cache 命中率。10 个 Fork 子 Agent 并发时，只有最后一个文本块不同，API 可以对共同前缀只计算一次。

### 4.2 防止递归 Fork

```typescript
// forkSubagent.ts
export function isInForkChild(messages: MessageType[]): boolean {
  return messages.some(m => {
    if (m.type !== 'user') return false
    return m.message.content.some(
      block => block.type === 'text' && block.text.includes(`<${FORK_BOILERPLATE_TAG}>`)
    )
  })
}
```

Fork 子 Agent 的 directive 里包含 `<fork-boilerplate>` 标签。如果 Fork 子 Agent 再想 Fork，就会检测到自己在一个 Fork 上下文里，拒绝执行。

### 4.3 Fork 子 Agent 的行为约束（10条规则）

`buildChildMessage()` 生成的提示包含 10 条强制规则：

1. 不要再 Fork 子 Agent（你已经是 Fork 了）
2. 不对话，不提问，不建议
3. 不发表评论或元评论
4. 直接使用工具（Bash/Read/Write...）
5. 修改文件后必须提交（commit hash 写进报告）
6. 工具调用之间不输出文本，最后统一报告
7. 严格限定在 directive 范围内
8. 报告不超过 500 词
9. 以 "Scope:" 开头（零前言）
10. 报告结构化事实，然后停止

---

## 第五节：Git Worktree 隔离

### 5.1 EnterWorktreeTool

```typescript
// EnterWorktreeTool.ts
async call(input) {
  if (getCurrentWorktreeSession()) {
    throw new Error('Already in a worktree session')  // 禁止嵌套
  }

  const mainRepoRoot = findCanonicalGitRoot(getCwd())
  // 从 worktree 内部调用时，先回到主 repo root
  if (mainRepoRoot && mainRepoRoot !== getCwd()) {
    process.chdir(mainRepoRoot)
    setCwd(mainRepoRoot)
  }

  const worktreeSession = await createWorktreeForSession(getSessionId(), slug)

  process.chdir(worktreeSession.worktreePath)
  setCwd(worktreeSession.worktreePath)
  setOriginalCwd(getCwd())
  saveWorktreeState(worktreeSession)

  // 清除依赖 CWD 的缓存（系统提示、CLAUDE.md、Plans 目录等）
  clearSystemPromptSections()
  clearMemoryFileCaches()
  getPlansDirectory.cache.clear?.()
}
```

### 5.2 Worktree 通知

当 Fork 子 Agent 被分配到 worktree 时，会注入一段特殊说明：

```typescript
// forkSubagent.ts
export function buildWorktreeNotice(parentCwd: string, worktreeCwd: string): string {
  return `You've inherited the conversation context above from a parent agent working in ${parentCwd}.
You are operating in an isolated git worktree at ${worktreeCwd} — same repository,
same relative file structure, separate working copy.
Paths in the inherited context refer to the parent's working directory; translate them to your worktree root.
Re-read files before editing if the parent may have modified them since they appear in the context.
Your changes stay in this worktree and will not affect the parent's files.`
}
```

这段话解决了一个实际问题：Fork 子 Agent 的历史对话里，所有文件路径都是父 Agent 的工作目录，但子 Agent 运行在不同的 worktree 里——路径需要翻译。

---

## 第六节：完整的 Agent 生命周期

```
AgentTool 被父 Agent 调用
  │
  ├── 解析 agentType → 加载 AgentDefinition
  │   ├── 内置 Agent (built-in/)
  │   ├── 用户自定义 (~/.claude/agents/)
  │   └── Fork (无 subagent_type，feature flag 开启时)
  │
  ├── 初始化 Agent 专属 MCP 服务器
  │   ├── 字符串引用 → 共享父连接（memoized）
  │   └── 内联定义 → 新建连接（退出时清理）
  │
  ├── 构建权限上下文
  │   ├── 继承父 mode（但 bypassPermissions/acceptEdits/auto 不可覆盖）
  │   ├── bubble 模式 → 允许显示权限弹窗
  │   └── 异步 Agent → shouldAvoidPermissionPrompts = true
  │
  ├── 构建消息历史
  │   ├── 普通子 Agent → 只有 promptMessages
  │   └── Fork → [...父历史, 父最后助手消息, {占位符 results, directive}]
  │
  ├── runAgent() → query() 回合循环
  │   └── (工具调用 → 权限检查 → 执行 → 下一轮)
  │
  ├── 退出时
  │   ├── 清理 Agent 专属 MCP 连接
  │   ├── killShellTasksForAgent(agentId)
  │   └── unregisterPerfettoAgent(agentId)
  │
  └── 返回 AssistantMessage 给父 Agent
```

---

## 小结

| 机制 | 实现 |
|------|------|
| Fork 共享历史 | `buildForkedMessages()`：占位符 results + per-child directive |
| Prompt cache 最大化 | 所有 Fork 占位符文本完全相同，只有末尾 directive 不同 |
| 防递归 Fork | `isInForkChild()` 检测 `FORK_BOILERPLATE_TAG` |
| 权限冒泡 | `permissionMode: 'bubble'` → 提示转发到父终端 |
| 权限隔离 | `allowedTools` 替换 session 规则，父 Agent 审批不泄漏 |
| worktree 隔离 | `EnterWorktreeTool` 切换 CWD + 清除缓存 |
| token 节省 | Explore/Plan 跳过 CLAUDE.md 和 gitStatus |

多 Agent 的精髓在于**边界管理**：每个 Agent 有自己的工具池、权限、历史，但又能高效共享父 Agent 的上下文和连接——Fork 的占位符设计就是这种权衡的典型例子。

---

> **下一讲预告**：第16讲将深入 API 客户端——`services/api/`：流式请求、指数退避、prompt 缓存、降级模型的完整链路。
