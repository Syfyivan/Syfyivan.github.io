---
title: "AI 与 Agent 大寓言课 11：会分工的城邦 章节目录"
date: 2026-06-21 15:00:00
description: "AI 与 Agent 大寓言课第 11 讲的专题目录：从为什么要多 Agent、编排模式、上下文隔离、对抗式验证、成本与延迟，到团队工程协议。"
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
    <span class="ahf-kicker">AI Agent Fables / Lesson 11</span>
    <h2>会分工的城邦：多 Agent 与 AI 工程</h2>
    <p>这是 AI 与 Agent 大寓言课第 11 讲的章节目录。第 11 讲跟着学徒工长阿筹，学怎么带一支分工协作的工队，把多 Agent 的分工、编排、隔离、对抗验证、成本和团队协议讲清楚。</p>
    <div class="ahf-parent">
      <span>上层目录：AI 与 Agent 大寓言课 / 第 11 讲</span>
      <a class="ahf-link" href="/courses/ai-agent-fables/">返回总目录</a>
      <a class="ahf-link" href="/2026/06/18/ai-agent-fables-11-multi-agent-engineering/">阅读第十一讲概览</a>
    </div>
  </section>
  <section class="ahf-note">
    <p>层级说明：大课程的“讲”是学习等级；第 11 讲下面拆成 6 个章节。建议先读概览，再顺着 11.1 到 11.6 往下走。</p>
  </section>
  <section class="ahf-note">
    <p>本讲脉络（一条故事线）：学徒工长阿筹在工队里——先懂<strong>一个人扛不动的大活要分工</strong>（11.1）→ 学<strong>把头的调度章法</strong>（11.2）→ 给<strong>各人划清该揣什么</strong>（11.3）→ 用<strong>对抗验证保质量</strong>（11.4）→ 算清<strong>人多了的账</strong>（11.5）→ 立起<strong>一支队的规矩</strong>（11.6）。老把头贯穿全程，每章承上启下。</p>
  </section>
  <h2 class="ahf-section-title">第 11 讲学习路径</h2>
  <section class="ahf-list" aria-label="第十一讲章节目录">
    <article class="ahf-card">
      <span class="ahf-number">11.0</span>
      <div><small>概览</small><h3>会分工的城邦</h3><p>用工队寓言把多 Agent 的分工、编排、隔离、验证和工程协议放进同一条主线。</p></div>
      <a class="ahf-link" href="/2026/06/18/ai-agent-fables-11-multi-agent-engineering/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">11.1</span>
      <div><small>为什么要多 Agent</small><h3>一个人扛不动的大活</h3><p>分工、隔离、并行、专家角色——单 Agent 扛不动时才拆，不是越多越好。</p></div>
      <a class="ahf-link" href="/2026/06/21/ai-agent-fables-11-ch1-why-multi-agent/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">11.2</span>
      <div><small>编排模式</small><h3>把头有几套调度章法</h3><p>leader-worker、debate、critic、map-reduce、handoff——没有最好的，只有最配任务的。</p></div>
      <a class="ahf-link" href="/2026/06/21/ai-agent-fables-11-ch2-orchestration-patterns/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">11.3</span>
      <div><small>上下文隔离</small><h3>各人只揣自己那摊</h3><p>子任务边界、信息所有权、汇总协议、防污染——默认隔离，按需共享。</p></div>
      <a class="ahf-link" href="/2026/06/21/ai-agent-fables-11-ch3-context-isolation/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">11.4</span>
      <div><small>对抗式验证</small><h3>谁说这活干对了</h3><p>评审、验证、红队、共识——自己夸自己最不可信，要有人专门对着干。</p></div>
      <a class="ahf-link" href="/2026/06/21/ai-agent-fables-11-ch4-adversarial-verification/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">11.5</span>
      <div><small>成本和延迟</small><h3>人多了也得算账</h3><p>并行收益、协调开销、token 预算、失败重跑——多 Agent 常常贵好几倍。</p></div>
      <a class="ahf-link" href="/2026/06/21/ai-agent-fables-11-ch5-cost-latency/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">11.6</span>
      <div><small>团队工程协议</small><h3>一支队的规矩</h3><p>任务切分、状态同步、冲突处理、交付证据——英雄靠手气，队伍靠规矩。</p></div>
      <a class="ahf-link" href="/2026/06/21/ai-agent-fables-11-ch6-team-protocols/">阅读</a>
    </article>
  </section>
  <h2 class="ahf-section-title">读完这一讲应能带走什么</h2>
  <section class="ahf-rhythm-grid">
    <div class="ahf-rhythm"><strong>会判断</strong><p>知道什么时候该上多 Agent、什么时候单 Agent 更好，不为分工而分工。</p></div>
    <div class="ahf-rhythm"><strong>会编排</strong><p>懂 leader-worker/debate/critic/map-reduce/handoff，会按任务结构选与组合。</p></div>
    <div class="ahf-rhythm"><strong>会工程</strong><p>懂隔离、对抗验证、成本权衡和团队协议，把一群 Agent 拢成一支可靠的队。</p></div>
  </section>
</div>
