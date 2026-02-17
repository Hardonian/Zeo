/**
 * Client-safe exports from @zeo/core
 *
 * This entry point re-exports the subset of @zeo/core that is safe
 * for browser/client-side usage.
 *
 * Note: Some heavy logic (QuantEngine) is technically reachable but
 * guarded or shimmed in browser builds.
 */

// Logic
export { runDecision, generateBranchGraph, type RunDecisionOpts } from "@zeo/kernel";
export { scenarios, ScenarioLibrary } from "@zeo/kernel";
export { policyEngine } from "./policy.js";

// TODO: Implement actual zip handling for browser
export async function exportScenarioPack(scenarios: any[], options: any): Promise<Uint8Array> {
  throw new Error("Export not implemented in client-safe build yet");
}
export async function importScenarioPack(buffer: Uint8Array): Promise<{ scenarios: any[], manifest: any }> {
  throw new Error("Import not implemented in client-safe build yet");
}

// Hashing & Determinism
export {
  hashDecisionSpec,
  hashAssumptionSet,
  computeTranscriptHash
} from "@zeo/kernel";

export { computeStableHash } from "./transcript.js";

export {
  computeDeterministicSeed,
  computeRunSeed
} from "@zeo/kernel";

export {
  deterministicNow,
  deterministicTimestamp,
  getDeterministicContext,
  withDeterministicMode
} from "@zeo/kernel";

// Packets
export { buildEvidencePacket, buildEvidencePacketMarkdown, type EvidencePacketOptions } from "./packets.js";

// Types
export type {
  RunMeta,
  DecisionSpec,
  DecisionResult,
  Action,
  Agent,
  EvidenceEvent,
  Scenario,
  BranchGraph,
  BranchNode,
  BranchEdge,
  ProbabilityInterval
} from "@zeo/contracts";

// Primitives
export { generateId } from "@zeo/kernel";
export { encodeCanonicalJson } from "@zeo/kernel";
