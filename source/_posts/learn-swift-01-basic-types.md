---
title: "【Swift 从零·第01讲】基础类型：数字、字符串与元组"
date: 2026-06-22
tags:
  - Swift
  - 语言学习
categories:
  - 技术深潜
series: learn-swift
---

> **系列导航** → [课程目录](/courses/learn-swift/) · 上一讲：第00讲·起步 · 下一讲待写

## 引言

如果你刚刚安装好 Xcode，打开了第一个 Playground 文件，发现 Swift 连 `int x = 3;` 都不让写，你可能会有点懵——变量怎么声明？类型怎么标注？数字和字符串有什么坑？

这讲就从最基础的地方开始：Swift 的内建类型。选择从这里起步，不是因为它简单，而是因为 Swift 的类型系统有几个设计理念贯穿始终：**显式优于隐式**、**安全优于便利**、**Unicode 正确优于字节高效**。理解这些理念，后面遇到任何"为什么要这么麻烦"的问题，答案往往都藏在这里。

---

## 第1节：整数类型

### 1.1 Int 还是 UInt？

Swift 提供了多种整数类型：`Int8`、`Int16`、`Int32`、`Int64`，以及对应的无符号版本 `UInt8` 至 `UInt64`。日常开发中，**绝大多数情况直接用 `Int`**。

`Int` 在 64 位平台上等同于 `Int64`，可以存放从 `-9,223,372,036,854,775,808` 到 `9,223,372,036,854,775,807` 的值，日常业务几乎不会越界。官方也明确建议：除非你有明确的平台或协议约束，否则不要刻意选 `UInt`——混用整数类型会引入大量强制转换，代码反而更乱。

```swift
// 整数字面量可以加下划线提高可读性
let population = 1_400_000_000
let maxInt = Int.max      // 9223372036854775807
let minInt = Int.min      // -9223372036854775808

print("Int 最大值：\(maxInt)")
print("人口：\(population)")
```

### 1.2 溢出检测

Swift 默认对整数溢出做**硬崩溃**（trap），这是一个故意的安全设计：宁可崩溃，也不让你拿到一个悄悄绕回来的错误值。

```swift
// 下面这行在 Playground 里会让程序崩溃，先注释掉感受一下
// let overflow: Int8 = Int8.max + 1  // 崩溃：integer overflow

// 如果你明确需要溢出行为，使用溢出运算符 &+
let wrapped: Int8 = Int8.max &+ 1   // -128，环绕行为
print("溢出环绕结果：\(wrapped)")

// 实际场景：用 overflow 运算符做哈希或位运算
let a: UInt32 = 0xFFFF_FFFF
let b: UInt32 = a &+ 1   // 0，不崩溃
print("UInt32 溢出环绕：\(b)")
```

### 1.3 数字字面量的进制写法

```swift
let decimal  = 42          // 十进制
let binary   = 0b0010_1010 // 二进制，42
let octal    = 0o52        // 八进制，42
let hex      = 0x2A        // 十六进制，42

print(decimal == binary && binary == octal && octal == hex)  // true
```

---

## 第2节：浮点数类型

### 2.1 Double 优先，Float 按需选

Swift 有两种浮点类型：`Double`（64 位，约 15 位有效数字）和 `Float`（32 位，约 6 位有效数字）。**优先用 `Double`**——精度更高，而且 Swift 的字面量推断默认就是 `Double`，不用额外标注。

```swift
let price = 9.99          // 推断为 Double
let ratio: Float = 0.5    // 明确要 Float

// 科学计数法
let lightSpeed = 2.998e8   // 2.998 × 10^8，单位 m/s
let electron   = 1.6e-19   // 基本电荷，单位 C

print("光速：\(lightSpeed) m/s")
```

### 2.2 类型转换必须显式

这是 Swift 新手最常撞的墙。Swift **不做任何隐式数值类型转换**，哪怕是 `Int` 和 `Double` 相加都会报错。你必须手动转换。

```swift
let integer = 42
let floating = 3.14

// let sum = integer + floating  // 编译错误！类型不匹配

// 正确做法：显式转换
let sum1 = Double(integer) + floating   // 45.14
let sum2 = integer + Int(floating)      // 45（小数部分截断，不四舍五入）

print("Double 相加：\(sum1)")
print("Int 截断：\(sum2)")

// Int(Double) 是截断，不是四舍五入
print(Int(3.9))   // 3，不是 4
print(Int(-3.9))  // -3，不是 -4（向零截断）
```

---

## 第3节：字符串与 Unicode

### 3.1 String.count 是字符数，不是字节数

Swift 的 `String` 从设计之初就把 Unicode 正确性放在首位。`count` 属性返回的是**用户感知字符（extended grapheme cluster）的数量**，而不是字节数，也不是 UTF-16 码元数。

```swift
let greeting = "Hello, 世界！"
print("字符数：\(greeting.count)")          // 10
print("UTF-8 字节数：\(greeting.utf8.count)") // 19（中文字符各占3字节）
print("UTF-16 码元数：\(greeting.utf16.count)") // 12

// Emoji 的坑：一个 Emoji 可能由多个码点组成
let flag = "🇨🇳"   // 中国国旗，由两个区域指示符码点组成
print("国旗字符数：\(flag.count)")          // 1（用户看到1个字符）
print("国旗 UTF-16 码元数：\(flag.utf16.count)") // 4（底层4个码元）

let family = "👨‍👩‍👧‍👦"  // 家庭 Emoji，由多个码点 + ZWJ 连接
print("家庭 Emoji 字符数：\(family.count)")  // 1
```

### 3.2 字符串插值

Swift 的字符串插值非常强大，`\(...)` 里可以放任意表达式：

```swift
let name = "Swift"
let version = 6
let pi = 3.14159

// 基本插值
print("欢迎来到 \(name) \(version) 的世界")

// 表达式插值
print("圆周率约为 \(pi)，四舍五入到小数点后2位：\(String(format: "%.2f", pi))")

// 条件表达式
let score = 85
print("成绩：\(score >= 60 ? "及格" : "不及格")")

// 计算插值
let items = ["苹果", "香蕉", "橙子"]
print("共有 \(items.count) 种水果：\(items.joined(separator: "、"))")
```

### 3.3 多行字符串

多行字符串用三引号 `"""..."""` 表示。**关键规则：结束 `"""` 的缩进决定了每行内容要删除多少前导空白**。

```swift
// 结束 """ 与内容对齐，内容不缩进
let poem = """
    白日依山尽，
    黄河入海流。
    欲穷千里目，
    更上一层楼。
    """
// 结束 """ 缩进了4格，所以每行会删掉4格前导空格
print(poem)

// 在函数/结构中使用，自然缩进不影响内容
func getJson() -> String {
    let key = "name"
    let value = "Swift"
    return """
        {
            "\(key)": "\(value)",
            "version": 6
        }
        """
}
print(getJson())
```

---

## 第4节：元组

### 4.1 定义与访问

元组（Tuple）是 Swift 中最轻量的复合类型，不需要定义新的类或结构体，直接把几个值组合在一起：

```swift
// 定义元组
let point = (3, 4)          // 类型推断为 (Int, Int)
let person = ("Alice", 28)  // 类型推断为 (String, Int)

// 用下标访问
print("x = \(point.0), y = \(point.1)")
print("姓名：\(person.0)，年龄：\(person.1)")

// 解构（分解）元组
let (x, y) = point
print("解构后 x=\(x), y=\(y)")

// 忽略不需要的元素用 _
let (theName, _) = person
print("只要姓名：\(theName)")
```

### 4.2 命名元组

给元组的每个元素命名，代码可读性大幅提升：

```swift
// 命名元组
let coordinate = (x: 10, y: 20, z: 0)
print("坐标：(\(coordinate.x), \(coordinate.y), \(coordinate.z))")

// HTTP 响应示例
let response = (statusCode: 200, message: "OK", body: "Hello World")
print("状态码：\(response.statusCode)，消息：\(response.message)")

// 命名元组同样可以解构
let (code, msg, _) = response
print("解构：\(code) \(msg)")
```

### 4.3 元组作为轻量返回值

元组最实用的场景是让函数**同时返回多个值**，省去为此专门定义一个结构体：

```swift
// 返回商和余数
func divide(_ a: Int, by b: Int) -> (quotient: Int, remainder: Int) {
    return (a / b, a % b)
}

let result = divide(17, by: 5)
print("17 ÷ 5 = \(result.quotient) 余 \(result.remainder)")

// 返回成功/失败信息
func parseAge(_ input: String) -> (success: Bool, age: Int, error: String) {
    guard let age = Int(input), age > 0, age < 150 else {
        return (false, 0, "无效的年龄：\(input)")
    }
    return (true, age, "")
}

let r1 = parseAge("25")
let r2 = parseAge("abc")

if r1.success {
    print("解析成功，年龄：\(r1.age)")
}
print("解析失败：\(r2.error)")
```

---

## 第5节：类型推断与类型标注

### 5.1 让编译器推断

Swift 有强大的类型推断，大多数情况下不需要写类型标注：

```swift
let message = "Hello"      // 推断为 String
let count = 42             // 推断为 Int
let ratio = 0.618          // 推断为 Double
let isReady = true         // 推断为 Bool

// 当推断结果不符合你的需求时，显式标注
let small: Float = 0.5     // 明确要 Float，不要 Double
let byte: UInt8 = 255      // 明确范围
```

### 5.2 类型是编译期信息

在 Swift 里，类型标注（`: TypeName`）只在源码中存在，编译后类型信息被编译器用来做检查和优化，运行时不需要类型注解字符串本身。这和某些动态语言（如 Python 的类型注解可在运行时读取）不同。

```swift
// typealias 给类型起别名，提升可读性
typealias UserId = Int
typealias Score = Double

let userId: UserId = 10086
let score: Score = 98.5

// 别名和原类型完全互通，没有运行时开销
let rawId: Int = userId   // 完全合法
```

---

## 小结

本讲涵盖了 Swift 基础类型的核心知识，记住这几个要点：

1. **整数优先用 `Int`**：除非有明确的平台约束或位宽需求，不要刻意用 `UInt` 或带位宽的类型；
2. **浮点优先用 `Double`**：精度更高，也是字面量的默认推断类型；
3. **类型转换必须显式**：`Int(3.14)` 截断小数，`Double(42)` 拓宽精度，没有任何隐式转换；
4. **`String.count` 计字符，不计字节**：Swift 字符串天然 Unicode 安全，但处理字节长度要用 `.utf8.count`；
5. **元组是轻量复合值**：适合函数多返回值场景，命名元组让代码更具可读性。

---

> **下一讲**：[第02讲·Optional：Swift 的空值安全哲学](/posts/learn-swift-02-optional/)
