---
title: "AI 与 Agent 大寓言课 10：阿行和三扇窗"
date: 2026-06-18 15:00:00
description: "用阿行看窗、听铃、隔窗指挥驿站伙计的寓言讲清多模态、视觉、语音、computer use 和交互边界。"
tags: [AI, Multimodal, Computer Use, Vision, Audio, 寓言课]
categories: [技术笔记, AI 与 Agent 大寓言课]
---

## 三段故事

新学徒阿行跟着老向导远行，来到一座陌生城，城里有三扇窗。第一扇窗外挂着路牌和图画，老向导让他先认箭头、颜色和人群去向——学会看。第二扇窗传来钟声、叫卖声和雨声，他学着从声音判断时间、天气和街市远近——学会听。

第三扇窗后是一间驿站。窗里有抽屉、按钮、滚轮和账本，柜台后坐着个驿站伙计。阿行隔着窗够不着，只能把自己看到的画面说出来——“请按左边的钮”“请翻到下一页”——由驿站伙计照着去按，按完再把新画面端给他看。

阿行越来越能办事，老向导却给他立了规矩：看见的不一定完整，听见的可能有噪声，让人按钮之前要想清楚会发生什么，遇到钱箱和印章必须停下来回头问一声。会看会听会指挥，不等于可以随便动手。

## 揭晓概念

这个故事讲的是：**多模态与计算机使用**。

看路牌和图画，是视觉理解。听钟声和雨声，是音频理解。阿行隔窗判断下一步、说出动作让驿站伙计照着点按，是 computer use——出主意的和真动手的分作两边。每一步后再看新画面，是交互式反馈。钱箱和印章，是高风险 UI 操作，需要权限和确认。

## 故事对照表

| 故事里的东西 | 对应概念 |
| --- | --- |
| 第一扇窗 | image / vision input |
| 第二扇窗 | audio / speech input |
| 第三扇窗 | GUI environment |
| 驿站伙计执行动作 | application executes action |
| 新画面 | screenshot observation |
| 钱箱和印章 | sensitive action |
| 看不全和听错 | perception uncertainty |

## 准确定义

这一讲挑两个最核心的概念讲透。

**多模态模型**。一句定义：能处理不止一种输入或输出（文本、图像、音频、视频）的模型。直觉上，它让 AI 从“只读文字”扩展到“看图、读表、听音、理解界面”，把现实里大量非文本信息接了进来。一个具体例子：图像并不是整张原样塞给模型，而是被切成一格格固定大小的小块（patch），每块编码成一个 token，再和文字 token 排在一起处理——所以一张高分辨率图会消耗更多 token、更费钱，模型实际“看到”的也常是缩放压缩后的版本，这恰好解释了它为什么容易看不清照片里的小字。边界：多模态不是全知，图像可能被遮挡，音频可能有噪声，视频和界面还会随时间变化，能“看到”不等于“看准”。

**Computer use**。一句定义：让模型通过用户界面（而不是 API）完成任务的一类能力。直觉上，模型读取截图或界面状态，返回点击、输入、滚动等动作建议，再由应用或自动化层真正执行，相当于给模型配了一副“眼睛 + 鼠标键盘”。一个具体例子：一圈典型流程是——截一张屏，模型输出 `click(640, 480)`（点屏幕上横 640、纵 480 那个像素位置）或 `type("北京市…")`（敲入一段文字）这样的动作，外壳真去点、去敲，界面变了再截一张屏，如此往复；一旦视觉定位偏了几十像素，它就可能点到隔壁那个按钮。边界：模型只负责“提出动作”，执行层负责权限、安全、回滚和用户确认；官方文档普遍建议把网页、截图和外部文本当作不可信输入，并在隔离浏览器或虚拟机里运行高风险自动化。

至于视觉、语音、多模态 RAG、UI 失败模式等更细的概念，分章里各自展开。

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
