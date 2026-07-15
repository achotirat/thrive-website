// astro/astro.config.mjs
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://new.thrivewellnessth.com',
  output: 'static',
  integrations: [
    mdx(),
    sitemap({
      // noindexed pages don't belong in the sitemap: /thank-you (conversion
      // confirmation) and /lp/* (ads landing pages, canonical to service pages)
      filter: (page) => !page.includes('/thank-you') && !page.includes('/lp/'),
    }),
  ],
});
