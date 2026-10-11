import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import {
  httpUrl,
  imageLocation,
  optionalContentField,
  resolveCover,
  uploadedImageLocation,
} from './lib/content-fields';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1).max(120),
      description: z.string().min(1).max(300),
      pubDate: z.coerce.date(),
      updatedDate: optionalContentField(z.coerce.date()),
      cover: z
        .object({
          /** The visual cover always renders at 1000 × 500 (2:1). */
          tone: z.enum(['mint', 'sunset', 'ocean', 'plum', 'forest']).default('mint'),
          label: optionalContentField(z.string().min(1).max(32)),
          image: image().optional(),
          /**
           * Legacy cover source. New and migrated covers use `upload` so the CMS
           * can display the local image in its picker.
           */
          url: optionalContentField(imageLocation),
          /** Canonical public image path, managed by the Pages CMS image picker. */
          upload: optionalContentField(uploadedImageLocation),
          alt: optionalContentField(z.string()),
        })
        .transform(resolveCover),
      draft: z.boolean().default(false),
      featured: z.boolean().default(false),
      /** Page views carried over from the previous blog platform. */
      legacyViews: z.number().int().nonnegative().default(0),
      category: optionalContentField(z.string()),
      tags: z.array(z.string().min(1)).default([]),
      author: optionalContentField(z.string()),
    }),
});

/** One file per site keeps community submissions small, reviewable, and conflict-free. */
const friends = defineCollection({
  loader: glob({ base: './src/content/friends', pattern: '**/*.md' }),
  schema: z.object({
    name: z.string().min(1).max(40),
    url: httpUrl,
    description: z.string().min(1).max(80),
    avatar: imageLocation,
    category: z.enum(['技术', '生活', '创作', '游戏', '学习', '其他']).default('其他'),
    tags: z.array(z.string().min(1).max(16)).max(4).default([]),
    submittedAt: optionalContentField(z.coerce.date()),
    updatedAt: optionalContentField(z.coerce.date()),
    featured: z.boolean().default(false),
    hidden: z.boolean().default(false),
  }),
});

export const collections = { blog, friends };
