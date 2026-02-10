#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

if (!existsSync('apps/cli/dist/apps/cli/src/index.js')) {
  const build = spawnSync('pnpm', ['-C', 'apps/cli', 'build'], { encoding: 'utf8' });
  if (build.status !== 0) {
    process.stderr.write(build.stderr || build.stdout || 'build failed\n');
    process.exit(build.status ?? 1);
  }
}

const commands = [
  ['node', ['apps/cli/dist/apps/cli/src/index.js', '--help']],
  ['node', ['apps/cli/dist/apps/cli/src/index.js', '--version']],
  ['node', ['apps/cli/dist/apps/cli/src/index.js', 'mcp', 'ping']],
];

for (const [bin, args] of commands) {
  const started = process.hrtime.bigint();
  const result = spawnSync(bin, args, { env: { ...process.env, ZEO_PERF: '1' }, encoding: 'utf8' });
  const elapsedMs = Number(process.hrtime.bigint() - started) / 1e6;
  process.stderr.write(`[cli-perf] ${bin} ${args.join(' ')} => ${elapsedMs.toFixed(2)}ms (exit ${result.status})\n`);
  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout || 'command failed\n');
    process.exit(result.status ?? 1);
  }
}
