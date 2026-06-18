---
title: "AI 与 Agent 大寓言课 06.12：给工匠看的第二张图纸"
date: 2026-06-18 11:31:00
description: "第六讲 Agent Loop 与 Harness 的第十二章：README 给人读，Install.md 给执行者读，安装文档正在变成可执行契约。"
tags: [AI Agent, Install.md, AGENTS.md, Documentation, 寓言课]
categories: [技术笔记, AI 与 Agent 大寓言课, Agent Loop 与 Harness]
---

木匠铺有两张图纸。

第一张挂在门口，给客人看：这张桌子为什么好，木料来自哪里，适合放在哪种房间。

第二张放在工台上，给工匠看：先量哪条边，用几号刨子，什么时候停下来问师傅，完工标准是什么。

客人看第二张会嫌啰嗦，工匠看第一张会误工。

两张图纸都重要，但读者不同。

> 所属路径：AI 与 Agent 大寓言课 / 第 06 讲：会自己绕圈的工坊 / Harness 101 / 06.12 专为 Agent 设计的 Install.md

## 概念揭晓

这个故事讲的是 `Install.md`：一份专门给 Coding Agent 读取和执行的项目安装契约。

`README.md` 像挂在门口的介绍图纸，服务对象是愿意读项目背景、截图、路线图和贡献指南的人。`Install.md` 像工台上的施工图，服务对象是要代替用户执行安装流程的 Agent。它不该写成项目宣传文章，而应该写成可执行、可验证、可停下的任务说明。

原文用 DeerFlow 的安装实践做例子：当用户不再打开 README 手动照做，而是对 Coding Agent 说“帮我装一下”，项目就需要把维护者脑子里的隐性判断写成显式规则。否则 Agent 会靠通用经验猜：猜用 Docker 还是本地环境，猜能不能覆盖配置，猜服务要不要拉起来，猜什么时候算成功。

## 本章目录

- 两个文件，两类读者：README 和 Install.md 为什么并存。
- 第一行声明读者身份：让 Agent 立刻知道这份文件是给自己读的。
- 写 Goal，不写背景介绍：安装任务要有目标和路径优先级。
- Success Criteria：把“装好了”写成可检查的停止条件。
- Operating Rules：把幂等、安全、权限和密钥边界写明白。
- Steps 与 TODO：把教程改成决策树和可恢复清单。
- 停在哪一步：安装边界不是运行边界。
- 谁来写：让 Agent 真实跑一遍，再把坑写回文档。
- 常见反对意见：README 小节、聪明模型、AGENTS.md、DRY 漂移。

## 两个文件，两类读者

新一代项目读者至少有三类：不会写代码但想跑开源项目的人，懂一点工具链但遇到环境问题会卡住的初级开发者，以及读得懂但不想亲手折腾的资深开发者。三类人表面不同，入口却越来越像：不是打开 README 逐行读，而是让 Coding Agent 帮自己安装。

读者入口变了，文档就要分叉。`README.md` 继续服务人类：它可以讲为什么做这个项目、看起来什么样、怎么贡献、未来路线是什么。`Install.md` 服务 Agent：它要告诉执行者目标、优先路径、成功标准、不能越过的边界，以及失败时应该怎么报告。

所以 `Install.md` 不是 README 安装小节的复制版。复制命令只能解决“要跑什么”，解决不了“什么时候该停”“哪些配置不能覆盖”“哪条路径副作用更小”“失败后是否允许扩大操作范围”。这些判断对人类读者是常识，对 Agent 却必须写成契约。

## 第一行声明读者身份

`README.md` 默认给人看，第一行可以是项目名、logo 和一句口号。`Install.md` 不能这样开头。Agent 打开一个陌生文件时，先要判断“这是不是我该执行的说明”，如果开头是项目背景，它可能把这份文件当成普通介绍，然后回到自己的通用安装套路。

更稳的写法是开门见山：这份文件给 Coding Agent 阅读；如果仓库还没有 clone，先 clone；之后从仓库根目录继续。第一句话完成两件事：锁定读者身份，锁定起手位置。

这和系统提示词的第一层很像。不是先讲背景，而是先讲角色和任务边界。对于安装文档，这一点尤其重要，因为安装动作天然带副作用：写配置、装依赖、拉容器、开端口、读取环境变量。读者身份不清楚，后面的安全规则也很难稳定生效。

## 写 Goal，不写背景介绍

安装文档的目标不是让 Agent 爱上项目，而是让它完成一个有边界的任务。`Goal` 段应该短，最好只回答三个问题：

- 要把工作区带到什么状态。
- 默认优先选择哪条安装路径。
- 为什么这条路径风险更低。

例如一个项目同时支持 Docker 和本地环境，`Goal` 里就应该写明默认优先 Docker，原因可能是依赖隔离更好、回滚更简单、不会污染用户系统。不要指望 Agent 自己判断维护者偏好。它能推理，但它不知道项目维护者对副作用、速度和可恢复性的权衡。

这也是 `Install.md` 和普通教程的差异。教程会解释来龙去脉，安装契约要把选择压成可执行策略。

## Success Criteria：把“装好了”钉死

“装好了”是一个危险的模糊词。容器初始化成功算装好吗？依赖安装完成算装好吗？服务已经启动并返回 200 才算吗？这三种标准对应完全不同的操作范围。

`Success Criteria` 的作用，就是把停止条件写出来。比如：

```text
config.yaml exists.
Docker prerequisites are prepared, but app services are not assumed to be running.
Local dependency check passed or reported no missing prerequisites.
The user receives the exact next command to launch the project.
```

这里最值得注意的是“不要假设服务已经跑起来”。安装边界和运行边界不一样。安装阶段准备环境，运行阶段可能会启动长期进程、占用端口、消耗额度、读取密钥。把两者混在一起，Agent 就可能在用户没有准备好时把服务长期挂起。

## Operating Rules：安全边界不是礼貌建议

`Operating Rules` 是 `Install.md` 最像 system prompt 的部分。它应该把维护者不希望 Agent 做的事写得非常直白：

- 重跑文档必须幂等，不得破坏已有环境。
- 优先使用项目已有命令，不要临时拼野命令。
- 未经用户明确同意，不要使用 `sudo` 或安装系统包。
- 不要覆盖已有用户配置。
- 不要读取或输出 `.env`、token、API key 等密钥材料。
- 某一步失败时停下，解释阻塞点，给最小下一步。

这些规则不是“最好这样”，而是“不能越界”。很多安装事故不是模型不聪明，而是模型缺少项目语境。它不知道 `config.yaml` 里可能有用户手工调好的模型路由，也不知道某个命令会拉起后台服务跑一夜，更不知道 `.env` 一旦进入上下文就可能出现在日志或 trace 里。

把安全边界写进文档，本质上是把维护者脑中的默认假设转成 Agent 可读的约束。

## Steps 与 TODO：教程要变成决策树

人类安装教程通常是线性的：第一步、第二步、第三步，遇到问题自己判断。Agent 更需要的是决策树：

- 如果 Docker 可用，走 Docker 初始化。
- 如果 Docker 不可用，再走本地依赖检查。
- 如果配置缺失，先生成默认配置。
- 如果缺少密钥，只报告缺失项和获取方式，不读取密钥文件。
- 如果步骤失败，停下并说明最小恢复动作。

这种分叉对人显得啰嗦，对 Agent 却是必要条件。因为它不是“读懂后自己取舍”，而是在执行过程中不断选择下一步。

`TODO` 清单则解决另一个问题：长任务容易丢状态。安装流程一旦超过五六步，Agent 就需要一份可勾选的状态机。好的 `TODO` 不只是给人看的进度条，也是让 Agent 在中断、恢复、回放时知道自己做到了哪里。

## 停在哪一步要说清楚

最容易被忽略的是显式停止。Agent 默认会朝目标继续推进，安装完依赖后可能顺手启动服务，启动失败后可能去改配置，改配置失败后可能搜索网页，最后越走越远。

所以 `Install.md` 末尾应该告诉它：完成安装边界后停止，报告状态，不要进入无关项目工作。这里的“停止”不是形式主义，它是在限制副作用。安装文档只负责把项目带到可启动状态，不负责替用户开始长期运行、验证业务密钥或部署环境。

把这件事写清楚以后，Agent 的行为就从“我帮你一直做下去”变成“我做到这条边界，然后把下一步交给你确认”。

## 谁来写：让 Agent 跑一遍再回写

原文里最有价值的建议之一是：给 Agent 读的文档，最好让 Agent 参与写。

原因很简单。人写文档时会省略自己习惯里的前置条件，例如本机已经有 Docker、某个命令失败时要看哪个日志、配置文件不能覆盖、服务启动前要先准备 API key。Agent 在真实安装现场会碰到这些摩擦点。让它跑一遍、失败一遍、总结一遍，再由人审稿，反而更容易写出稳的 `Install.md`。

这个循环可以这样跑：

1. 让 Agent 在干净环境里尝试安装。
2. 收集它卡住、猜错、越界、误判成功的地方。
3. 把这些点写入 `Operating Rules`、`Steps`、`Success Criteria`。
4. 人类维护者审查安全边界和命令准确性。
5. 再让另一个 Agent 复跑，直到步骤稳定。

这不是让文档“AI 味更重”，而是让文档记录真实执行摩擦。

## 常见反对意见

第一种反对是：README 里加一节 “For Agents” 不就行了吗？问题是长 README 的后半段不一定进入上下文，而且给人读的叙述和给 Agent 执行的命令会互相污染。单独文件比单独小节更容易被选中，也更容易保持执行契约的密度。

第二种反对是：现在的 Coding Agent 已经够聪明，不需要这份文件。答案是，能猜出来不等于一次装对。幂等性、安全边界和停止点不是智力问题，而是维护者语境。没有写出来，Agent 就只能按通用经验冒险。

第三种反对是：已经有 `AGENTS.md`、`CLAUDE.md`、`.cursorrules`，再来 `Install.md` 会碎片化。关键在作用域不同：前几类文件多是仓库内工作规则，默认 Agent 已经进入项目并要写代码；`Install.md` 是首次安装契约，甚至要指导还没 clone 仓库的外部 Agent 怎么进门。

第四种反对是：多一份文件违反 DRY，会和 README 漂移。这里不该追求两份文档完全一致。README 负责介绍，Install.md 负责执行；真正应该复用的是命令来源，例如都指向同一个 `Makefile`、`package.json` 或官方安装脚本，而不是把两类读者塞进一篇文章。

## 原文对应

这篇覆盖了 Feishu 原文《Harness 101：专为 Agent 设计的 Install.md》的这些大段：

- “两个文件，两类读者”：用户入口从读 README 迁移到让 Agent 代装。
- “Install.md 应该怎么写”：身份声明、Goal、Success Criteria、Operating Rules、Steps、TODO、EXECUTE NOW。
- “给 AI 读的文档，应该由 AI 写”：用真实安装反馈回写契约。
- “FAQ”：README 小节、智能模型、AGENTS.md/CLAUDE.md/.cursorrules、DRY 漂移四个反对意见。

## 今天的练习

给你的项目写一个最小 `Install.md`，只写七段：

```text
# Project Install for Coding Agents
This file is for coding agents.

## Goal
## Success Criteria
## Operating Rules
## Steps
## TODO
## Stop and Report
```

写完以后，不要自己检查第一遍。让一个 Agent 按这份文档跑一次，再把它卡住和误解的地方补回文档。

## 公开资料

- [DeerFlow Install.md](https://github.com/bytedance/deer-flow/blob/main/Install.md)
- [AGENTS.md](https://agents.md/)
- [Claude Code memory docs](https://docs.anthropic.com/en/docs/claude-code/memory)
- [Claude Code hooks reference](https://docs.anthropic.com/en/docs/claude-code/hooks)
