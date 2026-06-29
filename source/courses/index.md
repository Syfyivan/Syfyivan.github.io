---
title: "课程"
date: 2026-05-16 18:05:00
description: "按方向整理技术课程：AI、服务端、前端客户端和项目作品。"
---

<style>
.course-page {
  --course-ink: #1d2127;
  --course-text: #2a2f36;
  --course-muted: #69727d;
  --course-line: rgba(29, 33, 39, 0.12);
  --course-panel: #ffffff;
  --course-wash: #f4f5f3;
  --course-blue: #3f5d7e;
  --course-red: #b73a2c;
  --course-green: #2f765f;
  --course-amber: #9b6632;
  color: var(--course-text);
  max-width: 100%;
  overflow-x: hidden;
}

.course-page * {
  box-sizing: border-box;
  min-width: 0;
}

.course-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.32fr) minmax(250px, 0.68fr);
  gap: 26px;
  align-items: end;
  padding: 34px;
  border: 1px solid var(--course-line);
  border-radius: 3px;
  background:
    linear-gradient(135deg, rgba(183, 58, 44, 0.07), rgba(63, 93, 126, 0.08)),
    var(--course-panel);
}

.course-kicker {
  display: inline-flex;
  align-items: center;
  margin-bottom: 14px;
  padding: 6px 10px;
  border: 1px solid rgba(63, 93, 126, 0.2);
  border-radius: 999px;
  color: var(--course-blue);
  background: rgba(63, 93, 126, 0.08);
  font-size: 13px;
  font-weight: 760;
}

.course-hero h2 {
  margin: 0 0 14px;
  color: var(--course-ink);
  font-size: 32px;
  line-height: 1.2;
  letter-spacing: 0;
}

.course-hero p,
.course-card p,
.course-category-card p,
.course-note p,
.course-empty p {
  margin: 0;
  color: var(--course-muted);
  line-height: 1.8;
  overflow-wrap: anywhere;
}

.course-stats {
  display: grid;
  gap: 10px;
}

.course-stat {
  padding: 16px;
  border: 1px solid var(--course-line);
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.76);
}

.course-stat strong {
  display: block;
  margin-bottom: 4px;
  color: var(--course-ink);
  font-size: 22px;
  line-height: 1;
}

.course-category-nav {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin: 24px 0 32px;
}

.course-category-card {
  --category-color: var(--course-blue);
  display: flex;
  min-height: 164px;
  flex-direction: column;
  padding: 18px;
  border: 1px solid var(--course-line);
  border-top: 4px solid var(--category-color);
  border-radius: 3px;
  color: var(--course-text);
  background: var(--course-panel);
  text-decoration: none !important;
  box-shadow: 0 8px 24px rgba(22, 32, 42, 0.06);
}

.course-category-card:hover,
.course-category-card:focus {
  border-color: color-mix(in srgb, var(--category-color) 42%, var(--course-line));
  color: var(--course-text);
  transform: translateY(-2px);
}

.course-category-card.is-ai { --category-color: var(--course-red); }
.course-category-card.is-backend { --category-color: var(--course-blue); }
.course-category-card.is-client { --category-color: var(--course-green); }
.course-category-card.is-project { --category-color: var(--course-amber); }

.course-category-card span {
  color: var(--category-color);
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  font-size: 13px;
  font-weight: 760;
  text-transform: uppercase;
}

.course-category-card strong {
  display: block;
  margin: 8px 0 8px;
  color: var(--course-ink);
  font-size: 21px;
  line-height: 1.25;
}

.course-category-card small {
  margin-top: auto;
  color: var(--course-muted);
  font-weight: 700;
}

.course-category {
  margin-top: 34px;
}

.course-category-head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16px;
  align-items: end;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--course-line);
}

.course-category-head h2 {
  margin: 0 0 6px !important;
  padding: 0 !important;
  border: 0 !important;
  color: var(--course-ink);
  font-size: 24px;
  letter-spacing: 0;
}

.course-category-head h2::before {
  display: none !important;
}

.course-category-head p {
  margin: 0;
  color: var(--course-muted);
  line-height: 1.7;
}

.course-category-count {
  min-width: 88px;
  padding: 8px 10px;
  border: 1px solid var(--course-line);
  border-radius: 3px;
  color: var(--course-blue);
  background: rgba(63, 93, 126, 0.08);
  font-weight: 760;
  text-align: center;
}

.course-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.course-card {
  display: flex;
  min-height: 228px;
  flex-direction: column;
  padding: 22px;
  border: 1px solid var(--course-line);
  border-radius: 3px;
  background: var(--course-panel);
  box-shadow: 0 10px 28px rgba(22, 32, 42, 0.07);
}

.course-card h3 {
  margin: 12px 0 10px;
  color: var(--course-ink);
  font-size: 21px;
  letter-spacing: 0;
}

.course-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: auto;
  padding-top: 22px;
}

.course-card-footer span {
  color: var(--course-ink);
}

.course-badge {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 5px 9px;
  border-radius: 999px;
  color: var(--course-blue);
  background: rgba(63, 93, 126, 0.1);
  font-size: 13px;
  font-weight: 760;
}

.course-badge.is-ai {
  color: var(--course-red);
  background: rgba(183, 58, 44, 0.1);
}

.course-badge.is-client {
  color: var(--course-green);
  background: rgba(47, 118, 95, 0.1);
}

.course-badge.is-project,
.course-badge.is-planned {
  color: var(--course-amber);
  background: rgba(155, 102, 50, 0.12);
}

.course-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  padding: 8px 13px;
  border: 1px solid rgba(63, 93, 126, 0.24);
  border-radius: 3px;
  color: var(--course-blue);
  font-weight: 760;
  text-decoration: none !important;
}

.course-link:hover,
.course-link:focus {
  color: #ffffff;
  background: var(--course-blue);
}

.course-empty {
  padding: 20px;
  border: 1px dashed rgba(29, 33, 39, 0.22);
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.58);
}

.course-note {
  margin-top: 30px;
  padding: 18px;
  border-left: 4px solid var(--course-red);
  border-radius: 3px;
  background: var(--course-wash);
}

@media (max-width: 980px) {
  .course-category-nav {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .course-hero,
  .course-grid,
  .course-category-head {
    grid-template-columns: 1fr;
  }

  .course-hero {
    padding: 18px;
  }

  .course-hero h2 {
    font-size: 26px;
  }

  .course-category-nav {
    grid-template-columns: 1fr;
  }

  .course-card-footer {
    align-items: flex-start;
    flex-direction: column;
  }

  .course-category-count {
    width: fit-content;
  }
}
</style>

<div class="course-page">
  <section class="course-hero">
    <div>
      <span class="course-kicker">Learning Paths</span>
      <h2>先选方向，再进入课程</h2>
      <p>课程越来越多时，不适合全部平铺。这里先按学习方向分成大类：AI、服务端与网络、前端与客户端、项目与作品。以后新课程先归类，再放进对应目录。</p>
    </div>
    <div class="course-stats" aria-label="课程统计">
      <div class="course-stat">
        <strong>14</strong>
        <span>已建课程</span>
      </div>
      <div class="course-stat">
        <strong>5</strong>
        <span>内容大类</span>
      </div>
      <div class="course-stat">
        <strong>80+</strong>
        <span>课程学习模块</span>
      </div>
    </div>
  </section>

  <nav class="course-category-nav" aria-label="课程大类">
    <a class="course-category-card is-ai" href="#ai">
      <span>AI</span>
      <strong>AI 与 Agent</strong>
      <p>从 AI 基础、发展史、LLM、MCP、Skill 一路讲到 Agent 工程，外加配套工具实操手册。</p>
      <small>大寓言课 + 实操手册</small>
    </a>
    <a class="course-category-card is-backend" href="#backend">
      <span>Backend</span>
      <strong>服务端与网络</strong>
      <p>Go 服务端、请求链路、数据库、中间件、代理和计网。</p>
      <small>2 门课程</small>
    </a>
    <a class="course-category-card is-client" href="#quality">
      <span>Quality</span>
      <strong>软件工程与质量</strong>
      <p>软件质量保证与测试：质量、缺陷、度量、评审、标准、设计、编程、课堂练习与期末复习。</p>
      <small>寓言版 + 修仙版 + 待溯源练习 + 复习专项</small>
    </a>
    <a class="course-category-card is-client" href="#client">
      <span>Client</span>
      <strong>前端与客户端</strong>
      <p>前端工程、Lynx、React、客户端调试和跨端实践。</p>
      <small>规划中</small>
    </a>
    <a class="course-category-card is-project" href="#projects">
      <span>Projects</span>
      <strong>项目与作品</strong>
      <p>把自研项目、源码拆解和可运行作品放在一个入口里。</p>
      <small>项目工坊</small>
    </a>
  </nav>

  <section class="course-category" id="ai">
    <div class="course-category-head">
      <div>
        <h2>AI 与 Agent</h2>
        <p>先从 AI 导论、数据与机器学习讲起，再进入 LLM、RAG、MCP、Skill、Agent Loop、vibe coding、SDD、评测、安全治理、多模态、多 Agent 和产品化工程。</p>
      </div>
      <span class="course-category-count">8 项</span>
    </div>
    <div class="course-grid">
      <article class="course-card">
        <span class="course-badge is-ai">零基础入门 · 13 讲</span>
        <h3>写给高考生的编程第一课</h3>
        <p>给刚走出考场的你：用一个暑假、AI 当主力、做中学，独立做出并上线一个带 AI 的个人作品，开学就能发给新室友。顺手回答“AI 时代还要不要学编程、要不要报计算机”，把这个项目当成一次专业试驾。真·零基础，13 讲分四站，两条路线。</p>
        <div class="course-card-footer">
          <span>适合：刚高考完、零基础、还在纠结要不要学编程的人</span>
          <a class="course-link" href="/courses/gaokao-coding/">进入课程</a>
        </div>
      </article>
      <article class="course-card">
        <span class="course-badge is-ai">总目录 · 12 讲全</span>
        <h3>AI 与 Agent 大寓言课</h3>
        <p>从“人工智能是什么”开始，用一整套寓言把 AI 发展史、机器学习、深度学习、大模型、RAG、MCP、Skill、Agent Loop、评测、安全治理、vibe coding、SDD 和多 Agent 工程串起来。12 讲 72 章已全部展开。</p>
        <div class="course-card-footer">
          <span>适合：想从 AI 基础一路学到 Agent 工程的人</span>
          <a class="course-link" href="/courses/ai-agent-fables/">进入总目录</a>
        </div>
      </article>
      <article class="course-card">
        <span class="course-badge is-ai">实操手册 · 4 篇</span>
        <h3>AI 工具实操手册</h3>
        <p>用 AI、订阅海外 AI 服务时绕不开的配套工具实操：海外手机号（eSIM）、海外支付、网络与 IP、账号安全与隔离。号→钱→网→守号，每篇都能照着上手。</p>
        <div class="course-card-footer">
          <span>适合：想搞定“拥有并用好一个海外 AI 账号”的人</span>
          <a class="course-link" href="/courses/ai-toolbox/">进入手册</a>
        </div>
      </article>
      <article class="course-card">
        <span class="course-badge is-ai">11 讲全</span>
        <h3>AI Town：Agent 基础设施课程</h3>
        <p>从像素小镇背后的 runtime 入手，11 讲对照源码深拆：Convex 调度、单线程 step、历史回放、异步 LLM、记忆向量检索、迁移实践，加上寻路、对话社交、前端渲染和部署实操。</p>
        <div class="course-card-footer">
          <span>适合：想系统理解多 Agent 工程底座的人</span>
          <a class="course-link" href="/courses/ai-town/">进入课程</a>
        </div>
      </article>
      <article class="course-card">
        <span class="course-badge is-ai">8 讲全</span>
        <h3>多 Agent 编排实战</h3>
        <p>从一张跑着 60 个 agent 的代码审查截图出发：上下文瓶颈、八种编排模式、上下文隔离、对抗式验证、成本边界，再到在 Claude Code 里怎么落地。</p>
        <div class="course-card-footer">
          <span>适合：想搞懂“同时开很多 agent”怎么做、值不值的人</span>
          <a class="course-link" href="/courses/multi-agent-orchestration/">进入课程</a>
        </div>
      </article>
      <article class="course-card">
        <span class="course-badge is-ai">源码逐行 · 连载中</span>
        <h3>Open Agent SDK 源码逐行精讲</h3>
        <p>把 38 万行、2115 个文件的 Open Agent SDK（完整 Claude Code 引擎的开源镜像）按依赖顺序逐文件逐行拆开。读它约等于读 Claude Code 本体。两种学法：核心路线只走主干，全量路线一个文件不落，博客上 Tab 切换。</p>
        <div class="course-card-footer">
          <span>适合：想真正读懂一台工业级 Agent 引擎怎么实现的人</span>
          <a class="course-link" href="/courses/open-agent-sdk/">进入课程</a>
        </div>
      </article>
      <article class="course-card">
        <span class="course-badge is-ai">源码逐行 · 连载中</span>
        <h3>LangChain.js 源码逐行精讲</h3>
        <p>逐行拆开 @langchain/core 引擎（257 个文件、约 5 万行 TS）——LangChain 的“语法”本体。从 Runnable/LCEL 一路读到提示、模型、解析、工具、回调追踪与检索，整季锁定 commit 行号不漂。两种学法：核心路线 38 讲走 LCEL 主干，全量路线连外围包一个文件不落。</p>
        <div class="course-card-footer">
          <span>适合：想真正读懂 LangChain 引擎怎么实现的人</span>
          <a class="course-link" href="/courses/langchainjs/">进入课程</a>
        </div>
      </article>
      <article class="course-card">
        <span class="course-badge is-planned">规划中</span>
        <h3>AI 工程产品化</h3>
        <p>后续会把 AI 视觉浏览器、部署实践、评测回放、多 Agent 协作模式等文章整理成更完整的产品化学习路径。</p>
        <div class="course-card-footer">
          <span>状态：等待内容沉淀</span>
        </div>
      </article>
    </div>
  </section>

  <section class="course-category" id="quality">
    <div class="course-category-head">
      <div>
        <h2>软件工程与质量</h2>
        <p>软件不只是写出来，更要「保证它是好的」。这里放软件质量保证与测试方向：从质量是什么、软件缺陷、质量工程体系、度量、标准、评审、SQA 组织，到设计质量、高质量编程、白盒/黑盒、集成、系统与验收测试。同一门课提供<strong>两个板块、两种讲法</strong>——寓言版与修仙版——再配记忆宫殿、待溯源练习区、一页通关复习网络、16 个章节精讲页和设计题专项：记忆宫殿负责把零散考点放进可点击的空间，练习区先用于检查概念覆盖，一页通关页把已核知识体系、往年 A 卷、2024 回忆和大题模板集中到一个入口，章节精讲页负责从零补每章完整知识，设计题专项再专门拆解高分值大题。</p>
      </div>
      <span class="course-category-count">1 门 · 2 版 · 5 复习入口</span>
    </div>
    <div class="course-grid">
      <article class="course-card">
        <span class="course-badge is-client">板块 A · 寓言版 · 10 讲</span>
        <h3>软件质量与测试大寓言课（家具坊）</h3>
        <p>把《软件质量保证与测试》九章 + 绪论改写成「榫卯镇·老周家具坊」：学徒小磊从「为什么要有人挑毛病」学到「一榫一卯怎么讲究」。每讲配一段贴合课件原话的「背诵版」，理念讲懂、原话背牢。</p>
        <div class="course-card-footer">
          <span>风格：温和生活化的工匠寓言 + 背诵版</span>
          <a class="course-link" href="/courses/software-quality-fables/">进入寓言版</a>
        </div>
      </article>
      <article class="course-card">
        <span class="course-badge is-ai">板块 B · 修仙版 · 10 讲</span>
        <h3>质道九境（灵枢宗 · 修仙版）</h3>
        <p>同一套考点的第二种讲法：女弟子青萝在灵枢宗修「质道九境」。正式术语原样入文、不造黑话，每讲按「故事→术语→概念正解→场景映射→考点卡→小试炼→易错点」七段展开。</p>
        <div class="course-card-footer">
          <span>风格：有冲突有节奏的修仙叙事 + 七段考点结构</span>
          <a class="course-link" href="/courses/software-quality-xianxia/">进入修仙版</a>
        </div>
      </article>
      <article class="course-card">
        <span class="course-badge is-client">记忆宫殿 · 可交互</span>
        <h3>软件质量医院</h3>
        <p>把质量、SQA、评审、质量费用、设计编程、测试层次、白盒与黑盒测试做成一栋可点击的复习建筑。按“大门 → 一楼 → 二楼 → 三楼 → 四楼 → 五楼”走一遍，口诀、画面联想、答题句和默写题同步展开。</p>
        <div class="course-card-footer">
          <span>适合：考前记不住概念，想用空间联想快速回忆的人</span>
          <a class="course-link" href="/software-quality-memory-palace/">进入记忆宫殿</a>
        </div>
      </article>
      <article class="course-card">
        <span class="course-badge is-ai">冲刺闪卡 · 翻面练习</span>
        <h3>软件质量与测试 · 冲刺记忆闪卡</h3>
        <p>把全书 15 章考点做成带优先级（P0 必背 / P1 重点 / P2 了解）的知识卡，关键的「一串性质」配首字口诀/谐音助记；再把练习区的 97 道练习题按章节绑到对应卡片，做成翻面卡：默认显示题目，先做、再点「翻面」对知识点和答案。支持搜索、按优先级筛选、勾选记进度（存本机浏览器）。</p>
        <div class="course-card-footer">
          <span>适合：考前要把考点背下来、又想边背边刷题的人</span>
          <a class="course-link" href="/courses/software-quality-flashcards/">进入闪卡</a>
        </div>
      </article>
      <article class="course-card">
        <span class="course-badge is-project">课堂练习 · 97 题</span>
        <h3>软件质量与测试待溯源练习区</h3>
        <p>把 PPT、复习讲义、公开 CSDN 页面和已核往年材料能支持的概念练习先集中成一页：质量保证理论到软件测试实践分组，判断、选择、填空、简答、设计题都有，答案默认折叠。蓝墨云班课原题和互评老师参考答案尚未导出，不能把它当老师原题库。</p>
        <div class="course-card-footer">
          <span>用法：先刷题，再按错题回看对应章节</span>
          <a class="course-link" href="/courses/software-quality-exercises/">进入练习区</a>
        </div>
      </article>
      <article class="course-card">
        <span class="course-badge is-project">对比</span>
        <h3>两种讲法对比：寓言 vs 修仙</h3>
        <p>同一门课、两套外壳，到底哪种更适合零基础入门、哪种更适合考前突击？这篇把两版逐项放在一起比：可读性、记忆点、术语贴合度、考试可迁移性，给出选读建议。</p>
        <div class="course-card-footer">
          <span>适合：纠结读哪一版、或想两版对读的人</span>
          <a class="course-link" href="/2026/06/20/software-quality-two-styles-compare/">看对比</a>
        </div>
      </article>
      <article class="course-card">
        <span class="course-badge is-project">期末复习 · 一页通关</span>
        <h3>软件质量与测试一页通关复习网络</h3>
        <p>主复习页。把 PPT 0-9、测试基本理论、已核往年 A 卷、2024 考试回忆和设计大题模板集中到一个页面；蓝墨云班课、互评老师参考答案、C 卷和 2025 图片先标为待导出/OCR。每章卡片再连接到二级章节精讲页，方便零基础同学按章补完整知识。</p>
        <div class="course-card-footer">
          <span>适合：考前只盯一个页面完成总复习</span>
          <a class="course-link" href="/courses/software-quality-review-network/">进入一页通关</a>
        </div>
      </article>
      <article class="course-card">
        <span class="course-badge is-project">设计题 · 大题专项</span>
        <h3>软件质量与测试设计题专项</h3>
        <p>专门面向高分值大题：从零讲等价类、边界值、控制流图、环路复杂度、基本路径、测试用例和状态图。用表格化卷面模板训练，不靠背原题。</p>
        <div class="course-card-footer">
          <span>适合：没学过大题、想按步骤拿过程分</span>
          <a class="course-link" href="/courses/software-quality-design-questions/">进入设计题专项</a>
        </div>
      </article>
    </div>
  </section>

  <section class="course-category" id="backend">
    <div class="course-category-head">
      <div>
        <h2>服务端与网络</h2>
        <p>把“一个请求怎么跑起来”和“网络代理为什么这样工作”放在同一类，方便顺着工程链路学。</p>
      </div>
      <span class="course-category-count">3 门</span>
    </div>
    <div class="course-grid">
      <article class="course-card">
        <span class="course-badge">进行中</span>
        <h3>Go 与服务端学习路线</h3>
        <p>按写一个服务的顺序整理：Go、HTTP、数据库、Redis、MQ、RPC、观测、架构和上线。先把请求链路走明白，再慢慢补中间件。</p>
        <div class="course-card-footer">
          <span>适合：想把后端知识串成一条线的人</span>
          <a class="course-link" href="/courses/server-side/">进入课程</a>
        </div>
      </article>
      <article class="course-card">
        <span class="course-badge">14 讲 · 已完成</span>
        <h3>Go 精进路线</h3>
        <p>跳过 Hello World，从心智模型切入：接口、goroutine、channel、context、泛型、标准库……每讲对准一个让 Go 程序员产生质变的核心机制，最后两讲写完整实战项目（CLI + HTTP 服务）。</p>
        <div class="course-card-footer">
          <span>起点：有一点基础 → 目标：真正精通</span>
          <a class="course-link" href="/courses/learn-go/">进入课程</a>
        </div>
      </article>
      <article class="course-card">
        <span class="course-badge">进行中</span>
        <h3>计网与代理工具学习路线</h3>
        <p>从一次网页请求出发，顺着 DNS、TCP/TLS/HTTP、系统代理、TUN、规则分流、策略组和排障清单，把代理工具背后的网络问题讲清楚。</p>
        <div class="course-card-footer">
          <span>适合：想把代理工具和计网基础连起来的人</span>
          <a class="course-link" href="/courses/network-proxy/">进入课程</a>
        </div>
      </article>
    </div>
  </section>

  <section class="course-category" id="client">
    <div class="course-category-head">
      <div>
        <h2>前端与客户端</h2>
        <p>这里会放前端工程、Lynx、React、客户端调试、跨端和移动端相关课程，避免它们被 AI 或项目文章淹没。</p>
      </div>
      <span class=”course-category-count”>1 门 + 规划</span>
    </div>
    <div class=”course-grid”>
      <article class=”course-card”>
        <span class=”course-badge is-client”>16 讲 · 已完成</span>
        <h3>Swift 从零路线</h3>
        <p>不预设任何编程背景，从 let/var 开始，走过 Optional、Protocol、async/await，直到 SwiftUI 写完整 App。每讲配 Xcode Playground 可运行代码，16 讲覆盖现代 Swift 6 全貌。</p>
        <div class=”course-card-footer”>
          <span>起点：零基础 → 目标：独立写 SwiftUI App</span>
          <a class=”course-link” href=”/courses/learn-swift/”>进入课程</a>
        </div>
      </article>
      <div class=”course-empty” style=”align-self:start”>
        <p>已有的 Lynx、前端调试、ReactLynx、Canvas、动效文章会先继续沉淀，后面整理成一条”前端与客户端工程路线”。</p>
      </div>
    </div>
  </section>

  <section class="course-category" id="projects">
    <div class="course-category-head">
      <div>
        <h2>项目与作品</h2>
        <p>项目不再和课程平铺在一起。自研项目、源码拆解、可运行小游戏和工具，统一从这里进入。</p>
      </div>
      <span class="course-category-count">1 个入口</span>
    </div>
    <div class="course-grid">
      <article class="course-card">
        <span class="course-badge is-project">项目集合</span>
        <h3>项目工坊</h3>
        <p>把自己写的项目、读过的源码和可运行作品整理成工单式入口：每个项目都有背景、技术栈、拆解文章和可复用经验。</p>
        <div class="course-card-footer">
          <span>适合：想从项目案例进入的人</span>
          <a class="course-link" href="/projects/">进入项目工坊</a>
        </div>
      </article>
      <article class="course-card">
        <span class="course-badge is-project">作品入口</span>
        <h3>可运行作品</h3>
        <p>AI 视觉翻书、麻将、画室等可交互作品仍在“作品”菜单里；这里作为项目大类的说明入口，后续会补成更完整的项目索引。</p>
        <div class="course-card-footer">
          <span>状态：逐步归档</span>
        </div>
      </article>
    </div>
  </section>

  <section class="course-note">
    <p>以后新增内容先判断大类，再决定是新建课程页、补进已有课程，还是放进项目工坊。目录不会再无限并列增长。</p>
  </section>
</div>
