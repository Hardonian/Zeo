#!/usr/bin/env node

import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync, chmodSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const root = resolve(dirname(__filename), '..');
const hooksDir = resolve(root, '.githooks');

console.log('== Setting up Zeo Git Hooks ==');

if (!existsSync(hooksDir)) {
  mkdirSync(hooksDir, { recursive: true });
}

const preCommitHook = `#!/usr/bin/env bash
set -e

echo "[githooks] Running pre-commit boundary and security scan..."
node scripts/boundary-check.mjs
node scripts/secret-scan.mjs
echo "[githooks] Pre-commit checks passed."
`;

const hookPath = resolve(hooksDir, 'pre-commit');
writeFileSync(hookPath, preCommitHook, 'utf8');

try {
  chmodSync(hookPath, '755');
} catch {
  // Windows ignore chmod
}

try {
  execSync('git config core.hooksPath .githooks', { cwd: root, stdio: 'inherit' });
  console.log('✓ Configured git core.hooksPath -> .githooks');
} catch (err) {
  console.warn('⚠️ Could not configure git core.hooksPath automatically:', err.message);
}

console.log('✓ Git pre-commit hooks installed successfully.');
