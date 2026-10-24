import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const forbiddenNodeInClient = new Set([
  'assert', 'buffer', 'child_process', 'cluster', 'crypto', 'dgram', 'dns', 'fs', 'http', 'http2', 'https', 'net',
  'os', 'path', 'perf_hooks', 'process', 'readline', 'stream', 'tls', 'tty', 'url', 'util', 'v8', 'vm',
  'worker_threads', 'zlib'
]);

function addViolation(violations, repoRoot, filePath, reason, specifier) {
  violations.push({ filePath: relative(repoRoot, filePath), reason, specifier });
}

export function scanFileForBoundaryViolations({ filePath, source, repoRoot, webRoot, cliRoot, contractsRoot }) {
  const violations = [];
  const normalizedPath = filePath.replaceAll('\\', '/');
  const normalizedWebRoot = webRoot ? webRoot.replaceAll('\\', '/') : '';
  const normalizedCliRoot = cliRoot ? cliRoot.replaceAll('\\', '/') : '';
  const normalizedContractsRoot = contractsRoot ? contractsRoot.replaceAll('\\', '/') : '';

  const isWebFile = normalizedWebRoot ? normalizedPath.startsWith(normalizedWebRoot) : false;
  const isCliFile = normalizedCliRoot ? normalizedPath.startsWith(normalizedCliRoot) : false;
  const isContractsFile =
    normalizedContractsRoot ? normalizedPath.startsWith(normalizedContractsRoot) && !normalizedPath.includes('/__tests__/') : false;

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
        addViolation(violations, repoRoot, filePath, 'web-imports-cli', specifier);
      }
      if (specifier === '@zeo/mcp-server' || specifier.startsWith('@zeo/mcp-server/')) {
        addViolation(violations, repoRoot, filePath, 'web-imports-mcp', specifier);
      }
    }

    if (isCliFile) {
      if (specifier.startsWith('next') || specifier === 'react' || specifier.startsWith('@/app/') || specifier.startsWith('apps/web/')) {
        addViolation(violations, repoRoot, filePath, 'cli-imports-web-runtime', specifier);
      }
      if (specifier === '@zeo/web' || specifier.startsWith('@zeo/web/')) {
        addViolation(violations, repoRoot, filePath, 'cli-imports-web-package', specifier);
      }
    }

    if (isUseClient) {
      const normalized = specifier.startsWith('node:') ? specifier.slice(5) : specifier;
      if (forbiddenNodeInClient.has(normalized)) {
        addViolation(violations, repoRoot, filePath, 'client-imports-node-builtin', specifier);
      }
    }

    if (isContractsFile) {
      if (specifier.startsWith('node:')) {
        addViolation(violations, repoRoot, filePath, 'contracts-imports-node', specifier);
      }
      if (specifier === '@zeo/cli' || specifier.startsWith('@zeo/cli/')) {
        addViolation(violations, repoRoot, filePath, 'contracts-imports-cli', specifier);
      }
      if (specifier === '@zeo/mcp-server' || specifier.startsWith('@zeo/mcp-server/')) {
        addViolation(violations, repoRoot, filePath, 'contracts-imports-mcp', specifier);
      }
    }
  }

  return violations;
}

function walk(dir, visitor) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      walk(full, visitor);
      continue;
    }
    if (!/\.(ts|tsx)$/.test(entry)) continue;
    visitor(full);
  }
}

export function collectBoundaryViolations({ repoRoot, webRoot, cliRoot, contractsRoot }) {
  const violations = [];
  const scan = (filePath) => {
    const source = readFileSync(filePath, 'utf8');
    violations.push(
      ...scanFileForBoundaryViolations({ filePath, source, repoRoot, webRoot, cliRoot, contractsRoot }),
    );
  };

  walk(webRoot, scan);
  if (cliRoot) walk(cliRoot, scan);
  walk(contractsRoot, scan);
  return violations;
}
