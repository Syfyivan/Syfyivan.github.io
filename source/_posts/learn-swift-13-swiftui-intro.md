---
title: "【Swift 从零·第13讲】SwiftUI 入门：声明式 UI 的心智模型"
date: 2026-06-22
tags:
  - Swift
  - 语言学习
categories:
  - 技术深潜
series: learn-swift
---

> **系列导航** → [课程目录](/courses/learn-swift/) · 上一讲：第12讲·内存管理 · 下一讲待写

在学了十二讲纯语言语法之后，终于到了最让人兴奋的部分——用 Swift 真正写出一个界面。SwiftUI 是苹果在 2019 年推出的 UI 框架，它颠覆了此前 UIKit 那套"命令式"写法，带来了一种全新的**声明式**编程范式。理解 SwiftUI 的思维方式，不只是学会几个 API 那么简单，更是在重塑你对"UI 是什么"的认知。

简单说：**UIKit 让你告诉系统「怎么做」，SwiftUI 让你告诉系统「要什么」**。你描述界面在某个状态下应该长什么样，SwiftUI 负责把它渲染出来，状态变了它自动重新渲染。这个公式只有一行：`UI = f(state)`。

---

## 第1节：声明式思维——UI = f(state)

### 1.1 命令式 vs 声明式

命令式（UIKit 风格）的思路是：先创建一个按钮对象，再把它加到视图上，再设置它的颜色，再监听点击事件，再在事件里修改 label 的 text 属性……每一步都是「操作」。

声明式（SwiftUI 风格）的思路是：**状态是什么，界面就长什么样**。你只需要描述"当 `count` 等于 3 的时候，屏幕上应该显示数字 3"。至于怎么从 2 变到 3，SwiftUI 自己搞定。

```swift
import SwiftUI
import PlaygroundSupport

// 声明式：描述「界面应该是什么」
struct CounterView: View {
    @State private var count = 0

    var body: some View {
        VStack(spacing: 20) {
            Text("当前计数：\(count)")
                .font(.largeTitle)
                .fontWeight(.bold)

            HStack(spacing: 16) {
                Button("−") { count -= 1 }
                    .font(.title)
                    .padding(.horizontal, 20)
                    .padding(.vertical, 10)
                    .background(Color.red.opacity(0.8))
                    .foregroundColor(.white)
                    .cornerRadius(8)

                Button("+") { count += 1 }
                    .font(.title)
                    .padding(.horizontal, 20)
                    .padding(.vertical, 10)
                    .background(Color.blue.opacity(0.8))
                    .foregroundColor(.white)
                    .cornerRadius(8)
            }
        }
        .padding(40)
    }
}

// Playground 预览
PlaygroundPage.current.setLiveView(CounterView())
```

### 1.2 状态驱动重算

SwiftUI 的核心机制是：**每次状态改变，`body` 就重新计算一次**。`body` 是一个计算属性，它的返回值描述了当前状态下的视图树。SwiftUI 会对比前后两棵视图树的差异，只更新真正变化的部分（类似 React 的 Virtual DOM diff）。

这意味着你永远不需要手动调用 `view.setNeedsDisplay()` 或者 `label.text = "..."` ——你只需要改状态，视图自动跟上。

---

## 第2节：View 协议与 body 属性

### 2.1 View 协议

在 SwiftUI 里，所有界面元素都遵循 `View` 协议。这个协议只有一个要求：

```swift
protocol View {
    associatedtype Body: View
    var body: Body { get }
}
```

实现 `body` 计算属性，你就得到了一个 View。返回类型用 `some View`（不透明类型，第11讲讲过），让编译器自动推断具体类型，你不需要手动写出嵌套的泛型。

### 2.2 组合是核心哲学

SwiftUI 的视图是**可无限组合**的。你可以把一个 `CounterView` 嵌进另一个视图里，就像积木一样搭建。每个自定义 View 结构体就是一块积木，`body` 描述它由哪些更小的积木拼成。

```swift
import SwiftUI
import PlaygroundSupport

// 可复用的展示组件
struct StatCard: View {
    let title: String
    let value: String
    let color: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title)
                .font(.caption)
                .foregroundColor(.gray)
            Text(value)
                .font(.title2)
                .fontWeight(.semibold)
                .foregroundColor(color)
        }
        .padding()
        .background(Color(UIColor.secondarySystemBackground))
        .cornerRadius(12)
    }
}

struct DashboardView: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("今日概览")
                .font(.headline)
                .padding(.horizontal)

            HStack(spacing: 12) {
                StatCard(title: "完成任务", value: "8", color: .green)
                StatCard(title: "未完成", value: "3", color: .orange)
                StatCard(title: "已逾期", value: "1", color: .red)
            }
            .padding(.horizontal)
        }
        .padding(.vertical)
    }
}

PlaygroundPage.current.setLiveView(DashboardView())
```

---

## 第3节：@State 与 @Binding——状态的所有权

### 3.1 @State：本地状态的唯一真相

`@State` 是最基础的状态管理方式，用于 View 内部的私有状态。加了 `@State` 的属性，SwiftUI 会在幕后替你管理存储，修改它会触发 `body` 重新计算。

规则很简单：**谁拥有状态，谁用 `@State`**。

```swift
import SwiftUI
import PlaygroundSupport

struct ToggleDemo: View {
    @State private var isEnabled = false
    @State private var sliderValue = 0.5

    var body: some View {
        VStack(spacing: 24) {
            Toggle("开启通知", isOn: $isEnabled)
                .padding(.horizontal)

            if isEnabled {
                Text("通知已开启 ✓")
                    .foregroundColor(.green)
                    .transition(.opacity)
            }

            VStack(alignment: .leading) {
                Text("亮度：\(Int(sliderValue * 100))%")
                    .font(.caption)
                Slider(value: $sliderValue)
            }
            .padding(.horizontal)
        }
        .padding()
        .animation(.easeInOut, value: isEnabled)
    }
}

PlaygroundPage.current.setLiveView(ToggleDemo())
```

### 3.2 @Binding：向下共享可写状态

父 View 拥有状态（`@State`），但子 View 也需要读写它时，就用 `@Binding`。`@Binding` 不拥有数据，只是一个指向父级状态的**双向引用**。

传递时在变量名前加 `$` 符号，表示"传递的是这个状态的绑定，不是它的值"。

```swift
import SwiftUI
import PlaygroundSupport

// 子 View：接收 Binding，不拥有状态
struct CounterControl: View {
    @Binding var count: Int
    let label: String

    var body: some View {
        HStack {
            Text(label)
                .frame(width: 80, alignment: .leading)
            Spacer()
            Button("−") { count -= 1 }
                .disabled(count <= 0)
            Text("\(count)")
                .frame(width: 40)
                .monospacedDigit()
            Button("+") { count += 1 }
        }
        .padding(.horizontal)
    }
}

// 父 View：拥有状态
struct OrderView: View {
    @State private var appleCount = 0
    @State private var orangeCount = 0

    var total: Int { appleCount + orangeCount }

    var body: some View {
        VStack(spacing: 16) {
            Text("点餐")
                .font(.title2).fontWeight(.bold)

            CounterControl(count: $appleCount, label: "苹果")
            CounterControl(count: $orangeCount, label: "橙子")

            Divider()

            Text("合计：\(total) 件")
                .font(.headline)
                .foregroundColor(total > 0 ? .blue : .gray)
        }
        .padding()
    }
}

PlaygroundPage.current.setLiveView(OrderView())
```

---

## 第4节：布局三剑客——VStack / HStack / ZStack

### 4.1 三种堆叠方向

SwiftUI 的布局核心就三个容器：

- **VStack**：垂直堆叠（vertical），从上到下
- **HStack**：水平堆叠（horizontal），从左到右
- **ZStack**：深度堆叠（z-axis），从后到前叠放

它们都支持 `spacing`（间距）和 `alignment`（对齐）参数。

```swift
import SwiftUI
import PlaygroundSupport

struct LayoutDemo: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 20) {

            // HStack：水平排列头像和文字
            HStack(spacing: 12) {
                ZStack {
                    Circle()
                        .fill(Color.blue.opacity(0.2))
                        .frame(width: 48, height: 48)
                    Text("李")
                        .font(.title3)
                        .fontWeight(.bold)
                        .foregroundColor(.blue)
                }

                VStack(alignment: .leading, spacing: 2) {
                    Text("李明")
                        .font(.headline)
                    Text("iOS 开发工程师")
                        .font(.caption)
                        .foregroundColor(.gray)
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .foregroundColor(.gray)
            }
            .padding()
            .background(Color(UIColor.secondarySystemBackground))
            .cornerRadius(12)

            // ZStack：图片上叠加文字
            ZStack(alignment: .bottomLeading) {
                RoundedRectangle(cornerRadius: 12)
                    .fill(LinearGradient(
                        colors: [.blue, .purple],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ))
                    .frame(height: 120)

                VStack(alignment: .leading, spacing: 4) {
                    Text("SwiftUI 入门课")
                        .font(.title3)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                    Text("第13讲 · 声明式 UI")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.8))
                }
                .padding()
            }
        }
        .padding()
    }
}

PlaygroundPage.current.setLiveView(LayoutDemo())
```

### 4.2 修饰符顺序很重要

SwiftUI 的修饰符（modifier）是**链式调用**，每个修饰符都会包裹前一个，形成新的 View。**顺序不同，结果不同**。

```swift
import SwiftUI
import PlaygroundSupport

struct ModifierOrderDemo: View {
    var body: some View {
        VStack(spacing: 20) {
            // 先 padding 再 background：背景包住了 padding
            Text("先 padding 后 background")
                .padding()
                .background(Color.yellow)

            // 先 background 再 padding：背景只在文字范围，padding 在外面
            Text("先 background 后 padding")
                .background(Color.yellow)
                .padding()

            // 先设字体大小，再设颜色（顺序通常无所谓）
            Text("字体修饰符")
                .font(.title2)
                .fontWeight(.semibold)
                .foregroundColor(.purple)
                .padding()
                .background(Color.purple.opacity(0.1))
                .cornerRadius(8)
        }
        .padding()
    }
}

PlaygroundPage.current.setLiveView(ModifierOrderDemo())
```

---

## 第5节：List 与常用控件——Todo 实战

### 5.1 List + ForEach 展示数组

`List` 是 SwiftUI 展示列表数据的标准组件，`ForEach` 负责遍历数组生成视图。注意 `ForEach` 需要数据遵循 `Identifiable` 协议（或者手动指定 `id` 参数），这样 SwiftUI 才能追踪每个元素的唯一性。

### 5.2 TextField 接收文本输入

`TextField` 需要一个 `@Binding<String>` 来双向绑定输入内容。

### 5.3 完整 Todo List 示例

```swift
import SwiftUI
import PlaygroundSupport

struct TodoItem: Identifiable {
    let id = UUID()
    var title: String
    var isDone: Bool = false
}

struct TodoListView: View {
    @State private var items: [TodoItem] = [
        TodoItem(title: "学习 SwiftUI 基础"),
        TodoItem(title: "完成计数器练习"),
        TodoItem(title: "阅读官方文档"),
    ]
    @State private var newItemTitle = ""

    var pendingCount: Int {
        items.filter { !$0.isDone }.count
    }

    var body: some View {
        VStack(spacing: 0) {
            // 标题栏
            HStack {
                VStack(alignment: .leading) {
                    Text("待办清单")
                        .font(.title2).fontWeight(.bold)
                    Text("还有 \(pendingCount) 项未完成")
                        .font(.caption)
                        .foregroundColor(.gray)
                }
                Spacer()
            }
            .padding()

            // 输入框
            HStack(spacing: 8) {
                TextField("添加新任务...", text: $newItemTitle)
                    .textFieldStyle(.roundedBorder)

                Button("添加") {
                    let trimmed = newItemTitle.trimmingCharacters(in: .whitespaces)
                    guard !trimmed.isEmpty else { return }
                    items.append(TodoItem(title: trimmed))
                    newItemTitle = ""
                }
                .disabled(newItemTitle.trimmingCharacters(in: .whitespaces).isEmpty)
            }
            .padding(.horizontal)
            .padding(.bottom, 8)

            // 列表
            List {
                ForEach($items) { $item in
                    HStack(spacing: 12) {
                        Button {
                            item.isDone.toggle()
                        } label: {
                            Image(systemName: item.isDone ? "checkmark.circle.fill" : "circle")
                                .foregroundColor(item.isDone ? .green : .gray)
                                .font(.title3)
                        }
                        .buttonStyle(.plain)

                        Text(item.title)
                            .strikethrough(item.isDone, color: .gray)
                            .foregroundColor(item.isDone ? .gray : .primary)

                        Spacer()
                    }
                    .padding(.vertical, 4)
                }
                .onDelete { indexSet in
                    items.remove(atOffsets: indexSet)
                }
            }
            .listStyle(.plain)
        }
        .frame(width: 360, height: 500)
    }
}

PlaygroundPage.current.setLiveView(TodoListView())
```

这个完整示例覆盖了：`@State` 管理数组、`ForEach` 遍历数据、`TextField` 输入、`List` 展示、`.onDelete` 删除，以及状态驱动的计算属性 `pendingCount`。

---

## 小结

本讲覆盖了 SwiftUI 最核心的心智模型，记住这几个要点：

1. **UI = f(state)**：SwiftUI 的一切出发点。状态是数据源，视图是状态的函数，状态变则视图自动更新，永远不需要手动操作 UI。
2. **View 协议 + body**：每个界面元素都是遵循 `View` 协议的结构体，`body` 计算属性描述当前状态下的视图内容，返回 `some View`。
3. **@State 拥有，@Binding 引用**：父 View 用 `@State` 持有状态，传给子 View 时用 `$` 创建 `@Binding`，实现双向共享，保持数据单向流动。
4. **VStack / HStack / ZStack 组合布局**：三种堆叠方式覆盖绝大多数布局需求，配合 `Spacer()` 和 `.frame()` 精细控制位置和尺寸。
5. **修饰符顺序影响结果**：`.padding()` 在 `.background()` 前后位置不同，视觉结果截然不同，每个修饰符都在包裹前一层创建新 View。

---

> **下一讲**：第14讲·SwiftUI 进阶——`@ObservableObject`、`@EnvironmentObject`、导航与页面跳转、动画与手势
