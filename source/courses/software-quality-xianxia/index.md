---
title: "质道九境 · 软件质量与测试（修仙版）章节目录"
date: 2026-06-20 12:30:00
description: "同一门《软件质量保证与测试》的第二种讲法——修仙版。女弟子青萝在灵枢宗修「质道九境」，从绪论到高质量编程，正式术语原样入文、每讲配考点卡与小试炼，零基础也能应付期末。"
---

<style>
.sqx-track {
  --sqx-ink: #1e1b29;
  --sqx-muted: #5e5872;
  --sqx-line: rgba(40, 32, 64, 0.14);
  --sqx-panel: #ffffff;
  --sqx-wash: #f4f2f9;
  --sqx-violet: #5b4b9e;
  --sqx-rose: #a8447a;
  --sqx-gold: #8a6d2e;
  max-width: 960px;
  margin: 0 auto;
  color: var(--sqx-ink);
}
.sqx-track * { box-sizing: border-box; }
.sqx-hero {
  padding: 30px;
  border: 1px solid var(--sqx-line);
  border-left: 5px solid var(--sqx-violet);
  border-radius: 8px;
  background: #fbfaff;
  box-shadow: 0 10px 26px rgba(40, 32, 64, 0.07);
}
.sqx-kicker {
  display: inline-flex;
  margin-bottom: 14px;
  padding: 5px 9px;
  border-radius: 999px;
  color: var(--sqx-violet);
  background: rgba(91, 75, 158, 0.12);
  font-size: 13px;
  font-weight: 700;
}
.sqx-hero h2 { margin: 0 0 14px; font-size: 30px; line-height: 1.25; letter-spacing: 0; }
.sqx-hero p,
.sqx-note p,
.sqx-card p,
.sqx-rhythm p {
  margin: 0;
  color: var(--sqx-muted);
  line-height: 1.8;
}
.sqx-parent {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid var(--sqx-line);
}
.sqx-parent span { color: var(--sqx-muted); font-weight: 700; }
.sqx-note {
  margin-top: 18px;
  padding: 16px 18px;
  border-left: 4px solid var(--sqx-rose);
  border-radius: 8px;
  background: var(--sqx-wash);
}
.sqx-section-title { margin: 34px 0 16px; font-size: 22px; letter-spacing: 0; }
.sqx-list { display: grid; gap: 14px; }
.sqx-card {
  display: grid;
  grid-template-columns: 84px minmax(0, 1fr) auto;
  gap: 16px;
  align-items: center;
  padding: 18px;
  border: 1px solid var(--sqx-line);
  border-radius: 8px;
  background: var(--sqx-panel);
  box-shadow: 0 10px 24px rgba(40, 32, 64, 0.06);
  transition: border-color 0.16s ease, box-shadow 0.16s ease, transform 0.16s ease;
}
.sqx-card:hover {
  border-color: rgba(91, 75, 158, 0.3);
  box-shadow: 0 14px 30px rgba(40, 32, 64, 0.1);
  transform: translateY(-1px);
}
.sqx-number {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 70px;
  min-height: 48px;
  padding: 4px 8px;
  border-radius: 8px;
  color: #ffffff;
  background: var(--sqx-violet);
  font-weight: 800;
  line-height: 1.2;
}
.sqx-number small { font-size: 11px; font-weight: 700; opacity: 0.85; }
.sqx-card h3 { margin: 0 0 7px; font-size: 19px; letter-spacing: 0; }
.sqx-card small.tag {
  display: block;
  margin-bottom: 6px;
  color: var(--sqx-gold);
  font-weight: 700;
}
.sqx-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  padding: 8px 13px;
  border: 1px solid rgba(91, 75, 158, 0.32);
  border-radius: 8px;
  color: var(--sqx-violet);
  font-weight: 700;
  text-decoration: none !important;
  white-space: nowrap;
}
.sqx-link:hover { color: #ffffff; background: var(--sqx-violet); }
.sqx-rhythm-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
.sqx-rhythm {
  padding: 16px;
  border: 1px solid var(--sqx-line);
  border-radius: 8px;
  background: var(--sqx-wash);
}
.sqx-rhythm strong { display: block; margin-bottom: 6px; color: var(--sqx-rose); }
html[data-user-color-scheme="dark"] .sqx-track {
  --sqx-ink: rgba(244, 242, 252, 0.94);
  --sqx-muted: rgba(223, 219, 236, 0.72);
  --sqx-line: rgba(255, 255, 255, 0.1);
  --sqx-panel: rgba(31, 28, 44, 0.9);
  --sqx-wash: rgba(255, 255, 255, 0.05);
}
html[data-user-color-scheme="dark"] .sqx-hero,
html[data-user-color-scheme="dark"] .sqx-card { background: var(--sqx-panel); }
@media (max-width: 760px) {
  .sqx-hero { padding: 22px; }
  .sqx-hero h2 { font-size: 25px; }
  .sqx-card { grid-template-columns: 1fr; gap: 12px; }
  .sqx-number { width: 100%; flex-direction: row; gap: 8px; }
  .sqx-rhythm-grid { grid-template-columns: 1fr; }
  .sqx-link { width: 100%; }
}
</style>

<div class="sqx-track">
  <section class="sqx-hero">
    <span class="sqx-kicker">质道九境 · 修仙版</span>
    <h2>灵枢宗·青萝修质道：把软件质量讲成修仙</h2>
    <p>这是同一门《软件质量保证与测试》的<strong>第二种讲法</strong>。零基础女弟子青萝入灵枢宗，从「为何入质道」一路修到「炼码境」，把质量、缺陷、度量、评审、标准、设计、编程这些考点，放进试炼、会审、委托、闭关的情境里。叙事是修仙，但<strong>正式术语原样入文</strong>——你在故事里看到的就是考试要写的词。</p>
    <div class="sqx-parent">
      <span>面向：零基础初学者 + 期末闭卷复习</span>
      <a class="sqx-link" href="/courses/">返回课程总目录</a>
      <a class="sqx-link" href="/courses/software-quality-fables/">换成寓言版</a>
      <a class="sqx-link" href="/2026/06/20/software-quality-xianxia-00-why-quality/">从引子读起</a>
    </div>
  </section>
  <section class="sqx-note">
    <p>每一境都按固定的「七段式」展开：<strong>故事正文 → 本节术语 → 概念正解 → 场景映射 → 考点卡 → 小试炼 → 易错点</strong>。修仙情节负责让你愿意读、记得住；考点卡和概念正解负责让你在闭卷考试里写出正式答案。</p>
  </section>
  <section class="sqx-note">
    <p><strong>考试边界：</strong>本目录下 00-09 讲的正式考点只以本地资料 <code>/Users/大三下学习资料/软件测试/复习资料</code> 为边界；其中 00-09 分别对应 <code>理论0</code> 到 <code>理论9</code> 的 PPT/PDF。修仙故事、场景映射和小试炼只作辅助理解，闭卷答题以 PPT 原词、复习资料和往年题为准。</p>
  </section>
  <section class="sqx-note">
    <p>这一版与<a href="/courses/software-quality-fables/">寓言版·家具坊</a>是<strong>同一门课的两个板块</strong>：知识点同源、各自独立成篇、风格迥异。两版每讲都互相对照链接，方便你挑顺眼的那种讲法，或两版对读、看哪种更记得住。</p>
  </section>
  <h2 class="sqx-section-title">质道九境 · 学习路径</h2>
  <section class="sqx-list" aria-label="质道九境章节目录">
    <article class="sqx-card">
      <span class="sqx-number">00<small>引子</small></span>
      <div><small class="tag">为何入质道</small><h3>软件事故频发与质量人才稀缺</h3><p>青萝入门第一日：为什么先学质量、AI 时代质量角色、课程构成与闭卷题型。</p></div>
      <a class="sqx-link" href="/2026/06/20/software-quality-xianxia-00-why-quality/">阅读</a>
    </article>
    <article class="sqx-card">
      <span class="sqx-number">01<small>识质境</small></span>
      <div><small class="tag">质量</small><h3>一炉丹药，三位求丹人</h3><p>质量是一组固有特性满足要求的程度；明示/暗示需求、客户、质量属性与三层次。</p></div>
      <a class="sqx-link" href="/2026/06/20/software-quality-xianxia-01-what-is-quality/">阅读</a>
    </article>
    <article class="sqx-card">
      <span class="sqx-number">02<small>辨软境</small></span>
      <div><small class="tag">软件质量</small><h3>软件无形，缺陷难察</h3><p>软硬件差异、开发过程与 V 模型、缺陷构成，以及 3A／3 维／ISO9126 特性。</p></div>
      <a class="sqx-link" href="/2026/06/20/software-quality-xianxia-02-software-quality/">阅读</a>
    </article>
    <article class="sqx-card">
      <span class="sqx-number">03<small>立体系</small></span>
      <div><small class="tag">质量工程体系</small><h3>宗门不是一间炼器房</h3><p>系统工程、质量因素与指标、三大质量模型、方针/控制/保证/改进与质量成本。</p></div>
      <a class="sqx-link" href="/2026/06/20/software-quality-xianxia-03-quality-system/">阅读</a>
    </article>
    <article class="sqx-card">
      <span class="sqx-number">04<small>量化境</small></span>
      <div><small class="tag">质量度量</small><h3>准与稳</h3><p>测量/度量/指标、四种尺度、有效性与可靠性、缺陷密度、McCabe 圈复杂度与二八规则。</p></div>
      <a class="sqx-link" href="/2026/06/20/software-quality-xianxia-04-metrics/">阅读</a>
    </article>
    <article class="sqx-card">
      <span class="sqx-number">05<small>守律境</small></span>
      <div><small class="tag">质量标准</small><h3>宗规九阶</h3><p>标准的层次、ISO 9001 与 CMM、CMMI 五级成熟度、关键过程域与量化管理。</p></div>
      <a class="sqx-link" href="/2026/06/20/software-quality-xianxia-05-standards/">阅读</a>
    </article>
    <article class="sqx-card">
      <span class="sqx-number">06<small>会审境</small></span>
      <div><small class="tag">软件评审</small><h3>小缺陷不早审，缺陷成本会暴涨</h3><p>缺陷越晚越贵、四类评审、五种方法（审查最正式）、评审会议与四种结果。</p></div>
      <a class="sqx-link" href="/2026/06/20/software-quality-xianxia-06-review/">阅读</a>
    </article>
    <article class="sqx-card">
      <span class="sqx-number">07<small>护法境</small></span>
      <div><small class="tag">SQA 组织</small><h3>执律一脉为何独立</h3><p>三种组织结构、全/非全职角色、SQA 与测试之别、评审 vs 审核、CSQA／CSQE。</p></div>
      <a class="sqx-link" href="/2026/06/20/software-quality-xianxia-07-sqa-organization/">阅读</a>
    </article>
    <article class="sqx-card">
      <span class="sqx-number">08<small>筑设境</small></span>
      <div><small class="tag">设计质量</small><h3>需求化形为蓝图</h3><p>低耦合高内聚、面向对象设计原则、C/S 与 B/S 与多层架构、设计模式与数据字典。</p></div>
      <a class="sqx-link" href="/2026/06/20/software-quality-xianxia-08-design-quality/">阅读</a>
    </article>
    <article class="sqx-card">
      <span class="sqx-number">09<small>炼码境</small></span>
      <div><small class="tag">高质量编程</small><h3>名不正则术不灵</h3><p>命名与函数规则、程序版式、if 与 0 的比较、内存管理（内存泄漏与野指针）与 const。</p></div>
      <a class="sqx-link" href="/2026/06/20/software-quality-xianxia-09-quality-coding/">阅读</a>
    </article>
  </section>
  <h2 class="sqx-section-title">这一版的写作底线</h2>
  <section class="sqx-rhythm-grid">
    <div class="sqx-rhythm"><strong>术语入文</strong><p>不造「灵尺/护法司/天劫」式黑话；正式术语原样进正文、讲解、题目和答案。</p></div>
    <div class="sqx-rhythm"><strong>故事载体</strong><p>修仙只负责情境、冲突、节奏和记忆点，让你愿意读、记得住、能复述。</p></div>
    <div class="sqx-rhythm"><strong>考试落地</strong><p>每讲考点卡按判断/选择/填空/简答/设计组织，答题一律回到课件关键词。</p></div>
  </section>
</div>
