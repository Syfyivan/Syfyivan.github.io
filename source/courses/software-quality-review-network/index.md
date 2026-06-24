---
title: "软件质量与测试期末一页通关复习网络"
date: 2026-06-23 11:40:00
description: "《软件质量保证与测试》期末复习总页：覆盖 PPT 0-9、测试基本理论、往年题、大题模板，并接入已导出的云班课互评题和课上/课后题库。"
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
  max-width: 1360px;
  margin: 0 auto;
  color: var(--sqr-text);
}
.sqr-page {
  scroll-padding-top: 96px;
}
.sqr-page [id],
.sqe-page [id] {
  scroll-margin-top: 96px;
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
.sqr-layout {
  display: block;
  position: relative;
  margin-top: 24px;
}
.sqr-main {
  min-width: 0;
  max-width: min(1040px, calc(100vw - 520px));
  margin: 0 auto;
}
.sqr-side {
  position: fixed;
  top: 96px;
  right: max(18px, calc(50vw - 920px));
  width: 220px;
  max-height: calc(100vh - 110px);
  overflow: auto;
  padding: 14px;
  border: 1px solid var(--sqr-line);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 10px 24px rgba(32, 36, 42, 0.06);
}
.sqr-side h3 {
  margin: 0 0 10px;
  color: var(--sqr-ink);
  font-size: 16px;
  letter-spacing: 0;
}
.sqr-side-group {
  display: grid;
  gap: 5px;
  padding: 10px 0;
  border-top: 1px solid var(--sqr-line);
}
.sqr-side-group:first-of-type { border-top: 0; padding-top: 0; }
.sqr-side-title {
  color: var(--sqr-rust);
  font-size: 12px;
  font-weight: 800;
}
.sqr-side a {
  display: block;
  padding: 6px 8px;
  border-radius: 6px;
  color: var(--sqr-muted);
  font-size: 13px;
  line-height: 1.4;
  text-decoration: none !important;
}
.sqr-side a:hover,
.sqr-side a:focus {
  color: var(--sqr-green);
  background: rgba(47, 111, 94, 0.09);
}
.sqr-detail-list {
  display: grid;
  gap: 14px;
}
.sqr-detail-card {
  padding: 18px;
  border: 1px solid var(--sqr-line);
  border-radius: 8px;
  background: var(--sqr-panel);
  box-shadow: 0 10px 24px rgba(32, 36, 42, 0.055);
  scroll-margin-top: 92px;
}
.sqr-detail-head {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: baseline;
  margin-bottom: 10px;
}
.sqr-detail-head span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 46px;
  min-height: 34px;
  padding: 5px 9px;
  border-radius: 7px;
  color: #fff;
  background: var(--sqr-blue);
  font-weight: 850;
}
.sqr-detail-card h3 {
  margin: 0;
  color: var(--sqr-ink);
  font-size: 19px;
  letter-spacing: 0;
}
.sqr-detail-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  min-height: 34px;
  margin: 0 0 12px;
  padding: 7px 11px;
  border: 1px solid rgba(47, 111, 94, 0.3);
  border-radius: 8px;
  color: var(--sqr-green);
  font-size: 14px;
  font-weight: 780;
  text-decoration: none !important;
}
.sqr-detail-link:hover,
.sqr-detail-link:focus {
  color: #ffffff;
  background: var(--sqr-green);
}
.sqr-kp-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 18px;
  margin: 0;
  padding-left: 1.2em;
  color: var(--sqr-muted);
}
.sqr-kp-list li {
  break-inside: avoid;
}
.sqr-subsection-title {
  margin: 26px 0 12px;
  color: var(--sqr-ink);
  font-size: 20px;
  letter-spacing: 0;
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
html[data-user-color-scheme="dark"] .sqr-chapter-card,
html[data-user-color-scheme="dark"] .sqr-table-wrap,
html[data-user-color-scheme="dark"] .sqr-side,
html[data-user-color-scheme="dark"] .sqr-detail-card { background: var(--sqr-panel); }
html[data-user-color-scheme="dark"] .sqr-table th { background: rgba(255, 255, 255, 0.06); }
html[data-user-color-scheme="dark"] .sqr-print { background: rgba(255, 255, 255, 0.045); }
@media (max-width: 980px) {
  .sqr-hero,
  .sqr-grid,
  .sqr-grid.three { grid-template-columns: 1fr; }
  .sqr-side { display: none; }
  .sqr-main { max-width: none; }
  .sqr-kp-list { grid-template-columns: 1fr; }
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
<link rel="stylesheet" href="/css/software-quality-mobile-voice.css?v=20260623-5">
<script defer src="/js/software-quality-voice.js?v=20260623-5"></script>

<div class="sqr-page">
  <section class="sqr-hero">
    <div>
      <span class="sqr-kicker">Software Quality Final Review / 一页通关版</span>
      <h2>这页做总复习网络：知识体系、往年题、大题模板、云班课和 CSDN 题库入口</h2>
      <p>这版已经把题源边界重新梳理：知识体系来自本地 PPT、复习讲义、往年 A 卷、2024 回忆和 2025 图片回忆；云班课已登录导出 23 道互评简答参考答案、23 个课上/课后 QUIZ 共 428 道题；CSDN 公开题库已单独整理成 298 个题目/题组条目。主页面只做复习网络和入口，具体题目统一放到题库页，避免再混入无来源合成题。</p>
      <div class="sqr-actions">
        <a class="sqr-link" href="#knowledge">知识体系</a>
        <a class="sqr-link" href="#past-papers">往年题</a>
        <a class="sqr-link" href="#must-short">简答评分点</a>
        <a class="sqr-link" href="#design-drill">大题设计题</a>
        <a class="sqr-link" href="#question-bank">云班课题库</a>
        <a class="sqr-link" href="/courses/software-quality-csdn-bank/">CSDN题库</a>
      </div>
    </div>
    <div class="sqr-score" aria-label="复习覆盖统计">
      <div><strong>0-15</strong><span>PPT 0-9 + 测试基本理论 10-15，覆盖期末知识体系。</span></div>
      <div><strong>已核</strong><span>PPT、复习讲义、A 卷、2024/2025 回忆、云班课题库、CSDN 公开题库。</span></div>
      <div><strong>待核</strong><span>1 个云班课未公布活动、C 卷 OCR。</span></div>
      <div><strong>大题</strong><span>A 卷、2024 和 2025 回忆都指向等价类、控制流图、复杂度、基本路径和测试用例。</span></div>
    </div>
  </section>

  <section class="sqr-note">
    <p><strong>资料边界：</strong>之前混入过没有来源的合成题，已经删除出主复习页。当前可信状态是：PPT、复习讲义、A 卷 PDF、2024 回忆、2025 图片回忆、云班课 23 道互评简答和 428 道 QUIZ 题、CSDN 公开题库 298 个题目/题组条目已经有来源；“测试相关未分类习题”在云班课接口显示老师暂未公布答案，但 CSDN 公开页有对应题目，所以现在单独放入 CSDN 对照页。C 卷仍需 OCR/人工核验。2024/2025 都是回忆材料，只用于判断复习方向，不当作老师官方答案。</p>
  </section>

  <nav class="sqr-nav" aria-label="页内导航">
    <a class="sqr-chip" href="#how-to-use">怎么用</a>
    <a class="sqr-chip" href="#source-map">资料清单</a>
    <a class="sqr-chip" href="#past-papers">往年题</a>
    <a class="sqr-chip" href="#detailed-index">详细目录</a>
    <a class="sqr-chip" href="#knowledge">知识体系</a>
    <a class="sqr-chip" href="#must-short">简答评分点</a>
    <a class="sqr-chip" href="#design-drill">大题</a>
    <a class="sqr-chip" href="#question-bank">云班课题库</a>
    <a class="sqr-chip" href="#last-day">最后一天</a>
  </nav>

  <div class="sqr-layout">
    <aside class="sqr-side" aria-label="固定复习目录">
      <h3>复习目录</h3>
      <div class="sqr-side-group">
        <span class="sqr-side-title">主流程</span>
        <a href="#how-to-use">怎么用这页</a>
        <a href="#source-map">资料清单</a>
        <a href="#past-papers">往年题雷达</a>
        <a href="#detailed-index">0-15 章详细目录</a>
        <a href="#knowledge">知识体系总览</a>
        <a href="#must-short">简答评分点</a>
        <a href="#design-drill">大题设计题</a>
        <a href="#question-bank">云班课题库</a>
        <a href="#last-day">最后一天冲刺</a>
      </div>
      <div class="sqr-side-group">
        <span class="sqr-side-title">知识点章节</span>
        <a href="#detail-00">00 绪论</a>
        <a href="#detail-01">01 质量</a>
        <a href="#detail-02">02 软件质量</a>
        <a href="#detail-03">03 工程体系</a>
        <a href="#detail-04">04 质量度量</a>
        <a href="#detail-05">05 质量标准</a>
        <a href="#detail-06">06 软件评审</a>
        <a href="#detail-07">07 SQA 组织</a>
        <a href="#detail-08">08 设计质量</a>
        <a href="#detail-09">09 高质量编程</a>
        <a href="#detail-10">10 软件测试</a>
        <a href="#detail-11">11 白盒测试</a>
        <a href="#detail-12">12 黑盒测试</a>
        <a href="#detail-13">13 集成测试</a>
        <a href="#detail-14">14 系统测试</a>
        <a href="#detail-15">15 验收测试</a>
      </div>
      <div class="sqr-side-group">
        <span class="sqr-side-title">题库入口</span>
        <a href="#must-short">互评简答评分点</a>
        <a href="#question-bank">云班课已核题库</a>
        <a href="/courses/software-quality-exercises/">打开题库页</a>
        <a href="/courses/software-quality-csdn-bank/">CSDN公开题库</a>
        <a href="/courses/software-quality-design-questions/">大题专项页</a>
      </div>
    </aside>
    <main class="sqr-main">

  <h2 id="how-to-use" class="sqr-section-title">一、怎么用这一个页面复习</h2>
  <div class="sqr-grid three">
    <article class="sqr-card"><span class="sqr-badge core">第一遍</span><h3>先过知识体系</h3><p>从 00 到 15 章按“一句话、必背、易错”过一遍。不会的先不展开练习区，先把概念位置记住。</p></article>
    <article class="sqr-card"><span class="sqr-badge hot">第二遍</span><h3>按互评老师答案背简答</h3><p>互评题老师参考答案已经导出，按“题干 + 分组 + 满分 + 评分点”集中背；这里的 23 道题优先级高于普通自拟练习。</p></article>
    <article class="sqr-card"><span class="sqr-badge hot">第三遍</span><h3>练设计大题</h3><p>大题分值最高，不能只背概念。按等价类、边界值、控制流图、复杂度、基本路径、状态图六个模板刷。</p></article>
  </div>

  <h2 id="source-map" class="sqr-section-title">二、资料清单：哪些该看，哪些排除</h2>
  <div class="sqr-table-wrap">
    <table class="sqr-table">
      <thead><tr><th>资料</th><th>已经核对到的内容</th><th>本页怎么吸收</th><th>注意</th></tr></thead>
      <tbody>
        <tr><td>PPT 理论 0-9</td><td>绪论、质量、软件质量、质量工程体系、度量、标准、评审、SQA、设计质量、高质量编程。</td><td>作为知识体系 00-09 章主线。</td><td>PPT 是定义和术语的第一优先级。</td></tr>
        <tr><td>复习讲义/CSDN 公开页</td><td>CSDN 主页面已整理为 298 个题目/题组条目，包含互评题、章节课后习题和测试相关未分类习题；另一篇 2025 CSDN 补充题出现驱动模块/桩模块、健壮性边界值 <code>6n+1</code>、因果图法等填空点。</td><td>用于公开题库对照、补齐未分类题，并校准知识覆盖和章节顺序。</td><td>公开页不是本班云班课接口，和本班导出的题源分开标注；补充题只作为外部对照，不当作本班官方题库。</td></tr>
        <tr><td>云班课活动页</td><td>48 个活动已读；23 道互评简答参考答案、23 个 QUIZ 共 428 道题已导出；1 个“测试相关未分类习题”接口显示未公布答案。</td><td>互评题作为简答评分点，QUIZ 作为客观题主刷题库。</td><td>登录 token、用户信息只保存在本地临时文件，不写入博客。</td></tr>
        <tr><td>A 卷</td><td>判断 15、选择 20、填空 10、简答 9、设计 46。设计题含状态图、控制流图、环路复杂度、独立路径、语句/路径覆盖。</td><td>用于“往年题”和“大题模板”。</td><td>老卷题面不必死背，步骤必须会。</td></tr>
        <tr><td>C 卷</td><td>RAR 中存在 C 卷 PDF，但当前文本抽取为空，尚未 OCR 或人工逐页核验。</td><td>暂不作为已读原题来源。</td><td>完成 OCR/人工核对后再补题型和分值。</td></tr>
        <tr><td>2024 考试回忆</td><td>客观题来自云班课；简答含评审、客户与质量、质量费用、测试原则、发布后 bug；大题含命名格式等价类和中缀转后缀基本路径。</td><td>用于当前风格判断和大题训练。</td><td>选择可能单选/多选不标明，刷题时要按不定项准备。</td></tr>
        <tr><td>2025 考试回忆</td><td>图片已人工读出题型：判断 5 分、选择 15 分、填空 8 分、简答 24 分、大题 48 分；大题含 8 位图书编号等价类和链表排序代码设计。</td><td>用于强化大题训练顺序，尤其是代码类控制流图、复杂度、基本路径和测试用例。</td><td>仍属于学生回忆材料，不当作老师官方答案；客观题细项不逐题展开。</td></tr>
        <tr><td>Excel 和大作业查重资料</td><td>Excel 是辽宁招生投档表或损坏文件；大作业/查重资料不属于期末闭卷理论题源。</td><td>排除。</td><td>不混进复习范围，避免浪费时间。</td></tr>
      </tbody>
    </table>
  </div>
  <section class="sqr-note"><p><strong>客观题命中判断：</strong>如果只看选择、填空、判断，当前最高优先级是 <a href="/courses/software-quality-csdn-bank/">CSDN 公开题库</a> + 云班课 QUIZ。依据是：2024 回忆明确写客观题来自云班课；2025 回忆写除大题外多为云班课原题；A 卷和已抽查老卷客观题能对上 CSDN 中的白盒/黑盒、测试目的、测试用例文档、发现错误能力等同题或同考点。更严谨地说，我还没有把所有老卷逐题做完 100% 对照，所以本页不写“每一道客观题都必在 CSDN”，但会把 CSDN/云班课放在客观题第一复习顺位。</p></section>

  <h2 id="past-papers" class="sqr-section-title">三、往年题雷达：题型、分值、该练什么</h2>
  <div class="sqr-table-wrap">
    <table class="sqr-table">
      <thead><tr><th>样本</th><th>客观题</th><th>简答题</th><th>设计题/大题</th><th>复习结论</th></tr></thead>
      <tbody>
        <tr><td>A 卷</td><td>判断 15 分，选择 20 分，填空 10 分。覆盖 SQA、质量预测、缺陷、测试目的、覆盖强弱等。</td><td>耦合/内聚排序；基本测量原则；ISO、McCall、Boehm 质量模型评价。</td><td>工厂查询系统状态图、控制流图、环路复杂度、独立路径；简单 C 程序流程图、语句覆盖、路径覆盖。</td><td>白盒与状态图是大题核心，简答偏 PPT 原话。</td></tr>
        <tr><td>C 卷</td><td>待 OCR/人工核验。</td><td>待核验。</td><td>待核验。</td><td>扫描 PDF 当前不能确认题型细节，不能继续当已读往年题样本。</td></tr>
        <tr><td>2024 回忆</td><td>回忆中说客观题基本来自云班课原题；选择可能不标单选/多选。</td><td>为什么需要评审；客户与质量关系；经典质量费用模型；软件测试原则；发布后 bug 处理。</td><td>文件命名格式等价类；中缀转后缀代码的控制流图、环路复杂度、基本路径、测试用例。</td><td>这是已读回忆材料，但仍是“回忆”，不是老师官方题库。</td></tr>
        <tr><td>2025 回忆</td><td>判断 5 分、选择 15 分、填空 8 分，除大题外多为云班课原题；选择单选/多选混考。</td><td>质量管理体系；单元/集成/系统测试侧重点；SQA 人员工作；测量原则；软件测试定义。</td><td>8 位图书编号有效/无效等价类 8 分；链表排序代码的控制流图、复杂度、基本路径、测试用例 40 分。</td><td>这是人工读图后的回忆材料结论，不是官方题库；最该吸收的是大题训练方向。</td></tr>
      </tbody>
    </table>
  </div>

  <h2 id="detailed-index" class="sqr-section-title">四、0-15 章详细目录：复习时就按这个检查</h2>
  <section class="sqr-note"><p><strong>用法：</strong>这一块不是概览，而是检查清单。每一章都按“概念、分类、公式/流程、易错题型”列细。主页面适合快速总览和刷题；如果某章不会，就点卡片里的“进入本章完整讲解”，进入二级章节页从零补完整知识。</p></section>
  <section class="sqr-detail-list" aria-label="0 到 15 章详细知识点目录">
    <article class="sqr-detail-card" id="detail-00">
      <div class="sqr-detail-head"><span>00</span><h3>绪论：考试范围、复习边界、题源优先级</h3></div>
      <a class="sqr-detail-link" href="/courses/software-quality-review-network/chapter-00/">进入本章完整讲解</a>
      <ul class="sqr-kp-list">
        <li>课程主线：软件质量保证理论 + 软件测试基本理论；课程安排只作背景，不作为刷题考点。</li>
        <li>期末题型：判断、选择、填空、简答、设计。</li>
        <li>平时题源：课后习题、课上小测、互评习题、每课一思；云班课已导出 23 道互评简答和 428 道 QUIZ 题。</li>
        <li>互评题老师参考答案已经拿到，适合作为简答题评分点来源。</li>
        <li>期末包含软件测试基本理论，不包含接口、性能、Web、App 专项实验的操作细节。</li>
        <li>复习优先级：CSDN 公开题库 + 云班课 QUIZ 客观题 -> 互评简答参考答案 -> A 卷/2024/2025 回忆中的大题方向 -> PPT 定义。</li>
      </ul>
    </article>
    <article class="sqr-detail-card" id="detail-01">
      <div class="sqr-detail-head"><span>01</span><h3>质量：质量定义、客户关系、质量观点、质量发展</h3></div>
      <a class="sqr-detail-link" href="/courses/software-quality-review-network/chapter-01/">进入本章完整讲解</a>
      <ul class="sqr-kp-list">
        <li>质量定义：一组固有特性满足要求的程度。</li>
        <li>要求包括明示需求、暗示需求、客户和其他相关方要求。</li>
        <li>质量属性：客户属性、成本属性、社会属性、可测性、可预见性。</li>
        <li>客户与质量：质量相对客户存在，服务于客户，客户是质量接受者和判定者。</li>
        <li>客户分类：内部客户、外部客户；每个人都有客户。</li>
        <li>四种质量观点：制造者观点、产品观点、用户观点、价值观点。</li>
        <li>质量概念三层次：符合性质量、适用性质量、广义质量。</li>
        <li>质量形成过程：需求、设计、生产/实现、使用和反馈共同形成质量。</li>
        <li>质量管理发展：检验质量管理、统计质量控制、全面质量管理。</li>
        <li>常见判断：质量不是绝对主观，也不是完全不可测。</li>
      </ul>
    </article>
    <article class="sqr-detail-card" id="detail-02">
      <div class="sqr-detail-head"><span>02</span><h3>软件质量：软件特点、软件过程、缺陷、质量模型</h3></div>
      <a class="sqr-detail-link" href="/courses/software-quality-review-network/chapter-02/">进入本章完整讲解</a>
      <ul class="sqr-kp-list">
        <li>软件特点：无形、复杂、易变、难度量、不会物理磨损。</li>
        <li>软件质量控制难点：缺陷多来自需求、设计、编码和配置，不是制造阶段复制误差。</li>
        <li>软件过程：需求分析、设计、编程、测试、维护。</li>
        <li>需求分析确定软件产品能达到的目标。</li>
        <li>设计把需求转换为数据结构、体系结构、接口、模块和界面。</li>
        <li>测试是对设计、编程进行验证和用户需求确认的过程。</li>
        <li>V 模型：需求对应验收测试，概要/体系结构对应系统/集成测试，详细设计/编码对应单元测试。</li>
        <li>极限编程：测试驱动、持续反馈、可工作的软件重于面面俱到文档。</li>
        <li>软件缺陷内部定义：开发或维护过程中存在的错误、毛病等问题。</li>
        <li>软件缺陷外部定义：系统应实现功能的失效或违背。</li>
        <li>缺陷来源：期限压力、复杂度、沟通不良、疲劳、经验不足、算法/接口/文档/恢复问题。</li>
        <li>软件质量三方面：产品质量、过程质量、商业环境中的质量表现。</li>
        <li>软件质量模型：ISO、McCall、Boehm 用质量特性、准则、度量组织质量评价。</li>
      </ul>
    </article>
    <article class="sqr-detail-card" id="detail-03">
      <div class="sqr-detail-head"><span>03</span><h3>软件质量工程体系：质量体系、质量因素、质量成本</h3></div>
      <a class="sqr-detail-link" href="/courses/software-quality-review-network/chapter-03/">进入本章完整讲解</a>
      <ul class="sqr-kp-list">
        <li>建立质量管理体系：确定质量方针和目标、过程和职责、资源、测量和改进方法。</li>
        <li>质量工程体系构成：质量计划、组织、协调、控制、反馈与调控。</li>
        <li>软件六个品质要素：功能性、可靠性、可用性、效率、可维护性、可移植性。</li>
        <li>质量指标：衡量可识别的软件质量特性的项目。</li>
        <li>质量因素：影响软件质量特性或软件质量指标的参数。</li>
        <li>产品质量因素：功能完整性、可用性、可靠性、性能、可维护性、可测试性、可移植性等。</li>
        <li>过程质量因素：沟通、需求定义方法、项目计划、评审流程、设计标准、协同流程、维护和回归测试流程等。</li>
        <li>质量方针：在质量控制、质量保证和质量管理之上的组织质量方向。</li>
        <li>质量控制 QC：设定标准、测量结果、判断是否达标、采取纠正措施。</li>
        <li>质量保证 QA：有计划、有组织地提供满足质量要求的信任。</li>
        <li>质量改进：持续增强满足质量要求的能力。</li>
        <li>质量成本：为保证满意质量而发生的费用，以及未达到满意质量造成的损失。</li>
        <li>经典质量费用模型：预防费用、评价费用、内部失效费用、外部失效费用。</li>
        <li>劣质成本：损失、返工、故障等因质量不好产生的成本。</li>
      </ul>
    </article>
    <article class="sqr-detail-card" id="detail-04">
      <div class="sqr-detail-head"><span>04</span><h3>软件质量度量：测量、度量、指标、尺度、复杂度</h3></div>
      <a class="sqr-detail-link" href="/courses/software-quality-review-network/chapter-04/">进入本章完整讲解</a>
      <ul class="sqr-kp-list">
        <li>测量：按照规则给属性赋值。</li>
        <li>度量：对软件产品、过程或项目进行范围较广的测度。</li>
        <li>指标：一个度量或一组度量的组合，用来解释质量状况。</li>
        <li>有效性：测量结果能正确反映被测对象实际状态。</li>
        <li>可靠性：测量重复进行时结果稳定一致。</li>
        <li>度量对象：项目质量度量、产品质量度量、过程质量度量。</li>
        <li>项目度量：进度、风险、规模、工作量、顾客满意度。</li>
        <li>产品度量：规模、复杂度、设计特征、性能、质量水平。</li>
        <li>过程度量：缺陷移除效率、测试阶段缺陷、过程改进指标。</li>
        <li>规模度量：代码行、功能点、对象点、特征点。</li>
        <li>复杂度度量：估计或预测软件可测试性、可靠性、可维护性。</li>
        <li>缺陷度量：缺陷密度、缺陷分布、修复工作量、弱点分析。</li>
        <li>McCabe 环路复杂度：V(G)=E-N+2P，也可用区域数或判定节点数+1。</li>
        <li>基本测量原则：目标明确、定义一致客观无二义、方法简单可算、结果可靠、自动化、反馈改进。</li>
      </ul>
    </article>
    <article class="sqr-detail-card" id="detail-05">
      <div class="sqr-detail-head"><span>05</span><h3>软件质量标准：标准层次、ISO、IEEE、CMM/CMMI</h3></div>
      <a class="sqr-detail-link" href="/courses/software-quality-review-network/chapter-05/">进入本章完整讲解</a>
      <ul class="sqr-kp-list">
        <li>标准层次：国际标准、国家标准、行业标准、企业标准。</li>
        <li>国际标准：由国际机构制定和公布，如 ISO。</li>
        <li>行业标准：适用于特定业务领域，由行业机构、学术团体或国防机构制定。</li>
        <li>ISO 9001-3：帮助软件组织解释 ISO 9001 在软件过程中的要求。</li>
        <li>ISO/IEC 15504：软件过程评估标准。</li>
        <li>IEEE 软件工程标准：生命周期过程、评审等。</li>
        <li>软件标准目的：帮助开发商和采购商理解质量含义、实施质量、持续改进质量管理体系。</li>
        <li>CMM/CMMI 思想：以全面质量管理为基础，关注软件过程能力成熟度。</li>
        <li>CMMI 1 级初始级：过程混乱、依赖个人。</li>
        <li>CMMI 2 级已管理级：有基本项目管理行为。</li>
        <li>CMMI 3 级已定义级：组织过程已文档化并标准化。</li>
        <li>CMMI 4 级量化管理级：设定质量和生产目标并量化管理。</li>
        <li>CMMI 5 级优化级：持续改进并使用统计质量控制技术。</li>
      </ul>
    </article>
    <article class="sqr-detail-card" id="detail-06">
      <div class="sqr-detail-head"><span>06</span><h3>软件评审：为什么评审、评审类型、走查与审查</h3></div>
      <a class="sqr-detail-link" href="/courses/software-quality-review-network/chapter-06/">进入本章完整讲解</a>
      <ul class="sqr-kp-list">
        <li>评审目的：尽早发现需求、设计、代码、测试文档中的缺陷。</li>
        <li>成本角度：缺陷越晚发现，修复成本越高。</li>
        <li>技术角度：前一阶段错误会传递并放大到后一阶段。</li>
        <li>效率角度：减少返工、缩短测试调试时间、降低维护压力。</li>
        <li>管理评审：由最高管理层或质量部门组织，评价质量管理体系运行情况。</li>
        <li>技术评审：评价产品和阶段输出，确保需求/设计/实现保持一致。</li>
        <li>文档评审：需求评审、设计评审、代码评审、质量验证评审。</li>
        <li>过程评审：监督组织定义的软件过程是否在项目中被遵守。</li>
        <li>评审材料：检查单、措施、其他必要文档、评审结论和意见。</li>
        <li>走查：作者带领评审人员逐步说明，形式较轻，主要发现问题。</li>
        <li>审查：更正式，有角色、流程、缺陷记录、跟踪和改进作用。</li>
        <li>评审会议结果：接受、修改后接受、重新评审等。</li>
        <li>成功评审要点：目标明确、准备充分、记录缺陷、跟踪关闭。</li>
      </ul>
    </article>
    <article class="sqr-detail-card" id="detail-07">
      <div class="sqr-detail-head"><span>07</span><h3>SQA 组织活动：组织结构、角色职责、SQA 活动</h3></div>
      <a class="sqr-detail-link" href="/courses/software-quality-review-network/chapter-07/">进入本章完整讲解</a>
      <ul class="sqr-kp-list">
        <li>软件质量管理组织：测试部门、软件工程过程组、过程改进网络、质量保证协会等。</li>
        <li>SQA 组织不必照搬标准，应以企业目标为前提。</li>
        <li>组织结构一：独立 SQA 部门，独立性强、资源共享好，但可能远离项目现场。</li>
        <li>组织结构二：项目内独立 SQA 工程师，贴近项目、推动快，但独立性弱。</li>
        <li>组织结构三：独立 SQA 小组/矩阵，兼顾独立性和项目深入，但职责边界要清晰。</li>
        <li>SQA 经理：制定 SQA 策略和发展计划，管理资源，审定项目 SQA 计划，评审状态。</li>
        <li>SQA 工程师：按计划检查产品，执行评审/审核，记录偏差，完成测量度量，报告工作情况。</li>
        <li>SQA 计划：明确质量保证活动、标准、角色、检查点、报告机制。</li>
        <li>SQA 评审/审核：检查活动和工作产品是否符合已定义过程。</li>
        <li>偏差处理：记录不符合项，报告管理层，跟踪直到解决。</li>
        <li>SQA 与项目经理：项目经理负责交付目标，SQA 监督过程符合性和质量风险。</li>
        <li>SQA 是整个组织责任，不只是某个测试人员的责任。</li>
      </ul>
    </article>
    <article class="sqr-detail-card" id="detail-08">
      <div class="sqr-detail-head"><span>08</span><h3>提高软件设计质量：设计目标、评价标准、原则、架构</h3></div>
      <a class="sqr-detail-link" href="/courses/software-quality-review-network/chapter-08/">进入本章完整讲解</a>
      <ul class="sqr-kp-list">
        <li>软件设计：把软件需求转换为软件表示的过程。</li>
        <li>高层次设计：把需求转化为数据结构和软件系统结构。</li>
        <li>详细设计：细化数据结构和算法，给编码人员清晰蓝图。</li>
        <li>设计目标：保证结构、接口、部件功能分配和数据设计的完整性。</li>
        <li>评价标准一：以源系统为标准，关注设计合理性，专家和用户代表参与。</li>
        <li>评价标准二：以分析模型为间接标准，检查分析模型和设计模型一致性。</li>
        <li>评价标准三：以目标系统为产品质量标准，检查最终质量属性。</li>
        <li>设计原则：始终以质量为目标，设计越简单越好。</li>
        <li>技术原则：开闭原则、抽象、针对接口编程、尽量从抽象类继承。</li>
        <li>体系结构：C/S、B/S、多层分布式结构。</li>
        <li>耦合从强到弱：内容耦合、公共耦合、控制耦合、标记耦合、数据耦合。</li>
        <li>内聚从强到弱：功能内聚、顺序内聚、通信内聚、过程内聚、时间内聚、逻辑内聚、偶然内聚。</li>
        <li>数据库设计质量：数据结构、数据字典、完整性、性能、安全、可维护。</li>
      </ul>
    </article>
    <article class="sqr-detail-card" id="detail-09">
      <div class="sqr-detail-head"><span>09</span><h3>高质量编程：命名、版式、函数、表达式、内存</h3></div>
      <a class="sqr-detail-link" href="/courses/software-quality-review-network/chapter-09/">进入本章完整讲解</a>
      <ul class="sqr-kp-list">
        <li>命名：标识符应清晰、统一，必要时使用前缀避免库冲突。</li>
        <li>头文件：标准库用 &lt;filename.h&gt;，非标准库用 "filename.h"。</li>
        <li>类设计版式：数据和行为顺序要保持一致，便于理解。</li>
        <li>布尔变量判断：用 if(flag) 或 if(!flag)，不要和 TRUE/FALSE 比较。</li>
        <li>整型与零比较：可用 ==0、!=0。</li>
        <li>浮点与零比较：用误差范围判断，避免直接 ==0。</li>
        <li>指针与零比较：用 p == NULL 或 p != NULL。</li>
        <li>函数参数：只输入的指针参数应加 const，防止函数内误改。</li>
        <li>大对象传参：优先 const 引用，避免值传递开销。</li>
        <li>变量初始化：定义时就近初始化，避免使用未初始化值。</li>
        <li>动态内存：malloc/free、new/delete 配对，申请和释放次数相同。</li>
        <li>内存泄漏：申请后没有释放。</li>
        <li>野指针：未初始化、释放后未置 NULL、返回局部变量地址。</li>
        <li>释放后处理：free/delete 后立即置 NULL，不返回已释放指针。</li>
      </ul>
    </article>
    <article class="sqr-detail-card" id="detail-10">
      <div class="sqr-detail-head"><span>10</span><h3>软件测试：目标、原则、过程、用例、调试</h3></div>
      <a class="sqr-detail-link" href="/courses/software-quality-review-network/chapter-10/">进入本章完整讲解</a>
      <ul class="sqr-kp-list">
        <li>软件测试定义：为了发现错误而执行程序的过程。</li>
        <li>测试内容：需求、设计、代码、文档、数据、运行环境都可能成为测试对象。</li>
        <li>测试目标：尽可能多发现缺陷，并评价软件质量。</li>
        <li>测试不能证明程序没有缺陷，只能增加信心。</li>
        <li>测试原则：追溯用户需求，尽早并不断测试，注意缺陷群集，回归测试，增量测试。</li>
        <li>测试计划是做好测试工作的前提。</li>
        <li>测试过程：计划、设计用例、准备环境和数据、执行、记录缺陷、修复跟踪、回归、报告。</li>
        <li>三类信息：输入信息、执行信息、输出/预期信息。</li>
        <li>测试用例：输入数据 + 预期输出结果，完整时还包括前置条件、步骤、环境、实际结果。</li>
        <li>静态测试：不运行程序，如评审、走查、审查、静态分析。</li>
        <li>动态测试：运行程序并观察输出或行为。</li>
        <li>测试与调试：测试发现错误，调试定位和修正错误。</li>
        <li>回归测试：修改后重测，确认修复有效且没有破坏旧功能。</li>
        <li>测试停止标准：结合缺陷数量、风险和测试投入成本判断。</li>
      </ul>
    </article>
    <article class="sqr-detail-card" id="detail-11">
      <div class="sqr-detail-head"><span>11</span><h3>白盒测试：覆盖准则、控制流、数据流、基本路径</h3></div>
      <a class="sqr-detail-link" href="/courses/software-quality-review-network/chapter-11/">进入本章完整讲解</a>
      <ul class="sqr-kp-list">
        <li>白盒测试也称结构测试或逻辑驱动测试。</li>
        <li>白盒依据程序内部逻辑结构设计或选择测试用例。</li>
        <li>适用层次：单元测试、部分集成测试。</li>
        <li>检查重点：模块接口、局部数据结构、边界条件、独立路径、内部错误处理。</li>
        <li>语句覆盖：每条可执行语句至少执行一次，发现错误能力最弱。</li>
        <li>判定覆盖：每个判定的真/假分支至少执行一次。</li>
        <li>条件覆盖：每个条件取真/假的情况至少出现一次。</li>
        <li>判定/条件覆盖：判定结果和条件结果都要覆盖。</li>
        <li>条件组合覆盖：每个判定中条件结果的所有组合至少出现一次。</li>
        <li>路径覆盖：覆盖程序可能执行路径，强但成本高。</li>
        <li>控制流图：节点表示基本块，边表示控制转移。</li>
        <li>环路复杂度：V(G)=E-N+2P、区域数、判定节点数+1。</li>
        <li>基本路径：数量通常等于环路复杂度，每条路径引入新边。</li>
        <li>数据流测试：关注变量定义-使用链，发现未初始化、定义后未用等问题。</li>
        <li>覆盖率 100% 不等于没有缺陷。</li>
      </ul>
    </article>
    <article class="sqr-detail-card" id="detail-12">
      <div class="sqr-detail-head"><span>12</span><h3>黑盒测试：等价类、边界值、判定表、场景和状态</h3></div>
      <a class="sqr-detail-link" href="/courses/software-quality-review-network/chapter-12/">进入本章完整讲解</a>
      <ul class="sqr-kp-list">
        <li>黑盒测试也称功能测试，主要依据规格说明和用户行为。</li>
        <li>黑盒不考虑程序内部逻辑结构，重点看输入输出和功能表现。</li>
        <li>试图发现：功能错误、接口错误、数据结构/数据库访问错误、性能错误、初始化/终止错误。</li>
        <li>等价类划分：把输入或输出划分成有效等价类和无效等价类。</li>
        <li>有效等价类：符合规格、能代表一类合法输入。</li>
        <li>无效等价类：不符合规格，最好一类一个用例。</li>
        <li>边界值分析：在输入/输出边界及附近设计用例。</li>
        <li>闭区间常取：a-1、a、a+1、正常值、b-1、b、b+1。</li>
        <li>一般边界值分析：一个变量取边界，其他变量取正常值。</li>
        <li>因果图：分析输入条件与输出结果之间的因果关系。</li>
        <li>判定表：适合条件组合和业务规则复杂的场景。</li>
        <li>场景法：适合业务流程清楚的功能，如登录、下单、提交。</li>
        <li>状态迁移测试：适合状态和事件明确的系统，如售票、查询、付款。</li>
        <li>错误推测：根据经验猜测容易出错的位置。</li>
      </ul>
    </article>
    <article class="sqr-detail-card" id="detail-13">
      <div class="sqr-detail-head"><span>13</span><h3>集成测试：接口、策略、桩模块、驱动模块</h3></div>
      <a class="sqr-detail-link" href="/courses/software-quality-review-network/chapter-13/">进入本章完整讲解</a>
      <ul class="sqr-kp-list">
        <li>集成测试也叫组装测试或联合测试。</li>
        <li>位置：单元测试之后，系统测试之前。</li>
        <li>重点：模块接口、参数传递、返回值、调用顺序、全局数据、共享状态、异常传播。</li>
        <li>集成测试与单元测试区别：单元看模块内部，集成看模块协作。</li>
        <li>非增量式集成：一次性组装，问题定位困难。</li>
        <li>增量式集成：逐步组装，便于定位问题。</li>
        <li>自顶向下：从主控模块向下集成，需要桩模块模拟下层模块。</li>
        <li>自底向上：从底层模块向上集成，需要驱动模块调用被测模块。</li>
        <li>混合/三明治：结合自顶向下和自底向上。</li>
        <li>桩模块：模拟被测模块调用的下级模块。</li>
        <li>驱动模块：模拟上级模块或主程序，调用被测模块。</li>
        <li>集成测试用例应覆盖接口数据、调用路径、错误处理和模块间副作用。</li>
      </ul>
    </article>
    <article class="sqr-detail-card" id="detail-14">
      <div class="sqr-detail-head"><span>14</span><h3>系统测试：完整系统、功能、性能、安全、恢复</h3></div>
      <a class="sqr-detail-link" href="/courses/software-quality-review-network/chapter-14/">进入本章完整讲解</a>
      <ul class="sqr-kp-list">
        <li>系统测试把已集成软件与硬件、外设、支撑软件、数据、人员放到接近真实环境检验。</li>
        <li>目标：确认完整系统是否满足系统规格说明。</li>
        <li>系统测试不同于集成测试：集成看模块接口，系统看完整产品和环境。</li>
        <li>功能测试：检查功能、性能是否与需求规格说明相同。</li>
        <li>性能测试：响应时间、吞吐量、并发能力、资源占用、稳定性。</li>
        <li>负载测试：预期工作负荷下表现。</li>
        <li>压力/强度测试：高负荷或异常负荷下瓶颈和崩溃边界。</li>
        <li>容量测试：最大用户数、数据量、事务量。</li>
        <li>安全测试：应用层和系统层，认证、授权、输入校验、数据保护、配置和网络。</li>
        <li>恢复测试：系统故障后是否能恢复数据和服务。</li>
        <li>兼容/配置/安装测试：检查不同环境、安装卸载、配置组合。</li>
        <li>压力测试通常需要工具支持，人工点击不能稳定模拟高并发。</li>
      </ul>
    </article>
    <article class="sqr-detail-card" id="detail-15">
      <div class="sqr-detail-head"><span>15</span><h3>验收测试：交付前确认、用户参与、Alpha/Beta</h3></div>
      <a class="sqr-detail-link" href="/courses/software-quality-review-network/chapter-15/">进入本章完整讲解</a>
      <ul class="sqr-kp-list">
        <li>验收测试是部署或交付前的最后一类确认/技术测试。</li>
        <li>目的：确保软件满足合同、需求规格说明、业务目标和验收标准。</li>
        <li>参与者：最终用户、客户代表、业务方通常要参与。</li>
        <li>验收依据：合同、需求规格、用户业务流程、验收标准。</li>
        <li>验收步骤：制定计划、准备环境和数据、执行验收用例、记录问题、确认结果、形成报告。</li>
        <li>完成标准：关键功能满足、严重缺陷关闭或被正式接受、文档和交付物齐全。</li>
        <li>用户验收测试：业务方按真实业务场景确认系统是否可用。</li>
        <li>Alpha 测试：通常在开发方受控环境下由内部或邀请用户完成。</li>
        <li>Beta 测试：在外部或接近真实用户环境中试用并反馈问题。</li>
        <li>常见错误：认为“多做了额外功能”就可以忽略核心缺陷。</li>
      </ul>
    </article>
  </section>

  <h2 id="knowledge" class="sqr-section-title">五、完整知识体系：0-15 章一张网</h2>
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

  <h2 id="must-short" class="sqr-section-title">六、简答题优先级：先背云班课互评评分点</h2>
  <section class="sqr-note"><p><strong>卷面格式：</strong>简答题不要写成一句话。建议每题写 3 到 6 个点，每点独立成句。能写“定义、分类、作用、区别、结论”的题，一定按这个顺序写。</p></section>
  <div class="sqr-grid">
    <article class="sqr-card"><span class="sqr-badge hot">一级必背</span><h3>2024 回忆已出现 + PPT 高频</h3><ul class="sqr-list"><li>为什么需要软件评审：成本、技术、效率。</li><li>客户与质量关系：相互依赖、客户接受、质量相对客户存在并由客户判定。</li><li>经典质量费用模型：预防、评价、内部失效、外部失效。</li><li>质量管理体系：质量方针、目标、职责、资源、产品实现、测量分析改进。</li><li>SQA 人员工作：计划、过程描述、评审、审计、记录偏差、报告、跟踪、度量。</li><li>基本测量原则：目标、定义一致客观、简单可算、剪裁、自动化、统计关系、可靠、反馈。</li><li>软件测试定义：为了发现错误而执行程序，依据规格和结构设计用例。</li><li>单元/集成/系统测试侧重点。</li></ul></article>
    <article class="sqr-card"><span class="sqr-badge apply">二级必背</span><h3>老卷与题库反复出现</h3><ul class="sqr-list"><li>SQA 三种组织结构及优缺点。</li><li>软件缺陷内部/外部定义。</li><li>走查与审查区别。</li><li>ISO/McCall/Boehm 三种质量模型评价。</li><li>软件测试与调试区别。</li><li>回归测试目的。</li><li>测试用例定义。</li><li>桩模块与驱动模块。</li><li>白盒与黑盒测试区别。</li><li>负载、容量、强度/压力测试区别。</li></ul></article>
  </div>

  <h2 id="design-drill" class="sqr-section-title">七、大题设计题：高分值必须单独练</h2>
  <section class="sqr-note"><p><strong>大题拿分原则：</strong>题面会换，但评分动作基本不变：列规则、分等价类、取边界值、画控制流图/状态图、算复杂度、列基本路径、写测试用例。卷面上一定要有表格和编号。</p></section>
  <div class="sqr-grid">
    <article class="sqr-card"><span class="sqr-badge hot">等价类</span><h3>2025 图书编号题怎么拆</h3><p>2025 回忆里的 8 位图书编号可拆成三段：1-2 位楼层、3-5 位书架、6-8 位图书。有效类：楼层 01-11、书架 001-120、图书 001-300，且全为数字、长度为 8。无效类至少按字段拆：长度错误、非数字、楼层 00/12 及以上、书架 000/121 及以上、图书 000/301 及以上。</p><ul class="sqr-list" style="margin-top:10px"><li>有效例：01001001、11120300。</li><li>无效例：00001001、12001001、01121001、01000301、01A01001、0100100。</li><li>卷面表：编号、输入、覆盖等价类、预期结果；这块是按回忆题面整理，不是老师官方答案。</li></ul></article>
    <article class="sqr-card"><span class="sqr-badge hot">等价类</span><h3>2024 文件命名题怎么拆</h3><p>命名格式可按“班级号 + 学号”拆。第一位 1-6，后三位表示 001-300 的学号，且总长度固定为 4、全部为数字。有效类是班级合法且学号合法；无效类按长度、班级、学号、字符类型分别写。</p><ul class="sqr-list" style="margin-top:10px"><li>有效例：1001、6300。</li><li>无效例：0100、7100、1000、1301、1A01、101、10001。</li><li>不要把 1-099、100-199、200-299 当作主要等价类，那更像把有效类又切细，漏掉了无效类。</li></ul></article>
    <article class="sqr-card"><span class="sqr-badge apply">边界值</span><h3>一般边界值 4n+1</h3><p>函数 f(x,y)，x 属于 [100,200]，y 属于 [5,15]。一般边界值分析让一个变量取边界，其他变量取正常值。取 X=150，Y=10，则 9 个用例为：</p><ul class="sqr-list" style="margin-top:10px"><li>(100,10)、(101,10)、(199,10)、(200,10)</li><li>(150,5)、(150,6)、(150,14)、(150,15)</li><li>(150,10)</li></ul></article>
    <article class="sqr-card"><span class="sqr-badge apply">白盒</span><h3>控制流图/复杂度/基本路径</h3><p>答题顺序固定：给语句编号 -> 画控制流图 -> 算 V(G) -> 列独立路径 -> 为每条路径写输入和预期输出。复杂度三算法要对上：V(G)=E-N+2P，区域数，判定节点数+1。</p><ul class="sqr-list" style="margin-top:10px"><li>如果代码有 2 个普通 if，通常 V(G)=3。</li><li>如果题目要求把复合条件拆成短路判断，判定节点会增加，要按图重新算。</li><li>路径表必须写节点序列，不要只写“真/假”。</li></ul></article>
    <article class="sqr-card"><span class="sqr-badge apply">状态图</span><h3>售票/查询系统状态迁移题</h3><p>先圈状态，再圈事件。状态可以是等待、待付款、查证、警告、超时、出票、退票；事件可以是到站、付款、取消、超时、退票、查证成功/失败。图上边要标事件或条件。</p><ul class="sqr-list" style="margin-top:10px"><li>状态表：S1 等待、S2 待付款、S3 查证、S4 警告、S5 超时、S6 出票、S7 退票。</li><li>测试路径：从初始等待出发，覆盖成功出票、取消、超时、退票成功、退票失败等迁移。</li><li>题目要“状态图”时不要画成普通流程图。</li></ul></article>
    <article class="sqr-card"><span class="sqr-badge hot">卷面模板</span><h3>四张表保底拿步骤分</h3><ul class="sqr-list"><li>规则拆分表：字段、合法范围、非法情况。</li><li>等价类/边界表：编号、有效/无效、代表值。</li><li>路径表：路径编号、节点序列、覆盖分支。</li><li>测试用例表：输入、覆盖对象、预期输出。</li></ul></article>
  </div>

  <h2 id="question-bank" class="sqr-section-title">八、题库入口：云班课已核题库 + CSDN公开题库</h2>
  <section class="sqr-note"><p><strong>来源状态：</strong>云班课已导出 23 道互评简答老师参考答案、23 个课上/课后 QUIZ 共 428 道题；CSDN 主公开页已整理为 298 个题目/题组条目，另补充标记 2025 CSDN 题（一）里出现的高频填空点。剩余 1 个“测试相关未分类习题”在云班课接口返回“老师暂未公布答案，无法查看结果”，所以云班课页不伪装成已读；但 CSDN 对照页已经把公开可见的未分类题单独列出。</p></section>
  <div class="sqr-grid three">
    <article class="sqr-card"><span class="sqr-badge hot">互评简答</span><h3>23 道老师参考答案</h3><p>这些题来自云班课 HOMEWORK 的 <code>refAnswer</code> 字段，分为质量、测试基本、测试实际三组，适合作为简答题评分点背诵。</p><p style="margin-top:10px"><a class="sqr-detail-link" href="/courses/software-quality-exercises/#peer">打开互评简答</a></p></article>
    <article class="sqr-card"><span class="sqr-badge core">客观题</span><h3>428 道课上/课后 QUIZ</h3><p>题目来自云班课 QUIZ 接口，选择/判断题带答案索引，填空题从单题详情补齐 <code>fill.blankAlternatives</code>。</p><p style="margin-top:10px"><a class="sqr-detail-link" href="/courses/software-quality-exercises/">打开云班课题库页</a></p></article>
    <article class="sqr-card"><span class="sqr-badge apply">CSDN</span><h3>298 个公开题库条目</h3><p>CSDN 主原文按互评题、章节课后习题和测试相关未分类习题整理，包含云班课接口暂未开放答案的未分类题；2025 CSDN 补充题用于标记驱动/桩模块、<code>6n+1</code>、因果图法等高频客观题点。</p><p style="margin-top:10px"><a class="sqr-detail-link" href="/courses/software-quality-csdn-bank/">打开 CSDN 题库对照页</a></p></article>
    <article class="sqr-card"><span class="sqr-badge apply">高分题</span><h3>大题设计题单独练</h3><p>大题不靠背题库，靠模板：等价类、边界值、状态图、控制流图、环路复杂度、基本路径和测试用例表。</p><p style="margin-top:10px"><a class="sqr-detail-link" href="/courses/software-quality-design-questions/">打开大题专项</a></p></article>
  </div>

  <h2 id="last-day" class="sqr-section-title">九、最后一天冲刺清单</h2>
  <div class="sqr-grid">
    <article class="sqr-print"><h3>2 小时背诵</h3><ul class="sqr-list"><li>质量、软件质量、缺陷、测试、测试用例、回归测试。</li><li>为什么评审、质量费用模型、质量管理体系、测量原则。</li><li>SQA 工作内容和三种组织结构。</li><li>白盒/黑盒、单元/集成/系统/验收、桩/驱动。</li></ul></article>
    <article class="sqr-print"><h3>2 小时大题</h3><ul class="sqr-list"><li>做 1 道编号/命名格式等价类题。</li><li>做 1 道 x/y 边界值题。</li><li>做 1 道 if/while 控制流图题。</li><li>做 1 道状态迁移题。</li></ul></article>
  </div>
  <section class="sqr-note"><p><strong>公开来源：</strong><a href="https://blog.csdn.net/m0_56942491/article/details/131734756" target="_blank" rel="noopener">CSDN 题库整理</a>；<a href="https://blog.csdn.net/qq_43055855/article/details/148869571" target="_blank" rel="noopener">2025 CSDN 补充题（一）</a>；<a href="https://www.mosoteach.cn/web/cc-detail/4851E258-439C-11F1-BAE9-A088C2A30E68/act/" target="_blank" rel="noopener">蓝墨云班课活动页</a>。当前状态：云班课登录态已读取活动清单和题库；CSDN 公开题库已单独整理为对照页；2025 图片回忆已人工读出大题结构，C 卷仍待 OCR/人工核验。博客中不包含登录 token、手机号或用户 ID。</p></section>
    </main>
  </div>
</div>
