#!/usr/bin/env node
/**
 * Zeo Benchmark Suite
 * Performance and latency validation for core engine services.
 *
 * Usage:
 *   node scripts/benchmark.mjs [--iterations=N] [--warmup=N] [--json] [--out=path]
 *                              [--budget-analysis-p95=ms] [--budget-policy-p95=ms]
 *
 * Exit codes:
 *   0 — completed, all budgets met (or no budgets set)
 *   1 — a budget was exceeded or a benchmark threw
 *   2 — prerequisites missing (e.g. packages not built)
 *
 * Note: timings are environment-dependent observations, not guarantees.
 * Results are reported as ranges (min–max, p50/p95/p99) with sample size.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = {};
  for (const raw of argv) {
    if (!raw.startsWith('--')) continue;
    const [key, value] = raw.slice(2).split('=');
    args[key] = value === undefined ? true : value;
  }
  return args;
}

function positiveInt(value, fallback, name) {
  if (value === undefined) return fallback;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) {
    throw new UsageError(`--${name} must be a positive integer (got "${value}")`);
  }
  return n;
}

function optionalNumber(value, name) {
  if (value === undefined) return undefined;
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) {
    throw new UsageError(`--${name} must be a positive number of ms (got "${value}")`);
  }
  return n;
}

class UsageError extends Error {}
class PrerequisiteError extends Error {}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

/** Nearest-rank percentile on a pre-sorted array. */
function percentile(sorted, p) {
  if (sorted.length === 0) return NaN;
  const rank = Math.ceil((p / 100) * sorted.length);
  return sorted[Math.min(sorted.length, Math.max(1, rank)) - 1];
}

function summarize(name, times) {
  const sorted = [...times].sort((a, b) => a - b);
  const n = sorted.length;
  const mean = sorted.reduce((a, b) => a + b, 0) / n;
  const variance = n > 1 ? sorted.reduce((a, t) => a + (t - mean) ** 2, 0) / (n - 1) : 0;
  const stddev = Math.sqrt(variance);
  return {
    name,
    samples: n,
    mean,
    stddev,
    // Coefficient of variation: high values (>0.3) mean the run is noisy.
    cv: mean > 0 ? stddev / mean : 0,
    min: sorted[0],
    p50: percentile(sorted, 50),
    p95: percentile(sorted, 95),
    p99: percentile(sorted, 99),
    max: sorted[n - 1],
  };
}

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

async function measure(fn, { iterations, warmup }) {
  for (let i = 0; i < warmup; i++) await fn();
  globalThis.gc?.(); // Only active with --expose-gc; reduces GC noise between suites.
  const times = new Array(iterations);
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await fn();
    times[i] = performance.now() - start;
  }
  return times;
}

async function importBuilt(pkg) {
  const entry = path.join(ROOT, 'packages', pkg, 'dist', 'index.js');
  if (!fs.existsSync(entry)) {
    throw new PrerequisiteError(
      `Missing build output: ${path.relative(ROOT, entry)}. Run "pnpm build" first.`,
    );
  }
  return import(pathToFileURL(entry).href);
}

function fmt(ms) {
  return `${ms.toFixed(3)}ms`;
}

function printSummary(s, budget) {
  const noisy = s.cv > 0.3 ? '  (noisy: CV > 0.3, treat as low confidence)' : '';
  console.log(`\n${s.name}  [n=${s.samples}]`);
  console.log(`  mean:   ${fmt(s.mean)} ± ${fmt(s.stddev)}${noisy}`);
  console.log(`  p50:    ${fmt(s.p50)}`);
  console.log(`  p95:    ${fmt(s.p95)}${budget ? `  (budget ${fmt(budget)})` : ''}`);
  console.log(`  p99:    ${fmt(s.p99)}`);
  console.log(`  range:  ${fmt(s.min)} – ${fmt(s.max)}`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const iterations = positiveInt(args.iterations, 50, 'iterations');
  const warmup = positiveInt(args.warmup, 5, 'warmup');
  const budgets = {
    analysis: optionalNumber(args['budget-analysis-p95'], 'budget-analysis-p95'),
    policy: optionalNumber(args['budget-policy-p95'], 'budget-policy-p95'),
  };
  const jsonOnly = args.json === true;
  const log = jsonOnly ? () => {} : console.log;

  const [{ StaticAnalysisService }, { policyEngineService }] = await Promise.all([
    importBuilt('analysis'),
    importBuilt('policy'),
  ]);

  const inputPath = path.join(ROOT, 'scripts', 'smoke-test.mjs');
  if (!fs.existsSync(inputPath)) {
    throw new PrerequisiteError(`Benchmark input not found: ${path.relative(ROOT, inputPath)}`);
  }
  const input = fs.readFileSync(inputPath, 'utf8');

  log('=== Zeo Performance Benchmark ===');
  log(`node ${process.version} · ${os.platform()}/${os.arch()} · ${os.cpus()[0]?.model ?? 'unknown cpu'}`);
  log(`iterations=${iterations} warmup=${warmup}`);

  const results = [];

  // 1. Static analysis
  const analysis = new StaticAnalysisService();
  log(`\n[bench] static analysis (${input.length} chars)…`);
  results.push({
    key: 'analysis',
    ...summarize(
      'Static Analysis (Founder Rules)',
      await measure(() => analysis.analyze('test.mjs', input), { iterations, warmup }),
    ),
  });

  // 2. Policy evaluation
  log('[bench] policy evaluation…');
  const findings = [{ ruleId: 'rule-1', message: 'test', severity: 'medium', line: 1 }];
  const policy = await policyEngineService.loadEffectivePolicy('org', 'repo', 'sha', 'main');
  results.push({
    key: 'policy',
    ...summarize(
      'Policy Evaluation',
      await measure(() => policyEngineService.evaluate(findings, policy), { iterations, warmup }),
    ),
  });

  // Budgets
  const violations = results
    .filter((r) => budgets[r.key] !== undefined && r.p95 > budgets[r.key])
    .map((r) => ({ benchmark: r.name, p95: r.p95, budget: budgets[r.key] }));

  if (!jsonOnly) for (const r of results) printSummary(r, budgets[r.key]);

  const report = {
    timestamp: new Date().toISOString(),
    environment: {
      node: process.version,
      platform: os.platform(),
      arch: os.arch(),
      cpu: os.cpus()[0]?.model ?? null,
    },
    config: { iterations, warmup, input: path.relative(ROOT, inputPath), budgets },
    results,
    violations,
    passed: violations.length === 0,
  };

  if (args.out) {
    const outPath = path.resolve(ROOT, String(args.out));
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(report, null, 2) + '\n');
    log(`\nReport written to ${path.relative(ROOT, outPath)}`);
  }
  if (jsonOnly) console.log(JSON.stringify(report, null, 2));

  if (violations.length) {
    for (const v of violations) {
      console.error(`✖ ${v.benchmark}: p95 ${fmt(v.p95)} exceeds budget ${fmt(v.budget)}`);
    }
    log('\n=== BENCHMARK FAILED (budget exceeded) ===');
    return 1;
  }
  log('\n=== BENCHMARK COMPLETE ===');
  return 0;
}

main()
  .then((code) => {
    process.exitCode = code;
  })
  .catch((err) => {
    if (err instanceof UsageError || err instanceof PrerequisiteError) {
      console.error(`[benchmark] ${err.message}`);
      process.exitCode = 2;
      return;
    }
    console.error('[benchmark] Unexpected failure:', err);
    process.exitCode = 1;
  });
