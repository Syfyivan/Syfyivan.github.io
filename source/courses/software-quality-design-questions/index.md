---
title: "软件质量与测试 · 设计题大题专项"
date: 2026-06-23 09:10:00
description: "面向零基础同学的《软件质量与测试》期末设计题专项：等价类、边界值、控制流图、环路复杂度、基本路径、测试用例和状态图的做题流程。"
---

<style>
.sqd-page {
  --sqd-ink: #20242a;
  --sqd-text: #303843;
  --sqd-muted: #65717e;
  --sqd-line: rgba(32, 36, 42, 0.13);
  --sqd-panel: #ffffff;
  --sqd-wash: #f7f8f4;
  --sqd-green: #2f6f5e;
  --sqd-blue: #365f91;
  --sqd-rust: #a14f35;
  --sqd-gold: #8a6f2e;
  max-width: 1040px;
  margin: 0 auto;
  color: var(--sqd-text);
}
.sqd-page * { box-sizing: border-box; min-width: 0; }
.sqd-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.18fr) minmax(260px, 0.82fr);
  gap: 24px;
  align-items: end;
  padding: 30px;
  border: 1px solid var(--sqd-line);
  border-left: 5px solid var(--sqd-rust);
  border-radius: 6px;
  background: linear-gradient(135deg, rgba(161, 79, 53, 0.08), rgba(54, 95, 145, 0.08)), var(--sqd-panel);
  box-shadow: 0 12px 30px rgba(32, 36, 42, 0.07);
}
.sqd-kicker,
.sqd-badge,
.sqd-chip {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  min-height: 30px;
  padding: 5px 9px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 780;
}
.sqd-kicker {
  margin-bottom: 14px;
  color: var(--sqd-rust);
  background: rgba(161, 79, 53, 0.12);
}
.sqd-hero h2,
.sqd-section-title,
.sqd-card h3,
.sqd-mini h4 {
  letter-spacing: 0;
}
.sqd-hero h2 {
  margin: 0 0 14px;
  color: var(--sqd-ink);
  font-size: 28px;
  line-height: 1.24;
}
.sqd-hero p,
.sqd-card p,
.sqd-note p,
.sqd-mini p,
.sqd-table td,
.sqd-table th,
.sqd-list li {
  line-height: 1.82;
}
.sqd-hero p,
.sqd-card p,
.sqd-note p,
.sqd-mini p { margin: 0; }
.sqd-hero p,
.sqd-card p,
.sqd-mini p,
.sqd-table td,
.sqd-list li {
  color: var(--sqd-muted);
}
.sqd-actions,
.sqd-nav,
.sqd-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}
.sqd-actions {
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid var(--sqd-line);
}
.sqd-link,
.sqd-chip {
  justify-content: center;
  min-height: 38px;
  padding: 8px 13px;
  border: 1px solid rgba(161, 79, 53, 0.28);
  border-radius: 6px;
  color: var(--sqd-rust);
  font-weight: 780;
  text-decoration: none !important;
  white-space: nowrap;
}
.sqd-link:hover,
.sqd-link:focus,
.sqd-chip:hover,
.sqd-chip:focus {
  color: #ffffff;
  background: var(--sqd-rust);
}
.sqd-stat-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
.sqd-stat {
  min-height: 96px;
  padding: 14px;
  border: 1px solid var(--sqd-line);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.78);
}
.sqd-stat strong {
  display: block;
  color: var(--sqd-blue);
  font-size: 23px;
  line-height: 1.1;
}
.sqd-stat span {
  display: block;
  margin-top: 7px;
  color: var(--sqd-muted);
  font-size: 13px;
  line-height: 1.55;
}
.sqd-note {
  margin-top: 18px;
  padding: 16px 18px;
  border-left: 4px solid var(--sqd-green);
  border-radius: 6px;
  background: var(--sqd-wash);
}
.sqd-note strong,
.sqd-card strong,
.sqd-mini strong {
  color: var(--sqd-ink);
}
.sqd-nav {
  margin: 18px 0 4px;
}
.sqd-chip {
  border-color: rgba(54, 95, 145, 0.28);
  color: var(--sqd-blue);
}
.sqd-chip:hover,
.sqd-chip:focus { background: var(--sqd-blue); }
.sqd-section-title {
  margin: 34px 0 16px;
  color: var(--sqd-ink);
  font-size: 23px;
}
.sqd-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
.sqd-grid.three {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.sqd-card,
.sqd-mini {
  border: 1px solid var(--sqd-line);
  border-radius: 6px;
  background: var(--sqd-panel);
  box-shadow: 0 10px 24px rgba(32, 36, 42, 0.055);
}
.sqd-card {
  padding: 18px;
}
.sqd-card h3 {
  margin: 10px 0 8px;
  color: var(--sqd-ink);
  font-size: 19px;
}
.sqd-mini {
  padding: 15px;
}
.sqd-mini h4 {
  margin: 0 0 7px;
  color: var(--sqd-ink);
  font-size: 16px;
}
.sqd-badge {
  color: var(--sqd-blue);
  background: rgba(54, 95, 145, 0.1);
}
.sqd-badge.hot {
  color: var(--sqd-rust);
  background: rgba(161, 79, 53, 0.11);
}
.sqd-badge.core {
  color: var(--sqd-green);
  background: rgba(47, 111, 94, 0.11);
}
.sqd-badge.apply {
  color: var(--sqd-gold);
  background: rgba(138, 111, 46, 0.13);
}
.sqd-list {
  margin: 0;
  padding-left: 1.2em;
}
.sqd-table-wrap {
  overflow-x: auto;
  border: 1px solid var(--sqd-line);
  border-radius: 6px;
  background: var(--sqd-panel);
}
.sqd-table {
  width: 100%;
  min-width: 760px;
  border-collapse: collapse;
}
.sqd-table th,
.sqd-table td {
  padding: 12px 13px;
  border-bottom: 1px solid var(--sqd-line);
  text-align: left;
  vertical-align: top;
}
.sqd-table th {
  color: var(--sqd-ink);
  background: #f3f6f8;
  font-weight: 780;
}
.sqd-table tr:last-child td { border-bottom: 0; }
.sqd-formula {
  display: grid;
  gap: 10px;
  margin-top: 12px;
}
.sqd-formula div {
  padding: 12px;
  border: 1px solid var(--sqd-line);
  border-radius: 6px;
  background: var(--sqd-wash);
}
.sqd-formula code,
.sqd-mini code,
.sqd-card code,
.sqd-table code {
  padding: 1px 5px;
  border-radius: 4px;
  background: rgba(54, 95, 145, 0.09);
}
.sqd-code {
  margin: 10px 0 0;
  padding: 13px;
  border: 1px solid var(--sqd-line);
  border-radius: 6px;
  background: #f6f8fb;
  color: var(--sqd-text);
  font-size: 13px;
  line-height: 1.65;
  overflow-x: auto;
}
html[data-user-color-scheme="dark"] .sqd-page {
  --sqd-ink: rgba(245, 247, 250, 0.94);
  --sqd-text: rgba(235, 240, 245, 0.88);
  --sqd-muted: rgba(219, 226, 233, 0.72);
  --sqd-line: rgba(255, 255, 255, 0.11);
  --sqd-panel: rgba(30, 35, 42, 0.9);
  --sqd-wash: rgba(255, 255, 255, 0.055);
}
html[data-user-color-scheme="dark"] .sqd-hero,
html[data-user-color-scheme="dark"] .sqd-card,
html[data-user-color-scheme="dark"] .sqd-mini,
html[data-user-color-scheme="dark"] .sqd-table-wrap {
  background: var(--sqd-panel);
}
html[data-user-color-scheme="dark"] .sqd-table th,
html[data-user-color-scheme="dark"] .sqd-code {
  background: rgba(255, 255, 255, 0.06);
}
@media (max-width: 980px) {
  .sqd-hero,
  .sqd-grid,
  .sqd-grid.three {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 680px) {
  .sqd-hero { padding: 22px; }
  .sqd-hero h2 { font-size: 24px; }
  .sqd-stat-grid { grid-template-columns: 1fr; }
  .sqd-link,
  .sqd-chip { width: 100%; }
}
</style>
<link rel="stylesheet" href="/css/software-quality-mobile-voice.css?v=20260623-1">
<script defer src="/js/software-quality-voice.js?v=20260623-1"></script>

<div class="sqd-page">
  <section class="sqd-hero">
    <div>
      <span class="sqd-kicker">Design Questions / 设计题专项</span>
      <h2>大题不是靠背，是靠一套可重复的做题流程</h2>
      <p>已核验的 A 卷和 2024 回忆都指向同一件事：设计题分值高，题面会换，但套路稳定。你不需要先学会所有测试理论，只要先掌握四类动作：划分输入、取边界、画控制流/状态图、把路径变成测试用例。C 卷和 2025 图片还没有 OCR/人工逐条核验，不能拿来硬写结论。</p>
      <div class="sqd-actions">
        <a class="sqd-link" href="/courses/software-quality-review-network/">返回复习网络</a>
        <a class="sqd-link" href="#equivalence">等价类</a>
        <a class="sqd-link" href="#flow">基本路径</a>
        <a class="sqd-link" href="#state">状态图</a>
        <a class="sqd-link" href="#practice">训练顺序</a>
      </div>
    </div>
    <div class="sqd-stat-grid" aria-label="设计题重点">
      <div class="sqd-stat"><strong>46+</strong><span>A 卷设计题 46 分，2024 回忆也显示大题必须单独练。</span></div>
      <div class="sqd-stat"><strong>2 类</strong><span>黑盒输入设计 + 白盒/状态路径设计，是最核心的两类。</span></div>
      <div class="sqd-stat"><strong>4 步</strong><span>建模、编号、覆盖、写用例，按步骤给分。</span></div>
      <div class="sqd-stat"><strong>表格</strong><span>卷面写成表，比散文式答案稳得多。</span></div>
    </div>
  </section>

  <section class="sqd-note">
    <p><strong>先说结论：</strong>设计题不要从“我要不要画得很漂亮”开始，而要从“老师按哪些步骤给分”开始。一般会看你有没有识别规则/状态/分支，有没有列出覆盖项，有没有算复杂度，有没有把路径或等价类落成测试用例。</p>
  </section>

  <nav class="sqd-nav" aria-label="页内导航">
    <a class="sqd-chip" href="#what">考什么</a>
    <a class="sqd-chip" href="#equivalence">等价类</a>
    <a class="sqd-chip" href="#boundary">边界值</a>
    <a class="sqd-chip" href="#flow">控制流图</a>
    <a class="sqd-chip" href="#path">基本路径</a>
    <a class="sqd-chip" href="#state">状态图</a>
    <a class="sqd-chip" href="#practice">训练顺序</a>
  </nav>

  <h2 id="what" class="sqd-section-title">一、设计题到底考什么</h2>
  <div class="sqd-table-wrap">
    <table class="sqd-table">
      <thead>
        <tr>
          <th>题型</th>
          <th>题目会给什么</th>
          <th>你要交什么</th>
          <th>拿分关键词</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>等价类划分</td>
          <td>一个输入格式、编号规则、登录条件、文件名规则、业务字段范围。</td>
          <td>有效等价类、无效等价类、最少测试用例和预期结果。</td>
          <td>字段拆分、有效/无效、代表值、一类至少一例。</td>
        </tr>
        <tr>
          <td>边界值分析</td>
          <td>长度范围、数值上下限、字符串位数、合法区间。</td>
          <td>下界、上界、刚越界、正常值，对应测试用例。</td>
          <td>min、min+1、normal、max-1、max、max+1。</td>
        </tr>
        <tr>
          <td>控制流图 + 复杂度</td>
          <td>一段含 if、while、for 的代码或业务流程。</td>
          <td>节点编号、控制流图、环路复杂度、独立路径。</td>
          <td>基本块、边、判定节点、<code>V(G)=E-N+2P</code>。</td>
        </tr>
        <tr>
          <td>基本路径测试</td>
          <td>控制流图或代码。</td>
          <td>V(G) 条独立路径，以及每条路径的测试输入和预期输出。</td>
          <td>每条路径引入新边，路径和用例一一对应。</td>
        </tr>
        <tr>
          <td>状态图/功能图</td>
          <td>一个系统交互描述，例如查询、售票、付款、退款。</td>
          <td>状态、事件/条件、状态转换图、测试路径。</td>
          <td>状态不是动作，边上写触发条件，路径覆盖主要迁移。</td>
        </tr>
      </tbody>
    </table>
  </div>

  <h2 id="equivalence" class="sqd-section-title">二、等价类划分：把无限输入变成几类输入</h2>
  <div class="sqd-grid">
    <article class="sqd-card">
      <span class="sqd-badge hot">从零理解</span>
      <h3>什么是等价类</h3>
      <p>等价类的意思是：一堆输入在程序看来“本质上差不多”，测其中一个就能代表这一类。比如要求“班级号 1-6”，那么 1、2、3、4、5、6 都属于同一类有效输入；0、7、字母、空值就是不同角度的无效输入。</p>
      <section class="sqd-note">
        <p><strong>考试关键：</strong>有效等价类通常可以合并覆盖；无效等价类最好一类一个用例，否则多个错误混在一起，无法判断系统到底处理了哪个错误。</p>
      </section>
    </article>
    <article class="sqd-card">
      <span class="sqd-badge core">五步法</span>
      <h3>卷面固定流程</h3>
      <ul class="sqd-list">
        <li>第一步：把输入拆成字段，例如长度、字符类型、范围、格式、业务含义。</li>
        <li>第二步：每个字段写一个“合法类”，再写若干“非法类”。</li>
        <li>第三步：给每个类编号，例如 E1、E2、I1、I2。</li>
        <li>第四步：先写一个用例覆盖尽可能多的有效类。</li>
        <li>第五步：每个无效类至少补一个用例，并写预期结果。</li>
      </ul>
    </article>
  </div>

  <h2 class="sqd-section-title">三、等价类示范：编号格式题怎么写</h2>
  <section class="sqd-note">
    <p>下面是一个和往年题同型的练习题，不逐字复现原题。题面：某系统要求输入 8 位资源编号，第 1 位表示类别，只能是 1-6；第 2-3 位表示区域，只能是 01-12；第 4-8 位表示序号，只能是 00001-99999，整体必须全为数字。</p>
  </section>
  <div class="sqd-table-wrap">
    <table class="sqd-table">
      <thead>
        <tr>
          <th>字段</th>
          <th>有效等价类</th>
          <th>无效等价类</th>
          <th>代表值</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>整体长度</td>
          <td>E1：正好 8 位</td>
          <td>I1：少于 8 位；I2：多于 8 位</td>
          <td>12300001；1230001；123000001</td>
        </tr>
        <tr>
          <td>字符类型</td>
          <td>E2：全数字</td>
          <td>I3：含字母/符号/空格</td>
          <td>12300001；12A00001</td>
        </tr>
        <tr>
          <td>第 1 位类别</td>
          <td>E3：1-6</td>
          <td>I4：0；I5：7-9</td>
          <td>12300001；02300001；72300001</td>
        </tr>
        <tr>
          <td>第 2-3 位区域</td>
          <td>E4：01-12</td>
          <td>I6：00；I7：13-99</td>
          <td>11200001；10000001；11300001</td>
        </tr>
        <tr>
          <td>第 4-8 位序号</td>
          <td>E5：00001-99999</td>
          <td>I8：00000</td>
          <td>11200001；11200000</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="sqd-table-wrap" style="margin-top:14px">
    <table class="sqd-table">
      <thead>
        <tr>
          <th>用例编号</th>
          <th>输入</th>
          <th>覆盖类</th>
          <th>预期结果</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>T1</td><td>11200001</td><td>E1、E2、E3、E4、E5</td><td>通过</td></tr>
        <tr><td>T2</td><td>1120001</td><td>I1</td><td>拒绝，提示长度错误</td></tr>
        <tr><td>T3</td><td>112000001</td><td>I2</td><td>拒绝，提示长度错误</td></tr>
        <tr><td>T4</td><td>11A00001</td><td>I3</td><td>拒绝，提示必须为数字</td></tr>
        <tr><td>T5</td><td>01200001</td><td>I4</td><td>拒绝，提示类别错误</td></tr>
        <tr><td>T6</td><td>71200001</td><td>I5</td><td>拒绝，提示类别错误</td></tr>
        <tr><td>T7</td><td>10000001</td><td>I6</td><td>拒绝，提示区域错误</td></tr>
        <tr><td>T8</td><td>11300001</td><td>I7</td><td>拒绝，提示区域错误</td></tr>
        <tr><td>T9</td><td>11200000</td><td>I8</td><td>拒绝，提示序号错误</td></tr>
      </tbody>
    </table>
  </div>

  <h2 id="boundary" class="sqd-section-title">四、边界值分析：老师最爱看你有没有贴边</h2>
  <div class="sqd-grid">
    <article class="sqd-card">
      <span class="sqd-badge hot">口诀</span>
      <h3>边界值不是随便取几个数</h3>
      <p>经验上，错误最容易出现在边界附近。闭区间 <code>[a,b]</code> 常取 <code>a-1</code>、<code>a</code>、<code>a+1</code>、正常值、<code>b-1</code>、<code>b</code>、<code>b+1</code>。如果题目要求“一般边界值分析”，多个变量时通常让一个变量取边界，其他变量取正常值。</p>
    </article>
    <article class="sqd-card">
      <span class="sqd-badge core">示范</span>
      <h3>区间题怎么写</h3>
      <p>如果 <code>x</code> 的范围是 100-200，<code>y</code> 的范围是 5-15，先取正常值 <code>x=150</code>、<code>y=10</code>。然后 x 取 100、101、199、200，y 保持 10；y 取 5、6、14、15，x 保持 150。最后加正常值，一共 9 个用例。</p>
    </article>
  </div>

  <h2 id="flow" class="sqd-section-title">五、控制流图：把代码变成节点和边</h2>
  <div class="sqd-grid">
    <article class="sqd-card">
      <span class="sqd-badge hot">从零理解</span>
      <h3>控制流图不是流程图美术题</h3>
      <p>控制流图只关心程序怎么走。顺序语句可以合并成一个节点；判断语句有真假两条边；循环语句有进入循环和跳出循环两条边，并且循环体会有回边。考试不看你画得多漂亮，主要看节点、边和判断关系是否正确。</p>
      <div class="sqd-formula">
        <div><strong>节点：</strong>一段顺序执行的语句，或一个判断点。</div>
        <div><strong>边：</strong>程序从一个节点跳到另一个节点的方向。</div>
        <div><strong>判定节点：</strong>if、while、for 这类能产生分支的点。</div>
      </div>
    </article>
    <article class="sqd-card">
      <span class="sqd-badge core">练习代码</span>
      <h3>先从最小代码看懂</h3>
      <pre class="sqd-code">1 start
2 k = 1
3 if (a &gt; 0 || b &lt; 0)
4   k = k + a
5 else
6   k = k + b
7 if (c &gt; 0)
8   k = k + c
9 return k</pre>
      <p style="margin-top:10px">可以把 1-2 合成入口节点 A；第一个 if 是节点 B；then 是 C，else 是 D；第二个 if 是 E；加 c 是 F；return 是 G。</p>
    </article>
  </div>

  <h2 class="sqd-section-title">六、环路复杂度：三种算法要能互相校验</h2>
  <div class="sqd-table-wrap">
    <table class="sqd-table">
      <thead>
        <tr>
          <th>算法</th>
          <th>怎么用</th>
          <th>考试写法</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>边节点公式</td>
          <td><code>V(G)=E-N+2P</code>。E 是边数，N 是节点数，P 通常为 1 个连通程序图。</td>
          <td>先数边和节点，再代入公式。注意不要把流程图动作框错数成很多节点。</td>
        </tr>
        <tr>
          <td>区域数</td>
          <td>控制流图把平面分成几个区域，复杂度就是区域数。</td>
          <td>适合检查答案，但卷面上最好仍写公式或判定节点法。</td>
        </tr>
        <tr>
          <td>判定节点 + 1</td>
          <td>结构化程序中，环路复杂度约等于判定节点个数 + 1。</td>
          <td>最适合快速验算。两个 if 通常就是 3 条基本路径。</td>
        </tr>
      </tbody>
    </table>
  </div>

  <h2 id="path" class="sqd-section-title">七、基本路径测试：路径和用例要一一对应</h2>
  <section class="sqd-note">
    <p><strong>核心标准：</strong>基本路径数通常等于环路复杂度。每条新路径都应该至少引入一条前面没覆盖过的新边。不要列一堆重复路径，也不要只列路径不写输入。</p>
  </section>
  <div class="sqd-table-wrap">
    <table class="sqd-table">
      <thead>
        <tr>
          <th>路径</th>
          <th>条件设计</th>
          <th>示例输入</th>
          <th>预期经过</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>P1：入口 -> 第一个 if 真 -> 第二个 if 真 -> return</td>
          <td>让 <code>a&gt;0 || b&lt;0</code> 为真，且 <code>c&gt;0</code> 为真。</td>
          <td>a=1, b=0, c=1</td>
          <td>走 then，加 a，再加 c。</td>
        </tr>
        <tr>
          <td>P2：入口 -> 第一个 if 真 -> 第二个 if 假 -> return</td>
          <td>让第一个判断为真，第二个判断为假。</td>
          <td>a=1, b=0, c=0</td>
          <td>走 then，加 a，不加 c。</td>
        </tr>
        <tr>
          <td>P3：入口 -> 第一个 if 假 -> 第二个 if 真 -> return</td>
          <td>让 <code>a&gt;0 || b&lt;0</code> 为假，且 <code>c&gt;0</code> 为真。</td>
          <td>a=0, b=0, c=1</td>
          <td>走 else，加 b，再加 c。</td>
        </tr>
      </tbody>
    </table>
  </div>
  <section class="sqd-note">
    <p>如果老师要求路径覆盖而不是基本路径覆盖，要继续补 P4：第一个 if 假、第二个 if 假。基本路径测试通常只要求 V(G) 条独立路径；路径覆盖则要覆盖所有可行路径。</p>
  </section>

  <h2 id="state" class="sqd-section-title">八、状态图题：先找“状态”，再找“触发条件”</h2>
  <div class="sqd-grid">
    <article class="sqd-card">
      <span class="sqd-badge hot">最常见误区</span>
      <h3>状态不是动作</h3>
      <p>状态是系统停留的样子，比如“等待输入”“待付款”“出票”“退款”“查询失败”。动作是从一个状态变到另一个状态时发生的事，比如“输入正确”“付款成功”“取消订单”。画图时，节点写状态，边上写触发条件和动作。</p>
    </article>
    <article class="sqd-card">
      <span class="sqd-badge core">四步法</span>
      <h3>状态图卷面流程</h3>
      <ul class="sqd-list">
        <li>第一步：把题面里“系统进入……状态”这种词圈出来。</li>
        <li>第二步：把按钮、输入、超时、成功、失败、取消圈出来。</li>
        <li>第三步：画状态节点 S1、S2、S3，迁移条件写 M1、M2、M3。</li>
        <li>第四步：旁边列 S/M 含义表，再列测试路径。</li>
      </ul>
    </article>
  </div>
  <div class="sqd-table-wrap" style="margin-top:14px">
    <table class="sqd-table">
      <thead>
        <tr>
          <th>状态/条件</th>
          <th>含义示例</th>
          <th>卷面写法</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>S1</td><td>等待用户操作</td><td>画成一个状态节点，不写成“用户点击按钮”。</td></tr>
        <tr><td>S2</td><td>待付款</td><td>用户已选择项目但未付款。</td></tr>
        <tr><td>S3</td><td>成功/出票/查询成功</td><td>业务完成后可返回等待状态。</td></tr>
        <tr><td>S4</td><td>失败/超时/错误</td><td>失败后通常也返回等待状态。</td></tr>
        <tr><td>M1</td><td>输入合法</td><td>S1 -> S2。</td></tr>
        <tr><td>M2</td><td>付款成功</td><td>S2 -> S3。</td></tr>
        <tr><td>M3</td><td>取消或超时</td><td>S2 -> S4 或 S1。</td></tr>
      </tbody>
    </table>
  </div>

  <h2 class="sqd-section-title">九、卷面模板：直接照这个顺序写</h2>
  <div class="sqd-grid three">
    <article class="sqd-mini"><h4>输入类大题</h4><p>规则拆分表 -> 等价类表 -> 边界值表 -> 测试用例表。每张表都写编号，方便老师按点给分。</p></article>
    <article class="sqd-mini"><h4>代码类大题</h4><p>语句编号 -> 控制流图 -> 复杂度三算法 -> 基本路径表 -> 测试用例表。</p></article>
    <article class="sqd-mini"><h4>状态类大题</h4><p>状态表 -> 条件/事件表 -> 状态转换图 -> 复杂度或路径 -> 测试用例表。</p></article>
  </div>

  <h2 id="practice" class="sqd-section-title">十、零基础训练顺序：不要一上来做整套卷</h2>
  <div class="sqd-table-wrap">
    <table class="sqd-table">
      <thead>
        <tr>
          <th>阶段</th>
          <th>训练目标</th>
          <th>练什么</th>
          <th>达标标准</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>第 1 轮</td>
          <td>会拆规则</td>
          <td>编号、学号、文件名、长度范围题。</td>
          <td>能列出有效/无效等价类，不漏长度、类型、范围。</td>
        </tr>
        <tr>
          <td>第 2 轮</td>
          <td>会取边界</td>
          <td>单变量范围、双变量范围、字符串长度。</td>
          <td>能解释为什么取 min、min+1、max-1、max。</td>
        </tr>
        <tr>
          <td>第 3 轮</td>
          <td>会画控制流</td>
          <td>两个 if、if + while、for + if 的小代码。</td>
          <td>能数出节点、边、判定节点，三种复杂度算法一致。</td>
        </tr>
        <tr>
          <td>第 4 轮</td>
          <td>会配用例</td>
          <td>为每条路径反推输入。</td>
          <td>路径表和用例表能一一对应。</td>
        </tr>
        <tr>
          <td>第 5 轮</td>
          <td>会做状态题</td>
          <td>查询系统、售票系统、支付系统、预约系统。</td>
          <td>状态和动作不混，转换边能覆盖成功、失败、取消、超时。</td>
        </tr>
      </tbody>
    </table>
  </div>

  <h2 class="sqd-section-title">十一、最容易扣分的 10 个点</h2>
  <div class="sqd-grid">
    <article class="sqd-card">
      <span class="sqd-badge hot">输入设计题</span>
      <ul class="sqd-list">
        <li>只写有效类，不写无效类。</li>
        <li>把多个无效错误塞进一个用例，导致预期结果不清楚。</li>
        <li>忘记长度、字符类型、空值、格式错误。</li>
        <li>边界值只取中间值，不取刚越界。</li>
        <li>没有写预期结果。</li>
      </ul>
    </article>
    <article class="sqd-card">
      <span class="sqd-badge hot">路径设计题</span>
      <ul class="sqd-list">
        <li>控制流图画成业务流程图，节点太多或太少。</li>
        <li>漏掉循环回边。</li>
        <li>只写复杂度结果，不写计算过程。</li>
        <li>路径重复，没有引入新边。</li>
        <li>路径写了，但没有给能走到该路径的输入。</li>
      </ul>
    </article>
  </div>

  <section class="sqd-note">
    <p><strong>最后提醒：</strong>设计题可以不会“很高级”，但不能空着。哪怕图画得不完美，只要规则拆分、编号、复杂度、路径、用例表这几个步骤写出来，通常都有过程分。</p>
  </section>
</div>
