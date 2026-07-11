export interface TwikooCommentsConfig {
  enabled: boolean;
  heading: string;
  description: string;
  /**
   * Public Netlify Function endpoint, for example:
   * https://your-twikoo.netlify.app/.netlify/functions/twikoo
   *
   * The endpoint is public by design. Database and SMTP credentials stay in
   * Netlify and Twikoo's admin configuration and must never be added here.
   */
  envId: string;
  path: 'pathname';
  lang: 'zh-CN';
  client: {
    version: string;
    src: string;
  };
}

const twikooVersion = '1.7.14';

export const commentsConfig = {
  enabled: true,
  heading: '岛民留言簿',
  description: '留下昵称和邮箱，就能把想说的话带到岛上。',
  envId:
    import.meta.env.PUBLIC_TWIKOO_ENV_ID ??
    'https://acorn-twikoo.netlify.app/.netlify/functions/twikoo',
  path: 'pathname',
  lang: 'zh-CN',
  client: {
    version: twikooVersion,
    // npm mirror is Twikoo's documented mainland-friendly CDN mirror.
    // The full bundle supplies Twikoo/Element's structural CSS (popovers,
    // dialogs, emoji picker and upload controls). Our isolated stylesheet
    // below it only changes the visual skin.
    src: `https://registry.npmmirror.com/twikoo/${twikooVersion}/files/dist/twikoo.all.min.js`,
  },
} as const satisfies TwikooCommentsConfig;
