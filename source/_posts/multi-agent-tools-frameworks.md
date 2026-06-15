---
title: "多 Agent 编排 08：工具与框架地图，以及在 Claude Code 里落地"
date: 2026-06-15 20:50:00
tags: [多Agent, LangGraph, CrewAI, AutoGen, Claude Code, 框架对比]
categories: [技术笔记, 多Agent编排]
---

最后一篇落到工具：市面上的多 Agent 框架有哪些、各自什么风格，以及怎么在 Claude Code 里真正把一个多 agent 编排跑起来。

## 框架地图：先按“编排风格”分类

挑框架别只看 star 数，先看它**怎么表达编排**——是写图、写角色、还是写对话。下面是截至 2026 年中的快照（版本号会漂移，以官方 release 为准）。

| 框架 | 编排风格 | 并行子 agent | 一句话定位 |
| --- | --- | --- | --- |
| **LangGraph**（LangChain） | 图：节点 + 边 + 共享状态 | ✅ `Send` API | 底层、可持久化、能恢复，面向生产长任务，控制力最强但学习曲线陡 |
| **CrewAI** | 角色 Crews + 事件 Flows | ✅ async | 轻量、独立于 LangChain，角色化分工直观 |
| **Microsoft Agent Framework (MAF)** | 图式 workflow + handoff | ✅ 一等公民 | 微软官方继任者，合并了 AutoGen + Semantic Kernel |
| **OpenAI Agents SDK** | Handoffs + agents-as-tools | ✅ asyncio | OpenAI 生产级、供应商无关，Swarm 的正式继任 |
| **AutoGen / AG2** | 对话式 GroupChat | ✅ / 部分 | 对话驱动；注意一分为三（见下） |
| **Semantic Kernel** | 5 模式统一 API | ✅ Concurrent | 企业 SDK，现已并入 MAF |
| **MetaGPT** | SOP 角色流水线 | ❌ 核心串行 | 把 agent 组织成“软件公司”，纪律强但流水线僵 |
| **Dify / n8n** | 可视化工作流画布 | ✅ 并行分支（有上限） | 低代码平台，集成广，适合拼装而非精细控制 |

几个容易踩的坑：

- **AutoGen 一分为三**：原 `microsoft/autogen`（已维护模式）、创始人出走后的社区 fork **AG2**、微软合并 SK 后的官方继任 **MAF（2026-04 GA）**。别再把它们当一个东西。
- **OpenAI Swarm 已弃用**：它是实验/教学项目、**不支持并行子 agent**，官方让你用 **Agents SDK**。
- **串行 vs 并行**：MetaGPT、Magentic-One 这类是中心化串行循环，不要指望它们像 LangGraph/MAF 那样真并行扇出。

## 选型的三句话

- 要**生产级、可持久化、能断点恢复**的长任务 → LangGraph 或 MAF。
- 要**快速搭角色化团队**、轻量 → CrewAI。
- 已经在 **OpenAI / 微软生态**里 → 直接用 Agents SDK / MAF。
- 只是想**在 AI 编程助手里编排**（不写应用） → 往下看 Claude Code。

## 在 Claude Code 里怎么落地

如果你的目标不是写一个独立应用，而是“让 AI 编程助手同时开很多 agent 干活”（就是那张截图），Claude Code 提供三个层次：

**① 直接调子 agent（最轻）**

让主 agent 派几个子 agent 并行处理独立子任务。要点是第 04 篇说的——子 agent 只通过一段 prompt 接收任务、只回传最终摘要，所以**需要的文件路径、上下文要显式写进 prompt**。

**② Workflow 工具（确定性编排，截图就是它）**

要协调几十到几百个 agent、要循环/条件/扇出，就把编排逻辑写成脚本，常见三个原语：

```text
agent(prompt, {schema})   单个子 agent，可要求结构化输出
parallel([t1, t2, ...])   并发跑一批，全部完成后返回（屏障）
pipeline(items, s1, s2)   每个条目独立流过多个阶段，无需等齐
```

一个“找 → 验 → 合成”的骨架（伪代码，对应截图的形状）：

```text
phase('Find')
findings = parallel(DIMENSIONS.map(d => agent(`审查维度：${d}`)))
phase('Verify')
verified = pipeline(findings, f => agent(`对抗式验证：${f}`))
phase('Synthesize')
report = agent(`去重合成 ≤15 条：${verified}`)
```

默认优先 `pipeline`（每条独立流动、不浪费等待），只有真需要“等齐所有结果再下一步”时才用 `parallel` 这种屏障。

**③ /code-review 等现成命令**

不想自己写脚本，直接用现成的多 agent 命令把强度拉到 max/ultra——截图里的 `code-review-max` 就是这种现成档位，底层仍是上面的 Workflow 编排。

## 落地四条铁律（把前七篇浓缩成动作）

1. **先问值不值**：可预测的任务用 workflow，别上多 agent（第 07 篇）。
2. **分工说清楚**：每个子 agent 给目标、输出格式、工具指引、清晰边界（第 07 篇反模式）。
3. **让脏活留在子 agent**：独立上下文探索，只回传摘要（第 04 篇）。
4. **两层并行 + 验证**：主管并发派 3–5 个子 agent、子 agent 再并发用多个工具；产出必须经验证再合成（第 05 篇）。

## 一句话总结

框架按编排风格选——图（LangGraph/MAF）、角色（CrewAI）、对话（AutoGen 系）、可视化（Dify/n8n）；生态绑定就跟生态走。而如果你只是想在 Claude Code 里复现那张截图，路径很短：子 agent → Workflow 脚本 → 现成的 `/code-review` 档位。工具会变，但这门课的四条铁律不变——**先问值不值、分工说清楚、脏活留在子 agent、并行后必验证。**

## 参考资料

- [LangGraph 官方仓库](https://github.com/langchain-ai/langgraph) ｜ [CrewAI](https://github.com/crewAIInc/crewAI)
- [Microsoft Agent Framework](https://github.com/microsoft/agent-framework) ｜ [OpenAI Agents SDK](https://github.com/openai/openai-agents-python)
- [Anthropic：Building agents with the Claude Agent SDK](https://claude.com/blog/building-agents-with-the-claude-agent-sdk)（2025-09-29）
- [Claude Agent SDK：Subagents in the SDK](https://code.claude.com/docs/en/agent-sdk/subagents)
