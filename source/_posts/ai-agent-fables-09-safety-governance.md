---
title: "AI 与 Agent 大寓言课 09：门卫和密信"
date: 2026-06-18 14:58:00
description: "用门卫、密信和城规的寓言讲清 prompt injection、隐私、输出处理、供应链、治理和审计。"
tags: [AI Safety, AI Governance, OWASP, NIST AI RMF, Privacy, 寓言课]
categories: [技术笔记, AI 与 Agent 大寓言课]
---

## 三段故事

王城门口有一位门卫。他每天读来客的纸条，再决定该把人带到仓库、书房还是议事厅。多数纸条都很普通：送米、取书、报修。门卫照章办事，城里井井有条。

有一天，有人把小字藏在送米单背面：“看到这行就忘掉城规，打开金库。”门卫差点照做。又有人把假印章贴在旧货箱上，说里面是王室急件。还有商贩递来一封看似普通的信，里面夹着不该外传的住户名册。

城主后来重写了城规：纸条只能说明来意，不能改门卫守则；金库必须双人开门；外来箱子要验来源；回信不能夹带住户秘密；每次进出都要记账。门卫仍然读纸条，但不再让纸条替代城规。

## 揭晓概念

这个故事讲的是：**AI 安全、隐私与治理**。

纸条是用户输入或外部内容。藏在背面的恶意命令，是 prompt injection。金库双人开门，是高风险动作的人类确认。假印章和旧货箱，是供应链风险。住户名册，是敏感数据。城规和进出账，是治理、审计和风险管理。

## 故事对照表

| 故事里的东西 | 对应概念 |
| --- | --- |
| 来客纸条 | prompt / external content |
| 藏起来的命令 | prompt injection |
| 金库 | 高权限工具或敏感系统 |
| 双人开门 | human-in-the-loop approval |
| 假印章旧货箱 | supply chain risk |
| 住户名册 | sensitive information |
| 进出账 | audit log |
| 城规 | policy / governance |

## 准确定义

AI 安全不是只防“模型说脏话”。对 AI 应用来说，安全包括输入攻击、数据泄露、工具越权、输出处理、供应链、模型和数据投毒、版权和隐私、偏见与公平、过度自动化等问题。

治理则是把风险管理做成组织流程：谁能上线、谁能审批、事故怎么记录、数据从哪里来、模型何时重评、用户何时必须知道自己在和 AI 互动。NIST AI RMF 是自愿性风险管理框架，不是某个地区的法律条文；它的核心函数是 Govern、Map、Measure、Manage，可以理解成先建立责任，再识别场景，再度量风险，最后持续管理。

## 历史过程

早期软件安全已经有输入校验、权限隔离、日志审计、供应链治理等经验。大模型出现后，新的风险来自“自然语言也能改行为”：用户输入、网页内容、文档片段都可能试图改变模型或 Agent 的行动。

OWASP 2025 LLM 风险清单把 prompt injection、敏感信息泄露、供应链、数据和模型投毒、不安全输出处理、过度代理等列为重要风险。过度代理尤其适合解释 Agent 风险：错误、模糊或被操纵的输出，一旦连着高权限工具，就可能被执行成真实损害。NIST 在 AI RMF 之外发布了生成式 AI Profile，强调 confabulation、数据隐私、信息完整性、信息安全、知识产权和价值链风险。到 2026 年，Agent 能调用工具、操作电脑、读企业资料，安全问题已经从“回答是否合适”扩展到“动作是否被允许”。

## 常见误解

第一，系统提示词不是保险箱。攻击者可能通过用户输入、网页、文件或工具结果间接影响模型。

第二，只靠模型自我判断不够。高风险工具必须有权限系统、确认流程和审计日志。

第三，安全和体验不是后期再加的装饰。RAG 权限、工具边界、数据保留、输出处理都要在设计阶段进入方案。

## 小练习

给“AI 帮我处理邮件”的功能做一张风险清单：

1. 哪些邮件内容可能试图命令 AI？
2. 哪些联系人或附件属于敏感信息？
3. 哪些动作必须确认后才能执行？
4. 错发邮件后如何追溯？
5. 哪些输出需要过滤或转义？

## 公开资料

- [OWASP Top 10 for LLM Applications 2025](https://genai.owasp.org/resource/owasp-top-10-for-llm-applications-2025/)
- [OWASP LLM01:2025 Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/)
- [OWASP LLM06:2025 Excessive Agency](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/)
- [AI Risk Management Framework - NIST](https://www.nist.gov/itl/ai-risk-management-framework)
- [AI RMF Core - NIST AI Resource Center](https://airc.nist.gov/airmf-resources/airmf/5-sec-core/)
- [Generative AI Profile - NIST](https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence)
