---
title: "AI Town 课程 09：对话与社交状态机，Agent 怎么开始和结束一次对话"
date: 2026-06-14 17:00:00
tags: [AI, Agent, AI Town, 状态机, 多智能体, 课程]
categories: [技术笔记]
---

第 5 讲我讲过 AI Town 怎么用异步 LLM 生成对话里的每一句话：Agent 在 tick 里决定要发言，丢一个 operation 出去，LLM 慢慢算，算完再把消息塞回信箱。

但那一讲我故意绕开了一个更基础的问题：**两个 Agent 凭什么坐到一起说话？** 谁先开口、谁走过去、走到一半另一个人反悔了怎么办、一句话都没说完镇上第三个人能不能挤进来、聊完之后会不会扭头又黏上同一个人。

这一篇不碰 LLM 一个字。我们只看社交机制本身——一套纯粹的状态机，决定谁能跟谁说话、怎么避免一群人抢一个对话、走过去再开口的时序怎么排。代码全部来自 `convex/aiTown/`，路径和函数名都标出来，不编造。

## 问题：多个 Agent 同时想社交，怎么不乱

先把会乱的地方摆清楚。

一个镇上有几十个 NPC，每个 tick 它们都在各自盘算「我现在该干嘛」。如果社交这件事没有规矩，至少有四种乱法。

第一，三个人抢一个对话。A 想找 B 聊，C 也想找 B 聊，如果两份邀请都成立，B 就同时身处两段对话，状态彻底糊掉。

第二，刚结束又黏上。A 和 B 聊完各自走开，下一个 tick A 一抬头发现最近的还是 B，于是又凑过去——两个 NPC 永远在原地循环搭讪。

第三，走过去的时序。搭话不是瞬间完成的，A 得先走到 B 跟前。这中间 A 在移动、B 在等待，万一 A 半路被别的事打断，或者 B 等得不耐烦，这段「悬而未决」的关系得有人负责清理。

第四，谁先开口。两个人脸对脸站定了，如果都等对方先说，就冷场；如果都抢着说，就打架。

AI Town 把这四件事全部收进一个对话生命周期状态机里。下面一层层拆。

## 对话的生命周期：邀请 → 走近 → 参与 → 离开 → 结束

一段对话 `Conversation` 不是「两个人在说话」这么简单，它是一个有明确阶段的对象。看 `convex/aiTown/conversation.ts` 里 `Conversation.start` 怎么创建一段对话：

```ts
// convex/aiTown/conversation.ts  Conversation.start
static start(game: Game, now: number, player: Player, invitee: Player) {
  if (player.id === invitee.id) {
    throw new Error(`Can't invite yourself to a conversation`);
  }
  // Ensure the players still exist.
  if ([...game.world.conversations.values()].find((c) => c.participants.has(player.id))) {
    const reason = `Player ${player.id} is already in a conversation`;
    return { error: reason };
  }
  if ([...game.world.conversations.values()].find((c) => c.participants.has(invitee.id))) {
    const reason = `Player ${player.id} is already in a conversation`;
    return { error: reason };
  }
  const conversationId = game.allocId('conversations');
  game.world.conversations.set(
    conversationId,
    new Conversation({
      id: conversationId,
      created: now,
      creator: player.id,
      numMessages: 0,
      participants: [
        { playerId: player.id, invited: now, status: { kind: 'walkingOver' } },
        { playerId: invitee.id, invited: now, status: { kind: 'invited' } },
      ],
    }),
  );
  return { conversationId };
}
```

这短短一段藏了三个关键设计。

**第一，发起即排他。** 创建对话前先扫一遍全镇所有对话，发起人和被邀请人只要任意一方已经在某段对话里，就直接返回 `error`，不创建。这是「三个人抢一个对话」的第一道闸：每个 player 在任意时刻最多属于一段对话。

**第二，两个人从一开始就处在不同状态。** 发起人 `player` 一上来就是 `walkingOver`（我已经决定去找你了，正往你那走），被邀请人 `invitee` 是 `invited`（有人喊你，你还没答应）。从对话诞生的那一刻起,两个 membership 就是不对称的。

**第三，记下 `creator`。** 谁发起的这段对话被记下来了，后面决定「谁先开口」时要用。

对话的另外几个出口很短，但定义了边界。`acceptInvite` 把被邀请人从 `invited` 推进到 `walkingOver`；`rejectInvite` 直接调 `stop` 把整段对话销毁；`leave` 也是调 `stop`。也就是说，**两人对话里任何一方退出，对话就整个结束——没有「剩一个人继续待着」的状态。** 这对两人对话是对的：少一个人，对话就不成立了。

## membership 的状态流转：invited / walkingOver / participating

成员状态本身定义在 `convex/aiTown/conversationMembership.ts`，干净到只有三态：

```ts
// convex/aiTown/conversationMembership.ts
status:
  | { kind: 'invited' }
  | { kind: 'walkingOver' }
  | { kind: 'participating'; started: number };
```

`invited` 是被喊了还没答应；`walkingOver` 是答应了、正在往对方走；`participating` 是已经站定、正式在聊（还记下了 `started` 时间戳，后面判断聊太久要用）。

注意这三态是**每个成员各自持有**的，不是整段对话共享一个状态。一段对话里完全可能一个人 `walkingOver`、另一个还 `invited`。真正的「对话开始了」，是两个成员**同时**进入 `participating` 才算。这个「同时」由谁来判定？不是任何一个 Agent，而是对话自己的 `tick`。

看 `Conversation.tick`：

```ts
// convex/aiTown/conversation.ts  Conversation.tick（节选）
// If the players are both in the "walkingOver" state and they're sufficiently close,
// transition both of them to "participating" and stop their paths.
if (member1.status.kind === 'walkingOver' && member2.status.kind === 'walkingOver') {
  if (playerDistance < CONVERSATION_DISTANCE) {
    // First, stop the two players from moving.
    stopPlayer(player1);
    stopPlayer(player2);
    member1.status = { kind: 'participating', started: now };
    member2.status = { kind: 'participating', started: now };
    // ...微调两人站位，让他们正好站到彼此旁边
  }
}

// Orient the two players towards each other if they're not moving.
if (member1.status.kind === 'participating' && member2.status.kind === 'participating') {
  // 把两人朝向转成面对面
}
```

这是整套机制的转轴。**只有当两个成员都处于 `walkingOver` 并且物理距离小于 `CONVERSATION_DISTANCE`（常量里是 1.3 格）时，对话才同时把两人推进 `participating`，并停下他们的脚步、微调站位、转成面对面。** 把「开始说话」绑定到「两人都走到了」这个物理条件上，时序问题就自然解决了——不会出现一个人还在路上、另一个已经开口的情况。

`tick` 开头还有一段防御：如果发现 `participants.size !== 2` 就打个 warning 直接 return。两人对话是硬约束，多了少了都按异常处理。

## Agent 怎么在 tick 里决定发起、接受、退出

状态机是骨架，真正在每个 tick 推动它的是 `Agent.tick`（`convex/aiTown/agent.ts`）。Agent 每一拍都会问自己：我现在在对话里吗？在的话，我是哪个状态？据此决定下一步。

先看「不在对话里」时怎么决定去搭话。`Agent.tick` 发现自己空闲，就丢一个 `agentDoSomething` operation：

```ts
// convex/aiTown/agent.ts  Agent.tick（节选）
if (!conversation && !doingActivity && (!player.pathfinding || !recentlyAttemptedInvite)) {
  this.startOperation(game, now, 'agentDoSomething', {
    worldId: game.worldId,
    player: player.serialize(),
    otherFreePlayers: [...game.world.players.values()]
      .filter((p) => p.id !== player.id)
      .filter(
        (p) => ![...game.world.conversations.values()].find((c) => c.participants.has(p.id)),
      )
      .map((p) => p.serialize()),
    agent: this.serialize(),
    map: game.worldMap.serialize(),
  });
  return;
}
```

注意 `otherFreePlayers` 这个过滤：候选人里**只放还没在任何对话里的 player**。换句话说，找搭话对象之前，已经在源头上排除了「正在聊天的人」。这是「三个人抢一个对话」的第二道闸——第一道是 `start` 时的排他检查，这里是连邀请都不发给忙人。

`agentDoSomething` 这个 operation 异步算出一个 `invitee`（具体怎么挑下面讲），算完回来落到 `finishDoSomething` 这个 input，由它真正调 `Conversation.start` 发出邀请，并记一笔 `agent.lastInviteAttempt = now`。

再看「已经在对话里」时，Agent 按自己的 membership 状态分三种处理。这是 `Agent.tick` 的核心分支，我贴关键的两段：

```ts
// convex/aiTown/agent.ts  Agent.tick（在对话中，节选）
if (member.status.kind === 'invited') {
  // Accept a conversation with another agent with some probability and with
  // a human unconditionally.
  if (otherPlayer.human || Math.random() < INVITE_ACCEPT_PROBABILITY) {
    conversation.acceptInvite(game, player);
    if (player.pathfinding) {
      delete player.pathfinding;  // 停下手头的路，准备走向对方
    }
  } else {
    conversation.rejectInvite(game, now, player);
  }
  return;
}
if (member.status.kind === 'walkingOver') {
  // Leave a conversation if we've been waiting for too long.
  if (member.invited + INVITE_TIMEOUT < now) {
    conversation.leave(game, now, player);
    return;
  }
  // Don't keep moving around if we're near enough.
  const playerDistance = distance(player.position, otherPlayer.position);
  if (playerDistance < CONVERSATION_DISTANCE) {
    return;
  }
  // Keep moving towards the other player. ...
}
```

`invited` 分支回答「要不要接受」。对人类玩家无条件接受；对其他 Agent，按 `INVITE_ACCEPT_PROBABILITY`（0.8）的概率接受，剩下 20% 直接 `rejectInvite` 销毁对话。这个随机性很重要——它让镇上的社交不会变成「逮谁聊谁」的机械循环，总有人会拒绝。

`walkingOver` 分支回答「我答应了，现在怎么走过去」。它先检查一个超时：`member.invited + INVITE_TIMEOUT < now`，也就是从被邀请算起超过 `INVITE_TIMEOUT`（1 分钟）还没走到，就 `leave` 放弃。**这是孤儿对话的清理机制**——如果对方迟迟不来、或者寻路一直失败，不会让这段对话永远卡在半路。没超时就继续往对方走，走到 `CONVERSATION_DISTANCE` 以内就停下，等对话的 `tick` 把双方推进 `participating`。

`participating` 分支回答「聊够了没」。Agent 会检查两个退出条件：

```ts
// convex/aiTown/agent.ts  Agent.tick（participating，节选）
const tooLongDeadline = started + MAX_CONVERSATION_DURATION;
if (tooLongDeadline < now || conversation.numMessages > MAX_CONVERSATION_MESSAGES) {
  // 让 LLM 生成一句告别语，然后离开
  this.startOperation(game, now, 'agentGenerateMessage', { /* type: 'leave' */ });
  return;
}
```

聊太久（超过 `MAX_CONVERSATION_DURATION`）或者消息条数超过 `MAX_CONVERSATION_MESSAGES`（8 条），就主动撤。注意这里只决定「该走了」，告别词本身是 LLM 生成的（第 5 讲的范畴），但**退出对话的决定权在状态机这一侧**——LLM 负责说什么，状态机负责什么时候停。

至于谁先开口，靠的是开头记下的 `creator`：

```ts
// convex/aiTown/agent.ts  Agent.tick（首次发言，节选）
if (!conversation.lastMessage) {
  const isInitiator = conversation.creator === player.id;
  const awkwardDeadline = started + AWKWARD_CONVERSATION_TIMEOUT;
  // Send the first message if we're the initiator or if we've been waiting for too long.
  if (isInitiator || awkwardDeadline < now) {
    // ...抢锁、发第一句
  } else {
    // Wait on the other player to say something up to the awkward deadline.
    return;
  }
}
```

默认发起人先开口（毕竟是他来搭话的）。但如果发起人迟迟不说，被邀请人也不会无限等——熬过 `AWKWARD_CONVERSATION_TIMEOUT` 这个「尴尬截止线」就自己开口。这样既有默认次序，又不会因为一方卡住而冷场。`conversation.isTyping` 这把锁保证同一时刻只有一个人在「打字」，避免两人同时抢着发言。

## 冷却：怎么防止「刚聊完又黏上」

这是社交机制里最容易被忽略、却最影响体感的部分。AI Town 用了三层不同粒度的冷却。

第一层，**单个 Agent 的社交冷却**。`Agent` 上记着 `lastConversation`，对话一结束（`Conversation.stop` 里）就更新它。下次想搭话时，`agentDoSomething` 会查：

```ts
// convex/aiTown/agentOperations.ts  agentDoSomething（节选）
// Don't try to start a new conversation if we were just in one.
const justLeftConversation =
  agent.lastConversation && now < agent.lastConversation + CONVERSATION_COOLDOWN;
// Don't try again if we recently tried to find someone to invite.
const recentlyAttemptedInvite =
  agent.lastInviteAttempt && now < agent.lastInviteAttempt + CONVERSATION_COOLDOWN;

const invitee =
  justLeftConversation || recentlyAttemptedInvite
    ? undefined
    : await ctx.runQuery(internal.aiTown.agent.findConversationCandidate, { /* ... */ });
```

刚聊完的 `CONVERSATION_COOLDOWN`（15 秒）内，或者刚发过邀请还没等到结果，`invitee` 直接置空——这一轮不找人，先去溜达溜达。这是给单个 NPC 一个「社交不应期」，聊完先散散。

第二层，**两人之间的关系冷却**，粒度更细。光有第一层不够：A 散了 15 秒，回头第一个看到的还是 B，照样会黏上。所以挑人的 `findConversationCandidate` 里还有一层：

```ts
// convex/aiTown/agent.ts  findConversationCandidate（节选）
for (const otherPlayer of otherFreePlayers) {
  // Find the latest conversation we're both members of.
  const lastMember = await ctx.db
    .query('participatedTogether')
    .withIndex('edge', (q) =>
      q.eq('worldId', worldId).eq('player1', player.id).eq('player2', otherPlayer.id),
    )
    .order('desc')
    .first();
  if (lastMember) {
    if (now < lastMember.ended + PLAYER_CONVERSATION_COOLDOWN) {
      continue;  // 跳过这个人
    }
  }
  candidates.push({ id: otherPlayer.id, position: otherPlayer.position });
}
// Sort by distance and take the nearest candidate.
candidates.sort((a, b) => distance(a.position, position) - distance(b.position, position));
return candidates[0]?.id;
```

它查 `participatedTogether` 这张「谁和谁聊过」的边表，找到和某人最近一次对话的结束时间。**如果距离上次跟这个人聊完还不到 `PLAYER_CONVERSATION_COOLDOWN`（60 秒），就把这个人从候选里剔掉。** 于是 A 聊完 B 之后的一分钟里，哪怕 B 就在眼前，A 也只会去找别人。这是「刚结束又黏上」的真正解药——它记的是「关系」而非「人」，所以你能聊完 B 立刻去找 C，但不会立刻回头找 B。挑剩下的候选人里取最近的一个，社交既有冷却、又符合「就近搭话」的直觉。

第三层，**活动冷却**。`agentDoSomething` 里还有 `recentActivity`（`ACTIVITY_COOLDOWN`），刚做完一件事（翻镇志、发呆、照看菜园）也得歇会儿，不会连轴转。这层不直接管对话，但和社交冷却共同保证 NPC 的行为有节奏感，不会像机器一样满负荷运转。

## 踩坑

**同时邀请的竞态没有彻底消失，只是被串行化兜住了。** `agentDoSomething` 是异步 action，源码注释里直接写了：「We hit a lot of OCC errors on sending inputs in this file.」多个 Agent 的 operation 很容易凑到同一时刻、抢着发 input。它的缓解手段有两层：发 input 前先 `sleep(Math.random() * 1000)` 随机错峰；以及第 3 讲讲过的——所有 input 最终都排进信箱串行执行，`Conversation.start` 里那个排他检查是在串行的 input handler 里跑的。所以即便 A 和 C 几乎同时想邀请 B，真正落到 `start` 时也是一前一后，后到的那个会因为「B 已经在对话里」而拿到 `error`。竞态在边缘存在，但状态机这一层是干净的。

**孤儿对话靠超时清，不靠回收。** 一段对话进了 `walkingOver` 之后，如果对方寻路一直失败、或者中途离开了游戏，这段对话不会有人主动来「垃圾回收」。兜底的是 `walkingOver` 分支里那个 `INVITE_TIMEOUT`（1 分钟）超时，以及 `Player.leave` 里——玩家离开游戏时会顺手把自己所在的对话 `stop` 掉。设计自己的会话系统时，每一个「悬而未决」的中间态都得配一个超时，否则迟早攒出一堆永远卡住的孤儿。

**冷却必须分两个粒度，缺一个都会露馅。** 只有单 Agent 冷却（第一层），NPC 会反复黏同一个人；只有关系冷却（第二层），一个 NPC 可能聊完立刻换下一个、一刻不停显得过于亢奋。两层叠起来才得到「聊完歇一会儿，而且短期内不重复找同一个人」的自然观感。这个「个体节奏 + 关系去重」的组合，迁到任何「自动配对」系统里都成立。

**两人对话是硬约束，别想当然扩展到多人。** 整套机制——`participants.size !== 2` 的断言、`tick` 里写死的 `member1`/`member2`、「一人离开整段结束」——都建立在「正好两人」之上。`startConversation` input 上面的注释也明说了：「Conversations can only have two participants for now, so we don't have a separate "invite" input.」想做多人对话，得重写状态机，而不是改改参数。

## 小结

把 AI Town 的对话社交剥到最里层，会发现 LLM 其实只负责「说什么」，而「谁能跟谁说、什么时候开始、什么时候结束、聊完歇多久」全是一套不带智能的状态机说了算。

这套状态机的骨架是三件事：

一是**生命周期**。对话有明确阶段：`invited`（被喊）→ `walkingOver`（走近）→ `participating`（站定开聊）→ `leave`/`stop`（结束）。状态转换由物理条件（走到 1.3 格内）和时间条件（超时、聊太久）共同触发，而不是某个 Agent 拍脑袋。

二是**排他**。每个 player 同时只属于一段对话，从挑候选人时就排除忙人、到 `start` 时的串行排他检查，两道闸保证不会三个人抢一个对话。

三是**冷却**。个体冷却（15 秒不应期）+ 关系冷却（同一对人 60 秒内不重复）两层叠加，把「刚结束又黏上」彻底挡掉。

迁移到自己的系统时，可以照着问三个问题：

第一，你的「会话」有没有显式的生命周期状态？客服排队、语音房连麦、协作配对，但凡涉及「两个实体临时结对、做完就散」，都该有一套 `invited → active → ended` 的显式状态，而不是用几个布尔标记拼凑。

第二，你怎么保证一个实体不被同时拉进两段会话？要么在源头过滤忙人，要么在创建时做串行排他检查——AI Town 两手都用了，因为异步竞态总会从某个缝里钻进来。

第三，你的「冷却」是按个体算还是按关系算？很多自动配对系统只防「同一个人连续接单」，却忘了防「同两个人反复配对」。两个粒度配齐，系统的行为才会显得有分寸、不机械。

LLM 让这些 NPC 说出有人味的话，但让它们「像个正常人那样开始和结束一段对话」的，从头到尾是这套朴素的社交状态机。

## 对应 convex 源文件

- `convex/aiTown/conversation.ts`：`Conversation` 类，`start`（发起 + 排他检查）、`tick`（walkingOver→participating 的转轴）、`acceptInvite` / `rejectInvite` / `leave` / `stop`，以及各 input handler。
- `convex/aiTown/conversationMembership.ts`：`ConversationMembership` 的三态定义 `invited` / `walkingOver` / `participating`。
- `convex/aiTown/agent.ts`：`Agent.tick`（按 membership 状态决定接受/走近/发言/离开）、`findConversationCandidate`（关系冷却 + 就近挑人）。
- `convex/aiTown/agentOperations.ts`：`agentDoSomething`（个体冷却、活动冷却、错峰发 input）。
- `convex/aiTown/agentInputs.ts`：`finishDoSomething`（真正调 `Conversation.start` 发邀请、记 `lastInviteAttempt`）。
- `convex/aiTown/player.ts`：`Player.leave`（离开游戏时顺手 stop 对话）。
- `convex/constants.ts`：`CONVERSATION_DISTANCE`、`CONVERSATION_COOLDOWN`、`PLAYER_CONVERSATION_COOLDOWN`、`INVITE_TIMEOUT`、`INVITE_ACCEPT_PROBABILITY`、`MAX_CONVERSATION_DURATION`、`MAX_CONVERSATION_MESSAGES` 等阈值。
- `convex/aiTown/game.ts`：对话归档时写入 `participatedTogether` 边表（关系冷却的数据来源）。
</content>
</invoke>
