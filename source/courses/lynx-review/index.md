---
title: "Lynx 审查者速成课"
date: 2026-06-28 09:00:00
description: "不教你从零手写 Lynx，教你看得懂 AI 写的 Lynx——让 AI 写、你来 review，静默踩的坑一眼认出来。八讲，两条路线：按顺序精读，或按主题速查。"
---

<style>
.lrv-page{--ink:#1d2127;--text:#2a2f36;--muted:#69727d;--line:rgba(29,33,39,.12);--panel:#fff;--wash:#f4f5f3;--blue:#3f5d7e;--red:#b73a2c;color:var(--text)}
.lrv-page *{box-sizing:border-box;min-width:0}
.lrv-hero{padding:32px;border:1px solid var(--line);border-radius:6px;background:linear-gradient(135deg,rgba(183,58,44,.07),rgba(63,93,126,.08)),var(--panel)}
.lrv-kicker{display:inline-flex;align-items:center;margin-bottom:14px;padding:6px 10px;border:1px solid rgba(63,93,126,.2);border-radius:999px;color:var(--blue);background:rgba(63,93,126,.08);font-size:13px;font-weight:760}
.lrv-hero h2{margin:0 0 14px;color:var(--ink);font-size:30px;line-height:1.25}
.lrv-hero p{margin:0;color:var(--muted);line-height:1.8}
.lrv-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:20px 0 6px}
.lrv-stat{padding:14px;border:1px solid var(--line);border-radius:4px;background:rgba(255,255,255,.6)}
.lrv-stat strong{display:block;color:var(--ink);font-size:22px;line-height:1.1}
.lrv-stat span{color:var(--muted);font-size:13px}
.lrv-legend{display:flex;flex-wrap:wrap;gap:14px;margin:22px 0 6px;padding:14px 18px;border:1px solid var(--line);border-radius:6px;background:var(--wash)}
.lrv-legend span{font-size:13px;color:var(--muted)}
.lrv-b{display:inline-block;font-size:12px;font-weight:700;padding:1px 8px;border-radius:999px;line-height:1.7;white-space:nowrap}
.lrv-core{color:#fff;background:var(--red)}
.lrv-key{color:var(--red);background:rgba(183,58,44,.1);border:1px solid rgba(183,58,44,.3)}
.lrv-skim{color:var(--blue);background:rgba(63,93,126,.1);border:1px solid rgba(63,93,126,.25)}
.lrv-route{position:absolute;opacity:0;pointer-events:none}
.lrv-tabs{display:flex;gap:8px;margin:28px 0 18px;border-bottom:2px solid var(--line)}
.lrv-tabs label{cursor:pointer;padding:12px 20px;font-weight:760;color:var(--muted);border:1px solid var(--line);border-bottom:none;border-radius:6px 6px 0 0;background:var(--wash);margin-bottom:-2px}
#lrv-read-r:checked~.lrv-tabs label[for=lrv-read-r]{color:var(--red);background:var(--panel);border-bottom:2px solid var(--panel)}
#lrv-topic-r:checked~.lrv-tabs label[for=lrv-topic-r]{color:var(--red);background:var(--panel);border-bottom:2px solid var(--panel)}
.lrv-panel{display:none}
#lrv-read-r:checked~.lrv-panel-read{display:block}
#lrv-topic-r:checked~.lrv-panel-topic{display:block}
.lrv-route-note{margin:0 0 18px;padding:12px 16px;border-left:3px solid var(--blue);background:rgba(63,93,126,.06);border-radius:0 4px 4px 0;color:var(--muted);font-size:14px}
.lrv-list{display:grid;gap:10px}
.lrv-row{display:grid;grid-template-columns:46px 1fr auto;gap:14px;align-items:center;padding:14px 16px;border:1px solid var(--line);border-radius:5px;background:var(--panel);text-decoration:none!important;color:var(--text)}
.lrv-row:hover{border-color:rgba(183,58,44,.4);transform:translateY(-1px);box-shadow:0 6px 18px rgba(22,32,42,.07)}
.lrv-num{font-size:20px;font-weight:800;color:var(--blue);text-align:center}
.lrv-rt h4{margin:0 0 3px;color:var(--ink);font-size:16px}
.lrv-rt p{margin:0;color:var(--muted);font-size:13px;line-height:1.6}
.lrv-tag{font-size:12px;font-weight:700;color:var(--muted);white-space:nowrap}
html[data-user-color-scheme="dark"] .lrv-page{--ink:#e8eaed;--text:#c9cdd4;--muted:#9aa3ad;--line:rgba(255,255,255,.14);--panel:#1c2026;--wash:#23272e;--blue:#9fc1ec;--red:#ef9a8e}
html[data-user-color-scheme="dark"] .lrv-stat{background:rgba(255,255,255,.03)}
@media(max-width:575px){.lrv-stats{grid-template-columns:repeat(2,1fr)}.lrv-row{grid-template-columns:38px 1fr}.lrv-tag{display:none}}
</style>

<div class="lrv-page"><section class="lrv-hero"><span class="lrv-kicker">Code Review · Lynx 审查者</span><h2>Lynx 审查者速成课</h2><p>不教你从零手写 Lynx，教你<strong>看得懂 AI 写的 Lynx</strong>——让 AI 写、你来 review，那些<strong>能编译、却静默踩坑</strong>的地方一眼认出来。八讲分两层：样式层（肉眼可见）与运行时层（双线程，静默危险）。</p><div class="lrv-stats"><div class="lrv-stat"><strong>8</strong><span>讲（00–07）</span></div><div class="lrv-stat"><strong>2 层</strong><span>样式 + 运行时</span></div><div class="lrv-stat"><strong>1 个</strong><span>可跑的扫描器</span></div><div class="lrv-stat"><strong>2 条</strong><span>学习路线</span></div></div></section><div class="lrv-legend"><span><span class="lrv-b lrv-core">必读</span> 核心拦截点</span><span><span class="lrv-b lrv-key">重点</span> 高频细节</span><span><span class="lrv-b lrv-skim">可跳读</span> 知道即可</span></div><input class="lrv-route" type="radio" name="lrv-route" id="lrv-read-r" checked><input class="lrv-route" type="radio" name="lrv-route" id="lrv-topic-r"><div class="lrv-tabs"><label for="lrv-read-r">按顺序精读</label><label for="lrv-topic-r">按主题速查</label></div><div class="lrv-panel lrv-panel-read"><p class="lrv-route-note">从 00 装好两个心智模型（不是浏览器 + 双线程），再逐层往下。第一次学走这条。</p><div class="lrv-list"><a class="lrv-row" href="/2026/06/28/lynx-review-00-mental-model/"><span class="lrv-num">00</span><div class="lrv-rt"><h4>地基 · 双线程心智模型</h4><p>为什么 Web/RN 直觉会害你 / 线程上下文表 / 最危险红线：render 作用域调原生</p></div><span class="lrv-tag">已完成 ✔</span></a><a class="lrv-row" href="/2026/06/28/lynx-review-01-style-redlines/"><span class="lrv-num">01</span><div class="lrv-rt"><h4>样式红线</h4><p>text 必包 / border-box / margin 不合并 / linear 不撑满 / 选择器静默失效 / z-index 层叠 / 单位</p></div><span class="lrv-tag">已完成 ✔</span></a><a class="lrv-row" href="/2026/06/28/lynx-review-02-layout-choice/"><span class="lrv-num">02</span><div class="lrv-rt"><h4>布局选型</h4><p>linear / flex / grid / relative 四选一 + 每种“选错/写错的味道”（grid 简写、@media 静默雷）</p></div><span class="lrv-tag">已完成 ✔</span></a><a class="lrv-row" href="/2026/06/28/lynx-review-03-events-interaction/"><span class="lrv-num">03</span><div class="lrv-rt"><h4>交互与事件</h4><p>bindtap/catchtap / target vs currentTarget / 事件在后台线程 / 跟手交互走主线程</p></div><span class="lrv-tag">已完成 ✔</span></a><a class="lrv-row" href="/2026/06/28/lynx-review-04-animation/"><span class="lrv-num">04</span><div class="lrv-rt"><h4>动画</h4><p>从零看懂 transition / keyframes / 性能红线（只动 transform·opacity）/ 声明式 vs 跟手</p></div><span class="lrv-tag">已完成 ✔</span></a><a class="lrv-row" href="/2026/06/28/lynx-review-05-why-automation-hard/"><span class="lrv-num">05</span><div class="lrv-rt"><h4>番外 · 为什么 AI 操作 Lynx 总点不准</h4><p>根因（截图猜坐标 + 坐标空间 + 双线程时序）/ DevTool 精确点击五步法 / 排错</p></div><span class="lrv-tag">已完成 ✔</span></a><a class="lrv-row" href="/2026/06/28/lynx-review-06-element-traps/"><span class="lrv-num">06</span><div class="lrv-rt"><h4>高频元素陷阱</h4><p>scroll-view vs list / text-maxline / image 没尺寸·无 alt / input 用 bindinput 非 onChange</p></div><span class="lrv-tag">已完成 ✔</span></a><a class="lrv-row" href="/2026/06/28/lynx-review-07-scanner-tool/"><span class="lrv-num">07</span><div class="lrv-rt"><h4>终 · 把扫描器变成一键 review 工具</h4><p>reactlynx 扫描器秒级揪出运行时违规（含真实输出）/ 4 条规则 / 自动修 / 工具兜运行时、人兜样式</p></div><span class="lrv-tag">已完成 ✔</span></a></div></div><div class="lrv-panel lrv-panel-topic"><p class="lrv-route-note">已经在 review、想直接定位某类问题？按你手上遇到的现象找对应讲。</p><div class="lrv-list"><a class="lrv-row" href="/2026/06/28/lynx-review-01-style-redlines/"><span class="lrv-num">样式</span><div class="lrv-rt"><h4>文字不显示 / 布局莫名偏移 / 间距翻倍</h4><p>→ 01 样式红线（text 必包、margin 不合并、选择器静默失效）</p></div><span class="lrv-tag">01</span></a><a class="lrv-row" href="/2026/06/28/lynx-review-02-layout-choice/"><span class="lrv-num">布局</span><div class="lrv-rt"><h4>该用哪种布局 / grid 跨格不生效 / 换行排不出来</h4><p>→ 02 布局选型（grid 简写、linear 误用 wrap/order）</p></div><span class="lrv-tag">02</span></a><a class="lrv-row" href="/2026/06/28/lynx-review-03-events-interaction/"><span class="lrv-num">交互</span><div class="lrv-rt"><h4>点击取错数据 / 事件不该冒泡 / 滚动联动卡顿</h4><p>→ 03 交互与事件（currentTarget、catchtap、主线程脚本）</p></div><span class="lrv-tag">03</span></a><a class="lrv-row" href="/2026/06/28/lynx-review-04-animation/"><span class="lrv-num">动画</span><div class="lrv-rt"><h4>动画卡顿掉帧 / 跟手动画做不出来</h4><p>→ 04 动画（只动 transform·opacity、跟手走主线程）</p></div><span class="lrv-tag">04</span></a><a class="lrv-row" href="/2026/06/28/lynx-review-06-element-traps/"><span class="lrv-num">元素</span><div class="lrv-rt"><h4>长列表卡 / 图片不显示 / 输入框不响应</h4><p>→ 06 高频元素陷阱（scroll-view↔list、image 尺寸、input bindinput）</p></div><span class="lrv-tag">06</span></a><a class="lrv-row" href="/2026/06/28/lynx-review-05-why-automation-hard/"><span class="lrv-num">自动化</span><div class="lrv-rt"><h4>AI / 脚本操作页面总点不准</h4><p>→ 05 番外（别用截图坐标，用 DevTool DOM 几何）</p></div><span class="lrv-tag">05</span></a><a class="lrv-row" href="/2026/06/28/lynx-review-07-scanner-tool/"><span class="lrv-num">工具</span><div class="lrv-rt"><h4>想自动扫出运行时红线 / 接进 CI</h4><p>→ 07 reactlynx 扫描器（detect-background-only 等 4 条规则）</p></div><span class="lrv-tag">07</span></a><a class="lrv-row" href="/2026/06/28/lynx-review-00-mental-model/"><span class="lrv-num">根源</span><div class="lrv-rt"><h4>想搞懂这些坑的总根源</h4><p>→ 00 双线程心智模型（样式层 + 运行时层两副眼镜）</p></div><span class="lrv-tag">00</span></a></div></div></div>

> 本课内容以本地 Lynx 文档（lynx-api-docs / reactlynx-best-practices / lynx-devtool）为依据，并对承重断言（默认 position/justify-content/overflow、选择器支持、双线程切分等）逐条对照 [lynx-family/lynx](https://github.com/lynx-family/lynx)（develop 分支）源码核校——各讲末尾「源码核对」折叠列出了确认与勘误。具体属性的支持版本仍可能随 Lynx 演进，落地前建议复核。
