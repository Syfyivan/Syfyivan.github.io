---
title: "做一个本地优先的 EPUB 阅读器：数据不上云，功能不缩水"
date: 2026-06-12 20:00:00
tags: [EPUB, 本地优先, React, IndexedDB, Go]
categories: [技术笔记, 项目工坊]
---

我读电子书有个习惯：边读边划线，划完还要写两句笔记。市面上的阅读器要么把数据锁在自己的云端，要么导出格式残缺，换个 App 几年的划线就没了。微信读书的体验不错，但它的划线也只活在微信读书里。

所以我自己写了一个：EpubReader。React + TypeScript 前端，配一个可选的 Go 后端。核心原则只有一条——**数据默认保存在浏览器本地 IndexedDB，不自动上传到任何云端**。但本地优先不等于功能阉割：划线、笔记、标签、全文搜索、跨书知识图谱、微信读书划线同步、AI 章节分析，一个都没少。

这篇文章拆解一下这个项目的几个关键设计：本地优先的架构怎么划边界、EPUB 在浏览器里怎么渲染、划线怎么定位和持久化，以及我踩过的几个坑。

## 为什么是"本地优先"，而不是"纯本地"

先把概念说清楚。纯本地是"没有网络功能"；本地优先（local-first）是"本地是真相源，网络是增强"。

我给 EpubReader 定的边界是：

- **阅读、划线、笔记、整理、搜索、导出**——纯前端完成，后端不启动也能用；
- **AI 分析、微信读书同步**——需要后端，但后端只做桥接，不持久化任何业务数据。

这个边界写进了技术方案的设计原则里（`docs/TECHNICAL_DESIGN.md`）：

> - 本地优先：阅读和标注不依赖后端持久化。
> - 可降级：后端未启动时，基础阅读和本地整理仍可用。
> - 可迁移：数据导出必须保留完整结构，避免锁死在 IndexedDB。

最后一条很重要。本地优先的最大风险不是丢数据，而是数据被困在某个浏览器的 IndexedDB 里出不来。所以导出功能（JSON 全量备份、Markdown 读书报告、思维导图 JSON）是第一优先级做的，不是锦上添花。

## 整体架构：前端干重活，后端只做桥

整个系统的数据流是这样的：

```text
用户浏览器
  -> React / Vite 前端
       -> IndexedDB（书籍、文件、划线、笔记）
       -> EpubParser + zip.js（本地 File 或远程 URL + HTTP Range）
  -> Go 后端 :3001（可选）
       -> DashScope OpenAI 兼容 API（AI 分析）
       -> MCP stdio Server（微信读书数据源）
```

前端承担了通常属于"服务端"的全部职责：EPUB 解析、全文索引、知识图谱构建、数据整理和导出。Go 后端只有三个文件的核心代码（`backend/main.go`、`ai.go`、`mcp.go`），用标准库 `net/http` 暴露 REST API，不接数据库。

为什么 AI 和微信读书同步要走后端？两个原因：

1. **密钥不能放前端**。AI 调用需要 API Key，放浏览器里等于公开。后端从 `.env` 读取，未配置时服务照常启动，只是调 AI 路由时返回明确的错误信息。
2. **MCP 是 stdio 协议**。微信读书的数据通过一个 MCP server 提供，它走 JSON-RPC over stdio，浏览器没法直接拉起子进程。Go 后端用 `exec.CommandContext` 启动 MCP server，把 `tools/call` 包装成普通的 HTTP 接口给前端用。

这样后端坏了、没启动、甚至被我删了，阅读和笔记功能都不受影响——这就是"可降级"。

## EPUB 渲染：本质是解压一个 zip

EPUB 文件本质上就是一个 zip 包，里面装着 XHTML 章节、CSS、图片和两个清单文件（container.xml 和 OPF）。所以我没有用 epub.js 这类大而全的库，而是基于 zip.js 自己写了解析器（`src/parse/parse.tsx`）。

入口设计成同时接受本地文件和远程 URL：

```ts
// src/parse/parse.tsx
async load(source: File | string): Promise<void> {
  if (typeof source === 'string') {
    // 远程文件 - 使用 HTTP Range Requests
    await this.loadFromUrl(source);
  } else {
    // 本地文件 - 使用 File API
    await this.loadFromFile(source);
  }
  await this.parseContainer();
  await this.parseOpf();
}

private async loadFromUrl(url: string): Promise<void> {
  const reader = new zip.HttpReader(url, {
    useRangeHeader: true,
    preventHeadRequest: false,
  });
  this.zipReader = new zip.ZipReader(reader);
  this.entries = await this.zipReader.getEntries();
}
```

远程加载这条路径值得说一下。zip 文件的目录索引在文件**末尾**，而 `zip.HttpReader` 配合 HTTP Range 请求，可以只拉取索引和需要的那几个章节，不用把整本书下载下来。打开一本 50MB 的在线 EPUB，实际流量可能只有几百 KB。代价是远程服务器必须支持 CORS 和 Range——不支持就老老实实下载后本地导入。

### 资源的两段式加载

章节 XHTML 里的图片、字体引用的都是 zip 包内的相对路径，直接塞进 DOM 浏览器会发起 404 请求。我的处理分两步：

1. **解析阶段**：`processChapterContent()` 扫描章节 HTML 里的 `img/source/audio/video/svg image` 等节点，把资源路径改写成 `data-epub-*` 属性，让浏览器"看不见"原始路径；
2. **渲染后 hydrate**：`Read.tsx` 在章节挂载后查询所有 `data-epub-*` 节点，逐个调 `parser.loadResource()` 从 zip 里读出 Blob，转成 object URL 再写回 `src`。章节切换时统一 `revokeObjectURL` 防止内存泄漏。

连 CSS 背景图和 `@font-face` 内嵌字体都走这套流程——外链 CSS 先内联成 `style[data-epub-css-base]`，hydrate 阶段再重写里面的 `url(...)`。

阅读模式做了三种：滚动、双栏、仿 Kindle 分页，状态持久化在 localStorage 里：

```ts
// src/read/Read.tsx
type ReadingMode = "scroll" | "columns" | "paged";

const [readingMode, setReadingMode] = useState<ReadingMode>(() => {
  const stored = window.localStorage.getItem("epub-reader:readingMode");
  return stored === "columns" || stored === "paged" ? stored : "scroll";
});
```

双栏和分页用的是 CSS 多列布局，分页模式额外计算页码和章节内进度。

## 划线：用相对 XPath 把选区"钉"在正文上

划线是这个项目里最有意思的部分。难点在于：用户选中的是一段 DOM Range，但 Range 是活的，刷新页面就没了。要持久化，必须把它序列化成一个**可以在重新渲染后的 DOM 里复原**的描述。

我的方案是相对 XPath + 字符偏移。"相对"是关键——XPath 不从 document 根算起，而是从章节容器算起，这样章节外层的 React 组件结构怎么变都不影响定位：

```ts
// src/highlight/HighlightSystem.ts
private getRelativeXPath(node: Node, container: Node): string | null {
  if (node === container) return ".";
  const parts: string[] = [];
  let cur: Node | null = node;

  while (cur && cur !== container) {
    if (cur.nodeType === Node.TEXT_NODE) {
      const idx = this.getTextNodeIndex(cur);
      parts.unshift(`text()[${idx}]`);
      cur = cur.parentNode;
    } else if (cur.nodeType === Node.ELEMENT_NODE) {
      const idx = this.getElementIndexAmongSameTag(cur as Element);
      parts.unshift(`${cur.nodeName.toLowerCase()}[${idx}]`);
      cur = cur.parentNode;
    } else {
      cur = cur.parentNode;
    }
  }

  if (cur !== container) return null; // 没能追溯到 container
  return "." + (parts.length ? "/" + parts.join("/") : "");
}
```

注意 `text()[idx]` 这一层：同一个 `<p>` 里可能有多个文本节点（被行内元素切开），必须把文本节点的序号也编进路径，offset 才有意义。恢复时用 `document.evaluate()` 反查节点，重建 Range。

一条划线最终长这样：

```ts
interface HighlightPosition {
  start: { xpath: string; offset: number }
  end: { xpath: string; offset: number }
  timestamp: number
}

interface StoredHighlight extends Highlight {
  bookId: string
  chapterId: string
  chapterTitle?: string
  source?: "local" | "wechat"
}
```

`source` 字段是为微信读书同步留的。外部导入的划线没有本地 EPUB 的 XPath（微信读书不可能知道我本地文件的 DOM 结构），所以它们用占位 position，只参与图书馆整理视图，不参与正文渲染。来源必须显式标记，这是数据模型里不能省的一笔。

## IndexedDB：四个 store 加版本迁移

存储层用 `idb` 库封装（`src/storage/StorageManager.ts`），四个 object store：`books`（元数据和阅读进度）、`bookFiles`（EPUB 文件本体 Blob）、`highlights`、`notes`。

```ts
// src/storage/StorageManager.ts
this.db = await openDB<EpubReaderDB>(this.dbName, this.version, {
  upgrade(db, oldVersion, _newVersion, tx) {
    if (oldVersion < 1) {
      const highlightStore = db.createObjectStore("highlights", { keyPath: "id" });
      highlightStore.createIndex("by-book", "bookId");
      highlightStore.createIndex("by-chapter", "chapterId");
      highlightStore.createIndex("by-tag", "tags", { multiEntry: true });
      // ...
    }
    if (oldVersion < 2) {
      db.createObjectStore("bookFiles", { keyPath: "bookId" });
    }
    if (oldVersion < 3) {
      const highlightStore = tx.objectStore("highlights");
      if (!highlightStore.indexNames.contains("by-tag")) {
        highlightStore.createIndex("by-tag", "tags", { multiEntry: true });
      }
    }
  },
});
```

两个细节：

- `by-tag` 索引用了 `multiEntry: true`，一条划线有多个标签时每个标签都进索引，图书馆按标签聚合不用全表扫描。
- 版本迁移按 `oldVersion` 分段写。本地优先应用没有"清库重来"的特权——用户的数据就在那个浏览器里，schema 演进必须无损。`bookFiles` 就是 v2 才加的：最初在线书也整包下载存本地，后来改成在线书只存 URL（`BookMetadata.filePath`），打开时由 `getBookSource()` 决定返回 `File` 还是 URL 字符串，解析器对两者一视同仁。

图书馆的整理视图（按标签 / 章节 / 日期 / 来源）、全库搜索、跨书知识图谱，全部在这四个 store 上现算。知识图谱基于标签和主题词抽取，把 `theme`、`book`、`annotation` 三类节点连成图——没有向量数据库，没有服务端，纯前端跑。

## 踩过的两个坑

**坑一：目录全是"第 X 章"占位符**（详见仓库 `EPUB_FIX.md`）。EPUB 的真实章节标题在 NCX（EPUB 2）或 NAV（EPUB 3）文件里，我的 `enhanceChapterTitles()` 是异步方法，但在 `parseSpine()` 里调用时漏了 `await`——目录还没解析完，章节列表就返回了，于是用户看到的全是占位标题。修复就是补上 `await`，再把 NCX href 和 spine 章节的匹配从简单的 `endsWith()` 改成"完整路径优先、文件名兜底"的两级匹配。教训：async 函数忘了 await，TypeScript 不会报错，症状还特别像"功能没做"。

**坑二：`Cannot access 'clearTempHighlight' before initialization`**（详见 `INITIALIZATION_FIX.md`）。做临时高亮时，`loadChapter` 的 useCallback 依赖数组里引用了定义在它**后面**的 `clearTempHighlight`。函数组件里所有 useCallback 按定义顺序执行，const 声明又有暂时性死区，整个应用直接白屏。ESLint 的 hooks 规则查得出依赖缺失，查不出初始化顺序。之后我给 Read.tsx 定了规矩：工具函数 → 业务函数 → 事件处理 → effect，严格按依赖方向排列。

还有一个安全上的遗留问题值得坦白：MCP 接口目前允许请求体传 `serverPath`，方便本地调试，但这等于让前端指定后端要执行的命令。生产环境必须收口成后端白名单配置——这条已经排进 P0。

## 几条经验

1. **本地优先先想清楚"什么必须离线可用"**。我的答案是阅读和标注，于是后端天然退化成无状态桥接层，部署和维护成本趋近于零。
2. **持久化的不是 DOM，是"重建 DOM 中位置的方法"**。相对 XPath + offset 不是唯一解（CFI、文本指纹都行），但"相对于稳定容器"这个思路是通用的。
3. **IndexedDB 的 schema 迁移从第一天就要认真写**。用户数据不在你的服务器上，你没有任何补救手段。
4. **导出比同步优先**。跨设备同步可以以后做（已排进 P2），但 JSON/Markdown 导出必须第一版就有——它是用户对抗"数据被困住"的最后保险。

代码里没有什么黑魔法：zip.js、DOMParser、document.evaluate、IndexedDB，全是浏览器原生或轻量库的能力。本地优先不缩水的秘诀，其实就是认真用好浏览器这十年攒下来的 API。
