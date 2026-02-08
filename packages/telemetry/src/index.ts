/**
 * Intelligence Telemetry & Meta-Telemetry
 *
 * Let Zeo observe its own epistemic behavior over time.
 * Tracks interval widths, VOI churn, user overrides, clarifier acceptance,
 * and regime-change frequency. Detects epistemic drift patterns.
 */

/**
 * Types of telemetry events
 */
export type TelemetryEventType =
  | "interval_change"
  | "widen_only_trigger"
  | "voi_churn"
  | "user_override"
  | "user_acceptance"
  | "clarifier_acceptance"
  | "clarifier_rejection"
  | "regime_change"
  | "decision_rendered"
  | "evidence_ingested";

/**
 * Base telemetry event
 */
export interface TelemetryEvent {
  id: string;
  type: TelemetryEventType;
  timestamp: string;
  sessionId: string;
  decisionId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Interval width change event
 */
export interface IntervalChangeEvent extends TelemetryEvent {
  type: "interval_change";
  variableId: string;
  previousWidth: number;
  newWidth: number;
  trigger: "evidence" | "inference" | "regime_change" | "manual";
}

/**
 * VOI (Value of Information) churn event
 */
export interface VoiChurnEvent extends TelemetryEvent {
  type: "voi_churn";
  previousTopAction: string;
  newTopAction: string;
  rankingDelta: number; // How much the ranking changed
  disambiguatingEvidence?: string[];
}

/**
 * User override event
 */
export interface UserOverrideEvent extends TelemetryEvent {
  type: "user_override";
  originalAction: string;
  overrideAction: string;
  overrideReason?: string;
  confidenceBand?: { low: number; high: number };
}

/**
 * User acceptance event
 */
export interface UserAcceptanceEvent extends TelemetryEvent {
  type: "user_acceptance";
  actionId: string;
  timeToDecision: number; // milliseconds
  clarifiersUsed: number;
}

/**
 * Clarifier interaction event
 */
export interface ClarifierEvent extends TelemetryEvent {
  type: "clarifier_acceptance" | "clarifier_rejection";
  clarifierId: string;
  question: string;
  response?: string;
}

/**
 * Regime change event
 */
export interface RegimeChangeTelemetryEvent extends TelemetryEvent {
  type: "regime_change";
  domain: string;
  previousRegime: string;
  newRegime: string;
  confidence: number;
}

/**
 * Decision rendered event
 */
export interface DecisionRenderedEvent extends TelemetryEvent {
  type: "decision_rendered";
  decisionId: string;
  topActionId: string;
  topActionScore: number;
  intervalCount: number;
  constraintCount: number;
  lensId?: string;
}

/**
 * Evidence ingested event
 */
export interface EvidenceIngestedEvent extends TelemetryEvent {
  type: "evidence_ingested";
  sourceId: string;
  evidenceType: string;
  variableIds: string[];
  intervalNarrowingCount: number;
}

/**
 * Union type of all telemetry events
 */
export type TelemetryEventUnion =
  | IntervalChangeEvent
  | VoiChurnEvent
  | UserOverrideEvent
  | UserAcceptanceEvent
  | ClarifierEvent
  | RegimeChangeTelemetryEvent
  | DecisionRenderedEvent
  | EvidenceIngestedEvent;

/**
 * Aggregated telemetry statistics
 */
export interface TelemetryAggregate {
  sessionId: string;
  startTime: string;
  endTime: string;
  eventCounts: Map<TelemetryEventType, number>;
  intervalWidthDistribution: {
    mean: number;
    median: number;
    p90: number;
    p95: number;
    trend: "narrowing" | "widening" | "stable";
  };
  widenOnlyTriggerRate: number;
  voiChurnRate: number;
  userOverrideRate: number;
  clarifierAcceptanceRate: number;
  regimeChangeFrequency: number;
}

/**
 * Drift detection alert
 */
export interface DriftAlert {
  id: string;
  timestamp: string;
  severity: "info" | "warning" | "critical";
  type:
    | "narrowing_without_evidence"
    | "over_dominance"
    | "repeated_override_pattern"
    | "interval_inflation"
    | "confidence_without_basis";
  message: string;
  affectedVariables?: string[];
  recommendedAction?: string;
}

/**
 * Local telemetry store
 */
export class TelemetryStore {
  private events: TelemetryEventUnion[] = [];
  private sessionId: string;
  private alerts: DriftAlert[] = [];

  constructor(sessionId?: string) {
    this.sessionId = sessionId ?? `session-${Date.now()}`;
  }

  /**
   * Record a telemetry event
   */
  record(event: Omit<TelemetryEventUnion, "id" | "timestamp" | "sessionId">): void {
    const fullEvent = {
      ...event,
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
    } as TelemetryEventUnion;

    this.events.push(fullEvent);

    // Run drift detection after recording
    this.detectDrift();
  }

  /**
   * Get all events
   */
  getEvents(): TelemetryEventUnion[] {
    return [...this.events];
  }

  /**
   * Get events by type
   */
  getEventsByType(type: TelemetryEventType): TelemetryEventUnion[] {
    return this.events.filter(e => e.type === type);
  }

  /**
   * Get events for a specific decision
   */
  getEventsForDecision(decisionId: string): TelemetryEventUnion[] {
    return this.events.filter(e => e.decisionId === decisionId);
  }

  /**
   * Get session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Get all drift alerts
   */
  getAlerts(): DriftAlert[] {
    return [...this.alerts];
  }

  /**
   * Get recent alerts (last N)
   */
  getRecentAlerts(count: number): DriftAlert[] {
    return this.alerts.slice(-count);
  }

  /**
   * Clear events
   */
  clear(): void {
    this.events = [];
    this.alerts = [];
  }

  /**
   * Compute aggregated statistics
   */
  computeAggregate(): TelemetryAggregate {
    const intervalChanges = this.getEventsByType("interval_change") as IntervalChangeEvent[];
    const widenOnlyTriggers = this.getEventsByType("widen_only_trigger").length;
    const voiChurns = this.getEventsByType("voi_churn").length;
    const overrides = this.getEventsByType("user_override").length;
    const acceptances = this.getEventsByType("user_acceptance").length;
    const clarifierAccepts = this.getEventsByType("clarifier_acceptance").length;
    const clarifierRejects = this.getEventsByType("clarifier_rejection").length;
    const regimeChanges = this.getEventsByType("regime_change").length;

    // Compute interval width distribution
    const widths = intervalChanges.map(e => e.newWidth);
    const sortedWidths = [...widths].sort((a, b) => a - b);
    const mean = widths.length > 0 ? widths.reduce((a, b) => a + b, 0) / widths.length : 0;
    const median = sortedWidths[Math.floor(sortedWidths.length / 2)] ?? 0;
    const p90 = sortedWidths[Math.floor(sortedWidths.length * 0.9)] ?? 0;
    const p95 = sortedWidths[Math.floor(sortedWidths.length * 0.95)] ?? 0;

    // Determine trend
    let trend: "narrowing" | "widening" | "stable" = "stable";
    if (intervalChanges.length >= 2) {
      const firstHalf = intervalChanges.slice(0, Math.floor(intervalChanges.length / 2));
      const secondHalf = intervalChanges.slice(Math.floor(intervalChanges.length / 2));
      const firstAvg = firstHalf.reduce((sum, e) => sum + e.newWidth, 0) / firstHalf.length || 0;
      const secondAvg = secondHalf.reduce((sum, e) => sum + e.newWidth, 0) / secondHalf.length || 0;
      if (secondAvg < firstAvg * 0.9) trend = "narrowing";
      else if (secondAvg > firstAvg * 1.1) trend = "widening";
    }

    // Calculate rates
    const totalIntervals = intervalChanges.length;
    const widenOnlyRate = totalIntervals > 0 ? widenOnlyTriggers / totalIntervals : 0;
    const decisionsRendered = this.getEventsByType("decision_rendered").length;
    const voiChurnRate = decisionsRendered > 0 ? voiChurns / decisionsRendered : 0;
    const totalUserInteractions = overrides + acceptances;
    const overrideRate = totalUserInteractions > 0 ? overrides / totalUserInteractions : 0;
    const totalClarifierInteractions = clarifierAccepts + clarifierRejects;
    const clarifierAcceptRate = totalClarifierInteractions > 0 ? clarifierAccepts / totalClarifierInteractions : 0;
    const regimeChangeFreq = this.events.length > 0 ? regimeChanges / this.events.length : 0;

    return {
      sessionId: this.sessionId,
      startTime: this.events[0]?.timestamp ?? new Date().toISOString(),
      endTime: this.events[this.events.length - 1]?.timestamp ?? new Date().toISOString(),
      eventCounts: new Map([
        ["interval_change", totalIntervals],
        ["widen_only_trigger", widenOnlyTriggers],
        ["voi_churn", voiChurns],
        ["user_override", overrides],
        ["user_acceptance", acceptances],
        ["clarifier_acceptance", clarifierAccepts],
        ["clarifier_rejection", clarifierRejects],
        ["regime_change", regimeChanges],
      ]),
      intervalWidthDistribution: {
        mean,
        median,
        p90,
        p95,
        trend,
      },
      widenOnlyTriggerRate: widenOnlyRate,
      voiChurnRate: voiChurnRate,
      userOverrideRate: overrideRate,
      clarifierAcceptanceRate: clarifierAcceptRate,
      regimeChangeFrequency: regimeChangeFreq,
    };
  }

  /**
   * Detect drift patterns
   */
  private detectDrift(): void {
    this.detectNarrowingWithoutEvidence();
    this.detectOverDominance();
    this.detectRepeatedOverridePattern();
    this.detectIntervalInflation();
  }

  /**
   * Detect narrowing without evidence
   */
  private detectNarrowingWithoutEvidence(): void {
    const intervalChanges = this.getEventsByType("interval_change") as IntervalChangeEvent[];

    // Look for narrowing events not triggered by evidence
    const suspiciousNarrowings = intervalChanges.filter(
      e => e.previousWidth > e.newWidth * 1.2 && e.trigger !== "evidence"
    );

    if (suspiciousNarrowings.length >= 3) {
      const alert: DriftAlert = {
        id: `drift-${Date.now()}`,
        timestamp: new Date().toISOString(),
        severity: "warning",
        type: "narrowing_without_evidence",
        message: `${suspiciousNarrowings.length} interval narrowings detected without corresponding evidence ingestion`,
        affectedVariables: [...new Set(suspiciousNarrowings.map(e => e.variableId))],
        recommendedAction: "Review inference chains for unjustified precision gains",
      };
      this.alerts.push(alert);
    }
  }

  /**
   * Detect over-dominance of variables
   */
  private detectOverDominance(): void {
    const decisions = this.getEventsByType("decision_rendered") as DecisionRenderedEvent[];

    if (decisions.length < 5) return;

    // Check if the same variable consistently has the highest score
    const topActions = decisions.map(d => d.topActionId);
    const actionCounts = new Map<string, number>();
    for (const action of topActions) {
      actionCounts.set(action, (actionCounts.get(action) ?? 0) + 1);
    }

    for (const [actionId, count] of actionCounts) {
      const ratio = count / decisions.length;
      if (ratio > 0.8) {
        const alert: DriftAlert = {
          id: `drift-${Date.now()}`,
          timestamp: new Date().toISOString(),
          severity: "info",
          type: "over_dominance",
          message: `Action '${actionId}' dominated ${(ratio * 100).toFixed(0)}% of decisions`,
          recommendedAction: "Consider if model is over-relying on single factor",
        };
        this.alerts.push(alert);
      }
    }
  }

  /**
   * Detect repeated override patterns
   */
  private detectRepeatedOverridePattern(): void {
    const overrides = this.getEventsByType("user_override") as UserOverrideEvent[];

    if (overrides.length < 3) return;

    // Check for repeated overrides of the same action
    const overrideTargets = overrides.map(o => o.originalAction);
    const targetCounts = new Map<string, number>();
    for (const target of overrideTargets) {
      targetCounts.set(target, (targetCounts.get(target) ?? 0) + 1);
    }

    for (const [targetId, count] of targetCounts) {
      if (count >= 3) {
        const alert: DriftAlert = {
          id: `drift-${Date.now()}`,
          timestamp: new Date().toISOString(),
          severity: "warning",
          type: "repeated_override_pattern",
          message: `Action '${targetId}' was overridden ${count} times`,
          affectedVariables: [targetId],
          recommendedAction: "Review why this action consistently disagrees with user judgment",
        };
        this.alerts.push(alert);
      }
    }
  }

  /**
   * Detect interval inflation (continuous widening)
   */
  private detectIntervalInflation(): void {
    const intervalChanges = this.getEventsByType("interval_change") as IntervalChangeEvent[];

    if (intervalChanges.length < 10) return;

    // Check the trend
    const widenings = intervalChanges.filter(e => e.newWidth > e.previousWidth);
    const wideningRatio = widenings.length / intervalChanges.length;

    if (wideningRatio > 0.7) {
      const alert: DriftAlert = {
        id: `drift-${Date.now()}`,
        timestamp: new Date().toISOString(),
        severity: "warning",
        type: "interval_inflation",
        message: `${(wideningRatio * 100).toFixed(0)}% of interval changes were widenings`,
        recommendedAction: "Check for missing evidence or over-conservative inference",
      };
      this.alerts.push(alert);
    }
  }
}

// Global telemetry store instance
let globalStore: TelemetryStore | null = null;

/**
 * Get or create the global telemetry store
 */
export function getTelemetryStore(sessionId?: string): TelemetryStore {
  if (!globalStore) {
    globalStore = new TelemetryStore(sessionId);
  }
  return globalStore;
}

/**
 * Reset the global telemetry store
 */
export function resetTelemetryStore(): void {
  globalStore = null;
}

/**
 * Create an interval change event
 */
export function createIntervalChangeEvent(
  variableId: string,
  previousWidth: number,
  newWidth: number,
  trigger: IntervalChangeEvent["trigger"],
  decisionId?: string
): Omit<IntervalChangeEvent, "id" | "timestamp" | "sessionId"> {
  return {
    type: "interval_change",
    variableId,
    previousWidth,
    newWidth,
    trigger,
    decisionId,
  };
}

/**
 * Create a VOI churn event
 */
export function createVoiChurnEvent(
  previousTopAction: string,
  newTopAction: string,
  rankingDelta: number,
  decisionId?: string,
  disambiguatingEvidence?: string[]
): Omit<VoiChurnEvent, "id" | "timestamp" | "sessionId"> {
  return {
    type: "voi_churn",
    previousTopAction,
    newTopAction,
    rankingDelta,
    decisionId,
    disambiguatingEvidence,
  };
}

/**
 * Create a user override event
 */
export function createUserOverrideEvent(
  originalAction: string,
  overrideAction: string,
  decisionId?: string,
  overrideReason?: string,
  confidenceBand?: { low: number; high: number }
): Omit<UserOverrideEvent, "id" | "timestamp" | "sessionId"> {
  return {
    type: "user_override",
    originalAction,
    overrideAction,
    decisionId,
    overrideReason,
    confidenceBand,
  };
}

/**
 * Create a user acceptance event
 */
export function createUserAcceptanceEvent(
  actionId: string,
  timeToDecision: number,
  clarifiersUsed: number,
  decisionId?: string
): Omit<UserAcceptanceEvent, "id" | "timestamp" | "sessionId"> {
  return {
    type: "user_acceptance",
    actionId,
    timeToDecision,
    clarifiersUsed,
    decisionId,
  };
}

/**
 * Create a clarifier event
 */
export function createClarifierEvent(
  type: "clarifier_acceptance" | "clarifier_rejection",
  clarifierId: string,
  question: string,
  decisionId?: string,
  response?: string
): Omit<ClarifierEvent, "id" | "timestamp" | "sessionId"> {
  return {
    type,
    clarifierId,
    question,
    decisionId,
    response,
  };
}

/**
 * Create a regime change telemetry event
 */
export function createRegimeChangeTelemetryEvent(
  domain: string,
  previousRegime: string,
  newRegime: string,
  confidence: number,
  decisionId?: string
): Omit<RegimeChangeTelemetryEvent, "id" | "timestamp" | "sessionId"> {
  return {
    type: "regime_change",
    domain,
    previousRegime,
    newRegime,
    confidence,
    decisionId,
  };
}

/**
 * Create a decision rendered event
 */
export function createDecisionRenderedEvent(
  decisionId: string,
  topActionId: string,
  topActionScore: number,
  intervalCount: number,
  constraintCount: number,
  lensId?: string
): Omit<DecisionRenderedEvent, "id" | "timestamp" | "sessionId"> {
  return {
    type: "decision_rendered",
    decisionId,
    topActionId,
    topActionScore,
    intervalCount,
    constraintCount,
    lensId,
  };
}

/**
 * Compute health score based on telemetry
 */
export function computeHealthScore(aggregate: TelemetryAggregate): number {
  // Higher is better (0-1 scale)
  let score = 1.0;

  // Penalize high churn
  score -= aggregate.voiChurnRate * 0.2;

  // Penalize high override rate
  score -= aggregate.userOverrideRate * 0.3;

  // Penalize low clarifier acceptance
  score -= (1 - aggregate.clarifierAcceptanceRate) * 0.1;

  // Penalize high regime change frequency
  score -= aggregate.regimeChangeFrequency * 0.2;

  // Penalize widening trend
  if (aggregate.intervalWidthDistribution.trend === "widening") {
    score -= 0.2;
  }

  return Math.max(0, Math.min(1, score));
}
