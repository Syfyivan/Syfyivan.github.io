---
title: "AI 与 Agent 大寓言课 09：会守城的门卫 章节目录"
date: 2026-06-21 11:00:00
description: "AI 与 Agent 大寓言课第 09 讲的专题目录：从提示注入、数据与隐私、权限与工具安全、版权与来源、偏见公平，到治理框架。"
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
    <span class="ahf-kicker">AI Agent Fables / Lesson 09</span>
    <h2>会守城的门卫：安全、隐私与治理</h2>
    <p>这是 AI 与 Agent 大寓言课第 09 讲的章节目录。第 09 讲来到一座城门，跟着新兵阿戍学会守护，把提示注入、隐私、权限、版权、偏见和治理框架这些概念讲清楚。</p>
    <div class="ahf-parent">
      <span>上层目录：AI 与 Agent 大寓言课 / 第 09 讲</span>
      <a class="ahf-link" href="/courses/ai-agent-fables/">返回总目录</a>
      <a class="ahf-link" href="/2026/06/18/ai-agent-fables-09-safety-governance/">阅读第九讲概览</a>
    </div>
  </section>
  <section class="ahf-note">
    <p>层级说明：大课程的“讲”是学习等级；第 09 讲下面拆成 6 个章节。建议先读概览，再顺着 09.1 到 09.6 往下走。</p>
  </section>
  <section class="ahf-note">
    <p>本讲脉络（一条故事线）：新兵阿戍在城门口——先防住<strong>夹带假命令的人</strong>（09.1）→ 守好<strong>名册和钥匙</strong>（09.2）→ 给<strong>各岗只配该配的钥匙</strong>（09.3）→ 查清<strong>货的来路</strong>（09.4）→ 校正<strong>盘查的尺子</strong>（09.5）→ 懂得<strong>守护要靠成文制度</strong>（09.6）。老门卫贯穿全程，每章承上启下。</p>
  </section>
  <h2 class="ahf-section-title">第 09 讲学习路径</h2>
  <section class="ahf-list" aria-label="第九讲章节目录">
    <article class="ahf-card">
      <span class="ahf-number">09.0</span>
      <div><small>概览</small><h3>会守城的门卫</h3><p>用城门寓言把安全、隐私、版权、偏见和治理放进同一条主线。</p></div>
      <a class="ahf-link" href="/2026/06/18/ai-agent-fables-09-safety-governance/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">09.1</span>
      <div><small>Prompt Injection</small><h3>夹带假命令的人</h3><p>直接注入、间接注入、工具输出投毒——模型分不清“该听的指令”和“只该当数据看的内容”。</p></div>
      <a class="ahf-link" href="/2026/06/21/ai-agent-fables-09-ch1-prompt-injection/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">09.2</span>
      <div><small>数据与隐私</small><h3>名册和钥匙</h3><p>PII、密钥、日志、数据最小化——你不持有的数据，就不会泄露。</p></div>
      <a class="ahf-link" href="/2026/06/21/ai-agent-fables-09-ch2-data-privacy/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">09.3</span>
      <div><small>权限和工具安全</small><h3>各岗只配该配的钥匙</h3><p>最小权限、审批、沙箱、回滚——权限是注入得手后的最后一道闸。</p></div>
      <a class="ahf-link" href="/2026/06/21/ai-agent-fables-09-ch3-permissions-tool-safety/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">09.4</span>
      <div><small>版权与来源</small><h3>这批货来路正不正</h3><p>训练数据争议、输出相似性、署名、许可——输入和输出两头都可能有雷。</p></div>
      <a class="ahf-link" href="/2026/06/21/ai-agent-fables-09-ch4-copyright-provenance/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">09.5</span>
      <div><small>偏见、公平与透明</small><h3>盘查的尺子歪不歪</h3><p>代表性、可解释、申诉、审计——别让 AI 成为无法被质疑的权威。</p></div>
      <a class="ahf-link" href="/2026/06/21/ai-agent-fables-09-ch5-bias-fairness/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">09.6</span>
      <div><small>治理框架</small><h3>不能只靠良心</h3><p>NIST AI RMF、OWASP LLM Top 10、内部政策落地——把安全意识沉淀成制度。</p></div>
      <a class="ahf-link" href="/2026/06/21/ai-agent-fables-09-ch6-governance/">阅读</a>
    </article>
  </section>
  <h2 class="ahf-section-title">读完这一讲应能带走什么</h2>
  <section class="ahf-rhythm-grid">
    <div class="ahf-rhythm"><strong>会防攻击</strong><p>认得直接/间接/工具投毒三种注入，懂为什么权限是最后一道闸。</p></div>
    <div class="ahf-rhythm"><strong>会守边界</strong><p>懂数据最小化、密钥保护、最小权限和审批，会查版权与来源。</p></div>
    <div class="ahf-rhythm"><strong>会讲治理</strong><p>能用 NIST AI RMF 和 OWASP LLM Top 10 把安全从个人意识落成制度。</p></div>
  </section>
</div>
