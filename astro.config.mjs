// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), mdx()],
  output: 'static',
  adapter: vercel(),
  // CI must never read a developer's .env files.
  vite: process.env.ASTRO_CI === '1' ? { envDir: false } : {},
});
