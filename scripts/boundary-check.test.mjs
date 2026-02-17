import test from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectBoundaryViolations } from './boundary-check-lib.mjs';

const scriptsDir = fileURLToPath(new URL('.', import.meta.url));
const fixtureRoot = join(scriptsDir, '__fixtures__/boundary-check');

test('flags CLI import from web source fixtures', () => {
  const violations = collectBoundaryViolations({
    repoRoot: fixtureRoot,
    webRoot: join(fixtureRoot, 'apps/web/src'),
    contractsRoot: join(fixtureRoot, 'packages/contracts/src'),
  });

  assert(violations.some((violation) => violation.reason === 'web-imports-cli' && violation.specifier === '@zeo/cli'));
});

test('flags CLI import from contracts source fixtures', () => {
  const violations = collectBoundaryViolations({
    repoRoot: fixtureRoot,
    webRoot: join(fixtureRoot, 'apps/web/src'),
    contractsRoot: join(fixtureRoot, 'packages/contracts/src'),
  });

  assert(violations.some((violation) => violation.reason === 'contracts-imports-cli' && violation.specifier === '@zeo/cli/runtime'));
});
