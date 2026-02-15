#!/usr/bin/env node
import fs from 'node:fs';

const inputPath = process.argv[2];
if (!inputPath) {
  console.error('Usage: meeting-notes-to-issues.mjs <notes.md>');
  process.exit(1);
}

const content = fs.readFileSync(inputPath, 'utf8');
const sections = content.split(/^##\s+/gm).map((chunk) => chunk.trim()).filter(Boolean);

const issues = sections.map((section, index) => {
  const [header, ...bodyLines] = section.split('\n');
  const body = bodyLines.join('\n').trim();
  const tasks = bodyLines.filter((line) => /^[-*]\s+/.test(line)).map((line) => line.replace(/^[-*]\s+/, ''));
  return {
    title: header.replace(/[:#]/g, '').trim() || `Meeting follow-up ${index + 1}`,
    body: [
      '## Context',
      body || 'Captured from meeting notes.',
      '',
      '## Action items',
      ...(tasks.length ? tasks.map((task) => `- [ ] ${task}`) : ['- [ ] Confirm deliverables from notes']),
      '',
      `Source: ${inputPath}`,
    ].join('\n'),
    labels: ['meeting-follow-up'],
  };
});

fs.mkdirSync('docs/generated', { recursive: true });
fs.writeFileSync('docs/generated/issue-drafts.json', JSON.stringify({ generatedAt: new Date().toISOString(), issues }, null, 2));
console.log('Wrote docs/generated/issue-drafts.json');
