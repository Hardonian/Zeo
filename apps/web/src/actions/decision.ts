'use server';

import {
  runDecision,
  policyEngine,
  type PolicyViolation
} from '@zeo/core';
import type { DecisionResult, DecisionSpec } from '@zeo/contracts';

export async function runDecisionAction(spec: DecisionSpec): Promise<DecisionResult> {
  // Simple wrapper around core function
  return runDecision(spec);
}

export async function validatePolicyAction(context: any): Promise<PolicyViolation[]> {
  // Simple wrapper around policy engine
  return policyEngine.validate(context);
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
