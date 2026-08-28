/**
 * Uncertainty Ledger
 *
 * Phase 3: Implements source accounting for different uncertainty categories.
 * Tracks:
 * - measurement_uncertainty: Uncertainty from data collection/processing
 * - model_uncertainty: Uncertainty from model limitations
 * - regime_uncertainty: Uncertainty from regime/state changes
 * - adversarial_uncertainty: Uncertainty from strategic opponents
 * - ai_proposal_uncertainty: Uncertainty from AI-generated content
 *
 * All ledger values are bands (low/high), deterministic, and computable
 * from existing metadata without inventing external signals.
 */

import { createHash } from "crypto";
import type { Prediction } from "@zeo/contracts";

// Ledger version for reproducibility
const UNCERTAINTY_LEDGER_VERSION = "0.5.1";

/**
 * Categories of uncertainty tracked in the ledger
 */
export type UncertaintyCategory =
  | "measurement_uncertainty"
  | "model_uncertainty"
  | "regime_uncertainty"
  | "adversarial_uncertainty"
  | "ai_proposal_uncertainty";

/**
 * Uncertainty band for a category
 */
export interface UncertaintyBand {
  low: number;
  high: number;
  confidence: number; // 0-1 confidence in this estimate
}

/**
 * Complete uncertainty ledger for a prediction or decision
 */
export interface UncertaintyLedger {
  version: string;
  createdAt: string;
  predictionId?: string;
  decisionId?: string;

  // Individual uncertainty components
  categories: Partial<Record<string, UncertaintyBand>>;

  // Aggregated uncertainty
  total: UncertaintyBand;

  // Metadata for audit
  metadata: {
    computationMethod: "additive" | "quadrature" | "max";
    aggregationRule: string;
    derivationSources: string[];
    seed: string;
  };
}

/**
 * Configuration for uncertainty ledger computation
 */
export interface UncertaintyLedgerConfig {
  measurement: {
    enabled: boolean;
    baseWidth: number; // Base uncertainty from measurement
    provenancePenalty: number; // Reduction for strong provenance
    freshnessWeight: number; // Weight for evidence recency
  };
  model: {
    enabled: boolean;
    baseWidth: number; // Base model uncertainty
    trainingDataWeight: number; // Weight for training data quality
    complexityPenalty: number; // Penalty for complex models
  };
  regime: {
    enabled: boolean;
    baseWidth: number; // Base regime uncertainty
    transitionPenalty: number; // Penalty for recent transitions
  };
  adversarial: {
    enabled: boolean;
    baseWidth: number; // Base adversarial uncertainty
    strategicWeight: number; // Weight for strategic complexity
  };
  aiProposal: {
    enabled: boolean;
    baseWidth: number; // Base AI proposal uncertainty
    validationWeight: number; // Weight for AI output validation
  };
  aggregation: {
    method: "additive" | "quadrature" | "max";
    maxUncertaintyCap: number; // Maximum uncertainty band (default 0.5)
  };
}

/**
 * Create default uncertainty ledger configuration
 */
export function createDefaultLedgerConfig(): UncertaintyLedgerConfig {
  return {
    measurement: {
      enabled: true,
      baseWidth: 0.1,
      provenancePenalty: 0.02,
      freshnessWeight: 0.05,
    },
    model: {
      enabled: true,
      baseWidth: 0.15,
      trainingDataWeight: 0.03,
      complexityPenalty: 0.02,
    },
    regime: {
      enabled: true,
      baseWidth: 0.12,
      transitionPenalty: 0.05,
    },
    adversarial: {
      enabled: true,
      baseWidth: 0.1,
      strategicWeight: 0.05,
    },
    aiProposal: {
      enabled: true,
      baseWidth: 0.15,
      validationWeight: 0.05,
    },
    aggregation: {
      method: "additive",
      maxUncertaintyCap: 0.5,
    },
  };
}

/**
 * Derive deterministic seed for ledger computation
 */
export function deriveLedgerSeed(
  predictionId: string,
  category: UncertaintyCategory
): string {
  return createHash("sha256")
    .update(`${predictionId}:${category}:${UNCERTAINTY_LEDGER_VERSION}`)
    .digest("hex")
    .slice(0, 32);
}

/**
 * Compute measurement uncertainty from prediction metadata
 */
export function computeMeasurementUncertainty(
  prediction: Prediction,
  config: UncertaintyLedgerConfig["measurement"],
  maxCap: number = 0.5
): UncertaintyBand | null {
  if (!config.enabled) return null;

  const seed = deriveLedgerSeed(prediction.target.id, "measurement_uncertainty");
  const rng = seededRng(seed);

  // Base uncertainty from prediction structure
  const baseWidth = config.baseWidth;

  // Provenance reduction (strong provenance = lower uncertainty)
  const provenanceQuality = getProvenanceQuality(prediction);
  const provenanceReduction = (1 - provenanceQuality) * config.provenancePenalty;

  // Freshness penalty (older evidence = higher uncertainty)
  const freshnessPenalty = prediction.band.high - prediction.band.low < 0.2
    ? config.freshnessWeight * rng()
    : 0;

  // Compute band width
  const width = Math.min(
    baseWidth - provenanceReduction + freshnessPenalty,
    maxCap
  );

  // Center the band around the midpoint
  const center = (prediction.band.low + prediction.band.high) / 2;

  return {
    low: Math.max(0, center - width / 2),
    high: Math.min(1, center + width / 2),
    confidence: 0.7 + provenanceQuality * 0.2, // 0.7-0.9 confidence
  };
}

/**
 * Compute model uncertainty from prediction characteristics
 */
export function computeModelUncertainty(
  prediction: Prediction,
  config: UncertaintyLedgerConfig["model"],
  maxCap: number = 0.5
): UncertaintyBand | null {
  if (!config.enabled) return null;

  const seed = deriveLedgerSeed(prediction.target.id, "model_uncertainty");
  const rng = seededRng(seed);

  // Base model uncertainty
  const baseWidth = config.baseWidth;

  // Training data quality effect
  const trainingQuality = getTrainingDataQuality(prediction);
  const trainingReduction = (1 - trainingQuality) * config.trainingDataWeight;

  // Complexity penalty (more complex = higher uncertainty)
  const complexityFactor = getModelComplexity(prediction);
  const complexityPenalty = complexityFactor * config.complexityPenalty;

  const width = Math.min(
    baseWidth + complexityPenalty - trainingReduction,
    maxCap
  );

  const center = (prediction.band.low + prediction.band.high) / 2;

  return {
    low: Math.max(0, center - width / 2),
    high: Math.min(1, center + width / 2),
    confidence: 0.6 + trainingQuality * 0.2, // 0.6-0.8 confidence
  };
}

/**
 * Compute regime uncertainty from context
 */
export function computeRegimeUncertainty(
  prediction: Prediction,
  config: UncertaintyLedgerConfig["regime"],
  maxCap: number = 0.5
): UncertaintyBand | null {
  if (!config.enabled) return null;

  const seed = deriveLedgerSeed(prediction.target.id, "regime_uncertainty");
  const rng = seededRng(seed);

  const baseWidth = config.baseWidth;

  // Recent transition penalty
  const hasRecentTransition = detectRecentRegimeTransition(prediction);
  const transitionPenalty = hasRecentTransition
    ? config.transitionPenalty
    : 0;

  const width = Math.min(
    baseWidth + transitionPenalty,
    maxCap
  );

  const center = (prediction.band.low + prediction.band.high) / 2;

  return {
    low: Math.max(0, center - width / 2),
    high: Math.min(1, center + width / 2),
    confidence: hasRecentTransition ? 0.5 : 0.75,
  };
}

/**
 * Compute adversarial uncertainty for strategic contexts
 */
export function computeAdversarialUncertainty(
  prediction: Prediction,
  config: UncertaintyLedgerConfig["adversarial"],
  maxCap: number = 0.5
): UncertaintyBand | null {
  if (!config.enabled) return null;

  const seed = deriveLedgerSeed(prediction.target.id, "adversarial_uncertainty");
  const rng = seededRng(seed);

  const baseWidth = config.baseWidth;

  // Strategic complexity
  const strategicComplexity = getStrategicComplexity(prediction);
  const strategicPenalty = strategicComplexity * config.strategicWeight;

  const width = Math.min(
    baseWidth + strategicPenalty,
    maxCap
  );

  const center = (prediction.band.low + prediction.band.high) / 2;

  return {
    low: Math.max(0, center - width / 2),
    high: Math.min(1, center + width / 2),
    confidence: 0.5 + (1 - strategicComplexity) * 0.2, // Lower confidence for strategic
  };
}

/**
 * Compute AI proposal uncertainty
 */
export function computeAiProposalUncertainty(
  prediction: Prediction,
  config: UncertaintyLedgerConfig["aiProposal"],
  maxCap: number = 0.5
): UncertaintyBand | null {
  if (!config.enabled) return null;

  const seed = deriveLedgerSeed(prediction.target.id, "ai_proposal_uncertainty");
  const rng = seededRng(seed);

  const baseWidth = config.baseWidth;

  // Validation reduces AI uncertainty
  const validationStatus = getAiValidationStatus(prediction);
  const validationReduction = validationStatus * config.validationWeight;

  const width = Math.min(
    baseWidth - validationReduction,
    maxCap
  );

  const center = (prediction.band.low + prediction.band.high) / 2;

  return {
    low: Math.max(0, center - width / 2),
    high: Math.min(1, center + width / 2),
    confidence: 0.5 + validationStatus * 0.3, // 0.5-0.8 confidence
  };
}

/**
 * Aggregate uncertainty bands from multiple categories
 */
export function aggregateUncertainty(
  categories: Partial<Record<string, UncertaintyBand>>,
  method: "additive" | "quadrature" | "max"
): UncertaintyBand {
  const bands = Object.values(categories).filter((b): b is UncertaintyBand => b !== null);

  if (bands.length === 0) {
    return { low: 0, high: 0.5, confidence: 0.5 };
  }

  const centers = bands.map(b => (b.low + b.high) / 2);
  const avgCenter = centers.reduce((a, b) => a + b, 0) / centers.length;

  let combinedLow = 0;
  let combinedHigh = 0;

  switch (method) {
    case "additive":
      combinedLow = bands.reduce((sum, b) => sum + b.low, 0) / bands.length;
      combinedHigh = bands.reduce((sum, b) => sum + b.high, 0) / bands.length;
      break;

    case "quadrature":
      const lowVariance = bands.reduce((sum, b) => sum + Math.pow(avgCenter - b.low, 2), 0) / bands.length;
      const highVariance = bands.reduce((sum, b) => sum + Math.pow(b.high - avgCenter, 2), 0) / bands.length;
      combinedLow = avgCenter - Math.sqrt(lowVariance);
      combinedHigh = avgCenter + Math.sqrt(highVariance);
      break;

    case "max":
      combinedLow = Math.max(...bands.map(b => b.low));
      combinedHigh = Math.min(...bands.map(b => b.high));
      break;
  }

  // Ensure valid band
  combinedLow = Math.max(0, Math.min(combinedLow, avgCenter));
  combinedHigh = Math.max(avgCenter, Math.min(1, combinedHigh));

  // Confidence is average of category confidences
  const avgConfidence = bands.reduce((sum, b) => sum + b.confidence, 0) / bands.length;

  return {
    low: combinedLow,
    high: combinedHigh,
    confidence: avgConfidence,
  };
}

/**
 * Main function: compute complete uncertainty ledger
 */
export function computeUncertaintyLedger(
  prediction: Prediction,
  config: UncertaintyLedgerConfig = createDefaultLedgerConfig()
): UncertaintyLedger {
  const categories: Partial<Record<UncertaintyCategory, UncertaintyBand>> = {};
  const maxCap = config.aggregation.maxUncertaintyCap;

  // Compute each category
  categories.measurement_uncertainty = computeMeasurementUncertainty(
    prediction,
    config.measurement,
    maxCap
  ) ?? undefined;

  categories.model_uncertainty = computeModelUncertainty(
    prediction,
    config.model,
    maxCap
  ) ?? undefined;

  categories.regime_uncertainty = computeRegimeUncertainty(
    prediction,
    config.regime,
    maxCap
  ) ?? undefined;

  categories.adversarial_uncertainty = computeAdversarialUncertainty(
    prediction,
    config.adversarial,
    maxCap
  ) ?? undefined;

  categories.ai_proposal_uncertainty = computeAiProposalUncertainty(
    prediction,
    config.aiProposal,
    maxCap
  ) ?? undefined;

  // Aggregate
  const total = aggregateUncertainty(
    categories,
    config.aggregation.method
  );

  // Collect derivation sources
  const sources: string[] = [];
  if (categories.measurement_uncertainty) sources.push("prediction_metadata");
  if (categories.model_uncertainty) sources.push("prediction_structure");
  if (categories.regime_uncertainty) sources.push("temporal_context");
  if (categories.adversarial_uncertainty) sources.push("strategic_context");
  if (categories.ai_proposal_uncertainty) sources.push("ai_validation");

  return {
    version: UNCERTAINTY_LEDGER_VERSION,
    createdAt: new Date().toISOString(),
    predictionId: prediction.target.id,
    categories,
    total,
    metadata: {
      computationMethod: config.aggregation.method,
      aggregationRule: `${config.aggregation.method}_aggregation`,
      derivationSources: sources,
      seed: createHash("sha256")
        .update(`${prediction.target.id}:${config.aggregation.method}:${UNCERTAINTY_LEDGER_VERSION}`)
        .digest("hex")
        .slice(0, 32),
    },
  };
}

/**
 * Enforcement check: forbid interval narrowing when uncertainty ledger worsens
 */
export function checkUncertaintyConsistency(
  previous: UncertaintyLedger | null,
  current: UncertaintyLedger
): { consistent: boolean; violations: string[] } {
  const violations: string[] = [];

  if (!previous) {
    return { consistent: true, violations };
  }

  // Check if current total uncertainty expanded beyond previous
  const previousWidth = previous.total.high - previous.total.low;
  const currentWidth = current.total.high - current.total.low;

  // If current is narrower, that's a narrowing (could be valid if evidence improved)
  // We only flag if confidence decreased significantly with narrowing
  if (currentWidth < previousWidth && current.total.confidence < previous.total.confidence) {
    violations.push(
      `Interval narrowed from ${previousWidth.toFixed(3)} to ${currentWidth.toFixed(3)} ` +
      `but confidence decreased from ${previous.total.confidence.toFixed(2)} to ${current.total.confidence.toFixed(2)}`
    );
  }

  // Check individual categories
  for (const cat of Object.keys(current.categories) as UncertaintyCategory[]) {
    const prevCat = previous.categories[cat];
    const currCat = current.categories[cat];

    if (prevCat && currCat) {
      const prevWidth = prevCat.high - prevCat.low;
      const currWidth = currCat.high - currCat.low;

      if (currWidth < prevWidth && currCat.confidence < prevCat.confidence) {
        violations.push(
          `${cat}: narrowed from ${prevWidth.toFixed(3)} to ${currWidth.toFixed(3)} ` +
          `with decreasing confidence`
        );
      }
    }
  }

  return {
    consistent: violations.length === 0,
    violations,
  };
}

/**
 * Export uncertainty ledger to JSON
 */
export function exportLedgerToJson(ledger: UncertaintyLedger): string {
  return JSON.stringify(ledger, null, 2);
}

/**
 * Create summary of uncertainty ledger for reports
 */
export function createLedgerSummary(ledger: UncertaintyLedger): {
  totalUncertainty: string;
  dominantCategory: string | null;
  confidenceLevel: string;
  recommendations: string[];
} {
  // Find dominant uncertainty category
  let dominant: { category: string; width: number } | null = null;
  for (const [cat, band] of Object.entries(ledger.categories)) {
    if (band) {
      const width = band.high - band.low;
      if (!dominant || width > dominant.width) {
        dominant = { category: cat, width };
      }
    }
  }

  const totalWidth = ledger.total.high - ledger.total.low;
  let confidenceLevel: string;
  if (totalWidth < 0.1) confidenceLevel = "high";
  else if (totalWidth < 0.25) confidenceLevel = "medium";
  else if (totalWidth < 0.4) confidenceLevel = "low";
  else confidenceLevel = "very_low";

  const recommendations: string[] = [];
  if (totalWidth > 0.3) {
    recommendations.push("Consider gathering more evidence to reduce uncertainty");
  }
  if (dominant && dominant.category === "ai_proposal_uncertainty") {
    recommendations.push("AI proposals should be validated before action");
  }
  if (dominant && dominant.category === "adversarial_uncertainty") {
    recommendations.push("Strategic uncertainty requires adversarial thinking");
  }

  return {
    totalUncertainty: `${ledger.total.low.toFixed(2)}-${ledger.total.high.toFixed(2)}`,
    dominantCategory: dominant?.category || null,
    confidenceLevel,
    recommendations,
  };
}

// ============ Helper Functions ============

/**
 * Simple seeded RNG for deterministic behavior
 */
function seededRng(seed: string): () => number {
  let state = 0;
  for (let i = 0; i < seed.length; i++) {
    state = (state * 31 + seed.charCodeAt(i)) >>> 0;
  }

  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/**
 * Get provenance quality from prediction (0-1)
 */
function getProvenanceQuality(prediction: Prediction): number {
  // Higher quality = more provenance, less uncertainty
  // Simplified: check if prediction has source attribution
  return (prediction as Record<string, unknown>).source ? 0.8 : 0.5;
}

/**
 * Get training data quality (0-1)
 */
function getTrainingDataQuality(prediction: Prediction): number {
  // Simplified: assume moderate quality
  return 0.6;
}

/**
 * Get model complexity factor (0-1)
 */
function getModelComplexity(prediction: Prediction): number {
  // Simplified: binary predictions are less complex
  return prediction.band.high - prediction.band.low > 0.3 ? 0.6 : 0.4;
}

/**
 * Detect recent regime transitions
 */
function detectRecentRegimeTransition(prediction: Prediction): boolean {
  // Simplified: assume no recent transitions
  return false;
}

/**
 * Get strategic complexity (0-1)
 */
function getStrategicComplexity(prediction: Prediction): number {
  // Simplified: moderate strategic complexity
  return 0.5;
}

/**
 * Get AI validation status (0-1)
 */
function getAiValidationStatus(prediction: Prediction): number {
  // Simplified: assume partial validation
  return 0.4;
}

