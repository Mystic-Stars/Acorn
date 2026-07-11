---
title: "将 Acorn 部署到 Vercel"
description: "连接 GitHub、设置 SITE_URL、自定义域名并验证生产构建。"
pubDate: 2026-07-11T14:00:00+08:00
cover: { tone: forest, label: "部署" }
draft: false
featured: false
category: "Acorn 指南"
tags: ["Vercel", "部署", "域名"]
author: "Acorn"
---

# 部署到 Vercel

## 导入仓库

在 Vercel 新建项目并导入你的 GitHub 仓库。Vercel 会识别 Astro，通常不需要手动修改构建命令：

```text
Build Command: npm run build
Output Directory: dist
```

## 设置环境变量

在项目的 Production、Preview 和 Development 环境中添加：

```dotenv
SITE_URL=https://blog.example.com
```

启用评论时同时添加 `PUBLIC_TWIKOO_ENV_ID`。

## 添加自定义域名

在 Vercel 项目的 Domains 页面添加域名，然后按照提示在 DNS 服务商处设置记录。子域名通常使用：

```text
类型：CNAME
名称：blog
目标：cname.vercel-dns.com
```

最终记录以 Vercel 页面实时显示的要求为准。DNS 生效后，Vercel 会自动签发 HTTPS 证书。

## 自动部署

连接 GitHub 后，推送默认分支会更新生产站点，其他分支和 Pull Request 会生成预览部署。

部署后检查首页、文章、RSS、`robots.txt`、`sitemap-index.xml`，并确认 canonical URL 使用正式域名。
