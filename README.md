# Acorn

一个面向长期维护的 Astro 博客基础工程。默认采用静态输出、Content Collections、Markdown/MDX、RSS、Sitemap 和 Animal Island 风格的设计 token。

## 开始开发

```bash
npm install
cp .env.example .env
npm run dev
```

正式部署前，将 `.env` 中的 `SITE_URL` 改为站点正式域名。

## 常用命令

| 命令                   | 用途                     |
| ---------------------- | ------------------------ |
| `npm run dev`          | 启动本地开发服务器       |
| `npm run check`        | 检查 Astro 与 TypeScript |
| `npm run build`        | 生成静态生产文件         |
| `npm run preview`      | 预览生产构建             |
| `npm run format`       | 格式化项目文件           |
| `npm run format:check` | 检查格式                 |

## 主要目录

```text
src/
  components/       可复用 Astro 组件
  config/           站点、导航、归档、文案和主题配置
  content/blog/     Markdown 与 MDX 文章
  layouts/          页面及文章布局
  lib/              文章查询、排序和标签逻辑
  pages/            文件系统路由
  styles/           全局样式与语义化 token
```

配置入口及新增文章说明见 [`docs/CONFIGURATION.md`](docs/CONFIGURATION.md)。

## Pages CMS

仓库根目录的 [`.pages.yml`](.pages.yml) 已配置为 Pages CMS 内容模型：可管理文章 frontmatter、Markdown/MDX 正文、封面上传和高级站点配置。将仓库连接到 [Pages CMS](https://pagescms.org/) 后即可使用；CMS 提交的图片会保存到 `public/images/posts/`。

## 技术基础

- Astro 7，静态输出
- 严格 TypeScript
- Astro Content Collections + Zod Schema
- Markdown / MDX
- RSS 与 Sitemap
- `animal-island-ui` 内置 Nunito / Noto Sans SC 字体资源
- `animal-island-ui` React 组件通过 Astro 服务端渲染，默认不发送 hydration JavaScript
- 项目级 `animal-island-ui-style` AI Skill
