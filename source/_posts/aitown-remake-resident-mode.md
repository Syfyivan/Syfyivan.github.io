---
title: "AI 小镇改造手记 · 一：居民模式，给每个浏览器一个自己的角色"
date: 2026-06-15 11:00:00
tags: [AI, Agent, AI Town, 改造手记, 前端]
categories: [技术笔记, AI 小镇改造手记]
---

我在 a16z 的 AI Town 上做了一轮改造，把它变成了一个中文小镇——溪山镇。这是改造手记的第一篇。

我想先解决一个最基础、却被原版刻意回避掉的问题：访客进来，到底是「观众」还是「居民」。

## 为什么要每个浏览器一个角色

原版 AI Town 的默认体验，是一群 AI NPC 在像素地图上自己闲逛、聊天、社交，而你这个真人，更多时候只是个旁观者：拖动地图看视角，点开某个角色看他的对话。你能加入，但加入的路径依赖完整的 Clerk 登录。

我不想要这种「隔着玻璃看鱼缸」的感觉。我想让任何一个打开网页的人，都能真的住进镇子里——有自己的名字、自己的角色形象、自己走过的位置，关掉浏览器明天再来，他还在原地。

但这里有个现实约束，写在了第一个提交 `f8213e2`「Give each browser its own playable town character」里：**认证是关掉的**，identity 必须在没有 Clerk、不引入新依赖的前提下成立。

更要命的是原版那个原型用的是一个共享的 `DEFAULT_NAME` 身份。提交说得很直白：

> The prior prototype used one shared DEFAULT_NAME identity, which meant friends would collapse into the same human player.

也就是说，两个朋友同时打开，会塌缩成同一个真人玩家——一个人走，另一个人的角色也跟着走。这显然不能叫「居民」。

## 难在哪

把目标拆开，难点其实是四个：

1. **身份**：没有账号系统，怎么把一个浏览器会话稳定地绑定到镇上一个角色，而且两个浏览器互不串台。
2. **持久**：这个角色的位置、朝向、形象，怎么存下来，关掉再开不丢。
3. **沉浸**：原版的地图比浏览器视口还大，用地图像是在滚网页，而不是在操纵一个角色。怎么把它锁进单屏。
4. **导航**：原版靠拖拽视角、点按钮进建筑。我想要的是走路——靠近、按键、进门，像玩一个生活模拟游戏。

下面挨个讲我是怎么做的。

## 怎么做：浏览器会话身份

第一步是给浏览器一个稳定的本地身份。我没碰 Clerk，而是在 `localStorage` 里种了一个 session id，配合名字和角色形象，作为这个浏览器的「身份证」。

来自 `src/hooks/useSessionIdentity.ts`：

```ts
function randomSessionId() {
  if ('crypto' in window && 'randomUUID' in window.crypto) {
    return window.crypto.randomUUID();
  }
  return `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function readStoredSessionIdentity(): StoredSessionIdentity {
  let sessionId = window.localStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = randomSessionId();
    window.localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  // ...名字、角色形象同样从 localStorage 读，缺失就按 sessionId 派生
}
```

关键点是这个 `sessionId` 一旦生成就长期不变，而名字和角色都从它派生：名字用 `defaultPlayerName(sessionId)` 截一段后缀，角色形象用 `selectCharacterNameFromSeed(sessionId)` 按种子选。同一个浏览器，每次刷新都得到同一个人。

光有前端身份还不够，得让后端认得它。我在 `convex/world.ts` 里把 `sessionId` 转成一个服务端 token：

```ts
export function buildSessionToken(sessionId: string) {
  const trimmed = sessionId.trim();
  if (!trimmed) {
    throw new Error('Missing player session.');
  }
  const safeSessionId = trimmed.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, PLAYER_SESSION_MAX_LENGTH);
  if (!safeSessionId) {
    throw new Error('Invalid player session.');
  }
  return `local:${safeSessionId}`;
}
```

这个 `local:xxxx` 形式的 token 顶替了原本 Clerk identity 的位置。提交 `f8213e2` 把它一路穿了下去——join、leave、地图控制、对话、画室、菜园，全都改成认这个会话 token。原来散落各处的 `DEFAULT_NAME` 就此退场，两个浏览器从此是两个人。

提交里也老实记了一句 Directive，提醒未来的自己：

> Replace local session tokens with real auth tokens before claiming durable cross-device accounts.

会话 token 能区分浏览器，但它不是跨设备账号——这点我没有假装解决。

## 怎么做：residentProfiles 持久化

身份解决了「你是谁」，接下来是「你住在哪、关了再来还在不在」。提交 `4d0dd78`「Make residents feel persistent before deeper town systems」的判断是：在做更深的 NPC 偏好调优之前，玩家得先能认出自己。

我为此新建了一张表，`convex/schema.ts`：

```ts
residentProfiles: defineTable({
  worldId: v.id('worlds'),
  tokenIdentifier: v.string(),
  sessionId: v.string(),
  name: v.string(),
  character: v.string(),
  savedPosition: v.optional(point),
  savedFacing: v.optional(vector),
  lastSavedAt: v.optional(v.number()),
  daysSlept: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index('worldId', ['worldId'])
  .index('worldToken', ['worldId', 'tokenIdentifier']),
```

注意 `worldToken` 这个联合索引——`(worldId, tokenIdentifier)`。一个世界里一个会话 token 唯一对应一份档案，这是持久化能稳定命中的前提。

存盘的时机我选在「睡觉」。`sleepAndSaveResident` mutation 里，睡觉等于一次显式存档点（`convex/world.ts`）：

```ts
await upsertResidentProfile(
  ctx.db,
  world._id,
  tokenIdentifier,
  args.sessionId,
  playerDescription?.name ?? DEFAULT_NAME,
  sanitizePlayerCharacter(playerDescription?.character, args.sessionId),
  {
    savedPosition: player.position,
    savedFacing: player.facing,
    lastSavedAt: now,
    daysSlept: (existingProfile?.daysSlept ?? 0) + 1,
  },
);
```

睡一觉，当前位置、朝向被写进 profile，`daysSlept` 加一。等同一个浏览器会话重新加入时，`joinWorld` 会先把档案捞出来，把存档位置当作出生点喂给 join 输入：

```ts
const profile = await findResidentProfile(ctx.db, world._id, tokenIdentifier);
// ...
return await insertInput(ctx, world._id, 'join', {
  name,
  character,
  description: `${name} 是一名真人玩家，会在溪山镇、画室和小菜园里操作自己的角色。`,
  tokenIdentifier,
  spawnPosition: profile?.savedPosition,
  spawnFacing: profile?.savedFacing,
});
```

到了引擎里，`Player.join`（`convex/aiTown/player.ts`）会优先尊重这个存档位置，只有当它被占用时才随机找空位：

```ts
let position = spawnPosition && !blocked(game, now, spawnPosition) ? spawnPosition : undefined;
if (!position) {
  for (let attempt = 0; attempt < 10; attempt++) {
    // 随机找一个没被挡住的格子
  }
}
```

这条链路连起来，效果就是：你昨天在哪睡的，今天就从哪醒来。这是「居民」和「访客」最实在的区别。

顺带一提，`Player.join` 里那段 `numHumans >= MAX_HUMAN_PLAYERS` 的检查，配合「同一个 token 不能重复加入」，正是 `f8213e2` 拆掉共享身份后才真正生效的——每个浏览器是独立一席，不会再互相挤占。

## 怎么做：沉浸式单屏

身份和持久化是后端的事，沉浸感是前端的事。提交 `65551cf`「Keep resident play locked to one screen」抓的痛点很具体：

> The town view had become larger than the browser viewport, so using the map felt like scrolling a web page instead of moving a character.

地图比视口大，于是「用地图」变成了「滚网页」。解法是把 app 根锁进可见视口，禁掉 body 滚动。`src/index.css` 里：

```css
.town-root {
  height: 100dvh;
  justify-content: flex-start;
  min-height: 0;
  overflow: hidden;
}
```

用 `100dvh` 而不是 `100vh`，是为了在移动端地址栏伸缩时也稳。再配合 `overflow: hidden` 和 `overscroll-behavior: none`，键盘移动角色时页面纹丝不动，不会出现「按方向键结果网页跟着滚」的尴尬。

是否进入沉浸模式，由 `src/App.tsx` 里一个很短的判断决定：

```tsx
const { isResident } = useResidentPresence();
const residentGameMode = isResident;
const townIsImmersive = scene === 'town' && residentGameMode;
```

`isResident` 来自 `useResidentPresence`，它的判定是：在世界的玩家列表里，能不能找到 `human` 字段等于当前浏览器 token 的那个角色。找得到，你就是居民，地图全屏铺开、HUD 浮出、侧栏标题之类的「观众装饰」全部让位（`src/hooks/useResidentPresence.ts`）：

```ts
const humanPlayerId =
  game && humanTokenIdentifier
    ? [...game.world.players.values()].find((player) => player.human === humanTokenIdentifier)?.id
    : undefined;

return {
  game,
  humanPlayerId,
  isResident: humanPlayerId !== undefined,
  worldId,
};
```

一旦 `townIsImmersive` 为真，`App.tsx` 就藏掉小镇标题区、换上全屏 `TownHud`。整块屏幕从「展示页」切成「游戏画面」。

## 怎么做：走路代替拖拽

最后一步，也是我最想要的：导航靠走路。提交 `fa7a55a`「Make town navigation depend on walking」把方向说得很重：

> The town was drifting toward a web control panel: every building had a footer shortcut and every hotspot behaved like a button.

每个建筑一个底栏快捷键，每个热点都像按钮——这就退化成了网页控制台。我把这些快捷入口砍掉，让建筑重新变回「地图上的地点」：场景切换只能来自走进传送门范围、或者靠近时按 X。提交 `87494ce` 进一步把它做成 Stardew 那种感觉——职业建筑要走到门口按 X 才进，农场路给一条看得见的小路引向菜园。

这两个提交都留了同一条 Directive 给未来的我，免得手贱把按钮加回去：

> Do not add building or profession shortcuts back to the footer; add map portals or in-world signs instead.

帮助弹窗里那段操作说明，就是这套走路逻辑的直白版本（`src/App.tsx`）：沿小路走到农场路口继续向前、按 X 进菜园；靠近画室、影院、职业建筑门口按 X 进入；按 Z 停止移动或取消查看。导航第一次有了「身体在场」的感觉。

## 怎么做：侧栏变居民仪表盘

身份、持久、沉浸、走路都到位后，还差一块——让这个「家」有个仪表盘。提交 `531d3d5`「Turn the side panel into a resident dashboard」把原本空着写说明文字的右侧栏，换成了当前玩家的身份、资产、技能、菜园和画室状态。

它的判断很清醒：

> The town should feel like a place the player lives in, not only a viewport for watching AI NPCs.

后端配套加了 `residentStatus` 查询（`convex/world.ts`），把日历、画室工时、菜园地块、信箱这些散落的数据，按当前玩家聚合成一份仪表盘数据。提交还留了条 Directive：以后新增的职业或地点，都要汇总进 `residentStatus`，让居民仪表盘始终是玩家的主界面。前端那 700 多行的 `src/components/ResidentPanel.tsx`，渲染的就是这份聚合结果。

约束也写得明白：MVP 阶段复用已有的画室和菜园数据，不另起一张居民背包表——等真有了账号和持久化方案再说。能用现成数据拼出居民感，就先不造新表。

## 小结

这一篇把溪山镇从「鱼缸」改成了「可以住的地方」。串起来其实是一条很短的链：

- 用 `localStorage` 的 sessionId 给浏览器一个稳定身份，`buildSessionToken` 转成服务端的 `local:` token，顶替关掉的 Clerk；
- 用 `residentProfiles` 表把位置、朝向、天数存下来，睡觉是存档点，加入时把存档位置当出生点；
- 用 `100dvh` + `overflow: hidden` 把游戏锁进单屏，`townIsImmersive` 一个布尔切换观众/居民两套界面；
- 把建筑从按钮改回地点，导航靠走路和按 X；
- 把右侧栏从说明文字换成 `residentStatus` 聚合出的居民仪表盘。

每一步都还带着诚实的边界：会话 token 不是跨设备账号，仪表盘复用旧数据没建新表。这些没装作解决，都写进了提交的 Directive 里，留给后面的篇章。

下一篇，我打算讲讲走进建筑之后的事——职业、画室和菜园这些 MVP 内景，是怎么挂在这套居民身份上的。
