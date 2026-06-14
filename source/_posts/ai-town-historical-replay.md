---
title: "AI Town 课程 04：历史回放，数据库低频写、前端高频动"
date: 2026-06-14 12:00:00
tags: [AI, Agent, AI Town, 实时同步, 性能, 课程]
categories: [技术笔记]
---

第 1 讲里我提过一个矛盾，但只是一笔带过。这一讲想把它拆开讲清楚。

矛盾是这样的：实时游戏想要 60fps 的平滑动画，可是我没法 60fps 地写数据库。

如果服务端每一帧都写一次库，成本高、延迟高，还容易把后端打爆。可如果一秒才写一次，前端角色就会一格一格地跳，像幻灯片。

AI Town 给出的答案，第 1 讲叫它"历史回放"：服务端低频写权威状态，客户端高频渲染历史轨迹。这一讲我顺着源码，把这套机制从服务端的采样压缩一直讲到前端的插值重建。

## 先想清楚：到底矛盾在哪

引擎内部其实跑得很快。它按一个较高的 tick 频率推进世界，每个 tick 都重新算一遍每个角色的位置、朝向、速度。

但写库不是按 tick 走的，是按 step 走的。一个 step 里可能跑了很多个 tick，结束时才落一次盘。

所以问题变成：一个 step 内部，角色其实走过了一小段连续轨迹，可我只在 step 末尾写一次库。前端拿到的如果只是末尾那一个孤零零的坐标，它就丢掉了中间的全部过程。

解法的关键一步，是**别只存末尾的值，把这一段时间里值的变化全存下来**。前端拿到的不是一个点，而是一小段轨迹：

```text
t0: x=10, y=20
t1: x=11, y=20
t2: x=12, y=21
t3: x=13, y=21
```

有了这段轨迹，前端就能基于一个"历史时间"在本地插值回放，看起来角色就是在持续平滑地移动。

这套东西的载体，是 `convex/engine/historicalObject.ts` 里的 `HistoricalObject`。

## 服务端：每个 tick 采样，step 末尾打包

先看引擎是怎么用它的。在 `convex/aiTown/game.ts` 里，每个 step 开始时会清空并重建历史 buffer：

```ts
beginStep(_now: number) {
  // Store the current location of all players in the history tracking buffer.
  this.historicalLocations.clear();
  for (const player of this.world.players.values()) {
    this.historicalLocations.set(
      player.id,
      new HistoricalObject(locationFields, playerLocation(player)),
    );
  }
  this.numPathfinds = 0;
}
```

然后每个 tick 末尾，把当前位置喂进去：

```ts
// Save each player's location into the history buffer at the end of
// each tick.
for (const player of this.world.players.values()) {
  let historicalObject = this.historicalLocations.get(player.id);
  if (!historicalObject) {
    historicalObject = new HistoricalObject(locationFields, playerLocation(player));
    this.historicalLocations.set(player.id, historicalObject);
  }
  historicalObject.update(now, playerLocation(player));
}
```

注意这里被追踪的不是整个 player 对象，而是 `locationFields`。看 `convex/aiTown/location.ts`：

```ts
export const locationFields: FieldConfig = [
  { name: 'x', precision: 8 },
  { name: 'y', precision: 8 },
  { name: 'dx', precision: 8 },
  { name: 'dy', precision: 8 },
  { name: 'speed', precision: 16 },
];
```

只有五个纯数字：坐标 x/y、归一化朝向 dx/dy、速度 speed。这点很重要，回放只适合**连续的数值量**。后面会专门讲为什么。

`HistoricalObject.update` 做的事情很克制——它只在值真的变了的时候才记一条样本：

```ts
update(now: number, data: T) {
  this.checkShape(data);
  for (const [key, value] of Object.entries(data)) {
    const currentValue = this.data[key];
    if (currentValue !== value) {
      let history = this.history[key];
      if (!history) {
        this.history[key] = history = { initialValue: currentValue, samples: [] };
      }
      const { samples } = history;
      // ...同一时刻则覆盖，否则 push 一条新样本
      samples.push({ time: now, value });
    }
  }
  this.data = data;
}
```

每个字段各自维护一条 `History`：一个 `initialValue`，加上一串带时间戳的 `samples`。值没变就不记，这天然就是一层压缩——一个站着不动的角色，几乎不产生样本。

到了 step 末尾，`game.ts` 的 `takeDiff` 调用 `pack()`，把每个角色的历史压成二进制 buffer，连同世界状态一起写库：

```ts
const buffer = historicalObject.pack();
if (!buffer) {
  continue;
}
historicalLocations.push({ playerId: id, location: buffer });
```

`pack()` 返回 `null`（没有任何样本）时直接跳过——又省一笔。

## 为什么要压缩，以及怎么压

你可能会问：这点轨迹数据，至于费劲压缩吗？

至于。想象几十个角色，每个角色五个字段，每个字段一个 step 内可能有几十条样本，每条样本是 64 位时间戳加 64 位浮点。这些 buffer 是要存进数据库、再通过订阅推给每一个在线客户端的。不压，带宽和存储都会很难看。

`packSampleRecord` 里对每个字段的历史叠了四层编码，源码注释写得很清楚，我抄过来：

```ts
// 1. Quantization: Turn each floating point number into an integer
//    by multiplying by 2^precision and then `Math.floor()`.
// 2. Delta encoding: Assume that values are continuous and don't
//    abruptly change over time, so their differences will be small.
// 3. Run length encoding (optional): Assume that some quantities
//    in the system will have constant velocity, so encode `k`
//    repetitions of `n` as `[k, n]`. If run length encoding doesn't
//    make (2) smaller, we skip it.
// 4. Varint encoding: ... a variable length integer encoding that
//    uses fewer bytes for smaller numbers.
```

一层层拆开说。

**第一层量化**。浮点不好压，先变成整数。`convex/util/compression.ts` 里：

```ts
export function quantize(values: number[], precision: number) {
  const factor = 1 << precision;
  return values.map((v) => Math.floor(v * factor));
}
```

`precision` 就是 `locationFields` 里那个数字。x/y 用 8，意味着坐标乘以 256 再取整，保留 1/256 格的精度——对像素小镇足够了。speed 用 16，因为速度这种量需要更细的分辨率。量化的代价是引入小于 `1 / 2^precision` 的误差，这是用精度换字节，可控。

**第二层 delta 编码**。位置是连续变化的，相邻样本差很小。与其存 `[2560, 2576, 2592]`，不如存 `[2560, 16, 16]`。后两个数小多了，给第四层省字节铺路：

```ts
export function deltaEncode(values: number[], initialValue = 0) {
  let prev = initialValue;
  const deltas = [];
  for (const value of values) {
    deltas.push(value - prev);
    prev = value;
  }
  return deltas;
}
```

**第三层游程编码（可选）**。角色经常匀速直线走，那 delta 序列就是一串相同的数，比如 `[16, 16, 16, 16]`。RLE 把它压成 `[16, 4]`：

```ts
export function runLengthEncode(values: number[]) {
  // ...连续相同的值压成 [value, count]
}
```

它是"可选"的，因为不是所有数据 RLE 都更短。`packSampleRecord` 里真的去比了一下：

```ts
const useRLE = runLengthEncoded.length < deltaEncoded.length;
let fieldHeader = fieldNumber;
if (useRLE) {
  fieldHeader |= 1 << 4;
}
```

只有 RLE 确实更小才用，并且把"是否用了 RLE"这一位塞进字段头里，解码时照着读。这种"试一下哪个更小再决定"的务实味道，我挺喜欢。

**第四层变长整数**。最后用 `FastIntegerCompression.ts` 的变长编码，小数字用更少字节。它的核心是每字节用 7 位存数据、1 位标记"还有没有后续字节"：

```ts
if (val < 1 << 7) {
  view[pos++] = val;
} else if (val < 1 << 14) {
  view[pos++] = (val & 0x7f) | 0x80;
  view[pos++] = val >>> 7;
} // ...
```

前三层的全部努力——量化、delta、RLE——本质上都是为了让数字尽量小，好让这第四层用最少的字节装下它们。因为 delta 后会有负数，这里用的是 `compressSigned`，配合 zigzag 编码把负数也映射成小的非负数。

打包格式开头还写了一个 4 字节的 `xxHash32`，是对字段配置算的哈希。解包时 `unpackSampleRecord` 会校验：

```ts
if (configHash !== expectedConfigHash) {
  throw new Error(`Config hash mismatch: ${configHash} !== ${expectedConfigHash}`);
}
```

这是为了保证**前后端用的是同一套字段定义**。`locationFields` 在 `convex/` 里定义，前端 `Player.tsx` 直接 import 同一个常量，配置天然一致。一旦有人改了字段没同步，哈希对不上就立刻报错，而不是默默解出一堆乱码。

## 前端：构造一条"稍微滞后"的时间轴

服务端把轨迹存好了，前端怎么放？这是整套机制最精妙的一半。

关键洞察：前端**不能播放"现在"**。因为网络有延迟，客户端拿到的永远是稍微过去的服务端状态。如果硬要播现在，就会一直追着 buffer 的尾巴，一卡顿就没东西可播。

所以 `src/hooks/useHistoricalTime.ts` 的做法是：**构造一条比真实服务端时间稍微滞后的本地时间轴**，永远在已经收到的 buffer 里面回放。

它把每次收到的引擎状态拼成一串连续的时间区间：

```ts
const newInterval = {
  startTs: engineStatus.lastStepTs,
  endTs: engineStatus.currentTime,
};
this.intervals.push(newInterval);
this.totalDuration += newInterval.endTs - newInterval.startTs;
```

然后 `historicalServerTime` 在每一帧（由 `requestAnimationFrame` 驱动）推进这条本地时间轴。最有意思的是它的变速逻辑：

```ts
// Simple rate adjustment: run time at 1.2 speed if we're more than 1s behind and
// 0.8 speed if we only have 100ms of buffer left.
const bufferDuration = lastServerTs - prevServerTs;
let rate = 1;
if (bufferDuration < SOFT_MIN_SERVER_BUFFER_AGE) {
  rate = 0.8;
} else if (bufferDuration > SOFT_MAX_SERVER_BUFFER_AGE) {
  rate = 1.2;
}
```

这是一个软性的缓冲控制：

- buffer 快空了（剩不到 250ms），就放慢到 0.8 速，撑住别播完了；
- buffer 攒太多了（超过 1250ms），就加速到 1.2 速，别让画面比真实状态落后太多。

如果实在落后太狠，还有硬下限直接跳：

```ts
let serverTs = Math.max(
  prevServerTs + (clientNow - prevClientTs) * rate,
  // Jump forward if we're too far behind.
  lastServerTs - MAX_SERVER_BUFFER_AGE,
);
```

`MAX_SERVER_BUFFER_AGE` 是 1500ms。意思是：再怎么样，回放也不能落后真实状态超过 1.5 秒，否则宁可跳帧也要追上来。这就是平滑和实时之间那条线——它选择牺牲最多 1.5 秒的实时性，换平滑。

每帧算出一个 `historicalTime`，这个值就是"我现在要渲染的那个滞后的服务端时刻"。

## 前端：按这个时刻把值查出来

有了 `historicalTime`，`src/hooks/useHistoricalValue.ts` 负责回答："在那个时刻，这个角色的 x/y/dx/dy/speed 各是多少？"

它先把服务端的二进制 buffer 解回样本：

```ts
return unpackSampleRecord(fields, history);
```

然后 `HistoryManager.query` 在样本序列里走查，找到 `historicalTime` 落在哪一段，取那一段对应的值：

```ts
for (const sample of history.samples) {
  if (sample.time > historicalTime) {
    foundIndex = i;
    break;
  }
  currentValue = sample.value;
}
```

逻辑是：从头扫样本，凡是时间戳还没超过 `historicalTime` 的，就一路把 `currentValue` 更新过去；一旦碰到第一个时间戳超过 `historicalTime` 的样本，停下，此刻的 `currentValue` 就是答案。

因为时间只会往前走，查过的旧样本就能扔掉，`query` 顺手做了清理：

```ts
if (foundIndex !== null) {
  this.histories[fieldName] = histories.slice(foundIndex);
}
```

`Player.tsx` 把两者接起来，喂给渲染：

```ts
const historicalLocation = useHistoricalValue<Location>(
  locationFields,
  historicalTime,
  playerLocation(player),
  locationBuffer,
);
// ...
x={historicalLocation.x * tileDim + tileDim / 2}
isMoving={historicalLocation.speed > 0}
```

注意一个优雅的兜底：`useHistoricalValue` 里如果没有 `historicalTime`，直接返回当前权威值。也就是说，回放是增强，不是依赖——拿不到历史时也不至于白屏。

至此闭环完成：服务端每 tick 采样、step 末尾压缩落库 → 推给前端 → 前端构造滞后时间轴 → 每帧按时刻查出值 → 渲染。60fps 的平滑，建立在远低于 60fps 的写库之上。

## 踩坑：这套机制最容易翻车的几个地方

**时间对齐**。整个机制的命门是前后端时间轴必须能对得上。服务端样本时间戳来自引擎的 `now`，前端时间轴从 `engineStatus.lastStepTs` / `currentTime` 拼出来。要是这两套时间不是一回事，回放就会整体偏移甚至错乱。`useHistoricalTime` 里对乱序到达的引擎状态是直接抛错的：`Received out-of-order engine status`——它宁可炸，也不愿默默播错。

**缓冲延迟的取舍**。`SOFT_MIN` / `SOFT_MAX` / `MAX` 这三个常量是手调出来的。缓冲设大了，画面更稳但更"延迟"，玩家会觉得操作有滞后感；设小了，更跟手但网络一抖就卡。源码注释自己也承认这是 "simple rate adjustment"，更讲究的做法是根据 buffer 大小连续调速。这是个需要按你自己网络环境去 tune 的旋钮，没有万能值。

**丢帧与跳变**。当回放落后超过 `MAX_SERVER_BUFFER_AGE`，时间轴会硬跳。`historicalServerTime` 里还处理了一种情况：服务端状态有空洞（gap），desired 时刻落在了某个区间开始之前，它会把时间直接推到那个区间的起点：

```ts
if (serverTs < snapshot.startTs) {
  serverTs = snapshot.startTs;
  chosen = i;
}
```

也就是说，宁可瞬移一下，也不要卡死。在像素小镇里偶尔的瞬移可以接受，但如果你拿这套去做对精度敏感的场景，跳变就需要额外平滑。

**别拿它存不能插值的东西**。回放只对**连续数值**成立。位置、速度、进度条、光标坐标，这些插值出来是合理的。但"是否已付款""订单已取消"这种离散语义状态，中间插出来的值毫无意义——你不会想看到一个"付款了 0.5"。这也是为什么 `locationFields` 只放了五个纯数字，而没把整个角色状态丢进去。

## 小结：一个可以直接搬走的模式

把这一讲压成一句话：**服务端低频写权威状态、前端高频渲染历史轨迹，中间靠一段压缩过的采样 buffer 和一条稍微滞后的时间轴衔接。**

它的取舍很清楚——牺牲最多约 1.5 秒的实时性，换来数据库压力的大幅下降和视觉上的丝滑。对绝大多数"看起来要实时"的场景，这笔交易很划算，因为人眼对 1 秒级的滞后并不敏感，但对一卡一卡极其敏感。

这个模式完全不限于像素小镇。只要你的系统是"服务端权威 + 前端要流畅"，都能套：

- 股票曲线、实时数据大屏；
- 多人协作文档里的他人光标；
- 机器人 / 无人机的路径回放；
- IoT 设备的状态流。

迁移时记住三件事：一，只对连续数值用它；二，前后端共享同一份字段定义（AI Town 用配置哈希来强约束这一点）；三，缓冲那几个常量是要按你的网络环境调的旋钮，不是抄来就完。

下一讲我会转到 Agent 这边，看慢吞吞的 LLM 调用是怎么离开主循环、不阻塞这个每 tick 都在推进的世界的。

---

**涉及源文件**

- `convex/engine/historicalObject.ts`
- `convex/util/FastIntegerCompression.ts`
- `convex/util/compression.ts`
- `convex/aiTown/location.ts`
- `convex/aiTown/game.ts`
- `src/hooks/useHistoricalTime.ts`
- `src/hooks/useHistoricalValue.ts`
- `src/components/Player.tsx`
