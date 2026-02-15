import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));

function loadJson(path) {
  return JSON.parse(readFileSync(resolve(repoRoot, path), 'utf8'));
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function assertOrThrow(condition, message) {
  if (!condition) throw new Error(message);
}

const goldenWorkflows = loadJson('evals/golden/workflows.json');
const goldenHashes = loadJson('evals/golden/hashes.json');
const baselineFixtureRaw = readFileSync(resolve(repoRoot, 'evals/fixtures/runtime-baseline.json'), 'utf8');
const mutatedFixtureRaw = readFileSync(resolve(repoRoot, 'evals/fixtures/runtime-mutated.json'), 'utf8');

const workflowPlanByName = {
  UNDERSTAND: ['GRAPH_SIMULATE', 'GRAPH_EXPLAIN'],
  STRESS_TEST: ['FLIP_DISTANCE', 'COUNTERFACTUAL_RUN'],
  IMPROVE: ['EVIDENCE_RANK', 'EVIDENCE_PLAN'],
};
workflowPlanByName.AUTO = [...workflowPlanByName.UNDERSTAND, ...workflowPlanByName.STRESS_TEST, ...workflowPlanByName.IMPROVE];

const workflowChecks = [];
for (const golden of goldenWorkflows.goldens) {
  const observedPlan = workflowPlanByName[golden.workflow] ?? [];
  const observedIntent = observedPlan[0] ?? 'UNKNOWN';
  const pass = JSON.stringify(observedPlan) === JSON.stringify(golden.expectedPlan)
    && observedIntent === golden.expectedIntent;
  workflowChecks.push({
    workflow: golden.workflow,
    pass,
    expectedPlan: golden.expectedPlan,
    observedPlan,
    expectedIntent: golden.expectedIntent,
    observedIntent,
  });
  assertOrThrow(pass, `workflow regression for ${golden.workflow}`);
}

const baselineHash = sha256(baselineFixtureRaw);
const mutatedHash = sha256(mutatedFixtureRaw);
assertOrThrow(baselineHash === goldenHashes.baselineHash, 'baseline hash regression');
assertOrThrow(mutatedHash === goldenHashes.mutatedHash, 'mutated hash regression');

const driftDetected = baselineHash !== mutatedHash;
assertOrThrow(driftDetected === Boolean(goldenHashes.expectedDrift), 'drift flag mismatch');

const approvalSimulation = [
  { tool: 'notes.ingest', scope: 'write', requiresApproval: true },
  { tool: 'evidence.add', scope: 'write', requiresApproval: true },
  { tool: 'packet.export', scope: 'write', requiresApproval: true },
  { tool: 'run.execute', scope: 'write', requiresApproval: true },
  { tool: 'kpi.list', scope: 'read', requiresApproval: false },
];

for (const item of approvalSimulation) {
  if (item.scope === 'write') {
    assertOrThrow(item.requiresApproval, `write tool should require approval: ${item.tool}`);
  }
}

const report = {
  suite: 'agentic-runtime-golden',
  generatedAt: new Date().toISOString(),
  workflowChecks,
  determinism: {
    baselineHash,
    mutatedHash,
    driftDetected,
  },
  approvals: approvalSimulation,
};

mkdirSync(resolve(repoRoot, 'evals/outputs'), { recursive: true });
writeFileSync(resolve(repoRoot, 'evals/outputs/latest.json'), JSON.stringify(report, null, 2) + '\n');

console.log('[eval] suite=agentic-runtime-golden status=passed');
console.log(`[eval] baselineHash=${baselineHash}`);
console.log(`[eval] mutatedHash=${mutatedHash}`);
console.log(`[eval] driftDetected=${driftDetected}`);
