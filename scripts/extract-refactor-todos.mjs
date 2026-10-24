#!/usr/bin/env node
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

let raw = '';
try {
  raw = execSync('rg -n "TODO|FIXME|HACK" apps packages scripts docs', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
} catch {
  raw = '';
}

if (!raw) {
  // Pure Node.js fallback scanner
  const targetDirs = ['apps', 'packages', 'scripts', 'docs'];
  const excludeDirs = new Set(['node_modules', '.git', 'dist', '.next', 'coverage', '.turbo', 'playwright-report']);
  const scannedExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.md', '.json']);
  const matches = [];

  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (!excludeDirs.has(entry.name)) {
          walk(path.join(dir, entry.name));
        }
      } else {
        const ext = path.extname(entry.name);
        if (scannedExtensions.has(ext)) {
          try {
            const filePath = path.join(dir, entry.name);
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');
            for (let i = 0; i < lines.length; i++) {
              const line = lines[i];
              if (/\b(TODO|FIXME|HACK)\b/.test(line)) {
                matches.push(`${filePath}:${i + 1}:${line.trim()}`);
              }
            }
          } catch {
            // Skip unreadable files
          }
        }
      }
    }
  }

  for (const t of targetDirs) {
    walk(t);
  }
  raw = matches.join('\n');
}

const lines = raw.split('\n').filter(Boolean);
const items = lines.slice(0, 50).map((line, idx) => {
  const [location, ...rest] = line.split(':');
  const lineNumber = rest.shift();
  const text = rest.join(':').trim();
  return `| R${idx + 1} | ${location.replaceAll('\\', '/')}:${lineNumber} | ${text.replace(/\|/g, '\\|')} | Backlog |`;
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
console.log(`Wrote ${items.length} items to plan/REFRACTOR_SPRINT_BOARD.md`);
