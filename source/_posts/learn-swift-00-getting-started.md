---
title: "【Swift 从零·第00讲】起步：环境搭建与 Swift 的设计理念"
date: 2026-06-22
tags:
  - Swift
  - 语言学习
categories:
  - 技术深潜
series: learn-swift
---

> **系列导航** → [课程目录](/courses/learn-swift/)（第一讲） · 下一讲待写

---

## 引言

每一门语言都有自己的世界观。Python 相信简洁即美，JavaScript 相信一切皆动态，而 Swift 相信**安全是生产力**。这不是口号——它体现在 Swift 的每一个设计细节里：变量默认不可变、类型必须明确、可选值强迫你正视"这个值可能不存在"。

这一讲从零开始。你不需要有任何 iOS 开发经验，甚至不需要写过 Swift。我们先把环境搭起来，然后用最简单的几行代码，感受 Swift 和其他语言的不同气质。这些"气质"会贯穿整个系列——越早感受，后面越省力。

---

## 第1节：环境搭建

### 1.1 安装 Xcode

Swift 的官方开发环境是 **Xcode**，macOS 专属。打开 App Store，搜索"Xcode"，直接安装即可。Xcode 会附带：

- Swift 编译器（`swiftc`）
- Playground（交互式代码本）
- iOS/macOS 模拟器
- Instruments 性能工具

安装完成后，打开终端验证：

```bash
swift --version
```

如果输出类似 `swift-driver version: 1.x.x Apple Swift version 6.x.x`，就说明安装成功。

> **注意**：Xcode 文件较大（约 15 GB），建议在 Wi-Fi 环境下安装。如果只想快速试验 Swift 语法，也可以使用在线 Playground：[SwiftFiddle](https://swiftfiddle.com)。

### 1.2 创建第一个 Playground

Playground 是 Swift 的"草稿本"——写一行代码，立即看到结果，不需要编译整个项目。这个系列的所有代码示例都优先在 Playground 里跑。

创建步骤：

1. 打开 Xcode
2. 菜单 → **File → New → Playground...**
3. 选择 **Blank** 模板，平台选 **macOS**（本系列不涉及 UI，macOS 更轻量）
4. 命名并保存

Playground 编辑器左侧写代码，右侧实时显示每行的值。你不需要 `main()` 函数——顶层代码直接执行。

### 1.3 命令行快速验证

不想开 Xcode？终端也可以：

```bash
# 创建一个 Swift 文件
echo 'print("Hello, Swift!")' > hello.swift

# 直接运行（不需要编译步骤）
swift hello.swift
```

输出：
```
Hello, Swift!
```

---

## 第2节：Swift 的设计理念

在写第一行代码之前，值得花两分钟理解 Swift 的来历和追求——这会让你明白为什么 Swift 有时"看起来比别的语言啰嗦一点"，但其实是在替你省麻烦。

### 2.1 Swift 与 Objective-C 的关系

Swift 由苹果公司在 2014 年发布，目标是**替代 Objective-C**。Objective-C 是苹果平台的传统语言，有近 40 年历史，语法来源于 C 和 Smalltalk，看起来像这样：

```objc
// Objective-C 的方法调用风格
[NSString stringWithFormat:@"Hello, %@!", name];
```

Swift 的同等写法：

```swift
"Hello, \(name)!"
```

Swift 做到了几件 Objective-C 做不到的事：类型安全、内存安全（无需手动管理引用计数的场景）、更简洁的语法。更重要的是，**Swift 和 Objective-C 可以在同一个项目里混用**——苹果保留了几十年的 Objective-C 框架，Swift 通过桥接层直接调用，迁移成本极低。

### 2.2 Swift 的三个核心理念

苹果官方把 Swift 的设计目标概括为三点：

| 理念 | 含义 | 体现 |
|------|------|------|
| **Safe（安全）** | 消灭一整类运行时崩溃 | 可选值、强类型、默认不可变 |
| **Fast（快速）** | 性能接近 C | LLVM 编译优化，无 GC 暂停 |
| **Expressive（表达力）** | 写出来的代码像在描述意图 | 简洁语法、协议扩展、结果构建器 |

这个系列会反复回到这三个词。每次你觉得 Swift 的某个设计"有点奇怪"，往往都能从这三个维度找到解释。

---

## 第3节：常量与变量

### 3.1 let 与 var 的哲学差异

Swift 用 `let` 声明常量，用 `var` 声明变量。**官方建议：默认用 `let`，只有确实需要修改时才用 `var`。**

```swift
// 常量：声明后不能修改
let appName = "MyApp"
let maxRetries = 3

// 变量：可以重新赋值
var currentPage = 1
var isLoading = false

// 尝试修改常量 → 编译错误（不是运行时崩溃）
// appName = "OtherApp"  // error: cannot assign to value: 'appName' is a 'let' constant
```

这个设计不是为了限制你，而是让**编译器帮你发现意外修改**。当你声明 `let`，就是在告诉编译器和下一个读代码的人："这个值不会变"——编译器会监督这个承诺。

### 3.2 类型注解与类型推断

Swift 是**静态类型语言**，但大多数时候你不需要写类型，编译器会推断：

```swift
// 类型推断：编译器自动推断类型
let score = 95          // 推断为 Int
let price = 9.99        // 推断为 Double
let greeting = "Hello"  // 推断为 String
let isActive = true     // 推断为 Bool

// 类型注解：显式指定类型
let score2: Int = 95
let price2: Double = 9.99
let greeting2: String = "Hello"
let isActive2: Bool = true

// 需要注解的场景：初始值无法确定类型时
var total: Double = 0   // 如果写 var total = 0，会推断为 Int
```

何时写类型注解？一个简单原则：**当推断结果和你期望的不一致，或者代码意图需要明确声明时**。

---

## 第4节：print() 与字符串插值

### 4.1 基本输出

```swift
let name = "Swift"
let version = 6
let isAwesome = true

print(name)         // Swift
print(version)      // 6
print(isAwesome)    // true
```

`print()` 默认在末尾添加换行。如果不想换行：

```swift
print("Hello", terminator: "")
print(", World!")
// 输出：Hello, World!
```

### 4.2 字符串插值

字符串插值是 Swift 里最常用的格式化方式，用 `\(表达式)` 把任意值嵌入字符串：

```swift
let city = "Beijing"
let temperature = 28.5
let feelsLike = temperature - 2

// 基本插值
print("今天 \(city) 气温 \(temperature)°C")
// 输出：今天 Beijing 气温 28.5°C

// 插值里可以写表达式
print("体感温度约 \(feelsLike)°C，比实际低 \(temperature - feelsLike)°C")
// 输出：体感温度约 26.5°C，比实际低 2.0°C

// 插值里可以调用方法
let items = ["苹果", "香蕉", "橙子"]
print("购物车共 \(items.count) 件商品：\(items.joined(separator: "、"))")
// 输出：购物车共 3 件商品：苹果、香蕉、橙子
```

和其他语言的对比：

```swift
// Python：f"Hello, {name}!"
// JavaScript：`Hello, ${name}!`
// Swift：   "Hello, \(name)!"
```

语法略有不同，理念相同——把变量嵌入字符串字面量。

---

## 第5节：命名规范

### 5.1 Swift 的命名约定

Swift 社区对命名有很强的约定，违反不会报错，但会让代码看起来"不地道"：

| 场景 | 规范 | 示例 |
|------|------|------|
| 变量 / 常量 | `camelCase` | `userName`, `maxRetries` |
| 函数 | `camelCase` | `fetchUserData()`, `calculateTotal()` |
| 类型（类/结构体/枚举） | `PascalCase` | `UserProfile`, `NetworkError` |
| 枚举成员 | `camelCase` | `.success`, `.notFound` |
| 协议 | `PascalCase` | `Decodable`, `Hashable` |

```swift
// 正确的命名风格
let firstName = "Fengxin"
let lastName = "Hong"
var loginAttemptCount = 0

struct UserProfile {
    let id: Int
    let displayName: String
}

func formatFullName(first: String, last: String) -> String {
    return "\(first) \(last)"
}

let profile = UserProfile(id: 1, displayName: "fx")
let fullName = formatFullName(first: firstName, last: lastName)
print("用户：\(fullName)，ID：\(profile.id)")
// 输出：用户：Fengxin Hong，ID：1
```

### 5.2 为什么命名规范重要

Swift 的 API 设计指南（[Swift API Design Guidelines](https://www.swift.org/documentation/api-design-guidelines/)）有一句话：

> "Clarity at the point of use is your most important goal."
> 在使用处的清晰度是你最重要的目标。

好的命名让代码在**调用处**读起来像自然语言。这在后面学习函数参数标签时会更有体会——Swift 允许你给参数起两个名字：外部标签（调用时用）和内部标签（实现里用），专门为了让调用处读起来更流畅。

---

## 本讲小结

1. **Xcode + Playground** 是学习 Swift 的最快入口，顶层代码直接运行，无需 `main()`
2. **`let` 优先于 `var`**：Swift 的"安全"理念从不可变性开始，让编译器帮你守住承诺
3. **类型推断**让代码简洁，但 Swift 依然是静态强类型语言——类型在编译期确定，运行时不会偷偷变
4. **字符串插值** `\(expr)` 是 Swift 最常用的格式化方式，插值里可以放任意表达式
5. **命名规范**：变量/函数用 `camelCase`，类型用 `PascalCase`——不是强制，但违反会让代码"不地道"

---

> **下一讲**：第01讲 · 基础类型
