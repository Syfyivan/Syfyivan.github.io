---
title: "《LangChain.js 源码逐行精讲》第00讲 · 导论：monorepo 全景、LCEL 心智模型与构建运行链路"
date: 2026-06-22 12:00:00
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

> 这是《LangChain.js 源码逐行精讲》的第00讲，也是整季的地基。本系列逐行拆开 [langchain-ai/langchainjs](https://github.com/langchain-ai/langchainjs)（开源项目，本课为源码学习笔记，非本人作品）的核心引擎包 `@langchain/core`。整季锁定一个 commit：[`8f2ca17`](https://github.com/langchain-ai/langchainjs/tree/8f2ca17c6c8269dfe01598b9897b7a42ba30422c)（2026-06-18），所有行号都以它为准，不会因上游更新而漂移。这一讲不读具体某个文件的每一行，而是把"我们要拆的到底是什么、它长什么样、怎么跑起来"讲清楚，让后面 37 讲有地图可循。

<div class="lcj-toc"><strong>本讲导航</strong>
<a id="ch0"></a>

- 第 1 章 · LangChain.js 是什么，这门课拆的是哪一块
- 第 2 章 · monorepo 全景地图：libs/ 下的六类包
- 第 3 章 · 核心心智模型：一切皆 Runnable（LCEL）
- 第 4 章 · 构建与运行链路：package.json 逐项读
- 第 5 章 · 第一个 demo：prompt | model | parser
- 第 6 章 · 两条学习路线 + 38 讲全景 + 下一讲预告
</div>

## 第 1 章 · LangChain.js 是什么，这门课拆的是哪一块 <span class="lcj-b lcj-core">核心</span>
<a id="ch1"></a>

LangChain 是当下最流行的"把大模型接进应用"的框架。多数人先接触的是 Python 版（`langchain-ai/langchain`），但它还有一个一等公民的 TypeScript 实现 —— `langchain-ai/langchainjs`。本系列拆的就是 **JS/TS 版**，原因有二：一是它与本博客既有的 TS 源码系列（Open Agent SDK、Zustand、Preact Signals）同语言，前端读者无缝衔接；二是 TS 的类型签名本身就是最好的文档，逐行读类型能逼出很多设计意图。

### 1.1 不要把"LangChain"当成一个库

新手最大的误解，是以为 `npm install langchain` 装下来的是"LangChain 全部"。实际上 langchainjs 是一个 **monorepo**，里面有几十个独立发布的 npm 包。真正的"引擎"不是 `langchain` 这个包，而是 **`@langchain/core`**：

```
@langchain/core   ← 引擎：抽象、协议、组合原语（本课主角，257 个 .ts 文件，约 1.5MB）
langchain         ← 上层封装：initChatModel / createAgent（建立在 core + langgraph 之上）
@langchain/openai / @langchain/anthropic / ...  ← 31 个 provider 适配包
```

<div class="lcj-key-note"><strong>本课的范围 = <code>@langchain/core</code> 引擎本体。</strong>为什么只拆 core？因为上层的 chains、agents、各家 provider，本质都是"用 core 提供的 Runnable 接口拼出来的应用"。把 core 的 257 个文件吃透，你就掌握了 LangChain 的"语法"，再看任何上层包都是在读"用这套语法写的作文"。外围包（langchain 主包、textsplitters、mcp-adapters、providers）放进"全量路线"的 F 系列折叠补讲。</div>

### 1.2 这门课的承诺：逐行，且按"能学进去的顺序"

和 Open Agent SDK 那季一样，本课的承诺是 **verbatim 逐行**：每讲都对照真实源码（用 GitHub raw 在锁定 commit 上原样取出），一段段读，不跳过、不脑补。但 257 个文件不会按字母序硬啃 —— 我们按 **学习依赖顺序** 排：先讲所有人都要依赖的地基（Runnable 接口、配置管道），再讲建立在地基上的消息、提示、模型、工具，最后讲把它们串起来的回调/追踪/状态。第 1 讲是地基，第 37 讲用得上前面所有讲。

## 第 2 章 · monorepo 全景地图：libs/ 下的六类包 <span class="lcj-b lcj-key">重点</span>
<a id="ch2"></a>

clone 下来后，所有源码都在仓库根的 `libs/` 下。按职责分六类：

| 目录 | 包名 | 职责 | 本课处理 |
|---|---|---|---|
| `libs/langchain-core` | `@langchain/core` | **引擎**：Runnable/消息/提示/模型抽象/解析/工具/回调/追踪/序列化 | 核心路线 00–37 逐行 |
| `libs/langchain` | `langchain` | 新版主包：`initChatModel`、`createAgent`（ReAct，建在 langgraph 上） | 折叠 F2 |
| `libs/langchain-classic` | `langchain-classic` | 旧版遗产：chains/agents/memory 等，根入口故意为空 | 折叠 F5 |
| `libs/langchain-textsplitters` | `@langchain/textsplitters` | 文档切分（RAG 切块），整包就一个 802 行文件 | 折叠 F3 |
| `libs/langchain-mcp-adapters` | `@langchain/mcp-adapters` | 把 MCP server 的工具桥接成 LangChain 工具 | 折叠 F4 |
| `libs/providers/*` | `@langchain/openai` 等 | 31 个 provider 适配包，各自把一家厂商 SDK 适配到 core 接口 | 折叠 F5 巡览 |

<div class="lcj-note">记住一个判断标准：<strong>有没有"原创的引擎逻辑"</strong>。core 全是原创抽象，所以逐行；providers 是 31 个长得几乎一样的适配器（每个都是 <code>chat_models/embeddings/tools</code> 三件套套同一个模板），逐个逐行毫无收益，所以 F5 只走一个示范包讲清套路。</div>

### 2.1 core 内部的目录结构

`libs/langchain-core/src/` 下的目录，恰好对应本课的分组：

```
runnables/        ← A 组：LCEL 引擎本体（base.ts 一个文件就 3542 行）
messages/         ← B 组：消息类层级 + 流式合并
prompts/          ← C 组：提示模板
language_models/  ← D 组：模型抽象（chat / llm）
output_parsers/   ← E 组：输出解析
tools/            ← F 组：工具与 tool-calling 协议
callbacks/  tracers/  ← G 组：回调与追踪（可观测层）
load/  + chat_history.ts memory.ts context.ts  ← H 组：状态与序列化
documents/ embeddings.ts vectorstores.ts retrievers/ indexing/ structured_query/  ← I 组：检索（RAG 地基）
```

## 第 3 章 · 核心心智模型：一切皆 Runnable（LCEL） <span class="lcj-b lcj-core">核心</span>
<a id="ch3"></a>

如果只让你记住本课一句话，那就是这句：

<div class="lcj-key-note"><strong>在 LangChain.js 里，几乎所有东西都是 <code>Runnable</code>。</strong>提示模板是 Runnable，聊天模型是 Runnable，输出解析器是 Runnable，一个普通函数也能包成 Runnable。Runnable 之间用 <code>.pipe()</code> 串起来，就是官方说的 <strong>LCEL（LangChain Expression Language）</strong>。"表达式语言"听起来玄，其实就是"一套可以用管道拼起来的统一接口"。</div>

`Runnable` 这个统一接口规定了四种调用方式（后面第 02 讲会逐行读它的抽象基类）：

- `invoke(input)` —— 给一个输入，要一个输出（最常用）。
- `batch(inputs[])` —— 一批输入并发处理。
- `stream(input)` —— 流式逐块产出（返回 async iterable）。
- `transform(inputStream)` —— 输入本身也是流，流进流出（管道串联的底层靠它）。

正因为每一环都实现了同一套接口，它们才能无缝 `.pipe()`：前一环的输出类型对上后一环的输入类型，TypeScript 在编译期就帮你把链路对齐。这就是 LCEL 的全部魔法 —— **不是新语法，是统一接口 + 组合**。

<div class="lcj-note">这套设计和我们拆过的 Open Agent SDK「一切工具都实现同一个 Tool 接口」是同一种工程审美：<strong>用一个窄接口换来无限组合</strong>。读 core 的过程，本质就是看 LangChain 如何把"调模型、填提示、解析输出、调工具、记历史"这些异质操作，统统塞进 <code>Runnable</code> 这一个模子里。</div>

## 第 4 章 · 构建与运行链路：package.json 逐项读 <span class="lcj-b lcj-key">重点</span>
<a id="ch4"></a>

逐行课的传统：从 `package.json` 开始，因为它定义了"这个包是什么、怎么 build、暴露了哪些入口"。`libs/langchain-core/package.json` 的关键字段（取自锁定 commit）：

```jsonc
{
  "name": "@langchain/core",
  "version": "1.2.0",
  "type": "module",            // 纯 ESM 包
  "main": "./dist/index.cjs",  // 同时产出 CJS 兼容入口
  "scripts": {
    "build": "...",
    "build:compile": "...",    // tsc 编译 src/ → dist/
    "clean": "...",
    "test": "...",             // jest
    "test:watch": "...",
    "test:int": "..."          // 集成测试（需真实 API key）
  }
}
```

### 4.1 exports：子路径即"公共 API 地图"

`@langchain/core` 没有把所有东西从一个入口导出，而是用 `package.json` 的 `exports` 暴露**几十个子路径**。这张表其实就是引擎的"公共 API 地图"，每一条都对应本课要拆的一块：

```
.                              ./runnables
./messages   ./messages/tool   ./prompts        ./prompt_values
./language_models/base         ./language_models/chat_models
./language_models/llms         ./language_models/stream
./output_parsers               ./output_parsers/openai_functions
./output_parsers/openai_tools  ./tools
./callbacks/base   ./callbacks/manager   ./callbacks/dispatch
./documents  ./embeddings  ./retrievers   ./vectorstores
./indexing   ./example_selectors  ./caches  ./stores
./load   ./load/serializable   ./chat_history   ./memory   ./context
```

<div class="lcj-why">为什么拆这么多子路径，而不是一个大 barrel？<strong>tree-shaking 与按需加载。</strong>用户只 import <code>@langchain/core/runnables</code> 时，打包器不必把整个 core 拖进产物。这也是为什么后面每一讲对应的，往往正好是一个子路径下的若干文件 —— 包的物理切分本身就是按职责来的。</div>

### 4.2 七个运行时依赖

core 刻意把依赖压到极少，每一个都值得记住，后面会反复遇到：

| 依赖 | 用途 | 出现在 |
|---|---|---|
| `zod` | schema 校验，结构化输出/工具入参 | 工具、structured output |
| `@cfworker/json-schema` | JSON Schema 校验 | 结构化解析 |
| `@standard-schema/spec` | 统一各 schema 库的标准接口 | 解析器 |
| `mustache` | 模板插值引擎（除 f-string 外） | 提示模板（第 10 讲） |
| `js-tiktoken` | token 计数 | 模型基类、trimMessages |
| `langsmith` | 把运行轨迹上传 LangSmith | 追踪器（第 28 讲） |
| `p-queue` | 并发限流队列 | batch / AsyncCaller |

## 第 5 章 · 第一个 demo：prompt | model | parser <span class="lcj-b lcj-core">核心</span>
<a id="ch5"></a>

把前面的心智模型落到一段能跑的代码上。最经典的 LCEL 链是三段式：**提示模板 → 聊天模型 → 输出解析器**，三者都是 Runnable，用 `.pipe()` 串起来：

```ts
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatOpenAI } from "@langchain/openai"; // provider 包

// 1) 提示模板：把输入变量填进消息（是 Runnable）
const prompt = ChatPromptTemplate.fromMessages([
  ["system", "你是一个翻译，把用户的话翻译成{lang}。"],
  ["human", "{text}"],
]);

// 2) 聊天模型：把消息发给 LLM，拿回 AIMessage（是 Runnable）
const model = new ChatOpenAI({ model: "gpt-4o-mini" });

// 3) 输出解析器：把 AIMessage 抽成纯字符串（是 Runnable）
const parser = new StringOutputParser();

// .pipe() 串成一条链 —— 这条链本身又是一个 Runnable
const chain = prompt.pipe(model).pipe(parser);

const out = await chain.invoke({ lang: "英语", text: "你好，世界" });
// → "Hello, world"
```

读这段代码，请盯住三件事，它们正是后面整季要逐行回答的问题：

1. `prompt.pipe(model)` 返回的是什么？—— 一个 `RunnableSequence`（第 03 讲逐行）。
2. `chain.invoke(...)` 时，输入怎么一环环穿过去的？—— `transform` 流式串联（第 02 讲）。
3. `chain.stream(...)` 为什么能边生成边吐字？—— 因为每一环都实现了 `transform`，流可以贯穿整条链（第 02 / 17 讲）。

<div class="lcj-key-note">这条三段链就是本课的"<strong>北极星 demo</strong>"。后面每拆一个子系统，你都可以回到这张图问自己：这块代码，是这条链里的哪一环、在 <code>invoke</code> 的哪一步被调用？把 37 讲挂回这一条链上，就不会在 257 个文件里迷路。</div>

## 第 6 章 · 两条学习路线 + 38 讲全景 + 下一讲预告 <span class="lcj-b lcj-skim">可跳读</span>
<a id="ch6"></a>

本课在[课程目录页](/courses/langchainjs/)提供两条路线：

- **核心路线（00–37，38 讲）**：把"一条 LCEL 链是怎么转起来的"这条主干打通，A→I 九组按依赖序逐行。
- **全量逐行路线**：核心 38 讲 + F1–F5 折叠补讲（core 杂项 / langchain 主包 createAgent / textsplitters / mcp-adapters / providers 巡览），目标是"一个值得读的文件都不落"。

重要性徽章贯穿全季：<span class="lcj-b lcj-core">核心</span> 主干必吃透 / <span class="lcj-b lcj-key">重点</span> 关键细节 / <span class="lcj-b lcj-skim">可跳读</span> 知道即可 / <span class="lcj-b lcj-skip">非核心</span> 边角样板。

<div class="lcj-note"><strong>下一讲预告 · 第 01 讲：契约与配置管道。</strong>逐行读 <code>runnables/</code> 下四个地基文件：<code>types.ts</code>（<code>RunnableInterface</code> / <code>RunnableConfig</code> 定义了所有人遵守的契约）、<code>config.ts</code>（<code>ensureConfig</code> / <code>mergeConfigs</code> / <code>patchConfig</code>，每一次 invoke 都要穿过的配置管道）、<code>utils.ts</code> 与 <code>iter.ts</code>（streamEvents 的过滤器与"保上下文"的异步迭代器消费器）。把这四个文件吃透，3542 行的 <code>base.ts</code> 才读得动。</div>

> 本课配套源码：[github.com/langchain-ai/langchainjs](https://github.com/langchain-ai/langchainjs) @ `8f2ca17`。每讲对照真实文件逐行，建议 clone 下来跟着翻。本系列为开源项目的源码学习笔记，著作权归 LangChain 原作者所有。
