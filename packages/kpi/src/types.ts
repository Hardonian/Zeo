/**
 * KPI Contract Types
 * 
 * Key Performance Indicators for decision quality, calibration, and outcome tracking.
 * All KPIs are tagged with epistemic status - they are beliefs/proposals, not facts.
 * 
 * @module @zeo/kpi
 * @version 0.1.0
 */

import type { 
  UUID, 
  EpistemicStatus, 
  ConfidenceBand, 
  ProbabilityInterval,
  ProvenancePointer 
} from "@zeo/contracts";

/**
 * KPI Value Types
 * Different ways KPI values can be represented
 */
export type KpiValue = 
  | { kind: "scalar"; value: number; unit?: string }
  | { kind: "interval"; value: ProbabilityInterval; unit?: string }
  | { kind: "ordinal"; level: number; scale: string }
  | { kind: "boolean"; value: boolean; confidence: ProbabilityInterval };

/**
 * KPI Category
 * Groups related KPIs by domain
 */
export type KpiCategory = 
  | "decision_quality"      // Quality of decision-making process
  | "calibration"          // Forecast accuracy and calibration
  | "robustness"           // Robustness across assumption sets
  | "outcome"              // Actual outcomes achieved
  | "efficiency"           // Resource efficiency (time, cognitive load)
  | "learning"             // Learning and improvement over time
  | "coverage";            // Evidence and assumption coverage

/**
 * KPI Contract - Definition of a Key Performance Indicator
 * 
 * Note: KPIs are measurable indicators but should be treated as
 * beliefs with confidence bands, not facts. They require validation
 * and provenance where applicable.
 */
export interface KpiContract {
  id: UUID;
  name: string;
  description: string;
  category: KpiCategory;
  
  /** How the KPI is computed */
  formula: KpiFormula;
  
  /** Target range (what constitutes "good") */
  target?: {
    type: "minimize" | "maximize" | "range" | "threshold";
    ideal: KpiValue;
    acceptable?: KpiValue;
    critical?: KpiValue;
  };
  
  /** Temporal properties */
  temporal: {
    /** How often this KPI is computed */
    computeFrequency: "per_decision" | "daily" | "weekly" | "monthly" | "on_demand";
    /** Whether this KPI tracks changes over time */
    isTimeSeries: boolean;
    /** Half-life for exponential decay of relevance (hours) */
    relevanceHalfLifeHours?: number;
  };
  
  /** Epistemic discipline */
  epistemic: {
    /** Default status for computed values */
    defaultStatus: EpistemicStatus;
    /** Whether this KPI requires provenance */
    requiresProvenance: boolean;
    /** Confidence band for this KPI type */
    defaultConfidence: ConfidenceBand;
    /** Minimum sample size for reliable computation */
    minSampleSize?: number;
  };
  
  /** Metadata */
  version: string;
  createdAt: string;
  tags: string[];
}

/**
 * KPI Formula Types
 * Different computational approaches for KPIs
 */
export type KpiFormula =
  | { type: "direct"; source: string }
  | { type: "ratio"; numerator: string; denominator: string }
  | { type: "aggregate"; operation: "mean" | "median" | "sum" | "count"; field: string }
  | { type: "composite"; components: Array<{ kpiId: UUID; weight: number }> }
  | { type: "custom"; compute: string; description: string };

/**
 * KPI Measurement - A computed instance of a KPI
 * 
 * All measurements carry epistemic metadata to maintain
 * discipline about what is known vs assumed.
 */
export interface KpiMeasurement {
  id: UUID;
  kpiId: UUID;
  
  /** The computed value */
  value: KpiValue;
  
  /** Context for this measurement */
  context: {
    /** What decision/domain this measures */
    decisionId?: UUID;
    domain?: string;
    /** Time period covered */
    period: {
      start: string;
      end: string;
    };
    /** Sample size used in computation */
    sampleSize: number;
  };
  
  /** Epistemic discipline */
  epistemic: {
    status: EpistemicStatus;
    confidence: ConfidenceBand;
    /** Uncertainty in the measurement */
    uncertainty?: ProbabilityInterval;
    /** What would change this measurement significantly */
    sensitivityNotes?: string[];
  };
  
  /** Provenance for facts */
  provenance?: ProvenancePointer[];
  
  /** If AI-assisted, mark as requiring validation */
  aiAssisted?: {
    modelId: string;
    requiresValidation: true;
    epistemicWarnings: string[];
  };
  
  /** Timestamp */
  computedAt: string;
  
  /** Determinism: hash of inputs for reproducibility */
  inputHash: string;
}

/**
 * KPI Trend - Time series of measurements with trend analysis
 * 
 * Trend analysis helps identify whether KPIs are improving
 * or degrading over time, with appropriate uncertainty.
 */
export interface KpiTrend {
  kpiId: UUID;
  
  /** Time series data */
  measurements: Array<{
    timestamp: string;
    value: number;
    confidence: ConfidenceBand;
  }>;
  
  /** Trend analysis */
  analysis: {
    /** Direction of trend */
    direction: "improving" | "degrading" | "stable" | "uncertain";
    /** Confidence in trend direction */
    confidence: ConfidenceBand;
    /** Rate of change (units per time period) */
    rateOfChange?: {
      value: number;
      unit: string;
      confidence: ProbabilityInterval;
    };
    /** When trend last changed direction */
    lastInflectionPoint?: string;
  };
  
  /** Epistemic warnings */
  warnings: string[];
}

/**
 * KPI Dashboard - Collection of KPIs for a specific view
 */
export interface KpiDashboard {
  id: UUID;
  name: string;
  description: string;
  
  /** KPIs included in this dashboard */
  kpis: Array<{
    kpiId: UUID;
    displayOrder: number;
    highlight?: "highlight" | "warning" | "critical" | null;
  }>;
  
  /** Filter criteria */
  filters?: {
    domains?: string[];
    categories?: KpiCategory[];
    dateRange?: { start: string; end: string };
  };
  
  /** Visualization preferences */
  visualization: {
    defaultView: "summary" | "trends" | "comparison" | "detail";
    chartTypes: Array<"line" | "bar" | "gauge" | "heatmap" | "table">;
  };
  
  /** Epistemic discipline notice */
  epistemicNotice: string;
}

/**
 * KPI Alert - Notification when a KPI crosses thresholds
 */
export interface KpiAlert {
  id: UUID;
  kpiId: UUID;
  measurementId: UUID;
  
  /** What triggered the alert */
  trigger: {
    type: "threshold_crossed" | "trend_detected" | "anomaly_detected";
    threshold: string;
    severity: "info" | "warning" | "critical";
  };
  
  /** Alert content */
  message: string;
  details: {
    measuredValue: KpiValue;
    targetValue?: KpiValue;
    deviation: {
      absolute: number;
      relative: number;
    };
  };
  
  /** Recommended actions (AI-proposed, requires validation) */
  recommendations?: Array<{
    action: string;
    rationale: string;
    expectedImpact: string;
    requiresValidation: true;
    epistemicStatus: "assumption";
  }>;
  
  createdAt: string;
  acknowledgedAt?: string;
}

/**
 * KPI Registry - Collection of available KPIs
 */
export interface KpiRegistry {
  kpis: Map<UUID, KpiContract>;
  categories: Map<KpiCategory, UUID[]>;
  version: string;
  lastUpdated: string;
}

/**
 * KPI Computation Result
 */
export interface KpiComputationResult {
  measurement: KpiMeasurement;
  
  /** Intermediate values for transparency */
  intermediateValues?: Array<{
    name: string;
    value: number;
    description: string;
  }>;
  
  /** Any errors or warnings during computation */
  issues: Array<{
    severity: "error" | "warning" | "info";
    code: string;
    message: string;
  }>;
  
  /** Determinism verification */
  determinism: {
    inputHash: string;
    outputHash: string;
    seed?: string;
    isReproducible: boolean;
  };
}

/**
 * Standard KPI Definitions
 * Pre-defined KPIs following Zeo's epistemic principles
 */
export const StandardKpis = {
  /** Decision coverage: % of decisions with complete assumption sets */
  DECISION_COVERAGE: "kpi-decision-coverage",
  
  /** Calibration score: how well prediction intervals cover outcomes */
  CALIBRATION_SCORE: "kpi-calibration-score",
  
  /** Robustness score: % of decisions with robust (non-fragile) recommendations */
  ROBUSTNESS_SCORE: "kpi-robustness-score",
  
  /** Evidence provenance: % of facts with valid provenance */
  PROVENANCE_COVERAGE: "kpi-provenance-coverage",
  
  /** Decision time: time from start to recommendation */
  DECISION_TIME: "kpi-decision-time",
  
  /** Outcome resolution rate: % of decisions with recorded outcomes */
  OUTCOME_RESOLUTION_RATE: "kpi-outcome-resolution",
  
  /** Learning rate: improvement in calibration over time */
  LEARNING_RATE: "kpi-learning-rate",
  
  /** VOI effectiveness: % of high-VOI evidence that changed decisions */
  VOI_EFFECTIVENESS: "kpi-voi-effectiveness",
} as const;

/**
 * KPI Error Codes
 */
export type KpiErrorCode =
  | "KPI_INVALID_FORMULA"
  | "KPI_INSUFFICIENT_DATA"
  | "KPI_COMPUTATION_ERROR"
  | "KPI_TARGET_UNDEFINED"
  | "KPI_EPISTEMIC_VIOLATION"
  | "KPI_DETERMINISM_FAILURE";
