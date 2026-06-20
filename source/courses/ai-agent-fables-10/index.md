---
title: "AI 与 Agent 大寓言课 10：会看会听的旅人 章节目录"
date: 2026-06-21 13:00:00
description: "AI 与 Agent 大寓言课第 10 讲的专题目录：从视觉、音频语音、多模态 RAG、Computer Use、UI Agent 失败模式，到体验设计。"
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
    <span class="ahf-kicker">AI Agent Fables / Lesson 10</span>
    <h2>会看会听的旅人：多模态与计算机使用</h2>
    <p>这是 AI 与 Agent 大寓言课第 10 讲的章节目录。第 10 讲跟着学徒旅人阿行上路，从用眼睛看、用耳朵听，到自己动手办事，把视觉、语音、多模态 RAG、Computer Use 和体验设计讲清楚。</p>
    <div class="ahf-parent">
      <span>上层目录：AI 与 Agent 大寓言课 / 第 10 讲</span>
      <a class="ahf-link" href="/courses/ai-agent-fables/">返回总目录</a>
      <a class="ahf-link" href="/2026/06/18/ai-agent-fables-10-multimodal-computer-use/">阅读第十讲概览</a>
    </div>
  </section>
  <section class="ahf-note">
    <p>层级说明：大课程的“讲”是学习等级；第 10 讲下面拆成 6 个章节。建议先读概览，再顺着 10.1 到 10.6 往下走。</p>
  </section>
  <section class="ahf-note">
    <p>本讲脉络（一条故事线）：学徒旅人阿行上路——先学<strong>用眼睛看路</strong>（10.1）→ 学<strong>用耳朵听</strong>（10.2）→ 会<strong>把一路速写翻查</strong>（10.3）→ <strong>自己动手办事</strong>（10.4）→ 认得<strong>照界面办事的坑</strong>（10.5）→ 懂得<strong>怎样让人放心交给它</strong>（10.6）。老向导贯穿全程，每章承上启下。</p>
  </section>
  <h2 class="ahf-section-title">第 10 讲学习路径</h2>
  <section class="ahf-list" aria-label="第十讲章节目录">
    <article class="ahf-card">
      <span class="ahf-number">10.0</span>
      <div><small>概览</small><h3>会看会听的旅人</h3><p>用旅途寓言把视觉、语音、多模态和计算机使用放进同一条主线。</p></div>
      <a class="ahf-link" href="/2026/06/18/ai-agent-fables-10-multimodal-computer-use/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">10.1</span>
      <div><small>视觉模型基础</small><h3>旅人靠眼睛看路</h3><p>图像理解、OCR、视觉定位、空间关系——看得清，还要知道自己可能看错。</p></div>
      <a class="ahf-link" href="/2026/06/21/ai-agent-fables-10-ch1-vision/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">10.2</span>
      <div><small>音频与语音</small><h3>旅人靠耳朵听</h3><p>ASR、TTS、音频事件、实时交互——让 AI 接上声音世界，又快又准很难。</p></div>
      <a class="ahf-link" href="/2026/06/21/ai-agent-fables-10-ch2-audio-speech/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">10.3</span>
      <div><small>多模态 RAG</small><h3>一路的速写怎么翻查</h3><p>图片/视频切片、embedding、引用、证据展示——第四讲 RAG 的多模态版。</p></div>
      <a class="ahf-link" href="/2026/06/21/ai-agent-fables-10-ch3-multimodal-rag/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">10.4</span>
      <div><small>Computer Use</small><h3>旅人自己动手办事</h3><p>屏幕观察、点击/输入、状态恢复、人类确认——视觉 + 工具 + Agent Loop 的组合。</p></div>
      <a class="ahf-link" href="/2026/06/21/ai-agent-fables-10-ch4-computer-use/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">10.5</span>
      <div><small>UI Agent 的失败模式</small><h3>照界面办事最容易栽的几样</h3><p>坐标漂移、弹窗、隐藏状态、可访问性——界面是给人设计的，不是给机器点坐标的。</p></div>
      <a class="ahf-link" href="/2026/06/21/ai-agent-fables-10-ch5-ui-agent-failures/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">10.6</span>
      <div><small>体验设计</small><h3>凭什么放心交给它</h3><p>可见进度、接管权、纠错、信任边界——把强大能力变成让人安心的产品。</p></div>
      <a class="ahf-link" href="/2026/06/21/ai-agent-fables-10-ch6-experience-design/">阅读</a>
    </article>
  </section>
  <h2 class="ahf-section-title">读完这一讲应能带走什么</h2>
  <section class="ahf-rhythm-grid">
    <div class="ahf-rhythm"><strong>会看会听</strong><p>懂视觉与语音的能力和边界，知道 OCR/ASR 会错、要校验。</p></div>
    <div class="ahf-rhythm"><strong>会动手</strong><p>理解 Computer Use 是视觉+工具+循环，认得 UI Agent 的脆弱与失败模式。</p></div>
    <div class="ahf-rhythm"><strong>会设计体验</strong><p>懂可见进度、接管、纠错和信任边界，把能力做成人敢用的产品。</p></div>
  </section>
</div>
