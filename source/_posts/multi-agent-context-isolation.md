---
title: "多 Agent 编排 04：上下文隔离，多 Agent 真正的引擎"
date: 2026-06-15 20:10:00
tags: [多Agent, 上下文隔离, context engineering, subagent, LLM]
categories: [技术笔记, 多Agent编排]
---

第 01 篇说瓶颈是上下文，第 03 篇列了各种分工模式。这一篇讲那个让所有模式都成立的核心机制——**上下文隔离（context isolation）**。它才是多 Agent 真正的引擎，比“并行”更本质。

## 子 agent 跑在自己的“干净房间”里

Claude Agent SDK 文档对子 agent 的定义很关键：

> 每个子 agent 跑在**它自己全新的对话里**。中间的工具调用和结果都留在子 agent 内部，**只有它的最终消息会返回给父 agent**。

翻译成画面：

```text
父 agent（主管）
  └─ 派出子 agent，给它一段 prompt
        子 agent 在自己的房间里：
          读 30 个文件、调 15 次工具、翻几万 token……
        房间里的一切脏活都留在房间里
  └─ 父 agent 只收到一张便条：精炼后的结论
```

文档举的例子：一个 research 子 agent 可以翻几十个文件，但**父 agent 拿到的是一段简洁摘要，而不是它读过的每个文件**。

## 几万 token 进，一两千 token 出

Anthropic 在 context engineering 那篇给了具体量级：

> 每个子 agent 可能做大量探索，**用掉几万 token 甚至更多**，但只回传一段浓缩、提炼后的工作摘要（**通常 1000–2000 token**）。

这就是隔离的威力。算一笔账：

```text
不隔离（一个大 agent 全干）：
  10 个维度 × 各几万 token 的探索过程
  全部塞进同一个上下文 -> 几十万 token -> 注意力被淹没、context rot

隔离（每个维度一个子 agent）：
  脏活各留在 10 个独立房间里
  主上下文只收到 10 张便条 -> 1~2 万 token -> 清爽、聚焦
```

主 agent 看到的是 10 条结论，而不是 10 段啰嗦的探索过程。**信息密度被压缩了一个数量级。**

## 关注点分离：路径不再互相污染

隔离还带来 Anthropic 强调的 **separation of concerns（关注点分离）**：

> 每个子 agent 提供关注点分离——不同的工具、提示和探索轨迹——这**减少了路径依赖**。

一个 agent 顺着自己的思路越走越偏时，会把整条对话带歪（错误会累积）。拆成独立子 agent 后，A 走偏不影响 B；主 agent 还能横向比较多条独立轨迹，挑出靠谱的。这也顺带带来**故障隔离**：一个子 agent 崩了或跑飞了，炸的是它那个房间，不会污染全局。

## 并行只是顺带的红利

注意：隔离和并行是两件事，但隔离让并行变得几乎免费。Agent SDK 文档：

> 多个子 agent 可以并发运行，所以独立子任务的总耗时是**最慢那个，而不是所有的加和**。

```text
串行：T = t1 + t2 + ... + t9
并行（隔离让它们互不干扰）：T ≈ max(t1, t2, ..., t9)
```

开头那张截图里，58 个 Find/Verify agent 各自 1~5 分钟，但整条 Find 阶段是并行压缩到几分钟跑完的——正是因为每个 agent 在自己的房间里，互不等待、互不干扰。

## 没有隔离也想省上下文？三个配套招式

不是所有场景都拆得动子 agent。Anthropic 还给了单 agent 内省上下文的三招，和隔离思想一脉相承：

- **Compaction（压缩）**：上下文快满时，把前面的对话总结掉，用摘要重开一个新窗口。
- **Structured note-taking（结构化记笔记）**：把笔记写到上下文窗口**之外**的记忆里，需要时再拉回来。
- **Just-in-time retrieval（即时检索）**：不预加载全部数据，只留轻量的“指针”（文件路径、查询、链接），运行时按需加载。

子 agent 隔离，本质就是把“压缩 + 笔记 + 按需取”这套，升级成了“每件事开一个独立房间”。

## 一句话总结

多 Agent 的引擎不是“人多”，是**上下文隔离**：每个子 agent 在自己干净的房间里烧几万 token 探索，只把一两千 token 的结论递出来。脏活留在房间内，主 agent 的上下文永远清爽、聚焦，还顺带拿到了并行和故障隔离。记住一句话就够了——**让脏活留在子 agent 里，主 agent 只看结论。**

## 参考资料

- [Claude Agent SDK：Subagents in the SDK](https://code.claude.com/docs/en/agent-sdk/subagents)
- [Anthropic：Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)（2025-09-29）
- [Anthropic：Building agents with the Claude Agent SDK](https://claude.com/blog/building-agents-with-the-claude-agent-sdk)（2025-09-29）
