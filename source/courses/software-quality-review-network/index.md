---
title: "软件质量与测试期末一页通关复习网络"
date: 2026-06-23 11:40:00
description: "《软件质量保证与测试》期末复习总页：覆盖 PPT 0-9、测试基本理论、互评简答题、课堂练习题、课后作业题、往年 A/C 卷、2024/2025 考试回忆和设计大题模板。"
---

<style>

.sqr-page {
  --sqr-ink: #20242a;
  --sqr-text: #303843;
  --sqr-muted: #65717e;
  --sqr-line: rgba(32, 36, 42, 0.13);
  --sqr-panel: #ffffff;
  --sqr-wash: #f6f8f4;
  --sqr-green: #2f6f5e;
  --sqr-blue: #365f91;
  --sqr-rust: #a14f35;
  --sqr-gold: #8a6f2e;
  max-width: 1120px;
  margin: 0 auto;
  color: var(--sqr-text);
}
.sqr-page * { box-sizing: border-box; min-width: 0; }
.sqr-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(280px, 0.85fr);
  gap: 24px;
  align-items: stretch;
  padding: 30px;
  border: 1px solid var(--sqr-line);
  border-left: 5px solid var(--sqr-green);
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(47, 111, 94, 0.08), rgba(54, 95, 145, 0.08)), var(--sqr-panel);
  box-shadow: 0 12px 30px rgba(32, 36, 42, 0.07);
}
.sqr-kicker,
.sqr-badge,
.sqr-chip {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  min-height: 30px;
  padding: 5px 9px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 780;
}
.sqr-kicker { margin-bottom: 14px; color: var(--sqr-green); background: rgba(47, 111, 94, 0.12); }
.sqr-hero h2,
.sqr-section-title,
.sqr-card h3,
.sqr-mini h4,
.sqr-chapter-card h3 { letter-spacing: 0; }
.sqr-hero h2 { margin: 0 0 14px; color: var(--sqr-ink); font-size: 30px; line-height: 1.24; }
.sqr-page p,
.sqr-page li,
.sqr-page td,
.sqr-page th { line-height: 1.78; }
.sqr-page p { margin: 0; color: var(--sqr-muted); }
.sqr-actions,
.sqr-nav,
.sqr-tags { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
.sqr-actions { margin-top: 18px; padding-top: 18px; border-top: 1px solid var(--sqr-line); }
.sqr-link,
.sqr-chip {
  justify-content: center;
  min-height: 38px;
  padding: 8px 13px;
  border: 1px solid rgba(47, 111, 94, 0.3);
  border-radius: 8px;
  color: var(--sqr-green);
  font-weight: 780;
  text-decoration: none !important;
  white-space: nowrap;
}
.sqr-link:hover,
.sqr-link:focus,
.sqr-chip:hover,
.sqr-chip:focus { color: #ffffff; background: var(--sqr-green); }
.sqr-score { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.sqr-score div { min-height: 96px; padding: 14px; border: 1px solid var(--sqr-line); border-radius: 8px; background: rgba(255, 255, 255, 0.78); }
.sqr-score strong { display: block; color: var(--sqr-blue); font-size: 23px; line-height: 1.1; }
.sqr-score span { display: block; margin-top: 7px; color: var(--sqr-muted); font-size: 13px; line-height: 1.55; }
.sqr-note { margin-top: 18px; padding: 16px 18px; border-left: 4px solid var(--sqr-rust); border-radius: 8px; background: var(--sqr-wash); }
.sqr-note strong,
.sqr-card strong,
.sqr-mini strong,
.sqr-chapter-card strong { color: var(--sqr-ink); }
.sqr-section-title { margin: 38px 0 16px; color: var(--sqr-ink); font-size: 24px; }
.sqr-nav { margin: 18px 0 4px; }
.sqr-chip { border-color: rgba(54, 95, 145, 0.28); color: var(--sqr-blue); }
.sqr-chip:hover,
.sqr-chip:focus { background: var(--sqr-blue); }
.sqr-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.sqr-grid.three { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.sqr-card,
.sqr-mini,
.sqr-chapter-card { border: 1px solid var(--sqr-line); border-radius: 8px; background: var(--sqr-panel); box-shadow: 0 10px 24px rgba(32, 36, 42, 0.055); }
.sqr-card { padding: 18px; }
.sqr-card h3 { margin: 10px 0 8px; color: var(--sqr-ink); font-size: 19px; }
.sqr-badge { color: var(--sqr-blue); background: rgba(54, 95, 145, 0.1); }
.sqr-badge.hot { color: var(--sqr-rust); background: rgba(161, 79, 53, 0.11); }
.sqr-badge.core { color: var(--sqr-green); background: rgba(47, 111, 94, 0.11); }
.sqr-badge.apply { color: var(--sqr-gold); background: rgba(138, 111, 46, 0.13); }
.sqr-table-wrap { overflow-x: auto; border: 1px solid var(--sqr-line); border-radius: 8px; background: var(--sqr-panel); }
.sqr-table { width: 100%; min-width: 820px; border-collapse: collapse; }
.sqr-table th,
.sqr-table td { padding: 12px 13px; border-bottom: 1px solid var(--sqr-line); text-align: left; vertical-align: top; }
.sqr-table th { color: var(--sqr-ink); background: #f3f6f8; font-weight: 780; }
.sqr-table tr:last-child td { border-bottom: 0; }
.sqr-mini { padding: 15px; }
.sqr-mini h4 { margin: 0 0 7px; color: var(--sqr-ink); font-size: 16px; }
.sqr-list { margin: 0; padding-left: 1.2em; color: var(--sqr-muted); }
.sqr-list li + li { margin-top: 5px; }
.sqr-chapter-list { display: grid; gap: 12px; }
.sqr-chapter-card { display: grid; grid-template-columns: 64px minmax(0, 1fr); gap: 14px; padding: 17px; }
.sqr-chapter-num { display: inline-flex; align-items: center; justify-content: center; height: 48px; border-radius: 8px; color: #fff; background: var(--sqr-blue); font-weight: 850; }
.sqr-chapter-card h3 { margin: 0 0 8px; color: var(--sqr-ink); font-size: 19px; }
.sqr-chapter-card p + p { margin-top: 7px; }
.sqr-print { padding: 18px; border: 1px solid var(--sqr-line); border-radius: 8px; background: #fffaf4; }
.sqr-print h3 { margin: 0 0 10px; color: var(--sqr-ink); letter-spacing: 0; }
.sqr-bank { margin-top: 18px; max-width: 1120px; }
.sqr-bank .sqe-section-title { margin-top: 30px; }
html[data-user-color-scheme="dark"] .sqr-page {
  --sqr-ink: rgba(245, 247, 250, 0.94);
  --sqr-text: rgba(235, 240, 245, 0.88);
  --sqr-muted: rgba(219, 226, 233, 0.72);
  --sqr-line: rgba(255, 255, 255, 0.11);
  --sqr-panel: rgba(30, 35, 42, 0.9);
  --sqr-wash: rgba(255, 255, 255, 0.055);
}
html[data-user-color-scheme="dark"] .sqr-hero,
html[data-user-color-scheme="dark"] .sqr-card,
html[data-user-color-scheme="dark"] .sqr-mini,
html[data-user-color-scheme="dark"] .sqr-chapter-card,
html[data-user-color-scheme="dark"] .sqr-table-wrap { background: var(--sqr-panel); }
html[data-user-color-scheme="dark"] .sqr-table th { background: rgba(255, 255, 255, 0.06); }
html[data-user-color-scheme="dark"] .sqr-print { background: rgba(255, 255, 255, 0.045); }
@media (max-width: 980px) {
  .sqr-hero,
  .sqr-grid,
  .sqr-grid.three { grid-template-columns: 1fr; }
}
@media (max-width: 680px) {
  .sqr-hero { padding: 22px; }
  .sqr-hero h2 { font-size: 25px; }
  .sqr-score { grid-template-columns: 1fr; }
  .sqr-chapter-card { grid-template-columns: 1fr; }
  .sqr-chapter-num { width: 64px; }
  .sqr-link,
  .sqr-chip { width: 100%; }
}

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
.sqe-nav { margin-bottom: 20px; }
.sqe-chip { border-color: rgba(54, 95, 145, 0.28); color: var(--sqe-blue); }
.sqe-chip:hover { background: var(--sqe-blue); }
.sqe-chapter {
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
@media (max-width: 760px) {
  .sqe-hero { padding: 22px; }
  .sqe-hero h2 { font-size: 25px; }
  .sqe-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .sqe-chapter { padding: 16px; }
  .sqe-chapter-head { grid-template-columns: 1fr; }
  .sqe-number { width: 70px; }
  .sqe-link,
  .sqe-chip { width: 100%; }
}
</style>

<div class="sqr-page">
  <section class="sqr-hero">
    <div>
      <span class="sqr-kicker">Software Quality Final Review / 一页通关版</span>
      <h2>这页改成主复习资料：知识点、题库、往年题、大题都在这里</h2>
      <p>之前那版更像“导航”，确实不够用。现在这版按考试来组织：先给完整知识体系，再给往年题雷达，再放互评简答评分点、课堂/课后题库，最后单独训练高分值设计大题。目标是考前只盯这个页面，也能知道该背什么、刷什么、怎么写大题。</p>
      <div class="sqr-actions">
        <a class="sqr-link" href="#knowledge">知识体系</a>
        <a class="sqr-link" href="#past-papers">往年题</a>
        <a class="sqr-link" href="#must-short">简答评分点</a>
        <a class="sqr-link" href="#design-drill">大题设计题</a>
        <a class="sqr-link" href="#question-bank">全部题库</a>
      </div>
    </div>
    <div class="sqr-score" aria-label="复习覆盖统计">
      <div><strong>0-15</strong><span>PPT 0-9 + 测试基本理论 10-15，覆盖期末知识体系。</span></div>
      <div><strong>25</strong><span>互评/简答题按评分点整理，优先背 24/25 已出现方向。</span></div>
      <div><strong>97</strong><span>互评题、课堂练习和课后作业题已并入本页，答案默认折叠。</span></div>
      <div><strong>4 套</strong><span>A 卷、C 卷、2024 回忆、2025 回忆的大题方向集中复盘。</span></div>
    </div>
  </section>

  <section class="sqr-note">
    <p><strong>资料边界：</strong>已核对本地 PPT 0-9、复习讲义、A 卷、C 卷扫描图、2024 考试回忆 docx、2025 考试回忆图片、公开 CSDN 题库结构。云班课活动链接在当前环境会跳到登录页，不能直接读取老师私有参考答案；所以本页把公开可核验的互评题和本地复习资料中的答案要点先做成评分点版，后续拿到老师原答案时只需要逐条校准措辞。</p>
  </section>

  <nav class="sqr-nav" aria-label="页内导航">
    <a class="sqr-chip" href="#how-to-use">怎么用</a>
    <a class="sqr-chip" href="#source-map">资料清单</a>
    <a class="sqr-chip" href="#past-papers">往年题</a>
    <a class="sqr-chip" href="#knowledge">知识体系</a>
    <a class="sqr-chip" href="#must-short">简答题</a>
    <a class="sqr-chip" href="#design-drill">大题</a>
    <a class="sqr-chip" href="#question-bank">全部题库</a>
    <a class="sqr-chip" href="#last-day">最后一天</a>
  </nav>

  <h2 id="how-to-use" class="sqr-section-title">一、怎么用这一个页面复习</h2>
  <div class="sqr-grid three">
    <article class="sqr-card"><span class="sqr-badge core">第一遍</span><h3>先过知识体系</h3><p>从 00 到 15 章按“一句话、必背、易错”过一遍。不会的先不展开题库，先把概念位置记住。</p></article>
    <article class="sqr-card"><span class="sqr-badge hot">第二遍</span><h3>背简答评分点</h3><p>互评题、24/25 回忆简答优先。每题按“定义 + 分类/原因 + 作用/结论”写，保证能拿步骤分。</p></article>
    <article class="sqr-card"><span class="sqr-badge hot">第三遍</span><h3>练设计大题</h3><p>大题分值最高，不能只背概念。按等价类、边界值、控制流图、复杂度、基本路径、状态图六个模板刷。</p></article>
  </div>

  <h2 id="source-map" class="sqr-section-title">二、资料清单：哪些该看，哪些排除</h2>
  <div class="sqr-table-wrap">
    <table class="sqr-table">
      <thead><tr><th>资料</th><th>已经核对到的内容</th><th>本页怎么吸收</th><th>注意</th></tr></thead>
      <tbody>
        <tr><td>PPT 理论 0-9</td><td>绪论、质量、软件质量、质量工程体系、度量、标准、评审、SQA、设计质量、高质量编程。</td><td>作为知识体系 00-09 章主线。</td><td>PPT 是定义和术语的第一优先级。</td></tr>
        <tr><td>复习讲义/CSDN 题库</td><td>互评题、1-15 章课后习题、测试基本理论、白盒、黑盒、集成、系统、验收。</td><td>重写成“全部题库”区域，答案折叠。</td><td>公开题库只做复习整理，不逐字搬运长文。</td></tr>
        <tr><td>A 卷</td><td>判断 15、选择 20、填空 10、简答 9、设计 46。设计题含状态图、控制流图、环路复杂度、独立路径、语句/路径覆盖。</td><td>用于“往年题”和“大题模板”。</td><td>老卷题面不必死背，步骤必须会。</td></tr>
        <tr><td>C 卷</td><td>判断 10、选择 20、填空 10、简答 10、设计 50。设计题含字符串边界值、C 程序覆盖、高铁售票状态转换。</td><td>用于强化边界值、流程图、状态转换。</td><td>C 卷是扫描 PDF，已用页图人工核对题型。</td></tr>
        <tr><td>2024 考试回忆</td><td>客观题来自云班课；简答含评审、客户与质量、质量费用、测试原则、发布后 bug；大题含命名格式等价类和中缀转后缀基本路径。</td><td>用于当前风格判断和大题训练。</td><td>选择可能单选/多选不标明，刷题时要按不定项准备。</td></tr>
        <tr><td>2025 考试回忆</td><td>判断 5、选择 15、填空 8、简答 24、大题 48。除大题外基本是云班课原题；大题是图书编号等价类和排序代码基本路径。</td><td>作为最高优先级样本。</td><td>大题占比高，必须单独训练。</td></tr>
        <tr><td>Excel 和大作业查重资料</td><td>Excel 是辽宁招生投档表或损坏文件；大作业/查重资料不属于期末闭卷理论题源。</td><td>排除。</td><td>不混进复习范围，避免浪费时间。</td></tr>
      </tbody>
    </table>
  </div>

  <h2 id="past-papers" class="sqr-section-title">三、往年题雷达：题型、分值、该练什么</h2>
  <div class="sqr-table-wrap">
    <table class="sqr-table">
      <thead><tr><th>样本</th><th>客观题</th><th>简答题</th><th>设计题/大题</th><th>复习结论</th></tr></thead>
      <tbody>
        <tr><td>A 卷</td><td>判断 15 分，选择 20 分，填空 10 分。覆盖 SQA、质量预测、缺陷、测试目的、覆盖强弱等。</td><td>耦合/内聚排序；基本测量原则；ISO、McCall、Boehm 质量模型评价。</td><td>工厂查询系统状态图、控制流图、环路复杂度、独立路径；简单 C 程序流程图、语句覆盖、路径覆盖。</td><td>白盒与状态图是大题核心，简答偏 PPT 原话。</td></tr>
        <tr><td>C 卷</td><td>判断 10 分，选择 20 分，填空 10 分。覆盖产品质量、SQA、测试预言、白盒、压力测试等。</td><td>单元测试是否必要；小程序穷举测试是否可能；V/W/H 模型怎么选。</td><td>字符串转整数的 16 位长度边界值；C 程序语句/路径覆盖；高铁售票状态转换图、复杂度、基本路径。</td><td>设计题 50 分，状态迁移和边界值都要会。</td></tr>
        <tr><td>2024 回忆</td><td>选择、填空、判断基本来自云班课原题；选择可能不标单选/多选。</td><td>为什么需要评审；客户与质量关系；经典质量费用模型；软件测试原则；发布后 bug 处理。</td><td>文件命名格式等价类；中缀转后缀代码的控制流图、环路复杂度、基本路径、测试用例。</td><td>互评题是简答主池；大题要靠步骤，不靠背原题。</td></tr>
        <tr><td>2025 回忆</td><td>判断 5 分，选择 15 分，填空 8 分，除大题外基本为云班课原题。</td><td>质量管理体系；单元/集成/系统测试侧重点；SQA 工作内容；基本测量原则；软件测试定义。</td><td>8 位图书编号有效/无效等价类；链表冒泡排序代码的控制流图、三种复杂度算法、基本路径、测试用例。</td><td>最接近当前风格：客观题刷题库，简答背互评，大题练设计。</td></tr>
      </tbody>
    </table>
  </div>

  <h2 id="knowledge" class="sqr-section-title">四、完整知识体系：0-15 章一张网</h2>
  <section class="sqr-chapter-list" aria-label="完整知识体系">
    <article class="sqr-chapter-card" id="know-00">
      <div class="sqr-chapter-num">00</div>
      <div>
        <h3>00 绪论：这门课考什么、哪些算期末范围</h3>
        <p><strong>一句话：</strong>PPT 0 明确课程分成软件质量保证理论和软件测试基本理论。期末题型包括判断、选择、填空、简答、设计；软件测试实践里的接口、性能、Web、App 专项实验不作为期末主范围。</p>
        <p><strong>必背：</strong>题型、平时分构成、云班课题源、互评题有标准答案、软件测试基本理论包含在期末。</p>
        <p><strong>易错：</strong>不要把大作业查重资料、招生 Excel、专项实验材料当成期末理论题源。</p>
      </div>
    </article>
    <article class="sqr-chapter-card" id="know-01">
      <div class="sqr-chapter-num">01</div>
      <div>
        <h3>01 质量：先回答“什么叫好”</h3>
        <p><strong>一句话：</strong>质量是一组固有特性满足要求的程度。要求包括明示需求、暗示需求、客户与相关方要求。质量具有客户属性、成本属性、社会属性、可测性、可预见性。</p>
        <p><strong>必背：</strong>质量定义；客户与质量关系；质量观点：制造者、产品、用户、价值；质量概念发展：符合性质量、适用性质量、广义质量。</p>
        <p><strong>易错：</strong>看到“产品最终完成前无法预测质量”通常判错；看到“客户期望和质量无关”也错。</p>
      </div>
    </article>
    <article class="sqr-chapter-card" id="know-02">
      <div class="sqr-chapter-num">02</div>
      <div>
        <h3>02 软件质量：软件为什么比硬件更难保证质量</h3>
        <p><strong>一句话：</strong>软件无形、难度量、不会像硬件那样磨损，但会因需求变化、设计错误、编码错误、配置和环境问题产生缺陷。软件质量不只看产品，还看过程和运行服务。</p>
        <p><strong>必背：</strong>软件特点；软件过程；软件缺陷内部/外部定义；缺陷来源；软件质量三方面；ISO/McCall/Boehm 模型。</p>
        <p><strong>易错：</strong>不要把“缺陷”只理解成代码 bug，需求、设计、文档、配置和数据都可能有缺陷。</p>
      </div>
    </article>
    <article class="sqr-chapter-card" id="know-03">
      <div class="sqr-chapter-num">03</div>
      <div>
        <h3>03 软件质量工程体系：组织层面怎样把质量管起来</h3>
        <p><strong>一句话：</strong>质量工程体系把质量方针、质量目标、过程、职责、资源、计划、控制、保证、改进、成本、标准和度量放进一个系统。</p>
        <p><strong>必背：</strong>质量管理体系；质量方针；质量计划；质量控制 QC；质量保证 QA；质量改进；质量成本模型。</p>
        <p><strong>易错：</strong>QA 面向过程并提供信任，QC 面向产品合格性检查，Testing 是发现缺陷的技术活动，三者不要混。</p>
      </div>
    </article>
    <article class="sqr-chapter-card" id="know-04">
      <div class="sqr-chapter-num">04</div>
      <div>
        <h3>04 软件质量度量：怎么把质量变成能比较的数</h3>
        <p><strong>一句话：</strong>测量是赋值，度量是对软件产品/过程/项目属性进行测度，指标是度量或度量组合的解释形式。质量度量研究项目、产品、过程三类对象。</p>
        <p><strong>必背：</strong>有效性、可靠性；尺度；规模度量、复杂度度量、缺陷度量、进度/风险/工作量度量；基本测量原则；McCabe 环路复杂度。</p>
        <p><strong>易错：</strong>复杂度可以用于估计可测试性、可靠性、可维护性。大题里 V(G)=E-N+2P、区域数、判定节点数+1 要互相校验。</p>
      </div>
    </article>
    <article class="sqr-chapter-card" id="know-05">
      <div class="sqr-chapter-num">05</div>
      <div>
        <h3>05 软件质量标准：有哪些外部规矩和成熟度框架</h3>
        <p><strong>一句话：</strong>标准可以是国际、国家、行业、企业标准。软件质量标准用于规定过程和产品要求，也用于能力评估和持续改进。</p>
        <p><strong>必背：</strong>ISO 9001-3；ISO/IEC 15504；IEEE 软件工程标准；CMM/CMMI；成熟度 1-5 级：初始、已管理、已定义、量化管理、优化。</p>
        <p><strong>易错：</strong>CMM/CMMI 更偏过程能力成熟度，不是直接给某个程序判分的测试方法。</p>
      </div>
    </article>
    <article class="sqr-chapter-card" id="know-06">
      <div class="sqr-chapter-num">06</div>
      <div>
        <h3>06 软件评审：为什么越早看越省钱</h3>
        <p><strong>一句话：</strong>评审通过人工和结构化检查在需求、设计、代码、测试计划、测试用例等阶段尽早发现问题，减少后期返工。</p>
        <p><strong>必背：</strong>为什么评审：成本、技术、效率；管理评审、技术评审、文档评审、过程评审；需求/设计/代码/质量验证评审；走查与审查区别；评审会议。</p>
        <p><strong>易错：</strong>走查比审查不正式；审查记录、角色、检查表和跟踪更严格。简答题不要只写“发现错误”，要写成本和过程改进。</p>
      </div>
    </article>
    <article class="sqr-chapter-card" id="know-07">
      <div class="sqr-chapter-num">07</div>
      <div>
        <h3>07 SQA 组织活动：谁来监督过程真的被执行</h3>
        <p><strong>一句话：</strong>SQA 不是测试小组的同义词，而是围绕过程符合性和质量保证活动进行计划、监督、评审、审核、记录、报告和跟踪。</p>
        <p><strong>必背：</strong>独立 SQA 部门；项目内独立 SQA 工程师；独立 SQA 小组/矩阵；SQA 经理与工程师职责；SQA 计划；评审/审核；偏差跟踪。</p>
        <p><strong>易错：</strong>三种组织结构优缺点是互评高频题；SQA 的独立性和贴近项目之间存在取舍。</p>
      </div>
    </article>
    <article class="sqr-chapter-card" id="know-08">
      <div class="sqr-chapter-num">08</div>
      <div>
        <h3>08 提高软件设计质量：先把结构设计得不容易坏</h3>
        <p><strong>一句话：</strong>软件设计把需求转化为软件表示，分体系结构设计和详细设计。高质量设计追求简单、一致、低耦合、高内聚、可维护、可测试。</p>
        <p><strong>必背：</strong>设计目标；评价标准；源系统/分析模型/目标系统三类标准；开闭原则、抽象、接口编程；体系结构：C/S、B/S、多层；耦合/内聚排序；设计模式；数据库设计质量。</p>
        <p><strong>易错：</strong>耦合题注意方向：从强到弱常见为内容、公共、控制、标记、数据；内聚从强到弱常见为功能、顺序、通信、过程、时间、逻辑、偶然。</p>
      </div>
    </article>
    <article class="sqr-chapter-card" id="know-09">
      <div class="sqr-chapter-num">09</div>
      <div>
        <h3>09 高质量编程：代码层面怎样少出错</h3>
        <p><strong>一句话：</strong>高质量编程通过命名、版式、注释、函数、表达式、基本语句、内存、文件结构和语言规则降低错误率。</p>
        <p><strong>必背：</strong>命名规则；头文件引用；函数参数；const；变量初始化；布尔/整型/浮点/指针与零比较；new/delete、malloc/free；内存泄漏、野指针；Java/C++规则。</p>
        <p><strong>易错：</strong>如果参数是指针且只输入，应在类型前加 const；释放后继续返回或使用指针是典型野指针错误。</p>
      </div>
    </article>
    <article class="sqr-chapter-card" id="know-10">
      <div class="sqr-chapter-num">10</div>
      <div>
        <h3>10 软件测试：测试是为了发现错误，不是证明没错</h3>
        <p><strong>一句话：</strong>软件测试是为了发现错误而执行程序的过程。测试应贯穿开发全过程，所有测试追溯到用户需求，尽早并不断测试，注意缺陷群集和回归测试。</p>
        <p><strong>必背：</strong>测试目标；测试原则；测试过程；静态/动态测试；测试计划；测试用例；测试与调试区别；回归测试；测试组织与文档。</p>
        <p><strong>易错：</strong>“测试能证明程序完全正确”“测试只在编码后开始”“测试等于调试”都是典型错法。</p>
      </div>
    </article>
    <article class="sqr-chapter-card" id="know-11">
      <div class="sqr-chapter-num">11</div>
      <div>
        <h3>11 白盒测试：看内部结构来设计用例</h3>
        <p><strong>一句话：</strong>白盒测试也叫结构测试或逻辑驱动测试，依据程序内部逻辑、控制流、数据流设计用例，常用于单元测试和部分集成测试。</p>
        <p><strong>必背：</strong>语句覆盖、判定覆盖、条件覆盖、判定/条件覆盖、条件组合覆盖、路径覆盖；控制流图；环路复杂度；基本路径；数据流测试；变异测试。</p>
        <p><strong>易错：</strong>100% 语句覆盖不等于 100% 判定覆盖；100% 覆盖也不能保证没有隐藏缺陷。</p>
      </div>
    </article>
    <article class="sqr-chapter-card" id="know-12">
      <div class="sqr-chapter-num">12</div>
      <div>
        <h3>12 黑盒测试：不看代码，按规格和行为切用例</h3>
        <p><strong>一句话：</strong>黑盒测试也叫功能测试，从规格说明、输入输出、业务规则、用户场景出发设计用例。</p>
        <p><strong>必背：</strong>等价类划分；边界值分析；因果图；判定表；场景法；状态迁移；错误推测；正交试验。</p>
        <p><strong>易错：</strong>等价类先分有效/无效，边界值要取刚好和刚越界；无效等价类最好一类一个用例。</p>
      </div>
    </article>
    <article class="sqr-chapter-card" id="know-13">
      <div class="sqr-chapter-num">13</div>
      <div>
        <h3>13 集成测试：模块能跑不代表拼起来能跑</h3>
        <p><strong>一句话：</strong>集成测试在单元测试之后，把模块按设计组合，重点检查接口、调用顺序、参数传递、全局数据和模块协作。</p>
        <p><strong>必背：</strong>非增量式；增量式；自顶向下、自底向上、混合/三明治；桩模块；驱动模块；集成测试用例设计。</p>
        <p><strong>易错：</strong>桩模块被测模块调用，驱动模块调用被测模块。不要把二者写反。</p>
      </div>
    </article>
    <article class="sqr-chapter-card" id="know-14">
      <div class="sqr-chapter-num">14</div>
      <div>
        <h3>14 系统测试：把完整系统放回真实环境检验</h3>
        <p><strong>一句话：</strong>系统测试在集成后，对完整系统及其硬件、数据、环境、人员和外部接口进行测试，确认满足系统规格。</p>
        <p><strong>必背：</strong>功能、性能、压力、负载、容量、安全、恢复、兼容、安装、配置、文档测试；系统测试流程和原则。</p>
        <p><strong>易错：</strong>负载看预期负荷，压力看极端负荷，容量看最大用户数/数据量/事务量。</p>
      </div>
    </article>
    <article class="sqr-chapter-card" id="know-15">
      <div class="sqr-chapter-num">15</div>
      <div>
        <h3>15 验收测试：最终看用户是否接受交付</h3>
        <p><strong>一句话：</strong>验收测试是交付前确认软件是否满足合同、需求、用户业务目标和验收标准的测试，用户或客户代表参与很关键。</p>
        <p><strong>必背：</strong>验收测试定义、步骤、完成标准、验收报告、用户验收测试、Alpha/Beta 测试。</p>
        <p><strong>易错：</strong>额外功能不能抵消核心需求不满足；验收依据是合同、需求和验收标准。</p>
      </div>
    </article>
  </section>

  <h2 id="must-short" class="sqr-section-title">五、简答题优先级：先背这些评分点</h2>
  <section class="sqr-note"><p><strong>卷面格式：</strong>简答题不要写成一句话。建议每题写 3 到 6 个点，每点独立成句。能写“定义、分类、作用、区别、结论”的题，一定按这个顺序写。</p></section>
  <div class="sqr-grid">
    <article class="sqr-card"><span class="sqr-badge hot">一级必背</span><h3>24/25 已点名或互评高频</h3><ul class="sqr-list"><li>为什么需要软件评审：成本、技术、效率。</li><li>客户与质量关系：相互依赖、客户接受、质量相对客户存在并由客户判定。</li><li>经典质量费用模型：预防、评价、内部失效、外部失效。</li><li>质量管理体系：质量方针、目标、职责、资源、产品实现、测量分析改进。</li><li>SQA 人员工作：计划、过程描述、评审、审计、记录偏差、报告、跟踪、度量。</li><li>基本测量原则：目标、定义一致客观、简单可算、剪裁、自动化、统计关系、可靠、反馈。</li><li>软件测试定义：为了发现错误而执行程序，依据规格和结构设计用例。</li><li>单元/集成/系统测试侧重点。</li></ul></article>
    <article class="sqr-card"><span class="sqr-badge apply">二级必背</span><h3>老卷与题库反复出现</h3><ul class="sqr-list"><li>SQA 三种组织结构及优缺点。</li><li>软件缺陷内部/外部定义。</li><li>走查与审查区别。</li><li>ISO/McCall/Boehm 三种质量模型评价。</li><li>软件测试与调试区别。</li><li>回归测试目的。</li><li>测试用例定义。</li><li>桩模块与驱动模块。</li><li>白盒与黑盒测试区别。</li><li>负载、容量、强度/压力测试区别。</li></ul></article>
  </div>

  <h2 id="design-drill" class="sqr-section-title">六、大题设计题：高分值必须单独练</h2>
  <section class="sqr-note"><p><strong>大题拿分原则：</strong>题面会换，但评分动作基本不变：列规则、分等价类、取边界值、画控制流图/状态图、算复杂度、列基本路径、写测试用例。卷面上一定要有表格和编号。</p></section>
  <div class="sqr-grid">
    <article class="sqr-card"><span class="sqr-badge hot">等价类</span><h3>2025 图书编号题怎么拆</h3><p>8 位编号可拆成三段：1-2 位楼层、3-5 位书架、6-8 位图书。有效类：楼层 01-11、书架 001-120、图书 001-300，且全为数字、长度为 8。无效类至少按字段拆：长度错误、非数字、楼层 00/12 及以上、书架 000/121 及以上、图书 000/301 及以上。</p><ul class="sqr-list" style="margin-top:10px"><li>有效例：01001001、11120300。</li><li>无效例：00001001、12001001、01121001、01000301、01A01001、0100100。</li><li>卷面表：编号、输入、覆盖等价类、预期结果。</li></ul></article>
    <article class="sqr-card"><span class="sqr-badge hot">等价类</span><h3>2024 文件命名题怎么拆</h3><p>命名格式可按“班级号 + 学号”拆。第一位 1-6，后三位表示 001-300 的学号，且总长度固定为 4、全部为数字。有效类是班级合法且学号合法；无效类按长度、班级、学号、字符类型分别写。</p><ul class="sqr-list" style="margin-top:10px"><li>有效例：1001、6300。</li><li>无效例：0100、7100、1000、1301、1A01、101、10001。</li><li>不要把 1-099、100-199、200-299 当作主要等价类，那更像把有效类又切细，漏掉了无效类。</li></ul></article>
    <article class="sqr-card"><span class="sqr-badge apply">边界值</span><h3>一般边界值 4n+1</h3><p>函数 f(x,y)，x 属于 [100,200]，y 属于 [5,15]。一般边界值分析让一个变量取边界，其他变量取正常值。取 X=150，Y=10，则 9 个用例为：</p><ul class="sqr-list" style="margin-top:10px"><li>(100,10)、(101,10)、(199,10)、(200,10)</li><li>(150,5)、(150,6)、(150,14)、(150,15)</li><li>(150,10)</li></ul></article>
    <article class="sqr-card"><span class="sqr-badge apply">白盒</span><h3>控制流图/复杂度/基本路径</h3><p>答题顺序固定：给语句编号 -> 画控制流图 -> 算 V(G) -> 列独立路径 -> 为每条路径写输入和预期输出。复杂度三算法要对上：V(G)=E-N+2P，区域数，判定节点数+1。</p><ul class="sqr-list" style="margin-top:10px"><li>如果代码有 2 个普通 if，通常 V(G)=3。</li><li>如果题目要求把复合条件拆成短路判断，判定节点会增加，要按图重新算。</li><li>路径表必须写节点序列，不要只写“真/假”。</li></ul></article>
    <article class="sqr-card"><span class="sqr-badge apply">状态图</span><h3>售票/查询系统状态迁移题</h3><p>先圈状态，再圈事件。状态可以是等待、待付款、查证、警告、超时、出票、退票；事件可以是到站、付款、取消、超时、退票、查证成功/失败。图上边要标事件或条件。</p><ul class="sqr-list" style="margin-top:10px"><li>状态表：S1 等待、S2 待付款、S3 查证、S4 警告、S5 超时、S6 出票、S7 退票。</li><li>测试路径：从初始等待出发，覆盖成功出票、取消、超时、退票成功、退票失败等迁移。</li><li>题目要“状态图”时不要画成普通流程图。</li></ul></article>
    <article class="sqr-card"><span class="sqr-badge hot">卷面模板</span><h3>四张表保底拿步骤分</h3><ul class="sqr-list"><li>规则拆分表：字段、合法范围、非法情况。</li><li>等价类/边界表：编号、有效/无效、代表值。</li><li>路径表：路径编号、节点序列、覆盖分支。</li><li>测试用例表：输入、覆盖对象、预期输出。</li></ul></article>
  </div>

  <h2 id="question-bank" class="sqr-section-title">七、全部题库：互评题、课后题、课堂练习都放这里</h2>
  <section class="sqr-note"><p><strong>使用方式：</strong>下面是完整刷题区，答案默认折叠。先在纸上写，再展开核对。互评题按简答题准备；判断、选择、填空用来补客观题；设计题用来练卷面步骤。</p></section>
</div>

<div class="sqe-page sqr-bank">
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

<div class="sqr-page">
  <h2 id="last-day" class="sqr-section-title">八、最后一天冲刺清单</h2>
  <div class="sqr-grid">
    <article class="sqr-print"><h3>2 小时背诵</h3><ul class="sqr-list"><li>质量、软件质量、缺陷、测试、测试用例、回归测试。</li><li>为什么评审、质量费用模型、质量管理体系、测量原则。</li><li>SQA 工作内容和三种组织结构。</li><li>白盒/黑盒、单元/集成/系统/验收、桩/驱动。</li></ul></article>
    <article class="sqr-print"><h3>2 小时大题</h3><ul class="sqr-list"><li>做 1 道编号/命名格式等价类题。</li><li>做 1 道 x/y 边界值题。</li><li>做 1 道 if/while 控制流图题。</li><li>做 1 道状态迁移题。</li></ul></article>
  </div>
  <section class="sqr-note"><p><strong>公开来源：</strong><a href="https://blog.csdn.net/m0_56942491/article/details/131734756" target="_blank" rel="noopener">CSDN 题库整理</a>；<a href="https://www.mosoteach.cn/web/cc-detail/4851E258-439C-11F1-BAE9-A088C2A30E68/act/" target="_blank" rel="noopener">蓝墨云班课活动页</a>。本页还使用本地 PPT、复习讲义、往年 A/C 卷和 2024/2025 考试回忆来校准范围。云班课私有活动页当前未登录不可读，不能把未核验的老师参考答案伪造成已核验内容。</p></section>
</div>
