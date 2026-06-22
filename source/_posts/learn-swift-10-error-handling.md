---
title: "【Swift 从零·第10讲】错误处理：throws / try / Result"
date: 2026-06-22
tags:
  - Swift
  - 语言学习
categories:
  - 技术深潜
series: learn-swift
---

> **系列导航** → [课程目录](/courses/learn-swift/) · 上一讲：第09讲·泛型 · 下一讲待写

---

## 引言

程序在运行时总会遇到意外——文件不存在、网络超时、用户输入非法数据。如果对这些意外视而不见，程序要么默默返回错误值，要么直接崩溃，调用方完全不知道发生了什么。

Swift 把错误处理设计成语言的一等公民：函数必须在签名上声明"我可能抛出错误"，调用方必须显式地用 `try` 去调用它。这种设计不是在刁难程序员，而是在强迫我们正视每一个可能失败的操作。读完这一讲，你会明白 `throws`、`try`、`do-catch` 和 `Result` 各自适合什么场景，以及如何优雅地在它们之间切换。

---

## 第1节：定义可抛出错误的类型

### 1.1 遵守 Error 协议

Swift 的错误必须是遵守 `Error` 协议的类型。最常见的做法是用枚举——枚举的关联值天然适合携带错误的上下文信息。

```swift
enum FileError: Error {
    case fileNotFound(path: String)
    case permissionDenied(path: String)
    case corruptedData(reason: String)
    case unknown
}
```

每个 case 都是一种独立的错误情形，关联值让错误"自带说明书"——当你捕获到 `.fileNotFound` 时，`path` 直接告诉你是哪个文件找不到。

### 1.2 为错误提供可读描述

让错误遵守 `LocalizedError` 协议，可以补充人类可读的描述，方便调试和展示给用户。

```swift
extension FileError: LocalizedError {
    var errorDescription: String? {
        switch self {
        case .fileNotFound(let path):
            return "文件未找到：\(path)"
        case .permissionDenied(let path):
            return "无权访问：\(path)"
        case .corruptedData(let reason):
            return "数据损坏：\(reason)"
        case .unknown:
            return "发生未知错误"
        }
    }
}

// 测试一下
let err = FileError.fileNotFound(path: "/tmp/notes.txt")
print(err.errorDescription ?? "")
// 输出：文件未找到：/tmp/notes.txt
```

---

## 第2节：throws 函数与 try 调用

### 2.1 声明 throws 函数

在函数签名的参数列表后、返回类型前写上 `throws`，表示这个函数可能抛出错误。

```swift
import Foundation

func readFile(at path: String) throws -> String {
    // 模拟：只有特定路径才"存在"
    guard path.hasSuffix(".txt") else {
        throw FileError.fileNotFound(path: path)
    }
    guard path.hasPrefix("/allowed/") else {
        throw FileError.permissionDenied(path: path)
    }
    // 模拟读取内容
    return "Hello from \(path)"
}
```

`throw` 语句会立刻终止函数执行，把错误"抛"给调用方。

### 2.2 用 try 调用，错误向上传播

直接在 throws 函数的调用前加 `try`。如果外层函数也标记了 `throws`，错误会继续向上传播：

```swift
func loadConfig() throws -> String {
    // 如果 readFile 抛出，错误自动传播给 loadConfig 的调用方
    let content = try readFile(at: "/allowed/config.txt")
    return content
}
```

这种传播机制让底层错误可以"冒泡"到真正有能力处理它的层级，不需要在每一层都写 if-else。

### 2.3 do-catch 捕获错误

在调用方不想继续传播时，用 `do-catch` 块捕获并处理：

```swift
do {
    let content = try readFile(at: "/allowed/readme.txt")
    print("读取成功：\(content)")
} catch FileError.fileNotFound(let path) {
    print("文件不见了，路径：\(path)")
} catch FileError.permissionDenied(let path) {
    print("没有权限，路径：\(path)")
} catch FileError.corruptedData(let reason) {
    print("数据有问题：\(reason)")
} catch {
    // 兜底：捕获所有其他错误
    // 此处 error 是隐式常量，类型为 Error
    print("未知错误：\(error.localizedDescription)")
}
```

`catch` 分支按从上到下的顺序匹配，命中第一个匹配项后不再继续，所以越具体的 case 要越靠前，通配 `catch` 放最后兜底。

---

## 第3节：try? 与 try! 的权衡

### 3.1 try?：把错误转成 Optional

当你不在乎错误的具体原因，只想知道"成功了吗"，用 `try?`：

```swift
let content: String? = try? readFile(at: "/allowed/notes.txt")

if let text = content {
    print("有内容：\(text)")
} else {
    print("读取失败（原因已忽略）")
}
```

`try?` 在出错时返回 `nil`，成功时返回 `Optional<T>` 的 `.some`。它的缺点是丢弃了错误细节，只适用于"失败了就跳过"的场景，比如读取可选的缓存文件。

### 3.2 try!：确定不会失败时使用

`try!` 在出错时直接触发运行时崩溃（类似强制解包 `!`），只有在你100%确定不会出错时才用：

```swift
// 正则表达式字面量在编译期就能验证，使用 try! 合理
let regex = try! NSRegularExpression(pattern: "^[a-z]+$")
print(regex.pattern) // a-z

// 下面这行在 path 不合法时会崩溃，慎用
// let dangerousContent = try! readFile(at: "/some/unknown/path")
```

**原则**：生产代码几乎不应该出现 `try!`，除非是已知绝对安全的初始化（如静态正则、已验证的 URL 字符串）。

---

## 第4节：Result 类型——把错误变成值

### 4.1 Result 的结构

`Result<Success, Failure: Error>` 是 Swift 标准库的枚举，有两个 case：

```swift
// 标准库定义（仅示意）：
// enum Result<Success, Failure: Error> {
//     case success(Success)
//     case failure(Failure)
// }
```

它把"成功或失败"封装成一个普通值，可以被存储、传递、作为函数返回值——这在异步回调场景特别有用，因为异步函数不能直接抛出错误。

### 4.2 模拟网络请求：返回 Result

```swift
enum NetworkError: Error {
    case invalidURL
    case timeout
    case serverError(statusCode: Int)
    case noData
}

// 同步模拟（真实场景中这里会是异步回调）
func fetchUser(id: Int) -> Result<String, NetworkError> {
    guard id > 0 else {
        return .failure(.invalidURL)
    }
    guard id < 1000 else {
        return .failure(.serverError(statusCode: 404))
    }
    // 模拟成功返回 JSON 字符串
    return .success("{\"id\": \(id), \"name\": \"Swift User\"}")
}

// 调用并处理
let result = fetchUser(id: 42)
switch result {
case .success(let json):
    print("请求成功：\(json)")
case .failure(let error):
    switch error {
    case .serverError(let code):
        print("服务器错误，状态码：\(code)")
    default:
        print("网络错误：\(error)")
    }
}
```

### 4.3 Result 的函数式操作：map / flatMap / get()

`Result` 提供了函数式变换方法，让你在不解包的情况下处理成功值：

```swift
// map：对 success 值做变换，failure 透传
let nameResult: Result<String, NetworkError> = fetchUser(id: 42)
    .map { json in
        // 从 JSON 字符串中"提取"名字（简化模拟）
        return json.contains("Swift User") ? "Swift User" : "Unknown"
    }

print(nameResult) // success("Swift User")

// flatMap：变换函数本身也可能失败时使用
func parseJSON(_ raw: String) -> Result<[String: String], NetworkError> {
    guard raw.hasPrefix("{") else { return .failure(.noData) }
    return .success(["raw": raw])
}

let parsed = fetchUser(id: 10).flatMap { parseJSON($0) }
print(parsed) // success(["raw": "{\"id\": 10, \"name\": \"Swift User\"}"])

// get()：把 Result 转回 throws 风格（桥接两个世界）
do {
    let value = try fetchUser(id: 500).get()
    print("值：\(value)")
} catch let error as NetworkError {
    print("捕获到 NetworkError：\(error)")
} catch {
    print("其他错误：\(error)")
}
```

`get()` 是 `Result` 与 `throws` 世界的桥梁：它把 `.failure` 的错误抛出，把 `.success` 的值直接返回，让你在 `do-catch` 中统一处理。

---

## 第5节：throws vs Result——如何选择

### 5.1 throws 的适用场景

`throws` 适合**同步函数**，错误需要调用方立即处理：

```swift
// 同步文件解析：出错就停止，调用方用 do-catch 处理
func parseConfig(_ text: String) throws -> [String: String] {
    guard text.contains("=") else {
        throw FileError.corruptedData(reason: "缺少等号分隔符")
    }
    var config: [String: String] = [:]
    for line in text.split(separator: "\n") {
        let parts = line.split(separator: "=", maxSplits: 1)
        if parts.count == 2 {
            config[String(parts[0])] = String(parts[1])
        }
    }
    return config
}

do {
    let cfg = try parseConfig("host=localhost\nport=8080")
    print(cfg) // ["host": "localhost", "port": "8080"]
} catch FileError.corruptedData(let reason) {
    print("配置解析失败：\(reason)")
} catch {
    print("意外错误：\(error)")
}
```

### 5.2 Result 的适用场景

`Result` 适合**异步回调**或需要把错误当作值来存储/传递的场景：

```swift
// 模拟异步任务完成后通过回调返回结果
func downloadData(from url: String, completion: (Result<Data, NetworkError>) -> Void) {
    guard url.hasPrefix("https://") else {
        completion(.failure(.invalidURL))
        return
    }
    // 模拟网络延迟后返回数据
    let fakeData = Data(url.utf8)
    completion(.success(fakeData))
}

downloadData(from: "https://example.com/api") { result in
    switch result {
    case .success(let data):
        print("收到 \(data.count) 字节数据")
    case .failure(let error):
        print("下载失败：\(error)")
    }
}
```

| 维度 | throws | Result |
|------|--------|--------|
| 适用场景 | 同步函数 | 异步回调、错误作为值 |
| 调用语法 | try / do-catch | switch result |
| 错误传播 | 自动向上冒泡 | 手动传递 |
| 可存储性 | 不能直接存储 | 可以存入变量/数组 |
| 互转 | `Result.get()` 转 throws | `Result(catching:)` 转 Result |

---

## 小结

本讲核心要点：

1. **Error 协议 + enum**：用带关联值的枚举定义错误类型，关联值携带错误上下文。
2. **throws / try**：函数签名声明 `throws`，调用时加 `try`；错误自动向上传播，直到被 `do-catch` 拦截。
3. **do-catch 分支顺序**：从具体到通用，兜底 `catch` 放最后；`catch` 块内隐式常量 `error` 类型为 `Error`。
4. **try? vs try!**：`try?` 静默忽略错误返回 Optional；`try!` 出错即崩溃，仅用于已知安全的场景。
5. **Result 是值**：`Result<Success, Failure>` 把成功/失败封装成普通值，支持 `map` / `flatMap` / `get()`，是异步回调的首选；`get()` 和 `Result(catching:)` 可在两种风格间桥接。

---

> **下一讲**：[第11讲·并发](/courses/learn-swift/)
