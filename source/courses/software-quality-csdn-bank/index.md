---
title: "软件质量与测试 · CSDN 题库对照"
date: 2026-06-23 14:10:00
description: "《软件质量保证与测试》CSDN 公开题库对照页：按原文互评题、章节课后习题和测试相关未分类习题整理，作为云班课题库的补充来源。"
---

<style>

.csdn-page { max-width: 1180px; margin: 0 auto; padding: 24px 18px 64px; color: #172033; }
.csdn-hero { display: grid; grid-template-columns: minmax(0, 1.45fr) minmax(280px, .55fr); gap: 18px; padding: 24px; border: 1px solid rgba(31, 43, 68, .12); border-radius: 12px; background: linear-gradient(135deg, #f8fbff 0%, #f7f8f2 48%, #fff8f2 100%); }
.csdn-kicker { display: block; font-size: 12px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: #52616f; margin-bottom: 10px; }
.csdn-hero h2 { margin: 0; font-size: 30px; line-height: 1.25; }
.csdn-hero p, .csdn-note p { margin: 10px 0 0; line-height: 1.8; color: #4b5565; }
.csdn-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; }
.csdn-link, .csdn-chip { display: inline-flex; align-items: center; justify-content: center; min-height: 38px; padding: 0 13px; border: 1px solid rgba(31, 43, 68, .16); border-radius: 8px; color: #1f4f7a; background: #fff; text-decoration: none; font-weight: 700; }
.csdn-stats { display: grid; gap: 10px; }
.csdn-stat { padding: 14px; border: 1px solid rgba(31, 43, 68, .12); border-radius: 10px; background: rgba(255,255,255,.72); }
.csdn-stat strong { display: block; font-size: 24px; color: #0d3557; }
.csdn-stat span { display: block; margin-top: 4px; color: #5c6675; line-height: 1.55; }
.csdn-note { margin: 16px 0; padding: 14px 16px; border-left: 4px solid #286f9f; background: #f6fafc; border-radius: 8px; }
.csdn-searchbar { max-width: min(1040px, calc(100vw - 520px)); margin: 18px auto; padding: 12px; border: 1px solid rgba(31,43,68,.12); border-radius: 10px; background: #fff; box-shadow: 0 8px 22px rgba(24, 39, 75, .04); }
.csdn-search { width: 100%; min-height: 42px; border: 1px solid rgba(31,43,68,.18); border-radius: 8px; padding: 0 12px; font-size: 15px; }
.csdn-count { margin-top: 8px; color: #667085; font-size: 13px; }
.csdn-study-layout { display: block; max-width: min(1040px, calc(100vw - 520px)); margin: 0 auto; }
.csdn-sidebar { position: fixed; top: 96px; right: max(18px, calc(50vw - 920px)); width: 220px; max-height: calc(100vh - 110px); overflow: auto; padding: 12px; border: 1px solid rgba(31,43,68,.12); border-radius: 10px; background: rgba(255,255,255,.96); box-shadow: 0 10px 24px rgba(24, 39, 75, .06); }
.csdn-sidebar-title { margin: 0 0 10px; color: #667085; font-size: 13px; font-weight: 800; }
.csdn-nav { display: grid; gap: 8px; }
.csdn-nav .csdn-chip { justify-content: flex-start; width: 100%; min-height: 34px; padding: 0 10px; font-size: 14px; line-height: 1.35; }
.csdn-section { margin-top: 28px; scroll-margin-top: 92px; }
.csdn-content .csdn-section:first-of-type { margin-top: 0; }
.csdn-section h2 { margin: 0 0 12px; font-size: 24px; }
.csdn-grid { display: grid; gap: 12px; }
.csdn-card { border: 1px solid rgba(31,43,68,.12); border-radius: 10px; background: #fff; padding: 14px 16px; box-shadow: 0 8px 22px rgba(24, 39, 75, .05); }
.csdn-meta { margin: 0 0 8px; display: flex; flex-wrap: wrap; gap: 8px; color: #667085; font-size: 13px; }
.csdn-pill { display: inline-flex; align-items: center; min-height: 24px; padding: 0 8px; border-radius: 999px; background: #eef5fa; color: #31506d; font-weight: 700; }
.csdn-question { margin: 0; color: #172033; line-height: 1.75; font-weight: 700; }
.csdn-card details { margin-top: 10px; }
.csdn-card summary { cursor: pointer; color: #1f4f7a; font-weight: 700; }
.csdn-full { margin: 10px 0 0; line-height: 1.85; color: #3f4957; white-space: pre-wrap; }
.csdn-empty { display: none; margin: 18px 0; color: #b42318; font-weight: 700; }
html[data-user-color-scheme="dark"] .csdn-page { color: #e5e7eb; }
html[data-user-color-scheme="dark"] .csdn-hero, html[data-user-color-scheme="dark"] .csdn-card, html[data-user-color-scheme="dark"] .csdn-searchbar, html[data-user-color-scheme="dark"] .csdn-sidebar, html[data-user-color-scheme="dark"] .csdn-stat { background: #141821; border-color: rgba(255,255,255,.12); }
html[data-user-color-scheme="dark"] .csdn-hero p, html[data-user-color-scheme="dark"] .csdn-note p, html[data-user-color-scheme="dark"] .csdn-stat span, html[data-user-color-scheme="dark"] .csdn-full, html[data-user-color-scheme="dark"] .csdn-meta { color: #c8d0dc; }
html[data-user-color-scheme="dark"] .csdn-question, html[data-user-color-scheme="dark"] .csdn-stat strong { color: #f3f4f6; }
@media (max-width: 980px) { .csdn-searchbar, .csdn-study-layout { max-width: none; } .csdn-sidebar { display: none; } }
@media (max-width: 760px) { .csdn-page { padding: 16px 12px 48px; } .csdn-hero { grid-template-columns: 1fr; padding: 18px; } .csdn-hero h2 { font-size: 24px; } .csdn-link { width: 100%; } }

</style>
<link rel="stylesheet" href="/css/software-quality-mobile-voice.css?v=20260623-5">
<script defer src="/js/software-quality-voice.js?v=20260623-5"></script>

<div class="sqe-page csdn-page">
  <section class="sqe-hero csdn-hero">
    <div>
      <span class="csdn-kicker">CSDN Question Bank / 公开题库对照</span>
      <h2>CSDN 公开题库单独成页，作为云班课题库的补充对照</h2>
      <p>这页按 CSDN 主原文结构整理互评题、章节课后习题和“测试相关未分类习题”。云班课题库仍以登录接口导出的 451 张卡片为准；CSDN 页用于补齐公开题库视角，特别是云班课接口暂未开放答案的未分类题。另把 2025 CSDN 题（一）作为补充来源，用来提示驱动模块/桩模块、健壮性边界值 <code>6n+1</code>、因果图法等客观题补充点。</p>
      <div class="csdn-actions"><a class="csdn-link" href="/courses/software-quality-review-network/">返回复习网络</a><a class="csdn-link" href="/courses/software-quality-exercises/">云班课题库</a><a class="csdn-link" href="https://blog.csdn.net/m0_56942491/article/details/131734756" target="_blank" rel="noopener">CSDN 主原文</a><a class="csdn-link" href="https://blog.csdn.net/qq_43055855/article/details/148869571" target="_blank" rel="noopener">2025 补充题（一）</a></div>
    </div>
    <div class="csdn-stats" aria-label="CSDN 题库统计">
      <div class="csdn-stat"><strong>298</strong><span>CSDN 原文题目/题组条目，按源页面结构保留。</span></div>
      <div class="csdn-stat"><strong>14</strong><span>来源分组：互评题、章节课后题、测试相关未分类习题。</span></div>
      <div class="csdn-stat"><strong>CC BY-SA</strong><span>原文页面标注遵循 CC 4.0 BY-SA，本站保留来源链接。</span></div>
    </div>
  </section>
  <section class="sqe-tip csdn-note"><p><strong>边界说明：</strong>这不是老师云班课接口导出的答案页，而是 CSDN 公开题库对照页。少数原文条目本身是“填空/选择/判断题组”，这里按原文题组保留，不强行拆散，避免我再加工时改错题意。2025 补充题只用于标记补充题点，不并入“298 条主原文题库”数量。</p></section>
  <section class="csdn-searchbar" aria-label="题库检索"><input id="csdnSearch" class="csdn-search" type="search" placeholder="搜索 CSDN 题库：例如 评审、边界值、系统测试、路径覆盖、CMMI"><div id="csdnCount" class="csdn-count"></div></section>
  <div class="csdn-study-layout">
    <aside class="csdn-sidebar" aria-label="章节目录">
      <p class="csdn-sidebar-title">章节目录</p>
      <nav class="csdn-nav" aria-label="章节导航">
    <a class="csdn-chip" href="#csdn-互评题">互评题</a>
    <a class="csdn-chip" href="#csdn-第一章-质量">第一章 质量</a>
    <a class="csdn-chip" href="#csdn-第二章-软件质量">第二章 软件质量</a>
    <a class="csdn-chip" href="#csdn-第三章-软件质量工程体系">第三章 软件质量工程体系</a>
    <a class="csdn-chip" href="#csdn-第四章-软件质量度量">第四章 软件质量度量</a>
    <a class="csdn-chip" href="#csdn-第五章-软件质量标准">第五章 软件质量标准</a>
    <a class="csdn-chip" href="#csdn-第六章-软件评审">第六章 软件评审</a>
    <a class="csdn-chip" href="#csdn-第七章-SQA组织">第七章 SQA组织</a>
    <a class="csdn-chip" href="#csdn-第八章-提高软件设计质量">第八章 提高软件设计质量</a>
    <a class="csdn-chip" href="#csdn-第九章-高质量编程">第九章 高质量编程</a>
    <a class="csdn-chip" href="#csdn-第十章-软件测试">第十章 软件测试</a>
    <a class="csdn-chip" href="#csdn-第十一章-白盒测试">第十一章 白盒测试</a>
    <a class="csdn-chip" href="#csdn-第十二章-黑盒测试">第十二章 黑盒测试</a>
    <a class="csdn-chip" href="#csdn-测试相关未分类习题">测试相关未分类习题</a>
      </nav>
    </aside>
    <main class="csdn-content">
  <p id="csdnEmpty" class="csdn-empty">没有匹配的 CSDN 题目。</p>
  <section class="sqe-chapter csdn-section" id="csdn-互评题">
    <h2>互评题 <span style="font-size:14px;color:#667085">24 条</span></h2>
    <div class="csdn-grid">
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="互评题 CSDN 原文条目 简述软件开发人员和质量保证人员的区别。 简述软件开发人员和质量保证人员的区别。 软件开发人员负责技术工作，质量保证人员负责质量保证的计划、监督、记录、分析及报告工作。 软件开发人员通过采用可靠的技术方法和措施，进行正式的技术评审，执行计划周密的软件测试来保证软件产品的质量。软件质量保证人员则辅助软件开发组得到高质量的最终产品。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-001</span><span>CSDN 原文条目</span></p>
        <p class="csdn-question">简述软件开发人员和质量保证人员的区别。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">简述软件开发人员和质量保证人员的区别。 软件开发人员负责技术工作，质量保证人员负责质量保证的计划、监督、记录、分析及报告工作。 软件开发人员通过采用可靠的技术方法和措施，进行正式的技术评审，执行计划周密的软件测试来保证软件产品的质量。软件质量保证人员则辅助软件开发组得到高质量的最终产品。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="互评题 CSDN 原文条目 简述三种SQA的组织结构以及各自的优缺点。 简述三种SQA的组织结构以及各自的优缺点。 独立的SQA部门：在整个企业的组织结构中设立一个独立的职能和行政部门—SQA部门，该部门和其他职能部门平级。 优点：保护SQA工程师的独立性和客观性；有利于资源的共享。 缺点：SQA对流程的跟踪和控制难于深入，往往流于形式，难于发现流程中存在的关键问题；由于和项目组的相互独立，SQA工程师发现的问题不能得到及时有效的解决。 独立的SQA工程师：在这种组织结构中，SQA工程师属于项目成员，向项目经理汇报。 优点：SQA工程师能够深入项目，较容易发现实质性问题；对于SQA工程师发现的问题，能够得到较快短的解决。 缺点：项目之间相互独立， SQA工程师之间的沟通和交流有所缺乏，不利于经验的共享和SQA整体的培养和发展；由于SQA工程师隶属于项目组，独立性和客观性有所欠缺。 独立的SQA小组：该组织结构是前面两种组织结构的综合结果。 特点：SQA组虽然不算一个行政部门，但具有相对的独立性。同时，SQA工程师有隶属于不同的项目组，在工作上向项目经理汇报。该结构综合了上面两种结构的优点，既便于QA融入项目组，又便于部门之间经验的分享，还利于QA能力的提高。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-002</span><span>CSDN 原文条目</span></p>
        <p class="csdn-question">简述三种SQA的组织结构以及各自的优缺点。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">简述三种SQA的组织结构以及各自的优缺点。 独立的SQA部门：在整个企业的组织结构中设立一个独立的职能和行政部门—SQA部门，该部门和其他职能部门平级。 优点：保护SQA工程师的独立性和客观性；有利于资源的共享。 缺点：SQA对流程的跟踪和控制难于深入，往往流于形式，难于发现流程中存在的关键问题；由于和项目组的相互独立，SQA工程师发现的问题不能得到及时有效的解决。 独立的SQA工程师：在这种组织结构中，SQA工程师属于项目成员，向项目经理汇报。 优点：SQA工程师能够深入项目，较容易发现实质性问题；对于SQA工程师发现的问题，能够得到较快短的解决。 缺点：项目之间相互独立， SQA工程师之间的沟通和交流有所缺乏，不利于经验的共享和SQA整体的培养和发展；由于SQA工程师隶属于项目组，独立性和客观性有所欠缺。 独立的SQA小组：该组织结构是前面两种组织结构的综合结果。 特点：SQA组虽然不算一个行政部门，但具有相对的独立性。同时，SQA工程师有隶属于不同的项目组，在工作上向项目经理汇报。该结构综合了上面两种结构的优点，既便于QA融入项目组，又便于部门之间经验的分享，还利于QA能力的提高。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="互评题 CSDN 原文条目 简述什么是软件缺陷 简述什么是软件缺陷 从产品内部看，软件缺陷是软件产品开发或维护过程中所存在的错误、毛病等各种问题； 从外部看，软件缺陷是系统所需要实现的某种功能的失效或违背。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-003</span><span>CSDN 原文条目</span></p>
        <p class="csdn-question">简述什么是软件缺陷</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">简述什么是软件缺陷 从产品内部看，软件缺陷是软件产品开发或维护过程中所存在的错误、毛病等各种问题； 从外部看，软件缺陷是系统所需要实现的某种功能的失效或违背。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="互评题 CSDN 原文条目 请指出走查、审查这两种同行评审方法的不同？ 请指出走查、审查这两种同行评审方法的不同？ 走查和审查的区别是其正式性的等级。其中，审查是两者之中更为正式。 走查的发现限于被评审文档的意见，而审查的发现还同改进开发方法自身的工作相结合。 所以和走查相比，审查对一般的SQA做出了更大贡献。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-004</span><span>CSDN 原文条目</span></p>
        <p class="csdn-question">请指出走查、审查这两种同行评审方法的不同？</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">请指出走查、审查这两种同行评审方法的不同？ 走查和审查的区别是其正式性的等级。其中，审查是两者之中更为正式。 走查的发现限于被评审文档的意见，而审查的发现还同改进开发方法自身的工作相结合。 所以和走查相比，审查对一般的SQA做出了更大贡献。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="互评题 CSDN 原文条目 简述为什么要评审 简述为什么要评审 从成本上来衡量：缺陷发现得越晚纠正费用越高，而软件评审的重要目的就是通过软件评审尽早的产品中的缺陷，减少大量的后期返工。 从技术上来衡量：前一阶段的错误自然会导致后一阶段的工作结果中有相应的错误，而且错误会逐渐累积，越来越多。 从效率上来衡量： 开发工程师：减少修订缺陷的时间，提高编程效率；减少测试和调试时间 项目负责人：缩短开发周期；减少维护费用；项目风险和质量问题得到很好控制 测试工程师：可以将更多精力放到测试用例的设计上，提高测试效率 维护人员：维护工作减少；产品的可维护性增强">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-005</span><span>CSDN 原文条目</span></p>
        <p class="csdn-question">简述为什么要评审</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">简述为什么要评审 从成本上来衡量：缺陷发现得越晚纠正费用越高，而软件评审的重要目的就是通过软件评审尽早的产品中的缺陷，减少大量的后期返工。 从技术上来衡量：前一阶段的错误自然会导致后一阶段的工作结果中有相应的错误，而且错误会逐渐累积，越来越多。 从效率上来衡量： 开发工程师：减少修订缺陷的时间，提高编程效率；减少测试和调试时间 项目负责人：缩短开发周期；减少维护费用；项目风险和质量问题得到很好控制 测试工程师：可以将更多精力放到测试用例的设计上，提高测试效率 维护人员：维护工作减少；产品的可维护性增强</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="互评题 CSDN 原文条目 简述基本的测量原则。 简述基本的测量原则。 测量应该基于该应用领域正确的理论之上，并在测量的定义中确定测度的目标； 每一个技术测量的定义应该具有一致性和客观性、无二义性； 测量在经验和直觉上也应该有说服力； 测量的方法力求简单、可计算性； 测量应该被剪裁以最适应特定的产品和过程，而且任何时候应尽可能使得收集和分析自动化； 应该用正确的统计技术来建立内部产品属性和外部待测量特征的关系； 测量结果应该是可靠的，不会因为一些技术问题导致测量结果很大的偏离； 测量应该建立反馈机制。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-006</span><span>CSDN 原文条目</span></p>
        <p class="csdn-question">简述基本的测量原则。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">简述基本的测量原则。 测量应该基于该应用领域正确的理论之上，并在测量的定义中确定测度的目标； 每一个技术测量的定义应该具有一致性和客观性、无二义性； 测量在经验和直觉上也应该有说服力； 测量的方法力求简单、可计算性； 测量应该被剪裁以最适应特定的产品和过程，而且任何时候应尽可能使得收集和分析自动化； 应该用正确的统计技术来建立内部产品属性和外部待测量特征的关系； 测量结果应该是可靠的，不会因为一些技术问题导致测量结果很大的偏离； 测量应该建立反馈机制。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="互评题 CSDN 原文条目 什么是质量管理体系 什么是质量管理体系 质量管理体系是在质量方面指挥和控制组织的管理体系。 组织为了实现所确定的质量方针和质量目标，经过质量策划将管理职责、资源管理、产品实现、测量、分析和改进等相互关联或相互作用的过程有机的组成一个整体，构成质量管理体系。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-007</span><span>CSDN 原文条目</span></p>
        <p class="csdn-question">什么是质量管理体系</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">什么是质量管理体系 质量管理体系是在质量方面指挥和控制组织的管理体系。 组织为了实现所确定的质量方针和质量目标，经过质量策划将管理职责、资源管理、产品实现、测量、分析和改进等相互关联或相互作用的过程有机的组成一个整体，构成质量管理体系。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="互评题 CSDN 原文条目 如何辨证的看待质量和客户的关系？ 如何辨证的看待质量和客户的关系？ 客户与质量的基本关系是相互依赖的关系。 客户是质量的接受者，可以直接观察或感觉到质量的存在。 质量相对于客户存在，服务于客户，而且由客户判定。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-008</span><span>CSDN 原文条目</span></p>
        <p class="csdn-question">如何辨证的看待质量和客户的关系？</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">如何辨证的看待质量和客户的关系？ 客户与质量的基本关系是相互依赖的关系。 客户是质量的接受者，可以直接观察或感觉到质量的存在。 质量相对于客户存在，服务于客户，而且由客户判定。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="互评题 CSDN 原文条目 简单评价ISO模型、McCall模型和Boehm模型3种软件质量模型。 简单评价ISO模型、McCall模型和Boehm模型3种软件质量模型。 存在差别：软件质量特性、影响因素或质量指标的定义不完全一致；总体上要表达的思想非常接近； 目的相同：构造软件质量因素-准则-度量，3者综合的软件质量结构模型； ISO模型第一层（质量特性）和第二层（准则）的关系非常清楚，不像McCall模型和Boehm模型那样存在交叉关系。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-009</span><span>CSDN 原文条目</span></p>
        <p class="csdn-question">简单评价ISO模型、McCall模型和Boehm模型3种软件质量模型。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">简单评价ISO模型、McCall模型和Boehm模型3种软件质量模型。 存在差别：软件质量特性、影响因素或质量指标的定义不完全一致；总体上要表达的思想非常接近； 目的相同：构造软件质量因素-准则-度量，3者综合的软件质量结构模型； ISO模型第一层（质量特性）和第二层（准则）的关系非常清楚，不像McCall模型和Boehm模型那样存在交叉关系。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="互评题 CSDN 原文条目 请详细描述软件质量费用的经典模型？ 请详细描述软件质量费用的经典模型？ 在经典软件质量费用模型中，软件质量费用可以划分为控制费用、控制失效费用。 其中，控制费用被进一步细化为预防费用和评价费用； 控制失效费用进一步细化为内部失效费用、外部失效费用。 （1）预防费用包括建立软件质量基础设施、更新并改进基础设施以及完成其运行所需的常规活动的投资。 （2）评价费用花在特定项目或软件系统中软件错误的检测上。 （3）内部失效费用是指改正在顾客现场安装软件之前实施设计评审、软件测试及验收测试时检测到的错误而产生的费用。 （4）外部失效费用限定为改正由顾客或维护组在顾客现场安装软件系统之后检测到的失效的费用。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-010</span><span>CSDN 原文条目</span></p>
        <p class="csdn-question">请详细描述软件质量费用的经典模型？</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">请详细描述软件质量费用的经典模型？ 在经典软件质量费用模型中，软件质量费用可以划分为控制费用、控制失效费用。 其中，控制费用被进一步细化为预防费用和评价费用； 控制失效费用进一步细化为内部失效费用、外部失效费用。 （1）预防费用包括建立软件质量基础设施、更新并改进基础设施以及完成其运行所需的常规活动的投资。 （2）评价费用花在特定项目或软件系统中软件错误的检测上。 （3）内部失效费用是指改正在顾客现场安装软件之前实施设计评审、软件测试及验收测试时检测到的错误而产生的费用。 （4）外部失效费用限定为改正由顾客或维护组在顾客现场安装软件系统之后检测到的失效的费用。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="互评题 CSDN 原文条目 软件测试与调试有什么区别？ 软件测试与调试有什么区别？ 软件测试与调试在目的、技术和方法等方面存在很大的区别 测试是为了发现软件中存在的错误；调试是为了证明软件开发的正确性。 测试以已知条件开始，使用预先定义的程序，且有预知的结果，不可预见的仅是程序是否通过测试；调试一般是以不可知的内部条件开始，除统计性调试外，结果是不可预见的 测试是有计划的，需要进行测试设计；调试是不受时间约束的。 测试经历发现错误、改正错误、重新测试的过程；调试是一个推理的过程。 测试的执行是有规程的；调试的执行往往要求开发人员进行必要推理以至知觉的&quot;飞跃&quot;。 测试经常是由独立的测试组在不了解软件设计的条件下完成的；调试必须由了解详细设计的开发人员完成。 大多数测试的执行和设计可以由工具支持；调式时，开发人员能利用的工具主要是调试器。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-011</span><span>CSDN 原文条目</span></p>
        <p class="csdn-question">软件测试与调试有什么区别？</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">软件测试与调试有什么区别？ 软件测试与调试在目的、技术和方法等方面存在很大的区别 测试是为了发现软件中存在的错误；调试是为了证明软件开发的正确性。 测试以已知条件开始，使用预先定义的程序，且有预知的结果，不可预见的仅是程序是否通过测试；调试一般是以不可知的内部条件开始，除统计性调试外，结果是不可预见的 测试是有计划的，需要进行测试设计；调试是不受时间约束的。 测试经历发现错误、改正错误、重新测试的过程；调试是一个推理的过程。 测试的执行是有规程的；调试的执行往往要求开发人员进行必要推理以至知觉的&quot;飞跃&quot;。 测试经常是由独立的测试组在不了解软件设计的条件下完成的；调试必须由了解详细设计的开发人员完成。 大多数测试的执行和设计可以由工具支持；调式时，开发人员能利用的工具主要是调试器。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="互评题 CSDN 原文条目 什么是回归测试？回归测试的目的是什么？ 什么是回归测试？回归测试的目的是什么？ 回归测试是指在修改了源代码后，用原有的测试用例进行重新进行测试以确认修改没有引入新的错误或导致其他代码产生错误。 回归测试的目的是所做的修改达到了预定的目的，如错误得到了改正，新功能得到了实现，能够适应新的运行环境等，不影响软件原有功能的正确性。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-012</span><span>CSDN 原文条目</span></p>
        <p class="csdn-question">什么是回归测试？回归测试的目的是什么？</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">什么是回归测试？回归测试的目的是什么？ 回归测试是指在修改了源代码后，用原有的测试用例进行重新进行测试以确认修改没有引入新的错误或导致其他代码产生错误。 回归测试的目的是所做的修改达到了预定的目的，如错误得到了改正，新功能得到了实现，能够适应新的运行环境等，不影响软件原有功能的正确性。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="互评题 CSDN 原文条目 什么是测试用例 什么是测试用例 测试用例是为特定的目的而设计的一组测试输入、执行条件和预期的结果。 测试用例是执行的最小实体。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-013</span><span>CSDN 原文条目</span></p>
        <p class="csdn-question">什么是测试用例</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">什么是测试用例 测试用例是为特定的目的而设计的一组测试输入、执行条件和预期的结果。 测试用例是执行的最小实体。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="互评题 CSDN 原文条目 什么是桩模块，什么是驱动模块？ 什么是桩模块，什么是驱动模块？ 桩模块是在进行单元测试时所设置的一种辅助测试模块，它用来模拟被测试模块工作过程中所调用的模块。 桩模块由被测模块调用，它们一般只进行很少的数据处理，以便检验被测模块与其下级模块的接口。 驱动模块是在进行单元测试时所设置的一种辅助测试模块，它用来模拟被测试模块的上一级模块，相当于被测模块的主程序。 驱动模块在单元测试中接收数据，把相关的数据传送给被测试的模块，启动被测模块，并给出相应的结果。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-014</span><span>CSDN 原文条目</span></p>
        <p class="csdn-question">什么是桩模块，什么是驱动模块？</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">什么是桩模块，什么是驱动模块？ 桩模块是在进行单元测试时所设置的一种辅助测试模块，它用来模拟被测试模块工作过程中所调用的模块。 桩模块由被测模块调用，它们一般只进行很少的数据处理，以便检验被测模块与其下级模块的接口。 驱动模块是在进行单元测试时所设置的一种辅助测试模块，它用来模拟被测试模块的上一级模块，相当于被测模块的主程序。 驱动模块在单元测试中接收数据，把相关的数据传送给被测试的模块，启动被测模块，并给出相应的结果。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="互评题 CSDN 原文条目 简述质量保证人员的主要工作内容。 简述质量保证人员的主要工作内容。 为项目制定SQA计划。该计划在制定项目计划时制定，由相关部门审定。它规定了软件开发小组和质量保证小组需要执行的质量保证活动。 参与开发该软件项目的软件过程描述。 评审各项软件工程活动，核实其是否符合已定义的软件过程。 审计指定的软件工作产品，核实其是否符合已定义的软件过程中的相应部分。 确保软件工作及工作产品中的偏差已被记录在案，并根据预定规程进行处理。 记录所有不符合部分，并向上级管理部门报告。跟踪不符合的部分直到问题得到解决。 协调变更的控制与管理，并帮助收集和分析软件度量的信息。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-015</span><span>CSDN 原文条目</span></p>
        <p class="csdn-question">简述质量保证人员的主要工作内容。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">简述质量保证人员的主要工作内容。 为项目制定SQA计划。该计划在制定项目计划时制定，由相关部门审定。它规定了软件开发小组和质量保证小组需要执行的质量保证活动。 参与开发该软件项目的软件过程描述。 评审各项软件工程活动，核实其是否符合已定义的软件过程。 审计指定的软件工作产品，核实其是否符合已定义的软件过程中的相应部分。 确保软件工作及工作产品中的偏差已被记录在案，并根据预定规程进行处理。 记录所有不符合部分，并向上级管理部门报告。跟踪不符合的部分直到问题得到解决。 协调变更的控制与管理，并帮助收集和分析软件度量的信息。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="互评题 CSDN 原文条目 什么是性能测试？性能测试主要包括什么内容？ 什么是性能测试？性能测试主要包括什么内容？ 是指通过自动化的测试工具模拟多种正常、峰值以及异常负载条件来对系统的各项性能指标进行测试。 主要包括以下三个方面：应用在客户端性能的测试，应用在网络上性能的测试和应用在服务器端性能的测试">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-016</span><span>CSDN 原文条目</span></p>
        <p class="csdn-question">什么是性能测试？性能测试主要包括什么内容？</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">什么是性能测试？性能测试主要包括什么内容？ 是指通过自动化的测试工具模拟多种正常、峰值以及异常负载条件来对系统的各项性能指标进行测试。 主要包括以下三个方面：应用在客户端性能的测试，应用在网络上性能的测试和应用在服务器端性能的测试</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="互评题 CSDN 原文条目 白盒测试的重点以及相应的对策是什么？ 白盒测试的重点以及相应的对策是什么？ 模块接口测试，重点检查进出模块的数据是否正确 模块局部数据结构测试，重点检查局部数据结构能否保持完整性 模块边界条件测试，重点检查临界数据是否正确处理 模块独立执行路径测试，重点检查由于计算错误，判定错误，控制流错误导致的程序错误 模块内部错误处理测试，重点检查内部错误处理设施是否有效">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-017</span><span>CSDN 原文条目</span></p>
        <p class="csdn-question">白盒测试的重点以及相应的对策是什么？</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">白盒测试的重点以及相应的对策是什么？ 模块接口测试，重点检查进出模块的数据是否正确 模块局部数据结构测试，重点检查局部数据结构能否保持完整性 模块边界条件测试，重点检查临界数据是否正确处理 模块独立执行路径测试，重点检查由于计算错误，判定错误，控制流错误导致的程序错误 模块内部错误处理测试，重点检查内部错误处理设施是否有效</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="互评题 CSDN 原文条目 软件测试和软件开发过程具有怎么样的关系？ 软件测试和软件开发过程具有怎么样的关系？ 软件测试贯穿在软件的开发过程中，在每个开发阶段具有不同的任务， 在需求分析阶段，主要测试需求分析，以及进行系统测试计划的制定。 在详细设计和概要设计阶段，主要确保集成测试计划和单元测试计划完成。 在编码阶段，主要由开发人员测试自己负责开发的模块的代码。对于大型项目则需要有专门人员进行编码阶段的测试任务。 在测试阶段，主要对系统进行测试，并提交相应的测试结果报告和测试分析报告。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-018</span><span>CSDN 原文条目</span></p>
        <p class="csdn-question">软件测试和软件开发过程具有怎么样的关系？</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">软件测试和软件开发过程具有怎么样的关系？ 软件测试贯穿在软件的开发过程中，在每个开发阶段具有不同的任务， 在需求分析阶段，主要测试需求分析，以及进行系统测试计划的制定。 在详细设计和概要设计阶段，主要确保集成测试计划和单元测试计划完成。 在编码阶段，主要由开发人员测试自己负责开发的模块的代码。对于大型项目则需要有专门人员进行编码阶段的测试任务。 在测试阶段，主要对系统进行测试，并提交相应的测试结果报告和测试分析报告。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="互评题 CSDN 原文条目 简述负载测试，容量测试和强度测试的区别。 简述负载测试，容量测试和强度测试的区别。 负载测试：在一定的工作负荷下，系统的负荷及响应时间。 强度测试：在一定的负荷条件下，在较长时间跨度内的系统连续运行给系统性能所造成的影响。 容量测试：是通过测试预先分析出反映软件系统应用特征的某项指标的极限值，系统在其极限值状态下没有出现任何软件故障或还能保持主要功能正常运行。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-019</span><span>CSDN 原文条目</span></p>
        <p class="csdn-question">简述负载测试，容量测试和强度测试的区别。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">简述负载测试，容量测试和强度测试的区别。 负载测试：在一定的工作负荷下，系统的负荷及响应时间。 强度测试：在一定的负荷条件下，在较长时间跨度内的系统连续运行给系统性能所造成的影响。 容量测试：是通过测试预先分析出反映软件系统应用特征的某项指标的极限值，系统在其极限值状态下没有出现任何软件故障或还能保持主要功能正常运行。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="互评题 CSDN 原文条目 什么是软件测试 什么是软件测试 软件测试是为了发现错误而执行程序的过程。 软件测试是根据软件开发各阶段的规格说明和程序的内部结构而精心设计一批测试用例（即输入数据及其预期的输出结果），并利用这些测试用例去运行程序，以发现程序错误的过程。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-020</span><span>CSDN 原文条目</span></p>
        <p class="csdn-question">什么是软件测试</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">什么是软件测试 软件测试是为了发现错误而执行程序的过程。 软件测试是根据软件开发各阶段的规格说明和程序的内部结构而精心设计一批测试用例（即输入数据及其预期的输出结果），并利用这些测试用例去运行程序，以发现程序错误的过程。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="互评题 CSDN 原文条目 单元测试、集成测试、系统测试的侧重点是什么？ 单元测试、集成测试、系统测试的侧重点是什么？ 单元测试是在软件开发过程中要进行的最低级别的测试活动，在单元测试活动中，软件的独立单元将在与程序的其他部分相隔离的情况下进行测试， 测试重点是系统的模块，包括子程序的正确性验证等。 集成测试，也叫组装测试或联合测试。在单元测试的基础上，将所有模块按照设计要求，组装成为子系统或系统，进行集成测试。 测试重点是模块间的衔接以及参数的传递等。 系统测试是将经过测试的子系统装配成一个完整系统来测试。它是检验系统是否确实能供系统方案说明书中指定功能的有效方法。 测试重点是整个系统的运行以及与其他软件的兼容性。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-021</span><span>CSDN 原文条目</span></p>
        <p class="csdn-question">单元测试、集成测试、系统测试的侧重点是什么？</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">单元测试、集成测试、系统测试的侧重点是什么？ 单元测试是在软件开发过程中要进行的最低级别的测试活动，在单元测试活动中，软件的独立单元将在与程序的其他部分相隔离的情况下进行测试， 测试重点是系统的模块，包括子程序的正确性验证等。 集成测试，也叫组装测试或联合测试。在单元测试的基础上，将所有模块按照设计要求，组装成为子系统或系统，进行集成测试。 测试重点是模块间的衔接以及参数的传递等。 系统测试是将经过测试的子系统装配成一个完整系统来测试。它是检验系统是否确实能供系统方案说明书中指定功能的有效方法。 测试重点是整个系统的运行以及与其他软件的兼容性。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="互评题 CSDN 原文条目 测试用例设计：有函数f(x,y)，其中x∈[100,200]，y∈[5,15]。 请写出该函数采用一般边界值分析法计（自己百度）的测试用例（提示：共9个测试用例）。 (100,Y) (200,Y) (101,Y) (199,Y) (X,5) (X,15) (X,6) (X,14) (X,Y) 测试用例设计：有函数f(x,y)，其中x∈[100,200]，y∈[5,15]。 请写出该函数采用一般边界值分析法计（自己百度）的测试用例（提示：共9个测试用例）。 (100,Y) (200,Y) (101,Y) (199,Y) (X,5) (X,15) (X,6) (X,14) (X,Y)">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-022</span><span>CSDN 原文条目</span></p>
        <p class="csdn-question">测试用例设计：有函数f(x,y)，其中x∈[100,200]，y∈[5,15]。 请写出该函数采用一般边界值分析法计（自己百度）的测试用例（提示：共9个测试用例）。 (100,Y) (200,Y) (101,Y) (199,Y) (X,5) (X,15) (X,6) (X,14) (X,Y)</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">测试用例设计：有函数f(x,y)，其中x∈[100,200]，y∈[5,15]。 请写出该函数采用一般边界值分析法计（自己百度）的测试用例（提示：共9个测试用例）。 (100,Y) (200,Y) (101,Y) (199,Y) (X,5) (X,15) (X,6) (X,14) (X,Y)</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="互评题 CSDN 原文条目 简述驱动程序以及如何构建测试驱动程序。 简述驱动程序以及如何构建测试驱动程序。 测试驱动程序是一个运行测试用例并收集运行结果的程序。 测试驱动程序的设计应该相对简单。 测试驱动程序必须是严谨的、结构清晰、简单，易于维护。 对所测试的类说明变化具有很强的适应能力。 理想情况下，在创建新的测试驱动程序时，应该能够复用已存在的驱动程序的代码">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-023</span><span>CSDN 原文条目</span></p>
        <p class="csdn-question">简述驱动程序以及如何构建测试驱动程序。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">简述驱动程序以及如何构建测试驱动程序。 测试驱动程序是一个运行测试用例并收集运行结果的程序。 测试驱动程序的设计应该相对简单。 测试驱动程序必须是严谨的、结构清晰、简单，易于维护。 对所测试的类说明变化具有很强的适应能力。 理想情况下，在创建新的测试驱动程序时，应该能够复用已存在的驱动程序的代码</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="互评题 CSDN 原文条目 简单对比白盒测试与黑盒测试 简单对比白盒测试与黑盒测试 白盒测试已知产品的内部工作过程，可以对程序每一行语句、每一个条件或分支进行测试 白盒测试适合单元测试、集成测试 白盒测试不适合系统测试 黑盒测试不考虑程序内部结构和内部特性，而是从用户观点出发，针对程序接口和用户界面进行测试 黑盒测试适合功能测试、易用性测试，验收测试、确认测试； 黑盒测试不适合单元测试、集成测试">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-024</span><span>CSDN 原文条目</span></p>
        <p class="csdn-question">简单对比白盒测试与黑盒测试</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">简单对比白盒测试与黑盒测试 白盒测试已知产品的内部工作过程，可以对程序每一行语句、每一个条件或分支进行测试 白盒测试适合单元测试、集成测试 白盒测试不适合系统测试 黑盒测试不考虑程序内部结构和内部特性，而是从用户观点出发，针对程序接口和用户界面进行测试 黑盒测试适合功能测试、易用性测试，验收测试、确认测试； 黑盒测试不适合单元测试、集成测试</p>
        </details>
      </article>
    </div>
  </section>
  <section class="sqe-chapter csdn-section" id="csdn-第一章-质量">
    <h2>第一章 质量 <span style="font-size:14px;color:#667085">3 条</span></h2>
    <div class="csdn-grid">
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第一章 质量 8 课后习题 填空 与质量相关的概念包括：组织、过程、产品、服务、客户、体系 质量是系统、部件或过程满足客户或用户明确需求或期望的不同程度 质量的属性包括：客户属性、成本属性、社会属性、可测性、可预见性 填空 与质量相关的概念包括：组织、过程、产品、服务、客户、体系 质量是系统、部件或过程满足客户或用户明确需求或期望的不同程度 质量的属性包括：客户属性、成本属性、社会属性、可测性、可预见性">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-025</span><span>8 课后习题</span></p>
        <p class="csdn-question">填空 与质量相关的概念包括：组织、过程、产品、服务、客户、体系 质量是系统、部件或过程满足客户或用户明确需求或期望的不同程度 质量的属性包括：客户属性、成本属性、社会属性、可测性、可预见性</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">填空 与质量相关的概念包括：组织、过程、产品、服务、客户、体系 质量是系统、部件或过程满足客户或用户明确需求或期望的不同程度 质量的属性包括：客户属性、成本属性、社会属性、可测性、可预见性</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第一章 质量 8 课后习题 选择 质量管理是指在质量方面（ 指挥 ）和（ 控制 ）组织的协调的活动 质量管理体系可以（ 帮助组织实现顾客满意、为组织提供实现持续改进的框架、向顾客提供信任 ） 实现全面质量管理全过程的管理必须体现（ 预防为主、不断改进；为顾客服务 ）的思想 致力于制定质量目标并规定必要的运行过程和相关资源以实现... 选择 质量管理是指在质量方面（ 指挥 ）和（ 控制 ）组织的协调的活动 质量管理体系可以（ 帮助组织实现顾客满意、为组织提供实现持续改进的框架、向顾客提供信任 ） 实现全面质量管理全过程的管理必须体现（ 预防为主、不断改进；为顾客服务 ）的思想 致力于制定质量目标并规定必要的运行过程和相关资源以实现质量目标，称之为（ 质量策划 ） 质量方针是一个组织总的质量宗旨和方向，应由组织的（ 最高管理者 ）批准。 由于组织的顾客和其他相关方对组织的产品、过程和体系的要求是随着时间不断变化的，这体现了质量的（ 时效性 ）。 著名的质量管理专家朱兰提出的质量管理三步曲是指 （ 质量策划、质量控制、质量改进 ）。 质量概念涵盖的对象是（ 产品、服务、过程（以上都是） ）。 从适合顾客需要的角度对产品质量下定义被称为（ 适用性质量 ）。 质量是一组固有（ 特性 ）满足要求的程度。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-026</span><span>8 课后习题</span></p>
        <p class="csdn-question">选择 质量管理是指在质量方面（ 指挥 ）和（ 控制 ）组织的协调的活动 质量管理体系可以（ 帮助组织实现顾客满意、为组织提供实现持续改进的框架、向顾客提供信任 ） 实现全面质量管理全过程的管理必须体现（ 预防为主、不断改进；为顾客服务 ）的思想 致力于制定质量目标并规定必要的运行过程和相关资源以实现...</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">选择 质量管理是指在质量方面（ 指挥 ）和（ 控制 ）组织的协调的活动 质量管理体系可以（ 帮助组织实现顾客满意、为组织提供实现持续改进的框架、向顾客提供信任 ） 实现全面质量管理全过程的管理必须体现（ 预防为主、不断改进；为顾客服务 ）的思想 致力于制定质量目标并规定必要的运行过程和相关资源以实现质量目标，称之为（ 质量策划 ） 质量方针是一个组织总的质量宗旨和方向，应由组织的（ 最高管理者 ）批准。 由于组织的顾客和其他相关方对组织的产品、过程和体系的要求是随着时间不断变化的，这体现了质量的（ 时效性 ）。 著名的质量管理专家朱兰提出的质量管理三步曲是指 （ 质量策划、质量控制、质量改进 ）。 质量概念涵盖的对象是（ 产品、服务、过程（以上都是） ）。 从适合顾客需要的角度对产品质量下定义被称为（ 适用性质量 ）。 质量是一组固有（ 特性 ）满足要求的程度。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第一章 质量 8 课后习题 判断 质量检验是对产品质量特性进行检验，以确定每项质量特性合格情况的管理性检查活动 持续改进总体业绩应当是组织应追求的目标 质量改进是质量管理的一部分，致力于增强满足质量要求的能力 质量控制是按照一个设定的标准去实施检验 服务是产品类别中的一类 质量特性是指产品、过程或体系与标准有关的固有特性。 “... 判断 质量检验是对产品质量特性进行检验，以确定每项质量特性合格情况的管理性检查活动 持续改进总体业绩应当是组织应追求的目标 质量改进是质量管理的一部分，致力于增强满足质量要求的能力 质量控制是按照一个设定的标准去实施检验 服务是产品类别中的一类 质量特性是指产品、过程或体系与标准有关的固有特性。 “符合标准”就是合格的产品质量 不合格品控制时，请示领导决定是否可用 质量管理体系是为实现质量方针和质量目标而建立的管理工作系统 珍视顾客抱怨，把它作为我们研发产品、改善质量、提升服务的动力源泉 质量改进和质量控制都是为了保持产品质量稳定 当生产过程处于受控制状态时，产品质量就不会波动 质量控制是消除偶发性问题，使产品质量保持规定的水平 质量管理是指在质量方面指挥和控制组织的协调的活动">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-027</span><span>8 课后习题</span></p>
        <p class="csdn-question">判断 质量检验是对产品质量特性进行检验，以确定每项质量特性合格情况的管理性检查活动 持续改进总体业绩应当是组织应追求的目标 质量改进是质量管理的一部分，致力于增强满足质量要求的能力 质量控制是按照一个设定的标准去实施检验 服务是产品类别中的一类 质量特性是指产品、过程或体系与标准有关的固有特性。 “...</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">判断 质量检验是对产品质量特性进行检验，以确定每项质量特性合格情况的管理性检查活动 持续改进总体业绩应当是组织应追求的目标 质量改进是质量管理的一部分，致力于增强满足质量要求的能力 质量控制是按照一个设定的标准去实施检验 服务是产品类别中的一类 质量特性是指产品、过程或体系与标准有关的固有特性。 “符合标准”就是合格的产品质量 不合格品控制时，请示领导决定是否可用 质量管理体系是为实现质量方针和质量目标而建立的管理工作系统 珍视顾客抱怨，把它作为我们研发产品、改善质量、提升服务的动力源泉 质量改进和质量控制都是为了保持产品质量稳定 当生产过程处于受控制状态时，产品质量就不会波动 质量控制是消除偶发性问题，使产品质量保持规定的水平 质量管理是指在质量方面指挥和控制组织的协调的活动</p>
        </details>
      </article>
    </div>
  </section>
  <section class="sqe-chapter csdn-section" id="csdn-第二章-软件质量">
    <h2>第二章 软件质量 <span style="font-size:14px;color:#667085">2 条</span></h2>
    <div class="csdn-grid">
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第二章 软件质量 6 课后习题 填空 SEI的Watts Humphrey认为软件质量是在 **实用性、需求、可靠性 **和 可维护性 等方面，达到优秀的水准。 用户要求在性能方面包含哪些质量特性：效率性、正确性、安全性、互操作性 用户要求在功能方面包含哪些质量特性：完整性、可靠性、生存性、可用性、便利性 软件质量的3维特性指的是... 填空 SEI的Watts Humphrey认为软件质量是在 **实用性、需求、可靠性 **和 可维护性 等方面，达到优秀的水准。 用户要求在性能方面包含哪些质量特性：效率性、正确性、安全性、互操作性 用户要求在功能方面包含哪些质量特性：完整性、可靠性、生存性、可用性、便利性 软件质量的3维特性指的是：功能性、可靠性、性能 软件质量的3A特性指的是：可说明性、有效性、易用性 软件质量的定义包含三个方面：软件 产品 的质量、软件 开发过程 的质量、软件在其 商业环境中 所表现的质量 ANSI/IEEE STD729给出了软件质量定义：软件产品满足规定的和隐含的与 需求能力 有关的全部特征和特性。 从外部看，软件缺陷是系统所需要实现的某种功能的 失效 或 违背 。 极限编程适合 小团队、高风险、快速变化或不稳定的需求、强调可测试性">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-028</span><span>6 课后习题</span></p>
        <p class="csdn-question">填空 SEI的Watts Humphrey认为软件质量是在 **实用性、需求、可靠性 **和 可维护性 等方面，达到优秀的水准。 用户要求在性能方面包含哪些质量特性：效率性、正确性、安全性、互操作性 用户要求在功能方面包含哪些质量特性：完整性、可靠性、生存性、可用性、便利性 软件质量的3维特性指的是...</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">填空 SEI的Watts Humphrey认为软件质量是在 **实用性、需求、可靠性 **和 可维护性 等方面，达到优秀的水准。 用户要求在性能方面包含哪些质量特性：效率性、正确性、安全性、互操作性 用户要求在功能方面包含哪些质量特性：完整性、可靠性、生存性、可用性、便利性 软件质量的3维特性指的是：功能性、可靠性、性能 软件质量的3A特性指的是：可说明性、有效性、易用性 软件质量的定义包含三个方面：软件 产品 的质量、软件 开发过程 的质量、软件在其 商业环境中 所表现的质量 ANSI/IEEE STD729给出了软件质量定义：软件产品满足规定的和隐含的与 需求能力 有关的全部特征和特性。 从外部看，软件缺陷是系统所需要实现的某种功能的 失效 或 违背 。 极限编程适合 小团队、高风险、快速变化或不稳定的需求、强调可测试性</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第二章 软件质量 6 课后习题 选择 据权威部门统计，软件错误产生的原因分布图表中，如下（ 软件需求规格说明错误 ）选项是导致软件错误的主要原因。 V 模型是具有代表意义的测试模型，以下理解正确的是（ V 模型造成需求分析阶段隐藏的问题一直到后期的验收测试才被发现 ）。 以下关于软件质量的说法中，错误的是（ 程序的正确性足以体现软... 选择 据权威部门统计，软件错误产生的原因分布图表中，如下（ 软件需求规格说明错误 ）选项是导致软件错误的主要原因。 V 模型是具有代表意义的测试模型，以下理解正确的是（ V 模型造成需求分析阶段隐藏的问题一直到后期的验收测试才被发现 ）。 以下关于软件质量的说法中，错误的是（ 程序的正确性足以体现软件的价值 ） 下列（ 产品的异常情况 ）是关于软件缺陷的描述。 不属于软件产品的质量的特殊性是：（ 软件的类型不同，但是软件质量的衡量标准的侧重点相同 ） 下列关于软件设计的说法不正确的是：（ 软件设计越复杂越好 ） 以下哪一种选项不属于软件缺陷（ 软件实现了产品规格说明所要求的功能但因受性能限制而未考虑可移植性问题 ） 下面有关软件缺陷的说法中错误的是（ 缺陷就是导致系统程序崩溃的错误 ）。 极限编程的主要特点有（ 简单的分析设计、频繁的客户交流、增量式开发和连续的测试 ）（以上全部） 以下关于软件可靠性与硬件的可靠性主要区别的说法中，正确的是（ 软件的每个拷贝都是完全一样的，而按照设计生产出来的同规格硬件总有微小差别 ）。 软件质量的含义是（ 能满足给定需要的特性之全体；具有所希望的各种属性的组合的程度；顾客或用户认为能满足其综合期望的程度；软件的组合特性，它确定软件在使用中将满足顾客预期要求的程度 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-029</span><span>6 课后习题</span></p>
        <p class="csdn-question">选择 据权威部门统计，软件错误产生的原因分布图表中，如下（ 软件需求规格说明错误 ）选项是导致软件错误的主要原因。 V 模型是具有代表意义的测试模型，以下理解正确的是（ V 模型造成需求分析阶段隐藏的问题一直到后期的验收测试才被发现 ）。 以下关于软件质量的说法中，错误的是（ 程序的正确性足以体现软...</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">选择 据权威部门统计，软件错误产生的原因分布图表中，如下（ 软件需求规格说明错误 ）选项是导致软件错误的主要原因。 V 模型是具有代表意义的测试模型，以下理解正确的是（ V 模型造成需求分析阶段隐藏的问题一直到后期的验收测试才被发现 ）。 以下关于软件质量的说法中，错误的是（ 程序的正确性足以体现软件的价值 ） 下列（ 产品的异常情况 ）是关于软件缺陷的描述。 不属于软件产品的质量的特殊性是：（ 软件的类型不同，但是软件质量的衡量标准的侧重点相同 ） 下列关于软件设计的说法不正确的是：（ 软件设计越复杂越好 ） 以下哪一种选项不属于软件缺陷（ 软件实现了产品规格说明所要求的功能但因受性能限制而未考虑可移植性问题 ） 下面有关软件缺陷的说法中错误的是（ 缺陷就是导致系统程序崩溃的错误 ）。 极限编程的主要特点有（ 简单的分析设计、频繁的客户交流、增量式开发和连续的测试 ）（以上全部） 以下关于软件可靠性与硬件的可靠性主要区别的说法中，正确的是（ 软件的每个拷贝都是完全一样的，而按照设计生产出来的同规格硬件总有微小差别 ）。 软件质量的含义是（ 能满足给定需要的特性之全体；具有所希望的各种属性的组合的程度；顾客或用户认为能满足其综合期望的程度；软件的组合特性，它确定软件在使用中将满足顾客预期要求的程度 ）</p>
        </details>
      </article>
    </div>
  </section>
  <section class="sqe-chapter csdn-section" id="csdn-第三章-软件质量工程体系">
    <h2>第三章 软件质量工程体系 <span style="font-size:14px;color:#667085">3 条</span></h2>
    <div class="csdn-grid">
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第三章 软件质量工程体系 7 课后习题 填空题： ISO9126将各种质属性归纳为6个质量特征，其中包括功能性、可靠性、可使用性、效率、可维护性、可移植性。 六西格玛模型分为界定、测量、分析、改进、控制等5个阶段。 IDEAL模型将质量改进过程划分为初始化、诊断、建立、行动、学习等5个阶段。 采用定量软件工程，制定软件产品质量的度量准则，... 填空题： ISO9126将各种质属性归纳为6个质量特征，其中包括功能性、可靠性、可使用性、效率、可维护性、可移植性。 六西格玛模型分为界定、测量、分析、改进、控制等5个阶段。 IDEAL模型将质量改进过程划分为初始化、诊断、建立、行动、学习等5个阶段。 采用定量软件工程，制定软件产品质量的度量准则，可以提高软件开发过程管理的可视性，降低劣质成本，提高软件产品的质量。 McCall模型产品修订纬度的质量因素有可维护性、灵活性、可测试性。 软件质量工程包括软件质量方针、软件质量控制、软件质量保证和软件质量管理四大方面。 软件的6个品质要素包括：正确性、可靠性、易用性、效率、可维护性、可移植性">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-030</span><span>7 课后习题</span></p>
        <p class="csdn-question">填空题： ISO9126将各种质属性归纳为6个质量特征，其中包括功能性、可靠性、可使用性、效率、可维护性、可移植性。 六西格玛模型分为界定、测量、分析、改进、控制等5个阶段。 IDEAL模型将质量改进过程划分为初始化、诊断、建立、行动、学习等5个阶段。 采用定量软件工程，制定软件产品质量的度量准则，...</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">填空题： ISO9126将各种质属性归纳为6个质量特征，其中包括功能性、可靠性、可使用性、效率、可维护性、可移植性。 六西格玛模型分为界定、测量、分析、改进、控制等5个阶段。 IDEAL模型将质量改进过程划分为初始化、诊断、建立、行动、学习等5个阶段。 采用定量软件工程，制定软件产品质量的度量准则，可以提高软件开发过程管理的可视性，降低劣质成本，提高软件产品的质量。 McCall模型产品修订纬度的质量因素有可维护性、灵活性、可测试性。 软件质量工程包括软件质量方针、软件质量控制、软件质量保证和软件质量管理四大方面。 软件的6个品质要素包括：正确性、可靠性、易用性、效率、可维护性、可移植性</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第三章 软件质量工程体系 7 课后习题 选择题： 软件工程概念的提出是由于（ 软件危机的出现 ） 系统可维护性的评价指标不包括（ 可移植性 ） 软件可移植性是用来衡量软件（ 质量 ）的重要尺度之一。 选择题： 软件工程概念的提出是由于（ 软件危机的出现 ） 系统可维护性的评价指标不包括（ 可移植性 ） 软件可移植性是用来衡量软件（ 质量 ）的重要尺度之一。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-031</span><span>7 课后习题</span></p>
        <p class="csdn-question">选择题： 软件工程概念的提出是由于（ 软件危机的出现 ） 系统可维护性的评价指标不包括（ 可移植性 ） 软件可移植性是用来衡量软件（ 质量 ）的重要尺度之一。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">选择题： 软件工程概念的提出是由于（ 软件危机的出现 ） 系统可维护性的评价指标不包括（ 可移植性 ） 软件可移植性是用来衡量软件（ 质量 ）的重要尺度之一。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第三章 软件质量工程体系 7 课后习题 判断题： 软件可靠性是指一个系统或组件在某个特定时期、特定条件下完成所需完成的功能的能力。 判断题： 软件可靠性是指一个系统或组件在某个特定时期、特定条件下完成所需完成的功能的能力。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-032</span><span>7 课后习题</span></p>
        <p class="csdn-question">判断题： 软件可靠性是指一个系统或组件在某个特定时期、特定条件下完成所需完成的功能的能力。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">判断题： 软件可靠性是指一个系统或组件在某个特定时期、特定条件下完成所需完成的功能的能力。</p>
        </details>
      </article>
    </div>
  </section>
  <section class="sqe-chapter csdn-section" id="csdn-第四章-软件质量度量">
    <h2>第四章 软件质量度量 <span style="font-size:14px;color:#667085">3 条</span></h2>
    <div class="csdn-grid">
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第四章 软件质量度量 8 课后习题 填空 语法构造方法计算缺陷率的公式是： 0.15 + 0.23 DO WHILE+ 0.22 SELECT+ 0.07 IF-THEN-ELSE 复杂度计算：线数 - 节点数 + 2，本次小测的结果为 4 软件项目度量的主要内容包括： 规模 度量、 复杂度 度量、 缺陷 度量、 进度 度量、 风险... 填空 语法构造方法计算缺陷率的公式是： 0.15 + 0.23 DO WHILE+ 0.22 SELECT+ 0.07 IF-THEN-ELSE 复杂度计算：线数 - 节点数 + 2，本次小测的结果为 4 软件项目度量的主要内容包括： 规模 度量、 复杂度 度量、 缺陷 度量、 进度 度量、 风险 度量、 工作量 度量以及其他一些度量项目。 软件质量度量按其研究对像可分为3类： 项目 质量度量、 产品 质量度量、 过程 质量度量 有效 性和 可靠 性是测量标准中最重要的指标。 课堂上提到的度量尺度包括 分类 尺度、 序列 尺度 、 间隔 尺度、 比值 尺度。 度量是对软件产品进行范围广泛的测度，它给出一个系统、构件或过程的某个给定属性的度的 定量测量 测量是对产品过程的某个属性的范围、数量、维度、容量或大小提供一个 定量的指示 。 软件产品度量包括软件 规模大小 、 产品复杂度 、 设计特征 、 性能 以及 质量水平 。 度量 是对软件产品进行范围广泛的测度，它给出一个系统、构件或过程的某个给定属性的度的定量测量。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-033</span><span>8 课后习题</span></p>
        <p class="csdn-question">填空 语法构造方法计算缺陷率的公式是： 0.15 + 0.23 DO WHILE+ 0.22 SELECT+ 0.07 IF-THEN-ELSE 复杂度计算：线数 - 节点数 + 2，本次小测的结果为 4 软件项目度量的主要内容包括： 规模 度量、 复杂度 度量、 缺陷 度量、 进度 度量、 风险...</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">填空 语法构造方法计算缺陷率的公式是： 0.15 + 0.23 DO WHILE+ 0.22 SELECT+ 0.07 IF-THEN-ELSE 复杂度计算：线数 - 节点数 + 2，本次小测的结果为 4 软件项目度量的主要内容包括： 规模 度量、 复杂度 度量、 缺陷 度量、 进度 度量、 风险 度量、 工作量 度量以及其他一些度量项目。 软件质量度量按其研究对像可分为3类： 项目 质量度量、 产品 质量度量、 过程 质量度量 有效 性和 可靠 性是测量标准中最重要的指标。 课堂上提到的度量尺度包括 分类 尺度、 序列 尺度 、 间隔 尺度、 比值 尺度。 度量是对软件产品进行范围广泛的测度，它给出一个系统、构件或过程的某个给定属性的度的 定量测量 测量是对产品过程的某个属性的范围、数量、维度、容量或大小提供一个 定量的指示 。 软件产品度量包括软件 规模大小 、 产品复杂度 、 设计特征 、 性能 以及 质量水平 。 度量 是对软件产品进行范围广泛的测度，它给出一个系统、构件或过程的某个给定属性的度的定量测量。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第四章 软件质量度量 8 课后习题 选择 假设在程序控制流图中，有14 条边，10个节点，则控制流程图的环路复杂性V(G)等于（ 6 ）。 修复软件缺陷费用最高的是（ 发布 ）阶段。 选择 假设在程序控制流图中，有14 条边，10个节点，则控制流程图的环路复杂性V(G)等于（ 6 ）。 修复软件缺陷费用最高的是（ 发布 ）阶段。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-034</span><span>8 课后习题</span></p>
        <p class="csdn-question">选择 假设在程序控制流图中，有14 条边，10个节点，则控制流程图的环路复杂性V(G)等于（ 6 ）。 修复软件缺陷费用最高的是（ 发布 ）阶段。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">选择 假设在程序控制流图中，有14 条边，10个节点，则控制流程图的环路复杂性V(G)等于（ 6 ）。 修复软件缺陷费用最高的是（ 发布 ）阶段。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第四章 软件质量度量 8 课后习题 判断 质量是反映软件与需求相符程度的指标，而缺陷被认为是软件与需求不一致的某种表现。 McCabe度量、语法构造方法只适合独立模块内部进行测量，不能考虑系统各个模块间相互耦合的关系。 软件度量应基于分析模型、设计模型或程序本身的结构进行，而独立于编程语言的句法和语法之外。 测量的目标是不断提高有效性... 判断 质量是反映软件与需求相符程度的指标，而缺陷被认为是软件与需求不一致的某种表现。 McCabe度量、语法构造方法只适合独立模块内部进行测量，不能考虑系统各个模块间相互耦合的关系。 软件度量应基于分析模型、设计模型或程序本身的结构进行，而独立于编程语言的句法和语法之外。 测量的目标是不断提高有效性和可靠性，测量可以避免出现偏差或误差。 可靠性差一般意味着测量方法在技术上有待改进。 有效性差一般意味着测量方法在原则性上有错误。 度量是为了获取指标评估量化结果的重要手段和方法。 软件度量具有相对性强，绝对性弱的特点。 软件质量度量就是用来衡量软件质量控制和保证的过程和结果的。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-035</span><span>8 课后习题</span></p>
        <p class="csdn-question">判断 质量是反映软件与需求相符程度的指标，而缺陷被认为是软件与需求不一致的某种表现。 McCabe度量、语法构造方法只适合独立模块内部进行测量，不能考虑系统各个模块间相互耦合的关系。 软件度量应基于分析模型、设计模型或程序本身的结构进行，而独立于编程语言的句法和语法之外。 测量的目标是不断提高有效性...</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">判断 质量是反映软件与需求相符程度的指标，而缺陷被认为是软件与需求不一致的某种表现。 McCabe度量、语法构造方法只适合独立模块内部进行测量，不能考虑系统各个模块间相互耦合的关系。 软件度量应基于分析模型、设计模型或程序本身的结构进行，而独立于编程语言的句法和语法之外。 测量的目标是不断提高有效性和可靠性，测量可以避免出现偏差或误差。 可靠性差一般意味着测量方法在技术上有待改进。 有效性差一般意味着测量方法在原则性上有错误。 度量是为了获取指标评估量化结果的重要手段和方法。 软件度量具有相对性强，绝对性弱的特点。 软件质量度量就是用来衡量软件质量控制和保证的过程和结果的。</p>
        </details>
      </article>
    </div>
  </section>
  <section class="sqe-chapter csdn-section" id="csdn-第五章-软件质量标准">
    <h2>第五章 软件质量标准 <span style="font-size:14px;color:#667085">3 条</span></h2>
    <div class="csdn-grid">
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第五章 软件质量标准 3 课后习题 填空 CMMI的内容主要有3个级别： 必需 的、 期望 的以及 提供信息 的。 CMM为软件过程改进提供了一个框架，将整个软件改进过程分为 5 （请填写阿拉伯数字）个成熟度等级。 CMM的意义不仅仅是对软件开发的过程进程控制，还是一种高效的管理方法，有助于企业最大程度的 降低成本 ， 提高质量 和... 填空 CMMI的内容主要有3个级别： 必需 的、 期望 的以及 提供信息 的。 CMM为软件过程改进提供了一个框架，将整个软件改进过程分为 5 （请填写阿拉伯数字）个成熟度等级。 CMM的意义不仅仅是对软件开发的过程进程控制，还是一种高效的管理方法，有助于企业最大程度的 降低成本 ， 提高质量 和 用户满意度 。 根据软件工程标准制定的机构和标准适用的范围，可将其分为5个级别，即 国际标准 、 国家标准 、 行业标准 、 企业规范 及 项目规范 。 CMM将整个软件改进过程分为 初始级 、 可重复级 、 已定义级 、 已管理级 、 优化级 等5个成熟度等级。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-036</span><span>3 课后习题</span></p>
        <p class="csdn-question">填空 CMMI的内容主要有3个级别： 必需 的、 期望 的以及 提供信息 的。 CMM为软件过程改进提供了一个框架，将整个软件改进过程分为 5 （请填写阿拉伯数字）个成熟度等级。 CMM的意义不仅仅是对软件开发的过程进程控制，还是一种高效的管理方法，有助于企业最大程度的 降低成本 ， 提高质量 和...</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">填空 CMMI的内容主要有3个级别： 必需 的、 期望 的以及 提供信息 的。 CMM为软件过程改进提供了一个框架，将整个软件改进过程分为 5 （请填写阿拉伯数字）个成熟度等级。 CMM的意义不仅仅是对软件开发的过程进程控制，还是一种高效的管理方法，有助于企业最大程度的 降低成本 ， 提高质量 和 用户满意度 。 根据软件工程标准制定的机构和标准适用的范围，可将其分为5个级别，即 国际标准 、 国家标准 、 行业标准 、 企业规范 及 项目规范 。 CMM将整个软件改进过程分为 初始级 、 可重复级 、 已定义级 、 已管理级 、 优化级 等5个成熟度等级。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第五章 软件质量标准 3 课后习题 选择 软件设计需要注意哪些问题：（ 减少耦合；代码重用；功能分解 ） 根据CMMI规范，每一个软件企业均具有（ 等级一 ）成熟度。 cmm 模型将软件过程的成熟度分为 5 个等级，在（ 管理级 ）使用定量分析来不断地改进和管理软件过程。 选择 软件设计需要注意哪些问题：（ 减少耦合；代码重用；功能分解 ） 根据CMMI规范，每一个软件企业均具有（ 等级一 ）成熟度。 cmm 模型将软件过程的成熟度分为 5 个等级，在（ 管理级 ）使用定量分析来不断地改进和管理软件过程。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-037</span><span>3 课后习题</span></p>
        <p class="csdn-question">选择 软件设计需要注意哪些问题：（ 减少耦合；代码重用；功能分解 ） 根据CMMI规范，每一个软件企业均具有（ 等级一 ）成熟度。 cmm 模型将软件过程的成熟度分为 5 个等级，在（ 管理级 ）使用定量分析来不断地改进和管理软件过程。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">选择 软件设计需要注意哪些问题：（ 减少耦合；代码重用；功能分解 ） 根据CMMI规范，每一个软件企业均具有（ 等级一 ）成熟度。 cmm 模型将软件过程的成熟度分为 5 个等级，在（ 管理级 ）使用定量分析来不断地改进和管理软件过程。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第五章 软件质量标准 3 课后习题 判断 软件过程能力成熟度是指一个特定过程被明确定义、管理、测量、控制并且是有效的程度。 为了达到一个成熟度等级，必须实现该等级上的全部关键过程区域。 优化级说明已管理的过程，定义了评估软件过程和产品质量的度量。利用此度量对软件过程和产品做出推断和控制。 判断 软件过程能力成熟度是指一个特定过程被明确定义、管理、测量、控制并且是有效的程度。 为了达到一个成熟度等级，必须实现该等级上的全部关键过程区域。 优化级说明已管理的过程，定义了评估软件过程和产品质量的度量。利用此度量对软件过程和产品做出推断和控制。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-038</span><span>3 课后习题</span></p>
        <p class="csdn-question">判断 软件过程能力成熟度是指一个特定过程被明确定义、管理、测量、控制并且是有效的程度。 为了达到一个成熟度等级，必须实现该等级上的全部关键过程区域。 优化级说明已管理的过程，定义了评估软件过程和产品质量的度量。利用此度量对软件过程和产品做出推断和控制。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">判断 软件过程能力成熟度是指一个特定过程被明确定义、管理、测量、控制并且是有效的程度。 为了达到一个成熟度等级，必须实现该等级上的全部关键过程区域。 优化级说明已管理的过程，定义了评估软件过程和产品质量的度量。利用此度量对软件过程和产品做出推断和控制。</p>
        </details>
      </article>
    </div>
  </section>
  <section class="sqe-chapter csdn-section" id="csdn-第六章-软件评审">
    <h2>第六章 软件评审 <span style="font-size:14px;color:#667085">26 条</span></h2>
    <div class="csdn-grid">
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第六章 软件评审 7 课后习题 / 填空题 评审的方法包括 临时评审 、 轮查 、 走查 、 小组评审 、 审查 评审的方法包括 临时评审 、 轮查 、 走查 、 小组评审 、 审查">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-039</span><span>7 课后习题 / 填空题</span></p>
        <p class="csdn-question">评审的方法包括 临时评审 、 轮查 、 走查 、 小组评审 、 审查</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">评审的方法包括 临时评审 、 轮查 、 走查 、 小组评审 、 审查</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第六章 软件评审 7 课后习题 / 填空题 管理评审要求各部门对管理体系目前的状况，包括 适宜 性、 有效 性、 充分 性等进行评审。 管理评审要求各部门对管理体系目前的状况，包括 适宜 性、 有效 性、 充分 性等进行评审。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-040</span><span>7 课后习题 / 填空题</span></p>
        <p class="csdn-question">管理评审要求各部门对管理体系目前的状况，包括 适宜 性、 有效 性、 充分 性等进行评审。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">管理评审要求各部门对管理体系目前的状况，包括 适宜 性、 有效 性、 充分 性等进行评审。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第六章 软件评审 7 课后习题 / 填空题 管理评审由 最高管理者 发起 管理评审由 最高管理者 发起">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-041</span><span>7 课后习题 / 填空题</span></p>
        <p class="csdn-question">管理评审由 最高管理者 发起</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">管理评审由 最高管理者 发起</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第六章 软件评审 7 课后习题 / 选择题 评审会议的主要步骤如下：（ 由评审员/作者进行演示或说明；评审员会就不清楚或疑惑的地方与作者进行沟通；协调人或记录员在会议过程中完成会议记录 ） 评审会议的主要步骤如下：（ 由评审员/作者进行演示或说明；评审员会就不清楚或疑惑的地方与作者进行沟通；协调人或记录员在会议过程中完成会议记录 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-042</span><span>7 课后习题 / 选择题</span></p>
        <p class="csdn-question">评审会议的主要步骤如下：（ 由评审员/作者进行演示或说明；评审员会就不清楚或疑惑的地方与作者进行沟通；协调人或记录员在会议过程中完成会议记录 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">评审会议的主要步骤如下：（ 由评审员/作者进行演示或说明；评审员会就不清楚或疑惑的地方与作者进行沟通；协调人或记录员在会议过程中完成会议记录 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第六章 软件评审 7 课后习题 / 选择题 以下哪些资料应当评审：（ 基础性和早期的文档；与重大决策有关的文档；对如何做没有把握部分相关的文档；不断被重复使用部件相关的文档 ） 以下哪些资料应当评审：（ 基础性和早期的文档；与重大决策有关的文档；对如何做没有把握部分相关的文档；不断被重复使用部件相关的文档 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-043</span><span>7 课后习题 / 选择题</span></p>
        <p class="csdn-question">以下哪些资料应当评审：（ 基础性和早期的文档；与重大决策有关的文档；对如何做没有把握部分相关的文档；不断被重复使用部件相关的文档 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">以下哪些资料应当评审：（ 基础性和早期的文档；与重大决策有关的文档；对如何做没有把握部分相关的文档；不断被重复使用部件相关的文档 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第六章 软件评审 7 课后习题 / 选择题 对评审组长的要求如下：（ 善于制定和执行评审计划；评审是公平、公正的；具有丰富的技术技能和知识；积极带领评审组员按时保质的完成评审任务 ） 对评审组长的要求如下：（ 善于制定和执行评审计划；评审是公平、公正的；具有丰富的技术技能和知识；积极带领评审组员按时保质的完成评审任务 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-044</span><span>7 课后习题 / 选择题</span></p>
        <p class="csdn-question">对评审组长的要求如下：（ 善于制定和执行评审计划；评审是公平、公正的；具有丰富的技术技能和知识；积极带领评审组员按时保质的完成评审任务 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">对评审组长的要求如下：（ 善于制定和执行评审计划；评审是公平、公正的；具有丰富的技术技能和知识；积极带领评审组员按时保质的完成评审任务 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第六章 软件评审 7 课后习题 / 选择题 过程评审作用如下：（ 评估主要的质量保证流程；考虑如何处理和解决评审过程中发现的不符合问题；总结和共享好的经验；指出需要进一步完善和改进的部分 ） 过程评审作用如下：（ 评估主要的质量保证流程；考虑如何处理和解决评审过程中发现的不符合问题；总结和共享好的经验；指出需要进一步完善和改进的部分 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-045</span><span>7 课后习题 / 选择题</span></p>
        <p class="csdn-question">过程评审作用如下：（ 评估主要的质量保证流程；考虑如何处理和解决评审过程中发现的不符合问题；总结和共享好的经验；指出需要进一步完善和改进的部分 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">过程评审作用如下：（ 评估主要的质量保证流程；考虑如何处理和解决评审过程中发现的不符合问题；总结和共享好的经验；指出需要进一步完善和改进的部分 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第六章 软件评审 7 课后习题 / 选择题 过程评审是（ 对软件开发过程的评审；通过对流程的监控，保证SQA组织定义的软件过程在项目中得到了遵循；保证质量保证方针能得到更快更好的执行 ） 过程评审是（ 对软件开发过程的评审；通过对流程的监控，保证SQA组织定义的软件过程在项目中得到了遵循；保证质量保证方针能得到更快更好的执行 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-046</span><span>7 课后习题 / 选择题</span></p>
        <p class="csdn-question">过程评审是（ 对软件开发过程的评审；通过对流程的监控，保证SQA组织定义的软件过程在项目中得到了遵循；保证质量保证方针能得到更快更好的执行 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">过程评审是（ 对软件开发过程的评审；通过对流程的监控，保证SQA组织定义的软件过程在项目中得到了遵循；保证质量保证方针能得到更快更好的执行 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第六章 软件评审 7 课后习题 / 选择题 技术评审作为一项软件质量保证活动，作用如下：（ 揭示软件在逻辑、执行以及功能和函数上的错误；验证软件是否符合需求；确保软件的一致性 ） 技术评审作为一项软件质量保证活动，作用如下：（ 揭示软件在逻辑、执行以及功能和函数上的错误；验证软件是否符合需求；确保软件的一致性 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-047</span><span>7 课后习题 / 选择题</span></p>
        <p class="csdn-question">技术评审作为一项软件质量保证活动，作用如下：（ 揭示软件在逻辑、执行以及功能和函数上的错误；验证软件是否符合需求；确保软件的一致性 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">技术评审作为一项软件质量保证活动，作用如下：（ 揭示软件在逻辑、执行以及功能和函数上的错误；验证软件是否符合需求；确保软件的一致性 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第六章 软件评审 7 课后习题 / 选择题 评审小组一般由以下角色构成（ 协调人；作者；评审员 ） 评审小组一般由以下角色构成（ 协调人；作者；评审员 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-048</span><span>7 课后习题 / 选择题</span></p>
        <p class="csdn-question">评审小组一般由以下角色构成（ 协调人；作者；评审员 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">评审小组一般由以下角色构成（ 协调人；作者；评审员 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第六章 软件评审 7 课后习题 / 选择题 评审可以帮助开发工程师（ 减少修订缺陷的时间；提高编程效率；减少测试和调试时间 ） 评审可以帮助开发工程师（ 减少修订缺陷的时间；提高编程效率；减少测试和调试时间 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-049</span><span>7 课后习题 / 选择题</span></p>
        <p class="csdn-question">评审可以帮助开发工程师（ 减少修订缺陷的时间；提高编程效率；减少测试和调试时间 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">评审可以帮助开发工程师（ 减少修订缺陷的时间；提高编程效率；减少测试和调试时间 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第六章 软件评审 7 课后习题 / 选择题 软件评审作为质量控制的一个重要手段，已经被业界广泛使用。评审分为内部评审和外部评审。关于内部评审的叙述，正确的包括。①对软件的每个开发阶段都要进行内部评审②评审人员由软件开发组、质量管理和配置管理人员组成，可邀请用户参与③评审人数根据实际情况确定，比如根据软件的规模等级和安全性等级等指标而定④内部评... 软件评审作为质量控制的一个重要手段，已经被业界广泛使用。评审分为内部评审和外部评审。关于内部评审的叙述，正确的包括。①对软件的每个开发阶段都要进行内部评审②评审人员由软件开发组、质量管理和配置管理人员组成，可邀请用户参与③评审人数根据实际情况确定，比如根据软件的规模等级和安全性等级等指标而定④内部评审由用户单位主持，由信息系统建设单位组织，应成立评审委员会（ ①②③ ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-050</span><span>7 课后习题 / 选择题</span></p>
        <p class="csdn-question">软件评审作为质量控制的一个重要手段，已经被业界广泛使用。评审分为内部评审和外部评审。关于内部评审的叙述，正确的包括。①对软件的每个开发阶段都要进行内部评审②评审人员由软件开发组、质量管理和配置管理人员组成，可邀请用户参与③评审人数根据实际情况确定，比如根据软件的规模等级和安全性等级等指标而定④内部评...</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">软件评审作为质量控制的一个重要手段，已经被业界广泛使用。评审分为内部评审和外部评审。关于内部评审的叙述，正确的包括。①对软件的每个开发阶段都要进行内部评审②评审人员由软件开发组、质量管理和配置管理人员组成，可邀请用户参与③评审人数根据实际情况确定，比如根据软件的规模等级和安全性等级等指标而定④内部评审由用户单位主持，由信息系统建设单位组织，应成立评审委员会（ ①②③ ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第六章 软件评审 7 课后习题 / 选择题 在软件设计中，设计复审是和软件设计本身一样重要的环节，其主要的目的和作用是为了能够（ 避免后期付出高代价 ） 在软件设计中，设计复审是和软件设计本身一样重要的环节，其主要的目的和作用是为了能够（ 避免后期付出高代价 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-051</span><span>7 课后习题 / 选择题</span></p>
        <p class="csdn-question">在软件设计中，设计复审是和软件设计本身一样重要的环节，其主要的目的和作用是为了能够（ 避免后期付出高代价 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">在软件设计中，设计复审是和软件设计本身一样重要的环节，其主要的目的和作用是为了能够（ 避免后期付出高代价 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第六章 软件评审 7 课后习题 / 选择题 软件测试计划评审会需要哪些人员参加？（ 项目经理；SQA负责人；配置负责人；测试组 ） 软件测试计划评审会需要哪些人员参加？（ 项目经理；SQA负责人；配置负责人；测试组 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-052</span><span>7 课后习题 / 选择题</span></p>
        <p class="csdn-question">软件测试计划评审会需要哪些人员参加？（ 项目经理；SQA负责人；配置负责人；测试组 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">软件测试计划评审会需要哪些人员参加？（ 项目经理；SQA负责人；配置负责人；测试组 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第六章 软件评审 7 课后习题 / 判断题 发现缺陷的平均成本不应该超过该缺陷遗留给客户的商业成本。 发现缺陷的平均成本不应该超过该缺陷遗留给客户的商业成本。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-053</span><span>7 课后习题 / 判断题</span></p>
        <p class="csdn-question">发现缺陷的平均成本不应该超过该缺陷遗留给客户的商业成本。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">发现缺陷的平均成本不应该超过该缺陷遗留给客户的商业成本。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第六章 软件评审 7 课后习题 / 判断题 评审报告可以看作是评审会结束的标志。 评审报告可以看作是评审会结束的标志。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-054</span><span>7 课后习题 / 判断题</span></p>
        <p class="csdn-question">评审报告可以看作是评审会结束的标志。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">评审报告可以看作是评审会结束的标志。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第六章 软件评审 7 课后习题 / 判断题 规则集列出了容易出现的典型错误，是评审的一个重要组成部分。 规则集列出了容易出现的典型错误，是评审的一个重要组成部分。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-055</span><span>7 课后习题 / 判断题</span></p>
        <p class="csdn-question">规则集列出了容易出现的典型错误，是评审的一个重要组成部分。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">规则集列出了容易出现的典型错误，是评审的一个重要组成部分。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第六章 软件评审 7 课后习题 / 判断题 过程评审的评审对象是质量保证流程，以及针对产品质量或其他形式的工作产出。 过程评审的评审对象是质量保证流程，以及针对产品质量或其他形式的工作产出。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-056</span><span>7 课后习题 / 判断题</span></p>
        <p class="csdn-question">过程评审的评审对象是质量保证流程，以及针对产品质量或其他形式的工作产出。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">过程评审的评审对象是质量保证流程，以及针对产品质量或其他形式的工作产出。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第六章 软件评审 7 课后习题 / 判断题 文档评审分为格式评审和内容评审。 文档评审分为格式评审和内容评审。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-057</span><span>7 课后习题 / 判断题</span></p>
        <p class="csdn-question">文档评审分为格式评审和内容评审。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">文档评审分为格式评审和内容评审。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第六章 软件评审 7 课后习题 / 判断题 管理评审是对产品以及各阶段的输出内容进行评估。 管理评审是对产品以及各阶段的输出内容进行评估。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-058</span><span>7 课后习题 / 判断题</span></p>
        <p class="csdn-question">管理评审是对产品以及各阶段的输出内容进行评估。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">管理评审是对产品以及各阶段的输出内容进行评估。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第六章 软件评审 7 课后习题 / 判断题 管理者、开发人员、客户有时都反对评审，因为评审会浪费时间，减缓项目的进度。 管理者、开发人员、客户有时都反对评审，因为评审会浪费时间，减缓项目的进度。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-059</span><span>7 课后习题 / 判断题</span></p>
        <p class="csdn-question">管理者、开发人员、客户有时都反对评审，因为评审会浪费时间，减缓项目的进度。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">管理者、开发人员、客户有时都反对评审，因为评审会浪费时间，减缓项目的进度。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第六章 软件评审 7 课后习题 / 判断题 评审是对软件元素或者项目状态的一种评估手段。 评审是对软件元素或者项目状态的一种评估手段。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-060</span><span>7 课后习题 / 判断题</span></p>
        <p class="csdn-question">评审是对软件元素或者项目状态的一种评估手段。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">评审是对软件元素或者项目状态的一种评估手段。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第六章 软件评审 7 课后习题 / 判断题 评审是质量控制方面一种非常有效的方法。 评审是质量控制方面一种非常有效的方法。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-061</span><span>7 课后习题 / 判断题</span></p>
        <p class="csdn-question">评审是质量控制方面一种非常有效的方法。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">评审是质量控制方面一种非常有效的方法。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第六章 软件评审 7 课后习题 / 判断题 同行评审的主要目标在于检测错误、核对与标准的偏离。 同行评审的主要目标在于检测错误、核对与标准的偏离。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-062</span><span>7 课后习题 / 判断题</span></p>
        <p class="csdn-question">同行评审的主要目标在于检测错误、核对与标准的偏离。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">同行评审的主要目标在于检测错误、核对与标准的偏离。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第六章 软件评审 7 课后习题 / 判断题 代码评审是检查源代码是否达到模块设计的要求。 代码评审是检查源代码是否达到模块设计的要求。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-063</span><span>7 课后习题 / 判断题</span></p>
        <p class="csdn-question">代码评审是检查源代码是否达到模块设计的要求。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">代码评审是检查源代码是否达到模块设计的要求。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第六章 软件评审 7 课后习题 / 判断题 技术评审即是一种技术手段，也是一种质量管理手段。 技术评审即是一种技术手段，也是一种质量管理手段。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-064</span><span>7 课后习题 / 判断题</span></p>
        <p class="csdn-question">技术评审即是一种技术手段，也是一种质量管理手段。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">技术评审即是一种技术手段，也是一种质量管理手段。</p>
        </details>
      </article>
    </div>
  </section>
  <section class="sqe-chapter csdn-section" id="csdn-第七章-SQA组织">
    <h2>第七章 SQA组织 <span style="font-size:14px;color:#667085">18 条</span></h2>
    <div class="csdn-grid">
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第七章 SQA组织 6 课后习题 / 填空题 为了保证项目组能够采用合适的技术和工具，我们应该进行 软件工具的评估 为了保证项目组能够采用合适的技术和工具，我们应该进行 软件工具的评估">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-065</span><span>6 课后习题 / 填空题</span></p>
        <p class="csdn-question">为了保证项目组能够采用合适的技术和工具，我们应该进行 软件工具的评估</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">为了保证项目组能够采用合适的技术和工具，我们应该进行 软件工具的评估</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第七章 SQA组织 6 课后习题 / 填空题 六西格玛组织结构从上到下分为 倡导者 、 黑带主管(大师)、 黑带 、 绿带 。 六西格玛组织结构从上到下分为 倡导者 、 黑带主管(大师)、 黑带 、 绿带 。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-066</span><span>6 课后习题 / 填空题</span></p>
        <p class="csdn-question">六西格玛组织结构从上到下分为 倡导者 、 黑带主管(大师)、 黑带 、 绿带 。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">六西格玛组织结构从上到下分为 倡导者 、 黑带主管(大师)、 黑带 、 绿带 。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第七章 SQA组织 6 课后习题 / 填空题 项目的进度管理 是一个动态的过程，需要不断调度、协调，保证项目的均衡发展。 项目的进度管理 是一个动态的过程，需要不断调度、协调，保证项目的均衡发展。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-067</span><span>6 课后习题 / 填空题</span></p>
        <p class="csdn-question">项目的进度管理 是一个动态的过程，需要不断调度、协调，保证项目的均衡发展。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">项目的进度管理 是一个动态的过程，需要不断调度、协调，保证项目的均衡发展。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第七章 SQA组织 6 课后习题 / 选择题 SQA计划实施步骤的第一步是（ 了解项目的需求，明确项目SQA计划的要求和范围 ） SQA计划实施步骤的第一步是（ 了解项目的需求，明确项目SQA计划的要求和范围 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-068</span><span>6 课后习题 / 选择题</span></p>
        <p class="csdn-question">SQA计划实施步骤的第一步是（ 了解项目的需求，明确项目SQA计划的要求和范围 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">SQA计划实施步骤的第一步是（ 了解项目的需求，明确项目SQA计划的要求和范围 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第七章 SQA组织 6 课后习题 / 选择题 以下三种组织结构中，哪种相对完善一些（ 独立的SQA工程师（独立的SQA小组） ） 以下三种组织结构中，哪种相对完善一些（ 独立的SQA工程师（独立的SQA小组） ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-069</span><span>6 课后习题 / 选择题</span></p>
        <p class="csdn-question">以下三种组织结构中，哪种相对完善一些（ 独立的SQA工程师（独立的SQA小组） ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">以下三种组织结构中，哪种相对完善一些（ 独立的SQA工程师（独立的SQA小组） ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第七章 SQA组织 6 课后习题 / 选择题 以下属于独立SQA部门优点的是：（ 保护SQA工程师的独立性和客观性；有利于资源的共享 ） 以下属于独立SQA部门优点的是：（ 保护SQA工程师的独立性和客观性；有利于资源的共享 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-070</span><span>6 课后习题 / 选择题</span></p>
        <p class="csdn-question">以下属于独立SQA部门优点的是：（ 保护SQA工程师的独立性和客观性；有利于资源的共享 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">以下属于独立SQA部门优点的是：（ 保护SQA工程师的独立性和客观性；有利于资源的共享 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第七章 SQA组织 6 课后习题 / 选择题 在企业中，最常见的质量保证组织是（ 软件测试部门；软件质量保证组织 ） 在企业中，最常见的质量保证组织是（ 软件测试部门；软件质量保证组织 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-071</span><span>6 课后习题 / 选择题</span></p>
        <p class="csdn-question">在企业中，最常见的质量保证组织是（ 软件测试部门；软件质量保证组织 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">在企业中，最常见的质量保证组织是（ 软件测试部门；软件质量保证组织 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第七章 SQA组织 6 课后习题 / 判断题 审核是对工作流程的评审，而评审则主要侧重产品本身。 审核是对工作流程的评审，而评审则主要侧重产品本身。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-072</span><span>6 课后习题 / 判断题</span></p>
        <p class="csdn-question">审核是对工作流程的评审，而评审则主要侧重产品本身。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">审核是对工作流程的评审，而评审则主要侧重产品本身。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第七章 SQA组织 6 课后习题 / 判断题 SQA人员与开发工程师本质上是对立的。 SQA人员与开发工程师本质上是对立的。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-073</span><span>6 课后习题 / 判断题</span></p>
        <p class="csdn-question">SQA人员与开发工程师本质上是对立的。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">SQA人员与开发工程师本质上是对立的。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第七章 SQA组织 6 课后习题 / 判断题 为了让SQA人员可以全心投入本职工作，所以SQA人员必须是全职的。 为了让SQA人员可以全心投入本职工作，所以SQA人员必须是全职的。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-074</span><span>6 课后习题 / 判断题</span></p>
        <p class="csdn-question">为了让SQA人员可以全心投入本职工作，所以SQA人员必须是全职的。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">为了让SQA人员可以全心投入本职工作，所以SQA人员必须是全职的。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第七章 SQA组织 6 课后习题 / 判断题 创建SQA部门的时候，与企业本身实际相比，更重要的是参考业界流行的各种标准（如ISO、CMMI等）。 创建SQA部门的时候，与企业本身实际相比，更重要的是参考业界流行的各种标准（如ISO、CMMI等）。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-075</span><span>6 课后习题 / 判断题</span></p>
        <p class="csdn-question">创建SQA部门的时候，与企业本身实际相比，更重要的是参考业界流行的各种标准（如ISO、CMMI等）。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">创建SQA部门的时候，与企业本身实际相比，更重要的是参考业界流行的各种标准（如ISO、CMMI等）。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第七章 SQA组织 6 课后习题 / 判断题 软件工程过程组类似于一个“立法”机构，而SQA则类似于一个“监督”机构。 软件工程过程组类似于一个“立法”机构，而SQA则类似于一个“监督”机构。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-076</span><span>6 课后习题 / 判断题</span></p>
        <p class="csdn-question">软件工程过程组类似于一个“立法”机构，而SQA则类似于一个“监督”机构。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">软件工程过程组类似于一个“立法”机构，而SQA则类似于一个“监督”机构。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第七章 SQA组织 6 课后习题 / 判断题 任何不符合客户需求的地方都可以认为是缺陷。 任何不符合客户需求的地方都可以认为是缺陷。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-077</span><span>6 课后习题 / 判断题</span></p>
        <p class="csdn-question">任何不符合客户需求的地方都可以认为是缺陷。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">任何不符合客户需求的地方都可以认为是缺陷。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第七章 SQA组织 6 课后习题 / 判断题 所有SQA活动和项目里程碑的完成或项目里程碑的检验是同时发生的。 所有SQA活动和项目里程碑的完成或项目里程碑的检验是同时发生的。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-078</span><span>6 课后习题 / 判断题</span></p>
        <p class="csdn-question">所有SQA活动和项目里程碑的完成或项目里程碑的检验是同时发生的。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">所有SQA活动和项目里程碑的完成或项目里程碑的检验是同时发生的。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第七章 SQA组织 6 课后习题 / 判断题 在整个机构中使用基础设施防护与改进部件的主要目标是在机构积累的SQA经验基础上消除或至少降低出错率。 在整个机构中使用基础设施防护与改进部件的主要目标是在机构积累的SQA经验基础上消除或至少降低出错率。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-079</span><span>6 课后习题 / 判断题</span></p>
        <p class="csdn-question">在整个机构中使用基础设施防护与改进部件的主要目标是在机构积累的SQA经验基础上消除或至少降低出错率。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">在整个机构中使用基础设施防护与改进部件的主要目标是在机构积累的SQA经验基础上消除或至少降低出错率。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第七章 SQA组织 6 课后习题 / 判断题 软件质量系统之间各不相同，说明机构SQA系统构建存在固有灵活性。 软件质量系统之间各不相同，说明机构SQA系统构建存在固有灵活性。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-080</span><span>6 课后习题 / 判断题</span></p>
        <p class="csdn-question">软件质量系统之间各不相同，说明机构SQA系统构建存在固有灵活性。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">软件质量系统之间各不相同，说明机构SQA系统构建存在固有灵活性。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第七章 SQA组织 6 课后习题 / 判断题 SQA组织负责生产高质量的软件产品和制定质量计划，责任是审计软件经理和软件工程组的质量活动并鉴别活动中出现的偏差。 SQA组织负责生产高质量的软件产品和制定质量计划，责任是审计软件经理和软件工程组的质量活动并鉴别活动中出现的偏差。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-081</span><span>6 课后习题 / 判断题</span></p>
        <p class="csdn-question">SQA组织负责生产高质量的软件产品和制定质量计划，责任是审计软件经理和软件工程组的质量活动并鉴别活动中出现的偏差。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">SQA组织负责生产高质量的软件产品和制定质量计划，责任是审计软件经理和软件工程组的质量活动并鉴别活动中出现的偏差。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第七章 SQA组织 6 课后习题 / 判断题 在软件产品制定生产计划阶段,不必进行重大的SQA活动。 在软件产品制定生产计划阶段,不必进行重大的SQA活动。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-082</span><span>6 课后习题 / 判断题</span></p>
        <p class="csdn-question">在软件产品制定生产计划阶段,不必进行重大的SQA活动。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">在软件产品制定生产计划阶段,不必进行重大的SQA活动。</p>
        </details>
      </article>
    </div>
  </section>
  <section class="sqe-chapter csdn-section" id="csdn-第八章-提高软件设计质量">
    <h2>第八章 提高软件设计质量 <span style="font-size:14px;color:#667085">25 条</span></h2>
    <div class="csdn-grid">
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第八章 提高软件设计质量 8 课后习题 / 选择题 将软件需求转化为数据结构和软件的系统结构，并定义子系统和它们之间的通信或接口是哪个阶段的任务（ 概要设计 ） 将软件需求转化为数据结构和软件的系统结构，并定义子系统和它们之间的通信或接口是哪个阶段的任务（ 概要设计 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-083</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">将软件需求转化为数据结构和软件的系统结构，并定义子系统和它们之间的通信或接口是哪个阶段的任务（ 概要设计 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">将软件需求转化为数据结构和软件的系统结构，并定义子系统和它们之间的通信或接口是哪个阶段的任务（ 概要设计 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第八章 提高软件设计质量 8 课后习题 / 选择题 软件体系结构设计的基本任务（ 数据结构及数据库设计；编写概要设计文档；概要设计文档评审；设计软件系统结构 ） 软件体系结构设计的基本任务（ 数据结构及数据库设计；编写概要设计文档；概要设计文档评审；设计软件系统结构 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-084</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">软件体系结构设计的基本任务（ 数据结构及数据库设计；编写概要设计文档；概要设计文档评审；设计软件系统结构 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">软件体系结构设计的基本任务（ 数据结构及数据库设计；编写概要设计文档；概要设计文档评审；设计软件系统结构 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第八章 提高软件设计质量 8 课后习题 / 选择题 下列耦合度从低到高排列正确的是（ 数据耦合、控制耦合、公共环境耦合、内容耦合 ） 下列耦合度从低到高排列正确的是（ 数据耦合、控制耦合、公共环境耦合、内容耦合 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-085</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">下列耦合度从低到高排列正确的是（ 数据耦合、控制耦合、公共环境耦合、内容耦合 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">下列耦合度从低到高排列正确的是（ 数据耦合、控制耦合、公共环境耦合、内容耦合 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第八章 提高软件设计质量 8 课后习题 / 选择题 开－闭原则的闭指的是（ 对于原有代码的修改是封闭的，即不应该修改原有的代码。 ） 开－闭原则的闭指的是（ 对于原有代码的修改是封闭的，即不应该修改原有的代码。 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-086</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">开－闭原则的闭指的是（ 对于原有代码的修改是封闭的，即不应该修改原有的代码。 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">开－闭原则的闭指的是（ 对于原有代码的修改是封闭的，即不应该修改原有的代码。 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第八章 提高软件设计质量 8 课后习题 / 选择题 软件设计的技术原则包括（ 开－闭原则；接口隔离原则；迪米特法则；单一职责原则 ） 软件设计的技术原则包括（ 开－闭原则；接口隔离原则；迪米特法则；单一职责原则 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-087</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">软件设计的技术原则包括（ 开－闭原则；接口隔离原则；迪米特法则；单一职责原则 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">软件设计的技术原则包括（ 开－闭原则；接口隔离原则；迪米特法则；单一职责原则 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第八章 提高软件设计质量 8 课后习题 / 选择题 在一个新的对象里面使用一些已有的对象，使之成为新对象的一部分。新的对象通过向这些对象的委派达到复用已有功能的目的。这是什么原则（ 合成/聚合复用原则 ） 在一个新的对象里面使用一些已有的对象，使之成为新对象的一部分。新的对象通过向这些对象的委派达到复用已有功能的目的。这是什么原则（ 合成/聚合复用原则 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-088</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">在一个新的对象里面使用一些已有的对象，使之成为新对象的一部分。新的对象通过向这些对象的委派达到复用已有功能的目的。这是什么原则（ 合成/聚合复用原则 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">在一个新的对象里面使用一些已有的对象，使之成为新对象的一部分。新的对象通过向这些对象的委派达到复用已有功能的目的。这是什么原则（ 合成/聚合复用原则 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第八章 提高软件设计质量 8 课后习题 / 选择题 体系结构的模型包括（ 结构模型；功能模型；动态模型；过程模型 ） 体系结构的模型包括（ 结构模型；功能模型；动态模型；过程模型 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-089</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">体系结构的模型包括（ 结构模型；功能模型；动态模型；过程模型 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">体系结构的模型包括（ 结构模型；功能模型；动态模型；过程模型 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第八章 提高软件设计质量 8 课后习题 / 选择题 一个设计模式的基本要素包括（ 问题；效果；解决方案；模式名称 ） 一个设计模式的基本要素包括（ 问题；效果；解决方案；模式名称 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-090</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">一个设计模式的基本要素包括（ 问题；效果；解决方案；模式名称 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">一个设计模式的基本要素包括（ 问题；效果；解决方案；模式名称 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第八章 提高软件设计质量 8 课后习题 / 选择题 设计模式的作用包括（ 有助于作出有利于系统复用的选择，避免设计损害系统复用性；可以帮助设计者更快更好的完成系统设计；可以更加简单方便的复用成功的设计和体系结构；在工程小组成员之间提供了通用的语义 ） 设计模式的作用包括（ 有助于作出有利于系统复用的选择，避免设计损害系统复用性；可以帮助设计者更快更好的完成系统设计；可以更加简单方便的复用成功的设计和体系结构；在工程小组成员之间提供了通用的语义 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-091</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">设计模式的作用包括（ 有助于作出有利于系统复用的选择，避免设计损害系统复用性；可以帮助设计者更快更好的完成系统设计；可以更加简单方便的复用成功的设计和体系结构；在工程小组成员之间提供了通用的语义 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">设计模式的作用包括（ 有助于作出有利于系统复用的选择，避免设计损害系统复用性；可以帮助设计者更快更好的完成系统设计；可以更加简单方便的复用成功的设计和体系结构；在工程小组成员之间提供了通用的语义 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第八章 提高软件设计质量 8 课后习题 / 选择题 接口设计准则包括（ 是否包含有硬件接口设计，硬件接口设计是否正确且全面；是否包含有软件接口设计，软件接口设计是否正确且全面；是否描述了各类接口的功能；是否描述各接口与其他接口或模块之间的关系 ） 接口设计准则包括（ 是否包含有硬件接口设计，硬件接口设计是否正确且全面；是否包含有软件接口设计，软件接口设计是否正确且全面；是否描述了各类接口的功能；是否描述各接口与其他接口或模块之间的关系 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-092</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">接口设计准则包括（ 是否包含有硬件接口设计，硬件接口设计是否正确且全面；是否包含有软件接口设计，软件接口设计是否正确且全面；是否描述了各类接口的功能；是否描述各接口与其他接口或模块之间的关系 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">接口设计准则包括（ 是否包含有硬件接口设计，硬件接口设计是否正确且全面；是否包含有软件接口设计，软件接口设计是否正确且全面；是否描述了各类接口的功能；是否描述各接口与其他接口或模块之间的关系 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第八章 提高软件设计质量 8 课后习题 / 选择题 详细设计的目标任务包括（ 确定每一模块使用的数据结构；确定模块接口的细节；为每一个模块设计出一组测试用例 ） 详细设计的目标任务包括（ 确定每一模块使用的数据结构；确定模块接口的细节；为每一个模块设计出一组测试用例 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-093</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">详细设计的目标任务包括（ 确定每一模块使用的数据结构；确定模块接口的细节；为每一个模块设计出一组测试用例 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">详细设计的目标任务包括（ 确定每一模块使用的数据结构；确定模块接口的细节；为每一个模块设计出一组测试用例 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第八章 提高软件设计质量 8 课后习题 / 选择题 用户界面设计原则包括（ 必须保持一致性；应有自助功能；界面易懂 ） 用户界面设计原则包括（ 必须保持一致性；应有自助功能；界面易懂 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-094</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">用户界面设计原则包括（ 必须保持一致性；应有自助功能；界面易懂 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">用户界面设计原则包括（ 必须保持一致性；应有自助功能；界面易懂 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第八章 提高软件设计质量 8 课后习题 / 判断题 需求分析是将用户需求准确转化为软件系统的唯一途径。 需求分析是将用户需求准确转化为软件系统的唯一途径。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-095</span><span>8 课后习题 / 判断题</span></p>
        <p class="csdn-question">需求分析是将用户需求准确转化为软件系统的唯一途径。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">需求分析是将用户需求准确转化为软件系统的唯一途径。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第八章 提高软件设计质量 8 课后习题 / 判断题 软件设计的基本原则是设计越简单越好 软件设计的基本原则是设计越简单越好">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-096</span><span>8 课后习题 / 判断题</span></p>
        <p class="csdn-question">软件设计的基本原则是设计越简单越好</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">软件设计的基本原则是设计越简单越好</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第八章 提高软件设计质量 8 课后习题 / 判断题 软件设计的指导思想是降低模块内聚性，提高模块耦合度。 软件设计的指导思想是降低模块内聚性，提高模块耦合度。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-097</span><span>8 课后习题 / 判断题</span></p>
        <p class="csdn-question">软件设计的指导思想是降低模块内聚性，提高模块耦合度。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">软件设计的指导思想是降低模块内聚性，提高模块耦合度。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第八章 提高软件设计质量 8 课后习题 / 判断题 任何体系结构都有它自身的优点和缺点，所以我们要有针对性的选择使用。 任何体系结构都有它自身的优点和缺点，所以我们要有针对性的选择使用。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-098</span><span>8 课后习题 / 判断题</span></p>
        <p class="csdn-question">任何体系结构都有它自身的优点和缺点，所以我们要有针对性的选择使用。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">任何体系结构都有它自身的优点和缺点，所以我们要有针对性的选择使用。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第八章 提高软件设计质量 8 课后习题 / 判断题 软件设计的时候技术远比用户需求重要的多。 软件设计的时候技术远比用户需求重要的多。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-099</span><span>8 课后习题 / 判断题</span></p>
        <p class="csdn-question">软件设计的时候技术远比用户需求重要的多。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">软件设计的时候技术远比用户需求重要的多。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第八章 提高软件设计质量 8 课后习题 / 判断题 常作验证，早作验证是软件设计的原则之一 常作验证，早作验证是软件设计的原则之一">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-100</span><span>8 课后习题 / 判断题</span></p>
        <p class="csdn-question">常作验证，早作验证是软件设计的原则之一</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">常作验证，早作验证是软件设计的原则之一</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第八章 提高软件设计质量 8 课后习题 / 判断题 里氏代换原则中说，任何基类可以出现的地方，子类不一定可以出现。 里氏代换原则中说，任何基类可以出现的地方，子类不一定可以出现。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-101</span><span>8 课后习题 / 判断题</span></p>
        <p class="csdn-question">里氏代换原则中说，任何基类可以出现的地方，子类不一定可以出现。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">里氏代换原则中说，任何基类可以出现的地方，子类不一定可以出现。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第八章 提高软件设计质量 8 课后习题 / 判断题 框架模型主要以一些特殊的问题为目标建立只针对和适应该问题的结构。 框架模型主要以一些特殊的问题为目标建立只针对和适应该问题的结构。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-102</span><span>8 课后习题 / 判断题</span></p>
        <p class="csdn-question">框架模型主要以一些特殊的问题为目标建立只针对和适应该问题的结构。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">框架模型主要以一些特殊的问题为目标建立只针对和适应该问题的结构。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第八章 提高软件设计质量 8 课后习题 / 判断题 C/S与B/S软件体系结构相比，除了用户界面的实现方式不同以外，其他没什么差别。 C/S与B/S软件体系结构相比，除了用户界面的实现方式不同以外，其他没什么差别。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-103</span><span>8 课后习题 / 判断题</span></p>
        <p class="csdn-question">C/S与B/S软件体系结构相比，除了用户界面的实现方式不同以外，其他没什么差别。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">C/S与B/S软件体系结构相比，除了用户界面的实现方式不同以外，其他没什么差别。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第八章 提高软件设计质量 8 课后习题 / 判断题 中间件的多层分布式的体系结构将客户和资源分开，降低了服务器的负载。 中间件的多层分布式的体系结构将客户和资源分开，降低了服务器的负载。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-104</span><span>8 课后习题 / 判断题</span></p>
        <p class="csdn-question">中间件的多层分布式的体系结构将客户和资源分开，降低了服务器的负载。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">中间件的多层分布式的体系结构将客户和资源分开，降低了服务器的负载。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第八章 提高软件设计质量 8 课后习题 / 判断题 设计模式使得人们可以更加简单和方便地去复用成功的软件设计和体系结构，从而帮助设计者更快更好地完成系统设计。 设计模式使得人们可以更加简单和方便地去复用成功的软件设计和体系结构，从而帮助设计者更快更好地完成系统设计。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-105</span><span>8 课后习题 / 判断题</span></p>
        <p class="csdn-question">设计模式使得人们可以更加简单和方便地去复用成功的软件设计和体系结构，从而帮助设计者更快更好地完成系统设计。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">设计模式使得人们可以更加简单和方便地去复用成功的软件设计和体系结构，从而帮助设计者更快更好地完成系统设计。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第八章 提高软件设计质量 8 课后习题 / 判断题 UML语言先建模再编写代码，从一开始就保证系统结构合理 UML语言先建模再编写代码，从一开始就保证系统结构合理">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-106</span><span>8 课后习题 / 判断题</span></p>
        <p class="csdn-question">UML语言先建模再编写代码，从一开始就保证系统结构合理</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">UML语言先建模再编写代码，从一开始就保证系统结构合理</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第八章 提高软件设计质量 8 课后习题 / 判断题 数据字典是指对数据的数据项、数据结构、数据流、数据存储、处理逻辑、外部实体等进行定义和描述，其目的是对数据流程图中的各个元素做出详细的说明。 数据字典是指对数据的数据项、数据结构、数据流、数据存储、处理逻辑、外部实体等进行定义和描述，其目的是对数据流程图中的各个元素做出详细的说明。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-107</span><span>8 课后习题 / 判断题</span></p>
        <p class="csdn-question">数据字典是指对数据的数据项、数据结构、数据流、数据存储、处理逻辑、外部实体等进行定义和描述，其目的是对数据流程图中的各个元素做出详细的说明。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">数据字典是指对数据的数据项、数据结构、数据流、数据存储、处理逻辑、外部实体等进行定义和描述，其目的是对数据流程图中的各个元素做出详细的说明。</p>
        </details>
      </article>
    </div>
  </section>
  <section class="sqe-chapter csdn-section" id="csdn-第九章-高质量编程">
    <h2>第九章 高质量编程 <span style="font-size:14px;color:#667085">13 条</span></h2>
    <div class="csdn-grid">
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第九章 高质量编程 11 课后习题 / 填空题 建议文件结构包含三部分内容，包括：定义文件开头处的 版权 和 版本 声明；对一些头文件的引用；程序的实现体（包括数据和代码）。 建议文件结构包含三部分内容，包括：定义文件开头处的 版权 和 版本 声明；对一些头文件的引用；程序的实现体（包括数据和代码）。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-108</span><span>11 课后习题 / 填空题</span></p>
        <p class="csdn-question">建议文件结构包含三部分内容，包括：定义文件开头处的 版权 和 版本 声明；对一些头文件的引用；程序的实现体（包括数据和代码）。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">建议文件结构包含三部分内容，包括：定义文件开头处的 版权 和 版本 声明；对一些头文件的引用；程序的实现体（包括数据和代码）。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第九章 高质量编程 11 课后习题 / 填空题 正常值用 输出参数 获得，错误标志用 return语句 返回。 正常值用 输出参数 获得，错误标志用 return语句 返回。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-109</span><span>11 课后习题 / 填空题</span></p>
        <p class="csdn-question">正常值用 输出参数 获得，错误标志用 return语句 返回。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">正常值用 输出参数 获得，错误标志用 return语句 返回。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第九章 高质量编程 11 课后习题 / 选择题 以下属于优秀代码风格的是（ If（ j= =1）；If（i〉MAX_NUM） ） 以下属于优秀代码风格的是（ If（ j= =1）；If（i〉MAX_NUM） ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-110</span><span>11 课后习题 / 选择题</span></p>
        <p class="csdn-question">以下属于优秀代码风格的是（ If（ j= =1）；If（i〉MAX_NUM） ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">以下属于优秀代码风格的是（ If（ j= =1）；If（i〉MAX_NUM） ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第九章 高质量编程 11 课后习题 / 选择题 以下属于Windows程序命名规则的是（ 全局函数的名字应当使用“动词”或者“动词+名词”；静态变量加前缀s_。如果必须定义使用全局变量，则在全局变量前加g_；常量全用大写的字母，用下划线分割单词 ） 以下属于Windows程序命名规则的是（ 全局函数的名字应当使用“动词”或者“动词+名词”；静态变量加前缀s_。如果必须定义使用全局变量，则在全局变量前加g_；常量全用大写的字母，用下划线分割单词 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-111</span><span>11 课后习题 / 选择题</span></p>
        <p class="csdn-question">以下属于Windows程序命名规则的是（ 全局函数的名字应当使用“动词”或者“动词+名词”；静态变量加前缀s_。如果必须定义使用全局变量，则在全局变量前加g_；常量全用大写的字母，用下划线分割单词 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">以下属于Windows程序命名规则的是（ 全局函数的名字应当使用“动词”或者“动词+名词”；静态变量加前缀s_。如果必须定义使用全局变量，则在全局变量前加g_；常量全用大写的字母，用下划线分割单词 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第九章 高质量编程 11 课后习题 / 选择题 下列属于函数处理规则的是（ 如果参数是指针且仅做输入用，应该在类型前面加const，以防止该指针在函数体内被意外修改；如果输入参数以值传递的方式传递对象，宜改用“const &amp; ”方式来传递，这样可以省去临时对象的构造和析构过程，从而提高效率；不要将正常值和错误标志混在一起返回。正常值用输出参数获得... 下列属于函数处理规则的是（ 如果参数是指针且仅做输入用，应该在类型前面加const，以防止该指针在函数体内被意外修改；如果输入参数以值传递的方式传递对象，宜改用“const &amp; ”方式来传递，这样可以省去临时对象的构造和析构过程，从而提高效率；不要将正常值和错误标志混在一起返回。正常值用输出参数获得，错误标志用return语句返回；不要将正常值和错误标志混在一起返回。正常值用输出参数获得，错误标志用return语句返回 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-112</span><span>11 课后习题 / 选择题</span></p>
        <p class="csdn-question">下列属于函数处理规则的是（ 如果参数是指针且仅做输入用，应该在类型前面加const，以防止该指针在函数体内被意外修改；如果输入参数以值传递的方式传递对象，宜改用“const &amp; ”方式来传递，这样可以省去临时对象的构造和析构过程，从而提高效率；不要将正常值和错误标志混在一起返回。正常值用输出参数获得...</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">下列属于函数处理规则的是（ 如果参数是指针且仅做输入用，应该在类型前面加const，以防止该指针在函数体内被意外修改；如果输入参数以值传递的方式传递对象，宜改用“const &amp; ”方式来传递，这样可以省去临时对象的构造和析构过程，从而提高效率；不要将正常值和错误标志混在一起返回。正常值用输出参数获得，错误标志用return语句返回；不要将正常值和错误标志混在一起返回。正常值用输出参数获得，错误标志用return语句返回 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第九章 高质量编程 11 课后习题 / 选择题 以下符合程序版式规则的是（ 尽可能在定义变量的同时初始化该变量；长表达式要在低优先级操作符处拆分成新行，操作符放在新行之首；尽量避免在注释中使用缩写，特别是不常用缩写 ） 以下符合程序版式规则的是（ 尽可能在定义变量的同时初始化该变量；长表达式要在低优先级操作符处拆分成新行，操作符放在新行之首；尽量避免在注释中使用缩写，特别是不常用缩写 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-113</span><span>11 课后习题 / 选择题</span></p>
        <p class="csdn-question">以下符合程序版式规则的是（ 尽可能在定义变量的同时初始化该变量；长表达式要在低优先级操作符处拆分成新行，操作符放在新行之首；尽量避免在注释中使用缩写，特别是不常用缩写 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">以下符合程序版式规则的是（ 尽可能在定义变量的同时初始化该变量；长表达式要在低优先级操作符处拆分成新行，操作符放在新行之首；尽量避免在注释中使用缩写，特别是不常用缩写 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第九章 高质量编程 11 课后习题 / 选择题 以下符合基本语句规则的是（ if语句不可将浮点变量用“==”或“！=”与任何数字比较；不可在for循环体内修改循环变量；建议for语句的循环控制变量的取值采用“半开半闭区间”写法；if语句不可将布尔变量直接与TRUE、FALSE或者1、0进行比较 ） 以下符合基本语句规则的是（ if语句不可将浮点变量用“==”或“！=”与任何数字比较；不可在for循环体内修改循环变量；建议for语句的循环控制变量的取值采用“半开半闭区间”写法；if语句不可将布尔变量直接与TRUE、FALSE或者1、0进行比较 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-114</span><span>11 课后习题 / 选择题</span></p>
        <p class="csdn-question">以下符合基本语句规则的是（ if语句不可将浮点变量用“==”或“！=”与任何数字比较；不可在for循环体内修改循环变量；建议for语句的循环控制变量的取值采用“半开半闭区间”写法；if语句不可将布尔变量直接与TRUE、FALSE或者1、0进行比较 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">以下符合基本语句规则的是（ if语句不可将浮点变量用“==”或“！=”与任何数字比较；不可在for循环体内修改循环变量；建议for语句的循环控制变量的取值采用“半开半闭区间”写法；if语句不可将布尔变量直接与TRUE、FALSE或者1、0进行比较 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第九章 高质量编程 11 课后习题 / 选择题 以下符合内存使用规范的是（ 程序在运行的时候用malloc或new申请动态内存分配，动态内存的生存期由我们决定；静态存储区域在程序的整个运行期间都存在 ） 以下符合内存使用规范的是（ 程序在运行的时候用malloc或new申请动态内存分配，动态内存的生存期由我们决定；静态存储区域在程序的整个运行期间都存在 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-115</span><span>11 课后习题 / 选择题</span></p>
        <p class="csdn-question">以下符合内存使用规范的是（ 程序在运行的时候用malloc或new申请动态内存分配，动态内存的生存期由我们决定；静态存储区域在程序的整个运行期间都存在 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">以下符合内存使用规范的是（ 程序在运行的时候用malloc或new申请动态内存分配，动态内存的生存期由我们决定；静态存储区域在程序的整个运行期间都存在 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第九章 高质量编程 11 课后习题 / 选择题 以下符合内存使用规范的是（ 用malloc或new来申请内存，应该用if(p==NULL) 或if(p!=NULL)进行防错处理；内存分配成功后，应尽快对其进行初始化；程序中malloc与free的使用次数一定要相同；free和delete只是把指针所指的内存给释放掉，但并没有把指针本身干掉 ） 以下符合内存使用规范的是（ 用malloc或new来申请内存，应该用if(p==NULL) 或if(p!=NULL)进行防错处理；内存分配成功后，应尽快对其进行初始化；程序中malloc与free的使用次数一定要相同；free和delete只是把指针所指的内存给释放掉，但并没有把指针本身干掉 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-116</span><span>11 课后习题 / 选择题</span></p>
        <p class="csdn-question">以下符合内存使用规范的是（ 用malloc或new来申请内存，应该用if(p==NULL) 或if(p!=NULL)进行防错处理；内存分配成功后，应尽快对其进行初始化；程序中malloc与free的使用次数一定要相同；free和delete只是把指针所指的内存给释放掉，但并没有把指针本身干掉 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">以下符合内存使用规范的是（ 用malloc或new来申请内存，应该用if(p==NULL) 或if(p!=NULL)进行防错处理；内存分配成功后，应尽快对其进行初始化；程序中malloc与free的使用次数一定要相同；free和delete只是把指针所指的内存给释放掉，但并没有把指针本身干掉 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第九章 高质量编程 11 课后习题 / 选择题 以下说法正确的是（ const可以修饰函数的参数、返回值，函数的定义体等。修饰的东西受到强制保护，可以预防意外的变动；void Func(const A &amp;a)的形式可以有效防止参数a被意外修改；如果输入参数采用“指针传递”，那么加const修饰可以防止意外地改动该指针，起到保护作用 ） 以下说法正确的是（ const可以修饰函数的参数、返回值，函数的定义体等。修饰的东西受到强制保护，可以预防意外的变动；void Func(const A &amp;a)的形式可以有效防止参数a被意外修改；如果输入参数采用“指针传递”，那么加const修饰可以防止意外地改动该指针，起到保护作用 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-117</span><span>11 课后习题 / 选择题</span></p>
        <p class="csdn-question">以下说法正确的是（ const可以修饰函数的参数、返回值，函数的定义体等。修饰的东西受到强制保护，可以预防意外的变动；void Func(const A &amp;a)的形式可以有效防止参数a被意外修改；如果输入参数采用“指针传递”，那么加const修饰可以防止意外地改动该指针，起到保护作用 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">以下说法正确的是（ const可以修饰函数的参数、返回值，函数的定义体等。修饰的东西受到强制保护，可以预防意外的变动；void Func(const A &amp;a)的形式可以有效防止参数a被意外修改；如果输入参数采用“指针传递”，那么加const修饰可以防止意外地改动该指针，起到保护作用 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第九章 高质量编程 11 课后习题 / 判断题 注释的位置应与被描述的代码相邻，可以放在代码的上方或右方，不可放在下方。 注释的位置应与被描述的代码相邻，可以放在代码的上方或右方，不可放在下方。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-118</span><span>11 课后习题 / 判断题</span></p>
        <p class="csdn-question">注释的位置应与被描述的代码相邻，可以放在代码的上方或右方，不可放在下方。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">注释的位置应与被描述的代码相邻，可以放在代码的上方或右方，不可放在下方。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第九章 高质量编程 11 课后习题 / 判断题 边写代码边注释，修改代码同时修改相应的注释 边写代码边注释，修改代码同时修改相应的注释">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-119</span><span>11 课后习题 / 判断题</span></p>
        <p class="csdn-question">边写代码边注释，修改代码同时修改相应的注释</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">边写代码边注释，修改代码同时修改相应的注释</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第九章 高质量编程 11 课后习题 / 判断题 建议将浮点变量用“==”或“！=”与数字比较。 建议将浮点变量用“==”或“！=”与数字比较。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-120</span><span>11 课后习题 / 判断题</span></p>
        <p class="csdn-question">建议将浮点变量用“==”或“！=”与数字比较。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">建议将浮点变量用“==”或“！=”与数字比较。</p>
        </details>
      </article>
    </div>
  </section>
  <section class="sqe-chapter csdn-section" id="csdn-第十章-软件测试">
    <h2>第十章 软件测试 <span style="font-size:14px;color:#667085">82 条</span></h2>
    <div class="csdn-grid">
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 填空题 按照是否需要知道被测试程序的内部结构，测试方法可以分为： 黑盒 测试和 白盒 测试。 按照是否需要知道被测试程序的内部结构，测试方法可以分为： 黑盒 测试和 白盒 测试。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-121</span><span>8 课后习题 / 填空题</span></p>
        <p class="csdn-question">按照是否需要知道被测试程序的内部结构，测试方法可以分为： 黑盒 测试和 白盒 测试。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">按照是否需要知道被测试程序的内部结构，测试方法可以分为： 黑盒 测试和 白盒 测试。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 填空题 动态测试的两个基本要素是 被测试程序 、 测试用例； 动态测试的两个基本要素是 被测试程序 、 测试用例；">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-122</span><span>8 课后习题 / 填空题</span></p>
        <p class="csdn-question">动态测试的两个基本要素是 被测试程序 、 测试用例；</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">动态测试的两个基本要素是 被测试程序 、 测试用例；</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 填空题 动态测试技术主要使用的分析方法包括： 白盒 测试、 黑盒 测试 和 灰盒 测试 。 动态测试技术主要使用的分析方法包括： 白盒 测试、 黑盒 测试 和 灰盒 测试 。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-123</span><span>8 课后习题 / 填空题</span></p>
        <p class="csdn-question">动态测试技术主要使用的分析方法包括： 白盒 测试、 黑盒 测试 和 灰盒 测试 。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">动态测试技术主要使用的分析方法包括： 白盒 测试、 黑盒 测试 和 灰盒 测试 。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 填空题 回归测试的目的是所做的修改 达到了预定的目的 ，同时 不影响软件原有功能 的正确性。 回归测试的目的是所做的修改 达到了预定的目的 ，同时 不影响软件原有功能 的正确性。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-124</span><span>8 课后习题 / 填空题</span></p>
        <p class="csdn-question">回归测试的目的是所做的修改 达到了预定的目的 ，同时 不影响软件原有功能 的正确性。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">回归测试的目的是所做的修改 达到了预定的目的 ，同时 不影响软件原有功能 的正确性。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 选择题 导致软件缺陷的原因有很多，①—④是可能的原因，其中最主要的原因包括（ ①软件需求说明书编写的不全面，不完整，不准确，而且经常更改；④开发人员不能很好的理解需求说明书和沟通不足 ） 导致软件缺陷的原因有很多，①—④是可能的原因，其中最主要的原因包括（ ①软件需求说明书编写的不全面，不完整，不准确，而且经常更改；④开发人员不能很好的理解需求说明书和沟通不足 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-125</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">导致软件缺陷的原因有很多，①—④是可能的原因，其中最主要的原因包括（ ①软件需求说明书编写的不全面，不完整，不准确，而且经常更改；④开发人员不能很好的理解需求说明书和沟通不足 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">导致软件缺陷的原因有很多，①—④是可能的原因，其中最主要的原因包括（ ①软件需求说明书编写的不全面，不完整，不准确，而且经常更改；④开发人员不能很好的理解需求说明书和沟通不足 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 选择题 一条Bug记录应该包括（ ①编号；②Bug描述；③Bug级别；④Bug所属模块；⑤发现人 ） 一条Bug记录应该包括（ ①编号；②Bug描述；③Bug级别；④Bug所属模块；⑤发现人 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-126</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">一条Bug记录应该包括（ ①编号；②Bug描述；③Bug级别；④Bug所属模块；⑤发现人 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">一条Bug记录应该包括（ ①编号；②Bug描述；③Bug级别；④Bug所属模块；⑤发现人 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 选择题 下面①–④是关于软件评测师工作原则的描述，正确的判断是（ 无 ）（ ①对于开发人员提交的程序必须进行完全的测试，以确保程序的质量‌‌；②必须合理安排测试任务，做好周密的测试计划，平均分配软件各个模块的测试时间‌‌；③在测试之前需要与开发人员进行详细的交流，明确开发人员的程序设计思路，并以此为依据开展... 下面①–④是关于软件评测师工作原则的描述，正确的判断是（ 无 ）（ ①对于开发人员提交的程序必须进行完全的测试，以确保程序的质量‌‌；②必须合理安排测试任务，做好周密的测试计划，平均分配软件各个模块的测试时间‌‌；③在测试之前需要与开发人员进行详细的交流，明确开发人员的程序设计思路，并以此为依据开展软件测试工作，最大程度地发现程序中与其设计思路不一致的错误‌‌；④要对自己发现的问题负责，确保每一个问题都能被开发人员理解和修改。 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-127</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">下面①–④是关于软件评测师工作原则的描述，正确的判断是（ 无 ）（ ①对于开发人员提交的程序必须进行完全的测试，以确保程序的质量‌‌；②必须合理安排测试任务，做好周密的测试计划，平均分配软件各个模块的测试时间‌‌；③在测试之前需要与开发人员进行详细的交流，明确开发人员的程序设计思路，并以此为依据开展...</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">下面①–④是关于软件评测师工作原则的描述，正确的判断是（ 无 ）（ ①对于开发人员提交的程序必须进行完全的测试，以确保程序的质量‌‌；②必须合理安排测试任务，做好周密的测试计划，平均分配软件各个模块的测试时间‌‌；③在测试之前需要与开发人员进行详细的交流，明确开发人员的程序设计思路，并以此为依据开展软件测试工作，最大程度地发现程序中与其设计思路不一致的错误‌‌；④要对自己发现的问题负责，确保每一个问题都能被开发人员理解和修改。 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 选择题 测试记录包括（ ① 测试计划或包含测试用例的测试规格说明。；③ 与测试用例相关的所有结果，包括在测试期间出现的所有失败。；④ 测试中涉及的人员身份。 ） 测试记录包括（ ① 测试计划或包含测试用例的测试规格说明。；③ 与测试用例相关的所有结果，包括在测试期间出现的所有失败。；④ 测试中涉及的人员身份。 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-128</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">测试记录包括（ ① 测试计划或包含测试用例的测试规格说明。；③ 与测试用例相关的所有结果，包括在测试期间出现的所有失败。；④ 测试中涉及的人员身份。 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">测试记录包括（ ① 测试计划或包含测试用例的测试规格说明。；③ 与测试用例相关的所有结果，包括在测试期间出现的所有失败。；④ 测试中涉及的人员身份。 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 选择题 下列叙述中，（ 白盒测试又称为逻辑驱动测试 ）是正确的。 下列叙述中，（ 白盒测试又称为逻辑驱动测试 ）是正确的。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-129</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">下列叙述中，（ 白盒测试又称为逻辑驱动测试 ）是正确的。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">下列叙述中，（ 白盒测试又称为逻辑驱动测试 ）是正确的。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 选择题 软件设计阶段的质量控制主要采取的方式是（ 评审 ） 软件设计阶段的质量控制主要采取的方式是（ 评审 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-130</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">软件设计阶段的质量控制主要采取的方式是（ 评审 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">软件设计阶段的质量控制主要采取的方式是（ 评审 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 选择题 下列各项中（ 测试预期输出 ）不是一个测试计划所应包含的内容。 下列各项中（ 测试预期输出 ）不是一个测试计划所应包含的内容。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-131</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">下列各项中（ 测试预期输出 ）不是一个测试计划所应包含的内容。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">下列各项中（ 测试预期输出 ）不是一个测试计划所应包含的内容。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 选择题 下列中不属于测试原则的是（ 找到的缺陷越多软件残留的缺陷就越少 ） 下列中不属于测试原则的是（ 找到的缺陷越多软件残留的缺陷就越少 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-132</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">下列中不属于测试原则的是（ 找到的缺陷越多软件残留的缺陷就越少 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">下列中不属于测试原则的是（ 找到的缺陷越多软件残留的缺陷就越少 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 选择题 关于自动化测试局限性的描述，以下描述错误的是（ 自动测试比手工测试发现的缺陷少 ） 关于自动化测试局限性的描述，以下描述错误的是（ 自动测试比手工测试发现的缺陷少 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-133</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">关于自动化测试局限性的描述，以下描述错误的是（ 自动测试比手工测试发现的缺陷少 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">关于自动化测试局限性的描述，以下描述错误的是（ 自动测试比手工测试发现的缺陷少 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 选择题 缺陷跟踪就是要确保每个被发现的缺陷最终都能够被（ 关闭 ），而不是不了了之 。 缺陷跟踪就是要确保每个被发现的缺陷最终都能够被（ 关闭 ），而不是不了了之 。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-134</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">缺陷跟踪就是要确保每个被发现的缺陷最终都能够被（ 关闭 ），而不是不了了之 。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">缺陷跟踪就是要确保每个被发现的缺陷最终都能够被（ 关闭 ），而不是不了了之 。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 选择题 （ 软件测试文档 ）是对要执行的软件测试及测试的结果进行描述、定义、规定和报告的任何书面或图示信息。 （ 软件测试文档 ）是对要执行的软件测试及测试的结果进行描述、定义、规定和报告的任何书面或图示信息。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-135</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">（ 软件测试文档 ）是对要执行的软件测试及测试的结果进行描述、定义、规定和报告的任何书面或图示信息。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">（ 软件测试文档 ）是对要执行的软件测试及测试的结果进行描述、定义、规定和报告的任何书面或图示信息。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 选择题 软件测试是按照特定的规程，（ 发现软件错误 ）的过程。 软件测试是按照特定的规程，（ 发现软件错误 ）的过程。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-136</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">软件测试是按照特定的规程，（ 发现软件错误 ）的过程。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">软件测试是按照特定的规程，（ 发现软件错误 ）的过程。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 选择题 软件质量保证与测试人员需要的的基本素质有（ 所有选项都是 ）（ 行业知识、测试专业技能、计算机专业技能 ） 软件质量保证与测试人员需要的的基本素质有（ 所有选项都是 ）（ 行业知识、测试专业技能、计算机专业技能 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-137</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">软件质量保证与测试人员需要的的基本素质有（ 所有选项都是 ）（ 行业知识、测试专业技能、计算机专业技能 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">软件质量保证与测试人员需要的的基本素质有（ 所有选项都是 ）（ 行业知识、测试专业技能、计算机专业技能 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 选择题 软件测试人员的工作职责不包括（ 对软件缺陷进行修复 ） 软件测试人员的工作职责不包括（ 对软件缺陷进行修复 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-138</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">软件测试人员的工作职责不包括（ 对软件缺陷进行修复 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">软件测试人员的工作职责不包括（ 对软件缺陷进行修复 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 选择题 通过继承机制，子类可以继承父类的特点和功能，这一特征为（ 缺陷 ）的扩散提供了途径。 通过继承机制，子类可以继承父类的特点和功能，这一特征为（ 缺陷 ）的扩散提供了途径。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-139</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">通过继承机制，子类可以继承父类的特点和功能，这一特征为（ 缺陷 ）的扩散提供了途径。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">通过继承机制，子类可以继承父类的特点和功能，这一特征为（ 缺陷 ）的扩散提供了途径。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 选择题 封装这一特征简化了对对象的使用，但同时也给测试结构的（ 分析 ）、测试路径的选取、测试数据的生成等带来了困难。 封装这一特征简化了对对象的使用，但同时也给测试结构的（ 分析 ）、测试路径的选取、测试数据的生成等带来了困难。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-140</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">封装这一特征简化了对对象的使用，但同时也给测试结构的（ 分析 ）、测试路径的选取、测试数据的生成等带来了困难。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">封装这一特征简化了对对象的使用，但同时也给测试结构的（ 分析 ）、测试路径的选取、测试数据的生成等带来了困难。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 选择题 增量式集成测试有3种方式：自顶向下增量测试方法，（ 自底向上增量测试方法 ）和混合增量测试方式。 增量式集成测试有3种方式：自顶向下增量测试方法，（ 自底向上增量测试方法 ）和混合增量测试方式。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-141</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">增量式集成测试有3种方式：自顶向下增量测试方法，（ 自底向上增量测试方法 ）和混合增量测试方式。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">增量式集成测试有3种方式：自顶向下增量测试方法，（ 自底向上增量测试方法 ）和混合增量测试方式。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 选择题 代码检查法有桌面检查法，走查和（ 代码审查 ） 代码检查法有桌面检查法，走查和（ 代码审查 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-142</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">代码检查法有桌面检查法，走查和（ 代码审查 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">代码检查法有桌面检查法，走查和（ 代码审查 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 选择题 划分软件测试属于白盒测试还是黑盒测试的依据是（ 是否能看到被测源程序 ） 划分软件测试属于白盒测试还是黑盒测试的依据是（ 是否能看到被测源程序 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-143</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">划分软件测试属于白盒测试还是黑盒测试的依据是（ 是否能看到被测源程序 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">划分软件测试属于白盒测试还是黑盒测试的依据是（ 是否能看到被测源程序 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 选择题 软件测试的局限性不包括（ 软件测试会导致成本增加，项目总体效益降低。 ） 软件测试的局限性不包括（ 软件测试会导致成本增加，项目总体效益降低。 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-144</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">软件测试的局限性不包括（ 软件测试会导致成本增加，项目总体效益降低。 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">软件测试的局限性不包括（ 软件测试会导致成本增加，项目总体效益降低。 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 选择题 较实用的软件测试停止标准是（ 分析发现的缺陷数量和测试投入成本曲线图，确定应继续测试还是停止测试。 ） 较实用的软件测试停止标准是（ 分析发现的缺陷数量和测试投入成本曲线图，确定应继续测试还是停止测试。 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-145</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">较实用的软件测试停止标准是（ 分析发现的缺陷数量和测试投入成本曲线图，确定应继续测试还是停止测试。 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">较实用的软件测试停止标准是（ 分析发现的缺陷数量和测试投入成本曲线图，确定应继续测试还是停止测试。 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 选择题 下列中不属于测试原则的是（ 找到的缺陷越多，软件遗留的缺陷就越少 ） 下列中不属于测试原则的是（ 找到的缺陷越多，软件遗留的缺陷就越少 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-146</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">下列中不属于测试原则的是（ 找到的缺陷越多，软件遗留的缺陷就越少 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">下列中不属于测试原则的是（ 找到的缺陷越多，软件遗留的缺陷就越少 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 选择题 经验表明，在程序测试中，某模块与其他模块相比，若该模块已发现并改正的错误较多，则该模块中残存的错误数目与其他模块相比，通常应该（ 较多 ） 经验表明，在程序测试中，某模块与其他模块相比，若该模块已发现并改正的错误较多，则该模块中残存的错误数目与其他模块相比，通常应该（ 较多 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-147</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">经验表明，在程序测试中，某模块与其他模块相比，若该模块已发现并改正的错误较多，则该模块中残存的错误数目与其他模块相比，通常应该（ 较多 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">经验表明，在程序测试中，某模块与其他模块相比，若该模块已发现并改正的错误较多，则该模块中残存的错误数目与其他模块相比，通常应该（ 较多 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 选择题 以下哪一类人员与软件质量保证与测试工作无关？（ 软件销售人员 ） 以下哪一类人员与软件质量保证与测试工作无关？（ 软件销售人员 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-148</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">以下哪一类人员与软件质量保证与测试工作无关？（ 软件销售人员 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">以下哪一类人员与软件质量保证与测试工作无关？（ 软件销售人员 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 选择题 软件测试用例主要由输入数据和（ 预期输出结果 ）两部分组成。 软件测试用例主要由输入数据和（ 预期输出结果 ）两部分组成。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-149</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">软件测试用例主要由输入数据和（ 预期输出结果 ）两部分组成。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">软件测试用例主要由输入数据和（ 预期输出结果 ）两部分组成。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 选择题 与设计测试用例无关的文档是（ 项目开发计划 ） 与设计测试用例无关的文档是（ 项目开发计划 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-150</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">与设计测试用例无关的文档是（ 项目开发计划 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">与设计测试用例无关的文档是（ 项目开发计划 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 选择题 在确定测试目标的过程中，测试人员主要完成以下的（ 确定测试的标准和规范；确定测试环境；确定所需要的测试资源；确定用户的特殊要求 ） 在确定测试目标的过程中，测试人员主要完成以下的（ 确定测试的标准和规范；确定测试环境；确定所需要的测试资源；确定用户的特殊要求 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-151</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">在确定测试目标的过程中，测试人员主要完成以下的（ 确定测试的标准和规范；确定测试环境；确定所需要的测试资源；确定用户的特殊要求 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">在确定测试目标的过程中，测试人员主要完成以下的（ 确定测试的标准和规范；确定测试环境；确定所需要的测试资源；确定用户的特殊要求 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 选择题 测试人员应在软件生命周期中的下面哪个阶段介入最好（ 需求阶段 ） 测试人员应在软件生命周期中的下面哪个阶段介入最好（ 需求阶段 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-152</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">测试人员应在软件生命周期中的下面哪个阶段介入最好（ 需求阶段 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">测试人员应在软件生命周期中的下面哪个阶段介入最好（ 需求阶段 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 选择题 软件测试的对象包括（ 以上所有 ）（ 需求分析、概要设计和详细设计；程序源代码；需求规格说明 ） 软件测试的对象包括（ 以上所有 ）（ 需求分析、概要设计和详细设计；程序源代码；需求规格说明 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-153</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">软件测试的对象包括（ 以上所有 ）（ 需求分析、概要设计和详细设计；程序源代码；需求规格说明 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">软件测试的对象包括（ 以上所有 ）（ 需求分析、概要设计和详细设计；程序源代码；需求规格说明 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 选择题 从测试的要求来讲，如果想让测试完成的效果更好，测试部门与开发部门的关系最好是下面四种中的（ 测试组织与开发组织为不同公司。 ） 从测试的要求来讲，如果想让测试完成的效果更好，测试部门与开发部门的关系最好是下面四种中的（ 测试组织与开发组织为不同公司。 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-154</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">从测试的要求来讲，如果想让测试完成的效果更好，测试部门与开发部门的关系最好是下面四种中的（ 测试组织与开发组织为不同公司。 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">从测试的要求来讲，如果想让测试完成的效果更好，测试部门与开发部门的关系最好是下面四种中的（ 测试组织与开发组织为不同公司。 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 选择题 以下属于安全测试方法的是（ ①安全功能验证；②安全漏洞扫描；③模拟攻击实验；④数据侦听 ） 以下属于安全测试方法的是（ ①安全功能验证；②安全漏洞扫描；③模拟攻击实验；④数据侦听 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-155</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">以下属于安全测试方法的是（ ①安全功能验证；②安全漏洞扫描；③模拟攻击实验；④数据侦听 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">以下属于安全测试方法的是（ ①安全功能验证；②安全漏洞扫描；③模拟攻击实验；④数据侦听 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 选择题 编写测试计划的目的是（ ①使测试工作顺利进行；②使项目参与人员沟通更舒畅；③使测试工作更加系统化 ） 编写测试计划的目的是（ ①使测试工作顺利进行；②使项目参与人员沟通更舒畅；③使测试工作更加系统化 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-156</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">编写测试计划的目的是（ ①使测试工作顺利进行；②使项目参与人员沟通更舒畅；③使测试工作更加系统化 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">编写测试计划的目的是（ ①使测试工作顺利进行；②使项目参与人员沟通更舒畅；③使测试工作更加系统化 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 选择题 对需求说明书评测的内容包括（ ①系统定义的目标是否与用户的要求一致；②被开发项目的数据流与数据结构是否足够、确定；③与所有其它系统交互的重要接口是否都已经描述；④主要功能是否已包含在规定的软件范围之内，是否都已充分说明 ） 对需求说明书评测的内容包括（ ①系统定义的目标是否与用户的要求一致；②被开发项目的数据流与数据结构是否足够、确定；③与所有其它系统交互的重要接口是否都已经描述；④主要功能是否已包含在规定的软件范围之内，是否都已充分说明 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-157</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">对需求说明书评测的内容包括（ ①系统定义的目标是否与用户的要求一致；②被开发项目的数据流与数据结构是否足够、确定；③与所有其它系统交互的重要接口是否都已经描述；④主要功能是否已包含在规定的软件范围之内，是否都已充分说明 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">对需求说明书评测的内容包括（ ①系统定义的目标是否与用户的要求一致；②被开发项目的数据流与数据结构是否足够、确定；③与所有其它系统交互的重要接口是否都已经描述；④主要功能是否已包含在规定的软件范围之内，是否都已充分说明 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 选择题 以下关于白盒测试和黑盒测试的理解，正确是（ 白盒测试通过对程序内部结构的分析、检测来寻找问题 ） 以下关于白盒测试和黑盒测试的理解，正确是（ 白盒测试通过对程序内部结构的分析、检测来寻找问题 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-158</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">以下关于白盒测试和黑盒测试的理解，正确是（ 白盒测试通过对程序内部结构的分析、检测来寻找问题 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">以下关于白盒测试和黑盒测试的理解，正确是（ 白盒测试通过对程序内部结构的分析、检测来寻找问题 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 选择题 为了使软件测试更加高效，应遵循的原则包括（ ①所有的软件测试都应追溯到用户需求、充分注意缺陷群集现象；②尽早地和不断地进行软件测试、回归测试；④应由不同的测试人员对测试所发现的缺陷进行确认；⑤增量测试，由小到大 ） 为了使软件测试更加高效，应遵循的原则包括（ ①所有的软件测试都应追溯到用户需求、充分注意缺陷群集现象；②尽早地和不断地进行软件测试、回归测试；④应由不同的测试人员对测试所发现的缺陷进行确认；⑤增量测试，由小到大 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-159</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">为了使软件测试更加高效，应遵循的原则包括（ ①所有的软件测试都应追溯到用户需求、充分注意缺陷群集现象；②尽早地和不断地进行软件测试、回归测试；④应由不同的测试人员对测试所发现的缺陷进行确认；⑤增量测试，由小到大 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">为了使软件测试更加高效，应遵循的原则包括（ ①所有的软件测试都应追溯到用户需求、充分注意缺陷群集现象；②尽早地和不断地进行软件测试、回归测试；④应由不同的测试人员对测试所发现的缺陷进行确认；⑤增量测试，由小到大 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 选择题 （ 设计一个好的测试用例对用户需求的覆盖度达到100％ ）不是正确的软件测试目的。 （ 设计一个好的测试用例对用户需求的覆盖度达到100％ ）不是正确的软件测试目的。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-160</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">（ 设计一个好的测试用例对用户需求的覆盖度达到100％ ）不是正确的软件测试目的。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">（ 设计一个好的测试用例对用户需求的覆盖度达到100％ ）不是正确的软件测试目的。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 选择题 设计功能测试用例的根本依据是（ 用户需求规格说明书 ）。 设计功能测试用例的根本依据是（ 用户需求规格说明书 ）。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-161</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">设计功能测试用例的根本依据是（ 用户需求规格说明书 ）。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">设计功能测试用例的根本依据是（ 用户需求规格说明书 ）。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 选择题 使用软件测试工具的目的不包括（ 提高设计质量 ） 使用软件测试工具的目的不包括（ 提高设计质量 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-162</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">使用软件测试工具的目的不包括（ 提高设计质量 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">使用软件测试工具的目的不包括（ 提高设计质量 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 选择题 以下关于软件测试原则的说法中，错误的是（ 测试过程中某模块中查出的错误越多，该模块残留的错误就越少 ） 以下关于软件测试原则的说法中，错误的是（ 测试过程中某模块中查出的错误越多，该模块残留的错误就越少 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-163</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">以下关于软件测试原则的说法中，错误的是（ 测试过程中某模块中查出的错误越多，该模块残留的错误就越少 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">以下关于软件测试原则的说法中，错误的是（ 测试过程中某模块中查出的错误越多，该模块残留的错误就越少 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 选择题 为了提高测试效率应该（ 选择发现错误的可能性大的数据作为测试数据 ） 为了提高测试效率应该（ 选择发现错误的可能性大的数据作为测试数据 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-164</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">为了提高测试效率应该（ 选择发现错误的可能性大的数据作为测试数据 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">为了提高测试效率应该（ 选择发现错误的可能性大的数据作为测试数据 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 选择题 测试工程师的工作范围会包括检视代码、评审开发文档，这属于（ 静态测试 ） 测试工程师的工作范围会包括检视代码、评审开发文档，这属于（ 静态测试 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-165</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">测试工程师的工作范围会包括检视代码、评审开发文档，这属于（ 静态测试 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">测试工程师的工作范围会包括检视代码、评审开发文档，这属于（ 静态测试 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 选择题 软件测试的责任是：（ 编写合理的测试计划，并与项目整体计划有机地整合在一起；针对测试需求进行相关测试技术的研究；进行缺陷跟踪与分析；编写覆盖率高的测试用例 ） 软件测试的责任是：（ 编写合理的测试计划，并与项目整体计划有机地整合在一起；针对测试需求进行相关测试技术的研究；进行缺陷跟踪与分析；编写覆盖率高的测试用例 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-166</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">软件测试的责任是：（ 编写合理的测试计划，并与项目整体计划有机地整合在一起；针对测试需求进行相关测试技术的研究；进行缺陷跟踪与分析；编写覆盖率高的测试用例 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">软件测试的责任是：（ 编写合理的测试计划，并与项目整体计划有机地整合在一起；针对测试需求进行相关测试技术的研究；进行缺陷跟踪与分析；编写覆盖率高的测试用例 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 选择题 软件测试按照测试层次可以分为（ 单元测试、集成测试和系统测试 ） 软件测试按照测试层次可以分为（ 单元测试、集成测试和系统测试 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-167</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">软件测试按照测试层次可以分为（ 单元测试、集成测试和系统测试 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">软件测试按照测试层次可以分为（ 单元测试、集成测试和系统测试 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 选择题 某软件公司在招聘软件评测师时，应聘者甲向公司做如下保证：① 经过自己测试的软件今后不会再出现问题； ② 在工作中对所有程序员一视同仁，不会因为在某个程序员编写的程序中发现的问题多，就重点审查该程序，以免不利于团结； ③ 承诺不需要其他人员，自己就可以独立进行测试工作； ④ 发扬咬定青山不放松的精神，... 某软件公司在招聘软件评测师时，应聘者甲向公司做如下保证：① 经过自己测试的软件今后不会再出现问题； ② 在工作中对所有程序员一视同仁，不会因为在某个程序员编写的程序中发现的问题多，就重点审查该程序，以免不利于团结； ③ 承诺不需要其他人员，自己就可以独立进行测试工作； ④ 发扬咬定青山不放松的精神，不把所有问题都找出来，决不罢休； 你认为应聘者甲的保证（ 都不正确 ）。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-168</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">某软件公司在招聘软件评测师时，应聘者甲向公司做如下保证：① 经过自己测试的软件今后不会再出现问题； ② 在工作中对所有程序员一视同仁，不会因为在某个程序员编写的程序中发现的问题多，就重点审查该程序，以免不利于团结； ③ 承诺不需要其他人员，自己就可以独立进行测试工作； ④ 发扬咬定青山不放松的精神，...</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">某软件公司在招聘软件评测师时，应聘者甲向公司做如下保证：① 经过自己测试的软件今后不会再出现问题； ② 在工作中对所有程序员一视同仁，不会因为在某个程序员编写的程序中发现的问题多，就重点审查该程序，以免不利于团结； ③ 承诺不需要其他人员，自己就可以独立进行测试工作； ④ 发扬咬定青山不放松的精神，不把所有问题都找出来，决不罢休； 你认为应聘者甲的保证（ 都不正确 ）。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 选择题 软件测试步骤理解有误的是：（ 白盒法考虑的是测试用例对程序外部逻辑的覆盖程度 ） 软件测试步骤理解有误的是：（ 白盒法考虑的是测试用例对程序外部逻辑的覆盖程度 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-169</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">软件测试步骤理解有误的是：（ 白盒法考虑的是测试用例对程序外部逻辑的覆盖程度 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">软件测试步骤理解有误的是：（ 白盒法考虑的是测试用例对程序外部逻辑的覆盖程度 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 选择题 不属于测试工具的优点是（ 通过工具我们可以达到 100%的测试覆盖率 ） 不属于测试工具的优点是（ 通过工具我们可以达到 100%的测试覆盖率 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-170</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">不属于测试工具的优点是（ 通过工具我们可以达到 100%的测试覆盖率 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">不属于测试工具的优点是（ 通过工具我们可以达到 100%的测试覆盖率 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 选择题 下列（ 找到的缺陷越多软件的缺陷就越少 ）不属于测试原则的内容。 下列（ 找到的缺陷越多软件的缺陷就越少 ）不属于测试原则的内容。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-171</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">下列（ 找到的缺陷越多软件的缺陷就越少 ）不属于测试原则的内容。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">下列（ 找到的缺陷越多软件的缺陷就越少 ）不属于测试原则的内容。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 选择题 软件测试类型按开发阶段划分是（ 单元测试、集成测试、确认测试、系统测试、验收测试 ） 软件测试类型按开发阶段划分是（ 单元测试、集成测试、确认测试、系统测试、验收测试 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-172</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">软件测试类型按开发阶段划分是（ 单元测试、集成测试、确认测试、系统测试、验收测试 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">软件测试类型按开发阶段划分是（ 单元测试、集成测试、确认测试、系统测试、验收测试 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 选择题 （ 错误强度曲线下降到预定的水平 ）可以作为软件测试结束的标志。 （ 错误强度曲线下降到预定的水平 ）可以作为软件测试结束的标志。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-173</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">（ 错误强度曲线下降到预定的水平 ）可以作为软件测试结束的标志。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">（ 错误强度曲线下降到预定的水平 ）可以作为软件测试结束的标志。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 选择题 对测试用例描述不正确的是（ 不同类别的软件，测试用例是相同的 ） 对测试用例描述不正确的是（ 不同类别的软件，测试用例是相同的 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-174</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">对测试用例描述不正确的是（ 不同类别的软件，测试用例是相同的 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">对测试用例描述不正确的是（ 不同类别的软件，测试用例是相同的 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 选择题 软件测试计划评审会需要哪些人员参加？（ 项目经理；SQA 负责人；配置负责人；测试组 ） 软件测试计划评审会需要哪些人员参加？（ 项目经理；SQA 负责人；配置负责人；测试组 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-175</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">软件测试计划评审会需要哪些人员参加？（ 项目经理；SQA 负责人；配置负责人；测试组 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">软件测试计划评审会需要哪些人员参加？（ 项目经理；SQA 负责人；配置负责人；测试组 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 选择题 软件测试过程包括哪些步骤（ 单元测试；集成测试；验收测试；确认测试 ） 软件测试过程包括哪些步骤（ 单元测试；集成测试；验收测试；确认测试 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-176</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">软件测试过程包括哪些步骤（ 单元测试；集成测试；验收测试；确认测试 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">软件测试过程包括哪些步骤（ 单元测试；集成测试；验收测试；确认测试 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 选择题 测试设计员的职责有：（ 设计测试用例；设计测试过程、脚本 ） 测试设计员的职责有：（ 设计测试用例；设计测试过程、脚本 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-177</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">测试设计员的职责有：（ 设计测试用例；设计测试过程、脚本 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">测试设计员的职责有：（ 设计测试用例；设计测试过程、脚本 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 选择题 关于软件测试的概述说法不正确的是（ 用更好的程序语言编写程序可以避免出错；软件测试在软件开发总工作量的比例应最低 ） 关于软件测试的概述说法不正确的是（ 用更好的程序语言编写程序可以避免出错；软件测试在软件开发总工作量的比例应最低 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-178</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">关于软件测试的概述说法不正确的是（ 用更好的程序语言编写程序可以避免出错；软件测试在软件开发总工作量的比例应最低 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">关于软件测试的概述说法不正确的是（ 用更好的程序语言编写程序可以避免出错；软件测试在软件开发总工作量的比例应最低 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 选择题 关于软件测试的理解有误的是（ 软件测试目的是为了改正软件的错误；应用系统开发完毕，再对它进行软件测试 ） 关于软件测试的理解有误的是（ 软件测试目的是为了改正软件的错误；应用系统开发完毕，再对它进行软件测试 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-179</span><span>8 课后习题 / 选择题</span></p>
        <p class="csdn-question">关于软件测试的理解有误的是（ 软件测试目的是为了改正软件的错误；应用系统开发完毕，再对它进行软件测试 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">关于软件测试的理解有误的是（ 软件测试目的是为了改正软件的错误；应用系统开发完毕，再对它进行软件测试 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 判断题 需求分析 - 设计－实现－测试，软件测试是软件开发末期才需要做的工作。 需求分析 - 设计－实现－测试，软件测试是软件开发末期才需要做的工作。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-180</span><span>8 课后习题 / 判断题</span></p>
        <p class="csdn-question">需求分析 - 设计－实现－测试，软件测试是软件开发末期才需要做的工作。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">需求分析 - 设计－实现－测试，软件测试是软件开发末期才需要做的工作。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 判断题 采用自动化测试工具后一定比手工测试发现的缺陷更多。 采用自动化测试工具后一定比手工测试发现的缺陷更多。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-181</span><span>8 课后习题 / 判断题</span></p>
        <p class="csdn-question">采用自动化测试工具后一定比手工测试发现的缺陷更多。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">采用自动化测试工具后一定比手工测试发现的缺陷更多。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 判断题 测试人员要坚持原则，缺陷未修复完坚决不予通过。 测试人员要坚持原则，缺陷未修复完坚决不予通过。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-182</span><span>8 课后习题 / 判断题</span></p>
        <p class="csdn-question">测试人员要坚持原则，缺陷未修复完坚决不予通过。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">测试人员要坚持原则，缺陷未修复完坚决不予通过。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 判断题 自底向上集成需要测试员编写驱动程序。 自底向上集成需要测试员编写驱动程序。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-183</span><span>8 课后习题 / 判断题</span></p>
        <p class="csdn-question">自底向上集成需要测试员编写驱动程序。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">自底向上集成需要测试员编写驱动程序。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 判断题 发现错误多的模块，残留在模块中的错误也多。 发现错误多的模块，残留在模块中的错误也多。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-184</span><span>8 课后习题 / 判断题</span></p>
        <p class="csdn-question">发现错误多的模块，残留在模块中的错误也多。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">发现错误多的模块，残留在模块中的错误也多。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 判断题 一个软件存在哪些缺陷，开发者和用户的立场是一致的。 一个软件存在哪些缺陷，开发者和用户的立场是一致的。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-185</span><span>8 课后习题 / 判断题</span></p>
        <p class="csdn-question">一个软件存在哪些缺陷，开发者和用户的立场是一致的。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">一个软件存在哪些缺陷，开发者和用户的立场是一致的。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 判断题 软件测试针对的是初级程序员编写的程序，资深程序员编写的程序无需测试。 软件测试针对的是初级程序员编写的程序，资深程序员编写的程序无需测试。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-186</span><span>8 课后习题 / 判断题</span></p>
        <p class="csdn-question">软件测试针对的是初级程序员编写的程序，资深程序员编写的程序无需测试。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">软件测试针对的是初级程序员编写的程序，资深程序员编写的程序无需测试。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 判断题 好的测试员不懈追求完美，保证通过测试的软件不会再有缺陷。‍ 好的测试员不懈追求完美，保证通过测试的软件不会再有缺陷。‍">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-187</span><span>8 课后习题 / 判断题</span></p>
        <p class="csdn-question">好的测试员不懈追求完美，保证通过测试的软件不会再有缺陷。‍</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">好的测试员不懈追求完美，保证通过测试的软件不会再有缺陷。‍</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 判断题 测试是为了验证软件已正确地实现了用户的要求。 测试是为了验证软件已正确地实现了用户的要求。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-188</span><span>8 课后习题 / 判断题</span></p>
        <p class="csdn-question">测试是为了验证软件已正确地实现了用户的要求。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">测试是为了验证软件已正确地实现了用户的要求。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 判断题 代码评审员一般由测试员担任。 代码评审员一般由测试员担任。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-189</span><span>8 课后习题 / 判断题</span></p>
        <p class="csdn-question">代码评审员一般由测试员担任。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">代码评审员一般由测试员担任。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 判断题 在软件测试中, 测试预言是一种检验待测系统在特定执行下是否正确运行的方法。 在软件测试中, 测试预言是一种检验待测系统在特定执行下是否正确运行的方法。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-190</span><span>8 课后习题 / 判断题</span></p>
        <p class="csdn-question">在软件测试中, 测试预言是一种检验待测系统在特定执行下是否正确运行的方法。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">在软件测试中, 测试预言是一种检验待测系统在特定执行下是否正确运行的方法。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 判断题 测试人员说：没有可运行的程序，我无法进行测试工作。 测试人员说：没有可运行的程序，我无法进行测试工作。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-191</span><span>8 课后习题 / 判断题</span></p>
        <p class="csdn-question">测试人员说：没有可运行的程序，我无法进行测试工作。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">测试人员说：没有可运行的程序，我无法进行测试工作。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 判断题 项目立项前测试人员不需要提交任何工件。 项目立项前测试人员不需要提交任何工件。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-192</span><span>8 课后习题 / 判断题</span></p>
        <p class="csdn-question">项目立项前测试人员不需要提交任何工件。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">项目立项前测试人员不需要提交任何工件。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 判断题 只要能够达到100％的逻辑覆盖率，就可以保证程序的正确性。 只要能够达到100％的逻辑覆盖率，就可以保证程序的正确性。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-193</span><span>8 课后习题 / 判断题</span></p>
        <p class="csdn-question">只要能够达到100％的逻辑覆盖率，就可以保证程序的正确性。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">只要能够达到100％的逻辑覆盖率，就可以保证程序的正确性。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 判断题 软件测试工具可以代替软件测试员。 软件测试工具可以代替软件测试员。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-194</span><span>8 课后习题 / 判断题</span></p>
        <p class="csdn-question">软件测试工具可以代替软件测试员。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">软件测试工具可以代替软件测试员。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 判断题 软件测试等于程序测试。 软件测试等于程序测试。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-195</span><span>8 课后习题 / 判断题</span></p>
        <p class="csdn-question">软件测试等于程序测试。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">软件测试等于程序测试。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 判断题 最重要的用户界面要素是软件符合现行标准和规范。 最重要的用户界面要素是软件符合现行标准和规范。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-196</span><span>8 课后习题 / 判断题</span></p>
        <p class="csdn-question">最重要的用户界面要素是软件符合现行标准和规范。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">最重要的用户界面要素是软件符合现行标准和规范。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 判断题 软件测试是有风险的行为，并非所有的软件缺陷都能够被修复。 软件测试是有风险的行为，并非所有的软件缺陷都能够被修复。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-197</span><span>8 课后习题 / 判断题</span></p>
        <p class="csdn-question">软件测试是有风险的行为，并非所有的软件缺陷都能够被修复。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">软件测试是有风险的行为，并非所有的软件缺陷都能够被修复。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 判断题 传统测试以发现错误为目的，现在测试已经扩展到了错误预防的范畴。 传统测试以发现错误为目的，现在测试已经扩展到了错误预防的范畴。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-198</span><span>8 课后习题 / 判断题</span></p>
        <p class="csdn-question">传统测试以发现错误为目的，现在测试已经扩展到了错误预防的范畴。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">传统测试以发现错误为目的，现在测试已经扩展到了错误预防的范畴。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 判断题 我们有理由相信只要能够设计出尽可能好的测试方案，经过严格测试之后的软件可以没有缺陷。 我们有理由相信只要能够设计出尽可能好的测试方案，经过严格测试之后的软件可以没有缺陷。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-199</span><span>8 课后习题 / 判断题</span></p>
        <p class="csdn-question">我们有理由相信只要能够设计出尽可能好的测试方案，经过严格测试之后的软件可以没有缺陷。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">我们有理由相信只要能够设计出尽可能好的测试方案，经过严格测试之后的软件可以没有缺陷。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 判断题 设计－实现－测试，软件测试是开发后期的一个阶段。 设计－实现－测试，软件测试是开发后期的一个阶段。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-200</span><span>8 课后习题 / 判断题</span></p>
        <p class="csdn-question">设计－实现－测试，软件测试是开发后期的一个阶段。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">设计－实现－测试，软件测试是开发后期的一个阶段。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 判断题 永远有缺陷类型会在测试的一个层次上被发现，并且能够在另一个层次上逃避检测。 永远有缺陷类型会在测试的一个层次上被发现，并且能够在另一个层次上逃避检测。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-201</span><span>8 课后习题 / 判断题</span></p>
        <p class="csdn-question">永远有缺陷类型会在测试的一个层次上被发现，并且能够在另一个层次上逃避检测。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">永远有缺陷类型会在测试的一个层次上被发现，并且能够在另一个层次上逃避检测。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十章 软件测试 8 课后习题 / 判断题 程序员兼任测试员可以提高工作效率。 程序员兼任测试员可以提高工作效率。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-202</span><span>8 课后习题 / 判断题</span></p>
        <p class="csdn-question">程序员兼任测试员可以提高工作效率。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">程序员兼任测试员可以提高工作效率。</p>
        </details>
      </article>
    </div>
  </section>
  <section class="sqe-chapter csdn-section" id="csdn-第十一章-白盒测试">
    <h2>第十一章 白盒测试 <span style="font-size:14px;color:#667085">24 条</span></h2>
    <div class="csdn-grid">
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十一章 白盒测试 4 课后习题 / 填空题 判定-条件覆盖法要求使得判断中 每个条件的所有可能取值 至少执行一次。 判定-条件覆盖法要求使得判断中 每个条件的所有可能取值 至少执行一次。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-203</span><span>4 课后习题 / 填空题</span></p>
        <p class="csdn-question">判定-条件覆盖法要求使得判断中 每个条件的所有可能取值 至少执行一次。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">判定-条件覆盖法要求使得判断中 每个条件的所有可能取值 至少执行一次。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十一章 白盒测试 4 课后习题 / 填空题 白盒测试适合 单元 测试、 集成 测试。 白盒测试适合 单元 测试、 集成 测试。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-204</span><span>4 课后习题 / 填空题</span></p>
        <p class="csdn-question">白盒测试适合 单元 测试、 集成 测试。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">白盒测试适合 单元 测试、 集成 测试。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十一章 白盒测试 4 课后习题 / 填空题 满足条件组合覆盖标准的测试数据并不一定能使程序中的 每条路径 都执行到。 满足条件组合覆盖标准的测试数据并不一定能使程序中的 每条路径 都执行到。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-205</span><span>4 课后习题 / 填空题</span></p>
        <p class="csdn-question">满足条件组合覆盖标准的测试数据并不一定能使程序中的 每条路径 都执行到。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">满足条件组合覆盖标准的测试数据并不一定能使程序中的 每条路径 都执行到。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十一章 白盒测试 4 课后习题 / 选择题 下列几种逻辑覆盖标准中，查错能力最强的是（ 条件组合覆盖 ） 下列几种逻辑覆盖标准中，查错能力最强的是（ 条件组合覆盖 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-206</span><span>4 课后习题 / 选择题</span></p>
        <p class="csdn-question">下列几种逻辑覆盖标准中，查错能力最强的是（ 条件组合覆盖 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">下列几种逻辑覆盖标准中，查错能力最强的是（ 条件组合覆盖 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十一章 白盒测试 4 课后习题 / 选择题 一个程序中所含有的路径数与（ 程序的复杂程度 ）有着直接的关系 一个程序中所含有的路径数与（ 程序的复杂程度 ）有着直接的关系">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-207</span><span>4 课后习题 / 选择题</span></p>
        <p class="csdn-question">一个程序中所含有的路径数与（ 程序的复杂程度 ）有着直接的关系</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">一个程序中所含有的路径数与（ 程序的复杂程度 ）有着直接的关系</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十一章 白盒测试 4 课后习题 / 选择题 条件覆盖的目的是（ 使程序中的每个判定中每个条件的可能值至少满足一次 ） 条件覆盖的目的是（ 使程序中的每个判定中每个条件的可能值至少满足一次 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-208</span><span>4 课后习题 / 选择题</span></p>
        <p class="csdn-question">条件覆盖的目的是（ 使程序中的每个判定中每个条件的可能值至少满足一次 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">条件覆盖的目的是（ 使程序中的每个判定中每个条件的可能值至少满足一次 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十一章 白盒测试 4 课后习题 / 选择题 白盒测试是根据程序的（ 内部逻辑 ）来设计测试用例,黑盒测试是根据软件的规格说明来设计测试用例。 白盒测试是根据程序的（ 内部逻辑 ）来设计测试用例,黑盒测试是根据软件的规格说明来设计测试用例。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-209</span><span>4 课后习题 / 选择题</span></p>
        <p class="csdn-question">白盒测试是根据程序的（ 内部逻辑 ）来设计测试用例,黑盒测试是根据软件的规格说明来设计测试用例。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">白盒测试是根据程序的（ 内部逻辑 ）来设计测试用例,黑盒测试是根据软件的规格说明来设计测试用例。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十一章 白盒测试 4 课后习题 / 选择题 阅读下面这段程序，使用逻辑覆盖法进行测试，请问哪一组关于（a,b,c）的输入值可以达到判定覆盖。（ (a,b,c) = (4,-9,-2)、(-4,8,3) ） int func(int a,b,c) { int k=1; if ( (a&gt;0) &amp;&amp;(b&lt;0) &amp;&amp; (a+c&gt;0) ) k=k+a;... 阅读下面这段程序，使用逻辑覆盖法进行测试，请问哪一组关于（a,b,c）的输入值可以达到判定覆盖。（ (a,b,c) = (4,-9,-2)、(-4,8,3) ） int func(int a,b,c) { int k=1; if ( (a&gt;0) &amp;&amp;(b&lt;0) &amp;&amp; (a+c&gt;0) ) k=k+a; else k=k+b; if (c&gt;0) k=k+c; return k; }">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-210</span><span>4 课后习题 / 选择题</span></p>
        <p class="csdn-question">阅读下面这段程序，使用逻辑覆盖法进行测试，请问哪一组关于（a,b,c）的输入值可以达到判定覆盖。（ (a,b,c) = (4,-9,-2)、(-4,8,3) ） int func(int a,b,c) { int k=1; if ( (a&gt;0) &amp;&amp;(b&lt;0) &amp;&amp; (a+c&gt;0) ) k=k+a;...</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">阅读下面这段程序，使用逻辑覆盖法进行测试，请问哪一组关于（a,b,c）的输入值可以达到判定覆盖。（ (a,b,c) = (4,-9,-2)、(-4,8,3) ） int func(int a,b,c) { int k=1; if ( (a&gt;0) &amp;&amp;(b&lt;0) &amp;&amp; (a+c&gt;0) ) k=k+a; else k=k+b; if (c&gt;0) k=k+c; return k; }</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十一章 白盒测试 4 课后习题 / 选择题 如果某测试用例集实现了某软件的路径覆盖，那么它一定同时实现了该软件的（ 判定覆盖 ） 如果某测试用例集实现了某软件的路径覆盖，那么它一定同时实现了该软件的（ 判定覆盖 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-211</span><span>4 课后习题 / 选择题</span></p>
        <p class="csdn-question">如果某测试用例集实现了某软件的路径覆盖，那么它一定同时实现了该软件的（ 判定覆盖 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">如果某测试用例集实现了某软件的路径覆盖，那么它一定同时实现了该软件的（ 判定覆盖 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十一章 白盒测试 4 课后习题 / 选择题 以下哪种测试方法不属于白盒测试技术（ 边界值分析测试 ） 以下哪种测试方法不属于白盒测试技术（ 边界值分析测试 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-212</span><span>4 课后习题 / 选择题</span></p>
        <p class="csdn-question">以下哪种测试方法不属于白盒测试技术（ 边界值分析测试 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">以下哪种测试方法不属于白盒测试技术（ 边界值分析测试 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十一章 白盒测试 4 课后习题 / 选择题 对一个程序进行基本路径覆盖测试，所需测试用例的最少个数为（ 程序的环路复杂度 ） 对一个程序进行基本路径覆盖测试，所需测试用例的最少个数为（ 程序的环路复杂度 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-213</span><span>4 课后习题 / 选择题</span></p>
        <p class="csdn-question">对一个程序进行基本路径覆盖测试，所需测试用例的最少个数为（ 程序的环路复杂度 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">对一个程序进行基本路径覆盖测试，所需测试用例的最少个数为（ 程序的环路复杂度 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十一章 白盒测试 4 课后习题 / 选择题 如果一个判定中的复合条件表达式为（A &gt; 1）or（B &lt;= 3），则为了达到100%的条件覆盖率，至少需要设计多少个测试用例（ 2 ） 如果一个判定中的复合条件表达式为（A &gt; 1）or（B &lt;= 3），则为了达到100%的条件覆盖率，至少需要设计多少个测试用例（ 2 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-214</span><span>4 课后习题 / 选择题</span></p>
        <p class="csdn-question">如果一个判定中的复合条件表达式为（A &gt; 1）or（B &lt;= 3），则为了达到100%的条件覆盖率，至少需要设计多少个测试用例（ 2 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">如果一个判定中的复合条件表达式为（A &gt; 1）or（B &lt;= 3），则为了达到100%的条件覆盖率，至少需要设计多少个测试用例（ 2 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十一章 白盒测试 4 课后习题 / 选择题 对下面的计算个人所得税程序中，满足判定覆盖的测试用例是（ income=(799, 1500, 1999, 2000) ） if (income&lt;800) taxrate=0; else if (income&lt;=1500) taxrate=0.05; else if (income&lt;2000) ta... 对下面的计算个人所得税程序中，满足判定覆盖的测试用例是（ income=(799, 1500, 1999, 2000) ） if (income&lt;800) taxrate=0; else if (income&lt;=1500) taxrate=0.05; else if (income&lt;2000) taxrate=0.08; else taxrate=0.1;">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-215</span><span>4 课后习题 / 选择题</span></p>
        <p class="csdn-question">对下面的计算个人所得税程序中，满足判定覆盖的测试用例是（ income=(799, 1500, 1999, 2000) ） if (income&lt;800) taxrate=0; else if (income&lt;=1500) taxrate=0.05; else if (income&lt;2000) ta...</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">对下面的计算个人所得税程序中，满足判定覆盖的测试用例是（ income=(799, 1500, 1999, 2000) ） if (income&lt;800) taxrate=0; else if (income&lt;=1500) taxrate=0.05; else if (income&lt;2000) taxrate=0.08; else taxrate=0.1;</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十一章 白盒测试 4 课后习题 / 选择题 针对下面一个程序段： if ((M&gt;0) &amp;&amp; (N = = 0)) FUCTION1; if ((M = = 10)|| (P &gt; 10)) FUCTION2; 其中，FUCTION1、FUCTION2均为语句块。 现在选取测试用例：M=10 N=0 P=3 ，该测试用例满足了（ 语句覆盖 ） 针对下面一个程序段： if ((M&gt;0) &amp;&amp; (N = = 0)) FUCTION1; if ((M = = 10)|| (P &gt; 10)) FUCTION2; 其中，FUCTION1、FUCTION2均为语句块。 现在选取测试用例：M=10 N=0 P=3 ，该测试用例满足了（ 语句覆盖 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-216</span><span>4 课后习题 / 选择题</span></p>
        <p class="csdn-question">针对下面一个程序段： if ((M&gt;0) &amp;&amp; (N = = 0)) FUCTION1; if ((M = = 10)|| (P &gt; 10)) FUCTION2; 其中，FUCTION1、FUCTION2均为语句块。 现在选取测试用例：M=10 N=0 P=3 ，该测试用例满足了（ 语句覆盖 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">针对下面一个程序段： if ((M&gt;0) &amp;&amp; (N = = 0)) FUCTION1; if ((M = = 10)|| (P &gt; 10)) FUCTION2; 其中，FUCTION1、FUCTION2均为语句块。 现在选取测试用例：M=10 N=0 P=3 ，该测试用例满足了（ 语句覆盖 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十一章 白盒测试 4 课后习题 / 选择题 一个程序中所含有的路径数与（ 程序的复杂程度 ）有着直接的关系。 一个程序中所含有的路径数与（ 程序的复杂程度 ）有着直接的关系。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-217</span><span>4 课后习题 / 选择题</span></p>
        <p class="csdn-question">一个程序中所含有的路径数与（ 程序的复杂程度 ）有着直接的关系。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">一个程序中所含有的路径数与（ 程序的复杂程度 ）有着直接的关系。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十一章 白盒测试 4 课后习题 / 选择题 如果某测试用例集实现了判定覆盖，那么它一定同时实现了该软件的（ 语句覆盖 ） 如果某测试用例集实现了判定覆盖，那么它一定同时实现了该软件的（ 语句覆盖 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-218</span><span>4 课后习题 / 选择题</span></p>
        <p class="csdn-question">如果某测试用例集实现了判定覆盖，那么它一定同时实现了该软件的（ 语句覆盖 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">如果某测试用例集实现了判定覆盖，那么它一定同时实现了该软件的（ 语句覆盖 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十一章 白盒测试 4 课后习题 / 选择题 下列不属于白盒测试的技术是（ 边界值分析 ） 下列不属于白盒测试的技术是（ 边界值分析 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-219</span><span>4 课后习题 / 选择题</span></p>
        <p class="csdn-question">下列不属于白盒测试的技术是（ 边界值分析 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">下列不属于白盒测试的技术是（ 边界值分析 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十一章 白盒测试 4 课后习题 / 选择题 发现错误能力最弱的是（ 语句覆盖 ） 发现错误能力最弱的是（ 语句覆盖 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-220</span><span>4 课后习题 / 选择题</span></p>
        <p class="csdn-question">发现错误能力最弱的是（ 语句覆盖 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">发现错误能力最弱的是（ 语句覆盖 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十一章 白盒测试 4 课后习题 / 选择题 白盒测试方法中阐述不正确的是（ 组合覆盖要求设计足够多的测试用例，使得每个判定中条件结果的所有可能组合最多出现一次。 ） 白盒测试方法中阐述不正确的是（ 组合覆盖要求设计足够多的测试用例，使得每个判定中条件结果的所有可能组合最多出现一次。 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-221</span><span>4 课后习题 / 选择题</span></p>
        <p class="csdn-question">白盒测试方法中阐述不正确的是（ 组合覆盖要求设计足够多的测试用例，使得每个判定中条件结果的所有可能组合最多出现一次。 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">白盒测试方法中阐述不正确的是（ 组合覆盖要求设计足够多的测试用例，使得每个判定中条件结果的所有可能组合最多出现一次。 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十一章 白盒测试 4 课后习题 / 判断题 基路径测试给出了必需进行的测试的上限。 基路径测试给出了必需进行的测试的上限。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-222</span><span>4 课后习题 / 判断题</span></p>
        <p class="csdn-question">基路径测试给出了必需进行的测试的上限。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">基路径测试给出了必需进行的测试的上限。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十一章 白盒测试 4 课后习题 / 判断题 基路径是指从所有的程序路径中选择一个最小的路径集合，程序中的其它路径都可以由这一组路径进行加法和数乘运算得到。 基路径是指从所有的程序路径中选择一个最小的路径集合，程序中的其它路径都可以由这一组路径进行加法和数乘运算得到。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-223</span><span>4 课后习题 / 判断题</span></p>
        <p class="csdn-question">基路径是指从所有的程序路径中选择一个最小的路径集合，程序中的其它路径都可以由这一组路径进行加法和数乘运算得到。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">基路径是指从所有的程序路径中选择一个最小的路径集合，程序中的其它路径都可以由这一组路径进行加法和数乘运算得到。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十一章 白盒测试 4 课后习题 / 判断题 Beta 测试是验收测试的一种。 Beta 测试是验收测试的一种。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-224</span><span>4 课后习题 / 判断题</span></p>
        <p class="csdn-question">Beta 测试是验收测试的一种。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">Beta 测试是验收测试的一种。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十一章 白盒测试 4 课后习题 / 判断题 白盒测试会造成测试用例之间可能存在严重的冗余和未测试的功能漏洞。 白盒测试会造成测试用例之间可能存在严重的冗余和未测试的功能漏洞。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-225</span><span>4 课后习题 / 判断题</span></p>
        <p class="csdn-question">白盒测试会造成测试用例之间可能存在严重的冗余和未测试的功能漏洞。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">白盒测试会造成测试用例之间可能存在严重的冗余和未测试的功能漏洞。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十一章 白盒测试 4 课后习题 / 判断题 在白盒测试中，如果覆盖率达到100% ，就基本可以保证把所有的隐藏程序缺陷都已经揭露出来了。 在白盒测试中，如果覆盖率达到100% ，就基本可以保证把所有的隐藏程序缺陷都已经揭露出来了。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-226</span><span>4 课后习题 / 判断题</span></p>
        <p class="csdn-question">在白盒测试中，如果覆盖率达到100% ，就基本可以保证把所有的隐藏程序缺陷都已经揭露出来了。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">在白盒测试中，如果覆盖率达到100% ，就基本可以保证把所有的隐藏程序缺陷都已经揭露出来了。</p>
        </details>
      </article>
    </div>
  </section>
  <section class="sqe-chapter csdn-section" id="csdn-第十二章-黑盒测试">
    <h2>第十二章 黑盒测试 <span style="font-size:14px;color:#667085">32 条</span></h2>
    <div class="csdn-grid">
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十二章 黑盒测试 9 课后习题 / 选择题 用等价类划分法设计8位长数字类型用户名登录操作的测试用例，应该分成（ 4 ）个等价区间。 用等价类划分法设计8位长数字类型用户名登录操作的测试用例，应该分成（ 4 ）个等价区间。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-227</span><span>9 课后习题 / 选择题</span></p>
        <p class="csdn-question">用等价类划分法设计8位长数字类型用户名登录操作的测试用例，应该分成（ 4 ）个等价区间。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">用等价类划分法设计8位长数字类型用户名登录操作的测试用例，应该分成（ 4 ）个等价区间。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十二章 黑盒测试 9 课后习题 / 选择题 某系统对每个员工一年的出勤天数进行核算和存储(每月22工作日，一年最多出勤12*22=264天)，使用文本框进行填写。在此文本框的测试用例编写中使用了等价类划分法，则下面划分不准确的是（ 有效等价类，0&lt;出勤日&lt;264 ） 某系统对每个员工一年的出勤天数进行核算和存储(每月22工作日，一年最多出勤12*22=264天)，使用文本框进行填写。在此文本框的测试用例编写中使用了等价类划分法，则下面划分不准确的是（ 有效等价类，0&lt;出勤日&lt;264 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-228</span><span>9 课后习题 / 选择题</span></p>
        <p class="csdn-question">某系统对每个员工一年的出勤天数进行核算和存储(每月22工作日，一年最多出勤12*22=264天)，使用文本框进行填写。在此文本框的测试用例编写中使用了等价类划分法，则下面划分不准确的是（ 有效等价类，0&lt;出勤日&lt;264 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">某系统对每个员工一年的出勤天数进行核算和存储(每月22工作日，一年最多出勤12*22=264天)，使用文本框进行填写。在此文本框的测试用例编写中使用了等价类划分法，则下面划分不准确的是（ 有效等价类，0&lt;出勤日&lt;264 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十二章 黑盒测试 9 课后习题 / 选择题 黑盒测试称为功能测试，黑盒测试不能发现（ 是否存在冗余代码 ） 黑盒测试称为功能测试，黑盒测试不能发现（ 是否存在冗余代码 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-229</span><span>9 课后习题 / 选择题</span></p>
        <p class="csdn-question">黑盒测试称为功能测试，黑盒测试不能发现（ 是否存在冗余代码 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">黑盒测试称为功能测试，黑盒测试不能发现（ 是否存在冗余代码 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十二章 黑盒测试 9 课后习题 / 选择题 有关等价类划分方法，说法正确的（ 等价类划分可以有两种不同的情况：有效等价类和无效等价类 ） 有关等价类划分方法，说法正确的（ 等价类划分可以有两种不同的情况：有效等价类和无效等价类 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-230</span><span>9 课后习题 / 选择题</span></p>
        <p class="csdn-question">有关等价类划分方法，说法正确的（ 等价类划分可以有两种不同的情况：有效等价类和无效等价类 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">有关等价类划分方法，说法正确的（ 等价类划分可以有两种不同的情况：有效等价类和无效等价类 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十二章 黑盒测试 9 课后习题 / 选择题 在划分了等价类后，首先需要设计一个案例覆盖（ 尽可能多的 ）有效等价类。 在划分了等价类后，首先需要设计一个案例覆盖（ 尽可能多的 ）有效等价类。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-231</span><span>9 课后习题 / 选择题</span></p>
        <p class="csdn-question">在划分了等价类后，首先需要设计一个案例覆盖（ 尽可能多的 ）有效等价类。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">在划分了等价类后，首先需要设计一个案例覆盖（ 尽可能多的 ）有效等价类。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十二章 黑盒测试 9 课后习题 / 选择题 某公司员工如果工作超过一年并且达到了之前同意的目标，那么员工可以获得奖金。 这些事实可以通过以下表格来显示：‌‎ ‌ 以下哪个测试用例是在现实生活中会发生，但是上面的判定表遗漏了？（ 条件 1=No，条件 2=Yes，条件 3=No，动作=No ） 某公司员工如果工作超过一年并且达到了之前同意的目标，那么员工可以获得奖金。 这些事实可以通过以下表格来显示：‌‎ ‌ 以下哪个测试用例是在现实生活中会发生，但是上面的判定表遗漏了？（ 条件 1=No，条件 2=Yes，条件 3=No，动作=No ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-232</span><span>9 课后习题 / 选择题</span></p>
        <p class="csdn-question">某公司员工如果工作超过一年并且达到了之前同意的目标，那么员工可以获得奖金。 这些事实可以通过以下表格来显示：‌‎ ‌ 以下哪个测试用例是在现实生活中会发生，但是上面的判定表遗漏了？（ 条件 1=No，条件 2=Yes，条件 3=No，动作=No ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">某公司员工如果工作超过一年并且达到了之前同意的目标，那么员工可以获得奖金。 这些事实可以通过以下表格来显示：‌‎ ‌ 以下哪个测试用例是在现实生活中会发生，但是上面的判定表遗漏了？（ 条件 1=No，条件 2=Yes，条件 3=No，动作=No ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十二章 黑盒测试 9 课后习题 / 选择题 某视频应用有如下需求：该应用应该允许在下面的显示分辨率下播放视频： 1.640*480 ‌ 2.1280*720 ‌ 3.1600*1200 ‌ 4.1920*1080‌ 以下哪组测试用例是对该需求进行等价类划分测试技术得到的结果？（ 验证应用能够在需求中的每个显示尺寸都可以播放视频（4 个测试用例... 某视频应用有如下需求：该应用应该允许在下面的显示分辨率下播放视频： 1.640*480 ‌ 2.1280*720 ‌ 3.1600*1200 ‌ 4.1920*1080‌ 以下哪组测试用例是对该需求进行等价类划分测试技术得到的结果？（ 验证应用能够在需求中的每个显示尺寸都可以播放视频（4 个测试用例） ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-233</span><span>9 课后习题 / 选择题</span></p>
        <p class="csdn-question">某视频应用有如下需求：该应用应该允许在下面的显示分辨率下播放视频： 1.640*480 ‌ 2.1280*720 ‌ 3.1600*1200 ‌ 4.1920*1080‌ 以下哪组测试用例是对该需求进行等价类划分测试技术得到的结果？（ 验证应用能够在需求中的每个显示尺寸都可以播放视频（4 个测试用例...</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">某视频应用有如下需求：该应用应该允许在下面的显示分辨率下播放视频： 1.640*480 ‌ 2.1280*720 ‌ 3.1600*1200 ‌ 4.1920*1080‌ 以下哪组测试用例是对该需求进行等价类划分测试技术得到的结果？（ 验证应用能够在需求中的每个显示尺寸都可以播放视频（4 个测试用例） ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十二章 黑盒测试 9 课后习题 / 选择题 需要计算员工的奖金。奖金不能是负数，但是最少可以是 0。 奖金是根据雇佣的时间：‏ 小于等于 2 年 ‏‏大于 2 年但是小于 5 年 5年到 10 年（包括 5 和 10），或者超过 10 年 ‏‏为了覆盖奖金计算的所有有效等价类最少需要多少测试用例？（ 4 ） 需要计算员工的奖金。奖金不能是负数，但是最少可以是 0。 奖金是根据雇佣的时间：‏ 小于等于 2 年 ‏‏大于 2 年但是小于 5 年 5年到 10 年（包括 5 和 10），或者超过 10 年 ‏‏为了覆盖奖金计算的所有有效等价类最少需要多少测试用例？（ 4 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-234</span><span>9 课后习题 / 选择题</span></p>
        <p class="csdn-question">需要计算员工的奖金。奖金不能是负数，但是最少可以是 0。 奖金是根据雇佣的时间：‏ 小于等于 2 年 ‏‏大于 2 年但是小于 5 年 5年到 10 年（包括 5 和 10），或者超过 10 年 ‏‏为了覆盖奖金计算的所有有效等价类最少需要多少测试用例？（ 4 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">需要计算员工的奖金。奖金不能是负数，但是最少可以是 0。 奖金是根据雇佣的时间：‏ 小于等于 2 年 ‏‏大于 2 年但是小于 5 年 5年到 10 年（包括 5 和 10），或者超过 10 年 ‏‏为了覆盖奖金计算的所有有效等价类最少需要多少测试用例？（ 4 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十二章 黑盒测试 9 课后习题 / 选择题 您正在测试一个只接受信用卡的无人值守汽油泵。一旦信用卡被验证，泵喷嘴放入油箱，并选择所需的等级，客户就可以使用键盘输入所需的燃油量（加仑）。键盘只允许输入数字。燃料以十分之一（0.1）加仑起出售，最多 50.0 加仑。 以下哪项是覆盖输入数量的等价划分的最小集合？（ 0.0、20.0、60.0 ） 您正在测试一个只接受信用卡的无人值守汽油泵。一旦信用卡被验证，泵喷嘴放入油箱，并选择所需的等级，客户就可以使用键盘输入所需的燃油量（加仑）。键盘只允许输入数字。燃料以十分之一（0.1）加仑起出售，最多 50.0 加仑。 以下哪项是覆盖输入数量的等价划分的最小集合？（ 0.0、20.0、60.0 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-235</span><span>9 课后习题 / 选择题</span></p>
        <p class="csdn-question">您正在测试一个只接受信用卡的无人值守汽油泵。一旦信用卡被验证，泵喷嘴放入油箱，并选择所需的等级，客户就可以使用键盘输入所需的燃油量（加仑）。键盘只允许输入数字。燃料以十分之一（0.1）加仑起出售，最多 50.0 加仑。 以下哪项是覆盖输入数量的等价划分的最小集合？（ 0.0、20.0、60.0 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">您正在测试一个只接受信用卡的无人值守汽油泵。一旦信用卡被验证，泵喷嘴放入油箱，并选择所需的等级，客户就可以使用键盘输入所需的燃油量（加仑）。键盘只允许输入数字。燃料以十分之一（0.1）加仑起出售，最多 50.0 加仑。 以下哪项是覆盖输入数量的等价划分的最小集合？（ 0.0、20.0、60.0 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十二章 黑盒测试 9 课后习题 / 选择题 一个程序只有一个输入S，其取值范围是 -60≤S≤60。现从输入的角度设计了一组测试数据：-200，20，200，设计这组测试用例的方法（ 等价类划分 ） 一个程序只有一个输入S，其取值范围是 -60≤S≤60。现从输入的角度设计了一组测试数据：-200，20，200，设计这组测试用例的方法（ 等价类划分 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-236</span><span>9 课后习题 / 选择题</span></p>
        <p class="csdn-question">一个程序只有一个输入S，其取值范围是 -60≤S≤60。现从输入的角度设计了一组测试数据：-200，20，200，设计这组测试用例的方法（ 等价类划分 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">一个程序只有一个输入S，其取值范围是 -60≤S≤60。现从输入的角度设计了一组测试数据：-200，20，200，设计这组测试用例的方法（ 等价类划分 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十二章 黑盒测试 9 课后习题 / 选择题 若有一个计算类型的程序，它的输入量只有—个X，其范围是[-1．0，1．0]，现从输入的角度考虑一组测试用例：-1.001，-1.0，1.0，1.001。设计这组测试用例的方法是（ 边界值分析法 ） 若有一个计算类型的程序，它的输入量只有—个X，其范围是[-1．0，1．0]，现从输入的角度考虑一组测试用例：-1.001，-1.0，1.0，1.001。设计这组测试用例的方法是（ 边界值分析法 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-237</span><span>9 课后习题 / 选择题</span></p>
        <p class="csdn-question">若有一个计算类型的程序，它的输入量只有—个X，其范围是[-1．0，1．0]，现从输入的角度考虑一组测试用例：-1.001，-1.0，1.0，1.001。设计这组测试用例的方法是（ 边界值分析法 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">若有一个计算类型的程序，它的输入量只有—个X，其范围是[-1．0，1．0]，现从输入的角度考虑一组测试用例：-1.001，-1.0，1.0，1.001。设计这组测试用例的方法是（ 边界值分析法 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十二章 黑盒测试 9 课后习题 / 选择题 白盒测试、灰盒测试和黑盒测试都是常用的系统测试方法。其中，（ 黑盒测试 ）也称功能测试或数据驱动测试，它是已知产品所应具有的功能，通过测试来检测每个功能是否都能正常使用。 白盒测试、灰盒测试和黑盒测试都是常用的系统测试方法。其中，（ 黑盒测试 ）也称功能测试或数据驱动测试，它是已知产品所应具有的功能，通过测试来检测每个功能是否都能正常使用。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-238</span><span>9 课后习题 / 选择题</span></p>
        <p class="csdn-question">白盒测试、灰盒测试和黑盒测试都是常用的系统测试方法。其中，（ 黑盒测试 ）也称功能测试或数据驱动测试，它是已知产品所应具有的功能，通过测试来检测每个功能是否都能正常使用。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">白盒测试、灰盒测试和黑盒测试都是常用的系统测试方法。其中，（ 黑盒测试 ）也称功能测试或数据驱动测试，它是已知产品所应具有的功能，通过测试来检测每个功能是否都能正常使用。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十二章 黑盒测试 9 课后习题 / 选择题 用边界值分析法，假定1&lt;X&lt;100，那么整数X在测试中应取的边界值不包括（ X=0，X=101 ） 用边界值分析法，假定1&lt;X&lt;100，那么整数X在测试中应取的边界值不包括（ X=0，X=101 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-239</span><span>9 课后习题 / 选择题</span></p>
        <p class="csdn-question">用边界值分析法，假定1&lt;X&lt;100，那么整数X在测试中应取的边界值不包括（ X=0，X=101 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">用边界值分析法，假定1&lt;X&lt;100，那么整数X在测试中应取的边界值不包括（ X=0，X=101 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十二章 黑盒测试 9 课后习题 / 选择题 在确定黑盒测试策略时，优先选用的方法是（ 等价类划分 ） 在确定黑盒测试策略时，优先选用的方法是（ 等价类划分 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-240</span><span>9 课后习题 / 选择题</span></p>
        <p class="csdn-question">在确定黑盒测试策略时，优先选用的方法是（ 等价类划分 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">在确定黑盒测试策略时，优先选用的方法是（ 等价类划分 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十二章 黑盒测试 9 课后习题 / 选择题 （ 因果图 ）方法根据输出对输入的依赖关系设计测试用例。 （ 因果图 ）方法根据输出对输入的依赖关系设计测试用例。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-241</span><span>9 课后习题 / 选择题</span></p>
        <p class="csdn-question">（ 因果图 ）方法根据输出对输入的依赖关系设计测试用例。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">（ 因果图 ）方法根据输出对输入的依赖关系设计测试用例。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十二章 黑盒测试 9 课后习题 / 选择题 自动化黑盒测试工具中，脚本录制好后，只要执行脚本，就可以把测试过程重做一遍，这被称为（ 回放 ） 自动化黑盒测试工具中，脚本录制好后，只要执行脚本，就可以把测试过程重做一遍，这被称为（ 回放 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-242</span><span>9 课后习题 / 选择题</span></p>
        <p class="csdn-question">自动化黑盒测试工具中，脚本录制好后，只要执行脚本，就可以把测试过程重做一遍，这被称为（ 回放 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">自动化黑盒测试工具中，脚本录制好后，只要执行脚本，就可以把测试过程重做一遍，这被称为（ 回放 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十二章 黑盒测试 9 课后习题 / 选择题 在自动化黑盒测试工具中，通过录制来得到（ 测试脚本 ），可以减少工作量。 在自动化黑盒测试工具中，通过录制来得到（ 测试脚本 ），可以减少工作量。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-243</span><span>9 课后习题 / 选择题</span></p>
        <p class="csdn-question">在自动化黑盒测试工具中，通过录制来得到（ 测试脚本 ），可以减少工作量。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">在自动化黑盒测试工具中，通过录制来得到（ 测试脚本 ），可以减少工作量。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十二章 黑盒测试 9 课后习题 / 选择题 （ 录制技术 ）可以让并不熟悉脚本语言的软件测试人员也可以方便的得到测试脚本。 （ 录制技术 ）可以让并不熟悉脚本语言的软件测试人员也可以方便的得到测试脚本。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-244</span><span>9 课后习题 / 选择题</span></p>
        <p class="csdn-question">（ 录制技术 ）可以让并不熟悉脚本语言的软件测试人员也可以方便的得到测试脚本。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">（ 录制技术 ）可以让并不熟悉脚本语言的软件测试人员也可以方便的得到测试脚本。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十二章 黑盒测试 9 课后习题 / 选择题 对于业务流清晰的系统可以利用（ 场景法 ）贯穿整个测试用例设计过程并在用例中综合使用各种测试方法。 对于业务流清晰的系统可以利用（ 场景法 ）贯穿整个测试用例设计过程并在用例中综合使用各种测试方法。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-245</span><span>9 课后习题 / 选择题</span></p>
        <p class="csdn-question">对于业务流清晰的系统可以利用（ 场景法 ）贯穿整个测试用例设计过程并在用例中综合使用各种测试方法。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">对于业务流清晰的系统可以利用（ 场景法 ）贯穿整个测试用例设计过程并在用例中综合使用各种测试方法。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十二章 黑盒测试 9 课后习题 / 选择题 黑盒测试技术中不包括（ 逻辑覆盖 ） 黑盒测试技术中不包括（ 逻辑覆盖 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-246</span><span>9 课后习题 / 选择题</span></p>
        <p class="csdn-question">黑盒测试技术中不包括（ 逻辑覆盖 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">黑盒测试技术中不包括（ 逻辑覆盖 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十二章 黑盒测试 9 课后习题 / 选择题 凭经验或直觉推测可能的错误，列出程序中可能有的错误和容易发生错误的特殊情况，选择测试用例的测试方法叫（ 错误推测法 ） 凭经验或直觉推测可能的错误，列出程序中可能有的错误和容易发生错误的特殊情况，选择测试用例的测试方法叫（ 错误推测法 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-247</span><span>9 课后习题 / 选择题</span></p>
        <p class="csdn-question">凭经验或直觉推测可能的错误，列出程序中可能有的错误和容易发生错误的特殊情况，选择测试用例的测试方法叫（ 错误推测法 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">凭经验或直觉推测可能的错误，列出程序中可能有的错误和容易发生错误的特殊情况，选择测试用例的测试方法叫（ 错误推测法 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十二章 黑盒测试 9 课后习题 / 选择题 在某大学学籍管理信息系统中，假设学生年龄的输入范围为16-40，则根据黑盒测试中的等价类划分技术，下面划分正确的是（ 可划分为1个有效等价类，2个无效等价类 ） 在某大学学籍管理信息系统中，假设学生年龄的输入范围为16-40，则根据黑盒测试中的等价类划分技术，下面划分正确的是（ 可划分为1个有效等价类，2个无效等价类 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-248</span><span>9 课后习题 / 选择题</span></p>
        <p class="csdn-question">在某大学学籍管理信息系统中，假设学生年龄的输入范围为16-40，则根据黑盒测试中的等价类划分技术，下面划分正确的是（ 可划分为1个有效等价类，2个无效等价类 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">在某大学学籍管理信息系统中，假设学生年龄的输入范围为16-40，则根据黑盒测试中的等价类划分技术，下面划分正确的是（ 可划分为1个有效等价类，2个无效等价类 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十二章 黑盒测试 9 课后习题 / 选择题 黑盒测试法是根据产品的（ 功能 ）来设计测试用例的。 黑盒测试法是根据产品的（ 功能 ）来设计测试用例的。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-249</span><span>9 课后习题 / 选择题</span></p>
        <p class="csdn-question">黑盒测试法是根据产品的（ 功能 ）来设计测试用例的。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">黑盒测试法是根据产品的（ 功能 ）来设计测试用例的。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十二章 黑盒测试 9 课后习题 / 选择题 （ 因果图法 ）方法是根据输出对输入的依赖关系来设计测试用例的。 （ 因果图法 ）方法是根据输出对输入的依赖关系来设计测试用例的。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-250</span><span>9 课后习题 / 选择题</span></p>
        <p class="csdn-question">（ 因果图法 ）方法是根据输出对输入的依赖关系来设计测试用例的。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">（ 因果图法 ）方法是根据输出对输入的依赖关系来设计测试用例的。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十二章 黑盒测试 9 课后习题 / 选择题 黑盒测试是通过软件的外部表现来发现软件缺陷和错误的测试方法，具体地说，黑盒测试用例设计技术包括（ 等价类划分法、因果图法、边界值分析法、错误推测法、判定表驱动法 ）等。 黑盒测试是通过软件的外部表现来发现软件缺陷和错误的测试方法，具体地说，黑盒测试用例设计技术包括（ 等价类划分法、因果图法、边界值分析法、错误推测法、判定表驱动法 ）等。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-251</span><span>9 课后习题 / 选择题</span></p>
        <p class="csdn-question">黑盒测试是通过软件的外部表现来发现软件缺陷和错误的测试方法，具体地说，黑盒测试用例设计技术包括（ 等价类划分法、因果图法、边界值分析法、错误推测法、判定表驱动法 ）等。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">黑盒测试是通过软件的外部表现来发现软件缺陷和错误的测试方法，具体地说，黑盒测试用例设计技术包括（ 等价类划分法、因果图法、边界值分析法、错误推测法、判定表驱动法 ）等。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十二章 黑盒测试 9 课后习题 / 选择题 下列叙述不正确的是（ 判定表驱动法属于白盒测试方法 ） 下列叙述不正确的是（ 判定表驱动法属于白盒测试方法 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-252</span><span>9 课后习题 / 选择题</span></p>
        <p class="csdn-question">下列叙述不正确的是（ 判定表驱动法属于白盒测试方法 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">下列叙述不正确的是（ 判定表驱动法属于白盒测试方法 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十二章 黑盒测试 9 课后习题 / 选择题 描述黑盒测试的说法错误的是（ 因果图法不属于黑盒测试用例设计方法 ） 描述黑盒测试的说法错误的是（ 因果图法不属于黑盒测试用例设计方法 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-253</span><span>9 课后习题 / 选择题</span></p>
        <p class="csdn-question">描述黑盒测试的说法错误的是（ 因果图法不属于黑盒测试用例设计方法 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">描述黑盒测试的说法错误的是（ 因果图法不属于黑盒测试用例设计方法 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十二章 黑盒测试 9 课后习题 / 选择题 设计测试用例时候，（ 边界值分析 ）是用得最多的一种黑盒测试方法。 设计测试用例时候，（ 边界值分析 ）是用得最多的一种黑盒测试方法。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-254</span><span>9 课后习题 / 选择题</span></p>
        <p class="csdn-question">设计测试用例时候，（ 边界值分析 ）是用得最多的一种黑盒测试方法。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">设计测试用例时候，（ 边界值分析 ）是用得最多的一种黑盒测试方法。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十二章 黑盒测试 9 课后习题 / 选择题 动态黑盒测试（ 测试的是软件在使用过程中的实际行为 ） 动态黑盒测试（ 测试的是软件在使用过程中的实际行为 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-255</span><span>9 课后习题 / 选择题</span></p>
        <p class="csdn-question">动态黑盒测试（ 测试的是软件在使用过程中的实际行为 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">动态黑盒测试（ 测试的是软件在使用过程中的实际行为 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十二章 黑盒测试 9 课后习题 / 选择题 下列不属于黑盒测试方法的是（ 变异测试 ） 下列不属于黑盒测试方法的是（ 变异测试 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-256</span><span>9 课后习题 / 选择题</span></p>
        <p class="csdn-question">下列不属于黑盒测试方法的是（ 变异测试 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">下列不属于黑盒测试方法的是（ 变异测试 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十二章 黑盒测试 9 课后习题 / 判断题 由于函数覆盖率是基于代码的，所以也可以把函数覆盖归入黑盒测试的范畴。 由于函数覆盖率是基于代码的，所以也可以把函数覆盖归入黑盒测试的范畴。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-257</span><span>9 课后习题 / 判断题</span></p>
        <p class="csdn-question">由于函数覆盖率是基于代码的，所以也可以把函数覆盖归入黑盒测试的范畴。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">由于函数覆盖率是基于代码的，所以也可以把函数覆盖归入黑盒测试的范畴。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="第十二章 黑盒测试 9 课后习题 / 判断题 黑盒测试的测试用例是根据程序内部逻辑设计的。 黑盒测试的测试用例是根据程序内部逻辑设计的。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-258</span><span>9 课后习题 / 判断题</span></p>
        <p class="csdn-question">黑盒测试的测试用例是根据程序内部逻辑设计的。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">黑盒测试的测试用例是根据程序内部逻辑设计的。</p>
        </details>
      </article>
    </div>
  </section>
  <section class="sqe-chapter csdn-section" id="csdn-测试相关未分类习题">
    <h2>测试相关未分类习题 <span style="font-size:14px;color:#667085">40 条</span></h2>
    <div class="csdn-grid">
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="测试相关未分类习题 填空题 系统测试包括 压力 测试、 容量 测试、 性能 测试、 安全性 测试等。 系统测试包括 压力 测试、 容量 测试、 性能 测试、 安全性 测试等。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-259</span><span>填空题</span></p>
        <p class="csdn-question">系统测试包括 压力 测试、 容量 测试、 性能 测试、 安全性 测试等。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">系统测试包括 压力 测试、 容量 测试、 性能 测试、 安全性 测试等。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="测试相关未分类习题 填空题 单元测试是对软件基本组成单元进行的测试，一般在代码完成后由 开发 人员完成， SQA 人员辅助。 单元测试是对软件基本组成单元进行的测试，一般在代码完成后由 开发 人员完成， SQA 人员辅助。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-260</span><span>填空题</span></p>
        <p class="csdn-question">单元测试是对软件基本组成单元进行的测试，一般在代码完成后由 开发 人员完成， SQA 人员辅助。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">单元测试是对软件基本组成单元进行的测试，一般在代码完成后由 开发 人员完成， SQA 人员辅助。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="测试相关未分类习题 填空题 为了将数据库性能、应用程序和系统参数优化，通常对 数据库应用服务器 进行测试。 为了将数据库性能、应用程序和系统参数优化，通常对 数据库应用服务器 进行测试。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-261</span><span>填空题</span></p>
        <p class="csdn-question">为了将数据库性能、应用程序和系统参数优化，通常对 数据库应用服务器 进行测试。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">为了将数据库性能、应用程序和系统参数优化，通常对 数据库应用服务器 进行测试。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="测试相关未分类习题 填空题 恢复测试主要检查系统的 容错能力 。 恢复测试主要检查系统的 容错能力 。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-262</span><span>填空题</span></p>
        <p class="csdn-question">恢复测试主要检查系统的 容错能力 。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">恢复测试主要检查系统的 容错能力 。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="测试相关未分类习题 填空题 容错性 测试是检查软件在异常条件下自身是否具有防护性的措施或者某种灾难性恢复的手段。 容错性 测试是检查软件在异常条件下自身是否具有防护性的措施或者某种灾难性恢复的手段。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-263</span><span>填空题</span></p>
        <p class="csdn-question">容错性 测试是检查软件在异常条件下自身是否具有防护性的措施或者某种灾难性恢复的手段。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">容错性 测试是检查软件在异常条件下自身是否具有防护性的措施或者某种灾难性恢复的手段。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="测试相关未分类习题 填空题 验收测试在软件产品完成了 功能 测试和 系统 测试之后、产品发布之前所进行的软件测试活动它是技术测试的最后一个阶段,也称为交付测试。 验收测试在软件产品完成了 功能 测试和 系统 测试之后、产品发布之前所进行的软件测试活动它是技术测试的最后一个阶段,也称为交付测试。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-264</span><span>填空题</span></p>
        <p class="csdn-question">验收测试在软件产品完成了 功能 测试和 系统 测试之后、产品发布之前所进行的软件测试活动它是技术测试的最后一个阶段,也称为交付测试。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">验收测试在软件产品完成了 功能 测试和 系统 测试之后、产品发布之前所进行的软件测试活动它是技术测试的最后一个阶段,也称为交付测试。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="测试相关未分类习题 填空题 安全性分为两个层次，即 应用程序 级别的安全性和 系统 级别的安全性。 安全性分为两个层次，即 应用程序 级别的安全性和 系统 级别的安全性。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-265</span><span>填空题</span></p>
        <p class="csdn-question">安全性分为两个层次，即 应用程序 级别的安全性和 系统 级别的安全性。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">安全性分为两个层次，即 应用程序 级别的安全性和 系统 级别的安全性。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="测试相关未分类习题 填空题 性能 测试的目的：为了验证系统是否达到用户提出的性能指标，同时发现系统中存在的性能瓶颈，起到优化系统的目的。 性能 测试的目的：为了验证系统是否达到用户提出的性能指标，同时发现系统中存在的性能瓶颈，起到优化系统的目的。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-266</span><span>填空题</span></p>
        <p class="csdn-question">性能 测试的目的：为了验证系统是否达到用户提出的性能指标，同时发现系统中存在的性能瓶颈，起到优化系统的目的。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">性能 测试的目的：为了验证系统是否达到用户提出的性能指标，同时发现系统中存在的性能瓶颈，起到优化系统的目的。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="测试相关未分类习题 填空题 静态测试技术主要使用的分析方法包括： 走查 、 审查 、 评审 。 静态测试技术主要使用的分析方法包括： 走查 、 审查 、 评审 。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-267</span><span>填空题</span></p>
        <p class="csdn-question">静态测试技术主要使用的分析方法包括： 走查 、 审查 、 评审 。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">静态测试技术主要使用的分析方法包括： 走查 、 审查 、 评审 。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="测试相关未分类习题 选择题 下列关于系统测试的描述，正确的是（ 不仅执行功能性测试，还考虑非功能性测试；主要采用黑盒测试技术；参与人员可能包括项目团队成员、市场人员以及客户代表等；需要在多种运行环境下进行测试 ） 下列关于系统测试的描述，正确的是（ 不仅执行功能性测试，还考虑非功能性测试；主要采用黑盒测试技术；参与人员可能包括项目团队成员、市场人员以及客户代表等；需要在多种运行环境下进行测试 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-268</span><span>选择题</span></p>
        <p class="csdn-question">下列关于系统测试的描述，正确的是（ 不仅执行功能性测试，还考虑非功能性测试；主要采用黑盒测试技术；参与人员可能包括项目团队成员、市场人员以及客户代表等；需要在多种运行环境下进行测试 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">下列关于系统测试的描述，正确的是（ 不仅执行功能性测试，还考虑非功能性测试；主要采用黑盒测试技术；参与人员可能包括项目团队成员、市场人员以及客户代表等；需要在多种运行环境下进行测试 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="测试相关未分类习题 选择题 以下描述中哪个是正确的：（ 驱动模块是对原始模块的功能的模拟 ） 以下描述中哪个是正确的：（ 驱动模块是对原始模块的功能的模拟 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-269</span><span>选择题</span></p>
        <p class="csdn-question">以下描述中哪个是正确的：（ 驱动模块是对原始模块的功能的模拟 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">以下描述中哪个是正确的：（ 驱动模块是对原始模块的功能的模拟 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="测试相关未分类习题 选择题 对于软件的β测试，下列描述正确的是（ β测试就是在软件公司外部展开的测试，可以由非专业的测试人员执行的测试 ） 对于软件的β测试，下列描述正确的是（ β测试就是在软件公司外部展开的测试，可以由非专业的测试人员执行的测试 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-270</span><span>选择题</span></p>
        <p class="csdn-question">对于软件的β测试，下列描述正确的是（ β测试就是在软件公司外部展开的测试，可以由非专业的测试人员执行的测试 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">对于软件的β测试，下列描述正确的是（ β测试就是在软件公司外部展开的测试，可以由非专业的测试人员执行的测试 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="测试相关未分类习题 选择题 系统测试是将软件系统与硬件、外设和网络等其他因素结合，对整个软件系统进行测试。（ 路径测试 ）不是系统测试的内容。 系统测试是将软件系统与硬件、外设和网络等其他因素结合，对整个软件系统进行测试。（ 路径测试 ）不是系统测试的内容。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-271</span><span>选择题</span></p>
        <p class="csdn-question">系统测试是将软件系统与硬件、外设和网络等其他因素结合，对整个软件系统进行测试。（ 路径测试 ）不是系统测试的内容。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">系统测试是将软件系统与硬件、外设和网络等其他因素结合，对整个软件系统进行测试。（ 路径测试 ）不是系统测试的内容。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="测试相关未分类习题 选择题 白盒测试法和黑盒测试法均可用于测试程序的内部结构。其中，（ 白盒测试法 ）将程序看做是路径的集合。 白盒测试法和黑盒测试法均可用于测试程序的内部结构。其中，（ 白盒测试法 ）将程序看做是路径的集合。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-272</span><span>选择题</span></p>
        <p class="csdn-question">白盒测试法和黑盒测试法均可用于测试程序的内部结构。其中，（ 白盒测试法 ）将程序看做是路径的集合。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">白盒测试法和黑盒测试法均可用于测试程序的内部结构。其中，（ 白盒测试法 ）将程序看做是路径的集合。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="测试相关未分类习题 选择题 以下关于语句覆盖和判定覆盖的关系描述正确的是？（ 100%判定覆盖保证 100%语句覆盖 ） 以下关于语句覆盖和判定覆盖的关系描述正确的是？（ 100%判定覆盖保证 100%语句覆盖 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-273</span><span>选择题</span></p>
        <p class="csdn-question">以下关于语句覆盖和判定覆盖的关系描述正确的是？（ 100%判定覆盖保证 100%语句覆盖 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">以下关于语句覆盖和判定覆盖的关系描述正确的是？（ 100%判定覆盖保证 100%语句覆盖 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="测试相关未分类习题 选择题 程序变异的用途不包括（ 减少测试的工作量 ） 程序变异的用途不包括（ 减少测试的工作量 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-274</span><span>选择题</span></p>
        <p class="csdn-question">程序变异的用途不包括（ 减少测试的工作量 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">程序变异的用途不包括（ 减少测试的工作量 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="测试相关未分类习题 选择题 软件测试过程中的集成测试主要是为了发现（ 概要设计 ）阶段的错误。 软件测试过程中的集成测试主要是为了发现（ 概要设计 ）阶段的错误。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-275</span><span>选择题</span></p>
        <p class="csdn-question">软件测试过程中的集成测试主要是为了发现（ 概要设计 ）阶段的错误。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">软件测试过程中的集成测试主要是为了发现（ 概要设计 ）阶段的错误。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="测试相关未分类习题 选择题 配置测试是指（ 使用各种硬件或参数来测试软件的过程 ） 配置测试是指（ 使用各种硬件或参数来测试软件的过程 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-276</span><span>选择题</span></p>
        <p class="csdn-question">配置测试是指（ 使用各种硬件或参数来测试软件的过程 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">配置测试是指（ 使用各种硬件或参数来测试软件的过程 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="测试相关未分类习题 选择题 在（ 变异测试 ）的指导下，测试人员可以评价测试用例集的错误检测能力，创建错误检测能力更强的测试数据集。 在（ 变异测试 ）的指导下，测试人员可以评价测试用例集的错误检测能力，创建错误检测能力更强的测试数据集。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-277</span><span>选择题</span></p>
        <p class="csdn-question">在（ 变异测试 ）的指导下，测试人员可以评价测试用例集的错误检测能力，创建错误检测能力更强的测试数据集。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">在（ 变异测试 ）的指导下，测试人员可以评价测试用例集的错误检测能力，创建错误检测能力更强的测试数据集。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="测试相关未分类习题 选择题 软件验收测试合格通过的标准不包括（ 至少有一项软件功能超出软件需求分析说明书中的定义，属于软件特色功能。 ） 软件验收测试合格通过的标准不包括（ 至少有一项软件功能超出软件需求分析说明书中的定义，属于软件特色功能。 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-278</span><span>选择题</span></p>
        <p class="csdn-question">软件验收测试合格通过的标准不包括（ 至少有一项软件功能超出软件需求分析说明书中的定义，属于软件特色功能。 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">软件验收测试合格通过的标准不包括（ 至少有一项软件功能超出软件需求分析说明书中的定义，属于软件特色功能。 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="测试相关未分类习题 选择题 几乎所有的性能测试都会涉及（ 并发测试 ） 几乎所有的性能测试都会涉及（ 并发测试 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-279</span><span>选择题</span></p>
        <p class="csdn-question">几乎所有的性能测试都会涉及（ 并发测试 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">几乎所有的性能测试都会涉及（ 并发测试 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="测试相关未分类习题 选择题 采用程序插桩一般是为了获取程序执行的（ 过程状态 ）信息。 采用程序插桩一般是为了获取程序执行的（ 过程状态 ）信息。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-280</span><span>选择题</span></p>
        <p class="csdn-question">采用程序插桩一般是为了获取程序执行的（ 过程状态 ）信息。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">采用程序插桩一般是为了获取程序执行的（ 过程状态 ）信息。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="测试相关未分类习题 选择题 以下关于集成测试的内容正确的表述有（ 全部正确 ）。 ‏①集成测试也叫组装测试或者联合测试； ‏②在把各个模块连接起来的时候，穿越模块接口的数据是否会丢失； ‏③一个模块的功能是否会对另一个模块的功能产生不利的影响； ‏④各个子功能组合起来，能否达到预期要求的父功能；‏ ⑤全局数据结构是否有问题；... 以下关于集成测试的内容正确的表述有（ 全部正确 ）。 ‏①集成测试也叫组装测试或者联合测试； ‏②在把各个模块连接起来的时候，穿越模块接口的数据是否会丢失； ‏③一个模块的功能是否会对另一个模块的功能产生不利的影响； ‏④各个子功能组合起来，能否达到预期要求的父功能；‏ ⑤全局数据结构是否有问题； ‏⑥单个模块的误差累积起来，是否会放大，从而达到不能接受的程度；">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-281</span><span>选择题</span></p>
        <p class="csdn-question">以下关于集成测试的内容正确的表述有（ 全部正确 ）。 ‏①集成测试也叫组装测试或者联合测试； ‏②在把各个模块连接起来的时候，穿越模块接口的数据是否会丢失； ‏③一个模块的功能是否会对另一个模块的功能产生不利的影响； ‏④各个子功能组合起来，能否达到预期要求的父功能；‏ ⑤全局数据结构是否有问题；...</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">以下关于集成测试的内容正确的表述有（ 全部正确 ）。 ‏①集成测试也叫组装测试或者联合测试； ‏②在把各个模块连接起来的时候，穿越模块接口的数据是否会丢失； ‏③一个模块的功能是否会对另一个模块的功能产生不利的影响； ‏④各个子功能组合起来，能否达到预期要求的父功能；‏ ⑤全局数据结构是否有问题； ‏⑥单个模块的误差累积起来，是否会放大，从而达到不能接受的程度；</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="测试相关未分类习题 选择题 应该在软件的其它部分使用该类之前来执行对类的测试。防止因未经测试的类被使用而导致（ 缺陷传导和扩散 ） 应该在软件的其它部分使用该类之前来执行对类的测试。防止因未经测试的类被使用而导致（ 缺陷传导和扩散 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-282</span><span>选择题</span></p>
        <p class="csdn-question">应该在软件的其它部分使用该类之前来执行对类的测试。防止因未经测试的类被使用而导致（ 缺陷传导和扩散 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">应该在软件的其它部分使用该类之前来执行对类的测试。防止因未经测试的类被使用而导致（ 缺陷传导和扩散 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="测试相关未分类习题 选择题 面向对象软件测试是根据面向对象的软件开发过程结合面向对象的特点提出的。它不包括：（ 对象封装测试 ） 面向对象软件测试是根据面向对象的软件开发过程结合面向对象的特点提出的。它不包括：（ 对象封装测试 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-283</span><span>选择题</span></p>
        <p class="csdn-question">面向对象软件测试是根据面向对象的软件开发过程结合面向对象的特点提出的。它不包括：（ 对象封装测试 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">面向对象软件测试是根据面向对象的软件开发过程结合面向对象的特点提出的。它不包括：（ 对象封装测试 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="测试相关未分类习题 选择题 如果父类带有缺陷，派生出的（ 子类 ）也会带有缺陷。继承使代码的重用率得到了提高，但同时也使缺陷的传播几率增加。 如果父类带有缺陷，派生出的（ 子类 ）也会带有缺陷。继承使代码的重用率得到了提高，但同时也使缺陷的传播几率增加。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-284</span><span>选择题</span></p>
        <p class="csdn-question">如果父类带有缺陷，派生出的（ 子类 ）也会带有缺陷。继承使代码的重用率得到了提高，但同时也使缺陷的传播几率增加。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">如果父类带有缺陷，派生出的（ 子类 ）也会带有缺陷。继承使代码的重用率得到了提高，但同时也使缺陷的传播几率增加。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="测试相关未分类习题 选择题 下列关于alpha测试的描述中正确的是（ alpha测试是验收测试的一种 ） 下列关于alpha测试的描述中正确的是（ alpha测试是验收测试的一种 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-285</span><span>选择题</span></p>
        <p class="csdn-question">下列关于alpha测试的描述中正确的是（ alpha测试是验收测试的一种 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">下列关于alpha测试的描述中正确的是（ alpha测试是验收测试的一种 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="测试相关未分类习题 选择题 用于考察当前软硬件环境下软件系统所能承受的最大负荷并帮助找出系统瓶颈所在的是（ 压力测试 ） 用于考察当前软硬件环境下软件系统所能承受的最大负荷并帮助找出系统瓶颈所在的是（ 压力测试 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-286</span><span>选择题</span></p>
        <p class="csdn-question">用于考察当前软硬件环境下软件系统所能承受的最大负荷并帮助找出系统瓶颈所在的是（ 压力测试 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">用于考察当前软硬件环境下软件系统所能承受的最大负荷并帮助找出系统瓶颈所在的是（ 压力测试 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="测试相关未分类习题 选择题 错误推测法的基本想法是：（ 列举出程序中所有可能有的错误和容易发生错误的特殊情况，根据它们选择测试用例 ） 错误推测法的基本想法是：（ 列举出程序中所有可能有的错误和容易发生错误的特殊情况，根据它们选择测试用例 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-287</span><span>选择题</span></p>
        <p class="csdn-question">错误推测法的基本想法是：（ 列举出程序中所有可能有的错误和容易发生错误的特殊情况，根据它们选择测试用例 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">错误推测法的基本想法是：（ 列举出程序中所有可能有的错误和容易发生错误的特殊情况，根据它们选择测试用例 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="测试相关未分类习题 选择题 以下不属于集成测试的是（ 函数内局部变量的值是否为预期值 ） 以下不属于集成测试的是（ 函数内局部变量的值是否为预期值 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-288</span><span>选择题</span></p>
        <p class="csdn-question">以下不属于集成测试的是（ 函数内局部变量的值是否为预期值 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">以下不属于集成测试的是（ 函数内局部变量的值是否为预期值 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="测试相关未分类习题 选择题 常见的覆盖率标准不包括（ 函数覆盖 ） 常见的覆盖率标准不包括（ 函数覆盖 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-289</span><span>选择题</span></p>
        <p class="csdn-question">常见的覆盖率标准不包括（ 函数覆盖 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">常见的覆盖率标准不包括（ 函数覆盖 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="测试相关未分类习题 选择题 对已经发现的错误进行错误定位和确定出错性质，并改正这些错误，同时修改相关的文档，这种行为属于（ 调试 ） 对已经发现的错误进行错误定位和确定出错性质，并改正这些错误，同时修改相关的文档，这种行为属于（ 调试 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-290</span><span>选择题</span></p>
        <p class="csdn-question">对已经发现的错误进行错误定位和确定出错性质，并改正这些错误，同时修改相关的文档，这种行为属于（ 调试 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">对已经发现的错误进行错误定位和确定出错性质，并改正这些错误，同时修改相关的文档，这种行为属于（ 调试 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="测试相关未分类习题 选择题 （ 数据流测试 ）是一种关注变量定义赋值点（语句）和引用或使用这些值的点（语句）的结构性测试，主要用作路径测试的真实性检查。 （ 数据流测试 ）是一种关注变量定义赋值点（语句）和引用或使用这些值的点（语句）的结构性测试，主要用作路径测试的真实性检查。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-291</span><span>选择题</span></p>
        <p class="csdn-question">（ 数据流测试 ）是一种关注变量定义赋值点（语句）和引用或使用这些值的点（语句）的结构性测试，主要用作路径测试的真实性检查。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">（ 数据流测试 ）是一种关注变量定义赋值点（语句）和引用或使用这些值的点（语句）的结构性测试，主要用作路径测试的真实性检查。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="测试相关未分类习题 选择题 在单元测试的基础上，需要将所有模块按照概要设计和详细设计说明书的要求进行组装，模块组装成系统的方式有两种，分别是（ 一次性组装和增殖性组装 ） 在单元测试的基础上，需要将所有模块按照概要设计和详细设计说明书的要求进行组装，模块组装成系统的方式有两种，分别是（ 一次性组装和增殖性组装 ）">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-292</span><span>选择题</span></p>
        <p class="csdn-question">在单元测试的基础上，需要将所有模块按照概要设计和详细设计说明书的要求进行组装，模块组装成系统的方式有两种，分别是（ 一次性组装和增殖性组装 ）</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">在单元测试的基础上，需要将所有模块按照概要设计和详细设计说明书的要求进行组装，模块组装成系统的方式有两种，分别是（ 一次性组装和增殖性组装 ）</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="测试相关未分类习题 判断题 功能测试是系统测试的主要内容，检查系统的功能、性能是否与需求规格说明相同。 功能测试是系统测试的主要内容，检查系统的功能、性能是否与需求规格说明相同。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-293</span><span>判断题</span></p>
        <p class="csdn-question">功能测试是系统测试的主要内容，检查系统的功能、性能是否与需求规格说明相同。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">功能测试是系统测试的主要内容，检查系统的功能、性能是否与需求规格说明相同。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="测试相关未分类习题 判断题 软件测试员可以对产品说明书进行白盒测试。 软件测试员可以对产品说明书进行白盒测试。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-294</span><span>判断题</span></p>
        <p class="csdn-question">软件测试员可以对产品说明书进行白盒测试。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">软件测试员可以对产品说明书进行白盒测试。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="测试相关未分类习题 判断题 压力测试通常需要辅助工具的支持。 压力测试通常需要辅助工具的支持。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-295</span><span>判断题</span></p>
        <p class="csdn-question">压力测试通常需要辅助工具的支持。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">压力测试通常需要辅助工具的支持。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="测试相关未分类习题 判断题 自动化测试可能延误项目进度。 自动化测试可能延误项目进度。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-296</span><span>判断题</span></p>
        <p class="csdn-question">自动化测试可能延误项目进度。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">自动化测试可能延误项目进度。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="测试相关未分类习题 判断题 验收测试是以最终用户为主的测试。 验收测试是以最终用户为主的测试。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-297</span><span>判断题</span></p>
        <p class="csdn-question">验收测试是以最终用户为主的测试。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">验收测试是以最终用户为主的测试。</p>
        </details>
      </article>
      <article class="csdn-card" data-sqe-card data-csdn-card data-csdn-text="测试相关未分类习题 判断题 自底向上集成需要测试员编写驱动程序。 自底向上集成需要测试员编写驱动程序。">
        <p class="csdn-meta"><span class="csdn-pill">CSDN-298</span><span>判断题</span></p>
        <p class="csdn-question">自底向上集成需要测试员编写驱动程序。</p>
        <details><summary>展开原文条目/答案</summary>
          <p class="csdn-full">自底向上集成需要测试员编写驱动程序。</p>
        </details>
      </article>
    </div>
  </section>
    </main>
  </div>
</div>

<script>
(function () {
  var input = document.getElementById('csdnSearch');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-csdn-card]'));
  var count = document.getElementById('csdnCount');
  var empty = document.getElementById('csdnEmpty');
  function norm(value) { return String(value || '').toLowerCase().replace(/\s+/g, ''); }
  function apply() {
    var q = norm(input && input.value);
    var visible = 0;
    cards.forEach(function (card) {
      var hit = !q || norm(card.getAttribute('data-csdn-text')).indexOf(q) !== -1;
      card.style.display = hit ? '' : 'none';
      if (hit) visible += 1;
    });
    if (count) count.textContent = '当前显示 ' + visible + ' / ' + cards.length + ' 条 CSDN 题目/题组';
    if (empty) empty.style.display = visible ? 'none' : 'block';
  }
  if (input) input.addEventListener('input', apply);
  apply();
})();
</script>
