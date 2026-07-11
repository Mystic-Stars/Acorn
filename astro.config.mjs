// @ts-check

import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import remarkInferCodeLanguage from './scripts/remark-infer-code-language.mjs';

const site = process.env.SITE_URL ?? 'https://example.com';

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'always',
  compressHTML: true,
  prefetch: true,
  integrations: [sitemap(), react()],
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
      // Keep local development permissive for external development tools.
      cors: true,
    },
    ssr: {
      noExternal: ['animal-island-ui'],
    },
  },
});
