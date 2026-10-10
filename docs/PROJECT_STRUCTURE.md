# 项目目录与维护约定

Acorn 按职责组织源码、工具、测试与文档。Astro 的路由、Content Collections 和全局配置仍使用框架约定的位置。

## 目录地图

```text
Acorn/
├── src/
│   ├── components/
│   │   ├── site/               页头、页脚、SEO head 和统计接入
│   │   ├── blog/               首页文章流、卡片、封面、日期和标签
│   │   ├── island/
│   │   │   ├── article/        目录、代码复制、图片预览和阅读量
│   │   │   ├── comments/       Twikoo 评论与管理入口
│   │   │   └── sidebar/        作者、时钟、站点状态和标签卡片
│   │   ├── react/
│   │   │   ├── search/         全局搜索交互
│   │   │   ├── markdown/       Markdown 表格增强
│   │   │   └── comments/       评论管理交互
│   │   └── animal/            组件库的共享 SSR 封装
│   ├── config/                可编辑站点资料、文案与行为配置
│   ├── content/
│   │   ├── blog/              Markdown 文章
│   │   └── friends/           每位站长一份友链资料
│   ├── layouts/               共享页面与文章布局
│   ├── lib/                   文章查询、搜索、统计、日期及计数逻辑
│   ├── pages/                 Astro 文件系统路由与静态端点
│   ├── plugins/               构建时 Markdown 等处理插件
│   ├── styles/                全局样式、语义 token 与第三方皮肤
│   ├── content.config.ts      内容 schema
│   └── env.d.ts               环境与浏览器全局类型
├── public/                    原样发布的 favicon 和图片
├── scripts/
│   ├── compat/                安装后的依赖兼容处理
│   └── theme/                 主题导出及其安全边界
├── tests/
│   ├── unit/                  纯逻辑单元测试
│   ├── integration/           DOM、文件系统等集成测试
│   ├── build/                 生产 HTML、分页、RSS 和 Sitemap 检查
│   └── helpers/               测试共用工具
├── docs/                      配置、开发与发布说明
├── template/overrides/        公开主题的默认配置与示例内容
├── .github/workflows/         CI 和主题发布流程
└── .agents/skills/            仓库内开发与视觉参考
```

根目录保留 `astro.config.mjs`、`package.json`、`package-lock.json`、`tsconfig.json`、`.pages.yml`、格式化配置及环境示例，便于框架、包管理器和 CMS 自动发现。

## 新文件放在哪里

| 文件职责           | 放置位置                               | 约定                                                      |
| ------------------ | -------------------------------------- | --------------------------------------------------------- |
| 新页面或静态端点   | `src/pages/`                           | 页面组合布局、组件和数据查询；文件名决定公开 URL。        |
| 共享页面骨架       | `src/layouts/`                         | 全局组件库样式只由共享布局导入一次。                      |
| 展示组件           | `src/components/` 的对应职责目录       | 优先 Astro；同一功能的组件放在一起。                      |
| React 交互         | `src/components/react/` 的对应功能目录 | 选择最窄的 `client:*`，不要让静态内容依赖整页 hydration。 |
| 查询或可复用逻辑   | `src/lib/`                             | 组件调用逻辑层；逻辑层不反向依赖页面、布局或 UI 组件。    |
| 可修改的文案与设置 | `src/config/`                          | 作为单一来源；schema 变化同步配置手册和 CMS。             |
| Markdown 构建插件  | `src/plugins/`                         | Astro 配置负责注册；不要把被构建调用的插件混入 CLI 工具。 |
| 仓库维护命令       | `scripts/` 的对应职责目录              | 通过 `package.json` 暴露命令，不在应用代码中调用 CLI。    |
| 自动化测试         | `tests/` 的对应测试类型目录            | 使用 `*.test.mjs`；每个文件围绕一个模块或一个明确场景。   |
| 测试助手           | `tests/helpers/`                       | 不使用 `.test.mjs` 后缀；临时文件清理要验证目标边界。     |

跨组件目录使用已有的 `@components/*`、`@config/*`、`@lib/*`、`@styles/*` 别名；同目录组件可使用短相对路径。由 Node 直接运行的测试和脚本使用明确的相对路径，不依赖 Astro 专用模块。

组件使用 PascalCase 文件名；逻辑模块、脚本和测试使用描述性的 kebab-case。当前 `src/lib/` 模块数量较少，直接按模块命名；等同一领域积累多个模块后再增加子目录，避免空目录与不必要的层级。

## 测试与验证

测试分类、命令和环境要求见 [`tests/README.md`](../tests/README.md)。通常依次运行：

```bash
npm test
npm run check
npm run build
npm run test:build
```

移动文件时同步检查源码 import、npm 命令、构建配置、CMS 路径、文档和主题导出排除项。改变通用目录或默认配置后，在源码仓库运行 `npm run verify:theme`。

## 源码仓库与公开模板

`template/overrides/` 只维护公开主题需要替换的站点默认值与示例内容；通用组件、逻辑和测试来自 `src/`、`tests/` 的主源码，避免复制维护两套实现。

`scripts/theme/`、主题导出安全测试及其临时目录助手只属于源码仓库，导出时排除。生成的博客仍保留兼容脚本、应用测试和构建测试。源码仓库中的 `docs/THEME_PUBLISHING.md` 记录主题发布边界；当前仓库的脚本职责见 [`scripts/README.md`](../scripts/README.md)。

`.theme-dist/`、`.astro/`、`dist/` 和 `node_modules/` 是本地生成目录，由命令维护；不存放需要长期保留的源码。环境文件与凭据由本地或部署平台管理。
