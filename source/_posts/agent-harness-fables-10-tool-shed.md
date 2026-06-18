---
title: "Agent Harness 寓言课 10：工具棚里的十把工具"
date: 2026-06-18 11:29:00
description: "用工具棚解释 Coding Agent 常用工具的分类、裁剪、边界和安全用法。"
tags: [AI Agent, Claude Code, Tools, MCP, 寓言课]
categories: [技术笔记, Agent Harness 寓言课]
---

木匠师傅有个工具棚。新学徒一进门，看见锯子、刨子、尺子、墨斗、锤子、钻子，吓得说：“我要把每把工具的型号都背下来吗？”

师傅说：“不用。你先分清四类。”

```text
找东西的
看东西的
改东西的
跑东西的
```

背型号不重要，知道什么时候拿哪一类才重要。

## 故事里的机制

Coding Agent 的常用工具也可以这么分。

找东西：

- `glob`：按路径模式找文件。
- `grep`：按内容找文本。
- `web_search`：找公开网页或资料入口。

看东西：

- `read_file`：读文件片段。
- `web_fetch`：抓网页内容。
- `view_image`：看图。

改东西：

- `apply_patch`：改文件。
- 写文档、生成报告、输出 artifact。

跑东西：

- `bash` 或 shell：执行命令。
- 测试、构建、启动服务。

还有两类更高阶：`todo` 这类状态工具，以及 `subagent` 这类上下文隔离工具。

## 工具越多越好吗

不一定。工具太多会让模型每一轮都背着厚厚的工具说明，选择也更难。

好的 Harness 会裁剪工具。只给当前任务需要的工具，或者用 MCP / tool search / skill discovery 之类机制按需发现。MCP 的价值不只是“接更多工具”，更是把工具暴露方式标准化。

工具棚越大，标签越重要；标签越差，学徒越容易拿错。

## 安全边界在哪里

找和看通常风险较低，改和跑风险较高。

所以工程上常见做法是：

- 读操作默认允许。
- 写操作用 patch，便于审计。
- 命令执行放在沙箱或受控工作区。
- 涉及真实外部系统的动作加审批。
- secrets 不进 prompt，不写入生成文件。

OpenAI 的 sandbox 文档把 harness 与 compute 拆开，也是在强调这个边界：控制面负责审批、路由、恢复；执行面负责真实文件和命令。

## 今天的练习

给你的 Agent 工具棚画一张四象限表：

```text
找东西 / 看东西
改东西 / 跑东西
```

每个工具填进去，再标出哪些需要审批。你会很快看出风险主要集中在哪里。

## 公开资料

- [Tools - Model Context Protocol](https://modelcontextprotocol.io/specification/2025-06-18/server/tools)
- [Sandbox Agents - OpenAI API](https://developers.openai.com/api/docs/guides/agents/sandboxes)
- [Subagents in the SDK - Claude Code Docs](https://code.claude.com/docs/en/agent-sdk/subagents)
