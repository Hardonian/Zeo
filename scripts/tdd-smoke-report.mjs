#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

const run = spawnSync('pnpm', ['-C', 'apps/web', 'test', '--', '--reporter=json', '--outputFile=../../docs/generated/tdd-smoke-vitest.json', 'src/app/public-link-crawl.test.ts'], {
  encoding: 'utf8',
});

const grouped = {};
let parsed = null;
try {
  parsed = JSON.parse(fs.readFileSync('docs/generated/tdd-smoke-vitest.json', 'utf8'));
} catch {
  parsed = null;
}

if (parsed?.testResults) {
  for (const result of parsed.testResults) {
    if (result.status !== 'failed') continue;
    const group = result.name.split('/')[0] || 'unknown';
    grouped[group] ??= [];
    grouped[group].push(result.name);
  }
}

const report = {
  command: 'pnpm -C apps/web test -- src/app/public-link-crawl.test.ts',
  exitCode: run.status,
  groupedFailures: grouped,
  stderr: run.stderr,
};

fs.mkdirSync('docs/generated', { recursive: true });
fs.writeFileSync('docs/generated/tdd-smoke-report.json', JSON.stringify(report, null, 2));
if (run.status !== 0) {
  console.error(run.stdout);
  console.error(run.stderr);
  process.exit(run.status ?? 1);
}
console.log('Wrote docs/generated/tdd-smoke-report.json');
