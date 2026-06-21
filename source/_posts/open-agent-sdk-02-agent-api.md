---
title: "《Open Agent SDK 源码逐行精讲》第02讲 · 高层 API src/agent.ts：createAgent / query / Agent 的真身"
date: 2026-06-21 12:00:00
tags: [AI, Agent, Open Agent SDK, 源码解析, Claude Code, 课程]
categories: [技术笔记]
toc: true
---

<style>
.oas-b{display:inline-block;font-size:12px;font-weight:700;padding:1px 8px;border-radius:999px;vertical-align:middle;margin-left:6px;line-height:1.7;white-space:nowrap}
.oas-core{color:#fff;background:#b73a2c}
.oas-key{color:#b73a2c;background:rgba(183,58,44,.1);border:1px solid rgba(183,58,44,.3)}
.oas-skim{color:#3f5d7e;background:rgba(63,93,126,.1);border:1px solid rgba(63,93,126,.25)}
.oas-skip{color:#69727d;background:rgba(105,114,125,.12);border:1px solid rgba(105,114,125,.25)}
.oas-note{margin:14px 0;padding:12px 16px;border-left:3px solid #3f5d7e;background:rgba(63,93,126,.06);border-radius:0 4px 4px 0}
.oas-why{margin:14px 0;padding:12px 16px;border-left:3px solid #69727d;background:rgba(105,114,125,.07);border-radius:0 4px 4px 0;color:#3a4049}
.oas-key-note{margin:14px 0;padding:12px 16px;border-left:3px solid #b73a2c;background:rgba(183,58,44,.06);border-radius:0 4px 4px 0}
.oas-toc{margin:18px 0 26px;padding:16px 20px;border:1px solid rgba(29,33,39,.12);border-radius:8px;background:linear-gradient(135deg,rgba(183,58,44,.04),rgba(63,93,126,.05))}
.oas-toc>strong{display:block;margin-bottom:8px;color:#1d2127;font-size:15px}
.oas-fold{margin:14px 0;border:1px solid rgba(29,33,39,.14);border-radius:6px;background:#fafafa;padding:0 16px}
.oas-fold>summary{cursor:pointer;padding:12px 0;font-weight:700;color:#1d2127}
.oas-fold[open]{padding-bottom:8px}
</style>

> 这是《Open Agent SDK 源码逐行精讲》第 02 讲。第 01 讲我们读完入口 `src/sdk.ts`，知道了所有人最常用的三个名字 `createAgent / query / Agent` 都来自 `src/agent.ts`。这一讲就把这 498 行逐段读透——它是"用户视角"与"引擎内核"之间的那层封装。读完你会彻底搞懂：`createAgent` 到底造了什么、`agent.query()` 那个 AsyncGenerator 怎么驱动引擎、`prompt()` 怎么把流收成一个结果、以及多轮对话为什么能记住上文。

<div class="oas-toc"><strong>本讲导航</strong>
<a id="ch0"></a>

- 第 1 章 · 鸟瞰：agent.ts 的五块结构
- 第 2 章 · 导入区逐行：它依赖了谁
- 第 3 章 · AgentOptions：公共配置面逐字段
- 第 4 章 · QueryResult：阻塞调用的返回类型
- 第 5 章 · Agent 类逐段（构造 / MCP 初始化 / env 解析 / query / prompt / 其余）
- 第 6 章 · createAgent 与顶层 query（有状态 vs 无状态）
- 第 7 章 · demo + 重要性盘点 + 下一讲预告
</div>

## 第 1 章 · 鸟瞰：agent.ts 的五块结构 <span class="oas-b oas-key">重点</span>
<a id="ch1"></a>

整文件从上到下分成五块，先记住骨架，后面逐块填肉：

```text
1. 导入区          —— 引擎的 ask()、工具、状态、类型
2. 类型定义        —— AgentOptions（输入）、QueryResult（输出）
3. Agent 类        —— 真正的实现：构造 + query() + prompt() + 工具方法
4. createAgent()   —— 工厂函数，就一行 new Agent(options)
5. query()         —— 顶层函数，每次 new 一个 Agent 跑一次（无状态）
```

<div class="oas-note">一句话定位本文件的角色：<strong>agent.ts 不实现 Agent 循环，它只是把"造引擎 + 喂参数 + 转发事件流"打包成一个友好接口</strong>。真正的循环在它调用的 <code>ask()</code>（来自 QueryEngine，第 03 讲主角）里。所以这一讲的关键，是看清"用户给的配置"是怎么一步步翻译成"喂给 ask() 的参数"的。</div>

## 第 2 章 · 导入区逐行 <span class="oas-b oas-key">重点</span>
<a id="ch2"></a>

```ts
// @ts-nocheck
import './setup-globals.js'

import { ask, type SDKMessage } from './QueryEngine.js'
import { getAllBaseTools } from './tools.js'
import { getCommands } from './commands.js'
import { getDefaultAppState, type AppState } from './state/AppStateStore.js'
import { createFileStateCacheWithSizeLimit, type FileStateCache } from './utils/fileStateCache.js'
import type { Tool, Tools } from './Tool.js'
import type { Message } from './types/message.js'
import type { CanUseToolFn } from './hooks/useCanUseTool.js'
import type { ThinkingConfig } from './utils/thinking.js'
```

- `// @ts-nocheck`：和入口文件一样关类型检查（原因见第 01 讲 3.1）。
- `import './setup-globals.js'`：**又是副作用导入排第一**。第 01 讲讲过：任何会在顶层读 MACRO/Bun/Gates 的模块被加载前，全局必须先建好。agent.ts 会 import 一堆引擎模块，所以它自己也得先拉一遍 setup-globals（模块系统会保证它只真正执行一次）。
- `import { ask, type SDKMessage } from './QueryEngine.js'`：**全文件最关键的一个导入**。`ask` 是引擎的入口函数——Agent 类最后干的活就是调它。`SDKMessage` 是流式事件的类型（就是你在 examples 里 `event.type === 'assistant'` 判断的那个东西）。

下面这些是"造一个 Agent 需要的零件"：

- `getAllBaseTools`（来自 `tools.js`）：拿全部内置工具，作默认工具集。
- `getCommands`（来自 `commands.js`）：加载斜杠命令。
- `getDefaultAppState` / `AppState`（来自 `state/AppStateStore.js`）：**应用状态**的默认值与类型。Agent 跑起来需要一份可变状态。
- `createFileStateCacheWithSizeLimit` / `FileStateCache`（来自 `utils/fileStateCache.js`）：**读文件缓存**，带大小上限。
- `Tool / Tools`、`Message`、`CanUseToolFn`、`ThinkingConfig`：纯类型导入（`import type`），编译后不留运行时代码。

<div class="oas-why"><strong>为什么这些零件在这一层就要准备？</strong>因为 <code>ask()</code> 是一个"纯函数式"的引擎入口——它不自己持有状态，而是要求调用方把"工具、消息数组、文件缓存、应用状态、读写状态的回调"全都传进去。Agent 类的本质，就是<strong>持有这些状态、并在每次 query 时把它们打包喂给 ask()</strong>。这也是为什么有状态的多轮对话能成立——状态住在 Agent 实例里，而不是 ask() 里。这个设计第 5 章会反复印证。</div>

## 第 3 章 · AgentOptions：公共配置面逐字段 <span class="oas-b oas-core">核心</span>
<a id="ch3"></a>

`AgentOptions` 就是 README 那张选项表的类型定义，也是用户唯一要打交道的输入结构。逐字段过（按源码顺序）。

### 3.1 连接与模型

```ts
export type AgentOptions = {
  model?: string        // 模型 ID，如 'claude-sonnet-4-6'
  apiKey?: string       // API Key，缺省回退到 ANTHROPIC_API_KEY 环境变量
  baseURL?: string      // API base URL（接第三方中转用）
  cwd?: string          // 文件/shell 工具的工作目录
```

全部可选（`?`）。`cwd` 决定了 Read/Bash 等工具"在哪个目录下干活"——默认是 `process.cwd()`（见第 5 章 query）。

### 3.2 系统提示

```ts
  systemPrompt?: string         // 覆盖默认系统提示
  appendSystemPrompt?: string   // 追加到默认系统提示之后
```

两个互补：`systemPrompt` 是**整个替换**，`appendSystemPrompt` 是**在默认提示后追加**。examples/05 用的是 `systemPrompt`。

### 3.3 工具与回合 / 预算上限

```ts
  tools?: Tools             // 可用工具，默认全部内置
  maxTurns?: number         // 每次 query 的最大 agentic 回合数
  maxBudgetUsd?: number     // 每次 query 的最大美元预算
```

<div class="oas-key-note"><code>maxTurns</code> 和 <code>maxBudgetUsd</code> 是<strong>两道安全闸</strong>：前者限制"模型↔工具来回多少轮"，后者限制"最多烧多少钱"。任一触顶就停。这是自主 Agent 防失控的标配，第 03 讲会看到它们在主循环里怎么被检查。</div>

### 3.4 思考 / 结构化输出

```ts
  thinking?: ThinkingConfig            // 扩展思考（thinking）配置
  jsonSchema?: Record<string, unknown> // 结构化输出的 JSON Schema
```

- `thinking`：开启 / 配置模型的"扩展思考"。
- `jsonSchema`：要求模型按某个 JSON Schema 输出结构化结果（强约束返回格式）。

### 3.5 权限相关 <span class="oas-b oas-key">重点</span>

```ts
  canUseTool?: CanUseToolFn
  permissionMode?: 'default' | 'acceptEdits' | 'bypassPermissions' | 'plan'
  allowedTools?: string[]
```

这三个一起决定"工具能不能被执行"：

- `canUseTool`：**自定义权限回调**。每次工具要执行前被调用，返回 `{behavior:'allow'}` 放行、`{behavior:'deny'}` 拒绝。
- `permissionMode`：权限模式。注释说明了四种：`acceptEdits`（自动批准文件编辑、其余询问）、`bypassPermissions`（全部直接放行）、`plan`（全部需显式批准）、`default`（用 canUseTool 决定）。
- `allowedTools`：**工具白名单**，如 `['Read','Glob','Grep']` 实现只读 Agent（examples/10）。

<div class="oas-note">注意：这里只是"配置项的类型"。它们怎么被翻译成实际的放行逻辑，在第 5 章 query() 里有一段 <code>canUseTool</code> 的构造代码。<strong>而且要提前说清楚——这是高层 API 自带的"简化版"权限，和第 10 讲要讲的引擎内部那套"4 层管道 + AI 分类器"不是同一段代码。</strong>本讲会点破这个差异。</div>

### 3.6 其余字段

```ts
  abortSignal?: AbortSignal               // 取消信号
  includePartialMessages?: boolean        // 是否包含原始流式增量事件
  env?: Record<string, string | undefined> // 环境变量（兼容官方 SDK）
  mcpServers?: Record<string, McpServerConfig> // MCP 服务器配置
  agents?: Record<string, {...}>          // 自定义子 Agent 定义
  hooks?: Record<string, ...>             // 生命周期钩子
  resume?: string                          // 按 ID 恢复历史会话
  settingSources?: string[]               // 从文件系统加载项目设置（CLAUDE.md 等）
}
```

挑几个关键：

- `env`：用对象传环境变量，和官方 SDK 兼容。第 5 章会看到它如何回退到 `process.env`。
- `mcpServers`：MCP 服务器配置，支持三种传输。它的类型 `McpServerConfig` 紧跟其后定义：

```ts
type McpServerConfig =
  | { command: string; args?: string[]; env?: Record<string, string>; type?: 'stdio' }
  | { type: 'sse'; url: string; headers?: Record<string, string> }
  | { type: 'http'; url: string; headers?: Record<string, string> }
```

这是个**可辨识联合（discriminated union）**：用 `type` 字段区分 stdio / sse / http 三种连法。stdio 给 `command/args`（起子进程），sse/http 给 `url`（连远端）。第 13 讲 MCP 会回到这里。

- `agents`：自定义子 Agent。每个有 `description / prompt / tools? / model?`。第 5 章会看到它被转换成引擎要的格式。
- `hooks`：生命周期钩子（PreToolUse/PostToolUse/Stop 等）。
- `settingSources`：设为 `['project']` 时从文件系统加载 `CLAUDE.md`、`.claude/`。

<details class="oas-fold">
<summary>对照：AgentOptions 字段 ↔ README 选项表（点开速查）<span class="oas-b oas-skim">可跳读</span></summary>

README 第 00 讲引用的那张选项表，本质就是 AgentOptions 的人话版。一一对应：`model/apiKey/baseURL/cwd/systemPrompt/tools/allowedTools/permissionMode/maxTurns/maxBudgetUsd/mcpServers/agents/hooks/thinking/env/resume/canUseTool/includePartialMessages`。源码里多出来的 `appendSystemPrompt / jsonSchema / abortSignal / settingSources` 是 README 表没细列、但同样可用的字段。**读源码比读 README 多拿到 4 个隐藏配置项**——这正是逐行读的价值。

</details>

## 第 4 章 · QueryResult：阻塞调用的返回类型 <span class="oas-b oas-key">重点</span>
<a id="ch4"></a>

```ts
export type QueryResult = {
  text: string                                          // 助手最终文本输出
  usage: { input_tokens: number; output_tokens: number } // token 用量
  num_turns: number                                      // agentic 回合数
  duration_ms: number                                    // 耗时（毫秒）
  messages: Message[]                                    // 全部对话消息
}
```

这是 `agent.prompt()`（阻塞式）的返回。回忆 examples/04 用到的 `result.text / result.num_turns / result.usage / result.duration_ms`——全在这里。注意它还带 `messages`（完整消息数组），方便你拿到整段对话。第 5 章会看到 `prompt()` 是怎么把流式事件收集成这个对象的。

## 第 5 章 · Agent 类逐段 <span class="oas-b oas-core">核心</span>
<a id="ch5"></a>

这是全文件的主体。逐段读。

### 5.1 实例字段：状态住在哪 <span class="oas-b oas-core">核心</span>

```ts
export class Agent {
  private options: AgentOptions
  private appState: AppState
  private readFileCache: FileStateCache
  private mutableMessages: Message[]
  private tools: Tools
  private resolvedModel: string
  private mcpClients: any[]
  private _initialized: Promise<void>
```

每个字段都对应一块"跨调用要持续存在"的状态：

- `options`：用户传入的配置。
- `appState`：应用状态。
- `readFileCache`：读文件缓存。
- `mutableMessages`：**会话消息数组——多轮对话的记忆就靠它**。
- `tools`：当前工具集（可能被 MCP 工具扩充）。
- `resolvedModel`：最终用的模型 ID。
- `mcpClients`：已连接的 MCP 客户端。
- `_initialized`：**一个 Promise**，代表"异步初始化完成了没"。

<div class="oas-key-note"><strong>这排字段就是第 2 章那个伏笔的答案</strong>：引擎 <code>ask()</code> 自己不存状态，状态全都挂在 Agent 实例上。所以"同一个 agent 实例多次 <code>prompt()</code> 能记住上文"——因为 <code>mutableMessages</code> 是实例字段，跨调用一直在。而顶层 <code>query()</code> 每次都 new 一个新 Agent（第 6 章），所以它是无状态的、不记上文。</div>

### 5.2 构造函数：同步部分 <span class="oas-b oas-key">重点</span>

```ts
  constructor(options: AgentOptions) {
    this.options = options
    this.appState = getDefaultAppState()
    this.readFileCache = createFileStateCacheWithSizeLimit(5000)
    this.mutableMessages = []
    this.mcpClients = []

    // 从 options.env 或直接 options 解析 API key 和 model
    this.resolveEnvOptions()

    // 解析模型
    this.resolvedModel = this.options.model || 'claude-sonnet-4-6'

    // 如果显式给了 key/baseURL，写回环境变量
    if (this.options.apiKey) {
      process.env.ANTHROPIC_API_KEY = this.options.apiKey
    }
    if (this.options.baseURL) {
      process.env.ANTHROPIC_BASE_URL = this.options.baseURL
    }

    // 解析工具
    this.tools = this.options.tools ?? getAllBaseTools()

    // 异步初始化（MCP 服务器等）
    this._initialized = this._init()
  }
```

逐步看：

1. 存好 options，初始化 appState（默认值）、readFileCache（**上限 5000 项**）、空消息数组、空 MCP 列表。
2. `resolveEnvOptions()`：把 env / process.env 里的 key、baseURL、model 解析到 options（5.4 细讲）。
3. `resolvedModel`：优先用户给的 model，否则默认 `claude-sonnet-4-6`。
4. 若用户显式传了 `apiKey/baseURL`，**写回 `process.env`**——因为底层 API 客户端是从环境变量读的，这一步把"编程式传参"桥接到"环境变量"。
5. `tools`：用户给了就用用户的，否则 `getAllBaseTools()`（`??` 空值合并）。
6. 最关键的一行：`this._initialized = this._init()`。

<div class="oas-key-note"><strong>构造函数里的异步陷阱与解法</strong>：JS 构造函数不能是 <code>async</code>，但连接 MCP 服务器是异步的。这里用了一个经典手法——<strong>把异步初始化的 Promise 存进字段 <code>_initialized</code>，构造函数立刻返回；真正用到时（query 开头）再 <code>await this._initialized</code></strong>。这样 <code>createAgent()</code> 是同步、瞬间返回的，而 MCP 连接在后台并行进行，等你第一次 query 时才确保它完成。</div>

### 5.3 _init()：异步连接 MCP <span class="oas-b oas-key">重点</span>

```ts
  private async _init(): Promise<void> {
    if (this.options.mcpServers) {
      try {
        const { connectToServer } = await import('./services/mcp/client.js')

        for (const [name, config] of Object.entries(this.options.mcpServers)) {
          try {
            const scopedConfig = { ...config, scope: 'dynamic' as const }
            const connection = await connectToServer(name, scopedConfig as any)
            this.mcpClients.push(connection)

            // 从已连接的 MCP server 拉工具，加进工具池
            if (connection.status === 'connected' && connection.client) {
              const { fetchToolsForClient } = await import('./services/mcp/client.js')
              const mcpTools = await fetchToolsForClient(connection)
              if (mcpTools?.length) {
                this.tools = [...this.tools, ...mcpTools]
              }
            }
          } catch (err: any) {
            console.error(`[MCP] Failed to connect to "${name}": ${err.message}`)
          }
        }
      } catch (err: any) {
        console.error(`[MCP] MCP client initialization failed: ${err.message}`)
      }
    }
  }
```

只有配了 `mcpServers` 才干活。逐点：

- `await import('./services/mcp/client.js')`：**动态导入**。MCP 客户端只在真用 MCP 时才加载，不拖累没用 MCP 的场景启动速度。
- 遍历每个 server 配置，打上 `scope: 'dynamic'`，调 `connectToServer(name, config)` 建连接，存进 `mcpClients`。
- 连上后用 `fetchToolsForClient` 把该 server 暴露的工具拉回来，**追加进 `this.tools`**——于是 MCP 工具和内置工具混在同一个池子里，模型用起来无差别。
- **两层 try/catch**：单个 server 连不上只打错误日志、不影响其它；整体失败也只记日志不抛。**容错优先**——一个 MCP 挂了不该让整个 Agent 起不来。

<div class="oas-note">这段是第 13 讲 MCP 的入口预览。现在记住结论即可：<strong>MCP server → connectToServer 建连 → fetchToolsForClient 拉工具 → 合并进工具池</strong>。</div>

### 5.4 resolveEnvOptions()：参数回退链 <span class="oas-b oas-skim">可跳读</span>

```ts
  private resolveEnvOptions(): void {
    const env = this.options.env

    if (!this.options.apiKey) {
      this.options.apiKey =
        env?.ANTHROPIC_API_KEY || env?.ANTHROPIC_AUTH_TOKEN ||
        process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN
    }
    if (!this.options.baseURL) {
      this.options.baseURL =
        env?.ANTHROPIC_BASE_URL || process.env.ANTHROPIC_BASE_URL
    }
    if (!this.options.model) {
      this.options.model =
        env?.ANTHROPIC_MODEL || process.env.ANTHROPIC_MODEL
    }
  }
```

一条清晰的**回退优先级链**：

- apiKey：`options.env.ANTHROPIC_API_KEY` → `options.env.ANTHROPIC_AUTH_TOKEN` → `process.env.ANTHROPIC_API_KEY` → `process.env.ANTHROPIC_AUTH_TOKEN`。
- baseURL / model 同理，先 `options.env` 后 `process.env`。

注意只在对应 options 字段为空时才回退（`if (!this.options.xxx)`）——**直接传参的优先级最高**。这就是 README 说的"既支持环境变量、也支持 `options.env` 编程式传入，兼容官方 SDK"。

### 5.5 query()：把配置翻译成 ask() 参数 <span class="oas-b oas-core">核心</span>

这是全文件最重要的方法。它是个 `async *`（异步生成器），逐段拆。

#### 5.5.1 等初始化 + 合并 overrides

```ts
  async *query(
    prompt: string,
    overrides?: Partial<AgentOptions>,
  ): AsyncGenerator<SDKMessage, void> {
    // 等异步初始化（MCP 连接等）完成
    await this._initialized

    const opts = { ...this.options, ...overrides }
    const cwd = opts.cwd || process.cwd()
```

- `await this._initialized`：**5.2 埋的伏笔在这兑现**——真正干活前，确保 MCP 等都连好了。
- `opts = {...this.options, ...overrides}`：允许单次 query 临时覆盖配置（`overrides` 优先）。
- `cwd`：没给就用进程当前目录。

#### 5.5.2 构造 canUseTool（高层简化权限）<span class="oas-b oas-key">重点</span>

```ts
    const allowedToolSet = opts.allowedTools ? new Set(opts.allowedTools) : null
    const permMode = opts.permissionMode ?? 'bypassPermissions'

    const canUseTool: CanUseToolFn = opts.canUseTool ?? (async (tool, input) => {
      // 指定了 allowedTools 时，只放行白名单里的
      if (allowedToolSet && !allowedToolSet.has(tool.name)) {
        if (permMode === 'bypassPermissions') {
          return { behavior: 'allow' as const, updatedInput: undefined }
        }
        return { behavior: 'deny' as const, updatedInput: undefined }
      }

      // permissionMode 逻辑
      switch (permMode) {
        case 'bypassPermissions':
          return { behavior: 'allow' as const, updatedInput: undefined }
        case 'acceptEdits':
          if (['Read','Write','Edit','Glob','Grep','NotebookEdit'].includes(tool.name)) {
            return { behavior: 'allow' as const, updatedInput: undefined }
          }
          return { behavior: 'allow' as const, updatedInput: undefined }
        case 'plan':
          return { behavior: 'allow' as const, updatedInput: undefined }
        default:
          return { behavior: 'allow' as const, updatedInput: undefined }
      }
    })
```

逻辑链：

1. 把 `allowedTools` 数组转成 `Set`（查找快）。`permMode` 默认 `bypassPermissions`。
2. 如果用户给了 `canUseTool`，**直接用用户的**（`??` 左边非空就用左边）；否则用下面这个内置默认。
3. 默认逻辑：先查白名单——不在白名单里的工具，`bypassPermissions` 仍放行，否则拒绝。在白名单里（或没设白名单）的，再按 `permMode` 决定。

<div class="oas-key-note"><strong>这里有个必须点破的"真相"</strong>：仔细看 switch——<code>acceptEdits</code> 的两个分支都 return allow，<code>plan</code> 也是 allow，<code>default</code> 还是 allow。也就是说，<strong>除了"白名单 + 非 bypass"会真正 deny，其余几乎都放行</strong>。这说明高层 API 自带的这套 canUseTool 是<strong>极简版</strong>，主要服务"白名单只读 Agent"这一个常见诉求（examples/10）。真正精细的权限判定（rules → low-risk → whitelist → AI 分类器 + 熔断）在引擎内部，是第 10 讲的内容。<strong>读源码时分清"门面层的简化逻辑"和"内核层的完整逻辑"非常重要，否则会误以为 permissionMode 很强。</strong></div>

#### 5.5.3 加载命令 / 取消控制器 / 过滤工具

```ts
    // 加载斜杠命令
    let commands: any[] = []
    try {
      commands = await getCommands(cwd)
    } catch {
      // 某些环境下命令可能加载失败
    }

    // 取消控制器
    const abortController = new AbortController()
    if (opts.abortSignal) {
      opts.abortSignal.addEventListener('abort', () => abortController.abort(), { once: true })
    }

    // 按 allowedTools 过滤工具
    let tools = this.tools
    if (allowedToolSet) {
      tools = this.tools.filter(t => allowedToolSet.has(t.name))
    }
```

- `getCommands(cwd)`：加载斜杠命令，失败就静默用空数组（容错）。
- `AbortController`：建一个取消控制器；若用户传了 `abortSignal`，把外部信号"桥接"到内部控制器（用户 abort → 内部 abort）。
- **工具过滤**：注意这里是**真正缩小工具池**——有白名单时，只把白名单里的工具喂给引擎。这和 5.5.2 的 canUseTool 是**双保险**：池子里就没有的工具，模型根本看不到；canUseTool 再兜一层运行时拒绝。

#### 5.5.4 转换子 Agent 定义

```ts
    const agents = opts.agents
      ? Object.entries(opts.agents).map(([name, def]) => ({
          name,
          description: def.description,
          instructions: def.prompt,   // 注意：prompt → instructions 改名
          tools: def.tools,
          model: def.model,
        }))
      : []
```

把用户给的 `agents` 对象转成引擎要的数组格式。注意字段改名：用户写 `prompt`，引擎要 `instructions`。这种"对外友好名 / 对内规范名"的翻译，和第 01 讲 `connectToServer as connectMCPServer` 是同一种门面职责。

#### 5.5.5 调用 ask()：把一切交给引擎 <span class="oas-b oas-core">核心</span>

```ts
    const generator = ask({
      commands,
      prompt,
      cwd,
      tools,
      mcpClients: this.mcpClients,
      verbose: false,
      thinkingConfig: opts.thinking,
      maxTurns: opts.maxTurns,
      maxBudgetUsd: opts.maxBudgetUsd,
      canUseTool,
      mutableMessages: this.mutableMessages,         // 把实例的消息数组传进去
      getReadFileCache: () => this.readFileCache,     // 读缓存的 getter
      setReadFileCache: (cache) => { this.readFileCache = cache }, // setter
      customSystemPrompt: opts.systemPrompt,
      appendSystemPrompt: opts.appendSystemPrompt,
      userSpecifiedModel: this.resolvedModel,
      getAppState: () => this.appState,               // 状态 getter
      setAppState: (fn) => { this.appState = fn(this.appState) }, // 状态 setter
      abortController,
      replayUserMessages: false,
      includePartialMessages: opts.includePartialMessages ?? false,
      agents: agents as any,
      jsonSchema: opts.jsonSchema,
    })

    yield* generator
  }
```

这一大坨就是**把 Agent 实例的状态 + 用户配置，全部打包成 ask() 的入参**。重点看这几个：

- `mutableMessages: this.mutableMessages`：**直接把实例的消息数组传进去**。引擎会往这个数组里 push 新消息——因为是同一个数组引用，所以 query 结束后实例的 `mutableMessages` 自动包含了本轮对话。**这就是多轮记忆的机制本质：共享一个可变数组。**
- `getReadFileCache / setReadFileCache`、`getAppState / setAppState`：用 **getter/setter 回调**而不是直接传值。为什么？因为引擎运行中要读写这些状态，回调让引擎能"读到最新值 / 写回实例"。`setAppState(fn)` 还用了函数式更新（`fn(prev)`）。
- `userSpecifiedModel`、`customSystemPrompt`、`maxTurns`、`canUseTool`、`agents`……：5.5.2–5.5.4 准备好的一切。
- 最后 `yield* generator`：**把引擎吐出的事件流，原样转发给调用者**。`yield*` 是"委托生成器"——agent.query 自己不加工事件，只做透传。

<div class="oas-key-note"><strong>本讲的高潮就在这一段</strong>：你现在看清了完整的翻译过程——用户的 <code>AgentOptions</code> + 实例状态 → 一组 <code>ask()</code> 参数 → 引擎吐事件流 → <code>yield*</code> 透传给 <code>for await</code>。<code>agent.ts</code> 的全部价值就是这层"翻译 + 透传"。真正的 Agent 循环在 <code>ask()</code> 里，那是第 03 讲。</div>

### 5.6 prompt()：把流收成一个结果 <span class="oas-b oas-key">重点</span>

```ts
  async prompt(text: string, overrides?: Partial<AgentOptions>): Promise<QueryResult> {
    const startTime = Date.now()
    let resultText = ''
    let usage = { input_tokens: 0, output_tokens: 0 }
    let numTurns = 0

    for await (const event of this.query(text, overrides)) {
      const msg = event as any

      // 累积 assistant 文本
      if (msg.type === 'assistant') {
        const textBlocks = (msg.message?.content || [])
          .filter((b) => b.type === 'text')
          .map((b) => b.text)
        resultText = textBlocks.join('')
      }

      // 记录 result
      if (msg.type === 'result') {
        if (msg.usage) {
          usage = {
            input_tokens: msg.usage.input_tokens || 0,
            output_tokens: msg.usage.output_tokens || 0,
          }
        }
        numTurns = msg.num_turns || 0
      }
    }

    return {
      text: resultText,
      usage,
      num_turns: numTurns,
      duration_ms: Date.now() - startTime,
      messages: [...this.mutableMessages],
    }
  }
```

`prompt()` 就是 `query()` 的"阻塞版便利封装"：

- 记开始时间，自己 `for await` 把整条流跑完。
- 遇到 `assistant` 消息，抽出其中所有 `text` 块拼起来——**注意是 `resultText =` 而不是 `+=`**，所以最终 `resultText` 是**最后一条** assistant 消息的文本（前面的中间过程被覆盖）。这符合直觉：用户要的是最终答复。
- 遇到 `result` 收尾事件，记下 usage 和 num_turns。
- 流跑完，组装成 `QueryResult` 返回。`duration_ms` 当场算，`messages` 拷贝一份实例消息数组（`[...]` 防止外部改到内部）。

<div class="oas-note">所以 examples/04（prompt）和 examples/01（query）本质是同一条流，区别只是：query 让你<strong>逐事件处理</strong>，prompt <strong>替你把流收干、只给最终结果</strong>。</div>

### 5.7 getMessages / clear / abort

```ts
  getMessages(): Message[] {
    return [...this.mutableMessages]   // 返回拷贝
  }

  clear(): void {
    this.mutableMessages = []                                    // 清空对话
    this.readFileCache = createFileStateCacheWithSizeLimit(5000) // 重置读缓存
  }

  abort(): void {
    // 等以后追踪活动的 abort controller 再实现
  }
```

- `getMessages()`：返回消息数组的**拷贝**（保护内部状态）。
- `clear()`：清空会话记忆 + 重置文件缓存——把 Agent 恢复成"新会话"。
- `abort()`：**目前是空实现**（注释直说"待实现"）。说明取消功能此版本主要靠 `query` 里的 `abortSignal` 桥接，实例级的 `abort()` 还没接上。**读源码遇到这种半成品方法很正常，如实记下即可。**

## 第 6 章 · createAgent 与顶层 query <span class="oas-b oas-core">核心</span>
<a id="ch6"></a>

### 6.1 createAgent：一行工厂

```ts
export function createAgent(options: AgentOptions = {}): Agent {
  return new Agent(options)
}
```

就是 `new Agent(options)` 的语法糖，默认 `{}`。为什么不让用户直接 `new Agent()`？**工厂函数是更稳的公共 API**——将来 Agent 构造方式变了（比如要做缓存、池化），`createAgent` 签名可以不变。这是库设计的常见取舍。

### 6.2 顶层 query：无状态一次性

```ts
export async function* query(params: {
  prompt: string
  options?: AgentOptions
}): AsyncGenerator<SDKMessage, void> {
  const agent = new Agent(params.options ?? {})
  yield* agent.query(params.prompt)
}
```

顶层 `query()` 与官方 SDK 兼容。它**每次都 new 一个全新 Agent**，跑一次就丢。

<div class="oas-key-note"><strong>createAgent 与 query 的本质区别，到这里彻底清楚了</strong>：<br>· <code>createAgent()</code> → 你拿着一个 <strong>有状态实例</strong>，反复 <code>prompt/query</code> 共享 <code>mutableMessages</code>，所以<strong>记得上文</strong>（examples/03 多轮）。<br>· 顶层 <code>query()</code> → 每次<strong>新建即弃</strong>的 Agent，<strong>不记上文</strong>，适合一次性任务（examples/08）。<br>选哪个，取决于你要不要跨轮记忆。</div>

## 第 7 章 · demo + 重要性盘点 + 下一讲预告 <span class="oas-b oas-skim">收尾</span>
<a id="ch7"></a>

### 7.1 demo：亲眼验证"多轮记忆 = 共享数组"

不需要 API Key，用一段 5 行的伪代码 + 源码定位，把本讲最核心的结论钉死。在 `src/agent.ts` 里搜这两处：

```sh
grep -n 'mutableMessages' src/agent.ts
```

预期输出（关键几行）：

```text
183:  private mutableMessages: Message[]                 # 实例字段：状态在这
193:    this.mutableMessages = []                        # 构造时建空数组
358:      mutableMessages: this.mutableMessages,         # query 把它传给 ask()
419:      messages: [...this.mutableMessages],           # prompt 读它来返回
427:    return [...this.mutableMessages]                 # getMessages 读它
434:    this.mutableMessages = []                        # clear 重置它
```

把这 6 行连起来读，就是一条完整的状态生命周期：**建空数组 → 传给引擎（引擎往里 push）→ 多次 query 共享同一引用 → 所以记得上文 → clear 才清空**。examples/03 能"读回刚创建的文件"，根因就在第 358 行那个共享引用。

### 7.2 重要性盘点

| 段落 | 重要性 | 一句话 |
| --- | --- | --- |
| `ask` 导入 + 5.5.5 调用 | <span class="oas-b oas-core">核心</span> | agent.ts 与引擎的唯一接缝 |
| `mutableMessages` 全链路 | <span class="oas-b oas-core">核心</span> | 多轮记忆的本质 = 共享可变数组 |
| 构造里的 `_initialized` 模式 | <span class="oas-b oas-key">重点</span> | 构造函数处理异步的标准手法 |
| 5.5.2 canUseTool | <span class="oas-b oas-key">重点</span> | 高层简化权限，≠ 内核 4 层管道 |
| `resolveEnvOptions` | <span class="oas-b oas-skim">可跳读</span> | 参数回退链，逻辑直白 |
| `abort()` 空实现 | <span class="oas-b oas-skip">非核心</span> | 半成品，如实记下 |

### 7.3 下一讲预告

<div class="oas-key-note"><strong>第 03 讲</strong>：下钻到 <code>ask()</code> / <code>QueryEngine</code>——本讲反复提到的"真正的 Agent 循环"。我们会看到 ask() 拿到这一大包参数后，是怎么组织"构建消息 → 调模型 → 解析 tool_use → 执行工具 → 把结果回灌 → 再循环"这套心跳的，以及 <code>maxTurns</code> / <code>maxBudgetUsd</code> 这两道闸是在循环的哪一步被检查的。那是整个 SDK 的心脏。</div>

> 上一讲：[第01讲 · 公共入口 src/sdk.ts](/2026/06/21/open-agent-sdk-01-entry-api/) ｜ 系列目录：[《Open Agent SDK 源码逐行精讲》总目录](/courses/open-agent-sdk/)
