---
title: "课程"
date: 2026-05-16 18:05:00
description: "按方向整理技术课程：AI、服务端、前端客户端和项目作品。"
---

<style>
.course-page {
  --course-ink: #1d2127;
  --course-text: #2a2f36;
  --course-muted: #69727d;
  --course-line: rgba(29, 33, 39, 0.12);
  --course-panel: #ffffff;
  --course-wash: #f4f5f3;
  --course-blue: #3f5d7e;
  --course-red: #b73a2c;
  --course-green: #2f765f;
  --course-amber: #9b6632;
  color: var(--course-text);
  max-width: 100%;
  overflow-x: hidden;
}

.course-page * {
  box-sizing: border-box;
  min-width: 0;
}

.course-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.32fr) minmax(250px, 0.68fr);
  gap: 26px;
  align-items: end;
  padding: 34px;
  border: 1px solid var(--course-line);
  border-radius: 3px;
  background:
    linear-gradient(135deg, rgba(183, 58, 44, 0.07), rgba(63, 93, 126, 0.08)),
    var(--course-panel);
}

.course-kicker {
  display: inline-flex;
  align-items: center;
  margin-bottom: 14px;
  padding: 6px 10px;
  border: 1px solid rgba(63, 93, 126, 0.2);
  border-radius: 999px;
  color: var(--course-blue);
  background: rgba(63, 93, 126, 0.08);
  font-size: 13px;
  font-weight: 760;
}

.course-hero h2 {
  margin: 0 0 14px;
  color: var(--course-ink);
  font-size: 32px;
  line-height: 1.2;
  letter-spacing: 0;
}

.course-hero p,
.course-card p,
.course-category-card p,
.course-note p,
.course-empty p {
  margin: 0;
  color: var(--course-muted);
  line-height: 1.8;
  overflow-wrap: anywhere;
}

.course-stats {
  display: grid;
  gap: 10px;
}

.course-stat {
  padding: 16px;
  border: 1px solid var(--course-line);
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.76);
}

.course-stat strong {
  display: block;
  margin-bottom: 4px;
  color: var(--course-ink);
  font-size: 22px;
  line-height: 1;
}

.course-category-nav {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin: 24px 0 32px;
}

.course-category-card {
  --category-color: var(--course-blue);
  display: flex;
  min-height: 164px;
  flex-direction: column;
  padding: 18px;
  border: 1px solid var(--course-line);
  border-top: 4px solid var(--category-color);
  border-radius: 3px;
  color: var(--course-text);
  background: var(--course-panel);
  text-decoration: none !important;
  box-shadow: 0 8px 24px rgba(22, 32, 42, 0.06);
}

.course-category-card:hover,
.course-category-card:focus {
  border-color: color-mix(in srgb, var(--category-color) 42%, var(--course-line));
  color: var(--course-text);
  transform: translateY(-2px);
}

.course-category-card.is-ai { --category-color: var(--course-red); }
.course-category-card.is-backend { --category-color: var(--course-blue); }
.course-category-card.is-client { --category-color: var(--course-green); }
.course-category-card.is-project { --category-color: var(--course-amber); }

.course-category-card span {
  color: var(--category-color);
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  font-size: 13px;
  font-weight: 760;
  text-transform: uppercase;
}

.course-category-card strong {
  display: block;
  margin: 8px 0 8px;
  color: var(--course-ink);
  font-size: 21px;
  line-height: 1.25;
}

.course-category-card small {
  margin-top: auto;
  color: var(--course-muted);
  font-weight: 700;
}

.course-category {
  margin-top: 34px;
}

.course-category-head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16px;
  align-items: end;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--course-line);
}

.course-category-head h2 {
  margin: 0 0 6px !important;
  padding: 0 !important;
  border: 0 !important;
  color: var(--course-ink);
  font-size: 24px;
  letter-spacing: 0;
}

.course-category-head h2::before {
  display: none !important;
}

.course-category-head p {
  margin: 0;
  color: var(--course-muted);
  line-height: 1.7;
}

.course-category-count {
  min-width: 88px;
  padding: 8px 10px;
  border: 1px solid var(--course-line);
  border-radius: 3px;
  color: var(--course-blue);
  background: rgba(63, 93, 126, 0.08);
  font-weight: 760;
  text-align: center;
}

.course-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.course-card {
  display: flex;
  min-height: 228px;
  flex-direction: column;
  padding: 22px;
  border: 1px solid var(--course-line);
  border-radius: 3px;
  background: var(--course-panel);
  box-shadow: 0 10px 28px rgba(22, 32, 42, 0.07);
}

.course-card h3 {
  margin: 12px 0 10px;
  color: var(--course-ink);
  font-size: 21px;
  letter-spacing: 0;
}

.course-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: auto;
  padding-top: 22px;
}

.course-card-footer span {
  color: var(--course-ink);
}

.course-badge {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 5px 9px;
  border-radius: 999px;
  color: var(--course-blue);
  background: rgba(63, 93, 126, 0.1);
  font-size: 13px;
  font-weight: 760;
}

.course-badge.is-ai {
  color: var(--course-red);
  background: rgba(183, 58, 44, 0.1);
}

.course-badge.is-client {
  color: var(--course-green);
  background: rgba(47, 118, 95, 0.1);
}

.course-badge.is-project,
.course-badge.is-planned {
  color: var(--course-amber);
  background: rgba(155, 102, 50, 0.12);
}

.course-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  padding: 8px 13px;
  border: 1px solid rgba(63, 93, 126, 0.24);
  border-radius: 3px;
  color: var(--course-blue);
  font-weight: 760;
  text-decoration: none !important;
}

.course-link:hover,
.course-link:focus {
  color: #ffffff;
  background: var(--course-blue);
}

.course-empty {
  padding: 20px;
  border: 1px dashed rgba(29, 33, 39, 0.22);
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.58);
}

.course-note {
  margin-top: 30px;
  padding: 18px;
  border-left: 4px solid var(--course-red);
  border-radius: 3px;
  background: var(--course-wash);
}

@media (max-width: 980px) {
  .course-category-nav {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .course-hero,
  .course-grid,
  .course-category-head {
    grid-template-columns: 1fr;
  }

  .course-hero {
    padding: 18px;
  }

  .course-hero h2 {
    font-size: 26px;
  }

  .course-category-nav {
    grid-template-columns: 1fr;
  }

  .course-card-footer {
    align-items: flex-start;
    flex-direction: column;
  }

  .course-category-count {
    width: fit-content;
  }
}
</style>

<div class="course-page">
  <section class="course-hero">
    <div>
      <span class="course-kicker">Learning Paths</span>
      <h2>先选方向，再进入课程</h2>
      <p>课程越来越多时，不适合全部平铺。这里先按学习方向分成大类：AI、服务端与网络、前端与客户端、项目与作品。以后新课程先归类，再放进对应目录。</p>
    </div>
    <div class="course-stats" aria-label="课程统计">
      <div class="course-stat">
        <strong>7</strong>
        <span>已建课程</span>
      </div>
      <div class="course-stat">
        <strong>5</strong>
        <span>内容大类</span>
      </div>
      <div class="course-stat">
        <strong>50+</strong>
        <span>课程学习模块</span>
      </div>
    </div>
  </section>

  <nav class="course-category-nav" aria-label="课程大类">
    <a class="course-category-card is-ai" href="#ai">
      <span>AI</span>
      <strong>AI 与 Agent</strong>
      <p>从 AI 基础、发展史、LLM、MCP、Skill 一路讲到 Agent 工程。</p>
      <small>大寓言课</small>
    </a>
    <a class="course-category-card is-backend" href="#backend">
      <span>Backend</span>
      <strong>服务端与网络</strong>
      <p>Go 服务端、请求链路、数据库、中间件、代理和计网。</p>
      <small>2 门课程</small>
    </a>
    <a class="course-category-card is-client" href="#quality">
      <span>Quality</span>
      <strong>软件工程与质量</strong>
      <p>软件质量保证与测试：质量、缺陷、度量、评审、标准、设计与编程。</p>
      <small>大寓言课</small>
    </a>
    <a class="course-category-card is-client" href="#client">
      <span>Client</span>
      <strong>前端与客户端</strong>
      <p>前端工程、Lynx、React、客户端调试和跨端实践。</p>
      <small>规划中</small>
    </a>
    <a class="course-category-card is-project" href="#projects">
      <span>Projects</span>
      <strong>项目与作品</strong>
      <p>把自研项目、源码拆解和可运行作品放在一个入口里。</p>
      <small>项目工坊</small>
    </a>
  </nav>

  <section class="course-category" id="ai">
    <div class="course-category-head">
      <div>
        <h2>AI 与 Agent</h2>
        <p>先从 AI 导论、数据与机器学习讲起，再进入 LLM、RAG、MCP、Skill、Agent Loop、vibe coding、SDD、评测、安全治理、多模态、多 Agent 和产品化工程。</p>
      </div>
      <span class="course-category-count">4 项</span>
    </div>
    <div class="course-grid">
      <article class="course-card">
        <span class="course-badge is-ai">总目录</span>
        <h3>AI 与 Agent 大寓言课</h3>
        <p>从“人工智能是什么”开始，用一整套寓言把 AI 发展史、机器学习、深度学习、大模型、RAG、MCP、Skill、Agent Loop、评测、安全治理、vibe coding、SDD 和多 Agent 工程串起来。</p>
        <div class="course-card-footer">
          <span>适合：想从 AI 基础一路学到 Agent 工程的人</span>
          <a class="course-link" href="/courses/ai-agent-fables/">进入总目录</a>
        </div>
      </article>
      <article class="course-card">
        <span class="course-badge is-ai">11 讲全</span>
        <h3>AI Town：Agent 基础设施课程</h3>
        <p>从像素小镇背后的 runtime 入手，11 讲对照源码深拆：Convex 调度、单线程 step、历史回放、异步 LLM、记忆向量检索、迁移实践，加上寻路、对话社交、前端渲染和部署实操。</p>
        <div class="course-card-footer">
          <span>适合：想系统理解多 Agent 工程底座的人</span>
          <a class="course-link" href="/courses/ai-town/">进入课程</a>
        </div>
      </article>
      <article class="course-card">
        <span class="course-badge is-ai">8 讲全</span>
        <h3>多 Agent 编排实战</h3>
        <p>从一张跑着 60 个 agent 的代码审查截图出发：上下文瓶颈、八种编排模式、上下文隔离、对抗式验证、成本边界，再到在 Claude Code 里怎么落地。</p>
        <div class="course-card-footer">
          <span>适合：想搞懂“同时开很多 agent”怎么做、值不值的人</span>
          <a class="course-link" href="/courses/multi-agent-orchestration/">进入课程</a>
        </div>
      </article>
      <article class="course-card">
        <span class="course-badge is-planned">规划中</span>
        <h3>AI 工程产品化</h3>
        <p>后续会把 AI 视觉浏览器、部署实践、评测回放、多 Agent 协作模式等文章整理成更完整的产品化学习路径。</p>
        <div class="course-card-footer">
          <span>状态：等待内容沉淀</span>
        </div>
      </article>
    </div>
  </section>

  <section class="course-category" id="quality">
    <div class="course-category-head">
      <div>
        <h2>软件工程与质量</h2>
        <p>软件不只是写出来，更要「保证它是好的」。这里放软件质量保证与测试方向：从质量是什么、软件缺陷、质量工程体系、度量、标准、评审、SQA 组织，到设计质量与高质量编程。</p>
      </div>
      <span class="course-category-count">1 门</span>
    </div>
    <div class="course-grid">
      <article class="course-card">
        <span class="course-badge is-client">10 讲全</span>
        <h3>软件质量与测试大寓言课</h3>
        <p>把大学《软件质量保证与测试》九章理论 + 绪论，改写成「榫卯镇·老周家具坊」一套寓言：学徒小磊从「为什么要有人挑毛病」一路学到「一榫一卯怎么讲究」。每讲都配一段贴合课件原话的「背诵版」，理念讲懂、原话背牢，零基础也能应付期末。</p>
        <div class="course-card-footer">
          <span>适合：软件质量保证与测试课的复习者、想入门软件工程质量的人</span>
          <a class="course-link" href="/courses/software-quality-fables/">进入课程</a>
        </div>
      </article>
    </div>
  </section>

  <section class="course-category" id="backend">
    <div class="course-category-head">
      <div>
        <h2>服务端与网络</h2>
        <p>把“一个请求怎么跑起来”和“网络代理为什么这样工作”放在同一类，方便顺着工程链路学。</p>
      </div>
      <span class="course-category-count">2 门</span>
    </div>
    <div class="course-grid">
      <article class="course-card">
        <span class="course-badge">进行中</span>
        <h3>Go 与服务端学习路线</h3>
        <p>按写一个服务的顺序整理：Go、HTTP、数据库、Redis、MQ、RPC、观测、架构和上线。先把请求链路走明白，再慢慢补中间件。</p>
        <div class="course-card-footer">
          <span>适合：想把后端知识串成一条线的人</span>
          <a class="course-link" href="/courses/server-side/">进入课程</a>
        </div>
      </article>
      <article class="course-card">
        <span class="course-badge">进行中</span>
        <h3>计网与代理工具学习路线</h3>
        <p>从一次网页请求出发，顺着 DNS、TCP/TLS/HTTP、系统代理、TUN、规则分流、策略组和排障清单，把代理工具背后的网络问题讲清楚。</p>
        <div class="course-card-footer">
          <span>适合：想把代理工具和计网基础连起来的人</span>
          <a class="course-link" href="/courses/network-proxy/">进入课程</a>
        </div>
      </article>
    </div>
  </section>

  <section class="course-category" id="client">
    <div class="course-category-head">
      <div>
        <h2>前端与客户端</h2>
        <p>这里会放前端工程、Lynx、React、客户端调试、跨端和移动端相关课程，避免它们被 AI 或项目文章淹没。</p>
      </div>
      <span class="course-category-count">规划中</span>
    </div>
    <div class="course-empty">
      <p>当前还没有独立课程页。已有的 Lynx、前端调试、ReactLynx、Canvas、动效文章会先继续沉淀，后面整理成一条“前端与客户端工程路线”。</p>
    </div>
  </section>

  <section class="course-category" id="projects">
    <div class="course-category-head">
      <div>
        <h2>项目与作品</h2>
        <p>项目不再和课程平铺在一起。自研项目、源码拆解、可运行小游戏和工具，统一从这里进入。</p>
      </div>
      <span class="course-category-count">1 个入口</span>
    </div>
    <div class="course-grid">
      <article class="course-card">
        <span class="course-badge is-project">项目集合</span>
        <h3>项目工坊</h3>
        <p>把自己写的项目、读过的源码和可运行作品整理成工单式入口：每个项目都有背景、技术栈、拆解文章和可复用经验。</p>
        <div class="course-card-footer">
          <span>适合：想从项目案例进入的人</span>
          <a class="course-link" href="/projects/">进入项目工坊</a>
        </div>
      </article>
      <article class="course-card">
        <span class="course-badge is-project">作品入口</span>
        <h3>可运行作品</h3>
        <p>AI 视觉翻书、麻将、画室等可交互作品仍在“作品”菜单里；这里作为项目大类的说明入口，后续会补成更完整的项目索引。</p>
        <div class="course-card-footer">
          <span>状态：逐步归档</span>
        </div>
      </article>
    </div>
  </section>

  <section class="course-note">
    <p>以后新增内容先判断大类，再决定是新建课程页、补进已有课程，还是放进项目工坊。目录不会再无限并列增长。</p>
  </section>
</div>
