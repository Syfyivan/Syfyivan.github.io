---
title: "Lynx RL3 活动页真机调试手记：本地资源、拉页、动效和设计还原"
date: 2026-06-18 11:40:00
tags: [Lynx, ReactLynx, 真机调试, Figma, 前端调试, 动效]
categories: [技术笔记, 前端工程]
---

这次做一个 Lynx RL3 活动页，真正耗时间的不是某个单点样式，而是几类问题叠在一起：

```text
本地模板能加载，但图片资源走了离线包 / CDN 兜底；
DevTool 能看到设备，但宿主不一定支持 App.openPage；
CDP 能 reload，但不一定能把页面带到前台；
Lottie 能播完，但旧动画层如果没卸掉，会在结果页上闪回；
Figma 给了 390 基准，但实现里卡片和角标很容易越调越大。
```

这篇把这几类坑整理一下。重点不是记录某个项目的业务细节，而是沉淀一套下次还能复用的调试顺序。

## 1. 先分清：模板本地，不等于资源本地

真机调试时，一个常见错觉是：

```text
template.js 是本地 dev server 返回的 200，
所以页面里所有图片、Lottie、按钮切图也都是本地资源。
```

这句话不一定成立。活动页的模板可能从本地 dev server 走，但静态资源路径可能被构建器或宿主资源系统改写到离线包、Gecko 或 CDN 兜底通道。结果就是：

```text
JS 模板：本地 200
按钮切图：被改写到离线资源通道，404
页面表现：只剩文字 DOM，看起来像样式没写
```

所以排查图片不显示时，不要只 `curl template.js`。还要看运行时实际请求的图片 URL 是什么。如果是本地调试，最好明确切到“本地资源模式”，让图片、Lottie、按钮切图都直接请求 dev server。否则会出现一种很迷惑的 dev-only 假象：上线资源已经传到 CDN 了，生产没问题，但本地看起来像全坏了。

这个问题的判断标准很简单：

```text
不是“模板是不是 200”，而是“页面实际用到的每一个资源是不是走了预期通道”。
```

## 2. 拉真机页面：先确认要打哪个 session

Lynx DevTool 里有两类能力容易混在一起：

```text
App.openPage  / open：让宿主打开一个新页面；
Page.reload：让已有 Lynx session 重新加载一个 template URL。
```

如果宿主支持 `App.openPage`，这当然最省事。但这次遇到的开发版宿主直接返回 `not implemented`。这时继续反复调 `open` 没意义。

另一个容易误判的路径，是在业务页面 session 或隔离上下文里 `Runtime.evaluate`，然后去找 `multiApps["0"].NativeModules.bridge`。这类上下文通常够不到 service 里的 bridge，结果就是调不到 `readingOpen`，页面自然拉不起来。

这次真正可用的路径只有一条：

```text
1. list-sessions，确认 session 1 是 lynx-service 常驻页；
2. 对 session 1 发 CDP Runtime.evaluate；
3. 在 service context 里调 readingOpen；
4. readingOpen 参数包成 { data: { url } }；
5. 等新业务页面 session 出现，再对新 session 做 Page.reload。
```

命令形态可以固定成这样：

```bash
SCHEME='dragon1967://lynxview?...&url=sslocal%3A%2F%2Flynxview%3F__dev%3D1%26enable_canvas%3D1%26surl%3Dhttp%253A%252F%252F<dev-host>%253A4459%252Fgame-invasion-card%252Ftemplate.js%253Fmock%253D1'

EXPR="multiApps[\"0\"].NativeModules.bridge.call(\"readingOpen\",{data:{url:\"$SCHEME\"}},function(r){})"

node /path/to/lynx-devtool/scripts/index.mjs cdp -s 1 -m Runtime.evaluate \
  "{\"expression\":$(python3 -c 'import json,sys;print(json.dumps(sys.argv[1]))' "$EXPR")}"
```

几个判断边界要分清：

```text
App.openPage 返回 not implemented：宿主能力不支持，换 service readingOpen。
业务页面 session 里 bridge undefined：context 打错了，去 session 1。
九宫格图片空白只剩文字：资源 404 / 资源模式问题，和拉页方式不是一类问题。
```

## 3. Page.reload 成功，不等于 list-sessions 里的 URL 会变

`Page.reload` 很适合把当前页面强制刷到本地 dev server：

```text
Page.reload({ ignoreCache: true, url: "http://.../template.js?mock=1" })
```

但有一个细节：session 列表里显示的 URL 可能不会更新。也就是说，命令返回 `{}` 并不代表失败，`list-sessions` 里还是旧 URL 也不一定代表失败。

判断 reload 有没有生效，要结合：

```text
dev server 请求日志；
页面实际截图；
console / warning；
业务状态是否回到 mock 初始值。
```

这类工具输出都只能证明自己那一层的事实。`list-sessions` 是调试目标注册时的元信息，不是页面当前运行代码的最终裁判。

## 4. 十抽动效：结果页出来后，旧动画层必须卸掉

十抽有一个典型的动效链路：

```text
Lottie 出卡 overview
  -> 动画完成
  -> 横滑大卡 carousel
```

一开始为了让衔接丝滑，会想保留 overview 层淡出，让 carousel 从下面淡入。但这里有个风险：如果保留的是整个 overview，包括 `animax-view`，那么横滑页面已经出现后，Lottie 仍然可能重绘或重播一帧。肉眼看到的就是：

```text
横滑已经出现；
停一下；
闪一下；
又冒出一个光圈和十抽结果。
```

正确做法是把“视觉连续性”和“动画播放器生命周期”拆开：

```text
可以保留一层蒙层做淡出；
但 carousel 出现后，不要再 render animax-view。
```

同时，Lottie completion 和兜底 timer 要走同一个幂等入口：

```text
enterCarousel()
  -> 如果已经进入过，直接 return
  -> 清掉 fallback timer
  -> 设置 carousel 状态
  -> 只保留 mask fade，不保留 animax-view
```

这能避免 completion 先触发，几百毫秒或一两秒后兜底 timer 又触发一次，把旧 overview 重挂回来。

## 5. 单抽结果：按 390 基准还原，而不是凭感觉调

单抽弹窗这类页面，很容易出现“越调越像，但越调越大”的问题。原因是实现里通常已经有一套卡片尺寸、标题尺寸、按钮尺寸，后来叠加设计稿时只改局部，就会变成：

```text
稀有度切图过大；
卡名跟着被顶高；
角标尺寸和位置都漂了；
卡片主体比设计稿大一圈；
标题被挤到看不见或靠得太近。
```

这次按 Figma 的 390 宽基准重新量了一遍关键坐标：

```text
标题「恭喜获得」：y≈132，高 36
SP 切图：68 × 40
SSR 切图：94 × 34
卡片：240 × 372
卡面区：240 × 337
“新”角标：32 × 28
```

实现时直接按 390 基准写 px，因为当前构建配置会按 designWidth 做适配。这样比“看截图手感调大一点 / 小一点”稳定得多。

还有一个细节：设计稿里可能没有真实卡名，但业务结果必须显示卡名。这种情况不要为了完全贴图而删业务信息，而是把设计里缺失的元素补在合理位置：

```text
卡名接在稀有度右侧；
比稀有度视觉中心略下沉；
字重降到 500；
不再用大号粗体抢 SP/SSR 的层级。
```

## 6. 这类问题的通用顺序

下次再遇到 Lynx 活动页调试，我会按这个顺序走：

```text
1. 先确认资源模式：template、本地图、Lottie asset 是否同源同通道。
2. 再确认拉页方式：App.openPage 是否可用，不可用就从 service bridge 拉起。
3. 再确认当前 session：不要对旧 session 发 reload / screenshot。
4. 动效切换先画状态机：completion、timer、fade、unmount 谁先谁后。
5. 设计还原按基准量坐标：不要用肉眼在多个缩放截图之间来回猜。
6. 最后才是局部 CSS 微调。
```

这里最重要的经验是：不要把一个工具视角当成全局真相。

```text
curl 200 只证明这个 URL 可访问；
list-sessions 只证明调试目标注册过；
CDP eval 只证明某个 VM 某个上下文里看到了什么；
截图只证明某一帧；
Figma 坐标只证明设计基准，不证明运行时业务内容刚好存在。
```

把每个证据的边界说清楚，调试会少走很多弯路。
