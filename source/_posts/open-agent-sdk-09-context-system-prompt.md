---
title: "《Open Agent SDK 源码逐行精讲》第09讲 · 系统提示构建：4 层记忆、静态/动态边界与缓存机制"
date: 2026-06-22 14:00:00
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
</style>

> 这是《Open Agent SDK 源码逐行精讲》第09讲。前几讲讲完了 Agent 怎么"做事"（工具层），这一讲退一步看"Agent 被告知了什么"——系统提示从哪来，怎么拼，哪部分缓存，哪部分每轮重建。

<div class="oas-toc"><strong>本讲导航</strong>

- 第 1 章 · 全景：三个"上下文"与一套系统提示
- 第 2 章 · `context.ts`：`getSystemContext` 和 `getUserContext` 的分工
- 第 3 章 · 4 层记忆文件：`getMemoryFiles()` 逐行
- 第 4 章 · CLAUDE.md 的处理流程：`@include`、frontmatter、HTML 注释
- 第 5 章 · 系统提示拼接：静态/动态边界与 prompt cache
- 第 6 章 · section 缓存机制：`systemPromptSection` vs `DANGEROUS_uncached`

</div>

## 第 1 章 · 全景：三个"上下文"与一套系统提示

Agent 每次发给模型的请求里，有三个层面的"告诉模型什么"：

| 层 | 从哪来 | 文件 | 频率 |
|---|---|---|---|
| **系统提示** | `getSystemPrompt()` | `constants/prompts.ts` | 每轮构建，但有分段缓存 |
| **系统上下文** | `getSystemContext()` | `context.ts` | 会话级 memoize |
| **用户上下文** | `getUserContext()` | `context.ts` | 会话级 memoize |

这一讲主要讲后两个，以及它们最终如何汇入系统提示。

---

## 第 2 章 · `context.ts`：`getSystemContext` 和 `getUserContext` 的分工 <span class="oas-b oas-core">核心</span>

`context.ts` 只有 189 行，是三个 `memoize` 函数的集合。

### `getGitStatus()` <span class="oas-b oas-key">重点</span>

```typescript
export const getGitStatus = memoize(async (): Promise<string | null> => {
  // 并行取所有 git 信息
  const [branch, mainBranch, status, log, userName] = await Promise.all([
    getBranch(),          // 当前分支名
    getDefaultBranch(),   // 主分支（用于 PR 说明）
    execFileNoThrow(gitExe(), ['--no-optional-locks', 'status', '--short'], ...),
    execFileNoThrow(gitExe(), ['--no-optional-locks', 'log', '--oneline', '-n', '5'], ...),
    execFileNoThrow(gitExe(), ['config', 'user.name'], ...),
  ])
  // 超过 2000 字符截断
  const truncatedStatus = status.length > MAX_STATUS_CHARS
    ? status.substring(0, MAX_STATUS_CHARS) + '\n... (truncated...)'
    : status
  return [
    'This is the git status at the start of the conversation...',
    `Current branch: ${branch}`,
    `Main branch: ${mainBranch}`,
    ...(userName ? [`Git user: ${userName}`] : []),
    `Status:\n${truncatedStatus || '(clean)'}`,
    `Recent commits:\n${log}`,
  ].join('\n\n')
})
```

几个细节：

- `--no-optional-locks`：git 默认会拿文件锁，多个 git 命令并行运行时会争锁。这个 flag 让 `git status/log` 不拿锁，并发安全。
- `memoize`（无参数）：lodash memoize 对无参函数，key 是 `undefined`，整个会话只跑一次。
- 跳过条件：`isEnvTruthy(process.env.CLAUDE_CODE_REMOTE)`（CCR 模式跳过，远程执行不需要本地 git 状态）或 `!shouldIncludeGitInstructions()`（用户关闭了 git 集成）。

### `getSystemContext()` <span class="oas-b oas-skim">可跳读</span>

```typescript
export const getSystemContext = memoize(async () => {
  const gitStatus = isEnvTruthy(process.env.CLAUDE_CODE_REMOTE) || !shouldIncludeGitInstructions()
    ? null
    : await getGitStatus()
  const injection = feature('BREAK_CACHE_COMMAND') ? getSystemPromptInjection() : null
  return {
    ...(gitStatus && { gitStatus }),
    ...(feature('BREAK_CACHE_COMMAND') && injection ? { cacheBreaker: `[CACHE_BREAKER: ${injection}]` } : {}),
  }
})
```

返回值极简：只有 `gitStatus` 和可选的 `cacheBreaker`（ant-only 调试用）。

### `getUserContext()` <span class="oas-b oas-core">核心</span>

```typescript
export const getUserContext = memoize(async () => {
  const shouldDisableClaudeMd =
    isEnvTruthy(process.env.CLAUDE_CODE_DISABLE_CLAUDE_MDS) ||
    (isBareMode() && getAdditionalDirectoriesForClaudeMd().length === 0)

  const claudeMd = shouldDisableClaudeMd
    ? null
    : getClaudeMds(filterInjectedMemoryFiles(await getMemoryFiles()))

  setCachedClaudeMdContent(claudeMd || null)  // 缓存给权限分类器用

  return {
    ...(claudeMd && { claudeMd }),
    currentDate: `Today's date is ${getLocalISODate()}.`,
  }
})
```

三步：
1. 判断是否禁用 CLAUDE.md（环境变量或 bare 模式且无额外目录）
2. 加载所有记忆文件 → 过滤 → 组合成字符串
3. 把结果缓存到全局，供权限分类器用（它需要知道"用户告诉 Agent 能干什么"）

`currentDate` 是每次会话注入的今天日期，这让模型知道时间，而不用每次都在提示里硬编码。

---

## 第 3 章 · 4 层记忆文件：`getMemoryFiles()` 逐行 <span class="oas-b oas-core">核心</span>

`claudemd.ts:790` 的 `getMemoryFiles()` 是整个 CLAUDE.md 系统的入口，也是 memoize 的。

### 加载顺序（低优先级 → 高优先级）

```
加载顺序（越晚加载 = 模型越关注）

1. Managed memory  /etc/claude-code/CLAUDE.md
                   /etc/claude-code/.claude/rules/*.md
                   → 企业/组织统一策略，用户不能覆盖

2. User memory     ~/.claude/CLAUDE.md
                   ~/.claude/rules/*.md
                   → 用户私有全局配置，对所有项目生效

3. Project memory  CLAUDE.md（从 root 到 cwd 每级）
                   .claude/CLAUDE.md（同上）
                   .claude/rules/*.md（同上）
                   → 检入代码库，团队共享

4. Local memory    CLAUDE.local.md（从 root 到 cwd 每级）
                   → gitignore，用户私有项目配置
```

<div class="oas-key-note">目录越靠近 cwd，加载越晚，优先级越高。`/home/user/proj/CLAUDE.md` 比 `/home/user/CLAUDE.md` 更靠近 cwd → 模型在注意力上更偏向前者。这不是 override 覆盖，而是通过"位置靠后"让模型把它当"最新指令"。</div>

### CWD 上行扫描

Project/Local 文件通过从 cwd 往上爬的方式发现：

```typescript
const dirs: string[] = []
let currentDir = originalCwd
while (currentDir !== parse(currentDir).root) {
  dirs.push(currentDir)
  currentDir = dirname(currentDir)
}
// 从根目录开始向 cwd 处理（根先加载，cwd 后加载 = 更高优先级）
for (const dir of dirs.reverse()) {
  // 检查 dir/CLAUDE.md, dir/.claude/CLAUDE.md, dir/.claude/rules/*.md
}
```

Git worktree 嵌套问题：如果当前目录是 git worktree（`.claude/worktrees/<name>/`），父目录是主 repo。主 repo 的 checked-in 文件不重复加载（`skipProject = isNestedWorktree && pathInCanonicalRoot && !pathInGitRoot`），但 `.claude.local.md` 是 gitignored 的，在主 repo 里也存在，所以仍然加载。

### 每个文件的处理流程

```
processMemoryFile(filePath, type, processedPaths, includeExternal)
  ↓
  检查 processedPaths（防循环）
  检查 isClaudeMdExcluded（claudeMdExcludes 设置）
  解析 symlink（防重复）
  ↓
safelyReadMemoryFileAsync
  → readFile (utf-8)
  → parseMemoryFileContent:
      1. 提取 frontmatter（包含 paths: 字段）
      2. 用 marked Lexer lex 一次（gfm:false 防 ~/path 被当删除线）
      3. stripHtmlComments（仅 block-level <!--...-->）
      4. extractIncludePathsFromTokens（找 @path 指令）
      5. 如果是 AutoMem/TeamMem → truncateEntrypointContent（行数+字节双上限）
  ↓
  对每个 @include 路径递归（深度上限 5）
  返回 [included files..., main file]  ← includes 先插，主文件最后
```

---

## 第 4 章 · CLAUDE.md 的处理流程 <span class="oas-b oas-key">重点</span>

### `@include` 指令 <span class="oas-b oas-key">重点</span>

CLAUDE.md 文件里可以用 `@` 语法引用其他文件：

```markdown
<!-- 以下几种写法都有效 -->
@./relative/path.md
@~/home-relative/path.md
@/absolute/path.md
@relative-without-slash.md
```

提取逻辑在 `extractIncludePathsFromTokens()`，用 marked 的 token 树遍历，**跳过 code/codespan 节点**（代码块里的 `@path` 不算 include 指令）。引用的文件递归处理，深度上限 5，已处理路径用 `Set<string>` 去重。

<div class="oas-note">只允许文本类型文件（`.md`、`.ts`、`.py`、`.json` 等，共 60+ 种扩展名）。图片、PDF、二进制文件会被跳过。这个白名单列表在 `TEXT_FILE_EXTENSIONS` 常量里。</div>

### Frontmatter 条件规则

`.claude/rules/*.md` 文件可以加 frontmatter 声明 glob 模式，只对匹配文件生效：

```markdown
---
paths:
  - src/api/**
  - "**/*.ts"
---

# TypeScript API 规范

使用 zod 做 schema 验证...
```

没有 frontmatter `paths` 字段的规则对所有文件生效。

### HTML 注释剥除

`stripHtmlComments()` 用 marked Lexer 找 block-level 的 `<!-- ... -->` 并剥除。**只剥 block 级别**（独占整行的注释），**不剥**段落中间内联的 `<!-- note -->`。

<div class="oas-why">原因：CLAUDE.md 里的块级注释通常是作者给自己看的"草稿备注"，不应该发给模型。行内注释可能是真实内容的一部分（如 HTML 教程里的代码说明）。</div>

### 最终组合：`getClaudeMds()`

```typescript
export const getClaudeMds = (memoryFiles: MemoryFileInfo[]): string => {
  const memories: string[] = []
  for (const file of memoryFiles) {
    if (file.content) {
      const description =
        file.type === 'Project' ? ' (project instructions, checked into the codebase)'
        : file.type === 'Local' ? " (user's private project instructions, not checked in)"
        : file.type === 'AutoMem' ? " (user's auto-memory, persists across conversations)"
        : " (user's private global instructions for all projects)"
      memories.push(`Contents of ${file.path}${description}:\n\n${file.content.trim()}`)
    }
  }
  if (memories.length === 0) return ''
  return `${MEMORY_INSTRUCTION_PROMPT}\n\n${memories.join('\n\n')}`
}
```

每个文件前都加 "Contents of path (description):" 标注——让模型清楚每段指令从哪来，是 project 级别的还是用户个人的。

最终输出结构：

```
Codebase and user instructions are shown below. Be sure to adhere to these instructions...

Contents of /etc/claude-code/CLAUDE.md (managed memory):
...（企业策略）

Contents of /Users/xxx/.claude/CLAUDE.md (user's private global instructions):
...（用户个人规则）

Contents of /path/to/project/CLAUDE.md (project instructions, checked into the codebase):
...（项目规则）

Contents of /path/to/project/CLAUDE.local.md (user's private project instructions, not checked in):
...（私有项目规则）
```

---

## 第 5 章 · 系统提示拼接：静态/动态边界与 prompt cache <span class="oas-b oas-core">核心</span>

`prompts.ts:445` 的 `getSystemPrompt()` 是最终拼接点。

### 两段结构

```typescript
return [
  // === 静态段（可缓存）===
  getSimpleIntroSection(outputStyleConfig),  // "You are Claude Code..."
  getSimpleSystemSection(),                   // 通用行为指导
  getSimpleDoingTasksSection(),               // 任务执行规范
  getActionsSection(),                        // git/工具操作边界
  getUsingYourToolsSection(enabledTools),     // 工具使用方法
  getSimpleToneAndStyleSection(),             // 语气风格
  getOutputEfficiencySection(),               // 输出效率

  // === 边界标记 ===
  ...(shouldUseGlobalCacheScope() ? [SYSTEM_PROMPT_DYNAMIC_BOUNDARY] : []),
  //   '__SYSTEM_PROMPT_DYNAMIC_BOUNDARY__'

  // === 动态段（registry 管理）===
  ...resolvedDynamicSections,
].filter(s => s !== null)
```

### `SYSTEM_PROMPT_DYNAMIC_BOUNDARY` 的作用 <span class="oas-b oas-key">重点</span>

这个字符串标记 `'__SYSTEM_PROMPT_DYNAMIC_BOUNDARY__'` 是系统提示的"分水岭"。上方是静态内容，在同一个对话里不会变，可以放在 Anthropic API 的 prompt cache 前缀里。下方是动态内容，每轮可能不同（CLAUDE.md 内容可能随会话变化、MCP 服务器可能连接/断开）。

<div class="oas-key-note">Anthropic prompt cache 要求"前 N 个 token 完全相同才命中缓存"。静态段一旦发给 API 就不变，所以缓存命中率高。动态段变了也只让缓存从边界处失效，而不是整个系统提示重置。</div>

### 动态段的内容

```typescript
const dynamicSections = [
  systemPromptSection('session_guidance', () => getSessionSpecificGuidanceSection(...)),
  systemPromptSection('memory',           () => loadMemoryPrompt()),   // CLAUDE.md 内容
  systemPromptSection('env_info_simple',  () => computeSimpleEnvInfo(model, ...)), // 平台/模型/cwd/日期
  systemPromptSection('language',         () => getLanguageSection(settings.language)),
  systemPromptSection('output_style',     () => getOutputStyleConfig()),
  DANGEROUS_uncachedSystemPromptSection(  // 注意这个是 DANGEROUS_uncached！
    'mcp_instructions',
    () => getMcpInstructionsSection(mcpClients),
    'MCP servers connect/disconnect between turns',
  ),
  systemPromptSection('scratchpad', ...),
  systemPromptSection('frc', ...),
  ...
]
```

`env_info` 段的内容示例（`computeSimpleEnvInfo`）：

```
# Environment
You have been invoked in the following environment:
 - Primary working directory: /Users/bytedance/code/my-project
 - Is a git repository: true
 - Platform: darwin
 - Shell: zsh
 - OS Version: Darwin 24.6.0
 - You are powered by the model named Claude Sonnet 4.6. The exact model ID is claude-sonnet-4-6.
 - Assistant knowledge cutoff is August 2025.
...
```

---

## 第 6 章 · section 缓存机制 <span class="oas-b oas-key">重点</span>

`systemPromptSections.ts` 里有两种 section 类型：

### `systemPromptSection`（缓存的）

```typescript
export function systemPromptSection(name: string, compute: ComputeFn): SystemPromptSection {
  return { name, compute, cacheBreak: false }
}
```

`resolve` 时先查 section 缓存：

```typescript
const cache = getSystemPromptSectionCache()  // bootstrap/state.ts 里的 Map
if (!s.cacheBreak && cache.has(s.name)) {
  return cache.get(s.name) ?? null  // 直接返回缓存值
}
const value = await s.compute()    // 没有就计算
setSystemPromptSectionCacheEntry(s.name, value)  // 存进去
return value
```

**缓存生命周期**：从第一次计算到 `/clear` 或 `/compact`——这两个命令调用 `clearSystemPromptSections()`，清空整个 section cache。

### `DANGEROUS_uncachedSystemPromptSection`（不缓存的）

```typescript
export function DANGEROUS_uncachedSystemPromptSection(
  name: string,
  compute: ComputeFn,
  _reason: string,  // 必须说明为什么不能缓存
): SystemPromptSection {
  return { name, compute, cacheBreak: true }
}
```

`cacheBreak: true` 的 section 每轮都重新计算，会破坏 prompt cache。所以这个函数名里带 `DANGEROUS_`——强迫使用者解释为什么不得不每轮重算。

目前只有 `mcp_instructions` 用这个，因为 MCP 服务器可以在两轮对话之间连接或断开，指令内容会变。

### 两级缓存总结

| 缓存层 | 位置 | 覆盖范围 | 失效时机 |
|---|---|---|---|
| `memoize`（lodash）| `context.ts` 函数 | `getGitStatus / getSystemContext / getUserContext / getMemoryFiles` | 进程重启（一次 CLI 调用） |
| section cache | `bootstrap/state.ts` Map | 每个动态 section 的返回值 | `/clear` 或 `/compact` |

<div class="oas-note"><code>getMemoryFiles</code> 也是 memoize 的，但它的缓存可以被 <code>resetGetMemoryFilesCache()</code> 手动清除（在 /compact 时触发），让下一轮重新加载 CLAUDE.md。这样 compact 后新的记忆文件能被发现。</div>

---

## 小结

```
用户输入
  ↓
getSystemPrompt()                          prompts.ts
  ├─ 静态段（intro/system/tasks/...）       不变，prompt cache 命中率高
  ├─ DYNAMIC_BOUNDARY                       缓存分水岭
  └─ 动态段（section registry）             每种 section 有自己的缓存策略
       ├─ memory → loadMemoryPrompt()       context.ts:getUserContext()
       │                                     → claudemd.ts:getMemoryFiles()
       │                                       → 4 层文件加载 + @include + frontmatter
       ├─ env_info → computeSimpleEnvInfo() 平台/模型/cwd/date
       ├─ session_guidance → ...            当前启用工具的操作提示
       └─ mcp_instructions → ...           DANGEROUS_uncached，每轮重建
```

下一讲（第10讲）：**消息与历史 `messages.ts` / `history.ts`** — Agent 的"大脑容量"——消息如何构造、如何压缩存入会话历史、多轮对话怎么保持连贯性。

> 配套源码：[github.com/Syfyivan/open-agent-sdk](https://github.com/Syfyivan/open-agent-sdk)，本讲对应文件：`src/context.ts`、`src/utils/claudemd.ts`、`src/constants/prompts.ts`、`src/constants/systemPromptSections.ts`。
