---
title: "AI 与 Agent 大寓言课 05：学徒和工具棚"
date: 2026-06-18 14:50:00
description: "用学徒借工具的寓言讲清 tool calling、MCP、Skill、权限边界和为什么模型本身不等于 Agent。"
tags: [AI Agent, Tool Calling, MCP, Skill, OpenAI, Anthropic, 寓言课]
categories: [技术笔记, AI 与 Agent 大寓言课]
---

## 三段故事

铁匠铺来了一个聪明学徒。他很会听师傅描述，也能把修锅、补锁、打钉子的步骤说得头头是道。可真正开工时，他只能站在炉边说话，不能碰锤子，不能开柜子，也不知道哪把钥匙能打开哪扇门。

师傅给他写了一本借工具的册子。册子上说：要锤子时，写清楚锤头大小；要尺子时，写清楚量哪里；要开柜子时，必须说明理由。学徒每次写申请，管工具的人照单拿工具，做完再把结果告诉他。学徒终于能把话变成动作。

后来铺子越来越大，工具棚不止一个。有的在铁匠铺，有的在木匠坊，有的在仓库。师傅又给每个工具棚统一做了门牌和交接规矩。学徒还学会随身带几本小册子：修锁一本、算账一本、接待客人一本。不同活计先翻对应小册子，再按规矩借工具。

## 揭晓概念

这个故事讲的是：**工具调用、MCP 和 Skill**。

学徒是模型。工具册子是工具定义。写申请、由外部执行、再把结果交回来，是 tool calling。统一的工具棚门牌和交接规矩，是 MCP。修锁、算账、接待客人的小册子，是 Skill：把说明、资源和脚本打包成 Agent 可加载的能力。

## 故事对照表

| 故事里的东西 | 对应概念 |
| --- | --- |
| 只会说步骤的学徒 | 只能生成文本的模型 |
| 借工具册子 | tool schema / function definition |
| 管工具的人照单执行 | 应用侧执行工具 |
| 工具结果回到学徒手里 | tool result |
| 统一门牌和交接规矩 | MCP |
| 修锁、算账小册子 | Skill |
| 柜子钥匙和理由 | 权限、审计和安全边界 |

## 准确定义

Tool calling 是让模型提出结构化工具调用请求，再由应用程序执行工具，并把执行结果返回给模型。关键点是：**模型通常不直接执行外部动作，真正执行的是应用侧工具层**。

MCP 是 Model Context Protocol，它不是某一个工具，而是一套让应用、模型和外部上下文/工具连接的协议。Skill 则更像可复用能力包，通常把说明、资源和脚本组织起来，让 Agent 在需要时加载。

## 历史过程

早期聊天模型主要生成文本。随着应用复杂度上升，开发者需要模型查数据库、读文件、调 API、运行命令，于是 function calling / tool calling 变成重要能力。OpenAI 的工具调用文档把流程描述成多步：请求模型、模型给出工具调用、应用执行、返回工具结果、模型继续回答或继续调用。

2024 年后，Agent 工程开始更重视标准化上下文和工具接入。Anthropic 推出 MCP，让不同数据源和工具能以更统一的方式暴露给模型应用。到 2025 年，MCP 稳定规范更新到 2025-11-25；2026 年的路线图和候选版继续推进传输可扩展性、权限和扩展机制。同时 Anthropic 的 Agent Skills 把“说明 + 资源 + 脚本”打包成可加载能力。它们解决的问题不同：MCP 更偏连接协议，Skill 更偏能力组织。

## 常见误解

第一，工具调用不是 Agent 的全部。一次工具调用仍然可能只是单轮问答，Agent 还需要循环、状态、停止条件和监督。

第二，MCP 不是“万能插件市场”。它定义连接方式，不替你判断工具是否安全、权限是否合理、结果是否可信。

第三，Skill 不是简单提示词。好的 Skill 应该包含任务说明、操作步骤、必要资源、脚本和边界。

## 小练习

给“查天气并提醒出门带什么”设计一个工具：

1. 工具名叫什么？
2. 输入参数有哪些？
3. 输出应该是什么结构？
4. 哪些权限必须限制？
5. 如果工具失败，模型应该怎么继续？

## 公开资料

- [Function Calling - OpenAI API](https://developers.openai.com/api/docs/guides/function-calling)
- [MCP Specification 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25)
- [The 2026 MCP Roadmap](https://blog.modelcontextprotocol.io/posts/2026-mcp-roadmap/)
- [Agent Skills - Anthropic](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)
- [Building Effective Agents - Anthropic](https://www.anthropic.com/research/building-effective-agents)
