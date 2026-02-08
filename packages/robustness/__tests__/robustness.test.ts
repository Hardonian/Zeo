import { describe, it, expect } from "vitest";
import {
  assessStability,
  assessConfoundingRisk,
  detectLeakage,
  assessMulticollinearity,
  assessSampleAdequacy,
  assessHypothesisRobustness,
  runAllRobustnessChecks,
  type NumericDataPoint,
  type RiskLevel,
  generateAlternatives,
  generateCompetingHypotheses,
  rankHypotheses,
  formatHypothesisForReview,
  generateHypothesesFromPattern,
  type HypothesisCandidate,
  type EvidencePattern,
} from "../src/index.js";

function riskOrder(risk: RiskLevel): number {
  const order: Record<RiskLevel, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  };
  return order[risk];
}

describe("Robustness Checks", () => {
  describe("assessStability", () => {
    it("should return low risk for stable data", () => {
      const data: NumericDataPoint[] = Array.from({ length: 100 }, (_, i) => ({
        x: i,
        y: 50 + Math.random() * 2,
      }));

      const result = assessStability(data);

      expect(result.category).toBe("stability");
      expect(result.findings.length).toBeGreaterThan(0);
      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.bands.low).toBeLessThanOrEqual(result.bands.high);
    });

    it("should return high risk for insufficient data", () => {
      const data: NumericDataPoint[] = Array.from({ length: 5 }, (_, i) => ({
        x: i,
        y: 50 + Math.random() * 10,
      }));

      const result = assessStability(data);

      expect(result.category).toBe("stability");
      expect(result.riskLevel).toBe("high");
    });

    it("should compute correct confidence interval", () => {
      const data: NumericDataPoint[] = Array.from({ length: 100 }, (_, i) => ({
        x: i,
        y: 100,
      }));

      const result = assessStability(data);

      expect(result.bands.low).toBeCloseTo(100, 0);
      expect(result.bands.high).toBeCloseTo(100, 0);
    });
  });

  describe("assessConfoundingRisk", () => {
    it("should return low risk when treatment and outcome are uncorrelated", () => {
      const treatmentValues = Array.from({ length: 100 }, () => Math.random());
      const outcomeValues = Array.from({ length: 100 }, () => Math.random());
      const covariateValues: number[][] = [
        Array.from({ length: 100 }, () => Math.random()),
      ];

      const result = assessConfoundingRisk(
        treatmentValues,
        outcomeValues,
        covariateValues
      );

      expect(result.category).toBe("confounding");
      expect(result.riskLevel).toBe("low");
    });

    it("should return high risk when confounders are present", () => {
      const treatmentValues = Array.from({ length: 100 }, (_, i) => i / 100);
      const confounder = Array.from({ length: 100 }, (_, i) => i / 100);
      const outcomeValues = treatmentValues.map((t, i) => t + confounder[i] + Math.random() * 0.1);
      const covariateValues = [confounder];

      const result = assessConfoundingRisk(
        treatmentValues,
        outcomeValues,
        covariateValues
      );

      expect(result.category).toBe("confounding");
      expect(["medium", "high", "critical"]).toContain(result.riskLevel);
    });

    it("should handle mismatched array lengths", () => {
      const treatmentValues = Array.from({ length: 50 }, () => Math.random());
      const outcomeValues = Array.from({ length: 100 }, () => Math.random());
      const covariateValues: number[][] = [];

      const result = assessConfoundingRisk(
        treatmentValues,
        outcomeValues,
        covariateValues
      );

      expect(result.riskLevel).toBe("high");
    });
  });

  describe("detectLeakage", () => {
    it("should return low risk when correlations are normal", () => {
      const featureValues: number[][] = [
        Array.from({ length: 100 }, () => Math.random() * 0.3),
        Array.from({ length: 100 }, () => Math.random() * 0.3),
      ];
      const outcomeValues = Array.from({ length: 100 }, () => Math.random());

      const result = detectLeakage(featureValues, outcomeValues, ["f1", "f2"]);

      expect(result.category).toBe("leakage");
      expect(result.riskLevel).toBe("low");
    });

    it("should detect very high correlations", () => {
      const featureValues: number[][] = [
        Array.from({ length: 100 }, (_, i) => i / 100),
      ];
      const outcomeValues = Array.from({ length: 100 }, (_, i) => i / 100);

      const result = detectLeakage(featureValues, outcomeValues, ["perfect_corr"]);

      expect(result.category).toBe("leakage");
      expect(result.riskLevel).toBe("high");
    });

    it("should handle empty data", () => {
      const result = detectLeakage([], [], []);

      expect(result.riskLevel).toBe("low");
      expect(result.score).toBe(0.9);
    });
  });

  describe("assessMulticollinearity", () => {
    it("should return low risk for uncorrelated features", () => {
      const featureValues: number[][] = [
        Array.from({ length: 100 }, () => Math.random()),
        Array.from({ length: 100 }, () => Math.random()),
      ];

      const result = assessMulticollinearity(featureValues, ["f1", "f2"]);

      expect(result.category).toBe("multicollinearity");
      expect(result.riskLevel).toBe("low");
    });

    it("should detect high correlation between features", () => {
      const featureValues: number[][] = [
        Array.from({ length: 100 }, (_, i) => i / 100),
        Array.from({ length: 100 }, (_, i) => i / 100 + Math.random() * 0.05),
      ];

      const result = assessMulticollinearity(featureValues, ["f1", "f2"]);

      expect(result.category).toBe("multicollinearity");
      expect(["medium", "high", "critical"]).toContain(result.riskLevel);
    });

    it("should handle single feature", () => {
      const featureValues: number[][] = [
        Array.from({ length: 100 }, () => Math.random()),
      ];

      const result = assessMulticollinearity(featureValues, ["f1"]);

      expect(result.riskLevel).toBe("low");
    });
  });

  describe("assessSampleAdequacy", () => {
    it("should return low risk for large sample with clear effect", () => {
      const result = assessSampleAdequacy(0.5, 500);

      expect(result.category).toBe("sample_adequacy");
      expect(result.riskLevel).toBe("low");
    });

    it("should return critical risk for small sample", () => {
      const result = assessSampleAdequacy(0.5, 10);

      expect(result.category).toBe("sample_adequacy");
      expect(result.riskLevel).toBe("critical");
    });

    it("should return medium risk for small effect size", () => {
      const result = assessSampleAdequacy(0.1, 200);

      expect(result.category).toBe("sample_adequacy");
      expect(result.riskLevel).toBe("medium");
    });
  });

  describe("assessHypothesisRobustness", () => {
    it("should run multiple checks", () => {
      const data: NumericDataPoint[] = Array.from({ length: 100 }, (_, i) => ({
        x: i,
        y: 50 + i * 0.1 + Math.random() * 5,
      }));

      const hypothesis = {
        id: "h1",
        label: "Test hypothesis",
        target: { kind: "decision", id: "d1" },
        predictors: [{ kind: "variable", id: "v1" }],
        effectBand: { low: 0.3, high: 0.7 },
        robustness: {
          stabilityBand: { low: 0.5, high: 0.8 },
          confoundingRiskBand: { low: 0.2, high: 0.5 },
          leakageRiskBand: { low: 0.1, high: 0.3 },
          multicollinearityBand: { low: 0.1, high: 0.4 },
          sampleAdequacyBand: { low: 0.6, high: 0.9 },
        },
        controlsUsed: [],
        negativeControlsRun: false,
        disclaimers: [],
        provenance: [],
      };

      const results = assessHypothesisRobustness(hypothesis, data);

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].category).toBe("stability");
    });
  });

  describe("runAllRobustnessChecks", () => {
    it("should run all checks and return summary", () => {
      const data: NumericDataPoint[] = Array.from({ length: 200 }, (_, i) => ({
        x: i,
        y: 50 + Math.random() * 10,
      }));

      const result = runAllRobustnessChecks(data);

      expect(result.results.length).toBeGreaterThanOrEqual(4);
      expect(result.overallRisk).toBeDefined();
      expect(result.summary.length).toBeGreaterThan(0);
    });

    it("should detect critical issues in unstable data", () => {
      const data: NumericDataPoint[] = Array.from({ length: 5 }, (_, i) => ({
        x: i,
        y: i * 100 + Math.random() * 50,
      }));

      const result = runAllRobustnessChecks(data);

      expect(["high", "critical"]).toContain(result.overallRisk);
    });
  });

  describe("Hypothesis Generator", () => {
    describe("generateAlternatives", () => {
      it("should generate reverse causality alternative", () => {
        const primary = {
          label: "X causes Y",
          predictors: [{ kind: "variable", id: "X" }],
          mechanism: "X directly affects Y through causal pathway",
          expectedEffect: { direction: "positive" as const, magnitude: 0.5 },
        };
        const evidence: EvidencePattern[] = [
          { observationId: "obs1", correlation: 0.7, temporalRelation: "before" as const, strength: 0.8 },
        ];

        const result = generateAlternatives(primary, evidence, "market");

        expect(result.alternatives.length).toBeGreaterThan(0);
        expect(result.primary.length).toBe(1);
        expect(result.primary[0].label).toBe(primary.label);
      });

      it("should include confounding alternative", () => {
        const primary = {
          label: "Treatment affects outcome",
          predictors: [{ kind: "variable", id: "treatment" }],
          mechanism: "Treatment leads to outcome improvement",
          expectedEffect: { direction: "positive" as const, magnitude: 0.6 },
        };
        const evidence: EvidencePattern[] = [];

        const result = generateAlternatives(primary, evidence, "medical", {
          includeConfounder: true,
        });

        const confounderAlt = result.alternatives.find(
          a => a.label.includes("Confounder")
        );
        expect(confounderAlt).toBeDefined();
      });

      it("should respect maxAlternatives config", () => {
        const primary = {
          label: "Test hypothesis",
          predictors: [{ kind: "variable", id: "v1" }, { kind: "variable", id: "v2" }],
          mechanism: "Multiple factors involved",
          expectedEffect: { direction: "positive" as const, magnitude: 0.4 },
        };
        const evidence: EvidencePattern[] = [];

        const result = generateAlternatives(primary, evidence, "general", {
          maxAlternatives: 2,
          includeConfounder: true,
          includeReverseCausality: true,
          includeSelectionBias: true,
        });

        expect(result.alternatives.length).toBeLessThanOrEqual(2);
      });
    });

    describe("generateCompetingHypotheses", () => {
      it("should generate competing hypotheses", () => {
        const hypotheses = [
          {
            label: "H1: X causes Y",
            mechanism: "Direct effect from X to Y",
            predictors: [{ kind: "variable", id: "X" }],
            expectedEffect: { direction: "positive" as const, magnitude: 0.5 },
          },
          {
            label: "H2: Z causes Y",
            mechanism: "Alternative pathway through Z",
            predictors: [{ kind: "variable", id: "Z" }],
            expectedEffect: { direction: "positive" as const, magnitude: 0.4 },
          },
        ];
        const evidence: EvidencePattern[] = [];

        const result = generateCompetingHypotheses(hypotheses, evidence);

        expect(result.length).toBe(2);
        expect(result[0].confidence).toBeGreaterThan(result[1].confidence);
      });
    });

    describe("rankHypotheses", () => {
      it("should rank hypotheses by 综合 score", () => {
        const hypotheses: HypothesisCandidate[] = [
          {
            id: "h1",
            label: "H1",
            description: "First hypothesis",
            mechanism: "Mechanism 1",
            predictors: [],
            expectedEffect: { direction: "positive" as const, magnitude: 0.5 },
            confidence: 0.9,
            plausibilityScore: 0.8,
            testabilityScore: 0.7,
            parsimonyScore: 0.6,
            notes: [],
          },
          {
            id: "h2",
            label: "H2",
            description: "Second hypothesis",
            mechanism: "Mechanism 2",
            predictors: [],
            expectedEffect: { direction: "negative" as const, magnitude: 0.3 },
            confidence: 0.5,
            plausibilityScore: 0.4,
            testabilityScore: 0.9,
            parsimonyScore: 0.9,
            notes: [],
          },
        ];

        const result = rankHypotheses(hypotheses);

        expect(result.length).toBe(2);
        expect(result[0].综合Score).toBeGreaterThan(result[1].综合Score);
      });
    });

    describe("generateHypothesesFromPattern", () => {
      it("should generate hypotheses from correlation pattern", () => {
        const pattern = {
          observationPattern: "Strong positive correlation between A and B",
          variables: ["A", "B"],
          correlationDirection: "positive" as const,
          strength: 0.8,
        };

        const result = generateHypothesesFromPattern(pattern);

        expect(result.length).toBe(4);
        expect(result[0].label).toContain("Direct Effect");
        expect(result[1].label).toContain("Reverse Causality");
        expect(result[2].label).toContain("Confounding");
        expect(result[3].label).toContain("Mediation");
      });

      it("should handle missing variables", () => {
        const pattern = {
          observationPattern: "Correlation observed",
          variables: ["X"],
          correlationDirection: "negative" as const,
          strength: 0.5,
        };

        const result = generateHypothesesFromPattern(pattern);

        expect(result.length).toBe(3);
      });
    });

    describe("formatHypothesisForReview", () => {
      it("should format hypothesis for review", () => {
        const hypothesis: HypothesisCandidate & { 综合Score?: number } = {
          id: "h1",
          label: "Test Hypothesis",
          description: "A test hypothesis",
          mechanism: "Testing mechanism",
          predictors: [{ kind: "variable", id: "V1" }],
          expectedEffect: { direction: "positive" as const, magnitude: 0.5 },
          confidence: 0.7,
          plausibilityScore: 0.8,
          testabilityScore: 0.6,
          parsimonyScore: 0.9,
          notes: ["Note 1", "Note 2"],
        };

        const result = formatHypothesisForReview(hypothesis);

        expect(result).toContain("## Test Hypothesis");
        expect(result).toContain("**Confidence:** 70%");
        expect(result).toContain("**Parsimony:** 90%");
        expect(result).toContain("variable: V1");
        expect(result).toContain("Note 1");
      });
    });
  });
});
