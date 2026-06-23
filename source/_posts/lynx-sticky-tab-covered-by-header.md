---
title: "Lynx 吸顶失效排查：状态明明是对的，tab 却没吸住——被兄弟元素 z-index 盖住的故事"
date: 2026-06-23 17:10:00
tags: [Lynx, 吸顶, position-fixed, z-index, 前端调试, 复盘]
categories: [技术笔记, 前端工程]
---

一个集卡活动页，需求很常见：往下滚到「图鉴」区时，稀有度 tab（SP/SSR/SR/R）要吸顶；滚到「抽奖」区时，主 tab 要吸顶。

现象也很明确：**真机上完全不吸顶**，怎么滚都不吸。而且——四天前，在同事大重构之前，我自己的版本是好的。

这篇记一次「现象在 A 层、根因在 B 层」的排查。最后的结论一句话：

```text
吸顶的状态逻辑一直是对的，tab 也确实在「该吸的时候」渲染了 fixed 浮层。
只是有人后来把页面顶部的 header 提到了 z-index:1000，
而吸顶浮层在 top:8px、z-index:29——正好被那条不透明的 header 盖在下面。
不是吸顶坏了，是被盖住了。
```

---

## 一、第一个陷阱：轻信旧结论「测量没量准」

吸顶这类需求，套路是监听滚动 → 拿 `scrollTop` → 和各区块的位置阈值比较 → 决定哪个 tab 该浮起来：

```ts
function syncActiveByScroll(scrollTop: number) {
    const albumStart = getSectionStart('album');
    const prizeStart = layoutOffsetsRef.current.sections.prize;     // 运行时测量
    const rarityTabsTop = layoutOffsetsRef.current.rarityTabsTop;   // 运行时测量
    const shouldFloatRarityTabs = scrollTop >= rarityTabsTop - 8 && scrollTop < prizeStart;
    setRarityTabsFloating(shouldFloatRarityTabs);
    // ...
}
```

阈值靠 `boundingClientRect` 在运行时量出来。交接文档里写着一句让人很容易顺着走的话：

> 真机不吸顶 → 运行时测量 `layoutOffsetsRef` 没量准。

于是第一反应就是去怀疑测量：是不是 `boundingClientRect` 在图片没加载完时量早了？是不是 scrollTop 没拿到？

**但「上一手交接的结论」不等于「当前的事实」。** 与其顺着猜，不如插桩。

## 二、插桩实证：状态其实完全正确

在 `syncActiveByScroll` 里把关键量全打出来：

```ts
console.log(
  `[STICKY] scrollTop=${scrollTop} albumStart=${albumStart} ` +
  `prizeStart=${prizeStart} rarityTabsTop=${rarityTabsTop} ` +
  `tab=${nextTab} floatRarity=${shouldFloatRarityTabs}`,
);
```

真机滚一遍，日志非常干净：

```text
[STICKY] scrollTop=1758 albumStart=899 prizeStart=3465 rarityTabsTop=1073 tab=album floatRarity=true
[STICKY] scrollTop=1881 albumStart=899 prizeStart=3465 rarityTabsTop=1073 tab=album floatRarity=true
[STICKY] scrollTop=2034 albumStart=899 prizeStart=3465 rarityTabsTop=1073 tab=album floatRarity=true
```

`floatRarity=true`。也就是说：

- `scrollTop` 拿到了（滚动回调正常）；
- 测量值正常（`albumStart`/`prizeStart`/`rarityTabsTop` 都是合理的大数）；
- 浮起来的**状态确实翻成了 true**。

测量根本没问题，旧结论是过时的。**状态层是对的。** 那为什么屏幕上看不到？

> 这是关键一跳：**「状态对」≠「显示对」。** 当 state 已经正确、UI 却不对时，问题在状态到像素之间的渲染层——定位、层叠、遮挡、裁剪。

## 三、回归排查的正确姿势：diff「周围」，而不是只盯自己

既然 `rarityTabsFloating=true`、浮层该渲染，而它的 CSS 也确实是：

```less
&__rarity-tabs-absolute-layer {
    position: fixed;
    top: 8px;
    left: 0;
    z-index: 29;
    width: 100%;
}
```

`position: fixed` + `top: 8px`，该钉在顶部才对。那就只剩一个可能：**它渲染了，但被别的东西盖住 / 或定位参照变了。**

我把吸顶相关的代码和四天前那个「能用」的提交逐项 diff：

```bash
# 浮层本身的 CSS：top / z-index
git show <good>:index.less | grep -A4 'tabs-absolute-layer'
# 头部 header 的 CSS
git show <good>:index.less | awk '/&__header \{/{p=1} p{print} p&&/^    \}/{exit}'
```

结果很说明问题：

| | 吸顶浮层（tabs） | 顶部 header |
|---|---|---|
| 四天前 | `top:8px` `z-index:29` | **没有** z-index / transform |
| 现在 | `top:8px` `z-index:29`（**没变**） | `position:fixed` **`z-index:1000`** `transform:translateZ(1000)` |

**浮层一个字没改；变的是 header。** 同事重构时把顶部 header 做成了固定、不透明、`z-index:1000` 的标题栏。而我的吸顶浮层在 `top:8px`、`z-index:29`——正好落在 header 的覆盖范围里，又在它下层。于是：tab 一直在吸，只是**藏在那条 header 后面**，肉眼看像「完全没吸顶」。

这也解释了「四天前是好的」：那时 header 还没这层 `z-index:1000`，`top:8px` 的 tab 露在最上面，看着就是吸住了。

> 排查回归 bug 的一个心法：当「自己这块代码和能用版一字没改却坏了」，**先去 diff 它周围的东西**——兄弟节点的 z-index、父节点的 transform、容器类型。遮挡和层叠问题，永远不在你盯着的那段 diff 里。

## 四、修复：把吸顶钉在 header 下面

既然 header 是固定在顶部、占了 `状态栏高 + 44px` 的一条，吸顶的 tab 就不该再待在 `top:8px`（被它盖住），而应该钉在 **header 的正下方**。header 高度是动态的（含安全区），所以用内联 style 把它算进去：

```tsx
// header 高度 = 状态栏高度 + 44，运行时算
const headerStyle = { height: `${HEADER_CONTENT_HEIGHT + statusBarHeight}px` };

// 吸顶浮层：top 不再写死 8px，而是顶到 header 下沿
<view
  className="__rarity-tabs-absolute-layer"
  style={{ top: headerStyle.height }}
>
  <RarityTabs floating ... />
</view>
```

内联 `top` 覆盖掉 CSS 里的 `top:8px`，tab 就稳稳吸在 header 下方了。没有动任何吸顶逻辑、没有动测量、没有碰那条「测量没量准」的旧路。

## 五、几条可以带走的经验

1. **「状态对」≠「显示对」。** state 已正确、UI 还不对时，别在状态逻辑里继续刨，去看渲染层：定位、z-index、遮挡、裁剪、transform。
2. **别把上一手的交接结论当事实。** 「测量没量准」把我往沟里带了一程；插桩一打，测量明明是对的。结论会过时，日志不会骗人。
3. **回归 bug 先 diff「周围」。** 坏掉的代码和能用版一字没改，根因往往在兄弟/父节点的属性变化（这次是 header 的 `z-index:1000`）。
4. **`position: fixed` 的两个老坑**：① 它会被更高 `z-index` 的兄弟元素盖住（本例）；② 在 Lynx/Web 里，如果**祖先**带了 `transform`，fixed 会改为相对那个祖先定位、而不是视口——本例 header 的 `translateZ(1000)` 在它自己身上没坑，但如果它是浮层的祖先就会出事，值得警惕。
5. **吸顶要钉在 header 下沿、且高度动态算**（状态栏安全区因机型而异），别写死 px。

---

一行 `top` 的修复，价值不在那一行，而在「为什么是这一行」：现象在「tab 不吸顶」，根因却在「一个兄弟 header 的 z-index」。把视线从「我的吸顶逻辑」挪到「我周围发生了什么」，问题就现形了。
