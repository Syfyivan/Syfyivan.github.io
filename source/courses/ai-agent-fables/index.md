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
  .aaf-source-grid {
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
      <h2>从第一盏灯，讲到会自己找工具的工匠</h2>
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
      <p>之前的 6 部主线只能算第一版骨架，容易漏掉数据/机器学习、评测、安全治理、多模态和产品化等大块知识。这里改成 12 个知识板块：先完整列图，再逐步把每块写成寓言课。</p>
    </div>
    <span class="aaf-count">12 个板块</span>
  </section>

  <section class="aaf-module-list" aria-label="AI 与 Agent 大寓言课目录">
    <article class="aaf-module">
      <span class="aaf-number">01</span>
      <div>
        <h3>会学习的木偶：AI 导论与发展史</h3>
        <p>从“机器能不能学会规则之外的东西”讲起，先把 AI、机器学习、深度学习、生成式 AI、Agent 这些词放到一张历史地图里。</p>
        <ul>
          <li>AI 是什么</li>
          <li>符号主义</li>
          <li>统计学习</li>
          <li>生成式 AI 的位置</li>
        </ul>
      </div>
      <div class="aaf-module-meta">
        <span class="aaf-badge is-next">优先补课</span>
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
        <span class="aaf-badge is-next">优先补课</span>
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
        <span class="aaf-badge is-next">优先补课</span>
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
        <span class="aaf-badge is-next">优先补课</span>
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
        <span class="aaf-badge is-next">优先补课</span>
      </div>
    </article>
    <article class="aaf-module">
      <span class="aaf-number">06</span>
      <div>
        <h3>会自己绕圈的工坊：Agent Loop 与 Harness</h3>
        <p>这里进入已经写好的寓言课：Agent Loop、ReAct、工具契约、上下文搬运、记忆、虚拟文件系统、运行时提醒和面向 Agent 的文档。</p>
        <ul>
          <li>Agent Loop</li>
          <li>ReAct</li>
          <li>Harness</li>
          <li>Context Engineering</li>
        </ul>
      </div>
      <div class="aaf-module-meta">
        <span class="aaf-badge is-ready">12 讲已建</span>
        <a class="aaf-link" href="/courses/agent-harness-fables/">进入第六部</a>
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
        <span class="aaf-badge is-next">优先补课</span>
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
        <span class="aaf-badge is-next">优先补课</span>
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
        <span class="aaf-badge is-next">优先补课</span>
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
        <span class="aaf-badge is-next">优先补课</span>
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
        <span class="aaf-badge is-ready">已有课程</span>
        <a class="aaf-link" href="/courses/multi-agent-orchestration/">进入第十一部</a>
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
        <span class="aaf-badge is-ready">已有课程</span>
        <a class="aaf-link" href="/courses/ai-town/">进入第十二部</a>
      </div>
    </article>
  </section>

  <section class="aaf-section-head">
    <div>
      <h2>已有模块入口</h2>
      <p>基础寓言会逐步补上；现在可以先从已建模块进入，读的时候把它们理解成后半段课程。</p>
    </div>
  </section>

  <section class="aaf-link-grid" aria-label="已有 AI 课程入口">
    <article class="aaf-link-card">
      <strong>Agent Harness 寓言课</strong>
      <p>第六部。用 12 个故事讲 Agent Loop、工具、上下文、记忆和运行时外壳。</p>
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
      <a class="aaf-link" href="https://modelcontextprotocol.io/specification/2025-06-18" target="_blank" rel="noopener">查看资料</a>
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
      <strong>NIST AI RMF</strong>
      <p>用来校准 AI 风险管理、可信度、治理、内容来源、测试和事故披露这些安全治理主题。</p>
      <a class="aaf-link" href="https://www.nist.gov/itl/ai-risk-management-framework" target="_blank" rel="noopener">查看资料</a>
    </article>
    <article class="aaf-source">
      <strong>OWASP Top 10 for LLM Applications</strong>
      <p>用来核验 prompt injection、输出处理、供应链、数据投毒、越权代理等 LLM 应用安全风险。</p>
      <a class="aaf-link" href="https://owasp.org/www-project-top-10-for-large-language-model-applications/" target="_blank" rel="noopener">查看资料</a>
    </article>
    <article class="aaf-source">
      <strong>ReAct 与 Agent Loop</strong>
      <p>用来解释“思考、行动、观察”为什么会成为 Agent 教学里的核心循环。</p>
      <a class="aaf-link" href="/courses/agent-harness-fables/">从 Harness 课读起</a>
    </article>
  </section>

  <section class="aaf-note">
    <p>准确性说明：这个页面是课程地图，不是已完成课程清单。标成“已有课程”的模块已有入口；标成“优先补课”的模块说明它是知识链路里的必要板块，但还需要继续写成具体寓言课。以后新增文章会先对照这张覆盖表，避免因为某个热词流行就把路线图写偏。</p>
  </section>
</div>
