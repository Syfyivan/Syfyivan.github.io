---
title: "AI 小镇改造手记 · 四：AI 视觉探索树，点哪生成哪的图像浏览器"
date: 2026-06-15 14:00:00
tags: [AI, Agent, AI Town, 改造手记, 生成式, 图像]
categories: [技术笔记, AI 小镇改造手记]
---

这是改造手记的第四篇。前面几篇讲的都是「住进去」「让小镇有事可做」，这篇讲一个我自己最想做、也最不像功能的东西：**一张能点进去的 AI 生成图**。

镇里有一座电影院。我没把它做成播视频，而是做成了一个生成式图像浏览器——博客里我习惯叫它 flipbook。打开它，先生成一张溪山镇全景；你看到画里有居民家、河边小桥、市集，点哪一处，它就以那一处为起点生成下一张图；你可以一层层钻下去，从全景钻进院子、钻进房间、钻进一个抽屉里的旧照片。像翻一本永远翻不到底的画册。

## 为什么想做「能点进去的图」

起因很简单。市面上的 AI 图都是「一张」——你给 prompt，它给你一张静态图，看完就完了。

但我盯着 AI Town 那张俯视小镇看的时候，总有一种冲动：**我想点进去。**那个亮着灯的窗户后面是什么？那个市集摊位上摆着什么？静态图回答不了，因为它只有这一层。

我想要的不是更高清的一张图，而是**一张有深度的图**——每一处可见的细节，都能被「展开」成它自己的下一张图。这本质上是一棵树：一张图是一个节点，图里的每个可点区域是一条通往子节点的边。

把这个念头落成代码，难点立刻就冒出来了。

## 难点

**第一，父子图怎么保持视觉连续性。** 如果点进院子生成的图，画风、色调、建筑样式跟全景对不上，整个「钻进去」的幻觉立刻碎掉。两张图必须看起来像是同一个世界、同一个画师画的。

**第二，「可点区域」怎么变成结构化数据。** 我不能让模型在图上随便圈几个框就完事。每个可点区域得知道：它是什么（label）、属于哪类（kind，房子 / 门 / 家具 / 河……）、在画面里的位置（rect），以及**点它之后该往哪生成**（nextPrompt）。这是一条带语义的边，不是一个热区坐标。

**第三，生成慢怎么不卡界面。** 出一张图要几秒。如果同步等，用户点一下界面就死一下。

**第四，这棵树存在哪。** 每个节点有图、有 prompt、有深度、有一堆 hotspot，还要能按 session 把整棵树捞回来。

## 怎么做：一棵 visualNodes 树

整套东西落在一个新文件 `convex/visuals.ts`（约 397 行）里，加上 `convex/schema.ts` 里一张新表 `visualNodes`。

先看数据模型。每张图就是一行 `visualNodes`，关键字段是 `parentNodeId`（指向上一层）、`depth`（第几层）、`styleAnchor`（画风锚点）、`imageStorageId` / `imageUrl`（图存哪），还有 `hotspots`(每个 hotspot 自带 `label / kind / rect / nextPrompt`)。`convex/schema.ts`：

```ts
visualNodes: defineTable({
  sessionId: v.string(),
  nodeId: v.string(),
  parentNodeId: v.optional(v.string()),
  title: v.string(),
  prompt: v.string(),
  depth: v.number(),
  styleAnchor: v.string(),
  imageStorageId: v.optional(v.string()),
  imageUrl: v.optional(v.string()),
  createdAt: v.number(),
  hotspots: v.array(
    v.object({
      id: v.string(),
      label: v.string(),
      kind: v.string(),
      rect: v.object({ x: v.number(), y: v.number(), w: v.number(), h: v.number() }),
      nextPrompt: v.string(),
    }),
  ),
})
  .index('sessionId', ['sessionId', 'createdAt'])
  .index('nodeId', ['sessionId', 'nodeId']),
```

`parentNodeId` 把节点串成树，`sessionId` 索引让我能一次把某次探索的整棵树按时间序捞回来。`rect` 的四个值都是 0~1 的比例，不是像素——这样换分辨率也不用重算。这就把上面第二、第四个难点解决了：可点区域是结构化的，整棵树落库可查。

## 生成走异步 action，和 LLM operation 一个套路

这里要点一句和系列前文的呼应。课程 01 和课程 05 里反复出现的模式是：**凡是慢的、要打外部服务的事情，都不在主引擎里同步做，而是丢进一个异步 action**。LLM 对话是这样，记忆向量化是这样——**生成图也是这样**。

`generateNextNode` 就是一个 Convex `action`。它接收「上一层节点 + 你点的那个 hotspot」，算出下一层节点，调外部 worker 出图，最后用一个 internalMutation 落库。`convex/visuals.ts`：

```ts
export const generateNextNode = action({
  args: {
    sessionId: v.string(),
    parent: v.optional(parentNodeValidator),
    hotspot: v.optional(hotspotValidator),
  },
  handler: async (ctx, args): Promise<GeneratedNode> => {
    const node = buildNextNode(args.parent, args.hotspot);
    const image = await generateImage(ctx, node);
    const generatedNode = {
      ...node,
      imageStorageId: image.imageStorageId,
      imageUrl: image.imageUrl,
    };
    await ctx.runMutation(internal.visuals.saveVisualNode, {
      sessionId: args.sessionId,
      node: generatedNode,
    });
    return generatedNode;
  },
});
```

逻辑是干净的三步：**先算节点结构，再出图，再落库**。action 可以 `fetch` 外部、可以写 storage，但不能直接写表，所以最后一步走 `runMutation`。和 LLM operation 完全是同一套异步骨架——这不是巧合，是 AI Town 这套基础设施给你的统一姿势：慢操作一律 action 化。

## 视觉连续性：styleAnchor + nextPrompt 拼出来的 prompt

第一个难点——父子图怎么像同一个世界——靠两样东西解决。

一个是 `styleAnchor`，画风锚点。根节点定下来之后，子节点**原样继承**父节点的 `styleAnchor`，整棵树共用一句画风描述：

```ts
const ROOT_STYLE =
  '溪山镇，温暖黄昏，像素风与手绘绘本结合，统一建筑样式，柔和灯光，细节丰富但构图清晰';
```

另一个是 prompt 的拼法。生成子节点时，我不是只把你点的那个 hotspot 的 `nextPrompt` 丢给模型，而是**显式塞一句「保持来自上一层的视觉连续性」**进去。`buildNextNode` 里：

```ts
const depth = parent.depth + 1;
const nodeId = `${parent.nodeId}-${selectedHotspot.id}-${depth}`;
const styleAnchor = parent.styleAnchor;
const next = buildSemanticChild(parent, selectedHotspot, depth);
return {
  nodeId,
  parentNodeId: parent.nodeId,
  title: next.title,
  prompt: `${selectedHotspot.nextPrompt}。保持来自上一层“${parent.title}”的视觉连续性。${next.prompt}`,
  depth,
  styleAnchor,
  hotspots: next.hotspots,
};
```

真正喂给出图 worker 的，是 `styleAnchor` 再拼上这条 prompt（见 `generateImage` 里 `prompt: \`${node.styleAnchor}。${node.prompt}\``）。于是每一张子图都同时背着：统一画风 + 「接着上一层画」+ 你点的那处具体内容。三者叠加，钻进去才不出戏。

而那个 `nextPrompt` 也不是临时编的。每个 hotspot 按 `kind` 查一张表，决定「点它之后往哪走」：

```ts
function nextPromptFor(label: string, kind: string) {
  const prompts: Record<string, string> = {
    house: `进入${label}的院子，看到院门、窗户、台阶、花盆和门口灯笼`,
    door: `穿过${label}，进入这栋房子的内部空间`,
    furniture: `仔细观察${label}，看到纹理、摆件、抽屉和被使用过的痕迹`,
    river: `沿着${label}靠近水面，看到倒影、桥洞和漂浮的灯`,
    // ……
  };
  return prompts[kind] ?? prompts.object;
}
```

`house → 院子 → door → 室内 → furniture → 细节 → 抽屉`，这条语义链是 `buildSemanticChild` 手工设计的递进路线。点房子不会突然钻进河里——可点区域带着「下一步去哪」的语义，这是这棵树的灵魂。

## 出图与兜底：worker 出图，存进 storage

`generateImage` 调外部出图 worker（地址只读环境变量 `VISUAL_IMAGE_WORKER_URL`，这里只说有这么个公开配置项，不涉及任何密钥），worker 返回图片 URL 或 data URL，data URL 就转成 Blob 存进 Convex storage：

```ts
async function storeDataUrl(ctx: ActionCtx, dataUrl: string) {
  const blob = dataUrlToBlob(dataUrl);
  const imageStorageId = await ctx.storage.store(blob);
  const imageUrl = await ctx.storage.getUrl(imageStorageId);
  if (!imageUrl) {
    throw new Error(`Could not resolve generated image ${imageStorageId}`);
  }
  return { imageUrl, imageStorageId };
}
```

我还特意留了兜底：worker 没配或挂了，就 `renderFallbackSvg` 现画一张 SVG——按节点的 hotspots 在画布上摆出半透明色块，至少结构是对的、能继续点。开发时没接出图服务，这棵树照样能跑、能钻。

## 前端：点 hotspot 就长出下一层

前端在 `src/components/CinemaOverlay.tsx`。它把 action 包成一个 `loadNode`，点击 hotspot 时把「当前节点 + 这个 hotspot」传进去，返回的新节点直接 push 进 `nodes` 数组——数组最后一个就是「当前这页」，goBack 就是弹栈：

```ts
const followHotspot = (hotspot: VisualHotspot) => {
  if (!currentNode || loading) {
    return;
  }
  void loadNode(currentNode, hotspot);
};
```

出图那几秒，界面不卡——`loadingState` 顶着一个「沿着「窗户」继续生成…」的提示，hotspot 渲染成图上的半透明可点框（`left: hotspot.rect.x * 100%`），生成完无缝换图。第三个难点（生成慢）就这么被异步 action + 一个 loading 态接住了。

## 小结

这篇做的事，拆开看其实就三件：

1. **把「一张图」改成「一棵树」**——`visualNodes` 表，`parentNodeId` 串父子，`depth` 记层数。
2. **把「可点区域」改成「带语义的边」**——hotspot 自带 `kind / rect / nextPrompt`，`buildSemanticChild` 设计递进路线，点哪决定往哪生成。
3. **把「出图」改成「异步 action」**——和 LLM operation 一个套路：慢操作丢进 action，`styleAnchor` 保画风、拼 prompt 保连续性，出图存 storage，落库走 mutation。

最让我满意的是第三点那句呼应：当你已经有了 AI Town 这套异步 action 基础设施，**「生成图」和「让 NPC 说话」在工程上是同一件事**——都是把一个慢的外部调用，包成一个能落库、能重试、不卡引擎的 action。视觉探索树不是另起炉灶，它只是又一个长在同一套地基上的玩法。

下一篇接着写别的系统。
