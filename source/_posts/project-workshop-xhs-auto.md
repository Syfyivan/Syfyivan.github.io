---
title: "把 Markdown 一键变成小红书长图：拆解我手边的 xhs-auto 自动化管线"
date: 2026-06-12 15:00:00
tags: [自动化, 浏览器自动化, Playwright, Node.js, 工具开发]
categories: [技术笔记, 项目工坊]
---

我平时写东西基本都在 Markdown 或飞书里。但要把一篇笔记发到小红书，麻烦就来了：小红书是图文平台，正文不适合贴长文，主流做法是把内容做成一组竖版长图卡片。手动流程大概是——打开设计工具、复制粘贴、调字号、对齐、导出、再核对页码。一篇千字笔记折腾下来半小时起步，而且每次排版都不一致。

xhs-auto 这个小项目就是为了消灭这半小时：本地 Markdown（或飞书导出的 docx/pdf）进去，一组排好版、带页码的 PNG 卡片出来，最后还可以用浏览器自动化把图片预填到创作后台，人工检查后再点发布。

这篇文章把它的工程实现拆开讲一遍。它体量不大（核心就五个 JS 文件），但「文档处理 + 排版渲染 + 浏览器自动化」这条链路上的取舍，对做同类内容自动化工具的人挺有参考价值。

## 方案选型：为什么用浏览器截图来「画图」

把文字渲染成图片，常见路线有三条：

- 用 canvas / 图像库（如 node-canvas、Pillow）逐行画字
- 用 LaTeX / 专门排版引擎生成 PDF 再转图
- 写 HTML + CSS，丢给浏览器渲染，然后截图

xhs-auto 选了第三条。原因很直接：排版这件事，浏览器引擎已经做到极致了。中文换行、字重、行高、flex 布局、渐变背景，全是 CSS 一行的事；换成 canvas 手画，光是中英文混排的折行就够写几百行。而 Playwright 提供的无头 Chromium 让「打开浏览器截图」可以完全脚本化。

代价是依赖重（要装一个 Chromium 内核），但对本地 CLI 工具来说完全可接受。

文档输入侧的选型同样务实：.doc/.docx/.pdf 不自己解析，直接调用系统里的 pandoc 转成 Markdown，复用同一条渲染管线。自己解析 docx 是个深坑，pandoc 已经替你踩完了。

## 架构与数据流

整条管线是单向的，每一步的输入输出都很清晰：

```text
docx/pdf ──pandoc──> Markdown
                        │
                        ▼
              解析为 Block 列表（标题/段落/列表/代码块/图片）
                        │
                        ▼
              按估算高度分页 → 每页一组 Block
                        │
                        ▼
              套 HTML 模板 + 主题 CSS → 每页一份完整 HTML
                        │
                        ▼
              Playwright 无头 Chromium 截图 → PNG × N
                        │
                        ▼（可选）
              注入 cookie 打开创作后台 → 预填图片和标题 → 人工确认发布
```

对应到代码结构：

```text
src/
  cli.js                 命令行入口，三个子命令
  markdown-converter.js  Markdown 解析 + 分页算法
  renderer.js            HTML 拼装 + Playwright 截图
  doc-converter.js       pandoc 转换管线
  publisher.js           创作后台半自动发布
xhs_auto/
  templates/card_base.html  卡片 HTML 模板
  styles/*.css              三套主题
```

值得一提的是项目里还有一份 Python 平行实现（`xhs_auto/` 下的 .py 文件，用 typer 做 CLI），模板和 CSS 两套实现共用。这种「模板与逻辑分离」让换语言重写时排版资产一行都不用动。

## 核心代码拆解

### 一、分页：截图之前就要知道「一页装多少」

这是整个工具最有意思的部分。卡片是固定尺寸的（比如 medium 是 1080×1440），但内容长度不定，所以必须分页。难点在于：分页发生在渲染之前，此时根本没有真实的像素高度，只能估算。

`src/markdown-converter.js` 里先定义了每种尺寸的排版参数：

```js
const SIZE_CONFIGS = {
  small:  { width: 720,  height: 960,  charsPerLine: 26, lineHeight: 26, basePadding: 160 },
  medium: { width: 1080, height: 1440, charsPerLine: 32, lineHeight: 28, basePadding: 200 },
  large:  { width: 1440, height: 1920, charsPerLine: 40, lineHeight: 30, basePadding: 240 }
};
```

然后对每个 Block 估高——本质是「字符数 ÷ 每行字数 = 行数，行数 × 行高 = 高度」：

```js
if (["paragraph", "code", "list"].includes(block.kind)) {
  const lines = Math.max(1, Math.floor(block.text.length / config.charsPerLine)
    + block.text.split("\n").length);
  let base = config.lineHeight * lines;
  if (block.kind === "code") base += 32;
  return base + 24;
}
```

分页算法则是经典的「装箱」：顺序往当前页塞 Block，塞不下就开新页，**绝不把一个 Block 从中间切断**——段落、列表、代码块要么整体在这页，要么整体去下页。这是阅读体验的底线：

```js
if (currentPage.length > 0 && currentHeight + height > capacity) {
  flushPage();
}
currentPage.push(block);
currentHeight += height;
```

估算当然不精确。项目的解法不是把估算做到 100% 准（不可能，也不值得），而是给出两个兜底：

1. 某个 Block 估算高度超过整页容量时，打印警告并让它独占一页；
2. 支持在 Markdown 里手写 `<!-- pagebreak -->` 强制分页，把最终裁量权交给作者。

「算法给一个 80 分的默认结果 + 人工标记修正」，比追求全自动的完美排版务实得多。

### 二、渲染：HTML 模板 + setContent + 截图

`src/renderer.js` 把每页的 Block 渲染成 HTML 片段，塞进 `card_base.html` 模板（带标题栏和「2/5」式页码），CSS 直接内联进 `<style>` 标签——这样每页 HTML 是完全自包含的，不依赖任何外部资源。

截图部分是 Playwright 的标准用法，有两个细节值得注意：

```js
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: config.width, height: config.height },
  deviceScaleFactor: 1
});
const page = await context.newPage();

for (let index = 0; index < htmlPages.length; index += 1) {
  await page.setContent(htmlPages[index], { waitUntil: "networkidle" });
  await page.screenshot({ path: pngPath, fullPage: true });
}
```

细节一：viewport 直接设成卡片目标尺寸，CSS 里 `.xhsa-card` 占满 100%，所以「浏览器窗口即画布」，不需要任何裁剪计算。

细节二：N 页只启动一次浏览器，循环里反复 `setContent`。浏览器冷启动要一两秒，复用 page 实例能把多页转换的耗时压到接近线性。`waitUntil: "networkidle"` 则保证本地图片（`file://` 协议引用）加载完才按快门。

### 三、发布：防御式的浏览器自动化

`src/publisher.js` 是和「不受自己控制的第三方页面」打交道的部分，写法和前面截图模块完全是两种风格——处处假设会失败。

登录态用的是 cookie 注入，不碰任何账号密码逻辑：用户自己在浏览器登录创作后台后导出 cookies.json（仅本地存放、git 已忽略），脚本读进来挂到浏览器上下文：

```js
const browser = await chromium.launch({ headless });
const context = await browser.newContext();
await context.addCookies(cookies);
const page = await context.newPage();
await page.goto("https://creator.xiaohongshu.com/creation/article",
  { waitUntil: "networkidle" });
```

往后的每一步操作都是「试探 + 降级」。比如找上传控件，不依赖具体 class 名（那是前端随时会改的东西），只找语义化的 `input[type='file']`；标题输入框则按 placeholder 模糊匹配，给了一组候选选择器挨个试：

```js
const titleSelectors = ["textarea[placeholder*='标题']", "input[placeholder*='标题']"];
for (const selector of titleSelectors) {
  const element = await page.$(selector);
  if (element) { await element.fill(title); filledTitle = true; break; }
}
if (!filledTitle) {
  console.log("[xhs-auto][publish] 未能自动定位标题输入框，请在浏览器中手动补充标题。");
}
```

任何一步找不到元素，都不抛异常中断，而是打一行提示让人接手。最关键的设计是：**脚本永远不点「发布」按钮**。它只负责把图片传上去、标题填好，然后在 `--headful` 模式下把浏览器窗口留给你五分钟，内容、敏感词、排版都由人工确认后手动发布。

这个边界划得很清楚：机器做搬运，人做决策。对自己账号的内容管理自动化来说，这是合规和稳定性上都最稳的姿势。

### 四、文档管线：站在 pandoc 肩膀上

`src/doc-converter.js` 只有 60 行，核心就是一次子进程调用：

```js
const result = spawnSync(
  "pandoc",
  [srcPath, "-o", outputMd, "--extract-media", path.basename(mediaDir), "--wrap", "none"],
  { cwd: workDir, encoding: "utf8" }
);
```

两个参数有讲究：`--extract-media` 把 docx 内嵌的图片抽到本地目录，后续渲染时通过 `baseDir` 解析成 `file://` URL，图片就能进卡片；`--wrap none` 禁止 pandoc 给输出 Markdown 强制折行，否则会干扰前面按字符数估行高的分页算法。

入口处还有一个 `ensurePandocAvailable()` 先跑 `pandoc --version` 探测环境，没装就给出明确的安装指引而不是一个莫名其妙的 ENOENT。CLI 工具对外部依赖做显式探测，这个习惯值得抄。

## 踩坑与稳定性

**选择器必然会失效。** 第三方页面的 DOM 不是 API，没有任何兼容性承诺。这个项目的应对是三层：用语义化选择器（`input[type=file]`、placeholder 匹配）降低失效概率；失效时降级为人工提示而不是崩溃；README 里直接写明「页面结构变了就去改 publisher.js 的选择器」。把「会坏」当作设计前提，而不是意外。

**高度估算 vs 真实渲染。** 按字符数估行数对纯中文很准，但遇到长英文单词、宽字符 emoji 就会偏。项目没有去做「渲染一次量高度再分页」的二次渲染方案（那会让速度翻倍、复杂度飙升），而是接受误差、放大 padding 余量、提供 pagebreak 手动修正。工程上叫「用 20% 的代价吃下 80% 的场景」。

**PDF 是有损输入。** pandoc 从 PDF 提取文本，复杂版式和图片大概率丢失。代码里专门对 `.pdf` 后缀追加了一条警告，提醒人工核对卡片内容。能力边界主动说出来，比让用户自己发现强。

**风控与频率。** 工具定位是单篇、人工在场的发布辅助，无头模式默认只做上传和填充，不做任何批量循环。cookie 文件不入库、不打印、不上传，README 里反复强调仅限个人自用。

## 可复用的经验

最后提炼几条，做同类「内容 → 多平台分发」工具时可以直接套用：

1. **排版交给浏览器。** HTML + CSS + 无头浏览器截图，是把文字变成精排图片的最短路径，主题切换就是换个 CSS 文件。
2. **中间格式统一成 Markdown。** 所有输入（docx、pdf、未来可能的 HTML）都先归一到 Markdown，渲染管线只写一次。
3. **分页要在 Block 粒度上做装箱**，宁可留白也不截断内容；估算不准的部分留人工逃生口（pagebreak 标记）。
4. **对第三方页面的自动化要写成防御式**：语义化选择器、逐步降级、失败即提示人工接管。
5. **把「点发布」留给人。** 自动化的终点设在「万事俱备」，最后一击由人完成——既是合规底线，也避免了一整类「发错了怎么撤」的工程难题。

这个项目从头到尾没有一行「聪明」的代码，但每一处取舍都在回答同一个问题：哪些环节机器做得比人好，哪些环节必须人来兜底。想清楚这个，工具自然就好用了。
