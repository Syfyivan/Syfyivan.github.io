---
title: "【Swift 从零·第09讲】泛型：让代码对类型无感"
date: 2026-06-22
tags:
  - Swift
  - 语言学习
categories:
  - 技术深潜
series: learn-swift
---

> **系列导航** → [课程目录](/courses/learn-swift/) · 上一讲：第08讲·Protocol · 下一讲待写

## 引言

如果你写过这样的代码——"我需要一个存 Int 的栈，又需要一个存 String 的栈，难道要复制两份几乎一样的实现？"——那你已经在感受泛型要解决的痛点了。

泛型（Generics）是 Swift 最强大的特性之一，也是标准库中 `Array`、`Dictionary`、`Optional` 能够存放任意类型的根基。它让你写出「对类型无感」的代码：逻辑只写一次，编译器在使用时自动推断具体类型，同时不损失任何类型安全保障。理解泛型，是从「会写 Swift」到「写出地道 Swift」的关键一跃。

---

## 第1节：泛型函数与类型参数

### 1.1 从重复代码说起

假设我们要写一个交换两个变量值的函数：

```swift
// 只能交换 Int
func swapInts(_ a: inout Int, _ b: inout Int) {
    let temp = a
    a = b
    b = temp
}

// 只能交换 String
func swapStrings(_ a: inout String, _ b: inout String) {
    let temp = a
    a = b
    b = temp
}
```

逻辑完全相同，却要写两份。泛型函数用一个**类型参数**（type parameter）打破这个重复：

### 1.2 泛型 swap

```swift
// <T> 声明了一个占位类型 T，函数体内把 T 当作真实类型使用
func swapValues<T>(_ a: inout T, _ b: inout T) {
    let temp = a
    a = b
    b = temp
}

var x = 10
var y = 20
swapValues(&x, &y)
print("x=\(x), y=\(y)")   // x=20, y=10

var hello = "hello"
var world = "world"
swapValues(&hello, &world)
print("\(hello) \(world)") // world hello
```

`T` 只是个名字，换成 `Element`、`Value` 都行，但惯例上单字母大写（`T`、`U`、`V`）或有意义的名词（`Element`、`Key`）最常见。调用时编译器根据实参自动推断 `T` 是 `Int` 还是 `String`，零运行时开销。

### 1.3 多个类型参数

一个函数可以有多个类型参数，用逗号分隔：

```swift
func pair<A, B>(_ first: A, _ second: B) -> (A, B) {
    return (first, second)
}

let result = pair(42, "Swift")
print(result) // (42, "Swift")
```

---

## 第2节：泛型类型

### 2.1 泛型 Stack

函数可以泛型，类型（struct / class / enum）同样可以。下面实现一个经典的栈（后进先出）：

```swift
struct Stack<Element> {
    private var storage: [Element] = []

    mutating func push(_ item: Element) {
        storage.append(item)
    }

    mutating func pop() -> Element? {
        return storage.popLast()
    }

    var top: Element? {
        return storage.last
    }

    var isEmpty: Bool {
        return storage.isEmpty
    }

    var count: Int {
        return storage.count
    }
}

// 存 Int
var intStack = Stack<Int>()
intStack.push(1)
intStack.push(2)
intStack.push(3)
print(intStack.pop() ?? -1) // 3
print(intStack.top ?? -1)   // 2

// 存 String，同一份代码
var stringStack = Stack<String>()
stringStack.push("Swift")
stringStack.push("Generics")
print(stringStack.pop() ?? "") // Generics
```

`Stack<Int>` 和 `Stack<String>` 是两个完全独立的类型，编译器为它们各自生成专属代码，既类型安全又高效。

### 2.2 泛型枚举

Swift 标准库里的 `Optional` 就是泛型枚举：

```swift
// 标准库真实定义（简化）
// enum Optional<Wrapped> {
//     case none
//     case some(Wrapped)
// }

// 自定义类似结构
enum Result<Success, Failure: Error> {
    case success(Success)
    case failure(Failure)
}
```

---

## 第3节：类型约束

### 3.1 为什么需要约束

纯粹的 `<T>` 什么都能传，但有时我们需要 `T` 具备某些能力。比如「找最大值」需要元素之间能比较大小：

```swift
// 编译报错：operator '<' requires T to be Comparable
// func findMax<T>(_ array: [T]) -> T? { ... }

// 正确：用 T: Comparable 约束
func findMax<T: Comparable>(_ array: [T]) -> T? {
    guard !array.isEmpty else { return nil }
    var max = array[0]
    for item in array[1...] {
        if item > max { max = item }
    }
    return max
}

print(findMax([3, 1, 4, 1, 5, 9, 2, 6]) ?? 0) // 9
print(findMax(["banana", "apple", "cherry"]) ?? "") // cherry
```

`T: Comparable` 的语法与 Protocol 继承一脉相承：T 必须遵循 `Comparable` 协议，才能使用 `>` 运算符。

### 3.2 多重约束与 where 子句

当约束变复杂，可以用 `where` 子句在函数签名末尾集中声明：

```swift
// T 必须同时遵循 Hashable 和 Comparable
func uniqueSorted<T>(_ array: [T]) -> [T] where T: Hashable, T: Comparable {
    return Array(Set(array)).sorted()
}

print(uniqueSorted([3, 1, 4, 1, 5, 9, 2, 6])) // [1, 2, 3, 4, 5, 6]
```

`where` 还可以约束两个类型参数之间的关系，这在关联类型场景下尤为有用（见下节）。

---

## 第4节：关联类型与协议泛型

### 4.1 associatedtype

协议不能直接用 `<T>` 语法，而是用 `associatedtype` 声明「占位类型」：

```swift
// 定义一个容器协议，Item 是关联类型
protocol Container {
    associatedtype Item
    mutating func append(_ item: Item)
    var count: Int { get }
    subscript(i: Int) -> Item { get }
}
```

实现协议的类型可以显式声明 `typealias Item = Int`，也可以让编译器从方法签名自动推断：

```swift
// 让 Stack<Element> 遵循 Container
extension Stack: Container {
    // 编译器自动推断 Item = Element
    mutating func append(_ item: Element) {
        push(item)
    }

    subscript(i: Int) -> Element {
        return storage[i]
    }
}

var myStack = Stack<Int>()
myStack.append(10)
myStack.append(20)
print(myStack[0]) // 10
print(myStack.count) // 2
```

### 4.2 where 约束关联类型

`where` 子句可以约束关联类型，让泛型函数只接受特定配置的容器：

```swift
// 只接受 Item 为 Int 的 Container
func sumContainer<C: Container>(_ c: C) -> Int where C.Item == Int {
    var total = 0
    for i in 0..<c.count {
        total += c[i]
    }
    return total
}

var numStack = Stack<Int>()
numStack.push(1)
numStack.push(2)
numStack.push(3)
print(sumContainer(numStack)) // 6
```

---

## 第5节：some 与 any——不透明类型与存在类型

### 5.1 some：不透明类型（Opaque Type）

`some Protocol` 表示「返回某个具体的、遵循该协议的类型，但调用者不需要知道是哪个」。具体类型在编译期确定，编译器知道，只是对外隐藏。

```swift
protocol Shape {
    func area() -> Double
}

struct Circle: Shape {
    let radius: Double
    func area() -> Double { .pi * radius * radius }
}

struct Square: Shape {
    let side: Double
    func area() -> Double { side * side }
}

// some Shape：调用者只知道返回了一个 Shape，但编译器知道是 Circle
func makeDefaultShape() -> some Shape {
    return Circle(radius: 5)
}

let shape = makeDefaultShape()
print(shape.area()) // 78.53...
```

`some` 在 SwiftUI 中无处不在——`var body: some View` 就是典型用法，它让视图类型可以任意组合，同时不暴露复杂的具体类型。

### 5.2 any：存在类型（Existential Type）

`any Protocol` 表示「任意遵循该协议的值」，具体类型在运行时确定。编译器会在堆上为其创建一个「装箱」（existential container），有额外的运行时开销：

```swift
// any Shape：可以装不同具体类型，但有运行时开销
func printArea(_ shape: any Shape) {
    print("面积：\(shape.area())")
}

printArea(Circle(radius: 3))  // 面积：28.27...
printArea(Square(side: 4))    // 面积：16.0

// 可以存入异构数组
let shapes: [any Shape] = [Circle(radius: 1), Square(side: 2), Circle(radius: 3)]
for s in shapes {
    print(s.area())
}
```

Swift 5.7 之前写 `Protocol` 作为类型时就是存在类型，5.7+ 要求显式写 `any Protocol` 以提醒开销。

### 5.3 some vs any 怎么选

| 场景 | 选择 | 原因 |
|------|------|------|
| 函数返回单一固定实现 | `some` | 编译期确定，零开销 |
| 集合里混放多种实现 | `any` | 运行时多态，必须用存在类型 |
| 性能敏感路径 | `some` | 避免装箱 |
| SwiftUI body / 泛型函数参数 | `some` | 编译器优化友好 |
| 插件系统、依赖注入 | `any` | 需要运行时灵活性 |

```swift
// 推荐：能用 some 就用 some
func preferSome() -> some Shape {
    return Square(side: 3)
}

// 必要时才用 any
var bag: [any Shape] = []
bag.append(Circle(radius: 2))
bag.append(Square(side: 5))
```

---

## 小结

本讲核心要点：

1. **泛型函数** `<T>` 用类型参数消除重复逻辑，编译器在调用点推断具体类型，零运行时开销。
2. **泛型类型**（如 `Stack<Element>`）让数据结构与元素类型解耦，一份实现服务所有类型。
3. **类型约束** `T: Comparable` / `where T: Equatable` 在保留灵活性的同时限定类型能力，编译期保证安全。
4. **associatedtype** 是协议里的泛型占位符，配合 `where C.Item == Int` 可精细约束关联类型关系。
5. **`some` vs `any`**：`some` 是编译期不透明类型（推荐优先使用）；`any` 是运行时存在类型（需要异构集合或运行时多态时使用，注意装箱开销）。

---

> **下一讲**：第10讲·错误处理
