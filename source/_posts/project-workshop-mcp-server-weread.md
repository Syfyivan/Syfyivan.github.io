---
title: "从零理解 MCP：我拆了一个微信读书 MCP Server，发现套路其实很简单"
date: 2026-06-12 14:00:00
tags: [MCP, Claude, 微信读书, TypeScript, 工具开发]
categories: [技术笔记, 项目工坊]
---

我在微信读书里攒了几百条划线和笔记，但它们一直锁在 App 里。想让 Claude 帮我整理某本书的笔记、对比几本书的观点，第一步就卡住了：模型根本看不到我的数据。

MCP（Model Context Protocol）就是为这个问题生的。它给大模型客户端定义了一套标准协议，让你可以把任何数据源包装成"工具"喂给模型。这篇文章拆一个现成的开源项目——[mcp-server-weread](https://github.com/freestylefly/mcp-server-weread)，一个微信读书 MCP server。它只有两个源文件，麻雀虽小五脏俱全，拆完你就知道自己写一个 MCP server 是什么套路。

## 先建立 MCP 的最小心智模型

很多 MCP 的介绍上来就讲协议规范，其实没必要。你只需要记住三件事：

1. **MCP 是 client-server 架构**。Claude Desktop 这类客户端是 client，你写的程序是 server。
2. **最常用的传输方式是 stdio**。客户端把你的 server 当成子进程启动，通过标准输入输出收发 JSON-RPC 消息。没有端口，没有 HTTP，就是管道。
3. **server 对外暴露的核心能力叫 tools**。每个 tool 有名字、描述和参数 schema。模型看到描述后自己决定什么时候调用、传什么参数。

所以一个最小的 MCP server 只需要回答两个问题：

```text
客户端问：你有哪些工具？        -> ListTools
客户端说：调用某个工具，参数是 X -> CallTool
```

实现了这两个 handler，你就有了一个能跑的 MCP server。这个项目就是这么干的。

## 项目架构：两个文件撑起整个服务

整个项目的源码目录长这样：

```text
mcp-server-weread/
├── src/
│   ├── index.ts      # MCP 协议层：注册工具、分发调用
│   └── WeReadApi.ts  # 数据层：封装微信读书网页版 API
├── package.json
└── tsconfig.json
```

就两个文件，分层却很干净。数据流是这样的：

```text
Claude Desktop
  -> stdio (JSON-RPC)
  -> index.ts（4 个 tool 的注册与分发）
  -> WeReadApi.ts（Cookie 管理 + HTTP 请求 + 重试）
  -> weread.qq.com 的网页版接口
```

它暴露了 4 个工具：`get_bookshelf`（拉书架）、`search_books`（按关键词搜书）、`get_book_notes_and_highlights`（取某本书的划线和笔记，按章节组织）、`get_book_best_reviews`（取热门书评）。

下面挑几段核心代码看。

## 拆解一：MCP 协议层只有三步

`src/index.ts` 的骨架，去掉业务逻辑后就剩这些：

```typescript
// src/index.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
  {
    name: "mcp-server-weread",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);
```

第一步，创建 Server 实例，声明"我只提供 tools 能力"（MCP 还有 resources、prompts 等能力，这个项目用不上）。

第二步，注册工具列表。注意 `description` 是写给模型看的，写得越清楚，模型调用得越准：

```typescript
// src/index.ts
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "search_books",
        description: "Search for books in the user's bookshelf by keywords and return matching books with details and reading progress",
        inputSchema: {
          type: "object",
          properties: {
            keyword: {
              type: "string",
              description: "Search keyword to match book title, author, translator or category"
            },
            // ... exact_match / include_details / max_results
          },
          required: ["keyword"]
        }
      },
      // ... 其余 3 个工具
    ]
  };
});
```

第三步，处理调用。本质就是一个 switch 分发：

```typescript
// src/index.ts
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const wereadApi = new WeReadApi();

    switch (request.params.name) {
      case "get_bookshelf": {
        const entireShelfData = await wereadApi.getEntireShelf();
        // ... 统计、组装数据
        return {
          content: [{
            type: "text",
            text: JSON.stringify({ /* 结构化结果 */ }, null, 2)
          }]
        };
      }
      // ... 其他 case
    }
  } catch (error: any) {
    return { error: { message: error.message } };
  }
});
```

返回值统一是 `content: [{ type: "text", text: ... }]`。这里有个值得学的点：它返回的不是裸数据，而是**精心组装过的 JSON**。比如 `get_bookshelf` 会先算好统计信息——多少本未读、在读、读完，主要分类是什么——再把每本书的进度、笔记数拼到一起。模型拿到的是"半成品报告"而不是原始接口响应，回答质量自然高。

最后启动，就一句话：

```typescript
// src/index.ts
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("[微信读书MCP服务器] 服务启动成功...");
```

注意这里用的是 `console.error` 而不是 `console.log`。不是笔误——stdio 模式下，**stdout 是协议通道**，你往 stdout 打一行日志，客户端解析 JSON-RPC 就会失败。所以整个项目的日志全部走 stderr。这是写 MCP server 第一个会踩的坑。

## 拆解二：Cookie 怎么管？四级降级

微信读书没有开放 API，这个项目走的是网页版接口，所以认证靠 Cookie。`WeReadApi.ts` 里的取 Cookie 逻辑是一条优先级链：

```typescript
// src/WeReadApi.ts
private async getCookie(): Promise<string> {
  // 优先级：
  // 1. 命令行参数中的WEREAD_COOKIE
  // 2. 命令行参数中的Cookie Cloud配置
  // 3. 环境变量中的Cookie Cloud配置
  // 4. 环境变量中的WEREAD_COOKIE

  if (this.commandArgs.WEREAD_COOKIE) {
    return this.commandArgs.WEREAD_COOKIE;
  }

  if (this.commandArgs.CC_URL && this.commandArgs.CC_ID && this.commandArgs.CC_PASSWORD) {
    cookie = await this.tryGetCloudCookie(/* ... */);
    if (cookie) return cookie;
  }
  // ... 环境变量兜底
}
```

为什么搞这么复杂？因为微信读书的 Cookie 过期很快，手动粘贴 Cookie 用不了几天就得换。作者接入了 [CookieCloud](https://github.com/easychen/CookieCloud)——一个浏览器插件，自动把你浏览器里的 Cookie 加密同步到服务端。MCP server 每次启动时从 CookieCloud 拉最新的 Cookie，只要你的浏览器还登录着微信读书，server 就一直可用。

这个思路很值得借鉴：**凡是依赖非官方接口的工具，认证的"保活"设计比功能本身更决定可用性。**

## 拆解三：对抗反爬，getChapterInfo 是全项目最脏的函数

大部分接口直接带 Cookie 请求就行，但拉章节信息的接口（`/web/book/chapterInfos`）有风控。看看作者是怎么伺候它的：

```typescript
// src/WeReadApi.ts
public async getChapterInfo(bookId: string): Promise<Record<string, ChapterInfo>> {
  return this.retry(async () => {
    // 1. 首先访问主页，确保会话有效
    await this.visitHomepage();

    // 2. 获取笔记本列表，进一步初始化会话
    await this.getNotebooklist();

    // 3. 添加随机延迟，模拟真实用户行为
    const delay = 1000 + Math.floor(Math.random() * 2000);
    await new Promise(resolve => setTimeout(resolve, delay));
    // ...
  });
}
```

先访问主页热身，再拉一次笔记本列表，然后随机睡 1~3 秒，最后才发真正的请求——请求头里还带上了 `Origin`、`Referer`、`Sec-Fetch-*` 等一整套浏览器指纹字段。这一连串动作就是在模拟"一个真人打开网页版读书"的行为序列。

更有意思的是响应处理。同一个接口在不同时期返回过四种结构，代码里全兜住了：

```typescript
// src/WeReadApi.ts
// 格式1: {data: [{bookId: "xxx", updated: []}]}
if (data.data && data.data.length === 1 && data.data[0].updated) {
  update = data.data[0].updated;
}
// 格式2: {updated: []}
else if (data.updated && Array.isArray(data.updated)) {
  update = data.updated;
}
// 格式3 / 格式4 ...
```

逆向非官方接口就是这样：对方随时改返回结构，你的解析代码必须写得"防御性拉满"。

配套的还有一个通用重试器，失败后等 5 秒加随机抖动再试，最多三次：

```typescript
// src/WeReadApi.ts
private async retry<T>(func: () => Promise<T>, maxAttempts = 3, waitMs = 5000): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await func();
    } catch (error: any) {
      if (attempt === maxAttempts) throw error;
      const randomWait = waitMs + Math.floor(Math.random() * 3000);
      await new Promise(resolve => setTimeout(resolve, randomWait));
    }
  }
}
```

所有公开方法都包在 `retry` 里。对接不稳定接口时，这层兜底是标配。

## 这个项目教会我的几个坑

1. **stdout 是圣域**。前面说过，stdio 传输下所有日志必须走 `console.error`。
2. **Cookie 过期是常态，不是异常**。代码里专门处理了 `-2012`、`-2010` 这两个错误码，提示用户 Cookie 过期了。如果你包装的也是 Cookie 型接口，从第一天就该考虑 CookieCloud 这类自动续期方案。
3. **工具返回的数据要替模型预处理**。`get_book_notes_and_highlights` 把划线按章节树组织好、把时间戳转成 ISO 格式、把空章节递归剔除，模型直接就能引用。把原始 JSON 一股脑扔给模型，效果会差很多。
4. **缓存要主动绕开**。所有 GET 请求都拼了个时间戳参数 `params._ = new Date().getTime()`，避免拿到缓存的旧数据。

## 照着做一个自己的 MCP server

把套路抽出来，写一个自己的 MCP server 就五步：

1. **初始化项目**：`npm init`，装上 `@modelcontextprotocol/sdk` 和 TypeScript。`package.json` 里加一个 `bin` 字段指向构建产物，这样别人能用 `npx` 直接跑你的包。
2. **建 Server + StdioServerTransport**：照抄前面那十几行骨架。
3. **设计 tools**：想清楚模型需要哪几个动作，每个动作的参数 schema 和 description 用英文写清楚（模型对英文描述的理解最稳）。工具数量宁少勿多，每个返回结构化的"半成品"。
4. **写数据层**：把你要包装的 API（数据库、本地文件、第三方服务都行）封成一个独立 class，认证、重试、错误码处理都收在这一层，别漏到协议层去。
5. **调试**：MCP 官方有个 Inspector，这个项目的 `package.json` 里就配了 `"inspector": "npx @modelcontextprotocol/inspector build/index.js"`，可以在浏览器里直接点工具、看请求响应，比接上 Claude Desktop 再排查方便得多。

调通之后，在 Claude Desktop 的配置里加一段就能用了：

```json
{
  "mcpServers": {
    "mcp-server-weread": {
      "command": "npx",
      "args": ["-y", "mcp-server-weread"],
      "env": {
        "CC_URL": "<REDACTED>",
        "CC_ID": "<REDACTED>",
        "CC_PASSWORD": "<REDACTED>"
      }
    }
  }
}
```

## 写在最后

拆完这个项目最大的感受是：MCP 协议本身的学习成本被严重高估了。真正花功夫的地方全在协议之外——怎么拿到稳定的认证、怎么对付反爬、怎么把数据整理成模型好消化的形状。协议层那点代码，半小时就能照猫画虎写出来。

所以如果你手上有什么"锁在 App 里"的个人数据——笔记、账单、收藏夹——不妨找找有没有网页版接口，照这个套路包一层 MCP。让模型替你读自己攒了几年的数据，这件事比想象中近得多。
