---
title: "【Go 精进·第09讲】测试与 Benchmark：Go 测试不靠框架"
date: 2026-06-22
tags:
  - Go
  - 语言学习
categories:
  - 技术深潜
series: learn-go
---

> **系列导航** → [课程目录](/courses/learn-go/) · 上一讲：第08讲·标准库精讲 · 下一讲待写

---

## 引言

很多从 Python、Java 转过来的开发者，习惯了先安装测试框架——pytest、JUnit、Mockito——才觉得"测试环境搭好了"。到了 Go 这里，工具链自带 `go test`，标准库自带 `testing` 包，不需要任何第三方框架就能写出结构清晰、可维护的测试套件。

本讲聚焦三件事：**怎么写好单元测试**（Table-driven 模式）、**怎么量化性能**（Benchmark + `-benchmem`）、**怎么找到性能瓶颈**（pprof）。学完这一讲，你对 Go 代码的掌控感会上一个台阶——不再靠感觉说"这段代码应该很快"，而是靠数据说话。

---

## 第1节：Table-driven Test——Go 的测试惯用法

### 1.1 为什么要用 Table-driven

普通写法遇到多个输入时，会重复调用 + 重复断言，代码膨胀难维护。Table-driven 把"测试数据"和"测试逻辑"分离：数据放在切片里，逻辑只写一次。Go 社区几乎把这种写法视为默认规范。

### 1.2 给 Reverse 函数写 Table-driven Test

先写被测函数（`strings_util.go`）：

```go
package strutil

// Reverse 返回字符串的逆序版本，正确处理 Unicode 字符。
func Reverse(s string) string {
	runes := []rune(s)
	for i, j := 0, len(runes)-1; i < j; i, j = i+1, j-1 {
		runes[i], runes[j] = runes[j], runes[i]
	}
	return string(runes)
}
```

再写测试文件（`strings_util_test.go`）：

```go
package strutil

import (
	"testing"
)

func TestReverse(t *testing.T) {
	// Table-driven：每个 case 是一个匿名结构体
	cases := []struct {
		name  string
		input string
		want  string
	}{
		{"empty string", "", ""},
		{"single char", "a", "a"},
		{"ascii", "hello", "olleh"},
		{"unicode", "你好世界", "界世好你"},
		{"emoji", "😀🎉", "🎉😀"},
		{"palindrome", "racecar", "racecar"},
	}

	for _, tc := range cases {
		// t.Run 创建子测试，失败时精确定位到 case 名
		t.Run(tc.name, func(t *testing.T) {
			got := Reverse(tc.input)
			if got != tc.want {
				t.Errorf("Reverse(%q) = %q, want %q", tc.input, got, tc.want)
			}
		})
	}
}
```

运行方式：

```bash
# 运行指定测试，-v 输出每个子测试结果
go test -v -run TestReverse ./...
```

输出示例：

```
=== RUN   TestReverse
=== RUN   TestReverse/empty_string
=== RUN   TestReverse/single_char
=== RUN   TestReverse/ascii
--- PASS: TestReverse (0.00s)
```

### 1.3 t.Helper()——让错误行号指向调用处

当你把断言逻辑抽成 helper 函数时，如果不加 `t.Helper()`，报错行号会指向 helper 内部，而不是调用 helper 的地方，排查起来很困惑。

```go
package strutil

import "testing"

// assertEqual 是一个通用断言 helper。
// 调用 t.Helper() 后，失败时行号指向调用 assertEqual 的位置，而非此函数内部。
func assertEqual(t *testing.T, got, want string) {
	t.Helper() // 关键：标记本函数为 helper
	if got != want {
		t.Errorf("got %q, want %q", got, want)
	}
}

func TestReverseWithHelper(t *testing.T) {
	assertEqual(t, Reverse("go"), "og")
	assertEqual(t, Reverse("语言"), "言语")
}
```

`t.Helper()` 是个小细节，却能在测试套件变大后节省大量调试时间。

---

## 第2节：testify——当标准库不够用时

### 2.1 assert vs require

标准库 `testing` 没有链式断言，写起来稍显啰嗦。[testify](https://github.com/testify/testify) 的 `assert` 和 `require` 两个子包是 Go 生态最常用的补充：

- `assert.XXX`：失败后**继续执行**当前测试函数
- `require.XXX`：失败后**立即停止**当前测试函数（适合前置条件检查）

```go
package strutil

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestReverseWithTestify(t *testing.T) {
	cases := []struct {
		name  string
		input string
		want  string
	}{
		{"ascii", "golang", "gnalog"},
		{"unicode", "Go语言", "言语oG"},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			// require：确保输入非空，否则后续断言无意义
			require.NotEmpty(t, tc.input, "input should not be empty")

			got := Reverse(tc.input)
			// assert：失败后仍继续，能看到所有失败 case
			assert.Equal(t, tc.want, got, "Reverse(%q)", tc.input)
		})
	}
}
```

安装 testify：

```bash
go get github.com/stretchr/testify
```

### 2.2 覆盖率报告

```bash
# 生成覆盖率数据并在终端显示
go test -cover ./...

# 生成 HTML 报告，浏览器打开查看哪些行没被覆盖
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out
```

覆盖率不是越高越好，关键是**核心路径**和**边界条件**要覆盖到。追求 100% 覆盖率往往得不偿失。

---

## 第3节：Benchmark——用数据说话

### 3.1 Benchmark 函数的写法

Benchmark 函数命名以 `Benchmark` 开头，参数是 `*testing.B`。核心是 `b.N`——Go 测试框架会自动调整循环次数，直到结果稳定。

```go
package strutil

import (
	"strings"
	"testing"
)

// buildByConcat 用 += 拼接字符串（低效方式）
func buildByConcat(n int) string {
	s := ""
	for i := 0; i < n; i++ {
		s += "x"
	}
	return s
}

// buildByBuilder 用 strings.Builder 拼接字符串（高效方式）
func buildByBuilder(n int) string {
	var b strings.Builder
	for i := 0; i < n; i++ {
		b.WriteByte('x')
	}
	return b.String()
}

// BenchmarkConcat 测试 += 拼接性能
func BenchmarkConcat(b *testing.B) {
	for i := 0; i < b.N; i++ {
		buildByConcat(100)
	}
}

// BenchmarkBuilder 测试 strings.Builder 性能
func BenchmarkBuilder(b *testing.B) {
	for i := 0; i < b.N; i++ {
		buildByBuilder(100)
	}
}
```

运行 Benchmark：

```bash
# -bench=. 匹配所有 Benchmark 函数，-benchmem 显示内存分配
go test -bench=. -benchmem ./...
```

输出示例：

```
BenchmarkConcat-8     500000    2341 ns/op    4944 B/op    99 allocs/op
BenchmarkBuilder-8   5000000     241 ns/op     224 B/op     3 allocs/op
```

**解读**：`strings.Builder` 快了约 10 倍，内存分配次数从 99 次降到 3 次。数字会说话。

### 3.2 b.ResetTimer——排除初始化干扰

当 Benchmark 函数有耗时的初始化逻辑时，需要在正式测量前调用 `b.ResetTimer()`，避免初始化时间污染结果：

```go
package strutil

import (
	"strings"
	"testing"
)

// BenchmarkBuilderWithSetup 演示 b.ResetTimer 的用法
func BenchmarkBuilderWithSetup(b *testing.B) {
	// 模拟耗时的初始化：构建一个大的初始字符串
	initial := strings.Repeat("init", 1000)
	_ = initial

	// 重置计时器：初始化时间不计入 Benchmark 结果
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		buildByBuilder(100)
	}
}
```

类似的还有 `b.StopTimer()` / `b.StartTimer()`，用于在循环内部跳过某段逻辑的计时。

---

## 第4节：pprof——找到性能瓶颈的根

### 4.1 采集 CPU 和内存 Profile

`go test` 可以直接生成 pprof 数据文件，无需修改任何业务代码：

```bash
# 采集 CPU profile（运行所有 Benchmark）
go test -bench=. -cpuprofile=cpu.prof ./...

# 采集内存 profile
go test -bench=. -memprofile=mem.prof ./...
```

### 4.2 用 go tool pprof 分析

```bash
# 进入交互模式分析 CPU profile
go tool pprof cpu.prof

# 常用命令（在 pprof 交互界面输入）：
# top10     — 列出 CPU 占用最高的 10 个函数
# list Func — 显示某函数的逐行 CPU 消耗
# web       — 在浏览器中生成调用图（需要安装 graphviz）
```

也可以一步到位用 HTTP 界面：

```bash
go tool pprof -http=:8080 cpu.prof
```

浏览器打开 `http://localhost:8080` 就能看到 Flame Graph（火焰图）、Top 函数列表等可视化结果。

### 4.3 用一段完整示例串联流程

下面是一个完整的小程序，演示从"写 Benchmark"到"看 pprof"的完整工作流：

```go
// file: concat_bench_test.go
package strutil

import (
	"strings"
	"testing"
)

// BenchmarkConcatVsBuilder 对比两种拼接方式，含内存分配数据
func BenchmarkConcatVsBuilder(b *testing.B) {
	sizes := []int{10, 100, 1000}

	for _, size := range sizes {
		size := size // 循环变量捕获
		b.Run(fmt.Sprintf("concat/size=%d", size), func(b *testing.B) {
			for i := 0; i < b.N; i++ {
				buildByConcat(size)
			}
		})
		b.Run(fmt.Sprintf("builder/size=%d", size), func(b *testing.B) {
			for i := 0; i < b.N; i++ {
				buildByBuilder(size)
			}
		})
	}
}
```

> **注意**：上面用到了 `fmt.Sprintf`，需要在文件顶部 import `"fmt"`。实际使用时确保 import 完整。

运行并生成 profile：

```bash
go test -bench=BenchmarkConcatVsBuilder -benchmem -cpuprofile=cpu.prof ./...
go tool pprof -http=:8080 cpu.prof
```

---

## 第5节：测试工程化——让测试易于维护

### 5.1 测试文件组织

Go 的测试文件有两种组织方式：

| 方式 | 文件名 | package 声明 | 用途 |
|------|--------|-------------|------|
| 白盒测试 | `foo_test.go` | `package foo` | 可访问包内私有成员 |
| 黑盒测试 | `foo_test.go` | `package foo_test` | 只测试公开 API，更贴近使用者视角 |

推荐对核心逻辑用白盒测试，对公开 API 用黑盒测试，两者可以共存于同一目录。

### 5.2 常用 go test 参数速查

```bash
# 只运行名字匹配 "Reverse" 的测试
go test -run TestReverse ./...

# 详细输出每个测试结果
go test -v ./...

# 显示覆盖率
go test -cover ./...

# 禁用测试缓存（强制重跑）
go test -count=1 ./...

# 并行测试（在测试函数内调用 t.Parallel() 配合使用）
go test -parallel 4 ./...

# 运行所有 Benchmark，输出内存分配，限制时间
go test -bench=. -benchmem -benchtime=3s ./...
```

### 5.3 t.Parallel()——加速大型测试套件

对于相互独立的测试，可以加 `t.Parallel()` 让它们并行跑：

```go
package strutil

import "testing"

func TestReverseParallel(t *testing.T) {
	cases := []struct {
		name  string
		input string
		want  string
	}{
		{"ascii", "go", "og"},
		{"unicode", "测试", "试测"},
	}

	for _, tc := range cases {
		tc := tc // 必须捕获循环变量
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel() // 子测试并行执行
			got := Reverse(tc.input)
			if got != tc.want {
				t.Errorf("got %q, want %q", got, tc.want)
			}
		})
	}
}
```

---

## 小结

本讲核心要点：

1. **Table-driven test** 是 Go 社区的惯用写法：`[]struct{name,input,want}` + `for` + `t.Run`，一次写好，覆盖所有边界。
2. **t.Helper()** 标记 helper 函数，让测试失败时的行号准确指向调用处，不要遗漏。
3. **testify/assert vs require**：`assert` 失败继续、`require` 失败立即停止，根据场景选择。
4. **Benchmark 用 b.N 循环**，用 `-benchmem` 看内存分配，`b.ResetTimer()` 排除初始化干扰——数据比感觉可靠。
5. **pprof 是性能优化的终极武器**：`-cpuprofile`/`-memprofile` 生成数据，`go tool pprof -http` 可视化分析，找到真正的热点再优化。

---

> **下一讲**：第10讲·内存与性能
