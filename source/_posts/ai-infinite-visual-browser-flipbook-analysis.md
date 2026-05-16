---
title: "AI 无限视觉浏览器：从 Flipbook 到博客新板块的实现拆解"
date: 2026-05-16 17:20:00
tags: [AI, 前端, 图像生成, 产品分析]
categories: [技术笔记]
---

最近看到一个很有意思的网站：[Flipbook](https://flipbook.run/)。

它的主张不是“再做一个网页生成器”，而是把浏览器本身改造成一个视觉探索界面：你输入一个主题，它生成一张完整的视觉页面；你不需要点传统按钮或链接，而是直接点击图片里的某个区域，系统继续围绕那个区域生成下一张视觉页面。这样一来，探索路径不再是 HTML 页面之间的跳转，而是一棵由“图片”和“点击坐标”组成的视觉分支树。

我给自己的博客加了一个实验板块：[AI视觉](/flipbook/)。这篇文章记录两个问题：

1. 这个功能在我的博客里是怎么做出来的。
2. Flipbook 这类平台背后大概率是怎么设计的。

## 先说结论：它不是普通网页，而是“图像即界面”

传统网站的基本单位是 HTML 节点：标题、段落、按钮、链接、卡片、表单。用户点击的是被开发者预先定义好的交互元素。

Flipbook 的关键变化是：生成结果本身是一整张图片。页面上的文字、图形、布局、说明都被图像模型画进了像素里。用户点击任意位置时，系统记录的是：

- 当前视觉页的主题；
- 当前视觉页的图片；
- 点击坐标，比如 `x=0.42, y=0.55`；
- 当前分支路径；
- 质量、比例、语言等生成参数。

然后系统把这些信息组合成下一次生成请求，得到下一张图片。

所以它的核心不是“做一个漂亮页面”，而是一个循环：

```text
输入主题
  -> 生成视觉页
  -> 用户点击图片坐标
  -> 解释点击意图
  -> 生成下一张视觉页
  -> 写入分支图
  -> 继续点击
```

这就是“无限视觉浏览”的最小闭环。

## 我在博客里做了什么

博客本身是 Hexo + Fluid 主题。因为这个功能需要一个全屏互动界面，如果直接写成普通 Markdown 文章，会被主题布局、文章容器、导航样式包住，体验会很碎。

所以我把它做成了一个独立静态应用，挂在博客路径：

```text
/flipbook/
```

并在 Fluid 导航栏里新增了一个入口：

```yaml
- { key: "visual_browser", name: "AI视觉", link: "/flipbook/", icon: "iconfont icon-image" }
```

同时在 Hexo 配置里把这个目录加入 `skip_render`：

```yaml
skip_render:
  - stats/token-usage.json
  - flipbook/**
```

这样 `/source/flipbook/index.html`、`styles.css`、`app.js` 会原样复制到 `public/flipbook/`，不会被 Hexo 当成普通页面套主题。

## 前端结构

前端主要分成四层。

第一层是浏览器外壳：

- 顶部输入框；
- 上传图片按钮；
- 生成按钮；
- 语言、质量、比例选项；
- 费用提示。

第二层是视觉画布：

- 使用 `<canvas>` 绘制视觉页；
- 没有真实 AI 后端时，使用本地生成的占位视觉；
- 有 AI 后端时，把模型返回的图片画进 canvas；
- canvas 点击后记录相对坐标。

第三层是历史路径：

- 当前路径会显示在输入框左侧；
- 每个历史节点都可以点回去；
- 它不是浏览器 history，而是应用内部的视觉探索 path。

第四层是 Branch Map：

- 每个生成结果是一个 node；
- 点击生成的下一张图是当前 node 的 child；
- 右侧分支图展示整棵探索树。

前端节点数据大致是这样的：

```js
{
  id: "node-3",
  parentId: "node-1",
  prompt: "AI generated museum / archive",
  focus: { x: 0.42, y: 0.55 },
  ratio: "16:9",
  quality: "low",
  language: "English",
  generatedImage: imageElement,
  provider: "ai"
}
```

这里最重要的是 `parentId` 和 `focus`。前者让探索变成树，后者让“点哪里”成为下一次生成的一部分。

## 为什么需要服务端

静态博客可以放前端页面，但不能直接在浏览器里放 AI API key。

所以我加了一个最小 Node 服务：

```text
POST /api/visual-branch
```

前端只请求自己的后端：

```js
fetch("/api/visual-branch", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    prompt,
    focus,
    ratio,
    quality,
    language,
    parentId
  })
})
```

服务端再去调用图片生成接口。

当前实现里，服务端会读取环境变量：

```bash
OPENAI_API_KEY=你的key npm run visual-server
```

如果没有 `OPENAI_API_KEY`，接口返回 `provider: "local"`，前端就退回本地 canvas fallback。这样即使只部署静态博客，新板块也能玩起来；如果云服务器配置好代理和 key，就能切换到真实 AI 生成。

完整的云服务器部署、pm2/systemd 常驻、Nginx/Caddy 反向代理配置，单独整理在项目文档：[AI 视觉服务端部署说明](/docs/ai-visual-server-deploy.md)。

## 图片生成接口怎么接

OpenAI 的图片生成可以通过 Image API 走：

```text
POST https://api.openai.com/v1/images/generations
```

我的服务端会把前端比例映射成模型支持的尺寸：

```js
function toOpenAiSize(ratio) {
  if (ratio === "1:1") return "1024x1024";
  if (ratio === "3:4" || ratio === "9:16") return "1024x1536";
  return "1536x1024";
}
```

质量参数也直接映射：

```js
function toOpenAiQuality(quality) {
  if (quality === "high") return "high";
  if (quality === "medium") return "medium";
  return "low";
}
```

请求体大致是：

```js
{
  model: "gpt-image-1-mini",
  prompt,
  size,
  quality,
  n: 1,
  output_format: "png"
}
```

GPT Image 系列返回的是 base64 图像数据，服务端再把 `b64_json` 回传给前端，前端转成 `data:image/png;base64,...` 加载到 canvas。

## Prompt 不是用户原话，而是“视觉页面生成指令”

用户输入可能只有一句：

```text
ancient underwater city
```

但传给图片模型的 prompt 不能这么短。因为我们要的不是“一张插画”，而是“一张可以继续点击探索的视觉页面”。

所以前端会组装一个更完整的视觉 prompt：

```text
Create one cohesive visual browser page as a single image.
The page should communicate the topic visually, including any useful labels as pixels inside the image.
Do not draw browser chrome, buttons, address bars, or UI controls.
Use a rich editorial composition with clear hierarchy, real-world detail, and inspectable visual regions.
Topic: ancient underwater city / archive.
Parent page topic: ancient underwater city.
Exploration path: ancient underwater city -> ancient underwater city / archive.
Focus the new page around the clicked point at x=0.42, y=0.55.
Language for any rendered labels: English.
```

这里有几个关键点：

- 明确要求“单张图片”；
- 明确不要模型画浏览器外壳；
- 告诉模型这是一个可以被继续探索的视觉页面；
- 带上父节点和路径；
- 带上点击坐标。

点击坐标本身不是语义。真正产品里还需要一个解释步骤：用户点在图中的哪里？点到的是建筑、人物、文字、地图、商品、材料还是某个局部？这个解释可以来自视觉模型，也可以通过前一次生成时记录的区域语义来完成。

我现在的版本是最小闭环：坐标进入 prompt，并生成下一张分支页。生产版应该再加一层“点击区域理解”。

## Flipbook.run 大概率是怎么做的

下面这部分是基于公开页面、前端结构和产品行为的分析，不代表我看到了它的私有后端源码。

从公开页面能看到几个事实：

- 它是一个 Next.js 应用；
- 首屏有 prompt 输入、图片上传、语言、质量、比例选择；
- 有 credits 和登录入口；
- 有 Branch Map；
- 文案明确强调“每一页都是生成图像，点击图像继续深入”；
- FAQ 里说明信息来源结合了 agentic web search 和图像模型自身知识；
- Pricing 按 credits 售卖。

这说明它不是单纯的图片生成器，而更像一个“视觉浏览会话系统”。

我推测它的核心架构可能是这样：

```text
Next.js 前端
  -> 会话 API
  -> 搜索/理解 Agent
  -> Prompt Planner
  -> 图像生成服务
  -> 图片存储/CDN
  -> Branch Graph 数据库
  -> Credits/登录/支付系统
```

### 1. 前端：图片是主界面，HTML 是控制壳

它的 HTML 控制部分很少：输入框、设置条、登录、credits、分支地图。

真正的内容不在 DOM 里，而在生成图里。这和普通网页完全反过来：

普通网页：

```text
HTML 是内容，图片是装饰
```

视觉浏览器：

```text
图片是内容，HTML 是控制器
```

这也是它看起来新鲜的原因。

### 2. 后端：每次点击都是一次“带上下文的生成任务”

点击图片后，后端不能只知道一个坐标。它至少需要：

- 当前图片 ID；
- 当前图片的 prompt；
- 当前探索路径；
- 用户点击坐标；
- 可能的点击区域语义；
- 语言、比例、质量；
- 用户账户和 credit 余额。

后端会把这些信息变成下一次生成任务。

更成熟的实现可能会把一次点击拆成三步：

```text
点击坐标
  -> 视觉理解：这个点附近是什么？
  -> 规划：下一页应该解释/放大/延展什么？
  -> 生成：创建下一张视觉页
```

如果要让结果更可靠，还可以加入 web search。比如用户探索“2026 年 AI 设备趋势”，系统先搜索资料，再把关键事实压缩成视觉生成 prompt。

### 3. Branch Map：不是装饰，而是产品骨架

无限探索如果没有地图，很快会迷路。

Branch Map 的意义是：

- 保存每次生成的节点；
- 展示从根主题到当前页面的路径；
- 允许回到任意历史节点继续分叉；
- 让“浏览”从线性变成树状。

这个结构非常像一个轻量知识图谱：

```js
{
  id,
  parent_id,
  image_url,
  prompt,
  focus_x,
  focus_y,
  generated_at,
  children: []
}
```

### 4. Credits：控制成本和滥用

图片生成成本比普通文本请求高很多，而且延迟更长。Flipbook 用 credits 计费，是非常自然的设计。

Credits 不只用于商业化，也用于系统稳定性：

- 限制无限生成；
- 防止滥用；
- 给不同质量等级定价；
- 给队列调度提供优先级。

### 5. 延迟体验：需要“视觉等待状态”

图片生成不是毫秒级交互。OpenAI 文档也提醒，复杂图片 prompt 可能需要更长时间处理；图像模型还有文字渲染、构图控制、连续一致性等限制。

所以这类产品要处理：

- loading；
- 取消生成；
- 失败重试；
- 低质量快速生成 vs 高质量慢生成；
- 生成完成前的占位预览；
- 图片缓存。

我现在的博客版本只做了最小 loading 和 fallback，生产版应该做队列和状态轮询。

## 生产化还缺什么

当前博客版本是一个能跑通概念的最小实现。要变成真正可用的产品，还需要补这些：

### 1. API 鉴权和限流

不能让任何人无限调用 `/api/visual-branch`。至少要加：

- 登录；
- IP 限流；
- 用户级限流；
- 单次 prompt 长度限制；
- 生成频率限制；
- 成本统计。

### 2. 图片持久化

现在前端拿到图片后只存在浏览器内存里。生产版应该上传到对象存储：

- S3；
- R2；
- TOS；
- 或服务器本地存储 + CDN。

数据库只保存图片 URL 和元数据。

### 3. 分支图持久化

用户刷新页面后，探索树应该还能恢复。需要一张表存节点：

```text
visual_sessions
visual_nodes
```

节点至少保存：

- session_id；
- parent_node_id；
- prompt；
- image_url；
- focus_x；
- focus_y；
- model；
- ratio；
- quality；
- created_at。

### 4. 点击区域理解

坐标只是几何信息，不是语义信息。

更强的版本应该在每次点击后调用视觉理解模型：

```text
用户点击了当前图像的 x=0.42, y=0.55。
请判断这个点附近最可能是什么对象或概念，并给出下一页生成方向。
```

这样下一张图不会只是随机延展，而是围绕用户真正点到的东西深入。

### 5. 搜索增强

如果主题涉及现实世界，比如新闻、产品、人物、城市、论文，图像模型自己的知识可能不够新。Flipbook FAQ 提到信息来自 agentic web search 和图像模型知识的组合，这个方向是合理的。

生产链路可以是：

```text
用户主题
  -> 搜索
  -> 摘要事实
  -> 视觉规划
  -> 图片生成
```

## 这个方向为什么有意思

我觉得它有价值，不只是因为“AI 图片好看”，而是因为它挑战了我们对网页的默认理解。

过去几十年，浏览器里的主要信息形态是：

- 文本；
- 链接；
- 卡片；
- 表格；
- 表单；
- 图片作为辅助。

而 AI 视觉浏览器把顺序倒过来：

- 图片成为可探索的信息载体；
- 文字只是图片里的一个元素；
- 链接不再预先存在，而是在点击后临时生成；
- 页面不是设计师提前画完，而是模型按需生成。

它当然还不成熟。生成图片慢，文字可能错，事实可能不稳，连续性也难。但作为一种交互范式，它非常值得试。

## 小结

这次博客新板块做的是一个最小可运行版本：

- `/flipbook/` 是独立互动页面；
- canvas 承载视觉页；
- 点击坐标会生成子节点；
- Branch Map 保存探索树；
- `/api/visual-branch` 作为服务端代理；
- 没有 API key 时自动 fallback；
- 有 API key 时可以接真实图片生成。

Flipbook 这类平台的本质，大概率不是“图片生成器”，而是：

```text
视觉页面生成 + 点击区域理解 + 搜索增强 + 分支图状态管理 + 成本控制
```

这也是我想在博客里继续实验的方向：不是把 AI 放进一个聊天框，而是把 AI 变成一种新的浏览方式。

## 参考

- [Flipbook](https://flipbook.run/)
- [OpenAI Image generation guide](https://platform.openai.com/docs/guides/images/image-generation)
- [OpenAI Images API reference](https://platform.openai.com/docs/api-reference/images/generate)
