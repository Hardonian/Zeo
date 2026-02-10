#!/usr/bin/env node
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const providers = ['openai', 'anthropic', 'openrouter', 'ollama'];
const requiredTypes = ['positive', 'malformed', 'nonjson', 'schemaarray'];

const baseDir = resolve(process.cwd(), 'apps/cli/src/fixtures/provider-contracts');
const negativeDir = resolve(baseDir, 'negative');

const positiveFiles = readdirSync(baseDir).filter((name) => name.endsWith('.response.json'));
const negativeFiles = readdirSync(negativeDir).filter((name) => name.endsWith('.response.json'));

const matrix = new Map();
for (const provider of providers) {
  matrix.set(provider, new Set());
}

for (const file of positiveFiles) {
  const provider = file.split('.')[0];
  if (matrix.has(provider)) matrix.get(provider).add('positive');
}

for (const file of negativeFiles) {
  const [provider, type] = file.split('.');
  if (matrix.has(provider)) matrix.get(provider).add(type);
}

for (const file of positiveFiles) {
  const payload = JSON.parse(readFileSync(resolve(baseDir, file), 'utf8'));
  const stem = file.split('.')[0];
  if (payload.provider !== stem) {
    console.error(`[fixture-coverage] provider field mismatch: ${file} has provider=${payload.provider}`);
    process.exit(1);
  }
}

const header = ['provider', ...requiredTypes].join('\t');
console.log(header);
for (const provider of providers) {
  const row = [provider, ...requiredTypes.map((type) => (matrix.get(provider).has(type) ? '✅' : '❌'))];
  console.log(row.join('\t'));
}

const missing = [];
for (const provider of providers) {
  for (const type of requiredTypes) {
    if (!matrix.get(provider).has(type)) {
      missing.push(`${provider}:${type}`);
    }
  }
}

if (missing.length > 0) {
  console.error(`[fixture-coverage] missing fixture coverage: ${missing.join(', ')}`);
  process.exit(1);
}

console.log('[fixture-coverage] coverage complete');
