import type { DecisionSpec } from '@zeo/contracts';

export { runDecision } from '@zeo/core/client';
export { hashDecisionSpec, computeDeterministicSeed } from '@zeo/kernel';
export { buildEvidencePacket, buildEvidencePacketMarkdown, type RunMeta } from '@zeo/core/client';

export function canonicalizeDecisionSpec(input: DecisionSpec): DecisionSpec {
  return input;
}
