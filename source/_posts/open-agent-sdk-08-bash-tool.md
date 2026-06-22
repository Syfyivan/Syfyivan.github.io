---
title: "《Open Agent SDK 源码逐行精讲》第08讲 · Bash 工具与命令安全：23 道注入检测闸"
date: 2026-06-22 12:00:00
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

> 这是《Open Agent SDK 源码逐行精讲》第08讲。第07讲讲了"找东西"（Glob/Grep），这一讲讲"做事情"——BashTool，Agent 最强也最危险的工具。重点不是"怎么执行命令"，而是**在执行前要过多少道安全闸**，以及这些闸为什么设计成现在这个样子。

<div class="oas-toc"><strong>本讲导航</strong>

- 第 1 章 · Bash 工具全景：三个输入字段，一张执行票
- 第 2 章 · 核心威胁：shell-quote 和 bash 看命令的方式不同
- 第 3 章 · 23 道注入检测闸：`bashSecurity.ts` 逐行
- 第 4 章 · 权限管道：一条命令从输入到 allow/deny/ask 的完整路径
- 第 5 章 · 只读白名单：`readOnlyValidation.ts` 的逐 flag 核验
- 第 6 章 · UI 层杂项：折叠规则、后台执行、sleep 检测

</div>

## 第 1 章 · Bash 工具全景：三个输入字段，一张执行票

### BashTool 的输入 Schema <span class="oas-b oas-core">核心</span>

`BashTool.tsx:228–261` 定义了 Agent 给 Bash 工具传的参数结构：

```typescript
z.strictObject({
  command:               z.string(),              // 必填：要执行的命令
  timeout:               z.number().optional(),   // 可选：超时毫秒（最大 10 分钟）
  description:           z.string().optional(),   // 可选：一句话描述这个命令做什么
  run_in_background:     z.boolean().optional(),  // 可选：是否后台执行
  dangerouslyDisableSandbox: z.boolean().optional(),  // 可选：跳过沙箱
  _simulatedSedEdit:     z.object({...}).optional(),  // 内部字段，不暴露给模型
})
```

<div class="oas-note">字段 <code>_simulatedSedEdit</code> 永远从模型可见的 schema 里剔除。它是 sed 命令权限预览流程的内部字段——如果暴露出去，模型可以直接绕过权限检查写任意文件。这是 schema 层面的安全设计。</div>

`description` 字段的提示词设计值得一看：要求模型用主动语态、不说"complex"/"risk"，把描述写得像给用户看的——因为它真的会显示在权限弹窗里让用户决策。

### `isReadOnly`：只读命令的快捷通道 <span class="oas-b oas-key">重点</span>

权限管道最末端有一步判断：如果命令是只读的，直接放行。"只读"不是靠命令名判断，而是靠 `readOnlyValidation.ts` 里的白名单 + 逐 flag 核验（第5章细讲）。

### UI 层的命令分类

`BashTool.tsx` 在工具输出上方有"折叠"逻辑——某些命令的输出默认折叠显示。分类逻辑靠 `isSearchOrReadBashCommand()`：

| 集合 | 命令 | 折叠标签 |
|---|---|---|
| `BASH_SEARCH_COMMANDS` | find/grep/rg/ag/ack/locate/which/whereis | "搜索了 N 个文件" |
| `BASH_READ_COMMANDS` | cat/head/tail/jq/awk/cut/sort/uniq/wc | "读取了 N 个文件" |
| `BASH_LIST_COMMANDS` | ls/tree/du | "列出了 N 个目录" |
| `BASH_SILENT_COMMANDS` | mv/cp/rm/mkdir/chmod/touch/ln/cd | "完成"（无输出是正常的） |
| `BASH_SEMANTIC_NEUTRAL_COMMANDS` | echo/printf/true/false/: | 透明（不影响整体分类） |

**判定规则**：管道里的所有子命令必须全部属于同一类，才折叠。`echo "---" && ls dir` → 因为有 echo（semantic-neutral）+ ls（list）→ 仍算 list → 折叠。但 `ls && git push` → 有 git push（不属于任何类）→ 不折叠。

---

## 第 2 章 · 核心威胁：shell-quote 和 bash 看命令的方式不同 <span class="oas-b oas-core">核心</span>

理解 `bashSecurity.ts` 为什么这么复杂，先要理解它在防什么。

### 两个解析器，两个世界

Claude Code 用 JavaScript 的 `shell-quote` 库来**解析和验证**命令，但命令实际跑在用户机器的 **bash/zsh** 里。两个解析器对同一段文本的理解可能不一样——这就是"解析差异"，也是攻击面的根源。

```bash
# 例子1：反斜杠转义操作符
cat safe.txt \; echo ~/.ssh/id_rsa
# shell-quote: 看到 \; → 把 ; 当字面量 → 认为是一个命令: cat safe.txt ; echo ...
# bash: 把 \; 也当操作符分隔 → 执行两个命令: cat safe.txt, echo ~/.ssh/id_rsa
# 后果: ~/.ssh/id_rsa 的内容会暴露在命令输出里

# 例子2：大括号展开
git ls-remote {--upload-pack="touch /tmp/pwned",test}
# shell-quote: 把 {...} 当字面量，认为是一个参数
# bash: 展开为两个参数: --upload-pack="touch /tmp/pwned"   test
# 后果: git 执行 touch /tmp/pwned → 任意文件写入
```

<div class="oas-key-note">这就是为什么 bashSecurity.ts 里有 23 种检测，而不是一个简单的"是不是危险命令"判断。每个检测针对的是一种特定的解析差异场景，让 shell-quote 和 bash 对命令的理解最终能对齐。</div>

### 三种结果：allow / ask / passthrough

每个验证函数返回 `PermissionResult`，三种可能：

- `{ behavior: 'allow' }` → 直接放行（早期通过，如空命令）
- `{ behavior: 'ask' }` → 触发权限弹窗，让用户决定
- `{ behavior: 'passthrough' }` → 本检测不管这个命令，继续走下一个

验证链是**短路的**：一旦有检测返回 ask 或 allow，后续检测不再运行。

---

## 第 3 章 · 23 道注入检测闸：`bashSecurity.ts` 逐行 <span class="oas-b oas-core">核心</span>

文件开头定义了检测 ID 枚举（`BASH_SECURITY_CHECK_IDS`），每个 ID 对应一类威胁：

```typescript
const BASH_SECURITY_CHECK_IDS = {
  INCOMPLETE_COMMANDS: 1,         // 命令片段（以 tab/dash/操作符开头）
  JQ_SYSTEM_FUNCTION: 2,          // jq system() 执行任意命令
  JQ_FILE_ARGUMENTS: 3,           // jq -f 读任意文件
  OBFUSCATED_FLAGS: 4,            // flag 混淆（空引号、ANSI-C 引号）
  SHELL_METACHARACTERS: 5,        // 引号里藏 ; | &
  DANGEROUS_VARIABLES: 6,         // $VAR 出现在重定向/管道位置
  NEWLINES: 7,                    // 换行分隔多命令
  DANGEROUS_PATTERNS_COMMAND_SUBSTITUTION: 8,  // $() `` ${}
  DANGEROUS_PATTERNS_INPUT_REDIRECTION: 9,     // < 输入重定向
  DANGEROUS_PATTERNS_OUTPUT_REDIRECTION: 10,   // > 输出重定向
  IFS_INJECTION: 11,              // $IFS 绕过正则验证
  GIT_COMMIT_SUBSTITUTION: 12,    // git commit -m "$(...)" 
  PROC_ENVIRON_ACCESS: 13,        // /proc/*/environ 读环境变量
  MALFORMED_TOKEN_INJECTION: 14,  // 不平衡定界符 + 操作符（HackerOne 漏洞）
  BACKSLASH_ESCAPED_WHITESPACE: 15, // echo\ test 路径穿越
  BRACE_EXPANSION: 16,            // {a,b} 展开绕过
  CONTROL_CHARACTERS: 17,         // 控制字符
  UNICODE_WHITESPACE: 18,         // Unicode 空白字符解析差异
  MID_WORD_HASH: 19,              // foo#bar → shell-quote 当注释，bash 当字面量
  ZSH_DANGEROUS_COMMANDS: 20,     // zmodload/emulate/ztcp 等 Zsh 危险命令
  BACKSLASH_ESCAPED_OPERATORS: 21, // cat \; echo（解析差异）
  COMMENT_QUOTE_DESYNC: 22,       // # 注释里有引号 → 后续 quote tracker 错位
  QUOTED_NEWLINE: 23,             // 引号内换行 + 下一行以 # 开头
}
```

### 核心检测 1：反斜杠转义操作符 <span class="oas-b oas-core">核心</span>

`validateBackslashEscapedOperators`（对应 ID 21）：

```bash
# 攻击场景
cat safe.txt \; echo ~/.ssh/id_rsa

# bash 的行为：\; 是转义分号，仍然是操作符分隔符
# shell-quote 的行为：splitCommand 把 \; 规范化成 ;
#   规范化后再解析时，"cat safe.txt" 和 "echo ~/.ssh/id_rsa" 变成两个独立命令
#   路径检查只验证各自的命令段，echo 拿到 ~/.ssh/id_rsa 后输出其内容
```

函数核心逻辑是一个状态机，逐字符追踪引号状态，发现**双引号外的** `\` 后紧接 `; | & < >` 就返回 `ask`：

```typescript
if (char === '\\' && !inSingleQuote) {
  if (!inDoubleQuote) {
    const nextChar = command[i + 1]
    if (nextChar && SHELL_OPERATORS.has(nextChar)) {
      return true  // 触发 ask
    }
  }
  i++  // 跳过转义字符（双引号内也跳，防止 \\" 错位）
  continue
}
```

<div class="oas-note">注意 i++ 是无条件的（双引号内也跳）。这是为了防止 <code>cat "x\\" \; echo</code> 这种攻击：如果双引号内不跳，<code>\\"</code> 里的 <code>"</code> 会被当成关闭引号，导致后面的 <code>\;</code> 落在 "引号内" 而被忽略。</div>

### 核心检测 2：大括号展开 <span class="oas-b oas-core">核心</span>

`validateBraceExpansion`（ID 16）防御的是真实 HackerOne 漏洞：

```bash
# 攻击 1：基本大括号展开
git ls-remote {--upload-pack="touch /tmp/pwned",test}
# bash 展开 → git ls-remote --upload-pack="touch /tmp/pwned" test
# git 的 --upload-pack 参数会执行那个 shell 命令 → 任意代码执行

# 攻击 2：混合引号欺骗
git diff {@'{'0},--output=/tmp/pwned}
# 原始命令：2 个 {，2 个 }（内部 '{' 是单引号包住的字面量）
# fullyUnquoted 后：{@0},--output=/tmp/pwned} → 1 个 {，2 个 }（不平衡！）
# 我们的深度匹配算法：找到 } 时认为闭合，"只有 @0，没有逗号" → 认为安全
# 但 bash：继续扫，找到 , 后再找 } → 展开成两个参数 → 写入 /tmp/pwned
```

函数两道防线：

1. **不平衡检测**：`unescapedCloseBraces > unescapedOpenBraces` → 说明有被引号吃掉的 `{`，深度匹配不可信 → ask
2. **扫描检测**：找到未转义的 `{`，深度追踪到匹配的 `}`，在最外层检查是否有 `,` 或 `..` → 有就 ask

### 核心检测 3：flag 混淆 <span class="oas-b oas-core">核心</span>

`validateObfuscatedFlags`（ID 4）防御的是通过引号拼接隐藏危险 flag：

```bash
# 普通混淆：空引号拼接
find . ''-exec sh -c 'evil' {} \;
# bash 把 '' 当空字符串，与 -exec 拼接 → 变成 -exec

# 高级混淆：ANSI-C 引号
find . $'-exec' sh -c 'evil' {} \;
# $'...' 是 ANSI-C 引号，可以编码任意字符（\n \x41 等）

# 更隐蔽的：多层引号拼接
find . "-"exec sh -c 'evil' {} \;
find . """-exec" sh -c 'evil' {} \;
```

检测分多层：

```typescript
// 层 1：ANSI-C 引号 $'...' → 直接 ask
if (/\$'[^']*'/.test(originalCommand)) return { behavior: 'ask', ... }

// 层 2：locale 引号 $"..." → 直接 ask
if (/\$"[^"]*"/.test(originalCommand)) return { behavior: 'ask', ... }

// 层 3：空引号+横杠 ''-  ""- → ask
if (/(?:^|\s)(?:''|"")+\s*-/.test(originalCommand)) return { behavior: 'ask', ... }

// 层 4：同类空引号紧跟引号横杠 ("""-f") → ask
if (/(?:""|'')+['"]-/.test(originalCommand)) return { behavior: 'ask', ... }

// 层 5：词首连续三个引号 '''  """ → ask
if (/(?:^|\s)['"]{3,}/.test(originalCommand)) return { behavior: 'ask', ... }

// 层 6：空格+引号开头包含 -xxx 的内容 → ask（主循环逐字符追踪）
```

### 核心检测 4：Zsh 危险命令 <span class="oas-b oas-core">核心</span>

`validateZshDangerousCommands`（ID 20）专门针对 Zsh 独有的绕过途径：

```typescript
const ZSH_DANGEROUS_COMMANDS = new Set([
  'zmodload',  // 加载 zsh 危险模块的入口（zsh/mapfile、zsh/net/tcp 等）
  'emulate',   // 带 -c 等价于 eval
  'sysopen', 'sysread', 'syswrite', 'sysseek',  // 原始文件 I/O（zsh/system 模块）
  'zpty',      // 伪终端执行命令（zsh/zpty 模块）
  'ztcp',      // TCP 连接（数据外泄）（zsh/net/tcp 模块）
  'zsocket',   // Unix/TCP socket
  'zf_rm', 'zf_mv', 'zf_ln', 'zf_chmod', ...  // 内建文件操作，绕过二进制检查
])
```

<div class="oas-note">这些命令本身不危险，危险的是它们能以"内建函数"的方式执行文件读写、网络连接，而二进制层面的权限检查看到的是 zsh 本身，不是这些操作。</div>

### 核心检测 5：安全 heredoc 例外 <span class="oas-b oas-key">重点</span>

`validateSafeCommandSubstitution` 是检测链里罕见的**早期放行**路径。

问题：Agent 经常需要这样写文件：

```bash
cat <<'EOF' > /tmp/config.json
{"key": "value"}
EOF
```

这个命令包含 `$(` 后跟 `<<`，会触发 `validateDangerousPatterns`。但这个模式本身是安全的——`$(cat <<'DELIM'...DELIM)` 里的 heredoc 是**字面量内容**，不会被 bash 二次展开。

函数 `isSafeHeredoc()` 做了严格的结构验证：

1. 分隔符必须被单引号或反斜杠包裹（`<<'EOF'` 或 `<<\EOF`）→ 保证 heredoc 体是字面量
2. 关闭分隔符必须在独占一行上（精确的行扫描，不用 regex `[\s\S]*?`）→ 防止提前闭合攻击
3. heredoc 范围内不能有嵌套的 heredoc（防止索引错位）
4. `$()` 必须在**参数位置**（前面有命令词）→ 防止 heredoc 体成为命令名
5. 去掉 heredoc 后的剩余文本要通过安全字符集检查，且递归通过所有其他验证

<details class="oas-fold"><summary>其余 18 种检测概览 <span class="oas-b oas-skim">可跳读</span></summary>

| 检测 | 触发条件 | 典型场景 |
|---|---|---|
| `validateEmpty` | 命令为空 | 直接放行（allow） |
| `validateIncompleteCommands` | 以 tab/dash/操作符开头 | Agent 生成的命令片段 |
| `validateGitCommit` | `git commit -m "..."` 安全模式 | 早期放行（skip 后续） |
| `validateJqCommand` | `jq system()` 或 `jq -f/--from-file` | jq 执行代码/读任意文件 |
| `validateShellMetacharacters` | 引号参数内含 `;|&` | `find -name "*.txt;evil"` |
| `validateDangerousVariables` | `$VAR` 在重定向/管道位置 | `cat file > $OUTPUT_PATH` |
| `validateDangerousPatterns` | 裸反引号/`$()`/`${}`/`$[]/~[` | 命令替换 |
| `validateRedirections` | 未在白名单内的 `<` 或 `>` | 读/写任意文件 |
| `validateNewlines` | 非连续行（`\<newline>` 行续是安全的） | 多行命令隐藏第二个命令 |
| `validateCarriageReturn` | `\r` 出现在非双引号内 | `TZ=UTC\recho curl evil.com` 解析差异 |
| `validateIFSInjection` | `$IFS` 或 `${...IFS...}` | 修改分隔符绕过正则 |
| `validateProcEnvironAccess` | `/proc/*/environ` | 读进程环境变量（含 API key） |
| `validateMalformedTokenInjection` | 不平衡定界符 + 命令分隔符 | HackerOne eval bypass |
| `validateBackslashEscapedWhitespace` | `\<space>` 或 `\<tab>` | `echo\ test/../../../usr/bin/touch` |
| `validateUnicodeWhitespace` | Unicode 空白（  等） | 隐藏额外词 |
| `validateMidWordHash` | 非词首的 `#`（如 `foo#bar`） | shell-quote 当注释，bash 当字面量 |
| `validateCommentQuoteDesync` | `#` 注释行里有引号 | 后续引号 tracker 状态被污染 |
| `validateQuotedNewline` | 引号内换行 + 下一行以 `#` 开头 | `mv './decoy'\n#' ~/.ssh/id_rsa` 隐藏路径 |

</details>

---

## 第 4 章 · 权限管道：一条命令从输入到 allow/deny/ask <span class="oas-b oas-core">核心</span>

`bashPermissions.ts` 的 `bashToolHasPermission()` 是 Bash 工具最核心的函数，承担最终权限裁决。

### 完整的权限流（8 步）

```
输入: { command: "npm run build" }
 │
 ▼
[0] Tree-sitter AST 解析（如果可用）
 │   ├─ too-complex → 检查 deny 规则 → ask（终止）
 │   ├─ simple → checkSemantics → 如 ok 则继续（携带 astSubcommands）
 │   └─ parse-unavailable → 走旧版 shell-quote 预检
 │
 ▼
[1] 沙箱自动放行检查（仅当沙箱+autoAllow 都开启时）
 │   ├─ 有 deny 规则 → deny（终止）
 │   └─ 无规则 → allow（终止）
 │
 ▼
[2] 精确匹配检查
 │   ├─ deny 规则命中 → deny（终止）
 │   ├─ ask 规则命中 → ask（终止）
 │   └─ allow 规则命中 → 暂存，继续到 [4]
 │
 ▼
[3] Bash 提示词分类器（Haiku 模型，并行运行 deny + ask）
 │   ├─ deny 分类器命中（高置信度）→ deny（终止）
 │   └─ ask 分类器命中 → ask（终止）
 │
 ▼
[4] 拆分子命令（splitCommand 或 astSubcommands）
 │   对每个子命令运行 checkCommandAndSuggestRules：
 │     [4a] 精确规则匹配 → deny/ask/allow（终止）
 │     [4b] 前缀/通配规则匹配 → deny/ask（终止）
 │     [4c] 路径约束检查（checkPathConstraints）→ 越界 → ask
 │     [4d] 无 tree-sitter 时：bashCommandIsSafeAsync（23 道注入检测）→ 触发 → ask
 │     [4e] allow 规则命中 → allow（终止）
 │     [4f] sed 约束检查 → 危险 sed → ask
 │     [4g] 模式权限检查（acceptEdits/auto 等）
 │     [4h] isReadOnly → allow（终止）
 │     [4i] passthrough → 弹窗（终止）
```

### `stripSafeWrappers`：剥除包装命令 <span class="oas-b oas-key">重点</span>

规则匹配前，命令会被"剥皮"——去掉对匹配没意义的包装层：

```bash
# 用户有规则：Bash(npm install:*)
# 命令：NODE_ENV=production timeout 60 npm install foo

stripSafeWrappers("NODE_ENV=production timeout 60 npm install foo")
# 步骤1（环境变量）：NODE_ENV 在 SAFE_ENV_VARS 白名单 → 去掉 → "timeout 60 npm install foo"
# 步骤2（包装命令）：timeout 60 匹配 SAFE_WRAPPER_PATTERNS → 去掉 → "npm install foo"
# 最终匹配 Bash(npm install:*) → allow
```

`SAFE_ENV_VARS` 白名单严格限制什么变量可以被剥除（不能影响代码执行）：

```typescript
// 允许剥除（不改变执行行为）
NODE_ENV, RUST_LOG, GOOS, GOARCH, LANG, TZ, TERM, ...

// 禁止剥除（会影响执行）
PATH        // 修改可执行文件查找路径
LD_PRELOAD  // 注入共享库
PYTHONPATH  // 修改模块搜索路径
NODE_OPTIONS // 可以携带 --require 等代码执行 flag
```

<div class="oas-key-note">deny 规则用 <code>stripAllLeadingEnvVars</code>（更激进的剥除），不受 SAFE_ENV_VARS 限制。原因：用户明确 deny 了某个命令，就应该拦住 <code>FOO=bar denied_command</code> 这种所有变体。allow 规则才需要保守——如果 <code>DOCKER_HOST=evil.com</code> 被剥除，<code>Bash(docker ps:*)</code> 就会放行指向攻击者服务器的 docker 命令。</div>

### deny > ask > allow 的优先级

权限管道里，**deny 永远优先于 ask，ask 优先于 allow**。即使是沙箱自动放行路径，也要先逐一检查每个子命令的 deny 规则：

```typescript
// bashPermissions.ts:1296–1336 的复合命令 deny 检查
const subcommands = splitCommand(command)
if (subcommands.length > 1) {
  let firstAskRule
  for (const sub of subcommands) {
    const subResult = matchingRulesForInput(...)
    if (subResult.matchingDenyRules[0]) return { behavior: 'deny', ... }  // 立即返回
    firstAskRule ??= subResult.matchingAskRules[0]                        // 暂存第一个 ask
  }
  if (firstAskRule) return { behavior: 'ask', ... }
}
```

---

## 第 5 章 · 只读白名单：`readOnlyValidation.ts` 的逐 flag 核验 <span class="oas-b oas-key">重点</span>

`isReadOnly` 不是靠命令名判断，而是白名单 + flag 核验。核心结构是 `CommandConfig`：

```typescript
type CommandConfig = {
  safeFlags: Record<string, FlagArgType>   // flag → 参数类型（none/string/number/path）
  regex?: RegExp                           // 额外的正则验证
  additionalCommandIsDangerousCallback?    // 自定义验证逻辑
  respectsDoubleDash?: boolean             // 是否遵从 -- 结束 flag 的约定
}
```

以 `fd`（现代 find 替代品）为例，它的 safe flags 里**故意没有**：

```typescript
// -x/--exec 和 -X/--exec-batch：对每个搜索结果执行任意命令
// -l/--list-details：内部调用 ls 子进程（PATH 劫持风险）
```

<div class="oas-why">为什么 <code>-l/--list-details</code> 不安全？因为 fd 的这个 flag 是 fork+exec 一个新的 <code>ls</code> 进程，而不是内建实现。如果 PATH 被篡改，这个 "ls" 可以是任意程序。</div>

### 多个命令族的覆盖范围

文件里给不同命令族定义了只读命令集合：

```typescript
GIT_READ_ONLY_COMMANDS        // git log/status/diff/show/branch/... (读，不含 push/commit)
GH_READ_ONLY_COMMANDS         // gh pr view/list/... (只读 GitHub 操作)
DOCKER_READ_ONLY_COMMANDS     // docker ps/inspect/logs/images/...
RIPGREP_READ_ONLY_COMMANDS    // rg 及其所有安全 flag
EXTERNAL_READONLY_COMMANDS    // ls/cat/head/tail/wc/find/fd/... 等通用工具
PYRIGHT_READ_ONLY_COMMANDS    // pyright 类型检查（只分析不修改）
```

每个命令在白名单里不只是"可以跑"，还精确列出了哪些 flag 是安全的。flag 核验通过 `validateFlags()` 函数，逐 flag 检查类型（none/string/number/path）。

---

## 第 6 章 · UI 层杂项 <span class="oas-b oas-skip">非核心</span>

<details class="oas-fold"><summary>后台执行、sleep 检测、进度显示等 UI 细节</summary>

### 后台执行的判断逻辑

`run_in_background: true` 时命令后台跑，但有特例：

```typescript
const DISALLOWED_AUTO_BACKGROUND_COMMANDS = ['sleep']
// sleep 不允许自动后台化——sleep 本身就是前台等待工具
```

`COMMON_BACKGROUND_COMMANDS`（npm/yarn/python/docker/webpack/vite 等）是"自动后台"候选池，当 Agent 在 assistant 模式且命令跑超 `ASSISTANT_BLOCKING_BUDGET_MS`（15 秒）时，会自动挂到后台。

### sleep 检测

`detectBlockedSleepPattern()` 检测 Agent 用 `sleep` 做轮询的反模式：

```typescript
// 触发场景
"sleep 30 && check_status.sh"  →  建议用 Monitor 工具
"sleep 5"                      →  建议直接说"等什么"

// 不触发
"sleep 0.5"    // 亚秒级 sleep 是正常的节奏控制
"sleep 1"      // 小于 2 秒不拦截
```

### 进度显示阈值

```typescript
const PROGRESS_THRESHOLD_MS = 2000  // 超过 2 秒才显示进度条
const ASSISTANT_BLOCKING_BUDGET_MS = 15_000  // 超过 15 秒主动后台化
```

</details>

---

## 小结

| 层 | 文件 | 核心职责 |
|---|---|---|
| 工具定义 | `BashTool.tsx` | inputSchema / 命令分类 / 执行调度 |
| 注入检测 | `bashSecurity.ts` | 23 道 parser-differential 检测 |
| 权限管道 | `bashPermissions.ts` | deny>ask>allow / 规则匹配 / wrapper 剥除 |
| 只读核验 | `readOnlyValidation.ts` | 命令族白名单 + 逐 flag 类型检验 |

**设计核心**：Bash 工具的安全不依赖"知道哪些命令是危险的"，而是依赖"让验证器（JS）和执行器（bash）对同一命令的理解完全对齐"。23 道检测，每道针对一种已知的解析差异；三级权限规则（deny/ask/allow），每级都有严格的剥除和匹配逻辑。这是一个真实工业级的纵深防御系统。

---

下一讲（第09讲）：**系统提示与上下文构建 `context.ts`** — `getSystemContext` 如何把 CLAUDE.md、工具描述、当前状态拼接成最终的系统提示；哪些部分走缓存、哪些每轮重建。

> 配套源码：[github.com/Syfyivan/open-agent-sdk](https://github.com/Syfyivan/open-agent-sdk)，本讲对应文件：`src/tools/BashTool/`（`BashTool.tsx`、`bashSecurity.ts`、`bashPermissions.ts`、`readOnlyValidation.ts`）。
