/**
 * @zeo/kpi - Key Performance Indicators for Decision Intelligence
 * 
 * Provides deterministic KPI computation with epistemic discipline.
 * All KPIs are tagged with uncertainty bands and provenance requirements.
 * 
 * @example
 * ```typescript
 * import { createKpiRegistry, registerKpi, createDecisionCoverageKpi, createKpiMeasurement } from "@zeo/kpi";
 * 
 * // Create registry and register KPI
 * const registry = createKpiRegistry();
 * const kpi = createDecisionCoverageKpi();
 * const updated = registerKpi(registry, kpi);
 * 
 * // Compute measurement
 * const result = createKpiMeasurement(kpi, data, {
 *   periodStart: "2024-01-01",
 *   periodEnd: "2024-01-31",
 *   seed: "deterministic-seed"
 * });
 * 
 * console.log(result.measurement.value);
 * console.log(result.determinism.isReproducible);
 * ```
 */

// Types
export type {
  KpiValue,
  KpiCategory,
  KpiContract,
  KpiFormula,
  KpiMeasurement,
  KpiTrend,
  KpiDashboard,
  KpiAlert,
  KpiRegistry,
  KpiComputationResult,
  KpiErrorCode,
} from "./types.js";

// Engine
export {
  computeInputHash,
  computeScalarKpi,
  createKpiMeasurement,
  computeKpiTrend,
  createKpiRegistry,
  registerKpi,
  getKpisByCategory,
  createDecisionCoverageKpi,
  createCalibrationScoreKpi,
  createRobustnessScoreKpi,
} from "./engine.js";

// Epistemic guards
export {
  assertKpiMeasurementValid,
  isKpiMeasurementValid,
  formatKpiWithEpistemicNotice,
  KpiEpistemicError,
} from "./epistemic-guards.js";

// Standard KPIs constant
export { StandardKpis } from "./types.js";
