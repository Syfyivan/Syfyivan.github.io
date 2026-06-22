---
title: "《LangChain.js 源码逐行精讲》第02讲 · Runnable 抽象基类：四态默认实现与三大模板方法"
date: 2026-06-22 13:00:00
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

> 这是《LangChain.js 源码逐行精讲》第02讲。第01讲读完了地基四件套（契约 + 配置管道）。这一讲终于进主角文件 `runnables/base.ts`，读它的**上半部分（L72–1246）**：抽象类 `Runnable` 本体。3542 行的 `base.ts` 我们分三讲拆——本讲是抽象基类，第03/04讲是各个具体组合原语。读完本讲，你会明白一句话：**所有 Runnable 共享的"骨架"全在这个抽象类里，子类只需填一个 `invoke`，其余四态、回调、追踪、组合、容错全部白送。** 源码取自锁定 commit `8f2ca17`。

<div class="lcj-toc"><strong>本讲导航</strong>
<a id="ch0"></a>

- 第 1 章 · 类型前奏与类的身份
- 第 2 章 · 四态的默认实现：只有 invoke 是抽象的
- 第 3 章 · 三大模板方法：回调与追踪如何自动织入（本讲核心）
- 第 4 章 · 组合入口：pipe / pick / assign
- 第 5 章 · 装饰器家族与 asTool
- 第 6 章 · 小结 · 重要性盘点 · 下一讲预告
</div>

## 第 1 章 · 类型前奏与类的身份 <span class="lcj-b lcj-key">重点</span>
<a id="ch1"></a>

`base.ts` 开头 70 行是 import（把第01讲的 `ensureConfig`/`mergeConfigs`/`patchConfig` 等全请进来，L38–45），然后 L72 起是几个类型别名：

```ts
export type RunnableFunc<RunInput, RunOutput, CallOptions extends RunnableConfig = RunnableConfig> = (
  input: RunInput,
  options: CallOptions | Record<string, any> | (Record<string, any> & CallOptions)
) => RunOutput | Promise<RunOutput>;                                    // L72

export type RunnableMapLike<RunInput, RunOutput> = {                    // L86
  [K in keyof RunOutput]: RunnableLike<RunInput, RunOutput[K]>;
};

export type RunnableLike<RunInput = any, RunOutput = any, CallOptions extends RunnableConfig = RunnableConfig> =
  | RunnableInterface<RunInput, RunOutput, CallOptions>                 // 真 Runnable
  | RunnableFunc<RunInput, RunOutput, CallOptions>                      // 普通函数
  | RunnableMapLike<RunInput, RunOutput>;                              // 值为 Runnable 的对象
```

`RunnableLike`（L90）是 `.pipe()` 能接受的东西的全集——**一个真 Runnable、一个普通函数、或一个"值都是 Runnable 的对象"**。这解释了为什么你能 `chain.pipe((x) => x.content)` 直接传函数：函数也是 `RunnableLike`，会被自动包装（第04讲 `_coerceToRunnable`）。

紧接着是一个到处被调用的小工具 `_coerceToDict`（L110）：

```ts
export function _coerceToDict(value: any, defaultKey: string) {
  return value && !Array.isArray(value) && !(value instanceof Date) && typeof value === "object"
    ? value
    : { [defaultKey]: value };
}
```

它把任意值规整成对象：已经是普通对象就原样返回，否则包成 `{ [defaultKey]: value }`。回调系统要求 run 的 input/output 是字典，所以追踪前都会 `_coerceToDict(input, "input")`。

### 1.1 abstract class Runnable 的声明

```ts
export abstract class Runnable<RunInput = any, RunOutput = any, CallOptions extends RunnableConfig = RunnableConfig>
  extends Serializable
  implements RunnableInterface<RunInput, RunOutput, CallOptions>
{
  protected lc_runnable = true;                                          // L134
  name?: string;
  getName(suffix?: string): string {
    const name = this.name ?? (this.constructor as any).lc_name() ?? this.constructor.name;
    return suffix ? `${name}${suffix}` : name;
  }
```

三个关键点：

- **`extends Serializable`**：每个 Runnable 都可序列化（H 组第30讲），这是 LCEL "链能 dump 成 JSON" 的根。
- **`implements RunnableInterface`**：兑现第01讲那份契约。
- **`protected lc_runnable = true`**：第01讲 `utils.ts` 的 `isRunnableInterface` 就是靠这个标志位认出"这是个 Runnable"。`getName()`（L138）三级兜底取名字：实例 `name` → 类的 `lc_name()` → 构造函数名，trace 里显示的就是它。

<div class="lcj-note">注意类名旁的泛型顺序 <code>&lt;RunInput, RunOutput, CallOptions&gt;</code> 和第01讲 <code>RunnableInterface</code> 完全一致。整个 LCEL 的类型推导，就是让这三个参数在 <code>.pipe()</code> 链上首尾相接：上一环的 <code>RunOutput</code> 必须能喂给下一环的 <code>RunInput</code>。</div>

## 第 2 章 · 四态的默认实现：只有 invoke 是抽象的 <span class="lcj-b lcj-core">核心</span>
<a id="ch2"></a>

这是抽象基类最精妙的设计：四态方法里，**只有 `invoke` 是 `abstract`，其余三个都有默认实现**。

```ts
abstract invoke(input: RunInput, options?: Partial<CallOptions>): Promise<RunOutput>;   // L145 唯一抽象方法
```

子类（哪怕是聊天模型这种复杂家伙）**最少只要实现 `invoke`**，就自动获得能用的 `batch`、`stream`、`transform`。来看这三个白送的默认实现。

### 2.1 batch 默认 = 并发跑 N 次 invoke

```ts
async batch(inputs, options?, batchOptions?): Promise<(RunOutput | Error)[]> {            // L261
  const configList = this._getOptionsList(options ?? {}, inputs.length);
  const maxConcurrency = configList[0]?.maxConcurrency ?? batchOptions?.maxConcurrency;
  const caller = new AsyncCaller({ maxConcurrency, onFailedAttempt: (e) => { throw e; } });
  const batchCalls = inputs.map((input, i) =>
    caller.call(async () => {
      try { return await this.invoke(input, configList[i]); }
      catch (e) { if (batchOptions?.returnExceptions) return e as Error; throw e; }
    })
  );
  return Promise.all(batchCalls);
}
```

默认 `batch` 就是"对每个输入调一次 `invoke`"，用 `AsyncCaller`（一个带 `maxConcurrency` 限流的并发器，靠 `p-queue`）控制并发。`returnExceptions` 决定单项失败是吞成 `Error` 还是抛出（呼应第01讲讲的三个重载）。注释明说："Subclasses should override this method if they can batch more efficiently"——能真批处理的子类（如某些模型 API）会重写它。

辅助方法 `_getOptionsList`（L207）负责把"单个 options 或 options 数组"规整成"长度对齐 inputs 的数组"，并对每项 `ensureConfig`；如果 batch 里传了单个 `runId`，它会警告"runId 只用于第一个元素"并把后续元素的 runId 抹掉（L220–231）——防止整批 run 共用一个 id 把 trace 搞乱。

### 2.2 stream 默认 = 包一层 invoke

```ts
async *_streamIterator(input, options?): AsyncGenerator<RunOutput> {                      // L297
  yield this.invoke(input, options);                          // 默认：只产出一个值
}

async stream(input, options?): Promise<IterableReadableStream<RunOutput>> {               // L310
  const config = ensureConfig(options);
  const wrappedGenerator = new AsyncGeneratorWithSetup({ generator: this._streamIterator(input, config), config });
  await wrappedGenerator.setup;                               // 先跑 setup，让首块的错误立即冒出
  return IterableReadableStream.fromAsyncGenerator(wrappedGenerator);
}
```

默认 `stream` 的 `_streamIterator` 只 `yield` 一次 `invoke` 的结果——也就是说，**不重写就没有真流式**，只是"一整块当一个 chunk 吐出来"。真正能 token-by-token 流式的子类（聊天模型）会重写 `_streamIterator`。`stream` 还做了一件事：先 `await wrappedGenerator.setup`，把首个 chunk 的初始化跑掉，让早期错误（比如鉴权失败）立刻抛出，而不是等你开始消费流才报错。

### 2.3 transform 默认 = 先收齐再 stream

```ts
async *transform(generator: AsyncGenerator<RunInput>, options): AsyncGenerator<RunOutput> {  // L297(下半)
  let finalChunk;
  for await (const chunk of generator) {
    if (finalChunk === undefined) finalChunk = chunk;
    else finalChunk = this._concatOutputChunks(finalChunk, chunk as any);   // 把流入的块拼起来
  }
  yield* this._streamIterator(finalChunk, ensureConfig(options));
}
```

默认 `transform`（输入是流）的策略是："**先把输入流全部 `concat` 成一个完整值，再走 `_streamIterator`**"。注释点明：能"边收输入边产出"的子类应重写它——这正是 `RunnableSequence` 要做的（下一讲），否则流式就会在每一环退化成"等齐再发"。`_concatOutputChunks`（L461）只是 `concat(first, second)` 的薄封装，`concat` 是 core 的通用"把两个 chunk 合并"工具（数组拼接、字符串相加、消息块合并都走它）。

<div class="lcj-key-note">把这一章总结成一句话：<strong>Runnable 用"默认实现 + 可重写"把四态铺成一张安全网。</strong>最简单的子类只实现 <code>invoke</code> 就能跑；越想要高性能流式/批处理，就重写越多默认方法。这是经典的<strong>模板方法模式</strong>——基类定骨架，子类填空。下一章的三个 <code>*WithConfig</code> 则是这套骨架里"自动织入回调追踪"的关节。</div>

## 第 3 章 · 三大模板方法：回调与追踪如何自动织入 <span class="lcj-b lcj-core">核心</span>
<a id="ch3"></a>

这是全 `base.ts` 最该吃透的一节。子类实现 `invoke` 时，几乎都不直接写业务逻辑，而是把逻辑塞进一个 `func`，交给 `_callWithConfig` 执行。为什么？因为这三个方法统一负责**"开始→执行→结束/出错"的回调生命周期 + 取消信号**，子类因此不必每个都手写 trace 代码。

### 3.1 _callWithConfig：非流式的执行模板

```ts
protected async _callWithConfig<T extends RunInput>(func, input: T, options?): Promise<RunOutput> {   // L359
  const config = ensureConfig(options);
  const callbackManager_ = await getCallbackManagerForConfig(config);
  const runManager = await callbackManager_?.handleChainStart(            // ① 开始：建一个 run
    this.toJSON(), _coerceToDict(input, "input"), config.runId, config?.runType,
    undefined, undefined, config?.runName ?? this.getName()
  );
  delete config.runId;                                                    // 用过即删，防子run继承
  let output;
  try {
    const promise = func.call(this, input, config, runManager);          // ② 执行真正的业务 func
    output = await raceWithSignal(promise, config.signal);               // 与 abort 信号赛跑
  } catch (e) {
    await runManager?.handleChainError(e);                               // ③a 出错：标记 run 失败
    throw e;
  }
  await runManager?.handleChainEnd(_coerceToDict(output, "output"));     // ③b 成功：标记 run 结束
  return output;
}
```

三步生命周期一目了然：`handleChainStart` 建 run（拿到 `runManager`）→ 跑 `func` → 成功 `handleChainEnd` / 失败 `handleChainError`。两个细节是亮点：

- **`raceWithSignal(promise, config.signal)`**（L385）：把业务 promise 和 abort 信号"赛跑"，信号先触发就抛中止错误——这就是第01讲那个 `signal` 字段最终被消费的地方。
- **`delete config.runId`**（L381）：runId 用完即删，避免被 `patchConfig` 往下传给子 run（呼应第01讲 `ensureConfig` 不继承 runId 的设计）。

<div class="lcj-key-note">理解了这个方法，你就理解了 LangChain "为什么 trace 是自动的"：<strong>任何 Runnable 的 invoke 只要走 <code>_callWithConfig</code>，它的开始/结束/报错就自动上报给所有回调处理器</strong>（LangSmith、streamEvents、自定义 handler 都在内）。子类只管写 <code>func</code> 里的业务，可观测性是基类的事。</div>

### 3.2 _batchWithConfig：批处理版同款

`_batchWithConfig`（L403）是 `_callWithConfig` 的批量版：为每个输入并行 `handleChainStart` 建一组 run，跑完统一 `handleChainEnd`，出错统一 `handleChainError`。结构对称，<span class="lcj-b lcj-skim">可跳读</span>，记住"它给批处理也织上了完整回调"即可。

### 3.3 _transformStreamWithConfig：流式的执行模板（最复杂）

流式版要难得多，因为它要在"边产出边追踪"的同时，记录最终输入/输出供 trace 收尾：

```ts
protected async *_transformStreamWithConfig<I, O>(inputGenerator, transformer, options?): AsyncGenerator<O> {  // L469
  let finalInput; let finalInputSupported = true;
  let finalOutput; let finalOutputSupported = true;
  const config = ensureConfig(options);
  const callbackManager_ = await getCallbackManagerForConfig(config);
  const outerThis = this;
  async function* wrapInputForTracing() {           // ① 包装输入流：边透传边累积 finalInput
    for await (const chunk of inputGenerator) {
      if (finalInputSupported) {
        if (finalInput === undefined) finalInput = chunk;
        else { try { finalInput = outerThis._concatOutputChunks(finalInput, chunk); }
               catch { finalInput = undefined; finalInputSupported = false; } }   // 不可 concat 就放弃记录
      }
      yield chunk;
    }
  }
  let runManager;
  try {
    const pipe = await pipeGeneratorWithSetup(      // ② 把 transformer 接到包装后的输入流上
      transformer.bind(this), wrapInputForTracing(),
      async () => callbackManager_?.handleChainStart(/* …lc_defers_inputs: true */),
      config.signal, config
    );
    delete config.runId;
    runManager = pipe.setup;
    let iterator = pipe.output;
    const streamEventsHandler = runManager?.handlers.find(isStreamEventsHandler);  // ③ 给 streamEvents 接出口
    if (streamEventsHandler && runManager) iterator = streamEventsHandler.tapOutputIterable(runManager.runId, iterator);
    const streamLogHandler = runManager?.handlers.find(isLogStreamHandler);        //    给 streamLog 接出口
    if (streamLogHandler && runManager) iterator = streamLogHandler.tapOutputIterable(runManager.runId, iterator);
    for await (const chunk of iterator) {            // ④ 逐块产出 + 累积 finalOutput
      yield chunk;
      if (finalOutputSupported) { /* concat 累积，失败则放弃 */ }
    }
  } catch (e) {
    await runManager?.handleChainError(e, undefined, undefined, undefined, { inputs: _coerceToDict(finalInput, "input") });
    throw e;
  }
  await runManager?.handleChainEnd(finalOutput ?? {}, undefined, undefined, undefined, { inputs: _coerceToDict(finalInput, "input") });
}
```

四个动作串起来：

1. **`wrapInputForTracing`**：在输入流外面套一层，一边透传 chunk、一边用 `_concatOutputChunks` 把它们累积成 `finalInput`（供结束时记录完整输入）。一旦某类型不支持 `concat`，就把 `finalInputSupported` 置 false 优雅放弃——**追踪是尽力而为，不能因为记不了输入就让主流程崩**。
2. **`pipeGeneratorWithSetup`**：把子类传来的 `transformer` 接到包装输入流上，并在 setup 阶段 `handleChainStart`（注意 `lc_defers_inputs: true`，告诉回调"输入待会儿在结束时补"）。
3. **`tapOutputIterable`**：如果回调里有 streamEvents / streamLog 处理器，就把输出迭代器"抽头"给它们——这就是 `.streamEvents()`（第27讲）能看到中间流的底层接线。
4. **逐块 `yield` + 累积 `finalOutput`**，最后 `handleChainEnd` 带上完整输入输出收尾。

<div class="lcj-note">这一段是"<strong>流式可观测性</strong>"的全部秘密：输出在 <code>yield</code> 给用户的<strong>同一时刻</strong>，也被 tap 给了 streamEvents/streamLog，并被 concat 进 finalOutput 供 trace 收尾。第00讲说"<code>.stream()</code> 能边生成边吐字、同时 LangSmith 还能看到完整 trace"——答案就在这里。子类（聊天模型、Sequence）实现流式 <code>transform</code> 时，只要把自己的产出逻辑写成 <code>transformer</code> 交给它，追踪全自动。</div>

## 第 4 章 · 组合入口：pipe / pick / assign <span class="lcj-b lcj-core">核心</span>
<a id="ch4"></a>

LCEL 的"组合"动作，入口就这三个方法，全在抽象基类上，所以**任何 Runnable 都能 `.pipe()`**：

```ts
pipe<NewRunOutput>(coerceable: RunnableLike<RunOutput, NewRunOutput>): Runnable<RunInput, Exclude<NewRunOutput, Error>> {  // L615
  return new RunnableSequence({ first: this, last: _coerceToRunnable(coerceable) });
}

pick(keys: string | string[]): Runnable {                                  // L626
  return this.pipe(new RunnablePick(keys) as Runnable);
}

assign(mapping: RunnableMapLike<...>): Runnable {                          // L633
  return this.pipe(new RunnableAssign(new RunnableMap({ steps: mapping })));
}
```

- **`pipe`**：把 `this` 和下一环包成一个 `RunnableSequence`（下一讲主角）。`_coerceToRunnable` 负责把"函数/对象"转成真 Runnable。返回类型 `Exclude<NewRunOutput, Error>` 是个细节：编译期把 `Error` 从输出类型里剔掉。
- **`pick`**：从字典输出里挑几个 key，本质是 `pipe` 一个 `RunnablePick`。
- **`assign`**：往字典输出里加字段，本质是 `pipe` 一个包了 `RunnableMap` 的 `RunnableAssign`。

<div class="lcj-key-note">三个组合方法<strong>全部建立在 <code>pipe</code> 之上</strong>，而 <code>pipe</code> 又只是 <code>new RunnableSequence</code>。所以 LCEL 看似有很多"运算符"，底层其实就一种组合：串联。<code>pick</code>/<code>assign</code> 只是预置了特定下一环的 <code>pipe</code> 糖。</div>

还有个低调但重要的辅助方法 `_separateRunnableConfigFromCallOptions`（L325）：它把混在一起的参数拆成两摞——一摞是"配置"（callbacks/tags/metadata/signal…，第01讲那些），另一摞是"调用选项"（子类特有的，如模型的 `stop`/`tools`）。带 `CallOptions` 扩展的子类（聊天模型）靠它把"框架配置"和"业务参数"分开处理。

## 第 5 章 · 装饰器家族与 asTool <span class="lcj-b lcj-key">重点</span>
<a id="ch5"></a>

抽象基类还挂了一排"返回新 Runnable"的装饰器方法，每个都把 `this` 包进一个专门的包装类（都在第03/04讲细讲），这里先认门：

| 方法 | 行 | 返回 | 作用 |
|---|---|---|---|
| `withRetry({stopAfterAttempt, onFailedAttempt})` | L156 | `RunnableRetry` | 加重试 |
| `withConfig(config)` | L175 | `RunnableBinding` | 绑定固定配置 |
| `withFallbacks(fields)` | L192 | `RunnableWithFallbacks` | 失败时降级到备用 Runnable |
| `withListeners({onStart,onEnd,onError})` | L1198 | `RunnableBinding` | 挂生命周期监听（用 `RootListenersTracer`） |
| `asTool(fields)` | L1238 | `RunnableToolLike` | 把 Runnable 变成可被模型调用的工具 |

```ts
withRetry(fields?): RunnableRetry<...> {
  return new RunnableRetry({ bound: this, kwargs: {}, config: {}, maxAttemptNumber: fields?.stopAfterAttempt, ...fields });  // L161
}
withConfig(config): Runnable<...> {
  return new RunnableBinding({ bound: this, config, kwargs: {} });                                                           // L179
}
```

它们的共同模式是 `{ bound: this, ... }`——把当前 Runnable 当作"被装饰对象"塞进包装类的 `bound` 字段。这是**装饰器模式**：包装类对外仍是个 Runnable，对内在调用前后加上重试/配置/降级/监听的逻辑。

<div class="lcj-note"><code>asTool</code>（L1238）尤其有意思：它把一个普通 Runnable 暴露成"模型能调用的工具"（<code>RunnableToolLike</code>），让你能把任意 LCEL 链当成 tool 挂给 Agent。这是 LCEL 与 tool-calling 打通的桥（F 组第23讲、G 组再回来）。还有 <code>static isRunnable(thing)</code>（L1183）：静态版的类型守卫，等价于第01讲的 <code>isRunnableInterface</code>，判断任意值是不是 Runnable。</code></div>

最后，本讲范围内还有两个面向用户的流式 API：`streamLog`（L687，已 `@deprecated`，建议用 `.stream()`）产出 JSONPatch 形式的运行日志；`streamEvents`（L854 起一长串重载 + 实现）产出结构化事件流。两者的实现都依赖第3.3节 `_transformStreamWithConfig` 里的 `tapOutputIterable` 接线。它们的引擎细节留到 **G 组第27讲**（tracers/event_stream + log_stream）专门拆，本讲只需知道"它们是抽象基类提供的两个高层流式出口"。

## 第 6 章 · 小结 · 重要性盘点 · 下一讲预告 <span class="lcj-b lcj-skim">可跳读</span>
<a id="ch6"></a>

抽象类 `Runnable`（L124–1246）干的事，可以收成一张图：

- **身份**：`extends Serializable implements RunnableInterface`，`lc_runnable=true`。<span class="lcj-b lcj-core">核心</span>
- **四态**：只有 `invoke` 抽象；`batch`/`stream`/`transform` 给默认实现（模板方法 + 可重写）。<span class="lcj-b lcj-core">核心</span>
- **三大 `*WithConfig`**：把回调生命周期 + abort 信号 + streamEvents/streamLog 接线统一织入，子类只写业务 `func`。<span class="lcj-b lcj-core">核心</span>
- **组合**：`pipe`/`pick`/`assign` 全部归结到 `new RunnableSequence`。<span class="lcj-b lcj-core">核心</span>
- **装饰器**：`withRetry`/`withConfig`/`withFallbacks`/`withListeners`/`asTool` 各包一个 `{bound:this}` 的包装类。<span class="lcj-b lcj-key">重点</span>

一句话记住本讲：**子类填一个 `invoke`，抽象基类白送其余一切——四态、回调追踪、组合、容错。** 这就是为什么 LangChain 里加一个新组件（新模型、新解析器）的成本极低。

<div class="lcj-note"><strong>下一讲预告 · 第 03 讲：组合原语①（base.ts L1247–2260）。</strong>抽象基类讲完，开始读具体子类。第03讲读四个：<code>RunnableBinding</code>（<code>withConfig</code> 返回的那个，如何"绑定"配置/参数）、<code>RunnableEach</code>（对列表逐项跑）、<code>RunnableRetry</code>（<code>withRetry</code> 背后，基于 <code>p-retry</code>）、以及重头戏 <code>RunnableSequence</code>——<code>.pipe()</code> 串起来的那条链到底如何把每一环的 <code>invoke</code> 和 <code>transform</code> 接起来、如何让流式贯穿整条链。本讲埋的所有"下一讲细讲"，从 03 开始一一兑现。</div>

> 本课配套源码：[github.com/langchain-ai/langchainjs](https://github.com/langchain-ai/langchainjs) @ `8f2ca17`。本讲覆盖 `runnables/base.ts` L72–1246（抽象类 Runnable 本体）。本系列为开源项目的源码学习笔记，著作权归 LangChain 原作者所有。
