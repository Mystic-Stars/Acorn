# Acorn 配置手册

Acorn 将频繁修改的站点内容集中在 `src/config/`，将框架构建选项保留在根目录 `astro.config.mjs`。

## 配置文件

| 文件                         | 修改内容                                                 |
| ---------------------------- | -------------------------------------------------------- |
| `src/config/site.ts`         | 站点名称、创站日期、作者资料、语言、日期、页脚和社交链接 |
| `src/config/navigation.ts`   | 主导航、全局搜索与页脚工具导航                           |
| `src/config/archives.ts`     | 归档路由、开发环境草稿、文章元信息与归档筛选文案         |
| `src/config/content.ts`      | 首页侧边栏小组件与关于页文案                             |
| `src/config/theme.ts`        | 颜色、内容宽度、文章宽度、圆角和动效                     |
| `src/config/comments.ts`     | Twikoo 评论服务、客户端版本与评论区文案                  |
| `src/config/friend-links.ts` | 友链页文案、分类、GitHub 仓库与自助提交行为              |
| `astro.config.mjs`           | 输出模式、域名、集成、URL 规则与 Markdown 高亮           |
| `src/content.config.ts`      | 文章 frontmatter 的类型与校验规则                        |

`siteConfig.branding` 统一管理站点 logo 与作者头像路径；默认两者均使用 `public/favicon.svg`。`siteConfig.footer` 中的主题与组件库署名会显示在页脚。

## 友链

`/friends/` 是静态友链名册，主导航由 `src/config/navigation.ts` 控制。页面文案、分类、收录要求以及用于创建 Pull Request 的仓库信息位于 `src/config/friend-links.ts`；迁移仓库或默认分支时请同步修改其中的 `repository` 与 `defaultBranch`。

每条友链都存放为 `src/content/friends/` 下独立的 Markdown 文件。访客可在友链页填写资料，页面会生成文件内容并打开 GitHub 的新文件页面；GitHub 会提示无写入权限的访客先 Fork，随后即可创建 Pull Request。详情、字段参考和人工提交方法见 [`FRIEND_LINKS.md`](FRIEND_LINKS.md)。

友链 schema 定义在 `src/content.config.ts` 的 `friends` collection。修改字段、字数限制或允许的分类时，必须同步更新 `FRIEND_LINKS.md`、`friend-links.ts` 和该 schema。`.github/workflows/validate.yml` 会在 Pull Request 中运行类型/内容检查与生产构建，以便通过后只需审核内容并合并。

## Pages CMS

根目录的 [`.pages.yml`](../.pages.yml) 是 Pages CMS 的配置入口。将 GitHub 仓库接入 [Pages CMS](https://pagescms.org/) 后，侧栏会提供以下内容：

- **博客文章**：管理 `src/content/blog/` 内的 `.md` 文章；文章列表默认按发布时间倒序排列，并支持标题、摘要、分类、标签和作者搜索。
- **封面图片**：封面上传至 `public/images/posts/`，并以 `/images/posts/...` 写入 `cover.url`。已有文章的远程封面地址会原样保留。
- **正文**：使用原生 Markdown 源码编辑器。标准围栏代码块会由 Astro 的 Shiki 配置自动高亮，不需要 import 自定义组件。
- **站点配置（高级）**：`src/config/` 中作为站点内容来源的 TypeScript 文件以代码编辑器提供；仅适合熟悉 TypeScript 的维护者使用，且不能从 CMS 删除。

Pages CMS 不需要添加 npm 依赖或改动 Astro 构建流程；内容保存为 Git 提交，现有部署流程会照常构建和发布。Pages CMS 的 `cover.url` 上传路径已在 `src/content.config.ts` 中校验为合法远程 URL 或 `/images/...` 公共路径。

修改 `theme.ts` 后，`BaseLayout.astro` 会把配置映射为 CSS 变量；组件通过 `src/styles/tokens.css` 中的语义 token 使用这些变量。

`animal-island-ui` 自带组件的内部样式由 `animal-island-ui/style` 提供，项目主题配置主要用于页面结构和组件库未覆盖的界面。开发新界面时先查 `AI_USAGE.md` 并复用组件；只有组件库没有对应能力时才按 `DESIGN_PROMPT.md` 实现 Astro 原生样式。

## 全局搜索

站点头部的搜索按钮由 `src/config/navigation.ts` 中的 `search` 配置控制；将 `enabled` 设为 `false` 可关闭。搜索索引会在构建时从所有已发布文章生成，覆盖标题、摘要、分类、标签与 Markdown 正文；用户首次打开搜索时才请求同源的 `search-index.json`，不会额外请求第三方服务。搜索框使用 `animal-island-ui` 的原生 `Input` 组件，并支持点击按钮或按 <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>K</kbd> 唤起。

## 评论（Twikoo + Netlify）

文章页评论由 [Twikoo](https://twikoo.js.org/) 提供。博客只加载评论客户端；评论 API 运行在 Netlify Functions，评论数据保存到站长自己的 MongoDB。访客无需注册：在 Twikoo 管理面板将**昵称**、**邮箱**设为必填，将**网址**设为选填，并关闭人工审核以立即公开评论。

### 首次部署

1. 为 Twikoo 准备一个独立的 MongoDB 数据库和读写账号，启用 TLS，并确保 Netlify Functions 可以通过公网连接。不要复用 MongoDB 管理员账号。
2. Fork [twikoojs/twikoo-netlify](https://github.com/twikoojs/twikoo-netlify)，在 Netlify 通过该 Fork 创建站点。
3. 在 Netlify 的环境变量中添加 `MONGODB_URI`，值为 MongoDB TLS 连接串，然后重新部署。该连接串是密钥，绝不能提交到 Git、Pages CMS 或前端环境变量。
4. 打开 `https://<netlify-site>.netlify.app/.netlify/functions/twikoo`；页面显示“Twikoo 云函数运行正常”后，将该完整地址填入部署网站的 `PUBLIC_TWIKOO_ENV_ID`。
5. 打开任意文章页的齿轮图标，设置 Twikoo 管理员密码。在管理面板设置站点名称、站点 URL、站长邮箱和已有域名邮箱的 SMTP 参数，开启站长新评论通知及访客回复通知；再设置限流与关键词过滤。

`PUBLIC_TWIKOO_ENV_ID` 是公开的 API 地址，不是密钥。默认值已指向本站的 Twikoo Netlify Function；仅在迁移到另一套评论服务时，才需要在本地 `.env` 或生产构建环境中覆盖它：

```dotenv
PUBLIC_TWIKOO_ENV_ID=https://your-twikoo.netlify.app/.netlify/functions/twikoo
```

`src/config/comments.ts` 固定了 Twikoo 客户端版本，并采用无默认 CSS 的国内 CDN 镜像。评论样式集中在 `src/styles/twikoo-island.css`，更新 Twikoo 时必须同时更新 Netlify 函数依赖、客户端版本并回归测试。评论按文章永久路径关联，例如 `/archives/hello-world/`；已发布文章不要重命名，否则会生成一个新的评论串。

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

`articleReaderConfig` 控制文章正文的渐进式阅读工具：`codeCopy` 为每个 Markdown 围栏代码块提供 macOS 风格红黄绿窗口按钮、语言标识、复制按钮及成功/失败提示；构建流程会先去除整段代码共同的左侧空白、保留各行的相对缩进，再优先使用围栏的语言标记，或识别常见的 Python、JavaScript、SQL、Shell、HTML、CSS、Mermaid、YAML 与 JSON 内容并交给 Shiki 高亮。仍无法判断时显示 `languageFallback`（默认“纯文本”）。`imagePreview` 让未被链接包裹的正文图片可点击或通过键盘 <kbd>Enter</kbd>/<kbd>Space</kbd> 打开预览。预览会按文章内图片顺序提供上一张/下一张切换，也支持按钮、滚轮或 <kbd>+</kbd>/<kbd>-</kbd> 缩放；放大后可拖拽查看局部，按 <kbd>0</kbd> 还原。两项工具都只在文章页加载，不改变 Markdown 写法，也不会作用于文章封面或已经带链接的图片。请持续为正文图片提供有意义的 alt 文本，它会显示为预览说明并用于辅助技术。

## 首页文字公告与置顶文章

`src/config/content.ts` 的 `homeConfig.notices` 是首页顶部的纯文字公告列表：默认自动轮播，点击整条公告或圆点都可手动切换。`homeConfig.featured` 控制置顶文章横条的文案和 `maxItems` 数量（最多 5）；横条会自动选择最新的 `featured: true` 文章，并在右侧列表中平滑切换。没有置顶文章时，该横条不会渲染。

`homeConfig.pagination.pageSize` 控制首页每页显示的文章数量，默认是 6。第一页路径为 `/`，后续页使用 `/page/2/`、`/page/3/` 等静态路径。首页分类筛选仅筛选当前页的文章。

## 域名

复制 `.env.example` 为 `.env`，设置：

```dotenv
SITE_URL=https://your-domain.example
PUBLIC_TWIKOO_ENV_ID=https://your-twikoo.netlify.app/.netlify/functions/twikoo
```

该值用于 canonical URL、RSS 与 Sitemap。

## 新增文章

在 `src/content/blog/` 下创建 `.md`：

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

文章只使用原生 `.md`，以便通过 Pages CMS 编辑。标准 Markdown 表格会保留语义化 HTML 作为无 JavaScript 的回退，并在仅含表格的文章页 React island 加载后替换为 `animal-island-ui` `Table`；无需在正文中编写 JSX。请保持第一行表头与每行单元格数量一致，复杂单元格继续使用标准 Markdown（链接、强调、行内代码）。

## 迁移旧文章

`scripts/import-legacy-posts.py` 将 `docs/export2doc_20260710153018 (2)/` 中的 Halo HTML 导出内容转换为 `src/content/blog/` 的 Markdown。脚本使用 `docs/legacy-post-metadata.json` 对齐旧文章的发布日期、别名、分类、标签、置顶状态和封面链接；代码块会保留为标准 Markdown 围栏代码块。

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
