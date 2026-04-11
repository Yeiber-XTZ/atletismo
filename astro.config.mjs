import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
  server: {
    port: 3000,
    host: true,
  },
});
