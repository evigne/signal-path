// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import remarkDirective from 'remark-directive';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { unified } from '@astrojs/markdown-remark';
import remarkClaims from './src/lib/remark-claims.mjs';
import rehypeGlossary from './src/lib/rehype-glossary.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://signal-path.example',
  trailingSlash: 'ignore',
  integrations: [react()],
  markdown: {
    processor: unified({
      remarkPlugins: [remarkDirective, remarkClaims, remarkMath],
      rehypePlugins: [rehypeKatex, rehypeGlossary],
    }),
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
