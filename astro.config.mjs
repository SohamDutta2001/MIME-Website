import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// Served from the custom domain artteastreecafe.com (CNAME in /public), so the
// site lives at the root — no base path. `site` must be the real public origin
// for canonical URLs, the sitemap, and Open Graph / structured-data to be
// correct, which is what search engines index.
export default defineConfig({
  site: 'https://artteastreecafe.com',
  output: 'static',
  // Pages build as directories (/events/index.html); canonicalise to the
  // trailing-slash form so links + the ViewTransitions router agree with how
  // GitHub Pages serves them.
  trailingSlash: 'always',
  integrations: [
    tailwind({ applyBaseStyles: false }),
    react(),
    sitemap(),
  ],
  image: {
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
  vite: {
    ssr: { noExternal: ['@fontsource/*'] },
  },
});
