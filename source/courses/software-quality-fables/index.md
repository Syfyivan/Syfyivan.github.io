---
title: "软件质量与测试大寓言课 · 章节目录"
date: 2026-06-20 11:00:00
description: "把大学《软件质量保证与测试》九章理论 + 绪论，用「榫卯镇·老周家具坊」一套寓言讲给零基础的人听；每讲都配一段贴合课件原话的『背诵版』，考前直接背。"
---

<style>
.sqf-track {
  --sqf-ink: #1f2522;
  --sqf-muted: #627068;
  --sqf-line: rgba(31, 37, 34, 0.13);
  --sqf-panel: #ffffff;
  --sqf-wash: #f5f7f1;
  --sqf-green: #2f6f5e;
  --sqf-rust: #a44f32;
  --sqf-gold: #8a6f2e;
  max-width: 960px;
  margin: 0 auto;
  color: var(--sqf-ink);
}
.sqf-track * { box-sizing: border-box; }
.sqf-hero {
  padding: 30px;
  border: 1px solid var(--sqf-line);
  border-left: 5px solid var(--sqf-green);
  border-radius: 8px;
  background: #fbfcf9;
  box-shadow: 0 10px 26px rgba(31, 37, 34, 0.06);
}
.sqf-kicker {
  display: inline-flex;
  margin-bottom: 14px;
  padding: 5px 9px;
  border-radius: 999px;
  color: var(--sqf-green);
  background: rgba(47, 111, 94, 0.11);
  font-size: 13px;
  font-weight: 700;
}
.sqf-hero h2 { margin: 0 0 14px; font-size: 30px; line-height: 1.25; letter-spacing: 0; }
.sqf-hero p,
.sqf-note p,
.sqf-card p,
.sqf-rhythm p {
  margin: 0;
  color: var(--sqf-muted);
  line-height: 1.8;
}
.sqf-parent {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid var(--sqf-line);
}
.sqf-parent span {
  color: var(--sqf-muted);
  font-weight: 700;
}
.sqf-note {
  margin-top: 18px;
  padding: 16px 18px;
  border-left: 4px solid var(--sqf-rust);
  border-radius: 8px;
  background: var(--sqf-wash);
}
.sqf-section-title { margin: 34px 0 16px; font-size: 22px; letter-spacing: 0; }
.sqf-list { display: grid; gap: 14px; }
.sqf-card {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr) auto;
  gap: 16px;
  align-items: center;
  padding: 18px;
  border: 1px solid var(--sqf-line);
  border-radius: 8px;
  background: var(--sqf-panel);
  box-shadow: 0 10px 24px rgba(31, 37, 34, 0.06);
  transition: border-color 0.16s ease, box-shadow 0.16s ease, transform 0.16s ease;
}
.sqf-card:hover {
  border-color: rgba(47, 111, 94, 0.28);
  box-shadow: 0 14px 30px rgba(31, 37, 34, 0.08);
  transform: translateY(-1px);
}
.sqf-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 58px;
  min-height: 42px;
  padding: 0 8px;
  border-radius: 8px;
  color: #ffffff;
  background: var(--sqf-green);
  font-weight: 800;
}
.sqf-card h3 { margin: 0 0 7px; font-size: 19px; letter-spacing: 0; }
.sqf-card small {
  display: block;
  margin-bottom: 6px;
  color: var(--sqf-gold);
  font-weight: 700;
}
.sqf-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  padding: 8px 13px;
  border: 1px solid rgba(47, 111, 94, 0.3);
  border-radius: 8px;
  color: var(--sqf-green);
  font-weight: 700;
  text-decoration: none !important;
  white-space: nowrap;
}
.sqf-link:hover { color: #ffffff; background: var(--sqf-green); }
.sqf-rhythm-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
.sqf-rhythm {
  padding: 16px;
  border: 1px solid var(--sqf-line);
  border-radius: 8px;
  background: var(--sqf-wash);
}
.sqf-rhythm strong { display: block; margin-bottom: 6px; color: var(--sqf-rust); }
html[data-user-color-scheme="dark"] .sqf-track {
  --sqf-ink: rgba(246, 249, 246, 0.94);
  --sqf-muted: rgba(224, 233, 226, 0.72);
  --sqf-line: rgba(255, 255, 255, 0.1);
  --sqf-panel: rgba(28, 35, 32, 0.9);
  --sqf-wash: rgba(255, 255, 255, 0.045);
}
html[data-user-color-scheme="dark"] .sqf-hero,
html[data-user-color-scheme="dark"] .sqf-card { background: var(--sqf-panel); }
@media (max-width: 760px) {
  .sqf-hero { padding: 22px; }
  .sqf-hero h2 { font-size: 25px; }
  .sqf-card { grid-template-columns: 1fr; gap: 12px; }
  .sqf-number { width: 58px; }
  .sqf-rhythm-grid { grid-template-columns: 1fr; }
  .sqf-link { width: 100%; }
}
</style>

<div class="sqf-track">
  <section class="sqf-hero">
    <span class="sqf-kicker">Software Quality Fables / 软件质量与测试</span>
    <h2>榫卯镇·老周的家具坊：把软件质量讲成做家具</h2>
    <p>这是把大学《软件质量保证与测试》整门课改写成的一套寓言课。学徒小磊在老周的家具坊里，从「为什么要有个专挑毛病的师姐」一路学到「一榫一卯怎么讲究」，把质量、缺陷、度量、评审、标准、设计、编程这些考点，全用做家具的事讲明白。</p>
    <div class="sqf-parent">
      <span>面向：零基础初学者 + 期末闭卷复习</span>
      <a class="sqf-link" href="/courses/">返回课程总目录</a>
      <a class="sqf-link" href="/2026/06/20/software-quality-fables-00-why-quality/">从第 00 讲读起</a>
    </div>
  </section>
  <section class="sqf-note">
    <p>每一讲都是「双轨」：前半用<strong>家具坊寓言</strong>把概念讲到小白也懂；后半给一段 <strong>📌 课件原文 · 标准知识点（背诵版）</strong>，尽量贴合课件原话、按考点分条，考前直接背这一节即可。理念讲懂、原话背牢，两头都不耽误。</p>
  </section>
  <section class="sqf-note">
    <p><strong>考试边界：</strong>本目录下 00-09 讲的正式考点只以本地资料 <code>/Users/大三下学习资料/软件测试/复习资料</code> 为边界；其中 00-09 分别对应 <code>理论0</code> 到 <code>理论9</code> 的 PPT/PDF。家具坊故事、类比和小练习只作辅助理解，闭卷答题以 PPT 原词、复习资料和往年题为准。</p>
  </section>
  <section class="sqf-note">
    <p>这门课有<strong>两个板块</strong>：本页是<strong>寓言版·家具坊</strong>；还有一版<a href="/courses/software-quality-xianxia/">修仙版·质道九境</a>，把同一套考点讲成女弟子青萝在灵枢宗修行。知识点同源、风格迥异，每讲互相对照链接，挑顺眼的读，或两版对读看哪种更记得住。</p>
  </section>
  <section class="sqf-note">
    <p>主线（一条故事线）：小磊进门见识<strong>为什么要把关</strong>（00）→ 弄懂<strong>什么算好</strong>（01）→ 明白<strong>软件和硬件不一样</strong>（02）→ 看清<strong>整座作坊的体系</strong>（03）→ 学会<strong>用尺子量手艺</strong>（04）→ 搞清<strong>行规和等级</strong>（05）→ 参加<strong>出货前的会审</strong>（06）→ 搭起<strong>把关的班子</strong>（07）→ 回到<strong>先把图纸画好</strong>（08）→ 收在<strong>一榫一卯的手上规矩</strong>（09）。</p>
  </section>
  <h2 class="sqf-section-title">章节学习路径</h2>
  <section class="sqf-list" aria-label="软件质量与测试大寓言课章节目录">
    <article class="sqf-card">
      <span class="sqf-number">00</span>
      <div><small>绪论 · 为什么学</small><h3>为什么要请个挑毛病的师姐</h3><p>软件越做越大、事故越来越多、把关人才稀缺；这门课讲什么，以及「首重理念，技术次之」。</p></div>
      <a class="sqf-link" href="/2026/06/20/software-quality-fables-00-why-quality/">阅读</a>
    </article>
    <article class="sqf-card">
      <span class="sqf-number">01</span>
      <div><small>第一章 · 质量</small><h3>什么算一件「好」家具</h3><p>质量的定义与属性、客户、四种质量观点、质量概念三层次、朱兰螺旋与质量管理发展。</p></div>
      <a class="sqf-link" href="/2026/06/20/software-quality-fables-01-what-is-quality/">阅读</a>
    </article>
    <article class="sqf-card">
      <span class="sqf-number">02</span>
      <div><small>第二章 · 软件质量</small><h3>木头和铁器不一样</h3><p>软硬件比较、开发过程与 V 模型、极限编程、软件缺陷构成，以及 3A／3 维／ISO9126 特性。</p></div>
      <a class="sqf-link" href="/2026/06/20/software-quality-fables-02-software-quality/">阅读</a>
    </article>
    <article class="sqf-card">
      <span class="sqf-number">03</span>
      <div><small>第三章 · 工程体系</small><h3>整座作坊的规矩</h3><p>质量因素与指标、McCall／Boehm／ISO 模型、方针/控制/保证/改进、六西格玛与质量成本。</p></div>
      <a class="sqf-link" href="/2026/06/20/software-quality-fables-03-quality-system/">阅读</a>
    </article>
    <article class="sqf-card">
      <span class="sqf-number">04</span>
      <div><small>第四章 · 质量度量</small><h3>用尺子量手艺</h3><p>测量/度量/指标、四种尺度、有效性与可靠性、缺陷密度、McCabe 圈复杂度与 Pareto 二八规则。</p></div>
      <a class="sqf-link" href="/2026/06/20/software-quality-fables-04-metrics/">阅读</a>
    </article>
    <article class="sqf-card">
      <span class="sqf-number">05</span>
      <div><small>第五章 · 质量标准</small><h3>行规和几星作坊</h3><p>标准的层次、ISO 9001 与 CMM 的区别、CMMI 五级成熟度、关键过程域与量化管理。</p></div>
      <a class="sqf-link" href="/2026/06/20/software-quality-fables-05-standards/">阅读</a>
    </article>
    <article class="sqf-card">
      <span class="sqf-number">06</span>
      <div><small>第六章 · 软件评审</small><h3>出货前的会审</h3><p>缺陷越晚越贵、四类评审内容、五种评审方法（审查最正式）、评审会议与四种评审结果。</p></div>
      <a class="sqf-link" href="/2026/06/20/software-quality-fables-06-review/">阅读</a>
    </article>
    <article class="sqf-card">
      <span class="sqf-number">07</span>
      <div><small>第七章 · SQA 组织</small><h3>质检班子怎么搭</h3><p>三种组织结构及优缺点、全/非全职角色、SQA 与测试之别、评审 vs 审核、CSQA／CSQE 认证。</p></div>
      <a class="sqf-link" href="/2026/06/20/software-quality-fables-07-sqa-organization/">阅读</a>
    </article>
    <article class="sqf-card">
      <span class="sqf-number">08</span>
      <div><small>第八章 · 设计质量</small><h3>先把图纸画好</h3><p>低耦合高内聚、面向对象设计原则、C/S 与 B/S 与多层架构、23 种设计模式三大类与数据字典。</p></div>
      <a class="sqf-link" href="/2026/06/20/software-quality-fables-08-design-quality/">阅读</a>
    </article>
    <article class="sqf-card">
      <span class="sqf-number">09</span>
      <div><small>第九章 · 高质量编程</small><h3>一榫一卯都讲究</h3><p>命名与函数规则、程序版式、if 与 0 的比较、内存管理（内存泄漏与野指针）、const 与收官点题。</p></div>
      <a class="sqf-link" href="/2026/06/20/software-quality-fables-09-quality-coding/">阅读</a>
    </article>
  </section>
  <h2 class="sqf-section-title">读完这门课应能带走什么</h2>
  <section class="sqf-rhythm-grid">
    <div class="sqf-rhythm"><strong>讲得出</strong><p>能用人话解释质量是什么、缺陷为什么要早发现、评审/度量/标准各自在干嘛。</p></div>
    <div class="sqf-rhythm"><strong>背得准</strong><p>每讲的「背诵版」覆盖该章考点，定义、分类、关键数字都能照课件答题。</p></div>
    <div class="sqf-rhythm"><strong>连得起</strong><p>把质量理念、设计原则、编程规范连成一条线，明白「首重理念，技术次之」。</p></div>
  </section>
</div>
