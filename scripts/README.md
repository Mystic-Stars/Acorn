# 仓库脚本

`scripts/` 存放安装或维护命令；构建时使用的 Markdown 插件在 `src/plugins/`。

| 位置                                | 职责                                               | 入口                                              |
| ----------------------------------- | -------------------------------------------------- | ------------------------------------------------- |
| `compat/patch-animal-island-ui.mjs` | 处理组件库的 Astro/Node 预渲染兼容性               | `npm install` 的 `postinstall` 自动执行。         |
| `theme/export.mjs`                  | 复制源码、应用模板覆盖、扫描个人标记并验证公开主题 | `npm run export:theme` / `npm run verify:theme`。 |
| `theme/safety.mjs`                  | 验证导出目标、生成标记和私密文件排除规则           | 由导出入口及对应集成测试导入，不独立执行。        |

`theme/` 只存在于主题源码仓库，公开博客模板保留 `compat/`。主题发布由 [`.github/workflows/publish-theme.yml`](../.github/workflows/publish-theme.yml) 管理，可手动运行或通过推送 `v*` 标签触发；发布前运行 `npm run verify:theme`，部署密钥通过仓库 secret `ACORN_THEME_DEPLOY_KEY` 提供。`docs/` 属于本地维护资料，不进入导出结果。

新增维护脚本时按职责分组，通过 `package.json` 提供稳定入口。脚本移动后，应检查仓库根目录解析、npm 生命周期命令、主题导出排除项和测试 import。

涉及删除或替换的脚本必须先验证解析后的绝对目标路径。兼容脚本操作当前项目的依赖目录；主题导出入口从自己的文件位置定位仓库根目录，输出只允许 `.theme-dist/` 范围内的生成目录。
