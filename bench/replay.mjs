#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const cliPath = resolve(process.cwd(), 'apps/cli/dist/apps/cli/src/index.js');
const contractsDist = resolve(process.cwd(), 'packages/contracts/dist/index.js');
if (!existsSync(cliPath) || !existsSync(contractsDist)) {
  const build = spawnSync('pnpm', ['-r', '--filter', '@zeo/cli...', 'build'], { encoding: 'utf8' });
  if (build.status !== 0) {
    process.stderr.write(build.stderr || build.stdout || '[bench:replay] build failed\n');
    process.exit(build.status ?? 1);
  }
}

const seed = 'bench-replay-seed';
const prep = spawnSync('node', [cliPath, '--example', 'negotiation', '--depth', '2', '--deterministic', '--seed', seed], {
  encoding: 'utf8',
  timeout: 60_000,
});
if (prep.status !== 0) {
  process.stderr.write(prep.stderr || prep.stdout || '[bench:replay] failed to prepare snapshot\n');
  process.exit(prep.status ?? 1);
}

const snapshotMatch = `${prep.stdout || ''}\n${prep.stderr || ''}`.match(/Snapshot:\s+([^\s]+)\s+\(/);
if (!snapshotMatch) {
  process.stderr.write('[bench:replay] unable to parse snapshot run id\n');
  process.exit(1);
}

const runId = snapshotMatch[1];
const started = process.hrtime.bigint();
const replayRun = spawnSync('node', [cliPath, 'replay', runId], { encoding: 'utf8', timeout: 60_000 });
const elapsedMs = Number(process.hrtime.bigint() - started) / 1e6;
if (replayRun.status !== 0) {
  process.stderr.write(replayRun.stderr || replayRun.stdout || '[bench:replay] replay command failed\n');
  process.exit(replayRun.status ?? 1);
}

const output = {
  benchmark: 'replay',
  command: `node ${cliPath} replay ${runId}`,
  elapsedMs,
  runId,
  recordedAt: new Date().toISOString(),
};
mkdirSync(resolve(process.cwd(), 'bench/artifacts'), { recursive: true });
writeFileSync(resolve(process.cwd(), 'bench/artifacts/replay.json'), `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output));
