---
title: "多 Agent 编排实战"
date: 2026-06-15 19:30:00
description: "从一张跑着 60 个 agent 的截图出发，把多智能体编排的原理、模式、成本和落地方式讲清楚。"
---

<style>
.mao-track {
  --mao-ink: #17202a;
  --mao-muted: #5d6f7f;
  --mao-line: rgba(23, 32, 42, 0.12);
  --mao-panel: #ffffff;
  --mao-wash: #f5f8fa;
  --mao-blue: #4A90D9;
  --mao-cyan: #7EC8E3;
  --mao-amber: #F5A623;
  max-width: 920px;
  margin: 0 auto;
  color: var(--mao-ink);
}
.mao-track * { box-sizing: border-box; }
.mao-hero {
  padding: 32px;
  border: 1px solid var(--mao-line);
  border-left: 5px solid var(--mao-blue);
  border-radius: 8px;
  background: #fbfcfe;
  box-shadow: 0 10px 26px rgba(23, 32, 42, 0.05);
}
.mao-kicker {
  display: inline-flex;
  margin-bottom: 14px;
  padding: 5px 9px;
  border-radius: 999px;
  color: var(--mao-blue);
  background: rgba(74, 144, 217, 0.1);
  font-size: 13px;
  font-weight: 700;
}
.mao-hero h2 { margin: 0 0 14px; font-size: 31px; line-height: 1.25; letter-spacing: 0; }
.mao-hero p, .mao-note p, .mao-card p, .mao-rhythm p {
  margin: 0; color: var(--mao-muted); line-height: 1.8;
}
.mao-section-title { margin: 34px 0 16px; font-size: 22px; letter-spacing: 0; }
.mao-note {
  margin-top: 18px; padding: 16px 18px;
  border-left: 4px solid var(--mao-amber); border-radius: 8px; background: var(--mao-wash);
}
.mao-list { display: grid; gap: 14px; }
.mao-card {
  display: grid; grid-template-columns: 54px minmax(0, 1fr) auto; gap: 16px; align-items: center;
  padding: 18px; border: 1px solid var(--mao-line); border-radius: 8px; background: var(--mao-panel);
  box-shadow: 0 10px 24px rgba(23, 32, 42, 0.06);
  transition: border-color 0.16s ease, box-shadow 0.16s ease, transform 0.16s ease;
}
.mao-card:hover {
  border-color: rgba(74, 144, 217, 0.32); box-shadow: 0 14px 30px rgba(23, 32, 42, 0.08); transform: translateY(-1px);
}
.mao-number {
  display: inline-flex; align-items: center; justify-content: center; width: 42px; height: 42px;
  border-radius: 8px; color: #ffffff; background: var(--mao-blue); font-weight: 800;
}
.mao-card h3 { margin: 0 0 7px; font-size: 19px; letter-spacing: 0; }
.mao-link {
  display: inline-flex; align-items: center; justify-content: center; min-height: 38px; padding: 8px 13px;
  border: 1px solid rgba(74, 144, 217, 0.3); border-radius: 8px; color: var(--mao-blue);
  font-weight: 700; text-decoration: none !important; white-space: nowrap;
}
.mao-link:hover { color: #ffffff; background: var(--mao-blue); }
.mao-rhythm-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.mao-rhythm { padding: 16px; border: 1px solid var(--mao-line); border-radius: 8px; background: var(--mao-wash); }
.mao-rhythm strong { display: block; margin-bottom: 6px; }
html[data-user-color-scheme="dark"] .mao-track {
  --mao-ink: rgba(246, 249, 252, 0.94);
  --mao-muted: rgba(224, 233, 242, 0.72);
  --mao-line: rgba(255, 255, 255, 0.1);
  --mao-panel: rgba(23, 32, 42, 0.9);
  --mao-wash: rgba(255, 255, 255, 0.045);
}
html[data-user-color-scheme="dark"] .mao-hero,
html[data-user-color-scheme="dark"] .mao-card { background: var(--mao-panel); }
@media (max-width: 760px) {
  .mao-hero { padding: 22px; }
  .mao-hero h2 { font-size: 26px; }
  .mao-card { grid-template-columns: 1fr; gap: 12px; }
  .mao-number { width: 40px; height: 40px; }
  .mao-rhythm-grid { grid-template-columns: 1fr; }
  .mao-link { width: 100%; }
}
</style>

<div class="mao-track">
  <section class="mao-hero">
    <span class="mao-kicker">Multi-Agent Orchestration</span>
    <h2>一个人指挥不过来，就让一群 agent 同时干</h2>
    <p>这门课从一张真实截图讲起：一次代码审查同时跑了 60 个 agent，9 个 finder 各看一个维度，再逐条验证、补漏、合成。多 Agent 编排不是“人多力量大”那么简单，它的真正引擎是上下文隔离和并行。这门课按“为什么 → 怎么分工 → 怎么落地 → 什么时候别用”来排。</p>
  </section>
  <section class="mao-note">
    <p>边界说明：课程讲原理、模式和工程权衡，引用的都是公开资料（Anthropic 工程博客、各框架官方文档与论文）。多 Agent 很贵——本课会反复提醒“什么时候不该用”，而不是鼓励你给每个任务都开一堆 agent。</p>
  </section>
  <h2 class="mao-section-title">文章目录</h2>
  <section class="mao-list" aria-label="多 Agent 编排学习文章目录">
    <article class="mao-card">
      <span class="mao-number">01</span>
      <div>
        <h3>为什么要多 Agent：单 agent 的上下文瓶颈</h3>
        <p>上下文是有限资源、会“腐烂”。并行 + 上下文隔离，才是多 agent 的两大卖点。</p>
      </div>
      <a class="mao-link" href="/2026/06/15/multi-agent-why-context-bottleneck/">阅读文章</a>
    </article>
    <article class="mao-card">
      <span class="mao-number">02</span>
      <div>
        <h3>先分清 Workflow 和 Agent</h3>
        <p>写死的代码路径 vs 模型自主决定路线，以及五种基础编排模式总览。</p>
      </div>
      <a class="mao-link" href="/2026/06/15/multi-agent-workflow-vs-agent/">阅读文章</a>
    </article>
    <article class="mao-card">
      <span class="mao-number">03</span>
      <div>
        <h3>八种编排模式全景</h3>
        <p>用同一套“公司/团队”比喻，把 orchestrator、流水线、map-reduce、辩论投票等一次讲透。</p>
      </div>
      <a class="mao-link" href="/2026/06/15/multi-agent-orchestration-patterns/">阅读文章</a>
    </article>
    <article class="mao-card">
      <span class="mao-number">04</span>
      <div>
        <h3>上下文隔离：多 Agent 真正的引擎</h3>
        <p>子 agent 烧几万 token 探索，只回传一两千 token 摘要。脏活留在子 agent 里。</p>
      </div>
      <a class="mao-link" href="/2026/06/15/multi-agent-context-isolation/">阅读文章</a>
    </article>
    <article class="mao-card">
      <span class="mao-number">05</span>
      <div>
        <h3>让结论可信：验证、投票与对抗式审查</h3>
        <p>多视角投票、对抗式证伪、生成器-评审循环，怎么把假阳性过滤掉。</p>
      </div>
      <a class="mao-link" href="/2026/06/15/multi-agent-verification-voting/">阅读文章</a>
    </article>
    <article class="mao-card">
      <span class="mao-number">06</span>
      <div>
        <h3>案例解剖：code-review-max 在干嘛</h3>
        <p>把那张 60 agent 的截图逐阶段拆开：Find 9 维 → 逐条 Verify → Sweep → Synthesize。</p>
      </div>
      <a class="mao-link" href="/2026/06/15/multi-agent-case-code-review-max/">阅读文章</a>
    </article>
    <article class="mao-card">
      <span class="mao-number">07</span>
      <div>
        <h3>成本、并发与边界：什么时候别用</h3>
        <p>多 agent 约是普通聊天的 15 倍 token。讲清收益的同时，更要讲清代价和反模式。</p>
      </div>
      <a class="mao-link" href="/2026/06/15/multi-agent-cost-when-to-use/">阅读文章</a>
    </article>
    <article class="mao-card">
      <span class="mao-number">08</span>
      <div>
        <h3>工具与框架地图，以及在 Claude Code 里落地</h3>
        <p>LangGraph、CrewAI、AutoGen/MAF、OpenAI Agents SDK……以及 Claude Code 的 Workflow 怎么写。</p>
      </div>
      <a class="mao-link" href="/2026/06/15/multi-agent-tools-frameworks/">阅读文章</a>
    </article>
  </section>
  <h2 class="mao-section-title">学习节奏</h2>
  <section class="mao-rhythm-grid">
    <article class="mao-rhythm">
      <strong>先问值不值</strong>
      <p>能用一个 agent + 检索解决的，就别上多 agent。先评估任务是不是真的开放、信息量大、可并行。</p>
    </article>
    <article class="mao-rhythm">
      <strong>分工说清楚</strong>
      <p>每个子 agent 都要有目标、输出格式、工具指引和清晰边界，否则会重复劳动、互相干扰。</p>
    </article>
    <article class="mao-rhythm">
      <strong>让脏活留在子 agent</strong>
      <p>子 agent 在独立上下文里探索，只把提炼后的结论回传，主 agent 才不会被噪音淹没。</p>
    </article>
    <article class="mao-rhythm">
      <strong>验证再下结论</strong>
      <p>并行产出的发现要经过投票或对抗式验证，过滤假阳性，结论才可信。</p>
    </article>
  </section>
</div>
