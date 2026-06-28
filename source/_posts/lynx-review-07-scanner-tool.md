---
title: "《Lynx 审查者速成课》第07讲（终）· 把扫描器变成你的一键 review 工具"
date: 2026-06-28 17:00:00
tags: [Lynx, ReactLynx, 前端, 代码审查, 工具, 静态分析, 课程]
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

<div class="lrv-key-note"><strong>本讲定位</strong>：全课收官。前六讲练的是“人肉眼力”，这一讲把其中<strong>运行时那一层（第 00 讲的双线程红线）自动化</strong>——用 <code>reactlynx-best-practices</code> 自带的扫描器，几秒钟把 AI 写的代码扫一遍，直接列出违规行号。最终形态是：<strong>工具兜运行时、人兜样式</strong>。</div>

## 第 1 章 · 为什么要工具 <span class="lrv-b lrv-core">必读</span>

第 00 讲那条最危险的红线——在 render 作用域调 `NativeModules` / `lynx.getJSModule`——人肉看会漏（尤其代码长、藏得深时）。这正是静态分析的主场：**不知疲倦、不漏、秒级**。

但要诚实：扫描器**只覆盖运行时层的几条规则**，它不懂你前几讲学的样式红线、选择器静默失效、布局选型、元素陷阱。所以正确姿势不是“有工具就不用看了”，而是：

<div class="lrv-key-note"><strong>工具 + 人</strong>：扫描器负责<strong>运行时层</strong>（线程归属、事件、性能 hint）；你负责<strong>样式层</strong>（01–06 讲的眼力）。两者合起来才是完整的 Lynx review。</div>

## 第 2 章 · 扫描器查哪几条规则 <span class="lrv-b lrv-key">重点</span>

`reactlynx-best-practices` 内置 4 条规则：

| 规则 | 影响级别 | 查什么 |
| --- | --- | --- |
| `detect-background-only` | **CRITICAL** | 在主线程（render 作用域）调原生 API，应挪到 useEffect/事件/`'background only'` |
| `proper-event-handlers` | MEDIUM | 事件绑定与传播是否正确 |
| `main-thread-scripts-guide` | MEDIUM | 高频交互是否该用主线程脚本 |
| `hoist-static-jsx` | LOW | 静态 JSX 提到组件外，避免每次渲染重建 |

<div class="lrv-note">这 4 条正好对应第 00、03、04 讲讲过的运行时要点。<code>detect-background-only</code> 是 CRITICAL，其余是 MEDIUM/LOW——审查优先级也照这个来。</div>

## 第 3 章 · 怎么跑（review 模式） <span class="lrv-b lrv-core">必读</span>

扫描器在 `reactlynx-best-practices` 这个 skill 的 `scripts/index.mjs` 里，导出了 `ReactLynxWorkflow` 和 `formatScanReport`。最小用法：

```js
import fs from 'node:fs';
import { ReactLynxWorkflow, formatScanReport } from '<skill>/scripts/index.mjs';

const src = fs.readFileSync('YourComponent.tsx', 'utf-8');
const workflow = new ReactLynxWorkflow('review');
const summary = workflow.reviewCode(src);
console.log(formatScanReport(summary));
```

拿第 00 讲那个反面教材跑一下（render 作用域里调了 `lynx.getJSModule` 和 `NativeModules`）：

```tsx
export function ProductCard() {
  const mod = lynx.getJSModule('Analytics');   // 第 4 行
  NativeModules.Tracker.report('open');         // 第 5 行
  const [liked, setLiked] = useState(false);
  return <view bindtap={() => setLiked(!liked)}><text>{liked ? '已收藏' : '收藏'}</text></view>;
}
```

**真实输出**（本机实跑，非示意）：

```text
════════════════════════════════════════════════════════════
  ReactLynx Best Practices Scan Report
════════════════════════════════════════════════════════════

📊 Summary:
   Total files scanned: 1
   Files with issues: 1
   Total issues: 2
   ❌ Errors: 2   ⚠️ Warnings: 0   ℹ️ Info: 0

📁 inline
   ❌ Line 4: 'lynx.getJSModule' must only be called in background-only
      contexts (useEffect, useImperativeHandle, ref callback,
      'background only' functions, or event handlers).
      💡 3 fix(es) available
   ❌ Line 5: 'NativeModules' must only be called in background-only
      contexts (...).
      💡 3 fix(es) available
```

<div class="lrv-why">秒级、精确到行号、还告诉你“有 3 个可用修复”。这就是人肉看半天可能漏、工具一眼揪出的那类红线。</div>

## 第 4 章 · 怎么读报告 <span class="lrv-b lrv-key">重点</span>

报告每条命中包含：**文件 → 行号 → ruleId/消息 → severity → 可用修复数**。配合该 skill 里 `rules/<ruleId>.md` 的解释，就能生成“带规则依据”的 review 评论，而不只是甩一行报错。审查产出建议包含：

- 扫描摘要（命中数 / 错误 / 警告）；
- 每个命中的规则解释（来自 `rules/<ruleId>.md`）；
- 影响级别（CRITICAL/MEDIUM/LOW）；
- 可操作的修法（不止贴诊断）。

## 第 5 章 · 自动修（refactor 模式） <span class="lrv-b lrv-skim">可跳读</span>

<details class="lrv-fold">
<summary>展开：生成修复计划并应用（务必先确认）<span class="lrv-b lrv-skim">可跳读</span></summary>

```js
const workflow = new ReactLynxWorkflow('refactor');
workflow.reviewCode(src);
const plan = workflow.generateFixPlan();      // 看可自动修几处
if (plan && plan.fixableIssues > 0) {
  // ⚠️ 应用前先问人，不要无脑改
  const { fixed, appliedFixes } = workflow.applyAutoFixes(src);
}
```

修复类型包括 `wrap-in-useEffect`（包进 useEffect）、`add-directive`（加 `'background only'`）、`add-import`、`move-to-event-handler`。**铁律**：自动修是建议，应用前让人确认；改完再人审一遍，别让工具替你拍板。
</details>

## 第 6 章 · 工具的边界（诚实） <span class="lrv-b lrv-core">必读</span>

<div class="lrv-key-note"><strong>扫描器不查这些</strong>（它们仍要靠你前六讲的眼力）：样式红线（text 必包、margin 不合并、border-box）、选择器静默失效（<code>::before</code>/<code>:nth-child</code>）、布局选型（grid 简写、linear 误用）、元素陷阱（image 没尺寸、input 用 onChange）。<strong>工具兜运行时，人兜样式——这就是这门课的最终形态。</strong></div>

## 第 7 章 · 自测错题 <span class="lrv-b lrv-key">重点</span>

<details class="lrv-fold">
<summary>Q1：扫描器报告里 severity 最高的是哪条规则？为什么？</summary>

`detect-background-only`（CRITICAL）。它对应第 00 讲最危险的红线——主线程调原生模块，会阻塞渲染，且静默。审查优先处理它。
</details>

<details class="lrv-fold">
<summary>Q2：扫描器全绿，是不是就能合并了？</summary>

**不是**。扫描器只覆盖运行时 4 条规则，样式红线、选择器、布局选型、元素陷阱它都不查。全绿只代表“运行时层没踩这几条”，样式层仍要人审。
</details>

<details class="lrv-fold">
<summary>Q3：refactor 模式能自动修，要不要直接全量应用？</summary>

**不要**。自动修是建议，应用前应让人确认（skill 也要求先问），改完再人审一遍。工具不替你拍板。
</details>

<details class="lrv-fold">
<summary>Q4：把扫描器接进 CI / pre-commit 有什么好处？</summary>

把第 00 讲那条 CRITICAL 红线变成“提交即拦截”，AI 或人写的代码只要在 render 作用域碰原生模块就报错，不必等人肉 review 才发现。运行时层从此不漏。
</details>

## 速查卡 · 07 讲 <span class="lrv-b lrv-core">必读</span>

<div class="lrv-card">
<strong>一键扫</strong>：<code>new ReactLynxWorkflow('review').reviewCode(src)</code> → <code>formatScanReport</code>，秒级列出运行时违规（精确到行）。<br>
<strong>4 条规则</strong>：detect-background-only(CRITICAL)、proper-event-handlers、main-thread-scripts-guide、hoist-static-jsx。<br>
<strong>自动修</strong>：refactor 模式可生成并应用修复，但<u>先确认再改</u>。<br>
<strong>最终形态</strong>：工具兜运行时、人兜样式（01–06）。接进 CI 让 CRITICAL 红线“提交即拦”。
</div>

<div class="lrv-key-note"><strong>全课结语</strong>：八讲走完——00 双线程心智模型 / 01 样式红线 / 02 布局选型 / 03 交互事件 / 04 动画 / 05 自动化番外 / 06 元素陷阱 / 07 工具收口。你现在有了一套“认得出 AI 写 Lynx 时静默踩坑”的审查眼力，外加一个能自动兜运行时红线的扫描器。让 AI 写、你来 review——这就是目标。</div>
