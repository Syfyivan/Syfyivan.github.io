---
title: "Swift 从零路线"
date: 2026-06-22 12:00:00
description: "零基础学 Swift：从 let/var 到 async/await 和 SwiftUI，16 讲覆盖现代 Swift 全貌。"
---

<style>
.sw-page{--ink:#1d2127;--text:#2a2f36;--muted:#69727d;--line:rgba(29,33,39,.12);--panel:#fff;--wash:#f4f5f3;--sw:#F05138;--sw-dim:rgba(240,81,56,.08);color:var(--text)}
.sw-page *{box-sizing:border-box;min-width:0}
.sw-hero{padding:32px;border:1px solid var(--line);border-radius:6px;background:linear-gradient(135deg,rgba(240,81,56,.08),rgba(200,40,20,.06)),var(--panel)}
.sw-kicker{display:inline-flex;align-items:center;margin-bottom:14px;padding:6px 10px;border:1px solid rgba(240,81,56,.3);border-radius:999px;color:var(--sw);background:var(--sw-dim);font-size:13px;font-weight:760}
.sw-hero h2{margin:0 0 14px;color:var(--ink);font-size:30px;line-height:1.25}
.sw-hero p{margin:0;color:var(--muted);line-height:1.8}
.sw-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:20px 0 6px}
.sw-stat{padding:14px;border:1px solid var(--line);border-radius:4px;background:rgba(255,255,255,.7)}
.sw-stat strong{display:block;color:var(--ink);font-size:22px;line-height:1.1}
.sw-stat span{color:var(--muted);font-size:13px}
.sw-legend{display:flex;flex-wrap:wrap;gap:14px;margin:22px 0 6px;padding:14px 18px;border:1px solid var(--line);border-radius:6px;background:var(--wash)}
.sw-legend span{font-size:13px;color:#3a4049}
.sw-b{display:inline-block;font-size:12px;font-weight:700;padding:1px 8px;border-radius:999px;line-height:1.7;white-space:nowrap}
.sw-core{color:#fff;background:var(--sw)}
.sw-key{color:var(--sw);background:rgba(240,81,56,.1);border:1px solid rgba(240,81,56,.3)}
.sw-ui{color:#5856D6;background:rgba(88,86,214,.1);border:1px solid rgba(88,86,214,.25)}
.sw-lab{color:#2f765f;background:rgba(47,118,95,.1);border:1px solid rgba(47,118,95,.25)}
.sw-list{display:grid;gap:10px;margin-top:22px}
.sw-row{display:grid;grid-template-columns:46px 1fr auto;gap:14px;align-items:center;padding:14px 16px;border:1px solid var(--line);border-radius:5px;background:var(--panel);text-decoration:none!important;color:var(--text)}
.sw-row:hover{border-color:rgba(240,81,56,.4);transform:translateY(-1px);box-shadow:0 6px 18px rgba(22,32,42,.07)}
.sw-row.is-todo{opacity:.62;background:var(--wash)}
.sw-num{font-size:20px;font-weight:800;color:var(--sw);text-align:center}
.sw-row.is-todo .sw-num{color:var(--muted)}
.sw-rt h4{margin:0 0 3px;color:var(--ink);font-size:16px}
.sw-rt p{margin:0;color:var(--muted);font-size:13px;line-height:1.6}
.sw-tag{font-size:12px;font-weight:700;color:var(--muted);white-space:nowrap}
.sw-group{margin:28px 0 8px;padding:8px 0;color:var(--ink);font-size:15px;font-weight:800;border-bottom:1px dashed var(--line)}
@media(max-width:575px){.sw-stats{grid-template-columns:repeat(2,1fr)}.sw-row{grid-template-columns:38px 1fr}.sw-tag{display:none}}
</style>

<div class="sw-page"><section class="sw-hero"><span class="sw-kicker">Swift 从零路线 · 16 讲</span><h2>零基础学现代 Swift</h2><p>不预设任何编程背景，从 <code>let</code>/<code>var</code> 开始，一路走到 <strong>Optional / Protocol / async-await / SwiftUI</strong>。每讲对准一个 Swift 独有的核心设计，配 Playground 可运行代码，最后一讲写完整 App。</p><div class="sw-stats"><div class="sw-stat"><strong>16</strong><span>总讲数</span></div><div class="sw-stat"><strong>16 / 16</strong><span>已完成</span></div><div class="sw-stat"><strong>Swift 6</strong><span>目标版本</span></div><div class="sw-stat"><strong>零基础</strong><span>起点要求</span></div></div></section><div class="sw-legend"><span><span class="sw-b sw-core">核心</span> Swift 独有，必须搞懂</span><span><span class="sw-b sw-key">重点</span> 日常必用</span><span><span class="sw-b sw-ui">SwiftUI</span> UI框架</span><span><span class="sw-b sw-lab">实战</span> 写完整项目</span></div>

<div class="sw-group">第一章 · 语言基础（00–05）</div>
<div class="sw-list"><a class="sw-row" href="/2026/06/22/learn-swift-00-getting-started/"><span class="sw-num">00</span><div class="sw-rt"><h4>起步：环境搭建与 Swift 的设计理念</h4><p>Xcode Playground 配置 / let vs var / 类型推断 / print / 命名规范</p></div><span class="sw-tag">已完成 ✔</span></a><a class="sw-row" href="/2026/06/22/learn-swift-01-basic-types/"><span class="sw-num">01</span><div class="sw-rt"><h4>基础类型：数字、字符串与元组</h4><p>Int / Double / 类型转换 / String 插值 / 多行字符串 / 元组解构</p></div><span class="sw-tag">已完成 ✔</span></a><a class="sw-row" href="/2026/06/22/learn-swift-02-optional/"><span class="sw-num">02</span><div class="sw-rt"><h4>Optional：Swift 最重要的设计</h4><p>为什么 nil 要显式 / if let / guard let / 可选链 / ??  / 强解包的危险</p></div><span class="sw-tag">已完成 ✔</span></a><a class="sw-row" href="/2026/06/22/learn-swift-03-collections/"><span class="sw-num">03</span><div class="sw-rt"><h4>集合类型：Array、Dictionary、Set 与高阶函数</h4><p>字面量语法 / map / filter / reduce / compactMap / 懒求值</p></div><span class="sw-tag">已完成 ✔</span></a><a class="sw-row" href="/2026/06/22/learn-swift-04-control-flow/"><span class="sw-num">04</span><div class="sw-rt"><h4>控制流：if、switch 模式匹配与 for-in</h4><p>switch 穷举 / 值绑定 / where 子句 / for-in 范围 / stride / labeled break</p></div><span class="sw-tag">已完成 ✔</span></a><a class="sw-row" href="/2026/06/22/learn-swift-05-functions-closures/"><span class="sw-num">05</span><div class="sw-rt"><h4>函数与闭包：参数标签与尾随闭包</h4><p>外部参数标签 / 默认值 / 可变参数 / 尾随闭包 / 捕获列表 / @escaping</p></div><span class="sw-tag">已完成 ✔</span></a></div>

<div class="sw-group">第二章 · 类型系统（06–10）</div>
<div class="sw-list"><a class="sw-row" href="/2026/06/22/learn-swift-06-struct-class/"><span class="sw-num">06</span><div class="sw-rt"><h4>struct vs class：值类型与引用类型</h4><p>内存模型区别 / mutating 方法 / copy-on-write / 何时用 class</p></div><span class="sw-tag">已完成 ✔</span></a><a class="sw-row" href="/2026/06/22/learn-swift-07-enum/"><span class="sw-num">07</span><div class="sw-rt"><h4>enum：Swift 枚举远不止枚举</h4><p>关联值 / rawValue / 递归枚举 / switch 模式匹配 / 状态机建模</p></div><span class="sw-tag">已完成 ✔</span></a><a class="sw-row" href="/2026/06/22/learn-swift-08-protocol/"><span class="sw-num">08</span><div class="sw-rt"><h4>Protocol：面向协议编程（POP）</h4><p>协议定义与实现 / 协议扩展 / Equatable / Comparable / Codable</p></div><span class="sw-tag">已完成 ✔</span></a><a class="sw-row" href="/2026/06/22/learn-swift-09-generics/"><span class="sw-num">09</span><div class="sw-rt"><h4>泛型：让代码对类型无感</h4><p>泛型函数 / 关联类型 / where 约束 / some 关键字 / 不透明类型</p></div><span class="sw-tag">已完成 ✔</span></a><a class="sw-row" href="/2026/06/22/learn-swift-10-error-handling/"><span class="sw-num">10</span><div class="sw-rt"><h4>错误处理：throws / try / Result</h4><p>throw / catch / try? / try! / Result 类型 / 自定义 Error</p></div><span class="sw-tag">已完成 ✔</span></a></div>

<div class="sw-group">第三章 · 现代 Swift（11–12）</div>
<div class="sw-list"><a class="sw-row" href="/2026/06/22/learn-swift-11-concurrency/"><span class="sw-num">11</span><div class="sw-rt"><h4>并发：async/await 与 Actor</h4><p>async 函数 / await / Task / async let / actor 数据隔离 / MainActor</p></div><span class="sw-tag">已完成 ✔</span></a><a class="sw-row" href="/2026/06/22/learn-swift-12-memory-arc/"><span class="sw-num">12</span><div class="sw-rt"><h4>内存管理：ARC 与引用语义</h4><p>ARC 计数原理 / strong / weak / unowned / 循环引用检测 / Instruments</p></div><span class="sw-tag">已完成 ✔</span></a></div>

<div class="sw-group">第四章 · SwiftUI 与实战（13–15）</div>
<div class="sw-list"><a class="sw-row" href="/2026/06/22/learn-swift-13-swiftui-intro/"><span class="sw-num">13</span><div class="sw-rt"><h4>SwiftUI 入门：声明式 UI 的心智模型</h4><p>View 协议 / @State / @Binding / VStack/HStack/ZStack / List / 修饰符链</p></div><span class="sw-tag">已完成 ✔</span></a><a class="sw-row" href="/2026/06/22/learn-swift-14-swiftui-advanced/"><span class="sw-num">14</span><div class="sw-rt"><h4>SwiftUI 进阶：导航与数据流</h4><p>NavigationStack / @StateObject / @EnvironmentObject / @ObservableObject</p></div><span class="sw-tag">已完成 ✔</span></a><a class="sw-row" href="/2026/06/22/learn-swift-15-full-app/"><span class="sw-num">15</span><div class="sw-rt"><h4>实战：从零写一个完整 SwiftUI App</h4><p>把 00–14 所有概念串起来：数据层 + 网络层 + UI层 + 打包运行</p></div><span class="sw-tag">已完成 ✔</span></a></div>

</div>

> 本系列配 Xcode Playground 代码，每讲都能在 Mac 上直接跑起来。
