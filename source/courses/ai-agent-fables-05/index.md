---
title: "AI 与 Agent 大寓言课 05：会借工具的学徒 章节目录"
date: 2026-06-20 19:00:00
description: "AI 与 Agent 大寓言课第 05 讲的专题目录：从工具调用、MCP、Skill、工具契约、权限与沙箱，到工具生态设计。"
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
    <span class="ahf-kicker">AI Agent Fables / Lesson 05</span>
    <h2>会借工具的学徒：工具、MCP 与 Skill</h2>
    <p>这是 AI 与 Agent 大寓言课第 05 讲的章节目录。第 05 讲走进一间工具行，跟着学徒阿器从“开一张领用单”学到“打理一整架工具”，把工具调用、MCP、Skill、工具契约、权限和工具生态讲清楚。</p>
    <div class="ahf-parent">
      <span>上层目录：AI 与 Agent 大寓言课 / 第 05 讲</span>
      <a class="ahf-link" href="/courses/ai-agent-fables/">返回总目录</a>
      <a class="ahf-link" href="/2026/06/18/ai-agent-fables-05-tools-mcp-skill/">阅读第五讲概览</a>
    </div>
  </section>
  <section class="ahf-note">
    <p>层级说明：大课程的“讲”是学习等级；第 05 讲下面拆成 6 个章节。建议先读概览，再顺着 05.1 到 05.6 往下走。</p>
  </section>
  <section class="ahf-note">
    <p>本讲脉络（一条故事线）：学徒阿器在工具行里——先学<strong>开领用单借工具</strong>（05.1）→ 对接<strong>统一柜台的规矩</strong>（05.2）→ 用<strong>收在架上的工具包</strong>（05.3）→ 看懂<strong>工具的说明牌</strong>（05.4）→ 守住<strong>权限与沙箱</strong>（05.5）→ 学会<strong>打理一整架工具</strong>（05.6）。老掌柜贯穿全程，每章承上启下。</p>
  </section>
  <h2 class="ahf-section-title">第 05 讲学习路径</h2>
  <section class="ahf-list" aria-label="第五讲章节目录">
    <article class="ahf-card">
      <span class="ahf-number">05.0</span>
      <div><small>概览</small><h3>会借工具的学徒</h3><p>用工具行寓言把工具调用、MCP、Skill 和权限边界放进同一条主线。</p></div>
      <a class="ahf-link" href="/2026/06/18/ai-agent-fables-05-tools-mcp-skill/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">05.1</span>
      <div><small>Tool Calling 基础</small><h3>开一张领用单</h3><p>工具定义、参数 schema、tool result——模型判断和编排，工具负责精确执行。</p></div>
      <a class="ahf-link" href="/2026/06/20/ai-agent-fables-05-ch1-tool-calling/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">05.2</span>
      <div><small>MCP 的位置</small><h3>统一柜台的规矩</h3><p>客户端、服务器、tools/resources/prompts——一套标准接法，免得每接一个都重写。</p></div>
      <a class="ahf-link" href="/2026/06/20/ai-agent-fables-05-ch2-mcp/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">05.3</span>
      <div><small>Skill 是按需能力包</small><h3>收在架上的工具包</h3><p>SKILL.md、渐进式披露、随附脚本——能力可以很多，上下文却不被撑爆。</p></div>
      <a class="ahf-link" href="/2026/06/20/ai-agent-fables-05-ch3-skills/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">05.4</span>
      <div><small>工具契约质量</small><h3>工具的说明牌</h3><p>何时用、何时不用、错误语义、示例——工具调优，多半是在调合同。</p></div>
      <a class="ahf-link" href="/2026/06/20/ai-agent-fables-05-ch4-tool-contracts/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">05.5</span>
      <div><small>权限与沙箱</small><h3>不是什么工具都随便借</h3><p>只读/写入、密钥边界、审批、沙箱、审计——会用工具之后，安全才真正开始。</p></div>
      <a class="ahf-link" href="/2026/06/20/ai-agent-fables-05-ch5-permissions-sandbox/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">05.6</span>
      <div><small>工具生态设计</small><h3>工具太多反而难</h3><p>工具召回、分组、版本治理——工具不是越多越好，是越好找、越拿得对越好。</p></div>
      <a class="ahf-link" href="/2026/06/20/ai-agent-fables-05-ch6-tool-ecosystem/">阅读</a>
    </article>
  </section>
  <h2 class="ahf-section-title">读完这一讲应能带走什么</h2>
  <section class="ahf-rhythm-grid">
    <div class="ahf-rhythm"><strong>会借工具</strong><p>懂工具调用的来回，分得清工具、MCP 和 Skill 各是什么、怎么配合。</p></div>
    <div class="ahf-rhythm"><strong>会写契约</strong><p>能把工具说明牌写到“删了名字也看得懂”，让模型用对而不是用废。</p></div>
    <div class="ahf-rhythm"><strong>会守边界</strong><p>分清只读与写入，懂最小权限、审批、沙箱、审计，敢把工具放出去用。</p></div>
  </section>
</div>
