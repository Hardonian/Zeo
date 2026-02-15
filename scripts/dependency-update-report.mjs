#!/usr/bin/env node
import { execSync } from 'node:child_process';
import fs from 'node:fs';

function run(command) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  } catch (error) {
    return `ERROR: ${error.stderr?.toString().trim() || error.message}`;
  }
}

function parseJsonOrFallback(raw) {
  try {
    return JSON.parse(raw || '{}');
  } catch {
    return { parseError: raw };
  }
}

const generatedAt = new Date().toISOString();
const npmOutdatedRaw = run('pnpm outdated -r --format json');
const npmOutdated = parseJsonOrFallback(npmOutdatedRaw);
const pipChecks = [
  'packages/models/python/requirements.txt',
  'packages/analytics/python/requirements.txt',
  'packages/timeseries/python/requirements.txt',
  'packages/rsl/python/requirements.txt',
].map((path) => ({
  path,
  result: run(`python -m pip list --outdated --format=json --disable-pip-version-check -r ${path}`),
}));

const report = [
  '# Dependency update report',
  '',
  `Generated: ${generatedAt}`,
  '',
  '## Node/pnpm outdated',
  '```json',
  typeof npmOutdated === 'string' ? npmOutdated : JSON.stringify(npmOutdated, null, 2),
  '```',
  '',
  '## Python outdated by requirements file',
  ...pipChecks.flatMap((entry) => [
    `### ${entry.path}`,
    '```json',
    entry.result || '[]',
    '```',
    '',
  ]),
].join('\n');

fs.mkdirSync('docs/generated', { recursive: true });
fs.writeFileSync('docs/generated/dependency-update-report.md', report);
console.log('Wrote docs/generated/dependency-update-report.md');
