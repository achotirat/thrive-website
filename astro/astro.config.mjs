// astro/astro.config.mjs
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://new.thrivewellnessth.com',
  output: 'static',
  integrations: [mdx(), sitemap()],
});
