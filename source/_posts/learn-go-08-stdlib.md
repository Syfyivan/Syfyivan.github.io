---
title: "【Go 精进·第08讲】标准库精讲：net/http + encoding/json + io"
date: 2026-06-22
tags:
  - Go
  - 语言学习
categories:
  - 技术深潜
series: learn-go
---

> **系列导航** → [课程目录](/courses/learn-go/) · 上一讲：第07讲·泛型 · 下一讲待写

## 引言

Go 语言的核心竞争力之一，是标准库的"够用且精准"。你不需要引入第三方 HTTP 框架，`net/http` 本身就足以承载生产级别的 Web 服务；你不需要额外的序列化库，`encoding/json` 的 struct tag 机制已经覆盖绝大多数场景；你也不需要专门的流处理库，`io.Reader` 组合链可以优雅地处理从文件到网络的一切字节流。

本讲聚焦这三个最高频的标准库模块。理解它们不仅是日常开发的必备技能，更是读懂 Go 生态中大量优秀开源项目的基础——Gin、Echo、gRPC-gateway 底层都建立在 `net/http` 之上，Hugo 的文件处理大量使用 `io` 抽象。掌握这三个模块，你就掌握了 Go Web 开发的底层语言。

---

## 第1节：net/http——从 Handler 接口到生产级 Server

### 1.1 Handler 接口：一切的基础

Go 的 HTTP 处理模型核心是一个极简接口：

```go
package main

import (
	"fmt"
	"net/http"
)

// Handler 接口只有一个方法
// type Handler interface {
//     ServeHTTP(ResponseWriter, *Request)
// }

// 自定义 Handler 类型
type GreetHandler struct {
	greeting string
}

func (h GreetHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	name := r.URL.Query().Get("name")
	if name == "" {
		name = "World"
	}
	fmt.Fprintf(w, "%s, %s!\n", h.greeting, name)
}

func main() {
	mux := http.NewServeMux()
	mux.Handle("/greet", GreetHandler{greeting: "Hello"})
	mux.Handle("/hi", GreetHandler{greeting: "Hi there"})

	http.ListenAndServe(":8080", mux)
}
```

`ServeHTTP(ResponseWriter, *Request)` 就是整个 HTTP 处理的合约。任何实现了这个方法的类型，都可以注册到路由器上。这个设计让 Handler 天然可组合——中间件本质上就是一个包裹另一个 Handler 的 Handler。

### 1.2 http.HandleFunc：函数即 Handler

大多数场景不需要定义结构体，直接用函数更简洁：

```go
package main

import (
	"encoding/json"
	"log"
	"net/http"
	"time"
)

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"status": "ok",
		"time":   time.Now().Format(time.RFC3339),
	})
}

func main() {
	// http.HandleFunc 是 http.DefaultServeMux.HandleFunc 的简写
	// 实际生产中推荐使用 http.NewServeMux() 创建独立实例
	mux := http.NewServeMux()
	mux.HandleFunc("/health", healthHandler)
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.Error(w, "Not Found", http.StatusNotFound)
	})

	log.Fatal(http.ListenAndServe(":8080", mux))
}
```

### 1.3 生产必备：设置超时的 http.Server

直接使用 `http.ListenAndServe` 会创建一个没有超时设置的 Server，在生产环境中会被慢速攻击（Slowloris）利用。正确做法是显式创建 `http.Server`：

```go
package main

import (
	"log"
	"net/http"
	"time"
)

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/ping", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("pong"))
	})

	server := &http.Server{
		Addr:    ":8080",
		Handler: mux,

		// 从连接建立到读完请求头的超时
		ReadHeaderTimeout: 5 * time.Second,

		// 从连接建立到读完整个请求体的超时
		ReadTimeout: 10 * time.Second,

		// 从响应开始写到写完的超时
		WriteTimeout: 15 * time.Second,

		// keep-alive 连接的最大空闲时间
		IdleTimeout: 60 * time.Second,
	}

	log.Printf("Server listening on %s", server.Addr)
	log.Fatal(server.ListenAndServe())
}
```

四个超时参数各有职责：`ReadHeaderTimeout` 防止头部攻击；`ReadTimeout` 控制整个请求读取；`WriteTimeout` 防止响应写入卡死；`IdleTimeout` 管理长连接资源。生产环境四个都要配。

---

## 第2节：encoding/json——结构化数据的进出

### 2.1 struct tag：控制序列化行为的标注语言

Go 的 JSON 序列化通过反射读取 struct tag，三个最常用的选项：

```go
package main

import (
	"encoding/json"
	"fmt"
	"log"
)

type User struct {
	// json:"name" — 指定 JSON 字段名（Go 惯例大写，JSON 惯例小写）
	Name string `json:"name"`

	// omitempty — 零值时不输出该字段
	Email string `json:"email,omitempty"`

	// string — 数字类型以字符串形式序列化（常用于 JavaScript 大整数问题）
	ID int64 `json:"id,string"`

	// - — 完全忽略该字段（不输入也不输出）
	Password string `json:"-"`

	// 嵌套结构体
	Address *Address `json:"address,omitempty"`
}

type Address struct {
	City    string `json:"city"`
	Country string `json:"country"`
}

func main() {
	user := User{
		Name:     "Alice",
		ID:       9007199254740993, // 超过 JS Number 精度的大整数
		Password: "secret123",     // 不会被序列化
		Address: &Address{
			City:    "Shanghai",
			Country: "CN",
		},
	}

	data, err := json.MarshalIndent(user, "", "  ")
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(string(data))
	// Email 为空字符串，因为 omitempty 所以不出现在输出中
	// Password 因为 "-" 所以不出现
	// ID 以字符串 "9007199254740993" 形式出现

	// 反序列化
	jsonStr := `{"name":"Bob","id":"42","email":"bob@example.com"}`
	var decoded User
	if err := json.Unmarshal([]byte(jsonStr), &decoded); err != nil {
		log.Fatal(err)
	}
	fmt.Printf("Decoded: %+v\n", decoded)
}
```

### 2.2 json.NewEncoder：流式编码写入 ResponseWriter

`json.Marshal` 会先把整个对象序列化到内存再返回 `[]byte`。对于 HTTP 响应，更高效的方式是用 `json.NewEncoder` 直接写入 `http.ResponseWriter`：

```go
package main

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
)

type Product struct {
	ID    int     `json:"id"`
	Name  string  `json:"name"`
	Price float64 `json:"price"`
}

// 完整的 JSON API Handler 示例
func productHandler(w http.ResponseWriter, r *http.Request) {
	// 从路径参数获取 ID（Go 1.22+ ServeMux 支持路径参数）
	idStr := r.PathValue("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{
			"error": "invalid product id",
		})
		return
	}

	// 模拟数据库查询
	if id != 1 {
		writeJSON(w, http.StatusNotFound, map[string]string{
			"error": "product not found",
		})
		return
	}

	product := Product{
		ID:    1,
		Name:  "Go Programming Book",
		Price: 99.9,
	}
	writeJSON(w, http.StatusOK, product)
}

// 封装统一的 JSON 响应写入逻辑
func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	// NewEncoder 直接写入 ResponseWriter，避免中间内存分配
	if err := json.NewEncoder(w).Encode(v); err != nil {
		log.Printf("json encode error: %v", err)
	}
}

func main() {
	mux := http.NewServeMux()
	// Go 1.22+ 支持方法限定和路径参数
	mux.HandleFunc("GET /products/{id}", productHandler)

	log.Fatal(http.ListenAndServe(":8080", mux))
}
```

注意 `w.Header().Set()` 必须在 `w.WriteHeader()` 之前调用，一旦写入状态码，Header 就无法再修改。这是初学者最常犯的错误。

---

## 第3节：io——字节流的统一抽象

### 3.1 io.Reader 链：组合式流处理

`io.Reader` 是 Go 中最重要的接口之一：

```go
type Reader interface {
    Read(p []byte) (n int, err error)
}
```

强大之处在于 Reader 可以层层包裹，形成处理链。以读取 gzip 压缩的 HTTP 响应为例：

```go
package main

import (
	"compress/gzip"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
)

// 演示 io.Reader 组合链：strings.NewReader → gzip.Reader
func readGzipStream() {
	// 在实际场景中，这里是 http.Response.Body
	// 这里用 strings.Reader 模拟压缩数据的读取概念
	// （真实 gzip 数据需要先压缩，这里仅展示接口组合方式）
	rawReader := strings.NewReader("模拟：实际这里是压缩后的字节流")

	// io.Reader 链：每一层都是对上一层的透明包装
	// 真实使用：gzip.NewReader(resp.Body)
	_ = rawReader // 实际代码见下方 fetchGzip 函数

	fmt.Println("Reader 链：网络/文件 → gzip.Reader → io.Copy → 目标")
}

// 真实场景：请求支持 gzip 的 API 并解压响应
func fetchGzip(url string) (string, error) {
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return "", err
	}
	// 告知服务器我们接受 gzip 编码
	req.Header.Set("Accept-Encoding", "gzip")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	// 判断响应是否是 gzip
	var reader io.Reader = resp.Body
	if resp.Header.Get("Content-Encoding") == "gzip" {
		gzReader, err := gzip.NewReader(resp.Body)
		if err != nil {
			return "", fmt.Errorf("gzip reader: %w", err)
		}
		defer gzReader.Close()
		reader = gzReader // 透明替换 reader，后续代码无感知
	}

	// io.LimitReader 防止响应体过大（防御性编程）
	limitedReader := io.LimitReader(reader, 10*1024*1024) // 10 MB 上限

	data, err := io.ReadAll(limitedReader)
	if err != nil {
		return "", err
	}
	return string(data), nil
}

func main() {
	readGzipStream()

	// 实际调用示例（需要网络）
	// content, err := fetchGzip("https://httpbin.org/gzip")
	log.Println("io.Reader 链组合演示完成")
}
```

### 3.2 io.Copy 零拷贝与 io.LimitReader 防御

```go
package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
)

func main() {
	// io.Copy 零拷贝示例
	// 从 strings.Reader 复制到 os.Stdout
	src := strings.NewReader("Hello, io.Copy!\n这是零拷贝写入演示。\n")
	n, err := io.Copy(os.Stdout, src)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("已写入 %d 字节\n\n", n)

	// 文件下载服务：用 io.Copy 直接从请求体写入文件
	http.HandleFunc("POST /upload", func(w http.ResponseWriter, r *http.Request) {
		// LimitReader 防止客户端上传超大文件
		limited := io.LimitReader(r.Body, 5*1024*1024) // 5 MB 限制

		tmpFile, err := os.CreateTemp("", "upload-*.tmp")
		if err != nil {
			http.Error(w, "server error", http.StatusInternalServerError)
			return
		}
		defer tmpFile.Close()

		written, err := io.Copy(tmpFile, limited)
		if err != nil {
			http.Error(w, "write error", http.StatusInternalServerError)
			return
		}

		fmt.Fprintf(w, "received %d bytes\n", written)
	})
}
```

`io.Copy` 内部会尝试调用 `WriteTo` / `ReadFrom` 方法（如果目标/源支持），在某些场景下可以触发操作系统级别的零拷贝优化（如 `sendfile` 系统调用）。

### 3.3 bufio.Scanner：按行读取文件

直接用 `io.ReadAll` 读大文件会一次性占满内存。`bufio.Scanner` 提供了惰性的按行读取：

```go
package main

import (
	"bufio"
	"fmt"
	"log"
	"os"
	"strings"
)

// 统计文件行数（惰性读取，内存占用恒定）
func countLines(filename string) (int, error) {
	f, err := os.Open(filename)
	if err != nil {
		return 0, err
	}
	defer f.Close()

	scanner := bufio.NewScanner(f)

	// 对于超长行，需要手动扩大缓冲区（默认 64KB）
	// scanner.Buffer(make([]byte, 1024*1024), 1024*1024)

	count := 0
	for scanner.Scan() {
		line := scanner.Text() // 返回当前行内容（不含换行符）
		_ = line               // 实际使用中在这里处理每一行
		count++
	}

	if err := scanner.Err(); err != nil {
		return count, fmt.Errorf("scan error: %w", err)
	}
	return count, nil
}

// 从字符串读取（适合测试）
func parseCSVLines(data string) [][]string {
	scanner := bufio.NewScanner(strings.NewReader(data))
	var result [][]string

	for scanner.Scan() {
		fields := strings.Split(scanner.Text(), ",")
		result = append(result, fields)
	}
	return result
}

func main() {
	// 演示从字符串按行解析
	csv := "Alice,30,Shanghai\nBob,25,Beijing\nCarol,28,Chengdu"
	rows := parseCSVLines(csv)
	for i, row := range rows {
		fmt.Printf("Row %d: name=%s, age=%s, city=%s\n", i+1, row[0], row[1], row[2])
	}

	// 实际文件读取（文件需存在）
	// count, err := countLines("/var/log/system.log")
	// if err != nil {
	//     log.Fatal(err)
	// }
	// fmt.Printf("总行数：%d\n", count)

	log.Println("bufio.Scanner 演示完成")
}
```

`bufio.Scanner` 默认按行分割（`ScanLines`），也可以换成 `ScanWords`、`ScanBytes` 或自定义 `SplitFunc`，是处理结构化文本文件的首选工具。

---

## 第4节：组合实战——完整的 JSON API 服务

将前三节的知识组合成一个完整的可运行示例：

```go
package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"time"
)

// --- 数据模型 ---

type CreateUserRequest struct {
	Name  string `json:"name"`
	Email string `json:"email"`
}

type UserResponse struct {
	ID        int64     `json:"id,string"` // 大整数用 string 传给前端
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	CreatedAt time.Time `json:"created_at"`
}

type ErrorResponse struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

// --- 工具函数 ---

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, ErrorResponse{Code: status, Message: msg})
}

// --- Handler ---

func createUserHandler(w http.ResponseWriter, r *http.Request) {
	// 用 LimitReader 防止请求体过大（防止内存耗尽攻击）
	limited := io.LimitReader(r.Body, 1024*1024) // 1 MB
	defer r.Body.Close()

	var req CreateUserRequest
	if err := json.NewDecoder(limited).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid JSON: "+err.Error())
		return
	}

	// 简单校验
	if strings.TrimSpace(req.Name) == "" {
		writeError(w, http.StatusUnprocessableEntity, "name is required")
		return
	}

	// 模拟创建用户
	user := UserResponse{
		ID:        9007199254740993,
		Name:      req.Name,
		Email:     req.Email,
		CreatedAt: time.Now(),
	}

	writeJSON(w, http.StatusCreated, user)
}

func listUsersFromFileHandler(w http.ResponseWriter, r *http.Request) {
	// 模拟从文本数据按行解析用户
	data := "Alice,alice@example.com\nBob,bob@example.com\nCarol,carol@example.com"
	scanner := bufio.NewScanner(strings.NewReader(data))

	var users []UserResponse
	var id int64 = 1
	for scanner.Scan() {
		parts := strings.SplitN(scanner.Text(), ",", 2)
		if len(parts) != 2 {
			continue
		}
		users = append(users, UserResponse{
			ID:        id,
			Name:      parts[0],
			Email:     parts[1],
			CreatedAt: time.Now(),
		})
		id++
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"users": users,
		"total": len(users),
	})
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("POST /users", createUserHandler)
	mux.HandleFunc("GET /users", listUsersFromFileHandler)

	server := &http.Server{
		Addr:              ":8080",
		Handler:           mux,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       10 * time.Second,
		WriteTimeout:      15 * time.Second,
		IdleTimeout:       60 * time.Second,
	}

	fmt.Println("Server running at http://localhost:8080")
	fmt.Println("Test: curl -X POST http://localhost:8080/users -d '{\"name\":\"Alice\",\"email\":\"a@b.com\"}'")
	log.Fatal(server.ListenAndServe())
}
```

这个示例集成了本讲的所有核心知识点：带超时的 Server、`LimitReader` 防御、`json.NewDecoder` 流式解析、struct tag 的 `string` 选项、`bufio.Scanner` 按行处理，以及统一的 JSON 响应封装。

---

## 小结

本讲核心要点：

1. **Handler 接口是核心**：Go HTTP 处理模型以 `ServeHTTP(ResponseWriter, *Request)` 为合约，任何实现了这个接口的类型都是合法的 Handler，这让中间件组合成为可能。

2. **生产 Server 必须配超时**：`ReadHeaderTimeout`、`ReadTimeout`、`WriteTimeout`、`IdleTimeout` 四个超时缺一不可，裸用 `http.ListenAndServe` 会留下安全隐患。

3. **struct tag 控制 JSON 行为**：`json:"name,omitempty"` 控制字段名和零值处理；`json:"id,string"` 解决 JS 大整数精度问题；`json:"-"` 彻底隐藏字段。

4. **io.Reader 是可组合的**：`gzip.NewReader(resp.Body)` 这样的包装只是叠加一层解码逻辑，对外仍是 `io.Reader`，后续代码无需感知底层实现。搭配 `io.LimitReader` 做防御性截断是生产必备。

5. **大文件用 bufio.Scanner 而非 ReadAll**：`bufio.Scanner` 内存占用与文件大小无关，是处理日志、CSV 等文本文件的正确姿势。

---

> **下一讲**：第09讲·测试与Benchmark
