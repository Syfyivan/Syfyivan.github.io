---
title: "【Go 精进·第12讲】实战：用 Cobra + Viper 写完整 CLI 工具"
date: 2026-06-22
tags:
  - Go
  - 语言学习
categories:
  - 技术深潜
series: learn-go
---

> **系列导航** → [课程目录](/courses/learn-go/) · 上一讲：第11讲·常见设计模式 · 下一讲待写

## 引言

Go 天生适合写命令行工具：编译产物是单个二进制文件，跨平台发行、零依赖部署。但"能写"和"写得好"之间还差一大截——标志解析、子命令分发、配置文件与环境变量的优先级管理，如果全靠 `flag` 标准库手工拼，代码很快就会失控。

本讲带你从零搭建一个完整的 `todo-cli` 项目：用 **Cobra** 管理命令树，用 **Viper** 统一读取 flag / 配置文件 / 环境变量，再加上彩色终端输出和版本信息注入。这套组合是 Kubernetes、Hugo、GitHub CLI 背后的同款架构，掌握它，你写的 CLI 工具从第一天起就有生产级骨架。

---

## 第1节：项目初始化

### 1.1 安装工具链与依赖

```bash
# 安装 cobra-cli 脚手架
go install github.com/spf13/cobra-cli@latest

# 初始化项目
mkdir todo-cli && cd todo-cli
go mod init github.com/yourname/todo-cli

# 使用脚手架生成骨架
cobra-cli init

# 添加子命令
cobra-cli add add
cobra-cli add list
cobra-cli add done

# 安装依赖
go get github.com/spf13/cobra@latest
go get github.com/spf13/viper@latest
go get github.com/fatih/color@latest
```

运行后，项目目录结构如下：

```
todo-cli/
├── cmd/
│   ├── root.go   ← 根命令，全局 flag 在这里
│   ├── add.go    ← add 子命令
│   ├── list.go   ← list 子命令
│   └── done.go   ← done 子命令
├── main.go
└── go.mod
```

### 1.2 main.go：入口文件

`cobra-cli init` 已经帮你生成了入口，几乎不需要改动。关键点是：**不要在 main.go 里放业务逻辑**，它只负责调用 `cmd.Execute()`。

```go
// main.go
package main

import "github.com/yourname/todo-cli/cmd"

// 以下三个变量由 go build -ldflags 在构建时注入
var (
	version   = "dev"
	commit    = "none"
	buildDate = "unknown"
)

func main() {
	cmd.SetVersionInfo(version, commit, buildDate)
	cmd.Execute()
}
```

---

## 第2节：根命令与持久 Flag

### 2.1 root.go 全貌

根命令（`rootCmd`）是命令树的根节点，**PersistentFlags** 定义在这里，所有子命令都能继承使用。

```go
// cmd/root.go
package cmd

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var (
	cfgFile     string
	versionInfo string
)

// SetVersionInfo 由 main.go 调用，注入构建时信息
func SetVersionInfo(version, commit, date string) {
	versionInfo = fmt.Sprintf("version: %s\ncommit:  %s\nbuilt:   %s", version, commit, date)
}

var rootCmd = &cobra.Command{
	Use:   "todo",
	Short: "一个简单的终端 Todo 管理器",
	Long:  `todo-cli 帮助你在终端管理每日待办事项，支持配置文件与环境变量。`,
	// 没有 Run 字段，直接运行 todo 会打印 help
}

func Execute() {
	if err := rootCmd.Execute(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}

func init() {
	cobra.OnInitialize(initConfig)

	// PersistentFlags：所有子命令都能用
	rootCmd.PersistentFlags().StringVar(&cfgFile, "config", "", "配置文件路径（默认 $HOME/.todo.toml）")
	rootCmd.PersistentFlags().Bool("verbose", false, "输出详细日志")

	// 将 flag 绑定到 viper，子命令里直接 viper.GetBool("verbose") 即可读取
	viper.BindPFlag("verbose", rootCmd.PersistentFlags().Lookup("verbose"))

	// 注入版本子命令
	rootCmd.AddCommand(&cobra.Command{
		Use:   "version",
		Short: "打印版本信息",
		Run: func(cmd *cobra.Command, args []string) {
			fmt.Println(versionInfo)
		},
	})
}

func initConfig() {
	if cfgFile != "" {
		// 用户通过 --config 指定了路径
		viper.SetConfigFile(cfgFile)
	} else {
		home, err := os.UserHomeDir()
		cobra.CheckErr(err)
		// 默认读取 $HOME/.todo.toml
		viper.AddConfigPath(home)
		viper.SetConfigType("toml")
		viper.SetConfigName(".todo")
	}

	// 自动读取 TODO_ 前缀的环境变量，例如 TODO_VERBOSE=true
	viper.SetEnvPrefix("TODO")
	viper.AutomaticEnv()

	if err := viper.ReadInConfig(); err == nil {
		if viper.GetBool("verbose") {
			fmt.Println("使用配置文件:", viper.ConfigFileUsed())
		}
	}
}
```

**关键设计决策**：`viper.BindPFlag` 把命令行 flag 注册进 Viper，之后统一通过 `viper.GetXxx()` 读取，不用分别判断 flag 和配置文件。

### 2.2 配置文件格式

在 `$HOME/.todo.toml` 里可以写默认值：

```toml
# ~/.todo.toml
verbose = false
data_file = "/Users/yourname/.todo_data.json"
max_items = 100
```

优先级顺序：**命令行 flag > 环境变量 > 配置文件 > 默认值**，这是 Viper 的内置行为，不需要手写判断逻辑。

---

## 第3节：子命令实现

### 3.1 add.go：添加待办事项

```go
// cmd/add.go
package cmd

import (
	"fmt"
	"strings"
	"time"

	"github.com/fatih/color"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var addCmd = &cobra.Command{
	Use:   "add [待办内容]",
	Short: "添加一条新的待办事项",
	Args:  cobra.MinimumNArgs(1), // 至少需要一个参数
	RunE:  runAdd,                // 用 RunE 代替 Run，可以返回 error
}

func init() {
	rootCmd.AddCommand(addCmd)

	// LocalFlags：只属于 add 子命令，其他子命令看不到
	addCmd.Flags().StringP("priority", "p", "normal", "优先级：low / normal / high")
	addCmd.Flags().StringP("due", "d", "", "截止日期（格式：2026-12-31）")

	// 同样绑定到 viper，key 加上命令前缀避免冲突
	viper.BindPFlag("add.priority", addCmd.Flags().Lookup("priority"))
	viper.BindPFlag("add.due", addCmd.Flags().Lookup("due"))
}

func runAdd(cmd *cobra.Command, args []string) error {
	content := strings.Join(args, " ")
	priority := viper.GetString("add.priority")
	due := viper.GetString("add.due")

	// 校验优先级合法值
	validPriorities := map[string]bool{"low": true, "normal": true, "high": true}
	if !validPriorities[priority] {
		return fmt.Errorf("非法优先级 %q，请使用 low / normal / high", priority)
	}

	// fatih/color 彩色输出
	successColor := color.New(color.FgGreen, color.Bold)
	labelColor := color.New(color.FgCyan)

	successColor.Print("✓ 已添加：")
	fmt.Printf("%s\n", content)

	labelColor.Printf("  优先级：%s", priority)
	if due != "" {
		labelColor.Printf("  截止：%s", due)
	}
	labelColor.Printf("  创建于：%s\n", time.Now().Format("2006-01-02 15:04"))

	if viper.GetBool("verbose") {
		fmt.Printf("[verbose] 数据文件路径：%s\n", viper.GetString("data_file"))
	}

	return nil
}
```

注意 `RunE` 与 `Run` 的区别：`RunE` 允许返回 `error`，Cobra 会自动打印错误并以非零状态码退出，这是生产代码的推荐写法。

### 3.2 list.go：列出待办事项

```go
// cmd/list.go
package cmd

import (
	"fmt"

	"github.com/fatih/color"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var listCmd = &cobra.Command{
	Use:   "list",
	Short: "列出所有待办事项",
	RunE:  runList,
}

func init() {
	rootCmd.AddCommand(listCmd)

	listCmd.Flags().BoolP("all", "a", false, "包含已完成的事项")
	listCmd.Flags().StringP("filter", "f", "", "按优先级筛选（low/normal/high）")

	viper.BindPFlag("list.all", listCmd.Flags().Lookup("all"))
	viper.BindPFlag("list.filter", listCmd.Flags().Lookup("filter"))
}

// TodoItem 代表一条待办
type TodoItem struct {
	ID       int
	Content  string
	Priority string
	Done     bool
}

func runList(cmd *cobra.Command, args []string) error {
	showAll := viper.GetBool("list.all")
	filter := viper.GetString("list.filter")

	// 模拟数据，真实场景从 data_file 读取 JSON
	items := []TodoItem{
		{1, "写第12讲博客文章", "high", false},
		{2, "回复 Code Review 评论", "normal", true},
		{3, "整理本周会议纪要", "low", false},
	}

	titleColor := color.New(color.FgYellow, color.Bold)
	doneColor := color.New(color.FgHiBlack)
	highColor := color.New(color.FgRed)
	normalColor := color.New(color.FgWhite)

	titleColor.Println("═══ Todo List ═══")

	count := 0
	for _, item := range items {
		if item.Done && !showAll {
			continue
		}
		if filter != "" && item.Priority != filter {
			continue
		}

		status := "○"
		if item.Done {
			status = "✓"
		}

		line := fmt.Sprintf("  %s [%d] %s (%s)", status, item.ID, item.Content, item.Priority)

		if item.Done {
			doneColor.Println(line)
		} else if item.Priority == "high" {
			highColor.Println(line)
		} else {
			normalColor.Println(line)
		}
		count++
	}

	fmt.Printf("\n共 %d 条\n", count)
	return nil
}
```

---

## 第4节：构建与版本注入

### 4.1 用 ldflags 注入版本信息

Go 的 `-ldflags` 可以在构建时把字符串写进二进制，无需运行时读取文件：

```bash
# 手动构建，注入版本信息
go build -ldflags "-X main.version=1.0.0 \
  -X main.commit=$(git rev-parse --short HEAD) \
  -X main.buildDate=$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  -o todo .

# 验证
./todo version
# version: 1.0.0
# commit:  a3f2c1d
# built:   2026-06-22T08:00:00Z
```

### 4.2 Makefile 自动化

```makefile
# Makefile
VERSION  := $(shell git describe --tags --always --dirty)
COMMIT   := $(shell git rev-parse --short HEAD)
DATE     := $(shell date -u +%Y-%m-%dT%H:%M:%SZ)
LDFLAGS  := -ldflags "-X main.version=$(VERSION) -X main.commit=$(COMMIT) -X main.buildDate=$(DATE)"

.PHONY: build
build:
	go build $(LDFLAGS) -o dist/todo .

.PHONY: install
install:
	go install $(LDFLAGS) .

.PHONY: test
test:
	go test ./...
```

执行 `make build` 后，`dist/todo version` 即可打印完整构建信息。

---

## 第5节：环境变量与配置覆盖

### 5.1 AutomaticEnv 的工作原理

`viper.AutomaticEnv()` 配合 `SetEnvPrefix("TODO")` 后，Viper 会自动将环境变量名映射到配置键：

| 环境变量 | Viper 键 | 说明 |
|---|---|---|
| `TODO_VERBOSE=true` | `verbose` | 全局详细输出 |
| `TODO_DATA_FILE=/tmp/t.json` | `data_file` | 覆盖数据文件路径 |
| `TODO_MAX_ITEMS=50` | `max_items` | 最大条目数 |

```go
// cmd/root.go（节选）
package cmd

import "github.com/spf13/viper"

func demonstrateViper() {
	// 读取顺序：flag > 环境变量 > 配置文件 > 默认值
	// 全部通过同一个 API 读取，无需区分来源
	verbose := viper.GetBool("verbose")
	dataFile := viper.GetString("data_file")
	maxItems := viper.GetInt("max_items")

	// viper 支持的类型转换
	_ = verbose
	_ = dataFile
	_ = maxItems
}
```

### 5.2 测试配置优先级

```bash
# 场景1：只用配置文件（~/.todo.toml 里 verbose=false）
./todo list

# 场景2：环境变量覆盖配置文件
TODO_VERBOSE=true ./todo list

# 场景3：命令行 flag 覆盖一切
TODO_VERBOSE=true ./todo --verbose=false list

# 场景4：指定自定义配置文件
./todo --config ./dev.toml list
```

---

## 小结

本讲带你搭建了一个具备生产级骨架的 CLI 工具，核心要点如下：

1. **命令树结构**：`rootCmd` 作根节点，`cobra-cli add` 生成子命令文件，职责分离，可无限扩展。
2. **Flag 两种作用域**：`PersistentFlags` 定义在根命令，所有子命令继承；`Flags`（LocalFlags）只属于当前命令，不互相污染。
3. **Viper 统一读取**：`BindPFlag` + `AutomaticEnv` + `ReadInConfig` 三步，让 flag / 环境变量 / 配置文件按优先级自动合并，业务代码只调 `viper.GetXxx()`。
4. **错误处理用 RunE**：返回 `error` 让 Cobra 统一处理退出码，比在函数内部 `os.Exit` 更可测试。
5. **版本注入用 ldflags**：构建时写入 `version / commit / buildDate`，单文件发行，零运行时依赖。

---

> **下一讲**：第13讲·HTTP 服务实战 —— 用 `net/http` + 路由 + 中间件搭建完整 REST API，敬请期待。
