# 仓库脚本

`compat/patch-animal-island-ui.mjs` 由 `npm install` 的 `postinstall` 自动执行，负责组件库的 Astro/Node 预渲染兼容性。

`images/` 提供 `npm run images:localize`（预览待迁移项，加 `-- --write` 执行）和 `npm run images:check`（检查本地引用）。图片按文章与友链目录存储，失效地址会报错并保留原引用，直到补充可用原图。

构建使用的 Markdown 插件在 `src/plugins/`。移动兼容脚本或插件时同步更新 `package.json`、`astro.config.mjs` 和文档，并执行测试、类型检查与生产构建。

公开博客模板不包含主题导出工具。主题通用源码和发布流程在 Acorn 源码仓库维护；目录职责见根目录 README，测试约定见 [`tests/README.md`](../tests/README.md)。
