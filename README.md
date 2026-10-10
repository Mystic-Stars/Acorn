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
  content/            博客文章与友链资料
  layouts/            页面及文章布局
  lib/                查询与可复用逻辑
  pages/              文件系统路由
  plugins/            Markdown 构建插件
  styles/             全局样式与语义化 token
scripts/              兼容处理与主题导出工具
tests/                单元、集成和构建产物测试
docs/                 配置、结构与发布说明
template/overrides/   公开主题默认配置和示例内容
```

配置入口及新增文章说明见 [`docs/CONFIGURATION.md`](docs/CONFIGURATION.md)。目录职责和新增文件规则见 [`docs/PROJECT_STRUCTURE.md`](docs/PROJECT_STRUCTURE.md)，测试分类见 [`tests/README.md`](tests/README.md)。

提交前依次运行 `npm test`、`npm run check`、`npm run build` 和 `npm run test:build`。CI 会执行同样的回归检查；主题导出额外验证危险路径、环境文件隔离和生成模板。

## Pages CMS

仓库根目录的 [`.pages.yml`](.pages.yml) 已配置为 Pages CMS 内容模型：可管理文章 frontmatter、Markdown 正文、封面上传和高级站点配置。将仓库连接到 [Pages CMS](https://pagescms.org/) 后即可使用；CMS 提交的图片会保存到 `public/images/posts/`。

## 技术基础

- Astro 7，静态输出
- 严格 TypeScript
- Astro Content Collections + Zod Schema
- Markdown
- RSS 与 Sitemap
- `animal-island-ui` 内置 Nunito / Noto Sans SC 字体资源
- `animal-island-ui` React 组件通过 Astro 服务端渲染，默认不发送 hydration JavaScript
- 项目级 `animal-island-ui-style` AI Skill
