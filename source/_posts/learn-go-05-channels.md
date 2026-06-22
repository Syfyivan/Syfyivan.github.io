---
title: "【Go 精进·第05讲】channel 模式：用通信共享内存"
date: 2026-06-22
tags:
  - Go
  - 语言学习
categories:
  - 技术深潜
series: learn-go
---

> **系列导航** → [课程目录](/courses/learn-go/) · 上一讲：第04讲·goroutine核心 · 下一讲待写

## 引言

上一讲我们深入了解了 goroutine 的创建与调度。goroutine 轻量、并发，但如果多个 goroutine 共享同一块内存，就不可避免地要面对数据竞争（data race）的问题。许多语言选择用锁来解决这个问题，而 Go 给出了另一条路：**用通信共享内存，而不是用共享内存通信（Don't communicate by sharing memory; share memory by communicating）**。

channel 是 Go 实现这一哲学的核心机制。它不只是一个线程安全的队列，更是 goroutine 之间协调、同步、传递控制权的通用"管道"。理解 channel 的各种模式，是写出惯用 Go 并发代码的前提。本讲将从最基础的无缓冲/有缓冲 channel 出发，逐步拆解 select、fan-out、pipeline、done channel 五种核心模式，每个模式都配有可运行的完整示例。

---

## 第1节：无缓冲与有缓冲 channel

### 1.1 无缓冲 channel：天然同步点

无缓冲 channel 的发送方和接收方必须**同时就绪**才能完成一次传递。这就像两个人面对面交接文件——双方都到了才能完成，任意一方先到都会等待。

```go
package main

import (
	"fmt"
	"time"
)

func main() {
	ch := make(chan string) // 无缓冲

	go func() {
		time.Sleep(500 * time.Millisecond)
		fmt.Println("worker: 准备好了，发送数据")
		ch <- "hello"
	}()

	fmt.Println("main: 等待 worker...")
	msg := <-ch // 阻塞，直到 goroutine 发送
	fmt.Println("main: 收到 →", msg)
}
```

输出顺序是确定的：`main` 先打印等待信息，然后阻塞，500ms 后 worker 发送，`main` 收到并继续。无缓冲 channel 的本质是**同步原语**，可以替代某些场景下的互斥锁。

### 1.2 有缓冲 channel：异步队列

有缓冲 channel 相当于一个固定容量的队列。发送方在队列未满时不阻塞；接收方在队列非空时不阻塞。这给了生产者和消费者之间一定的**解耦空间**。

```go
package main

import "fmt"

func main() {
	ch := make(chan int, 3) // 缓冲容量为 3

	// 发送 3 条消息，不会阻塞
	ch <- 1
	ch <- 2
	ch <- 3

	fmt.Println("队列长度:", len(ch), "容量:", cap(ch))

	// 关闭后仍可读取已有数据
	close(ch)
	for v := range ch {
		fmt.Println("收到:", v)
	}
}
```

关闭 channel 后，接收方仍能读出缓冲中已有的数据，直到队列为空。`range ch` 会自动在 channel 关闭且为空时退出循环——这是非常常用的消费模式。

---

## 第2节：select 多路复用

### 2.1 基本 select：监听多个 channel

当一个 goroutine 需要同时等待多个 channel 时，使用 `select`。它类似 `switch`，但每个 `case` 都是一次 channel 操作，哪个 case 就绪就执行哪个。

```go
package main

import (
	"fmt"
	"time"
)

func ping(ch chan<- string, delay time.Duration, msg string) {
	time.Sleep(delay)
	ch <- msg
}

func main() {
	ch1 := make(chan string, 1)
	ch2 := make(chan string, 1)

	go ping(ch1, 200*time.Millisecond, "来自 ch1")
	go ping(ch2, 100*time.Millisecond, "来自 ch2")

	// 等待任意一个先到达
	for i := 0; i < 2; i++ {
		select {
		case msg := <-ch1:
			fmt.Println("收到:", msg)
		case msg := <-ch2:
			fmt.Println("收到:", msg)
		}
	}
}
```

`ch2` 延迟更短，所以第一次 select 会命中 `ch2`，第二次命中 `ch1`。

### 2.2 非阻塞 select：default 分支

加上 `default` 分支后，select 变成非阻塞操作——如果所有 channel 都未就绪，立刻走 `default`。

```go
package main

import "fmt"

func tryReceive(ch <-chan int) (int, bool) {
	select {
	case v := <-ch:
		return v, true
	default:
		return 0, false
	}
}

func main() {
	ch := make(chan int, 1)

	if v, ok := tryReceive(ch); ok {
		fmt.Println("有数据:", v)
	} else {
		fmt.Println("暂无数据，继续做其他事")
	}

	ch <- 42
	if v, ok := tryReceive(ch); ok {
		fmt.Println("有数据:", v)
	}
}
```

非阻塞 select 常用于**轮询**场景：主循环每次先尝试从 channel 拿任务，拿不到就处理默认逻辑，避免死等。

---

## 第3节：pipeline 三阶段流水线

### 3.1 pipeline 的思路

pipeline 把一个计算过程分解成多个**串行阶段**，每个阶段是一个独立的 goroutine，通过 channel 传递数据。上游产出的数据立刻进入下游处理，整体实现流式并发。

### 3.2 三阶段实现：生成 → 平方 → 打印

```go
package main

import "fmt"

// 第一阶段：生成数字序列
func generate(nums ...int) <-chan int {
	out := make(chan int)
	go func() {
		for _, n := range nums {
			out <- n
		}
		close(out)
	}()
	return out
}

// 第二阶段：对每个数求平方
func square(in <-chan int) <-chan int {
	out := make(chan int)
	go func() {
		for n := range in {
			out <- n * n
		}
		close(out)
	}()
	return out
}

func main() {
	// 连接 pipeline：generate → square → 打印
	c := generate(2, 3, 4, 5, 6)
	out := square(c)

	// 第三阶段：消费并打印
	for v := range out {
		fmt.Println(v) // 4 9 16 25 36
	}
}
```

每个阶段函数接收一个只读 channel，返回一个只读 channel，签名清晰，职责单一。关闭 channel 是**上游的责任**，下游通过 `range` 自然终止。

---

## 第4节：fan-out 并发处理

### 4.1 fan-out 的适用场景

当一批任务彼此独立、耗时较长（如 HTTP 请求、IO 操作）时，逐个串行处理太慢。fan-out 模式：**一个输入 channel，多个 worker goroutine 并发消费**，结果汇总到一个输出 channel。

### 4.2 并发处理 URL 列表

```go
package main

import (
	"fmt"
	"sync"
	"time"
)

// 模拟 HTTP 请求，返回状态码
func fetchURL(url string) string {
	time.Sleep(50 * time.Millisecond) // 模拟网络延迟
	return fmt.Sprintf("200 OK [%s]", url)
}

func worker(id int, jobs <-chan string, results chan<- string, wg *sync.WaitGroup) {
	defer wg.Done()
	for url := range jobs {
		result := fetchURL(url)
		results <- fmt.Sprintf("worker-%d: %s", id, result)
	}
}

func main() {
	urls := []string{
		"https://example.com/a",
		"https://example.com/b",
		"https://example.com/c",
		"https://example.com/d",
		"https://example.com/e",
	}

	jobs := make(chan string, len(urls))
	results := make(chan string, len(urls))
	var wg sync.WaitGroup

	// 启动 3 个 worker（fan-out）
	const numWorkers = 3
	for i := 1; i <= numWorkers; i++ {
		wg.Add(1)
		go worker(i, jobs, results, &wg)
	}

	// 投入所有任务
	for _, url := range urls {
		jobs <- url
	}
	close(jobs) // 关闭后 worker 会在消费完后自动退出

	// 等待所有 worker 完成后关闭结果 channel
	go func() {
		wg.Wait()
		close(results)
	}()

	// 收集结果
	for r := range results {
		fmt.Println(r)
	}
}
```

5 个 URL 分配给 3 个 worker 并发处理，整体耗时约 100ms（两轮），而串行需要 250ms。`wg.Wait()` 放在独立 goroutine 里，确保主协程可以持续消费 `results`，避免死锁。

---

## 第5节：done channel 优雅停止

### 5.1 为什么需要 done channel

goroutine 没有"杀死"接口。当主逻辑想提前取消一批后台 goroutine（比如用户中断、超时、错误），需要一种广播机制。**关闭 channel 会立即通知所有正在监听它的 goroutine**，这正是 done channel 的核心原理。

### 5.2 done channel 优雅停止示例

```go
package main

import (
	"fmt"
	"time"
)

func monitor(id int, done <-chan struct{}) {
	for {
		select {
		case <-done:
			fmt.Printf("monitor-%d: 收到停止信号，退出\n", id)
			return
		default:
			fmt.Printf("monitor-%d: 工作中...\n", id)
			time.Sleep(300 * time.Millisecond)
		}
	}
}

func main() {
	done := make(chan struct{})

	// 启动 3 个监控 goroutine
	for i := 1; i <= 3; i++ {
		go monitor(i, done)
	}

	// 主逻辑运行 1 秒
	time.Sleep(1 * time.Second)

	// 广播停止信号：关闭 done channel
	fmt.Println("main: 发送停止信号")
	close(done)

	// 等待一下，让所有 goroutine 打印退出信息
	time.Sleep(500 * time.Millisecond)
	fmt.Println("main: 所有 goroutine 已退出")
}
```

`done` channel 的类型是 `chan struct{}`，不携带数据，只用于信号传递，零内存分配。`close(done)` 是一次广播——所有阻塞在 `<-done` 上的 goroutine **同时**被唤醒，而不是只有一个。这也是标准库 `context` 包的底层实现原理。

### 5.3 done channel 与 pipeline 结合

在 pipeline 中，done channel 可以让上游提前停止生产：

```go
package main

import "fmt"

func generateWithDone(done <-chan struct{}, nums ...int) <-chan int {
	out := make(chan int)
	go func() {
		defer close(out)
		for _, n := range nums {
			select {
			case <-done:
				fmt.Println("generate: 收到取消，停止生产")
				return
			case out <- n:
			}
		}
	}()
	return out
}

func main() {
	done := make(chan struct{})
	c := generateWithDone(done, 1, 2, 3, 4, 5, 6, 7, 8)

	// 只消费前 3 个，然后取消
	for i := 0; i < 3; i++ {
		fmt.Println(<-c)
	}

	close(done) // 通知上游停止
	fmt.Println("消费结束，已取消上游")
}
```

生产者在每次发送前都检查 `done`，一旦关闭就提前退出，不会因为下游不再接收而永久阻塞。

---

## 小结

本讲覆盖了 Go channel 的五个核心模式，要点如下：

1. **无缓冲 channel 是同步原语**：发送和接收必须同时就绪，天然用于 goroutine 间的握手协调。
2. **有缓冲 channel 是异步队列**：发送方和接收方解耦，`range` 遍历配合 `close` 是最惯用的消费写法。
3. **select 是多路复用器**：监听多个 channel 取最先就绪的；加 `default` 变非阻塞，实现轮询。
4. **pipeline 分阶段流式处理**：每个阶段一个 goroutine + 一个 channel，函数签名 `<-chan T` 表达数据流向。
5. **fan-out + done channel 是并发控制标配**：fan-out 提升吞吐，done channel 实现优雅取消，这也是 `context.Context` 的设计基础。

---

> **下一讲**：第06讲·context——理解 Go 的标准取消与超时机制，掌握 `context.WithCancel`、`WithTimeout`、`WithValue` 的使用边界。
