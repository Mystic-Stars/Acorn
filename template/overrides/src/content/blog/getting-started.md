---
title: "从模板创建你的 Acorn 博客"
description: "从 GitHub Template 到本地启动，只需要完成几个简单步骤。"
pubDate: 2026-07-11T10:00:00+08:00
cover: { tone: forest, label: "快速开始" }
draft: false
featured: true
category: "Acorn 指南"
tags: ["Acorn", "安装", "Astro"]
author: "Acorn"
---

# 从模板创建博客

## 1. 创建自己的仓库

打开 [Acorn Theme](https://github.com/Mystic-Stars/acorn-theme)，点击 **Use this template** → **Create a new repository**。这会创建一份没有继承关系的独立博客仓库。

## 2. 克隆并安装

```bash
git clone git@github.com:你的用户名/你的仓库名.git
cd 你的仓库名
npm install
```

Acorn 要求 Node.js 22.12 或更高版本。

## 3. 配置环境变量

```bash
cp .env.example .env
```

将站点地址改成你的正式域名：

```dotenv
SITE_URL=https://blog.example.com
```

## 4. 启动开发服务器

```bash
npm run dev
```

访问终端显示的本地地址。修改 `src/config/` 或 Markdown 内容时，页面会自动刷新。

## 5. 发布前检查

```bash
npm run check
npm run build
npm run preview
```

确认构建成功后提交代码：

```bash
git add .
git commit -m "content: initialize my Acorn blog"
git push
```
