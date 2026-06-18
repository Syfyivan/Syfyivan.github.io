---
title: "Agent Harness 寓言课 03：马不是马车"
date: 2026-06-18 11:22:00
description: "用马、马具、车夫和驿站解释为什么 Agent 不只是模型，Harness 才是模型之外的全部。"
tags: [AI Agent, Agent Harness, Claude Code, Codex, 寓言课]
categories: [技术笔记, Agent Harness 寓言课]
---

王国里有一匹名马，跑得快，记路也准。商人买下它后，第二天就抱怨：“为什么它不能把货送到北城？”

老车夫问：“车呢？缰绳呢？货箱呢？路引呢？驿站呢？过桥要交的凭证呢？”

商人说：“我买的是名马。”

老车夫说：“那你得到的是速度，不是运输系统。”

## 故事里的机制

模型像马。它有推理、语言、代码、视觉等能力。

Harness 像围绕马搭起来的运输系统：

- 缰绳：系统提示词和行为边界。
- 车厢：上下文窗口和文件工作区。
- 工具箱：搜索、文件读写、命令执行、浏览器、MCP。
- 驿站：会话、记忆、检查点、恢复机制。
- 路引：权限、审批、沙箱、密钥边界。
- 账本：日志、trace、eval、失败样本。

所以 Agent 更像“马 + 马具 + 车 + 路线 + 驿站”。只讨论马有多聪明，会漏掉大半工程问题。

## 为什么模型越来越像，产品却差很多

今天很多 coding agent 底层模型能力都很强，但实际体验差距仍然明显。原因通常不在“马腿”，而在 Harness。

有的系统工具契约清楚，模型每一步知道该查什么。有的系统上下文塞满噪音，模型很快忘事。有的系统能恢复长任务，有的系统一断线就重来。有的系统把审批、沙箱和密钥边界做得干净，有的系统把风险交给用户手动盯。

OpenAI 在 Agents SDK 的新说明里直接把“harness”和“sandbox compute”拆开讲：Harness 管模型循环、工具路由、审批、tracing、恢复和运行状态；Sandbox 才是跑命令、写文件、挂载数据的执行层。这是很重要的产业信号：Agent 工程正在从“调模型”上移到“设计外壳”。

## 最容易误解的一点

Harness 不是一个大框架名字。它是一组边界和机制。

你可以用 LangGraph 写，可以用 Agents SDK 写，可以在 Claude Code 里配 hooks 和 skills，也可以自己写一个很小的 loop。只要你在处理工具、上下文、权限、记忆、观察和恢复，你就在做 Harness Engineering。

## 今天的练习

看一个 Agent 产品时，把它拆成六格：

```text
模型
工具
上下文
权限
记忆
观测
```

哪一格最弱，用户体验通常就卡在哪里。

## 公开资料

- [The next evolution of the Agents SDK - OpenAI](https://openai.com/index/the-next-evolution-of-the-agents-sdk/)
- [Sandbox Agents - OpenAI API](https://developers.openai.com/api/docs/guides/agents/sandboxes)
- [Hooks reference - Claude Code Docs](https://code.claude.com/docs/en/hooks)
