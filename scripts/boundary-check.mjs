import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const repoRoot = process.cwd();
const webRoot = join(repoRoot, 'apps/web/src');
const contractsRoot = join(repoRoot, 'packages/contracts/src');

const forbiddenNodeInClient = new Set([
  'assert', 'buffer', 'child_process', 'cluster', 'crypto', 'dgram', 'dns', 'fs', 'http', 'http2', 'https', 'net',
  'os', 'path', 'perf_hooks', 'process', 'readline', 'stream', 'tls', 'tty', 'url', 'util', 'v8', 'vm',
  'worker_threads', 'zlib'
]);

const violations = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      walk(full);
      continue;
    }
    if (!/\.(ts|tsx)$/.test(entry)) continue;
    scanFile(full);
  }
}

function addViolation(filePath, reason, specifier) {
  violations.push({ filePath: relative(repoRoot, filePath), reason, specifier });
}

function scanFile(filePath) {
  const source = readFileSync(filePath, 'utf8');
  const isWebFile = filePath.startsWith(webRoot);
  const isContractsFile = filePath.startsWith(contractsRoot) && !filePath.includes('/__tests__/');

  const lines = source.split(/\r?\n/);
  const firstMeaningful = lines.find((line) => {
    const trimmed = line.trim();
    return trimmed.length > 0 && !trimmed.startsWith('//') && !trimmed.startsWith('/*') && !trimmed.startsWith('*');
  }) ?? '';
  const isUseClient = firstMeaningful === '"use client";' || firstMeaningful === "'use client';";

  const importRegex = /(?:import\s+(?:[^'";]+\s+from\s+)?|export\s+[^'";]*\s+from\s+|import\s*\()\s*["']([^"']+)["']/g;

  for (const match of source.matchAll(importRegex)) {
    const specifier = match[1];

    if (isWebFile) {
      if (specifier === '@zeo/cli' || specifier.startsWith('@zeo/cli/')) {
        addViolation(filePath, 'web-imports-cli', specifier);
      }
      if (specifier === '@zeo/mcp-server' || specifier.startsWith('@zeo/mcp-server/')) {
        addViolation(filePath, 'web-imports-mcp', specifier);
      }
    }

    if (isUseClient) {
      const normalized = specifier.startsWith('node:') ? specifier.slice(5) : specifier;
      if (forbiddenNodeInClient.has(normalized)) {
        addViolation(filePath, 'client-imports-node-builtin', specifier);
      }
    }

    if (isContractsFile) {
      if (specifier.startsWith('node:')) {
        addViolation(filePath, 'contracts-imports-node', specifier);
      }
      if (specifier === '@zeo/cli' || specifier.startsWith('@zeo/cli/')) {
        addViolation(filePath, 'contracts-imports-cli', specifier);
      }
      if (specifier === '@zeo/mcp-server' || specifier.startsWith('@zeo/mcp-server/')) {
        addViolation(filePath, 'contracts-imports-mcp', specifier);
      }
    }
  }
}

walk(webRoot);
walk(contractsRoot);

if (violations.length > 0) {
  console.error('Boundary check failed. Restricted imports detected:');
  for (const violation of violations) {
    console.error(` - ${violation.filePath}: ${violation.reason} (${violation.specifier})`);
  }
  process.exit(1);
}

console.log('Boundary check passed: web/cli/mcp boundaries and shared-runtime neutrality are enforced.');
