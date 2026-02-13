#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

function getRepoRoot() {
  const git = spawnSync('git', ['rev-parse', '--show-toplevel'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  if (git.status !== 0) {
    const message = git.stderr?.trim() || 'Unable to resolve git repository root.';
    throw new Error(message);
  }

  return git.stdout.trim();
}

const target = process.argv[2];

if (!target) {
  console.error('Usage: node vendor/controlplane/scripts/lint-target.mjs <path-to-lint>');
  process.exit(1);
}

let repoRoot;

try {
  repoRoot = getRepoRoot();
} catch (error) {
  console.error(`lint-target: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}

const lint = spawnSync(
  'pnpm',
  ['-C', repoRoot, 'exec', 'eslint', '--max-warnings=0', target],
  { stdio: 'inherit' }
);

if (lint.status !== 0) {
  process.exit(lint.status ?? 1);
}
