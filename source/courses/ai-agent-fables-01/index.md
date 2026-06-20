---
title: "AI 与 Agent 大寓言课 01：会学习的木偶 章节目录"
date: 2026-06-20 11:00:00
description: "AI 与 Agent 大寓言课第 01 讲的专题目录：从 AI 是什么、三条历史主线、专家系统到深度学习、生成式 AI 的位置、Agent 复兴，到读 AI 新闻的方法。"
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
    <span class="ahf-kicker">AI Agent Fables / Lesson 01</span>
    <h2>会学习的木偶：AI 导论与发展史</h2>
    <p>这是 AI 与 Agent 大寓言课第 01 讲的章节目录。第 01 讲先用一篇概览文章把 AI、机器学习、生成式 AI 和 Agent 放进同一条历史路，再把这条路拆成 6 个章节：每章先用寓言建立直觉，再回到准确定义、历史脉络、常见误区和一个可动手的小练习。</p>
    <div class="ahf-parent">
      <span>上层目录：AI 与 Agent 大寓言课 / 第 01 讲</span>
      <a class="ahf-link" href="/courses/ai-agent-fables/">返回总目录</a>
      <a class="ahf-link" href="/2026/06/18/ai-agent-fables-01-ai-history/">阅读第一讲概览</a>
    </div>
  </section>
  <section class="ahf-note">
    <p>层级说明：大课程的“讲”是学习等级；第 01 讲下面拆成 6 个章节。这一页把这 6 章按学习顺序排好，建议先读概览，再顺着 01.1 到 01.6 往下走。</p>
  </section>
  <section class="ahf-note">
    <p>本讲脉络（一条故事线）：小木偶阿木在木偶镇里——先<strong>认得镇口三盏灯</strong>（01.1）→ 去看<strong>造灯的三家坊</strong>（01.2）→ 看懂<strong>规则册撞墙、深度学习接棒</strong>（01.3）→ 见证<strong>图书馆大灯亮起</strong>（01.4）→ 被<strong>装上腿学会跑腿</strong>（01.5）→ 在<strong>集市口学会分辨吆喝</strong>（01.6）。每章开头承上、结尾启下，连着读最顺。</p>
  </section>
  <h2 class="ahf-section-title">第 01 讲学习路径</h2>
  <section class="ahf-list" aria-label="第一讲章节目录">
    <article class="ahf-card">
      <span class="ahf-number">01.0</span>
      <div><small>概览</small><h3>木偶镇的第一盏灯</h3><p>用三段寓言把人工智能、机器学习、生成式 AI 和 Agent 放到同一条历史路上的位置。</p></div>
      <a class="ahf-link" href="/2026/06/18/ai-agent-fables-01-ai-history/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">01.1</span>
      <div><small>AI 到底是什么</small><h3>阿木认识镇口的三盏灯</h3><p>点灯人带阿木认识规矩灯、记牌灯、图书馆灯，分清规则程序、统计模型和生成式系统。</p></div>
      <a class="ahf-link" href="/2026/06/20/ai-agent-fables-01-ch1-what-is-ai/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">01.2</span>
      <div><small>三条历史主线</small><h3>镇上的三家灯坊</h3><p>阿木走访规矩坊、神经坊、概率坊，看清符号主义、连接主义和概率统计，理解大模型是三线混血。</p></div>
      <a class="ahf-link" href="/2026/06/20/ai-agent-fables-01-ch2-three-traditions/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">01.3</span>
      <div><small>从专家系统到深度学习</small><h3>撞墙的厚册子</h3><p>阿木在镇医馆看到规则册撞墙，再看后院如何用数据、算力、算法让深度学习在 2012 年起飞。</p></div>
      <a class="ahf-link" href="/2026/06/20/ai-agent-fables-01-ch3-expert-to-deep-learning/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">01.4</span>
      <div><small>生成式 AI 的位置</small><h3>图书馆大灯亮了</h3><p>大灯亮起，灯下三个手艺人会续写、会作画、会通译，区分语言模型、扩散模型和多模态。</p></div>
      <a class="ahf-link" href="/2026/06/20/ai-agent-fables-01-ch4-generative-ai/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">01.5</span>
      <div><small>Agent 为什么重新变热</small><h3>给图书馆大灯装上腿</h3><p>点灯人给会说话的灯配上腿、账本和循环，阿木学会跑腿，理解 Agent 不是“更聪明的灯”。</p></div>
      <a class="ahf-link" href="/2026/06/20/ai-agent-fables-01-ch5-why-agents/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">01.6</span>
      <div><small>读 AI 新闻的方法</small><h3>集市口的五种叫卖</h3><p>阿木在集市学会区分模型、产品、论文、融资和基准，建立读 AI 新闻的信息素养，给第一讲收尾。</p></div>
      <a class="ahf-link" href="/2026/06/20/ai-agent-fables-01-ch6-reading-ai-news/">阅读</a>
    </article>
  </section>
  <h2 class="ahf-section-title">读完这一讲应能带走什么</h2>
  <section class="ahf-rhythm-grid">
    <div class="ahf-rhythm"><strong>会分类</strong><p>能把一个“AI 系统”归到规则、机器学习、生成式还是 Agent，而不是只说“这是 AI”。</p></div>
    <div class="ahf-rhythm"><strong>会看历史</strong><p>能把符号主义、连接主义、概率统计、专家系统和深度学习放进同一条时间线。</p></div>
    <div class="ahf-rhythm"><strong>会读消息</strong><p>能分清模型、产品、论文、融资和基准，对流畅的 AI 内容保持一分核验意识。</p></div>
  </section>
</div>
