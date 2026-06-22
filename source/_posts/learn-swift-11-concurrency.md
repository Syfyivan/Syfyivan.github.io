---
title: "【Swift 从零·第11讲】并发：async/await 与 Actor"
date: 2026-06-22
tags:
  - Swift
  - 语言学习
categories:
  - 技术深潜
series: learn-swift
---

> **系列导航** → [课程目录](/courses/learn-swift/) · 上一讲：第10讲·错误处理 · 下一讲待写

## 引言

在移动端和服务端开发中，"等待"无处不在：等网络返回、等文件读取、等数据库查询。传统的回调嵌套（callback hell）和 GCD 代码让并发逻辑变得难以阅读和维护。Swift 5.5 引入的 `async/await` 彻底改变了这一局面——你可以用**看起来像同步代码的方式**写出真正的异步逻辑，编译器帮你保证正确性。

Swift 并发模型的设计目标不只是语法糖。它背后有**协作式调度器**（cooperative scheduler）、**结构化并发**（structured concurrency）和 **actor 隔离**三根支柱，共同解决"异步+安全"这个老大难问题。本讲从最基础的 `async` 函数开始，逐步带你掌握这套现代并发体系。

---

## 第1节：async / await 基础

### 1.1 声明异步函数

在函数返回类型前加 `async`，表示这是一个**可挂起**的异步函数。调用时用 `await` 标记挂起点——线程在此处可以去执行其他工作，等结果回来后再继续。

```swift
import Foundation

// 用 async throws 声明一个异步可抛错函数
func fetchUserName(id: Int) async throws -> String {
    let url = URL(string: "https://jsonplaceholder.typicode.com/users/\(id)")!
    // URLSession.data(from:) 是苹果官方提供的 async 版本
    let (data, _) = try await URLSession.shared.data(from: url)
    let json = try JSONSerialization.jsonObject(with: data) as! [String: Any]
    return json["name"] as! String
}

// 在顶层异步上下文中调用（Playground 需要包裹在 Task 内）
Task {
    do {
        let name = try await fetchUserName(id: 1)
        print("用户名：\(name)")
    } catch {
        print("请求失败：\(error)")
    }
}
```

> **关键点**：`await` 是挂起点，不是阻塞点。线程不会卡住，Swift 运行时会把线程腾出去做别的事情。

### 1.2 async 函数只能在异步上下文调用

普通同步函数无法直接 `await`。Playground 顶层代码是同步上下文，所以需要用 `Task { }` 包裹创建一个新的异步任务。

```swift
// 错误示范：直接在同步上下文 await（编译报错）
// let name = try await fetchUserName(id: 1)  // ❌ 'async' call in a function that does not support concurrency

// 正确做法：用 Task 创建异步上下文
Task {
    let name = try? await fetchUserName(id: 1)
    print(name ?? "无结果")
}
```

---

## 第2节：Task 与结构化并发

### 2.1 Task：创建独立并发任务

`Task` 是 Swift 并发的基本工作单元。每个 Task 独立运行，拥有自己的优先级和取消状态。

```swift
import Foundation

func slowAdd(_ a: Int, _ b: Int) async -> Int {
    // 模拟耗时操作
    try? await Task.sleep(nanoseconds: 500_000_000) // 0.5 秒
    return a + b
}

// 创建两个独立任务
let task1 = Task {
    await slowAdd(1, 2)
}

let task2 = Task {
    await slowAdd(10, 20)
}

Task {
    let result1 = await task1.value
    let result2 = await task2.value
    print("task1 结果：\(result1), task2 结果：\(result2)")
}
```

### 2.2 async let：并发执行多个异步操作

`async let` 是结构化并发的语法糖，让多个子任务**同时启动**，再统一等待结果——比串行 `await` 效率高得多。

```swift
import Foundation

func fetchPost(id: Int) async throws -> String {
    let url = URL(string: "https://jsonplaceholder.typicode.com/posts/\(id)")!
    let (data, _) = try await URLSession.shared.data(from: url)
    let json = try JSONSerialization.jsonObject(with: data) as! [String: Any]
    return json["title"] as! String
}

Task {
    do {
        // async let 同时发起两个请求（并发，不是串行）
        async let title1 = fetchPost(id: 1)
        async let title2 = fetchPost(id: 2)

        // await 统一等待两个结果
        let (t1, t2) = try await (title1, title2)
        print("文章1：\(t1)")
        print("文章2：\(t2)")
    } catch {
        print("请求失败：\(error)")
    }
}
```

> **对比串行**：如果改成 `let t1 = try await fetchPost(id: 1); let t2 = try await fetchPost(id: 2)`，两个请求会依次执行，总时间翻倍。`async let` 让它们同时跑，总时间取决于最慢的那个。

### 2.3 TaskGroup：动态任务组

当并发任务数量在运行时才能确定时，用 `withTaskGroup` 创建任务组。

```swift
import Foundation

func fetchMultiplePosts(ids: [Int]) async throws -> [String] {
    try await withThrowingTaskGroup(of: String.self) { group in
        for id in ids {
            group.addTask {
                try await fetchPost(id: id)
            }
        }
        // 收集所有结果
        var titles: [String] = []
        for try await title in group {
            titles.append(title)
        }
        return titles
    }
}

Task {
    do {
        let titles = try await fetchMultiplePosts(ids: [1, 2, 3])
        titles.forEach { print($0) }
    } catch {
        print("批量请求失败：\(error)")
    }
}
```

---

## 第3节：Actor —— 并发安全的数据守护者

### 3.1 为什么需要 Actor

多个并发任务同时读写同一份数据，会导致**数据竞争**（data race）。传统做法是手动加锁，容易忘、容易死锁。Swift 的 `actor` 用**自动串行化**解决这个问题：同一时刻只有一个任务能访问 actor 的状态。

```swift
// 没有 actor 保护时的计数器（不安全）
class UnsafeCounter {
    var count = 0
    func increment() { count += 1 } // 多任务并发调用会出现数据竞争
}

// 用 actor 保护的计数器（安全）
actor SafeCounter {
    private(set) var count = 0

    func increment() {
        count += 1
    }

    func reset() {
        count = 0
    }
}

Task {
    let counter = SafeCounter()

    // 并发创建 100 个任务同时递增
    await withTaskGroup(of: Void.self) { group in
        for _ in 0..<100 {
            group.addTask {
                await counter.increment() // await 访问 actor，自动排队
            }
        }
    }

    let finalCount = await counter.count // 读取 actor 属性也需要 await
    print("最终计数：\(finalCount)") // 一定是 100，不会有竞争
}
```

### 3.2 Actor 的隔离规则

actor 内部的方法可以直接访问自身属性，但从 actor 外部访问必须用 `await`。

```swift
actor BankAccount {
    let owner: String
    private var balance: Double

    init(owner: String, balance: Double) {
        self.owner = owner
        self.balance = balance
    }

    func deposit(_ amount: Double) {
        balance += amount
    }

    func withdraw(_ amount: Double) throws {
        guard balance >= amount else {
            throw NSError(domain: "BankError", code: 1, userInfo: [NSLocalizedDescriptionKey: "余额不足"])
        }
        balance -= amount
    }

    // actor 内部可以直接访问 balance，无需 await
    func getBalance() -> Double {
        return balance
    }
}

Task {
    let account = BankAccount(owner: "Alice", balance: 1000)

    await account.deposit(500)
    try? await account.withdraw(200)

    let balance = await account.getBalance()
    print("\(await account.owner) 的余额：\(balance)") // owner 是 let，可以非隔离访问，但在异步上下文中仍建议 await
}
```

---

## 第4节：@MainActor 与 UI 线程

### 4.1 @MainActor：强制在主线程执行

UI 更新必须在主线程进行。`@MainActor` 是一个全局 actor，标记后该代码保证在主线程执行。

```swift
import Foundation

// 模拟一个 ViewModel（在真实 iOS 项目中会继承 ObservableObject）
@MainActor
class UserViewModel {
    var userName: String = ""
    var isLoading: Bool = false

    func loadUser(id: Int) async {
        isLoading = true
        defer { isLoading = false }

        do {
            // 切出主线程执行网络请求
            let name = try await fetchUserName(id: id)
            // 回到主线程更新 UI 属性（@MainActor 保证）
            userName = name
            print("UI 更新：\(userName)")
        } catch {
            print("加载失败：\(error)")
        }
    }
}

// 也可以用 MainActor.run 临时切换到主线程
Task {
    await MainActor.run {
        print("这行代码在主线程执行")
    }
}

Task {
    let vm = UserViewModel()
    await vm.loadUser(id: 1)
}
```

### 4.2 nonisolated：跳出 Actor 隔离

有时候 actor 内的某个方法不需要访问状态，可以用 `nonisolated` 避免不必要的 `await`。

```swift
actor Logger {
    var logs: [String] = []

    func log(_ message: String) {
        logs.append(message)
    }

    // nonisolated：不访问 actor 状态，可以同步调用，无需 await
    nonisolated func formatMessage(_ raw: String) -> String {
        return "[\(Date())] \(raw)"
    }
}

Task {
    let logger = Logger()
    let formatted = logger.formatMessage("启动完成") // 同步调用，无需 await
    await logger.log(formatted)
    print(formatted)
}
```

---

## 第5节：Sendable —— 跨并发域的安全通行证

### 5.1 什么是 Sendable

当数据从一个并发域（比如一个 actor）传递到另一个并发域时，Swift 要求该类型遵守 `Sendable` 协议，以确保不会产生数据竞争。

```swift
// struct 默认是 Sendable（值类型，拷贝传递）
struct UserInfo: Sendable {
    let id: Int
    let name: String
}

// class 需要手动保证线程安全才能标记 Sendable
final class ImmutableConfig: @unchecked Sendable {
    let apiKey: String // 只有不可变属性，线程安全
    init(apiKey: String) { self.apiKey = apiKey }
}

actor DataProcessor {
    func process(_ user: UserInfo) -> String {
        // UserInfo 是 Sendable，可以安全跨域传递
        return "处理用户：\(user.name)"
    }
}

Task {
    let processor = DataProcessor()
    let user = UserInfo(id: 42, name: "Bob")
    let result = await processor.process(user)
    print(result)
}
```

### 5.2 Swift 6 的严格并发检查

Swift 6 默认开启严格的 Sendable 检查。如果把一个非 Sendable 的引用类型传递给 actor，编译器会报错。这在编译期就能阻止数据竞争，是 Swift 并发安全的核心保障。

```swift
// Swift 6 中，这样写会编译警告/报错：
// class MutableData { var value = 0 }
// actor Worker {
//     func run(_ data: MutableData) { ... } // ❌ MutableData 不是 Sendable
// }

// 正确做法：改用 struct 或让 class 遵守 Sendable
struct SafeData: Sendable {
    var value: Int
}

actor Worker {
    func run(_ data: SafeData) -> Int {
        return data.value * 2
    }
}

Task {
    let worker = Worker()
    let result = await worker.run(SafeData(value: 21))
    print("结果：\(result)") // 42
}
```

---

## 本讲小结

1. **async/await**：用 `async` 声明异步函数，用 `await` 挂起等待结果，线程不阻塞，代码像同步一样可读。
2. **Task 与 async let**：`Task { }` 创建独立并发任务；`async let` 让多个异步操作同时启动，统一 `await` 收集结果，效率远优于串行调用。
3. **TaskGroup**：任务数量动态时用 `withThrowingTaskGroup`，灵活收集任意数量的并发结果。
4. **Actor**：用 `actor` 保护共享状态，自动串行化访问，彻底告别手动加锁，数据竞争在编译期被消灭。
5. **@MainActor & Sendable**：`@MainActor` 保证 UI 代码始终在主线程；`Sendable` 是跨并发域传递数据的安全合同，Swift 6 在编译期强制检查。

---

> **下一讲**：第12讲·内存管理
