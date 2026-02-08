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
  findFlipThresholds,
  computeDistance,
} from "@zeo/counterfactuals";

// Constraints - action feasibility checking
export type {
  Constraint,
  ConstraintGraph,
  PropagationResult,
  ConstraintNode,
  ConstraintEdge,
  HardConstraint,
  SoftConstraint,
  TemporalConstraint,
  BudgetConstraint,
  ConstraintContext,
} from "@zeo/constraints";
export {
  createConstraintGraph,
  addNode as addConstraintNode,
  addEdge as addConstraintEdge,
  addConstraint,
  propagateConstraints,
  createHardConstraint,
  createSoftConstraint,
  createTemporalConstraint,
  createBudgetConstraint,
  createIrreversibilityConstraint,
  createLegalConstraint,
  createEthicalConstraint,
  createActionNode,
  createDependencyEdge,
  createConsumptionEdge,
  createExclusionEdge,
  filterInfeasibleActions,
  applySoftPenalties,
} from "@zeo/constraints";

// Lenses - perspective formalization
export type {
  Lens,
  LensComparison,
  LensAppliedResult,
  LensSensitivityAnalysis,
} from "@zeo/lenses";
export {
  lensRegistry,
  LensRegistry,
  applyLensWeights,
  compareAcrossLenses,
  analyzeLensSensitivity,
  createLens,
  getLensPriors,
} from "@zeo/lenses";

// Worlds - parallel worlds for robustness analysis
export type {
  AssumptionVariant,
  WorldDefinition,
  WorldsEnsemble,
  WorldState,
  WorldDecisionResult,
  ActionRobustness,
  RobustnessAnalysis,
  WorldsConfig,
} from "@zeo/worlds";
export {
  createEnsemble,
  addWorld,
  computeWorld,
  computeRobustness,
  getRobustActions,
  getFragileActions,
  getEnsembleSummary,
  generateDefaultWorlds,
  exportEnsemble,
  importEnsemble,
  DEFAULT_WORLDS_CONFIG,
} from "@zeo/worlds";

// Tournaments - strategy self-competition
export type {
  Tournament,
  Strategy,
  Scenario,
  Match,
  MatchResult,
  TournamentResults,
  Standing,
  TournamentConfig,
} from "@zeo/tournaments";
export {
  createTournament,
  registerStrategy,
  addScenario,
  startTournament,
  runMatch,
  completeTournament,
  getTournamentSummary,
  createBaselineStrategies,
  exportTournament,
  importTournament,
} from "@zeo/tournaments";

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

// Hypothesis Market - internal market for hypotheses
export type {
  MarketState,
  MarketHypothesis,
  MarketPosition,
  PerformanceSnapshot,
  RebalanceConfig,
} from "@zeo/hypothesis-market";
export {
  createMarket,
  registerHypothesis,
  recordOutcome,
  rebalanceCredence,
  getTopHypotheses,
  getMarketSummary,
  DEFAULT_REBALANCE_CONFIG,
} from "@zeo/hypothesis-market";

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
export type { AuditConfig, VerificationResult, AppendResult } from "@zeo/audit";
export {
  createAuditLog,
  createDecisionAuditEntry,
  createEvidenceAuditEntry,
  createPolicyAuditEntry,
} from "@zeo/audit";

// Semantic Clustering - evidence organization
export type { Cluster, ClusterableItem, ClusteringResult, ClusteringOptions } from "@zeo/semantic-clustering";
export { clusterItems } from "@zeo/semantic-clustering";

// Dataset Builder - feature extraction
export type { DatasetBuilderConfig, ReplayDataset } from "@zeo/dataset-builder";
export {
  createDatasetBuilder,
  validateDataset,
  filterDatasetByTime,
} from "@zeo/dataset-builder";

// Analysis Planner - AI-driven analysis planning
export type {
  AnalysisPlan,
  AnalysisStep,
  AnalysisRisk,
  DatasetSchema,
  DatasetMetadata,
  SchemaField,
  FieldStatistics,
  PlanningOptions,
  AnalysisStepKind,
} from "@zeo/analysis-planner";
export { generateAnalysisPlan } from "@zeo/analysis-planner";

// Feature Discovery - AI-guided feature proposal
export type {
  DiscoveryConfig,
  Pattern,
} from "@zeo/feature-discovery";
export { FeatureDiscovery, createFeatureDiscovery } from "@zeo/feature-discovery";

// Decision Synthesizer - decision implications
export type {
  DecisionContext as SynthesizerContext,
  DecisionImplication,
  SynthesisResult,
  SynthesisOptions,
} from "@zeo/decision-synthesizer";
export { synthesizeImplications } from "@zeo/decision-synthesizer";