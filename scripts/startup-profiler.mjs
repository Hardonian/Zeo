#!/usr/bin/env node

/**
 * CLI Cold Start Profiler (DEVX-03)
 *
 * Measures process startup latency of the Zeo CLI entrypoint.
 * Asserts startup overhead is bounded to prevent latency regressions.
 */

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const cliPath = resolve(process.cwd(), 'apps/cli/dist/apps/cli/src/index.js');
const fallbackCliPath = resolve(process.cwd(), 'apps/cli/dist/index.js');

const targetCli = existsSync(cliPath) ? cliPath : fallbackCliPath;

if (!existsSync(targetCli)) {
  process.stderr.write(`[startup-profiler] Error: Compiled CLI not found at ${targetCli}. Build @zeo/cli first.\n`);
  process.exit(1);
}

const WARMUP_RUNS = 1;
const BENCHMARK_RUNS = 5;
const MAX_ALLOWED_LATENCY_MS = Number(process.env['MAX_STARTUP_MS'] || 800);

process.stdout.write(`=== ZEO CLI COLD START PROFILER (DEVX-03) ===\n`);
process.stdout.write(`Target Entrypoint: ${targetCli}\n`);
process.stdout.write(`Target Threshold: <${MAX_ALLOWED_LATENCY_MS}ms\n\n`);

// Warmup
for (let i = 0; i < WARMUP_RUNS; i++) {
  spawnSync('node', [targetCli, '--version'], { encoding: 'utf8' });
}

const latencies = [];

for (let i = 1; i <= BENCHMARK_RUNS; i++) {
  const start = performance.now();
  const res = spawnSync('node', [targetCli, '--version'], { encoding: 'utf8' });
  const durationMs = performance.now() - start;

  if (res.status !== 0) {
    process.stderr.write(`[startup-profiler] Run ${i} failed with exit code ${res.status}: ${res.stderr}\n`);
    process.exit(1);
  }

  latencies.push(durationMs);
  process.stdout.write(`  Run ${i}: ${durationMs.toFixed(2)}ms (output: ${res.stdout.trim()})\n`);
}

const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
const min = Math.min(...latencies);
const max = Math.max(...latencies);

process.stdout.write(`\nResults:\n`);
process.stdout.write(`  Min: ${min.toFixed(2)}ms\n`);
process.stdout.write(`  Avg: ${avg.toFixed(2)}ms\n`);
process.stdout.write(`  Max: ${max.toFixed(2)}ms\n`);

if (avg > MAX_ALLOWED_LATENCY_MS) {
  process.stderr.write(`\n[REGRESSION ALERT] Average startup latency ${avg.toFixed(2)}ms exceeded ${MAX_ALLOWED_LATENCY_MS}ms threshold!\n`);
  process.exit(1);
}

process.stdout.write(`\nStatus: PASSED (Startup latency within acceptable budget)\n`);
process.exit(0);
