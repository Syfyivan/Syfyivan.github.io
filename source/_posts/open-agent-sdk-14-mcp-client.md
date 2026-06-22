---
title: "【Open Agent SDK 源码精讲·第14讲】MCP 客户端：7种传输、连接池与工具发现"
date: 2026-06-22
tags:
  - Open Agent SDK
  - Claude Code
  - 源码精讲
  - MCP
  - AI Agent
categories:
  - 技术深潜
series: open-agent-sdk
---

> **系列导航** → [课程目录](/courses/open-agent-sdk/) · 上一讲：[第13讲·记忆系统](/2026/06/22/open-agent-sdk-13-memory-autodream/)

---

## 引言：Claude Code 是怎么连上你的 MCP 服务器的

你在 `~/.claude/settings.json` 里写了一行 `"mcpServers": { "my-tool": {...} }`，然后 Claude 就能调用那个服务器提供的工具了。

中间发生了什么？

本讲拆解 `src/services/mcp/` 目录下最核心的两个文件：

| 文件 | 行数 | 职责 |
|------|------|------|
| `types.ts` | 258 | 7 种传输类型的 Zod schema + 连接状态类型 |
| `client.ts` | 3349 | `connectToServer()` 全链路：传输选择→连接→鉴权→工具发现→错误处理 |

---

## 第一节：7种传输类型

### 1.1 类型枚举

```typescript
// types.ts
export const TransportSchema = lazySchema(() =>
  z.enum(['stdio', 'sse', 'sse-ide', 'http', 'ws', 'sdk']),
)
```

实际代码里还有第7种 `claudeai-proxy`（用于 claude.ai 平台内置 MCP），虽然没在枚举里但在 `McpServerConfigSchema` 的 union 里：

| 类型 | 通信方式 | 典型用途 |
|------|---------|---------|
| `stdio` | 子进程标准输入输出 | 本地 MCP 服务器（最常用） |
| `sse` | HTTP + Server-Sent Events | 远程 MCP，支持 OAuth |
| `http` | HTTP Streamable（MCP 新规范） | 远程 MCP，支持 OAuth |
| `ws` | WebSocket | 远程 MCP，支持自定义 headers |
| `sse-ide` | SSE（IDE 专用） | VS Code / JetBrains 扩展 |
| `ws-ide` | WebSocket + auth token | IDE 扩展（支持 auth token） |
| `sdk` | 进程内直接调用 | 进程内 MCP 服务器，无网络开销 |
| `claudeai-proxy` | HTTP + OAuth（claude.ai bearer） | claude.ai 平台内置 MCP |

### 1.2 5种连接状态

```typescript
// types.ts
export type MCPServerConnection =
  | ConnectedMCPServer    // 正常连接
  | FailedMCPServer       // 连接失败（有错误信息）
  | NeedsAuthMCPServer    // 需要 OAuth 鉴权
  | PendingMCPServer      // 正在重连（有重试计数）
  | DisabledMCPServer     // 用户手动禁用
```

每种状态都携带原始的 `ScopedMcpServerConfig`（带有 `scope` 字段，标记配置来自哪里：local/user/project/dynamic/enterprise/claudeai/managed）。

---

## 第二节：connectToServer() 的全链路

### 2.1 为什么 memoize

```typescript
// client.ts
export const connectToServer = memoize(
  async (name, serverRef, serverStats?) => { ... },
  (name, serverRef) => getServerCacheKey(name, serverRef),
)
```

`connectToServer` 用 lodash memoize 缓存，key = `name + JSON.stringify(config)`。

这意味着：
- 相同配置的服务器只建立一次连接
- 重连时必须先清除 memo 缓存（`connectToServer.cache.delete(cacheKey)`）

代码里有注释承认这个 memoize 增加了复杂度，但暂时保留。

### 2.2 传输选择逻辑（大 if-else 链）

```typescript
// client.ts — connectToServer() 内部，简化版
if (serverRef.type === 'sse') {
  // 1. 创建 ClaudeAuthProvider（处理 OAuth token）
  // 2. 获取自定义 headers（静态 + 动态）
  // 3. fetch = wrapFetchWithTimeout(wrapFetchWithStepUpDetection(createFetchWithInit(), authProvider))
  // 4. SSE 流用单独的 fetch（不加 timeout，因为长连接）
  transport = new SSEClientTransport(url, options)

} else if (serverRef.type === 'http') {
  // 同 SSE，但用 StreamableHTTPClientTransport
  // 区别：需要在 Accept 头强制加 'application/json, text/event-stream'

} else if (serverRef.type === 'stdio' || !serverRef.type) {
  // 启动子进程
  transport = new StdioClientTransport({
    command, args,
    env: { ...subprocessEnv(), ...serverRef.env },
    stderr: 'pipe',  // 防止服务器的 stderr 污染 CLI 界面
  })

} else if (serverRef.type === 'ws' || serverRef.type === 'ws-ide') {
  // 根据运行时（Bun vs Node.js）选不同的 WebSocket 实现
  wsClient = typeof Bun !== 'undefined'
    ? new globalThis.WebSocket(url, { protocols: ['mcp'], ... })
    : await createNodeWsClient(url, { agent: proxyAgent })
  transport = new WebSocketTransport(wsClient)
}
```

### 2.3 两个特殊的进程内服务器

```typescript
// client.ts — 特判：Chrome / Computer Use 进程内服务器
} else if (isClaudeInChromeMCPServer(name)) {
  // 避免启动 325MB 的子进程，直接在进程内运行
  const { createLinkedTransportPair } = await import('./InProcessTransport.js')
  inProcessServer = createClaudeForChromeMcpServer(context)
  const [clientTransport, serverTransport] = createLinkedTransportPair()
  await inProcessServer.connect(serverTransport)
  transport = clientTransport
}
```

`InProcessTransport` 创建一对"管道"传输，客户端和服务器各持一端，通信完全在内存里——不走网络、不走 stdio，延迟接近零。

### 2.4 连接超时与竞争

```typescript
// client.ts
const connectPromise = client.connect(transport)
const timeoutPromise = new Promise<never>((_, reject) => {
  const timeoutId = setTimeout(() => {
    transport.close().catch(() => {})
    reject(new Error(`MCP server "${name}" connection timed out after ${getConnectionTimeoutMs()}ms`))
  }, getConnectionTimeoutMs())
  // 连接完成时清除 timeout，避免内存泄漏
  connectPromise.then(() => clearTimeout(timeoutId), () => clearTimeout(timeoutId))
})
await Promise.race([connectPromise, timeoutPromise])
```

默认超时 30 秒（`MCP_TIMEOUT` env 可覆盖）。

---

## 第三节：鉴权体系

### 3.1 needs-auth 缓存

```typescript
// client.ts
const MCP_AUTH_CACHE_TTL_MS = 15 * 60 * 1000 // 15分钟

async function isMcpAuthCached(serverId: string): Promise<boolean> {
  const cache = await getMcpAuthCache()
  const entry = cache[serverId]
  return entry ? Date.now() - entry.timestamp < MCP_AUTH_CACHE_TTL_MS : false
}
```

如果一个服务器返回 401 / UnauthorizedError，它会被写入 `~/.claude/mcp-needs-auth-cache.json`，15分钟内不再尝试连接，直接返回 `needs-auth` 状态。

写入通过一个 `writeChain`（Promise 串联）序列化，防止多个服务器并发 401 时产生读-改-写竞争。

### 3.2 OAuth 重试（claude.ai proxy）

```typescript
// client.ts — createClaudeAiProxyFetch()
const { response, sentToken } = await doRequest()
if (response.status !== 401) return response

const tokenChanged = await handleOAuth401Error(sentToken).catch(() => false)
if (!tokenChanged) {
  // 检查是否被其他并发请求刷新了
  const now = getClaudeAIOAuthTokens()?.accessToken
  if (!now || now === sentToken) return response
}
// token 真的变了，重试一次
return (await doRequest()).response
```

关键细节：把 `sentToken` 作为参数传给 `handleOAuth401Error`，而不是在 401 之后重新读 `getClaudeAIOAuthTokens()`——这是因为并发下另一个请求可能已经刷新了 token，读新 token 传进去会让函数认为"已经是最新的了"而跳过刷新。

---

## 第四节：wrapFetchWithTimeout 的细节

```typescript
// client.ts — wrapFetchWithTimeout()

// GET 请求不加 timeout（SSE 长连接）
if (method === 'GET') return baseFetch(url, init)

// 用 setTimeout 而不是 AbortSignal.timeout()——原因：
// Bun 的 AbortSignal.timeout 内部 timer 只有 GC 时才释放
// 每个请求 ~2.4KB 原生内存在 60s 内持续占用
const controller = new AbortController()
const timer = setTimeout(c => c.abort(...), MCP_REQUEST_TIMEOUT_MS, controller)
timer.unref?.()  // Node.js: 不阻止进程退出
```

SSE 的两个 fetch 实例的区别：
- `transportOptions.fetch`（POST 请求）：有 60 秒 timeout
- `transportOptions.eventSourceInit.fetch`（GET / SSE 流）：无 timeout，长连接

---

## 第五节：工具发现与封装

### 5.1 连接后读取 capabilities

```typescript
// client.ts — 连接成功后
const capabilities = client.getServerCapabilities()
const rawInstructions = client.getInstructions()
// 截断过长的 server instructions（OpenAPI 生成的 MCP server 可能有 15-60KB）
const MAX_MCP_DESCRIPTION_LENGTH = 2048
instructions = rawInstructions?.slice(0, MAX_MCP_DESCRIPTION_LENGTH) + '… [truncated]'
```

### 5.2 工具名规范化

MCP 工具名称遵循 `mcp__<server>__<tool>` 格式：

```typescript
// mcpStringUtils.ts
export function buildMcpToolName(serverName: string, toolName: string): string {
  return `mcp__${serverName}__${toolName}`
}
```

但 MCP 工具名可能包含 `-`、`.`、`:` 等非法字符，`normalization.ts` 里有 `normalizeNameForMCP()` 把这些字符替换成 `_`。

### 5.3 IDE 工具过滤

```typescript
// client.ts
const ALLOWED_IDE_TOOLS = ['mcp__ide__executeCode', 'mcp__ide__getDiagnostics']
function isIncludedMcpTool(tool: Tool): boolean {
  return !tool.name.startsWith('mcp__ide__') || ALLOWED_IDE_TOOLS.includes(tool.name)
}
```

IDE 服务器暴露很多工具，但只有这两个被允许传给模型——其他的过滤掉，避免干扰。

---

## 第六节：批量连接策略

```typescript
// client.ts
export function getMcpServerConnectionBatchSize(): number {
  return parseInt(process.env.MCP_SERVER_CONNECTION_BATCH_SIZE || '', 10) || 3
}
function getRemoteMcpServerConnectionBatchSize(): number {
  return parseInt(process.env.MCP_REMOTE_SERVER_CONNECTION_BATCH_SIZE || '', 10) || 20
}
function isLocalMcpServer(config): boolean {
  return !config.type || config.type === 'stdio' || config.type === 'sdk'
}
```

启动时通过 `pMap` 并发连接：
- 本地服务器（stdio/sdk）：每批 3 个（避免同时启动太多子进程）
- 远程服务器（sse/http/ws）：每批 20 个（网络请求本身是异步的，并发更高）

---

## 第七节：连接断开与重连

```typescript
// client.ts — 连接建立后注入的 onerror/onclose
const MAX_ERRORS_BEFORE_RECONNECT = 3
let consecutiveConnectionErrors = 0

client.onerror = (error: Error) => {
  if (isTerminalConnectionError(error.message)) {
    consecutiveConnectionErrors++
    if (consecutiveConnectionErrors >= MAX_ERRORS_BEFORE_RECONNECT) {
      closeTransportAndRejectPending('terminal error threshold')
    }
  }
}

// 终端错误关键字
function isTerminalConnectionError(msg: string): boolean {
  return msg.includes('ECONNRESET') ||
    msg.includes('ETIMEDOUT') ||
    msg.includes('EPIPE') ||
    msg.includes('EHOSTUNREACH') ||
    msg.includes('ECONNREFUSED') ||
    msg.includes('SSE stream disconnected') ||
    // ...
}
```

`closeTransportAndRejectPending()` 调用 `client.close()`，这会：
1. 关闭底层传输
2. 拒绝所有挂起的 `callTool()` Promise（以 McpError -32000 失败）
3. 触发 `onclose` 回调（清除 memo 缓存，下次调用触发重连）

注意有 `hasTriggeredClose` 守卫——因为 `close()` 本身可能触发新的 `onerror`，防止重入。

---

## 完整连接流程图

```
connectToServer(name, config)
  │
  ├── isMcpAuthCached(name)? → 直接返回 needs-auth
  │
  ├── 根据 config.type 创建 Transport
  │   ├── stdio → StdioClientTransport (spawn 子进程)
  │   ├── sse   → SSEClientTransport + ClaudeAuthProvider
  │   ├── http  → StreamableHTTPClientTransport + ClaudeAuthProvider
  │   ├── ws    → WebSocketTransport (Bun/Node.js)
  │   └── in-process → InProcessTransport (无网络开销)
  │
  ├── new Client({ capabilities: { roots, elicitation } })
  ├── client.setRequestHandler(ListRoots, () => [cwd])
  │
  ├── Promise.race([client.connect(transport), timeout(30s)])
  │   └── UnauthorizedError → needs-auth + setMcpAuthCacheEntry()
  │
  ├── getServerCapabilities() / getInstructions() (截断到 2048 chars)
  │
  └── 返回 ConnectedMCPServer { client, capabilities, instructions }
```

---

## 小结

| 关键点 | 实现 |
|--------|------|
| 7种传输 | stdio/sse/http/ws/sse-ide/ws-ide/claudeai-proxy |
| 进程内服务器 | InProcessTransport 对（Chrome/Computer Use） |
| 连接 memoize | key = name + JSON(config)，重连时清除 |
| 超时 | connect = 30s，单次请求 = 60s，SSE 流无限 |
| 鉴权缓存 | needs-auth 缓存 15min，写入串行化防竞争 |
| 工具名 | `mcp__<server>__<tool>`，特殊字符→`_` |
| 批量连接 | 本地 3 并发，远程 20 并发 |
| 重连 | 3次终端错误 → close → 清 memo → 下次重建 |

MCP 客户端是 Claude Code 向外"长触手"的核心——每个工具调用背后都有这套传输、鉴权、重连机制在默默支撑。

---

> **下一讲预告**：第15讲将拆解多 Agent 协作——Leader/Teammate 角色、Git worktree 隔离、权限冒泡机制。
