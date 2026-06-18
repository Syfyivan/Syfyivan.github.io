---
title: "Agent Harness 寓言课 09：把世界挂成一棵树"
date: 2026-06-18 11:28:00
description: "用图书馆树和 Plan 9 的文件哲学解释写给 Agent 的虚拟文件系统。"
tags: [AI Agent, Virtual Filesystem, Plan 9, Sandbox, 寓言课]
categories: [技术笔记, Agent Harness 寓言课]
---

王国图书馆以前有很多门。

查日历走东门，查账本走西门，查工单去地下室，查会议纪要还要找书记官。新来的学徒每次都迷路。

馆长后来做了一棵目录树：

```text
/calendar
/docs
/tickets
/meetings
/memory
```

学徒只要会 `ls`、`read`、`write`，就能在同一棵树上找资料、写记录、提交申请。

## 故事里的机制

写给 Agent 的虚拟文件系统，就是把异构世界统一成文件接口。

Agent 已经很会用文件工具：列目录、读文件、搜索文本、写补丁。如果企业知识库、日历、工单、会议纪要都能被挂载成一棵树，Agent 不必学一堆 SDK，也不必把所有外部能力做成独立工具。

这不是新思想。Plan 9 的核心哲学就是用 per-process namespace 和文件协议把资源组织起来。`/proc` 也把进程和内核状态暴露成伪文件系统。FUSE 则把“用户态实现文件系统”变成通用能力。

AgentFS 是把这条老路搬到 Agent 时代。

## 为什么不全用沙箱

沙箱很强，但成本也高。它适合跑命令、装依赖、生成文件、预览服务。

但很多任务只是读写结构化资源：查日历、查文档、更新工单状态、读取会议纪要。为了这些动作启动一个完整沙箱，有时像为了取一本书租一辆货车。

虚拟文件系统提供的是轻栈路径。它不替代沙箱，而是给“只需要 I/O 抽象”的场景一个更小接口。

## 关键设计点

一个面向 Agent 的虚拟文件系统，至少要回答：

- 路径命名：资源如何映射到路径。
- 能力声明：哪些路径只读，哪些可写，哪些可搜索。
- 会话隔离：不同用户、不同任务看到的树是否不同。
- 错误语义：权限不足、资源不存在、冲突修改如何表达。
- 审计：谁读了什么，谁写了什么。

最重要的是，不要把真实世界的复杂性全塞给模型。Provider 层负责翻译，Agent 只看到稳定的文件树。

## 今天的练习

把你常用的一个业务系统想象成文件树。写出 5 个路径：

```text
/...
/...
/...
```

如果路径能自然表达读写动作，说明它适合做 AgentFS。如果每个动作都需要复杂事务和审批，就应该留在专门工具里。

## 公开资料

- [The Use of Name Spaces in Plan 9](https://9p.io/sys/doc/names.html)
- [proc(5) - Linux manual page](https://man7.org/linux/man-pages/man5/proc.5.html)
- [FUSE documentation - Linux Kernel](https://www.kernel.org/doc/html/next/filesystems/fuse/index.html)
- [Sandbox Agents - OpenAI API](https://developers.openai.com/api/docs/guides/agents/sandboxes)
