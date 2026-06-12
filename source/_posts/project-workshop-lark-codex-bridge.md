---
title: "在飞书 @ 一下机器人，让本地 Codex 干活：我的 lark-codex-bridge 拆解"
date: 2026-06-12 21:00:00
tags: [飞书, Codex, AI Agent, Node.js, 工具开发]
categories: [技术笔记, 项目工坊]
---

我平时的代码任务大多交给本机的 Codex CLI 跑。问题是人不可能一直坐在 Mac 前面：在工位开会、在路上、在另一台电脑前，想让它"帮我查一下那个报错"就只能等回家。所以我写了 [lark-codex-bridge](https://github.com/Syfyivan/lark-codex-bridge)——一个跑在我 Mac 上的 Node.js 进程，在飞书里 @ 一下机器人，消息就会变成一条 `codex exec` 任务在本机执行，执行过程实时刷新一张进度卡片，跑完后卡片原地变成最终答案。

之前我拆过朋友的 lark-codex-bot，那是另一种做法：公网 hub 收 webhook，家里 worker 长轮询领任务。我的 bridge 走了相反的路线——**不要公网回调，整个系统就是本机一个进程**，事件靠 `lark-cli event +subscribe` 的 WebSocket 长连接推进来。这篇把我自己的设计取舍拆开讲。

## 整体数据流

一句话版本：lark-cli 把飞书事件变成 stdout 上的 NDJSON，bridge 逐行消费，过滤后喂给 `codex exec` 子进程，再用 lark-cli 把进度卡片和最终回复发回去。

```text
飞书消息 / 卡片点击
  -> lark-cli event +subscribe（长连接，NDJSON 输出）
  -> handleEvent：去重 / 发送者过滤 / @提及判断 / 命令路由
  -> codex exec 子进程（--json 进度流 + --output-last-message）
  -> 进度卡片（发送 -> 节流更新 -> 原地替换为最终答案）
```

整个项目零运行时依赖，入口 `lark-codex-bridge.mjs` 负责事件路由和生命周期，可单测的纯逻辑抽到 `src/` 下的小模块里（codex-runner、sender-policy、sensitive-policy、ops-policy 等）。

## 第一步：不要 webhook，用长连接收事件

接飞书机器人的传统做法是配置事件回调地址，于是你需要公网 HTTPS、URL 校验、Encrypt Key 解密这一整套。我的取舍是把这些全部外包给 lark-cli——它支持以 bot 身份建立事件长连接，把每条事件压缩成一行 JSON 打到 stdout。bridge 只需要 spawn 它然后逐行读（`lark-codex-bridge.mjs`）：

```js
function startEventSubscription() {
  const sub = spawn(
    config.larkCliBin,
    ['event', '+subscribe', '--as', 'bot',
     '--event-types', config.larkEventTypes,
     '--compact', '--quiet'],
    { stdio: ['ignore', 'pipe', 'inherit'], env },
  );

  sub.stdout.on('data', appendLineBuffer(async line => {
    const event = JSON.parse(line);
    await handleEvent(event);
  }));
  sub.on('exit', code => {
    console.error(`[bridge] lark-cli event subscription exited with code ${code}`);
    process.exit(code ?? 1);
  });
  return sub;
}
```

两个细节。一是 `appendLineBuffer`：TCP 流不保证按行到达，必须自己攒缓冲区切 `\n`。二是子进程退出时 bridge 直接跟着退——我没有在进程内做重连，而是把"挂了就拉起来"交给 macOS LaunchAgent 的 `KeepAlive`，职责更干净。

订阅的事件类型默认是 `im.message.receive_v1`，开了进度卡片后还要加 `card.action.trigger`（卡片按钮回调）。这套架构的代价是**一个 bot app 同时只能有一个 `event +subscribe` 消费者**，启动第二份会直接报错——这是我踩过的坑，后面说。

## 第二步：这条消息到底该不该我管

群里每条消息都会推过来，bridge 必须快速判断"是不是在叫我"。看起来就是查 mentions 数组，实际上我写了三层回退（`shouldHandleEvent`）：

```js
async function shouldHandleEvent(event, rawText) {
  if (!config.requireMentionInGroup) return true;
  if (extractChatType(event) === 'p2p') return true;

  if (eventMentionsBot(event) || textMentionsBot(rawText)) return true;
  if (!textHasAnyAt(rawText)) return false;

  return fetchedMessageMentionsBot(extractMessageId(event));
}
```

- **第一层**：解析事件里的 mentions 结构。坑在于飞书事件的 mention 字段嵌套形态不统一，`open_id` 可能出现在 `mention.id`、`mention.open_id`、`mention.id.open_id` 等好几个位置，所以 `mentionMatchesBot` 把十几种键名拍平了挨个比对，再兜底比对显示名。
- **第二层**：纯文本匹配 `@机器人名`——有些转发或机器人代发的消息没有结构化 mention。
- **第三层**：文本里有 `@` 痕迹但前两层都没命中时，调 `lark-cli im +messages-mget` 反查这条消息的完整结构再判断一次。这层有独立超时，查不到就放弃，不阻塞主流程。

进 mention 判断之前还有一道 `shouldSkipSender`（`src/sender-policy.mjs`）：自己发的消息直接跳过；bot/app 类型的发送者默认忽略，防止两个机器人互相回复刷屏。对于确实需要 bot 对话的场景，我在回复里埋了一个 `bridge_trace` 计数标记，配合 `LOOP_MAX_TURNS=3` 给 bot-to-bot 的接力设上限——这是被一次"两个 bridge 互相礼貌问候到天亮"的测试教育出来的。

## 第三步：codex exec 跑任务，stdout 变成进度

通过过滤的消息最终落到 `executeDirectCodexTask`，由 `src/codex-runner.mjs` 拼出一条 `codex exec` 命令：

```js
args.push(
  '--cd', cwd,
  '--sandbox', sandbox,
  '--output-last-message', outputFile,
  '--color', 'never',
);
if (progress) args.push('--json');
if (config.codexEphemeral) args.push('--ephemeral');
args.push('-');
```

`--output-last-message` 是关键：Codex 把最终回答单独写进一个临时文件，bridge 不用从滚动的 stdout 里"猜"哪段是答案。而 stdout 在 `--json` 模式下变成事件流，`parseCodexProgressLine` 把它翻译成人能看的进度条目：

```js
function summarizeFunctionCall(payload) {
  const name = payload?.name || payload?.function_name || 'tool';
  if (name === 'exec_command' && args?.cmd) return `运行命令：${args.cmd}`;
  if (name === 'web_search' || name === 'search_query') return '检索资料';
  if (name === 'apply_patch') return '修改本地文件';
  return `调用工具：${name}`;
}
```

所以飞书卡片上看到的"运行命令：rg xxx"、"检索资料"，就是 Codex 的 function_call 事件被逐行翻译的结果。同一个解析函数还兼容了 `event_msg`、`item.completed`、`response_item` 三代事件格式——Codex CLI 的 JSON 输出在版本间变过，与其锁版本不如都认。

## 第四步：一张卡片从"正在分析"到最终答案

长任务最差的体验是 @ 完机器人后五分钟没动静。我的方案是任务一启动就回一张交互卡片，之后**原地更新这张卡片**而不是刷屏发新消息。`createProgressReporter` 里有两个工程细节值得说：

```js
scheduleUpdate(force) {
  if (this.updateDisabled || !this.messageId) return;
  const now = Date.now();
  if (!force && now - this.lastUpdateAt < config.progressCardUpdateIntervalMs) return;
  this.lastUpdateAt = now;
  this.updateQueue = this.updateQueue
    .then(() => updateCardMessage(this.messageId, buildProgressCard(state)))
    .catch(error => { this.updateDisabled = true; /* ... */ });
},
```

一是**节流**：Codex 的进度事件可能一秒好几条，但卡片 PATCH 是飞书 OpenAPI 调用，默认 8 秒最多更新一次（任务结束时 `force` 强制刷一次）。二是**串行化**：所有更新挂在一条 `updateQueue` promise 链上，保证不会出现两个 PATCH 并发导致旧状态覆盖新状态；一旦更新失败就置 `updateDisabled`，静默降级而不是反复重试打爆接口。

任务结束时 `finish(finalText)` 把卡片状态切到 `done`，`buildProgressCard` 渲染时不再展示过程列表，整张卡片变成绿色头部 + Markdown 答案。答案用卡片的 `markdown` 组件渲染，代码围栏能正常显示——这里还有个小函数 `closeUnclosedCodeFence`：答案被长度截断时可能把 ``` 切掉一半，渲染会整段乱掉，所以发送前自动补全未闭合的围栏。

## 权限：不是所有人都能让我的 Mac 写文件

这是 bridge 和"玩具 demo"差别最大的部分。机器人在群里，意味着**任何群成员都能给我的 Mac 下指令**，必须分级。

我的做法是在 Codex 启动前先做一次关键词分类（`src/sensitive-policy.mjs`）：删除/写文件、git commit/push、部署发布、装依赖、外发消息、代码平台 approve 这几类正则一旦命中就标记为敏感操作。然后按请求人分流：

- **我自己（owner）**：敏感操作直接放行，用 `CODEX_SANDBOX` 配置的沙箱跑。
- **其他人 + 普通查询**：照样执行，但 cwd 换成一次性临时目录（`mkdtempSync` 出来的 scratch dir），沙箱用 `CODEX_NON_OWNER_SANDBOX`，并且在 prompt 里注入一段守卫文本，明确"可以读真实工作区、跑只读诊断命令，禁止任何落盘修改"。代码里还有一条硬规则：非 owner 沙箱即使配成 `danger-full-access` 也会被强制降级为 `workspace-write`。
- **其他人 + 敏感操作**：不执行，转成一张审批卡片私发给我，我点"同意"后才以原请求重跑。

另外有一组 owner 专属的运维命令（`src/ops-policy.mjs`），在飞书里 @ 机器人发 `/health`、`/version`、`/logs 40` 就能看 bridge 的健康状态、沙箱配置和最近日志——人在外面时不用 SSH 回去就能确认服务活着。校验逻辑很朴素：发送者 open_id 不是我本人直接拒绝。中英文命令都认，`/日志 40` 也行。

## 踩过的坑

- **重复消费**。长连接模型下一个 app 只能有一个订阅者，我有次前台调试时忘了 LaunchAgent 还在跑，两个进程抢事件，表现是消息时灵时不灵。后来 lark-cli 加了互斥报错，bridge 的 README 里也专门写了排查路径。
- **消息重放**。飞书事件偶尔会重推，bridge 用内存 Set 按 message_id 去重；发消息侧再加 `--idempotency-key` 双保险，保证审批、回复这类操作天然幂等。
- **卡片更新覆盖**。早期版本没有 updateQueue，两次 PATCH 并发时偶现进度"倒退"，串行化之后消失。
- **Markdown 发送失败**。`--markdown` 富文本偶尔因为内容触发飞书侧校验失败，bridge 会自动降级用 `--text` 重发一次，宁可丑也不能丢回复。

## 部署一个自己的

仓库可以直接从 GitHub 跑，不依赖 npm 发包：

```bash
mkdir -p ~/lark-codex-bridge-run && cd ~/lark-codex-bridge-run
npm exec --yes --package github:Syfyivan/lark-codex-bridge#main -- lark-codex-bridge init
# 编辑 .env：填 bot 的 open_id、提及名、CODEX_CWD 等
npm exec --yes --package github:Syfyivan/lark-codex-bridge#main -- lark-codex-bridge doctor
npm exec --yes --package github:Syfyivan/lark-codex-bridge#main -- lark-codex-bridge
```

`doctor` 会检查 lark-cli、Codex CLI、事件类型配置是否齐全。长期运行建议用仓库里的 `launchagent.example.plist`：替换掉所有 `/Users/YOUR_USER` 占位符后 `launchctl bootstrap` 装载，`RunAtLoad` + `KeepAlive` 保证开机自启、异常退出自动拉起，stdout/stderr 落到独立日志文件。机器人权限上，一个最小回复 bot 只需要群内消息读取和 bot 发消息的 scope，进度卡片再加 `card.action.trigger` 事件订阅即可。

回头看，这个项目里我最满意的不是某段代码，而是几条边界的划法：公网接入交给 lark-cli 长连接，进程保活交给 LaunchAgent，任务执行交给 codex exec 的沙箱——bridge 自己只做路由、节流和权限这三件"中间的事"。中间层做得越薄，两头升级时它越不容易坏。

代码在 [GitHub](https://github.com/Syfyivan/lark-codex-bridge)，欢迎拆。
