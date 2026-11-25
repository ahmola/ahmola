// @ts-check
import { defineConfig } from 'astro/config';
import { readFileSync } from 'node:fs';
import rewriteLinks from './src/plugins/rewrite-links.mjs';

const sources = JSON.parse(readFileSync(new URL('./sources.json', import.meta.url), 'utf8'));

const base = '/blog';

export default defineConfig({
  site: 'https://ahmola.github.io',
  // ahmola.github.io/blog 에 배포되므로 모든 경로 앞에 /blog 가 붙습니다.
  base,
  markdown: {
    remarkPlugins: [
      [rewriteLinks, { base, notesDir: './notes', sources }],
    ],
    shikiConfig: { theme: 'solarized-light', wrap: true },
  },
});
