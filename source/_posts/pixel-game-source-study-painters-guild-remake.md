---
title: "像素经营游戏源码拆解：为什么现在的画家工会看起来不像游戏"
date: 2026-06-07 13:40:00
tags: [游戏开发, 像素游戏, Phaser, 模拟经营, 源码阅读]
categories: [技术笔记]
---

前面做了一个可以在博客上玩的《画家工会》原型，但实际看下来效果很差：房间像网页表格，小人像道具，作画反馈像进度条，多个画家站到画架前以后还会和 UI 混成一团。

这个问题不能继续靠调 CSS 解决。要先看成熟游戏的源码和资源管线，弄清楚差距到底在哪一层。

这篇笔记整理一次源码学习：

- 原作 `Painters Guild` 的源码能不能查到；
- 有哪些开源像素游戏源码可以参考；
- 它们和当前原型的核心差距；
- 如果重做，画家工会应该怎么拆系统、渲染和素材。

## 原作源码结论

`Painters Guild` 的合法公开源码，目前没有查到。

我查到的公开信息是：

- Steam 页面显示它是 Lucas Molina 开发/发行的商业游戏，玩法核心是经营文艺复兴画家公会、雇佣画家、接画作订单、购买家具、扩张工作室。[Steam 页面](https://store.steampowered.com/app/384550/Painters_Guild/)
- SteamDB 显示它使用的是 `Adobe AIR Engine`。[SteamDB 信息页](https://steamdb.info/app/384550/info/)
- Lucas Molina 官网列出了这个游戏，但没有源码仓库链接。[Lucas Molina Games](https://lucasmolinagames.com/)
- GameDeveloper 的采访能看到一些设计意图：学徒、训练、材料准备、画派、客户委托、多人协作画作等，但这不是源码。[GameDeveloper 采访](https://www.gamedeveloper.com/design/how-art-history-sexuality-matter-in-i-painters-guild-i-)

所以，如果网上有人能拿出“原作源码”，大概率来自反编译 Steam 或 4399 包。这个可以作为个人学习观察，但不能当成我们发布版本的代码或素材来源。

这里要分清楚：

```text
可以学：玩法结构、交互节奏、画面组织、任务反馈
不要抄：反编译代码、原作素材、原作 UI 细节、原作文本
```

我们真正应该做的是学习开源项目的工程方式。

## 我拉了哪些源码

我在本地临时目录浅拉了几个项目，用来读目录结构和关键文件：

| 项目 | 用途 | 本地查看到的 commit | 主要参考点 |
| --- | --- | --- | --- |
| [Phaser](https://github.com/phaserjs/phaser) | 网页 2D 游戏框架 | `9e67ded` | Scene、Sprite、Animation、Loader、Tilemap |
| [Cytopia](https://github.com/CytopiaTeam/Cytopia) | 开源复古像素城市建造 | `b67e255` | tile 数据、地图层、等距渲染、资源 JSON |
| [OpenRCT2](https://github.com/OpenRCT2/OpenRCT2) | 开源重实现经营模拟 | `5afa4f6` | 员工/游客实体、tick 更新、窗口 UI、经营系统 |
| [Mindustry](https://github.com/Anuken/Mindustry) | 开源像素工厂/RTS | `4a92523` | 实体分组、建筑更新、资源流、多人/服务端结构 |
| [Shattered Pixel Dungeon](https://github.com/00-Evan/shattered-pixel-dungeon) | 开源像素 Roguelike | `7b8b845` | 角色 sprite、状态反馈、清晰的像素资源目录 |
| [TouchyTickets](https://git.ellpeck.de/Ellpeck/TouchyTickets) | 小体量经营游戏源码 | `56b596d` | 地图格、设施数据、收益循环 |

其中 TouchyTickets 我没有在浅拷贝里看到明确 license 文件，所以只当作阅读参考，不作为可复用代码模板。

## 差距一：我们现在不是游戏渲染，是网页布局

当前画家工会原型的核心结构大致是：

```text
HTML 面板
  -> CSS grid 房间
  -> 每个工位是 button
  -> 画架、小人、进度条、文字都塞在 button 里
  -> game.js 改 DOM / class / style
```

这会导致几个天然问题：

- 小人、画架、进度条、工位标签互相抢空间；
- 层级靠 `z-index` 猜，稍微变动就压住；
- sprite 尺寸不是世界坐标，而是 CSS 盒子尺寸；
- 动画不是角色动画，而是 DOM 元素抖动；
- 房间不是地图，而是一组按钮；
- 画作不是游戏对象，而是几个 span 拼出来的视觉效果。

Phaser 的结构完全不同。它的 `Scene` 是游戏组织单位，每个 Scene 有自己的 display list、update loop、camera、input、loader。Sprite 是游戏对象，可以注册进 update list，由 animation state 驱动帧动画。

这意味着我们的画家工会不应该再让 “画家” 是某个 button 里的 `<span>`，而应该是：

```text
Painter entity
  -> world position
  -> current station
  -> current task
  -> current animation
  -> sprite object
```

UI 只负责显示信息，不负责承载世界。

## 差距二：别人有资源管线，我们在手工猜图片编号

这次最明显的事故就是：我把 Kenney tile 包里的道具 tile 当成了画家人物 tile。结果 NPC 上画架以后，看起来像“任务变成了物品”。

这个问题的根因不是单个编号写错，而是缺少资源管线。

成熟项目一般不会这样写：

```js
const PAINTER_ASSETS = {
  p1: "tile_0112.png",
  p2: "tile_0098.png"
};
```

它们会把资源变成可验证的数据：

```text
spritesheet: painters.png
frame width: 32
frame height: 32
animations:
  qinglan_idle: [0, 1, 2, 3]
  qinglan_walk: [4, 5, 6, 7]
  qinglan_paint: [8, 9, 10, 11]
```

TouchyTickets 里可以看到这种思路：`Assets.cs` 把 `Tiles.png`、`Attractions.png`、`Ui.png` 统一加载成 atlas；`AttractionType.cs` 里每个设施有覆盖格子、贴图区域、初始价格、收益率、标签。也就是说，资源不是“图片路径字符串”，而是游戏数据的一部分。

Cytopia 更进一步。它有 `TileData.json`，每个 tile 写清楚：

- 需要占几个格子；
- 属于什么类别；
- 价格、污染、幸福、用水、用电；
- 对应的图片文件、裁剪尺寸、数量；
- 是否随机挑 tile；
- 是否可以放在水上或地上。

所以它不会出现“把柜子当成人”的低级错误，因为资源有类型、有类别、有约束。

画家工会也应该有自己的资源表：

```json
{
  "painters": {
    "qinglan": {
      "atlas": "painters",
      "portraitFrame": 0,
      "animations": {
        "idle": "qinglan_idle",
        "walk": "qinglan_walk",
        "paint": "qinglan_paint",
        "mix": "qinglan_mix",
        "rest": "qinglan_rest",
        "study": "qinglan_study"
      }
    }
  }
}
```

如果没有这一步，后面再怎么修 UI 都会反复出错。

## 差距三：别人把地图当世界，我们把房间当表格

现在的画室是一个 CSS grid。它能表达“第几行第几列”，但表达不了真实的房间：

- 墙体、地板、门、窗、楼梯；
- 家具占地；
- 角色站位；
- 角色行走路径；
- 遮挡关系；
- 背景层、家具层、角色层、前景层；
- 玩家点击的是地图格、家具、角色还是 UI。

Cytopia 的地图层设计很值得学。它有 `MapLayers`，可控制 terrain、building、water、zone、road、powerline、flora 等层是否启用。`Sprite` 会按 layer 渲染，并且使用底部作为定位基准，让更高的建筑不会从错误的点开始画。

这正是我们现在缺的：

```text
背景层：墙、地板、光照
家具层：画架、床、书桌、调色台
作品层：画布、画作阶段
角色层：画家、学徒、客户
前景层：门框、架子、遮挡物
UI 层：订单、资源、角色卡
```

当前 DOM 版本把这些层都压在一个工位 button 里，所以画家站到画架前就会挡画、挡进度条、像物品堆。

## 差距四：别人有实体和系统，我们只有一坨状态

现在的 `game.js` 里有订单、画家、工位、NPC 调度、渲染、事件绑定、联机、日志、购买逻辑。它能跑，但很难继续长大。

OpenRCT2 的结构非常大，但方向清楚：游客、员工、车辆、设施、地图、财务、研究、天气、窗口 UI 都分在不同模块。游客和员工属于实体，每个 tick 更新。它还会把部分低频逻辑分批做，比如游客/员工有每 128 tick 的更新，不是所有昂贵逻辑每帧全跑。

这个点对我们特别重要。学徒视角下的 NPC 不应该只是一个 `updateGuildDirector()` 大函数，而应该拆成几个系统：

```text
OrderSystem       生成/接取/过期订单
TaskSystem        推进画作阶段和质量
PainterSystem     疲劳、心情、技能、动作
NpcDirectorSystem 给 NPC 分配工作
StationSystem     站位、容量、家具占用
PaintStockSystem  颜料消耗、研磨、库存上限
PaymentSystem     结算、工钱、声望
RenderSystem      把状态同步到 sprite
```

这样老板视角和学徒视角只是控制权不同：

```text
老板视角：玩家可以给 NPC 发指令
学徒视角：玩家只控制自己，NPCDirectorSystem 控制其他 NPC
联机视角：服务器裁决状态，客户端只发意图
```

系统拆开以后，NPC 是否摸鱼就不再是一个奇怪的问题。它可以变成一个明确的日程和需求模型：

```text
工作日程：
  08:00 开工，优先处理加急订单
  12:00 疲劳高的人休息，低疲劳的人补颜料
  16:00 空闲画家学习或接待客户
  20:00 收尾、交付、清理工位

个人需求：
  疲劳高 -> 休息
  心情低 -> 慢画、社交、学习
  技能低 -> 学习
  颜料低 -> 调色师优先研磨
  急单临期 -> 能力最高的人优先上
```

## 差距五：别人让像素图“读得懂”

Shattered Pixel Dungeon 的资源目录很值得看。它把角色、怪物、物品、界面、特效、字体分别放在清晰目录里：

```text
sprites/
interfaces/
effects/
fonts/
sounds/
music/
```

这听起来只是文件夹，但它决定了视觉清晰度。

我们的错误是把“能用的像素图”当成“合适的像素图”。实际上像素游戏里角色可读性很讲究：

- 人物 silhouette 要一眼能看出是人；
- 道具和人物不能共用相似尺寸/轮廓；
- 工作状态要靠动画，不只靠文字；
- UI 图标和世界 sprite 要分开；
- 同一场景里尽量统一透视、光源、边框粗细、色盘；
- 角色站在家具前时，要有明确的站位基准和遮挡顺序。

这就是为什么当前版本看起来“烂”：不是因为少一张更漂亮的图，而是因为整个资源语法没有建立。

## 差距六：别人把 UI 当工具，不当世界本体

OpenRCT2 的 UI 很密，但它的世界仍然是世界：游客在走、设施在转、员工在巡逻。窗口只是查看和发指令。

我们的当前版本恰好反过来：世界像 UI，UI 像世界。订单、日志、工位标题、进度条、小人名字都挤在一个屏幕上，玩家看到的是信息面板，不是画室。

画家工会应该改成：

```text
主画面：画室本身
  画家走动、作画、调色、睡觉、学习
  客户进门、订单挂到公告板
  画布从白布到草稿到完成

侧边 UI：只显示必要信息
  订单列表
  选中画家状态
  金币、颜料、声望
  当前指令按钮
```

玩家第一眼应该看到“公会在运转”，不是看到“一个管理面板”。

## 我们应该怎么重做

我建议不要继续在当前 DOM 版本上无限修补。当前版本适合作为规则草稿，但不适合作为最终游戏表现层。

新版本可以这样拆：

```text
source/painters-guild-v2/
  index.html
  src/
    main.js
    scenes/
      BootScene.js
      GuildScene.js
      HudScene.js
    domain/
      createState.js
      selectors.js
      constants.js
    systems/
      orderSystem.js
      taskSystem.js
      painterSystem.js
      npcDirectorSystem.js
      stationSystem.js
      paintStockSystem.js
      paymentSystem.js
    render/
      PainterSprite.js
      StationSprite.js
      PaintingCanvasSprite.js
      depthSort.js
    data/
      painters.json
      stations.json
      orders.json
      assets.json
  assets/
    maps/
      guild.tmj
    sprites/
      painters.png
      painters.json
      stations.png
      paintings.png
    ui/
      icons.png
```

其中：

- `GuildScene` 负责地图、角色、家具、作画动画；
- `HudScene` 负责订单栏、角色卡、资源栏；
- `systems/*` 只改状态，不碰 DOM；
- `render/*` 把状态映射成 sprite、动画和深度；
- `data/*` 存画家、工位、订单、资源表；
- 地图用 Tiled 或 LDtk 编辑，不再手写 CSS grid。

### 第一阶段：只重做一个房间

不要一上来做完整游戏。先做一个真正像游戏的竖切：

```text
一个画室
两个画架
一个调色台
一张床
一张学徒桌
四个 NPC
一个玩家学徒
三张订单
```

验收标准不是“功能全”，而是：

- 画家能走到工位；
- 每个画家是人物 sprite，不是 DOM 图标；
- 作画有 `paint` 动画；
- 画布能从白布变成草稿、底色、完成图；
- NPC 会自行工作；
- 玩家只控制自己；
- UI 不遮挡主画面；
- 截图第一眼像游戏，而不是像网页表格。

### 第二阶段：把当前规则迁过去

当前 DOM 版本里已经有一些可保留的规则：

- 订单价格、颜料消耗、期限；
- 加急订单；
- 画家技能、疲劳、心情；
- 快画、稳画、精修；
- 大画架多人协作；
- 学徒视角下 NPC 自行调度。

这些应该迁成纯数据和系统函数：

```js
function advanceTask(state, taskId, dt) {}
function updatePainterNeeds(state, painterId, dt) {}
function chooseNpcJob(state, painterId) {}
function acceptOrder(state, orderId, stationId) {}
```

然后 Phaser 只负责表现：

```js
painterSprite.play(`${painter.id}_${painter.action}`);
paintingSprite.setProgress(task.progress, task.phaseIndex);
```

### 第三阶段：再接联机和 AI 小镇

联机不要先做表现层之前硬接。应该等世界状态稳定以后，再把状态同步拆出来：

```text
客户端：
  发送玩家意图：move_to_station / choose_mode / accept_order

服务端：
  裁决状态：订单、NPC、任务推进、结算

客户端：
  根据 snapshot 渲染画面
```

这样以后放进 AI 小镇时，订单可以来自小镇 NPC：

```text
咖啡馆老板 -> 要菜单插画
学校老师 -> 要节日海报
镇长 -> 要候选人肖像
教堂管事 -> 要祭坛草图
```

作品完成后，也能真的挂回小镇地点，而不是只出现在日志里。

## 现版本还能保留什么

现版本不是完全没价值。它的价值是“规则探索”：

- 多人画家工会这个方向是成立的；
- 老板视角和学徒视角可以共存；
- NPC 自行调度是必要的；
- 加急订单、长期订单、多人画架都能形成压力；
- 博客页面可以承载可玩原型；
- WebSocket 后端可以作为联机雏形。

但现版本不适合继续承担视觉目标。

更准确的定位是：

```text
当前 DOM 版：玩法规则草稿 / 可交互需求文档
Phaser 新版：真正游戏原型
```

## 最后的判断

现在这个效果烂，不是因为差一张素材，而是因为我们把网页布局当成了游戏渲染。

成熟像素游戏至少有四个底层习惯：

1. 世界是地图和实体，不是 DOM 卡片；
2. 角色是 sprite + animation，不是图片标签；
3. 资源有 atlas 和数据表，不靠手写文件名猜；
4. UI 是工具层，不是主世界本身。

如果目标只是“博客上有个能玩的玩具”，当前版本还能继续修。

但如果目标是“像一个真正的画家公会游戏，并且以后能放进 AI 小镇”，就应该尽快开始 Phaser 重构。

下一步我会建议先做 `painters-guild-v2` 的最小竖切：一个房间、一个可走动学徒、一个 NPC 自动作画、一张画布从白板变成画作。只要这一屏像游戏了，再迁经营系统。
