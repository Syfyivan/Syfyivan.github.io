---
title: "Kodama 开发笔记 03：从本地 JSONL 到可跳转、可分享的 Agent 会话"
date: 2026-06-17 16:50:00
tags: [Codex, Claude Code, Electron, Goofy, AI Agent, 工具开发]
categories: [技术笔记, 项目工坊]
---

前两篇讲了事件入口和桌宠 UI。这一篇讲一个更容易被低估的问题：点击气泡以后，到底应该打开什么？

最早的实现很直接：本地 Agent 事件里带了 `transcriptPath`，点击气泡就打开这个文件。

结果实际体验非常差。

因为 Codex 和 Claude Code 的本地记录都是 JSONL。打开以后看到的是这样的东西：

```json
{"timestamp":"...","type":"session_meta","payload":{...}}
{"timestamp":"...","type":"response_item","payload":{...}}
{"timestamp":"...","type":"response_item","payload":{...}}
```

这对程序来说很好，对人来说几乎没用。用户要的是“回到正在进行的会话”，不是“看一份内部日志”。

所以这一阶段做了三件事：

1. 点击气泡跳回真实 App 或终端。
2. 悬停气泡展示简短会话摘要。
3. 气泡增加分享按钮，把 session 生成内网网页链接。

## 第 1 个问题：本地 transcript 只是数据源，不是用户目标

这是最重要的认知变化。

`transcriptPath` 很有用，但它不是打开目标。它应该作为：

- 生成 hover 摘要的数据源。
- session-share 的兜底定位信息。
- 找不到 App/终端时的调试线索。

但用户点击气泡时，应该优先打开：

```text
飞书消息 -> 飞书会话
Codex 本地任务 -> Codex App 对应 thread
Claude Code 本地任务 -> 正在跑 Claude 的终端 tab
```

只有这些目标才叫“回到现场”。

因此 Kodama 里把 target 分成几类：

```js
{
  kind: 'lark',
  chatId,
  messageId,
}

{
  kind: 'codex-thread',
  threadId,
  url: `codex://threads/${threadId}`,
}

{
  kind: 'terminal-session',
  sessionId,
  tty,
  cwd,
}
```

之前的 `local-path` 目标被降级：它不再作为本地 Agent 的默认点击结果。否则就会又回到“TextEdit 打开 JSONL”的失败体验。

## 第 2 个问题：Codex App 用 URL scheme 跳转

Codex Desktop 支持 `codex://threads/<thread-id>` 这样的 URL。桌宠拿到 `threadId` 后，可以让 macOS 打开 Codex：

```js
open -a Codex "codex://threads/<thread-id>"
```

Electron main process 里做了安全限制：

- 只允许 `codex:`、`lark:`、`feishu:`、`http:`、`https:` 这类协议。
- `codex:` 优先用 `open -a Codex`。
- 如果没有对应 App，再 fallback 到系统默认打开方式。

这一步学到的点是：

> 对桌面工具来说，URL scheme 是最自然的“回到 App”方式。不要把内部日志当成界面。

但这也暴露了另一个问题：不是每个本地事件一开始都有 `threadId`。所以 hook 映射层必须尽量保留：

- `session_id`
- `thread-id`
- `turn-id`
- `client`
- `cwd`
- `transcript_path`

少一个字段，后面就可能只能打开 JSON。

## 第 3 个问题：Claude Code 要找终端，而不是找文件

Claude Code 的情况不同。它通常跑在 Terminal、iTerm 或其他终端里。用户想回去的是那个正在运行的 tab。

Kodama 的做法是：

1. 通过 `ps -axo pid,ppid,pgid,tty,args` 扫进程。
2. 找命令行里包含目标 `sessionId`，并且看起来是 `claude` 或 `codex` 的进程。
3. 沿父进程往上找宿主 App。
4. 如果有 tty，用 AppleScript 激活 Terminal 对应 tab。
5. 如果找不到 tab，打开宿主 App。
6. 如果仍找不到，不再打开 JSONL，而是提示找不到活体会话。

为什么不 fallback 到 transcript？

因为用户已经明确反馈过：打开 JSON 没意义。错误的 fallback 比失败提示更糟糕。失败提示至少诚实，JSONL 会让用户以为功能坏了。

这一步的经验是：

> fallback 不是越多越好。fallback 打开的东西如果不是用户要的东西，就应该删掉。

## 第 4 个问题：悬停摘要从 transcript 读，但要跳过噪音

气泡正文通常很短：

```text
本地搞定啦 🎉
Agent 需要你确认
子 Agent 完成
```

这不足以让用户知道“这个 session 在干什么”。于是 hover 时需要读 transcript。

但 transcript 不能原样展示。Codex JSONL 里前面经常有：

- developer instructions
- AGENTS.md 内容
- 工具调用摘要
- 中间状态

这些都不是用户想看的“会话主题”。

所以 preview 逻辑做了几件事：

```text
Codex:
  只取 role 为 user/assistant 的 response_item
  跳过 developer/system
  标题优先用最近一条 user 文本
  内容取最后两条可见 user/assistant 文本

Claude:
  只取 type 为 user/assistant 的行
  从 message.content 中抽文本
  标题同样用最近 user 文本
```

代码上不是完整 Markdown 渲染，只做一个轻量文本抽取：

```js
function extractVisibleText(value) {
  if (typeof value === 'string') return compactText(value);
  if (Array.isArray(value)) return value.map(extractVisibleText).join(' ');
  if (value?.text) return compactText(value.text);
  if (value?.content) return extractVisibleText(value.content);
  return '';
}
```

一开始 hover 展示太多：标题、cwd、三轮内容、更新时间、目标链接。结果像一张大卡片，挡住原气泡和页面。

后来收敛为：

- 标题。
- 最近两条短文本。
- 最大高度限制。
- 锚定在原气泡下方居中。

这一步的经验是：

> hover 摘要不是 session viewer。它只负责回答“这个会话大概在干什么”。

## 第 5 个问题：分享按钮不能在 renderer 里直接拿 token

用户希望每个气泡除了“忽略”，再加一个“分享”。这个按钮要把这轮 session 做成链接，部署在内网。

bridge 里已经有成熟能力：

```text
POST /v1/sessions/session-shares
```

并且当前配置是：

```json
{
  "session_share_output": "goofy"
}
```

也就是说，bridge 会先生成本地 HTML snapshot，再调用：

```text
bytedcli --json goofy preview deploy <snapshot-dir> --alias <alias> --override
```

返回一个 Goofy Preview HTTPS URL。

Kodama 不应该重新实现这套部署逻辑。正确做法是复用 bridge：

```text
气泡分享按钮
  -> renderer 调 window.pet.shareSession(request)
  -> Electron main process
  -> 读取本机 bridge token
  -> POST /v1/sessions/session-shares
  -> 拿到 share.url
  -> 复制到剪贴板
  -> 弹出“分享链接已生成”
```

这里有一个安全边界：token 不暴露给 renderer。

preload 只暴露一个能力：

```js
shareSession: (request) => ipcRenderer.invoke('pet:share-session', request)
```

真正读 token 的地方在 main process：

```js
const token = process.env.KODAMA_BRIDGE_TOKEN
  || fs.readFileSync('~/.lark-codex-bridge-http-token', 'utf8').trim();
```

同时 bridge URL 限制为 loopback：

```js
if (!['127.0.0.1', 'localhost', '::1'].includes(hostname)) {
  throw new Error('bridge URL must be loopback');
}
```

这样 renderer 即使被某个意外输入影响，也不能把 token 带去请求外部地址。

## 第 6 个问题：分享要复用 session id，而不是 transcript path

bridge 的 session-share API 是按 provider 和 session id 查：

```json
{
  "provider": "codex",
  "session_id": "019ed492-28fb-7083-9e81-ab015c0679d5"
}
```

所以 Kodama 需要从事件里推断 provider：

```text
transcript 在 ~/.claude/projects -> claude
transcript 在 ~/.codex/sessions -> codex
client 包含 claude -> claude
client 包含 codex -> codex
有 threadId -> codex
```

Codex 优先用 `threadId`，没有时用 `sessionId`；Claude 用 `sessionId`。

这个逻辑看似小，但它把三个功能统一起来了：

- 点击打开 App。
- hover 读摘要。
- 分享生成网页。

它们都从同一个 `sessionRequestForEvent(event)` 出发。

经验是：

> 先把“这条事件对应哪个 session”抽成统一函数，再分别做跳转、摘要、分享。否则三个功能会各自猜一遍，迟早不一致。

## 第 7 个问题：验证不能真的每次都部署 Goofy

分享按钮最终会触发 Goofy 部署，首次运行可能要等比较久。开发时不能每改一次都真的 deploy。

bridge API 支持 `find_only`：

```bash
curl -sS -X POST http://127.0.0.1:8787/v1/sessions/session-shares \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"provider":"codex","session_id":"...","find_only":true}'
```

这能验证：

- token 鉴权是否可用。
- bridge 是否在线。
- session id 是否能匹配。
- transcript 是否能解析。

但不会触发 Goofy 部署。

实际验证时，bridge 返回了：

```json
{
  "ok": true,
  "intent": "find",
  "session": {
    "provider": "codex",
    "threadName": "调整博客目录布局"
  },
  "match_type": "id"
}
```

这说明 Kodama 的分享按钮在真实点击时，只差最后一步“生成链接”，而这一步由 bridge 已有逻辑负责。

## 第 8 个问题：成功后要把链接复制出来

分享完成后，不应该只在气泡里写“成功”。用户大概率要把这个链接发给别人。

所以 main process 拿到 URL 后会：

```js
clipboard.writeText(url);
```

renderer 再弹出一个常驻气泡：

```text
分享链接已生成，已复制
```

这个气泡本身带 `url`，所以点击它也能打开网页快照。

这又回到了系列第一篇说的原则：通知应该带定位上下文。分享成功不是一句文案，而是一个可点击目标。

## 小结：从“日志文件”到“会话对象”

这一阶段最大的变化，是把本地 Agent 记录从“文件”升级成“会话对象”。

以前：

```text
event -> transcriptPath -> open JSONL
```

现在：

```text
event
  -> sessionRequest
  -> open Codex / activate terminal
  -> preview transcript
  -> share via bridge session-share API
```

这背后的关键学习有六个：

1. JSONL 是数据源，不是用户界面。
2. 点击气泡应该回到 App/终端，而不是打开日志文件。
3. fallback 打开错误目标，比直接提示失败更糟。
4. hover 摘要只需要展示“这个会话在干什么”，不要做详情页。
5. 分享复用 bridge 的 session-share 和 Goofy Preview，不重新实现部署。
6. renderer 不碰 bridge token，敏感请求都放在 Electron main process。

到这里，Kodama 已经从一个“会动的宠物”变成了一个小型 Agent 状态入口：它能提醒、能回顾、能跳转、能分享，而且尽量不挡住用户正在做的事。

后续还可以继续做的方向有很多：更好的会话标题提取、跨 App 的活体 session 索引、更多 Agent 来源、离线状态解释、以及把桌宠状态和长期记忆结合起来。但这三个基础问题先解决以后，它才真正变成一个可用工具。

