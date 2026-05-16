---
title: "AI Town 值得学习的不是像素小镇，而是 Agent 基础设施"
date: 2026-05-16 17:48:00
tags: [AI, Agent, AI Town, Convex, 向量检索, 系统设计, 课程]
categories: [技术笔记]
---

第一次看到 AI Town，很容易被它的外壳带偏：一个像素风小镇，几个 NPC 到处走、聊天、社交，看起来像是“LLM + 游戏 UI”的 demo。

但如果把 UI 拿掉，AI Town 真正值钱的地方其实是它已经替我们踩过一批多 Agent 应用里最麻烦的坑：

- 怎么让一个世界持续运行，而不是依赖某个进程永远不挂；
- 怎么保证状态更新是串行的，不被多个 Agent 和用户输入同时写乱；
- 怎么让前端看到平滑动画，同时不把数据库写爆；
- 怎么让 LLM 慢慢思考，但不阻塞游戏主循环；
- 怎么把对话压缩成记忆，再用向量检索找回来；
- 怎么让异步任务失败、延迟、重复触发时，系统仍然能恢复。

所以 AI Town 更像一个可学习的 Agent runtime 样板。像素小镇只是演示场景，底层的调度、状态机、异步操作和记忆系统，才是可以迁移到客服、协作工具、游戏 NPC、AI 助手、虚拟社群里的东西。

## 一句话理解 AI Town

AI Town 的核心闭环可以概括成这样：

```text
用户输入 / Agent 输入
  -> 写入 inputs 表
  -> Convex scheduler 唤醒 runStep
  -> 单线程 game engine 消费输入
  -> 在内存中推进多个 tick
  -> 计算状态 diff 并写回数据库
  -> 前端订阅状态并做历史回放
  -> Agent 异步调用 LLM / 向量记忆
  -> 异步结果再次变成 input 回到 engine
```

如果画成架构图，大概是：

```text
Human / Agent input
        |
        v
    inputs table
        |
        v
scheduled runStep
        |
        v
single-threaded engine
        |
        +--> save diff to database --> reactive UI replay
        |
        +--> Agent.tick
                  |
                  v
            async operation
                  |
                  v
        LLM / embedding / vector search
                  |
                  v
              new input
```

这个闭环的关键思想是：**核心世界状态只允许 game engine 修改，外部世界只能提交 input。**

用户点击、角色移动、LLM 生成回复、向量检索结果，这些来源都不直接改世界。它们都先变成输入，再由 engine 在自己的 step 中统一处理。这样系统虽然有很多异步来源，但状态变更仍然是可控、可推理的。

## Convex 调度：把“稍后继续”变成可靠任务

普通后端里，我们可能会写一个常驻进程：

```js
while (true) {
  await stepWorld();
  await sleep(1000);
}
```

这个写法在单机 demo 里没问题，但一旦进入 serverless 或云函数环境，就会变得很脆弱：进程可能被回收，部署会中断循环，多个实例可能同时跑，失败后也不知道从哪里恢复。

AI Town 用 Convex 的 scheduler 来驱动世界前进。也就是说，它不是让一个 Node 进程永远活着，而是把“下一次 step 什么时候运行”记录成一个持久化的调度任务。

Convex 的函数边界很重要：

- `query`：读数据，适合给前端做实时订阅；
- `mutation`：事务性写数据库，适合做确定性的状态变更；
- `action`：执行外部副作用，比如调用 LLM、HTTP API、embedding 服务。

调度函数可以通过 `ctx.scheduler.runAfter` 或 `ctx.scheduler.runAt` 安排未来任务。这里有一个非常重要的工程细节：如果在 mutation 里调度任务，调度会和数据库写入绑定在同一个事务里；如果 mutation 成功，任务也会被安排。如果在 action 里调度，调度本身不是整个 action 的事务一部分，后续代码失败时，已经安排的任务不会自动撤回。

这也是为什么 AI Town 把核心状态更新放在 mutation / engine 边界里，而把 LLM 这类外部调用放进 action。它不是随便分层，而是在利用 Convex 的事务语义。

可以把它记成一句话：

```text
mutation 负责确定性状态，action 负责不确定副作用，scheduler 负责可靠续跑。
```

## 单线程 step：让每个 world 像一个 actor

多 Agent 系统最容易乱的地方，是大家都想改状态。

用户说话要改状态，NPC 走路要改状态，LLM 回复要改状态，记忆写入也要改状态。如果这些逻辑分散在不同异步函数里直接写数据库，很快就会遇到：

- 两个任务同时修改同一个角色；
- LLM 慢返回，覆盖了更新的状态；
- 用户输入和 Agent 输入顺序不稳定；
- 重试任务导致同一个事件被处理两次；
- 前端看到半更新状态。

AI Town 的解法是把每个 world 当成一个 actor：外部只能发消息，内部一次只处理一批消息。

一次 step 大致会做这些事：

1. 从数据库加载当前 world 状态；
2. 找到这段时间内需要处理的 inputs；
3. 在内存里创建 game engine；
4. 连续推进多个 tick；
5. tick 过程中处理输入、移动角色、更新对话状态；
6. 计算和旧状态相比的 diff；
7. 把 diff 写回数据库；
8. 调度下一次 step。

这里的“单线程”不是指底层只有一个 CPU 线程，而是指业务语义上同一个 world 的状态由一个 engine 串行拥有。这样写游戏逻辑时，就可以像写单机游戏循环一样思考：

```text
读取输入 -> 推进状态 -> 输出新状态
```

而不是到处思考锁、事务冲突、乱序回调。

AI Town 还用了 generation 之类的版本机制来处理竞态。例如旧的 scheduled step 已经排队了，但后来 world 被新的输入唤醒，generation 变了，那么旧任务启动时发现自己过期，就可以直接退出。这个机制避免了“旧闹钟”重新唤醒一个已经被新任务接管的世界。

这类设计在很多系统里都能复用：聊天室、协作白板、多人游戏、Agent 工作流、订单状态机，都可以采用“外部提交事件，内部串行消费”的结构。

## 历史回放：数据库低频写，前端高频动

游戏或实时协作界面有一个天然矛盾：

- 如果服务端每一帧都写数据库，成本高，延迟高，还容易打爆后端；
- 如果服务端一秒才写一次，前端角色移动就会一卡一卡。

AI Town 的解决方式是历史回放。

它的 engine 内部可以按较高 tick 频率推进世界，但不会每个 tick 都写一次数据库。相反，它会把一段时间内的重要数值变化记录成历史 buffer，例如角色的位置、方向、速度等。然后在 step 结束时，把这段历史一起存下来。

前端拿到的不是一个孤零零的当前位置，而是一小段轨迹：

```text
t0: x=10, y=20
t1: x=11, y=20
t2: x=12, y=21
t3: x=13, y=21
```

于是客户端可以基于历史时间在本地插值、回放，看起来就像角色持续平滑移动。

这个模式非常经典：

```text
服务端：低频写入权威状态
客户端：高频渲染历史轨迹
```

它背后的取舍是：牺牲一点点实时性，换来更低的数据库压力和更平滑的视觉体验。

这个思路不只适用于像素小镇。只要你的系统有“服务端权威状态 + 前端连续表现”，都可以借鉴：

- 股票曲线、数据大屏；
- 多人协作文档中的光标；
- 机器人路径回放；
- 实时任务看板；
- 物联网设备状态流。

不过历史回放适合数值型、连续型状态，比如位置、进度、速度。它不适合复杂嵌套对象，也不适合语义上不能插值的状态，比如“是否已付款”“订单已取消”。

## Agent 异步 LLM：让慢思考离开主循环

LLM 和游戏循环的性格完全不同。

游戏循环需要快、确定、可恢复；LLM 调用则慢、不稳定、可能超时、可能失败，还会消耗 token。如果在每个 step 里直接等待 LLM，整个世界就会被一个角色的思考卡住。

AI Town 把 Agent 行为拆成两层。

第一层是同步的 `Agent.tick`。它跟随 game engine 一起运行，适合做轻量判断：

- 我现在在哪里；
- 我是否到达目标；
- 我是否正在和某人聊天；
- 当前异步操作有没有完成；
- 是否需要发起一个新的操作。

第二层是异步 operation。只要涉及 LLM、embedding、向量检索、总结记忆、外部 API，就启动一个 Convex action 去处理。

这条边界非常关键：

```text
Agent.tick 不等 LLM
LLM action 不直接改 engine 状态
action 完成后提交 input
engine 在下一次 step 中消费 input
```

也就是说，LLM 的结果不是“直接写入世界”，而是“申请改变世界”。真正改变世界的权力仍然在单线程 engine 手里。

这样做有几个好处：

- 主循环不会被 LLM 阻塞；
- LLM 失败可以重试或忽略；
- 结果晚回来时，可以由 engine 判断是否仍然有效；
- 所有状态变化仍然有统一入口；
- 调试时可以回看 input 序列。

AI Town 还会限制一个 Agent 同时只能有一个进行中的 operation。否则一个角色可能同时发起多个 LLM 请求，最后 A 请求晚于 B 请求返回，却覆盖了更晚的决策。这类乱序问题在真实 Agent 应用里非常常见。

这里可以抽象出一个更通用的 Agent runtime 原则：

```text
智能体可以异步思考，但状态机必须同步裁决。
```

## 记忆向量检索：重点不是 vector DB，而是记忆生命周期

很多人一提 Agent memory，就会想到“加一个向量数据库”。但 AI Town 更值得学的是完整记忆生命周期。

一段对话结束后，系统不会把所有聊天记录原封不动塞进 prompt。它通常会先做总结：

```text
Alice and Bob talked about Alice's plan to open a bakery.
Bob encouraged Alice and mentioned he likes sourdough bread.
```

然后系统对这段 summary 计算 embedding，并存入向量索引。下次 Alice 再遇到 Bob 时，系统可以构造一个检索问题：

```text
What does Alice remember about Bob?
```

对这个问题也算 embedding，再从历史记忆里找最相似的几条，放进下一次对话 prompt。

这个流程可以拆成四步：

```text
事件发生 -> 摘要压缩 -> 向量写入 -> 相关召回 -> prompt 注入
```

每一步都有设计问题。

### 什么时候写记忆

不是每句话都值得写成长期记忆。太频繁会导致成本高、噪声大，后面检索出来的东西也会变脏。

更合理的粒度通常是：

- 一段对话结束后写一次；
- 一个任务完成后写一次；
- 用户明确表达偏好时写一次；
- 状态发生长期影响时写一次。

### 写什么

原始聊天记录信息量大，但噪声也大。摘要更适合长期记忆，因为它压缩了上下文，降低了检索和 prompt 成本。

但摘要也有风险：LLM 总结可能遗漏、歪曲、过度概括。因此更稳的做法是同时保留：

- 原始事件引用；
- LLM summary；
- 时间戳；
- 相关人物；
- 来源类型；
- 重要性评分。

这样以后检索出来时，既能用 summary 快速注入 prompt，也能回溯原始证据。

### 怎么查

向量检索查的是“语义相似”，不是精确条件。所以检索 query 的写法很重要。

如果只是用当前最后一句话做检索，可能召回不到真正相关的长期记忆。AI Town 这类系统通常会把角色身份、对话对象、当前目标组合成一个更明确的问题，再拿这个问题去查记忆。

例如：

```text
What important memories does Alice have about Bob that could affect this conversation?
```

这比单纯拿“Hi Bob”去做 embedding 有用得多。

### 怎么放进 prompt

记忆召回不是越多越好。召回太多会污染上下文，让 Agent 过度关注历史，甚至把无关记忆当成当前事实。

比较实用的做法是：

- 只放 top-k 条；
- 给每条记忆带上时间；
- 明确告诉模型这是“可能相关的记忆”，不是当前观察；
- 对过旧或低置信度记忆降权；
- 重要事实可以用结构化字段单独保存，不只依赖向量。

所以 Agent memory 的难点从来不是“有没有 vector DB”，而是如何设计写入、压缩、召回、注入、遗忘和纠错。

## 为什么这些基础设施可以迁移

把 AI Town 的像素 UI 换掉，底层结构仍然成立。

如果做 AI 客服：

```text
用户消息 -> input
会话状态机 -> single-threaded step
LLM 回复 -> async action
客户画像/历史工单 -> memory retrieval
前端聊天流 -> replay
```

如果做多人协作工具：

```text
用户操作 -> input log
文档状态 -> engine 串行应用
AI 辅助编辑 -> async operation
历史版本 -> replay / diff
团队知识 -> vector memory
```

如果做游戏 NPC：

```text
玩家行为 -> input
世界模拟 -> step loop
NPC 决策 -> Agent.tick
复杂对白 -> LLM action
角色经历 -> memory
客户端动画 -> historical replay
```

如果做自动化 Agent 工作流：

```text
任务事件 -> input
工作流状态机 -> step
工具调用 -> async action
执行记录 -> durable history
经验总结 -> memory
```

AI Town 提供的是一种可迁移的分层方式：

```text
核心状态：engine 独占
外部变化：统一变成 input
时间推进：scheduler 驱动
慢速智能：action 异步执行
前端表现：历史 replay 平滑呈现
长期上下文：summary + embedding + vector search
```

这个模型的好处是，它没有把 LLM 当成系统中心。LLM 只是一个会产生建议和文本的异步组件；真正的系统中心是状态机、事件流和调度机制。

## 学习路线

如果想真正吃透 AI Town，我建议按这个顺序看。

第一步，先学 Convex 的函数模型。

重点理解 `query`、`mutation`、`action` 的边界。尤其要记住：数据库事务和外部副作用不能混在一起想。

第二步，看 scheduled functions。

重点理解为什么要用 scheduler 驱动下一次 step，而不是用常驻循环。顺便理解 mutation 中调度和 action 中调度的语义差异。

第三步，看 AI Town 的 engine。

重点看 input 是怎么进入系统的，step 是怎么消费 input 的，world 状态是怎么加载、推进、保存 diff 的。

第四步，看 historical replay。

重点理解为什么服务端可以低频写，但前端仍然能高频渲染。这个技巧在实时产品里很有复用价值。

第五步，看 Agent operation。

重点看同步 tick 和异步 LLM action 的边界。看它如何避免一个 Agent 同时发起多个未完成操作。

第六步，看 memory。

重点看对话如何被总结，embedding 如何缓存，vector search 如何召回，召回结果如何进入 prompt。

## 最后总结

AI Town 的表层是一个像素小镇，里层其实是一套多 Agent 基础设施。

它真正值得学习的不是怎么画地图、怎么让角色走路，而是怎么把不确定的 LLM 放进一个确定的系统：

- 用 scheduler 让世界可靠续跑；
- 用单线程 step 保护核心状态；
- 用 input 队列统一外部变化；
- 用 action 承接 LLM 和外部副作用；
- 用 historical replay 平衡实时体验和写入成本；
- 用 summary + embedding + vector search 做长期记忆；
- 用 generation / operation 状态处理过期任务和乱序结果。

如果只把它当成一个游戏 demo，会低估它；如果把它看成一个 Agent runtime，会发现它解决的正是今天很多 AI 应用会遇到的共同问题。

## 参考资料

- [AI Town GitHub Repository](https://github.com/a16z-infra/ai-town)
- [AI Town Architecture](https://github.com/a16z-infra/ai-town/blob/main/ARCHITECTURE.md)
- [Convex Functions](https://docs.convex.dev/functions)
- [Convex Scheduled Functions](https://docs.convex.dev/scheduling/scheduled-functions)
- [Convex Actions](https://docs.convex.dev/functions/actions)
- [Convex Vector Search](https://docs.convex.dev/search/vector-search)
