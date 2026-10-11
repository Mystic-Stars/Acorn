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
template/overrides/   公开主题默认配置和示例内容
```

站点资料、导航、页面文案和服务设置集中在 `src/config/`；文章与友链的字段校验由 `src/content.config.ts` 管理。文章存放在 `src/content/blog/`，文件名决定 `/archives/<文件名>/` 的永久地址。测试分类见 [`tests/README.md`](tests/README.md)，维护工具见 [`scripts/README.md`](scripts/README.md)。

`docs/` 保留为本地维护资料，已由 Git 忽略，也不进入公开主题导出。

提交前依次运行 `npm test`、`npm run check`、`npm run build` 和 `npm run test:build`。CI 会执行同样的回归检查；主题导出额外验证危险路径、环境文件隔离和生成模板。

## Pages CMS

仓库根目录的 [`.pages.yml`](.pages.yml) 可管理文章、友链、图片和高级站点配置。正文 Editor 支持粘贴、拖入图片或通过 `/` → Image 上传，自动存入 `public/images/posts/` 并生成 Markdown 引用；复杂 Markdown 可通过完整源码入口编辑。新文章默认草稿，上传封面与已有远程地址分开维护。

连接 [Pages CMS](https://pagescms.org/) 后选择对应仓库与分支即可读取配置。写作时等待图片上传完成再保存，发布前关闭草稿开关；未来发布时间不会自动延迟发布。上传封面写入 `cover.upload`，清空后恢复原有 `cover.image` / `cover.url` 或默认封面。

“检查内容与构建”按钮运行当前分支的检查。真实接入后应验证图片粘贴、拖入、上传、远程封面保存、上传封面清空与复杂 Markdown 源码保存。站点设置仍使用 TypeScript 源码编辑器。

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
