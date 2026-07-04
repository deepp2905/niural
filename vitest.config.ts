import { defineConfig } from 'vitest/config';
import path from 'node:path';

// Separate from vite.config.ts on purpose: the unit tests are pure TS with no
// JSX, so we skip the React plugin here — which also avoids a type clash between
// vitest's bundled Vite and the top-level Vite in vite.config.ts.
export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
