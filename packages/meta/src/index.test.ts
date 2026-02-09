/**
 * Tests for @zeo/meta package
 */

import { describe, it, expect } from "vitest";
import {
  DecisionPattern,
  DecisionRecord,
  MetaLearnerConfig,
  DEFAULT_CONFIG,
  isPatternType,
  isSeverity,
  isDecisionOutcome,
} from "./types";
import {
  detectAssumptionErrors,
  detectConfidenceMiscalibration,
  detectReversals,
  detectIgnoredClarifiers,
  detectAllPatterns,
} from "./patterns";
import {
  aggregatePatterns,
  generateEpistemicWarnings,
  generateCalibrationNudges,
  recommendLenses,
  createMetaInsights,
  analyzeDecisions,
  hasEnoughObservations,
  filterDismissedInsights,
} from "./learner";

// Test data factory
function createDecisionRecord(overrides: Partial<DecisionRecord> = {}): DecisionRecord {
  return {
    decisionId: `decision-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    assumptions: [],
    confidence: 0.5,
    clarifiersRequested: [],
    clarifiersIgnored: [],
    ...overrides,
  };
}

function createTestConfig(overrides: Partial<MetaLearnerConfig> = {}): MetaLearnerConfig {
  return {
    ...DEFAULT_CONFIG,
    minObservations: 3,
    ...overrides,
  };
}

describe("Type guards", () => {
  it("should validate PatternType", () => {
    expect(isPatternType("assumption_error")).toBe(true);
    expect(isPatternType("overconfidence")).toBe(true);
    expect(isPatternType("invalid")).toBe(false);
    expect(isPatternType(123)).toBe(false);
  });

  it("should validate Severity", () => {
    expect(isSeverity("low")).toBe(true);
    expect(isSeverity("medium")).toBe(true);
    expect(isSeverity("high")).toBe(true);
    expect(isSeverity("critical")).toBe(false);
  });

  it("should validate DecisionOutcome", () => {
    expect(isDecisionOutcome("success")).toBe(true);
    expect(isDecisionOutcome("failure")).toBe(true);
    expect(isDecisionOutcome("partial")).toBe(true);
    expect(isDecisionOutcome("unknown")).toBe(false);
  });
});

describe("detectAssumptionErrors", () => {
  it("should return empty array for insufficient records", () => {
    const records = [createDecisionRecord()];
    const result = detectAssumptionErrors(records, createTestConfig());
    expect(result).toHaveLength(0);
  });

  it("should detect assumption errors", () => {
    const now = new Date();
    const records: DecisionRecord[] = [
      createDecisionRecord({
        assumptions: ["market will grow"],
        outcome: "failure",
        timestamp: now,
      }),
      createDecisionRecord({
        assumptions: ["market will grow"],
        outcome: "failure",
        timestamp: new Date(now.getTime() - 86400000),
      }),
      createDecisionRecord({
        assumptions: ["market will grow"],
        outcome: "success",
        timestamp: new Date(now.getTime() - 172800000),
      }),
    ];

    const result = detectAssumptionErrors(records, createTestConfig());
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].patternType).toBe("assumption_error");
    expect(result[0].frequency).toBeGreaterThan(0);
  });

  it("should not detect patterns below threshold", () => {
    const now = new Date();
    const records: DecisionRecord[] = [
      createDecisionRecord({
        assumptions: ["market will grow"],
        outcome: "failure",
        timestamp: now,
      }),
      createDecisionRecord({
        assumptions: ["market will grow"],
        outcome: "success",
        timestamp: new Date(now.getTime() - 86400000),
      }),
      createDecisionRecord({
        assumptions: ["market will grow"],
        outcome: "success",
        timestamp: new Date(now.getTime() - 172800000),
      }),
    ];

    const result = detectAssumptionErrors(records, createTestConfig({ patternThreshold: 0.5 }));
    expect(result).toHaveLength(0);
  });
});

describe("detectConfidenceMiscalibration", () => {
  it("should detect overconfidence", () => {
    const now = new Date();
    const records: DecisionRecord[] = [
      createDecisionRecord({ confidence: 0.9, outcome: "failure", timestamp: now }),
      createDecisionRecord({ confidence: 0.9, outcome: "failure", timestamp: new Date(now.getTime() - 86400000) }),
      createDecisionRecord({ confidence: 0.9, outcome: "failure", timestamp: new Date(now.getTime() - 172800000) }),
    ];

    const result = detectConfidenceMiscalibration(records, createTestConfig());
    const overconfidence = result.find((p) => p.patternType === "overconfidence");
    expect(overconfidence).toBeDefined();
    expect(overconfidence!.frequency).toBeGreaterThan(0);
  });

  it("should detect underconfidence", () => {
    const now = new Date();
    const records: DecisionRecord[] = [
      createDecisionRecord({ confidence: 0.2, outcome: "success", timestamp: now }),
      createDecisionRecord({ confidence: 0.2, outcome: "success", timestamp: new Date(now.getTime() - 86400000) }),
      createDecisionRecord({ confidence: 0.2, outcome: "success", timestamp: new Date(now.getTime() - 172800000) }),
    ];

    const result = detectConfidenceMiscalibration(records, createTestConfig());
    const underconfidence = result.find((p) => p.patternType === "underconfidence");
    expect(underconfidence).toBeDefined();
    expect(underconfidence!.frequency).toBeGreaterThan(0);
  });

  it("should return empty for well-calibrated confidence", () => {
    const now = new Date();
    const records: DecisionRecord[] = [
      createDecisionRecord({ confidence: 0.5, outcome: "success", timestamp: now }),
      createDecisionRecord({ confidence: 0.5, outcome: "failure", timestamp: new Date(now.getTime() - 86400000) }),
      createDecisionRecord({ confidence: 0.6, outcome: "success", timestamp: new Date(now.getTime() - 172800000) }),
    ];

    const result = detectConfidenceMiscalibration(records, createTestConfig());
    expect(result).toHaveLength(0);
  });
});

describe("detectReversals", () => {
  it("should detect frequent reversals", () => {
    const now = new Date();
    const records: DecisionRecord[] = [
      createDecisionRecord({ reversalOf: "dec-1", timestamp: now }),
      createDecisionRecord({ reversalOf: "dec-2", timestamp: new Date(now.getTime() - 86400000) }),
      createDecisionRecord({ reversalOf: "dec-3", timestamp: new Date(now.getTime() - 172800000) }),
    ];

    const result = detectReversals(records, createTestConfig());
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].patternType).toBe("reversal");
  });

  it("should not detect reversals below threshold", () => {
    const now = new Date();
    const records: DecisionRecord[] = [
      createDecisionRecord({ reversalOf: "dec-1", timestamp: now }),
      createDecisionRecord({ timestamp: new Date(now.getTime() - 86400000) }),
      createDecisionRecord({ timestamp: new Date(now.getTime() - 172800000) }),
    ];

    const result = detectReversals(records, createTestConfig({ patternThreshold: 0.5 }));
    expect(result).toHaveLength(0);
  });
});

describe("detectIgnoredClarifiers", () => {
  it("should detect ignored clarifiers pattern", () => {
    const now = new Date();
    const records: DecisionRecord[] = [
      createDecisionRecord({
        clarifiersIgnored: ["What about edge cases?"],
        outcome: "failure",
        timestamp: now,
      }),
      createDecisionRecord({
        clarifiersIgnored: ["Have you considered X?"],
        outcome: "failure",
        timestamp: new Date(now.getTime() - 86400000),
      }),
      createDecisionRecord({
        clarifiersIgnored: ["What are the risks?"],
        outcome: "failure",
        timestamp: new Date(now.getTime() - 172800000),
      }),
    ];

    const result = detectIgnoredClarifiers(records, createTestConfig());
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].patternType).toBe("ignored_clarifier");
  });

  it("should not detect pattern when ignored clarifiers don't correlate with failure", () => {
    const now = new Date();
    const records: DecisionRecord[] = [
      createDecisionRecord({
        clarifiersIgnored: ["Question?"],
        outcome: "success",
        timestamp: now,
      }),
      createDecisionRecord({
        clarifiersIgnored: ["Question?"],
        outcome: "success",
        timestamp: new Date(now.getTime() - 86400000),
      }),
      createDecisionRecord({
        clarifiersIgnored: ["Question?"],
        outcome: "success",
        timestamp: new Date(now.getTime() - 172800000),
      }),
    ];

    const result = detectIgnoredClarifiers(records, createTestConfig());
    expect(result).toHaveLength(0);
  });
});

describe("detectAllPatterns", () => {
  it("should detect all pattern types", () => {
    const now = new Date();
    const records: DecisionRecord[] = [
      // Assumption errors - need multiple to trigger pattern
      createDecisionRecord({
        assumptions: ["market grows"],
        outcome: "failure",
        timestamp: now,
      }),
      createDecisionRecord({
        assumptions: ["market grows"],
        outcome: "failure",
        timestamp: new Date(now.getTime() - 86400000),
      }),
      createDecisionRecord({
        assumptions: ["market grows"],
        outcome: "failure",
        timestamp: new Date(now.getTime() - 172800000),
      }),
      // Overconfidence
      createDecisionRecord({
        confidence: 0.9,
        outcome: "failure",
        timestamp: new Date(now.getTime() - 259200000),
      }),
      // Reversal
      createDecisionRecord({
        reversalOf: "dec-1",
        timestamp: new Date(now.getTime() - 345600000),
      }),
    ];

    const result = detectAllPatterns(records, createTestConfig());
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("aggregatePatterns", () => {
  it("should aggregate patterns from records", () => {
    const now = new Date();
    const records: DecisionRecord[] = [
      createDecisionRecord({ assumptions: ["a"], outcome: "failure", timestamp: now }),
      createDecisionRecord({ assumptions: ["a"], outcome: "failure", timestamp: new Date(now.getTime() - 86400000) }),
      createDecisionRecord({ assumptions: ["a"], outcome: "failure", timestamp: new Date(now.getTime() - 172800000) }),
    ];

    const result = aggregatePatterns(records, createTestConfig());
    expect(result.length).toBeGreaterThan(0);
  });

  it("should return empty for insufficient records", () => {
    const records: DecisionRecord[] = [createDecisionRecord()];
    const result = aggregatePatterns(records, createTestConfig());
    expect(result).toHaveLength(0);
  });
});

describe("generateEpistemicWarnings", () => {
  it("should generate warnings for high severity patterns", () => {
    const patterns: DecisionPattern[] = [
      {
        patternType: "overconfidence",
        frequency: 0.5,
        examples: [],
        severity: "high",
        firstObserved: new Date(),
        lastObserved: new Date(),
      },
    ];

    const warnings = generateEpistemicWarnings(patterns);
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings[0]).toContain("Overconfidence");
  });

  it("should not generate warnings for low severity patterns", () => {
    const patterns: DecisionPattern[] = [
      {
        patternType: "overconfidence",
        frequency: 0.1,
        examples: [],
        severity: "low",
        firstObserved: new Date(),
        lastObserved: new Date(),
      },
    ];

    const warnings = generateEpistemicWarnings(patterns);
    expect(warnings).toHaveLength(0);
  });
});

describe("generateCalibrationNudges", () => {
  it("should generate nudges for overconfidence", () => {
    const patterns: DecisionPattern[] = [
      {
        patternType: "overconfidence",
        frequency: 0.5,
        examples: [],
        severity: "high",
        firstObserved: new Date(),
        lastObserved: new Date(),
      },
    ];

    const nudges = generateCalibrationNudges(patterns);
    expect(nudges.length).toBeGreaterThan(0);
    expect(nudges.some(n => n.includes("pre-mortem"))).toBe(true);
  });

  it("should generate nudges for assumption errors", () => {
    const patterns: DecisionPattern[] = [
      {
        patternType: "assumption_error",
        frequency: 0.5,
        examples: [],
        severity: "medium",
        firstObserved: new Date(),
        lastObserved: new Date(),
      },
    ];

    const nudges = generateCalibrationNudges(patterns);
    expect(nudges.length).toBeGreaterThan(0);
  });
});

describe("recommendLenses", () => {
  it("should recommend lenses based on patterns", () => {
    const patterns: DecisionPattern[] = [
      {
        patternType: "overconfidence",
        frequency: 0.5,
        examples: [],
        severity: "high",
        firstObserved: new Date(),
        lastObserved: new Date(),
      },
    ];

    const lenses = recommendLenses(patterns);
    expect(lenses.length).toBeGreaterThan(0);
    expect(lenses).toContain("risk-minimization");
  });

  it("should not recommend lenses for low severity patterns", () => {
    const patterns: DecisionPattern[] = [
      {
        patternType: "overconfidence",
        frequency: 0.1,
        examples: [],
        severity: "low",
        firstObserved: new Date(),
        lastObserved: new Date(),
      },
    ];

    const lenses = recommendLenses(patterns);
    expect(lenses).toHaveLength(0);
  });
});

describe("createMetaInsights", () => {
  it("should create insights from patterns", () => {
    const patterns: DecisionPattern[] = [
      {
        patternType: "overconfidence",
        frequency: 0.5,
        examples: ["example 1"],
        severity: "high",
        firstObserved: new Date(),
        lastObserved: new Date(),
      },
    ];

    const insights = createMetaInsights(patterns);
    expect(insights.length).toBeGreaterThan(0);
    expect(insights.some((i) => i.category === "pattern")).toBe(true);
    expect(insights.some((i) => i.category === "warning")).toBe(true);
  });

  it("should set all insights as dismissible", () => {
    const patterns: DecisionPattern[] = [
      {
        patternType: "overconfidence",
        frequency: 0.5,
        examples: [],
        severity: "medium",
        firstObserved: new Date(),
        lastObserved: new Date(),
      },
    ];

    const insights = createMetaInsights(patterns);
    expect(insights.every((i) => i.dismissible)).toBe(true);
  });
});

describe("analyzeDecisions", () => {
  it("should perform full analysis", () => {
    const now = new Date();
    const records: DecisionRecord[] = [
      createDecisionRecord({ confidence: 0.9, outcome: "failure", timestamp: now }),
      createDecisionRecord({ confidence: 0.9, outcome: "failure", timestamp: new Date(now.getTime() - 86400000) }),
      createDecisionRecord({ confidence: 0.9, outcome: "failure", timestamp: new Date(now.getTime() - 172800000) }),
    ];

    const result = analyzeDecisions(records, createTestConfig());
    expect(result.patterns.length).toBeGreaterThan(0);
    expect(result.epistemicWarnings.length).toBeGreaterThan(0);
    expect(result.calibrationNudges.length).toBeGreaterThan(0);
    expect(result.lensRecommendations.length).toBeGreaterThan(0);
  });
});

describe("hasEnoughObservations", () => {
  it("should return true when enough observations", () => {
    const records: DecisionRecord[] = [
      createDecisionRecord(),
      createDecisionRecord(),
      createDecisionRecord(),
    ];
    expect(hasEnoughObservations(records, createTestConfig())).toBe(true);
  });

  it("should return false when insufficient observations", () => {
    const records: DecisionRecord[] = [createDecisionRecord()];
    expect(hasEnoughObservations(records, createTestConfig())).toBe(false);
  });
});

describe("filterDismissedInsights", () => {
  it("should filter out dismissed insights", () => {
    const insights = [
      { id: "1", category: "pattern" as const, message: "test", supportingEvidence: [] as string[], dismissible: true },
      { id: "2", category: "warning" as const, message: "test", supportingEvidence: [] as string[], dismissible: true, dismissed: true },
      { id: "3", category: "nudge" as const, message: "test", supportingEvidence: [] as string[], dismissible: true },
    ];

    const filtered = filterDismissedInsights(insights);
    expect(filtered).toHaveLength(2);
    expect(filtered.every((i) => !i.dismissed)).toBe(true);
  });
});

describe("DEFAULT_CONFIG", () => {
  it("should have advisoryOnly set to true", () => {
    expect(DEFAULT_CONFIG.advisoryOnly).toBe(true);
  });

  it("should have reasonable defaults", () => {
    expect(DEFAULT_CONFIG.minObservations).toBeGreaterThan(0);
    expect(DEFAULT_CONFIG.patternThreshold).toBeGreaterThan(0);
    expect(DEFAULT_CONFIG.lookbackDays).toBeGreaterThan(0);
  });
});

