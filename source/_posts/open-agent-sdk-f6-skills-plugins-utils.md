---
title: "【Open Agent SDK 源码精讲·F6讲（终）】Skills、Plugins 与 Utils：三大基础设施的完整图谱"
date: 2026-06-22
tags:
  - Open Agent SDK
  - Claude Code
  - 源码精讲
  - 全量路线
  - Skills
  - Plugins
categories:
  - 技术深潜
series: open-agent-sdk
---

> **系列导航** → [课程目录](/courses/open-agent-sdk/) · 上一讲：[F5·Types 全量解析](/2026/06/22/open-agent-sdk-f5-types-batch/)
>
> **F6 是全量逐行路线的终讲**，覆盖 `skills/`、`plugins/` 与 `utils/` 三个目录，系列至此全部完成。

---

## 引言：三个被"正文"有意跳过的目录

核心路线（第 00–16 讲）专注于 Agent 引擎主干，刻意跳过了三个支撑层：

- `skills/`：把 Markdown 文件变成可调用命令的机器
- `plugins/`：让用户能安装"技能包"的插件注册表
- `utils/`：全项目共用的 120+ 个工具函数库

理解这三层，就理解了 Claude Code 是如何把"用户写的 Markdown 文件"变成"/命令"的——这是整个系统最有创意的设计之一。

---

## 第一节：skills/ — 从 Markdown 到命令的流水线

### 1.1 BundledSkillDefinition：内置技能的定义格式

```typescript
// skills/bundledSkills.ts
export type BundledSkillDefinition = {
  name: string
  description: string
  aliases?: string[]
  allowedTools?: string[]
  context?: 'inline' | 'fork'       // 在当前对话展开，还是开子 Agent 运行
  agent?: string                     // fork 时使用的 Agent 类型
  files?: Record<string, string>     // 额外参考文件（键=相对路径，值=内容）
  getPromptForCommand(args, context): Promise<ContentBlockParam[]>
}
```

**`files` 字段的精巧之处**：如果一个内置技能需要携带参考文档，可以在 `files` 里定义。技能第一次被调用时，这些文件会被解压到磁盘上（缓存，之后不再重写），系统提示里会加一行"这个技能的基础目录在 <dir>"，让模型可以用 Read/Grep 工具按需读取，而不是把所有内容塞进提示词。

### 1.2 registerBundledSkill()：内置技能的注册机制

```typescript
// skills/bundledSkills.ts
const bundledSkills: Command[] = []

export function registerBundledSkill(definition: BundledSkillDefinition): void {
  // 1. 如果有 files，包装 getPromptForCommand（添加解压逻辑）
  // 2. 把 BundledSkillDefinition 转换成 Command 对象（type: 'prompt'）
  // 3. push 进 bundledSkills 数组

  const command: Command = {
    type: 'prompt',
    name: definition.name,
    description: definition.description,
    // ... 字段直接映射
  }
  bundledSkills.push(command)
}
```

注册后，`bundledSkills` 数组会被 `commands.ts` 合并进全局命令池——内置技能和用 TypeScript 写的 `LocalCommand` 在用户眼中没有区别。

### 1.3 内置技能目录（skills/bundled/）

| 文件 | 技能名 | 用途 | 限制 |
|------|--------|------|------|
| `remember.ts` | `/remember` | 把 auto-memory 归类/清理 | ant-only |
| `dream.ts` | 内部 | autoDream 的触发入口 | ant-only（空存根） |
| `loop.ts` | `/loop` | 将提示词定时循环调度 | 需要 KAIROS |
| `keybindings.ts` | `/keybindings` | 显示快捷键帮助 | 通用 |
| `verify.ts` | `/verify` | 让模型自校验工作成果 | 通用 |
| `stuck.ts` | `/stuck` | "我卡了，帮我分析" | 通用 |
| `simplify.ts` | `/simplify` | 简化当前上下文 | 通用 |
| `debug.ts` | `/debug` | 启动调试流程 | 通用 |
| `skillify.ts` | `/skillify` | 把当前对话提炼成一个 Skill | 通用 |
| `batch.ts` | `/batch` | 批量执行多个任务 | 通用 |
| `hunter.ts` | `/hunter` | 在代码库里猎找 bug | 通用 |

**`remember.ts` 的提示词设计**值得一看：它包含了一张四列表格（目的地 / 属于什么 / 示例 / 歧义处理），这是内置技能直接用 Markdown 表格做决策树的典型模式。

### 1.4 loadSkillsDir.ts（1086 行）：从磁盘 Markdown 加载技能

这是 Claude Code 技能系统的核心引擎，把用户放在 `~/.claude/skills/` 或 `.claude/skills/` 里的 `.md` 文件变成可用命令。

**技能加载流水线**：

```
.md 文件（磁盘）
  │
  parseFrontmatter()       ← 解析 YAML front matter
  │
  parseSkillFrontmatterFields()
  │  解析字段：
  │  - allowed-tools / allowedTools
  │  - model（指定调用模型）
  │  - effort（推理力度）
  │  - context（inline | fork）
  │  - agent（子 Agent 类型）
  │  - paths（只在触碰特定文件后显示）
  │
  createSkillCommand()     ← 生成 PromptCommand 对象
  │
  getSkillDirCommands()    ← memoize 加载结果（避免重复读文件）
```

**`getPromptForCommand` 的执行**：技能的提示词内容可以包含 shell 命令（用 `` ` `` 包裹），`executeShellCommandsInPrompt()` 在技能被调用时动态执行这些命令并把输出插入提示词。

```markdown
---
description: Check current git status
---

Current branch: `git branch --show-current`
Recent commits: `git log --oneline -5`

Please review these changes...
```

**参数替换**：技能文件名可以包含参数：`my-skill $ARG1 $ARG2`，`substituteArguments()` 在调用时把 `$ARG1` 等占位符替换为用户传入的实际参数。

**动态技能 + 条件技能**：

```typescript
// 条件技能：只在触碰特定文件路径后才出现在自动补全里
export function activateConditionalSkillsForPaths(paths: string[]): void {
  // 遍历已注册的条件技能，检查 paths 是否匹配
  // 匹配成功 → 移入 dynamicSkills（全局可见）
}

// 动态技能：运行时热加载（比如 /skills add 后立即生效）
export function getDynamicSkills(): Command[] { ... }
```

**memoize 策略**：`getSkillDirCommands` 用 `memoize(fn)` 缓存结果，但同时在文件系统变化时调用 `clearSkillCaches()` 强制失效——做到"不重复读"和"文件改了立刻生效"的平衡。

---

## 第二节：plugins/ — 可安装的技能包

### 2.1 两种插件的区别

| 维度 | 内置插件 (builtin) | 外部插件 (marketplace/git) |
|------|------------------|--------------------------|
| 存储 | 打包进二进制 | 用户安装到 `~/.claude/plugins/` |
| 显示 | `/plugin UI` 里有 Built-in 分组 | 从 git 仓库拉取 |
| 版本 | 跟随 Claude Code 版本 | 用户可锁定 SHA |
| 内容 | skills + hooks + MCP servers | manifest.json 定义 |
| 开关 | 用户可在 `/plugin` 里 enable/disable | 同上 |

### 2.2 内置插件注册（plugins/builtinPlugins.ts）

```typescript
// 内置插件的 ID 格式：{name}@builtin
export const BUILTIN_MARKETPLACE_NAME = 'builtin'

const BUILTIN_PLUGINS: Map<string, BuiltinPluginDefinition> = new Map()

export function registerBuiltinPlugin(def: BuiltinPluginDefinition): void {
  BUILTIN_PLUGINS.set(def.name, def)
}

// 获取所有内置插件，根据用户设置拆分成 enabled/disabled
export function getBuiltinPlugins(): {
  enabled: LoadedPlugin[]
  disabled: LoadedPlugin[]
} {
  for (const [name, def] of BUILTIN_PLUGINS) {
    // 1. isAvailable?.() === false → 完全跳过（不显示）
    // 2. 读取 settings.json 里的用户开关偏好
    // 3. 如果没有偏好，用 def.defaultEnabled（默认 true）
    // 4. 转换成 LoadedPlugin 对象（source: 'builtin'）
  }
}
```

**为什么内置插件不直接用 `registerBundledSkill()`？** 因为内置插件需要出现在 `/plugin` UI 里，用户可以看到它的描述、版本、包含的技能列表，还能开关。`registerBundledSkill()` 是"隐式"注册（不出现在 UI），内置插件是"显式"注册（有管理界面）。

### 2.3 外部插件加载（`utils/plugins/`）

外部插件加载流程（不在本讲详述，只给出骨架）：

```
git clone <plugin-repo>
  │
  读取 manifest.json
  │  {name, version, description, commandsPath, agentsPath, hooks, mcpServers}
  │
  加载 commandsPath 里的 .md 文件 → PromptCommand
  加载 agentsPath 里的 .md 文件 → 自定义 Agent 定义
  注册 hooks → HooksSettings
  注册 mcpServers → McpServerConfig
  │
  写入 LoadedPlugin → 合并进全局命令池
```

---

## 第三节：utils/ — 120+ 工具函数速览

`utils/` 目录有 120+ 个文件，但大多数是"一眼懂"的工具函数。本讲选取 10 个最值得看的。

### 3.1 frontmatterParser.ts — 技能文件的"配置语言"

```typescript
// 解析技能 Markdown 文件的 YAML front matter
export function parseFrontmatter(content: string): {
  frontmatter: FrontmatterData
  body: string
}

// 支持的 frontmatter 字段示例：
// ---
// description: Do X
// allowed-tools: Bash, Edit
// model: claude-opus-4-7
// effort: high
// context: fork
// paths: src/**/*.ts, test/**/*.ts
// ---
```

`paths` 字段的解析：`parseSkillPaths()` 把逗号分隔的 glob 列表解析成数组，传给 `PromptCommand.paths`——这就是"条件技能"的配置来源。

### 3.2 argumentSubstitution.ts — 技能参数系统

```typescript
// 从技能描述中解析参数名（$UPPERCASE）
export function parseArgumentNames(text: string): string[]
// 用实际值替换占位符
export function substituteArguments(template: string, args: Record<string, string>): string

// 例：技能名 "generate-test $MODULE $STYLE"
// parseArgumentNames → ['MODULE', 'STYLE']
// 用户输入 "/generate-test auth unit"
// → { MODULE: 'auth', STYLE: 'unit' }
// substituteArguments → 提示词里的 $MODULE 变成 'auth'
```

### 3.3 markdownConfigLoader.ts — 多级配置加载

```typescript
// 按优先级顺序加载 CLAUDE.md（从当前目录向上到 home）
export function getProjectDirsUpToHome(cwd: string): string[]

// 扫描某目录下特定子目录（如 skills/）里的所有 .md 文件
export function loadMarkdownFilesForSubdir(
  dirs: string[],
  subdir: string,    // 如 'skills', 'commands', 'agents'
): Promise<MarkdownFile[]>

// 从 front matter 里的 tools/allowed-tools 字段解析工具白名单
export function parseSlashCommandToolsFromFrontmatter(
  frontmatter: FrontmatterData
): string[] | undefined
```

### 3.4 permissions/filesystem.ts — 路径安全检查

```typescript
// 确保操作路径不逃逸出 home 目录（已在第13讲记忆系统章节覆盖）
export function assertPathInHome(p: string): void
export function getBundledSkillExtractDir(skillName: string): string

// 路径解析
export function pathIsInDir(child: string, parent: string): boolean
```

### 3.5 settings/types.ts — 配置系统结构

```typescript
// 配置分 4 层（优先级从高到低）：
// enterprise_mdm > local_project > project > user
export type SettingSource = 'enterprise_mdm' | 'local_project_settings' | 'project_settings' | 'user_settings'

// 配置文件内容结构
export type Settings = {
  permissions?: { allow?: string[]; deny?: string[] }
  hooks?: HooksSettings
  mcpServers?: Record<string, McpServerConfig>
  enabledBuiltinPlugins?: string[]   // {name}@builtin
  enabledPlugins?: string[]          // {name}@{marketplace}
  // ...
}
```

### 3.6 effort.ts — 推理力度系统

```typescript
export const EFFORT_LEVELS = ['low', 'medium', 'high', 'xhigh', 'max'] as const
export type EffortValue = typeof EFFORT_LEVELS[number]

// 从 front matter 或 CLI 参数解析力度
export function parseEffortValue(raw: string): EffortValue | undefined
```

`effort` 控制 Claude 的扩展推理预算——`max` 时模型在回答前可以做更多"思考步骤"，但消耗更多 token 和时间。技能可以在 front matter 里写死所需力度，也可以让用户在调用时传入。

### 3.7 env.ts + envUtils.ts — 环境检测

```typescript
// 平台/终端检测（在analytics metadata里用到）
export function getHostPlatformForAnalytics(): string  // 'macOS' | 'Linux' | 'Windows'
export function isEnvTruthy(val?: string): boolean     // '1' | 'true' | 'yes' | 'on' → true

// 常用环境变量糖
export function isBareMode(): boolean    // CLAUDE_CODE_SIMPLE=1
export function isCIEnvironment(): boolean
```

### 3.8 sleep.ts — 可取消的 sleep

```typescript
// 支持 AbortSignal 的 sleep（防止 sleep 阻塞进程退出）
export async function sleep(ms: number, signal?: AbortSignal): Promise<void>
```

为什么需要这个？Claude Code 里大量异步等待（retry backoff、polling）使用 sleep，但当用户按 Ctrl+C 时，如果 sleep 不响应 AbortSignal，进程会卡住等 sleep 结束。

### 3.9 model/ — 模型管理子模块

```
utils/model/
├── model.ts           — getMainLoopModel(), parseUserSpecifiedModel()
├── modelCost.ts       — 各模型的 token 单价
└── ...
```

`getMainLoopModel()` 返回当前生效的模型（考虑 `--model` CLI 参数、`/model` 命令切换、以及 State 里的 `mainLoopModelOverride`）。

### 3.10 git/ — Git 工具子模块

```
utils/git/
├── gitignore.ts       — isPathGitignored()（技能加载时过滤 .gitignore 文件）
├── git.ts             — getRepoRemoteHash()（用于遥测），getGitRoot()
└── github/            — PR 状态、review 等 GitHub API 封装
```

---

## 全量路线收尾

至此，`src/` 下的所有目录都至少被覆盖了一次：

```
核心路线（00–16）
  src/sdk.ts, agent.ts, query.ts, queryEngine.ts
  tools/* (Bash/Read/Write/Edit/Grep/Glob/Agent)
  context.ts, messages.ts, history.ts
  utils/permissions/*, services/compact/*
  memdir/*, services/mcp/*, services/multiAgent/*
  services/api/* (withRetry, streaming)

全量补充（F1–F6）
  entrypoints/cli.tsx, ink.tsx, screen.ts
  components/* (144 组件)
  commands/* (112 命令)
  types/* (16 文件 + 4 protobuf 生成)
  skills/* (bundled + loadSkillsDir)
  plugins/* (builtinPlugins)
  utils/* (120+ 工具函数选讲)
```

**两条路线合起来，覆盖了 Claude Code 引擎的完整工作原理。**

---

## 系列后记

这个系列从第 00 讲"项目全景"开始，一路走到 F6 这里，一共 23 讲。

回望整个 Open Agent SDK 的架构，最让我印象深刻的不是某个具体技巧，而是一个整体设计决策：

**把 Markdown 文件作为一等公民的编程单元**。

技能（Skill）是 `.md`，CLAUDE.md 是 `.md`，自定义 Agent 是 `.md`，插件的命令定义也是 `.md`。这意味着任何能写 Markdown 的人都可以扩展 Claude Code 的能力——不需要懂 TypeScript，不需要重新编译，把文件放对地方就生效。

这是"软件工程"和"AI 时代的系统设计"之间一个很有意思的交汇点。

---

> **系列完结**。回到 → [课程目录](/courses/open-agent-sdk/)
