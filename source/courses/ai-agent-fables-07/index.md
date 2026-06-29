---
title: "AI 与 Agent 大寓言课 07：会把灵感变蓝图的工匠 章节目录"
date: 2026-06-20 21:00:00
description: "AI 与 Agent 大寓言课第 07 讲的专题目录：从 vibe coding、SDD 链路、需求写法、从需求到测试、人机协作节奏，到何时别用 SDD。"
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
    <span class="ahf-kicker">AI Agent Fables / Lesson 07</span>
    <h2>会把灵感变蓝图的工匠：vibe coding 与 SDD</h2>
    <p>这是 AI 与 Agent 大寓言课第 07 讲的章节目录。第 07 讲来到一片工地，跟着学徒阿砖学两种盖法——先搭草棚试手的 vibe coding，和先定规格再施工的 SDD，把需求、验收、协作节奏和它们的边界讲清楚。</p>
    <div class="ahf-parent">
      <span>上层目录：AI 与 Agent 大寓言课 / 第 07 讲</span>
      <a class="ahf-link" href="/courses/ai-agent-fables/">返回总目录</a>
      <a class="ahf-link" href="/2026/06/18/ai-agent-fables-07-vibe-sdd/">阅读第七讲概览</a>
    </div>
  </section>
  <section class="ahf-note">
    <p>层级说明：大课程的“讲”是学习等级；第 07 讲下面拆成 6 个章节。建议先读概览，再顺着 07.1 到 07.6 往下走。</p>
  </section>
  <section class="ahf-note">
    <p>本讲脉络（一条故事线）：学徒阿砖在工地上——先学<strong>搭草棚试手</strong>（07.1）→ 走一遍<strong>正经盖房的五道工序</strong>（07.2）→ 把<strong>图纸写清楚</strong>（07.3）→ 用<strong>验收单证明盖好了</strong>（07.4）→ 学会<strong>和施工队按节奏配合</strong>（07.5）→ 懂得<strong>什么时候别折腾</strong>（07.6）。老工头贯穿全程，每章承上启下。</p>
  </section>
  <h2 class="ahf-section-title">第 07 讲学习路径</h2>
  <section class="ahf-list" aria-label="第七讲章节目录">
    <article class="ahf-card">
      <span class="ahf-number">07.0</span>
      <div><small>概览</small><h3>会把灵感变蓝图的工匠</h3><p>用工地寓言把 vibe coding 与 SDD、需求、验收和协作节奏放进同一条主线。</p></div>
      <a class="ahf-link" href="/2026/06/18/ai-agent-fables-07-vibe-sdd/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">07.1</span>
      <div><small>Vibe Coding 的价值</small><h3>先搭个草棚试试手</h3><p>探索、快速反馈、原型和边界——草棚很好用，但不能当正房住。</p></div>
      <a class="ahf-link" href="/2026/06/20/ai-agent-fables-07-ch1-vibe-coding/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">07.2</span>
      <div><small>SDD 的基本链路</small><h3>正经盖房的五道工序</h3><p>spec、plan、tasks、implementation、review——先把“要什么”定清楚再施工。</p></div>
      <a class="ahf-link" href="/2026/06/20/ai-agent-fables-07-ch2-sdd-pipeline/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">07.3</span>
      <div><small>需求怎么写给 Agent</small><h3>图纸该写给谁看</h3><p>用户故事、验收标准、非目标、约束——把意图和边界写清，Agent 才不跑偏。</p></div>
      <a class="ahf-link" href="/2026/06/20/ai-agent-fables-07-ch3-writing-requirements/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">07.4</span>
      <div><small>从需求到测试</small><h3>拿什么证明盖好了</h3><p>行为样例、边界条件、回归集、可验证完成——“看着好”最不可信。</p></div>
      <a class="ahf-link" href="/2026/06/20/ai-agent-fables-07-ch4-prd-to-tests/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">07.5</span>
      <div><small>人机协作节奏</small><h3>和施工队怎么配合</h3><p>探索/施工/审查三种模式加回滚——按阶段切换控制力度，人对结果负责。</p></div>
      <a class="ahf-link" href="/2026/06/20/ai-agent-fables-07-ch5-collaboration-modes/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">07.6</span>
      <div><small>何时别用 SDD</small><h3>钉个钉子也要图纸吗</h3><p>过早规范化、伪精确、文档漂移、小任务成本——探索用草棚，交付用正房。</p></div>
      <a class="ahf-link" href="/2026/06/20/ai-agent-fables-07-ch6-when-not-sdd/">阅读</a>
    </article>
  </section>
  <h2 class="ahf-section-title">读完这一讲应能带走什么</h2>
  <section class="ahf-rhythm-grid">
    <div class="ahf-rhythm"><strong>会选盖法</strong><p>能按不确定性和风险/寿命，在 vibe coding 和 SDD 之间做出有依据的选择。</p></div>
    <div class="ahf-rhythm"><strong>会写规格</strong><p>能把含糊需求写成用户故事、验收标准、非目标和约束，并落成可跑的测试。</p></div>
    <div class="ahf-rhythm"><strong>会带 Agent</strong><p>懂探索/施工/审查的节奏切换和回滚，把执行交出去、把判断和责任留下。</p></div>
  </section>
</div>
