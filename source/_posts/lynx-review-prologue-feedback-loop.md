---
title: "《Lynx 审查者速成课》序章 · 为什么 AI 写 Lynx 远不如 Web：一条被切断的反馈回路"
date: 2026-06-29 09:00:00
tags: [Lynx, ReactLynx, AI, 代码审查, 反馈回路, 课程]
categories: [技术笔记]
toc: true
visibility: public
---

<style>
.lrv-b{display:inline-block;font-size:12px;font-weight:700;padding:1px 8px;border-radius:999px;vertical-align:middle;margin-left:6px;line-height:1.7;white-space:nowrap}
.lrv-core{color:#fff;background:#b73a2c}
.lrv-key{color:#b73a2c;background:rgba(183,58,44,.1);border:1px solid rgba(183,58,44,.3)}
.lrv-skim{color:#3f5d7e;background:rgba(63,93,126,.1);border:1px solid rgba(63,93,126,.25)}
.lrv-skip{color:#69727d;background:rgba(105,114,125,.12);border:1px solid rgba(105,114,125,.25)}
.lrv-note{margin:14px 0;padding:12px 16px;border-left:3px solid #3f5d7e;background:rgba(63,93,126,.06);border-radius:0 4px 4px 0}
.lrv-why{margin:14px 0;padding:12px 16px;border-left:3px solid #69727d;background:rgba(105,114,125,.07);border-radius:0 4px 4px 0;color:#3a4049}
.lrv-key-note{margin:14px 0;padding:12px 16px;border-left:3px solid #b73a2c;background:rgba(183,58,44,.06);border-radius:0 4px 4px 0}
.lrv-fold{margin:14px 0;border:1px solid rgba(29,33,39,.14);border-radius:6px;background:#fafafa;padding:0 16px}
.lrv-fold>summary{cursor:pointer;padding:12px 0;font-weight:700;color:#1d2127}
.lrv-fold[open]{padding-bottom:8px}
.lrv-legend{margin:14px 0;padding:12px 16px;border:1px dashed rgba(29,33,39,.2);border-radius:6px;background:#fcfcfc;font-size:14px;line-height:2}
.lrv-card{margin:16px 0;padding:14px 18px;border:1px solid rgba(183,58,44,.25);border-radius:8px;background:rgba(183,58,44,.03)}
html[data-user-color-scheme="dark"] .lrv-note{background:rgba(126,168,224,.1);border-left-color:#7ea8e0;color:#c9cdd4}
html[data-user-color-scheme="dark"] .lrv-why{background:rgba(255,255,255,.04);border-left-color:#8b93a0;color:#aeb4be}
html[data-user-color-scheme="dark"] .lrv-key-note{background:rgba(224,108,92,.12);border-left-color:#e0746b;color:#d6dae0}
html[data-user-color-scheme="dark"] .lrv-fold{background:rgba(255,255,255,.03);border-color:rgba(255,255,255,.14)}
html[data-user-color-scheme="dark"] .lrv-fold>summary{color:#e6e8ec}
html[data-user-color-scheme="dark"] .lrv-card{background:rgba(224,108,92,.08);border-color:rgba(224,108,92,.3);color:#d6dae0}
html[data-user-color-scheme="dark"] .lrv-legend{background:rgba(255,255,255,.03);border-color:rgba(255,255,255,.18)}
html[data-user-color-scheme="dark"] .lrv-key{color:#ef9a8e;background:rgba(224,108,92,.14);border-color:rgba(224,108,92,.4)}
html[data-user-color-scheme="dark"] .lrv-skim{color:#9fc1ec;background:rgba(126,168,224,.14);border-color:rgba(126,168,224,.35)}
html[data-user-color-scheme="dark"] .lrv-skip{color:#aab1bb;background:rgba(170,180,190,.14);border-color:rgba(170,180,190,.3)}
</style>

<div class="lrv-key-note"><strong>这是全课的序章</strong>，回答一个问题：<strong>为什么 AI 写 Web 页面挺好用，一到 Lynx 就明显变差？</strong> 答案不是“模型对 Lynx 更笨”，而是——它写 Web 时拥有的那条<strong>“生成 → 看结果 → 改”的反馈回路，在 Lynx 上被切断了</strong>。这门审查课，本质就是教你把这条回路<strong>手工补回来</strong>。<br><strong>（发表后更正：</strong>“被切断”这话说绝对了——继续调研发现这条回路其实<strong>补得回来、且不必靠真机</strong>，见文末「调研更新」。）</div>

## 一句话论点 <span class="lrv-b lrv-core">必读</span>

> Web 是一个**为“被观察”而设计**的平台；Lynx 是一个**为“原生性能”而设计**、观察是后贴上去的平台。
> 而 AI 写代码的好坏 ≈ **先验知识 × 反馈回路的紧密度**。**Web 把这两项都拉满；Lynx 两项都弱**——最致命的是，它的反馈回路被真机与封闭工具卡死了。

AI 不是靠“懂”变好的，是靠**不停地“写一版 → 看哪错了 → 改”**磨出来的。这条回路在 Web 上免费、即时、开放；在 Lynx 上昂贵、滞后、封闭。差距就从这里来。

## 全链路对比：每一环 Lynx 都更弱，而且会叠加 <span class="lrv-b lrv-key">重点</span>

把“AI 干一件 UI 活”拆成一条链，逐环对比：

| 环节 | Web | Lynx 手机页面 |
| --- | --- | --- |
| **训练先验** | 几十年开放语料，每个坑都有人写过 | 少、新、大半在内网 → AI 默认退回 Web 写法 |
| **平台自描述** | DOM / CSSOM / 无障碍树都是一等公民、标准、可读 | 原生渲染，DOM 只能经 DevTool CDP 拿，无标准无障碍树 |
| **错误显形** | 响亮：console 报错、红线、任意浏览器一看就错 | **静默**：`::before`、margin、线程错都能编译，只在真机上悄悄错 |
| **反馈回路** | headless 浏览器 / Playwright 本地秒跑，截图 + 读 DOM + 跑 JS，**全自动闭环** | 要真机 + 宿主 App + HDT 配对 + DevTool，**硬件与内网门槛，常常闭不了环** |
| **自动化面** | 按 selector / role 精确点，确定性 | 原生面，得走 CDP 几何，截图坐标会骗人 |
| **Web 习惯** | 就是对的 | **反成包袱**：Lynx 故意和 Web 不一样（bindtap、双线程、不合并 margin），先验越强错得越自信 |
| **工具生态** | Playwright / Cypress / eslint / a11y，海量成熟 | lynx-devtool 才两百颗星、部分内网（HDT）、没有现成 AI agent 层 |

没有哪一环是“一个致命原因”。是**每一环都弱了一点，然后叠乘**。

## 核心：调试差，是生成差的“上游” <span class="lrv-b lrv-core">必读</span>

很多人把“AI 写 Lynx 不好”和“Lynx 不好调试”当成两个并列的抱怨。其实它俩是一条因果链：

<div class="lrv-key-note"><strong>调试闭不了环 → 没有纠错 → 生成只能停在“盲写的第一稿”。</strong></div>

- **Web**：AI 写完，能在沙箱里把页面跑起来、截图、读 DOM、看 console——它能**自己发现自己错了，并改**。所以 Web 输出能迭代到第 N 稿。
- **Lynx**：AI 写完，**看不到结果**（没设备、没宿主 App、没配对，错误还静默）。于是它**永远停在第一稿，从没被纠正过**。

所以 Web 生成好，很大程度**不是模型对 Web“更聪明”，而是 Web 让它能不停自我纠正**。把同一个模型放到一个“写完看不见结果”的平台上，它再聪明也只能交初稿。

<div class="lrv-why"><strong>一个活生生的证据</strong>：写这门课配套的真机驱动工具时，软件侧全部验证通过，唯一卡住的是“手机还没配对进 HDT”这一步物理操作。<strong>连“想看一眼结果”都这么难</strong>——这正是 Web 永远不会遇到、而 Lynx 天天遇到的那道坎。</div>

## 操作难，也是同一个根 <span class="lrv-b lrv-key">重点</span>

不只是“生成”，连“让 AI 去点一个真机 Lynx 页面”都比 Web 难得多，而且**同源**：平台不透明 + 硬件门槛 + 没有标准自动化面。

- Web 自动化是“**问平台要答案**”：`querySelector` 拿到元素和精确包围盒，按元素点。
- Lynx 自动化默认是“**对着像素猜**”：只有截图，像素到真实坐标之间隔着 DPR / 原点 / 平台换算 + 动态布局 + 双线程时序。

区别就一句话：**平台肯不肯自描述。** Web 肯，Lynx 默认不肯（要你绕道 DevTool CDP 才肯）。

## 怎么破：把 Web 免费拥有的反馈回路，手工补回来 <span class="lrv-b lrv-core">必读</span>

你改不了模型的先验，也改不了 Lynx 是原生渲染这个事实。但你能把**缺的每一环补回来**——这正是这门课每一讲在做的事：

| Web 自带的 | Lynx 缺、这门课补的 |
| --- | --- |
| 编译器 / 浏览器即时报错 | **审查眼力 + 扫描器**（00–07 讲）替代“错误显形” |
| Playwright 操作页面 | **可靠交互层**（DevTool CDP 几何驱动）替代缺失的自动化面 |
| 权威 MDN 文档 | **对照 Lynx 源码核校** 替代不可信的二手文档 |
| headless 秒跑看结果 | `@lynx-js/testing-environment`（jsdom 级，测逻辑）+ **Web Platform 在浏览器里跑**（可 Playwright 驱动）+ 真机只做最终像素验收 |

把这四样接起来，你就给 AI 手工搭了一条“**生成 → 真机看 → 改**”的回路。

<div class="lrv-key-note">结论：<strong>Lynx 上 AI 写得好不好，现在主要不取决于模型，取决于你能不能替它把这条回路补上。</strong> 这也是“会 review 的人”比“只会让 AI 写的人”值钱的地方——你就是那条被切断的回路里，<strong>缺的那一环</strong>。</div>

## 调研更新：回路其实闭得上，只是没接好 <span class="lrv-b lrv-key">发表后修正</span>

本文初版把“反馈回路被切断”说得太绝对。继续往 Lynx 源码里挖，发现**不靠真机闭环的路子，Lynx 其实备齐了**——“被卡死”的只是默认那条（真机 + HDT）。证据：

| 路子 | 是什么（源码自述） | 闭哪段环 |
| --- | --- | --- |
| `@lynx-js/testing-environment` + testing-library | “**Lynx 版的 jsdom**” | 组件/逻辑正确性，**零设备、纯自动化** |
| Web Platform（`@lynx-js/web-*`） | “**同一个 Lynx 工程在浏览器里跑**”，用浏览器引擎实现 Lynx 原生绑定 API，连 Linear Layout 都用 JS/CSS 复刻、双线程用 worker 保留；仓里自带 `playwright-fixtures` | 渲染+交互，**浏览器里就能看、能 Playwright 驱动** |
| 桌面 Explorer（`explorer/darwin`·`windows`）+ `DesktopTransport` | Lynx Explorer 有 **macOS/Windows 桌面版** | 在电脑上跑 + DevTool 看，不用手机 |

<div class="lrv-why"><strong>诚实的折扣</strong>：Web Platform 官方说“we’re working on…”“most behaviors the same”，且<strong>像素渲染不与 Android/iOS 对齐</strong>（它走 DOM 渲染）。所以它适合跑<strong>逻辑、交互、大致外观</strong>并让 AI 自我纠错，但<strong>不能当像素级真机验收</strong>；testing-environment 测逻辑很准，但不测真机渲染。</div>

<div class="lrv-key-note"><strong>所以修正后的结论更有用</strong>：Lynx 的反馈回路缺的不是“可能性”，是“<strong>开箱即用 + 接进 AI</strong>”。给 AI 配的反馈面，<strong>本就不该是物理手机</strong>，而该是 <code>testing-environment</code>（测逻辑）+ Web Platform（看渲染、Playwright 驱动）；真机只留给最后的像素验收。序章从“诉苦”就此变成“有解的行动纲领”。</div>

## 接下来怎么读这门课

序章讲的是“为什么”。具体的“怎么做”在八讲里：

- **00–02**：装心智模型（不是浏览器 + 双线程）、样式红线、布局选型——补“错误显形”。
- **03–04**：交互与事件、动画——补高频静默坑。
- **05**：番外，为什么 AI 操作 Lynx 总点不准 + 精确驱动——补“自动化面”。
- **06–07**：高频元素陷阱、把扫描器变一键工具——补“编译器级检查”。

<div class="lrv-note">从课程入口 <a href="/courses/lynx-review/">/courses/lynx-review/</a> 进，两条路线随你：按顺序精读，或按主题速查。</div>

---

> 本文是一篇“为什么”的总论，观点基于对 [lynx-family/lynx](https://github.com/lynx-family/lynx)、[lynx-stack](https://github.com/lynx-family/lynx-stack) 源码与 lynx-devtool 工具链的实测；「调研更新」一节是发表后继续调研得到的修正——把结论从“回路被切断”更正为“回路闭得上、只是没接好”。下一步要亲手验证的是 **Web Platform 能不能跑任意 ReactLynx 页面、parity 有多全**，这决定了“AI 能否主要靠浏览器闭环”。Lynx 仍在快速演进，判断会随时间变化。
