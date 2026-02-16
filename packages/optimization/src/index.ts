/**
 * @zeo/optimization — Closed-Loop Optimization
 *
 * Phase G of Zeo v3: Outcome feedback without autonomous drift.
 *
 * Provides:
 * 1. Outcome Registration — `zeo outcome register` with actual_outcome, observed_utility
 * 2. Regret Computation — compare selected vs. best-possible action utility
 * 3. Assumption Tuner — propose assumption adjustments based on accumulated outcomes
 * 4. Feedback Loop — human-approved adjustments only (no autonomous drift)
 */

import { createHash } from "node:crypto";
import { nanoid } from "nanoid";

// =============================================================================
// TYPES
// =============================================================================

export interface OutcomeRecord {
  id: string;
  decisionId: string;
  tenantId?: string;
  selectedAction: string;
  actualOutcome: string;
  observedUtility: number;
  predictedUtility: number;
  timestamp: string;
  metadata: Record<string, unknown>;
  registeredBy: string;
}

export interface RegretAnalysis {
  decisionId: string;
  selectedAction: string;
  selectedUtility: number;
  bestPossibleAction: string;
  bestPossibleUtility: number;
  regret: number;
  regretPercentage: number;
  category: "optimal" | "acceptable" | "suboptimal" | "poor";
}

export interface AssumptionAdjustment {
  id: string;
  assumptionId: string;
  label: string;
  currentValue: number;
  proposedValue: number;
  confidence: number;
  basedOnOutcomes: string[];
  status: "proposed" | "approved" | "rejected" | "applied";
  proposedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rationale: string;
}

export interface OptimizationSummary {
  tenantId?: string;
  totalOutcomes: number;
  averageRegret: number;
  optimalPercentage: number;
  pendingAdjustments: number;
  approvedAdjustments: number;
  rejectedAdjustments: number;
  trending: "improving" | "stable" | "degrading";
}

// =============================================================================
// OUTCOME STORE
// =============================================================================

export class OutcomeStore {
  private outcomes: OutcomeRecord[] = [];

  register(
    decisionId: string,
    selectedAction: string,
    actualOutcome: string,
    observedUtility: number,
    predictedUtility: number,
    registeredBy: string,
    options?: {
      tenantId?: string;
      metadata?: Record<string, unknown>;
    }
  ): OutcomeRecord {
    const record: OutcomeRecord = {
      id: `outcome_${nanoid(12)}`,
      decisionId,
      tenantId: options?.tenantId,
      selectedAction,
      actualOutcome,
      observedUtility,
      predictedUtility,
      timestamp: new Date().toISOString(),
      metadata: options?.metadata ?? {},
      registeredBy,
    };
    this.outcomes.push(record);
    return record;
  }

  getByDecision(decisionId: string): OutcomeRecord[] {
    return this.outcomes.filter((o) => o.decisionId === decisionId);
  }

  getByTenant(tenantId: string): OutcomeRecord[] {
    return this.outcomes.filter((o) => o.tenantId === tenantId);
  }

  getAll(): OutcomeRecord[] {
    return [...this.outcomes];
  }

  size(): number {
    return this.outcomes.length;
  }
}

// =============================================================================
// REGRET COMPUTATION
// =============================================================================

/**
 * Compute regret: difference between selected action utility and best-possible utility.
 * No randomness — pure arithmetic based on observed data.
 */
export function computeRegret(
  outcome: OutcomeRecord,
  alternativeOutcomes: Array<{ action: string; utility: number }>
): RegretAnalysis {
  const allActions = [
    { action: outcome.selectedAction, utility: outcome.observedUtility },
    ...alternativeOutcomes,
  ];

  // Find best possible action
  let best = allActions[0];
  for (const a of allActions) {
    if (a.utility > best.utility) {
      best = a;
    }
  }

  const regret = Math.max(0, best.utility - outcome.observedUtility);
  const regretPct = best.utility !== 0 ? (regret / Math.abs(best.utility)) * 100 : 0;

  let category: RegretAnalysis["category"];
  if (regretPct <= 1) category = "optimal";
  else if (regretPct <= 10) category = "acceptable";
  else if (regretPct <= 30) category = "suboptimal";
  else category = "poor";

  return {
    decisionId: outcome.decisionId,
    selectedAction: outcome.selectedAction,
    selectedUtility: outcome.observedUtility,
    bestPossibleAction: best.action,
    bestPossibleUtility: best.utility,
    regret,
    regretPercentage: Math.round(regretPct * 10) / 10,
    category,
  };
}

/**
 * Compute average regret across multiple outcomes.
 */
export function computeAverageRegret(analyses: RegretAnalysis[]): number {
  if (analyses.length === 0) return 0;
  const sum = analyses.reduce((acc, a) => acc + a.regret, 0);
  return sum / analyses.length;
}

// =============================================================================
// ASSUMPTION TUNER
// =============================================================================

export class AssumptionTuner {
  private adjustments: AssumptionAdjustment[] = [];

  /**
   * Propose an assumption adjustment based on observed outcomes.
   * This is PROPOSED only — requires human approval.
   */
  propose(
    assumptionId: string,
    label: string,
    currentValue: number,
    proposedValue: number,
    confidence: number,
    basedOnOutcomes: string[],
    rationale: string
  ): AssumptionAdjustment {
    const adj: AssumptionAdjustment = {
      id: `adj_${nanoid(12)}`,
      assumptionId,
      label,
      currentValue,
      proposedValue,
      confidence,
      basedOnOutcomes,
      status: "proposed",
      proposedAt: new Date().toISOString(),
      rationale,
    };
    this.adjustments.push(adj);
    return adj;
  }

  /**
   * Approve an adjustment. This is the human-in-the-loop gate.
   */
  approve(adjustmentId: string, reviewedBy: string): AssumptionAdjustment | null {
    const adj = this.adjustments.find((a) => a.id === adjustmentId);
    if (!adj || adj.status !== "proposed") return null;
    adj.status = "approved";
    adj.reviewedAt = new Date().toISOString();
    adj.reviewedBy = reviewedBy;
    return adj;
  }

  /**
   * Reject an adjustment.
   */
  reject(adjustmentId: string, reviewedBy: string): AssumptionAdjustment | null {
    const adj = this.adjustments.find((a) => a.id === adjustmentId);
    if (!adj || adj.status !== "proposed") return null;
    adj.status = "rejected";
    adj.reviewedAt = new Date().toISOString();
    adj.reviewedBy = reviewedBy;
    return adj;
  }

  /**
   * Mark an approved adjustment as applied.
   */
  markApplied(adjustmentId: string): boolean {
    const adj = this.adjustments.find((a) => a.id === adjustmentId);
    if (!adj || adj.status !== "approved") return false;
    adj.status = "applied";
    return true;
  }

  getPending(): AssumptionAdjustment[] {
    return this.adjustments.filter((a) => a.status === "proposed");
  }

  getApproved(): AssumptionAdjustment[] {
    return this.adjustments.filter((a) => a.status === "approved");
  }

  getAll(): AssumptionAdjustment[] {
    return [...this.adjustments];
  }
}

// =============================================================================
// OPTIMIZATION SUMMARY
// =============================================================================

/**
 * Generate optimization summary from outcome and adjustment data.
 * Detects trends based on recent regret values.
 */
export function generateOptimizationSummary(
  outcomes: OutcomeRecord[],
  regretAnalyses: RegretAnalysis[],
  adjustments: AssumptionAdjustment[],
  tenantId?: string
): OptimizationSummary {
  const avgRegret = computeAverageRegret(regretAnalyses);
  const optimalCount = regretAnalyses.filter((a) => a.category === "optimal").length;
  const optimalPct = regretAnalyses.length > 0
    ? (optimalCount / regretAnalyses.length) * 100
    : 0;

  // Trend detection from recent regret values
  const recentRegrets = regretAnalyses.slice(-10).map((a) => a.regret);
  let trending: OptimizationSummary["trending"] = "stable";
  if (recentRegrets.length >= 5) {
    const firstHalf = recentRegrets.slice(0, Math.floor(recentRegrets.length / 2));
    const secondHalf = recentRegrets.slice(Math.floor(recentRegrets.length / 2));
    const firstAvg = firstHalf.reduce((s, v) => s + v, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((s, v) => s + v, 0) / secondHalf.length;
    if (secondAvg < firstAvg * 0.85) trending = "improving";
    else if (secondAvg > firstAvg * 1.15) trending = "degrading";
  }

  return {
    tenantId,
    totalOutcomes: outcomes.length,
    averageRegret: Math.round(avgRegret * 100) / 100,
    optimalPercentage: Math.round(optimalPct * 10) / 10,
    pendingAdjustments: adjustments.filter((a) => a.status === "proposed").length,
    approvedAdjustments: adjustments.filter((a) => a.status === "approved" || a.status === "applied").length,
    rejectedAdjustments: adjustments.filter((a) => a.status === "rejected").length,
    trending,
  };
}

// =============================================================================
// FORMATTING
// =============================================================================

export function formatRegret(analysis: RegretAnalysis): string {
  const icon = analysis.category === "optimal" ? "✓" :
    analysis.category === "acceptable" ? "~" :
    analysis.category === "suboptimal" ? "⚠" : "✗";
  const lines: string[] = [
    `=== Regret Analysis: ${analysis.decisionId} ===`,
    `Selected: ${analysis.selectedAction} (utility: ${analysis.selectedUtility.toFixed(3)})`,
    `Best:     ${analysis.bestPossibleAction} (utility: ${analysis.bestPossibleUtility.toFixed(3)})`,
    `Regret:   ${analysis.regret.toFixed(3)} (${analysis.regretPercentage}%)`,
    `Category: ${icon} ${analysis.category.toUpperCase()}`,
  ];
  return lines.join("\n");
}

export function formatOptimizationSummary(summary: OptimizationSummary): string {
  const trendIcon = summary.trending === "improving" ? "📈" :
    summary.trending === "degrading" ? "📉" : "➡";
  const lines: string[] = [
    `=== Optimization Summary ===`,
    summary.tenantId ? `Tenant:       ${summary.tenantId}` : "",
    `Total Outcomes: ${summary.totalOutcomes}`,
    `Avg Regret:     ${summary.averageRegret}`,
    `Optimal Rate:   ${summary.optimalPercentage}%`,
    `Pending Adj:    ${summary.pendingAdjustments}`,
    `Approved Adj:   ${summary.approvedAdjustments}`,
    `Rejected Adj:   ${summary.rejectedAdjustments}`,
    `Trend:          ${trendIcon} ${summary.trending}`,
  ].filter(Boolean);
  return lines.join("\n");
}

export function formatAdjustments(adjustments: AssumptionAdjustment[]): string {
  if (adjustments.length === 0) return "No adjustments.";
  const lines: string[] = [`=== Assumption Adjustments (${adjustments.length}) ===`];
  for (const adj of adjustments) {
    const icon = adj.status === "approved" ? "✓" :
      adj.status === "rejected" ? "✗" :
      adj.status === "applied" ? "✓✓" : "?";
    lines.push(
      `  ${icon} [${adj.status}] ${adj.label}: ${adj.currentValue} → ${adj.proposedValue} ` +
      `(conf: ${adj.confidence.toFixed(2)}) — ${adj.rationale}`
    );
  }
  return lines.join("\n");
}

// =============================================================================
// SINGLETONS
// =============================================================================

export const outcomeStore = new OutcomeStore();
export const assumptionTuner = new AssumptionTuner();
