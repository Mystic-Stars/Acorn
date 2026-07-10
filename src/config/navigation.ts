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
  utility: [{ label: 'RSS', href: '/rss.xml' }] satisfies LinkItem[],
} as const;
