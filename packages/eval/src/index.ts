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
} from "./types";

// Re-export schema values (avoiding duplicate MIN_TEXT_UNCERTAINTY_WIDTH)
export {
  createDefaultEvalSuite,
  validateEvalSuite,
  validateInvariantCheck,
  validateExpectedOutput,
  MIN_TEXT_UNCERTAINTY_WIDTH,
  MAX_DOMINANCE_CAP,
} from "./schema";

// Re-export invariants
export {
  MIN_TEXT_UNCERTAINTY_WIDTH as INVARIANT_MIN_UNCERTAINTY_WIDTH,
  checkMinUncertaintyWidth,
  checkCausalLabeling,
  checkProvenance,
  verifyHash,
  runInvariantChecks,
  runTextInvariantChecks,
} from "./invariants";

// Re-export runner
export {
  runCommand,
  runEvalSuite,
  runDeterminismCheck,
} from "./runner";

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
} from "./slice-types";

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
} from "./slice-computation";

// Re-export gating thresholds from slice-types
export { getGatingThresholds } from "./slice-types";

// Re-export slice runner
export {
  runSliceEvaluation,
  printSliceSummary,
  checkSliceGates,
  DEFAULT_SLICE_DIMENSIONS,
  type SliceEvalOptions,
} from "./slice-runner";

// Re-export uncertainty ledger (Phase 3)
export {
  UncertaintyLedger,
  UncertaintyBand,
  UncertaintyCategory,
  UncertaintyLedgerConfig,
  createDefaultLedgerConfig,
  computeMeasurementUncertainty,
  computeModelUncertainty,
  computeRegimeUncertainty,
  computeAdversarialUncertainty,
  computeAiProposalUncertainty,
  aggregateUncertainty,
  computeUncertaintyLedger,
  checkUncertaintyConsistency,
  exportLedgerToJson,
  createLedgerSummary,
} from "./uncertainty-ledger";

// Re-export falsification suite (Phase 2)
export {
  type FalsificationTestType,
  type FalsificationConfig,
  type FalsificationTestResult,
  type FalsificationReport,
  createDefaultFalsificationConfig,
  runFalsificationSuite,
  exportFalsificationReport,
  exportFalsificationReportMd,
} from "./falsification";

// Re-export regret metrics (Phase 4)
export {
  type RegretType,
  type RegretPair,
  type RegretConfig,
  type RealizedRegretResult,
  type RegretMetrics,
  createDefaultRegretConfig,
  deriveRegretSeed,
  computeRealizedRegret,
  computeIntervalScore,
  computeProperScore,
  computeExpectedRegret,
  computeWorstCaseRegret,
  comparePolicies,
  computeRegretMetrics,
  exportRegretMetrics,
  createRegretSummary,
} from "./regret";

// Re-export scorecards (Phase 5)
export {
  type ScorecardType,
  type PredictionBin,
  type CalibrationPoint,
  type ReliabilityDiagram,
  type SharpnessDiagram,
  type PredictionHistogram,
  type ConfusionMatrix,
  type MultiClassMetrics,
  type ScorecardReport,
  type ScorecardConfig,
  createDefaultScorecardConfig,
  deriveScorecardSeed,
  computeReliabilityDiagram,
  computeSharpnessDiagram,
  computePredictionHistogram,
  computeConfusionMatrix,
  computeScorecardReport,
  exportScorecardReport,
  createScorecardSummary,
} from "./scorecards";

// Re-export pooling (Phase 6)
export {
  type PoolingType,
  type PriorParams,
  type PooledEstimate,
  type SliceEstimate,
  type HierarchicalPoolResult,
  type EmpiricalBayesResult,
  type ConjugateUpdateResult,
  type PartialPoolResult,
  type PoolingReport,
  type PoolingConfig,
  createDefaultPoolingConfig,
  derivePoolingSeed,
  computeHierarchicalPooling,
  computeEmpiricalBayes,
  computeConjugateUpdate,
  computePartialPooling,
  computePoolingReport,
  exportPoolingReport,
  createPoolingSummary,
} from "./pooling";

