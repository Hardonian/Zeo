export * from "./engine.js";
export * from "./quant-engine.js";
export * from "./examples.js";
export * from "./canonicalize.js";
export * from "./rng.js";
export * from "./pruning.js";
export * from "./flip-conditions.js";
export * from "./evidence.js";
export * from "./packets.js";
export * from "./regime-integration.js";
export * from "./scenarios.js";
export type { RunMeta } from "./packets.js";
export {
  hashDecisionSpec,
  hashAssumptionSet,
  cacheKey,
} from "./hashing.js";
export type {
  LearningDecisionRunner,
  LearningAwareDecisionOptions,
  LearningAwareDecisionResult,
} from "./learning-integration.js";
export {
  evaluateActionsWithPosterior,
  computeVariableSensitivity,
  computeFlipConditions,
  generateEvidenceCandidatesFromFlips,
  type ActionScore,
} from "./decision-coupling.js";

// Runner - orchestrated execution
export { ZeoRunner, type ZeoRunnerConfig } from "./runner";

// Re-exports from v0.4.0+ packages for convenient access

// Counterfactuals - "what flips" analysis
export type {
  CounterfactualQuery,
  CounterfactualResult,
  DecisionContext,
  DistanceMetric,
  ActionCandidate,
} from "@zeo/counterfactuals";
export {
  createCounterfactualQuery,
  createDecisionContext,
  solveCounterfactual,
  computeFlipDistanceVOI,
  formatCounterfactual,
  batchSolveCounterfactuals,
} from "@zeo/counterfactuals";

// Constraints - hard/soft constraint propagation
export type {
  ConstraintGraph,
  ConstraintNode,
  ConstraintEdge,
  ConstraintEvaluationResult,
  HardConstraint,
  SoftConstraint,
  TemporalConstraint,
  BudgetConstraint,
  ActionNode,
  DependencyEdge,
} from "@zeo/constraints";
export {
  createConstraintGraph,
  addNode,
  addEdge,
  addConstraint,
  propagateConstraints,
  filterInfeasibleActions,
  rankActionsWithConstraints,
  isActionDominated,
  createHardConstraint,
  createActionNode,
  createDependencyEdge,
} from "@zeo/constraints";

// Lenses - perspective formalization
export type {
  Lens,
  LensEvaluation,
  LensComparison,
  LensSensitivity,
} from "@zeo/lenses";
export {
  lensRegistry,
  applyLensWeights,
  compareAcrossLenses,
  analyzeLensSensitivity,
  isLensSensitive,
  NEGOTIATION_LENS,
  RISK_MIN_LENS,
  GROWTH_LENS,
  ETHICAL_LENS,
  ADVERSARIAL_LENS,
} from "@zeo/lenses";

// Worlds - parallel world analysis
export type {
  WorldDefinition,
  WorldsEnsemble,
  RobustnessAnalysis,
  ActionRobustness,
  WorldAgreement,
} from "@zeo/worlds";
export {
  createEnsemble,
  addWorld,
  removeWorld,
  generateDefaultWorlds,
  computeWorld,
  computeRobustness,
  getRobustActions,
  getFragileActions,
  getEnsembleSummary,
} from "@zeo/worlds";

// Causal Skeletons - DAG proposals for causal analysis
export type {
  CausalSkeleton,
  CausalNode,
  CausalEdge,
  SkeletonCollection,
  SkeletonComparison,
  SkeletonRecommendation,
  IdentificationRequirement,
  BackdoorPath,
} from "@zeo/causal-skeletons";
export {
  createCollection,
  createSkeleton,
  addNode as addSkeletonNode,
  addEdge as addSkeletonEdge,
  compareSkeletons,
  generateProposalSkeleton,
  getSkeletonSummary,
  exportSkeleton,
  importSkeleton,
  DEFAULT_SKELETON_CONFIG,
} from "@zeo/causal-skeletons";

// Hypothesis Registry
export type {
  Hypothesis,
  HypothesisStatus,
  RegistryConfig,
} from "@zeo/hypothesis-registry";
export {
  HypothesisRegistry,
  createRegistry,
} from "@zeo/hypothesis-registry";

// Robustness - statistical robustness checks
export type {
  RobustnessResult,
  RobustnessCategory,
  RiskLevel,
  StabilityConfig,
  ConfoundingConfig,
  LeakageConfig,
  MulticollinearityConfig,
  SampleAdequacyConfig,
  NumericDataPoint,
} from "@zeo/robustness";
export {
  assessStability,
  assessConfoundingRisk,
  detectLeakage,
  assessMulticollinearity,
  assessSampleAdequacy,
  assessHypothesisRobustness,
  runAllRobustnessChecks,
} from "@zeo/robustness";

// Telemetry - intelligence telemetry and drift detection
export type {
  TelemetryEvent,
  IntervalChangeEvent,
  VoiChurnEvent,
  UserOverrideEvent,
  TelemetryAggregate,
  DriftAlert,
} from "@zeo/telemetry";
export {
  getTelemetryStore,
  createIntervalChangeEvent,
  createVoiChurnEvent,
  createUserOverrideEvent,
  createUserAcceptanceEvent,
  computeHealthScore,
} from "@zeo/telemetry";

// Regimes - regime detection and analysis
export type {
  DetectionResult,
  RegimePrediction,
  EarlyWarning,
  TransitionMatrix,
  RegimeHistoryPoint,
  NumericPoint,
  DetectorConfig,
} from "@zeo/regimes";
export {
  detectRegimes,
  createRegimeState,
  createRegimeEvent,
  estimateTransitionMatrix,
  predictRegime,
  computeVolatilityTrend,
  computeMeanTrend,
  detectEarlyWarnings,
  computeRegimeStability,
} from "@zeo/regimes";

// Measurement - scale-aware computation
export type {
  MeasurementScale,
  MeasurementValue,
  ScaleType,
  MeasurementOperation,
  ValueBand,
  CompatibilityResult,
} from "@zeo/measurement";
export {
  scaleRegistry,
  ScaleRegistry,
  assertCompatibleScales,
  assertOperationAllowed,
  checkScaleCompatibility,
  isOperationAllowed,
  computeMean as computeMeasurementMean,
  computeDifference,
  computeRatio,
  createMeasurementValue,
  MeasurementError,
  BUILTIN_SCALES,
} from "@zeo/measurement";

// Warehouse - local storage adapters
export type { WarehouseAdapter } from "@zeo/warehouse";
export {
  FilesystemWarehouseAdapter,
  IndexedDBWarehouseAdapter,
} from "@zeo/warehouse";

// Replay - calibration and backtesting
export type {
  CalibrationReport,
  ReportSummary,
  CoverageDetails,
  BucketAnalysis,
  CaseBreakdown,
  CumulativeCalibrationDetails,
  Recommendation,
  ReportFormat,
  BatchReplayOptions,
  BatchReplayResult,
  CumulativeCalibration,
  CaseReplaySummary,
  ReplayRunIndexEntry,
} from "@zeo/replay";
export {
  generateCalibrationReport,
  renderReport,
  renderJsonReport,
  renderMarkdownReport,
  applyCalibrationWiden,
  configFromRecommendation,
  applyCalibrationToPredictions,
  widenBand,
  wouldCalibrationChange,
  createReplayRunIndex,
} from "@zeo/replay";

// Audit - audit trail and compliance
export type {
  AuditEvent,
  AuditTrail,
  AuditQuery,
  AuditExport,
  TamperProofRecord,
} from "@zeo/audit";
export {
  AuditLedger,
  createAuditEvent,
  verifyLedger,
  exportLedger,
} from "@zeo/audit";

// Dataset Builder
export type {
  DatasetSchema,
  DatasetRow,
  FeatureColumn,
  TargetColumn,
} from "@zeo/dataset-builder";
export {
  buildDataset,
  datasetToCsv,
  createDatasetSchema,
} from "@zeo/dataset-builder";

// Analysis Planner
export type {
  AnalysisPlan,
  AnalysisStep,
  StepType,
  PlannerConfig,
} from "@zeo/analysis-planner";
export {
  generateAnalysisPlan,
  validatePlan,
  createPlannerConfig,
} from "@zeo/analysis-planner";

// Feature Discovery
export type {
  FeatureProposal,
  FeatureValidation,
  FeatureProposalConfig,
} from "@zeo/feature-discovery";
export {
  proposeFeatures,
  validateProposal,
  checkForLeakage,
  checkPlausibility,
} from "@zeo/feature-discovery";

// Decision Synthesizer
export type {
  SynthesizedDecision,
  SynthesisOptions,
  SynthesisOutput,
} from "@zeo/decision-synthesizer";
export {
  synthesizeDecision,
  createSynthesisOptions,
} from "@zeo/decision-synthesizer";

// Policy engine (removed - caused cyclic dependency with repro-pack)
// export { policyEngine, PolicyEngine } from "./policy.js";

// Scenario packs (removed - caused cyclic dependency with repro-pack)
// export { exportScenarioPack, importScenarioPack } from "./scenario-packs.js";
// export type { ScenarioPackManifest, ImportedPackContent } from "./scenario-packs.js";

// Reporting (removed - caused cyclic dependency with repro-pack)
// export { generateDecisionReport } from "./reporting.js";
// export type { DecisionReport, ReportSection, Citation } from "./reporting.js";
