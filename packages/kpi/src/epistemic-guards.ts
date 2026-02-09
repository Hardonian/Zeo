/**
 * Epistemic Guards for KPI
 * 
 * Validates KPI measurements maintain epistemic discipline.
 * Enforces: no fact without provenance, AI outputs require validation,
 * uncertainty bands on all measurements.
 * 
 * @module @zeo/kpi/epistemic-guards
 */

import type { KpiMeasurement, KpiContract } from "./types";

/**
 * Error thrown when epistemic discipline is violated
 */
export class KpiEpistemicError extends Error {
  constructor(
    message: string,
    public code: string,
    public measurement?: KpiMeasurement
  ) {
    super(message);
    this.name = "KpiEpistemicError";
  }
}

/**
 * Check if a KPI measurement maintains epistemic discipline
 */
export function isKpiMeasurementValid(
  measurement: KpiMeasurement,
  kpi?: KpiContract
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check 1: Facts must have provenance
  if (measurement.epistemic.status === "fact") {
    if (!measurement.provenance || measurement.provenance.length === 0) {
      errors.push("Facts must have provenance pointers");
    }
  }
  
  // Check 2: AI-assisted outputs must require validation
  if (measurement.aiAssisted) {
    if (!measurement.aiAssisted.requiresValidation) {
      errors.push("AI-assisted measurements must have requiresValidation=true");
    }
    if (!measurement.aiAssisted.epistemicWarnings || measurement.aiAssisted.epistemicWarnings.length === 0) {
      errors.push("AI-assisted measurements must have epistemic warnings");
    }
  }
  
  // Check 3: Interval values must have uncertainty bands
  if (measurement.value.kind === "interval") {
    if (!measurement.epistemic.uncertainty) {
      errors.push("Interval values must have uncertainty in epistemic metadata");
    }
  }
  
  // Check 4: Confidence must match status
  if (measurement.epistemic.status === "unknown" && measurement.epistemic.confidence !== "low") {
    errors.push("Unknown status should have low confidence");
  }
  
  // Check 5: Sample size disclosure
  if (measurement.context.sampleSize === undefined || measurement.context.sampleSize < 0) {
    errors.push("Sample size must be disclosed");
  }
  
  // Check 6: Sensitivity notes for high-stakes KPIs
  if (kpi?.category === "decision_quality" || kpi?.category === "calibration") {
    if (!measurement.epistemic.sensitivityNotes || measurement.epistemic.sensitivityNotes.length === 0) {
      errors.push("High-stakes KPIs must include sensitivity notes");
    }
  }
  
  // Check 7: Determinism hash present
  if (!measurement.inputHash) {
    errors.push("Input hash required for determinism verification");
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Assert that a KPI measurement is valid
 * Throws KpiEpistemicError if invalid
 */
export function assertKpiMeasurementValid(
  measurement: KpiMeasurement,
  kpi?: KpiContract
): void {
  const { valid, errors } = isKpiMeasurementValid(measurement, kpi);
  if (!valid) {
    throw new KpiEpistemicError(
      `KPI epistemic violation: ${errors.join("; ")}`,
      "KPI_EPISTEMIC_VIOLATION",
      measurement
    );
  }
}

/**
 * Format KPI measurement with epistemic notice for display
 */
export function formatKpiWithEpistemicNotice(
  measurement: KpiMeasurement,
  kpi?: KpiContract
): string {
  const lines: string[] = [];
  
  // Value formatting
  let valueStr = "";
  switch (measurement.value.kind) {
    case "scalar":
      valueStr = `${measurement.value.value.toFixed(3)}${measurement.value.unit ? " " + measurement.value.unit : ""}`;
      break;
    case "interval":
      valueStr = `[${measurement.value.value.low.toFixed(3)}, ${measurement.value.value.high.toFixed(3)}]`;
      break;
    case "ordinal":
      valueStr = `Level ${measurement.value.level} (${measurement.value.scale})`;
      break;
    case "boolean":
      valueStr = `${measurement.value.value} (${(measurement.value.confidence.low * 100).toFixed(0)}-${(measurement.value.confidence.high * 100).toFixed(0)}% confidence)`;
      break;
  }
  
  lines.push(`KPI: ${kpi?.name || measurement.kpiId}`);
  lines.push(`Value: ${valueStr}`);
  lines.push(`Status: ${measurement.epistemic.status} (${measurement.epistemic.confidence} confidence)`);
  
  // Epistemic warnings
  if (measurement.aiAssisted) {
    lines.push("⚠️ AI-assisted measurement - requires validation");
    for (const warning of measurement.aiAssisted.epistemicWarnings) {
      lines.push(`  • ${warning}`);
    }
  }
  
  // Uncertainty disclosure
  if (measurement.epistemic.uncertainty) {
    lines.push(`Uncertainty: [${measurement.epistemic.uncertainty.low.toFixed(3)}, ${measurement.epistemic.uncertainty.high.toFixed(3)}]`);
  }
  
  // Sample size
  lines.push(`Sample size: ${measurement.context.sampleSize}`);
  
  // Sensitivity
  if (measurement.epistemic.sensitivityNotes && measurement.epistemic.sensitivityNotes.length > 0) {
    lines.push("Sensitivity notes:");
    for (const note of measurement.epistemic.sensitivityNotes) {
      lines.push(`  • ${note}`);
    }
  }
  
  // Determinism
  lines.push(`Input hash: ${measurement.inputHash}`);
  
  return lines.join("\n");
}

