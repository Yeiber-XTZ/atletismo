import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: process.env.SITE_URL ?? 'http://localhost:8080',
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  security: {
    checkOrigin: false
  },
  integrations: [tailwind({ applyBaseStyles: false })]
});