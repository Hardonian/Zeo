#!/usr/bin/env node
import { execSync } from 'node:child_process';
import fs from 'node:fs';

let raw = '';
try {
  raw = execSync("rg -n \"TODO|FIXME|HACK\" apps packages scripts docs", { encoding: 'utf8' });
} catch (error) {
  raw = error.stdout?.toString() || '';
}
const lines = raw.split('\n').filter(Boolean);
const items = lines.slice(0, 50).map((line, idx) => {
  const [location, ...rest] = line.split(':');
  const lineNumber = rest.shift();
  const text = rest.join(':').trim();
  return `| R${idx + 1} | ${location}:${lineNumber} | ${text.replace(/\|/g, '\\|')} | Backlog |`;
});

const board = [
  '# Refactor sprint board',
  '',
  '| Ticket | Location | Refactor item | Status |',
  '|---|---|---|---|',
  ...items,
  '',
].join('\n');

fs.mkdirSync('plan', { recursive: true });
fs.writeFileSync('plan/REFRACTOR_SPRINT_BOARD.md', board);
console.log('Wrote plan/REFRACTOR_SPRINT_BOARD.md');
