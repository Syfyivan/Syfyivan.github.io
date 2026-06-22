---
title: "《Open Agent SDK 源码逐行精讲》第11讲 · 权限系统：6 种模式、13 步管道与 AI 分类器熔断"
date: 2026-06-22 18:00:00
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

> 这是《Open Agent SDK 源码逐行精讲》第11讲。上一讲把消息系统讲完了，这一讲进入另一个核心模块：**权限系统**——Agent 能干什么、不能干什么，由谁说了算，怎么说？

<div class="oas-toc"><strong>本讲导航</strong>

- 第 1 章 · 全景：6 种模式与 2 个管道入口
- 第 2 章 · 规则层：5 种来源与规则值格式
- 第 3 章 · `hasPermissionsToUseToolInner()`：10 步规则管道
- 第 4 章 · `hasPermissionsToUseTool()`：3 步模式层
- 第 5 章 · Auto 模式的 AI 分类器：快路径 + 2 阶段分类
- 第 6 章 · 熔断机制：连续拒绝 + 总量拒绝上限
- 第 7 章 · Safety Check：不可绕过的内置白名单

</div>

## 第 1 章 · 全景：6 种模式与 2 个管道入口 <span class="oas-b oas-core">核心</span>

### 6 种权限模式

`PermissionMode.ts` 定义了 6 种模式：

| 模式 | symbol | 含义 |
|---|---|---|
| `default` | （无） | 每次敏感操作都弹确认框 |
| `plan` | ⏸ | Plan Mode，只读；等用户批准后才执行 |
| `acceptEdits` | ⏵⏵ | 文件编辑自动批准，其余还是问 |
| `bypassPermissions` | ⏵⏵（红） | 跳过几乎所有权限检查（调试用） |
| `dontAsk` | ⏵⏵（红） | 把 ask 变成 deny，永不弹框，永不执行 |
| `auto` | ⏵⏵（橙，ant-only） | 用 AI 分类器替代人工审批 |

### 2 个管道入口

```
hasPermissionsToUseTool()        ← 主入口（query.ts 每次工具调用前调用）
  ↓ 调用 ↓
hasPermissionsToUseToolInner()   ← 纯规则管道（10步）
  ↓ 返回 PermissionDecision ↓
hasPermissionsToUseTool() 做后处理：dontAsk/auto/headless 变换
```

`checkRuleBasedPermissions()`：从 `hasPermissionsToUseToolInner` 提取出来的子集，只做规则层（bypass 模式下也要遵守的那些规则）。

---

## 第 2 章 · 规则层：5 种来源与规则值格式 <span class="oas-b oas-key">重点</span>

### 权限规则来源

```typescript
const PERMISSION_RULE_SOURCES = [
  ...SETTING_SOURCES,  // 'managed', 'user', 'project', 'local' ← CLAUDE.md/settings
  'cliArg',           // --allow/--deny CLI 参数
  'command',          // /allow 命令在会话中添加
  'session',          // 会话级临时规则（如 "记住这次允许"）
]
```

每个来源都有三种行为（behavior）：`allow / deny / ask`。

### 规则值格式

规则以字符串形式存储，用 `permissionRuleValueFromString()` 解析：

```
"Bash"                   → { toolName: "Bash" }                 工具级规则
"Bash(npm publish:*)"   → { toolName: "Bash", ruleContent: "npm publish:*" }  内容规则
"mcp__server1"           → { toolName: "mcp__server1" }         MCP 服务器级规则
"mcp__server1__tool1"   → { toolName: "mcp__server1__tool1" }  MCP 工具级规则
"mcp__server1__*"       → { toolName: "mcp__server1__*" }      MCP 服务器通配符
```

`toolMatchesRule()` 的判断逻辑：
1. 规则有 `ruleContent` 则不匹配工具级（工具级规则没有括号内容）
2. 工具名精确匹配
3. MCP 服务器级：`mcp__server1` 匹配 `mcp__server1__tool1`（任何该服务器的工具）

---

## 第 3 章 · `hasPermissionsToUseToolInner()`：10 步规则管道 <span class="oas-b oas-core">核心</span>

这是纯规则层，不涉及 AI 分类器，按步骤顺序 deny > ask > allow：

```
步骤1a: getDenyRuleForTool(ctx, tool)
  ↓ 有 deny 规则 → { behavior: 'deny' }                          ← 最早退出
  
步骤1b: getAskRuleForTool(ctx, tool)
  ↓ 有 ask 规则 → { behavior: 'ask' }
  （例外：Bash 且 sandbox autoAllow 开启 → 跳过，让 checkPermissions 处理）
  
步骤1c: tool.checkPermissions(parsedInput, context)
  ↓ 每个工具自己的权限逻辑（Bash 在这里跑 8 步 subcommand 管道）
  → 返回 allow / ask / deny / passthrough
  
步骤1d: toolPermissionResult.behavior === 'deny'
  ↓ → { behavior: 'deny' }
  
步骤1e: tool.requiresUserInteraction?.() && behavior === 'ask'
  ↓ → { behavior: 'ask' }（bypass 模式也不能跳过的弹框）
  （用于如 AskUser 工具：它的设计目的就是要问人，不能自动批准）
  
步骤1f: behavior === 'ask' && decisionReason.rule.ruleBehavior === 'ask'
  ↓ → { behavior: 'ask' }（用户明确配置的 ask 规则，bypass 不能跳过）
  （例：Bash(npm publish:*) 始终要问）
  
步骤1g: behavior === 'ask' && decisionReason.type === 'safetyCheck'
  ↓ → { behavior: 'ask' }（系统内置安全检查，bypass 不能跳过）
  （例：写 ~/.bashrc, .git/config, .vscode/settings.json）
  
步骤2a: mode === 'bypassPermissions' || (plan + isBypassPermissionsModeAvailable)
  ↓ → { behavior: 'allow' }（bypass 模式，跳过剩余检查）
  
步骤2b: toolAlwaysAllowedRule(ctx, tool)
  ↓ 整个工具在 allow 规则里 → { behavior: 'allow' }
  
步骤3: passthrough → ask
  ↓ 没命中任何规则，toolPermissionResult 是 passthrough → 转换为 ask
  
返回 PermissionDecision（allow / deny / ask）
```

<div class="oas-key-note">步骤 1e/1f/1g 是**三道 bypass 免疫检查**——即便用户打开了 bypassPermissions 也必须弹框。这设计了三个层次：tool 说"我要和人交互"（1e）、用户说"这个命令必须问我"（1f）、系统说"这个路径敏感，不管你用什么模式都要确认"（1g）。</div>

---

## 第 4 章 · `hasPermissionsToUseTool()`：3 步模式层 <span class="oas-b oas-core">核心</span>

`hasPermissionsToUseTool` 包裹了 inner，做三件事：

### 步骤 A：dontAsk 模式

```typescript
if (result.behavior === 'ask' && mode === 'dontAsk') {
  return {
    behavior: 'deny',
    message: DONT_ASK_REJECT_MESSAGE(tool.name),
    // "Permission to use X has been denied because Claude Code is running in don't ask mode..."
  }
}
```

用户选择 `dontAsk` = "我知道 Agent 不会问我，但如果 Agent 要执行可疑操作直接拒绝"。这是一种"沉默的否决模式"。

### 步骤 B：auto 模式（AI 分类器）

只有 behavior 是 `ask` 时才进入 auto 模式分支（allow 和 deny 已经决定了）。详见第 5 章。

### 步骤 C：headless agent（无 UI）

如果是后台异步子 Agent（`shouldAvoidPermissionPrompts = true`），且不在 auto 模式，则先跑 PermissionRequest hook，hook 可以 allow/deny；没有 hook 决策就自动 deny。

### 允许后的副作用

`result.behavior === 'allow'` 时，如果之前有连续拒绝计数，调用 `recordSuccess()` 重置 `consecutiveDenials = 0`。

---

## 第 5 章 · Auto 模式的 AI 分类器：快路径 + 2 阶段分类 <span class="oas-b oas-key">重点</span>

`auto` 模式的核心是 `classifyYoloAction()`（定义在 `yoloClassifier.ts`）。

### 三条快路径（跳过昂贵的 AI 调用）

在调用分类器之前，有三个快路径：

**快路径 1：acceptEdits 假设检验**

```typescript
// 模拟切换到 acceptEdits 模式，看 tool.checkPermissions 是否会 allow
const acceptEditsResult = await tool.checkPermissions(parsedInput, {
  ...context,
  getAppState: () => ({ ...state, toolPermissionContext: { ...ctx, mode: 'acceptEdits' } })
})
if (acceptEditsResult.behavior === 'allow') {
  // 不用问分类器，直接 allow
  return { behavior: 'allow', ... }
}
```

逻辑：如果这个操作在"接受所有编辑"模式下本来就是允许的（如工作目录内的文件编辑），那它安全，不需要 AI 来判断。跳过对 Agent 工具和 REPL 工具（因为它们的 checkPermissions 在 acceptEdits 下始终 allow，无法区分）。

**快路径 2：安全工具白名单**

```typescript
if (classifierDecisionModule.isAutoModeAllowlistedTool(tool.name)) {
  // Glob、Grep、Read 等工具在 auto 模式下直接 allow
  return { behavior: 'allow', ... }
}
```

**快路径 3：classifier 不可用就跳过**（feature gate）

### 2 阶段分类器

`classifyYoloAction()` 调用 `classifyYoloActionXml()`，走 2 阶段：

```
Stage 1：轻量判断
  → 把对话历史 + 当前工具调用 格式化成 formatActionForClassifier(tool.name, input)
  → sideQuery(Haiku) 快速问：这个操作安全吗？
  → 解析 XML 响应块
  → false (明确安全) → 直接返回 allow，stage2 不跑
  → null (不确定) → 进入 stage2
  → true (明确危险) → 直接返回 deny

Stage 2：深度分析（仅当 stage1 返回 null 时）
  → 更多上下文，更详细的问题
  → sideQuery(Haiku) 精细判断
  → 返回 shouldBlock: boolean + reason: string
```

`sideQuery`：旁路查询，不写入主对话历史，token 不计入会话总计（所以 classifier 的开销不在会话 token 里，但会记录到 `tengu_auto_mode_decision` 事件）。

<div class="oas-note">分类器用 Haiku（最快最便宜的模型）是刻意的——权限判断需要低延迟（每个工具调用都要等它），而 Haiku 的判断能力对"是否是危险 bash 命令"这类问题已经足够。Stage 1 快路径进一步把大多数安全操作从 Haiku 调用里省掉。</div>

### 分类器不可用（503/超时）时的行为

```typescript
if (classifierResult.unavailable) {
  const ironGateClosed = getFeatureValue_CACHED_WITH_REFRESH(
    'tengu_iron_gate_closed', true, CLASSIFIER_FAIL_CLOSED_REFRESH_MS
  )
  if (ironGateClosed) {
    // 失败关闭：拒绝本次操作，让 Agent 重试
    return { behavior: 'deny', message: buildClassifierUnavailableMessage(tool.name, ...) }
  } else {
    // 失败开放：降级回普通弹框
    return result  // 原始的 ask
  }
}
```

`tengu_iron_gate_closed`（GrowthBook feature）：默认 `true`（失败关闭）。考虑到分类器不可用时无法判断安全性，默认拒绝是保守策略。ant 团队可以切换到 fail-open 做测试。刷新周期 30 分钟（避免每次都查 GB）。

### 对话历史太长（context overflow）

```typescript
if (classifierResult.transcriptTooLong) {
  if (shouldAvoidPermissionPrompts) {
    // Headless + transcript 太长 = 永远不会好转 → 直接 abort Agent
    throw new AbortError('Agent aborted: auto mode classifier transcript exceeded context window')
  }
  // CLI 模式：降级到弹框，让用户手动决定
  return { behavior: 'ask', ... }
}
```

---

## 第 6 章 · 熔断机制：连续拒绝 + 总量拒绝上限 <span class="oas-b oas-key">重点</span>

`denialTracking.ts` 定义了拒绝计数和熔断规则：

```typescript
export const DENIAL_LIMITS = {
  maxConsecutive: 3,   // 连续拒绝 3 次 → 熔断
  maxTotal: 20,        // 一次会话累计拒绝 20 次 → 熔断
}
```

触发熔断时（`shouldFallbackToPrompting() === true`）：

- **CLI 模式**：把 `deny` 改成 `ask`，把分类器的拒绝原因显示给用户，让用户手动决定。弹框里会显示类似"已连续拒绝 3 次，请检查对话历史是否有异常"的警告。
- **Headless 模式**：直接 `throw new AbortError('Agent aborted: too many classifier denials')`——后台子 Agent 无法弹框，超过阈值直接终止。

```typescript
const warning = hitTotalLimit
  ? `${totalCount} actions were blocked this session. Please review the transcript before continuing.`
  : `${consecutiveCount} consecutive actions were blocked. Please review the transcript before continuing.`
```

熔断后 `totalDenials` 归零（给下一轮重新积累机会），但 `consecutiveDenials` 在任何一次允许操作后自然归零。

<div class="oas-why">为什么连续 3 次就熔断（不是 5 次或 10 次）？连续拒绝通常说明 Agent 卡在一个"分类器不让做 + 换个方式还是不让做"的循环里，继续跑只会浪费 token 且让 Agent 更困惑。3 是实验得出的最小有意义值。</div>

---

## 第 7 章 · Safety Check：不可绕过的内置白名单 <span class="oas-b oas-skim">可跳读</span>

步骤 1g 涉及的 safetyCheck 来自文件工具的 `checkPathSafetyForAutoEdit()`（在 `filesystem.ts` 里）。

受保护的路径包括：

- `.git/` 目录内的文件（防止篡改 git 历史）
- `~/.claude/` 和 `.claude/` 目录（防止 Agent 修改自己的记忆/配置）
- `~/.ssh/`, `~/.gnupg/`（防止泄露/修改密钥）
- `~/.bashrc`, `~/.zshrc`, `~/.profile`（防止 shell 后门）
- `.vscode/settings.json`（防止 IDE 配置篡改）

这些路径的修改请求即使在 `bypassPermissions` 模式下也会弹确认框。

`classifierApprovable` 字段区分两类 safetyCheck：
- `classifierApprovable: true`（如敏感文件路径）：auto 模式下可以交给 AI 分类器
- `classifierApprovable: false`（如 `.git/`）：永远必须人工确认，分类器也不能批准

---

## 小结

```
每次工具调用
  ↓
hasPermissionsToUseToolInner()          ← 纯规则，10步
  1a deny rule → DENY
  1b ask rule → ASK（或跳过让 checkPermissions 处理）
  1c tool.checkPermissions() → allow/deny/ask/passthrough
  1d deny → DENY
  1e requiresUserInteraction → ASK（bypass 免疫）
  1f ask rule from checkPermissions → ASK（bypass 免疫）
  1g safetyCheck → ASK（bypass 免疫）
  2a bypassPermissions → ALLOW
  2b 整工具 allow 规则 → ALLOW
  3  passthrough → ASK
  ↓
hasPermissionsToUseTool() 做模式变换
  dontAsk: ASK → DENY
  auto mode:
    快路径1: acceptEdits 假设检验 → ALLOW (跳 Haiku)
    快路径2: 安全工具白名单 → ALLOW (跳 Haiku)
    AI 分类器 (Haiku, 2-stage):
      stage1 快: 明确安全 → ALLOW / 不确定 → stage2 / 明确危险 → DENY
      stage2 深: shouldBlock → DENY + 计入拒绝计数
      unavailable: fail-closed/open
      transcriptTooLong: 弹框 or AbortError
      熔断: consecutive≥3 or total≥20 → 弹框给用户
  headless: PermissionRequest hook → ALLOW/DENY / 没有决定 → DENY
  ↓
PermissionDecision { behavior: allow | deny | ask }
```

下一讲（第12讲）：**上下文压缩** — `autocompact`、`microcompact`、`snip compact` 三种压缩策略，以及压缩前后消息历史是如何重建的。

> 配套源码：[github.com/Syfyivan/open-agent-sdk](https://github.com/Syfyivan/open-agent-sdk)，本讲对应目录：`src/utils/permissions/`（9415 行，24 个文件）。
