---
title: "软件质量与测试复习网络 · 10 软件测试"
date: 2026-06-23 12:40:00
description: "《软件质量与测试》期末复习二级章节页：软件测试：目标、原则、过程、用例、调试。面向零基础同学，整理本章知识点、易混点、简答模板和自测题。"
---
<link rel="stylesheet" href="/css/software-quality-review-chapters.css?v=20260623-1">
<link rel="stylesheet" href="/css/software-quality-mobile-voice.css?v=20260623-1">
<script defer src="/js/software-quality-voice.js?v=20260623-1"></script>
<article class="sqc-page">
<section class="sqc-hero">
<div>
<div class="sqc-kicker">软件质量与测试 · 章节精讲 10</div>
<h2>软件测试：目标、原则、过程、用例、调试</h2>
<p>测试不是证明软件完全没错，而是通过设计和执行活动尽可能发现缺陷、评价质量并降低风险。零基础同学要先建立这个观念，否则容易把测试误解成“跑一下看看”。</p>
<div class="sqc-actions">
<a class="sqc-chip" href="/courses/software-quality-review-network/">返回总复习页</a>
<a class="sqc-chip" href="/courses/software-quality-review-network/#detail-10">回到本章总目录卡片</a>
<a class="sqc-chip" href="/courses/software-quality-review-network/#ch08">刷本章题库</a>
<a class="sqc-chip" href="/courses/software-quality-design-questions/">大题专项</a>
</div>
</div>
<aside class="sqc-hero-side" aria-label="本章考试信息">
<div><strong>资料来源</strong><p>测试基本理论、考试回忆、课堂练习</p></div>
<div><strong>考试位置</strong><p>常考测试定义、测试目标、测试原则、测试过程、测试用例、静态/动态测试、测试与调试、回归测试。</p></div>
<div><strong>本页定位</strong><p>先讲懂概念，再给背诵句和题型，不要求有编程基础。</p></div>
</aside>
</section>
<nav class="sqc-nav" aria-label="本章页内目录">
<a class="sqc-chip" href="#core">完整知识点</a>
<a class="sqc-chip" href="#map">知识网络</a>
<a class="sqc-chip" href="#must">必背句</a>
<a class="sqc-chip" href="#confuse">易混点</a>
<a class="sqc-chip" href="#templates">简答模板</a>
<a class="sqc-chip" href="#practice">自测题</a>
</nav>
<div class="sqc-layout">
<aside class="sqc-side" aria-label="固定章节目录">
<h3>本章目录</h3>
<a href="#core">完整知识点</a>
<a href="#map">知识网络</a>
<a href="#must">必背句</a>
<a href="#confuse">易混点</a>
<a href="#templates">简答模板</a>
<a href="#practice">自测题</a>
<a href="/courses/software-quality-review-network/chapter-10/">回到页首</a>
<a href="/courses/software-quality-review-network/">总复习页</a>
</aside>
<main class="sqc-main">
<section class="sqc-note">
<p><strong>学习顺序：</strong>先读“完整知识点”，把每句话变成能解释的话；再看“知识网络”，知道它会怎么出题；最后用“简答模板”和“自测题”检查能不能写到评分点。</p>
</section>
<h2 id="core" class="sqc-section-title">一、本章完整知识点</h2>
<section class="sqc-card">
<h3>10 软件测试必须会的内容</h3>
<ul class="sqc-list"><li>软件测试定义：为了发现错误而执行程序的过程。</li><li>测试对象可包括需求、设计、代码、文档、数据和运行环境。</li><li>测试目标是尽可能多发现缺陷，并评价软件质量和风险。</li><li>测试不能证明程序没有缺陷，只能提高对质量的信心。</li><li>测试原则包括追溯用户需求、尽早并不断测试、注意缺陷群集、回归测试、增量测试。</li><li>测试计划是做好测试工作的前提。</li><li>测试过程包括计划、设计用例、准备环境和数据、执行、记录缺陷、修复跟踪、回归、报告。</li><li>测试涉及输入信息、执行信息、输出/预期信息。</li><li>测试用例核心是输入数据和预期输出，完整时还包括前置条件、步骤、环境、实际结果。</li><li>静态测试不运行程序，如评审、走查、审查、静态分析。</li><li>动态测试运行程序并观察输出或行为。</li><li>测试发现错误，调试定位和修正错误。</li><li>回归测试是在修改后重测，确认修复有效且未破坏旧功能。</li><li>测试停止标准要结合缺陷数量、风险、覆盖程度和测试投入成本判断。</li></ul>
</section>
<h2 id="map" class="sqc-section-title">二、知识网络：概念怎么连起来</h2>
<div class="sqc-table-wrap">
<table class="sqc-table">
<thead><tr><th>知识点</th><th>零基础理解</th><th>考试问法</th></tr></thead>
<tbody>
<tr><td>测试定义</td><td>为发现错误而执行程序</td><td>填空高频</td></tr><tr><td>测试原则</td><td>需求追溯、尽早、缺陷群集、回归</td><td>选择判断</td></tr><tr><td>测试用例</td><td>输入 + 预期输出 + 条件步骤</td><td>填空</td></tr><tr><td>测试/调试</td><td>发现错误 / 定位修正</td><td>对比题</td></tr>
</tbody>
</table>
</div>
<h2 id="must" class="sqc-section-title">三、必背句：考试写成这样就比较稳</h2>
<section class="sqc-grid">
<article class="sqc-mini"><h4>背诵句</h4><p>测试不能证明软件没有缺陷，只能说明在已执行测试下没有发现某些缺陷。</p></article><article class="sqc-mini"><h4>背诵句</h4><p>测试要从需求开始追溯，不能只看代码。</p></article><article class="sqc-mini"><h4>背诵句</h4><p>缺陷有群集现象，发现问题多的模块要重点测。</p></article>
</section>
<h2 id="confuse" class="sqc-section-title">四、易混点：判断选择最容易错在这里</h2>
<section class="sqc-card">
<ul class="sqc-list"><li>静态测试不运行程序，动态测试运行程序。</li><li>测试发现错误，调试修正错误，两者职责不同。</li><li>回归测试不是重新测全部内容，而是根据修改影响范围选择重测。</li></ul>
</section>
<h2 id="templates" class="sqc-section-title">五、简答模板：按评分点组织语言</h2>
<section class="sqc-grid">
<article class="sqc-card">
<span class="sqc-badge hot">简答模板</span>
<h3>简述软件测试的原则。</h3>
<p>测试应追溯用户需求，尽早开始并贯穿开发过程；测试用例应包括合理输入和不合理输入；注意缺陷群集现象，对高风险模块重点测试；修改后要进行回归测试；测试应有计划、可记录、可重复，并结合风险和成本确定停止标准。</p>
</article>
<article class="sqc-card">
<span class="sqc-badge hot">简答模板</span>
<h3>测试与调试有什么区别？</h3>
<p>测试的目标是通过执行或检查发现错误和评价质量，通常由测试人员或开发人员执行；调试是在发现错误后定位原因并修改程序，通常由开发人员完成。测试回答有没有问题，调试回答问题在哪里以及如何修。</p>
</article>
</section>
<h2 id="practice" class="sqc-section-title">六、本章自测题</h2>
<section class="sqc-card">
<h3>先自己答，再回总复习页刷对应题库</h3>
<div class="sqc-question">
<p><strong>自测 1：</strong>判断：成功的测试是没有发现任何缺陷的测试。</p>
</div>
<div class="sqc-question">
<p><strong>自测 2：</strong>填空：测试用例至少应包括输入数据和预期输出。</p>
</div>
<div class="sqc-question">
<p><strong>自测 3：</strong>简答：为什么测试不能证明程序没有缺陷？</p>
</div>
</section>
<section class="sqc-note">
<p><strong>下一步：</strong>本章看完后，回到<a href="/courses/software-quality-review-network/#ch08">总复习页题库</a>做对应题；如果是 11-12 章，再去<a href="/courses/software-quality-design-questions/">设计题专项</a>按卷面步骤练。</p>
</section>
<nav class="sqc-page-turn" aria-label="章节翻页">
<a class="sqc-chip" href="/courses/software-quality-review-network/chapter-09/">上一章：09 高质量编程</a>
<a class="sqc-chip" href="/courses/software-quality-review-network/chapter-11/">下一章：11 白盒测试</a>
</nav>
</main>
</div>
</article>
