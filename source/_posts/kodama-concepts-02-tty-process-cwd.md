---
title: "Kodama 知识点 02：tty、进程、cwd —— 让「点一下跳回正在跑的终端」成立的三个概念"
date: 2026-06-21 19:30:00
tags: [知识点, 终端, 进程, tty, cmux, 科普]
categories: [技术笔记, 知识点系列]
---

> 「知识点系列」第二篇。做桌宠的「点气泡 → 跳回我正在跑这个 Agent 的终端会话」时，绕不开 tty、进程、cwd 这三个概念。这篇把它们从零讲清楚，以及它们怎么拼成「精准跳转」。

做「跳回终端会话」这件事，本质是回答一个问题：

> 我手里只有一个会话的零碎信息（一个 id、一个目录），怎么找到屏幕上那个**正在跑它的终端窗口**，并跳过去？

答案要靠下面三个概念当「线索」。

## 1. 进程（Process）：正在运行的程序实例

**进程**就是「一个正在运行的程序」。你开一个 `claude`、一个 `codex`，每个都是一个进程，有一个唯一的编号 **PID**。

进程之间有**父子关系**：你的终端 App 启动了一个 shell（比如 zsh），shell 又启动了 `claude`。于是 `claude` 的「父进程」是 shell，shell 的父进程是终端 App。这条链很有用——后面要靠它从 `claude` 一路往上找到「是哪个终端 App 在跑它」。

**怎么看**：命令行 `ps -axo pid,ppid,tty,args`：
- `pid` 进程号、`ppid` 父进程号、`tty` 控制终端（见下）、`args` 启动命令。

在代码里就是跑这个 `ps`、把每行解析成 `{pid, ppid, tty, command}`，再用 `ppid` 把父子串起来。

## 2. tty：进程「坐」在哪个终端上

**tty** 是 "teletypewriter" 的缩写（历史包袱，早期是电传打字机），现在指**一个终端设备**。每个在终端里跑的进程，都有一个「控制终端」，表现为一个设备号，比如 `ttys007`（完整路径 `/dev/ttys007`）。

你可以把 tty 理解成「这个进程是坐在**哪一张终端椅子**上的」。同一个终端标签页里跑的所有命令，共享同一个 tty。

**为什么 tty 是跳转的关键**：终端 App（cmux、iTerm、Terminal）内部，每个标签/分屏也都对应一个 tty。所以：

```
我的会话 → 找到它的进程 → 拿到进程的 tty
                                  ↓ 用 tty 当「连接键」
终端 App 里 → 找到 tty 相同的那个标签 → 跳过去
```

tty 就是「我手里的会话」和「终端里的某个标签」之间的**唯一连接键**。

**注意**：后台进程、或没有控制终端的进程，tty 会显示成 `?` 或 `??`，得当成「没有」处理。

## 3. cwd：进程的当前工作目录

**cwd**（current working directory）就是「这个进程现在待在哪个文件夹」。你在 `~/code/blog` 里敲 `claude`，这个 claude 进程的 cwd 就是 `~/code/blog`。

**为什么需要它**：理想情况下，靠「会话 id 出现在进程命令行里」就能找到进程——实际上 Claude Code 的进程参数里**确实带着** `--session-id <UUID>`，所以**活跃会话**靠 id 就能定位、拿到 tty。

真正的难点是**已结束的会话**：agent 进程已经退出了，`ps` 里根本没有它，按进程怎么都找不到 tty。这时有两个办法：

1. **cwd 兜底**（活跃但 id 匹配不上时）：会话信息里带着 cwd，枚举 `claude`/`codex` 进程、用它们的 cwd 比对，匹配上就拿 tty。
2. **趁活着时缓存**（应对已结束）：在会话还活着时（比如每次事件到达时）就把 `sessionId → tty` 记下来。等会话结束、进程没了，终端 App 里那个标签（和它的 tty）通常还在，于是用缓存的 tty 仍能跳回去。

> 我一开始误以为「Claude Code 不把 session id 放命令行」，绕去做 cwd 匹配——其实它放了；真正卡住跳转的是「已结束会话进程已退出」，得靠上面第 2 条的缓存解决。

**怎么查一个进程的 cwd**：`lsof -a -d cwd -p <pid>`（`lsof` 列出进程打开的文件，`-d cwd` 只看「当前目录」这一项）。

## 4. 把三者拼成「精准跳转」

合起来，跳回终端会话的完整逻辑是：

```
1. ps 列出所有进程(pid/ppid/tty/命令)
2. 找目标 agent 进程：
   a) 命令行里有 session id？ → 直接命中(Codex 等)
   b) 否则按 cwd 用 lsof 匹配  → 兜底(Claude Code)
3. 拿到该进程的 tty
4. 在终端 App 里找 tty 相同的标签：
   - cmux: 跑 `cmux tree` 看每个标签的 tty，匹配后 `select-workspace`/`focus-pane`
   - Apple Terminal: AppleScript 遍历窗口/标签的 tty，selected = true + activate
5. 把终端 App 唤到前台
```

之前的 bug 就是漏了第 2 步的兜底（b）和第 4 步对 cmux 的支持：拿不到 tty + 只会操作 Apple Terminal → 退化成「把终端 App 整个打开」，看起来像新开了一个窗口，却没跳到具体会话。补上这两点，跳转就准了。（细节见「开发笔记 13」。）

## 小结 & 学习路径

- **进程**：运行中的程序，有 PID、有父子链。`ps`。
- **tty**：进程坐的「终端椅子」，是会话和终端标签之间的连接键。
- **cwd**：进程待的文件夹，是 session id 找不到时的备用连接键。`lsof -d cwd`。

延伸关键词：`ps`、`lsof`、`tty`、`/dev/tty*`、`getcwd`、进程父子关系（`ppid`）、`pgrep`/`pstree`。想动手就在终端跑 `ps -axo pid,ppid,tty,args | grep claude`，再 `lsof -a -d cwd -p <那个pid>`，亲眼看一遍这三个量。

下一篇知识点打算讲「IPC 与 preload：Electron 主进程和渲染进程怎么安全通信」——桌宠点一下能让后台去操作终端，靠的就是这套。
