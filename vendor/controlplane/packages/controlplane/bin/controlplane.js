#!/usr/bin/env node

import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cliPath = path.join(packageRoot, 'dist', 'cli.js');

if (!existsSync(cliPath)) {
  process.stderr.write(
    [
      'controlplane CLI build output is not available yet.',
      'Run "pnpm --filter @controlplane/controlplane build" (or "pnpm -r build") and retry.',
    ].join('\n') + '\n',
  );
  process.exit(1);
}

await import(pathToFileURL(cliPath).href);
