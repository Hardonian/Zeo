import { describe, it, expect, beforeEach } from "vitest";
import {
  ScaleRegistry,
  checkScaleCompatibility,
  assertCompatibleScales,
  assertOperationAllowed,
  computeMean,
  computeDifference,
  computeRatio,
  createMeasurementValue,
  MeasurementError,
  BUILTIN_SCALES,
} from "../src/index.js";

describe("Measurement Theory Layer", () => {
  let registry: ScaleRegistry;

  beforeEach(() => {
    registry = new ScaleRegistry();
  });

  describe("ScaleRegistry", () => {
    it("should initialize with built-in scales", () => {
      const scales = registry.list();
      expect(scales.length).toBeGreaterThan(0);
      expect(registry.has("nominal_default")).toBe(true);
      expect(registry.has("ratio_usd")).toBe(true);
    });

    it("should register custom scales", () => {
      registry.register({
        id: "custom_scale",
        type: "ratio",
        unit: "widgets",
        forbiddenOps: [],
      });
      expect(registry.has("custom_scale")).toBe(true);
    });
  });

  describe("Scale Compatibility", () => {
    it("should allow same scale comparison", () => {
      const scale = BUILTIN_SCALES.ratio_usd;
      const result = checkScaleCompatibility(scale, scale);
      expect(result.compatible).toBe(true);
    });

    it("should forbid averaging ordinal scales", () => {
      const ordinalScale = BUILTIN_SCALES.ordinal_likert;
      expect(() => assertOperationAllowed(ordinalScale, "mean")).toThrow(MeasurementError);
    });

    it("should forbid comparing different currencies directly", () => {
      const usd = BUILTIN_SCALES.ratio_usd;
      const eur = BUILTIN_SCALES.ratio_eur;
      expect(() => assertCompatibleScales(usd, eur)).toThrow(MeasurementError);
    });

    it("should allow ratio operations on ratio scales", () => {
      const ratio = BUILTIN_SCALES.ratio_seconds;
      expect(() => assertOperationAllowed(ratio, "ratio")).not.toThrow();
    });

    it("should forbid ratio operations on interval scales", () => {
      const celsius = BUILTIN_SCALES.interval_celsius;
      expect(() => assertOperationAllowed(celsius, "ratio")).toThrow(MeasurementError);
    });

    it("should allow diff on interval scales", () => {
      const celsius = BUILTIN_SCALES.interval_celsius;
      expect(() => assertOperationAllowed(celsius, "diff")).not.toThrow();
    });
  });

  describe("computeMean", () => {
    it("should compute mean for ratio scale values", () => {
      const scale = BUILTIN_SCALES.ratio_usd;
      const values = [
        createMeasurementValue("ratio_usd", 100),
        createMeasurementValue("ratio_usd", 200),
        createMeasurementValue("ratio_usd", 300),
      ];

      const result = computeMean(values, scale);
      expect(result.point).toBe(200);
    });

    it("should throw when averaging ordinal values", () => {
      const scale = BUILTIN_SCALES.ordinal_likert;
      const values = [
        createMeasurementValue("ordinal_likert", 1),
        createMeasurementValue("ordinal_likert", 2),
        createMeasurementValue("ordinal_likert", 3),
      ];

      expect(() => computeMean(values, scale)).toThrow(MeasurementError);
    });

    it("should compute mean from value bands", () => {
      const scale = BUILTIN_SCALES.ratio_usd;
      const values = [
        createMeasurementValue("ratio_usd", { low: 90, high: 110 }),
        createMeasurementValue("ratio_usd", { low: 190, high: 210 }),
      ];

      const result = computeMean(values, scale);
      expect(result.low).toBe(140);
      expect(result.high).toBe(160);
    });
  });

  describe("computeDifference", () => {
    it("should compute difference for interval scales", () => {
      const scale = BUILTIN_SCALES.interval_celsius;
      const a = createMeasurementValue("interval_celsius", 30);
      const b = createMeasurementValue("interval_celsius", 20);

      const result = computeDifference(a, b, scale);
      expect(result.point).toBe(10);
    });

    it("should handle value bands in difference", () => {
      const scale = BUILTIN_SCALES.interval_celsius;
      const a = createMeasurementValue("interval_celsius", { low: 28, high: 32 });
      const b = createMeasurementValue("interval_celsius", { low: 18, high: 22 });

      const result = computeDifference(a, b, scale);
      expect(result.low).toBe(6);
      expect(result.high).toBe(14);
    });
  });

  describe("computeRatio", () => {
    it("should compute ratio for ratio scales", () => {
      const scale = BUILTIN_SCALES.ratio_seconds;
      const a = createMeasurementValue("ratio_seconds", 60);
      const b = createMeasurementValue("ratio_seconds", 30);

      const result = computeRatio(a, b, scale);
      expect(result.point).toBe(2);
    });

    it("should throw for interval scales", () => {
      const celsius = BUILTIN_SCALES.interval_celsius;
      const a = createMeasurementValue("interval_celsius", 30);
      const b = createMeasurementValue("interval_celsius", 15);

      expect(() => computeRatio(a, b, celsius)).toThrow(MeasurementError);
    });

    it("should throw on division by zero", () => {
      const scale = BUILTIN_SCALES.ratio_usd;
      const a = createMeasurementValue("ratio_usd", 100);
      const b = createMeasurementValue("ratio_usd", 0);

      expect(() => computeRatio(a, b, scale)).toThrow(MeasurementError);
    });
  });

  describe("createMeasurementValue", () => {
    it("should create value from number", () => {
      const mv = createMeasurementValue("ratio_usd", 100);
      expect(mv.scaleId).toBe("ratio_usd");
      expect(mv.value).toBe(100);
      expect(mv.band).toBeUndefined();
      expect(mv.recordedAt).toBeDefined();
    });

    it("should create value from band", () => {
      const mv = createMeasurementValue("ratio_usd", { low: 90, high: 110 });
      expect(mv.scaleId).toBe("ratio_usd");
      expect(mv.value).toBeUndefined();
      expect(mv.band).toEqual({ low: 90, high: 110 });
    });
  });

  describe("Forbidden Operations", () => {
    it("should prevent averaging ordinal scales (Likert)", () => {
      const scale = BUILTIN_SCALES.ordinal_likert;
      const values = [
        createMeasurementValue("ordinal_likert", 1),
        createMeasurementValue("ordinal_likert", 2),
        createMeasurementValue("ordinal_likert", 5),
      ];

      expect(() => computeMean(values, scale)).toThrow(/mean.*not allowed/);
    });

    it("should prevent summing probabilities", () => {
      const scale = BUILTIN_SCALES.probability_default;
      expect(() => assertOperationAllowed(scale, "sum")).toThrow(/sum.*not allowed/);
    });

    it("should prevent comparing incompatible units (currencies)", () => {
      const usd = BUILTIN_SCALES.ratio_usd;
      const eur = BUILTIN_SCALES.ratio_eur;

      expect(() => assertCompatibleScales(usd, eur)).toThrow(/different currencies/);
    });
  });
});
