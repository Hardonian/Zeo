/**
 * @zeo/simulation — Simulation + Forecast Layer
 *
 * Phase F of Zeo v3: Extend planning into predictive analysis without randomness.
 *
 * Provides:
 * 1. What-If Engine — run decision with modified assumptions, deterministic sweep
 * 2. Forecast Projections — confidence delta over time with seeded scenarios
 * 3. Confidence Tracking — per-decision confidence evolution with provenance
 * 4. Sensitivity Analysis — identify which assumptions most affect outcomes
 */

import { createHash } from "node:crypto";
import { nanoid } from "nanoid";

// =============================================================================
// TYPES
// =============================================================================

export interface WhatIfScenario {
  id: string;
  name: string;
  baseDecisionId: string;
  modifiedAssumptions: Array<{
    assumptionId: string;
    originalValue: number;
    modifiedValue: number;
  }>;
  modifiedConstraints?: Array<{
    constraintId: string;
    originalValue: unknown;
    modifiedValue: unknown;
  }>;
  createdAt: string;
  tenantId?: string;
}

export interface WhatIfResult {
  scenarioId: string;
  baseDecisionId: string;
  baseOutcome: SimulationOutcome;
  modifiedOutcome: SimulationOutcome;
  delta: OutcomeDelta;
  deterministic: boolean;
  seed: string;
  computeHash: string;
}

export interface SimulationOutcome {
  selectedAction: string;
  confidence: number;
  expectedUtility: number;
  risk: number;
  robustness: number;
}

export interface OutcomeDelta {
  confidenceDelta: number;
  utilityDelta: number;
  riskDelta: number;
  robustnessDelta: number;
  actionChanged: boolean;
  significanceScore: number;
}

export interface ForecastProjection {
  id: string;
  decisionId: string;
  timeHorizon: number; // days
  projections: Array<{
    timestamp: string;
    confidence: number;
    utility: number;
    assumptions: Record<string, number>;
  }>;
  seed: string;
  deterministic: boolean;
}

export interface ConfidenceTracker {
  decisionId: string;
  history: ConfidenceSnapshot[];
  trend: "improving" | "stable" | "degrading";
  currentConfidence: number;
}

export interface ConfidenceSnapshot {
  timestamp: string;
  confidence: number;
  cause: string;
  evidenceId?: string;
}

export interface SensitivityEntry {
  assumptionId: string;
  label: string;
  impactScore: number;
  direction: "positive" | "negative" | "mixed";
  flipDistance: number;
}

// =============================================================================
// DETERMINISTIC SEEDED RNG (for simulation only — no Math.random())
// =============================================================================

function seededRng(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
  }
  return () => {
    h = (h * 1664525 + 1013904223) | 0;
    return ((h >>> 0) / 4294967296);
  };
}

// =============================================================================
// WHAT-IF ENGINE
// =============================================================================

export class WhatIfEngine {
  private scenarios = new Map<string, WhatIfScenario>();
  private results = new Map<string, WhatIfResult>();

  createScenario(
    name: string,
    baseDecisionId: string,
    modifiedAssumptions: WhatIfScenario["modifiedAssumptions"],
    options?: {
      modifiedConstraints?: WhatIfScenario["modifiedConstraints"];
      tenantId?: string;
    }
  ): WhatIfScenario {
    const scenario: WhatIfScenario = {
      id: `sim_${nanoid(12)}`,
      name,
      baseDecisionId,
      modifiedAssumptions,
      modifiedConstraints: options?.modifiedConstraints,
      createdAt: new Date().toISOString(),
      tenantId: options?.tenantId,
    };
    this.scenarios.set(scenario.id, scenario);
    return scenario;
  }

  /**
   * Run a what-if simulation deterministically.
   * Takes a runner function that executes the decision with modified assumptions.
   */
  simulate(
    scenarioId: string,
    runner: (assumptions: Record<string, number>) => SimulationOutcome,
    baseRunner: () => SimulationOutcome,
    seed?: string
  ): WhatIfResult {
    const scenario = this.scenarios.get(scenarioId);
    if (!scenario) {
      throw new Error(`Scenario not found: ${scenarioId}`);
    }

    const simSeed = seed ?? `sim-${scenario.id}-${scenario.baseDecisionId}`;

    // Run base case
    const baseOutcome = baseRunner();

    // Build modified assumptions map
    const modifiedMap: Record<string, number> = {};
    for (const mod of scenario.modifiedAssumptions) {
      modifiedMap[mod.assumptionId] = mod.modifiedValue;
    }

    // Run modified case
    const modifiedOutcome = runner(modifiedMap);

    // Compute delta
    const delta: OutcomeDelta = {
      confidenceDelta: modifiedOutcome.confidence - baseOutcome.confidence,
      utilityDelta: modifiedOutcome.expectedUtility - baseOutcome.expectedUtility,
      riskDelta: modifiedOutcome.risk - baseOutcome.risk,
      robustnessDelta: modifiedOutcome.robustness - baseOutcome.robustness,
      actionChanged: modifiedOutcome.selectedAction !== baseOutcome.selectedAction,
      significanceScore: Math.abs(modifiedOutcome.confidence - baseOutcome.confidence) +
        Math.abs(modifiedOutcome.expectedUtility - baseOutcome.expectedUtility) * 0.5 +
        (modifiedOutcome.selectedAction !== baseOutcome.selectedAction ? 1 : 0),
    };

    // Compute integrity hash
    const computeHash = createHash("sha256")
      .update(
        JSON.stringify({
          scenarioId,
          seed: simSeed,
          baseOutcome,
          modifiedOutcome,
        })
      )
      .digest("hex")
      .slice(0, 32);

    const result: WhatIfResult = {
      scenarioId,
      baseDecisionId: scenario.baseDecisionId,
      baseOutcome,
      modifiedOutcome,
      delta,
      deterministic: true,
      seed: simSeed,
      computeHash,
    };

    this.results.set(scenarioId, result);
    return result;
  }

  getScenario(scenarioId: string): WhatIfScenario | null {
    return this.scenarios.get(scenarioId) ?? null;
  }

  getResult(scenarioId: string): WhatIfResult | null {
    return this.results.get(scenarioId) ?? null;
  }

  listScenarios(baseDecisionId?: string): WhatIfScenario[] {
    let all = Array.from(this.scenarios.values());
    if (baseDecisionId) {
      all = all.filter((s) => s.baseDecisionId === baseDecisionId);
    }
    return all;
  }
}

// =============================================================================
// FORECAST ENGINE
// =============================================================================

export class ForecastEngine {
  /**
   * Generate a deterministic forecast projection.
   */
  project(
    decisionId: string,
    currentOutcome: SimulationOutcome,
    assumptions: Record<string, number>,
    timeHorizonDays: number,
    seed: string
  ): ForecastProjection {
    const rng = seededRng(seed);
    const projections: ForecastProjection["projections"] = [];

    let currentConfidence = currentOutcome.confidence;
    let currentUtility = currentOutcome.expectedUtility;
    const currentAssumptions = { ...assumptions };

    for (let day = 1; day <= timeHorizonDays; day++) {
      // Deterministic perturbation based on seed
      const decay = 1 - (day / timeHorizonDays) * 0.1; // gradual confidence decay
      const perturbation = (rng() - 0.5) * 0.02;

      currentConfidence = Math.max(0, Math.min(1, currentConfidence * decay + perturbation));
      currentUtility = currentUtility * (1 + perturbation * 0.5);

      // Perturb assumptions deterministically
      for (const key of Object.keys(currentAssumptions)) {
        currentAssumptions[key] *= (1 + (rng() - 0.5) * 0.01);
      }

      projections.push({
        timestamp: new Date(Date.now() + day * 86400_000).toISOString(),
        confidence: Math.round(currentConfidence * 1000) / 1000,
        utility: Math.round(currentUtility * 100) / 100,
        assumptions: { ...currentAssumptions },
      });
    }

    return {
      id: `forecast_${nanoid(12)}`,
      decisionId,
      timeHorizon: timeHorizonDays,
      projections,
      seed,
      deterministic: true,
    };
  }
}

// =============================================================================
// CONFIDENCE TRACKER
// =============================================================================

export class ConfidenceTrackerStore {
  private trackers = new Map<string, ConfidenceTracker>();

  getOrCreate(decisionId: string, initialConfidence = 0.5): ConfidenceTracker {
    let tracker = this.trackers.get(decisionId);
    if (!tracker) {
      tracker = {
        decisionId,
        history: [
          {
            timestamp: new Date().toISOString(),
            confidence: initialConfidence,
            cause: "initial",
          },
        ],
        trend: "stable",
        currentConfidence: initialConfidence,
      };
      this.trackers.set(decisionId, tracker);
    }
    return tracker;
  }

  recordConfidence(
    decisionId: string,
    confidence: number,
    cause: string,
    evidenceId?: string
  ): void {
    const tracker = this.getOrCreate(decisionId);
    tracker.history.push({
      timestamp: new Date().toISOString(),
      confidence,
      cause,
      evidenceId,
    });
    tracker.currentConfidence = confidence;

    // Compute trend from last 5 entries
    const recent = tracker.history.slice(-5);
    if (recent.length >= 3) {
      const firstConf = recent[0].confidence;
      const lastConf = recent[recent.length - 1].confidence;
      const delta = lastConf - firstConf;
      tracker.trend = delta > 0.05 ? "improving" : delta < -0.05 ? "degrading" : "stable";
    }
  }

  get(decisionId: string): ConfidenceTracker | null {
    return this.trackers.get(decisionId) ?? null;
  }

  listAll(): ConfidenceTracker[] {
    return Array.from(this.trackers.values());
  }
}

// =============================================================================
// SENSITIVITY ANALYSIS
// =============================================================================

/**
 * Compute sensitivity of each assumption on the final outcome.
 * All computations are deterministic — no randomness.
 */
export function computeSensitivity(
  assumptions: Array<{ id: string; label: string; value: number }>,
  evaluator: (modified: Record<string, number>) => SimulationOutcome,
  baseOutcome: SimulationOutcome,
  perturbationFactor = 0.1
): SensitivityEntry[] {
  const entries: SensitivityEntry[] = [];

  for (const assumption of assumptions) {
    // Perturb up
    const upMap: Record<string, number> = {};
    for (const a of assumptions) {
      upMap[a.id] = a.id === assumption.id ? a.value * (1 + perturbationFactor) : a.value;
    }
    const upOutcome = evaluator(upMap);

    // Perturb down
    const downMap: Record<string, number> = {};
    for (const a of assumptions) {
      downMap[a.id] = a.id === assumption.id ? a.value * (1 - perturbationFactor) : a.value;
    }
    const downOutcome = evaluator(downMap);

    const upDelta = upOutcome.confidence - baseOutcome.confidence;
    const downDelta = downOutcome.confidence - baseOutcome.confidence;
    const impactScore = (Math.abs(upDelta) + Math.abs(downDelta)) / 2;

    const direction: SensitivityEntry["direction"] =
      upDelta > 0 && downDelta < 0 ? "positive" :
      upDelta < 0 && downDelta > 0 ? "negative" : "mixed";

    // Flip distance: how much would this assumption need to change to flip the decision?
    const flipDistance = impactScore > 0 ? (1 - baseOutcome.confidence) / impactScore : Infinity;

    entries.push({
      assumptionId: assumption.id,
      label: assumption.label,
      impactScore: Math.round(impactScore * 1000) / 1000,
      direction,
      flipDistance: Math.round(flipDistance * 100) / 100,
    });
  }

  // Sort by impact (highest first)
  entries.sort((a, b) => b.impactScore - a.impactScore);

  return entries;
}

// =============================================================================
// FORMATTING
// =============================================================================

export function formatWhatIfResult(result: WhatIfResult): string {
  const d = result.delta;
  const changed = d.actionChanged ? "ACTION CHANGED" : "same action";
  const lines: string[] = [
    `=== What-If Result: ${result.scenarioId} ===`,
    `Base:     ${result.baseOutcome.selectedAction} (conf: ${result.baseOutcome.confidence.toFixed(3)})`,
    `Modified: ${result.modifiedOutcome.selectedAction} (conf: ${result.modifiedOutcome.confidence.toFixed(3)})`,
    `Delta:    confidence ${d.confidenceDelta > 0 ? "+" : ""}${d.confidenceDelta.toFixed(3)}, ` +
    `utility ${d.utilityDelta > 0 ? "+" : ""}${d.utilityDelta.toFixed(3)} — ${changed}`,
    `Significance: ${d.significanceScore.toFixed(3)}`,
    `Seed:     ${result.seed}`,
    `Hash:     ${result.computeHash.slice(0, 16)}`,
  ];
  return lines.join("\n");
}

export function formatSensitivity(entries: SensitivityEntry[]): string {
  if (entries.length === 0) return "No sensitivity data.";
  const lines: string[] = [`=== Sensitivity Analysis ===`];
  for (const e of entries) {
    const dir = e.direction === "positive" ? "↑" : e.direction === "negative" ? "↓" : "↕";
    const flip = e.flipDistance === Infinity ? "∞" : e.flipDistance.toFixed(1);
    lines.push(
      `  ${dir} ${e.label} (${e.assumptionId}): impact=${e.impactScore.toFixed(3)}, flip=${flip}`
    );
  }
  return lines.join("\n");
}

export function formatForecast(proj: ForecastProjection): string {
  const lines: string[] = [
    `=== Forecast: ${proj.id} ===`,
    `Decision: ${proj.decisionId}`,
    `Horizon:  ${proj.timeHorizon} days`,
    `Seed:     ${proj.seed}`,
    ``,
  ];

  const step = Math.max(1, Math.floor(proj.projections.length / 10));
  for (let i = 0; i < proj.projections.length; i += step) {
    const p = proj.projections[i];
    lines.push(`  Day ${i + 1}: conf=${p.confidence.toFixed(3)} util=${p.utility.toFixed(2)}`);
  }

  return lines.join("\n");
}

export function formatConfidenceTracker(tracker: ConfidenceTracker): string {
  const icon = tracker.trend === "improving" ? "📈" : tracker.trend === "degrading" ? "📉" : "➡";
  const lines: string[] = [
    `=== Confidence: ${tracker.decisionId} ===`,
    `Current: ${tracker.currentConfidence.toFixed(3)} ${icon} (${tracker.trend})`,
    `History (${tracker.history.length} entries):`,
  ];

  for (const h of tracker.history.slice(-10)) {
    lines.push(`  ${h.timestamp}: ${h.confidence.toFixed(3)} — ${h.cause}`);
  }

  return lines.join("\n");
}

// =============================================================================
// SINGLETONS
// =============================================================================

export const whatIfEngine = new WhatIfEngine();
export const forecastEngine = new ForecastEngine();
export const confidenceStore = new ConfidenceTrackerStore();
