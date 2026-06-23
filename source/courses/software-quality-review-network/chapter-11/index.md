---
title: "软件质量与测试复习网络 · 11 白盒测试"
date: 2026-06-23 12:40:00
description: "《软件质量与测试》期末复习二级章节页：白盒测试：覆盖准则、控制流、数据流、基本路径。面向零基础同学，整理本章知识点、易混点、简答模板和自测题。"
---
<link rel="stylesheet" href="/css/software-quality-review-chapters.css?v=20260623-1">
<article class="sqc-page">
<section class="sqc-hero">
<div>
<div class="sqc-kicker">软件质量与测试 · 章节精讲 11</div>
<h2>白盒测试：覆盖准则、控制流、数据流、基本路径</h2>
<p>白盒测试把程序内部结构打开来看，根据代码逻辑设计测试用例。大题里最重要的是：画控制流图、算环路复杂度、列基本路径、为路径设计测试用例。</p>
<div class="sqc-actions">
<a class="sqc-chip" href="/courses/software-quality-review-network/">返回总复习页</a>
<a class="sqc-chip" href="/courses/software-quality-review-network/#detail-11">回到本章总目录卡片</a>
<a class="sqc-chip" href="/courses/software-quality-review-network/#ch11">刷本章题库</a>
<a class="sqc-chip" href="/courses/software-quality-design-questions/">大题专项</a>
</div>
</div>
<aside class="sqc-hero-side" aria-label="本章考试信息">
<div><strong>资料来源</strong><p>测试基本理论、往年大题、设计题专项</p></div>
<div><strong>考试位置</strong><p>大题高频：控制流图、环路复杂度、基本路径、测试用例；客观题考覆盖准则和白盒概念。</p></div>
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
<a href="/courses/software-quality-review-network/chapter-11/">回到页首</a>
<a href="/courses/software-quality-review-network/">总复习页</a>
</aside>
<main class="sqc-main">
<section class="sqc-note">
<p><strong>学习顺序：</strong>先读“完整知识点”，把每句话变成能解释的话；再看“知识网络”，知道它会怎么出题；最后用“简答模板”和“自测题”检查能不能写到评分点。</p>
</section>
<h2 id="core" class="sqc-section-title">一、本章完整知识点</h2>
<section class="sqc-card">
<h3>11 白盒测试必须会的内容</h3>
<ul class="sqc-list"><li>白盒测试也称结构测试或逻辑驱动测试。</li><li>白盒依据程序内部逻辑结构设计或选择测试用例。</li><li>白盒常用于单元测试，也可用于部分集成测试。</li><li>检查重点包括模块接口、局部数据结构、边界条件、独立路径、内部错误处理。</li><li>语句覆盖要求每条可执行语句至少执行一次，发现错误能力较弱。</li><li>判定覆盖要求每个判定的真/假分支至少执行一次。</li><li>条件覆盖要求每个条件取真和假的情况至少出现一次。</li><li>判定/条件覆盖要求判定结果和条件结果都覆盖。</li><li>条件组合覆盖要求每个判定中条件结果的所有组合至少出现一次。</li><li>路径覆盖要求覆盖程序可能执行路径，覆盖强但成本高。</li><li>控制流图中节点表示基本块，边表示控制转移。</li><li>环路复杂度 V(G)=E-N+2P，也可用区域数或判定节点数+1。</li><li>基本路径数量通常等于环路复杂度，每条路径至少引入一条新边。</li><li>数据流测试关注变量定义-使用链，可发现未初始化、定义后未用等问题。</li><li>覆盖率 100% 不等于没有缺陷。</li></ul>
</section>
<h2 id="map" class="sqc-section-title">二、知识网络：概念怎么连起来</h2>
<div class="sqc-table-wrap">
<table class="sqc-table">
<thead><tr><th>知识点</th><th>零基础理解</th><th>考试问法</th></tr></thead>
<tbody>
<tr><td>覆盖准则</td><td>语句、判定、条件、组合、路径</td><td>客观题</td></tr><tr><td>控制流图</td><td>节点基本块，边控制转移</td><td>大题步骤 1</td></tr><tr><td>环路复杂度</td><td>E-N+2P/区域数/判定+1</td><td>大题步骤 2</td></tr><tr><td>基本路径</td><td>数量等于复杂度</td><td>大题步骤 3</td></tr>
</tbody>
</table>
</div>
<h2 id="must" class="sqc-section-title">三、必背句：考试写成这样就比较稳</h2>
<section class="sqc-grid">
<article class="sqc-mini"><h4>背诵句</h4><p>语句覆盖最弱，因为执行了语句不代表判定真假都测过。</p></article><article class="sqc-mini"><h4>背诵句</h4><p>路径覆盖强但路径数量可能爆炸，不一定现实。</p></article><article class="sqc-mini"><h4>背诵句</h4><p>大题要写图、公式、路径和用例，不能只写最后答案。</p></article>
</section>
<h2 id="confuse" class="sqc-section-title">四、易混点：判断选择最容易错在这里</h2>
<section class="sqc-card">
<ul class="sqc-list"><li>条件覆盖不一定满足判定覆盖，判定覆盖也不一定满足条件覆盖。</li><li>基本路径不是随便列所有路径，而是线性独立路径集合。</li><li>复杂度算法中 P 是连通分量数，单个程序通常 P=1。</li></ul>
</section>
<h2 id="templates" class="sqc-section-title">五、简答模板：按评分点组织语言</h2>
<section class="sqc-grid">
<article class="sqc-card">
<span class="sqc-badge hot">简答模板</span>
<h3>基本路径测试题怎么做？</h3>
<p>先根据代码画控制流图；再计算环路复杂度 V(G)=E-N+2P，也可用区域数或判定节点数+1 校验；然后列出与复杂度数量相同的基本路径，保证每条路径引入新边；最后为每条路径设计输入数据和预期输出。</p>
</article>
<article class="sqc-card">
<span class="sqc-badge hot">简答模板</span>
<h3>比较语句覆盖、判定覆盖和条件覆盖。</h3>
<p>语句覆盖要求每条可执行语句至少执行一次，覆盖最弱；判定覆盖要求每个判定的真假分支至少执行一次；条件覆盖要求每个判定中的每个条件都至少取真和假一次。三者关注点不同，不能简单互相替代。</p>
</article>
</section>
<h2 id="practice" class="sqc-section-title">六、本章自测题</h2>
<section class="sqc-card">
<h3>先自己答，再回总复习页刷对应题库</h3>
<div class="sqc-question">
<p><strong>自测 1：</strong>判断：语句覆盖达到 100% 就一定覆盖了所有判定分支。</p>
</div>
<div class="sqc-question">
<p><strong>自测 2：</strong>计算：某程序有 4 个判定节点，单入口单出口，环路复杂度是多少？</p>
</div>
<div class="sqc-question">
<p><strong>自测 3：</strong>大题：给一段含 if 和 while 的代码，画控制流图并设计基本路径测试用例。</p>
</div>
</section>
<section class="sqc-note">
<p><strong>下一步：</strong>本章看完后，回到<a href="/courses/software-quality-review-network/#ch11">总复习页题库</a>做对应题；如果是 11-12 章，再去<a href="/courses/software-quality-design-questions/">设计题专项</a>按卷面步骤练。</p>
</section>
<nav class="sqc-page-turn" aria-label="章节翻页">
<a class="sqc-chip" href="/courses/software-quality-review-network/chapter-10/">上一章：10 软件测试</a>
<a class="sqc-chip" href="/courses/software-quality-review-network/chapter-12/">下一章：12 黑盒测试</a>
</nav>
</main>
</div>
</article>
