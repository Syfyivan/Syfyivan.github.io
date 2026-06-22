---
title: "【Swift 从零·第04讲】控制流：if、switch 模式匹配与 for-in"
date: 2026-06-22
tags:
  - Swift
  - 语言学习
categories:
  - 技术深潜
series: learn-swift
---

> **系列导航** → [课程目录](/courses/learn-swift/) · 上一讲：第03讲·集合类型 · 下一讲待写

## 引言

控制流是程序的骨架。没有分支和循环，代码就是一条直线，无法应对任何现实世界的复杂性。Swift 的控制流语法在熟悉的 if/for/while 基础上做了几处精心设计：去掉了括号的视觉噪音，用 `switch` 的穷举机制把「漏掉某个 case」这类错误拦截在编译期，再加上强大的模式匹配，让条件判断能直接解构数据。

如果你从 JavaScript 或 Python 转过来，会发现 Swift 的 `switch` 和你印象中的完全不同——它更像是数学里的「分情况讨论」，而不只是 `if-else` 的缩写。本讲我们从最简单的 if 出发，一路走到嵌套循环的标签跳转。

---

## 第1节：if / else 与条件判断

### 1.1 去掉括号，加上花括号

Swift 的 `if` 条件不需要括号，但花括号是强制的——就算只有一行代码也不能省略。这个设计消除了一整类「悬空 else」的 bug。

```swift
let temperature = 28

if temperature > 35 {
    print("高温预警")
} else if temperature > 25 {
    print("舒适，适合出门")
} else {
    print("有点凉，带件外套")
}
// 输出：舒适，适合出门
```

### 1.2 可选值解包中的 if let

`if let` 是 Swift 处理可选值的核心手法，它同时完成「判断是否为 nil」和「绑定非 nil 值」两件事：

```swift
let rawInput: String? = "42"

if let text = rawInput, let number = Int(text) {
    print("解析成功：\(number * 2)")
} else {
    print("解析失败")
}
// 输出：解析成功：84
```

多个条件用逗号连接，任意一个为 false 或 nil 就整体失败，比嵌套 if 清晰很多。

---

## 第2节：switch 与模式匹配

### 2.1 穷举与编译器保障

Swift 的 `switch` 必须覆盖所有可能的情况，否则编译报错。对枚举而言，这意味着你不可能漏掉某个 case——编译器会帮你检查：

```swift
enum Direction {
    case north, south, east, west
}

let heading = Direction.north

switch heading {
case .north:
    print("向北走")
case .south:
    print("向南走")
case .east:
    print("向东走")
case .west:
    print("向西走")
}
// 不需要 default，因为已经穷举了所有 case
```

如果以后给 `Direction` 加了新方向，这个 `switch` 立刻报编译错误，强迫你更新处理逻辑。这是 Swift 枚举比字符串常量安全得多的核心原因。

### 2.2 值绑定与 where 条件

`case let` 可以把匹配到的值绑定为常量，`where` 子句进一步过滤：

```swift
let score = 87

switch score {
case let s where s >= 90:
    print("优秀，分数：\(s)")
case let s where s >= 75:
    print("良好，分数：\(s)")
case let s where s >= 60:
    print("及格，分数：\(s)")
default:
    print("不及格")
}
// 输出：良好，分数：87
```

### 2.3 匹配 HTTP 状态码（完整示例）

下面是一个匹配 HTTP 状态码的实用示例，综合展示区间匹配、元组匹配和值绑定：

```swift
// 匹配 HTTP 状态码
func describe(statusCode: Int) -> String {
    switch statusCode {
    case 200:
        return "OK - 请求成功"
    case 201:
        return "Created - 资源已创建"
    case 204:
        return "No Content - 成功但无响应体"
    case 301, 302:
        return "重定向"
    case 400:
        return "Bad Request - 客户端错误"
    case 401:
        return "Unauthorized - 需要登录"
    case 403:
        return "Forbidden - 无权限"
    case 404:
        return "Not Found - 资源不存在"
    case 500...599:
        return "服务器错误，状态码：\(statusCode)"
    case let code where code >= 100 && code < 200:
        return "信息性响应，状态码：\(code)"
    default:
        return "未知状态码：\(statusCode)"
    }
}

print(describe(statusCode: 200))   // OK - 请求成功
print(describe(statusCode: 404))   // Not Found - 资源不存在
print(describe(statusCode: 503))   // 服务器错误，状态码：503
```

### 2.4 元组的 switch 匹配

`switch` 可以直接匹配元组，每个位置独立匹配，`_` 表示忽略该位置：

```swift
let point = (x: 3, y: 0)

switch point {
case (0, 0):
    print("原点")
case (let x, 0):
    print("在 X 轴上，x = \(x)")
case (0, let y):
    print("在 Y 轴上，y = \(y)")
case (let x, let y) where x == y:
    print("在对角线上，x = y = \(x)")
case (let x, let y):
    print("普通点 (\(x), \(y))")
}
// 输出：在 X 轴上，x = 3
```

---

## 第3节：for-in 与区间

### 3.1 闭区间与半开区间

Swift 提供两种区间运算符：

- `1...10`：**闭区间**，包含 1 和 10，共 10 个数
- `1..<10`：**半开区间**，包含 1 但不包含 10，共 9 个数

```swift
// 闭区间：1 到 5
for i in 1...5 {
    print(i, terminator: " ")
}
// 输出：1 2 3 4 5

print()

// 半开区间：常用于遍历数组下标
let fruits = ["苹果", "香蕉", "橙子"]
for i in 0..<fruits.count {
    print("\(i): \(fruits[i])")
}
// 输出：
// 0: 苹果
// 1: 香蕉
// 2: 橙子
```

实际遍历数组时更推荐直接遍历元素，或用 `enumerated()` 同时获取下标和值：

```swift
for (index, fruit) in fruits.enumerated() {
    print("\(index + 1). \(fruit)")
}
```

### 3.2 stride 自定义步长

当你需要按特定步长遍历时，`stride(from:to:by:)` 是正确工具。用 stride 遍历偶数：

```swift
// stride(from:to:by:) 不包含终点（类似半开区间）
print("偶数（0 到 10）：", terminator: "")
for even in stride(from: 0, to: 11, by: 2) {
    print(even, terminator: " ")
}
// 输出：偶数（0 到 10）：0 2 4 6 8 10

print()

// 倒序遍历
print("倒数：", terminator: "")
for i in stride(from: 10, through: 1, by: -2) {
    print(i, terminator: " ")
}
// 输出：倒数：10 8 6 4 2
// through 版本：stride(from:through:by:) 包含终点
```

### 3.3 遍历字典和集合

字典遍历的顺序是不确定的，每次可能不同：

```swift
let capitals = ["中国": "北京", "日本": "东京", "法国": "巴黎"]

for (country, capital) in capitals {
    print("\(country) 的首都是 \(capital)")
}
// 顺序不固定

// 遍历集合
let primes: Set = [2, 3, 5, 7, 11]
for prime in primes.sorted() {
    print(prime, terminator: " ")
}
// 输出：2 3 5 7 11（sorted 后有序）
```

---

## 第4节：while 与 repeat-while

### 4.1 while：先判断后执行

```swift
var countdown = 3

while countdown > 0 {
    print("倒计时：\(countdown)")
    countdown -= 1
}
print("发射！")
// 输出：
// 倒计时：3
// 倒计时：2
// 倒计时：1
// 发射！
```

### 4.2 repeat-while：先执行后判断

等价于其他语言的 `do-while`，循环体至少执行一次：

```swift
var dice = 0

repeat {
    dice = Int.random(in: 1...6)
    print("掷骰子：\(dice)")
} while dice != 6

print("终于掷出了 6！")
// 循环体至少执行一次，直到掷出 6
```

---

## 第5节：标签跳转（labeled break/continue）

### 5.1 为什么需要标签

在嵌套循环中，`break` 只能跳出**最内层**的循环。如果你想从两层甚至三层循环中一次性退出，就需要给外层循环打上标签：

```swift
// labeled break 退出双层循环
let matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]

let target = 5
var found = false

outerLoop: for row in matrix {
    for element in row {
        if element == target {
            print("找到目标值 \(target)")
            found = true
            break outerLoop   // 直接跳出外层循环
        }
    }
}

if !found {
    print("未找到 \(target)")
}
// 输出：找到目标值 5
```

### 5.2 labeled continue

`continue` 也可以加标签，跳过外层循环的当前迭代：

```swift
// 跳过外层循环中满足条件的整行
outerLoop: for i in 1...3 {
    for j in 1...3 {
        if j == 2 {
            print("跳过 i=\(i) 的剩余内层")
            continue outerLoop  // 跳到外层循环的下一次迭代
        }
        print("(\(i), \(j))")
    }
}
// 输出：
// (1, 1)
// 跳过 i=1 的剩余内层
// (2, 1)
// 跳过 i=2 的剩余内层
// (3, 1)
// 跳过 i=3 的剩余内层
```

标签命名用驼峰，以冒号结尾，放在 `for`/`while`/`repeat` 关键字的正前方。标签是 Swift 相对少见但关键时刻非常好用的特性，能让嵌套逻辑保持清晰，避免引入额外的 flag 变量。

---

## 小结

本讲涵盖了 Swift 控制流的核心机制，以下是 5 个关键要点：

1. **if 不需要括号，但花括号是强制的**——防止悬空 else，提高可读性。
2. **switch 必须穷举**——配合枚举使用时，编译器帮你检查是否有漏掉的 case，将运行时错误提前到编译期。
3. **switch 的模式匹配远不止等值比较**——支持区间、元组、值绑定（`case let x where x > 0`），能直接解构和过滤数据。
4. **闭区间 `...` vs 半开区间 `..<`**——遍历数组下标用 `0..<array.count`，需要自定义步长时用 `stride(from:to:by:)`。
5. **labeled break/continue 解决嵌套循环退出问题**——比额外引入 flag 变量更清晰，是优雅处理多层嵌套的正式手段。

---

> **下一讲**：第05讲·函数与闭包
