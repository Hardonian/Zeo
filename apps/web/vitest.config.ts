import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['**/*.test.ts', '**/*.test.tsx'],
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
