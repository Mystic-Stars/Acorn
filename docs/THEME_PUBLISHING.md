# Acorn 主题发布

Acorn 使用“单一源码仓库 + 自动生成模板仓库”的方式发布：

- 源码与个人博客：`Mystic-Stars/Acorn`
- 公开主题模板：`Mystic-Stars/acorn-theme`
- 示例和默认配置：`template/overrides/`
- 导出入口与安全规则：`scripts/theme/`
- 本地导出目录：`.theme-dist/`（不会提交）

## 本地验证

```bash
npm run export:theme
npm run verify:theme
```

`verify:theme` 会重新生成模板、扫描个人标记、安装依赖、执行单元测试、`astro check`、生产构建及构建产物测试。

自定义输出只允许 `.theme-dist` 或它的子目录，例如：

```bash
npm run export:theme -- --output=.theme-dist/preview
```

输出路径不能包含符号链接或 Windows 目录联接。已有目标目录必须为空，或包含有效的 `.acorn-template.json` 生成标记；非生成目录会被拒绝，不会被清空。不要把需要保留的手动文件放进生成目录。

`.theme-dist` 已从开发服务器文件监听、TypeScript 检查和全仓格式化中排除，导出模板不会触发主站开发服务器重启；模板自身由 `verify:theme` 单独验证。

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

源码仓库专用的 `scripts/theme/`、`tests/integration/theme-export.test.mjs` 和 `tests/helpers/temp-workspace.mjs` 同样排除。公开主题保留 `scripts/compat/`、`src/plugins/`、应用单元/DOM 测试与构建产物测试。

所有目录下的 `.env`、`.env.*`（仅保留 `.env.example`）、`.npmrc` 和常见私钥/证书文件均排除。不要依赖个人标记扫描发现任意密钥；敏感文件必须保持在导出边界之外。
