# Acorn

一个面向长期维护的 Astro 博客基础工程。默认采用静态输出、Content Collections、Markdown、RSS、Sitemap 和 Animal Island 风格的设计 token。

## 开始开发

```bash
npm install
cp .env.example .env
npm run dev
```

正式部署前，将 `.env` 中的 `SITE_URL` 改为站点正式域名。

## 常用命令

| 命令                       | 用途                      |
| -------------------------- | ------------------------- |
| `npm run dev`              | 启动本地开发服务器        |
| `npm run check`            | 检查 Astro 与 TypeScript  |
| `npm test`                 | 运行逻辑与 DOM 回归测试   |
| `npm run test:unit`        | 仅运行纯逻辑单元测试      |
| `npm run test:integration` | 仅运行 DOM 与文件系统测试 |
| `npm run build`            | 生成静态生产文件          |
| `npm run test:build`       | 检查分页、SEO 和构建产物  |
| `npm run preview`          | 预览生产构建              |
| `npm run format`           | 格式化项目文件            |
| `npm run format:check`     | 检查格式                  |

## 主要目录

```text
src/
  components/site/    页头、页脚、SEO 和统计接入
  components/blog/    首页文章流、列表、卡片和封面
  components/island/  按阅读、评论和侧栏分组的 Astro 组件
  components/react/   按功能分组的 React 交互组件
  components/animal/  组件库的共享 SSR 封装
  config/             可编辑站点配置
  content/            文章、友链与短动态资料
  layouts/            页面及文章布局
  lib/                查询与可复用逻辑
  pages/              文件系统路由
  plugins/            Markdown 构建插件
  styles/             全局样式与语义化 token
scripts/              兼容处理与主题导出工具
tests/                单元、集成和构建产物测试
template/overrides/   公开主题默认配置和示例内容
```

站点资料、导航、页面文案和服务设置集中在 `src/config/`；文章与友链的字段校验由 `src/content.config.ts` 管理。文章存放在 `src/content/blog/`，文件名决定 `/archives/<文件名>/` 的永久地址。测试分类见 [`tests/README.md`](tests/README.md)，维护工具见 [`scripts/README.md`](scripts/README.md)。

`docs/` 保留为本地维护资料，已由 Git 忽略，也不进入公开主题导出。

## 文章串联、动态与订阅

文章末尾提供上一篇/下一篇、相关文章和链接复制；设置位于 `src/config/reading.ts`。`relatedPosts` 可填写文章 ID 列表（文件名不含 `.md`，使用小写），按填写顺序优先推荐；其余名额按共同标签和分类补齐，最多展示 `relatedLimit` 篇。草稿、当前文章与重复条目不会被推荐。上一篇是时间更早的文章，下一篇是时间更新的文章。

`/notes/` 是独立分页的短动态，列表显示摘要和首张 Markdown 配图，点击“查看详情”在 Animal Island 弹窗中阅读完整 Markdown，不离开当前列表。弹窗支持 Esc/遮罩关闭、焦点恢复、代码复制与链接复制；图片打开原图，不叠加第二层弹窗。完整内容在构建阶段生成，客户端仅由一个小 React island 控制详情。每则内容存放在 `src/content/notes/`，不计入文章归档、全文搜索或文章统计。字段为必填的 `pubDate`、可选的 `title`（1–80 字）、`tags`（最多 6 项、每项 1–24 字）和 `draft`（源码默认 `false`，CMS 新建默认 `true`）。开发模式默认显示带标记的草稿，`notesConfig.includeDraftsInDevelopment` 可关闭；生产站与所有 RSS 始终排除草稿。标题留空时详情和 Feed 从正文提取标题。文件名决定稳定分享地址 `/notes/<ID>/`，直接访问或禁用 JavaScript 时使用完整独立页面。不要使用 `page`、`page/...` 或 `rss`；未来日期不会延迟发布。列表每页默认 10 条，首页默认展示最近 3 条摘要并支持同样的详情弹窗，配置位于 `src/config/notes.ts`。

`/subscribe/` 提供文章 `/rss.xml`、动态 `/notes/rss.xml`、分类 `/feeds/categories/<分类slug>.xml` 的 RSS 入口与地址复制。原有文章 Feed 地址不变，所有 Feed 都排除草稿；分类 Feed 按发布时间倒序。订阅文案位于 `src/config/subscriptions.ts`，绝对地址来自 `SITE_URL`。这不是邮件订阅服务，不收集邮箱。

Pages CMS 同步提供短动态、动态完整源码和三份新配置入口；动态复用文章图片媒体库。主题导出排除个人动态，公开示例来自 `template/overrides/`。

提交前依次运行 `npm test`、`npm run check`、`npm run build` 和 `npm run test:build`。CI 会执行同样的回归检查；主题导出额外验证危险路径、环境文件隔离和生成模板。

## Pages CMS

仓库根目录的 [`.pages.yml`](.pages.yml) 可管理文章、友链、图片和高级站点配置。正文 Editor 支持粘贴、拖入图片或通过 `/` → Image 上传，自动存入 `public/images/posts/uploads/` 并生成 Markdown 引用；历史文章图片按 `public/images/posts/<文章文件名>/` 分组，友链头像按 `public/images/friends/<友链文件名>/` 分组，站点级图片放在 `public/images/site/`。复杂 Markdown 可通过完整源码入口编辑。新文章默认草稿，封面和头像都使用本地图片字段。

连接 [Pages CMS](https://pagescms.org/) 后选择对应仓库与分支即可读取配置。写作时等待图片上传完成再保存，发布前关闭草稿开关；未来发布时间不会自动延迟发布。上传封面写入 `cover.upload`，清空后使用默认封面。

“检查内容与构建”按钮运行当前分支的检查。真实接入后应验证图片粘贴、拖入、上传、封面上传、友链头像上传、上传图片清空与复杂 Markdown 源码保存。站点设置仍使用 TypeScript 源码编辑器。迁移与检查命令为 `npm run images:localize -- --write` 和 `npm run images:check`。

## 友链提交

访问 `/friends/` 填写资料，再按提示通过 GitHub Fork 创建 Pull Request。每个站点在 `src/content/friends/` 中维护一份 Markdown 文件，文件名建议使用英文小写、数字与连字符：

```md
---
name: 小王的数字花园
url: https://example.com
description: 分享开发实验和阅读札记。
avatar: https://example.com/avatar.png
category: 技术
tags: [Astro, 写作]
---
```

名称为 1–40 字，简介为 1–80 字，标签最多 4 个、每项 1–16 字。分类支持技术、生活、创作、游戏、学习与其他；头像可使用 http/https 地址或 `/images/...` 站内路径。申请前请添加本站友链，每次 PR 只修改自己的资料。站长可在 CMS 维护 `featured` 优先展示和 `hidden` 隐藏状态。

## 技术基础

- Astro 7，静态输出
- 严格 TypeScript
- Astro Content Collections + Zod Schema
- Markdown
- RSS 与 Sitemap
- `animal-island-ui` 内置 Nunito / Noto Sans SC 字体资源
- `animal-island-ui` React 组件通过 Astro 服务端渲染，默认不发送 hydration JavaScript
- 项目级 `animal-island-ui-style` AI Skill

## Markdown 阅读体验

文章在构建时完成 Markdown 解析、Shiki 明暗主题高亮和 `animal-island-ui` 表格渲染；表格不需要客户端 React 重绘。中文标点相邻的强调（例如 `**¶**版权声明`、`**中文。**后续文字`）会正确解析，目录与搜索共享相同的语法规则。支持 GFM 表格、删除线、任务列表与脚注，保留转义字符及代码原始缩进。

代码工具栏在首屏 HTML 中生成，浏览器仅绑定复制与图片预览操作；代码和宽表格可独立横向滚动，正文长链接和行内代码会自动换行。本地正文图片在构建时读取尺寸，并默认延迟加载与异步解码以减少页面跳动；`public/` 图片仍按原样发布，建议上传前压缩。

`src/config/content.ts` 的 `articleMarkdownConfig` 控制代码折行、表格辅助说明和脚注文案，`articleReaderConfig` 控制复制与图片预览。正文排版集中在 `src/styles/prose.css`；完整渲染流程位于 `src/plugins/markdown.mjs`，回归测试覆盖语法、DOM 交互和生产文章。
