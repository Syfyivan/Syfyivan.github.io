---
title: "写一个多人在线德州扑克：难点根本不在牌型判断"
date: 2026-06-12 16:00:00
tags: [游戏开发, WebSocket, 实时同步, 状态机, 全栈]
categories: [技术笔记, 项目工坊]
---

最近写了一个实时多人德州扑克的 Web MVP：创建房间、2-6 人同桌、盲注、下注轮、摊牌、边池结算，Web 和手机端共用一套协议。

动手之前我以为最难的是牌型判断——同花顺、葫芦、两对怎么比大小。结果整个项目里牌型判断只占了不到十行代码，因为我直接用了 `pokersolver` 这个库。

真正消耗时间的是另外三件事：

- 下注轮什么时候才算"结束"，这是一个比想象中绕的状态机问题；
- 每个玩家看到的牌桌必须不一样，但又必须同步；
- 有人中途掉线、退出房间、筹码打光，牌局要能继续往下走。

这篇笔记按这个顺序拆一遍。

## 为什么牌型判断是最简单的部分

牌型判断是一个**纯函数问题**：输入 7 张牌（2 张手牌 + 5 张公共牌），输出最好的 5 张组合和牌力。它没有时序、没有并发、没有玩家意图，输入相同输出永远相同。

这类问题早就被解决了。摊牌时我只需要：

```ts
// packages/game-engine/src/index.ts
const solvedEntries = sidePot.eligible.map((player) => ({
  player,
  solved: Hand.solve([...player.holeCards, ...this.communityCards].map(formatCard)),
}));
const winningHands = new Set(Hand.winners(solvedEntries.map((entry) => entry.solved)));
```

`Hand.solve` 算牌力，`Hand.winners` 处理平分底池。完事。

而"下注轮结束条件"这种问题没有现成库——它和你的数据结构、玩家状态、all-in 规则深度耦合，必须自己建模。多人游戏的工程量分布是反直觉的：**规则计算占一成，状态编排和同步占九成。**

## 整体架构：状态机和网络层必须分开

项目是 pnpm monorepo，五个模块：

```text
apps/web            React + Vite + Socket.IO Client
apps/mobile         Expo + React Native（复用同一套协议）
apps/server         Node + Express + Socket.IO 房间服务
packages/game-engine  纯 TypeScript 牌局状态机
packages/shared     前后端共享类型 + 事件协议
```

这个拆分里最重要的决定是：**`game-engine` 是一个不知道网络存在的纯状态机。** 它不 import socket.io，不知道什么是连接，只暴露 `addPlayer` / `setReady` / `applyAction` / `snapshotFor` 几个方法。

好处立刻体现在两个地方：

1. 引擎可以直接跑单元测试（`index.test.ts` 里直接 new 一张桌子打完整手牌，不用起服务器）；
2. 服务端代码薄到只有 190 行——它只做三件事：路由事件、查房间、广播快照。

通信协议定义在 `packages/shared`，客户端到服务端只有 5 个事件：

```ts
// packages/shared/src/index.ts
export interface ClientToServerEvents {
  "room:create": (payload: CreateRoomPayload, ack: (result: OperationResult) => void) => void;
  "room:join": (payload: JoinRoomPayload, ack: (result: OperationResult) => void) => void;
  "room:leave": () => void;
  "player:ready": (ready: boolean, ack: (result: OperationResult) => void) => void;
  "player:action": (payload: PlayerActionPayload, ack: (result: OperationResult) => void) => void;
}
```

服务端到客户端更少，只有 2 个：`table:update`（快照）和 `room:error`。

注意所有写操作都带 ack 回调。Socket.IO 的 ack 机制让"提交动作"变成了一次有响应的请求：合法就返回 `{ ok: true }`，违规（比如不该你行动、加注不够最低额）就返回 `{ ok: false, error }`，客户端直接把 error 渲染出来。不需要为错误处理单独设计事件。

## 游戏状态机：难的不是阶段，是"轮次何时结束"

德州扑克的阶段流转看起来很简单：

```text
lobby → preflop → flop → turn → river → showdown
```

阶段推进只是发牌：flop 发三张，turn、river 各一张。真正的坑在每个阶段内部的**下注轮**。

我最初的直觉是"每人行动一次，这轮就结束"。错。如果有人加注，前面已经行动过的玩家要重新获得行动权。正确的结束条件是两个条件同时满足：

> 所有未弃牌、未 all-in 的玩家都已行动，**且**他们本轮下注额全部等于当前最高注。

代码里就是这个判断：

```ts
// packages/game-engine/src/index.ts
private isBettingRoundComplete(): boolean {
  const playersWhoCanAct = this.playersInHand()
    .filter((player) => !player.folded && !player.allIn && player.chips > 0);
  if (playersWhoCanAct.length === 0) {
    return true;
  }
  return playersWhoCanAct.every(
    (player) => player.hasActed && player.currentBet === this.currentBet,
  );
}
```

配套的关键操作是：每当有人 bet 或 raise，把其他人的 `hasActed` 全部清掉——

```ts
private resetActionFlagsAfterAggression(aggressorId: string): void {
  for (const player of this.playersInHand()) {
    if (!player.folded && !player.allIn && player.id !== aggressorId) {
      player.hasActed = false;
    }
  }
}
```

这两段加起来不到二十行，但它们是整个状态机的心脏。我在这里反复改了好几版，因为边界情况非常多：

- 只剩一个未弃牌玩家 → 不发剩余公共牌，直接赢底池；
- 所有剩余玩家都 all-in → 没人能再行动，直接补完五张公共牌进摊牌（`dealRunoutAndShowdown`）；
- 两人局的盲注位和多人局不一样（heads-up 时庄家就是小盲）。

每次玩家行动后，统一走一个 `resolveAfterAction` 调度函数，按优先级依次检查"只剩一人 → 全员 all-in → 本轮结束 → 轮到下一人"。把这些分支收口到一个函数，比散落在各个 action 处理里要好维护得多。

另一个值得一提的设计是**服务端计算合法动作**。每次轮到某个玩家，引擎会为他生成一个 `ActionRequest`：

```ts
return {
  playerId: player.id,
  legalActions,   // 此刻能做的动作：["fold", "call", "raise"]
  toCall,         // 跟注需要多少
  minBet, minRaiseTo, maxBet,
  currentBet: this.currentBet,
};
```

客户端拿到它直接渲染按钮和金额范围，完全不需要在前端复算规则。前端永远只是"展示合法选项 + 提交意图"，规则只存在于一处。这也意味着 Web 端和手机端的 UI 逻辑都变得很薄。

## 实时同步：每个人看到的牌桌必须不一样

扑克和大多数多人游戏有个本质区别：**状态是不对称的**。我的手牌只有我能看见，摊牌前下发给别人就是作弊器。

所以不能把整个牌桌状态广播出去，必须按观察者生成**个性化快照**：

```ts
// packages/game-engine/src/index.ts
private playerSnapshot(player: InternalPlayer, viewerId?: string): PlayerSnapshot {
  const shouldRevealCards =
    player.id === viewerId ||
    (this.phase === "showdown" && !player.folded && player.holeCards.length > 0);
  // ...
  if (shouldRevealCards) {
    snapshot.holeCards = [...player.holeCards];
  }
  // 别人只能看到 cardCount: 2
}
```

服务端广播时不用 Socket.IO 的房间群发，而是逐个玩家定制：

```ts
// apps/server/src/index.ts
function emitSnapshots(roomCode: string): void {
  const room = rooms.get(roomCode);
  if (!room) return;
  for (const [socketId, playerId] of room.socketToPlayer.entries()) {
    const socket = io.sockets.sockets.get(socketId);
    socket?.emit("table:update", room.table.snapshotFor(playerId));
  }
}
```

同步策略我选了最笨也最稳的一种：**全量快照覆盖**。任何状态变更后，给房间里每个人重发完整牌桌。客户端收到 `table:update` 就整个 `setSnapshot(next)`，没有增量 diff，没有客户端预测，没有本地状态合并。

这个选择对回合制游戏是对的。一张 6 人桌的快照就几 KB，每手牌的状态变更次数也就几十次，根本不值得为它设计增量协议。而全量覆盖换来的是：客户端永远不可能和服务端不一致——因为客户端根本没有自己的状态，它只是服务端状态的渲染器。

**服务端是唯一权威状态源，客户端只提交意图**——这句话是整个实时同步的纲领。`player:action` 的 payload 只有 `{ type: "raise", amount: 80 }` 这样的意图，是否合法、轮没轮到你、钱够不够，全部由服务端裁决。

### 断线怎么办

MVP 阶段我做的是"优雅降级"而不是完整重连：

```ts
// packages/game-engine/src/index.ts — removePlayer
if (!this.isHandActive() || player.holeCards.length === 0) {
  // 不在牌局里：直接移除
  this.players = this.players.filter((c) => c.id !== playerId);
  return;
}
// 牌局进行中：标记掉线并自动弃牌，牌局继续
player.connected = false;
if (!player.folded) {
  player.folded = true;
  player.lastAction = "Disconnected";
  this.log(`${player.name} disconnected and folded.`);
  this.resolveAfterAction();
}
```

关键点：**掉线玩家不能立刻从牌桌上删除**。他已经投进底池的筹码会影响边池计算，必须保留到摊牌结算后再清理（`purgeDisconnectedPlayers`）。掉线被建模为"自动弃牌"，对其他五个人来说牌局完全不受影响。

引擎层其实预留了重连入口——`addPlayer` 遇到相同 `playerId` 会复用座位并把 `connected` 置回 true。但服务端目前每次入座都生成新的 `randomUUID`，没有持久身份凭证，所以刷新页面等于换了个人。完整的断线重连需要 token + Redis 存连接映射，这是 README 里明确列在"后续建议"的事，MVP 没有假装做了。

## 房间管理：一个 Map 能撑多远

房间层的实现朴素到只有两层 Map：

```ts
// apps/server/src/index.ts
interface RoomRuntime {
  table: HoldemTable;                    // 游戏状态
  socketToPlayer: Map<string, string>;   // socketId → playerId
}
const rooms = new Map<string, RoomRuntime>();
```

`socketToPlayer` 这层间接映射是有意为之：游戏引擎里的身份是 `playerId`，网络层的身份是 `socket.id`，两者解耦之后，"换连接不换玩家"在架构上才有可能。

房间码用 4 位字符生成，字母表刻意去掉了 `I/O/0/1` 这些易混字符——口头报房间号的时候不会念错：

```ts
const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
```

生命周期也简单：创建即入座，最后一个人离开时房间从 Map 里删掉。座位分配是找最小空位号（`nextOpenSeat`），庄位按钮则在每手牌开始时沿座位环顺时针找下一个参与者（`nextSeatFrom` 用取模实现环形遍历）。

内存房间的天花板很明显：进程重启全桌蒸发，也没法横向扩容。但作为 MVP 它换来了零部署依赖——`pnpm dev` 起两个进程就能六个人开打。生产化路径在技术方案里写好了：房间状态进 Redis，Socket.IO 用 Redis Adapter 跨实例广播，对局事件流落 Postgres 做回放和审计。这些都不改变引擎层的任何代码，因为引擎从一开始就不知道自己被存在哪里。

## 经验总结

1. **规则引擎和网络层分离是回报最高的决定。** 纯状态机可以单测、可以复用（Web/手机端共享协议）、可以无痛换存储。如果一开始把 `socket.on` 和发牌逻辑写在一起，后面每一步都是泥潭。

2. **回合制游戏用"全量快照 + 服务端权威"就够了。** 不要被"实时游戏要做增量同步和客户端预测"的说法吓住，那是给 60 帧动作游戏准备的。回合制游戏的状态小、变更稀疏，全量覆盖最不容易出 bug。

3. **不对称信息要在快照生成层解决，而不是 UI 层。** "前端不渲染对手手牌"是防君子不防 F12 的。`snapshotFor(viewerId)` 保证敏感数据根本不出服务器。

4. **掉线建模为游戏内动作（自动弃牌），而不是连接事件。** 这样状态机不需要理解"网络"这个概念，所有边界情况都收敛回已有的 `resolveAfterAction` 调度里。

5. **最难的代码往往最短。** `isBettingRoundComplete` 十行，`resetActionFlagsAfterAggression` 七行，但它们承载了下注规则全部的复杂度。写多人游戏，先在纸上把"什么条件下轮次推进"画成状态转移表，再动键盘。

下一步打算补上基于 token 的断线重连、操作倒计时和自动弃牌——这三个加上才算能给朋友们真正开一局。
