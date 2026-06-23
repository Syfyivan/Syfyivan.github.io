---
title: "软件质量与测试复习网络 · 04 软件质量度量"
date: 2026-06-23 12:40:00
description: "《软件质量与测试》期末复习二级章节页：软件质量度量：测量、度量、指标、尺度、复杂度。面向零基础同学，整理本章知识点、易混点、简答模板和自测题。"
---
<link rel="stylesheet" href="/css/software-quality-review-chapters.css?v=20260623-1">
<link rel="stylesheet" href="/css/software-quality-mobile-voice.css?v=20260623-1">
<script defer src="/js/software-quality-voice.js?v=20260623-1"></script>
<article class="sqc-page">
<section class="sqc-hero">
<div>
<div class="sqc-kicker">软件质量与测试 · 章节精讲 04</div>
<h2>软件质量度量：测量、度量、指标、尺度、复杂度</h2>
<p>这一章把“质量好不好”变成“能不能用数字和规则表达”。零基础同学先记住：测量是赋值，度量是软件领域更广的测度，指标是用来解释状态的度量或组合。</p>
<div class="sqc-actions">
<a class="sqc-chip" href="/courses/software-quality-review-network/">返回总复习页</a>
<a class="sqc-chip" href="/courses/software-quality-review-network/#detail-04">回到本章总目录卡片</a>
<a class="sqc-chip" href="/courses/software-quality-review-network/#ch04">看本章练习</a>
<a class="sqc-chip" href="/courses/software-quality-design-questions/">大题专项</a>
</div>
</div>
<aside class="sqc-hero-side" aria-label="本章考试信息">
<div><strong>资料来源</strong><p>PPT 4、A 卷/2024 回忆中的设计题基础</p></div>
<div><strong>考试位置</strong><p>常考测量/度量/指标、有效性/可靠性、项目/产品/过程度量、基本测量原则、McCabe 环路复杂度。</p></div>
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
<a href="/courses/software-quality-review-network/chapter-04/">回到页首</a>
<a href="/courses/software-quality-review-network/">总复习页</a>
</aside>
<main class="sqc-main">
<section class="sqc-note">
<p><strong>学习顺序：</strong>先读“完整知识点”，把每句话变成能解释的话；再看“知识网络”，知道它会怎么出题；最后用“简答模板”和“自测题”检查能不能写到评分点。</p>
</section>
<h2 id="core" class="sqc-section-title">一、本章完整知识点</h2>
<section class="sqc-card">
<h3>04 软件质量度量必须会的内容</h3>
<ul class="sqc-list"><li>测量：按照规则给属性赋值。</li><li>度量：对软件产品、过程或项目进行范围较广的测度。</li><li>指标：一个度量或一组度量的组合，用来解释质量状况。</li><li>有效性：测量结果能正确反映被测对象实际状态。</li><li>可靠性：测量重复进行时结果稳定一致。</li><li>度量对象包括项目质量度量、产品质量度量、过程质量度量。</li><li>项目度量关注进度、风险、规模、工作量、顾客满意度。</li><li>产品度量关注规模、复杂度、设计特征、性能、质量水平。</li><li>过程度量关注缺陷移除效率、测试阶段缺陷、过程改进指标。</li><li>规模度量包括代码行、功能点、对象点、特征点。</li><li>复杂度度量用于估计或预测软件可测试性、可靠性、可维护性。</li><li>缺陷度量包括缺陷密度、缺陷分布、修复工作量、弱点分析。</li><li>McCabe 环路复杂度：V(G)=E-N+2P，也可用区域数或判定节点数+1。</li><li>基本测量原则：目标明确、定义一致、客观无二义、简单可算、结果可靠、自动化、反馈改进。</li></ul>
</section>
<h2 id="map" class="sqc-section-title">二、知识网络：概念怎么连起来</h2>
<div class="sqc-table-wrap">
<table class="sqc-table">
<thead><tr><th>知识点</th><th>零基础理解</th><th>考试问法</th></tr></thead>
<tbody>
<tr><td>测量</td><td>按规则赋值</td><td>填空定义</td></tr><tr><td>有效性</td><td>准</td><td>和可靠性对比</td></tr><tr><td>可靠性</td><td>稳</td><td>和有效性对比</td></tr><tr><td>环路复杂度</td><td>E-N+2P / 区域数 / 判定节点+1</td><td>设计大题必会</td></tr>
</tbody>
</table>
</div>
<h2 id="must" class="sqc-section-title">三、必背句：考试写成这样就比较稳</h2>
<section class="sqc-grid">
<article class="sqc-mini"><h4>背诵句</h4><p>有效性回答“测得准不准”，可靠性回答“重复测稳不稳”。</p></article><article class="sqc-mini"><h4>背诵句</h4><p>度量不是为了好看，而是为了理解状态、预测风险、支持改进。</p></article><article class="sqc-mini"><h4>背诵句</h4><p>环路复杂度是白盒基本路径测试的基础，基本路径数通常等于复杂度。</p></article>
</section>
<h2 id="confuse" class="sqc-section-title">四、易混点：判断选择最容易错在这里</h2>
<section class="sqc-card">
<ul class="sqc-list"><li>高可靠性不等于高有效性；一个错误尺子可以每次都量得很稳定。</li><li>代码行多不必然质量差，但规模增长通常会提高复杂度和风险。</li><li>环路复杂度的三种算法应相互校验，考试要写过程。</li></ul>
</section>
<h2 id="templates" class="sqc-section-title">五、简答模板：按评分点组织语言</h2>
<section class="sqc-grid">
<article class="sqc-card">
<span class="sqc-badge hot">简答模板</span>
<h3>简述软件度量的基本原则。</h3>
<p>软件度量应目标明确，度量对象和定义一致，度量规则客观无二义，方法尽量简单可计算，结果可靠并能重复，最好可以自动化采集，同时要把度量结果反馈到项目控制和过程改进中。</p>
</article>
<article class="sqc-card">
<span class="sqc-badge hot">简答模板</span>
<h3>如何计算 McCabe 环路复杂度？</h3>
<p>可用三种方法互相验证：根据控制流图计算 V(G)=E-N+2P；数控制流图中的区域数；或在单入口单出口结构中用判定节点数+1。大题中应先画控制流图，再列 E、N、P 或判定节点数量，最后得到基本路径数量。</p>
</article>
</section>
<h2 id="practice" class="sqc-section-title">六、本章自测题</h2>
<section class="sqc-card">
<h3>先自己答，再回总复习页看对应练习</h3>
<div class="sqc-question">
<p><strong>自测 1：</strong>填空：测量的有效性强调测量结果能够反映被测对象的实际状态，可靠性强调重复测量结果稳定。</p>
</div>
<div class="sqc-question">
<p><strong>自测 2：</strong>计算：某控制流图有 E=12、N=10、P=1，V(G)=多少？</p>
</div>
<div class="sqc-question">
<p><strong>自测 3：</strong>简答：为什么软件质量需要度量？</p>
</div>
</section>
<section class="sqc-note">
<p><strong>下一步：</strong>本章看完后，回到<a href="/courses/software-quality-review-network/#ch04">总复习页练习区</a>检查概念；如果是 11-12 章，再去<a href="/courses/software-quality-design-questions/">设计题专项</a>按卷面步骤练。</p>
</section>
<nav class="sqc-page-turn" aria-label="章节翻页">
<a class="sqc-chip" href="/courses/software-quality-review-network/chapter-03/">上一章：03 软件质量工程体系</a>
<a class="sqc-chip" href="/courses/software-quality-review-network/chapter-05/">下一章：05 软件质量标准</a>
</nav>
</main>
</div>
</article>
