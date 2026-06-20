---
title: "AI 与 Agent 大寓言课"
date: 2026-06-18 14:10:00
description: "从 AI 导论、机器学习、LLM、MCP、Skills、Agent Loop、评测、安全、SDD、多 Agent 和产品化工程逐层展开的寓言课总目录。"
---

<style>
.aaf-page {
  --aaf-ink: #1d2127;
  --aaf-text: #2d333a;
  --aaf-muted: #68727e;
  --aaf-line: rgba(29, 33, 39, 0.13);
  --aaf-panel: #ffffff;
  --aaf-wash: #f6f7f5;
  --aaf-red: #b73a2c;
  --aaf-blue: #3f5d7e;
  --aaf-green: #2f765f;
  --aaf-amber: #9b6632;
  width: min(100%, calc(100vw - 32px));
  margin: 0 auto;
  color: var(--aaf-text);
  overflow-x: hidden;
}

.aaf-page * {
  box-sizing: border-box;
  min-width: 0;
}

.aaf-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.18fr) minmax(240px, 0.82fr);
  gap: 24px;
  align-items: end;
  padding: 34px;
  border: 1px solid var(--aaf-line);
  border-left: 5px solid var(--aaf-red);
  border-radius: 4px;
  background:
    linear-gradient(135deg, rgba(183, 58, 44, 0.08), rgba(47, 118, 95, 0.07)),
    var(--aaf-panel);
}

.aaf-kicker,
.aaf-badge {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  border-radius: 999px;
  font-weight: 780;
}

.aaf-kicker {
  margin-bottom: 14px;
  padding: 6px 10px;
  color: var(--aaf-red);
  background: rgba(183, 58, 44, 0.1);
  font-size: 13px;
}

.aaf-hero h2 {
  margin: 0 0 14px;
  color: var(--aaf-ink);
  font-size: 32px;
  line-height: 1.2;
  letter-spacing: 0;
  overflow-wrap: anywhere;
}

.aaf-hero p,
.aaf-module p,
.aaf-link-card p,
.aaf-principle p,
.aaf-source p,
.aaf-note p {
  margin: 0;
  color: var(--aaf-muted);
  line-height: 1.8;
  overflow-wrap: anywhere;
}

.aaf-hero-list {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.aaf-hero-list li {
  padding: 12px 14px;
  border: 1px solid var(--aaf-line);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.74);
  color: var(--aaf-ink);
  font-weight: 740;
}

.aaf-section-head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16px;
  align-items: end;
  margin: 34px 0 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--aaf-line);
}

.aaf-section-head h2 {
  margin: 0 0 6px !important;
  padding: 0 !important;
  border: 0 !important;
  color: var(--aaf-ink);
  font-size: 24px;
  letter-spacing: 0;
}

.aaf-section-head h2::before {
  display: none !important;
}

.aaf-section-head p {
  margin: 0;
  color: var(--aaf-muted);
  line-height: 1.7;
}

.aaf-count {
  padding: 8px 10px;
  border: 1px solid var(--aaf-line);
  border-radius: 4px;
  color: var(--aaf-blue);
  background: rgba(63, 93, 126, 0.08);
  font-weight: 760;
  white-space: nowrap;
}

.aaf-module-list {
  display: grid;
  gap: 15px;
  counter-reset: module;
}

.aaf-module {
  display: grid;
  grid-template-columns: 58px minmax(0, 1fr) minmax(190px, 0.34fr);
  gap: 18px;
  align-items: center;
  padding: 20px;
  border: 1px solid var(--aaf-line);
  border-radius: 4px;
  background: var(--aaf-panel);
  box-shadow: 0 10px 26px rgba(22, 32, 42, 0.06);
}

.aaf-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 8px;
  color: #ffffff;
  background: var(--aaf-red);
  font-weight: 850;
}

.aaf-module:nth-child(2) .aaf-number { background: var(--aaf-blue); }
.aaf-module:nth-child(3) .aaf-number { background: var(--aaf-green); }
.aaf-module:nth-child(4) .aaf-number { background: var(--aaf-amber); }
.aaf-module:nth-child(5) .aaf-number { background: #6d557e; }
.aaf-module:nth-child(6) .aaf-number { background: #6b5b2f; }
.aaf-module:nth-child(7) .aaf-number { background: #8a4f43; }
.aaf-module:nth-child(8) .aaf-number { background: #4f6e88; }
.aaf-module:nth-child(9) .aaf-number { background: #7a3f58; }
.aaf-module:nth-child(10) .aaf-number { background: #3f6f7a; }
.aaf-module:nth-child(11) .aaf-number { background: #5f6f45; }
.aaf-module:nth-child(12) .aaf-number { background: #7d633b; }

.aaf-module h3 {
  margin: 0 0 8px;
  color: var(--aaf-ink);
  font-size: 20px;
  line-height: 1.3;
  letter-spacing: 0;
  overflow-wrap: anywhere;
}

.aaf-module ul {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
}

.aaf-module li {
  padding: 4px 8px;
  border-radius: 999px;
  color: var(--aaf-muted);
  background: var(--aaf-wash);
  font-size: 13px;
  line-height: 1.45;
}

.aaf-blueprint-grid {
  display: grid;
  gap: 14px;
}

.aaf-blueprint {
  padding: 18px;
  border: 1px solid var(--aaf-line);
  border-radius: 4px;
  background: var(--aaf-panel);
  box-shadow: 0 10px 24px rgba(22, 32, 42, 0.05);
}

.aaf-blueprint h3 {
  margin: 0 0 10px;
  color: var(--aaf-ink);
  font-size: 18px;
  line-height: 1.35;
}

.aaf-chapter-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.aaf-chapter-list li {
  padding: 10px 12px;
  border: 1px solid var(--aaf-line);
  border-radius: 4px;
  background: var(--aaf-wash);
  color: var(--aaf-muted);
  line-height: 1.65;
}

.aaf-chapter-list strong {
  display: block;
  margin-bottom: 4px;
  color: var(--aaf-blue);
}

.aaf-module-meta {
  display: grid;
  justify-items: end;
  gap: 12px;
}

.aaf-badge {
  padding: 5px 9px;
  color: var(--aaf-blue);
  background: rgba(63, 93, 126, 0.1);
  font-size: 13px;
}

.aaf-badge.is-ready {
  color: var(--aaf-green);
  background: rgba(47, 118, 95, 0.1);
}

.aaf-badge.is-next {
  color: var(--aaf-red);
  background: rgba(183, 58, 44, 0.1);
}

.aaf-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  padding: 8px 13px;
  border: 1px solid rgba(63, 93, 126, 0.26);
  border-radius: 4px;
  color: var(--aaf-blue);
  font-weight: 780;
  text-decoration: none !important;
  white-space: nowrap;
}

.aaf-link:hover,
.aaf-link:focus {
  color: #ffffff;
  background: var(--aaf-blue);
}

.aaf-link-grid,
.aaf-principle-grid,
.aaf-source-grid {
  display: grid;
  gap: 16px;
}

.aaf-link-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.aaf-principle-grid,
.aaf-source-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.aaf-link-card,
.aaf-principle,
.aaf-source,
.aaf-note {
  border: 1px solid var(--aaf-line);
  border-radius: 4px;
  background: var(--aaf-panel);
}

.aaf-link-card,
.aaf-principle,
.aaf-source {
  padding: 18px;
}

.aaf-link-card strong,
.aaf-principle strong,
.aaf-source strong {
  display: block;
  margin-bottom: 8px;
  color: var(--aaf-ink);
  font-size: 18px;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.aaf-link-card .aaf-link {
  margin-top: 16px;
}

.aaf-note {
  margin-top: 24px;
  padding: 18px;
  border-left: 4px solid var(--aaf-red);
  background: var(--aaf-wash);
}

html[data-user-color-scheme="dark"] .aaf-page {
  --aaf-ink: rgba(246, 249, 246, 0.94);
  --aaf-text: rgba(232, 238, 236, 0.88);
  --aaf-muted: rgba(221, 230, 226, 0.72);
  --aaf-line: rgba(255, 255, 255, 0.1);
  --aaf-panel: rgba(29, 36, 34, 0.92);
  --aaf-wash: rgba(255, 255, 255, 0.05);
}

html[data-user-color-scheme="dark"] .aaf-hero-list li {
  background: rgba(255, 255, 255, 0.045);
}

@media (max-width: 920px) {
  .aaf-hero,
  .aaf-module,
  .aaf-section-head {
    grid-template-columns: 1fr;
  }

  .aaf-module-meta {
    justify-items: start;
  }

  .aaf-link-grid,
  .aaf-principle-grid,
  .aaf-source-grid,
  .aaf-chapter-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 620px) {
  .aaf-hero,
  .aaf-module {
    padding: 16px 14px;
  }

  .aaf-hero h2 {
    font-size: 24px;
  }

  .aaf-link {
    width: 100%;
    white-space: normal;
  }
}
</style>

<div class="aaf-page">
  <section class="aaf-hero">
    <div>
      <span class="aaf-kicker">AI Agent Fables</span>
      <h2>从第一张菜谱，讲到会自己找工具的工匠</h2>
      <p>这是一套从零开始的 AI 与 Agent 寓言课路线图。它不会假装一页目录就等于完整课程，而是先把必须覆盖的知识板块列清楚：AI 导论、机器学习、深度学习、LLM、RAG、MCP、Skill、Agent Loop、AI 编程方法、评测、安全治理、多模态、多 Agent 和产品化工程。</p>
    </div>
    <ul class="aaf-hero-list" aria-label="课程学习原则">
      <li>每一讲先讲寓言，再落到真实机制。</li>
      <li>先建立概念，再进入框架和产品名词。</li>
      <li>每个大板块都标注资料锚点，避免只凭二手印象写课。</li>
    </ul>
  </section>

  <section class="aaf-section-head">
    <div>
      <h2>总学习地图</h2>
      <p>之前的 6 部主线只能算第一版骨架，容易漏掉数据/机器学习、评测、安全治理、多模态和产品化等大块知识。这里改成 12 个知识板块：按初学者顺序建立主线。如今 12 讲已全部展开成章节——每讲都在一个自洽的寓言世界里，从概览一路拆到 6 个章节，可点开下面任意一讲的“章节目录”直接读。</p>
    </div>
    <span class="aaf-count">12 个板块</span>
  </section>

  <section class="aaf-module-list" aria-label="AI 与 Agent 大寓言课目录">
    <article class="aaf-module">
      <span class="aaf-number">01</span>
      <div>
        <h3>会学手艺的小厨子：AI 导论与发展史</h3>
        <p>从“机器能不能学会规则之外的东西”讲起，先把 AI、机器学习、深度学习、生成式 AI、Agent 这些词放到一张历史地图里。</p>
        <ul>
          <li>AI 是什么</li>
          <li>符号主义</li>
          <li>统计学习</li>
          <li>生成式 AI 的位置</li>
        </ul>
      </div>
      <div class="aaf-module-meta">
        <span class="aaf-badge is-ready">章节已展开</span>
        <a class="aaf-link" href="/2026/06/18/ai-agent-fables-01-ai-history/">阅读第一讲</a>
        <a class="aaf-link" href="/courses/ai-agent-fables-01/">章节目录</a>
      </div>
    </article>
    <article class="aaf-module">
      <span class="aaf-number">02</span>
      <div>
        <h3>会分类的农夫：数据、特征与机器学习</h3>
        <p>AI 不是凭空聪明。先讲数据怎么来、标签怎么定、模型怎么训练、为什么会过拟合，以及如何用验证集和指标判断它有没有学会。</p>
        <ul>
          <li>数据集</li>
          <li>监督/无监督/强化学习</li>
          <li>训练与推理</li>
          <li>过拟合与泛化</li>
        </ul>
      </div>
      <div class="aaf-module-meta">
        <span class="aaf-badge is-ready">章节已展开</span>
        <a class="aaf-link" href="/2026/06/18/ai-agent-fables-02-machine-learning/">阅读第二讲</a>
        <a class="aaf-link" href="/courses/ai-agent-fables-02/">章节目录</a>
      </div>
    </article>
    <article class="aaf-module">
      <span class="aaf-number">03</span>
      <div>
        <h3>会说话的图书馆：深度学习与大模型</h3>
        <p>把神经网络、Transformer、token、embedding、预训练、微调和上下文窗口讲成一座会续写、会联想但也会误读的图书馆。</p>
        <ul>
          <li>神经网络</li>
          <li>Transformer</li>
          <li>Token 与向量</li>
          <li>预训练与微调</li>
        </ul>
      </div>
      <div class="aaf-module-meta">
        <span class="aaf-badge is-ready">章节已展开</span>
        <a class="aaf-link" href="/2026/06/18/ai-agent-fables-03-foundation-models/">阅读第三讲</a>
        <a class="aaf-link" href="/courses/ai-agent-fables-03/">章节目录</a>
      </div>
    </article>
    <article class="aaf-module">
      <span class="aaf-number">04</span>
      <div>
        <h3>会查档案的书记：提示词、上下文与 RAG</h3>
        <p>模型不是数据库。这里讲 prompt、上下文窗口、检索增强、记忆、幻觉和知识更新，让读者知道什么时候该问模型，什么时候该给资料。</p>
        <ul>
          <li>Prompt</li>
          <li>Context Window</li>
          <li>RAG</li>
          <li>幻觉与引用</li>
        </ul>
      </div>
      <div class="aaf-module-meta">
        <span class="aaf-badge is-ready">章节已展开</span>
        <a class="aaf-link" href="/2026/06/18/ai-agent-fables-04-rag-context/">阅读第四讲</a>
        <a class="aaf-link" href="/courses/ai-agent-fables-04/">章节目录</a>
      </div>
    </article>
    <article class="aaf-module">
      <span class="aaf-number">05</span>
      <div>
        <h3>会借工具的学徒：工具、MCP 与 Skill</h3>
        <p>模型会说话还不够，Agent 需要能看文件、查资料、调用工具和加载专门能力。这里讲工具调用、MCP 这种上下文协议，以及把说明、资源和脚本打包给 Agent 用的 Skill。</p>
        <ul>
          <li>Tool Calling</li>
          <li>MCP</li>
          <li>Skill</li>
          <li>权限与边界</li>
        </ul>
      </div>
      <div class="aaf-module-meta">
        <span class="aaf-badge is-ready">章节已展开</span>
        <a class="aaf-link" href="/2026/06/18/ai-agent-fables-05-tools-mcp-skill/">阅读第五讲</a>
        <a class="aaf-link" href="/courses/ai-agent-fables-05/">章节目录</a>
      </div>
    </article>
    <article class="aaf-module">
      <span class="aaf-number">06</span>
      <div>
        <h3>会自己绕圈的工坊：Agent Loop 与 Harness</h3>
        <p>这里讲 Agent Loop、ReAct、工具契约、上下文搬运、运行时提醒和面向 Agent 的文档。先读概览，再进入第六讲下面的 Harness 101 多章节目录。</p>
        <ul>
          <li>Agent Loop</li>
          <li>ReAct</li>
          <li>Harness</li>
          <li>Context Engineering</li>
        </ul>
      </div>
      <div class="aaf-module-meta">
        <span class="aaf-badge is-ready">章节已展开</span>
        <a class="aaf-link" href="/2026/06/18/ai-agent-fables-06-agent-loop/">阅读第六讲</a>
        <a class="aaf-link" href="/courses/agent-harness-fables/">章节目录</a>
      </div>
    </article>
    <article class="aaf-module">
      <span class="aaf-number">07</span>
      <div>
        <h3>会把灵感变蓝图的工匠：vibe coding 与 SDD</h3>
        <p>把“先凭感觉把东西跑起来”和“先写规格再让 Agent 施工”放在同一张地图里讲清楚：vibe coding 适合探索，Spec-Driven Development 适合把需求、验收、计划和实现连成可追踪流程。</p>
        <ul>
          <li>Vibe Coding</li>
          <li>Spec-Driven Development</li>
          <li>验收标准</li>
          <li>测试与评审</li>
        </ul>
      </div>
      <div class="aaf-module-meta">
        <span class="aaf-badge is-ready">章节已展开</span>
        <a class="aaf-link" href="/2026/06/18/ai-agent-fables-07-vibe-sdd/">阅读第七讲</a>
        <a class="aaf-link" href="/courses/ai-agent-fables-07/">章节目录</a>
      </div>
    </article>
    <article class="aaf-module">
      <span class="aaf-number">08</span>
      <div>
        <h3>会验收的裁判：评测、观测与回归</h3>
        <p>AI 应用不能只看一次演示。这里讲基准测试、任务级 eval、人工评审、trace、失败样本、回归集和成本/延迟观测。</p>
        <ul>
          <li>Evals</li>
          <li>Trace</li>
          <li>回归集</li>
          <li>成本与延迟</li>
        </ul>
      </div>
      <div class="aaf-module-meta">
        <span class="aaf-badge is-ready">章节已展开</span>
        <a class="aaf-link" href="/2026/06/18/ai-agent-fables-08-evals-observability/">阅读第八讲</a>
        <a class="aaf-link" href="/courses/ai-agent-fables-08/">章节目录</a>
      </div>
    </article>
    <article class="aaf-module">
      <span class="aaf-number">09</span>
      <div>
        <h3>会守城的门卫：安全、隐私与治理</h3>
        <p>把 prompt injection、数据泄露、输出处理、供应链、偏见、公平性、内容来源和人类监督放到同一张风险地图里讲。</p>
        <ul>
          <li>Prompt Injection</li>
          <li>隐私与版权</li>
          <li>偏见与公平</li>
          <li>治理与审计</li>
        </ul>
      </div>
      <div class="aaf-module-meta">
        <span class="aaf-badge is-ready">章节已展开</span>
        <a class="aaf-link" href="/2026/06/18/ai-agent-fables-09-safety-governance/">阅读第九讲</a>
        <a class="aaf-link" href="/courses/ai-agent-fables-09/">章节目录</a>
      </div>
    </article>
    <article class="aaf-module">
      <span class="aaf-number">10</span>
      <div>
        <h3>会看会听的旅人：多模态与计算机使用</h3>
        <p>当模型能看图、读屏、听音频、点浏览器和操作桌面时，输入输出、权限、错误恢复和用户确认都会变成新的课程主题。</p>
        <ul>
          <li>视觉理解</li>
          <li>语音与音频</li>
          <li>Computer Use</li>
          <li>人机交互</li>
        </ul>
      </div>
      <div class="aaf-module-meta">
        <span class="aaf-badge is-ready">章节已展开</span>
        <a class="aaf-link" href="/2026/06/18/ai-agent-fables-10-multimodal-computer-use/">阅读第十讲</a>
        <a class="aaf-link" href="/courses/ai-agent-fables-10/">章节目录</a>
      </div>
    </article>
    <article class="aaf-module">
      <span class="aaf-number">11</span>
      <div>
        <h3>会分工的城邦：多 Agent 与 AI 工程</h3>
        <p>单个工匠能干活以后，再讲一群工匠怎么分工、怎么隔离上下文、怎么投票、怎么交接、怎么避免并行制造更多混乱。</p>
        <ul>
          <li>多 Agent 编排</li>
          <li>上下文隔离</li>
          <li>对抗式验证</li>
          <li>交接协议</li>
        </ul>
      </div>
      <div class="aaf-module-meta">
        <span class="aaf-badge is-ready">章节已展开</span>
        <a class="aaf-link" href="/2026/06/18/ai-agent-fables-11-multi-agent-engineering/">阅读第十一讲</a>
        <a class="aaf-link" href="/courses/ai-agent-fables-11/">章节目录</a>
      </div>
    </article>
    <article class="aaf-module">
      <span class="aaf-number">12</span>
      <div>
        <h3>会开店的城镇：产品化、MLOps 与 AI 基础设施</h3>
        <p>最后把模型能力变成可运行产品：数据管线、部署、监控、版本、成本、回放、权限、团队流程和 AI Town 这类 Agent runtime。</p>
        <ul>
          <li>MLOps / LLMOps</li>
          <li>部署与监控</li>
          <li>成本治理</li>
          <li>AI Town</li>
        </ul>
      </div>
      <div class="aaf-module-meta">
        <span class="aaf-badge is-ready">章节已展开</span>
        <a class="aaf-link" href="/2026/06/18/ai-agent-fables-12-product-mlops/">阅读第十二讲</a>
        <a class="aaf-link" href="/courses/ai-agent-fables-12/">章节目录</a>
      </div>
    </article>
  </section>

  <section class="aaf-section-head">
    <div>
      <h2>章节与小节蓝图</h2>
      <p>下面是按完整学习链路设计的课程骨架。12 讲 72 章已全部写成文章，每个小节标题都是可点击的入口——点进去就是对应章节的正文。</p>
    </div>
    <span class="aaf-count">12 讲 · 72 章</span>
  </section>

  <section class="aaf-blueprint-grid" aria-label="AI 与 Agent 大寓言课章节蓝图">
    <article class="aaf-blueprint">
      <h3>01 会学手艺的小厨子：AI 导论与发展史</h3>
      <ul class="aaf-chapter-list">
        <li><strong><a href="/2026/06/20/ai-agent-fables-01-ch1-what-is-ai/">01.1 AI 到底是什么</a></strong>规则程序 · 统计模型 · 生成式系统</li>
        <li><strong><a href="/2026/06/20/ai-agent-fables-01-ch2-three-traditions/">01.2 三条历史主线</a></strong>符号主义 · 连接主义 · 概率统计</li>
        <li><strong><a href="/2026/06/20/ai-agent-fables-01-ch3-expert-to-deep-learning/">01.3 从专家系统到深度学习</a></strong>知识工程 · 数据驱动 · 算力拐点</li>
        <li><strong><a href="/2026/06/20/ai-agent-fables-01-ch4-generative-ai/">01.4 生成式 AI 的位置</a></strong>语言模型 · 扩散模型 · 多模态模型</li>
        <li><strong><a href="/2026/06/20/ai-agent-fables-01-ch5-why-agents/">01.5 Agent 为什么重新变热</a></strong>工具使用 · 长任务 · 环境反馈</li>
        <li><strong><a href="/2026/06/20/ai-agent-fables-01-ch6-reading-ai-news/">01.6 读 AI 新闻的方法</a></strong>区分模型、产品、论文、融资和基准测试</li>
      </ul>
    </article>

    <article class="aaf-blueprint">
      <h3>02 会分类的农夫：数据、特征与机器学习</h3>
      <ul class="aaf-chapter-list">
        <li><strong><a href="/2026/06/20/ai-agent-fables-02-ch1-where-data-comes-from/">02.1 数据从哪里来</a></strong>样本 · 标签 · 数据泄漏 · 数据权利</li>
        <li><strong><a href="/2026/06/20/ai-agent-fables-02-ch2-learning-types/">02.2 学习任务类型</a></strong>监督学习 · 无监督学习 · 强化学习</li>
        <li><strong><a href="/2026/06/20/ai-agent-fables-02-ch3-training-inference/">02.3 训练与推理</a></strong>损失函数 · 优化 · 参数 · 推理成本</li>
        <li><strong><a href="/2026/06/20/ai-agent-fables-02-ch4-generalization-overfitting/">02.4 泛化与过拟合</a></strong>训练集 · 验证集 · 测试集 · 分布漂移</li>
        <li><strong><a href="/2026/06/20/ai-agent-fables-02-ch5-metrics/">02.5 指标怎么骗人</a></strong>准确率 · 召回率 · AUC · 校准 · 业务指标</li>
        <li><strong><a href="/2026/06/20/ai-agent-fables-02-ch6-model-to-system/">02.6 从模型到系统</a></strong>特征流水线 · 线上服务 · 监控 · 反馈闭环</li>
      </ul>
    </article>

    <article class="aaf-blueprint">
      <h3>03 会说话的图书馆：深度学习与大模型</h3>
      <ul class="aaf-chapter-list">
        <li><strong><a href="/2026/06/20/ai-agent-fables-03-ch1-neural-network-intuition/">03.1 神经网络直觉</a></strong>层 · 激活 · 反向传播 · 表征</li>
        <li><strong><a href="/2026/06/20/ai-agent-fables-03-ch2-transformer-attention/">03.2 Transformer 为什么关键</a></strong>注意力 · 位置编码 · 并行训练</li>
        <li><strong><a href="/2026/06/20/ai-agent-fables-03-ch3-tokens-embeddings/">03.3 Token 与向量</a></strong>分词 · embedding · 语义空间 · 相似度</li>
        <li><strong><a href="/2026/06/20/ai-agent-fables-03-ch4-pretrain-finetune-align/">03.4 预训练、微调与对齐</a></strong>自监督 · SFT · RLHF/RLAIF · 指令跟随</li>
        <li><strong><a href="/2026/06/20/ai-agent-fables-03-ch5-context-window/">03.5 上下文窗口与长文本</a></strong>窗口限制 · attention 成本 · 长上下文误区</li>
        <li><strong><a href="/2026/06/20/ai-agent-fables-03-ch6-capability-limits/">03.6 模型能力边界</a></strong>幻觉 · 组合泛化 · 推理不稳定 · 评测偏差</li>
      </ul>
    </article>

    <article class="aaf-blueprint">
      <h3>04 会查档案的书记：提示词、上下文与 RAG</h3>
      <ul class="aaf-chapter-list">
        <li><strong><a href="/2026/06/20/ai-agent-fables-04-ch1-prompt-as-interface/">04.1 Prompt 是任务接口</a></strong>角色 · 目标 · 约束 · 输出格式</li>
        <li><strong><a href="/2026/06/20/ai-agent-fables-04-ch2-context-engineering/">04.2 Context Engineering</a></strong>上下文选择 · 顺序 · 噪声 · 预算</li>
        <li><strong><a href="/2026/06/20/ai-agent-fables-04-ch3-rag-pipeline/">04.3 RAG 基础链路</a></strong>切分 · 向量化 · 检索 · 重排 · 生成</li>
        <li><strong><a href="/2026/06/20/ai-agent-fables-04-ch4-citations-verifiable/">04.4 引用与可核验回答</a></strong>来源 · 摘要边界 · 证据覆盖 · 反查</li>
        <li><strong><a href="/2026/06/20/ai-agent-fables-04-ch5-memory-vs-rag/">04.5 记忆不是 RAG 的别名</a></strong>短期上下文 · 长期偏好 · 组织知识</li>
        <li><strong><a href="/2026/06/20/ai-agent-fables-04-ch6-failure-modes/">04.6 常见失败模式</a></strong>召回漏掉 · 错文档命中 · 上下文污染 · 过度自信</li>
      </ul>
    </article>

    <article class="aaf-blueprint">
      <h3>05 会借工具的学徒：工具、MCP 与 Skill</h3>
      <ul class="aaf-chapter-list">
        <li><strong><a href="/2026/06/20/ai-agent-fables-05-ch1-tool-calling/">05.1 Tool Calling 基础</a></strong>工具定义 · 参数 schema · tool result</li>
        <li><strong><a href="/2026/06/20/ai-agent-fables-05-ch2-mcp/">05.2 MCP 的位置</a></strong>客户端 · 服务器 · tools · resources · prompts</li>
        <li><strong><a href="/2026/06/20/ai-agent-fables-05-ch3-skills/">05.3 Skill 是按需能力包</a></strong>SKILL.md · progressive disclosure · scripts</li>
        <li><strong><a href="/2026/06/20/ai-agent-fables-05-ch4-tool-contracts/">05.4 工具契约质量</a></strong>何时使用 · 何时不用 · 错误语义 · 示例</li>
        <li><strong><a href="/2026/06/20/ai-agent-fables-05-ch5-permissions-sandbox/">05.5 权限与沙箱</a></strong>只读/写入 · 密钥边界 · 审批 · 审计</li>
        <li><strong><a href="/2026/06/20/ai-agent-fables-05-ch6-tool-ecosystem/">05.6 工具生态设计</a></strong>工具太多怎么办 · 召回 · 分组 · 版本治理</li>
      </ul>
    </article>

    <article class="aaf-blueprint">
      <h3>06 会自己绕圈的工坊：Agent Loop 与 Harness</h3>
      <ul class="aaf-chapter-list">
        <li><strong>06.1 Loop 与 ReAct</strong>观察 · 行动 · 结果回填 · 停止条件</li>
        <li><strong>06.2 Harness 分层</strong>模型外壳 · 工具 · 上下文 · 会话 · 观测</li>
        <li><strong>06.3 编排与 Workflow</strong>固定流程 · 动态计划 · 人类在环</li>
        <li><strong>06.4 上下文搬运</strong>offloading · compaction · prompt caching</li>
        <li><strong>06.5 记忆与文件系统</strong>Company Brain · AgentFS · 持久状态</li>
        <li><strong>06.6 长程自治</strong>middleware · 子代理 · 运行时文档 · Install.md</li>
      </ul>
    </article>

    <article class="aaf-blueprint">
      <h3>07 会把灵感变蓝图的工匠：vibe coding 与 SDD</h3>
      <ul class="aaf-chapter-list">
        <li><strong><a href="/2026/06/20/ai-agent-fables-07-ch1-vibe-coding/">07.1 Vibe Coding 的价值</a></strong>探索 · 快速反馈 · 原型 · 边界</li>
        <li><strong><a href="/2026/06/20/ai-agent-fables-07-ch2-sdd-pipeline/">07.2 SDD 的基本链路</a></strong>spec · plan · tasks · implementation · review</li>
        <li><strong><a href="/2026/06/20/ai-agent-fables-07-ch3-writing-requirements/">07.3 需求怎么写给 Agent</a></strong>用户故事 · 验收标准 · 非目标 · 约束</li>
        <li><strong><a href="/2026/06/20/ai-agent-fables-07-ch4-prd-to-tests/">07.4 从 PRD 到测试</a></strong>行为样例 · 边界条件 · 回归集 · 可验证完成</li>
        <li><strong><a href="/2026/06/20/ai-agent-fables-07-ch5-collaboration-modes/">07.5 人机协作节奏</a></strong>探索模式 · 施工模式 · 审查模式 · 回滚</li>
        <li><strong><a href="/2026/06/20/ai-agent-fables-07-ch6-when-not-sdd/">07.6 何时别用 SDD</a></strong>过早规范化 · 伪精确 · 文档漂移 · 小任务成本</li>
      </ul>
    </article>

    <article class="aaf-blueprint">
      <h3>08 会验收的裁判：评测、观测与回归</h3>
      <ul class="aaf-chapter-list">
        <li><strong><a href="/2026/06/20/ai-agent-fables-08-ch1-demo-is-not-eval/">08.1 为什么演示不算评测</a></strong>样例偏差 · cherry-pick · 回归风险</li>
        <li><strong><a href="/2026/06/20/ai-agent-fables-08-ch2-llm-eval-basics/">08.2 LLM 评测基础</a></strong>准确性 · 相关性 · 格式 · 鲁棒性</li>
        <li><strong><a href="/2026/06/20/ai-agent-fables-08-ch3-agent-eval/">08.3 Agent 任务级 eval</a></strong>轨迹 · 工具调用 · 完成率 · 成本/延迟</li>
        <li><strong><a href="/2026/06/20/ai-agent-fables-08-ch4-trace-replay/">08.4 Trace 与回放</a></strong>span · tool call · handoff · replay · failure taxonomy</li>
        <li><strong><a href="/2026/06/20/ai-agent-fables-08-ch5-human-and-llm-judge/">08.5 人工评审与 LLM-as-judge</a></strong>rubric · 一致性 · 偏差 · 抽检</li>
        <li><strong><a href="/2026/06/20/ai-agent-fables-08-ch6-production-monitoring/">08.6 线上监控</a></strong>质量漂移 · 安全事件 · 预算告警 · 用户反馈闭环</li>
      </ul>
    </article>

    <article class="aaf-blueprint">
      <h3>09 会守城的门卫：安全、隐私与治理</h3>
      <ul class="aaf-chapter-list">
        <li><strong><a href="/2026/06/21/ai-agent-fables-09-ch1-prompt-injection/">09.1 Prompt Injection</a></strong>直接注入 · 间接注入 · 工具输出投毒</li>
        <li><strong><a href="/2026/06/21/ai-agent-fables-09-ch2-data-privacy/">09.2 数据与隐私</a></strong>PII · 密钥 · 日志 · 数据最小化</li>
        <li><strong><a href="/2026/06/21/ai-agent-fables-09-ch3-permissions-tool-safety/">09.3 权限和工具安全</a></strong>最小权限 · 审批 · 沙箱 · 回滚</li>
        <li><strong><a href="/2026/06/21/ai-agent-fables-09-ch4-copyright-provenance/">09.4 版权与来源</a></strong>训练数据争议 · 输出相似性 · 引用 · 许可</li>
        <li><strong><a href="/2026/06/21/ai-agent-fables-09-ch5-bias-fairness/">09.5 偏见、公平与透明</a></strong>代表性 · 解释 · 申诉 · 审计</li>
        <li><strong><a href="/2026/06/21/ai-agent-fables-09-ch6-governance/">09.6 治理框架</a></strong>NIST AI RMF · OWASP LLM Top 10 · 内部政策落地</li>
      </ul>
    </article>

    <article class="aaf-blueprint">
      <h3>10 会看会听的旅人：多模态与计算机使用</h3>
      <ul class="aaf-chapter-list">
        <li><strong><a href="/2026/06/21/ai-agent-fables-10-ch1-vision/">10.1 视觉模型基础</a></strong>图像理解 · OCR · grounding · 空间关系</li>
        <li><strong><a href="/2026/06/21/ai-agent-fables-10-ch2-audio-speech/">10.2 音频与语音</a></strong>ASR · TTS · 音频事件 · 实时交互</li>
        <li><strong><a href="/2026/06/21/ai-agent-fables-10-ch3-multimodal-rag/">10.3 多模态 RAG</a></strong>图片/视频切片 · embedding · 引用 · 证据展示</li>
        <li><strong><a href="/2026/06/21/ai-agent-fables-10-ch4-computer-use/">10.4 Computer Use</a></strong>屏幕观察 · 点击/输入 · 状态恢复 · 人类确认</li>
        <li><strong><a href="/2026/06/21/ai-agent-fables-10-ch5-ui-agent-failures/">10.5 UI Agent 的失败模式</a></strong>坐标漂移 · 弹窗 · 隐藏状态 · 可访问性</li>
        <li><strong><a href="/2026/06/21/ai-agent-fables-10-ch6-experience-design/">10.6 体验设计</a></strong>可见进度 · 接管权 · 纠错 · 信任边界</li>
      </ul>
    </article>

    <article class="aaf-blueprint">
      <h3>11 会分工的城邦：多 Agent 与 AI 工程</h3>
      <ul class="aaf-chapter-list">
        <li><strong><a href="/2026/06/21/ai-agent-fables-11-ch1-why-multi-agent/">11.1 为什么要多 Agent</a></strong>分工 · 隔离 · 并行 · 专家角色</li>
        <li><strong><a href="/2026/06/21/ai-agent-fables-11-ch2-orchestration-patterns/">11.2 编排模式</a></strong>leader-worker · debate · critic · map-reduce · handoff</li>
        <li><strong><a href="/2026/06/21/ai-agent-fables-11-ch3-context-isolation/">11.3 上下文隔离</a></strong>子任务边界 · 文件所有权 · 汇总协议 · 防污染</li>
        <li><strong><a href="/2026/06/21/ai-agent-fables-11-ch4-adversarial-verification/">11.4 对抗式验证</a></strong>reviewer · verifier · red team · consensus</li>
        <li><strong><a href="/2026/06/21/ai-agent-fables-11-ch5-cost-latency/">11.5 成本和延迟</a></strong>并行收益 · 交互开销 · token 预算 · 失败重跑</li>
        <li><strong><a href="/2026/06/21/ai-agent-fables-11-ch6-team-protocols/">11.6 团队工程协议</a></strong>任务切分 · 状态同步 · 冲突处理 · 交付证据</li>
      </ul>
    </article>

    <article class="aaf-blueprint">
      <h3>12 会开店的城镇：产品化、MLOps 与 AI 基础设施</h3>
      <ul class="aaf-chapter-list">
        <li><strong><a href="/2026/06/21/ai-agent-fables-12-ch1-demo-to-product/">12.1 从 demo 到产品</a></strong>用户场景 · 可靠性 · 成本 · SLA</li>
        <li><strong><a href="/2026/06/21/ai-agent-fables-12-ch2-llmops/">12.2 LLMOps / MLOps</a></strong>版本 · 数据 · prompt · 模型 · 回滚</li>
        <li><strong><a href="/2026/06/21/ai-agent-fables-12-ch3-deployment-runtime/">12.3 部署与运行时</a></strong>队列 · 工作流 · 沙箱 · 会话 · 存储</li>
        <li><strong><a href="/2026/06/21/ai-agent-fables-12-ch4-observability-cost/">12.4 观测和成本治理</a></strong>trace · 指标 · 预算 · 缓存 · 限流</li>
        <li><strong><a href="/2026/06/21/ai-agent-fables-12-ch5-team-process/">12.5 团队流程</a></strong>权限 · 审批 · 值班 · 事故复盘 · 知识库</li>
        <li><strong><a href="/2026/06/21/ai-agent-fables-12-ch6-case-study/">12.6 项目案例</a></strong>AI Town · Agent runtime · 长期记忆 · 前端状态同步</li>
      </ul>
    </article>
  </section>

  <section class="aaf-section-head">
    <div>
      <h2>已有模块入口</h2>
      <p>12 讲都已展开成章节（点上面每讲的“章节目录”即可进入）。下面这几个是有额外专题资料、适合继续下钻的入口。</p>
    </div>
  </section>

  <section class="aaf-link-grid" aria-label="已有 AI 课程入口">
    <article class="aaf-link-card">
      <strong>第六讲：Agent Loop 与 Harness</strong>
      <p>第六讲下面的专题目录。把 Feishu《Harness 101》拆成 12 篇章节文章，再补一个 ReAct 与工具调用小节。</p>
      <a class="aaf-link" href="/courses/agent-harness-fables/">进入课程</a>
    </article>
    <article class="aaf-link-card">
      <strong>多 Agent 编排实战</strong>
      <p>第十一部的一部分。讲多个 Agent 怎么分工、隔离上下文、对抗验证和控制成本。</p>
      <a class="aaf-link" href="/courses/multi-agent-orchestration/">进入课程</a>
    </article>
    <article class="aaf-link-card">
      <strong>AI Town：Agent 基础设施</strong>
      <p>第十二部的一部分。用 AI Town 源码讲 runtime、调度、回放、记忆和前端渲染。</p>
      <a class="aaf-link" href="/courses/ai-town/">进入课程</a>
    </article>
  </section>

  <section class="aaf-section-head">
    <div>
      <h2>写作规则</h2>
      <p>后续每一讲都按同一个节奏写，避免变成资料堆砌。</p>
    </div>
  </section>

  <section class="aaf-principle-grid" aria-label="寓言课写作规则">
    <article class="aaf-principle">
      <strong>故事先行</strong>
      <p>先用一个小故事建立直觉，再解释现实里的技术对象是什么、解决什么问题、边界在哪里。</p>
    </article>
    <article class="aaf-principle">
      <strong>错误可见</strong>
      <p>每一讲都要写一个常见误解，例如把 MCP 当工具本身、把 Skill 当插件、把 Agent 当模型、把 vibe coding 当生产流程、把 SDD 当文档堆。</p>
    </article>
    <article class="aaf-principle">
      <strong>练习落地</strong>
      <p>结尾给一个能实际操作的小练习，让读者能把概念落到提示词、工具契约、上下文或代码结构上。</p>
    </article>
    <article class="aaf-principle">
      <strong>资料核验</strong>
      <p>涉及 MCP、Skill、Agents SDK、SDD、评测、安全治理等现代概念时，优先对照官方文档、标准组织、论文和一手工程文章。</p>
    </article>
  </section>

  <section class="aaf-section-head">
    <div>
      <h2>资料锚点</h2>
      <p>这些是后续写作会持续对照的公开资料入口，避免只凭二手总结写课程。</p>
    </div>
  </section>

  <section class="aaf-source-grid" aria-label="资料锚点">
    <article class="aaf-source">
      <strong>Stanford AI Index</strong>
      <p>用来校准 AI 发展趋势、能力进展、产业采用和治理挑战，避免只按工具热度排课程。</p>
      <a class="aaf-link" href="https://hai.stanford.edu/ai-index/2026-ai-index-report" target="_blank" rel="noopener">查看资料</a>
    </article>
    <article class="aaf-source">
      <strong>Google Machine Learning Crash Course</strong>
      <p>用来核验机器学习、数据、泛化、公平性和负责 AI 的基础概念。</p>
      <a class="aaf-link" href="https://developers.google.com/machine-learning/crash-course" target="_blank" rel="noopener">查看资料</a>
    </article>
    <article class="aaf-source">
      <strong>MCP Specification</strong>
      <p>用来核验 MCP 的主机、客户端、服务器、工具和上下文协议边界。</p>
      <a class="aaf-link" href="https://modelcontextprotocol.io/specification/2025-11-25" target="_blank" rel="noopener">查看资料</a>
    </article>
    <article class="aaf-source">
      <strong>Anthropic Agent Skills</strong>
      <p>用来核验 Skill 如何把说明、资源和脚本打包成 Agent 可加载的能力。</p>
      <a class="aaf-link" href="https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview" target="_blank" rel="noopener">查看资料</a>
    </article>
    <article class="aaf-source">
      <strong>OpenAI Agents SDK</strong>
      <p>用来对照现代 Agent SDK 里模型、工具、handoff、guardrail 和 tracing 的工程抽象。</p>
      <a class="aaf-link" href="https://developers.openai.com/api/docs/guides/agents" target="_blank" rel="noopener">查看资料</a>
    </article>
    <article class="aaf-source">
      <strong>Anthropic Effective Agents</strong>
      <p>用来区分 workflow、agent、工具使用和组合式模式，避免把所有 LLM 应用都叫 Agent。</p>
      <a class="aaf-link" href="https://www.anthropic.com/research/building-effective-agents" target="_blank" rel="noopener">查看资料</a>
    </article>
    <article class="aaf-source">
      <strong>Vibe Coding 原始讨论</strong>
      <p>用来讲清楚 vibe coding 的边界：它更像快速探索和自然语言驱动的原型阶段，不等于不用理解代码。</p>
      <a class="aaf-link" href="https://simonwillison.net/2025/Mar/19/vibe-coding/" target="_blank" rel="noopener">查看资料</a>
    </article>
    <article class="aaf-source">
      <strong>GitHub Spec Kit</strong>
      <p>用来核验 SDD 在 AI 编程里的核心：先定义要构建什么，再把规格、计划、任务和实现连起来。</p>
      <a class="aaf-link" href="https://github.github.com/spec-kit/" target="_blank" rel="noopener">查看资料</a>
    </article>
    <article class="aaf-source">
      <strong>Kiro Specs</strong>
      <p>用来对照规格如何变成需求、设计、任务和进度跟踪，而不是只写一份没人维护的文档。</p>
      <a class="aaf-link" href="https://kiro.dev/docs/specs/" target="_blank" rel="noopener">查看资料</a>
    </article>
    <article class="aaf-source">
      <strong>OpenAI Evaluation Best Practices</strong>
      <p>用来区分公开 benchmark、通用分数和面向自己任务的 eval，课程里的验收会按第三类展开。</p>
      <a class="aaf-link" href="https://developers.openai.com/api/docs/guides/evaluation-best-practices" target="_blank" rel="noopener">查看资料</a>
    </article>
    <article class="aaf-source">
      <strong>OpenAI Agent Evals</strong>
      <p>用来核验 traces、graders、datasets 和 eval runs 如何组成 Agent 质量闭环。</p>
      <a class="aaf-link" href="https://developers.openai.com/api/docs/guides/agent-evals" target="_blank" rel="noopener">查看资料</a>
    </article>
    <article class="aaf-source">
      <strong>NIST AI RMF</strong>
      <p>用来校准 AI 风险管理、可信度、治理、内容来源、测试和事故披露这些安全治理主题。</p>
      <a class="aaf-link" href="https://www.nist.gov/itl/ai-risk-management-framework" target="_blank" rel="noopener">查看资料</a>
    </article>
    <article class="aaf-source">
      <strong>OWASP Top 10 for LLM Applications</strong>
      <p>用来核验 prompt injection、输出处理、供应链、数据投毒、越权代理等 LLM 应用安全风险。</p>
      <a class="aaf-link" href="https://genai.owasp.org/resource/owasp-top-10-for-llm-applications-2025/" target="_blank" rel="noopener">查看资料</a>
    </article>
    <article class="aaf-source">
      <strong>Computer Use</strong>
      <p>用来核验模型通过截图和界面动作操作软件时，隔离环境、权限和人工确认的边界。</p>
      <a class="aaf-link" href="https://developers.openai.com/api/docs/guides/tools-computer-use" target="_blank" rel="noopener">查看资料</a>
    </article>
    <article class="aaf-source">
      <strong>Google Cloud MLOps</strong>
      <p>用来核验从实验到生产时，CI、CD、持续训练、部署、监控和基础设施之间的关系。</p>
      <a class="aaf-link" href="https://docs.cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning" target="_blank" rel="noopener">查看资料</a>
    </article>
    <article class="aaf-source">
      <strong>ReAct 与 Agent Loop</strong>
      <p>用来解释“思考、行动、观察”为什么会成为 Agent 教学里的核心循环。</p>
      <a class="aaf-link" href="https://arxiv.org/abs/2210.03629" target="_blank" rel="noopener">查看资料</a>
    </article>
  </section>

  <section class="aaf-note">
    <p>准确性说明：这个页面是课程地图，也是 12 讲入门寓言课的总入口。12 讲 72 章已全部写成文章，每讲一个自洽的寓言世界、概念对照真实术语、并附公开资料锚点。涉及现代概念（MCP、Skill、评测、安全治理、MLOps 等）均以官方文档与一手来源为准；个别尚在演进或有争议的话题（如训练数据版权）已如实标注，不写成定论。</p>
  </section>
</div>
