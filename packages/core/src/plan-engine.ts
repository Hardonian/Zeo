/**
 * Regret-Aware Planning Engine
 *
 * 1) Flip Distance - minimal variable change to alter recommended action
 * 2) Value of Information (VOI) - benefit_of_new_info / cost_of_acquisition
 * 3) Bounded Evidence Plan - 3-step, 5-step, budget-constrained
 * 4) Confidence Delta Modeling - current vs projected confidence
 *
 * Exposed via: `zeo plan --budget <x>`
 */

import type { DecisionSpec, DecisionResult, LensEvaluation } from "@zeo/contracts";
import { createRng, encodeCanonicalJson, sha256 } from "@zeo/kernel";

// ─── Flip Distance ────────────────────────────────────────────────────────

export interface FlipDistanceResult {
  assumptionId: string;
  assumptionText: string;
  flipDistance: number; // 0-1, lower = more sensitive
  currentConfidence: string;
  requiredShift: string;
}

/**
 * Compute flip distance: minimal variable change required to alter recommended action.
 * Returns ranked sensitivity list.
 */
export function computeFlipDistances(spec: DecisionSpec, result: DecisionResult): FlipDistanceResult[] {
  const robustness = result.evaluations.find(e => e.lens === "robustness");
  if (!robustness) return [];

  const distances: FlipDistanceResult[] = [];

  for (const assumption of spec.assumptions) {
    const isFlagged = robustness.fragileAssumptions.includes(assumption.id);
    const prob = assumption.probability;

    // Compute sensitivity as inverse of confidence range width
    let distance: number;
    if (prob) {
      const width = prob.high - prob.low;
      // Narrow intervals are more sensitive (small change flips)
      distance = width > 0 ? Math.min(1, width) : 0.1;
      if (isFlagged) distance *= 0.5; // Fragile assumptions are more sensitive
    } else {
      distance = isFlagged ? 0.3 : 0.7;
    }

    distances.push({
      assumptionId: assumption.id,
      assumptionText: assumption.text,
      flipDistance: Math.round(distance * 10000) / 10000,
      currentConfidence: assumption.confidence,
      requiredShift: prob
        ? `Shift probability outside [${(prob.low * 100).toFixed(0)}%, ${(prob.high * 100).toFixed(0)}%]`
        : `Change epistemic status from '${assumption.status}'`,
    });
  }

  // Sort by flip distance (most sensitive first)
  distances.sort((a, b) => a.flipDistance - b.flipDistance);
  return distances;
}

// ─── Value of Information ─────────────────────────────────────────────────

export interface VoiEstimate {
  evidencePrompt: string;
  rationale: string;
  benefitScore: number;    // 0-1
  costScore: number;       // 0-1 (lower = cheaper)
  voiScore: number;        // benefit / cost
  targetAssumptions: string[];
}

/**
 * Estimate VOI: benefit_of_new_info / cost_of_acquisition
 * Rank top evidence to collect next.
 */
export function estimateVoi(spec: DecisionSpec, result: DecisionResult): VoiEstimate[] {
  const flipDistances = computeFlipDistances(spec, result);
  const estimates: VoiEstimate[] = [];

  for (const evidence of result.nextBestEvidence) {
    // Match evidence to assumptions by keyword overlap
    const relatedAssumptions = flipDistances.filter(fd => {
      const eWords = new Set(evidence.prompt.toLowerCase().split(/\s+/));
      const aWords = fd.assumptionText.toLowerCase().split(/\s+/);
      return aWords.some(w => eWords.has(w) && w.length > 3);
    });

    // Benefit is inversely proportional to flip distance of related assumptions
    const avgFlipDistance = relatedAssumptions.length > 0
      ? relatedAssumptions.reduce((s, a) => s + a.flipDistance, 0) / relatedAssumptions.length
      : 0.5;
    const benefitScore = Math.max(0.1, 1 - avgFlipDistance);

    // Cost heuristic: longer prompts suggest more expensive evidence gathering
    const costScore = Math.max(0.1, Math.min(1, evidence.prompt.length / 200));

    const voiScore = costScore > 0 ? Math.round((benefitScore / costScore) * 10000) / 10000 : 0;

    estimates.push({
      evidencePrompt: evidence.prompt,
      rationale: evidence.rationale,
      benefitScore: Math.round(benefitScore * 10000) / 10000,
      costScore: Math.round(costScore * 10000) / 10000,
      voiScore,
      targetAssumptions: relatedAssumptions.map(a => a.assumptionId),
    });
  }

  // Sort by VOI score descending
  estimates.sort((a, b) => b.voiScore - a.voiScore);
  return estimates;
}

// ─── Bounded Evidence Plan ────────────────────────────────────────────────

export interface EvidencePlanStep {
  stepNumber: number;
  action: string;
  rationale: string;
  expectedConfidenceGain: number;
  estimatedCost: number;
  targetAssumptions: string[];
}

export interface BoundedEvidencePlan {
  planId: string;
  steps: EvidencePlanStep[];
  totalExpectedGain: number;
  totalEstimatedCost: number;
  regretMinimizingPath: boolean;
  budget: number;
}

/**
 * Generate bounded evidence plans (3-step, 5-step, budget-constrained)
 */
export function generateEvidencePlan(
  spec: DecisionSpec,
  result: DecisionResult,
  budget: number, // arbitrary cost units
): BoundedEvidencePlan {
  const voiEstimates = estimateVoi(spec, result);

  const steps: EvidencePlanStep[] = [];
  let remainingBudget = budget;
  let totalGain = 0;
  let totalCost = 0;
  let stepNum = 0;

  for (const estimate of voiEstimates) {
    const stepCost = Math.ceil(estimate.costScore * 10); // Scale to budget units
    if (stepCost > remainingBudget) continue;

    stepNum++;
    const gain = estimate.benefitScore * 0.2; // Each step can improve confidence by up to 20%

    steps.push({
      stepNumber: stepNum,
      action: estimate.evidencePrompt,
      rationale: estimate.rationale,
      expectedConfidenceGain: Math.round(gain * 10000) / 10000,
      estimatedCost: stepCost,
      targetAssumptions: estimate.targetAssumptions,
    });

    totalGain += gain;
    totalCost += stepCost;
    remainingBudget -= stepCost;
  }

  const planHash = sha256(encodeCanonicalJson({ spec: spec.id, budget, steps: steps.length }));

  return {
    planId: `plan_${planHash.slice(0, 12)}`,
    steps,
    totalExpectedGain: Math.round(totalGain * 10000) / 10000,
    totalEstimatedCost: totalCost,
    regretMinimizingPath: steps.length > 0 && steps[0].expectedConfidenceGain > 0.1,
    budget,
  };
}

// ─── Confidence Delta Modeling ────────────────────────────────────────────

export interface ConfidenceDeltaProjection {
  assumptionId: string;
  assumptionText: string;
  currentConfidence: number;
  projectedConfidence: number;
  delta: number;
  evidenceRequired: string;
}

/**
 * Show current vs projected confidence if evidence is collected
 */
export function projectConfidenceDeltas(
  spec: DecisionSpec,
  result: DecisionResult,
): ConfidenceDeltaProjection[] {
  const voiEstimates = estimateVoi(spec, result);
  const projections: ConfidenceDeltaProjection[] = [];

  for (const assumption of spec.assumptions) {
    const prob = assumption.probability;
    const currentConfidence = prob ? (prob.high + prob.low) / 2 : 0.5;

    // Find VOI estimates that target this assumption
    const relatedVoi = voiEstimates.filter(v => v.targetAssumptions.includes(assumption.id));
    const bestBenefit = relatedVoi.length > 0
      ? Math.max(...relatedVoi.map(v => v.benefitScore))
      : 0;

    const projectedConfidence = Math.min(1, currentConfidence + bestBenefit * 0.3);

    projections.push({
      assumptionId: assumption.id,
      assumptionText: assumption.text,
      currentConfidence: Math.round(currentConfidence * 10000) / 10000,
      projectedConfidence: Math.round(projectedConfidence * 10000) / 10000,
      delta: Math.round((projectedConfidence - currentConfidence) * 10000) / 10000,
      evidenceRequired: relatedVoi.length > 0
        ? relatedVoi[0].evidencePrompt
        : "No specific evidence action identified",
    });
  }

  // Sort by delta (highest improvement first)
  projections.sort((a, b) => b.delta - a.delta);
  return projections;
}

// ─── Formatting ───────────────────────────────────────────────────────────

export function formatFlipDistances(distances: FlipDistanceResult[]): string {
  const lines: string[] = [];
  lines.push("Flip Distance Analysis (Sensitivity Ranking):");
  lines.push("");

  for (const d of distances) {
    lines.push(`  [${(d.flipDistance * 100).toFixed(1)}%] ${d.assumptionText}`);
    lines.push(`    ID: ${d.assumptionId} | Confidence: ${d.currentConfidence}`);
    lines.push(`    Required: ${d.requiredShift}`);
    lines.push("");
  }

  return lines.join("\n");
}

export function formatEvidencePlan(plan: BoundedEvidencePlan): string {
  const lines: string[] = [];
  lines.push(`Evidence Plan: ${plan.planId}`);
  lines.push(`Budget: ${plan.budget} | Steps: ${plan.steps.length}`);
  lines.push(`Expected Confidence Gain: +${(plan.totalExpectedGain * 100).toFixed(1)}%`);
  lines.push(`Estimated Cost: ${plan.totalEstimatedCost}/${plan.budget}`);
  lines.push(`Regret-minimizing: ${plan.regretMinimizingPath ? "yes" : "no"}`);
  lines.push("");

  for (const step of plan.steps) {
    lines.push(`  Step ${step.stepNumber}: ${step.action}`);
    lines.push(`    Rationale: ${step.rationale}`);
    lines.push(`    Expected gain: +${(step.expectedConfidenceGain * 100).toFixed(1)}% | Cost: ${step.estimatedCost}`);
    lines.push("");
  }

  return lines.join("\n");
}

export function formatConfidenceDeltas(projections: ConfidenceDeltaProjection[]): string {
  const lines: string[] = [];
  lines.push("Confidence Delta Projections:");
  lines.push("");

  for (const p of projections) {
    const arrow = p.delta > 0 ? "+" : "";
    lines.push(`  ${p.assumptionText}`);
    lines.push(`    Current: ${(p.currentConfidence * 100).toFixed(1)}% -> Projected: ${(p.projectedConfidence * 100).toFixed(1)}% (${arrow}${(p.delta * 100).toFixed(1)}%)`);
    lines.push(`    Evidence: ${p.evidenceRequired}`);
    lines.push("");
  }

  return lines.join("\n");
}
