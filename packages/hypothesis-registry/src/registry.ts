/**
 * Hypothesis Registry
 * 
 * Stores and manages hypotheses with strict epistemic discipline:
 * - Hypotheses never become Facts
 * - Tracks tested/untested status
 * - Tracks falsified/weak/supported status
 * - Integrates with replay and calibration
 */

import type { 
  UUID, 
  ProvenancePointer,
  ConfidenceBand 
} from "@zeo/contracts";

// =============================================================================
// TYPES
// =============================================================================

export type HypothesisSource = 
  | "analytics"
  | "ai_proposal"
  | "user_note"
  | "literature"
  | "expert_judgment";

export type HypothesisStatus = 
  | "untested"
  | "under_test"
  | "weakly_supported"
  | "moderately_supported"
  | "strongly_supported"
  | "falsified"
  | "inconclusive";

export type HypothesisDomain = 
  | "causal"
  | "correlational"
  | "predictive"
  | "descriptive";

export interface HypothesisEvidence {
  evidenceId: string;
  testId: string;
  timestamp: string;
  result: "supporting" | "contradicting" | "neutral";
  strength: number; // 0-1
  provenance: ProvenancePointer[];
  notes: string[];
}

export interface HypothesisTest {
  testId: string;
  hypothesisId: string;
  timestamp: string;
  testType: string;
  description: string;
  controls: string[];
  result?: {
    outcome: "passed" | "failed" | "inconclusive";
    pValue?: number;
    effectSize?: number;
    confidenceInterval?: { low: number; high: number };
  };
  limitations: string[];
  provenance: ProvenancePointer[];
}

export interface Hypothesis {
  id: UUID;
  createdAt: string;
  updatedAt: string;
  source: HypothesisSource;
  domain: HypothesisDomain;
  
  statement: string;
  variables: string[];
  direction: "positive" | "negative" | "non_linear" | "unspecified";
  
  status: HypothesisStatus;
  confidenceBand: ConfidenceBand;
  
  tests: HypothesisTest[];
  evidence: HypothesisEvidence[];
  
  epistemicWarnings: string[];
  neverBecomesFact: true; // Enforced constraint
  
  tags: string[];
  decisionIds: string[]; // Links to decisions using this hypothesis
  provenance: ProvenancePointer[];
}

export interface HypothesisRegistry {
  id: UUID;
  createdAt: string;
  updatedAt: string;
  hypotheses: Map<string, Hypothesis>;
  
  // Index for efficient queries
  byStatus: Map<HypothesisStatus, string[]>;
  bySource: Map<HypothesisSource, string[]>;
  byDomain: Map<HypothesisDomain, string[]>;
  byDecision: Map<string, string[]>;
  byTag: Map<string, string[]>;
}

export interface RegistryQuery {
  status?: HypothesisStatus[];
  source?: HypothesisSource[];
  domain?: HypothesisDomain[];
  decisionId?: string;
  tag?: string;
  minConfidence?: ConfidenceBand;
  untestedOnly?: boolean;
}

export interface RegistryStats {
  total: number;
  byStatus: Record<HypothesisStatus, number>;
  bySource: Record<HypothesisSource, number>;
  byDomain: Record<HypothesisDomain, number>;
  untestedCount: number;
  testedCount: number;
  falsifiedCount: number;
  supportedCount: number;
}

// =============================================================================
// REGISTRY FACTORY
// =============================================================================

export function createRegistry(): HypothesisRegistry {
  const now = new Date().toISOString();
  
  return {
    id: generateUUID(),
    createdAt: now,
    updatedAt: now,
    hypotheses: new Map(),
    byStatus: new Map(),
    bySource: new Map(),
    byDomain: new Map(),
    byDecision: new Map(),
    byTag: new Map()
  };
}

// =============================================================================
// HYPOTHESIS OPERATIONS
// =============================================================================

export function addHypothesis(
  registry: HypothesisRegistry,
  params: {
    source: HypothesisSource;
    domain: HypothesisDomain;
    statement: string;
    variables: string[];
    direction?: Hypothesis["direction"];
    tags?: string[];
    decisionIds?: string[];
    provenance?: ProvenancePointer[];
  }
): Hypothesis {
  const now = new Date().toISOString();
  
  const hypothesis: Hypothesis = {
    id: generateUUID(),
    createdAt: now,
    updatedAt: now,
    source: params.source,
    domain: params.domain,
    statement: params.statement,
    variables: params.variables,
    direction: params.direction ?? "unspecified",
    status: "untested",
    confidenceBand: "low",
    tests: [],
    evidence: [],
    epistemicWarnings: generateEpistemicWarnings(params.domain, params.source),
    neverBecomesFact: true,
    tags: params.tags ?? [],
    decisionIds: params.decisionIds ?? [],
    provenance: params.provenance ?? []
  };
  
  // Store in registry
  registry.hypotheses.set(hypothesis.id, hypothesis);
  
  // Update indices
  addToIndex(registry.byStatus, hypothesis.status, hypothesis.id);
  addToIndex(registry.bySource, hypothesis.source, hypothesis.id);
  addToIndex(registry.byDomain, hypothesis.domain, hypothesis.id);
  
  for (const decisionId of hypothesis.decisionIds) {
    addToIndex(registry.byDecision, decisionId, hypothesis.id);
  }
  
  for (const tag of hypothesis.tags) {
    addToIndex(registry.byTag, tag, hypothesis.id);
  }
  
  registry.updatedAt = now;
  
  return hypothesis;
}

export function recordTest(
  registry: HypothesisRegistry,
  hypothesisId: string,
  test: Omit<HypothesisTest, "testId" | "hypothesisId">
): HypothesisTest {
  const hypothesis = registry.hypotheses.get(hypothesisId);
  if (!hypothesis) {
    throw new Error(`Hypothesis ${hypothesisId} not found`);
  }
  
  const newTest: HypothesisTest = {
    testId: generateUUID(),
    hypothesisId,
    ...test
  };
  
  hypothesis.tests.push(newTest);
  hypothesis.updatedAt = new Date().toISOString();
  
  // Update status based on test result
  if (test.result) {
    updateHypothesisStatus(hypothesis, test.result);
    
    // Update index
    rebuildStatusIndex(registry);
  }
  
  registry.updatedAt = hypothesis.updatedAt;
  
  return newTest;
}

export function addEvidence(
  registry: HypothesisRegistry,
  hypothesisId: string,
  evidence: Omit<HypothesisEvidence, "evidenceId">
): void {
  const hypothesis = registry.hypotheses.get(hypothesisId);
  if (!hypothesis) {
    throw new Error(`Hypothesis ${hypothesisId} not found`);
  }
  
  const newEvidence: HypothesisEvidence = {
    evidenceId: generateUUID(),
    ...evidence
  };
  
  hypothesis.evidence.push(newEvidence);
  hypothesis.updatedAt = new Date().toISOString();
  registry.updatedAt = hypothesis.updatedAt;
}

export function linkToDecision(
  registry: HypothesisRegistry,
  hypothesisId: string,
  decisionId: string
): void {
  const hypothesis = registry.hypotheses.get(hypothesisId);
  if (!hypothesis) {
    throw new Error(`Hypothesis ${hypothesisId} not found`);
  }
  
  if (!hypothesis.decisionIds.includes(decisionId)) {
    hypothesis.decisionIds.push(decisionId);
    addToIndex(registry.byDecision, decisionId, hypothesisId);
    hypothesis.updatedAt = new Date().toISOString();
    registry.updatedAt = hypothesis.updatedAt;
  }
}

// =============================================================================
// QUERY OPERATIONS
// =============================================================================

export function queryHypotheses(
  registry: HypothesisRegistry,
  query: RegistryQuery
): Hypothesis[] {
  let ids: string[] | null = null;
  
  // Start with status filter if provided
  if (query.status && query.status.length > 0) {
    const statusIds = query.status.flatMap(s => registry.byStatus.get(s) ?? []);
    ids = ids ? intersect(ids, statusIds) : statusIds;
  }
  
  // Source filter
  if (query.source && query.source.length > 0) {
    const sourceIds = query.source.flatMap(s => registry.bySource.get(s) ?? []);
    ids = ids ? intersect(ids, sourceIds) : sourceIds;
  }
  
  // Domain filter
  if (query.domain && query.domain.length > 0) {
    const domainIds = query.domain.flatMap(d => registry.byDomain.get(d) ?? []);
    ids = ids ? intersect(ids, domainIds) : domainIds;
  }
  
  // Decision filter
  if (query.decisionId) {
    const decisionIds = registry.byDecision.get(query.decisionId) ?? [];
    ids = ids ? intersect(ids, decisionIds) : decisionIds;
  }
  
  // Tag filter
  if (query.tag) {
    const tagIds = registry.byTag.get(query.tag) ?? [];
    ids = ids ? intersect(ids, tagIds) : tagIds;
  }
  
  // Get hypotheses
  const candidates = ids 
    ? ids.map(id => registry.hypotheses.get(id)).filter((h): h is Hypothesis => h !== undefined)
    : Array.from(registry.hypotheses.values());
  
  // Untested filter
  if (query.untestedOnly) {
    return candidates.filter(h => h.status === "untested");
  }
  
  // Confidence filter
  if (query.minConfidence) {
    const confidenceOrder = ["low", "medium", "high"] as ConfidenceBand[];
    const minIdx = confidenceOrder.indexOf(query.minConfidence);
    return candidates.filter(h => confidenceOrder.indexOf(h.confidenceBand) >= minIdx);
  }
  
  return candidates;
}

export function getRegistryStats(registry: HypothesisRegistry): RegistryStats {
  const hypotheses = Array.from(registry.hypotheses.values());
  
  const byStatus = {
    untested: 0,
    under_test: 0,
    weakly_supported: 0,
    moderately_supported: 0,
    strongly_supported: 0,
    falsified: 0,
    inconclusive: 0
  } as Record<HypothesisStatus, number>;
  
  const bySource = {
    analytics: 0,
    ai_proposal: 0,
    user_note: 0,
    literature: 0,
    expert_judgment: 0
  } as Record<HypothesisSource, number>;
  
  const byDomain = {
    causal: 0,
    correlational: 0,
    predictive: 0,
    descriptive: 0
  } as Record<HypothesisDomain, number>;
  
  for (const h of hypotheses) {
    byStatus[h.status]++;
    bySource[h.source]++;
    byDomain[h.domain]++;
  }
  
  return {
    total: hypotheses.length,
    byStatus,
    bySource,
    byDomain,
    untestedCount: byStatus.untested,
    testedCount: hypotheses.length - byStatus.untested,
    falsifiedCount: byStatus.falsified,
    supportedCount: byStatus.strongly_supported + byStatus.moderately_supported
  };
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function generateEpistemicWarnings(
  domain: HypothesisDomain,
  source: HypothesisSource
): string[] {
  const warnings: string[] = [];
  
  warnings.push("This is a hypothesis, not a fact.");
  warnings.push("Hypotheses can be supported or falsified by evidence, but never proven true.");
  
  if (domain === "causal") {
    warnings.push("Causal claims require strong experimental or quasi-experimental evidence.");
    warnings.push("Observational data alone cannot establish causation.");
  }
  
  if (domain === "correlational") {
    warnings.push("Correlation does not imply causation.");
    warnings.push("Third variables may explain observed associations.");
  }
  
  if (source === "ai_proposal") {
    warnings.push("AI-proposed hypothesis requires human validation.");
    warnings.push("Check for spurious patterns and data leakage.");
  }
  
  return warnings;
}

function updateHypothesisStatus(
  hypothesis: Hypothesis,
  result: NonNullable<HypothesisTest["result"]>
): void {
  if (result.outcome === "failed") {
    hypothesis.status = "falsified";
    hypothesis.confidenceBand = "low";
  } else if (result.outcome === "passed") {
    // Update based on strength and existing evidence
    const supportingEvidence = hypothesis.evidence.filter(e => e.result === "supporting").length;
    
    if (supportingEvidence >= 3 && (result.pValue ?? 1) < 0.01) {
      hypothesis.status = "strongly_supported";
      hypothesis.confidenceBand = "high";
    } else if (supportingEvidence >= 1 && (result.pValue ?? 1) < 0.05) {
      hypothesis.status = "moderately_supported";
      hypothesis.confidenceBand = "medium";
    } else {
      hypothesis.status = "weakly_supported";
      hypothesis.confidenceBand = "low";
    }
  } else {
    hypothesis.status = "inconclusive";
  }
}

function addToIndex(
  index: Map<string, string[]>,
  key: string,
  value: string
): void {
  const existing = index.get(key) ?? [];
  if (!existing.includes(value)) {
    index.set(key, [...existing, value]);
  }
}

function rebuildStatusIndex(registry: HypothesisRegistry): void {
  registry.byStatus.clear();
  for (const [id, hypothesis] of registry.hypotheses) {
    addToIndex(registry.byStatus, hypothesis.status, id);
  }
}

function intersect<T>(a: T[], b: T[]): T[] {
  const setB = new Set(b);
  return a.filter(x => setB.has(x));
}

function generateUUID(): UUID {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// =============================================================================
// REPLAY INTEGRATION
// =============================================================================

export interface ReplayIntegration {
  getHypothesesForDecision(decisionId: string): Hypothesis[];
  getHypothesisHistory(hypothesisId: string): {
    tests: HypothesisTest[];
    evidence: HypothesisEvidence[];
    statusChanges: { timestamp: string; from: HypothesisStatus; to: HypothesisStatus }[];
  };
}

export function createReplayIntegration(registry: HypothesisRegistry): ReplayIntegration {
  return {
    getHypothesesForDecision(decisionId: string): Hypothesis[] {
      const ids = registry.byDecision.get(decisionId) ?? [];
      return ids
        .map(id => registry.hypotheses.get(id))
        .filter((h): h is Hypothesis => h !== undefined);
    },
    
    getHypothesisHistory(hypothesisId: string) {
      const hypothesis = registry.hypotheses.get(hypothesisId);
      if (!hypothesis) {
        throw new Error(`Hypothesis ${hypothesisId} not found`);
      }
      
      // Reconstruct status changes from tests
      const statusChanges: { timestamp: string; from: HypothesisStatus; to: HypothesisStatus }[] = [];
      let currentStatus: HypothesisStatus = "untested";
      
      for (const test of hypothesis.tests) {
        if (test.result) {
          const newStatus = inferStatusFromResult(test.result);
          if (newStatus !== currentStatus) {
            statusChanges.push({
              timestamp: test.timestamp,
              from: currentStatus,
              to: newStatus
            });
            currentStatus = newStatus;
          }
        }
      }
      
      return {
        tests: hypothesis.tests,
        evidence: hypothesis.evidence,
        statusChanges
      };
    }
  };
}

function inferStatusFromResult(
  result: NonNullable<HypothesisTest["result"]>
): HypothesisStatus {
  if (result.outcome === "failed") return "falsified";
  if (result.outcome === "passed") return "weakly_supported";
  return "inconclusive";
}
