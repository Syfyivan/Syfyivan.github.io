---
title: "软件质量与测试 · 云班课已核题库"
date: 2026-06-23 10:20:00
description: "《软件质量保证与测试》云班课题库页：已导出 23 道互评简答参考答案、23 个课上/课后 QUIZ 共 428 道题，剩余未公布活动单独标注。"
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
.sqe-chapter,
.sqe-tip {
  max-width: 980px;
  margin-right: auto;
  margin-left: auto;
}
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

.sqe-source-pill {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  margin: 0 8px 8px 0;
  padding: 4px 9px;
  border-radius: 999px;
  color: var(--sqe-green);
  background: rgba(47, 111, 94, 0.1);
  font-size: 12px;
  font-weight: 800;
}
.sqe-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 8px 0 0;
  color: var(--sqe-muted);
  font-size: 13px;
}
.sqe-meta span {
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 3px 8px;
  border: 1px solid var(--sqe-line);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.55);
}
.sqe-options {
  margin: 10px 0 0;
  padding: 0;
  list-style: none;
  color: var(--sqe-muted);
  line-height: 1.7;
}
.sqe-options li {
  padding: 4px 0;
  border-top: 1px dashed rgba(32, 36, 42, 0.1);
}
.sqe-filter {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  margin: 18px 0 0;
}
.sqe-filter input {
  min-height: 40px;
  width: 100%;
  border: 1px solid var(--sqe-line);
  border-radius: 8px;
  padding: 8px 11px;
  color: var(--sqe-ink);
  background: var(--sqe-panel);
  font: inherit;
}
.sqe-filter button {
  min-height: 40px;
  border: 1px solid rgba(54, 95, 145, 0.28);
  border-radius: 8px;
  padding: 8px 13px;
  color: var(--sqe-blue);
  background: var(--sqe-panel);
  font: inherit;
  font-weight: 800;
  cursor: pointer;
}
.sqe-filter button:hover { color: #ffffff; background: var(--sqe-blue); }
.sqe-card.is-hidden { display: none; }
@media (max-width: 760px) {
  .sqe-filter { grid-template-columns: 1fr; }
}
</style>

<link rel="stylesheet" href="/css/software-quality-mobile-voice.css?v=20260623-5">
<div class="sqe-page">
<section class="sqe-hero">
<span class="sqe-kicker">Software Quality Exercises / 云班课已核题库</span>
<h2>这页只放已经从云班课导出的真实题源</h2>
<p>当前页面已按登录后的云班课接口重建：互评简答题来自 <code>activity.homework.refAnswer</code>，课上测试和课后练习来自 <code>/quizzes/{actId}/topics</code>，少数课上测试从只读成绩结果接口补齐。没有来源的合成题不再放进这页。</p>
<div class="sqe-actions">
<a class="sqe-link" href="/courses/software-quality-review-network/">返回总复习网络</a>
<a class="sqe-link" href="/courses/software-quality-design-questions/">大题专项</a>
<a class="sqe-link" href="#missing">看未导出说明</a>
</div>
<div class="sqe-stats" aria-label="云班课题源统计">
<div class="sqe-stat"><strong>48</strong><span>云班课活动已读取</span></div>
<div class="sqe-stat"><strong>23</strong><span>互评简答老师参考答案</span></div>
<div class="sqe-stat"><strong>23/24</strong><span>QUIZ 活动已导出</span></div>
<div class="sqe-stat"><strong>428</strong><span>课上/课后题目</span></div>
</div>
<form class="sqe-filter" role="search" onsubmit="return false;">
<input type="search" data-sqe-filter placeholder="搜索题干、答案、章节或关键词">
<button type="button" data-sqe-clear>清空</button>
</form>
</section>

<section class="sqe-note">
<p><strong>来源边界：</strong>这页是云班课导出题库，不再混入 PPT 改写题或自拟概念题。仍未导出的“测试相关未分类习题”是因为云班课接口返回“老师暂未公布答案，无法查看结果”，它被单独列在页尾，未伪装成已读题库。</p>
</section>

<h2 class="sqe-section-title">题库跳转</h2>
<nav class="sqe-nav" aria-label="题库跳转">
<a class="sqe-chip" href="#peer">互评简答</a>
<a class="sqe-chip" href="#quiz-1">第八章课上测试</a>
<a class="sqe-chip" href="#quiz-2">实验一课后练习</a>
<a class="sqe-chip" href="#quiz-3">第七章课后练习</a>
<a class="sqe-chip" href="#quiz-4">第七章课上测试</a>
<a class="sqe-chip" href="#quiz-5">第九章课后练习</a>
<a class="sqe-chip" href="#quiz-6">第五章课后练习</a>
<a class="sqe-chip" href="#quiz-7">第三章课上测试</a>
<a class="sqe-chip" href="#quiz-8">第八章课后练习</a>
<a class="sqe-chip" href="#quiz-9">第二章课后练习</a>
<a class="sqe-chip" href="#quiz-10">第二章课上测试</a>
<a class="sqe-chip" href="#quiz-11">第六章课上测试</a>
<a class="sqe-chip" href="#quiz-12">第四章课后练习</a>
<a class="sqe-chip" href="#quiz-13">实验二课后练习</a>
<a class="sqe-chip" href="#quiz-14">第一章课后练习</a>
<a class="sqe-chip" href="#quiz-15">第三章课后练习</a>
<a class="sqe-chip" href="#quiz-16">实验三课后练习</a>
<a class="sqe-chip" href="#quiz-17">第六章课后练习</a>
<a class="sqe-chip" href="#quiz-18">第一章课上测试</a>
<a class="sqe-chip" href="#quiz-19">第四章课上测试</a>
<a class="sqe-chip" href="#quiz-20">第五章课上测试</a>
<a class="sqe-chip" href="#quiz-21">第九章课上测试</a>
<a class="sqe-chip" href="#quiz-22">实验二课上测试</a>
<a class="sqe-chip" href="#quiz-23">实验一课上测试</a>
<a class="sqe-chip" href="#missing">未导出说明</a>
</nav>

<aside class="sqe-side-toc" aria-label="固定目录">
<strong>云班课目录</strong>
<a href="#peer">互评简答</a>
<a href="#quiz-1">第八章课上测试</a>
<a href="#quiz-2">实验一课后练习</a>
<a href="#quiz-3">第七章课后练习</a>
<a href="#quiz-4">第七章课上测试</a>
<a href="#quiz-5">第九章课后练习</a>
<a href="#quiz-6">第五章课后练习</a>
<a href="#quiz-7">第三章课上测试</a>
<a href="#quiz-8">第八章课后练习</a>
<a href="#quiz-9">第二章课后练习</a>
<a href="#quiz-10">第二章课上测试</a>
<a href="#quiz-11">第六章课上测试</a>
<a href="#quiz-12">第四章课后练习</a>
<a href="#quiz-13">实验二课后练习</a>
<a href="#quiz-14">第一章课后练习</a>
<a href="#quiz-15">第三章课后练习</a>
<a href="#quiz-16">实验三课后练习</a>
<a href="#quiz-17">第六章课后练习</a>
<a href="#quiz-18">第一章课上测试</a>
<a href="#quiz-19">第四章课上测试</a>
<a href="#quiz-20">第五章课上测试</a>
<a href="#quiz-21">第九章课上测试</a>
<a href="#quiz-22">实验二课上测试</a>
<a href="#quiz-23">实验一课上测试</a>
<a href="#missing">未导出说明</a>
</aside>

<section id="peer" class="sqe-chapter">
<div class="sqe-chapter-head">
<span class="sqe-number">互</span>
<div><small>互评题 · 简答题评分点</small><h3>老师参考答案已导出，按简答题背</h3><div><span class="sqe-source-pill">23 道</span><span class="sqe-source-pill">activity.homework.refAnswer</span></div></div>
</div>

<article class="sqe-card" data-sqe-card data-sqe-text="软件测试与调试有什么区别？ 互评题-测试基本 软件测试与调试在目的、技术和方法等方面存在很大的区别
测试是为了发现软件中存在的错误；调试是为了证明软件开发的正确性。
测试以已知条件开始，使用预先定义的程序，且有预知的结果，不可预见的仅是程序是否通过测试；调试一般是以不可知的内部条件开始，除统计性调试外，结果是不可预见的。
测试是有计划的，需要进行测试设计；调试是不受时间约束的。
测试经历发现错误、改正错误、重新测试的过程；调试是一个推理的过程。
测试的执行是有规程的；调试的执行往往要求开发人员进行必要推理以至知觉的&quot;飞跃&quot;。
测试经常是由独立的测试组在不了解软件设计的条件下完成的；调试必须由了解详细设计的开发人员完成。
大多数测试的执行和设计可以由工具支持；调式时，开发人员能利用的工具主要是调试器。">
<div class="sqe-question">
<p class="sqe-question-title">互评-01（简答 · 互评题-测试基本）</p>
<p>软件测试与调试有什么区别？</p>
<div class="sqe-meta"><span>云班课 HOMEWORK</span><span>互评题-测试基本</span><span>满分 16 分</span></div>
</div>
<div class="sqe-answer"><details><summary>老师参考答案/评分点</summary><div class="sqe-answer-body"><p>软件测试与调试在目的、技术和方法等方面存在很大的区别</p><p>测试是为了发现软件中存在的错误；调试是为了证明软件开发的正确性。</p><p>测试以已知条件开始，使用预先定义的程序，且有预知的结果，不可预见的仅是程序是否通过测试；调试一般是以不可知的内部条件开始，除统计性调试外，结果是不可预见的。</p><p>测试是有计划的，需要进行测试设计；调试是不受时间约束的。</p><p>测试经历发现错误、改正错误、重新测试的过程；调试是一个推理的过程。</p><p>测试的执行是有规程的；调试的执行往往要求开发人员进行必要推理以至知觉的&quot;飞跃&quot;。</p><p>测试经常是由独立的测试组在不了解软件设计的条件下完成的；调试必须由了解详细设计的开发人员完成。</p><p>大多数测试的执行和设计可以由工具支持；调式时，开发人员能利用的工具主要是调试器。</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="简述基本的测量原则。 互评题-质量 答案：
测量应该基于该应用领域正确的理论之上，并在测量的定义中确定测度的目标；
每一个技术测量的定义应该具有一致性和客观性、无二义性；
测量在经验和直觉上也应该有说服力；
测量的方法力求简单、可计算性；
测量应该被剪裁以最适应特定的产品和过程，而且任何时候应尽可能使得收集和分析自动化；
应该用正确的统计技术来建立内部产品属性和外部待测量特征的关系；
测量结果应该是可靠的，不会因为一些技术问题导致测量结果很大的偏离；
测量应该建立反馈机制。">
<div class="sqe-question">
<p class="sqe-question-title">互评-02（简答 · 互评题-质量）</p>
<p>简述基本的测量原则。</p>
<div class="sqe-meta"><span>云班课 HOMEWORK</span><span>互评题-质量</span><span>满分 8 分</span></div>
</div>
<div class="sqe-answer"><details><summary>老师参考答案/评分点</summary><div class="sqe-answer-body"><p>答案：</p><p>测量应该基于该应用领域正确的理论之上，并在测量的定义中确定测度的目标；</p><p>每一个技术测量的定义应该具有一致性和客观性、无二义性；</p><p>测量在经验和直觉上也应该有说服力；</p><p>测量的方法力求简单、可计算性；</p><p>测量应该被剪裁以最适应特定的产品和过程，而且任何时候应尽可能使得收集和分析自动化；</p><p>应该用正确的统计技术来建立内部产品属性和外部待测量特征的关系；</p><p>测量结果应该是可靠的，不会因为一些技术问题导致测量结果很大的偏离；</p><p>测量应该建立反馈机制。</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="请指出走查、审查这两种同行评审方法的不同？ 互评题-质量 走查和审查的区别是其正式性的等级。其中，审查是两者之中更为正式。
走查的发现限于被评审文档的意见，而审查的发现还同改进开发方法自身的工作相结合。
所以和走查相比，审查对一般的SQA做出了更大贡献。">
<div class="sqe-question">
<p class="sqe-question-title">互评-03（简答 · 互评题-质量）</p>
<p>请指出走查、审查这两种同行评审方法的不同？</p>
<div class="sqe-meta"><span>云班课 HOMEWORK</span><span>互评题-质量</span><span>满分 6 分</span></div>
</div>
<div class="sqe-answer"><details><summary>老师参考答案/评分点</summary><div class="sqe-answer-body"><p>走查和审查的区别是其正式性的等级。其中，审查是两者之中更为正式。</p><p>走查的发现限于被评审文档的意见，而审查的发现还同改进开发方法自身的工作相结合。</p><p>所以和走查相比，审查对一般的SQA做出了更大贡献。</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="什么是测试用例？ 互评题-测试基本 测试用例是为特定的目的而设计的一组测试输入、执行条件和预期的结果。
测试用例是执行的最小实体。">
<div class="sqe-question">
<p class="sqe-question-title">互评-04（简答 · 互评题-测试基本）</p>
<p>什么是测试用例？</p>
<div class="sqe-meta"><span>云班课 HOMEWORK</span><span>互评题-测试基本</span><span>满分 6 分</span></div>
</div>
<div class="sqe-answer"><details><summary>老师参考答案/评分点</summary><div class="sqe-answer-body"><p>测试用例是为特定的目的而设计的一组测试输入、执行条件和预期的结果。</p><p>测试用例是执行的最小实体。</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="什么是回归测试？回归测试的目的是什么？ 互评题-测试实际 回归测试是指在修改了源代码后，用原有的测试用例进行重新进行测试以确认修改没有引入新的错误或导致其他代码产生错误。

回归测试的目的是所做的修改达到了预定的目的，如错误得到了改正，新功能得到了实现，能够适应新的运行环境等，不影响软件原有功能的正确性。">
<div class="sqe-question">
<p class="sqe-question-title">互评-05（简答 · 互评题-测试实际）</p>
<p>什么是回归测试？回归测试的目的是什么？</p>
<div class="sqe-meta"><span>云班课 HOMEWORK</span><span>互评题-测试实际</span><span>满分 6 分</span></div>
</div>
<div class="sqe-answer"><details><summary>老师参考答案/评分点</summary><div class="sqe-answer-body"><p>回归测试是指在修改了源代码后，用原有的测试用例进行重新进行测试以确认修改没有引入新的错误或导致其他代码产生错误。</p><p>回归测试的目的是所做的修改达到了预定的目的，如错误得到了改正，新功能得到了实现，能够适应新的运行环境等，不影响软件原有功能的正确性。</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="如何辨证的看待质量和客户的关系？ 互评题-质量 答案：
客户与质量的基本关系是相互依赖的关系。
客户是质量的接受者，可以直接观察或感觉到质量的存在。
质量相对于客户存在，服务于客户，而且由客户判定。">
<div class="sqe-question">
<p class="sqe-question-title">互评-06（简答 · 互评题-质量）</p>
<p>如何辨证的看待质量和客户的关系？</p>
<div class="sqe-meta"><span>云班课 HOMEWORK</span><span>互评题-质量</span><span>满分 9 分</span></div>
</div>
<div class="sqe-answer"><details><summary>老师参考答案/评分点</summary><div class="sqe-answer-body"><p>答案：</p><p>客户与质量的基本关系是相互依赖的关系。</p><p>客户是质量的接受者，可以直接观察或感觉到质量的存在。</p><p>质量相对于客户存在，服务于客户，而且由客户判定。</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="白盒测试的重点以及相应的对策是什么？ 互评题-测试实际 1、模块接口测试，重点检查进出模块的数据是否正确
2、模块局部数据结构测试，重点检查局部数据结构能否保持完整性
3、模块边界条件测试，重点检查临界数据是否正确处理
4、模块独立执行路径测试，重点检查由于计算错误，判定错误，控制流错误导致的程序错误
5、模块内部错误处理测试，重点检查内部错误处理设施是否有效">
<div class="sqe-question">
<p class="sqe-question-title">互评-07（简答 · 互评题-测试实际）</p>
<p>白盒测试的重点以及相应的对策是什么？</p>
<div class="sqe-meta"><span>云班课 HOMEWORK</span><span>互评题-测试实际</span><span>满分 10 分</span></div>
</div>
<div class="sqe-answer"><details><summary>老师参考答案/评分点</summary><div class="sqe-answer-body"><p>1、模块接口测试，重点检查进出模块的数据是否正确</p><p>2、模块局部数据结构测试，重点检查局部数据结构能否保持完整性</p><p>3、模块边界条件测试，重点检查临界数据是否正确处理</p><p>4、模块独立执行路径测试，重点检查由于计算错误，判定错误，控制流错误导致的程序错误</p><p>5、模块内部错误处理测试，重点检查内部错误处理设施是否有效</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="单元测试、集成测试、系统测试的侧重点是什么？ 互评题-测试实际 单元测试是在软件开发过程中要进行的最低级别的测试活动，在单元测试活动中，软件的独立单元将在与程序的其他部分相隔离的情况下进行测试，
测试重点是系统的模块，包括子程序的正确性验证等。

集成测试，也叫组装测试或联合测试。在单元测试的基础上，将所有模块按照设计要求，组装成为子系统或系统，进行集成测试。
测试重点是模块间的衔接以及参数的传递等。

系统测试是将经过测试的子系统装配成一个完整系统来测试。它是检验系统是否确实能提供系统方案说明书中指定功能的有效方法。
测试重点是整个系统的运行以及与其他软件的兼容性。">
<div class="sqe-question">
<p class="sqe-question-title">互评-08（简答 · 互评题-测试实际）</p>
<p>单元测试、集成测试、系统测试的侧重点是什么？</p>
<div class="sqe-meta"><span>云班课 HOMEWORK</span><span>互评题-测试实际</span><span>满分 6 分</span></div>
</div>
<div class="sqe-answer"><details><summary>老师参考答案/评分点</summary><div class="sqe-answer-body"><p>单元测试是在软件开发过程中要进行的最低级别的测试活动，在单元测试活动中，软件的独立单元将在与程序的其他部分相隔离的情况下进行测试，</p><p>测试重点是系统的模块，包括子程序的正确性验证等。</p><p>集成测试，也叫组装测试或联合测试。在单元测试的基础上，将所有模块按照设计要求，组装成为子系统或系统，进行集成测试。</p><p>测试重点是模块间的衔接以及参数的传递等。</p><p>系统测试是将经过测试的子系统装配成一个完整系统来测试。它是检验系统是否确实能提供系统方案说明书中指定功能的有效方法。</p><p>测试重点是整个系统的运行以及与其他软件的兼容性。</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="请详细描述软件质量费用的经典模型？ 互评题-质量 案：
在经典软件质量费用模型中，软件质量费用可以划分为控制费用、控制失效费用。
其中，控制费用被进一步细化为预防费用和评价费用；
控制失效费用进一步细化为内部失效费用、外部失效费用。
（1）预防费用包括建立软件质量基础设施、更新并改进基础设施以及完成其运行所需的常规活动的投资。
（2）评价费用花在特定项目或软件系统中软件错误的检测上。
（3）内部失效费用是指改正在顾客现场安装软件之前实施设计评审、软件测试及验收测试时检测到的错误而产生的费用。
（4）外部失效费用限定为改正由顾客或维护组在顾客现场安装软件系统之后检测到的失效的费用。">
<div class="sqe-question">
<p class="sqe-question-title">互评-09（简答 · 互评题-质量）</p>
<p>请详细描述软件质量费用的经典模型？</p>
<div class="sqe-meta"><span>云班课 HOMEWORK</span><span>互评题-质量</span><span>满分 7 分</span></div>
</div>
<div class="sqe-answer"><details><summary>老师参考答案/评分点</summary><div class="sqe-answer-body"><p>案：</p><p>在经典软件质量费用模型中，软件质量费用可以划分为控制费用、控制失效费用。</p><p>其中，控制费用被进一步细化为预防费用和评价费用；</p><p>控制失效费用进一步细化为内部失效费用、外部失效费用。</p><p>（1）预防费用包括建立软件质量基础设施、更新并改进基础设施以及完成其运行所需的常规活动的投资。</p><p>（2）评价费用花在特定项目或软件系统中软件错误的检测上。</p><p>（3）内部失效费用是指改正在顾客现场安装软件之前实施设计评审、软件测试及验收测试时检测到的错误而产生的费用。</p><p>（4）外部失效费用限定为改正由顾客或维护组在顾客现场安装软件系统之后检测到的失效的费用。</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="简述负载测试，容量测试和强度测试的区别。 互评题-测试实际 负载测试：在一定的工作负荷下，系统的负荷及响应时间。

强度测试：在一定的负荷条件下，在较长时间跨度内的系统连续运行给系统性能所造成的影响。

容量测试：是通过测试预先分析出反映软件系统应用特征的某项指标的极限值，系统在其极限值状态下没有出现任何软件故障或还能保持主要功能正常运行。">
<div class="sqe-question">
<p class="sqe-question-title">互评-10（简答 · 互评题-测试实际）</p>
<p>简述负载测试，容量测试和强度测试的区别。</p>
<div class="sqe-meta"><span>云班课 HOMEWORK</span><span>互评题-测试实际</span><span>满分 6 分</span></div>
</div>
<div class="sqe-answer"><details><summary>老师参考答案/评分点</summary><div class="sqe-answer-body"><p>负载测试：在一定的工作负荷下，系统的负荷及响应时间。</p><p>强度测试：在一定的负荷条件下，在较长时间跨度内的系统连续运行给系统性能所造成的影响。</p><p>容量测试：是通过测试预先分析出反映软件系统应用特征的某项指标的极限值，系统在其极限值状态下没有出现任何软件故障或还能保持主要功能正常运行。</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="简述质量保证人员的主要工作内容。 互评题-质量 为项目制定SQA计划。该计划在制定项目计划时制定，由相关部门审定。它规定了软件开发小组和质量保证小组需要执行的质量保证活动。
参与开发该软件项目的软件过程描述。
评审各项软件工程活动，核实其是否符合已定义的软件过程。
审计指定的软件工作产品，核实其是否符合已定义的软件过程中的相应部分。
确保软件工作及工作产品中的偏差已被记录在案，并根据预定规程进行处理。
记录所有不符合部分，并向上级管理部门报告。跟踪不符合的部分直到问题得到解决。
协调变更的控制与管理，并帮助收集和分析软件度量的信息。">
<div class="sqe-question">
<p class="sqe-question-title">互评-11（简答 · 互评题-质量）</p>
<p>简述质量保证人员的主要工作内容。</p>
<div class="sqe-meta"><span>云班课 HOMEWORK</span><span>互评题-质量</span><span>满分 7 分</span></div>
</div>
<div class="sqe-answer"><details><summary>老师参考答案/评分点</summary><div class="sqe-answer-body"><p>为项目制定SQA计划。该计划在制定项目计划时制定，由相关部门审定。它规定了软件开发小组和质量保证小组需要执行的质量保证活动。</p><p>参与开发该软件项目的软件过程描述。</p><p>评审各项软件工程活动，核实其是否符合已定义的软件过程。</p><p>审计指定的软件工作产品，核实其是否符合已定义的软件过程中的相应部分。</p><p>确保软件工作及工作产品中的偏差已被记录在案，并根据预定规程进行处理。</p><p>记录所有不符合部分，并向上级管理部门报告。跟踪不符合的部分直到问题得到解决。</p><p>协调变更的控制与管理，并帮助收集和分析软件度量的信息。</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="简单评价ISO模型、McCall模型和Boehm模型3种软件质量模型。 互评题-质量 答案：
存在差别：软件质量特性、影响因素或质量指标的定义不完全一致；总体上要表达的思想非常接近；
目的相同：构造软件质量因素-准则-度量，3者综合的软件质量结构模型；
ISO模型第一层（质量特性）和第二层（准则）的关系非常清楚，不像McCall模型和Boehm模型那样存在交叉关系。">
<div class="sqe-question">
<p class="sqe-question-title">互评-12（简答 · 互评题-质量）</p>
<p>简单评价ISO模型、McCall模型和Boehm模型3种软件质量模型。</p>
<div class="sqe-meta"><span>云班课 HOMEWORK</span><span>互评题-质量</span><span>满分 9 分</span></div>
</div>
<div class="sqe-answer"><details><summary>老师参考答案/评分点</summary><div class="sqe-answer-body"><p>答案：</p><p>存在差别：软件质量特性、影响因素或质量指标的定义不完全一致；总体上要表达的思想非常接近；</p><p>目的相同：构造软件质量因素-准则-度量，3者综合的软件质量结构模型；</p><p>ISO模型第一层（质量特性）和第二层（准则）的关系非常清楚，不像McCall模型和Boehm模型那样存在交叉关系。</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="简述软件开发人员和质量保证人员的区别。 互评题-质量 答案：
软件开发人员负责技术工作，质量保证人员负责质量保证的计划、监督、记录、分析及报告工作。
软件开发人员通过采用可靠的技术方法和措施，进行正式的技术评审，执行计划周密的软件测试来保证软件产品的质量。软件质量保证人员则辅助软件开发组得到高质量的最终产品。">
<div class="sqe-question">
<p class="sqe-question-title">互评-13（简答 · 互评题-质量）</p>
<p>简述软件开发人员和质量保证人员的区别。</p>
<div class="sqe-meta"><span>云班课 HOMEWORK</span><span>互评题-质量</span><span>满分 6 分</span></div>
</div>
<div class="sqe-answer"><details><summary>老师参考答案/评分点</summary><div class="sqe-answer-body"><p>答案：</p><p>软件开发人员负责技术工作，质量保证人员负责质量保证的计划、监督、记录、分析及报告工作。</p><p>软件开发人员通过采用可靠的技术方法和措施，进行正式的技术评审，执行计划周密的软件测试来保证软件产品的质量。软件质量保证人员则辅助软件开发组得到高质量的最终产品。</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="简述三种SQA的组织结构以及各自的优缺点。 互评题-质量 答案：
独立的SQA部门：在整个企业的组织结构中设立一个独立的职能和行政部门—SQA部门，该部门和其他职能部门平级。
优点：保护SQA工程师的独立性和客观性；有利于资源的共享。
缺点：SQA对流程的跟踪和控制难于深入，往往流于形式，难于发现流程中存在的关键问题；由于和项目组的相互独立，SQA工程师发现的问题不能得到及时有效的解决。

独立的SQA工程师：在这种组织结构中，SQA工程师属于项目成员，向项目经理汇报。
优点：SQA工程师能够深入项目，较容易发现实质性问题；对于SQA工程师发现的问题，能够得到较快短的解决。
缺点：项目之间相互独立， SQA工程师之间的沟通和交流有所缺乏，不利于经验的共享和SQA整体的培养和发展；由于SQA工程师隶属于项目组，独立性和客观性有所欠缺。

独立的SQA小组：该组织结构是前面两种组织结构的综合结果。
特点：SQA组虽然不算一个行政部门，但具有相对的独立性。同时，SQA工程师有隶属于不同的项目组，在工作上向项目经理汇报。该结构综合了上面两种结构的优点，既便于QA融入项目组，又便于部门之间经验的分享，还利于QA能力的提高。">
<div class="sqe-question">
<p class="sqe-question-title">互评-14（简答 · 互评题-质量）</p>
<p>简述三种SQA的组织结构以及各自的优缺点。</p>
<div class="sqe-meta"><span>云班课 HOMEWORK</span><span>互评题-质量</span><span>满分 9 分</span></div>
</div>
<div class="sqe-answer"><details><summary>老师参考答案/评分点</summary><div class="sqe-answer-body"><p>答案：</p><p>独立的SQA部门：在整个企业的组织结构中设立一个独立的职能和行政部门—SQA部门，该部门和其他职能部门平级。</p><p>优点：保护SQA工程师的独立性和客观性；有利于资源的共享。</p><p>缺点：SQA对流程的跟踪和控制难于深入，往往流于形式，难于发现流程中存在的关键问题；由于和项目组的相互独立，SQA工程师发现的问题不能得到及时有效的解决。</p><p>独立的SQA工程师：在这种组织结构中，SQA工程师属于项目成员，向项目经理汇报。</p><p>优点：SQA工程师能够深入项目，较容易发现实质性问题；对于SQA工程师发现的问题，能够得到较快短的解决。</p><p>缺点：项目之间相互独立， SQA工程师之间的沟通和交流有所缺乏，不利于经验的共享和SQA整体的培养和发展；由于SQA工程师隶属于项目组，独立性和客观性有所欠缺。</p><p>独立的SQA小组：该组织结构是前面两种组织结构的综合结果。</p><p>特点：SQA组虽然不算一个行政部门，但具有相对的独立性。同时，SQA工程师有隶属于不同的项目组，在工作上向项目经理汇报。该结构综合了上面两种结构的优点，既便于QA融入项目组，又便于部门之间经验的分享，还利于QA能力的提高。</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="软件测试和软件开发过程具有怎么样的关系？ 互评题-测试基本 软件测试贯穿在软件的开发过程中，在每个开发阶段具有不同的任务，
在需求分析阶段，主要测试需求分析，以及进行系统测试计划的制定。
在详细设计和概要设计阶段，主要确保集成测试计划和单元测试计划完成。
在编码阶段，主要由开发人员测试自己负责开发的模块的代码。对于大型项目则需要有专门人员进行编码阶段的测试任务。
在测试阶段，主要对系统进行测试，并提交相应的测试结果报告和测试分析报告。">
<div class="sqe-question">
<p class="sqe-question-title">互评-15（简答 · 互评题-测试基本）</p>
<p>软件测试和软件开发过程具有怎么样的关系？</p>
<div class="sqe-meta"><span>云班课 HOMEWORK</span><span>互评题-测试基本</span><span>满分 10 分</span></div>
</div>
<div class="sqe-answer"><details><summary>老师参考答案/评分点</summary><div class="sqe-answer-body"><p>软件测试贯穿在软件的开发过程中，在每个开发阶段具有不同的任务，</p><p>在需求分析阶段，主要测试需求分析，以及进行系统测试计划的制定。</p><p>在详细设计和概要设计阶段，主要确保集成测试计划和单元测试计划完成。</p><p>在编码阶段，主要由开发人员测试自己负责开发的模块的代码。对于大型项目则需要有专门人员进行编码阶段的测试任务。</p><p>在测试阶段，主要对系统进行测试，并提交相应的测试结果报告和测试分析报告。</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="什么是性能测试？ 互评题-测试实际 是指通过自动化的测试工具模拟多种正常、峰值以及异常负载条件来对系统的各项性能指标进行测试。

主要包括以下三个方面：应用在客户端性能的测试，应用在网络上性能的测试和应用在服务器端性能的测试">
<div class="sqe-question">
<p class="sqe-question-title">互评-16（简答 · 互评题-测试实际）</p>
<p>什么是性能测试？</p>
<div class="sqe-meta"><span>云班课 HOMEWORK</span><span>互评题-测试实际</span><span>满分 6 分</span></div>
</div>
<div class="sqe-answer"><details><summary>老师参考答案/评分点</summary><div class="sqe-answer-body"><p>是指通过自动化的测试工具模拟多种正常、峰值以及异常负载条件来对系统的各项性能指标进行测试。</p><p>主要包括以下三个方面：应用在客户端性能的测试，应用在网络上性能的测试和应用在服务器端性能的测试</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="简述驱动程序以及如何构建测试驱动程序。 互评题-测试基本 测试驱动程序是一个运行测试用例并收集运行结果的程序。
测试驱动程序的设计应该相对简单。
测试驱动程序必须是严谨的、结构清晰、简单，易于维护。
对所测试的类说明变化具有很强的适应能力。
理想情况下，在创建新的测试驱动程序时，应该能够复用已存在的驱动程序的代码">
<div class="sqe-question">
<p class="sqe-question-title">互评-17（简答 · 互评题-测试基本）</p>
<p>简述驱动程序以及如何构建测试驱动程序。</p>
<div class="sqe-meta"><span>云班课 HOMEWORK</span><span>互评题-测试基本</span><span>满分 5 分</span></div>
</div>
<div class="sqe-answer"><details><summary>老师参考答案/评分点</summary><div class="sqe-answer-body"><p>测试驱动程序是一个运行测试用例并收集运行结果的程序。</p><p>测试驱动程序的设计应该相对简单。</p><p>测试驱动程序必须是严谨的、结构清晰、简单，易于维护。</p><p>对所测试的类说明变化具有很强的适应能力。</p><p>理想情况下，在创建新的测试驱动程序时，应该能够复用已存在的驱动程序的代码</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="什么是桩模块，什么是驱动模块？ 互评题-测试基本 桩模块是在进行单元测试时所设置的一种辅助测试模块，它用来模拟被测试模块工作过程中所调用的模块。
桩模块由被测模块调用，它们一般只进行很少的数据处理，以便检验被测模块与其下级模块的接口。

驱动模块是在进行单元测试时所设置的一种辅助测试模块，它用来模拟被测试模块的上一级模块，相当于被测模块的主程序。
驱动模块在单元测试中接收数据，把相关的数据传送给被测试的模块，启动被测模块，并给出相应的结果。">
<div class="sqe-question">
<p class="sqe-question-title">互评-18（简答 · 互评题-测试基本）</p>
<p>什么是桩模块，什么是驱动模块？</p>
<div class="sqe-meta"><span>云班课 HOMEWORK</span><span>互评题-测试基本</span><span>满分 8 分</span></div>
</div>
<div class="sqe-answer"><details><summary>老师参考答案/评分点</summary><div class="sqe-answer-body"><p>桩模块是在进行单元测试时所设置的一种辅助测试模块，它用来模拟被测试模块工作过程中所调用的模块。</p><p>桩模块由被测模块调用，它们一般只进行很少的数据处理，以便检验被测模块与其下级模块的接口。</p><p>驱动模块是在进行单元测试时所设置的一种辅助测试模块，它用来模拟被测试模块的上一级模块，相当于被测模块的主程序。</p><p>驱动模块在单元测试中接收数据，把相关的数据传送给被测试的模块，启动被测模块，并给出相应的结果。</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="简述什么是软件缺陷。 互评题-质量 答案：
从产品内部看，软件缺陷是软件产品开发或维护过程中所存在的错误、毛病等各种问题；
从外部看，软件缺陷是系统所需要实现的某种功能的失效或违背。">
<div class="sqe-question">
<p class="sqe-question-title">互评-19（简答 · 互评题-质量）</p>
<p>简述什么是软件缺陷。</p>
<div class="sqe-meta"><span>云班课 HOMEWORK</span><span>互评题-质量</span><span>满分 10 分</span></div>
</div>
<div class="sqe-answer"><details><summary>老师参考答案/评分点</summary><div class="sqe-answer-body"><p>答案：</p><p>从产品内部看，软件缺陷是软件产品开发或维护过程中所存在的错误、毛病等各种问题；</p><p>从外部看，软件缺陷是系统所需要实现的某种功能的失效或违背。</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="简述为什么需要评审？ 互评题-质量 从成本上来衡量：缺陷发现得越晚纠正费用越高，而软件评审的重要目的就是通过软件评审尽早的产品中的缺陷，减少大量的后期返工。
从技术上来衡量：前一阶段的错误自然会导致后一阶段的工作结果中有相应的错误，而且错误会逐渐累积，越来越多。
从效率上来衡量：
开发工程师：减少修订缺陷的时间，提高编程效率；减少测试和调试时间
项目负责人：缩短开发周期；减少维护费用；项目风险和质量问题得到很好控制
测试工程师：可以将更多精力放到测试用例的设计上，提高测试效率
维护人员：维护工作减少；产品的可维护性增强">
<div class="sqe-question">
<p class="sqe-question-title">互评-20（简答 · 互评题-质量）</p>
<p>简述为什么需要评审？</p>
<div class="sqe-meta"><span>云班课 HOMEWORK</span><span>互评题-质量</span><span>满分 8 分</span></div>
</div>
<div class="sqe-answer"><details><summary>老师参考答案/评分点</summary><div class="sqe-answer-body"><p>从成本上来衡量：缺陷发现得越晚纠正费用越高，而软件评审的重要目的就是通过软件评审尽早的产品中的缺陷，减少大量的后期返工。</p><p>从技术上来衡量：前一阶段的错误自然会导致后一阶段的工作结果中有相应的错误，而且错误会逐渐累积，越来越多。</p><p>从效率上来衡量：</p><p>开发工程师：减少修订缺陷的时间，提高编程效率；减少测试和调试时间</p><p>项目负责人：缩短开发周期；减少维护费用；项目风险和质量问题得到很好控制</p><p>测试工程师：可以将更多精力放到测试用例的设计上，提高测试效率</p><p>维护人员：维护工作减少；产品的可维护性增强</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="什么是质量管理体系? 互评题-质量 答：质量管理体系是在质量方面指挥和控制组织的管理体系。组织为了实现所确定的质量方针和质量目标，经过质量策划将管理职责、资源管理、产品实现、测量、分析和改进等相互关联或相互作用的过程有机的组成一个整体，构成质量管理体系。">
<div class="sqe-question">
<p class="sqe-question-title">互评-21（简答 · 互评题-质量）</p>
<p>什么是质量管理体系?</p>
<div class="sqe-meta"><span>云班课 HOMEWORK</span><span>互评题-质量</span><span>满分 10 分</span></div>
</div>
<div class="sqe-answer"><details><summary>老师参考答案/评分点</summary><div class="sqe-answer-body"><p>答：质量管理体系是在质量方面指挥和控制组织的管理体系。组织为了实现所确定的质量方针和质量目标，经过质量策划将管理职责、资源管理、产品实现、测量、分析和改进等相互关联或相互作用的过程有机的组成一个整体，构成质量管理体系。</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="什么是软件测试？ 互评题-测试基本 软件测试是为了发现错误而执行程序的过程。
软件测试是根据软件开发各阶段的规格说明和程序的内部结构而精心设计一批测试用例（即输入数据及其预期的输出结果），并利用这些测试用例去运行程序，以发现程序错误的过程。">
<div class="sqe-question">
<p class="sqe-question-title">互评-22（简答 · 互评题-测试基本）</p>
<p>什么是软件测试？</p>
<div class="sqe-meta"><span>云班课 HOMEWORK</span><span>互评题-测试基本</span><span>满分 6 分</span></div>
</div>
<div class="sqe-answer"><details><summary>老师参考答案/评分点</summary><div class="sqe-answer-body"><p>软件测试是为了发现错误而执行程序的过程。</p><p>软件测试是根据软件开发各阶段的规格说明和程序的内部结构而精心设计一批测试用例（即输入数据及其预期的输出结果），并利用这些测试用例去运行程序，以发现程序错误的过程。</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="简单对比白盒测试与黑盒测试 互评题-测试实际 白盒测试
已知产品的内部工作过程，可以对程序每一行语句、每一个条件或分支进行测试
适合单元测试、集成测试
不适合系统测试

黑盒测试
不考虑程序内部结构和内部特性，而是从用户观点出发，针对程序接口和用户界面进行测试
适合功能测试、易用性测试，验收测试、确认测试；
不适合单元测试、集成测试">
<div class="sqe-question">
<p class="sqe-question-title">互评-23（简答 · 互评题-测试实际）</p>
<p>简单对比白盒测试与黑盒测试</p>
<div class="sqe-meta"><span>云班课 HOMEWORK</span><span>互评题-测试实际</span><span>满分 6 分</span></div>
</div>
<div class="sqe-answer"><details><summary>老师参考答案/评分点</summary><div class="sqe-answer-body"><p>白盒测试</p><p>已知产品的内部工作过程，可以对程序每一行语句、每一个条件或分支进行测试</p><p>适合单元测试、集成测试</p><p>不适合系统测试</p><p>黑盒测试</p><p>不考虑程序内部结构和内部特性，而是从用户观点出发，针对程序接口和用户界面进行测试</p><p>适合功能测试、易用性测试，验收测试、确认测试；</p><p>不适合单元测试、集成测试</p></div></details></div>
</article>
</section>


<section id="quiz-1" class="sqe-chapter">
<div class="sqe-chapter-head">
<span class="sqe-number">01</span>
<div><small>课上测试（计入总分） · 云班课 QUIZ</small><h3>第八章课上测试</h3><div><span class="sqe-source-pill">补充自成绩结果接口</span><span class="sqe-source-pill">10 道题</span></div></div>
</div>

<article class="sqe-card" data-sqe-card data-sqe-text="第八章课上测试 课上测试（计入总分） TF 需求分析是将用户需求准确转化为软件系统的唯一途径。 F ">
<div class="sqe-question">
<p class="sqe-question-title">题 1-01（判断）</p>
<p>需求分析是将用户需求准确转化为软件系统的唯一途径。</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第八章课上测试</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>F</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第八章课上测试 课上测试（计入总分） SINGLE 将软件需求转化为数据结构和软件的系统结构，并定义子系统和它们之间的通信或接口是哪个阶段的任务 D. 概要设计 详细设计 编码 测试 概要设计">
<div class="sqe-question">
<p class="sqe-question-title">题 1-02（单选）</p>
<p>将软件需求转化为数据结构和软件的系统结构，并定义子系统和它们之间的通信或接口是哪个阶段的任务</p>
<ul class="sqe-options"><li><strong>A.</strong> 详细设计</li><li><strong>B.</strong> 编码</li><li><strong>C.</strong> 测试</li><li><strong>D.</strong> 概要设计</li></ul>
<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第八章课上测试</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>D. 概要设计</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第八章课上测试 课上测试（计入总分） TF 软件设计的基本原则是设计越简单越好 T ">
<div class="sqe-question">
<p class="sqe-question-title">题 1-03（判断）</p>
<p>软件设计的基本原则是设计越简单越好</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第八章课上测试</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>T</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第八章课上测试 课上测试（计入总分） SINGLE 下列耦合度从低到高排列正确的是 C. 数据耦合、控制耦合、公共环境耦合、内容耦合 特征耦合、数据耦合、外部耦合、公共环境耦合 非直接耦合、特征耦合、公共环境耦合、外部耦合 数据耦合、控制耦合、公共环境耦合、内容耦合 控制耦合、外部耦合、公共环境耦合、特征耦合">
<div class="sqe-question">
<p class="sqe-question-title">题 1-04（单选）</p>
<p>下列耦合度从低到高排列正确的是</p>
<ul class="sqe-options"><li><strong>A.</strong> 特征耦合、数据耦合、外部耦合、公共环境耦合</li><li><strong>B.</strong> 非直接耦合、特征耦合、公共环境耦合、外部耦合</li><li><strong>C.</strong> 数据耦合、控制耦合、公共环境耦合、内容耦合</li><li><strong>D.</strong> 控制耦合、外部耦合、公共环境耦合、特征耦合</li></ul>
<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第八章课上测试</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>C. 数据耦合、控制耦合、公共环境耦合、内容耦合</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第八章课上测试 课上测试（计入总分） TF 软件设计的时候技术远比用户需求重要的多。 F ">
<div class="sqe-question">
<p class="sqe-question-title">题 1-05（判断）</p>
<p>软件设计的时候技术远比用户需求重要的多。</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第八章课上测试</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>F</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第八章课上测试 课上测试（计入总分） TF 常作验证，早作验证是软件设计的原则之一 T ">
<div class="sqe-question">
<p class="sqe-question-title">题 1-06（判断）</p>
<p>常作验证，早作验证是软件设计的原则之一</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第八章课上测试</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>T</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第八章课上测试 课上测试（计入总分） TF 框架模型主要以一些特殊的问题为目标建立只针对和适应该问题的结构。 T ">
<div class="sqe-question">
<p class="sqe-question-title">题 1-07（判断）</p>
<p>框架模型主要以一些特殊的问题为目标建立只针对和适应该问题的结构。</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第八章课上测试</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>T</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第八章课上测试 课上测试（计入总分） MULTI 体系结构的模型包括 A. 结构模型；B. 功能模型；C. 动态模型；D. 过程模型 结构模型 功能模型 动态模型 过程模型">
<div class="sqe-question">
<p class="sqe-question-title">题 1-08（多选）</p>
<p>体系结构的模型包括</p>
<ul class="sqe-options"><li><strong>A.</strong> 结构模型</li><li><strong>B.</strong> 功能模型</li><li><strong>C.</strong> 动态模型</li><li><strong>D.</strong> 过程模型</li></ul>
<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第八章课上测试</span><span>多选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 结构模型；B. 功能模型；C. 动态模型；D. 过程模型</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第八章课上测试 课上测试（计入总分） TF C/S与B/S软件体系结构相比，除了用户界面的实现方式不同以外，其他没什么差别。 F ">
<div class="sqe-question">
<p class="sqe-question-title">题 1-09（判断）</p>
<p>C/S与B/S软件体系结构相比，除了用户界面的实现方式不同以外，其他没什么差别。</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第八章课上测试</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>F</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第八章课上测试 课上测试（计入总分） TF 设计模式使得人们可以更加简单和方便地去复用成功的软件设计和体系结构，从而帮助设计者更快更好地完成系统设计。 T ">
<div class="sqe-question">
<p class="sqe-question-title">题 1-10（判断）</p>
<p>设计模式使得人们可以更加简单和方便地去复用成功的软件设计和体系结构，从而帮助设计者更快更好地完成系统设计。</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第八章课上测试</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>T</p></div></details></div>
</article>
</section>

<section id="quiz-2" class="sqe-chapter">
<div class="sqe-chapter-head">
<span class="sqe-number">02</span>
<div><small>课后练习（计入总分） · 云班课 QUIZ</small><h3>实验一课后练习</h3><div><span class="sqe-source-pill">题目接口直接导出</span><span class="sqe-source-pill">87 道题</span></div></div>
</div>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） SINGLE 导致软件缺陷的原因有很多，①&amp;mdash;④是可能的原因，其中最主要的原因包括_____
①软件需求说明书编写的不全面，不完整，不准确，而且经常更改&amp;rlm;&amp;zwnj;　　　　
②软件设计说明书&amp;rlm;&amp;zwnj;　　　　
③软件操作人员的水平&amp;rlm;&amp;zwnj;　　　　
④开发人员不能很好的理解需求说明书和沟通不足 D. ①、④ ①、②、③ ①、③ ②、③ ①、④">
<div class="sqe-question">
<p class="sqe-question-title">题 2-01（单选）</p>
<p>导致软件缺陷的原因有很多，①&amp;mdash;④是可能的原因，其中最主要的原因包括_____
①软件需求说明书编写的不全面，不完整，不准确，而且经常更改&amp;rlm;&amp;zwnj;　　　　
②软件设计说明书&amp;rlm;&amp;zwnj;　　　　
③软件操作人员的水平&amp;rlm;&amp;zwnj;　　　　
④开发人员不能很好的理解需求说明书和沟通不足</p>
<ul class="sqe-options"><li><strong>A.</strong> ①、②、③</li><li><strong>B.</strong> ①、③</li><li><strong>C.</strong> ②、③</li><li><strong>D.</strong> ①、④</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>D. ①、④</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） SINGLE 一条Bug记录应该包括_____
①编号
②Bug描述
③Bug级别
④Bug所属模块
⑤发现人 C. ①②③④⑤ ①②③④ ①② ①②③④⑤ ①②③">
<div class="sqe-question">
<p class="sqe-question-title">题 2-02（单选）</p>
<p>一条Bug记录应该包括_____
①编号
②Bug描述
③Bug级别
④Bug所属模块
⑤发现人</p>
<ul class="sqe-options"><li><strong>A.</strong> ①②③④</li><li><strong>B.</strong> ①②</li><li><strong>C.</strong> ①②③④⑤</li><li><strong>D.</strong> ①②③</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>C. ①②③④⑤</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） SINGLE 下面①--④是关于软件评测师工作原则的描述，正确的判断是_____。&amp;zwnj;&amp;zwnj;
①对于开发人员提交的程序必须进行完全的测试，以确保程序的质量&amp;zwnj;&amp;zwnj;
②必须合理安排测试任务，做好周密的测试计划，平均分配软件各个模块的测试时间&amp;zwnj;&amp;zwnj;
③在测试之前需要与开发人员进行详细的交流，明确开发人员的程序设计思路，并以此为依据开展软件测试工作，最大程度地发现程序中与其设计思路不一致的错误&amp;zwnj;&amp;zwnj;
④要对自己发现的问题负责，确保每一个问题都能被开发人员理解和修改。 B. 无 ①③ 无 ①② ②③">
<div class="sqe-question">
<p class="sqe-question-title">题 2-03（单选）</p>
<p>下面①--④是关于软件评测师工作原则的描述，正确的判断是_____。&amp;zwnj;&amp;zwnj;
①对于开发人员提交的程序必须进行完全的测试，以确保程序的质量&amp;zwnj;&amp;zwnj;
②必须合理安排测试任务，做好周密的测试计划，平均分配软件各个模块的测试时间&amp;zwnj;&amp;zwnj;
③在测试之前需要与开发人员进行详细的交流，明确开发人员的程序设计思路，并以此为依据开展软件测试工作，最大程度地发现程序中与其设计思路不一致的错误&amp;zwnj;&amp;zwnj;
④要对自己发现的问题负责，确保每一个问题都能被开发人员理解和修改。</p>
<ul class="sqe-options"><li><strong>A.</strong> ①③</li><li><strong>B.</strong> 无</li><li><strong>C.</strong> ①②</li><li><strong>D.</strong> ②③</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>B. 无</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） SINGLE &amp;zwnj;测试记录包括
&amp;zwnj;① 测试计划或包含测试用例的测试规格说明。
​&amp;zwnj;② 测试期间出现问题的评估与分析。
​&amp;zwnj;③ 与测试用例相关的所有结果，包括在测试期间出现的所有失败。
​&amp;zwnj;④ 测试中涉及的人员身份。 B. ① ③ ④ ① ② ③ ① ③ ④ ② ③ ① ② ③ ④">
<div class="sqe-question">
<p class="sqe-question-title">题 2-04（单选）</p>
<p>&amp;zwnj;测试记录包括
&amp;zwnj;① 测试计划或包含测试用例的测试规格说明。
​&amp;zwnj;② 测试期间出现问题的评估与分析。
​&amp;zwnj;③ 与测试用例相关的所有结果，包括在测试期间出现的所有失败。
​&amp;zwnj;④ 测试中涉及的人员身份。</p>
<ul class="sqe-options"><li><strong>A.</strong> ① ② ③</li><li><strong>B.</strong> ① ③ ④</li><li><strong>C.</strong> ② ③</li><li><strong>D.</strong> ① ② ③ ④</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>B. ① ③ ④</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） SINGLE 下列叙述中，_____是正确的。 A. 白盒测试又称为逻辑驱动测试 白盒测试又称为逻辑驱动测试 穷举路径测试可以查出程序中因遗漏路径而产生的错误 一般而言，黑盒测试对结构的覆盖比白盒测试高 必须根据软件需求说明文档生成用于白盒测试的测试用例">
<div class="sqe-question">
<p class="sqe-question-title">题 2-05（单选）</p>
<p>下列叙述中，_____是正确的。</p>
<ul class="sqe-options"><li><strong>A.</strong> 白盒测试又称为逻辑驱动测试</li><li><strong>B.</strong> 穷举路径测试可以查出程序中因遗漏路径而产生的错误</li><li><strong>C.</strong> 一般而言，黑盒测试对结构的覆盖比白盒测试高</li><li><strong>D.</strong> 必须根据软件需求说明文档生成用于白盒测试的测试用例</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 白盒测试又称为逻辑驱动测试</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） TF 需求分析 - 设计－实现－测试，软件测试是软件开发末期才需要做的工作。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 2-06（判断）</p>
<p>需求分析 - 设计－实现－测试，软件测试是软件开发末期才需要做的工作。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） TF 采用自动化测试工具后一定比手工测试发现的缺陷更多。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 2-07（判断）</p>
<p>采用自动化测试工具后一定比手工测试发现的缺陷更多。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） TF 测试人员要坚持原则，缺陷未修复完坚决不予通过。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 2-08（判断）</p>
<p>测试人员要坚持原则，缺陷未修复完坚决不予通过。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） TF 自底向上集成需要测试员编写驱动程序。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 2-09（判断）</p>
<p>自底向上集成需要测试员编写驱动程序。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） SINGLE 软件设计阶段的质量控制主要采取的方式是 D. 评审 白盒测试 动态测试 黑盒测试 评审">
<div class="sqe-question">
<p class="sqe-question-title">题 2-10（单选）</p>
<p>软件设计阶段的质量控制主要采取的方式是</p>
<ul class="sqe-options"><li><strong>A.</strong> 白盒测试</li><li><strong>B.</strong> 动态测试</li><li><strong>C.</strong> 黑盒测试</li><li><strong>D.</strong> 评审</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>D. 评审</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） SINGLE 下列各项中_____不是一个测试计划所应包含的内容。 D. 测试预期输出 测试资源、进度安排 测试策略 测试范围 测试预期输出">
<div class="sqe-question">
<p class="sqe-question-title">题 2-11（单选）</p>
<p>下列各项中_____不是一个测试计划所应包含的内容。</p>
<ul class="sqe-options"><li><strong>A.</strong> 测试资源、进度安排</li><li><strong>B.</strong> 测试策略</li><li><strong>C.</strong> 测试范围</li><li><strong>D.</strong> 测试预期输出</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>D. 测试预期输出</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） SINGLE 下列中不属于测试原则的是 D. 找到的缺陷越多软件残留的缺陷就越少 软件测试是有风险的行为 完全测试程序是不可能的 测试无法显示潜伏的软件缺陷 找到的缺陷越多软件残留的缺陷就越少">
<div class="sqe-question">
<p class="sqe-question-title">题 2-12（单选）</p>
<p>下列中不属于测试原则的是</p>
<ul class="sqe-options"><li><strong>A.</strong> 软件测试是有风险的行为</li><li><strong>B.</strong> 完全测试程序是不可能的</li><li><strong>C.</strong> 测试无法显示潜伏的软件缺陷</li><li><strong>D.</strong> 找到的缺陷越多软件残留的缺陷就越少</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>D. 找到的缺陷越多软件残留的缺陷就越少</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） SINGLE 关于自动化测试局限性的描述，以下描述错误的是 A. 自动测试比手工测试发现的缺陷少 自动测试比手工测试发现的缺陷少 自动化测试对测试设计依赖性极大 自动测试不能提高测试覆盖率 自动化测试不能取代手工测试">
<div class="sqe-question">
<p class="sqe-question-title">题 2-13（单选）</p>
<p>关于自动化测试局限性的描述，以下描述错误的是</p>
<ul class="sqe-options"><li><strong>A.</strong> 自动测试比手工测试发现的缺陷少</li><li><strong>B.</strong> 自动化测试对测试设计依赖性极大</li><li><strong>C.</strong> 自动测试不能提高测试覆盖率</li><li><strong>D.</strong> 自动化测试不能取代手工测试</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 自动测试比手工测试发现的缺陷少</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） SINGLE &amp;lrm;缺陷跟踪就是要确保每个被发现的缺陷最终都能够被_____，而不是不了了之 。 A. 关闭 关闭 改正 隐藏 发现">
<div class="sqe-question">
<p class="sqe-question-title">题 2-14（单选）</p>
<p>&amp;lrm;缺陷跟踪就是要确保每个被发现的缺陷最终都能够被_____，而不是不了了之 。</p>
<ul class="sqe-options"><li><strong>A.</strong> 关闭</li><li><strong>B.</strong> 改正</li><li><strong>C.</strong> 隐藏</li><li><strong>D.</strong> 发现</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 关闭</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） SINGLE _____是对要执行的软件测试及测试的结果进行描述、定义、规定和报告的任何书面或图示信息。 B. 软件测试文档 软件测试脚本 软件测试文档 软件测试用例 软件测试结果">
<div class="sqe-question">
<p class="sqe-question-title">题 2-15（单选）</p>
<p>_____是对要执行的软件测试及测试的结果进行描述、定义、规定和报告的任何书面或图示信息。</p>
<ul class="sqe-options"><li><strong>A.</strong> 软件测试脚本</li><li><strong>B.</strong> 软件测试文档</li><li><strong>C.</strong> 软件测试用例</li><li><strong>D.</strong> 软件测试结果</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>B. 软件测试文档</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） SINGLE 软件测试是按照特定的规程，_____的过程。 C. 发现软件错误 证明程序没有错误 设计并运行测试用例 发现软件错误 说明程序正确">
<div class="sqe-question">
<p class="sqe-question-title">题 2-16（单选）</p>
<p>软件测试是按照特定的规程，_____的过程。</p>
<ul class="sqe-options"><li><strong>A.</strong> 证明程序没有错误</li><li><strong>B.</strong> 设计并运行测试用例</li><li><strong>C.</strong> 发现软件错误</li><li><strong>D.</strong> 说明程序正确</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>C. 发现软件错误</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） SINGLE 软件质量保证与测试人员需要的的基本素质有 C. 所有选项都是 行业知识 测试专业技能 所有选项都是 计算机专业技能">
<div class="sqe-question">
<p class="sqe-question-title">题 2-17（单选）</p>
<p>软件质量保证与测试人员需要的的基本素质有</p>
<ul class="sqe-options"><li><strong>A.</strong> 行业知识</li><li><strong>B.</strong> 测试专业技能</li><li><strong>C.</strong> 所有选项都是</li><li><strong>D.</strong> 计算机专业技能</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>C. 所有选项都是</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） SINGLE 软件测试人员的工作职责不包括 B. 对软件缺陷进行修复 执行测试过程 对软件缺陷进行修复 制定测试计划 设计测试用例">
<div class="sqe-question">
<p class="sqe-question-title">题 2-18（单选）</p>
<p>软件测试人员的工作职责不包括</p>
<ul class="sqe-options"><li><strong>A.</strong> 执行测试过程</li><li><strong>B.</strong> 对软件缺陷进行修复</li><li><strong>C.</strong> 制定测试计划</li><li><strong>D.</strong> 设计测试用例</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>B. 对软件缺陷进行修复</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） SINGLE 关于自动化测试局限性的描述，以下描述错误的是 A. 自动测试比手工测试发现的缺陷少 自动测试比手工测试发现的缺陷少 自动测试不能提高测试覆盖率 自动化测试不能取代手工测试 自动化测试对测试设计依赖性极大">
<div class="sqe-question">
<p class="sqe-question-title">题 2-19（单选）</p>
<p>关于自动化测试局限性的描述，以下描述错误的是</p>
<ul class="sqe-options"><li><strong>A.</strong> 自动测试比手工测试发现的缺陷少</li><li><strong>B.</strong> 自动测试不能提高测试覆盖率</li><li><strong>C.</strong> 自动化测试不能取代手工测试</li><li><strong>D.</strong> 自动化测试对测试设计依赖性极大</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 自动测试比手工测试发现的缺陷少</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） SINGLE 通过继承机制，子类可以继承父类的特点和功能，这一特征为_____的扩散提供了途径。 D. 缺陷 消息 代码 数据 缺陷">
<div class="sqe-question">
<p class="sqe-question-title">题 2-20（单选）</p>
<p>通过继承机制，子类可以继承父类的特点和功能，这一特征为_____的扩散提供了途径。</p>
<ul class="sqe-options"><li><strong>A.</strong> 消息</li><li><strong>B.</strong> 代码</li><li><strong>C.</strong> 数据</li><li><strong>D.</strong> 缺陷</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>D. 缺陷</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） SINGLE ​封装这一特征简化了对对象的使用，但同时也给测试结构的_____、测试路径的选取、测试数据的生成等带来了困难。 B. 分析 合成 分析 定义 提取">
<div class="sqe-question">
<p class="sqe-question-title">题 2-21（单选）</p>
<p>​封装这一特征简化了对对象的使用，但同时也给测试结构的_____、测试路径的选取、测试数据的生成等带来了困难。</p>
<ul class="sqe-options"><li><strong>A.</strong> 合成</li><li><strong>B.</strong> 分析</li><li><strong>C.</strong> 定义</li><li><strong>D.</strong> 提取</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>B. 分析</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） SINGLE &amp;zwj;增量式集成测试有3种方式：自顶向下增量测试方法，_____和混合增量测试方式。 C. 自底向上增量测试方法 从大到小增量测试方法 自上向底增量测试方法 自底向上增量测试方法 从小到大增量测试方法">
<div class="sqe-question">
<p class="sqe-question-title">题 2-22（单选）</p>
<p>&amp;zwj;增量式集成测试有3种方式：自顶向下增量测试方法，_____和混合增量测试方式。</p>
<ul class="sqe-options"><li><strong>A.</strong> 从大到小增量测试方法</li><li><strong>B.</strong> 自上向底增量测试方法</li><li><strong>C.</strong> 自底向上增量测试方法</li><li><strong>D.</strong> 从小到大增量测试方法</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>C. 自底向上增量测试方法</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） SINGLE 代码检查法有桌面检查法，走查和 A. 代码审查 代码审查 静态测试 白盒测试 动态测试">
<div class="sqe-question">
<p class="sqe-question-title">题 2-23（单选）</p>
<p>代码检查法有桌面检查法，走查和</p>
<ul class="sqe-options"><li><strong>A.</strong> 代码审查</li><li><strong>B.</strong> 静态测试</li><li><strong>C.</strong> 白盒测试</li><li><strong>D.</strong> 动态测试</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 代码审查</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） FILL 按照是否需要知道被测试程序的内部结构，测试方法可以分为： （填空1） 测试和 （填空2） 测试。 填空1: 黑盒；填空2: 白盒 ">
<div class="sqe-question">
<p class="sqe-question-title">题 2-24（填空）</p>
<p>按照是否需要知道被测试程序的内部结构，测试方法可以分为： （填空1） 测试和 （填空2） 测试。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>填空</span><span>2 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 黑盒；填空2: 白盒</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） FILL 动态测试的两个基本要素是 （填空1） 、 （填空2） 。 填空1: 被测试程序；填空2: 测试用例 ">
<div class="sqe-question">
<p class="sqe-question-title">题 2-25（填空）</p>
<p>动态测试的两个基本要素是 （填空1） 、 （填空2） 。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>填空</span><span>2 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 被测试程序；填空2: 测试用例</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） TF &amp;zwnj;发现错误多的模块，残留在模块中的错误也多。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 2-26（判断）</p>
<p>&amp;zwnj;发现错误多的模块，残留在模块中的错误也多。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） TF 一个软件存在哪些缺陷，开发者和用户的立场是一致的。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 2-27（判断）</p>
<p>一个软件存在哪些缺陷，开发者和用户的立场是一致的。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） TF 软件测试针对的是初级程序员编写的程序，资深程序员编写的程序无需测试。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 2-28（判断）</p>
<p>软件测试针对的是初级程序员编写的程序，资深程序员编写的程序无需测试。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） SINGLE 划分软件测试属于白盒测试还是黑盒测试的依据是 D. 是否能看到被测源程序 运行结果是否确定 是否执行程序代码 是否能看到软件文档 是否能看到被测源程序">
<div class="sqe-question">
<p class="sqe-question-title">题 2-29（单选）</p>
<p>划分软件测试属于白盒测试还是黑盒测试的依据是</p>
<ul class="sqe-options"><li><strong>A.</strong> 运行结果是否确定</li><li><strong>B.</strong> 是否执行程序代码</li><li><strong>C.</strong> 是否能看到软件文档</li><li><strong>D.</strong> 是否能看到被测源程序</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>D. 是否能看到被测源程序</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） SINGLE 软件测试的局限性不包括 B. 软件测试会导致成本增加，项目总体效益降低。 有的缺陷与特定的环境条件有关。 软件测试会导致成本增加，项目总体效益降低。 巧合性有时会导致错误的代码得到正确的结果，掩盖了问题。 因为输入/状态空间的无限性，测试不可能完全彻底。">
<div class="sqe-question">
<p class="sqe-question-title">题 2-30（单选）</p>
<p>软件测试的局限性不包括</p>
<ul class="sqe-options"><li><strong>A.</strong> 有的缺陷与特定的环境条件有关。</li><li><strong>B.</strong> 软件测试会导致成本增加，项目总体效益降低。</li><li><strong>C.</strong> 巧合性有时会导致错误的代码得到正确的结果，掩盖了问题。</li><li><strong>D.</strong> 因为输入/状态空间的无限性，测试不可能完全彻底。</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>B. 软件测试会导致成本增加，项目总体效益降低。</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） SINGLE 较实用的软件测试停止标准是 C. 分析发现的缺陷数量和测试投入成本曲线图，确定应继续测试还是停止测试。 根据查出的缺陷总数量决定是否停止测试。 测试成本超过了预期计划，则停止测试。 分析发现的缺陷数量和测试投入成本曲线图，确定应继续测试还是停止测试。 测试超过了预定时间，则停止测试。">
<div class="sqe-question">
<p class="sqe-question-title">题 2-31（单选）</p>
<p>较实用的软件测试停止标准是</p>
<ul class="sqe-options"><li><strong>A.</strong> 根据查出的缺陷总数量决定是否停止测试。</li><li><strong>B.</strong> 测试成本超过了预期计划，则停止测试。</li><li><strong>C.</strong> 分析发现的缺陷数量和测试投入成本曲线图，确定应继续测试还是停止测试。</li><li><strong>D.</strong> 测试超过了预定时间，则停止测试。</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>C. 分析发现的缺陷数量和测试投入成本曲线图，确定应继续测试还是停止测试。</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） SINGLE 下列中不属于测试原则的是 D. 找到的缺陷越多，软件遗留的缺陷就越少 软件测试是有风险的行为 完全测试程序是不可能的 测试无法找出所有的软件缺陷 找到的缺陷越多，软件遗留的缺陷就越少">
<div class="sqe-question">
<p class="sqe-question-title">题 2-32（单选）</p>
<p>下列中不属于测试原则的是</p>
<ul class="sqe-options"><li><strong>A.</strong> 软件测试是有风险的行为</li><li><strong>B.</strong> 完全测试程序是不可能的</li><li><strong>C.</strong> 测试无法找出所有的软件缺陷</li><li><strong>D.</strong> 找到的缺陷越多，软件遗留的缺陷就越少</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>D. 找到的缺陷越多，软件遗留的缺陷就越少</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） TF &amp;zwnj;好的测试员不懈追求完美，保证通过测试的软件不会再有缺陷。&amp;zwj;  ">
<div class="sqe-question">
<p class="sqe-question-title">题 2-33（判断）</p>
<p>&amp;zwnj;好的测试员不懈追求完美，保证通过测试的软件不会再有缺陷。&amp;zwj;</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） TF 测试是为了验证软件已正确地实现了用户的要求。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 2-34（判断）</p>
<p>测试是为了验证软件已正确地实现了用户的要求。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） SINGLE 经验表明，在程序测试中，某模块与其他模块相比，若该模块已发现并改正的错误较多，则该模块中残存的错误数目与其他模块相比，通常应该 D. 较多 相似 不确定 较少 较多">
<div class="sqe-question">
<p class="sqe-question-title">题 2-35（单选）</p>
<p>经验表明，在程序测试中，某模块与其他模块相比，若该模块已发现并改正的错误较多，则该模块中残存的错误数目与其他模块相比，通常应该</p>
<ul class="sqe-options"><li><strong>A.</strong> 相似</li><li><strong>B.</strong> 不确定</li><li><strong>C.</strong> 较少</li><li><strong>D.</strong> 较多</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>D. 较多</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） SINGLE ​以下哪一类人员与软件质量保证与测试工作无关？ A. 软件销售人员 软件销售人员 软件需求分析人员 代码开发人员 软件设计人员">
<div class="sqe-question">
<p class="sqe-question-title">题 2-36（单选）</p>
<p>​以下哪一类人员与软件质量保证与测试工作无关？</p>
<ul class="sqe-options"><li><strong>A.</strong> 软件销售人员</li><li><strong>B.</strong> 软件需求分析人员</li><li><strong>C.</strong> 代码开发人员</li><li><strong>D.</strong> 软件设计人员</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 软件销售人员</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） SINGLE 软件测试用例主要由输入数据和_________两部分组成。 C. 预期输出结果 测试计划 测试规则 预期输出结果 以往测试记录分析">
<div class="sqe-question">
<p class="sqe-question-title">题 2-37（单选）</p>
<p>软件测试用例主要由输入数据和_________两部分组成。</p>
<ul class="sqe-options"><li><strong>A.</strong> 测试计划</li><li><strong>B.</strong> 测试规则</li><li><strong>C.</strong> 预期输出结果</li><li><strong>D.</strong> 以往测试记录分析</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>C. 预期输出结果</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） SINGLE 与设计测试用例无关的文档是______ A. 项目开发计划 项目开发计划 需求规格说明书 设计说明书 源程序">
<div class="sqe-question">
<p class="sqe-question-title">题 2-38（单选）</p>
<p>与设计测试用例无关的文档是______</p>
<ul class="sqe-options"><li><strong>A.</strong> 项目开发计划</li><li><strong>B.</strong> 需求规格说明书</li><li><strong>C.</strong> 设计说明书</li><li><strong>D.</strong> 源程序</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 项目开发计划</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） MULTI 在确定测试目标的过程中，测试人员主要完成以下的________ A. 确定测试的标准和规范；B. 确定测试环境；C. 确定所需要的测试资源；D. 确定用户的特殊要求 确定测试的标准和规范 确定测试环境 确定所需要的测试资源 确定用户的特殊要求">
<div class="sqe-question">
<p class="sqe-question-title">题 2-39（多选）</p>
<p>在确定测试目标的过程中，测试人员主要完成以下的________</p>
<ul class="sqe-options"><li><strong>A.</strong> 确定测试的标准和规范</li><li><strong>B.</strong> 确定测试环境</li><li><strong>C.</strong> 确定所需要的测试资源</li><li><strong>D.</strong> 确定用户的特殊要求</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>多选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 确定测试的标准和规范；B. 确定测试环境；C. 确定所需要的测试资源；D. 确定用户的特殊要求</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） SINGLE 测试人员应在软件生命周期中的下面哪个阶段介入最好______ A. 需求阶段 需求阶段 设计阶段 编码阶段 系统集成阶段">
<div class="sqe-question">
<p class="sqe-question-title">题 2-40（单选）</p>
<p>测试人员应在软件生命周期中的下面哪个阶段介入最好______</p>
<ul class="sqe-options"><li><strong>A.</strong> 需求阶段</li><li><strong>B.</strong> 设计阶段</li><li><strong>C.</strong> 编码阶段</li><li><strong>D.</strong> 系统集成阶段</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 需求阶段</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） SINGLE 软件测试的对象包括_____ D. 以上所有 需求分析、概要设计和详细设计 程序源代码 需求规格说明 以上所有">
<div class="sqe-question">
<p class="sqe-question-title">题 2-41（单选）</p>
<p>软件测试的对象包括_____</p>
<ul class="sqe-options"><li><strong>A.</strong> 需求分析、概要设计和详细设计</li><li><strong>B.</strong> 程序源代码</li><li><strong>C.</strong> 需求规格说明</li><li><strong>D.</strong> 以上所有</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>D. 以上所有</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） SINGLE 从测试的要求来讲，如果想让测试完成的效果更好，测试部门与开发部门的关系最好是下面四种中的____ D. 测试组织与开发组织为不同公司。 测试组织与开发组织为同一公司同一部门同一小组，并且测试人员与开发人员为同一组人员，即开发人员测试自己的程序。 测试组织与开发组织为同一公司同一部门同一小组，但测试人员与开发人员为不同人员。 测试组织与开发组织为同一公司，但不在同一部门。 测试组织与开发组织为不同公司。">
<div class="sqe-question">
<p class="sqe-question-title">题 2-42（单选）</p>
<p>从测试的要求来讲，如果想让测试完成的效果更好，测试部门与开发部门的关系最好是下面四种中的____</p>
<ul class="sqe-options"><li><strong>A.</strong> 测试组织与开发组织为同一公司同一部门同一小组，并且测试人员与开发人员为同一组人员，即开发人员测试自己的程序。</li><li><strong>B.</strong> 测试组织与开发组织为同一公司同一部门同一小组，但测试人员与开发人员为不同人员。</li><li><strong>C.</strong> 测试组织与开发组织为同一公司，但不在同一部门。</li><li><strong>D.</strong> 测试组织与开发组织为不同公司。</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>D. 测试组织与开发组织为不同公司。</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） TF 代码评审员一般由测试员担任。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 2-43（判断）</p>
<p>代码评审员一般由测试员担任。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） SINGLE 以下属于安全测试方法的是。
①安全功能验证
②安全漏洞扫描
③模拟攻击实验
④数据侦听 D. ①②③④ ①③ ①②③ ①②④ ①②③④">
<div class="sqe-question">
<p class="sqe-question-title">题 2-44（单选）</p>
<p>以下属于安全测试方法的是。
①安全功能验证
②安全漏洞扫描
③模拟攻击实验
④数据侦听</p>
<ul class="sqe-options"><li><strong>A.</strong> ①③</li><li><strong>B.</strong> ①②③</li><li><strong>C.</strong> ①②④</li><li><strong>D.</strong> ①②③④</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>D. ①②③④</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） SINGLE 编写测试计划的目的是。
①使测试工作顺利进行
②使项目参与人员沟通更舒畅
③使测试工作更加系统化
④软件过程规范化的要求
⑤控制软件质量 B. ①②③ ②③⑤ ①②③ ①②④ ①②⑤">
<div class="sqe-question">
<p class="sqe-question-title">题 2-45（单选）</p>
<p>编写测试计划的目的是。
①使测试工作顺利进行
②使项目参与人员沟通更舒畅
③使测试工作更加系统化
④软件过程规范化的要求
⑤控制软件质量</p>
<ul class="sqe-options"><li><strong>A.</strong> ②③⑤</li><li><strong>B.</strong> ①②③</li><li><strong>C.</strong> ①②④</li><li><strong>D.</strong> ①②⑤</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>B. ①②③</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） SINGLE 对需求说明书评测的内容包括。
①系统定义的目标是否与用户的要求一致
②被开发项目的数据流与数据结构是否足够、确定
③与所有其它系统交互的重要接口是否都已经描述
④主要功能是否已包含在规定的软件范围之内，是否都已充分说明
⑤确认软件的内部接口与外部接口是否已明确定义 D. ①②③④ ①③⑤ ②③⑤ ①②④⑤ ①②③④">
<div class="sqe-question">
<p class="sqe-question-title">题 2-46（单选）</p>
<p>对需求说明书评测的内容包括。
①系统定义的目标是否与用户的要求一致
②被开发项目的数据流与数据结构是否足够、确定
③与所有其它系统交互的重要接口是否都已经描述
④主要功能是否已包含在规定的软件范围之内，是否都已充分说明
⑤确认软件的内部接口与外部接口是否已明确定义</p>
<ul class="sqe-options"><li><strong>A.</strong> ①③⑤</li><li><strong>B.</strong> ②③⑤</li><li><strong>C.</strong> ①②④⑤</li><li><strong>D.</strong> ①②③④</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>D. ①②③④</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） SINGLE 以下关于白盒测试和黑盒测试的理解，正确是 A. 白盒测试通过对程序内部结构的分析、检测来寻找问题 白盒测试通过对程序内部结构的分析、检测来寻找问题 白盒测试通过一些表征性的现象、事件、标志来判断内部的运行状态 单元测试可应用白盒测试方法，集成测试则采用黑盒测试方法 在软件生命周期各个阶段都需要用白盒测试方法">
<div class="sqe-question">
<p class="sqe-question-title">题 2-47（单选）</p>
<p>以下关于白盒测试和黑盒测试的理解，正确是</p>
<ul class="sqe-options"><li><strong>A.</strong> 白盒测试通过对程序内部结构的分析、检测来寻找问题</li><li><strong>B.</strong> 白盒测试通过一些表征性的现象、事件、标志来判断内部的运行状态</li><li><strong>C.</strong> 单元测试可应用白盒测试方法，集成测试则采用黑盒测试方法</li><li><strong>D.</strong> 在软件生命周期各个阶段都需要用白盒测试方法</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 白盒测试通过对程序内部结构的分析、检测来寻找问题</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） SINGLE 为了使软件测试更加高效，应遵循的原则包括。
①所有的软件测试都应追溯到用户需求、充分注意缺陷群集现象
②尽早地和不断地进行软件测试、回归测试
③为了证明程序的正确性，尽可能多的开发测试用例
④应由不同的测试人员对测试所发现的缺陷进行确认
⑤增量测试，由小到大 D. ①②④⑤ ①②③④ ①③④⑤ ②③④ ①②④⑤">
<div class="sqe-question">
<p class="sqe-question-title">题 2-48（单选）</p>
<p>为了使软件测试更加高效，应遵循的原则包括。
①所有的软件测试都应追溯到用户需求、充分注意缺陷群集现象
②尽早地和不断地进行软件测试、回归测试
③为了证明程序的正确性，尽可能多的开发测试用例
④应由不同的测试人员对测试所发现的缺陷进行确认
⑤增量测试，由小到大</p>
<ul class="sqe-options"><li><strong>A.</strong> ①②③④</li><li><strong>B.</strong> ①③④⑤</li><li><strong>C.</strong> ②③④</li><li><strong>D.</strong> ①②④⑤</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>D. ①②④⑤</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） SINGLE 不是正确的软件测试目的。 B. 设计一个好的测试用例对用户需求的覆盖度达到100％ 尽最大的可能找出最多的错误 设计一个好的测试用例对用户需求的覆盖度达到100％ 对软件质量进行度量和评估，以提高软件的质量 发现开发所采用的软件过程的缺陷，进行软件过程改进">
<div class="sqe-question">
<p class="sqe-question-title">题 2-49（单选）</p>
<p>不是正确的软件测试目的。</p>
<ul class="sqe-options"><li><strong>A.</strong> 尽最大的可能找出最多的错误</li><li><strong>B.</strong> 设计一个好的测试用例对用户需求的覆盖度达到100％</li><li><strong>C.</strong> 对软件质量进行度量和评估，以提高软件的质量</li><li><strong>D.</strong> 发现开发所采用的软件过程的缺陷，进行软件过程改进</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>B. 设计一个好的测试用例对用户需求的覆盖度达到100％</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） SINGLE 设计功能测试用例的根本依据是。 A. 用户需求规格说明书 用户需求规格说明书 用户手册 被测产品的用户界面 概要设计说明书">
<div class="sqe-question">
<p class="sqe-question-title">题 2-50（单选）</p>
<p>设计功能测试用例的根本依据是。</p>
<ul class="sqe-options"><li><strong>A.</strong> 用户需求规格说明书</li><li><strong>B.</strong> 用户手册</li><li><strong>C.</strong> 被测产品的用户界面</li><li><strong>D.</strong> 概要设计说明书</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 用户需求规格说明书</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） SINGLE 使用软件测试工具的目的不包括。 D. 提高设计质量 帮助测试寻找问题 协助问题的诊断 节省测试时间 提高设计质量">
<div class="sqe-question">
<p class="sqe-question-title">题 2-51（单选）</p>
<p>使用软件测试工具的目的不包括。</p>
<ul class="sqe-options"><li><strong>A.</strong> 帮助测试寻找问题</li><li><strong>B.</strong> 协助问题的诊断</li><li><strong>C.</strong> 节省测试时间</li><li><strong>D.</strong> 提高设计质量</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>D. 提高设计质量</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） SINGLE 以下关于软件测试原则的说法中，错误的是 B. 测试过程中某模块中查出的错误越多，该模块残留的错误就越少 在设计测试用例时，不但要包括合理的输入条件，还要包括不合理的输入条件 测试过程中某模块中查出的错误越多，该模块残留的错误就越少 坚持在软件开发各个阶段进行技术评审，才能在开发过程中尽早发现和预防错误 在测试过程中要严格按照测试计划执行，以避免发生疏漏或重复无效的工作">
<div class="sqe-question">
<p class="sqe-question-title">题 2-52（单选）</p>
<p>以下关于软件测试原则的说法中，错误的是</p>
<ul class="sqe-options"><li><strong>A.</strong> 在设计测试用例时，不但要包括合理的输入条件，还要包括不合理的输入条件</li><li><strong>B.</strong> 测试过程中某模块中查出的错误越多，该模块残留的错误就越少</li><li><strong>C.</strong> 坚持在软件开发各个阶段进行技术评审，才能在开发过程中尽早发现和预防错误</li><li><strong>D.</strong> 在测试过程中要严格按照测试计划执行，以避免发生疏漏或重复无效的工作</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>B. 测试过程中某模块中查出的错误越多，该模块残留的错误就越少</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） TF 测试是为了验证软件已正确地实现了用户的要求。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 2-53（判断）</p>
<p>测试是为了验证软件已正确地实现了用户的要求。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） FILL 动态测试技术主要使用的分析方法包括： （填空1） 测试、 （填空2）测试 和 （填空3）测试 。 填空1: 白盒；填空2: 黑盒；填空3: 灰盒 ">
<div class="sqe-question">
<p class="sqe-question-title">题 2-54（填空）</p>
<p>动态测试技术主要使用的分析方法包括： （填空1） 测试、 （填空2）测试 和 （填空3）测试 。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>填空</span><span>3 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 白盒；填空2: 黑盒；填空3: 灰盒</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） FILL 回归测试的目的是所做的修改 （填空1） ，同时 （填空2） 的正确性。 填空1: 达到了预定的目的；填空2: 不影响软件原有功能 ">
<div class="sqe-question">
<p class="sqe-question-title">题 2-55（填空）</p>
<p>回归测试的目的是所做的修改 （填空1） ，同时 （填空2） 的正确性。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>填空</span><span>2 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 达到了预定的目的；填空2: 不影响软件原有功能</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） SINGLE 为了提高测试效率应该_____ D. 选择发现错误的可能性大的数据作为测试数据 随机地选取测试数据 取一切可能的输入数据作为测试数据 在完成编码以后制定软件的测试计划 选择发现错误的可能性大的数据作为测试数据">
<div class="sqe-question">
<p class="sqe-question-title">题 2-56（单选）</p>
<p>为了提高测试效率应该_____</p>
<ul class="sqe-options"><li><strong>A.</strong> 随机地选取测试数据</li><li><strong>B.</strong> 取一切可能的输入数据作为测试数据</li><li><strong>C.</strong> 在完成编码以后制定软件的测试计划</li><li><strong>D.</strong> 选择发现错误的可能性大的数据作为测试数据</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>D. 选择发现错误的可能性大的数据作为测试数据</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） SINGLE 测试工程师的工作范围会包括检视代码、评审开发文档，这属于_____ B. 静态测试 动态测试 静态测试 黑盒测试 白盒测试">
<div class="sqe-question">
<p class="sqe-question-title">题 2-57（单选）</p>
<p>测试工程师的工作范围会包括检视代码、评审开发文档，这属于_____</p>
<ul class="sqe-options"><li><strong>A.</strong> 动态测试</li><li><strong>B.</strong> 静态测试</li><li><strong>C.</strong> 黑盒测试</li><li><strong>D.</strong> 白盒测试</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>B. 静态测试</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） MULTI 软件测试的责任是：_______。 A. 编写合理的测试计划，并与项目整体计划有机地整合在一起；B. 针对测试需求进行相关测试技术的研究；C. 进行缺陷跟踪与分析；D. 编写覆盖率高的测试用例 编写合理的测试计划，并与项目整体计划有机地整合在一起 针对测试需求进行相关测试技术的研究 进行缺陷跟踪与分析 编写覆盖率高的测试用例">
<div class="sqe-question">
<p class="sqe-question-title">题 2-58（多选）</p>
<p>软件测试的责任是：_______。</p>
<ul class="sqe-options"><li><strong>A.</strong> 编写合理的测试计划，并与项目整体计划有机地整合在一起</li><li><strong>B.</strong> 针对测试需求进行相关测试技术的研究</li><li><strong>C.</strong> 进行缺陷跟踪与分析</li><li><strong>D.</strong> 编写覆盖率高的测试用例</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>多选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 编写合理的测试计划，并与项目整体计划有机地整合在一起；B. 针对测试需求进行相关测试技术的研究；C. 进行缺陷跟踪与分析；D. 编写覆盖率高的测试用例</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） SINGLE 软件测试按照测试层次可以分为______。 C. 单元测试、集成测试和系统测试 黑盒测试、白盒测试 功能性测试和结构性测试 单元测试、集成测试和系统测试 动态测试和静态测试">
<div class="sqe-question">
<p class="sqe-question-title">题 2-59（单选）</p>
<p>软件测试按照测试层次可以分为______。</p>
<ul class="sqe-options"><li><strong>A.</strong> 黑盒测试、白盒测试</li><li><strong>B.</strong> 功能性测试和结构性测试</li><li><strong>C.</strong> 单元测试、集成测试和系统测试</li><li><strong>D.</strong> 动态测试和静态测试</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>C. 单元测试、集成测试和系统测试</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） TF 在软件测试中, 测试预言是一种检验待测系统在特定执行下是否正确运行的方法。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 2-60（判断）</p>
<p>在软件测试中, 测试预言是一种检验待测系统在特定执行下是否正确运行的方法。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） TF 测试人员说：没有可运行的程序，我无法进行测试工作。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 2-61（判断）</p>
<p>测试人员说：没有可运行的程序，我无法进行测试工作。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） TF 项目立项前测试人员不需要提交任何工件。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 2-62（判断）</p>
<p>项目立项前测试人员不需要提交任何工件。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） TF 发现错误多的模块，残留在模块中的错误也多。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 2-63（判断）</p>
<p>发现错误多的模块，残留在模块中的错误也多。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） TF 只要能够达到100％的逻辑覆盖率，就可以保证程序的正确性。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 2-64（判断）</p>
<p>只要能够达到100％的逻辑覆盖率，就可以保证程序的正确性。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） TF 测试人员要坚持原则，缺陷未修复完坚决不予通过。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 2-65（判断）</p>
<p>测试人员要坚持原则，缺陷未修复完坚决不予通过。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） FILL 动态测试技术主要使用的分析方法包括： （填空1） 测试、 （填空2） 测试和 （填空3） 测试。 填空1: 白盒；填空2: 黑盒；填空3: 灰盒 ">
<div class="sqe-question">
<p class="sqe-question-title">题 2-66（填空）</p>
<p>动态测试技术主要使用的分析方法包括： （填空1） 测试、 （填空2） 测试和 （填空3） 测试。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>填空</span><span>3 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 白盒；填空2: 黑盒；填空3: 灰盒</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） SINGLE 某软件公司在招聘软件评测师时，应聘者甲向公司做如下保证：
① 经过自己测试的软件今后不会再出现问题；
② 在工作中对所有程序员一视同仁，不会因为在某个程序员编写的程序中发现的问题多，就重点审查该程序，以免不利于团结；
③ 承诺不需要其他人员，自己就可以独立进行测试工作；
④ 发扬咬定青山不放松的精神，不把所有问题都找出来，决不罢休；
你认为应聘者甲的保证 _____。 D. 都不正确 ①、④是正确的 ②是正确的 都是正确的 都不正确">
<div class="sqe-question">
<p class="sqe-question-title">题 2-67（单选）</p>
<p>某软件公司在招聘软件评测师时，应聘者甲向公司做如下保证：
① 经过自己测试的软件今后不会再出现问题；
② 在工作中对所有程序员一视同仁，不会因为在某个程序员编写的程序中发现的问题多，就重点审查该程序，以免不利于团结；
③ 承诺不需要其他人员，自己就可以独立进行测试工作；
④ 发扬咬定青山不放松的精神，不把所有问题都找出来，决不罢休；
你认为应聘者甲的保证 _____。</p>
<ul class="sqe-options"><li><strong>A.</strong> ①、④是正确的</li><li><strong>B.</strong> ②是正确的</li><li><strong>C.</strong> 都是正确的</li><li><strong>D.</strong> 都不正确</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>D. 都不正确</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） SINGLE 软件测试步骤理解有误的是：______。 C. 白盒法考虑的是测试用例对程序外部逻辑的覆盖程度 模块测试通常又称为单元测试目的是保证每个模块作为一个单元能正确运行 系统测试是把经过测试的于系统装配成一个完整的系统来测试 白盒法考虑的是测试用例对程序外部逻辑的覆盖程度 验收测试把软件系统作为单一的实体进行测试，它是在用户积极参与下进行的">
<div class="sqe-question">
<p class="sqe-question-title">题 2-68（单选）</p>
<p>软件测试步骤理解有误的是：______。</p>
<ul class="sqe-options"><li><strong>A.</strong> 模块测试通常又称为单元测试目的是保证每个模块作为一个单元能正确运行</li><li><strong>B.</strong> 系统测试是把经过测试的于系统装配成一个完整的系统来测试</li><li><strong>C.</strong> 白盒法考虑的是测试用例对程序外部逻辑的覆盖程度</li><li><strong>D.</strong> 验收测试把软件系统作为单一的实体进行测试，它是在用户积极参与下进行的</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>C. 白盒法考虑的是测试用例对程序外部逻辑的覆盖程度</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） SINGLE 不属于测试工具的优点是_____。 C. 通过工具我们可以达到 100%的测试覆盖率 增强了测试的能力，扩展了测试的深度和广度 重现软件缺陷的能力 通过工具我们可以达到 100%的测试覆盖率 减轻了测试工作量并缩短了测试进度">
<div class="sqe-question">
<p class="sqe-question-title">题 2-69（单选）</p>
<p>不属于测试工具的优点是_____。</p>
<ul class="sqe-options"><li><strong>A.</strong> 增强了测试的能力，扩展了测试的深度和广度</li><li><strong>B.</strong> 重现软件缺陷的能力</li><li><strong>C.</strong> 通过工具我们可以达到 100%的测试覆盖率</li><li><strong>D.</strong> 减轻了测试工作量并缩短了测试进度</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>C. 通过工具我们可以达到 100%的测试覆盖率</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） SINGLE 下列 _____不属于测试原则的内容。 D. 找到的缺陷越多软件的缺陷就越少 软件测试是有风险的行为 完全测试程序是不可能的 测试无法显示潜伏的软件缺陷 找到的缺陷越多软件的缺陷就越少">
<div class="sqe-question">
<p class="sqe-question-title">题 2-70（单选）</p>
<p>下列 _____不属于测试原则的内容。</p>
<ul class="sqe-options"><li><strong>A.</strong> 软件测试是有风险的行为</li><li><strong>B.</strong> 完全测试程序是不可能的</li><li><strong>C.</strong> 测试无法显示潜伏的软件缺陷</li><li><strong>D.</strong> 找到的缺陷越多软件的缺陷就越少</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>D. 找到的缺陷越多软件的缺陷就越少</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） SINGLE 软件测试类型按开发阶段划分是 _____。 B. 单元测试、集成测试、确认测试、系统测试、验收测试 需求测试、单元测试、集成测试、验证测试 单元测试、集成测试、确认测试、系统测试、验收测试 单元测试、集成测试、验证测试、确认测试、验收测试 调试、单元测试、集成测试、用户测试">
<div class="sqe-question">
<p class="sqe-question-title">题 2-71（单选）</p>
<p>软件测试类型按开发阶段划分是 _____。</p>
<ul class="sqe-options"><li><strong>A.</strong> 需求测试、单元测试、集成测试、验证测试</li><li><strong>B.</strong> 单元测试、集成测试、确认测试、系统测试、验收测试</li><li><strong>C.</strong> 单元测试、集成测试、验证测试、确认测试、验收测试</li><li><strong>D.</strong> 调试、单元测试、集成测试、用户测试</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>B. 单元测试、集成测试、确认测试、系统测试、验收测试</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） SINGLE _____ 可以作为软件测试结束的标志。 B. 错误强度曲线下降到预定的水平 使用了特定的测试用例 错误强度曲线下降到预定的水平 查出了预定数目的错误 按照测试计划中所规定的时间进行了测试">
<div class="sqe-question">
<p class="sqe-question-title">题 2-72（单选）</p>
<p>_____ 可以作为软件测试结束的标志。</p>
<ul class="sqe-options"><li><strong>A.</strong> 使用了特定的测试用例</li><li><strong>B.</strong> 错误强度曲线下降到预定的水平</li><li><strong>C.</strong> 查出了预定数目的错误</li><li><strong>D.</strong> 按照测试计划中所规定的时间进行了测试</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>B. 错误强度曲线下降到预定的水平</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） SINGLE 对测试用例描述不正确的是______。 D. 不同类别的软件，测试用例是相同的 为某个特殊目标而编制的一组测试输入 为某个特殊目标而编制执行条件以及预期结果 便于测试某个程序路径或核实是否满足某个特定需求 不同类别的软件，测试用例是相同的">
<div class="sqe-question">
<p class="sqe-question-title">题 2-73（单选）</p>
<p>对测试用例描述不正确的是______。</p>
<ul class="sqe-options"><li><strong>A.</strong> 为某个特殊目标而编制的一组测试输入</li><li><strong>B.</strong> 为某个特殊目标而编制执行条件以及预期结果</li><li><strong>C.</strong> 便于测试某个程序路径或核实是否满足某个特定需求</li><li><strong>D.</strong> 不同类别的软件，测试用例是相同的</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>D. 不同类别的软件，测试用例是相同的</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） MULTI 软件测试计划评审会需要哪些人员参加？______。 A. 项目经理；B. SQA 负责人；C. 配置负责人；D. 测试组 项目经理 SQA 负责人 配置负责人 测试组">
<div class="sqe-question">
<p class="sqe-question-title">题 2-74（多选）</p>
<p>软件测试计划评审会需要哪些人员参加？______。</p>
<ul class="sqe-options"><li><strong>A.</strong> 项目经理</li><li><strong>B.</strong> SQA 负责人</li><li><strong>C.</strong> 配置负责人</li><li><strong>D.</strong> 测试组</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>多选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 项目经理；B. SQA 负责人；C. 配置负责人；D. 测试组</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） MULTI 软件测试过程包括哪些步骤______。 A. 单元测试；B. 集成测试；C. 验收测试；D. 确认测试 单元测试 集成测试 验收测试 确认测试">
<div class="sqe-question">
<p class="sqe-question-title">题 2-75（多选）</p>
<p>软件测试过程包括哪些步骤______。</p>
<ul class="sqe-options"><li><strong>A.</strong> 单元测试</li><li><strong>B.</strong> 集成测试</li><li><strong>C.</strong> 验收测试</li><li><strong>D.</strong> 确认测试</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>多选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 单元测试；B. 集成测试；C. 验收测试；D. 确认测试</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） MULTI 测试设计员的职责有：_____。 B. 设计测试用例；C. 设计测试过程、脚本 制定测试计划 设计测试用例 设计测试过程、脚本 ​评估测试活动">
<div class="sqe-question">
<p class="sqe-question-title">题 2-76（多选）</p>
<p>测试设计员的职责有：_____。</p>
<ul class="sqe-options"><li><strong>A.</strong> 制定测试计划</li><li><strong>B.</strong> 设计测试用例</li><li><strong>C.</strong> 设计测试过程、脚本</li><li><strong>D.</strong> ​评估测试活动</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>多选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>B. 设计测试用例；C. 设计测试过程、脚本</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） MULTI 关于软件测试的概述说法不正确的是______。 A. 用更好的程序语言编写程序可以避免出错；B. 软件测试在软件开发总工作量的比例应最低 用更好的程序语言编写程序可以避免出错 软件测试在软件开发总工作量的比例应最低 软件测试需要人员的交流 软件测试与软件开发并行">
<div class="sqe-question">
<p class="sqe-question-title">题 2-77（多选）</p>
<p>关于软件测试的概述说法不正确的是______。</p>
<ul class="sqe-options"><li><strong>A.</strong> 用更好的程序语言编写程序可以避免出错</li><li><strong>B.</strong> 软件测试在软件开发总工作量的比例应最低</li><li><strong>C.</strong> 软件测试需要人员的交流</li><li><strong>D.</strong> 软件测试与软件开发并行</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>多选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 用更好的程序语言编写程序可以避免出错；B. 软件测试在软件开发总工作量的比例应最低</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） MULTI 关于软件测试的理解有误的是______。 B. 软件测试目的是为了改正软件的错误；D. 应用系统开发完毕，再对它进行软件测试 软件测试是为了寻找软件缺陷而执行程序的过程 软件测试目的是为了改正软件的错误 软件测试与软件开发是同步进行的 应用系统开发完毕，再对它进行软件测试">
<div class="sqe-question">
<p class="sqe-question-title">题 2-78（多选）</p>
<p>关于软件测试的理解有误的是______。</p>
<ul class="sqe-options"><li><strong>A.</strong> 软件测试是为了寻找软件缺陷而执行程序的过程</li><li><strong>B.</strong> 软件测试目的是为了改正软件的错误</li><li><strong>C.</strong> 软件测试与软件开发是同步进行的</li><li><strong>D.</strong> 应用系统开发完毕，再对它进行软件测试</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>多选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>B. 软件测试目的是为了改正软件的错误；D. 应用系统开发完毕，再对它进行软件测试</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） TF 软件测试工具可以代替软件测试员。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 2-79（判断）</p>
<p>软件测试工具可以代替软件测试员。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） TF 软件测试等于程序测试。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 2-80（判断）</p>
<p>软件测试等于程序测试。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） TF 最重要的用户界面要素是软件符合现行标准和规范。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 2-81（判断）</p>
<p>最重要的用户界面要素是软件符合现行标准和规范。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） TF 软件测试是有风险的行为，并非所有的软件缺陷都能够被修复。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 2-82（判断）</p>
<p>软件测试是有风险的行为，并非所有的软件缺陷都能够被修复。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） TF 传统测试以发现错误为目的，现在测试已经扩展到了错误预防的范畴。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 2-83（判断）</p>
<p>传统测试以发现错误为目的，现在测试已经扩展到了错误预防的范畴。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） TF 我们有理由相信只要能够设计出尽可能好的测试方案，经过严格测试之后的软件可以没有缺陷。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 2-84（判断）</p>
<p>我们有理由相信只要能够设计出尽可能好的测试方案，经过严格测试之后的软件可以没有缺陷。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） TF 设计－实现－测试，软件测试是开发后期的一个阶段。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 2-85（判断）</p>
<p>设计－实现－测试，软件测试是开发后期的一个阶段。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） TF 永远有缺陷类型会在测试的一个层次上被发现，并且能够在另一个层次上逃避检测。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 2-86（判断）</p>
<p>永远有缺陷类型会在测试的一个层次上被发现，并且能够在另一个层次上逃避检测。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课后练习 课后练习（计入总分） TF 程序员兼任测试员可以提高工作效率。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 2-87（判断）</p>
<p>程序员兼任测试员可以提高工作效率。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验一课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>
</section>

<section id="quiz-3" class="sqe-chapter">
<div class="sqe-chapter-head">
<span class="sqe-number">03</span>
<div><small>课后练习（计入总分） · 云班课 QUIZ</small><h3>第七章课后练习</h3><div><span class="sqe-source-pill">题目接口直接导出</span><span class="sqe-source-pill">18 道题</span></div></div>
</div>

<article class="sqe-card" data-sqe-card data-sqe-text="第七章课后练习 课后练习（计入总分） FILL 为了保证项目组能够采用合适的技术和工具，我们应该进行 （填空1） 填空1: 软件工具的评估 ">
<div class="sqe-question">
<p class="sqe-question-title">题 3-01（填空）</p>
<p>为了保证项目组能够采用合适的技术和工具，我们应该进行 （填空1）</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第七章课后练习</span><span>填空</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 软件工具的评估</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第七章课后练习 课后练习（计入总分） TF 审核是对工作流程的评审，而评审则主要侧重产品本身。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 3-02（判断）</p>
<p>审核是对工作流程的评审，而评审则主要侧重产品本身。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第七章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第七章课后练习 课后练习（计入总分） SINGLE SQA计划实施步骤的第一步是 C. 了解项目的需求，明确项目SQA计划的要求和范围 选择SQA任务 估计SQA的工作量和资源 了解项目的需求，明确项目SQA计划的要求和范围 安排SQA任务和日程">
<div class="sqe-question">
<p class="sqe-question-title">题 3-03（单选）</p>
<p>SQA计划实施步骤的第一步是</p>
<ul class="sqe-options"><li><strong>A.</strong> 选择SQA任务</li><li><strong>B.</strong> 估计SQA的工作量和资源</li><li><strong>C.</strong> 了解项目的需求，明确项目SQA计划的要求和范围</li><li><strong>D.</strong> 安排SQA任务和日程</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第七章课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>C. 了解项目的需求，明确项目SQA计划的要求和范围</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第七章课后练习 课后练习（计入总分） TF SQA组织负责生产高质量的软件产品和制定质量计划，责任是审计软件经理和软件工程组的质量活动并鉴别活动中出现的偏差。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 3-04（判断）</p>
<p>SQA组织负责生产高质量的软件产品和制定质量计划，责任是审计软件经理和软件工程组的质量活动并鉴别活动中出现的偏差。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第七章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第七章课后练习 课后练习（计入总分） TF SQA人员与开发工程师本质上是对立的。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 3-05（判断）</p>
<p>SQA人员与开发工程师本质上是对立的。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第七章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第七章课后练习 课后练习（计入总分） TF 为了让SQA人员可以全心投入本职工作，所以SQA人员必须是全职的。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 3-06（判断）</p>
<p>为了让SQA人员可以全心投入本职工作，所以SQA人员必须是全职的。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第七章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第七章课后练习 课后练习（计入总分） SINGLE 以下三种组织结构中，哪种相对完善一些 C. 独立的SQA工程师（独立的SQA小组） 独立的SQA工程师（非独立SQA小组） 独立的SQA部门 独立的SQA工程师（独立的SQA小组）">
<div class="sqe-question">
<p class="sqe-question-title">题 3-07（单选）</p>
<p>以下三种组织结构中，哪种相对完善一些</p>
<ul class="sqe-options"><li><strong>A.</strong> 独立的SQA工程师（非独立SQA小组）</li><li><strong>B.</strong> 独立的SQA部门</li><li><strong>C.</strong> 独立的SQA工程师（独立的SQA小组）</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第七章课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>C. 独立的SQA工程师（独立的SQA小组）</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第七章课后练习 课后练习（计入总分） MULTI 以下属于独立SQA部门优点的是： B. 保护SQA工程师的独立性和客观性；D. 有利于资源的共享 能够深入项目发现实质性问题 保护SQA工程师的独立性和客观性 便于部门之间经验的分享 有利于资源的共享">
<div class="sqe-question">
<p class="sqe-question-title">题 3-08（多选）</p>
<p>以下属于独立SQA部门优点的是：</p>
<ul class="sqe-options"><li><strong>A.</strong> 能够深入项目发现实质性问题</li><li><strong>B.</strong> 保护SQA工程师的独立性和客观性</li><li><strong>C.</strong> 便于部门之间经验的分享</li><li><strong>D.</strong> 有利于资源的共享</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第七章课后练习</span><span>多选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>B. 保护SQA工程师的独立性和客观性；D. 有利于资源的共享</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第七章课后练习 课后练习（计入总分） TF 创建SQA部门的时候，与企业本身实际相比，更重要的是参考业界流行的各种标准（如ISO、CMMI等）。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 3-09（判断）</p>
<p>创建SQA部门的时候，与企业本身实际相比，更重要的是参考业界流行的各种标准（如ISO、CMMI等）。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第七章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第七章课后练习 课后练习（计入总分） FILL 六西格玛组织结构从上到下分为 （填空1） 、 黑带主管(大师)、 （填空2） 、 （填空3） 。 填空1: 倡导者；填空2: 黑带；填空3: 绿带 ">
<div class="sqe-question">
<p class="sqe-question-title">题 3-10（填空）</p>
<p>六西格玛组织结构从上到下分为 （填空1） 、 黑带主管(大师)、 （填空2） 、 （填空3） 。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第七章课后练习</span><span>填空</span><span>3 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 倡导者；填空2: 黑带；填空3: 绿带</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第七章课后练习 课后练习（计入总分） TF 软件工程过程组类似于一个&amp;ldquo;立法&amp;rdquo;机构，而SQA则类似于一个&amp;ldquo;监督&amp;rdquo;机构。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 3-11（判断）</p>
<p>软件工程过程组类似于一个&amp;ldquo;立法&amp;rdquo;机构，而SQA则类似于一个&amp;ldquo;监督&amp;rdquo;机构。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第七章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第七章课后练习 课后练习（计入总分） TF 任何不符合客户需求的地方都可以认为是缺陷。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 3-12（判断）</p>
<p>任何不符合客户需求的地方都可以认为是缺陷。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第七章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第七章课后练习 课后练习（计入总分） MULTI 在企业中，最常见的质量保证组织是______。 A. 软件测试部门；B. 软件质量保证组织 软件测试部门 软件质量保证组织 生产车间 技术部门">
<div class="sqe-question">
<p class="sqe-question-title">题 3-13（多选）</p>
<p>在企业中，最常见的质量保证组织是______。</p>
<ul class="sqe-options"><li><strong>A.</strong> 软件测试部门</li><li><strong>B.</strong> 软件质量保证组织</li><li><strong>C.</strong> 生产车间</li><li><strong>D.</strong> 技术部门</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第七章课后练习</span><span>多选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 软件测试部门；B. 软件质量保证组织</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第七章课后练习 课后练习（计入总分） TF 所有SQA活动和项目里程碑的完成或项目里程碑的检验是同时发生的。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 3-14（判断）</p>
<p>所有SQA活动和项目里程碑的完成或项目里程碑的检验是同时发生的。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第七章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第七章课后练习 课后练习（计入总分） TF 在整个机构中使用基础设施防护与改进部件的主要目标是在机构积累的SQA经验基础上消除或至少降低出错率。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 3-15（判断）</p>
<p>在整个机构中使用基础设施防护与改进部件的主要目标是在机构积累的SQA经验基础上消除或至少降低出错率。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第七章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第七章课后练习 课后练习（计入总分） TF 软件质量系统之间各不相同，说明机构SQA系统构建存在固有灵活性。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 3-16（判断）</p>
<p>软件质量系统之间各不相同，说明机构SQA系统构建存在固有灵活性。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第七章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第七章课后练习 课后练习（计入总分） TF 在软件产品制定生产计划阶段,不必进行重大的SQA活动。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 3-17（判断）</p>
<p>在软件产品制定生产计划阶段,不必进行重大的SQA活动。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第七章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第七章课后练习 课后练习（计入总分） FILL （填空1） 是一个动态的过程，需要不断调度、协调，保证项目的均衡发展。 填空1: 项目的进度管理 ">
<div class="sqe-question">
<p class="sqe-question-title">题 3-18（填空）</p>
<p>（填空1） 是一个动态的过程，需要不断调度、协调，保证项目的均衡发展。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第七章课后练习</span><span>填空</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 项目的进度管理</p></div></details></div>
</article>
</section>

<section id="quiz-4" class="sqe-chapter">
<div class="sqe-chapter-head">
<span class="sqe-number">04</span>
<div><small>课上测试（计入总分） · 云班课 QUIZ</small><h3>第七章课上测试</h3><div><span class="sqe-source-pill">题目接口直接导出</span><span class="sqe-source-pill">10 道题</span></div></div>
</div>

<article class="sqe-card" data-sqe-card data-sqe-text="第七章课上测试 课上测试（计入总分） FILL 为了保证项目组能够采用合适的技术和工具，我们应该进行 （填空1） 填空1: 软件工具的评估 ">
<div class="sqe-question">
<p class="sqe-question-title">题 4-01（填空）</p>
<p>为了保证项目组能够采用合适的技术和工具，我们应该进行 （填空1）</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第七章课上测试</span><span>填空</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 软件工具的评估</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第七章课上测试 课上测试（计入总分） TF 审核是对工作流程的评审，而评审则主要侧重产品本身。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 4-02（判断）</p>
<p>审核是对工作流程的评审，而评审则主要侧重产品本身。</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第七章课上测试</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第七章课上测试 课上测试（计入总分） TF SQA组织负责生产高质量的软件产品和制定质量计划，责任是审计软件经理和软件工程组的质量活动并鉴别活动中出现的偏差。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 4-03（判断）</p>
<p>SQA组织负责生产高质量的软件产品和制定质量计划，责任是审计软件经理和软件工程组的质量活动并鉴别活动中出现的偏差。</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第七章课上测试</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第七章课上测试 课上测试（计入总分） TF 为了让SQA人员可以全心投入本职工作，所以SQA人员必须是全职的。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 4-04（判断）</p>
<p>为了让SQA人员可以全心投入本职工作，所以SQA人员必须是全职的。</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第七章课上测试</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第七章课上测试 课上测试（计入总分） SINGLE 以下三种组织结构中，哪种相对完善一些 C. 独立的SQA工程师（独立的SQA小组） 独立的SQA工程师（非独立SQA小组） 独立的SQA部门 独立的SQA工程师（独立的SQA小组）">
<div class="sqe-question">
<p class="sqe-question-title">题 4-05（单选）</p>
<p>以下三种组织结构中，哪种相对完善一些</p>
<ul class="sqe-options"><li><strong>A.</strong> 独立的SQA工程师（非独立SQA小组）</li><li><strong>B.</strong> 独立的SQA部门</li><li><strong>C.</strong> 独立的SQA工程师（独立的SQA小组）</li></ul>
<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第七章课上测试</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>C. 独立的SQA工程师（独立的SQA小组）</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第七章课上测试 课上测试（计入总分） TF 创建SQA部门的时候，与企业本身实际相比，更重要的是参考业界流行的各种标准（如ISO、CMMI等）。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 4-06（判断）</p>
<p>创建SQA部门的时候，与企业本身实际相比，更重要的是参考业界流行的各种标准（如ISO、CMMI等）。</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第七章课上测试</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第七章课上测试 课上测试（计入总分） TF 软件工程过程组类似于一个&amp;ldquo;立法&amp;rdquo;机构，而SQA则类似于一个&amp;ldquo;监督&amp;rdquo;机构。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 4-07（判断）</p>
<p>软件工程过程组类似于一个&amp;ldquo;立法&amp;rdquo;机构，而SQA则类似于一个&amp;ldquo;监督&amp;rdquo;机构。</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第七章课上测试</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第七章课上测试 课上测试（计入总分） TF 任何不符合客户需求的地方都可以认为是缺陷。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 4-08（判断）</p>
<p>任何不符合客户需求的地方都可以认为是缺陷。</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第七章课上测试</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第七章课上测试 课上测试（计入总分） MULTI 在企业中，最常见的质量保证组织是______。 A. 软件测试部门；B. 软件质量保证组织 软件测试部门 软件质量保证组织 生产车间 技术部门">
<div class="sqe-question">
<p class="sqe-question-title">题 4-09（多选）</p>
<p>在企业中，最常见的质量保证组织是______。</p>
<ul class="sqe-options"><li><strong>A.</strong> 软件测试部门</li><li><strong>B.</strong> 软件质量保证组织</li><li><strong>C.</strong> 生产车间</li><li><strong>D.</strong> 技术部门</li></ul>
<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第七章课上测试</span><span>多选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 软件测试部门；B. 软件质量保证组织</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第七章课上测试 课上测试（计入总分） TF 软件质量系统之间各不相同，说明机构SQA系统构建存在固有灵活性。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 4-10（判断）</p>
<p>软件质量系统之间各不相同，说明机构SQA系统构建存在固有灵活性。</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第七章课上测试</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>
</section>

<section id="quiz-5" class="sqe-chapter">
<div class="sqe-chapter-head">
<span class="sqe-number">05</span>
<div><small>课后练习（计入总分） · 云班课 QUIZ</small><h3>第九章课后练习</h3><div><span class="sqe-source-pill">题目接口直接导出</span><span class="sqe-source-pill">13 道题</span></div></div>
</div>

<article class="sqe-card" data-sqe-card data-sqe-text="第九章课后练习 课后练习（计入总分） TF 注释的位置应与被描述的代码相邻，可以放在代码的上方或右方，不可放在下方。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 5-01（判断）</p>
<p>注释的位置应与被描述的代码相邻，可以放在代码的上方或右方，不可放在下方。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第九章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第九章课后练习 课后练习（计入总分） FILL 建议文件结构包含三部分内容，包括：定义文件开头处的 （填空1） 和 （填空2） 声明；对一些头文件的引用；程序的实现体（包括数据和代码）。 填空1: 版权；填空2: 版本 ">
<div class="sqe-question">
<p class="sqe-question-title">题 5-02（填空）</p>
<p>建议文件结构包含三部分内容，包括：定义文件开头处的 （填空1） 和 （填空2） 声明；对一些头文件的引用；程序的实现体（包括数据和代码）。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第九章课后练习</span><span>填空</span><span>2 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 版权；填空2: 版本</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第九章课后练习 课后练习（计入总分） FILL 正常值用 （填空1） 获得，错误标志用 （填空2） 返回。 填空1: 输出参数；填空2: return语句 ">
<div class="sqe-question">
<p class="sqe-question-title">题 5-03（填空）</p>
<p>正常值用 （填空1） 获得，错误标志用 （填空2） 返回。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第九章课后练习</span><span>填空</span><span>2 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 输出参数；填空2: return语句</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第九章课后练习 课后练习（计入总分） TF 边写代码边注释，修改代码同时修改相应的注释  ">
<div class="sqe-question">
<p class="sqe-question-title">题 5-04（判断）</p>
<p>边写代码边注释，修改代码同时修改相应的注释</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第九章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第九章课后练习 课后练习（计入总分） TF 建议将浮点变量用&amp;ldquo;==&amp;rdquo;或&amp;ldquo;！=&amp;rdquo;与数字比较。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 5-05（判断）</p>
<p>建议将浮点变量用&amp;ldquo;==&amp;rdquo;或&amp;ldquo;！=&amp;rdquo;与数字比较。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第九章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第九章课后练习 课后练习（计入总分） MULTI 以下属于优秀代码风格的是 A. If（ j= =1）；D. If（i〉MAX_NUM） If（ j= =1） If（1= = j） If（i〉5000） If（i〉MAX_NUM）">
<div class="sqe-question">
<p class="sqe-question-title">题 5-06（多选）</p>
<p>以下属于优秀代码风格的是</p>
<ul class="sqe-options"><li><strong>A.</strong> If（ j= =1）</li><li><strong>B.</strong> If（1= = j）</li><li><strong>C.</strong> If（i〉5000）</li><li><strong>D.</strong> If（i〉MAX_NUM）</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第九章课后练习</span><span>多选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. If（ j= =1）；D. If（i〉MAX_NUM）</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第九章课后练习 课后练习（计入总分） MULTI 以下属于Windows程序命名规则的是 A. 全局函数的名字应当使用&amp;ldquo;动词&amp;rdquo;或者&amp;ldquo;动词+名词&amp;rdquo;；C. 静态变量加前缀s_。如果必须定义使用全局变量，则在全局变量前加g_；D. 常量全用大写的字母，用下划线分割单词 全局函数的名字应当使用&amp;ldquo;动词&amp;rdquo;或者&amp;ldquo;动词+名词&amp;rdquo; 程序中要靠大小写来区分相似的标识符 静态变量加前缀s_。如果必须定义使用全局变量，则在全局变量前加g_ 常量全用大写的字母，用下划线分割单词">
<div class="sqe-question">
<p class="sqe-question-title">题 5-07（多选）</p>
<p>以下属于Windows程序命名规则的是</p>
<ul class="sqe-options"><li><strong>A.</strong> 全局函数的名字应当使用&amp;ldquo;动词&amp;rdquo;或者&amp;ldquo;动词+名词&amp;rdquo;</li><li><strong>B.</strong> 程序中要靠大小写来区分相似的标识符</li><li><strong>C.</strong> 静态变量加前缀s_。如果必须定义使用全局变量，则在全局变量前加g_</li><li><strong>D.</strong> 常量全用大写的字母，用下划线分割单词</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第九章课后练习</span><span>多选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 全局函数的名字应当使用&amp;ldquo;动词&amp;rdquo;或者&amp;ldquo;动词+名词&amp;rdquo;；C. 静态变量加前缀s_。如果必须定义使用全局变量，则在全局变量前加g_；D. 常量全用大写的字母，用下划线分割单词</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第九章课后练习 课后练习（计入总分） MULTI 下列属于函数处理规则的是 A. 如果参数是指针且仅做输入用，应该在类型前面加const，以防止该指针在函数体内被意外修改；B. 如果输入参数以值传递的方式传递对象，宜改用&amp;ldquo;const &amp; &amp;rdquo;方式来传递，这样可以省去临时对象的构造和析构过程，从而提高效率；C. 不要将正常值和错误标志混在一起返回。正常值用输出参数获得，错误标志用return语句返回；D. 不要将正常值和错误标志混在一起返回。正常值用输出参数获得，错误标志用return语句返回 如果参数是指针且仅做输入用，应该在类型前面加const，以防止该指针在函数体内被意外修改 如果输入参数以值传递的方式传递对象，宜改用&amp;ldquo;const &amp; &amp;rdquo;方式来传递，这样可以省去临时对象的构造和析构过程，从而提高效率 不要将正常值和错误标志混在一起返回。正常值用输出参数获得，错误标志用return语句返回 不要将正常值和错误标志混在一起返回。正常值用输出参数获得，错误标志用return语句返回">
<div class="sqe-question">
<p class="sqe-question-title">题 5-08（多选）</p>
<p>下列属于函数处理规则的是</p>
<ul class="sqe-options"><li><strong>A.</strong> 如果参数是指针且仅做输入用，应该在类型前面加const，以防止该指针在函数体内被意外修改</li><li><strong>B.</strong> 如果输入参数以值传递的方式传递对象，宜改用&amp;ldquo;const &amp; &amp;rdquo;方式来传递，这样可以省去临时对象的构造和析构过程，从而提高效率</li><li><strong>C.</strong> 不要将正常值和错误标志混在一起返回。正常值用输出参数获得，错误标志用return语句返回</li><li><strong>D.</strong> 不要将正常值和错误标志混在一起返回。正常值用输出参数获得，错误标志用return语句返回</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第九章课后练习</span><span>多选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 如果参数是指针且仅做输入用，应该在类型前面加const，以防止该指针在函数体内被意外修改；B. 如果输入参数以值传递的方式传递对象，宜改用&amp;ldquo;const &amp; &amp;rdquo;方式来传递，这样可以省去临时对象的构造和析构过程，从而提高效率；C. 不要将正常值和错误标志混在一起返回。正常值用输出参数获得，错误标志用return语句返回；D. 不要将正常值和错误标志混在一起返回。正常值用输出参数获得，错误标志用return语句返回</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第九章课后练习 课后练习（计入总分） MULTI 以下符合程序版式规则的是 A. 尽可能在定义变量的同时初始化该变量；B. 长表达式要在低优先级操作符处拆分成新行，操作符放在新行之首；C. 尽量避免在注释中使用缩写，特别是不常用缩写 尽可能在定义变量的同时初始化该变量 长表达式要在低优先级操作符处拆分成新行，操作符放在新行之首 尽量避免在注释中使用缩写，特别是不常用缩写 注释的位置可以放在被描述的代码相邻的任何地方">
<div class="sqe-question">
<p class="sqe-question-title">题 5-09（多选）</p>
<p>以下符合程序版式规则的是</p>
<ul class="sqe-options"><li><strong>A.</strong> 尽可能在定义变量的同时初始化该变量</li><li><strong>B.</strong> 长表达式要在低优先级操作符处拆分成新行，操作符放在新行之首</li><li><strong>C.</strong> 尽量避免在注释中使用缩写，特别是不常用缩写</li><li><strong>D.</strong> 注释的位置可以放在被描述的代码相邻的任何地方</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第九章课后练习</span><span>多选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 尽可能在定义变量的同时初始化该变量；B. 长表达式要在低优先级操作符处拆分成新行，操作符放在新行之首；C. 尽量避免在注释中使用缩写，特别是不常用缩写</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第九章课后练习 课后练习（计入总分） MULTI 以下符合基本语句规则的是 A. if语句不可将浮点变量用&amp;ldquo;==&amp;rdquo;或&amp;ldquo;！=&amp;rdquo;与任何数字比较；B. 不可在for循环体内修改循环变量；C. 建议for语句的循环控制变量的取值采用&amp;ldquo;半开半闭区间&amp;rdquo;写法；D. if语句不可将布尔变量直接与TRUE、FALSE或者1、0进行比较 if语句不可将浮点变量用&amp;ldquo;==&amp;rdquo;或&amp;ldquo;！=&amp;rdquo;与任何数字比较 不可在for循环体内修改循环变量 建议for语句的循环控制变量的取值采用&amp;ldquo;半开半闭区间&amp;rdquo;写法 if语句不可将布尔变量直接与TRUE、FALSE或者1、0进行比较">
<div class="sqe-question">
<p class="sqe-question-title">题 5-10（多选）</p>
<p>以下符合基本语句规则的是</p>
<ul class="sqe-options"><li><strong>A.</strong> if语句不可将浮点变量用&amp;ldquo;==&amp;rdquo;或&amp;ldquo;！=&amp;rdquo;与任何数字比较</li><li><strong>B.</strong> 不可在for循环体内修改循环变量</li><li><strong>C.</strong> 建议for语句的循环控制变量的取值采用&amp;ldquo;半开半闭区间&amp;rdquo;写法</li><li><strong>D.</strong> if语句不可将布尔变量直接与TRUE、FALSE或者1、0进行比较</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第九章课后练习</span><span>多选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. if语句不可将浮点变量用&amp;ldquo;==&amp;rdquo;或&amp;ldquo;！=&amp;rdquo;与任何数字比较；B. 不可在for循环体内修改循环变量；C. 建议for语句的循环控制变量的取值采用&amp;ldquo;半开半闭区间&amp;rdquo;写法；D. if语句不可将布尔变量直接与TRUE、FALSE或者1、0进行比较</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第九章课后练习 课后练习（计入总分） MULTI 以下符合内存使用规范的是 A. 程序在运行的时候用malloc或new申请动态内存分配，动态内存的生存期由我们决定；D. 静态存储区域在程序的整个运行期间都存在 程序在运行的时候用malloc或new申请动态内存分配，动态内存的生存期由我们决定 全局变量，static变量应建立在动态内存上 栈上创建的存储单元的生命周期也由我们决定 静态存储区域在程序的整个运行期间都存在">
<div class="sqe-question">
<p class="sqe-question-title">题 5-11（多选）</p>
<p>以下符合内存使用规范的是</p>
<ul class="sqe-options"><li><strong>A.</strong> 程序在运行的时候用malloc或new申请动态内存分配，动态内存的生存期由我们决定</li><li><strong>B.</strong> 全局变量，static变量应建立在动态内存上</li><li><strong>C.</strong> 栈上创建的存储单元的生命周期也由我们决定</li><li><strong>D.</strong> 静态存储区域在程序的整个运行期间都存在</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第九章课后练习</span><span>多选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 程序在运行的时候用malloc或new申请动态内存分配，动态内存的生存期由我们决定；D. 静态存储区域在程序的整个运行期间都存在</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第九章课后练习 课后练习（计入总分） MULTI 以下符合内存使用规范的是 A. 用malloc或new来申请内存，应该用if(p==NULL) 或if(p!=NULL)进行防错处理；B. 内存分配成功后，应尽快对其进行初始化；C. 程序中malloc与free的使用次数一定要相同；D. free和delete只是把指针所指的内存给释放掉，但并没有把指针本身干掉 用malloc或new来申请内存，应该用if(p==NULL) 或if(p!=NULL)进行防错处理 内存分配成功后，应尽快对其进行初始化 程序中malloc与free的使用次数一定要相同 free和delete只是把指针所指的内存给释放掉，但并没有把指针本身干掉">
<div class="sqe-question">
<p class="sqe-question-title">题 5-12（多选）</p>
<p>以下符合内存使用规范的是</p>
<ul class="sqe-options"><li><strong>A.</strong> 用malloc或new来申请内存，应该用if(p==NULL) 或if(p!=NULL)进行防错处理</li><li><strong>B.</strong> 内存分配成功后，应尽快对其进行初始化</li><li><strong>C.</strong> 程序中malloc与free的使用次数一定要相同</li><li><strong>D.</strong> free和delete只是把指针所指的内存给释放掉，但并没有把指针本身干掉</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第九章课后练习</span><span>多选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 用malloc或new来申请内存，应该用if(p==NULL) 或if(p!=NULL)进行防错处理；B. 内存分配成功后，应尽快对其进行初始化；C. 程序中malloc与free的使用次数一定要相同；D. free和delete只是把指针所指的内存给释放掉，但并没有把指针本身干掉</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第九章课后练习 课后练习（计入总分） MULTI 以下说法正确的是 A. const可以修饰函数的参数、返回值，函数的定义体等。修饰的东西受到强制保护，可以预防意外的变动；C. void Func(const A &amp;a)的形式可以有效防止参数a被意外修改；D. 如果输入参数采用&amp;ldquo;指针传递&amp;rdquo;，那么加const修饰可以防止意外地改动该指针，起到保护作用 const可以修饰函数的参数、返回值，函数的定义体等。修饰的东西受到强制保护，可以预防意外的变动 const既能修饰输入参数也能修饰输出参数 void Func(const A &amp;a)的形式可以有效防止参数a被意外修改 如果输入参数采用&amp;ldquo;指针传递&amp;rdquo;，那么加const修饰可以防止意外地改动该指针，起到保护作用">
<div class="sqe-question">
<p class="sqe-question-title">题 5-13（多选）</p>
<p>以下说法正确的是</p>
<ul class="sqe-options"><li><strong>A.</strong> const可以修饰函数的参数、返回值，函数的定义体等。修饰的东西受到强制保护，可以预防意外的变动</li><li><strong>B.</strong> const既能修饰输入参数也能修饰输出参数</li><li><strong>C.</strong> void Func(const A &amp;a)的形式可以有效防止参数a被意外修改</li><li><strong>D.</strong> 如果输入参数采用&amp;ldquo;指针传递&amp;rdquo;，那么加const修饰可以防止意外地改动该指针，起到保护作用</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第九章课后练习</span><span>多选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. const可以修饰函数的参数、返回值，函数的定义体等。修饰的东西受到强制保护，可以预防意外的变动；C. void Func(const A &amp;a)的形式可以有效防止参数a被意外修改；D. 如果输入参数采用&amp;ldquo;指针传递&amp;rdquo;，那么加const修饰可以防止意外地改动该指针，起到保护作用</p></div></details></div>
</article>
</section>

<section id="quiz-6" class="sqe-chapter">
<div class="sqe-chapter-head">
<span class="sqe-number">06</span>
<div><small>课后练习（计入总分） · 云班课 QUIZ</small><h3>第五章课后练习</h3><div><span class="sqe-source-pill">题目接口直接导出</span><span class="sqe-source-pill">11 道题</span></div></div>
</div>

<article class="sqe-card" data-sqe-card data-sqe-text="第五章课后练习 课后练习（计入总分） FILL CMMI的内容主要有3个级别： （填空1） 的、 （填空2） 的以及 （填空3） 的。 填空1: 必需；填空2: 期望；填空3: 提供信息 ">
<div class="sqe-question">
<p class="sqe-question-title">题 6-01（填空）</p>
<p>CMMI的内容主要有3个级别： （填空1） 的、 （填空2） 的以及 （填空3） 的。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第五章课后练习</span><span>填空</span><span>3 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 必需；填空2: 期望；填空3: 提供信息</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第五章课后练习 课后练习（计入总分） TF 软件过程能力成熟度是指一个特定过程被明确定义、管理、测量、控制并且是有效的程度。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 6-02（判断）</p>
<p>软件过程能力成熟度是指一个特定过程被明确定义、管理、测量、控制并且是有效的程度。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第五章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第五章课后练习 课后练习（计入总分） TF 为了达到一个成熟度等级，必须实现该等级上的全部关键过程区域。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 6-03（判断）</p>
<p>为了达到一个成熟度等级，必须实现该等级上的全部关键过程区域。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第五章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第五章课后练习 课后练习（计入总分） TF 优化级说明已管理的过程，定义了评估软件过程和产品质量的度量。利用此度量对软件过程和产品做出推断和控制。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 6-04（判断）</p>
<p>优化级说明已管理的过程，定义了评估软件过程和产品质量的度量。利用此度量对软件过程和产品做出推断和控制。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第五章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第五章课后练习 课后练习（计入总分） FILL CMM为软件过程改进提供了一个框架，将整个软件改进过程分为 （填空1） （请填写阿拉伯数字）个成熟度等级。 填空1: 5 ">
<div class="sqe-question">
<p class="sqe-question-title">题 6-05（填空）</p>
<p>CMM为软件过程改进提供了一个框架，将整个软件改进过程分为 （填空1） （请填写阿拉伯数字）个成熟度等级。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第五章课后练习</span><span>填空</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 5</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第五章课后练习 课后练习（计入总分） FILL 根据软件工程标准制定的机构和标准适用的范围，可将其分为5个级别，即 （填空1） 、 （填空2） 、 （填空3） 、 （填空4） 及 （填空5） 。 填空1: 国际标准；填空2: 国家标准；填空3: 行业标准；填空4: 企业规范；填空5: 项目规范 ">
<div class="sqe-question">
<p class="sqe-question-title">题 6-06（填空）</p>
<p>根据软件工程标准制定的机构和标准适用的范围，可将其分为5个级别，即 （填空1） 、 （填空2） 、 （填空3） 、 （填空4） 及 （填空5） 。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第五章课后练习</span><span>填空</span><span>5 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 国际标准；填空2: 国家标准；填空3: 行业标准；填空4: 企业规范；填空5: 项目规范</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第五章课后练习 课后练习（计入总分） FILL CMM将整个软件改进过程分为 （填空1） 、 （填空2） 、 （填空3） 、 （填空4） 、 （填空5） 等5个成熟度等级。 填空1: 初始级；填空2: 可重复级；填空3: 已定义级；填空4: 已管理级；填空5: 优化级 ">
<div class="sqe-question">
<p class="sqe-question-title">题 6-07（填空）</p>
<p>CMM将整个软件改进过程分为 （填空1） 、 （填空2） 、 （填空3） 、 （填空4） 、 （填空5） 等5个成熟度等级。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第五章课后练习</span><span>填空</span><span>5 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 初始级；填空2: 可重复级；填空3: 已定义级；填空4: 已管理级；填空5: 优化级</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第五章课后练习 课后练习（计入总分） MULTI 软件设计需要注意哪些问题：____________ A. 减少耦合；C. 代码重用；D. 功能分解 减少耦合 考虑范围要窄 代码重用 功能分解">
<div class="sqe-question">
<p class="sqe-question-title">题 6-08（多选）</p>
<p>软件设计需要注意哪些问题：____________</p>
<ul class="sqe-options"><li><strong>A.</strong> 减少耦合</li><li><strong>B.</strong> 考虑范围要窄</li><li><strong>C.</strong> 代码重用</li><li><strong>D.</strong> 功能分解</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第五章课后练习</span><span>多选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 减少耦合；C. 代码重用；D. 功能分解</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第五章课后练习 课后练习（计入总分） SINGLE 根据CMMI规范，每一个软件企业均具有_________成熟度。 A. 等级一 等级一 等级三 等级四 等级五">
<div class="sqe-question">
<p class="sqe-question-title">题 6-09（单选）</p>
<p>根据CMMI规范，每一个软件企业均具有_________成熟度。</p>
<ul class="sqe-options"><li><strong>A.</strong> 等级一</li><li><strong>B.</strong> 等级三</li><li><strong>C.</strong> 等级四</li><li><strong>D.</strong> 等级五</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第五章课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 等级一</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第五章课后练习 课后练习（计入总分） FILL CMM的意义不仅仅是对软件开发的过程进程控制，还是一种高效的管理方法，有助于企业最大程度的 （填空1） ， （填空2） 和 （填空3） 。 填空1: 降低成本；填空2: 提高质量；填空3: 用户满意度 ">
<div class="sqe-question">
<p class="sqe-question-title">题 6-10（填空）</p>
<p>CMM的意义不仅仅是对软件开发的过程进程控制，还是一种高效的管理方法，有助于企业最大程度的 （填空1） ， （填空2） 和 （填空3） 。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第五章课后练习</span><span>填空</span><span>3 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 降低成本；填空2: 提高质量；填空3: 用户满意度</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第五章课后练习 课后练习（计入总分） SINGLE cmm 模型将软件过程的成熟度分为 5 个等级，在_____使用定量分析来不断地改进和管理软件过程。 B. 管理级 优化级 管理级 定义级 可重复级">
<div class="sqe-question">
<p class="sqe-question-title">题 6-11（单选）</p>
<p>cmm 模型将软件过程的成熟度分为 5 个等级，在_____使用定量分析来不断地改进和管理软件过程。</p>
<ul class="sqe-options"><li><strong>A.</strong> 优化级</li><li><strong>B.</strong> 管理级</li><li><strong>C.</strong> 定义级</li><li><strong>D.</strong> 可重复级</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第五章课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>B. 管理级</p></div></details></div>
</article>
</section>

<section id="quiz-7" class="sqe-chapter">
<div class="sqe-chapter-head">
<span class="sqe-number">07</span>
<div><small>课上测试（计入总分） · 云班课 QUIZ</small><h3>第三章课上测试</h3><div><span class="sqe-source-pill">题目接口直接导出</span><span class="sqe-source-pill">10 道题</span></div></div>
</div>

<article class="sqe-card" data-sqe-card data-sqe-text="第三章课上测试 课上测试（计入总分） TF 软件可靠性是指一个系统或组件在某个特定时期、特定条件下完成所需完成的功能的能力。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 7-01（判断）</p>
<p>软件可靠性是指一个系统或组件在某个特定时期、特定条件下完成所需完成的功能的能力。</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第三章课上测试</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第三章课上测试 课上测试（计入总分） SINGLE 软件工程概念的提出是由于______。 B. 软件危机的出现 计算技术的发展 软件危机的出现 程序设计方法学的影响 其它工程科学的影响">
<div class="sqe-question">
<p class="sqe-question-title">题 7-02（单选）</p>
<p>软件工程概念的提出是由于______。</p>
<ul class="sqe-options"><li><strong>A.</strong> 计算技术的发展</li><li><strong>B.</strong> 软件危机的出现</li><li><strong>C.</strong> 程序设计方法学的影响</li><li><strong>D.</strong> 其它工程科学的影响</li></ul>
<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第三章课上测试</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>B. 软件危机的出现</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第三章课上测试 课上测试（计入总分） SINGLE 系统可维护性的评价指标不包括______。 C. 可移植性 可理解性 可测试性 可移植性 可修改性">
<div class="sqe-question">
<p class="sqe-question-title">题 7-03（单选）</p>
<p>系统可维护性的评价指标不包括______。</p>
<ul class="sqe-options"><li><strong>A.</strong> 可理解性</li><li><strong>B.</strong> 可测试性</li><li><strong>C.</strong> 可移植性</li><li><strong>D.</strong> 可修改性</li></ul>
<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第三章课上测试</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>C. 可移植性</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第三章课上测试 课上测试（计入总分） FILL ISO9126将各种质属性归纳为6个质量特征，其中包括 （填空1） 、 （填空2） 、 （填空3） 、 （填空4） 、 （填空5） 、 （填空6） 。 填空1: 功能性；填空2: 可靠性；填空3: 可使用性；填空4: 效率；填空5: 可维护性；填空6: 可移植性 ">
<div class="sqe-question">
<p class="sqe-question-title">题 7-04（填空）</p>
<p>ISO9126将各种质属性归纳为6个质量特征，其中包括 （填空1） 、 （填空2） 、 （填空3） 、 （填空4） 、 （填空5） 、 （填空6） 。</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第三章课上测试</span><span>填空</span><span>6 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 功能性；填空2: 可靠性；填空3: 可使用性；填空4: 效率；填空5: 可维护性；填空6: 可移植性</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第三章课上测试 课上测试（计入总分） SINGLE 软件可移植性是用来衡量软件______的重要尺度之一。 C. 质量 通用性 效率 质量 人机界面">
<div class="sqe-question">
<p class="sqe-question-title">题 7-05（单选）</p>
<p>软件可移植性是用来衡量软件______的重要尺度之一。</p>
<ul class="sqe-options"><li><strong>A.</strong> 通用性</li><li><strong>B.</strong> 效率</li><li><strong>C.</strong> 质量</li><li><strong>D.</strong> 人机界面</li></ul>
<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第三章课上测试</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>C. 质量</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第三章课上测试 课上测试（计入总分） FILL 六西格玛模型分为 （填空1） 、 （填空2） 、 （填空3） 、 （填空4） 、 （填空5） 等5个阶段。 填空1: 界定；填空2: 测量；填空3: 分析；填空4: 改进；填空5: 控制 ">
<div class="sqe-question">
<p class="sqe-question-title">题 7-06（填空）</p>
<p>六西格玛模型分为 （填空1） 、 （填空2） 、 （填空3） 、 （填空4） 、 （填空5） 等5个阶段。</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第三章课上测试</span><span>填空</span><span>5 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 界定；填空2: 测量；填空3: 分析；填空4: 改进；填空5: 控制</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第三章课上测试 课上测试（计入总分） FILL IDEAL模型将质量改进过程划分为 （填空1） 、 （填空2） 、 （填空3） 、 （填空4） 和 （填空5） 等5个阶段。 填空1: 初始化；填空2: 诊断；填空3: 建立；填空4: 行动；填空5: 学习 ">
<div class="sqe-question">
<p class="sqe-question-title">题 7-07（填空）</p>
<p>IDEAL模型将质量改进过程划分为 （填空1） 、 （填空2） 、 （填空3） 、 （填空4） 和 （填空5） 等5个阶段。</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第三章课上测试</span><span>填空</span><span>5 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 初始化；填空2: 诊断；填空3: 建立；填空4: 行动；填空5: 学习</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第三章课上测试 课上测试（计入总分） FILL 采用定量软件工程，制定软件产品质量的度量准则，可以提高软件开发过程 （填空1） ，降低 （填空2） ，提高软件产品的 （填空3） 。 填空1: 管理的可视性；填空2: 劣质成本；填空3: 质量 ">
<div class="sqe-question">
<p class="sqe-question-title">题 7-08（填空）</p>
<p>采用定量软件工程，制定软件产品质量的度量准则，可以提高软件开发过程 （填空1） ，降低 （填空2） ，提高软件产品的 （填空3） 。</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第三章课上测试</span><span>填空</span><span>3 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 管理的可视性；填空2: 劣质成本；填空3: 质量</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第三章课上测试 课上测试（计入总分） FILL McCall模型产品修订纬度的质量因素有 （填空1） 性、 （填空2） 性、 （填空3） 性。 填空1: 可维护；填空2: 灵活；填空3: 可测试 ">
<div class="sqe-question">
<p class="sqe-question-title">题 7-09（填空）</p>
<p>McCall模型产品修订纬度的质量因素有 （填空1） 性、 （填空2） 性、 （填空3） 性。</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第三章课上测试</span><span>填空</span><span>3 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 可维护；填空2: 灵活；填空3: 可测试</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第三章课上测试 课上测试（计入总分） FILL 软件质量工程包括软件质量 （填空1） 、软件质量 （填空2） 、软件质量 （填空3） 和软件质量 （填空4） 四大方面。 填空1: 方针；填空2: 控制；填空3: 保证；填空4: 管理 ">
<div class="sqe-question">
<p class="sqe-question-title">题 7-10（填空）</p>
<p>软件质量工程包括软件质量 （填空1） 、软件质量 （填空2） 、软件质量 （填空3） 和软件质量 （填空4） 四大方面。</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第三章课上测试</span><span>填空</span><span>4 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 方针；填空2: 控制；填空3: 保证；填空4: 管理</p></div></details></div>
</article>
</section>

<section id="quiz-8" class="sqe-chapter">
<div class="sqe-chapter-head">
<span class="sqe-number">08</span>
<div><small>课后练习（计入总分） · 云班课 QUIZ</small><h3>第八章课后练习</h3><div><span class="sqe-source-pill">题目接口直接导出</span><span class="sqe-source-pill">25 道题</span></div></div>
</div>

<article class="sqe-card" data-sqe-card data-sqe-text="第八章课后练习 课后练习（计入总分） TF 需求分析是将用户需求准确转化为软件系统的唯一途径。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 8-01（判断）</p>
<p>需求分析是将用户需求准确转化为软件系统的唯一途径。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第八章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第八章课后练习 课后练习（计入总分） SINGLE 将软件需求转化为数据结构和软件的系统结构，并定义子系统和它们之间的通信或接口是哪个阶段的任务 D. 概要设计 详细设计 编码 测试 概要设计">
<div class="sqe-question">
<p class="sqe-question-title">题 8-02（单选）</p>
<p>将软件需求转化为数据结构和软件的系统结构，并定义子系统和它们之间的通信或接口是哪个阶段的任务</p>
<ul class="sqe-options"><li><strong>A.</strong> 详细设计</li><li><strong>B.</strong> 编码</li><li><strong>C.</strong> 测试</li><li><strong>D.</strong> 概要设计</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第八章课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>D. 概要设计</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第八章课后练习 课后练习（计入总分） MULTI 软件体系结构设计的基本任务 A. 数据结构及数据库设计；B. 编写概要设计文档；C. 概要设计文档评审；D. 设计软件系统结构 数据结构及数据库设计 编写概要设计文档 概要设计文档评审 设计软件系统结构">
<div class="sqe-question">
<p class="sqe-question-title">题 8-03（多选）</p>
<p>软件体系结构设计的基本任务</p>
<ul class="sqe-options"><li><strong>A.</strong> 数据结构及数据库设计</li><li><strong>B.</strong> 编写概要设计文档</li><li><strong>C.</strong> 概要设计文档评审</li><li><strong>D.</strong> 设计软件系统结构</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第八章课后练习</span><span>多选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 数据结构及数据库设计；B. 编写概要设计文档；C. 概要设计文档评审；D. 设计软件系统结构</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第八章课后练习 课后练习（计入总分） TF 软件设计的基本原则是设计越简单越好  ">
<div class="sqe-question">
<p class="sqe-question-title">题 8-04（判断）</p>
<p>软件设计的基本原则是设计越简单越好</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第八章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第八章课后练习 课后练习（计入总分） TF 软件设计的指导思想是降低模块内聚性，提高模块耦合度。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 8-05（判断）</p>
<p>软件设计的指导思想是降低模块内聚性，提高模块耦合度。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第八章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第八章课后练习 课后练习（计入总分） SINGLE 下列耦合度从低到高排列正确的是 C. 数据耦合、控制耦合、公共环境耦合、内容耦合 特征耦合、数据耦合、外部耦合、公共环境耦合 非直接耦合、特征耦合、公共环境耦合、外部耦合 数据耦合、控制耦合、公共环境耦合、内容耦合 控制耦合、外部耦合、公共环境耦合、特征耦合">
<div class="sqe-question">
<p class="sqe-question-title">题 8-06（单选）</p>
<p>下列耦合度从低到高排列正确的是</p>
<ul class="sqe-options"><li><strong>A.</strong> 特征耦合、数据耦合、外部耦合、公共环境耦合</li><li><strong>B.</strong> 非直接耦合、特征耦合、公共环境耦合、外部耦合</li><li><strong>C.</strong> 数据耦合、控制耦合、公共环境耦合、内容耦合</li><li><strong>D.</strong> 控制耦合、外部耦合、公共环境耦合、特征耦合</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第八章课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>C. 数据耦合、控制耦合、公共环境耦合、内容耦合</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第八章课后练习 课后练习（计入总分） TF 任何体系结构都有它自身的优点和缺点，所以我们要有针对性的选择使用。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 8-07（判断）</p>
<p>任何体系结构都有它自身的优点和缺点，所以我们要有针对性的选择使用。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第八章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第八章课后练习 课后练习（计入总分） TF 软件设计的时候技术远比用户需求重要的多。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 8-08（判断）</p>
<p>软件设计的时候技术远比用户需求重要的多。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第八章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第八章课后练习 课后练习（计入总分） TF 常作验证，早作验证是软件设计的原则之一  ">
<div class="sqe-question">
<p class="sqe-question-title">题 8-09（判断）</p>
<p>常作验证，早作验证是软件设计的原则之一</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第八章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第八章课后练习 课后练习（计入总分） SINGLE 开－闭原则的闭指的是 B. 对于原有代码的修改是封闭的，即不应该修改原有的代码。 一个类只有一个引起它变化的原因 对于原有代码的修改是封闭的，即不应该修改原有的代码。 如果多于一个动机去改变一个类，就应该在穿件一些类来完成每一个职责 传递参数，或者在组合聚合关系中，尽量引用层次高的类。">
<div class="sqe-question">
<p class="sqe-question-title">题 8-10（单选）</p>
<p>开－闭原则的闭指的是</p>
<ul class="sqe-options"><li><strong>A.</strong> 一个类只有一个引起它变化的原因</li><li><strong>B.</strong> 对于原有代码的修改是封闭的，即不应该修改原有的代码。</li><li><strong>C.</strong> 如果多于一个动机去改变一个类，就应该在穿件一些类来完成每一个职责</li><li><strong>D.</strong> 传递参数，或者在组合聚合关系中，尽量引用层次高的类。</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第八章课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>B. 对于原有代码的修改是封闭的，即不应该修改原有的代码。</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第八章课后练习 课后练习（计入总分） MULTI 软件设计的技术原则包括 A. 开－闭原则；B. 接口隔离原则；C. 迪米特法则；D. 单一职责原则 开－闭原则 接口隔离原则 迪米特法则 单一职责原则">
<div class="sqe-question">
<p class="sqe-question-title">题 8-11（多选）</p>
<p>软件设计的技术原则包括</p>
<ul class="sqe-options"><li><strong>A.</strong> 开－闭原则</li><li><strong>B.</strong> 接口隔离原则</li><li><strong>C.</strong> 迪米特法则</li><li><strong>D.</strong> 单一职责原则</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第八章课后练习</span><span>多选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 开－闭原则；B. 接口隔离原则；C. 迪米特法则；D. 单一职责原则</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第八章课后练习 课后练习（计入总分） TF 里氏代换原则中说，任何基类可以出现的地方，子类不一定可以出现。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 8-12（判断）</p>
<p>里氏代换原则中说，任何基类可以出现的地方，子类不一定可以出现。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第八章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第八章课后练习 课后练习（计入总分） SINGLE 在一个新的对象里面使用一些已有的对象，使之成为新对象的一部分。新的对象通过向这些对象的委派达到复用已有功能的目的。这是什么原则 C. 合成/聚合复用原则 迪米特法则 依赖倒转原则 合成/聚合复用原则 单一职责原则">
<div class="sqe-question">
<p class="sqe-question-title">题 8-13（单选）</p>
<p>在一个新的对象里面使用一些已有的对象，使之成为新对象的一部分。新的对象通过向这些对象的委派达到复用已有功能的目的。这是什么原则</p>
<ul class="sqe-options"><li><strong>A.</strong> 迪米特法则</li><li><strong>B.</strong> 依赖倒转原则</li><li><strong>C.</strong> 合成/聚合复用原则</li><li><strong>D.</strong> 单一职责原则</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第八章课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>C. 合成/聚合复用原则</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第八章课后练习 课后练习（计入总分） TF 框架模型主要以一些特殊的问题为目标建立只针对和适应该问题的结构。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 8-14（判断）</p>
<p>框架模型主要以一些特殊的问题为目标建立只针对和适应该问题的结构。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第八章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第八章课后练习 课后练习（计入总分） MULTI 体系结构的模型包括 A. 结构模型；B. 功能模型；C. 动态模型；D. 过程模型 结构模型 功能模型 动态模型 过程模型">
<div class="sqe-question">
<p class="sqe-question-title">题 8-15（多选）</p>
<p>体系结构的模型包括</p>
<ul class="sqe-options"><li><strong>A.</strong> 结构模型</li><li><strong>B.</strong> 功能模型</li><li><strong>C.</strong> 动态模型</li><li><strong>D.</strong> 过程模型</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第八章课后练习</span><span>多选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 结构模型；B. 功能模型；C. 动态模型；D. 过程模型</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第八章课后练习 课后练习（计入总分） TF C/S与B/S软件体系结构相比，除了用户界面的实现方式不同以外，其他没什么差别。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 8-16（判断）</p>
<p>C/S与B/S软件体系结构相比，除了用户界面的实现方式不同以外，其他没什么差别。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第八章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第八章课后练习 课后练习（计入总分） TF 中间件的多层分布式的体系结构将客户和资源分开，降低了服务器的负载  ">
<div class="sqe-question">
<p class="sqe-question-title">题 8-17（判断）</p>
<p>中间件的多层分布式的体系结构将客户和资源分开，降低了服务器的负载</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第八章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第八章课后练习 课后练习（计入总分） TF 设计模式使得人们可以更加简单和方便地去复用成功的软件设计和体系结构，从而帮助设计者更快更好地完成系统设计。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 8-18（判断）</p>
<p>设计模式使得人们可以更加简单和方便地去复用成功的软件设计和体系结构，从而帮助设计者更快更好地完成系统设计。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第八章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第八章课后练习 课后练习（计入总分） MULTI 一个设计模式的基本要素包括 A. 问题；B. 效果；C. 解决方案；D. 模式名称 问题 效果 解决方案 模式名称">
<div class="sqe-question">
<p class="sqe-question-title">题 8-19（多选）</p>
<p>一个设计模式的基本要素包括</p>
<ul class="sqe-options"><li><strong>A.</strong> 问题</li><li><strong>B.</strong> 效果</li><li><strong>C.</strong> 解决方案</li><li><strong>D.</strong> 模式名称</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第八章课后练习</span><span>多选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 问题；B. 效果；C. 解决方案；D. 模式名称</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第八章课后练习 课后练习（计入总分） MULTI 设计模式的作用包括 A. 有助于作出有利于系统复用的选择，避免设计损害系统复用性；B. 可以帮助设计者更快更好的完成系统设计；C. 可以更加简单方便的复用成功的设计和体系结构；D. 在工程小组成员之间提供了通用的语义 有助于作出有利于系统复用的选择，避免设计损害系统复用性 可以帮助设计者更快更好的完成系统设计 可以更加简单方便的复用成功的设计和体系结构 在工程小组成员之间提供了通用的语义">
<div class="sqe-question">
<p class="sqe-question-title">题 8-20（多选）</p>
<p>设计模式的作用包括</p>
<ul class="sqe-options"><li><strong>A.</strong> 有助于作出有利于系统复用的选择，避免设计损害系统复用性</li><li><strong>B.</strong> 可以帮助设计者更快更好的完成系统设计</li><li><strong>C.</strong> 可以更加简单方便的复用成功的设计和体系结构</li><li><strong>D.</strong> 在工程小组成员之间提供了通用的语义</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第八章课后练习</span><span>多选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 有助于作出有利于系统复用的选择，避免设计损害系统复用性；B. 可以帮助设计者更快更好的完成系统设计；C. 可以更加简单方便的复用成功的设计和体系结构；D. 在工程小组成员之间提供了通用的语义</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第八章课后练习 课后练习（计入总分） TF UML语言先建模再编写代码，从一开始就保证系统结构合理  ">
<div class="sqe-question">
<p class="sqe-question-title">题 8-21（判断）</p>
<p>UML语言先建模再编写代码，从一开始就保证系统结构合理</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第八章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第八章课后练习 课后练习（计入总分） MULTI 接口设计准则包括 A. 是否包含有硬件接口设计，硬件接口设计是否正确且全面；B. 是否包含有软件接口设计，软件接口设计是否正确且全面；C. 是否描述了各类接口的功能；D. 是否描述各接口与其他接口或模块之间的关系 是否包含有硬件接口设计，硬件接口设计是否正确且全面 是否包含有软件接口设计，软件接口设计是否正确且全面 是否描述了各类接口的功能 是否描述各接口与其他接口或模块之间的关系">
<div class="sqe-question">
<p class="sqe-question-title">题 8-22（多选）</p>
<p>接口设计准则包括</p>
<ul class="sqe-options"><li><strong>A.</strong> 是否包含有硬件接口设计，硬件接口设计是否正确且全面</li><li><strong>B.</strong> 是否包含有软件接口设计，软件接口设计是否正确且全面</li><li><strong>C.</strong> 是否描述了各类接口的功能</li><li><strong>D.</strong> 是否描述各接口与其他接口或模块之间的关系</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第八章课后练习</span><span>多选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 是否包含有硬件接口设计，硬件接口设计是否正确且全面；B. 是否包含有软件接口设计，软件接口设计是否正确且全面；C. 是否描述了各类接口的功能；D. 是否描述各接口与其他接口或模块之间的关系</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第八章课后练习 课后练习（计入总分） MULTI 详细设计的目标任务包括 A. 确定每一模块使用的数据结构；B. 确定模块接口的细节；C. 为每一个模块设计出一组测试用例 确定每一模块使用的数据结构 确定模块接口的细节 为每一个模块设计出一组测试用例 确定模块内的数据流和控制流的定义是否正确">
<div class="sqe-question">
<p class="sqe-question-title">题 8-23（多选）</p>
<p>详细设计的目标任务包括</p>
<ul class="sqe-options"><li><strong>A.</strong> 确定每一模块使用的数据结构</li><li><strong>B.</strong> 确定模块接口的细节</li><li><strong>C.</strong> 为每一个模块设计出一组测试用例</li><li><strong>D.</strong> 确定模块内的数据流和控制流的定义是否正确</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第八章课后练习</span><span>多选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 确定每一模块使用的数据结构；B. 确定模块接口的细节；C. 为每一个模块设计出一组测试用例</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第八章课后练习 课后练习（计入总分） MULTI 用户界面设计原则包括 A. 必须保持一致性；B. 应有自助功能；C. 界面易懂 必须保持一致性 应有自助功能 界面易懂 结构化">
<div class="sqe-question">
<p class="sqe-question-title">题 8-24（多选）</p>
<p>用户界面设计原则包括</p>
<ul class="sqe-options"><li><strong>A.</strong> 必须保持一致性</li><li><strong>B.</strong> 应有自助功能</li><li><strong>C.</strong> 界面易懂</li><li><strong>D.</strong> 结构化</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第八章课后练习</span><span>多选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 必须保持一致性；B. 应有自助功能；C. 界面易懂</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第八章课后练习 课后练习（计入总分） TF 数据字典是指对数据的数据项、数据结构、数据流、数据存储、处理逻辑、外部实体等进行定义和描述，其目的是对数据流程图中的各个元素做出详细的说明。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 8-25（判断）</p>
<p>数据字典是指对数据的数据项、数据结构、数据流、数据存储、处理逻辑、外部实体等进行定义和描述，其目的是对数据流程图中的各个元素做出详细的说明。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第八章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>
</section>

<section id="quiz-9" class="sqe-chapter">
<div class="sqe-chapter-head">
<span class="sqe-number">09</span>
<div><small>课后练习（计入总分） · 云班课 QUIZ</small><h3>第二章课后练习</h3><div><span class="sqe-source-pill">题目接口直接导出</span><span class="sqe-source-pill">20 道题</span></div></div>
</div>

<article class="sqe-card" data-sqe-card data-sqe-text="第二章课后练习 课后练习（计入总分） SINGLE 据权威部门统计，软件错误产生的原因分布图表中，如下____________选项是导致软件错误的主要原因。 A. 软件需求规格说明错误 软件需求规格说明错误 设计错误 编码错误 测试错误">
<div class="sqe-question">
<p class="sqe-question-title">题 9-01（单选）</p>
<p>据权威部门统计，软件错误产生的原因分布图表中，如下____________选项是导致软件错误的主要原因。</p>
<ul class="sqe-options"><li><strong>A.</strong> 软件需求规格说明错误</li><li><strong>B.</strong> 设计错误</li><li><strong>C.</strong> 编码错误</li><li><strong>D.</strong> 测试错误</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第二章课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 软件需求规格说明错误</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第二章课后练习 课后练习（计入总分） SINGLE V 模型是具有代表意义的测试模型，以下理解正确的是______。 C. V 模型造成需求分析阶段隐藏的问题一直到后期的验收测试才被发现 V模型认为测试阶段是与开发阶段并行的 V 模型是软件开发螺旋模型的变种，它反映了测试活动与分析和设计的关系 V 模型造成需求分析阶段隐藏的问题一直到后期的验收测试才被发现 V 模型是对W 模型的改进">
<div class="sqe-question">
<p class="sqe-question-title">题 9-02（单选）</p>
<p>V 模型是具有代表意义的测试模型，以下理解正确的是______。</p>
<ul class="sqe-options"><li><strong>A.</strong> V模型认为测试阶段是与开发阶段并行的</li><li><strong>B.</strong> V 模型是软件开发螺旋模型的变种，它反映了测试活动与分析和设计的关系</li><li><strong>C.</strong> V 模型造成需求分析阶段隐藏的问题一直到后期的验收测试才被发现</li><li><strong>D.</strong> V 模型是对W 模型的改进</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第二章课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>C. V 模型造成需求分析阶段隐藏的问题一直到后期的验收测试才被发现</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第二章课后练习 课后练习（计入总分） SINGLE 以下关于软件质量的说法中，错误的是______ C. 程序的正确性足以体现软件的价值 软件产品必须提供用户所需要的功能，并能正常工作 软件质量是产品、组织和体系或过程的一组固有特性，反映它们满足顾客和其他相关方面要求的程度 程序的正确性足以体现软件的价值 越是关注客户的满意度，软件就越有可能达到质量要求">
<div class="sqe-question">
<p class="sqe-question-title">题 9-03（单选）</p>
<p>以下关于软件质量的说法中，错误的是______</p>
<ul class="sqe-options"><li><strong>A.</strong> 软件产品必须提供用户所需要的功能，并能正常工作</li><li><strong>B.</strong> 软件质量是产品、组织和体系或过程的一组固有特性，反映它们满足顾客和其他相关方面要求的程度</li><li><strong>C.</strong> 程序的正确性足以体现软件的价值</li><li><strong>D.</strong> 越是关注客户的满意度，软件就越有可能达到质量要求</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第二章课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>C. 程序的正确性足以体现软件的价值</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第二章课后练习 课后练习（计入总分） FILL SEI的Watts Humphrey认为软件质量是在 （填空1） 、 （填空2） 、 （填空3） 和 （填空4） 等方面，达到优秀的水准。 填空1: 实用性；填空2: 需求；填空3: 可靠性；填空4: 可维护性 ">
<div class="sqe-question">
<p class="sqe-question-title">题 9-04（填空）</p>
<p>SEI的Watts Humphrey认为软件质量是在 （填空1） 、 （填空2） 、 （填空3） 和 （填空4） 等方面，达到优秀的水准。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第二章课后练习</span><span>填空</span><span>4 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 实用性；填空2: 需求；填空3: 可靠性；填空4: 可维护性</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第二章课后练习 课后练习（计入总分） SINGLE 下列____________是关于软件缺陷的描述。 B. 产品的异常情况 导致软件包含故障的人的行为 产品的异常情况 引起一个功能部件不能完成所要求的功能的一种意外情况 功能部件执行其规定功能的能力丧失">
<div class="sqe-question">
<p class="sqe-question-title">题 9-05（单选）</p>
<p>下列____________是关于软件缺陷的描述。</p>
<ul class="sqe-options"><li><strong>A.</strong> 导致软件包含故障的人的行为</li><li><strong>B.</strong> 产品的异常情况</li><li><strong>C.</strong> 引起一个功能部件不能完成所要求的功能的一种意外情况</li><li><strong>D.</strong> 功能部件执行其规定功能的能力丧失</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第二章课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>B. 产品的异常情况</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第二章课后练习 课后练习（计入总分） SINGLE 不属于软件产品的质量的特殊性是：____________ D. 软件的类型不同，但是软件质量的衡量标准的侧重点相同 很难制定具体的、数量化的产品质量标准，所以没有相应的国际标推、国家标准或行业标淮。 软件产品之间很难进行横向的质量对比，很难说这个产品比那个产品好多少。 满足了用户需求的软件质量，就是好的软件质量 软件的类型不同，但是软件质量的衡量标准的侧重点相同">
<div class="sqe-question">
<p class="sqe-question-title">题 9-06（单选）</p>
<p>不属于软件产品的质量的特殊性是：____________</p>
<ul class="sqe-options"><li><strong>A.</strong> 很难制定具体的、数量化的产品质量标准，所以没有相应的国际标推、国家标准或行业标淮。</li><li><strong>B.</strong> 软件产品之间很难进行横向的质量对比，很难说这个产品比那个产品好多少。</li><li><strong>C.</strong> 满足了用户需求的软件质量，就是好的软件质量</li><li><strong>D.</strong> 软件的类型不同，但是软件质量的衡量标准的侧重点相同</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第二章课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>D. 软件的类型不同，但是软件质量的衡量标准的侧重点相同</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第二章课后练习 课后练习（计入总分） SINGLE 下列关于软件设计的说法不正确的是：_______ D. 软件设计越复杂越好 软件设计可以分为概要设计和详细设计两个阶段 详细设计的首要任务就是设计模块的程序流程、算法和数据结构 软件概要设计是指对整个软件系统进行结构设计，确定软件系统的结构 软件设计越复杂越好">
<div class="sqe-question">
<p class="sqe-question-title">题 9-07（单选）</p>
<p>下列关于软件设计的说法不正确的是：_______</p>
<ul class="sqe-options"><li><strong>A.</strong> 软件设计可以分为概要设计和详细设计两个阶段</li><li><strong>B.</strong> 详细设计的首要任务就是设计模块的程序流程、算法和数据结构</li><li><strong>C.</strong> 软件概要设计是指对整个软件系统进行结构设计，确定软件系统的结构</li><li><strong>D.</strong> 软件设计越复杂越好</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第二章课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>D. 软件设计越复杂越好</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第二章课后练习 课后练习（计入总分） SINGLE 以下哪一种选项不属于软件缺陷______。 D. 软件实现了产品规格说明所要求的功能但因受性能限制而未考虑可移植性问题 软件没有实现产品规格说明所要求的功能 软件中出现了产品规格说明不应该出现的功能 软件实现了产品规格说明没有提到的功能 软件实现了产品规格说明所要求的功能但因受性能限制而未考虑可移植性问题">
<div class="sqe-question">
<p class="sqe-question-title">题 9-08（单选）</p>
<p>以下哪一种选项不属于软件缺陷______。</p>
<ul class="sqe-options"><li><strong>A.</strong> 软件没有实现产品规格说明所要求的功能</li><li><strong>B.</strong> 软件中出现了产品规格说明不应该出现的功能</li><li><strong>C.</strong> 软件实现了产品规格说明没有提到的功能</li><li><strong>D.</strong> 软件实现了产品规格说明所要求的功能但因受性能限制而未考虑可移植性问题</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第二章课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>D. 软件实现了产品规格说明所要求的功能但因受性能限制而未考虑可移植性问题</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第二章课后练习 课后练习（计入总分） SINGLE 下面有关软件缺陷的说法中错误的是______。 C. 缺陷就是导致系统程序崩溃的错误 缺陷就是软件产品在开发中存在的错误 缺陷就是软件维护过程中存在的错误、毛病等各种问题 缺陷就是导致系统程序崩溃的错误 缺陷就是系统所需要实现的某种功能的失效和违背">
<div class="sqe-question">
<p class="sqe-question-title">题 9-09（单选）</p>
<p>下面有关软件缺陷的说法中错误的是______。</p>
<ul class="sqe-options"><li><strong>A.</strong> 缺陷就是软件产品在开发中存在的错误</li><li><strong>B.</strong> 缺陷就是软件维护过程中存在的错误、毛病等各种问题</li><li><strong>C.</strong> 缺陷就是导致系统程序崩溃的错误</li><li><strong>D.</strong> 缺陷就是系统所需要实现的某种功能的失效和违背</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第二章课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>C. 缺陷就是导致系统程序崩溃的错误</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第二章课后练习 课后练习（计入总分） SINGLE 极限编程的主要特点有______。 D. 以上全部 简单的分析设计 频繁的客户交流 增量式开发和连续的测试 以上全部">
<div class="sqe-question">
<p class="sqe-question-title">题 9-10（单选）</p>
<p>极限编程的主要特点有______。</p>
<ul class="sqe-options"><li><strong>A.</strong> 简单的分析设计</li><li><strong>B.</strong> 频繁的客户交流</li><li><strong>C.</strong> 增量式开发和连续的测试</li><li><strong>D.</strong> 以上全部</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第二章课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>D. 以上全部</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第二章课后练习 课后练习（计入总分） SINGLE 以下关于软件可靠性与硬件的可靠性主要区别的说法中，正确的是______。 A. 软件的每个拷贝都是完全一样的，而按照设计生产出来的同规格硬件总有微小差别 软件的每个拷贝都是完全一样的，而按照设计生产出来的同规格硬件总有微小差别 软件经常面临恶意的使用者，而硬件没有恶意的使用者 软件的使用者通常遍及整个世界，而硬件使用者通常只局限于某个地区 软件的失效都是逻辑错误引起的，而硬件的失效都不是逻辑错误引起的">
<div class="sqe-question">
<p class="sqe-question-title">题 9-11（单选）</p>
<p>以下关于软件可靠性与硬件的可靠性主要区别的说法中，正确的是______。</p>
<ul class="sqe-options"><li><strong>A.</strong> 软件的每个拷贝都是完全一样的，而按照设计生产出来的同规格硬件总有微小差别</li><li><strong>B.</strong> 软件经常面临恶意的使用者，而硬件没有恶意的使用者</li><li><strong>C.</strong> 软件的使用者通常遍及整个世界，而硬件使用者通常只局限于某个地区</li><li><strong>D.</strong> 软件的失效都是逻辑错误引起的，而硬件的失效都不是逻辑错误引起的</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第二章课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 软件的每个拷贝都是完全一样的，而按照设计生产出来的同规格硬件总有微小差别</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第二章课后练习 课后练习（计入总分） MULTI 软件质量的含义是_____ A. 能满足给定需要的特性之全体；；B. 具有所希望的各种属性的组合的程度；；C. 顾客或用户认为能满足其综合期望的程度；；D. 软件的组合特性，它确定软件在使用中将满足顾客预期要求的程度。 能满足给定需要的特性之全体； 具有所希望的各种属性的组合的程度； 顾客或用户认为能满足其综合期望的程度； 软件的组合特性，它确定软件在使用中将满足顾客预期要求的程度。">
<div class="sqe-question">
<p class="sqe-question-title">题 9-12（多选）</p>
<p>软件质量的含义是_____</p>
<ul class="sqe-options"><li><strong>A.</strong> 能满足给定需要的特性之全体；</li><li><strong>B.</strong> 具有所希望的各种属性的组合的程度；</li><li><strong>C.</strong> 顾客或用户认为能满足其综合期望的程度；</li><li><strong>D.</strong> 软件的组合特性，它确定软件在使用中将满足顾客预期要求的程度。</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第二章课后练习</span><span>多选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 能满足给定需要的特性之全体；；B. 具有所希望的各种属性的组合的程度；；C. 顾客或用户认为能满足其综合期望的程度；；D. 软件的组合特性，它确定软件在使用中将满足顾客预期要求的程度。</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第二章课后练习 课后练习（计入总分） FILL 用户要求在性能方面包含哪些质量特性： （填空1） 、 （填空2） 、 （填空3） 、 （填空4） 填空1: 效率性；填空2: 正确性；填空3: 安全性；填空4: 互操作性 ">
<div class="sqe-question">
<p class="sqe-question-title">题 9-13（填空）</p>
<p>用户要求在性能方面包含哪些质量特性： （填空1） 、 （填空2） 、 （填空3） 、 （填空4）</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第二章课后练习</span><span>填空</span><span>4 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 效率性；填空2: 正确性；填空3: 安全性；填空4: 互操作性</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第二章课后练习 课后练习（计入总分） FILL 用户要求在功能方面包含哪些质量特性： （填空1） 、 （填空2） 、 （填空3） 、 （填空4） 、 （填空5） 填空1: 完整性；填空2: 可靠性；填空3: 生存性；填空4: 可用性；填空5: 便利性 ">
<div class="sqe-question">
<p class="sqe-question-title">题 9-14（填空）</p>
<p>用户要求在功能方面包含哪些质量特性： （填空1） 、 （填空2） 、 （填空3） 、 （填空4） 、 （填空5）</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第二章课后练习</span><span>填空</span><span>5 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 完整性；填空2: 可靠性；填空3: 生存性；填空4: 可用性；填空5: 便利性</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第二章课后练习 课后练习（计入总分） FILL 软件质量的3维特性指的是： （填空1） 、 （填空2） 、 （填空3） 。(中文名称) 填空1: 功能性；填空2: 可靠性；填空3: 性能 ">
<div class="sqe-question">
<p class="sqe-question-title">题 9-15（填空）</p>
<p>软件质量的3维特性指的是： （填空1） 、 （填空2） 、 （填空3） 。(中文名称)</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第二章课后练习</span><span>填空</span><span>3 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 功能性；填空2: 可靠性；填空3: 性能</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第二章课后练习 课后练习（计入总分） FILL 软件质量的3A特性指的是： （填空1） 、 （填空2） 、 （填空3） 。(中文名称) 填空1: 可说明性；填空2: 有效性；填空3: 易用性 ">
<div class="sqe-question">
<p class="sqe-question-title">题 9-16（填空）</p>
<p>软件质量的3A特性指的是： （填空1） 、 （填空2） 、 （填空3） 。(中文名称)</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第二章课后练习</span><span>填空</span><span>3 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 可说明性；填空2: 有效性；填空3: 易用性</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第二章课后练习 课后练习（计入总分） FILL 软件质量的定义包含三个方面：软件 （填空1） 的质量、软件 （填空2） 的质量、软件在其 （填空3） 所表现的质量 填空1: 产品；填空2: 开发过程；填空3: 商业环境中 ">
<div class="sqe-question">
<p class="sqe-question-title">题 9-17（填空）</p>
<p>软件质量的定义包含三个方面：软件 （填空1） 的质量、软件 （填空2） 的质量、软件在其 （填空3） 所表现的质量</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第二章课后练习</span><span>填空</span><span>3 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 产品；填空2: 开发过程；填空3: 商业环境中</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第二章课后练习 课后练习（计入总分） FILL ANSI/IEEE STD729给出了软件质量定义：软件产品满足规定的和隐含的与 （填空1） 有关的全部特征和特性。 填空1: 需求能力 ">
<div class="sqe-question">
<p class="sqe-question-title">题 9-18（填空）</p>
<p>ANSI/IEEE STD729给出了软件质量定义：软件产品满足规定的和隐含的与 （填空1） 有关的全部特征和特性。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第二章课后练习</span><span>填空</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 需求能力</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第二章课后练习 课后练习（计入总分） FILL 从外部看，软件缺陷是系统所需要实现的某种功能的 （填空1） 或 （填空2） 。 填空1: 失效；填空2: 违背 ">
<div class="sqe-question">
<p class="sqe-question-title">题 9-19（填空）</p>
<p>从外部看，软件缺陷是系统所需要实现的某种功能的 （填空1） 或 （填空2） 。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第二章课后练习</span><span>填空</span><span>2 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 失效；填空2: 违背</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第二章课后练习 课后练习（计入总分） FILL 极限编程适合 （填空1） 、 （填空2） 、 （填空3） 、 （填空4） 填空1: 小团队；填空2: 高风险；填空3: 快速变化或不稳定的需求；填空4: 强调可测试性 ">
<div class="sqe-question">
<p class="sqe-question-title">题 9-20（填空）</p>
<p>极限编程适合 （填空1） 、 （填空2） 、 （填空3） 、 （填空4）</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第二章课后练习</span><span>填空</span><span>4 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 小团队；填空2: 高风险；填空3: 快速变化或不稳定的需求；填空4: 强调可测试性</p></div></details></div>
</article>
</section>

<section id="quiz-10" class="sqe-chapter">
<div class="sqe-chapter-head">
<span class="sqe-number">10</span>
<div><small>课上测试（计入总分） · 云班课 QUIZ</small><h3>第二章课上测试</h3><div><span class="sqe-source-pill">题目接口直接导出</span><span class="sqe-source-pill">10 道题</span></div></div>
</div>

<article class="sqe-card" data-sqe-card data-sqe-text="第二章课上测试 课上测试（计入总分） SINGLE 据权威部门统计，软件错误产生的原因分布图表中，如下____________选项是导致软件错误的主要原因。 A. 软件需求规格说明错误 软件需求规格说明错误 设计错误 编码错误 测试错误">
<div class="sqe-question">
<p class="sqe-question-title">题 10-01（单选）</p>
<p>据权威部门统计，软件错误产生的原因分布图表中，如下____________选项是导致软件错误的主要原因。</p>
<ul class="sqe-options"><li><strong>A.</strong> 软件需求规格说明错误</li><li><strong>B.</strong> 设计错误</li><li><strong>C.</strong> 编码错误</li><li><strong>D.</strong> 测试错误</li></ul>
<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第二章课上测试</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 软件需求规格说明错误</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第二章课上测试 课上测试（计入总分） SINGLE V 模型是具有代表意义的测试模型，以下理解正确的是______。 C. V 模型造成需求分析阶段隐藏的问题一直到后期的验收测试才被发现 V模型认为测试阶段是与开发阶段并行的 V 模型是软件开发螺旋模型的变种，它反映了测试活动与分析和设计的关系 V 模型造成需求分析阶段隐藏的问题一直到后期的验收测试才被发现 V 模型是对W 模型的改进">
<div class="sqe-question">
<p class="sqe-question-title">题 10-02（单选）</p>
<p>V 模型是具有代表意义的测试模型，以下理解正确的是______。</p>
<ul class="sqe-options"><li><strong>A.</strong> V模型认为测试阶段是与开发阶段并行的</li><li><strong>B.</strong> V 模型是软件开发螺旋模型的变种，它反映了测试活动与分析和设计的关系</li><li><strong>C.</strong> V 模型造成需求分析阶段隐藏的问题一直到后期的验收测试才被发现</li><li><strong>D.</strong> V 模型是对W 模型的改进</li></ul>
<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第二章课上测试</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>C. V 模型造成需求分析阶段隐藏的问题一直到后期的验收测试才被发现</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第二章课上测试 课上测试（计入总分） SINGLE 下列关于软件设计的说法不正确的是：_______ D. 软件设计越复杂越好 软件设计可以分为概要设计和详细设计两个阶段 详细设计的首要任务就是设计模块的程序流程、算法和数据结构 软件概要设计是指对整个软件系统进行结构设计，确定软件系统的结构 软件设计越复杂越好">
<div class="sqe-question">
<p class="sqe-question-title">题 10-03（单选）</p>
<p>下列关于软件设计的说法不正确的是：_______</p>
<ul class="sqe-options"><li><strong>A.</strong> 软件设计可以分为概要设计和详细设计两个阶段</li><li><strong>B.</strong> 详细设计的首要任务就是设计模块的程序流程、算法和数据结构</li><li><strong>C.</strong> 软件概要设计是指对整个软件系统进行结构设计，确定软件系统的结构</li><li><strong>D.</strong> 软件设计越复杂越好</li></ul>
<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第二章课上测试</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>D. 软件设计越复杂越好</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第二章课上测试 课上测试（计入总分） SINGLE 极限编程的主要特点有______。 D. 以上全部 简单的分析设计 频繁的客户交流 增量式开发和连续的测试 以上全部">
<div class="sqe-question">
<p class="sqe-question-title">题 10-04（单选）</p>
<p>极限编程的主要特点有______。</p>
<ul class="sqe-options"><li><strong>A.</strong> 简单的分析设计</li><li><strong>B.</strong> 频繁的客户交流</li><li><strong>C.</strong> 增量式开发和连续的测试</li><li><strong>D.</strong> 以上全部</li></ul>
<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第二章课上测试</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>D. 以上全部</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第二章课上测试 课上测试（计入总分） MULTI 软件质量的含义是_____ A. 能满足给定需要的特性之全体；；B. 具有所希望的各种属性的组合的程度；；C. 顾客或用户认为能满足其综合期望的程度；；D. 软件的组合特性，它确定软件在使用中将满足顾客预期要求的程度。 能满足给定需要的特性之全体； 具有所希望的各种属性的组合的程度； 顾客或用户认为能满足其综合期望的程度； 软件的组合特性，它确定软件在使用中将满足顾客预期要求的程度。">
<div class="sqe-question">
<p class="sqe-question-title">题 10-05（多选）</p>
<p>软件质量的含义是_____</p>
<ul class="sqe-options"><li><strong>A.</strong> 能满足给定需要的特性之全体；</li><li><strong>B.</strong> 具有所希望的各种属性的组合的程度；</li><li><strong>C.</strong> 顾客或用户认为能满足其综合期望的程度；</li><li><strong>D.</strong> 软件的组合特性，它确定软件在使用中将满足顾客预期要求的程度。</li></ul>
<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第二章课上测试</span><span>多选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 能满足给定需要的特性之全体；；B. 具有所希望的各种属性的组合的程度；；C. 顾客或用户认为能满足其综合期望的程度；；D. 软件的组合特性，它确定软件在使用中将满足顾客预期要求的程度。</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第二章课上测试 课上测试（计入总分） FILL 用户要求在性能方面包含哪些质量特性： （填空1） 、 （填空2） 、 （填空3） 、 （填空4） 填空1: 效率性；填空2: 正确性；填空3: 安全性；填空4: 互操作性 ">
<div class="sqe-question">
<p class="sqe-question-title">题 10-06（填空）</p>
<p>用户要求在性能方面包含哪些质量特性： （填空1） 、 （填空2） 、 （填空3） 、 （填空4）</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第二章课上测试</span><span>填空</span><span>4 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 效率性；填空2: 正确性；填空3: 安全性；填空4: 互操作性</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第二章课上测试 课上测试（计入总分） FILL 软件质量的定义包含三个方面：软件 （填空1） 的质量、软件 （填空2） 的质量、软件在其 （填空3） 所表现的质量 填空1: 产品；填空2: 开发过程；填空3: 商业环境中 ">
<div class="sqe-question">
<p class="sqe-question-title">题 10-07（填空）</p>
<p>软件质量的定义包含三个方面：软件 （填空1） 的质量、软件 （填空2） 的质量、软件在其 （填空3） 所表现的质量</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第二章课上测试</span><span>填空</span><span>3 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 产品；填空2: 开发过程；填空3: 商业环境中</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第二章课上测试 课上测试（计入总分） FILL 从外部看，软件缺陷是系统所需要实现的某种功能的 （填空1） 或 （填空2） 。 填空1: 失效；填空2: 违背 ">
<div class="sqe-question">
<p class="sqe-question-title">题 10-08（填空）</p>
<p>从外部看，软件缺陷是系统所需要实现的某种功能的 （填空1） 或 （填空2） 。</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第二章课上测试</span><span>填空</span><span>2 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 失效；填空2: 违背</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第二章课上测试 课上测试（计入总分） SINGLE 以下哪一种选项不属于软件缺陷______。 D. 软件实现了产品规格说明所要求的功能但因受性能限制而未考虑可移植性问题 软件没有实现产品规格说明所要求的功能 软件中出现了产品规格说明不应该出现的功能 软件实现了产品规格说明没有提到的功能 软件实现了产品规格说明所要求的功能但因受性能限制而未考虑可移植性问题">
<div class="sqe-question">
<p class="sqe-question-title">题 10-09（单选）</p>
<p>以下哪一种选项不属于软件缺陷______。</p>
<ul class="sqe-options"><li><strong>A.</strong> 软件没有实现产品规格说明所要求的功能</li><li><strong>B.</strong> 软件中出现了产品规格说明不应该出现的功能</li><li><strong>C.</strong> 软件实现了产品规格说明没有提到的功能</li><li><strong>D.</strong> 软件实现了产品规格说明所要求的功能但因受性能限制而未考虑可移植性问题</li></ul>
<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第二章课上测试</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>D. 软件实现了产品规格说明所要求的功能但因受性能限制而未考虑可移植性问题</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第二章课上测试 课上测试（计入总分） SINGLE 以下关于软件质量的说法中，错误的是______ C. 程序的正确性足以体现软件的价值 软件产品必须提供用户所需要的功能，并能正常工作 软件质量是产品、组织和体系或过程的一组固有特性，反映它们满足顾客和其他相关方面要求的程度 程序的正确性足以体现软件的价值 越是关注客户的满意度，软件就越有可能达到质量要求">
<div class="sqe-question">
<p class="sqe-question-title">题 10-10（单选）</p>
<p>以下关于软件质量的说法中，错误的是______</p>
<ul class="sqe-options"><li><strong>A.</strong> 软件产品必须提供用户所需要的功能，并能正常工作</li><li><strong>B.</strong> 软件质量是产品、组织和体系或过程的一组固有特性，反映它们满足顾客和其他相关方面要求的程度</li><li><strong>C.</strong> 程序的正确性足以体现软件的价值</li><li><strong>D.</strong> 越是关注客户的满意度，软件就越有可能达到质量要求</li></ul>
<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第二章课上测试</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>C. 程序的正确性足以体现软件的价值</p></div></details></div>
</article>
</section>

<section id="quiz-11" class="sqe-chapter">
<div class="sqe-chapter-head">
<span class="sqe-number">11</span>
<div><small>课上测试（计入总分） · 云班课 QUIZ</small><h3>第六章课上测试</h3><div><span class="sqe-source-pill">题目接口直接导出</span><span class="sqe-source-pill">10 道题</span></div></div>
</div>

<article class="sqe-card" data-sqe-card data-sqe-text="第六章课上测试 课上测试（计入总分） TF 发现缺陷的平均成本不应该超过该缺陷遗留给客户的商业成本。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 11-01（判断）</p>
<p>发现缺陷的平均成本不应该超过该缺陷遗留给客户的商业成本。</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第六章课上测试</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第六章课上测试 课上测试（计入总分） TF 评审报告可以看作是评审会结束的标志。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 11-02（判断）</p>
<p>评审报告可以看作是评审会结束的标志。</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第六章课上测试</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第六章课上测试 课上测试（计入总分） MULTI 评审会议的主要步骤如下 A. 由评审员/作者进行演示或说明；B. 评审员会就不清楚或疑惑的地方与作者进行沟通；C. 协调人或记录员在会议过程中完成会议记录 由评审员/作者进行演示或说明 评审员会就不清楚或疑惑的地方与作者进行沟通 协调人或记录员在会议过程中完成会议记录 分析评审结果">
<div class="sqe-question">
<p class="sqe-question-title">题 11-03（多选）</p>
<p>评审会议的主要步骤如下</p>
<ul class="sqe-options"><li><strong>A.</strong> 由评审员/作者进行演示或说明</li><li><strong>B.</strong> 评审员会就不清楚或疑惑的地方与作者进行沟通</li><li><strong>C.</strong> 协调人或记录员在会议过程中完成会议记录</li><li><strong>D.</strong> 分析评审结果</li></ul>
<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第六章课上测试</span><span>多选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 由评审员/作者进行演示或说明；B. 评审员会就不清楚或疑惑的地方与作者进行沟通；C. 协调人或记录员在会议过程中完成会议记录</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第六章课上测试 课上测试（计入总分） TF 规则集列出了容易出现的典型错误，是评审的一个重要组成部分。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 11-04（判断）</p>
<p>规则集列出了容易出现的典型错误，是评审的一个重要组成部分。</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第六章课上测试</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第六章课上测试 课上测试（计入总分） MULTI 过程评审作用如下： A. 评估主要的质量保证流程；B. 考虑如何处理和解决评审过程中发现的不符合问题；C. 总结和共享好的经验；D. 指出需要进一步完善和改进的部分 评估主要的质量保证流程 考虑如何处理和解决评审过程中发现的不符合问题 总结和共享好的经验 指出需要进一步完善和改进的部分">
<div class="sqe-question">
<p class="sqe-question-title">题 11-05（多选）</p>
<p>过程评审作用如下：</p>
<ul class="sqe-options"><li><strong>A.</strong> 评估主要的质量保证流程</li><li><strong>B.</strong> 考虑如何处理和解决评审过程中发现的不符合问题</li><li><strong>C.</strong> 总结和共享好的经验</li><li><strong>D.</strong> 指出需要进一步完善和改进的部分</li></ul>
<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第六章课上测试</span><span>多选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 评估主要的质量保证流程；B. 考虑如何处理和解决评审过程中发现的不符合问题；C. 总结和共享好的经验；D. 指出需要进一步完善和改进的部分</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第六章课上测试 课上测试（计入总分） TF 文档评审分为格式评审和内容评审。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 11-06（判断）</p>
<p>文档评审分为格式评审和内容评审。</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第六章课上测试</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第六章课上测试 课上测试（计入总分） FILL 管理评审要求各部门对管理体系目前的状况，包括 （填空1） 性、 （填空2） 性、 （填空3） 性等进行评审。 填空1: 适宜；填空2: 有效；填空3: 充分 ">
<div class="sqe-question">
<p class="sqe-question-title">题 11-07（填空）</p>
<p>管理评审要求各部门对管理体系目前的状况，包括 （填空1） 性、 （填空2） 性、 （填空3） 性等进行评审。</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第六章课上测试</span><span>填空</span><span>3 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 适宜；填空2: 有效；填空3: 充分</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第六章课上测试 课上测试（计入总分） MULTI 评审小组一般由以下角色构成 A. 协调人；C. 作者；D. 评审员 协调人 SQA人员 作者 评审员">
<div class="sqe-question">
<p class="sqe-question-title">题 11-08（多选）</p>
<p>评审小组一般由以下角色构成</p>
<ul class="sqe-options"><li><strong>A.</strong> 协调人</li><li><strong>B.</strong> SQA人员</li><li><strong>C.</strong> 作者</li><li><strong>D.</strong> 评审员</li></ul>
<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第六章课上测试</span><span>多选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 协调人；C. 作者；D. 评审员</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第六章课上测试 课上测试（计入总分） MULTI 评审可以帮助开发工程师 A. 减少修订缺陷的时间；B. 提高编程效率；D. 减少测试和调试时间 减少修订缺陷的时间 提高编程效率 增强产品的可维护性 减少测试和调试时间">
<div class="sqe-question">
<p class="sqe-question-title">题 11-09（多选）</p>
<p>评审可以帮助开发工程师</p>
<ul class="sqe-options"><li><strong>A.</strong> 减少修订缺陷的时间</li><li><strong>B.</strong> 提高编程效率</li><li><strong>C.</strong> 增强产品的可维护性</li><li><strong>D.</strong> 减少测试和调试时间</li></ul>
<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第六章课上测试</span><span>多选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 减少修订缺陷的时间；B. 提高编程效率；D. 减少测试和调试时间</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第六章课上测试 课上测试（计入总分） SINGLE 在软件设计中，设计复审是和软件设计本身一样重要的环节，其主要的目的和作用是为了能够______。 B. 避免后期付出高代价 减少测试工作量 避免后期付出高代价 保证软件质量 缩短软件开发周期">
<div class="sqe-question">
<p class="sqe-question-title">题 11-10（单选）</p>
<p>在软件设计中，设计复审是和软件设计本身一样重要的环节，其主要的目的和作用是为了能够______。</p>
<ul class="sqe-options"><li><strong>A.</strong> 减少测试工作量</li><li><strong>B.</strong> 避免后期付出高代价</li><li><strong>C.</strong> 保证软件质量</li><li><strong>D.</strong> 缩短软件开发周期</li></ul>
<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第六章课上测试</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>B. 避免后期付出高代价</p></div></details></div>
</article>
</section>

<section id="quiz-12" class="sqe-chapter">
<div class="sqe-chapter-head">
<span class="sqe-number">12</span>
<div><small>课后练习（计入总分） · 云班课 QUIZ</small><h3>第四章课后练习</h3><div><span class="sqe-source-pill">题目接口直接导出</span><span class="sqe-source-pill">21 道题</span></div></div>
</div>

<article class="sqe-card" data-sqe-card data-sqe-text="第四章课后练习 课后练习（计入总分） TF 质量是反映软件与需求相符程度的指标，而缺陷被认为是软件与需求不一致的某种表现。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 12-01（判断）</p>
<p>质量是反映软件与需求相符程度的指标，而缺陷被认为是软件与需求不一致的某种表现。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第四章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第四章课后练习 课后练习（计入总分） TF McCabe度量、语法构造方法只适合独立模块内部进行测量，不能考虑系统各个模块间相互耦合的关系。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 12-02（判断）</p>
<p>McCabe度量、语法构造方法只适合独立模块内部进行测量，不能考虑系统各个模块间相互耦合的关系。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第四章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第四章课后练习 课后练习（计入总分） FILL 语法构造方法计算缺陷率的公式是： （填空1） + （填空2） DO WHILE+ （填空3） SELECT+ （填空4） IF-THEN-ELSE 填空1: 0.15；填空2: 0.23；填空3: 0.22；填空4: 0.07 ">
<div class="sqe-question">
<p class="sqe-question-title">题 12-03（填空）</p>
<p>语法构造方法计算缺陷率的公式是： （填空1） + （填空2） DO WHILE+ （填空3） SELECT+ （填空4） IF-THEN-ELSE</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第四章课后练习</span><span>填空</span><span>4 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 0.15；填空2: 0.23；填空3: 0.22；填空4: 0.07</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第四章课后练习 课后练习（计入总分） FILL 这段程序的环形计数复杂度（McCabe）是多少 （填空1） ？ 填空1: 4 ">
<div class="sqe-question">
<p class="sqe-question-title">题 12-04（填空）</p>
<p>这段程序的环形计数复杂度（McCabe）是多少 （填空1） ？</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第四章课后练习</span><span>填空</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 4</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第四章课后练习 课后练习（计入总分） FILL 软件项目度量的主要内容包括： （填空1） 度量、 （填空2） 度量、 （填空3） 度量、 （填空4） 度量、 （填空5） 度量、 （填空6） 度量以及其他一些度量项目。 填空1: 规模；填空2: 复杂度；填空3: 缺陷；填空4: 进度；填空5: 风险；填空6: 工作量 ">
<div class="sqe-question">
<p class="sqe-question-title">题 12-05（填空）</p>
<p>软件项目度量的主要内容包括： （填空1） 度量、 （填空2） 度量、 （填空3） 度量、 （填空4） 度量、 （填空5） 度量、 （填空6） 度量以及其他一些度量项目。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第四章课后练习</span><span>填空</span><span>6 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 规模；填空2: 复杂度；填空3: 缺陷；填空4: 进度；填空5: 风险；填空6: 工作量</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第四章课后练习 课后练习（计入总分） TF 软件度量应基于分析模型、设计模型或程序本身的结构进行，而独立于编程语言的句法和语法之外。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 12-06（判断）</p>
<p>软件度量应基于分析模型、设计模型或程序本身的结构进行，而独立于编程语言的句法和语法之外。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第四章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第四章课后练习 课后练习（计入总分） FILL 软件质量度量按其研究对像可分为3类： （填空1） 质量度量、 （填空2） 质量度量、 （填空3） 质量度量。 填空1: 项目；填空2: 产品；填空3: 过程 ">
<div class="sqe-question">
<p class="sqe-question-title">题 12-07（填空）</p>
<p>软件质量度量按其研究对像可分为3类： （填空1） 质量度量、 （填空2） 质量度量、 （填空3） 质量度量。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第四章课后练习</span><span>填空</span><span>3 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 项目；填空2: 产品；填空3: 过程</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第四章课后练习 课后练习（计入总分） TF 测量的目标是不断提高有效性和可靠性，测量可以避免出现偏差或误差。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 12-08（判断）</p>
<p>测量的目标是不断提高有效性和可靠性，测量可以避免出现偏差或误差。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第四章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第四章课后练习 课后练习（计入总分） TF 可靠性差一般意味着测量方法在技术上有待改进。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 12-09（判断）</p>
<p>可靠性差一般意味着测量方法在技术上有待改进。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第四章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第四章课后练习 课后练习（计入总分） TF 有效性差一般意味着测量方法在原则性上有错误。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 12-10（判断）</p>
<p>有效性差一般意味着测量方法在原则性上有错误。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第四章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第四章课后练习 课后练习（计入总分） FILL （填空1） 性和 （填空2） 性是测量标准中最重要的指标。 填空1: 有效；填空2: 可靠 ">
<div class="sqe-question">
<p class="sqe-question-title">题 12-11（填空）</p>
<p>（填空1） 性和 （填空2） 性是测量标准中最重要的指标。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第四章课后练习</span><span>填空</span><span>2 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 有效；填空2: 可靠</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第四章课后练习 课后练习（计入总分） FILL 课堂上提到的度量尺度包括 （填空1） 尺度、 （填空2）尺度 、 （填空3） 尺度、 （填空4） 尺度。 填空1: 分类；填空2: 序列；填空3: 间隔；填空4: 比值 ">
<div class="sqe-question">
<p class="sqe-question-title">题 12-12（填空）</p>
<p>课堂上提到的度量尺度包括 （填空1） 尺度、 （填空2）尺度 、 （填空3） 尺度、 （填空4） 尺度。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第四章课后练习</span><span>填空</span><span>4 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 分类；填空2: 序列；填空3: 间隔；填空4: 比值</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第四章课后练习 课后练习（计入总分） FILL 度量是对软件产品进行范围广泛的测度，它给出一个系统、构件或过程的某个给定属性的度的 （填空1） 。 填空1: 定量测量 ">
<div class="sqe-question">
<p class="sqe-question-title">题 12-13（填空）</p>
<p>度量是对软件产品进行范围广泛的测度，它给出一个系统、构件或过程的某个给定属性的度的 （填空1） 。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第四章课后练习</span><span>填空</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 定量测量</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第四章课后练习 课后练习（计入总分） FILL 测量是对产品过程的某个属性的范围、数量、维度、容量或大小提供一个 （填空1） 。 填空1: 定量的指示 ">
<div class="sqe-question">
<p class="sqe-question-title">题 12-14（填空）</p>
<p>测量是对产品过程的某个属性的范围、数量、维度、容量或大小提供一个 （填空1） 。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第四章课后练习</span><span>填空</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 定量的指示</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第四章课后练习 课后练习（计入总分） TF 度量是为了获取指标评估量化结果的重要手段和方法。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 12-15（判断）</p>
<p>度量是为了获取指标评估量化结果的重要手段和方法。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第四章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第四章课后练习 课后练习（计入总分） TF 软件度量具有相对性强，绝对性弱的特点。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 12-16（判断）</p>
<p>软件度量具有相对性强，绝对性弱的特点。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第四章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第四章课后练习 课后练习（计入总分） TF 软件质量度量就是用来衡量软件质量控制和保证的过程和结果的。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 12-17（判断）</p>
<p>软件质量度量就是用来衡量软件质量控制和保证的过程和结果的。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第四章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第四章课后练习 课后练习（计入总分） SINGLE 假设在程序控制流图中，有14 条边，10个节点，则控制流程图的环路复杂性V(G)等于______。 C. 6 12 8 6 4">
<div class="sqe-question">
<p class="sqe-question-title">题 12-18（单选）</p>
<p>假设在程序控制流图中，有14 条边，10个节点，则控制流程图的环路复杂性V(G)等于______。</p>
<ul class="sqe-options"><li><strong>A.</strong> 12</li><li><strong>B.</strong> 8</li><li><strong>C.</strong> 6</li><li><strong>D.</strong> 4</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第四章课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>C. 6</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第四章课后练习 课后练习（计入总分） SINGLE 修复软件缺陷费用最高的是 __________ 阶段。 D. 发布 编制说明书 设计 编写代码 发布">
<div class="sqe-question">
<p class="sqe-question-title">题 12-19（单选）</p>
<p>修复软件缺陷费用最高的是 __________ 阶段。</p>
<ul class="sqe-options"><li><strong>A.</strong> 编制说明书</li><li><strong>B.</strong> 设计</li><li><strong>C.</strong> 编写代码</li><li><strong>D.</strong> 发布</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第四章课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>D. 发布</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第四章课后练习 课后练习（计入总分） FILL 软件产品度量包括软件 （填空1） 、 （填空2） 、 （填空3） 、 （填空4） 以及 （填空5） 。 填空1: 规模大小；填空2: 产品复杂度；填空3: 设计特征；填空4: 性能；填空5: 质量水平 ">
<div class="sqe-question">
<p class="sqe-question-title">题 12-20（填空）</p>
<p>软件产品度量包括软件 （填空1） 、 （填空2） 、 （填空3） 、 （填空4） 以及 （填空5） 。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第四章课后练习</span><span>填空</span><span>5 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 规模大小；填空2: 产品复杂度；填空3: 设计特征；填空4: 性能；填空5: 质量水平</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第四章课后练习 课后练习（计入总分） FILL （填空1） 是对软件产品进行范围广泛的测度，它给出一个系统、构件或过程的某个给定属性的度的定量测量。 填空1: 度量 ">
<div class="sqe-question">
<p class="sqe-question-title">题 12-21（填空）</p>
<p>（填空1） 是对软件产品进行范围广泛的测度，它给出一个系统、构件或过程的某个给定属性的度的定量测量。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第四章课后练习</span><span>填空</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 度量</p></div></details></div>
</article>
</section>

<section id="quiz-13" class="sqe-chapter">
<div class="sqe-chapter-head">
<span class="sqe-number">13</span>
<div><small>课后练习（计入总分） · 云班课 QUIZ</small><h3>实验二课后练习</h3><div><span class="sqe-source-pill">题目接口直接导出</span><span class="sqe-source-pill">25 道题</span></div></div>
</div>

<article class="sqe-card" data-sqe-card data-sqe-text="实验二课后练习 课后练习（计入总分） TF 基路径测试给出了必需进行的测试的上限。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 13-01（判断）</p>
<p>基路径测试给出了必需进行的测试的上限。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验二课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验二课后练习 课后练习（计入总分） TF 基路径是指从所有的程序路径中选择一个最小的路径集合，程序中的其它路径都可以由这一组路径进行加法和数乘运算得到。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 13-02（判断）</p>
<p>基路径是指从所有的程序路径中选择一个最小的路径集合，程序中的其它路径都可以由这一组路径进行加法和数乘运算得到。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验二课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验二课后练习 课后练习（计入总分） SINGLE 下列几种逻辑覆盖标准中，查错能力最强的是 A. 条件组合覆盖 条件组合覆盖 判定/条件覆盖 语句覆盖 判定覆盖">
<div class="sqe-question">
<p class="sqe-question-title">题 13-03（单选）</p>
<p>下列几种逻辑覆盖标准中，查错能力最强的是</p>
<ul class="sqe-options"><li><strong>A.</strong> 条件组合覆盖</li><li><strong>B.</strong> 判定/条件覆盖</li><li><strong>C.</strong> 语句覆盖</li><li><strong>D.</strong> 判定覆盖</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验二课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 条件组合覆盖</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验二课后练习 课后练习（计入总分） SINGLE &amp;rlm;一个程序中所含有的路径数与_____有着直接的关系 D. 程序的复杂程度 程序语句行数 程序指令执行时间 程序模块数 程序的复杂程度">
<div class="sqe-question">
<p class="sqe-question-title">题 13-04（单选）</p>
<p>&amp;rlm;一个程序中所含有的路径数与_____有着直接的关系</p>
<ul class="sqe-options"><li><strong>A.</strong> 程序语句行数</li><li><strong>B.</strong> 程序指令执行时间</li><li><strong>C.</strong> 程序模块数</li><li><strong>D.</strong> 程序的复杂程度</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验二课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>D. 程序的复杂程度</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验二课后练习 课后练习（计入总分） SINGLE 条件覆盖的目的是 D. 使程序中的每个判定中每个条件的可能值至少满足一次 使程序中的每个可执行语句至少执行一次 使每个判定的所有可能的条件取值组合至少执行一次 使程序中的每个判定至少都获得一次&amp;ldquo;真&amp;rdquo;值和&amp;ldquo;假&amp;rdquo;值 使程序中的每个判定中每个条件的可能值至少满足一次">
<div class="sqe-question">
<p class="sqe-question-title">题 13-05（单选）</p>
<p>条件覆盖的目的是</p>
<ul class="sqe-options"><li><strong>A.</strong> 使程序中的每个可执行语句至少执行一次</li><li><strong>B.</strong> 使每个判定的所有可能的条件取值组合至少执行一次</li><li><strong>C.</strong> 使程序中的每个判定至少都获得一次&amp;ldquo;真&amp;rdquo;值和&amp;ldquo;假&amp;rdquo;值</li><li><strong>D.</strong> 使程序中的每个判定中每个条件的可能值至少满足一次</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验二课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>D. 使程序中的每个判定中每个条件的可能值至少满足一次</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验二课后练习 课后练习（计入总分） SINGLE 白盒测试是根据程序的_____来设计测试用例,黑盒测试是根据软件的规格说明来设计测试用例。 B. 内部逻辑 内部数据 内部逻辑 功能 性能">
<div class="sqe-question">
<p class="sqe-question-title">题 13-06（单选）</p>
<p>白盒测试是根据程序的_____来设计测试用例,黑盒测试是根据软件的规格说明来设计测试用例。</p>
<ul class="sqe-options"><li><strong>A.</strong> 内部数据</li><li><strong>B.</strong> 内部逻辑</li><li><strong>C.</strong> 功能</li><li><strong>D.</strong> 性能</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验二课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>B. 内部逻辑</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验二课后练习 课后练习（计入总分） SINGLE ​阅读下面这段程序，使用逻辑覆盖法进行测试，请问哪一组关于（a,b,c）的输入值可以达到判定覆盖。
&amp;lrm;​int func(int a,b,c)
{&amp;lrm;​
int k=1;
&amp;lrm;​if ( (a&gt;0) &amp;&amp;(b&lt;0) &amp;&amp; (a+c&gt;0) )
k=k+a;&amp;lrm;​
else
k=k+b;
&amp;lrm;​if (c&gt;0)
k=k+c;&amp;lrm;​
return k;&amp;lrm;​
} C. (a,b,c) = (4,-9,-2)、(-4,8,3) (a,b,c) = (2,5,8)、(-4,-9,-5) (a,b,c) = (3,6,1)、(-4,-5,7) (a,b,c) = (4,-9,-2)、(-4,8,3) (a,b,c) = (6,8,-2)、(1,5,4)">
<div class="sqe-question">
<p class="sqe-question-title">题 13-07（单选）</p>
<p>​阅读下面这段程序，使用逻辑覆盖法进行测试，请问哪一组关于（a,b,c）的输入值可以达到判定覆盖。
&amp;lrm;​int func(int a,b,c)
{&amp;lrm;​
int k=1;
&amp;lrm;​if ( (a&gt;0) &amp;&amp;(b&lt;0) &amp;&amp; (a+c&gt;0) )
k=k+a;&amp;lrm;​
else
k=k+b;
&amp;lrm;​if (c&gt;0)
k=k+c;&amp;lrm;​
return k;&amp;lrm;​
}</p>
<ul class="sqe-options"><li><strong>A.</strong> (a,b,c) = (2,5,8)、(-4,-9,-5)</li><li><strong>B.</strong> (a,b,c) = (3,6,1)、(-4,-5,7)</li><li><strong>C.</strong> (a,b,c) = (4,-9,-2)、(-4,8,3)</li><li><strong>D.</strong> (a,b,c) = (6,8,-2)、(1,5,4)</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验二课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>C. (a,b,c) = (4,-9,-2)、(-4,8,3)</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验二课后练习 课后练习（计入总分） SINGLE 如果某测试用例集实现了某软件的路径覆盖，那么它一定同时实现了该软件的 B. 判定覆盖 条件组合覆盖 判定覆盖 判定/条件覆盖 条件覆盖">
<div class="sqe-question">
<p class="sqe-question-title">题 13-08（单选）</p>
<p>如果某测试用例集实现了某软件的路径覆盖，那么它一定同时实现了该软件的</p>
<ul class="sqe-options"><li><strong>A.</strong> 条件组合覆盖</li><li><strong>B.</strong> 判定覆盖</li><li><strong>C.</strong> 判定/条件覆盖</li><li><strong>D.</strong> 条件覆盖</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验二课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>B. 判定覆盖</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验二课后练习 课后练习（计入总分） SINGLE 以下哪种测试方法不属于白盒测试技术 B. 边界值分析测试 逻辑覆盖 边界值分析测试 基本路径测试 变异测试">
<div class="sqe-question">
<p class="sqe-question-title">题 13-09（单选）</p>
<p>以下哪种测试方法不属于白盒测试技术</p>
<ul class="sqe-options"><li><strong>A.</strong> 逻辑覆盖</li><li><strong>B.</strong> 边界值分析测试</li><li><strong>C.</strong> 基本路径测试</li><li><strong>D.</strong> 变异测试</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验二课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>B. 边界值分析测试</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验二课后练习 课后练习（计入总分） SINGLE 对一个程序进行基本路径覆盖测试，所需测试用例的最少个数为 A. 程序的环路复杂度 程序的环路复杂度 程序中的模块数 程序中判定节点的个数 程序中的路径总数">
<div class="sqe-question">
<p class="sqe-question-title">题 13-10（单选）</p>
<p>对一个程序进行基本路径覆盖测试，所需测试用例的最少个数为</p>
<ul class="sqe-options"><li><strong>A.</strong> 程序的环路复杂度</li><li><strong>B.</strong> 程序中的模块数</li><li><strong>C.</strong> 程序中判定节点的个数</li><li><strong>D.</strong> 程序中的路径总数</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验二课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 程序的环路复杂度</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验二课后练习 课后练习（计入总分） SINGLE 如果一个判定中的复合条件表达式为（A &gt; 1）or（B &lt;= 3），则为了达到100%的条件覆盖率，至少需要设计多少个测试用例_____。 D. 2 3 1 4 2">
<div class="sqe-question">
<p class="sqe-question-title">题 13-11（单选）</p>
<p>如果一个判定中的复合条件表达式为（A &gt; 1）or（B &lt;= 3），则为了达到100%的条件覆盖率，至少需要设计多少个测试用例_____。</p>
<ul class="sqe-options"><li><strong>A.</strong> 3</li><li><strong>B.</strong> 1</li><li><strong>C.</strong> 4</li><li><strong>D.</strong> 2</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验二课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>D. 2</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验二课后练习 课后练习（计入总分） SINGLE 对下面的计算个人所得税程序中，满足判定覆盖的测试用例是_____。
&amp;lrm;&amp;rlm;if (income&lt;800) taxrate=0;
&amp;lrm; else if (income&lt;=1500) taxrate=0.05;
&amp;lrm; else if (income&lt;2000) taxrate=0.08;
&amp;lrm; else taxrate=0.1; D. income=(799, 1500, 1999, 2000) income=(799, 1501, 2000, 2001) income=(800, 1499, 2000, 2001) income=(800, 1500, 2000, 2001) income=(799, 1500, 1999, 2000)">
<div class="sqe-question">
<p class="sqe-question-title">题 13-12（单选）</p>
<p>对下面的计算个人所得税程序中，满足判定覆盖的测试用例是_____。
&amp;lrm;&amp;rlm;if (income&lt;800) taxrate=0;
&amp;lrm; else if (income&lt;=1500) taxrate=0.05;
&amp;lrm; else if (income&lt;2000) taxrate=0.08;
&amp;lrm; else taxrate=0.1;</p>
<ul class="sqe-options"><li><strong>A.</strong> income=(799, 1501, 2000, 2001)</li><li><strong>B.</strong> income=(800, 1499, 2000, 2001)</li><li><strong>C.</strong> income=(800, 1500, 2000, 2001)</li><li><strong>D.</strong> income=(799, 1500, 1999, 2000)</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验二课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>D. income=(799, 1500, 1999, 2000)</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验二课后练习 课后练习（计入总分） SINGLE &amp;zwnj;针对下面一个程序段：
If ((M&gt;0) &amp;&amp; (N = = 0)) FUCTION1;
If ((M = = 10)|| (P &gt; 10)) FUCTION2;
其中，FUCTION1、FUCTION2均为语句块。
现在选取测试用例：M=10 N=0 P=3 ，该测试用例满足了 A. 语句覆盖 语句覆盖 判定覆盖 条件组合覆 路径覆盖">
<div class="sqe-question">
<p class="sqe-question-title">题 13-13（单选）</p>
<p>&amp;zwnj;针对下面一个程序段：
If ((M&gt;0) &amp;&amp; (N = = 0)) FUCTION1;
If ((M = = 10)|| (P &gt; 10)) FUCTION2;
其中，FUCTION1、FUCTION2均为语句块。
现在选取测试用例：M=10 N=0 P=3 ，该测试用例满足了</p>
<ul class="sqe-options"><li><strong>A.</strong> 语句覆盖</li><li><strong>B.</strong> 判定覆盖</li><li><strong>C.</strong> 条件组合覆</li><li><strong>D.</strong> 路径覆盖</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验二课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 语句覆盖</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验二课后练习 课后练习（计入总分） SINGLE 一个程序中所含有的路径数与_____有着直接的关系。 D. 程序的复杂程度 程序指令执行时间 程序模块数 程序语句行数 程序的复杂程度">
<div class="sqe-question">
<p class="sqe-question-title">题 13-14（单选）</p>
<p>一个程序中所含有的路径数与_____有着直接的关系。</p>
<ul class="sqe-options"><li><strong>A.</strong> 程序指令执行时间</li><li><strong>B.</strong> 程序模块数</li><li><strong>C.</strong> 程序语句行数</li><li><strong>D.</strong> 程序的复杂程度</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验二课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>D. 程序的复杂程度</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验二课后练习 课后练习（计入总分） SINGLE 如果某测试用例集实现了判定覆盖，那么它一定同时实现了该软件的 C. 语句覆盖 条件组合覆盖 判定/条件覆盖 语句覆盖 条件覆盖">
<div class="sqe-question">
<p class="sqe-question-title">题 13-15（单选）</p>
<p>如果某测试用例集实现了判定覆盖，那么它一定同时实现了该软件的</p>
<ul class="sqe-options"><li><strong>A.</strong> 条件组合覆盖</li><li><strong>B.</strong> 判定/条件覆盖</li><li><strong>C.</strong> 语句覆盖</li><li><strong>D.</strong> 条件覆盖</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验二课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>C. 语句覆盖</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验二课后练习 课后练习（计入总分） SINGLE 下列不属于白盒测试的技术是 C. 边界值分析 判定覆盖 基本路径测试 边界值分析 语句覆盖">
<div class="sqe-question">
<p class="sqe-question-title">题 13-16（单选）</p>
<p>下列不属于白盒测试的技术是</p>
<ul class="sqe-options"><li><strong>A.</strong> 判定覆盖</li><li><strong>B.</strong> 基本路径测试</li><li><strong>C.</strong> 边界值分析</li><li><strong>D.</strong> 语句覆盖</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验二课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>C. 边界值分析</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验二课后练习 课后练习（计入总分） SINGLE 发现错误能力最弱的是_______ A. 语句覆盖 语句覆盖 判定覆盖 条件覆盖 路径覆盖">
<div class="sqe-question">
<p class="sqe-question-title">题 13-17（单选）</p>
<p>发现错误能力最弱的是_______</p>
<ul class="sqe-options"><li><strong>A.</strong> 语句覆盖</li><li><strong>B.</strong> 判定覆盖</li><li><strong>C.</strong> 条件覆盖</li><li><strong>D.</strong> 路径覆盖</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验二课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 语句覆盖</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验二课后练习 课后练习（计入总分） TF Beta 测试是验收测试的一种。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 13-18（判断）</p>
<p>Beta 测试是验收测试的一种。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验二课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验二课后练习 课后练习（计入总分） TF 白盒测试会造成测试用例之间可能存在严重的冗余和未测试的功能漏洞。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 13-19（判断）</p>
<p>白盒测试会造成测试用例之间可能存在严重的冗余和未测试的功能漏洞。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验二课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验二课后练习 课后练习（计入总分） FILL 判定-条件覆盖法要求使得判断中 （填空1） 至少执行一次。 填空1: 每个条件的所有可能取值 ">
<div class="sqe-question">
<p class="sqe-question-title">题 13-20（填空）</p>
<p>判定-条件覆盖法要求使得判断中 （填空1） 至少执行一次。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验二课后练习</span><span>填空</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 每个条件的所有可能取值</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验二课后练习 课后练习（计入总分） FILL 白盒测试适合 （填空1） 测试、 （填空2） 测试。 填空1: 单元；填空2: 集成 ">
<div class="sqe-question">
<p class="sqe-question-title">题 13-21（填空）</p>
<p>白盒测试适合 （填空1） 测试、 （填空2） 测试。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验二课后练习</span><span>填空</span><span>2 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 单元；填空2: 集成</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验二课后练习 课后练习（计入总分） SINGLE 白盒测试方法中阐述不正确的是_____ D. 组合覆盖要求设计足够多的测试用例，使得每个判定中条件结果的所有可能组合最多出现一次。 语句覆盖要求设计足够多的测试用例，使得程序中每条语句至少被执行一次。 条件覆盖比判定覆盖，增加了对符合判定情况的测试，增加了测试路径。 判定/条件覆盖准则的缺点是未考虑条件的组合情况 组合覆盖要求设计足够多的测试用例，使得每个判定中条件结果的所有可能组合最多出现一次。">
<div class="sqe-question">
<p class="sqe-question-title">题 13-22（单选）</p>
<p>白盒测试方法中阐述不正确的是_____</p>
<ul class="sqe-options"><li><strong>A.</strong> 语句覆盖要求设计足够多的测试用例，使得程序中每条语句至少被执行一次。</li><li><strong>B.</strong> 条件覆盖比判定覆盖，增加了对符合判定情况的测试，增加了测试路径。</li><li><strong>C.</strong> 判定/条件覆盖准则的缺点是未考虑条件的组合情况</li><li><strong>D.</strong> 组合覆盖要求设计足够多的测试用例，使得每个判定中条件结果的所有可能组合最多出现一次。</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验二课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>D. 组合覆盖要求设计足够多的测试用例，使得每个判定中条件结果的所有可能组合最多出现一次。</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验二课后练习 课后练习（计入总分） TF 在白盒测试中，如果覆盖率达到100% ，就基本可以保证把所有的隐藏程序缺陷都已经揭露出来了。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 13-23（判断）</p>
<p>在白盒测试中，如果覆盖率达到100% ，就基本可以保证把所有的隐藏程序缺陷都已经揭露出来了。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验二课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验二课后练习 课后练习（计入总分） FILL 满足条件组合覆盖标准的测试数据并不一定能使程序中的 （填空1） 都执行到。 填空1: 每条路径 ">
<div class="sqe-question">
<p class="sqe-question-title">题 13-24（填空）</p>
<p>满足条件组合覆盖标准的测试数据并不一定能使程序中的 （填空1） 都执行到。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验二课后练习</span><span>填空</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 每条路径</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验二课后练习 课后练习（计入总分） TF 在白盒测试中，如果覆盖率达到100% ，就基本可以保证把所有的隐藏程序缺陷都已经揭露出来了。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 13-25（判断）</p>
<p>在白盒测试中，如果覆盖率达到100% ，就基本可以保证把所有的隐藏程序缺陷都已经揭露出来了。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验二课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>
</section>

<section id="quiz-14" class="sqe-chapter">
<div class="sqe-chapter-head">
<span class="sqe-number">14</span>
<div><small>课后练习（计入总分） · 云班课 QUIZ</small><h3>第一章课后练习</h3><div><span class="sqe-source-pill">题目接口直接导出</span><span class="sqe-source-pill">27 道题</span></div></div>
</div>

<article class="sqe-card" data-sqe-card data-sqe-text="第一章课后练习 课后练习（计入总分） FILL 与质量相关的概念包括 （填空1） 、 （填空2） 、 （填空3） 、 （填空4） 、 （填空5） 和 （填空6） 。 填空1: 组织；填空2: 过程；填空3: 产品；填空4: 服务；填空5: 客户；填空6: 体系 ">
<div class="sqe-question">
<p class="sqe-question-title">题 14-01（填空）</p>
<p>与质量相关的概念包括 （填空1） 、 （填空2） 、 （填空3） 、 （填空4） 、 （填空5） 和 （填空6） 。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第一章课后练习</span><span>填空</span><span>6 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 组织；填空2: 过程；填空3: 产品；填空4: 服务；填空5: 客户；填空6: 体系</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第一章课后练习 课后练习（计入总分） FILL 质量是 （填空1） 、 （填空2） 或 （填空3） 满足客户或用户明确需求或期望的不同程度。 填空1: 系统；填空2: 部件；填空3: 过程 ">
<div class="sqe-question">
<p class="sqe-question-title">题 14-02（填空）</p>
<p>质量是 （填空1） 、 （填空2） 或 （填空3） 满足客户或用户明确需求或期望的不同程度。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第一章课后练习</span><span>填空</span><span>3 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 系统；填空2: 部件；填空3: 过程</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第一章课后练习 课后练习（计入总分） FILL 质量的属性包括： （填空1） 属性、 （填空2） 属性、 （填空3） 属性、 （填空4） 、 （填空5） 。 填空1: 客户；填空2: 成本；填空3: 社会；填空4: 可测性；填空5: 可预见性 ">
<div class="sqe-question">
<p class="sqe-question-title">题 14-03（填空）</p>
<p>质量的属性包括： （填空1） 属性、 （填空2） 属性、 （填空3） 属性、 （填空4） 、 （填空5） 。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第一章课后练习</span><span>填空</span><span>5 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 客户；填空2: 成本；填空3: 社会；填空4: 可测性；填空5: 可预见性</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第一章课后练习 课后练习（计入总分） MULTI 质量管理是指在质量方面（ ）和（ ）组织的协调的活动 B. 指挥；C. 控制 策划 指挥 控制 制定">
<div class="sqe-question">
<p class="sqe-question-title">题 14-04（多选）</p>
<p>质量管理是指在质量方面（ ）和（ ）组织的协调的活动</p>
<ul class="sqe-options"><li><strong>A.</strong> 策划</li><li><strong>B.</strong> 指挥</li><li><strong>C.</strong> 控制</li><li><strong>D.</strong> 制定</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第一章课后练习</span><span>多选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>B. 指挥；C. 控制</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第一章课后练习 课后练习（计入总分） TF 质量检验是对产品质量特性进行检验，以确定每项质量特性合格情况的管理性检查活动  ">
<div class="sqe-question">
<p class="sqe-question-title">题 14-05（判断）</p>
<p>质量检验是对产品质量特性进行检验，以确定每项质量特性合格情况的管理性检查活动</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第一章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第一章课后练习 课后练习（计入总分） TF 持续改进总体业绩应当是组织应追求的目标  ">
<div class="sqe-question">
<p class="sqe-question-title">题 14-06（判断）</p>
<p>持续改进总体业绩应当是组织应追求的目标</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第一章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第一章课后练习 课后练习（计入总分） TF 质量改进是质量管理的一部分，致力于增强满足质量要求的能力  ">
<div class="sqe-question">
<p class="sqe-question-title">题 14-07（判断）</p>
<p>质量改进是质量管理的一部分，致力于增强满足质量要求的能力</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第一章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第一章课后练习 课后练习（计入总分） TF 质量控制是按照一个设定的标准去实施检验  ">
<div class="sqe-question">
<p class="sqe-question-title">题 14-08（判断）</p>
<p>质量控制是按照一个设定的标准去实施检验</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第一章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第一章课后练习 课后练习（计入总分） TF 服务是产品类别中的一类  ">
<div class="sqe-question">
<p class="sqe-question-title">题 14-09（判断）</p>
<p>服务是产品类别中的一类</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第一章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第一章课后练习 课后练习（计入总分） TF 质量特性是指产品、过程或体系与标准有关的固有特性。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 14-10（判断）</p>
<p>质量特性是指产品、过程或体系与标准有关的固有特性。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第一章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第一章课后练习 课后练习（计入总分） TF &amp;ldquo;符合标准&amp;rdquo;就是合格的产品质量  ">
<div class="sqe-question">
<p class="sqe-question-title">题 14-11（判断）</p>
<p>&amp;ldquo;符合标准&amp;rdquo;就是合格的产品质量</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第一章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第一章课后练习 课后练习（计入总分） MULTI 质量管理体系可以（ ） A. 帮助组织实现顾客满意；B. 为组织提供实现持续改进的框架；C. 向顾客提供信任 帮助组织实现顾客满意 为组织提供实现持续改进的框架 向顾客提供信任 使管理过程标准化">
<div class="sqe-question">
<p class="sqe-question-title">题 14-12（多选）</p>
<p>质量管理体系可以（ ）</p>
<ul class="sqe-options"><li><strong>A.</strong> 帮助组织实现顾客满意</li><li><strong>B.</strong> 为组织提供实现持续改进的框架</li><li><strong>C.</strong> 向顾客提供信任</li><li><strong>D.</strong> 使管理过程标准化</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第一章课后练习</span><span>多选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 帮助组织实现顾客满意；B. 为组织提供实现持续改进的框架；C. 向顾客提供信任</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第一章课后练习 课后练习（计入总分） MULTI 实现全面质量管理全过程的管理必须体现（ ）的思想 A. 预防为主、不断改进；D. 为顾客服务 预防为主、不断改进 严格质量检验 加强生产控制 为顾客服务">
<div class="sqe-question">
<p class="sqe-question-title">题 14-13（多选）</p>
<p>实现全面质量管理全过程的管理必须体现（ ）的思想</p>
<ul class="sqe-options"><li><strong>A.</strong> 预防为主、不断改进</li><li><strong>B.</strong> 严格质量检验</li><li><strong>C.</strong> 加强生产控制</li><li><strong>D.</strong> 为顾客服务</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第一章课后练习</span><span>多选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 预防为主、不断改进；D. 为顾客服务</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第一章课后练习 课后练习（计入总分） TF 不合格品控制时，请示领导决定是否可用  ">
<div class="sqe-question">
<p class="sqe-question-title">题 14-14（判断）</p>
<p>不合格品控制时，请示领导决定是否可用</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第一章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第一章课后练习 课后练习（计入总分） TF 质量管理体系是为实现质量方针和质量目标而建立的管理工作系统  ">
<div class="sqe-question">
<p class="sqe-question-title">题 14-15（判断）</p>
<p>质量管理体系是为实现质量方针和质量目标而建立的管理工作系统</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第一章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第一章课后练习 课后练习（计入总分） TF 珍视顾客抱怨，把它作为我们研发产品、改善质量、提升服务的动力源泉  ">
<div class="sqe-question">
<p class="sqe-question-title">题 14-16（判断）</p>
<p>珍视顾客抱怨，把它作为我们研发产品、改善质量、提升服务的动力源泉</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第一章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第一章课后练习 课后练习（计入总分） TF 质量改进和质量控制都是为了保持产品质量稳定  ">
<div class="sqe-question">
<p class="sqe-question-title">题 14-17（判断）</p>
<p>质量改进和质量控制都是为了保持产品质量稳定</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第一章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第一章课后练习 课后练习（计入总分） TF 当生产过程处于受控制状态时，产品质量就不会波动  ">
<div class="sqe-question">
<p class="sqe-question-title">题 14-18（判断）</p>
<p>当生产过程处于受控制状态时，产品质量就不会波动</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第一章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第一章课后练习 课后练习（计入总分） TF 质量控制是消除偶发性问题，使产品质量保持规定的水平  ">
<div class="sqe-question">
<p class="sqe-question-title">题 14-19（判断）</p>
<p>质量控制是消除偶发性问题，使产品质量保持规定的水平</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第一章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第一章课后练习 课后练习（计入总分） TF 质量管理是指在质量方面指挥和控制组织的协调的活动  ">
<div class="sqe-question">
<p class="sqe-question-title">题 14-20（判断）</p>
<p>质量管理是指在质量方面指挥和控制组织的协调的活动</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第一章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第一章课后练习 课后练习（计入总分） SINGLE 致力于制定质量目标并规定必要的运行过程和相关资源以实现质量目标，称之为（ ） B. 质量策划 质量管理 质量策划 质量保证 质量控制">
<div class="sqe-question">
<p class="sqe-question-title">题 14-21（单选）</p>
<p>致力于制定质量目标并规定必要的运行过程和相关资源以实现质量目标，称之为（ ）</p>
<ul class="sqe-options"><li><strong>A.</strong> 质量管理</li><li><strong>B.</strong> 质量策划</li><li><strong>C.</strong> 质量保证</li><li><strong>D.</strong> 质量控制</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第一章课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>B. 质量策划</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第一章课后练习 课后练习（计入总分） SINGLE 质量方针是一个组织总的质量宗旨和方向，应由组织的（ ）批准。 B. 最高管理者 上级机关 最高管理者 质量管理办公室主任 总工程师">
<div class="sqe-question">
<p class="sqe-question-title">题 14-22（单选）</p>
<p>质量方针是一个组织总的质量宗旨和方向，应由组织的（ ）批准。</p>
<ul class="sqe-options"><li><strong>A.</strong> 上级机关</li><li><strong>B.</strong> 最高管理者</li><li><strong>C.</strong> 质量管理办公室主任</li><li><strong>D.</strong> 总工程师</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第一章课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>B. 最高管理者</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第一章课后练习 课后练习（计入总分） SINGLE 由于组织的顾客和其他相关方对组织的产品、过程和体系的要求是随着时间不断变化的，这体现了质量的（ ）。 A. 时效性 时效性 广泛性 主观性 相对性">
<div class="sqe-question">
<p class="sqe-question-title">题 14-23（单选）</p>
<p>由于组织的顾客和其他相关方对组织的产品、过程和体系的要求是随着时间不断变化的，这体现了质量的（ ）。</p>
<ul class="sqe-options"><li><strong>A.</strong> 时效性</li><li><strong>B.</strong> 广泛性</li><li><strong>C.</strong> 主观性</li><li><strong>D.</strong> 相对性</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第一章课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 时效性</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第一章课后练习 课后练习（计入总分） SINGLE 著名的质量管理专家朱兰提出的质量管理三步曲是指 （ ）。 C. 质量策划、质量控制、质量改进 质量保证、质量控制、质量改进 质量控制、质量保证、质量改进 质量策划、质量控制、质量改进 质量策划、 质量改进、质量保证">
<div class="sqe-question">
<p class="sqe-question-title">题 14-24（单选）</p>
<p>著名的质量管理专家朱兰提出的质量管理三步曲是指 （ ）。</p>
<ul class="sqe-options"><li><strong>A.</strong> 质量保证、质量控制、质量改进</li><li><strong>B.</strong> 质量控制、质量保证、质量改进</li><li><strong>C.</strong> 质量策划、质量控制、质量改进</li><li><strong>D.</strong> 质量策划、 质量改进、质量保证</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第一章课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>C. 质量策划、质量控制、质量改进</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第一章课后练习 课后练习（计入总分） SINGLE 质量概念涵盖的对象是（ ）。 D. 以上皆是 产品 服务 过程 以上皆是">
<div class="sqe-question">
<p class="sqe-question-title">题 14-25（单选）</p>
<p>质量概念涵盖的对象是（ ）。</p>
<ul class="sqe-options"><li><strong>A.</strong> 产品</li><li><strong>B.</strong> 服务</li><li><strong>C.</strong> 过程</li><li><strong>D.</strong> 以上皆是</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第一章课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>D. 以上皆是</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第一章课后练习 课后练习（计入总分） SINGLE 从适合顾客需要的角度对产品质量下定义被称为（ ）。 D. 适用性质量 符合性质量 广义性质量 满意的质量 适用性质量">
<div class="sqe-question">
<p class="sqe-question-title">题 14-26（单选）</p>
<p>从适合顾客需要的角度对产品质量下定义被称为（ ）。</p>
<ul class="sqe-options"><li><strong>A.</strong> 符合性质量</li><li><strong>B.</strong> 广义性质量</li><li><strong>C.</strong> 满意的质量</li><li><strong>D.</strong> 适用性质量</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第一章课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>D. 适用性质量</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第一章课后练习 课后练习（计入总分） SINGLE 质量是一组固有（ ）满足要求的程度。 A. 特性 特性 品质 行为的特性 特征">
<div class="sqe-question">
<p class="sqe-question-title">题 14-27（单选）</p>
<p>质量是一组固有（ ）满足要求的程度。</p>
<ul class="sqe-options"><li><strong>A.</strong> 特性</li><li><strong>B.</strong> 品质</li><li><strong>C.</strong> 行为的特性</li><li><strong>D.</strong> 特征</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第一章课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 特性</p></div></details></div>
</article>
</section>

<section id="quiz-15" class="sqe-chapter">
<div class="sqe-chapter-head">
<span class="sqe-number">15</span>
<div><small>课后练习（计入总分） · 云班课 QUIZ</small><h3>第三章课后练习</h3><div><span class="sqe-source-pill">题目接口直接导出</span><span class="sqe-source-pill">11 道题</span></div></div>
</div>

<article class="sqe-card" data-sqe-card data-sqe-text="第三章课后练习 课后练习（计入总分） TF 软件可靠性是指一个系统或组件在某个特定时期、特定条件下完成所需完成的功能的能力。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 15-01（判断）</p>
<p>软件可靠性是指一个系统或组件在某个特定时期、特定条件下完成所需完成的功能的能力。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第三章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第三章课后练习 课后练习（计入总分） SINGLE 软件工程概念的提出是由于______。 B. 软件危机的出现 计算技术的发展 软件危机的出现 程序设计方法学的影响 其它工程科学的影响">
<div class="sqe-question">
<p class="sqe-question-title">题 15-02（单选）</p>
<p>软件工程概念的提出是由于______。</p>
<ul class="sqe-options"><li><strong>A.</strong> 计算技术的发展</li><li><strong>B.</strong> 软件危机的出现</li><li><strong>C.</strong> 程序设计方法学的影响</li><li><strong>D.</strong> 其它工程科学的影响</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第三章课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>B. 软件危机的出现</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第三章课后练习 课后练习（计入总分） SINGLE 系统可维护性的评价指标不包括______。 C. 可移植性 可理解性 可测试性 可移植性 可修改性">
<div class="sqe-question">
<p class="sqe-question-title">题 15-03（单选）</p>
<p>系统可维护性的评价指标不包括______。</p>
<ul class="sqe-options"><li><strong>A.</strong> 可理解性</li><li><strong>B.</strong> 可测试性</li><li><strong>C.</strong> 可移植性</li><li><strong>D.</strong> 可修改性</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第三章课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>C. 可移植性</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第三章课后练习 课后练习（计入总分） FILL ISO9126将各种质属性归纳为6个质量特征，其中包括 （填空1） 、 （填空2） 、 （填空3） 、 （填空4） 、 （填空5） 、 （填空6） 。 填空1: 功能性；填空2: 可靠性；填空3: 可使用性；填空4: 效率；填空5: 可维护性；填空6: 可移植性 ">
<div class="sqe-question">
<p class="sqe-question-title">题 15-04（填空）</p>
<p>ISO9126将各种质属性归纳为6个质量特征，其中包括 （填空1） 、 （填空2） 、 （填空3） 、 （填空4） 、 （填空5） 、 （填空6） 。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第三章课后练习</span><span>填空</span><span>6 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 功能性；填空2: 可靠性；填空3: 可使用性；填空4: 效率；填空5: 可维护性；填空6: 可移植性</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第三章课后练习 课后练习（计入总分） SINGLE 软件可移植性是用来衡量软件______的重要尺度之一。 C. 质量 通用性 效率 质量 人机界面">
<div class="sqe-question">
<p class="sqe-question-title">题 15-05（单选）</p>
<p>软件可移植性是用来衡量软件______的重要尺度之一。</p>
<ul class="sqe-options"><li><strong>A.</strong> 通用性</li><li><strong>B.</strong> 效率</li><li><strong>C.</strong> 质量</li><li><strong>D.</strong> 人机界面</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第三章课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>C. 质量</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第三章课后练习 课后练习（计入总分） FILL 六西格玛模型分为 （填空1） 、 （填空2） 、 （填空3） 、 （填空4） 、 （填空5） 等5个阶段。 填空1: 界定；填空2: 测量；填空3: 分析；填空4: 改进；填空5: 控制 ">
<div class="sqe-question">
<p class="sqe-question-title">题 15-06（填空）</p>
<p>六西格玛模型分为 （填空1） 、 （填空2） 、 （填空3） 、 （填空4） 、 （填空5） 等5个阶段。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第三章课后练习</span><span>填空</span><span>5 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 界定；填空2: 测量；填空3: 分析；填空4: 改进；填空5: 控制</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第三章课后练习 课后练习（计入总分） FILL IDEAL模型将质量改进过程划分为 （填空1） 、 （填空2） 、 （填空3） 、 （填空4） 和 （填空5） 等5个阶段。 填空1: 初始化；填空2: 诊断；填空3: 建立；填空4: 行动；填空5: 学习 ">
<div class="sqe-question">
<p class="sqe-question-title">题 15-07（填空）</p>
<p>IDEAL模型将质量改进过程划分为 （填空1） 、 （填空2） 、 （填空3） 、 （填空4） 和 （填空5） 等5个阶段。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第三章课后练习</span><span>填空</span><span>5 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 初始化；填空2: 诊断；填空3: 建立；填空4: 行动；填空5: 学习</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第三章课后练习 课后练习（计入总分） FILL 采用定量软件工程，制定软件产品质量的度量准则，可以提高软件开发过程 （填空1） ，降低 （填空2） ，提高软件产品的 （填空3） 。 填空1: 管理的可视性；填空2: 劣质成本；填空3: 质量 ">
<div class="sqe-question">
<p class="sqe-question-title">题 15-08（填空）</p>
<p>采用定量软件工程，制定软件产品质量的度量准则，可以提高软件开发过程 （填空1） ，降低 （填空2） ，提高软件产品的 （填空3） 。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第三章课后练习</span><span>填空</span><span>3 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 管理的可视性；填空2: 劣质成本；填空3: 质量</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第三章课后练习 课后练习（计入总分） FILL McCall模型产品修订纬度的质量因素有 （填空1） 性、 （填空2） 性、 （填空3） 性。 填空1: 可维护；填空2: 灵活；填空3: 可测试 ">
<div class="sqe-question">
<p class="sqe-question-title">题 15-09（填空）</p>
<p>McCall模型产品修订纬度的质量因素有 （填空1） 性、 （填空2） 性、 （填空3） 性。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第三章课后练习</span><span>填空</span><span>3 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 可维护；填空2: 灵活；填空3: 可测试</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第三章课后练习 课后练习（计入总分） FILL 软件质量工程包括软件质量 （填空1） 、软件质量 （填空2） 、软件质量 （填空3） 和软件质量 （填空4） 四大方面。 填空1: 方针；填空2: 控制；填空3: 保证；填空4: 管理 ">
<div class="sqe-question">
<p class="sqe-question-title">题 15-10（填空）</p>
<p>软件质量工程包括软件质量 （填空1） 、软件质量 （填空2） 、软件质量 （填空3） 和软件质量 （填空4） 四大方面。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第三章课后练习</span><span>填空</span><span>4 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 方针；填空2: 控制；填空3: 保证；填空4: 管理</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第三章课后练习 课后练习（计入总分） FILL 软件的6个品质要素包括： （填空1） 、 （填空2） 、 （填空3） 、 （填空4） 、 （填空5） 、 （填空6） 。 填空1: 正确性；填空2: 可靠性；填空3: 易用性；填空4: 效率；填空5: 可维护性；填空6: 可移植性 ">
<div class="sqe-question">
<p class="sqe-question-title">题 15-11（填空）</p>
<p>软件的6个品质要素包括： （填空1） 、 （填空2） 、 （填空3） 、 （填空4） 、 （填空5） 、 （填空6） 。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第三章课后练习</span><span>填空</span><span>6 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 正确性；填空2: 可靠性；填空3: 易用性；填空4: 效率；填空5: 可维护性；填空6: 可移植性</p></div></details></div>
</article>
</section>

<section id="quiz-16" class="sqe-chapter">
<div class="sqe-chapter-head">
<span class="sqe-number">16</span>
<div><small>课后练习（计入总分） · 云班课 QUIZ</small><h3>实验三课后练习</h3><div><span class="sqe-source-pill">题目接口直接导出</span><span class="sqe-source-pill">33 道题</span></div></div>
</div>

<article class="sqe-card" data-sqe-card data-sqe-text="实验三课后练习 课后练习（计入总分） SINGLE &amp;rlm;用等价类划分法设计8位长数字类型用户名登录操作的测试用例，应该分成_____个等价区间 A. 4 4 6 2 3">
<div class="sqe-question">
<p class="sqe-question-title">题 16-01（单选）</p>
<p>&amp;rlm;用等价类划分法设计8位长数字类型用户名登录操作的测试用例，应该分成_____个等价区间</p>
<ul class="sqe-options"><li><strong>A.</strong> 4</li><li><strong>B.</strong> 6</li><li><strong>C.</strong> 2</li><li><strong>D.</strong> 3</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验三课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 4</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验三课后练习 课后练习（计入总分） SINGLE 某系统对每个员工一年的出勤天数进行核算和存储(每月22工作日，一年最多出勤12*22=264天)，使用文本框进行填写。在此文本框的测试用例编写中使用了等价类划分法，则下面划分不准确的是 D. 有效等价类，0&lt;出勤日&lt;264 无效等价类，出勤日&gt;264 无效等价类，出勤日为非数字 无效等价类，出勤日&lt;0 有效等价类，0&lt;出勤日&lt;264">
<div class="sqe-question">
<p class="sqe-question-title">题 16-02（单选）</p>
<p>某系统对每个员工一年的出勤天数进行核算和存储(每月22工作日，一年最多出勤12*22=264天)，使用文本框进行填写。在此文本框的测试用例编写中使用了等价类划分法，则下面划分不准确的是</p>
<ul class="sqe-options"><li><strong>A.</strong> 无效等价类，出勤日&gt;264</li><li><strong>B.</strong> 无效等价类，出勤日为非数字</li><li><strong>C.</strong> 无效等价类，出勤日&lt;0</li><li><strong>D.</strong> 有效等价类，0&lt;出勤日&lt;264</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验三课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>D. 有效等价类，0&lt;出勤日&lt;264</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验三课后练习 课后练习（计入总分） SINGLE 黑盒测试称为功能测试，黑盒测试不能发现 D. 是否存在冗余代码 界面是否有误 输入是否正确接收 终止性错误 是否存在冗余代码">
<div class="sqe-question">
<p class="sqe-question-title">题 16-03（单选）</p>
<p>黑盒测试称为功能测试，黑盒测试不能发现</p>
<ul class="sqe-options"><li><strong>A.</strong> 界面是否有误</li><li><strong>B.</strong> 输入是否正确接收</li><li><strong>C.</strong> 终止性错误</li><li><strong>D.</strong> 是否存在冗余代码</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验三课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>D. 是否存在冗余代码</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验三课后练习 课后练习（计入总分） SINGLE 有关等价类划分方法，说法正确的 D. 等价类划分可以有两种不同的情况：有效等价类和无效等价类 等价类是指某个输入子集合 测试某等价类的代表值就等于对其它值的测试 等价类是指某个输出子集合 等价类划分可以有两种不同的情况：有效等价类和无效等价类">
<div class="sqe-question">
<p class="sqe-question-title">题 16-04（单选）</p>
<p>有关等价类划分方法，说法正确的</p>
<ul class="sqe-options"><li><strong>A.</strong> 等价类是指某个输入子集合</li><li><strong>B.</strong> 测试某等价类的代表值就等于对其它值的测试</li><li><strong>C.</strong> 等价类是指某个输出子集合</li><li><strong>D.</strong> 等价类划分可以有两种不同的情况：有效等价类和无效等价类</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验三课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>D. 等价类划分可以有两种不同的情况：有效等价类和无效等价类</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验三课后练习 课后练习（计入总分） SINGLE 在划分了等价类后，首先需要设计一个案例覆盖_____有效等价类。 D. 尽可能多的 1 2 等价类数量-1个 尽可能多的">
<div class="sqe-question">
<p class="sqe-question-title">题 16-05（单选）</p>
<p>在划分了等价类后，首先需要设计一个案例覆盖_____有效等价类。</p>
<ul class="sqe-options"><li><strong>A.</strong> 1</li><li><strong>B.</strong> 2</li><li><strong>C.</strong> 等价类数量-1个</li><li><strong>D.</strong> 尽可能多的</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验三课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>D. 尽可能多的</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验三课后练习 课后练习（计入总分） SINGLE 某公司员工如果工作超过一年并且达到了之前同意的目标，那么员工可以获得奖金。
这些事实可以通过以下表格来显示：&amp;zwnj;&amp;lrm; &amp;zwnj;&amp;lrm;
&amp;lrm;以下哪个测试用例是在现实生活中会发生，但是上面的判定表遗漏了？ B. 条件 1=No，条件 2=Yes，条件 3=No，动作=No 条件 1=Yes，条件 2=Yes，条件 3=No，动作=Yes 条件 1=No，条件 2=Yes，条件 3=No，动作=No 条件 1=Yes，条件 2=No，条件 3=Yes，动作=No 条件 1=No，条件 2=No，条件 3=Yes，动作=No">
<div class="sqe-question">
<p class="sqe-question-title">题 16-06（单选）</p>
<p>某公司员工如果工作超过一年并且达到了之前同意的目标，那么员工可以获得奖金。
这些事实可以通过以下表格来显示：&amp;zwnj;&amp;lrm; &amp;zwnj;&amp;lrm;
&amp;lrm;以下哪个测试用例是在现实生活中会发生，但是上面的判定表遗漏了？</p>
<ul class="sqe-options"><li><strong>A.</strong> 条件 1=Yes，条件 2=Yes，条件 3=No，动作=Yes</li><li><strong>B.</strong> 条件 1=No，条件 2=Yes，条件 3=No，动作=No</li><li><strong>C.</strong> 条件 1=Yes，条件 2=No，条件 3=Yes，动作=No</li><li><strong>D.</strong> 条件 1=No，条件 2=No，条件 3=Yes，动作=No</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验三课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>B. 条件 1=No，条件 2=Yes，条件 3=No，动作=No</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验三课后练习 课后练习（计入总分） SINGLE 某视频应用有如下需求：该应用应该允许在下面的显示分辨率下播放视频：
​1. 640*480 &amp;zwnj;​
2. 1280*720 &amp;zwnj;​
3. 1600*1200 &amp;zwnj;​
4. 1920*1080&amp;zwnj;​
以下哪组测试用例是对该需求进行等价类划分测试技术得到的结果？ B. 验证应用能够在需求中的每个显示尺寸都可以播放视频（4 个测试用例） 验证应用能够在需求中的任意一个显示尺寸可以播放视频（1 个测试用例） 验证应用能够在需求中的每个显示尺寸都可以播放视频（4 个测试用例） 验证应用能够在显示尺寸 640*480 和 1920*1080 下播放视频（2 个测试用例） 验证应用能够在显示尺寸 1920*1080 下播放视频（1 个测试用例）">
<div class="sqe-question">
<p class="sqe-question-title">题 16-07（单选）</p>
<p>某视频应用有如下需求：该应用应该允许在下面的显示分辨率下播放视频：
​1. 640*480 &amp;zwnj;​
2. 1280*720 &amp;zwnj;​
3. 1600*1200 &amp;zwnj;​
4. 1920*1080&amp;zwnj;​
以下哪组测试用例是对该需求进行等价类划分测试技术得到的结果？</p>
<ul class="sqe-options"><li><strong>A.</strong> 验证应用能够在需求中的任意一个显示尺寸可以播放视频（1 个测试用例）</li><li><strong>B.</strong> 验证应用能够在需求中的每个显示尺寸都可以播放视频（4 个测试用例）</li><li><strong>C.</strong> 验证应用能够在显示尺寸 640*480 和 1920*1080 下播放视频（2 个测试用例）</li><li><strong>D.</strong> 验证应用能够在显示尺寸 1920*1080 下播放视频（1 个测试用例）</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验三课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>B. 验证应用能够在需求中的每个显示尺寸都可以播放视频（4 个测试用例）</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验三课后练习 课后练习（计入总分） SINGLE 需要计算员工的奖金。奖金不能是负数，但是最少可以是 0。
奖金是根据雇佣的时间：&amp;rlm;
小于等于 2 年
&amp;rlm;&amp;rlm;大于 2 年但是小于 5 年
5年到 10 年（包括 5 和 10），或者超过 10 年
&amp;rlm;&amp;rlm;为了覆盖奖金计算的所有有效等价类最少需要多少测试用例？ C. 4 3 5 4 2">
<div class="sqe-question">
<p class="sqe-question-title">题 16-08（单选）</p>
<p>需要计算员工的奖金。奖金不能是负数，但是最少可以是 0。
奖金是根据雇佣的时间：&amp;rlm;
小于等于 2 年
&amp;rlm;&amp;rlm;大于 2 年但是小于 5 年
5年到 10 年（包括 5 和 10），或者超过 10 年
&amp;rlm;&amp;rlm;为了覆盖奖金计算的所有有效等价类最少需要多少测试用例？</p>
<ul class="sqe-options"><li><strong>A.</strong> 3</li><li><strong>B.</strong> 5</li><li><strong>C.</strong> 4</li><li><strong>D.</strong> 2</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验三课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>C. 4</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验三课后练习 课后练习（计入总分） SINGLE 您正在测试一个只接受信用卡的无人值守汽油泵。一旦信用卡被验证，泵喷嘴放入油箱，并选择所需的等级，客户就可以使用键盘输入所需的燃油量（加仑）。键盘只允许输入数字。燃料以十分之一（0.1）加仑起出售，最多 50.0 加仑。 以下哪项是覆盖输入数量的等价划分的最小集合？ A. 0.0、20.0、60.0 0.0、20.0、60.0 0.0、0.1、50.0、70.0 0.0、0.1、50.0 -0.1、0.0、0.1、49.9、50.0、50.1">
<div class="sqe-question">
<p class="sqe-question-title">题 16-09（单选）</p>
<p>您正在测试一个只接受信用卡的无人值守汽油泵。一旦信用卡被验证，泵喷嘴放入油箱，并选择所需的等级，客户就可以使用键盘输入所需的燃油量（加仑）。键盘只允许输入数字。燃料以十分之一（0.1）加仑起出售，最多 50.0 加仑。 以下哪项是覆盖输入数量的等价划分的最小集合？</p>
<ul class="sqe-options"><li><strong>A.</strong> 0.0、20.0、60.0</li><li><strong>B.</strong> 0.0、0.1、50.0、70.0</li><li><strong>C.</strong> 0.0、0.1、50.0</li><li><strong>D.</strong> -0.1、0.0、0.1、49.9、50.0、50.1</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验三课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 0.0、20.0、60.0</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验三课后练习 课后练习（计入总分） SINGLE 一个程序只有一个输入S，其取值范围是－60&amp;le;S&amp;le;60。现从输入的角度设计了一组测试数据：-200，20，200，设计这组测试用例的方法 A. 等价类划分 等价类划分 因果图 条件覆盖 边界值分析">
<div class="sqe-question">
<p class="sqe-question-title">题 16-10（单选）</p>
<p>一个程序只有一个输入S，其取值范围是－60&amp;le;S&amp;le;60。现从输入的角度设计了一组测试数据：-200，20，200，设计这组测试用例的方法</p>
<ul class="sqe-options"><li><strong>A.</strong> 等价类划分</li><li><strong>B.</strong> 因果图</li><li><strong>C.</strong> 条件覆盖</li><li><strong>D.</strong> 边界值分析</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验三课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 等价类划分</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验三课后练习 课后练习（计入总分） SINGLE 若有一个计算类型的程序，它的输入量只有&amp;mdash;个X，其范围是[-1．0，1．0]，现从输入的角度考虑一组测试用例：-1.001，-1.0，1.0，1.001。设计这组测试用例的方法是 A. 边界值分析法 边界值分析法 等价分类法 条件覆盖法 错误推测法">
<div class="sqe-question">
<p class="sqe-question-title">题 16-11（单选）</p>
<p>若有一个计算类型的程序，它的输入量只有&amp;mdash;个X，其范围是[-1．0，1．0]，现从输入的角度考虑一组测试用例：-1.001，-1.0，1.0，1.001。设计这组测试用例的方法是</p>
<ul class="sqe-options"><li><strong>A.</strong> 边界值分析法</li><li><strong>B.</strong> 等价分类法</li><li><strong>C.</strong> 条件覆盖法</li><li><strong>D.</strong> 错误推测法</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验三课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 边界值分析法</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验三课后练习 课后练习（计入总分） SINGLE 白盒测试、灰盒测试和黑盒测试都是常用的系统测试方法。其中，_____也称功能测试或数据驱动测试，它是已知产品所应具有的功能，通过测试来检测每个功能是否都能正常使用。 A. 黑盒测试 黑盒测试 都不对 白盒测试 灰盒测试">
<div class="sqe-question">
<p class="sqe-question-title">题 16-12（单选）</p>
<p>白盒测试、灰盒测试和黑盒测试都是常用的系统测试方法。其中，_____也称功能测试或数据驱动测试，它是已知产品所应具有的功能，通过测试来检测每个功能是否都能正常使用。</p>
<ul class="sqe-options"><li><strong>A.</strong> 黑盒测试</li><li><strong>B.</strong> 都不对</li><li><strong>C.</strong> 白盒测试</li><li><strong>D.</strong> 灰盒测试</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验三课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 黑盒测试</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验三课后练习 课后练习（计入总分） SINGLE 用边界值分析法，假定1&lt;X&lt;100，那么整数X在测试中应取的边界值不包括 D. X=0，X=101 X=3，X=98 X=1，X=100 X=2，X=99 X=0，X=101">
<div class="sqe-question">
<p class="sqe-question-title">题 16-13（单选）</p>
<p>用边界值分析法，假定1&lt;X&lt;100，那么整数X在测试中应取的边界值不包括</p>
<ul class="sqe-options"><li><strong>A.</strong> X=3，X=98</li><li><strong>B.</strong> X=1，X=100</li><li><strong>C.</strong> X=2，X=99</li><li><strong>D.</strong> X=0，X=101</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验三课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>D. X=0，X=101</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验三课后练习 课后练习（计入总分） SINGLE 在确定黑盒测试策略时，优先选用的方法是 B. 等价类划分 边界值分析法 等价类划分 错误推断法 决策表方法">
<div class="sqe-question">
<p class="sqe-question-title">题 16-14（单选）</p>
<p>在确定黑盒测试策略时，优先选用的方法是</p>
<ul class="sqe-options"><li><strong>A.</strong> 边界值分析法</li><li><strong>B.</strong> 等价类划分</li><li><strong>C.</strong> 错误推断法</li><li><strong>D.</strong> 决策表方法</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验三课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>B. 等价类划分</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验三课后练习 课后练习（计入总分） SINGLE _____方法根据输出对输入的依赖关系设计测试用例。 A. 因果图 因果图 等价类 路径测试 归纳测试">
<div class="sqe-question">
<p class="sqe-question-title">题 16-15（单选）</p>
<p>_____方法根据输出对输入的依赖关系设计测试用例。</p>
<ul class="sqe-options"><li><strong>A.</strong> 因果图</li><li><strong>B.</strong> 等价类</li><li><strong>C.</strong> 路径测试</li><li><strong>D.</strong> 归纳测试</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验三课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 因果图</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验三课后练习 课后练习（计入总分） SINGLE &amp;zwj;自动化黑盒测试工具中，脚本录制好后，只要执行脚本，就可以把测试过程重做一遍，这被称为 D. 回放 重播 录制 复制 回放">
<div class="sqe-question">
<p class="sqe-question-title">题 16-16（单选）</p>
<p>&amp;zwj;自动化黑盒测试工具中，脚本录制好后，只要执行脚本，就可以把测试过程重做一遍，这被称为</p>
<ul class="sqe-options"><li><strong>A.</strong> 重播</li><li><strong>B.</strong> 录制</li><li><strong>C.</strong> 复制</li><li><strong>D.</strong> 回放</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验三课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>D. 回放</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验三课后练习 课后练习（计入总分） SINGLE 在自动化黑盒测试工具中，通过录制来得到_____，可以减少工作量。 D. 测试脚本 测试文件 测试数据 测试设计 测试脚本">
<div class="sqe-question">
<p class="sqe-question-title">题 16-17（单选）</p>
<p>在自动化黑盒测试工具中，通过录制来得到_____，可以减少工作量。</p>
<ul class="sqe-options"><li><strong>A.</strong> 测试文件</li><li><strong>B.</strong> 测试数据</li><li><strong>C.</strong> 测试设计</li><li><strong>D.</strong> 测试脚本</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验三课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>D. 测试脚本</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验三课后练习 课后练习（计入总分） SINGLE _____可以让并不熟悉脚本语言的软件测试人员也可以方便的得到测试脚本。 A. 录制技术 录制技术 数据验证点技术 回放技术 数据驱动技术">
<div class="sqe-question">
<p class="sqe-question-title">题 16-18（单选）</p>
<p>_____可以让并不熟悉脚本语言的软件测试人员也可以方便的得到测试脚本。</p>
<ul class="sqe-options"><li><strong>A.</strong> 录制技术</li><li><strong>B.</strong> 数据验证点技术</li><li><strong>C.</strong> 回放技术</li><li><strong>D.</strong> 数据驱动技术</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验三课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 录制技术</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验三课后练习 课后练习（计入总分） SINGLE 对于业务流清晰的系统可以利用_____贯穿整个测试用例设计过程并在用例中综合使用各种测试方法。 C. 场景法 正交试验法 等价类划分 场景法 因果图法">
<div class="sqe-question">
<p class="sqe-question-title">题 16-19（单选）</p>
<p>对于业务流清晰的系统可以利用_____贯穿整个测试用例设计过程并在用例中综合使用各种测试方法。</p>
<ul class="sqe-options"><li><strong>A.</strong> 正交试验法</li><li><strong>B.</strong> 等价类划分</li><li><strong>C.</strong> 场景法</li><li><strong>D.</strong> 因果图法</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验三课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>C. 场景法</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验三课后练习 课后练习（计入总分） SINGLE 黑盒测试技术中不包括 D. 逻辑覆盖 边界值分析 错误推测法 等价类划分 逻辑覆盖">
<div class="sqe-question">
<p class="sqe-question-title">题 16-20（单选）</p>
<p>黑盒测试技术中不包括</p>
<ul class="sqe-options"><li><strong>A.</strong> 边界值分析</li><li><strong>B.</strong> 错误推测法</li><li><strong>C.</strong> 等价类划分</li><li><strong>D.</strong> 逻辑覆盖</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验三课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>D. 逻辑覆盖</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验三课后练习 课后练习（计入总分） SINGLE 凭经验或直觉推测可能的错误，列出程序中可能有的错误和容易发生错误的特殊情况，选择测试用例的测试方法叫 A. 错误推测法 错误推测法 等价类划分 边界值分析 逻辑覆盖测试">
<div class="sqe-question">
<p class="sqe-question-title">题 16-21（单选）</p>
<p>凭经验或直觉推测可能的错误，列出程序中可能有的错误和容易发生错误的特殊情况，选择测试用例的测试方法叫</p>
<ul class="sqe-options"><li><strong>A.</strong> 错误推测法</li><li><strong>B.</strong> 等价类划分</li><li><strong>C.</strong> 边界值分析</li><li><strong>D.</strong> 逻辑覆盖测试</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验三课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 错误推测法</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验三课后练习 课后练习（计入总分） SINGLE 在确定黑盒测试策略时，优先选用的方法是 D. 等价类划分 边界值分析法 决策表方法 错误推断法 等价类划分">
<div class="sqe-question">
<p class="sqe-question-title">题 16-22（单选）</p>
<p>在确定黑盒测试策略时，优先选用的方法是</p>
<ul class="sqe-options"><li><strong>A.</strong> 边界值分析法</li><li><strong>B.</strong> 决策表方法</li><li><strong>C.</strong> 错误推断法</li><li><strong>D.</strong> 等价类划分</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验三课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>D. 等价类划分</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验三课后练习 课后练习（计入总分） SINGLE 在某大学学籍管理信息系统中，假设学生年龄的输入范围为16-40，则根据黑盒测试中的等价类划分技术，下面划分正确的是 B. 可划分为1个有效等价类，2个无效等价类 可划分为2个有效等价类，1个无效等价类 可划分为1个有效等价类，2个无效等价类 可划分为2个有效等价类，2个无效等价类 可划分为1个有效等价类，1个无效等价类">
<div class="sqe-question">
<p class="sqe-question-title">题 16-23（单选）</p>
<p>在某大学学籍管理信息系统中，假设学生年龄的输入范围为16-40，则根据黑盒测试中的等价类划分技术，下面划分正确的是</p>
<ul class="sqe-options"><li><strong>A.</strong> 可划分为2个有效等价类，1个无效等价类</li><li><strong>B.</strong> 可划分为1个有效等价类，2个无效等价类</li><li><strong>C.</strong> 可划分为2个有效等价类，2个无效等价类</li><li><strong>D.</strong> 可划分为1个有效等价类，1个无效等价类</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验三课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>B. 可划分为1个有效等价类，2个无效等价类</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验三课后练习 课后练习（计入总分） SINGLE 黑盒测试法是根据产品的_______来设计测试用例的。 A. 功能 功能 输入数据 应用范围 内部逻辑">
<div class="sqe-question">
<p class="sqe-question-title">题 16-24（单选）</p>
<p>黑盒测试法是根据产品的_______来设计测试用例的。</p>
<ul class="sqe-options"><li><strong>A.</strong> 功能</li><li><strong>B.</strong> 输入数据</li><li><strong>C.</strong> 应用范围</li><li><strong>D.</strong> 内部逻辑</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验三课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 功能</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验三课后练习 课后练习（计入总分） SINGLE ______方法是根据输出对输入的依赖关系来设计测试用例的。 C. 因果图法 边界值分析 等价类 因果图法 错误推测法">
<div class="sqe-question">
<p class="sqe-question-title">题 16-25（单选）</p>
<p>______方法是根据输出对输入的依赖关系来设计测试用例的。</p>
<ul class="sqe-options"><li><strong>A.</strong> 边界值分析</li><li><strong>B.</strong> 等价类</li><li><strong>C.</strong> 因果图法</li><li><strong>D.</strong> 错误推测法</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验三课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>C. 因果图法</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验三课后练习 课后练习（计入总分） SINGLE 黑盒测试是通过软件的外部表现来发现软件缺陷和错误的测试方法，具体地说，黑盒测试用例设计技术包括 _____等。 A. 等价类划分法、因果图法、边界值分析法、错误推测法、判定表驱动法 等价类划分法、因果图法、边界值分析法、错误推测法、判定表驱动法 等价类划分法、因果图法、边界值分析法、正交试验法、符号法 等价类划分法、因果图法、边界值分析法、功能图法、基本路径法 等价类划分法、因果图法、边界值分析法、静态质量度量法、场景法">
<div class="sqe-question">
<p class="sqe-question-title">题 16-26（单选）</p>
<p>黑盒测试是通过软件的外部表现来发现软件缺陷和错误的测试方法，具体地说，黑盒测试用例设计技术包括 _____等。</p>
<ul class="sqe-options"><li><strong>A.</strong> 等价类划分法、因果图法、边界值分析法、错误推测法、判定表驱动法</li><li><strong>B.</strong> 等价类划分法、因果图法、边界值分析法、正交试验法、符号法</li><li><strong>C.</strong> 等价类划分法、因果图法、边界值分析法、功能图法、基本路径法</li><li><strong>D.</strong> 等价类划分法、因果图法、边界值分析法、静态质量度量法、场景法</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验三课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 等价类划分法、因果图法、边界值分析法、错误推测法、判定表驱动法</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验三课后练习 课后练习（计入总分） SINGLE 下列叙述不正确的是______ B. 判定表驱动法属于白盒测试方法 黑盒测试法注重于测试软件的功能需求 判定表驱动法属于白盒测试方法 黑盒测试避免盲目测试提高测试效率 测试案例的使用使软件测试实施重点突出，目的明确">
<div class="sqe-question">
<p class="sqe-question-title">题 16-27（单选）</p>
<p>下列叙述不正确的是______</p>
<ul class="sqe-options"><li><strong>A.</strong> 黑盒测试法注重于测试软件的功能需求</li><li><strong>B.</strong> 判定表驱动法属于白盒测试方法</li><li><strong>C.</strong> 黑盒测试避免盲目测试提高测试效率</li><li><strong>D.</strong> 测试案例的使用使软件测试实施重点突出，目的明确</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验三课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>B. 判定表驱动法属于白盒测试方法</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验三课后练习 课后练习（计入总分） SINGLE 描述黑盒测试的说法错误的是______。 B. 因果图法不属于黑盒测试用例设计方法 黑盒测试一般需要测试工具的帮助 因果图法不属于黑盒测试用例设计方法 黑盒测试中的边界值分析方法是对等价类划分方法的补充 黑盒测试测试全部使用场景的外部接口">
<div class="sqe-question">
<p class="sqe-question-title">题 16-28（单选）</p>
<p>描述黑盒测试的说法错误的是______。</p>
<ul class="sqe-options"><li><strong>A.</strong> 黑盒测试一般需要测试工具的帮助</li><li><strong>B.</strong> 因果图法不属于黑盒测试用例设计方法</li><li><strong>C.</strong> 黑盒测试中的边界值分析方法是对等价类划分方法的补充</li><li><strong>D.</strong> 黑盒测试测试全部使用场景的外部接口</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验三课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>B. 因果图法不属于黑盒测试用例设计方法</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验三课后练习 课后练习（计入总分） SINGLE 设计测试用例时候，_____是用得最多的一种黑盒测试方法。 C. 边界值分析 因果图 等价类划分 边界值分析 错误推测">
<div class="sqe-question">
<p class="sqe-question-title">题 16-29（单选）</p>
<p>设计测试用例时候，_____是用得最多的一种黑盒测试方法。</p>
<ul class="sqe-options"><li><strong>A.</strong> 因果图</li><li><strong>B.</strong> 等价类划分</li><li><strong>C.</strong> 边界值分析</li><li><strong>D.</strong> 错误推测</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验三课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>C. 边界值分析</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验三课后练习 课后练习（计入总分） TF 由于函数覆盖率是基于代码的，所以也可以把函数覆盖归入黑盒测试的范畴。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 16-30（判断）</p>
<p>由于函数覆盖率是基于代码的，所以也可以把函数覆盖归入黑盒测试的范畴。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验三课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验三课后练习 课后练习（计入总分） TF 黑盒测试的测试用例是根据程序内部逻辑设计的。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 16-31（判断）</p>
<p>黑盒测试的测试用例是根据程序内部逻辑设计的。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验三课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验三课后练习 课后练习（计入总分） SINGLE 动态黑盒测试 __________。 D. 测试的是软件在使用过程中的实际行为 直接测试底层功能、过程、子程序和库 可估算执行测试时代码量和具体代码 从软件获得读取变量和状态信息的访问权 测试的是软件在使用过程中的实际行为">
<div class="sqe-question">
<p class="sqe-question-title">题 16-32（单选）</p>
<p>动态黑盒测试 __________。</p>
<ul class="sqe-options"><li><strong>A.</strong> 直接测试底层功能、过程、子程序和库</li><li><strong>B.</strong> 可估算执行测试时代码量和具体代码</li><li><strong>C.</strong> 从软件获得读取变量和状态信息的访问权</li><li><strong>D.</strong> 测试的是软件在使用过程中的实际行为</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验三课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>D. 测试的是软件在使用过程中的实际行为</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验三课后练习 课后练习（计入总分） SINGLE 下列不属于黑盒测试方法的是_______。 D. 变异测试 等价类划分 状态测试 边界值分析 变异测试">
<div class="sqe-question">
<p class="sqe-question-title">题 16-33（单选）</p>
<p>下列不属于黑盒测试方法的是_______。</p>
<ul class="sqe-options"><li><strong>A.</strong> 等价类划分</li><li><strong>B.</strong> 状态测试</li><li><strong>C.</strong> 边界值分析</li><li><strong>D.</strong> 变异测试</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>实验三课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>D. 变异测试</p></div></details></div>
</article>
</section>

<section id="quiz-17" class="sqe-chapter">
<div class="sqe-chapter-head">
<span class="sqe-number">17</span>
<div><small>课后练习（计入总分） · 云班课 QUIZ</small><h3>第六章课后练习</h3><div><span class="sqe-source-pill">题目接口直接导出</span><span class="sqe-source-pill">28 道题</span></div></div>
</div>

<article class="sqe-card" data-sqe-card data-sqe-text="第六章课后练习 课后练习（计入总分） TF 发现缺陷的平均成本不应该超过该缺陷遗留给客户的商业成本。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 17-01（判断）</p>
<p>发现缺陷的平均成本不应该超过该缺陷遗留给客户的商业成本。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第六章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第六章课后练习 课后练习（计入总分） TF 评审报告可以看作是评审会结束的标志。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 17-02（判断）</p>
<p>评审报告可以看作是评审会结束的标志。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第六章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第六章课后练习 课后练习（计入总分） MULTI 评审会议的主要步骤如下 A. 由评审员/作者进行演示或说明；B. 评审员会就不清楚或疑惑的地方与作者进行沟通；C. 协调人或记录员在会议过程中完成会议记录 由评审员/作者进行演示或说明 评审员会就不清楚或疑惑的地方与作者进行沟通 协调人或记录员在会议过程中完成会议记录 分析评审结果">
<div class="sqe-question">
<p class="sqe-question-title">题 17-03（多选）</p>
<p>评审会议的主要步骤如下</p>
<ul class="sqe-options"><li><strong>A.</strong> 由评审员/作者进行演示或说明</li><li><strong>B.</strong> 评审员会就不清楚或疑惑的地方与作者进行沟通</li><li><strong>C.</strong> 协调人或记录员在会议过程中完成会议记录</li><li><strong>D.</strong> 分析评审结果</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第六章课后练习</span><span>多选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 由评审员/作者进行演示或说明；B. 评审员会就不清楚或疑惑的地方与作者进行沟通；C. 协调人或记录员在会议过程中完成会议记录</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第六章课后练习 课后练习（计入总分） MULTI 以下哪些资料应当评审 A. 基础性和早期的文档；B. 与重大决策有关的文档；C. 对如何做没有把握部分相关的文档；D. 不断被重复使用部件相关的文档 基础性和早期的文档 与重大决策有关的文档 对如何做没有把握部分相关的文档 不断被重复使用部件相关的文档">
<div class="sqe-question">
<p class="sqe-question-title">题 17-04（多选）</p>
<p>以下哪些资料应当评审</p>
<ul class="sqe-options"><li><strong>A.</strong> 基础性和早期的文档</li><li><strong>B.</strong> 与重大决策有关的文档</li><li><strong>C.</strong> 对如何做没有把握部分相关的文档</li><li><strong>D.</strong> 不断被重复使用部件相关的文档</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第六章课后练习</span><span>多选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 基础性和早期的文档；B. 与重大决策有关的文档；C. 对如何做没有把握部分相关的文档；D. 不断被重复使用部件相关的文档</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第六章课后练习 课后练习（计入总分） MULTI 对评审组长的要求如下 A. 善于制定和执行评审计划；B. 评审是公平、公正的；C. 具有丰富的技术技能和知识；D. 积极带领评审组员按时保质的完成评审任务 善于制定和执行评审计划 评审是公平、公正的 具有丰富的技术技能和知识 积极带领评审组员按时保质的完成评审任务">
<div class="sqe-question">
<p class="sqe-question-title">题 17-05（多选）</p>
<p>对评审组长的要求如下</p>
<ul class="sqe-options"><li><strong>A.</strong> 善于制定和执行评审计划</li><li><strong>B.</strong> 评审是公平、公正的</li><li><strong>C.</strong> 具有丰富的技术技能和知识</li><li><strong>D.</strong> 积极带领评审组员按时保质的完成评审任务</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第六章课后练习</span><span>多选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 善于制定和执行评审计划；B. 评审是公平、公正的；C. 具有丰富的技术技能和知识；D. 积极带领评审组员按时保质的完成评审任务</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第六章课后练习 课后练习（计入总分） TF 规则集列出了容易出现的典型错误，是评审的一个重要组成部分。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 17-06（判断）</p>
<p>规则集列出了容易出现的典型错误，是评审的一个重要组成部分。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第六章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第六章课后练习 课后练习（计入总分） FILL 评审的方法包括 （填空1） 、 （填空2） 、 （填空3） 、 （填空4） 、 （填空5） 填空1: 临时评审；填空2: 轮查；填空3: 走查；填空4: 小组评审；填空5: 审查 ">
<div class="sqe-question">
<p class="sqe-question-title">题 17-07（填空）</p>
<p>评审的方法包括 （填空1） 、 （填空2） 、 （填空3） 、 （填空4） 、 （填空5）</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第六章课后练习</span><span>填空</span><span>5 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 临时评审；填空2: 轮查；填空3: 走查；填空4: 小组评审；填空5: 审查</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第六章课后练习 课后练习（计入总分） MULTI 过程评审作用如下： A. 评估主要的质量保证流程；B. 考虑如何处理和解决评审过程中发现的不符合问题；C. 总结和共享好的经验；D. 指出需要进一步完善和改进的部分 评估主要的质量保证流程 考虑如何处理和解决评审过程中发现的不符合问题 总结和共享好的经验 指出需要进一步完善和改进的部分">
<div class="sqe-question">
<p class="sqe-question-title">题 17-08（多选）</p>
<p>过程评审作用如下：</p>
<ul class="sqe-options"><li><strong>A.</strong> 评估主要的质量保证流程</li><li><strong>B.</strong> 考虑如何处理和解决评审过程中发现的不符合问题</li><li><strong>C.</strong> 总结和共享好的经验</li><li><strong>D.</strong> 指出需要进一步完善和改进的部分</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第六章课后练习</span><span>多选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 评估主要的质量保证流程；B. 考虑如何处理和解决评审过程中发现的不符合问题；C. 总结和共享好的经验；D. 指出需要进一步完善和改进的部分</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第六章课后练习 课后练习（计入总分） TF 程评审的评审对象是质量保证流程，以及针对产品质量或其他形式的工作产出。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 17-09（判断）</p>
<p>程评审的评审对象是质量保证流程，以及针对产品质量或其他形式的工作产出。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第六章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第六章课后练习 课后练习（计入总分） MULTI 过程评审是 A. 对软件开发过程的评审；B. 通过对流程的监控，保证SQA组织定义的软件过程在项目中得到了遵循；C. 保证质量保证方针能得到更快更好的执行 对软件开发过程的评审 通过对流程的监控，保证SQA组织定义的软件过程在项目中得到了遵循 保证质量保证方针能得到更快更好的执行 出现异常情况时，系统如何响应">
<div class="sqe-question">
<p class="sqe-question-title">题 17-10（多选）</p>
<p>过程评审是</p>
<ul class="sqe-options"><li><strong>A.</strong> 对软件开发过程的评审</li><li><strong>B.</strong> 通过对流程的监控，保证SQA组织定义的软件过程在项目中得到了遵循</li><li><strong>C.</strong> 保证质量保证方针能得到更快更好的执行</li><li><strong>D.</strong> 出现异常情况时，系统如何响应</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第六章课后练习</span><span>多选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 对软件开发过程的评审；B. 通过对流程的监控，保证SQA组织定义的软件过程在项目中得到了遵循；C. 保证质量保证方针能得到更快更好的执行</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第六章课后练习 课后练习（计入总分） TF 文档评审分为格式评审和内容评审。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 17-11（判断）</p>
<p>文档评审分为格式评审和内容评审。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第六章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第六章课后练习 课后练习（计入总分） MULTI 技术评审作为一项软件质量保证活动，作用如下： A. 揭示软件在逻辑、执行以及功能和函数上的错误；B. 验证软件是否符合需求；C. 确保软件的一致性 揭示软件在逻辑、执行以及功能和函数上的错误 验证软件是否符合需求 确保软件的一致性 确保使用的术语具有唯一性">
<div class="sqe-question">
<p class="sqe-question-title">题 17-12（多选）</p>
<p>技术评审作为一项软件质量保证活动，作用如下：</p>
<ul class="sqe-options"><li><strong>A.</strong> 揭示软件在逻辑、执行以及功能和函数上的错误</li><li><strong>B.</strong> 验证软件是否符合需求</li><li><strong>C.</strong> 确保软件的一致性</li><li><strong>D.</strong> 确保使用的术语具有唯一性</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第六章课后练习</span><span>多选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 揭示软件在逻辑、执行以及功能和函数上的错误；B. 验证软件是否符合需求；C. 确保软件的一致性</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第六章课后练习 课后练习（计入总分） TF 管理评审是对产品以及各阶段的输出内容进行评估。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 17-13（判断）</p>
<p>管理评审是对产品以及各阶段的输出内容进行评估。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第六章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第六章课后练习 课后练习（计入总分） FILL 管理评审要求各部门对管理体系目前的状况，包括 （填空1） 性、 （填空2） 性、 （填空3） 性等进行评审。 填空1: 适宜；填空2: 有效；填空3: 充分 ">
<div class="sqe-question">
<p class="sqe-question-title">题 17-14（填空）</p>
<p>管理评审要求各部门对管理体系目前的状况，包括 （填空1） 性、 （填空2） 性、 （填空3） 性等进行评审。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第六章课后练习</span><span>填空</span><span>3 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 适宜；填空2: 有效；填空3: 充分</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第六章课后练习 课后练习（计入总分） MULTI 评审小组一般由以下角色构成 A. 协调人；C. 作者；D. 评审员 协调人 SQA人员 作者 评审员">
<div class="sqe-question">
<p class="sqe-question-title">题 17-15（多选）</p>
<p>评审小组一般由以下角色构成</p>
<ul class="sqe-options"><li><strong>A.</strong> 协调人</li><li><strong>B.</strong> SQA人员</li><li><strong>C.</strong> 作者</li><li><strong>D.</strong> 评审员</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第六章课后练习</span><span>多选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 协调人；C. 作者；D. 评审员</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第六章课后练习 课后练习（计入总分） MULTI 评审可以帮助开发工程师 A. 减少修订缺陷的时间；B. 提高编程效率；D. 减少测试和调试时间 减少修订缺陷的时间 提高编程效率 增强产品的可维护性 减少测试和调试时间">
<div class="sqe-question">
<p class="sqe-question-title">题 17-16（多选）</p>
<p>评审可以帮助开发工程师</p>
<ul class="sqe-options"><li><strong>A.</strong> 减少修订缺陷的时间</li><li><strong>B.</strong> 提高编程效率</li><li><strong>C.</strong> 增强产品的可维护性</li><li><strong>D.</strong> 减少测试和调试时间</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第六章课后练习</span><span>多选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 减少修订缺陷的时间；B. 提高编程效率；D. 减少测试和调试时间</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第六章课后练习 课后练习（计入总分） TF 管理者、开发人员、客户有时都反对评审，因为评审会浪费时间，减缓项目的进度。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 17-17（判断）</p>
<p>管理者、开发人员、客户有时都反对评审，因为评审会浪费时间，减缓项目的进度。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第六章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第六章课后练习 课后练习（计入总分） TF 评审是对软件元素或者项目状态的一种评估手段。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 17-18（判断）</p>
<p>评审是对软件元素或者项目状态的一种评估手段。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第六章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第六章课后练习 课后练习（计入总分） TF 评审是质量控制方面一种非常有效的方法。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 17-19（判断）</p>
<p>评审是质量控制方面一种非常有效的方法。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第六章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第六章课后练习 课后练习（计入总分） TF 同行评审的主要目标在于检测错误、核对与标准的偏离。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 17-20（判断）</p>
<p>同行评审的主要目标在于检测错误、核对与标准的偏离。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第六章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第六章课后练习 课后练习（计入总分） SINGLE 软件评审作为质量控制的一个重要手段，已经被业界广泛使用。评审分为内部评审和外部评审。关于内部评审的叙述，正确的包括。①对软件的每个开发阶段都要进行内部评审②评审人员由软件开发组、质量管理和配置管理人员组成，可邀请用户参与③评审人数根据实际情况确定，比如根据软件的规模等级和安全性等级等指标而定④内部评审由用户单位主持，由信息系统建设单位组织，应成立评审委员会 B. ①②③ ①②④ ①②③ ②③④ ①②③④">
<div class="sqe-question">
<p class="sqe-question-title">题 17-21（单选）</p>
<p>软件评审作为质量控制的一个重要手段，已经被业界广泛使用。评审分为内部评审和外部评审。关于内部评审的叙述，正确的包括。①对软件的每个开发阶段都要进行内部评审②评审人员由软件开发组、质量管理和配置管理人员组成，可邀请用户参与③评审人数根据实际情况确定，比如根据软件的规模等级和安全性等级等指标而定④内部评审由用户单位主持，由信息系统建设单位组织，应成立评审委员会</p>
<ul class="sqe-options"><li><strong>A.</strong> ①②④</li><li><strong>B.</strong> ①②③</li><li><strong>C.</strong> ②③④</li><li><strong>D.</strong> ①②③④</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第六章课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>B. ①②③</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第六章课后练习 课后练习（计入总分） FILL 管理评审由 （填空1） 发起。 填空1: 最高管理者 ">
<div class="sqe-question">
<p class="sqe-question-title">题 17-22（填空）</p>
<p>管理评审由 （填空1） 发起。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第六章课后练习</span><span>填空</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 最高管理者</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第六章课后练习 课后练习（计入总分） TF 代码评审是检查源代码是否达到模块设计的要求。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 17-23（判断）</p>
<p>代码评审是检查源代码是否达到模块设计的要求。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第六章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第六章课后练习 课后练习（计入总分） TF 技术评审即是一种技术手段，也是一种质量管理手段。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 17-24（判断）</p>
<p>技术评审即是一种技术手段，也是一种质量管理手段。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第六章课后练习</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第六章课后练习 课后练习（计入总分） MULTI 在软件设计中，设计复审是和软件设计本身一样重要的环节，其主要的目的和作用是为了能够____________ B. 避免后期付出高代价 减少测试工作量 避免后期付出高代价 保证软件质量 缩短软件开发周期">
<div class="sqe-question">
<p class="sqe-question-title">题 17-25（多选）</p>
<p>在软件设计中，设计复审是和软件设计本身一样重要的环节，其主要的目的和作用是为了能够____________</p>
<ul class="sqe-options"><li><strong>A.</strong> 减少测试工作量</li><li><strong>B.</strong> 避免后期付出高代价</li><li><strong>C.</strong> 保证软件质量</li><li><strong>D.</strong> 缩短软件开发周期</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第六章课后练习</span><span>多选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>B. 避免后期付出高代价</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第六章课后练习 课后练习（计入总分） MULTI 软件测试计划评审会需要哪些人员参加____________？ A. 项目经理；B. SQA 负责人；C. 配置负责人；D. 测试组 项目经理 SQA 负责人 配置负责人 测试组">
<div class="sqe-question">
<p class="sqe-question-title">题 17-26（多选）</p>
<p>软件测试计划评审会需要哪些人员参加____________？</p>
<ul class="sqe-options"><li><strong>A.</strong> 项目经理</li><li><strong>B.</strong> SQA 负责人</li><li><strong>C.</strong> 配置负责人</li><li><strong>D.</strong> 测试组</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第六章课后练习</span><span>多选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 项目经理；B. SQA 负责人；C. 配置负责人；D. 测试组</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第六章课后练习 课后练习（计入总分） SINGLE 在软件设计中，设计复审是和软件设计本身一样重要的环节，其主要的目的和作用是为了能够______。 B. 避免后期付出高代价 减少测试工作量 避免后期付出高代价 保证软件质量 缩短软件开发周期">
<div class="sqe-question">
<p class="sqe-question-title">题 17-27（单选）</p>
<p>在软件设计中，设计复审是和软件设计本身一样重要的环节，其主要的目的和作用是为了能够______。</p>
<ul class="sqe-options"><li><strong>A.</strong> 减少测试工作量</li><li><strong>B.</strong> 避免后期付出高代价</li><li><strong>C.</strong> 保证软件质量</li><li><strong>D.</strong> 缩短软件开发周期</li></ul>
<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第六章课后练习</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>B. 避免后期付出高代价</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第六章课后练习 课后练习（计入总分） FILL 评审的方法包括 （填空1） 、 （填空2） 、 （填空3） 、 （填空4） 、 （填空5） 。 填空1: 临时评审；填空2: 轮查；填空3: 走查；填空4: 小组评审；填空5: 审查 ">
<div class="sqe-question">
<p class="sqe-question-title">题 17-28（填空）</p>
<p>评审的方法包括 （填空1） 、 （填空2） 、 （填空3） 、 （填空4） 、 （填空5） 。</p>

<div class="sqe-meta"><span>课后练习（计入总分）</span><span>第六章课后练习</span><span>填空</span><span>5 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 临时评审；填空2: 轮查；填空3: 走查；填空4: 小组评审；填空5: 审查</p></div></details></div>
</article>
</section>

<section id="quiz-18" class="sqe-chapter">
<div class="sqe-chapter-head">
<span class="sqe-number">18</span>
<div><small>课上测试（计入总分） · 云班课 QUIZ</small><h3>第一章课上测试</h3><div><span class="sqe-source-pill">题目接口直接导出</span><span class="sqe-source-pill">10 道题</span></div></div>
</div>

<article class="sqe-card" data-sqe-card data-sqe-text="第一章课上测试 课上测试（计入总分） FILL 质量是 （填空1） 、 （填空2） 或 （填空3） 满足客户或用户明确需求或期望的不同程度。 填空1: 系统；填空2: 部件；填空3: 过程 ">
<div class="sqe-question">
<p class="sqe-question-title">题 18-01（填空）</p>
<p>质量是 （填空1） 、 （填空2） 或 （填空3） 满足客户或用户明确需求或期望的不同程度。</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第一章课上测试</span><span>填空</span><span>3 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 系统；填空2: 部件；填空3: 过程</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第一章课上测试 课上测试（计入总分） MULTI 质量管理是指在质量方面（ ）和（ ）组织的协调的活动 B. 指挥；C. 控制 策划 指挥 控制 制定">
<div class="sqe-question">
<p class="sqe-question-title">题 18-02（多选）</p>
<p>质量管理是指在质量方面（ ）和（ ）组织的协调的活动</p>
<ul class="sqe-options"><li><strong>A.</strong> 策划</li><li><strong>B.</strong> 指挥</li><li><strong>C.</strong> 控制</li><li><strong>D.</strong> 制定</li></ul>
<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第一章课上测试</span><span>多选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>B. 指挥；C. 控制</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第一章课上测试 课上测试（计入总分） TF 质量改进是质量管理的一部分，致力于增强满足质量要求的能力  ">
<div class="sqe-question">
<p class="sqe-question-title">题 18-03（判断）</p>
<p>质量改进是质量管理的一部分，致力于增强满足质量要求的能力</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第一章课上测试</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第一章课上测试 课上测试（计入总分） TF 质量特性是指产品、过程或体系与标准有关的固有特性。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 18-04（判断）</p>
<p>质量特性是指产品、过程或体系与标准有关的固有特性。</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第一章课上测试</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第一章课上测试 课上测试（计入总分） MULTI 质量管理体系可以（ ） A. 帮助组织实现顾客满意；B. 为组织提供实现持续改进的框架；C. 向顾客提供信任 帮助组织实现顾客满意 为组织提供实现持续改进的框架 向顾客提供信任 使管理过程标准化">
<div class="sqe-question">
<p class="sqe-question-title">题 18-05（多选）</p>
<p>质量管理体系可以（ ）</p>
<ul class="sqe-options"><li><strong>A.</strong> 帮助组织实现顾客满意</li><li><strong>B.</strong> 为组织提供实现持续改进的框架</li><li><strong>C.</strong> 向顾客提供信任</li><li><strong>D.</strong> 使管理过程标准化</li></ul>
<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第一章课上测试</span><span>多选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 帮助组织实现顾客满意；B. 为组织提供实现持续改进的框架；C. 向顾客提供信任</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第一章课上测试 课上测试（计入总分） TF 质量管理体系是为实现质量方针和质量目标而建立的管理工作系统  ">
<div class="sqe-question">
<p class="sqe-question-title">题 18-06（判断）</p>
<p>质量管理体系是为实现质量方针和质量目标而建立的管理工作系统</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第一章课上测试</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第一章课上测试 课上测试（计入总分） TF 珍视顾客抱怨，把它作为我们研发产品、改善质量、提升服务的动力源泉  ">
<div class="sqe-question">
<p class="sqe-question-title">题 18-07（判断）</p>
<p>珍视顾客抱怨，把它作为我们研发产品、改善质量、提升服务的动力源泉</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第一章课上测试</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第一章课上测试 课上测试（计入总分） TF 当生产过程处于受控制状态时，产品质量就不会波动  ">
<div class="sqe-question">
<p class="sqe-question-title">题 18-08（判断）</p>
<p>当生产过程处于受控制状态时，产品质量就不会波动</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第一章课上测试</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第一章课上测试 课上测试（计入总分） TF 质量管理是指在质量方面指挥和控制组织的协调的活动  ">
<div class="sqe-question">
<p class="sqe-question-title">题 18-09（判断）</p>
<p>质量管理是指在质量方面指挥和控制组织的协调的活动</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第一章课上测试</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第一章课上测试 课上测试（计入总分） SINGLE 著名的质量管理专家朱兰提出的质量管理三步曲是指 （ ）。 C. 质量策划、质量控制、质量改进 质量保证、质量控制、质量改进 质量控制、质量保证、质量改进 质量策划、质量控制、质量改进 质量策划、 质量改进、质量保证">
<div class="sqe-question">
<p class="sqe-question-title">题 18-10（单选）</p>
<p>著名的质量管理专家朱兰提出的质量管理三步曲是指 （ ）。</p>
<ul class="sqe-options"><li><strong>A.</strong> 质量保证、质量控制、质量改进</li><li><strong>B.</strong> 质量控制、质量保证、质量改进</li><li><strong>C.</strong> 质量策划、质量控制、质量改进</li><li><strong>D.</strong> 质量策划、 质量改进、质量保证</li></ul>
<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第一章课上测试</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>C. 质量策划、质量控制、质量改进</p></div></details></div>
</article>
</section>

<section id="quiz-19" class="sqe-chapter">
<div class="sqe-chapter-head">
<span class="sqe-number">19</span>
<div><small>课上测试（计入总分） · 云班课 QUIZ</small><h3>第四章课上测试</h3><div><span class="sqe-source-pill">题目接口直接导出</span><span class="sqe-source-pill">10 道题</span></div></div>
</div>

<article class="sqe-card" data-sqe-card data-sqe-text="第四章课上测试 课上测试（计入总分） TF 质量是反映软件与需求相符程度的指标，而缺陷被认为是软件与需求不一致的某种表现。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 19-01（判断）</p>
<p>质量是反映软件与需求相符程度的指标，而缺陷被认为是软件与需求不一致的某种表现。</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第四章课上测试</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第四章课上测试 课上测试（计入总分） TF McCabe度量、语法构造方法只适合独立模块内部进行测量，不能考虑系统各个模块间相互耦合的关系。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 19-02（判断）</p>
<p>McCabe度量、语法构造方法只适合独立模块内部进行测量，不能考虑系统各个模块间相互耦合的关系。</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第四章课上测试</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第四章课上测试 课上测试（计入总分） FILL 语法构造方法计算缺陷率的公式是： （填空1） + （填空2） DO WHILE+ （填空3） SELECT+ （填空4） IF-THEN-ELSE 填空1: 0.15；填空2: 0.23；填空3: 0.22；填空4: 0.07 ">
<div class="sqe-question">
<p class="sqe-question-title">题 19-03（填空）</p>
<p>语法构造方法计算缺陷率的公式是： （填空1） + （填空2） DO WHILE+ （填空3） SELECT+ （填空4） IF-THEN-ELSE</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第四章课上测试</span><span>填空</span><span>4 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 0.15；填空2: 0.23；填空3: 0.22；填空4: 0.07</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第四章课上测试 课上测试（计入总分） FILL 软件质量度量按其研究对像可分为3类： （填空1） 质量度量、 （填空2） 质量度量、 （填空3） 质量度量。 填空1: 项目；填空2: 产品；填空3: 过程 ">
<div class="sqe-question">
<p class="sqe-question-title">题 19-04（填空）</p>
<p>软件质量度量按其研究对像可分为3类： （填空1） 质量度量、 （填空2） 质量度量、 （填空3） 质量度量。</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第四章课上测试</span><span>填空</span><span>3 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 项目；填空2: 产品；填空3: 过程</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第四章课上测试 课上测试（计入总分） TF 有效性差一般意味着测量方法在原则性上有错误。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 19-05（判断）</p>
<p>有效性差一般意味着测量方法在原则性上有错误。</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第四章课上测试</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第四章课上测试 课上测试（计入总分） TF 可靠性差一般意味着测量方法在技术上有待改进。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 19-06（判断）</p>
<p>可靠性差一般意味着测量方法在技术上有待改进。</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第四章课上测试</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第四章课上测试 课上测试（计入总分） FILL 课堂上提到的度量尺度包括 （填空1） 尺度、 （填空2）尺度 、 （填空3） 尺度、 （填空4） 尺度。 填空1: 分类；填空2: 序列；填空3: 间隔；填空4: 比值 ">
<div class="sqe-question">
<p class="sqe-question-title">题 19-07（填空）</p>
<p>课堂上提到的度量尺度包括 （填空1） 尺度、 （填空2）尺度 、 （填空3） 尺度、 （填空4） 尺度。</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第四章课上测试</span><span>填空</span><span>4 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 分类；填空2: 序列；填空3: 间隔；填空4: 比值</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第四章课上测试 课上测试（计入总分） SINGLE 假设在程序控制流图中，有14 条边，10个节点，则控制流程图的环路复杂性V(G)等于______。 C. 6 12 8 6 4">
<div class="sqe-question">
<p class="sqe-question-title">题 19-08（单选）</p>
<p>假设在程序控制流图中，有14 条边，10个节点，则控制流程图的环路复杂性V(G)等于______。</p>
<ul class="sqe-options"><li><strong>A.</strong> 12</li><li><strong>B.</strong> 8</li><li><strong>C.</strong> 6</li><li><strong>D.</strong> 4</li></ul>
<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第四章课上测试</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>C. 6</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第四章课上测试 课上测试（计入总分） SINGLE 修复软件缺陷费用最高的是 __________ 阶段。 D. 发布 编制说明书 设计 编写代码 发布">
<div class="sqe-question">
<p class="sqe-question-title">题 19-09（单选）</p>
<p>修复软件缺陷费用最高的是 __________ 阶段。</p>
<ul class="sqe-options"><li><strong>A.</strong> 编制说明书</li><li><strong>B.</strong> 设计</li><li><strong>C.</strong> 编写代码</li><li><strong>D.</strong> 发布</li></ul>
<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第四章课上测试</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>D. 发布</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第四章课上测试 课上测试（计入总分） FILL （填空1） 是对软件产品进行范围广泛的测度，它给出一个系统、构件或过程的某个给定属性的度的定量测量。 填空1: 度量 ">
<div class="sqe-question">
<p class="sqe-question-title">题 19-10（填空）</p>
<p>（填空1） 是对软件产品进行范围广泛的测度，它给出一个系统、构件或过程的某个给定属性的度的定量测量。</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第四章课上测试</span><span>填空</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 度量</p></div></details></div>
</article>
</section>

<section id="quiz-20" class="sqe-chapter">
<div class="sqe-chapter-head">
<span class="sqe-number">20</span>
<div><small>课上测试（计入总分） · 云班课 QUIZ</small><h3>第五章课上测试</h3><div><span class="sqe-source-pill">题目接口直接导出</span><span class="sqe-source-pill">9 道题</span></div></div>
</div>

<article class="sqe-card" data-sqe-card data-sqe-text="第五章课上测试 课上测试（计入总分） FILL CMMI的内容主要有3个级别： （填空1） 的、 （填空2） 的以及 （填空3） 的。 填空1: 必需；填空2: 期望；填空3: 提供信息 ">
<div class="sqe-question">
<p class="sqe-question-title">题 20-01（填空）</p>
<p>CMMI的内容主要有3个级别： （填空1） 的、 （填空2） 的以及 （填空3） 的。</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第五章课上测试</span><span>填空</span><span>3 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 必需；填空2: 期望；填空3: 提供信息</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第五章课上测试 课上测试（计入总分） TF 软件过程能力成熟度是指一个特定过程被明确定义、管理、测量、控制并且是有效的程度。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 20-02（判断）</p>
<p>软件过程能力成熟度是指一个特定过程被明确定义、管理、测量、控制并且是有效的程度。</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第五章课上测试</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第五章课上测试 课上测试（计入总分） TF 优化级说明已管理的过程，定义了评估软件过程和产品质量的度量。利用此度量对软件过程和产品做出推断和控制。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 20-03（判断）</p>
<p>优化级说明已管理的过程，定义了评估软件过程和产品质量的度量。利用此度量对软件过程和产品做出推断和控制。</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第五章课上测试</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第五章课上测试 课上测试（计入总分） TF 为了达到一个成熟度等级，必须实现该等级上的全部关键过程区域。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 20-04（判断）</p>
<p>为了达到一个成熟度等级，必须实现该等级上的全部关键过程区域。</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第五章课上测试</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第五章课上测试 课上测试（计入总分） FILL CMM将整个软件改进过程分为 （填空1） 、 （填空2） 、 （填空3） 、 （填空4） 、 （填空5） 等5个成熟度等级。 填空1: 初始级；填空2: 可重复级；填空3: 已定义级；填空4: 已管理级；填空5: 优化级 ">
<div class="sqe-question">
<p class="sqe-question-title">题 20-05（填空）</p>
<p>CMM将整个软件改进过程分为 （填空1） 、 （填空2） 、 （填空3） 、 （填空4） 、 （填空5） 等5个成熟度等级。</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第五章课上测试</span><span>填空</span><span>5 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 初始级；填空2: 可重复级；填空3: 已定义级；填空4: 已管理级；填空5: 优化级</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第五章课上测试 课上测试（计入总分） MULTI 软件设计需要注意哪些问题：____________ A. 减少耦合；C. 代码重用；D. 功能分解 减少耦合 考虑范围要窄 代码重用 功能分解">
<div class="sqe-question">
<p class="sqe-question-title">题 20-06（多选）</p>
<p>软件设计需要注意哪些问题：____________</p>
<ul class="sqe-options"><li><strong>A.</strong> 减少耦合</li><li><strong>B.</strong> 考虑范围要窄</li><li><strong>C.</strong> 代码重用</li><li><strong>D.</strong> 功能分解</li></ul>
<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第五章课上测试</span><span>多选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 减少耦合；C. 代码重用；D. 功能分解</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第五章课上测试 课上测试（计入总分） SINGLE 根据CMMI规范，每一个软件企业均具有_________成熟度。 A. 等级一 等级一 等级三 等级四 等级五">
<div class="sqe-question">
<p class="sqe-question-title">题 20-07（单选）</p>
<p>根据CMMI规范，每一个软件企业均具有_________成熟度。</p>
<ul class="sqe-options"><li><strong>A.</strong> 等级一</li><li><strong>B.</strong> 等级三</li><li><strong>C.</strong> 等级四</li><li><strong>D.</strong> 等级五</li></ul>
<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第五章课上测试</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 等级一</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第五章课上测试 课上测试（计入总分） SINGLE cmm 模型将软件过程的成熟度分为 5 个等级，在_____使用定量分析来不断地改进和管理软件过程。 B. 管理级 优化级 管理级 定义级 可重复级">
<div class="sqe-question">
<p class="sqe-question-title">题 20-08（单选）</p>
<p>cmm 模型将软件过程的成熟度分为 5 个等级，在_____使用定量分析来不断地改进和管理软件过程。</p>
<ul class="sqe-options"><li><strong>A.</strong> 优化级</li><li><strong>B.</strong> 管理级</li><li><strong>C.</strong> 定义级</li><li><strong>D.</strong> 可重复级</li></ul>
<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第五章课上测试</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>B. 管理级</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第五章课上测试 课上测试（计入总分） FILL CMM的意义不仅仅是对软件开发的过程进程控制，还是一种高效的管理方法，有助于企业最大程度的 （填空1） ， （填空2） 和 （填空3） 。 填空1: 降低成本；填空2: 提高质量；填空3: 用户满意度 ">
<div class="sqe-question">
<p class="sqe-question-title">题 20-09（填空）</p>
<p>CMM的意义不仅仅是对软件开发的过程进程控制，还是一种高效的管理方法，有助于企业最大程度的 （填空1） ， （填空2） 和 （填空3） 。</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第五章课上测试</span><span>填空</span><span>3 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 降低成本；填空2: 提高质量；填空3: 用户满意度</p></div></details></div>
</article>
</section>

<section id="quiz-21" class="sqe-chapter">
<div class="sqe-chapter-head">
<span class="sqe-number">21</span>
<div><small>课上测试（计入总分） · 云班课 QUIZ</small><h3>第九章课上测试</h3><div><span class="sqe-source-pill">补充自成绩结果接口</span><span class="sqe-source-pill">10 道题</span></div></div>
</div>

<article class="sqe-card" data-sqe-card data-sqe-text="第九章课上测试 课上测试（计入总分） TF 注释的位置应与被描述的代码相邻，可以放在代码的上方或右方，不可放在下方。 T ">
<div class="sqe-question">
<p class="sqe-question-title">题 21-01（判断）</p>
<p>注释的位置应与被描述的代码相邻，可以放在代码的上方或右方，不可放在下方。</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第九章课上测试</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>T</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第九章课上测试 课上测试（计入总分） FILL 建议文件结构包含三部分内容，包括：定义文件开头处的 （填空1） 和 （填空2） 声明；对一些头文件的引用；程序的实现体（包括数据和代码）。 填空1: 版权；填空2: 版本 ">
<div class="sqe-question">
<p class="sqe-question-title">题 21-02（填空）</p>
<p>建议文件结构包含三部分内容，包括：定义文件开头处的 （填空1） 和 （填空2） 声明；对一些头文件的引用；程序的实现体（包括数据和代码）。</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第九章课上测试</span><span>填空</span><span>2 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 版权；填空2: 版本</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第九章课上测试 课上测试（计入总分） FILL 正常值用 （填空1） 获得，错误标志用 （填空2） 返回。 填空1: 输出参数；填空2: return语句 ">
<div class="sqe-question">
<p class="sqe-question-title">题 21-03（填空）</p>
<p>正常值用 （填空1） 获得，错误标志用 （填空2） 返回。</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第九章课上测试</span><span>填空</span><span>2 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 输出参数；填空2: return语句</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第九章课上测试 课上测试（计入总分） TF 边写代码边注释，修改代码同时修改相应的注释 T ">
<div class="sqe-question">
<p class="sqe-question-title">题 21-04（判断）</p>
<p>边写代码边注释，修改代码同时修改相应的注释</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第九章课上测试</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>T</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第九章课上测试 课上测试（计入总分） MULTI 以下属于优秀代码风格的是 A. If（ j= =1）；D. If（i〉MAX_NUM） If（ j= =1） If（1= = j） If（i〉5000） If（i〉MAX_NUM）">
<div class="sqe-question">
<p class="sqe-question-title">题 21-05（多选）</p>
<p>以下属于优秀代码风格的是</p>
<ul class="sqe-options"><li><strong>A.</strong> If（ j= =1）</li><li><strong>B.</strong> If（1= = j）</li><li><strong>C.</strong> If（i〉5000）</li><li><strong>D.</strong> If（i〉MAX_NUM）</li></ul>
<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第九章课上测试</span><span>多选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. If（ j= =1）；D. If（i〉MAX_NUM）</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第九章课上测试 课上测试（计入总分） MULTI 以下属于Windows程序命名规则的是 A. 全局函数的名字应当使用&amp;ldquo;动词&amp;rdquo;或者&amp;ldquo;动词+名词&amp;rdquo;；C. 静态变量加前缀s_。如果必须定义使用全局变量，则在全局变量前加g_；D. 常量全用大写的字母，用下划线分割单词 全局函数的名字应当使用&amp;ldquo;动词&amp;rdquo;或者&amp;ldquo;动词+名词&amp;rdquo; 程序中要靠大小写来区分相似的标识符 静态变量加前缀s_。如果必须定义使用全局变量，则在全局变量前加g_ 常量全用大写的字母，用下划线分割单词">
<div class="sqe-question">
<p class="sqe-question-title">题 21-06（多选）</p>
<p>以下属于Windows程序命名规则的是</p>
<ul class="sqe-options"><li><strong>A.</strong> 全局函数的名字应当使用&amp;ldquo;动词&amp;rdquo;或者&amp;ldquo;动词+名词&amp;rdquo;</li><li><strong>B.</strong> 程序中要靠大小写来区分相似的标识符</li><li><strong>C.</strong> 静态变量加前缀s_。如果必须定义使用全局变量，则在全局变量前加g_</li><li><strong>D.</strong> 常量全用大写的字母，用下划线分割单词</li></ul>
<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第九章课上测试</span><span>多选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 全局函数的名字应当使用&amp;ldquo;动词&amp;rdquo;或者&amp;ldquo;动词+名词&amp;rdquo;；C. 静态变量加前缀s_。如果必须定义使用全局变量，则在全局变量前加g_；D. 常量全用大写的字母，用下划线分割单词</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第九章课上测试 课上测试（计入总分） MULTI 下列属于函数处理规则的是 A. 如果参数是指针且仅做输入用，应该在类型前面加const，以防止该指针在函数体内被意外修改；B. 如果输入参数以值传递的方式传递对象，宜改用&amp;ldquo;const &amp; &amp;rdquo;方式来传递，这样可以省去临时对象的构造和析构过程，从而提高效率；C. 不要将正常值和错误标志混在一起返回。正常值用输出参数获得，错误标志用return语句返回；D. 不要将正常值和错误标志混在一起返回。正常值用输出参数获得，错误标志用return语句返回 如果参数是指针且仅做输入用，应该在类型前面加const，以防止该指针在函数体内被意外修改 如果输入参数以值传递的方式传递对象，宜改用&amp;ldquo;const &amp; &amp;rdquo;方式来传递，这样可以省去临时对象的构造和析构过程，从而提高效率 不要将正常值和错误标志混在一起返回。正常值用输出参数获得，错误标志用return语句返回 不要将正常值和错误标志混在一起返回。正常值用输出参数获得，错误标志用return语句返回">
<div class="sqe-question">
<p class="sqe-question-title">题 21-07（多选）</p>
<p>下列属于函数处理规则的是</p>
<ul class="sqe-options"><li><strong>A.</strong> 如果参数是指针且仅做输入用，应该在类型前面加const，以防止该指针在函数体内被意外修改</li><li><strong>B.</strong> 如果输入参数以值传递的方式传递对象，宜改用&amp;ldquo;const &amp; &amp;rdquo;方式来传递，这样可以省去临时对象的构造和析构过程，从而提高效率</li><li><strong>C.</strong> 不要将正常值和错误标志混在一起返回。正常值用输出参数获得，错误标志用return语句返回</li><li><strong>D.</strong> 不要将正常值和错误标志混在一起返回。正常值用输出参数获得，错误标志用return语句返回</li></ul>
<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第九章课上测试</span><span>多选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 如果参数是指针且仅做输入用，应该在类型前面加const，以防止该指针在函数体内被意外修改；B. 如果输入参数以值传递的方式传递对象，宜改用&amp;ldquo;const &amp; &amp;rdquo;方式来传递，这样可以省去临时对象的构造和析构过程，从而提高效率；C. 不要将正常值和错误标志混在一起返回。正常值用输出参数获得，错误标志用return语句返回；D. 不要将正常值和错误标志混在一起返回。正常值用输出参数获得，错误标志用return语句返回</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第九章课上测试 课上测试（计入总分） MULTI 以下符合内存使用规范的是 A. 程序在运行的时候用malloc或new申请动态内存分配，动态内存的生存期由我们决定；D. 静态存储区域在程序的整个运行期间都存在 程序在运行的时候用malloc或new申请动态内存分配，动态内存的生存期由我们决定 全局变量，static变量应建立在动态内存上 栈上创建的存储单元的生命周期也由我们决定 静态存储区域在程序的整个运行期间都存在">
<div class="sqe-question">
<p class="sqe-question-title">题 21-08（多选）</p>
<p>以下符合内存使用规范的是</p>
<ul class="sqe-options"><li><strong>A.</strong> 程序在运行的时候用malloc或new申请动态内存分配，动态内存的生存期由我们决定</li><li><strong>B.</strong> 全局变量，static变量应建立在动态内存上</li><li><strong>C.</strong> 栈上创建的存储单元的生命周期也由我们决定</li><li><strong>D.</strong> 静态存储区域在程序的整个运行期间都存在</li></ul>
<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第九章课上测试</span><span>多选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 程序在运行的时候用malloc或new申请动态内存分配，动态内存的生存期由我们决定；D. 静态存储区域在程序的整个运行期间都存在</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第九章课上测试 课上测试（计入总分） MULTI 以下符合基本语句规则的是 A. if语句不可将浮点变量用&amp;ldquo;==&amp;rdquo;或&amp;ldquo;！=&amp;rdquo;与任何数字比较；B. 不可在for循环体内修改循环变量；C. 建议for语句的循环控制变量的取值采用&amp;ldquo;半开半闭区间&amp;rdquo;写法；D. if语句不可将布尔变量直接与TRUE、FALSE或者1、0进行比较 if语句不可将浮点变量用&amp;ldquo;==&amp;rdquo;或&amp;ldquo;！=&amp;rdquo;与任何数字比较 不可在for循环体内修改循环变量 建议for语句的循环控制变量的取值采用&amp;ldquo;半开半闭区间&amp;rdquo;写法 if语句不可将布尔变量直接与TRUE、FALSE或者1、0进行比较">
<div class="sqe-question">
<p class="sqe-question-title">题 21-09（多选）</p>
<p>以下符合基本语句规则的是</p>
<ul class="sqe-options"><li><strong>A.</strong> if语句不可将浮点变量用&amp;ldquo;==&amp;rdquo;或&amp;ldquo;！=&amp;rdquo;与任何数字比较</li><li><strong>B.</strong> 不可在for循环体内修改循环变量</li><li><strong>C.</strong> 建议for语句的循环控制变量的取值采用&amp;ldquo;半开半闭区间&amp;rdquo;写法</li><li><strong>D.</strong> if语句不可将布尔变量直接与TRUE、FALSE或者1、0进行比较</li></ul>
<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第九章课上测试</span><span>多选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. if语句不可将浮点变量用&amp;ldquo;==&amp;rdquo;或&amp;ldquo;！=&amp;rdquo;与任何数字比较；B. 不可在for循环体内修改循环变量；C. 建议for语句的循环控制变量的取值采用&amp;ldquo;半开半闭区间&amp;rdquo;写法；D. if语句不可将布尔变量直接与TRUE、FALSE或者1、0进行比较</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="第九章课上测试 课上测试（计入总分） MULTI 以下说法正确的是 A. const可以修饰函数的参数、返回值，函数的定义体等。修饰的东西受到强制保护，可以预防意外的变动；C. void Func(const A &amp;a)的形式可以有效防止参数a被意外修改；D. 如果输入参数采用&amp;ldquo;指针传递&amp;rdquo;，那么加const修饰可以防止意外地改动该指针，起到保护作用 const可以修饰函数的参数、返回值，函数的定义体等。修饰的东西受到强制保护，可以预防意外的变动 const既能修饰输入参数也能修饰输出参数 void Func(const A &amp;a)的形式可以有效防止参数a被意外修改 如果输入参数采用&amp;ldquo;指针传递&amp;rdquo;，那么加const修饰可以防止意外地改动该指针，起到保护作用">
<div class="sqe-question">
<p class="sqe-question-title">题 21-10（多选）</p>
<p>以下说法正确的是</p>
<ul class="sqe-options"><li><strong>A.</strong> const可以修饰函数的参数、返回值，函数的定义体等。修饰的东西受到强制保护，可以预防意外的变动</li><li><strong>B.</strong> const既能修饰输入参数也能修饰输出参数</li><li><strong>C.</strong> void Func(const A &amp;a)的形式可以有效防止参数a被意外修改</li><li><strong>D.</strong> 如果输入参数采用&amp;ldquo;指针传递&amp;rdquo;，那么加const修饰可以防止意外地改动该指针，起到保护作用</li></ul>
<div class="sqe-meta"><span>课上测试（计入总分）</span><span>第九章课上测试</span><span>多选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. const可以修饰函数的参数、返回值，函数的定义体等。修饰的东西受到强制保护，可以预防意外的变动；C. void Func(const A &amp;a)的形式可以有效防止参数a被意外修改；D. 如果输入参数采用&amp;ldquo;指针传递&amp;rdquo;，那么加const修饰可以防止意外地改动该指针，起到保护作用</p></div></details></div>
</article>
</section>

<section id="quiz-22" class="sqe-chapter">
<div class="sqe-chapter-head">
<span class="sqe-number">22</span>
<div><small>课上测试（计入总分） · 云班课 QUIZ</small><h3>实验二课上测试</h3><div><span class="sqe-source-pill">补充自成绩结果接口</span><span class="sqe-source-pill">10 道题</span></div></div>
</div>

<article class="sqe-card" data-sqe-card data-sqe-text="实验二课上测试 课上测试（计入总分） TF 基路径测试给出了必需进行的测试的上限。 F ">
<div class="sqe-question">
<p class="sqe-question-title">题 22-01（判断）</p>
<p>基路径测试给出了必需进行的测试的上限。</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>实验二课上测试</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>F</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验二课上测试 课上测试（计入总分） TF 基路径是指从所有的程序路径中选择一个最小的路径集合，程序中的其它路径都可以由这一组路径进行加法和数乘运算得到。 T ">
<div class="sqe-question">
<p class="sqe-question-title">题 22-02（判断）</p>
<p>基路径是指从所有的程序路径中选择一个最小的路径集合，程序中的其它路径都可以由这一组路径进行加法和数乘运算得到。</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>实验二课上测试</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>T</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验二课上测试 课上测试（计入总分） SINGLE &amp;rlm;一个程序中所含有的路径数与_____有着直接的关系 D. 程序的复杂程度 程序语句行数 程序指令执行时间 程序模块数 程序的复杂程度">
<div class="sqe-question">
<p class="sqe-question-title">题 22-03（单选）</p>
<p>&amp;rlm;一个程序中所含有的路径数与_____有着直接的关系</p>
<ul class="sqe-options"><li><strong>A.</strong> 程序语句行数</li><li><strong>B.</strong> 程序指令执行时间</li><li><strong>C.</strong> 程序模块数</li><li><strong>D.</strong> 程序的复杂程度</li></ul>
<div class="sqe-meta"><span>课上测试（计入总分）</span><span>实验二课上测试</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>D. 程序的复杂程度</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验二课上测试 课上测试（计入总分） SINGLE 白盒测试是根据程序的_____来设计测试用例,黑盒测试是根据软件的规格说明来设计测试用例。 B. 内部逻辑 内部数据 内部逻辑 功能 性能">
<div class="sqe-question">
<p class="sqe-question-title">题 22-04（单选）</p>
<p>白盒测试是根据程序的_____来设计测试用例,黑盒测试是根据软件的规格说明来设计测试用例。</p>
<ul class="sqe-options"><li><strong>A.</strong> 内部数据</li><li><strong>B.</strong> 内部逻辑</li><li><strong>C.</strong> 功能</li><li><strong>D.</strong> 性能</li></ul>
<div class="sqe-meta"><span>课上测试（计入总分）</span><span>实验二课上测试</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>B. 内部逻辑</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验二课上测试 课上测试（计入总分） SINGLE ​阅读下面这段程序，使用逻辑覆盖法进行测试，请问哪一组关于（a,b,c）的输入值可以达到判定覆盖。
&amp;lrm;​int func(int a,b,c)
{&amp;lrm;​
int k=1;
&amp;lrm;​if ( (a&gt;0) &amp;&amp;(b&lt;0) &amp;&amp; (a+c&gt;0) )
k=k+a;&amp;lrm;​
else
k=k+b;
&amp;lrm;​if (c&gt;0)
k=k+c;&amp;lrm;​
return k;&amp;lrm;​
} C. (a,b,c) = (4,-9,-2)、(-4,8,3) (a,b,c) = (2,5,8)、(-4,-9,-5) (a,b,c) = (3,6,1)、(-4,-5,7) (a,b,c) = (4,-9,-2)、(-4,8,3) (a,b,c) = (6,8,-2)、(1,5,4)">
<div class="sqe-question">
<p class="sqe-question-title">题 22-05（单选）</p>
<p>​阅读下面这段程序，使用逻辑覆盖法进行测试，请问哪一组关于（a,b,c）的输入值可以达到判定覆盖。
&amp;lrm;​int func(int a,b,c)
{&amp;lrm;​
int k=1;
&amp;lrm;​if ( (a&gt;0) &amp;&amp;(b&lt;0) &amp;&amp; (a+c&gt;0) )
k=k+a;&amp;lrm;​
else
k=k+b;
&amp;lrm;​if (c&gt;0)
k=k+c;&amp;lrm;​
return k;&amp;lrm;​
}</p>
<ul class="sqe-options"><li><strong>A.</strong> (a,b,c) = (2,5,8)、(-4,-9,-5)</li><li><strong>B.</strong> (a,b,c) = (3,6,1)、(-4,-5,7)</li><li><strong>C.</strong> (a,b,c) = (4,-9,-2)、(-4,8,3)</li><li><strong>D.</strong> (a,b,c) = (6,8,-2)、(1,5,4)</li></ul>
<div class="sqe-meta"><span>课上测试（计入总分）</span><span>实验二课上测试</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>C. (a,b,c) = (4,-9,-2)、(-4,8,3)</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验二课上测试 课上测试（计入总分） SINGLE &amp;zwnj;针对下面一个程序段：
If ((M&gt;0) &amp;&amp; (N = = 0)) FUCTION1;
If ((M = = 10)|| (P &gt; 10)) FUCTION2;
其中，FUCTION1、FUCTION2均为语句块。
现在选取测试用例：M=10 N=0 P=3 ，该测试用例满足了 A. 语句覆盖 语句覆盖 判定覆盖 条件组合覆 路径覆盖">
<div class="sqe-question">
<p class="sqe-question-title">题 22-06（单选）</p>
<p>&amp;zwnj;针对下面一个程序段：
If ((M&gt;0) &amp;&amp; (N = = 0)) FUCTION1;
If ((M = = 10)|| (P &gt; 10)) FUCTION2;
其中，FUCTION1、FUCTION2均为语句块。
现在选取测试用例：M=10 N=0 P=3 ，该测试用例满足了</p>
<ul class="sqe-options"><li><strong>A.</strong> 语句覆盖</li><li><strong>B.</strong> 判定覆盖</li><li><strong>C.</strong> 条件组合覆</li><li><strong>D.</strong> 路径覆盖</li></ul>
<div class="sqe-meta"><span>课上测试（计入总分）</span><span>实验二课上测试</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 语句覆盖</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验二课上测试 课上测试（计入总分） SINGLE 如果某测试用例集实现了判定覆盖，那么它一定同时实现了该软件的 C. 语句覆盖 条件组合覆盖 判定/条件覆盖 语句覆盖 条件覆盖">
<div class="sqe-question">
<p class="sqe-question-title">题 22-07（单选）</p>
<p>如果某测试用例集实现了判定覆盖，那么它一定同时实现了该软件的</p>
<ul class="sqe-options"><li><strong>A.</strong> 条件组合覆盖</li><li><strong>B.</strong> 判定/条件覆盖</li><li><strong>C.</strong> 语句覆盖</li><li><strong>D.</strong> 条件覆盖</li></ul>
<div class="sqe-meta"><span>课上测试（计入总分）</span><span>实验二课上测试</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>C. 语句覆盖</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验二课上测试 课上测试（计入总分） SINGLE 发现错误能力最弱的是_______ A. 语句覆盖 语句覆盖 判定覆盖 条件覆盖 路径覆盖">
<div class="sqe-question">
<p class="sqe-question-title">题 22-08（单选）</p>
<p>发现错误能力最弱的是_______</p>
<ul class="sqe-options"><li><strong>A.</strong> 语句覆盖</li><li><strong>B.</strong> 判定覆盖</li><li><strong>C.</strong> 条件覆盖</li><li><strong>D.</strong> 路径覆盖</li></ul>
<div class="sqe-meta"><span>课上测试（计入总分）</span><span>实验二课上测试</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 语句覆盖</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验二课上测试 课上测试（计入总分） FILL 判定-条件覆盖法要求使得判断中 （填空1） 至少执行一次。 填空1: 每个条件的所有可能取值 ">
<div class="sqe-question">
<p class="sqe-question-title">题 22-09（填空）</p>
<p>判定-条件覆盖法要求使得判断中 （填空1） 至少执行一次。</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>实验二课上测试</span><span>填空</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 每个条件的所有可能取值</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验二课上测试 课上测试（计入总分） TF 在白盒测试中，如果覆盖率达到100% ，就基本可以保证把所有的隐藏程序缺陷都已经揭露出来了。 F ">
<div class="sqe-question">
<p class="sqe-question-title">题 22-10（判断）</p>
<p>在白盒测试中，如果覆盖率达到100% ，就基本可以保证把所有的隐藏程序缺陷都已经揭露出来了。</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>实验二课上测试</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>F</p></div></details></div>
</article>
</section>

<section id="quiz-23" class="sqe-chapter">
<div class="sqe-chapter-head">
<span class="sqe-number">23</span>
<div><small>课上测试（计入总分） · 云班课 QUIZ</small><h3>实验一课上测试</h3><div><span class="sqe-source-pill">题目接口直接导出</span><span class="sqe-source-pill">10 道题</span></div></div>
</div>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课上测试 课上测试（计入总分） MULTI &amp;zwnj;以下可以作为单元的是 A. 一个类；B. 一个页面；C. 一个函数；D. 一个窗口 一个类 一个页面 一个函数 一个窗口">
<div class="sqe-question">
<p class="sqe-question-title">题 23-01（多选）</p>
<p>&amp;zwnj;以下可以作为单元的是</p>
<ul class="sqe-options"><li><strong>A.</strong> 一个类</li><li><strong>B.</strong> 一个页面</li><li><strong>C.</strong> 一个函数</li><li><strong>D.</strong> 一个窗口</li></ul>
<div class="sqe-meta"><span>课上测试（计入总分）</span><span>实验一课上测试</span><span>多选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 一个类；B. 一个页面；C. 一个函数；D. 一个窗口</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课上测试 课上测试（计入总分） SINGLE 导致软件缺陷的原因有很多，①&amp;mdash;④是可能的原因，其中最主要的原因包括_____
①软件需求说明书编写的不全面，不完整，不准确，而且经常更改&amp;rlm;&amp;zwnj;　　　　
②软件设计说明书&amp;rlm;&amp;zwnj;　　　　
③软件操作人员的水平&amp;rlm;&amp;zwnj;　　　　
④开发人员不能很好的理解需求说明书和沟通不足 D. ①、④ ①、②、③ ①、③ ②、③ ①、④">
<div class="sqe-question">
<p class="sqe-question-title">题 23-02（单选）</p>
<p>导致软件缺陷的原因有很多，①&amp;mdash;④是可能的原因，其中最主要的原因包括_____
①软件需求说明书编写的不全面，不完整，不准确，而且经常更改&amp;rlm;&amp;zwnj;　　　　
②软件设计说明书&amp;rlm;&amp;zwnj;　　　　
③软件操作人员的水平&amp;rlm;&amp;zwnj;　　　　
④开发人员不能很好的理解需求说明书和沟通不足</p>
<ul class="sqe-options"><li><strong>A.</strong> ①、②、③</li><li><strong>B.</strong> ①、③</li><li><strong>C.</strong> ②、③</li><li><strong>D.</strong> ①、④</li></ul>
<div class="sqe-meta"><span>课上测试（计入总分）</span><span>实验一课上测试</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>D. ①、④</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课上测试 课上测试（计入总分） SINGLE 一条Bug记录应该包括_____
①编号
②Bug描述
③Bug级别
④Bug所属模块
⑤发现人 C. ①②③④⑤ ①②③④ ①② ①②③④⑤ ①②③">
<div class="sqe-question">
<p class="sqe-question-title">题 23-03（单选）</p>
<p>一条Bug记录应该包括_____
①编号
②Bug描述
③Bug级别
④Bug所属模块
⑤发现人</p>
<ul class="sqe-options"><li><strong>A.</strong> ①②③④</li><li><strong>B.</strong> ①②</li><li><strong>C.</strong> ①②③④⑤</li><li><strong>D.</strong> ①②③</li></ul>
<div class="sqe-meta"><span>课上测试（计入总分）</span><span>实验一课上测试</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>C. ①②③④⑤</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课上测试 课上测试（计入总分） TF 测试人员要坚持原则，缺陷未修复完坚决不予通过。  ">
<div class="sqe-question">
<p class="sqe-question-title">题 23-04（判断）</p>
<p>测试人员要坚持原则，缺陷未修复完坚决不予通过。</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>实验一课上测试</span><span>判断</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>云班课未返回答案</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课上测试 课上测试（计入总分） SINGLE 软件设计阶段的质量控制主要采取的方式是 D. 评审 白盒测试 动态测试 黑盒测试 评审">
<div class="sqe-question">
<p class="sqe-question-title">题 23-05（单选）</p>
<p>软件设计阶段的质量控制主要采取的方式是</p>
<ul class="sqe-options"><li><strong>A.</strong> 白盒测试</li><li><strong>B.</strong> 动态测试</li><li><strong>C.</strong> 黑盒测试</li><li><strong>D.</strong> 评审</li></ul>
<div class="sqe-meta"><span>课上测试（计入总分）</span><span>实验一课上测试</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>D. 评审</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课上测试 课上测试（计入总分） SINGLE 软件质量保证与测试人员需要的的基本素质有 C. 所有选项都是 行业知识 测试专业技能 所有选项都是 计算机专业技能">
<div class="sqe-question">
<p class="sqe-question-title">题 23-06（单选）</p>
<p>软件质量保证与测试人员需要的的基本素质有</p>
<ul class="sqe-options"><li><strong>A.</strong> 行业知识</li><li><strong>B.</strong> 测试专业技能</li><li><strong>C.</strong> 所有选项都是</li><li><strong>D.</strong> 计算机专业技能</li></ul>
<div class="sqe-meta"><span>课上测试（计入总分）</span><span>实验一课上测试</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>C. 所有选项都是</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课上测试 课上测试（计入总分） SINGLE 在软件底层进行的测试称为 B. 单元测试 系统测试 单元测试 功能测试 集成测试">
<div class="sqe-question">
<p class="sqe-question-title">题 23-07（单选）</p>
<p>在软件底层进行的测试称为</p>
<ul class="sqe-options"><li><strong>A.</strong> 系统测试</li><li><strong>B.</strong> 单元测试</li><li><strong>C.</strong> 功能测试</li><li><strong>D.</strong> 集成测试</li></ul>
<div class="sqe-meta"><span>课上测试（计入总分）</span><span>实验一课上测试</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>B. 单元测试</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课上测试 课上测试（计入总分） SINGLE 下列中不属于测试原则的是 D. 找到的缺陷越多，软件遗留的缺陷就越少 软件测试是有风险的行为 完全测试程序是不可能的 测试无法找出所有的软件缺陷 找到的缺陷越多，软件遗留的缺陷就越少">
<div class="sqe-question">
<p class="sqe-question-title">题 23-08（单选）</p>
<p>下列中不属于测试原则的是</p>
<ul class="sqe-options"><li><strong>A.</strong> 软件测试是有风险的行为</li><li><strong>B.</strong> 完全测试程序是不可能的</li><li><strong>C.</strong> 测试无法找出所有的软件缺陷</li><li><strong>D.</strong> 找到的缺陷越多，软件遗留的缺陷就越少</li></ul>
<div class="sqe-meta"><span>课上测试（计入总分）</span><span>实验一课上测试</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>D. 找到的缺陷越多，软件遗留的缺陷就越少</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课上测试 课上测试（计入总分） SINGLE 测试人员应在软件生命周期中的下面哪个阶段介入最好______ A. 需求阶段 需求阶段 设计阶段 编码阶段 系统集成阶段">
<div class="sqe-question">
<p class="sqe-question-title">题 23-09（单选）</p>
<p>测试人员应在软件生命周期中的下面哪个阶段介入最好______</p>
<ul class="sqe-options"><li><strong>A.</strong> 需求阶段</li><li><strong>B.</strong> 设计阶段</li><li><strong>C.</strong> 编码阶段</li><li><strong>D.</strong> 系统集成阶段</li></ul>
<div class="sqe-meta"><span>课上测试（计入总分）</span><span>实验一课上测试</span><span>单选</span><span>1 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>A. 需求阶段</p></div></details></div>
</article>

<article class="sqe-card" data-sqe-card data-sqe-text="实验一课上测试 课上测试（计入总分） FILL 回归测试的目的是所做的修改 （填空1） ，同时 （填空2） 的正确性。 填空1: 达到了预定的目的；填空2: 不影响软件原有功能 ">
<div class="sqe-question">
<p class="sqe-question-title">题 23-10（填空）</p>
<p>回归测试的目的是所做的修改 （填空1） ，同时 （填空2） 的正确性。</p>

<div class="sqe-meta"><span>课上测试（计入总分）</span><span>实验一课上测试</span><span>填空</span><span>2 分</span></div>
</div>
<div class="sqe-answer"><details><summary>参考答案</summary><div class="sqe-answer-body"><p>填空1: 达到了预定的目的；填空2: 不影响软件原有功能</p></div></details></div>
</article>
</section>

<section id="missing" class="sqe-tip">
<h3>仍未导出的云班课活动</h3>
<ul><li>测试相关未分类习题：err.act.notViewResult，操作无效，老师暂未公布答案，您无法查看结果。活动状态 IN_PRGRS，云班课显示题数 41。</li></ul>
</section>
</div>

<script src="/js/software-quality-voice.js?v=20260623-5"></script>

<script>
(function () {
  var input = document.querySelector('[data-sqe-filter]');
  var clear = document.querySelector('[data-sqe-clear]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-sqe-card]'));
  if (!input || !cards.length) return;
  function apply() {
    var q = input.value.trim().toLowerCase();
    cards.forEach(function (card) {
      var text = (card.getAttribute('data-sqe-text') || '').toLowerCase();
      card.classList.toggle('is-hidden', q && text.indexOf(q) === -1);
    });
  }
  input.addEventListener('input', apply);
  if (clear) clear.addEventListener('click', function () { input.value = ''; apply(); input.focus(); });
})();
</script>
