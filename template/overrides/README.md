# Acorn

Acorn 是一个由 Astro 驱动、采用 Animal Island 视觉语言的博客主题。

> 此仓库由 [Acorn 源码仓库](https://github.com/Mystic-Stars/Acorn) 自动生成，请不要直接提交主题源码修改。

## 快速开始

```bash
npm install
cp .env.example .env
npm run dev
```

然后编辑：

- `src/config/`：站点资料、导航、页面文案、评论与主题设置
- `src/content/blog/`：Markdown 文章
- `src/content/friends/`：友链资料
- `public/`：头像、按文章分组的图片和其他静态资源

## 检查和构建

```bash
npm run check
npm test
npm run build
npm run test:build
npm run preview
```

配置与写作说明随主题提供在 `src/content/blog/` 的示例文章中，运行站点后可从首页阅读。测试分类与单独运行命令见 [`tests/README.md`](tests/README.md)，维护工具见 [`scripts/README.md`](scripts/README.md)。

## Pages CMS

将自己的仓库接入 Pages CMS，根目录 `.pages.yml` 会提供文章、友链、分用途图片媒体库和高级配置入口。正文 Editor 可粘贴、拖入图片或通过 `/` → Image 上传到 `public/images/posts/uploads/`，自动生成 Markdown 图片引用；新文章默认草稿。复杂 Markdown 使用“文章完整源码”入口。

写作时等待图片上传完成再保存，发布前关闭草稿开关。上传封面写入 `cover.upload`，友链头像使用 `friends` 媒体库；未来发布时间不会自动延迟发布。站点设置仍使用 TypeScript 源码编辑器，“检查内容与构建”按钮运行当前分支的检查。首次接入请验证正文图片上传、封面上传、友链头像上传、清空字段及复杂 Markdown 源码保存。

## 友链提交

先在 `src/config/friend-links.ts` 设置自己的仓库、默认分支、联系邮箱和提交说明地址。访客可在 `/friends/` 填写资料，通过 GitHub Fork 创建 Pull Request；每个站点在 `src/content/friends/` 下维护一份 Markdown 文件：

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

## 获取更新

主题发布仓库适合通过 GitHub 的 **Use this template** 创建新博客。主题本身的改进和问题请提交到 [Mystic-Stars/Acorn](https://github.com/Mystic-Stars/Acorn)。
