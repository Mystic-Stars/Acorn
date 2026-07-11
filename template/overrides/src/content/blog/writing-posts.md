---
title: "使用 Markdown 写文章"
description: "了解 Acorn 的文章目录、Frontmatter、封面、草稿、置顶和图片写法。"
pubDate: 2026-07-11T12:00:00+08:00
cover: { tone: plum, label: "内容写作" }
draft: false
featured: false
category: "Acorn 指南"
tags: ["Markdown", "写作"]
author: "Acorn"
---

# 使用 Markdown 写文章

在 `src/content/blog/` 创建 `.md` 文件：

```yaml
---
title: "文章标题"
description: "用于列表和搜索结果的摘要"
pubDate: 2026-07-11T12:00:00+08:00
cover:
  tone: mint
  label: "随笔"
  url: "/images/posts/cover.webp"
  alt: "封面内容说明"
draft: false
featured: false
category: "随笔"
tags: ["生活", "记录"]
author: "Your Name"
---
```

正文写在第二个 `---` 后面。文件名会成为文章地址，例如 `my-story.md` 对应 `/archives/my-story/`。

## 封面

`tone` 支持 `mint`、`sunset`、`ocean`、`plum` 和 `forest`。没有图片时会显示主题色封面；使用图片时请同时填写 `alt`。

图片可以放在 `public/images/posts/`，并使用 `/images/posts/example.webp` 引用。

## 草稿与置顶

- `draft: true`：生产构建不发布
- `featured: true`：进入首页置顶区域
- `updatedDate`：文章有实质更新时填写

## 常用 Markdown

支持标题、列表、引用、表格、链接、图片和围栏代码块。文章目录根据二、三级标题自动生成，代码块会显示语言并提供复制按钮。
