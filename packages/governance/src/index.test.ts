import { test, expect, describe } from "vitest";
import {
  evaluateRiskTier,
  evaluateEvidenceRisk,
  createAuditEntry,
  validatePolicyConfig,
  applyGovernanceRules,
  getDefaultRiskProfile,
  GOVERNANCE_DEFAULTS,
  RISK_TIER_CONFIG,
  DOMAIN_RISK_MATRIX,
  type PolicyConfig
} from "./index.js";

// Import types from contracts for reference in helpers
import type { DecisionSpec, EvidenceEvent, BranchGraph, Action, Claim, BranchNode } from "@zeo/contracts/dist/types.js";

type TestAction = {
  id: string;
  label: string;
  actorId: string;
  kind: Action["kind"];
};

type TestClaim = {
  id: string;
  text: string;
  status: Claim["status"];
  confidence: Claim["confidence"];
  tags: string[];
};

type TestBranchNode = {
  id: string;
  label: string;
  kind: BranchNode["kind"];
  notes: string[];
  dependencies: TestClaim[];
};

// Helper to create minimal valid DecisionSpec
function createDecisionSpec(overrides: Partial<DecisionSpec> = {}): DecisionSpec {
  return {
    id: "test-" + Math.random().toString(36).slice(2),
    title: "Test Decision",
    context: "Test context for governance evaluation",
    createdAt: new Date().toISOString(),
    horizon: "days",
    agents: [],
    actions: [],
    constraints: [],
    assumptions: [],
    ...overrides
  };
}

// Helper to create minimal valid EvidenceEvent
function createEvidenceEvent(overrides: Partial<EvidenceEvent> = {}): EvidenceEvent {
  return {
    id: "evidence-" + Math.random().toString(36).slice(2),
    type: "text",
    sourceId: "test-source",
    capturedAt: new Date().toISOString(),
    checksum: "abc123",
    observations: [],
    claims: [],
    constraints: [],
    ...overrides
  };
}

// Helper to create minimal valid BranchGraph
function createBranchGraph(overrides: Partial<BranchGraph> = {}): BranchGraph {
  return {
    id: "graph-" + Math.random().toString(36).slice(2),
    decisionId: "test-decision",
    createdAt: new Date().toISOString(),
    nodes: [],
    edges: [],
    ...overrides
  };
}

describe("governance", () => {
  describe("evaluateRiskTier", () => {
    test("returns informational for research domain", () => {
      const spec = createDecisionSpec({ title: "Market Research Analysis", context: "Analyzing market trends" });
      const result = evaluateRiskTier(spec, 0);
      
      expect(result.tier).toBe("informational");
    });

    test("returns operational for ops domain", () => {
      const spec = createDecisionSpec({ title: "Ops Incident Response", context: "Handling production incident" });
      const result = evaluateRiskTier(spec, 0);
      
      expect(result.tier).toBe("operational");
    });

    test("returns strategic for negotiation domain", () => {
      const spec = createDecisionSpec({ title: "Vendor Negotiation", context: "Negotiating contract terms" });
      const result = evaluateRiskTier(spec, 0);
      
      expect(result.tier).toBe("strategic");
    });

    test("returns existential for legal domain", () => {
      const spec = createDecisionSpec({ title: "Legal Settlement", context: "Settlement agreement review" });
      const result = evaluateRiskTier(spec, 0);
      
      expect(result.tier).toBe("existential");
    });

    test("escalates based on action count", () => {
      const spec = createDecisionSpec({ 
        title: "Simple Analysis", 
        context: "Basic analysis",
        actions: Array(6).fill({ id: "a", label: "Action", actorId: "agent1", kind: "communicate" })
      });
      const result = evaluateRiskTier(spec, 0);
      
      expect(result.tier).toBe("operational"); // Escalated from informational
    });

    test("escalates based on agent count", () => {
      const spec = createDecisionSpec({ 
        title: "Team Analysis", 
        context: "Multi-agent review",
        agents: Array(4).fill({ id: "a", name: "Agent", role: "self" }),
        actions: []
      });
      const result = evaluateRiskTier(spec, 0);
      
      expect(result.tier).toBe("operational"); // Escalated from informational
    });

    test("detects existential keywords", () => {
      const spec = createDecisionSpec({ 
        title: "Emergency Protocol", 
        context: "Safety compliance review required"
      });
      const result = evaluateRiskTier(spec, 0);
      
      expect(result.tier).toBe("existential");
    });

    test("detects strategic keywords", () => {
      const spec = createDecisionSpec({ 
        title: "Partnership Review", 
        context: "Strategic investment analysis"
      });
      const result = evaluateRiskTier(spec, 0);
      
      expect(result.tier).toBe("strategic");
    });

    test("evidence count affects required minimum", () => {
      const spec = createDecisionSpec({ title: "Analysis", context: "Simple analysis" });      
      const result = evaluateRiskTier(spec, 10);
      
      expect(result.requiredEvidenceMin).toBe(10); // Takes max of evidence count and threshold
    });

    test("respects forbidden domains for strategic tier", () => {
      const spec = createDecisionSpec({ title: "Partnership Contract", context: "Strategic partnership" });
      const result = evaluateRiskTier(spec, 0);
      
      expect(result.forbiddenDomains).toContain("medical");
      expect(result.forbiddenDomains).toContain("legal");
    });

    test("respects forbidden domains for existential tier", () => {
      const spec = createDecisionSpec({ title: "Legal Settlement", context: "Legal review" });
      const result = evaluateRiskTier(spec, 0);
      
      expect(result.forbiddenDomains).toContain("medical");
      expect(result.forbiddenDomains).toContain("legal");
      expect(result.forbiddenDomains).toContain("financial_regulated");
      expect(result.forbiddenDomains).toContain("safety_critical");
    });
  });

  describe("evaluateEvidenceRisk", () => {
    test("returns meetsThreshold true when evidence meets required minimum", () => {
      const evidence = [
        createEvidenceEvent({ type: "text" }),
        createEvidenceEvent({ type: "document" }),
        createEvidenceEvent({ type: "text" })
      ];
      
      const result = evaluateEvidenceRisk(evidence, 3);
      
      expect(result.meetsThreshold).toBe(true);
      expect(result.gaps).toHaveLength(0);
    });

    test("returns meetsThreshold false when evidence below minimum", () => {
      const evidence = [
        createEvidenceEvent({ type: "text" })
      ];
      
      const result = evaluateEvidenceRisk(evidence, 3);
      
      expect(result.meetsThreshold).toBe(false);
      expect(result.gaps).toContain("Insufficient evidence: 1/3 required");
    });

    test("checks for document or text evidence variety", () => {
      const evidence = [
        createEvidenceEvent({ type: "audio" })
      ];
      
      const result = evaluateEvidenceRisk(evidence, 1);
      
      expect(result.gaps).toContain("Missing document or text evidence");
    });

    test("accepts text evidence", () => {
      const evidence = [
        createEvidenceEvent({ type: "text" })
      ];
      
      const result = evaluateEvidenceRisk(evidence, 1);
      
      expect(result.gaps).not.toContain("Missing document or text evidence");
    });

    test("accepts document evidence", () => {
      const evidence = [
        createEvidenceEvent({ type: "document" })
      ];
      
      const result = evaluateEvidenceRisk(evidence, 1);
      
      expect(result.gaps).not.toContain("Missing document or text evidence");
    });

    test("checks for recent evidence", () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 10); // 10 days ago
      
      const evidence = [
        createEvidenceEvent({ capturedAt: oldDate.toISOString(), type: "document" })
      ];
      
      const result = evaluateEvidenceRisk(evidence, 1);
      
      expect(result.gaps).toContain("No recent evidence (past week)");
    });

    test("allows no evidence requirement", () => {
      const evidence: EvidenceEvent[] = [];
      
      const result = evaluateEvidenceRisk(evidence, 0);
      
      expect(result.gaps).not.toContain("No recent evidence (past week)");
    });

    test("determines risk level based on gaps", () => {
      const evidence: EvidenceEvent[] = [];
      
      const result = evaluateEvidenceRisk(evidence, 5);
      
      expect(result.riskLevel).toBe("high");
    });

    test("returns medium risk for single gap", () => {
      const evidence = [
        createEvidenceEvent({ type: "text" })
      ];
      
      const result = evaluateEvidenceRisk(evidence, 5);
      
      expect(result.riskLevel).toBe("medium");
    });

    test("returns low risk for no gaps", () => {
      const evidence = [
        createEvidenceEvent({ type: "document" }),
        createEvidenceEvent({ type: "document" }),
        createEvidenceEvent({ type: "document" })
      ];
      
      const result = evaluateEvidenceRisk(evidence, 3);
      
      expect(result.riskLevel).toBe("low");
    });
  });

  describe("createAuditEntry", () => {
    test("creates audit entry with required fields", () => {
      const entry = createAuditEntry({
        actor: "system",
        action: "test_action",
        inputHash: "abc123"
      });
      
      expect(entry.id).toBeDefined();
      expect(entry.createdAt).toBeDefined();
      expect(entry.actor).toBe("system");
      expect(entry.action).toBe("test_action");
      expect(entry.inputHash).toBe("abc123");
      expect(entry.outputHash).toBe("");
      expect(entry.provenanceRefs).toEqual([]);
      expect(entry.notes).toEqual([]);
    });

    test("includes optional fields when provided", () => {
      const entry = createAuditEntry({
        actor: "user",
        action: "governance_review",
        inputHash: "hash123",
        outputHash: "output456",
        decisionId: "dec-001",
        draftId: "draft-001",
        runId: "run-001",
        provenanceRefs: ["prov-1", "prov-2"],
        notes: ["test note"]
      });
      
      expect(entry.decisionId).toBe("dec-001");
      expect(entry.draftId).toBe("draft-001");
      expect(entry.runId).toBe("run-001");
      expect(entry.provenanceRefs).toEqual(["prov-1", "prov-2"]);
      expect(entry.notes).toEqual(["test note"]);
    });

    test("generates unique IDs", () => {
      const entry1 = createAuditEntry({ actor: "system", action: "test", inputHash: "a" });
      const entry2 = createAuditEntry({ actor: "system", action: "test", inputHash: "a" });
      
      expect(entry1.id).not.toBe(entry2.id);
    });

    test("includes actor type", () => {
      const userEntry = createAuditEntry({ actor: "user", action: "test", inputHash: "a" });
      const panelEntry = createAuditEntry({ actor: "panel", action: "test", inputHash: "a" });
      const adapterEntry = createAuditEntry({ actor: "adapter", action: "test", inputHash: "a" });
      
      expect(userEntry.actor).toBe("user");
      expect(panelEntry.actor).toBe("panel");
      expect(adapterEntry.actor).toBe("adapter");
    });
  });

  describe("validatePolicyConfig", () => {
    test("validates correct policy config", () => {
      const config: PolicyConfig = {
        id: "test-policy",
        version: "1.0.0",
        domainAllowlist: ["research", "analysis"],
        domainDenylist: [],
        inferenceTypeAllowlist: ["correlation", "regression"],
        inferenceTypeDenylist: [],
        forbiddenScopes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const result = validatePolicyConfig(config);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test("rejects missing policy ID", () => {
      const config: PolicyConfig = {
        id: "",
        version: "1.0.0",
        domainAllowlist: [],
        domainDenylist: [],
        inferenceTypeAllowlist: [],
        inferenceTypeDenylist: [],
        forbiddenScopes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const result = validatePolicyConfig(config);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Policy ID is required");
    });

    test("rejects missing version", () => {
      const config: PolicyConfig = {
        id: "test-policy",
        version: "",
        domainAllowlist: [],
        domainDenylist: [],
        inferenceTypeAllowlist: [],
        inferenceTypeDenylist: [],
        forbiddenScopes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const result = validatePolicyConfig(config);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Policy version is required");
    });

    test("rejects overlapping domain allowlist and denylist", () => {
      const config: PolicyConfig = {
        id: "test-policy",
        version: "1.0.0",
        domainAllowlist: ["research", "analysis", "legal"],
        domainDenylist: ["legal", "medical"],
        inferenceTypeAllowlist: [],
        inferenceTypeDenylist: [],
        forbiddenScopes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const result = validatePolicyConfig(config);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes("allowlist and denylist"))).toBe(true);
    });

    test("rejects overlapping inference type lists", () => {
      const config: PolicyConfig = {
        id: "test-policy",
        version: "1.0.0",
        domainAllowlist: [],
        domainDenylist: [],
        inferenceTypeAllowlist: ["correlation", "regression"],
        inferenceTypeDenylist: ["regression"],
        forbiddenScopes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const result = validatePolicyConfig(config);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes("Inference types"))).toBe(true);
    });

    test("rejects invalid createdAt timestamp", () => {
      const config: PolicyConfig = {
        id: "test-policy",
        version: "1.0.0",
        domainAllowlist: [],
        domainDenylist: [],
        inferenceTypeAllowlist: [],
        inferenceTypeDenylist: [],
        forbiddenScopes: [],
        createdAt: "invalid-date",
        updatedAt: new Date().toISOString()
      };
      
      const result = validatePolicyConfig(config);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Invalid createdAt timestamp");
    });

    test("rejects updatedAt before createdAt", () => {
      const createdAt = new Date();
      const updatedAt = new Date(createdAt.getTime() - 1000);
      
      const config: PolicyConfig = {
        id: "test-policy",
        version: "1.0.0",
        domainAllowlist: [],
        domainDenylist: [],
        inferenceTypeAllowlist: [],
        inferenceTypeDenylist: [],
        forbiddenScopes: [],
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt.toISOString()
      };
      
      const result = validatePolicyConfig(config);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("updatedAt must be after createdAt");
    });
  });

  describe("applyGovernanceRules", () => {
    test("approves decision with sufficient evidence", () => {
      const spec = createDecisionSpec({ title: "Analysis", context: "Research analysis" });
      const evidence = [
        createEvidenceEvent({ type: "document" })
      ];
      
      const result = applyGovernanceRules({
        decisionSpec: spec,
        evidenceEvents: evidence
      });
      
      expect(result.approved).toBe(true);
    });

    test("rejects decision with insufficient evidence", () => {
      const spec = createDecisionSpec({ title: "Strategic Analysis", context: "Partnership review" });
      const evidence: EvidenceEvent[] = [];
      
      const result = applyGovernanceRules({
        decisionSpec: spec,
        evidenceEvents: evidence
      });
      
      expect(result.approved).toBe(false);
    });

    test("includes risk profile in result", () => {
      const spec = createDecisionSpec({ title: "Analysis", context: "Simple analysis" });
      
      const result = applyGovernanceRules({
        decisionSpec: spec,
        evidenceEvents: []
      });
      
      expect(result.riskProfile).toBeDefined();
      expect(result.riskProfile.tier).toBeDefined();
      expect(result.riskProfile.requiredEvidenceMin).toBeDefined();
    });

    test("creates audit entry for all reviews", () => {
      const spec = createDecisionSpec({ title: "Analysis", context: "Simple analysis" });
      
      const result = applyGovernanceRules({
        decisionSpec: spec,
        evidenceEvents: []
      });
      
      expect(result.auditEntry).toBeDefined();
      expect(result.auditEntry.action).toBe("governance_review");
      expect(result.auditEntry.actor).toBe("system");
    });

    test("returns warnings for evidence gaps", () => {
      const spec = createDecisionSpec({ title: "Strategic Analysis", context: "Partnership review" });
      
      const result = applyGovernanceRules({
        decisionSpec: spec,
        evidenceEvents: []
      });
      
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    test("blocks domain in policy denylist", () => {
      const spec = createDecisionSpec({ title: "Analysis", context: "Legal research" });
      const policy: PolicyConfig = {
        id: "restrictive-policy",
        version: "1.0.0",
        domainAllowlist: [],
        domainDenylist: ["legal"],
        inferenceTypeAllowlist: [],
        inferenceTypeDenylist: [],
        forbiddenScopes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const result = applyGovernanceRules({
        decisionSpec: spec,
        evidenceEvents: [],
        policyConfig: policy
      });
      
      expect(result.approved).toBe(false);
      expect(result.warnings.some(w => w.includes("denylist"))).toBe(true);
    });

    test("warns when domain not in policy allowlist", () => {
      const spec = createDecisionSpec({ title: "Analysis", context: "Research analysis" });
      const policy: PolicyConfig = {
        id: "allowlist-policy",
        version: "1.0.0",
        domainAllowlist: ["negotiation"],
        domainDenylist: [],
        inferenceTypeAllowlist: [],
        inferenceTypeDenylist: [],
        forbiddenScopes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const result = applyGovernanceRules({
        decisionSpec: spec,
        evidenceEvents: [],
        policyConfig: policy
      });
      
      expect(result.warnings.some(w => w.includes("allowlist"))).toBe(true);
    });

    test("warns for deep branching in informational decisions", () => {
      const spec = createDecisionSpec({ title: "Analysis", context: "Simple analysis" });
      const branchGraph = createBranchGraph({
        nodes: [
          { id: "root", label: "Root", kind: "state", notes: [], dependencies: [] },
          { id: "child1", label: "Child 1", kind: "event", notes: [], dependencies: [] },
          { id: "child2", label: "Child 2", kind: "event", notes: [], dependencies: [] },
          { id: "grandchild", label: "Grandchild", kind: "outcome", notes: [], dependencies: [] }
        ],
        edges: [
          { id: "e1", from: "root", to: "child1", notes: [] },
          { id: "e2", from: "root", to: "child2", notes: [] },
          { id: "e3", from: "child1", to: "grandchild", notes: [] }
        ]
      });
      
      const result = applyGovernanceRules({
        decisionSpec: spec,
        evidenceEvents: [],
        branchGraph
      });
      
      expect(result.warnings.some(w => w.includes("Deep branching"))).toBe(true);
    });

    test("warns for high dependency count", () => {
      const spec = createDecisionSpec({ title: "Analysis", context: "Simple analysis" });
      const branchGraph = createBranchGraph({
        nodes: [{ id: "root", label: "Root", kind: "state", notes: [], dependencies: [] }],
        edges: Array(15).fill(null).map((_, i) => ({
          id: `e${i}`,
          from: `node${i}`,
          to: `node${i + 1}`,
          notes: []
        }))
      });
      
      const result = applyGovernanceRules({
        decisionSpec: spec,
        evidenceEvents: [],
        branchGraph
      });
      
      expect(result.warnings.some(w => w.includes("High dependency"))).toBe(true);
    });

    test("handles missing branch graph gracefully", () => {
      const spec = createDecisionSpec({ title: "Analysis", context: "Simple analysis" });
      
      const result = applyGovernanceRules({
        decisionSpec: spec,
        evidenceEvents: []
      });
      
      expect(result.approved).toBe(false); // No evidence
      expect(result.riskProfile).toBeDefined();
    });

    test("rejects invalid policy config", () => {
      const spec = createDecisionSpec({ title: "Analysis", context: "Simple analysis" });
      const invalidPolicy: PolicyConfig = {
        id: "",
        version: "1.0.0",
        domainAllowlist: [],
        domainDenylist: [],
        inferenceTypeAllowlist: [],
        inferenceTypeDenylist: [],
        forbiddenScopes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const result = applyGovernanceRules({
        decisionSpec: spec,
        evidenceEvents: [],
        policyConfig: invalidPolicy
      });
      
      expect(result.warnings.some(w => w.includes("Invalid policy"))).toBe(true);
      expect(result.approved).toBe(false);
    });
  });

  describe("getDefaultRiskProfile", () => {
    test("returns informational profile", () => {
      const profile = getDefaultRiskProfile("informational");
      
      expect(profile.tier).toBe("informational");
      expect(profile.requiredEvidenceMin).toBe(GOVERNANCE_DEFAULTS.informationalEvidenceMin);
      expect(profile.requiredCoolingOffMinutes).toBe(0);
      expect(profile.requiresUserConfirm).toBe(false);
    });

    test("returns operational profile", () => {
      const profile = getDefaultRiskProfile("operational");
      
      expect(profile.tier).toBe("operational");
      expect(profile.requiredEvidenceMin).toBe(GOVERNANCE_DEFAULTS.operationalEvidenceMin);
      expect(profile.requiredCoolingOffMinutes).toBe(5);
      expect(profile.requiresUserConfirm).toBe(false);
    });

    test("returns strategic profile with cooling off", () => {
      const profile = getDefaultRiskProfile("strategic");
      
      expect(profile.tier).toBe("strategic");
      expect(profile.requiredEvidenceMin).toBe(GOVERNANCE_DEFAULTS.strategicEvidenceMin);
      expect(profile.requiredCoolingOffMinutes).toBe(GOVERNANCE_DEFAULTS.strategicCoolingOffMinutes);
      expect(profile.requiresUserConfirm).toBe(true);
    });

    test("returns existential profile with longest cooling off", () => {
      const profile = getDefaultRiskProfile("existential");
      
      expect(profile.tier).toBe("existential");
      expect(profile.requiredEvidenceMin).toBe(GOVERNANCE_DEFAULTS.existentialEvidenceMin);
      expect(profile.requiredCoolingOffMinutes).toBe(GOVERNANCE_DEFAULTS.existentialCoolingOffMinutes);
      expect(profile.requiresUserConfirm).toBe(true);
    });
  });

  describe("constants", () => {
    test("GOVERNANCE_DEFAULTS has expected values", () => {
      expect(GOVERNANCE_DEFAULTS.informationalEvidenceMin).toBe(0);
      expect(GOVERNANCE_DEFAULTS.operationalEvidenceMin).toBe(1);
      expect(GOVERNANCE_DEFAULTS.strategicEvidenceMin).toBe(3);
      expect(GOVERNANCE_DEFAULTS.existentialEvidenceMin).toBe(5);
      expect(GOVERNANCE_DEFAULTS.strategicCoolingOffMinutes).toBe(60);
      expect(GOVERNANCE_DEFAULTS.existentialCoolingOffMinutes).toBe(1440);
    });

    test("RISK_TIER_CONFIG has entries for all tiers", () => {
      expect(RISK_TIER_CONFIG.informational).toBeDefined();
      expect(RISK_TIER_CONFIG.operational).toBeDefined();
      expect(RISK_TIER_CONFIG.strategic).toBeDefined();
      expect(RISK_TIER_CONFIG.existential).toBeDefined();
    });

    test("DOMAIN_RISK_MATRIX covers expected domains", () => {
      expect(DOMAIN_RISK_MATRIX.research).toBe("informational");
      expect(DOMAIN_RISK_MATRIX.ops).toBe("operational");
      expect(DOMAIN_RISK_MATRIX.negotiation).toBe("strategic");
      expect(DOMAIN_RISK_MATRIX.legal).toBe("existential");
    });
  });
});
