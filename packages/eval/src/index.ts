/**
 * @zeo/eval
 *
 * Evaluation harness for epistemic regressions and determinism checks.
 */

// Re-export types
export type {
  EvalCommand,
  ExpectedOutput,
  InvariantCheck,
  InvariantCategory,
  EvalFixture,
  EvalSuite,
  InvariantResult,
  EvalResult,
  EvalSuiteResult,
} from "./types.js";

// Re-export schema values (avoiding duplicate MIN_TEXT_UNCERTAINTY_WIDTH)
export {
  createDefaultEvalSuite,
  validateEvalSuite,
  validateInvariantCheck,
  validateExpectedOutput,
  MIN_TEXT_UNCERTAINTY_WIDTH,
  MAX_DOMINANCE_CAP,
} from "./schema.js";

// Re-export invariants
export {
  MIN_TEXT_UNCERTAINTY_WIDTH as INVARIANT_MIN_UNCERTAINTY_WIDTH,
  checkMinUncertaintyWidth,
  checkCausalLabeling,
  checkProvenance,
  verifyHash,
  runInvariantChecks,
  runTextInvariantChecks,
} from "./invariants.js";

// Re-export runner
export {
  runCommand,
  runEvalSuite,
  runDeterminismCheck,
} from "./runner.js";

// Re-export slice evaluation types
export type {
  Slice,
  SliceDimension,
  SliceKey,
  SliceMetrics,
  SliceGatingRule,
  SliceEvaluationReport,
  SliceComputationInput,
  SliceCsvRow,
  PredictionOutcomePair,
  GatingThresholdPreset,
} from "./slice-types.js";

// Re-export slice evaluation utilities
export {
  createSliceKey,
  parseSliceKey,
  extractSlices,
  computeBrierScore,
  computeCoverage,
  computeMAE,
  computeMSE,
  computeRMSE,
  computeUncertaintyStats,
  determineConfidenceLevel,
  computeSliceMetrics,
  groupBySlice,
  computeDatasetHash,
  createDefaultGatingRules,
  evaluateGatingRules,
  computeCrossSliceAnalysis,
  generateRecommendations,
  computeSliceEvaluation,
  sliceMetricsToCsvRow,
  exportSlicesToCsv,
} from "./slice-computation.js";

// Re-export gating thresholds from slice-types
export { getGatingThresholds } from "./slice-types.js";

// Re-export slice runner
export {
  runSliceEvaluation,
  printSliceSummary,
  checkSliceGates,
  DEFAULT_SLICE_DIMENSIONS,
  type SliceEvalOptions,
} from "./slice-runner.js";
