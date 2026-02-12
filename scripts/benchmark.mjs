/**
 * Zeo Benchmark Suite
 * Performance and latency validation.
 */

import { StaticAnalysisService } from '../packages/analysis/dist/index.js';
import { policyEngineService } from '../packages/policy/dist/index.js';

async function runBenchmarks() {
    console.log('=== Zeo Performance Benchmark ===\n');

    const analysis = new StaticAnalysisService();
    const iterations = 50;

    // 1. Static Analysis Benchmark
    console.log(`[Benchmark] Running ${iterations} static analysis passes...`);
    const diff = fs.readFileSync('scripts/smoke-test.mjs', 'utf8'); // Use a real file as input
    let analysisTimes = [];

    for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        await analysis.analyze('test.mjs', diff);
        analysisTimes.push(performance.now() - start);
    }

    // 2. Policy Evaluation Benchmark
    console.log(`[Benchmark] Running ${iterations} policy evaluations...`);
    const findings = [{ ruleId: 'rule-1', message: 'test', severity: 'medium', line: 1 }];
    const policy = await policyEngineService.loadEffectivePolicy('org', 'repo', 'sha', 'main');
    let evaluationTimes = [];

    for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        policyEngineService.evaluate(findings, policy);
        evaluationTimes.push(performance.now() - start);
    }

    function report(name, times) {
        const sorted = [...times].sort((a, b) => a - b);
        const avg = times.reduce((a, b) => a + b, 0) / times.length;
        const p95 = sorted[Math.floor(sorted.length * 0.95)];
        const min = sorted[0];
        const max = sorted[sorted.length - 1];

        console.log(`\n${name}:`);
        console.log(`  Average: ${avg.toFixed(2)}ms`);
        console.log(`  p95:     ${p95.toFixed(2)}ms`);
        console.log(`  Range:   ${min.toFixed(2)}ms - ${max.toFixed(2)}ms`);
    }

    report('Static Analysis (Founder Rules)', analysisTimes);
    report('Policy Evaluation', evaluationTimes);

    console.log('\n=== BENCHMARK COMPLETE ===');
}

import fs from 'node:fs';
runBenchmarks().catch(console.error);
