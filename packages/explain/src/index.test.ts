import { describe, it, expect, beforeEach } from "vitest";
import {
  ExplanationGeneratorImpl,
  generateExplanation,
  ensureConsistency,
  ExplanationSelector,
  autoSelectExplanationLevel,
  shouldEscalateLevel,
  createDefaultRules,
} from "./index.js";
import type {
  ExplanationLevel,
  ExplanationSelectionContext,
  ExplanationContent,
} from "./types.js";

describe("ExplanationGeneratorImpl", () => {
  let generator: ExplanationGeneratorImpl;

  beforeEach(() => {
    generator = new ExplanationGeneratorImpl();
  });

  describe("generateExplanation", () => {
    it("should generate executive summary", () => {
      const result = { decision: "Proceed with project", confidence: 0.85 };
      const content = generator.generateExplanation(result, "executive");

      expect(content.level).toBe("executive");
      expect(content.summary).toContain("Proceed with project");
      expect(content.details.length).toBeGreaterThan(0);
      expect(content.provenanceRefs).toBeDefined();
      expect(content.uncertaintyNotes).toBeDefined();
    });

    it("should generate operational details", () => {
      const result = {
        decision: "Deploy new feature",
        actions: ["Run tests", "Deploy to staging", "Monitor metrics"],
      };
      const content = generator.generateExplanation(result, "operational");

      expect(content.level).toBe("operational");
      expect(content.summary).toContain("Deploy new feature");
      expect(content.details).toContain("Run tests");
      expect(content.details).toContain("Deploy to staging");
    });

    it("should generate analytical breakdown", () => {
      const result = {
        decision: "Choose option A",
        reasoning: ["Higher ROI", "Lower risk"],
        alternatives: ["Option B", "Option C"],
      };
      const content = generator.generateExplanation(result, "analytical");

      expect(content.level).toBe("analytical");
      expect(content.details).toContain("Higher ROI");
      expect(content.details).toContain("Option B");
    });

    it("should generate epistemic foundation", () => {
      const result = {
        decision: "Accept hypothesis",
        assumptions: ["Data is representative", "Model is valid"],
        evidenceSources: ["Study A", "Study B"],
      };
      const content = generator.generateExplanation(result, "epistemic");

      expect(content.level).toBe("epistemic");
      expect(content.details).toContain("Data is representative");
      expect(content.details).toContain("Study A");
    });

    it("should throw error for unknown level", () => {
      expect(() =>
        generator.generateExplanation({}, "unknown" as ExplanationLevel),
      ).toThrow("Unknown explanation level");
    });
  });

  describe("ensureConsistency", () => {
    it("should return true for consistent explanations", () => {
      const result = { decision: "Test decision" };
      const explanations = new Map<ExplanationLevel, ExplanationContent>([
        ["executive", generator.generateExplanation(result, "executive")],
        ["operational", generator.generateExplanation(result, "operational")],
        ["analytical", generator.generateExplanation(result, "analytical")],
        ["epistemic", generator.generateExplanation(result, "epistemic")],
      ]);

      expect(ensureConsistency(explanations)).toBe(true);
    });

    it("should throw error for missing levels", () => {
      const explanations = new Map<ExplanationLevel, ExplanationContent>([
        ["executive", generator.generateExplanation({}, "executive")],
      ]);

      expect(() => ensureConsistency(explanations)).toThrow(
        "Missing explanation levels",
      );
    });
  });
});

describe("ExplanationSelector", () => {
  let selector: ExplanationSelector;
  let generator: ExplanationGeneratorImpl;

  beforeEach(() => {
    selector = new ExplanationSelector();
    generator = new ExplanationGeneratorImpl();
  });

  describe("autoSelectExplanationLevel", () => {
    it("should return user preference when provided", () => {
      const context: ExplanationSelectionContext = {
        decisionRiskTier: "informational",
        userInteractionCount: 0,
        recentOverrideCount: 0,
        userPreference: "analytical",
      };

      expect(selector.autoSelectExplanationLevel(context)).toBe("analytical");
    });

    it("should select executive for informational risk", () => {
      const context: ExplanationSelectionContext = {
        decisionRiskTier: "informational",
        userInteractionCount: 0,
        recentOverrideCount: 0,
      };

      expect(selector.autoSelectExplanationLevel(context)).toBe("executive");
    });

    it("should select operational for operational risk", () => {
      const context: ExplanationSelectionContext = {
        decisionRiskTier: "operational",
        userInteractionCount: 0,
        recentOverrideCount: 0,
      };

      expect(selector.autoSelectExplanationLevel(context)).toBe("operational");
    });

    it("should select analytical for strategic risk", () => {
      const context: ExplanationSelectionContext = {
        decisionRiskTier: "strategic",
        userInteractionCount: 0,
        recentOverrideCount: 0,
      };

      expect(selector.autoSelectExplanationLevel(context)).toBe("analytical");
    });

    it("should select epistemic for existential risk", () => {
      const context: ExplanationSelectionContext = {
        decisionRiskTier: "existential",
        userInteractionCount: 0,
        recentOverrideCount: 0,
      };

      expect(selector.autoSelectExplanationLevel(context)).toBe("epistemic");
    });
  });

  describe("shouldEscalateLevel", () => {
    it("should escalate when override count exceeds threshold", () => {
      const context: ExplanationSelectionContext = {
        decisionRiskTier: "informational",
        userInteractionCount: 0,
        recentOverrideCount: 3,
      };

      expect(selector.shouldEscalateLevel(context, "executive")).toBe(true);
    });

    it("should escalate for high interaction count at executive level", () => {
      const context: ExplanationSelectionContext = {
        decisionRiskTier: "informational",
        userInteractionCount: 11,
        recentOverrideCount: 0,
      };

      expect(selector.shouldEscalateLevel(context, "executive")).toBe(true);
    });

    it("should escalate existential to epistemic", () => {
      const context: ExplanationSelectionContext = {
        decisionRiskTier: "existential",
        userInteractionCount: 0,
        recentOverrideCount: 0,
      };

      expect(selector.shouldEscalateLevel(context, "operational")).toBe(true);
    });

    it("should not escalate when conditions not met", () => {
      const context: ExplanationSelectionContext = {
        decisionRiskTier: "informational",
        userInteractionCount: 5,
        recentOverrideCount: 1,
      };

      expect(selector.shouldEscalateLevel(context, "operational")).toBe(false);
    });
  });

  describe("recordExplanationSelection", () => {
    it("should record explanation with auto-selected flag", () => {
      const content = generator.generateExplanation({}, "executive");
      const record = selector.recordExplanationSelection(
        "decision-1",
        "executive",
        content,
        true,
      );

      expect(record.id).toBeDefined();
      expect(record.timestamp).toBeInstanceOf(Date);
      expect(record.decisionId).toBe("decision-1");
      expect(record.level).toBe("executive");
      expect(record.autoSelected).toBe(true);
    });

    it("should record explanation with override flag", () => {
      const content = generator.generateExplanation({}, "analytical");
      const record = selector.recordExplanationSelection(
        "decision-1",
        "analytical",
        content,
        false,
      );

      expect(record.autoSelected).toBe(false);
    });
  });

  describe("getSelectionHistory", () => {
    it("should return all history when no filters", () => {
      const content = generator.generateExplanation({}, "executive");
      selector.recordExplanationSelection("d1", "executive", content, true);
      selector.recordExplanationSelection("d2", "operational", content, true);

      const history = selector.getSelectionHistory();
      expect(history.length).toBe(2);
    });

    it("should filter by decisionId", () => {
      const content = generator.generateExplanation({}, "executive");
      selector.recordExplanationSelection("d1", "executive", content, true);
      selector.recordExplanationSelection("d2", "operational", content, true);

      const history = selector.getSelectionHistory("d1");
      expect(history.length).toBe(1);
      expect(history[0]!.decisionId).toBe("d1");
    });
  });

  describe("getRecentOverrideCount", () => {
    it("should count recent non-auto selections", () => {
      const content = generator.generateExplanation({}, "executive");
      selector.recordExplanationSelection("d1", "executive", content, true);
      selector.recordExplanationSelection("d2", "operational", content, false);
      selector.recordExplanationSelection("d3", "analytical", content, false);

      expect(selector.getRecentOverrideCount()).toBe(2);
    });
  });

  describe("getSelectionStats", () => {
    it("should calculate selection statistics", () => {
      const content = generator.generateExplanation({}, "executive");
      selector.recordExplanationSelection("d1", "executive", content, true);
      selector.recordExplanationSelection("d2", "operational", content, false);
      selector.recordExplanationSelection("d3", "analytical", content, true);

      const stats = selector.getSelectionStats();
      expect(stats.totalSelections).toBe(3);
      expect(stats.autoSelectedCount).toBe(2);
      expect(stats.overrideCount).toBe(1);
      expect(stats.levelDistribution.executive).toBe(1);
      expect(stats.levelDistribution.operational).toBe(1);
      expect(stats.levelDistribution.analytical).toBe(1);
    });
  });
});

describe("generateExplanation", () => {
  it("should be exported and functional", () => {
    const result = { decision: "Test" };
    const content = generateExplanation(result, "executive");

    expect(content.level).toBe("executive");
    expect(content.summary).toContain("Test");
  });
});

describe("autoSelectExplanationLevel", () => {
  it("should select appropriate level based on context", () => {
    const context: ExplanationSelectionContext = {
      decisionRiskTier: "strategic",
      userInteractionCount: 0,
      recentOverrideCount: 0,
    };

    expect(autoSelectExplanationLevel(context)).toBe("analytical");
  });
});

describe("shouldEscalateLevel", () => {
  it("should determine escalation based on context", () => {
    const context: ExplanationSelectionContext = {
      decisionRiskTier: "informational",
      userInteractionCount: 15,
      recentOverrideCount: 0,
    };

    expect(shouldEscalateLevel(context, "executive")).toBe(true);
  });
});

describe("createDefaultRules", () => {
  it("should create default selection rules", () => {
    const rules = createDefaultRules();

    expect(rules.defaultLevel).toBe("executive");
    expect(rules.overrideFrequencyThreshold).toBe(3);
    expect(rules.riskTierThresholds.informational).toBe("executive");
    expect(rules.riskTierThresholds.operational).toBe("operational");
    expect(rules.riskTierThresholds.strategic).toBe("analytical");
    expect(rules.riskTierThresholds.existential).toBe("epistemic");
  });
});