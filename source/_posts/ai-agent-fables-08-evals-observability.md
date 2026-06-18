---
title: "AI 与 Agent 大寓言课 08：裁判的旧赛本"
date: 2026-06-18 14:56:00
description: "用裁判、赛本和账册的寓言讲清 eval、trace、回归集、人工评审、成本和延迟观测。"
tags: [AI Evaluation, Evals, Observability, Regression, Trace, 寓言课]
categories: [技术笔记, AI 与 Agent 大寓言课]
---

## 三段故事

马戏团排了一个新节目。第一次彩排很漂亮，观众都鼓掌，团长差点当场宣布可以巡演。老裁判拦住他说：“一场漂亮不算会演。明天换个场地，后天换个灯光，再让新鼓手上一次，看它还稳不稳。”

老裁判拿出一本旧赛本。里面记着过去摔过跤的动作、容易听错的口令、最难接住的球，还有每场要扣分的细则。演员每改一次节目，都要重新跑这些旧题。新节目如果让老错误回来，就不能过关。

后来团里又添了账房先生。他不评价掌声，只记录每次彩排花了多久、用了多少灯油、谁在哪一步停顿、哪次返工最多。裁判看质量，账房看过程。两本账合起来，团长才知道节目能不能长期巡演。

## 揭晓概念

这个故事讲的是：**评测、观测与回归**。

彩排掌声是一次演示。旧赛本是 eval dataset 和 regression suite。扣分细则是评分标准。账房记录每一步，是 trace 和 observability。灯油和时间，是成本与延迟。AI 应用不能只看一次好看的输出，而要看它在一组代表性任务上是否稳定。

## 故事对照表

| 故事里的东西 | 对应概念 |
| --- | --- |
| 一场漂亮彩排 | demo |
| 旧赛本 | eval set / regression set |
| 扣分细则 | rubric / metric |
| 换场地换灯光 | distribution shift |
| 老错误回来 | regression |
| 账房记录过程 | trace / observability |
| 灯油和时间 | cost / latency |

## 准确定义

AI eval 是为了判断系统在目标任务上是否达到要求。它可以是自动评分、人工评审、成对比较、规则检查、模型当裁判，也可以是多种方式组合。好的 eval 应该贴近真实任务，而不是只追逐公开榜单分数。

Observability 是看见系统内部运行过程的能力。对 Agent 来说，trace 尤其重要，因为一次结果可能包含多轮模型调用、工具调用、检索、handoff、guardrail 和重试。没有 trace，很难知道错在提示词、资料、工具、模型还是权限。

## 历史过程

传统机器学习长期依赖训练集、验证集、测试集和公开 benchmark。大模型出现后，通用 benchmark 仍然有价值，但它不能替代业务任务评测。一个模型在公开题上高分，不代表它能正确处理你的文档、你的权限、你的用户语气和你的失败场景。

2023 年以后，越来越多团队把 eval 当成 AI 产品的持续回归测试：改 prompt、换模型、改 RAG、加工具，都要重跑样本集。OpenAI 的评测最佳实践强调让评测聚焦具体任务，比如分类、成对比较或按明确标准打分。OpenAI 的 agent eval 文档把 traces、graders、datasets 和 eval runs 放在同一条质量闭环里；Anthropic 也强调，评测 Agent 时不能只测模型，还要把 harness 和模型一起看，因为最终行为是两者共同作用的结果。

这也是为什么稳定评测环境很重要。共享状态、缓存、网络抖动、权限差异都会污染回归结果。OpenTelemetry 的 GenAI 语义约定说明业界正在尝试标准化 AI 应用观测，但这类约定仍在演进，写系统时不能把“有 trace”误解成“已经会治理”。

## 常见误解

第一，公开榜单不是你的验收标准。你的系统需要自己的任务集、失败集和边界样本。

第二，模型当裁判不是绝对真理。它适合辅助比较和打分，但关键场景仍要抽样人工复核。

第三，只记录最终答案不够。Agent 出错时，必须看到它查了什么、调了什么工具、在哪一步偏了。

## 小练习

给“自动整理会议纪要”设计 8 条 eval 样本：

1. 哪些是正常会议？
2. 哪些是噪声、打断或多人混说？
3. 哪些必须人工判分？
4. 哪些字段可以自动检查？
5. 换模型前后要比较哪些成本和延迟？

## 公开资料

- [Evaluation Best Practices - OpenAI API](https://developers.openai.com/api/docs/guides/evaluation-best-practices)
- [Evaluate Agent Workflows - OpenAI API](https://developers.openai.com/api/docs/guides/agent-evals)
- [Demystifying Evals for AI Agents - Anthropic](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
- [Tracing - OpenAI Agents SDK](https://openai.github.io/openai-agents-python/tracing/)
- [OpenTelemetry Semantic Conventions](https://github.com/open-telemetry/semantic-conventions)
