---
title: "课程"
date: 2026-05-16 18:05:00
description: "把零散技术文章整理成可连续学习的课程路径。"
---

<style>
.course-page {
  --course-ink: #16202a;
  --course-muted: #607180;
  --course-line: rgba(22, 32, 42, 0.12);
  --course-panel: #ffffff;
  --course-wash: #f5f8fa;
  --course-teal: #0f766e;
  --course-coral: #c75b42;
  --course-gold: #b78224;
  --course-blue: #315f88;
  color: var(--course-ink);
}

.course-page * {
  box-sizing: border-box;
}

.course-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(240px, 0.65fr);
  gap: 28px;
  align-items: end;
  padding: 34px;
  border: 1px solid var(--course-line);
  border-radius: 8px;
  background:
    linear-gradient(135deg, rgba(15, 118, 110, 0.1), rgba(49, 95, 136, 0.08)),
    var(--course-panel);
}

.course-kicker {
  display: inline-flex;
  align-items: center;
  margin-bottom: 14px;
  padding: 6px 10px;
  border: 1px solid rgba(15, 118, 110, 0.2);
  border-radius: 999px;
  color: var(--course-teal);
  background: rgba(15, 118, 110, 0.08);
  font-size: 13px;
  font-weight: 700;
}

.course-hero h2 {
  margin: 0 0 14px;
  font-size: 32px;
  line-height: 1.2;
  letter-spacing: 0;
}

.course-hero p,
.course-card p,
.course-note p {
  margin: 0;
  color: var(--course-muted);
  line-height: 1.8;
}

.course-stats {
  display: grid;
  gap: 10px;
}

.course-stat {
  padding: 16px;
  border: 1px solid var(--course-line);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.72);
}

.course-stat strong {
  display: block;
  margin-bottom: 4px;
  font-size: 22px;
  line-height: 1;
}

.course-section-title {
  margin: 36px 0 16px;
  font-size: 22px;
  letter-spacing: 0;
}

.course-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.course-card {
  display: flex;
  flex-direction: column;
  min-height: 230px;
  padding: 22px;
  border: 1px solid var(--course-line);
  border-radius: 8px;
  background: var(--course-panel);
  box-shadow: 0 14px 34px rgba(22, 32, 42, 0.08);
}

.course-card h3 {
  margin: 12px 0 10px;
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

.course-badge {
  display: inline-flex;
  align-items: center;
  padding: 5px 9px;
  border-radius: 999px;
  color: var(--course-teal);
  background: rgba(15, 118, 110, 0.1);
  font-size: 13px;
  font-weight: 700;
}

.course-badge.is-planned {
  color: var(--course-gold);
  background: rgba(183, 130, 36, 0.12);
}

.course-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  padding: 8px 13px;
  border: 1px solid rgba(15, 118, 110, 0.22);
  border-radius: 8px;
  color: var(--course-teal);
  font-weight: 700;
  text-decoration: none !important;
}

.course-link:hover {
  color: #ffffff;
  background: var(--course-teal);
}

.course-note {
  margin-top: 20px;
  padding: 18px;
  border-left: 4px solid var(--course-coral);
  border-radius: 8px;
  background: var(--course-wash);
}

@media (max-width: 760px) {
  .course-hero,
  .course-grid {
    grid-template-columns: 1fr;
  }

  .course-hero {
    padding: 22px;
  }

  .course-hero h2 {
    font-size: 26px;
  }

  .course-card-footer {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>

<div class="course-page">
  <section class="course-hero">
    <div>
      <span class="course-kicker">Learning Paths</span>
      <h2>把技术笔记整理成可以连续学习的课程</h2>
      <p>课程板块会把同一主题下的文章按学习顺序串起来。每门课程都有自己的目录、模块和文章入口，适合从一个问题一路学到可迁移的方法。</p>
    </div>
    <div class="course-stats" aria-label="课程统计">
      <div class="course-stat">
        <strong>2</strong>
        <span>已建课程</span>
      </div>
      <div class="course-stat">
        <strong>10</strong>
        <span>服务端学习模块</span>
      </div>
      <div class="course-stat">
        <strong>7</strong>
        <span>AI Town 模块规划</span>
      </div>
    </div>
  </section>
  <h2 class="course-section-title">课程目录</h2>
  <section class="course-grid">
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
      <h3>AI Town：Agent 基础设施课程</h3>
      <p>从像素小镇背后的 runtime 入手，学习 Convex 调度、单线程 step、历史回放、异步 LLM operation、记忆摘要和向量检索。</p>
      <div class="course-card-footer">
        <span>适合：想系统理解多 Agent 工程底座的人</span>
        <a class="course-link" href="/courses/ai-town/">进入课程</a>
      </div>
    </article>
    <article class="course-card">
      <span class="course-badge is-planned">规划中</span>
      <h3>AI 工程产品化</h3>
      <p>后续会把 AI 视觉浏览器、部署实践、多 Agent 协作模式等文章整理成更完整的产品化学习路径。</p>
      <div class="course-card-footer">
        <span>状态：等待内容沉淀</span>
      </div>
    </article>
  </section>
  <section class="course-note">
    <p>课程页只负责排顺序。以后同一主题的新文章，放回对应模块里就行，不用再翻归档找线索。</p>
  </section>
</div>
