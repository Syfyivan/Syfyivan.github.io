---
title: "AI 与 Agent 大寓言课 06：会绕圈的工坊"
date: 2026-06-18 14:52:00
description: "用工坊巡工的寓言讲清 Agent Loop、ReAct、运行框架、停止条件、状态、预算和人类监督。"
tags: [AI Agent, Agent Loop, ReAct, Agent Harness, Runtime, 寓言课]
categories: [技术笔记, AI 与 Agent 大寓言课]
---

## 三段故事

木匠铺收到一张修车单。学徒先绕着车看一圈：轮子歪了，车轴松了，少了两颗钉。他拿起小本子写下先修哪里，再去工具架拿锤子和钉子。敲完以后，他不急着交差，而是推着车走一段，看看还会不会晃。

车还是有点偏。学徒又停下来，重新看车轮，发现不是钉子的问题，而是垫片太薄。他去仓库换垫片，再试一次。这样看一回、做一步、再检查一回，直到车能平稳走直，才把修车单盖上完成章。

后来铺子生意多了，师傅怕学徒乱跑，就定了规矩：每件活最多试几轮；贵重工具要师傅点头；每一步都要记账；修不好要早说，不许硬装会修。工坊不是让学徒永远绕圈，而是让他在可控范围里把事情做完。

## 揭晓概念

这个故事讲的是：**Agent Loop 与运行框架**。

学徒看车，是观察当前状态。写下先修哪里，是计划。拿工具做一步，是行动。推车检查，是读取结果。反复几轮直到盖章，是 Agent Loop。师傅定的轮数、工具权限、记账和求助规则，就是 Agent 的运行框架，也常被叫作 harness 或 runtime。

## 故事对照表

| 故事里的东西 | 对应概念 |
| --- | --- |
| 修车单 | 用户目标或任务 |
| 看一圈车况 | observe / state |
| 写下先修哪里 | plan |
| 拿工具修一步 | act / tool use |
| 推车检查 | observation / feedback |
| 盖完成章 | stopping condition |
| 最多试几轮 | budget / loop limit |
| 贵重工具要点头 | human approval |
| 每一步记账 | trace / audit log |

## 准确定义

Agent Loop 不是一个固定标准，而是一类工程结构：系统围绕目标反复执行“观察、计划、行动、读取结果、判断是否继续”。一个只回答一次的聊天模型通常不是 Agent；能在外部环境中连续使用工具、根据结果改计划、并在停止条件下结束的系统，才更接近 Agent。

运行框架负责把循环管住：保存状态、执行工具、限制权限、控制成本、处理失败、记录 trace、决定什么时候让人类确认。没有这些边界，Agent 很容易从“自动帮忙”变成“自动闯祸”。

## 历史过程

早期 AI 系统也有规划和行动，只是多数运行在规则明确的封闭环境里。大语言模型出现后，模型能用自然语言解释目标、拆任务、选择工具，于是“语言模型 + 工具 + 循环”成了新的工程路线。

2022 年的 ReAct 论文把 reasoning 和 acting 交错起来：模型一边形成推理轨迹，一边采取动作并读取外部反馈。2024 年后，Agent 工程开始从“写一个循环”走向“给循环加护栏”：Anthropic 区分了 workflow 和 agent，提醒开发者优先选择简单、可组合、可测试的结构；OpenAI Agents SDK 这类工具也把 turns、tools、handoffs、guardrails、sessions 和 tracing 做成工程抽象。

到 2025-2026 年，前沿实践更强调 harness 或 scaffold：它不是模型本身，而是让模型能作为 Agent 运作的系统层，负责输入处理、工具编排、状态、审批和观测。换句话说，今天评价一个 Agent，不能只问“模型聪不聪明”，还要问“循环怎么跑、工具怎么管、失败怎么停”。

这段历史说明：Agent 不是突然出现的新魔法，而是搜索、规划、工具调用、软件运行时和评测系统合在一起后的新形态。

## 常见误解

第一，Agent Loop 不是越长越好。循环越长，成本、延迟和错误累积越明显，必须有预算和停止条件。

第二，ReAct 不是让模型把所有想法都暴露给用户。它的核心是“推理和行动交错”，实际产品里还要区分内部轨迹、审计日志和用户可见解释。

第三，运行框架不是装饰层。真正决定 Agent 是否可靠的，往往是工具权限、状态管理、失败恢复和人类确认。

## 继续往下怎么学

这一篇只是第六讲的入口。真正展开 Harness 时，不应该把所有知识塞进一篇文章里，因为 Agent Loop 只是第一层，后面还牵涉工具契约、上下文搬运、记忆、虚拟文件系统、提示词装配、运行时文档和长程自治。

所以第六讲下面另开了一个章节目录：**Agent Loop 与 Harness 章节目录**。它把 Feishu《Harness 101》根节点下的 12 篇文章全部纳入这一讲，按 `06.01` 到 `06.12` 展开；另外保留一个 `06.S1` 补充小节专门讲 ReAct 与 tool calling。

阅读顺序建议是：

1. 先读本篇，建立“循环被运行框架管住”的基本图。
2. 再读 `06.01`，从 ReAct Loop 进入 Harness 的完整分层。
3. 然后按章节目录继续读工具、编排、记忆、上下文、文件系统、提示词和 Install.md。

[进入第六讲章节目录](/courses/agent-harness-fables/)

## 小练习

给“帮我整理一篇长文并发布草稿”设计一个最小循环：

1. 每一轮要观察什么？
2. 能调用哪些工具？
3. 哪些动作必须人工确认？
4. 最多循环几轮？
5. 什么情况要停止并报告失败？

## 公开资料

- [ReAct: Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629)
- [Building Effective Agents - Anthropic](https://www.anthropic.com/engineering/building-effective-agents)
- [Demystifying Evals for AI Agents - Anthropic](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
- [Agents SDK - OpenAI API](https://developers.openai.com/api/docs/guides/agents)
- [Tracing - OpenAI Agents SDK](https://openai.github.io/openai-agents-python/tracing/)
