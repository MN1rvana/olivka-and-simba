import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const page = (file: string) => fileURLToPath(new URL(file, import.meta.url));

export default defineConfig({
  // GitHub Pages serves the site from https://<user>.github.io/olivka-and-simba/,
  // so every asset URL needs this prefix.
  base: '/olivka-and-simba/',
  plugins: [react()],
  build: {
    rolldownOptions: {
      // Two pages. GitHub Pages serves 404.html for any address that doesn't exist.
      input: { main: page('./index.html'), notFound: page('./404.html') },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    restoreMocks: true,
  },
});
