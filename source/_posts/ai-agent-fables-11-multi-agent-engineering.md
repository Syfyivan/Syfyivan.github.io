---
title: "AI 与 Agent 大寓言课 11：会分工的城邦"
date: 2026-06-18 15:02:00
description: "用阿筹和老把头带一支工队干大活的寓言讲清多 Agent、编排、上下文隔离、handoff、并行验证和成本边界。"
tags: [AI Agent, Multi-Agent, Orchestration, Handoff, AI Engineering, 寓言课]
categories: [技术笔记, AI 与 Agent 大寓言课]
---

## 三段故事

一桩跨城的大工程开工。最早，学徒阿筹什么都想自己干，他探路、采料、施工、记账、验收，还要和村民解释为什么要封路。阿筹很能扛，但事情一多，他就忘了哪段木梁干到哪了，也理不清每条反馈。

老把头后来把工队分了组：探路的只管探路，采料的只管采料，施工的各守一摊，账房只算钱，验收的专门挑错。每个人都有自己的料单图纸和工具，干完就把结果交给老把头。老把头不再亲自干所有事，而是决定谁该接下一棒。

分工以后，活干得快了，但新麻烦也来了。探路和施工的数字对不上，账房不知道图纸改过，验收的把旧图当新图。老把头只好规定交接格式、版本号、争议处理和最终验收。人多不是自动更聪明，分工要有秩序。

## 揭晓概念

这个故事讲的是：**多 Agent 与 AI 工程编排**。

老把头是 orchestrator。探路、采料、施工、账房是不同 specialist agents。各自的料单图纸是各自上下文。交结果和接下一棒是 handoff。验收的挑错是 verifier 或 critic。版本号和验收规则，是多 Agent 系统的协议和治理。

## 故事对照表

| 故事里的东西 | 对应概念 |
| --- | --- |
| 老把头 | orchestrator agent |
| 探路、采料、施工、账房 | specialist agents |
| 各自料单图纸 | context isolation |
| 接下一棒 | handoff |
| 验收的挑错 | verifier / critic |
| 数字对不上 | coordination failure |
| 版本号和交接格式 | protocol / shared state |

## 准确定义

挑三个最吃劲的概念讲透，其余的一句带过。

**多 Agent 系统**。一句话：多个具备模型、指令、工具或角色边界的 Agent 协作完成一个任务，可用来并行搜索、分工实现、交叉验证、模拟不同视角。直觉上，它像一支工队而不是一个全能匠人——每人守一摊、能同时开工。一个具体例子：Anthropic 的多 Agent 研究系统里，一个 lead agent 接到“调研某主题”，自己不下场翻资料，而是同时派出三五个 subagent，每个 subagent 占一个独立、干净的上下文窗口去查不同来源、各自只回一段精炼发现，lead 再合成成文——好处之一正是把“可用上下文”近似翻了好几倍。边界在于贵：同一份调研，多 Agent 烧的 token 可达单 Agent 聊天的约十几倍，任务一旦小而清楚，单 Agent 反而更稳。

**编排与边界（orchestration）**。一句话：把分工的 Agent 组织协调起来——谁拆活、谁干、谁汇总、怎么交接、谁最终拍板。它的关键不是“几个 Agent”，而是“边界”：每个 Agent 能看什么、能改什么、出错谁负责。一个具体例子：orchestrator-workers 模式里，一个 orchestrator 收到“给这个改动补测试”，把它拆成“读懂 diff、列测试点、逐个写用例”派给 worker，自己只派活和拼装、不亲自写代码；与之相对的 parallelization 则是几个本就独立的子任务直接并发、中途无需协调。延伸一句：orchestrator 自己会变成瓶颈和单点——它上下文最重、它判断错了全队跟着错（11.2 细讲）。

**handoff（交接）**。一句话：任务在专精 Agent 之间按规则一棒接一棒地传，谁擅长这段就交给谁。直觉上像接力，而不是一个人跑全程。一个具体例子：OpenAI Agents SDK 把 handoff 实现成一种特殊的工具调用——一个 triage agent 判断用户问的是退款还是技术故障，就把整段对话“转交”给 refund agent 或 tech agent，接手方负责后续轮次，trace 里会留下这次转交的记录。边界在于交接点必须定死格式与版本，否则就是故事里“探路和施工数字对不上”。

其余概念一句带过：**specialist agents** 是各自为一类子任务优化的专家；**verifier / critic** 是专挑错的复核方（11.4）；**protocol / shared state** 是版本号、交接格式、争议裁决这些让分工不乱套的规矩（11.6）。多 Agent 的成败，几乎都落在这些边界和协议上，而不是 Agent 的数量。

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
