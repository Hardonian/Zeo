#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const laneArg = process.argv.find((arg) => arg.startsWith('--lane='));
const lane = laneArg ? laneArg.split('=')[1] : 'main';
const warnThresholdPct = Number(process.env.BENCH_WARN_THRESHOLD_PCT ?? 20);
const baselinePath = resolve(process.cwd(), 'bench/baseline.json');
const artifactsDir = resolve(process.cwd(), 'bench/artifacts');
mkdirSync(artifactsDir, { recursive: true });

for (const script of ['cold-start.mjs', 'hot-path.mjs', 'replay.mjs']) {
  const run = spawnSync('node', [resolve(process.cwd(), 'bench', script)], { encoding: 'utf8' });
  if (run.status !== 0) {
    process.stderr.write(run.stderr || run.stdout || `[bench] failed running ${script}\n`);
    process.exit(run.status ?? 1);
  }
}

const cold = JSON.parse(readFileSync(resolve(artifactsDir, 'cold-start.json'), 'utf8'));
const hot = JSON.parse(readFileSync(resolve(artifactsDir, 'hot-path.json'), 'utf8'));
const replay = JSON.parse(readFileSync(resolve(artifactsDir, 'replay.json'), 'utf8'));
const current = {
  'cold-start': cold.elapsedMs,
  'hot-path': hot.averageMs,
  replay: replay.elapsedMs,
};

const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
const regressions = [];
for (const [key, baselineMs] of Object.entries(baseline)) {
  const observed = current[key];
  const deltaPct = ((observed - baselineMs) / baselineMs) * 100;
  if (deltaPct > warnThresholdPct) {
    regressions.push({ key, baselineMs, observedMs: observed, deltaPct: Number(deltaPct.toFixed(2)) });
  }
}

const summary = { lane, warnThresholdPct, current, baseline, regressions, recordedAt: new Date().toISOString() };
writeFileSync(resolve(artifactsDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);

if (regressions.length > 0) {
  const message = `[bench] regression warnings: ${regressions.map((r) => `${r.key} +${r.deltaPct}%`).join(', ')}`;
  if (lane === 'pr') {
    process.stderr.write(`${message}\n`);
    process.exit(0);
  }
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

process.stdout.write('[bench] all benchmarks within threshold\n');
