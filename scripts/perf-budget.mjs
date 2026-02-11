import { spawnSync } from 'node:child_process';

const threshold = Number.parseInt(process.env.ZEO_COLD_START_BUDGET_MS ?? '800', 10);
const started = Date.now();
const result = spawnSync('pnpm', ['-C', 'apps/cli', 'start', '--', '--help'], { encoding: 'utf8' });
const elapsed = Date.now() - started;
if (result.status !== 0) {
  process.stderr.write(`[perf-budget] cli help failed\n${result.stderr}\n`);
  process.exit(1);
}
if (elapsed > threshold) {
  process.stderr.write(`[perf-budget] cold start ${elapsed}ms exceeds ${threshold}ms\n`);
  process.exit(1);
}
process.stderr.write(`[perf-budget] pass cold start ${elapsed}ms <= ${threshold}ms\n`);
