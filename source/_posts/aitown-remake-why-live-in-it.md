---
title: "AI 小镇改造手记 · 序：从旁观 AI 到住进去"
date: 2026-06-15 10:00:00
tags: [AI, Agent, AI Town, 改造手记, 系统设计]
categories: [技术笔记, AI 小镇改造手记]
---

我之前写过一篇《AI Town 值得学习的不是像素小镇，而是 Agent 基础设施》，把它拆成 input 队列、单线程 engine、historical replay、异步 LLM、向量记忆这几层来看。那篇是站在外面拆零件。

这个系列不一样。我真的 fork 了 a16z 的 AI Town，开始往里面加东西。这是第一篇，先说清楚我为什么要改，以及打算改成什么样。

## 原版给我的感觉：你在屏幕外看 AI 过日子

原版 AI Town 跑起来很好看：一个像素小镇，几个 NPC 自己走来走去、互相搭话、记住彼此说过的话。

但玩久了我有个很具体的不舒服：**我始终在屏幕外面。**

镇子是 AI 的，我是观众。我能拖地图、能缩放、能点开某个角色看他最近说了什么，但这些动作本质上都是"看"。它更像一个开着的鱼缸，里面的 AI 在过日子，我在外面看。

我想要的不是这个。我想要的是：人和 AI 同处一个世界，我能走进去，能参与，能在里面也有自己的一天。

所以这个系列的主线，用我某次 commit 里的原话就是——

> Make the town useful through playable systems.
> 让小镇从被动看 AI，变成有玩家能参与的活动。

## 我加了五套系统

到这篇为止，我在上游之上堆了十几个 commit，往 `src/` 和 `convex/` 里加了快一万行。但抽象出来，其实就是五套系统。每一套后面都会单独写一篇展开，这里先点到为止，让你知道这个系列要去哪。

### 一、居民模式：先让"我"在镇子里成立

观众变居民，第一件事是"我"得是个实体。

原版人类玩家是共享的 `DEFAULT_NAME`，意思是俩朋友同时进来会塌成同一个人。我先给每个浏览器会话一个稳定身份（`src/hooks/useSessionIdentity.ts`），再在 Convex 里建了 `residentProfiles` 表存住这个人选的形象、最后的位置和朝向。

> Give each browser its own playable town character.

身份立住之后，右侧那块原来的说明面板，我整个改成了居民仪表盘（`src/components/ResidentPanel.tsx`）：我是谁、有多少钱、技能练到几级、菜地什么状态。一句话——

> The town should feel like a place the player lives in, not only a viewport for watching AI NPCs.

### 二、职业与日历：让镇子有"今天"

光能站在里面还不够，得有事可做、有时间在走。

我给居民加了一套生活循环：日期、精力、食物、邮箱、种子（`convex/schema.ts` 里新加的 `careerProfiles` 等表）。然后是职业——十二个工种可以预览，能去打一天临时工，花精力、挣金币、攒每个职业的经验。

关键是它顺着镇子的日历走，不是个网页计时器：

```ts
// convex/world.ts
export const CAREER_WORK_START_HOUR = 10;
export const CAREER_WORK_END_HOUR = 18;
export const TOWN_MONTH_DAYS = 30;
export const TOWN_MARKET_DAY = 15;
```

一个居民可以在某个 NPC 那儿干一整天 10:00–18:00 的活，结算工钱和经验，然后睡过去到第二天；同一个镇子日不能重复打工。我在 commit 里给自己留了条规矩：别把它退回成进度条任务——

> Day labor should be available at any profession NPC or shop on any town day, but only once per day until the resident sleeps.

### 三、可进入的建筑：建筑是地方，不是按钮

这套我返工过好几次，因为很容易做歪。

最早我给每个建筑配了页脚快捷入口、每个热点都能点，结果整个镇子开始像一个网页控制台——点哪个楼就弹哪个面板。我自己看了一眼就否了：

> Clicking a building should move on the map, not bypass player position.

改完之后的规则是 Stardew 那种：你得**走到**门口，按 X 才进去。画室、影院、职业建筑（木作坊、铁铺、星井小塔、酒馆）都是这样，每个都是一段铺在地图上的小路 + 末端一个能踩的入口（`src/components/*Hotspot.tsx` 和对应的 `*Overlay.tsx`）。建筑是镇上的地方，不是菜单页。

### 四、AI 视觉探索树：让 AI 帮你往世界深处长

前面三套是"人住进去"，这套是反过来让 AI 帮世界生长。

`convex/visuals.ts` 里我做了一棵可探索的视觉树：一张场景图上有若干热点，点进去用一段 prompt 生成下一层场景图，新场景又带着自己的热点，可以继续往下钻。每个节点都持久化在 `visualNodes` 表里。

```ts
// convex/visuals.ts —— 生成节点带着自己的热点
const generatedNodeValidator = v.object({
  nodeId: v.string(),
  parentNodeId: v.optional(v.string()),
  title: v.string(),
  prompt: v.string(),
  hotspots: v.array(hotspotValidator),
  // ...
});
```

它和原版那套"对话 → 摘要 → 向量记忆"是平行的另一条 AI 用法：不生成对话，而是生成可以走进去的画面。

### 五、可观测性：把镇子的动态变成产品信号

最后一套是给我自己用的，但思路是产品化的。

> Expose town dynamics as observable product signal.

我做了一个镇志/观测台（`src/components/TownObservatory.tsx` + `convex/world.ts` 里的 `townObservatory` query）：谁在镇上、最近谁和谁聊了、各种状态汇总。原版你只能一个个点角色去看，现在镇子的整体动态是一个能读的面。它既是调试入口，也是"这个小世界现在到底在发生什么"的仪表。

## 这个系列真正想讲清楚的难点

把五套系统列完，你可能觉得不就是堆功能。但真正难的、也是我想用整个系列讲清楚的，是另一件事：

**这些功能都得顺着 AI Town 那套单线程权威引擎的规矩加，不能绕过去。**

上一篇拆过它的底层契约：核心世界状态只允许 game engine 改，外部一律先变成 input。这条规矩在"看"的时候很优雅，在"加功能"的时候就处处掣肘。我加职业、加菜地、加身份，最省事的写法永远是直接写数据库——但那样会和 engine 的 replay、和对话模拟打架。所以我在 commit 里反复给自己设红线：

> Refactoring the engine state to store jobs and crops would risk replay behavior and conversation simulation.

> Keep existing Convex gameplay data and mutations intact for this MVP.

很多设计取舍——为什么职业数据走旁路表而不进 engine 状态、为什么打工结算要算进镇子日历而不是真实时间、为什么身份先用 session token 而不直接上账号——都是被这条规矩逼出来的。这正是这个系列最值得写的部分：**在一个你不能随便乱改的权威引擎上，怎么把一个"能玩的世界"加进去。**

## 这个系列后面会写什么

序篇就到这。接下来五篇，一套系统一篇：

1. [**居民模式**](/2026/06/15/aitown-remake-resident-mode/)：把观众变成住户——会话身份、`residentProfiles` 与居民仪表盘
2. [**职业与日历**](/2026/06/15/aitown-remake-profession-calendar/)：让镇子有"今天"——多职业、精力循环与一天临时工
3. [**可进入的建筑**](/2026/06/15/aitown-remake-enterable-buildings/)：建筑是地方不是按钮——走过去按 X 进入的场景路由
4. [**AI 视觉探索树**](/2026/06/15/aitown-remake-visual-tree/)：让 AI 帮你往世界深处长——`visuals.ts` 的可探索场景生成
5. [**在权威引擎上加功能不搞乱**](/2026/06/15/aitown-remake-extend-the-engine/)：单线程 engine 的红线，与我所有取舍的根因

如果上一篇是把 AI Town 当样板拆开看，这一篇之后就是动手把它改成我想住进去的样子。下一篇，从"我"开始。
