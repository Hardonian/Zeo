import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['**/*.test.ts', '**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      thresholds: {
        lines: 90,
        functions: 90,
        statements: 90,
        branches: 90,
      },
    },
  },
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, './src') },
      {
        find: '@zeo/core',
        replacement: path.resolve(__dirname, './src/test/shims/zeo-core.ts'),
      },
      {
        find: /^@zeo\/([^/]+)$/,
        replacement: path.resolve(__dirname, '../../packages/$1/src/index.ts'),
      },
    ],
  },
});
