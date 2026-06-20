---
title: "AI 与 Agent 大寓言课 12：会开店的城镇 章节目录"
date: 2026-06-21 17:00:00
description: "AI 与 Agent 大寓言课第 12 讲的专题目录：从 demo 到产品、LLMOps、部署与运行时、观测与成本治理、团队流程，到项目案例与全课收尾。"
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
    <span class="ahf-kicker">AI Agent Fables / Lesson 12</span>
    <h2>会开店的城镇：产品化、MLOps 与 AI 基础设施</h2>
    <p>这是 AI 与 Agent 大寓言课第 12 讲、也是整门课的收官。跟着学徒阿铺开自己的第一家店，把从 demo 到产品、MLOps、运行时、成本治理、团队流程和项目案例讲清楚，并回望整条主线。</p>
    <div class="ahf-parent">
      <span>上层目录：AI 与 Agent 大寓言课 / 第 12 讲</span>
      <a class="ahf-link" href="/courses/ai-agent-fables/">返回总目录</a>
      <a class="ahf-link" href="/2026/06/18/ai-agent-fables-12-product-mlops/">阅读第十二讲概览</a>
    </div>
  </section>
  <section class="ahf-note">
    <p>层级说明：大课程的“讲”是学习等级；第 12 讲下面拆成 6 个章节。建议先读概览，再顺着 12.1 到 12.6 往下走。12.6 是整门课的收尾。</p>
  </section>
  <section class="ahf-note">
    <p>本讲脉络（一条故事线）：学徒阿铺在城镇里开店——先分清<strong>摆摊试卖和正经开店</strong>（12.1）→ 立起<strong>进货上架的一整套账</strong>（12.2）→ 让<strong>后厨转起来</strong>（12.3）→ <strong>盯账盯客流</strong>（12.4）→ <strong>店大了立店规</strong>（12.5）→ 用一个真项目串成<strong>一座能运转的城</strong>（12.6）。老店主贯穿全程，每章承上启下。</p>
  </section>
  <h2 class="ahf-section-title">第 12 讲学习路径</h2>
  <section class="ahf-list" aria-label="第十二讲章节目录">
    <article class="ahf-card">
      <span class="ahf-number">12.0</span>
      <div><small>概览</small><h3>会开店的城镇</h3><p>用开店寓言把产品化、MLOps、运行时、成本治理和团队流程放进同一条主线。</p></div>
      <a class="ahf-link" href="/2026/06/18/ai-agent-fables-12-product-mlops/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">12.1</span>
      <div><small>从 demo 到产品</small><h3>摆摊试卖和正经开店</h3><p>用户场景、可靠性、成本、SLA——一个惊艳 demo 离能长期运营的产品差得远。</p></div>
      <a class="ahf-link" href="/2026/06/21/ai-agent-fables-12-ch1-demo-to-product/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">12.2</span>
      <div><small>LLMOps / MLOps</small><h3>进货上架的一整套账</h3><p>版本、数据、prompt、模型、回滚——把会变的东西管起来，可追踪可复现可回退。</p></div>
      <a class="ahf-link" href="/2026/06/21/ai-agent-fables-12-ch2-llmops/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">12.3</span>
      <div><small>部署与运行时</small><h3>后厨怎么转起来</h3><p>队列、工作流、沙箱、会话、存储——把模型能力托在能承载真实流量的运行时上。</p></div>
      <a class="ahf-link" href="/2026/06/21/ai-agent-fables-12-ch3-deployment-runtime/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">12.4</span>
      <div><small>观测和成本治理</small><h3>当家的得盯账盯客流</h3><p>trace、指标、预算、缓存、限流——看不见花销的 AI 产品，随时可能被账单击穿。</p></div>
      <a class="ahf-link" href="/2026/06/21/ai-agent-fables-12-ch4-observability-cost/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">12.5</span>
      <div><small>团队流程</small><h3>店大了得有店规</h3><p>权限、审批、值班、事故复盘、知识库——产品化是“人和流程”的事。</p></div>
      <a class="ahf-link" href="/2026/06/21/ai-agent-fables-12-ch5-team-process/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">12.6</span>
      <div><small>项目案例 · 全课收尾</small><h3>一座能运转的城</h3><p>AI Town、Agent runtime、长期记忆、前端状态同步——把整门课串成一条线收尾。</p></div>
      <a class="ahf-link" href="/2026/06/21/ai-agent-fables-12-ch6-case-study/">阅读</a>
    </article>
  </section>
  <h2 class="ahf-section-title">读完这一讲应能带走什么</h2>
  <section class="ahf-rhythm-grid">
    <div class="ahf-rhythm"><strong>会算账</strong><p>分清 demo 和产品，懂可靠性、单位成本、SLA，会用缓存/限流/预算治理成本。</p></div>
    <div class="ahf-rhythm"><strong>会运营</strong><p>懂版本与回滚、运行时、监控告警、权限审批、值班复盘这一整套。</p></div>
    <div class="ahf-rhythm"><strong>会串线</strong><p>能用一个真项目把十二讲串起来，理解“能力来自模型，可靠来自模型之外”。</p></div>
  </section>
</div>
