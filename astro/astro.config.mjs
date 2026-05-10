// astro/astro.config.mjs
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://new.thrivewellnessth.com',
  output: 'static',
  integrations: [mdx()],
});
