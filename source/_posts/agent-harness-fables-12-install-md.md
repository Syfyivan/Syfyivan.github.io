---
title: "Agent Harness 寓言课 12：给工匠看的第二张图纸"
date: 2026-06-18 11:31:00
description: "用两张图纸解释 README 与 Install.md 的读者差异，以及面向 Agent 的可执行文档怎么写。"
tags: [AI Agent, Install.md, AGENTS.md, Documentation, 寓言课]
categories: [技术笔记, Agent Harness 寓言课]
---

木匠铺有两张图纸。

第一张挂在门口，给客人看：这张桌子为什么好、木料来自哪里、适合放在哪种房间。

第二张放在工台上，给工匠看：先量哪条边，用几号刨子，什么时候停下来问师傅，完工标准是什么。

客人看第二张会嫌啰嗦，工匠看第一张会误工。

两张图纸都重要，但读者不同。

## 故事里的机制

`README.md` 是给人读的项目介绍。它可以讲背景、截图、路线图、贡献指南。

`Install.md` 是给 Coding Agent 读的执行契约。它不需要写得像文章，而要写得像任务说明：

```text
Goal
Success Criteria
Operating Rules
Steps
TODO
Stop Conditions
```

原始材料用 DeerFlow 的 `Install.md` 做例子。公开仓库里也能看到这种趋势：安装文档不只是“命令列表”，而是在告诉 Agent 如何安全地把项目跑起来。

## 为什么不能只在 README 加一节

因为 Agent 不一定会读到那一节。

长 README 里夹一个 “For Agents”，就像把工匠图纸塞进宣传册第 19 页。Agent 可能先读开头、扫目录、猜安装方式，然后按通用套路开干。

单独的 `Install.md` 有两个好处：

- 文件名就是路标，Agent 更容易选中。
- 内容可以完全围绕执行，少讲背景，多讲边界。

## Operating Rules 最重要

人类会默认知道“不要覆盖我的配置”“不要把 API key 打印出来”“不要随便 sudo”。Agent 不一定。

所以这些规则要明写：

- 不要覆盖已有配置。
- 不要读取或输出 `.env` 里的密钥。
- 不要使用 `sudo`，除非用户明确要求。
- 优先使用可回滚路径。
- 失败时报告卡点，不要硬猜。

这些不是礼貌建议，是安全边界。

## 成功标准要可验证

“装好了”太模糊。更好的写法是：

```text
服务在本地端口启动
健康检查返回 200
示例命令能跑通
生成文件位于 output/
未修改用户已有配置
```

Agent 需要 stop condition。没有停止条件，它就会继续试、继续改、继续扩大副作用。

## 今天的练习

给你的项目写一个最小 `Install.md`，只写六段：

```text
# Project Install for Coding Agents
## Goal
## Success Criteria
## Operating Rules
## Steps
## Stop and Report
```

不要追求长，先追求可执行、可验证、可停下。

## 公开资料

- [DeerFlow Install.md](https://github.com/bytedance/deer-flow/blob/main/Install.md)
- [Sandbox Agents - OpenAI API](https://developers.openai.com/api/docs/guides/agents/sandboxes)
- [The next evolution of the Agents SDK - OpenAI](https://openai.com/index/the-next-evolution-of-the-agents-sdk/)
