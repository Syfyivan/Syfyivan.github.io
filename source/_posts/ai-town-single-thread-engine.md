---
title: "AI Town 课程 03：单线程 Step，把世界设计成一个 Actor"
date: 2026-06-14 11:00:00
tags: [AI, Agent, AI Town, 状态机, 并发, 课程]
categories: [技术笔记]
---

第 1 讲里我用一节的篇幅讲过 AI Town 的"单线程 step"，结论是：核心世界状态只允许 game engine 修改，外部世界只能提交 input。

那是产品级的说法。这一篇我想把它拆到函数级，回答几个具体问题：input 到底落在哪张表、引擎怎么把一批 input 串行喂进去、为什么要在内存里连推几百个 tick、最后凭什么只写一次数据库就够了。

我会贴几段真实源码，全部来自 `convex/` 目录，路径和函数名都标出来，不编造。

## 问题：多 Agent + 多用户同时写状态会乱

先把场景摆清楚。

一个 world 里有几十个 player，每个 NPC 背后是一个 Agent。同一时刻可能发生的写操作有：用户点地图让角色移动、用户加入或离开、两个 NPC 开始一段对话、某个 Agent 的 LLM 刚返回想说一句话、对话结束要落一条记忆。

如果这些逻辑各自直接写数据库，问题立刻来：两个任务同时改同一个角色的位置；LLM 慢半拍回来，覆盖了更新的状态；用户输入和 Agent 输入谁先谁后没法保证；重试的任务把同一个事件处理两遍；前端订阅到一个写了一半的世界。

这是一切多 Agent 系统都会撞上的并发地狱。

## 为什么是"单线程串行 step"而不是加锁

直觉的解法是加锁：给每个 player 一把锁，谁改谁先抢。但锁会带来死锁、粒度难调、跨事务难协调一堆新问题，而且加了锁，系统本质上还是并发的，只是把并发推迟到了锁竞争里。

AI Town 选了另一条路：根本不让并发发生。

它把每个 world 当成一个 actor。外部谁都不能直接改世界，所有人只能往一个队列里发消息；world 内部有且只有一个引擎，一次只从队列头取一批消息、串行处理。这样写游戏逻辑时不用想锁，也不用想事务冲突，思维模型退化成单机游戏循环：读输入 → 推状态 → 输出新状态。

注意这里的"单线程"不是说底层只有一个 CPU 线程，而是业务语义上同一个 world 的状态由一个引擎串行拥有。并发依然存在于系统的边缘——很多 mutation 可以同时往队列里塞消息——但状态变更这件最危险的事被收敛成了串行。

## 输入先落 inputs 表，引擎串行消费

外部世界改变 world 的唯一入口，是往 `inputs` 表里插一行。

我们先看这张表的形状，在 `convex/engine/schema.ts`：

```ts
// convex/engine/schema.ts
const input = v.object({
  engineId: v.id('engines'),
  // Monotonically increasing input number within a world starting at 0.
  number: v.number(),
  name: v.string(),
  args: v.any(),
  returnValue: v.optional(/* ok | error */),
  received: v.number(),
});

export const engineTables = {
  inputs: defineTable(input).index('byInputNumber', ['engineId', 'number']),
  engines: defineTable(engine),
};
```

三个字段是关键。`number` 是这个引擎内部单调递增的序号，从 0 开始；`name` 是要执行的 input handler 名字；`args` 是动态类型的参数。`received` 是服务端收到的时间戳。表上建了一个 `byInputNumber` 索引，按 `(engineId, number)` 排序——这就是后面引擎能顺序消费的物理基础。

写入这一行的入口在 `convex/aiTown/insertInput.ts`，它薄薄一层，先把 worldId 翻译成 engineId，再调底层的 `engineInsertInput`：

```ts
// convex/aiTown/insertInput.ts
export async function insertInput<Name extends InputNames>(
  ctx: MutationCtx,
  worldId: Id<'worlds'>,
  name: Name,
  args: InputArgs<Name>,
): Promise<Id<'inputs'>> {
  const worldStatus = await ctx.db.query('worldStatus')...unique();
  return await engineInsertInput(ctx, worldStatus.engineId, name, args);
}
```

真正分配序号的逻辑在 `convex/engine/abstractGame.ts` 的 `engineInsertInput`：它先查这个引擎当前最大的那条 input，新序号等于上一条加一，没有就从 0 起。这一步发生在 mutation 事务里，所以"读到最大 number、写入 number+1"是原子的，不会两条 input 抢到同一个号。

到这里要点已经成立：**外部所有变化——用户点击、Agent 决策、LLM 结果——都不直接改世界，而是变成 inputs 表里一行带序号的消息。** 这就是 actor 的信箱。

## 内存里推进多个 tick，最后算 diff 写回（为什么这么省）

引擎那一侧的主循环在 `AbstractGame.runStep`，这是整篇最值得逐行看的函数。

```ts
// convex/engine/abstractGame.ts  AbstractGame.runStep
async runStep(ctx: ActionCtx, now: number) {
  const inputs = await ctx.runQuery(internal.engine.abstractGame.loadInputs, {
    engineId: this.engine._id,
    processedInputNumber: this.engine.processedInputNumber,
    max: this.maxInputsPerStep,
  });

  const lastStepTs = this.engine.currentTime;
  const startTs = lastStepTs ? lastStepTs + this.tickDuration : now;
  let currentTs = startTs;
  // ...
  while (numTicks < this.maxTicksPerStep) {
    numTicks += 1;
    // Collect all of the inputs for this tick.
    const tickInputs = [];
    while (inputIndex < inputs.length) {
      const input = inputs[inputIndex];
      if (input.received > currentTs) break;
      inputIndex += 1;
      processedInputNumber = input.number;
      tickInputs.push(input);
    }
    for (const input of tickInputs) {
      // handleInput, 捕获异常，记录 returnValue
    }
    this.tick(currentTs);
    const candidateTs = currentTs + this.tickDuration;
    if (now < candidateTs) break;
    currentTs = candidateTs;
  }
  // commit
}
```

把这段拆开看，做了四件事。

第一，加载这一步要处理的 input。`loadInputs` 用 `byInputNumber` 索引，取 `number` 大于 `processedInputNumber` 的、按升序排的、最多 `maxInputsPerStep` 条。`processedInputNumber` 是引擎记在自己身上的"我已经消费到第几号"，所以这就是从信箱队头继续往下读。注意它是排好序的——序号严格决定处理顺序。

第二，在内存里按 tick 推进时间。`tickDuration` 在 `Game` 里是 16ms，一个 step 最多 `maxTicksPerStep = 600` 个 tick，也就是一次 step 能在内存里模拟将近 10 秒的世界。每个 tick 里，它把 `received` 时间戳落在当前 tick 之前的 input 收集起来喂给 `handleInput`，然后调一次 `this.tick(currentTs)` 把整个世界往前推 16ms。

第三，关键在这里：**这 600 个 tick 全程在内存里跑，不碰数据库。** player 移动、寻路、对话状态机流转、Agent 决策，每个 tick 都在改内存里的 `World` 对象。数据库在整个 while 循环里是安静的。

第四，循环结束才提交一次。看 `runStep` 末尾：

```ts
// convex/engine/abstractGame.ts  runStep commit 段
const expectedGenerationNumber = this.engine.generationNumber;
this.engine.currentTime = currentTs;
this.engine.generationNumber += 1;
this.engine.processedInputNumber = processedInputNumber;
const { _id, _creationTime, ...engine } = this.engine;
const engineUpdate = { engine, completedInputs, expectedGenerationNumber };
await this.saveStep(ctx, engineUpdate);
```

它把推进后的引擎元数据、这一步处理完的 input 列表打包成一个 `engineUpdate`，连同世界状态的 diff 一起写回。**几百个 tick 的演化，最终只产生一次数据库写。**

为什么这么省，现在就清楚了：如果每个 tick 都写库，那是每秒几十次写、乘以每个角色每个字段，写放大到不可接受。AI Town 的做法是让内存承担高频演化，数据库只承担低频快照。这也正好接上第 1 讲讲的历史回放——位置这类连续量在 tick 里被记进一个 history buffer，step 结束打包成一段轨迹一起写下去，前端拿到轨迹自己插值，于是低频写换来了高频平滑。

`Game.saveStep` 把 diff 算出来交给一个 mutation：

```ts
// convex/aiTown/game.ts  Game.saveStep / takeDiff
async saveStep(ctx: ActionCtx, engineUpdate: EngineUpdate): Promise<void> {
  const diff = this.takeDiff();
  await ctx.runMutation(internal.aiTown.game.saveWorld, {
    engineId: this.engine._id,
    engineUpdate,
    worldId: this.worldId,
    worldDiff: diff,
  });
}
```

`takeDiff` 里有个细节值得学：世界状态每步都写，但 `playerDescriptions`、`agentDescriptions`、`worldMap` 这些大而不常变的表，只有 `descriptionsModified` 为真时才进 diff。能不写的就不写，这是对写放大的又一道防线。

## World 像一个 actor，消息即输入

把前面几段连起来，actor 模型就完整了。

信箱是 `inputs` 表。投递消息是 `insertInput`，任何 mutation 都能调，所以投递这一侧是天然并发安全的（mutation 是事务）。处理消息是 `runStep`，它串行地、按 `number` 顺序地、一次一批地消费。引擎自己记着 `processedInputNumber`，相当于 actor 记着读到信箱第几封信。

handler 的注册方式也很 actor——每个 input 就是一个纯函数，签名固定，在 `convex/aiTown/inputHandler.ts`：

```ts
// convex/aiTown/inputHandler.ts
export function inputHandler<...>(def: {
  args: ArgsValidator;
  handler: (game: Game, now: number, args: ObjectType<ArgsValidator>) => Return;
}) {
  return def;
}
```

`handler(game, now, args)` 拿到整个 game、当前时间、解析好的参数，同步地改内存状态，返回一个值。没有 `await`，不碰 IO，不调 LLM——它就是一条消息的处理逻辑。所有 handler 在 `convex/aiTown/inputs.ts` 里汇成一张表：

```ts
// convex/aiTown/inputs.ts
export const inputs = {
  ...playerInputs,      // join / leave / moveTo / sleep ...
  ...conversationInputs,
  ...agentInputs,
};
```

`Game.handleInput`（在 `game.ts`）只是按 name 查这张表、调对应 handler。于是发一条 `moveTo` 消息和发一条 Agent 的对话消息，走的是完全一样的路径：落表 → 排队 → 串行执行。LLM 的结果也不例外——它在第 1 讲讲过，异步 action 算完之后不直接改世界，而是 `insertInput` 一条消息回到信箱，等引擎在下一步裁决。**智能体可以异步思考，但状态机必须同步裁决。**

那两个 step 万一在时间上重叠了怎么办？这就是 `generationNumber` 的用处。`runStep` 提交时带上 `expectedGenerationNumber`，而 `applyEngineUpdate` 会校验数据库里的 generation 是否还等于这个期望值，不等就抛 `generationNumber` 错误。新的输入会通过 `kickEngine`（`convex/aiTown/main.ts`）把 generation 加一并调度一个新 step，老的 step 醒来一对账发现自己过期，直接安静退出。一个旧闹钟永远叫不醒一个已经被接管的世界。

驱动下一步的不是常驻进程，而是 `runStep` 结尾的 `ctx.scheduler.runAfter(0, runStep, { generationNumber: game.engine.generationNumber })`——上一步用自己最新的 generation 排下一步。这正是第 2 讲讲的 scheduler 续跑：世界靠一串持久化的调度任务往前走，而不是靠一个不能挂的循环。

## 踩坑

**输入顺序由 number 决定，不是 received。** 很多人以为 input 按到达时间处理，其实排序键是 `number`，在 `engineInsertInput` 写入时就定死了。`received` 只用来决定一条 input 落在哪个 tick（`input.received > currentTs` 就留到后面的 tick）。schema 注释里也写了：`received` 是 best-effort、不保证严格单调。所以你的逻辑绝不能依赖 `received` 的精确顺序，要依赖就依赖 `number`。

**tick 粒度是个权衡，不是越细越好。** `tickDuration = 16ms` 约等于 60fps，够平滑；`maxTicksPerStep = 600` 限制一次 step 最多模拟约 9.6 秒。tick 调太细，同样时间要跑更多次 `tick()`，CPU 上去了；调太粗，移动和碰撞会失真。改这两个数之前，先想清楚你的世界对时间精度的真实需求。

**写放大要主动防。** 默认每步都写整个 world，这已经是为了历史回放刻意做的低频化。但 description 表如果每步都全量写，成本会回来。`takeDiff` 里用 `descriptionsModified` 这个脏标记把它挡掉——这是个值得照抄的模式：把"权威但高频"和"大但低频"的状态分开存、分开判断要不要写。

**handler 必须同步、纯、能容错。** `handleInput` 外面包了 try/catch，单条 input 失败只记一条 error 进 `returnValue`，不会炸掉整个 step。但反过来，如果你在 handler 里偷偷做了有副作用的事（比如直接写库），就破坏了"内存推进、末尾一次性提交"的前提，diff 和回放都会错乱。handler 里只准改内存。

## 小结

AI Town 的单线程 step，本质是一个朴素但强悍的工程决定：**不和并发硬碰硬，而是把并发挡在状态变更之外。**

拆成机制就是三层：信箱（`inputs` 表 + 单调 `number`）收下所有外部变化；引擎（`runStep`）串行地、批量地、在内存里推进几百个 tick；提交（`saveStep` + diff + `generationNumber`）把一整段演化压成一次数据库写，并用版本号挡掉过期任务。

迁移到自己的系统时，可以照着问三个问题：

第一，你的"世界状态"是什么，能不能规定它只有一个 owner、外部一律走消息？聊天会话、协作文档、订单状态机、工作流引擎，几乎都能套这个模型。

第二，你的高频演化能不能留在内存、只在边界处落库？只要状态是连续可推进的，"内存跑、末尾写一次"就能把写放大压下来，顺带还能给前端一段可回放的轨迹。

第三，你怎么处理过期任务？只要有调度、有重试，就一定会有两个执行体抢同一份状态。一个单调递增的 generation 加一次提交时的对账，比一整套分布式锁简单得多，也可靠得多。

LLM 在这套结构里始终只是一个会产生建议的异步组件，真正的系统中心是信箱、引擎和调度。把这三样想清楚，像素小镇也好、AI 客服也好，底层都是同一台机器。

## 对应 convex 源文件

- `convex/engine/abstractGame.ts`：`runStep` 主循环、`loadInputs` 顺序消费、`engineInsertInput` 分配序号、`applyEngineUpdate` 校验 generation 写回。
- `convex/engine/schema.ts`：`inputs` / `engines` 表定义与 `byInputNumber` 索引。
- `convex/aiTown/game.ts`：`Game` 子类（tickDuration / maxTicksPerStep）、`tick`、`takeDiff`、`saveStep`、`saveWorld`。
- `convex/aiTown/world.ts`：`World` 内存对象与序列化。
- `convex/aiTown/inputs.ts`：input handler 注册表。
- `convex/aiTown/inputHandler.ts`：handler 类型工厂。
- `convex/aiTown/insertInput.ts`：worldId → engineId 的投递入口。
- `convex/aiTown/main.ts`：`runStep` action、`kickEngine`、scheduler 续跑。
</content>
</invoke>
