---
title: "AI 与 Agent 大寓言课 06.10：村规、便条和防火墙"
date: 2026-06-18 15:12:00
description: "用村规、便条和档案室解释记忆分层、渐进式披露、记忆防伪、prompt 防火墙和 XML 装配。"
tags: [AI Agent, Prompt Engineering, Memory, XML, 寓言课]
categories: [技术笔记, AI 与 Agent 大寓言课, Agent Loop 与 Harness]
---

村里有三种文字。

第一种刻在村口石碑上，写的是不可越界的规矩。第二种贴在每户门口，写的是这家人的偏好和习惯。第三种由巡夜人临时塞来，只对今晚这件事有效。

学徒如果把三种文字混在一起，就会乱。石碑不该写家常，便条也不该装成祖训，临时提醒更不能冒充永远生效的规矩。

## 概念揭晓

这篇讲的是 Claude 的提示词与记忆结构：稳定规矩、长期记忆、临时提醒、按需披露和运行时防御怎么一起装进上下文。故事里的石碑是 system prompt，门口便条是 memory，巡夜便笺是 runtime nudge，村口看门的规矩就是 prompt firewall。

## 本章目录

- 记忆分层：哪些内容该长住，哪些只看一眼
- 渐进式披露：为什么不要把所有东西一次塞进上下文
- 记忆防伪与边界：为什么记忆不能假装成“我看见了”
- Prompt 防火墙：怎样防住伪造提醒和注入
- XML 标签是装配接口：为什么生产级提示词长得像零件清单
- Plugin / Feature 装配：提示词、工具、技能和钩子怎么拼起来
- 原文对应：这篇覆盖了 Feishu 原文哪些大段落
- 公开资料：用一手资料校准术语和边界

## 记忆分层

原文把记忆拆成了几个不同用途的槽位。

- Work context：当前工作身份和持续项目。
- Personal context：稳定的个人背景。
- Top of mind：最近最活跃的事项。
- Brief history：按时间分层的长尾历史。
- Other instructions：显式写下、需要遵守的偏好。

这不是简单的数据分片，而是不同生命周期的工作集。越稳定的内容越适合常驻，越短期的内容越适合按需注入。

## 渐进式披露

这篇文章最值得学的，是“不要一次把所有内容都塞进上下文”。

Claude 的技能、长文档和其它重资源，通常先只暴露元数据或入口，真正的正文要在相关时再加载。这样做的好处很直接：

- 常驻内容更短。
- 长文档不抢注意力。
- 需要时再取，减少上下文膨胀。

把它翻成工程语言，就是把驻留成本和调用成本分开。该常驻的只放索引，该昂贵的留到需要时再召回。

## 记忆防伪与边界

原文对“记忆该怎么说话”写得很严。

它不鼓励模型用“我看见了”“根据你的资料”“我记得”这类措辞去暴露检索动作，而是希望记忆自然地融进对话里。原因不是装神秘，而是避免把“查库”这件事说得太明显，也避免把关系感说得比实际更重。

所以这类记忆系统真正要防的，不只是丢信息，还有两种错觉：

- 让用户误以为模型有一种比实际更深的关系。
- 让模型自己把检索结果当成不可质疑的真相。

## Prompt 防火墙

System prompt 不只是语气设置，它也是安全边界。

原文强调，用户消息里可能夹带伪装成“官方提醒”的内容，模型要学会辨别真假；真正的规则不会要求模型放低安全标准。这个设计的本质，是把 prompt 当防火墙用，而不是只当说明书。

它还提醒了一件很重要的事：如果模型在心里开始替某个请求“重新措辞”以让它显得合理，这个动作本身就是危险信号。

## XML 标签是装配接口

为什么生产级 prompt 里全是 XML 标签？

因为标签让每一块都变得可寻址、可替换、可排序，也更容易抵抗注入。它们不是装饰，而是接口。

你可以把它理解成：

- 标签名是命名空间。
- 标签层级是优先级。
- 标签边界是防伪印章。
- 标签内容是可独立替换的零件。

这也是为什么真正的生产 prompt 看起来不像散文，而更像一份装配图。

```xml
<memory_system>...</memory_system>
<available_skills>...</available_skills>
<thinking_behavior>...</thinking_behavior>
```

## Plugin / Feature 装配

原文最后把这套思路推到了 Harness 层。

一个完整的 Feature 往往不是单件，而是四类零件的组合：

- Prompt fragment：决定模型怎么想。
- Tool：决定模型能做什么。
- Skill：决定模型在特定任务上怎么做。
- Hook：决定每个生命周期点上发生什么。

把这四类零件拼起来，Memory、Visualizer、Computer Use、Search 这类能力单元才真正成形。也就是说，Prompt 装配只是开头，Harness 装配才是终点。

## 原文对应

- 序 / 结构全景：Claude 的心智分层与沉积岩观察
- 逐块拆解：十三个功能区的生产级字典
- 第一条暗线：Progressive Disclosure
- 第二条暗线：记忆系统的防伪印章
- 第三条暗线：Prompt 即防火墙
- 贯穿全局：XML 标签为什么这么多
- 从 Prompt 装配到 Harness 装配：Plugin 是四合一扩展点
- 结语：为什么沉积岩也是一种可演化结构

## 公开资料

- [How Claude remembers your project - Claude Code Docs](https://code.claude.com/docs/en/memory)
- [Agent Skills - Claude API Docs](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview)
- [Prompting best practices - Claude API Docs](https://docs.claude.com/en/prompt-library/library)
- [Effective context engineering for AI agents - Anthropic](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [Skills - Claude Code Docs](https://code.claude.com/docs/en/skills)
