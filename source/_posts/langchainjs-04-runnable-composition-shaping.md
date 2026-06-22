---
title: "《LangChain.js 源码逐行精讲》第04讲 · 组合原语②：Map/Parallel、Lambda、Fallbacks、Assign/Pick、asTool"
date: 2026-06-22 14:00:00
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

> 这是《LangChain.js 源码逐行精讲》第04讲，也是 `base.ts` 三讲的收官。第03讲读完串联（Sequence）与三个装饰器变体，这一讲读 `base.ts` 的最后一段 **L2261–3542**，把剩下的组合原语清完：`RunnableMap`/`RunnableParallel`（并行）、`RunnableLambda`（函数变 Runnable）、`RunnableWithFallbacks`（降级）、`RunnableAssign`/`RunnablePick`（第02讲 `assign`/`pick` 的真身）、以及 `RunnableToolLike` + `convertRunnableToTool`（`asTool` 的实现）。还有连接它们的总闸 `_coerceToRunnable`。读完本讲，3542 行的 `base.ts` 整本拆完。源码取自锁定 commit `8f2ca17`。

<div class="lcj-toc"><strong>本讲导航</strong>
<a id="ch0"></a>

- 第 1 章 · RunnableMap / RunnableParallel：并行映射
- 第 2 章 · RunnableLambda：函数即 Runnable（本讲核心）
- 第 3 章 · _coerceToRunnable：把函数/对象转成 Runnable 的总闸
- 第 4 章 · RunnableWithFallbacks：失败降级
- 第 5 章 · RunnableAssign / RunnablePick：assign 与 pick 的真身
- 第 6 章 · asTool：RunnableToolLike + convertRunnableToTool
- 第 7 章 · 小结 · base.ts 整本回顾 · 下一讲预告
</div>

## 第 1 章 · RunnableMap / RunnableParallel：并行映射 <span class="lcj-b lcj-key">重点</span>
<a id="ch1"></a>

`RunnableMap`（L2261）接受一组**命名的 Runnable**（`{ key: runnable }`），对**同一个输入**并行跑每一个，输出一个 `{ key: result }` 的对象。构造时把每个值都 `_coerceToRunnable`（L2284），所以你能写 `{ joke: prompt.pipe(model), topic: (x) => x.topic }` 混搭。

```ts
async invoke(input: RunInput, options?): Promise<RunOutput> {                  // L2299
  const runManager = await callbackManager_?.handleChainStart(...);
  const output: Record<string, any> = {};
  const promises = Object.entries(this.steps).map(async ([key, runnable]) => {
    output[key] = await runnable.invoke(input, patchConfig(config, {
      callbacks: runManager?.getChild(`map:key:${key}`),    // 每个分支打 map:key:xxx 标签
    }));
  });
  await raceWithSignal(Promise.all(promises), config.signal);   // 真并行 + 可中止
  return output as RunOutput;
}
```

`invoke` 用 `Promise.all` 真并行跑所有分支，每个分支挂上 `map:key:<key>` 的 trace 标签。`RunnableParallel`（L2852）更直接——**它就是 `RunnableMap` 的别名**：

```ts
export class RunnableParallel<RunInput> extends RunnableMap<RunInput> {}
```

<div class="lcj-note">为什么有两个名字？语义习惯。<code>RunnableParallel</code> 强调"并行跑多个分支"，<code>RunnableMap</code> 强调"把输入映射成一个对象"，但代码完全相同。第02讲 <code>assign</code> 内部用的是 <code>RunnableMap</code>；你手写 <code>.pipe({ a, b })</code> 时（对象会被 <code>_coerceToRunnable</code> 转成 <code>RunnableMap</code>）得到的也是它。</div>

### 1.1 流式版 _transform：用 atee 复制输入流 + Promise.race 抢先产出

并行的流式实现很见功力（L2339）：

```ts
async *_transform(generator, runManager?, options?): AsyncGenerator<RunOutput> {
  const steps = { ...this.steps };
  const inputCopies = atee(generator, Object.keys(steps).length);   // 把输入流“撕”成 N 份
  const tasks = new Map(Object.entries(steps).map(([key, runnable], i) => {
    const gen = runnable.transform(inputCopies[i], patchConfig(options, { callbacks: runManager?.getChild(`map:key:${key}`) }));
    return [key, gen.next().then((result) => ({ key, gen, result }))];   // 各自启动第一拉
  }));
  while (tasks.size) {
    const { key, result, gen } = await raceWithSignal(Promise.race(tasks.values()), options?.signal);  // 谁先有谁先出
    tasks.delete(key);
    if (!result.done) {
      yield { [key]: result.value } as RunOutput;     // 产出 {该分支key: 该块}
      tasks.set(key, gen.next().then((result) => ({ key, gen, result })));  // 该分支继续拉下一块
    }
  }
}
```

<div class="lcj-key-note"><code>atee</code>（来自 <code>utils/stream</code>）把一个异步生成器"撕"成 N 个独立可消费的副本——这样每个并行分支都能拿到完整输入流。然后用 <code>Promise.race</code> 在所有分支间<strong>抢先</strong>：哪个分支先产出一块，就先 <code>yield {key: chunk}</code>，再让那个分支继续拉。于是 <code>RunnableParallel</code> 的流式输出是"<strong>各分支的块按到达顺序交错涌出</strong>"，而不是等某个分支跑完。这是并行流式的标准实现范式，值得记住。</div>

## 第 2 章 · RunnableLambda：函数即 Runnable <span class="lcj-b lcj-core">核心</span>
<a id="ch2"></a>

`RunnableLambda`（L2536）是最常用的原语之一：**把任意单参函数包成 Runnable**。你写 `chain.pipe((x) => x.content)` 时，那个箭头函数最终就活在它里面。构造函数有个分流（L2568）：

```ts
constructor(fields: { func: ... }) {
  if (isTraceableFunction(fields.func)) {
    return RunnableTraceable.from(fields.func) as unknown as RunnableLambda<...>;  // LangSmith traceable → 改用 RunnableTraceable
  }
  super(fields);
  assertNonTraceableFunction(fields.func);
  this.func = fields.func;
}
```

如果传入的是 LangSmith `traceable()` 包过的函数，就改道去 `RunnableTraceable`（L2414，专门承接已被 LangSmith 追踪的函数）；否则存为普通 `func`。

### 2.1 _invoke：在配置上下文里跑函数，并处理三种"特殊返回"

`_invoke`（L2633）是精华，它把用户函数包进 `AsyncLocalStorage` 上下文执行，并对函数返回值做四类处理：

```ts
async _invoke(input, config?, runManager?) {
  return new Promise((resolve, reject) => {
    const childConfig = patchConfig(config, {
      callbacks: runManager?.getChild(),
      recursionLimit: (config?.recursionLimit ?? DEFAULT_RECURSION_LIMIT) - 1,   // 递归深度 -1
    });
    void AsyncLocalStorageProviderSingleton.runWithConfig(pickRunnableConfigKeys(childConfig), async () => {
      let output = await this.func(input, { ...childConfig });
      if (output && Runnable.isRunnable(output)) {                    // ① 函数返回了一个 Runnable
        if (config?.recursionLimit === 0) throw new Error("Recursion limit reached.");
        output = await output.invoke(input, { ...childConfig, recursionLimit: (childConfig.recursionLimit ?? DEFAULT_RECURSION_LIMIT) - 1 });
      } else if (isAsyncIterable(output)) {                          // ② 返回异步可迭代
        /* 用 consumeAsyncIterableInContext 收集并 concat 成 finalOutput */
      } else if (isIterableIterator(output)) {                       // ③ 返回同步迭代器
        /* 同上 */
      }
      resolve(output);                                               // ④ 普通值，直接返回
    });
  });
}
```

三个设计点：

- **`runWithConfig` + `pickRunnableConfigKeys`**：用第01讲的工具，把配置上下文"铺"到函数执行期间，于是你在 lambda 里调别的 Runnable，它们能自动继承当前 trace 上下文。
- **函数返回 Runnable 时自动展开**（L2651）：这让"动态路由"成为可能——lambda 根据输入返回不同的 Runnable，框架会 `invoke` 它。每展开一层 `recursionLimit` 减一，到 0 抛 `Recursion limit reached`，防无限递归（呼应第01讲那个默认 25）。
- **返回迭代器时自动收集**：用第01讲的 `consumeAsyncIterableInContext`/`consumeIteratorInContext` 在上下文里消费，并尽力 `_concatOutputChunks` 合并。

`invoke`（L2716）照例 `_callWithConfig(this._invoke.bind(this), ...)` 套上回调。流式版 `_transform`（L2723）类似，但当函数返回 Runnable 时改用 `output.stream(...)` 边拉边 `yield`，保持流式。

<div class="lcj-key-note"><code>RunnableLambda</code> 是 LCEL "万物可组合"的接口适配层：任何函数都能借它变成链里的一环，且自动获得回调追踪、上下文传递、递归保护。它返回 Runnable 时自动展开的能力，是 LangChain 实现"动态/条件链"的底层机制之一。</div>

## 第 3 章 · _coerceToRunnable：把函数/对象转成 Runnable 的总闸 <span class="lcj-b lcj-key">重点</span>
<a id="ch3"></a>

前面 `pipe`、`RunnableSequence.from`、`RunnableMap` 构造里反复出现的 `_coerceToRunnable`（L3141），现在揭晓：

```ts
export function _coerceToRunnable(coerceable: RunnableLike): Runnable {
  if (typeof coerceable === "function") {
    return new RunnableLambda({ func: coerceable });       // 函数 → RunnableLambda
  } else if (Runnable.isRunnable(coerceable)) {
    return coerceable;                                     // 已是 Runnable → 原样
  } else if (!Array.isArray(coerceable) && typeof coerceable === "object") {
    const runnables = {};
    for (const [key, value] of Object.entries(coerceable)) runnables[key] = _coerceToRunnable(value);
    return new RunnableMap({ steps: runnables });          // 对象 → RunnableMap（递归 coerce 每个值）
  } else {
    throw new Error(`Expected a Runnable, function or object.\nInstead got an unsupported type.`);
  }
}
```

三条规则，对上第02讲 `RunnableLike` 的三种形态：**函数 → `RunnableLambda`、Runnable → 原样、对象 → `RunnableMap`**（并递归 coerce 对象里每个值）。这就是为什么 `.pipe((x) => ...)`、`.pipe({ a: ..., b: ... })` 都能用——它们在入链前都被这道总闸转成了真 Runnable。

## 第 4 章 · RunnableWithFallbacks：失败降级 <span class="lcj-b lcj-key">重点</span>
<a id="ch4"></a>

`RunnableWithFallbacks`（L2922）是 `withFallbacks` 的产物：主 Runnable 失败时，依次尝试备用 Runnable（典型场景：主力 LLM 限流就降级到备用厂商）。

```ts
*runnables() { yield this.runnable; for (const fallback of this.fallbacks) yield fallback; }   // 主→备依次

async invoke(input, options?): Promise<RunOutput> {                          // L2954
  const runManager = await callbackManager_?.handleChainStart(...);
  const childConfig = patchConfig(otherConfigFields, { callbacks: runManager?.getChild() });
  return AsyncLocalStorageProviderSingleton.runWithConfig(childConfig, async () => {
    let firstError;
    for (const runnable of this.runnables()) {
      config?.signal?.throwIfAborted();
      try {
        const output = await runnable.invoke(input, childConfig);
        await runManager?.handleChainEnd(_coerceToDict(output, "output"));
        return output;                                  // 第一个成功的就返回
      } catch (e) { if (firstError === undefined) firstError = e; }   // 记下首个错误，继续试下一个
    }
    await runManager?.handleChainError(firstError);
    throw firstError;                                   // 全失败 → 抛“第一个”错误
  });
}
```

`runnables()` 生成器把"主 + 所有备用"串成一个序列，`invoke` 顺序尝试，**返回第一个成功的结果**；全部失败则抛出**第一个**错误（最有诊断价值的那个，而非最后一个）。流式 `_streamIterator`（L2999）同理：逐个尝试 `runnable.stream`，第一个能成功开流的就 `break` 用它。注意 `batch`（L3076）里对 `returnExceptions: true` 直接 `throw new Error("Not implemented.")`——降级 + 批量返回异常的组合未实现，这是逐行读才会注意到的边界。

## 第 5 章 · RunnableAssign / RunnablePick：assign 与 pick 的真身 <span class="lcj-b lcj-key">重点</span>
<a id="ch5"></a>

第02讲说 `assign`/`pick` 只是预置下一环的 `pipe` 糖，现在看那两环本体。

**`RunnableAssign`（L3210）**——往输入字典里**加字段**（保留原字段）：

```ts
async invoke(input, options?): Promise<RunOutput> {                          // L3240
  const mapperResult = await this.mapper.invoke(input, options);
  return { ...input, ...mapperResult } as RunOutput;       // 原输入 + 新算出的字段
}
```

`invoke` 一目了然：跑 `mapper`（一个 `RunnableMap`）算出新字段，和原 `input` 浅合并。流式 `_transform`（L3252）讲究些：用 `atee` 把输入分成"透传"和"喂 mapper"两路，**透传路只 yield 那些 mapper 不产出的 key**（`filter(([key]) => !mapperKeys.includes(key))`），再接上 mapper 的输出——这样新旧字段都能流式出，且不重复。`RunnableAssign` 正是 `RunnablePassthrough.assign`（第05讲）的引擎。

**`RunnablePick`（L3345）**——从输入字典里**挑字段**：

```ts
async _pick(input: RunInput): Promise<RunOutput> {                           // L3374
  if (typeof this.keys === "string") return input[this.keys];               // 单 key → 直接取值
  const picked = this.keys.map((key) => [key, input[key]]).filter((v) => v[1] !== undefined);
  return picked.length === 0 ? undefined : Object.fromEntries(picked);      // 多 key → 取子对象
}
```

单个 key 返回该值，多个 key 返回子对象（跳过 undefined）。`invoke` 用 `_callWithConfig` 套回调，`_transform` 对流里每个 chunk 都 `_pick` 一遍。`assign` 和 `pick` 一加一减，配合 `RunnableMap`，就是 LCEL 里"塑形字典数据流"的全部手段。

## 第 6 章 · asTool：RunnableToolLike + convertRunnableToTool <span class="lcj-b lcj-key">重点</span>
<a id="ch6"></a>

第02讲见过 `asTool`——把任意 Runnable 暴露成"模型能调用的工具"。实现是 `RunnableToolLike`（L3449）+ `convertRunnableToTool`（L3512）。

`RunnableToolLike` 继承 `RunnableBinding`，构造时**在被包的 Runnable 前面拼一个"解析输入"的 lambda**：

```ts
constructor(fields: RunnableToolLikeArgs) {
  const sequence = RunnableSequence.from([
    RunnableLambda.from(async (input) => {
      let toolInput;
      if (_isToolCall(input)) {                          // 输入是模型发来的 ToolCall
        try { toolInput = await interopParseAsync(this.schema, input.args); }   // 用 zod schema 校验 args
        catch { throw new ToolInputParsingException(`Received tool input did not match expected schema`, JSON.stringify(input.args)); }
      } else {
        toolInput = input;                               // 普通输入直接用
      }
      return toolInput;
    }).withConfig({ runName: `${fields.name}:parse_input` }),
    fields.bound,                                        // 校验后喂给真正的 Runnable
  ]).withConfig({ runName: fields.name });
  super({ bound: sequence, config: fields.config ?? {} });
}
```

<div class="lcj-key-note">关键在那条内部 <code>RunnableSequence</code>：第一环是 <code>parse_input</code> lambda——<strong>当模型返回一个 <code>ToolCall</code> 时，用工具的 zod <code>schema</code> 校验并解析 <code>input.args</code></strong>，不合规就抛 <code>ToolInputParsingException</code>；第二环才是你真正的 Runnable。于是任何 LCEL 链都能被模型当工具调用，参数自动按 schema 校验。这是 LCEL 与 tool-calling（F 组第22–23讲）之间的桥。</div>

`convertRunnableToTool`（L3512）是工厂：名字默认取 Runnable 名，描述默认取 schema 描述；若 schema 是"简单字符串"（`isSimpleStringZodSchema`），就包成 `{ input: string }` 再 transform 回字符串（方便模型只传一个字符串参数）；否则直接用给定 schema。

## 第 7 章 · 小结 · base.ts 整本回顾 · 下一讲预告 <span class="lcj-b lcj-skim">可跳读</span>
<a id="ch7"></a>

本讲的原语收一张表：

| 类 / 函数 | 行 | 角色 |
|---|---|---|
| `RunnableMap` / `RunnableParallel` | L2261 / L2852 | 并行跑命名分支，输出对象；流式用 atee + Promise.race |
| `RunnableLambda` | L2536 | 函数即 Runnable；返回 Runnable 自动展开（带递归保护） |
| `_coerceToRunnable` | L3141 | 函数→Lambda / 对象→Map / Runnable→原样 的总闸 |
| `RunnableWithFallbacks` | L2922 | 顺序尝试主+备，返回首个成功，抛首个错误 |
| `RunnableAssign` / `RunnablePick` | L3210 / L3345 | 给字典加字段 / 挑字段 |
| `RunnableToolLike` + `convertRunnableToTool` | L3449 / L3512 | asTool：拼 parse_input 校验 + 暴露成工具 |

**至此，3542 行的 `base.ts` 整本读完。** 把第02–04讲连起来回顾，LCEL 引擎的全貌是：抽象基类 `Runnable`（02讲）定义四态 + 三大 `*WithConfig` 模板 + 组合入口；`RunnableSequence`（03讲）把链接成惰性生成器管道实现端到端流式；本讲这批原语（04讲）提供并行、函数适配、降级、字典塑形、工具化——所有这些都只实现一个 `invoke`（或外加 `transform`），其余全靠基类白送。**这就是 LCEL "少量窄接口 + 自由组合" 工程美学的完整落地。**

<div class="lcj-note"><strong>下一讲预告 · 第 05 讲：独立 runnable 与图渲染。</strong>离开 <code>base.ts</code>，读 <code>runnables/</code> 目录剩下的独立文件：<code>passthrough.ts</code>（<code>RunnablePassthrough</code> 与 <code>.assign()</code> 静态方法）、<code>branch.ts</code>（<code>RunnableBranch</code>，if/elif/else 路由）、<code>router.ts</code>（<code>RouterRunnable</code>，按 key 路由）、<code>history.ts</code>（<code>RunnableWithMessageHistory</code>），以及 <code>graph.ts</code> + <code>graph_mermaid.ts</code>（把链画成 Mermaid 流程图）。读完第05讲，A 组「LCEL 引擎本体」全部结束，下一组进入消息体系。</div>

> 本课配套源码：[github.com/langchain-ai/langchainjs](https://github.com/langchain-ai/langchainjs) @ `8f2ca17`。本讲覆盖 `runnables/base.ts` L2261–3542（base.ts 收官）。本系列为开源项目的源码学习笔记，著作权归 LangChain 原作者所有。
