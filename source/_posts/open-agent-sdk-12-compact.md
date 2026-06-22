---
title: "《Open Agent SDK 源码逐行精讲》第12讲 · 上下文压缩：自动压缩、微压缩与 9 段摘要提示"
date: 2026-06-22 20:00:00
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

> 这是《Open Agent SDK 源码逐行精讲》第12讲。上下文窗口是 Agent 的"工作内存"，超了就必须压缩。这一讲讲清楚三种压缩策略：自动全量压缩、微压缩、以及手动 /compact 的底层机制。

<div class="oas-toc"><strong>本讲导航</strong>

- 第 1 章 · 全景：三种压缩策略的分工
- 第 2 章 · 阈值计算：上下文窗口的"水位线"
- 第 3 章 · `autoCompactIfNeeded()`：自动触发流程
- 第 4 章 · `compactConversation()`：LLM 摘要的完整过程
- 第 5 章 · 9 段摘要提示：`BASE_COMPACT_PROMPT`
- 第 6 章 · 压缩后恢复：文件、计划与技能重注入
- 第 7 章 · `microCompact`：零 API 开销的内存截断

</div>

## 第 1 章 · 全景：三种压缩策略的分工

| 策略 | 触发方式 | 是否调 API | 效果 |
|---|---|---|---|
| **autoCompact** | token 数超阈值自动触发 | ✔（调 LLM 生成摘要） | 全量替换——旧对话变成一段摘要文字 |
| **microCompact** | 每轮 query 循环调用 | ✗ | 原地截断——旧工具结果内容清空 |
| **手动 /compact** | 用户输入命令 | ✔ | 同 autoCompact，但可附加自定义指令 |

这三种策略层叠使用：microCompact 是持续的"低水位控制"，autoCompact 是"水位告警自动排水"，手动 /compact 是"人工干预"。

---

## 第 2 章 · 阈值计算：上下文窗口的"水位线" <span class="oas-b oas-key">重点</span>

`autoCompact.ts` 定义了整个 token 水位系统：

```typescript
const MAX_OUTPUT_TOKENS_FOR_SUMMARY = 20_000
// p99.99 的摘要输出是 17,387 token，取整到 20,000

export function getEffectiveContextWindowSize(model: string): number {
  const reservedTokensForSummary = Math.min(
    getMaxOutputTokensForModel(model),
    MAX_OUTPUT_TOKENS_FOR_SUMMARY,
  )
  // 有效窗口 = 模型上下文窗口 - 给摘要输出留的空间
  return contextWindow - reservedTokensForSummary
}

export const AUTOCOMPACT_BUFFER_TOKENS = 13_000
export const WARNING_THRESHOLD_BUFFER_TOKENS = 20_000
export const ERROR_THRESHOLD_BUFFER_TOKENS = 20_000
export const MANUAL_COMPACT_BUFFER_TOKENS = 3_000
```

四条水位线（从低到高）：

```
用量 →
  ├─ autoCompact 阈值 = effectiveContextWindow - 13000   → 自动触发压缩
  ├─ Warning 阈值 = effectiveContextWindow - 20000        → 显示"橙色警告"
  ├─ Error 阈值 = effectiveContextWindow - 20000          → 显示"红色警告"
  └─ 阻塞上限 = effectiveContextWindow - 3000             → 禁止发送，必须先 /compact
```

<div class="oas-note">Warning 和 Error 阈值一样（都是 -20000），两者区别在颜色和措辞，而不在阈值。显示"警告"是为了早提醒用户，显示"错误"是当用量已经逼近阻塞了。</div>

`calculateTokenWarningState()` 返回这些状态，被 UI 用来渲染底部 token 进度条的颜色。

### 特殊环境覆盖

- `CLAUDE_CODE_AUTO_COMPACT_WINDOW` env：强制缩小有效窗口（用于测试）
- `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` env：按百分比设阈值（如 `80` = 80% 时触发）
- `CLAUDE_CODE_BLOCKING_LIMIT_OVERRIDE` env：强制阻塞上限（测试边界情况）

---

## 第 3 章 · `autoCompactIfNeeded()`：自动触发流程 <span class="oas-b oas-core">核心</span>

在 query 回合循环里（每次发给模型前），调用 `shouldAutoCompact()` 检查是否需要压缩：

```typescript
export async function shouldAutoCompact(
  messages: Message[],
  model: string,
  querySource?: QuerySource,
  snipTokensFreed = 0,  // snip 已经释放的 token，避免重复计算
): Promise<boolean> {
  // 四个不能自动压缩的 querySource
  if (querySource === 'session_memory') return false  // 会死锁
  if (querySource === 'compact') return false         // 会死锁
  if (feature('CONTEXT_COLLAPSE') && querySource === 'marble_origami') return false
  if (!isAutoCompactEnabled()) return false

  const tokenCount = tokenCountWithEstimation(messages) - snipTokensFreed
  const threshold = getAutoCompactThreshold(model)
  return tokenCount >= threshold
}
```

触发后执行 `autoCompactIfNeeded()`：

```typescript
// 1. 电路断路器：连续失败 3 次就停止重试
if (tracking?.consecutiveFailures >= MAX_CONSECUTIVE_AUTOCOMPACT_FAILURES) {
  return { wasCompacted: false }
}

// 2. 先尝试 session memory 压缩（更轻量）
const sessionMemoryResult = await trySessionMemoryCompaction(...)
if (sessionMemoryResult) {
  return { wasCompacted: true, compactionResult: sessionMemoryResult }
}

// 3. 回退到全量 LLM 摘要压缩
const compactionResult = await compactConversation(messages, ...)
```

**电路断路器**：记录连续失败次数 `consecutiveFailures`，达到 3 次后跳过后续所有自动压缩尝试。防止"context 不可恢复地超限"时每轮都白费一次失败的压缩 API 调用（BQ 数据显示曾有会话连续失败 3272 次，浪费 25 万次/天的 API 调用）。

---

## 第 4 章 · `compactConversation()`：LLM 摘要的完整过程 <span class="oas-b oas-core">核心</span>

这是核心函数（`compact.ts` 最长的函数）。

### 预处理

```typescript
// 剥除图片和文档（替换为 [image] / [document] 标记）
// 防止压缩请求本身打到 prompt-too-long
const strippedMessages = stripImagesFromMessages(messages)
const cleanMessages = stripReinjectedAttachments(strippedMessages)
```

图片不需要进摘要——摘要是文字性的。但保留 `[image]` 标记让摘要知道"那里曾有一张图"。

### Fork Agent 执行压缩

```typescript
// runForkedAgent 开一个独立的 Agent 实例（共享缓存，独立消息流）
const summary = await runForkedAgent({
  messages: cleanMessages,
  systemPrompt: asSystemPrompt(getCompactPrompt()),
  maxTurns: 1,               // 只允许一轮——不能调工具，只能输出文字
  tools: enabledTools,        // 继承父 Agent 工具集（共享 prompt cache key）
  suppressUserQuestions: true,
  isAutoCompact,
})
```

`maxTurns: 1` + `NO_TOOLS_PREAMBLE`（提示里明确说"不要调工具，调了会被拒绝，你就失败了"）双重保险，防止 Fork Agent 在生成摘要时跑去调工具。

### PTL (Prompt Too Long) 重试

如果压缩请求本身也打到了 prompt-too-long：

```typescript
const MAX_PTL_RETRIES = 3
// 掉落最老的 API round group，直到 tokenGap 被填满
// 如果 gap 不可解析，丢弃 20% 的 group
messages = truncateHeadForPTLRetry(messages, ptlResponse)
// 最多重试 3 次
```

### 压缩后的消息结构

成功后，旧消息被替换成：

```
[SystemCompactBoundaryMessage]          ← 压缩边界标记
[UserMessage] {isCompactSummary: true}  ← 包含摘要文字
```

`getMessagesAfterCompactBoundary()` 用边界标记找到压缩点，后续查询只需从这里往后读。

---

## 第 5 章 · 9 段摘要提示：`BASE_COMPACT_PROMPT` <span class="oas-b oas-key">重点</span>

`prompt.ts` 里的 `BASE_COMPACT_PROMPT` 是压缩摘要的"蓝图"，规定了 9 个必须覆盖的段落：

```
1. Primary Request and Intent      用户的所有明确请求（详细）
2. Key Technical Concepts          涉及的技术概念、框架
3. Files and Code Sections         读过/改过/创建的文件（含代码片段）
4. Errors and fixes                遇到的错误和修复方式（含用户反馈）
5. Problem Solving                 解决的问题和正在调试的内容
6. All user messages               ALL 用户消息（不含 tool_result）
7. Pending Tasks                   明确被要求但未完成的任务
8. Current Work                    压缩前正在做什么（最详细，含文件名和代码）
9. Optional Next Step              下一步（必须直接延续最近的工作）
```

`<analysis>` scratchpad：模型在生成 `<summary>` 前先写 `<analysis>` 整理思路，`formatCompactSummary()` 会在返回前把 `<analysis>` 块剥掉——这是 CoT 草稿，不需要留在压缩结果里。

<div class="oas-key-note">第 9 段"Optional Next Step"要求引用"最近对话的原文直接引语"——这是防止 Agent 在压缩后开始漂移做别的事。压缩后的 Agent 只看见摘要，没有完整历史，直接引语是最可靠的"继续这件事"的锚点。</div>

### 部分压缩（partial compact）

`getPartialCompactPrompt()` 用于只压缩一部分消息（如 `/compact recent`），提示文字改成"分析最近的消息"而不是"整个对话"。

---

## 第 6 章 · 压缩后恢复：文件、计划与技能重注入 <span class="oas-b oas-key">重点</span>

压缩后 Agent 失去了之前读过的文件内容（都在历史消息里，被摘要替换了）。`runPostCompactCleanup()` 做恢复：

```typescript
export const POST_COMPACT_MAX_FILES_TO_RESTORE = 5       // 最多恢复 5 个文件
export const POST_COMPACT_TOKEN_BUDGET = 50_000          // 总预算 50K token
export const POST_COMPACT_MAX_TOKENS_PER_FILE = 5_000    // 每个文件最多 5K token
export const POST_COMPACT_MAX_TOKENS_PER_SKILL = 5_000   // 每个技能文件最多 5K token
export const POST_COMPACT_SKILLS_TOKEN_BUDGET = 25_000   // 技能文件总预算 25K token
```

恢复逻辑：

1. **找最近读过的文件**：扫描压缩前的消息历史，找 FileRead tool_result，按时间倒序取最新的（去重后）
2. **重新注入**：把文件内容重新读进来，作为压缩后第一轮对话的上下文
3. **Plan 文件**：如果有 `.claude/plan.md`，也重注入
4. **Skill 文件**：如果 session 调用过的 skills 有文件，按 `POST_COMPACT_SKILLS_TOKEN_BUDGET` 截断注入

重注入后，Edit 工具需要的 `FILE_UNCHANGED_STUB` 也随之恢复（确保 Edit 的"先读后写"约束不因压缩而失效）。

<div class="oas-note">最多 5 个文件是有意识的取舍：恢复太多文件会用掉大量 token，抵消压缩效果。5 个文件覆盖了 p95 的工作场景（大多数任务同时编辑的文件不超过 5 个）。</div>

---

## 第 7 章 · `microCompact`：零 API 开销的内存截断 <span class="oas-b oas-skim">可跳读</span>

microCompact（`microCompact.ts`，531 行）不调 API，纯内存操作。在每个 query 回合开始时检查，把旧的工具结果内容清空。

### 只压缩这些工具的结果

```typescript
const COMPACTABLE_TOOLS = new Set<string>([
  FILE_READ_TOOL_NAME,      // Read（大文件内容）
  ...SHELL_TOOL_NAMES,      // Bash/PowerShell（命令输出）
  GREP_TOOL_NAME,           // Grep（搜索结果）
  GLOB_TOOL_NAME,           // Glob（文件列表）
  WEB_SEARCH_TOOL_NAME,     // WebSearch（搜索结果）
  WEB_FETCH_TOOL_NAME,      // WebFetch（网页内容）
  FILE_EDIT_TOOL_NAME,      // Edit（diff 输出）
  FILE_WRITE_TOOL_NAME,     // Write（写入确认）
])
```

不在这个列表里的工具（如 Agent、MCP）的结果不会被 microCompact 清除——那些结果通常是 Agent 之间的协作内容，不能截断。

### 时间权重截断

基于"时间权重"决定哪些工具结果可以清空：最旧的、不再重要的 tool_result 被替换为 `'[Old tool result content cleared]'`。图片内容（≤2000 token）会保留——图片一旦清了就没了，无法重新获取。

---

## 小结

```
每轮 query 开始前
  ↓ microCompact()          零 API，就地截断旧工具结果
  
token 超过阈值时
  ↓ autoCompactIfNeeded()
      1. 电路断路器检查（连续失败≥3次 → 跳过）
      2. trySessionMemoryCompaction() (轻量)
      3. compactConversation()
          a. stripImages/stripReinjectedAttachments
          b. runForkedAgent (maxTurns=1, NO_TOOLS_PREAMBLE)
          c. 9段摘要提示 → <analysis>草稿 + <summary>
          d. PTL retry (最多3次)
          e. 压缩结果 → [CompactBoundary][CompactSummary]
          f. runPostCompactCleanup():
               重注入最近5个文件 + plan + skills
```

下一讲（第13讲）：**记忆系统与 autoDream** — 4 类记忆（user/feedback/project/reference）如何分类写入，以及后台 autoDream 怎么在对话结束时异步整理记忆。

> 配套源码：[github.com/Syfyivan/open-agent-sdk](https://github.com/Syfyivan/open-agent-sdk)，本讲对应文件：`src/services/compact/`（4261 行，15 个文件）。
