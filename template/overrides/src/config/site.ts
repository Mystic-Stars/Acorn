import type { SocialLink } from './types';

export const siteConfig = {
  name: 'Acorn Blog',
  slogan: 'Plant ideas, grow stories',
  title: 'Acorn Blog',
  description: '一个由 Astro 驱动的温暖博客。',
  language: 'zh-CN',
  locale: 'zh-CN',
  branding: { logoSrc: '/favicon.svg', avatarSrc: '/favicon.svg' },
  establishedAt: '2026-01-01',
  author: {
    name: 'Your Name',
    role: '独立创作者',
    bio: '在这里写下你的个人介绍。',
    location: '生活在地球',
    motto: '种下一颗橡果，记录一段故事。',
    focus: ['Writing', 'Coding', 'Life'],
  },
  date: {
    locale: 'zh-CN',
    options: { year: 'numeric', month: 'long', day: 'numeric' } satisfies Intl.DateTimeFormatOptions,
  },
  footer: {
    copyrightStartYear: 2026,
    message: 'Plant ideas, grow stories',
    themeCredit: '基于 Acorn 主题',
    uiCredit: { label: '使用 animal-island-ui', href: 'https://github.com/guokaigdg/animal-island-ui' },
    icp: '',
  },
  socialLinks: [
    {
      label: 'GitHub',
      href: 'https://github.com/your-name',
      external: true,
      ariaLabel: '访问 GitHub 主页',
      icon: 'github',
    },
  ] satisfies SocialLink[],
} as const;
