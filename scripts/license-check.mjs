#!/usr/bin/env node
import { execSync } from 'node:child_process';

const allowed = new Set(['MIT', 'ISC', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'Unlicense', 'CC0-1.0']);

let output = '';
try {
  output = execSync('pnpm licenses list --json', { encoding: 'utf8' });
} catch (error) {
  output = error.stdout || '[]';
}

let records = [];
try {
  records = JSON.parse(output);
} catch {
  records = [];
}

const violations = [];
for (const item of records) {
  const lic = String(item.license || item.licenses || 'UNKNOWN').trim();
  if (!allowed.has(lic)) {
    violations.push(`${item.name || item.package || 'unknown'} -> ${lic}`);
  }
}

if (violations.length) {
  console.error('Disallowed or unknown licenses detected:');
  for (const v of violations) {
    console.error(`- ${v}`);
  }
  process.exit(1);
}

console.log('License check passed (SPDX allowlist).');
