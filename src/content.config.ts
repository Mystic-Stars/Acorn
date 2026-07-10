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

export const collections = { blog };
