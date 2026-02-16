import { createHash } from 'node:crypto';
import { writeFileSync, readFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type { DecisionSpec, DecisionResult, Action, Claim } from '@zeo/contracts';

export interface DecisionArtifact {
  decision_id: string; // hash of normalized inputs + model config
  input_hash: string;
  model_parameters: {
    depth: number;
    useQuantEngine?: boolean;
    seed?: string;
    [key: string]: any;
  };
  seed?: string;
  timestamp: string;
  execution_duration_ms: number;
  assumptions: Array<{ id: string; text: string; status: string }>;
  reasoning_summary: string;
  flip_distance_summary: Array<{ assumption_id: string; distance: string; boundary: string }>;
  confidence_band: { lower: string; upper: string; method: string };
  sensitivity_summary: string; // what variable shifts change outcome
}

function sha256(data: string): string {
  return createHash('sha256').update(data).digest('hex');
}

/**
 * Normalizes input for hashing.
 */
function normalizeInput(spec: DecisionSpec, params: any): string {
  return JSON.stringify({
    title: spec.title,
    context: spec.context,
    actions: spec.actions.map((a: Action) => ({ id: a.id, label: a.label, kind: a.kind })),
    assumptions: spec.assumptions.map((a: Claim) => ({ id: a.id, text: a.text })),
    constraints: spec.constraints.map((c: any) => ({ id: c.id, name: c.name, value: c.value })),
    params
  });
}

export function createDecisionArtifact(
  spec: DecisionSpec,
  result: DecisionResult,
  params: any,
  durationMs: number
): DecisionArtifact {
  const normalized = normalizeInput(spec, params);
  const inputHash = sha256(normalized);
  const decisionId = inputHash.slice(0, 16);

  return {
    decision_id: decisionId,
    input_hash: inputHash,
    model_parameters: params,
    seed: params.seed,
    timestamp: new Date().toISOString(),
    execution_duration_ms: durationMs,
    assumptions: spec.assumptions.map((a: Claim) => ({ id: a.id, text: a.text, status: a.status })),
    reasoning_summary: result.explanation.why.join(' '),
    flip_distance_summary: result.explanation.whatWouldChange.map((change: any, index: number) => ({
      assumption_id: change.assumptionId,
      distance: `${(index + 1).toFixed(4)}`,
      boundary: change.flipCondition,
    })),
    confidence_band: (result as any).outcome?.confidence_bounds || { lower: '0.0000', upper: '1.0000', method: 'unknown' },

    sensitivity_summary: result.explanation.whatWouldChange.length > 0
      ? `Decision sensitive to ${result.explanation.whatWouldChange.length} assumptions.`
      : 'No critical sensitivities identified by current scanners.',
  };
}

export function persistArtifact(artifact: DecisionArtifact, baseDir: string = process.cwd()): string {
  const ledgerDir = join(baseDir, 'data', 'ledger');
  if (!existsSync(ledgerDir)) {
    mkdirSync(ledgerDir, { recursive: true });
  }
  const filePath = join(ledgerDir, `${artifact.decision_id}.json`);
  writeFileSync(filePath, JSON.stringify(artifact, null, 2), 'utf8');
  return filePath;
}

export function loadArtifact(decisionId: string, baseDir: string = process.cwd()): DecisionArtifact | null {
  const filePath = join(baseDir, 'data', 'ledger', `${decisionId}.json`);
  if (!existsSync(filePath)) return null;
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

export function listRecentArtifacts(limit: number = 10, baseDir: string = process.cwd()): DecisionArtifact[] {
  const ledgerDir = join(baseDir, 'data', 'ledger');
  if (!existsSync(ledgerDir)) return [];

  const files = readdirSync(ledgerDir)
    .filter(f => f.endsWith('.json'))
    .map(f => ({
      name: f,
      mtime: statSync(join(ledgerDir, f)).mtime.getTime()
    }))
    .sort((a, b) => b.mtime - a.mtime)
    .slice(0, limit);

  return files.map(f => JSON.parse(readFileSync(join(ledgerDir, f.name), 'utf8')));
}
