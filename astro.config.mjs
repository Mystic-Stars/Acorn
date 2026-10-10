// @ts-check

import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';

import react from '@astrojs/react';

import remarkInferCodeLanguage from './src/plugins/remark-infer-code-language.mjs';

const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');
const site = process.env.SITE_URL ?? env.SITE_URL ?? 'https://example.com';

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
    processor: unified({ remarkPlugins: [remarkInferCodeLanguage] }),
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark-dimmed',
      },
      defaultColor: false,
      wrap: true,
    },
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
