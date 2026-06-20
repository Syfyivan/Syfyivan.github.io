---
title: "AI 与 Agent 大寓言课 03：会说话的图书馆 章节目录"
date: 2026-06-20 15:00:00
description: "AI 与 Agent 大寓言课第 03 讲的专题目录：从神经网络、Transformer、token 与向量、预训练微调对齐、上下文窗口，到模型能力边界。"
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
    <span class="ahf-kicker">AI Agent Fables / Lesson 03</span>
    <h2>会说话的图书馆：深度学习与大模型</h2>
    <p>这是 AI 与 Agent 大寓言课第 03 讲的章节目录。第 03 讲走进一座“会接话的藏书楼”，跟着学徒阿册看清它的里里外外，把神经网络、Transformer、token 与向量、预训练微调对齐、上下文窗口和能力边界讲清楚。</p>
    <div class="ahf-parent">
      <span>上层目录：AI 与 Agent 大寓言课 / 第 03 讲</span>
      <a class="ahf-link" href="/courses/ai-agent-fables/">返回总目录</a>
      <a class="ahf-link" href="/2026/06/18/ai-agent-fables-03-foundation-models/">阅读第三讲概览</a>
    </div>
  </section>
  <section class="ahf-note">
    <p>层级说明：大课程的“讲”是学习等级；第 03 讲下面拆成 6 个章节。建议先读概览，再顺着 03.1 到 03.6 往下走。</p>
  </section>
  <section class="ahf-note">
    <p>本讲脉络（一条故事线）：学徒阿册走进会接话的图书馆——先看<strong>一层层传话的管理员</strong>（03.1）→ 懂得<strong>一眼扫过全桌的注意力</strong>（03.2）→ 弄清<strong>字牌和意思货架</strong>（03.3）→ 知道<strong>这座楼怎么练成</strong>（03.4）→ 明白<strong>桌子有多大</strong>（03.5）→ 警惕<strong>它会接出假话</strong>（03.6）。老馆长贯穿全程，每章承上启下。</p>
  </section>
  <h2 class="ahf-section-title">第 03 讲学习路径</h2>
  <section class="ahf-list" aria-label="第三讲章节目录">
    <article class="ahf-card">
      <span class="ahf-number">03.0</span>
      <div><small>概览</small><h3>会说话的图书馆</h3><p>用藏书楼寓言把神经网络、Transformer、token、预训练和上下文窗口放进同一条主线。</p></div>
      <a class="ahf-link" href="/2026/06/18/ai-agent-fables-03-foundation-models/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">03.1</span>
      <div><small>神经网络直觉</small><h3>一层层传话的管理员</h3><p>层、激活、表征和反向传播——信息怎么从“一堆字”一层层提炼成“意思”。</p></div>
      <a class="ahf-link" href="/2026/06/20/ai-agent-fables-03-ch1-neural-network-intuition/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">03.2</span>
      <div><small>Transformer 为什么关键</small><h3>一眼扫过全桌</h3><p>注意力、位置编码和并行训练——为什么它能处理长距离关系、又能做大。</p></div>
      <a class="ahf-link" href="/2026/06/20/ai-agent-fables-03-ch2-transformer-attention/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">03.3</span>
      <div><small>Token 与向量</small><h3>字牌和意思货架</h3><p>分词、embedding、语义空间和相似度——“意思”怎么变成可计算的坐标。</p></div>
      <a class="ahf-link" href="/2026/06/20/ai-agent-fables-03-ch3-tokens-embeddings/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">03.4</span>
      <div><small>预训练、微调与对齐</small><h3>图书馆是怎么练成的</h3><p>自监督预训练、监督微调、RLHF 对齐与指令跟随——三步把空白练成会答话。</p></div>
      <a class="ahf-link" href="/2026/06/20/ai-agent-fables-03-ch4-pretrain-finetune-align/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">03.5</span>
      <div><small>上下文窗口与长文本</small><h3>桌子有多大</h3><p>窗口限制、注意力的平方成本和“塞越多越好”的误区——上下文是要花的预算。</p></div>
      <a class="ahf-link" href="/2026/06/20/ai-agent-fables-03-ch5-context-window/">阅读</a>
    </article>
    <article class="ahf-card">
      <span class="ahf-number">03.6</span>
      <div><small>模型能力边界</small><h3>会接话，也会接出假话</h3><p>幻觉、组合泛化弱、推理不稳和评测偏差——对能力保持敬畏，对分数保持怀疑。</p></div>
      <a class="ahf-link" href="/2026/06/20/ai-agent-fables-03-ch6-capability-limits/">阅读</a>
    </article>
  </section>
  <h2 class="ahf-section-title">读完这一讲应能带走什么</h2>
  <section class="ahf-rhythm-grid">
    <div class="ahf-rhythm"><strong>会看内部</strong><p>能用“分层传话 + 注意力 + 字牌货架”解释大模型大致怎么运转。</p></div>
    <div class="ahf-rhythm"><strong>会看训练</strong><p>分得清预训练、微调和对齐各做什么、各花多少，知道知识压在参数里。</p></div>
    <div class="ahf-rhythm"><strong>会看边界</strong><p>理解上下文窗口的成本，以及幻觉、推理不稳这些必须靠外壳兜住的局限。</p></div>
  </section>
</div>
