---
title: "AI 与 Agent 大寓言课 06.09：工具棚里的常用器件一览"
date: 2026-06-18 15:11:00
description: "用工具棚解释 WebSearch、WebFetch、Glob、Grep、Read、Write、Edit、Bash 的分组、组合和安全边界。"
tags: [AI Agent, Claude Code, Tools, MCP, 寓言课]
categories: [技术笔记, AI 与 Agent 大寓言课, Agent Loop 与 Harness]
---

木匠师傅有个满是家伙什的棚子。新学徒一进门，看见锯子、刨子、尺子、墨斗、锤子、钻子，立刻头大：难道每一把都要先背型号吗？

师傅说不用。先分清四类就够了：找东西的，看东西的，改东西的，跑东西的。

学徒按这四类去拿，慢慢发现顺手比花哨更重要。器件不在多，关键是别拿错，更别把柜门一次性全打开。

## 概念揭晓

这篇讲的是 Claude Code / Managed Agent 这类运行时里常见的工具分组：`WebSearch`、`WebFetch`、`Glob`、`Grep`、`Read`、`Write`、`Edit`、`Bash`。故事里的工具棚就是工具集，师傅写的规矩就是权限边界，学徒的拿取顺序就是组合模式。

## 本章目录

- 工具先分组：别先背名字，先记用途
- WebSearch / WebFetch：先找再读
- Glob / Grep / Read：先定位，再展开
- Write / Edit / Bash：改动和执行怎么分
- 组合模式与安全边界：常见流水线怎么搭
- 与 Text Editor Tool 的区别：文件栈和编辑栈不是一回事
- 原文对应：这篇覆盖了 Feishu 原文哪些大段落
- 公开资料：用一手资料校准权限和行为

## 工具先分组

最实用的分法不是按产品名，而是按动作。

| 类别 | 工具 | 作用 |
| --- | --- | --- |
| 找东西 | `WebSearch`、`Glob`、`Grep` | 发现候选页面、文件或文本位置 |
| 看东西 | `WebFetch`、`Read` | 展开页面内容或文件内容 |
| 改东西 | `Write`、`Edit` | 新建、覆写或精确修改 |
| 跑东西 | `Bash` | 执行命令、测试、构建和脚本 |

原文的核心判断很简单：低风险动作尽量轻，重动作要能审计，执行动作要落在受控环境里。

## WebSearch / WebFetch

`WebSearch` 的作用是找候选，不是直接下结论。它更适合当前信息、最新文档、价格变化、接口改动这一类会漂移的事实。

`WebFetch` 的作用是把已经找到的页面展开读完。实际使用里，通常是先搜到 URL，再抓全文。这样能避免盲抓，也能把“找”和“读”分开。

一个稳妥的节奏是：

1. 先 `WebSearch`。
2. 再挑一个或几个候选 URL。
3. 只对真正需要的页面做 `WebFetch`。

## Glob / Grep / Read

这三个更像代码库里的侦察兵。

- `Glob` 负责按路径模式找文件。
- `Grep` 负责按正则找内容。
- `Read` 负责按具体路径和范围看文件。

它们的顺序通常也是从粗到细：先 `Glob` 定位文件，再 `Grep` 找关键字，最后 `Read` 看上下文。这样比一上来就把整个仓库拖进来轻得多。

## Write / Edit / Bash

这三个动作决定了系统最终会不会真的改变世界。

- `Write` 用于创建新文件或完整覆写。
- `Edit` 用于精准替换已有内容。
- `Bash` 用于跑命令、验证、构建和调用脚本。

最重要的一条经验是：已有文件先读再改，命令和目录切换要在同一次 shell 里完成。

```bash
cd /project && npm run build
```

如果把 `cd` 和后续命令拆成两次，第二次就不一定还在同一个工作目录里。

## 组合模式与安全边界

工具少并不代表能力弱，真正的效率来自组合。

- `WebSearch -> WebFetch`：找当前资料，再深读页面。
- `Glob -> Grep -> Read`：先缩小范围，再看具体内容。
- `Read -> Edit -> Bash`：先确认现状，再改，再验。
- `WebFetch -> Write`：把外部资料整理成新稿。

安全边界也跟着组合模式一起走：

- `Read`、`Glob`、`Grep` 通常属于低风险动作。
- `Write`、`Edit`、`Bash` 属于会改变状态的动作，要能被权限系统和审计接住。
- 涉及外部网络或真实副作用的动作，不应该像普通文本补全那样随手放行。

## 与 Text Editor Tool 的区别

原文还专门区分了文件工具栈和 Messages API 里的 Text Editor Tool。

它们看起来都和“编辑”有关，但关注点不同：

- Text Editor Tool 更像对单个编辑动作的窄接口。
- `Read` / `Write` / `Edit` / `Bash` 这一套更像完整文件工作流的一部分。

如果任务本身就是“读一批文件、改一处、跑一遍验证”，文件栈更自然；如果任务只是局部文本编辑，窄编辑器会更轻。

## 原文对应

- 背景 / 工具全览：Managed Agent 和 `agent_toolset_20260401`
- WebSearch / WebFetch / Glob / Grep / Read / Write / Edit / Bash：八个内置工具的角色说明
- 工具组合模式：搜索、读取、修改、执行如何串起来
- 与 Messages API Text Editor Tool 的区别 / 小结：文件栈和窄编辑器的边界

## 公开资料

- [Tools reference - Claude Code Docs](https://code.claude.com/docs/en/tools-reference)
- [Configure permissions - Claude Code Docs](https://code.claude.com/docs/en/permissions)
- [Agent SDK overview - Claude Code Docs](https://code.claude.com/docs/en/agent-sdk/overview)
- [Code execution tool - Claude API Docs](https://docs.claude.com/en/docs/agents-and-tools/tool-use/code-execution-tool)
- [Writing effective tools for agents — with agents - Anthropic](https://www.anthropic.com/engineering/writing-tools-for-agents)
