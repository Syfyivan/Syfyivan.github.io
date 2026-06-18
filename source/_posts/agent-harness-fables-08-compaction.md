---
title: "AI 与 Agent 大寓言课 06.07：三层行囊整理术"
date: 2026-06-18 11:27:00
description: "把 Harness 101：Claude Code 的三种上下文压缩与 Microcompact 的秘密改写成第六讲下的章节文章。"
tags: [技术笔记, AI 与 Agent 大寓言课, Agent Loop 与 Harness, Compaction, Claude Code]
categories: [技术笔记, AI 与 Agent 大寓言课, Agent Loop 与 Harness]
---

旅人穿过沙地，身上带着三只袋子。

第一只袋子专装每天都要掏的水和干粮，空了就顺手扔掉；第二只袋子装路上的见闻，晚上扎营时会抄成一页短札；第三只袋子则放极少用到的旧地图和交接信，只有远路未尽时才会重新打开。

三只袋子都在“整理”，可整理的力度、时机和代价完全不同。有人只想减重，有人想保留沿途故事，还有人想为下一段路留下一个能继续走的开头。

## 概念揭晓

这篇对应的是 [Harness 101：Claude Code 的三种上下文压缩与 Microcompact 的秘密](https://my.feishu.cn/wiki/YSlhwnb5pia6q6kGnU0ckXSZnWe)。

先把边界说清楚：Anthropic 和 Claude Code 的公开文档可以确认，系统会在接近窗口上限时做 compaction，也可以做 prompt caching；但原文里关于 `Microcompact`、`autocompact`、`fullcompact`、`cache_edits`、Layer 1 / Layer 2 的细节，主要来自原文作者对代码与运行行为的观察和工程模式推断，不应写成官方公开规范。

## 本章目录

- 三层级联不是三个并列按钮
- 为什么 Microcompact 跑在最热路径
- 白名单只动可回收的内容
- cache_edits 为什么能保住缓存前缀
- Layer 1 热路径与 Layer 2 冷启动
- 阈值、预算与重启的关系
- 原文对应
- 公开资料

## 三层级联不是三个并列按钮

原文最重要的结构判断，是把 `Microcompact`、`autocompact` 和 `fullcompact` 看成一条按成本排序的级联，而不是三个可随意切换的选项。

| 模式 | 原文里的角色 | 成本特征 |
| --- | --- | --- |
| `Microcompact` | 每次请求前先做本地整理 | 最便宜，几乎不花模型推理成本 |
| `autocompact` | 接近阈值时做自动摘要 | 需要 LLM，但仍比完全重构便宜 |
| `fullcompact` | 前两层都不够时的兜底 | 最贵，往往需要完整摘要调用 |

这条级联背后的哲学很简单：能晚就晚，能便宜就别贵，能本地解决就别上升到更重的层。

## 为什么 Microcompact 跑在最热路径

原文作者的观察是，`Microcompact` 不是等到窗口快满才动手，而是每次请求前都扫一遍历史。

这件事之所以成立，靠的是两条约束。第一条是它不调用模型，只按规则筛选，所以可以挂在最热路径上反复跑。第二条是它只改会话里已经可回收的痕迹，不碰用户输入和正常回答的语义骨架。

这里有一个很关键的公开边界也能对上：官方文档已经确认，Claude Code 会在接近限制时整理历史，且可以通过 `/compact` 和 compaction instructions 控制保留内容。原文的 `Microcompact` 更像是这条公开能力在内部实现上的更细颗粒版本。后者属于作者观察，不是官方对外说明。

## 白名单只动可回收的内容

原文把可整理的 tool result 限得很窄，只保留一组白名单工具。这不是偷懒，而是为了保证可回收的内容尽量幂等、尽量可重取。

| 工具类型 | 原文里的处理倾向 | 说明 |
| --- | --- | --- |
| `Bash` / `WebFetch` | 优先外置或后续改写 | 输出通常大，而且一次性价值高 |
| `Read` / `Grep` / `Glob` | 可在后续改写成引用 | 数据源本身可再取 |
| `FileEdit` / `FileWrite` | 只保留必要痕迹 | 结果往往只是“写好了”或“改好了” |
| 自定义工具 / MCP 工具 | 默认不动 | 作者认为难以保证安全回收 |

这组白名单说明一件事：整理不是见大就压，而是只动“未来还能更便宜拿回来的那份”。

## cache_edits 为什么能保住缓存前缀

这部分是原文里最偏工程实现的地方，也最需要标清楚来源：`cache_edits` 不是 Anthropic 官方公开文档里通用可见的抽象，而是原文作者根据 Claude Code 的行为和代码细节做出的工程拆解。

原文的核心判断是：如果直接改 `messages`，缓存前缀就会被打碎；如果只在服务端 cache 层把指定位置挖空，前缀还能保住。于是整理动作既发生了，缓存命中也没丢。

| 做法 | 结果 |
| --- | --- |
| 直接改历史消息 | 前缀变了，缓存命中容易失效 |
| 通过 `cache_edits` 做服务端挖空 | 本地历史不动，前缀可以继续命中 |

官方公开文档能确认的，是 prompt caching 的存在，以及 cache read 的价格折扣和 5 分钟写缓存窗口；原文作者在此基础上进一步推断了 `cache_edits` 这类“删掉旧痕迹但不打碎前缀”的工程做法。

## Layer 1 热路径与 Layer 2 冷启动

原文又把 `Microcompact` 拆成两条执行路径。

Layer 1 是热路径，发生在每次请求前，配合 `cache_edits` 做服务端整理。这条路径面向高频、低成本、尽量不破缓存前缀的场景。

Layer 2 是冷启动路径，发生在长时间离线之后再回来。原文认为，当空档足够长，服务端缓存本来就大概率失效，此时不必再执着于只改服务端视图，直接改写本地历史反而更简单。这里还会顺带清掉一些历史里的思维痕迹，原文里引用了 `clear_thinking_20251015` 这样的 context editing 机制来支撑这一点。

这条分法的本质，是把“热的时候保缓存”和“冷的时候重整历史”分开处理。

## 阈值、预算与重启的关系

原文不把 compaction 讲成一个单点开关，而是讲成预算管理。

官方文档说明，Claude 的 compaction 是在接近窗口上限时做摘要；prompt caching 则给重复前缀提供了明显折扣。原文作者据此给出自己的工程判断：整理太早会浪费缓存红利，整理太晚会挤掉后续输出与压缩调用本身的空间。

所以更稳妥的策略通常是三层：

1. 先做轻量整理，清掉明显没用的痕迹。
2. 再做局部摘要，把旧内容压成可继续工作的形式。
3. 最后才考虑重启式交接，让下一段路从更干净的状态开始。

这也解释了为什么原文并不迷信“始终保留原文”。在长任务里，真正重要的是让后续步骤继续往前走。

## 原文对应

这篇章节覆盖了源文 `/tmp/harness-wiki/07.md` 的这些大段落：

- `# 前言`
- `# 三层级联`
- `# 反常识：Microcompact 跑在每一次 API 调用之前`
- `# cache_edits：服务器端的隐形橡皮擦`
- `# 主线限定与冷启动：Layer 1 vs Layer 2`
- `# 结语`

## 公开资料

- [Context windows - Claude API Docs](https://docs.anthropic.com/en/docs/build-with-claude/context-windows)
- [Prompt caching - Claude API Docs](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching)
- [How Claude Code uses prompt caching - Claude Code Docs](https://code.claude.com/docs/en/prompt-caching)
