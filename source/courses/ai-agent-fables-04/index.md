---
title: "AI 与 Agent 大寓言课 04：会查档案的书记 章节目录"
date: 2026-06-20 17:00:00
description: "AI 与 Agent 大寓言课第 04 讲的专题目录：从提示词、上下文工程、RAG 链路、引用核验、记忆与 RAG 的区别，到常见失败模式。"
---

<style>
.ahf-track {
  --ahf-ink: #1f2522;
  --ahf-muted: #627068;
  --ahf-line: rgba(31, 37, 34, 0.13);
  --ahf-panel: #ffffff;
  --ahf-wash: #f5f7f1;
  --ahf-green: #2f6f5e;
  --ahf-rust: #a44f32;
  --ahf-gold: #8a6f2e;
  max-width: 960px;
  margin: 0 auto;
  color: var(--ahf-ink);
}
.ahf-track * { box-sizing: border-box; }
.ahf-hero {
  padding: 30px;
  border: 1px solid var(--ahf-line);
  border-left: 5px solid var(--ahf-green);
  border-radius: 8px;
  background: #fbfcf9;
  box-shadow: 0 10px 26px rgba(31, 37, 34, 0.06);
}
.ahf-kicker {
  display: inline-flex;
  margin-bottom: 14px;
  padding: 5px 9px;
  border-radius: 999px;
  color: var(--ahf-green);
  background: rgba(47, 111, 94, 0.11);
  font-size: 13px;
  font-weight: 700;
}
.ahf-hero h2 { margin: 0 0 14px; font-size: 30px; line-height: 1.25; letter-spacing: 0; }
.ahf-hero p,
.ahf-note p,
.ahf-card p,
.ahf-rhythm p {
  margin: 0;
  color: var(--ahf-muted);
  line-height: 1.8;
}
.ahf-parent {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid var(--ahf-line);
}
.ahf-parent span {
  color: var(--ahf-muted);
  font-weight: 700;
}
.ahf-note {
  margin-top: 18px;
  padding: 16px 18px;
  border-left: 4px solid var(--ahf-rust);
  border-radius: 8px;
  background: var(--ahf-wash);
}
.ahf-section-title { margin: 34px 0 16px; font-size: 22px; letter-spacing: 0; }
.ahf-list { display: grid; gap: 14px; }
.ahf-card {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr) auto;
  gap: 16px;
  align-items: center;
  padding: 18px;
  border: 1px solid var(--ahf-line);
  border-radius: 8px;
  background: var(--ahf-panel);
  box-shadow: 0 10px 24px rgba(31, 37, 34, 0.06);
  transition: border-color 0.16s ease, box-shadow 0.16s ease, transform 0.16s ease;
}
.ahf-card:hover {
  border-color: rgba(47, 111, 94, 0.28);
  box-shadow: 0 14px 30px rgba(31, 37, 34, 0.08);
  transform: translateY(-1px);
}
.ahf-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 58px;
  min-height: 42px;
  padding: 0 8px;
  border-radius: 8px;
  color: #ffffff;
  background: var(--ahf-green);
  font-weight: 800;
}
.ahf-card h3 { margin: 0 0 7px; font-size: 19px; letter-spacing: 0; }
.ahf-card small {
  display: block;
  margin-bottom: 6px;
  color: var(--ahf-gold);
  font-weight: 700;
}
.ahf-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  padding: 8px 13px;
  border: 1px solid rgba(47, 111, 94, 0.3);
  border-radius: 8px;
  color: var(--ahf-green);
  font-weight: 700;
  text-decoration: none !important;
  white-space: nowrap;
}
.ahf-link:hover { color: #ffffff; background: var(--ahf-green); }
.ahf-rhythm-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
.ahf-rhythm {
  padding: 16px;
  border: 1px solid var(--ahf-line);
  border-radius: 8px;
  background: var(--ahf-wash);
}
.ahf-rhythm strong { display: block; margin-bottom: 6px; color: var(--ahf-rust); }
html[data-user-color-scheme="dark"] .ahf-track {
  --ahf-ink: rgba(246, 249, 246, 0.94);
  --ahf-muted: rgba(224, 233, 226, 0.72);
  --ahf-line: rgba(255, 255, 255, 0.1);
  --ahf-panel: rgba(28, 35, 32, 0.9);
  --ahf-wash: rgba(255, 255, 255, 0.045);
}
html[data-user-color-scheme="dark"] .ahf-hero,
html[data-user-color-scheme="dark"] .ahf-card { background: var(--ahf-panel); }
@media (max-width: 760px) {
  .ahf-hero { padding: 22px; }
  .ahf-hero h2 { font-size: 25px; }
  .ahf-card { grid-template-columns: 1fr; gap: 12px; }
  .ahf-number { width: 58px; }
  .ahf-rhythm-grid { grid-template-columns: 1fr; }
  .ahf-link { width: 100%; }
}
</style>

<div class="ahf-track">
  <section class="ahf-hero">
    <span class="ahf-kicker">AI Agent Fables / Lesson 04</span>
    <h2>会查档案的书记：提示词、上下文与 RAG</h2>
    <p>这是 AI 与 Agent 大寓言课第 04 讲的章节目录。第 04 讲走进一间档案室，跟着学徒阿档学会让模型“先查再答、答得可核验”，把提示词、上下文工程、RAG、引用核验和记忆这些概念讲清楚。</p>
    <div class="ahf-parent">
      <span>上层目录：AI 与 Agent 大寓言课 / 第 04 讲</span>
      <a class="ahf-link" href="/courses/ai-agent-fables/">返回总目录</a>
      <a class="ahf-link" href="/2026/06/18/ai-agent-fables-04-rag-context/">阅读第四讲概览</a>
    </div>
  </section>
  <section class="ahf-note">
    <p>层级说明：大课程的“讲”是学习等级；第 04 讲下面拆成 6 个章节。建议先读概览，再顺着 04.1 到 04.6 往下走。</p>
  </section>
  <section class="ahf-note">
    <p>本讲脉络（一条故事线）：学徒阿档在档案室里——先学<strong>写清委托单</strong>（04.1）→ 会<strong>在桌上摆好卷宗</strong>（04.2）→ 掌握<strong>看家的查档流程</strong>（04.3）→ 让答复<strong>每句有出处</strong>（04.4）→ 分清<strong>桌面、小本和整座馆</strong>（04.5）→ 认得<strong>四种常见翻车</strong>（04.6）。老书记贯穿全程，每章承上启下。</p>
  </section>
  <h2 class="ahf-section-title">第 04 讲学习路径</h2>
  <section class="ahf-list" aria-label="第四讲章节目录">
    <article class="ahf-card">
      <span class="ahf-number">04.0</span>
      <div><small>概览</small><h3>会查档案的书记</h3><p>用档案室寓言把提示词、上下文、检索增强和引用核验放进同一条主线。</p></div>
      <a class="ahf-link" href="/2026/06/18/ai-agent-fables-04-rag-context/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">04.1</span>
      <div><small>Prompt 是任务接口</small><h3>给书记的一张委托单</h3><p>身份、目标、约束、输出格式——把任务写成规格，而不是念咒语。</p></div>
      <a class="ahf-link" href="/2026/06/20/ai-agent-fables-04-ch1-prompt-as-interface/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">04.2</span>
      <div><small>Context Engineering</small><h3>桌上该摊哪些卷宗</h3><p>选择、顺序、去噪、预算——把上下文当一份整理好的简报，而不是杂物间。</p></div>
      <a class="ahf-link" href="/2026/06/20/ai-agent-fables-04-ch2-context-engineering/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">04.3</span>
      <div><small>RAG 基础链路</small><h3>档案室的看家流程</h3><p>切分、向量化、检索、重排、生成——给会记错的模型配一个随时可查的档案室。</p></div>
      <a class="ahf-link" href="/2026/06/20/ai-agent-fables-04-ch3-rag-pipeline/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">04.4</span>
      <div><small>引用与可核验回答</small><h3>每句话都要有出处</h3><p>引用、忠实性、证据覆盖、可反查——答得对还得让人能查，警惕假引用。</p></div>
      <a class="ahf-link" href="/2026/06/20/ai-agent-fables-04-ch4-citations-verifiable/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">04.5</span>
      <div><small>记忆不是 RAG 的别名</small><h3>桌面、小本和整座馆</h3><p>短期上下文、长期记忆、组织知识——三样常被混为一谈，其实各管各的。</p></div>
      <a class="ahf-link" href="/2026/06/20/ai-agent-fables-04-ch5-memory-vs-rag/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">04.6</span>
      <div><small>常见失败模式</small><h3>四种最常见的翻车</h3><p>漏召回、错命中、上下文污染、过度自信——做了 RAG 不等于可靠。</p></div>
      <a class="ahf-link" href="/2026/06/20/ai-agent-fables-04-ch6-failure-modes/">阅读</a>
    </article>
  </section>
  <h2 class="ahf-section-title">读完这一讲应能带走什么</h2>
  <section class="ahf-rhythm-grid">
    <div class="ahf-rhythm"><strong>会写指令</strong><p>能把含糊请求写成带身份、目标、约束、格式的任务规格，并精选上下文。</p></div>
    <div class="ahf-rhythm"><strong>会查资料</strong><p>懂 RAG 的切分、检索、重排、生成，知道每一环都要单独评测。</p></div>
    <div class="ahf-rhythm"><strong>会要证据</strong><p>坚持可核验、分清记忆/上下文/知识库，认得四种常见失败模式。</p></div>
  </section>
</div>
