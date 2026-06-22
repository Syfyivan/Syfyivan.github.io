---
title: "【Go 精进·第01讲】函数与闭包：Go 函数的全貌"
date: 2026-06-22
tags:
  - Go
  - 语言学习
categories:
  - 技术深潜
series: learn-go
---

> **系列导航** → [课程目录](/courses/learn-go/) · 上一讲：第00讲·心智模型 · 下一讲待写

## 引言

如果你从 Python、JavaScript 或 Java 转来学 Go，函数部分看起来可能不起眼——不过是换了语法而已。但 Go 的函数设计藏着几个"反直觉"的细节：多返回值不是语法糖，而是错误处理的基石；命名返回值在 `defer` 里能悄悄改掉你以为已经确定的结果；闭包共享的是变量本身而不是它的值，一个经典的循环陷阱曾让无数 Go 新手排查了半天 bug。

把这几块理清楚，后续的 goroutine、接口、中间件等进阶话题才能站得稳。本讲用五个核心主题，从语法到心智模型，逐步拆解 Go 函数的全貌。

---

## 第1节：多返回值与 error 惯用法

### 1.1 为什么要多返回值

Go 没有异常机制。错误不会自动向上冒泡，调用方必须主动处理。多返回值是这一设计的物质基础：函数同时返回计算结果和错误信息，调用方在同一行就能拿到两者。

这不是妥协，而是权衡后的选择：代码路径显式可见，错误无法被静默忽略（忽略的话编译器会警告 `_ =` 需要明确写出）。

### 1.2 标准的 (result, error) 模式

下面是一个实际场景：把逗号分隔的字符串切分成非空的字段列表，任何非法输入都返回 error。

```go
package main

import (
	"errors"
	"fmt"
	"strings"
)

// splitFields 将逗号分隔的字符串拆成非空字段列表。
// 返回 ([]string, error)：成功时 err 为 nil，失败时 result 为 nil。
func splitFields(input string) ([]string, error) {
	if input == "" {
		return nil, errors.New("input must not be empty")
	}

	parts := strings.Split(input, ",")
	result := make([]string, 0, len(parts))

	for _, p := range parts {
		trimmed := strings.TrimSpace(p)
		if trimmed == "" {
			return nil, errors.New("field must not be blank")
		}
		result = append(result, trimmed)
	}

	return result, nil
}

func main() {
	fields, err := splitFields("go, closures, defer")
	if err != nil {
		fmt.Println("error:", err)
		return
	}
	fmt.Println(fields) // [go closures defer]

	_, err = splitFields("go,,defer")
	if err != nil {
		fmt.Println("error:", err) // error: field must not be blank
	}
}
```

**惯例约定**：
- 返回值列表中 error 永远放最后。
- 函数出错时，非 error 的返回值应设为零值或 nil，不要返回部分结果，除非文档明确说明。
- 调用方的 `if err != nil` 检查紧跟在调用之后，不要延迟处理。

---

## 第2节：命名返回值的用途与陷阱

### 2.1 命名返回值的合法用途

Go 允许在函数签名里给返回值命名，这些名字在函数体里作为局部变量存在，裸 `return` 会自动返回它们的当前值。

```go
package main

import (
	"errors"
	"fmt"
	"strconv"
)

// parsePositive 解析字符串为正整数，用命名返回值提高可读性。
func parsePositive(s string) (n int, err error) {
	n, err = strconv.Atoi(s)
	if err != nil {
		return // 裸 return：n=0, err=解析错误
	}
	if n <= 0 {
		err = errors.New("value must be positive")
		return // 裸 return：n=已解析的值, err=业务错误
	}
	return // 裸 return：n=正整数, err=nil
}

func main() {
	n, err := parsePositive("42")
	fmt.Println(n, err) // 42 <nil>

	n, err = parsePositive("-1")
	fmt.Println(n, err) // -1 value must be positive

	n, err = parsePositive("abc")
	fmt.Println(n, err) // 0 strconv.Atoi: parsing "abc": invalid syntax
}
```

命名返回值适合用在：返回值含义需要说明、函数较长不想重复写类型、或者要配合 `defer` 修改返回值（见下节）。

### 2.2 defer 里修改命名返回值——惊喜还是陷阱？

这是 Go 里最容易踩坑的特性之一。`defer` 执行时，命名返回值的变量还"活着"，修改它会真实改变函数的返回结果。

```go
package main

import "fmt"

// wrapError 演示 defer 修改命名返回值。
// 如果 err 不为 nil，在 defer 里统一包装错误信息。
func wrapError(fail bool) (result string, err error) {
	defer func() {
		if err != nil {
			// 此处修改的 err 就是函数最终返回的 err
			err = fmt.Errorf("wrapError: %w", err)
		}
	}()

	if fail {
		err = fmt.Errorf("something went wrong")
		return
	}
	result = "success"
	return
}

func main() {
	r, err := wrapError(false)
	fmt.Println(r, err) // success <nil>

	r, err = wrapError(true)
	fmt.Println(r, err) // wrapError: something went wrong
}
```

**陷阱提醒**：如果返回值没有命名，`defer` 里拿到的是副本，修改无效。命名 vs 匿名返回值的选择会直接影响 `defer` 能否修改结果，需要有意识地决定。

---

## 第3节：函数作为一等公民

### 3.1 函数类型与变量赋值

在 Go 里，函数是一等公民（first-class citizen）：可以赋值给变量、作为参数传递、作为返回值返回。函数的类型由参数列表和返回值列表共同决定。

```go
package main

import "fmt"

// Transformer 是一个函数类型：接受 string，返回 string。
type Transformer func(string) string

// applyAll 把一组 Transformer 依次作用于 input。
func applyAll(input string, transforms ...Transformer) string {
	result := input
	for _, t := range transforms {
		result = t(result)
	}
	return result
}

func main() {
	import_upper := func(s string) string {
		result := make([]byte, len(s))
		for i, c := range s {
			if c >= 'a' && c <= 'z' {
				result[i] = byte(c - 32)
			} else {
				result[i] = byte(c)
			}
		}
		return string(result)
	}

	addBang := func(s string) string { return s + "!" }
	repeat := func(s string) string { return s + " " + s }

	out := applyAll("hello", import_upper, addBang, repeat)
	fmt.Println(out) // HELLO! HELLO!
}
```

### 3.2 函数作为返回值——工厂模式

```go
package main

import "fmt"

// multiplier 返回一个"乘以 factor"的函数。
func multiplier(factor int) func(int) int {
	return func(n int) int {
		return n * factor
	}
}

func main() {
	double := multiplier(2)
	triple := multiplier(3)

	fmt.Println(double(5))  // 10
	fmt.Println(triple(5))  // 15
	fmt.Println(double(triple(4))) // 24
}
```

函数类型让 Go 具备了函数式编程的基本能力：高阶函数、策略模式、中间件链——这些都建立在函数是值这一基础上。

---

## 第4节：闭包与变量捕获

### 4.1 闭包是什么：捕获的是变量，不是值

闭包（closure）是一个函数，它"记住"了定义它时所在作用域的变量。关键点：Go 的闭包捕获的是**变量本身**（引用语义），不是变量在那一刻的快照。

```go
package main

import "fmt"

// makeCounter 返回一个闭包计数器。
// 每次调用都会让 count 自增并返回新值。
func makeCounter() func() int {
	count := 0
	return func() int {
		count++
		return count
	}
}

func main() {
	c1 := makeCounter()
	c2 := makeCounter()

	fmt.Println(c1()) // 1
	fmt.Println(c1()) // 2
	fmt.Println(c1()) // 3
	fmt.Println(c2()) // 1  ← c2 有独立的 count 变量
	fmt.Println(c1()) // 4
}
```

`c1` 和 `c2` 各自持有独立的 `count` 变量，互不干扰。这正是闭包的威力：用函数封装状态。

### 4.2 经典陷阱：循环变量共享

Go 1.22 之前，`for` 循环变量只有一个实例，所有迭代共享同一个变量地址，闭包里捕获它会全部指向同一处：

```go
package main

import "fmt"

func main() {
	funcs := make([]func(), 3)

	// Go 1.21 及更早：i 是循环外的单一变量，闭包全部捕获同一个 i。
	// 执行时 i 已经是 3，全部打印 3。
	for i := 0; i < 3; i++ {
		i := i // Go 1.22 之前的修复写法：在循环体内重新声明 i，创建新变量
		funcs[i] = func() { fmt.Println(i) }
	}

	for _, f := range funcs {
		f() // 打印 0 1 2（修复后正确）
	}

	// Go 1.22+ 自动为每次迭代创建新的循环变量，无需手动重声明。
	funcs2 := make([]func(), 3)
	for i := range 3 {
		funcs2[i] = func() { fmt.Println(i) }
	}
	for _, f := range funcs2 {
		f() // Go 1.22+ 下打印 0 1 2
	}
}
```

**规则**：在闭包里使用循环变量时，始终问自己：我捕获的是"每次迭代独立的副本"还是"同一个变量"？Go 1.22 修复了 `for range` 的语义，但遇到旧代码时仍需警惕。

---

## 第5节：defer 的执行顺序与常见用途

### 5.1 LIFO 顺序：后注册先执行

`defer` 语句注册一个函数调用，推迟到当前函数返回前执行。多个 `defer` 按照**后进先出（LIFO）**顺序执行，就像栈一样。

```go
package main

import "fmt"

func cleanup() {
	defer fmt.Println("first defer")  // 最后执行
	defer fmt.Println("second defer") // 中间执行
	defer fmt.Println("third defer")  // 最先执行
	fmt.Println("function body")
}

func main() {
	cleanup()
	// 输出：
	// function body
	// third defer
	// second defer
	// first defer
}
```

### 5.2 用 defer 确保资源释放

`defer` 最典型的用途是配合资源的打开和关闭：打开之后立即 defer 关闭，这样无论函数中途返回还是 panic，资源都会被释放。

```go
package main

import (
	"fmt"
	"os"
	"sync"
)

// readFileContent 读取文件内容，defer 确保文件一定被关闭。
func readFileContent(path string) (string, error) {
	f, err := os.Open(path)
	if err != nil {
		return "", fmt.Errorf("open file: %w", err)
	}
	defer f.Close() // 无论后续怎么 return，f.Close() 都会执行

	buf := make([]byte, 512)
	n, err := f.Read(buf)
	if err != nil {
		return "", fmt.Errorf("read file: %w", err)
	}
	return string(buf[:n]), nil
}

// withLock 演示 defer 配合 Mutex 解锁，防止死锁。
func withLock(mu *sync.Mutex, work func()) {
	mu.Lock()
	defer mu.Unlock() // 无论 work() 是否 panic，锁都会被释放
	work()
}

func main() {
	// 演示文件读取（需要文件存在，此处仅展示结构）
	content, err := readFileContent("/etc/hostname")
	if err != nil {
		fmt.Println("error:", err)
	} else {
		fmt.Println("hostname:", content)
	}

	// 演示带锁操作
	var mu sync.Mutex
	withLock(&mu, func() {
		fmt.Println("critical section")
	})
}
```

**惯例**：`Open` 之后立即写 `defer Close`，`Lock` 之后立即写 `defer Unlock`——把资源的申请和释放放在视觉上相邻的位置，不给遗漏的机会。

---

## 小结

本讲覆盖了 Go 函数体系的五个核心主题：

1. **多返回值 + error 惯用法**：`(result, error)` 是 Go 错误处理的基石，error 永远放最后，调用方必须显式检查。
2. **命名返回值**：提升可读性，并能在 `defer` 里修改函数的最终返回值——这是强大特性，也是潜在陷阱，需有意识使用。
3. **函数是一等公民**：函数可以赋值、传参、返回，函数类型是实现策略模式、高阶函数和中间件的基础。
4. **闭包捕获变量引用**：闭包共享的是变量地址而非快照；循环闭包陷阱在 Go 1.22 之前需手动用内部重声明修复，1.22+ 已自动处理。
5. **defer 的 LIFO 顺序与资源管理**：`defer` 是 Go 的资源安全保障机制，打开即 defer 关闭是惯例，不给遗漏留余地。

---

> **下一讲**：第02讲·接口与多态
