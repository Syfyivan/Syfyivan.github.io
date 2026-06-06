---
title: "云服务器部署静态博客：从 Hexo 到 Caddy 的完整笔记"
date: 2026-05-16 17:35:00
tags: [云服务器, Hexo, Caddy, 自动部署, 运维]
categories: [技术笔记]
---

这篇文章整理一次真实的博客部署过程。

我想把本地 Hexo 博客部署到一台云服务器上，但这台服务器已经跑着其他服务，所以不能粗暴地覆盖根目录，也不能随便改 Web 服务配置。最后采用的方案是：把博客构建成静态文件，上传到服务器的独立目录，再通过 Caddy 挂到 `/blog/` 子路径。

这听起来只是“上传几个 HTML 文件”，但背后其实涉及一整套部署知识：

- 静态博客是怎么生成的；
- SSH 是怎么连接服务器的；
- Web 服务器怎么把请求转发到文件；
- 为什么部署到子路径会导致 CSS/JS 404；
- 没有 sudo 权限时能做什么，不能做什么；
- 怎样避免影响服务器上已有的站点；
- 手动部署如何演进成自动部署。

下面按一条完整链路讲清楚。

## 一句话理解部署

博客部署的本质是：

```text
本地 Markdown
  -> Hexo 构建成 public/ 静态文件
  -> 通过 SSH/rsync 上传到云服务器
  -> Web 服务器把某个 URL 路径映射到这些文件
  -> 浏览器访问 URL，拿到 HTML/CSS/JS
```

如果写成更接近真实部署的样子：

```text
source/_posts/*.md
  -> hexo generate
  -> public/
  -> /home/ivan/sites/syfyivan-blog/releases/<timestamp>/
  -> current -> releases/<timestamp>
  -> Caddy: /blog/* -> current/
  -> https://example.com/blog/
```

这里每一层都有一个明确职责：

- Hexo 负责把内容变成静态文件；
- SSH 负责安全登录和传输；
- release 目录负责可回滚发布；
- Caddy 负责把 HTTP 请求指到正确文件；
- `/blog/` 子路径负责和已有服务隔离。

## 静态博客是什么

Hexo、Hugo、Jekyll 这类工具都属于静态站点生成器。

我们平时写的是 Markdown：

```text
source/_posts/hello-world.md
```

构建后会变成 HTML：

```text
public/2026/04/10/hello-world/index.html
```

同时还会生成首页、归档页、标签页、CSS、JS、图片等资源：

```text
public/index.html
public/archives/index.html
public/tags/index.html
public/css/main.css
public/js/boot.js
```

静态博客的特点是：服务器不需要运行 Node.js 应用，不需要数据库，也不需要每次请求都动态渲染页面。浏览器要什么文件，Web 服务器直接把文件返回即可。

这让部署变得很简单，但也带来一个要求：构建出来的链接路径必须和服务器上的访问路径一致。

## 为什么选择 `/blog/`，而不是根路径 `/`

如果服务器只跑一个博客，可以直接把博客挂在根路径：

```text
https://example.com/
```

但现实里，服务器上可能已经有其他服务：

```text
/forest-shuffle-room/
/texas-holdem-room/
/token-board/
/lark/
/worker/
```

这时如果把博客挂到 `/`，很容易覆盖已有服务，或者被已有的 catch-all 路由拦截。

更稳妥的方式是给博客一个独立前缀：

```text
/blog/
```

这样访问关系就很清楚：

```text
/blog/                 -> 博客首页
/blog/css/main.css      -> 博客 CSS
/blog/2026/04/10/...    -> 博客文章
/token-board/           -> 原来的服务
/lark/                  -> 原来的服务
```

这是一条很重要的部署原则：在已有服务器上加新站点时，优先选择独立域名或独立路径，不要抢占根路径。

## 子路径部署的坑：资源路径

如果 Hexo 默认配置是：

```yaml
url: https://username.github.io/
root: /
```

构建出来的页面可能会引用：

```html
<link rel="stylesheet" href="/css/main.css">
<script src="/js/boot.js"></script>
```

这些路径以 `/` 开头，意思是从域名根路径找资源。

但现在博客不是部署在根路径，而是部署在 `/blog/`。浏览器真正应该请求的是：

```text
/blog/css/main.css
/blog/js/boot.js
```

所以构建时要把 Hexo 的 `root` 改成 `/blog/`：

```yaml
url: https://example.com/blog
root: /blog/
```

我一般不直接改主配置，而是临时加一个服务器部署配置：

```bash
cat > /tmp/blog-server.yml <<'YAML'
url: https://example.com/blog
root: /blog/
YAML

npx hexo generate --config _config.yml,/tmp/blog-server.yml
```

这样本地 GitHub Pages 或其他环境可以继续使用原来的配置，云服务器部署时再覆盖 URL 和 root。

## SSH：连接服务器的钥匙

SSH 是最常见的服务器登录方式：

```bash
ssh user@server-ip
```

如果服务器只允许公钥登录，就需要指定私钥：

```bash
ssh -i ~/.ssh/your_key user@server-ip
```

这里有几个概念容易混淆。

第一个是私钥和公钥。

```text
本地私钥：~/.ssh/your_key
本地公钥：~/.ssh/your_key.pub
服务器：~/.ssh/authorized_keys
```

服务器保存你的公钥，本地用私钥证明“我是这个公钥对应的人”。私钥不要上传到服务器，不要提交到 Git，也不要发给别人。

第二个是 host key。

第一次连接服务器时，SSH 会问你是否信任这台机器：

```text
The authenticity of host ... can't be established.
```

这是为了防止中间人攻击。确认无误后，SSH 会把服务器指纹记到：

```text
~/.ssh/known_hosts
```

如果出现：

```text
Host key verification failed
```

可能是本地还没信任这台服务器，也可能是服务器指纹变了。前者可以添加 known_hosts，后者要谨慎排查。

第三个是权限。

如果出现：

```text
Permission denied (publickey)
```

通常说明当前私钥不被服务器接受，或者用户名不对，或者公钥没有写入服务器的 `authorized_keys`。

## 发布目录：不要直接覆盖线上文件

最简单的部署方式是：

```bash
rsync -az --delete public/ user@server:/var/www/blog/
```

这能跑，但不够稳。

更推荐 release 目录结构：

```text
/home/ivan/sites/syfyivan-blog/
  releases/
    20260516085430/
      index.html
      css/
      js/
    20260517103000/
      index.html
      css/
      js/
  current -> releases/20260517103000
```

每次部署创建一个新目录：

```bash
release=$(date -u +%Y%m%d%H%M%S)
mkdir -p /home/ivan/sites/syfyivan-blog/releases/$release
```

上传完成后再切换软链接：

```bash
ln -sfn releases/$release /home/ivan/sites/syfyivan-blog/current
```

这样做有几个好处：

- 上传过程中不会破坏当前线上版本；
- 切换 `current` 很快，接近原子操作；
- 如果新版本有问题，可以把 `current` 切回旧 release；
- 服务器上能保留历史发布记录。

这也是很多真实生产部署系统的基本思想。

## Caddy：让 URL 找到文件

Caddy 是一个 Web 服务器，和 Nginx 类似，但配置更简洁，也能自动处理 HTTPS。

如果要把 `/blog/` 映射到静态文件目录，可以在 Caddyfile 里写：

```caddy
redir /blog /blog/ 308

handle_path /blog/* {
	root * /home/ivan/sites/syfyivan-blog/current
	file_server
}
```

这段配置的意思是：

- 访问 `/blog` 时重定向到 `/blog/`；
- 访问 `/blog/*` 时，去 `/home/ivan/sites/syfyivan-blog/current` 里找文件；
- `handle_path` 会自动去掉 `/blog` 前缀，所以 `/blog/css/main.css` 会对应到 `current/css/main.css`。

如果服务器已有其他路由，顺序很重要。比如：

```caddy
handle_path /token-board/* {
	reverse_proxy 127.0.0.1:8789
}

handle_path /blog/* {
	root * /home/ivan/sites/syfyivan-blog/current
	file_server
}

respond "server ready\n"
```

`/blog/` 要放在最终的兜底响应之前。否则请求可能还没匹配到博客，就被 `respond` 提前返回了。

## sudo：为什么没有它会麻烦

Web 服务配置一般放在系统目录：

```text
/etc/caddy/Caddyfile
/etc/nginx/nginx.conf
/etc/nginx/sites-enabled/...
```

这些文件通常属于 root，普通用户不能直接修改。

如果当前用户没有免密 sudo，就不能在自动化脚本里直接执行：

```bash
sudo vim /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

这不是坏事。生产服务器本来就不应该让普通部署脚本拥有无限 root 权限。

但它意味着：首次接入站点时，通常需要人工输入一次 sudo 密码，把 Web 服务路由写进持久配置。以后只更新静态文件，就不需要 sudo 了。

这里要把两层东西分开：

```text
第 1 层：博客内容
  Markdown、Hexo、public/、releases/、current
  属于项目自己的发布目录
  日常更新不需要 sudo

第 2 层：服务器入口
  Caddy/Nginx 配置、80/443 端口、URL 路由
  属于整台服务器共享的系统配置
  首次接入通常需要 sudo
```

可以用一个很生活化的比喻理解：

```text
博客文件 = 店里的商品
Caddy 配置 = 商场导视牌
```

每天更新商品，是你自己的事；但第一次让导视牌出现“博客在 `/blog/` 这里”，需要商场管理员权限。

所以 sudo 不是为了每次发布文章，而是为了第一次把这个 URL 接到你的站点目录：

```text
/blog/ -> /home/ivan/sites/syfyivan-blog/current
```

这条路由一旦持久写进 Caddyfile，后面自动部署只需要替换 `current` 指向的新 release，不再需要动系统配置。

## Caddy admin API：能临时生效，但不等于持久化

Caddy 默认有一个本地 admin API：

```text
http://127.0.0.1:2019/config/
```

可以读取当前运行配置，也可以 load 新配置。

这让我们在没有 sudo 的情况下，有时也能把路由加到当前运行态：

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  --data-binary @caddy-runtime-with-blog.json \
  http://127.0.0.1:2019/load
```

但要注意：运行态配置不一定会写回 `/etc/caddy/Caddyfile`。

如果 systemd 里的 Caddy 是这样启动的：

```text
caddy run --config /etc/caddy/Caddyfile
```

那么 Caddy 重启后仍然会读取 Caddyfile。也就是说，通过 admin API 加的路由可能会在重启后丢失。

所以正确理解是：

- admin API 适合临时修复、实验、无 sudo 场景；
- Caddyfile 才是持久配置；
- 真正长期部署，应该把 `/blog/` 写入 Caddyfile 并 reload。

## 文件权限：为什么明明文件在，访问却 403

Web 服务器通常不是用你的登录用户运行的。比如 Caddy 可能是：

```text
user: caddy
group: caddy
```

如果静态文件放在：

```text
/home/ivan/sites/syfyivan-blog/current
```

Caddy 要访问这个文件，必须能一路穿过目录：

```text
/home
/home/ivan
/home/ivan/sites
/home/ivan/sites/syfyivan-blog
/home/ivan/sites/syfyivan-blog/current
```

目录的 `x` 权限代表“能穿过这个目录”。没有 `x`，即使文件本身是 `644`，Web 服务器也读不到。

常见权限设置是：

```bash
chmod 755 /home/ivan/sites
chmod 755 /home/ivan/sites/syfyivan-blog
find current -type d -exec chmod 755 {} +
find current -type f -exec chmod 644 {} +
```

如果站点放在用户家目录下，有时还需要：

```bash
chmod o+x /home/ivan
```

这只允许其他用户“穿过”目录，不允许列出目录内容。它和 `755` 不一样：

```text
751: owner 可读写进入，group 可读进入，others 只能进入
755: everyone 可读并进入
```

当然，最好不要把私密文件放在 Web 可访问目录下。静态站点目录应该只包含公开资源。

## 一次手动部署流程

下面是一份可复用的手动部署模板。

本地构建：

```bash
cat > /tmp/blog-server.yml <<'YAML'
url: https://example.com/blog
root: /blog/
YAML

npm ci
npx hexo clean
npx hexo generate --config _config.yml,/tmp/blog-server.yml
```

上传到服务器：

```bash
SERVER=user@example.com
BASE=/home/user/sites/my-blog
RELEASE=$(date -u +%Y%m%d%H%M%S)

ssh "$SERVER" "mkdir -p $BASE/releases/$RELEASE"
rsync -az --delete public/ "$SERVER:$BASE/releases/$RELEASE/"
```

切换线上版本：

```bash
ssh "$SERVER" "
  set -e
  cd $BASE
  find releases/$RELEASE -type d -exec chmod 755 {} +
  find releases/$RELEASE -type f -exec chmod 644 {} +
  ln -sfn releases/$RELEASE current
"
```

验证：

```bash
curl -I https://example.com/blog/
curl -I https://example.com/blog/css/main.css
```

部署完成不是“命令跑完”，而是“关键 URL 验证通过”。

## 自动部署应该长什么样

当手动流程稳定后，就可以自动化。

最常见的是 GitHub Actions：

```text
push main
  -> npm ci
  -> hexo generate
  -> rsync 到服务器 releases/<timestamp>
  -> 切换 current
  -> curl 验证 /blog/
```

GitHub Actions 需要保存几个 secret：

```text
SERVER_HOST
SERVER_USER
SERVER_SSH_KEY
```

一个简化版 workflow 大概是：

```yaml
name: Deploy Blog

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - name: Build for cloud server
        run: |
          cat > /tmp/blog-server.yml <<'YAML'
          url: https://example.com/blog
          root: /blog/
          YAML
          npx hexo clean
          npx hexo generate --config _config.yml,/tmp/blog-server.yml

      - name: Prepare SSH
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.SERVER_SSH_KEY }}" > ~/.ssh/deploy_key
          chmod 600 ~/.ssh/deploy_key
          ssh-keyscan -H "${{ secrets.SERVER_HOST }}" >> ~/.ssh/known_hosts

      - name: Upload and switch release
        run: |
          set -e
          SERVER="${{ secrets.SERVER_USER }}@${{ secrets.SERVER_HOST }}"
          BASE="/home/${{ secrets.SERVER_USER }}/sites/my-blog"
          RELEASE="$(date -u +%Y%m%d%H%M%S)"

          ssh -i ~/.ssh/deploy_key "$SERVER" "mkdir -p $BASE/releases/$RELEASE"
          rsync -az --delete -e "ssh -i ~/.ssh/deploy_key" public/ "$SERVER:$BASE/releases/$RELEASE/"
          ssh -i ~/.ssh/deploy_key "$SERVER" "
            set -e
            cd $BASE
            find releases/$RELEASE -type d -exec chmod 755 {} +
            find releases/$RELEASE -type f -exec chmod 644 {} +
            ln -sfn releases/$RELEASE current
          "

      - name: Smoke test
        run: curl -fsSI "https://example.com/blog/"
```

注意：自动部署静态文件不需要 sudo。只要 Caddy 的 `/blog/` 路由已经持久写好，后续每次发布只是更新 `current` 指向。

## CI/CD 会不会影响服务器上的其他项目

不会天然影响。

CI/CD 的作用范围不是“整台云服务器”，而是：

```text
当前 GitHub 仓库
  + workflow 里写的命令
  + workflow 里写的服务器路径
```

比如我的博客仓库配置了 GitHub Actions：

```text
Syfyivan.github.io push
  -> 触发 Syfyivan.github.io/.github/workflows/deploy.yml
  -> 构建这个仓库
  -> 上传到 /home/ivan/sites/syfyivan-blog/
```

那它只会部署这个博客。服务器上的其他项目不会被 GitHub Actions 自动扫描，也不会因为这个仓库 push 了代码就一起更新。

真正危险的是 workflow 写得太宽，例如：

```bash
rsync -az --delete public/ user@server:/home/ivan/sites/
```

如果 `/home/ivan/sites/` 下面还有别人的博客，`--delete` 就可能误删或覆盖别人的文件。

安全写法是把部署目录固定到自己的项目：

```bash
BASE="/home/ivan/sites/syfyivan-blog"
RELEASE="$(date -u +%Y%m%d%H%M%S)"

ssh "$SERVER" "mkdir -p '$BASE/releases/$RELEASE'"
rsync -az --delete public/ "$SERVER:$BASE/releases/$RELEASE/"
ssh "$SERVER" "ln -sfn 'releases/$RELEASE' '$BASE/current'"
```

这里的 `--delete` 是安全的，因为目标是新创建的 release 目录：

```text
/home/ivan/sites/syfyivan-blog/releases/<timestamp>/
```

它不会删除 `/home/ivan/sites/` 下的其他项目。

还可以在脚本里加一道硬保护，防止变量写错：

```bash
case "$BASE" in
  /home/ivan/sites/syfyivan-blog) ;;
  *) echo "Refusing unsafe deploy path: $BASE"; exit 1 ;;
esac
```

所以更准确的结论是：

```text
push 只触发当前仓库的 CI/CD；
CI/CD 只影响脚本里写到的路径；
只要路径锁定在自己的项目目录，就不会影响别人。
```

## 不要把 sudo 交给自动部署

很多人第一反应是：既然 CI 需要 reload Caddy，那就给它 sudo。

但更安全的做法是：把需要 root 的事情减少到一次。

推荐分工：

```text
一次性人工操作：
  写入 /etc/caddy/Caddyfile
  caddy validate
  systemctl reload caddy

每次自动部署：
  构建 public/
  上传到 releases/
  切换 current
  curl 验证
```

如果确实需要自动 reload，也应该配置非常窄的 sudo 权限，只允许特定命令，而不是给部署用户完整 root 权限。

例如只允许：

```text
/usr/bin/caddy validate --config /etc/caddy/Caddyfile
/bin/systemctl reload caddy
```

但这属于服务器权限设计，改之前要想清楚风险。

## 常见故障排查

### 首页能打开，但 CSS/JS 404

大概率是 Hexo 的 `root` 没配置成 `/blog/`。

检查 HTML：

```bash
grep -n 'css/main.css' public/index.html
```

如果看到：

```html
href="/css/main.css"
```

但站点实际挂在 `/blog/`，就会出错。应该构建成：

```html
href="/blog/css/main.css"
```

### 文件在服务器上，但访问 403

检查权限：

```bash
namei -l /home/user/sites/my-blog/current/index.html
```

重点看每一级目录有没有 `x` 权限。

### `/blog/` 返回了别的服务内容

检查 Caddy 路由顺序。

`/blog/` 必须在 catch-all 响应之前，例如：

```caddy
handle_path /blog/* {
	root * /home/user/sites/my-blog/current
	file_server
}

respond "server ready\n"
```

### Caddy 重启后博客没了

如果之前是通过 admin API 加的运行态配置，重启后会丢。

解决方法是把配置写入：

```text
/etc/caddy/Caddyfile
```

然后：

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

### 本机能访问，公网不能访问

检查：

- 云服务器安全组是否开放 80/443；
- 系统防火墙是否允许 80/443；
- Caddy 是否监听公网地址；
- 域名是否解析到正确 IP；
- HTTPS 证书是否匹配域名。

## 部署前的安全清单

在已有服务器上部署新博客，我会检查这些点：

- 不覆盖根路径 `/`，优先使用 `/blog/` 或独立域名；
- 不修改已有服务路径；
- 不把私钥、`.env`、数据库备份放进 Web 根目录；
- 静态文件目录只放公开资源；
- Caddy 配置先备份，再修改；
- 修改后先 validate，再 reload；
- 部署后验证新博客和旧服务；
- 自动部署只负责上传静态文件，不默认拥有 sudo。

## 总结

云服务器部署博客不是单纯的“把文件传上去”。更准确地说，它是一条工程链路：

```text
构建
  -> 传输
  -> 权限
  -> 路由
  -> 验证
  -> 自动化
```

这条链路里最重要的不是某个命令，而是边界意识：

- 本地构建和服务器配置分开；
- 新博客和旧服务分开；
- 运行态配置和持久配置分开；
- 普通部署权限和 root 权限分开；
- 上传完成和验证完成分开。

掌握这些边界之后，无论用 Hexo、Hugo、VuePress，还是把 Caddy 换成 Nginx，本质都差不多。

部署不是玄学，它只是把每一层的责任摆正。
