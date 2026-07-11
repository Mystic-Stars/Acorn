export interface TwikooCommentsConfig {
  enabled: boolean;
  heading: string;
  description: string;
  envId: string;
  path: 'pathname';
  adminPath: string;
  lang: 'zh-CN';
  client: { version: string; src: string };
}

const twikooVersion = '1.7.14';

export const commentsConfig = {
  enabled: false,
  heading: '岛民留言簿',
  description: '欢迎留下你的想法。',
  envId: import.meta.env.PUBLIC_TWIKOO_ENV_ID ?? '',
  path: 'pathname',
  adminPath: '/manage-comments/',
  lang: 'zh-CN',
  client: {
    version: twikooVersion,
    src: `https://registry.npmmirror.com/twikoo/${twikooVersion}/files/dist/twikoo.all.min.js`,
  },
} as const satisfies TwikooCommentsConfig;
