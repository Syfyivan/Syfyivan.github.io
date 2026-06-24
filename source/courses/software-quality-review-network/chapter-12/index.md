---
title: "软件质量与测试复习网络 · 12 黑盒测试"
date: 2026-06-23 12:40:00
description: "《软件质量与测试》期末复习二级章节页：黑盒测试：等价类、边界值、判定表、场景和状态。面向零基础同学，整理本章知识点、资料对照、简答模板和自测题。"
---
<link rel="stylesheet" href="/css/software-quality-review-chapters.css?v=20260623-5">
<link rel="stylesheet" href="/css/software-quality-mobile-voice.css?v=20260623-5">
<script defer src="/js/software-quality-voice.js?v=20260623-5"></script>
<article class="sqc-page">
<section class="sqc-hero">
<div>
<div class="sqc-kicker">软件质量与测试 · 章节精讲 12</div>
<h2>黑盒测试：等价类、边界值、判定表、场景和状态</h2>
<p>黑盒测试不看代码内部，只看规格说明中的输入、输出、业务规则和用户流程。它最适合从用户和需求角度设计测试。</p>
<div class="sqc-actions">
<a class="sqc-chip" href="/courses/software-quality-review-network/">返回总复习页</a>
<a class="sqc-chip" href="/courses/software-quality-review-network/#detail-12">回到本章总目录卡片</a>
<a class="sqc-chip" href="/courses/software-quality-review-network/#ch11">看本章练习</a>
<a class="sqc-chip" href="/courses/software-quality-design-questions/">大题专项</a>
</div>
</div>
<aside class="sqc-hero-side" aria-label="本章考试信息">
<div><strong>资料来源</strong><p>测试基本理论、A 卷/2024 回忆、待核课堂练习线索</p></div>
<div><strong>题源边界</strong><p>本页用于串联 PPT、讲义和题库中已出现的概念；不加入未核验的考试预测句。</p></div>
<div><strong>本页定位</strong><p>只保留资料中能对上的概念、题型和练习入口；未核验句子不当作考点。</p></div>
</aside>
</section>
<nav class="sqc-nav" aria-label="本章页内目录">
<a class="sqc-chip" href="#core">完整知识点</a>
<a class="sqc-chip" href="#map">知识网络</a>
<a class="sqc-chip" href="#confuse">资料对照</a>
<a class="sqc-chip" href="#templates">简答模板</a>
<a class="sqc-chip" href="#practice">自测题</a>
</nav>
<div class="sqc-layout">
<aside class="sqc-side" aria-label="固定章节目录">
<h3>本章目录</h3>
<a href="#core">完整知识点</a>
<a href="#map">知识网络</a>
<a href="#confuse">资料对照</a>
<a href="#templates">简答模板</a>
<a href="#practice">自测题</a>
<a href="/courses/software-quality-review-network/chapter-12/">回到页首</a>
<a href="/courses/software-quality-review-network/">总复习页</a>
</aside>
<main class="sqc-main">
<section class="sqc-note">
<p><strong>学习顺序：</strong>先读“完整知识点”，把每句话变成能解释的话；再看“知识网络”，知道概念之间怎么区分；最后用“简答模板”和“自测题”检查能不能写到评分点。</p>
</section>
<h2 id="core" class="sqc-section-title">一、本章完整知识点</h2>
<section class="sqc-card">
<h3>12 黑盒测试必须会的内容</h3>
<ul class="sqc-list"><li>黑盒测试也称功能测试，主要依据规格说明和用户行为。</li><li>黑盒不考虑程序内部逻辑结构，重点看输入输出和功能表现。</li><li>黑盒试图发现功能错误、接口错误、数据结构或数据库访问错误、性能错误、初始化和终止错误。</li><li>等价类划分把输入或输出划分成有效等价类和无效等价类。</li><li>有效等价类是符合规格、能代表一类合法输入的数据集合。</li><li>无效等价类是不符合规格的数据集合，通常一类一个用例。</li><li>边界值分析在输入/输出边界及附近设计用例。</li><li>闭区间常取 a-1、a、a+1、正常值、b-1、b、b+1。</li><li>一般边界值分析：一个变量取边界，其他变量取正常值。</li><li>因果图分析输入条件与输出结果之间的因果关系。</li><li>判定表适合条件组合和业务规则复杂的场景。</li><li>场景法适合业务流程清楚的功能，如登录、下单、提交。</li><li>状态迁移测试适合状态和事件明确的系统，如售票、查询、付款。</li><li>错误推测根据经验猜测容易出错的位置。</li></ul>
</section>
<h2 id="map" class="sqc-section-title">二、知识网络：概念怎么连起来</h2>
<div class="sqc-table-wrap">
<table class="sqc-table">
<thead><tr><th>知识点</th><th>零基础理解</th><th>题源/练习形态</th></tr></thead>
<tbody>
<tr><td>等价类</td><td>有效/无效分类</td><td>设计题</td></tr><tr><td>边界值</td><td>边界及附近</td><td>设计题</td></tr><tr><td>判定表</td><td>条件组合</td><td>规则题</td></tr><tr><td>状态迁移</td><td>状态 + 事件</td><td>售票/订单类题</td></tr>
</tbody>
</table>
</div>
<h2 id="confuse" class="sqc-section-title">三、资料对照：概念边界怎么区分</h2>
<section class="sqc-card">
<ul class="sqc-list"><li>黑盒不是随便试，而是根据规格系统设计用例。</li><li>有效等价类不是所有合法值都枚举，而是选代表。</li><li>边界值不仅测边界本身，还测边界两侧附近。</li></ul>
</section>
<h2 id="templates" class="sqc-section-title">四、简答模板：按已给题源组织语言</h2>
<section class="sqc-grid">
<article class="sqc-card">
<span class="sqc-badge hot">简答模板</span>
<h3>等价类划分题怎么做？</h3>
<p>先找输入条件和输出条件；再按规格划分有效等价类和无效等价类；为每个有效等价类选代表值，尽量让一个用例覆盖多个有效类；为每个无效等价类单独设计用例；最后写出输入、预期输出和覆盖的等价类。</p>
</article>
<article class="sqc-card">
<span class="sqc-badge hot">简答模板</span>
<h3>边界值分析题怎么做？</h3>
<p>先确定输入或输出的边界；对闭区间取下边界外、下边界、下边界内、正常值、上边界内、上边界、上边界外；多变量时通常一个变量取边界，其他变量取正常值；最后整理成测试用例表。</p>
</article>
</section>
<h2 id="practice" class="sqc-section-title">五、本章自测题</h2>
<section class="sqc-card">
<h3>先自己答，再回总复习页看对应练习</h3>
<div class="sqc-question">
<p><strong>自测 1：</strong>设计：8 位图书编号，前 7 位为数字，第 8 位为校验位，设计有效和无效等价类。</p>
</div>
<div class="sqc-question">
<p><strong>自测 2：</strong>判断：等价类划分要求列出所有可能输入值。</p>
</div>
<div class="sqc-question">
<p><strong>自测 3：</strong>简答：判定表适合什么样的测试场景？</p>
</div>
</section>
<section class="sqc-note">
<p><strong>下一步：</strong>本章看完后，回到<a href="/courses/software-quality-review-network/#ch11">总复习页练习区</a>检查概念；如果是 11-12 章，再去<a href="/courses/software-quality-design-questions/">设计题专项</a>按卷面步骤练。</p>
</section>
<nav class="sqc-page-turn" aria-label="章节翻页">
<a class="sqc-chip" href="/courses/software-quality-review-network/chapter-11/">上一章：11 白盒测试</a>
<a class="sqc-chip" href="/courses/software-quality-review-network/chapter-13/">下一章：13 集成测试</a>
</nav>
</main>
</div>
</article>
