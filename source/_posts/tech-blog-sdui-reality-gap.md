---
title: "技术博客不是技术史：从 Airbnb 的 SDUI 说起"
date: 2026-06-18 13:19:00
description: 从 Cat Chen 关于 Airbnb SDUI 的 X 帖出发，梳理 Server-Driven UI、Ghost Platform、Viaduct、Sapling/stacked diff，以及为什么大公司技术博客经常不能被当成完整的技术演化史。
tags: [技术博客, SDUI, Airbnb, 前端工程, 工程管理]
categories: [技术笔记, 前端工程]
---

Cat Chen 今天在 X 上提到一个很值得反复想的问题：大公司的技术博客通常写得很好看，但如果拿它当技术演化史，容易误读真实发生过的事。

他举的例子是 Airbnb 多年前那篇著名的 Server-Driven UI 文章。公开文章里，Airbnb 的 Ghost Platform 看起来像一个很完整的跨端 UI 方案：后端下发界面结构、数据和动作，Web、iOS、Android 三端用同一套 schema 渲染。这样看起来可以减少客户端发版依赖，也更容易做 A/B 实验和跨端一致性。

但 Cat Chen 在帖里补了一层内部视角：他后来找 Airbnb 朋友交流，听到的说法是，文章里的方案在公司内推广并不顺利，因为产品团队往往只想把屏幕里的一小块变成 SDUI，而平台框架要求整个屏幕按 SDUI 重写。这个说法本身属于原帖作者转述的经历，外部无法独立核验；但它很适合作为一个提醒：技术博客通常写的是“系统设计想要抵达的形态”，不一定写“真实组织如何接受它”。

这篇文章想把这个问题拆开讲清楚：SDUI 到底是什么，Airbnb 公开文章真正说了什么，为什么“技术上成立”和“组织里推得动”不是一回事，以及我们应该怎样读大公司的技术博客。

## 先分清三层信息

读这类讨论时，最容易犯的错误是把所有信息混在一起。这里至少有三层：

第一层是公开事实。Airbnb Engineering 在 2021 年发布了 [A Deep Dive into Airbnb's Server-Driven UI System](https://medium.com/airbnb-engineering/a-deep-dive-into-airbnbs-server-driven-ui-system-842244c5f5)，介绍了 Ghost Platform。文章明确说，它面向 Web、iOS、Android，使用通用的 sections、screens、layouts、actions 和 GraphQL schema 来表达 UI。

第二层是原帖叙述。Cat Chen 的 [X 帖](https://x.com/CatChen/status/2067452823025975398) 说，他从 Airbnb 朋友那里听到过另一种实践反馈：产品只想局部试用，但框架要求整屏重写，导致推广受阻。这不是公开工程文档里的可核验事实，而是一个内部经历转述。

第三层是分析判断。我的理解是：这两层不一定矛盾。一个平台可以在某些核心页面或某些组织边界内被大量使用，同时在另一些业务线、另一些局部改造需求上推不动。大公司技术博客经常会把“平台愿景”和“成功样本”放在前台，而把迁移阻力、组织摩擦、失败样本、局部妥协放在后台。

这也是为什么技术博客可以读，但不能只照单全收。

## SDUI 到底解决什么问题

Server-Driven UI，直译是服务端驱动 UI。它不是简单的“后端返回 JSON”，而是把界面结构也纳入后端协议。

传统模式大概是这样：

```text
后端返回业务数据
  -> iOS 自己决定怎么渲染
  -> Android 自己决定怎么渲染
  -> Web 自己决定怎么渲染
```

SDUI 想改成这样：

```text
后端返回 UI 描述 + 数据 + 动作
  -> 客户端根据 schema 找到对应组件
  -> 客户端用原生能力渲染
  -> 点击、跳转、曝光、实验等动作按协议执行
```

它想解决的核心问题有几个：

- **移动端发版慢**：App Store 和 Google Play 审核、用户升级滞后，会让 UI 变化无法快速触达。
- **多端一致性难**：同一个业务页面要在 Web、iOS、Android 各写一遍，长期很容易分叉。
- **实验收敛慢**：如果 UI 变化必须依赖客户端发版，A/B 实验的覆盖面和速度都会受限。
- **业务逻辑散落**：列表、详情、筛选、文案、动作和埋点逻辑如果散在多端，维护成本会越来越高。

但 SDUI 不是把复杂度消灭了。它只是把复杂度搬到了新的地方：

```text
schema 设计
  -> 组件注册表
  -> 版本兼容
  -> 动作协议
  -> 服务端编排
  -> 客户端渲染运行时
  -> 测试、监控、回滚和调试工具
```

所以它不是“后端能随便改 UI”。更准确地说，它是“在客户端已经支持的组件和动作集合内，后端可以更灵活地组合 UI”。

## Airbnb Ghost Platform 公开文章说了什么

Airbnb 的公开文章把 Ghost Platform 描述成一个统一、带强约束的 SDUI 系统。它的几个关键点是：

- 用同一套 GraphQL schema 服务 Web、iOS、Android。
- UI 被拆成 sections 和 screens：section 表示一块可复用内容，screen 表示页面结构和布局。
- layout 决定 section 在不同设备形态下怎么排列。
- action 表示用户点击、跳转、滚动等交互动作。
- 各端用本地语言实现渲染框架：Web 是 TypeScript，iOS 是 Swift，Android 是 Kotlin。
- 底层依赖 Airbnb 的数据服务网格 Viaduct，把跨服务数据和 schema 组织在一起。

从工程设计上看，这是一套很完整的系统。它不是拿 WebView 糊一个页面，也不是把 HTML 下发给 App。它更像一套跨端 UI 协议：

```text
GraphQL schema
  -> GPResponse
  -> screens / sections / layouts / actions
  -> platform renderer
  -> native UI
```

Airbnb 在文章后半段还提到，Ghost Platform 当时已经覆盖了许多高频功能，并计划继续往 nested sections、Figma 发现能力、WYSIWYG 编辑等方向演进。

这些公开信息是真实有价值的。它告诉我们，大规模 SDUI 不是一个单点组件库，而是 schema、数据网格、客户端框架、动作系统、设计工具和组织流程的组合。

## 公开文章没办法完整告诉你的部分

问题在于，技术博客天然会省略很多“不适合写出来”的东西。

比如它通常不会完整写：

- 哪些团队拒绝迁移；
- 哪些页面迁移失败；
- 平台团队和业务团队怎么争夺优先级；
- 做一个 section 需要多少沟通成本；
- 旧页面怎么灰度、回滚和长期维护；
- 设计师和 PM 是否真的愿意接受 schema 的限制；
- 性能、包体积、调试、测试和埋点出了多少问题；
- 招聘、品牌、开源影响力这些非技术目标如何影响文章表达。

这不是说技术博客在撒谎，而是说它有明确的写作目的。大公司技术博客通常同时承担四个角色：

```text
技术分享
  + 招聘广告
  + 工程品牌建设
  + 对外叙事窗口
```

它会优先展示系统的合理性、规模、抽象和成功路径。失败路径不是没有，而是经常不在文章范围里。

## SDUI 真正难的不是渲染，而是采用

Cat Chen 原帖里最关键的点，是“产品只想改屏幕中的一小部分，但框架要求整屏重写”。这个矛盾非常典型。

对平台团队来说，整屏 SDUI 很自然：

```text
统一 schema
  -> 统一 screen
  -> 统一 layout
  -> 统一 action
  -> 统一实验和埋点
```

这样系统边界清楚，平台能力也完整。

但对业务团队来说，真实需求经常是这样的：

```text
这个详情页已经跑了很多年
  -> 我只想把中间一个推荐模块改成可配置
  -> 不想重写顶部导航、底部购买栏、复杂动画和历史埋点
  -> 不想承担整屏迁移后的回归风险
```

这时整屏框架就会变成 adoption blocker。技术上越统一，迁移成本可能越高；抽象越漂亮，局部落地越难。

这不是 Airbnb 独有的问题。很多平台化项目都会遇到同一类矛盾：

- 设计系统希望组件统一，业务希望特殊样式快点上线。
- 中台希望流程统一，业务希望只接一个接口。
- 网关希望协议统一，老系统只想加一个旁路。
- 平台希望全量迁移，业务只愿意先试一块。

一个平台能不能推开，不只看抽象是否优雅，还要看它能不能容忍不完整迁移。

## Ryan Brooks 公开讨论里的补充更接近真实工程成本

很有意思的是，Airbnb 文章作者 Ryan Brooks 后来在 Mobile Native Foundation 的 [Server-driven UI 讨论](https://github.com/MobileNativeFoundation/discussions/discussions/47) 里补过一些更接地气的信息。

他提到 SDUI 的优点包括移动端版本兼容、实验迭代、单一数据源和共享 schema。但他也列了几个代价：

- 后端可以动态改变响应，客户端测试会更难；
- 核心 section 一旦变更，可能影响多个页面设计；
- 复杂 screen 的 GraphQL 请求和响应会变大，带来性能压力；
- 如果没有强工具、mock 和文档，开发者很难预览和理解变化；
- 迁移很难，现实里经常是部分 client-driven、部分 server-driven 的混合态。

这段公开讨论反而能补足技术博客的另一半：SDUI 不是“搭好平台就万事大吉”，而是长期迁移、治理和工具建设。

真正值得学习的不是“Airbnb 做了 SDUI，所以我也要做 SDUI”，而是这句更朴素的判断：

> 如果没有专门团队、工具链、mock、测试和迁移策略，SDUI 的复杂度可能大于收益。

## 用 Meta Sapling 再看一次“公开版本”和“内部系统”的差别

Cat Chen 同一讨论里还提到过 Facebook/Meta 的 stacked diff、Arcanist、Phabricator、Mercurial、Sapling 这一线索。它和 Airbnb SDUI 是同一种阅读问题：公开出来的东西，往往不是内部系统的完整复刻。

Meta 公开介绍 [Sapling](https://engineering.fb.com/2022/11/15/open-source/sapling-source-control-scalable/) 时，强调的是一个可扩展、Git-compatible 的源代码管理客户端。Sapling 官网也把重点放在规模、易用、Git 集成和 stacked work 上。

但 stacked diff 在 Meta 内部真正好用，靠的并不只是一个本地命令行工具。它背后还需要：

```text
版本控制客户端
  -> 代码评审系统
  -> diff stack 关系模型
  -> 自动 rebase / restack
  -> CI 和提交队列
  -> 工程师习惯
  -> 大型 monorepo 的服务端能力
```

Meta 公开 Sapling，并不等于外部团队拿到 Meta 内部完整研发流。Airbnb 公开 Ghost Platform，也不等于外部团队拿到 Airbnb 内部完整产品协作机制。

这就是读大厂技术文章时最重要的分寸：公开文章经常公开“概念、接口、架构图和局部实现”，但真实生产力来自“工具链、组织流程、历史迁移和隐性制度”的组合。

## 技术博客应该怎么读

我现在会用下面这组问题读大公司技术博客。

### 1. 它在解决哪一种组织问题

不要只看技术名词。先问：这个公司为什么需要它？

Airbnb 的 SDUI 背后，是多端一致、移动端发版、实验速度、业务逻辑集中和大型产品面复用问题。离开这些组织背景，单独抄 Ghost Platform，很可能只会得到一个过重的 schema 系统。

### 2. 它的最小落地单元是什么

一个平台如果只能整屏迁移，和一个平台可以从局部 section 开始接入，推广难度完全不同。

真正要问的是：

```text
能不能先接一个模块？
能不能和旧页面共存？
能不能只托管配置，不托管全部动作？
能不能一键回滚？
能不能不改变原来的埋点和实验链路？
```

如果答案都是否定的，技术再漂亮，也很难被业务团队接受。

### 3. 它省略了哪些失败样本

大公司文章最值得看的，经常不是写出来的东西，而是没写出来的东西。

比如：

- 没写迁移周期，说明迁移可能很长；
- 没写反对意见，说明组织摩擦可能被压平了；
- 没写性能数据，说明收益可能主要是工程效率而不是运行时；
- 没写回滚和兼容，说明系统还没完全经受长期运维考验；
- 没写适用边界，说明读者需要自己补。

### 4. 它是不是把平台团队视角当成了业务团队视角

很多技术文章默认平台团队的目标就是全公司的目标。但真实组织里，平台团队在追求统一、长期治理和复用，业务团队在追求上线、转化和风险可控。

两者都合理，但优先级不同。平台视角下的“统一抽象”，在业务视角下可能就是“为了改一个模块要重写整页”。

### 5. 它有没有配套工具，而不只是架构图

SDUI 的可用性很大程度上取决于工具：

- schema diff；
- 本地 mock；
- 可视化预览；
- 多端截图测试；
- 线上响应回放；
- 兼容性检查；
- section 发现和复用搜索；
- 运行时日志和错误定位。

没有工具链，SDUI 就会从“后端灵活编排 UI”变成“所有人一起调一个巨大 JSON”。

## 如果自己要做 SDUI，应该怎么更稳

如果一个团队真的想做 SDUI，我会建议从更小的路径开始。

第一，不要一开始就追求整屏接管。先从低风险、低交互、强配置的模块开始，比如 banner、营销卡片、表单片段、设置页、引导页、空状态、活动规则等。

第二，schema 要表达业务语义，不要重建 HTML/CSS。一个常见陷阱是把 SDUI 做成一套跨端 HTML。这样短期灵活，长期会把平台拖进样式兼容地狱。

第三，客户端组件必须有版本和降级策略。后端不能假设所有用户都安装了最新组件。每个 section/action 都要知道最低客户端版本、fallback、灰度和停用方式。

第四，把预览、mock、截图测试和响应回放放在第一期，而不是最后补。SDUI 的调试成本如果不被工具吸收，就会转移给每个业务开发。

第五，允许混合态长期存在。不要假设世界会从 client-driven 一夜切换到 server-driven。更现实的形态是：

```text
老页面 client-driven
  + 局部模块 SDUI
  + 新页面部分整屏 SDUI
  + 少量强运营页面完全 server-driven
```

这种不完美的混合态，反而可能是最能活下来的形态。

## 最后：把技术博客当地图，不要当行车记录仪

大公司技术博客像地图：它告诉你某个系统大概长什么样，主路在哪里，作者认为哪些地方值得看。

但它不是行车记录仪。它不会完整记录每一次绕路、堵车、事故、争吵、返工和废弃方案。

Airbnb 的 SDUI 文章依然值得读。它展示了跨端 UI 平台、GraphQL schema、动作系统和数据网格如何组合在一起。Cat Chen 的提醒也值得听。它告诉我们，真实工程史不是架构图画出来的，而是被产品诉求、组织边界、迁移成本和人的选择一点点塑形的。

对工程师来说，最有价值的读法不是“信”或“不信”，而是把每篇技术博客拆成三件事：

```text
它公开证明了什么？
它没有证明什么？
如果我要在自己的组织里复用，需要补哪些条件？
```

能回答这三个问题，技术博客才真的变成了知识，而不是故事。

## 参考资料

- [Cat Chen 关于 Airbnb SDUI 和技术博客可信度的 X 帖](https://x.com/CatChen/status/2067452823025975398)
- [A Deep Dive into Airbnb's Server-Driven UI System](https://medium.com/airbnb-engineering/a-deep-dive-into-airbnbs-server-driven-ui-system-842244c5f5)
- [Taming Service-Oriented Architecture Using A Data-Oriented Service Mesh](https://medium.com/airbnb-engineering/taming-service-oriented-architecture-using-a-data-oriented-service-mesh-da771a841344)
- [Viaduct 官方文档](https://viaduct.airbnb.tech/)
- [Mobile Native Foundation: Server-driven UI strategies discussion](https://github.com/MobileNativeFoundation/discussions/discussions/47)
- [Sapling: Source control that's user-friendly and scalable](https://engineering.fb.com/2022/11/15/open-source/sapling-source-control-scalable/)
- [Sapling 官方站点](https://sapling-scm.com/)
