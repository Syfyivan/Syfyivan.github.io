---
title: "计网与代理工具学习路线"
date: 2026-06-11 20:00:00
description: "一条把计算机网络基础、代理工具原理、DNS 分流、规则引擎和排障方法串起来的学习路线。"
---

<style>
.net-track {
  --net-ink: #17202a;
  --net-muted: #5d6f7f;
  --net-line: rgba(23, 32, 42, 0.12);
  --net-panel: #ffffff;
  --net-wash: #f5f8fa;
  --net-green: #0f766e;
  --net-blue: #2f6387;
  --net-red: #bd5945;
  max-width: 920px;
  margin: 0 auto;
  color: var(--net-ink);
}

.net-track * {
  box-sizing: border-box;
}

.net-hero {
  padding: 32px;
  border: 1px solid var(--net-line);
  border-left: 5px solid var(--net-green);
  border-radius: 8px;
  background: #fbfcfb;
  box-shadow: 0 10px 26px rgba(23, 32, 42, 0.05);
}

.net-kicker {
  display: inline-flex;
  margin-bottom: 14px;
  padding: 5px 9px;
  border-radius: 999px;
  color: var(--net-green);
  background: rgba(15, 118, 110, 0.1);
  font-size: 13px;
  font-weight: 700;
}

.net-hero h2 {
  margin: 0 0 14px;
  font-size: 31px;
  line-height: 1.25;
  letter-spacing: 0;
}

.net-hero p,
.net-note p,
.net-card p,
.net-rhythm p {
  margin: 0;
  color: var(--net-muted);
  line-height: 1.8;
}

.net-section-title {
  margin: 34px 0 16px;
  font-size: 22px;
  letter-spacing: 0;
}

.net-note {
  margin-top: 18px;
  padding: 16px 18px;
  border-left: 4px solid var(--net-red);
  border-radius: 8px;
  background: var(--net-wash);
}

.net-list {
  display: grid;
  gap: 14px;
}

.net-card {
  display: grid;
  grid-template-columns: 54px minmax(0, 1fr) auto;
  gap: 16px;
  align-items: center;
  padding: 18px;
  border: 1px solid var(--net-line);
  border-radius: 8px;
  background: var(--net-panel);
  box-shadow: 0 10px 24px rgba(23, 32, 42, 0.06);
  transition: border-color 0.16s ease, box-shadow 0.16s ease, transform 0.16s ease;
}

.net-card:hover {
  border-color: rgba(15, 118, 110, 0.26);
  box-shadow: 0 14px 30px rgba(23, 32, 42, 0.08);
  transform: translateY(-1px);
}

.net-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 8px;
  color: #ffffff;
  background: var(--net-blue);
  font-weight: 800;
}

.net-card h3 {
  margin: 0 0 7px;
  font-size: 19px;
  letter-spacing: 0;
}

.net-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  padding: 8px 13px;
  border: 1px solid rgba(15, 118, 110, 0.22);
  border-radius: 8px;
  color: var(--net-green);
  font-weight: 700;
  text-decoration: none !important;
  white-space: nowrap;
}

.net-link:hover {
  color: #ffffff;
  background: var(--net-green);
}

.net-rhythm-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.net-rhythm {
  padding: 16px;
  border: 1px solid var(--net-line);
  border-radius: 8px;
  background: var(--net-wash);
}

.net-rhythm strong {
  display: block;
  margin-bottom: 6px;
}

html[data-user-color-scheme="dark"] .net-track {
  --net-ink: rgba(246, 249, 252, 0.94);
  --net-muted: rgba(224, 233, 242, 0.72);
  --net-line: rgba(255, 255, 255, 0.1);
  --net-panel: rgba(23, 32, 42, 0.9);
  --net-wash: rgba(255, 255, 255, 0.045);
}

html[data-user-color-scheme="dark"] .net-hero,
html[data-user-color-scheme="dark"] .net-card {
  background: var(--net-panel);
}

@media (max-width: 760px) {
  .net-hero {
    padding: 22px;
  }

  .net-hero h2 {
    font-size: 26px;
  }

  .net-card {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .net-number {
    width: 40px;
    height: 40px;
  }

  .net-rhythm-grid {
    grid-template-columns: 1fr;
  }

  .net-link {
    width: 100%;
  }
}
</style>

<div class="net-track">
  <section class="net-hero">
    <span class="net-kicker">Network & Proxy</span>
    <h2>把计网基础和代理工具放在同一张图里学</h2>
    <p>代理工具不是一个神秘开关。它只是站在应用、DNS、操作系统网络栈和远端服务器之间，接管一部分流量，再按规则决定直连、转发、拒绝或调试。这门课按一次请求的真实路径来排，先懂网络，再懂工具。</p>
  </section>

  <section class="net-note">
    <p>边界说明：课程只讨论网络原理、调试方法和安全边界，不写节点购买、绕过策略或具体订阅配置。读完后应该能解释“为什么连不上”，而不是只会替换一份配置。</p>
  </section>

  <h2 class="net-section-title">文章目录</h2>
  <section class="net-list" aria-label="计网与代理工具学习文章目录">
    <article class="net-card">
      <span class="net-number">01</span>
      <div>
        <h3>一次网页请求到底走过哪些层</h3>
        <p>从 URL 到 DNS、TCP 或 QUIC、TLS、HTTP，把“请求”拆成能排查的几段。</p>
      </div>
      <a class="net-link" href="/2026/06/11/network-proxy-request-path/">阅读文章</a>
    </article>
    <article class="net-card">
      <span class="net-number">02</span>
      <div>
        <h3>DNS：代理工具里最容易被低估的一层</h3>
        <p>递归解析、权威服务器、TTL、DoH、DoT、fake-ip，以及为什么 DNS 会影响规则命中。</p>
      </div>
      <a class="net-link" href="/2026/06/11/network-proxy-dns-routing/">阅读文章</a>
    </article>
    <article class="net-card">
      <span class="net-number">03</span>
      <div>
        <h3>系统代理、TUN 和透明代理</h3>
        <p>代理客户端要先“看见”流量。系统代理、虚拟网卡和路由器接管各自解决不同问题。</p>
      </div>
      <a class="net-link" href="/2026/06/11/network-proxy-traffic-takeover/">阅读文章</a>
    </article>
    <article class="net-card">
      <span class="net-number">04</span>
      <div>
        <h3>正向代理、反向代理和 CONNECT 隧道</h3>
        <p>把代理按“代表谁”拆开，再理解 HTTPS 为什么常用 CONNECT 先搭一条隧道。</p>
      </div>
      <a class="net-link" href="/2026/06/11/network-proxy-types-connect/">阅读文章</a>
    </article>
    <article class="net-card">
      <span class="net-number">05</span>
      <div>
        <h3>规则引擎和策略组</h3>
        <p>分流不是玄学：规则拿到哪些上下文，按什么顺序匹配，策略组怎样在运行时选择出口。</p>
      </div>
      <a class="net-link" href="/2026/06/11/network-proxy-rules-policy-groups/">阅读文章</a>
    </article>
    <article class="net-card">
      <span class="net-number">06</span>
      <div>
        <h3>代理网络排障清单</h3>
        <p>按 DNS、入口接管、规则、出口、TLS、UDP/QUIC、日志逐层定位，不靠盲目换配置。</p>
      </div>
      <a class="net-link" href="/2026/06/11/network-proxy-troubleshooting/">阅读文章</a>
    </article>
    <article class="net-card">
      <span class="net-number">07</span>
      <div>
        <h3>Surge 和免费代理工具的差别</h3>
        <p>把流量接管、DNS、规则、策略、MITM、脚本和产品化集成放在一起比较。</p>
      </div>
      <a class="net-link" href="/2026/06/10/surge-free-proxy-tools-principles/">阅读文章</a>
    </article>
  </section>

  <h2 class="net-section-title">练习节奏</h2>
  <section class="net-rhythm-grid">
    <article class="net-rhythm">
      <strong>先画路径</strong>
      <p>遇到问题先画“应用 -> DNS -> 接管入口 -> 规则 -> 出口 -> 目标站点”，不要一上来改配置。</p>
    </article>
    <article class="net-rhythm">
      <strong>再看证据</strong>
      <p>用日志、DNS 查询、连接列表、curl 输出验证每一层。能解释证据，比背规则语法更重要。</p>
    </article>
    <article class="net-rhythm">
      <strong>最后改一处</strong>
      <p>一次只改 DNS、规则、策略或入口之一。多处同时改，排障结果就失去可解释性。</p>
    </article>
    <article class="net-rhythm">
      <strong>记住安全边界</strong>
      <p>MITM、局域网共享、透明代理和远端规则都可能扩大信任范围。调试能力越强，越要知道什么时候不要开。</p>
    </article>
  </section>
</div>
