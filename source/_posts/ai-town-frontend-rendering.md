---
title: "AI Town 课程 10：前端渲染，PixiJS 怎么把世界画成平滑画面"
date: 2026-06-14 18:00:00
tags: [AI, Agent, AI Town, PixiJS, 前端渲染, 课程]
categories: [技术笔记]
---

前面九讲都在讲后端：单线程引擎、输入信箱、调度续跑、记忆检索、历史回放。讲到这里，世界的"真相"已经很清楚了——它是 Convex 里一份离散的世界状态，每隔一段时间提交一次。

但用户看到的不是这份状态。用户看到的是一个会动的像素小镇：角色一步一步走，水车在转，地图能拖能缩放，鼠标点一下角色就过去了。

这一讲我想把镜头拉到前端，回答一个具体问题：**服务端给的是一份离散、低频、按 tick 提交的世界状态，前端怎么把它画成一帧一帧连续、可缩放、会动的画面？** 这中间隔着一整个渲染层，主角是 PixiJS。

第 4 讲讲过历史回放的原理和 hook，那是"怎么从一段轨迹里插值出某个时刻的位置"。这一讲不重复那个算法，只讲**渲染层怎么落地**：瓦片地图怎么铺、精灵怎么动、视口怎么缩放拖拽，以及回放 hook 算出来的位置最后是怎么接到精灵上的。

代码全部来自 `src/` 目录，路径和组件名都标出来，不编造。

## 服务端给的是离散世界状态

先把输入摆清楚。前端通过一个 hook 拿世界状态，在 `src/hooks/serverGame.ts`：

```ts
// src/hooks/serverGame.ts  useServerGame
export function useServerGame(worldId: Id<'worlds'> | undefined): ServerGame | undefined {
  const worldState = useQuery(api.world.worldState, worldId ? { worldId } : 'skip');
  const descriptions = useQuery(api.world.gameDescriptions, worldId ? { worldId } : 'skip');
  const game = useMemo(() => {
    if (!worldState || !descriptions) return undefined;
    return {
      world: new World(worldState.world),
      agentDescriptions: parseMap(descriptions.agentDescriptions, AgentDescription, (p) => p.agentId),
      playerDescriptions: parseMap(descriptions.playerDescriptions, PlayerDescription, (p) => p.playerId),
      worldMap: new WorldMap(descriptions.worldMap),
    };
  }, [worldState, descriptions]);
  return game;
}
```

两个 `useQuery` 是 Convex 的实时订阅：后端引擎每提交一次 step，`worldState` 就推一份新的过来。前端把它解析成内存对象——`World`（玩家、对话、Agent）、`WorldMap`（地图）、一堆 description（角色长什么样）。

注意这份 `world` 是离散的：它带着每个玩家的"当前位置"，但这个位置是上一次提交时的快照，不是此刻的真实位置。引擎为了省写放大，几百个 tick 才落库一次（第 3 讲讲过）。如果前端直接照着 `player.position` 画，角色会一卡一卡地瞬移。

所以前端要做的事有两层。第一层是**空间映射**：把世界坐标（瓦片单位）画成屏幕像素，还要能缩放、拖拽。第二层是**时间插值**：把离散的状态快照，在两次提交之间补成连续的运动。第一层是这一讲的主线，第二层靠第 4 讲的回放 hook，最后一节接起来。

## 为什么是 PixiJS

一个小镇里几十个角色，每个角色每帧都要重画；地图是几千个瓦片拼出来的；还有水车、篝火、瀑布这些一直在循环播放的动画。这种场景，DOM 扛不住——几千个 `<div>` 每帧重排会直接卡死。

PixiJS 是一个 WebGL 2D 渲染引擎，正好对症：

- **WebGL 批量绘制**。所有精灵走 GPU，几千个 sprite 一次 draw call 批掉，CPU 只管组织场景树。
- **精灵（Sprite）模型**。一张大图（spritesheet）切成很多小帧，角色行走就是在几帧之间循环切纹理，天然适合像素游戏。
- **瓦片友好**。地图本质就是一堆共享同一张纹理的小矩形，PixiJS 的 `Texture` 可以从同一个 `BaseTexture` 上裁子区域，几千个瓦片共享一张底图，显存只占一份。

项目用的是 `@pixi/react`，把 PixiJS 的命令式 API 包成 React 组件。`Stage`、`Container`、`AnimatedSprite` 这些都能当 JSX 写，状态变了组件重渲染，Pixi 场景树跟着更新。但有些场景命令式更顺手——后面会看到地图和视口都用 `PixiComponent` 直接写原生 Pixi 代码，因为它们要么一次性构建、要么需要细粒度控制。

## PixiStaticMap 怎么铺瓦片地图

地图渲染在 `src/components/PixiStaticMap.tsx`，它用 `PixiComponent` 定义了一个叫 `StaticMap` 的原生组件。关键是 `create`，它只在挂载时跑一次，把整张地图"印"到一个 Container 上。

第一步，把 tileset 切成纹理表：

```ts
// src/components/PixiStaticMap.tsx  create
const numxtiles = Math.floor(map.tileSetDimX / map.tileDim);
const numytiles = Math.floor(map.tileSetDimY / map.tileDim);
const bt = PIXI.BaseTexture.from(map.tileSetUrl, {
  scaleMode: PIXI.SCALE_MODES.NEAREST,
});

const tiles = [];
for (let x = 0; x < numxtiles; x++) {
  for (let y = 0; y < numytiles; y++) {
    tiles[x + y * numxtiles] = new PIXI.Texture(
      bt,
      new PIXI.Rectangle(x * map.tileDim, y * map.tileDim, map.tileDim, map.tileDim),
    );
  }
}
```

`tileSetUrl` 是一张大图，里面排着所有可用的瓦片。代码按 `tileDim`（瓦片边长，像素）把它切成一个 `tiles` 数组：每个元素是一个 `PIXI.Texture`，它**不复制像素**，只是记录"在 `bt` 这张底图上，从某个矩形裁出来"。所以无论地图多大，底图只加载一份。

这里有个像素游戏的必修细节：`scaleMode: NEAREST`。默认的线性插值会在放大时把像素糊成一团，最近邻采样才能保住像素画那种硬边。瓦片纹理和后面所有精灵都用了 NEAREST。

第二步，按地图数据把瓦片贴上去：

```ts
// src/components/PixiStaticMap.tsx  create  贴图循环
const container = new PIXI.Container();
const allLayers = [...map.bgTiles, ...map.objectTiles];

for (let i = 0; i < screenxtiles * screenytiles; i++) {
  const x = i % screenxtiles;
  const y = Math.floor(i / screenxtiles);
  for (const layer of allLayers) {
    const tileIndex = layer[x][y];
    if (tileIndex === -1) continue;   // 该格这一层没有瓦片
    const ctile = new PIXI.Sprite(tiles[tileIndex]);
    ctile.x = x * map.tileDim;
    ctile.y = y * map.tileDim;
    container.addChild(ctile);
  }
}
```

地图数据是 `bgTiles` 和 `objectTiles` 两组层（`worldMap.ts` 里注释写得很直白：`layer[x][y]` 是 tileIndex，`-1` 表示空）。代码遍历每个格子、每一层，按 `tileIndex` 从 `tiles` 取对应纹理，做成一个 `Sprite`，摆到 `(x*tileDim, y*tileDim)` 的像素位置，挂进 container。

分层很重要：背景层（草地、水）先贴，物体层（树、墙）后贴。**addChild 的顺序就是绘制顺序**，后加的盖在先加的上面，于是树自然压在草地上。这是后面理解角色遮挡的关键。

第三步，动画精灵单独处理。地图里那些会动的东西（篝火、水车、瀑布），不是静态瓦片，而是 `animatedSprites`：

```ts
// src/components/PixiStaticMap.tsx  create  动画精灵
const spriteSheet = new PIXI.Spritesheet(texture, spritesheet);
spriteSheet.parse().then(() => {
  for (const sprite of sprites) {
    const pixiAnimation = spriteSheet.animations[sprite.animation];
    const pixiSprite = new PIXI.AnimatedSprite(pixiAnimation);
    pixiSprite.animationSpeed = 0.1;
    pixiSprite.autoUpdate = true;
    pixiSprite.x = sprite.x;
    pixiSprite.y = sprite.y;
    container.addChild(pixiSprite);
    pixiSprite.play();
  }
});
```

`AnimatedSprite` 接一组纹理帧，`play()` 之后 Pixi 的 ticker 自己循环播放，`autoUpdate = true` 让它跟着渲染循环走，不用我们手动推帧。这些动画跟世界状态无关，是纯装饰，所以一次性建好就不管了。

最后还有一行容易忽略但很关键：

```ts
// src/components/PixiStaticMap.tsx  create  末尾
container.interactive = true;
container.hitArea = new PIXI.Rectangle(0, 0, screenxtiles * map.tileDim, screenytiles * map.tileDim);
```

手动把整张地图设成可交互、并指定命中区域，是为了让 `pointerdown` 能落到地图上——用户点地图让角色走，靠的就是这个。

整个 `StaticMap` 的设计哲学是：**地图是静态的，构建一次就行。** 它不订阅世界状态，不随 React 重渲染，`applyProps` 里只做了默认透传。把不变的东西从渲染循环里摘出去，是性能的第一道防线。

## Character 怎么用精灵图做行走动画

角色渲染在 `src/components/Character.tsx`。和地图相反，角色是高频变化的——每帧都可能换位置、换朝向、切动画帧。

先看角色的"皮"怎么来。看 `data/spritesheets/player.ts`，一个角色的精灵表长这样：

```ts
// data/spritesheets/player.ts
frames: {
  left:  { frame: { x: 0,  y: 0, w: 16, h: 16 }, ... },
  left2: { frame: { x: 16, y: 0, w: 16, h: 16 }, ... },
  left3: { frame: { x: 32, y: 0, w: 16, h: 16 }, ... },
  up:    { frame: { x: 0,  y: 16, w: 16, h: 16 }, ... },
  // ...
},
animations: {
  left: ['left', 'left2', 'left3'],
  up:   ['up', 'up2', 'up3'],
  down: ['down', 'down2', 'down3'],
},
```

一张 16×16 的小图里排着每个方向的三帧行走动画。`frames` 标每帧在图上的矩形，`animations` 把帧组成"向左走""向上走"这样的序列。`Character` 组件挂载时把它 parse 成 `Spritesheet`：

```ts
// src/components/Character.tsx
const sheet = new Spritesheet(
  BaseTexture.from(textureUrl, { scaleMode: PIXI.SCALE_MODES.NEAREST }),
  spritesheetData,
);
await sheet.parse();
setSpriteSheet(sheet);
```

朝向是怎么映射成动画的？组件拿到一个 `orientation`（角度），换算成四个方向之一：

```ts
// src/components/Character.tsx
const roundedOrientation = Math.floor(orientation / 90);
const direction = ['right', 'down', 'left', 'up'][roundedOrientation];
```

注释里有个巧思：精灵表只画了 left/up/down 三个方向，`right` 是把 `left` 水平翻转得到的——省了三帧素材。最后把方向对应的动画接到 `AnimatedSprite` 上：

```tsx
// src/components/Character.tsx  渲染
<AnimatedSprite
  ref={ref}
  isPlaying={isMoving}
  textures={spriteSheet.animations[direction]}
  animationSpeed={speed}
  anchor={{ x: 0.5, y: 0.5 }}
/>
```

三个点串起来就是行走动画的全部：`textures` 决定播哪个方向的帧序列，`isPlaying={isMoving}` 决定动不动——站着不动时停在某一帧，走起来才循环切帧；`anchor={0.5}` 把锚点放在精灵中心，这样定位用的是脚下中心点，缩放旋转也绕中心。

`Character` 还在外层 `Container` 上挂了思考气泡、说话气泡、emoji、本人高亮，全是按 props 条件渲染的子节点。它本身不关心"该站哪"，位置由 `x`、`y` 两个 props 传进来——这正是下一节回放接线的接口。

## PixiViewport 的缩放与拖拽

地图和角色都画在世界坐标系里（像素 = 瓦片 × tileDim）。但用户的屏幕只有一块，要能拖、能缩放、能跟随。这层在 `src/components/PixiViewport.tsx`，用的是 `pixi-viewport` 库。

```ts
// src/components/PixiViewport.tsx  create
const viewport = new Viewport({
  events: app.renderer.events,
  passiveWheel: false,
  ...viewportProps,
});
viewport
  .drag()
  .pinch({})
  .wheel()
  .decelerate()
  .clamp({ direction: 'all', underflow: 'center' })
  .setZoom(-10)
  .clampZoom({
    minScale: (1.04 * props.screenWidth) / (props.worldWidth / 2),
    maxScale: 3.0,
  });
```

链式调用每一项是一个插件：`drag()` 拖拽，`pinch()` 双指缩放，`wheel()` 滚轮缩放，`decelerate()` 松手后的惯性减速。`clamp` 把视口锁在世界范围内、内容比屏幕小时居中。`clampZoom` 限制缩放范围——`minScale` 按屏幕宽和世界宽算出来，保证最小缩放下世界刚好填满，`maxScale: 3` 是放大上限。

Viewport 本质是一个能平移缩放的 Container，地图、角色全是它的子节点。它做的事就是在世界坐标和屏幕坐标之间维护一个变换矩阵。

这个矩阵也是坐标换算的钥匙。回看 `PixiGame.tsx` 处理点击的代码：

```ts
// src/components/PixiGame.tsx  onMapPointerUp
const gameSpacePx = viewport.toWorld(e.screenX, e.screenY);
const tileDim = props.game.worldMap.tileDim;
const gameSpaceTiles = { x: gameSpacePx.x / tileDim, y: gameSpacePx.y / tileDim };
const roundedTiles = { x: Math.floor(gameSpaceTiles.x), y: Math.floor(gameSpaceTiles.y) };
await toastOnError(moveTo({ playerId: humanPlayerId, destination: roundedTiles }));
```

`viewport.toWorld` 把鼠标的屏幕坐标转回世界像素，再除以 `tileDim` 得到瓦片坐标，取整就是目标格子。这条链路（屏幕 → 世界像素 → 瓦片）和渲染时（瓦片 → 世界像素 → 屏幕）正好是反过来的。点击发出的 `moveTo` 不是直接改画面，而是提交成一条 input，绕回后端引擎——前面几讲讲过的"前端只发输入"，在这里闭环了。

Viewport 也用 `viewportRef` 暴露给外层，于是 `PixiGame` 能在本人角色刚创建时把镜头平滑推过去：

```ts
// src/components/PixiGame.tsx  跟随本人
viewportRef.current.animate({
  position: new PIXI.Point(humanPlayer.position.x * tileDim, humanPlayer.position.y * tileDim),
  scale: 1.5,
});
```

## 把回放 hook 接到精灵位置上

现在把两层接起来。`PixiGame` 是组装现场，它在 viewport 里依次铺地图、动画层、各种热点，最后画所有玩家：

```tsx
// src/components/PixiGame.tsx  return
<PixiViewport ... viewportRef={viewportRef}>
  <PixiStaticMap map={props.game.worldMap} onpointerup={onMapPointerUp} onpointerdown={onMapPointerDown} />
  {/* ...mailbox / 各种 hotspot... */}
  {players.map((p) => (
    <Player
      key={`player-${p.id}`}
      game={props.game}
      player={p}
      isViewer={p.id === humanPlayerId}
      onClick={props.setSelectedElement}
      historicalTime={props.historicalTime}
    />
  ))}
</PixiViewport>
```

层级顺序就是遮挡顺序：地图最底，玩家最上。注意这里把 `historicalTime` 透传给了每个 `Player`——这就是回放接线的入口。

`historicalTime` 从哪来？在 `Game.tsx` 里由 `useHistoricalTime(worldState?.engine)` 算出来，它是一个比服务器最新提交略微滞后的"渲染时刻"。前端不画"此刻最新的状态"，而是画"稍微过去一点、但数据已经齐全"的那一刻——用一点延迟换取插值所需的完整轨迹。这个时间管理器的原理是第 4 讲的内容，这里只把它当一个会随每帧推进的时间戳。

真正的插值发生在 `src/components/Player.tsx`：

```ts
// src/components/Player.tsx
const locationBuffer = game.world.historicalLocations?.get(player.id);
const historicalLocation = useHistoricalValue<Location>(
  locationFields,
  historicalTime,
  playerLocation(player),
  locationBuffer,
);
if (!historicalLocation) return null;

const tileDim = game.worldMap.tileDim;
const historicalFacing = { dx: historicalLocation.dx, dy: historicalLocation.dy };
return (
  <Character
    x={historicalLocation.x * tileDim + tileDim / 2}
    y={historicalLocation.y * tileDim + tileDim / 2}
    orientation={orientationDegrees(historicalFacing)}
    isMoving={historicalLocation.speed > 0}
    /* ...isThinking / isSpeaking / emoji... */
    textureUrl={character.textureUrl}
    spritesheetData={character.spritesheetData}
  />
);
```

这是整条链路的接缝，一步步看：

`game.world.historicalLocations` 是后端随状态一起推过来的轨迹缓冲（一段时间内位置采样的二进制打包）。`useHistoricalValue`（`src/hooks/useHistoricalValue.ts`）拿轨迹 + `historicalTime`，插值出"那一刻"角色应该在哪、朝向、速度。它内部维护一个 `HistoryManager`，按时间在采样点之间查值——这是第 4 讲的算法，这里不展开。

关键是它的**输出怎么变成渲染**：

- 位置 `x/y` 是瓦片坐标，乘 `tileDim` 转成世界像素，再 `+ tileDim/2` 落到格子中心（对应 `Character` 里 `anchor: 0.5`），喂给 `Character` 的 `x/y`。
- `dx/dy` 朝向算成角度，喂 `orientation`，决定播哪个方向的动画。
- `speed > 0` 喂 `isMoving`，决定动画播不播——这就是为什么角色走动时腿在动、停下就静止。

所以接线的本质是：**回放 hook 在每个渲染帧吐出一组连续的 `{x, y, dx, dy, speed}`，`Player` 把它翻译成 `Character` 的位置和动画 props，PixiJS 每帧据此重画精灵。** 离散的世界状态进来，连续的画面出去，缝合点就在 `Player` 这十几行。

值得停一下的是职责分层：`Character` 只懂"给我坐标和朝向，我画精灵"，完全不知道有回放这回事；`Player` 只懂"从轨迹插值出坐标，转成 Character 的 props"，不碰 Pixi；`useHistoricalValue` 只懂时间和插值，不碰渲染。三层各管一段，换掉任意一层都不影响其它两层——这是这套渲染代码最值得抄的地方。

## 踩坑

**精灵层级和遮挡靠 addChild 顺序，不是 z-index。** Pixi 的 Container 默认按子节点添加顺序绘制，后加的盖在上面。地图分背景层、物体层、玩家层，全靠在 `PixiGame` 的 JSX 里和 `PixiStaticMap` 的循环里把顺序排对。如果想让角色走到树后面被挡住，需要更细的按 y 排序（depth sorting），这套基础实现里玩家统一画在最上层，是简化。改之前先想清楚你要不要真正的前后遮挡。

**批量性能的命门是共享纹理和减少重建。** 几千个瓦片之所以不卡，是因为它们共享同一个 `BaseTexture`，Pixi 能把它们批进同一次 draw call。一旦不小心给每个精灵用了不同底图，批处理就断了，draw call 数量爆炸。另一条是 `StaticMap` 一次性构建、不随 React 重渲染——把静态内容钉死在渲染循环外，比任何微优化都管用。角色那边则相反，是高频更新，要靠 `key` 稳定让 React 复用组件、靠回放把更新摊平到每帧。

**坐标换算要分清三套系统。** 瓦片坐标（整数格子）、世界像素（瓦片 × tileDim）、屏幕像素（被 viewport 变换过）。渲染是瓦片 → 世界像素 → 屏幕；点击是屏幕 → 世界像素 → 瓦片，靠 `viewport.toWorld` 反推。中间还有 `anchor` 和 `+tileDim/2` 这类中心点偏移。少乘一次 `tileDim`、忘了 `toWorld`、锚点没对齐，角色就会偏半格或点不准。把这三套坐标和它们之间的变换在脑子里画清楚，是调这类渲染 bug 的前提。

**NEAREST 采样别漏。** 像素游戏里只要有一处纹理用了默认的线性插值，放大后就会糊。tileset、角色、动画精灵的 `BaseTexture.from` 都显式传了 `scaleMode: NEAREST`，这是像素质感的硬要求，不是可选项。

## 小结

把这一讲串起来：服务端给的是一份离散、低频提交的世界状态，前端的渲染层要把它变成连续、可缩放、会动的画面。

落到 PixiJS 上是四件事。**PixiStaticMap** 把地图当静态资源，一次性把瓦片和装饰动画印到一个 Container，共享纹理、分层叠放，构建完就脱离渲染循环。**Character** 用 spritesheet 做行走动画，按朝向选帧序列、按 `isMoving` 决定播不播，只认 `x/y/orientation` 这组纯输入。**PixiViewport** 维护世界坐标到屏幕的变换，包办拖拽缩放惯性，还提供 `toWorld` 让点击能反推回瓦片。**Player** 是接缝，把回放 hook 每帧插值出的连续位置翻译成 Character 的 props。

迁移到自己的项目，有三点可以照搬。

第一，**把静态和动态分开渲染。** 不变的背景一次性构建、钉在渲染循环外，只让真正高频的东西每帧更新。这条在任何重渲染场景都成立，不限于游戏。

第二，**渲染层只认连续输入，时间插值单独一层。** Character 不知道有回放，Player 不碰 Pixi，hook 不碰渲染。后端低频提交、前端高频插值、渲染只管画——这套"离散状态 + 客户端插值"的结构，做实时协作、做行情图、做任何"服务端省着推、客户端要顺滑"的场景都能套。

第三，**坐标系统提前理清。** 任何把抽象状态画到屏幕的系统，都有逻辑坐标和屏幕坐标两套，中间隔着一个可平移缩放的变换。把正向（画）和反向（命中测试）两条路径想清楚，比事后调像素偏移省心得多。

像素小镇也好，别的可视化也好，渲染层的核心问题都一样：用一份省着传的离散状态，喂出一帧一帧顺滑的画面。

## 对应源文件

- `src/hooks/serverGame.ts`：`useServerGame`，订阅并解析后端世界状态成 `World / WorldMap / descriptions`。
- `src/components/PixiGame.tsx`：渲染主组装，铺 viewport / 地图 / 玩家，点击 `toWorld` 反推瓦片并发 `moveTo`，键盘移动与镜头跟随。
- `src/components/PixiStaticMap.tsx`：`StaticMap`，tileset 切纹理、按层贴瓦片、装饰动画精灵、命中区域。
- `src/components/Character.tsx`：精灵表 parse、朝向→方向→动画帧、`AnimatedSprite` 行走动画、气泡与高亮。
- `src/components/Player.tsx`：回放接缝，`useHistoricalValue` 插值出位置/朝向/速度，转成 `Character` 的 props。
- `src/components/PixiViewport.tsx`：`pixi-viewport` 封装，drag/pinch/wheel/clamp/clampZoom 与坐标变换。
- `src/hooks/useHistoricalValue.ts`：轨迹缓冲插值（算法属第 4 讲）。
- `data/spritesheets/player.ts`：角色精灵表，`frames` 与 `animations` 的结构示例。
