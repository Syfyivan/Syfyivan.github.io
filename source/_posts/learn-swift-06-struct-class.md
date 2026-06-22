---
title: "【Swift 从零·第06讲】struct vs class：值类型与引用类型"
date: 2026-06-22
tags:
  - Swift
  - 语言学习
categories:
  - 技术深潜
series: learn-swift
---

> **系列导航** → [课程目录](/courses/learn-swift/) · 上一讲：第05讲·函数与闭包 · 下一讲待写

---

## 引言

在大多数面向对象语言里，自定义类型只有一种选择：`class`。Swift 不一样——它给你两把锤子：`struct`（结构体）和 `class`（类）。初学者常常疑惑："它们看起来差不多，到底用哪个？"

这个问题的答案藏在**内存模型**里。`struct` 是**值类型**，赋值和传参时会复制一份独立数据；`class` 是**引用类型**，多个变量可以指向同一块内存。这个差异小到一行代码看不出来，大到决定程序的线程安全性、性能边界、甚至架构设计。

理解值类型与引用类型，是从"会写 Swift"到"写好 Swift"的第一道门槛。本讲从内存模型出发，带你看清两者的本质区别，再告诉你苹果自己是怎么选的——Swift 标准库里 95% 的类型都是 `struct`。

---

## 第1节：值类型与引用类型的内存模型

### 1.1 struct 赋值 = 复制

把一个 `struct` 赋值给另一个变量，Swift 会在栈上创建一份完整的拷贝。修改新变量不会影响原来的值。

```swift
struct Point {
    var x: Int
    var y: Int
}

var pointA = Point(x: 0, y: 0)
var pointB = pointA   // 复制一份，pointB 是独立的副本

pointB.x = 100

print("pointA.x = \(pointA.x)")  // pointA.x = 0  ← 未受影响
print("pointB.x = \(pointB.x)")  // pointB.x = 100
```

两个变量各自拥有独立的数据，改其中一个，另一个纹丝不动。

### 1.2 class 赋值 = 共享引用

`class` 实例存在堆上，变量保存的是**指向堆内存的指针**。赋值只是复制了指针，两个变量指向同一个对象。

```swift
class Box {
    var value: Int
    init(_ value: Int) { self.value = value }
}

let boxA = Box(0)
let boxB = boxA   // boxB 和 boxA 指向同一个 Box 对象

boxB.value = 100

print("boxA.value = \(boxA.value)")  // boxA.value = 100  ← 被修改了！
print("boxB.value = \(boxB.value)")  // boxB.value = 100
```

注意这里 `boxA` 和 `boxB` 都是 `let` 常量，但对象的属性依然可以修改——因为常量锁定的是"指针地址不变"，而不是"对象内容不变"。

### 1.3 函数参数的传递方式

值类型传参时也会复制，函数内部的修改不会影响调用方。

```swift
func doubleX(_ p: Point) -> Point {
    var copy = p
    copy.x *= 2
    return copy
}

var origin = Point(x: 5, y: 5)
let doubled = doubleX(origin)

print("origin.x = \(origin.x)")   // origin.x = 5  ← 不受影响
print("doubled.x = \(doubled.x)") // doubled.x = 10
```

这是 Swift 函数式风格的基础：默认情况下数据不会被意外修改，副作用被控制在最小范围。

---

## 第2节：mutating 方法

### 2.1 为什么 struct 需要 mutating

`struct` 是值类型，Swift 编译器默认假设方法不会修改 `self`。如果你想在方法里修改属性，必须显式标注 `mutating`，告诉编译器"我知道自己在做什么"。

```swift
struct Counter {
    var count: Int = 0

    // 不加 mutating 会编译报错：cannot assign to property: 'self' is immutable
    mutating func increment() {
        count += 1
    }

    mutating func reset() {
        count = 0
    }
}

var counter = Counter()
counter.increment()
counter.increment()
print("count = \(counter.count)")  // count = 2

counter.reset()
print("count after reset = \(counter.count)")  // count after reset = 0
```

### 2.2 let 变量不能调用 mutating 方法

`mutating` 方法会修改值本身，所以 `let` 声明的 `struct` 变量无法调用它——编译器会直接报错。

```swift
let fixedCounter = Counter()
// fixedCounter.increment()  // 编译错误：cannot use mutating member on immutable value
```

这个设计很合理：`let` 的承诺是"这个值不会改变"，`mutating` 方法违反了这个承诺，所以编译器直接阻止。

### 2.3 class 不需要 mutating

`class` 的方法可以直接修改属性，不需要任何标注，因为修改的是堆上的对象，和持有它的变量是否是 `let` 无关。

```swift
class MutableCounter {
    var count: Int = 0

    func increment() {  // 不需要 mutating
        count += 1
    }
}

let mc = MutableCounter()  // let 也可以修改属性
mc.increment()
mc.increment()
print("mc.count = \(mc.count)")  // mc.count = 2
```

---

## 第3节：引用相等 === vs 值相等 ==

### 3.1 === 检查是否是同一个对象

`class` 专属运算符 `===` 检查两个变量是否指向**同一块堆内存**（同一个对象实例）。

```swift
class Node {
    var label: String
    init(_ label: String) { self.label = label }
}

let nodeA = Node("root")
let nodeB = nodeA          // 同一个对象
let nodeC = Node("root")   // 不同对象，内容相同

print(nodeA === nodeB)  // true  — 同一个实例
print(nodeA === nodeC)  // false — 不同实例，即使内容相同
print(nodeA !== nodeC)  // true  — !== 是 === 的否定
```

### 3.2 == 检查值是否相等

`==` 检查内容是否相等。`struct` 遵循 `Equatable` 协议后，编译器会自动合成逐属性比较的实现。

```swift
struct Color: Equatable {
    var red: Int
    var green: Int
    var blue: Int
}

let red1 = Color(red: 255, green: 0, blue: 0)
let red2 = Color(red: 255, green: 0, blue: 0)

print(red1 == red2)   // true  — 内容相同
// red1 === red2       // 编译错误：struct 没有 ===
```

`struct` 没有 `===`，因为它根本没有引用的概念——每个变量持有独立的数据，"是否是同一个实例"这个问题对值类型没有意义。

---

## 第4节：Copy-on-Write 优化

### 4.1 标准库的 Array 和 Dictionary 都是 struct

Swift 标准库的 `Array`、`Dictionary`、`String` 全部是 `struct`（值类型）。你可能会担心：每次赋值都复制一个 1000 元素的数组，性能不是很差吗？

Swift 用 **Copy-on-Write（COW，写时复制）** 解决这个问题：赋值时不立刻复制，只有在真正**写入**时才复制。

```swift
var original = Array(1...1000)
var copy = original   // 此时不复制，两者共享同一块内存

// 验证方式：检查 copy 是否与 original 指向同一缓冲区
// （Swift 标准库内部用 isKnownUniquelyReferenced 实现 COW）

copy.append(1001)     // 这里触发真正的复制

print("original.count = \(original.count)")  // 1000
print("copy.count = \(copy.count)")          // 1001
```

### 4.2 自定义 COW 结构

理解 COW 的原理对于写高性能数据结构很有帮助。Swift 提供了 `isKnownUniquelyReferenced` 函数，让你在自定义类型里实现同样的优化。

```swift
// 用 class 作为内部存储，用 struct 对外提供值类型语义
final class _Storage {
    var items: [Int]
    init(_ items: [Int]) { self.items = items }
    func copy() -> _Storage { _Storage(items) }
}

struct SmartArray {
    private var storage: _Storage

    init(_ items: [Int] = []) {
        storage = _Storage(items)
    }

    // 写操作前检查是否唯一持有，不是就复制
    private mutating func ensureUnique() {
        if !isKnownUniquelyReferenced(&storage) {
            storage = storage.copy()
        }
    }

    mutating func append(_ item: Int) {
        ensureUnique()
        storage.items.append(item)
    }

    var count: Int { storage.items.count }
}

var arr1 = SmartArray([1, 2, 3])
var arr2 = arr1         // 共享内部 storage，不复制

arr2.append(4)          // 触发 ensureUnique，复制后再追加

print("arr1.count = \(arr1.count)")  // 3
print("arr2.count = \(arr2.count)")  // 4
```

---

## 第5节：何时用 struct，何时用 class

### 5.1 优先选择 struct

苹果官方建议：**默认使用 struct**。以下场景 struct 是更好的选择：

- **无继承需求**：struct 不能被继承（但可以遵循协议）
- **线程安全**：值类型不共享状态，天然避免数据竞争
- **数据模型**：`User`、`Product`、`Point`、`Color` 等表示纯数据的类型
- **函数式风格**：不可变数据流，副作用可控

```swift
// 典型的 struct 使用场景
struct UserProfile {
    let id: String
    var name: String
    var age: Int
}

struct Rectangle {
    var width: Double
    var height: Double

    var area: Double { width * height }

    mutating func scale(by factor: Double) {
        width *= factor
        height *= factor
    }
}

var rect = Rectangle(width: 10, height: 5)
print("area = \(rect.area)")  // area = 50.0

rect.scale(by: 2)
print("area after scale = \(rect.area)")  // area after scale = 200.0
```

### 5.2 必须用 class 的场景

以下场景只能用 `class`：

- **需要引用语义**：多个地方需要共享并修改同一个实例（如 ViewController、ViewModel 持有同一个 Model）
- **需要继承**：`class` 支持单继承和多态
- **与 Objective-C 互操作**：`@objc` 标注、继承自 `NSObject` 等场景必须用 `class`
- **生命周期管理**：需要 `deinit` 析构函数在对象销毁时执行清理逻辑

```swift
// 典型的 class 使用场景：共享的视图状态
class AppState {
    var isLoggedIn: Bool = false
    var currentUserId: String? = nil

    // class 可以有 deinit
    deinit {
        print("AppState 被销毁")
    }
}

// 多个地方持有同一个状态对象
let globalState = AppState()
let ref1 = globalState
let ref2 = globalState

ref1.isLoggedIn = true
print("ref2.isLoggedIn = \(ref2.isLoggedIn)")  // true — 共享修改
```

### 5.3 final class：阻止继承

如果你确定一个 `class` 不需要被继承，加上 `final` 关键字。这不仅是设计意图的表达，还能让编译器做更多优化（方法分派从动态变为静态）。

```swift
final class NetworkManager {
    static let shared = NetworkManager()
    private init() {}  // 防止外部实例化

    func fetch(url: String) {
        // 网络请求逻辑
        print("Fetching: \(url)")
    }
}

// class DatabaseManager: NetworkManager {}  // 编译错误：cannot inherit from final class

NetworkManager.shared.fetch(url: "https://api.example.com/users")
```

`final` 也可以用在普通 `class` 的单个方法或属性上，只阻止那一个成员被子类覆盖。

---

## 小结

本讲核心要点：

1. **值类型 vs 引用类型**：`struct` 赋值/传参时复制独立副本；`class` 赋值时共享引用，多个变量指向同一对象。
2. **mutating 方法**：修改 `struct` 属性的方法必须标注 `mutating`；`let` 变量无法调用 `mutating` 方法。
3. **=== 检查引用相等**：`===` 是 `class` 专属，检查两个变量是否指向同一实例；`==` 检查值是否相等。
4. **Copy-on-Write**：Swift 标准库的 `Array`、`Dictionary`、`String` 都是 `struct`，通过 COW 优化避免不必要的复制开销。
5. **选型原则**：默认用 `struct`；需要引用语义、继承或 ObjC 互操作时才用 `class`；确定不需要被继承的 `class` 加 `final`。

---

> **下一讲**：第07讲·enum — 枚举与关联值，Swift 最强大的类型之一
