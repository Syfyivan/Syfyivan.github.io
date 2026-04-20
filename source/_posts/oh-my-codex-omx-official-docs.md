---
title: Oh My Codex（OMX）官方文档全解析
date: 2026-04-20
tags: [OMX, Codex, AI编程, 开发工具]
categories: [工具使用]
---

## Getting Started（快速上手）

### Introduction（简介）

Oh My Codex（简称 **OMX**）的定位是：把 Codex CLI 变成一个“可编排的操作层（operating layer）”。它通过自治研究（autonomous research）、编排包装（orchestration wrappers）、团队 worktree、以及“意图优先（intent-first）”的深度访谈（deep interview），把原本偏“单次对话/单次任务”的 Codex CLI，升级成更适合长时间、多阶段、高并发协作的工程执行环境。

文档版本为 **v0.14.0**。该版本重点包括：

- **安全加固（Security hardening）**：对标识符路径、HUD 辅助 git 命令、通知回复注入等表面做了更严格的输入保护，并补齐依赖漏洞（例如 `npm audit fix` 处理传递依赖 CVE）。
- **Stop-hook 持久化（Stop-hook persistence）**：保证 Codex 原生 Stop 自动提醒（auto-nudge）能持续工作；同时在 OMX 的“进行中工作流”里继续拦截 Stop，直到真正结束。
- **Ralph 安全（Ralph safety）**：收敛“随口提到 ralph 就启动状态”的误触发；恢复时更稳定，防止无限重试。
- **默认质量优先（Quality-first defaults）**：内置的 prompts/AGENTS 默认更强调证据、验证和质量门禁。

当前命令面（示例）：

```bash
omx setup          # 刷新/重装原生 hook wiring
omx team 3:executor "parallel task"
omx deep-interview "feature idea"
```

一些关键卖点：

- **原生 hooks**：PreToolUse/PostToolUse 按 Codex runtime 合同触发，无需 shim。
- **团队加固**：Leader mailbox、nudge 投递、pane 状态在 live flow 中更可靠。
- **规范的流水线**：deep-interview → ralplan → team/ralph 的“质量优先”执行链路。

此外，OMX 维护了一个较完整的 prompt/skill 生态：

- **33 个 Agent Prompts**：覆盖构建、review、领域专家、产品协作等。
- **36 个 Skills**：覆盖 autopilot、review、编排、通知、研究、恢复等工作流。
- **5 个 MCP Servers**：把状态、记忆、代码智能、团队编排、trace 可见性统一到一个操作界面。

---

## Release Notes（版本更新）

### Quick Summary

最近的版本在“操作闭环（operator loop）”上做了更强约束：自治研究、编排包装、团队 worktree 默认开启、意图优先的深访、以及增量 merge 跟踪（incremental merge tracking）。

### v0.14.0 — Security, Stop-Hook & Ralph Safety Patch

主要变化：

- **安全加固**：
  - 关闭 identifier 的路径穿越（path traversal）
  - HUD git helpers 拒绝 shell/regex 元字符
  - reply acknowledgements 会对多段 secrets 做脱敏
  - `npm audit fix` 修复传递依赖 CVE
- **Stop-hook 持久化正确性**：原生 Stop auto-nudge 不再被 OMX runtime gate；但 active OMX 工作流仍会拦 Stop，直到真的结束。
- **Ralph 激活与恢复**：
  - 仅对话提及 ralph 不再写入 workflow state
  - continuation recovery 期间 Ralph 状态更可见
  - steer-lock 的重试次数被限制
- **Explore 重入保护**：`omx explore` 在 shell-startup re-entry 时 fail-closed；allowlist wrappers 不再自解析。
- **Worker runtime identity**：通过一条可审计的验证路径，在 startup/scaling 过程中保留 worker 的 role identity。
- **Hooks & state**：notify-hook routing 分叉、watcher PID 存活检查、tmux extended-keys stale-lock 恢复、MCP duplicate-sibling 清理、基于 `.omx` 的 project-root 发现、AGENTS.md 在 auto-update 时保留。
- **Skill UX**：Analyze skill 恢复为只读调查入口；OMX 安装的 skills 在 `/skills` 里会被标记但不改名；补充 Shift+Enter tmux triage 文档。

Patch release。发布日期：2026-04-18。

### v0.13.1 — Team Status & Worker PID Patch

- **team status JSON**：Leader mailbox pruning 不再导致重复的 delivered-message bridge call，确保 `omx team status --json` 可解析。
- **worker PID 元数据**：交互式 team workers 会从 pane id 解析 PID 并持久化进 config/identity state。
- **release alignment**：Node、Cargo、changelog、release collateral 元数据同步。

Patch release。发布日期：2026-04-07。

### v0.12.0 — Native Hooks, Bash Guidance & Runtime Hardening

- **原生 Codex hooks**：hook 所有权通过 repo/runtime 合同落在 `.codex/hooks.json`（非 team OMX session）。
- **Bash guidance**：提供 first-party PreToolUse/PostToolUse 的风险提示和错误修复指导。
- **Team runtime**：投递、mailbox 处理、pane 状态可见性、next-action steering 更鲁棒。
- **Windows/tmux**：启动可靠性提升；detached launches 与 PowerShell resolution 更安全。
- **质量优先默认值**：prompts/AGENTS 强调 evidence-backed execution。
- **文档重整**：README/docs 扩展并整理到 `docs/readme/`（15 语言）。

185 个变更文件，65 个非 merge commit，26 个 merge commit。发布日期：2026-04-06。

### v0.11.13 — Team Delivery Integrity & Windows Stability

- mailbox delivery 更稳定
- busy leader panes 能收到 queued nudges
- Windows/worktree 下 HUD targeting 与 leader activity polling 更可靠
- deep-interview locks 的 fallback nudges 更一致
- uninstall 提示 legacy skills；shutdown 清理 detached worker descendants 更安全

Patch release。发布日期：2026-04-04。

### v0.11.12 / v0.10.0 — Autonomous Research & Team Worktrees

这两次发布的核心共同点：

- **autoresearch**：`omx autoresearch` 会迭代探索主题并在达成目标后自终止。
- **exec wrapper**：`omx exec` 通过 OMX 编排层运行命令（带上下文与协调）。
- **team worktrees**：团队 worker 默认在隔离 worktree 中运行，避免写冲突。
- **intent-first deep interview**：先进行意图分类，再进入 Socratic interview。
- **incremental merge tracking**：基于 diff 的冲突检测与增量合并感知更聪明。

（文档中给出的统计：v0.10.0 为 54 commits、26 PRs、105 files changed，+7581/−388 lines，发布日期：2026-03-15。）

### v0.9.0 — Spark Initiative

- 新增 `omx explore`：默认的只读探索入口，带受限 allowlists。
- 新增 `omx sparkshell`：shell-native 执行 + 自适应摘要 + tmux pane capture。
- 新增 `omx resume`：从终端恢复之前的交互式 Codex session。
- release 产物：`omx-explore-harness`、`omx-sparkshell` 的 native archives，manifest-based hydration。
- 验证流水线：`npm run build:full`、`npm run test:explore`、`npm run test:sparkshell`、packed-install smoke checks。

---

## v0.12.x Feature Guides（功能速查）

这一部分是 v0.7~v0.9 的主要“操作面”快速参考：从动态扩容、共识规划，到原生探索、通知集成。

### Dynamic Team Worker Scaling（动态扩容/缩容）

- Phase 1 支持在 team 运行时手动 `scale_up` / `scale_down`。
- 通过 `OMX_TEAM_SCALING_ENABLED=1` 打开。
- `scale_down` 会在移除前安全 drain；扩缩容操作有锁，避免并发重叠。

### RALPLAN-DR 共识规划

- `$ralplan` 是 `$plan --consensus` 的缩写。
- 工作流采用 Planner → Architect → Critic，并输出结构化的 RALPLAN-DR 总结。
- 默认 short consensus；高风险任务（安全、迁移、破坏性操作、公有 API 变更）推荐加 `--deliberate`。

### OpenClaw 集成

- 可以在 `notifications.openclaw` 下配置，或通过通用 command/webhook aliases。
- 设置 `OMX_OPENCLAW=1` 走 dispatch path；如果要命令网关，还需要 `OMX_OPENCLAW_COMMAND=1`。
- 常见 hook events：`session-start`、`session-idle`、`ask-user-question`、`session-stop`、`session-end`。

完整指南（原文链接）：https://github.com/Yeachan-Heo/oh-my-codex/blob/main/docs/openclaw-integration.md

### Worktree Orchestration（worktree 编排，v0.10.0 默认开启）

从 v0.10.0 起，team workers **默认**运行在隔离 git worktree：`--worktree` flag 被视为 no-op（始终开启）。

#### How It Works（工作原理）

- leader 需要干净 workspace（commit 或 stash）再启动 `omx team`。
- 每个 worker 会被 provisioning 到 `.omx/team/<name>/worktrees/worker-N`。
- worker 在自己的 worktree 提交；leader 持续把 worker commits 增量集成回 leader branch。
- shutdown 会回滚 provisioning 的 worktrees 并删除 branches。

#### Incremental Merge Strategies（增量合并策略）

集成引擎会自动选择：

- **Merge（`--no-ff -X theirs`）**：worker cleanly ahead。
- **Cherry-pick**：历史分叉时挑单个提交。
- **Cross-worker rebase**：跨 worker 顺序依赖时，把一个 worker 的分支 rebase 到另一个 worker 已集成状态。

冲突会提前被检测并写入 `.omx/state/team/<team>/integration-report.md`（按文件粒度）。

#### Worker Commit Protocol（worker 提交约定）

worker 必须在上报完成前提交：

```bash
git add -A && git commit -m "task: <subject>"
```

runtime 会在 worker 忘记提交时 auto-commit 兜底，但官方推荐显式提交。

#### 示例

```bash
# worktrees 默认自动开启，无需任何 flags
omx team 3:executor "implement feature X"

# 查看 worker worktree 状态
omx team status <team-name>
# 输出包含：worktree_path, worktree_branch, worktree_detached

# 混合 provider：所有 worker 一样会使用 worktrees
OMX_TEAM_WORKER_CLI_MAP=codex,claude,gemini omx team 3:executor "full-stack work"
```

#### Cross-Worktree State Resolution（跨 worktree 的状态解析）

- Team state root 从 leader cwd 解析（`<leader-cwd>/.omx/state`），并通过 `OMX_TEAM_STATE_ROOT` 共享给各 worktree。
- dispatch、task claims、mailbox delivery、lifecycle updates 在所有 worktree 保持一致。
- worker identity 文件会记录 `worktree_path`、`worktree_branch`、`worktree_detached`、`worktree_created`，方便观测。

### Gemini-Powered Teams（Gemini 驱动的团队）

- OMX Team mode 完整支持 **Gemini CLI** worker。
- 可利用 Gemini 更大的上下文窗口与推理能力做复杂架构规划与全仓重构。
- 可以在同一个 team 混合 Codex + Claude + Gemini，做“best-of-breed”编排。

配置方式：

- `OMX_TEAM_WORKER_CLI_MAP=codex,claude,gemini`

运行示例：

```bash
# 1) 启动混合 provider team
export OMX_TEAM_WORKER_CLI_MAP=codex,claude,gemini
omx team 3:executor "full-stack implementation"

# 2) 强制所有 workers 用 Gemini
export OMX_TEAM_WORKER_CLI=gemini
omx team 2:architect "large-scale architectural review"

# 3) 传入明确的 Gemini model
export OMX_TEAM_WORKER_LAUNCH_ARGS="--model gemini-2.0-flash-exp"
omx team 1:executor "experimental feature"
```

Gemini worker 行为注记：

- **prompt-interactive startup**：启动时会用 `--approval-mode yolo -i "..."` 预置初始 prompt，确保 tmux bring-up 稳定。
- **model filtering**：启动 Gemini worker 时会过滤掉非 Gemini 默认模型（例如 Spark），避免 provider/model mismatch。
- **context advantage**：建议把需要“大上下文/长文综合”的任务交给 Gemini worker。

---

## Installation（安装）

```bash
# 1) 全局安装
npm install -g oh-my-codex

# 2) 执行 setup
omx setup

# 3) 验证安装
omx doctor
```

---

## Quick Start（快速开始）

OMX 通过“Magic Keywords（魔法关键词）”和 `$skill` 命令检测你的意图：你只要描述想要什么，它会引导进入对应工作流。

示例：

```text
# 在 Codex CLI 内：
/prompts:architect "analyze current auth boundaries"
/prompts:executor "implement input validation in login"
$plan "ship OAuth callback safely"
$team 3:executor "fix all TypeScript errors"

# 在终端：
omx team 4:executor "parallelize a multi-module refactor"
omx team status <team-name>
omx team shutdown <team-name>
```

常见入口：

- **Autonomous Building**：`"autopilot build a React dashboard"` —— 从想法到代码的全自动执行。
- **Refactoring**：`"ralph refactor the API"` —— 持久模式直到验证干净（“石头永不停”）。
- **Parallel Work**：`"ulw fix all errors"` —— 多 agent 并行。
- **tmux Teams**：`"team 5:executor refactor backend"` —— leader pane 协调 5 个 agent。
- **Planning**：`"plan the auth system"` —— 进入交互式规划访谈。

---

## Why OMX（为什么需要 OMX）

Codex CLI 很适合“直接执行单个任务”。但当工作规模变大（多阶段、多文件、多目标、多 agent 并行）时，OMX 提供了结构化能力：

- **拆解与分阶段执行**：通过 `team-plan → team-prd → team-exec → team-verify → team-fix` 管理。
- **可恢复的 mode 生命周期状态**：持久化在 `.omx/state/`，支持 resume。
- **记忆 + notepad 表面**：为长会话提供独立的“可持续记忆”。
- **操作控制**：更细粒度的启动、验证、取消等控制面。

---

## Architecture（架构）

### Conductor Philosophy（指挥家哲学）

OMX 的核心原则是：**你是指挥家（conductor），不是演奏者（performer）。**

#### Golden Rule

- 永远不要直接改代码。
- 永远委派给专门 agent。

你的角色是：引导、review、编排。agent 分工明确：**architect**看大局、**executor**写代码、**verifier**提供可证明的证据。遵守分工有助于质量提升。

### Agent Tiers & Catalog（Agent 分层与目录）

OMX 将 30+ 专用 agent 分到不同功能“泳道（lane）”，通过 `/prompts:name` 调用。

**Build & Analysis（构建与分析）**

- explore：Search
- planner：Sequence
- architect：Design
- executor：Code
- debugger：Fix
- verifier：Evidence

**Review Lane（评审泳道）**

- code-reviewer
- security-reviewer
- performance-reviewer
- api-reviewer
- style-reviewer

**Domain Specialists（领域专家）**

- dependency-expert
- test-engineer
- git-master
- designer
- researcher

**Product & Coordination（产品与协调）**

- product-manager
- ux-researcher
- critic：Challenge
- vision：Images

### Team Architecture（团队架构）

OMX 在 tmux 下用“分阶段流水线”管理 team，确保质量门禁（quality gates）。

阶段：`team-plan → team-prd → team-exec → team-verify → team-fix`

转换条件（原文表格翻译）：

- team-plan → team-prd：规划与拆解完成
- team-prd → team-exec：验收标准已明确
- team-exec → team-verify：所有任务到达终态
- team-verify → team-fix / complete：基于验证结果
- team-fix → team-exec / team-verify：修复策略已定义

### Model Routing（模型路由）

OMX 会根据复杂度选择合适的模型层级，平衡成本和能力：

- **Simple**：Spark —— 查找、格式化、简单文档（“这个函数返回什么？”）
- **Standard**：Default —— 实现、测试、重构（“加错误处理”）
- **Complex**：xhigh reasoning —— 架构、深度 debug、规划（“重构鉴权系统”）

### Delegation Rules（委派规则）

- **应该委派**：多文件实现、重构、debug、review、规划、研究、验证。
- **可以自己做**：小澄清、快速状态检查、单命令操作；对 `.omx/`、`.codex/` 这类配置文件可以直接写。

---

## Execution Modes（执行模式）

### Autopilot

旗舰模式：从想法到交付代码的全自动执行，并带自纠正闭环。

- Expansion（Analyst + Architect）
- Planning（Architect + Critic）
- Execution（Ralph + Ultrawork）
- QA Cycling（UltraQA）

### Ralph

持久模式：“The boulder never stops.”（石头永不停）—— 会一直工作直到 Architect 验证目标达成。

- 无限持久循环
- 自动包含 Ultrawork
- 强验证要求

### Ultrawork（ulw）

最大化并行：积极把子任务委派给多个后台 agent。

- 最多 5+ 并发 agent
- 智能模型路由
- 非阻塞后台执行

### Team Compositions（团队编排模板）

从 v0.10.0 起，所有 team composition **默认**隔离 worktree。

- **Feature Dev**：analyst → planner → executor → test-engineer → verifier
- **Bug Fix**：explore → debugger → executor → verifier

---

## Tools & Config（工具与配置）

### MCP Tools

**State & Runtime**

- State tools：`state_read`、`state_write`、`state_clear`（管理执行模式状态）
- Notepad：`notepad_read`、`notepad_write_priority`、`notepad_write_working`、`notepad_write_manual`

**Code Intelligence**

- LSP Tools：`lsp_hover`、`lsp_goto_definition`、`lsp_find_references`、`lsp_diagnostics`、`lsp_rename`
- AST Grep：`ast_grep_search`、`ast_grep_replace`（结构化重构）

**Utilities**

- Python REPL：为数据分析提供持久环境

#### MCP workingDirectory policy（可选硬化）

默认情况下，MCP state/memory/trace tools 接受调用方提供的 `workingDirectory`。如需更强安全边界，可设置根目录 allowlist：

```bash
export OMX_MCP_WORKDIR_ROOTS="/path/to/project:/path/to/another-root"
```

设置后，不在 allowlist roots 内的 `workingDirectory` 会被工具拒绝。

### Skills & Commands（技能与命令）

文档给了一个“关键词 → 描述 → 示例”的表：

- `autopilot`：自治执行，例如 `"autopilot build a login page"`
- `ralph`：持久模式，例如 `"ralph refactor the API"`
- `ulw`：并行（Ultrawork），例如 `"ulw fix these 5 bugs"`
- `$team`：tmux team workers，例如 `"$team 3:executor build it"`
- `plan`：规划，例如 `"plan the migration"`
- `$ralplan`：共识规划，例如 `"$ralplan the API"`

在 Codex CLI 内，skills 用 `$name` 调用；agent prompts 用 `/prompts:name` 加载。

Utility skills：`$cancel`、`$note`、`$hud`、`$omc-doctor`。

### State & Memory（状态与记忆）

#### Notepad System

位置：`.omx/notepad.md`，用于在上下文裁剪（context pruning）后依然保留“韧性记忆”。

- **Priority**：总会注入上下文
- **Working**：7 天后自动裁剪
- **Manual**：永不裁剪

#### Project Memory

位置：`.omx/project-memory.json`，用于存储技术栈、约定、架构指令。

### Configuration（配置）

运行 `omx setup` 配置默认值；可通过 `--scope user` 或 `--scope project` 控制安装位置。

worktree 路径（原文列举）：

- `.omx/state/`：mode state files
- `.omx/logs/`：audit logs
- `.omx/plans/`：planning documents

---

## CLI Reference（命令行参考）

`omx` 是一个命令行工具，用于从终端启动、配置和管理 OMX。

### Getting Started

- Install：`npm install -g oh-my-codex`
- Launch：`omx`（在 tmux 启动带 HUD 的 Codex CLI）
- Setup：`omx setup`
- Doctor：`omx doctor`
- Resume：`omx resume`

示例：

```bash
npm install -g oh-my-codex
omx
omx setup
omx doctor
omx resume
omx --xhigh --madmax
```

Tip：如果追求最大能力，可使用 `omx --xhigh --madmax`。

### Core Commands（核心命令）

（按原文表格翻译）

- `omx`：启动 Codex CLI（HUD 自动 attach 到 tmux）
- `omx setup`：安装 skills、prompts、MCP servers、AGENTS.md（支持 `--scope user|project`）
- `omx agents-init .`：为仓库或子树 bootstrap 轻量 `AGENTS.md`
- `omx doctor`：检查安装健康；`--team` 做 worker 诊断
- `omx ask <provider>`：直接查询 advisor（claude|gemini），支持 `--agent-prompt <name>`
- `omx resume`：从终端恢复之前的交互式 session
- `omx explore`：默认只读探索入口；必要时会 route 到 sparkshell
- `omx sparkshell`：显式 shell-native inspection，支持自适应摘要和 tmux pane capture
- `omx team`：在 tmux 中 spawn/status/resume/shutdown 并行 worker panes
- `omx ralph`：启动 Codex 并激活 ralph persistence mode
- `omx status`：展示 active modes 与执行状态
- `omx cancel`：取消 active execution modes（autopilot、team 等）
- `omx hud`：查看 runtime HUD state（watch/json/preset 视图）
- `omx reasoning [mode]`：显示/设置推理强度（low|medium|high|xhigh）
- `omx version`：版本信息
- `omx help`：帮助

### Launch Flags（启动参数）

- `--yolo`：yolo mode
- `--high / --xhigh`：推理强度快捷参数
- `--madmax`：危险：绕过 Codex approvals 和 sandbox
- `--spark`：team workers 用 spark 模型（~1.3x 更快）
- `--madmax-spark`：spark + 绕过 approvals（leader + workers）
- `-w, --worktree[=<name>]`：在 git worktree 启动（隔离环境）
- `--force`：setup 期间强制重装（覆盖已有文件）
- `--dry-run`：仅展示将要执行的动作
- `--verbose`：输出调试信息
- `--scope <user|project>`：控制安装目标（全局或本地）

### Explore / Sparkshell / Resume

- `omx explore`：只读、仅 shell；适合快速仓库发现。
- `omx resume`：恢复交互式工作。
- `omx sparkshell`：直接进行 shell-native inspection。

示例：

```bash
# Read-only 仓库探索
omx explore --prompt "which files define team routing"
omx explore --prompt-file prompts/explore-task.md

# 恢复交互式工作
omx resume

# 直接 sparkshell inspection
omx sparkshell git --version
omx sparkshell --tmux-pane %12 --tail-lines 400
```

Explore 约束（原文）：

- `omx explore` 不保证完整 Codex tool parity。
- 它只读、只 shell，并阻止管道、重定向、shell chaining，以及越界访问目标仓库之外的路径。
- 当前 allowlist：`rg`、`grep`、`ls`、`find`、`wc`、`cat`、`head`、`tail`、`pwd`、`printf`。

### Advisor（Ask）示例

```bash
# 简单查询
omx ask claude "review this diff"
omx ask gemini "brainstorm alternatives for the auth system"

# role-specific 查询
omx ask claude --agent-prompt executor "implement feature X with tests"
omx ask gemini --agent-prompt planner "draft a rollout plan for v0.9"

# shorthand prompt flags
omx ask claude -p "summarize the recent changes"
omx ask gemini --prompt "check this regex for errors"
```

### Team Commands（团队命令）

- `omx team 3:executor "task"`：启动 team workers
- `omx team 2:explore "short scoped analysis task"`：启动小型只读探索 team
- `omx team status <team-name>`：查看状态
- `omx team resume <team-name>`：恢复
- `omx team shutdown <team-name> [--force]`：关闭

环境变量：`OMX_TEAM_WORKER_CLI`（auto|codex|claude|gemini）、`OMX_TEAM_WORKER_CLI_MAP`（per-worker mix，例如 codex,claude,gemini）。

### Hooks、扩展与原生构建/验证

OMX 还提供 hook scaffolding、HUD inspection，以及 autoresearch/exec/team-worktree 的原生 build/verify helpers。

- `omx hooks init`：在 `.omx/hooks/` scaffold 一个新 hook plugin
- `omx hooks status`：查看 plugin 状态
- `omx hooks validate`：校验 plugin 实现
- `omx hud --watch`：watch runtime HUD
- `omx hud --json`：输出 JSON
- `omx tmux-hook init`：初始化 tmux prompt injection workaround
- `npm run build:full`：一次性 TypeScript + explore harness + sparkshell native build
- `npm run test:explore`：验证 native exploration harness
- `npm run test:sparkshell`：验证 sparkshell 行为与 native bridge wiring

plugins 默认禁用；设置 `OMX_HOOK_PLUGINS=1` 启用。

---

## Notifications（通知）

### Overview

- OMX 可以在 Codex session start/stop/idle 或需要输入时发送通知。
- 支持 5 种平台：Discord（webhook）、Discord（bot API）、Telegram、Slack、Generic webhook。
- 可在 `config.toml` 或环境变量中配置。

Tip：先用环境变量快速跑通，再运行 `omx setup` 写入配置文件。

### Quick Setup

```bash
export OMX_TELEGRAM_BOT_TOKEN=xxx
export OMX_TELEGRAM_CHAT_ID=xxx
export OMX_DISCORD_WEBHOOK_URL=xxx
export OMX_SLACK_WEBHOOK_URL=xxx

omx setup
```

### Platforms

（按原文表格翻译）

- Telegram：`botToken`、`chatId`；支持 `parseMode`；可用于 reply injection（需要授权 chat IDs）。
- Discord（Webhook）：单向提醒；支持自定义 `username` 与 mention 目标（例如 `<@123456>`）。
- Discord（Bot API）：推荐用于双向；需要 Discord bot 并具备 Send Messages 权限。
- Slack：支持 `channel`、`username`、mention 目标（例如 `<!here>`）。
- Generic Webhook：向任意 endpoint POST/PUT JSON payload；支持自定义 headers 做鉴权。
- OpenClaw：更偏“生产级编排”的通知网关方案（见下）。

### OpenClaw Configuration

OpenClaw 是官方推荐的“生产级通知编排”方案，可以触发 agent turn 和复杂 follow-up。

（原文为 JSON profile 示例，这里保持原始代码不翻译）：

```json
{
  "notifications": {
    "verbosity": "verbose",
    "openclaw": {
      "enabled": true,
      "gateways": {
        "local": {
          "type": "http",
          "url": "http://127.0.0.1:18789/hooks/agent",
          "headers": { "Authorization": "Bearer ${HOOKS_TOKEN}" }
        }
      },
      "hooks": {
        "session-start": {
          "enabled": true,
          "gateway": "local",
          "instruction": "[session-start|exec] project={{projectName}} session={{sessionId}}"
        },
        "ask-user-question": {
          "enabled": true,
          "gateway": "local",
          "instruction": "[ask-user-question|exec] session={{sessionId}} question={{question}}"
        }
      }
    }
  }
}
```

更多细节见完整指南：https://github.com/Yeachan-Heo/oh-my-codex/blob/main/docs/openclaw-integration.md

### Events

- `session-start`：session 启动
- `session-stop`：session 停止（mode 完成或用户中断）
- `session-end`：session 退出
- `session-idle`：session idle（等待输入）
- `ask-user-question`：agent 向用户提问

### Verbosity

- `verbose`：所有文本与 tool call 输出
- `agent`：按 agent-call 粒度（包含 `ask-user-question`）
- `session`：start/idle/stop/end + tmux tail snippet（默认）
- `minimal`：仅 start/stop/end；无 idle、无 tmux tail

### Environment Variables

- `OMX_DISCORD_WEBHOOK_URL`：Discord webhook endpoint
- `OMX_DISCORD_NOTIFIER_BOT_TOKEN`：Discord bot token
- `OMX_DISCORD_NOTIFIER_CHANNEL`：Discord channel ID
- `OMX_DISCORD_MENTION`：可选 mention 目标
- `OMX_TELEGRAM_BOT_TOKEN`：Telegram bot token
- `OMX_TELEGRAM_CHAT_ID`：Telegram chat ID
- `OMX_SLACK_WEBHOOK_URL`：Slack webhook URL
- `OMX_SLACK_MENTION`：Slack mention 目标

### Templates

- 自定义消息模板使用 `{{variable}}` 语法。
- 变量包括：`event`、`sessionId`、`timestamp`、`projectName`、`activeMode`、`question`、`tmuxTail`。

### Example Configuration

配置存储位置（原文）：`~/.codex/config.toml`（Codex 原生）或 `.omx-config.json`（OMX 高级）。

TOML 示例（保持代码不翻译）：

```toml
[notifications]
enabled = true
verbosity = "session"

[notifications.telegram]
enabled = true
botToken = "123456:ABC-DEF"
chatId = "-100123456789"

[notifications.slack]
enabled = true
webhookUrl = "https://hooks.slack.com/services/xxx"
mention = "@U12345"
```

更高级的路由可用 generic command/webhook aliases，例如 `.omx-config.json`：

```json
{
  "notifications": {
    "custom_webhook_command": {
      "enabled": true,
      "url": "https://api.example.com/hooks",
      "method": "POST",
      "headers": { "X-Api-Key": "my-secret-key" },
      "events": ["session-end", "ask-user-question"]
    },
    "custom_cli_command": {
      "enabled": true,
      "command": "notify-send \"OMX: {{event}}\" \"{{message}}\"",
      "events": ["session-start", "session-end"]
    }
  }
}
```

### Advanced Team Configuration

可通过环境变量或 `.omx-config.json` 细调 team 行为：

```bash
# 在一个 team 内混用不同 provider
export OMX_TEAM_WORKER_CLI_MAP=codex,claude,gemini
omx team 3:executor "parallel refactoring"

# 强制所有 workers 用 Gemini CLI
export OMX_TEAM_WORKER_CLI=gemini
omx team 2:executor "sync docs and report"

# 为 workers 强制指定 model
export OMX_TEAM_WORKER_LAUNCH_ARGS="--model gpt-5.3-codex-spark"
omx team 2:architect "design the system"

# 启用动态扩缩容
export OMX_TEAM_SCALING_ENABLED=1
omx team 2:executor "task"
```

### Reply Injection（回复注入）

- 可以从 Telegram / Discord / Slack 的回复注入文本到 Codex session。
- 需要 tmux 和授权用户 ID。
- 核心字段：`enabled`、`pollIntervalMs`、`maxMessageLength`、`rateLimitPerMinute`。

---

## Recommended Workflows（推荐工作流）

这部分是“打过仗”的常用模式，按场景选就行。

### Full-Auto from PRD

适合大需求：先做计划。

`$ralplan → $team → $ralph`

- `$ralplan`：planner + architect + critic 共识，生成计划
- `$team`：起 tmux 并行 worker 开始构建
- `$ralph`：持久化直到验证完成

### No-Brainer

适合目标清晰、想直接干。

`$autopilot → $ultrawork → $ralph`

- `$autopilot`：接管执行
- `$ultrawork`：并行加速
- `$ralph`：持久化直到验证完成

### Fix / Debugging

适合 bug 与错误修复。

`$plan → $ralph → $ultraqa`

- `$plan`：调查问题并给出修复策略
- `$ralph`：实现修复并持续推进
- `$ultraqa`：test → verify → fix 循环，直到全部通过

### Parallel Issue Handling

适合同时处理多个 issue/ticket。

`omx team (architect) → omx team (workers) → $ralplan → $ralph + $ultrawork → $ultraqa`

- 先起 architect workers 分析全部问题并产出一个完整 plan
- workers 在各自 worktree 并行处理，每个提交 PR
- review/merge 这些 PR，再用 `$ralplan` 安全解决冲突
- 最后用 `$ralph`/`$ultrawork`/`$ultraqa` 打磨到全绿

Good to know：文档认为这四种模式覆盖大多数真实工作；其他 skills 更偏特定场景，日常不常用。

---

## Advanced Orchestration（高级编排）

适合大规模工程：支持复杂 team 配置、混合 CLI workers、以及 git worktree 隔离。

### Mixed CLI Teams

可以在一个 team 里混用 Codex/Claude/Gemini：

```bash
export OMX_TEAM_WORKER_CLI_MAP=codex,gemini,claude
omx team 3:executor "refactor the shared runtime docs"
```

### Team CLI API

所有 mutation/协调建议通过 CLI interop API，以稳定的 JSON 状态机做转换（对自动化工具和复杂 worker 协调很关键）：

```bash
# 程序化创建 task
omx team api create-task --input '{"team_name":"my-team","subject":"Fix bug","description":"..."}' --json

# 用 versioned safety claim 一个 task
omx team api claim-task --input '{"team_name":"my-team","task_id":"1","worker":"worker-1"}' --json

# claim 后把 task 状态切到终态
omx team api transition-task-status --input '{"team_name":"my-team","task_id":"1","from":"in_progress","to":"completed","claim_token":""}' --json
```

### Worktree Isolation

在专用 worktree 启动 team，避免并行 worker 覆盖同一份文件；OMX 会自动处理跨 worktree 的 state resolution。

```bash
omx team 4:executor "feature work" --worktree=feature-branch
```

Architecture Insight（原文）：OMX 为每个 task 维护了 durable、claim-safe 的生命周期；即使 worker 失败或 session 被打断，状态也会保存在 `.omx/state/team/`，可用 `omx team resume <team-name>` 安全恢复。

---

## Reference

- 官方文档原文：https://oh-my-codex.dev/docs.html
