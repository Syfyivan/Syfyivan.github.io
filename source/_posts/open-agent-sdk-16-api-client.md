---
title: "【Open Agent SDK 源码精讲·第16讲】API 客户端：指数退避、prompt 缓存与降级模型"
date: 2026-06-22
tags:
  - Open Agent SDK
  - Claude Code
  - 源码精讲
  - API客户端
  - AI Agent
categories:
  - 技术深潜
series: open-agent-sdk
---

> **系列导航** → [课程目录](/courses/open-agent-sdk/) · 上一讲：[第15讲·多Agent](/2026/06/22/open-agent-sdk-15-multi-agent/)

---

## 引言：一次 API 调用的完整生命周期

你按下回车，Claude Code 向 Anthropic API 发出请求。

如果网络超时了怎么办？如果 429 了？如果 529（服务过载）了？如果 OAuth token 过期了？如果模型上下文满了？

本讲拆解 `src/services/api/` 中处理这些问题的核心代码：

| 文件 | 行数 | 职责 |
|------|------|------|
| `withRetry.ts` | 822 | 重试引擎：退避算法、故障分类、降级模型 |
| `claude.ts` | 3420 | API 请求构建：prompt 缓存、流式、工具 schema |
| `errors.ts` | 1207 | 错误分类与用户消息生成 |

---

## 第一节：withRetry() —— 异步生成器重试引擎

### 1.1 接口设计

```typescript
// withRetry.ts
export async function* withRetry<T>(
  getClient: () => Promise<Anthropic>,
  operation: (client, attempt, context) => Promise<T>,
  options: RetryOptions,
): AsyncGenerator<SystemAPIErrorMessage, T> {
  // yield 重试等待时的状态消息
  // return 成功的结果
}
```

这是一个 `AsyncGenerator`，有两种输出：
- **yield**：每次等待重试前，向上游 yield 一条 `SystemAPIErrorMessage`（显示在 UI 里告知用户正在重试）
- **return**：成功时返回操作结果

### 1.2 关键常量

```typescript
const DEFAULT_MAX_RETRIES = 10     // 最大重试次数
const FLOOR_OUTPUT_TOKENS = 3000   // 上下文溢出时保底输出 token 数
const MAX_529_RETRIES = 3          // 连续 529 次数超过此值 → 触发降级模型
export const BASE_DELAY_MS = 500   // 退避基准时间
```

### 1.3 指数退避算法

```typescript
// withRetry.ts
export function getRetryDelay(
  attempt: number,
  retryAfterHeader?: string | null,
  maxDelayMs = 32000,
): number {
  // 优先遵守服务端的 Retry-After header
  if (retryAfterHeader) {
    const seconds = parseInt(retryAfterHeader, 10)
    if (!isNaN(seconds)) return seconds * 1000
  }

  // 指数退避 + 25% 随机抖动
  const baseDelay = Math.min(
    BASE_DELAY_MS * Math.pow(2, attempt - 1),
    maxDelayMs,
  )
  const jitter = Math.random() * 0.25 * baseDelay
  return baseDelay + jitter
}
```

退避序列（无 Retry-After，无抖动时）：

| 重试次数 | 等待时间 |
|---------|--------|
| 1 | 500ms |
| 2 | 1s |
| 3 | 2s |
| 4 | 4s |
| 5 | 8s |
| 6 | 16s |
| 7+ | 32s（上限） |

加上 25% 抖动是为了避免多个客户端同时失败后"同步重试"造成的二次拥塞（惊群效应）。

---

## 第二节：shouldRetry() —— 故障分类

```typescript
// withRetry.ts
function shouldRetry(error: APIError): boolean {
  if (isMockRateLimitError(error)) return false   // 测试用模拟错误不重试

  // 408 请求超时 → 重试
  if (error.status === 408) return true

  // 409 锁冲突 → 重试
  if (error.status === 409) return true

  // 429 频率限制：订阅用户（非企业版）不重试
  if (error.status === 429) {
    return !isClaudeAISubscriber() || isEnterpriseSubscriber()
  }

  // 401 未授权 → 清缓存，重试
  if (error.status === 401) {
    clearApiKeyHelperCache()
    return true
  }

  // 403 "OAuth token revoked" → 重试（外层会刷新 token）
  if (isOAuthTokenRevokedError(error)) return true

  // 5xx 服务端错误 → 重试
  if (error.status >= 500) return true

  // 尊重服务端的 x-should-retry header
  const shouldRetryHeader = error.headers?.get('x-should-retry')
  if (shouldRetryHeader === 'true' && ...) return true
  if (shouldRetryHeader === 'false') return false

  return false
}
```

**关键边界**：

- 订阅用户遇到 429 **不重试**——Max/Pro 有窗口限额，重试只会继续消耗限额，不如让用户等 reset
- 企业版用户遇到 429 **可以重试**——通常是 PAYG 计费，暂时性
- CCR（远程运行）模式遇到 401/403 **强制重试**——基础设施提供的 JWT 瞬态故障，不是凭证问题

---

## 第三节：529（服务过载）的特殊处理

### 3.1 前台 vs 后台区分

```typescript
// withRetry.ts — 前台 query source（用户等待中），才会在 529 时重试
const FOREGROUND_529_RETRY_SOURCES = new Set<QuerySource>([
  'repl_main_thread',       // 主对话
  'sdk',                    // SDK 调用
  'agent:custom',           // 自定义 Agent
  'compact',                // 上下文压缩
  'auto_mode',              // 权限分类器
  // ... 共 14 种
])

// 后台任务（标题生成、摘要、建议...）遇到 529 直接放弃
if (is529Error(error) && !shouldRetry529(options.querySource)) {
  logEvent('tengu_api_529_background_dropped', {...})
  throw new CannotRetryError(error, retryContext)
}
```

**设计思路**：在容量级联（capacity cascade）时，后台任务立即放弃而不是排队重试。如果每个后台任务都排队，1000 个并发用户 × 10 次重试 = 服务器压力放大 10 倍，把问题变成灾难。

### 3.2 连续 529 触发降级模型

```typescript
// withRetry.ts
if (is529Error(error)) {
  consecutive529Errors++
  if (consecutive529Errors >= MAX_529_RETRIES) {  // 连续 3 次
    if (options.fallbackModel) {
      throw new FallbackTriggeredError(options.model, options.fallbackModel)
      // 调用方捕获这个 error → 用 fallbackModel 重新调用 withRetry
    }
    // 外部用户且没有降级模型 → 抛 CannotRetryError（终止）
    throw new CannotRetryError(new Error(REPEATED_529_ERROR_MESSAGE), retryContext)
  }
}
```

---

## 第四节：Fast Mode 的重试策略

Fast Mode（快速模式）在 429/529 时有特殊处理，目标是**尽量保持 prompt cache 不失效**：

```typescript
// withRetry.ts — Fast Mode 429/529 处理
if (wasFastModeActive && error.status === 429 || is529Error(error)) {

  // 场景1：Retry-After < 20s → 短暂等待，保持 Fast Mode（同模型名 = prompt cache 命中）
  if (retryAfterMs < SHORT_RETRY_THRESHOLD_MS) {
    await sleep(retryAfterMs)
    continue   // 继续用 Fast Mode 重试
  }

  // 场景2：Retry-After >= 20s → 进入冷静期（30min），切换标准速度
  triggerFastModeCooldown(Date.now() + cooldownMs, 'rate_limit')
  retryContext.fastMode = false
  continue   // 用标准速度重试（模型名变了 = prompt cache bust）

  // 场景3：overage-disabled-reason header → 永久禁用 Fast Mode
  handleFastModeOverageRejection(overageReason)
  retryContext.fastMode = false
}
```

`SHORT_RETRY_THRESHOLD_MS = 20_000ms`。服务端告诉你"20秒后再试"，等一下继续用同一模型；"30分钟后再试"，换模型（prompt cache 就 bust 掉了，但比等 30 分钟强）。

---

## 第五节：鉴权错误的精细处理

```typescript
// withRetry.ts — 循环开头决定是否重新获取 client

const isStaleConnection = isStaleConnectionError(lastError)
// ECONNRESET/EPIPE = 旧的 Keep-Alive 连接失效
if (isStaleConnection && featureEnabled) {
  disableKeepAlive()  // 禁用连接池，下次建立新连接
}

if (
  client === null ||
  (lastError instanceof APIError && lastError.status === 401) ||
  isOAuthTokenRevokedError(lastError) ||    // 403 "token revoked"
  isBedrockAuthError(lastError) ||          // AWS 403 / CredentialsProviderError
  isVertexAuthError(lastError) ||           // GCP 401 / invalid_grant
  isStaleConnection
) {
  // 在获取新 client 之前，先刷新 token
  if (lastError?.status === 401 || isOAuthTokenRevokedError(lastError)) {
    const failedAccessToken = getClaudeAIOAuthTokens()?.accessToken
    if (failedAccessToken) await handleOAuth401Error(failedAccessToken)
    // 传 sentToken 而不是重新读 token，见第14讲 OAuth 重试设计
  }
  client = await getClient()  // 重新创建客户端
}
```

不同云厂商的鉴权错误：
- **Bedrock**：AWS SDK 级别的 `CredentialsProviderError` 或 403（`clearAwsCredentialsCache()`）
- **Vertex**：google-auth-library 的 `invalid_grant` 或 API 的 401（`clearGcpCredentialsCache()`）

---

## 第六节：上下文溢出的自适应重试

```typescript
// withRetry.ts — parseMaxTokensContextOverflowError()
// 解析错误信息："input length and `max_tokens` exceed context limit: 188059 + 20000 > 200000"
const regex = /input length and `max_tokens` exceed context limit: (\d+) \+ (\d+) > (\d+)/

if (parseMaxTokensContextOverflowError(error)) {
  const { inputTokens, contextLimit } = overflowData
  const safetyBuffer = 1000
  const availableContext = contextLimit - inputTokens - safetyBuffer
  const adjustedMaxTokens = Math.max(
    FLOOR_OUTPUT_TOKENS,    // 最少保留 3000 token 输出
    availableContext,
  )
  retryContext.maxTokensOverride = adjustedMaxTokens
  continue  // 用调整后的 max_tokens 重试，不算作一次"真正的"重试
}
```

这让 API 客户端能自动处理"请求刚好超出上下文窗口"的情况，不需要调用方感知。

---

## 第七节：Prompt 缓存控制

### 7.1 getCacheControl()

```typescript
// claude.ts
function getCacheControl({ querySource } = {}): {
  type: 'ephemeral'
  ttl?: '1h'
  scope?: CacheScope
} {
  return {
    type: 'ephemeral',
    ...(should1hCacheTTL(querySource) && { ttl: '1h' }),
    ...(shouldUseGlobalCacheScope() && { scope: 'global' }),
  }
}
```

所有缓存标记都是 `type: 'ephemeral'`，可选项：
- `ttl: '1h'`：1小时 TTL（默认是 5分钟）
- `scope: 'global'`：跨用户共享缓存（用于公共系统提示）

### 7.2 1h TTL 的资格判断

```typescript
// claude.ts — should1hCacheTTL()
function should1hCacheTTL(querySource?: QuerySource): boolean {
  // Bedrock + 环境变量开启
  if (getAPIProvider() === 'bedrock' && isEnvTruthy(ENABLE_PROMPT_CACHING_1H_BEDROCK)) return true

  // 用户资格（只判断一次，锁定到 session state）
  let userEligible = getPromptCache1hEligible()
  if (userEligible === null) {
    userEligible = process.env.USER_TYPE === 'ant' ||
      (isClaudeAISubscriber() && !currentLimits.isUsingOverage)
    setPromptCache1hEligible(userEligible)  // 锁定！
  }
  if (!userEligible) return false

  // GrowthBook allowlist 匹配（也锁定到 session state）
  return querySource 符合 allowlist 中的模式
}
```

**为什么要"锁定到 session state"？** 如果用户在一次会话中途达到用量上限（isUsingOverage 变 true），不应该改变缓存 TTL，否则会破坏已经建立的 prompt cache，浪费已缓存的 token。锁定一次，会话全程一致。

---

## 第八节：持久重试模式（CLAUDE_CODE_UNATTENDED_RETRY）

```typescript
// withRetry.ts — 无人值守模式（ant-only 特性）
const PERSISTENT_MAX_BACKOFF_MS = 5 * 60 * 1000  // 最大退避 5 分钟
const PERSISTENT_RESET_CAP_MS = 6 * 60 * 60 * 1000  // 最多等 6 小时
const HEARTBEAT_INTERVAL_MS = 30_000  // 每 30 秒发一次 keep-alive

// 持久模式下：分块 sleep + 每块后 yield 一次状态消息
let remaining = delayMs
while (remaining > 0) {
  yield createSystemAPIErrorMessage(error, remaining, attempt, maxRetries)  // 告知剩余等待时间
  const chunk = Math.min(remaining, HEARTBEAT_INTERVAL_MS)
  await sleep(chunk)
  remaining -= chunk
}

// 关键：for-loop 的 attempt 不再增加（不达到 maxRetries）
if (attempt >= maxRetries) attempt = maxRetries  // 钳住，防止退出循环
```

对于对 `anthropic-ratelimit-unified-reset` header 的处理：

```typescript
// withRetry.ts
function getRateLimitResetDelayMs(error: APIError): number | null {
  const resetHeader = error.headers?.get?.('anthropic-ratelimit-unified-reset')
  if (!resetHeader) return null
  const resetUnixSec = Number(resetHeader)
  // 等到 reset 时间点（而不是固定等 5 分钟）
  const delayMs = resetUnixSec * 1000 - Date.now()
  return Math.min(delayMs, PERSISTENT_RESET_CAP_MS)
}
```

---

## 完整错误处理决策树

```
API 调用失败
  │
  ├── AbortSignal.aborted → throw APIUserAbortError（不重试）
  │
  ├── Fast Mode active + 429/529
  │   ├── Retry-After < 20s → 等待，保持 Fast Mode
  │   ├── Retry-After >= 20s → 冷静期 30min，切标准速度
  │   └── overage-disabled header → 永久禁用 Fast Mode
  │
  ├── 529（服务过载）
  │   ├── 非前台 query source → 立即放弃（防止雪崩）
  │   ├── 连续 3 次 → FallbackTriggeredError（降级模型）
  │   └── 外部用户无降级 → CannotRetryError
  │
  ├── 400 上下文溢出 → 调整 max_tokens，立即重试
  │
  ├── 401/403 鉴权失败 → 刷新 token，重建 client，重试
  │
  ├── AWS/GCP 凭证错误 → 清缓存，重建 client，重试
  │
  ├── ECONNRESET/EPIPE → disableKeepAlive()，重建 client
  │
  ├── shouldRetry(error) = false → throw CannotRetryError
  │
  ├── attempt > maxRetries → throw CannotRetryError
  │
  └── 其他：指数退避后重试
      └── delay = min(500 * 2^(attempt-1) + 25% jitter, 32000ms)
```

---

## 小结

| 机制 | 实现 |
|------|------|
| 指数退避 | 500ms × 2^n + 25% jitter，上限 32s |
| 529 前台/后台分流 | FOREGROUND set（14 种），后台立即放弃 |
| 连续 529 降级 | 3 次 → FallbackTriggeredError |
| Fast Mode 重试策略 | <20s Retry-After 保 cache，否则冷静期切模型 |
| 鉴权重建 | 401/403/AWS/GCP 分别清缓存 + 重建 client |
| 上下文溢出 | 解析 400 错误，调整 max_tokens 重试 |
| Prompt 缓存 | ephemeral 标记 + 1h TTL（资格锁定到 session） |
| 持久模式 | 无限重试 + 30s heartbeat + 读 reset header |

API 客户端是整个 Agent 引擎的最后一道关卡——所有的对话历史、工具调用、权限检查、压缩，最终都要经过这里出去，再把结果带回来。健壮的重试策略和精细的错误分类，是高并发下稳定性的基础。

---

> **核心路线（00-16讲）至此全部完成。** 下一步是 F 系列：启动引导、CLI/Ink 渲染、Commands、生成类型与插件体系。
