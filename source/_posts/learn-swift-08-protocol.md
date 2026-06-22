---
title: "【Swift 从零·第08讲】Protocol：面向协议编程（POP）"
date: 2026-06-22
tags:
  - Swift
  - 语言学习
categories:
  - 技术深潜
series: learn-swift
---

> **系列导航** → [课程目录](/courses/learn-swift/) · 上一讲：第07讲·enum · 下一讲待写

## 引言

如果你学过 Java 或 C#，你会觉得"接口"（interface）是一个限制性的规范工具——告诉别人"你必须实现这些方法"。Swift 的 Protocol 在表面上看起来差不多，但实际上它更强大：你可以给协议加上**默认实现**，让所有遵循它的类型不用重复写同样的代码，这就是"面向协议编程"（Protocol-Oriented Programming，POP）。

Apple 在 2015 年的 WWDC 上提出了一个大胆的口号：**Swift is a Protocol-Oriented Language**。这不是说要废弃类和继承，而是说在 Swift 里，协议扩展能以极低的耦合度实现代码复用——struct 和 enum 无法继承，但它们都能遵循任意数量的协议，获得协议扩展带来的能力。这正是 Swift 设计的精髓之一。

---

## 第1节：协议的基本定义与遵循

### 1.1 定义协议

协议用 `protocol` 关键字定义，里面声明属性要求和方法要求，但**不提供实现**。属性必须注明读写意图：

```swift
protocol Drawable {
    var description: String { get }       // 只读属性
    var color: String { get set }         // 可读写属性
    func draw()                           // 方法要求
    func area() -> Double                 // 带返回值的方法
}
```

注意：`{ get }` 不代表底层一定是常量，遵循者可以用 `var` 实现，但不能用 `let`（因为 `let` 不能满足 `{ get set }`）。

### 1.2 struct、class、enum 都可以遵循协议

Swift 协议没有任何类型限制，三种主要类型都可以遵循：

```swift
struct Circle: Drawable {
    var color: String
    var radius: Double

    var description: String {
        "Circle(radius: \(radius), color: \(color))"
    }

    func draw() {
        print("Drawing \(description)")
    }

    func area() -> Double {
        Double.pi * radius * radius
    }
}

class Rectangle: Drawable {
    var color: String
    var width: Double
    var height: Double

    init(color: String, width: Double, height: Double) {
        self.color = color
        self.width = width
        self.height = height
    }

    var description: String {
        "Rectangle(\(width)x\(height), color: \(color))"
    }

    func draw() {
        print("Drawing \(description)")
    }

    func area() -> Double {
        width * height
    }
}

// 用协议类型接收不同具体类型
let shapes: [any Drawable] = [
    Circle(color: "red", radius: 5.0),
    Rectangle(color: "blue", width: 4.0, height: 6.0)
]

for shape in shapes {
    shape.draw()
    print("  Area: \(String(format: "%.2f", shape.area()))")
}
// Drawing Circle(radius: 5.0, color: red)
//   Area: 78.54
// Drawing Rectangle(4.0x6.0, color: blue)
//   Area: 24.00
```

---

## 第2节：协议扩展——POP 的精髓

### 2.1 用协议扩展提供默认实现

这是 POP 最核心的思路：在 `extension` 里给协议方法写好默认实现，遵循者可以选择**覆盖或直接复用**，完全不需要继承链。

```swift
protocol Greetable {
    var name: String { get }
    func greet() -> String
}

// 协议扩展提供默认实现
extension Greetable {
    func greet() -> String {
        "Hello, I'm \(name)!"
    }

    // 额外方法，遵循者自动获得
    func farewell() -> String {
        "Goodbye from \(name)!"
    }
}

struct Person: Greetable {
    var name: String
    // 不需要实现 greet()，使用默认版本
}

struct Robot: Greetable {
    var name: String
    // 覆盖默认实现
    func greet() -> String {
        "BEEP BOOP. UNIT \(name) ONLINE."
    }
}

let alice = Person(name: "Alice")
let r2d2 = Robot(name: "R2D2")

print(alice.greet())      // Hello, I'm Alice!
print(alice.farewell())   // Goodbye from Alice!
print(r2d2.greet())       // BEEP BOOP. UNIT R2D2 ONLINE.
print(r2d2.farewell())    // Goodbye from R2D2!
```

### 2.2 给 Collection 添加安全下标

标准库的 `Collection` 本身就是一个协议。我们可以给它扩展一个安全下标，避免越界崩溃：

```swift
extension Collection {
    /// 安全下标：index 越界时返回 nil，而不是崩溃
    subscript(safe index: Index) -> Element? {
        indices.contains(index) ? self[index] : nil
    }
}

let fruits = ["apple", "banana", "cherry"]

print(fruits[safe: 1] ?? "nil")   // banana
print(fruits[safe: 9] ?? "nil")   // nil  ← 不会崩溃

// 对所有 Collection 都生效，包括 String 的字符集合
let greeting = "Hello"
let chars = Array(greeting)
print(chars[safe: 0] ?? "?")      // H
print(chars[safe: 99] ?? "?")     // ?
```

这个扩展一行代码，让所有遵循 `Collection` 的类型——`Array`、`String`、`Dictionary` 等——都自动获得了安全下标能力。

---

## 第3节：标准库内置协议

### 3.1 Equatable 与 Comparable

`Equatable` 让类型支持 `==` 比较；`Comparable` 在此基础上支持 `<`、`>`、`<=`、`>=`。

对于 struct，只要所有存储属性都遵循 `Equatable`，编译器会**自动合成**实现，不需要手写：

```swift
struct Point: Equatable, Comparable {
    var x: Double
    var y: Double

    // Equatable 自动合成，无需手写 ==
    // Comparable 只需实现 <，其余比较运算符自动推导
    static func < (lhs: Point, rhs: Point) -> Bool {
        // 按距离原点的距离比较
        let lhsDist = lhs.x * lhs.x + lhs.y * lhs.y
        let rhsDist = rhs.x * rhs.x + rhs.y * rhs.y
        return lhsDist < rhsDist
    }
}

let p1 = Point(x: 3, y: 4)  // 距离 5
let p2 = Point(x: 1, y: 1)  // 距离 √2
let p3 = Point(x: 3, y: 4)  // 距离 5

print(p1 == p3)   // true  ← Equatable 自动合成
print(p2 < p1)    // true
print(p1 > p2)    // true  ← 自动推导

let points = [p1, p2, Point(x: 0, y: 1)]
print(points.sorted())
// [Point(x: 0.0, y: 1.0), Point(x: 1.0, y: 1.0), Point(x: 3.0, y: 4.0)]
```

### 3.2 Hashable——用于 Set 和 Dictionary 键

`Hashable` 是 `Equatable` 的超集，让类型可以作为 `Dictionary` 的键或放进 `Set`。同样支持自动合成：

```swift
struct Color: Hashable {
    var red: Int
    var green: Int
    var blue: Int
    // Hashable 和 Equatable 均自动合成
}

var colorNames: [Color: String] = [:]
colorNames[Color(red: 255, green: 0, blue: 0)] = "Red"
colorNames[Color(red: 0, green: 255, blue: 0)] = "Green"

print(colorNames[Color(red: 255, green: 0, blue: 0)] ?? "unknown")  // Red

var palette: Set<Color> = [
    Color(red: 255, green: 0, blue: 0),
    Color(red: 0, green: 0, blue: 255),
    Color(red: 255, green: 0, blue: 0)   // 重复，会被去掉
]
print(palette.count)  // 2
```

---

## 第4节：Codable——自动 JSON 编解码

### 4.1 Codable = Encodable + Decodable

`Codable` 是两个协议的别名（`typealias Codable = Encodable & Decodable`）。当 struct 的所有存储属性都是 `Codable` 类型时，编译器会自动合成编解码逻辑，无需手写任何映射代码：

```swift
import Foundation

struct User: Codable {
    var id: Int
    var name: String
    var email: String
    var isActive: Bool
}

// --- 编码：Swift → JSON ---
let user = User(id: 42, name: "Alice", email: "alice@example.com", isActive: true)

let encoder = JSONEncoder()
encoder.outputFormatting = .prettyPrinted

if let jsonData = try? encoder.encode(user),
   let jsonString = String(data: jsonData, encoding: .utf8) {
    print(jsonString)
}
// {
//   "id" : 42,
//   "name" : "Alice",
//   "email" : "alice@example.com",
//   "isActive" : true
// }

// --- 解码：JSON → Swift ---
let jsonInput = """
{
    "id": 7,
    "name": "Bob",
    "email": "bob@example.com",
    "isActive": false
}
"""

let decoder = JSONDecoder()
if let data = jsonInput.data(using: .utf8),
   let bob = try? decoder.decode(User.self, from: data) {
    print("Decoded: \(bob.name), active: \(bob.isActive)")
    // Decoded: Bob, active: false
}
```

### 4.2 自定义键名映射

当 JSON 的字段名和 Swift 属性名不一致时，用 `CodingKeys` 枚举做映射：

```swift
struct Article: Codable {
    var title: String
    var authorName: String   // 对应 JSON 中的 "author_name"
    var publishedAt: String  // 对应 JSON 中的 "published_at"

    enum CodingKeys: String, CodingKey {
        case title
        case authorName = "author_name"
        case publishedAt = "published_at"
    }
}

let articleJson = """
{"title": "POP in Swift", "author_name": "Alice", "published_at": "2026-06-22"}
"""

if let data = articleJson.data(using: .utf8),
   let article = try? JSONDecoder().decode(Article.self, from: data) {
    print("\(article.title) by \(article.authorName)")
    // POP in Swift by Alice
}
```

---

## 第5节：协议组合与高级用法

### 5.1 协议组合

一个参数可以要求类型同时遵循多个协议，用 `&` 组合：

```swift
protocol Named {
    var name: String { get }
}

protocol Aged {
    var age: Int { get }
}

// 协议组合类型：同时是 Named 且 Aged
func introduce(_ entity: Named & Aged) {
    print("Name: \(entity.name), Age: \(entity.age)")
}

struct Student: Named, Aged {
    var name: String
    var age: Int
    var grade: Int
}

struct Teacher: Named, Aged, Codable {
    var name: String
    var age: Int
    var subject: String
}

introduce(Student(name: "Tom", age: 18, grade: 3))
introduce(Teacher(name: "Ms. Chen", age: 35, subject: "Math"))
// Name: Tom, Age: 18
// Name: Ms. Chen, Age: 35
```

### 5.2 综合示例：协议驱动的绘图系统

把本讲学到的所有概念整合起来：

```swift
import Foundation

// 协议定义
protocol Shape: CustomStringConvertible {
    var color: String { get set }
    func area() -> Double
    func perimeter() -> Double
}

// 协议扩展：提供 description 的默认实现
extension Shape {
    var description: String {
        "\(type(of: self))(color: \(color), area: \(String(format: "%.2f", area())))"
    }

    // 面积是否大于某个阈值
    func isLargerThan(_ threshold: Double) -> Bool {
        area() > threshold
    }
}

// 两个具体类型
struct Triangle: Shape, Equatable {
    var color: String
    var base: Double
    var height: Double

    func area() -> Double { 0.5 * base * height }
    func perimeter() -> Double { base * 2 + height }  // 简化计算
}

struct Square: Shape {
    var color: String
    var side: Double

    func area() -> Double { side * side }
    func perimeter() -> Double { side * 4 }
}

// 使用
var shapes: [any Shape] = [
    Triangle(color: "green", base: 6, height: 4),
    Square(color: "purple", side: 5)
]

for shape in shapes {
    print(shape)
    print("  Perimeter: \(shape.perimeter())")
    print("  Large? \(shape.isLargerThan(20))")
}
// Triangle(color: green, area: 12.00)
//   Perimeter: 16.0
//   Large? false
// Square(color: purple, area: 25.00)
//   Perimeter: 20.0
//   Large? true

// Triangle 遵循 Equatable，可以直接比较
let t1 = Triangle(color: "red", base: 3, height: 4)
let t2 = Triangle(color: "red", base: 3, height: 4)
print(t1 == t2)  // true
```

---

## 小结

本讲的核心要点：

1. **协议定义规范**：属性必须标注 `{ get }` 或 `{ get set }`，方法只写签名不写实现。
2. **三种类型都能遵循**：`class`、`struct`、`enum` 均可遵循任意协议，突破了继承只属于 class 的限制。
3. **协议扩展是 POP 核心**：在 `extension` 里为协议方法提供默认实现，所有遵循者自动获得，无需继承即可共享代码。
4. **标准协议自动合成**：`Equatable`、`Hashable`、`Codable` 对于满足条件的 struct，编译器会自动合成实现，极大减少样板代码。
5. **协议组合用 `&`**：`Named & Aged` 表示同时遵循两个协议，比继承更灵活、耦合度更低。

---

> **下一讲**：第09讲·泛型
