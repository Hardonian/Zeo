import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const threshold = Number.parseInt(process.env.ZEO_COLD_START_BUDGET_MS ?? '1200', 10);
const distEntry = resolve(process.cwd(), 'apps/cli/dist/apps/cli/src/index.js');

if (!existsSync(distEntry)) {
  const build = spawnSync('pnpm', ['-C', 'apps/cli', 'build'], { encoding: 'utf8' });
  if (build.status !== 0) {
    process.stderr.write(`[perf-budget] build failed\n${build.stderr || build.stdout}\n`);
    process.exit(build.status ?? 1);
  }
}

const started = Date.now();
const result = spawnSync('node', [distEntry, '--help'], { encoding: 'utf8' });
const elapsed = Date.now() - started;

if (result.status !== 0) {
  process.stderr.write(`[perf-budget] cli help failed\n${result.stderr || result.stdout}\n`);
  process.exit(result.status ?? 1);
}
if (elapsed > threshold) {
  process.stderr.write(`[perf-budget] cold start ${elapsed}ms exceeds ${threshold}ms\n`);
  process.exit(1);
}
process.stderr.write(`[perf-budget] pass cold start ${elapsed}ms <= ${threshold}ms\n`);
