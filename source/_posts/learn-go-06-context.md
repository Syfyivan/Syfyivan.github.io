---
title: "【Go 精进·第06讲】context：超时与取消的正确姿势"
date: 2026-06-22
tags:
  - Go
  - 语言学习
categories:
  - 技术深潜
series: learn-go
---

> **系列导航** → [课程目录](/courses/learn-go/) · 上一讲：第05讲·channel模式 · 下一讲待写

---

## 引言

写 Go 服务端代码，迟早会遇到这样的场景：一个 HTTP 请求进来，需要查数据库、调下游 RPC、还要写缓存。如果数据库慢了、下游超时了，怎么办？用户的请求早已返回 504，但后台的 goroutine 还在傻乎乎地等着，资源就这样被慢慢耗空。

`context` 是 Go 语言给出的标准答案。它让你能够把「这件事只许花 5 秒」、「用户取消了请求」这类信号，沿着函数调用链一路传递下去，让每一层的代码都有机会及时收手。这不是可选项——凡是涉及 I/O、跨服务调用或长时间计算的代码，都应该接受并传播 `context`。

---

## 第1节：context 的树形结构

### 1.1 根节点从哪里来

所有的 context 都起源于两个根节点之一：

- `context.Background()`：程序主函数、初始化代码、测试用的起点，永不取消、永不超时。
- `context.TODO()`：语义上表示「还不确定该用哪个，先占个位」，编译器和静态分析工具可以识别它，提醒你回头补完。

```go
package main

import (
	"context"
	"fmt"
)

func main() {
	// Background 是所有 context 的根，永不取消
	root := context.Background()
	fmt.Println("root:", root)

	// TODO 是占位符，表示「以后要改」
	placeholder := context.TODO()
	fmt.Println("todo:", placeholder)
}
```

### 1.2 衍生与取消：WithCancel

从根节点出发，可以用 `WithCancel` 衍生出一个可以主动取消的子 context：

```go
package main

import (
	"context"
	"fmt"
	"time"
)

func worker(ctx context.Context, id int) {
	for {
		select {
		case <-ctx.Done():
			// ctx.Err() 告诉你取消的原因
			fmt.Printf("worker %d stopped: %v\n", id, ctx.Err())
			return
		default:
			fmt.Printf("worker %d is running...\n", id)
			time.Sleep(500 * time.Millisecond)
		}
	}
}

func main() {
	root := context.Background()
	// WithCancel 返回子 ctx 和对应的 cancel 函数
	ctx, cancel := context.WithCancel(root)

	go worker(ctx, 1)
	go worker(ctx, 2)

	time.Sleep(1500 * time.Millisecond)

	// 调用 cancel 通知所有监听这个 ctx 的 goroutine
	cancel()

	// 留点时间让 goroutine 打印退出信息
	time.Sleep(200 * time.Millisecond)
	fmt.Println("main exited")
}
```

`cancel()` 被调用后，`ctx.Done()` 这个 channel 会被关闭，所有在 `select` 里监听它的 goroutine 都会收到信号并退出。**`cancel` 必须被调用**——即使 context 已经因超时取消，也应该调用，否则会泄露资源。通常用 `defer cancel()` 确保不忘。

### 1.3 取消信号向下传播，不向上

context 的取消是单向的：父节点取消 → 所有子孙节点同步取消；子节点取消 → 只影响自身和它的子孙，父节点不受影响。

这个设计让你可以给某一个分支操作单独设置超时，而不影响整个请求的其他部分。

---

## 第2节：超时与截止时间

### 2.1 WithTimeout：给操作设一个时限

`WithTimeout(parent, duration)` 等价于 `WithDeadline(parent, time.Now().Add(duration))`，是最常用的形式：

```go
package main

import (
	"context"
	"fmt"
	"time"
)

// simulateSlowDB 模拟一个耗时的数据库查询
func simulateSlowDB(ctx context.Context) (string, error) {
	select {
	case <-time.After(3 * time.Second): // 假设查询需要 3 秒
		return "query result", nil
	case <-ctx.Done():
		return "", ctx.Err() // 返回取消/超时错误
	}
}

func main() {
	// 只给这个操作 1 秒钟
	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
	defer cancel()

	result, err := simulateSlowDB(ctx)
	if err != nil {
		fmt.Println("操作失败:", err) // context deadline exceeded
		return
	}
	fmt.Println("结果:", result)
}
```

运行结果会输出 `操作失败: context deadline exceeded`，因为数据库模拟需要 3 秒，但我们只给了 1 秒。

### 2.2 WithDeadline：指定绝对时间点

当你需要说「这件事必须在 13:00:00 之前完成」时用 `WithDeadline`：

```go
package main

import (
	"context"
	"fmt"
	"time"
)

func main() {
	// 设定一个 2 秒后到期的绝对截止时间
	deadline := time.Now().Add(2 * time.Second)
	ctx, cancel := context.WithDeadline(context.Background(), deadline)
	defer cancel()

	// Deadline() 返回截止时间和是否设置了截止时间
	if d, ok := ctx.Deadline(); ok {
		fmt.Printf("截止时间: %v (还剩 %.1f 秒)\n", d.Format("15:04:05.000"), time.Until(d).Seconds())
	}

	select {
	case <-time.After(3 * time.Second):
		fmt.Println("任务完成")
	case <-ctx.Done():
		fmt.Println("超时:", ctx.Err())
	}
}
```

### 2.3 实战：给 HTTP 请求加 5 秒超时

这是最常见的真实场景——调用外部 HTTP 接口时，必须设置超时，防止对方慢响应把连接池耗光：

```go
package main

import (
	"context"
	"fmt"
	"net/http"
	"time"
)

func fetchWithTimeout(url string) (int, error) {
	// 创建 5 秒超时的 context
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// 用 http.NewRequestWithContext 把 ctx 绑定到请求上
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return 0, fmt.Errorf("创建请求失败: %w", err)
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		// 如果是超时，err 会包含 context deadline exceeded
		return 0, fmt.Errorf("请求失败: %w", err)
	}
	defer resp.Body.Close()

	return resp.StatusCode, nil
}

func main() {
	status, err := fetchWithTimeout("https://httpbin.org/delay/2")
	if err != nil {
		fmt.Println("错误:", err)
		return
	}
	fmt.Println("状态码:", status)
}
```

注意要用 `http.NewRequestWithContext` 而不是老式的 `http.NewRequest` + 手动设 Timeout。前者把 ctx 的生命周期和请求绑定，ctx 取消时连接会被立即中断。

---

## 第3节：在 goroutine 中监听取消

### 3.1 select 监听 ctx.Done()

goroutine 里有耗时循环或阻塞操作时，必须同时监听 `ctx.Done()`：

```go
package main

import (
	"context"
	"fmt"
	"math/rand"
	"time"
)

// processItems 模拟逐条处理队列数据
func processItems(ctx context.Context, items []int) error {
	for _, item := range items {
		// 每次迭代先检查 ctx 是否已取消
		select {
		case <-ctx.Done():
			return fmt.Errorf("处理被取消，已停在 item=%d: %w", item, ctx.Err())
		default:
			// 继续处理
		}

		// 模拟耗时处理（随机 0-300ms）
		processingTime := time.Duration(rand.Intn(300)) * time.Millisecond
		fmt.Printf("处理 item=%d，耗时 %v\n", item, processingTime)

		select {
		case <-time.After(processingTime):
			// 正常完成这个 item
		case <-ctx.Done():
			return fmt.Errorf("item=%d 处理中途被取消: %w", item, ctx.Err())
		}
	}
	return nil
}

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), 500*time.Millisecond)
	defer cancel()

	items := []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}
	if err := processItems(ctx, items); err != nil {
		fmt.Println("终止:", err)
	} else {
		fmt.Println("全部处理完成")
	}
}
```

关键模式：循环体开头的空 `select` 检查（快速路径），以及阻塞操作里的双路 `select`（ctx.Done + 实际操作）。两处都要写，缺一不可。

### 3.2 多层调用链中传递 ctx

ctx 应该作为**函数的第一个参数**向下传递，不要藏进 struct 里：

```go
package main

import (
	"context"
	"fmt"
	"time"
)

// 每一层都接受 ctx 并往下传
func handleRequest(ctx context.Context, userID int) error {
	fmt.Printf("handleRequest: userID=%d\n", userID)
	return queryUserProfile(ctx, userID)
}

func queryUserProfile(ctx context.Context, userID int) error {
	fmt.Printf("queryUserProfile: userID=%d\n", userID)
	return fetchFromDB(ctx, fmt.Sprintf("SELECT * FROM users WHERE id=%d", userID))
}

func fetchFromDB(ctx context.Context, query string) error {
	// 模拟慢查询
	select {
	case <-time.After(200 * time.Millisecond):
		fmt.Printf("DB 查询完成: %s\n", query)
		return nil
	case <-ctx.Done():
		return fmt.Errorf("DB 查询被取消: %w", ctx.Err())
	}
}

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), 100*time.Millisecond)
	defer cancel()

	if err := handleRequest(ctx, 42); err != nil {
		fmt.Println("请求失败:", err)
	}
}
```

每一层都不需要知道超时是怎么设置的，只要透传 ctx，底层的 `fetchFromDB` 就能在 ctx 取消时立刻退出。这是 context 最优雅的地方——取消信号是解耦的。

---

## 第4节：用 ctx.Value 传递请求作用域的值

### 4.1 Value 的正确用途

`context.WithValue` 让你在 ctx 里携带键值对，随调用链传递。但这是一把双刃剑——**只应该用来传递横切关注点**，比如 request ID、trace ID、用户认证信息。不要用它传递函数的业务参数，那会让代码难以测试和理解。

判断标准：如果这个值对函数的逻辑有影响（比如用 ctx 里的值决定查哪张表），应该改成显式参数；如果只是用来打日志、做链路追踪，放 ctx 里是合适的。

### 4.2 用 requestID 串联全链路日志

```go
package main

import (
	"context"
	"fmt"
	"math/rand"
)

// 定义私有类型作为 key，避免和其他包的 key 冲突
type contextKey string

const requestIDKey contextKey = "requestID"

// WithRequestID 把 requestID 注入 ctx
func WithRequestID(ctx context.Context, requestID string) context.Context {
	return context.WithValue(ctx, requestIDKey, requestID)
}

// GetRequestID 从 ctx 里取出 requestID
func GetRequestID(ctx context.Context) string {
	if v, ok := ctx.Value(requestIDKey).(string); ok {
		return v
	}
	return "unknown"
}

// logf 打日志时自动带上 requestID
func logf(ctx context.Context, format string, args ...any) {
	reqID := GetRequestID(ctx)
	fmt.Printf("[%s] "+format+"\n", append([]any{reqID}, args...)...)
}

func handleOrder(ctx context.Context, orderID int) {
	logf(ctx, "开始处理订单 orderID=%d", orderID)
	validateOrder(ctx, orderID)
	chargeUser(ctx, orderID)
	logf(ctx, "订单处理完成 orderID=%d", orderID)
}

func validateOrder(ctx context.Context, orderID int) {
	logf(ctx, "校验订单 orderID=%d", orderID)
}

func chargeUser(ctx context.Context, orderID int) {
	logf(ctx, "扣款 orderID=%d", orderID)
}

func main() {
	// 模拟两个并发请求，各自有独立的 requestID
	for i := 0; i < 2; i++ {
		reqID := fmt.Sprintf("req-%04d", rand.Intn(9999))
		ctx := WithRequestID(context.Background(), reqID)
		go handleOrder(ctx, 1000+i)
	}

	// 等 goroutine 跑完
	fmt.Scanln()
}
```

注意 key 类型用 `type contextKey string` 而不是直接用 `string`。这是为了防止不同包之间的 key 冲突：即使两个包都用了字符串 `"requestID"` 作为 key，只要类型不同，`ctx.Value` 就不会混淆。

---

## 第5节：常见误区与最佳实践

### 5.1 不要把 context 存进 struct

这是新手最常犯的错误：

```go
// 错误示范——永远不要这样做
type Service struct {
    ctx context.DB // 或者存 context.Context
    db  *sql.DB
}

func (s *Service) Query(id int) (User, error) {
    return s.db.QueryContext(s.ctx, "SELECT ...", id)
}
```

问题在于 ctx 的生命周期是单次请求级别的，而 struct 往往是长期存活的。把 ctx 存进 struct，你就失去了对每次调用单独设置超时/取消的能力。

正确做法是让每个方法接受 ctx 参数：

```go
// 正确做法
type Service struct {
    db *sql.DB
}

func (s *Service) Query(ctx context.Context, id int) (User, error) {
    // ctx 来自调用方，每次请求独立
    row := s.db.QueryRowContext(ctx, "SELECT * FROM users WHERE id = ?", id)
    var u User
    if err := row.Scan(&u.ID, &u.Name); err != nil {
        return User{}, err
    }
    return u, nil
}
```

### 5.2 cancel 必须被调用

`WithCancel`、`WithTimeout`、`WithDeadline` 都会分配内部资源，只有调用 `cancel()` 才会释放。标准写法是紧跟 `defer`：

```go
ctx, cancel := context.WithTimeout(parent, 5*time.Second)
defer cancel() // 紧跟在创建语句后面，不要忘
```

即使 ctx 已经因为超时被取消，再调用 `cancel()` 也是安全的（幂等的），所以 `defer cancel()` 永远是对的。

### 5.3 ctx.Err() 区分两种取消原因

```go
package main

import (
	"context"
	"errors"
	"fmt"
	"time"
)

func main() {
	// 案例1：主动取消
	ctx1, cancel := context.WithCancel(context.Background())
	cancel() // 立即取消
	fmt.Println("主动取消:", ctx1.Err())                           // context canceled
	fmt.Println("是 Canceled?", errors.Is(ctx1.Err(), context.Canceled)) // true

	// 案例2：超时取消
	ctx2, cancel2 := context.WithTimeout(context.Background(), 1*time.Millisecond)
	defer cancel2()
	time.Sleep(10 * time.Millisecond) // 等待超时
	fmt.Println("超时取消:", ctx2.Err())                                       // context deadline exceeded
	fmt.Println("是 DeadlineExceeded?", errors.Is(ctx2.Err(), context.DeadlineExceeded)) // true
}
```

用 `errors.Is` 判断具体原因，可以针对超时和主动取消做不同的错误处理（比如超时返回 503，主动取消返回 499）。

---

## 小结

本讲的核心要点：

1. **树形结构**：所有 context 从 `Background()` 衍生，取消信号只向子节点传播，不反向影响父节点。
2. **三种衍生方式**：`WithCancel`（主动取消）、`WithTimeout`（相对超时）、`WithDeadline`（绝对截止时间），本质上是同一套机制。
3. **goroutine 监听模式**：在循环和阻塞操作中，用 `select { case <-ctx.Done(): ... }` 响应取消，两处都要写——循环体开头的 default 检查 + 阻塞操作内的双路 select。
4. **ctx 是第一参数，不入 struct**：函数签名 `func Foo(ctx context.Context, ...)` 是 Go 社区的约定，struct 里只存无状态的依赖，不存请求级别的 ctx。
5. **Value 只传横切关注点**：requestID、traceID、auth token 可以放进 ctx；业务参数必须显式传递；key 类型用私有类型，不用裸字符串。

掌握这五点，你的 Go 代码就有了真正意义上的「超时保护」和「优雅退出」能力。

---

> **下一讲**：第07讲·泛型
