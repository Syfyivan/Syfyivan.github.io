---
title: "软件质量与测试复习网络 · 09 高质量编程"
date: 2026-06-23 12:40:00
description: "《软件质量与测试》期末复习二级章节页：高质量编程：命名、版式、函数、表达式、内存。面向零基础同学，整理本章知识点、资料对照、简答模板和自测题。"
---
<link rel="stylesheet" href="/css/software-quality-review-chapters.css?v=20260623-5">
<link rel="stylesheet" href="/css/software-quality-mobile-voice.css?v=20260623-5">
<script defer src="/js/software-quality-voice.js?v=20260623-5"></script>
<article class="sqc-page">
<section class="sqc-hero">
<div>
<div class="sqc-kicker">软件质量与测试 · 章节精讲 09</div>
<h2>高质量编程：命名、版式、函数、表达式、内存</h2>
<p>这一章讲代码层面的质量。它不是让你写复杂程序，而是考你是否知道哪些写法更可靠、更易读、更不容易出错。</p>
<div class="sqc-actions">
<a class="sqc-chip" href="/courses/software-quality-review-network/">返回总复习页</a>
<a class="sqc-chip" href="/courses/software-quality-review-network/#detail-09">回到本章总目录卡片</a>
<a class="sqc-chip" href="/courses/software-quality-review-network/#ch08">看本章练习</a>
<a class="sqc-chip" href="/courses/software-quality-design-questions/">大题专项</a>
</div>
</div>
<aside class="sqc-hero-side" aria-label="本章考试信息">
<div><strong>资料来源</strong><p>PPT 9、编程规范客观题</p></div>
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
<a href="/courses/software-quality-review-network/chapter-09/">回到页首</a>
<a href="/courses/software-quality-review-network/">总复习页</a>
</aside>
<main class="sqc-main">
<section class="sqc-note">
<p><strong>学习顺序：</strong>先读“完整知识点”，把每句话变成能解释的话；再看“知识网络”，知道概念之间怎么区分；最后用“简答模板”和“自测题”检查能不能写到评分点。</p>
</section>
<h2 id="core" class="sqc-section-title">一、本章完整知识点</h2>
<section class="sqc-card">
<h3>09 高质量编程必须会的内容</h3>
<ul class="sqc-list"><li>命名应清晰、统一，必要时使用前缀避免库冲突。</li><li>标准库头文件使用 &lt;filename.h&gt;，非标准库头文件使用 &quot;filename.h&quot;。</li><li>类设计版式中数据和行为顺序要保持一致，便于理解。</li><li>布尔变量判断用 if(flag) 或 if(!flag)，不要和 TRUE/FALSE 比较。</li><li>整型变量可与 0 直接比较，如 ==0 或 !=0。</li><li>浮点数与 0 比较应使用误差范围，不应直接 ==0。</li><li>指针与 0 比较使用 p == NULL 或 p != NULL。</li><li>只输入的指针参数应加 const，防止函数内误改。</li><li>大对象传参优先使用 const 引用，避免值传递开销。</li><li>变量应在定义时或使用前就近初始化，避免使用未初始化值。</li><li>动态内存申请和释放必须配对，malloc/free、new/delete 不可混用。</li><li>内存泄漏是申请后没有释放。</li><li>野指针常来自未初始化、释放后未置 NULL、返回局部变量地址。</li><li>释放内存后应立即把指针置 NULL，不返回已释放或局部变量地址。</li></ul>
</section>
<h2 id="map" class="sqc-section-title">二、知识网络：概念怎么连起来</h2>
<div class="sqc-table-wrap">
<table class="sqc-table">
<thead><tr><th>知识点</th><th>零基础理解</th><th>题源/练习形态</th></tr></thead>
<tbody>
<tr><td>表达式判断</td><td>布尔、整型、浮点、指针各有写法</td><td>选择和判断</td></tr><tr><td>函数参数</td><td>const、引用、值传递</td><td>客观题</td></tr><tr><td>动态内存</td><td>配对释放、置 NULL</td><td>判断题</td></tr><tr><td>野指针</td><td>未初始化/释放后/局部地址</td><td>选择题</td></tr>
</tbody>
</table>
</div>
<h2 id="confuse" class="sqc-section-title">三、资料对照：概念边界怎么区分</h2>
<section class="sqc-card">
<ul class="sqc-list"><li>NULL 指针不是野指针；野指针指向不确定或已失效的内存。</li><li>内存泄漏是没有释放，野指针是还拿着无效地址，两者不同。</li><li>大对象用 const 引用不是为了改变语义，而是减少拷贝开销并防止误改。</li></ul>
</section>
<h2 id="templates" class="sqc-section-title">四、简答模板：按已给题源组织语言</h2>
<section class="sqc-grid">
<article class="sqc-card">
<span class="sqc-badge hot">简答模板</span>
<h3>如何避免动态内存错误？</h3>
<p>动态内存申请和释放要配对，malloc 对 free，new 对 delete，不能混用；申请后要检查是否成功；释放后应立即将指针置 NULL；不要返回局部变量地址；避免重复释放和使用已释放指针。</p>
</article>
<article class="sqc-card">
<span class="sqc-badge hot">简答模板</span>
<h3>为什么只输入的指针参数要加 const？</h3>
<p>只输入的指针参数加 const 可以明确函数不会修改被指向对象，增强接口表达能力，防止函数内部误改数据，也便于调用者理解和编译器检查。</p>
</article>
</section>
<h2 id="practice" class="sqc-section-title">五、本章自测题</h2>
<section class="sqc-card">
<h3>先自己答，再回总复习页看对应练习</h3>
<div class="sqc-question">
<p><strong>自测 1：</strong>判断：浮点变量可以直接用 if(x == 0.0) 判断是否为零。</p>
</div>
<div class="sqc-question">
<p><strong>自测 2：</strong>选择：释放后没有置空且继续使用的指针属于什么风险？</p>
</div>
<div class="sqc-question">
<p><strong>自测 3：</strong>简答：内存泄漏和野指针有什么区别？</p>
</div>
</section>
<section class="sqc-note">
<p><strong>下一步：</strong>本章看完后，回到<a href="/courses/software-quality-review-network/#ch08">总复习页练习区</a>检查概念；如果是 11-12 章，再去<a href="/courses/software-quality-design-questions/">设计题专项</a>按卷面步骤练。</p>
</section>
<nav class="sqc-page-turn" aria-label="章节翻页">
<a class="sqc-chip" href="/courses/software-quality-review-network/chapter-08/">上一章：08 提高软件设计质量</a>
<a class="sqc-chip" href="/courses/software-quality-review-network/chapter-10/">下一章：10 软件测试</a>
</nav>
</main>
</div>
</article>
