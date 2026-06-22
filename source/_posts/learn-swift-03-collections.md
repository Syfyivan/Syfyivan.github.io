---
title: "【Swift 从零·第03讲】集合类型：Array、Dictionary、Set 与高阶函数"
date: 2026-06-22
tags:
  - Swift
  - 语言学习
categories:
  - 技术深潜
series: learn-swift
---

> **系列导航** → [课程目录](/courses/learn-swift/) · 上一讲：第02讲·Optional · 下一讲待写

---

## 引言

如果说变量是程序的细胞，集合类型就是器官——它们把零散的数据组织成有意义的结构。Swift 提供了三种原生集合：**Array**（有序列表）、**Dictionary**（键值映射）、**Set**（无序去重集合）。三者各司其职，背后都有值类型语义，这意味着赋值和传参时会自动复制，天然线程安全。

Swift 在集合设计上另一个亮点是**高阶函数**。`map`、`filter`、`reduce` 等函数让你用声明式思维描述"做什么"，而不是用循环描述"怎么做"，代码量更少、意图更清晰。本讲从字面量开始，逐步覆盖常用方法，最后落到高阶函数和 `lazy` 惰性求值。

---

## 第1节：Array 数组

### 1.1 字面量与类型推断

Swift 的类型推断让数组声明非常简洁，编译器根据字面量自动推导元素类型。

```swift
// 类型推断：编译器推断为 [String]
var fruits = ["apple", "banana", "cherry"]

// 显式声明
var scores: [Int] = [90, 85, 72]

// 空数组必须指定类型
var names: [String] = []
var numbers = [Int]()    // 等价写法

print(fruits[0])         // apple
print(scores.count)      // 3
```

### 1.2 常用增删查改方法

```swift
var list = ["a", "b", "c"]

// 增
list.append("d")               // ["a", "b", "c", "d"]
list.insert("z", at: 0)       // ["z", "a", "b", "c", "d"]

// 删
list.remove(at: 0)             // 移除 "z"，返回被删除的元素
list.removeLast()              // 移除 "d"

// 查
print(list.contains("b"))      // true
print(list.firstIndex(of: "c")) // Optional(2)

// 遍历时同时获取索引
for (index, value) in list.enumerated() {
    print("\(index): \(value)")
}

// 排序
let words = ["banana", "apple", "cherry"]
let sorted = words.sorted()                    // 升序，返回新数组
let descending = words.sorted(by: >)           // 降序
print(sorted)      // ["apple", "banana", "cherry"]
```

### 1.3 切片与 indices

```swift
let nums = [10, 20, 30, 40, 50]

// 切片（ArraySlice，共享内存，不是新数组）
let slice = nums[1...3]       // [20, 30, 40]
let copy = Array(slice)       // 转为真正的 Array

// indices 获取有效索引范围
for i in nums.indices {
    print(nums[i], terminator: " ")   // 10 20 30 40 50
}
```

---

## 第2节：Dictionary 字典

### 2.1 字面量与下标访问

字典下标访问返回 **Optional**——因为 key 可能不存在，这是 Swift 类型安全的体现。

```swift
var capitals: [String: String] = [
    "Japan": "Tokyo",
    "France": "Paris",
    "China": "Beijing"
]

// 下标访问返回 Optional<String>
let city = capitals["Japan"]         // Optional("Tokyo")
let unknown = capitals["Germany"]    // nil

// 用默认值解包
let safe = capitals["Germany", default: "Unknown"]   // "Unknown"

// 修改
capitals["Germany"] = "Berlin"
capitals["Japan"] = nil              // 删除该键值对

print(capitals.count)                // 3
```

### 2.2 updateValue 与 merge

```swift
var inventory = ["apple": 5, "banana": 3]

// updateValue 返回旧值（Optional），方便判断是插入还是更新
if let oldValue = inventory.updateValue(10, forKey: "apple") {
    print("apple 旧库存：\(oldValue)，新库存：10")
}

// merge：合并另一个字典，冲突时选择新值
let newStock = ["banana": 8, "cherry": 12]
inventory.merge(newStock) { _, new in new }
print(inventory)   // ["apple": 10, "banana": 8, "cherry": 12]

// 遍历字典（顺序不固定）
for (key, value) in inventory.sorted(by: { $0.key < $1.key }) {
    print("\(key): \(value)")
}
```

---

## 第3节：Set 集合

### 3.1 创建与去重

```swift
// 字面量创建 Set，必须显式声明类型（否则推断为 Array）
var tagSet: Set<String> = ["swift", "ios", "mobile", "swift"]
print(tagSet.count)   // 3（自动去重）

// 常用操作
tagSet.insert("xcode")
tagSet.remove("mobile")
print(tagSet.contains("ios"))   // true

// 数组去重的惯用写法
let repeated = [1, 2, 2, 3, 3, 3, 4]
let unique = Array(Set(repeated)).sorted()
print(unique)   // [1, 2, 3, 4]
```

### 3.2 集合运算

Set 的集合运算让求交集、并集等操作一行搞定：

```swift
let swift: Set = ["Array", "Dictionary", "Set", "String"]
let python: Set = ["list", "dict", "set", "String"]

// 并集：两者都有的类型
let union = swift.union(python)

// 交集：两者共有
let intersection = swift.intersection(python)
print(intersection)   // ["set", "String"]（注意大小写敏感）

// 差集：swift 有但 python 没有
let onlySwift = swift.subtracting(python)
print(onlySwift)      // ["Array", "Dictionary", "String" 中 python 没有的]

// 对称差：仅在其中一个中存在
let symmetricDiff = swift.symmetricDifference(python)

// 子集判断
let sub: Set = ["Array", "Set"]
print(sub.isSubset(of: swift))   // true
```

---

## 第4节：高阶函数

### 4.1 map · filter · reduce

这三个函数是函数式编程的基石，对集合元素做变换、筛选、聚合：

```swift
let grades = [88, 72, 95, 60, 78, 91]

// map：变换每个元素，返回新数组
let doubled = grades.map { $0 * 2 }
print(doubled)   // [176, 144, 190, 120, 156, 182]

// filter：保留满足条件的元素
let passing = grades.filter { $0 >= 75 }
print(passing)   // [88, 95, 78, 91]

// reduce：聚合为单一值（初始值 + 闭包）
let total = grades.reduce(0) { acc, score in acc + score }
print("总分：\(total)")   // 总分：484

// 链式调用：先筛选及格分，再计算及格学生总分
let passingTotal = grades
    .filter { $0 >= 75 }
    .reduce(0, +)
print("及格学生总分：\(passingTotal)")   // 352
```

### 4.2 compactMap · flatMap

```swift
// compactMap：把 [Optional] 转为去掉 nil 的 [非Optional]
let rawInput: [String?] = ["Alice", nil, "Bob", nil, "Carol"]
let validNames = rawInput.compactMap { $0 }
print(validNames)   // ["Alice", "Bob", "Carol"]

// 常见用途：字符串转整数，转失败自动丢弃
let numberStrings = ["1", "two", "3", "four", "5"]
let parsedNumbers = numberStrings.compactMap { Int($0) }
print(parsedNumbers)   // [1, 3, 5]

// flatMap：展开嵌套数组
let nested = [[1, 2, 3], [4, 5], [6, 7, 8]]
let flat = nested.flatMap { $0 }
print(flat)   // [1, 2, 3, 4, 5, 6, 7, 8]

// 组合：提取所有学生的选课列表并去重
let courseSelections = [
    ["Swift", "iOS"],
    ["Swift", "macOS"],
    ["watchOS", "iOS"]
]
let allCourses = Array(Set(courseSelections.flatMap { $0 })).sorted()
print(allCourses)   // ["iOS", "Swift", "macOS", "watchOS"]
```

### 4.3 forEach 与 sorted(by:)

```swift
let dict = ["a": 1, "b": 2, "c": 3]

// forEach：有副作用的遍历（与 for-in 等价，但不能 break/continue）
dict.forEach { key, value in
    print("\(key) = \(value)")
}

// sorted(by:) 自定义排序规则
struct Student {
    let name: String
    let score: Int
}

let students = [
    Student(name: "Alice", score: 88),
    Student(name: "Bob", score: 95),
    Student(name: "Carol", score: 72)
]

// 按分数降序
let ranked = students.sorted { $0.score > $1.score }
ranked.forEach { print("\($0.name): \($0.score)") }
// Bob: 95 / Alice: 88 / Carol: 72
```

---

## 第5节：lazy 惰性求值

### 5.1 为什么需要 lazy

普通链式调用 `filter { }.map { }` 会产生**中间数组**，对大数据集有性能开销。`lazy` 让求值延迟到真正消费时，且逐元素处理，不生成中间集合。

```swift
let bigArray = Array(1...1_000_000)

// 普通写法：先生成 500000 个元素的中间数组，再取前5个
let normalResult = bigArray
    .filter { $0 % 2 == 0 }
    .prefix(5)
print(Array(normalResult))   // [2, 4, 6, 8, 10]

// lazy 写法：找到5个偶数就停止，不扫描剩余元素
let lazyResult = bigArray.lazy
    .filter { $0 % 2 == 0 }
    .map { $0 * $0 }          // 每个偶数的平方
    .prefix(5)
print(Array(lazyResult))   // [4, 16, 36, 64, 100]
```

### 5.2 Playground 综合练习

```swift
import Foundation

// --- 练习1：compactMap 清洗用户输入 ---
let userInputs: [String?] = ["42", nil, "hello", "17", nil, "99"]
let validScores = userInputs.compactMap { $0.flatMap { Int($0) } }
print("有效分数：\(validScores)")   // [42, 17, 99]

// --- 练习2：reduce 计算班级总分和平均分 ---
let classScores = [88, 72, 95, 60, 78, 91, 84, 67]
let sum = classScores.reduce(0, +)
let average = Double(sum) / Double(classScores.count)
print(String(format: "总分：%d，平均分：%.1f", sum, average))

// --- 练习3：lazy 链式处理大集合 ---
let dataset = Array(1...10_000)

// 找出前3个：能被7整除且平方小于10000的数
let lazyChain = dataset.lazy
    .filter { $0 % 7 == 0 }
    .filter { $0 * $0 < 10_000 }
    .map { "数字\($0)，平方\($0 * $0)" }
    .prefix(3)

print("lazy 结果：")
lazyChain.forEach { print("  \($0)") }
// 数字7，平方49
// 数字14，平方196
// 数字21，平方441
```

---

## 小结

本讲核心要点：

1. **Array** 是有序集合，下标访问需注意越界；用 `indices` 遍历比手写 `0..<count` 更安全
2. **Dictionary** 下标返回 `Optional`，用 `default:` 参数或 `updateValue` 可以安全读写
3. **Set** 天然去重，集合运算（`union` / `intersection` / `subtracting`）比手写循环简洁十倍
4. **高阶函数三件套**：`map` 变形、`filter` 筛选、`reduce` 聚合；`compactMap` 去 nil、`flatMap` 展平嵌套
5. **lazy** 是性能利器：大集合的链式操作加上 `.lazy` 前缀，避免生成中间数组，按需求值

---

> **下一讲**：第04讲·控制流 —— `if`/`guard`/`switch` 的模式匹配，以及 `for-in`、`while` 的完整用法
