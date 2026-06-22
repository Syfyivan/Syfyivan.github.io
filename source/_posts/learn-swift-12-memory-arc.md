---
title: "【Swift 从零·第12讲】内存管理：ARC 与引用语义"
date: 2026-06-22
tags:
  - Swift
  - 语言学习
categories:
  - 技术深潜
series: learn-swift
---

> **系列导航** → [课程目录](/courses/learn-swift/) · 上一讲：第11讲·并发 · 下一讲待写

## 引言

很多初学者学了一段时间 Swift 之后，代码能跑、逻辑也对，却遇到一个奇怪的现象：App 在某些场景下内存越用越多，或者某个回调里 `self` 莫名其妙变成了 `nil`。这背后通常都指向同一个根源——**对内存管理机制的理解不够深**。

Swift 采用 **ARC（Automatic Reference Counting，自动引用计数）** 来管理对象的内存。它不像 Java 那样靠垃圾收集器定期扫描，而是在编译阶段由编译器自动在代码中插入 `retain`（增加计数）和 `release`（减少计数）指令。当一个对象的引用计数降到 0，内存立刻释放。这让 Swift 拥有可预测的性能，但也意味着程序员必须理解"谁持有谁"，否则就会出现**循环引用**导致的内存泄漏。

本讲从 ARC 原理出发，逐步讲清楚 `strong`、`weak`、`unowned` 三种引用，以及闭包捕获 `self` 时的陷阱和打破方法。

---

## 第1节：ARC 是怎么工作的

### 1.1 引用计数的生命周期

每一个 Swift **类（class）** 的实例背后都有一个引用计数器。每当有新的变量指向这个对象，计数 +1；当变量超出作用域或被设为 `nil`，计数 -1；计数归零，析构函数 `deinit` 被调用，内存释放。

```swift
import Foundation

class Dog {
    let name: String
    init(name: String) {
        self.name = name
        print("\(name) 出生了")
    }
    deinit {
        print("\(name) 被释放了")
    }
}

// 引用计数 = 1
var dog1: Dog? = Dog(name: "旺财")
// 引用计数 = 2
var dog2: Dog? = dog1
// dog1 不再持有，引用计数 = 1
dog1 = nil
print("此时旺财还活着")
// dog2 也放手，引用计数 = 0，deinit 被调用
dog2 = nil
// 打印：旺财 被释放了
```

### 1.2 编译器做了什么

ARC 是**编译时**行为，不是运行时 GC。你写的每一行赋值，编译器都会在背后插入 `swift_retain` 和 `swift_release` 调用。这意味着内存释放是即时的、可预测的——不像 GC 语言会在某个不确定的时刻暂停。

---

## 第2节：三种引用——strong、weak、unowned

### 2.1 strong（强引用，默认行为）

Swift 中所有普通的变量/属性默认都是强引用。强引用会增加引用计数，只要有至少一个强引用存在，对象就不会被释放。

```swift
class Cat {
    let name: String
    init(_ name: String) { self.name = name }
    deinit { print("\(name) 离开了") }
}

var c1: Cat? = Cat("咪咪") // 计数 = 1
var c2 = c1!               // 计数 = 2（strong）
c1 = nil                   // 计数 = 1，咪咪还活着
c2 = nil                   // 计数 = 0，打印"咪咪 离开了"
```

### 2.2 weak（弱引用）

`weak` 修饰的变量**不增加引用计数**，因此不能阻止对象被释放。当对象被释放后，`weak` 变量自动被置为 `nil`。正因如此，`weak` 属性必须声明为 `Optional`。

```swift
class Person {
    let name: String
    weak var pet: Cat?   // 弱引用，不持有 Cat
    init(_ name: String) { self.name = name }
    deinit { print("\(name) 离开了") }
}

var alice: Person? = Person("Alice")
var mimi: Cat? = Cat("咪咪")

alice?.pet = mimi  // 弱引用，Cat 计数仍为 1

mimi = nil         // Cat 计数降为 0，咪咪被释放
print(alice?.pet as Any) // 输出 nil，自动置空
```

### 2.3 unowned（无主引用）

`unowned` 和 `weak` 一样不增加引用计数，但它**不变 Optional**——它假设"被引用的对象在我使用时一定还活着"。如果对象已经释放你却还访问，会触发运行时崩溃。

适用场景：两个对象的**生命周期相同**，或被引用方的存活期**一定长于**引用方。经典例子是信用卡和持卡人——卡不能脱离人存在。

```swift
class Owner {
    let name: String
    var card: CreditCard?
    init(_ name: String) { self.name = name }
    deinit { print("Owner \(name) 释放") }
}

class CreditCard {
    let number: String
    unowned let owner: Owner  // 卡必须有主人，生命周期不超过主人
    init(number: String, owner: Owner) {
        self.number = number
        self.owner = owner
    }
    deinit { print("Card \(number) 释放") }
}

var bob: Owner? = Owner("Bob")
bob?.card = CreditCard(number: "1234-5678", owner: bob!)

bob = nil
// 先释放 Card，再释放 Owner（因为 Owner 强持有 Card）
```

---

## 第3节：循环引用——内存泄漏的根源

### 3.1 强引用循环是如何产生的

当 A 强持有 B，同时 B 也强持有 A，就形成了一个**引用循环**。即使外部不再有任何变量指向 A 和 B，它们互相持有，引用计数永远不会归零，内存永远无法释放。

```swift
class Node {
    let id: Int
    var next: Node?   // 强引用
    init(_ id: Int) { self.id = id }
    deinit { print("Node \(id) 被释放") }
}

var n1: Node? = Node(1)
var n2: Node? = Node(2)

n1?.next = n2
n2?.next = n1  // 循环引用形成！

n1 = nil
n2 = nil
// ⚠️ 没有打印任何 deinit 信息，两个节点都泄漏了！
```

### 3.2 用 weak 打破循环

把其中一个方向改成 `weak`，循环就断开了。通常让"子"或"从属"方持有弱引用：

```swift
class NodeWeak {
    let id: Int
    weak var next: NodeWeak?  // 改为弱引用
    init(_ id: Int) { self.id = id }
    deinit { print("NodeWeak \(id) 被释放") }
}

var a: NodeWeak? = NodeWeak(10)
var b: NodeWeak? = NodeWeak(20)

a?.next = b
b?.next = a  // weak，不增加计数

a = nil
b = nil
// ✅ 正常打印 deinit，内存释放
```

---

## 第4节：闭包捕获与 [weak self]

### 4.1 闭包是引用类型，会强捕获 self

闭包捕获外部变量时，默认是**强引用**。如果一个类实例持有一个闭包（例如作为属性存储），而这个闭包又强引用了 `self`，就形成了循环引用。

```swift
class Timer {
    var name: String
    var callback: (() -> Void)?

    init(_ name: String) { self.name = name }

    func setup() {
        // ⚠️ 强捕获 self：Timer 持有 callback，callback 持有 Timer
        callback = {
            print("计时器 \(self.name) 触发")
        }
    }

    deinit { print("\(name) 计时器释放") }
}

var t: Timer? = Timer("倒计时")
t?.setup()
t = nil
// ⚠️ 没有打印 deinit，Timer 泄漏！
```

### 4.2 用 [weak self] 打破闭包循环

在闭包的捕获列表里声明 `[weak self]`，`self` 变为 `Optional`，不再增加引用计数：

```swift
class SafeTimer {
    var name: String
    var callback: (() -> Void)?

    init(_ name: String) { self.name = name }

    func setup() {
        // ✅ [weak self] 打破循环
        callback = { [weak self] in
            guard let self = self else {
                print("计时器已被释放，回调跳过")
                return
            }
            print("计时器 \(self.name) 触发")
        }
    }

    deinit { print("\(name) 计时器释放") }
}

var st: SafeTimer? = SafeTimer("安全倒计时")
st?.setup()
st?.callback?()   // 打印：计时器 安全倒计时 触发
st = nil          // 打印：安全倒计时 计时器释放
// ✅ 正常释放
```

### 4.3 weak vs unowned 在闭包中的选择

| 场景 | 选哪个 |
|------|--------|
| 闭包和 self 生命周期一样长，或 self 可能先消失 | `[weak self]` + Optional 判断 |
| 确定 self 一定在闭包执行时存活（如 UIView 动画） | `[unowned self]`（少用，出错会崩溃） |
| 不确定时 | 优先用 `[weak self]`，更安全 |

```swift
class Animation {
    var label = "动画"

    func run() {
        // unowned 场景：动画块在 self 存活期内执行
        let block = { [unowned self] in
            print("执行 \(self.label)")
        }
        block()
    }
}

let anim = Animation()
anim.run()  // 安全，anim 在 block 执行时一定存在
```

---

## 第5节：delegate 模式与内存检测工具

### 5.1 为什么 delegate 要声明为 weak var

这是 iOS/macOS 开发中的惯用模式。典型场景：`ViewController` 持有 `TableView`，`TableView` 的 delegate 又指回 `ViewController`——如果是强引用，循环引用必然出现。

```swift
protocol DataDelegate: AnyObject {
    func didUpdate(value: Int)
}

class DataSource {
    weak var delegate: DataDelegate?  // ✅ 必须 weak

    func fetchData() {
        // 模拟数据到达
        delegate?.didUpdate(value: 42)
    }
}

class Controller: DataDelegate {
    let source = DataSource()

    init() {
        source.delegate = self  // self 是 Controller，weak 引用
    }

    func didUpdate(value: Int) {
        print("收到数据：\(value)")
    }

    deinit { print("Controller 释放") }
}

var vc: Controller? = Controller()
vc?.source.fetchData()  // 打印：收到数据：42
vc = nil                // 打印：Controller 释放 ✅
```

注意：`DataDelegate` 需要继承 `AnyObject`（或 `class`），才能让属性声明为 `weak`。值类型（struct/enum）不支持弱引用。

### 5.2 用 Instruments 检测内存问题

Xcode 自带的 **Instruments** 工具提供两个关键模板：

- **Leaks**：自动检测循环引用和泄漏对象，显示泄漏的对象类型和引用链路
- **Allocations**：跟踪所有内存分配的生命周期，可对比某操作前后的堆内存变化（Mark Generation 功能）

使用步骤：`Xcode → Product → Profile（⌘+I）→ 选择 Leaks 或 Allocations → 运行 App → 触发可疑操作 → 观察图表`。

Leaks 检测到泄漏时，会在时间线上用红色标记，点击可以看到**引用环的调用栈**，直接定位到问题代码行。

---

## 小结

本讲核心要点：

1. **ARC 是编译时行为**：编译器自动插入 retain/release，引用计数归零时立即释放，无 GC 停顿
2. **三种引用语义**：`strong`（默认，增加计数）、`weak`（不增计数，自动置 nil，必须 Optional）、`unowned`（不增计数，不 Optional，假设对象存活）
3. **循环引用是内存泄漏的主因**：A 强持有 B、B 强持有 A，计数永不归零；用 `weak` 打破其中一条链
4. **闭包强捕获 self 会造成循环**：把闭包存为属性时，用 `[weak self]` + `guard let` 是最安全的写法
5. **delegate 模式必须用 weak var**：且 protocol 要继承 `AnyObject`；用 Instruments Leaks 模板可以可视化检测泄漏

---

> **下一讲**：第13讲·SwiftUI 入门
