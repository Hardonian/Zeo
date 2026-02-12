#!/usr/bin/env node

import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(new URL('..', import.meta.url).pathname);
const categories = {
  toolchain: [],
  environment: [],
  config: [],
  quality: [],
};

function fail(category, message) {
  categories[category].push(message);
}

function runStep(category, label, command) {
  process.stdout.write(`- ${label}... `);
  try {
    execSync(command, { cwd: root, stdio: 'pipe' });
    process.stdout.write('OK\n');
    return true;
  } catch (error) {
    process.stdout.write('FAIL\n');
    const detail = (error.stderr || error.stdout || '').toString().split('\n').find(Boolean) || 'command failed';
    fail(category, `${label}: ${detail}`);
    return false;
  }
}

function readJson(path) {
  return JSON.parse(readFileSync(resolve(root, path), 'utf8'));
}

const packageJson = readJson('package.json');
const workspaceMode = existsSync(resolve(root, 'pnpm-workspace.yaml')) ? 'monorepo' : 'single-package';
console.log('== Zeo Doctor ==');
console.log(`Node: ${process.version}`);
console.log(`Package manager: ${packageJson.packageManager ?? 'unknown'}`);
console.log(`Repo mode: ${workspaceMode}`);

if (!existsSync(resolve(root, '.env.example'))) {
  fail('environment', '.env.example is missing');
}

const envExample = existsSync(resolve(root, '.env.example')) ? readFileSync(resolve(root, '.env.example'), 'utf8') : '';
const envKeys = envExample
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith('#') && line.includes('='))
  .map((line) => line.split('=')[0]);

const requiredByStage = {
  local: [],
  preview: ['GITHUB_WEBHOOK_SECRET'],
  production: ['GITHUB_WEBHOOK_SECRET'],
};

console.log('\nEnvironment summary (presence only):');
for (const [stage, required] of Object.entries(requiredByStage)) {
  const missing = required.filter((key) => !process.env[key] && !envKeys.includes(key));
  if (missing.length > 0) {
    fail('environment', `${stage}: missing ${missing.join(', ')}`);
    console.log(`- ${stage}: missing ${missing.join(', ')}`);
  } else {
    console.log(`- ${stage}: OK`);
  }
}

console.log('\nConfig checks:');
if (!existsSync(resolve(root, 'apps/web/next.config.mjs'))) {
  fail('config', 'apps/web/next.config.mjs is missing');
}
if (!existsSync(resolve(root, 'apps/web/src/app/error.tsx'))) {
  fail('config', 'apps/web/src/app/error.tsx is missing');
}
if (!existsSync(resolve(root, 'apps/web/src/app/not-found.tsx'))) {
  fail('config', 'apps/web/src/app/not-found.tsx is missing');
}

runStep('quality', 'Typecheck config loads', 'pnpm -r typecheck --help > /dev/null');
runStep('quality', 'Lint config loads', 'pnpm -r lint --help > /dev/null');

console.log('\nStaged checks:');
runStep('quality', 'lint', 'pnpm lint');
runStep('quality', 'typecheck', 'pnpm typecheck');
if (packageJson.scripts?.test) {
  runStep('quality', 'test', 'pnpm test');
}
runStep('quality', 'build', 'pnpm build');

console.log('\nRoot-cause summary:');
let failureCount = 0;
for (const [category, issues] of Object.entries(categories)) {
  if (issues.length === 0) {
    continue;
  }
  failureCount += issues.length;
  console.log(`- ${category}`);
  for (const issue of issues) {
    console.log(`  • ${issue}`);
  }
}

if (failureCount === 0) {
  console.log('Doctor passed.');
} else {
  console.log(`Doctor failed with ${failureCount} issue(s).`);
  process.exitCode = 1;
}
