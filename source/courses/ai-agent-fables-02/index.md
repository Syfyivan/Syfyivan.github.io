---
title: "AI 与 Agent 大寓言课 02：会分类的农夫 章节目录"
date: 2026-06-20 13:00:00
description: "AI 与 Agent 大寓言课第 02 讲的专题目录：从数据从哪来、三种学法、训练与推理、过拟合、指标，到从模型到系统。"
---

<style>
.ahf-track {
  --ahf-ink: #1f2522;
  --ahf-muted: #627068;
  --ahf-line: rgba(31, 37, 34, 0.13);
  --ahf-panel: #ffffff;
  --ahf-wash: #f5f7f1;
  --ahf-green: #2f6f5e;
  --ahf-rust: #a44f32;
  --ahf-gold: #8a6f2e;
  max-width: 960px;
  margin: 0 auto;
  color: var(--ahf-ink);
}
.ahf-track * { box-sizing: border-box; }
.ahf-hero {
  padding: 30px;
  border: 1px solid var(--ahf-line);
  border-left: 5px solid var(--ahf-green);
  border-radius: 8px;
  background: #fbfcf9;
  box-shadow: 0 10px 26px rgba(31, 37, 34, 0.06);
}
.ahf-kicker {
  display: inline-flex;
  margin-bottom: 14px;
  padding: 5px 9px;
  border-radius: 999px;
  color: var(--ahf-green);
  background: rgba(47, 111, 94, 0.11);
  font-size: 13px;
  font-weight: 700;
}
.ahf-hero h2 { margin: 0 0 14px; font-size: 30px; line-height: 1.25; letter-spacing: 0; }
.ahf-hero p,
.ahf-note p,
.ahf-card p,
.ahf-rhythm p {
  margin: 0;
  color: var(--ahf-muted);
  line-height: 1.8;
}
.ahf-parent {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid var(--ahf-line);
}
.ahf-parent span {
  color: var(--ahf-muted);
  font-weight: 700;
}
.ahf-note {
  margin-top: 18px;
  padding: 16px 18px;
  border-left: 4px solid var(--ahf-rust);
  border-radius: 8px;
  background: var(--ahf-wash);
}
.ahf-section-title { margin: 34px 0 16px; font-size: 22px; letter-spacing: 0; }
.ahf-list { display: grid; gap: 14px; }
.ahf-card {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr) auto;
  gap: 16px;
  align-items: center;
  padding: 18px;
  border: 1px solid var(--ahf-line);
  border-radius: 8px;
  background: var(--ahf-panel);
  box-shadow: 0 10px 24px rgba(31, 37, 34, 0.06);
  transition: border-color 0.16s ease, box-shadow 0.16s ease, transform 0.16s ease;
}
.ahf-card:hover {
  border-color: rgba(47, 111, 94, 0.28);
  box-shadow: 0 14px 30px rgba(31, 37, 34, 0.08);
  transform: translateY(-1px);
}
.ahf-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 58px;
  min-height: 42px;
  padding: 0 8px;
  border-radius: 8px;
  color: #ffffff;
  background: var(--ahf-green);
  font-weight: 800;
}
.ahf-card h3 { margin: 0 0 7px; font-size: 19px; letter-spacing: 0; }
.ahf-card small {
  display: block;
  margin-bottom: 6px;
  color: var(--ahf-gold);
  font-weight: 700;
}
.ahf-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  padding: 8px 13px;
  border: 1px solid rgba(47, 111, 94, 0.3);
  border-radius: 8px;
  color: var(--ahf-green);
  font-weight: 700;
  text-decoration: none !important;
  white-space: nowrap;
}
.ahf-link:hover { color: #ffffff; background: var(--ahf-green); }
.ahf-rhythm-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
.ahf-rhythm {
  padding: 16px;
  border: 1px solid var(--ahf-line);
  border-radius: 8px;
  background: var(--ahf-wash);
}
.ahf-rhythm strong { display: block; margin-bottom: 6px; color: var(--ahf-rust); }
html[data-user-color-scheme="dark"] .ahf-track {
  --ahf-ink: rgba(246, 249, 246, 0.94);
  --ahf-muted: rgba(224, 233, 226, 0.72);
  --ahf-line: rgba(255, 255, 255, 0.1);
  --ahf-panel: rgba(28, 35, 32, 0.9);
  --ahf-wash: rgba(255, 255, 255, 0.045);
}
html[data-user-color-scheme="dark"] .ahf-hero,
html[data-user-color-scheme="dark"] .ahf-card { background: var(--ahf-panel); }
@media (max-width: 760px) {
  .ahf-hero { padding: 22px; }
  .ahf-hero h2 { font-size: 25px; }
  .ahf-card { grid-template-columns: 1fr; gap: 12px; }
  .ahf-number { width: 58px; }
  .ahf-rhythm-grid { grid-template-columns: 1fr; }
  .ahf-link { width: 100%; }
}
</style>

<div class="ahf-track">
  <section class="ahf-hero">
    <span class="ahf-kicker">AI Agent Fables / Lesson 02</span>
    <h2>会分类的农夫：数据、特征与机器学习</h2>
    <p>这是 AI 与 Agent 大寓言课第 02 讲的章节目录。第 02 讲在同一座农场里，跟着新帮工阿禾从“谷子从哪来”一路学到“一座农场怎么稳稳出谷”，把机器学习里数据、学法、训练、过拟合、指标和系统这些概念讲清楚。</p>
    <div class="ahf-parent">
      <span>上层目录：AI 与 Agent 大寓言课 / 第 02 讲</span>
      <a class="ahf-link" href="/courses/ai-agent-fables/">返回总目录</a>
      <a class="ahf-link" href="/2026/06/18/ai-agent-fables-02-machine-learning/">阅读第二讲概览</a>
    </div>
  </section>
  <section class="ahf-note">
    <p>层级说明：大课程的“讲”是学习等级；第 02 讲下面拆成 6 个章节。建议先读概览，再顺着 02.1 到 02.6 往下走。</p>
  </section>
  <section class="ahf-note">
    <p>本讲脉络（一条故事线）：新帮工阿禾在农场里——先搞清<strong>谷子从哪来、考试谷要锁好</strong>（02.1）→ 学会<strong>三种学法</strong>（02.2）→ 分清<strong>练手艺和上手干活</strong>（02.3）→ 防住<strong>只会自家这块地</strong>（02.4）→ 看穿<strong>会骗人的数字</strong>（02.5）→ 明白<strong>一个人会分谷不等于一座农场能稳稳出谷</strong>（02.6）。老把式贯穿全程，每章承上启下。</p>
  </section>
  <h2 class="ahf-section-title">第 02 讲学习路径</h2>
  <section class="ahf-list" aria-label="第二讲章节目录">
    <article class="ahf-card">
      <span class="ahf-number">02.0</span>
      <div><small>概览</small><h3>会分类的农夫</h3><p>用农场寓言把数据、标签、训练、过拟合、指标和系统放进同一条主线。</p></div>
      <a class="ahf-link" href="/2026/06/18/ai-agent-fables-02-machine-learning/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">02.1</span>
      <div><small>数据从哪里来</small><h3>一筐一筐的谷子从哪来</h3><p>样本与标签、标注噪声、数据泄漏和数据权利——为什么“考得太好”反而要警惕。</p></div>
      <a class="ahf-link" href="/2026/06/20/ai-agent-fables-02-ch1-where-data-comes-from/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">02.2</span>
      <div><small>学习任务类型</small><h3>三种学法</h3><p>有人纠错、自己归堆、种下去看收成——监督、无监督和强化学习的区别。</p></div>
      <a class="ahf-link" href="/2026/06/20/ai-agent-fables-02-ch2-learning-types/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">02.3</span>
      <div><small>训练与推理</small><h3>练手艺和上手干活</h3><p>训练与推理、损失、优化、参数和推理成本——为什么“训练准”不等于“好用”。</p></div>
      <a class="ahf-link" href="/2026/06/20/ai-agent-fables-02-ch3-training-inference/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">02.4</span>
      <div><small>泛化与过拟合</small><h3>只会自家这块地</h3><p>过拟合与泛化、训练/验证/测试三份数据、分布漂移——上线后还会悄悄变差。</p></div>
      <a class="ahf-link" href="/2026/06/20/ai-agent-fables-02-ch4-generalization-overfitting/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">02.5</span>
      <div><small>指标怎么骗人</small><h3>会骗人的数字</h3><p>准确率陷阱、精确率与召回率、校准和业务指标——别被一个漂亮数字骗了。</p></div>
      <a class="ahf-link" href="/2026/06/20/ai-agent-fables-02-ch5-metrics/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">02.6</span>
      <div><small>从模型到系统</small><h3>从一个人到一条流水线</h3><p>特征流水线、线上服务、监控和反馈闭环——模型只是系统里的一个零件。</p></div>
      <a class="ahf-link" href="/2026/06/20/ai-agent-fables-02-ch6-model-to-system/">阅读</a>
    </article>
  </section>
  <h2 class="ahf-section-title">读完这一讲应能带走什么</h2>
  <section class="ahf-rhythm-grid">
    <div class="ahf-rhythm"><strong>会看数据</strong><p>知道数据从哪来、标签会出错、考试集要锁住，避开数据泄漏这类基础坑。</p></div>
    <div class="ahf-rhythm"><strong>会判好坏</strong><p>能识别过拟合，会用精确率/召回率/校准而不是只看一个准确率。</p></div>
    <div class="ahf-rhythm"><strong>会看系统</strong><p>明白模型只是系统一环，懂特征流水线、监控和反馈闭环的意义。</p></div>
  </section>
</div>
