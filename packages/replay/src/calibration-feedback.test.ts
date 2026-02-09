import { describe, it, expect } from "vitest";
import {
  applyCalibrationWiden,
  configFromRecommendation,
  applyCalibrationToPredictions,
  widenBand,
  wouldCalibrationChange,
  type CalibrationModeConfig,
} from "./calibration-feedback";
import type { Prediction, RecommendedUncertaintyAdjustment } from "@zeo/contracts";

describe("Calibration Feedback", () => {
  const basePrediction: Prediction = {
    target: { kind: "latent_variable", id: "var1" },
    band: { low: 0.3, high: 0.7 },
    provenanceRefs: ["original"],
    basis: {
      decisionHash: "abc",
      observationHash: "def",
      seed: "seed123",
      engineVersion: "0.3.1",
    },
  };

  describe("applyCalibrationWiden", () => {
    it("should return unchanged when disabled", () => {
      const config: CalibrationModeConfig = {
        enabled: false,
        widenFactorByDomain: {},
        widenFactorDefault: 1.0,
      };
      const result = applyCalibrationWiden(basePrediction, "default", config);
      expect(result.band).toEqual(basePrediction.band);
    });

    it("should return unchanged when widen factor <= 1.0", () => {
      const config: CalibrationModeConfig = {
        enabled: true,
        widenFactorByDomain: { default: 1.0 },
        widenFactorDefault: 1.0,
      };
      const result = applyCalibrationWiden(basePrediction, "default", config);
      expect(result.band).toEqual(basePrediction.band);
    });

    it("should widen band when factor > 1.0", () => {
      const config: CalibrationModeConfig = {
        enabled: true,
        widenFactorByDomain: { default: 1.5 },
        widenFactorDefault: 1.0,
      };
      const result = applyCalibrationWiden(basePrediction, "default", config);
      
      // Original: 0.3-0.7 (width 0.4), center 0.5
      // Widened: 1.5x width = 0.6, so 0.2-0.8
      expect(result.band.low).toBe(0.2);
      expect(result.band.high).toBe(0.8);
    });

    it("should preserve band center when widening", () => {
      const config: CalibrationModeConfig = {
        enabled: true,
        widenFactorByDomain: { default: 2.0 },
        widenFactorDefault: 1.0,
      };
      const result = applyCalibrationWiden(basePrediction, "default", config);
      
      const originalCenter = (basePrediction.band.low + basePrediction.band.high) / 2;
      const newCenter = (result.band.low + result.band.high) / 2;
      expect(newCenter).toBeCloseTo(originalCenter);
    });

    it("should clamp to [0, 1] bounds", () => {
      const narrowPrediction: Prediction = {
        ...basePrediction,
        band: { low: 0.05, high: 0.15 }, // Narrow band near edge
      };
      const config: CalibrationModeConfig = {
        enabled: true,
        widenFactorByDomain: { default: 3.0 },
        widenFactorDefault: 1.0,
      };
      const result = applyCalibrationWiden(narrowPrediction, "default", config);
      
      expect(result.band.low).toBeGreaterThanOrEqual(0);
      expect(result.band.high).toBeLessThanOrEqual(1);
    });

    it("should add calibration provenance refs", () => {
      const config: CalibrationModeConfig = {
        enabled: true,
        widenFactorByDomain: { default: 1.5 },
        widenFactorDefault: 1.0,
        sourceDatasetId: "dataset1",
        sourceReportHash: "hash123",
      };
      const result = applyCalibrationWiden(basePrediction, "default", config);
      
      expect(result.provenanceRefs).toContain("original");
      expect(result.provenanceRefs.some(ref => ref.startsWith("calibration_widen:"))).toBe(true);
      expect(result.provenanceRefs.some(ref => ref.startsWith("source:dataset1"))).toBe(true);
    });

    it("should use domain-specific factor when available", () => {
      const config: CalibrationModeConfig = {
        enabled: true,
        widenFactorByDomain: { negotiation: 2.0, default: 1.2 },
        widenFactorDefault: 1.0,
      };
      
      const resultNegotiation = applyCalibrationWiden(basePrediction, "negotiation", config);
      const resultDefault = applyCalibrationWiden(basePrediction, "default", config);
      
      // Negotiation should be wider
      const widthNegotiation = resultNegotiation.band.high - resultNegotiation.band.low;
      const widthDefault = resultDefault.band.high - resultDefault.band.low;
      expect(widthNegotiation).toBeGreaterThan(widthDefault);
    });

    it("should fall back to default factor when domain not in map", () => {
      const config: CalibrationModeConfig = {
        enabled: true,
        widenFactorByDomain: { other: 1.5 },
        widenFactorDefault: 1.2,
      };
      const result = applyCalibrationWiden(basePrediction, "unknown", config);
      
      // Should use 1.2 (widenFactorDefault) since "unknown" not in map
      const originalWidth = basePrediction.band.high - basePrediction.band.low;
      const newWidth = result.band.high - result.band.low;
      expect(newWidth).toBeCloseTo(originalWidth * 1.2);
    });
  });

  describe("configFromRecommendation", () => {
    it("should create enabled config from recommendation", () => {
      const recommendation: RecommendedUncertaintyAdjustment = {
        widenFactorByDomain: { negotiation: 1.5 },
        widenFactorOverall: 1.2,
        rationale: "Undercoverage detected",
      };
      
      const config = configFromRecommendation(recommendation, "ds1", "hash1");
      
      expect(config.enabled).toBe(true);
      expect(config.widenFactorByDomain).toEqual({ negotiation: 1.5 });
      expect(config.widenFactorDefault).toBe(1.2);
      expect(config.sourceDatasetId).toBe("ds1");
      expect(config.sourceReportHash).toBe("hash1");
    });
  });

  describe("applyCalibrationToPredictions", () => {
    it("should apply calibration to all predictions", () => {
      const predictions: Prediction[] = [
        { ...basePrediction, target: { kind: "latent_variable", id: "var1" } },
        { ...basePrediction, target: { kind: "latent_variable", id: "var2" } },
      ];
      
      const config: CalibrationModeConfig = {
        enabled: true,
        widenFactorByDomain: { default: 1.5 },
        widenFactorDefault: 1.0,
      };
      
      const results = applyCalibrationToPredictions(
        predictions,
        () => "default",
        config
      );
      
      expect(results).toHaveLength(2);
      expect(results[0].band).not.toEqual(basePrediction.band);
      expect(results[1].band).not.toEqual(basePrediction.band);
    });

    it("should use domain resolver for each prediction", () => {
      const predictions: Prediction[] = [
        { ...basePrediction, target: { kind: "latent_variable", id: "negotiation_var" } },
        { ...basePrediction, target: { kind: "latent_variable", id: "ops_var" } },
      ];
      
      const config: CalibrationModeConfig = {
        enabled: true,
        widenFactorByDomain: { negotiation: 2.0, ops: 1.2 },
        widenFactorDefault: 1.0,
      };
      
      const results = applyCalibrationToPredictions(
        predictions,
        (p) => p.target.id.split("_")[0],
        config
      );
      
      const negotiationWidth = results[0].band.high - results[0].band.low;
      const opsWidth = results[1].band.high - results[1].band.low;
      expect(negotiationWidth).toBeGreaterThan(opsWidth);
    });

    it("should return unchanged when disabled", () => {
      const predictions: Prediction[] = [basePrediction];
      const config: CalibrationModeConfig = {
        enabled: false,
        widenFactorByDomain: {},
        widenFactorDefault: 1.0,
      };
      
      const results = applyCalibrationToPredictions(predictions, () => "default", config);
      expect(results[0].band).toEqual(basePrediction.band);
    });
  });

  describe("widenBand", () => {
    it("should widen band by factor", () => {
      const original = { low: 0.3, high: 0.7 };
      const result = widenBand(original, 1.5);
      
      expect(result.low).toBe(0.2);
      expect(result.high).toBe(0.8);
    });

    it("should return unchanged when factor <= 1.0", () => {
      const original = { low: 0.3, high: 0.7 };
      const result = widenBand(original, 0.8);
      
      expect(result).toEqual(original);
    });

    it("should preserve center", () => {
      const original = { low: 0.2, high: 0.6 };
      const result = widenBand(original, 2.0);
      
      const originalCenter = (original.low + original.high) / 2;
      const newCenter = (result.low + result.high) / 2;
      expect(newCenter).toBeCloseTo(originalCenter);
    });

    it("should clamp to [0, 1]", () => {
      const original = { low: 0.05, high: 0.15 };
      const result = widenBand(original, 5.0);

      // Original: center 0.10, width 0.10
      // Widened 5x: width 0.50, so [-0.15, 0.35]
      // Clamped: [0, 0.35]
      expect(result.low).toBe(0);
      expect(result.high).toBeLessThanOrEqual(1);
      expect(result.high).toBeGreaterThan(original.high);
    });
  });

  describe("wouldCalibrationChange", () => {
    it("should return false when disabled", () => {
      const config: CalibrationModeConfig = {
        enabled: false,
        widenFactorByDomain: { default: 1.5 },
        widenFactorDefault: 1.0,
      };
      expect(wouldCalibrationChange(basePrediction, "default", config)).toBe(false);
    });

    it("should return false when factor <= 1.0", () => {
      const config: CalibrationModeConfig = {
        enabled: true,
        widenFactorByDomain: { default: 1.0 },
        widenFactorDefault: 1.0,
      };
      expect(wouldCalibrationChange(basePrediction, "default", config)).toBe(false);
    });

    it("should return true when factor > 1.0", () => {
      const config: CalibrationModeConfig = {
        enabled: true,
        widenFactorByDomain: { default: 1.5 },
        widenFactorDefault: 1.0,
      };
      expect(wouldCalibrationChange(basePrediction, "default", config)).toBe(true);
    });
  });
});

