import type { LinkItem } from './types';

export const navigationConfig = {
  header: {
    showBrand: true,
  },
  primary: [
    { label: '首页', href: '/' },
    { label: '文章', href: '/archives/' },
    { label: '关于', href: '/about/' },
  ] satisfies LinkItem[],
  search: {
    enabled: true,
    label: '搜索',
    indexUrl: '/search-index.json',
    placeholder: '搜索标题、摘要、标签或正文…',
    emptyHint: '输入关键词，查找岛上的文章。',
    loadingHint: '正在整理岛屿文章…',
    loadError: '搜索索引加载失败，请稍后重试。',
    noResults: '没有找到匹配的文章，换个关键词试试。',
    resultLimit: 8,
  },
  utility: [{ label: 'RSS', href: '/rss.xml' }] satisfies LinkItem[],
} as const;
