---
title: "【Go 精进·第11讲】常见设计模式：Go 风格的抽象"
date: 2026-06-22
tags:
  - Go
  - 语言学习
categories:
  - 技术深潜
series: learn-go
---

> **系列导航** → [课程目录](/courses/learn-go/) · 上一讲：第10讲·内存与性能 · 下一讲待写

---

Go 不是一门"设计模式驱动"的语言。它没有继承，没有泛型装饰器（1.18 之前），没有注解。然而，越深入工程实践，越会发现：Go 社区总结出了一套极其务实的惯用模式，它们不是四人组那本书的直接翻译，而是经过 goroutine、接口、闭包重新提炼后的产物。

本讲聚焦六个高频模式：**Functional Options、依赖注入、中间件链、无锁计数、单例初始化、errgroup 并发聚合**。掌握它们，你写出的代码才能真正叫做"Go 风格"——而不是披着 Go 外衣的 Java。

---

## 第1节：Functional Options — 优雅的可选参数

### 1.1 为什么不用结构体或多参数

当一个构造函数需要十几个可选参数时，最朴素的做法是传一个 `Config` 结构体。但调用方必须填写所有字段，哪怕大多数用默认值，代码也不直观。`Functional Options` 模式用闭包解决了这个问题。

### 1.2 模式实现

```go
package main

import (
	"fmt"
	"net/http"
	"time"
)

// HTTPClient 是我们要配置的对象
type HTTPClient struct {
	timeout    time.Duration
	maxRetries int
	baseURL    string
	headers    map[string]string
}

// Option 是一个修改 HTTPClient 的函数类型
type Option func(*HTTPClient)

// WithTimeout 返回设置超时的 Option
func WithTimeout(d time.Duration) Option {
	return func(c *HTTPClient) {
		c.timeout = d
	}
}

// WithMaxRetries 返回设置最大重试次数的 Option
func WithMaxRetries(n int) Option {
	return func(c *HTTPClient) {
		c.maxRetries = n
	}
}

// WithBaseURL 返回设置 baseURL 的 Option
func WithBaseURL(url string) Option {
	return func(c *HTTPClient) {
		c.baseURL = url
	}
}

// WithHeader 返回追加请求头的 Option
func WithHeader(key, value string) Option {
	return func(c *HTTPClient) {
		if c.headers == nil {
			c.headers = make(map[string]string)
		}
		c.headers[key] = value
	}
}

// NewHTTPClient 使用默认值构造，再依次应用所有 Option
func NewHTTPClient(opts ...Option) *HTTPClient {
	// 定义默认值
	c := &HTTPClient{
		timeout:    10 * time.Second,
		maxRetries: 3,
		baseURL:    "https://api.example.com",
	}
	for _, opt := range opts {
		opt(c)
	}
	return c
}

func (c *HTTPClient) Do(path string) (*http.Response, error) {
	url := c.baseURL + path
	client := &http.Client{Timeout: c.timeout}
	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	for k, v := range c.headers {
		req.Header.Set(k, v)
	}
	return client.Do(req)
}

func main() {
	// 调用方只需传入关心的选项，其余保持默认
	client := NewHTTPClient(
		WithTimeout(5*time.Second),
		WithMaxRetries(1),
		WithHeader("Authorization", "Bearer token-xyz"),
	)
	fmt.Printf("client: timeout=%v retries=%d baseURL=%s\n",
		client.timeout, client.maxRetries, client.baseURL)
}
```

**核心规律**：`type Option func(*T)` + `WithXxx` 返回闭包 + 构造函数 `...Option`。调用方的代码像声明式配置，可读性极强，且向后兼容：新增 `Option` 不需要改函数签名。

---

## 第2节：依赖注入 — 通过接口而非 new

### 2.1 为什么要注入依赖

硬编码 `db := sql.Open(...)` 在生产代码里，单元测试就无法替换成 mock。Go 的接口是结构性的（无需显式 `implements`），这让依赖注入天然简洁。

### 2.2 接口注入示例

```go
package main

import (
	"fmt"
)

// UserStore 定义数据访问的接口
type UserStore interface {
	FindByID(id int) (string, error)
}

// MySQLUserStore 是真实的数据库实现
type MySQLUserStore struct{}

func (s *MySQLUserStore) FindByID(id int) (string, error) {
	// 实际代码会查询 MySQL
	return fmt.Sprintf("user_%d_from_mysql", id), nil
}

// MockUserStore 是测试用的 mock 实现
type MockUserStore struct {
	data map[int]string
}

func (m *MockUserStore) FindByID(id int) (string, error) {
	if name, ok := m.data[id]; ok {
		return name, nil
	}
	return "", fmt.Errorf("user %d not found", id)
}

// UserService 依赖接口，而不是具体类型
type UserService struct {
	store UserStore
}

// NewUserService 构造时注入依赖
func NewUserService(store UserStore) *UserService {
	return &UserService{store: store}
}

func (svc *UserService) GetUserName(id int) (string, error) {
	return svc.store.FindByID(id)
}

func main() {
	// 生产环境：注入真实实现
	// svc := NewUserService(&MySQLUserStore{})

	// 测试 / 演示：注入 mock
	mock := &MockUserStore{data: map[int]string{1: "Alice", 2: "Bob"}}
	svc := NewUserService(mock)

	name, err := svc.GetUserName(1)
	if err != nil {
		fmt.Println("error:", err)
		return
	}
	fmt.Println("got user:", name) // got user: Alice
}
```

**原则**：构造函数接收接口，测试直接传 mock，不需要任何反射或 DI 框架。这是 Go 最朴素也最有力的测试策略。

---

## 第3节：中间件链 — 洋葱模型

### 3.1 中间件的本质

HTTP 中间件的类型签名是 `func(http.Handler) http.Handler`：接收一个 handler，返回一个包装后的 handler。多个中间件串联，形成洋葱结构：请求从外向内穿透，响应从内向外冒出。

### 3.2 日志 + 超时中间件示例

```go
package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"time"
)

// Middleware 是中间件的类型别名，提升可读性
type Middleware func(http.Handler) http.Handler

// Chain 将多个中间件串联为一个
func Chain(middlewares ...Middleware) Middleware {
	return func(final http.Handler) http.Handler {
		// 从最后一个向前包装，保证执行顺序与传入顺序一致
		for i := len(middlewares) - 1; i >= 0; i-- {
			final = middlewares[i](final)
		}
		return final
	}
}

// Logger 中间件：记录请求路径和耗时
func Logger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		log.Printf("[START] %s %s", r.Method, r.URL.Path)
		next.ServeHTTP(w, r)
		log.Printf("[END]   %s %s took %v", r.Method, r.URL.Path, time.Since(start))
	})
}

// Timeout 中间件：为每个请求注入超时 context
func Timeout(d time.Duration) Middleware {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx, cancel := context.WithTimeout(r.Context(), d)
			defer cancel()
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// helloHandler 是业务逻辑 handler
func helloHandler(w http.ResponseWriter, r *http.Request) {
	// 模拟业务耗时
	time.Sleep(50 * time.Millisecond)
	fmt.Fprintln(w, "Hello, Go middleware!")
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/hello", helloHandler)

	// 应用中间件链：Logger → Timeout(3s) → 业务 handler
	chain := Chain(Logger, Timeout(3*time.Second))
	handler := chain(mux)

	log.Println("server listening on :8080")
	if err := http.ListenAndServe(":8080", handler); err != nil {
		log.Fatal(err)
	}
}
```

**执行顺序**（洋葱模型）：Logger 进入 → Timeout 进入 → 业务处理 → Timeout 退出 → Logger 退出并打印耗时。

---

## 第4节：sync/atomic 与 sync.Once — 无锁并发原语

### 4.1 atomic.Int64 无锁计数

互斥锁 `sync.Mutex` 解决了并发安全，但对简单整数加减操作，锁的开销偏大。`sync/atomic` 提供 CPU 级别的原子操作，性能更高。

```go
package main

import (
	"fmt"
	"sync"
	"sync/atomic"
)

func main() {
	var counter atomic.Int64
	var wg sync.WaitGroup

	// 100 个 goroutine 并发自增
	for range 100 {
		wg.Add(1)
		go func() {
			defer wg.Done()
			counter.Add(1)
		}()
	}
	wg.Wait()
	fmt.Println("counter:", counter.Load()) // 必然输出 100
}
```

`atomic.Int64`（Go 1.19+）比裸 `atomic.AddInt64` 更安全，禁止了对象的值拷贝，推荐优先使用。

### 4.2 sync.Once 单例初始化

`sync.Once` 保证某段初始化代码在并发环境下只执行一次，常用于全局配置、数据库连接池的懒加载。

```go
package main

import (
	"fmt"
	"sync"
)

type Config struct {
	DSN string
}

var (
	globalConfig *Config
	once         sync.Once
)

// GetConfig 保证并发安全的单例初始化
func GetConfig() *Config {
	once.Do(func() {
		fmt.Println("initializing config...") // 只会打印一次
		globalConfig = &Config{DSN: "postgres://localhost/mydb"}
	})
	return globalConfig
}

func main() {
	var wg sync.WaitGroup
	for range 5 {
		wg.Add(1)
		go func() {
			defer wg.Done()
			cfg := GetConfig()
			fmt.Println("got DSN:", cfg.DSN)
		}()
	}
	wg.Wait()
}
```

无论多少个 goroutine 竞争，`once.Do` 内的函数只执行一次，其他 goroutine 会阻塞直到初始化完成。

---

## 第5节：errgroup — 并发任务与错误聚合

### 5.1 为什么不直接用 WaitGroup

`sync.WaitGroup` 不负责错误传播。当多个并发任务中的某一个失败时，如何取消其他任务并收集错误？`golang.org/x/sync/errgroup` 解决了这个问题。

### 5.2 errgroup 并发执行多任务

```go
package main

import (
	"context"
	"fmt"
	"time"

	"golang.org/x/sync/errgroup"
)

// fetchData 模拟一个可能失败的远程调用
func fetchData(ctx context.Context, name string, delay time.Duration, fail bool) (string, error) {
	select {
	case <-ctx.Done():
		return "", fmt.Errorf("%s: context cancelled: %w", name, ctx.Err())
	case <-time.After(delay):
	}
	if fail {
		return "", fmt.Errorf("%s: remote error", name)
	}
	return fmt.Sprintf("%s: ok", name), nil
}

func main() {
	// WithContext 返回的 ctx 会在任一 goroutine 返回非 nil error 时自动取消
	g, ctx := errgroup.WithContext(context.Background())

	results := make([]string, 3)

	g.Go(func() error {
		res, err := fetchData(ctx, "service-A", 100*time.Millisecond, false)
		if err != nil {
			return err
		}
		results[0] = res
		return nil
	})

	g.Go(func() error {
		res, err := fetchData(ctx, "service-B", 200*time.Millisecond, false)
		if err != nil {
			return err
		}
		results[1] = res
		return nil
	})

	g.Go(func() error {
		// service-C 会失败，触发 ctx 取消，其他还在 select 的 goroutine 收到信号
		res, err := fetchData(ctx, "service-C", 50*time.Millisecond, true)
		if err != nil {
			return err
		}
		results[2] = res
		return nil
	})

	// Wait 等待所有 goroutine 完成，返回第一个非 nil error
	if err := g.Wait(); err != nil {
		fmt.Println("got error:", err)
	} else {
		fmt.Println("all results:", results)
	}
}
```

**要点**：`errgroup.WithContext` 创建了一个联动的 context；任意 goroutine 返回 error，ctx 立即取消，其他 goroutine 可通过 `ctx.Done()` 感知并提前退出。这是 Go 中"快速失败"并发模型的标准写法。

> 注意：使用前需 `go get golang.org/x/sync`，在模块项目中执行一次即可。

---

## 小结

本讲涵盖了 Go 工程中最高频的六个模式，核心要点如下：

1. **Functional Options**：`type Option func(*T)` + `WithXxx` 闭包，让构造函数向后兼容且自文档化。
2. **依赖注入**：构造函数接收接口而非具体类型，天然支持 mock，无需 DI 框架。
3. **中间件链**：`func(http.Handler) http.Handler` 包装器 + `Chain` 函数，实现洋葱模型，职责清晰。
4. **atomic + Once**：`atomic.Int64` 用于高频计数，`sync.Once` 用于懒加载单例，二者都是比 Mutex 更轻的并发原语。
5. **errgroup**：并发任务的标准错误聚合方案，配合 `WithContext` 实现快速失败与优雅取消。

这些模式不是孤立的技巧，它们背后共享同一个 Go 哲学：**组合优于继承，接口优于类型断言，显式优于魔法**。在日常 Code Review 中，看到 `Functional Options` 就能判断这个库是否考虑过扩展性；看到 `errgroup` 就能判断并发错误处理是否完整——它们是 Go 工程师之间的"暗语"。

---

> **下一讲**：第12讲·CLI工具实战
