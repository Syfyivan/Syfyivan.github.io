---
title: "AI 与 Agent 大寓言课 07：会把灵感变蓝图的工匠"
date: 2026-06-18 14:54:00
description: "用学徒阿砖先搭草棚试手、再随老工头把草棚改成正房图纸的寓言，讲清 vibe coding、Spec-Driven Development、验收标准和 AI 编程边界。"
tags: [AI Coding, Vibe Coding, SDD, Spec-Driven Development, 寓言课]
categories: [技术笔记, AI 与 Agent 大寓言课]
---

## 三段故事

工地上要盖一座亭子。新来的学徒阿砖脑子里有个样子，却说不清尺寸。老工头没让他画图纸，递给他几根竹竿：“先在地上搭个草棚，把你脑子里那个样子立起来看看。”阿砖随手搭、随手拆，旁人一说“顶太矮”，他就把顶抬高；一说“柱子太密”，他又把柱子挪开。半天功夫，那个模糊的念头越来越清楚，大家终于看见这屋子大概会长什么样。

第二天要盖的是要长住的正房。草棚那套不够用了：梁多长，柱多粗，雨水往哪里流，门槛能不能过轮椅，全没写清楚。老工头说：“草棚是给你试感觉的，可正房得照规矩来——你得先把尺寸、边界和验收办法写下来，不然每个人心里的房子都不一样。”

于是他们把草棚的样子整理成一套讲究：先写这房子要给谁住，再写必须满足哪些条件，再排工序、列材料、定验收。后来阿砖明白了：搭草棚很适合找方向，正房图纸适合盖真房子。两样都重要，只是不能把草棚当成交付的正房。

## 揭晓概念

这个故事讲的是：**vibe coding 与 Spec-Driven Development**。

随手搭草棚，是 vibe coding：靠自然语言和即时反馈快速探索，把想法跑起来。把草棚整理成正房的图纸与工序，是 SDD：先把需求、约束、验收和计划写清楚，再让 AI 或人按规格施工。草棚能打开思路，正房图纸能减少返工。

## 故事对照表

| 故事里的东西 | 对应概念 |
| --- | --- |
| 搭草棚试手 | vibe coding / 快速原型 |
| 旁人边看边改 | conversational iteration |
| 要盖长住的正房 | 进入真实实现 |
| 梁长柱粗 | 需求细节与约束 |
| 验收办法 | acceptance criteria |
| 正房图纸 | spec |
| 工序和材料 | plan / tasks |

## 准确定义

**vibe coding** 是 2025 年被广泛讨论的 AI 编程方式，通常指开发者用自然语言驱动模型生成代码，快速试错，有时甚至不完整阅读每次 diff。

往深一层看，它真正改变的是“想—做—看”这个循环的成本：门槛从“你得会写代码、会搭环境”变成“你得会描述想要什么”，于是一个想法变成能跑的东西，从几天压到几分钟。所以它的价值锚在探索速度上，而不是代码质量上。

举个具体的例子：你想要一个“把一摞 markdown 拼成一页带目录的 HTML”的小工具。过去要选库、搭环境、调样式，磨一下午；vibe coding 里你一句话让模型生成，跑一下，不满意再说“目录加上锚点跳转、代码块换个配色”，十几分钟试三四版。这种“一晚上试十个方向”的能力，本身就是质变。

但它有清晰的边界：vibe coding 不等于“专业工程也可以不读代码”。Karpathy 最初说的是 throwaway weekend projects（用完即弃的周末项目）；Simon Willison 随后补了一句——如果你审查、测试、真正理解了代码，那只是在高效地用 AI 当助手，并不算 vibe coding。它和“能跑的 demo ≠ 可靠的系统”是同一类现象：好用，但有适用半径。

**Spec-Driven Development（SDD）** 是把规格放在中心的开发方式。在 AI 编程语境里，它先定义“要构建什么”，再经过规格、计划、任务、实现等阶段，把稳定的上下文交给 AI coding agent。

它为什么这么设计？因为 AI 是很强的施工队，却不会替你决定“到底要什么”。规格先行，是把“理解偏了”和“返工”提前到动手之前消灭：先就“要什么、什么算完成”达成一致，之后每一行实现都能追回到某条规格，需求一变也能顺着链路找到该改哪里。

还是用“做个个人账本页面”对照。vibe 写法是一句“做个能记账的页面”，模型只能替你猜字段、猜交互。SDD 写法是先落一条可测的验收标准：“给定我填了金额和分类、点保存，则这笔记录出现在当日列表里、当日合计相应增加；给定金额为空，则保存按钮禁用、不报错。”同一个需求，后者让模型能照着自查、让你能照着验收——这就是“一句模糊需求”和“一份可测的验收标准”的差别。

最后留个边界：SDD 目前更像一组正在形成的 AI 编程方法和工具实践，不是跨厂商统一标准。市面上已经有好几个工具（GitHub Spec Kit、Kiro Specs、Tessl 等，这些名字记不住没关系，知道“有一批工具在做规格驱动这件事”就够了）都在使用“规格驱动”的说法，但它们对 spec 的层级和工作流设计并不完全相同——这个词还在演化。

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
