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
- `public/`：头像、图片和其他静态资源

## 检查和构建

```bash
npm run check
npm test
npm run build
npm run test:build
npm run preview
```

完整配置说明见 [`docs/CONFIGURATION.md`](docs/CONFIGURATION.md)。

目录职责与新增文件规则见 [`docs/PROJECT_STRUCTURE.md`](docs/PROJECT_STRUCTURE.md)，测试分类与单独运行命令见 [`tests/README.md`](tests/README.md)。

## 获取更新

主题发布仓库适合通过 GitHub 的 **Use this template** 创建新博客。主题本身的改进和问题请提交到 [Mystic-Stars/Acorn](https://github.com/Mystic-Stars/Acorn)。
