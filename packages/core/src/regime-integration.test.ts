import { describe, it, expect } from "vitest";
import {
  regimeAwareBandWidth,
  widenPosteriorBand,
  widenPosteriors,
  createRegimeAdjustmentRecord,
  regimeAdjustmentFromBand,
} from "./regime-integration";
import type { RegimeState } from "@zeo/contracts";
import type { PosteriorSummary } from "@zeo/models";

describe("regime-aware band widening", () => {
  const stableRegime: RegimeState = {
    domain: "market",
    currentLabel: "stable",
    updatedAt: new Date().toISOString(),
    parameters: { transitionProbability: 0.05 },
  };

  const transitionRegime: RegimeState = {
    domain: "market",
    currentLabel: "transition",
    updatedAt: new Date().toISOString(),
    parameters: { transitionProbability: 0.5 },
  };

  const volatileRegime: RegimeState = {
    domain: "market",
    currentLabel: "volatile",
    updatedAt: new Date().toISOString(),
    parameters: { volatilityIndex: 0.8 },
  };

  describe("regimeAwareBandWidth", () => {
    it("returns stable multiplier when regime is undefined", () => {
      expect(regimeAwareBandWidth(undefined)).toBe(1.0);
    });

    it("returns stable multiplier for stable regime", () => {
      expect(regimeAwareBandWidth(stableRegime)).toBe(1.0);
    });

    it("returns transition multiplier for transition regime", () => {
      expect(regimeAwareBandWidth(transitionRegime)).toBe(2.0);
    });

    it("returns volatility multiplier for volatile regime", () => {
      expect(regimeAwareBandWidth(volatileRegime)).toBe(1.5);
    });

    it("uses custom config when provided", () => {
      expect(
        regimeAwareBandWidth(stableRegime, { stableMultiplier: 0.8 })
      ).toBe(0.8);
      expect(
        regimeAwareBandWidth(transitionRegime, { transitionMultiplier: 3.0 })
      ).toBe(3.0);
    });
  });

  describe("widenPosteriorBand", () => {
    it("does not widen band for stable regime", () => {
      const band = { low: 0.3, high: 0.7 };
      const result = widenPosteriorBand(band, stableRegime);
      expect(result.low).toBeCloseTo(0.3, 4);
      expect(result.high).toBeCloseTo(0.7, 4);
    });

    it("doubles band width for transition regime", () => {
      const band = { low: 0.3, high: 0.7 };
      const result = widenPosteriorBand(band, transitionRegime);
      const originalWidth = band.high - band.low;
      const newWidth = result.high - result.low;
      expect(newWidth).toBeCloseTo(originalWidth * 2.0, 4);
    });

    it("widens by 1.5x for volatile regime", () => {
      const band = { low: 0.3, high: 0.7 };
      const result = widenPosteriorBand(band, volatileRegime);
      const originalWidth = band.high - band.low;
      const newWidth = result.high - result.low;
      expect(newWidth).toBeCloseTo(originalWidth * 1.5, 4);
    });

    it("clamps band to valid probability range [0, 1]", () => {
      const narrowBand = { low: 0.01, high: 0.02 };
      const result = widenPosteriorBand(narrowBand, transitionRegime);
      expect(result.low).toBeGreaterThanOrEqual(0);
      expect(result.high).toBeLessThanOrEqual(1);
    });

    it("respects maxBandWidth limit", () => {
      const wideBand = { low: 0.1, high: 0.95 };
      const result = widenPosteriorBand(wideBand, transitionRegime, {
        maxBandWidth: 0.5,
      });
      expect(result.high - result.low).toBeLessThanOrEqual(0.5);
    });
  });

  describe("widenPosteriors", () => {
    it("widens all posterior credible intervals", () => {
      const posteriors: PosteriorSummary[] = [
        {
          variableId: "v1",
          mean: 0.5,
          median: 0.5,
          std: 0.1,
          credibleInterval: { low: 0.3, high: 0.7 },
          samples: [],
          convergenceDiagnostics: { rHat: 1.0, effectiveSampleSize: 100, divergences: 0 },
        },
        {
          variableId: "v2",
          mean: 0.6,
          median: 0.6,
          std: 0.15,
          credibleInterval: { low: 0.4, high: 0.8 },
          samples: [],
          convergenceDiagnostics: { rHat: 1.0, effectiveSampleSize: 100, divergences: 0 },
        },
      ];

      const result = widenPosteriors(posteriors, transitionRegime);

      expect(result[0].credibleInterval.high - result[0].credibleInterval.low).toBeGreaterThan(
        posteriors[0].credibleInterval.high - posteriors[0].credibleInterval.low
      );
      expect(result[1].credibleInterval.high - result[1].credibleInterval.low).toBeGreaterThan(
        posteriors[1].credibleInterval.high - posteriors[1].credibleInterval.low
      );
    });

    it("preserves other posterior properties", () => {
      const posteriors: PosteriorSummary[] = [
        {
          variableId: "v1",
          mean: 0.5,
          median: 0.5,
          std: 0.1,
          credibleInterval: { low: 0.3, high: 0.7 },
          samples: [0.1, 0.2, 0.3],
          convergenceDiagnostics: { rHat: 1.01, effectiveSampleSize: 500, divergences: 2 },
        },
      ];

      const result = widenPosteriors(posteriors, stableRegime);

      expect(result[0].variableId).toBe("v1");
      expect(result[0].mean).toBe(0.5);
      expect(result[0].samples).toEqual([0.1, 0.2, 0.3]);
      expect(result[0].convergenceDiagnostics.rHat).toBe(1.01);
    });
  });

  describe("createRegimeAdjustmentRecord", () => {
    it("creates a valid adjustment record", () => {
      const original = { low: 0.3, high: 0.7 };
      const widened = { low: 0.2, high: 0.8 };

      const record = createRegimeAdjustmentRecord(
        "v1",
        original,
        widened,
        transitionRegime,
        "transition_detected"
      );

      expect(record.variableId).toBe("v1");
      expect(record.originalBand).toEqual(original);
      expect(record.widenedBand).toEqual(widened);
      expect(record.regimeAtAdjustment).toBe(transitionRegime);
      expect(record.adjustmentReason).toBe("transition_detected");
      expect(record.timestamp).toBeDefined();
    });
  });

  describe("regimeAdjustmentFromBand", () => {
    it("returns transition_detected for transition regime", () => {
      const original = { low: 0.3, high: 0.7 };
      const widened = { low: 0.1, high: 0.9 };

      const reason = regimeAdjustmentFromBand(original, widened, transitionRegime);

      expect(reason).toBe("transition_detected");
    });

    it("returns high_volatility for volatile regime", () => {
      const original = { low: 0.3, high: 0.7 };
      const widened = { low: 0.2, high: 0.8 };

      const reason = regimeAdjustmentFromBand(original, widened, volatileRegime);

      expect(reason).toBe("high_volatility");
    });

    it("returns regime_uncertainty when regime is undefined", () => {
      const original = { low: 0.3, high: 0.7 };
      const widened = { low: 0.25, high: 0.75 };

      const reason = regimeAdjustmentFromBand(original, widened, undefined);

      expect(reason).toBe("regime_uncertainty");
    });

    it("returns regime_uncertainty for stable regime", () => {
      const original = { low: 0.3, high: 0.7 };
      const widened = { low: 0.28, high: 0.72 };

      const reason = regimeAdjustmentFromBand(original, widened, stableRegime);

      expect(reason).toBe("regime_uncertainty");
    });
  });
});

