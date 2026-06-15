---
title: "多 Agent 编排 06：案例解剖，code-review-max 在干嘛"
date: 2026-06-15 20:30:00
tags: [多Agent, 代码审查, Claude Code, workflow, 案例]
categories: [技术笔记, 多Agent编排]
---

前面五篇讲原理，这一篇落到一个具体的真实案例：一张正在运行的多 Agent 代码审查截图——`code-review-max`，`60/62 agents · 15m01s`。把它逐阶段拆开，前面所有概念就都能对上号了。

## 截图在说什么

顶栏一行字概括了整条流水线：

```text
code-review-max
max-effort 多角度代码审查：9 finder × 8 候选 → 逐条验证 → 补漏 → ≤15 findings
60/62 agents · 15m01s
```

左侧三个阶段（Phases）：

```text
Phase 1  Find        58/58   ← 多角度并行找问题
Phase 2  Sweep        2/4    ← 验证 + 补漏
Phase 3  Synthesize          ← 去重合成最终结论
```

每一行都是一个**独立子 agent**，标着 `Opus 4.8 (1M context)`，各自的 token、工具调用次数、耗时（如 `130.2k tok · 14 tools · 2m 48s`）。这就是第 04 篇说的“每个 agent 一个干净房间”的真实样子。

## Phase 1 — Find：9 个维度并行扫

第一阶段并行拉起 9 类 finder，每个只盯一个维度：

```text
find:A-逐行扫描        find:B-删除行为审计      find:C-跨文件追踪
find:D-语言陷阱        find:E-包装器正确性      find:Reuse-复用
find:Simplification-简化   find:Efficiency-效率   find:Altitude-深度
```

为什么要拆 9 个而不是让一个 agent 全看？正是第 01 篇的结论：一个 agent 同时盯 9 件事，注意力被稀释、关键问题被淹没。拆开后，“审删除行为”的 agent 只想删除安全、“查跨文件”的只追调用链，每个都在自己干净的上下文里把一件事做到位。

按第 02 篇的分类，这一步是**预先定好的并行（sectioning）**——维度是固定的 9 个，不是临场决定的。

## Phase 1 后半 — Verify：每条发现逐条验证

注意截图里 Find 阶段不止 9 个 finder，下面还有一长串 `verify:*`：

```text
verify:A-逐行扫描:http-…     verify:A-逐行扫描:handl…
verify:Simplification-…      verify:Altitude-深度:ht…   ……
```

命名规律是 `verify:<来自哪个维度>:<针对哪条发现>`。也就是第 05 篇讲的：**每一条候选发现，都派一个独立 agent 去逐条验证**，过滤假阳性。9 个 finder 找出一堆候选，紧接着几十个 verify agent 一条条核——这就是“58 agents”里的大头。

## Phase 2 — Sweep：补漏

`Sweep 2/4`。Find + Verify 走完，还要再扫一轮问自己：**有没有维度没覆盖到？有没有发现被错杀？** 这是第 05 篇“completeness 补漏”那一步，专治“找得快但找漏了”。

## Phase 3 — Synthesize：去重合成

最后一步把所有验证通过的发现**去重、按可信度排序、合成成 ≤15 条**最终结论。前面几十个 agent 产出的是原始材料，这一步才把它收敛成一份人能读的报告。`≤15 findings` 就是这个收敛上限——不是越多越好，是“最值得看的 15 条”。

## 它用到了课程里的哪些概念

把这一个案例对照前五篇，几乎全中：

| 截图里的现象 | 对应概念 | 哪一篇 |
| --- | --- | --- |
| 9 个 finder 各盯一维 | 并行 sectioning + 关注点分离 | 02 / 04 |
| 每个 agent 独立 1M 上下文 | 上下文隔离 | 04 |
| 几十个 verify 逐条核 | 对抗式验证 | 05 |
| Sweep 补漏 | completeness 补漏 | 05 |
| Synthesize 去重合成 | reduce / 聚合 | 03 |
| 60 agents / 15m01s | 并行：耗时取最慢而非相加 | 04 |
| max-effort、≤15 | 按复杂度配预算、收敛上限 | 07 |

它不是单一模式，而是**并行 fan-out + 对抗式验证 + map-reduce 合成**的组合——真实系统都是这样拼出来的。

## 这是什么工具

这张图是 **Claude Code 的多 Agent 工作流（Workflow）编排**的实时进度界面：一个编排脚本 fan-out 出几十个子 agent，分 Find / Sweep / Synthesize 三阶段跑。对应到使用层面，就是 `/code-review` 把强度拉到 max/ultra，或直接用 Workflow 工具写脚本编排。怎么自己写，留到第 08 篇。

## 一句话总结

`code-review-max` 不神秘：它把“审代码”这件事拆成 9 个维度并行去找（隔离 + 并行）、每条发现派人对抗式验证（可信）、补一轮漏、再去重合成 ≤15 条（聚合）。一张截图，正好把这门课前五篇的概念全演了一遍。下一篇算清它的账：这么跑，值不值。

## 参考资料

- [Anthropic：Building Effective Agents](https://www.anthropic.com/research/building-effective-agents)（2024-12-19）
- [Anthropic：How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)（2025-06-13）
- [Claude Agent SDK：Subagents in the SDK](https://code.claude.com/docs/en/agent-sdk/subagents)
