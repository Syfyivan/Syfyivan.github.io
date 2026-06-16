---
title: "项目工坊"
date: 2026-06-12 13:30:00
description: "把项目摊在工作台上：自己写的项目每个一张工单，读过的好项目留一份拆解笔记。"
---

<style>
.workshop-page {
  --ws-ink: #1d2127;
  --ws-text: #2a2f36;
  --ws-muted: #69727d;
  --ws-line: rgba(29, 33, 39, 0.12);
  --ws-panel: #fdfdfc;
  --ws-teal: #b73a2c;
  --ws-rust: #b73a2c;
  --ws-blue: #3f5d7e;
  --ws-amber: #3f5d7e;
  --ws-violet: #3f5d7e;
  --ws-green: #3f5d7e;
  --ws-radius: 3px;
  color: var(--ws-text);
}

.workshop-page * {
  box-sizing: border-box;
}

.ws-hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(220px, 0.6fr);
  gap: 28px;
  align-items: end;
  padding: 36px 38px;
  border: 1px solid var(--ws-line);
  border-radius: var(--ws-radius);
  background:
    radial-gradient(rgba(183, 58, 44, 0.12) 1px, transparent 1px),
    linear-gradient(135deg, rgba(183, 58, 44, 0.05), rgba(63, 93, 126, 0.06)),
    var(--ws-panel);
  background-size: 22px 22px, auto, auto;
  overflow: hidden;
}

.ws-kicker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 10px;
  color: var(--ws-teal);
  font-size: 0.8rem;
  font-weight: 820;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.ws-kicker::before {
  content: "";
  width: 22px;
  height: 2px;
  background: var(--ws-teal);
}

.ws-hero h1 {
  margin: 0 0 12px;
  color: var(--ws-ink);
  font-family: -apple-system, "PingFang SC", "Hiragino Sans GB", sans-serif;
  font-size: clamp(2.1rem, 4.4vw, 3.3rem);
  font-weight: 780;
  line-height: 1.1;
}

.ws-hero p {
  max-width: 560px;
  margin: 0;
  color: var(--ws-muted);
  font-size: 1.02rem;
  line-height: 1.78;
}

.ws-hero-stats {
  display: grid;
  gap: 12px;
}

.ws-stat {
  padding: 14px 18px;
  border: 1px solid var(--ws-line);
  border-radius: var(--ws-radius);
  background: rgba(255, 255, 255, 0.78);
}

.ws-stat strong {
  display: block;
  color: var(--ws-ink);
  font-family: -apple-system, "PingFang SC", "Hiragino Sans GB", sans-serif;
  font-size: 1.7rem;
  font-weight: 780;
  line-height: 1.1;
}

.ws-stat span {
  color: var(--ws-muted);
  font-size: 0.86rem;
}

.ws-section-head {
  display: flex;
  align-items: baseline;
  gap: 14px;
  margin: 34px 0 18px;
}

.ws-section-head h2 {
  margin: 0 !important;
  padding: 0 !important;
  border: 0 !important;
  color: var(--ws-ink);
  font-family: -apple-system, "PingFang SC", "Hiragino Sans GB", sans-serif;
  font-size: 1.45rem;
  font-weight: 780;
}

.ws-section-head h2::before {
  display: none !important;
}

.ws-section-head span {
  color: var(--ws-muted);
  font-size: 0.9rem;
}

.ws-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.ws-card {
  --ws-accent: var(--ws-teal);
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 24px 26px 22px;
  border: 1px solid var(--ws-line);
  border-radius: var(--ws-radius);
  background:
    #fdfdfc;
  box-shadow: 0 1px 2px rgba(29, 33, 39, 0.04), 0 4px 10px rgba(29, 33, 39, 0.04);
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
  overflow: hidden;
}

.ws-card::before {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: 4px;
  background: var(--ws-accent);
  opacity: 0.85;
}

.ws-card:hover {
  border-color: color-mix(in srgb, var(--ws-accent) 40%, rgba(29, 33, 39, 0.14));
  box-shadow: 0 2px 6px rgba(29, 33, 39, 0.08);
  transform: translateY(-3px);
}

.ws-card--rust { --ws-accent: var(--ws-rust); }
.ws-card--blue { --ws-accent: var(--ws-blue); }
.ws-card--amber { --ws-accent: var(--ws-amber); }
.ws-card--violet { --ws-accent: var(--ws-violet); }
.ws-card--green { --ws-accent: var(--ws-green); }

.ws-card-head {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 14px;
}

.ws-card-no {
  color: var(--ws-accent);
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  font-size: 0.82rem;
  font-weight: 760;
  letter-spacing: 0.08em;
}

.ws-tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 9px;
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 720;
  line-height: 1.5;
}

.ws-tag--self {
  color: #ffffff;
  background: var(--ws-accent);
}

.ws-tag--study {
  color: var(--ws-muted);
  border: 1px dashed rgba(29, 33, 39, 0.34);
  background: transparent;
}

.ws-card-repo {
  margin-left: auto;
  color: var(--ws-muted);
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  font-size: 0.78rem;
  overflow-wrap: anywhere;
}

.ws-card h3 {
  margin: 0 0 4px;
  color: var(--ws-ink);
  font-family: -apple-system, "PingFang SC", "Hiragino Sans GB", sans-serif;
  font-size: 1.5rem;
  font-weight: 780;
  line-height: 1.25;
}

.ws-card-sub {
  margin: 0 0 14px;
  color: var(--ws-muted);
  font-family: -apple-system, "PingFang SC", "Hiragino Sans GB", sans-serif;
  font-size: 0.98rem;
}

.ws-card-desc {
  margin: 0 0 18px;
  color: rgba(38, 49, 61, 0.84);
  font-size: 0.98rem;
  line-height: 1.8;
}

.ws-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-bottom: 20px;
}

.ws-chip {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border: 1px solid color-mix(in srgb, var(--ws-accent) 26%, transparent);
  border-radius: 999px;
  color: color-mix(in srgb, var(--ws-accent) 82%, #000);
  background: color-mix(in srgb, var(--ws-accent) 7%, transparent);
  font-size: 0.8rem;
  font-weight: 640;
}

.ws-card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px dashed var(--ws-line);
}

.ws-read {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 40px;
  padding: 8px 16px;
  border: 1px solid var(--ws-ink);
  border-radius: var(--ws-radius);
  color: #ffffff !important;
  background: var(--ws-ink);
  font-size: 0.92rem;
  font-weight: 700;
  text-decoration: none !important;
  white-space: nowrap;
}

.ws-read:hover,
.ws-read:focus {
  border-color: var(--ws-accent);
  background: var(--ws-accent);
  color: #ffffff !important;
}

.ws-note {
  margin-top: 30px;
  padding: 24px 28px;
  border: 1px dashed rgba(29, 33, 39, 0.24);
  border-radius: var(--ws-radius);
  background: rgba(255, 255, 255, 0.6);
}

.ws-note h2 {
  margin: 0 0 10px !important;
  padding: 0 !important;
  border: 0 !important;
  color: var(--ws-ink);
  font-family: -apple-system, "PingFang SC", "Hiragino Sans GB", sans-serif;
  font-size: 1.2rem;
}

.ws-note h2::before {
  display: none !important;
}

.ws-note p {
  margin: 0;
  color: var(--ws-muted);
  font-size: 0.95rem;
  line-height: 1.8;
}

html[data-user-color-scheme="dark"] .workshop-page {
  --ws-ink: #f6f9fc;
  --ws-text: #c4c6c9;
  --ws-muted: rgba(224, 233, 242, 0.72);
  --ws-line: rgba(255, 255, 255, 0.12);
  --ws-panel: rgba(22, 31, 41, 0.9);
  --ws-teal: #e89180;
  --ws-rust: #e89180;
  --ws-blue: #8fb6dd;
  --ws-amber: #8fb6dd;
  --ws-violet: #8fb6dd;
  --ws-green: #8fb6dd;
}

html[data-user-color-scheme="dark"] .workshop-page .ws-hero {
  background:
    radial-gradient(rgba(232, 145, 128, 0.1) 1px, transparent 1px),
    linear-gradient(135deg, rgba(232, 145, 128, 0.05), rgba(143, 182, 221, 0.06)),
    var(--ws-panel);
  background-size: 22px 22px, auto, auto;
}

html[data-user-color-scheme="dark"] .workshop-page .ws-stat,
html[data-user-color-scheme="dark"] .workshop-page .ws-note {
  background: rgba(255, 255, 255, 0.05);
}

html[data-user-color-scheme="dark"] .workshop-page .ws-card {
  background: linear-gradient(180deg, rgba(24, 34, 45, 0.92), rgba(18, 28, 38, 0.9));
  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.22);
}

html[data-user-color-scheme="dark"] .workshop-page .ws-card-desc {
  color: rgba(226, 235, 244, 0.78);
}

html[data-user-color-scheme="dark"] .workshop-page .ws-chip {
  color: var(--ws-accent);
}

html[data-user-color-scheme="dark"] .workshop-page .ws-tag--self {
  color: #0e1720;
}

html[data-user-color-scheme="dark"] .workshop-page .ws-tag--study {
  border-color: rgba(255, 255, 255, 0.28);
}

html[data-user-color-scheme="dark"] .workshop-page .ws-read {
  border-color: rgba(248, 251, 255, 0.9);
  color: #0e1720 !important;
  background: rgba(248, 251, 255, 0.9);
}

html[data-user-color-scheme="dark"] .workshop-page .ws-read:hover,
html[data-user-color-scheme="dark"] .workshop-page .ws-read:focus {
  border-color: var(--ws-accent);
  background: var(--ws-accent);
}

@media (max-width: 767.98px) {
  .ws-hero {
    grid-template-columns: 1fr;
    padding: 26px 22px;
  }

  .ws-hero-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .ws-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .ws-card {
    padding: 20px 18px 18px;
  }

  .ws-card-foot {
    flex-wrap: wrap;
  }
}
</style>

<div class="workshop-page">
  <header class="ws-hero">
    <div>
      <p class="ws-kicker">Project Workshop</p>
      <h1>项目工坊</h1>
      <p>这里是我的工作台。自己写的项目，每个一张工单：它解决什么问题、用了什么技术、踩过什么坑；读过的好项目，也留一份源码拆解笔记。每篇都配可以照着做的教程。</p>
    </div>
    <div class="ws-hero-stats">
      <div class="ws-stat"><strong>5</strong><span>个自研项目</span></div>
      <div class="ws-stat"><strong>7</strong><span>篇拆解教程</span></div>
    </div>
  </header>
  <div class="ws-section-head">
    <h2>自研项目</h2>
    <span>从想法到能跑，全程自己写</span>
  </div>
  <div class="ws-grid">
    <article class="ws-card">
      <div class="ws-card-head">
        <span class="ws-card-no">WS-01</span>
        <span class="ws-tag ws-tag--self">自研</span>
        <span class="ws-card-repo">EpubReader</span>
      </div>
      <h3>EpubReader 阅读器</h3>
      <p class="ws-card-sub">Local-first EPUB Reader</p>
      <p class="ws-card-desc">本地优先的 EPUB 阅读器：划线、笔记、图书馆整理、微信读书同步和 AI 阅读分析，数据全部留在浏览器 IndexedDB，不上云。</p>
      <div class="ws-chips">
        <span class="ws-chip">React</span>
        <span class="ws-chip">IndexedDB</span>
        <span class="ws-chip">Go</span>
      </div>
      <div class="ws-card-foot">
        <a class="ws-read" href="/2026/06/12/project-workshop-epubreader/">阅读拆解 →</a>
      </div>
    </article>
    <article class="ws-card ws-card--rust">
      <div class="ws-card-head">
        <span class="ws-card-no">WS-02</span>
        <span class="ws-tag ws-tag--self">自研</span>
        <span class="ws-card-repo">xhs-auto</span>
      </div>
      <h3>小红书内容管线</h3>
      <p class="ws-card-sub">Markdown → 长图卡片</p>
      <p class="ws-card-desc">把 Markdown、docx、pdf 一键转成适配小红书的长图卡片，再用 Playwright 半自动发布。一条「文档 → 渲染 → 截图 → 发布」的完整管线。</p>
      <div class="ws-chips">
        <span class="ws-chip">Node.js</span>
        <span class="ws-chip">Playwright</span>
        <span class="ws-chip">pandoc</span>
      </div>
      <div class="ws-card-foot">
        <a class="ws-read" href="/2026/06/12/project-workshop-xhs-auto/">阅读拆解 →</a>
      </div>
    </article>
    <article class="ws-card ws-card--blue">
      <div class="ws-card-head">
        <span class="ws-card-no">WS-03</span>
        <span class="ws-tag ws-tag--self">自研</span>
        <span class="ws-card-repo">texas-holdem-app</span>
      </div>
      <h3>多人在线德州扑克</h3>
      <p class="ws-card-sub">Realtime Texas Hold'em</p>
      <p class="ws-card-desc">牌型判断是最简单的部分。真正的难点在下注轮状态机、个性化状态同步、断线处理和房间管理——这篇把它们逐个拆开。</p>
      <div class="ws-chips">
        <span class="ws-chip">Socket.IO</span>
        <span class="ws-chip">TypeScript</span>
        <span class="ws-chip">状态机</span>
      </div>
      <div class="ws-card-foot">
        <a class="ws-read" href="/2026/06/12/project-workshop-texas-holdem/">阅读拆解 →</a>
      </div>
    </article>
    <article class="ws-card ws-card--green">
      <div class="ws-card-head">
        <span class="ws-card-no">WS-04</span>
        <span class="ws-tag ws-tag--self">自研</span>
        <span class="ws-card-repo">tripmates</span>
      </div>
      <h3>Tripmates 旅行 App</h3>
      <p class="ws-card-sub">Expo / React Native</p>
      <p class="ws-card-desc">用 Expo 把一个旅行 App 从想法做到能跑：本地持久化、可降级的云同步、OTA 更新，以及跨平台路上真实踩过的坑。</p>
      <div class="ws-chips">
        <span class="ws-chip">Expo</span>
        <span class="ws-chip">React Native</span>
        <span class="ws-chip">Supabase</span>
      </div>
      <div class="ws-card-foot">
        <a class="ws-read" href="/2026/06/12/project-workshop-tripmates/">阅读拆解 →</a>
      </div>
    </article>
    <article class="ws-card ws-card--amber">
      <div class="ws-card-head">
        <span class="ws-card-no">WS-05</span>
        <span class="ws-tag ws-tag--self">自研</span>
        <span class="ws-card-repo">lark-codex-bridge</span>
      </div>
      <h3>飞书 × Codex 桥接</h3>
      <p class="ws-card-sub">Lark Codex Bridge</p>
      <p class="ws-card-desc">在飞书里 @ 一下机器人，让本地 Codex 干活：事件订阅、进度卡片、会话快照、owner 运维命令，一个 Node.js 进程全搞定。</p>
      <div class="ws-chips">
        <span class="ws-chip">Node.js</span>
        <span class="ws-chip">lark-cli</span>
        <span class="ws-chip">Codex CLI</span>
      </div>
      <div class="ws-card-foot">
        <a class="ws-read" href="/2026/06/12/project-workshop-lark-codex-bridge/">阅读拆解 →</a>
        <a class="ws-read" href="https://bridge-task-viewer-syf.gf-preview.bytedance.net" target="_blank" rel="noopener">打开 Viewer ↗</a>
      </div>
    </article>
  </div>
  <div class="ws-section-head">
    <h2>源码学习</h2>
    <span>读别人的好项目，拆成自己的笔记</span>
  </div>
  <div class="ws-grid">
    <article class="ws-card ws-card--violet">
      <div class="ws-card-head">
        <span class="ws-card-no">WS-06</span>
        <span class="ws-tag ws-tag--study">源码学习</span>
        <span class="ws-card-repo">mcp-server-weread</span>
      </div>
      <h3>微信读书 MCP Server</h3>
      <p class="ws-card-sub">开源项目拆解</p>
      <p class="ws-card-desc">拆一个现成的开源微信读书 MCP server：只有两个源文件，却把 MCP 协议、Cookie 管理和反爬对抗讲得明明白白。</p>
      <div class="ws-chips">
        <span class="ws-chip">MCP</span>
        <span class="ws-chip">TypeScript</span>
        <span class="ws-chip">Claude Desktop</span>
      </div>
      <div class="ws-card-foot">
        <a class="ws-read" href="/2026/06/12/project-workshop-mcp-server-weread/">阅读拆解 →</a>
      </div>
    </article>
    <article class="ws-card ws-card--blue">
      <div class="ws-card-head">
        <span class="ws-card-no">WS-07</span>
        <span class="ws-tag ws-tag--study">源码学习</span>
        <span class="ws-card-repo">lark-codex-bot</span>
      </div>
      <h3>飞书 × AI Agent 桥接</h3>
      <p class="ws-card-sub">朋友项目拆解</p>
      <p class="ws-card-desc">拆朋友写的 lark-codex-bot：hub/worker 架构、webhook 事件订阅、租约任务队列。和我的 bridge 是同一件事的两种做法，对照着读很有意思。</p>
      <div class="ws-chips">
        <span class="ws-chip">飞书开放平台</span>
        <span class="ws-chip">AI Agent</span>
        <span class="ws-chip">Bot</span>
      </div>
      <div class="ws-card-foot">
        <a class="ws-read" href="/2026/06/12/project-workshop-lark-codex-bot/">阅读拆解 →</a>
      </div>
    </article>
  </div>
  <aside class="ws-note">
    <h2>怎么读这些拆解</h2>
    <p>每篇教程都按同一个思路写：先讲这个项目为什么存在、要解决什么麻烦，再给出架构和数据流，然后摘真实源码逐段拆，最后整理踩坑和可复用的经验。读完任何一篇，你都应该能照着做出一个自己的版本。</p>
  </aside>
</div>
