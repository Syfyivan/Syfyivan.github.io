---
title: "Agent Harness 寓言课 08：三种行囊整理法"
date: 2026-06-18 11:27:00
description: "用旅人整理行囊解释热路径清理、阶段性压缩和交接重启三种上下文治理策略。"
tags: [AI Agent, Context Engineering, Compaction, Claude Code, 寓言课]
categories: [技术笔记, Agent Harness 寓言课]
---

旅人穿越沙漠，有三种整理行囊的办法。

第一种，每走一段就扔掉空水袋和碎纸。这很轻，几乎不影响赶路。

第二种，傍晚扎营时，把白天见闻写成一页日记，旧草稿烧掉。这能省空间，但细节会丢。

第三种，旅程太长时，把关键地图、未完成事项和风险写成交接信，交给下一支队伍重新出发。

三种办法都叫“整理”，但代价完全不同。

## 故事里的机制

长任务里的上下文治理，也可以分三层：

1. 热路径清理：每次调用前，把明显不再需要的旧工具结果、冗余输出、重复消息清掉或折叠。
2. 阶段性压缩：任务进行到一个阶段，把历史压成摘要，保留决策、未解问题和最近关键文件。
3. 交接重启：当前上下文已经太乱，写一份 handoff，让新会话从清洁状态继续。

原始材料里讨论了 Claude Code 的多层压缩和 microcompact。公开资料里能稳定确认的部分是：Anthropic 已经把 compaction 作为长任务上下文工程的核心手段，并强调选择保留什么、丢弃什么会影响后续表现。

不要把所有细节都当成通用标准。更可靠的学习方式是记住这三类策略：轻清理、摘要、重启交接。

## 为什么压缩会伤人

摘要不是魔法。摘要会丢掉未来才显得重要的细节。

比如旅人在日记里写“上午遇到两口井”，却没写第一口井旁边有毒草。第二天队伍走回第一口井时，危险信息已经丢了。

Agent 也是一样。压缩时看似无关的错误日志、路径、用户偏好，后面可能变关键。因此压缩提示词要经过真实 trace 调优，不能只写一句“总结一下前文”。

## 为什么有时要重启

如果行囊里全是潮湿纸张、重复地图、过时路标，继续整理可能不如重新打包。

长程 Agent 任务里，重启并不等于失败。只要 handoff 写清楚：

- 当前目标。
- 已完成事项。
- 关键证据。
- 重要决策。
- 未解决问题。
- 下一步建议。

新会话反而可能更稳。

## 今天的练习

给任何一个长任务写一份交接信，限制 300 字。写完检查它是否回答了三件事：

```text
现在做到哪里
为什么走到这里
下一步最该做什么
```

如果这三件事说不清，说明你的上下文本来就没有被治理好。

## 公开资料

- [Effective context engineering for AI agents - Anthropic](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [Compaction - Claude API Docs](https://platform.claude.com/docs/en/build-with-claude/compaction)
- [Explore the context window - Claude Code Docs](https://code.claude.com/docs/en/context-window)
