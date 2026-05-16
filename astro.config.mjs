import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

const isGitHubPages = process.env.GITHUB_PAGES === 'true';

export default defineConfig({
  site: isGitHubPages ? 'https://sohamdutta2001.github.io' : 'https://artteastreecafe.com',
  base: isGitHubPages ? '/MIME-Website' : undefined,
  output: 'static',
  integrations: [
    tailwind({ applyBaseStyles: false }),
    react(),
  ],
  image: {
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
  vite: {
    ssr: { noExternal: ['@fontsource/*'] },
  },
});
