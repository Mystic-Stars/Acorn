import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      cover: z.object({
        /** The visual cover always renders at 1000 × 500 (2:1). */
        tone: z.enum(['mint', 'sunset', 'ocean', 'plum', 'forest']).default('mint'),
        label: z.string().min(1).max(32).optional(),
        image: image().optional(),
        /**
         * A remote image URL or a public path uploaded through Pages CMS.
         * The latter is written as `/images/...` and is served from `public/`.
         */
        url: z.union([z.url(), z.string().startsWith('/')]).optional(),
        alt: z.string().optional(),
      }),
      draft: z.boolean().default(false),
      featured: z.boolean().default(false),
      category: z.string().optional(),
      tags: z.array(z.string()).default([]),
      author: z.string().optional(),
    }),
});

const httpUrl = z.url().refine(
  (value) => {
    try {
      const protocol = new URL(value).protocol;
      return protocol === 'http:' || protocol === 'https:';
    } catch {
      return false;
    }
  },
  { message: '请使用 http 或 https 链接。' },
);

/** One file per site keeps community submissions small, reviewable, and conflict-free. */
const friends = defineCollection({
  loader: glob({ base: './src/content/friends', pattern: '**/*.md' }),
  schema: z.object({
    name: z.string().min(1).max(40),
    url: httpUrl,
    description: z.string().min(1).max(40),
    avatar: z.union([httpUrl, z.string().startsWith('/')]),
    category: z.enum(['技术', '生活', '创作', '游戏', '学习', '其他']).default('其他'),
    tags: z.array(z.string().min(1).max(16)).max(4).default([]),
    submittedAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    featured: z.boolean().default(false),
    hidden: z.boolean().default(false),
  }),
});

export const collections = { blog, friends };
