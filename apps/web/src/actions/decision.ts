'use server';

import {
  runDecision,
  policyEngine,
  makeNegotiationExample,
  makeOpsExample,
  hashDecisionSpec,
  computeDeterministicSeed
} from '@zeo/core';
import type { PolicyViolation, DecisionResult, DecisionSpec } from '@zeo/contracts';
import { createHash } from 'node:crypto';

function hashDecision(decision: DecisionSpec): string {
  const structural = {
    title: decision.title,
    context: decision.context,
    horizon: decision.horizon,
    agents: decision.agents.map(a => ({ name: a.name, role: a.role })),
    actions: decision.actions.map(a => ({ label: a.label, kind: a.kind })),
    constraints: decision.constraints.map(c => ({ name: c.name, value: c.value, status: c.status })),
    assumptions: decision.assumptions.map(a => ({
      text: a.text,
      status: a.status,
      confidence: a.confidence,
      probability: a.probability,
    })),
  };
  return createHash('sha256').update(JSON.stringify(structural)).digest('hex');
}

function computeRunSeed(decisionHash: string, depth: number): string {
  return createHash('sha256').update(`${decisionHash}:no-observations:${depth}`).digest('hex');
}

export async function hashDecisionAction(spec: DecisionSpec): Promise<{ decisionHash: string, seed: string }> {
    const decisionHash = hashDecision(spec);
    // Default depth 2 for seed computation in context init
    const seed = computeRunSeed(decisionHash, 2);
    return { decisionHash, seed };
}

export async function computeRunSeedAction(decisionHash: string, depth: number): Promise<string> {
    return computeRunSeed(decisionHash, depth);
}

export async function runDecisionAction(spec: DecisionSpec): Promise<DecisionResult> {
  // Simple wrapper around core function
  return runDecision(spec);
}

export async function validatePolicyAction(context: any): Promise<PolicyViolation[]> {
  // Simple wrapper around policy engine
  return policyEngine.validate(context);
}


export interface GeneratedComparisonRun {
  title: string;
  scenario: string;
  result: DecisionResult;
  spec: DecisionSpec;
  hash: string;
  seed: string;
}

export async function generateComparisonRunsAction(depth: 2 | 3 = 2): Promise<[GeneratedComparisonRun, GeneratedComparisonRun]> {
  const spec1 = makeNegotiationExample();
  const spec2 = makeOpsExample();

  const result1 = runDecision(spec1, { depth });
  const result2 = runDecision(spec2, { depth });

  const hash1 = hashDecisionSpec(spec1);
  const hash2 = hashDecisionSpec(spec2);
  const seed1 = computeDeterministicSeed(hash1, undefined, depth);
  const seed2 = computeDeterministicSeed(hash2, undefined, depth);

  return [
    {
      title: spec1.title,
      scenario: 'Negotiation Decision',
      result: result1,
      spec: spec1,
      hash: hash1,
      seed: seed1,
    },
    {
      title: spec2.title,
      scenario: 'Ops Decision',
      result: result2,
      spec: spec2,
      hash: hash2,
      seed: seed2,
    },
  ];
}

export async function exportScenarioPackAction(scenarios: any[], options: any): Promise<string> {
    // Return base64 string of the zip
    const { exportScenarioPack } = await import('@zeo/core');
    const buffer = await exportScenarioPack(scenarios, options);
    return Buffer.from(buffer).toString('base64');
}

export async function buildEvidencePacketAction(options: any): Promise<any> {
    const { buildEvidencePacket, buildEvidencePacketMarkdown } = await import('@zeo/core');
    const packet = buildEvidencePacket(options);
    const markdown = buildEvidencePacketMarkdown(packet);
    return { packet, markdown };
}
