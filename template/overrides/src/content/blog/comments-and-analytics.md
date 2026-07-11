---
title: "配置评论与访问统计"
description: "安全启用 Twikoo、51la 和不蒜子，并区分公开配置与敏感凭据。"
pubDate: 2026-07-11T13:00:00+08:00
cover: { tone: sunset, label: "站点服务" }
draft: false
featured: false
category: "Acorn 指南"
tags: ["Twikoo", "Analytics"]
author: "Acorn"
---

# 评论与访问统计

## Twikoo 评论

先自行部署 Twikoo 后端，然后在部署平台添加：

```dotenv
PUBLIC_TWIKOO_ENV_ID=https://your-twikoo.example/.netlify/functions/twikoo
```

再打开 `src/config/comments.ts`：

```ts
enabled: true
```

`PUBLIC_` 前缀代表该值会发送给浏览器，因此这里只能保存公开服务端点。数据库、SMTP 和管理员凭据必须留在 Twikoo 后端。

评论管理入口默认是 `/manage-comments/`，页面已设置 `noindex`，但管理员密码仍必须妥善保存。

## 访问统计

在 `src/config/analytics.ts` 中填写统计平台提供的公开站点 ID，然后启用：

```ts
enabled: true
```

不需要统计时保持关闭，可以避免加载第三方脚本。不蒜子计数器可通过 `publicCounter.enabled` 独立控制。

## 发布前检查

确保 `.env` 已被 Git 忽略，并检查提交中没有数据库密码、SMTP 密码、访问令牌或管理员凭据。
