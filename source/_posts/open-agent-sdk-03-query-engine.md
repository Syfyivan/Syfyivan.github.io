---
title: "《Open Agent SDK 源码逐行精讲》第03讲 · 引擎编排外壳：ask() 与 QueryEngine.submitMessage"
date: 2026-06-21 13:00:00
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

> 这是《Open Agent SDK 源码逐行精讲》第 03 讲。第 02 讲末尾，`agent.query()` 把一大包参数交给了 `ask()`。这一讲就读 `ask()` 和它背后的 `QueryEngine.submitMessage`——SDK 的**编排外壳**。说"外壳"是因为：真正一轮轮调模型、执行工具的循环在更里面的 `query.ts`（第 04 讲）；而这一层负责把这台循环"包起来"——装配系统提示、处理输入、驱动消息泵、累计用量、把握三道终止闸、最后吐出 `result`。

<div class="oas-toc"><strong>本讲导航</strong>
<a id="ch0"></a>

- 第 1 章 · 五层调用栈：先定位自己在哪
- 第 2 章 · ask() 逐行：一个薄到极致的包装
- 第 3 章 · QueryEngine 类：字段与构造
- 第 4 章 · submitMessage 全景（七段）
- 第 5 章 · 三段终止闸与 result 事件
- 第 6 章 · demo + 重要性盘点 + 下一讲预告
</div>

## 第 1 章 · 五层调用栈 <span class="oas-b oas-core">核心</span>
<a id="ch1"></a>

读这一讲前，先把整条调用栈钉在脑子里。从你写的代码到 API，一共五层：

```text
1. agent.query() / 顶层 query()      —— 门面：翻译配置 + 透传事件   （第 02 讲）
2. ask({...})                         —— 薄包装：new QueryEngine + submitMessage（本讲第 2 章）
3. QueryEngine.submitMessage()        —— 编排外壳：装配 + 消息泵 + result（本讲第 3-5 章）
4. query({...}) （来自 query.ts）      —— 回合循环：模型↔工具 的心跳        （第 04 讲）
5. claude.ts 的 API 客户端            —— 真正发请求：流式 / 重试 / 缓存       （第 15 讲）
```

<div class="oas-key-note"><strong>本讲的边界要先说死</strong>：我们读第 2、3 层，把第 4 层（<code>query.ts</code> 的真正回合循环）当成一个"会吐消息的黑盒"——因为它本身就是 1700 行，值得单独一讲。所以本讲你会反复看到 <code>for await (const message of query({...}))</code>——那个 <code>query</code> 就是黑盒，我们只看 submitMessage 如何<strong>消费</strong>它吐出的消息。</div>

## 第 2 章 · ask() 逐行 <span class="oas-b oas-key">重点</span>
<a id="ch2"></a>

`ask()` 在 `src/QueryEngine.ts` 末尾（1186 行起），是个异步生成器。它薄到几乎只做两件事：建引擎、转发。

### 2.1 一长串解构参数

```ts
export async function* ask({
  commands, prompt, promptUuid, isMeta, cwd, tools, mcpClients,
  verbose = false, thinkingConfig, maxTurns, maxBudgetUsd, taskBudget,
  canUseTool, mutableMessages = [], getReadFileCache, setReadFileCache,
  customSystemPrompt, appendSystemPrompt, userSpecifiedModel, fallbackModel,
  jsonSchema, getAppState, setAppState, abortController,
  replayUserMessages = false, includePartialMessages = false,
  handleElicitation, agents = [], setSDKStatus, orphanedPermission,
}: { /* ...对应的类型... */ }): AsyncGenerator<SDKMessage, void, unknown> {
```

这一大坨参数，正是第 02 讲 5.5.5 里 `agent.query` 传进来的那一包。`ask` 用对象解构一次性接住。注意几个默认值：`mutableMessages = []`（没传就空数组）、`maxTurns`/`maxBudgetUsd` 无默认（即不设上限）。

### 2.2 new QueryEngine：把参数搬进引擎

```ts
  const engine = new QueryEngine({
    cwd, tools, commands, mcpClients, agents, canUseTool,
    getAppState, setAppState,
    initialMessages: mutableMessages,                          // 注意：把消息数组当"初始消息"
    readFileCache: cloneFileStateCache(getReadFileCache()),    // 注意：克隆一份缓存
    customSystemPrompt, appendSystemPrompt, userSpecifiedModel, fallbackModel,
    thinkingConfig, maxTurns, maxBudgetUsd, taskBudget, jsonSchema, verbose,
    handleElicitation, replayUserMessages, includePartialMessages,
    setSDKStatus, abortController, orphanedPermission,
    ...(feature('HISTORY_SNIP') ? { snipReplay: (...) => {...} } : {}),
  })
```

两个细节值得停一下：

- `initialMessages: mutableMessages`：第 02 讲那个"共享可变数组"传进引擎当**初始消息**。引擎会在它基础上继续累加。
- `readFileCache: cloneFileStateCache(getReadFileCache())`：**克隆**一份读文件缓存，而不是直接用。为什么克隆？这样引擎运行期间对缓存的改动是隔离的，跑完再通过 `setReadFileCache`（见 2.3）一次性写回——避免运行中途的脏状态污染调用方。
- 末尾的 `...(feature('HISTORY_SNIP') ? {...} : {})`：**特性开关控制的可选配置**。`feature('HISTORY_SNIP')` 开了才注入 `snipReplay`（历史裁剪回放）回调。这就是第 01 讲说的 Gates——很多能力是灰度开关控制的。

### 2.3 try/finally：把缓存写回去

```ts
  try {
    yield* engine.submitMessage(prompt, {
      uuid: promptUuid,
      isMeta,
    })
  } finally {
    setReadFileCache(engine.getReadFileState())
  }
}
```

- `yield* engine.submitMessage(...)`：**把 submitMessage 吐出的所有事件原样转发**。`ask` 自己不加工——又一个 `yield*` 委托（和第 02 讲 agent.query 透传 ask 是同一手法）。
- `finally`：无论正常结束还是异常 / 取消，**都把引擎里那份克隆缓存的最终状态写回调用方**（`setReadFileCache`）。配合 2.2 的克隆，构成"进来克隆、出去写回"的完整闭环——这是处理共享可变状态的稳妥模式。

<div class="oas-note"><strong>ask() 的全部价值</strong>：把"一包扁平参数"翻译成"一个 QueryEngine 实例 + 一次 submitMessage 调用"，并管好读文件缓存的进出。逻辑全在 QueryEngine 里。下面进正题。</div>

## 第 3 章 · QueryEngine 类：字段与构造 <span class="oas-b oas-key">重点</span>
<a id="ch3"></a>

```ts
export class QueryEngine {
  private config: QueryEngineConfig
  private mutableMessages: Message[]
  private abortController: AbortController
  private permissionDenials: SDKPermissionDenial[]
  private totalUsage: NonNullableUsage
  private hasHandledOrphanedPermission = false
  private readFileState: FileStateCache
  private discoveredSkillNames = new Set<string>()      // 本回合发现的 skill 名
  private loadedNestedMemoryPaths = new Set<string>()   // 已加载的嵌套记忆路径

  constructor(config: QueryEngineConfig) {
    this.config = config
    this.mutableMessages = config.initialMessages ?? []
    this.abortController = config.abortController ?? createAbortController()
    this.permissionDenials = []
    this.readFileState = config.readFileCache
    this.totalUsage = EMPTY_USAGE
  }
```

字段都是"一次 query 期间要累积的东西"：

- `mutableMessages`：消息数组（来自 config.initialMessages，即那条共享引用链的延续）。
- `permissionDenials`：**记录被拒绝的工具调用**，最后塞进 result（让调用方知道哪些操作被权限挡了）。
- `totalUsage`：累计 token 用量，初始 `EMPTY_USAGE`。
- `readFileState`：读文件缓存（ask 克隆进来的那份）。
- `discoveredSkillNames` / `loadedNestedMemoryPaths`：回合内的 skill 发现与记忆加载追踪。

构造函数纯粹是字段初始化，没有副作用。所有重活都在 `submitMessage`。

## 第 4 章 · submitMessage 全景 <span class="oas-b oas-core">核心</span>
<a id="ch4"></a>

`submitMessage` 约 765 行，是整台引擎的编排主体。别怕——它的骨架其实是清晰的七段。先看骨架，再逐段填。

```text
段1 准备       清空回合状态、setCwd、包装 canUseTool（记录 denial）
段2 装配提示   fetchSystemPromptParts → 拼出最终 systemPrompt
段3 处理输入   processUserInput（斜杠命令/附件）→ push 消息 → 写 transcript
段4 系统初始化 yield system_init；若 shouldQuery=false（纯本地命令）则直接出 result 短路返回
段5 消息泵     for await (query({...maxTurns,taskBudget})) —— 消费内层循环吐的每条消息
段6 终止闸     max_turns / maxBudgetUsd / 结构化输出重试，任一触发就出 error result 并 return
段7 收尾       循环正常结束后，判定成功与否，yield 最终 result
```

### 4.1 段1 · 准备与 canUseTool 包装 <span class="oas-b oas-key">重点</span>

```ts
  async *submitMessage(prompt, options?) {
    const { cwd, commands, tools, mcpClients, /* ...一大堆从 config 解构... */
            canUseTool, maxTurns, maxBudgetUsd, taskBudget, /* ... */ } = this.config

    this.discoveredSkillNames.clear()     // 每次 submitMessage 清空，防跨回合无限增长
    setCwd(cwd)                            // 设置全局工作目录
    const persistSession = !isSessionPersistenceDisabled()
    const startTime = Date.now()           // 计时起点（最后算 duration_ms）

    // 包装 canUseTool —— 在原回调外面套一层，专门记录被拒的调用
    const wrappedCanUseTool: CanUseToolFn = async (tool, input, ctx, asstMsg, toolUseID, force) => {
      const result = await canUseTool(tool, input, ctx, asstMsg, toolUseID, force)
      // ...若 result.behavior === 'deny'，push 进 this.permissionDenials...
      return result
    }
```

- `discoveredSkillNames.clear()`：**每次进来先清空**。注释解释：它要在一次 submitMessage 内的两次上下文重建之间存活，但又不能跨回合无限增长，所以在入口清。
- `setCwd(cwd)`：把工作目录设到全局，供工具读取。
- `wrappedCanUseTool`：**装饰器模式**。在第 02 讲传进来的 `canUseTool` 外面再包一层——调用原回调拿结果，顺手把被拒的记进 `permissionDenials`。这样"权限决策"和"统计被拒"两个关注点分离：决策逻辑不用管统计。

### 4.2 段2 · 装配系统提示 <span class="oas-b oas-core">核心</span>

```ts
    const customPrompt = typeof customSystemPrompt === 'string' ? customSystemPrompt : undefined

    const { defaultSystemPrompt, userContext: baseUserContext, systemContext } =
      await fetchSystemPromptParts({
        tools,
        mainLoopModel: initialMainLoopModel,
        additionalWorkingDirectories: Array.from(
          initialAppState.toolPermissionContext.additionalWorkingDirectories.keys(),
        ),
        mcpClients,
        customSystemPrompt: customPrompt,
      })
```

`fetchSystemPromptParts` 一把拿到三块：

- `defaultSystemPrompt`：**默认系统提示**（Claude Code 那一大段身份 + 工具说明 + 行为约束）。
- `userContext`：用户侧上下文。
- `systemContext`：系统侧上下文。

<div class="oas-note">这三块怎么构建的，是第 08 讲"系统提示与上下文"的内容。本讲只看它们如何被<strong>拼接</strong>。</div>

```ts
    const memoryMechanicsPrompt =
      customPrompt !== undefined && hasAutoMemPathOverride()
        ? await loadMemoryPrompt()
        : null

    const systemPrompt = asSystemPrompt([
      ...(customPrompt !== undefined ? [customPrompt] : defaultSystemPrompt),  // 自定义则整替，否则用默认
      ...(memoryMechanicsPrompt ? [memoryMechanicsPrompt] : []),                // 可选：记忆机制说明
      ...(appendSystemPrompt ? [appendSystemPrompt] : []),                      // 可选：用户追加
    ])
```

这就是第 02 讲 3.2 节 `systemPrompt`/`appendSystemPrompt` 的归宿，看清三条规则：

1. **给了 `customPrompt` 就整段替换默认提示**，否则用 `defaultSystemPrompt`。
2. 若调用方设了自定义提示**且**开了记忆路径覆盖（`hasAutoMemPathOverride`），额外注入一段"记忆机制说明"——告诉模型该用哪些 Write/Edit、MEMORY.md 文件名等。
3. `appendSystemPrompt` 永远追加在最后。

<div class="oas-key-note"><strong>这解释了第 02 讲埋的两个字段差异</strong>：<code>systemPrompt</code> 走第 1 条（替换），<code>appendSystemPrompt</code> 走第 3 条（追加）。三段用 <code>asSystemPrompt([...])</code> 拼成最终提示——数组顺序就是提示拼接顺序。</div>

### 4.3 段3 · 处理用户输入 <span class="oas-b oas-key">重点</span>

```ts
    const {
      messages: messagesFromUserInput,
      shouldQuery,            // ★ 关键：要不要真去调模型
      allowedTools,
      model: modelFromUserInput,
      resultText,
    } = await processUserInput({
      input: prompt,
      mode: 'prompt',
      context: { ...processUserInputContext, messages: this.mutableMessages },
      messages: this.mutableMessages,
      uuid: options?.uuid,
      isMeta: options?.isMeta,
      querySource: 'sdk',
    })

    this.mutableMessages.push(...messagesFromUserInput)  // 把用户消息+附件追加进消息数组
    const messages = [...this.mutableMessages]            // 快照
```

`processUserInput` 把原始 prompt 变成结构化消息，并处理**斜杠命令**。它返回的 `shouldQuery` 是个关键开关：

- 如果输入是个**纯本地斜杠命令**（比如 `/help`、`/clear`，不需要模型），`shouldQuery = false`——根本不必调 API。
- 否则 `shouldQuery = true`，进入真正的模型循环。

随后把产生的消息 push 进 `mutableMessages`，并做一份快照 `messages`。

<details class="oas-fold">
<summary>段3 里的 transcript 持久化（容错细节）<span class="oas-b oas-skim">可跳读</span></summary>

紧接着有一段把用户消息**先写进 transcript** 的代码（`recordTranscript(messages)`）。注释解释得很细：如果不先写，进程在 API 响应到达前被杀（用户秒点 Stop），transcript 里只有队列操作、`--resume` 会失败报 "No conversation found"。所以这里提前落盘，保证"从用户消息被接受那一刻起就可恢复"。`--bare` 模式则 fire-and-forget（不阻塞关键路径）。

这属于"工程健壮性"细节，不影响理解主干，知道"用户消息会尽早落盘以支持 resume"即可。

</details>

### 4.4 段4 · system_init 与短路返回 <span class="oas-b oas-key">重点</span>

```ts
    yield buildSystemInitMessage({
      tools, mcpClients, model: mainLoopModel,
      permissionMode: initialAppState.toolPermissionContext.mode,
      commands, agents, skills, plugins: enabledPlugins,
      fastMode: initialAppState.fastMode,
    })
```

**第一条吐给外部的事件**：`system_init`。它把"本次会话的配置快照"（有哪些工具、模型、权限模式、命令、子 Agent、技能、插件）打包告诉调用方。SDK 用户拿到的第一个 `event` 通常就是它。

```ts
    if (!shouldQuery) {
      // 纯本地命令：把命令输出 yield 出去，直接出 result，return
      for (const msg of messagesFromUserInput) { /* yield 本地命令的 stdout/stderr ... */ }
      yield {
        type: 'result', subtype: 'success', is_error: false,
        duration_ms: Date.now() - startTime,
        num_turns: messages.length - 1,
        result: resultText ?? '',
        usage: this.totalUsage, /* ...其余统计... */
      }
      return     // ★ 短路：根本不进模型循环
    }
```

<div class="oas-note"><strong>短路路径</strong>：如果是纯本地命令（<code>shouldQuery=false</code>），把命令输出 yield 出去，直接构造一个 <code>success</code> 的 result 返回——<strong>一次模型都不调，零 token</strong>。这是性能与成本上的重要优化：能本地解决的就别惊动模型。</div>

### 4.5 段5 · 消息泵（核心循环）<span class="oas-b oas-core">核心</span>

到这里才进入真正的主体。先初始化几个回合级计数器：

```ts
    let currentMessageUsage = EMPTY_USAGE   // 当前这条消息的用量（每条 message_start 重置）
    let turnCount = 1
    let lastStopReason: string | null = null
    let structuredOutputFromTool: unknown
```

然后是整个引擎的**心跳**——消费内层 `query()` 吐出的每条消息：

```ts
    for await (const message of query({
      messages, systemPrompt, userContext, systemContext,
      canUseTool: wrappedCanUseTool,         // 用包装过的（会记 denial）
      toolUseContext: processUserInputContext,
      fallbackModel, querySource: 'sdk',
      maxTurns, taskBudget,                   // ★ 上限传给内层循环
    })) {
      // ...对 message 分类处理...
    }
```

<div class="oas-key-note"><strong>这就是第 1 章说的"黑盒边界"</strong>：内层 <code>query({...})</code>（来自 <code>query.ts</code>，第 04 讲）才是真正"调模型 → 拿到 tool_use → 执行工具 → 把结果回灌 → 再调模型"的回合循环。它把过程中的每一步都<strong>作为一条 message yield 出来</strong>，submitMessage 在这里逐条消费、转译、转发。<code>maxTurns</code> 和 <code>taskBudget</code> 在这一步交给内层，由内层在每轮检查。</div>

循环体按 `message.type` 分类。挑核心的看：

```ts
      switch (message.type) {
        case 'assistant':
          if (message.message.stop_reason != null) lastStopReason = message.message.stop_reason
          this.mutableMessages.push(message)
          yield* normalizeMessage(message)     // 规整成 SDK 消息后转发
          break
        case 'user':                            // 通常是工具结果回灌
          this.mutableMessages.push(message)
          yield* normalizeMessage(message)
          break
        case 'progress':                        // 工具执行进度
          this.mutableMessages.push(message)
          yield* normalizeMessage(message)
          break
        case 'stream_event':                    // 原始流式增量
          if (message.event.type === 'message_start') currentMessageUsage = EMPTY_USAGE
          if (message.event.type === 'message_delta') { /* 累计 usage + 抓 stop_reason */ }
          if (message.event.type === 'message_stop') this.totalUsage = accumulateUsage(this.totalUsage, currentMessageUsage)
          if (includePartialMessages) yield { type: 'stream_event', event: message.event, /* ... */ }
          break
        case 'attachment': /* 见 4.6 终止闸 */ break
        case 'system': /* 压缩边界 / api_error 重试通知 */ break
        case 'tool_use_summary': yield { type: 'tool_use_summary', /* ... */ }; break
      }
```

关键观察：

- **`assistant` / `user` / `progress`** 都做同一件事：push 进 `mutableMessages`（维护历史）+ `yield* normalizeMessage(message)`（规整成对外的 SDK 消息再转发）。这就是你在 examples 里看到 `type:'assistant'` 事件的来源。
- **`user` 类型会 `turnCount++`**（在 switch 前）：因为工具结果回灌表现为一条 user 消息，正好对应"又过了一回合"。
- **`stream_event`** 负责**用量统计**：`message_start` 重置当前消息用量、`message_delta` 累加并捕获真正的 `stop_reason`（注释说 assistant 消息在 content_block_stop 时 stop_reason 还是 null，真值要从 delta 拿）、`message_stop` 把当前消息用量累进 `totalUsage`。只有开了 `includePartialMessages` 才把原始流转发给用户。

<details class="oas-fold">
<summary>段5 里的 transcript / compact_boundary 等持久化分支<span class="oas-b oas-skim">可跳读</span></summary>

循环体顶部还有一段：遇到 assistant/user/compact_boundary 就 push 进 `messages` 并 `recordTranscript`。其中 assistant 用 fire-and-forget（`void recordTranscript`）、其余 `await`——注释解释这是为了不阻塞 claude.ts 的 message_delta（它靠写队列的懒序列化）。还有 `compact_boundary` 前的 tailUuid 落盘、`hasAcknowledgedInitialMessages` 的首次回执。这些都是持久化与 resume 的健壮性细节，理解主干可跳过，知道"消息边写历史边落盘"即可。

</details>

## 第 5 章 · 三段终止闸与 result 事件 <span class="oas-b oas-core">核心</span>
<a id="ch5"></a>

消息泵跑着跑着，靠什么停？submitMessage 设了**三道闸**，任一触发就 yield 一个 error result 并 `return`。

### 5.1 闸一 · 回合上限（max_turns）

内层循环把"回合到顶"作为一条 `attachment` 消息吐出来：

```ts
        case 'attachment':
          // ...
          else if (message.attachment.type === 'max_turns_reached') {
            yield {
              type: 'result', subtype: 'error_max_turns', is_error: true,
              num_turns: message.attachment.turnCount,
              errors: [`Reached maximum number of turns (${message.attachment.maxTurns})`],
              /* ...统计... */
            }
            return
          }
```

注意：**max_turns 的判定在内层 query.ts 做**（它知道轮数），submitMessage 只是收到信号后翻译成 `error_max_turns` 的 result。这呼应第 02 讲 3.3——`maxTurns` 是防失控的闸。

### 5.2 闸二 · 预算上限（maxBudgetUsd）

这道闸在**循环体末尾每条消息后**检查：

```ts
      // （switch 之后，仍在 for await 内）
      if (maxBudgetUsd !== undefined && getTotalCost() >= maxBudgetUsd) {
        yield {
          type: 'result', subtype: 'error_max_budget_usd', is_error: true,
          num_turns: turnCount,
          errors: [`Reached maximum budget ($${maxBudgetUsd})`],
          /* ...统计... */
        }
        return
      }
```

每处理完一条消息就比一次"累计花费 ≥ 预算？"，超了立刻出 `error_max_budget_usd` 并返回。**和回合闸不同，预算闸由 submitMessage 自己查**（因为它掌握 `getTotalCost()`）。

### 5.3 闸三 · 结构化输出重试上限 <span class="oas-b oas-skim">可跳读</span>

```ts
      if (message.type === 'user' && jsonSchema) {
        const callsThisQuery = countToolCalls(this.mutableMessages, SYNTHETIC_OUTPUT_TOOL_NAME) - initialStructuredOutputCalls
        const maxRetries = parseInt(process.env.MAX_STRUCTURED_OUTPUT_RETRIES || '5', 10)
        if (callsThisQuery >= maxRetries) {
          yield { type: 'result', subtype: 'error_max_structured_output_retries', is_error: true, /* ... */ }
          return
        }
      }
```

只在用了 `jsonSchema`（结构化输出）时生效：如果模型反复产出不合 schema 的结果、重试超过 `MAX_STRUCTURED_OUTPUT_RETRIES`（默认 5），就放弃并报错。防的是"模型死活给不出合法 JSON"的死循环。

### 5.4 收尾 · 成功还是失败

循环正常结束（内层 query 不再吐消息）后：

```ts
    const result = messages.findLast(m => m.type === 'assistant' || m.type === 'user')
    // ...
    if (!isResultSuccessful(result, lastStopReason)) {
      yield { type: 'result', subtype: 'error_during_execution', is_error: true, /* ... */ }
    } else {
      // yield 一个 success result（含最终文本、usage、num_turns、cost...）
    }
```

- 取最后一条 assistant/user 消息当作"结果消息"。
- `isResultSuccessful` 判定是否正常收尾——正常则出 `success` result，否则出 `error_during_execution`。

<div class="oas-key-note"><strong>把五种 result subtype 收齐</strong>（这正是 examples 里 <code>msg.subtype</code> 的全集）：<br>· <code>success</code> —— 正常完成（含纯本地命令短路那条）<br>· <code>error_max_turns</code> —— 回合到顶<br>· <code>error_max_budget_usd</code> —— 预算烧完<br>· <code>error_max_structured_output_retries</code> —— 结构化输出反复失败<br>· <code>error_during_execution</code> —— 收尾判定不成功<br>每个 result 都带齐 <code>duration_ms / num_turns / usage / total_cost_usd / permission_denials</code> 等统计——这就是第 02 讲 QueryResult 里那些字段的真正产地。</div>

## 第 6 章 · demo + 重要性盘点 + 下一讲预告 <span class="oas-b oas-skim">收尾</span>
<a id="ch6"></a>

### 6.1 demo：把"事件流"的骨架打印出来

回到第 00 讲跑过的 examples/01。现在你能看懂它打印的每一类事件**来自 submitMessage 的哪一段**了。给它加几行，把所有 `event.type` 原样打出来：

```ts
for await (const event of agent.query('Read package.json and tell me its name.')) {
  console.log('EVENT:', event.type, (event as any).subtype ?? '')
}
```

预期事件序列（示意）：

```text
EVENT: system            # ← 段4 的 buildSystemInitMessage
EVENT: assistant         # ← 段5：模型决定调用 Read（tool_use 块）
EVENT: user              # ← 段5：Read 的结果回灌（turnCount++）
EVENT: assistant         # ← 段5：模型基于文件内容给出最终文本
EVENT: result success    # ← 段7：收尾，isResultSuccessful=true
```

把这条序列和第 4–5 章对照，整台编排外壳的运转就具象了：**system_init 开场 → assistant/user 交替（模型↔工具）→ result 收尾**。

### 6.2 重要性盘点

| 段落 | 重要性 | 一句话 |
| --- | --- | --- |
| 段5 消息泵 `for await(query(...))` | <span class="oas-b oas-core">核心</span> | 引擎心跳，消费内层循环的每条消息 |
| 段2 系统提示三段拼接 | <span class="oas-b oas-core">核心</span> | systemPrompt/append 的归宿 |
| 段4 shouldQuery 短路 | <span class="oas-b oas-key">重点</span> | 本地命令零 token 返回 |
| 三道终止闸 + 5 种 result | <span class="oas-b oas-key">重点</span> | 防失控 + 统一收尾 |
| wrappedCanUseTool 装饰 | <span class="oas-b oas-key">重点</span> | 决策与统计关注点分离 |
| transcript/持久化分支 | <span class="oas-b oas-skim">可跳读</span> | resume 健壮性细节 |

### 6.3 下一讲预告

<div class="oas-key-note"><strong>第 04 讲</strong>：揭开本讲那个黑盒——<code>src/query.ts</code> 的内层 <code>query()</code>。我们会看到一轮"回合"到底由哪些步骤组成：构建请求 → 调用 claude.ts 流式拿模型输出 → 解析其中的 tool_use → 并发/串行地执行工具 → 把 tool_result 拼成 user 消息回灌 → 判断是否继续下一轮，以及 <code>max_turns_reached</code> 那条 attachment 是在哪一步被吐出来的。读完它，"Agent 为什么能自己一步步把活干完"就彻底不神秘了。</div>

> 上一讲：[第02讲 · 高层 API src/agent.ts](/2026/06/21/open-agent-sdk-02-agent-api/) ｜ 系列目录：[《Open Agent SDK 源码逐行精讲》总目录](/courses/open-agent-sdk/)
