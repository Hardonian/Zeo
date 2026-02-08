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
export type {
  CounterfactualQuery,
  CounterfactualResult,
  DecisionContext,
  DistanceMetric,
} from "@zeo/counterfactuals";
export {
  createCounterfactualQuery,
  createDecisionContext,
  solveCounterfactual,
  computeFlipDistanceVOI,
  formatCounterfactual,
} from "@zeo/counterfactuals";

export type {
  Constraint,
  ConstraintGraph,
  PropagationResult,
  ConstraintNode,
  ConstraintEdge,
} from "@zeo/constraints";
export {
  createConstraintGraph,
  addNode,
  addEdge,
  addConstraint,
  propagateConstraints,
  createHardConstraint,
  createSoftConstraint,
  createTemporalConstraint,
  createBudgetConstraint,
  filterInfeasibleActions,
} from "@zeo/constraints";

export type {
  Lens,
  LensRegistry,
  LensComparison,
  LensAppliedResult,
  LensSensitivityAnalysis,
} from "@zeo/lenses";
export {
  lensRegistry,
  applyLensWeights,
  compareAcrossLenses,
  analyzeLensSensitivity,
  createLens,
} from "@zeo/lenses";

export type {
  AssumptionVariant,
  WorldDefinition,
  WorldsEnsemble,
  ActionRobustness,
  RobustnessAnalysis,
} from "@zeo/worlds";
export {
  createEnsemble,
  addWorld,
  computeWorld,
  computeRobustness,
  getRobustActions,
  getFragileActions,
  generateDefaultWorlds,
} from "@zeo/worlds";

export type {
  Tournament,
  Strategy,
  Scenario,
  Match,
  TournamentResults,
  Standing,
} from "@zeo/tournaments";
export {
  createTournament,
  registerStrategy,
  addScenario,
  runMatch,
  completeTournament,
  createBaselineStrategies,
} from "@zeo/tournaments";

export type {
  CausalSkeleton,
  CausalNode,
  CausalEdge,
  SkeletonCollection,
  SkeletonComparison,
  IdentificationRequirement,
} from "@zeo/causal-skeletons";
export {
  createCollection,
  createSkeleton,
  addNode,
  addEdge,
  compareSkeletons,
  generateProposalSkeleton,
  exportSkeleton,
  importSkeleton,
} from "@zeo/causal-skeletons";

export type {
  MarketState,
  MarketHypothesis,
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
} from "@zeo/hypothesis-market";

export type {
  RobustnessResult,
  RobustnessCategory,
  RiskLevel,
  StabilityConfig,
  ConfoundingConfig,
} from "@zeo/robustness";
export {
  assessStability,
  assessConfoundingRisk,
  detectLeakage,
  assessMulticollinearity,
  assessSampleAdequacy,
  runAllRobustnessChecks,
} from "@zeo/robustness";

export type {
  TelemetryEvent,
  TelemetryStore,
  IntervalChangeEvent,
  VoiChurnEvent,
  TelemetryAggregate,
} from "@zeo/telemetry";
export {
  getTelemetryStore,
  createIntervalChangeEvent,
  createVoiChurnEvent,
  createUserOverrideEvent,
  computeHealthScore,
} from "@zeo/telemetry";

export type {
  RegimeEvent,
  RegimeState,
  RegimeDomain,
  RegimeKind,
} from "@zeo/regimes";
export { detectRegimes, widenPosteriorBand } from "@zeo/regimes";

export type {
  MeasurementScale,
  MeasurementValue,
  ScaleType,
} from "@zeo/measurement";
export {
  scaleRegistry,
  assertCompatibleScales,
  assertOperationAllowed,
  computeMean,
  createMeasurementValue,
} from "@zeo/measurement";

export type {
  WarehouseAdapter,
  WarehouseEnvelope,
  WarehouseRecord,
} from "@zeo/warehouse";
export {
  FilesystemWarehouseAdapter,
  IndexedDBWarehouseAdapter,
} from "@zeo/warehouse";

export type {
  ReplayDataset,
  ReplayCase,
  OutcomeRecord,
  OutcomeMetric,
} from "@zeo/replay";
export { runReplay, generateCalibrationReport } from "@zeo/replay";

export type { AuditEvent, AuditLog } from "@zeo/audit";
export { createAuditLog, recordAuditEvent } from "@zeo/audit";

export type { ClusterResult, Cluster } from "@zeo/semantic-clustering";
export { clusterItems } from "@zeo/semantic-clustering";

export type { DatasetSchema, DatasetRow } from "@zeo/dataset-builder";
export { buildDataset, datasetToCsv } from "@zeo/dataset-builder";

export type {
  AnalysisPlan,
  AnalysisStep,
  AnalysisPlannerConfig,
} from "@zeo/analysis-planner";
export { generateAnalysisPlan } from "@zeo/analysis-planner";

export type {
  FeatureCandidate,
  FeatureDiscoveryResult,
  FeatureDiscoveryConfig,
} from "@zeo/feature-discovery";
export { proposeFeatures } from "@zeo/feature-discovery";

export type {
  HypothesisRegistry,
  Hypothesis,
  HypothesisTest,
  HypothesisStatus,
} from "@zeo/hypothesis-registry";
export {
  createRegistry,
  addHypothesis,
  recordTest,
  getHypothesisHistory,
} from "@zeo/hypothesis-registry";

export type {
  DecisionImplication,
  SynthesisResult,
  SynthesizerConfig,
} from "@zeo/decision-synthesizer";
export { synthesizeDecisionImplications } from "@zeo/decision-synthesizer";
