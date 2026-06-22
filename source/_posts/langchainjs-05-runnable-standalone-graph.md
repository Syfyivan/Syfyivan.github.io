---
title: "《LangChain.js 源码逐行精讲》第05讲 · 独立 runnable 与图渲染：Passthrough / Branch / Router / History / Graph"
date: 2026-06-22 14:30:00
tags: [AI, LangChain, LangChainJS, 源码解析, LCEL, 课程]
categories: [技术笔记]
toc: true
---

<style>
.lcj-b{display:inline-block;font-size:12px;font-weight:700;padding:1px 8px;border-radius:999px;vertical-align:middle;margin-left:6px;line-height:1.7;white-space:nowrap}
.lcj-core{color:#fff;background:#b73a2c}
.lcj-key{color:#b73a2c;background:rgba(183,58,44,.1);border:1px solid rgba(183,58,44,.3)}
.lcj-skim{color:#3f5d7e;background:rgba(63,93,126,.1);border:1px solid rgba(63,93,126,.25)}
.lcj-skip{color:#69727d;background:rgba(105,114,125,.12);border:1px solid rgba(105,114,125,.25)}
.lcj-note{margin:14px 0;padding:12px 16px;border-left:3px solid #3f5d7e;background:rgba(63,93,126,.06);border-radius:0 4px 4px 0}
.lcj-why{margin:14px 0;padding:12px 16px;border-left:3px solid #69727d;background:rgba(105,114,125,.07);border-radius:0 4px 4px 0;color:#3a4049}
.lcj-key-note{margin:14px 0;padding:12px 16px;border-left:3px solid #b73a2c;background:rgba(183,58,44,.06);border-radius:0 4px 4px 0}
.lcj-toc{margin:18px 0 26px;padding:16px 20px;border:1px solid rgba(29,33,39,.12);border-radius:8px;background:linear-gradient(135deg,rgba(183,58,44,.04),rgba(63,93,126,.05))}
.lcj-toc>strong{display:block;margin-bottom:8px;color:#1d2127;font-size:15px}
.lcj-fold{margin:14px 0;border:1px solid rgba(29,33,39,.14);border-radius:6px;background:#fafafa;padding:0 16px}
.lcj-fold>summary{cursor:pointer;padding:12px 0;font-weight:700;color:#1d2127}
.lcj-fold[open]{padding-bottom:8px}
</style>

> 这是《LangChain.js 源码逐行精讲》第05讲，也是 **A 组「LCEL 引擎本体」的收官**。前三讲（02–04）把 3542 行的 `base.ts` 整本读完。这一讲读 `runnables/` 目录里剩下的独立文件：`passthrough.ts`（透传 + `.assign`）、`branch.ts`（if/elif/else 路由）、`router.ts`（按 key 路由）、`history.ts`（给链接上聊天历史，已废弃）、以及 `graph.ts` + `graph_mermaid.ts`（把链画成流程图）。读完本讲，你手里就有了搭 LCEL 链的全部积木，下一组进入"数据载体"——消息体系。源码取自锁定 commit `8f2ca17`。

<div class="lcj-toc"><strong>本讲导航</strong>
<a id="ch0"></a>

- 第 1 章 · RunnablePassthrough：透传与 .assign
- 第 2 章 · RunnableBranch：if / elif / else 路由
- 第 3 章 · RouterRunnable：按 key 路由
- 第 4 章 · RunnableWithMessageHistory：给链接上历史（已废弃）
- 第 5 章 · graph.ts / graph_mermaid.ts：把链画成图
- 第 6 章 · 小结 · A 组回顾 · 下一讲预告
</div>

## 第 1 章 · RunnablePassthrough：透传与 .assign <span class="lcj-b lcj-key">重点</span>
<a id="ch1"></a>

`RunnablePassthrough`（passthrough.ts L44）几乎就是恒等函数——**输入原样返回**，但可选地跑一个副作用函数（如打日志）：

```ts
async invoke(input: RunInput, options?): Promise<RunInput> {                 // L65
  const config = ensureConfig(options);
  if (this.func) { await this.func(input, config); }       // 可选副作用，不改输入
  return this._callWithConfig((input) => Promise.resolve(input), input, config);   // 原样返回
}
```

它的典型用法是**在并行映射里"占位"原始输入**。看类注释里的例子：

```ts
const chain = RunnableSequence.from([
  { question: new RunnablePassthrough(), context: async () => loadContextFromStore() },
  prompt, llm, outputParser,
]);
// 传入一个字符串，question 透传它，context 另算 —— 组成 {question, context} 喂给 prompt
```

`question: new RunnablePassthrough()` 让那个对象（会被 `_coerceToRunnable` 转成 `RunnableMap`，第04讲）里的 `question` 字段直接等于原始输入。`transform`（L81）也实现了流式透传，并在流结束时对累积的 `finalOutput` 跑一次 `func`。

### 1.1 静态方法 .assign：往输入里加字段而不丢原字段

```ts
static assign(mapping: RunnableMapLike): RunnableAssign {                    // L143
  return new RunnableAssign(new RunnableMap({ steps: mapping }));
}
```

<div class="lcj-key-note"><code>RunnablePassthrough.assign({ schema: async () => db.getTableInfo() })</code> 是 LCEL 里极常见的写法：<strong>保留传入的全部字段，再补上新算出的字段</strong>。它的实现就是 new 一个第04讲的 <code>RunnableAssign</code>（内含 <code>RunnableMap</code>）。回顾第04讲：<code>RunnableAssign.invoke</code> 返回 <code>{...input, ...mapperResult}</code>。所以 <code>RunnablePassthrough.assign</code> = "透传原输入 + 并行算新字段并合并"。它和实例方法 <code>RunnablePassthrough</code>（纯透传）是两个不同用途，别混。</div>

## 第 2 章 · RunnableBranch：if / elif / else 路由 <span class="lcj-b lcj-core">核心</span>
<a id="ch2"></a>

`RunnableBranch`（branch.ts L67）实现条件路由：一组 `[条件, 分支]` 对 + 一个默认分支，**按顺序评估条件，跑第一个命中的分支**，都不中就跑默认。类型定义很清楚（L21）：

```ts
export type Branch<RunInput, RunOutput> = [
  Runnable<RunInput, boolean>,      // 条件：返回 boolean 的 Runnable
  Runnable<RunInput, RunOutput>,    // 分支：命中时跑的 Runnable
];
```

静态工厂 `from`（L118）接受 `[[cond1, run1], [cond2, run2], ..., defaultRun]`——除最后一项外都是 `[条件,分支]` 元组，最后一项是默认分支，每个都 `_coerceToRunnable`（所以你能直接写函数当条件）。核心逻辑在 `_invoke`（L146）：

```ts
async _invoke(input, config?, runManager?): Promise<RunOutput> {
  let result;
  for (let i = 0; i < this.branches.length; i += 1) {
    const [condition, branchRunnable] = this.branches[i];
    const conditionValue = await condition.invoke(input, patchConfig(config, {
      callbacks: runManager?.getChild(`condition:${i + 1}`),    // 条件评估也是一次子 run
    }));
    if (conditionValue) {                                       // 第一个为真的条件
      result = await branchRunnable.invoke(input, patchConfig(config, {
        callbacks: runManager?.getChild(`branch:${i + 1}`),
      }));
      break;                                                    // 命中即停
    }
  }
  if (!result) {                                                // 都没中 → 默认分支
    result = await this.default.invoke(input, patchConfig(config, {
      callbacks: runManager?.getChild("branch:default"),
    }));
  }
  return result;
}
```

就是一个 for 循环跑 if/elif/else：逐个 `condition.invoke` 求值，第一个真值就跑对应 `branchRunnable` 并 `break`；全假则跑 `this.default`。注意**每个条件评估和每个分支都是独立的子 run**（`condition:N` / `branch:N` / `branch:default` 标签），trace 上能看清"走了哪条路、为什么"。

<div class="lcj-note"><code>_streamIterator</code>（L188）是流式版：同样逐个评估条件，命中后改用 <code>branchRunnable.stream</code> 边拉边 <code>yield</code>。一个值得注意的小坑：<code>_invoke</code> 用 <code>if (!result)</code> 判断"是否命中过分支"——如果某个分支<strong>合法地返回了 falsy 值</strong>（如 <code>0</code>、<code>""</code>、<code>false</code>），会被误判为"没命中"而又跑一遍默认分支。逐行读才看得出这种边界。实务里 <code>RunnableBranch</code> 常配合一个分类链：先用 LLM 判断意图，再 branch 到不同的处理链。</div>

## 第 3 章 · RouterRunnable：按 key 路由 <span class="lcj-b lcj-skim">可跳读</span>
<a id="ch3"></a>

`RouterRunnable`（router.ts L38）是另一种路由：不评估条件，而是**直接按输入里的 `key` 字段选 Runnable**。输入形如 `{ key, input }`：

```ts
async invoke(input: RunInput, options?): Promise<RunOutput> {                // L60
  const { key, input: actualInput } = input;
  const runnable = this.runnables[key];
  if (runnable === undefined) throw new Error(`No runnable associated with key "${key}".`);
  return runnable.invoke(actualInput, ensureConfig(options));
}
```

`this.runnables` 是个 `{ 名字: Runnable }` 字典，`invoke` 用 `input.key` 当索引选出对应 Runnable，把 `input.input` 喂给它。`batch`（L90）支持按 `maxConcurrency` 分批跑，`stream`（L120）同理选中后转发。

<div class="lcj-why">为什么 <span class="lcj-b lcj-skim">可跳读</span>？它和 <code>RunnableBranch</code> 都是路由，但 <code>RouterRunnable</code> 要求调用方<strong>显式给出 key</strong>（路由决策在链外做好了），而 <code>RunnableBranch</code> 在链内用条件 Runnable 现算。实务中 <code>RunnableBranch</code> 更常用，<code>RouterRunnable</code> 适合"已经知道该走哪条"的场景。逻辑上没有新机制，就是字典查表 + 转发。</div>

## 第 4 章 · RunnableWithMessageHistory：给链接上历史 <span class="lcj-b lcj-skim">可跳读（已废弃）</span>
<a id="ch4"></a>

`RunnableWithMessageHistory`（history.ts L106）把一条链包装成"带会话记忆"的链：每次调用按 `sessionId` 读取该会话的历史消息、注入到输入、并在结束后把这轮的新消息存回。它 `extends RunnableBinding`（第03讲），类注释开头就标了 **`@deprecated Use LangGraph's built-in persistence instead`**——新代码应用 LangGraph 的持久化，但读它能学到"用第03讲的积木拼出一个有状态包装器"的范式。

机制分三步，全靠前几讲的工具拼出来：

```ts
// ① _mergeConfig：从 config 取 sessionId，调 getMessageHistory(sessionId) 挂到 config 上
async _mergeConfig(...configs) {                                             // L289
  const config = await super._mergeConfig(...configs);
  if (!config.configurable?.sessionId) throw new Error(`sessionId is required. ...`);
  const { sessionId } = config.configurable;
  config.configurable.messageHistory = await this.getMessageHistory(sessionId);  // 取该会话的历史存储
  return config;
}

// ② _enterHistory：调用前，把历史消息读出来、拼到输入前面
async _enterHistory(input, kwargs?): Promise<BaseMessage[]> {                // L243
  const history = kwargs?.configurable?.messageHistory;
  const messages = await history.getMessages();
  if (this.historyMessagesKey === undefined) return messages.concat(this._getInputMessages(input));
  return messages;
}

// ③ _exitHistory：结束后（作为 onEnd 监听器），把这轮输入+输出消息存回
async _exitHistory(run: Run, config): Promise<void> {                       // L256
  const history = config.configurable?.messageHistory;
  let inputMessages = this._getInputMessages(/* run.inputs */);
  if (this.historyMessagesKey === undefined) {
    const existingMessages = await history.getMessages();
    inputMessages = inputMessages.slice(existingMessages.length);   // 去掉刚才注入的历史，避免重复存
  }
  const outputMessages = this._getOutputMessages(run.outputs);
  await history.addMessages([...inputMessages, ...outputMessages]);  // 新消息落库
}
```

<div class="lcj-key-note">看它怎么用前几讲的积木："读历史→注入"用的是 <code>RunnablePassthrough.assign</code>（第1章）把历史塞进输入；"存历史"用的是第03讲 <code>withListeners</code> 的 <code>onEnd</code> 钩子（构造函数 L135 把 <code>_exitHistory</code> 注册成 onEnd）；"按会话隔离"靠 <code>config.configurable.sessionId</code>（第01讲的 configurable）。<strong>一个有状态记忆包装器，完全由"透传 assign + 生命周期监听 + configurable"三块拼成，没有任何新原语。</strong>这正是 LCEL 组合性的力量展示——也是为什么它能被 LangGraph 的更通用持久化取代。</div>

## 第 5 章 · graph.ts / graph_mermaid.ts：把链画成图 <span class="lcj-b lcj-skip">非核心</span>
<a id="ch5"></a>

第02/03讲见过 `getGraph()`——它返回一个 `Graph` 对象，用来把链可视化。`Graph`（graph.ts L53）是个内存里的有向图模型：

```ts
export class Graph {
  addNode(...): Node          // 加节点（节点 data 是 IO schema 或子 Runnable）
  addEdge(...): Edge          // 加边
  firstNode() / lastNode()    // 找入口/出口节点
  extend(graph, prefix)       // 把另一张子图并进来（Sequence 拼接各步子图用）
  trimFirstNode() / trimLastNode()   // 修剪首尾节点（拼接时去掉重复的 IO 节点）
  reid()                      // 重新编号节点 id
  drawMermaid(...)            // 渲染成 Mermaid 流程图语法
  drawMermaidPng(...)         // 渲染成 PNG
}
```

回顾第03讲 `RunnableSequence.getGraph`：它对每一步 `step.getGraph()` 拿子图，`trimFirstNode/trimLastNode` 去掉中间步骤多余的输入/输出节点，再 `extend` 拼成整条链的图，最后 `addEdge` 把相邻步骤连起来。`graph_mermaid.ts` 的 `drawMermaid`（L24）则把 `nodes + edges` 翻译成 Mermaid 的 `flowchart` 文本（转义标签、套用节点样式）。

<div class="lcj-why">为什么整组 <span class="lcj-b lcj-skip">非核心</span>？因为它纯是<strong>可视化/调试</strong>设施，不参与 invoke/stream 的执行路径——你不画图，链照跑。理解"<code>getGraph</code> 把链的拓扑结构抽出来给渲染器"这一句话即可，无需逐行抠 Mermaid 字符串拼接。需要时 <code>chain.getGraph().drawMermaid()</code> 能打印出链的流程图，调试复杂链很有用。</div>

## 第 6 章 · 小结 · A 组回顾 · 下一讲预告 <span class="lcj-b lcj-skim">可跳读</span>
<a id="ch6"></a>

本讲五个文件收一张表：

| 文件 / 类 | 角色 | 重要性 |
|---|---|---|
| `RunnablePassthrough` + `.assign` | 透传输入 / 加字段不丢原字段 | <span class="lcj-b lcj-key">重点</span> |
| `RunnableBranch` | if/elif/else 条件路由（链内现算条件） | <span class="lcj-b lcj-core">核心</span> |
| `RouterRunnable` | 按显式 key 路由（决策在链外） | <span class="lcj-b lcj-skim">可跳读</span> |
| `RunnableWithMessageHistory` | 按 sessionId 接历史（已废弃，看组合范式） | <span class="lcj-b lcj-skim">可跳读</span> |
| `Graph` / `drawMermaid` | 把链画成 Mermaid 流程图（可视化） | <span class="lcj-b lcj-skip">非核心</span> |

**A 组「LCEL 引擎本体」到此全部结束（00–05，6 讲）。** 回顾这条主线：第00讲立心智模型（一切皆 Runnable），第01讲读地基（契约 + 配置管道），第02讲读抽象基类（四态 + 三大模板方法），第03讲读串联（Sequence 的流式管道），第04讲读其余原语（并行/函数/降级/塑形/工具化），第05讲读路由与透传。**至此你已掌握 LCEL 的全部组合积木**——但所有这些 Runnable 处理的"数据"还很抽象。接下来几组就去看这些数据本身是什么。

<div class="lcj-note"><strong>下一讲预告 · 第 06 讲：消息类型系统与 content 词汇（B 组开篇）。</strong>离开 <code>runnables/</code>，进入 <code>messages/</code> 目录。第06讲读消息体系的类型地基：<code>MessageStructure</code> 泛型类型系统、消息的 <code>content</code> 到底能是什么（纯字符串 vs 多模态 content blocks 数组）、以及贯穿聊天模型的消息词汇表。把"Runnable 在传的到底是什么"这个问题，从第06讲开始一一回答。</div>

> 本课配套源码：[github.com/langchain-ai/langchainjs](https://github.com/langchain-ai/langchainjs) @ `8f2ca17`。本讲覆盖 `runnables/` 的 passthrough/branch/router/history/graph/graph_mermaid（A 组收官）。本系列为开源项目的源码学习笔记，著作权归 LangChain 原作者所有。
