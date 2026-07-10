export const homeConfig = {
  notices: [
    { text: '全新博客，Acorn，基于 Astro 打造。' },
    { text: '欢迎大家访问https://me.mysticstars.cn' },
    { text: 'CNTier 暑期计划筹备中。' },
  ],
  featured: {
    eyebrow: 'PINNED FIELD NOTE',
    fallbackTitle: '置顶文章',
    listTitle: 'PINNED NOTES',
    maxItems: 5,
  },
  pagination: {
    pageSize: 6,
  },
  sidebar: {
    authorEyebrow: 'ISLAND KEEPER',
    authorToggleLabel: '展开作者名片',
    authorCollapseLabel: '收起作者名片',
    authorLinkLabel: '查看完整介绍',
    statusTitle: '岛屿状态',
    statusLabels: {
      posts: '文章数量',
      words: '累计字数',
      days: '建站天数',
    },
    tagsTitle: '探索标签',
    tagsLinkLabel: '查看全部标签',
  },
} as const;

export const aboutConfig = {
  title: '关于 Mystic Stars',
  description: '一名来自成都的学生开发者，热爱编程与网站开发，专注于创造优雅的数字体验。',
  bento: {
    profile: {
      greeting: '你好！我是 Mystic Stars 👋',
      introduction:
        '一名来自成都的学生开发者，热爱编程与网站开发，专注于创造优雅的数字体验。熟悉 Python 等语言基本开发，正在努力学习更多前端知识。喜欢写自己的博客，在分享中创造价值。',
    },
    personality: {
      type: 'ENFJ',
      name: '主人公',
      features: ['充满魅力的领导者', '天生的教导者', '富有同理心', '值得信赖的理想主义者'],
    },
    minecraft: {
      id: 'Mystic_Stars',
      description: '热爱生存建造与小游戏！游玩 Hypixel, 和朋友们在 hjmc 中游玩生存。',
    },
    bilibili: {
      title: 'Bilibili',
      description: '分享有趣的编程内容和游戏视频。',
      url: 'https://space.bilibili.com/2007491365',
    },
    github: {
      title: 'GitHub',
      description: '参与开源，构建像 Halo 主题、GHS 这样的项目。',
      url: 'https://github.com/Mystic-stars',
    },
    acornTheme: {
      title: '关于 Acorn 主题',
      description:
        '本站运行在名为 Acorn 的自定义主题上。这是一个由 Astro 驱动、受到动森启发的可爱简约风格主题，旨在让内容展示回归纯粹与温馨。',
    },
    skills: {
      title: '技能栈',
      items: [
        { name: 'Python', desc: '熟悉Python编程', icon: 'python' },
        { name: 'Web', desc: 'Web开发', icon: 'web' },
        { name: 'Git', desc: '版本控制', icon: 'git' },
        { name: 'GitHub', desc: '代码托管', icon: 'github' },
        { name: 'Minecraft', desc: '游戏开发', icon: 'minecraft' },
        { name: 'Scratch', desc: '图形化编程', icon: 'scratch' },
      ],
    },
    covenant: {
      title: '十年之约',
      description: '独立博客是一场漫长的马拉松。用文字与代码记录十年的时光与成长。',
      durationYears: 10,
    },
  },
} as const;

/** Controls the in-article outline displayed in the article sidebar. */
export const articleTocConfig = {
  enabled: true,
  title: '文章目录',
  maxDepth: 3,
} as const;
