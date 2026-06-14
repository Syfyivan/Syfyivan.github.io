---
title: "AI 小镇改造手记 · 三：可进入的建筑，把地图变成一串房间"
date: 2026-06-15 13:00:00
tags: [AI, Agent, AI Town, 改造手记, 前端, PixiJS]
categories: [技术笔记, AI 小镇改造手记]
---

接着上一篇说。

我把 a16z 的 AI Town 拿来改成"溪山镇"之后，一直有个东西卡着我。

镇子是活的，角色会闲逛、会聊天、会记住彼此。可那张地图，始终只是一张背景画。你能在上面走，能点角色对话，但镇上那些房子、那片农田、那座影院——它们只是像素瓦片拼出来的"图案"，不是"地方"。

我想要的是：走到画室门口，就走进画室；踩上那条通往农场的路，人就被路"带"进农场。一栋建筑应该是一个能进去的房间，不是一张贴上去的图。

这一篇就讲我怎么把一张地图，变成一串能走进去的房间。

## 为什么非要"能走进去"

原版 AI Town 的玩法核心是观察：你看 NPC 怎么活动。建筑在这套逻辑里只是布景，没人需要进去。

但我给溪山镇加了画家工会、菜园、影院、各种职业作坊这些"可玩系统"之后，观察者视角就不够用了。这些系统得有个**承载它们的空间**。如果画室还是地图上一团瓦片，那工会的接单、画师、资源、作品这些玩法只能塞进一个浮在地图上的面板里——而面板这种东西，本质上还是"工具弹窗"，跟"走进一个房间"是两种完全不同的体感。

我在那次提交（`9936127 Make town buildings play like entered spaces`）的说明里给自己写过一句话：

> The resident loop was still behaving like an observer dashboard.

居民玩法还是一副观察者仪表盘的样子。这正是我要干掉的东西。所以这一版我做了三件事：把画室和菜园从"盖在地图上的浮层"改成"页面级的场景"，加上键盘移动和动作键，让默认的居民视角变成沉浸式的。

## 难点：四个我一开始没想清楚的问题

真动手才发现，"能走进去"这件事拆开来是四个独立的小问题：

1. **新建筑怎么无缝画进既有地图。** 我一开始图省事，用 PixiJS 的画图原语手画了几个方块当建筑。结果它们跟原版那套像素瓦片地图风格完全两张皮，一眼就是"外来物"。
2. **怎么定义"进入"的触发区。** 走到哪儿算"到门口了"？是踩到某一格，还是站在附近按键？
3. **进去之后怎么切场景。** 是盖一层浮窗，还是真的把整个画面换掉？
4. **走路怎么"把人带进去"。** 我希望走上那条通往农场的路，人自然而然就进去了，而不是非得停下来点个按钮。

下面一个个说我最后怎么解的。

## 怎么做的

### 建筑用 `gentleTownTiles` 画，跟地图同一套瓦片

那个"两张皮"的问题，我中间还走过弯路。一度我引入了一套农场风格的瓦片表（farm-life）来画建筑，看着是精致了，但因为是另一张图集，跟镇子主体一比还是不和谐（提交 `0af3865` 加进来，`5c0c62d` 又把它从地图上撤掉了）。最后定下来的规矩很简单：**地图上的建筑，必须用地图本身那套瓦片画**。

于是我抽了一个 `gentleTownTiles.ts`，专门从镇子原本就在用的那张 `gentle-obj.png` 里裁瓦片：

```ts
// src/components/gentleTownTiles.ts
const GENTLE_TILE_SIZE = 32;
const GENTLE_TILE_COLUMNS = 45;
const GENTLE_TILE_SOURCE = '/ai-town/assets/gentle-obj.png';

function gentleTexture(frame: number) {
  const cached = textureCache.get(frame);
  if (cached) {
    return cached;
  }
  const source = PIXI.Texture.from(GENTLE_TILE_SOURCE);
  source.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  const texture = new PIXI.Texture(
    source.baseTexture,
    new PIXI.Rectangle(
      (frame % GENTLE_TILE_COLUMNS) * GENTLE_TILE_SIZE,
      Math.floor(frame / GENTLE_TILE_COLUMNS) * GENTLE_TILE_SIZE,
      GENTLE_TILE_SIZE,
      GENTLE_TILE_SIZE,
    ),
  );
  textureCache.set(frame, texture);
  return texture;
}
```

逻辑朴素到不能再朴素：给一个瓦片编号 `frame`，按列数算出它在图集里的行列，裁一个 32×32 的矩形出来。`NEAREST` 缩放保证放大后还是硬边的像素感，不糊。纹理裁完缓存住，同一个瓦片不重复裁。

有了它，画一栋建筑就是"摆瓦片"。比如画室（`src/components/ArtStudioHotspot.tsx`）：

```ts
// src/components/ArtStudioHotspot.tsx
addGentleTileGrid(
  container,
  [
    [GENTLE_TILES.tentTopLeft, GENTLE_TILES.tentTop, GENTLE_TILES.tentTopRight],
    [GENTLE_TILES.tentMidLeft, GENTLE_TILES.tentMid, GENTLE_TILES.tentMidRight],
    [GENTLE_TILES.tentBottomLeft, GENTLE_TILES.tentBottom, GENTLE_TILES.tentBottomRight],
  ],
  tileDim,
  3.35,
  1,
);

addGentleTile(container, GENTLE_TILES.log, tileDim, 2, 4.6);
addGentleTile(container, GENTLE_TILES.flowerRed, tileDim, 1.55, 5.45);
addGentleTile(container, GENTLE_TILES.post, tileDim, 3.75, 6.05);
```

一个 3×3 的帐篷瓦片网格拼出主体，再点缀几根木头、几朵花、两根栅栏柱。因为用的全是地图自带的瓦片，它天然就跟周围融成一片——你不会觉得它是"贴上去的"，它看着就像镇子本来就长在那儿的一处营地。我后来给自己定的方向是：**外部地标用当前镇子的瓦片，农场那种第三方精致素材，留到进了门、进了内部场景再用。**

### portal region：用一小块矩形定义"门口"

"走到哪儿算进门"，我没搞复杂，就是给每栋建筑配一个小小的矩形触发区。还是看画室：

```ts
// src/components/ArtStudioHotspot.tsx
export const ART_STUDIO_REGION = {
  x: 12,
  y: 27,
  width: 10,
  height: 8,
};

export const ART_STUDIO_PORTAL_REGION = {
  x: 16,
  y: 33,
  width: 2,
  height: 1,
};
```

`ART_STUDIO_REGION` 是整栋建筑占的地，`ART_STUDIO_PORTAL_REGION` 才是真正的"门"——只有 2×1 两格，压在建筑底边正中。这个拆分是有意的：建筑可以画得很大很热闹，但**只有门口那一两格才真的拦截"进入"**。我当时给自己写的约束是：场景入口要小、要能正常走过去，只有最后那块 portal 瓦片才负责把人接进去。

这么设计还有个好处——它纯粹是视觉层和判定层的事，完全没动数据库里的地图碰撞数据。对已经在线上跑着的世界来说，这是最安全的做法。

我也认真想过另一条路：去改地图的碰撞数据，把门口那格做成真正的"传送格"。但我最后否了。一来这要动数据库里的世界数据，已经在跑的世界全得跟着迁移；二来对一个 MVP 来说，一个纯视觉的传送门就足够了，没必要为了"更正统"去背这个风险。能用视觉层解决的，就不往数据层碰。

### 判定靠 `nearRegion`：站在门口附近按 X

判定进入的逻辑在 `src/components/PixiGame.tsx` 的键盘处理里。我没要求玩家精准踩在那两格上，而是放宽到"附近"：

```ts
// src/components/PixiGame.tsx
const nearRegion = (
  position: Point,
  region: { x: number; y: number; width: number; height: number },
) =>
  position.x >= region.x - 1.5 &&
  position.x <= region.x + region.width + 1.5 &&
  position.y >= region.y - 1.5 &&
  position.y <= region.y + region.height + 1.5;
```

往四周各放宽 1.5 格。然后按 X 键时，挨个问每个建筑的 portal 区"我在你附近吗"：

```ts
// src/components/PixiGame.tsx
if (key === 'x') {
  event.preventDefault();
  const professionBuilding = PROFESSION_BUILDINGS.find(
    (building) =>
      props.onOpenProfession && nearRegion(humanPlayer.position, building.portalRegion),
  );
  if (professionBuilding) {
    props.onOpenProfession?.(professionBuilding.profession);
    return;
  }
  if (props.onOpenArtStudio && nearRegion(humanPlayer.position, ART_STUDIO_PORTAL_REGION)) {
    props.onOpenArtStudio();
    return;
  }
  // ...菜园、影院同理
  selectNearestResident(humanPlayer.position);
  return;
}
```

站在画室门口按 X，就调 `onOpenArtStudio`；要是哪个门口都不在，X 就退化成"选中最近的居民"。一个键，根据你站的位置干不同的事，体感上很自然。

这里有个小细节我斟酌了一下：判定是有顺序的——先问职业作坊，再问画室、菜园、影院，最后才落到选居民。因为这几个 portal 区在地图上不重叠，顺序其实无所谓谁先谁后，但我还是按"专用功能优先、通用兜底垫底"的次序排，将来真有两个触发区贴得近了，也不至于互相抢。`event.preventDefault()` 那一下也别漏，不然 X 这种字符键在某些输入态下会被浏览器抢走。

### 走路把人带进去：踩上路就进场

光有按键还不够"自然"。我最想要的那种感觉是——通往农场的那条路，你走上去、继续往前迈一步，人就进去了，不用停下来按任何键。这个就在移动处理里截一刀：

```ts
// src/components/PixiGame.tsx
if (movement[key]) {
  event.preventDefault();
  // ...节流判定...
  if (
    props.onOpenGarden &&
    pointInRegion(tilePosition(humanPlayer.position), FARM_ROAD_EXIT_REGION) &&
    (movement[key].x > 0 || movement[key].y > 0)
  ) {
    props.onOpenGarden();
    return;
  }
  const destination = {
    x: Math.floor(humanPlayer.position.x + movement[key].x),
    y: Math.floor(humanPlayer.position.y + movement[key].y),
  };
  void toastOnError(moveTo({ playerId: humanPlayerId, destination }));
  return;
}
```

人已经站在农场路的出口格上（`FARM_ROAD_EXIT_REGION`），并且还在朝正方向往前走，那这一步就不再是"移动一格"，而是直接进农场。那条路本身是用 `gentleTownTiles` 一段段铺出来的瓦片小径（`src/components/FarmRoadHotspot.tsx`），尽头立了块"去农场"的木牌。视觉上它就是路，走着走着就进去了——这正是我提交 `cda183e Let town roads carry players into scenes` 想要的：让镇上的路把人带进场景，而不是在地图上拍一排按钮。

### 场景状态机：scene 一切，整页换掉

最后是"进去之后画面怎么换"。答案不是浮层，是一个顶层的场景状态机。在 `src/App.tsx` 里就一个枚举加一个 state：

```tsx
// src/App.tsx
type TownScene = 'town' | 'studio' | 'garden' | 'profession';

const [scene, setScene] = useState<TownScene>('town');
```

那几个 `onOpenXxx` 回调，干的事就是切这个 state：

```tsx
// src/App.tsx
{scene === 'town' && !cinemaOpen && (
  <Game
    immersive={townIsImmersive}
    onOpenArtStudio={() => setScene('studio')}
    onOpenGarden={() => setScene('garden')}
    onOpenProfession={openProfession}
  />
)}

{scene === 'studio' && <ArtStudioOverlay open onClose={() => setScene('town')} />}
{scene === 'garden' && <GardenOverlay open onClose={() => setScene('town')} />}
```

`scene === 'town'` 时渲染镇子，切成 `'studio'` 就整页换成画室场景，`onClose` 再切回 `'town'`。关键在于这是**页面级的互斥切换**，不是叠浮层——进了画室，镇子就不在画面里了。这一刀下去，那股"工具弹窗"的味道才算彻底没了。

### 画室直接接画家工会 demo

画室进去是什么，我没从零写。我之前有个独立的"画家工会"demo（接单、画师名册、工作模式、颜料资源、作品、工会日志一整套），就把它整份拷进 `public/painters-guild/`，画室场景用一个 iframe 把它嵌进来当内容（提交 `73a019c`）：

```tsx
// src/components/ArtStudioOverlay.tsx
const PAINTERS_GUILD_SRC = '/ai-town/painters-guild/index.html';

// ...场景外壳里：
<div className="painters-guild-frame-shell">
  <iframe
    className="painters-guild-frame"
    src={PAINTERS_GUILD_SRC}
    title="画家工会"
    scrolling="no"
  />
</div>
```

外面套一层溪山镇的场景头（标题"溪山画家工会"、一个"返回小镇"按钮），里面是那套完整的工会玩法。我特意把 demo 放在本地 `public/` 下，而不是运行时去拉外部 GitHub Pages，免得线上还依赖一个外部地址。至于把 demo 的状态真正接进 Convex、做持久化和多人归属——那是想清楚之后的下一步，这一版先让它在镇子里跑起来再说。

## 小结

回头看，"把地图变成一串能走进去的房间"，技术上其实没有什么重活：

- 建筑用 `gentleTownTiles` 跟地图同一套瓦片画，融进去而不是贴上去；
- 每栋建筑配一个小小的 portal region，只有门口那一两格负责"进入"；
- 站在门口按 X、或者走上路踩过出口格，触发 `onOpenXxx`；
- 顶层一个 `scene` 状态机，整页互斥切换，干掉浮层那股工具味；
- 内容尽量复用已有的 demo，先跑起来。

难的从来不是代码，是先想清楚"我要的是房间，不是按钮"。一旦这句话定下来，剩下的每一步该怎么选，就都清楚了。

下一篇，我想聊聊进了门之后——这些房间里的玩法，怎么真正接进 Convex，让它们也变成镇子持久记忆的一部分。
