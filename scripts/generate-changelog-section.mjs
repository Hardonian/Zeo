#!/usr/bin/env node
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const range = process.argv[2] ?? 'HEAD~30..HEAD';
const raw = execSync(`git log --pretty=format:%s ${range}`, { encoding: 'utf8' });
const commits = raw.split('\n').filter(Boolean);

const buckets = {
  feat: [],
  fix: [],
  docs: [],
  chore: [],
  other: [],
};

for (const msg of commits) {
  const match = msg.match(/^(\w+)(\(.+\))?:\s+(.*)$/);
  if (!match) {
    buckets.other.push(msg);
    continue;
  }
  const type = match[1];
  const text = match[3];
  if (type in buckets) buckets[type].push(text);
  else buckets.other.push(text);
}

const out = [
  `## ${new Date().toISOString().slice(0, 10)}`,
  '',
  ...Object.entries(buckets).flatMap(([type, entries]) => {
    if (!entries.length) return [];
    return [`### ${type}`, ...entries.map((entry) => `- ${entry}`), ''];
  }),
].join('\n');

fs.mkdirSync('docs/generated', { recursive: true });
fs.writeFileSync('docs/generated/changelog-section.md', out);
console.log('Wrote docs/generated/changelog-section.md');
