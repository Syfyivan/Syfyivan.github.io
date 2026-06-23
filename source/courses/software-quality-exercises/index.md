---
title: "软件质量与测试 · 课堂练习题库"
date: 2026-06-23 10:20:00
description: "把《软件质量保证与测试》课堂练习、课后练习和互评题按质量保证理论、软件测试、白盒测试、黑盒测试、集成测试、系统测试和验收测试整理成集中题库，答案默认折叠。"
---

<style>
.sqe-page {
  --sqe-ink: #20242a;
  --sqe-muted: #626c78;
  --sqe-line: rgba(32, 36, 42, 0.13);
  --sqe-panel: #ffffff;
  --sqe-wash: #f6f8f4;
  --sqe-green: #2f6f5e;
  --sqe-blue: #365f91;
  --sqe-rust: #a14f35;
  max-width: 980px;
  margin: 0 auto;
  color: var(--sqe-ink);
}
.sqe-page * { box-sizing: border-box; }
.sqe-page :target { scroll-margin-top: 96px; }
.sqe-hero {
  padding: 30px;
  border: 1px solid var(--sqe-line);
  border-left: 5px solid var(--sqe-green);
  border-radius: 8px;
  background: #fbfcf9;
  box-shadow: 0 10px 26px rgba(32, 36, 42, 0.06);
}
.sqe-kicker {
  display: inline-flex;
  margin-bottom: 14px;
  padding: 5px 9px;
  border-radius: 999px;
  color: var(--sqe-green);
  background: rgba(47, 111, 94, 0.12);
  font-size: 13px;
  font-weight: 700;
}
.sqe-hero h2,
.sqe-section-title,
.sqe-chapter h3,
.sqe-question-title { letter-spacing: 0; }
.sqe-hero h2 { margin: 0 0 14px; font-size: 30px; line-height: 1.25; }
.sqe-hero p,
.sqe-note p,
.sqe-card p,
.sqe-answer p,
.sqe-tip li {
  color: var(--sqe-muted);
  line-height: 1.8;
}
.sqe-hero p,
.sqe-note p,
.sqe-card p,
.sqe-answer p { margin: 0; }
.sqe-actions,
.sqe-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}
.sqe-actions {
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid var(--sqe-line);
}
.sqe-link,
.sqe-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  padding: 8px 13px;
  border: 1px solid rgba(47, 111, 94, 0.3);
  border-radius: 8px;
  color: var(--sqe-green);
  font-weight: 700;
  text-decoration: none !important;
  white-space: nowrap;
}
.sqe-link:hover,
.sqe-chip:hover { color: #ffffff; background: var(--sqe-green); }
.sqe-note {
  margin-top: 18px;
  padding: 16px 18px;
  border-left: 4px solid var(--sqe-rust);
  border-radius: 8px;
  background: var(--sqe-wash);
}
.sqe-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin: 18px 0 0;
}
.sqe-stat {
  padding: 14px;
  border: 1px solid var(--sqe-line);
  border-radius: 8px;
  background: var(--sqe-panel);
}
.sqe-stat strong { display: block; color: var(--sqe-blue); font-size: 24px; line-height: 1.1; }
.sqe-stat span { display: block; margin-top: 5px; color: var(--sqe-muted); font-size: 13px; }
.sqe-section-title { margin: 34px 0 16px; font-size: 22px; }
.sqe-nav {
  flex-wrap: nowrap;
  margin-bottom: 20px;
  padding: 10px;
  border: 1px solid var(--sqe-line);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 10px 28px rgba(32, 36, 42, 0.08);
  overflow-x: auto;
  scrollbar-width: thin;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
.sqe-nav::before {
  content: "目录";
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 6px;
  color: var(--sqe-rust);
  font-weight: 800;
  white-space: nowrap;
}
.sqe-nav .sqe-chip {
  flex: 0 0 auto;
  min-height: 34px;
  padding: 7px 11px;
}
.sqe-side-toc { display: none; }
.sqe-side-toc strong {
  display: block;
  margin-bottom: 8px;
  color: var(--sqe-rust);
  font-size: 13px;
}
.sqe-side-toc a {
  display: block;
  padding: 6px 8px;
  border-radius: 7px;
  color: var(--sqe-blue);
  font-size: 13px;
  font-weight: 700;
  line-height: 1.35;
  text-decoration: none !important;
}
.sqe-side-toc a:hover {
  color: #ffffff;
  background: var(--sqe-blue);
}
.sqe-chip { border-color: rgba(54, 95, 145, 0.28); color: var(--sqe-blue); }
.sqe-chip:hover { background: var(--sqe-blue); }
.sqe-chapter {
  scroll-margin-top: 96px;
  margin-top: 18px;
  padding: 20px;
  border: 1px solid var(--sqe-line);
  border-radius: 8px;
  background: var(--sqe-panel);
}
.sqe-chapter-head {
  display: grid;
  grid-template-columns: 70px minmax(0, 1fr);
  gap: 14px;
  align-items: center;
  margin-bottom: 14px;
}
.sqe-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  border-radius: 8px;
  color: #ffffff;
  background: var(--sqe-blue);
  font-weight: 800;
}
.sqe-chapter h3 { margin: 0 0 4px; font-size: 20px; }
.sqe-chapter small { color: var(--sqe-rust); font-weight: 700; }
.sqe-card {
  margin-top: 12px;
  border: 1px solid var(--sqe-line);
  border-radius: 8px;
  background: #fbfcff;
  overflow: hidden;
}
.sqe-question {
  padding: 15px 16px 14px;
  border-bottom: 1px solid var(--sqe-line);
}
.sqe-question-title {
  margin: 0 0 8px;
  font-weight: 800;
  color: var(--sqe-ink);
}
.sqe-answer details { background: var(--sqe-wash); }
.sqe-answer summary {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  padding: 13px 16px;
  color: var(--sqe-green);
  cursor: pointer;
  font-weight: 800;
}
.sqe-answer summary::after {
  content: "展开";
  flex: 0 0 auto;
  color: var(--sqe-muted);
  font-size: 13px;
  font-weight: 700;
}
.sqe-answer details[open] summary::after { content: "收起"; }
.sqe-answer-body {
  padding: 0 16px 15px;
}
.sqe-answer-body ul { margin: 8px 0 0; padding-left: 1.2em; color: var(--sqe-muted); line-height: 1.8; }
.sqe-tip {
  margin-top: 20px;
  padding: 16px 18px;
  border: 1px solid var(--sqe-line);
  border-radius: 8px;
  background: #fffaf4;
}
.sqe-tip h3 { margin: 0 0 8px; font-size: 18px; letter-spacing: 0; }
.sqe-tip ul { margin: 0; padding-left: 1.2em; }
html[data-user-color-scheme="dark"] .sqe-page {
  --sqe-ink: rgba(245, 247, 250, 0.94);
  --sqe-muted: rgba(225, 231, 237, 0.72);
  --sqe-line: rgba(255, 255, 255, 0.1);
  --sqe-panel: rgba(29, 33, 39, 0.9);
  --sqe-wash: rgba(255, 255, 255, 0.055);
}
html[data-user-color-scheme="dark"] .sqe-hero,
html[data-user-color-scheme="dark"] .sqe-card,
html[data-user-color-scheme="dark"] .sqe-stat,
html[data-user-color-scheme="dark"] .sqe-chapter { background: var(--sqe-panel); }
html[data-user-color-scheme="dark"] .sqe-card { background: rgba(34, 40, 48, 0.88); }
html[data-user-color-scheme="dark"] .sqe-tip { background: rgba(255, 255, 255, 0.045); }
html[data-user-color-scheme="dark"] .sqe-nav,
html[data-user-color-scheme="dark"] .sqe-side-toc { background: rgba(29, 33, 39, 0.94); }
@media (min-width: 761px) and (max-width: 1319px) {
  .sqe-nav {
    position: sticky;
    top: 86px;
    z-index: 20;
  }
  .sqe-page :target,
  .sqe-chapter { scroll-margin-top: 150px; }
}
@media (min-width: 1320px) {
  .sqe-side-toc {
    position: fixed;
    top: 108px;
    right: max(14px, calc((100vw - 1290px) / 2));
    z-index: 18;
    display: block;
    width: 170px;
    max-height: calc(100vh - 130px);
    padding: 12px;
    border: 1px solid var(--sqe-line);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.96);
    box-shadow: 0 10px 28px rgba(32, 36, 42, 0.08);
    overflow-y: auto;
    scrollbar-width: thin;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
}
@media (max-width: 760px) {
  .sqe-page { padding-bottom: 76px; }
  .sqe-hero { padding: 22px; }
  .sqe-hero h2 { font-size: 25px; }
  .sqe-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .sqe-chapter { padding: 16px; }
  .sqe-chapter-head { grid-template-columns: 1fr; }
  .sqe-number { width: 70px; }
  .sqe-page :target,
  .sqe-chapter { scroll-margin-top: 122px; }
  .sqe-nav {
    position: fixed;
    top: auto;
    right: 8px;
    bottom: max(10px, env(safe-area-inset-bottom));
    left: 8px;
    z-index: 80;
    margin: 0;
  }
  .sqe-link { width: 100%; }
  .sqe-nav .sqe-chip { width: auto; }
}
</style>

<div class="sqe-page">
  <section class="sqe-hero">
    <span class="sqe-kicker">Software Quality Exercises / 课堂练习题库</span>
    <h2>把云班课练习范围收成一页，考前直接刷</h2>
    <p>这页把《软件质量保证与测试》从质量保证理论到软件测试实践拆成集中练习：互评简答、判断、选择、填空、简答和设计题都放在一起，答案默认折叠。做题时先不要展开答案，先在纸上写关键词，再核对参考要点。</p>
    <div class="sqe-actions">
      <a class="sqe-link" href="/courses/">返回课程总目录</a>
      <a class="sqe-link" href="/courses/software-quality-fables/">寓言版目录</a>
      <a class="sqe-link" href="/courses/software-quality-xianxia/">修仙版目录</a>
    </div>
    <div class="sqe-stats" aria-label="题库统计">
      <div class="sqe-stat"><strong>18</strong><span>章/组覆盖</span></div>
      <div class="sqe-stat"><strong>97</strong><span>道复习题</span></div>
      <div class="sqe-stat"><strong>5</strong><span>类题型</span></div>
      <div class="sqe-stat"><strong>折叠</strong><span>答案默认隐藏</span></div>
    </div>
  </section>

  <section class="sqe-note">
    <p>来源边界：本页按课堂云班课练习范围、课件章节骨架、博客中已整理的小练习，以及学长 CSDN《<a href="https://blog.csdn.net/m0_56942491/article/details/131734756" target="_blank" rel="noopener">软件测试与质量保证 - 复习与面试题库（from hitwh）</a>》校准覆盖范围。这里是公开复习整理版，题干与解析已按自己的课程页重写，不逐字转载题库。后续如果拿到云班课导出的原题，可以在这个页面按章节继续替换。</p>
  </section>

  <h2 class="sqe-section-title">章节跳转</h2>
  <nav class="sqe-nav" aria-label="章节跳转">
    <a class="sqe-chip" href="#peer">互评题</a>
    <a class="sqe-chip" href="#ch00">00 绪论</a>
    <a class="sqe-chip" href="#ch01">01 质量</a>
    <a class="sqe-chip" href="#ch02">02 软件质量</a>
    <a class="sqe-chip" href="#ch03">03 工程体系</a>
    <a class="sqe-chip" href="#ch04">04 质量度量</a>
    <a class="sqe-chip" href="#ch05">05 质量标准</a>
    <a class="sqe-chip" href="#ch06">06 软件评审</a>
    <a class="sqe-chip" href="#ch07">07 SQA 组织</a>
    <a class="sqe-chip" href="#ch08">08 设计质量</a>
    <a class="sqe-chip" href="#ch09">09 高质量编程</a>
    <a class="sqe-chip" href="#ch10">10 软件测试</a>
    <a class="sqe-chip" href="#ch11">11 白盒测试</a>
    <a class="sqe-chip" href="#ch12">12 黑盒测试</a>
    <a class="sqe-chip" href="#ch13">13 集成测试</a>
    <a class="sqe-chip" href="#ch14">14 系统测试</a>
    <a class="sqe-chip" href="#ch15">15 验收测试</a>
    <a class="sqe-chip" href="#chx">综合题</a>
  </nav>

  <aside class="sqe-side-toc" aria-label="固定目录">
    <strong>章节目录</strong>
    <a href="#peer">互评题</a>
    <a href="#ch00">00 绪论</a>
    <a href="#ch01">01 质量</a>
    <a href="#ch02">02 软件质量</a>
    <a href="#ch03">03 工程体系</a>
    <a href="#ch04">04 质量度量</a>
    <a href="#ch05">05 质量标准</a>
    <a href="#ch06">06 软件评审</a>
    <a href="#ch07">07 SQA 组织</a>
    <a href="#ch08">08 设计质量</a>
    <a href="#ch09">09 高质量编程</a>
    <a href="#ch10">10 软件测试</a>
    <a href="#ch11">11 白盒测试</a>
    <a href="#ch12">12 黑盒测试</a>
    <a href="#ch13">13 集成测试</a>
    <a href="#ch14">14 系统测试</a>
    <a href="#ch15">15 验收测试</a>
    <a href="#chx">综合题</a>
  </aside>

  <section id="peer" class="sqe-chapter">
    <div class="sqe-chapter-head">
      <span class="sqe-number">互</span>
      <div><small>互评题 · 简答题集中背</small><h3>把能直接问答的题完整写出来</h3></div>
    </div>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 互-1（简答）</p><p>简述软件开发人员和质量保证人员的区别。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>开发人员主要负责技术实现，包括需求理解、设计、编码、单元测试、缺陷修复和技术方案落地。质量保证人员主要负责过程和质量保证，包括制定或推动 SQA 计划，监督开发过程是否按既定规范执行，记录、分析和报告质量问题，跟踪偏差直到关闭。</p><p>两者目标都指向高质量软件，但关注点不同：开发人员更多对产品和代码负责，质量保证人员更多对过程符合性、质量活动完整性和管理可见性负责。开发人员通过工程方法、评审和测试提高质量；SQA 则通过计划、监督、审计、度量和跟踪帮助团队稳定地产出高质量结果。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 互-2（简答）</p><p>简述三种 SQA 组织结构及其优缺点。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>第一种是独立 SQA 部门。优点是独立性和客观性强，便于统一规范、共享资源和沉淀经验；缺点是离项目现场较远，过程跟踪容易停留在形式层面，发现的问题可能反馈和解决较慢。</p><p>第二种是项目内独立 SQA 工程师。优点是贴近项目，容易发现具体问题，沟通和推动整改更快；缺点是隶属于项目后独立性较弱，跨项目经验共享不足，SQA 能力建设容易分散。</p><p>第三种是独立 SQA 小组或矩阵式结构。它兼顾前两者：SQA 人员可进入项目工作，同时保留相对独立的专业组织。优点是既能深入项目，又利于规范统一和经验共享；缺点是汇报关系和职责边界需要定义清楚，否则容易出现项目目标与质量目标冲突。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 互-3（简答）</p><p>什么是软件缺陷？</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>从开发和维护过程看，软件缺陷是软件产品中存在的错误、遗漏、不一致、不可用、不安全、性能不达标等问题。从用户和外部行为看，软件缺陷表现为系统没有实现应有功能、实现了不该有的行为，或者违反了需求、设计、标准、合同和用户期望。</p><p>答题可以抓住两层：内部原因是错误或问题，外部表现是失效或违背要求。缺陷不只来自代码，也可能来自需求、设计、文档、配置、数据和运行环境。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 互-4（简答）</p><p>指出走查和审查这两种同行评审方法的不同。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>走查的正式程度较低，通常由作者带领评审人员按照材料或场景逐步说明，重点是发现文档、设计或代码中的问题并收集意见。它适合较早阶段、沟通式发现问题，组织成本较低。</p><p>审查的正式程度更高，角色、流程、检查表、缺陷记录和后续跟踪更严格。审查不只是提出意见，还要求按规则发现、分类、记录和跟踪缺陷，并能反过来改进开发方法和质量过程。因此，审查通常比走查对 SQA 的贡献更稳定、更可度量。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 互-5（简答）</p><p>为什么要进行软件评审？</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>评审的核心价值是尽早发现缺陷。缺陷发现得越晚，修复成本越高；如果需求或设计问题拖到编码、测试甚至上线后才发现，会带来大量返工、维护成本和项目风险。</p><p>从技术上看，前一阶段的错误会传递到后一阶段，并可能不断放大。评审可以在需求、设计、代码、测试计划和用例等工作产品中提前发现不一致、不完整、不可行和不符合规范的问题。</p><p>从效率上看，评审能减少开发人员后期修复时间，缩短测试和调试周期，降低维护压力，让测试人员把精力更多放在用例设计和风险覆盖上。对项目管理者来说，评审还能提高过程可见性，帮助控制进度、成本和质量风险。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 互-6（简答）</p><p>简述基本的测量原则。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>软件度量应先明确测量目标，并建立在合理的理论和业务语境上；每个度量项都要定义清楚，做到一致、客观、无二义性。指标还应具备经验上的可解释性，不能只追求形式上的数字。</p><p>测量方法要尽量简单、可计算、可重复，并能根据具体产品、过程和组织场景进行裁剪。能自动化收集和分析时应优先自动化，减少人为误差和额外负担。</p><p>测量结果要可靠，避免因为采集方式、样本范围或工具问题产生严重偏差。对于内部属性和外部质量特征之间的关系，应使用合适的统计方法解释。最后，测量必须形成反馈机制，用来改进过程和产品，而不是只生成报表。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 互-7（简答）</p><p>什么是质量管理体系？</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>质量管理体系是在质量方面指挥和控制组织的管理体系。它不是单个制度或文档，而是为了实现质量方针和质量目标，把组织结构、职责权限、资源、过程、程序、规范、度量、分析和改进活动组合成一个相互关联的整体。</p><p>对软件组织来说，质量管理体系要覆盖从质量策划、需求管理、设计、开发、评审、测试、配置管理、变更控制到交付和持续改进的过程。它的作用是让质量活动可计划、可执行、可检查、可改进，从而持续满足客户和相关方要求。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 互-8（简答）</p><p>如何辩证看待质量和客户的关系？</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>质量与客户是相互依赖的。质量必须相对于客户需求和使用场景来判断，客户既是质量的接受者，也是质量是否满足要求的重要评价者。脱离客户谈质量，容易变成开发者自认为的“好”。</p><p>同时，客户需求也需要被分析、澄清和工程化。客户可能只能表达业务目标或使用感受，软件团队需要把这些要求转化为明确、可测试、可度量的质量需求。质量既要满足客户明示需求，也要关注隐含需求和相关方要求，如安全、可靠、合规、可维护等。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 互-9（简答）</p><p>简单评价 ISO 模型、McCall 模型和 Boehm 模型三种软件质量模型。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>三种模型目的相近，都是为了把软件质量拆成可理解、可评价、可度量的质量特性、准则或指标体系，帮助组织从抽象的“质量好坏”转向结构化评价。</p><p>McCall 模型强调产品操作、产品修订和产品转移三类质量因素，适合从使用、维护和迁移角度理解软件质量。Boehm 模型采用层次化结构，关注可移植性、可维护性、可用性等质量属性及其细化因素。ISO 模型更标准化，质量特性和子特性的层次关系相对清晰，便于作为通用质量评价框架。</p><p>它们的差异在于术语、层次划分和因素之间是否交叉；共同点是都试图建立“质量特性到评价准则再到度量”的桥梁。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 互-10（简答）</p><p>描述软件质量费用的经典模型。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>软件质量费用可分为控制费用和失效费用。控制费用是为了预防、发现和控制缺陷主动投入的成本，通常包括预防费用和评价费用。失效费用是因为质量问题造成的成本，可分为内部失效费用和外部失效费用。</p><p>预防费用用于建立和改进质量基础设施、过程规范、培训、工具、评审机制等，目标是减少缺陷产生。评价费用用于发现缺陷，如评审、测试、审计和质量度量。内部失效费用是在软件交付给客户之前发现并修复缺陷产生的返工、重测和延期成本。外部失效费用是在交付或上线之后由客户、维护团队或真实环境发现问题所产生的修复、赔偿、信誉损失和支持成本。</p><p>经典结论是：适当增加预防和评价投入，通常可以减少更昂贵的内部和外部失效费用。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 互-11（简答）</p><p>软件测试与调试有什么区别？</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>测试的主要目的是发现软件缺陷，调试的主要目的是定位缺陷原因并修改程序。测试通常从已知需求、测试用例、输入条件和预期结果出发，判断实际行为是否符合预期；调试通常从已观察到的异常出发，分析内部状态、控制流、数据流和实现细节，找出错误根源。</p><p>测试需要计划、设计、执行、记录和回归验证，可以由独立测试人员完成，也可以由开发人员完成。调试更多依赖开发人员对代码和设计的理解，过程具有分析和推理性质。测试能说明问题存在，调试负责解释为什么出错并修复。测试可以较多借助自动化工具，调试则常用断点、日志、调试器和局部实验。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 互-12（简答）</p><p>什么是回归测试？回归测试的目的是什么？</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>回归测试是在软件发生修改之后，重新执行相关测试用例，确认修改达到了预期目的，并且没有破坏原有功能。修改可以来自缺陷修复、新功能、重构、配置变更、环境变化或依赖升级。</p><p>回归测试的目的有两点：第一，验证原缺陷确实被修复或新需求确实实现；第二，确认这次修改没有引入新的缺陷，也没有影响既有正确行为。回归测试通常需要维护稳定的测试用例集，并可结合自动化提高重复执行效率。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 互-13（简答）</p><p>什么是测试用例？</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>测试用例是为了验证某个测试目标而设计的一组测试条件和执行说明。完整测试用例通常包括用例编号、测试目标、前置条件、输入数据、执行步骤、预期结果、实际结果、通过/失败判定和相关备注。</p><p>测试用例是测试执行和结果记录的基本单位。它让测试从“随便试一试”变成可重复、可追踪、可评审的活动。一个好的测试用例应当目标明确、输入清楚、预期可判定，并能覆盖需求、风险或缺陷场景。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 互-14（简答）</p><p>什么是桩模块，什么是驱动模块？</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>桩模块用于模拟被测模块调用的下级模块。它由被测模块调用，通常只实现少量必要逻辑，用来返回约定数据、记录调用情况或模拟异常，从而帮助检查被测模块与下层模块的接口。</p><p>驱动模块用于模拟被测模块的上级模块或主程序。它负责准备输入、调用被测模块、接收输出并记录结果。单元测试时，如果真实上级或下级模块尚未完成，就可以用驱动模块和桩模块搭建局部测试环境。</p><p>简单记法：驱动模块“调被测模块”，桩模块“被被测模块调”。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 互-15（简答）</p><p>简述质量保证人员的主要工作内容。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>质量保证人员要参与制定 SQA 计划，明确项目中需要执行的质量保证活动、标准、角色、检查点和报告机制。还要参与或推动软件过程描述，确保团队知道应该遵循哪些过程和规范。</p><p>在执行过程中，SQA 要评审软件工程活动是否符合已定义过程，审计需求、设计、代码、测试文档等工作产品是否符合标准，记录过程偏差和不符合项，并按规程报告、跟踪直到解决。</p><p>此外，SQA 还可协助配置管理、变更控制、质量度量收集与分析，推动问题复盘和过程改进。核心关键词是计划、监督、评审、审计、记录、报告、跟踪和改进。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 互-16（简答）</p><p>什么是性能测试？性能测试主要包括什么内容？</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>性能测试是通过工具和测试环境模拟正常、峰值或异常负载条件，检查系统在响应时间、吞吐量、并发能力、资源占用、稳定性和容量等方面是否满足要求的测试活动。</p><p>性能测试通常包括客户端性能、网络性能和服务器端性能。客户端性能关注页面或界面响应、资源加载和设备消耗；网络性能关注带宽、延迟、丢包、连接稳定性等；服务器端性能关注 CPU、内存、磁盘、数据库、缓存、线程、连接池和接口吞吐能力。实践中还会细分为负载测试、压力测试、容量测试、稳定性测试和基准测试。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 互-17（简答）</p><p>白盒测试的重点以及相应对策是什么？</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>白盒测试重点之一是模块接口，检查输入、输出、参数传递和返回值是否正确，对策是设计覆盖接口边界、非法参数和调用约定的用例。第二是局部数据结构，检查局部变量、数组、指针、对象状态等是否保持一致，对策是关注初始化、越界、空值和状态变化。</p><p>第三是边界条件，检查循环边界、范围端点、临界值和特殊规模，对策是使用边界值和极端路径用例。第四是独立执行路径，检查计算错误、判定错误和控制流错误，对策是采用语句、判定、条件、路径或基本路径覆盖。第五是内部错误处理，检查异常、错误码、资源释放和恢复逻辑是否有效，对策是主动构造错误输入、异常环境和失败依赖。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 互-18（简答）</p><p>软件测试和软件开发过程具有怎样的关系？</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>软件测试贯穿整个软件开发过程，而不是只发生在编码结束之后。需求阶段要评审需求的正确性、完整性、一致性和可测试性，并开始规划验收测试和系统测试。概要设计阶段要考虑系统结构、接口和集成策略，对应集成测试计划。详细设计和编码阶段要准备单元测试，检查模块内部逻辑和接口。</p><p>编码完成后进入更集中执行的动态测试，包括单元、集成、系统、验收和回归测试。测试结果又会反馈到开发过程，推动缺陷修复、需求澄清、设计改进和过程优化。因此，测试与开发是并行、互相反馈的关系，测试越早参与，越有利于降低缺陷修复成本。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 互-19（简答）</p><p>简述负载测试、容量测试和强度测试的区别。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>负载测试是在预期或逐步增加的工作负荷下观察系统表现，重点看响应时间、吞吐量、资源使用和稳定性是否满足正常业务要求。</p><p>容量测试关注系统能承受的最大规模，例如最大并发用户数、最大数据量、最大事务量或最大连接数，目标是找出容量上限和扩容依据。</p><p>强度测试也常称压力测试，它把系统置于超过正常范围的高负荷、长时间负荷或异常条件下，观察系统何时退化、崩溃以及能否恢复。三者关系是：负载看正常和预期负荷，容量看上限，强度看极限和抗压能力。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 互-20（简答）</p><p>什么是软件测试？</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>软件测试是为了发现软件中的缺陷，按照需求规格、设计说明、程序结构和质量要求，设计测试用例并执行被测对象，比较实际结果与预期结果的过程。</p><p>完整理解应包括四点：测试有明确依据，如需求、设计、标准和用户场景；测试需要预先设计输入、条件和预期输出；测试通过执行或检查来发现问题；测试结果要被记录、分析并用于缺陷修复和质量评价。测试不能证明软件绝对无缺陷，只能在已覆盖范围内提高对质量的信心。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 互-21（简答）</p><p>单元测试、集成测试、系统测试的侧重点是什么？</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>单元测试关注最小可测单元，重点检查模块、函数、类或组件内部逻辑是否正确，包括算法、分支、边界、局部数据结构和错误处理。它通常由开发人员完成，常用驱动模块和桩模块辅助。</p><p>集成测试关注多个单元组合后的协作，重点检查模块接口、参数传递、调用顺序、共享数据、全局状态、错误传播和组合后的功能是否正确。它解决的是“单独正确，组合未必正确”的问题。</p><p>系统测试关注完整系统在真实或接近真实环境下是否满足系统规格说明，既检查功能，也检查性能、安全、兼容、恢复、配置、易用性等质量属性。它的对象是完整软件系统及其运行环境。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 互-22（设计）</p><p>函数 <code>f(x, y)</code> 中，<code>x ∈ [100, 200]</code>，<code>y ∈ [5, 15]</code>。用一般边界值分析法设计 9 个测试用例。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>一般边界值分析对 n 个变量通常取 <code>4n + 1</code> 个用例。这里有两个变量，所以是 9 个。先取正常值，例如 <code>x = 150</code>、<code>y = 10</code>。然后每次只让一个变量取边界或边界内侧值，另一个变量保持正常值。</p><p>一组可写答案是：<code>(100, 10)</code>、<code>(101, 10)</code>、<code>(199, 10)</code>、<code>(200, 10)</code>、<code>(150, 5)</code>、<code>(150, 6)</code>、<code>(150, 14)</code>、<code>(150, 15)</code>、<code>(150, 10)</code>。如果老师只要求符号表达，也可写成 <code>(minX, Y)</code>、<code>(minX+1, Y)</code>、<code>(maxX-1, Y)</code>、<code>(maxX, Y)</code>、<code>(X, minY)</code>、<code>(X, minY+1)</code>、<code>(X, maxY-1)</code>、<code>(X, maxY)</code>、<code>(X, Y)</code>。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 互-23（简答）</p><p>简述测试驱动程序以及如何构建测试驱动程序。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>测试驱动程序是用于运行测试用例、调用被测对象并收集测试结果的辅助程序。它可以模拟被测模块的上层调用者，为被测模块准备输入、设置环境、触发执行、获取输出并判断实际结果是否符合预期。</p><p>构建测试驱动程序时，应保持结构清晰、逻辑简单、职责单一，避免把复杂业务逻辑写进驱动程序本身。它需要能够加载或构造测试数据，批量执行用例，记录通过/失败结果，并在被测接口变化时容易维护。较好的做法是复用已有驱动框架或测试框架，把数据准备、调用执行、断言判断和结果报告分开。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 互-24（简答）</p><p>简单对比白盒测试与黑盒测试。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>白盒测试了解程序内部结构，依据控制流、数据流、分支、条件和路径设计用例，适合发现内部逻辑错误、边界处理错误、数据结构问题和异常处理问题。它常用于单元测试和部分集成测试，对测试人员的代码理解要求较高。</p><p>黑盒测试不关注内部实现，把软件看成只有输入和输出的黑箱，依据需求规格、业务规则、用户场景和接口行为设计用例。常用方法包括等价类划分、边界值分析、因果图、判定表、场景法和错误推测。它适合功能测试、系统测试、验收测试和用户视角的质量验证。</p><p>两者不是互相替代，而是互补：白盒看内部是否走对，黑盒看外部行为是否满足要求。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 互-25（简答）</p><p>测试驱动程序在复用和维护上应注意什么？</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>测试驱动程序要尽量通用、简单和可维护。它不应依赖太多临时代码或人工操作，应把公共的启动、数据装载、调用、断言、日志和报告逻辑抽出来复用。这样新增测试对象或测试用例时，只需要补充少量配置、数据或断言，而不必重写整个驱动。</p><p>同时，驱动程序要能适应被测类或接口说明的合理变化。接口变化时，应优先更新集中封装的调用层，避免在大量用例里重复修改。驱动程序也要保证自身可靠，不能因为驱动代码错误导致误判被测软件。答题关键词：简单、清晰、可复用、易维护、适应接口变化、自动记录结果。</p></div></details></div>
    </article>
  </section>

  <section id="ch00" class="sqe-chapter">
    <div class="sqe-chapter-head">
      <span class="sqe-number">00</span>
      <div><small>绪论 · 为什么学软件质量保证与测试</small><h3>先知道为什么要守质量</h3></div>
    </div>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 00-1（判断）</p><p>软件产品越大型、越复杂，重大软件事故就越少。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>错。课件强调软件产品大型化、复杂化，重大软件事故越来越多。复杂度上升后，失控、配置错误、更新错误和联动故障的风险都会上升。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 00-2（选择）</p><p>关于测试人员与开发人员比例，正确的是（ ）。A. 国内普遍 1:1；B. 美国普遍 1:8；C. 微软达到 2:1；D. 国内 1:4 以上企业超过 80%。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>C。国内普遍约 1:8，1:4 以上不足 30%；美国软件企业基本 1:1；微软达到 2:1。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 00-3（填空）</p><p>本课程总学时为 ______ 学时，其中软件质量保证理论 ______ 学时，软件测试实验 ______ 学时。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>32；24；8。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 00-4（简答）</p><p>简述 AI 时代软件质量保证与测试人员可以扮演哪些角色。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>围绕“守门”和“验证”作答：数据质量的守门员、模型行为的侦探、信息质量的审核员、检索系统的架构师、工程质量的监督员、质量属性的捍卫者。落点要回到可靠性、正确性、性能、安全性、可维护性和可测试性。</p></div></details></div>
    </article>
  </section>

  <section id="ch01" class="sqe-chapter">
    <div class="sqe-chapter-head">
      <span class="sqe-number">01</span>
      <div><small>第一章 · 质量</small><h3>质量不是“看起来高级”，而是满足要求</h3></div>
    </div>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 01-1（填空）</p><p>ISO 9000 对质量的定义可以概括为：质量是一组 ______ 特性满足 ______ 的程度。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>固有；要求。答题时还要能补一句：质量相对客户而存在。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 01-2（判断）</p><p>只要软件功能多、界面漂亮，就可以认为软件质量高。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>错。功能多、界面漂亮只是部分特性；如果不满足客户明示或隐含要求，仍不能算高质量。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 01-3（选择）</p><p>“产品满足使用目的之程度”更接近哪一种质量观点？A. 制造者观点；B. 产品观点；C. 用户观点；D. 价值观点。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>C。关键词是“使用目的”，强调用户使用场景和客户需求。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 01-4（设计）</p><p>学校要开发在线考试系统，请从质量角度列出至少 5 个要求。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>可答：身份认证准确、防作弊与安全性、提交可靠不丢卷、并发性能、易用性、可维护性、可追溯审计、异常恢复、数据备份、兼容不同设备。关键是把“质量”落到客户及相关方要求。</p></div></details></div>
    </article>
  </section>

  <section id="ch02" class="sqe-chapter">
    <div class="sqe-chapter-head">
      <span class="sqe-number">02</span>
      <div><small>第二章 · 软件质量</small><h3>软件无形，缺陷常从需求和设计开始</h3></div>
    </div>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 02-1（判断）</p><p>软件的客户需求一开始就是清楚的，所以软件缺陷主要来自编码。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>错。课件强调软件客户需求具有不确定性，规格说明书/需求问题是最大缺陷来源，编码只是一部分。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 02-2（填空）</p><p>软件缺陷构成中，规格说明书（需求）约占 ______%，设计约占 ______%，代码约占 ______%。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>54；25；15。其余约 5% 来自其他因素。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 02-3（选择）</p><p>极限编程（XP）的格言是（ ）。A. 计划、执行、检查、处理；B. 沟通、简化、反馈、勇气；C. 定义、测量、分析、改进；D. 正确性、完整性、一致性、可行性。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>B。XP 适合小团队、需求快速变化、高风险且强调可测试性的场景。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 02-4（简答）</p><p>简述 V 模型左右两侧的对应关系。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>左侧是需求分析、系统设计、详细/功能设计、编码；右侧对应验收测试、系统测试、集成/功能测试、单元测试。左侧偏静态测试，右侧偏动态测试。测试计划应在开发早期同步制定。</p></div></details></div>
    </article>
  </section>

  <section id="ch03" class="sqe-chapter">
    <div class="sqe-chapter-head">
      <span class="sqe-number">03</span>
      <div><small>第三章 · 软件质量工程体系</small><h3>质量靠体系，不靠一次性救火</h3></div>
    </div>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 03-1（判断）</p><p>质量控制和质量保证是同一个概念。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>错。质量控制偏“设标准、测结果、判定、补救、防再发”；质量保证是有计划有组织的活动，目标是提供满足质量要求的信任。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 03-2（选择）</p><p>由 11 个指标构成，并分为产品操作、产品修订、产品转移三类的软件质量模型是（ ）。A. Boehm；B. McCall；C. ISO 9126；D. CMMI。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>B。11 个指标 + 三分类 + 1977/GE 是 McCall 模型的标志。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 03-3（填空）</p><p>质量成本 = ______ 成本 + 损失成本；其中保证成本 = 预防成本 + ______ 成本。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>保证；评价。损失成本又可分为内部损失和外部损失。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 03-4（简答）</p><p>简述六西格玛 DMAIC 五步。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>界定、测量、分析、改进、控制。答题可写：先确定改进目标与流程，再用数据衡量现状，找少数关键因素，提出并实施改进方案，最后监控新流程以维持改进结果。</p></div></details></div>
    </article>
  </section>

  <section id="ch04" class="sqe-chapter">
    <div class="sqe-chapter-head">
      <span class="sqe-number">04</span>
      <div><small>第四章 · 软件质量度量</small><h3>先分清“准”和“稳”，再谈指标</h3></div>
    </div>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 04-1（判断）</p><p>用同一方法多次测量得到的值很一致，说明该测量有效性高。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>错。这说明可靠性高，也就是稳定；有效性强调测量是否真正测到了想测的东西，也就是准确。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 04-2（选择）</p><p>下列属于“有绝对零值”的度量尺度是（ ）。A. 名义尺度；B. 顺序尺度；C. 间隔尺度；D. 比值尺度。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>D。比值尺度与间隔尺度相似，但它有绝对零值。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 04-3（填空）</p><p>McCabe 圈复杂度公式 V(G) = ______，通常建议圈复杂度不超过 ______。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>E - N + 2；10。它也可理解为保证质量至少需要覆盖的基本路径数。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 04-4（计算/判断）</p><p>某控制流图有 9 条边、7 个结点，计算圈复杂度并判断是否需要重点关注。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>V(G) = 9 - 7 + 2 = 4。4 不超过 10，复杂度在建议范围内，但仍至少需要覆盖 4 条基本路径。</p></div></details></div>
    </article>
  </section>

  <section id="ch05" class="sqe-chapter">
    <div class="sqe-chapter-head">
      <span class="sqe-number">05</span>
      <div><small>第五章 · 软件质量标准</small><h3>标准、模型和成熟度要分层背</h3></div>
    </div>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 05-1（填空）</p><p>软件质量标准从宽到窄分五个层次：国际标准、______、行业标准、______、项目规范。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>国家标准；企业规范。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 05-2（判断）</p><p>ISO 9000-3 与 CMM 设计思路相同，属于同一个体系。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>错。二者都以全面质量管理为理论基础，但 ISO 9000-3 是软件组织的实施指南，CMM 是描述软件过程能力的模型，设计思路不同。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 05-3（填空）</p><p>CMMI 五级成熟度依次为初始级、______、______、______、优化级。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>可重复级；已定义级；已管理级。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 05-4（简答）</p><p>为什么软件需要 ISO 9000-3 这样的软件组织实施指南？</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>ISO 9001 面向所有工程行业，但软件不存在明显的生产阶段，开发、供应和维护过程不同于大多数工业产品；软件不会耗损，设计阶段质量活动对最终产品质量尤其重要。因此需要 ISO 9000-3 帮助软件组织解释和实施 ISO 标准。</p></div></details></div>
    </article>
  </section>

  <section id="ch06" class="sqe-chapter">
    <div class="sqe-chapter-head">
      <span class="sqe-number">06</span>
      <div><small>第六章 · 软件评审</small><h3>缺陷越晚发现，纠正成本越高</h3></div>
    </div>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 06-1（判断）</p><p>缺陷在需求阶段发现和在发布后发现，纠正成本基本相同。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>错。课件强调缺陷发现得越晚纠正费用越高：需求阶段约 1 倍，发布后实际使用阶段可达 40 到 1000 倍。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 06-2（选择）</p><p>五种评审方法中，最正式、最严格、最有效的是（ ）。A. 临时评审；B. 轮查；C. 走查；D. 审查。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>D。审查（Inspection）是最正式、最严格、最有效的评审方法。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 06-3（填空）</p><p>评审的四种结果是接受、______、不能接受、评审未完成。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>有条件接受。意思是没有大缺陷，修订部分小缺陷后可以通过。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 06-4（设计）</p><p>团队要交付支付核心模块，请设计其评审方案。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>支付核心风险高，应采用最正式的审查或小组评审；评审对象覆盖需求、设计、代码、测试计划/用例；准备缺陷检查表与规则集；按准备、召开、记录和分类缺陷、给出结果、跟踪修订的流程执行；对有条件接受或不能接受要复查并分析有效性与成本。</p></div></details></div>
    </article>
  </section>

  <section id="ch07" class="sqe-chapter">
    <div class="sqe-chapter-head">
      <span class="sqe-number">07</span>
      <div><small>第七章 · SQA 组织活动</small><h3>SQA 监督流程，测试针对产品</h3></div>
    </div>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 07-1（判断）</p><p>SQA 就是测试组的别名，二者工作对象相同。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>错。SQA 对流程进行监督和控制，测试人员针对产品本身进行测试，二者对象不同。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 07-2（选择）</p><p>软件测试部门理想的开发人员与测试人员比例是（ ）。A. 8:1；B. 4:1；C. 1:2；D. 1:8。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>C。课件中软件测试部门理想的开发人员与测试人员比例为 1:2。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 07-3（填空）</p><p>常见两种软件质量认证缩写是 ______ 和 ______，分别对应注册软件质量分析师和注册软件质量工程师。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>CSQA；CSQE。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 07-4（简答）</p><p>简述评审（Review）与审核（Audit）的区别。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>评审是过程进行时对过程的检查，通常通过评审会进行，确保执行工程活动时计划规定的过程得到遵循；审核是工作产品生成时对工作产品的检查，通过审查工作产品确保开发过程中计划规定的过程得到遵循。</p></div></details></div>
    </article>
  </section>

  <section id="ch08" class="sqe-chapter">
    <div class="sqe-chapter-head">
      <span class="sqe-number">08</span>
      <div><small>第八章 · 提高软件设计质量</small><h3>低耦合、高内聚是设计题第一反应</h3></div>
    </div>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 08-1（判断）</p><p>模块之间耦合越紧密，系统越容易维护。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>错。耦合越紧，改一处越容易影响其他模块。提高设计质量应降低耦合、提高内聚。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 08-2（选择）</p><p>下列耦合中最松、独立性最强的是（ ）。A. 内容耦合；B. 公共环境耦合；C. 控制耦合；D. 非直接耦合。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>D。非直接耦合表示模块间没有直接关系，独立性最强；内容耦合最坏。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 08-3（填空）</p><p>软件设计分为两个阶段：______ 设计（软件体系结构设计）和 ______ 设计。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>高层次；详细。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 08-4（简答）</p><p>简述设计模式的四个基本要素。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>模式名称、问题、解决方案、效果。名称描述模式的问题和解法；问题说明何时使用；解决方案说明组成部分、职责和协作；效果说明应用结果和权衡。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 08-5（设计）</p><p>一个系统“改一处动全身”，请给出三条改进设计方向。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>可答：把内容耦合降为数据耦合或接口协作；拆分职责，提高功能内聚；定义清晰接口，面向接口编程；用 UML 先描述体系结构；补充数据字典，避免数据含义混乱。</p></div></details></div>
    </article>
  </section>

  <section id="ch09" class="sqe-chapter">
    <div class="sqe-chapter-head">
      <span class="sqe-number">09</span>
      <div><small>第九章 · 高质量编程</small><h3>风格、表达式、内存管理都能直接出题</h3></div>
    </div>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 09-1（判断）</p><p><code>if (flag == TRUE)</code> 是判断布尔变量 flag 为真的标准写法。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>错。布尔变量标准写法是 <code>if (flag)</code> 或 <code>if (!flag)</code>，不应与 TRUE/FALSE 或 1/0 比较。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 09-2（选择）</p><p>判断浮点变量 <code>x</code> 是否为 0，较合适的写法是（ ）。A. <code>x == 0</code>；B. <code>x != 0</code>；C. <code>x &gt; -EPSINON &amp;&amp; x &lt; EPSINON</code>；D. <code>x = 0</code>。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>C。浮点数有精度误差，应在允许误差范围内判断。课件拼写使用 EPSINON，复习时按课件记。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 09-3（填空）</p><p>动态内存用 <code>malloc</code>/<code>new</code> 申请，必须用 ______/______ 释放，且申请与释放次数必须 ______，否则会造成 ______。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p><code>free</code>；<code>delete</code>；相同；内存泄漏。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 09-4（简答）</p><p>什么是野指针？常见成因和对策是什么？</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>野指针是指向垃圾内存的指针，通常不是 NULL，不能靠普通 if 判断发现。成因包括指针未初始化、释放后未置 NULL、返回栈内存地址等。对策包括申请后检查、定义时初始化、申请释放配对、释放后立即置 NULL、不返回局部变量地址。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 09-5（设计/改错）</p><p>函数参数用值传递大对象，局部变量未初始化，<code>free(p)</code> 后直接返回 <code>p</code>。请指出问题并给出修改方向。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>大对象值传递应改为 <code>const A &amp;a</code>；局部变量应就近初始化；释放内存后应把指针置为 NULL，不能返回已释放内存指针。答题要落到函数规则、初始化、内存管理和野指针防范。</p></div></details></div>
    </article>
  </section>

  <section id="ch10" class="sqe-chapter">
    <div class="sqe-chapter-head">
      <span class="sqe-number">10</span>
      <div><small>第十章 · 软件测试</small><h3>测试不是证明没错，而是尽量发现问题</h3></div>
    </div>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 10-1（填空）</p><p>软件测试的直接目标不是证明程序完全正确，而是在有限时间和资源下尽可能多地 ______。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>发现软件缺陷或错误。答题时可补充：测试通过只能增加信心，不能证明软件不存在缺陷。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 10-2（判断）</p><p>软件测试只在编码完成之后开始，前期需求和设计阶段不需要考虑测试。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>错。测试活动应贯穿软件开发过程：需求阶段可规划验收/系统测试，设计阶段可规划集成/单元测试，编码后再执行对应动态测试。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 10-3（选择）</p><p>静态测试与动态测试最核心的区别是（ ）。A. 是否写测试报告；B. 是否执行被测程序；C. 是否由开发人员完成；D. 是否只能用于系统测试。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>B。静态测试不运行程序，常见形式包括评审、走查、审查、静态分析；动态测试需要运行程序并观察输出或行为。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 10-4（简答）</p><p>简述一次完整测试工作的基本步骤。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>可按“计划 → 设计用例 → 准备数据和环境 → 执行测试 → 记录缺陷 → 修复跟踪 → 回归测试 → 汇总报告”作答。重点是测试要有预期结果和可追踪记录。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 10-5（选择）</p><p>软件测试过程的输入通常应包括（ ）。A. 需求规格说明；B. 设计文档；C. 程序或构件；D. 以上都可能。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>D。测试不是只看代码，需求、设计、接口、数据、环境和历史缺陷都能影响测试设计。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 10-6（简答）</p><p>区分软件测试与调试。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>测试的目的偏发现缺陷，通常由测试人员按用例执行；调试的目的偏定位和修正缺陷，通常由开发人员结合程序内部逻辑完成。测试以预期结果为依据，调试以原因分析和修改验证为中心。</p></div></details></div>
    </article>
  </section>

  <section id="ch11" class="sqe-chapter">
    <div class="sqe-chapter-head">
      <span class="sqe-number">11</span>
      <div><small>第十一章 · 白盒测试</small><h3>看清内部逻辑，再谈覆盖</h3></div>
    </div>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 11-1（填空）</p><p>白盒测试把程序看成透明结构，常见覆盖准则包括语句覆盖、______ 覆盖、条件覆盖、条件/判定覆盖和路径覆盖。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>判定（或分支）。白盒测试依据程序内部结构设计用例，覆盖强度通常从语句、判定、条件逐步提高到路径。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 11-2（判断）</p><p>达到 100% 语句覆盖，就一定达到 100% 判定覆盖。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>错。语句覆盖只要求每条语句至少执行一次，不保证每个判定的真、假分支都走到。反过来，判定覆盖通常会覆盖相关语句，但仍不能保证所有条件组合都被测到。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 11-3（选择）</p><p>下列最符合白盒测试特征的是（ ）。A. 只根据用户界面设计用例；B. 只关心输入输出关系；C. 根据控制流、数据流和内部逻辑设计用例；D. 只能由最终用户执行。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>C。白盒测试要理解程序内部结构，常用于单元测试和部分集成测试。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 11-4（简答）</p><p>为什么路径覆盖强度高，但不能机械地要求所有路径都被覆盖？</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>路径覆盖要求覆盖程序中可能执行的路径，理论上更充分；但含循环和多重分支的程序路径数会快速膨胀，甚至不可穷尽。实践中通常结合基本路径、圈复杂度和风险优先级选择关键路径。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 11-5（填空）</p><p>数据流测试关注变量从 ______ 到 ______ 的使用链，常用来发现未初始化、定义后未用、使用后又错误修改等问题。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>定义；使用。记关键词：定义-使用对（DU pair）、变量生命周期、数据依赖。</p></div></details></div>
    </article>
  </section>

  <section id="ch12" class="sqe-chapter">
    <div class="sqe-chapter-head">
      <span class="sqe-number">12</span>
      <div><small>第十二章 · 黑盒测试</small><h3>不看内部代码，从规格和行为切用例</h3></div>
    </div>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 12-1（选择）</p><p>下列属于黑盒测试用例设计方法的是（ ）。A. 等价类划分；B. 边界值分析；C. 因果图/判定表；D. 以上都是。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>D。黑盒测试常用等价类、边界值、因果图、判定表、场景法、错误推测等方法。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 12-2（判断）</p><p>黑盒测试主要依据程序内部控制流和代码路径设计测试用例。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>错。黑盒测试把程序看成黑箱，重点依据需求规格、输入输出、业务规则和用户场景设计用例。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 12-3（填空）</p><p>黑盒测试中，先把输入或输出划分成若干有效/无效集合的方法叫 ______；特别关注范围端点附近错误的方法叫 ______。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>等价类划分；边界值分析。常见策略是先分等价类，再在边界附近补关键用例。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 12-4（设计）</p><p>某系统要求年龄输入为 16 到 40 的整数。请划分等价类，并给出每类一个代表值。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>有效等价类：16 到 40 的整数，可取 25。无效等价类至少包括小于 16（如 15）、大于 40（如 41）、非整数（如 20.5）、非数字或空输入。若题目只考范围，可重点写小于 16 和大于 40。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 12-5（设计）</p><p>函数输入 x 的有效范围是 -60 到 60。如果只用三个代表值覆盖“过小、有效、过大”三类，可选哪些值？</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>可选 -200、20、200。-200 代表小于下界的无效类，20 代表有效类，200 代表大于上界的无效类。若做边界值分析，还应补 -61、-60、-59、59、60、61 等。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 12-6（简答）</p><p>什么时候适合使用场景法？它与等价类、边界值是否冲突？</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>场景法适合业务流程清楚、用户路径明显的功能，例如下单、登录、考试提交。它不与等价类和边界值冲突，实际设计时可以先写主成功场景和异常场景，再在每个步骤的输入上套等价类和边界值。</p></div></details></div>
    </article>
  </section>

  <section id="ch13" class="sqe-chapter">
    <div class="sqe-chapter-head">
      <span class="sqe-number">13</span>
      <div><small>第十三章 · 集成测试</small><h3>模块单独能跑，不代表拼起来没问题</h3></div>
    </div>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 13-1（填空）</p><p>集成测试通常在 ______ 测试之后、系统测试之前进行，也常被称为组装测试或联合测试。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>单元。它的重点不是单个模块内部，而是模块之间的接口、协作和数据传递。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 13-2（选择）</p><p>集成测试最容易暴露哪类问题？A. 模块接口不匹配；B. 需求文档排版错误；C. 用户验收流程未签字；D. 代码注释太少。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A。典型问题包括参数传递错误、接口数据丢失、调用顺序不当、共享数据破坏、模块组合后错误累积等。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 13-3（简答）</p><p>列出集成测试需要重点检查的 4 类内容。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>可答：模块接口是否正确；参数和返回值是否按约定传递；全局数据或共享状态是否被错误修改；一个模块的行为是否对其他模块产生副作用；父子模块功能是否衔接；错误处理和异常传播是否正确。</p></div></details></div>
    </article>
  </section>

  <section id="ch14" class="sqe-chapter">
    <div class="sqe-chapter-head">
      <span class="sqe-number">14</span>
      <div><small>第十四章 · 系统测试</small><h3>把软件放回完整环境里检验</h3></div>
    </div>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 14-1（填空）</p><p>系统测试把已经集成的软件与硬件、外设、支撑软件、数据和人员等组合起来，在接近真实的 ______ 中进行检验。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>运行环境。系统测试关注完整系统是否满足系统规格说明，而不只看单个模块。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 14-2（选择）</p><p>下列通常属于系统测试关注范围的是（ ）。A. 功能测试；B. 性能/压力测试；C. 安全和恢复测试；D. 以上都可能。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>D。系统测试既包括功能是否满足，也包括性能、安全、恢复、兼容、配置、容量等非功能质量属性。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 14-3（简答）</p><p>区分负载测试、压力测试和容量测试。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>负载测试看系统在预期工作负荷下的表现；压力测试把系统推到高负荷甚至异常负荷，观察瓶颈和崩溃边界；容量测试关注系统能支持的最大用户数、数据量、事务量等极限指标。</p></div></details></div>
    </article>
  </section>

  <section id="ch15" class="sqe-chapter">
    <div class="sqe-chapter-head">
      <span class="sqe-number">15</span>
      <div><small>第十五章 · 验收测试</small><h3>最终看用户是否认可交付</h3></div>
    </div>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 15-1（填空）</p><p>验收测试通常在功能测试和系统测试之后、正式交付或上线之前进行，是交付前的最后一类 ______ 测试。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>确认或技术。它依据合同、需求规格说明、用户业务目标和验收标准判断能否交付。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 15-2（判断）</p><p>验收测试的核心参与方通常包括最终用户或客户代表，而不仅仅是开发团队。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>对。验收测试要确认系统是否满足用户业务需要，因此用户、客户代表或业务方的认可很关键。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 15-3（选择）</p><p>下列哪项不应作为“验收通过”的理由？A. 满足合同约定功能；B. 满足关键业务流程；C. 已知严重缺陷均关闭或被正式接受；D. 系统额外增加了需求外功能，所以可以忽略核心缺陷。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>D。验收依据是合同、需求和验收标准。额外功能不能抵消核心需求未满足或严重缺陷未处理的问题。</p></div></details></div>
    </article>
  </section>

  <section id="chx" class="sqe-chapter">
    <div class="sqe-chapter-head">
      <span class="sqe-number">综</span>
      <div><small>测试相关综合题</small><h3>把不同测试层级和方法串起来</h3></div>
    </div>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 综-1（填空）</p><p>单元测试通常由 ______ 主导，在编码阶段或编码后尽早完成；SQA 或测试人员可以提供规范、工具和过程支持。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>开发人员。单元测试关注最小可测单元，常需要桩模块和驱动模块配合。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 综-2（填空）</p><p>安全测试可从应用层和 ______ 层两个层面考虑；性能测试的目标是验证性能指标、发现瓶颈并支撑容量规划。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>系统。答题时可结合认证、授权、输入校验、数据保护、系统配置、网络与运行环境等方面展开。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 综-3（选择）</p><p>由真实或接近真实的外部用户在实际环境中试用，反馈缺陷和体验问题，最接近（ ）。A. β 测试；B. 语句覆盖；C. 桩模块测试；D. 代码走查。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A。β 测试通常在开发组织外部或真实用户环境中进行；α 测试则更常在开发方受控环境下由内部人员或邀请用户完成。</p></div></details></div>
    </article>
    <article class="sqe-card">
      <div class="sqe-question"><p class="sqe-question-title">题 综-4（判断）</p><p>自动化测试总能缩短项目进度；压力测试一般不需要工具支持，人工点击即可完成。</p></div>
      <div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>两句都错。自动化测试需要脚本、数据、环境和维护成本，短期内可能增加投入；压力测试通常需要工具模拟大量并发、负载和长时间运行，人工操作难以稳定复现。</p></div></details></div>
    </article>
  </section>

  <section class="sqe-tip">
    <h3>刷题顺序</h3>
    <ul>
      <li>第一遍只做判断、选择、填空，先把数字、定义、分类背稳。</li>
      <li>第二遍做简答题，每题用 3 到 5 个关键词组织答案，不追求长篇。</li>
      <li>第三遍做设计题，固定写法是“判断风险/对象 → 选方法或指标 → 写流程 → 写跟踪和改进”。</li>
      <li>如果云班课原题后续能导出，就把这一页对应章节的同类题逐条替换，页面结构不用再改。</li>
    </ul>
  </section>
</div>
