---
title: "AI 与 Agent 大寓言课 12：会开店的城镇"
date: 2026-06-18 15:04:00
description: "用学徒阿铺开饭馆的寓言讲清 AI 产品化、MLOps、LLMOps、部署、监控、成本、版本和基础设施。"
tags: [AI Product, MLOps, LLMOps, Infrastructure, AI Town, 寓言课]
categories: [技术笔记, AI 与 Agent 大寓言课]
---

## 三段故事

学徒阿铺练出一手好菜，第一次在集市上摆摊试卖。当天卖得火，路人尝过都叫好。他乐坏了，以为只要照着多做几桌，就能开一家天天满座的大饭馆。

正经开店后麻烦来了。有人点饭馆没学过的家乡菜，有人半夜来吃，有人要查上个月的旧账，有人嫌菜价太贵。后厨几个灶用的配方还不一样，同一道菜这桌做得好、那桌做得差。阿铺这才发现，做得出一手好菜，不等于经营得了一家饭馆。

于是阿铺给饭馆立起一整套规矩：备料的库房、统一的灶台、记账的账本、巡店尝菜的把关人，还有换配方、换供货商的章程。每道菜花了多少料钱、哪桌出过岔子、配方换过哪一版、谁能动账本进后厨，都要记录。后来这家饭馆不再靠一时新鲜活着，而靠稳定、可追溯、可维护活着。

## 揭晓概念

这个故事讲的是：**AI 产品化、MLOps 与 LLMOps**。

一手好菜，是模型能力。开饭馆，是产品化。备料的库房和统一的灶台，是基础设施。账本和巡店尝菜的把关人，是监控、评测和运维。配方版本，是模型、prompt、RAG、工具和数据版本。谁能动账本进后厨，是权限和治理。

## 故事对照表

| 故事里的东西 | 对应概念 |
| --- | --- |
| 一手好菜 | model / AI capability |
| 摆摊试卖 | prototype / demo |
| 开饭馆 | production product |
| 料钱 | compute cost |
| 配方版本 | model / prompt / data version |
| 旧账（账本） | logs / replay data |
| 巡店尝菜 | monitoring / evaluation |
| 谁能动账本进后厨 | access control |

## 准确定义

把这一讲的几个核心词讲透，剩下的次要词一句话带过。

**AI 产品化**。一句定义：把模型能力变成可被用户长期依赖的产品。直觉：模型只是一个部件，产品是需求、交互、数据、提示词、检索、工具、权限、评测、部署、监控、成本和事故处理拢在一起的整体。具体例子：一个 demo 答对了你挑的十个问题就让人惊艳，但同样的能力要做成产品，得扛住有人半夜来问、有人问的是还没收录的新政策、流量一冲账单翻到预算十倍、答错把退款规则说反引发投诉——这些没一个是“换更强的模型”能解决的。边界：所以产品化的难点几乎都不在模型本身，而在模型之外的系统工程和运营。

**MLOps**。一句定义：把机器学习系统可靠交付到生产并持续运维的一套流程和能力，通常含数据管线、训练、验证、部署、监控和持续改进。直觉：传统软件运维（业界叫 DevOps）只需管“会变的代码”，靠一套“改完自动测、测完自动发”的流水线（业界叫 CI/CD，即持续集成 / 持续交付）；而 ML 系统里数据会漂移、模型要重训、特征会变，于是在 CI/CD 之外多出一条 CT（continuous training，持续训练）。具体例子：一个信用评分模型上线时各项指标都好，三个月后用户结构漂移、线上拒绝率异常升高；监控发现漂移、自动触发重训、用验证集卡住变差的新模型、灰度放量（先放一小撮流量试、稳了再逐步推给所有人）、必要时回滚到上一版——这一整条闭环就是 MLOps。边界：它的核心负担不是“把模型部署上去”，而是管理“数据和模型都会变”带来的长期运维。

**LLMOps**。一句定义：大模型应用里类似 MLOps 的实践，但管理对象多了 prompt、上下文、RAG、工具 schema、Agent trace、模型供应商版本和安全治理。直觉：在大模型应用里你通常并不训练模型，“会变的源码”从训练数据换成了提示词、检索库、工具定义和供应商版本。具体例子：你把系统提示里一句“请简洁回答”改成“请详尽回答”，平均输出 token 直接翻倍，延迟和账单跟着涨，原本通过的回归用例开始因超长而失败——这次改动没动一行代码，却得像发版一样被记录、评测、灰度。这正是 LLMOps 要管的东西。边界：LLMOps 这个词还年轻、各家拆法不同，所以比起争定义，更稳妥的写法是直接说清它要管哪些对象。

## 历史过程

DevOps 让软件交付从手工发布走向 CI/CD、自动化部署和可观测性。机器学习系统加入后，团队发现代码不是唯一会变化的东西：数据会漂移，模型要重训，特征会变，评估和回滚也更复杂。Google Cloud 的 MLOps 文档把 CI、CD 和 CT 放到机器学习流水线中讨论。

大模型应用进一步扩大了生产问题。一个线上 AI 产品可能同时依赖模型版本、系统提示词、检索库、向量索引、工具 schema、安全策略和成本预算。云厂商的 AI 基础设施文档通常会把计算、存储、网络、向量检索、部署、监控和安全控制一起讨论。2026 年 Stanford AI Index 也显示，AI 已经不只是算法竞争，还牵涉数据中心、芯片、电力、投资和治理。真正的 AI 产品化，必须把模型能力接到可靠基础设施和组织流程上。

## 常见误解

第一，demo 能跑不等于产品能上线。真实用户会带来边界输入、权限问题、成本峰值和失败恢复。

第二，LLMOps 不是把 MLOps 名字换一下。大模型应用多了提示词、上下文、工具、RAG 和 Agent 行为链路。

第三，成本不是最后再算。模型选择、上下文长度、检索策略、缓存、并发和回放都会影响成本。

## 小练习

给“AI 客服助手”写一张上线前清单：

1. 哪些知识库和工具会被调用？
2. 怎么记录每次回答的来源？
3. 哪些问题要转人工？
4. 如何发现回答质量下降？
5. 如何限制单个用户或单次任务成本？

## 公开资料

- [MLOps: Continuous delivery and automation pipelines in machine learning - Google Cloud](https://docs.cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning)
- [Practitioners Guide to MLOps - Google Cloud](https://services.google.com/fh/files/misc/practitioners_guide_to_mlops_whitepaper.pdf)
- [AI and Machine Learning Resources - Google Cloud](https://docs.cloud.google.com/architecture/ai-ml)
- [The 2026 AI Index Report - Stanford HAI](https://hai.stanford.edu/ai-index/2026-ai-index-report)
- [Evaluation Best Practices - OpenAI API](https://developers.openai.com/api/docs/guides/evaluation-best-practices)
- [Agents SDK - OpenAI API](https://developers.openai.com/api/docs/guides/agents)
