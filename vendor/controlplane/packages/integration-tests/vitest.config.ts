import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    include: ['../../tests/integration/**/*.test.ts'],
    environment: 'node'
  },
  resolve: {
    alias: {
      '@controlplane/contract-kit': path.resolve(import.meta.dirname, '../contract-kit/src/index.ts'),
      '@controlplane/controlplane': path.resolve(import.meta.dirname, '../controlplane/src/index.ts')
    }
  }
});
