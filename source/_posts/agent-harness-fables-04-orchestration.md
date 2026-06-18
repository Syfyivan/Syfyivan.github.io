---
title: "Agent Harness 寓言课 04：集市不是一条流水线"
date: 2026-06-18 11:23:00
description: "用集市筹备解释 Workflow、Agent、Orchestration 和人类检查点的区别。"
tags: [AI Agent, Orchestration, Workflow, Human in the Loop, 寓言课]
categories: [技术笔记, Agent Harness 寓言课]
---

镇上要办集市。

如果每年流程都一样，镇长会贴一张固定清单：

```text
先租棚子
再分摊位
再贴告示
再收摊费
```

这叫流水线。步骤写死，谁来都照着做。

但今年不一样。桥坏了，商队改道，雨季提前，铁匠铺突然要办比赛。镇长只好请一位总管现场拆任务：谁去查桥，谁去问商队，谁去改路线，谁去通知摊主。

这就不是流水线了，这是编排。

## 故事里的机制

Anthropic 对 workflow 和 agent 的区分很有用：

- Workflow：LLM 和工具沿着预定义代码路径走。
- Agent：LLM 动态决定流程和工具使用。

Orchestration 介于两者之间。你可以让代码先定大框架，再让模型在某些节点里动态拆任务；也可以让一个主 Agent 临场决定要派哪些 worker。

关键问题不是“有没有多个 Agent”，而是：**路线是谁在什么时候决定的**。

## 固定路线适合什么

能写成固定步骤的事，优先写 workflow。

比如文章翻译、客服分类、简历筛选、固定格式报告。这些任务用 workflow 更稳、更便宜、更好测。每个节点输入输出都清楚，失败也好定位。

强行上 Agent，反而会引入不必要的成本和随机性。

## 动态编排适合什么

如果你事先不知道要查几份资料、改几个文件、问几个系统，就需要动态编排。

代码审查就是典型例子。你不知道问题会落在安全、性能、并发、兼容性还是测试缺口。主 Agent 可以先浏览 diff，再把不同维度派给不同 worker，最后合成结论。

这时并行不是为了热闹，而是为了让每个 worker 保持干净上下文。

## 人为什么还要在 Loop 里

集市总管可以派人，但桥要不要临时封、预算要不要追加，仍然要镇长点头。

Agent 系统也一样。人类检查点应该放在这些地方：

- 成本明显变大之前。
- 会写入真实系统之前。
- 需要业务判断而不是技术判断时。
- 证据不足但必须选方向时。

好的 human-in-the-loop 不是每一步都打断，而是在真正分叉处让人裁决。

## 今天的练习

把你想自动化的任务写成一句话，然后问：

1. 步骤能否提前确定？
2. 每一步的输入输出能否写成 schema？
3. 失败能否自动判断？

三个都是“能”，先做 workflow。只要有一个核心答案是“不能”，再考虑 Agent 或动态编排。

## 公开资料

- [Building effective agents - Anthropic](https://www.anthropic.com/engineering/building-effective-agents)
- [Handoffs - OpenAI Agents SDK](https://openai.github.io/openai-agents-python/handoffs/)
- [Subagents in the SDK - Claude Code Docs](https://code.claude.com/docs/en/agent-sdk/subagents)
