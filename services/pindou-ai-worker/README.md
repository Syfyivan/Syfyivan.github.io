# 豆格工坊 AI 人像服务

这个小服务只做一件事：把人物照片交给 GPT Image 2 编辑成适合拼豆缩图的卡通合照。博客本身、MARD 选色、格子图和导出继续放在 GitHub Pages，不产生服务器费用。

## 为什么单独放在 Worker

- OpenAI 密钥永远不写进公开博客。
- 私人访问口令阻止陌生人调用。
- KV 每日额度给总费用加硬上限。
- 前端缓存 AI 结果；改格数、改颜色或导出不会再次调用模型。

## 第一次部署

1. 在 OpenAI API 控制台创建项目密钥并开通计费。不要把密钥发到聊天、提交到 Git 或填进网页。
2. 登录 Cloudflare，进入本目录后复制 `wrangler.example.jsonc` 为 `wrangler.jsonc`。
3. 创建免费 KV：`npx wrangler kv namespace create RATE_LIMIT`，把返回的命名空间 ID 填进 `wrangler.jsonc`。
4. 分别执行 `npx wrangler secret put OPENAI_API_KEY` 和 `npx wrangler secret put PINDOU_ACCESS_CODE`，在终端的隐藏输入框中填写两个密钥。
5. 执行 `npx wrangler deploy --config wrangler.jsonc`。
6. 把部署结果中的 `https://...workers.dev` 地址填入 `source/pindou-studio/config.js` 的 `endpoint`，再构建和发布博客。

访问口令只是这个私人网页的门锁，应当使用随机且不复用的字符串。`DAILY_LIMIT` 默认是 10，可以在 `wrangler.jsonc` 里改小。

## 本地验证

在仓库根目录执行：

```text
npm run pindou:ai-test
npm run pindou:logic-test
npm run build
```

测试使用假的上游响应，不会调用 OpenAI，也不会产生费用。

## 成本边界

目前使用 `gpt-image-2`、`1024×1024`、`low`、JPEG。官方价格表中这一尺寸的低质量输出约为 0.006 美元/张，此外还会有输入图片和提示词费用。最终账单以 OpenAI 控制台为准。Cloudflare Workers 和 KV 在个人低频使用下通常可落在免费额度内，但仍应保留每日上限和平台预算提醒。
