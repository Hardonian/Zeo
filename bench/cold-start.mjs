#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const cliPath = resolve(process.cwd(), 'apps/cli/dist/apps/cli/src/index.js');
const contractsDist = resolve(process.cwd(), 'packages/contracts/dist/index.js');
if (!existsSync(cliPath) || !existsSync(contractsDist)) {
  const build = spawnSync('pnpm', ['-r', '--filter', '@zeo/cli...', 'build'], { encoding: 'utf8' });
  if (build.status !== 0) {
    process.stderr.write(build.stderr || build.stdout || '[bench:cold] build failed\n');
    process.exit(build.status ?? 1);
  }
}

const started = process.hrtime.bigint();
const run = spawnSync('node', [cliPath, '--help'], { encoding: 'utf8', timeout: 20_000 });
const elapsedMs = Number(process.hrtime.bigint() - started) / 1e6;

if (run.status !== 0) {
  process.stderr.write(run.stderr || run.stdout || '[bench:cold] command failed\n');
  process.exit(run.status ?? 1);
}

const output = {
  benchmark: 'cold-start',
  command: `node ${cliPath} --help`,
  elapsedMs,
  recordedAt: new Date().toISOString(),
};
mkdirSync(resolve(process.cwd(), 'bench/artifacts'), { recursive: true });
writeFileSync(resolve(process.cwd(), 'bench/artifacts/cold-start.json'), `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output));
