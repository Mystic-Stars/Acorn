export const homeConfig = {
  notices: [{ text: '欢迎来到 Acorn。' }, { text: '在这里记录灵感、技术与生活。' }],
  featured: { eyebrow: 'PINNED FIELD NOTE', fallbackTitle: '置顶文章', listTitle: 'PINNED NOTES', maxItems: 5 },
  pagination: { pageSize: 6 },
  sidebar: {
    authorEyebrow: 'ISLAND KEEPER', authorToggleLabel: '展开作者名片', authorCollapseLabel: '收起作者名片', authorLinkLabel: '查看完整介绍',
    statusTitle: '岛屿状态', statusLabels: { posts: '文章数量', words: '累计字数', days: '建站天数' },
    tagsTitle: '探索标签', tagsLinkLabel: '查看全部标签',
  },
} as const;

export const aboutConfig = {
  title: '关于我',
  description: '在这里介绍你自己。',
  bento: {
    profile: { greeting: '你好！我是 Acorn 的主人 👋', introduction: '在这里写下更完整的个人介绍。' },
    personality: { type: 'INFP', name: '调停者', features: ['热爱创造', '保持好奇', '乐于分享'] },
    minecraft: { id: 'YourMinecraftId', description: '写下你的游戏故事。' },
    bilibili: { title: 'Bilibili', description: '分享视频与生活。', url: 'https://www.bilibili.com' },
    github: { title: 'GitHub', description: '参与开源，持续创造。', url: 'https://github.com/Mystic-Stars' },
    acornTheme: { title: '关于 Acorn 主题', description: '一个由 Astro 驱动、受到动物岛屿启发的可爱简约博客主题。' },
    skills: { title: '技能栈', items: [{ name: 'Writing', desc: '持续写作', icon: 'web' }, { name: 'Git', desc: '版本控制', icon: 'git' }] },
    covenant: { title: '长期写作', description: '让写作成为一场漫长而温暖的旅程。', durationYears: 10 },
  },
} as const;

export const articleTocConfig = { enabled: true, title: '文章目录', maxDepth: 3 } as const;
export const articleReaderConfig = {
  codeCopy: { enabled: true, buttonLabel: '复制代码', copiedLabel: '已复制', failedLabel: '复制失败，请手动复制', copiedStatus: '代码已复制。', failedStatus: '代码复制失败，请手动复制。', languageFallback: '纯文本' },
  imagePreview: { enabled: true, openLabel: '放大查看图片', closeLabel: '关闭图片预览', dialogLabel: '图片预览', previousLabel: '查看上一张图片', nextLabel: '查看下一张图片', zoomInLabel: '放大图片', zoomOutLabel: '缩小图片', resetZoomLabel: '还原图片大小和位置' },
} as const;
