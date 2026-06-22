---
title: "《LangChain.js 源码逐行精讲》第01讲 · 契约与配置管道：types / config / utils / iter"
date: 2026-06-22 12:30:00
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

> 这是《LangChain.js 源码逐行精讲》第01讲。第00讲建立了心智模型：**一切皆 Runnable，用 `.pipe()` 组合就是 LCEL**。这一讲开始进 `runnables/` 目录读代码，但**不是**先读 3542 行的 `base.ts`——而是先读它脚下的四块地基：`types.ts`（所有 Runnable 必须遵守的契约）、`config.ts`（每次 `invoke` 都要穿过的配置管道）、`utils.ts` 与 `iter.ts`（流式与上下文的小工具）。把这四个文件吃透，下一讲读 `base.ts` 才不会被 `ensureConfig`、`mergeConfigs`、`consumeIteratorInContext` 这些到处出现的名字绊住。源码取自锁定 commit `8f2ca17`。

<div class="lcj-toc"><strong>本讲导航</strong>
<a id="ch0"></a>

- 第 1 章 · 为什么先读这四个文件
- 第 2 章 · types.ts：RunnableInterface 与 RunnableConfig 两份契约
- 第 3 章 · config.ts：每次调用都要穿过的配置管道
- 第 4 章 · utils.ts：运行时守卫、事件过滤器、base64url
- 第 5 章 · iter.ts：迭代器守卫与"保上下文消费"
- 第 6 章 · 小结 · 重要性盘点 · 下一讲预告
</div>

## 第 1 章 · 为什么先读这四个文件 <span class="lcj-b lcj-key">重点</span>
<a id="ch1"></a>

`runnables/` 目录里 `base.ts` 是绝对主角，但它 import 的第一批东西，就是这四个文件里定义的类型和函数。我们按**被依赖在前**的顺序读：

```
types.ts   ← 纯类型，零依赖：定义"Runnable 是什么形状"
config.ts  ← 依赖 types：定义"一次调用的配置怎么造、怎么并、怎么传给子调用"
utils.ts   ← 依赖 types：三个零散小工具
iter.ts    ← 依赖 types + config：消费迭代器时如何不丢配置上下文
```

<div class="lcj-note">这四个文件加起来不到 600 行，却是整个 LCEL 的"宪法 + 行政流程"。<code>types.ts</code> 是宪法（规定权利义务），<code>config.ts</code> 是行政流程（每次办事怎么走流程）。读懂它们，<code>base.ts</code> 里那些 <code>_callWithConfig</code> / <code>patchConfig</code> 的调用就都是"按流程办事"而已。</div>

## 第 2 章 · types.ts：两份契约 <span class="lcj-b lcj-core">核心</span>
<a id="ch2"></a>

`types.ts` 一共 109 行，定义了四样东西：两个小类型、一个核心接口 `RunnableInterface`、一个配置接口 `RunnableConfig`，外加图渲染用的 `Edge`/`Node`。先看开头的 import 和两个小类型：

```ts
import type { SerializableInterface } from "../load/serializable.js";
import type { BaseCallbackConfig } from "../callbacks/manager.js";
import type { IterableReadableStreamInterface } from "../types/_internal.js";
import { InteropZodType } from "../utils/types/zod.js";

export type RunnableBatchOptions = {
  /** @deprecated Pass in via the standard runnable config object instead */
  maxConcurrency?: number;
  returnExceptions?: boolean;
};

export type RunnableIOSchema = {
  name?: string;
  schema: InteropZodType;
};
```

- `RunnableBatchOptions`（L6–10）是 `batch()` 的额外选项。`maxConcurrency` 已标 `@deprecated`——并发度现在统一从 config 里传，这里只为兼容旧调用保留。`returnExceptions` 决定批处理里某一项失败时是抛错还是把 `Error` 当结果返回（下面 `batch` 的重载会用到）。
- `RunnableIOSchema`（L12–15）描述一个输入/输出 schema，`InteropZodType` 是 LangChain 对"Zod 各版本/各 schema 库"的统一封装类型（`@standard-schema` 那套）。

### 2.1 RunnableInterface：所有 Runnable 的形状

接下来是本文件、也是整个 core 最重要的接口（L23–63）：

```ts
export interface RunnableInterface<
  RunInput = any,
  RunOutput = any,
  CallOptions extends RunnableConfig = RunnableConfig,
> extends SerializableInterface {
  lc_serializable: boolean;

  invoke(input: RunInput, options?: Partial<CallOptions>): Promise<RunOutput>;

  batch(
    inputs: RunInput[],
    options?: Partial<CallOptions> | Partial<CallOptions>[],
    batchOptions?: RunnableBatchOptions & { returnExceptions?: false }
  ): Promise<RunOutput[]>;
  batch(/* …returnExceptions: true → */): Promise<(RunOutput | Error)[]>;
  batch(/* …通用重载 → */): Promise<(RunOutput | Error)[]>;

  stream(
    input: RunInput,
    options?: Partial<CallOptions>
  ): Promise<IterableReadableStreamInterface<RunOutput>>;

  transform(
    generator: AsyncGenerator<RunInput>,
    options: Partial<CallOptions>
  ): AsyncGenerator<RunOutput>;

  getName(suffix?: string): string;
}
```

三个泛型参数是理解整个 LCEL 类型系统的钥匙：

| 泛型 | 含义 | 例子（在 `prompt | model | parser` 里） |
|---|---|---|
| `RunInput` | 输入类型 | prompt 段是 `{lang, text}` 对象 |
| `RunOutput` | 输出类型 | parser 段是 `string` |
| `CallOptions` | 调用选项，必须是 `RunnableConfig` 的子类型 | 聊天模型会扩成带 `tools`、`stop` 的 options |

<div class="lcj-key-note">注意 <strong>四个方法 = 第00讲讲的四态</strong>：<code>invoke</code>（一进一出）、<code>batch</code>（一批进一批出）、<code>stream</code>（一进、流式出）、<code>transform</code>（流进、流出）。<code>transform</code> 是 <code>.pipe()</code> 串联能"流式贯穿"的底层原因——后面第 02、03 讲会看到 <code>RunnableSequence</code> 正是把每一环的 <code>transform</code> 接起来。这里只需记住：<strong>任何想当 Runnable 的东西，都得实现这四个方法</strong>。</div>

`batch` 有三个重载，区别只在返回类型：传 `returnExceptions: false`（或不传）→ `Promise<RunOutput[]>`（出错就抛）；传 `returnExceptions: true` → `Promise<(RunOutput | Error)[]>`（出错的项变成 `Error` 留在数组里）。第三个是兜底通用重载。这是 TypeScript 用重载表达"参数的值改变返回类型"的标准手法。

接口还 `extends SerializableInterface` 并要求 `lc_serializable: boolean`——这呼应第00讲说的"LCEL 链可序列化"，每个 Runnable 都自带序列化身份（H 组第 30 讲细讲）。

### 2.2 Edge / Node：图渲染的两个节点类型

```ts
export interface Edge { source: string; target: string; data?: string; conditional?: boolean; }
export interface Node { id: string; name: string; data: RunnableIOSchema | RunnableInterface; metadata?: Record<string, any>; }
```

`Edge`/`Node`（L65–78）是 `Runnable.getGraph()` 把一条链画成流程图时用的——一个节点要么是一段 IO schema，要么是一个子 Runnable。这块属于可视化，第 05 讲讲 `graph.ts` 时再回来，这里 <span class="lcj-b lcj-skim">可跳读</span>。

### 2.3 RunnableConfig：贯穿全场的"调用上下文"

文件最后是 `RunnableConfig`（L80–109），它会出现在**每一个** `invoke/stream/batch` 的第二参数里：

```ts
export interface RunnableConfig<
  ConfigurableFieldType extends Record<string, any> = Record<string, any>,
> extends BaseCallbackConfig {
  configurable?: ConfigurableFieldType;   // 运行时可配置字段
  recursionLimit?: number;                // 递归上限，默认 25
  maxConcurrency?: number;                // 最大并行数
  timeout?: number;                       // 超时（毫秒）
  signal?: AbortSignal;                   // 中止信号
}
```

它 `extends BaseCallbackConfig`，所以除了上面这五个字段，还隐含继承了 `callbacks`、`tags`、`metadata`、`runName`、`runId` 等（来自回调系统，G 组第 24 讲讲）。把这两部分合起来，就是一次调用能携带的全部"上下文"：

<div class="lcj-note"><strong>configurable</strong> 是"运行时改参数"的入口：你可以把某个字段声明为可配置，调用时通过 <code>config.configurable</code> 覆盖它（典型如运行时切换 model）。<strong>recursionLimit</strong> 防止 <code>RunnableLambda</code> 之类无限递归（默认 25，超过抛错）。<strong>signal</strong> 是标准 Web <code>AbortSignal</code>，用来取消整条链——下面 <code>config.ts</code> 会看到 <code>timeout</code> 是怎么被转换成 <code>signal</code> 的。</div>

## 第 3 章 · config.ts：每次调用都要穿过的配置管道 <span class="lcj-b lcj-core">核心</span>
<a id="ch3"></a>

`config.ts`（303 行）是本讲的主菜。它导出 6 个函数 + 1 个常量，全是"如何处理一份 `RunnableConfig`"。开头：

```ts
import { CallbackManager, ensureHandler } from "../callbacks/manager.js";
import { AsyncLocalStorageProviderSingleton } from "../singletons/index.js";
import { RunnableConfig } from "./types.js";

export const DEFAULT_RECURSION_LIMIT = 25;
export { type RunnableConfig };

const CONFIGURABLE_TO_TRACING_METADATA_EXCLUDED_KEYS = new Set(["api_key"]);
const PRIMITIVES = new Set(["string", "number", "boolean"]);
```

两个模块级常量先记住：`api_key` 被列入"不准进 tracing metadata"的黑名单（防密钥泄漏到 LangSmith），`PRIMITIVES` 用来判断哪些 configurable 值"够简单"可以提升成 metadata。

### 3.1 _getTracingInheritableMetadataFromConfig：把可配置值提升为可观测元数据

```ts
export function _getTracingInheritableMetadataFromConfig(
  config: RunnableConfig
): Record<string, unknown> | undefined {
  const configurable = config.configurable ?? {};
  const metadata = config.metadata ?? {};
  const langSmithMetadata: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(configurable)) {
    if (
      !key.startsWith("__") &&                                        // 跳过内部字段
      !Object.prototype.hasOwnProperty.call(metadata, key) &&         // 不覆盖已有 metadata
      !CONFIGURABLE_TO_TRACING_METADATA_EXCLUDED_KEYS.has(key) &&      // 跳过 api_key
      PRIMITIVES.has(typeof value)                                    // 只要 string/number/boolean
    ) {
      langSmithMetadata[key] = value;
    }
  }
  return Object.keys(langSmithMetadata).length > 0 ? langSmithMetadata : undefined;
}
```

它的作用：把 `configurable` 里那些"简单标量、非内部、非密钥、还没在 metadata 里"的字段，复制一份进 LangSmith 的可观测元数据。这样你在 LangSmith 上能按这些运行时参数（比如 `model`、`temperature`）筛选 trace。四个 `&&` 条件就是四道安全闸，缺一不可。<span class="lcj-b lcj-skim">可跳读</span> 细节，但记住"configurable 会悄悄进 trace metadata"这个事实。

### 3.2 getCallbackManagerForConfig：从 config 造回调管理器

```ts
export async function getCallbackManagerForConfig(config?: RunnableConfig) {
  return CallbackManager._configureSync(
    config?.callbacks, undefined, config?.tags, undefined,
    config?.metadata, undefined,
    { tracerInheritableMetadata: config ? _getTracingInheritableMetadataFromConfig(config) : undefined }
  );
}
```

一行话：把 config 里的 `callbacks/tags/metadata` 交给 `CallbackManager._configureSync` 组装成一个回调管理器，顺带把上一节算出的 tracing metadata 塞进去。`CallbackManager` 本体是 G 组第 25 讲的内容，这里只需知道"每次 invoke 都会从 config 现造一个回调管理器"。

### 3.3 mergeConfigs：六种 callbacks 合并的硬骨头 <span class="lcj-b lcj-key">重点</span>

`mergeConfigs` 把多份 config "叠"成一份。为什么需要？因为一条链有多层，外层 config、`.withConfig()` 绑的 config、调用时传的 config 要合并。它逐 key 处理，每种 key 有自己的合并语义：

```ts
export function mergeConfigs<CallOptions extends RunnableConfig>(
  ...configs: (CallOptions | RunnableConfig | undefined | null)[]
): Partial<CallOptions> {
  const copy: Partial<CallOptions> = {};
  for (const options of configs.filter((c): c is CallOptions => !!c)) {
    for (const key of Object.keys(options)) {
      if (key === "metadata") {
        copy[key] = { ...copy[key], ...options[key] };          // 浅合并
      } else if (key === "tags") {
        const baseKeys: string[] = copy[key] ?? [];
        copy[key] = [...new Set(baseKeys.concat(options[key] ?? []))];  // 并集去重
      } else if (key === "configurable") {
        copy[key] = { ...copy[key], ...options[key] };          // 浅合并
      } else if (key === "timeout") {
        // 取两者更小的超时
        if (copy.timeout === undefined) copy.timeout = options.timeout;
        else if (options.timeout !== undefined) copy.timeout = Math.min(copy.timeout, options.timeout);
      } else if (key === "signal") {
        // 用 AbortSignal.any 把多个信号合成一个
        /* …见下 */
      } else if (key === "callbacks") {
        /* …六种情况，见下 */
      } else {
        const typedKey = key as keyof CallOptions;
        copy[typedKey] = options[typedKey] ?? copy[typedKey];   // 其余：后者覆盖前者
      }
    }
  }
  return copy as Partial<CallOptions>;
}
```

每种 key 的合并策略是有讲究的，值得记成一张表：

| key | 合并语义 | 为什么 |
|---|---|---|
| `metadata` / `configurable` | 浅合并，后者覆盖同名 | 它们是字典，叠加即可 |
| `tags` | 并集 + `Set` 去重 | 标签是集合语义，不该重复 |
| `timeout` | 取 `Math.min` | 多层超时应以最严格的为准 |
| `signal` | `AbortSignal.any([...])` | 任一信号中止则整体中止 |
| `callbacks` | 六种情况分别处理 | callbacks 有三种形态，两两组合 |
| 其余 | `options[key] ?? copy[key]` | 后者非空则覆盖 |

`signal` 的合并（L70–83）用了 `AbortSignal.any`——它能把多个信号合成一个"任意一个触发就触发"的复合信号；老环境没有 `any` 时退化成"用后者覆盖"：

```ts
} else if (key === "signal") {
  if (copy.signal === undefined) copy.signal = options.signal;
  else if (options.signal !== undefined) {
    if ("any" in AbortSignal) {
      copy.signal = (AbortSignal as any).any([copy.signal, options.signal]);
    } else {
      copy.signal = options.signal;
    }
  }
}
```

最硬的是 `callbacks` 分支（L84–140）。注释里写得很直白："callbacks can be either undefined, Array&lt;handler&gt; or manager，所以合并两个 callbacks 有 6 种情况"。把它拆成"提供方是数组 / 提供方是 manager"两大类，再各分"基底是空 / 数组 / manager"三小类：

<details class="lcj-fold"><summary>展开：callbacks 六种合并情况逐一<span class="lcj-b lcj-skim" style="margin-left:8px">可跳读</span></summary>

`providedCallbacks` 是数组时（L89–101）：

- 基底空 → 直接用提供的数组。
- 基底也是数组 → `concat` 两个数组。
- 基底是 manager → 复制 manager，把提供的每个 handler `addHandler` 进去。

`providedCallbacks` 是 manager 时（L102–139）：

- 基底空 → 直接用提供的 manager。
- 基底是数组 → 复制提供的 manager，把基底里的 handler 加进去。
- 基底也是 manager → `new CallbackManager(...)`，手动把两边的 `handlers`、`inheritableHandlers`、`tags`、`inheritableTags`、`metadata` 全部合并。

核心意图：**不管两边是什么形态，合并后所有回调处理器都不丢**。这就是为什么你在外层和内层都挂 callback，trace 上两个都能看到。

</details>

### 3.4 ensureConfig：补全默认值 + 读隐式上下文 + 超时转信号 <span class="lcj-b lcj-core">核心</span>

`ensureConfig` 是全 core 出现频率最高的函数之一——任何方法拿到 `config?` 后，第一件事几乎都是 `const config = ensureConfig(config)`，确保后续代码能安全访问 `config.tags`、`config.metadata` 等而不必处处判空。

```ts
export function ensureConfig<CallOptions extends RunnableConfig>(
  config?: CallOptions
): CallOptions {
  const implicitConfig = AsyncLocalStorageProviderSingleton.getRunnableConfig();
  let empty: RunnableConfig = { tags: [], metadata: {}, recursionLimit: 25, runId: undefined };
  if (implicitConfig) {
    const { runId, runName, ...rest } = implicitConfig;   // ① 隐式 config 但剔除 runId/runName
    empty = Object.entries(rest).reduce((cur, [k, v]) => { if (v !== undefined) cur[k] = v; return cur; }, empty);
  }
  if (config) {                                            // ② 显式 config 覆盖
    empty = Object.entries(config).reduce((cur, [k, v]) => { if (v !== undefined) cur[k] = v; return cur; }, empty);
  }
  // ③ configurable.model 提升为 metadata.model
  if (empty?.configurable) {
    if (typeof empty.configurable.model === "string" && empty.metadata?.model === undefined) {
      if (!empty.metadata) empty.metadata = {};
      empty.metadata.model = empty.configurable.model;
    }
  }
  // ④ timeout → AbortSignal，并删掉 timeout
  if (empty.timeout !== undefined) {
    if (empty.timeout <= 0) throw new Error("Timeout must be a positive number");
    const originalTimeoutMs = empty.timeout;
    const timeoutSignal = AbortSignal.timeout(originalTimeoutMs);
    if (!empty.metadata) empty.metadata = {};
    if (empty.metadata.timeoutMs === undefined) empty.metadata.timeoutMs = originalTimeoutMs;
    if (empty.signal !== undefined) {
      if ("any" in AbortSignal) empty.signal = (AbortSignal as any).any([empty.signal, timeoutSignal]);
    } else {
      empty.signal = timeoutSignal;
    }
    delete empty.timeout;   // ← 关键
  }
  return empty as CallOptions;
}
```

四步逐一说清：

1. **读隐式上下文**（L156–177）：`AsyncLocalStorageProviderSingleton.getRunnableConfig()` 从 AsyncLocalStorage 里取当前"线程局部"的 config。这是 LangChain 能"自动把外层 config 传给深层嵌套调用"的魔法所在。但**故意剔除 `runId` 和 `runName`**——注释解释：否则子 run 会错误继承父 run 的 id，trace 树就乱了。
2. **显式覆盖**（L178–189）：传入的 `config` 再叠一层，只覆盖非 `undefined` 的字段。
3. **model 提升**（L190–200）：如果 `configurable.model` 是字符串且 metadata 还没有 model，就把它复制进 `metadata.model`（方便 trace 显示用了哪个模型）。
4. **timeout → signal**（L201–238）：把数字 `timeout` 转成 `AbortSignal.timeout(ms)`，与已有 signal 用 `any` 合并，原始毫秒数存进 `metadata.timeoutMs` 备用，**然后 `delete empty.timeout`**。

<div class="lcj-key-note">第 4 步的 <code>delete empty.timeout</code> 是本函数最值得学的设计。源码注释列了四条理由，核心是<strong>幂等归一化</strong>：<code>ensureConfig</code> 会在调用栈里被反复调用，如果留着 <code>timeout</code>，每次都会再生成一个新的超时信号并 <code>any</code> 叠加，有效超时会变得不可预测。删掉 <code>timeout</code>、只留 <code>signal</code> 作为唯一的取消通道，既保证多次调用结果一致，又避免"数字超时"和"信号超时"两套机制打架。读源码读到这种"为什么删一个字段"的注释，往往藏着踩过坑的工程智慧。</div>

### 3.5 patchConfig：在已有 config 上打补丁

```ts
export function patchConfig<CallOptions extends RunnableConfig>(
  config: Partial<CallOptions> = {},
  { callbacks, maxConcurrency, recursionLimit, runName, configurable, runId }: RunnableConfig = {}
): Partial<CallOptions> {
  const newConfig = ensureConfig(config);
  if (callbacks !== undefined) {
    delete newConfig.runName;          // 换了 callbacks 就清掉 runName
    newConfig.callbacks = callbacks;
  }
  if (recursionLimit !== undefined) newConfig.recursionLimit = recursionLimit;
  if (maxConcurrency !== undefined) newConfig.maxConcurrency = maxConcurrency;
  if (runName !== undefined) newConfig.runName = runName;
  if (configurable !== undefined) newConfig.configurable = { ...newConfig.configurable, ...configurable };
  if (runId !== undefined) delete newConfig.runId;
  return newConfig;
}
```

`patchConfig` 先 `ensureConfig` 归一化，再选择性覆盖几个字段。两个细节值得记：换 `callbacks` 时会 `delete runName`（因为 runName 只该属于原来那次 run）；传了 `runId` 时反而是 `delete newConfig.runId`（让子调用重新生成自己的 runId，不复用）。父 runnable 调子 runnable 前，几乎都会 `patchConfig` 一下，把新的 callbacks/runName 传下去。

### 3.6 pickRunnableConfigKeys：只挑该往下传的键

```ts
export function pickRunnableConfigKeys<CallOptions extends Record<string, any>>(
  config?: CallOptions
): Partial<RunnableConfig> | undefined {
  if (!config) return undefined;
  return {
    configurable: config.configurable, recursionLimit: config.recursionLimit,
    callbacks: config.callbacks, tags: config.tags, metadata: config.metadata,
    maxConcurrency: config.maxConcurrency, timeout: config.timeout, signal: config.signal,
    // @ts-expect-error - Store is a LangGraph-specific property
    // which wewant to pass through to all runnables.
    store: config.store,
  };
}
```

它从一个可能很杂的对象里，**只挑出应当传给子 Runnable 的那几个键**。下一节 `iter.ts` 在跨迭代器边界保存上下文时就用它来"瘦身"。注意最后那个 `store`：它不是 core 自己的字段，而是 LangGraph 注入的（`@ts-expect-error` 压掉类型报错，注释里还留着一个 `wewant` 的拼写——这是源码原样，逐行课就如实呈现）。它要确保连工具都能拿到 LangGraph 的 store。

## 第 4 章 · utils.ts：三个零散小工具 <span class="lcj-b lcj-skim">可跳读</span>
<a id="ch4"></a>

`utils.ts` 只有 82 行，三样东西：

```ts
export function isRunnableInterface(thing: any): thing is RunnableInterface {
  return thing ? thing.lc_runnable : false;
}
```

`isRunnableInterface`（L5–7）是个**鸭子类型守卫**：看对象上有没有 `lc_runnable` 标志位。`.pipe()` 接收"Runnable 或普通函数/对象"时，靠它区分要不要把参数包成 Runnable（第 04 讲的 `_coerceToRunnable` 会用到）。

```ts
export class _RootEventFilter {
  includeNames?; includeTypes?; includeTags?;
  excludeNames?; excludeTypes?; excludeTags?;
  constructor(fields) { /* 把六个数组存上 */ }
  includeEvent(event: StreamEvent, rootType: string): boolean { /* …见下 */ }
}
```

`_RootEventFilter`（L16–76）服务于 `streamEvents`（G 组第 27 讲）。它存六个数组——三个 include、三个 exclude——按 name/type/tag 三个维度过滤事件。`includeEvent` 的逻辑（L45–75）是：先看有没有任何 include 条件（都没有则默认包含），命中任一 include 则纳入；再用 exclude 条件做减法。类注释里自己写了 `TODO: Refactor and remove`——作者也觉得这块该重构，逐行课照实记下，不必深究。

```ts
export const toBase64Url = (str: string): string => {
  const encoded = btoa(str);
  return encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
```

`toBase64Url`（L78–82）是标准的 base64 → base64url 转换：`btoa` 后把 `+`→`-`、`/`→`_`、去掉尾部 `=`。图渲染等地方生成 URL-safe 串时用。一个纯函数，看过即懂。

## 第 5 章 · iter.ts：迭代器守卫与"保上下文消费" <span class="lcj-b lcj-key">重点</span>
<a id="ch5"></a>

`iter.ts`（94 行）前半是四个类型守卫，后半是三个"消费迭代器"的 helper。守卫部分（L5–40）很直白：

```ts
export function isIterableIterator(thing): thing is IterableIterator<unknown> {
  return typeof thing === "object" && thing !== null &&
    typeof (thing as Generator)[Symbol.iterator] === "function" &&
    typeof (thing as Generator).next === "function";   // 同时有 [Symbol.iterator] 和 next
}
export const isIterator = (x): x is Iterator<unknown> =>
  x != null && typeof x === "object" && "next" in x && typeof x.next === "function";
export function isAsyncIterable(thing): thing is AsyncIterable<unknown> { /* 看 [Symbol.asyncIterator] */ }
export function isAsyncGenerator(x): x is AsyncGenerator { /* 看 .next */ }
```

四个守卫分别识别"可迭代迭代器 / 迭代器 / 异步可迭代 / 异步生成器"。`isIterableIterator` 特意同时检查 `[Symbol.iterator]` 和 `next` 两个方法，注释说是为了**避免把数组/Set 误判成迭代器**（数组有 `[Symbol.iterator]` 但没有 `next`）。

### 5.1 consumeAsyncGenerator：跑干一个异步生成器

```ts
export async function consumeAsyncGenerator<T, TReturn>(
  generator: AsyncGenerator<T, TReturn>,
  onYield?: (value: T) => Promise<void> | void
): Promise<TReturn> {
  try {
    let iterResult = await generator.next();
    while (!iterResult.done) {
      await onYield?.(iterResult.value);
      iterResult = await generator.next();
    }
    return iterResult.value;     // done 时的 value 就是生成器的 return 值
  } finally {
    await generator.return?.(undefined as TReturn);   // 确保清理
  }
}
```

它把生成器一路 `next()` 跑到 `done`，每个产出值喂给可选的 `onYield` 回调，最后返回生成器的 return 值。`finally` 里调 `generator.return?.()` 保证即使中途出错也能触发生成器的清理逻辑。一个稳健的"跑干生成器"工具。

### 5.2 consumeIteratorInContext：跨迭代器边界保住配置上下文 <span class="lcj-b lcj-core">核心</span>

最后两个函数是本讲的"题眼"，也是 LangChain 流式 + AsyncLocalStorage 配合的精髓：

```ts
export function* consumeIteratorInContext<T>(
  context: Partial<RunnableConfig> | undefined,
  iter: IterableIterator<T>
): IterableIterator<T> {
  while (true) {
    const { value, done } = AsyncLocalStorageProviderSingleton.runWithConfig(
      pickRunnableConfigKeys(context),   // ← 用第 3.6 节那个"瘦身"函数
      iter.next.bind(iter),
      true
    );
    if (done) break;
    else yield value;
  }
}

export async function* consumeAsyncIterableInContext<T>(
  context: Partial<RunnableConfig> | undefined,
  iter: AsyncIterable<T>
): AsyncIterableIterator<T> {
  const iterator = iter[Symbol.asyncIterator]();
  while (true) {
    const { value, done } = await AsyncLocalStorageProviderSingleton.runWithConfig(
      pickRunnableConfigKeys(context),
      iterator.next.bind(iter),
      true
    );
    if (done) break;
    else yield value;
  }
}
```

要理解它，先要知道一个陷阱：**AsyncLocalStorage 的上下文，不会自动穿过 `yield` 边界**。当你 `for await (const x of someGenerator)` 时，每次 `.next()` 恢复执行的"异步上下文"未必还是当初创建生成器时的那个。于是嵌套 Runnable 流式输出时，深层代码可能丢掉外层的 callbacks/tags。

<div class="lcj-key-note">这两个函数的解法：<strong>每次调用迭代器的 <code>.next()</code> 都包在 <code>runWithConfig</code> 里</strong>，显式地把 <code>pickRunnableConfigKeys(context)</code> 挑出来的那份配置重新"铺"到当前异步上下文上，再执行 <code>next()</code>。这样无论 <code>next()</code> 内部跑到多深，都能从 AsyncLocalStorage 读到正确的 config。<code>pickRunnableConfigKeys</code> 在这里的作用是只携带"该传下去"的键（configurable/callbacks/tags/… 和 LangGraph 的 store），不把 runId 之类的也带过去。两个版本一个同步迭代器、一个异步可迭代，逻辑对称。这就是为什么 LangChain 的流式链，深到第 N 层的回调依然能正确归属到顶层 run。</div>

## 第 6 章 · 小结 · 重要性盘点 · 下一讲预告 <span class="lcj-b lcj-skim">可跳读</span>
<a id="ch6"></a>

把这四个文件串成一张图：

- **types.ts** 立两份契约：`RunnableInterface`（四态方法）与 `RunnableConfig`（一次调用的上下文）。<span class="lcj-b lcj-core">核心</span>
- **config.ts** 是配置管道：`ensureConfig` 归一化、`mergeConfigs` 叠加、`patchConfig` 打补丁、`pickRunnableConfigKeys` 瘦身、外加回调管理器与 tracing metadata。<span class="lcj-b lcj-core">核心</span>
- **utils.ts** 三个小工具：运行时守卫、事件过滤器、base64url。<span class="lcj-b lcj-skim">可跳读</span>
- **iter.ts** 解决"流式消费时保住配置上下文"，靠 `runWithConfig` + `pickRunnableConfigKeys`。<span class="lcj-b lcj-key">重点</span>

回到第00讲的北极星 demo `chain.invoke({lang, text})`：这一行背后，`invoke` 拿到的 `options` 会先过 `ensureConfig` 补全、过 `mergeConfigs` 和上层绑定的 config 叠加、再 `patchConfig` 传给链里每一环；流式版本则靠 `iter.ts` 让配置穿过每一层 `yield`。**这四个文件就是"一次调用"的全部地基设施。**

<div class="lcj-note"><strong>下一讲预告 · 第 02 讲：Runnable 抽象基类（base.ts 上半，L72–1246）。</strong>终于进主角文件。我们逐段读 <code>Runnable</code> 抽象类：它如何用本讲的 <code>ensureConfig</code>/<code>patchConfig</code> 实现 <code>_callWithConfig</code> / <code>_batchWithConfig</code> / <code>_transformStreamWithConfig</code> 这三个"带配置执行"的模板方法，以及 <code>invoke</code>/<code>batch</code>/<code>stream</code>/<code>transform</code> 的默认实现和 <code>.pipe()</code>/<code>.pick()</code>/<code>.assign()</code> 的入口。本讲的契约，下一讲就要被一个个兑现。</div>

> 本课配套源码：[github.com/langchain-ai/langchainjs](https://github.com/langchain-ai/langchainjs) @ `8f2ca17`。本讲覆盖 `runnables/{types,config,utils,iter}.ts` 共约 588 行。本系列为开源项目的源码学习笔记，著作权归 LangChain 原作者所有。
