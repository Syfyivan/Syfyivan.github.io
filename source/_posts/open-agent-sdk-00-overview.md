---
title: "《Open Agent SDK 源码逐行精讲》第00讲 · 导论：项目全景与构建运行链路"
date: 2026-06-21 10:00:00
tags: [AI, Agent, Open Agent SDK, 源码解析, Claude Code, 课程]
categories: [技术笔记]
toc: true
---

<style>
.oas-b{display:inline-block;font-size:12px;font-weight:700;padding:1px 8px;border-radius:999px;vertical-align:middle;margin-left:6px;line-height:1.7;white-space:nowrap}
.oas-core{color:#fff;background:#b73a2c}
.oas-key{color:#b73a2c;background:rgba(183,58,44,.1);border:1px solid rgba(183,58,44,.3)}
.oas-skim{color:#3f5d7e;background:rgba(63,93,126,.1);border:1px solid rgba(63,93,126,.25)}
.oas-skip{color:#69727d;background:rgba(105,114,125,.12);border:1px solid rgba(105,114,125,.25)}
.oas-note{margin:14px 0;padding:12px 16px;border-left:3px solid #3f5d7e;background:rgba(63,93,126,.06);border-radius:0 4px 4px 0}
.oas-why{margin:14px 0;padding:12px 16px;border-left:3px solid #69727d;background:rgba(105,114,125,.07);border-radius:0 4px 4px 0;color:#3a4049}
.oas-key-note{margin:14px 0;padding:12px 16px;border-left:3px solid #b73a2c;background:rgba(183,58,44,.06);border-radius:0 4px 4px 0}
.oas-toc{margin:18px 0 26px;padding:16px 20px;border:1px solid rgba(29,33,39,.12);border-radius:8px;background:linear-gradient(135deg,rgba(183,58,44,.04),rgba(63,93,126,.05))}
.oas-toc>strong{display:block;margin-bottom:8px;color:#1d2127;font-size:15px}
.oas-fold{margin:14px 0;border:1px solid rgba(29,33,39,.14);border-radius:6px;background:#fafafa;padding:0 16px}
.oas-fold>summary{cursor:pointer;padding:12px 0;font-weight:700;color:#1d2127}
.oas-fold[open]{padding-bottom:8px}
.oas-legend{display:flex;flex-wrap:wrap;gap:10px;margin:12px 0}
.oas-legend>span{font-size:13px;color:#3a4049}
</style>

> 这是《Open Agent SDK 源码逐行精讲》系列的第 00 讲。整门课会把 [shipany-ai/open-agent-sdk](https://github.com/Syfyivan/open-agent-sdk) 这个 **38 万行、2115 个文件** 的代码库，按"能学进去的依赖顺序"逐文件、逐行拆开。本讲是地基：先讲清楚它是什么、目录怎么映射到子系统、怎么构建怎么跑，最后跑通第一个 demo。

<div class="oas-toc"><strong>本讲导航</strong>
<a id="ch0"></a>

- 第 0 章 · 这门课怎么读（两条路线 + 重要性标记）
- 第 1 章 · 这个项目到底是什么
- 第 2 章 · 仓库全景地图：目录 → 子系统
- 第 3 章 · 构建与运行链路逐行（package.json / tsconfig.json / build.mjs）
- 第 4 章 · 把它跑起来：第一个 demo（examples/01）
- 第 5 章 · 本讲小结与下一讲预告

</div>

<div class="oas-note">页面左侧（宽屏）或顶部的悬浮目录是本讲的<strong>实时多级目录</strong>，会随你滚动高亮，章 / 节 / 小节 / 小点都在里面，可点击跳转。下面正文里的标题就是各级目录节点。</div>

## 第 0 章 · 这门课怎么读 <span class="oas-b oas-core">必读</span>

在啃源码之前，先花两分钟把"读法"约定好，后面每一讲都按这套规则走。

### 0.1 两条学习路线

这门课同一套内容提供两种读法，你可以在[课程总目录页](/courses/open-agent-sdk/)顶部用 Tab 切换：

- **核心路线**：只走主干。入口 API → 主循环 → 工具协议 → 文件 / Bash 工具 → 权限 → 系统提示 → 上下文压缩 → 记忆 → MCP → 多 Agent → API 客户端。把"一个 Agent 是怎么转起来的"这条线打通，大约十几讲。
- **全量逐行路线**：一个文件都不落。在核心主干之外，把 381 个 `commands/`、上百个 UI 组件、生成代码、平台适配等"边角"也逐一过一遍。

两条路线**共用同一批文章**，只是核心路线把"非核心讲"折叠了起来。所以你不会看到两份重复内容。

### 0.2 重要性标记约定

为了让你一眼知道"这段该精读还是该跳读"，正文里的标题会带一个小徽章：

<div class="oas-legend"><span><span class="oas-b oas-core">核心</span> 必须吃透，是 Agent 运转的主干</span><span><span class="oas-b oas-key">重点</span> 关键细节，值得细看</span><span><span class="oas-b oas-skim">可跳读</span> 知道有这回事即可</span><span><span class="oas-b oas-skip">非核心</span> 边角 / 样板，会折叠，但想看能展开</span></div>

非核心内容统一放进可折叠块里，长这样——默认收起，点一下展开：

<details class="oas-fold">
<summary>示例：一个可折叠的「非核心」讲解块（点我展开）</summary>

这里会放那些"为了完整性必须讲、但第一次学可以跳过"的内容。比如某个只在 Windows 上才走到的兼容分支、某段自动生成的类型代码。**为什么把它折叠**：它不影响你理解主干，展开看是为了"全都讲过、一个不落"。

</details>

<div class="oas-key-note"><strong>本讲定位</strong>：第 00 讲不碰具体业务逻辑代码，只解决"环境跑通 + 心里有张地图"。真正的逐行从第 01 讲（公共入口 <code>src/sdk.ts</code>）开始。</div>

## 第 1 章 · 这个项目到底是什么 <span class="oas-b oas-core">核心</span>
<a id="ch1"></a>

### 1.1 一句话定位

Open Agent SDK 是一个**开源的 AI Agent 开发框架**，灵感来自 Anthropic 官方的 `@anthropic-ai/claude-agent-sdk`。它能让你构建"能读代码库、改文件、跑命令、联网搜索、执行多步任务"的自主 Agent。

它和官方 SDK 最大的区别只有一句话，但极其关键：

> 官方 SDK 需要在本地起一个 Claude Code CLI 子进程；**Open Agent SDK 把完整的 Agent 循环跑在你自己的进程里（in-process）**。

### 1.2 为什么"进程内"是它的灵魂

把两种架构画出来对比：

```text
官方 @anthropic-ai/claude-agent-sdk：
  你的代码 → SDK → spawn 一个 cli.js 子进程 → 通过 stdin/stdout 传 JSON → Anthropic API

Open Agent SDK：
  你的代码 → SDK → QueryEngine（进程内）→ Anthropic API（直连）
```

差别带来的直接后果：

| 场景 | 官方 SDK | Open Agent SDK |
| --- | --- | --- |
| 云服务器 | 需要把 CLI 装进环境 | `npm install` 即可 |
| Serverless 函数 | 基本没法用（要拉起子进程） | 原生支持 |
| Docker 镜像 | 镜像里要塞 CLI | 只是一个 npm 依赖 |
| 流式输出 | 经子进程 stdio 转发 | 直接拿 API 的流 |

<div class="oas-note"><strong>关键认知</strong>：官方 SDK 的 <code>cli.js</code> 本身就是整个 Claude Code 引擎。Open Agent SDK 做的事情，本质是把那台引擎从"被子进程包着"改成"作为库被你直接 import"。所以它不是一个简化的重写——README 明确说它包含<strong>完整的 Claude Code 引擎（2000+ 文件）</strong>，系统提示、权限系统、记忆系统、上下文压缩、多 Agent、MCP 用的都是同一套代码。</div>

### 1.3 这对我们读源码意味着什么

意味着读这个仓库 ≈ 读 Claude Code 本体。你在终端里每天用的那个 Claude Code，它的 Agent 主循环、工具实现、权限判定逻辑，绝大部分都能在这个仓库里逐行读到。这正是这门课值得做的原因：**它是少有的、能完整阅读的工业级 Agent 引擎**。

## 第 2 章 · 仓库全景地图 <span class="oas-b oas-core">核心</span>
<a id="ch2"></a>

先建立空间感，后面每讲都会回到这张地图，告诉你"我们现在在哪"。

### 2.1 顶层结构

克隆下来，根目录长这样：

```text
open-agent-sdk/
├── src/            源码（含完整引擎，约 2000 个 .ts/.tsx 文件）
├── examples/       10 个从易到难的可运行示例
├── scripts/        构建辅助脚本（如 create-shims.mjs）
├── build.mjs       用 esbuild 把 CLI 打包成单文件 cli.mjs
├── package.json    依赖、导出入口、scripts
├── tsconfig.json   TypeScript 编译配置
├── package-lock.json / pnpm-lock.yaml   锁文件
└── README.md
```

### 2.2 src/ 下的子系统分区

`src/` 有 60+ 个子目录。别被吓到——它们能归成几类。下面这张表是整门课的"线路图"，重要性列就是核心路线会重点讲的部分：

| 目录 | 职责 | 重要性 |
| --- | --- | --- |
| `entrypoints/` | 对外入口：SDK 导出面、CLI 启动 | <span class="oas-b oas-core">核心</span> |
| `query.ts` / `QueryEngine` | Agent 主循环引擎 | <span class="oas-b oas-core">核心</span> |
| `tools/` | 全部内置工具（Read/Write/Bash/Grep/Agent…） | <span class="oas-b oas-core">核心</span> |
| `utils/permissions/` | 4 层权限管道 + AI 分类器 | <span class="oas-b oas-core">核心</span> |
| `services/api/` | Anthropic API 客户端（流式 / 重试 / 缓存） | <span class="oas-b oas-core">核心</span> |
| `services/compact/` | 上下文压缩（9 段式） | <span class="oas-b oas-key">重点</span> |
| `services/mcp/` `utils/mcp/` | MCP 客户端（stdio/SSE/HTTP） | <span class="oas-b oas-key">重点</span> |
| `memdir/` `services/SessionMemory/` `tasks/DreamTask` | 记忆系统 + autoDream | <span class="oas-b oas-key">重点</span> |
| `utils/swarm/` `tasks/` `coordinator/` | 多 Agent / 团队 / 任务 | <span class="oas-b oas-key">重点</span> |
| `context.ts` `utils/claudemd.ts` | 系统 / 用户上下文与提示构建 | <span class="oas-b oas-key">重点</span> |
| `commands/` | 381 个斜杠命令实现（CLI 用） | <span class="oas-b oas-skim">可跳读</span> |
| `components/` `ink/` `screens/` | 终端 UI（React + Ink 渲染） | <span class="oas-b oas-skim">可跳读</span> |
| `types/generated/` | 由 protobuf 等生成的类型 | <span class="oas-b oas-skip">非核心</span> |
| `native-ts/` `shims/` | 原生能力的 TS 实现 / 垫片 | <span class="oas-b oas-skip">非核心</span> |

<div class="oas-why"><strong>为什么 commands/ 和 components/ 标成"可跳读"而不是"核心"？</strong>它们数量巨大（仅 commands 就 381 个），但绝大多数是"把某个已有能力包装成一条斜杠命令 / 一个终端面板"。理解了主干（主循环 + 工具 + 权限），这些命令读起来都是同一个套路的复制粘贴。所以全量路线里我们仍会逐个过，但会成批地折叠讲解，把篇幅留给真正决定行为的核心模块。</div>

### 2.3 用体量印证重点

用一行命令看哪些文件最"重"（行数最多），结果和上面的分区高度吻合：

```sh
find src -name '*.ts' | xargs wc -l | sort -rn | head -12
```

输出（节选）：

```text
  5595 src/cli/print.ts
  5513 src/utils/messages.ts          # 消息规整：主循环要反复用
  5023 src/utils/sessionStorage.ts    # 会话持久化
  5023 src/utils/hooks.ts             # 生命周期钩子
  4436 src/utils/bash/bashParser.ts   # Bash 命令解析（权限/安全的基础）
  3420 src/services/api/claude.ts     # API 客户端核心
  3349 src/services/mcp/client.ts     # MCP 客户端
  2622 src/tools/BashTool/bashPermissions.ts
  2592 src/tools/BashTool/bashSecurity.ts
  1730 src/query.ts                   # 主循环
```

<div class="oas-note">注意 <code>utils/messages.ts</code>、<code>bash/bashParser.ts</code> 这种"基础设施型"大文件：它们本身不性感，但主循环、权限、工具全都依赖它们。这也是为什么这门课要按依赖顺序排——先讲被依赖的地基，后讲依赖它们的上层。</div>

## 第 3 章 · 构建与运行链路逐行 <span class="oas-b oas-core">核心</span>
<a id="ch3"></a>

要逐行读源码，第一件事不是打开 `src/`，而是搞懂"这堆 TS 是怎么变成能跑的东西的"。这一章逐行读三个文件：`package.json`、`tsconfig.json`、`build.mjs`。

### 3.1 package.json 逐行

先看最关键的字段（完整文件较长，这里按段拆）。

#### 3.1.1 包身份与模块类型 <span class="oas-b oas-key">重点</span>

```json
{
  "name": "@shipany/open-agent-sdk",
  "version": "0.1.7",
  "type": "module",
```

- `name`：发布到 npm 的包名，带 `@shipany` scope。你 `npm install @shipany/open-agent-sdk` 装的就是它。
- `type: "module"`：**整个包用 ESM**。这意味着源码里全是 `import/export`，且相对导入要带 `.js` 后缀（下面 sdk.ts 里会看到 `import './agent.js'` 这种写法，即使源文件是 `.ts`）。

<div class="oas-key-note"><strong>为什么 import 写 <code>.js</code> 但文件是 <code>.ts</code>？</strong>因为 <code>module: NodeNext</code> 下，TS 要求你写"编译后"的路径。编译后 <code>agent.ts</code> 变成 <code>agent.js</code>，所以源码里就得写 <code>.js</code>。第 01 讲读 sdk.ts 时你会看到一整屏这种后缀，现在先有个底。</div>

#### 3.1.2 导出入口 exports <span class="oas-b oas-core">核心</span>

```json
  "main": "./dist/sdk.js",
  "types": "./dist/sdk.d.ts",
  "exports": {
    ".": {
      "types": "./dist/sdk.d.ts",
      "import": "./dist/sdk.js"
    },
    "./types": {
      "types": "./dist/entrypoints/agentSdkTypes.d.ts",
      "import": "./dist/entrypoints/agentSdkTypes.js"
    },
    "./dist/*": "./dist/*"
  },
```

这几行决定了"别人 `import ... from '@shipany/open-agent-sdk'` 时，到底拿到哪个文件"：

- `main` / `exports["."]`：包的默认入口指向 `./dist/sdk.js`。它是 `src/sdk.ts` 编译后的产物。**所以第 01 讲就从 `src/sdk.ts` 开始读，它是整个 SDK 对外的总门面。**
- `exports["./types"]`：允许 `import type {...} from '@shipany/open-agent-sdk/types'` 单独拿类型。
- `exports["./dist/*"]`：把整个 `dist/` 透出，方便高级用户直接 import 内部模块。

<div class="oas-note">记住这条链路：<strong>用户 import → package.json 的 exports → dist/sdk.js → 源码 src/sdk.ts</strong>。这就是为什么我们的逐行起点是 sdk.ts。</div>

#### 3.1.3 命令行入口 bin

```json
  "bin": {
    "codeany": "./cli.mjs"
  },
```

装了这个包后会多一个命令 `codeany`，指向 `cli.mjs`。注意 `cli.mjs` 不是 tsc 编译出来的，而是 `build.mjs` 用 esbuild 单独打包的（见 3.3）。

#### 3.1.4 scripts 逐条 <span class="oas-b oas-key">重点</span>

```json
  "scripts": {
    "build": "tsc",
    "build:cli": "node build.mjs",
    "dev": "bun run src/entrypoints/cli.tsx",
    "dev:watch": "tsc --watch",
    "test": "node --experimental-vm-modules node_modules/.bin/vitest run",
    "lint": "tsc --noEmit",
    "postinstall": "node scripts/create-shims.mjs",
    "prepublishOnly": "npm run build"
  },
```

逐条看：

- `build: tsc`：用 TypeScript 编译器把 `src/**/*.ts` 编成 `dist/`。**这是 SDK（库）的构建方式**——库走 tsc，保留模块结构，方便树摇和按需 import。
- `build:cli: node build.mjs`：用 esbuild 把 CLI 打成单文件 `cli.mjs`。**CLI 走 esbuild bundling**，因为命令行要一个能直接跑的产物。
- `dev: bun run src/entrypoints/cli.tsx`：开发时用 Bun 直接跑 TSX 入口，免编译，热启动快。
- `lint: tsc --noEmit`：只做类型检查不产出文件——把 tsc 当 linter 用。
- `postinstall`：装包后自动跑 `create-shims.mjs` 生成垫片（处理可选 / 平台相关依赖）。
- `prepublishOnly`：发布前强制先 `build`，保证 npm 上的是编译产物。

<div class="oas-why"><strong>记一个反差</strong>：库（SDK）用 tsc 保留多文件结构；命令行（CLI）用 esbuild 打成单文件。同一个仓库两种构建目标，对应 package.json 里两条 build 脚本。这个区分会在 3.3 读 build.mjs 时变得很具体。</div>

### 3.2 tsconfig.json 逐行 <span class="oas-b oas-key">重点</span>

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2023", "DOM"],
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "strict": false,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noImplicitAny": false,
    "noImplicitReturns": false,
    "noFallthroughCasesInSwitch": false,
    "allowJs": true,
    "jsx": "react-jsx",
    "baseUrl": "."
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "vendor", "**/*.test.ts", "**/*.spec.ts"]
}
```

挑对读源码最有影响的几条：

- `target: ES2022` + `lib: ["ES2023","DOM"]`：编译目标语言版本，且允许用到 DOM 类型（因为有终端 / 浏览器相关代码）。
- `module / moduleResolution: NodeNext`：**这就是 3.1.1 里"import 要写 .js"的根因**。NodeNext 按 Node 的 ESM 规则解析模块。
- `outDir: ./dist` + `rootDir: ./src`：源码在 `src/`，产物落到 `dist/`，目录结构一一对应。
- `declaration` + `declarationMap` + `sourceMap`：同时产出 `.d.ts` 类型声明、声明的 sourcemap、JS 的 sourcemap——所以用户能跳转到类型，调试能映射回 TS。
- `strict: false` + 一连串 `noImplicitAny:false / noUnusedLocals:false …`：**类型检查整体放松**。

<div class="oas-key-note"><strong>读源码必须知道的一点</strong>：这个项目 <code>strict</code> 是关的，而且你在第 01 讲会看到 <code>src/sdk.ts</code> 顶部直接写了 <code>// @ts-nocheck</code>。原因很现实——它是从 Claude Code 本体"搬运"过来的工程，为了能在开源环境编过，刻意放宽了类型约束。<strong>所以读这份源码时，别把它当成类型严谨的范本，要把注意力放在运行时逻辑上。</strong></div>

- `isolatedModules: true`：要求每个文件能被单独转译（影响 `export type` 的写法）。
- `allowJs` + `jsx: react-jsx`：允许混入 JS，且支持 React JSX（终端 UI 用 Ink，本质是 React）。
- `include / exclude`：编译 `src/` 全部，但排除测试文件和 `vendor`。

### 3.3 build.mjs 逐行 <span class="oas-b oas-key">重点</span>

这个文件负责把 CLI 打成单文件。它最有教学价值的地方是那个 **stub 插件**——它演示了"如何把一个内部巨型项目，剥掉不可公开 / 平台相关的依赖后开源出来"。逐段读。

#### 3.3.1 入口与 esbuild

```js
#!/usr/bin/env node
import * as esbuild from 'esbuild'
```

普通的 Node 脚本，引入 esbuild。

#### 3.3.2 stub 插件：把"装不上的包"换成空模块 <span class="oas-b oas-core">核心</span>

```js
const stubPlugin = {
  name: 'stub-unavailable',
  setup(build) {
    const stubPatterns = [
      /^@ant\//,                              // Anthropic 内部包
      /^@anthropic-ai\/sandbox-runtime/,
      /^@anthropic-ai\/bedrock-sdk/,
      /^@anthropic-ai\/foundry-sdk/,
      /^@anthropic-ai\/vertex-sdk/,
      /^@anthropic-ai\/mcpb/,
      /^@aws-sdk\//, /^@azure\//, /^@smithy\//, // 云厂商 SDK
      /^@opentelemetry\/exporter-/,            // 可观测导出器
      /^color-diff-napi$/,                     // 原生插件
      /^audio-capture-napi$/,
      /^modifiers-napi$/,
      /^fflate$/, /^qrcode$/, /^turndown$/, /^yaml$/, // 可选包
    ]
```

`stubPatterns` 是一组正则，匹配那些**开源版本里拿不到、或平台相关、或纯可选**的包。包括：Anthropic 内部的 `@ant/*`、各家云 SDK（AWS/Azure）、OpenTelemetry 的导出器、几个原生 `.node` 插件、以及 `yaml/qrcode` 这类可选依赖。

```js
    build.onResolve({ filter: /.*/ }, (args) => {
      for (const pattern of stubPatterns) {
        if (pattern.test(args.path)) {
          return { path: args.path, namespace: 'stub' }
        }
      }
      return null
    })
```

`onResolve` 钩子拦截**每一个** import。只要 import 路径命中任意 stub 正则，就把它打上 `namespace: 'stub'` 的标记（相当于说"这个模块由我接管"）。否则返回 `null`，让 esbuild 走默认解析。

```js
    build.onLoad({ filter: /.*/, namespace: 'stub' }, (args) => {
      return {
        contents: `
          const noop = () => {};
          const noopClass = class {};
          export const buildComputerUseTools = noop;
          export const SandboxManager = class {
            static getSandboxUnavailableReason() { return undefined; }
            static isSandboxRequired() { return false; }
            static isSandboxingEnabled() { return false; }
            static async initialize() {}
          };
          export const BROWSER_TOOLS = [];
          export default {};
        `,
        loader: 'js',
      }
    })
  },
}
```

`onLoad` 钩子负责给所有被标记 `stub` 的模块**提供一份假的内容**：一堆 `noop`（空函数）、空类、空数组、空默认导出。还特意给 `SandboxManager` 写了几个"永远返回不可用 / false"的静态方法。

<div class="oas-key-note"><strong>这段是整个 build.mjs 的精髓</strong>：开源一个内部巨型项目最大的障碍，是它依赖了一堆外部拿不到的私有 / 平台包。直接删调用点要改成百上千处；这里用一个 esbuild 插件，<strong>把所有"够不着"的依赖统一替换成行为安全的空实现</strong>，于是引擎主干能编译、能跑，只是沙箱、云后端、语音等可选能力变成"优雅地什么都不做"。这是一种非常值得学的"剥离式开源"工程手法。</div>

#### 3.3.3 esbuild 主构建配置

```js
await esbuild.build({
  entryPoints: ['src/entrypoints/cli.tsx'],   // CLI 真正的入口
  bundle: true,                               // 全部打进一个文件
  platform: 'node',
  format: 'esm',
  outfile: 'cli.mjs',                         // 产物：根目录 cli.mjs（对应 package.json 的 bin）
  target: 'node18',
  banner: {
    js: [
      '#!/usr/bin/env node',
      'import { createRequire as __createRequire } from "module";',
      'const require = __createRequire(import.meta.url);',
    ].join('\n'),
  },
  loader: { '.md': 'text', '.txt': 'text' },  // md/txt 当字符串打进去
  mainFields: ['module', 'main'],
  inject: ['src/shims/globals.js'],           // 注入全局垫片
  plugins: [stubPlugin],                       // 挂上面的 stub 插件
  external: ['fsevents', 'cpu-features', 'ssh2', 'sharp'],  // 真·原生包不打包
})
console.log('✅ CLI bundled to cli.mjs')
```

逐项看几个关键：

- `entryPoints: src/entrypoints/cli.tsx`：CLI 的入口是 `cli.tsx`（注意是 TSX，因为终端 UI 用 React/Ink）。
- `banner`：在产物头部插入 shebang，并用 `createRequire` 兜底——ESM 里没有 `require`，但有些被打进来的 CJS 代码可能要用，于是手动造一个。
- `loader: {'.md':'text','.txt':'text'}`：把 Markdown / 文本文件当成字符串内联进 bundle。**这很重要**——很多内置 prompt、skill 说明是 `.md` 文件，打包时直接变成字符串嵌进去。
- `inject: src/shims/globals.js`：给每个模块自动注入全局垫片（对应 sdk.ts 第一行的 `import './setup-globals.js'`，第 01 讲会讲）。
- `external: [...]`：`fsevents/cpu-features/ssh2/sharp` 这几个是**真·原生 addon**，没法打进 JS bundle，所以标 external，运行时再从 node_modules 找。

<div class="oas-why"><strong>stub vs external 的区别（容易混）</strong>：<code>stub</code> 是"换成空实现，假装它存在"；<code>external</code> 是"不打包，运行时真的去 require 它"。前者用于"开源版根本没有的包"，后者用于"有，但无法被 bundle 的原生包"。</div>

## 第 4 章 · 把它跑起来：第一个 demo <span class="oas-b oas-core">核心</span>
<a id="ch4"></a>

地图和构建链路讲完，动手跑通一个最小 demo，建立"它真的能动"的体感。

### 4.1 准备环境

```sh
# 1. 克隆
git clone https://github.com/Syfyivan/open-agent-sdk.git
cd open-agent-sdk

# 2. 安装依赖（会触发 postinstall 的 create-shims.mjs）
npm install

# 3. 配置 API Key（二选一）
#    a) 官方 Anthropic
export ANTHROPIC_API_KEY=sk-ant-xxx
#    b) 第三方中转（如 OpenRouter）
export ANTHROPIC_BASE_URL=https://openrouter.ai/api
export ANTHROPIC_API_KEY=sk-or-xxx
export ANTHROPIC_MODEL=anthropic/claude-sonnet-4-6
```

<div class="oas-note">这里能直接 <code>npx tsx examples/xx.ts</code> 跑示例，靠的是 <code>tsx</code> 在运行时即时编译 TS——不需要先 <code>npm run build</code>。build 是给"发布"用的，调试示例用 tsx 更快。</div>

### 4.2 examples/01-simple-query.ts 逐行

这是最简单的示例，把它逐行读完，你就理解了 SDK 最核心的用法形态。

```ts
import { createAgent } from '@shipany/open-agent-sdk'
```

只 import 一个东西：`createAgent`。它来自包入口（还记得吗：包入口 = `dist/sdk.js` = `src/sdk.ts`，第 01 讲的主角）。

```ts
async function main() {
  console.log('--- Example 1: Simple Query ---\n')

  const agent = createAgent({
    model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
    maxTurns: 10,
  })
```

- `createAgent({...})` 造一个 Agent 实例。
- `model`：优先用环境变量里的模型，否则默认 `claude-sonnet-4-6`。
- `maxTurns: 10`：**最多 10 个 agentic 回合**。一个"回合"约等于"模型回一次 + 可能调用工具 + 工具结果再喂回去"。这个上限是防止 Agent 无限循环烧钱的安全阀（默认 100）。

```ts
  for await (const event of agent.query(
    'Read package.json and tell me the project name and version in one sentence.',
  )) {
```

- `agent.query(prompt)` 返回一个 **异步生成器（AsyncGenerator）**，用 `for await` 流式消费。
- 这意味着 Agent 一边干活一边吐事件，而不是干完一次性返回。这正是"进程内直连 API 的流"在用户侧的体现。

```ts
    const msg = event as any

    if (msg.type === 'assistant') {
      for (const block of msg.message?.content || []) {
        if (block.type === 'tool_use') {
          console.log(`[Tool] ${block.name}(${JSON.stringify(block.input).slice(0, 80)})`)
        }
        if (block.type === 'text') {
          console.log(`\nAssistant: ${block.text}`)
        }
      }
    }
```

- 每个 `event` 有 `type`。`type === 'assistant'` 表示这是模型产出的一条消息。
- 一条 assistant 消息的 `content` 是**一个块数组**，块可能是 `text`（要展示给用户的文字）或 `tool_use`（模型决定调用某个工具）。
- 这里把工具调用打印成 `[Tool] Read(...)`，把文字打印成 `Assistant: ...`。

<div class="oas-key-note"><strong>这就是 Agent 的事件模型雏形</strong>：模型的输出不是一段纯文本，而是 text / tool_use 交错的块流。主循环看到 tool_use 就去执行工具，把结果回灌，再让模型继续——这套循环就是后续讲 <code>query.ts</code> 的主线。</div>

```ts
    if (msg.type === 'result') {
      console.log(`\n--- Result: ${msg.subtype} ---`)
      console.log(`Tokens: ${msg.usage?.input_tokens} in / ${msg.usage?.output_tokens} out`)
    }
  }
}

main().catch(console.error)
```

- `type === 'result'` 是**整个任务结束**时的收尾事件，带 `subtype`（成功 / 失败原因）和 token 用量统计。
- 最后 `main().catch(console.error)` 启动并兜住异常。

### 4.3 运行与预期输出

```sh
npx tsx examples/01-simple-query.ts
```

预期输出（示意，token 数会变）：

```text
--- Example 1: Simple Query ---

[Tool] Read({"file_path":"package.json"})

Assistant: The project is "@shipany/open-agent-sdk" version 0.1.7.

--- Result: success ---
Tokens: 3500 in / 80 out
```

读懂这段输出，就完整看到了一轮 Agent 闭环：**模型决定读文件（tool_use Read）→ 引擎执行并回灌内容 → 模型基于内容给出最终答复（text）→ result 收尾**。

<details class="oas-fold">
<summary>其余 9 个示例分别演示什么（点开看全量路线的预习）<span class="oas-b oas-skim">可跳读</span></summary>

| # | 文件 | 演示点 |
| --- | --- | --- |
| 02 | `02-multi-tool.ts` | Glob + Bash + Read 多工具自主编排 |
| 03 | `03-multi-turn.ts` | `agent.prompt()` 多轮，跨轮记住上下文 |
| 04 | `04-prompt-api.ts` | 阻塞式 `prompt()`，一次拿完整结果（含 num_turns / duration_ms） |
| 05 | `05-custom-system-prompt.ts` | 自定义 systemPrompt 改变 Agent 人格 |
| 06 | `06-mcp-server.ts` | 接入 MCP server（stdio） |
| 07 | `07-custom-tools.ts` | 自定义工具（实现 Tool 接口） |
| 08 | `08-official-api-compat.ts` | 顶层 `query()`，与官方 SDK drop-in 兼容 |
| 09 | `09-subagents.ts` | 子 Agent 委派（Agent 工具） |
| 10 | `10-permissions.ts` | 只读 Agent（allowedTools 收窄权限） |

这些示例会在后续对应主题的讲里被逐一逐行拆解。比如 07 会和"工具协议"那一讲一起读，10 会和"权限系统"那一讲一起读。

</details>

## 第 5 章 · 本讲小结与下一讲预告 <span class="oas-b oas-skim">收尾</span>
<a id="ch5"></a>

这一讲我们没碰业务逻辑，但把地基打牢了：

1. **它是什么**：把完整 Claude Code 引擎做成"进程内"库的开源 Agent SDK。读它 ≈ 读 Claude Code 本体。
2. **地图**：`src/` 的核心主干是 入口 / 主循环 / 工具 / 权限 / API 客户端，外加压缩 / MCP / 记忆 / 多 Agent 几大重点；commands/components 量大但同质，可跳读。
3. **构建链路**：库走 `tsc`，CLI 走 `build.mjs`（esbuild）；其中 stub 插件用"空实现替换够不着的依赖"，是剥离式开源的关键手法。
4. **入口链路**：用户 import → `package.json` exports → `dist/sdk.js` → 源码 `src/sdk.ts`。
5. **第一个 demo**：看清了 Agent 的事件模型——text / tool_use 交错的块流 + result 收尾。

<div class="oas-key-note"><strong>下一讲（第 01 讲）</strong>：逐行精读 <code>src/sdk.ts</code>——这个不到 70 行的 barrel 文件，是如何把整台引擎"包装成一个干净的对外门面"的。我们会顺着它的每一条 <code>export</code>，把整个 SDK 的公共 API 版图画出来，并解释 <code>import './setup-globals.js'</code> 这种"副作用导入"为什么必须放在第一行。</div>

> 系列目录见：[《Open Agent SDK 源码逐行精讲》总目录](/courses/open-agent-sdk/)
