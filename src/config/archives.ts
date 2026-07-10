export const archiveConfig = {
  route: '/archives',
  recentPostCount: 3,
  includeDraftsInDevelopment: true,
  showPublishedDate: true,
  showUpdatedDate: true,
  showTags: true,
  emptyState: '还没有公开文章，先种下一颗橡果吧。',
  filters: {
    allCategoriesLabel: '全部文章',
    allYearsLabel: '全部年份',
    tagsLabel: '标签筛选',
    tagsDescription: '选择标签，可多选',
    noMatchesMessage: '这个分类与年份下暂时还没有文章。',
  },
} as const;
