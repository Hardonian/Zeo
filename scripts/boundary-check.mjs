import { join } from 'node:path';
import { collectBoundaryViolations } from './boundary-check-lib.mjs';

const repoRoot = process.cwd();
const webRoot = join(repoRoot, 'apps/web/src');
const contractsRoot = join(repoRoot, 'packages/contracts/src');

const violations = collectBoundaryViolations({ repoRoot, webRoot, contractsRoot });

if (violations.length > 0) {
  console.error('Boundary check failed. Restricted imports detected:');
  for (const violation of violations) {
    console.error(` - ${violation.filePath}: ${violation.reason} (${violation.specifier})`);
  }
  process.exit(1);
}

console.log('Boundary check passed: web/cli/mcp boundaries and shared-runtime neutrality are enforced.');
