---
title: "Kodama 开发笔记 06：桌宠形象、配饰和主题包要先守住边界"
date: 2026-06-17 23:30:00
tags: [Electron, 桌宠, Live2D, 主题系统, AI Agent]
categories: [技术笔记, 项目工坊]
---

这篇记录 Kodama 做形象和配饰时遇到的一个核心问题：

> 用户想要私人水豚/GIF 形象，但公开项目不能把私人素材、版权不明素材和配置一起提交。

如果把它做成一个普通资源目录，很快就会失控。开发时本机能跑，提交时却可能把私人 GIF、模型文件、坐标配置、甚至公司内部路径带进公开仓库。

所以这轮的目标不是“多加几个可爱素材”，而是先把形象系统的边界立住。

## 公开形象和私人形象分开

Kodama 现在有两类渲染后端：

1. 默认 Live2D 后端，用公开可演示的模型。
2. 私人 GIF 后端，只在本机用。

切换私人 GIF 的入口是：

```bash
cp src/renderer/config/render.local.example.js src/renderer/config/render.local.js
```

然后把 GIF 放进：

```text
src/renderer/pets/capybara/
```

这个目录和 `render.local.js` 都在 `.gitignore` 里。公开仓库里只有 example 文件，真正的私人素材不会被提交。

这条边界非常重要。桌宠项目很容易因为“先本机跑起来”而把素材许可问题拖到最后，但到最后再清理就很麻烦。我的做法是从第一天就让私人素材路径无法进入 git。

## 配饰不是换整只模型

一开始“换装”这个词很容易误导实现。

如果每个造型都换一整只模型，会遇到几个问题：

- 每个模型都要单独处理授权。
- 每个模型动作组不一致。
- 每个模型尺寸不同，气泡和命中框都要重调。
- 私人 GIF 和 Live2D 很难共用。

所以 Kodama 的公开配饰先做成 overlay：

```text
角色模型 / GIF
  + accessory layer
    + head slot
    + face slot
    + badge slot
    + aura slot
```

配饰配置只记录相对角色 bounds 的坐标：

```js
{
  id: 'round_glasses',
  slot: 'face',
  label: '圆框眼镜',
  unlockLevel: 2,
  anchor: { x: 0.5, y: 0.35, width: 0.36, aspect: 0.32 },
}
```

这样无论底下是 Live2D 还是 GIF，配饰层都只关心一个统一的 `getBounds()`。

## 为什么要做本地配饰 pack

用户截图里桌宠大小、模型比例、气泡位置经常会变。内置配饰坐标只对默认模型比较合理。

如果用户换成私人水豚 GIF，眼镜、徽章、小芽的位置就可能全部不对。

因此我加了：

```bash
cp src/renderer/config/accessories.local.example.js src/renderer/config/accessories.local.js
```

本地文件可以做两件事：

1. 覆盖内置配饰的坐标。
2. 增加本机私有配饰。

它同样被 `.gitignore` 忽略。这样公开仓库保留干净的默认配置，本机可以为私人形象做细调。

## 配饰配置要同时影响渲染和养成

这里有一个容易漏的点。

如果只让 renderer 读取本地配饰配置，那么图层能显示，但养成系统仍然只知道内置配饰：

```text
renderer accessories: 知道本地 pack
growth unlock/equip: 不知道本地 pack
```

结果就是菜单里不一定能佩戴，升级也不一定会解锁。

所以这次把 growth 里的配饰表也改成可配置：

```text
loadAccessoryPack()
  -> activeAccessories
  -> initAccessoryLayer(..., { accessories })
  -> configureAccessories({ accessories, slots })
```

同一份 active accessories 同时进入渲染层和养成层，避免“看得见但系统不承认”的分裂状态。

## 为什么现在还不做完整插件市场

开源桌宠项目里，VPet、OpenPets、Shimeji 都有很强的主题/插件生态。但 Kodama 现在不适合直接做完整插件市场。

原因有三个：

1. 事件 schema 还在变，插件 API 太早固定会拖累迭代。
2. 桌宠窗口有点击穿透、置顶、气泡避让等敏感交互，插件随便改 DOM 会破坏体验。
3. 这个项目的核心不是“素材市场”，而是“飞书机器人 + 本地 Agent 的统一状态面板”。

因此当前策略是分三步：

1. 本地 pack：只覆盖安全的资产和坐标。
2. 主题 manifest：声明形象、动作、音效、配饰坐标。
3. 插件 SDK：等事件契约稳定后，只开放受控扩展点。

## 从其它开源项目学到的边界

这轮参考了几类项目：

- Shimeji 类项目重在图片集和屏幕行为。
- VPet 类项目重在养成、换装、互动。
- Clawd / Agent pet 类项目重在 Agent 状态和工作流。
- OpenPets 类项目重在插件化和可扩展。

Kodama 要吸收它们的能力，但不能变成另一个泛用桌宠。它的差异化应该是：

```text
桌宠外壳
  + 本地 Agent 状态
  + 飞书机器人状态
  + token / 会话 / 待交互控制面
```

因此主题系统要服务这个定位：让形象可换、可调、可私人化，但不能牺牲事件可靠性和隐私边界。

## 当前结论

这轮做到的是“主题化的地基”：

- 私人 GIF 继续走 gitignored `render.local.js`。
- 配饰图层独立于 Live2D/GIF。
- `accessories.local.js` 可以为不同形象调坐标。
- growth 和 renderer 共用 active accessories。
- 公开包排除本地私有配置和 pets 目录。

后续真正要做的是导入/导出 UI、主题 manifest、主题音效和更丰富的宠物动作。但这些都应该建立在当前边界之上，而不是先把素材乱塞进仓库。
