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
} from "./types";

// Storage
export type { DecisionStorageAdapter } from "./storage";
export { InMemoryStorageAdapter } from "./storage";

// Manager
export type { CreateDecisionOptions, RecordOutcomeOptions } from "./manager";
export { DecisionMemoryManager } from "./manager";

// Resolution Engine
export type { 
  BranchMatch, 
  ResolutionResult, 
  MatchingOptions 
} from "./resolution";
export { ResolutionEngine } from "./resolution";

// Prior Update Engine
export type {
  PriorLevel,
  PriorDistribution,
  PriorUpdate,
  HierarchicalPriors,
  PriorLookupOptions,
  AppliedPrior,
} from "./priors";
export { PriorUpdateEngine } from "./priors";

// Pattern Detection
export type {
  PatternType,
  PatternConfidence,
  CrossDecisionPattern,
  PatternDetectionOptions,
} from "./patterns";
export { PatternDetectionEngine } from "./patterns";

// Counterfactual & Regret Analysis
export type {
  CounterfactualScenario,
  RegretAnalysis,
} from "./counterfactual";
export { CounterfactualEngine } from "./counterfactual";

// Inbox Storage
export type { InboxStorage } from "./inbox";
export { createInboxStorage, createLocalStorageAdapter, createMemoryAdapter } from "./inbox";

