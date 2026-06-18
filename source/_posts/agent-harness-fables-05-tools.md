---
title: "Agent Harness 寓言课 05：铁匠铺的工具契约"
date: 2026-06-18 11:24:00
description: "用铁匠铺解释工具定义、参数 schema、工具选择、并行工具调用和 transcript 调优。"
tags: [AI Agent, Tool Calling, MCP, Agent Computer Interface, 寓言课]
categories: [技术笔记, Agent Harness 寓言课]
---

铁匠铺有三把锤子。

第一把写着“锤”。第二把写着“把钉子敲进木板，不能敲陶器”。第三把还写了重量、握柄长度、适用材料、危险边界和错误处理。

学徒第一次进铺子，当然会乱拿第一把。师傅没有骂他笨，只把标签重写了一遍。

后来学徒很少拿错。不是他突然天才了，是工具契约变好了。

## 故事里的机制

Tool Definition 是写给模型看的契约。它通常包含：

- 工具名。
- 工具描述。
- 参数 schema。
- 参数说明。
- 是否严格要求结构。
- 返回值含义。

模型读到这些契约，判断“现在该不该用它”。Harness 才负责执行。MCP 的工具规范也强调：工具让模型与外部系统互动，每个工具有名称和 schema，模型可以基于上下文发现并调用。

## 坏契约长什么样

坏契约经常有这几种：

- 名字太泛：`run`、`query`、`search`。
- 描述只说能做什么，不说何时不用。
- 多个工具边界重叠。
- 参数名像内部字段，不像人话。
- 返回值没有单位、时效和可信度说明。
- 错误信息只给 `failed`，不给可恢复线索。

这类问题看起来像“模型笨”，实则是铁匠铺标签糟糕。

## transcript 是最好的调试材料

不要只看最后答案。要看完整 transcript：

```text
用户问了什么
模型为什么选这个工具
传了哪些参数
工具返回了什么
模型如何解释返回值
下一轮有没有被结果纠正
```

如果模型没调工具，可能是描述没给足触发条件。如果模型调错工具，可能是两个工具边界不清。如果模型传错参数，可能是 schema 和自然语言描述冲突。

工具调优应该像调 API 文档，不像祈祷。

## 并行工具调用的意义

有些问题天生可以并行。比如比较三个城市天气、审查四个独立文件、同时搜索多个来源。模型一轮产出多个 tool call，Harness 并行执行，再把结果一起送回去。

但并行不是越多越好。每个工具结果都会进入上下文，结果太多会把注意力稀释。并行的前提是子问题真的独立，结果也能被清晰合并。

## 今天的练习

挑一个工具，把描述改成这四句：

```text
Use this when...
Do not use this when...
Input must...
Output means...
```

很多工具只要补上这四句，调用质量就会立刻变好。

## 公开资料

- [Function calling - OpenAI API](https://developers.openai.com/api/docs/guides/function-calling)
- [Tools - Model Context Protocol](https://modelcontextprotocol.io/specification/2025-06-18/server/tools)
- [Building effective agents, Appendix 2 - Anthropic](https://www.anthropic.com/engineering/building-effective-agents)
