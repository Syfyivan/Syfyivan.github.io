---
title: "软件质量与测试 · 设计题例题：一题学会程序流程图、语句覆盖和路径覆盖"
date: 2026-06-24 13:50:00
description: "用往年 A 卷的一道真实代码题，直接讲清楚题目、解题步骤和答案。"
---

<style>
.sqo-page {
  --sqo-ink: #1f252c;
  --sqo-text: #44515d;
  --sqo-line: rgba(31, 37, 44, 0.12);
  --sqo-panel: #ffffff;
  --sqo-wash: #f7f8f4;
  --sqo-blue: #345b8c;
  --sqo-green: #2f6f5e;
  --sqo-rust: #9f5137;
  max-width: 900px;
  margin: 0 auto;
  color: var(--sqo-ink);
}
.sqo-page * { box-sizing: border-box; }
.sqo-hero,
.sqo-block,
.sqo-note,
.sqo-table-wrap {
  border: 1px solid var(--sqo-line);
  border-radius: 8px;
  background: var(--sqo-panel);
  box-shadow: 0 10px 26px rgba(31, 37, 44, 0.05);
}
.sqo-hero,
.sqo-block,
.sqo-note {
  padding: 22px;
}
.sqo-hero {
  border-left: 5px solid var(--sqo-rust);
  background: linear-gradient(135deg, rgba(159, 81, 55, 0.08), rgba(52, 91, 140, 0.06)), var(--sqo-panel);
}
.sqo-kicker {
  display: inline-flex;
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(159, 81, 55, 0.12);
  color: var(--sqo-rust);
  font-size: 13px;
  font-weight: 700;
}
.sqo-hero h2,
.sqo-section-title,
.sqo-block h3 {
  margin: 12px 0 0;
  letter-spacing: 0;
}
.sqo-hero h2 {
  font-size: 30px;
  line-height: 1.3;
}
.sqo-hero p,
.sqo-block p,
.sqo-note p,
.sqo-table td,
.sqo-table th,
.sqo-list li {
  line-height: 1.85;
}
.sqo-hero p,
.sqo-block p,
.sqo-note p {
  margin: 12px 0 0;
  color: var(--sqo-text);
}
.sqo-section-title {
  margin: 28px 0 14px;
  font-size: 24px;
}
.sqo-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
.sqo-block h3 {
  font-size: 20px;
}
.sqo-badge {
  display: inline-flex;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  color: var(--sqo-blue);
  background: rgba(52, 91, 140, 0.1);
}
.sqo-note {
  border-left: 5px solid var(--sqo-green);
  background: var(--sqo-wash);
}
.sqo-figure {
  margin: 0;
  border: 1px solid var(--sqo-line);
  border-radius: 8px;
  overflow: hidden;
  background: var(--sqo-panel);
}
.sqo-figure img {
  display: block;
  width: 100%;
  height: auto;
}
.sqo-figure figcaption {
  padding: 12px 14px;
  color: var(--sqo-text);
  line-height: 1.75;
  background: var(--sqo-wash);
}
.sqo-code {
  margin: 12px 0 0;
  padding: 14px;
  border-radius: 8px;
  background: #f6f8fb;
  border: 1px solid rgba(52, 91, 140, 0.12);
  overflow-x: auto;
  line-height: 1.7;
}
.sqo-code code,
.sqo-inline-code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
.sqo-table-wrap {
  overflow-x: auto;
}
.sqo-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 620px;
}
.sqo-table th,
.sqo-table td {
  padding: 12px 14px;
  border-bottom: 1px solid var(--sqo-line);
  text-align: left;
  vertical-align: top;
}
.sqo-table th {
  background: #f4f6f8;
}
.sqo-table tr:last-child td { border-bottom: 0; }
.sqo-list {
  margin: 12px 0 0;
  padding-left: 1.2em;
}
html[data-user-color-scheme="dark"] .sqo-page {
  --sqo-ink: rgba(245, 247, 250, 0.94);
  --sqo-text: rgba(223, 230, 236, 0.78);
  --sqo-line: rgba(255, 255, 255, 0.1);
  --sqo-panel: rgba(29, 33, 39, 0.92);
  --sqo-wash: rgba(255, 255, 255, 0.05);
}
html[data-user-color-scheme="dark"] .sqo-code,
html[data-user-color-scheme="dark"] .sqo-table th {
  background: rgba(255, 255, 255, 0.05);
}
@media (max-width: 760px) {
  .sqo-grid { grid-template-columns: 1fr; }
  .sqo-hero h2 { font-size: 25px; }
  .sqo-hero,
  .sqo-block,
  .sqo-note { padding: 18px; }
}
</style>

<div class="sqo-page">
  <section class="sqo-hero">
    <span class="sqo-kicker">One Worked Example / 只讲一题</span>
    <h2>一道真实往年题，直接讲清楚：题目是什么、怎么做、答案是什么</h2>
    <p>这页不再分类，也不再同时讲很多题型。只用往年 A 卷的一道真实代码题，教会你 3 件事：怎么画程序流程图、怎么做语句覆盖、怎么做路径覆盖。</p>
  </section>

  <h2 class="sqo-section-title">1. 题目</h2>
  <figure class="sqo-figure">
    <img src="/img/courses/software-quality/design-a-paper-question.png" alt="往年 A 卷代码设计题原图">
    <figcaption>往年 A 卷真实题目截图。下面这一题要求你做 3 件事：<strong>画程序流程图</strong>、<strong>设计语句覆盖测试用例</strong>、<strong>设计路径覆盖测试用例</strong>。</figcaption>
  </figure>

  <section class="sqo-note" style="margin-top:14px">
    <p><strong>把题目翻成大白话：</strong>程序里有两个判断。你要先看程序会怎么走，然后选输入数据，让程序按不同路线执行。老师要的不是 C 语言语法，而是你能不能把“路线”和“测试输入”对应起来。</p>
  </section>

  <h2 class="sqo-section-title">2. 怎么做</h2>
  <div class="sqo-grid">
    <article class="sqo-block">
      <span class="sqo-badge">第一步</span>
      <h3>先找判断点</h3>
      <p>这道题里有两个判断：</p>
      <ul class="sqo-list">
        <li><strong>D1：</strong><span class="sqo-inline-code">x &gt; 0 || y &lt; 0</span></li>
        <li><strong>D2：</strong><span class="sqo-inline-code">z &gt; 0</span></li>
      </ul>
      <p>D1 决定走 <span class="sqo-inline-code">n=n+x</span> 还是 <span class="sqo-inline-code">n=n+y</span>，D2 决定要不要再执行 <span class="sqo-inline-code">n=n+z</span>。</p>
    </article>
    <article class="sqo-block">
      <span class="sqo-badge">第二步</span>
      <h3>先想“有几条路”</h3>
      <p>因为 D1 有真/假两种，D2 也有真/假两种，所以完整路径一共 4 条：</p>
      <ul class="sqo-list">
        <li>D1 真，D2 真</li>
        <li>D1 真，D2 假</li>
        <li>D1 假，D2 真</li>
        <li>D1 假，D2 假</li>
      </ul>
      <p>这就是后面路径覆盖要覆盖的 4 种情况。</p>
    </article>
  </div>

  <section class="sqo-block" style="margin-top:14px">
    <span class="sqo-badge">第三步</span>
    <h3>画图时就按程序执行顺序写</h3>
    <div class="sqo-code"><code>开始
  ↓
n = 1
  ↓
判断 D1：x &gt; 0 或 y &lt; 0 ?
  ├─ 真：n = n + x
  └─ 假：n = n + y
            ↓
判断 D2：z &gt; 0 ?
  ├─ 真：n = n + z
  └─ 假：跳过
            ↓
return n
  ↓
结束</code></div>
    <p>卷子上你可以把它画成方框和菱形。这里我用文字版写，是为了让你先看懂，不是为了好看。</p>
  </section>

  <section class="sqo-note" style="margin-top:14px">
    <p><strong>最重要的判断：</strong></p>
    <ul class="sqo-list">
      <li><strong>语句覆盖：</strong>只要求每条语句至少执行一次，所以 2 组数据就够。</li>
      <li><strong>路径覆盖：</strong>要求 4 条完整路径都走到，所以要 4 组数据。</li>
    </ul>
  </section>

  <h2 class="sqo-section-title">3. 答案</h2>

  <article class="sqo-block">
    <span class="sqo-badge">答案 1</span>
    <h3>程序流程图怎么理解</h3>
    <p>程序流程图的核心就是上面那段顺序：</p>
    <ul class="sqo-list">
      <li>初始化 <span class="sqo-inline-code">n=1</span></li>
      <li>判断 D1，分成两支：加 <span class="sqo-inline-code">x</span> 或加 <span class="sqo-inline-code">y</span></li>
      <li>再判断 D2：如果 <span class="sqo-inline-code">z&gt;0</span>，就再加一次 <span class="sqo-inline-code">z</span></li>
      <li>最后返回 <span class="sqo-inline-code">n</span></li>
    </ul>
    <p>如果写到卷子上，按这个顺序画出来就可以了。</p>
  </article>

  <h3 class="sqo-section-title" style="font-size:22px">答案 2：语句覆盖测试用例</h3>
  <div class="sqo-table-wrap">
    <table class="sqo-table">
      <thead>
        <tr>
          <th>用例</th>
          <th>输入</th>
          <th>为什么这样选</th>
          <th>输出</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>T1</td>
          <td><span class="sqo-inline-code">x=1, y=0, z=1</span></td>
          <td>D1 为真，执行 <span class="sqo-inline-code">n=n+x</span>；D2 为真，执行 <span class="sqo-inline-code">n=n+z</span></td>
          <td><span class="sqo-inline-code">n=3</span></td>
        </tr>
        <tr>
          <td>T2</td>
          <td><span class="sqo-inline-code">x=0, y=0, z=0</span></td>
          <td>D1 为假，执行 <span class="sqo-inline-code">n=n+y</span>；D2 为假，直接返回</td>
          <td><span class="sqo-inline-code">n=1</span></td>
        </tr>
      </tbody>
    </table>
  </div>
  <section class="sqo-note" style="margin-top:14px">
    <p><strong>为什么 2 组就够？</strong> 因为这 2 组已经把 3 条关键语句都覆盖了：<span class="sqo-inline-code">n=n+x</span>、<span class="sqo-inline-code">n=n+y</span>、<span class="sqo-inline-code">n=n+z</span>。</p>
  </section>

  <h3 class="sqo-section-title" style="font-size:22px">答案 3：路径覆盖测试用例</h3>
  <div class="sqo-table-wrap">
    <table class="sqo-table">
      <thead>
        <tr>
          <th>路径</th>
          <th>条件</th>
          <th>输入</th>
          <th>输出</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>P1</td>
          <td>D1 真，D2 真</td>
          <td><span class="sqo-inline-code">x=1, y=0, z=1</span></td>
          <td><span class="sqo-inline-code">n=3</span></td>
        </tr>
        <tr>
          <td>P2</td>
          <td>D1 真，D2 假</td>
          <td><span class="sqo-inline-code">x=1, y=0, z=0</span></td>
          <td><span class="sqo-inline-code">n=2</span></td>
        </tr>
        <tr>
          <td>P3</td>
          <td>D1 假，D2 真</td>
          <td><span class="sqo-inline-code">x=0, y=0, z=1</span></td>
          <td><span class="sqo-inline-code">n=2</span></td>
        </tr>
        <tr>
          <td>P4</td>
          <td>D1 假，D2 假</td>
          <td><span class="sqo-inline-code">x=0, y=0, z=0</span></td>
          <td><span class="sqo-inline-code">n=1</span></td>
        </tr>
      </tbody>
    </table>
  </div>

  <section class="sqo-note" style="margin-top:14px">
    <p><strong>一句话记住这题：</strong> 先找判断点，再数路径，最后每条路径配一组输入。语句覆盖看“语句都执行过没有”，路径覆盖看“每条完整路线都走过没有”。</p>
  </section>
</div>
