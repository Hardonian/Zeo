#!/usr/bin/env node

import { existsSync, readdirSync, statSync } from 'node:fs';
import { resolve, relative } from 'node:path';

const appChunksDir = resolve(process.cwd(), 'apps/web/.next/static/chunks/app');
if (!existsSync(appChunksDir)) {
  console.log('[perf] skipping: apps/web build artifacts missing. Run `pnpm -C apps/web build` first.');
  process.exit(0);
}

function walk(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
}

const files = walk(appChunksDir)
  .filter((file) => file.endsWith('.js'))
  .map((file) => ({ full: file, rel: relative(appChunksDir, file).replace(/\\/g, '/') }));

const budgets = new Map([
  ['/', 220 * 1024],
  ['/product', 250 * 1024],
  ['/docs', 250 * 1024],
  ['/pricing', 250 * 1024],
]);

function routePattern(route) {
  if (route === '/') return /^page-.*\.js$/;
  return new RegExp(`^${route.slice(1).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/page-.*\\.js$`);
}

const failures = [];
for (const [route, limit] of budgets) {
  const pattern = routePattern(route);
  const matching = files.filter((file) => pattern.test(file.rel));
  const total = matching.reduce((sum, file) => sum + statSync(file.full).size, 0);

  if (matching.length === 0) {
    failures.push(`${route}: unable to locate route chunk(s) under .next/static/chunks/app`);
    continue;
  }

  if (total > limit) {
    failures.push(`${route}: ${(total / 1024).toFixed(1)}KB exceeds ${(limit / 1024).toFixed(0)}KB`);
  }

  if (matching.some((file) => /trace|viewer|panel/i.test(file.rel))) {
    failures.push(`${route}: heavy trace/viewer/panel chunk appears eagerly loaded (${matching.map((f) => f.rel).join(', ')})`);
  }
}

if (failures.length) {
  console.error('Performance budget check failed:');
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log(`Performance budgets passed for ${budgets.size} marketing routes.`);
