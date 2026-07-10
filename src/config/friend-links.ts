export const friendLinksConfig = {
  route: '/friends/',
  title: '友链小岛',
  description: '把常来常往的独立站、小作品和有趣角落，安放在这座小岛上。',
  repository: 'Mystic-Stars/Acorn',
  defaultBranch: 'main',
  contentDirectory: 'src/content/friends',
  documentationUrl: 'https://github.com/Mystic-Stars/Acorn/blob/main/docs/FRIEND_LINKS.md',
  categories: ['技术', '生活', '创作', '游戏', '学习', '其他'],
  requirements: [
    '网站能够正常访问，且内容健康、长期更新。',
    '已在你的站点添加本站链接；纯导航页或临时页面请暂缓申请。',
    '请使用清晰、稳定的 HTTPS 头像地址，避免使用会过期的临时图床链接。',
    '每次申请只新增或更新自己的一个文件，合并后会在下一次部署时自动展示。',
  ],
  prChecklist: [
    '网站链接可公开访问，且没有跳转到不相关页面。',
    '站点简介、头像和分类已填写正确。',
    '我的网站已添加本站友链。',
  ],
  emptyState: {
    title: '第一颗橡果还在等你',
    description: '这里会收集认真写作、持续创造的朋友。来留下你的站点吧。',
  },
} as const;

export type FriendLinkCategory = (typeof friendLinksConfig.categories)[number];
