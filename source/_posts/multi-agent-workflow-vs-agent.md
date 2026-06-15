---
title: "多 Agent 编排 02：先分清 Workflow 和 Agent"
date: 2026-06-15 19:50:00
tags: [多Agent, AI Agent, workflow, 编排模式, LLM]
categories: [技术笔记, 多Agent编排]
---

在堆术语之前，得先分清两个最容易混的词：**workflow（工作流）**和 **agent（智能体）**。很多“多 agent 系统”其实是 workflow，反过来也有。Anthropic 在《Building Effective Agents》里给了最干净的定义。

## 一句话区分

> **Workflow**：LLM 和工具通过**预定义的代码路径**被编排起来的系统。
>
> **Agent**：LLM **自主决定自己的流程和工具使用**、自己掌控如何完成任务的系统。

差别就一个字：**路线谁定的**。

```text
Workflow：路线是人写死在代码里的
  输入 -> [步骤A] -> [步骤B] -> [步骤C] -> 输出
        （走哪条、分几步，提前定好）

Agent：路线是模型自己临场决定的
  输入 -> 模型边想边决定：要不要搜？调哪个工具？够了没？
        （步骤数和顺序，运行时才知道）
```

这不是谁高谁低。**可预测的任务用 workflow 更稳、更便宜、更好调试；开放的、步骤无法预知的任务才需要 agent 的自主性。** Anthropic 的总原则是：先找最简单的方案，只在确有必要时才加复杂度。

## 增强型 LLM：所有编排的积木

无论 workflow 还是 agent，基本单元都是一个被“增强”过的 LLM——给它接上：

- **检索（retrieval）**：能去查资料；
- **工具（tools）**：能调函数、读写文件、跑命令；
- **记忆（memory）**：能在多步之间保留信息。

模型自己生成搜索词、选工具、决定留下哪些信息。今天常用 **MCP（Model Context Protocol）**把第三方工具标准化地接进来。多 agent 编排，本质就是把若干个这样的增强型 LLM 按某种结构连起来。

## 五种基础模式（这是后面一切的地基）

Anthropic 总结了五种最常用的模式。先有个总览，第 03 篇再展开成八种。

| 模式 | 怎么运作 | 什么时候用 |
| --- | --- | --- |
| **Prompt chaining（串行链）** | 拆成固定顺序的步骤，每步处理上一步的输出，中间可加程序化“闸门”校验 | 任务能干净拆成固定子步骤，用延迟换准确率 |
| **Routing（路由）** | 先分类输入，再导向对应的专门处理 | 输入有明显类别、各类要分开处理；也用来把简单任务路由到小模型省钱 |
| **Parallelization（并行）** | 多个 LLM 同时干，结果用程序合并 | 见下两个子型 |
| ↳ Sectioning（分段） | 把**互相独立**的子任务拆开并行 | 子任务彼此不依赖，比如护栏审查与主回答并行 |
| ↳ Voting（投票） | 同一任务跑多次，取多样输出 | 要多视角提高置信度，比如多个提示并行查漏洞 |
| **Orchestrator-workers（编排者-工人）** | 一个中心 LLM **临场**拆任务、派给工人、再合成结果 | 复杂、**子任务无法预先确定**的任务 |
| **Evaluator-optimizer（评估-优化循环）** | 一个生成、一个评审，循环精修 | 有明确评估标准、迭代能切实改善质量 |

## 最该记住的一条分界线

初学者最容易混的是 **Parallelization（并行）** 和 **Orchestrator-workers（编排者）**，因为它们看起来都是“一个变多个”。区别在于**子任务是谁、什么时候定的**：

```text
Parallelization：分工是人“预先写死”的
  —— 我就分 9 段，每段干什么提前定好

Orchestrator-workers：分工是编排者“临场决定”的
  —— 主管看了任务才决定派谁、派几个、干什么
```

开头那张 `code-review-max` 截图属于哪种？它把审查固定拆成 9 个维度（逐行/删除行为/跨文件/语言陷阱…）——这部分是**预先定好的并行（sectioning）**；但每条发现派几个 verify agent、要不要再补漏一轮，是**临场决定的**。真实系统往往是**几种模式的组合**，而不是教科书里的单一形态。

## 一句话总结

Workflow 是“路线写死的流水线”，Agent 是“模型自己决定路线”。多 Agent 编排是在这两者之上，用五种基础模式（串行、路由、并行、编排者、评估循环）把多个增强型 LLM 连起来。先把这套词汇和那条“预先定 vs 临场定”的分界线记牢，下一篇的八种模式就只是把它们摊开讲细。

## 参考资料

- [Anthropic：Building Effective Agents](https://www.anthropic.com/research/building-effective-agents)（2024-12-19）
- [Anthropic：How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)（2025-06-13）
- [Model Context Protocol 官方文档](https://modelcontextprotocol.io/)
