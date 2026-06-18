---
title: "AI 与 Agent 大寓言课 06.08：把世界挂成一棵树"
date: 2026-06-18 15:10:00
description: "用目录树、挂载表和派发链路讲清 AgentFS 的路径命名空间、Provider 协议、会话隔离和三档栈。"
tags: [AI Agent, AgentFS, FUSE, Plan 9, 寓言课]
categories: [技术笔记, AI 与 Agent 大寓言课, Agent Loop 与 Harness]
---

王国里有一座图书馆。原来每件事都要跑不同的门：借书走前门，查账走后门，问公告还得绕到钟楼。学徒整天记路线，真正要做的事反而被耽搁了。

后来馆长把所有入口挂成了一棵树。想看什么，就去对应的枝杈；想写什么，也只是在同一棵树上落笔。学徒不再背门牌，只要记住路径。

再后来，馆长给每个分馆发了统一的门牌和分工。谁只负责翻页，谁可以改字，谁只能看主目录，都写在树的结构里。这样一来，路清楚了，权责也清楚了。

## 概念揭晓

这篇讲的是 AgentFS：把原本分散的业务资源挂成可寻址的目录树，让上层只看到路径，不必学一堆专用接口。故事里的图书馆是 namespace，馆长是 Service，分馆是 Provider，学徒看到的树就是 Agent 的工作面。

## 本章目录

- 路径命名空间：三棵树怎么分
- Service 如何派发：最长前缀匹配
- Provider 协议：能力靠类型表达
- Session 隔离：user_id 和 session_id 怎么注入
- 错误语义：统一错误码怎么返回
- 三档栈：纯 VFS、轻沙箱、重沙箱
- 原文对应：这篇覆盖了 Feishu 原文哪些大段落
- 公开资料：用一手资料校准术语

## 路径命名空间

AgentFS 先把世界分成三类路径。

- `/mnt/user/`：按用户隔离的长期空间。这里通常会再细分出 `skills`、`memory`、`workspaces` 这类保留目录。
- `/mnt/public/`：全局只读空间，适合平台公共资源，比如共享技能库。
- `/mnt/session/`：会话级临时空间，任务结束就销毁，适合下载件、中间产物和临时剪贴板。

这一步的关键不在目录名字，而在可见性。把“谁能看到什么”写进路径前缀，后面的权限判断就少了一大截。

## Service 如何派发

Service 的工作很像挂载表。

1. 先注册挂载点。
2. 再做最长前缀匹配。
3. 把剩余相对路径交给对应 Provider。

例如：

```python
service.mount("/mnt/user/workspaces/drive/", DriveProvider(...))
service.read("/mnt/user/workspaces/drive/2026/q1/report.md")
# Provider 只会收到 "2026/q1/report.md"
```

这套派发方式的好处是，子挂载点可以覆盖父挂载点，新增一个后端通常不需要改 Service 的核心逻辑。

## Provider 协议：能力靠类型表达

原文最重要的设计点之一，是把能力放进类型系统，而不是塞进布尔开关。

- `BaseProvider` 只要求最小能力：`read`、`ls`
- `WritableProvider` 额外声明：`write`、`edit`
- `SearchableProvider` 额外声明：`grep`、`glob`

这意味着“能不能写”不是一个配置字段，而是“有没有实现这个接口”。Service 在 mount 时做一次 `isinstance` 检查，就能知道子树里该暴露哪些操作。

## Session 隔离与权限边界

路径前缀也决定了上下文注入方式。

- `/mnt/user/...` 会带上用户身份
- `/mnt/session/...` 会带上会话身份
- `/mnt/public/...` 不带额外身份

Provider 拿到的是相对路径和必要上下文，不应该自己解析整套租户身份。这样做的目的很直接：隔离边界放在 Service 层，Provider 只处理自己的业务树。

## 错误语义与能力发现

Provider 端只抛普通 Python 异常，Service 统一翻译成稳定的错误码。

| Python 异常 | 错误码 |
| --- | --- |
| `FileNotFoundError` | `not_found` |
| `PermissionError` | `forbidden` |
| `IsADirectoryError` | `is_a_directory` |
| `NotImplementedError` | `unsupported_operation` |
| 其它未捕获异常 | `internal_error` |

这比自定义一套新异常类更省心。上层可以很自然地教模型：如果拿到 `forbidden`，就不要在同一路径上重复撞墙。

## 三档栈与组合

AgentFS 并不排斥沙箱，它只是把执行能力变成按需增配的层。

- 只读资源或简单读写，直接用纯 VFS。
- 固定语言的短计算任务，可以用轻沙箱加 VFS。
- 需要 `bash`、`git`、`make` 这类任意工具链时，再上容器沙箱，并把挂载树透进去。

这里的分层关系很关键：VFS 负责 I/O 抽象，沙箱负责执行隔离。两者不是替代关系，而是不同重量的组合。

## 原文对应

- 前言 / 背景：为什么默认装一个完整沙箱不划算
- 设计：路径命名空间、AgentFSService、Provider 协议
- 协议：AFSClient、能力发现、Session 隔离、错误语义
- 进阶组合 / 结语：三档栈、Container Sandbox、长期扩展方向

## 公开资料

- [The Use of Name Spaces in Plan 9](https://9p.io/sys/doc/names.html)
- [proc(5) - Linux manual page](https://man7.org/linux/man-pages/man5/proc.5.html)
- [FUSE documentation - Linux Kernel](https://www.kernel.org/doc/html/next/filesystems/fuse.html)
- [Effective harnesses for long-running agents - Anthropic](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
