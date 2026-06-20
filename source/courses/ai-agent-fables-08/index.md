---
title: "AI 与 Agent 大寓言课 08：会验收的裁判 章节目录"
date: 2026-06-20 23:00:00
description: "AI 与 Agent 大寓言课第 08 讲的专题目录：从演示不算评测、LLM 评测、Agent 任务级 eval、trace 与回放、人工与模型评审，到线上监控。"
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
    <span class="ahf-kicker">AI Agent Fables / Lesson 08</span>
    <h2>会验收的裁判：评测、观测与回归</h2>
    <p>这是 AI 与 Agent 大寓言课第 08 讲的章节目录。第 08 讲来到一座考核场，跟着助手阿评学当一个不讲情面的裁判，把评测、trace、回归和线上监控这些概念讲清楚。</p>
    <div class="ahf-parent">
      <span>上层目录：AI 与 Agent 大寓言课 / 第 08 讲</span>
      <a class="ahf-link" href="/courses/ai-agent-fables/">返回总目录</a>
      <a class="ahf-link" href="/2026/06/18/ai-agent-fables-08-evals-observability/">阅读第八讲概览</a>
    </div>
  </section>
  <section class="ahf-note">
    <p>层级说明：大课程的“讲”是学习等级；第 08 讲下面拆成 6 个章节。建议先读概览，再顺着 08.1 到 08.6 往下走。</p>
  </section>
  <section class="ahf-note">
    <p>本讲脉络（一条故事线）：助手阿评在考核场里——先识破<strong>表演不算考过</strong>（08.1）→ 学会<strong>考会答话的看哪几样</strong>（08.2）→ 会<strong>考会办事的看过程与结果</strong>（08.3）→ 用<strong>录像回放复盘</strong>（08.4）→ 解决<strong>谁来打分</strong>（08.5）→ 懂得<strong>上岗后要常年盯</strong>（08.6）。老裁判贯穿全程，每章承上启下。</p>
  </section>
  <h2 class="ahf-section-title">第 08 讲学习路径</h2>
  <section class="ahf-list" aria-label="第八讲章节目录">
    <article class="ahf-card">
      <span class="ahf-number">08.0</span>
      <div><small>概览</small><h3>会验收的裁判</h3><p>用考核场寓言把评测、trace、回归和线上监控放进同一条主线。</p></div>
      <a class="ahf-link" href="/2026/06/18/ai-agent-fables-08-evals-observability/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">08.1</span>
      <div><small>为什么演示不算评测</small><h3>表演一段不算考过</h3><p>cherry-pick、样例偏差、回归风险——要系统化、覆盖真实分布、可重复地评。</p></div>
      <a class="ahf-link" href="/2026/06/20/ai-agent-fables-08-ch1-demo-is-not-eval/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">08.2</span>
      <div><small>LLM 评测基础</small><h3>考一个会答话的，看哪几样</h3><p>准确性、相关性、格式、鲁棒性——把“好”变成能打分的标准。</p></div>
      <a class="ahf-link" href="/2026/06/20/ai-agent-fables-08-ch2-llm-eval-basics/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">08.3</span>
      <div><small>Agent 任务级 eval</small><h3>考一个会办事的</h3><p>轨迹、工具调用、完成率、成本/延迟——结果对不等于过程对。</p></div>
      <a class="ahf-link" href="/2026/06/20/ai-agent-fables-08-ch3-agent-eval/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">08.4</span>
      <div><small>Trace 与回放</small><h3>给每场考试录像</h3><p>span、tool call、handoff、replay、失败归类——把“为什么错”从猜变成查。</p></div>
      <a class="ahf-link" href="/2026/06/20/ai-agent-fables-08-ch4-trace-replay/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">08.5</span>
      <div><small>人工评审与 LLM-as-judge</small><h3>谁来打分</h3><p>rubric、一致性、偏差、抽检——让模型评委干量，让人评守准。</p></div>
      <a class="ahf-link" href="/2026/06/20/ai-agent-fables-08-ch5-human-and-llm-judge/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">08.6</span>
      <div><small>线上监控</small><h3>上岗之后还得常年盯</h3><p>质量漂移、安全事件、预算告警、反馈闭环——把线上失败变成下一轮考题。</p></div>
      <a class="ahf-link" href="/2026/06/20/ai-agent-fables-08-ch6-production-monitoring/">阅读</a>
    </article>
  </section>
  <h2 class="ahf-section-title">读完这一讲应能带走什么</h2>
  <section class="ahf-rhythm-grid">
    <div class="ahf-rhythm"><strong>会评模型</strong><p>不被 demo 骗，懂用面向自有任务的成批评测看准确、相关、格式、鲁棒。</p></div>
    <div class="ahf-rhythm"><strong>会评 Agent</strong><p>看轨迹、工具、完成率和成本，靠 trace 回放定位失败、归类改进。</p></div>
    <div class="ahf-rhythm"><strong>会守质量</strong><p>懂 rubric、模型评委加抽检，懂上线后持续监控和评测—迭代闭环。</p></div>
  </section>
</div>
