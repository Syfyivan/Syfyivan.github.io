---
title: "多 Agent 编排 01：为什么要多 Agent，单 agent 的上下文瓶颈"
date: 2026-06-15 19:40:00
tags: [多Agent, AI Agent, 上下文窗口, context engineering, LLM]
categories: [技术笔记, 多Agent编排]
---

一张截图引出的问题：一次代码审查，同时跑了 60 个 agent，9 个 finder 各盯一个维度，再逐条验证、补漏、合成。第一反应可能是“至于吗，一个模型不能一次看完？”

这门课的第一篇，就先回答“为什么要拆成很多 agent”。答案不在“人多力量大”，而在一个很物理的限制：**上下文窗口**。

## 上下文是有限资源，而且边际收益递减

大模型不是把整个项目都“记”在脑子里，它每次推理只能看见**喂进上下文窗口的那些 token**。窗口再大也有上限，更关键的是 Anthropic 的一句结论：

> 上下文必须被当作一种**有限资源，且边际收益递减**（finite resource with diminishing marginal returns）。

也就是说，往窗口里塞得越多，并不是线性地越聪明。塞到一定程度，效果反而开始下滑。

## context rot：塞得越满，越记不住

这个下滑有个形象的名字叫 **context rot（上下文腐烂）**：

> 随着上下文窗口里的 token 数增加，模型从中**准确召回信息的能力会下降**。

为什么？根子在 Transformer 的注意力机制：每个 token 都要和其他所有 token 建立关系，n 个 token 就是 n² 对关系。窗口越长，有限的注意力就被摊得越薄。它不是一道断崖，而是一条**逐渐下滑的性能曲线**。

学术上还有个经典现象叫 **lost in the middle**：把关键信息放在一段长上下文的中间，模型最容易“看漏”；放在开头或结尾反而记得清。一个塞满了几十个文件、几万行日志的单 agent，正是踩在这条曲线最不利的位置上。

## 注意力被稀释：什么都看 = 什么都没看清

把这件事翻译成工程语言：

```text
单 agent 一次性塞进来：
  - 10 个源文件
  - 3 份配置
  - 一大段 CI 日志
  - 任务说明 + 历史对话
  -> 注意力被均摊到所有内容上
  -> 真正关键的那两行 bug 被淹没
```

人也是这样：让你同时校对错别字、检查逻辑、评估架构、核对依赖，你哪一项都做不到最好。模型同理。**“什么都让它看”往往等于“什么都没看清”。**

## 多 Agent 的两个真正卖点

既然瓶颈是上下文，解法就顺理成章——别让一个 agent 扛全部，拆开。这带来两个核心收益（来自 Anthropic 的 Claude Agent SDK 工程博客原话）：

> 子 agent 有用，主要是两个原因。第一，**并行化**：你可以同时拉起多个子 agent 处理不同任务。第二，**上下文管理**：子 agent 用它们各自隔离的上下文窗口，只把相关信息回传给编排者，而不是它们的全部上下文。

拆开来看：

- **并行（parallelization）**：9 个维度同时审，而不是一个 agent 串行审 9 遍。耗时从“相加”变成“取最慢的那个”。
- **上下文隔离（context isolation）**：每个子 agent 有**干净的、只装一件事**的上下文。审“删除行为”的 agent 不被“代码风格”的噪音干扰，注意力全压在一个维度上。

Anthropic 还补了一句它最适合的场景：

> 适合那些**需要在海量信息里筛选、且大部分信息最终没用**的任务。

代码审查、深度研究、跨文件追踪，全是这种“信息多、有用的少”的活。

## 一个能镇住人的数据

Anthropic 的多智能体研究系统（驱动 Claude 的 Research 功能）给过一组对比：用 Claude Opus 4 当主管、Sonnet 4 当子 agent 的多 agent 系统，在内部研究评测上比**单个 Opus 4 高出 90.2%**；复杂查询靠并行最多砍掉 **90%** 的研究耗时。

当然，代价也很实在——多 agent 系统的 token 消耗大约是普通聊天的 **15 倍**（这条后面第 07 篇专门讲）。但先记住：它强，强在用并行和隔离绕开了单 agent 的上下文瓶颈。

## 一句话总结

单 agent 的天花板是上下文窗口：上下文是有限资源、塞满会“腐烂”、注意力会被稀释。多 Agent 编排的本质，是把一个被噪音压垮的大上下文，拆成若干个专注、干净、可并行的小上下文。理解了这个瓶颈，后面所有的编排模式才有意义——它们都是在回答同一个问题：**怎么把活拆开，让每个 agent 都看得清。**

## 参考资料

- [Anthropic：Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)（2025-09-29）
- [Anthropic：How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)（2025-06-13）
- [Anthropic：Building agents with the Claude Agent SDK](https://claude.com/blog/building-agents-with-the-claude-agent-sdk)（2025-09-29）
- [Lost in the Middle: How Language Models Use Long Contexts](https://arxiv.org/abs/2307.03172)
