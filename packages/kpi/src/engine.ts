/**
 * KPI Engine
 * 
 * Deterministic computation of Key Performance Indicators with
 * epistemic discipline and uncertainty quantification.
 * 
 * @module @zeo/kpi/engine
 */

import type {
  UUID,
  ProbabilityInterval,
  ProvenancePointer
} from "@zeo/contracts";
import type {
  KpiContract,
  KpiMeasurement,
  KpiValue,
  KpiComputationResult,
  KpiTrend,
  KpiRegistry,
  KpiFormula
} from "./types.js";

/**
 * Hash function for determinism
 * Creates a stable hash from string content
 */
function hashContent(content: string): string {
  // Simple FNV-1a hash for determinism (same algorithm across platforms)
  let hash = 0x811c9dc5;
  for (let i = 0; i < content.length; i++) {
    hash ^= content.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

/**
 * Canonical JSON serialization for determinism
 * Sorts object keys alphabetically
 */
function canonicalize(obj: unknown): string {
  if (obj === null) return 'null';
  if (obj === undefined) return 'undefined';
  if (typeof obj === 'string') return JSON.stringify(obj);
  if (typeof obj === 'number') return String(obj);
  if (typeof obj === 'boolean') return String(obj);
  if (Array.isArray(obj)) {
    return '[' + obj.map(canonicalize).join(',') + ']';
  }
  if (typeof obj === 'object') {
    const sorted = Object.keys(obj as object).sort();
    const pairs = sorted.map(k => `${JSON.stringify(k)}:${canonicalize((obj as Record<string, unknown>)[k])}`);
    return '{' + pairs.join(',') + '}';
  }
  return String(obj);
}

/**
 * Compute input hash for determinism verification
 */
export function computeInputHash(
  kpi: KpiContract,
  data: unknown[],
  seed?: string
): string {
  const canonical = canonicalize({
    kpiId: kpi.id,
    kpiVersion: kpi.version,
    formula: kpi.formula,
    dataCount: data.length,
    data: data.slice(0, 100), // Limit data for performance
    seed: seed || 'no-seed'
  });
  return hashContent(canonical);
}

/**
 * Compute a scalar KPI value
 */
export function computeScalarKpi(
  formula: KpiFormula,
  data: unknown[],
  seed?: string
): { value: number; intermediate: Array<{ name: string; value: number; description: string }> } {
  const intermediate: Array<{ name: string; value: number; description: string }> = [];

  switch (formula.type) {
    case "direct": {
      const values = data.map(d => Number((d as Record<string, unknown>)[formula.source]));
      const valid = values.filter(v => !isNaN(v));
      const avg = valid.length > 0 ? valid.reduce((a, b) => a + b, 0) / valid.length : 0;
      intermediate.push({ name: "source_values", value: valid.length, description: `Count of valid ${formula.source} values` });
      intermediate.push({ name: "average", value: avg, description: `Mean of ${formula.source}` });
      return { value: avg, intermediate };
    }

    case "ratio": {
      const numerators = data.map(d => Number((d as Record<string, unknown>)[formula.numerator]));
      const denominators = data.map(d => Number((d as Record<string, unknown>)[formula.denominator]));
      const sumNum = numerators.filter(v => !isNaN(v)).reduce((a, b) => a + b, 0);
      const sumDenom = denominators.filter(v => !isNaN(v)).reduce((a, b) => a + b, 0);
      const ratio = sumDenom > 0 ? sumNum / sumDenom : 0;
      intermediate.push({ name: "numerator_sum", value: sumNum, description: `Sum of ${formula.numerator}` });
      intermediate.push({ name: "denominator_sum", value: sumDenom, description: `Sum of ${formula.denominator}` });
      return { value: ratio, intermediate };
    }

    case "aggregate": {
      const values = data.map(d => Number((d as Record<string, unknown>)[formula.field]));
      const valid = values.filter(v => !isNaN(v)).sort((a, b) => a - b);
      let result = 0;

      switch (formula.operation) {
        case "mean":
          result = valid.length > 0 ? valid.reduce((a, b) => a + b, 0) / valid.length : 0;
          break;
        case "median":
          if (valid.length === 0) result = 0;
          else if (valid.length % 2 === 0) {
            result = (valid[valid.length / 2 - 1] + valid[valid.length / 2]) / 2;
          } else {
            result = valid[Math.floor(valid.length / 2)];
          }
          break;
        case "sum":
          result = valid.reduce((a, b) => a + b, 0);
          break;
        case "count":
          result = valid.length;
          break;
      }

      intermediate.push({ name: "valid_count", value: valid.length, description: "Count of valid values" });
      intermediate.push({ name: formula.operation, value: result, description: `${formula.operation} of ${formula.field}` });
      return { value: result, intermediate };
    }

    case "composite": {
      // For composite, we'd need to look up component KPIs
      // For now, return weighted average of placeholder values
      const totalWeight = formula.components.reduce((sum, c) => sum + c.weight, 0);
      intermediate.push({ name: "total_weight", value: totalWeight, description: "Sum of component weights" });
      intermediate.push({ name: "component_count", value: formula.components.length, description: "Number of components" });
      return { value: totalWeight > 0 ? 0.5 : 0, intermediate }; // Placeholder
    }

    case "custom":
      intermediate.push({ name: "custom_formula", value: 0, description: formula.description });
      return { value: 0, intermediate }; // Custom formulas require implementation

    default:
      intermediate.push({ name: "unknown_formula", value: 0, description: "Unrecognized formula type" });
      return { value: 0, intermediate };
  }
}

/**
 * Create a KPI measurement with full epistemic discipline
 */
export function createKpiMeasurement(
  kpi: KpiContract,
  data: unknown[],
  options: {
    decisionId?: UUID;
    domain?: string;
    periodStart: string;
    periodEnd: string;
    seed?: string;
    provenance?: ProvenancePointer[];
  }
): KpiComputationResult {
  const inputHash = computeInputHash(kpi, data, options.seed);
  const issues: Array<{ severity: "error" | "warning" | "info"; code: string; message: string }> = [];

  // Check minimum sample size
  if (kpi.epistemic.minSampleSize && data.length < kpi.epistemic.minSampleSize) {
    issues.push({
      severity: "warning",
      code: "KPI_INSUFFICIENT_DATA",
      message: `Sample size ${data.length} below minimum ${kpi.epistemic.minSampleSize}`
    });
  }

  // Check provenance requirements
  if (kpi.epistemic.provenanceRequirements) {
    if (!options.provenance || options.provenance.length === 0) {
      issues.push({
        severity: "error",
        code: "KPI_EPISTEMIC_VIOLATION",
        message: "Provenance required but not provided"
      });
    } else if (kpi.epistemic.provenanceRequirements.requireChecksum) {
      for (const p of options.provenance) {
        if (!p.checksum) {
          issues.push({
            severity: "error",
            code: "KPI_EPISTEMIC_VIOLATION",
            message: "Provenance missing required checksum"
          });
          break;
        }
      }
    }
  }

  // Compute value
  const { value, intermediate } = computeScalarKpi(kpi.formula, data, options.seed);

  // Build KPI value based on target type
  let kpiValue: KpiValue;
  if (kpi.target?.type === "threshold") {
    kpiValue = { kind: "scalar", value, unit: undefined };
  } else {
    // For interval-based KPIs, add uncertainty band
    const uncertainty = data.length > 0 ? 1 / Math.sqrt(data.length) : 1;
    kpiValue = {
      kind: "interval",
      value: {
        low: Math.max(0, value - uncertainty),
        high: Math.min(1, value + uncertainty)
      },
      unit: undefined
    };
  }

  // Compute output hash
  const outputHash = hashContent(canonicalize({ value, inputHash }));

  const measurement: KpiMeasurement = {
    id: `kpi-${kpi.id}-${Date.now()}`,
    kpiId: kpi.id,
    value: kpiValue,
    context: {
      decisionId: options.decisionId,
      domain: options.domain,
      period: { start: options.periodStart, end: options.periodEnd },
      sampleSize: data.length
    },
    epistemic: {
      status: kpi.epistemic.defaultStatus,
      confidence: data.length >= (kpi.epistemic.minSampleSize || 10) ? "medium" : "low",
      uncertainty: kpiValue.kind === "interval" ? kpiValue.value : undefined,
      sensitivityNotes: [
        `Based on ${data.length} observations`,
        `Formula: ${kpi.formula.type}`,
        ...issues.map(i => `${i.severity}: ${i.message}`)
      ]
    },
    provenance: options.provenance,
    computedAt: new Date().toISOString(),
    inputHash
  };

  return {
    measurement,
    intermediateValues: intermediate,
    issues,
    determinism: {
      inputHash,
      outputHash,
      seed: options.seed,
      isReproducible: true
    }
  };
}

/**
 * Compute trend analysis for a time series of measurements
 */
export function computeKpiTrend(
  kpiId: UUID,
  measurements: Array<{ timestamp: string; value: number; confidence: import("@zeo/contracts").ConfidenceBand }>,
  seed?: string
): KpiTrend {
  if (measurements.length < 2) {
    return {
      kpiId,
      measurements: measurements.map(m => ({
        timestamp: m.timestamp,
        value: m.value,
        confidence: m.confidence
      })),
      analysis: {
        direction: "uncertain",
        confidence: "low"
      },
      warnings: ["Insufficient data for trend analysis (minimum 2 points required)"]
    };
  }

  // Sort by timestamp
  const sorted = [...measurements].sort((a, b) =>
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Simple linear regression for trend
  const n = sorted.length;
  const x = sorted.map((_, i) => i);
  const y = sorted.map(m => m.value);

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

  // Determine direction
  let direction: "improving" | "degrading" | "stable" | "uncertain";
  const threshold = 0.001;

  if (Math.abs(slope) < threshold) {
    direction = "stable";
  } else if (slope > 0) {
    direction = "improving"; // Assuming higher is better (can be contextualized)
  } else {
    direction = "degrading";
  }

  // Confidence based on sample size
  const confidence: import("@zeo/contracts").ConfidenceBand =
    n >= 30 ? "high" : n >= 10 ? "medium" : "low";

  const warnings: string[] = [];
  if (n < 10) {
    warnings.push("Small sample size limits trend confidence");
  }

  return {
    kpiId,
    measurements: sorted.map(m => ({
      timestamp: m.timestamp,
      value: m.value,
      confidence: m.confidence
    })),
    analysis: {
      direction,
      confidence,
      rateOfChange: {
        value: slope,
        unit: "per_measurement",
        confidence: { low: slope * 0.8, high: slope * 1.2 }
      }
    },
    warnings
  };
}

/**
 * KPI Registry factory
 */
export function createKpiRegistry(version = "0.1.0"): KpiRegistry {
  return {
    kpis: new Map(),
    categories: new Map(),
    version,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Register a KPI in the registry
 */
export function registerKpi(
  registry: KpiRegistry,
  kpi: KpiContract
): KpiRegistry {
  const newKpis = new Map(registry.kpis);
  newKpis.set(kpi.id, kpi);

  const newCategories = new Map(registry.categories);
  const existing = newCategories.get(kpi.category) || [];
  if (!existing.includes(kpi.id)) {
    newCategories.set(kpi.category, [...existing, kpi.id]);
  }

  return {
    kpis: newKpis,
    categories: newCategories,
    version: registry.version,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Get KPIs by category
 */
export function getKpisByCategory(
  registry: KpiRegistry,
  category: import("./types.js").KpiCategory
): KpiContract[] {
  const ids = registry.categories.get(category) || [];
  return ids.map(id => registry.kpis.get(id)).filter((k): k is KpiContract => k !== undefined);
}

/**
 * Standard KPI factory functions
 */
export function createDecisionCoverageKpi(): KpiContract {
  return {
    id: "kpi-decision-coverage",
    name: "Decision Coverage",
    description: "Percentage of decisions with complete assumption sets and provenance",
    category: "coverage",
    formula: { type: "ratio", numerator: "complete_decisions", denominator: "total_decisions" },
    target: { type: "maximize", ideal: { kind: "scalar", value: 1.0 } },
    temporal: { computeFrequency: "daily", isTimeSeries: true, relevanceHalfLifeHours: 168 },
    epistemic: { defaultStatus: "belief", provenanceRequirements: { requireChecksum: true }, defaultConfidence: "medium", minSampleSize: 10 },
    ownerScope: "system",
    horizon: "tactical",
    goodhartWarnings: ["May encourage superficial assumption filling without true uncertainty"],
    version: "0.1.0",
    createdAt: new Date().toISOString(),
    tags: ["coverage", "quality", "provenance"]
  };
}

export function createCalibrationScoreKpi(): KpiContract {
  return {
    id: "kpi-calibration-score",
    name: "Calibration Score",
    description: "How well prediction intervals cover actual outcomes (0=worst, 1=perfect)",
    category: "calibration",
    formula: { type: "aggregate", operation: "mean", field: "calibration_error" },
    target: { type: "maximize", ideal: { kind: "scalar", value: 1.0 } },
    temporal: { computeFrequency: "weekly", isTimeSeries: true, relevanceHalfLifeHours: 720 },
    epistemic: { defaultStatus: "belief", provenanceRequirements: { requireChecksum: true }, defaultConfidence: "medium", minSampleSize: 30 },
    ownerScope: "system",
    horizon: "strategic",
    goodhartWarnings: ["May encourage wide, uninformative bounds to ensure coverage"],
    version: "0.1.0",
    createdAt: new Date().toISOString(),
    tags: ["calibration", "accuracy", "forecasts"]
  };
}

export function createRobustnessScoreKpi(): KpiContract {
  return {
    id: "kpi-robustness-score",
    name: "Robustness Score",
    description: "Percentage of decisions with robust (non-fragile) recommendations",
    category: "robustness",
    formula: { type: "ratio", numerator: "robust_decisions", denominator: "total_decisions" },
    target: { type: "maximize", ideal: { kind: "scalar", value: 1.0 } },
    temporal: { computeFrequency: "daily", isTimeSeries: true, relevanceHalfLifeHours: 168 },
    epistemic: { defaultStatus: "belief", provenanceRequirements: { requireChecksum: true }, defaultConfidence: "medium", minSampleSize: 10 },
    ownerScope: "system",
    horizon: "tactical",
    goodhartWarnings: ["May encourage conservative decisions to avoid fragility"],
    version: "0.1.0",
    createdAt: new Date().toISOString(),
    tags: ["robustness", "quality", "sensitivity"]
  };
}
