---
title: "【Go 精进·第13讲】实战：写一个 Go HTTP 服务（含优雅关闭）"
date: 2026-06-22
tags:
  - Go
  - 语言学习
categories:
  - 技术深潜
series: learn-go
---

> **系列导航** → [课程目录](/courses/learn-go/) · 上一讲：第12讲·CLI工具实战

---

Go 语言在 Web 服务领域拥有天然优势：goroutine 并发模型、极低的内存占用、简洁的标准库 `net/http`。但光会写 `http.HandleFunc` 还不够——真实项目中你需要处理路由分组、中间件链、结构化日志、依赖注入以及进程信号，让服务能"体面地"关闭而不丢请求。

本讲以一个完整的 `users-api` 项目为主线，带你从零搭建一个生产级 Go HTTP 服务。所有代码可直接运行在 Go 1.22+，无需额外脚手架。

---

## 第1节：项目结构与路由器选型

### 1.1 目录布局

```
users-api/
├── main.go       # 程序入口，负责组装依赖、启动/关闭服务
├── server.go     # Server 结构体，路由注册，中间件链
└── handler.go    # 业务 Handler，处理具体的 HTTP 请求
```

这三个文件的分工非常清晰：`main.go` 只做"接线"，`server.go` 管理路由拓扑，`handler.go` 专注业务逻辑。依赖关系是单向的，不存在循环引用。

### 1.2 引入 chi 路由器

标准库 `net/http` 的路由能力有限，不支持 URL 参数（如 `/users/{id}`）。`chi` 是 Go 社区最轻量的路由库，零依赖树、完全兼容标准库 `http.Handler` 接口。

```bash
go get github.com/go-chi/chi/v5
```

chi 的核心优势在于**子路由挂载**和**中间件链**，后文会重点展示。

### 1.3 定义 Server 结构体

`server.go` 中的 `Server` 是整个服务的骨架，它持有所有外部依赖，并通过方法暴露路由：

```go
package main

import (
	"database/sql"
	"log/slog"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

// Server 持有依赖并管理路由
type Server struct {
	db     *sql.DB      // 数据库连接（依赖注入）
	logger *slog.Logger // 结构化日志
	router chi.Router
}

// NewServer 构造函数，接收外部依赖
func NewServer(db *sql.DB, logger *slog.Logger) *Server {
	s := &Server{
		db:     db,
		logger: logger,
		router: chi.NewRouter(),
	}
	s.registerRoutes()
	return s
}

// ServeHTTP 使 Server 实现 http.Handler 接口
func (s *Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	s.router.ServeHTTP(w, r)
}
```

这里的关键设计是**依赖注入**：`db` 和 `logger` 从外部传入，而不是在函数内部创建。这让测试时可以轻松替换为 mock 实现。

---

## 第2节：中间件链与结构化日志

### 2.1 注册路由与中间件

```go
// registerRoutes 挂载中间件链和所有路由
func (s *Server) registerRoutes() {
	// 中间件按顺序执行（请求从上到下，响应从下到上）
	s.router.Use(s.requestLogger)      // 1. 记录每条请求日志
	s.router.Use(middleware.Recoverer) // 2. 捕获 panic，防止进程崩溃
	s.router.Use(corsMiddleware)       // 3. 设置 CORS 头

	// 健康检查端点（不需要认证）
	s.router.Get("/healthz", s.handleHealthz)

	// 业务路由，挂载到 /users 子路由
	s.router.Route("/users", func(r chi.Router) {
		r.Get("/", s.handleListUsers)       // GET /users
		r.Post("/", s.handleCreateUser)     // POST /users
		r.Get("/{id}", s.handleGetUser)     // GET /users/{id}
		r.Delete("/{id}", s.handleDeleteUser) // DELETE /users/{id}
	})
}
```

`chi.Router.Use()` 按注册顺序形成中间件链。`middleware.Recoverer` 是 chi 内置的 panic 恢复中间件，捕获到 panic 后返回 500 而不是让进程崩溃。

### 2.2 用 slog 写结构化日志中间件

Go 1.21 正式引入 `log/slog`，告别 `fmt.Printf` 和非结构化日志。结构化日志的最大价值是**可被日志聚合系统（如 Loki、Datadog）索引和查询**。

```go
// requestLogger 是一个记录请求信息的中间件
func (s *Server) requestLogger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// 使用 slog.With 附加请求上下文字段
		reqLogger := s.logger.With(
			slog.String("method", r.Method),
			slog.String("path", r.URL.Path),
			slog.String("remote_addr", r.RemoteAddr),
		)

		ww := middleware.NewWrapResponseWriter(w, r.ProtoMajor)
		next.ServeHTTP(ww, r)

		// 请求完成后记录状态码
		reqLogger.Info("request completed",
			slog.Int("status", ww.Status()),
		)
	})
}

// corsMiddleware 设置跨域头
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
```

`slog.With()` 返回一个带有预设字段的子 Logger，后续调用 `Info`/`Error` 时这些字段自动附加，避免重复书写。

---

## 第3节：业务 Handler 实现

### 3.1 健康检查与 URL 参数

`handler.go` 包含所有具体的请求处理逻辑：

```go
package main

import (
	"encoding/json"
	"log/slog"
	"net/http"

	"github.com/go-chi/chi/v5"
)

// handleHealthz 健康检查，供 k8s liveness probe 调用
func (s *Server) handleHealthz(w http.ResponseWriter, r *http.Request) {
	// 可在此检查数据库连通性
	if err := s.db.PingContext(r.Context()); err != nil {
		s.logger.Error("database ping failed", slog.String("error", err.Error()))
		http.Error(w, "unhealthy", http.StatusServiceUnavailable)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

// handleGetUser 通过 URL 参数 {id} 查询单个用户
func (s *Server) handleGetUser(w http.ResponseWriter, r *http.Request) {
	// chi.URLParam 从路由中提取 {id}
	userID := chi.URLParam(r, "id")
	if userID == "" {
		http.Error(w, "missing user id", http.StatusBadRequest)
		return
	}

	// 模拟从 DB 查询（真实项目中替换为 SQL 查询）
	user := map[string]string{
		"id":    userID,
		"name":  "Alice",
		"email": "alice@example.com",
	}

	s.logger.Info("fetched user", slog.String("user_id", userID))
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

// handleListUsers 返回用户列表
func (s *Server) handleListUsers(w http.ResponseWriter, r *http.Request) {
	users := []map[string]string{
		{"id": "1", "name": "Alice"},
		{"id": "2", "name": "Bob"},
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}

// handleCreateUser 创建用户
func (s *Server) handleCreateUser(w http.ResponseWriter, r *http.Request) {
	var body map[string]string
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}
	s.logger.Info("creating user", slog.String("name", body["name"]))
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"id": "3", "name": body["name"]})
}

// handleDeleteUser 删除用户
func (s *Server) handleDeleteUser(w http.ResponseWriter, r *http.Request) {
	userID := chi.URLParam(r, "id")
	s.logger.Info("deleting user", slog.String("user_id", userID))
	w.WriteHeader(http.StatusNoContent)
}
```

注意每个 Handler 都使用 `r.Context()` 传递请求上下文，数据库操作使用 `PingContext` 而非 `Ping`，确保请求取消时 DB 操作也能正确中断。

---

## 第4节：优雅关闭

### 4.1 为什么需要优雅关闭

直接 `os.Exit()` 或 `kill -9` 会强制终止进程，导致：
- 正在处理的请求被强行中断，客户端收到连接重置
- 数据库事务未提交，数据不一致
- 文件未刷盘，消息未 ACK

优雅关闭（Graceful Shutdown）的逻辑是：**收到停止信号后，停止接收新连接，等待已有请求处理完毕，再退出进程**。

### 4.2 signal.NotifyContext + http.Server.Shutdown

`main.go` 是整个项目的入口，负责装配依赖并实现优雅关闭：

```go
package main

import (
	"context"
	"database/sql"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	_ "github.com/mattn/go-sqlite3" // 示例使用 SQLite，生产替换为 postgres
)

func main() {
	// 1. 初始化结构化日志（JSON 格式，适合生产环境）
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))

	// 2. 初始化数据库连接
	db, err := sql.Open("sqlite3", ":memory:")
	if err != nil {
		logger.Error("failed to open database", slog.String("error", err.Error()))
		os.Exit(1)
	}
	defer db.Close()

	// 3. 构建 Server（依赖注入）
	srv := NewServer(db, logger)

	// 4. 配置 http.Server（不使用默认 DefaultServeMux）
	httpServer := &http.Server{
		Addr:         ":8080",
		Handler:      srv,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// 5. 监听系统信号（SIGINT = Ctrl+C，SIGTERM = k8s 发送的停止信号）
	//    signal.NotifyContext 返回一个在收到信号时自动 cancel 的 context
	ctx, stop := signal.NotifyContext(context.Background(),
		syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	// 6. 在 goroutine 中启动 HTTP 监听
	go func() {
		logger.Info("server starting", slog.String("addr", httpServer.Addr))
		if err := httpServer.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			logger.Error("server listen error", slog.String("error", err.Error()))
			os.Exit(1)
		}
	}()

	// 7. 阻塞等待信号
	<-ctx.Done()
	logger.Info("shutdown signal received, draining connections...")

	// 8. 给正在处理的请求最多 30 秒的宽限期
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := httpServer.Shutdown(shutdownCtx); err != nil {
		logger.Error("graceful shutdown failed", slog.String("error", err.Error()))
	} else {
		logger.Info("server stopped gracefully")
	}
}
```

### 4.3 关键点解析

| 步骤 | 作用 |
|------|------|
| `signal.NotifyContext` | 将 OS 信号桥接为 context 取消，Go 1.16+ 推荐用法 |
| `http.ErrServerClosed` | `Shutdown()` 调用后 `ListenAndServe` 会返回此错误，属于正常结束，需要区分处理 |
| `context.WithTimeout(30s)` | 设置宽限期上限，防止服务因某个请求卡死而无法退出 |
| `ReadTimeout` / `WriteTimeout` | 防止慢连接攻击（Slowloris），生产必须配置 |

---

## 第5节：本地运行验证

### 5.1 启动服务

```bash
# 下载依赖
go mod tidy

# 启动（Go 1.22+）
go run .
# 输出：{"time":"...","level":"INFO","msg":"server starting","addr":":8080"}
```

### 5.2 测试各端点

```bash
# 健康检查
curl http://localhost:8080/healthz
# {"status":"ok"}

# 获取用户列表
curl http://localhost:8080/users
# [{"id":"1","name":"Alice"},{"id":"2","name":"Bob"}]

# 获取单个用户（URL 参数）
curl http://localhost:8080/users/42
# {"email":"alice@example.com","id":"42","name":"Alice"}

# 创建用户
curl -X POST http://localhost:8080/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Charlie"}'
# {"id":"3","name":"Charlie"}

# 测试优雅关闭（Ctrl+C 后观察日志）
# {"time":"...","level":"INFO","msg":"shutdown signal received, draining connections..."}
# {"time":"...","level":"INFO","msg":"server stopped gracefully"}
```

---

## 小结

本讲核心要点：

1. **chi 路由器**：`router.Route()` 实现子路由分组，`chi.URLParam(r, "id")` 提取 URL 参数，比标准库更适合 REST API。
2. **中间件链**：`router.Use()` 按顺序挂载，请求从上到下经过每个中间件，日志、Recover、CORS 各司其职。
3. **slog 结构化日志**：Go 1.21 标准库，`slog.With()` 附加上下文字段，`slog.Info/Error` 输出 JSON，生产可直接对接日志平台。
4. **依赖注入**：`Server` 结构体持有 `db` 和 `logger`，通过构造函数注入，不依赖全局变量，方便测试替换。
5. **优雅关闭**：`signal.NotifyContext` 监听 SIGINT/SIGTERM，`http.Server.Shutdown(ctx)` 等待存量请求完成再退出，k8s 部署的标配。

---

> **下一讲**：系列完结——感谢跟随这门课程走完 Go 精进之路，愿你写出更地道的 Go 代码。
