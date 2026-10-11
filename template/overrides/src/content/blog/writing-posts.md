---
title: '使用 Markdown 写文章'
description: '了解 Acorn 的文章目录、Frontmatter、封面、草稿、置顶和图片写法。'
pubDate: 2026-07-11T12:00:00+08:00
cover: { tone: plum, label: '内容写作' }
draft: false
featured: false
category: 'Acorn 指南'
tags: ['Markdown', '写作']
author: 'Acorn'
---

# 使用 Markdown 写文章

在 `src/content/blog/` 创建 `.md` 文件：

```yaml
---
title: '文章标题'
description: '用于列表和搜索结果的摘要'
pubDate: 2026-07-11T12:00:00+08:00
cover:
  tone: mint
  label: '随笔'
  upload: '/images/posts/uploads/cover.webp'
  alt: '封面内容说明'
draft: false
featured: false
category: '随笔'
tags: ['生活', '记录']
author: 'Your Name'
---
```

正文写在第二个 `---` 后面。文件名会成为文章地址，例如 `my-story.md` 对应 `/archives/my-story/`。

## 封面

`tone` 支持 `mint`、`sunset`、`ocean`、`plum` 和 `forest`。没有图片时会显示主题色封面；使用图片时请同时填写 `alt`。

历史图片按文章目录放在 `public/images/posts/<文章文件名>/`；Pages CMS 新上传图片放在 `public/images/posts/uploads/`，并使用 `/images/posts/...` 引用。

## 使用 Pages CMS 写作

将仓库接入 Pages CMS 后，可在“博客文章”创建和编辑文章。新文章默认草稿，发布前关闭草稿开关；创建时建议填写稳定的英文文件名。

正文使用 Markdown 富文本编辑器。在 **Editor** 中粘贴截图、拖入图片，或输入 `/` → **Image** 上传；图片自动保存到 `public/images/posts/uploads/` 并插入 Markdown 引用。**Source** 用于修改正文源码。需要保留原生 HTML、复杂表格或代码围栏元数据时，使用“源码维护（高级）→ 文章完整源码”。

“封面图片”写入 `cover.upload`，使用本地文章媒体库。`cover.url` 只用于读取历史内容；新文章不要填写远程封面。`public/` 图片按原样发布，建议上传前裁切、压缩。

首次接入请验证图片上传、封面上传、友链头像上传、上传图片清空与复杂 Markdown 源码保存；“检查内容与构建”按钮可运行当前分支的检查。当前没有预约发布任务，未来发布时间不会自动延迟发布。

## 草稿与置顶

- `draft: true`：生产构建不发布
- `featured: true`：进入首页置顶区域
- `updatedDate`：文章有实质更新时填写

## 常用 Markdown

支持标题、列表、引用、表格、链接、图片和围栏代码块。文章目录根据二、三级标题自动生成，代码块会显示语言并提供复制按钮。
