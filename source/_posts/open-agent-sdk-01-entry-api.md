---
title: "《Open Agent SDK 源码逐行精讲》第01讲 · 公共入口 src/sdk.ts：一个 barrel 如何定义整个 SDK 的门面"
date: 2026-06-21 11:00:00
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

> 这是《Open Agent SDK 源码逐行精讲》第 01 讲。上一讲我们顺着 `package.json` 的 `exports` 追到了包入口 = `dist/sdk.js` = 源码 **`src/sdk.ts`**。这一讲就把这个不到 70 行的文件逐行读完——它是整个 SDK 对外的"门面"，读懂它就拿到了整个项目公共 API 的全景索引。

<div class="oas-toc"><strong>本讲导航</strong>
<a id="ch0"></a>

- 第 1 章 · 什么是 barrel / 门面文件，为什么从它读起
- 第 2 章 · src/sdk.ts 完整源码（先通览）
- 第 3 章 · 逐行精讲（注释 → 副作用导入 → 类型 → 引擎 → 工具 → 服务 → 高层 API）
- 第 4 章 · demo：从 import 反推模块依赖图
- 第 5 章 · 重要性盘点与下一讲预告
</div>

## 第 1 章 · 什么是 barrel / 门面文件 <span class="oas-b oas-key">重点</span>
<a id="ch1"></a>

### 1.1 barrel 的定义

**barrel 文件**（桶文件）是一个本身几乎不写逻辑、只负责"把分散在各处的导出收集到一个出口"的模块。典型形态就是一连串 `export ... from './xxx'`。

`src/sdk.ts` 就是教科书式的 barrel：它自己不实现任何功能，只是把散落在 `src/` 各角落的能力，重新 `export` 成一个统一的对外接口。

### 1.2 为什么逐行读源码要从 barrel 开始

因为 barrel = **公共 API 的目录**。读完它，你就知道：

- 这个库对外暴露了哪些东西（哪些是公共 API，哪些是内部实现）；
- 每个能力的真实实现住在哪个文件（顺着 `from './xxx'` 就能下钻）；
- 后续每一讲该去读哪个文件——它们基本都挂在这张目录上。

<div class="oas-note">换句话说，<code>src/sdk.ts</code> 是这门课的"藏宝图"。这一讲读完，你手里就有了一份"想学某能力 → 该去翻哪个文件"的对照表。</div>

## 第 2 章 · src/sdk.ts 完整源码 <span class="oas-b oas-core">核心</span>
<a id="ch2"></a>

先把整文件通览一遍（65 行），建立整体印象，第 3 章再逐段拆。

```ts
// @ts-nocheck
/**
 * Open Agent SDK - Main entry point
 *
 * This module provides the public API for the SDK, wrapping the full
 * Claude Code engine (QueryEngine, tools, services) in a clean interface
 * that runs entirely in-process without spawning subprocesses.
 *
 * Drop-in replacement for @anthropic-ai/claude-agent-sdk.
 */

// Initialize global variables (MACRO, Bun, Gates) before anything else
import './setup-globals.js'

// Re-export all public types from the official SDK type surface
export * from './entrypoints/agentSdkTypes.js'

// Re-export core engine components for advanced usage
export { QueryEngine } from './QueryEngine.js'

// Re-export tools
export {
  getAllBaseTools,
  getTools,
  assembleToolPool,
  filterToolsByDenyRules,
} from './tools.js'

// Re-export tool implementations
export { BashTool } from './tools/BashTool/BashTool.js'
export { FileReadTool } from './tools/FileReadTool/FileReadTool.js'
export { FileWriteTool } from './tools/FileWriteTool/FileWriteTool.js'
export { FileEditTool } from './tools/FileEditTool/FileEditTool.js'
export { GlobTool } from './tools/GlobTool/GlobTool.js'
export { GrepTool } from './tools/GrepTool/GrepTool.js'
export { WebFetchTool } from './tools/WebFetchTool/WebFetchTool.js'
export { WebSearchTool } from './tools/WebSearchTool/WebSearchTool.js'
export { AgentTool } from './tools/AgentTool/AgentTool.js'

// Re-export API client
export { getAnthropicClient } from './services/api/client.js'

// Re-export MCP utilities
export { connectToServer as connectMCPServer } from './services/mcp/client.js'

// Re-export context utilities
export { getSystemContext, getUserContext } from './context.js'

// Re-export message utilities
export {
  createUserMessage,
  createAssistantMessage,
  normalizeMessages,
} from './utils/messages.js'

// Re-export session/history utilities
export { getHistory, addToHistory } from './history.js'

// ============================================================================
// High-level Agent API
// ============================================================================

export { Agent, createAgent, query } from './agent.js'
export type { AgentOptions, QueryResult } from './agent.js'
```

<div class="oas-note">注意整文件<strong>只有一行 import，其余全是 export</strong>，且没有任何运行时逻辑。这印证了它的 barrel 身份。唯一的 import（<code>setup-globals.js</code>）还不是为了用它的导出，而是为了它的<strong>副作用</strong>——这点第 3 章重点讲。</div>

## 第 3 章 · 逐行精讲 <span class="oas-b oas-core">核心</span>
<a id="ch3"></a>

### 3.1 第 1 行：`// @ts-nocheck` <span class="oas-b oas-key">重点</span>

```ts
// @ts-nocheck
```

这一行告诉 TypeScript：**整个文件跳过类型检查**。

为什么入口文件要关类型检查？回顾第 00 讲 3.2 节——整个项目 `strict: false`，而且代码是从 Claude Code 本体"搬运"出来开源的。barrel 里 `export * from` 会把上游所有类型摊开，很容易触发跨文件的类型噪音；为了让构建稳定通过，这里干脆整文件 `@ts-nocheck`。

<div class="oas-why"><strong>读源码启示</strong>：看到 <code>@ts-nocheck</code> 不要慌，它不代表代码有 bug，而是工程取舍——优先保证"能编出来、能跑"。本课关注运行时行为，类型严不严谨不是重点。</div>

### 3.2 文件头注释：作者把定位写死在代码里

```ts
/**
 * Open Agent SDK - Main entry point
 *
 * This module provides the public API for the SDK, wrapping the full
 * Claude Code engine (QueryEngine, tools, services) in a clean interface
 * that runs entirely in-process without spawning subprocesses.
 *
 * Drop-in replacement for @anthropic-ai/claude-agent-sdk.
 */
```

注释把三件事讲死了，正好和第 00 讲呼应：

1. 这是 **main entry point**（主入口）；
2. 它**包装完整的 Claude Code 引擎**（QueryEngine、tools、services），提供一个干净接口；
3. **完全进程内运行，不 spawn 子进程**；并且是官方 SDK 的 **drop-in replacement**（可直接替换）。

### 3.3 唯一的 import：副作用导入 setup-globals <span class="oas-b oas-core">核心</span>

```ts
// Initialize global variables (MACRO, Bun, Gates) before anything else
import './setup-globals.js'
```

这是全文件最值得讲的一行。

注意它的写法：`import './setup-globals.js'`——**没有 `{ }`，没有 `from` 后绑定任何名字**。这种 import 叫**副作用导入（side-effect import）**：我们不要它导出的任何东西，只要"加载这个模块时它顺带执行的那些代码"。

`setup-globals.js` 做的事（看注释）：初始化 `MACRO`、`Bun`、`Gates` 等**全局变量**。

<div class="oas-key-note"><strong>为什么必须是第一行、必须在 export 之前？</strong>JS 模块的 import 是<strong>提升（hoist）且按顺序执行</strong>的。下面那些 <code>export ... from './QueryEngine.js'</code> 一旦被求值，就会去加载 QueryEngine、tools、services——而这些模块在<strong>顶层（模块初始化时）就可能读全局变量</strong>（比如读 <code>MACRO.VERSION</code>、判断是否在 Bun 运行时、读特性开关 Gates）。如果全局还没建好它们就被加载，轻则拿到 undefined，重则抛错。所以这行副作用导入必须<strong>抢在所有 re-export 之前</strong>把全局准备好。注释 "before anything else" 就是这个意思。</div>

<details class="oas-fold">
<summary>展开：MACRO / Bun / Gates 各是什么 <span class="oas-b oas-skim">可跳读</span></summary>

- **MACRO**：一组构建期 / 启动期注入的常量（版本号、构建信息、产品标识之类），代码里常以全局形式读取。
- **Bun**：运行时探测相关。项目能跑在 Node 也能跑在 Bun（回忆 package.json 的 `dev: bun run ...`），需要一个全局标记当前运行时。
- **Gates**：特性开关 / 灰度（feature gates，依赖 `@growthbook/growthbook`）。很多模块在初始化时就会问"某功能开了吗"。

这些都属于"被无数模块在顶层读取"的东西，所以必须最先建好。具体实现等到后面专门讲启动流程（bootstrap）时再逐行读，这里只需理解"为什么这行排第一"。

</details>

### 3.4 再导出公共类型：`export *` <span class="oas-b oas-key">重点</span>

```ts
// Re-export all public types from the official SDK type surface
export * from './entrypoints/agentSdkTypes.js'
```

`export *` 把 `agentSdkTypes.js` 里的**所有命名导出**原样透传出去。

`agentSdkTypes` 是"官方 SDK 类型面"的镜像——也就是说，凡是官方 `@anthropic-ai/claude-agent-sdk` 对外的类型（各种 Message、Options 等），这里都对齐导出。这正是"drop-in replacement"在类型层面的保证：你把 import 源从官方包换成这个包，类型不会断。

<div class="oas-why"><strong>为什么单独有个 <code>./types</code> 子入口？</strong>回忆 package.json：<code>exports["./types"]</code> 指向 <code>agentSdkTypes</code>。所以用户既能从主入口拿类型（因为这里 <code>export *</code> 了），也能 <code>import type {...} from '@shipany/open-agent-sdk/types'</code> 只拿类型、不拉运行时代码。两条路通往同一个文件。</div>

### 3.5 再导出引擎核心：QueryEngine <span class="oas-b oas-core">核心</span>

```ts
// Re-export core engine components for advanced usage
export { QueryEngine } from './QueryEngine.js'
```

`QueryEngine` 是**引擎核心类**，被标注为"供高级用法"。普通用户用 `createAgent()` 就够了（高层封装），但如果你要深度定制，可以直接拿 `QueryEngine`。

<div class="oas-note">这条 export 暗示了一个分层：<strong>底层 = QueryEngine（裸引擎），高层 = Agent / createAgent / query（友好封装，见 3.10）</strong>。这门课后面会先讲高层怎么用，再下钻到 QueryEngine 怎么实现主循环。</div>

### 3.6 再导出工具的"组装函数" <span class="oas-b oas-core">核心</span>

```ts
// Re-export tools
export {
  getAllBaseTools,
  getTools,
  assembleToolPool,
  filterToolsByDenyRules,
} from './tools.js'
```

这四个都来自 `src/tools.ts`，是**工具集的组装 / 过滤逻辑**，不是某个具体工具：

- `getAllBaseTools()`：拿到全部内置工具（README 的自定义工具示例里就用它来 `[...getAllBaseTools(), myTool]`）。
- `getTools()`：按配置拿工具集。
- `assembleToolPool()`：把内置工具 + 自定义工具 + MCP 工具等**组装成最终工具池**。
- `filterToolsByDenyRules()`：按"拒绝规则"过滤工具——和权限系统相关。

<div class="oas-key-note"><strong>记住这条线索</strong>：Agent 能用哪些工具，不是写死的，而是由这几个函数在运行时"组装 + 过滤"出来的。等讲到工具系统和权限时，<code>assembleToolPool</code> 和 <code>filterToolsByDenyRules</code> 会是主角。</div>

### 3.7 再导出 9 个具体工具实现 <span class="oas-b oas-key">重点</span>

```ts
// Re-export tool implementations
export { BashTool } from './tools/BashTool/BashTool.js'
export { FileReadTool } from './tools/FileReadTool/FileReadTool.js'
export { FileWriteTool } from './tools/FileWriteTool/FileWriteTool.js'
export { FileEditTool } from './tools/FileEditTool/FileEditTool.js'
export { GlobTool } from './tools/GlobTool/GlobTool.js'
export { GrepTool } from './tools/GrepTool/GrepTool.js'
export { WebFetchTool } from './tools/WebFetchTool/WebFetchTool.js'
export { WebSearchTool } from './tools/WebSearchTool/WebSearchTool.js'
export { AgentTool } from './tools/AgentTool/AgentTool.js'
```

这里单独导出了 9 个**最常被直接引用**的工具实现。注意每个工具都住在自己的目录 `tools/XxxTool/XxxTool.js`——这是后续"工具系列"讲逐个下钻的目标地址：

| 导出 | 文件位置 | 后续对应的讲（核心路线） |
| --- | --- | --- |
| `FileReadTool` / `FileWriteTool` / `FileEditTool` | `tools/File*Tool/` | 文件工具讲 |
| `GlobTool` / `GrepTool` | `tools/GlobTool/` `tools/GrepTool/` | 搜索工具讲 |
| `BashTool` | `tools/BashTool/` | Bash 与命令安全讲 |
| `WebFetchTool` / `WebSearchTool` | `tools/Web*Tool/` | 联网工具讲 |
| `AgentTool` | `tools/AgentTool/` | 多 Agent / 子 Agent 讲 |

<div class="oas-why"><strong>为什么只导出这 9 个，而 README 说有 26 个工具？</strong>因为 barrel 只挑"用户最可能直接 import 来组合 / 继承的"工具单独透出；其余工具（TodoWrite、ToolSearch、Task 系列、MCP 系列等）通过 <code>getAllBaseTools()</code> 统一拿，不必每个都在入口单列。这是"常用的给捷径，全部的给集合函数"的设计。</div>

### 3.8 再导出 API 客户端与 MCP 连接 <span class="oas-b oas-key">重点</span>

```ts
// Re-export API client
export { getAnthropicClient } from './services/api/client.js'

// Re-export MCP utilities
export { connectToServer as connectMCPServer } from './services/mcp/client.js'
```

- `getAnthropicClient`：拿到底层 Anthropic API 客户端（封装了流式、重试、缓存等，后面"API 客户端"讲会逐行读 `services/api/`）。
- `connectToServer as connectMCPServer`：**注意这里用了 `as` 重命名**——内部叫 `connectToServer`，对外改名成更自解释的 `connectMCPServer`。这是 barrel 的一个常见职责：**给对外 API 起更好的名字**，而不暴露内部命名。

### 3.9 再导出上下文 / 消息 / 历史工具 <span class="oas-b oas-key">重点</span>

```ts
// Re-export context utilities
export { getSystemContext, getUserContext } from './context.js'

// Re-export message utilities
export {
  createUserMessage,
  createAssistantMessage,
  normalizeMessages,
} from './utils/messages.js'

// Re-export session/history utilities
export { getHistory, addToHistory } from './history.js'
```

三组"管对话数据"的工具：

- `getSystemContext / getUserContext`（来自 `context.js`）：构建喂给模型的**系统上下文 / 用户上下文**。"系统提示构建"那一讲会从这里进去。
- `createUserMessage / createAssistantMessage / normalizeMessages`（来自 `utils/messages.js`）：**造消息 / 规整消息**。回忆第 00 讲——`utils/messages.ts` 有 5500 行，是主循环反复依赖的地基。
- `getHistory / addToHistory`（来自 `history.js`）：会话历史的读写。

<div class="oas-note">这三组合起来回答了一个问题："喂给模型的那串消息是怎么来的、怎么存的"。context 负责系统侧的上下文，messages 负责单条消息的构造与规范化，history 负责跨轮累积。多轮对话（examples/03）能记住上文，底层就靠它们。</div>

### 3.10 高层 Agent API：整个 SDK 最常用的三个名字 <span class="oas-b oas-core">核心</span>

```ts
// ============================================================================
// High-level Agent API
// ============================================================================

export { Agent, createAgent, query } from './agent.js'
export type { AgentOptions, QueryResult } from './agent.js'
```

压轴的是高层 API，全部来自 `src/agent.js`：

- `query`：顶层函数式入口，**与官方 SDK 完全兼容**（examples/08 用它）。`for await (const m of query({prompt, options}))`。
- `createAgent`：造一个**可复用、带会话状态**的 Agent（examples/01–07、09、10 用它）。
- `Agent`：上面 `createAgent` 返回的类本身，需要时可直接用。
- `export type { AgentOptions, QueryResult }`：**注意 `export type`**——只导出类型，编译后不产生任何运行时代码（配合 tsconfig 的 `isolatedModules`）。`AgentOptions` 就是第 00 讲 README 选项表里那些字段的类型，`QueryResult` 是 `prompt()` 阻塞调用的返回类型（含 `text / usage / num_turns / duration_ms`）。

<div class="oas-key-note"><strong>全局结论</strong>：99% 的用户只会用到这一段的 <code>createAgent</code> / <code>query</code>。前面 3.5–3.9 导出的 QueryEngine、各工具、各 utils，是给"想拆开引擎深度定制"的人准备的。<strong>这正好定义了这门课的主线——从 <code>agent.js</code>（高层）一路下钻到 <code>QueryEngine</code> / 工具 / 权限（底层）。所以第 02 讲就读 <code>src/agent.ts</code>。</strong></div>

## 第 4 章 · demo：从 import 反推模块依赖图 <span class="oas-b oas-skim">动手</span>
<a id="ch4"></a>

光读不练记不牢。这个 demo 不需要 API Key，只用静态分析，把 sdk.ts"引出去"的模块一层列出来，亲眼确认这张藏宝图。

### 4.1 列出 sdk.ts 直接依赖的模块

```sh
cd open-agent-sdk
grep -oE "from '\./[^']+'" src/sdk.ts | sort -u
```

预期输出：

```text
from './QueryEngine.js'
from './agent.js'
from './context.js'
from './entrypoints/agentSdkTypes.js'
from './history.js'
from './services/api/client.js'
from './services/mcp/client.js'
from './tools.js'
from './tools/AgentTool/AgentTool.js'
from './tools/BashTool/BashTool.js'
from './tools/FileEditTool/FileEditTool.js'
from './tools/FileReadTool/FileReadTool.js'
from './tools/FileWriteTool/FileWriteTool.js'
from './tools/GlobTool/GlobTool.js'
from './tools/GrepTool/GrepTool.js'
from './tools/WebFetchTool/WebFetchTool.js'
from './tools/WebSearchTool/WebSearchTool.js'
```

这 16 个相对路径，就是整个公共 API 的"一级下钻入口"。**这门课后面的每一讲，基本都是在挑其中一个继续往下挖。**

### 4.2 把它们映射成"想学什么 → 读哪个文件"对照表

| 你想搞懂 | 顺着 sdk.ts 的这条 export 进去 |
| --- | --- |
| 怎么用 Agent（最常用） | `agent.js` → `createAgent` / `query` |
| 主循环怎么转 | `QueryEngine.js` |
| 喂模型的提示怎么来 | `context.js` |
| 消息怎么构造 / 存 | `utils/messages.js`、`history.js` |
| 某个工具怎么实现 | `tools/XxxTool/XxxTool.js` |
| 工具池怎么组装 / 过滤 | `tools.js` |
| API 怎么调（流式 / 重试） | `services/api/client.js` |
| MCP 怎么接 | `services/mcp/client.js` |

<div class="oas-note">把这张表存下来。它就是用 barrel 给整门课画出的"逐行阅读路线总索引"。</div>

## 第 5 章 · 重要性盘点与下一讲预告 <span class="oas-b oas-skim">收尾</span>
<a id="ch5"></a>

本讲虽然只读了 65 行，但收获是"全局观"：

1. **barrel = 公共 API 目录**。`src/sdk.ts` 不写逻辑，只把分散能力收成统一门面。
2. **副作用导入 `import './setup-globals.js'` 必须排第一**——因为后续 re-export 触发的模块在顶层就要读 MACRO/Bun/Gates 全局。
3. **分层清晰**：高层 `Agent/createAgent/query`（给所有人）↔ 底层 `QueryEngine`/工具/utils（给定制者）。
4. **命名是门面的职责**：`connectToServer as connectMCPServer` 展示了 barrel 会给对外 API 起更好的名字。
5. 我们得到了一张 **import 依赖图 / 阅读路线索引**，后续每讲都挂在它上面。

<div class="oas-key-note"><strong>下一讲（第 02 讲）</strong>：逐行精读 <code>src/agent.ts</code>——也就是 <code>createAgent</code> / <code>query</code> / <code>Agent</code> 的真身。我们会看到：<code>createAgent</code> 到底造了什么、<code>agent.query()</code> 返回的那个 AsyncGenerator 是怎么把用户 prompt 变成对 QueryEngine 的驱动、以及 <code>prompt()</code> 阻塞接口如何在内部"把流收成一个 QueryResult"。这是从"会用"迈向"懂主循环"的第一级台阶。</div>

> 上一讲：[第00讲 · 导论与构建运行链路](/2026/06/21/open-agent-sdk-00-overview/) ｜ 系列目录：[《Open Agent SDK 源码逐行精讲》总目录](/courses/open-agent-sdk/)
