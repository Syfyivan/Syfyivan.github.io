---
title: "AI 小镇改造手记 · 六：把视觉探索树升级成真·Flipbook —— 不复刻，做加分项"
date: 2026-06-15 16:00:00
tags: [AI, Agent, AI Town, 改造手记, 生成式, 图像, 多模态]
categories: [技术笔记, AI 小镇改造手记]
---

这是课程四的续集，也是一篇落地记录。课程四里我把电影院做成了一个「点哪生成哪」的图像浏览器，但说句老实话，那一版是个**脚本树**——可点区域是我在 `convex/visuals.ts` 里手写死的。这篇讲两件事：怎么把它真正升级成 Flipbook（这次代码已经落地了），以及一个更要紧的问题——**复刻一个 Flipbook，到底算不算本事。**

> 落地后的形态：电影院壳子换成了**山坡上的观景台**，走过去按 X 架起望远镜，点画面任意处就能看得更近、钻得更深。下面讲为什么这么改、改了哪些。

## 先把话说清楚：复刻 Flipbook 不算加分项

我做这个项目，是想往简历上放的。所以我得先想明白一件事：如果我只是把 [flipbook.page](https://flipbook.page/) 一比一抄出来，面试官一句话就能问死我——「这跟原版有什么区别？」

直接复刻没有意义。Flipbook 本身的开源复刻已经有了（[`eren23/openflipbook`](https://github.com/eren23/openflipbook)，Next.js + FastAPI，点任意位置往里钻，原理后面会讲），我照着抄一遍，得到的只是「我会调 API」。

加分项的叙事必须是另一种形状：**我用了别人没有的东西，解决了原版做不到的问题。**而我手里恰好有 Flipbook 没有的三样独家资产：

1. 一个**持续运行的多智能体世界**（AI Town 本体）；
2. 一个**实时数据库** Convex；
3. 一套现成的 **NPC 记忆与向量检索**（`convex/agent/memory.ts`、`convex/agent/embeddingsCache.ts`）。

Flipbook 是一个孤立的、无状态的图像漫游器——你点出来的每一张图都是凭空幻觉，跟任何真实世界都没有关系。而我可以让这块画布**长在一个真在跑的模拟世界上**。这才是差异化。

所以这篇的升级分两层：**底座**（把脚本树换成真·Flipbook 的点击解析）和**差异化**（把画布接进小镇的真实状态）。

## 底座升级：从「写死的热区」到「VLM 点击解析」

先回顾课程四的命门。当时点一个热区，走的是 `buildSemanticChild` 这棵手写的剧本树：

```ts
if (selectedHotspot.kind === 'house') {
  return {
    title: `${selectedHotspot.label}的院子`,
    prompt: '院子里有木门、石阶、窗户……',
    hotspots: [ /* 又是一堆手写死的 rect 坐标 */ ],
  };
}
```

`house → 院子 → door → 室内 → furniture → 抽屉`——这条语义链是我一行行编出来的。它能跑，但它是**有限的**：我没写到的东西就点不进去。真正的 Flipbook 不是这样工作的。

我去扒了 openflipbook 的设计（它的 `docs/STORY.md` 写得很透）。它的精髓是一句话：**它没有预设热区。** 整条链路是：

```text
点击 (x, y) 归一化坐标
   │
   ▼
把【当前这张图 + 点击坐标】发给 VLM（视觉语言模型）
   │   问它：「用户点的这个位置是什么？」→ 它回一个语义短语，比如「窗台上的旧照片」
   ▼
这个短语作为 subject，喂给图像模型 → 生成下一帧
   ▼
新图渲染后，后台顺手预算出 3~4 个「最可能被点」的区域并缓存，下次点击秒回
```

openflipbook 用 `Qwen2.5-VL`（解析点击）+ 图像模型（出图）。我新增了一个 action `resolveClick` 来干这件事——但这里**踩了一个我代码里的真实坑，值得记一笔**。

我一开始想直接复用课程三、课程五里那个 `convex/util/llm.ts` 的 `chatCompletion`。结果发现不行：它绑定的是小镇的**主 LLM**，而我这套小镇默认跑在本地 Ollama 的 `llama3` 上——**llama3 没有视觉**。更要命的是 `llm.ts` 里把 `EMBEDDING_DIMENSION` 锁死成了 Ollama 的 1024，一旦把全局聊天模型切成 OpenAI，向量维度对不上会直接抛错，连记忆系统一起搞挂。

所以正确的做法是**把视觉模型单独拎出来**，给它一套独立的端点配置（`VISION_API_URL` / `VISION_MODEL` / `VISION_API_KEY`），直接 `fetch`，和小镇主 LLM 完全解耦。小镇该跑它的 Ollama，视觉这一路单独走 `gpt-4o-mini` 或本地 `llama3.2-vision`，互不干扰。落地后的 `resolveClick` 长这样：

```ts
function getVisionConfig() {
  const url = process.env.VISION_API_URL;
  const model = process.env.VISION_MODEL;
  if (!url || !model) return null; // 没配 → 返回 null，前端回退到脚本树
  return { url: url.replace(/\/$/, ''), model, apiKey: process.env.VISION_API_KEY };
}

export const resolveClick = action({
  args: { imageUrl: v.string(), x: v.number(), y: v.number(), title: v.string(), path: v.array(v.string()) },
  handler: async (_ctx, args): Promise<{ subject: string } | null> => {
    const config = getVisionConfig();
    if (!config) return null;
    const response = await fetch(`${config.url}/chat/completions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json',
        ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}) },
      body: JSON.stringify({
        model: config.model, temperature: 0.2, max_tokens: 32,
        messages: [
          { role: 'system', content: '你在看一张溪山镇的画面。用户点击了某个位置（坐标已归一化）。' +
            '用一个不超过 12 个汉字的中文名词短语，描述那个位置最显眼的东西。只输出短语。' },
          { role: 'user', content: [
            { type: 'image_url', image_url: { url: args.imageUrl } },
            { type: 'text', text: `点击位置 x=${args.x}, y=${args.y}。路径：${args.path.join(' → ')}` },
          ]},
        ],
      }),
    });
    // …解析出短语，例如「窗台上的旧照片」，作为下一帧主体
  },
});
```

拿到这个短语后，后面完全复用课程四已有的 `generateImage()`——`styleAnchor` 保画风、拼 prompt 保连续性那一套原封不动。**等于我只是把「查表得到 nextPrompt」换成了「问 VLM 得到 nextPrompt」。** 这个「独立端点解耦」的决策，其实比写 action 本身更值得在面试里讲：它说明我读懂了现有代码的约束，而不是无脑接 API。

前端那边，课程四里那些半透明可点框（`currentNode.hotspots.map`）也可以退场了，改成**整张图可点**：

```tsx
<img
  src={currentNode.imageUrl}
  onClick={(e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;   // 归一化 0~1
    const y = (e.clientY - r.top) / r.height;
    void resolveAndGenerate(x, y);
  }}
/>
```

落地后做成了**渐进式**：VLM 配好了就走真·Flipbook，没配 `resolveClick` 返回 `null`，前端就回退到课程四那棵脚本树（现在它降级成了侧栏的「建议观测点」）。这样开发期、离线、没 key 的时候，这套东西照样能跑——和课程四里那个 SVG 兜底是同一个哲学：**任何一环挂了都要能退回到能用的状态。**

到这一步，「点哪生哪」从「有限脚本」变成了「真·任意点」。但这还只是追平 Flipbook。真正拉开差距的是下一段。

## 差异化：世界接地（World-Grounding）

Flipbook 最大的软肋，是它生成的一切都**不指向任何真实的东西**。你在它里面「探索巴黎」，得到的是模型对巴黎的幻觉拼贴，不是任何一个真实存在的、有状态的巴黎。

而我有一个真在跑的溪山镇。镇里的 NPC 有记忆、有当天发生的对话、有此刻所在的位置。**那为什么不让银幕上的画，反映这个世界此刻真实的样子？**

这次落地，我先把**根节点接地**做了——它是性价比最高的一刀。课程四的根节点是一句写死的「溪山镇全景，有居民家、河边小桥、市集……」。升级后，生成全景之前，先跑一个 `loadTownContext`：

```ts
async function loadTownContext(ctx) {
  const status = await ctx.runQuery(api.world.defaultWorldStatus, {});
  const observatory = await ctx.runQuery(api.world.townObservatory, { worldId: status.worldId });
  const activities = observatory.activeActivities.slice(0, 4)
    .map((a) => `${a.player}正在${a.description}`);
  const memories = observatory.recentMemories.slice(0, 3)
    .map((m) => `${m.owner}：${m.description}`);
  return [...activities, ...memories].join('；'); // 失败则返回 undefined，静默跳过
}
```

它复用了课程里早就存在的 `townObservatory` 查询，捞出**镇民此刻正在做的事**和**最近的记忆**，揉进根节点 prompt：「……此刻镇上的真实状况：阿木正在铁铺打铁；小柚在河边发呆；……」。于是望远镜里看到的第一帧全景，是**这一局模拟的真实快照**，不是模板。世界查询失败也不会让整个功能崩——接不到就静默退回写死的那句，又是「任何一环挂了都能退」。

> 诚实地说：目前接地只做到了**根节点全景**这一层。「点进某栋房子时，用 `playerId` 去查这家 NPC 的记忆喂进出图 prompt」这个更深的接地，是下一步要做的——但根节点这一刀已经足够把「观景台看的是真实小镇」这个叙事立住了。

叙事因此变了：它不再是「一本翻不到底的画册」，而是**「模拟世界的一扇窗」**——你不是在看 AI 的幻觉，你是在看这个 Agent 社会此刻的样子。这一段是整套升级里最值钱的，因为它是 Flipbook 结构上给不了的——**它没有一个世界，我有。** 简历上这句话的分量，比「我复刻了 Flipbook」重得多。

## 顺手换了个壳子：电影院 → 观景台

课程四把这功能塞进了「电影院」。但越用越觉得别扭：电影是**坐着被动看一段线性影片**，而这套交互是**主动点击、无限钻进去**——根本不是看电影。

我对比了两个更贴的壳子：**画家工会**（一幅能钻进去的画，纯绘本美学）和**观景台/望远镜**（用望远镜看真实小镇，越看越近）。最后选了观景台，因为它一句话同时圆上了交互和差异化：**「看得越近 = 钻得越深」天然解释了无限缩放，而「看的是真实的小镇」又正好咬合上一节的世界接地。** 画家工会更省事（画本来就可以是想象的，不接地也自洽），但天花板低；观景台逼着我把接地做扎实，上限更高。

代码上换壳几乎是零成本：进入建筑（走到门口按 X 触发 overlay）的链路是全镇统一的，我只是把 `CinemaOverlay/CinemaHotspot` 重命名成 `Spyglass*`、换了文案（拉远 / 重新观测 / 收起）、加了个望远镜取景框暗角，**核心那棵无限画布逻辑一行没动。** 这也反过来印证了课程四那个判断：壳子和机制是解耦的。

## 还能往哪走（留给后面的篇）

世界接地是主线，另外两个方向我先记在这，做不做看后面：

- **多人实时协作画布。** Convex 本来就是实时共享状态。让多个玩家同时在影院里看同一块画布、一起点，探索路径变成一段共享的「小镇影像志」。这是 Convex 的杀手锏，工程上很亮眼。
- **系统与成本优化。** 每点一次都现生成，又贵又慢。可以把每个节点的语义向量化，命中相似节点直接复用（`embeddingsCache.fetch` 现成）；再学 openflipbook 做**预测式预生成**——出图后后台先把最可能被点的 3~4 处生成好缓存住，点下去秒回。这块是聊「性能与成本」的好素材。

## 这套做下来，到底学了什么

把这篇的知识点成体系列一下，也是给我自己对账——简历上能展开讲的，是这些：

1. **多模态 grounding**：怎么把「像素坐标」翻译成「语义」。VLM 的视觉定位、Set-of-Mark prompting、图片+坐标的消息构造。
2. **扩散模型的条件控制**：img2img / IP-Adapter / 参考图，用来压住父子帧之间的「画风漂移」；outpainting 与无限缩放的原理。
3. **LLM 工程**：prompt 拼装、planner 规划、让模型吐结构化 JSON、可选的联网 grounding。
4. **系统设计与性能**：SSE / WebSocket 流式出图、speculative prefetch、**语义缓存**（embedding + 向量相似度命中复用）、对象存储与 CDN。
5. **实时协作架构**：Convex 响应式数据库、乐观更新、事务、共享状态冲突——多人同画布的根基。
6. **成本与降级**：推理成本核算、worker 挂了的兜底、分级模型策略（贵模型出图、便宜模型解析点击）。

## 小结

这次是真落地了，拆开看是三件事：

- **追平**：把脚本树换成 VLM 点击解析，整图可点。坑在于不能无脑复用主 LLM，得给视觉模型单开一套独立端点解耦——这个约束判断比写 action 更值得讲；
- **超越**：根节点世界接地，让全景由 `townObservatory` 捞出的真实 NPC 活动与记忆驱动，这是 Flipbook 结构上做不到的；
- **换壳**：电影院 → 观景台，让壳子的叙事（看真实小镇、越看越近）和机制（无限缩放、世界接地）严丝合缝，且核心逻辑一行没动。

**加分项的本质**，不是「我能复刻一个火过的东西」，而是「我有一个别人没有的世界，我让这个炫技长在了它上面」。复刻是终点，接地才是起点。下一篇接着写。
