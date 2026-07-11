# Acorn 主题发布

Acorn 使用“单一源码仓库 + 自动生成模板仓库”的方式发布：

- 源码与个人博客：`Mystic-Stars/Acorn`
- 公开主题模板：`Mystic-Stars/acorn-theme`
- 示例和默认配置：`template/overrides/`
- 本地导出目录：`.theme-dist/`（不会提交）

## 本地验证

```bash
npm run export:theme
npm run verify:theme
```

`verify:theme` 会重新生成模板、扫描个人标记、安装依赖、执行 `astro check` 并完成生产构建。

## 自动发布

`.github/workflows/publish-theme.yml` 支持从 Actions 页面手动运行，也会在推送 `v*` 标签时运行：

```bash
git tag v0.1.0
git push origin v0.1.0
```

工作流通过 SSH 使用 `ACORN_THEME_DEPLOY_KEY`，将生成结果更新到模板仓库的 `main` 分支。该部署密钥只拥有模板仓库的写权限。

模板仓库是生成产物，不应直接编辑。通用功能、Bug 修复和默认示例都应先修改源码仓库。

## 导出边界

个人文章、友链、站点配置、评论端点、统计 ID、历史迁移资料和文章图片不会进入模板仓库。对应的公开默认内容来自 `template/overrides/`。
