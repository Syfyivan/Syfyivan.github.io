---
title: "《Open Agent SDK 源码逐行精讲》第07讲 · 搜索工具 Glob / Grep：为什么不用向量数据库"
date: 2026-06-22 10:00:00
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

> 这是《Open Agent SDK 源码逐行精讲》第07讲。第06讲讲完文件读写，这一讲讲 Agent 怎么"找东西"——`GlobTool`（按文件名模式找文件）和 `GrepTool`（按内容正则搜）。最值得讲的是一个反直觉的设计决定：**Claude Code 搜索代码库不用向量数据库**（README 原话 "ripgrep + glob — no vector DB needed"）。读完你会明白，为什么对"读代码库"这件事，确定性的 ripgrep 比向量检索更合适。

<div class="oas-toc"><strong>本讲导航</strong>
<a id="ch0"></a>

- 第 1 章 · Agent 怎么"找代码"：两种工具分工
- 第 2 章 · GlobTool 逐段：按名字找文件
- 第 3 章 · GrepTool 逐段：把 ripgrep 包成工具
- 第 4 章 · 为什么不用向量库（本讲核心论点）
- 第 5 章 · 只读可并发：再接第 04 讲调度
- 第 6 章 · demo + 重要性盘点 + 下一讲预告
</div>

## 第 1 章 · Agent 怎么"找代码" <span class="oas-b oas-key">重点</span>
<a id="ch1"></a>

模型要改一个代码库，第一步往往是"它在哪"。两种找法对应两个工具：

```text
Glob  —— 按文件名/路径模式找：  "src/**/*.ts"、"**/*test*"   → 给出文件路径列表
Grep  —— 按文件内容正则搜：     "function query"、"TODO"    → 给出命中的文件/行
```

二者常配合：先 Glob 圈定范围，再 Grep 在内容里定位。它们都实现第 05 讲的 Tool 接口，都**只读、可并发**（第 5 章细说）。

## 第 2 章 · GlobTool 逐段 <span class="oas-b oas-core">核心</span>
<a id="ch2"></a>

`GlobTool.ts` 才 199 行，是最短的工具之一。

### 2.1 输入与只读声明

```ts
const inputSchema = lazySchema(() =>
  z.strictObject({
    pattern: z.string().describe('The glob pattern to match files against'),
    // 还有可选 path
  }),
)
// ...
  isConcurrencySafe() { return true },
  isReadOnly()        { return true },
```

输入就一个必填 `pattern`（glob 模式）+ 可选 `path`。`isReadOnly/isConcurrencySafe` 都 true——纯查询，不碰任何状态。

### 2.2 call：调 glob + 限量 + 相对化 <span class="oas-b oas-key">重点</span>

```ts
  async call(input, { abortController, getAppState, globLimits }) {
    const start = Date.now()
    const appState = getAppState()
    const limit = globLimits?.maxResults ?? 100           // 默认最多 100 个结果
    const { files, truncated } = await glob(
      input.pattern,
      GlobTool.getPath(input),
      { limit, offset: 0 },
      abortController.signal,                              // 支持取消
      appState.toolPermissionContext,                     // 受权限上下文约束
    )
    // 把 cwd 下的路径转成相对路径，省 token
    const filenames = files.map(toRelativePath)
    const output = { filenames, durationMs: Date.now() - start, numFiles: filenames.length, truncated }
    return { data: output }
  },
```

三个工程细节，都很"为模型省心/省钱"：

- **`limit ?? 100`**：默认只返回 100 个文件。一个 `**/*` 可能匹配上万文件，全塞给模型既浪费 token 又没用。
- **`toRelativePath`**：把 `/Users/you/proj/src/a.ts` 变成 `src/a.ts`。注释明说"save tokens"——**相对路径更短，省上下文**。
- **`truncated` 标志**：结果被截断时返回 true。

### 2.3 mapToolResult：把结果说清楚

```ts
  mapToolResultToToolResultBlockParam(output, toolUseID) {
    if (output.filenames.length === 0) {
      return { tool_use_id, type: 'tool_result', content: 'No files found' }   // 明确"没找到"
    }
    return {
      tool_use_id, type: 'tool_result',
      content: [
        ...output.filenames,
        ...(output.truncated ? ['(Results are truncated. Consider using a more specific path or pattern.)'] : []),
      ].join('\n'),
    }
  },
```

<div class="oas-key-note"><strong>这是"给模型可操作反馈"的范例</strong>（呼应第 06 讲）：没找到 → 直接说 "No files found"，模型据此换个模式；结果被截断 → 附一句 "Consider using a more specific path or pattern"，<strong>直接告诉模型怎么改进</strong>。工具不只返回数据，还返回"下一步该怎么做"——这正是 Agent 能自我纠偏的原因。</div>

## 第 3 章 · GrepTool 逐段：把 ripgrep 包成工具 <span class="oas-b oas-core">核心</span>
<a id="ch3"></a>

`GrepTool.ts` 578 行，本质是**把命令行工具 ripgrep（rg）包装成一个 Agent 工具**——把模型给的参数翻译成 rg 的命令行参数。

### 3.1 输入 schema：几乎就是 rg 的选项 <span class="oas-b oas-key">重点</span>

```ts
const inputSchema = lazySchema(() =>
  z.strictObject({
    pattern: z.string(),                              // 正则
    path: z.string().optional(),                      // 搜索路径（rg PATH）
    glob: z.string().optional(),                      // 文件过滤 → rg --glob
    output_mode: z.enum([...]).optional(),            // content / files_with_matches / count
    '-B','-A','-C': ...,                               // 上下文行（rg -B/-A/-C）
    '-n': ...,                                         // 显示行号
    '-i': ...,                                         // 忽略大小写
    type: z.string().optional(),                      // 文件类型 → rg --type
    head_limit: ...,                                   // 限制输出条数，默认 250
    multiline: ...,                                    // 多行模式 → rg -U --multiline-dotall
  }),
)
```

<div class="oas-note">注意字段名直接用了 <code>'-A' / '-B' / '-C' / '-n' / '-i'</code>——<strong>和 rg 命令行选项一一对应</strong>。每个 describe 都注明"maps to rg --xxx"。这是有意为之：让熟悉 ripgrep 的模型/人零学习成本上手。这也暗示了工具设计哲学——不发明新抽象，直接暴露成熟工具的能力。</div>

`searchHint: 'search file contents with regex (ripgrep)'`——第 05 讲讲过 searchHint 是给 ToolSearch 的关键词。

### 3.2 call：把参数翻译成 rg 命令行 <span class="oas-b oas-core">核心</span>

call 的主体就是"按参数往 `args` 数组里 push rg 选项"：

```ts
  async call({ pattern, path, glob, type, output_mode = 'files_with_matches',
               '-B': context_before, '-A': context_after, '-C': context_c, context,
               '-n': show_line_numbers = true, '-i': case_insensitive = false,
               head_limit, multiline = false }, { abortController, getAppState }) {
    const absolutePath = path ? expandPath(path) : getCwd()
    const args = ['--hidden']                          // 搜索隐藏文件

    // 排除版本控制目录，避免 .git 等噪音
    for (const dir of VCS_DIRECTORIES_TO_EXCLUDE) {     // ['.git','.svn','.hg','.bzr','.jj','.sl']
      args.push('--glob', `!${dir}`)
    }

    args.push('--max-columns', '500')                  // ★ 限制单行长度，防 base64/压缩代码刷屏

    if (multiline) args.push('-U', '--multiline-dotall')
    if (case_insensitive) args.push('-i')

    // 输出模式
    if (output_mode === 'files_with_matches') args.push('-l')       // 只列文件
    else if (output_mode === 'count') args.push('-c')              // 只数数量
    if (show_line_numbers && output_mode === 'content') args.push('-n')

    // 上下文行（-C 优先于 -B/-A）
    if (output_mode === 'content') {
      if (context !== undefined) args.push('-C', context.toString())
      else if (context_c !== undefined) args.push('-C', context_c.toString())
      else { if (context_before !== undefined) args.push('-B', ...); if (context_after !== undefined) args.push('-A', ...) }
    }

    // pattern 以 - 开头时用 -e，避免被当成选项
    if (pattern.startsWith('-')) args.push('-e', pattern)
    else args.push(pattern)

    if (type) args.push('--type', type)                // 文件类型过滤
    if (glob) { /* 拆分 glob 模式，保留 {a,b} 大括号 */ }
    // ...最后调 ripGrep(args, absolutePath, signal) 执行...
  },
```

逐个看几个有讲究的点：

- **`--hidden` + 排除 VCS 目录**：既搜隐藏文件（如 `.env.example`、`.github/`），又排除 `.git/.svn/.hg/...` 这些版本控制元数据——**搜得全，又不被仓库内部噪音淹没**。
- **`--max-columns 500`**：单行超 500 列就截断。**为什么？** 注释说防 base64/minified 内容刷屏。想象 grep 命中了一个 minified.js 的某一行（几万字符），不截断会瞬间塞爆上下文。这又是"对抗离谱数据"的防护（呼应第 06 讲 maxBytes）。
- **三种 `output_mode`**：`files_with_matches`（默认，只列文件，最省 token）、`content`（显示命中行，支持 -A/-B/-C 上下文）、`count`（只给数量）。**让模型按需取粒度**——只想知道"哪些文件有"就别拉全部内容。
- **`pattern.startsWith('-')` 用 `-e`**：防止以 `-` 开头的正则被 rg 当成命令行选项（注入防护的一种）。
- **`head_limit` 默认 250**：限制输出条数（schema 里注明，"Pass 0 for unlimited (use sparingly — large result sets waste context)"）。又是一处省 token 的默认。

<div class="oas-key-note"><strong>GrepTool 的全部工作，就是"安全、省 token 地把模型意图翻译成一条 rg 命令"</strong>：默认值偏向最小输出（files_with_matches + head_limit 250 + max-columns 500），排除噪音（VCS 目录），防注入（-e），再交给底层 <code>ripGrep()</code> 执行。它本身不实现搜索算法——搜索交给久经考验的 ripgrep。</div>

## 第 4 章 · 为什么不用向量数据库 <span class="oas-b oas-core">核心</span>
<a id="ch4"></a>

很多人第一反应：做"代码库问答 / 检索"，不是该上 RAG + 向量库吗？Claude Code 偏偏不。把理由摆开。

### 4.1 代码搜索的特点决定了工具选择

| 维度 | 向量检索（RAG） | ripgrep + glob |
| --- | --- | --- |
| 匹配方式 | 语义相似（模糊） | 字面/正则（精确） |
| 结果确定性 | 概率性，可能漏可能偏 | 确定，命中就是命中 |
| 索引成本 | 要预先 embedding 建库、还要维护更新 | **零索引**，直接扫文件 |
| 实时性 | 代码改了要重新 embedding | 永远是当前磁盘最新状态 |
| 速度 | 取决于库大小 | ripgrep 极快（Rust、并行） |
| 尊重 .gitignore | 要自己实现 | rg 原生支持 |

<div class="oas-key-note"><strong>核心论点</strong>：代码搜索要的是<strong>精确和确定</strong>，不是"语义相似"。当模型想找"叫 <code>submitMessage</code> 的函数定义在哪"，它要的是<strong>精确匹配那个标识符</strong>，而不是"和 submitMessage 语义相近的几段代码"。向量检索的"模糊语义"在这里是缺点不是优点——它可能漏掉真正的定义、返回一堆相关但不对的片段。而 ripgrep 给的是确定答案：有就是有，行号在此。</div>

### 4.2 还有两个工程理由

- **零索引 = 零维护、零陈旧**：向量库要建、要随代码变更重建，否则就和真实代码脱节。ripgrep 每次直接扫当前文件，**永远不会"搜到一个已经被删的旧版本"**。对一个会自己改文件的 Agent，这点尤其重要——它上一步刚 Edit 过的内容，下一步 Grep 立刻能搜到最新的。
- **模型本身就是"语义层"**：RAG 用向量做语义召回，是因为传统系统没有理解能力。但这里"理解"由模型负责——模型自己会把"找处理登录的代码"翻译成具体的正则（`login|auth|signin`）去 Grep。**语义判断交给模型，精确检索交给 ripgrep，各司其职**，不需要在中间再塞一个向量库。

<div class="oas-why"><strong>这是整门课最值得带走的设计洞见之一</strong>：不是所有"AI 检索"都需要向量库。当你的系统里已经有一个强模型时，"模型生成精确查询 + 确定性工具执行"往往比"向量模糊召回"更可靠、更省事。Claude Code 用 26 个工具 + ripgrep 证明了：<strong>给 Agent 一套确定性工具，比给它一个概率性检索层更好用。</strong></div>

## 第 5 章 · 只读可并发：再接第 04 讲调度 <span class="oas-b oas-key">重点</span>
<a id="ch5"></a>

```ts
// GlobTool 和 GrepTool 都是：
  isConcurrencySafe() { return true },
  isReadOnly()        { return true },
```

和第 06 讲的 Read 一样，Glob/Grep 都是只读 + 并发安全。

<div class="oas-note">所以模型一轮里若同时要"Glob 找 *.ts + Grep 搜 TODO + Read 某文件"，这三个<strong>可以并发跑</strong>（第 04 讲步5 的调度）——它们都不改状态，互不干扰。这就是为什么 Claude Code 探索代码库时常常"唰"地一下并行做好几个搜索：底层正是这几个 <code>isReadOnly()===true</code> 的工具在并发。</div>

## 第 6 章 · demo + 重要性盘点 + 下一讲预告 <span class="oas-b oas-skim">收尾</span>
<a id="ch6"></a>

### 6.1 demo：复刻 examples/02 的搜索步

第 00 讲的 examples/02 第一步就是 Glob：

```ts
await agent.prompt('用 Glob 找出 src/ 下所有 .ts 文件（模式 "src/*.ts"），列出来')
```

你会看到事件流里：`assistant: tool_use Glob({pattern:"src/*.ts"})` → `user: tool_result "src/agent.ts\nsrc/query.ts\n..."`。

手动对照 ripgrep 行为，验证"零索引、即时最新"：

```sh
# GrepTool 内部等价于这条命令（files_with_matches 模式）
rg --hidden --glob '!.git' --max-columns 500 -l "submitMessage" .
```

跑一下，你会直接得到 `src/QueryEngine.ts`——和第 03 讲我们读到的位置完全一致。**没有任何索引步骤，改完代码立刻能搜到最新**，这就是第 4 章说的"零索引、零陈旧"。

### 6.2 重要性盘点

| 内容 | 重要性 | 一句话 |
| --- | --- | --- |
| 不用向量库的论证 | <span class="oas-b oas-core">核心</span> | 精确确定 > 语义模糊；模型当语义层 |
| GrepTool 翻译成 rg 参数 | <span class="oas-b oas-core">核心</span> | 工具=成熟 CLI 的安全包装 |
| 省 token 的默认（limit/相对路径/max-columns）| <span class="oas-b oas-key">重点</span> | 处处为上下文预算考虑 |
| 给模型可操作反馈 | <span class="oas-b oas-key">重点</span> | No files found / 截断提示 |
| 只读可并发 | <span class="oas-b oas-key">重点</span> | 接第 04 讲调度 |
| VCS 排除 / -e 防注入 | <span class="oas-b oas-skim">可跳读</span> | 去噪与安全细节 |

### 6.3 下一讲预告

<div class="oas-key-note"><strong>第 08 讲</strong>：读最强大也最危险的工具——<strong>Bash 工具与命令安全</strong>。Bash 能跑任意命令，所以它背后有这门课最重的安全代码：<code>bashParser</code>（把命令解析成 AST）、<code>bashSecurity</code>、<code>bashPermissions</code>、<code>readOnlyValidation</code>（判断一条命令到底是只读还是会改东西）。我们会看到引擎怎么在"让 Agent 有用"和"别让它 rm -rf 你的家目录"之间划线——这也是理解第 11 讲权限系统的关键前置。</div>

> 上一讲：[第06讲 · 文件工具三件套](/2026/06/21/open-agent-sdk-06-file-tools/) ｜ 系列目录：[《Open Agent SDK 源码逐行精讲》总目录](/courses/open-agent-sdk/)
