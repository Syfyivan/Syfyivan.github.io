---
title: "Agent Harness 寓言课 07：背包和仓库"
date: 2026-06-18 11:26:00
description: "用背包和仓库解释 Context Offloading、压缩、工具结果清理和上下文预算。"
tags: [AI Agent, Context Engineering, Offloading, Compaction, 寓言课]
categories: [技术笔记, Agent Harness 寓言课]
---

探险家上山，只背一个小包。

第一天他把地图、帐篷、锅、三捆柴、十本书都塞进包里。走到半山腰，肩膀快断了。

向导说：“书可以放仓库，包里留索引。真要读哪本，再回仓库取。”

探险家问：“那不是多跑一趟？”

向导说：“是。但大多数书你根本不会再读。用一次可能亏，整趟旅程赚。”

## 故事里的机制

Context Window 就是背包。它不是越满越好。Anthropic 的 context window 文档明确提醒：上下文越长，准确率和召回会退化，这类现象常被称作 context rot。

Context Offloading 像仓库。工具返回太大时，Harness 把原始内容写到文件或外部存储里，在消息里只留一个路径或引用。需要时再读回来。

它和压缩不同：

| 机制 | 动作 | 是否有损 | 适合处理 |
| --- | --- | --- | --- |
| Offloading | 搬到外部，只留引用 | 通常无损 | 大文件、大日志、大工具返回 |
| Compaction | 摘要旧上下文 | 有损 | 长对话、长任务历史 |
| Tool result clearing | 清掉旧工具结果 | 有损或半有损 | 很久不用的原始输出 |

Offloading 是“东西还在，只是不背着”。Compaction 是“把厚书改写成摘要”。

## 为什么先搬家，再压缩

能搬家的内容，优先搬。因为原文还在，损失小。

只有当历史本身太长，或者很多决策过程必须保留但不需要逐字保留时，才压缩。Anthropic 的 compaction 文档把它定义为在接近上下文上限时自动摘要旧内容，让长任务继续进行。

所以一条实用顺序是：

```text
少塞无关内容
大结果外置
旧结果清理
必要时压缩历史
最后才重启交接
```

## 阈值是一门经济学

太早 offload，会让 Agent 频繁回仓库取东西，浪费时间。

太晚 offload，会让背包撑爆，模型注意力变差。

阈值不应该只看字节大小，还要看“未来复用概率”。日志全量可能很大，但如果 Agent 只需要最后 30 行，直接外置全量并给摘要更好。代码 diff 虽然不大，却可能每一轮都要看，就不该轻易搬走。

## 今天的练习

观察一次长任务，列出三类内容：

- 每一轮都必须看。
- 偶尔需要查。
- 基本不会再看。

第一类留在背包，第二类放仓库，第三类尽早清掉。

## 公开资料

- [Effective context engineering for AI agents - Anthropic](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [Compaction - Claude API Docs](https://platform.claude.com/docs/en/build-with-claude/compaction)
- [Context windows - Claude API Docs](https://platform.claude.com/docs/en/build-with-claude/context-windows)
