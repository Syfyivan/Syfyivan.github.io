---
title: "《Open Agent SDK 源码逐行精讲》第05讲 · 工具协议与工具池：Tool 接口 + tools.ts 组装"
date: 2026-06-21 15:00:00
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

> 这是《Open Agent SDK 源码逐行精讲》第 05 讲。前四讲我们把"循环怎么转"讲透了，其中第 04 讲反复出现 `tools`、`runTools`、`tool_use`。这一讲就回答"**工具到底是什么**"：一个工具要实现哪些方法（`src/Tool.ts` 的 `Tool` 类型），以及这些工具是怎么被组装、过滤成一个"工具池"喂给模型的（`src/tools.ts`）。读完它，你就能照着接口写自己的工具，也为后面逐个拆 Read/Bash/Grep 打好地基。

<div class="oas-toc"><strong>本讲导航</strong>
<a id="ch0"></a>

- 第 1 章 · 工具在整条链路里的位置
- 第 2 章 · Tool 接口：一个工具必须 / 可以实现什么
- 第 3 章 · tools.ts：工具池的组装四步
- 第 4 章 · demo：照接口写一个最小工具（呼应 examples/07）
- 第 5 章 · 重要性盘点 + 下一讲预告
</div>

## 第 1 章 · 工具在整条链路里的位置 <span class="oas-b oas-key">重点</span>
<a id="ch1"></a>

回忆前几讲，工具在两个地方出现：

```text
[02] agent 把 tools 传给 ask()           —— 工具池从哪来
[04] callModel({ tools })                —— 把工具"声明"给模型，模型据此决定调谁
[04] runTools(toolUseBlocks, canUseTool) —— 模型选了工具后，真正执行
```

所以一个工具对象要同时满足三种消费者：

1. **模型**需要它的"声明"——名字、描述、输入 schema（才知道有这个工具、怎么填参数）。
2. **执行器**需要它的 `call()`——真正干活的逻辑。
3. **权限 / UI / 调度**需要它的元信息——是否只读、是否可并发、给用户怎么显示。

`Tool` 接口就是把这三类需求合在一个对象里。

## 第 2 章 · Tool 接口逐成员 <span class="oas-b oas-core">核心</span>
<a id="ch2"></a>

`Tool` 类型定义在 `src/Tool.ts`（362 行起），是个带泛型的对象类型：

```ts
export type Tool<
  Input extends AnyObject = AnyObject,   // 输入的 Zod schema 类型
  Output = unknown,                      // call() 产出的类型
  P extends ToolProgressData = ToolProgressData,  // 进度事件类型
> = {
  /* ...一堆成员... */
}
```

三个泛型参数：`Input`（输入 schema）、`Output`（输出）、`P`（进度数据）。下面按"核心必备 / 元信息 / 可选增强"分组讲。

### 2.1 核心必备：name / inputSchema / call / description <span class="oas-b oas-core">核心</span>

这四个是"一个工具能被模型调用"的最小集合。

**① 名字与输入 schema**

```ts
  readonly inputSchema: Input                    // Zod schema：定义+校验输入
  readonly inputJSONSchema?: ToolInputJSONSchema // MCP 工具可直接给 JSON Schema
```

（`name` 字段在类型别处定义，每个工具都有。）`inputSchema` 是一个 **Zod schema**——既用来生成给模型看的 JSON Schema，又用来在执行前**校验模型填的参数**。MCP 工具因为天生是 JSON Schema，可走 `inputJSONSchema` 直接给。

<div class="oas-note">回忆第 00 讲 README 的自定义工具示例里有 <code>inputJSONSchema</code> 和 <code>get inputSchema(){ return { safeParse: ... } }</code>——正对应这两个字段。Zod schema 的本质就是"有一个 <code>safeParse</code> 方法能校验数据"。</div>

**② call()：真正干活的方法**

```ts
  call(
    args: z.infer<Input>,            // 已按 inputSchema 解析好的输入
    context: ToolUseContext,         // 工具运行上下文（cwd、abortController、appState 等）
    canUseTool: CanUseToolFn,        // 权限回调
    parentMessage: AssistantMessage, // 触发本次调用的 assistant 消息
    onProgress?: ToolCallProgress<P>,// 上报进度
  ): Promise<ToolResult<Output>>
```

`call` 是工具的心脏。注意它**收到了 `canUseTool` 和 `context`**——这意味着工具自己可以在执行中再做权限判断、读取上下文、上报进度。返回 `Promise<ToolResult<Output>>`。

`ToolResult` 是个可带进度的结果类型：

```ts
export type ToolResult<T> = { /* data: T 等 —— 工具产出 */ }
```

**③ description()：给模型看的说明**

```ts
  description(
    input: z.infer<Input>,
    options: { isNonInteractiveSession, toolPermissionContext, tools },
  ): Promise<string>
```

返回给模型的工具描述——**注意它是个方法、可以异步、还能拿到上下文**，所以描述可以是动态的（比如根据权限上下文给不同说明），而不是写死的字符串。

### 2.2 元信息：决定调度与权限的几个谓词 <span class="oas-b oas-core">核心</span>

```ts
  isConcurrencySafe(input): boolean   // 能否与其它工具并发执行
  isReadOnly(input): boolean          // 是否只读（不改任何状态）
  isEnabled(): boolean                // 当前是否启用
  isDestructive?(input): boolean      // 是否不可逆（删除/覆盖/发送），默认 false
```

<div class="oas-key-note"><strong>第 04 讲步5 那个"只读并发、写操作串行"的调度，依据就是 <code>isReadOnly</code> / <code>isConcurrencySafe</code></strong>。Read/Glob/Grep 这些 <code>isReadOnly()===true</code> 的工具可以同时跑；Edit/Write/Bash 不是只读、也不保证并发安全，就得串行。<code>isDestructive</code> 则喂给权限系统——不可逆操作会被更谨慎地对待（第 11 讲）。<strong>这几个布尔谓词，是工具元信息里最影响运行时行为的部分。</strong></div>

`isEnabled()` 决定工具是否出现在池子里（见第 3 章 getTools 末尾的过滤）。

### 2.3 模型/权限相关：prompt / toAutoClassifierInput / preparePermissionMatcher <span class="oas-b oas-key">重点</span>

```ts
  prompt(options: { getToolPermissionContext, tools, agents, allowedAgentTypes }): Promise<string>
  toAutoClassifierInput(input): unknown
  preparePermissionMatcher?(input): Promise<(pattern: string) => boolean>
```

- `prompt()`：工具注入系统提示的那段说明（比 `description` 更完整的用法指引）。
- `toAutoClassifierInput()`：返回一个"压缩表示"喂给**权限 AI 分类器**（第 11 讲）。注释举例：Bash 给 `ls -la`、Edit 给 `/tmp/x: new content`。返回 `''` 表示"这工具没安全相关性，分类器跳过它"。
- `preparePermissionMatcher?()`：为权限规则匹配（如 `Bash(git *)`）准备一个匹配函数。

### 2.4 渲染/显示：userFacingName 等（可选增强）<span class="oas-b oas-skim">可跳读</span>

```ts
  userFacingName(input): string                 // 给用户显示的名字
  mapToolResultToToolResultBlockParam(content, toolUseID): ToolResultBlockParam  // 结果→API 块
```

`mapToolResultToToolResultBlockParam` 很关键但机械：把 `call()` 的产出转换成 API 要的 `tool_result` 块（带 `tool_use_id`）——**第 04 讲步5 收进 `toolResults` 的就是它的产物**。

<details class="oas-fold">
<summary>其余可选方法（aliases / searchHint / interruptBehavior / isSearchOrReadCommand / getActivityDescription / renderToolResultMessage …）<span class="oas-b oas-skip">非核心</span></summary>

Tool 接口还有一长串可选成员，都是"锦上添花"，不实现也能跑：

- `aliases?` / `searchHint?`：别名（改名兼容）、ToolSearch 关键词提示。
- `interruptBehavior?()`：运行中用户发新消息时，本工具该 `'cancel'`（中断丢弃）还是 `'block'`（继续、新消息排队），默认 block。
- `isSearchOrReadCommand?()`：标记这是搜索/读取/列目录操作，UI 可折叠显示。
- `getActivityDescription?()`：spinner 上显示的现在进行时短语（"Reading src/foo.ts"）。
- `getToolUseSummary?()` / `getPath?()` / `inputsEquivalent?()` / `isTransparentWrapper?()` / `renderToolResultMessage?()` / `userFacingNameBackgroundColor?()`：摘要、路径、去重、透明包装、结果渲染、主题色。

**为什么把它们归为非核心**：它们影响的是"显示得好不好看、交互细不细腻"，不影响"工具能不能被模型调用、能不能正确执行"。第一次理解工具，2.1–2.2 的核心成员才是关键。逐个工具讲解时，用到哪个再细看。

</details>

<div class="oas-note"><strong>小结 Tool 接口</strong>：必备四件套 <code>name / inputSchema / call / description</code> 让工具"能被声明、能被调用"；元信息谓词 <code>isReadOnly / isConcurrencySafe / isDestructive</code> 决定"怎么调度、权限多严"；其余是显示与交互增强。</div>

## 第 3 章 · tools.ts：工具池的组装四步 <span class="oas-b oas-core">核心</span>
<a id="ch3"></a>

有了一堆工具对象，怎么变成"这次会话模型能用的池子"？`src/tools.ts` 提供四个函数，层层组装。

### 3.1 getAllBaseTools()：全部内置工具的清单 <span class="oas-b oas-key">重点</span>

```ts
export function getAllBaseTools(): Tools {
  return [
    AgentTool, TaskOutputTool, BashTool,
    ...(hasEmbeddedSearchTools() ? [] : [GlobTool, GrepTool]),  // 条件包含
    ExitPlanModeV2Tool, FileReadTool, FileEditTool, FileWriteTool,
    NotebookEditTool, WebFetchTool, TodoWriteTool, WebSearchTool,
    TaskStopTool, AskUserQuestionTool, SkillTool, EnterPlanModeTool,
    ...(process.env.USER_TYPE === 'ant' ? [ConfigTool] : []),   // 内部用户才有
    ...(isTodoV2Enabled() ? [TaskCreateTool, TaskGetTool, TaskUpdateTool, TaskListTool] : []),
    ...(isWorktreeModeEnabled() ? [EnterWorktreeTool, ExitWorktreeTool] : []),
    // ...还有几十个，大量用 ...(条件 ? [X] : []) 模式...
    ListMcpResourcesTool, ReadMcpResourceTool,
    ...(isToolSearchEnabledOptimistic() ? [ToolSearchTool] : []),
  ]
}
```

这就是第 01 讲、第 02 讲反复出现的 `getAllBaseTools`。看清两点：

- **它是一个大数组字面量**，把所有内置工具列出来。这正是 README 说"26 个内置工具"的来源（实际更多，含条件工具）。
- **大量 `...(条件 ? [Tool] : [])` 展开**：很多工具是**条件包含**的——比如 `hasEmbeddedSearchTools()` 为真时不带 Glob/Grep（因为搜索能力已内嵌）、`USER_TYPE==='ant'`（Anthropic 内部用户）才有 ConfigTool、特性开关 / worktree 模式开了才有对应工具。

<div class="oas-key-note"><strong>这解释了"工具数量为什么不是固定的"</strong>：池子随运行环境（用户类型、特性开关、是否内嵌搜索、是否开 worktree）动态增减。第 02 讲 agent 默认 <code>tools ?? getAllBaseTools()</code> 拿到的，就是这份"当前环境下的全集"。</div>

### 3.2 filterToolsByDenyRules()：先按拒绝规则砍掉 <span class="oas-b oas-key">重点</span>

```ts
export function filterToolsByDenyRules<T extends {...}>(
  tools: readonly T[],
  permissionContext: ToolPermissionContext,
): T[] {
  return tools.filter(tool => !getDenyRuleForTool(permissionContext, tool))
}
```

按权限上下文里的**拒绝规则（deny rules）**过滤掉被"一刀切禁用"的工具。注释强调：它用的是**和运行时权限检查同一个匹配器**，所以像 `mcp__server` 这种 server 前缀规则，能在"模型看到工具之前"就把整个 server 的工具剔除——而不是等模型调用时才拒。

<div class="oas-note"><strong>两道防线**：这里是"事前从池子里移除"（模型根本看不到），第 11 讲讲的运行时 canUseTool 是"事中拒绝执行"。和第 02 讲 allowedTools 的"白名单过滤 + canUseTool 双保险"是同一种纵深防御思路。</div>

### 3.3 getTools()：得到"本次模式下的内置工具" <span class="oas-b oas-key">重点</span>

```ts
export const getTools = (permissionContext): Tools => {
  // SIMPLE 模式：只给 Bash / Read / Edit（或 REPL）
  if (isEnvTruthy(process.env.CLAUDE_CODE_SIMPLE)) {
    const simpleTools = [BashTool, FileReadTool, FileEditTool]
    // ...coordinator 模式再加 AgentTool/TaskStop...
    return filterToolsByDenyRules(simpleTools, permissionContext)
  }

  // 正常模式：全集 - 特殊工具
  const specialTools = new Set([ListMcpResourcesTool.name, ReadMcpResourceTool.name, SYNTHETIC_OUTPUT_TOOL_NAME])
  const tools = getAllBaseTools().filter(tool => !specialTools.has(tool.name))
  let allowedTools = filterToolsByDenyRules(tools, permissionContext)
  // REPL 模式：隐藏被 REPL 包裹的原始工具
  if (isReplModeEnabled()) { /* 过滤 REPL_ONLY_TOOLS */ }
  // 最后按 isEnabled() 过滤
  const isEnabled = allowedTools.map(_ => _.isEnabled())
  return allowedTools.filter((_, i) => isEnabled[i])
}
```

`getTools` 在 `getAllBaseTools` 基础上做"模式裁剪"：

- **SIMPLE 模式**（`CLAUDE_CODE_SIMPLE`）：只给最小三件套 Bash/Read/Edit。
- **正常模式**：全集去掉几个"特殊工具"（它们在别处按需加），再过 deny 规则、REPL 过滤，**最后用 `isEnabled()` 逐个筛**（2.2 提过的谓词在这里生效）。

### 3.4 assembleToolPool()：内置 + MCP 合并去重 <span class="oas-b oas-core">核心</span>

```ts
export function assembleToolPool(permissionContext, mcpTools): Tools {
  const builtInTools = getTools(permissionContext)                       // 内置（已裁剪）
  const allowedMcpTools = filterToolsByDenyRules(mcpTools, permissionContext)  // MCP（过 deny）

  const byName = (a, b) => a.name.localeCompare(b.name)
  return uniqBy(
    [...builtInTools].sort(byName).concat(allowedMcpTools.sort(byName)),  // 内置在前、各自排序
    'name',                                                               // 按名去重，内置优先
  )
}
```

这是"**组装工具池的唯一真相源**"（注释原话）。三步：

1. `getTools()` 拿内置工具，`filterToolsByDenyRules` 过滤 MCP 工具。
2. **内置工具排序后放前面，MCP 工具排序后接在后面**——保持内置是连续前缀。
3. `uniqBy(..., 'name')` 按名去重，**内置工具优先**（重名时 MCP 让位）。

<div class="oas-key-note"><strong>这里藏着一个性能细节，值得专门点出</strong>：注释解释为什么要"内置在前、分区各自排序"而不是整体排序——因为服务端的 prompt 缓存策略会在"最后一个内置工具"后面放一个全局缓存断点。如果把 MCP 工具混排进内置工具中间，任何一个 MCP 工具排到内置工具之间，就会让下游所有缓存键失效。<strong>所以这个排序方式是为了 prompt 缓存稳定性</strong>——这是工业级 Agent 才会考虑的优化，也呼应第 00 讲"系统提示静态/动态边界缓存"。<br><br>另外注释还说：不用 <code>Array.toSorted</code>（Node 20+），因为要支持 Node 18——这正是第 00 讲 <code>engines: node>=18</code> 在代码里的具体约束。</div>

<div class="oas-note">四步串起来：<strong>getAllBaseTools（全集）→ filterToolsByDenyRules（砍禁用）→ getTools（按模式裁剪+isEnabled）→ assembleToolPool（并入 MCP、去重、为缓存排序）</strong>。这就是第 02 讲 sdk.ts 导出那四个函数的真正职责。</div>

## 第 4 章 · demo：照接口写一个最小工具 <span class="oas-b oas-skim">动手</span>
<a id="ch4"></a>

现在回头看第 00 讲 README 的 examples/07 自定义工具，每个字段都能对上号了：

```ts
const weatherTool = {
  name: 'GetWeather',                              // 必备：名字
  description: 'Get weather for a city',           // 注：示例里是字符串，正式接口是方法
  inputJSONSchema: {                               // 2.1：MCP 风格的 JSON Schema 输入
    type: 'object',
    properties: { city: { type: 'string' } },
    required: ['city'],
  },
  get inputSchema() { return { safeParse: (v) => ({ success: true, data: v }) } }, // 2.1：Zod 风格校验
  async prompt() { return this.description },       // 2.3：注入提示的说明
  async call(input) {                               // 2.1：真正干活
    return { data: `Weather in ${input.city}: 22°C, sunny` }
  },
  userFacingName: () => 'GetWeather',              // 2.4：显示名
  isReadOnly: () => true,                          // 2.2：只读 → 可并发调度
  isConcurrencySafe: () => true,                   // 2.2：并发安全
  mapToolResultToToolResultBlockParam: (data, id) => ({  // 2.4：结果→API 块
    type: 'tool_result', tool_use_id: id, content: data,
  }),
}

const agent = createAgent({ tools: [...getAllBaseTools(), weatherTool] })  // 第 3 章：并进池子
```

<div class="oas-key-note">对照第 2 章，你会发现这个最小工具<strong>恰好实现了 2.1 必备四件套 + 2.2 两个谓词 + 2.4 两个显示/转换方法</strong>，其余可选成员全省了——这正是"最小可用工具"的边界。<code>isReadOnly:()=>true</code> 让它在第 04 讲步5 能和其它只读工具并发跑；<code>[...getAllBaseTools(), weatherTool]</code> 把它塞进第 3.1 的全集，再经第 3.4 组装进池子，模型就能在第 04 讲步2 的 <code>callModel({tools})</code> 里看到并调用它。<strong>五讲的知识在这个 demo 里闭环了。</strong></div>

## 第 5 章 · 重要性盘点 + 下一讲预告 <span class="oas-b oas-skim">收尾</span>
<a id="ch5"></a>

### 5.1 重要性盘点

| 内容 | 重要性 | 一句话 |
| --- | --- | --- |
| 必备四件套 name/inputSchema/call/description | <span class="oas-b oas-core">核心</span> | 工具被声明+被调用的最小集合 |
| isReadOnly/isConcurrencySafe/isDestructive | <span class="oas-b oas-core">核心</span> | 决定调度与权限严格度 |
| assembleToolPool 组装四步 | <span class="oas-b oas-core">核心</span> | 工具池如何成型（含缓存排序） |
| getAllBaseTools 条件包含 | <span class="oas-b oas-key">重点</span> | 工具数量随环境变 |
| prompt/toAutoClassifierInput | <span class="oas-b oas-key">重点</span> | 工具如何接入提示与权限分类器 |
| 渲染/交互可选方法 | <span class="oas-b oas-skip">非核心</span> | 显示增强，可后看 |

### 5.2 下一讲预告

<div class="oas-key-note"><strong>第 06 讲</strong>：开始逐个拆具体工具，从最基础的<strong>文件三件套 Read / Write / Edit</strong> 入手。我们会看到 <code>FileReadTool</code> 怎么处理行号、图片、PDF、超大文件，<code>FileEditTool</code> 怎么做"精确字符串替换"并防止误改（为什么 Edit 前必须先 Read），以及它们如何实现第 2 章那套 Tool 接口、<code>isReadOnly</code> 各返回什么。这三个是 Agent 改代码的最高频工具，吃透它们，后面 Bash/Grep 都是同一套路。</div>

> 上一讲：[第04讲 · 回合循环 src/query.ts](/2026/06/21/open-agent-sdk-04-turn-loop/) ｜ 系列目录：[《Open Agent SDK 源码逐行精讲》总目录](/courses/open-agent-sdk/)
