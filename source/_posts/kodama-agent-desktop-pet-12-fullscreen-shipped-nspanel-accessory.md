---
title: "Kodama 开发笔记 12：桌宠终于盖住全屏了 —— NSPanel + accessory 实战"
date: 2026-06-21 12:00:00
tags: [Electron, macOS, 桌宠, NSPanel, 全屏, accessory, monorepo, 工具开发]
categories: [技术笔记, 项目工坊]
---

第 10 篇结尾我留了个悬念：桌宠在普通桌面能显示，但别的 App 一进**原生全屏**，桌宠就消失了。当时我只做到「Electron 层面的尽力而为」，并说真正的解法是上 `NSPanel`，但还没做。

这一篇是兑现。桌宠现在能稳稳浮在全屏应用之上了，而真正的解法比我想象的简单——**两行配置**。但中间还夹了一个把我骗得以为「代码写坏了」的坑。

这篇尽量讲人话，把每个概念都拆开。

## 先把问题讲明白：什么是「全屏 Space」

macOS 上有两种「最大化」，很多人分不清，但它们对我们这个问题是天壤之别：

- **普通最大化**：窗口铺满屏幕，但还在原来的桌面上。桌宠盖得住。
- **原生全屏**（点绿色按钮、或按 ⌃⌘F）：macOS 会把这个 App **单独搬进一个新的"桌面"**，这个独立桌面叫 **Space**。

你可以把 Space 想象成「虚拟桌面」。一个 App 进了原生全屏，就等于它独占了一间**单独的房间**，关上门。

而普通窗口（包括我们的桌宠）默认是「**钉在它出生的那间房里**」的。你切到全屏 App 那个新房间时，桌宠没跟过来——所以它「消失」了。它没崩、进程没死，只是被关在了另一间房里。

这就是为什么这不是 `z-index`、不是图层顺序、也不是图片没加载能解释的。它是**操作系统层面的「窗口属于哪个 Space」的规则**。

## 第 10 篇做到的：尽力而为

之前我用的是 Electron 暴露的几个 API：

```js
win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
win.setAlwaysOnTop(true, 'screen-saver', 1)
win.moveTop()
// 再加上定时 reassert，被压下去就重新抬起来
```

这套组合的意思是「请让我出现在所有桌面、包括全屏桌面，并且置到很高的层级」。它能覆盖很多场景，但对**别的 App 的原生全屏**经常失效。

为什么？因为 Electron 的窗口本质是一个普通的 `NSWindow`（macOS 的标准窗口）。而 macOS 有一条潜规则：

> 一个**前台普通 App** 的**普通窗口**，即使你喊了「我要进所有 Space」，系统也不会真的让它闯进**别的 App 独占的全屏房间**。

喊了没用，是因为身份不对、窗口类型也不对。要解决，得从这两点下手。

## 关键认知反转：NSPanel 不用写原生模块

第 10 篇我以为「上 NSPanel」意味着要写 C/Objective-C 原生模块、处理编译签名，所以一直拖着。

结果调研发现：**Electron 自带了**。建窗口时传一个 `type: 'panel'` 就行：

```js
win = new BrowserWindow({
  transparent: true,
  frame: false,
  // ……其它选项……
  type: 'panel',   // ← 就这一句
})
```

[Electron 官方文档](https://www.electronjs.org/docs/latest/api/base-window)原话：`panel` 类型会在运行时给窗口加上 `NSWindowStyleMaskNonactivatingPanel`（本来是 NSPanel 专属的样式），让窗口能浮在全屏应用之上，并出现在所有 Space。

不用原生模块、不用改打包，白捡的能力。这是第一块拼图。

## 第一块拼图：`type: 'panel'`（窗口类型）

先解释什么是 **NSPanel**。

macOS 把窗口分成两类：

- **普通窗口（NSWindow）**：App 的主界面，比如浏览器的主窗口。
- **面板（NSPanel）**：「辅助工具窗口」，比如调色板、Spotlight 搜索框、输入法候选框。它们是**飘在主界面之上的小工具**。

关键区别在于：macOS 对「辅助工具面板」网开一面——**允许它作为"全屏辅助窗口"出现在全屏 Space 里**。逻辑上很合理：你在全屏写文档时，输入法候选框得能弹出来吧？那个候选框就是个 panel。

所以把桌宠窗口声明成 `panel`，等于告诉系统：「我是个飘在上面的小工具，请按辅助面板的规则放行我进全屏。」

`panel` 还附带一个属性叫**「非激活」（nonactivating）**：点它**不会把你从当前 App 拉走**。这对桌宠太重要了——你在全屏写代码，点一下桌宠，不应该把你踢出全屏编辑器。

> 顺带：启动时控制台会打印一句 `NSWindow does not support nonactivating panel styleMask 0x80`。它看着吓人，其实**无害**——这是 Electron 的[已知问题 #35815](https://github.com/electron/electron/issues/35815)（官方标记 wontfix），只影响「键盘焦点」这一个细节。我们的桌宠是点击穿透的、根本不需要键盘焦点，所以可以忽略。

但只加这一句还不够。我真机测试时**还是盖不住全屏**。因为身份那一半没解决。

## 第二块拼图：`setActivationPolicy('accessory')`（App 身份）

回到那条潜规则：「**前台普通 App** 的窗口不让闯别人全屏」。

`type:'panel'` 解决了「窗口类型」，但 kodama 这个 App 本身还是个**前台普通应用**（Dock 里有图标、能 ⌘Tab 切到、会抢焦点的那种）。

macOS 对应用也分身份：

- **regular（普通前台应用）**：浏览器、编辑器这种。它的窗口被绑定在「它自己活跃的那个 Space」。
- **accessory（辅助 / 后台 agent 应用）**：菜单栏小工具那种。**没有 Dock 图标，不抢焦点**，被系统当作「背景里的小帮手」。

而系统的规则是：**accessory 应用的 panel，才被允许覆盖任意 Space（包括别人的全屏房间）**。因为它是「背景帮手」，不属于任何一个前台房间，所以哪个房间它都能飘进去。

一行就能把 kodama 变成 accessory：

```js
app.whenReady().then(() => {
  if (process.platform === 'darwin') app.setActivationPolicy('accessory')
  // ……
})
```

**代价**：kodama 从 **Dock 和 ⌘Tab 里消失**，只剩菜单栏托盘入口。对一个桌宠/托盘类应用来说，这其实更合适——它本来就该像菜单栏小工具一样安静待在背景里。

## 为什么两块拼图缺一不可

这是最关键的一点，我也是试出来的：

| 只做这个 | 结果 |
| --- | --- |
| 只加 `type:'panel'` | 窗口类型对了，但 App 还是前台身份 → 还是盖不住别人全屏 |
| 只加 `accessory` | App 身份对了，但窗口还是普通 NSWindow → 系统仍不让它当全屏辅助窗口 |
| **两个都加** | 身份是"背景帮手" + 窗口是"辅助面板" → 系统放行，浮在全屏之上 ✅ |

再叠上原来就有的 `screen-saver` 高层级 + `visibleOnFullScreen`，配方才齐：
**①允许出现在每个 Space →②被允许覆盖全屏房间 →③画在最上层 →④还不抢你的焦点**。

这正是所有「悬浮 overlay 应用」（划词翻译悬浮窗、屏幕标注工具、AI 助手浮层……）的标准做法。

## 中间那个把我骗惨的坑：窗口在，但什么都没画

讲完正解，必须讲这个插曲，因为它教训很大。

就在我加 `type:'panel'` 测试时，桌宠**连普通桌面都看不见了**。我第一反应是「panel 把渲染搞坏了」，差点就回退放弃这条路。

但根因完全是另一回事。背景是：这阵子我把桌宠项目和它的飞书桥接器合并成了一个 **monorepo**（一个仓库装多个子项目），桌宠的代码从老目录搬到了新目录 `packages/kodama`。

搬家用的是 `git subtree`。问题在于——**git 只搬「被追踪」的文件，不搬被 `.gitignore` 忽略的文件**。而桌宠的 Live2D 渲染素材（运行时 `vendor/` 里的 `pixi.min.js`、`cubism4.min.js` 等，以及 `models/` 里的模型）因为有版权、体积大，一直是被 gitignore、不入库的。

于是新目录里：**代码在、素材不在**。窗口照样创建、`new BrowserWindow` 照样成功，但渲染层找不到模型和引擎，画了个**全透明的空窗口**——看起来就跟「桌宠消失了」一模一样。

更坑的是，我写了个 `/healthz` 健康检查接口，它当时返回 `windowReady: true`。我一看「窗口就绪啊」，更确信是 panel 的锅。**接口没撒谎，但它只知道"窗口对象建好了"，不知道"里面有没有画出东西"。**

解法很简单——把那两个素材目录从老仓拷过来（它们仍然 gitignore，不会进库）：

```bash
cp -R ~/code/kodama/src/renderer/vendor  packages/kodama/src/renderer/vendor
cp -R ~/code/kodama/src/renderer/models  packages/kodama/src/renderer/models
```

素材补齐后，`type:'panel'` 渲染完全正常，再加 accessory，桌宠就跨进全屏了。

这个坑留下三条教训，比全屏问题本身更通用：

1. **「看不见」不等于「崩了」。** 进程活着、窗口存在、接口返回 OK，但内容是空的——这是一类很隐蔽的故障。
2. **git / git subtree 不会带走 gitignore 的文件。** 任何「下载来的、不入库的运行时资源」，搬仓库时都得单独处理（拷贝，或重跑 setup 脚本重新下载）。
3. **健康检查要检查「对用户有意义的状态」。** 「窗口建好了」是开发者视角；「模型画出来了」才是用户视角。下次我会让 healthz 连「素材是否加载成功」也一起报。

## 打包时的收尾：LSUIElement

`setActivationPolicy('accessory')` 是**运行时**才生效的——App 启动那一瞬间，Dock 图标可能会**闪一下**才消失。

对打包出来的正式 `.dmg`，更干净的做法是在 `Info.plist` 里写死 `LSUIElement: true`，让它**从启动那一刻就是 accessory**，不闪图标。electron-builder 配置里加一段就行：

```json
"mac": {
  "extendInfo": { "LSUIElement": true }
}
```

## 怎么验证（第 10 篇的测试矩阵兑现）

全屏这种问题，截一张图说「好了」是不够的，得过一遍场景矩阵：

```text
普通桌面          ✅ 可见
浏览器原生全屏     ✅ 可见
编辑器原生全屏     ✅ 可见
视频播放全屏       ✅ 可见
切到别的 Space 再回来 ✅ 还在
Dock / ⌘Tab       ✅ 已无图标（accessory 生效）
点击桌宠           ✅ 不会把我踢出全屏（nonactivating）
```

## 结论：给同样卡住的人一份清单

如果你也在用 Electron 做 macOS 悬浮窗 / 桌宠 / overlay，想盖住别的 App 的原生全屏，照这个清单走：

1. 窗口加 `type: 'panel'`（白捡的 NSPanel，不用原生模块）。
2. App 加 `app.setActivationPolicy('accessory')`（变后台 agent，代价是 Dock 没图标）。
3. 保留 `setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })` + `setAlwaysOnTop('screen-saver')` + 定时 reassert 兜底。
4. 打包加 `LSUIElement: true`。
5. 控制台那条 `nonactivating panel styleMask 0x80` 警告，无视它。
6. 如果窗口「看不见」，先确认**素材/资源真的在**，再怀疑窗口代码——别像我一样冤枉了 `type:'panel'`。

桌宠和普通网页最大的不同，就在这里：网页只要在浏览器这个盒子里排好版；桌宠要直接和操作系统的窗口管理器「谈判」自己该出现在哪、归谁管、抢不抢焦点。这一篇，就是那场谈判终于谈成了。
