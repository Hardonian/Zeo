// Core types
export type {
  ResolutionStatus,
  OutcomeConfidence,
  OutcomeRecord,
  BranchRecord,
  TemporalContext,
  DecisionRecord,
  PartialResolution,
  OutcomeMapping,
  DecisionQuery,
  DecisionStats,
} from "./types.js";

// Storage
export type { DecisionStorageAdapter } from "./storage.js";
export { InMemoryStorageAdapter } from "./storage.js";

// Manager
export type { CreateDecisionOptions, RecordOutcomeOptions } from "./manager.js";
export { DecisionMemoryManager } from "./manager.js";

// Resolution Engine
export type { 
  BranchMatch, 
  ResolutionResult, 
  MatchingOptions 
} from "./resolution.js";
export { ResolutionEngine } from "./resolution.js";

// Prior Update Engine
export type {
  PriorLevel,
  PriorDistribution,
  PriorUpdate,
  HierarchicalPriors,
  PriorLookupOptions,
  AppliedPrior,
} from "./priors.js";
export { PriorUpdateEngine } from "./priors.js";
