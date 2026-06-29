---
title: "AI 与 Agent 大寓言课 11.2：把头有几套调度章法"
date: 2026-06-21 13:30:00
description: "第十一讲第 2 章：老把头教阿筹组织一支队的几套章法，借此理解多 Agent 编排模式——leader-worker、debate、critic、map-reduce 和 handoff。"
tags: [AI, 多Agent, 编排, 工作流, 寓言课]
categories: [技术笔记, AI 与 Agent 大寓言课, 会分工的城邦]
---

> 承上：上一章阿筹认了要分工，却不知道分了组之后谁听谁的、活儿怎么串。这一章，老把头把组织一支队的几套章法摊开讲。

老把头说，带队不止一种带法，看活儿挑章法。

“**一是我派活、你们干、我汇总**——我把大活拆开，派给各组，各组干完交回来，我拼成整件。最常用。**二是让两个人对着辩**——拿不准的事，让俩人各执一词争一争，越辩越清。**三是一个干、一个专挑错**——干活的旁边配个较真的，专盯他的毛病，逼他改好。**四是各管一段、最后合拢**——一件大活切成互不相干的小块，各干各的，末了拼到一起。**五是一棒接一棒**——这一段你干完，按规矩交给下一段的人接着干。”

阿筹听明白了：“原来不是一套章法包打天下，是看活儿选章法。”

> 所属路径：AI 与 Agent 大寓言课 / 第 11 讲：会分工的城邦 / 11.2 编排模式

## 概念揭晓

老把头这五套，是多 Agent **编排（orchestration）**的几种经典模式。

“我派活、汇总”，是 **leader-worker / supervisor（主管—工人）**：一个协调者把任务拆给若干工人 Agent，再汇总结果。结构清晰、最常用。

“两个人对着辩”，是 **debate（辩论）**：让多个 Agent 就一个问题各持立场互相质疑，逼出更可靠的结论。

“一个干、一个挑错”，是 **critic / reflection（评审 / 反思）**：一个 Agent 产出，另一个专门批评、找问题，循环改进——这正是 11.4 对抗式验证的基础。

“各管一段、最后合拢”，是 **map-reduce（分而治之）**：把任务并行切给多个 Agent（map），再把结果合并（reduce）。适合可拆成独立小块的大任务。

“一棒接一棒”，是 **handoff（交接）**：任务在专精 Agent 之间按规则传递，谁擅长这一段就交给谁（第八讲 trace 里记录的就是它）。

## 本章目录

- 五种模式各适合什么。
- 没有“最好的模式”，只有“最配任务的”。
- 模式可以组合嵌套。
- 协调者本身也会成为瓶颈。
- 小练习：给一个任务挑编排。

## 五种模式各适合什么

| 模式 | 适合的活 | 一句话 |
| --- | --- | --- |
| leader-worker | 能拆成子任务、需汇总 | 一个头脑分派 + 收拢 |
| debate | 有争议、要更稳的判断 | 多方争出更可靠结论 |
| critic / 反思 | 质量要求高、要反复打磨 | 产出 + 专人挑错改进 |
| map-reduce | 可并行的大批量 | 切开并行 + 合并 |
| handoff | 流程化、分阶段专精 | 一棒接一棒按专长传 |

现实里 leader-worker 和 map-reduce 最常用；critic 和 debate 多用在“要提高可靠性”的场合（第八、十一讲的对抗验证）。

落到具体的活上更好体会：**map-reduce** 像“把 100 篇文档分给 100 个 worker 各写一段摘要（map），再由一个 worker 把摘要合成总览（reduce）”，每段互不依赖、能并发；**handoff** 像客服系统里一个 triage agent 先分诊，是退款就转交退款 agent、是故障就转交技术 agent，谁接手谁负责后续；**critic 循环** 像“一个 agent 生成代码，另一个 agent 专门审、回一句‘第 14 行边界没处理’，生成方据此改一版”，一来一回直到过关。为什么要按任务结构选：map-reduce 之所以能并发，是因为子任务**本就独立**；handoff 之所以靠谱，是因为每段都交给**最专精**的那个——模式不是越花哨越好，是要对上活儿的形状。

## 没有最好的模式，只有最配的

和第七讲“选盖法”、第五讲“工具不是越多越好”一脉相承：**编排模式没有银弹，要按任务结构选。**

- 任务能干净切块 → map-reduce。
- 要稳的判断 → debate 或多评审投票。
- 要高质量产出 → critic 循环。
- 分阶段、各阶段专精 → handoff。

选错模式，会平白增加协调成本、还不一定提质量。先问“这个任务的结构长什么样”，再选编排，而不是反过来。

## 模式可以组合嵌套

真实系统往往是几种模式的组合：

- 一个 leader 把活 map 给多个 worker（并行），每个 worker 内部又带一个 critic（自我改进），最后 leader reduce 汇总并让一个 verifier 复核。

把它们当积木，按任务搭。第六讲讲 Harness 时说的“编排与 Workflow”，落到多 Agent 上，就是这些模式的组合。

## 协调者也会成为瓶颈

leader-worker 很好用，但要警惕：那个协调者（leader）本身可能成为瓶颈和单点——

- 它要理解全局、拆解、汇总，上下文容易变重。
- 它判断错了，整队跟着错。
- 所有交接都过它，它一堵，全队停。

所以协调者的上下文也要精简（11.3 隔离）、它的决策也要可被验证（11.4）、关键节点也要可观测（第八讲）。分工不是把所有压力堆到一个“超级协调者”身上。

## 常见误区

第一，不管什么任务都用同一套编排（通常是 leader-worker）硬套。

第二，为了“显得复杂”叠很多层 debate/critic，徒增成本不提质量。

第三，忽视协调者的负担，让它又当裁判又当账房又当传令兵。

## 小练习

给下面任务各挑一种主编排模式：

1. “把 100 篇文档分别摘要，再合成一份总览。”
2. “对一个有争议的技术方案，给出更可靠的取舍建议。”
3. “生成一段代码，并尽量保证它质量高、少 bug。”

## 下一章

阿筹学会了选章法，干起来却发现新乱子:各组的料单、图纸混着传，传到后来谁都不知道该看哪份了。老把头说:“分了工，就得分清各人该知道什么、不该知道什么。”下一章 [11.3 各人只揣自己那摊](/2026/06/21/ai-agent-fables-11-ch3-context-isolation/)，讲上下文隔离。

## 公开资料

- [Building effective agents - Anthropic](https://www.anthropic.com/research/building-effective-agents)
- [How we built our multi-agent research system - Anthropic](https://www.anthropic.com/engineering/multi-agent-research-system)
- [Orchestrating agents (handoffs) - OpenAI Agents SDK](https://openai.github.io/openai-agents-python/handoffs/)
- [A practical guide to building agents (PDF) - OpenAI](https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf)
