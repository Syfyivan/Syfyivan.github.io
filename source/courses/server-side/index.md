---
title: "Go 与服务端学习路线"
date: 2026-06-06 10:00:00
description: "一条按写服务的顺序整理的 Go 后端学习路线：接口、数据、缓存、消息、微服务、观测、架构和上线。"
---

<style>
.server-track {
  --server-ink: #18212b;
  --server-muted: #5f6f7e;
  --server-line: rgba(24, 33, 43, 0.12);
  --server-panel: #ffffff;
  --server-wash: #f5f8fa;
  --server-teal: #0f766e;
  --server-blue: #2f6387;
  --server-coral: #bd5945;
  color: var(--server-ink);
}

.server-track * {
  box-sizing: border-box;
}

.server-hero {
  padding: 32px;
  border: 1px solid var(--server-line);
  border-radius: 8px;
  background: var(--server-panel);
}

.server-kicker {
  display: inline-flex;
  margin-bottom: 14px;
  padding: 5px 9px;
  border-radius: 999px;
  color: var(--server-teal);
  background: rgba(15, 118, 110, 0.1);
  font-size: 13px;
  font-weight: 700;
}

.server-hero h2 {
  margin: 0 0 14px;
  font-size: 31px;
  line-height: 1.25;
  letter-spacing: 0;
}

.server-hero p,
.server-note p,
.lesson-card p,
.rhythm-card p {
  margin: 0;
  color: var(--server-muted);
  line-height: 1.8;
}

.server-section-title {
  margin: 34px 0 16px;
  font-size: 22px;
  letter-spacing: 0;
}

.server-note {
  margin-top: 18px;
  padding: 16px 18px;
  border-left: 4px solid var(--server-coral);
  border-radius: 8px;
  background: var(--server-wash);
}

.lesson-list {
  display: grid;
  gap: 14px;
}

.lesson-card {
  display: grid;
  grid-template-columns: 54px minmax(0, 1fr) auto;
  gap: 16px;
  align-items: center;
  padding: 18px;
  border: 1px solid var(--server-line);
  border-radius: 8px;
  background: var(--server-panel);
  box-shadow: 0 10px 24px rgba(24, 33, 43, 0.06);
}

.lesson-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 8px;
  color: #ffffff;
  background: var(--server-blue);
  font-weight: 800;
}

.lesson-card h3 {
  margin: 0 0 7px;
  font-size: 19px;
  letter-spacing: 0;
}

.lesson-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  padding: 8px 13px;
  border: 1px solid rgba(15, 118, 110, 0.22);
  border-radius: 8px;
  color: var(--server-teal);
  font-weight: 700;
  text-decoration: none !important;
  white-space: nowrap;
}

.lesson-link:hover {
  color: #ffffff;
  background: var(--server-teal);
}

.rhythm-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.rhythm-card {
  padding: 16px;
  border: 1px solid var(--server-line);
  border-radius: 8px;
  background: var(--server-wash);
}

.rhythm-card strong {
  display: block;
  margin-bottom: 6px;
}

@media (max-width: 760px) {
  .server-hero {
    padding: 22px;
  }

  .server-hero h2 {
    font-size: 26px;
  }

  .lesson-card {
    grid-template-columns: 1fr;
  }

  .lesson-number {
    width: 40px;
    height: 40px;
  }

  .rhythm-grid {
    grid-template-columns: 1fr;
  }
}
</style>

<div class="server-track">
  <section class="server-hero">
    <span class="server-kicker">Server Notes</span>
    <h2>Go 与服务端：按写一个服务的顺序学</h2>
    <p>这不是面试八股目录，也不是“从入门到精通”。我按自己补后端时更顺手的顺序排了一遍：先把 Go 代码写稳，再接 HTTP，请求落到数据库；流量上来后补缓存和消息；服务拆开后再补 RPC、观测、架构和上线。</p>
  </section>

  <section class="server-note">
    <p>读法很简单：先从 01 顺着看一遍；每看到一个中间件，就问它解决的是性能、解耦、可靠性，还是排障问题。别急着堆技术名词，先把一条请求怎么走明白。</p>
  </section>

  <h2 class="server-section-title">文章目录</h2>
  <section class="lesson-list" aria-label="服务端学习文章目录">
    <article class="lesson-card">
      <span class="lesson-number">01</span>
      <div>
        <h3>Go 基础：先写出可靠服务</h3>
        <p>值和指针、interface 边界、错误上下文、goroutine 退出、context 和测试。</p>
      </div>
      <a class="lesson-link" href="/2026/06/06/go-server-foundation-reliable-services/">阅读文章</a>
    </article>
    <article class="lesson-card">
      <span class="lesson-number">02</span>
      <div>
        <h3>HTTP 与 API：请求如何进系统</h3>
        <p>handler 的边界、状态码、中间件、超时、幂等，以及入口层该做什么。</p>
      </div>
      <a class="lesson-link" href="/2026/06/06/go-server-http-api-request-lifecycle/">阅读文章</a>
    </article>
    <article class="lesson-card">
      <span class="lesson-number">03</span>
      <div>
        <h3>数据库：先把事实存对</h3>
        <p>建表、唯一约束、状态机、索引、事务和线上 schema 迁移。</p>
      </div>
      <a class="lesson-link" href="/2026/06/06/go-server-database-state-source/">阅读文章</a>
    </article>
    <article class="lesson-card">
      <span class="lesson-number">04</span>
      <div>
        <h3>缓存：不是更快的数据库</h3>
        <p>Redis、旁路缓存、一致性窗口、穿透击穿雪崩、热点和分布式锁边界。</p>
      </div>
      <a class="lesson-link" href="/2026/06/06/go-server-cache-redis-consistency/">阅读文章</a>
    </article>
    <article class="lesson-card">
      <span class="lesson-number">05</span>
      <div>
        <h3>消息队列：把旁路事情异步掉</h3>
        <p>至少一次投递、幂等、重试、死信、局部顺序和 outbox。</p>
      </div>
      <a class="lesson-link" href="/2026/06/06/go-server-message-queue-async-reliability/">阅读文章</a>
    </article>
    <article class="lesson-card">
      <span class="lesson-number">06</span>
      <div>
        <h3>RPC 与微服务：拆开以后先处理失败</h3>
        <p>服务边界、接口契约、超时预算、重试、熔断、限流和降级。</p>
      </div>
      <a class="lesson-link" href="/2026/06/06/go-server-rpc-microservices-governance/">阅读文章</a>
    </article>
    <article class="lesson-card">
      <span class="lesson-number">07</span>
      <div>
        <h3>可观测性：坏了以后能查</h3>
        <p>结构化日志、指标、trace、告警，以及怎么从一次慢请求查到下游。</p>
      </div>
      <a class="lesson-link" href="/2026/06/06/go-server-observability-logs-metrics-tracing/">阅读文章</a>
    </article>
    <article class="lesson-card">
      <span class="lesson-number">08</span>
      <div>
        <h3>架构设计：把取舍写清楚</h3>
        <p>约束、单体和微服务、领域边界、一致性等级、状态机和设计文档。</p>
      </div>
      <a class="lesson-link" href="/2026/06/06/go-server-architecture-design-tradeoffs/">阅读文章</a>
    </article>
    <article class="lesson-card">
      <span class="lesson-number">09</span>
      <div>
        <h3>部署运维：上线要能退回来</h3>
        <p>配置、容器、健康检查、灰度、回滚、压测和故障演练。</p>
      </div>
      <a class="lesson-link" href="/2026/06/06/go-server-delivery-ops-production/">阅读文章</a>
    </article>
    <article class="lesson-card">
      <span class="lesson-number">10</span>
      <div>
        <h3>综合项目：用订单系统串起来</h3>
        <p>从单体到缓存、MQ、微服务和生产化，把前面的问题放进一条业务链路里。</p>
      </div>
      <a class="lesson-link" href="/2026/06/06/go-server-capstone-project/">阅读文章</a>
    </article>
  </section>

  <h2 class="server-section-title">练习节奏</h2>
  <section class="rhythm-grid">
    <article class="rhythm-card">
      <strong>先写一个能跑的单体</strong>
      <p>Go 基础、HTTP、数据库一起练。别急着拆服务，先把 handler、service、repository 的边界写清楚。</p>
    </article>
    <article class="rhythm-card">
      <strong>再加两个中间件</strong>
      <p>Redis 解决读性能，MQ 解决旁路异步。每加一个，都顺手造一次故障。</p>
    </article>
    <article class="rhythm-card">
      <strong>最后拆服务</strong>
      <p>拆完补超时、重试、trace、降级。别只把代码拆开，治理能力也要跟上。</p>
    </article>
    <article class="rhythm-card">
      <strong>写一份复盘</strong>
      <p>记录一次慢查询、一次缓存故障、一次消息重复、一次发布回滚。服务端能力很大一部分是在复盘里长出来的。</p>
    </article>
  </section>
</div>
