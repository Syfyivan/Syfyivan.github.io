---
title: "AI 与 Agent 大寓言课 11：分工的城邦"
date: 2026-06-18 15:02:00
description: "用城邦分工的寓言讲清多 Agent、编排、上下文隔离、handoff、并行验证和成本边界。"
tags: [AI Agent, Multi-Agent, Orchestration, Handoff, AI Engineering, 寓言课]
categories: [技术笔记, AI 与 Agent 大寓言课]
---

## 三段故事

一座城要修桥。最早只有一个总匠人，他量河宽、画图、买木料、带工人、查账，还要和村民解释为什么要封路。总匠人很能干，但事情一多，他就忘了谁负责哪段木梁，也听不清每个人的反馈。

城主后来把活分开：测量师只量河，木匠只做梁，账房只算钱，巡查员专门挑错。每个人都有自己的小册子和工具，做完就把结果交给总匠人。总匠人不再亲自做所有事，而是决定谁该接下一棒。

分工以后，桥修得快了，但新麻烦也来了。测量师和木匠的数字对不上，账房不知道设计改过，巡查员把旧图当新图。城主只好规定交接格式、版本号、争议处理和最终验收。人多不是自动更聪明，分工要有秩序。

## 揭晓概念

这个故事讲的是：**多 Agent 与 AI 工程编排**。

总匠人是 orchestrator。测量师、木匠、账房、巡查员是不同 specialist agents。小册子是各自上下文。交结果和接下一棒是 handoff。巡查员挑错是 verifier 或 critic。版本号和验收规则，是多 Agent 系统的协议和治理。

## 故事对照表

| 故事里的东西 | 对应概念 |
| --- | --- |
| 总匠人 | orchestrator agent |
| 测量师、木匠、账房 | specialist agents |
| 各自小册子 | context isolation |
| 接下一棒 | handoff |
| 巡查员挑错 | verifier / critic |
| 数字对不上 | coordination failure |
| 版本号和交接格式 | protocol / shared state |

## 准确定义

多 Agent 系统是多个具备模型、指令、工具或角色边界的 Agent 协作完成任务。它可以用来并行搜索、分工实现、交叉验证、模拟不同视角，也可以用来把复杂流程拆成更小的可控单元。

多 Agent 的关键不是“数量”，而是“边界”：每个 Agent 负责什么、能看什么、能改什么、如何交接、谁做最终决策、失败时怎么回滚。没有这些协议，多 Agent 只会把混乱并行化。

## 历史过程

分布式协作并不新。软件工程里早就有模块边界、代码评审、CI、owner 和交接文档。大模型时代的新变化是：这些角色可以部分由 Agent 执行，例如研究、实现、验证、审查和修复。

Anthropic 的有效 Agent 文章把 orchestrator-workers 和 parallelization 作为常见工作流；Anthropic 的多 Agent 研究系统文章把多 Agent 描述为多个能在循环中使用工具的 Agent 协作，并强调架构、工具设计和提示工程经验。OpenAI Agents SDK 也把 handoff、guardrail、session 和 tracing 做成工程概念。到 2026 年，多 Agent 更像一套工程组织方法，而不是“多开几个聊天窗口”。

这条路线也有明确代价。多 Agent 更适合开放式探索、并行搜索、难以预定义步骤的任务；如果任务很小、验收很清楚，单 Agent 或固定 workflow 反而更稳。工程上真正要解决的是上下文隔离、共享状态、交接格式、版本一致性、成本和最终责任。

## 常见误解

第一，多 Agent 不一定比单 Agent 好。任务太小、边界不清或资料不足时，协调成本会超过收益。

第二，投票不能保证真相。如果多个 Agent 都被同一份错误资料误导，投票只会更自信地错。

第三，上下文隔离不是越强越好。隔离能减少干扰，但必要的共享状态、版本和决策记录必须存在。

## 小练习

把“写一篇技术文章”拆成多 Agent 流程：

1. 哪个 Agent 查资料？
2. 哪个 Agent 写草稿？
3. 哪个 Agent 只做事实核验？
4. 哪些文件或段落不能同时修改？
5. 最终谁负责合并和发布？

## 公开资料

- [Building Effective Agents - Anthropic](https://www.anthropic.com/engineering/building-effective-agents)
- [How we built our multi-agent research system - Anthropic](https://www.anthropic.com/engineering/multi-agent-research-system)
- [Agents SDK - OpenAI API](https://developers.openai.com/api/docs/guides/agents)
- [Tracing - OpenAI Agents SDK](https://openai.github.io/openai-agents-python/tracing/)
