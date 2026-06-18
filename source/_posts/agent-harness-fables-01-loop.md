---
title: "Agent Harness 寓言课 01：磨坊的水车为什么会自己转"
date: 2026-06-18 11:20:00
description: "用磨坊水车的故事理解 ReAct Loop、Harness 分层、单轮/多轮工具调用、Plan-then-Act、Coding Agent、Offloading 与 Skill。"
tags: [AI Agent, Agent Harness, ReAct, 寓言课]
categories: [技术笔记, Agent Harness 寓言课]
---

村口有一座磨坊。最早的时候，磨坊主每来一袋麦子，就亲手开闸、看水、推磨、装袋。一天只能磨几袋，人也累得不行。

后来他做了一只水车。水流来了，水车自己转；石磨听见齿轮响，就开始磨；米斗满了，木槌敲铃；磨坊主只要在铃响时检查成色，必要时调一下闸门。

村民说：“这磨坊成精了。”

磨坊主摇头：“不是成精，是我把重复动作做成了循环。水车会转，闸门会控，铃铛会报，账本会记；少了哪一件，它都不是一座能长期运转的磨坊。”

## 这一讲要学什么

这篇不是只讲一个比喻。寓言只是入口，真正要带走的是 Agent Harness 的第一张结构图。

先说明边界：下面这张图是我为了学习 Harness 画出的**课程分层**，不是 OpenAI、Anthropic 或某个框架发布的统一标准名词。公开资料能分别支撑其中的 agent loop、tools、handoff、human-in-the-loop、skills、tracing 和 evals，但把它们放成下面这张学习地图，是为了让初学者知道“先学哪一层，再学哪一层”。

- **Agent Loop**：模型观察、决定动作、读取结果、继续或停止的循环。
- **Tool Layer**：模型每一轮能调用哪些工具，以及工具 schema 怎么约束输入。
- **Context Layer**：每次模型调用前，到底把哪些历史、工具结果、提醒和记忆装进去。
- **Session Layer**：一次对话或任务的生命周期、消息历史和状态存储。
- **Orchestrator Layer**：单 Agent 不够时，怎样把 workflow、sub-agent 或 team 串起来。
- **Plugin / Hooks / Skills**：怎样在不改核心循环的情况下插入能力、规则和提醒。
- **Observability & Evals**：怎样记录轨迹、回放失败、做回归评测，让 Harness 能继续进化。

所以，Harness 不是“模型外面随便套一层壳”。它是一套让模型能持续行动、受控行动、可观察行动的工程外骨骼。

学习顺序也按这张图来：先懂 Loop，再懂 Tool；工具一多就要懂 Context；任务一长就要懂 Session；单个 Agent 不够就要懂 Orchestrator；能力爆炸后再看 Plugin、Hooks 和 Skills；最后用 trace 和 eval 检查它是不是真的变好了。

## 故事里的机制

Agent Loop 就像水车。一次普通模型调用像磨坊主亲手磨一袋麦子：用户输入进来，模型吐出结果，结束。

Agent Loop 不同。它让模型在一个循环里反复做三件事：

```text
观察当前状态
决定下一步动作
拿到动作结果后再观察
```

如果动作是查网页，结果就是网页内容；如果动作是读文件，结果就是文件片段；如果动作是跑测试，结果就是测试输出。模型不是一次性把路想完，而是在每一轮根据新证据修正方向。

这也是为什么“会调用工具”不等于“是 Agent”。真正的分界线在于：它是否能根据工具结果继续推进，直到达到停止条件。

## 最小 Loop 长什么样

把水车翻译成伪代码，最小 Agent Loop 大概是这样：

```python
messages = [{"role": "user", "content": user_input}]
iterations = 0

while True:
    iterations += 1
    response = llm.call(messages, tools=tools)
    messages.append(response)

    if not response.tool_calls or iterations > max_iterations:
        break

    results = run_tools_parallel(response.tool_calls)
    messages.extend(results)

return response.content
```

这里最关键的一行不是 `llm.call`，而是：

```python
if not response.tool_calls:
    break
```

也就是说，Harness 通常不替模型判断“资料够不够”。它只看这一轮模型有没有发出工具调用：有，就执行工具，把结果塞回上下文；没有，就把这轮回答当成最终结果。真正决定继续还是停止的，是模型这一轮的输出。

这和传统 workflow 很不一样。Workflow 像你提前画好水渠，水只能按图走；ReAct Loop 像水车根据每一轮结果继续转，下一步怎么走事先不一定写死。OpenAI Agents SDK 的运行文档也把这个 loop 描述成“调用模型、检查输出、如果有工具调用就执行并继续、没有更多工具工作就返回结果”的循环。

## 单轮 ReAct：天气预报

先看最小场景：用户问“北京今天冷吗？”模型自己并不知道今天的实时天气，所以需要一把工具：

```json
{
  "name": "weather_report",
  "description": "Get current weather for a known city.",
  "strict": true,
  "parameters": {
    "type": "object",
    "required": ["city"],
    "properties": {
      "city": {
        "type": "string",
        "description": "Chinese city name, not city code."
      }
    },
    "additionalProperties": false
  }
}
```

一次完整回合是：

1. 用户问：“北京今天冷吗？”
2. 模型发出 `tool_use: weather_report({ "city": "北京" })`。
3. Harness 真正执行工具，拿到 `tool_result: { "temp": 3, "condition": "晴" }`。
4. Harness 把结果放回消息列表。
5. 模型看到结果后回答：“冷，建议穿厚外套。”

这就是 ReAct：**Reason → Act → Observe**。模型先判断需要查天气，再发出动作，再根据观察到的结果继续回答。

## 一轮里可以有多个工具调用

如果用户问：“北京和上海今天哪个更冷？”一个好的模型不应该先查北京、等结果回来、再查上海。它可以在同一个 assistant turn 里发出两个工具调用：

```json
[
  { "name": "weather_report", "input": { "city": "北京" } },
  { "name": "weather_report", "input": { "city": "上海" } }
]
```

Harness 这侧应该并行执行这两个工具，再把两个结果一起塞回上下文。模型下一轮就能做对比。

这是新手写 Harness 很容易漏掉的一点：**一次 assistant turn 可能包含多个 tool call**。如果你把工具层写成“一次只能执行一个”，遇到对比多个城市、读取多个文件、并行搜索多个资料源时，系统会慢很多。

## 多轮 Loop：从天气到研究

天气例子只能说明骨架。真正的 Agent 任务通常不是一轮能解决的。

例如用户问：“这周五北京下雨概率大吗？对比过去五年同期降雨量。”模型可能要：

1. 查这周五的天气预报。
2. 查历史同期降雨数据。
3. 发现年份缺失，再换关键词补查。
4. 做对比。
5. 输出结论和不确定性。

这就是多轮 Loop。每一步的工具调用都依赖上一步结果，轨迹长度事先不确定。Deep Research、资料核验、代码排障，本质上都在跑类似的多轮循环。

多轮 ReAct 的优点是灵活，缺点也明显：模型容易“想到哪走到哪”。它可能一直追着第一个关键词搜，忘了另一个关键维度；也可能前几步走错，后面都在错误方向上补材料。

## Plan-then-Act：给水车加施工图

为了解决“走一步看一步”的问题，可以在循环前加一层计划。常见做法不是让模型随口写一段计划，而是给它一个真正的工具，比如 `write_todos`：

```json
{
  "name": "write_todos",
  "description": "Create or update TODOs for complex multi-step tasks.",
  "strict": true,
  "parameters": {
    "type": "object",
    "required": ["todos"],
    "properties": {
      "todos": {
        "type": "array",
        "items": {
          "type": "object",
          "required": ["content", "status"],
          "properties": {
            "content": { "type": "string" },
            "status": { "type": "string" }
          },
          "additionalProperties": false
        }
      }
    },
    "additionalProperties": false
  }
}
```

为什么要把计划做成工具，而不是只写在 prompt 里？因为工具调用会变成消息历史里的一个明确动作。模型后面每一轮都能看见：我已经承诺过这些 TODO，还有哪些没有完成。

这会让行为发生三个变化：

1. **计划变成状态**：TODO 不只是开头的一段文字，而是可被更新、可被检查的任务状态。
2. **执行有回头路**：模型做完一项后，要把 `in_progress` 改成 `completed`，也可以把新发现的子任务补进去。
3. **收尾更可控**：如果还有 `pending`，Harness 可以在下一轮提醒模型别急着回答。

但 Plan-then-Act 也有两个坑：

- **计划前不懂领域**：模型对陌生主题没概念，直接写 plan 会漏关键维度。解决办法是允许它在计划前做一次有限 briefing，例如先搜一次建立基本语感。
- **执行中忘记更新计划**：模型做着做着就忘了把 TODO 标成完成。解决办法是在工具结果之后插入 system reminder，也就是 runtime nudge，提醒它更新状态。

这里的重点是：Plan、briefing、nudge 都没有推翻 ReAct Loop。它们只是给循环加了外部扶手，让循环不容易失控。

用磨坊的故事说：纯 ReAct 是磨坊主看一袋麦子磨一袋；Plan-then-Act 是先在账本上写下“磨麦、筛粉、装袋、复查”，每完成一步就划掉一步。账本不会替水车转，但它能防止磨坊主忘了哪一步还没做。

## 换工具以后，它就变成 Coding Agent

同一套 Loop，换一批工具，产品形态就变了。

Deep Research 常用的是：

- `web_search`
- `web_fetch`
- `write_todos`

Coding Agent 常用的是：

- `read_file`
- `write_file` 或 `edit`
- `bash`
- `grep` / `glob`
- `write_todos`

它还需要一个更具体的边界：**workspace**。也就是告诉模型“你只能在这片目录里读写文件”。没有 workspace，文件工具会变成危险的全系统能力；有了 workspace，Harness 才能把工具调用约束在任务范围内。

修一个 bug 的轨迹可能是：

1. `bash("pytest")` 暴露失败。
2. `read_file("src/adder.py")` 看源码。
3. `edit(...)` 修改错误。
4. `bash("pytest")` 验证。
5. 没有新的 tool call，输出修复说明。

所以 Deep Research 和 Coding Agent 看起来完全不同，但底层节拍是同一件事：模型根据上下文选择工具，工具结果回到上下文，模型再决定下一步。

这句话很重要：**工具选型决定 Agent 的形态，Loop 决定 Agent 的节拍，Harness 决定 Agent 的边界。**

代码场景还有两个工程细节值得早知道：

- **工具参数要解释原因**：很多 coding harness 会要求 `bash`、`read_file`、`write_file` 的参数里带一段 `description`，让 UI 能展示“为什么要执行这一步”，也方便人类审计。
- **敏感动作要能暂停**：比如删除文件、安装依赖、访问外部服务，不应该只靠模型自己判断。成熟 Harness 会让这类工具调用进入 human-in-the-loop：先暂停，等人批准或拒绝，再恢复同一个 run。

## Context Layer：水车为什么会被麦袋堵住

多轮 Loop 跑久以后，最大问题不是模型不会想，而是上下文装不下。

`bash` 可能吐出几千行日志，`web_fetch` 可能抓回整篇网页，`read_file` 可能读进一个大文件。几十轮下来，消息历史里堆满了只用过一次的 tool result，模型开始漏看前文、前后矛盾，甚至直接撞到 context window 上限。

Harness 常见有两种处理方式：

- **Offloading**：单条工具结果太大时，把原文写到外部存储，在上下文里只留路径或摘要占位。它更像“搬家”，原文还在，需要时可以再读回来。
- **Compression**：整段历史快爆掉时，把旧轨迹压成摘要。它更像“归档压缩”，通常有损，不能保证每个细节都还原。

二者不要混为一谈。Offloading 处理单条大结果，通常更早、更局部、更可还原；Compression 处理整段历史，通常更晚、更全局、更有损。

一个 offloaded 的工具结果可能长这样：

```json
{
  "role": "tool",
  "tool_call_id": "call_042",
  "content": "[OFFLOADED] saved to .agent/logs/call_042.log. Use read_file to retrieve the full output."
}
```

模型看到的是一个占位符，而不是几千行日志。需要细节时，它可以再读这个文件；不需要时，这几千行就不会一直挤在消息历史里。

这件事也解释了为什么工具设计不能只看“能不能完成动作”，还要看“会不会污染上下文”。例如追加一行日志不应该要求模型重写整个 1000 行文件；搜索仓库不应该把所有命中都原样塞回上下文；构建失败也不一定要把完整 stdout 全送回去。Harness 做得好不好，很大程度上取决于它有没有把热信息和冷信息分开。

## Skill：能力太多时不要全塞进脑子

还有一种“上下文爆炸”来自能力本身。

一个 Agent 可能要会写 Python、查日志、审 PR、做设计评审、生成周报、诊断线上问题。每一种能力都可以写一份 SOP。如果把所有 SOP 都塞进 System Prompt，几十个 Skill 很快就会吃掉大半上下文，而且模型每轮都要在大量无关说明里分配注意力。

Skill 的核心思路是渐进式披露：

1. 启动时只把 Skill 名称、描述和路径放进上下文。
2. 真正需要某个 Skill 时，模型再用 `read_file` 读取对应 `SKILL.md`。
3. Skill 里的参考资料、脚本、模板也按需继续读取。

这不是简单“插件市场”。它解决的是：**哪些能力元数据应该每轮可见，哪些能力正文应该用时再展开。**

Anthropic 的 Agent Skills 文档把这件事分成三层加载，很适合拿来记：

1. **Metadata 常驻**：名字、描述、路径一直可见，让模型知道“有这个能力”。
2. **Instructions 触发后加载**：真正要用时，再读取 `SKILL.md` 的工作流说明。
3. **Resources / Code 按需加载**：模板、脚本、参考资料，不在一开始全部塞进上下文。

这和磨坊的关系是：墙上只挂“工具目录”，不是把所有工具说明书都贴满墙。磨坊主需要修水车时，才去拿“水车维修手册”；需要记账时，才去拿“账本格式模板”。

## 观测与评测：别只相信一次成功

到这里，水车已经会转、会查工具、会写计划、会避免上下文爆掉、也会按需拿手册。还差最后一个问题：你怎么知道它真的越改越好？

Harness 至少要留下三类证据：

- **Trace**：每一轮模型看到了什么、调用了什么工具、工具返回了什么、为什么停。
- **Replay**：同一个任务能不能拿旧轨迹复盘，定位是模型判断错、工具返回错，还是 Harness 拼上下文错。
- **Evals**：把一组代表性任务固定下来，每次改 prompt、工具或模型后重新跑，检查成功率、成本、延迟和失败类型。

没有 trace，Agent 出错时只能猜；没有 eval，Agent 今天看起来聪明，明天换个 prompt 可能就退步。OpenAI 和 Anthropic 的 agent eval 资料都强调这一点：Agent 质量不是只看某一次回答，而是要看多步任务在一组样本上的稳定表现。

## 最容易误解的一点

不要把 Agent Loop 理解成“让模型多想几次”。更准确的说法是：**让模型在外部世界的反馈里多走几步**。

只在脑子里反复想，容易越想越偏。边做边看，才有机会被事实纠正。ReAct 论文把推理和行动交织起来，关键就在这里：想法负责提出下一步，行动负责把新证据带回来。

但也别把 Loop 神化。真正可用的 Agent 不是只靠一个 while 循环，而是靠 Tool Layer、Context Layer、Hooks、权限、人类确认、trace 和 eval 一起兜住它。

## 今天的练习

下次你看到一个 Agent 产品，先不要问它用了什么模型。问十个更朴素的问题：

1. 它每一轮能观察到什么证据？
2. 它能采取哪些动作？
3. 它一次能不能并行调用多个工具？
4. 它什么时候知道该停？
5. 停机是模型决定，还是外部 workflow 决定？
6. 长任务开始前有没有计划？
7. 计划跑偏时有没有 nudge 或人工确认？
8. 大工具结果会不会 offload？
9. 历史太长时是 compression，还是重新开会话？
10. 怎么记录 trace，并用 eval 防止下一版退步？

这十个答案加起来，才是这座磨坊真正的水路图。

## 公开资料

- [ReAct: Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629)
- [Building effective agents - Anthropic](https://www.anthropic.com/engineering/building-effective-agents)
- [Demystifying evals for AI agents - Anthropic](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
- [Agent Skills overview - Anthropic](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)
- [Agents SDK - OpenAI](https://developers.openai.com/api/docs/guides/agents)
- [Running agents - OpenAI](https://developers.openai.com/api/docs/guides/agents/running-agents)
- [Human-in-the-loop - OpenAI Agents SDK](https://openai.github.io/openai-agents-python/human_in_the_loop/)
- [Evaluate agent workflows - OpenAI](https://developers.openai.com/api/docs/guides/agent-evals)
