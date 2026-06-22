---
title: "【Swift 从零·第14讲】SwiftUI 进阶：导航与数据流"
date: 2026-06-22
tags:
  - Swift
  - 语言学习
categories:
  - 技术深潜
series: learn-swift
---

> **系列导航** → [课程目录](/courses/learn-swift/) · 上一讲：第13讲·SwiftUI入门 · 下一讲待写

## 引言

上一讲我们用 SwiftUI 搭起了第一个界面，体验了声明式 UI 的简洁。但真实的 App 不只有一个页面，数据也不只存在于一个 View 里——用户点击按钮要跳转到详情页，购物车的数量要在顶栏和列表同时更新，主题色切换要瞬间影响全局所有组件。

这讲我们就解决这些问题：**NavigationStack** 管路由，**ObservableObject + @Published** 管状态，**@EnvironmentObject** 做跨层广播。这三件套是 SwiftUI 应用架构的核心骨架，学会之后你会发现自己能独立搭出一个结构清晰的小 App。

---

## 第1节：NavigationStack 与页面导航

### 1.1 iOS 16+ 的新写法：value + navigationDestination

老写法 `NavigationView` 已被废弃，iOS 16 起推荐 `NavigationStack`。核心变化是把**导航目标的声明**从 `NavigationLink` 里拆出来，集中写在 `.navigationDestination` 修饰符里，让路由逻辑更集中可维护。

```swift
import SwiftUI

// 定义路由目标类型，必须遵循 Hashable
struct ArticleDetail: View {
    let title: String

    var body: some View {
        Text("正在阅读：\(title)")
            .font(.title2)
            .navigationTitle(title)
    }
}

struct ArticleListView: View {
    let articles = ["Swift 基础", "SwiftUI 入门", "Combine 精讲"]

    var body: some View {
        NavigationStack {
            List(articles, id: \.self) { article in
                // value: 传递的路由参数，类型需与 navigationDestination 对应
                NavigationLink(value: article) {
                    Text(article)
                }
            }
            .navigationTitle("文章列表")
            // 集中声明：当路由参数类型为 String 时，显示 ArticleDetail
            .navigationDestination(for: String.self) { article in
                ArticleDetail(title: article)
            }
        }
    }
}
```

### 1.2 编程式导航：NavigationPath

`NavigationStack` 接受一个可选的 `path` 绑定，类型为 `NavigationPath`。通过修改 `path` 可以在代码中推入或弹出页面，适合登录跳转、深链接等场景。

```swift
import SwiftUI

struct ProgrammaticNavDemo: View {
    // NavigationPath 记录当前导航栈的状态
    @State private var path = NavigationPath()

    var body: some View {
        NavigationStack(path: $path) {
            VStack(spacing: 20) {
                Button("直接跳到第三关") {
                    // 连续 append 模拟多层跳转
                    path.append("第一关")
                    path.append("第二关")
                    path.append("第三关")
                }
                Button("回到根页面") {
                    path.removeLast(path.count) // 清空栈
                }
            }
            .navigationTitle("首页")
            .navigationDestination(for: String.self) { level in
                Text("你在：\(level)")
                    .navigationTitle(level)
            }
        }
    }
}
```

---

## 第2节：ObservableObject 与 ViewModel

### 2.1 @Published 自动发信号

`ObservableObject` 是 Combine 协议，凡是遵循它的类，其 `@Published` 属性发生变化时都会自动触发 `objectWillChange` 信号，让订阅的 View 重新渲染。

```swift
import SwiftUI
import Combine

// ViewModel 遵循 ObservableObject
class CounterViewModel: ObservableObject {
    // @Published 让属性变化自动广播给订阅的 View
    @Published var count: Int = 0
    @Published var history: [String] = []

    func increment() {
        count += 1
        history.append("增加 → \(count)")
    }

    func decrement() {
        guard count > 0 else { return }
        count -= 1
        history.append("减少 → \(count)")
    }

    func reset() {
        count = 0
        history.append("重置")
    }
}
```

### 2.2 @StateObject：View 自己创建并拥有 ViewModel

当 ViewModel 的**生命周期应该和 View 绑定**时，用 `@StateObject` 创建它。SwiftUI 保证这个实例在 View 的整个生命周期内只被创建一次，即使 View 因为父层重绘被重新调用 `body` 也不会重建。

```swift
import SwiftUI

struct CounterView: View {
    // @StateObject：此 View 是 ViewModel 的"所有者"
    @StateObject private var vm = CounterViewModel()

    var body: some View {
        VStack(spacing: 16) {
            Text("\(vm.count)")
                .font(.system(size: 64, weight: .bold))

            HStack(spacing: 20) {
                Button("−") { vm.decrement() }
                    .buttonStyle(.bordered)
                Button("+") { vm.increment() }
                    .buttonStyle(.borderedProminent)
                Button("重置") { vm.reset() }
                    .buttonStyle(.bordered)
                    .tint(.red)
            }

            // 显示操作历史
            List(vm.history.reversed(), id: \.self) { record in
                Text(record).font(.caption).foregroundStyle(.secondary)
            }
            .frame(maxHeight: 200)
        }
        .padding()
        .navigationTitle("计数器")
    }
}
```

### 2.3 @ObservedObject：接收外部传入的 ViewModel

当 ViewModel 由父 View 创建，子 View 只是"借用"时，用 `@ObservedObject`。子 View 不拥有这个对象，它的生命周期由外部控制。

```swift
import SwiftUI

// 子 View：接收外部传入的 ViewModel，用 @ObservedObject
struct HistoryView: View {
    @ObservedObject var vm: CounterViewModel // 不拥有，只观察

    var body: some View {
        List(vm.history, id: \.self) { record in
            Text(record)
        }
        .navigationTitle("操作历史（共 \(vm.history.count) 条）")
    }
}

// 父 View：用 @StateObject 创建，再传给子 View
struct ParentView: View {
    @StateObject private var vm = CounterViewModel()

    var body: some View {
        NavigationStack {
            VStack {
                Text("当前计数：\(vm.count)").font(.title)
                Button("增加") { vm.increment() }
                    .buttonStyle(.borderedProminent)

                // 把 vm 传给子 View，子 View 用 @ObservedObject 接收
                NavigationLink("查看历史", value: "history")
            }
            .navigationDestination(for: String.self) { _ in
                HistoryView(vm: vm)
            }
            .padding()
            .navigationTitle("父页面")
        }
    }
}
```

---

## 第3节：@EnvironmentObject 跨层共享状态

### 3.1 为什么需要 EnvironmentObject

当应用层级很深，比如 A → B → C → D，而 D 需要 A 的数据，如果用 `@ObservedObject` 层层传递，中间的 B、C 就成了"搬运工"，代码极其冗余。`@EnvironmentObject` 让你把数据"注入环境"，任何子 View 都可以直接读取，不必层层传递。

```swift
import SwiftUI

// 全局共享的用户状态
class UserSession: ObservableObject {
    @Published var username: String = "游客"
    @Published var isLoggedIn: Bool = false
    @Published var favoriteCount: Int = 0

    func login(as name: String) {
        username = name
        isLoggedIn = true
    }

    func logout() {
        username = "游客"
        isLoggedIn = false
        favoriteCount = 0
    }

    func addFavorite() {
        favoriteCount += 1
    }
}
```

### 3.2 注入与读取

在视图树的根节点用 `.environmentObject(vm)` 注入，子 View 中用 `@EnvironmentObject` 声明即可自动获取，无需构造函数传参。

```swift
import SwiftUI

// 深层子 View：直接从环境读取，无需构造函数参数
struct ProfileBadge: View {
    @EnvironmentObject var session: UserSession // 从环境中读取

    var body: some View {
        HStack {
            Image(systemName: session.isLoggedIn ? "person.fill" : "person")
            Text(session.username)
            if session.isLoggedIn {
                Text("❤️ \(session.favoriteCount)")
            }
        }
        .font(.caption)
        .padding(6)
        .background(.ultraThinMaterial)
        .clipShape(Capsule())
    }
}

// 中层 View：不需要持有 session，但子 View 能读到
struct HomeTab: View {
    var body: some View {
        VStack {
            ProfileBadge() // 直接用，不需要传参
            Text("主页内容区域")
        }
    }
}

// 根 View：注入 session
struct RootView: View {
    @StateObject private var session = UserSession()

    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                HomeTab() // 中层不传参，但深层子 View 能读到

                if session.isLoggedIn {
                    Button("收藏") { session.addFavorite() }
                        .buttonStyle(.bordered)
                    Button("登出") { session.logout() }
                        .buttonStyle(.bordered)
                        .tint(.red)
                } else {
                    Button("登录为 Alice") { session.login(as: "Alice") }
                        .buttonStyle(.borderedProminent)
                }
            }
            .navigationTitle("App 首页")
        }
        // 在视图树根部注入，所有后代 View 都能用 @EnvironmentObject 读取
        .environmentObject(session)
    }
}
```

---

## 第4节：@Environment 读取系统环境值

### 4.1 读取内置系统值

`@Environment` 与 `@EnvironmentObject` 不同：它读取的是 SwiftUI **框架内置**的环境值（颜色方案、语言区域、字体大小等），而非我们自定义注入的对象。

```swift
import SwiftUI

struct ThemeAwareView: View {
    // 读取系统深色/浅色模式
    @Environment(\.colorScheme) var colorScheme
    // 读取当前语言/地区
    @Environment(\.locale) var locale
    // 读取是否开启了粗体文字（无障碍）
    @Environment(\.legibilityWeight) var legibilityWeight

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("当前主题：\(colorScheme == .dark ? "深色" : "浅色")")
            Text("当前语言：\(locale.identifier)")

            // 根据主题动态调整样式
            RoundedRectangle(cornerRadius: 12)
                .fill(colorScheme == .dark ? Color.indigo : Color.cyan)
                .frame(height: 60)
                .overlay(
                    Text("主题感知色块")
                        .foregroundStyle(.white)
                        .fontWeight(legibilityWeight == .bold ? .black : .regular)
                )
        }
        .padding()
    }
}
```

---

## 第5节：Sheet 弹窗与 fullScreenCover

### 5.1 .sheet 和 .fullScreenCover

两者用法完全相同，区别仅在视觉呈现：`sheet` 从底部滑出（可下拉关闭），`fullScreenCover` 覆盖整个屏幕（需要代码触发关闭）。

```swift
import SwiftUI

struct SheetDemo: View {
    @State private var showSheet = false
    @State private var showFullScreen = false
    @State private var selectedColor: Color = .blue

    var body: some View {
        VStack(spacing: 20) {
            // 显示当前选中颜色
            Circle()
                .fill(selectedColor)
                .frame(width: 80, height: 80)

            Button("打开颜色选择器（Sheet）") {
                showSheet = true
            }
            .buttonStyle(.borderedProminent)

            Button("全屏模态（fullScreenCover）") {
                showFullScreen = true
            }
            .buttonStyle(.bordered)
        }
        .navigationTitle("弹窗示例")
        // Sheet：半屏，可下拉关闭
        .sheet(isPresented: $showSheet) {
            ColorPickerSheet(selectedColor: $selectedColor)
                .presentationDetents([.medium, .large]) // iOS 16+ 可设置高度档位
        }
        // fullScreenCover：全屏，必须在内部主动 dismiss
        .fullScreenCover(isPresented: $showFullScreen) {
            FullScreenModal(isPresented: $showFullScreen)
        }
    }
}

struct ColorPickerSheet: View {
    @Binding var selectedColor: Color
    @Environment(\.dismiss) var dismiss // iOS 15+ 推荐的关闭方式

    let colors: [(String, Color)] = [
        ("蓝色", .blue), ("红色", .red), ("绿色", .green),
        ("橙色", .orange), ("紫色", .purple)
    ]

    var body: some View {
        NavigationStack {
            List(colors, id: \.0) { name, color in
                Button {
                    selectedColor = color
                    dismiss() // 选完自动关闭
                } label: {
                    HStack {
                        Circle().fill(color).frame(width: 24, height: 24)
                        Text(name)
                    }
                }
            }
            .navigationTitle("选择颜色")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("取消") { dismiss() }
                }
            }
        }
    }
}

struct FullScreenModal: View {
    @Binding var isPresented: Bool

    var body: some View {
        ZStack {
            Color.indigo.ignoresSafeArea()
            VStack(spacing: 24) {
                Text("全屏模态").font(.largeTitle).foregroundStyle(.white)
                Text("无法下拉关闭，必须点按钮").foregroundStyle(.white.opacity(0.8))
                Button("关闭") {
                    isPresented = false
                }
                .buttonStyle(.bordered)
                .tint(.white)
            }
        }
    }
}
```

---

## 小结

本讲覆盖了 SwiftUI 应用开发的核心数据流架构，关键要点如下：

1. **NavigationStack + navigationDestination**：iOS 16+ 推荐写法，把路由声明集中管理，支持编程式导航（`NavigationPath`）
2. **@StateObject**：View 自己创建并拥有 ViewModel，生命周期与 View 绑定，同一 View 重绘时不会重建实例
3. **@ObservedObject**：接收外部传入的 ViewModel，只观察不拥有，适合父传子场景
4. **@EnvironmentObject**：跨层注入共享状态，根节点 `.environmentObject(vm)` 注入，任意后代 `@EnvironmentObject` 读取，避免层层传参
5. **Sheet / fullScreenCover**：两种模态弹窗，用 `@Environment(\.dismiss)` 在内部关闭，iOS 16+ Sheet 支持 `presentationDetents` 设置高度

---

> **下一讲**：第15讲·实战项目
