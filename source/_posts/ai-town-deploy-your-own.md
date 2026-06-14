---
title: "AI Town 课程 11：跑起来 & 部署你自己的 AI 小镇"
date: 2026-06-14 19:00:00
tags: [AI, Agent, AI Town, Convex, 部署, 课程]
categories: [技术笔记]
---

前面十讲我们一直在拆 AI Town 的内部结构：调度、单线程 step、历史回放、异步 LLM、向量记忆。这些都是“为什么这么设计”。

这是课程最后一讲，换个口味，聊“怎么让它真的跑起来”。

很多人 clone 下来跑了一半就卡住，不是因为代码难，而是因为 AI Town 不是一个静态网站。它不像把一堆 HTML 丢到对象存储就完事。它是一套需要三个东西同时活着的系统。

## AI Town 是“三件套”，不是一个进程

先建立一个心智模型。把 AI Town 跑起来，本质上要让三样东西同时在线：

```text
Convex 后端（游戏引擎 + 数据库 + 调度器）
       ^
       | VITE_CONVEX_URL
       v
前端（vite 起的 React 应用，PixiJS 渲染小镇）
       
LLM（Ollama 本地 / OpenAI / Together 云端）
```

- 后端是真正的世界：引擎在这里跑 step，inputs 表在这里，向量记忆在这里。
- 前端只是个观察窗口，它通过 `VITE_CONVEX_URL` 订阅后端状态、提交输入。
- LLM 是后端的“外脑”，引擎里的 action 会去调它生成对话和 embedding。

三个角色任何一个没起来，你看到的现象都不一样：前端连不上后端是白屏或转圈，LLM 没配是角色站着不说话。后面排错时记住这张图，能省很多时间。

下面分四步走：先在本地最快跑通，再理清三个端口的职责，然后讲怎么让别人也能访问，最后讲部署到远程机器。

## 一、本地最快跑通

本地有两条路。如果你已经有 Convex 账号、想认真开发，标准云端模式最省心；如果你不想注册账号、机器上有 Docker，那就用自托管（self-hosted）的后端。这里我重点讲自托管，因为它能把“三件套”看得最清楚。

### 标准模式（有 Convex 账号）

最简单，三行命令：

```sh
npm install
npm run dev
```

`npm run dev` 实际上是 `npm-run-all --parallel dev:backend dev:frontend`，一次把后端和前端都并行起来。第一次会要求你登录 Convex 账号。跑起来后访问 `http://localhost:5173` 就能看到小镇。

如果你想分开看后端和前端的日志，可以开两个终端：

```sh
npm run dev:backend   # convex dev --tail-logs，持续部署后端函数并打印日志
npm run dev:frontend  # vite，只起前端
```

`dev:backend` 会监听你对 `convex/` 目录的改动并热部署，这就是为什么改一行引擎逻辑能立刻生效。

### 自托管模式（用 Docker 把后端跑在本机）

不想注册账号，就用官方的自托管 Convex 容器。一条命令把后端、前端、dashboard 全拉起来：

```sh
docker compose up --build -d
```

`-d` 让它后台常驻。起来之后三个服务各占一个端口：

- 前端：`http://localhost:5173`
- 后端：`http://localhost:3210`（HTTP API 在 `3211`）
- dashboard：`http://localhost:6791`

这里有个关键点：自托管后端需要一个 admin key 才能让 Convex CLI 往里部署函数。生成它：

```sh
docker compose exec backend ./generate_admin_key.sh
```

然后把它和后端地址写进 `.env.local`。注意，这里我只写环境变量的**名字**，值用占位符表示，真实的 key 绝对不要提交到仓库或贴到任何地方：

```sh
# .env.local（示意，值用占位符）
CONVEX_SELF_HOSTED_ADMIN_KEY="<你的-admin-key>"   # 记得带引号
CONVEX_SELF_HOSTED_URL="http://127.0.0.1:3210"
```

`CONVEX_SELF_HOSTED_URL` 告诉 CLI“后端在哪”，`CONVEX_SELF_HOSTED_ADMIN_KEY` 是部署权限的凭证。提醒一句：如果你 `docker compose down` 再 `up`，admin key 会重新生成，得再写一次。

接着初始化一次后端（建表、灌入角色数据、起世界）：

```sh
npm run predev
```

`predev` 实际是 `convex dev --run init --until-success`，它会一路重试直到把 `init` 跑成功。之后想持续部署后端代码并看日志：

```sh
npm run dev:backend
```

dashboard 在 `http://localhost:6791`，第一次进去会要你填刚才那个 admin key。进去后能直接浏览数据表、看日志、手动跑函数，调试时非常顺手。

### 选 Ollama 还是云端 LLM

后端起来了，还差“外脑”。AI Town 默认走 Ollama 本地推理，零成本、不联网。

```sh
ollama serve          # 或者直接打开 Ollama 桌面应用
ollama pull llama3    # 拉默认的对话模型
```

默认配置在 `convex/util/llm.ts` 里，公开的几个值是：对话模型 `llama3`，embedding 模型 `mxbai-embed-large`，本地地址 `http://127.0.0.1:11434`。这些都能用环境变量覆盖，比如 `OLLAMA_MODEL`、`OLLAMA_HOST`。

如果你用 Docker 跑后端、Ollama 跑在宿主机，容器里访问 `127.0.0.1` 是访问不到宿主的，得改成 `host.docker.internal`：

```sh
npx convex env set OLLAMA_HOST http://host.docker.internal:11434
```

不想折腾本地模型，也可以直接接云端。`llm.ts` 里的 `getLLMConfig` 会按环境变量自动选 provider：

```sh
# OpenAI
npx convex env set OPENAI_API_KEY '<你的-key>'
# 或 Together.ai
npx convex env set TOGETHER_API_KEY '<你的-key>'
```

这里有个**容易踩的坑**：换 LLM provider 不只是换 key。`llm.ts` 顶部有个 `EMBEDDING_DIMENSION`，OpenAI 是 1536，Together 是 768，Ollama 是 1024。向量库的维度必须和你选的 embedding 模型对得上，否则记忆检索直接报错。换 provider 时要同步改这一行，并且把旧数据清掉重来（`npx convex run testing:wipeAllTables`），因为旧 embedding 的维度跟新模型对不上。

## 二、三个角色，各自的端口和职责

把上面零散的端口理成一张表，部署时按角色对号入座：

| 角色 | 端口 | 职责 |
| --- | --- | --- |
| backend | 3210（API）/ 3211（HTTP/webhook） | 跑游戏引擎、存数据、调度 step、调 LLM |
| dashboard | 6791 | 浏览数据、看日志、手动跑函数，纯调试用 |
| frontend | 5173 | vite 起的 React 应用，渲染小镇、订阅状态、提交输入 |

几点值得记住：

- **backend 是唯一有状态的**。前端和 dashboard 都是它的客户端，可以随便重启，世界数据不丢。
- **dashboard 是可选的**。它只是个运维窗口，关掉它小镇照样跑。但它有 admin key 权限，所以别随便把 6791 暴露到公网。
- **3211 这个端口别忘**。webhook（比如 Replicate 生成背景音乐的回调）走的是 HTTP API 端口，自托管时如果只放通了 3210，回调会失败。

前端的 vite 还有两个细节藏在 `vite.config.ts` 里：`base` 被设成了 `/ai-town`，意味着 build 出来的资源路径带这个前缀，部署到子路径时要对得上；`server.allowedHosts` 列了一批允许访问的 host，本地之外的域名要访问 dev server，得把域名加进这个白名单，否则 vite 会拒绝。

## 三、要让别人也能访问，需要改什么

本地能跑，和“发个链接给朋友也能玩”，是两件事。本地之所以能跑，是因为前端、后端、Ollama 都在 `127.0.0.1` 上，互相看得见。一旦换成别人的浏览器，这个前提就破了。

要让外部访问，三件事必须同时满足：

**1. 后端要公网可达。** 别人的浏览器要能连到你的 Convex 后端。要么用 Convex 云（`npx convex deploy` 部署到生产），要么把自托管后端挂到一台有公网 IP 或域名的机器上，把 3210（和 3211）放通。

**2. 前端 build 时 `VITE_CONVEX_URL` 必须指向那个公网后端。** 这是最关键、也最常错的一步。`VITE_CONVEX_URL` 是 vite 的环境变量，它在 `npm run build` 那一刻被编译进前端产物，之后改不了。如果你 build 时它还指着 `http://127.0.0.1:3210`，那别人的浏览器拿到的就是“连本机后端”的指令——而别人的本机当然没有你的后端，于是白屏。所以 build 前要把它设成公网地址：

```sh
# 构建前指定公网后端地址
VITE_CONVEX_URL="https://<你的-公网-convex-后端>" npm run build
```

**3. LLM 必须用云端 key。** 这一点很多人没意识到：公网部署后，LLM 调用是从**后端**发起的，不是从用户浏览器。如果你后端还配着 Ollama 指向 `127.0.0.1:11434`，那只有你自己机器上的 Ollama 能被调到；部署在远程服务器上的后端那台机器，多半没装 Ollama，于是角色全程沉默。所以对外服务时，要么给后端配 OpenAI / Together 的云端 key，要么把本地 Ollama 用 ngrok / Tunnelmole 之类的隧道暴露出去再把 `OLLAMA_HOST` 指过去。最省事的还是云端 key。

一句话总结这一节：**本地能跑靠的是大家都在 localhost；对外能跑靠的是后端公网可达、前端 build 时 URL 指对、LLM 用云端。**

## 四、部署到远程机器 / 容器的思路

落到具体怎么部署，有两条主流路子，思路是一样的：让后端在一个能被持续访问的地方常驻，前端指向它。

### 路子一：docker-compose 整套搬到远程

仓库里的 `docker-compose.yml` 已经把三件套定义好了，而且端口、地址都做成了可配置的环境变量：

- `URL_BASE` / `PORT`：拼出后端对外地址，默认 `http://127.0.0.1:3210`。
- 前端的 `VITE_CONVEX_URL` 直接由 `${URL_BASE}:${PORT}` 拼出来，所以你只要在远程机器上把 `URL_BASE` 设成公网地址，前端就会自动指对。
- backend 服务里的 `CONVEX_CLOUD_ORIGIN`、`CONVEX_SITE_ORIGIN` 也跟着 `URL_BASE` 走，这俩是后端告诉客户端“我对外是什么地址”的关键，公网部署时必须设成真实公网地址，不能留 `127.0.0.1`。

所以远程部署 compose 的核心动作，就是把这几个 `URL_BASE` 相关变量从 localhost 改成你的域名，然后 `docker compose up --build -d`。另外仓库还带了一个 `docker-compose.ollama.yml`，如果你想连 Ollama 也塞进容器编排，可以叠加这个文件用同一套网络（`ai-town-network`）把它接进去。

### 路子二：远程 devbox 上跑同一套命令 + 端口转发

如果你有一台开发机 / devbox，更轻量的做法是：直接在上面跑和本地一模一样的命令（`npm run predev`、`npm run dev:backend`、前端 build 后用静态服务器托管），然后通过端口转发或公网域名把 3210 / 3211 / 5173 暴露出去。

这条路的好处是调试方便，坏处是要自己管进程别挂。无论哪条路，要点都一样：

1. 后端常驻、端口放通（3210 一定要，需要 webhook 的话加 3211）。
2. 前端 build 时 `VITE_CONVEX_URL` 指向后端的公网地址。
3. LLM 用云端 key（或隧道暴露的 Ollama）。
4. dashboard 的 6791 别对公网开放，它带 admin 权限。

部署完别忘了初始化生产世界。云端模式是：

```sh
npx convex deploy
npx convex run init --prod
```

如果世界跑着跑着不动了（引擎或 agent 没在跑），可以踢一脚：`npx convex run testing:kick`。想停引擎调试用 `testing:stop`，恢复用 `testing:resume`。

## 常见坑速查

把这一讲里反复出现的坑收成一张排查表，照着对就行：

| 现象 | 大概率原因 | 怎么修 |
| --- | --- | --- |
| 前端白屏 / 一直转圈 | `VITE_CONVEX_URL` 没指对，浏览器在连一个连不上的后端 | 检查 build 时的 `VITE_CONVEX_URL`，重新 build |
| 控制台报跨域错误 | 后端的 `CONVEX_CLOUD_ORIGIN` / 允许来源没配成实际域名 | 公网部署时把 origin 类变量设成真实公网地址，别留 localhost |
| 角色不说话、站着不动 | LLM 没配，或后端连不到 LLM | 检查是否设了云端 key；Docker 下把 `OLLAMA_HOST` 改成 `host.docker.internal` |
| 记忆检索报维度错误 | 换了 provider 但 `EMBEDDING_DIMENSION` 没改 | 改 `llm.ts` 的维度并清库重来 |
| 别人访问不了 | 后端端口没放通，或还在 127.0.0.1 | 放通 3210/3211，后端地址改公网 |
| 背景音乐 webhook 不回调 | 只放通了 3210，漏了 3211 | 把 HTTP API 端口 3211 也暴露出去 |

记住一个排查口诀：**白屏看 URL，沉默看 LLM，连不上看端口，报维度看 embedding。** 八成的问题都落在这四类里。

## 小结

这一讲没有讲什么深奥的设计，全是落地的细节，但这些细节恰恰是“demo 能跑”和“产品能用”之间的那道坎。

回顾整门课，我们从“AI Town 不是像素小镇而是 Agent 基础设施”出发，一路拆了调度、状态机、历史回放、异步 LLM、向量记忆，最后落到这一讲——怎么把这套东西真正跑起来、部署出去。

把这一讲压缩成几句话：

- AI Town 是三件套：后端（有状态、是核心）、前端（观察窗口）、LLM（外脑）。
- 本地跑的前提是大家都在 localhost；对外跑的前提是后端公网可达、前端 build 时 URL 指对、LLM 用云端。
- 三个端口各司其职：3210/3211 后端、6791 dashboard（别对外）、5173 前端。
- `VITE_CONVEX_URL` 是 build 时定死的，指错了就白屏，这是头号坑。

到这里，AI Town 这门课就讲完了。你已经有了把这套 Agent runtime 跑起来、改起来、部署出去的全部线索。剩下的，就是去给你自己的小镇灌入角色、故事和地图，让它真正活起来。

## 参考资料

- [AI Town GitHub Repository](https://github.com/a16z-infra/ai-town)
- [Convex Self-Hosting](https://docs.convex.dev/self-hosting)
- [Convex CLI](https://docs.convex.dev/cli)
- [Ollama](https://ollama.com/)
