---
title: "AI 小镇改造手记 · 五：在权威引擎上加功能，怎么不把它搞乱"
date: 2026-06-15 15:00:00
tags: [AI, Agent, AI Town, 改造手记, 状态机, 系统设计]
categories: [技术笔记, AI 小镇改造手记]
---

这是改造手记的最后一篇，也是我自己最想写的一篇。

前四篇讲的是我加了什么：居民身份、职业与日历、菜地、电影院、画室、可点击探索的视觉地图。功能上看，它们各管各的。但写到收尾我才想清楚，这四篇底下其实是同一个问题——

**我是在别人的权威状态机上加东西。一不小心，整个世界就会乱掉。**

这篇不讲我加了什么，讲我怎么加而没把它搞乱。

## 先说清楚我面对的是什么

我在《AI Town 课程》系列里拆过它的内核，这里只复述结论，因为它就是这篇的全部约束。

AI Town 的核心世界状态，只有一个引擎能改。外部世界——用户、NPC 背后的 Agent、刚返回的 LLM——谁都不能直接写 world，只能往一个 `inputs` 队列里塞消息。引擎一次从队头取一批，串行处理，在内存里连推几百个 tick，最后只写一次数据库。（细节见课程 03《单线程 Step，把世界设计成一个 Actor》。）

这套设计买到的是：写游戏逻辑时不用想锁、不用想事务冲突，思维模型退化成单机游戏循环。

代价是它给我立了两条死规矩：

1. **任何对世界状态的改动，必须走 input 排队进引擎。** 你不能在一个 mutation 里直接捞出 world 改一改再写回去——那等于绕过了串行,两个写操作同时落，状态就花了。
2. **任何慢操作（LLM、出图）不能堵在主循环里。** 引擎一个 tick 是毫秒级的，你塞一个几秒的网络请求进去，整个镇子卡死。慢操作必须扔到异步 action，算完了再把结果回流进引擎。（这条见课程 05《异步 LLM，让慢思考离开主循环》。）

我加的每一个功能，都得在这两条规矩里找位置。下面是我具体怎么遵守的。

## 规矩一：玩家动作排队进引擎，不直接改世界

最能说明问题的是「睡觉存档」这个功能。居民玩一天，点睡觉，角色停下、播一个睡觉动画、把当前位置存档到第二天。

听起来是个很小的功能。但「让一个 player 停下来并进入睡觉状态」是在改世界状态，它必须走 input。

我先在 `convex/aiTown/player.ts` 里加了一个新的 input handler，注册进 `playerInputs`：

```ts
// convex/aiTown/player.ts
sleep: inputHandler({
  args: { playerId },
  handler: (game, now, args) => {
    const playerId = parseGameId('players', args.playerId);
    const player = game.world.players.get(playerId);
    if (!player) {
      throw new Error(`Invalid player ID ${playerId}`);
    }
    stopPlayer(player);
    player.lastInput = now;
    player.activity = {
      description: '在居民家睡觉存档',
      emoji: '💤',
      until: now + 20_000,
    };
    return null;
  },
}),
```

注意这个 handler 的签名：`(game, now, args)`。它拿到的 `game` 和 `now` 是引擎在串行 step 里喂进来的——也就是说，这段改 `player` 的代码运行时，它和别的所有 input 是排好队、一个一个执行的。我没有自己去 new 一个事务、自己去捞 player，我只是往引擎里加了一道「当轮到我时该怎么改」的指令。

那前端怎么触发它？关键在 `convex/world.ts` 的 `sleepAndSaveResident` 这个 mutation：

```ts
// convex/world.ts
export const sleepAndSaveResident = mutation({
  args: { worldId: v.id('worlds'), sessionId: v.string() },
  handler: async (ctx, args) => {
    // ...找到当前会话对应的 player...
    await upsertResidentProfile(ctx.db, world._id, tokenIdentifier, /* ...存档位置/朝向... */);
    return await insertInput(ctx, world._id, 'sleep', {
      playerId: player.id,
    });
  },
});
```

这里有个我自己很满意的分界，值得停一下：

- **存档信息**（位置、朝向、睡了几天）我写进了自己新建的 `residentProfiles` 表，直接 `upsertResidentProfile` 落库就行。因为这张表是我的副本数据，**不是**权威世界状态，没人会和我抢着改它。
- **「player 进入睡觉状态」这件改世界的事，我没有自己动手**，而是 `insertInput(ctx, world._id, 'sleep', {...})`，把它当成一条消息塞进队列，让引擎自己去执行上面那个 handler。

mutation 不直接碰 world，只负责「翻译用户意图 → 入队」。这就是那条死规矩在代码里长出来的样子。

我一开始其实差点写错。最自然的冲动是：既然在 mutation 里已经把 world 捞出来了、player 也找到了，那直接 `player.activity = ...` 改一改、`ctx.db.patch` 写回去不就完了？少一次入队，少一跳延迟。但这正是会把状态搞乱的写法——这次写和引擎自己那一轮 step 是两个并发的写者，谁后写谁覆盖，世界就会出现「我明明睡了却又在走路」这种鬼畜状态，而且因为引擎是单写者假设，它根本不会去防你这一手。所以我把改世界的部分整个挪进了 handler，mutation 这层一行 world 都不碰。

我加的每个玩家动作都收敛成了这个模式。`world.ts` 里的 `joinWorld`、`leaveWorld`、`addNpc`、`sleepAndSaveResident`，handler 最后一行清一色是 `insertInput(...)`，从不直接改 world。一眼扫过去就知道这些 mutation 全都「守规矩」，这种一致性本身就是种安全感。

## 规矩一的延伸：连「加一个 NPC」也得排队

上面那个 `addNpc` 我想单独拎出来，因为它展示了同一条规矩在 Agent 侧的样子。

原版要造一个 Agent，是从一张固定的 `Descriptions` 数组里按下标取。我想让用户在前端自定义 NPC（名字、形象、人设、计划），于是改了 `convex/aiTown/agentInputs.ts` 里的 `createAgent` handler，让它既能按下标取、也能直接吃一份自定义描述：

```ts
// convex/aiTown/agentInputs.ts
createAgent: inputHandler({
  args: {
    descriptionIndex: v.optional(v.number()),
    description: v.optional(v.object(customAgentDescription)),
  },
  handler: (game, now, args) => {
    const description =
      args.description ??
      (args.descriptionIndex !== undefined ? Descriptions[args.descriptionIndex] : undefined);
    if (!description) {
      throw new Error(`Invalid agent description: ${JSON.stringify(args)}`);
    }
    const playerId = Player.join(game, now, /* ... */);
    // ...
  },
}),
```

重点同样不是参数变多了，而是：**「往世界里凭空加一个活人」这种最重的写操作，依然是一条排进队列的 input。** 我前端那个「捏 NPC」的弹窗，按钮按下去走的也是 `world.ts` 的 `addNpc` mutation → `insertInput(..., 'createAgent', ...)`，和睡觉一个套路。用户造的 Agent 和系统预置的 Agent，进世界的门是同一道。

顺带补一句，我给 `Player.join` 加了可选的 `spawnPosition`/`spawnFacing` 参数（原版是随机落点），这样居民睡醒能回到存档点。这个改动同样落在 handler 内部，由引擎在 step 里执行——我没有在 join 之后再去「纠正」一次玩家位置，那会是第二次写，又会破坏串行。

## 规矩二：出图是慢操作，走异步 action 再回流

可点击探索的视觉地图（上一篇讲的那套）有个绕不开的麻烦：每点一个热点，要现场 AI 出一张图，几秒钟。

这种慢操作**绝不能**进引擎主循环——它会把整个镇子的 tick 堵死。这正是课程 05 里讲 LLM 时的同一个问题：慢思考必须离开主循环。我出图复用的就是那一套结构。

看 `convex/visuals.ts` 里的 `generateNextNode`，它是个 `action` 而不是 `mutation`：

```ts
// convex/visuals.ts
export const generateNextNode = action({
  args: {
    sessionId: v.string(),
    parent: v.optional(parentNodeValidator),
    hotspot: v.optional(hotspotValidator),
  },
  handler: async (ctx, args): Promise<GeneratedNode> => {
    const node = buildNextNode(args.parent, args.hotspot);
    const image = await generateImage(ctx, node);   // 慢：网络出图，几秒
    const generatedNode = { ...node, imageStorageId: image.imageStorageId, imageUrl: image.imageUrl };
    await ctx.runMutation(internal.visuals.saveVisualNode, {  // 结果回流，落库
      sessionId: args.sessionId,
      node: generatedNode,
    });
    return generatedNode;
  },
});
```

这里有个在 Convex 里很硬的约束：**只有 action 能跑 `fetch`、做有副作用的慢 IO；mutation 和引擎 step 必须快、必须确定性。** 所以 `generateNextNode` 是 action，里面 `await generateImage(...)` 慢慢出图（`generateImage` 内部 `fetch` 外部 worker，超时就退回本地 SVG 占位图，见同文件 `generateImage`），等图真的出来了，再用 `ctx.runMutation` 调一个内部 mutation `saveVisualNode` 把结果写回数据库。

慢的部分（出图）在 action 里漂着，前端 `await` 它；快的、要落库的部分（存节点）才是一次干净的 mutation。**「慢操作异步化、结果回流」**——这跟原版 LLM 的处理是同一个形状，我只是把「让 NPC 想一句话」换成了「让模型画一张图」。

这里还藏着一个我特意留的兜底：出图是会失败的——worker 没起、超时、模型抽风都可能。如果失败直接抛错，用户点一下热点就是一片空白，体验崩掉。所以 `generateImage` 里 `fetch` 一旦不 ok 就 `catch` 住，退回到本地现画的一张 SVG 占位图。对引擎和数据库来说，它拿到的永远是一张「有效的图」，慢操作失败被关在了 action 内部，没有渗进权威状态里。异步化不只是为了不堵主循环，也是为了给「慢且可能失败」的东西一个能容错的隔离舱。

## 规矩三里没明说的那条：给模拟引擎补测试

前两条是 AI Town 替我立的。第三条是我自己加的：**这么多新逻辑，我得能验证它对。**

但给这种引擎写测试本身就是个难点。它有状态、有时序、还有随机性——三样东西全是单元测试的天敌。所以我专门写了 `convex/world.test.ts`（428 行）、`convex/messages.test.ts`、`convex/agent/memory.test.ts`。

我的做法是：**把所有带业务规则的逻辑抠成纯函数，时间和随机性都从参数注进去，绝不让它们藏在函数内部。**

时间永远是显式传入的，不读 `Date.now()`：

```ts
// convex/world.test.ts
test('creates a one-day career work record', () => {
  const now = new Date('2026-06-06T10:00:00+08:00').getTime();
  const calendar = getTownCalendar(now, 4);
  const shift = createCareerShift('blacksmith', now, calendar);
  expect(shift).toMatchObject({
    profession: 'blacksmith',
    workDayNumber: 5,
    workHoursLabel: '10:00-18:00',
    payCoins: 16,
    xpGain: 14,
  });
  expect(getCareerShiftProgress(now, shift)).toBe(1);
});
```

注意 `getTownCalendar(now, ...)`、`createCareerShift(..., now, ...)`、`getCareerShiftProgress(now, ...)`，`now` 一路被当参数传——因为它是参数，我就能钉一个固定时间戳，让「溪山历某月某日 10:00–18:00 这一班」的计算每次都跑出同一个结果。

随机性也一样，不放任 `Math.random` 在函数里裸奔。比如菜地存种子是有成功率的，测试不去赌具体数值，而是断言它落在该落的区间里：

```ts
// convex/world.test.ts
test('uses the configured seed saving rates', () => {
  const ordinary = resolveSeedSaving('seed-save-check', false);
  expect(ordinary.successRate).toBe(SEED_SAVE_SUCCESS_RATE);
  expect(ordinary.seedCount).toBeGreaterThanOrEqual(0);
  expect(ordinary.seedCount).toBeLessThanOrEqual(5);
  if (ordinary.success) {
    expect(ordinary.seedCount).toBeGreaterThanOrEqual(1);
  }
});
```

状态则用工厂函数搭、链式推进，模拟引擎那种「上一帧的输出是这一帧的输入」：先 `createGardenPlots()` 造出初始格子，`plantGardenPlot(...)` 返回种好的新状态，再喂给 `waterGardenPlot(...)`，每一步都断言一次。

这套写法的真正收益是：我把「值得测的规则」和「难测的副作用」彻底分开了。计时、随机、读写库这些脏活留在 mutation / action 那层，规则本身是纯函数，测起来又快又稳。能给一个有状态有时序有随机的模拟引擎补上能跑的测试，靠的就是这条分界。

## 收尾：这其实是我反复在做的同一件难事

写完这五篇我才发现，AI Town 这套约束我并不陌生。

**服务端权威状态 + 客户端流畅 + 慢操作异步化**——把它抽象出来，这就是我在好几个项目里反复在拧的同一颗螺丝。

写德扑的时候，牌局状态必须服务端权威（谁的钱、轮到谁、底池多少不能让客户端说了算），客户端只发动作、收快照，发牌结算这类逻辑串行落地。做 EpubReader，渲染要在端上顺滑翻页，但进度、笔记这些「真相」得有个权威副本，解析大书这种慢活不能堵 UI 线程。连这个博客首页，数据是构建时算好的权威产物，浏览器只管把它流畅地放出来。

形状全一样：**有一份谁都不能私自篡改的权威状态，外部变化排队进去；前端只负责把它流畅地演出来；任何慢的、不确定的活，都踢到旁边异步算，算完了再回流。**

AI Town 只是把这件事做到了近乎教科书的程度，逼着我每加一个功能都老老实实顺着它的管线走。我加完五套系统、近一万行代码，世界没有乱、状态没有花、引擎该单线程还是单线程——靠的不是我多小心，是我一直没敢越过它画好的那两条线。

这大概就是我读源码、做改造时真正在学的东西：不是某个 API 怎么调，是**一个好的状态边界，长什么样**。
