// @ts-check

import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';

import react from '@astrojs/react';

import { articleMarkdownConfig, articleReaderConfig } from './src/config/content.ts';
import { createArticleMarkdownOptions } from './src/plugins/markdown.mjs';

const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');
const site = process.env.SITE_URL ?? env.SITE_URL ?? 'https://example.com';
const { shikiConfig, ...processorOptions } = createArticleMarkdownOptions(
  articleReaderConfig,
  articleMarkdownConfig,
);

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'always',
  compressHTML: true,
  prefetch: true,
  integrations: [
    sitemap({
      filter: (page) =>
        !['/manage-comments/', '/404/', '/404.html'].includes(new URL(page).pathname),
    }),
    react(),
  ],
  markdown: {
    processor: unified(processorOptions),
    shikiConfig,
  },
  vite: {
    server: {
      watch: {
        ignored: ['**/.theme-dist/**'],
      },
      // Keep local development permissive for external development tools.
      cors: true,
    },
    ssr: {
      noExternal: ['animal-island-ui'],
    },
  },
});
