#!/usr/bin/env node

import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const cliEntrypoint = path.resolve(currentDir, '../dist/cli.js');

try {
  await import(pathToFileURL(cliEntrypoint).href);
} catch (error) {
  if (error && typeof error === 'object' && 'code' in error && error.code === 'ERR_MODULE_NOT_FOUND') {
    console.error(
      'ControlPlane CLI is not built yet. Run "pnpm --filter @controlplane/controlplane build" (or "pnpm run build" at the repo root) and retry.'
    );
    process.exit(1);
  }

  throw error;
}
