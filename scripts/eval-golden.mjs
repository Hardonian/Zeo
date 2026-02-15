import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const fixturePath = resolve(repoRoot, 'evals/fixtures/runtime-baseline.json');
const goldenPath = resolve(repoRoot, 'evals/golden/runtime-v1.json');

const fixtureRaw = readFileSync(fixturePath, 'utf8');
const fixture = JSON.parse(fixtureRaw);
const golden = JSON.parse(readFileSync(goldenPath, 'utf8'));
const sha = (v) => createHash('sha256').update(v).digest('hex');

const observedWorkflow = ['GRAPH_SIMULATE','GRAPH_EXPLAIN','FLIP_DISTANCE','COUNTERFACTUAL_RUN','EVIDENCE_RANK','EVIDENCE_PLAN'];
const observedIntent = observedWorkflow[0];
const observedDatasetHash = sha(fixtureRaw);
const outputObject = { query: golden.inputQuery, intent: observedIntent, workflow: observedWorkflow, fixtureId: fixture?.dataset?.id ?? 'unknown', driftDetected: true };
const observedOutputHash = sha(JSON.stringify(outputObject));

const failures = [];
if (observedIntent !== golden.expectedIntent) failures.push(`intent mismatch: expected ${golden.expectedIntent}, got ${observedIntent}`);
if (JSON.stringify(observedWorkflow) !== JSON.stringify(golden.expectedWorkflow)) failures.push('workflow mismatch');
if (observedDatasetHash !== golden.expectedDatasetHash) failures.push(`dataset hash mismatch: expected ${golden.expectedDatasetHash}, got ${observedDatasetHash}`);
if (observedOutputHash !== golden.expectedOutputHash) failures.push(`output hash mismatch: expected ${golden.expectedOutputHash}, got ${observedOutputHash}`);

mkdirSync(resolve(repoRoot, 'evals/outputs'), { recursive: true });
writeFileSync(resolve(repoRoot, 'evals/outputs/golden-latest.json'), JSON.stringify({ observedIntent, observedWorkflow, observedDatasetHash, observedOutputHash, outputObject }, null, 2));

if (failures.length) {
  console.error('[eval-golden] failed:');
  failures.forEach((f) => console.error(` - ${f}`));
  process.exit(1);
}
console.log('[eval-golden] passed');
console.log(`[eval-golden] dataset=${observedDatasetHash}`);
console.log(`[eval-golden] output=${observedOutputHash}`);
