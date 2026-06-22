---
title: "《Open Agent SDK 源码逐行精讲》第10讲 · 消息系统：12 种消息类型、7 步 API 管道与 Up-arrow 历史"
date: 2026-06-22 16:00:00
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

> 这是《Open Agent SDK 源码逐行精讲》第10讲。上一讲讲了"Agent 被告知了什么"（系统提示），这一讲讲"Agent 说了什么、用户说了什么"——消息系统是整个引擎的血管，把所有交互记录起来，最终打包发给 API。

<div class="oas-toc"><strong>本讲导航</strong>

- 第 1 章 · 两个子系统：history.ts 和 messages.ts 各管什么
- 第 2 章 · history.ts：Up-arrow 记忆（提示历史）
- 第 3 章 · messages.ts：12 种消息类型全集
- 第 4 章 · 合成消息：拒绝、中断、取消的措辞
- 第 5 章 · `normalizeMessages()`：展平多 block 消息
- 第 6 章 · `normalizeMessagesForAPI()`：7 步 API 管道
- 第 7 章 · `buildMessageLookups()`：O(1) 渲染查找表
- 第 8 章 · `ensureToolResultPairing()`：修补孤立 tool_use

</div>

## 第 1 章 · 两个子系统：history.ts 和 messages.ts 各管什么

| 文件 | 行数 | 管什么 |
|---|---|---|
| `src/history.ts` | 464 | **提示历史**（Up-arrow / ctrl+r 的"我之前输过什么"）持久化到磁盘 |
| `src/utils/messages.ts` | 5513 | **会话消息**（这一轮对话里所有 assistant/user/system/progress 消息）构建、规整、发给 API |

两者没有交集：`history.ts` 只存"用户输入过的提示文字"，`messages.ts` 处理"模型和用户之间完整的消息树"。

---

## 第 2 章 · history.ts：Up-arrow 记忆 <span class="oas-b oas-key">重点</span>

### 持久化格式

提示历史存在 `~/.claude/history.jsonl`，每行一个 JSON：

```typescript
type LogEntry = {
  display: string      // 显示给用户的提示文本（Up-arrow 看到的）
  pastedContents: Record<number, StoredPastedContent>  // 粘贴内容
  timestamp: number    // Date.now()
  project: string      // getProjectRoot()
  sessionId?: string   // getSessionId()
}
```

多个 Claude Code 实例（不同终端）共享同一个文件，写入时用 `lockfile` 库拿文件锁（`stale: 10000ms, retries: 3`）防并发破坏。

### 两级粘贴内容存储

用户粘贴的文本在历史中以 `[Pasted text #1 +10 lines]` 引用。保存时：

```typescript
const MAX_PASTED_CONTENT_LENGTH = 1024

// ≤1024 字符 → 内联存进 LogEntry.pastedContents
if (content.content.length <= MAX_PASTED_CONTENT_LENGTH) {
  storedPastedContents[id] = { id, type, content: content.content, ... }
}
// >1024 字符 → 存到 paste store（哈希索引），LogEntry 只存 contentHash
else {
  const hash = hashPastedText(content.content)
  storedPastedContents[id] = { id, type, contentHash: hash, ... }
  void storePastedText(hash, content.content)  // fire-and-forget
}
```

<div class="oas-why">图片不存进历史（`if (content.type === 'image') continue`）——图片体积大，且已有 image-cache 另管。这样 history.jsonl 不会被图片撑爆。</div>

### 两种历史读取器

**Up-arrow 历史** (`getHistory()`)：当前 session 的条目排在最前，然后才是其他 session 的——避免多个终端同时跑 Claude Code 时，Up-arrow 出现其他终端的提示：

```typescript
for await (const entry of makeLogEntryReader()) {
  if (entry.sessionId === currentSession) {
    yield await logEntryToHistoryEntry(entry)  // 当前 session 先出
    yielded++
  } else {
    otherSessionEntries.push(entry)  // 其他 session 攒起来
  }
  if (yielded + otherSessionEntries.length >= MAX_HISTORY_ITEMS) break  // 最多 100 条
}
for (const entry of otherSessionEntries) { yield ... }  // 其他 session 后出
```

**ctrl+r 搜索历史** (`getTimestampedHistory()`)：按 display 去重，只返回每条命令最新的一次，供模糊搜索 picker 展示。

### 异步刷盘 + 最后保障

`addToHistory()` 是**非阻塞的**：调用后立即返回，`pendingEntries` 先存内存，然后 `void flushPromptHistory(0)` 在后台写磁盘（最多重试 5 次）。进程退出时 `registerCleanup()` 确保还没写完的条目强制刷盘。

### `removeLastFromHistory()`：Esc 撤销

按 Esc 恢复中断的对话时，刚加进历史的条目应该删掉（否则 Up-arrow 会看到被撤销的那条）：

```typescript
export function removeLastFromHistory(): void {
  if (!lastAddedEntry) return
  const entry = lastAddedEntry
  lastAddedEntry = null

  const idx = pendingEntries.lastIndexOf(entry)
  if (idx !== -1) {
    pendingEntries.splice(idx, 1)    // 快路径：还在内存里，直接移除
  } else {
    skippedTimestamps.add(entry.timestamp)  // 慢路径：已写磁盘，读取时跳过
  }
}
```

---

## 第 3 章 · messages.ts：12 种消息类型全集 <span class="oas-b oas-core">核心</span>

`messages.ts` 开头 import 了约 30 种消息类型，核心 12 种：

| 类型 | role / type | 发给 API？ | 说明 |
|---|---|---|---|
| `AssistantMessage` | `assistant` | ✔ | 模型输出，含多个 ContentBlock |
| `UserMessage` | `user` | ✔ | 用户输入 / tool_result / 合成消息 |
| `ProgressMessage<P>` | `progress` | ✗ | 工具执行进度，UI 专用 |
| `AttachmentMessage` | `attachment` | ✗ (转换后) | hook 结果附件，最终 smoosh 进 tool_result |
| `SystemMessage` (multiple subtypes) | `system` | ✗ (部分) | 系统事件：api_error / local_command / turn_duration / ... |
| `TombstoneMessage` | - | ✗ | 已删消息占位符（防 UUID 断裂） |

### AssistantMessage 的内部结构

```typescript
type AssistantMessage = {
  type: 'assistant'
  uuid: UUID                   // 内部 UUID（非 API message.id）
  timestamp: string
  message: BetaMessage         // Anthropic SDK 的原始 response
    // message.content: BetaContentBlock[]  ← 可含多个 text/thinking/tool_use
  requestId?: string
  isApiErrorMessage?: true
  isMeta?: true
  isVirtual?: true             // 仅 UI 显示，不发给 API
}
```

`isVirtual` 标记的消息永远不进 API payload——它们是 REPL 内嵌工具调用（如 Plan Mode 内部 Agent）的展示消息。

---

## 第 4 章 · 合成消息：拒绝、中断、取消的措辞 <span class="oas-b oas-key">重点</span>

模型不知道用户"按了 Esc"或"点了拒绝"，只能通过 tool_result 里的文字来理解。`messages.ts` 集中定义了所有这些文字：

```typescript
// 用户中断（Esc 键，在文本生成中途）
INTERRUPT_MESSAGE = '[Request interrupted by user]'

// 用户中断（Esc 键，在 tool_use 审批中途）
INTERRUPT_MESSAGE_FOR_TOOL_USE = '[Request interrupted by user for tool use]'

// 用户说"取消这个工具调用"
CANCEL_MESSAGE = "The user doesn't want to take this action right now. STOP..."

// 用户说"拒绝这个工具调用"（文件没写入）
REJECT_MESSAGE = "The user doesn't want to proceed with this tool use..."

// 权限系统 auto-reject（无人审批模式）
AUTO_REJECT_MESSAGE = (toolName) =>
  `Permission to use ${toolName} has been denied. ${DENIAL_WORKAROUND_GUIDANCE}`
```

`DENIAL_WORKAROUND_GUIDANCE` 是一段提示："你可以尝试用其他工具实现目标，但不要通过非正常途径绕过限制；如果此能力对完成任务是必须的，请停下来告诉用户。"

<div class="oas-key-note">这些措辞设计经过反复调优：不能说"权限不足"（模型可能反复重试），也不能说"不允许"（太简短，模型不知道应该告诉用户还是换方法）。DENY + WORKAROUND GUIDANCE 的组合是当前经过 A/B 验证的最优措辞。</div>

### AI 分类器拒绝消息

当 auto 模式下 AI 分类器（Haiku）判断为危险命令时，会触发特殊的 `buildYoloRejectionMessage(reason)`：

```typescript
const prefix = 'Permission for this action has been denied. Reason: '
return `${prefix}${reason}. ` +
  `If you have other tasks that don't depend on this action, continue working on those. ` +
  `${DENIAL_WORKAROUND_GUIDANCE} ` +
  `To allow this type of action in the future, the user can add a Bash permission rule...`
```

`isClassifierDenial(content)` 靠 `content.startsWith(prefix)` 判断，UI 据此渲染简短摘要而不是全文。

---

## 第 5 章 · `normalizeMessages()`：展平多 block 消息 <span class="oas-b oas-key">重点</span>

模型一次输出可能含多个 ContentBlock（text + tool_use + thinking）。Anthropic API 允许一个 `message` 携带多个 block，但 UI 渲染需要"每个 block 独占一个消息槽"来正确显示（每个 tool_use 单独显示进度）。

`normalizeMessages()` 做的就是这个展平：

```typescript
export function normalizeMessages(messages: Message[]): NormalizedMessage[] {
  let isNewChain = false
  return messages.flatMap(message => {
    switch (message.type) {
      case 'assistant': {
        isNewChain = isNewChain || message.message.content.length > 1
        return message.message.content.map((block, index) => {
          const uuid = isNewChain
            ? deriveUUID(message.uuid, index)  // 派生 UUID，保证稳定性
            : message.uuid
          return {
            ...message,
            message: { ...message.message, content: [block] },  // 单 block
            uuid,
          }
        })
      }
      // progress / attachment / system → 原样返回（已经是单 block）
    }
  })
}
```

**`isNewChain` 标志**：一旦遇到多 block 消息，后续所有消息都用派生 UUID，防止 UUID 冲突（原始 UUID 只能用于第一个 block）。

**`deriveUUID(parentUUID, index)`**：确定性派生：

```typescript
const hex = index.toString(16).padStart(12, '0')
return `${parentUUID.slice(0, 24)}${hex}` as UUID
// 父 UUID 前 24 位 + 12 位索引 = 36 位，形状不变
```

同一次对话里同样的输入总是派生出相同的 UUID，保证 React key 稳定，不会触发不必要的重渲。

---

## 第 6 章 · `normalizeMessagesForAPI()`：7 步 API 管道 <span class="oas-b oas-core">核心</span>

这是 messages.ts 最复杂的函数（从 L1990 开始）。每轮发送请求前都要跑一遍，把内部的 `Message[]` 转成 Anthropic API 接受的格式。

### 7 步管道

```
输入: Message[] (含 progress/attachment/system/virtual 等内部类型)
  ↓
① reorderAttachmentsForAPI()       从下往上扫，把 attachment 冒泡
                                    直到碰到 tool_result 或 assistant 消息
  ↓
② filter(m => !m.isVirtual)        剔除仅展示的虚拟消息
  ↓
③ filter(progress / non-local-cmd system) 剔除 progress 和非 local_command 的 system
  ↓
④ 逐消息处理：
    system(local_command) → 包成 UserMessage
    user → stripToolReferenceBlocks (tool search 禁用时)
         → stripDocumentImageBlocks (PDF/图片报错后)
         → 插入 TOOL_REFERENCE_TURN_BOUNDARY sibling (tool_ref 边界)
    assistant → normalizeToolInputForAPI (统一 input 格式)
    mergeUserMessages() (合并相邻 user 消息，Bedrock 兼容)
  ↓
⑤ smooshSystemReminderSiblings()   把 <system-reminder> 文本
                                    收进最后一个 tool_result 的 content
  ↓
⑥ sanitizeErrorToolResultContent() is_error 的 tool_result 只能含 text
                                    (API 强制要求)
  ↓
⑦ relocateToolReferenceSiblings()  (feature gate) tool_reference 消息的
    + appendMessageTagToUserMessage  text 兄弟节点移走；追加 [id:xxx] 标签
输出: (UserMessage | AssistantMessage)[]  ← 可直接作 API payload
```

### 关键步骤详解

**`mergeUserMessages(a, b)`**：合并两条相邻 UserMessage 的 content，处理 string 和 ContentBlockParam[] 两种形式，保留两者的 imagePasteIds 合并。Bedrock API 不支持连续两条 user 消息，这步是兼容层。

**`smooshSystemReminderSiblings()`**：hook 的 `additionalContext` 是 `<system-reminder>` 包裹的文本，它可能作为 text 兄弟和同一条 user 消息里的 tool_result 并列。API 需要把它们合并进 tool_result.content 里，因为 API 不允许 user 消息里出现 text + tool_result 并列的情况。

**`appendMessageTagToUserMessage()`**：每条 user 消息的最后一个 text block 后追加 `\n[id:abc123]`（6 位 base36 ID）。这让模型在引用历史消息时（用 Snip 工具）能用短 ID 而不是完整 UUID。

<div class="oas-note"><code>deriveShortMessageId(uuid)</code> 取 UUID 前 10 位 hex，转成 base36，取前 6 位。同一 UUID 总是给出同一短 ID——稳定、可重复，适合放进长上下文里引用。</div>

---

## 第 7 章 · `buildMessageLookups()`：O(1) 渲染查找表 <span class="oas-b oas-skim">可跳读</span>

UI 渲染每条消息时，需要知道：这个 tool_use 有没有 tool_result？这条消息有几个 hook 在运行？sibling tool_use 有哪些？

朴素实现是每次都全量扫描（O(n²)）。大型对话里这会卡渲染。`buildMessageLookups()` 用两趟扫描预计算全部查找表：

```typescript
export type MessageLookups = {
  siblingToolUseIDs: Map<string, Set<string>>         // tool_use_id → 同一 assistant 消息中的兄弟 tool_use_id
  progressMessagesByToolUseID: Map<string, ProgressMessage[]>  // tool_use_id → 进度消息列表
  inProgressHookCounts: Map<string, Map<HookEvent, number>>    // 正在跑的 hook 数
  resolvedHookCounts: Map<string, Map<HookEvent, number>>      // 已完成的 hook 数（按 hookName 去重）
  toolResultByToolUseID: Map<string, NormalizedMessage>         // tool_use_id → 对应的 tool_result 消息
  toolUseByToolUseID: Map<string, ToolUseBlockParam>           // tool_use_id → 工具调用 block
  normalizedMessageCount: number                               // 消息总数（截断指示器用）
  resolvedToolUseIDs: Set<string>                              // 已有 result 的 tool_use_id
  erroredToolUseIDs: Set<string>                               // result 是错误的 tool_use_id
}
```

第一趟扫 `messages`（未展平）建 sibling 关系；第二趟扫 `normalizedMessages` 建其余查找。每次渲染调用一次 `buildMessageLookups()`，然后给每个消息组件传 lookup 句柄，组件内 O(1) 查询。

还有一个"孤儿 server_tool_use 标记"逻辑：如果一个 `server_tool_use` block 不在 `resolvedToolUseIDs` 里，且它不是 last 消息里的（可能还在流式中），就把它标成 errored——让 UI 展示失败图标而不是无限 spinner。

---

## 第 8 章 · `ensureToolResultPairing()`：修补孤立 tool_use <span class="oas-b oas-key">重点</span>

Anthropic API 要求：每个 `tool_use` block 必须有一个配对的 `tool_result`，否则 400 报错。在中断、对话恢复、Esc 恢复等场景下，配对可能缺失。`ensureToolResultPairing()` 专门修补：

```typescript
// L5134
export function ensureToolResultPairing(
  messages: (UserMessage | AssistantMessage)[],
  strict: boolean,
): (UserMessage | AssistantMessage)[]
```

它遍历所有 assistant 消息里的 tool_use block，检查后面有没有对应的 tool_result。找不到就插入合成 tool_result：

```typescript
// content = SYNTHETIC_TOOL_RESULT_PLACEHOLDER
// = '[Tool result missing due to internal error]'
```

这个 placeholder 文字被导出并在 HFI（Human Feedback Integration）提交时检查——如果 payload 包含这个字符串，说明该对话有内部错误，不能作为训练数据提交。

`strict` 模式会在检测到不匹配时打一条 error 日志（帮 ant 内部人员发现问题），但不抛异常——对话必须继续。

---

## 小结

```
用户输入
  ↓ addToHistory()
~/.claude/history.jsonl (Up-arrow 持久化)
  
用户输入 + 工具结果 + 模型输出
  ↓ 以 Message[] 形式积累
createAssistantMessage() / createUserMessage() / createProgressMessage()
  
每轮发送前
  ↓ normalizeMessagesForAPI()   7 步管道
(UserMessage | AssistantMessage)[]
  ↓ ensureToolResultPairing()  修补孤立 tool_use
  ↓ 发给 Anthropic API
  
UI 渲染时
  ↓ normalizeMessages()          展平多 block
  ↓ reorderMessagesInUI()        tool_use → hooks → result 排序
  ↓ buildMessageLookups()        一次扫描，O(1) 查关系
各消息组件
```

下一讲（第11讲）：**权限系统 4 层管道** — 规则 → low-risk 跳过 → AI 分类器 → 熔断，彻底拆清楚"Agent 凭什么能/不能做一件事"。

> 配套源码：[github.com/Syfyivan/open-agent-sdk](https://github.com/Syfyivan/open-agent-sdk)，本讲对应文件：`src/history.ts`、`src/utils/messages.ts`（5513 行地基）。
