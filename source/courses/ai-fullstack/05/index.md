---
title: "AI 全栈 · 第 5 章：CLI 和 MCP 怎样接上实际能力"
date: 2026-09-19 09:00:00
layout: page
toc: true
---

[课程目录](/courses/ai-fullstack/) · 第 5 / 12 章 · [连续阅读](/courses/ai-fullstack/read/)

如果某项能力已经有命令行程序，执行器可以启动它、传入操作信息，再读取结果。这里的 CLI 就是执行器使用外部能力的一种入口，例如搜索文件、运行检查或操作代码仓库。

于是，前面的过程可以继续展开：

```text
模型提出工具请求
→ 执行器调用 CLI
→ CLI 完成操作并返回结果
→ 应用把结果交给模型
```

直接调用服务 API，也可以完成类似连接。

当不同 AI 应用都要接入外部能力时，可以通过 MCP 约定统一的发现和调用方式。应用中的 MCP Client 向 Server 获取能力描述，应用把相关能力提供给模型；模型提出请求后，再由 Client 发送给 Server 执行。

Server 内部仍然可以调用 CLI 或 API。因此，Tool Calling、MCP 和 CLI 可以出现在同一次操作中：模型表达调用意图，应用通过约定的连接方式送出请求，具体程序完成操作。

实际系统可以直接接工具，也可以选择 MCP，取决于接入和复用需求。无论采用哪条路径，执行结果都会回到应用，而应用还要决定如何继续任务。

---

[← 第 4 章](/courses/ai-fullstack/04/) · [目录](/courses/ai-fullstack/) · [第 6 章 →](/courses/ai-fullstack/06/)
