import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://artteastreecafe.com',
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
