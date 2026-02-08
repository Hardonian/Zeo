/**
 * Measurement Theory Layer
 *
 * Prevents category errors and invalid mathematical operations
 * by enforcing scale-aware computation.
 */

import type { ProvenancePointer } from "@zeo/contracts";

/**
 * Stevens' four levels of measurement plus probability
 */
export type ScaleType = "nominal" | "ordinal" | "interval" | "ratio" | "probability";

/**
 * Mathematical operations that can be performed on measurements
 */
export type MeasurementOperation = "mean" | "sum" | "diff" | "ratio" | "median" | "mode" | "rank" | "compare" | "classify";

/**
 * Definition of a measurement scale
 */
export interface MeasurementScale {
  id: string;
  type: ScaleType;
  unit?: string;
  comparableWith?: string[];
  forbiddenOps: MeasurementOperation[];
  description?: string;
}

/**
 * A value band represents uncertainty as a range
 */
export interface ValueBand {
  low: number;
  high: number;
  point?: number;
}

/**
 * A measured value with provenance
 */
export interface MeasurementValue {
  scaleId: string;
  value?: number;
  band?: ValueBand;
  provenance: ProvenancePointer[];
  recordedAt: string;
}

/**
 * Error thrown when measurement operations are invalid
 */
export class MeasurementError extends Error {
  constructor(
    message: string,
    public readonly scaleId: string,
    public readonly operation: MeasurementOperation
  ) {
    super(message);
    this.name = "MeasurementError";
  }
}

/**
 * Scale compatibility check result
 */
export interface CompatibilityResult {
  compatible: boolean;
  reason?: string;
}

// Built-in scale definitions
export const BUILTIN_SCALES: Record<string, MeasurementScale> = {
  nominal_default: {
    id: "nominal_default",
    type: "nominal",
    forbiddenOps: ["mean", "sum", "diff", "ratio", "median"],
    description: "Categories without order (e.g., colors, types)",
  },
  ordinal_likert: {
    id: "ordinal_likert",
    type: "ordinal",
    forbiddenOps: ["mean", "sum", "ratio"],
    description: "Ordered categories with non-uniform intervals (e.g., Likert scales)",
  },
  interval_celsius: {
    id: "interval_celsius",
    type: "interval",
    unit: "celsius",
    comparableWith: ["interval_fahrenheit", "interval_kelvin"],
    forbiddenOps: ["ratio"],
    description: "Temperature in Celsius - no true zero",
  },
  interval_fahrenheit: {
    id: "interval_fahrenheit",
    type: "interval",
    unit: "fahrenheit",
    comparableWith: ["interval_celsius", "interval_kelvin"],
    forbiddenOps: ["ratio"],
    description: "Temperature in Fahrenheit - no true zero",
  },
  interval_kelvin: {
    id: "interval_kelvin",
    type: "interval",
    unit: "kelvin",
    comparableWith: ["interval_celsius", "interval_fahrenheit"],
    forbiddenOps: [],
    description: "Temperature in Kelvin - has true zero",
  },
  ratio_usd: {
    id: "ratio_usd",
    type: "ratio",
    unit: "USD",
    comparableWith: [],
    forbiddenOps: [],
    description: "US Dollar amounts",
  },
  ratio_eur: {
    id: "ratio_eur",
    type: "ratio",
    unit: "EUR",
    comparableWith: [],
    forbiddenOps: [],
    description: "Euro amounts",
  },
  ratio_gbp: {
    id: "ratio_gbp",
    type: "ratio",
    unit: "GBP",
    comparableWith: [],
    forbiddenOps: [],
    description: "British Pound amounts",
  },
  ratio_seconds: {
    id: "ratio_seconds",
    type: "ratio",
    unit: "seconds",
    comparableWith: ["ratio_minutes", "ratio_hours", "ratio_days"],
    forbiddenOps: [],
    description: "Time duration in seconds",
  },
  probability_default: {
    id: "probability_default",
    type: "probability",
    unit: "probability",
    comparableWith: [],
    forbiddenOps: ["sum"],
    description: "Probability values in [0, 1]",
  },
};

/**
 * Registry of measurement scales
 */
export class ScaleRegistry {
  private scales = new Map<string, MeasurementScale>();

  constructor() {
    // Register built-in scales
    for (const scale of Object.values(BUILTIN_SCALES)) {
      this.scales.set(scale.id, scale);
    }
  }

  register(scale: MeasurementScale): void {
    this.scales.set(scale.id, scale);
  }

  get(id: string): MeasurementScale | undefined {
    return this.scales.get(id);
  }

  has(id: string): boolean {
    return this.scales.has(id);
  }

  list(): MeasurementScale[] {
    return Array.from(this.scales.values());
  }
}

// Global registry instance
export const scaleRegistry = new ScaleRegistry();

/**
 * Check if two scales are compatible for comparison
 */
export function checkScaleCompatibility(a: MeasurementScale, b: MeasurementScale): CompatibilityResult {
  // Same scale is always compatible
  if (a.id === b.id) {
    return { compatible: true };
  }

  // Check explicit compatibility list
  if (a.comparableWith?.includes(b.id) || b.comparableWith?.includes(a.id)) {
    return { compatible: true };
  }

  // Nominal scales only compatible with same nominal
  if (a.type === "nominal" || b.type === "nominal") {
    return {
      compatible: false,
      reason: `Nominal scale '${a.id}' can only be compared with itself`,
    };
  }

  // Probability scales are special
  if (a.type === "probability" || b.type === "probability") {
    if (a.type !== b.type) {
      return {
        compatible: false,
        reason: `Probability scale cannot be mixed with ${b.type} scale`,
      };
    }
  }

  // Different currencies cannot be directly compared
  if (a.unit && b.unit) {
    const currencyPattern = /^(USD|EUR|GBP|JPY|CHF|CAD|AUD)$/;
    const aIsCurrency = currencyPattern.test(a.unit);
    const bIsCurrency = currencyPattern.test(b.unit);
    if (aIsCurrency && bIsCurrency && a.unit !== b.unit) {
      return {
        compatible: false,
        reason: `Cannot directly compare different currencies: ${a.unit} vs ${b.unit}. Convert first.`,
      };
    }
  }

  // Same type scales are generally compatible
  if (a.type === b.type) {
    return { compatible: true };
  }

  // Ordinal with interval/ratio is not allowed
  if (a.type === "ordinal" && (b.type === "interval" || b.type === "ratio")) {
    return {
      compatible: false,
      reason: `Cannot compare ordinal scale '${a.id}' with ${b.type} scale '${b.id}'`,
    };
  }

  if (b.type === "ordinal" && (a.type === "interval" || a.type === "ratio")) {
    return {
      compatible: false,
      reason: `Cannot compare ${a.type} scale '${a.id}' with ordinal scale '${b.id}'`,
    };
  }

  return { compatible: true };
}

/**
 * Assert that two scales are compatible for comparison.
 * Throws MeasurementError if incompatible.
 */
export function assertCompatibleScales(a: MeasurementScale, b: MeasurementScale): void {
  const result = checkScaleCompatibility(a, b);
  if (!result.compatible) {
    throw new MeasurementError(
      result.reason ?? `Scales '${a.id}' and '${b.id}' are incompatible`,
      a.id,
      "compare"
    );
  }
}

/**
 * Check if an operation is allowed on a given scale
 */
export function isOperationAllowed(scale: MeasurementScale, operation: MeasurementOperation): boolean {
  return !scale.forbiddenOps.includes(operation);
}

/**
 * Assert that an operation is allowed on a scale.
 * Throws MeasurementError if not allowed.
 */
export function assertOperationAllowed(scale: MeasurementScale, operation: MeasurementOperation): void {
  if (!isOperationAllowed(scale, operation)) {
    throw new MeasurementError(
      `Operation '${operation}' is not allowed on ${scale.type} scale '${scale.id}'`,
      scale.id,
      operation
    );
  }
}

/**
 * Compute mean with scale validation
 */
export function computeMean(values: MeasurementValue[], scale: MeasurementScale): ValueBand {
  assertOperationAllowed(scale, "mean");

  if (values.length === 0) {
    return { low: 0, high: 0 };
  }

  let sumPoint = 0;
  let sumLow = 0;
  let sumHigh = 0;
  let count = 0;

  for (const mv of values) {
    if (mv.scaleId !== scale.id) {
      throw new MeasurementError(
        `Value with scale '${mv.scaleId}' incompatible with target scale '${scale.id}'`,
        mv.scaleId,
        "mean"
      );
    }

    if (mv.value !== undefined) {
      sumPoint += mv.value;
      sumLow += mv.value;
      sumHigh += mv.value;
    } else if (mv.band) {
      sumPoint += (mv.band.low + mv.band.high) / 2;
      sumLow += mv.band.low;
      sumHigh += mv.band.high;
    }
    count++;
  }

  return {
    low: sumLow / count,
    high: sumHigh / count,
    point: sumPoint / count,
  };
}

/**
 * Compute difference with scale validation
 */
export function computeDifference(a: MeasurementValue, b: MeasurementValue, scale: MeasurementScale): ValueBand {
  assertOperationAllowed(scale, "diff");
  assertCompatibleScales(
    { ...scale, id: a.scaleId },
    { ...scale, id: b.scaleId }
  );

  const aVal = a.value ?? ((a.band?.low ?? 0) + (a.band?.high ?? 0)) / 2;
  const bVal = b.value ?? ((b.band?.low ?? 0) + (b.band?.high ?? 0)) / 2;

  const aLow = a.band?.low ?? aVal;
  const aHigh = a.band?.high ?? aVal;
  const bLow = b.band?.low ?? bVal;
  const bHigh = b.band?.high ?? bVal;

  return {
    low: aLow - bHigh,
    high: aHigh - bLow,
    point: aVal - bVal,
  };
}

/**
 * Compute ratio with scale validation (requires ratio scale)
 */
export function computeRatio(a: MeasurementValue, b: MeasurementValue, scale: MeasurementScale): ValueBand {
  assertOperationAllowed(scale, "ratio");
  assertCompatibleScales(
    { ...scale, id: a.scaleId },
    { ...scale, id: b.scaleId }
  );

  const aVal = a.value ?? ((a.band?.low ?? 0) + (a.band?.high ?? 0)) / 2;
  const bVal = b.value ?? ((b.band?.low ?? 0) + (b.band?.high ?? 0)) / 2;

  if (bVal === 0) {
    throw new MeasurementError("Cannot compute ratio with zero denominator", scale.id, "ratio");
  }

  const aLow = a.band?.low ?? aVal;
  const aHigh = a.band?.high ?? aVal;
  const bLow = b.band?.low ?? bVal;
  const bHigh = b.band?.high ?? bVal;

  // Avoid division by zero in bands
  const safeBLow = bLow === 0 ? 0.0001 : bLow;
  const safeBHigh = bHigh === 0 ? 0.0001 : bHigh;

  return {
    low: Math.min(aLow / safeBHigh, aHigh / safeBLow),
    high: Math.max(aLow / safeBHigh, aHigh / safeBLow),
    point: aVal / bVal,
  };
}

/**
 * Create a measurement value
 */
export function createMeasurementValue(
  scaleId: string,
  value: number | ValueBand,
  provenance: ProvenancePointer[] = []
): MeasurementValue {
  if (typeof value === "number") {
    return {
      scaleId,
      value,
      provenance,
      recordedAt: new Date().toISOString(),
    };
  }
  return {
    scaleId,
    band: value,
    provenance,
    recordedAt: new Date().toISOString(),
  };
}
