# Acorn 配置手册

Acorn 将频繁修改的站点内容集中在 `src/config/`，将框架构建选项保留在根目录 `astro.config.mjs`。

## 配置文件

| 文件                       | 修改内容                                                 |
| -------------------------- | -------------------------------------------------------- |
| `src/config/site.ts`       | 站点名称、创站日期、作者资料、语言、日期、页脚和社交链接 |
| `src/config/navigation.ts` | 主导航与页脚工具导航                                     |
| `src/config/archives.ts`   | 归档路由、开发环境草稿、文章元信息与归档筛选文案         |
| `src/config/content.ts`    | 首页侧边栏小组件与关于页文案                             |
| `src/config/theme.ts`      | 颜色、内容宽度、文章宽度、圆角和动效                     |
| `astro.config.mjs`         | 输出模式、域名、集成、URL 规则与 Markdown 高亮           |
| `src/content.config.ts`    | 文章 frontmatter 的类型与校验规则                        |

`siteConfig.branding` 统一管理站点 logo 与作者头像路径；默认两者均使用 `public/favicon.svg`。`siteConfig.footer` 中的主题与组件库署名会显示在页脚。

## Pages CMS

根目录的 [`.pages.yml`](../.pages.yml) 是 Pages CMS 的配置入口。将 GitHub 仓库接入 [Pages CMS](https://pagescms.org/) 后，侧栏会提供以下内容：

- **博客文章**：可新建、编辑、重命名与删除 `src/content/blog/` 内的文章；文章列表默认按发布时间倒序排列，并支持标题、摘要、分类、标签和作者搜索。
- **封面图片**：封面上传至 `public/images/posts/`，并以 `/images/posts/...` 写入 `cover.url`。已有文章的远程封面地址会原样保留。
- **正文**：使用 Markdown/MDX 源码编辑器，避免保存时破坏现有文章中的 MDX import 和 Astro 组件。
- **站点配置（高级）**：`src/config/` 中作为站点内容来源的 TypeScript 文件以代码编辑器提供；仅适合熟悉 TypeScript 的维护者使用，且不能从 CMS 删除。

Pages CMS 不需要添加 npm 依赖或改动 Astro 构建流程；内容保存为 Git 提交，现有部署流程会照常构建和发布。Pages CMS 的 `cover.url` 上传路径已在 `src/content.config.ts` 中校验为合法远程 URL 或 `/images/...` 公共路径。

修改 `theme.ts` 后，`BaseLayout.astro` 会把配置映射为 CSS 变量；组件通过 `src/styles/tokens.css` 中的语义 token 使用这些变量。

`animal-island-ui` 自带组件的内部样式由 `animal-island-ui/style` 提供，项目主题配置主要用于页面结构和组件库未覆盖的界面。开发新界面时先查 `AI_USAGE.md` 并复用组件；只有组件库没有对应能力时才按 `DESIGN_PROMPT.md` 实现 Astro 原生样式。

组件库的 npm ESM 构建包含 Node 无法直接执行的 CSS side-effect import。`npm install` 会通过 `scripts/patch-animal-island-ui.mjs` 去除重复的模块级样式导入；完整组件样式仍由共享布局中的 `animal-island-ui/style` 一次性载入。不要删除 `postinstall`，除非上游已原生支持 Astro 预渲染。

## 首页分类筛选与侧栏小组件

首页开头的横向筛选栏不使用跳转链接；它会从文章 frontmatter 的 `category` 自动收集分类，并在当前页即时筛选文章卡片。

右侧作者卡片从 `src/config/site.ts` 的 `author` 读取姓名、身份、简介、所在地、签名和关注方向，点击卡片顶部可平滑展开详细资料。标签卡片会自动汇总所有已发布文章的 `tags`，并链接到带有对应筛选条件的文章归档页。

“岛屿状态”会在构建时自动统计已发布文章数量和正文总字数。建站天数由 `src/config/site.ts` 的 `establishedAt` 计算；请使用 `YYYY-MM-DD` 格式，例如：

```ts
establishedAt: '2026-07-10',
```

创站当天计为第 1 天。侧栏标题、按钮和统计项标签统一在 `src/config/content.ts` 的 `homeConfig.sidebar` 修改。

`articleTocConfig` 同样位于 `src/config/content.ts`，用于控制文章页侧栏的“文章目录”。目录会从文章 Markdown 的二、三级标题自动生成锚点链接，并在阅读滚动时高亮当前章节；它不需要为每篇文章单独维护。

## 首页文字公告与置顶文章

`src/config/content.ts` 的 `homeConfig.notices` 是首页顶部的纯文字公告列表：默认自动轮播，点击整条公告或圆点都可手动切换。`homeConfig.featured` 控制置顶文章横条的文案和 `maxItems` 数量（最多 5）；横条会自动选择最新的 `featured: true` 文章，并在右侧列表中平滑切换。没有置顶文章时，该横条不会渲染。

`homeConfig.pagination.pageSize` 控制首页每页显示的文章数量，默认是 6。第一页路径为 `/`，后续页使用 `/page/2/`、`/page/3/` 等静态路径。首页分类筛选仅筛选当前页的文章。

## 域名

复制 `.env.example` 为 `.env`，设置：

```dotenv
SITE_URL=https://your-domain.example
```

该值用于 canonical URL、RSS 与 Sitemap。

## 新增文章

在 `src/content/blog/` 下创建 `.md` 或 `.mdx`：

```markdown
---
title: 文章标题
description: 用于列表与 SEO 的摘要
pubDate: 2026-07-10
updatedDate: 2026-07-11
cover:
  tone: mint
  label: FIELD NOTE
  # image: ../../assets/covers/your-cover.jpg
  # url: https://cdn.example.com/your-cover.jpg
  # alt: 封面图片的替代文本
draft: false
featured: false
category: 开发笔记
tags:
  - Astro
  - 前端
author: 作者名
---

正文内容。
```

`title`、`description`、`pubDate` 和 `cover` 必填。每一篇文章都会渲染一个固定 **1000 × 500（2:1）** 的封面区域：只提供 `tone` 时使用站点内置的 CSS 封面版式；`image` 用于本地 Astro 资源，`url` 用于远程图片（例如迁移文章时保留原封面链接），两者提供其一即可。开发模式是否显示草稿由 `archives.ts` 控制；生产构建始终过滤草稿。

## 迁移旧文章

`scripts/import-legacy-posts.py` 将 `docs/export2doc_20260710153018 (2)/` 中的 Halo HTML 导出内容转换为 `src/content/blog/` 的 Markdown。脚本使用 `docs/legacy-post-metadata.json` 对齐旧文章的发布日期、别名、分类、标签、置顶状态和封面链接；含代码块的文章会自动生成 `.mdx`，并使用 Animal Island 的 `CodeBlock` 组件渲染。

```bash
python scripts/import-legacy-posts.py
```

`Hello Halo.html`（Halo 默认欢迎文章）和 `test.html`（第三方验证文件）会被明确跳过。重新执行脚本会覆盖已迁移文章文件。

## 文章归档

`/archives/` 会一次展示所有公开文章。页面顶部会自动从文章 frontmatter 的 `category` 汇总分类标签；下方可折叠的标签栏会汇总所有 `tags`，支持多选；归档容器内的年份按钮则根据 `pubDate` 自动生成。三项筛选可叠加，且无需为每个年份维护单独页面。

归档路由、筛选文案、草稿策略与文章元信息开关均在 `src/config/archives.ts` 中配置。筛选状态会同步到 URL，例如 `/archives/?tags=astro,frontend`，可直接分享或收藏。文章的 Content Collection 仍保留 `blog` 作为内部集合名称，因此 Markdown 文件继续存放在 `src/content/blog/`。

## 扩展交互

默认优先使用 Astro 原生组件。确实需要客户端交互时再添加框架集成，并选择最窄的 hydration 指令，例如 `client:visible` 或 `client:idle`。

项目级 AI 开发规范位于 `AGENTS.md`，Animal Island 视觉规范位于 `.agents/skills/animal-island-ui-style/`。
