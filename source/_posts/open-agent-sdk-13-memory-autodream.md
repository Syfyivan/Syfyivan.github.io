---
title: "【Open Agent SDK 源码精讲·第13讲】记忆系统与 autoDream：跨会话的知识沉淀机制"
date: 2026-06-22
tags:
  - Open Agent SDK
  - Claude Code
  - 源码精讲
  - 记忆系统
  - AI Agent
categories:
  - 技术深潜
series: open-agent-sdk
---

> **系列导航** → [课程目录](/courses/open-agent-sdk/) · 上一讲：[第12讲·上下文压缩](/2026/06/21/open-agent-sdk-12-compact/)

---

## 引言：Agent 凭什么"记得你"

你有没有注意到，每次打开 Claude Code，它好像知道你上周让它别再总结 diff，知道你在做哪个项目，知道你偏好哪种代码风格？

这不是模型权重里的魔法，而是一套精心设计的**文件系统记忆**——跨会话保存、按需注入、后台整理。

本讲拆解的代码在 `src/memdir/` + `src/services/autoDream/` 两个目录：

| 文件 | 行数 | 职责 |
|------|------|------|
| `memoryTypes.ts` | 271 | 4种记忆类型的系统提示文本 |
| `memdir.ts` | 507 | 记忆目录的读取与提示构建 |
| `paths.ts` | 278 | 记忆路径解析（带安全校验） |
| `autoDream/autoDream.ts` | 325 | 后台整合 Agent 的调度与执行 |

---

## 第一节：4种记忆类型的设计

### 1.1 分类体系

`memoryTypes.ts` 定义了 Claude Code 识别的4种记忆类型：

```typescript
// memoryTypes.ts
export const MEMORY_TYPES = ['user', 'feedback', 'project', 'reference'] as const
export type MemoryType = (typeof MEMORY_TYPES)[number]
```

| 类型 | 语义 | 默认可见性 | 典型内容 |
|------|------|-----------|---------|
| `user` | 关于用户身份的事实 | 永远私有 | 职级、技术栈、语言偏好 |
| `feedback` | 用户纠正/确认过的行为准则 | 默认私有 | "别加注释"、"用 bun 不用 npm" |
| `project` | 进行中工作的上下文 | 偏向团队 | 截止日、事故、项目决策 |
| `reference` | 外部系统的入口指针 | 通常团队 | Grafana 链接、Linear 项目名 |

这4种分类不只是给 Claude 看的——在团队记忆（TEAMMEM）模式下，每种类型都有不同的同步策略（下文展开）。

### 1.2 保存时机 vs. 不保存什么

系统提示里有两个关键约束块，直接决定 Claude 的行为边界：

```typescript
// memoryTypes.ts — WHAT_NOT_TO_SAVE_SECTION
export const WHAT_NOT_TO_SAVE_SECTION = [
  '## What NOT to save in memory',
  '',
  '- Code patterns, conventions, architecture, file paths, or project structure',
  '- Git history, recent changes, or who-changed-what',
  '- Debugging solutions or fix recipes — the fix is in the code; the commit message has the context.',
  '- Anything already documented in CLAUDE.md files.',
  '- Ephemeral task details: in-progress work, temporary state, current conversation context.',
]
```

**设计原因**：这些信息要么已经在代码本身（可以 grep），要么在 git 历史（可以 blame），要么在 CLAUDE.md（优先级更高），存到记忆里只会制造噪音和时效性风险。

---

## 第二节：记忆路径解析（paths.ts）

### 2.1 路径决策树

```
isAutoMemoryEnabled()?
  ├── CLAUDE_CODE_AUTO_MEMORY_PATH (env override)
  ├── settings.autoMemoryPath (用户配置)
  └── ~/.claude/projects/<sanitized-git-root>/memory/  ← 默认
```

核心实现（记忆化，只算一次）：

```typescript
// paths.ts
export const getAutoMemPath = memoize((): string => {
  const envOverride = process.env.CLAUDE_CODE_AUTO_MEMORY_PATH
  if (envOverride) return path.resolve(envOverride)

  const settingsPath = getInitialSettings().autoMemoryPath
  if (settingsPath) return path.resolve(settingsPath)

  // 默认：把 git root 路径净化后作为目录名
  const gitRoot = getOriginalCwd()
  const sanitized = sanitizePath(gitRoot)   // 替换 / 为 -
  return path.join(os.homedir(), '.claude', 'projects', sanitized, 'memory')
})
```

### 2.2 安全校验：isAutoMemPath()

```typescript
// paths.ts
export function isAutoMemPath(filePath: string): boolean {
  const memBase = getAutoMemPath()
  // normalize 防止 ../../../etc/passwd 类路径穿越
  const normalized = path.normalize(filePath)
  return normalized.startsWith(memBase + path.sep) ||
    normalized === memBase
}
```

这个函数在 autoDream 运行时用来约束 Agent 的写权限——只有路径通过这个检查才允许写入。

---

## 第三节：记忆提示构建（memdir.ts）

### 3.1 MEMORY.md 的限制

```typescript
// memdir.ts
export const ENTRYPOINT_NAME = 'MEMORY.md'
export const MAX_ENTRYPOINT_LINES = 200    // 超过此行数截断
export const MAX_ENTRYPOINT_BYTES = 25000  // 超过此字节数截断
```

**为什么要限制？** MEMORY.md 在每次会话启动时自动注入到系统提示。如果无限增长，会挤压真正的对话空间，还会推高缓存重建成本。

200行 / 25KB 是一个权衡点：足够存几十条索引条目，又不会让系统提示膨胀失控。

### 3.2 buildMemoryLines() 的组装逻辑

```typescript
// memdir.ts (简化版)
function buildMemoryLines(
  label: string,
  memoryDir: string,
  extraGuidelines?: string[],
  skipIndex?: boolean,
): string[] {
  const lines: string[] = []

  // 注入 4 种类型的说明
  lines.push(...TYPES_SECTION_INDIVIDUAL)

  // 注入 WHAT_NOT_TO_SAVE 约束
  lines.push(...WHAT_NOT_TO_SAVE_SECTION)

  // 注入 MEMORY.md 内容（截断到限制）
  if (!skipIndex) {
    const entrypointPath = path.join(memoryDir, ENTRYPOINT_NAME)
    const content = truncateEntrypointContent(
      fs.readFileSync(entrypointPath, 'utf8'),
    )
    lines.push(`## ${ENTRYPOINT_NAME}`, content)
  }

  // 注入搜索指南（如果 feature flag 开启）
  lines.push(...buildSearchingPastContextSection(memoryDir))

  return lines
}
```

### 3.3 团队记忆模式：TYPES_SECTION_COMBINED

```typescript
// memoryTypes.ts — 团队模式下的类型说明，带作用域标签
export const TYPES_SECTION_COMBINED = [
  // ...
  '- **user** — Always **private**. Personal preferences and role-specific context.',
  '- **feedback** — Default **private**. Behavioral corrections and confirmations.',
  '- **project** — Bias toward **team**. Project facts, decisions, and deadlines.',
  '- **reference** — Usually **team**. Pointers to external systems.',
]
```

团队模式下，`project` 和 `reference` 类型的记忆会通过 team 目录同步给其他团队成员。

### 3.4 KAIROS 模式：换一种写入范式

```typescript
// memdir.ts
if (feature('KAIROS') && autoEnabled && getKairosActive()) {
  return buildAssistantDailyLogPrompt(skipIndex)
}
```

KAIROS 是一个实验性功能，把记忆范式从「编辑 MEMORY.md 索引」切换为「追加今日日志」：

- 普通模式：Claude 直接读写 `MEMORY.md` + 各主题文件
- KAIROS 模式：Claude 只往当天的日志文件追加记录，`MEMORY.md` 由 autoDream 夜间整理

这两种模式**不能并存**（KAIROS 优先，且与团队记忆不兼容）。

---

## 第四节：autoDream——后台整合 Agent

### 4.1 什么是 autoDream

autoDream 是一个在对话结束后自动触发的**后台子 Agent**，专门做记忆整合：

1. 读取最近几个 session 的 transcript
2. 提取值得沉淀的信息
3. 更新 `MEMORY.md` 和各主题记忆文件

用户在前台和 Claude 聊天，autoDream 在后台悄悄帮你整理"笔记"。

### 4.2 三重门控

```typescript
// autoDream.ts
export function initAutoDream(): void {
  let lastSessionScanAt = 0

  runner = async function runAutoDream(context, appendSystemMessage) {
    const force = isForced()
    if (!force && !isGateOpen()) return   // 门控1：基础开关

    // --- 时间门 ---
    const hoursSince = (Date.now() - lastAt) / 3_600_000
    if (!force && hoursSince < cfg.minHours) return   // 门控2：≥24小时

    // --- 扫描节流 ---
    const sinceScanMs = Date.now() - lastSessionScanAt
    if (!force && sinceScanMs < SESSION_SCAN_INTERVAL_MS) return   // 每10分钟最多扫描一次

    // --- Session 数门 ---
    const sessionIds = await listSessionsTouchedSince(lastAt)
    // 排除当前 session（它的 mtime 永远是最近的）
    const filtered = sessionIds.filter(id => id !== getSessionId())
    if (!force && filtered.length < cfg.minSessions) return   // 门控3：≥5个session
```

三重门控的设计思路：

| 门控 | 默认值 | 目的 |
|------|--------|------|
| 时间门 | minHours = 24 | 避免每次对话都触发，一天最多一次 |
| 扫描节流 | 10分钟 | 避免一次会话内反复过时间门检查 |
| Session 数 | minSessions = 5 | 积累足够的新信息再整合，避免空转 |

### 4.3 排他锁机制

```typescript
// autoDream.ts
let priorMtime: number | null
if (force) {
  priorMtime = lastAt   // force 模式跳过锁获取
} else {
  priorMtime = await tryAcquireConsolidationLock()
  if (priorMtime === null) return   // 已有其他实例在运行
}
```

`tryAcquireConsolidationLock()` 用一个锁文件（写入当前时间戳）实现互斥：
- 成功：返回之前的 mtime，本次开始运行
- 失败（锁已存在）：返回 null，安静退出

如果整合过程失败，会 `rollbackConsolidationLock(priorMtime)` 把锁文件还原为之前的时间戳，让下一次会话能够重试。

### 4.4 整合 Agent 的约束

```typescript
// autoDream.ts — 工具约束注入
const extra = `
**Tool constraints for this run:** Bash is restricted to read-only commands
(\`ls\`, \`find\`, \`grep\`, \`cat\`, \`stat\`, \`wc\`, \`head\`, \`tail\`).
Anything that writes, redirects to a file, or modifies state will be denied.

Sessions since last consolidation (${sessionIds.length}):
${sessionIds.map(id => `- ${id}`).join('\n')}`
```

autoDream 子 Agent 只有**受限的工具访问**：
- Bash：仅只读命令（find/grep/cat）
- Read：任意文件
- Edit/Write：仅限 `isAutoMemPath()` 通过的路径（记忆目录内）

`canUseTool: createAutoMemCanUseTool(memoryRoot)` 强制执行路径约束。

### 4.5 整合后的通知

```typescript
// autoDream.ts
const dreamState = context.toolUseContext.getAppState().tasks?.[taskId]
if (
  appendSystemMessage &&
  isDreamTask(dreamState) &&
  dreamState.filesTouched.length > 0
) {
  appendSystemMessage({
    ...createMemorySavedMessage(dreamState.filesTouched),
    verb: 'Improved',    // 注意：extractMemories 用 'Saved'，autoDream 用 'Improved'
  })
}
```

整合完成后，如果有文件被修改，会在主对话流中追加一条系统消息（通知用户哪些记忆文件被更新了）。

---

## 第五节：完整数据流

```
会话启动
  ↓
loadMemoryPrompt()
  ├── KAIROS? → buildAssistantDailyLogPrompt()
  ├── TEAMMEM? → buildCombinedMemoryPrompt()   (auto + team 两个目录)
  └── auto only → buildMemoryLines()
         ↓
    注入系统提示 (MEMORY.md 索引 + 类型说明 + 约束规则)
         ↓
对话进行中 (Claude 读写记忆文件)
         ↓
对话结束 (stopHooks)
  ↓
executeAutoDream()
  ├── isGateOpen()?
  ├── 时间门 (≥24h)?
  ├── Session 数 (≥5)?
  ├── 获取排他锁?
  └── runForkedAgent(consolidationPrompt, readOnly Bash, autoMem Write)
         ↓
      整合 transcript → 更新 MEMORY.md / 主题文件
         ↓
      appendSystemMessage("Improved: X files")
```

---

## 第六节：一个细节——当前 session 被排除

```typescript
// autoDream.ts
const currentSession = getSessionId()
sessionIds = sessionIds.filter(id => id !== currentSession)
```

这行代码有个微妙的原因：当前 session 的 transcript 还在写入，它的 mtime 一定是最新的，所以它总会出现在 `listSessionsTouchedSince(lastAt)` 的结果里。

但这个 session 的内容并没有完成（对话还在进行），把它纳入整合会产生不完整的记忆，所以要显式排除。

---

## 小结

| 模块 | 关键设计 |
|------|---------|
| `memoryTypes.ts` | 4种类型 + WHAT_NOT_TO_SAVE 约束 |
| `paths.ts` | memoized 路径解析 + normalize() 安全校验 |
| `memdir.ts` | MEMORY.md 200行/25KB 截断 + KAIROS/TEAMMEM 分支 |
| `autoDream.ts` | 三重门控 + 排他锁 + 受限子 Agent + 失败回滚 |

记忆系统的精髓是**权衡**：既要跨会话持久化，又不能无限膨胀；既要自动整合，又要避免频繁空转。三重门控 + 锁机制 + 路径约束，把这些约束都编入了代码。

---

> **下一讲预告**：第14讲将深入 MCP 客户端——`connectMCPServer`、stdio/SSE/HTTP 三种传输、工具发现与调用链路。
