import type { SocialLink } from './types';

export const siteConfig = {
  name: 'Mystic Stars',
  slogan: 'Discover Infinity',
  title: 'Mystic Stars · Discover Infinity',
  description: '探索无限可能，记录思考、创造与生活。',
  language: 'zh-CN',
  locale: 'zh-CN',
  branding: {
    logoSrc: '/favicon.svg',
    avatarSrc: '/favicon.svg',
  },
  /** Used by the home-page island status widget. Format: YYYY-MM-DD. */
  establishedAt: '2024-03-09',
  author: {
    name: 'Mystic Stars',
    role: '独立开发者 · 懒癌晚期患者',
    bio: '人生得意须尽欢，莫使金樽空对月',
    location: '生活在成都',
    motto: '假如我再也见不到你，祝你早安，午安，晚安！',
    focus: ['Minecraft', 'Coding', 'Studying'],
  },
  date: {
    locale: 'zh-CN',
    options: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    } satisfies Intl.DateTimeFormatOptions,
  },
  footer: {
    copyrightStartYear: 2024,
    message: 'Discover Infinity',
    themeCredit: '基于 Acorn 主题',
    uiCredit: {
      label: '使用 animal-island-ui',
      href: 'https://github.com/guokaigdg/animal-island-ui',
    },
  },
  socialLinks: [
    {
      label: 'GitHub',
      href: 'https://github.com/',
      external: true,
      ariaLabel: '访问 GitHub 主页',
    },
  ] satisfies SocialLink[],
} as const;
