---
title: "多 Agent 编排 05：让结论可信，验证、投票与对抗式审查"
date: 2026-06-15 20:20:00
tags: [多Agent, 对抗式验证, 投票, evaluator-optimizer, LLM-as-judge]
categories: [技术笔记, 多Agent编排]
---

并行拉起一堆 finder agent，它们会吐出一大把“发现”。问题来了：**这些发现有多少是真的？** 模型会自信地报告一个根本不存在的 bug。多 Agent 系统如果只“找”不“验”，等于放大噪音。这一篇讲怎么让结论可信。

## 为什么必须验证：错误会累积

Anthropic 在多智能体系统复盘里点了一句很重的话：

> Agent 是**有状态的，错误会累积**（errors compound）。一个早期的小失误，可能在后续步骤里被放大成灾难性的偏离。

而且 agent 是**非确定**的——同样的提示，两次运行可能走完全不同（但都“看起来合理”）的路径。所以并行产出的发现，天然带着一批假阳性。验证不是锦上添花，是必需的一道工序。

## 招式一：投票（Voting）

最简单的提升置信度的办法，就是 Anthropic 并行模式里的 **voting**：

> 把**同一个任务跑多次**，得到多样的输出。

```text
同一段代码 -> 5 个独立 agent 各查一遍漏洞
  3 个说“这里有注入风险”
  2 个说“没问题”
-> 多数票：大概率真有问题，值得人工复核
```

让多个 agent（甚至用不同提示、不同视角）独立判断同一件事，取多数。单个 agent 的偶发幻觉，很难在多数票里幸存。

## 招式二：对抗式验证（让它去“证伪”）

比投票更狠的是**对抗式验证**：对每一条候选发现，专门派独立 agent 去**试图推翻它**，而不是确认它。

```text
finder 报告：“第 42 行有空指针”
  -> 派 3 个 verify agent，每个的任务是“尝试证明这条是错的”
  -> 默认倾向“证伪”，除非证据确凿才保留
  -> 多数都推翻 -> 丢弃；推翻不了 -> 保留为真发现
```

为什么要让它证伪而不是证实？因为模型有“讨好倾向”，你让它确认它就倾向确认。把任务反过来设成“挑刺”，能逼出真正站不住的发现。截图里 `code-review-max` 的 `verify:*` 阶段，干的就是这件事——每条 finding 配一组 verify agent 逐条过。

进阶一点：给每个验证者**不同的视角**（正确性、安全、能不能复现），而不是 N 个一模一样的复读机——多样性能抓到单一视角抓不到的漏。

## 招式三：评估-优化循环（生成器 vs 评审）

第 03 篇提过的 **evaluator-optimizer**，也是一种验证：

> 一个 LLM 生成结果，另一个 LLM 在循环里提供评估和反馈。

和投票/对抗的区别：它是**串行精修**——生成、评审、改、再评审，直到过关。适合“有明确标准、改一版好一版”的活，比如翻译润色、要过 lint 的代码。论文 *Self-Refine* 显示，哪怕同一个模型一人分饰“生成/评审/修订”三角，在 7 类任务上也能平均提升约 20%。

## 招式四：LLM-as-judge（怎么给 agent 的活打分）

验证的尽头是“谁来评判验证本身”。Anthropic 的做法是 **LLM-as-judge**——用一个模型按评分表给输出打分，维度包括：

> 事实准确性、引用准确性、完整性、来源质量、工具使用效率。

但他们也强调**人工兜底不能省**：早期 agent 一直偏爱 SEO 内容农场而非权威来源，这个偏差是**人**发现的，自动评测没抓到。

## 把验证嵌进编排：一个典型骨架

把上面几招拼进多 agent 流程，通常长这样：

```text
Find（并行）   ：多个维度的 finder 各自产出候选发现
   ↓
Verify（并行） ：每条候选派独立 agent 对抗式验证 / 多数投票
   ↓
Sweep（补漏）  ：再扫一轮，找有没有漏掉的
   ↓
Synthesize     ：去重、按可信度排序，合成最终 ≤N 条结论
```

这正是开头那张截图的形状。多 agent 的价值，一半在“并行去找”，另一半就在“逐条去验”——少了后半截，你只是更快地产出了更多噪音。

## 一句话总结

并行只负责“找得多”，验证才负责“信得过”。用投票抗偶发幻觉、用对抗式验证逼出站不住的发现、用评估循环串行精修、用 LLM-as-judge 配人工兜底打分。记住：**Agent 会自信地犯错，且错误会累积——任何认真的多 Agent 系统，找和验都得各占一半。**

## 参考资料

- [Anthropic：How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)（2025-06-13）
- [Anthropic：Building Effective Agents](https://www.anthropic.com/research/building-effective-agents)（2024-12-19）
- [Self-Refine: Iterative Refinement with Self-Feedback](https://arxiv.org/abs/2303.17651)（NeurIPS 2023）
- [Improving Factuality and Reasoning through Multiagent Debate](https://arxiv.org/abs/2305.14325)（ICML 2024）
