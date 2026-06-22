---
title: "【Swift 从零·第05讲】函数与闭包：参数标签与尾随闭包"
date: 2026-06-22
tags:
  - Swift
  - 语言学习
categories:
  - 技术深潜
series: learn-swift
---

> **系列导航** → [课程目录](/courses/learn-swift/) · 上一讲：第04讲·控制流 · 下一讲待写

## 引言

如果说变量是 Swift 的"词汇"，那函数就是它的"句子"——有结构、有语义、能表达完整意图。Swift 的函数设计在众多语言中独树一帜：**参数标签**让调用代码读起来像自然语言，而不是一串难以理解的逗号分隔值。

闭包则是函数的"精简版"，能捕获上下文、作为参数传递、作为返回值返回。从 `Array.sorted` 到网络回调，闭包无处不在。理解闭包的简化过程和内存语义（`[weak self]`），是写出地道 Swift 代码的必经之路。

---

## 第1节：函数基础与参数标签

### 1.1 外部标签 vs 内部参数名

Swift 函数的参数可以同时拥有两个名字：**外部标签**（调用时可见）和**内部参数名**（函数体内使用）。格式为 `外部标签 内部参数名: 类型`。

```swift
// 外部标签 "to"，内部参数名 "name"
func greet(to name: String, from city: String) -> String {
    // 函数体内用 name 和 city
    return "Hello, \(name)! Greetings from \(city)."
}

// 调用时用外部标签，读起来像英语句子
let message = greet(to: "Alice", from: "Shanghai")
print(message)
// 输出：Hello, Alice! Greetings from Shanghai.
```

这种设计的哲学是：**调用侧的可读性**优先于编写侧的简洁性。

### 1.2 用 `_` 省略外部标签

有时函数名本身已经足够清晰，强行加标签反而啰嗦。用下划线 `_` 可以省略外部标签：

```swift
func square(_ number: Double) -> Double {
    return number * number
}

// 调用时无需写标签，简洁直接
let result = square(5.0)
print(result)  // 25.0

// 对比：如果不省略，调用就会变成 square(number: 5.0)，语义上略显冗余
```

### 1.3 默认参数值与可变参数

```swift
// 默认参数值：调用时可省略
func connect(host: String, port: Int = 8080, secure: Bool = false) -> String {
    let scheme = secure ? "https" : "http"
    return "\(scheme)://\(host):\(port)"
}

print(connect(host: "example.com"))                    // http://example.com:8080
print(connect(host: "example.com", port: 443, secure: true))  // https://example.com:443

// 可变参数：用 ... 接收任意数量的同类型参数，函数体内是数组
func sum(_ numbers: Double...) -> Double {
    return numbers.reduce(0, +)
}

print(sum(1, 2, 3, 4, 5))  // 15.0
print(sum(10, 20))          // 30.0
```

---

## 第2节：inout 参数与引用语义

### 2.1 为什么需要 inout

Swift 默认所有参数都是**值传递**（拷贝进去），函数内修改不影响外部。当你确实需要修改外部变量时，使用 `inout`。

```swift
func doubleInPlace(_ value: inout Int) {
    value *= 2
}

var count = 10
// 调用时加 & 前缀，明确告诉读者"这个变量会被修改"
doubleInPlace(&count)
print(count)  // 20

// 经典用例：交换两个值
func swapValues<T>(_ a: inout T, _ b: inout T) {
    let temp = a
    a = b
    b = temp
}

var x = "hello"
var y = "world"
swapValues(&x, &y)
print(x, y)  // world hello
```

`&` 前缀是一个"视觉警告"：它在调用处明确标出副作用，让代码审查更容易发现潜在问题。

---

## 第3节：闭包语法的五步简化

这是本讲最核心的部分。Swift 闭包有一套渐进式简化语法，从完整形式到极简形式，每一步都有其规则依据。

### 3.1 从完整到极简：sorted 的五种写法

```swift
let names = ["Charlie", "Alice", "Bob", "Diana"]

// 写法 1：完整闭包，所有类型都显式写出
let sorted1 = names.sorted(by: { (a: String, b: String) -> Bool in
    return a < b
})

// 写法 2：类型推断，编译器知道 names 是 [String]，可省略参数类型和返回类型
let sorted2 = names.sorted(by: { a, b in
    return a < b
})

// 写法 3：单行 return 可省略 return 关键字（隐式返回）
let sorted3 = names.sorted(by: { a, b in a < b })

// 写法 4：$0/$1 简写参数名，省略参数列表和 in
let sorted4 = names.sorted(by: { $0 < $1 })

// 写法 5：运算符函数，< 本身就是 (String, String) -> Bool 类型的函数
let sorted5 = names.sorted(by: <)

// 全部输出相同结果
print(sorted1)  // ["Alice", "Bob", "Charlie", "Diana"]
```

### 3.2 尾随闭包语法

当闭包是函数的**最后一个参数**时，可以将闭包写在括号外面，称为**尾随闭包**（Trailing Closure）：

```swift
// 普通写法
let doubled1 = [1, 2, 3].map({ $0 * 2 })

// 尾随闭包写法：闭包移到括号外
let doubled2 = [1, 2, 3].map { $0 * 2 }

// 当函数只有一个参数（且是闭包）时，括号可以完全省略
print(doubled2)  // [2, 4, 6]

// 多步骤链式操作，尾随闭包让代码更清晰
let result = [1, 2, 3, 4, 5, 6]
    .filter { $0 % 2 == 0 }     // 保留偶数：[2, 4, 6]
    .map { $0 * $0 }             // 平方：[4, 16, 36]
    .reduce(0, +)                // 求和：56

print(result)  // 56
```

---

## 第4节：@escaping 与异步回调

### 4.1 逃逸闭包的概念

默认情况下，传入函数的闭包在函数返回前就会执行完毕（**非逃逸**）。但在异步场景中，闭包会在函数返回**之后**才被调用——这就是**逃逸闭包**，需要用 `@escaping` 标注。

```swift
import Foundation

// @escaping 标注：告诉编译器这个闭包会"逃出"函数生命周期
func fetchData(url: String, completion: @escaping (String) -> Void) {
    // 模拟网络请求延迟（实际代码用 URLSession）
    DispatchQueue.global().asyncAfter(deadline: .now() + 1.0) {
        let fakeData = "Response from \(url)"
        // 函数早已返回，但闭包在这里才被调用
        completion(fakeData)
    }
}

fetchData(url: "https://api.example.com/data") { response in
    print(response)
    // 约1秒后输出：Response from https://api.example.com/data
}

print("fetchData 已调用，等待回调...")
// 这行会先执行，证明闭包是"逃逸"的
```

### 4.2 捕获列表：防止循环引用

闭包会**捕获**它引用的外部变量。当闭包被类的实例持有、又引用该实例时，会产生**循环引用**，导致内存泄漏。用捕获列表 `[weak self]` 或 `[unowned self]` 打破循环：

```swift
import Foundation

class DataLoader {
    var data: String = ""
    var onComplete: (() -> Void)?

    func startLoading() {
        // 不用捕获列表：self 持有 onComplete，onComplete 持有 self → 循环引用！
        // onComplete = { self.data = "loaded" }  // 危险！

        // 用 [weak self]：self 变成可选，安全释放
        onComplete = { [weak self] in
            guard let self = self else { return }
            self.data = "loaded"
            print("数据加载完成：\(self.data)")
        }

        // 模拟异步触发
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) { [weak self] in
            self?.onComplete?()
        }
    }

    deinit {
        print("DataLoader 被正确释放")
    }
}

// Playground 顶层代码测试
var loader: DataLoader? = DataLoader()
loader?.startLoading()

// 短暂等待后释放
DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
    loader = nil  // 如果没有循环引用，deinit 会被调用
}

// 使用 RunLoop 让 Playground 等待异步结果
RunLoop.main.run(until: Date(timeIntervalSinceNow: 1.0))
```

**`[weak self]` vs `[unowned self]` 的选择原则：**
- `[weak self]`：self 可能在闭包执行时已释放（用于网络回调、定时器等）
- `[unowned self]`：可以保证 self 一定比闭包活得长（如 init 中的闭包）；self 释放后调用会崩溃

---

## 第5节：函数作为一等公民

### 5.1 函数类型与高阶函数

Swift 中函数是**一等公民**，可以赋值给变量、作为参数传递、作为返回值返回：

```swift
// 函数类型：(Int, Int) -> Int
func add(_ a: Int, _ b: Int) -> Int { a + b }
func multiply(_ a: Int, _ b: Int) -> Int { a * b }

// 赋值给变量
var operation: (Int, Int) -> Int = add
print(operation(3, 4))  // 7

operation = multiply
print(operation(3, 4))  // 12

// 高阶函数：接受函数作为参数
func apply(_ op: (Int, Int) -> Int, to a: Int, and b: Int) -> Int {
    return op(a, b)
}

print(apply(add, to: 10, and: 5))       // 15
print(apply(multiply, to: 10, and: 5))  // 50

// 返回函数的函数（函数工厂）
func makeMultiplier(factor: Int) -> (Int) -> Int {
    // 返回的闭包捕获了 factor
    return { number in number * factor }
}

let triple = makeMultiplier(factor: 3)
let quadruple = makeMultiplier(factor: 4)

print(triple(5))     // 15
print(quadruple(5))  // 20
```

---

## 本讲小结

1. **参数标签双名设计**：`外部标签 内部名: 类型`，调用侧语义清晰；`_` 省略标签适合含义自明的场景
2. **inout 引用语义**：调用处 `&` 前缀是视觉标记，函数可修改外部变量；参数不能是常量或字面量
3. **闭包五步简化**：完整形式 → 类型推断 → 省略 return → `$0/$1` → 运算符函数；尾随闭包语法在最后一个参数是闭包时可移出括号
4. **`@escaping` 标注**：闭包在函数返回后执行时必须标注；编译器会强制提示，不会遗漏
5. **捕获列表防循环引用**：`[weak self]` 将 self 降级为可选；优先用 `weak`，仅在生命周期有明确保证时用 `unowned`

---

> **下一讲**：[第06讲·struct vs class：值类型与引用类型的本质差异](/courses/learn-swift/)
