---
title: "AI 与 Agent 大寓言课 07：画匠和施工图"
date: 2026-06-18 14:54:00
description: "用画匠试画和匠人施工图的寓言讲清 vibe coding、Spec-Driven Development、验收标准和 AI 编程边界。"
tags: [AI Coding, Vibe Coding, SDD, Spec-Driven Development, 寓言课]
categories: [技术笔记, AI 与 Agent 大寓言课]
---

## 三段故事

城里要修一座小茶亭。第一位画匠拿着炭笔，先在墙上随手画：这里开窗，那里摆桌，屋顶像荷叶。旁人一说“再亮一点”，他马上改大窗；有人说“坐不下”，他又把墙往外挪。一天过去，大家终于看见茶亭大概会长什么样。

第二天，木匠要真的开工。画匠的墙画不够用了：梁多长，柱多粗，雨水往哪里流，门槛能不能过轮椅，都没有写清楚。木匠说：“我可以照着意思做，但你得先把尺寸、边界和验收办法写下来，不然每个人心里的茶亭都不一样。”

于是众人把墙画整理成施工图：先写茶亭要给谁用，再写必须满足哪些条件，再列材料、工序和验收。后来他们发现，随手画很适合找方向，施工图适合盖真房子。两者都重要，只是不能把草图当交付。

## 揭晓概念

这个故事讲的是：**vibe coding 与 Spec-Driven Development**。

随手画茶亭，是 vibe coding：靠自然语言和即时反馈快速探索，把想法跑起来。施工图，是 SDD：先把需求、约束、验收和计划写清楚，再让 AI 或人按规格实现。草图能打开思路，施工图能减少返工。

## 故事对照表

| 故事里的东西 | 对应概念 |
| --- | --- |
| 墙上随手画 | vibe coding / 快速原型 |
| 旁人边看边改 | conversational iteration |
| 木匠准备开工 | 进入真实实现 |
| 梁长柱粗 | 需求细节与约束 |
| 验收办法 | acceptance criteria |
| 施工图 | spec |
| 材料和工序 | plan / tasks |

## 准确定义

vibe coding 是 2025 年被广泛讨论的 AI 编程方式，通常指开发者用自然语言驱动模型生成代码，快速试错，有时甚至不完整阅读每次 diff。它适合原型、探索和低风险个人工具，但不等于专业工程可以放弃理解、测试和评审。

Spec-Driven Development 是把规格放在中心的开发方式。在 AI 编程语境里，它通常强调先定义“要构建什么”，再经过规格、计划、任务和实现等阶段，把上下文稳定地交给 AI coding agent。规格不是一次性文档，而是后续实现、评审和维护的依据。

这里要留一个边界：SDD 目前更像一组正在形成的 AI 编程方法和工具实践，不是跨厂商统一标准。GitHub Spec Kit、Kiro Specs、Tessl 等都在使用“规格驱动”的语言，但它们对 spec 的层级和工作流设计并不完全相同。

## 历史过程

软件工程早就有“先想清楚再做”的传统，比如需求文档、设计文档、测试驱动开发和行为驱动开发。AI 编程流行之后，很多人先体验到的是快速生成代码的效率，于是 vibe coding 成为显眼现象。

2025 年，Andrej Karpathy 提出 vibe coding 这个说法，Simon Willison 随后提醒：不是所有 AI 辅助编程都是 vibe coding。如果你审查、测试并理解了代码，那更像是把 AI 当高效助手，而不是把代码完全交给感觉。

同一时期，Kiro Specs、GitHub Spec Kit 等工具把 SDD 推到 AI 编程前台。GitHub Spec Kit 把流程描述成 Spec -> Plan -> Tasks -> Implement。Martin Fowler 对 Kiro、Spec Kit 和 Tessl 的比较也提醒大家：SDD 这个词还在演化，不同工具里的“spec”层级并不完全一样。

## 常见误解

第一，vibe coding 不等于低水平。它可以非常适合探索，但不适合直接作为高风险生产流程。

第二，SDD 不等于写一堆没人看的文档。好的规格应该能驱动实现、测试、评审和后续修改。

第三，有规格也不代表结果一定正确。规格本身可能漏需求、错约束，所以还需要评审、测试和用户反馈。

## 小练习

把“做一个个人账本页面”拆成两种写法：

1. 用一句自然语言快速描述原型。
2. 写 5 条必须满足的验收标准。
3. 写 3 条明确不做的边界。
4. 判断哪些部分可以先 vibe，哪些必须先写规格。

## 公开资料

- [Not all AI-assisted programming is vibe coding - Simon Willison](https://simonwillison.net/2025/Mar/19/vibe-coding/)
- [A quote from Andrej Karpathy - Simon Willison](https://simonwillison.net/2025/Feb/6/andrej-karpathy/)
- [Spec-driven development with AI - GitHub Blog](https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/)
- [Spec Kit Documentation - GitHub](https://github.github.com/spec-kit/)
- [Specs - Kiro Docs](https://kiro.dev/docs/specs/)
- [Understanding Spec-Driven-Development - Martin Fowler](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html)
