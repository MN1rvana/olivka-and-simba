import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// Tests run through Vitest, not Next.js. They only need JSX and the DOM.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    restoreMocks: true,
    env: { NEXT_PUBLIC_BASE_PATH: '' },
  },
});
