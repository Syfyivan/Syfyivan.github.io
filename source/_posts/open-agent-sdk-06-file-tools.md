---
title: "《Open Agent SDK 源码逐行精讲》第06讲 · 文件工具三件套：Read / Write / Edit"
date: 2026-06-21 16:00:00
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

> 这是《Open Agent SDK 源码逐行精讲》第 06 讲。第 05 讲讲完了"工具是什么"，这一讲开始逐个拆具体工具，从 Agent 改代码最高频的**文件三件套 Read / Write / Edit** 入手。重点是 `FileEditTool` 那条精心设计的"校验链"——它回答了一个很多人好奇的问题：**为什么 Claude Code 改文件前总要先 Read 一遍？**

<div class="oas-toc"><strong>本讲导航</strong>
<a id="ch0"></a>

- 第 1 章 · 三件套的定位与协作
- 第 2 章 · FileReadTool：一个工具返回三种东西
- 第 3 章 · FileEditTool：那条防误改的校验链（本讲核心）
- 第 4 章 · FileWriteTool：写文件也要先读
- 第 5 章 · 为什么只有 Read 是只读（接第 04 讲调度）
- 第 6 章 · demo + 重要性盘点 + 下一讲预告
</div>

## 第 1 章 · 三件套的定位与协作 <span class="oas-b oas-key">重点</span>
<a id="ch1"></a>

```text
Read  —— 读：把文件内容（带行号）喂给模型，建立"它现在长这样"的认知
Edit  —— 改：在已读文件里做精确字符串替换
Write —— 写：整文件创建或覆盖
```

它们都住在 `src/tools/XxxTool/XxxTool.ts`（第 01 讲 sdk.ts 导出过），都实现第 05 讲的 `Tool` 接口。三者有一条**强耦合的协作规则**串起来——**先 Read 才能 Edit/Write**。这条规则是本讲的主线，第 3、4 章会看到它在代码里怎么强制执行。

<div class="oas-note">协作的纽带是第 02/03 讲反复出现的 <code>readFileState</code>（读文件缓存）。Read 成功后会往里写一条"我在某时刻读过这个文件、内容是 X"；Edit/Write 执行前会查它——没读过、或读后文件变了，就拒绝。<strong>三件套通过这个共享缓存协同。</strong></div>

## 第 2 章 · FileReadTool：一个工具返回三种东西 <span class="oas-b oas-core">核心</span>
<a id="ch2"></a>

`FileReadTool.ts` 1184 行，但骨架清晰。

### 2.1 输入 schema：file_path + offset/limit/pages

```ts
const inputSchema = lazySchema(() =>
  z.strictObject({
    file_path: z.string().describe('The absolute path to the file to read'),
    offset: semanticNumber(z.number().int().nonnegative().optional())
      .describe('The line number to start reading from. Only provide if the file is too large to read at once'),
    limit: semanticNumber(z.number().int().positive().optional())
      .describe('The number of lines to read. Only provide if the file is too large to read at once.'),
    pages: z.string().optional()
      .describe(`Page range for PDF files (e.g. "1-5"). ... Maximum ${PDF_MAX_PAGES_PER_READ} pages per request.`),
  }),
)
```

四个字段：`file_path`（绝对路径，必填）、`offset`/`limit`（大文件分页读）、`pages`（PDF 页范围）。

- **`z.strictObject`**：严格对象——多给字段会报错，逼模型只传定义过的参数。
- **每个字段都带 `.describe(...)`**：这些描述会进 JSON Schema 给模型看。注意 offset/limit 的描述里写明"只在文件太大时才给"——**用描述来引导模型行为**，这是工具设计的常见手法。
- `lazySchema(() => ...)`：惰性构建 schema（首次用到才建），是启动性能优化。

### 2.2 输出：text / image / pdf 的可辨识联合 <span class="oas-b oas-key">重点</span>

```ts
const outputSchema = lazySchema(() =>
  z.discriminatedUnion('type', [
    z.object({ type: z.literal('text'),  file: z.object({ filePath, content, numLines, startLine, totalLines }) }),
    z.object({ type: z.literal('image'), file: z.object({ base64, type: imageMediaTypes, originalSize, dimensions }) }),
    z.object({ type: z.literal('pdf'),   file: z.object({ /* 抽取的页图像等 */ }) }),
  ]),
)
```

<div class="oas-key-note"><strong>一个 Read 工具能返回三种形态</strong>：纯文本（带行号信息）、图片（base64 + MIME + 尺寸，会被缩放）、PDF（抽取页面）。用第 02 讲讲过的<strong>可辨识联合</strong>（按 <code>type</code> 区分）表达。这就是 README 说 "Read files with line numbers, images, PDFs" 的实现——同一个工具按文件类型走不同分支。图片/PDF 的处理（imageResizer、pdf 抽页）是单独的 utils，本讲聚焦文本主路径。</div>

### 2.3 isReadOnly / isConcurrencySafe = true

```ts
  isConcurrencySafe() { return true },
  isReadOnly()        { return true },
```

Read **既只读又并发安全**。

<div class="oas-note">记住这两个 true——第 5 章会用它解释"为什么多个 Read 能同时跑，而 Edit/Write 要排队"。这正是第 04 讲步5 调度逻辑的依据。</div>

### 2.4 call：读取 + 加行号 + 防 OOM <span class="oas-b oas-key">重点</span>

文本主路径的核心逻辑：

```ts
  // 读文件时按 maxBytes 截断，避免超大文件撑爆内存
  // readTextContent(file_path, { offset, limit, maxBytes })
  // ...
  return addLineNumbers(file)   // 给每行加上行号前缀
```

两个关键点：

- **`addLineNumbers(file)`**：把内容变成 `   1\t...` 这种带行号的格式。**为什么加行号？** 因为这是 Read 和 Edit 协作的基础——模型看到行号，才能精确说"改第 12 行"，Edit 才能定位。你在 Claude Code 里看到的行号就是这里加的。
- **`maxBytes` 截断**（call 内部 readTextContent 传入）：注释写得很直白——"Read file ONCE — capped to maxBytes to avoid OOM on huge files"。读超大文件时按字节上限截断，**防止一个 `Read 10GB 日志` 把进程内存撑爆**。这是"工具要对抗模型乱来"的典型防护。

<div class="oas-why"><strong>这里体现了工具设计的一条原则：永远假设输入可能很离谱。</strong>模型可能让你读一个巨大的文件、或读一个二进制。Read 工具用 maxBytes 截断、用类型分支区分图片/PDF、用 offset/limit 支持分页，全是在为"不可控的调用方"兜底。</div>

<details class="oas-fold">
<summary>validateInput：读之前的前置校验（点开）<span class="oas-b oas-skim">可跳读</span></summary>

`call` 之前还有 `validateInput({ file_path, pages }, ctx)`（419 行）：检查文件是否存在、路径是否合法、PDF 的 pages 范围是否有效等。校验不过会在执行前就拦下，给模型一个明确的错误。这是第 05 讲 Tool 接口"执行前校验"的体现——`inputSchema` 做结构校验，`validateInput` 做语义校验（文件存不存在这种 schema 管不了的事）。

</details>

## 第 3 章 · FileEditTool：那条防误改的校验链 <span class="oas-b oas-core">核心</span>
<a id="ch3"></a>

这是本讲的高潮。`FileEditTool` 的输入很简单——`file_path / old_string / new_string / replace_all`——但它的 `validateInput` 是一条层层设防的校验链，每一关都防一类误改。逐关看（按源码顺序）。

### 3.1 关卡一 · 新旧串相同

```ts
  async validateInput(input, toolUseContext) {
    const { file_path, old_string, new_string, replace_all = false } = input
    // ...
    if (old_string === new_string) {
      return { result: false, message: 'No changes to make: old_string and new_string are exactly the same.' }
    }
```

`old_string === new_string` 直接拒——这是无意义编辑（模型偶尔会犯）。

### 3.2 关卡二 · 空 old_string = 新建文件

```ts
    // old_string 为空 + 文件不存在 → 视为"创建新文件"，合法
    if (old_string === '') {
      // ...（文件不存在则放行，作为新建）
    }
```

`old_string` 为空且文件不存在，是**用 Edit 创建新文件**的约定（"把空内容替换成 new_string"）。这关把这种合法情形放行。

### 3.3 关卡三 · 必须先读（本讲核心规则）<span class="oas-b oas-core">核心</span>

```ts
    const readTimestamp = toolUseContext.readFileState.get(fullFilePath)
    if (!readTimestamp || readTimestamp.isPartialView) {
      return {
        result: false,
        behavior: 'ask',
        message: 'File has not been read yet. Read it first before writing to it.',
        errorCode: 6,
      }
    }
```

<div class="oas-key-note"><strong>这就是"为什么改文件前必须先 Read"的源头</strong>。Edit 执行前去 <code>toolUseContext.readFileState</code>（那个共享读缓存）查这个文件的读取记录：<br>· 查不到（<code>!readTimestamp</code>）→ 没读过 → 拒绝，让模型先 Read。<br>· 只读了一部分（<code>isPartialView</code>，用了 offset/limit）→ 也拒绝，因为没看到全貌就改很危险。<br><strong>这条规则强制"先理解再修改"</strong>：模型必须先把文件内容拉进上下文，才能基于真实内容做精确替换，而不是凭空猜测文件长什么样去改。这是 Agent 改代码可靠性的基石。</div>

### 3.4 关卡四 · 读后被改过 <span class="oas-b oas-key">重点</span>

```ts
    if (readTimestamp) {
      const lastWriteTime = getFileModificationTime(fullFilePath)
      if (lastWriteTime > readTimestamp.timestamp) {
        // 时间戳变了，但 Windows 上时间戳可能无内容变化也变（云同步/杀毒）
        // 全量读的情况下，用内容比对兜底，避免误报
        const isFullRead = readTimestamp.offset === undefined && readTimestamp.limit === undefined
        if (isFullRead && fileContent === readTimestamp.content) {
          // 内容没变，放行
        } else {
          return {
            result: false,
            behavior: 'ask',
            message: 'File has been modified since read, either by the user or by a linter. Read it again before attempting to write it.',
            errorCode: 7,
          }
        }
      }
    }
```

第二道时间防线：**读完之后、改之前，文件被别人动过吗？**

- 比较文件当前修改时间 vs 当初读取时间戳。`lastWriteTime > readTimestamp.timestamp` 说明读完后文件变了（用户手改、或 linter 自动格式化）。
- **Windows 兼容的精细处理**：时间戳在 Windows 上可能因云同步/杀毒而变但内容没变。所以对全量读，再用**内容比对兜底**（`fileContent === readTimestamp.content`）——内容真没变就放行，避免误报。

<div class="oas-why"><strong>为什么这关重要？</strong>设想模型读了文件、想了几秒、期间你手动改了同一文件。如果 Edit 还按"旧内容"去替换，要么找不到 old_string、要么改错位置、要么覆盖掉你的改动。这关用"读后是否被修改"挡住这种竞态。注释里"either by the user or by a linter"——你在记忆系统里见过这句话，根源就在这。</div>

### 3.5 关卡五 · 找不到 / 不唯一 <span class="oas-b oas-key">重点</span>

```ts
    const actualOldString = findActualString(file, old_string)
    if (!actualOldString) {
      return { result: false, message: `String to replace not found in file.\nString: ${old_string}` }
    }

    const matches = file.split(actualOldString).length - 1
    if (matches > 1 && !replace_all) {
      return {
        result: false,
        message: `Found ${matches} matches of the string to replace, but replace_all is false. To replace all occurrences, set replace_all to true. To replace only one occurrence, please provide more context to uniquely identify the instance.\nString: ${old_string}`,
      }
    }
```

两关一起保证替换是**精确且确定**的：

- **找不到**：`old_string` 在文件里不存在 → 拒（`findActualString` 还做引号归一化，处理智能引号之类）。
- **不唯一**：`old_string` 出现多次但没设 `replace_all` → 拒，并提示"要么设 replace_all=true 全替，要么给更多上下文让它唯一"。**这防的是"想改一处，结果误改了所有同名处"**。

### 3.6 真正替换

```ts
    return replace_all
      ? file.replaceAll(actualOldString, new_string)
      : file.replace(actualOldString, new_string)
```

五关全过，才执行替换：`replace_all` 用 `replaceAll`（全替），否则 `replace`（替第一个，且因关卡五保证了唯一，等于精确替换那一处）。

<div class="oas-key-note"><strong>把 Edit 校验链收齐</strong>：相同串 → 新建文件 → <strong>必须先读</strong> → <strong>读后未被改</strong> → 找得到 → <strong>唯一(或显式 replace_all)</strong> → 替换。六关层层设防，核心思想就一句：<strong>只允许"基于已知的、最新的、明确的内容"做精确修改</strong>。这是 Agent 敢自动改你代码的底气。</div>

## 第 4 章 · FileWriteTool：写文件也要先读 <span class="oas-b oas-key">重点</span>
<a id="ch4"></a>

Write 是"整文件创建/覆盖"，校验比 Edit 简单，但**同样有"先读"规则**：

```ts
  async validateInput({ file_path, content }, toolUseContext) {
    const readTimestamp = toolUseContext.readFileState.get(fullFilePath)
    if (/* 文件已存在但没读过 */) {
      return { result: false, message: 'File has not been read yet. Read it first before writing to it.' }
    }
    if (/* 读后被改过 */) {
      return { result: false, message: 'File has been modified since read...' }
    }
  }
```

逻辑和 Edit 的关卡三、四一致：**覆盖一个已存在的文件前，必须先读过它、且读后没被改**——防止盲目覆盖掉你不知道的内容。（新建一个不存在的文件则不需要先读。）

call 部分：

```ts
  async call({ file_path, content }, { readFileState, updateFileHistoryState, ... }) {
    await getFsImplementation().mkdir(dir)            // 先建目录（lazy mkdir）
    // ...
    writeTextContent(fullFilePath, content, enc, 'LF') // 写入，换行统一 LF
    // ...
    readFileState.set(fullFilePath, { /* 更新读缓存：刚写的内容现在就是"已读"状态 */ })
  }
```

三个动作：**建目录 → 写文件 → 更新 readFileState**。最后一步很关键——写完顺手把"已读状态"更新成刚写的内容，这样紧接着再 Edit 同一文件就不会被关卡三/四拦（因为"刚写=刚读到最新"）。

<div class="oas-note">注意 <code>readFileState.set</code> 出现在 Write 的 call 里——这就是第 02/03 讲那个 <code>getReadFileCache/setReadFileCache</code> 缓存的写入方之一。三件套都在读写这同一份缓存，缓存是它们协作的中枢。</div>

## 第 5 章 · 为什么只有 Read 是只读 <span class="oas-b oas-key">重点</span>
<a id="ch5"></a>

回收第 2.3 节的伏笔。三件套的只读性：

| 工具 | isReadOnly | 后果（接第 04 讲步5 调度）|
| --- | --- | --- |
| Read | `true` | 可与其它只读工具**并发**执行 |
| Edit | （未声明 true → 非只读）| **串行**执行 |
| Write | （未声明 true → 非只读）| **串行**执行 |

<div class="oas-key-note"><strong>这就是第 04 讲"只读并发、写操作串行"在文件工具上的落地</strong>：模型一轮里若同时要 Read 三个文件，三个 Read 可以并发（互不干扰，都只读）；但若要 Edit 两个文件，必须串行——因为写操作并发可能产生竞态（两个 Edit 同时改、或一个 Edit 和一个 Read 交错导致 readFileState 不一致）。<code>isReadOnly</code> 这个布尔值，就是调度器区分两类工具的唯一依据。第 05 讲讲的"元信息谓词决定调度"，在这里有了最具体的例子。</div>

## 第 6 章 · demo + 重要性盘点 + 下一讲预告 <span class="oas-b oas-skim">收尾</span>
<a id="ch6"></a>

### 6.1 demo：亲历"必须先读"规则

回忆第 00 讲的 examples/03，它的三轮正好踩中本讲规则：

```ts
// Turn 1: 用 Bash 创建文件
await agent.prompt('echo "Hello" > /tmp/oas-test.txt，确认')
// Turn 2: 读回来
await agent.prompt('读取你刚创建的文件，告诉我内容')   // ← 模型在这里 Read，写入 readFileState
// Turn 3: 删除
await agent.prompt('用 Bash 删除那个文件，确认')
```

如果你让模型**跳过 Turn 2 直接 Edit 那个文件**，会发生什么？模型的 Edit 调用会被第 3.3 关挡下，返回 `File has not been read yet`，于是模型会**先自动补一个 Read**，再 Edit。你在事件流里会看到 `Read → Edit` 这样自动配对——这不是模型"懂规矩"，而是工具的校验链强制它这么做。

```text
想直接 Edit 未读文件时的真实事件序列：
  assistant: tool_use Edit(...)         # 模型想直接改
  user:      tool_result "File has not been read yet..."   # 被关卡三拒绝
  assistant: tool_use Read(...)         # 模型只好先读
  user:      tool_result "<带行号的内容>"
  assistant: tool_use Edit(...)         # 这次过了
  user:      tool_result "edited"
```

<div class="oas-note">这个序列把第 04 讲（回合循环）和本讲（校验链）连起来了：<strong>工具返回的错误也是一种 tool_result，会回灌给模型，让它在下一轮自我纠正</strong>。Agent 的"自愈"能力，很大程度来自工具给出的、可操作的错误信息。</div>

### 6.2 重要性盘点

| 内容 | 重要性 | 一句话 |
| --- | --- | --- |
| Edit 校验链（尤其关卡三"必须先读"）| <span class="oas-b oas-core">核心</span> | Agent 安全改代码的根基 |
| Read 的 addLineNumbers | <span class="oas-b oas-core">核心</span> | 行号是 Read↔Edit 协作的基础 |
| readFileState 作为三件套中枢 | <span class="oas-b oas-core">核心</span> | 协作靠共享缓存 |
| Read 输出三态联合 | <span class="oas-b oas-key">重点</span> | 一个工具多形态返回 |
| 只读性决定并发/串行 | <span class="oas-b oas-key">重点</span> | 接第 04 讲调度 |
| maxBytes/Windows 时间戳兜底 | <span class="oas-b oas-skim">可跳读</span> | 对抗离谱输入的健壮性 |

### 6.3 下一讲预告

<div class="oas-key-note"><strong>第 07 讲</strong>：继续工具系列，读<strong>搜索工具 Glob / Grep</strong>。一个核心看点是——Claude Code <strong>不用向量数据库</strong>，而是靠 glob + ripgrep 直接搜代码库（README 明说 "no vector DB needed"）。我们会看到 GlobTool 怎么按模式找文件、GrepTool 怎么封装 ripgrep 做正则搜索、它们为什么也是 <code>isReadOnly</code> 因而可并发，以及"为什么对代码搜索来说，确定性的 ripgrep 比向量检索更合适"。</div>

> 上一讲：[第05讲 · 工具协议与工具池](/2026/06/21/open-agent-sdk-05-tool-protocol/) ｜ 系列目录：[《Open Agent SDK 源码逐行精讲》总目录](/courses/open-agent-sdk/)
