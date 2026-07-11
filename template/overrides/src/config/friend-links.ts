export const friendLinksConfig = {
  route: '/friends/', title: '友链小岛', description: '把常来常往的独立站安放在这座小岛上。',
  repository: 'your-name/acorn-blog', defaultBranch: 'main', contentDirectory: 'src/content/friends',
  documentationUrl: 'https://github.com/your-name/acorn-blog/blob/main/docs/FRIEND_LINKS.md',
  contactEmail: 'hello@example.com',
  categories: ['技术', '生活', '创作', '游戏', '学习', '其他'],
  requirements: ['网站能够正常访问，且内容健康、长期更新。', '已在你的站点添加本站链接。', '请使用稳定的 HTTPS 头像地址。'],
  prChecklist: ['网站链接可公开访问。', '站点简介、头像和分类填写正确。', '我的网站已添加本站友链。'],
  emptyState: { title: '第一颗橡果还在等你', description: '这里会收集认真写作、持续创造的朋友。' },
} as const;
export type FriendLinkCategory = (typeof friendLinksConfig.categories)[number];
