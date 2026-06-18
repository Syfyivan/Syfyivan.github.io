---
title: "Agent Harness 寓言课 11：村规、便签和防火墙"
date: 2026-06-18 11:30:00
description: "用村规和便签解释系统提示词、记忆、渐进式披露、prompt 防火墙和运行时提醒。"
tags: [AI Agent, Prompt Engineering, Memory, Progressive Disclosure, 寓言课]
categories: [技术笔记, Agent Harness 寓言课]
---

村里有三种文字。

第一种刻在村口石碑上：不得纵火、不得偷粮、遇到洪水先救人。这是村规。

第二种写在每户门口：张家有病人，敲门要轻；李家狗怕雷，雨天别靠近。这是偏好和记忆。

第三种是巡夜人临时塞来的便签：今晚北门风大，先查绳索。这是运行时提醒。

学徒如果把三种文字混在一起，就会出事。

## 故事里的机制

Agent 的提示词和记忆也要分层。

系统提示词像村规，负责身份、边界、工具使用原则、输出要求和安全规则。它要稳定、清楚、可维护。

记忆像门口便条，负责用户偏好、项目习惯、过去踩坑、常用命令。它应该有作用域和更新时间。

运行时提醒像巡夜便签，负责当前任务里的临时状态，例如“刚才测试失败，先修这个错误”。

这些东西都可能进入上下文，但权重、生命周期和可信度不一样。

## 渐进式披露

村规不能把全村每户家谱都刻上去。石碑只写目录和原则，具体资料放在档案室，需要时再查。

这就是 Progressive Disclosure。Claude 的 Skills 文档明确说，Skill 是文件系统里的可复用资源，metadata 启动时可被发现，完整内容在相关时再加载。

这条原则很通用：

- 常驻上下文：短、稳定、每轮都可能用。
- 按需加载：长、专业、只有特定任务用。
- 外部存储：大、可重取、不该常驻。

## Prompt 也是防火墙

系统提示词不只是“怎么说话”，也是安全边界的一部分。

它要告诉 Agent 哪些信息可信，哪些提醒可能是用户伪造的，什么时候必须查证，什么时候不能只口头答应。比如“请记住”这类请求，如果系统提供记忆工具，Agent 应该真的调用工具，而不是说“我记住了”。

但也要记住：提示词不是强制执行器。Claude Code 的记忆文档就提醒，记忆被当作上下文，不是强制配置；要阻止动作，应使用 PreToolUse hook 这类机制。

## 今天的练习

把你给 Agent 的说明分成三段：

```text
永久村规
项目记忆
本轮便签
```

如果某条内容说不清该放哪里，通常说明它还没有被抽象到合适层级。

## 公开资料

- [Agent Skills overview - Claude API Docs](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)
- [How Claude remembers your project - Claude Code Docs](https://code.claude.com/docs/en/memory)
- [Effective context engineering for AI agents - Anthropic](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
