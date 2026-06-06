---
title: "服务端学习 01：Go 基础，先写出可靠服务"
date: 2026-06-06 10:10:00
tags: [Go, 服务端, 并发, 学习路线]
categories: [技术笔记, 服务端学习]
---

我把 Go 放在第一站，不是因为语法难，而是因为后面所有服务端问题都会绕回这些基本功：值怎么传，错误怎么留信息，goroutine 怎么停，context 有没有一路传下去。

框架先不急。先把一段普通 Go 代码写稳，比上来背 Gin、Kratos、gRPC 的用法更有用。

## 先盯住四件事

第一件事是值和指针。

Go 里参数按值传递，结构体、slice、map 的行为又不完全一样。服务端代码经常会在这里埋小坑：一个对象被多个地方改了，或者 append 之后以为还在共享同一份底层数组。我的经验是，能不可变就不可变；需要改状态时，把修改点收窄，不要到处传一个可写的大对象。

第二件事是接口。

interface 不用提前设计一堆。更自然的做法是：service 需要什么能力，就在 service 这一侧定义一个很小的接口。

```go
type UserStore interface {
    FindByID(ctx context.Context, id int64) (*User, error)
}
```

这样测试时可以换 fake，生产里可以接 MySQL 或 RPC。接口是边界，不是装饰。

第三件事是错误。

只返回 `err` 很快就不够用了。线上排查时，我更想看到“查哪个用户失败”“调用哪个下游失败”，而不是一串孤零零的 `record not found`。

```go
user, err := store.FindByID(ctx, userID)
if err != nil {
    return nil, fmt.Errorf("find user %d: %w", userID, err)
}
```

这个写法不花哨，但以后查日志会省很多时间。

第四件事是 goroutine 的退出。

每开一个 goroutine，都要知道它什么时候结束。请求取消了、超时了，后台任务还继续跑，就是服务端里很常见的泄漏。

```go
select {
case result := <-done:
    return result, nil
case <-ctx.Done():
    return nil, ctx.Err()
}
```

Go 的并发不是“开得越多越好”。服务端更关心的是并发能不能收回来，失败能不能被看见。

## 测试从边界开始写

Go 的表驱动测试很适合服务端逻辑。别只测成功路径，至少把这些情况补上：

- 入参为空；
- 数据不存在；
- 下游返回错误；
- context 超时；
- 重复提交；
- 并发调用。

测试不是为了把覆盖率刷上去，是为了把以后最容易改坏的地方钉住。

## 一个练习

写一个批量任务 runner：

- 输入一组任务；
- 限制最大并发；
- 每个任务支持超时；
- 收集成功结果和失败原因；
- 整体 context 取消后尽快退出；
- 用 `go test -race` 跑一遍。

这个练习做完，再去写 HTTP handler，会明显踏实一点。因为 handler 本质上也是接一个输入，带着 context 调用一堆依赖，然后把结果和错误收回来。
