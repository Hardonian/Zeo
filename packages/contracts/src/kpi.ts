/**
 * KPI Types for Zeo Decision Intelligence
 *
 * Provides type definitions for Key Performance Indicators,
 * measurements, dashboards, and alerts with epistemic discipline.
 */

import type { ProvenancePointer, ProbabilityInterval, UUID, Claim } from "./types.js";

/**
 * KPI value types - scalar, interval, or distribution
 */
export type KpiValue =
  | { type: "scalar"; value: number; unit?: string }
  | { type: "interval"; low: number; high: number; unit?: string }
  | { type: "distribution"; mean: number; stdDev: number; samples?: number };

/**
 * KPI categories for organization
 */
export type KpiCategory =
  | "decision_quality"
  | "calibration"
  | "robustness"
  | "efficiency"
  | "epistemic_integrity"
  | "custom";

/**
 * KPI formula type for deterministic computation
 */
export type KpiFormula =
  | { type: "direct"; field: string }
  | { type: "ratio"; numerator: string; denominator: string }
  | { type: "aggregate"; operation: "sum" | "avg" | "max" | "min"; field: string }
  | { type: "custom"; compute: (data: Record<string, unknown>) => number };

/**
 * KPI Contract - defines a KPI specification
 */
export interface KpiContract {
  id: string;
  name: string;
  description: string;
  category: KpiCategory;
  formula: KpiFormula;
  unit?: string;

  /** Target/benchmark values */
  targets?: {
    minimum?: number;
    target?: number;
    stretch?: number;
  };

  /** Uncertainty configuration */
  uncertainty: {
    defaultWidth: number;  // Default interval width
    requiresConfidence: boolean;
  };

  /** Provenance requirements */
  provenanceRequired: boolean;

  /** Version for evolution tracking */
  version: string;

  /** Creator info */
  createdBy: "system" | "user" | string;
  createdAt: string;

  /** Tags for organization */
  tags: string[];
}

/**
 * KPI Measurement - a computed instance of a KPI
 */
export interface KpiMeasurement {
  id: UUID;
  kpiId: string;
  kpiVersion: string;
  category: KpiCategory;

  /** The computed value */
  measurement: KpiValue;

  /** Time period for the measurement */
  periodStart: string;  // ISO timestamp
  periodEnd: string;    // ISO timestamp

  /** Computation metadata */
  computation: {
    timestamp: string;
    inputHash: string;  // Hash of input data for reproducibility
    formulaVersion: string;
    durationMs: number;
  };

  /** Input data snapshot */
  inputs: {
    decisionCount?: number;
    evidenceCount?: number;
    assumptionsCount?: number;
    customData?: Record<string, unknown>;
  };

  /** Epistemic metadata */
  epistemic: {
    status: "fact" | "belief" | "assumption";
    confidenceBand: { low: number; high: number };
    provenance: ProvenancePointer[];
    warnings: string[];
  };

  /** Related entities */
  relatedDecisions?: UUID[];
  relatedEvidence?: UUID[];

  /** Determinism verification */
  determinism: {
    isReproducible: boolean;
    seed?: string;
    verificationHash?: string;
  };

  /** Tags */
  tags: string[];

  /** Timestamp */
  createdAt: string;
}

/**
 * KPI Trend analysis
 */
export interface KpiTrend {
  kpiId: string;
  periodStart: string;
  periodEnd: string;

  /** Trend direction */
  direction: "improving" | "degrading" | "stable" | "volatile";

  /** Change magnitude */
  change: {
    absolute: number;
    percentage: number;
    fromValue: number;
    toValue: number;
  };

  /** Statistical confidence */
  confidence: number;

  /** Samples used */
  sampleCount: number;

  /** Comparison to targets */
  vsTarget?: {
    gap: number;
    onTrack: boolean;
    projectedDate?: string;
  };

  /** Contributing factors */
  factors: Array<{
    factor: string;
    impact: "positive" | "negative" | "neutral";
    magnitude: number;
  }>;

  computedAt: string;
}

/**
 * Dashboard panel configuration
 */
export interface KpiDashboardPanel {
  id: string;
  title: string;
  kpiId: string;
  type: "gauge" | "sparkline" | "bar" | "table" | "number" | "trend";

  /** Grid position */
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };

  /** Panel-specific configuration */
  config: Record<string, unknown>;

  /** Time window override */
  timeWindow?: string;  // e.g., "7d", "30d", "90d"

  /** Comparison settings */
  comparison?: {
    vsPrevious: boolean;
    vsTarget: boolean;
    vsBenchmark?: string;
  };
}

/**
 * KPI Dashboard definition
 */
export interface KpiDashboard {
  id: string;
  name: string;
  description: string;

  /** Owner */
  owner: string;

  /** Layout configuration */
  layout: {
    columns: number;
    rowHeight: number;
    mobileColumns?: number;
  };

  /** Panels */
  panels: KpiDashboardPanel[];

  /** Default time range */
  defaultTimeRange?: {
    from: string;
    to: string;
  };

  /** Auto-refresh interval (ms) */
  refreshInterval?: number;

  /** Metadata */
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

/**
 * Alert rule definition
 */
export interface KpiAlertRule {
  id: string;
  name: string;
  description: string;

  /** Target KPI */
  kpiId: string;

  /** Condition */
  condition: {
    operator: "lt" | "gt" | "lte" | "gte" | "eq" | "between" | "outside";
    threshold: number | [number, number];
    duration?: number;  // Sustained for N seconds
  };

  /** Severity */
  severity: "low" | "medium" | "high" | "critical";

  /** Notification channels */
  channels: Array<{
    type: "console" | "webhook" | "email" | "ui";
    config: Record<string, unknown>;
  }>;

  /** Cooldown between alerts */
  cooldownSeconds: number;

  /** Enabled */
  enabled: boolean;

  createdAt: string;
  updatedAt: string;
}

/**
 * Alert instance
 */
export interface KpiAlert {
  id: string;
  ruleId: string;

  /** Alert status */
  status: "active" | "triggered" | "acknowledged" | "resolved";

  /** Severity */
  severity: "low" | "medium" | "high" | "critical";

  /** Trigger context */
  triggered: {
    at: string;
    value: number;
    threshold: number;
    condition: string;
  };

  /** Acknowledgment */
  acknowledged?: {
    at: string;
    by: string;
    note?: string;
  };

  /** Resolution */
  resolved?: {
    at: string;
    by?: string;
    reason?: string;
  };

  /** Related KPI */
  kpiId: string;
  measurementId: string;

  /** Notifications sent */
  notifications: Array<{
    channel: string;
    sentAt: string;
    status: "pending" | "sent" | "failed";
  }>;

  createdAt: string;
  updatedAt: string;
}

/**
 * KPI Registry - collection of defined KPIs
 */
export interface KpiRegistry {
  kpis: Map<string, KpiContract>;
  version: string;
  updatedAt: string;
}

/**
 * KPI computation result with metadata
 */
export interface KpiComputationResult {
  success: boolean;
  measurement?: KpiMeasurement;
  error?: {
    code: KpiErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };

  /** Performance metrics */
  performance: {
    durationMs: number;
    inputSize: number;
    cacheHit: boolean;
  };
}

/**
 * KPI error codes
 */
export type KpiErrorCode =
  | "INVALID_INPUT"
  | "MISSING_DATA"
  | "COMPUTATION_FAILED"
  | "INSUFFICIENT_CONFIDENCE"
  | "PROVENANCE_REQUIRED"
  | "INVALID_FORMULA"
  | "CIRCULAR_DEPENDENCY"
  | "STORAGE_ERROR"
  | "NOT_FOUND";

/**
 * Standard KPI definitions
 */
export const StandardKpis = {
  DECISION_COVERAGE: "decision-coverage",
  CALIBRATION_SCORE: "calibration-score",
  ROBUSTNESS_SCORE: "robustness-score",
  EVIDENCE_COMPLETENESS: "evidence-completeness",
  UNCERTAINTY_WIDTH: "uncertainty-width",
  FORECAST_ACCURACY: "forecast-accuracy",
  BRANCH_DEPTH: "branch-depth",
  VOI_UTILIZATION: "voi-utilization",
} as const;

/**
 * KPI export format for sharing
 */
export interface KpiExport {
  version: string;
  exportedAt: string;

  kpis: KpiContract[];
  measurements: KpiMeasurement[];
  dashboards: KpiDashboard[];
  alerts: KpiAlert[];

  /** Epistemic notice */
  epistemicNotice: {
    status: "belief";
    confidenceBand: ProbabilityInterval;
    warnings: string[];
  };
}

