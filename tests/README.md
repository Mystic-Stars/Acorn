# 测试目录

所有自动化测试集中在 `tests/`，使用 Node 内置测试运行器；`tsx` 负责直接加载应用的 TypeScript 模块。

## 测试类型

| 目录           | 覆盖内容                                                | 环境要求                                     |
| -------------- | ------------------------------------------------------- | -------------------------------------------- |
| `unit/`        | 搜索、日期、字数、计数解析、CMS 空值与图片来源解析      | 已安装项目依赖；不读取生产构建。             |
| `integration/` | 异步计数；CMS 配置与 schema、路径和工作流；主题导出边界 | jsdom 或独立临时目录；不依赖真实第三方服务。 |
| `build/`       | 生产分页、分类链接、canonical、RSS、Sitemap 和日期配置  | 先运行 `npm run build`，然后读取 `dist/`。   |
| `helpers/`     | 临时工作区等共用测试工具                                | 由测试显式导入，不作为测试入口运行。         |

原有综合回归测试按模块拆分为 `search.test.mjs`、`dates.test.mjs`、`blog-stats.test.mjs`、`counters.test.mjs`。计数解析属于单元测试，DOM 观察与超时属于集成测试。

`content-fields.test.mjs` 验证 CMS 清空可选字段、图片地址校验与封面覆盖/恢复。`pages-cms.test.mjs` 解析真实 `.pages.yml`，通过 TypeScript AST 对照 `src/content.config.ts` 的字段，检查三组媒体映射、配置入口、发布默认值和可手动运行的 CI；`images.test.mjs` 检查内容引用、目录遍历和远程图片遗漏。这些测试也保留在导出的主题中。真实托管端上传与保存仍需按根目录 README 的 Pages CMS 说明验收。

## 命令

```bash
npm test                 # 所有单元和集成测试
npm run test:unit         # 仅纯逻辑
npm run test:integration  # 仅 DOM 和文件系统
npm run build
npm run test:build        # 检查生产输出
```

新增测试放在对应目录第一层，使用 `<模块或场景>.test.mjs` 命名；npm 命令会发现这些文件。不要将辅助工具命名为测试文件，也不要在默认 `npm test` 中读取旧的 `dist/`。

测试通过相对路径导入 `src/lib/` 或工具模块。涉及日期、延迟或失败的场景使用固定时间或模拟 DOM，避免依赖系统当前日期与真实网络。

文件系统测试使用 `helpers/temp-workspace.mjs` 创建隔离目录，结束时验证清理边界。不要对真实源码目录执行删除测试。

源码仓库包含主题导出安全测试。公开主题会排除这项源码工具测试；临时工作区助手保留给图片集成测试使用，其余应用和构建测试保持相同目录与命令。
