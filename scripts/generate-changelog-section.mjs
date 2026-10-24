#!/usr/bin/env node

import { execSync } from 'node:child_process';
import { writeFileSync, existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const root = resolve(dirname(__filename), '..');

console.log('== Generating Conventional Changelog Section ==');

let gitLog = '';
try {
  gitLog = execSync('git log -n 50 --pretty=format:"%h%x09%s%x09%an%x09%as"', {
    cwd: root,
    encoding: 'utf8',
  });
} catch (error) {
  console.error('Failed to read git log:', error.message);
  process.exit(1);
}

const lines = gitLog.split('\n').filter(Boolean);
const categories = {
  Features: [],
  Fixes: [],
  Performance: [],
  Documentation: [],
  Maintenance: [],
};

for (const line of lines) {
  const [hash, subject] = line.split('\t');
  if (!subject) continue;

  const item = `- \`${hash}\`: ${subject}`;
  if (/^feat(\(.*?\))?:/i.test(subject)) {
    categories.Features.push(item);
  } else if (/^fix(\(.*?\))?:/i.test(subject)) {
    categories.Fixes.push(item);
  } else if (/^perf(\(.*?\))?:/i.test(subject)) {
    categories.Performance.push(item);
  } else if (/^docs(\(.*?\))?:/i.test(subject)) {
    categories.Documentation.push(item);
  } else if (/^(chore|ci|refactor|test)(\(.*?\))?:/i.test(subject)) {
    categories.Maintenance.push(item);
  }
}

const dateStr = new Date().toISOString().split('T')[0];
let section = `\n### Release Notes (${dateStr})\n\n`;

for (const [title, entries] of Object.entries(categories)) {
  if (entries.length > 0) {
    section += `#### ${title}\n\n`;
    section += entries.slice(0, 10).join('\n') + '\n\n';
  }
}

console.log(section);

const targetFile = resolve(root, 'CHANGELOG_PREVIEW.md');
writeFileSync(targetFile, section, 'utf8');
console.log(`✓ Changelog section written to ${targetFile}`);
