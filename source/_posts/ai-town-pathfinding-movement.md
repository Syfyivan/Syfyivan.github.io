---
title: "AI Town 课程 08：A* 寻路与移动，在网格世界里走路"
date: 2026-06-14 16:00:00
tags: [AI, Agent, AI Town, 寻路, A-star, 课程]
categories: [技术笔记]
---

第 1 讲里我们说过，AI Town 真正值钱的不是像素小镇，而是底下那套 Agent 基础设施。但有一块东西，总览里其实没怎么讲：NPC 是怎么走路的。

听起来像小事。可一旦你真去实现，会发现“走路”是一个被严重低估的问题。它不是“把角色坐标每帧加一点”那么简单。

## 先说清楚要解决什么问题

想象一个 NPC 站在小镇东头，它刚想明白“我要去西头那家面包店”。现在它面对的现实是：

- 中间有墙、有桌子、有水池，不能直接穿过去；
- 地图是有边界的，不能走到地图外面；
- 镇上还有别的角色也在走，两个人不能重叠站在同一个点；
- 而且别人是动态的，你规划路线那一刻是通的，等你走到一半，可能有人正好挡在前面；
- 这一切还得算得够快，因为一个 step 里可能有十几个角色同时要找路。

所以“走路”本质上是一个**带障碍的最短路径**问题，外加一层**动态避让**。这就是 `convex/aiTown/movement.ts` 这个文件在干的事。

## 为什么是 A*

先把地图离散化。AI Town 的世界是网格（grid），坐标基本是整数格点。`convex/aiTown/worldMap.ts` 里地图用 `objectTiles` 这样几层二维数组表示，`layer[x][y]` 是一个 tile 索引，等于 `-1` 表示这格是空的、可以走，不等于 `-1` 表示这里有障碍物。

地图一旦变成“格子 + 哪些格子能走”，最短路径就是一个经典图搜索问题。常见选项有三个：

- **BFS / Dijkstra**：能找到最短路，但它是“向四面八方均匀扩散”，不知道目标在哪个方向，浪费很多探索；
- **贪心最近优先**：只朝目标方向冲，快，但容易被墙骗进死胡同，找出来的不是最短路；
- **A***：在两者之间。它既看“已经走了多远”（真实代价），也看“离目标还有多远”（启发式估计），用两者之和决定先探索谁。

A* 的核心就一行思想：**优先探索“到目前为止代价 + 预估剩余代价”最小的那个点。** 这个值在代码里就叫 `cost`。

要让 A* 高效，你需要两个零件：

1. 一个**启发式函数**，用来快速估“从某点到终点还有多远”。AI Town 用的是曼哈顿距离（Manhattan distance），也就是横竖两个方向的距离之和，见 `convex/util/geometry.ts` 的 `manhattanDistance`。网格里只能横竖走，曼哈顿距离是个很贴合的下界估计。
2. 一个**最小堆**（min-heap），每次都能 O(log n) 取出 `cost` 最小的候选点。这就是 `convex/util/minheap.ts` 存在的理由。

## movement.ts 是怎么生成路径的

核心函数是 `findRoute`，签名是 `findRoute(game, now, player, destination)`。

它内部维护一个候选点结构 `PathCandidate`，每个候选点记着：当前位置、朝向、到达时间 `t`、已经走过的长度 `length`、综合代价 `cost`，还有一个 `prev` 指针指向上一个候选点。`prev` 很关键，最后要靠它把整条路径反向串出来。

搜索主循环长这样（节选自 `convex/aiTown/movement.ts` 的 `findRoute`）：

```ts
let bestCandidate = current;
const minheap = MinHeap<PathCandidate>((p0, p1) => p0.cost > p1.cost);
while (current) {
  if (pointsEqual(current.position, destination)) {
    break;
  }
  if (
    manhattanDistance(current.position, destination) <
    manhattanDistance(bestCandidate.position, destination)
  ) {
    bestCandidate = current;
  }
  for (const candidate of explore(current)) {
    minheap.push(candidate);
  }
  current = minheap.pop();
}
```

读这段代码，注意三件事：

- 循环每次从堆里 `pop` 出 `cost` 最小的点继续探索，这就是 A* 的“优先扩展最有希望的点”；
- 一旦 `current` 走到 `destination`，直接 `break`，路径找到了；
- 全程还偷偷记了一个 `bestCandidate`——离终点最近的那个点。这是为“找不到完整路”准备的兜底，待会说。

那候选点是怎么生出来的？看内部的 `explore` 函数。它做一件事：从当前点找出可以走到的相邻格点。如果当前不在整数格点上（比如刚被人挤偏了），它会先尝试横向或纵向贴回最近的格点；如果已经在格点上，就向上下左右四个邻居扩展。每生成一个邻居，它都算一遍代价：

```ts
const segmentLength = distance(current.position, position);
const length = current.length + segmentLength;
if (blocked(game, now, position, player.id)) {
  continue;
}
const remaining = manhattanDistance(position, destination);
const path = {
  position,
  facing,
  // Movement speed is in tiles per second.
  t: current.t + (segmentLength / movementSpeed) * 1000,
  length,
  cost: length + remaining,
  prev: current,
};
```

`cost = length + remaining`，正是 A* 的 `f = g + h`：`length` 是已经走过的真实距离（g），`remaining` 是曼哈顿启发式估的剩余距离（h）。

这里还藏着两个值得学的细节：

一是**被挡的格子直接 `continue` 跳过**，连进堆都不进。`blocked` 返回非空就说明这格不能站，那它根本不该成为路径的一部分。

二是 `minDistances` 这个二维表做了**剪枝**。对每个格点，它记下迄今为止到达该点的最小 `cost`；如果新算出来的路反而更贵，就丢弃。这避免了对同一个格子反复探索，是 A* 必备的“已访问/更优才更新”逻辑：

```ts
const existingMin = minDistances[position.y]?.[position.x];
if (existingMin && existingMin.cost <= path.cost) {
  continue;
}
minDistances[position.y] ??= [];
minDistances[position.y][position.x] = path;
```

## blocked 怎么判定“不能走”

避障的全部判断集中在 `blocked` 和它的底层 `blockedWithPositions`（同样在 `movement.ts`）。这个函数按顺序检查三类阻挡：

```ts
export function blockedWithPositions(position: Point, otherPositions: Point[], map: WorldMap) {
  if (isNaN(position.x) || isNaN(position.y)) {
    throw new Error(`NaN position in ${JSON.stringify(position)}`);
  }
  if (position.x < 0 || position.y < 0 || position.x >= map.width || position.y >= map.height) {
    return 'out of bounds';
  }
  for (const layer of map.objectTiles) {
    if (layer[Math.floor(position.x)][Math.floor(position.y)] !== -1) {
      return 'world blocked';
    }
  }
  for (const otherPosition of otherPositions) {
    if (distance(otherPosition, position) < COLLISION_THRESHOLD) {
      return 'player';
    }
  }
  return null;
}
```

逐段读：

- **出界**：坐标超过地图宽高，返回 `'out of bounds'`；
- **地图障碍**：遍历每一层 `objectTiles`，只要这格的 tile 不是 `-1`，就是墙或家具，返回 `'world blocked'`；
- **撞人**：遍历其他角色的位置，如果有谁离这个点太近（小于 `COLLISION_THRESHOLD`，常量里是 0.75 个格子），返回 `'player'`。

注意它返回的不是简单的布尔值，而是一个**字符串原因**。这点很贴心：上层日志能直接告诉你这次为什么停了，是撞墙还是撞人，排查问题省一半力气。

而上层的 `blocked` 函数做的就是把“其他角色的位置”准备好喂进来：

```ts
export function blocked(game: Game, now: number, pos: Point, playerId?: GameId<'players'>) {
  const otherPositions = [...game.world.players.values()]
    .filter((p) => p.id !== playerId)
    .map((p) => p.position);
  return blockedWithPositions(pos, otherPositions, game.worldMap);
}
```

它从当前世界状态里**实时**取所有其他玩家的位置——这就是“动态障碍”能成立的关键。寻路那一刻看到的就是此刻别人站在哪。地图墙是静态的，别的角色是动态的，但在 `blocked` 眼里它们一视同仁，都是“这格不能站”。

## 别人也在动，路径会过期怎么办

这是动态寻路最难的地方。你规划路线那一刻一切都好，但别人也在走，等你迈到下一格，前面可能突然站了个人。AI Town 没有去做复杂的多体协同规划，而是用了一个很务实的状态机，逻辑在 `convex/aiTown/player.ts`。

每个角色的 `pathfinding` 有三种状态：`needsPath`（需要算路）、`moving`（沿路走）、`waiting`（被挡了、等一会儿）。

`tickPathfinding` 负责状态转移：到达终点就停；超时（`PATHFINDING_TIMEOUT`，60 秒）就停；`waiting` 等够了就转回 `needsPath` 重算；处于 `needsPath` 且本 step 寻路次数没超额，就真的调 `findRoute` 算一条新路，转入 `moving`。

真正的动态避让发生在 `tickPosition` 里。它先按路径和当前时间算出“理论上现在该在哪”，然后**再检查一遍这个位置是否被挡**：

```ts
const { position, facing, velocity } = candidate;
const collisionReason = blocked(game, now, position, this.id);
if (collisionReason !== null) {
  const backoff = Math.random() * PATHFINDING_BACKOFF;
  console.warn(`Stopping path for ${this.id}, waiting for ${backoff}ms: ${collisionReason}`);
  this.pathfinding.state = {
    kind: 'waiting',
    until: now + backoff,
  };
  return;
}
// Update the player's location.
this.position = position;
this.facing = facing;
this.speed = velocity;
```

这就是答案：**走的时候再撞一次墙的检测。** 路径是过去算的，可能已经过期；所以每帧推进前，都用当前世界状态重新跑一遍 `blocked`。一旦发现前方被人挡住，不是硬挤过去，而是切到 `waiting`，随机等一个**退避（backoff）时间**，然后回 `needsPath` 重新规划。

`backoff` 之所以是随机的（`Math.random() * PATHFINDING_BACKOFF`），是为了打破两个角色面对面互相让路、同时退、同时上、又同时撞的死循环——这是分布式系统里经典的随机退避思想，搬到走路上一样好用。

## 路径怎么变成可回放的位置序列

第 4 讲讲过历史回放：服务端低频写，前端高频插值。寻路的输出正好是为这套机制量身定做的。

`findRoute` 最后不是返回一串离散格点，而是返回一条**带时间戳的路径**。看搜索结束后这段：

```ts
const densePath = [];
let facing = current.facing!;
while (current) {
  densePath.push({ position: current.position, t: current.t, facing });
  facing = current.facing!;
  current = current.prev;
}
densePath.reverse();

return { path: compressPath(densePath), newDestination };
```

它顺着 `prev` 指针把整条路反向串出来，再 `reverse` 成正序。每个点都带着 `t`——还记得 `explore` 里 `t: current.t + (segmentLength / movementSpeed) * 1000` 吗？那是按移动速度（`movementSpeed = 0.75` 格/秒）推算出来的“预计什么时候到这个点”。于是路径不只是“经过哪些格子”，而是“几点几分该在哪个格子”。

路径的存储格式见 `convex/util/types.ts`：`Path` 是一串 `[x, y, dx, dy, t]` 五元组。位置、朝向、时间打包在一起。

前端（以及 `convex/util/geometry.ts` 里的 `pathPosition`）拿到这条路，就能根据当前时间在相邻两个路点之间**线性插值**，算出“此刻精确在哪、朝哪、速度多少”。所以即使服务端一秒只写一次，角色看起来也是丝滑移动的——它走的是一条提前算好的、带时间轴的轨迹。

返回前还有一步 `compressPath`（在 `geometry.ts`）。它会把那些“能被前后两点线性插值出来”的中间路点删掉。一条笔直走十格的路，不需要存十个点，存首尾两个就够，中间的前端自己能插出来。这进一步压低了写库的数据量，呼应了第 4 讲“低频写”的取舍。

顺带提一句兜底逻辑。如果搜索跑完 `current` 是空的（堆空了也没到终点，说明终点根本走不到），就退回之前记的 `bestCandidate`——离终点最近的那个可达点，并把它设成新的目标 `newDestination`。上层 `player.ts` 收到 `newDestination` 会更新角色的目的地。这样“去不了精确目标”不会让角色干站着发呆，而是尽量靠近。

## 几个真实的坑

**角色互相挡死。** 两个 NPC 在窄道相遇，谁也过不去。靠的就是上面说的随机退避：撞上就退一个随机时间再重算，错开节奏，总有一个先让开。如果退避时间是固定的，它们会同步动作、永远卡住。

**路径抖动。** 因为别人一直在动，频繁重算可能让角色走两步退一步、来回蹭。`waiting → needsPath` 之间的退避窗口在这里起了缓冲作用：被挡了先停一下，而不是立刻疯狂重算。`PATHFINDING_TIMEOUT`（60 秒）则保证再怎么抖，超时就果断放弃，不会无限耗下去。

**重算太频繁会拖垮 step。** 寻路是 step 里相对重的计算。`convex/constants.ts` 用 `MAX_PATHFINDS_PER_STEP = 16` 给每个 step 的寻路次数封了顶。`tickPathfinding` 里靠 `game.numPathfinds < MAX_PATHFINDS_PER_STEP` 这个判断来限流——本 step 算路名额用完了，剩下想算路的角色就等下一个 step。这是用“略微延迟”换“主循环不被寻路打爆”的典型工程取舍，和第 1 讲里“慢思考离开主循环”是同一种哲学。

## 小结与迁移启发

把 AI Town 的走路系统拆开，其实是一套很干净的分层：

- **地图离散成网格**，可走/不可走用 tile 是否为 `-1` 表达；
- **A* 找最短路**，启发式用曼哈顿距离，优先队列用最小堆；
- **`blocked` 统一判障**，把静态的墙和动态的人当成同一回事，返回字符串原因方便排查；
- **三态状态机 + 随机退避**处理“路径会过期”，走的时候再撞一次墙，撞了就退避重算；
- **带时间戳的压缩路径**对接历史回放，服务端低频写、前端插值高频动；
- **每 step 限流**保护主循环不被寻路拖垮。

这套东西远不止能用来让像素人走路。任何“在带障碍的空间里规划路径、还要避开动态实体”的场景都能借鉴：仓库 AMR 调度、游戏单位寻路、地图导航的避堵重算，甚至抽象一点的“在状态图里找一条可行路径、中途条件变了要重规划”的工作流引擎。

尤其值得抄走的是两个思路。一个是**“规划时检查 + 执行时再检查”的双重避障**：世界是变的，别赌你规划那一刻的快照永远成立，迈步前再看一眼。另一个是**随机退避解死锁**：两个实体互相阻塞时，不要让它们同步动作，给一点随机性，僵局自己就化开了。

把寻路放回第 1 讲那张大图：它就是 NPC 决策（`Agent.tick`）和前端表现（historical replay）之间的那一段“怎么真的走过去”。LLM 决定去哪，A* 决定怎么去，状态机和退避保证一路上不撞死，时间戳路径让这一切在屏幕上看起来平滑自然。每一层都不复杂，但组合起来，小镇里的人就真的活了。
