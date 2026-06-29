---
title: "写给高考生的编程第一课"
date: 2026-07-02 09:00:00
description: "高考完的这个夏天，用 AI 亲手造出你的第一个作品，顺便给自己做一次专业试驾。零基础也能学，十三讲，两条路线——第一次学按顺序跟做，回来查按问题定位。"
---

<style>
.gkc-key-note{margin:18px 0;padding:14px 16px;line-height:1.78;border-radius:8px;background:rgba(183,58,44,.09);border-left:4px solid #b73a2c}
.gkc-route{position:absolute;opacity:0;pointer-events:none}
.gkc-tabs{display:flex;gap:8px;margin:28px 0 18px;border-bottom:2px solid var(--line)}
.gkc-tabs label{cursor:pointer;padding:12px 18px;font-weight:760;color:var(--muted);border:1px solid var(--line);border-bottom:none;border-radius:6px 6px 0 0;background:var(--wash);margin-bottom:-2px}
#gkc-seq-r:checked~.gkc-tabs label[for=gkc-seq-r]{color:#b73a2c;background:var(--panel);border-bottom:2px solid var(--panel)}
#gkc-skill-r:checked~.gkc-tabs label[for=gkc-skill-r]{color:#b73a2c;background:var(--panel);border-bottom:2px solid var(--panel)}
.gkc-panel{display:none}
#gkc-seq-r:checked~.gkc-panel-seq{display:block}
#gkc-skill-r:checked~.gkc-panel-skill{display:block}
.gkc-route-note{color:var(--muted);font-size:14px;margin:0 0 14px}
.gkc-week{margin:24px 0 8px;font-weight:800;color:#a3331f;font-size:14px}
.gkc-row{display:flex;align-items:center;gap:14px;padding:13px 15px;margin:8px 0;border:1px solid var(--line);border-radius:10px;text-decoration:none;background:var(--panel)}
.gkc-row:hover{border-color:#b73a2c}
.gkc-num{flex:none;width:38px;height:38px;display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;background:#b73a2c;border-radius:9px;font-size:15px}
.gkc-rt{flex:1;min-width:0}
.gkc-rt h4{margin:0 0 3px;font-size:16px;line-height:1.3}
.gkc-rt p{margin:0;font-size:13px;color:var(--muted);line-height:1.5}
.gkc-tag{flex:none;font-size:13px;color:#3f8a5b;font-weight:700}
html[data-user-color-scheme="dark"] .gkc-key-note{background:rgba(183,58,44,.18)}
html[data-user-color-scheme="dark"] .gkc-week{color:#e89180}
html[data-user-color-scheme="dark"] .gkc-tag{color:#6abb8a}
</style>

<div class="gkc-key-note"><strong>刚高考完，要不要趁这个暑假学点编程？</strong>这门课带你用 AI、做中学，<strong>独立</strong>做出并上线一个带 AI 的个人作品——开学就能发给新室友，还顺手给"要不要报计算机"做一次真实的<strong>专业试驾</strong>。真·零基础，完全 OK。十三讲，两条路线，挑你顺手的走。<br><strong>说在前头：它是入门点火器，不是速成班</strong>——要真入这行，语法 / 算法 / 计网这些基本功一样得系统学，AI 时代更要学好；第 12 讲给你一张完整的基本功路线图。</div>

<input class="gkc-route" type="radio" name="gkc-route" id="gkc-seq-r" checked><input class="gkc-route" type="radio" name="gkc-route" id="gkc-skill-r"><div class="gkc-tabs"><label for="gkc-seq-r">第一次学 · 按顺序</label><label for="gkc-skill-r">回来查 · 按问题</label></div><div class="gkc-panel gkc-panel-seq"><p class="gkc-route-note">从 00 一路做到 12。每讲 30–60 分钟，主线必做、选学可跳。一周一站，留足玩和歇的时间。</p><div class="gkc-week">开篇</div>
<a class="gkc-row" href="/2026/06/29/gaokao-coding-00-summer/"><span class="gkc-num">00</span><div class="gkc-rt"><h4>序：高考完了，这个夏天值得你做件事</h4><p>要不要学编程 / AI 时代还学不学 / 零基础行不行 + 写下你的点子</p></div><span class="gkc-tag">✔</span></a>
<div class="gkc-week">第一站 · 上手（原来我也能做出来）</div>
<a class="gkc-row" href="/2026/06/29/gaokao-coding-01-first-page/"><span class="gkc-num">01</span><div class="gkc-rt"><h4>半小时，让你的第一张网页活过来</h4><p>零安装，描述一句就出现；养成习惯 #1：先猜后做</p></div><span class="gkc-tag">✔</span></a>
<a class="gkc-row" href="/2026/06/29/gaokao-coding-02-say-it-clearly/"><span class="gkc-num">02</span><div class="gkc-rt"><h4>把想要的，说成 AI 一次就听懂</h4><p>好需求配方：背景 + 清单 + 规矩 + 例子；给例子 &gt; 堆形容词</p></div><span class="gkc-tag">✔</span></a>
<a class="gkc-row" href="/2026/06/29/gaokao-coding-03-read-code/"><span class="gkc-num">03</span><div class="gkc-rt"><h4>它给我这坨代码，到底在干嘛</h4><p>认房间不数砖：结构 / 样式 / 行为；让 AI 加人话注释</p></div><span class="gkc-tag">✔</span></a>
<div class="gkc-week">第二站 · 揭盖（原来它是这么转的）</div>
<a class="gkc-row" href="/2026/06/30/gaokao-coding-04-files-editor/"><span class="gkc-num">04</span><div class="gkc-rt"><h4>把作品搬出聊天框：文件与编辑器</h4><p>搬进真工作台；新循环：改 → 存 → 刷</p></div><span class="gkc-tag">✔</span></a>
<a class="gkc-row" href="/2026/06/30/gaokao-coding-05-frontend-backend-data/"><span class="gkc-num">05</span><div class="gkc-rt"><h4>你电脑里的小宇宙：前端 / 后端 / 数据</h4><p>一张地图，东西坏了知道去哪找</p></div><span class="gkc-tag">✔</span></a>
<a class="gkc-row" href="/2026/06/30/gaokao-coding-06-debug/"><span class="gkc-num">06</span><div class="gkc-rt"><h4>故意把它弄坏，再亲手修好（灵魂课）</h4><p>报错是线索不是骂你；习惯 #3：先假设再粘贴 + 脚手架递减</p></div><span class="gkc-tag">✔</span></a>
<div class="gkc-week">第三站 · 通电（让它真的聪明起来）</div>
<a class="gkc-row" href="/2026/07/01/gaokao-coding-07-connect-ai/"><span class="gkc-num">07</span><div class="gkc-rt"><h4>给作品接上一个真的 AI</h4><p>现成托管模板，key 进后台，不碰本地服务器和计费</p></div><span class="gkc-tag">✔</span></a>
<a class="gkc-row" href="/2026/07/01/gaokao-coding-08-persona-system-prompt/"><span class="gkc-num">08</span><div class="gkc-rt"><h4>给你的 AI 一个人设：数字分身</h4><p>system prompt：用你的口吻、跟新同学聊你的事</p></div><span class="gkc-tag">✔</span></a>
<a class="gkc-row" href="/2026/07/01/gaokao-coding-09-memory-data/"><span class="gkc-num">09</span><div class="gkc-rt"><h4>让它记住事、会翻资料</h4><p>留言板 / 翻你的资料（RAG 直觉）· 选学进阶</p></div><span class="gkc-tag">✔</span></a>
<div class="gkc-week">第四站 · 交付（把它变成能发出去的链接）</div>
<a class="gkc-row" href="/2026/07/02/gaokao-coding-10-deploy/"><span class="gkc-num">10</span><div class="gkc-rt"><h4>一键上线：发个链接给全世界</h4><p>拿到公开网址，开学甩进新生群（高光时刻）</p></div><span class="gkc-tag">✔</span></a>
<a class="gkc-row" href="/2026/07/02/gaokao-coding-11-judge-ai/"><span class="gkc-num">11</span><div class="gkc-rt"><h4>AI 会骗你：什么时候别全信它</h4><p>自信 ≠ 正确；越重要越要验 + 周末裸考</p></div><span class="gkc-tag">✔</span></a>
<a class="gkc-row" href="/2026/07/02/gaokao-coding-12-whats-next/"><span class="gkc-num">12</span><div class="gkc-rt"><h4>你走了多远，和上大学前的最后叮嘱</h4><p>五能力地图 + 专业试驾结论 + 和大学课的关系</p></div><span class="gkc-tag">✔</span></a>
</div><div class="gkc-panel gkc-panel-skill"><p class="gkc-route-note">已经在做、卡在某一处？按你手上的问题，直接跳到对应那讲。</p>
<a class="gkc-row" href="/2026/06/29/gaokao-coding-00-summer/"><span class="gkc-num">00</span><div class="gkc-rt"><h4>我还在纠结：到底要不要学、要不要报计算机</h4><p>序章把这几个问题聊透</p></div><span class="gkc-tag">→</span></a>
<a class="gkc-row" href="/2026/06/29/gaokao-coding-01-first-page/"><span class="gkc-num">01</span><div class="gkc-rt"><h4>我想先做出点东西、找找感觉</h4><p>半小时做出第一张网页</p></div><span class="gkc-tag">→</span></a>
<a class="gkc-row" href="/2026/06/29/gaokao-coding-02-say-it-clearly/"><span class="gkc-num">02</span><div class="gkc-rt"><h4>AI 老是没做对、跟我要的不一样</h4><p>好需求配方：把想要的说清楚</p></div><span class="gkc-tag">→</span></a>
<a class="gkc-row" href="/2026/06/29/gaokao-coding-03-read-code/"><span class="gkc-num">03</span><div class="gkc-rt"><h4>它给的代码我完全看不懂</h4><p>看结构不抠语法，认出每块在干嘛</p></div><span class="gkc-tag">→</span></a>
<a class="gkc-row" href="/2026/06/30/gaokao-coding-06-debug/"><span class="gkc-num">06</span><div class="gkc-rt"><h4>报错了 / 白屏了 / 卡住不知道怎么办</h4><p>读懂报错 + 先假设再粘贴 + 自己修好（灵魂课）</p></div><span class="gkc-tag">→</span></a>
<a class="gkc-row" href="/2026/07/01/gaokao-coding-07-connect-ai/"><span class="gkc-num">07</span><div class="gkc-rt"><h4>我想给作品加一个真的 AI</h4><p>现成模板轨道，踩不到坑</p></div><span class="gkc-tag">→</span></a>
<a class="gkc-row" href="/2026/07/01/gaokao-coding-08-persona-system-prompt/"><span class="gkc-num">08</span><div class="gkc-rt"><h4>想让 AI 用我的口吻、聊我的事</h4><p>给它一个人设（数字分身）</p></div><span class="gkc-tag">→</span></a>
<a class="gkc-row" href="/2026/07/01/gaokao-coding-09-memory-data/"><span class="gkc-num">09</span><div class="gkc-rt"><h4>想让它记住东西 / 会翻我的资料</h4><p>留言板与 RAG 直觉（选学）</p></div><span class="gkc-tag">→</span></a>
<a class="gkc-row" href="/2026/07/02/gaokao-coding-10-deploy/"><span class="gkc-num">10</span><div class="gkc-rt"><h4>我想发布、让别人能打开</h4><p>一键上线，拿到公开网址</p></div><span class="gkc-tag">→</span></a>
<a class="gkc-row" href="/2026/07/02/gaokao-coding-11-judge-ai/"><span class="gkc-num">11</span><div class="gkc-rt"><h4>怎么判断 AI 说得对不对、该不该信</h4><p>幻觉、安全红线、低成本验证</p></div><span class="gkc-tag">→</span></a>
<a class="gkc-row" href="/2026/07/02/gaokao-coding-12-whats-next/"><span class="gkc-num">12</span><div class="gkc-rt"><h4>学完了，到底要不要报计算机 / 接下来往哪走</h4><p>专业试驾结论 + 和大学课的关系 + 三条路</p></div><span class="gkc-tag">→</span></a>
</div>
