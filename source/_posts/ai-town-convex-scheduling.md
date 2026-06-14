---
title: "AI Town 课程 02：Convex 调度，让世界可靠续跑"
date: 2026-06-14 10:00:00
tags: [AI, Agent, AI Town, Convex, 调度, 课程]
categories: [技术笔记]
---

上一讲我把 AI Town 当成一套 Agent 基础设施来看，里面有一节专门讲 Convex 调度，叫"把稍后继续变成可靠任务"。那一节是从高处俯瞰的：scheduler 驱动世界前进，mutation 管确定性状态，action 管不确定副作用。

这一讲我想下沉到函数级，把那段话拆开。具体到 AI Town 的代码里，"让世界一直跑"到底是怎么实现的？一个像素小镇里几十个 NPC 持续走动、聊天、思考，背后没有一个常驻进程，那它靠什么续跑？又怎么保证不会因为部署、超时、重复触发而乱掉？

这一讲的主角是三个文件：`convex/aiTown/main.ts` 里的 `runStep`，`convex/engine/abstractGame.ts` 里的 `AbstractGame.runStep`，还有 `convex/crons.ts`。我们顺着一次 step 的生命周期走一遍。

## 为什么"让世界一直跑"是个难题

先把问题摆清楚。

一个模拟世界本质上是个无限循环：读取当前状态，往前推进一点，写回去，再来一遍。在自己的笔记本上写这个循环很简单：

```js
while (true) {
  await stepWorld();
  await sleep(1000);
}
```

但只要这个循环要跑在 serverless 环境里，它就站不住脚了。serverless 的前提就是"没有常驻进程"——函数被触发、执行、然后销毁。你没有一个可以永远 `while (true)` 的地方。就算你想办法让某个函数跑很久，平台也会给它设执行时限，时间一到就强制掐断。

更麻烦的是各种异常情况：

- 函数执行到一半，机器被回收，循环就断了，没人接着跑；
- 一次部署上线，旧的执行被中断，新的执行从哪开始？
- 某次 step 因为 LLM 超时抛了异常，整个世界是不是就永远停在那一刻了？
- 你为了保险起见多触发了几次，结果两个 step 同时在推进同一个世界，状态被写花了。

所以"让世界一直跑"真正的难点不是"跑"，而是**断了之后还能自己续上，且续上时不会重复、不会冲突**。这正是 Convex scheduler 帮我们解决的事。

## Convex scheduler：把"下一次"存成一条持久任务

Convex 的思路很干脆：不要让进程活着，让"下一次该跑什么"这件事本身持久化下来。

它提供了 `ctx.scheduler.runAfter(delayMs, fn, args)` 和 `ctx.scheduler.runAt(timestamp, fn, args)`。调用之后，Convex 会把"在某个时刻调用某个函数、带某些参数"记成一条数据库里的调度记录。机器挂了无所谓，记录还在；到点了 Convex 会自己把它捞出来执行。

AI Town 把整个世界的续跑就架在这个机制上。看 `convex/aiTown/main.ts` 里 `runStep` 这个 action，它在干完一轮活之后做的最后一件事是：

```ts
// convex/aiTown/main.ts -> runStep
await ctx.scheduler.runAfter(0, internal.aiTown.main.runStep, {
  worldId: args.worldId,
  generationNumber: game.engine.generationNumber,
  maxDuration: args.maxDuration,
});
```

这一行是整个世界续跑的命脉。`runStep` 在结束时给"下一次 `runStep`"排了一个班。它不靠循环活着，它靠每次都给自己留一个接班人。这样哪怕这次执行结束、进程销毁，下一棒已经在 Convex 的调度表里排好队了。世界由此变成一条首尾相接的链：每一次 step 都负责唤醒下一次 step。

这里也能看到上一讲提的那个事务细节。`runAfter` 是在 action 里调度的，而 action 里的调度本身不是整段 action 的事务一部分。所以 AI Town 的策略是：把它放在 `runStep` 的最后一行，前面的活干完了才排下一棒。万一前面抛了异常，这一棒就不会排出去——这恰好是我们想要的，因为出错时不该盲目续跑，而该让上层的"复活"机制接手（后面会讲到 cron 怎么把死掉的世界救回来）。

## runStep 的两层循环

要看懂续跑，得先看清 `runStep` 其实是两层循环嵌套的。

外层在 `convex/aiTown/main.ts`，是那个 action。它的身体很简单：在一个时间窗口内反复调用游戏的 `runStep`，窗口到了就给下一棒排班。

```ts
// convex/aiTown/main.ts -> runStep
let now = Date.now();
const deadline = now + args.maxDuration;
while (now < deadline) {
  await game.runStep(ctx, now);
  const sleepUntil = Math.min(now + game.stepDuration, deadline);
  await sleep(sleepUntil - now);
  now = Date.now();
}
```

`maxDuration` 来自 `convex/constants.ts` 里的 `ENGINE_ACTION_DURATION = 30000`，也就是一个 action 最多干 30 秒。`game.stepDuration` 是 1000 毫秒。所以这个外层循环大致是：每秒推进一步，连续推进大约 30 秒，然后退出去排下一棒。

为什么不让一个 action 一口气跑很久、少排几次班？因为 serverless 平台对单次执行有硬性时限（`constants.ts` 里写着 `ACTION_TIMEOUT`）。30 秒是个安全余量：干满 30 秒就主动收工、交棒，绝不去赌平台的执行上限。把"长跑"切成一段段"30 秒短跑 + 交棒"，是这套调度能在 serverless 上稳定续跑的关键工程取舍。

内层循环在 `convex/engine/abstractGame.ts` 的 `AbstractGame.runStep` 里。外层每调一次它，它就在内存里把世界往前模拟一段：

```ts
// convex/engine/abstractGame.ts -> AbstractGame.runStep
const lastStepTs = this.engine.currentTime;
const startTs = lastStepTs ? lastStepTs + this.tickDuration : now;
let currentTs = startTs;
// ...
while (numTicks < this.maxTicksPerStep) {
  numTicks += 1;
  // 收集这个 tick 该处理的 inputs，喂给游戏
  // ...
  this.tick(currentTs);
  const candidateTs = currentTs + this.tickDuration;
  if (now < candidateTs) {
    break;
  }
  currentTs = candidateTs;
}
```

`tickDuration` 是 16 毫秒（对应 `TICK = 16`，约等于 60 帧每秒的节奏），`maxTicksPerStep` 是 600。也就是说外层每秒醒一次，内层就在内存里以 16ms 一帧的精度把世界连推 60 多帧，直到追上真实时间 `now`。

这就是上一讲讲历史回放时说的"服务端低频写、内存高频推"。内层用高精度推演画出一条平滑轨迹，但整段 step 只在结束时落一次库。两层循环各管一摊：外层管"在 serverless 上可靠续跑"，内层管"在内存里把时间推平"。

## generationNumber：给每条续跑链发一个版号

现在到了这套调度最精妙的地方。

既然每次 `runStep` 都给自己排下一棒，那如果有别的力量也来排班怎么办？比如有人手动重启了世界，或者 cron 发现世界卡死了来踢一脚——这时候就可能有两条续跑链同时在跑，两个 action 都在推进同一个世界。状态必然被写乱。

AI Town 用 `generationNumber` 来防这件事。可以把它理解成续跑链的"版本号"或者"班次号"。

引擎文档里存着一个 `generationNumber`。每次有人想启动一条新的续跑链，就把它加一，并把这个新号码当参数传给 `runStep`。`runStep` 一开始读世界时，会拿手里的号码和数据库里的号码对账。看 `convex/engine/abstractGame.ts` 里的 `loadEngine`：

```ts
// convex/engine/abstractGame.ts -> loadEngine
if (engine.generationNumber !== generationNumber) {
  throw new ConvexError({ kind: 'generationNumber', message: 'Generation number mismatch' });
}
```

号码对不上就直接抛错退出。意思是：你这条链的班次已经过期了，现在有更新的班次在跑，你别添乱了。

那号码什么时候会变？看 `convex/aiTown/main.ts` 里的 `kickEngine`：

```ts
// convex/aiTown/main.ts -> kickEngine
const generationNumber = engine.generationNumber + 1;
await ctx.db.patch(engineId, { generationNumber });
await ctx.scheduler.runAfter(0, internal.aiTown.main.runStep, {
  worldId,
  generationNumber,
  maxDuration: ENGINE_ACTION_DURATION,
});
```

`kickEngine` 干的就是：把号码加一，然后用新号码排一棒新的 `runStep`。`startEngine` 也是同样的套路。这两个加一的动作，立刻让所有还揣着旧号码的 `runStep` 在下一次对账时全部作废。

更妙的是 `runStep` 正常工作时号码也在涨。看 `AbstractGame.runStep` 提交那一步：

```ts
// convex/engine/abstractGame.ts -> AbstractGame.runStep
const expectedGenerationNumber = this.engine.generationNumber;
this.engine.currentTime = currentTs;
this.engine.generationNumber += 1;
// ...
const engineUpdate = { engine, completedInputs, expectedGenerationNumber };
await this.saveStep(ctx, engineUpdate);
```

它把 `expectedGenerationNumber`（保存前的旧号码）和"加一后的新号码"一起提交。写库的 mutation `applyEngineUpdate` 里会再调一次 `loadEngine`，用 `expectedGenerationNumber` 对账——只有当前数据库号码正好是这个值，才允许写入，写入后号码自然变成加一后的新值。

把这两件事连起来看就通了：**正常续跑时，每一步都把号码加一，下一步带着新号码继续；这条链是连续、自洽的。一旦外力（kick / start）插队把号码加一，这条链下一次对账就会发现号码被人动过，立刻知难而退。** 一个简单的递增整数，同时解决了"防重复续跑"和"让旧链优雅退场"两个问题。这比加锁干净得多。

## idle 与 active：没人看的时候别空转

光会续跑还不够。如果没人在看这个世界，它还在那儿每秒推一步、烧 LLM 的钱，那就太蠢了。所以这套调度还得会"歇"和"醒"。

判断歇不歇的依据是 `worldStatus.lastViewed`——前端订阅世界时会定期更新这个时间戳（节流逻辑见 `convex/world.ts`，每隔 `WORLD_HEARTBEAT_INTERVAL` 的一半才写一次，避免把库写爆）。

歇的逻辑在 `convex/world.ts` 的 `stopInactiveWorlds`，由 cron 定时调用：

```ts
// convex/world.ts -> stopInactiveWorlds
const cutoff = Date.now() - IDLE_WORLD_TIMEOUT;
const worlds = await ctx.db.query('worldStatus').collect();
for (const worldStatus of worlds) {
  if (cutoff < worldStatus.lastViewed || worldStatus.status !== 'running') {
    continue;
  }
  console.log(`Stopping inactive world ${worldStatus._id}`);
  await ctx.db.patch(worldStatus._id, { status: 'inactive' });
  await stopEngine(ctx, worldStatus.worldId);
}
```

`IDLE_WORLD_TIMEOUT` 是 5 分钟。超过 5 分钟没人看，就把世界标成 inactive，调 `stopEngine`。而 `stopEngine` 只是把引擎的 `running` 置为 false。下一棒 `runStep` 启动时，`loadEngine` 里那句 `if (!engine.running)` 会抛出 `engineNotRunning` 错误，`runStep` 的 catch 把它识别出来、安静地 return——续跑链就此自然断掉。没有人接班，世界就停了。这就是"空跑省钱"的实现：靠的不是强行 kill，而是不再续棒。

醒过来同样优雅。下次有人提交输入或打开页面，`heartbeatWorld` 发现世界是 inactive，就重新 `startEngine`：它把 `running` 置回 true、`generationNumber` 加一、forcibly 把 `currentTime` 直接拨到当下（注释里特意说明：不去补算停掉那段时间的模拟，否则要么算很久、要么把一大段历史推给客户端），然后排一棒新的 `runStep`。世界从当前时刻续上，链条重新转起来。

## crons：兜底的"复活术"

scheduler 负责续跑，但续跑链万一彻底断了呢？比如某次 `runStep` 因为一个非预期异常崩了，连下一棒都没排出去。这时候世界就成了"死世界"——状态是 running，但没有任何 step 在推进它。

`convex/crons.ts` 安排了一个兜底巡逻：

```ts
// convex/crons.ts
crons.interval('restart dead worlds', { seconds: 60 }, internal.world.restartDeadWorlds);
```

`restartDeadWorlds`（在 `convex/world.ts`）每分钟扫一遍所有 running 的世界，看引擎的 `currentTime` 有多久没往前走了：

```ts
// convex/world.ts -> restartDeadWorlds
const engineTimeout = now - ENGINE_ACTION_DURATION * 2;
// ...
if (engine.currentTime && engine.currentTime < engineTimeout) {
  console.warn(`Restarting dead engine ${engine._id}...`);
  await kickEngine(ctx, worldStatus.worldId);
}
```

判据是：如果引擎超过两个 action 周期（`ENGINE_ACTION_DURATION * 2`，即 60 秒）没推进过时间，就认定它死了，调 `kickEngine` 把它救活。而 `kickEngine` 我们前面看过，它会把 `generationNumber` 加一再排新棒——这意味着即便有一条半死不活的旧链还残留着，新号码也会让它在下一次对账时作废。复活和防重复，是同一套机制。

这三个 cron 各司其职：`stop inactive worlds` 管省钱（没人看就歇），`restart dead worlds` 管可靠（断了就救），`vacuum old entries` 管清理（每天凌晨删掉 `inputs`、`memories`、`memoryEmbeddings` 里的旧数据，防止 inputs 和向量无限堆积）。

## 几个容易踩的坑

把这套机制摸熟之后，回头看几个边界，会更理解它为什么这么设计。

**重复触发。** 这是分布式调度里最常见的坑：你以为只排了一棒，实际因为重试、手动 kick、cron 复活，同一个世界可能被多条链同时驱动。AI Town 没有靠"保证只触发一次"来解决——那在 serverless 里几乎不可能——而是用 `generationNumber` 让重复触发变得无害：多余的链一对账就自己退场。设计哲学是"允许重复发生，但让重复无害"，这比"努力不让重复发生"务实得多。

**时间漂移。** 内层循环按 16ms 一帧推进，但外层 action 实际醒来的间隔受 `sleep` 和调度延迟影响，不会精确是 1000ms。`runStep` 的处理是：每一步都从 `this.engine.currentTime` 这个权威时间起步，往前追到真实的 `now` 为止，而不是简单地"上次时间 + 1000"。所以即便某次 action 醒晚了，下一步也会一次性把欠下的帧补齐，时间不会越漂越远。`applyEngineUpdate` 里还有一道 `if (update.engine.currentTime < engine.currentTime) throw new Error('Time moving backwards')` 的保险，杜绝时间倒流。

**空跑烧钱。** 如果只会续跑不会停，一个没人看的世界会永远在后台烧算力和 LLM token。`stopInactiveWorlds` 加 `lastViewed` 心跳就是为了这个：5 分钟没人看就停，有人来再醒。对自建 Agent 系统来说这点尤其值钱——LLM 调用是真金白银，"没需求就别转"应该是默认行为，而不是事后优化。

## 一句话小结，以及怎么搬到自己的系统

这一讲拆到函数级之后，可以把 AI Town 的续跑机制压成一句话：

**用 scheduler 让每一步都给下一步排班，把"长跑"切成"短跑加交棒"；用一个递增的 generationNumber 让重复和过期的链自动作废；用 lastViewed 心跳决定醒着还是歇着；再用 cron 兜底把断掉和卡死的链救回来。**

这套东西基本不依赖 AI Town 这个具体场景，搬到自己的 agent 系统里也成立。如果你在做一个需要"持续运转"的后台——多 agent 工作流、定时巡检、长任务编排——可以直接借这几条骨架：

- **别写常驻循环，写"自己排下一棒"的任务。** 每次执行末尾 `runAfter` 一个自己，把无限循环换成一条持久的任务链。机器挂了，链还在。
- **用单调递增的代号给每条链发版。** 启动、踢活、重启时都让代号加一，每次执行入口处对账，不对就退。这一招几乎免费地解决了"同一个任务被并发驱动"的老大难。
- **给单次执行设一个保守的时间预算。** 别赌平台的执行上限，干满预算就主动交棒。可靠性来自"短跑 + 交棒"，不来自"一口气跑完"。
- **加一个心跳信号决定睡或醒。** 没有消费者就停，省下的是真实的算力和 token 成本。
- **加一个 cron 巡逻兜底。** 无论机制多严密，总会有链彻底断掉的时候，需要一个独立的定时器来发现死掉的任务并把它救活。

下一讲我打算往内层走，看看单线程 engine 怎么消费 input、怎么把内存里的状态算成 diff 再写回库——也就是这一讲里一笔带过的 `tick` 和 `saveStep` 到底在做什么。

## 参考资料

- [AI Town GitHub Repository](https://github.com/a16z-infra/ai-town)
- [Convex Scheduled Functions](https://docs.convex.dev/scheduling/scheduled-functions)
- [Convex Cron Jobs](https://docs.convex.dev/scheduling/cron-jobs)
- [Convex Actions](https://docs.convex.dev/functions/actions)
