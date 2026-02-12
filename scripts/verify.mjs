#!/usr/bin/env node

import { execSync } from 'node:child_process';
import { resolve } from 'node:path';

const root = resolve(new URL('..', import.meta.url).pathname);
const steps = [
  ['Deterministic install', 'pnpm run ci:install'],
  ['Doctor', 'pnpm doctor'],
  ['Typecheck', 'pnpm typecheck'],
  ['Lint', 'pnpm lint'],
  ['Test', 'pnpm test'],
  ['Build', 'pnpm build'],
  ['MCP smoke (local)', 'pnpm mcp:smoke'],
  ['Docker smoke', 'pnpm docker:smoke'],
  ['Docker size assert', 'pnpm docker:size:assert'],
  ['MCP smoke (docker)', 'pnpm mcp:smoke:docker'],
  ['Audit (moderate+)', 'pnpm audit --audit-level=moderate'],
];

for (const [label, command] of steps) {
  process.stdout.write(`- ${label}... `);
  execSync(command, { cwd: root, stdio: 'inherit' });
  process.stdout.write('OK\n');
}

console.log('verify completed: install → doctor → typecheck → lint → test → build → mcp-smoke(local) → docker-smoke → docker-size-assert → mcp-smoke(docker) → audit');
