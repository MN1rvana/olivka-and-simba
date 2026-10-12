import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  // GitHub Pages serves the site from https://<user>.github.io/olivka-and-simba/,
  // so every asset URL needs this prefix.
  base: '/olivka-and-simba/',
  plugins: [react()],
});
