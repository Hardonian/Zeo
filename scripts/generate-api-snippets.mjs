#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(fullPath, acc);
    if (entry.isFile() && /openapi|swagger/i.test(entry.name) && /\.(json|ya?ml)$/.test(entry.name)) acc.push(fullPath);
  }
  return acc;
}

function parseSpec(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  if (filePath.endsWith('.json')) return JSON.parse(raw);
  return null;
}

const candidates = walk(process.cwd());
const snippets = [];

for (const specFile of candidates) {
  try {
    const spec = parseSpec(specFile);
    if (!spec?.paths) continue;
    for (const [route, methods] of Object.entries(spec.paths)) {
      for (const [method, operation] of Object.entries(methods)) {
        snippets.push({
          method: method.toUpperCase(),
          route,
          summary: operation.summary || operation.operationId || 'No summary',
          source: path.relative(process.cwd(), specFile),
        });
      }
    }
  } catch (error) {
    snippets.push({ method: 'ERROR', route: specFile, summary: String(error.message), source: path.relative(process.cwd(), specFile) });
  }
}

const output = [
  '# API snippets',
  '',
  snippets.length ? '| Method | Route | Summary | Source |\n|---|---|---|---|' : 'No OpenAPI/Swagger specs found.',
  ...snippets.map((row) => `| ${row.method} | ${row.route} | ${row.summary} | ${row.source} |`),
  '',
].join('\n');

fs.mkdirSync('docs/generated', { recursive: true });
fs.writeFileSync('docs/generated/api-snippets.md', output);
console.log('Wrote docs/generated/api-snippets.md');
