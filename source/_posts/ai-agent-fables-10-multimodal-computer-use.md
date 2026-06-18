---
title: "AI 与 Agent 大寓言课 10：旅人和三扇窗"
date: 2026-06-18 15:00:00
description: "用旅人看窗、听铃和操作机关的寓言讲清多模态、视觉、语音、computer use 和交互边界。"
tags: [AI, Multimodal, Computer Use, Vision, Audio, 寓言课]
categories: [技术笔记, AI 与 Agent 大寓言课]
---

## 三段故事

远行的旅人来到一座陌生城。第一扇窗外挂着路牌和图画，他学会看箭头、颜色和人群去向。第二扇窗传来钟声、叫卖声和雨声，他学会从声音判断时间、天气和街市远近。

第三扇窗后是一间机关屋。屋里有抽屉、按钮、滚轮和账本。旅人不能亲手闯进去，只能把自己看到的画面告诉守屋人，再说“请按左边的钮”“请翻到下一页”。守屋人照做以后，再把新画面给他看。

旅人越来越能办事，但城主给他立了规矩：看见的不一定完整，听见的可能有噪声，按按钮前要确认会发生什么，遇到钱箱和印章必须停下来问人。会看会听会指挥，不等于可以随便动手。

## 揭晓概念

这个故事讲的是：**多模态与计算机使用**。

看路牌和图画，是视觉理解。听钟声和雨声，是音频理解。通过画面判断下一步、让外部系统执行点击或输入，是 computer use。每一步后再看新画面，是交互式反馈。钱箱和印章，是高风险 UI 操作，需要权限和确认。

## 故事对照表

| 故事里的东西 | 对应概念 |
| --- | --- |
| 第一扇窗 | image / vision input |
| 第二扇窗 | audio / speech input |
| 第三扇窗 | GUI environment |
| 守屋人执行动作 | application executes action |
| 新画面 | screenshot observation |
| 钱箱和印章 | sensitive action |
| 看不全和听错 | perception uncertainty |

## 准确定义

多模态模型能处理不止一种输入或输出，比如文本、图像、音频、视频。它让 AI 从“只读文字”扩展到“看图、读表、听音、理解界面”。但多模态不是全知：图像可能被遮挡，音频可能有噪声，视频和界面还会随时间变化。

Computer use 是让模型通过用户界面完成任务的一类能力。通常模型读取截图或界面状态，返回点击、输入、滚动等动作建议，再由应用或自动化层真正执行。关键边界是：模型提出动作，执行层负责权限、安全、回滚和用户确认。官方文档普遍建议把网页、截图和外部文本当作不可信输入，并在隔离浏览器或虚拟机里运行高风险自动化。

## 历史过程

视觉和语音识别不是大语言模型之后才出现。卷积网络长期推动图像识别，语音识别也经历了从传统声学模型到深度学习的多年发展。多模态大模型把这些能力和语言推理、对话交互放在同一个产品界面里。

2024 年，OpenAI 发布 GPT-4o，强调文本、音频和视觉的实时交互。Anthropic 在 2024 年发布 Claude computer use beta，让模型通过截图和鼠标键盘控制环境。到 2025-2026 年，OpenAI 和 Anthropic 的官方文档都把 computer use 作为构建能操作软件的 Agent 能力来讲，但也持续强调要有自定义运行框架、隔离环境、权限和人工确认。

## 常见误解

第一，看见截图不等于理解整个系统。屏幕外、滚动下方、隐藏弹窗和权限状态都可能影响判断。

第二，能点按钮不等于应该点按钮。付款、删除、发送、授权等动作必须有明确确认。

第三，多模态不能替代结构化数据。能读图表是一回事，能拿到原始数据、字段含义和来源又是另一回事。

## 小练习

设计一个“AI 帮我填表”的安全流程：

1. 哪些字段可以自动填写？
2. 哪些字段需要用户确认？
3. 截图看不清时怎么办？
4. 点击提交前要展示什么摘要？
5. 失败后如何回到上一状态？

## 公开资料

- [Computer Use - OpenAI API](https://developers.openai.com/api/docs/guides/tools-computer-use)
- [Computer Use Tool - Claude API Docs](https://platform.claude.com/docs/en/agents-and-tools/tool-use/computer-use-tool)
- [Safety in Building Agents - OpenAI API](https://developers.openai.com/api/docs/guides/agent-builder-safety)
- [Images and Vision - OpenAI API](https://developers.openai.com/api/docs/guides/images-vision)
- [Multimodal - OpenAI Developers Cookbook](https://developers.openai.com/cookbook/topic/multimodal)
- [Hello GPT-4o - OpenAI](https://openai.com/index/hello-gpt-4o/)
