---
title: "【Swift 从零·第07讲】enum：Swift 枚举远不止枚举"
date: 2026-06-22
tags:
  - Swift
  - 语言学习
categories:
  - 技术深潜
series: learn-swift
---

> **系列导航** → [课程目录](/courses/learn-swift/) · 上一讲：第06讲·struct vs class · 下一讲待写

## 引言

在很多语言里，枚举只是"给整数穿了件衣服"——`RED=0`、`GREEN=1`、`BLUE=2`，本质上还是数字。Swift 的 `enum` 彻底打破了这个刻板印象。

Swift 枚举是**一等类型**：可以有方法、计算属性、泛型约束，最关键的是，每个 `case` 可以携带完全不同类型的**关联值（Associated Values）**。这让枚举摇身一变，成为建模"有限状态空间"最优雅的工具。更有趣的是，你每天都在用的 `Optional<T>` 本身就是一个枚举——理解了 `enum`，也就真正理解了 Swift 的可选值。

---

## 第1节：基础枚举与 rawValue

### 1.1 最简单的枚举

```swift
enum Direction {
    case north
    case south
    case east
    case west
}

let heading = Direction.north
print(heading) // north

// switch 必须穷举所有 case（或加 default）
switch heading {
case .north: print("向北走")
case .south: print("向南走")
case .east:  print("向东走")
case .west:  print("向西走")
}
```

Swift 编译器会在 `switch` 里强制你处理所有情况，这种**穷举性检查**在编译期就能发现遗漏，避免运行时的"缺省分支"悄悄埋雷。

### 1.2 rawValue：与数字/字符串互转

当需要与外部系统（JSON、数据库）交互时，可以给枚举加上原始值：

```swift
// Int rawValue：自动从 1 开始递增
enum Planet: Int {
    case mercury = 1, venus, earth, mars
}

let earth = Planet(rawValue: 3)  // Optional<Planet>
print(earth!)                     // earth
print(Planet.mars.rawValue)       // 4

// String rawValue：case 名即字符串值（也可手动指定）
enum HTTPMethod: String {
    case get    = "GET"
    case post   = "POST"
    case put    = "PUT"
    case delete = "DELETE"
}

let method = HTTPMethod.post
print(method.rawValue)  // POST

// 加上 Codable 即可直接参与 JSON 解析
enum Status: String, Codable {
    case active   = "active"
    case inactive = "inactive"
    case pending  = "pending"
}
```

> 注意：`rawValue` 初始化返回的是 `Optional`，因为传入的值不一定对应某个 `case`。

---

## 第2节：关联值——每个 case 携带自己的数据

### 2.1 关联值基础

这是 Swift 枚举最强大的特性。不同 `case` 可以携带**不同类型、不同数量**的数据：

```swift
enum Barcode {
    case upc(Int, Int, Int, Int)     // UPC 码：四段数字
    case qrCode(String)              // 二维码：字符串
}

let productCode = Barcode.upc(8, 85909, 51226, 3)
let webLink = Barcode.qrCode("https://example.com/product/42")

switch productCode {
case .upc(let numberSystem, let manufacturer, let product, let check):
    print("UPC: \(numberSystem)-\(manufacturer)-\(product)-\(check)")
case .qrCode(let code):
    print("QR: \(code)")
}
// 输出：UPC: 8-85909-51226-3
```

### 2.2 Result 类型的实现原理

Swift 标准库的 `Result<Success, Failure>` 就是用关联值实现的，我们来自己写一个：

```swift
// 自定义 Result-like 枚举
enum MyResult<Value, Err: Error> {
    case success(Value)
    case failure(Err)

    // 方法：转换成功值
    func map<NewValue>(_ transform: (Value) -> NewValue) -> MyResult<NewValue, Err> {
        switch self {
        case .success(let value):
            return .success(transform(value))
        case .failure(let error):
            return .failure(error)
        }
    }

    // 计算属性：快速取值
    var value: Value? {
        if case .success(let v) = self { return v }
        return nil
    }
}

// 使用示例
enum ParseError: Error {
    case invalidInput(String)
    case outOfRange(Int)
}

func parseInt(_ text: String) -> MyResult<Int, ParseError> {
    guard let n = Int(text) else {
        return .failure(.invalidInput(text))
    }
    guard (0...1000).contains(n) else {
        return .failure(.outOfRange(n))
    }
    return .success(n)
}

let r1 = parseInt("42")
let r2 = parseInt("abc")
let r3 = parseInt("9999")

print(r1.value ?? "nil")          // 42
print(r1.map { $0 * 2 }.value!)   // 84

switch r2 {
case .success(let n): print("成功：\(n)")
case .failure(.invalidInput(let s)): print("非法输入：\(s)")
case .failure(.outOfRange(let n)):   print("超出范围：\(n)")
}
// 输出：非法输入：abc
```

### 2.3 用关联值表达 API 错误详情

现实中的 API 错误往往有多个维度，关联值能把所有信息打包在一个类型里：

```swift
enum APIError: Error {
    case networkError(URLError)
    case serverError(statusCode: Int, message: String)
    case decodingError(field: String, expected: String, got: String)
    case unauthorized
    case rateLimited(retryAfter: TimeInterval)
}

func describeError(_ error: APIError) -> String {
    switch error {
    case .networkError(let urlError):
        return "网络错误：\(urlError.localizedDescription)"
    case .serverError(let code, let msg):
        return "服务器 \(code)：\(msg)"
    case .decodingError(let field, let expected, let got):
        return "字段 '\(field)' 期望 \(expected)，实际得到 \(got)"
    case .unauthorized:
        return "未授权，请重新登录"
    case .rateLimited(let seconds):
        return "请求过频，\(seconds) 秒后重试"
    }
}

let err = APIError.serverError(statusCode: 503, message: "Service Unavailable")
print(describeError(err))
// 输出：服务器 503：Service Unavailable
```

---

## 第3节：递归枚举与间接引用

### 3.1 indirect enum

当一个枚举的关联值包含自身类型时，必须用 `indirect` 关键字——告诉编译器"这里需要堆分配，大小不固定"：

```swift
// 经典例子：二叉树节点
indirect enum BinaryTree<T> {
    case empty
    case node(value: T, left: BinaryTree<T>, right: BinaryTree<T>)
}

// 构建一棵简单的树
//       5
//      / \
//     3   8
//    / \
//   1   4

let leaf1 = BinaryTree<Int>.node(value: 1, left: .empty, right: .empty)
let leaf4 = BinaryTree<Int>.node(value: 4, left: .empty, right: .empty)
let leaf8 = BinaryTree<Int>.node(value: 8, left: .empty, right: .empty)
let node3 = BinaryTree<Int>.node(value: 3, left: leaf1, right: leaf4)
let root  = BinaryTree<Int>.node(value: 5, left: node3, right: leaf8)

// 中序遍历（左-根-右 = 升序）
func inorder<T>(_ tree: BinaryTree<T>) -> [T] {
    switch tree {
    case .empty:
        return []
    case .node(let val, let left, let right):
        return inorder(left) + [val] + inorder(right)
    }
}

print(inorder(root))  // [1, 3, 4, 5, 8]
```

`indirect` 也可以只标注在特定 `case` 上，而不是整个 `enum`，精确控制哪些分支需要间接引用。

---

## 第4节：枚举的方法与计算属性

### 4.1 给枚举加行为

Swift 枚举是完整的类型，可以有实例方法、静态方法和计算属性：

```swift
enum Suit: String, CaseIterable {
    case spades = "♠️"
    case hearts = "♥️"
    case diamonds = "♦️"
    case clubs = "♣️"

    // 计算属性
    var isRed: Bool {
        return self == .hearts || self == .diamonds
    }

    var displayName: String {
        switch self {
        case .spades:   return "黑桃"
        case .hearts:   return "红心"
        case .diamonds: return "方块"
        case .clubs:    return "梅花"
        }
    }

    // 静态方法
    static func redSuits() -> [Suit] {
        return allCases.filter { $0.isRed }
    }
}

print(Suit.hearts.rawValue)     // ♥️
print(Suit.hearts.isRed)        // true
print(Suit.hearts.displayName)  // 红心
print(Suit.redSuits())          // [hearts, diamonds]

// CaseIterable 让你遍历所有 case
for suit in Suit.allCases {
    print("\(suit.displayName) \(suit.rawValue)")
}
```

---

## 第5节：用枚举建模状态机

### 5.1 网络请求的状态机

UI 开发中最常见的场景：一个网络请求从发出到结束，经历多个互斥状态。用枚举建模比一堆 `Bool` 变量清晰得多：

```swift
import Foundation

// 模拟数据类型
struct UserProfile: CustomStringConvertible {
    let name: String
    let age: Int
    var description: String { "\(name), \(age)岁" }
}

// 状态枚举：每个状态携带对应的数据
enum RequestState {
    case idle                              // 初始状态，未发起请求
    case loading(progress: Double)         // 加载中，附带进度
    case success(data: UserProfile)        // 成功，附带数据
    case failure(error: Error, retryCount: Int) // 失败，附带错误和重试次数
}

// 状态机管理器
class ProfileViewModel {
    private(set) var state: RequestState = .idle

    // 计算属性：从 state 派生 UI 所需信息
    var isLoading: Bool {
        if case .loading = state { return true }
        return false
    }

    var displayText: String {
        switch state {
        case .idle:
            return "点击加载"
        case .loading(let progress):
            return "加载中... \(Int(progress * 100))%"
        case .success(let profile):
            return "已加载：\(profile)"
        case .failure(let error, let retries):
            return "失败（已重试 \(retries) 次）：\(error.localizedDescription)"
        }
    }

    func startLoading() {
        state = .loading(progress: 0.0)
        print("状态 → \(displayText)")

        // 模拟进度更新
        state = .loading(progress: 0.6)
        print("状态 → \(displayText)")
    }

    func simulateSuccess() {
        let user = UserProfile(name: "Alice", age: 28)
        state = .success(data: user)
        print("状态 → \(displayText)")
    }

    func simulateFailure() {
        struct FakeError: Error, LocalizedError {
            var errorDescription: String? { "连接超时" }
        }
        state = .failure(error: FakeError(), retryCount: 2)
        print("状态 → \(displayText)")
    }
}

let vm = ProfileViewModel()
print("初始：\(vm.displayText)")
vm.startLoading()
vm.simulateSuccess()

let vm2 = ProfileViewModel()
vm2.startLoading()
vm2.simulateFailure()
```

### 5.2 Optional 本身就是枚举

这是 Swift 中最精妙的设计之一——你天天用的 `?` 其实是语法糖：

```swift
// Swift 标准库中 Optional 的真实定义（简化）
// enum Optional<Wrapped> {
//     case none
//     case some(Wrapped)
// }

// 以下两种写法完全等价
let a: String? = "hello"
let b: Optional<String> = .some("hello")
let c: Optional<String> = .none

// 手动模式匹配
let maybeNumber: Int? = 42

if case .some(let n) = maybeNumber {
    print("有值：\(n)")  // 有值：42
}

// 这就是 if let 的本质
if let n = maybeNumber {
    print("if let：\(n)")  // if let：42
}

// 用 switch 穷举
switch maybeNumber {
case .some(let n) where n > 0:
    print("正数：\(n)")
case .some(let n):
    print("非正数：\(n)")
case .none:
    print("没有值")
}
// 输出：正数：42
```

理解了这一点，你就会明白为什么 `switch` 的 `Optional` 分支要写 `case .some(let x)` 和 `case .none`，以及为什么 `??` 运算符叫"空合并"——它就是在处理 `.none` 分支。

---

## 本讲小结

| 核心要点 | 关键语法 |
|---------|---------|
| 枚举是一等类型，支持方法和计算属性 | `enum Foo { func bar() {} }` |
| rawValue 让枚举与 Int/String 互转 | `enum E: Int { case a = 1 }` |
| 关联值让每个 case 携带不同数据 | `case success(Data)` |
| 递归枚举用 indirect 标注 | `indirect enum Tree { case node(..., Tree) }` |
| `Optional<T>` 本质是 `.some(T)` / `.none` | `if case .some(let x) = opt { }` |

Swift 枚举的真正价值在于：**把"不可能同时为真"的多种状态，用类型系统表达出来**。与其用三个 `Bool` 变量来描述"加载中/成功/失败"，不如用一个 `RequestState` 枚举，让编译器替你排除不合法的状态组合。

---

> **下一讲**：第08讲·Protocol —— Swift 面向协议编程的核心思想，`extension` + `protocol` 如何替代继承
