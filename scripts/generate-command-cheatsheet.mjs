#!/usr/bin/env node
import fs from 'node:fs';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const scripts = Object.entries(pkg.scripts || {}).sort(([a], [b]) => a.localeCompare(b));
const aliases = [
  { alias: './scripts/workflows.sh verify', description: 'Shared verification workflow' },
  { alias: './scripts/workflows.sh release-check', description: 'Fast release readiness checks' },
  { alias: 'pnpm deps:update', description: 'Generate dependency update diff report' },
];

const lines = [
  '# Command cheat sheet',
  '',
  '## npm/pnpm tasks',
  '| Command | Purpose |',
  '|---|---|',
  ...scripts.map(([name, command]) => `| pnpm ${name} | \`${command.replace(/\|/g, '\\|')}\` |`),
  '',
  '## Shared aliases',
  '| Alias | Purpose |',
  '|---|---|',
  ...aliases.map((entry) => `| ${entry.alias} | ${entry.description} |`),
  '',
];

fs.mkdirSync('docs/generated', { recursive: true });
fs.writeFileSync('docs/generated/COMMAND_CHEATSHEET.md', lines.join('\n'));
console.log('Wrote docs/generated/COMMAND_CHEATSHEET.md');
