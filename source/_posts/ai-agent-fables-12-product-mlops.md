---
title: "AI 与 Agent 大寓言课 12：开店的城镇"
date: 2026-06-18 15:04:00
description: "用城镇开店的寓言讲清 AI 产品化、MLOps、LLMOps、部署、监控、成本、版本和基础设施。"
tags: [AI Product, MLOps, LLMOps, Infrastructure, AI Town, 寓言课]
categories: [技术笔记, AI 与 Agent 大寓言课]
---

## 三段故事

一群手艺人做出一盏会回答问题的灯。第一次摆在集市上，路人觉得新奇，问什么它都亮一亮。手艺人很高兴，以为从此只要多做几盏灯，就能开一家大店。

开店后麻烦来了。有人问灯不懂的方言，有人半夜来问，有人要查旧账，有人抱怨灯油太贵。几盏灯用的灯芯还不一样，同一句话有的答得好，有的答得差。店主这才发现，能做出一盏灯，不等于能经营一间店。

于是城镇建了灯油仓、修灯台、账本、巡检队和换灯芯规矩。每盏灯用过多少油、答错过哪些题、换过哪种灯芯、谁能看哪些账，都要记录。后来这家店不再靠新奇活着，而靠稳定、可追溯、可维护活着。

## 揭晓概念

这个故事讲的是：**AI 产品化、MLOps 与 LLMOps**。

会回答问题的灯，是模型能力。开店，是产品化。灯油仓和修灯台，是基础设施。账本和巡检队，是监控、评测和运维。灯芯版本，是模型、prompt、RAG、工具和数据版本。谁能看账，是权限和治理。

## 故事对照表

| 故事里的东西 | 对应概念 |
| --- | --- |
| 会回答问题的灯 | model / AI capability |
| 集市演示 | prototype / demo |
| 开店 | production product |
| 灯油 | compute cost |
| 灯芯版本 | model / prompt / data version |
| 旧账 | logs / replay data |
| 巡检队 | monitoring / evaluation |
| 谁能看账 | access control |

## 准确定义

AI 产品化是把模型能力变成可被用户长期依赖的产品。它包含需求、交互、数据、模型、提示词、检索、工具、权限、评测、部署、监控、成本和事故处理。模型只是其中一个部件。

MLOps 是把机器学习系统可靠交付到生产环境的一套流程和能力，通常包括数据管线、训练、验证、部署、监控和持续改进。LLMOps 可以理解为大模型应用里的类似实践，但多了 prompt、上下文、RAG、工具、Agent trace、模型供应商和安全治理等环节。相比 MLOps，LLMOps 这个词还更年轻，不同厂商拆法不同，所以更稳妥的写法是直接说明它要管理哪些对象。

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
