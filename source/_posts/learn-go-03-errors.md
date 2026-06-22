---
title: "【Go 精进·第03讲】错误处理哲学：为什么 Go 不用 Exception"
date: 2026-06-22
tags:
  - Go
  - 语言学习
categories:
  - 技术深潜
series: learn-go
---

> **系列导航** → [课程目录](/courses/learn-go/) · 上一讲：第02讲·接口 · 下一讲待写

---

## 引言

学过 Java、Python 或 JavaScript 的开发者初学 Go 时，往往在第一周就产生困惑：为什么 Go 没有 `try/catch`？为什么函数要返回两个值？为什么错误不能一次性在顶层捕获？

这不是设计者的疏漏，而是一个经过深思熟虑的哲学选择。Go 的创造者们认为，exception 机制会把「正常控制流」和「错误控制流」混在一起，导致代码难以预测、难以审查。Go 选择让错误作为**普通的返回值**显式传递，让每一个调用者都明确面对可能失败的现实。

理解这个哲学，是写出地道 Go 代码的前提。本讲从 `error` 接口的本质出发，逐步覆盖自定义错误、错误链、`errors.Is` / `errors.As`，最后聊清楚 `panic` 的正确使用边界。

---

## 第1节：error 是普通接口，不是语言关键字

### 1.1 error 的真实定义

Go 内置的 `error` 类型看上去像关键字，其实只是标准库预声明的一个接口：

```go
// 这就是 Go 内置 error 接口的全部定义
type error interface {
    Error() string
}
```

任何实现了 `Error() string` 方法的类型，都天然满足 `error` 接口。这意味着「错误」在语言层面没有任何特权，它和你自己定义的任何接口没有区别。

### 1.2 多返回值惯例

Go 函数通过多返回值把错误和正常结果并排返回，调用者被迫在拿到结果的同一行处理错误：

```go
package main

import (
    "errors"
    "fmt"
)

// 模拟一个可能失败的查询
func findUser(id int) (string, error) {
    if id <= 0 {
        return "", errors.New("invalid user id")
    }
    if id > 100 {
        return "", errors.New("user not found")
    }
    return fmt.Sprintf("user-%d", id), nil
}

func main() {
    name, err := findUser(42)
    if err != nil {
        fmt.Println("error:", err)
        return
    }
    fmt.Println("found:", name)

    _, err = findUser(-1)
    if err != nil {
        fmt.Println("error:", err) // error: invalid user id
    }
}
```

`if err != nil` 看上去啰嗦，但它让代码审查者一眼就能判断哪条路径是正常流、哪条是错误流，不需要猜测「哪些异常会从这里抛出」。

---

## 第2节：自定义错误类型

### 2.1 实现 Error() 方法

当 `errors.New` 不够用（比如需要携带额外上下文字段），就实现自定义错误类型：

```go
package main

import "fmt"

// NotFoundError 表示资源不存在的错误，携带资源类型和 ID
type NotFoundError struct {
    Resource string
    ID       int
}

func (e *NotFoundError) Error() string {
    return fmt.Sprintf("%s with id=%d not found", e.Resource, e.ID)
}

func findProduct(id int) (string, error) {
    if id != 7 {
        return "", &NotFoundError{Resource: "product", ID: id}
    }
    return "Go T-Shirt", nil
}

func main() {
    _, err := findProduct(99)
    if err != nil {
        fmt.Println(err) // product with id=99 not found
    }
}
```

### 2.2 Sentinel Error（哨兵错误）

对于「不需要携带额外字段、只需要比较相等」的错误，用包级别变量声明 sentinel error：

```go
package main

import (
    "errors"
    "fmt"
)

// 包级别的 sentinel error，供调用者用 errors.Is 比较
var ErrPermissionDenied = errors.New("permission denied")
var ErrRateLimited = errors.New("rate limited")

func callAPI(token string) error {
    if token == "" {
        return ErrPermissionDenied
    }
    if token == "exhausted" {
        return ErrRateLimited
    }
    return nil
}

func main() {
    err := callAPI("")
    if errors.Is(err, ErrPermissionDenied) {
        fmt.Println("需要重新登录") // 命中这里
    } else if errors.Is(err, ErrRateLimited) {
        fmt.Println("触发限流，稍后重试")
    }
}
```

**命名约定**：sentinel error 以 `Err` 前缀命名；自定义错误类型以 `Error` 后缀命名（如 `NotFoundError`）。

---

## 第3节：错误包装与链路追踪

### 3.1 fmt.Errorf + %w 包装错误

调用链越深，错误越难定位。Go 1.13 引入 `%w` 动词，让你在添加上下文信息的同时保留原始错误，形成**错误链**：

```go
package main

import (
    "errors"
    "fmt"
)

var ErrNotFound = errors.New("not found")

func queryDB(key string) error {
    if key == "" {
        return ErrNotFound
    }
    return nil
}

func getConfig(key string) error {
    if err := queryDB(key); err != nil {
        // %w 把 err 包装进新错误，保留链路
        return fmt.Errorf("getConfig(%q): %w", key, err)
    }
    return nil
}

func loadSettings() error {
    if err := getConfig(""); err != nil {
        return fmt.Errorf("loadSettings: %w", err)
    }
    return nil
}

func main() {
    err := loadSettings()
    fmt.Println(err)
    // loadSettings: getConfig(""): not found

    // 尽管错误被包装了两层，errors.Is 仍能穿透链路找到根因
    fmt.Println(errors.Is(err, ErrNotFound)) // true
}
```

`%w` 包装后，错误消息自动拼接成调用链，便于 debug；`errors.Is` 会递归展开整条链路进行比较。

### 3.2 errors.As 解包自定义类型

当你需要从错误链中提取具体的自定义错误类型（以读取其字段），使用 `errors.As`：

```go
package main

import (
    "errors"
    "fmt"
)

type NotFoundError struct {
    Resource string
    ID       int
}

func (e *NotFoundError) Error() string {
    return fmt.Sprintf("%s id=%d not found", e.Resource, e.ID)
}

func fetchOrder(id int) error {
    return &NotFoundError{Resource: "order", ID: id}
}

func processOrder(id int) error {
    if err := fetchOrder(id); err != nil {
        return fmt.Errorf("processOrder: %w", err)
    }
    return nil
}

func main() {
    err := processOrder(404)

    // errors.As 会沿链路向下找，直到找到可以赋值给 *NotFoundError 的错误
    var nfe *NotFoundError
    if errors.As(err, &nfe) {
        fmt.Printf("资源 [%s] ID=%d 不存在，跳过处理\n", nfe.Resource, nfe.ID)
        // 资源 [order] ID=404 不存在，跳过处理
    }
}
```

**`errors.Is` vs `errors.As` 的选择原则**：
- 用 `errors.Is`：比较错误是否等于某个 sentinel 值（只关心「是不是这种错误」）
- 用 `errors.As`：需要读取错误类型的具体字段（关心「错误里带了什么数据」）

---

## 第4节：panic 与 recover 的正确边界

### 4.1 panic 适用场景

Go 确实有 `panic`，但它**不是 exception 的替代品**。`panic` 只应用于真正不可恢复的程序状态，例如：
- 内部断言失败（程序逻辑Bug，继续运行只会产生错误数据）
- 初始化阶段的必要资源缺失（如强制依赖的配置文件损坏）

**库代码绝对不应该向外 panic**。调用者无法预期库的内部状态，panic 会直接崩溃整个 goroutine 调用栈。

```go
package main

import "fmt"

// 库内部：用 panic 表达编程错误（非运行时错误）
func mustPositive(n int) int {
    if n <= 0 {
        // 这是程序员传参错误，不是运行时业务错误
        panic(fmt.Sprintf("mustPositive: n must be > 0, got %d", n))
    }
    return n
}

func main() {
    fmt.Println(mustPositive(5))  // 5
    fmt.Println(mustPositive(-1)) // panic: mustPositive: n must be > 0, got -1
}
```

### 4.2 recover 捕获 panic

`recover` 只能在 `defer` 函数中生效，用于将 panic 转换回 error，通常出现在框架边界（HTTP handler、worker pool 等）：

```go
package main

import "fmt"

// safeRun 将 panic 转换为 error，防止单个任务崩溃整个进程
func safeRun(task func()) (err error) {
    defer func() {
        if r := recover(); r != nil {
            err = fmt.Errorf("recovered panic: %v", r)
        }
    }()
    task()
    return nil
}

func riskyTask() {
    panic("unexpected state: index out of bounds")
}

func main() {
    err := safeRun(riskyTask)
    if err != nil {
        fmt.Println("任务失败，已恢复:", err)
        // 任务失败，已恢复: recovered panic: unexpected state: index out of bounds
    }
    fmt.Println("程序继续运行") // 这里正常执行
}
```

**核心原则**：
- 业务逻辑用 `error` 返回值，永远不用 `panic`
- `panic` 只用于「不应该发生、一旦发生就是 Bug」的场景
- `recover` 用在框架层边界，防止单个请求/任务的 panic 扩散

---

## 第5节：组合实战

用一个完整示例把本讲知识点串联起来，模拟一个带错误链的用户权限查询：

```go
package main

import (
    "errors"
    "fmt"
)

// --- 错误类型定义 ---

var ErrUnauthorized = errors.New("unauthorized")

type DBError struct {
    Query string
    Cause error
}

func (e *DBError) Error() string {
    return fmt.Sprintf("db error on query %q: %v", e.Query, e.Cause)
}

func (e *DBError) Unwrap() error {
    return e.Cause
}

// --- 模拟调用链 ---

func queryPermission(userID int) (bool, error) {
    if userID == 0 {
        return false, &DBError{
            Query: "SELECT permission FROM users WHERE id=0",
            Cause: errors.New("invalid user id"),
        }
    }
    if userID == 999 {
        return false, ErrUnauthorized
    }
    return true, nil
}

func checkAccess(userID int, resource string) error {
    ok, err := queryPermission(userID)
    if err != nil {
        return fmt.Errorf("checkAccess(%s): %w", resource, err)
    }
    if !ok {
        return fmt.Errorf("checkAccess(%s): %w", resource, ErrUnauthorized)
    }
    return nil
}

// --- 调用方处理 ---

func main() {
    // 场景1：DBError 链路
    err := checkAccess(0, "admin-panel")
    if err != nil {
        fmt.Println(err)

        var dbErr *DBError
        if errors.As(err, &dbErr) {
            fmt.Printf("  -> DB 查询失败，语句: %s\n", dbErr.Query)
        }
    }

    fmt.Println()

    // 场景2：sentinel error 透传
    err = checkAccess(999, "dashboard")
    if err != nil {
        fmt.Println(err)
        if errors.Is(err, ErrUnauthorized) {
            fmt.Println("  -> 用户无权限，跳转登录页")
        }
    }

    fmt.Println()

    // 场景3：正常路径
    err = checkAccess(1, "dashboard")
    if err == nil {
        fmt.Println("访问通过")
    }
}
```

---

## 小结

本讲核心要点：

1. **error 是普通接口**：`type error interface { Error() string }`，没有任何语言特权，和普通接口完全一致
2. **自定义错误类型**：实现 `Error() string` 即可，命名用 `XxxError`；sentinel 用包变量，命名用 `ErrXxx`
3. **fmt.Errorf("%w", err)**：在添加上下文的同时保留错误链，是 Go 1.13+ 的标准包装方式
4. **errors.Is / errors.As**：`Is` 比较链路中是否存在某个 sentinel；`As` 从链路中提取具体类型并读取字段
5. **panic 只用于不可恢复的程序 Bug**：业务错误永远用 `error` 返回值；库代码禁止向外 panic；`recover` 用在框架边界层

---

> **下一讲**：第04讲·goroutine 核心
