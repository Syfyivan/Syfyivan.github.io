---
title: "《Open Agent SDK 源码逐行精讲》第04讲 · 回合循环 src/query.ts：模型↔工具的心跳"
date: 2026-06-21 14:00:00
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

> 这是《Open Agent SDK 源码逐行精讲》第 04 讲。第 03 讲我们把引擎编排外壳读完了，但留了一个黑盒：`submitMessage` 里那句 `for await (const message of query({...}))`。这一讲就打开它——`src/query.ts` 的内层 `query()`。它是整个 SDK **真正的心脏**：一轮轮地"调模型 → 看模型要不要用工具 → 执行工具 → 把结果回灌 → 再调模型"，直到模型不再要工具为止。读完它，"Agent 为什么能自己把一个多步任务做完"就彻底不神秘了。

<div class="oas-toc"><strong>本讲导航</strong>
<a id="ch0"></a>

- 第 1 章 · 什么是"一个回合（turn）"
- 第 2 章 · query / queryLoop 两层 + State 状态机
- 第 3 章 · while(true) 一轮的七步解剖
- 第 4 章 · Terminal：循环靠什么停（reason 全集）
- 第 5 章 · 和第 03 讲接上：max_turns_reached 这条信号
- 第 6 章 · demo + 重要性盘点 + 下一讲预告
</div>

## 第 1 章 · 什么是"一个回合" <span class="oas-b oas-core">核心</span>
<a id="ch1"></a>

先把概念钉死。一个 **回合（turn）** = 一次"问模型 + 处理它的回答"：

```text
一个回合：
  1. 把当前消息历史发给模型
  2. 模型流式返回一条 assistant 消息（可能含 text，也可能含 tool_use）
  3a. 如果没有 tool_use  → 模型觉得活干完了 → 结束
  3b. 如果有 tool_use    → 执行这些工具 → 得到 tool_result
                          → 把 tool_result 作为 user 消息追加进历史
                          → 进入下一个回合（回到第 1 步）
```

<div class="oas-key-note"><strong>这就是 Agent 的本质</strong>：不是"模型一次性吐出答案"，而是<strong>模型和工具来回交替、逐步逼近目标</strong>。每交替一次就是一个回合。<code>query.ts</code> 干的全部事情，就是把这个交替循环可靠地转起来——加上压缩、预算、降级、取消、错误恢复这些工程保障。<code>maxTurns</code> 限制的就是这个交替最多来回多少次。</div>

## 第 2 章 · query / queryLoop 两层 + State 状态机 <span class="oas-b oas-key">重点</span>
<a id="ch2"></a>

`src/query.ts` 1730 行，但对外只导出一个 `query`。它分两层。

### 2.1 query：外层，只管"善后"

```ts
export async function* query(params: QueryParams): AsyncGenerator<
  StreamEvent | RequestStartEvent | Message | TombstoneMessage | ToolUseSummaryMessage,
  Terminal
> {
  const consumedCommandUuids: string[] = []
  const terminal = yield* queryLoop(params, consumedCommandUuids)   // 真正的循环在这
  // 只有 queryLoop 正常返回才到这——抛错/.return() 都会跳过
  for (const uuid of consumedCommandUuids) {
    notifyCommandLifecycle(uuid, 'completed')
  }
  return terminal
}
```

外层 `query` 很薄：把活全交给 `queryLoop`（`yield*` 委托），等它正常返回后做点善后（通知命令生命周期完成）。注意它的**返回类型是 `Terminal`**——生成器除了 `yield` 一路事件，最后还 `return` 一个"终止原因"对象（第 4 章详解）。

<div class="oas-note">注意 yield 的事件类型：<code>StreamEvent</code>（原始流增量）、<code>Message</code>（assistant/user 等）、<code>TombstoneMessage</code>（墓碑，删除无效消息）、<code>ToolUseSummaryMessage</code>（工具调用摘要）。这些正是第 03 讲段5 那个 switch 分类处理的对象。</div>

### 2.2 queryLoop：内层，State + while(true)

```ts
async function* queryLoop(params, consumedCommandUuids): AsyncGenerator<...> {
  const { systemPrompt, userContext, systemContext, canUseTool,
          fallbackModel, querySource, maxTurns, skipCacheWrite } = params   // 不可变参数
  const deps = params.deps ?? productionDeps()

  // 跨迭代的可变状态，集中在一个对象里
  let state: State = {
    messages: params.messages,
    toolUseContext: params.toolUseContext,
    turnCount: 1,
    // ...还有压缩追踪、token 恢复计数等
  }

  while (true) {
    // 每轮开头从 state 解构出本轮要用的字段
    let { toolUseContext } = state
    const { messages, turnCount, /* ... */ } = state
    // ...一轮的七步（第 3 章）...
    state = next   // 写回新状态，进入下一轮
  }
}
```

<div class="oas-key-note"><strong>这是一个手写的状态机</strong>。作者把所有"跨回合要传递的东西"塞进一个 <code>State</code> 对象，每轮开头解构、结尾用 <code>state = next</code> 整体替换。注释解释了为什么这么写：循环里有 7 个 <code>continue</code> 点（压缩重试、token 恢复等），如果用 9 个独立变量，每个 continue 都要重设 9 次；用一个 state 对象，只需写一次 <code>state = {...}</code>。<strong>读这类大循环的诀窍，就是先抓住"哪些是跨轮状态、状态怎么更新"，细节分支可以后看。</strong></div>

## 第 3 章 · while(true) 一轮的七步解剖 <span class="oas-b oas-core">核心</span>
<a id="ch3"></a>

把一轮循环体（约 1400 行，含大量错误恢复分支）抽干成七步主干。

### 3.1 步1 · 准备本轮要发的消息 <span class="oas-b oas-key">重点</span>

```ts
    yield { type: 'stream_request_start' }   // 先吐一个"请求开始"事件

    // 取压缩边界之后的消息（边界之前的已被压缩成摘要，不再重发）
    let messagesForQuery = [...getMessagesAfterCompactBoundary(messages)]
```

- 先 `yield {type:'stream_request_start'}`——这就是第 03 讲段5 里 `case 'stream_request_start': break`（编排层收到但不转发，只是个内部信号）。
- `getMessagesAfterCompactBoundary(messages)`：**只取最近一次压缩边界之后的消息**。如果之前发生过上下文压缩，边界之前的历史已经被压成一段摘要，这里就不重复发送了。这是上下文压缩（第 12 讲）和主循环的接缝。

<details class="oas-fold">
<summary>步1 里还夹着的：预算/内容替换/微压缩（非核心，可跳读）<span class="oas-b oas-skim">可跳读</span></summary>

这一段附近还有：`budgetTracker`（token 预算追踪，特性开关 `TOKEN_BUDGET`）、`contentReplacementState`（对超大工具结果做内容替换，控制单条消息体积）、microcompact（按 tool_use_id 做缓存式微压缩）。它们都是"在不打断主干的前提下控制上下文体积"的优化，第 12 讲会专门讲。这里知道"发给模型前，历史会先被裁剪/压缩到合理大小"即可。

</details>

### 3.2 步2 · 调用模型（流式 + 降级）<span class="oas-b oas-core">核心</span>

```ts
    let attemptWithFallback = true
    while (attemptWithFallback) {
      attemptWithFallback = false
      try {
        for await (const message of deps.callModel({
          messages: prependUserContext(messagesForQuery, userContext),  // 把 userContext 拼在最前
          systemPrompt: fullSystemPrompt,
          thinkingConfig: toolUseContext.options.thinkingConfig,
          tools: toolUseContext.options.tools,                          // 告诉模型有哪些工具可用
          signal: toolUseContext.abortController.signal,                // 取消信号
          options: {
            model: currentModel,
            fallbackModel,                                              // 降级模型
            onStreamingFallback: () => { streamingFallbackOccured = true },
            querySource,
            agents: toolUseContext.options.agentDefinitions.activeAgents,
            // ...还有 fastMode、effortValue、taskBudget 等一大堆
          },
        })) {
          // 消费模型流式吐出的每条消息（见步3）
        }
      } catch (error) { /* 错误分类与恢复，见 3.x */ }
    }
```

核心就一句：`deps.callModel({...})` 把"消息历史 + 系统提示 + 可用工具 + 取消信号"发给模型，**流式**地拿回结果。几个要点：

- `deps.callModel`：**依赖注入**。真正发 HTTP 请求的是 `claude.ts` 里的 API 客户端（第 16 讲），这里通过 `deps` 注入——好处是测试时可以替换成假的模型。
- `prependUserContext(messagesForQuery, userContext)`：把用户上下文拼到消息最前面。
- `tools: ...options.tools`：**把工具列表告诉模型**——模型正是据此决定"我要调用哪个工具"。这条线连回第 02 讲的工具池。
- `fallbackModel` + `onStreamingFallback`：主模型不可用时**自动降级**到备用模型，并记一个标记。
- 外层 `while (attemptWithFallback)`：降级是通过"再试一次"实现的。

<details class="oas-fold">
<summary>步2 的降级善后：tombstone 清理（为什么要墓碑）<span class="oas-b oas-skim">可跳读</span></summary>

如果流式过程中发生了降级（`streamingFallbackOccured`），已经收到的那部分 assistant 消息要作废——代码给它们逐条 `yield {type:'tombstone', message}`，然后清空 `assistantMessages / toolResults / toolUseBlocks`。注释解释：这些半截消息（尤其 thinking 块）签名无效，留着会触发 "thinking blocks cannot be modified" 的 API 错误。墓碑消息让 UI 和 transcript 把它们删掉。这是流式 + 降级组合下的健壮性处理。

</details>

### 3.3 步3 · 收集 assistant 消息与 tool_use 块 <span class="oas-b oas-key">重点</span>

模型流式返回时，循环把内容收集起来：

- `assistantMessages`：模型这一轮产出的 assistant 消息（含 text / thinking / tool_use 块）。
- `toolUseBlocks`：从中抽出的 **tool_use 块**——即"模型决定要调用的工具 + 参数"。
- 每条 assistant 消息也会被 `yield` 出去（于是第 03 讲段5 的 `case 'assistant'` 收到它、push 进历史、转发给用户）。

判断"还要不要继续"的关键，就是看这一轮**有没有 tool_use 块**。

### 3.4 步4 · 没有工具调用 → 收工 <span class="oas-b oas-core">核心</span>

如果模型这轮没要任何工具（`toolUseBlocks` 为空 / `needsFollowUp` 为假），说明它认为任务完成了：

```ts
      // （在流式处理结束后的判断里）
      return { reason: 'completed' }
```

直接 `return` 一个终止对象 `{reason: 'completed'}`，`while(true)` 结束。**这就是 Agent"知道自己干完了"的时刻**——不是谁喊停，而是模型不再请求工具、只给了最终文本。

### 3.5 步5 · 有工具调用 → 执行 <span class="oas-b oas-core">核心</span>

有 tool_use 块，就执行它们：

```ts
    const toolResults: (UserMessage | AttachmentMessage)[] = []

    const toolUpdates = streamingToolExecutor
      ? streamingToolExecutor.getRemainingResults()
      : runTools(toolUseBlocks, assistantMessages, canUseTool, toolUseContext)

    for await (const update of toolUpdates) {
      if (update.message) {
        yield update.message                         // 把工具进度/结果事件吐出去
        toolResults.push(
          ...normalizeMessagesForAPI([update.message], toolUseContext.options.tools)
            .filter(_ => _.type === 'user'),         // 只收 user 类型（即 tool_result）
        )
      }
      if (update.newContext) {
        updatedToolUseContext = { ...update.newContext, queryTracking }   // 工具可能更新上下文
      }
    }
```

- `runTools(toolUseBlocks, assistantMessages, canUseTool, toolUseContext)`：**执行这一批工具**。注意它收到了 `canUseTool`——也就是说，**权限判定发生在工具执行这一步**（每个工具执行前问一次 canUseTool）。
- `for await (const update of toolUpdates)`：工具执行是流式的，边执行边吐 `update`。每个 update 的 `message` 被 `yield` 出去（第 03 讲段5 的 progress / user / attachment 分支接收），并把其中的 tool_result（user 类型）收进 `toolResults`。
- `update.newContext`：工具执行可能**改变上下文**（比如切换工作目录、进入 plan 模式），这里更新。

<div class="oas-key-note"><code>runTools</code> 内部还有一个关键设计——<strong>只读工具并发执行、写操作串行执行</strong>（Read/Glob/Grep 可以同时跑，Edit/Write/Bash 要排队）。这块逻辑在 <code>services/tools/toolExecution.ts</code>，是后续工具讲的内容。本讲只需记住：tool_use 块 → runTools（带权限判定 + 并发/串行调度）→ 产出 tool_result，收进 toolResults。</div>

### 3.6 步6 · maxTurns 检查 <span class="oas-b oas-key">重点</span>

工具执行完、准备进入下一轮前，检查回合上限：

```ts
    // nextTurnCount = turnCount + 1
    if (maxTurns && nextTurnCount > maxTurns) {
      yield createAttachmentMessage({
        type: 'max_turns_reached',
        maxTurns,
        turnCount: nextTurnCount,
      })
      return { reason: 'max_turns', turnCount: nextTurnCount }
    }
```

如果设了 `maxTurns` 且下一轮会超出，就 **yield 一条 `max_turns_reached` 的 attachment 消息**，然后 `return {reason:'max_turns'}` 结束循环。

<div class="oas-key-note"><strong>第 03 讲的伏笔在这里兑现</strong>：第 03 讲段6"闸一"收到的那条 <code>attachment.type === 'max_turns_reached'</code>，就是这里 yield 出去的。两讲在这条消息上接上了头——内层负责"发现回合到顶并发信号"，外层负责"把信号翻译成 error_max_turns 的 result"。<strong>这就是分层的妙处：判定与表达分离。</strong></div>

### 3.7 步7 · 组装下一轮状态 → 继续 <span class="oas-b oas-core">核心</span>

没触发任何终止，就组装新 state 进入下一轮：

```ts
    const next: State = {
      messages: [...messagesForQuery, ...assistantMessages, ...toolResults],   // ★ 关键
      toolUseContext: toolUseContextWithQueryTracking,
      turnCount: nextTurnCount,
      // ...其余重置...
      transition: { reason: 'next_turn' },
    }
    state = next
  } // while (true)
```

<div class="oas-key-note"><strong>整个回合循环最关键的一行</strong>：<br><code>messages: [...messagesForQuery, ...assistantMessages, ...toolResults]</code><br>下一轮要发给模型的历史 = <strong>本轮发的消息 + 模型的回答 + 工具的结果</strong>。这就是"工具结果回灌"的字面实现——把工具产出拼回历史，模型下一轮就能"看到"工具返回了什么，从而决定下一步。<strong>Agent 能逐步推进，靠的就是这一行把每轮的产出累积回上下文。</strong>然后 <code>state = next</code>，<code>while(true)</code> 转下一圈。</div>

## 第 4 章 · Terminal：循环靠什么停 <span class="oas-b oas-key">重点</span>
<a id="ch4"></a>

`queryLoop` 每条退出路径都 `return` 一个 `{reason: ...}` 的 Terminal。把全集收齐（从源码各 return 点摘出）：

| reason | 触发 | 性质 |
| --- | --- | --- |
| `completed` | 模型不再要工具，正常收工 | ✅ 成功 |
| `max_turns` | 回合数超过 maxTurns | ⛔ 闸 |
| `prompt_too_long` | 上下文太长且无法再压缩 | ⛔ 错误 |
| `blocking_limit` | 触达硬性阻塞上限 | ⛔ 错误 |
| `model_error` | 模型调用出错 | ⛔ 错误 |
| `image_error` | 图像处理失败 | ⛔ 错误 |
| `aborted_streaming` / `aborted_tools` | 流式中 / 工具执行中被取消 | ⛔ 取消 |
| `stop_hook_prevented` / `hook_stopped` | 被 Stop 钩子拦下 | ⛔ 钩子 |

<div class="oas-note">这些 reason 是引擎内部的"为什么停"，会被外层 submitMessage（第 03 讲）翻译成对外的 5 种 result subtype。比如 <code>completed</code> → <code>success</code>，<code>max_turns</code> → <code>error_max_turns</code>。内层说"因为什么停"，外层说"对用户算什么结果"。</div>

## 第 5 章 · 把三讲串成一条线 <span class="oas-b oas-skim">小结</span>
<a id="ch5"></a>

到这里，02→03→04 三讲终于拼成完整的一条执行链。用一次 `agent.prompt('改个 bug')` 走一遍：

```text
agent.prompt(text)
  → agent.query(text)              [02] 把配置翻译成 ask() 参数
    → ask({...})                   [03] new QueryEngine + submitMessage
      → submitMessage()            [03] 装提示 → yield system_init → 消息泵
        → query() / queryLoop()    [04] while(true) 回合循环：
            回合1: callModel → 模型说"用 Read 看 auth.ts" (tool_use)
                   runTools 执行 Read → tool_result 回灌
            回合2: callModel → 模型说"用 Edit 改第 12 行" (tool_use)
                   runTools 执行 Edit → tool_result 回灌
            回合3: callModel → 模型说"改好了"(纯 text, 无 tool_use)
                   → return {reason:'completed'}
        ← 消息泵收齐事件，yield result {subtype:'success'}
  ← prompt() 把流收成 QueryResult
```

<div class="oas-key-note">这条链就是这门课前四讲的总成果。<strong>你现在能完整回答"一句话指令是怎么变成一系列文件改动的"</strong>：门面翻译配置 → 编排层装配并驱动 → 回合循环让模型和工具交替推进 → 直到模型说"完成"。剩下的讲，都是把这条链上的某个零件（工具、权限、提示、压缩、记忆、MCP、多 Agent、API 客户端）拆开看实现。</div>

## 第 6 章 · demo + 重要性盘点 + 下一讲预告 <span class="oas-b oas-skim">收尾</span>
<a id="ch6"></a>

### 6.1 demo：数一次任务用了几个回合

回合数（num_turns）就是 `while(true)` 转了几圈。用第 00 讲的 examples/02（多工具任务）观察：

```ts
const result = await agent.prompt(
  'Glob 找出 src/*.ts，再用 Bash 统计 src/agent.ts 行数，最后总结。'
)
console.log('回合数 num_turns =', result.num_turns)
```

预期：`num_turns` 大概是 3–4。把它和事件流对照：每出现一次 "assistant(tool_use) → user(tool_result)" 就是一圈 while。模型每多用一个工具，循环就多转一圈，`num_turns` 就 +1——这正是第 3 章步7 那行 `nextTurnCount` 在累加。

<div class="oas-note">想验证 maxTurns 闸：把 <code>createAgent({maxTurns: 1})</code> 设成 1，再跑上面的多步任务，你会拿到 <code>result.subtype === 'error_max_turns'</code>——因为一步根本做不完。这就把第 3 章步6 和第 03 讲闸一连起来亲眼看到了。</div>

### 6.2 重要性盘点

| 段落 | 重要性 | 一句话 |
| --- | --- | --- |
| 步7 messages 回灌（那一行）| <span class="oas-b oas-core">核心</span> | Agent 能逐步推进的根因 |
| 步2 callModel + 步5 runTools | <span class="oas-b oas-core">核心</span> | 回合的两个动作：问模型、跑工具 |
| 步4 completed 收工判定 | <span class="oas-b oas-core">核心</span> | 模型自己决定"干完了" |
| State 状态机 + Terminal | <span class="oas-b oas-key">重点</span> | 跨轮状态怎么传、循环怎么停 |
| 步6 maxTurns（接 03 闸一）| <span class="oas-b oas-key">重点</span> | 判定与表达分离 |
| 压缩/预算/降级/墓碑分支 | <span class="oas-b oas-skim">可跳读</span> | 工程健壮性，后续专讲 |

### 6.3 下一讲预告

<div class="oas-key-note"><strong>第 05 讲</strong>：从"循环怎么转"转向"工具是什么"。我们读 <code>src/tools.ts</code> 与 <code>Tool</code> 接口——一个工具到底要实现哪些方法（<code>call / inputSchema / isReadOnly / isConcurrencySafe / mapToolResultToToolResultBlockParam</code> 等），<code>getAllBaseTools / assembleToolPool / filterToolsByDenyRules</code> 如何把内置工具、自定义工具、MCP 工具组装成一个池子。读完它，你就能照着接口写出自己的工具（呼应第 00 讲 examples/07），也为后面逐个拆 Read/Bash/Grep 打好地基。</div>

> 上一讲：[第03讲 · 引擎编排外壳](/2026/06/21/open-agent-sdk-03-query-engine/) ｜ 系列目录：[《Open Agent SDK 源码逐行精讲》总目录](/courses/open-agent-sdk/)
