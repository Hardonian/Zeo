/**
 * @zeo/governance
 * 
 * Governance and risk tier evaluation for Zeo decisions.
 * Implements risk-aware decision making with tiered requirements.
 */

import { nanoid } from "nanoid";
import type {
  RiskTier,
  DecisionRiskProfile,
  AuditEntry,
  PolicyConfig,
  DecisionSpec,
  EvidenceEvent,
  EvidenceEventType,
  BranchGraph,
  BranchEdge,
  BranchNode
} from "@zeo/contracts";

// =============================================================================
// TYPES
// =============================================================================

export type { RiskTier, DecisionRiskProfile, AuditEntry, PolicyConfig };

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Default governance configuration
 */
export const GOVERNANCE_DEFAULTS = {
  /** Minimum evidence count for informational tier */
  informationalEvidenceMin: 0,
  /** Minimum evidence count for operational tier */
  operationalEvidenceMin: 1,
  /** Minimum evidence count for strategic tier */
  strategicEvidenceMin: 3,
  /** Minimum evidence count for existential tier */
  existentialEvidenceMin: 5,
  /** Cooling off period in minutes for strategic tier */
  strategicCoolingOffMinutes: 60,
  /** Cooling off period in minutes for existential tier */
  existentialCoolingOffMinutes: 1440,
  /** Whether strategic tier requires user confirmation */
  strategicRequiresConfirm: true,
  /** Whether existential tier requires user confirmation */
  existentialRequiresConfirm: true,
} as const;

/**
 * Risk tier configuration mapping
 */
export const RISK_TIER_CONFIG: Record<RiskTier, {
  evidenceThreshold: number;
  coolingOffMinutes: number;
  requiresConfirm: boolean;
  forbiddenDomains: string[];
}> = {
  informational: {
    evidenceThreshold: GOVERNANCE_DEFAULTS.informationalEvidenceMin,
    coolingOffMinutes: 0,
    requiresConfirm: false,
    forbiddenDomains: []
  },
  operational: {
    evidenceThreshold: GOVERNANCE_DEFAULTS.operationalEvidenceMin,
    coolingOffMinutes: 5,
    requiresConfirm: false,
    forbiddenDomains: []
  },
  strategic: {
    evidenceThreshold: GOVERNANCE_DEFAULTS.strategicEvidenceMin,
    coolingOffMinutes: GOVERNANCE_DEFAULTS.strategicCoolingOffMinutes,
    requiresConfirm: GOVERNANCE_DEFAULTS.strategicRequiresConfirm,
    forbiddenDomains: ["medical", "legal", "financial_regulated"]
  },
  existential: {
    evidenceThreshold: GOVERNANCE_DEFAULTS.existentialEvidenceMin,
    coolingOffMinutes: GOVERNANCE_DEFAULTS.existentialCoolingOffMinutes,
    requiresConfirm: GOVERNANCE_DEFAULTS.existentialRequiresConfirm,
    forbiddenDomains: ["medical", "legal", "financial_regulated", "safety_critical"]
  }
};

/**
 * Domain to risk tier mapping for common decision domains
 */
export const DOMAIN_RISK_MATRIX: Record<string, RiskTier> = {
  // Low risk - informational
  research: "informational",
  analysis: "informational",
  monitoring: "informational",
  
  // Medium risk - operational
  ops: "operational",
  incident_response: "operational",
  communication: "operational",
  scheduling: "operational",
  
  // High risk - strategic
  negotiation: "strategic",
  partnership: "strategic",
  procurement: "strategic",
  hiring: "strategic",
  budgeting: "strategic",
  
  // Very high risk - existential
  legal: "existential",
  medical: "existential",
  safety_critical: "existential",
  financial_regulated: "existential"
} as const;

// =============================================================================
// CORE FUNCTIONS
// =============================================================================

/**
 * Extract domain from decision spec (based on title/context keywords)
 * Checks higher-risk domains first for proper prioritization
 */
function extractDomain(decisionSpec: DecisionSpec): string {
  const titleLower = decisionSpec.title?.toLowerCase() || "";
  const contextLower = decisionSpec.context?.toLowerCase() || "";
  const fullText = `${titleLower} ${contextLower}`;
  
  // Get entries in reverse order so higher-risk domains (defined later) are checked first
  const entries = Object.entries(DOMAIN_RISK_MATRIX).reverse();
  
  // Check for domain keywords - existential first, then strategic, operational, informational
  for (const [keyword, tier] of entries) {
    if (fullText.includes(keyword)) {
      return keyword;
    }
  }
  
  return "general";
}

/**
 * Evaluate the risk tier for a decision based on its characteristics
 */
export function evaluateRiskTier(
  decisionSpec: DecisionSpec,
  evidenceCount: number = 0
): DecisionRiskProfile {
  // Determine domain-based risk
  const domain = extractDomain(decisionSpec);
  let inferredTier = DOMAIN_RISK_MATRIX[domain] || "informational";
  
  // Adjust tier based on decision characteristics
  const agentCount = decisionSpec.agents?.length || 1;
  const actionCount = decisionSpec.actions?.length || 0;
  
  // Escalate tier based on complexity
  if (agentCount > 3 || actionCount > 5) {
    if (inferredTier === "informational") {
      inferredTier = "operational";
    }
  }
  
  // Check for high-stakes keywords
  const titleLower = decisionSpec.title?.toLowerCase() || "";
  const contextLower = decisionSpec.context?.toLowerCase() || "";
  const fullContext = `${titleLower} ${contextLower}`;
  
  const existentialKeywords = ["legal", "medical", "safety", "regulatory", "compliance", "fire", "emergency"];
  const strategicKeywords = ["partnership", "contract", "investment", "acquisition", "strategic", "major"];
  
  if (existentialKeywords.some(kw => fullContext.includes(kw))) {
    inferredTier = "existential";
  } else if (strategicKeywords.some(kw => fullContext.includes(kw)) && inferredTier !== "existential") {
    inferredTier = "strategic";
  }
  
  // Get tier configuration
  const config = RISK_TIER_CONFIG[inferredTier];
  
  // Determine if evidence threshold is met
  const evidenceMin = Math.max(config.evidenceThreshold, evidenceCount);
  
  return {
    tier: inferredTier,
    requiredEvidenceMin: evidenceMin,
    requiredCoolingOffMinutes: config.coolingOffMinutes,
    requiresUserConfirm: config.requiresConfirm,
    forbiddenDomains: config.forbiddenDomains
  };
}

/**
 * Evaluate risk based on evidence quality and completeness
 */
export function evaluateEvidenceRisk(
  evidenceEvents: EvidenceEvent[],
  requiredMin: number
): {
  meetsThreshold: boolean;
  riskLevel: "low" | "medium" | "high";
  gaps: string[];
} {
  const evidenceCount = evidenceEvents.length;
  const gaps: string[] = [];
  
  // Check quantity threshold
  if (evidenceCount < requiredMin) {
    gaps.push(`Insufficient evidence: ${evidenceCount}/${requiredMin} required`);
  }
  
  // Check for evidence variety
  const sourceTypes = new Set<EvidenceEventType>(evidenceEvents.map(e => e.type));
  const hasDocument = sourceTypes.has("document");
  const hasText = sourceTypes.has("text");
  
  if (!hasDocument && !hasText) {
    gaps.push("Missing document or text evidence");
  }
  
  // Check for recent evidence
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const recentEvidence = evidenceEvents.filter(e => {
    const date = new Date(e.capturedAt);
    return date > oneWeekAgo;
  });
  
  if (recentEvidence.length === 0 && evidenceCount > 0) {
    gaps.push("No recent evidence (past week)");
  }
  
  // Determine risk level
  let riskLevel: "low" | "medium" | "high" = "low";
  
  if (gaps.length >= 2) {
    riskLevel = "high";
  } else if (gaps.length === 1) {
    riskLevel = "medium";
  }
  
  return {
    meetsThreshold: gaps.length === 0,
    riskLevel,
    gaps
  };
}

/**
 * Create an audit entry for tracking governance decisions
 */
export function createAuditEntry(params: {
  actor: AuditEntry["actor"];
  action: string;
  inputHash: string;
  outputHash?: string;
  decisionId?: string;
  draftId?: string;
  runId?: string;
  provenanceRefs?: string[];
  notes?: string[];
}): AuditEntry {
  const entry: AuditEntry = {
    id: nanoid(),
    createdAt: new Date().toISOString(),
    actor: params.actor,
    action: params.action,
    inputHash: params.inputHash,
    outputHash: params.outputHash || "",
    provenanceRefs: params.provenanceRefs || [],
    notes: params.notes || []
  };
  
  // Only add optional properties if they have values
  if (params.decisionId) {
    entry.decisionId = params.decisionId;
  }
  if (params.draftId) {
    entry.draftId = params.draftId;
  }
  if (params.runId) {
    entry.runId = params.runId;
  }
  
  return entry;
}

/**
 * Validate a policy configuration
 */
export function validatePolicyConfig(config: PolicyConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Check required fields
  if (!config.id || typeof config.id !== "string") {
    errors.push("Policy ID is required");
  }
  
  if (!config.version || typeof config.version !== "string") {
    errors.push("Policy version is required");
  }
  
  // Check domain lists don't overlap
  const overlap = config.domainAllowlist.filter(
    domain => config.domainDenylist.includes(domain)
  );
  if (overlap.length > 0) {
    errors.push(`Domains in both allowlist and denylist: ${overlap.join(", ")}`);
  }
  
  // Check inference type lists don't overlap
  const infOverlap = config.inferenceTypeAllowlist.filter(
    type => config.inferenceTypeDenylist.includes(type)
  );
  if (infOverlap.length > 0) {
    errors.push(`Inference types in both allowlist and denylist: ${infOverlap.join(", ")}`);
  }
  
  // Check timestamps
  const createdAt = new Date(config.createdAt);
  const updatedAt = new Date(config.updatedAt);
  
  if (isNaN(createdAt.getTime())) {
    errors.push("Invalid createdAt timestamp");
  }
  
  if (isNaN(updatedAt.getTime())) {
    errors.push("Invalid updatedAt timestamp");
  }
  
  if (!isNaN(createdAt.getTime()) && !isNaN(updatedAt.getTime()) && updatedAt < createdAt) {
    errors.push("updatedAt must be after createdAt");
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Apply governance rules to a decision
 */
export function applyGovernanceRules(params: {
  decisionSpec: DecisionSpec;
  evidenceEvents: EvidenceEvent[];
  branchGraph?: BranchGraph;
  policyConfig?: PolicyConfig;
}): {
  riskProfile: DecisionRiskProfile;
  auditEntry: AuditEntry;
  warnings: string[];
  approved: boolean;
} {
  const { decisionSpec, evidenceEvents, branchGraph, policyConfig } = params;
  
  // Evaluate risk tier
  const riskProfile = evaluateRiskTier(decisionSpec, evidenceEvents.length);
  
  // Evaluate evidence against requirements
  const evidenceRisk = evaluateEvidenceRisk(
    evidenceEvents,
    riskProfile.requiredEvidenceMin
  );
  
  // Check against policy config if provided
  const policyWarnings: string[] = [];
  let policyApproved = true;
  
  if (policyConfig) {
    // Validate policy first
    const policyValidation = validatePolicyConfig(policyConfig);
    if (!policyValidation.valid) {
      policyWarnings.push(`Invalid policy config: ${policyValidation.errors.join(", ")}`);
      policyApproved = false;
    } else {
      // Check domain allowlist/denylist
      const domain = extractDomain(decisionSpec);
      
      if (policyConfig.domainDenylist.length > 0 && 
          policyConfig.domainDenylist.includes(domain)) {
        policyWarnings.push(`Domain "${domain}" is in policy denylist`);
        policyApproved = false;
      }
      
      if (policyConfig.domainAllowlist.length > 0 && 
          !policyConfig.domainAllowlist.includes(domain)) {
        policyWarnings.push(`Domain "${domain}" is not in policy allowlist`);
        // This is a warning, not a blocker
      }
      
      // Check forbidden domains from profile
      if (riskProfile.forbiddenDomains) {
        for (const forbiddenDomain of riskProfile.forbiddenDomains) {
          if (policyConfig.forbiddenScopes.includes(forbiddenDomain)) {
            policyWarnings.push(`Decision involves forbidden scope: ${forbiddenDomain}`);
            policyApproved = false;
          }
        }
      }
    }
  }
  
  // Check branch graph for risky patterns
  const branchWarnings: string[] = [];
  if (branchGraph) {
    // Check for deep branching (more than 3 levels)
    const maxDepth = calculateMaxDepth(branchGraph);
    if (maxDepth > 3 && riskProfile.tier === "informational") {
      branchWarnings.push("Deep branching detected in informational decision");
    }
    
    // Check for many dependencies
    const dependencyCount = countDependencies(branchGraph);
    if (dependencyCount > 10 && riskProfile.tier === "informational") {
      branchWarnings.push("High dependency count in informational decision");
    }
  }
  
  // Compile warnings
  const warnings = [
    ...evidenceRisk.gaps,
    ...policyWarnings,
    ...branchWarnings
  ];
  
  // Determine if decision is approved
  const approved = evidenceRisk.meetsThreshold && policyApproved;
  
  // Create audit entry
  const auditEntry = createAuditEntry({
    actor: "system",
    action: "governance_review",
    inputHash: hashDecisionSpec(decisionSpec),
    provenanceRefs: evidenceEvents.map(e => e.id),
    notes: [
      `Risk tier: ${riskProfile.tier}`,
      `Evidence gaps: ${evidenceRisk.gaps.length}`,
      `Approved: ${approved}`,
      ...warnings.map(w => `Warning: ${w}`)
    ]
  });
  
  return {
    riskProfile,
    auditEntry,
    warnings,
    approved
  };
}

/**
 * Get the default risk profile for a given tier
 */
export function getDefaultRiskProfile(tier: RiskTier): DecisionRiskProfile {
  const config = RISK_TIER_CONFIG[tier];
  
  return {
    tier,
    requiredEvidenceMin: config.evidenceThreshold,
    requiredCoolingOffMinutes: config.coolingOffMinutes,
    requiresUserConfirm: config.requiresConfirm,
    forbiddenDomains: config.forbiddenDomains
  };
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function calculateMaxDepth(branchGraph: BranchGraph): number {
  if (!branchGraph.nodes || branchGraph.nodes.length === 0) {
    return 0;
  }
  
  let maxDepth = 0;
  
  for (const node of branchGraph.nodes) {
    const depth = calculateNodeDepth(node.id, branchGraph);
    maxDepth = Math.max(maxDepth, depth);
  }
  
  return maxDepth;
}

function calculateNodeDepth(
  nodeId: string, 
  branchGraph: BranchGraph, 
  visited: Set<string> = new Set()
): number {
  if (visited.has(nodeId)) {
    return 0;
  }
  
  visited.add(nodeId);
  
  // Find incoming edges (using 'from' as per BranchEdge type)
  const incomingEdges = branchGraph.edges?.filter(
    (edge: BranchEdge) => edge.to === nodeId
  ) || [];
  
  if (incomingEdges.length === 0) {
    return 1; // Root node
  }
  
  const maxIncomingDepth = Math.max(
    ...incomingEdges.map((edge: BranchEdge) => 
      calculateNodeDepth(edge.from, branchGraph, new Set(visited))
    ),
    0
  );
  
  return maxIncomingDepth + 1;
}

function countDependencies(branchGraph: BranchGraph): number {
  return branchGraph.edges?.length || 0;
}

function hashDecisionSpec(decisionSpec: DecisionSpec): string {
  // Simple hash for audit purposes
  const str = JSON.stringify(decisionSpec);
  let hash = 0;
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return Math.abs(hash).toString(16).padStart(8, "0");
}
