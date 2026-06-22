---
title: "《LangChain.js 源码逐行精讲》第03讲 · 组合原语①：Binding / Each / Retry / Sequence"
date: 2026-06-22 13:30:00
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

> 这是《LangChain.js 源码逐行精讲》第03讲。第02讲读完抽象基类 `Runnable`，知道了"子类只填 `invoke`，四态/回调/组合白送"。这一讲读 `base.ts` 的 **L1247–2260**，四个最先要认识的具体子类：`RunnableBinding`（`withConfig` 的产物，配置的载体）、`RunnableEach`（把一个 Runnable 映射到列表）、`RunnableRetry`（`withRetry` 背后，基于 `p-retry`）、以及压轴的 `RunnableSequence`——**`.pipe()` 串起来那条链的真身**。最值得吃透的是 `RunnableSequence` 怎么让流式"贯穿"整条链。源码取自锁定 commit `8f2ca17`。

<div class="lcj-toc"><strong>本讲导航</strong>
<a id="ch0"></a>

- 第 1 章 · RunnableBinding：配置绑定的载体
- 第 2 章 · RunnableEach：把 Runnable 映射到列表
- 第 3 章 · RunnableRetry：基于 p-retry 的重试
- 第 4 章 · RunnableSequence：.pipe() 的真身（本讲核心）
- 第 5 章 · 小结 · 重要性盘点 · 下一讲预告
</div>

## 第 1 章 · RunnableBinding：配置绑定的载体 <span class="lcj-b lcj-key">重点</span>
<a id="ch1"></a>

第02讲见过：`withConfig`、`withRetry`、`withListeners` 都返回一个 `{ bound: this, ... }` 的包装类。`RunnableBinding` 就是其中最基础的那个——**它包住一个 Runnable，每次调用时把预先绑定的配置合并进去**。先看它的字段（L1302–1331）：

```ts
export class RunnableBinding<RunInput, RunOutput, CallOptions extends RunnableConfig = RunnableConfig>
  extends Runnable<RunInput, RunOutput, CallOptions> {
  static lc_name() { return "RunnableBinding"; }
  lc_namespace = ["langchain_core", "runnables"];
  lc_serializable = true;
  bound: Runnable<RunInput, RunOutput, CallOptions>;        // 被包住的 Runnable
  config: RunnableConfig;                                   // 预绑定的配置
  kwargs?: Partial<CallOptions>;                            // @deprecated，旧式额外参数
  configFactories?: Array<(config) => RunnableConfig | Promise<RunnableConfig>>;  // 动态配置工厂
  constructor(fields) { super(fields); this.bound = fields.bound; /* … */ }
}
```

`bound` 是核心，`config` 是要叠加的配置，`configFactories` 是"运行时根据当前 config 再生成一份补充配置"的函数数组（`withListeners` 用它，见下）。`kwargs` 已废弃。

### 1.1 _mergeConfig：把绑定配置叠到调用配置上

```ts
async _mergeConfig(...options): Promise<Partial<CallOptions>> {            // L1337
  const config = mergeConfigs(this.config, ...options);                   // 先并：预绑定 + 调用时
  return mergeConfigs(
    config,
    ...(this.configFactories
      ? await Promise.all(this.configFactories.map(async (f) => await f(config)))  // 再并：工厂动态产物
      : [])
  );
}
```

它分两步：先用第01讲的 `mergeConfigs` 把"预绑定的 `this.config`"和"本次调用传入的 options"合并；再把 `configFactories` 对当前 config 算出来的动态配置也并进去。这就是 `withConfig` 绑定的配置"每次调用都生效"的实现。

### 1.2 四态全部委派给 bound

`RunnableBinding` 自己不干活，只是"合并配置后转交 `bound`"：

```ts
async invoke(input, options?): Promise<RunOutput> {                        // L1381
  return this.bound.invoke(input, await this._mergeConfig(options, this.kwargs));
}
async *_streamIterator(input, options?) {                                 // L1429
  yield* this.bound._streamIterator(input, await this._mergeConfig(ensureConfig(options), this.kwargs));
}
async stream(input, options?) { return this.bound.stream(input, await this._mergeConfig(...)); }     // L1439
async *transform(generator, options?) { yield* this.bound.transform(generator, await this._mergeConfig(...)); }  // L1449
```

`invoke`/`batch`/`stream`/`transform`/`streamEvents` 全是同一个套路：`_mergeConfig` 合并 → 调 `bound` 的同名方法。它还重写了 `withConfig`（L1353，叠加而非新建一层 Binding，避免套娃）和 `withRetry`（L1367，直接造 `RunnableRetry`）。

### 1.3 withListeners 的巧思：用 configFactories 注入 tracer

```ts
withListeners({ onStart, onEnd, onError }): Runnable<...> {                // L1554
  return new RunnableBinding({
    bound: this.bound, kwargs: this.kwargs, config: this.config,
    configFactories: [
      (config) => ({ callbacks: [new RootListenersTracer({ config, onStart, onEnd, onError })] }),
    ],
  });
}
```

<div class="lcj-note">这里能看出 <code>configFactories</code> 的用处：<code>withListeners</code> 不是直接改 config，而是塞一个<strong>工厂函数</strong>，在每次调用时根据当时的 config 现造一个 <code>RootListenersTracer</code> 回调。这样监听器拿到的永远是"本次运行"的真实 config。<code>RootListenersTracer</code> 会在 run 的开始/结束/出错时回调你的 <code>onStart/onEnd/onError</code>，参数是带完整信息的 <code>Run</code> 对象（G 组讲 tracers 时再深入）。</div>

## 第 2 章 · RunnableEach：把 Runnable 映射到列表 <span class="lcj-b lcj-skim">可跳读</span>
<a id="ch2"></a>

`RunnableEach`（L1605）很短：它包一个处理"单项"的 Runnable，对外接受"一个列表"，把列表里每一项都喂给 `bound`：

```ts
export class RunnableEach<RunInputItem, RunOutputItem, CallOptions extends RunnableConfig>
  extends Runnable<RunInputItem[], RunOutputItem[], CallOptions> {
  bound: Runnable<RunInputItem, RunOutputItem, CallOptions>;
  async invoke(inputs: RunInputItem[], config?): Promise<RunOutputItem[]> {     // L1633
    return this._callWithConfig(this._invoke.bind(this), inputs, config);
  }
  protected async _invoke(inputs, config?, runManager?): Promise<RunOutputItem[]> {  // L1646
    return this.bound.batch(inputs, patchConfig(config, { callbacks: runManager?.getChild() }));
  }
}
```

注意它怎么用第02讲的两个基类工具：`invoke` 把真正的逻辑包进 `_invoke`，交给 `_callWithConfig` 执行（于是自动有了回调追踪）；`_invoke` 里调 `this.bound.batch(...)` 把列表批量跑完，并用 `patchConfig(config, { callbacks: runManager?.getChild() })` 把子 run 的回调挂到父 run 下——这样 trace 上 `RunnableEach` 是父节点，每个元素是子节点。`runManager.getChild()` 是"生成子运行的回调管理器"，后面 Sequence 会反复用到。

<div class="lcj-why">为什么说它<span class="lcj-b lcj-skim">可跳读</span>？因为它就是 <code>batch</code> 的一层"语义包装"——把"对列表逐项处理"显式建模成一个 Runnable，方便嵌进链里。理解了 <code>_callWithConfig</code> + <code>getChild()</code> 的配合，它没有新东西。</div>

## 第 3 章 · RunnableRetry：基于 p-retry 的重试 <span class="lcj-b lcj-key">重点</span>
<a id="ch3"></a>

`RunnableRetry`（L1727）**继承自 `RunnableBinding`**——因为重试本质也是"包住一个 Runnable，调用时加点料"。它加的料是 `p-retry`（带指数退避 + 抖动的重试库）：

```ts
export class RunnableRetry<...> extends RunnableBinding<RunInput, RunOutput, CallOptions> {
  protected maxAttemptNumber = 3;
  onFailedAttempt: RunnableRetryFailedAttemptHandler = () => {};
  _patchConfigForRetry(attempt, config?, runManager?): Partial<CallOptions> {      // L1757
    const tag = attempt > 1 ? `retry:attempt:${attempt}` : undefined;
    return patchConfig(config, { callbacks: runManager?.getChild(tag) });
  }
  protected async _invoke(input, config?, runManager?): Promise<RunOutput> {       // L1766
    return pRetry(
      (attemptNumber) => super.invoke(input, this._patchConfigForRetry(attemptNumber, config, runManager)),
      {
        onFailedAttempt: ({ error }) => this.onFailedAttempt(error, input),
        retries: Math.max(this.maxAttemptNumber - 1, 0),    // 3 次尝试 = 1 + 2 retries
        randomize: true,                                    // 抖动，避免惊群
      }
    );
  }
  async invoke(input, config?): Promise<RunOutput> {                               // L1797
    return this._callWithConfig(this._invoke.bind(this), input, config);
  }
}
```

几个要点：

- **`retries: Math.max(this.maxAttemptNumber - 1, 0)`**：`maxAttemptNumber` 是"总尝试次数"，`p-retry` 的 `retries` 是"额外重试次数"，所以减一。`stopAfterAttempt: 3` = 1 次正常 + 2 次重试。
- **`randomize: true`**：开启抖动（jitter），多个并发失败不会在同一时刻一起重试，避免对下游"惊群"。
- **`_patchConfigForRetry`** 给第 2 次起的尝试打 `retry:attempt:N` 标签——trace 上能看出这是第几次重试。

### 3.1 _batch：只重试失败的那几项

最巧妙的是批量重试 `_batch`（L1804）：它**不重跑整批，只重跑上次失败的下标**：

```ts
async _batch(inputs, configs?, runManagers?, batchOptions?) {
  const resultsMap: Record<string, RunOutput | Error> = {};
  await pRetry(async (attemptNumber) => {
    const remainingIndexes = inputs.map((_, i) => i)
      .filter((i) => resultsMap[i] === undefined || resultsMap[i] instanceof Error);  // 只挑还没成功的
    const remainingInputs = remainingIndexes.map((i) => inputs[i]);
    const results = await super.batch(remainingInputs, patchedConfigs, { ...batchOptions, returnExceptions: true });
    let firstException;
    for (let i = 0; i < results.length; i += 1) {
      if (results[i] instanceof Error && firstException === undefined) firstException = results[i];
      resultsMap[remainingIndexes[i]] = results[i];          // 记下每项结果
    }
    if (firstException) throw firstException;                 // 还有失败 → 触发下一轮 pRetry
    return results;
  }, { retries: Math.max(this.maxAttemptNumber - 1, 0), randomize: true });
  return Object.keys(resultsMap).sort(...).map(...);          // 按原下标顺序还原
}
```

<div class="lcj-key-note">这是工程上很讲究的一笔：批量重试时，<strong>用 <code>resultsMap</code> 记住每一项的结果，每轮只对"还是 Error 的下标"重跑</strong>。已经成功的项不会被重复调用（省钱、防重复副作用）。只要本轮还有任意一项失败就 <code>throw</code> 触发 <code>p-retry</code> 进入下一轮，直到全成或耗尽次数。最后按原始下标排序还原顺序返回。<code>batch</code>（L1873）则把 <code>_batch</code> 交给第02讲的 <code>_batchWithConfig</code> 包上回调。</div>

## 第 4 章 · RunnableSequence：.pipe() 的真身 <span class="lcj-b lcj-core">核心</span>
<a id="ch4"></a>

终于到压轴。第02讲说 `pipe` 就是 `new RunnableSequence`——现在看它本体。结构很简单（L1925–1959）：一条序列被切成 `first` / `middle[]` / `last` 三段：

```ts
export class RunnableSequence<RunInput = any, RunOutput = any> extends Runnable<RunInput, RunOutput> {
  protected first: Runnable<RunInput>;
  protected middle: Runnable[] = [];
  protected last: Runnable<any, RunOutput>;
  omitSequenceTags = false;
  get steps() { return [this.first, ...this.middle, this.last]; }     // L1957 拼回完整步骤列表
}
```

`get steps()` 把三段拼回完整数组。为什么不直接存一个数组？因为类型：`first` 锁定整条链的 `RunInput`，`last` 锁定 `RunOutput`，中间随意——这样 TypeScript 能在编译期校验首尾类型。

### 4.1 invoke：逐步喂，给每步打 seq:step 标签

```ts
async invoke(input: RunInput, options?): Promise<RunOutput> {            // L1961
  const config = ensureConfig(options);
  const runManager = await callbackManager_?.handleChainStart(this.toJSON(), _coerceToDict(input, "input"), config.runId, ...);
  delete config.runId;
  let nextStepInput = input;
  let finalOutput: RunOutput;
  try {
    const initialSteps = [this.first, ...this.middle];
    for (let i = 0; i < initialSteps.length; i += 1) {
      const step = initialSteps[i];
      const promise = step.invoke(nextStepInput, patchConfig(config, {
        callbacks: runManager?.getChild(this.omitSequenceTags ? undefined : `seq:step:${i + 1}`),
      }));
      nextStepInput = await raceWithSignal(promise, config.signal);     // 上一步输出 = 下一步输入
    }
    if (config.signal?.aborted) throw getAbortSignalError(config.signal);
    finalOutput = await this.last.invoke(nextStepInput, patchConfig(config, {
      callbacks: runManager?.getChild(this.omitSequenceTags ? undefined : `seq:step:${this.steps.length}`),
    }));
  } catch (e) { await runManager?.handleChainError(e); throw e; }
  await runManager?.handleChainEnd(_coerceToDict(finalOutput, "output"));
  return finalOutput;
}
```

逻辑就是一个 for 循环：`nextStepInput` 从 `input` 开始，每步 `step.invoke` 的输出成为下一步的输入，最后 `this.last` 收尾。两个细节：每步用 `patchConfig` + `runManager?.getChild('seq:step:N')` 把子 run 挂到序列下并打上"第几步"的标签（trace 上你看到的 `seq:step:1/2/3` 就是这儿来的）；每步都 `raceWithSignal(promise, config.signal)`，所以中途 abort 能立刻停下。

### 4.2 _streamIterator：让流式"贯穿"整条链（全讲最关键一段）

`invoke` 是"一步出齐再下一步"。但 `.stream()` 要的是 token 边生成边往后流。秘密在 `_streamIterator`（L2088）——**它把每一步的 `transform` 串成一条生成器管道**：

```ts
async *_streamIterator(input: RunInput, options?): AsyncGenerator<RunOutput> {
  const runManager = await callbackManager_?.handleChainStart(...);
  const steps = [this.first, ...this.middle, this.last];
  let concatSupported = true;
  let finalOutput;
  async function* inputGenerator() { yield input; }          // 把单个输入变成一个流
  try {
    // ① 第一步：transform(输入流)
    let finalGenerator = steps[0].transform(inputGenerator(), patchConfig(otherOptions, {
      callbacks: runManager?.getChild(this.omitSequenceTags ? undefined : `seq:step:1`),
    }));
    // ② 后续每一步：transform(上一步的输出流) —— 串成一条生成器管道
    for (let i = 1; i < steps.length; i += 1) {
      finalGenerator = await steps[i].transform(finalGenerator, patchConfig(otherOptions, {
        callbacks: runManager?.getChild(this.omitSequenceTags ? undefined : `seq:step:${i + 1}`),
      }));
    }
    // ③ 消费最终生成器：边 yield 边累积 finalOutput
    for await (const chunk of finalGenerator) {
      options?.signal?.throwIfAborted();
      yield chunk;
      if (concatSupported) { /* 用 _concatOutputChunks 累积 finalOutput，失败则放弃 */ }
    }
  } catch (e) { await runManager?.handleChainError(e); throw e; }
  await runManager?.handleChainEnd(_coerceToDict(finalOutput, "output"));
}
```

<div class="lcj-key-note">这就是第00讲承诺的"<code>chain.stream()</code> 为什么能边生成边吐字"的最终答案。<strong>每一步都实现了 <code>transform</code>（流进流出，第02讲），于是把 <code>步骤[i].transform</code> 的输出生成器，直接当作 <code>步骤[i+1].transform</code> 的输入生成器</strong>，一路串下去，形成一条惰性的异步生成器管道。当你 <code>for await</code> 拉最末端时，需求会沿管道<strong>反向拉动</strong>每一步按需产出——提示模板先吐出消息，模型边收边生成 token，解析器边收 token 边吐字符串，全程没有任何一步"等齐再发"。对比第02讲基类那个"先 concat 收齐再 stream"的默认 <code>transform</code>，<code>RunnableSequence</code> 正是必须重写它的典型。</div>

### 4.3 pipe 扁平化与 from 工厂

`RunnableSequence` 重写了 `pipe`（L2186），让连续 `.pipe()` **不会套娃**，而是摊平成一条 `middle` 更长的序列：

```ts
pipe<NewRunOutput>(coerceable): RunnableSequence<RunInput, Exclude<NewRunOutput, Error>> {
  if (RunnableSequence.isRunnableSequence(coerceable)) {        // 接的是另一条序列 → 合并两条
    return new RunnableSequence({ first: this.first, middle: this.middle.concat([this.last, coerceable.first, ...coerceable.middle]), last: coerceable.last, ... });
  } else {                                                      // 接的是单个 → 把 last 推进 middle
    return new RunnableSequence({ first: this.first, middle: [...this.middle, this.last], last: _coerceToRunnable(coerceable), ... });
  }
}
```

这样 `a.pipe(b).pipe(c).pipe(d)` 得到的是**一条扁平的四步序列**，而不是嵌套四层——执行和 trace 都更干净。

最后是大家最常用的静态工厂 `from`（L2216）：

```ts
static from([first, ...runnables], nameOrFields?) {
  return new RunnableSequence({
    first: _coerceToRunnable(first),
    middle: runnables.slice(0, -1).map(_coerceToRunnable),
    last: _coerceToRunnable(runnables[runnables.length - 1]),
  });
}
```

`RunnableSequence.from([prompt, model, parser])` 就是把数组拆成首/中/尾，每个都 `_coerceToRunnable`（函数/对象自动包成 Runnable）。它和 `prompt.pipe(model).pipe(parser)` 等价——这是第00讲北极星 demo 的另一种写法。`getGraph`（L2153）则把各步的子图拼接成整条链的流程图（第05讲细讲 graph）。

## 第 5 章 · 小结 · 重要性盘点 · 下一讲预告 <span class="lcj-b lcj-skim">可跳读</span>
<a id="ch5"></a>

四个组合原语收一张表：

| 类 | 行 | 角色 | 关键点 |
|---|---|---|---|
| `RunnableBinding` | L1302 | 配置载体 | `_mergeConfig` 合并预绑定配置；四态全委派 `bound`；`configFactories` 撑起 `withListeners` |
| `RunnableEach` | L1605 | 列表映射 | `invoke(列表)` → `bound.batch`，子 run 挂父 run 下 |
| `RunnableRetry` | L1727 | 重试 | 继承 Binding + `p-retry`（jitter）；批量只重试失败下标 |
| `RunnableSequence` | L1925 | **`.pipe()` 真身** | `invoke` 逐步喂 + `seq:step` 标签；`_streamIterator` 串 `transform` 让流式贯穿；`pipe` 扁平化 |

一句话记住本讲：**`RunnableSequence` 把"一串 Runnable"接成一条惰性生成器管道，这就是 LCEL 既能 `invoke` 又能端到端 `stream` 的根本。** 其余三个（Binding/Each/Retry）是"包一个 Runnable 加点料"的装饰器变体。

<div class="lcj-note"><strong>下一讲预告 · 第 04 讲：组合原语②（base.ts L2261–3542）。</strong>读 base.ts 的最后一段，把剩下的原语清完：<code>RunnableMap</code>/<code>RunnableParallel</code>（并行跑多个 Runnable 合成一个对象输出）、<code>RunnableLambda</code>（把普通函数变 Runnable，<code>_coerceToRunnable</code> 的归宿）、<code>RunnableWithFallbacks</code>（失败降级到备用）、<code>RunnableAssign</code>/<code>RunnablePick</code>（第02讲 <code>assign</code>/<code>pick</code> 背后）、以及 <code>RunnableToolLike</code> 与 <code>convertRunnableToTool</code>（<code>asTool</code> 的实现）。读完第04讲，3542 行的 <code>base.ts</code> 就整本拆完了。</div>

> 本课配套源码：[github.com/langchain-ai/langchainjs](https://github.com/langchain-ai/langchainjs) @ `8f2ca17`。本讲覆盖 `runnables/base.ts` L1247–2260（Binding/Each/Retry/Sequence）。本系列为开源项目的源码学习笔记，著作权归 LangChain 原作者所有。
