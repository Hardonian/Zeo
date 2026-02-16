#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: true,
    ...options,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

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

const deps = process.argv.slice(2);
let repoRoot;

try {
  repoRoot = getRepoRoot();
} catch (error) {
  console.error(`typecheck-target: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}

for (const dep of deps) {
  run('pnpm', ['--filter', dep, 'build'], { cwd: repoRoot });
}

run('tsc', ['--noEmit']);
