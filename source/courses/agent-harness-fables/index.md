---
title: "AI 与 Agent 大寓言课 06：Agent Loop 与 Harness 章节目录"
date: 2026-06-18 11:32:00
description: "AI 与 Agent 大寓言课第 06 讲的专题目录：从 Agent Loop、ReAct、工具契约、上下文搬运到面向 Agent 的文档。"
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
    <span class="ahf-kicker">AI Agent Fables / Lesson 06</span>
    <h2>会自己绕圈的工坊：Agent Loop 与 Harness</h2>
    <p>这里不是总课的 12 个并列大类，而是 AI 与 Agent 大寓言课第 06 讲下面的专题目录。第 06 讲先用一篇概览文章讲“循环怎么被管住”，再把 Harness 101 拆成多篇章节文章：每篇先用寓言建立直觉，再回到源文档里的机制、历史、误区和工程边界。</p>
    <div class="ahf-parent">
      <span>上层目录：AI 与 Agent 大寓言课 / 第 06 讲</span>
      <a class="ahf-link" href="/courses/ai-agent-fables/">返回总目录</a>
      <a class="ahf-link" href="/2026/06/18/ai-agent-fables-06-agent-loop/">阅读第六讲概览</a>
    </div>
  </section>

  <section class="ahf-note">
    <p>层级说明：大课程的“讲”是学习等级；第 06 讲下面可以有章节，章节下面还可以继续拆小节。当前这一页把 Feishu《Harness 101》根节点下的 12 篇文章全部纳入第 06 讲，不再把它们误当成总课的 12 个大类。</p>
  </section>

  <h2 class="ahf-section-title">第 06 讲学习路径</h2>
  <section class="ahf-list" aria-label="第六讲章节目录">
    <article class="ahf-card">
      <span class="ahf-number">06.0</span>
      <div><small>概览</small><h3>会绕圈的工坊：Agent Loop 与 Harness</h3><p>先建立 Agent Loop、ReAct、运行框架、停止条件、状态、预算和人类监督的基础图谱。</p></div>
      <a class="ahf-link" href="/2026/06/18/ai-agent-fables-06-agent-loop/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">06.1</span>
      <div><small>Harness 101：从 ReAct Loop 讲起</small><h3>磨坊的水车为什么会自己转</h3><p>从单轮 ReAct、多轮 Deep Research、Plan-then-Act、Coding Agent、Offloading 和 Skill 建立第一张 Harness 结构图。</p></div>
      <a class="ahf-link" href="/2026/06/18/agent-harness-fables-01-loop/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">06.S1</span>
      <div><small>补充小节</small><h3>送信人和回音井</h3><p>把 ReAct 与 tool calling 的单轮、并行、多轮闭环单独讲一遍，适合在 06.1 前后补读。</p></div>
      <a class="ahf-link" href="/2026/06/18/agent-harness-fables-02-react/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">06.2</span>
      <div><small>Harness 101：模型之外的全部</small><h3>马不是马车</h3><p>模型只是能力来源，Harness 才是文件系统、工具、沙箱、记忆、搜索、hooks、长程调度和收敛趋势。</p></div>
      <a class="ahf-link" href="/2026/06/18/agent-harness-fables-03-model-plus-harness/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">06.3</span>
      <div><small>Harness 101：Loop Engineering</small><h3>集市不是一条流水线</h3><p>从 ReAct 到 Orchestration，区分 Skill、Dynamic Workflow、agent()、workflow、human-in-the-loop 和视频生成类编排。</p></div>
      <a class="ahf-link" href="/2026/06/18/agent-harness-fables-04-orchestration/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">06.4</span>
      <div><small>Harness 101：工具的真相</small><h3>铁匠铺的工具契约</h3><p>工具不是魔法，而是模型可读的契约；历史上从纯 prompt ReAct 走向结构化 Tool API。</p></div>
      <a class="ahf-link" href="/2026/06/18/agent-harness-fables-05-tools/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">06.5</span>
      <div><small>Harness 101：Company Brain</small><h3>没有记忆的王国</h3><p>把组织记忆拆成事实记忆、交互记忆和行动记忆，理解为什么公司知识不能只靠聊天历史。</p></div>
      <a class="ahf-link" href="/2026/06/18/agent-harness-fables-06-company-brain/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">06.6</span>
      <div><small>Harness 101：Context Offloading</small><h3>背包和仓库</h3><p>讲清引用、历史改写、args/results 非对称、阈值和隐藏预算：搬运上下文不等于简单摘要。</p></div>
      <a class="ahf-link" href="/2026/06/18/agent-harness-fables-07-offloading/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">06.7</span>
      <div><small>Harness 101：三种上下文压缩</small><h3>三种行囊整理法</h3><p>区分热路径清理、阶段性压缩和冷启动交接，理解 Microcompact、cache_edits 和分层压缩。</p></div>
      <a class="ahf-link" href="/2026/06/18/agent-harness-fables-08-compaction/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">06.8</span>
      <div><small>Harness 101：写给 Agent 的虚拟文件系统</small><h3>把世界挂成一棵树</h3><p>从路径命名空间、Provider 协议、Session 隔离和派发流程看 AgentFS 这种轻量接口层。</p></div>
      <a class="ahf-link" href="/2026/06/18/agent-harness-fables-09-agentfs/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">06.9</span>
      <div><small>Harness 101：常用工具一览</small><h3>工具棚里的十把工具</h3><p>从 WebSearch、WebFetch、Glob、Grep、Read、Write、Edit、Bash 到组合模式和安全边界。</p></div>
      <a class="ahf-link" href="/2026/06/18/agent-harness-fables-10-tool-shed/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">06.10</span>
      <div><small>Harness 101：Claude.AI 提示词与记忆结构解析</small><h3>村规、便签和防火墙</h3><p>从 progressive disclosure、记忆防伪、prompt 防火墙、XML 标签和 plugin 装配理解提示词工程。</p></div>
      <a class="ahf-link" href="/2026/06/18/agent-harness-fables-11-prompt-memory/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">06.11</span>
      <div><small>Harness 101：从 for 循环到自治系统</small><h3>会巡城的钟楼</h3><p>补齐原先漏掉的一篇：从浅循环、深循环、DeepAgents、Middleware 到自治系统的三次进化。</p></div>
      <a class="ahf-link" href="/2026/06/18/agent-harness-fables-11-for-loop-autonomy/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">06.12</span>
      <div><small>Harness 101：专为 Agent 设计的 Install.md</small><h3>给工匠看的第二张图纸</h3><p>README 给人读，Install.md 给执行者读：Goal、成功标准、操作规则、决策树、TODO 和停止边界。</p></div>
      <a class="ahf-link" href="/2026/06/18/agent-harness-fables-12-install-md/">阅读</a>
    </article>
  </section>

  <h2 class="ahf-section-title">读完这一讲应能带走什么</h2>
  <section class="ahf-rhythm-grid">
    <div class="ahf-rhythm"><strong>会拆循环</strong><p>能判断一个系统只是一次回答，还是有状态、有工具、有停止条件的循环。</p></div>
    <div class="ahf-rhythm"><strong>会看外壳</strong><p>能把 Harness 拆成工具、上下文、记忆、沙箱、权限、hooks、trace 和 eval。</p></div>
    <div class="ahf-rhythm"><strong>会写契约</strong><p>能写工具说明、运行规则、上下文搬运策略和面向 Agent 的执行文档。</p></div>
  </section>
</div>
