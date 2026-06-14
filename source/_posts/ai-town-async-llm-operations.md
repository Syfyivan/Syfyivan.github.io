---
title: "AI Town 课程 05：异步 LLM，让慢思考离开主循环"
date: 2026-06-14 13:00:00
tags: [AI, Agent, AI Town, LLM, 异步, 课程]
categories: [技术笔记]
---

在第 1 讲里我留过一句话：智能体可以异步思考，但状态机必须同步裁决。

那时候只是抛了个结论。这一讲我想把它拆开，看 AI Town 到底是怎么把这条边界落到代码里的。因为这是我读这套代码时收获最大的一块：它不是“接了个 LLM”，而是认真处理了一个很容易被忽略的工程问题——LLM 慢，主循环快，这两件东西不能放在同一根时间线上跑。

## 先看冲突：游戏循环是同步的，LLM 不是

回忆一下 AI Town 的世界是怎么前进的。

一次 step 里，引擎在内存里连续推进很多个 tick。每个 tick 处理输入、移动角色、更新对话状态，最后算出 diff 写回数据库，再调度下一次 step。整个过程是串行的，而且必须串行——这是它能像写单机游戏一样推理状态的前提。

现在问题来了：Agent 要思考。

它得决定下一句话说什么，得回忆和对方之前聊过什么，得判断要不要发起一次新对话。这些事大多要调 LLM 或者向量检索。而一次 LLM 调用是什么量级？几百毫秒到几秒，偶尔超时，偶尔 429，偶尔直接挂掉。

如果在 tick 里直接 `await chatCompletion(...)`，会发生什么？

整个 world 会被一个角色的思考卡住。Alice 在等模型生成台词的那两秒里，Bob 不能走路，Carol 不能开始对话，用户的点击也排在后面。更糟的是，tick 是在一个事务边界里跑的，你不可能让一个数据库事务挂起好几秒去等一个外部 HTTP 请求——Convex 的 mutation 根本不允许你这么干。

所以结论很硬：**LLM 调用绝对不能出现在游戏主循环里。** 它必须被踢到别的地方去跑。

## 解法：tick 只负责“标记”，不负责“执行”

AI Town 的做法，我觉得是整套设计里最优雅的一笔。

它把 Agent 的行为切成两层：

- 第一层是 `Agent.tick`，跟着引擎同步跑，只做轻量判断；
- 第二层是异步 operation，真正的 LLM 调用作为独立的 Convex action 去跑。

关键在于这两层怎么衔接。tick 不去调 LLM，它只做一件事：**决定“现在该思考了”，然后登记一个待办。** 真正的慢操作被攒起来，等这次 step 把状态 diff 算完、写库的时候，才作为 action 异步 kick 出去。

来看 `convex/aiTown/agent.ts` 里的 `startOperation`：

```ts
startOperation<Name extends keyof AgentOperations>(
  game: Game,
  now: number,
  name: Name,
  args: Omit<FunctionArgs<AgentOperations[Name]>, 'operationId'>,
) {
  if (this.inProgressOperation) {
    throw new Error(
      `Agent ${this.id} already has an operation: ${JSON.stringify(this.inProgressOperation)}`,
    );
  }
  const operationId = game.allocId('operations');
  console.log(`Agent ${this.id} starting operation ${name} (${operationId})`);
  game.scheduleOperation(name, { operationId, ...args } as any);
  this.inProgressOperation = {
    name,
    operationId,
    started: now,
  };
}
```

注意这里没有任何 `await`，没有任何网络调用。它只做了三件事：

1. 分配一个 `operationId`；
2. 调 `game.scheduleOperation(...)` 把这个操作攒进一个待办列表；
3. 在 Agent 自己身上记一笔 `inProgressOperation`，写明操作名、id 和启动时间。

`scheduleOperation` 本身更克制，它在 `convex/aiTown/game.ts` 里就一行：

```ts
scheduleOperation(name: string, args: unknown) {
  this.pendingOperations.push({ name, args });
}
```

它连调度都没做，只是 push 到 `pendingOperations`。真正的 kick 发生在 step 收尾、保存 diff 的时候，同样在 game.ts：

```ts
// Start the desired agent operations.
for (const operation of diff.agentOperations) {
  await runAgentOperation(ctx, operation.name, operation.args);
}
```

这个顺序很重要。tick 在纯内存里跑完，状态 diff 落库，然后才把异步操作派发出去。换句话说，**引擎自始至终没有等过 LLM**。它只是在内存里改了改 Agent 的标记位，剩下的脏活累活交给了别的进程。

## tick 是怎么决定“该思考了”的

回到 `agent.ts` 的 `tick` 方法。它本质上是一个状态机，每次被引擎调用时，从当前处境推断“现在最该发起哪个 operation”。

最典型的几个分支：

- 不在对话里、也没在活动、也没在赶路，就发起 `agentDoSomething`，让 Agent 去找人搭讪或者随便逛逛；
- 身上挂着一个 `toRemember`，说明刚结束一段对话需要归档，就发起 `agentRememberConversation`，把对话总结成记忆；
- 在对话里、轮到自己说话了，就发起 `agentGenerateMessage`，让 LLM 生成台词。

以对话中生成消息为例：

```ts
if (member.status.kind === 'participating') {
  // ...省略一堆 cooldown 和超时判断...
  // Grab the lock and send a message!
  const messageUuid = crypto.randomUUID();
  conversation.setIsTyping(now, player, messageUuid);
  this.startOperation(game, now, 'agentGenerateMessage', {
    worldId: game.worldId,
    playerId: player.id,
    agentId: this.id,
    conversationId: conversation.id,
    otherPlayerId: otherPlayer.id,
    messageUuid,
    type: 'continue',
  });
  return;
}
```

我想强调 tick 在 `startOperation` 前后做的几件事，因为它们都是“同步裁决”的体现：

- `conversation.setIsTyping(...)` 先在世界状态里抢下“正在打字”的锁，这是同步的、立刻生效的；
- 给这条消息生成一个 `messageUuid`，后面异步结果回来时拿它对账；
- 一旦 `startOperation`，立即 `return`，这一帧不再做别的。

也就是说，tick 在动手发起慢操作之前，先把所有“快状态”改好——抢锁、记标记、设超时。等 LLM 回来时，世界已经知道“有人正在为这条对话思考”，不会再让第二个 Agent 插进来。

## 防重复触发：一个 Agent 同时只能有一个在途操作

这是我觉得最该抄走的一条规则。

如果不加约束，一个 Agent 可能在连续几个 tick 里反复发起 LLM 请求。结果就是同一个角色同时挂着三四个在途请求，A 请求比 B 请求晚发但先回，覆盖了更新的决策——这种乱序在真实 Agent 应用里太常见了。

AI Town 用一个极简的机制堵死它：`inProgressOperation`。

`startOperation` 开头那句 `if (this.inProgressOperation) throw` 是第一道闸：只要身上还挂着没结束的操作，再想发起新操作直接抛错。而 `tick` 一进来就先检查它：

```ts
if (this.inProgressOperation) {
  if (now < this.inProgressOperation.started + ACTION_TIMEOUT) {
    // Wait on the operation to finish.
    return;
  }
  console.log(`Timing out ${JSON.stringify(this.inProgressOperation)}`);
  delete this.inProgressOperation;
}
```

逻辑非常清楚：身上有在途操作，就什么都不做，直接 `return` 等它回来。这一帧 Agent 不思考、不说话、不行动，老老实实等。一个 Agent，一次只有一个慢思考在飞。

那操作怎么算“结束”？这就接到异步那一头了。

## 异步那头：action 跑 LLM，结果变成 input 回到引擎

慢操作的实现都在 `convex/aiTown/agentOperations.ts`，每个都是 `internalAction`。以生成消息为例：

```ts
export const agentGenerateMessage = internalAction({
  args: { /* ...worldId, playerId, agentId, operationId, type, messageUuid... */ },
  handler: async (ctx, args) => {
    let completionFn;
    switch (args.type) {
      case 'start':    completionFn = startConversationMessage;    break;
      case 'continue': completionFn = continueConversationMessage; break;
      case 'leave':    completionFn = leaveConversationMessage;    break;
      default:         assertNever(args.type);
    }
    const text = await completionFn(
      ctx, args.worldId,
      args.conversationId as GameId<'conversations'>,
      args.playerId as GameId<'players'>,
      args.otherPlayerId as GameId<'players'>,
    );

    await ctx.runMutation(internal.aiTown.agent.agentSendMessage, {
      worldId: args.worldId,
      conversationId: args.conversationId,
      agentId: args.agentId,
      playerId: args.playerId,
      text,
      messageUuid: args.messageUuid,
      leaveConversation: args.type === 'leave',
      operationId: args.operationId,
    });
  },
});
```

这就是 action 能干而 mutation 不能干的事：里面那个 `await completionFn(...)` 会一路调到 `util/llm.ts` 的 `chatCompletion`，是个实打实的几秒级网络请求。因为它跑在 action 里，慢就慢，不影响任何人。

重点在最后那步 `runMutation`。LLM 出了文本之后，action **没有直接去改世界状态**，而是写一条消息进库、再投递一个名叫 `agentFinishSendingMessage` 的 input。这条 input 会在下一次 step 里被引擎消费。

这正是第 1 讲那条边界的代码原型：

```text
Agent.tick 不等 LLM
LLM action 不直接改 engine 状态
action 完成后提交 input
engine 在下一次 step 中消费 input
```

LLM 的结果不是“直接写入世界”，而是“申请改变世界”。改世界的权力始终攥在单线程引擎手里。

那个 input 落地时，会在 `convex/aiTown/agentInputs.ts` 里被处理，这里藏着对账逻辑：

```ts
if (
  !agent.inProgressOperation ||
  agent.inProgressOperation.operationId !== args.operationId
) {
  console.debug(`Agent ${agentId} wasn't sending a message ${args.operationId}`);
  return;
}
delete agent.inProgressOperation;
```

看明白这段，整条链就闭环了。引擎拿到回来的 input，先核对 `operationId`：如果 Agent 现在压根没在途操作，或者在途的那个 id 跟回来的对不上，就直接丢弃。只有完全匹配，才 `delete agent.inProgressOperation`，把这个 Agent 重新释放出来，下次 tick 它就能发起新思考了。

`operationId` 在这里是一张配对凭证。它防的就是“迟到的回包覆盖新状态”：万一某个旧操作超时被 tick 强行 `delete` 掉、Agent 又发起了新操作，那个迟到的旧回包带着旧 id 回来时，对不上账，自动作废。`finishDoSomething`、`finishRememberConversation` 用的是同一套对账模式。

## 超时与失败恢复：让系统自己兜底

异步意味着会出岔子。请求可能永远不回来，可能挂在某个网络黑洞里。AI Town 的恢复机制朴素但够用。

**超时靠 tick 自己兜。** 前面那段 `now < this.inProgressOperation.started + ACTION_TIMEOUT` 就是。`ACTION_TIMEOUT` 在 `constants.ts` 里配成 `120_000`（本地开发给得宽，注释里写正常是 60 秒）。一旦超过这个时长在途操作还没回来，tick 不再傻等，直接把 `inProgressOperation` 删掉，Agent 解套，下一帧重新决策。哪怕那个 action 是真的卡死了，世界也不会被它永久绑架。

**重试靠 `util/llm.ts` 自己扛。** 单次网络抖动不该惊动整个状态机。LLM 封装层把重试关在了自己屋里，外面看不见。

## util/llm.ts：把不确定性关进一个封装里

`convex/util/llm.ts` 是整套异步设计的最底层。文件开头有句很得意的注释：“That's right! No imports and no dependencies”——它不依赖任何 SDK，直接 `fetch` 打 OpenAI 兼容的接口。

它干了三件值得说的事。

**第一，把 provider 抽象掉。** `getLLMConfig()` 根据环境变量决定走 OpenAI、Together、Ollama 还是自定义 endpoint，统一返回 `url`、`chatModel`、`embeddingModel`、`stopWords`、`apiKey`。上层的 `chatCompletion` 完全不关心背后是谁，调用方只管发 messages。这个仓库默认走本地 Ollama（`http://127.0.0.1:11434`，chatModel 默认 `llama3`），改个环境变量就能切到别的家。

**第二，重试退避收口在 `retryWithBackoff`。**

```ts
const RETRY_BACKOFF = [1000, 10_000, 20_000]; // In ms
const RETRY_JITTER = 100; // In ms

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
): Promise<{ retries: number; result: T; ms: number }> {
  let i = 0;
  for (; i <= RETRY_BACKOFF.length; i++) {
    try {
      const start = Date.now();
      const result = await fn();
      const ms = Date.now() - start;
      return { result, retries: i, ms };
    } catch (e) {
      const retryError = e as RetryError;
      if (i < RETRY_BACKOFF.length) {
        if (retryError.retry) {
          await new Promise((resolve) =>
            setTimeout(resolve, RETRY_BACKOFF[i] + RETRY_JITTER * Math.random()),
          );
          continue;
        }
      }
      if (retryError.error) throw retryError.error;
      else throw e;
    }
  }
  throw new Error('Unreachable');
}
```

两个细节我很喜欢。一是 backoff 是 1 秒、10 秒、20 秒的阶梯，外加随机 jitter——加 jitter 是为了避免多个 Agent 在同一时刻被同一个 429 打回、然后又在同一时刻齐刷刷重试，把后端二次打爆。二是它区分“可重试”和“不可重试”：抛错时带个 `retry` 布尔，只有 `retry` 为真才退避重试。在 `chatCompletion` 里，这个判断是 `result.status === 429 || result.status >= 500`——限流和服务端错误才重试，4xx 的参数错误重试也没用，直接抛。

**第三，调用层薄而直接。** `chatCompletion` 把 `getLLMConfig()` 拿到的 model、stopWords 拼进请求，用 `retryWithBackoff` 包住一次 `fetch`，非流式就取 `json.choices[0].message?.content` 返回，顺带把 `retries` 和 `ms` 一起带出来，方便上层观测每次调用重试了几次、花了多久。`fetchEmbedding`、`fetchModeration` 是同样的套路。整个文件没有状态，纯函数式，谁来调都一样。

至于 prompt 怎么拼，是 `convex/agent/conversation.ts` 的活。`startConversationMessage` 会先 `embeddingsCache.fetch` 算一个查询向量，再 `memory.searchMemories` 召回相关记忆，把人设、计划、历史对话、相关记忆拼成一个长 system prompt，最后才 `chatCompletion`。这些全部跑在 action 里，跑多久都不碰主循环——这正是把它放进 action 而不是 mutation 的全部理由。

## 踩坑清单

读完这套设计，我把容易踩的坑记下来，给做类似系统的人省点事。

**重复 operation。** 没有 `inProgressOperation` 这道闸，Agent 会在连续 tick 里反复 kick LLM，既烧 token 又制造乱序回包。务必保证“一个 Agent 一个在途操作”，并且用 id 对账，别用名字或时间戳去猜。

**孤儿任务。** 异步 action 一定有回不来的时候。如果只靠 action 自己回调来清状态，一旦它死了，Agent 就被永久挂起。必须在同步侧加超时兜底——AI Town 把超时判断放在 tick 里，主循环每帧都有机会替孤儿任务收尸。

**节流和冷却。** 光防重复还不够。`tick` 里那一堆 `CONVERSATION_COOLDOWN`、`MESSAGE_COOLDOWN`、`ACTIVITY_COOLDOWN` 不是装饰：刚结束对话别立刻再搭讪，每条消息之间留点“阅读时间”，活动有冷却。没有这些节流，Agent 会变成一台不知疲倦的 LLM 调用机器。`agentOperations.ts` 里那些 `await sleep(Math.random() * 1000)` 也是同理——错开发送 input 的时刻，作者甚至在注释里直说这是为了缓解 OCC 写冲突。

**成本。** 每个在途操作都是真金白银。把慢操作收敛成“有限、可去重、可超时”的离散事件，而不是放任 Agent 想调就调，是控制成本的根本。记忆要先 summary 再写、检索只取 top-k、embedding 走缓存（`embeddingsCache`），这些都是省钱的同一类动作。

## 小结与迁移启发

这一讲其实只讲了一件事：**把“快主循环”和“慢 LLM”彻底分层。**

AI Town 的做法可以压成一句话——同步的 tick 只负责裁决和标记，异步的 action 负责真正的慢思考，两者之间用 input 和 operationId 对账握手，引擎永远是唯一能改世界的人。

这套结构跟像素小镇没有半点关系，任何 Agent 系统都用得上：

- 任何会调 LLM、向量检索、外部 API 的 Agent，都该把这些慢操作从主决策循环里剥出去，做成异步任务；
- 任何异步任务都要有 id 对账，防止迟到回包覆盖新状态；
- 任何在途操作都要有同步侧的超时兜底，别指望回调一定回来；
- 任何会自发触发外部调用的 Agent，都要配冷却和“单一在途”约束，否则成本和乱序会一起失控。

说到底，LLM 在这套系统里从来不是中心。它只是一个会迟到、会失败、会花钱的异步组件。真正的中心，是那个永远不被它阻塞的状态机。

## 参考资料

- 本讲源码：`convex/aiTown/agent.ts`、`convex/aiTown/agentOperations.ts`、`convex/aiTown/agentInputs.ts`、`convex/aiTown/game.ts`、`convex/agent/conversation.ts`、`convex/util/llm.ts`、`convex/constants.ts`
- [AI Town GitHub Repository](https://github.com/a16z-infra/ai-town)
- [Convex Actions](https://docs.convex.dev/functions/actions)
- [Convex Scheduled Functions](https://docs.convex.dev/scheduling/scheduled-functions)
