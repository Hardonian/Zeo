#!/usr/bin/env node
import { execSync } from 'node:child_process';

function run(cmd) {
  return execSync(cmd, { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' });
}

let outdatedRaw = '{}';
try {
  outdatedRaw = run('pnpm outdated --recursive --format json');
} catch (error) {
  outdatedRaw = error.stdout || '{}';
}

let outdated = {};
try {
  outdated = JSON.parse(outdatedRaw || '{}');
} catch {
  outdated = {};
}

const majorUpdates = [];
for (const [pkg, info] of Object.entries(outdated)) {
  const current = String(info.current || '0.0.0');
  const latest = String(info.latest || current);
  const cMajor = Number(current.split('.')[0]);
  const lMajor = Number(latest.split('.')[0]);
  if (Number.isFinite(cMajor) && Number.isFinite(lMajor) && lMajor > cMajor) {
    majorUpdates.push({ pkg, current, latest });
  }
}

if (majorUpdates.length > 0) {
  console.error('Major updates detected; blocking auto-merge until schema/API review:');
  for (const item of majorUpdates) {
    console.error(`- ${item.pkg}: ${item.current} -> ${item.latest}`);
  }
  process.exit(2);
}

console.log('No major dependency updates detected. Running fast verification...');
execSync('pnpm verify:fast', { stdio: 'inherit' });
console.log('Upgrade dry-run passed.');
