---
title: "Agent Harness 寓言课"
date: 2026-06-18 11:32:00
description: "把 Harness 101 的机制拆成 12 个寓言故事：循环、工具、上下文、记忆、编排、沙箱和面向 Agent 的文档。"
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
  max-width: 940px;
  margin: 0 auto;
  color: var(--ahf-ink);
}
.ahf-track * { box-sizing: border-box; }
.ahf-hero {
  padding: 32px;
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
.ahf-hero h2 { margin: 0 0 14px; font-size: 31px; line-height: 1.25; letter-spacing: 0; }
.ahf-hero p,
.ahf-note p,
.ahf-card p,
.ahf-rhythm p {
  margin: 0;
  color: var(--ahf-muted);
  line-height: 1.8;
}
.ahf-section-title { margin: 34px 0 16px; font-size: 22px; letter-spacing: 0; }
.ahf-note {
  margin-top: 18px;
  padding: 16px 18px;
  border-left: 4px solid var(--ahf-rust);
  border-radius: 8px;
  background: var(--ahf-wash);
}
.ahf-list { display: grid; gap: 14px; }
.ahf-card {
  display: grid;
  grid-template-columns: 54px minmax(0, 1fr) auto;
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
  width: 42px;
  height: 42px;
  border-radius: 8px;
  color: #ffffff;
  background: var(--ahf-green);
  font-weight: 800;
}
.ahf-card h3 { margin: 0 0 7px; font-size: 19px; letter-spacing: 0; }
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
  .ahf-hero h2 { font-size: 26px; }
  .ahf-card { grid-template-columns: 1fr; gap: 12px; }
  .ahf-number { width: 40px; height: 40px; }
  .ahf-rhythm-grid { grid-template-columns: 1fr; }
  .ahf-link { width: 100%; }
}
</style>

<div class="ahf-track">
  <section class="ahf-hero">
    <span class="ahf-kicker">Agent Harness Fables</span>
    <h2>先听懂故事，再看懂 Agent 外壳</h2>
    <p>这门课从 Harness 101 系列文章出发，再用 ReAct 论文、Anthropic、OpenAI、MCP、Plan 9 等公开资料交叉补证。每一讲先讲一个寓言，再落回机制、误区和练习，目标是让非框架作者也能听懂 Agent Harness 为什么重要。</p>
    <div class="ahf-parent">
      <span>这是 AI 与 Agent 大寓言课的第四部。</span>
      <a class="ahf-link" href="/courses/ai-agent-fables/">返回总目录</a>
    </div>
  </section>
  <section class="ahf-note">
    <p>边界说明：课程不会搬运原始材料，而是按“寓言 + 机制 + 公开资料”的方式重写。涉及具体产品内部实现时，只采用公开文档可核验的表述；不可公开确认的细节只抽象为通用工程模式。</p>
  </section>

  <h2 class="ahf-section-title">学习顺序</h2>
  <section class="ahf-list" aria-label="Agent Harness 寓言课目录">
    <article class="ahf-card">
      <span class="ahf-number">01</span>
      <div><h3>磨坊的水车为什么会自己转</h3><p>Agent Loop 不是一次回答，而是观察、行动、再观察的循环。</p></div>
      <a class="ahf-link" href="/2026/06/18/agent-harness-fables-01-loop/">阅读文章</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">02</span>
      <div><h3>送信人和回音井</h3><p>ReAct Loop 与 tool calling 的完整闭环：模型写单子，Harness 执行动作。</p></div>
      <a class="ahf-link" href="/2026/06/18/agent-harness-fables-02-react/">阅读文章</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">03</span>
      <div><h3>马不是马车</h3><p>模型只是马，Harness 才是缰绳、车厢、驿站、权限和账本。</p></div>
      <a class="ahf-link" href="/2026/06/18/agent-harness-fables-03-model-plus-harness/">阅读文章</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">04</span>
      <div><h3>集市不是一条流水线</h3><p>什么时候用 workflow，什么时候需要 Agent 或动态编排。</p></div>
      <a class="ahf-link" href="/2026/06/18/agent-harness-fables-04-orchestration/">阅读文章</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">05</span>
      <div><h3>铁匠铺的工具契约</h3><p>工具定义是写给模型的合同，坏合同会让好模型拿错锤子。</p></div>
      <a class="ahf-link" href="/2026/06/18/agent-harness-fables-05-tools/">阅读文章</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">06</span>
      <div><h3>没有记忆的王国</h3><p>Company Brain、事实记忆、交互记忆和行动记忆。</p></div>
      <a class="ahf-link" href="/2026/06/18/agent-harness-fables-06-company-brain/">阅读文章</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">07</span>
      <div><h3>背包和仓库</h3><p>Context Offloading 与压缩的区别：搬家不是瘦身。</p></div>
      <a class="ahf-link" href="/2026/06/18/agent-harness-fables-07-offloading/">阅读文章</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">08</span>
      <div><h3>三种行囊整理法</h3><p>热路径清理、阶段性摘要、交接重启，三种上下文治理策略。</p></div>
      <a class="ahf-link" href="/2026/06/18/agent-harness-fables-08-compaction/">阅读文章</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">09</span>
      <div><h3>把世界挂成一棵树</h3><p>从 Plan 9、/proc 和 FUSE 讲到写给 Agent 的虚拟文件系统。</p></div>
      <a class="ahf-link" href="/2026/06/18/agent-harness-fables-09-agentfs/">阅读文章</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">10</span>
      <div><h3>工具棚里的十把工具</h3><p>把 Coding Agent 工具分成找、看、改、跑四类，再谈安全边界。</p></div>
      <a class="ahf-link" href="/2026/06/18/agent-harness-fables-10-tool-shed/">阅读文章</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">11</span>
      <div><h3>村规、便签和防火墙</h3><p>系统提示词、记忆、渐进式披露和运行时提醒各放一层。</p></div>
      <a class="ahf-link" href="/2026/06/18/agent-harness-fables-11-prompt-memory/">阅读文章</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">12</span>
      <div><h3>给工匠看的第二张图纸</h3><p>README 给人看，Install.md 给 Agent 执行：目标、规则、验收、停机。</p></div>
      <a class="ahf-link" href="/2026/06/18/agent-harness-fables-12-install-md/">阅读文章</a>
    </article>
  </section>

  <h2 class="ahf-section-title">读完应能带走什么</h2>
  <section class="ahf-rhythm-grid">
    <div class="ahf-rhythm"><strong>会拆结构</strong><p>能把一个 Agent 拆成模型、工具、上下文、权限、记忆和观测。</p></div>
    <div class="ahf-rhythm"><strong>会看边界</strong><p>知道哪些动作该进工具，哪些该进文件系统，哪些必须进沙箱。</p></div>
    <div class="ahf-rhythm"><strong>会写规约</strong><p>能写出给 Agent 读的工具契约、记忆条目和 Install.md。</p></div>
  </section>
</div>
