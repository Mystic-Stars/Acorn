---
title: "Acorn 完整配置指南"
description: "逐项配置站点资料、首页、导航、归档、友链、评论、统计与主题颜色。"
pubDate: 2026-07-11T11:00:00+08:00
cover: { tone: ocean, label: "完整配置" }
draft: false
featured: true
category: "Acorn 指南"
tags: ["Acorn", "配置"]
author: "Acorn"
---

# 完整配置指南

Acorn 把可编辑设置集中在 `src/config/`，页面组件中不需要重复填写站点信息。

## `site.ts`：站点与作者

修改站点名称、标题、描述、头像、建站日期、作者资料、页脚与社交链接。头像和 Logo 推荐放入 `public/`，并使用 `/avatar.webp` 这样的路径。

重点检查：

- `name`、`title`、`description`
- `establishedAt`，格式为 `YYYY-MM-DD`
- `author` 中的名字、简介、所在地和兴趣
- `footer.copyrightStartYear`
- `socialLinks`

不需要备案信息时将 `footer.icp` 保持为空字符串。

## `content.ts`：首页与关于页

- `homeConfig.notices`：首页公告
- `featured.maxItems`：置顶文章数量
- `pagination.pageSize`：每页文章数
- `aboutConfig`：关于页面的卡片内容
- `articleTocConfig`：文章目录开关和最大深度
- `articleReaderConfig`：复制代码和图片预览文案

## `navigation.ts`：导航与搜索

通过 `primary` 调整主导航，通过 `utility` 调整辅助链接。内部链接以 `/` 开头；外部链接应设置 `external: true`。

## `archives.ts`：文章归档

这里可以配置归档路由、最近文章数量、日期和标签显示方式，以及筛选器文案。

## `friend-links.ts`：友链

将 `repository`、`defaultBranch`、`documentationUrl` 和 `contactEmail` 改成你自己的信息。每个友链文件放在 `src/content/friends/`。

## `comments.ts`：评论

默认关闭。准备好 Twikoo 服务后，将 `enabled` 改为 `true`，并通过环境变量提供公开端点：

```dotenv
PUBLIC_TWIKOO_ENV_ID=https://你的服务/.netlify/functions/twikoo
```

## `analytics.ts`：访问统计

默认关闭。启用前填写服务商提供的公开站点 ID。密钥、数据库密码等敏感值不得写入配置文件。

## `theme.ts`：视觉主题

这里集中保存颜色、内容宽度、圆角和动效参数。修改后应检查浅色、深色、移动端和键盘焦点状态，不要删除 Animal Island 的可访问性规则。

## 最后检查

全局搜索并替换：

```text
Acorn Blog
Your Name
your-name
example.com
```

然后运行 `npm run check && npm run build`。
