# 友链提交说明

友链页面的数据来自 `src/content/friends/`。每一位站长一个 Markdown 文件，因此提交不会与其他申请产生配置冲突；Pull Request 被合并并部署后，站点会自动读取并展示该资料。

最省事的方式是访问 `/friends/`，填写表单后点击 **“前往 GitHub 创建 PR”**。GitHub 会在你的账号下创建 Fork（如尚未 Fork），并预填一份新文件。确认提交后按页面提示创建 Pull Request 即可。

## 手动提交

1. Fork 本仓库并创建分支。
2. 在 `src/content/friends/` 新建一个文件。文件名仅使用英文小写、数字和连字符，例如 `little-garden.md`。
3. 填写以下 frontmatter；每次 PR 只新增或更新自己的文件。
4. 提交并发起 Pull Request。

```md
---
name: 小王的数字花园
url: https://example.com
description: 分享前端实验、阅读札记与慢慢生长的个人项目。
avatar: https://example.com/avatar.png
category: 技术
tags:
  - Astro
  - 写作
submittedAt: 2026-07-10
---
```

## 字段规则

| 字段 | 必填 | 规则 |
| --- | --- | --- |
| `name` | 是 | 站点名称，1–40 字。 |
| `url` | 是 | 可公开访问的 `http` 或 `https` 地址。 |
| `description` | 是 | 1–40 字的站点简介。 |
| `avatar` | 是 | `http` / `https` 头像地址，或站内 `/images/...` 公共路径。建议使用稳定的 HTTPS 地址。 |
| `category` | 是 | 仅可使用：`技术`、`生活`、`创作`、`游戏`、`学习`、`其他`。 |
| `tags` | 否 | 最多 4 个标签，每项最多 16 字。 |
| `submittedAt` | 否 | 提交日期，格式 `YYYY-MM-DD`。 |
| `updatedAt` | 否 | 最近更新日期，格式 `YYYY-MM-DD`。 |
| `featured` | 否 | `true` 时会排在名册前列；仅由站长维护。 |
| `hidden` | 否 | `true` 时不在友链页展示；仅用于仓库内置模板。 |

## 合并前检查

- 站点链接可正常打开，且内容适合公开展示。
- 头像、简介和分类与站点一致。
- 申请站点已经添加本站友链。
- PR 只修改自己的资料文件，不包含构建产物、依赖目录或无关改动。

仓库 CI 会在 Pull Request 中运行 `npm run check` 与 `npm run build`，通过后站长只需审核内容并合并。
