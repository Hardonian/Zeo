import { describe, it, expect } from "vitest";
import {
  assertQualitativeScale,
  assertQualObservation,
  assertBandFinite,
  assertProbabilityInterval,
  enforceNoFakePrecision,
  assertQuantifiedAssumption,
  ZeoError,
} from "./errors.js";

describe("Qualitative Scale Validation", () => {
  describe("assertQualitativeScale", () => {
    it("should accept valid scale", () => {
      const validScale = {
        scaleId: "confidence",
        levels: [
          { label: "low", band: { low: 0.0, "high": 0.3 } },
          { label: "high", band: { low: 0.7, "high": 1.0 } },
        ],
        rules: { monotonic: true },
      };
      expect(() => assertQualitativeScale(validScale)).not.toThrow();
    });

    it("should reject scale without scaleId", () => {
      const invalidScale = {
        scaleId: "",
        levels: [{ label: "low", band: { low: 0.0, "high": 0.5 } }],
      };
      expect(() => assertQualitativeScale(invalidScale as Parameters<typeof assertQualitativeScale>[0])).toThrow(ZeoError);
    });

    it("should reject scale with fewer than 2 levels", () => {
      const invalidScale = {
        scaleId: "test",
        levels: [{ label: "only", band: { low: 0.0, "high": 1.0 } }],
      };
      expect(() => assertQualitativeScale(invalidScale as Parameters<typeof assertQualitativeScale>[0])).toThrow(ZeoError);
    });

    it("should reject non-finite band values", () => {
      const invalidScale = {
        scaleId: "test",
        levels: [
          { label: "low", band: { low: 0.0, "high": NaN } },
          { label: "high", band: { low: 0.5, "high": 1.0 } },
        ],
      };
      expect(() => assertQualitativeScale(invalidScale as Parameters<typeof assertQualitativeScale>[0])).toThrow(ZeoError);
    });

    it("should reject monotonic violation", () => {
      const invalidScale = {
        scaleId: "test",
        levels: [
          { label: "low", band: { low: 0.0, "high": 0.5 } },
          { label: "high", band: { low: 0.3, "high": 1.0 } },
        ],
        rules: { monotonic: true },
      };
      expect(() => assertQualitativeScale(invalidScale as Parameters<typeof assertQualitativeScale>[0])).toThrow(ZeoError);
    });
  });

  describe("assertQualObservation", () => {
    it("should accept valid observation with textProvenance", () => {
      const validObs = {
        id: "obs_001",
        kind: "self_report" as const,
        scaleId: "confidence",
        levelLabel: "medium",
        band: { low: 0.3, "high": 0.7 },
        textProvenance: [{ capturedAt: "2026-01-01T00:00:00Z", checksum: "abc123" }],
        checksum: "abc123",
      };
      expect(() => assertQualObservation(validObs)).not.toThrow();
    });

    it("should reject invalid kind", () => {
      const invalidObs = {
        id: "obs_001",
        kind: "invalid" as const,
        scaleId: "confidence",
        levelLabel: "medium",
        band: { low: 0.3, "high": 0.7 },
        checksum: "abc123",
      };
      expect(() => assertQualObservation(invalidObs as Parameters<typeof assertQualObservation>[0])).toThrow(ZeoError);
    });

    it("should require textProvenance for note_extract", () => {
      const invalidObs = {
        id: "obs_001",
        kind: "note_extract" as const,
        scaleId: "confidence",
        levelLabel: "medium",
        band: { low: 0.3, "high": 0.7 },
        checksum: "abc123",
      };
      expect(() => assertQualObservation(invalidObs as Parameters<typeof assertQualObservation>[0])).toThrow(ZeoError);
    });

    it("should require checksum", () => {
      const invalidObs = {
        id: "obs_001",
        kind: "self_report" as const,
        scaleId: "confidence",
        levelLabel: "medium",
        band: { low: 0.3, "high": 0.7 },
        checksum: "",
      };
      expect(() => assertQualObservation(invalidObs as Parameters<typeof assertQualObservation>[0])).toThrow(ZeoError);
    });
  });

  describe("assertBandFinite", () => {
    it("should accept finite band", () => {
      expect(() => assertBandFinite({ low: 0.0, "high": 1.0 })).not.toThrow();
    });

    it("should reject non-finite values", () => {
      expect(() => assertBandFinite({ low: Infinity, "high": 1.0 })).toThrow(ZeoError);
      expect(() => assertBandFinite({ low: 0.0, "high": -Infinity })).toThrow(ZeoError);
      expect(() => assertBandFinite({ low: NaN, "high": 1.0 })).toThrow(ZeoError);
    });
  });

  describe("assertProbabilityInterval", () => {
    it("should accept valid probability interval", () => {
      expect(() => assertProbabilityInterval({ low: 0.2, "high": 0.8 })).not.toThrow();
    });

    it("should reject interval outside [0,1]", () => {
      expect(() => assertProbabilityInterval({ low: -0.1, "high": 0.5 })).toThrow(ZeoError);
      expect(() => assertProbabilityInterval({ low: 0.5, "high": 1.1 })).toThrow(ZeoError);
    });

    it("should reject low > high", () => {
      expect(() => assertProbabilityInterval({ low: 0.8, "high": 0.5 })).toThrow(ZeoError);
    });
  });

  describe("enforceNoFakePrecision", () => {
    it("should allow wide bands from text", () => {
      expect(() =>
        enforceNoFakePrecision({
          band: { low: 0.3, "high": 0.7 },
          sourceKind: "note_extract",
          hasNumericAnchor: false,
        })
      ).not.toThrow();
    });

    it("should reject narrow bands from text without anchor", () => {
      expect(() =>
        enforceNoFakePrecision({
          band: { low: 0.48, "high": 0.52 },
          sourceKind: "note_extract",
          hasNumericAnchor: false,
        })
      ).toThrow(ZeoError);
    });

    it("should allow narrow bands with numeric anchor", () => {
      expect(() =>
        enforceNoFakePrecision({
          band: { low: 0.48, "high": 0.52 },
          sourceKind: "note_extract",
          hasNumericAnchor: true,
        })
      ).not.toThrow();
    });

    it("should respect custom minWidth", () => {
      expect(() =>
        enforceNoFakePrecision({
          band: { low: 0.4, "high": 0.55 },
          sourceKind: "note_extract",
          hasNumericAnchor: false,
          minWidth: 0.2,
        })
      ).toThrow(ZeoError);
    });

    it("should allow narrow bands from sensor_meta", () => {
      expect(() =>
        enforceNoFakePrecision({
          band: { low: 0.48, "high": 0.52 },
          sourceKind: "sensor_meta",
          hasNumericAnchor: false,
        })
      ).not.toThrow();
    });
  });

  describe("assertQuantifiedAssumption", () => {
    it("should accept valid assumption", () => {
      const validAssumption = {
        assumptionId: "ass_001",
        label: "Test assumption",
        band: { low: 0.2, "high": 0.8 },
      };
      expect(() => assertQuantifiedAssumption(validAssumption)).not.toThrow();
    });

    it("should reject probability band outside [0,1]", () => {
      const invalidAssumption = {
        assumptionId: "ass_001",
        label: "Test",
        band: { low: -0.1, "high": 0.5 },
      };
      expect(() => assertQuantifiedAssumption(invalidAssumption as Parameters<typeof assertQuantifiedAssumption>[0])).toThrow(ZeoError);
    });

    it("should reject missing assumptionId", () => {
      const invalidAssumption = {
        assumptionId: "",
        label: "Test",
        band: { low: 0.2, "high": 0.8 },
      };
      expect(() => assertQuantifiedAssumption(invalidAssumption as Parameters<typeof assertQuantifiedAssumption>[0])).toThrow(ZeoError);
    });

    it("should accept assumption with derivedFrom", () => {
      const validAssumption = {
        assumptionId: "ass_001",
        label: "Derived assumption",
        band: { low: 0.2, "high": 0.8 },
        derivedFrom: {
          qualObservationId: "obs_001",
          mappingRuleId: "map_001",
        },
      };
      expect(() => assertQuantifiedAssumption(validAssumption)).not.toThrow();
    });
  });
});

