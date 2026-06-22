---
title: "【Go 精进·第04讲】goroutine 核心：并发不是并行"
date: 2026-06-22
tags:
  - Go
  - 语言学习
categories:
  - 技术深潜
series: learn-go
---

> **系列导航** → [课程目录](/courses/learn-go/) · 上一讲：第03讲·错误处理 · 下一讲待写

## 引言

Go 的并发模型是它最大的竞争优势之一，也是最容易踩坑的地方。很多人初学 Go 时会把"并发"和"并行"混为一谈：以为开了多个 goroutine 就能跑得更快，或者以为并发一定意味着多核利用。Rob Pike 有句名言——**并发是结构问题，并行是执行问题**。理解这句话，是用好 goroutine 的前提。

本讲从 goroutine 的本质出发，带你看清 GMP 调度模型的轮廓，识别三种最常见的 goroutine 泄漏场景，并通过 `sync.WaitGroup` 和 `sync.Mutex` 写出正确、可维护的并发代码。如果你打算在生产环境用 Go 写服务，这一讲不能跳过。

---

## 第1节：goroutine 不是线程

### 1.1 轻量到什么程度

操作系统线程（OS Thread）的初始栈通常是 1MB 到 8MB，创建、销毁的开销也不小。goroutine 的初始栈只有 **2KB**，可以按需自动增长（上限默认 1GB），销毁时由运行时回收，完全不需要程序员手动管理。

实际上，在一个普通的 Go 服务里同时跑几万个 goroutine 完全正常；而几万个 OS 线程则会把系统压垮。

```go
package main

import (
	"fmt"
	"runtime"
	"time"
)

func main() {
	// 查看当前系统逻辑 CPU 数（也是 GOMAXPROCS 默认值）
	fmt.Println("GOMAXPROCS:", runtime.GOMAXPROCS(0))

	// 启动 10000 个 goroutine，每个只做轻量工作
	const N = 10000
	done := make(chan struct{}, N)
	for i := range N {
		go func(id int) {
			// 模拟轻量任务
			_ = id * id
			done <- struct{}{}
		}(i)
	}
	for range N {
		<-done
	}
	fmt.Println("全部 goroutine 完成")

	// 打印当前存活的 goroutine 数量
	time.Sleep(10 * time.Millisecond)
	fmt.Println("存活 goroutine 数:", runtime.NumGoroutine())
}
```

运行后你会发现，10000 个 goroutine 创建和销毁的时间往往在几十毫秒内完成，内存峰值也非常可控。

### 1.2 goroutine 的生命周期

goroutine 以 `go` 关键字启动，运行时自动调度，运行结束后自动退出。没有显式的"join"操作——如果你需要等待它完成，必须通过 channel 或 `sync.WaitGroup` 来协调。这也是泄漏风险的来源，后面第3节会详细讲。

---

## 第2节：GMP 调度模型

### 2.1 三个核心概念

Go 运行时用 GMP 模型来管理并发：

| 字母 | 含义 | 说明 |
|------|------|------|
| G | Goroutine | 携带函数入口和栈的并发执行单元 |
| M | Machine（OS 线程） | 真正执行代码的内核线程 |
| P | Processor（逻辑处理器） | 调度队列 + 本地 G 队列，数量由 GOMAXPROCS 决定 |

每个 P 维护一个本地 G 队列，M 必须绑定一个 P 才能执行 G。当一个 M 阻塞（比如系统调用），P 会被"抢走"并绑定到另一个 M 上，保证 CPU 不空转。这就是 Go 能在少量 OS 线程上高效调度海量 goroutine 的核心机制。

### 2.2 GOMAXPROCS 的影响

```go
package main

import (
	"fmt"
	"runtime"
	"sync"
	"time"
)

func cpuBound(wg *sync.WaitGroup) {
	defer wg.Done()
	sum := 0
	for i := range 1_000_000 {
		sum += i
	}
	_ = sum
}

func benchmark(procs int) time.Duration {
	runtime.GOMAXPROCS(procs)
	var wg sync.WaitGroup
	start := time.Now()
	for range 8 {
		wg.Add(1)
		go cpuBound(&wg)
	}
	wg.Wait()
	return time.Since(start)
}

func main() {
	// 对比单核与多核下 CPU 密集型任务的耗时
	fmt.Printf("GOMAXPROCS=1: %v\n", benchmark(1))
	fmt.Printf("GOMAXPROCS=4: %v\n", benchmark(4))
	// 恢复默认
	runtime.GOMAXPROCS(runtime.NumCPU())
}
```

**关键结论**：只有 CPU 密集型任务才能从增大 GOMAXPROCS 中获益。IO 密集型任务（网络、磁盘）不需要调整——Go 的异步 IO 本来就不会占住 M。

---

## 第3节：goroutine 泄漏三种场景

goroutine 泄漏是 Go 服务最常见的内存问题。泄漏的本质是：**goroutine 启动了，但永远不会退出**。

### 3.1 channel 永久阻塞

```go
package main

import (
	"fmt"
	"runtime"
	"time"
)

func leakByChannel() {
	ch := make(chan int) // 无缓冲，且没有任何人会往里写
	go func() {
		// 这个 goroutine 会永远阻塞在这里
		val := <-ch
		fmt.Println("收到:", val)
	}()
}

func main() {
	fmt.Println("启动前 goroutine 数:", runtime.NumGoroutine())
	for range 5 {
		leakByChannel()
	}
	time.Sleep(100 * time.Millisecond)
	// 5 个泄漏的 goroutine + 1 个 main = 6
	fmt.Println("启动后 goroutine 数:", runtime.NumGoroutine())
}
```

**修复方法**：传入 `context.Context` 或 done channel，让 goroutine 在需要退出时能感知到信号并返回。

### 3.2 等待永远不会完成的 goroutine

```go
package main

import (
	"fmt"
	"runtime"
	"sync"
	"time"
)

func leakByWaitGroup() {
	var wg sync.WaitGroup
	wg.Add(2) // 声明要等 2 个，但只启动了 1 个

	go func() {
		defer wg.Done()
		time.Sleep(10 * time.Millisecond)
		fmt.Println("goroutine 完成")
	}()

	// 注意：这里直接返回了，没有调用 wg.Wait()
	// 如果调用 wg.Wait()，它将永远阻塞，因为 wg.Add(2) 但只有 1 个 Done
	_ = wg
}

func main() {
	fmt.Println("WaitGroup 计数不匹配示例")
	leakByWaitGroup()
	time.Sleep(50 * time.Millisecond)
	fmt.Println("存活 goroutine:", runtime.NumGoroutine())
}
```

**修复方法**：`wg.Add(n)` 的 n 必须严格等于实际启动的 goroutine 数量，并且每个 goroutine 必须在退出前调用 `wg.Done()`（用 `defer` 保证）。

### 3.3 select 死循环无退出路径

```go
package main

import (
	"context"
	"fmt"
	"time"
)

// 错误写法：没有退出条件
func badWorker(ch <-chan int) {
	go func() {
		for {
			select {
			case v := <-ch:
				fmt.Println("处理:", v)
			}
			// ch 关闭后，case 会一直收到零值，死循环
		}
	}()
}

// 正确写法：带 context 退出
func goodWorker(ctx context.Context, ch <-chan int) {
	go func() {
		for {
			select {
			case <-ctx.Done():
				fmt.Println("worker 退出:", ctx.Err())
				return
			case v, ok := <-ch:
				if !ok {
					fmt.Println("channel 关闭，worker 退出")
					return
				}
				fmt.Println("处理:", v)
			}
		}
	}()
}

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), 100*time.Millisecond)
	defer cancel()

	ch := make(chan int, 3)
	goodWorker(ctx, ch)

	ch <- 1
	ch <- 2
	ch <- 3

	<-ctx.Done()
	time.Sleep(10 * time.Millisecond)
	fmt.Println("main 退出")
}
```

---

## 第4节：sync.WaitGroup 并发处理切片

### 4.1 基本用法

`sync.WaitGroup` 是协调"等待一批 goroutine 全部完成"的标准工具。核心三步：`Add` → `go func + Done` → `Wait`。

```go
package main

import (
	"fmt"
	"sync"
	"time"
)

// processItem 模拟处理单个任务（耗时操作）
func processItem(id int, duration time.Duration) string {
	time.Sleep(duration)
	return fmt.Sprintf("item-%d 完成", id)
}

func main() {
	items := []time.Duration{
		50 * time.Millisecond,
		30 * time.Millisecond,
		80 * time.Millisecond,
		20 * time.Millisecond,
		60 * time.Millisecond,
	}

	results := make([]string, len(items))
	var wg sync.WaitGroup

	start := time.Now()
	for i, d := range items {
		wg.Add(1)
		// 注意：必须把循环变量作为参数传入，避免闭包捕获问题
		// Go 1.22+ 循环变量语义已修复，但显式传参仍是好习惯
		go func(idx int, dur time.Duration) {
			defer wg.Done()
			results[idx] = processItem(idx, dur)
		}(i, d)
	}

	wg.Wait()
	fmt.Printf("全部完成，耗时 %v（串行需约 240ms）\n", time.Since(start))
	for _, r := range results {
		fmt.Println(" ", r)
	}
}
```

### 4.2 带错误收集的并发模式

```go
package main

import (
	"errors"
	"fmt"
	"sync"
)

func riskyTask(id int) error {
	if id%3 == 0 {
		return fmt.Errorf("task %d 失败", id)
	}
	return nil
}

func main() {
	var (
		wg   sync.WaitGroup
		mu   sync.Mutex
		errs []error
	)

	for i := range 9 {
		wg.Add(1)
		go func(id int) {
			defer wg.Done()
			if err := riskyTask(id); err != nil {
				mu.Lock()
				errs = append(errs, err)
				mu.Unlock()
			}
		}(i)
	}

	wg.Wait()
	fmt.Println("错误列表:", errors.Join(errs...))
}
```

---

## 第5节：sync.Mutex 保护共享状态

### 5.1 为什么需要 Mutex

多个 goroutine 同时读写同一个变量，在没有同步机制的情况下会产生**数据竞争（data race）**，结果不可预测。`sync.Mutex` 提供互斥锁，确保同一时刻只有一个 goroutine 能进入临界区。

```go
package main

import (
	"fmt"
	"sync"
)

type SafeCounter struct {
	mu    sync.Mutex
	count int
}

func (c *SafeCounter) Inc() {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.count++
}

func (c *SafeCounter) Value() int {
	c.mu.Lock()
	defer c.mu.Unlock()
	return c.count
}

func main() {
	var wg sync.WaitGroup
	counter := &SafeCounter{}

	for range 1000 {
		wg.Add(1)
		go func() {
			defer wg.Done()
			counter.Inc()
		}()
	}

	wg.Wait()
	fmt.Println("最终计数:", counter.Value()) // 始终输出 1000
}
```

### 5.2 用 -race 检测数据竞争

Go 内置的竞争检测器是排查并发 bug 的神器，开发和测试阶段应该常用：

```bash
# 编译时开启竞争检测
go run -race main.go

# 测试时开启
go test -race ./...
```

以下是一个**故意有竞争**的反例，用于演示 `-race` 的输出：

```go
package main

import (
	"fmt"
	"sync"
)

// 警告：这段代码有数据竞争，仅用于演示
func main() {
	var wg sync.WaitGroup
	count := 0 // 没有保护的共享变量

	for range 100 {
		wg.Add(1)
		go func() {
			defer wg.Done()
			count++ // DATA RACE: 并发写
		}()
	}

	wg.Wait()
	fmt.Println("count（不可信）:", count)
}
```

用 `go run -race` 运行上面代码，你会看到类似 `WARNING: DATA RACE` 的报告，精确定位到竞争的文件和行号。

---

## 小结

本讲的五个核心要点：

1. **goroutine 极轻量**：初始栈 2KB，创建成本接近函数调用，生产环境跑几万个完全正常。
2. **GMP 模型**：G 是 goroutine，M 是 OS 线程，P 是调度器；GOMAXPROCS 控制 P 的数量，决定真正的并行度。
3. **三种泄漏场景**：channel 永久阻塞、WaitGroup 计数不匹配、select 无退出路径——每一种都需要通过 context 或 done channel 提供退出信号。
4. **WaitGroup 的正确姿势**：`Add` 在启动 goroutine 之前调用，`Done` 用 `defer` 保证执行，`Wait` 阻塞直到计数归零。
5. **Mutex 保护临界区，`-race` 验证正确性**：开发阶段用 `go test -race` 是发现并发 bug 的最低成本方式。

---

> **下一讲**：第05讲·channel 模式：pipeline、fan-out/fan-in 与 select 超时控制
