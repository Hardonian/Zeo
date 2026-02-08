import type {
  WorldModelSpec,
  EvidenceCandidate,
  PosteriorState,
  VoiReport,
} from "@zeo/contracts";
import type { RegimeState } from "@zeo/regimes";
import { SeededRandom, inferPosterior } from "./world-model.js";

/**
 * Compute uncertainty proxy for a band interval.
 * Entropy proxy = width of the interval.
 */
export function bandUncertainty(band: { low: number; high: number }): number {
  return band.high - band.low;
}

/**
 * Compute aggregate uncertainty across all variables.
 * Weighted sum of interval widths.
 */
export function aggregateUncertainty(
  posterior: PosteriorState,
  variableWeights: Record<string, number> = {}
): number {
  return posterior.variables.reduce((total, v) => {
    const width = bandUncertainty(v.posteriorBand);
    const weight = variableWeights[v.variableId] ?? 1;
    return total + width * weight;
  }, 0);
}

/**
 * Simulate an observation outcome for VOI analysis.
 */
function simulateObservationOutcome(
  candidate: EvidenceCandidate,
  rng: SeededRandom
): { low: number; high: number; strength: number } {
  // Draw from reliability band
  const reliability = rng.uniform(
    candidate.reliabilityBand.low,
    candidate.reliabilityBand.high,
    1
  )[0];

  // Simulate value band - evidence tends toward extremes if reliable
  const center = rng.next() > 0.5 ? 0.7 : 0.3; // Bias toward informative values
  const width = (1 - reliability) * 0.5; // Higher reliability = narrower band

  return {
    low: Math.max(0, center - width / 2),
    high: Math.min(1, center + width / 2),
    strength: reliability,
  };
}

/**
 * Convert an evidence candidate to a synthetic observation.
 */
function candidateToObservation(
  candidate: EvidenceCandidate,
  outcome: { low: number; high: number; strength: number }
): import("@zeo/contracts").SignalObservation {
  return {
    observationId: `sim_${candidate.id}`,
    signalId: `evidence:${candidate.kind}`,
    t: new Date().toISOString(),
    valueBand: { low: outcome.low, high: outcome.high },
    weightApplied: outcome.strength,
    qualityScore: outcome.strength,
    biasAdjustmentsApplied: [],
    provenance: candidate.provenancePlan.wouldHavePointer
      ? [{
          kind: "text",
          sourceId: candidate.provenancePlan.sourceKinds[0] ?? "unknown",
          offset: 0,
          length: 100,
          capturedAt: new Date().toISOString(),
          checksum: "simulated",
        }]
      : [],
    sourceId: candidate.provenancePlan.sourceKinds[0] ?? "simulated",
    rawRef: { kind: "evidence_candidate", id: candidate.id },
  };
}

/**
 * Compute cognitive load penalty in time-equivalent minutes.
 */
function cognitiveLoadPenalty(load: "low" | "medium" | "high" | undefined): number {
  switch (load) {
    case "low": return 5;
    case "medium": return 15;
    case "high": return 45;
    default: return 10;
  }
}

/**
 * Compute total cost in time-equivalent units (minutes).
 */
function computeTotalCost(candidate: EvidenceCandidate): number {
  const timeCost = candidate.expectedCost.timeMinutes ?? 30;
  const moneyCost = (candidate.expectedCost.moneyUsd ?? 0) / 100; // Convert $ to ~minutes at $100/hr
  const cognitiveCost = cognitiveLoadPenalty(candidate.expectedCost.cognitiveLoad);
  return timeCost + moneyCost + cognitiveCost;
}

/**
 * Estimate flip relevance: how likely is this evidence to change action rankings?
 */
function estimateFlipRelevance(
  candidate: EvidenceCandidate,
  posterior: PosteriorState
): "low" | "medium" | "high" {
  // High relevance if:
  // 1. Targets high-uncertainty variables
  // 2. Has high reliability
  // 3. Would provide pointer (better provenance)

  let score = 0;

  for (const varId of candidate.targetVariableIds) {
    const variable = posterior.variables.find(v => v.variableId === varId);
    if (variable) {
      const width = bandUncertainty(variable.posteriorBand);
      score += width; // Higher uncertainty = more potential to flip
    }
  }

  score += candidate.reliabilityBand.high; // Higher reliability = more trustworthy

  if (candidate.provenancePlan.wouldHavePointer) {
    score += 0.3; // Having provenance is valuable
  }

  if (score > 1.2) return "high";
  if (score > 0.6) return "medium";
  return "low";
}

/**
 * Compute VOI (Value of Information) for evidence candidates.
 * Ranks candidates by expected reduction in decision uncertainty.
 */
export function computeVoi(
  worldSpec: WorldModelSpec,
  posterior: PosteriorState,
  candidates: EvidenceCandidate[],
  seed: string,
  options: {
    numSimulations?: number;
    variableWeights?: Record<string, number>;
  } = {}
): VoiReport {
  const rng = new SeededRandom(seed);
  const numSimulations = options.numSimulations ?? 50;
  const variableWeights = options.variableWeights ?? {};

  // Baseline uncertainty
  const baselineUncertainty = aggregateUncertainty(posterior, variableWeights);

  const candidateResults = candidates.map(candidate => {
    // Simulate K possible outcomes
    const uncertainties: number[] = [];

    for (let i = 0; i < numSimulations; i++) {
      // Simulate observation outcome
      const outcome = simulateObservationOutcome(candidate, rng);
      const syntheticObservation = candidateToObservation(candidate, outcome);

      // Create modified world spec with synthetic observation model
      const modifiedSpec: WorldModelSpec = {
        ...worldSpec,
        observationModels: [
          ...worldSpec.observationModels,
          {
            id: `sim_model_${candidate.id}`,
            label: `Simulated model for ${candidate.label}`,
            targetVariableIds: candidate.targetVariableIds,
            effect: "narrow",
            strength: outcome.strength,
            minQualityThreshold: 0,
            provenancePattern: `evidence:${candidate.kind}`,
          },
        ],
      };

      // Infer posterior with this observation
      const simSeed = `${seed}_sim_${candidate.id}_${i}`;
      const simPosterior = inferPosterior(
        modifiedSpec,
        [syntheticObservation],
        simSeed
      );

      const simUncertainty = aggregateUncertainty(simPosterior, variableWeights);
      uncertainties.push(simUncertainty);
    }

    // Expected gain = baseline - mean(new uncertainty)
    const meanUncertainty = uncertainties.reduce((a, b) => a + b, 0) / uncertainties.length;
    const expectedGain = Math.max(0, baselineUncertainty - meanUncertainty);

    // Cost-adjusted score
    const totalCost = computeTotalCost(candidate);
    const costAdjustedScore = totalCost > 0 ? expectedGain / totalCost : expectedGain;

    // Flip relevance estimate
    const flipRelevance = estimateFlipRelevance(candidate, posterior);

    return {
      candidateId: candidate.id,
      expectedGain,
      costAdjustedScore,
      targetVariables: candidate.targetVariableIds,
      flipRelevanceEstimate: flipRelevance,
    };
  });

  // Sort by cost-adjusted score (descending)
  candidateResults.sort((a, b) => b.costAdjustedScore - a.costAdjustedScore);

  return {
    baselineUncertainty,
    candidates: candidateResults,
    seed,
    computationTimestamp: new Date().toISOString(),
  };
}

export interface RegimeAwareVoiOptions {
  numSimulations?: number;
  variableWeights?: Record<string, number>;
  currentRegime?: RegimeState | null;
}

export interface RegimeAwareVoiCandidate {
  candidateId: string;
  expectedGain: number;
  costAdjustedScore: number;
  targetVariables: string[];
  flipRelevanceEstimate: "low" | "medium" | "high";
  regimeDisambiguationPotential: number;
  wouldNarrowConfidenceBand: boolean;
}

export interface RegimeAwareVoiReport {
  baselineUncertainty: number;
  candidates: ReturnType<typeof computeVoi>["candidates"];
  seed: string;
  computationTimestamp: string;
  currentRegime?: RegimeState | null;
  regimeAwareCandidates: RegimeAwareVoiCandidate[];
}

export function regimeAwareScoreMultiplier(regime: RegimeState | null | undefined): number {
  if (!regime) return 1.0;

  switch (regime.currentLabel) {
    case "transition":
      return 2.0;
    case "volatile":
      return 1.5;
    case "stable":
    default:
      return 1.0;
  }
}

export function estimateRegimeDisambiguationPotential(
  candidate: EvidenceCandidate,
  posterior: PosteriorState,
  regime: RegimeState | null | undefined
): number {
  if (!regime) return 0;

  let potential = 0;

  if (regime.currentLabel === "transition") {
    potential = 0.8;
  } else if (regime.currentLabel === "volatile") {
    potential = 0.5;
  } else {
    potential = 0.2;
  }

  if (candidate.reliabilityBand.high > 0.8) {
    potential *= 1.3;
  }

  if (candidate.provenancePlan.wouldHavePointer) {
    potential *= 1.1;
  }

  return Math.min(potential, 1.0);
}

export function wouldNarrowConfidenceBand(
  candidate: EvidenceCandidate,
  posterior: PosteriorState,
  regime: RegimeState | null | undefined
): boolean {
  if (!regime) return false;

  if (candidate.reliabilityBand.low > 0.6) {
    return true;
  }

  if (regime.currentLabel === "stable" && candidate.reliabilityBand.high > 0.7) {
    return true;
  }

  return false;
}

export function computeRegimeAwareVoi(
  worldSpec: WorldModelSpec,
  posterior: PosteriorState,
  candidates: EvidenceCandidate[],
  seed: string,
  options: RegimeAwareVoiOptions = {}
): RegimeAwareVoiReport {
  const baseReport = computeVoi(worldSpec, posterior, candidates, seed, {
    numSimulations: options.numSimulations,
    variableWeights: options.variableWeights,
  });

  const regime = options.currentRegime ?? null;
  const multiplier = regimeAwareScoreMultiplier(regime);

  const regimeAwareCandidates: RegimeAwareVoiCandidate[] = baseReport.candidates.map((candidate, index) => {
    const disambiguationPotential = estimateRegimeDisambiguationPotential(
      candidates[index],
      posterior,
      regime
    );
    const wouldNarrow = wouldNarrowConfidenceBand(candidates[index], posterior, regime);

    const adjustedScore = candidate.costAdjustedScore * multiplier +
      (disambiguationPotential * 0.5);

    return {
      candidateId: candidate.candidateId,
      expectedGain: candidate.expectedGain,
      costAdjustedScore: adjustedScore,
      targetVariables: candidate.targetVariables,
      flipRelevanceEstimate: candidate.flipRelevanceEstimate,
      regimeDisambiguationPotential: disambiguationPotential,
      wouldNarrowConfidenceBand: wouldNarrow,
    };
  });

  regimeAwareCandidates.sort((a, b) => b.costAdjustedScore - a.costAdjustedScore);

  return {
    baselineUncertainty: baseReport.baselineUncertainty,
    candidates: baseReport.candidates,
    seed: baseReport.seed,
    computationTimestamp: baseReport.computationTimestamp,
    currentRegime: regime ?? undefined,
    regimeAwareCandidates,
  };
}
