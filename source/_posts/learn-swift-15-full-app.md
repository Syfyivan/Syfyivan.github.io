---
title: "【Swift 从零·第15讲】实战：从零写一个完整 SwiftUI App"
date: 2026-06-22
tags:
  - Swift
  - 语言学习
categories:
  - 技术深潜
series: learn-swift
---

> **系列导航** → [课程目录](/courses/learn-swift/) · 上一讲：第14讲·SwiftUI进阶

## 引言

前14讲打下的理论地基——可选链、泛型、协议、`@State`/`@Binding`——终于到了"盖房子"的时刻。写一个能跑起来、有实际价值的 App，是把零散知识连成系统的最短路径。

本讲的目标是一个**书单 App（BookShelf）**：可以记录读过的书、标记阅读状态、本地持久化——关掉 App 再打开数据不丢。整个 App 按 **Model / ViewModel / View** 三层架构组织，你将看到每一层如何分工、如何连接，最终拼成一个可以真正使用的产品。

---

## 第1节：数据模型（Model 层）

### 1.1 Book struct

模型层只做一件事：描述数据的形状。`Book` 用 `struct` 而非 `class`——值类型天然线程安全，也更符合 SwiftUI 的数据流哲学。

```swift
import Foundation

// Model
struct Book: Identifiable, Codable, Equatable {
    var id: UUID = UUID()
    var title: String
    var author: String
    var addedDate: Date
    var isRead: Bool = false
}
```

- `Identifiable`：让 SwiftUI 的 `List` 知道如何区分每一行，要求有 `id` 属性
- `Codable`：合并了 `Encodable + Decodable`，让 `JSONEncoder/JSONDecoder` 直接处理
- `Equatable`：支持 `==` 比较，方便后续过滤和测试

### 1.2 验证模型可序列化

在 Playground 里单独验证模型，确保序列化没问题，后续 ViewModel 才能放心调用。

```swift
import Foundation

struct Book: Identifiable, Codable, Equatable {
    var id: UUID = UUID()
    var title: String
    var author: String
    var addedDate: Date
    var isRead: Bool = false
}

// 快速冒烟测试
let book = Book(title: "Swift Programming Language", author: "Apple", addedDate: Date())
let encoder = JSONEncoder()
encoder.dateEncodingStrategy = .iso8601

if let data = try? encoder.encode(book),
   let json = String(data: data, encoding: .utf8) {
    print("序列化成功：")
    print(json)
}

// 反序列化
let decoder = JSONDecoder()
decoder.dateDecodingStrategy = .iso8601
if let data = try? encoder.encode(book),
   let decoded = try? decoder.decode(Book.self, from: data) {
    print("反序列化成功：\(decoded.title) by \(decoded.author)")
}
```

运行后你会看到 JSON 字符串，以及成功还原的书名。这一步看似简单，但能提前发现类型不支持 Codable 等问题。

---

## 第2节：ViewModel 层

### 2.1 BookViewModel 基本结构

ViewModel 是"大脑"：持有数据、暴露操作、负责持久化。`@Published` 让 SwiftUI 视图在数据变化时自动刷新。

```swift
import Foundation
import Combine

class BookViewModel: ObservableObject {
    @Published var books: [Book] = []

    private let storageKey = "bookshelf_books"
    private let encoder = JSONEncoder()
    private let decoder = JSONDecoder()

    init() {
        encoder.dateEncodingStrategy = .iso8601
        decoder.dateDecodingStrategy = .iso8601
        load()
    }

    // MARK: - CRUD

    func add(title: String, author: String, date: Date) {
        let book = Book(title: title, author: author, addedDate: date)
        books.append(book)
        save()
    }

    func delete(at offsets: IndexSet) {
        books.remove(atOffsets: offsets)
        save()
    }

    func toggleRead(_ book: Book) {
        guard let index = books.firstIndex(where: { $0.id == book.id }) else { return }
        books[index].isRead.toggle()
        save()
    }

    // MARK: - 持久化

    private func save() {
        if let data = try? encoder.encode(books) {
            UserDefaults.standard.set(data, forKey: storageKey)
        }
    }

    private func load() {
        guard let data = UserDefaults.standard.data(forKey: storageKey),
              let saved = try? decoder.decode([Book].self, from: data) else { return }
        books = saved
    }
}
```

### 2.2 持久化方案说明

这里选用 `UserDefaults` 存储 JSON，原因是：

| 方案 | 适合场景 | 本讲选用 |
|------|----------|----------|
| UserDefaults | 轻量数据、数组/字典 | ✅ 书单条目 |
| FileManager | 大文件、图片 | — |
| CoreData / SwiftData | 复杂关系、大量数据 | — |

`UserDefaults.standard.set(data, forKey:)` 存的是 `Data`（二进制），读取时用 `.data(forKey:)` 取回再反序列化。关闭 App 后数据写入磁盘，下次启动 `init()` 里的 `load()` 自动恢复。

---

## 第3节：视图层——列表页与搜索

### 3.1 ContentView（列表页）

列表页是 App 的"主屏"：展示所有书、支持搜索过滤、支持左滑删除。

```swift
import SwiftUI

struct ContentView: View {
    @StateObject private var vm = BookViewModel()
    @State private var searchText = ""
    @State private var showingAddSheet = false

    var filteredBooks: [Book] {
        if searchText.isEmpty {
            return vm.books
        }
        return vm.books.filter {
            $0.title.localizedCaseInsensitiveContains(searchText) ||
            $0.author.localizedCaseInsensitiveContains(searchText)
        }
    }

    var body: some View {
        NavigationStack {
            List {
                ForEach(filteredBooks) { book in
                    NavigationLink(destination: BookDetailView(book: book, vm: vm)) {
                        BookRowView(book: book)
                    }
                    .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                        Button(role: .destructive) {
                            if let index = vm.books.firstIndex(where: { $0.id == book.id }) {
                                vm.delete(at: IndexSet(integer: index))
                            }
                        } label: {
                            Label("删除", systemImage: "trash")
                        }
                    }
                }
            }
            .searchable(text: $searchText, prompt: "搜索书名或作者")
            .navigationTitle("我的书单")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        showingAddSheet = true
                    } label: {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $showingAddSheet) {
                AddBookView(vm: vm)
            }
        }
    }
}
```

**要点解析：**
- `@StateObject` 在视图生命周期内只创建一次 ViewModel，避免重建
- `.searchable` 是 SwiftUI 内置修饰符，自动在导航栏添加搜索框
- `filteredBooks` 是计算属性，`searchText` 变化时自动重算，视图自动刷新
- `.swipeActions` 直接绑定到 `ForEach` 的每一行

### 3.2 BookRowView（行视图）

把行抽成独立 View，保持 `ContentView` 整洁，也方便复用。

```swift
import SwiftUI

struct BookRowView: View {
    let book: Book

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(book.title)
                    .font(.headline)
                Text(book.author)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            Spacer()
            if book.isRead {
                Image(systemName: "checkmark.circle.fill")
                    .foregroundColor(.green)
            } else {
                Image(systemName: "circle")
                    .foregroundColor(.gray)
            }
        }
        .padding(.vertical, 4)
    }
}
```

---

## 第4节：添加页与详情页

### 4.1 AddBookView（添加页）

用 `Form` 组织输入控件，`@Environment(\.dismiss)` 在保存后关闭 Sheet。

```swift
import SwiftUI

struct AddBookView: View {
    @ObservedObject var vm: BookViewModel
    @Environment(\.dismiss) private var dismiss

    @State private var title = ""
    @State private var author = ""
    @State private var date = Date()

    var isFormValid: Bool {
        !title.trimmingCharacters(in: .whitespaces).isEmpty &&
        !author.trimmingCharacters(in: .whitespaces).isEmpty
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("书籍信息") {
                    TextField("书名", text: $title)
                    TextField("作者", text: $author)
                }
                Section("记录日期") {
                    DatePicker("添加日期",
                               selection: $date,
                               displayedComponents: .date)
                }
            }
            .navigationTitle("添加书籍")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("取消") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("保存") {
                        vm.add(title: title, author: author, date: date)
                        dismiss()
                    }
                    .disabled(!isFormValid)
                }
            }
        }
    }
}
```

`isFormValid` 计算属性确保书名和作者不为空才能点"保存"，避免垃圾数据进入列表。

### 4.2 BookDetailView（详情页）

详情页展示完整信息，并提供阅读状态切换。

```swift
import SwiftUI

struct BookDetailView: View {
    let book: Book
    @ObservedObject var vm: BookViewModel

    // 从 vm.books 实时读取最新状态
    var currentBook: Book {
        vm.books.first(where: { $0.id == book.id }) ?? book
    }

    var body: some View {
        Form {
            Section("基本信息") {
                LabeledContent("书名", value: currentBook.title)
                LabeledContent("作者", value: currentBook.author)
                LabeledContent("添加日期") {
                    Text(currentBook.addedDate, style: .date)
                }
            }
            Section("阅读状态") {
                HStack {
                    Text(currentBook.isRead ? "已读完" : "未读完")
                        .foregroundColor(currentBook.isRead ? .green : .secondary)
                    Spacer()
                    Image(systemName: currentBook.isRead
                          ? "checkmark.circle.fill"
                          : "circle")
                        .foregroundColor(currentBook.isRead ? .green : .gray)
                        .font(.title2)
                }
                .contentShape(Rectangle())
                .onTapGesture {
                    vm.toggleRead(currentBook)
                }
            }
        }
        .navigationTitle(currentBook.title)
        .navigationBarTitleDisplayMode(.inline)
    }
}
```

**关键设计：** `currentBook` 不直接用传进来的 `book`，而是从 `vm.books` 里实时查找。这样当用户切换阅读状态后，详情页会立刻反映最新数据，而不需要额外的 `@Binding` 传递。

---

## 第5节：架构连接与完整入口

### 5.1 三层架构关系图

```
┌──────────────────────────────────────────────────────┐
│  View 层                                             │
│  ContentView → BookRowView                           │
│             → AddBookView                            │
│             → BookDetailView                         │
└──────────────────┬───────────────────────────────────┘
                   │ @StateObject / @ObservedObject
┌──────────────────▼───────────────────────────────────┐
│  ViewModel 层                                        │
│  BookViewModel                                       │
│   @Published books: [Book]                           │
│   add / delete / toggleRead / save / load            │
└──────────────────┬───────────────────────────────────┘
                   │ encode / decode
┌──────────────────▼───────────────────────────────────┐
│  Model 层                                            │
│  Book: Identifiable, Codable, Equatable              │
└──────────────────────────────────────────────────────┘
```

### 5.2 App 入口（BookShelfApp.swift）

在真实 Xcode 项目中，App 入口如下：

```swift
import SwiftUI

@main
struct BookShelfApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
```

`@main` 标记程序入口，`WindowGroup` 在 iOS 上对应一个全屏窗口，`ContentView()` 就是我们的列表页。整个 App 的 ViewModel 由 `ContentView` 里的 `@StateObject` 创建并向下传递，子视图通过 `@ObservedObject` 引用同一个实例。

### 5.3 数据流总结

```
用户操作（点击/输入）
       ↓
View 调用 vm.add / vm.delete / vm.toggleRead
       ↓
ViewModel 修改 @Published books
       ↓
SwiftUI 自动重建依赖此数据的视图
       ↓
同时 save() 写入 UserDefaults（持久化）
```

整个流程是**单向的**：数据从 ViewModel 流向 View，View 通过调用方法（而不是直接修改数据）来触发状态变更。这正是 SwiftUI 推荐的架构方式。

---

## 小结

本讲核心要点：

1. **Model 层**用 `struct + Codable + Identifiable` 定义数据形状，做到零依赖、可测试
2. **ViewModel 层**用 `@Published` + `ObservableObject` 持有状态，`UserDefaults + JSONEncoder/Decoder` 实现轻量持久化
3. **View 层**用 `@StateObject` 持有 ViewModel（只创建一次），子视图用 `@ObservedObject` 引用同一实例
4. `NavigationStack + List + .searchable + .swipeActions` 是 SwiftUI 列表页的标准四件套
5. **数据单向流动**：View 只调用方法，不直接修改 ViewModel 的属性，保持架构清晰

---

> **下一讲**：系列完结。恭喜你完成了《Swift 从零》全部15讲！你已经掌握了从基础语法到完整 App 的完整技能链。接下来推荐方向：**SwiftData**（替代 CoreData 的现代持久化）、**Combine**（响应式编程）、**Swift Testing**（单元测试新框架）。
