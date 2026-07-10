// @ts-check

import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

const site = process.env.SITE_URL ?? 'https://example.com';

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'always',
  compressHTML: true,
  integrations: [sitemap(), react()],
  markdown: {
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
      // giscus loads the site-hosted theme from inside https://giscus.app.
      // Enable CORS during local Astro development to mirror the EdgeOne header.
      cors: true,
    },
    ssr: {
      noExternal: ['animal-island-ui'],
    },
  },
});
