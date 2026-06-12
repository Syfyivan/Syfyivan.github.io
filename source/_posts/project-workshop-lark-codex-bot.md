---
title: "把 AI Agent 接进飞书：一个 IM 机器人桥接层的完整拆解"
date: 2026-06-12 17:00:00
tags: [飞书, 机器人, AI Agent, 集成, 工具开发]
categories: [技术笔记, 项目工坊]
---

我平时用 Codex CLI 在本机跑代码任务，但有个很实际的问题：人不在电脑前的时候，想让它干活只能干等。朋友为这个场景写了 lark-codex-bot——在飞书群里 @ 一下机器人，消息会变成一条 `codex exec` 任务在他的机器上执行，跑完后结果自动回到原消息下面。我自己也写过一套思路不同的桥接（[lark-codex-bridge](/2026/06/12/project-workshop-lark-codex-bridge/)），所以这次把他的源码完整拆了一遍，对照着看收获很大。

整个项目是一个零依赖的 Node.js 单文件服务（`src/server.mjs`，两千多行），但它把 IM bot + LLM agent 集成的几个通用问题都趟了一遍：事件订阅怎么校验、消息怎么变成任务、长任务怎么不阻塞回调、会话怎么跨消息延续。这篇文章把这套套路拆开讲，你照着可以接任何 agent——Claude Code、自家的 LLM 服务，都是同一个骨架。

## 为什么要把 agent 接进 IM

把 agent 塞进飞书（或 Slack、Telegram）有三个直接收益：

- **入口成本归零**。手机上发条消息就能触发任务，不用 SSH、不用开终端。
- **天然的异步 UI**。agent 任务动辄跑几分钟，IM 的"发消息 → 稍后收到回复"模型刚好匹配，不需要自己做轮询页面。
- **上下文就在群里**。群聊本身就是协作现场，agent 的输出直接进入讨论流。

但 IM 平台的事件模型和 agent 的执行模型之间有一道沟：前者要求回调**秒级响应**，后者一跑就是几分钟。桥接层的核心工作就是填这道沟。

## 飞书事件模型的最小心智图

接飞书机器人，只需要理解四件事：

```text
1. URL 校验    飞书发 type=url_verification，你原样返回 challenge
2. 事件推送    用户发消息 -> 飞书 POST im.message.receive_v1 到你的回调地址
3. 安全校验    Verification Token 验来源 + Encrypt Key 解密/验签
4. 主动回复    拿 app 凭据换 tenant_access_token，调 OpenAPI 回复消息
```

注意一个不对称：**收消息是飞书推给你（需要公网 HTTPS 地址），发消息是你调飞书的 OpenAPI（只需要出网）**。这个不对称直接决定了项目的架构。

## 架构：hub 在公网，worker 在家里

我的 Codex 跑在 Mac 上，但 Mac 没有公网 IP。项目支持三种模式（`local` / `hub` / `worker`），长期推荐的是 hub + worker 拆分：

```text
飞书开放平台
  -> 阿里云 ECS 上的 hub（接事件、入队列）
  <- Mac worker 长轮询拉任务
  -> Mac 上 codex exec 执行
  <- worker 把结果 POST 回 hub
  -> hub 调飞书 OpenAPI 回复原消息
```

hub 只做三件事：验证事件、把消息转成任务写进一个 JSON 文件队列、收到结果后回复飞书。worker 在 Mac 上每隔几秒 `POST /worker/tasks/claim` 拉任务，执行完 `POST /worker/tasks/:id/result` 交差。

这个设计的好处：飞书后台只配一个稳定的公网地址；Mac 不暴露任何端口；Mac 关机时任务留在队列里，开机后继续消费。这是"本地 agent + 云端入口"的通用解法。

## 核心代码拆解

### 1. 事件入口：先校验，再去重，立刻返回

hub 收到 POST 后的处理顺序很讲究（`src/server.mjs` 的 `createHubApp`）：

```js
const payload = parseAndVerifyLarkPayload(config, request.headers, rawBody);

if (isUrlVerification(payload)) {
  verifyPayloadToken(config, payload);
  sendJson(response, 200, { challenge: payload.challenge });
  return;
}

verifyPayloadToken(config, payload);

const eventType = payload.header?.event_type || payload.type;
if (eventType !== "im.message.receive_v1") {
  sendJson(response, 200, { code: 0, msg: "ignored" });
  return;
}

const eventId = payload.header?.event_id || "";
if (eventId && rememberEvent(seenEvents, eventId, config.dedupeTtlMs)) {
  sendJson(response, 200, { code: 0, msg: "duplicate ignored" });
  return;
}
```

三道关卡：解密验签 → Verification Token 比对 → `event_id` 去重。去重必须做，因为**飞书在你没有及时返回 200 时会重推同一事件**，agent 任务又贵又慢，重复执行代价很高。`rememberEvent` 用一个带 TTL 的内存 Map 实现，顺手清理过期条目。

加密部分值得一看。飞书启用 Encrypt Key 后，事件体是 AES-256-CBC 加密的，密钥是 Encrypt Key 的 SHA-256，IV 是密文前 16 字节（`decryptLarkPayload`）。签名校验则是 `sha256(timestamp + nonce + encryptKey + body)`，项目里还加了时间窗检查防重放，并用 `timingSafeEqual` 做比较防时序攻击——这些细节自己接的时候很容易漏。

### 2. 消息 → 任务：buildCodexTask

`buildCodexTask` 把原始事件过滤、清洗成一条结构化任务，过滤逻辑是所有 IM bot 的标配：

```js
if (config.allowedChatIds.length > 0 && !config.allowedChatIds.includes(chatId)) {
  return null;  // 白名单外的群直接忽略
}

const mentions = Array.isArray(message.mentions) ? message.mentions : [];
if (isGroupChat(chatType) && !config.acceptGroupWithoutMention) {
  const mentioned = mentions.some((mention) => matchesBotMention(config, mention));
  if (!mentioned) return null;  // 群聊必须 @ 机器人
}

let text = extractMessageText(message);
text = stripMentions(text, mentions).trim();
```

注意 `extractMessageText`：飞书消息的 `content` 是 JSON 字符串，text 消息有 `text` 字段，富文本（post）则要递归收集所有文本片段。`stripMentions` 把 `@_user_1` 这类占位符从正文里抠掉，否则 @ 标记会混进 prompt。

这一层还做了意图分流：命中"新开上下文"走 `reset_context` 任务，命中"读取本群消息/找 DDL"走 `chat_messages` 任务，其余才是交给 Codex 的普通任务。规则全是正则，没有再调一次 LLM 做路由——对个人工具来说够用且零成本。

### 3. 队列与长轮询：claim 时要发租约

hub 的队列就是一个 JSON 文件，但 `claimHubTask` 里有个不能省的细节——**租约（lease）**：

```js
for (const task of store.tasks) {
  if (task.status === "running" &&
      task.leaseExpiresAt &&
      Date.parse(task.leaseExpiresAt) <= nowMs) {
    task.status = "queued";   // 租约过期，任务放回队列
    task.workerId = "";
  }
}
// ...
task.status = "running";
task.leaseExpiresAt = new Date(nowMs + config.hubTaskLeaseMs).toISOString();
```

worker 是跑在家用 Mac 上的，随时可能休眠或断网。如果 claim 走的是"取走就删"，worker 一挂任务就永久丢失。租约机制保证：worker 拉走任务后若超时没交结果，hub 把任务重新置为 `queued`，等下一次 claim。配合 worker 端 `submitWorkerResultWithRetry` 的无限重试提交，整条链路对"家庭网络级"的不可靠环境有了基本容错。

### 4. 会话延续：跨消息复用 agent session

用户连续发两条消息，期望的是同一个对话上下文。项目按飞书 `chat_id` 维护一个 session 映射（`.sessions.json`），下次执行改用 `codex exec resume`：

```js
function buildCodexArgs(config, outputFile, sessionId) {
  if (sessionId) {
    return ["exec", "resume", "--output-last-message", outputFile, sessionId, "-"];
  }
  return ["exec", "--cd", config.codexWorkdir,
          "--sandbox", config.codexSandbox,
          "--color", "never",
          "--output-last-message", outputFile, /* ...--add-dir 等 */ "-"];
}
```

有意思的是 session id 怎么拿到的：`codex exec` 不会直接返回它，所以 `findLatestCodexSession` 在任务结束后去扫 `~/.codex/sessions` 目录，找启动时间之后新增的 `.jsonl` 文件，再校验文件头里的 `cwd` 和 `source === "exec"` 才认领。这是个略 hack 但很实用的"嗅探"方案——当 agent CLI 没给你提供 API 时，文件系统就是 API。

同一个群的消息还会被 `enqueueMessageTask` 用 Promise 链按 `chat_id` 串行化：同一群内任务排队执行（避免两条消息并发 resume 同一个 session 打架），不同群之间互不阻塞。

## 踩过的坑

**回调必须先返回再干活。** 飞书对回调有超时要求，超时即重推。所以代码里都是先 `sendJson(response, 200, ...)` 把响应发出去，再异步处理任务。去重是这个策略的安全网——即使返回慢了被重推，`event_id` 也能拦住。

**tenant_access_token 要缓存。** token 有效期约两小时，每次回复都重新换一次既慢又容易触发频控。`getTenantAccessToken` 缓存到过期前 60 秒：

```js
if (tokenCache.tenantAccessToken && tokenCache.expiresAt > Date.now() + 60_000) {
  return tokenCache.tenantAccessToken;
}
```

**子进程超时要 SIGTERM + SIGKILL 两段式。** agent 跑飞了不能让它无限占着 worker。`runCodex` 里先 `SIGTERM`，5 秒后还没退再 `SIGKILL`，同时把 stdout/stderr 截断在 512KB 内，防止输出爆内存。

**回复前要脱敏。** agent 的输出可能意外带出环境里的 secret，所以所有回复在发出前都过一遍 `redactSecrets`，把配置中的敏感值替换掉。`/worker/*` 接口也全部用 Bearer token 鉴权，且比较用的是 `timingSafeEqual`。

**沙箱外做特权操作。** "读取群消息"这类需要 bot 凭据的操作，是 worker 在 Codex 沙箱外用 `lark-cli` 完成的，把结果作为上下文喂给 Codex，而不是让 agent 子进程直接碰 keychain。agent 能力越强，越要收紧它能直接摸到的凭据。

## 照着接你自己的 bot

把 agent 换成任何 CLI 或 API，骨架不变：

1. **飞书侧**：创建企业自建应用，开机器人能力，订阅 `im.message.receive_v1`，配好回调地址和加密策略，开通回复消息权限。
2. **入口层**：实现 URL 校验、解密验签、token 比对、event_id 去重；先返回 200，再处理。
3. **任务层**：消息清洗（提取文本、去 mention）、白名单过滤、转成结构化任务进队列。
4. **执行层**：如果 agent 跑在没有公网的机器上，用长轮询 + 租约从队列拉任务；执行时设两段式超时。
5. **会话层**：按 `chat_id` 映射 agent session，同会话串行、跨会话并发，并提供"重置上下文"指令。
6. **回复层**：缓存 access token，脱敏后调 `/im/v1/messages/:message_id/reply` 回到原消息下。

整个项目没有用任何框架和 SDK，全靠 Node 标准库——这反而让每一层的职责看得特别清楚。事件订阅、队列、租约、会话映射，每个概念都对应几十行能读完的代码。如果你想理解 IM bot 桥接层到底在干什么，从零依赖的实现读起，比从 SDK 文档读起快得多。
