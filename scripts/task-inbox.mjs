#!/usr/bin/env node
import fs from 'node:fs';

const raw = process.argv[2] ? fs.readFileSync(process.argv[2], 'utf8') : fs.readFileSync(0, 'utf8');
const lines = raw.split('\n').map((line) => line.trim()).filter(Boolean);

const tickets = lines.map((line, idx) => {
  const priority = /urgent|asap|critical/i.test(line) ? 'high' : /later|someday/i.test(line) ? 'low' : 'medium';
  const due = line.match(/by\s+(\d{4}-\d{2}-\d{2})/i)?.[1] ?? null;
  const labels = [
    /api|endpoint|backend/i.test(line) ? 'backend' : null,
    /ui|dashboard|page|front/i.test(line) ? 'frontend' : null,
    /test|coverage|spec/i.test(line) ? 'testing' : null,
  ].filter(Boolean);
  return {
    id: `inbox-${idx + 1}`,
    title: line.replace(/by\s+\d{4}-\d{2}-\d{2}/i, '').trim(),
    priority,
    dueDate: due,
    labels,
    provenance: {
      source: process.argv[2] ?? 'stdin',
      capturedAt: new Date().toISOString(),
    },
  };
});

console.log(JSON.stringify({ tickets }, null, 2));
