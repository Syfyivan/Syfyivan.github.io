# AI 视觉服务端部署说明

这个文档说明博客新板块 `/flipbook/` 的真实 AI 图片生成服务怎么在云服务器上跑起来。

静态博客本身只负责页面展示。真实 AI 生图不能在浏览器里直接调用，因为 `OPENAI_API_KEY` 不能暴露给前端。所以需要一个同域后端接口：

```text
POST /api/visual-branch
```

前端会自动请求这个接口。如果接口不可用，页面仍然可以用本地 canvas fallback 跑起来，但不会调用真实 AI 图片生成。

## 1. 拉代码并构建静态博客

在云服务器上的博客仓库目录执行：

```bash
git pull
npm install
npm run build
```

构建后，AI 视觉页面会输出到：

```text
public/flipbook/
```

博客导航中的 `AI视觉` 会指向：

```text
/flipbook/
```

## 2. 启动 AI 图片代理服务

服务端脚本是：

```text
tools/visual-browser-server.mjs
```

本地启动命令：

```bash
OPENAI_API_KEY=你的key npm run visual-server
```

默认监听：

```text
http://127.0.0.1:4177
```

可选环境变量：

```bash
PORT=4177
OPENAI_IMAGE_MODEL=gpt-image-1-mini
OPENAI_API_KEY=你的key
```

如果没有设置 `OPENAI_API_KEY`，接口会返回 `provider: "local"`，前端会退回本地 canvas fallback。

## 3. 用 pm2 常驻

如果服务器上使用 pm2：

```bash
OPENAI_API_KEY=你的key PORT=4177 pm2 start tools/visual-browser-server.mjs --name ai-visual-server
pm2 save
```

查看日志：

```bash
pm2 logs ai-visual-server
```

重启：

```bash
pm2 restart ai-visual-server
```

## 4. 用 systemd 常驻

如果更想用 systemd，可以创建：

```text
/etc/systemd/system/ai-visual-server.service
```

示例：

```ini
[Unit]
Description=AI Visual Browser Server
After=network.target

[Service]
Type=simple
WorkingDirectory=/path/to/Syfyivan.github.io
Environment=NODE_ENV=production
Environment=PORT=4177
Environment=OPENAI_IMAGE_MODEL=gpt-image-1-mini
Environment=OPENAI_API_KEY=你的key
ExecStart=/usr/bin/npm run visual-server
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

把 `/path/to/Syfyivan.github.io` 换成服务器上的真实仓库路径。

启用：

```bash
sudo systemctl daemon-reload
sudo systemctl enable ai-visual-server
sudo systemctl start ai-visual-server
sudo systemctl status ai-visual-server
```

查看日志：

```bash
journalctl -u ai-visual-server -f
```

## 5. Nginx 反向代理

前端请求的是同域路径：

```text
/api/visual-branch
```

所以 Nginx 需要把这个路径反代到 Node 服务：

```nginx
location = /api/visual-branch {
    proxy_pass http://127.0.0.1:4177/api/visual-branch;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

检查并重载：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 6. Caddy 反向代理

如果服务器用 Caddy，可以在站点配置里加：

```caddyfile
handle /api/visual-branch {
    reverse_proxy 127.0.0.1:4177
}
```

如果你还有静态文件路由，注意把 `/api/visual-branch` 放在静态文件 fallback 之前，避免它被当成普通文件路径处理。

检查并重载：

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

## 7. 验证接口

先直接测 Node 服务：

```bash
curl -s http://127.0.0.1:4177/api/visual-branch \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"a visual map of future cities","ratio":"16:9","quality":"low","language":"English"}'
```

再测公网同域接口：

```bash
curl -s https://你的域名/api/visual-branch \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"a visual map of future cities","ratio":"16:9","quality":"low","language":"English"}'
```

如果成功调用真实图片生成，返回里会包含：

```json
{
  "provider": "openai",
  "b64_json": "..."
}
```

如果没有配置 key，会看到：

```json
{
  "provider": "local",
  "imageUrl": null,
  "message": "OPENAI_API_KEY is not configured."
}
```

## 8. 常见问题

### 页面能打开，但永远是本地 fallback

检查：

```bash
echo $OPENAI_API_KEY
pm2 logs ai-visual-server
journalctl -u ai-visual-server -f
```

确认服务进程实际拿到了 `OPENAI_API_KEY`。

### 浏览器请求 `/api/visual-branch` 404

说明反向代理没有命中。检查 Nginx/Caddy 配置顺序，确保 `/api/visual-branch` 在静态文件 fallback 之前。

### 浏览器请求跨域失败

前端默认请求同域 `/api/visual-branch`。推荐用同域反代，不推荐前端直接请求另一个端口或另一个域名。

### GitHub Pages 能不能直接跑真实 AI

不能安全地直接跑。GitHub Pages 是静态托管，不能保存后端密钥。真实 AI 生成需要云服务器、Serverless Function、Cloudflare Worker、Vercel Function 等服务端环境。
