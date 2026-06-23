---
title: "软件质量与测试复习网络 · 13 集成测试"
date: 2026-06-23 12:40:00
description: "《软件质量与测试》期末复习二级章节页：集成测试：接口、策略、桩模块、驱动模块。面向零基础同学，整理本章知识点、易混点、简答模板和自测题。"
---
<link rel="stylesheet" href="/css/software-quality-review-chapters.css?v=20260623-1">
<link rel="stylesheet" href="/css/software-quality-mobile-voice.css?v=20260623-1">
<script defer src="/js/software-quality-voice.js?v=20260623-1"></script>
<article class="sqc-page">
<section class="sqc-hero">
<div>
<div class="sqc-kicker">软件质量与测试 · 章节精讲 13</div>
<h2>集成测试：接口、策略、桩模块、驱动模块</h2>
<p>单元测试看一个模块自己对不对，集成测试看多个模块接在一起能不能协作。很多 bug 不是模块内部错，而是接口参数、调用顺序、共享数据和异常传播出问题。</p>
<div class="sqc-actions">
<a class="sqc-chip" href="/courses/software-quality-review-network/">返回总复习页</a>
<a class="sqc-chip" href="/courses/software-quality-review-network/#detail-13">回到本章总目录卡片</a>
<a class="sqc-chip" href="/courses/software-quality-review-network/#ch11">刷本章题库</a>
<a class="sqc-chip" href="/courses/software-quality-design-questions/">大题专项</a>
</div>
</div>
<aside class="sqc-hero-side" aria-label="本章考试信息">
<div><strong>资料来源</strong><p>测试基本理论、考试回忆、课堂题</p></div>
<div><strong>考试位置</strong><p>常考集成测试定义、与单元/系统测试区别、非增量/增量、自顶向下、自底向上、桩模块、驱动模块。</p></div>
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
<a href="/courses/software-quality-review-network/chapter-13/">回到页首</a>
<a href="/courses/software-quality-review-network/">总复习页</a>
</aside>
<main class="sqc-main">
<section class="sqc-note">
<p><strong>学习顺序：</strong>先读“完整知识点”，把每句话变成能解释的话；再看“知识网络”，知道它会怎么出题；最后用“简答模板”和“自测题”检查能不能写到评分点。</p>
</section>
<h2 id="core" class="sqc-section-title">一、本章完整知识点</h2>
<section class="sqc-card">
<h3>13 集成测试必须会的内容</h3>
<ul class="sqc-list"><li>集成测试也叫组装测试或联合测试。</li><li>集成测试位于单元测试之后，系统测试之前。</li><li>重点检查模块接口、参数传递、返回值、调用顺序、全局数据、共享状态、异常传播。</li><li>集成测试与单元测试区别：单元看模块内部，集成看模块协作。</li><li>非增量式集成一次性组装，问题定位困难。</li><li>增量式集成逐步组装，便于定位问题。</li><li>自顶向下集成从主控模块向下集成，需要桩模块模拟下层模块。</li><li>自底向上集成从底层模块向上集成，需要驱动模块调用被测模块。</li><li>混合/三明治集成结合自顶向下和自底向上。</li><li>桩模块模拟被测模块调用的下级模块。</li><li>驱动模块模拟上级模块或主程序，调用被测模块。</li><li>集成测试用例应覆盖接口数据、调用路径、错误处理和模块间副作用。</li></ul>
</section>
<h2 id="map" class="sqc-section-title">二、知识网络：概念怎么连起来</h2>
<div class="sqc-table-wrap">
<table class="sqc-table">
<thead><tr><th>知识点</th><th>零基础理解</th><th>考试问法</th></tr></thead>
<tbody>
<tr><td>集成测试</td><td>模块组装后的接口和协作</td><td>定义题</td></tr><tr><td>非增量</td><td>一次性组装</td><td>判断</td></tr><tr><td>自顶向下</td><td>需要桩模块</td><td>高频</td></tr><tr><td>自底向上</td><td>需要驱动模块</td><td>高频</td></tr>
</tbody>
</table>
</div>
<h2 id="must" class="sqc-section-title">三、必背句：考试写成这样就比较稳</h2>
<section class="sqc-grid">
<article class="sqc-mini"><h4>背诵句</h4><p>集成测试不是重复单元测试，而是重点找接口和协作问题。</p></article><article class="sqc-mini"><h4>背诵句</h4><p>桩模块模拟下级，驱动模块模拟上级。</p></article><article class="sqc-mini"><h4>背诵句</h4><p>非增量集成看起来快，但问题定位困难。</p></article>
</section>
<h2 id="confuse" class="sqc-section-title">四、易混点：判断选择最容易错在这里</h2>
<section class="sqc-card">
<ul class="sqc-list"><li>自顶向下不是从底层开始，它从主控模块开始。</li><li>桩模块和驱动模块容易反：桩是被调用的假下级，驱动是调用被测对象的假上级。</li><li>集成测试之后还有系统测试，二者关注层次不同。</li></ul>
</section>
<h2 id="templates" class="sqc-section-title">五、简答模板：按评分点组织语言</h2>
<section class="sqc-grid">
<article class="sqc-card">
<span class="sqc-badge hot">简答模板</span>
<h3>比较自顶向下和自底向上集成测试。</h3>
<p>自顶向下从主控模块开始逐步向下集成，需要桩模块模拟尚未完成的下层模块，优点是能较早验证主流程；自底向上从底层模块开始向上集成，需要驱动模块调用被测模块，优点是底层基础功能验证充分。</p>
</article>
<article class="sqc-card">
<span class="sqc-badge hot">简答模板</span>
<h3>集成测试主要发现哪些问题？</h3>
<p>集成测试主要发现模块接口不一致、参数传递错误、返回值处理错误、调用顺序错误、全局数据和共享状态冲突、异常传播错误以及模块组合后产生的副作用。</p>
</article>
</section>
<h2 id="practice" class="sqc-section-title">六、本章自测题</h2>
<section class="sqc-card">
<h3>先自己答，再回总复习页刷对应题库</h3>
<div class="sqc-question">
<p><strong>自测 1：</strong>填空：自顶向下集成测试常需要 ______ 模块，自底向上集成测试常需要 ______ 模块。</p>
</div>
<div class="sqc-question">
<p><strong>自测 2：</strong>判断：集成测试只关注单个函数内部逻辑。</p>
</div>
<div class="sqc-question">
<p><strong>自测 3：</strong>简答：为什么非增量式集成的问题定位困难？</p>
</div>
</section>
<section class="sqc-note">
<p><strong>下一步：</strong>本章看完后，回到<a href="/courses/software-quality-review-network/#ch11">总复习页题库</a>做对应题；如果是 11-12 章，再去<a href="/courses/software-quality-design-questions/">设计题专项</a>按卷面步骤练。</p>
</section>
<nav class="sqc-page-turn" aria-label="章节翻页">
<a class="sqc-chip" href="/courses/software-quality-review-network/chapter-12/">上一章：12 黑盒测试</a>
<a class="sqc-chip" href="/courses/software-quality-review-network/chapter-14/">下一章：14 系统测试</a>
</nav>
</main>
</div>
</article>
