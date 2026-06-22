---
title: "【Go 精进·第07讲】泛型：1.18 之后 Go 的新表达力"
date: 2026-06-22
tags:
  - Go
  - 语言学习
categories:
  - 技术深潜
series: learn-go
---

> **系列导航** → [课程目录](/courses/learn-go/) · 上一讲：第06讲·context · 下一讲待写

---

Go 1.18 是这门语言诞生以来变动最大的版本之一。从 2009 年到 2022 年，社区对泛型的讨论从未停歇，直到 1.18 落地，争论才真正有了句号。如果你在阅读别人写的 Go 库时看到 `[T any]` 这样的符号却一头雾水，或者你在写工具函数时被迫为每种类型复制一遍代码——这一讲就是为你准备的。

本讲的目标不是堆砌语法细节，而是帮你建立三个判断力：**什么时候应该用泛型、什么时候该用接口、什么时候两者都不需要**。理解这三个判断，才算真正掌握了 Go 泛型的精髓。

---

## 第1节：类型参数——泛型的基本语法

### 1.1 从重复代码说起

假设你需要一个"取两数中较小值"的函数。在泛型之前，你要么用 `interface{}` + 类型断言（运行期开销），要么为 `int`、`float64`、`string` 各写一个函数。

```go
package main

import "fmt"

// 旧方式：为每种类型复制一遍
func MinInt(a, b int) int {
    if a < b {
        return a
    }
    return b
}

func MinFloat64(a, b float64) float64 {
    if a < b {
        return a
    }
    return b
}

func main() {
    fmt.Println(MinInt(3, 5))       // 3
    fmt.Println(MinFloat64(3.14, 2.71)) // 2.71
}
```

泛型让你只写一次：

```go
package main

import (
    "fmt"
    "golang.org/x/exp/constraints"
)

// Min 接受任何满足 constraints.Ordered 约束的类型
func Min[T constraints.Ordered](a, b T) T {
    if a < b {
        return a
    }
    return b
}

func main() {
    fmt.Println(Min(3, 5))          // 3
    fmt.Println(Min(3.14, 2.71))    // 2.71
    fmt.Println(Min("apple", "banana")) // apple
}
```

### 1.2 类型参数语法解析

泛型函数的签名格式是 `func 函数名[类型参数列表](普通参数列表) 返回值`。

- `[T constraints.Ordered]` 是**类型参数列表**，`T` 是类型参数名，`constraints.Ordered` 是**约束**（constraint）
- 约束规定了调用者可以传入哪些具体类型
- 编译器在调用处推断 `T` 的具体类型，不需要手动指定（也可以显式写 `Min[int](3, 5)`）

### 1.3 内置约束：any 和 comparable

Go 内置了两个最常用的约束：

| 约束 | 含义 | 等价写法 |
|------|------|----------|
| `any` | 任意类型，不限制操作 | `interface{}` |
| `comparable` | 可用 `==` 和 `!=` 比较的类型 | — |

```go
package main

import "fmt"

// Contains 检查切片中是否包含某值
// 要求元素类型可比较
func Contains[T comparable](slice []T, target T) bool {
    for _, v := range slice {
        if v == target {
            return true
        }
    }
    return false
}

func main() {
    nums := []int{1, 2, 3, 4, 5}
    fmt.Println(Contains(nums, 3))   // true
    fmt.Println(Contains(nums, 9))   // false

    words := []string{"go", "rust", "python"}
    fmt.Println(Contains(words, "go"))   // true
    fmt.Println(Contains(words, "java")) // false
}
```

---

## 第2节：联合约束与自定义约束

### 2.1 接口作为约束

Go 1.18 扩展了 `interface` 的语义——接口不只能描述方法集，还能描述**类型集**。一个类型满足约束，等价于该类型属于约束所描述的类型集。

```go
package main

import "fmt"

// Number 是自定义约束，表示所有整数和浮点数类型
type Number interface {
    int | int8 | int16 | int32 | int64 |
        float32 | float64
}

func Sum[T Number](nums []T) T {
    var total T
    for _, n := range nums {
        total += n
    }
    return total
}

func main() {
    ints := []int{1, 2, 3, 4, 5}
    fmt.Println(Sum(ints)) // 15

    floats := []float64{1.1, 2.2, 3.3}
    fmt.Println(Sum(floats)) // 6.6000000000000005
}
```

### 2.2 波浪号 ~ 的含义：包含底层类型

直接写 `int` 只匹配 `int` 本身，不匹配 `type MyInt int` 这样的自定义类型。加上 `~` 前缀则匹配所有以 `int` 为**底层类型**的类型。

```go
package main

import "fmt"

type Celsius float64    // 底层类型是 float64
type Fahrenheit float64 // 底层类型是 float64

// ~float64 同时匹配 float64、Celsius、Fahrenheit
type Temperature interface {
    ~float64
}

func AbsDiff[T Temperature](a, b T) T {
    if a > b {
        return a - b
    }
    return b - a
}

func main() {
    var boiling Celsius = 100
    var body Celsius = 37
    fmt.Printf("温差：%.1f°C\n", AbsDiff(boiling, body)) // 温差：63.0°C

    var hot Fahrenheit = 212
    var cool Fahrenheit = 98.6
    fmt.Printf("温差：%.1f°F\n", AbsDiff(hot, cool)) // 温差：113.4°F
}
```

### 2.3 约束中混合方法和类型

约束可以同时要求类型集和方法集——只有满足全部条件的类型才符合约束。

```go
package main

import (
    "fmt"
    "strings"
)

type Stringable interface {
    ~string | ~[]byte
}

func ToUpper[T Stringable](v T) string {
    return strings.ToUpper(string(v))
}

func main() {
    fmt.Println(ToUpper("hello world"))    // HELLO WORLD
    fmt.Println(ToUpper([]byte("go lang"))) // GO LANG
}
```

---

## 第3节：泛型函数实战——Map / Filter / Reduce

函数式编程的三大操作在没有泛型之前很难在 Go 里优雅实现，现在可以了。

### 3.1 Map：转换每个元素

```go
package main

import "fmt"

// Map 将切片 []T 的每个元素用 f 映射为 []U
func Map[T, U any](slice []T, f func(T) U) []U {
    result := make([]U, len(slice))
    for i, v := range slice {
        result[i] = f(v)
    }
    return result
}

func main() {
    nums := []int{1, 2, 3, 4, 5}

    // int -> string
    strs := Map(nums, func(n int) string {
        return fmt.Sprintf("item-%d", n)
    })
    fmt.Println(strs) // [item-1 item-2 item-3 item-4 item-5]

    // int -> int (平方)
    squares := Map(nums, func(n int) int { return n * n })
    fmt.Println(squares) // [1 4 9 16 25]
}
```

### 3.2 Filter：筛选满足条件的元素

```go
package main

import "fmt"

// Filter 返回切片中满足谓词 pred 的所有元素
func Filter[T any](slice []T, pred func(T) bool) []T {
    var result []T
    for _, v := range slice {
        if pred(v) {
            result = append(result, v)
        }
    }
    return result
}

func main() {
    nums := []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}

    evens := Filter(nums, func(n int) bool { return n%2 == 0 })
    fmt.Println(evens) // [2 4 6 8 10]

    words := []string{"Go", "Rust", "Python", "Java", "C"}
    short := Filter(words, func(s string) bool { return len(s) <= 2 })
    fmt.Println(short) // [Go C]
}
```

### 3.3 Reduce：折叠为单个值

```go
package main

import "fmt"

// Reduce 将切片 []T 折叠为单个 U 类型的值
func Reduce[T, U any](slice []T, init U, f func(U, T) U) U {
    acc := init
    for _, v := range slice {
        acc = f(acc, v)
    }
    return acc
}

func main() {
    nums := []int{1, 2, 3, 4, 5}

    // 求和
    sum := Reduce(nums, 0, func(acc, n int) int { return acc + n })
    fmt.Println("Sum:", sum) // Sum: 15

    // 求积
    product := Reduce(nums, 1, func(acc, n int) int { return acc * n })
    fmt.Println("Product:", product) // Product: 120

    // 拼接字符串
    words := []string{"Go", "is", "awesome"}
    sentence := Reduce(words, "", func(acc, w string) string {
        if acc == "" {
            return w
        }
        return acc + " " + w
    })
    fmt.Println(sentence) // Go is awesome
}
```

---

## 第4节：泛型类型——Stack[T]

泛型不只能用于函数，也能用于结构体、接口等类型定义。

### 4.1 定义泛型栈

```go
package main

import (
    "errors"
    "fmt"
)

// Stack[T] 是类型安全的泛型栈
type Stack[T any] struct {
    items []T
}

// Push 压栈
func (s *Stack[T]) Push(item T) {
    s.items = append(s.items, item)
}

// Pop 弹栈，栈空时返回 error
func (s *Stack[T]) Pop() (T, error) {
    var zero T
    if len(s.items) == 0 {
        return zero, errors.New("stack is empty")
    }
    top := s.items[len(s.items)-1]
    s.items = s.items[:len(s.items)-1]
    return top, nil
}

// Peek 查看栈顶但不弹出
func (s *Stack[T]) Peek() (T, error) {
    var zero T
    if len(s.items) == 0 {
        return zero, errors.New("stack is empty")
    }
    return s.items[len(s.items)-1], nil
}

// Size 返回栈的元素数量
func (s *Stack[T]) Size() int {
    return len(s.items)
}

func main() {
    // int 栈
    var intStack Stack[int]
    intStack.Push(1)
    intStack.Push(2)
    intStack.Push(3)

    top, _ := intStack.Pop()
    fmt.Println("Popped:", top)     // Popped: 3
    fmt.Println("Size:", intStack.Size()) // Size: 2

    // string 栈
    var strStack Stack[string]
    strStack.Push("first")
    strStack.Push("second")

    peek, _ := strStack.Peek()
    fmt.Println("Peek:", peek)      // Peek: second
    fmt.Println("Size:", strStack.Size()) // Size: 2

    // 弹空后的错误处理
    var empty Stack[float64]
    _, err := empty.Pop()
    fmt.Println("Error:", err) // Error: stack is empty
}
```

### 4.2 泛型类型的方法约束

泛型类型的方法在声明时必须保持与类型定义相同的类型参数，且**不能在方法上新增额外类型参数**（这是 Go 泛型目前的限制，可能在未来版本放开）。

```go
package main

import "fmt"

// Pair[K, V] 表示键值对，K 需要可比较以支持相等判断
type Pair[K comparable, V any] struct {
    Key   K
    Value V
}

func (p Pair[K, V]) String() string {
    return fmt.Sprintf("%v -> %v", p.Key, p.Value)
}

func (p Pair[K, V]) Equal(other Pair[K, V]) bool {
    return p.Key == other.Key
}

func main() {
    p1 := Pair[string, int]{Key: "age", Value: 28}
    p2 := Pair[string, int]{Key: "age", Value: 30}
    p3 := Pair[string, int]{Key: "name", Value: 0}

    fmt.Println(p1)            // age -> 28
    fmt.Println(p1.Equal(p2)) // true（只比较 Key）
    fmt.Println(p1.Equal(p3)) // false
}
```

---

## 第5节：何时用泛型，何时用接口

泛型不是万能的，错误地使用泛型会让代码更难读、更难维护。

### 5.1 编译期多态用泛型，运行期多态用接口

```go
package main

import (
    "fmt"
    "math"
)

// --- 运行期多态：接口更合适 ---
// 不同形状有不同的 Area 计算逻辑，需要运行期分派

type Shape interface {
    Area() float64
}

type Circle struct{ Radius float64 }
type Rectangle struct{ Width, Height float64 }

func (c Circle) Area() float64    { return math.Pi * c.Radius * c.Radius }
func (r Rectangle) Area() float64 { return r.Width * r.Height }

// TotalArea 接受任意 Shape 切片，运行期决定调用哪个 Area
func TotalArea(shapes []Shape) float64 {
    total := 0.0
    for _, s := range shapes {
        total += s.Area()
    }
    return total
}

// --- 编译期多态：泛型更合适 ---
// Keys 的逻辑对所有 map 类型完全相同，只是类型不同

func Keys[K comparable, V any](m map[K]V) []K {
    keys := make([]K, 0, len(m))
    for k := range m {
        keys = append(keys, k)
    }
    return keys
}

func main() {
    shapes := []Shape{
        Circle{Radius: 5},
        Rectangle{Width: 4, Height: 6},
    }
    fmt.Printf("Total area: %.2f\n", TotalArea(shapes)) // Total area: 102.54

    scores := map[string]int{"Alice": 95, "Bob": 87, "Carol": 92}
    fmt.Println("Keys:", Keys(scores)) // Keys: [Alice Bob Carol]（顺序不定）
}
```

### 5.2 三条判断原则

**用泛型的场景：**
- 操作切片、Map、Channel 等容器类型，逻辑与元素类型无关
- 实现通用算法（排序、搜索、Map/Filter/Reduce）
- 需要编译期类型安全，不想用 `interface{}` + 类型断言

**用接口的场景：**
- 行为抽象：不同类型有相同的方法但实现不同
- 需要在运行时动态替换实现（依赖注入、插件化）
- 已有成熟的接口设计（`io.Reader`、`http.Handler` 等）

**两者都不需要的场景：**
- 只有一两种类型的情况下，直接写具体类型即可
- 过早抽象会增加认知负担，YAGNI（You Aren't Gonna Need It）原则同样适用于泛型

### 5.3 泛型的性能特征

Go 编译器对泛型的实现采用了 **GCShape stenciling** 策略：对于共享底层内存布局的类型（如所有指针类型），编译器生成同一份代码；对于 `int`、`float64` 等值类型，编译器会为每种类型生成专门的代码。实际上泛型函数几乎没有运行时开销，性能与手写版本相近。

---

## 小结

本讲核心要点梳理：

1. **类型参数语法**：`func F[T Constraint](...)` 是泛型函数的基本形式，`T` 在调用时由编译器推断；
2. **内置约束**：`any`（任意类型）和 `comparable`（可用 == 比较）是最常用的两个约束；
3. **联合约束与 ~**：`~int | ~string` 表示底层类型为 `int` 或 `string` 的所有类型，`~` 是关键；
4. **泛型类型**：结构体也可以携带类型参数（`Stack[T]`），方法不能新增额外类型参数；
5. **选择原则**：编译期多态用泛型，运行期多态用接口；没有充分理由，优先写具体类型。

---

> **下一讲**：第08讲·标准库精讲
