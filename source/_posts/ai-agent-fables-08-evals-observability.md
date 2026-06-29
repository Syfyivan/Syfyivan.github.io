---
title: "AI 与 Agent 大寓言课 08：会验收的裁判"
date: 2026-06-18 14:56:00
description: "用考核场、老裁判、旧赛本和录像的寓言讲清 eval、trace、回归集、人工评审、成本和延迟观测。"
tags: [AI Evaluation, Evals, Observability, Regression, Trace, 寓言课]
categories: [技术笔记, AI 与 Agent 大寓言课]
---

## 三段故事

考核场上，一个选手当众露了一手，行云流水，看台叫好一片。新来的助手阿评看得入神，差点就要宣布让他过。老裁判按住他：“一段漂亮表演不算会办事。换道他没练过的题，再换个问法去问，遇上刁钻情况看他还稳不稳，再说。”

老裁判拿出一本旧赛本。里面记着选手过去栽过的跟头、最容易答错的题、最难答对的实务，还有每场要扣分的细则。选手每改一次答法，这些旧题都要重新跑一遍。新本事要是让老错误回了来，就不能过关。

考核场的每个角落都架着录像。它不评好坏，只把每场的每一步都记下来：选手一步步去了哪儿、借了什么工具、花了多久、使了多少盘缠，哪一步卡了壳、哪次返工最多。老裁判看他答得对不对，录像记他一步步怎么走的。两样合起来，才知道这选手能不能长期靠得住。

## 揭晓概念

这个故事讲的是：**评测、观测与回归**。

当众表演的那一段是一次演示。旧赛本是 eval dataset 和 regression suite。扣分细则是评分标准。录像把每一步记下来，是 trace 和 observability。盘缠和时间，是成本与延迟。AI 应用不能只看一次好看的输出，而要看它在一组代表性任务上是否稳定。

## 故事对照表

| 故事里的东西 | 对应概念 |
| --- | --- |
| 当众表演一段 | demo |
| 旧赛本 | eval set / regression set |
| 扣分细则 | rubric / metric |
| 换题换问法 | distribution shift |
| 老错误回来 | regression |
| 录像记录过程 | trace / observability |
| 盘缠和时间 | cost / latency |

## 准确定义

这一讲的核心是三个概念：eval、trace/observability、regression suite。下面把它们讲透——一句定义、一点直觉、一个具体例子、一条边界。其余像成本、延迟、分布漂移，对照表里一句话即可。

**AI eval（评测）。** 它是用一组代表性任务、按客观标准，判断系统在目标任务上是否达到要求。直觉上，它问的不是“它能不能做到一次”，而是“它在一批题上平均多行、到底哪里不行”。一个具体对照：**一次 demo 跑通 ≠ 通过评测**——你在 demo 里挑 5 条都答对，看着像 100%；可评测是在 500 条有标注的样本上算准确率，答对 410 条就是 82%，这个数才是验收依据；开放式任务则常用成对比较，让模型在 A/B 两版回答里反复选更好的，统计胜率，而不是看单条。边界上要注意：eval 不是公开榜单分数（榜单高分不代表它能处理你的文档、权限、用户语气），也不是“跑通即通过”——通过率（pass rate）= 满足成功判据的样本数 ÷ 总样本数，判据一含糊，这个数就没意义。

**Observability（可观测性）与 trace（追踪）。** 它是看见系统内部运行过程的能力；trace 把一次执行拆成有时序的步骤记录。直觉上，只看最终答案像只看考卷分数，trace 像把答题过程一步步录下来。一个具体例子：Agent 回了句“查不到这张订单”，没有 trace 你只看到这句结论；有了 trace 才发现它调检索工具时把订单号格式传错了、工具返回空、它却当成“订单不存在”——错在参数，不在模型判断。边界上：有 trace ≠ 已经会治理。日志堆成山却从不回放、不归类，洞察依然是零；trace 是让排查从“猜”变“查”的前提，不是终点。

**Regression suite（回归集）。** 它是一套固定不变的考题，每次改动后全部重跑，用来守住已经到手的质量。直觉上，它防的是“修好一个、又弄坏一个”。一个具体例子：你给 prompt 加一句“回答更简洁”，简洁是改好了，但回归集里那道“必须列全 5 个必填字段”的题从此少列一项——不重跑就发现不了。它对应传统软件的回归测试，差别在于 AI 输出有随机性，所以同一道题常要跑多次、看通过率而非单次结果。

## 历史过程

传统机器学习长期依赖训练集、验证集、测试集和公开 benchmark。大模型出现后，通用 benchmark 仍然有价值，但它不能替代业务任务评测。一个模型在公开题上高分，不代表它能正确处理你的文档、你的权限、你的用户语气和你的失败场景。

2023 年以后，越来越多团队把 eval 当成 AI 产品的持续回归测试：改 prompt、换模型、改 RAG、加工具，都要重跑样本集。OpenAI 的评测最佳实践强调让评测聚焦具体任务，比如分类、成对比较或按明确标准打分。OpenAI 的 agent eval 文档把 traces、graders、datasets 和 eval runs 放在同一条质量闭环里；Anthropic 也强调，评测 Agent 时不能只测模型，还要把 harness 和模型一起看，因为最终行为是两者共同作用的结果。

这也是为什么稳定评测环境很重要。共享状态、缓存、网络抖动、权限差异都会污染回归结果。OpenTelemetry 的 GenAI 语义约定说明业界正在尝试标准化 AI 应用观测，但这类约定仍在演进，写系统时不能把“有 trace”误解成“已经会治理”。

## 常见误解

第一，公开榜单不是你的验收标准。你的系统需要自己的任务集、失败集和边界样本。

第二，模型当裁判不是绝对真理。它适合辅助比较和打分，但关键场景仍要抽样人工复核。

第三，只记录最终答案不够。Agent 出错时，必须看到它查了什么、调了什么工具、在哪一步偏了。

## 小练习

给“自动整理会议纪要”设计一组 eval 样本，先想清楚这几件事：

1. 哪些是正常会议？
2. 哪些是噪声、打断或多人混说？
3. 哪些必须人工判分？
4. 哪些字段可以自动检查？
5. 换模型前后要比较哪些成本和延迟？

## 公开资料

- [Evaluation Best Practices - OpenAI API](https://developers.openai.com/api/docs/guides/evaluation-best-practices)
- [Evaluate Agent Workflows - OpenAI API](https://developers.openai.com/api/docs/guides/agent-evals)
- [Demystifying Evals for AI Agents - Anthropic](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
- [Tracing - OpenAI Agents SDK](https://openai.github.io/openai-agents-python/tracing/)
- [OpenTelemetry Semantic Conventions](https://github.com/open-telemetry/semantic-conventions)
