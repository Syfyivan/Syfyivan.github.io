---
title: "软件质量与测试期末复习网络"
date: 2026-06-23 08:40:00
description: "根据课程 PPT、复习讲义、往年题、CSDN 题库与互评题线索整理的《软件质量保证与测试》零基础期末复习网络：知识体系、题型雷达、简答背诵池和大题解题模板。"
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
  max-width: 1040px;
  margin: 0 auto;
  color: var(--sqr-text);
}
.sqr-page * { box-sizing: border-box; min-width: 0; }
.sqr-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(250px, 0.75fr);
  gap: 24px;
  align-items: end;
  padding: 30px;
  border: 1px solid var(--sqr-line);
  border-left: 5px solid var(--sqr-green);
  border-radius: 6px;
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
.sqr-kicker {
  margin-bottom: 14px;
  color: var(--sqr-green);
  background: rgba(47, 111, 94, 0.12);
}
.sqr-hero h2,
.sqr-section-title,
.sqr-card h3,
.sqr-mini h4,
.sqr-answer h4 {
  letter-spacing: 0;
}
.sqr-hero h2 {
  margin: 0 0 14px;
  color: var(--sqr-ink);
  font-size: 27px;
  line-height: 1.24;
}
.sqr-hero p,
.sqr-note p,
.sqr-card p,
.sqr-mini p,
.sqr-answer p,
.sqr-route li,
.sqr-list li,
.sqr-table td,
.sqr-table th {
  line-height: 1.8;
}
.sqr-hero p,
.sqr-note p,
.sqr-card p,
.sqr-mini p,
.sqr-answer p { margin: 0; }
.sqr-hero p,
.sqr-card p,
.sqr-mini p,
.sqr-answer p,
.sqr-route li,
.sqr-list li,
.sqr-table td {
  color: var(--sqr-muted);
}
.sqr-actions,
.sqr-nav,
.sqr-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}
.sqr-actions {
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid var(--sqr-line);
}
.sqr-link,
.sqr-chip {
  justify-content: center;
  min-height: 38px;
  padding: 8px 13px;
  border: 1px solid rgba(47, 111, 94, 0.3);
  border-radius: 6px;
  color: var(--sqr-green);
  font-weight: 780;
  text-decoration: none !important;
  white-space: nowrap;
}
.sqr-link:hover,
.sqr-link:focus,
.sqr-chip:hover,
.sqr-chip:focus {
  color: #ffffff;
  background: var(--sqr-green);
}
.sqr-score {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
.sqr-score div {
  min-height: 94px;
  padding: 14px;
  border: 1px solid var(--sqr-line);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.78);
}
.sqr-score strong {
  display: block;
  color: var(--sqr-blue);
  font-size: 23px;
  line-height: 1.1;
}
.sqr-score span {
  display: block;
  margin-top: 7px;
  color: var(--sqr-muted);
  font-size: 13px;
  line-height: 1.55;
}
.sqr-note {
  margin-top: 18px;
  padding: 16px 18px;
  border-left: 4px solid var(--sqr-rust);
  border-radius: 6px;
  background: var(--sqr-wash);
}
.sqr-note strong,
.sqr-card strong,
.sqr-mini strong,
.sqr-answer strong {
  color: var(--sqr-ink);
}
.sqr-section-title {
  margin: 34px 0 16px;
  color: var(--sqr-ink);
  font-size: 23px;
}
.sqr-nav {
  margin: 18px 0 4px;
}
.sqr-chip {
  border-color: rgba(54, 95, 145, 0.28);
  color: var(--sqr-blue);
}
.sqr-chip:hover,
.sqr-chip:focus { background: var(--sqr-blue); }
.sqr-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
.sqr-grid.three {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.sqr-card,
.sqr-mini,
.sqr-answer {
  border: 1px solid var(--sqr-line);
  border-radius: 6px;
  background: var(--sqr-panel);
  box-shadow: 0 10px 24px rgba(32, 36, 42, 0.055);
}
.sqr-card {
  padding: 18px;
}
.sqr-card h3 {
  margin: 10px 0 8px;
  color: var(--sqr-ink);
  font-size: 19px;
}
.sqr-badge {
  color: var(--sqr-blue);
  background: rgba(54, 95, 145, 0.1);
}
.sqr-badge.hot {
  color: var(--sqr-rust);
  background: rgba(161, 79, 53, 0.11);
}
.sqr-badge.core {
  color: var(--sqr-green);
  background: rgba(47, 111, 94, 0.11);
}
.sqr-badge.apply {
  color: var(--sqr-gold);
  background: rgba(138, 111, 46, 0.13);
}
.sqr-map {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
  margin-top: 16px;
}
.sqr-map-node {
  min-height: 136px;
  padding: 14px;
  border: 1px solid var(--sqr-line);
  border-top: 4px solid var(--node-color, var(--sqr-blue));
  border-radius: 6px;
  background: var(--sqr-panel);
}
.sqr-map-node:nth-child(1) { --node-color: var(--sqr-green); }
.sqr-map-node:nth-child(2) { --node-color: var(--sqr-blue); }
.sqr-map-node:nth-child(3) { --node-color: var(--sqr-gold); }
.sqr-map-node:nth-child(4) { --node-color: var(--sqr-rust); }
.sqr-map-node:nth-child(5) { --node-color: #5d6874; }
.sqr-map-node strong {
  display: block;
  margin-bottom: 7px;
  color: var(--sqr-ink);
  font-size: 17px;
}
.sqr-map-node span {
  display: block;
  color: var(--sqr-muted);
  font-size: 14px;
  line-height: 1.7;
}
.sqr-table-wrap {
  overflow-x: auto;
  border: 1px solid var(--sqr-line);
  border-radius: 6px;
  background: var(--sqr-panel);
}
.sqr-table {
  width: 100%;
  min-width: 760px;
  border-collapse: collapse;
}
.sqr-table th,
.sqr-table td {
  padding: 12px 13px;
  border-bottom: 1px solid var(--sqr-line);
  text-align: left;
  vertical-align: top;
}
.sqr-table th {
  color: var(--sqr-ink);
  background: #f3f6f8;
  font-weight: 780;
}
.sqr-table tr:last-child td { border-bottom: 0; }
.sqr-mini {
  padding: 15px;
}
.sqr-mini h4 {
  margin: 0 0 7px;
  color: var(--sqr-ink);
  font-size: 16px;
}
.sqr-mini code,
.sqr-answer code {
  padding: 1px 5px;
  border-radius: 4px;
  background: rgba(54, 95, 145, 0.09);
}
.sqr-list,
.sqr-route {
  margin: 0;
  padding-left: 1.2em;
}
.sqr-answer {
  overflow: hidden;
}
.sqr-answer summary {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  padding: 14px 16px;
  color: var(--sqr-green);
  cursor: pointer;
  font-weight: 780;
}
.sqr-answer summary::after {
  content: "展开";
  flex: 0 0 auto;
  color: var(--sqr-muted);
  font-size: 13px;
}
.sqr-answer details[open] summary::after { content: "收起"; }
.sqr-answer-body {
  padding: 0 16px 16px;
  border-top: 1px solid var(--sqr-line);
  background: var(--sqr-wash);
}
.sqr-answer h4 {
  margin: 14px 0 6px;
  color: var(--sqr-ink);
  font-size: 16px;
}
.sqr-route-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 10px;
}
.sqr-day {
  padding: 14px;
  border: 1px solid var(--sqr-line);
  border-radius: 6px;
  background: var(--sqr-panel);
}
.sqr-day strong {
  display: block;
  margin-bottom: 6px;
  color: var(--sqr-blue);
}
.sqr-day span {
  display: block;
  color: var(--sqr-muted);
  line-height: 1.65;
}
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
html[data-user-color-scheme="dark"] .sqr-map-node,
html[data-user-color-scheme="dark"] .sqr-day,
html[data-user-color-scheme="dark"] .sqr-table-wrap {
  background: var(--sqr-panel);
}
html[data-user-color-scheme="dark"] .sqr-table th {
  background: rgba(255, 255, 255, 0.06);
}
@media (max-width: 980px) {
  .sqr-hero,
  .sqr-grid,
  .sqr-grid.three {
    grid-template-columns: 1fr;
  }
  .sqr-map {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .sqr-route-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 680px) {
  .sqr-hero { padding: 22px; }
  .sqr-hero h2 { font-size: 25px; }
  .sqr-score,
  .sqr-map,
  .sqr-route-grid {
    grid-template-columns: 1fr;
  }
  .sqr-link,
  .sqr-chip {
    width: 100%;
  }
}
</style>

<div class="sqr-page">
  <section class="sqr-hero">
    <div>
      <span class="sqr-kicker">Software Quality Review Network</span>
      <h2>期末复习网络：先建体系，再背答案，再练大题</h2>
      <p>这页把本地复习资料里的 PPT、复习讲义、往年 A/C 卷、2024/2025 考试回忆，以及公开 CSDN 题库线索合在一起。目标不是把题目原文堆满，而是给零基础同学一张能直接复习的网络：知道每章在整门课里的位置，知道客观题从哪里来，知道简答题怎么背，知道设计题按什么步骤拿分。</p>
      <div class="sqr-actions">
        <a class="sqr-link" href="/courses/">返回课程总目录</a>
        <a class="sqr-link" href="/courses/software-quality-fables/">寓言版目录</a>
        <a class="sqr-link" href="/courses/software-quality-xianxia/">修仙版目录</a>
        <a class="sqr-link" href="#short-answer">简答背诵池</a>
        <a class="sqr-link" href="#design">大题模板</a>
      </div>
    </div>
    <div class="sqr-score" aria-label="复习优先级">
      <div><strong>0-9</strong><span>PPT 主线：绪论、质量、软件质量、体系、度量、标准、评审、SQA、设计、编程。</span></div>
      <div><strong>客观题</strong><span>判断、选择、填空主要跟云班课题库和复习题库重合，注意不定项。</span></div>
      <div><strong>简答题</strong><span>互评题和往年简答高度重合，按参考答案评分点背。</span></div>
      <div><strong>设计题</strong><span>等价类/边界值、控制流图、环路复杂度、基本路径、测试用例是核心。</span></div>
    </div>
  </section>

  <section class="sqr-note">
    <p><strong>来源边界：</strong>本页已读本地 PPT 0-9、复习 PDF、2019/2020 A/C 卷、2024 回忆 docx、2025 回忆图片，并参考公开 CSDN 题库文章。蓝墨云班课活动页当前跳转登录页，无法直接读取登录后的互评参考答案；所以这里把复习讲义/CSDN 已出现的互评题和 2024/2025 回忆点名的简答题先做成可背模板，登录后拿到老师参考答案时，按评分点微调即可。</p>
  </section>

  <nav class="sqr-nav" aria-label="页内导航">
    <a class="sqr-chip" href="#sources">资料异同</a>
    <a class="sqr-chip" href="#network">知识网络</a>
    <a class="sqr-chip" href="#chapters">章节地图</a>
    <a class="sqr-chip" href="#exam">题型雷达</a>
    <a class="sqr-chip" href="#short-answer">简答背诵池</a>
    <a class="sqr-chip" href="#design">大题模板</a>
    <a class="sqr-chip" href="#route">7 天路线</a>
  </nav>

  <h2 id="sources" class="sqr-section-title">一、资料异同：哪些是主线，哪些是补充</h2>
  <div class="sqr-table-wrap">
    <table class="sqr-table">
      <thead>
        <tr>
          <th>资料</th>
          <th>主要价值</th>
          <th>和其他资料的相同点</th>
          <th>差异与使用方法</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>课程 PPT 0-9</td>
          <td>考试概念的根。定义、分类、模型、流程、表述顺序优先按 PPT。</td>
          <td>与复习讲义前九章同源，和往年客观题、简答题的关键词大量重合。</td>
          <td>范围偏“软件质量保证理论”，不系统展开黑盒/白盒实验细节。零基础先读目录和每章小结，不要先钻教材。</td>
        </tr>
        <tr>
          <td>复习 PDF 与 CSDN 题库</td>
          <td>把互评题、课后题、客观题答案、测试技术补充放到一起。</td>
          <td>前九章覆盖质量、缺陷、度量、评审、SQA、设计、编程，和 PPT 对齐。</td>
          <td>CSDN 还扩展到软件测试、白盒、黑盒、集成、系统、验收。它是补充大题和客观题的题库，不等于 PPT 主范围。</td>
        </tr>
        <tr>
          <td>往年 A/C 卷</td>
          <td>告诉你题型结构和大题评分方式。A 卷含状态图、控制流图、环路复杂度、语句/路径覆盖；C 卷含边界值、流程图、覆盖、状态转换。</td>
          <td>客观题仍考质量、缺陷、SQA、度量、评审、测试基本概念；大题仍考测试设计。</td>
          <td>老卷题面会变化，不要背图形本身。要背“画图、算复杂度、列路径、写用例”的步骤。</td>
        </tr>
        <tr>
          <td>2024/2025 考试回忆</td>
          <td>最接近当前风格。都强调除大题外很多来自云班课；简答和互评题高度相关；大题重应用。</td>
          <td>简答仍落在质量体系、评审、SQA、测量原则、测试定义、三级测试、质量费用等核心点。</td>
          <td>2024 大题是命名格式等价类和中缀转后缀基本路径；2025 大题是图书编号等价类和排序代码基本路径。共同结论：大题不能只背原题。</td>
        </tr>
        <tr>
          <td>云班课互评题</td>
          <td>你提供的关键信息是“参考答案就是评分点”，所以简答题要按点作答。</td>
          <td>已知互评题与复习讲义中的互评题、24 年简答有交集。</td>
          <td>当前链接需要登录，暂不能直接核对全部参考答案。拿到后优先把本页“一级简答池”的措辞改成老师原评分点。</td>
        </tr>
      </tbody>
    </table>
  </div>

  <h2 id="network" class="sqr-section-title">二、总复习网络：五根主干把全课串起来</h2>
  <section class="sqr-map" aria-label="五根主干">
    <div class="sqr-map-node"><strong>1. 质量是什么</strong><span>质量、客户、明示/暗示需求、质量属性、质量观点、质量概念发展。对应第 1 章。</span></div>
    <div class="sqr-map-node"><strong>2. 软件为什么难</strong><span>软件无形、需求不确定、缺陷来自需求/设计/编码/测试，V 模型与开发过程。对应第 2 章。</span></div>
    <div class="sqr-map-node"><strong>3. 组织怎样控</strong><span>质量体系、方针、控制、保证、改进、质量成本、标准、CMM/CMMI。对应第 3、5、7 章。</span></div>
    <div class="sqr-map-node"><strong>4. 过程怎样量</strong><span>测量/度量/指标、尺度、有效性/可靠性、McCabe、缺陷密度、过程和产品度量。对应第 4 章。</span></div>
    <div class="sqr-map-node"><strong>5. 产品怎样做</strong><span>评审、设计质量、高质量编程、白盒/黑盒测试设计。对应第 6、8、9 章和测试补充。</span></div>
  </section>

  <section class="sqr-note">
    <p><strong>零基础理解法：</strong>这门课不是“测试工具课”，而是一门“如何让软件更不容易出事”的课。质量定义负责告诉你什么叫好；软件质量告诉你为什么软件容易坏；体系/标准/SQA 告诉你组织怎么管；度量告诉你怎么量；评审/设计/编码/测试告诉你在具体开发活动里怎么防错和找错。</p>
  </section>

  <h2 id="chapters" class="sqr-section-title">三、章节地图：每章抓一个问题</h2>
  <div class="sqr-grid">
    <article class="sqr-card"><span class="sqr-badge core">00 绪论</span><h3>为什么要学</h3><p>软件越来越复杂，事故和质量风险越来越多；考试题型是判断、选择、填空、简答、设计。绪论的价值是帮你判断复习资源优先级。</p></article>
    <article class="sqr-card"><span class="sqr-badge core">01 质量</span><h3>什么叫好</h3><p>背“质量是固有特性满足要求的程度”，把明示需求、暗示需求、客户、质量属性、四种质量观点和客户与质量关系串起来。</p></article>
    <article class="sqr-card"><span class="sqr-badge core">02 软件质量</span><h3>软件为什么更难保证质量</h3><p>抓软硬件差异、软件过程、软件缺陷、软件质量模型。客观题常问缺陷来源、失效/故障/缺陷、测试与开发过程关系。</p></article>
    <article class="sqr-card"><span class="sqr-badge core">03 质量工程体系</span><h3>组织层面怎么管质量</h3><p>质量方针、质量计划、质量控制、质量保证、质量改进、质量成本是本章主线。质量管理体系和质量费用模型都可出简答。</p></article>
    <article class="sqr-card"><span class="sqr-badge apply">04 质量度量</span><h3>怎么把质量量出来</h3><p>测量、度量、指标三者要区分；四种尺度、有效性/可靠性、测量原则、McCabe 环路复杂度是高频。设计题常把它和基本路径测试连起来。</p></article>
    <article class="sqr-card"><span class="sqr-badge apply">05 质量标准</span><h3>有哪些规矩和成熟度</h3><p>标准层次、ISO 9001-3、CMM、CMMI 五级成熟度、过程评估。客观题喜欢考层次、级别名称和 ISO/CMM 区别。</p></article>
    <article class="sqr-card"><span class="sqr-badge hot">06 软件评审</span><h3>为什么要早发现缺陷</h3><p>从成本、技术、效率三方面背“为什么评审”；再背评审内容、评审方法、走查与审查差异、评审会议结果。2024 已考互评简答。</p></article>
    <article class="sqr-card"><span class="sqr-badge hot">07 SQA 组织</span><h3>谁来保证过程被执行</h3><p>SQA 与测试的区别、三种组织结构、SQA 人员主要工作内容、评审与审核区别是重点。2025 简答考 SQA 人员工作内容。</p></article>
    <article class="sqr-card"><span class="sqr-badge apply">08 设计质量</span><h3>先把设计做对</h3><p>低耦合高内聚、耦合/内聚分类顺序、设计原则、体系结构、设计模式、数据字典。A 卷简答考耦合和内聚排序。</p></article>
    <article class="sqr-card"><span class="sqr-badge apply">09 高质量编程</span><h3>把代码写得不容易出错</h3><p>命名、函数参数、文件结构、版式、表达式、基本语句、内存管理、const。客观题会考指针输入参数前加 const、内存泄漏、野指针等。</p></article>
  </div>

  <h2 id="exam" class="sqr-section-title">四、题型雷达：从往年题看复习投入</h2>
  <div class="sqr-grid three">
    <article class="sqr-card"><span class="sqr-badge hot">客观题</span><h3>云班课原题优先</h3><p>2024 回忆说选择、填空、判断都是云班课原题；2025 回忆也说除大题外都是云班课原题。复习时先刷云班课，再用 PPT 回看错题概念。</p></article>
    <article class="sqr-card"><span class="sqr-badge hot">简答题</span><h3>互评题是主池</h3><p>2024 五道简答里至少三道被明确标为互评题。2025 简答五道也落在互评/复习讲义高频点。背答案时按“定义 + 分类/原因 + 作用/结论”写，不要只写一句话。</p></article>
    <article class="sqr-card"><span class="sqr-badge hot">大题</span><h3>流程比原题重要</h3><p>2024、2025、A/C 卷都把大题放在等价类/边界值、控制流图、环路复杂度、基本路径、测试用例、状态图。题面会换，步骤不变。</p></article>
  </div>

  <div class="sqr-table-wrap" style="margin-top:14px">
    <table class="sqr-table">
      <thead>
        <tr>
          <th>样本</th>
          <th>客观题</th>
          <th>简答题</th>
          <th>设计题/大题</th>
          <th>结论</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>A 卷</td>
          <td>判断 15、选择 20、填空 10。</td>
          <td>耦合/内聚排序、测量原则、三种质量模型评价。</td>
          <td>状态图、控制流图、环路复杂度、独立路径；简单 C 程序的语句覆盖和路径覆盖。</td>
          <td>理论和测试设计各占一半，白盒大题权重高。</td>
        </tr>
        <tr>
          <td>C 卷</td>
          <td>判断 10、选择 20、填空 10。</td>
          <td>单元测试、穷举测试、V/W/H 模型选择。</td>
          <td>字符串长度边界值；代码流程图、语句覆盖、路径覆盖；售票系统状态转换图和基本路径。</td>
          <td>大题偏操作，客观题覆盖质量保证与测试基础概念。</td>
        </tr>
        <tr>
          <td>2024 回忆</td>
          <td>选择、填空、判断来自云班课，选择可能不标单选/多选。</td>
          <td>为什么需要评审、客户与质量关系、质量费用模型、测试原则、发布后 bug 处理。</td>
          <td>命名格式有效/无效等价类；中缀转后缀代码的控制流图、环路复杂度、基本路径、测试用例。</td>
          <td>互评题和测试设计都很关键，不能只刷客观题。</td>
        </tr>
        <tr>
          <td>2025 回忆</td>
          <td>判断 5、选择 15、填空 8，除大题外是云班课原题。</td>
          <td>质量管理体系、单元/集成/系统测试侧重点、SQA 工作内容、测量原则、软件测试定义。</td>
          <td>8 位图书编号有效/无效等价类；排序代码的控制流图、三种复杂度算法、基本路径、测试用例。</td>
          <td>客观题靠题库，简答靠互评，设计题靠步骤训练。</td>
        </tr>
      </tbody>
    </table>
  </div>

  <h2 class="sqr-section-title">五、客观题易错网：先把这些判断反过来</h2>
  <div class="sqr-grid three">
    <article class="sqr-mini"><h4>SQA 不等于测试</h4><p>SQA 面向过程、计划、监督、记录、分析、报告；测试主要面向产品缺陷发现。判断题看到“软件测试就是质量保证”要警惕。</p></article>
    <article class="sqr-mini"><h4>质量可以预测和测量</h4><p>质量有可测性和可预见性。看到“产品完成前无法预测质量好坏”通常是错的。</p></article>
    <article class="sqr-mini"><h4>缺陷不能绝对避免</h4><p>测试只能提高发现概率，不能证明没有缺陷。完全测试通常不可行。</p></article>
    <article class="sqr-mini"><h4>测试不是调试</h4><p>测试是发现错误，调试是定位、确认性质并改正错误；调试通常由理解内部实现的人完成。</p></article>
    <article class="sqr-mini"><h4>覆盖强弱有顺序</h4><p>常见逻辑覆盖从弱到强可按语句、判定、条件、判定/条件、条件组合、路径理解。路径覆盖强，但成本高。</p></article>
    <article class="sqr-mini"><h4>测试用例不是只有输入</h4><p>至少要写输入数据和预期输出结果；更完整时还包括执行条件、步骤和环境。</p></article>
    <article class="sqr-mini"><h4>边界值要贴边</h4><p>有效边界和刚越界都要看。范围 1-6 的长度，至少想到 0、1、2、5、6、7。</p></article>
    <article class="sqr-mini"><h4>质量成本不是生产成本</h4><p>经典模型分为控制费用和控制失效费用；再分预防、评价、内部失效、外部失效。</p></article>
    <article class="sqr-mini"><h4>高内聚低耦合</h4><p>设计质量题最常见方向是降低耦合、提高内聚。排序题要把“好坏方向”先写在草稿上。</p></article>
  </div>

  <h2 id="short-answer" class="sqr-section-title">六、简答背诵池：按“一级必背 + 二级补充”复习</h2>
  <section class="sqr-note">
    <p><strong>答题格式：</strong>简答题不要只写名词。建议每题按三段写：先给定义，再列要点，最后写作用或结论。老师按参考答案评分点给分，所以每个小点尽量独立成句。</p>
  </section>

  <div class="sqr-grid">
    <article class="sqr-answer">
      <details open>
        <summary>一级必背：互评题和 24/25 回忆高度相关</summary>
        <div class="sqr-answer-body">
          <h4>1. 为什么需要软件评审</h4>
          <p>从成本、技术、效率三方面答。成本上，缺陷发现越晚，纠正费用越高，评审能尽早发现缺陷并减少后期返工。技术上，前一阶段错误会传递到后一阶段并累积。效率上，开发减少返工，项目负责人缩短周期并降低维护费用，测试人员能把精力放在测试用例设计上，维护人员后期工作减少。</p>
          <h4>2. 客户与质量之间的关系</h4>
          <p>客户与质量是相互依赖关系。客户是质量的接受者，能直接观察或感受质量；质量相对于客户存在，服务于客户，并最终由客户判定。答题时补一句：质量不仅要满足明示需求，也要满足暗示需求。</p>
          <h4>3. 经典软件质量费用模型</h4>
          <p>软件质量费用分为控制费用和控制失效费用。控制费用包括预防费用、评价费用；控制失效费用包括内部失效费用、外部失效费用。预防是防止错误，评价是检测错误，内部失效是交付前修错，外部失效是交付后在客户现场修错。</p>
          <h4>4. 质量管理体系是什么</h4>
          <p>质量管理体系是在质量方面指挥和控制组织的管理体系。组织围绕质量方针和质量目标，把管理职责、资源管理、产品实现、测量分析和改进等过程组织成相互关联的整体，以持续满足顾客和相关方要求。</p>
          <h4>5. SQA 人员主要工作内容</h4>
          <p>制定 SQA 计划，参与软件过程描述，评审工程活动是否符合过程，审计工作产品是否符合过程，记录并处理偏差，向管理层报告不符合项并跟踪解决，协调变更控制，帮助收集和分析度量信息。</p>
          <h4>6. 基本的测量原则</h4>
          <p>测量要建立在正确理论上并明确目标；技术测量定义要一致、客观、无二义；结果在经验和直觉上有说服力；方法简单、可计算；测量要按产品和过程剪裁，尽量自动化；用正确统计技术建立内部属性和外部特征关系；结果要可靠；要建立反馈机制。</p>
          <h4>7. 什么是软件测试</h4>
          <p>软件测试是为了发现错误而执行程序的过程。也可以写成：根据各阶段规格说明和程序内部结构设计测试用例，用输入数据和预期输出运行程序，以发现程序错误并评价软件质量。</p>
          <h4>8. 单元测试、集成测试、系统测试侧重点</h4>
          <p>单元测试关注单个模块或程序单元的正确性，常需桩模块和驱动模块。集成测试在单元测试基础上组装模块，重点看接口、调用关系、参数传递和模块间协作。系统测试把完整系统放到预期环境中，检查功能、性能、兼容性、安全性等是否满足需求。</p>
        </div>
      </details>
    </article>
    <article class="sqr-answer">
      <details>
        <summary>二级补充：老卷和复习讲义出现过</summary>
        <div class="sqr-answer-body">
          <h4>9. SQA 三种组织结构及优缺点</h4>
          <p>独立 SQA 部门独立性和资源共享强，但难深入项目、问题解决可能慢。独立 SQA 工程师归项目管理，容易深入项目并快速解决问题，但独立性弱、经验共享不足。独立 SQA 小组综合两者，既保持相对独立，又让 SQA 工程师进入项目，利于能力提升和经验共享。</p>
          <h4>10. 什么是软件缺陷</h4>
          <p>从内部看，是软件开发或维护过程中存在的错误、毛病等问题；从外部看，是系统应实现功能的失效或违背。题目若问“缺陷产生”，要联想到需求、设计、编码、测试和文档问题。</p>
          <h4>11. 走查与审查的不同</h4>
          <p>两者都是同行评审方法，区别主要在正式性。审查比走查更正式；走查主要发现被评审文档问题，审查还与改进开发方法相结合，因此对 SQA 贡献更大。</p>
          <h4>12. ISO、McCall、Boehm 三种质量模型评价</h4>
          <p>三者对质量特性、因素和指标的划分不完全一致，但目的相近，都是构造软件质量因素、准则、度量之间的结构模型。ISO 模型第一层质量特性和第二层准则关系更清楚，McCall 与 Boehm 存在一定交叉。</p>
          <h4>13. 白盒测试与黑盒测试对比</h4>
          <p>白盒测试已知内部结构，按语句、分支、路径、条件等设计用例，适合单元测试和部分集成测试。黑盒测试不关心内部结构，从用户和功能角度测试输入输出，适合功能测试、系统测试、验收测试和易用性测试。</p>
          <h4>14. 回归测试是什么</h4>
          <p>修改代码后，用原有测试用例重新测试，确认修改实现预定目的，同时没有引入新错误或破坏原有功能。</p>
          <h4>15. 桩模块和驱动模块</h4>
          <p>桩模块模拟被测模块调用的下级模块，由被测模块调用。驱动模块模拟被测模块的上级模块，负责接收数据、调用被测模块并输出结果。</p>
          <h4>16. 软件发布后发现 bug 怎么办</h4>
          <p>先确认影响范围和严重程度，记录缺陷并复现；再定位原因、制定修复方案和回归测试方案；必要时发布补丁或回滚，并向用户/管理方说明影响和处理进度；最后复盘过程缺陷，更新测试用例和质量改进措施。</p>
        </div>
      </details>
    </article>
  </div>

  <h2 id="design" class="sqr-section-title">七、大题模板：不背题面，背流程</h2>
  <div class="sqr-grid">
    <article class="sqr-card">
      <span class="sqr-badge hot">模板 A</span>
      <h3>等价类划分/边界值分析</h3>
      <ul class="sqr-list">
        <li>第一步：把输入规则拆成字段，例如长度、字符类型、范围、格式、业务含义。</li>
        <li>第二步：每个字段列有效等价类和无效等价类。有效类覆盖“符合要求”，无效类覆盖“少、超、错、空、非法字符、格式错”。</li>
        <li>第三步：先用最少用例覆盖尽可能多的有效等价类，再为每个无效等价类至少补一个用例。</li>
        <li>第四步：边界值围绕最小值、略高于最小值、正常值、略低于最大值、最大值、略高于最大值写。</li>
        <li>第五步：输出表格：编号、输入、覆盖等价类/边界、预期结果。</li>
      </ul>
      <p style="margin-top:10px">对照往年：2024 命名格式、2025 八位图书编号、C 卷字符串长度，都按这套流程拿分。</p>
    </article>
    <article class="sqr-card">
      <span class="sqr-badge hot">模板 B</span>
      <h3>控制流图、环路复杂度、基本路径</h3>
      <ul class="sqr-list">
        <li>第一步：给代码语句或判断编号，顺序语句可合并成基本块。</li>
        <li>第二步：画控制流图。节点是基本块，边是控制转移。if 有真假两条边，while/for 有回边。</li>
        <li>第三步：算复杂度，常用三种写法都要会：<code>V(G)=E-N+2P</code>；区域数；判定节点数 + 1。</li>
        <li>第四步：列出 V(G) 条线性独立路径。每条路径至少引入一条新边。</li>
        <li>第五步：为每条基本路径设计输入，让程序实际走到对应分支，并写预期输出。</li>
      </ul>
      <p style="margin-top:10px">对照往年：A/C 卷、2024 中缀转后缀、2025 排序代码都在考这套“图 -> 算 -> 路径 -> 用例”。</p>
    </article>
    <article class="sqr-card">
      <span class="sqr-badge apply">模板 C</span>
      <h3>状态图/功能图/状态转换测试</h3>
      <ul class="sqr-list">
        <li>第一步：从题面中圈出状态，例如等待、输入、查询、付款、出票、超时、退款。</li>
        <li>第二步：圈出事件和条件，例如输入正确、输入错误、继续、结束、付款成功、取消。</li>
        <li>第三步：画状态节点和迁移边，边上写触发条件/动作。</li>
        <li>第四步：按题目要求计算图复杂度或列基本测试路径。</li>
        <li>第五步：为路径写测试用例，至少包括初始状态、事件序列、预期状态和预期输出。</li>
      </ul>
      <p style="margin-top:10px">对照往年：A 卷工厂查询系统、C 卷高铁售票系统都属于这个套路。</p>
    </article>
    <article class="sqr-card">
      <span class="sqr-badge apply">模板 D</span>
      <h3>答题表格怎么写才稳</h3>
      <p>大题最怕“脑子懂但卷面乱”。建议每题固定四张小表：输入规则表、等价类/边界表、路径表、测试用例表。即使路径画错一点，表格清楚也容易按步骤拿分。</p>
      <ul class="sqr-list" style="margin-top:10px">
        <li>等价类表：编号、有效/无效、描述、代表值。</li>
        <li>边界表：变量、下界、上界、刚越界值、正常值。</li>
        <li>路径表：路径编号、节点序列、覆盖分支。</li>
        <li>用例表：输入、路径/等价类、预期输出。</li>
      </ul>
    </article>
  </div>

  <h2 class="sqr-section-title">八、概念对照卡：看到这些词要能立刻区分</h2>
  <div class="sqr-grid three">
    <article class="sqr-mini"><h4>QA / QC / Testing</h4><p>QA 关注过程能否保证质量，QC 关注产品是否合格，Testing 是发现缺陷的技术活动。</p></article>
    <article class="sqr-mini"><h4>缺陷 / 故障 / 失效</h4><p>缺陷是内部问题，故障是缺陷的外在表现，失效是系统没有完成应有功能。</p></article>
    <article class="sqr-mini"><h4>验证 / 确认</h4><p>验证看“阶段产物是否满足本阶段条件”，确认看“最终产品是否满足用户需求”。</p></article>
    <article class="sqr-mini"><h4>有效性 / 可靠性</h4><p>有效性是测得准不准，可靠性是多次测量是否稳定一致。</p></article>
    <article class="sqr-mini"><h4>评审 / 审核</h4><p>评审偏技术和产品/文档质量，审核偏过程符合性和管理体系符合性。</p></article>
    <article class="sqr-mini"><h4>预防 / 评价 / 内部失效 / 外部失效</h4><p>预防是防错，评价是查错，内部失效是交付前修错，外部失效是交付后修错。</p></article>
    <article class="sqr-mini"><h4>等价类 / 边界值</h4><p>等价类把无限输入分组，边界值专门打最容易出错的边界附近。</p></article>
    <article class="sqr-mini"><h4>语句覆盖 / 路径覆盖</h4><p>语句覆盖只要求每条语句至少执行一次，路径覆盖要求覆盖可能路径，发现能力更强但成本更高。</p></article>
    <article class="sqr-mini"><h4>低耦合 / 高内聚</h4><p>低耦合让模块间依赖少，高内聚让模块内部目标集中，是设计质量的基本方向。</p></article>
  </div>

  <h2 id="route" class="sqr-section-title">九、零基础 7 天复习路线</h2>
  <section class="sqr-route-grid" aria-label="七天复习路线">
    <div class="sqr-day"><strong>Day 1</strong><span>读绪论和第 1 章。背质量定义、客户、明示/暗示需求、质量属性。</span></div>
    <div class="sqr-day"><strong>Day 2</strong><span>读第 2、3 章。画出软件缺陷来源、质量工程体系、质量成本四格。</span></div>
    <div class="sqr-day"><strong>Day 3</strong><span>读第 4、5 章。背测量原则、有效性/可靠性、McCabe、CMMI 五级。</span></div>
    <div class="sqr-day"><strong>Day 4</strong><span>读第 6、7 章。背为什么评审、走查 vs 审查、SQA 工作内容和组织结构。</span></div>
    <div class="sqr-day"><strong>Day 5</strong><span>读第 8、9 章。背耦合/内聚顺序、设计原则、const、内存泄漏和野指针。</span></div>
    <div class="sqr-day"><strong>Day 6</strong><span>集中练测试技术。做等价类、边界值、控制流图、复杂度、基本路径、测试用例。</span></div>
    <div class="sqr-day"><strong>Day 7</strong><span>按往年题模拟。客观题限时刷，简答题默写评分点，大题按模板写表格。</span></div>
  </section>

  <h2 class="sqr-section-title">十、最后 2 小时冲刺清单</h2>
  <div class="sqr-grid">
    <article class="sqr-card">
      <span class="sqr-badge hot">必须背到能默写</span>
      <ul class="sqr-list">
        <li>质量、软件缺陷、软件测试、测试用例、回归测试。</li>
        <li>为什么需要评审、测量原则、质量管理体系、质量费用模型。</li>
        <li>SQA 工作内容、SQA 三种组织结构、白盒/黑盒区别。</li>
        <li>单元/集成/系统测试侧重点、客户与质量关系。</li>
      </ul>
    </article>
    <article class="sqr-card">
      <span class="sqr-badge hot">必须练到不卡壳</span>
      <ul class="sqr-list">
        <li>给一个输入格式，能列有效/无效等价类和边界值。</li>
        <li>给一段含 if/while 的代码，能画控制流图。</li>
        <li>能用三种方法算环路复杂度，并让答案互相对上。</li>
        <li>能列基本路径，并为每条路径写输入和预期输出。</li>
      </ul>
    </article>
  </div>

  <section class="sqr-note">
    <p><strong>公开来源：</strong><a href="https://blog.csdn.net/m0_56942491/article/details/131734756" target="_blank" rel="noopener">CSDN 题库整理</a>；<a href="https://www.mosoteach.cn/web/cc-detail/4851E258-439C-11F1-BAE9-A088C2A30E68/act/" target="_blank" rel="noopener">蓝墨云班课活动页</a>。本页是面向复习的结构化整理和答题模板，不逐字转载题库原文；本地 PPT、试卷和回忆资料用于提取范围、题型和高频点。</p>
  </section>
</div>
