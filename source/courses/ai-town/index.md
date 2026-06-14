---
title: "AI Town：Agent 基础设施课程"
date: 2026-05-16 18:06:00
description: "从 AI Town 学习 Convex 调度、单线程世界模拟、异步 LLM、历史回放与 Agent 记忆。"
---

<style>
.course-track {
  --track-ink: #16202a;
  --track-muted: #617282;
  --track-line: rgba(22, 32, 42, 0.12);
  --track-panel: #ffffff;
  --track-wash: #f5f8fa;
  --track-teal: #0f766e;
  --track-coral: #c75b42;
  --track-gold: #b78224;
  --track-blue: #315f88;
  color: var(--track-ink);
}

.course-track * {
  box-sizing: border-box;
}

.track-hero {
  padding: 34px;
  border: 1px solid var(--track-line);
  border-radius: 8px;
  background:
    linear-gradient(135deg, rgba(15, 118, 110, 0.11), rgba(199, 91, 66, 0.08)),
    var(--track-panel);
}

.track-kicker,
.lesson-state {
  display: inline-flex;
  align-items: center;
  padding: 5px 9px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
}

.track-kicker {
  margin-bottom: 14px;
  color: var(--track-teal);
  background: rgba(15, 118, 110, 0.1);
}

.track-hero h2 {
  margin: 0 0 14px;
  font-size: 32px;
  line-height: 1.2;
  letter-spacing: 0;
}

.track-hero p,
.track-summary p,
.lesson-card p,
.track-note p {
  margin: 0;
  color: var(--track-muted);
  line-height: 1.8;
}

.track-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin: 20px 0 0;
}

.track-summary div {
  padding: 15px;
  border: 1px solid var(--track-line);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.72);
}

.track-summary strong {
  display: block;
  margin-bottom: 6px;
}

.track-section-title {
  margin: 36px 0 16px;
  font-size: 22px;
  letter-spacing: 0;
}

.lesson-list {
  display: grid;
  gap: 14px;
  counter-reset: lesson;
}

.lesson-card {
  display: grid;
  grid-template-columns: 58px minmax(0, 1fr) auto;
  gap: 18px;
  align-items: center;
  padding: 18px;
  border: 1px solid var(--track-line);
  border-radius: 8px;
  background: var(--track-panel);
  box-shadow: 0 12px 30px rgba(22, 32, 42, 0.07);
}

.lesson-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 8px;
  color: #ffffff;
  background: var(--track-blue);
  font-weight: 800;
}

.lesson-card h3 {
  margin: 0 0 8px;
  font-size: 19px;
  letter-spacing: 0;
}

.lesson-state {
  color: var(--track-gold);
  background: rgba(183, 130, 36, 0.12);
  white-space: nowrap;
}

.lesson-state.is-live {
  color: var(--track-teal);
  background: rgba(15, 118, 110, 0.1);
}

.lesson-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  padding: 8px 13px;
  border: 1px solid rgba(15, 118, 110, 0.22);
  border-radius: 8px;
  color: var(--track-teal);
  font-weight: 700;
  text-decoration: none !important;
  white-space: nowrap;
}

.lesson-link:hover {
  color: #ffffff;
  background: var(--track-teal);
}

.track-map {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.track-map span {
  padding: 13px;
  border: 1px solid var(--track-line);
  border-radius: 8px;
  background: var(--track-wash);
  color: var(--track-muted);
  line-height: 1.6;
}

.track-note {
  margin-top: 20px;
  padding: 18px;
  border-left: 4px solid var(--track-coral);
  border-radius: 8px;
  background: var(--track-wash);
}

@media (max-width: 820px) {
  .track-summary,
  .track-map {
    grid-template-columns: 1fr;
  }

  .track-hero {
    padding: 22px;
  }

  .track-hero h2 {
    font-size: 26px;
  }

  .lesson-card {
    grid-template-columns: 1fr;
  }

  .lesson-number {
    width: 40px;
    height: 40px;
  }
}
</style>

<div class="course-track">
  <section class="track-hero">
    <span class="track-kicker">Course 01</span>
    <h2>AI Town：从像素小镇学 Agent 基础设施</h2>
    <p>这门课程把 AI Town 拆成一组可复用的工程知识：可靠调度、串行状态机、实时回放、异步 LLM、记忆检索，以及如何把这些思想迁移到真实产品。</p>
    <div class="track-summary" aria-label="课程概览">
      <div>
        <strong>学习对象</strong>
        <p>想从 demo 走向 Agent runtime 设计的开发者。</p>
      </div>
      <div>
        <strong>主线问题</strong>
        <p>如何把不确定的 LLM 放进确定的系统。</p>
      </div>
      <div>
        <strong>当前状态</strong>
        <p>课程目录已建立，7 篇文章全部发布：1 篇总览 + 6 篇子系统深入。</p>
      </div>
    </div>
  </section>
  <h2 class="track-section-title">课程文章</h2>
  <section class="lesson-list">
    <article class="lesson-card">
      <span class="lesson-number">01</span>
      <div>
        <span class="lesson-state is-live">已发布</span>
        <h3>AI Town 值得学习的不是像素小镇，而是 Agent 基础设施</h3>
        <p>建立完整地图：Convex 调度、单线程 step、历史回放、异步 LLM、记忆向量检索分别解决什么问题。</p>
      </div>
      <a class="lesson-link" href="/2026/05/16/ai-town-agent-infrastructure-convex-runtime/">阅读文章</a>
    </article>
    <article class="lesson-card">
      <span class="lesson-number">02</span>
      <div>
        <span class="lesson-state is-live">已发布</span>
        <h3>Convex 调度：让世界可靠续跑</h3>
        <p>拆解 query、mutation、action、scheduler 的边界，以及为什么不要用常驻 while loop 驱动 Agent 世界。</p>
      </div>
      <a class="lesson-link" href="/2026/06/14/ai-town-convex-scheduling/">阅读文章</a>
    </article>
    <article class="lesson-card">
      <span class="lesson-number">03</span>
      <div>
        <span class="lesson-state is-live">已发布</span>
        <h3>单线程 Step：把 World 设计成 Actor</h3>
        <p>学习 input queue、generation、diff save 如何让多来源输入保持串行、可恢复、可调试。</p>
      </div>
      <a class="lesson-link" href="/2026/06/14/ai-town-single-thread-engine/">阅读文章</a>
    </article>
    <article class="lesson-card">
      <span class="lesson-number">04</span>
      <div>
        <span class="lesson-state is-live">已发布</span>
        <h3>历史回放：低频写库，高频渲染</h3>
        <p>理解 server authoritative state、historical buffer、client replay 如何共同支撑平滑实时体验。</p>
      </div>
      <a class="lesson-link" href="/2026/06/14/ai-town-historical-replay/">阅读文章</a>
    </article>
    <article class="lesson-card">
      <span class="lesson-number">05</span>
      <div>
        <span class="lesson-state is-live">已发布</span>
        <h3>异步 LLM Operation：慢思考不要阻塞主循环</h3>
        <p>拆解 Agent.tick、startOperation、internalAction、结果回流 input 的边界设计。</p>
      </div>
      <a class="lesson-link" href="/2026/06/14/ai-town-async-llm-operations/">阅读文章</a>
    </article>
    <article class="lesson-card">
      <span class="lesson-number">06</span>
      <div>
        <span class="lesson-state is-live">已发布</span>
        <h3>记忆向量检索：从事件到 Prompt 注入</h3>
        <p>学习 summary、embedding cache、vector search、top-k 召回、记忆污染控制这些长期上下文问题。</p>
      </div>
      <a class="lesson-link" href="/2026/06/14/ai-town-memory-vector-retrieval/">阅读文章</a>
    </article>
    <article class="lesson-card">
      <span class="lesson-number">07</span>
      <div>
        <span class="lesson-state is-live">已发布</span>
        <h3>迁移实践：从 AI Town 到真实 Agent 产品</h3>
        <p>把这套 runtime 思路迁移到客服、协作工具、游戏 NPC、工作流 Agent 和知识库助手。</p>
      </div>
      <a class="lesson-link" href="/2026/06/14/ai-town-migration-to-agent-product/">阅读文章</a>
    </article>
  </section>
  <h2 class="track-section-title">知识地图</h2>
  <section class="track-map">
    <span>核心状态由 engine 独占，外部变化统一进入 input。</span>
    <span>慢速 LLM 放在 action 里执行，完成后再回流给状态机。</span>
    <span>长期上下文用摘要、embedding 和检索组成可维护记忆。</span>
  </section>
  <section class="track-note">
    <p>后续补文章时，每篇文章会对应一个明确模块。课程页会持续作为目录，不让知识散落在归档和标签里。</p>
  </section>
</div>
