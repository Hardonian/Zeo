#!/usr/bin/env node

import { readdirSync, statSync, readFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const root = resolve(dirname(__filename), '..');

console.log('== Zeo Dead Code & Export Audit ==');

let totalFiles = 0;
let emptyFiles = [];
let todoCount = 0;

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', 'dist', '.next', '.git', '.turbo'].includes(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') || entry.name.endsWith('.js') || entry.name.endsWith('.mjs'))) {
      totalFiles++;
      const stats = statSync(full);
      if (stats.size === 0) {
        emptyFiles.push(full.replace(root, '').slice(1));
      }
      const content = readFileSync(full, 'utf8');
      const matches = content.match(/\/\/\s*TODO/gi);
      if (matches) {
        todoCount += matches.length;
      }
    }
  }
}

walk(join(root, 'packages'));
walk(join(root, 'apps'));

console.log(`- Scanned source files: ${totalFiles}`);
console.log(`- Empty source files: ${emptyFiles.length}`);
if (emptyFiles.length > 0) {
  for (const f of emptyFiles) console.log(`  • ${f}`);
}
console.log(`- TODO markers detected: ${todoCount}`);

if (emptyFiles.length === 0) {
  console.log('✓ Dead code audit passed: 0 orphaned empty files.');
  process.exit(0);
} else {
  console.warn('⚠️ Warning: orphaned empty files detected.');
  process.exit(1);
}
