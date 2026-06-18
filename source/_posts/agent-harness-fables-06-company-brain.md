---
title: "Agent Harness 寓言课 06：没有记忆的王国"
date: 2026-06-18 11:25:00
description: "用王国档案馆解释 Company Brain、事实记忆、交互记忆、行动记忆与 Agent 长期记忆。"
tags: [AI Agent, Memory, Company Brain, LLM Wiki, 寓言课]
categories: [技术笔记, Agent Harness 寓言课]
---

有个王国很富，却总是重复犯错。

税务官知道今年哪里欠税，仓库官知道哪批粮受潮，巡逻队知道哪座桥最危险。可这些知识都锁在各自抽屉里。新任大臣上任，只能重新问一遍、查一遍、摔一遍。

后来王国建了三间档案室。

第一间存事实：桥在哪、谁负责、上次维修是什么时候。

第二间存交互：谁问过什么、谁答过什么、争议在哪里。

第三间存行动：最后做了什么、效果如何、下次该不该沿用。

王国终于不只是“有数据”，而是开始“有记忆”。

## 故事里的机制

Company Brain 讲的是组织级记忆。放到 Agent Harness 里，它对应长期记忆和可检索知识底座。

可以先拆三层：

- 事实记忆：相对稳定的知识，比如项目结构、服务负责人、配置含义、制度链接。
- 交互记忆：人和系统之间发生过什么，比如某次讨论为什么否掉方案 A。
- 行动记忆：做过什么和结果如何，比如某次修复用什么命令验证通过。

一个只接 RAG 的 Agent 可能只会查事实。一个真正有组织记忆的 Agent，还应该知道历史互动和行动结果。

## 记忆不是聊天记录

聊天记录像监控录像，什么都有，但要找结论很费劲。

记忆应该像档案卡，经过整理，有标题、作用域、时间、证据和失效条件。否则 Agent 每次都要在一堆长文本里重新考古。

Claude Code 的记忆文档把这件事拆成两类：`CLAUDE.md` 这类人写的持久上下文，以及自动记忆这类系统从纠正和偏好中积累的笔记。两者都会在新会话开始时进入上下文，但它们不是强制规则。真要阻止危险动作，应该用 hook。

## 记忆也会过期

王国档案不能只增不删。桥修好了，旧告警就要标注；负责人换了，旧联系人就要退役；某条经验只适用于旧版本，也要写失效条件。

否则长期记忆会变成长期噪音。

一个好的记忆条目至少应该有：

```text
这是什么
适用于哪里
证据从哪来
最后验证时间
什么时候应该重新确认
```

## 今天的练习

给你正在做的项目写三条记忆：

- 一条事实记忆。
- 一条交互记忆。
- 一条行动记忆。

写完再问：半年后的人能不能知道它是否还可信？

## 公开资料

- [How Claude remembers your project - Claude Code Docs](https://code.claude.com/docs/en/memory)
- [Persistence - LangGraph Docs](https://docs.langchain.com/oss/python/langgraph/persistence)
- [Effective context engineering for AI agents - Anthropic](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
