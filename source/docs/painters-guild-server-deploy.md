# 共享画室 WebSocket 后端部署

这份说明用于把 `tools/painters-guild-server.mjs` 放到阿里云 ECS 上运行。它是无数据库、无新增 npm 依赖的 MVP 后端：服务端维护房间状态，浏览器通过 WebSocket 提交操作并接收快照。

## 本地启动

```bash
npm run painters:server
```

默认监听：

```text
http://0.0.0.0:8788
ws://localhost:8788/guild-ws
```

健康检查：

```bash
curl http://localhost:8788/healthz
```

## 环境变量

```bash
PAINTERS_GUILD_PORT=8788
PAINTERS_GUILD_HOST=0.0.0.0
PAINTERS_GUILD_ALLOWED_ORIGINS=https://Syfyivan.github.io,https://your-blog-domain.com
```

- `PAINTERS_GUILD_PORT`: 后端监听端口。
- `PAINTERS_GUILD_HOST`: ECS 上通常用 `0.0.0.0`。
- `PAINTERS_GUILD_ALLOWED_ORIGINS`: 允许连接的页面来源。开发阶段可以留空；上线建议配置博客域名。

## ECS 准备

1. 在阿里云安全组放行 `80`、`443`。
2. 如果不做反向代理，也可以临时放行 `8788`，但正式上线建议只暴露 `443`。
3. 安装 Node.js 20+。
4. 拉取博客仓库并安装依赖：

```bash
git clone https://github.com/Syfyivan/Syfyivan.github.io.git
cd Syfyivan.github.io
npm ci
```

## systemd 常驻

创建 `/etc/systemd/system/painters-guild.service`：

```ini
[Unit]
Description=Painters Guild WebSocket Server
After=network.target

[Service]
Type=simple
WorkingDirectory=/home/ecs-user/Syfyivan.github.io
Environment=PAINTERS_GUILD_PORT=8788
Environment=PAINTERS_GUILD_HOST=127.0.0.1
Environment=PAINTERS_GUILD_ALLOWED_ORIGINS=https://Syfyivan.github.io,https://your-blog-domain.com
ExecStart=/usr/bin/npm run painters:server
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

启动：

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now painters-guild
sudo systemctl status painters-guild
```

查看日志：

```bash
journalctl -u painters-guild -f
```

## Caddy 反向代理

假设后端域名是 `guild.your-domain.com`：

```caddy
guild.your-domain.com {
  reverse_proxy 127.0.0.1:8788
}
```

页面里的服务器地址填写：

```text
wss://guild.your-domain.com/guild-ws
```

## Nginx 反向代理

```nginx
server {
  listen 443 ssl http2;
  server_name guild.your-domain.com;

  ssl_certificate /etc/letsencrypt/live/guild.your-domain.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/guild.your-domain.com/privkey.pem;

  location /guild-ws {
    proxy_pass http://127.0.0.1:8788;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_read_timeout 60s;
  }

  location /healthz {
    proxy_pass http://127.0.0.1:8788;
  }
}
```

页面里的服务器地址同样填写：

```text
wss://guild.your-domain.com/guild-ws
```

## 当前 MVP 限制

- 房间状态只在内存里，服务重启后房间会重置。
- 暂时没有登录鉴权，玩家用昵称进入房间。
- 一个房间最多自然对应 4 名画家；超过 4 人会旁观或复用第一个画家。
- 核心规则目前在前端和后端各有一份，继续扩展时应抽成共享规则模块。
