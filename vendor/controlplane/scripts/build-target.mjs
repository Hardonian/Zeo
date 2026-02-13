#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
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

const separatorIndex = process.argv.indexOf('--');
const deps = separatorIndex >= 0 ? process.argv.slice(2, separatorIndex) : process.argv.slice(2);
const commandArgs = separatorIndex >= 0 ? process.argv.slice(separatorIndex + 1) : [];

if (commandArgs.length === 0) {
  console.error('Usage: node vendor/controlplane/scripts/build-target.mjs <dep...> -- <build-command> [args...]');
  process.exit(1);
}

let repoRoot;

try {
  repoRoot = getRepoRoot();
} catch (error) {
  console.error(`build-target: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}

for (const dep of deps) {
  run('pnpm', ['--filter', dep, 'build'], { cwd: repoRoot });
}

const [command, ...args] = commandArgs;
run(command, args);
