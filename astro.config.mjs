import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// Demo deploy lives on GitHub Pages at sohamdutta2001.github.io/MIME-Website,
// so the production build (GITHUB_PAGES=true in the Actions workflow) serves
// under the /MIME-Website base. When a real domain is bought, point DNS at it,
// drop the GITHUB_PAGES env (or serve from the non-Pages branch) and the site
// switches to the root-served artteastreecafe.com config automatically.
const isGitHubPages = process.env.GITHUB_PAGES === 'true';

export default defineConfig({
  site: isGitHubPages ? 'https://sohamdutta2001.github.io' : 'https://artteastreecafe.com',
  base: isGitHubPages ? '/MIME-Website' : undefined,
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
