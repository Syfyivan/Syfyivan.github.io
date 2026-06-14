---
title: "AI Town 课程 06：记忆向量检索，从事件到 Prompt 注入"
date: 2026-06-14 14:00:00
tags: [AI, Agent, AI Town, 向量检索, 记忆, 课程]
categories: [技术笔记]
---

第一讲里我留了个钩子：很多人一提 Agent memory，第一反应就是“加一个向量数据库”。但 AI Town 真正值得学的，不是它用了哪个 vector DB，而是它把记忆当成一条有生命周期的东西来设计。

我把那一节的结论再抄一遍：

```text
事件发生 -> 摘要压缩 -> 向量写入 -> 相关召回 -> prompt 注入
```

这一讲就沿着这条线往下钻。我会顺着源码走一遍：什么时候写记忆、写进去的到底是什么、查的时候怎么排序、最后怎么塞进 prompt，以及 embeddingsCache 是怎么帮我们省钱省延迟的。所有代码都来自 `convex/agent/` 目录，路径和函数名我都标出来，不编造。

## 记忆长什么样：先看表结构

要理解生命周期，先看记忆这条数据的形状。表结构在 `convex/agent/schema.ts`。

一条 memory 由两张表共同表示：`memories` 存元数据和文本，`memoryEmbeddings` 存向量。它们通过 `embeddingId` 关联。

`convex/agent/schema.ts` 里的 `memoryFields`：

```ts
export const memoryFields = {
  playerId,
  description: v.string(),
  embeddingId: v.id('memoryEmbeddings'),
  importance: v.number(),
  lastAccess: v.number(),
  data: v.union(
    v.object({ type: v.literal('relationship'), playerId }),
    v.object({
      type: v.literal('conversation'),
      conversationId,
      playerIds: v.array(playerId),
    }),
    v.object({
      type: v.literal('reflection'),
      relatedMemoryIds: v.array(v.id('memories')),
    }),
  ),
};
```

这里有几个细节值得停下来看。

第一，记忆不止存 `description`（也就是事件文本），还存了 `importance`（重要性分数）和 `lastAccess`（上次被访问的时间）。这两个字段就是后面综合打分用的“时近性”和“重要性”。

第二，`data` 是个带 `type` 的 union，记忆分三类：`conversation`（对话总结）、`reflection`（反思洞察）、`relationship`（关系）。每类带的字段不一样，对话记忆会记下另一方是谁，反思记忆会记下它是由哪些原始记忆推出来的。

第三，也是最关键的一点——记忆文本和向量是分表存的。为什么要拆？因为向量索引和普通索引的查询方式完全不同。看 `memoryEmbeddings` 的定义：

```ts
memoryEmbeddings: defineTable({
  playerId,
  embedding: v.array(v.float64()),
}).vectorIndex('embedding', {
  vectorField: 'embedding',
  filterFields: ['playerId'],
  dimensions: EMBEDDING_DIMENSION,
}),
```

`vectorIndex` 是 Convex 提供的向量索引，`filterFields: ['playerId']` 意味着可以在做相似度搜索的同时，按 `playerId` 过滤——每个角色只检索自己的记忆，不会串味。`EMBEDDING_DIMENSION` 在 `convex/util/llm.ts` 里定义，当前默认走 Ollama 的 1024 维（换成 OpenAI 是 1536 维，Together 是 768 维），向量库的维度必须和 embedding 模型对齐，这是个容易踩的坑，后面会讲。

## 什么时候写：对话结束，加上偶发的反思

记忆不是每说一句话就写一条。AI Town 的主要写入时机只有一个：**一段对话结束的时候**。入口是 `convex/agent/memory.ts` 的 `rememberConversation`。

它做的第一件事，是把整段对话喂给 LLM，让角色用第一人称总结：

```ts
const llmMessages: LLMMessage[] = [
  {
    role: 'user',
    content: `你是 ${player.name}，你刚刚结束了和 ${otherPlayer.name} 的对话。
    请从 ${player.name} 的第一人称视角，用简体中文总结这段对话，并补充你是否喜欢这次互动以及原因。`,
  },
];
```

注意这个 prompt 的语气：不是中立地“概括对话内容”，而是“从你的视角总结，并说你喜不喜欢”。这一点很重要——记忆带情绪、带立场，后面注入 prompt 时角色才像个有性格的人，而不是一台会议记录机。

总结完之后，紧接着是写记忆的三件套：

```ts
const description = `和 ${otherPlayer.name} 在 ${new Date(
  data.conversation._creationTime,
).toLocaleString()} 的对话：${content}`;
const importance = await calculateImportance(description);
const { embedding } = await fetchEmbedding(description);
```

事件文本（带上时间和对象前缀）、重要性分数、embedding 向量。三样齐了才落库。这正好对应第一讲讲的“写什么”：摘要、时间戳、相关人物、重要性评分一起存。

写完对话记忆，`rememberConversation` 最后会调一次 `reflectOnMemories`。这是第二个、也是偶发的写入时机——反思。

反思不是每次都跑。看 `reflectOnMemories` 里的门槛：

```ts
const sumOfImportanceScore = memories
  .filter((m) => m._creationTime > (lastReflectionTs ?? 0))
  .reduce((acc, curr) => acc + curr.importance, 0);
const shouldReflect = sumOfImportanceScore > 500;
if (!shouldReflect) {
  return false;
}
```

逻辑是：取最近 100 条记忆，把上次反思以来新增记忆的重要性分数加起来，只有累计超过 500 才触发反思。换句话说，**只有当角色积累了足够多、足够重的经历，才值得停下来想一想**。这是个很省的设计——反思要再调一次 LLM，不能每次对话都做。

触发后，它让 LLM 从这一堆陈述里提炼出 3 条“高层次洞察”，并要求返回结构化 JSON，每条洞察还要标明是由哪几条原始陈述推出来的：

```ts
prompt.push('请从以上陈述中推断 3 条高层次洞察，用简体中文表达。');
prompt.push(
  '请返回 JSON 数组，每项包含 insight 和 statementIds。statementIds 是促成该洞察的输入陈述编号列表。...',
);
```

这些洞察会以 `type: 'reflection'` 写回 `memories` 表，`relatedMemoryIds` 记下来源。于是记忆系统有了层次：底层是一条条具体对话，上层是从这些对话里长出来的概括性认知。检索时两层都能被召回。

## 怎么查：向量检索只是第一步

写完看查。检索的核心函数是 `convex/agent/memory.ts` 的 `searchMemories`：

```ts
export async function searchMemories(
  ctx: ActionCtx,
  playerId: GameId<'players'>,
  searchEmbedding: number[],
  n: number = 3,
) {
  const candidates = await ctx.vectorSearch('memoryEmbeddings', 'embedding', {
    vector: searchEmbedding,
    filter: (q) => q.eq('playerId', playerId),
    limit: n * MEMORY_OVERFETCH,
  });
  const rankedMemories = await ctx.runMutation(selfInternal.rankAndTouchMemories, {
    candidates,
    n,
  });
  return rankedMemories.map(({ memory }) => memory);
}
```

这里藏着一个关键设计：`limit` 不是 `n`，而是 `n * MEMORY_OVERFETCH`，而 `MEMORY_OVERFETCH` 是 10。也就是说，假如最终只想要 3 条记忆，它会先用向量检索捞 30 条候选回来。

为什么要多捞 10 倍？因为**向量相似度只代表语义相关，不代表这条记忆现在最该被想起**。一条很久以前的、不太相关的对话，可能不如一条稍微没那么相似但很重要、很新近的记忆有用。所以向量检索只负责圈出一个候选池，真正的排序交给下一步。

排序在 `rankAndTouchMemories` 里。它把三个维度归一化后相加：

```ts
const recencyScore = relatedMemories.map((memory) => {
  const hoursSinceAccess = (ts - memory.lastAccess) / 1000 / 60 / 60;
  return 0.99 ** Math.floor(hoursSinceAccess);
});
const relevanceRange = makeRange(args.candidates.map((c) => c._score));
const importanceRange = makeRange(relatedMemories.map((m) => m.importance));
const recencyRange = makeRange(recencyScore);
const memoryScores = relatedMemories.map((memory, idx) => ({
  memory,
  overallScore:
    normalizeMemoryScore(args.candidates[idx]._score, relevanceRange) +
    normalizeMemoryScore(memory.importance, importanceRange) +
    normalizeMemoryScore(recencyScore[idx], recencyRange),
}));
memoryScores.sort((a, b) => b.overallScore - a.overallScore);
```

把三条线拆开看：

- **相关性（relevance）**：来自向量检索的 `_score`，语义有多接近。
- **重要性（importance）**：写入时 LLM 打的 0–9 分。
- **时近性（recency）**：`0.99 ** 小时数`，一条记忆每过一小时就乘以 0.99 衰减，越久远分越低。

三者各自在候选池里归一化到 0–1，然后等权相加，按总分排序，取前 `n` 条。这套打分法直接来自斯坦福那篇 Generative Agents 论文，AI Town 把它落成了可运行的代码。

函数名里还有个 `Touch` 值得一提。被选中的记忆会更新 `lastAccess`：

```ts
const accessed = memoryScores.slice(0, args.n);
await asyncMap(accessed, async ({ memory }) => {
  if (memory.lastAccess < ts - MEMORY_ACCESS_THROTTLE) {
    await ctx.db.patch(memory._id, { lastAccess: ts });
  }
});
```

被想起来的记忆，时近性会“刷新”，下次更容易再被想起——就像人反复回忆某件事，它会变得越来越鲜活。这里还加了个 `MEMORY_ACCESS_THROTTLE`（5 分钟）节流，避免短时间内反复 patch 同一条记忆把数据库写爆。

## 怎么放进 prompt：检索问题比答案更重要

记忆查出来了，怎么用？这一步在 `convex/agent/conversation.ts`。

先看一个容易被忽略的点：**用什么去检索**。第一讲强调过，拿当前最后一句话去做 embedding 往往召不回真正相关的长期记忆。AI Town 的做法是专门构造一个检索问题。

开启对话时，`startConversationMessage` 用的是：

```ts
const embedding = await embeddingsCache.fetch(
  ctx,
  `${player.name} 正在和 ${otherPlayer.name} 说话`,
);
const memories = await memory.searchMemories(
  ctx,
  player.id as GameId<'players'>,
  embedding,
  Number(process.env.NUM_MEMORIES_TO_SEARCH) || NUM_MEMORIES_TO_SEARCH,
);
```

对话进行中，`continueConversationMessage` 换了个更聚焦的问句：

```ts
const embedding = await embeddingsCache.fetch(ctx, `你怎么看待 ${otherPlayer.name}？`);
const memories = await memory.searchMemories(ctx, player.id as GameId<'players'>, embedding, 3);
```

“你怎么看待 X？”这个 query，比把对方刚说的那句话拿去检索有用得多——它直接定位到“我和这个人的历史关系”这个语义簇。检索的默认条数 `NUM_MEMORIES_TO_SEARCH` 是 3（在 `convex/constants.ts`），也就是前面说的 top-3。

召回的记忆怎么进 prompt？看 `relatedMemoriesPrompt`：

```ts
function relatedMemoriesPrompt(memories: memory.Memory[]): string[] {
  const prompt = [];
  if (memories.length > 0) {
    prompt.push(`以下是按相关性排序的记忆：`);
    for (const memory of memories) {
      prompt.push(' - ' + normalizeDialogueText(memory.description));
    }
  }
  return prompt;
}
```

只是把 top-3 的 `description` 拼成几行列表，告诉模型“这是按相关性排序的记忆”。配合文件顶部 `RESPONSE_STYLE_PROMPT` 里那句“如果相关记忆适合当前语境，可以自然提及；不要生硬复述记忆列表”，模型就知道这些是参考、不是当前观察，要自然带出而不是照着念。

还有个小巧思：如果召回的记忆里正好有一条是和当前对话对象聊过的，`startConversationMessage` 会额外加一句引导：

```ts
const memoryWithOtherPlayer = memories.find(
  (m) => m.data.type === 'conversation' && m.data.playerIds.includes(otherPlayerId),
);
if (memoryWithOtherPlayer) {
  prompt.push(`开场时请自然带到你们之前聊过的一处具体细节，或者问一个和旧对话有关的问题。`);
}
```

于是两个角色第二次见面时，开场白会自然提到上次聊的事——这正是“记忆”被人感知到的那一刻。这里用到了前面 schema 里 `conversation` 类型记忆专门存的 `playerIds` 字段，结构化字段和向量召回在这里配合起来了。

## embeddingsCache：省钱也省延迟

整个链路里，embedding 是要花钱、花时间的外部调用。但仔细想想：同一段文本算出来的 embedding 永远一样。同一个角色一遍遍地用“你怎么看待 Bob？”去检索，每次都重新调 embedding API，纯属浪费。

`convex/agent/embeddingsCache.ts` 就是来解决这个的。核心是 `fetchBatch`：先把文本 hash 一下，拿 hash 去缓存表查，命中的直接用，只对没命中的文本调真正的 embedding API：

```ts
const textHashes = await Promise.all(texts.map((text) => hashText(text)));
const results = new Array<number[]>(texts.length);
const cacheResults = await ctx.runQuery(selfInternal.getEmbeddingsByText, {
  textHashes,
});
for (const { index, embedding } of cacheResults) {
  results[index] = embedding;
}
const toWrite = [];
if (cacheResults.length < texts.length) {
  const missingIndexes = [...results.keys()].filter((i) => !results[i]);
  const missingTexts = missingIndexes.map((i) => texts[i]);
  const response = await fetchEmbeddingBatch(missingTexts);
  // ... 把新算的写回缓存
}
```

缓存表的 key 是文本的 SHA-256 哈希，而不是原文：

```ts
async function hashText(text: string) {
  const textEncoder = new TextEncoder();
  const buf = textEncoder.encode(text);
  // ... crypto.subtle.digest('SHA-256', buf)
}
```

用 hash 当 key 有两个好处：定长、好建索引（`embeddingsCache` 表上的 `text` 索引就是建在 `textHash` 上），而且不用把可能很长的原文塞进索引。

回到 `conversation.ts` 里那两处 `embeddingsCache.fetch(...)`——开场用的“X 正在和 Y 说话”、对话中用的“你怎么看待 Y？”，这些 query 文本是高度重复的固定模板，缓存命中率会非常高。这是个很务实的优化：不改变任何检索逻辑，纯靠一层透明缓存，把 embedding 的钱和延迟砍掉一大半。

注意一个边界：写记忆时 `rememberConversation` 调的是 `fetchEmbedding`（直连，不走缓存），因为每段对话总结都是独一无二的，缓存了也不会再命中；而检索 query 走缓存，因为它们是模板化的、会重复。该缓存的缓存，不该缓存的不缓存，分得很清楚。

## 几个真实的坑

把这套东西自己实现一遍，会撞上几个地方。

**embedding 成本和维度。** `convex/util/llm.ts` 里 `EMBEDDING_DIMENSION` 默认是 Ollama 的 1024 维。这个值必须和 schema 里 `vectorIndex` 的 `dimensions` 一致，也必须和你真正用的 embedding 模型一致。换模型（比如从 Ollama 切到 OpenAI 的 1536 维）就得改维度、重建索引，老数据的向量全部作废。这是迁移时最隐蔽的坑，代码里专门写了 `if (EMBEDDING_DIMENSION !== ...) throw` 来挡。

**检索噪声。** 向量检索本质是模糊匹配，召回的东西不一定真相关。AI Town 用两道防线对冲：一是 overfetch 10 倍再用重要性+时近性重排，把“相似但没用”的压下去；二是检索 query 本身写得很聚焦（“你怎么看待 X”而不是当前句），从源头提高信噪比。只靠向量分数排序，召回质量会明显变差。

**prompt 预算。** 召回不是越多越好。这里默认只取 3 条，并且明确告诉模型这是“可能相关的记忆”而非事实。如果不加节制地把几十条记忆全塞进去，模型会被历史带跑，甚至把旧记忆当成当前正在发生的事。top-k 加上“仅供参考”的措辞，是控制预算和防止污染的双保险。

**反思的解析风险。** 反思依赖 LLM 返回严格 JSON。`reflectOnMemories` 用 `JSON.parse` 解析，外面套了 try/catch，解析失败就放弃这次反思而不是让整个流程崩掉。任何让 LLM 输出结构化数据的地方，都要假设它偶尔会返回脏东西。

## 小结

把这一讲收束成一句话：**AI Town 的记忆系统，强在生命周期管理，不在向量库本身。**

完整链路重新捋一遍：

```text
对话结束 -> LLM 第一人称总结（rememberConversation）
        -> 算重要性 + 算 embedding -> 写入两张表
        -> 累计够重要时触发反思，长出高层洞察
检索时   -> 构造聚焦的检索问题 -> embeddingsCache 取向量
        -> 向量 overfetch 10x 候选
        -> 相关性 + 重要性 + 时近性 归一化重排，取 top-3
        -> 刷新被命中记忆的 lastAccess
注入时   -> 拼成几行列表进 system prompt
        -> 标注“仅供参考”，引导自然带出而非复述
```

迁移启发也很直接。如果你在做任何带长期记忆的 Agent——客服、陪伴、协作助手——可以直接搬这套结构：

- 记忆分原始事件层和反思层，别只存一层流水账；
- 写入时就把重要性、时间戳、相关人物一起存下来，检索时才有东西可排；
- 向量检索只当粗筛，最终排序一定要叠加重要性和时近性；
- 检索 query 单独构造，别拿用户最后一句话直接去查；
- 给 embedding 加一层 hash 缓存，模板化的 query 命中率极高；
- 注入 prompt 时控制条数、标明“可能相关”，把遗忘和降权也当成功能来设计。

记忆系统的难点从来不是“有没有 vector DB”，而是写什么、什么时候写、怎么排、放几条、怎么忘。AI Town 把这些问题一个个落成了不到五百行的代码，很值得逐行读一遍。

## 参考资料

- 本讲源码：`convex/agent/memory.ts`、`convex/agent/embeddingsCache.ts`、`convex/agent/schema.ts`、`convex/agent/conversation.ts`
- [Generative Agents: Interactive Simulacra of Human Behavior](https://arxiv.org/abs/2304.03442)（重要性+时近性+相关性打分的出处）
- [Convex Vector Search](https://docs.convex.dev/search/vector-search)
- [AI Town GitHub Repository](https://github.com/a16z-infra/ai-town)
