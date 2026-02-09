import type {
  WorldModelSpec,
  LatentVariable,
  ObservationModel,
  PosteriorState,
  SignalObservation,
  EvidenceEvent,
  ProvenancePointer,
} from "@zeo/contracts";
import { createHash } from "crypto";

/**
 * Deterministic RNG for interval inference.
 * Uses seeded xorshift for reproducibility.
 */
export class SeededRandom {
  private state: number;

  constructor(seed: string) {
    // Hash seed to 32-bit integer
    const hash = createHash("sha256").update(seed).digest("hex");
    this.state = parseInt(hash.slice(0, 8), 16) >>> 0;
  }

  next(): number {
    // xorshift32
    this.state ^= this.state << 13;
    this.state ^= this.state >>> 17;
    this.state ^= this.state << 5;
    return (this.state >>> 0) / 0xffffffff;
  }

  /**
   * Sample n uniform values in [low, high].
   */
  uniform(low: number, high: number, n: number): number[] {
    return Array.from({ length: n }, () => low + this.next() * (high - low));
  }
}

/**
 * Map provenance to quality score (0-1).
 */
export function computeProvenanceQuality(
  provenance: ProvenancePointer[],
  sourceWeights: Record<string, number> = {}
): number {
  if (provenance.length === 0) return 0.1; // No provenance = low quality

  let totalQuality = 0;
  for (const pointer of provenance) {
    // Base quality by source
    const sourceQuality = sourceWeights[pointer.sourceId] ?? 0.5;

    // Check completeness
    const hasRequired =
      pointer.sourceId &&
      pointer.checksum &&
      pointer.capturedAt;

    if (!hasRequired) {
      totalQuality += 0.1; // Penalize incomplete provenance
    } else {
      totalQuality += sourceQuality;
    }
  }

  return Math.min(1, totalQuality / provenance.length);
}

/**
 * Apply an observation to a variable's interval band.
 * Conservative: observations can only narrow or widen, never fully determine.
 */
function applyObservationToBand(
  priorBand: { low: number; high: number },
  observation: SignalObservation,
  observationModel: ObservationModel,
  qualityScore: number
): { low: number; high: number } {
  const width = priorBand.high - priorBand.low;

  // Effect scales with quality
  const effectiveStrength = observationModel.strength * qualityScore;

  switch (observationModel.effect) {
    case "narrow": {
      // Observation reduces uncertainty
      const narrowAmount = width * effectiveStrength * 0.5; // Max 50% reduction per obs
      const center = (priorBand.low + priorBand.high) / 2;
      const newWidth = Math.max(width * 0.1, width - narrowAmount); // Never narrower than 10% of prior
      return {
        low: Math.max(0, center - newWidth / 2),
        high: Math.min(1, center + newWidth / 2),
      };
    }

    case "shift": {
      // Observation shifts the interval center
      const shiftDirection = observation.valueBand.low > 0.5 ? 1 : -1;
      const shiftAmount = width * effectiveStrength * 0.3; // Max 30% shift
      return {
        low: Math.max(0, priorBand.low + shiftDirection * shiftAmount),
        high: Math.min(1, priorBand.high + shiftDirection * shiftAmount),
      };
    }

    case "widen": {
      // Observation increases uncertainty (conflict, low quality)
      const widenAmount = width * effectiveStrength;
      return {
        low: Math.max(0, priorBand.low - widenAmount),
        high: Math.min(1, priorBand.high + widenAmount),
      };
    }

    default:
      return priorBand;
  }
}

/**
 * Merge multiple observations for the same variable.
 * Conservative: conflicting observations widen the band.
 */
function mergeObservationBands(
  bands: Array<{ low: number; high: number; quality: number }>
): { low: number; high: number } {
  if (bands.length === 0) return { low: 0, high: 1 };
  if (bands.length === 1) return { low: bands[0].low, high: bands[0].high };

  // Weight by quality
  const totalWeight = bands.reduce((sum, b) => sum + b.quality, 0);

  // Compute weighted center
  let weightedCenter = 0;
  for (const band of bands) {
    const center = (band.low + band.high) / 2;
    weightedCenter += center * (band.quality / totalWeight);
  }

  // Check for conflict: if bands don't overlap, widen significantly
  const minLow = Math.min(...bands.map(b => b.low));
  const maxHigh = Math.max(...bands.map(b => b.high));

  const overlaps = bands.every(b1 =>
    bands.some(b2 => b1 !== b2 &&
      !(b1.high < b2.low || b1.low > b2.high))
  );

  if (!overlaps) {
    // Conflict: widen to encompass all, add penalty
    return {
      low: Math.max(0, minLow - 0.1),
      high: Math.min(1, maxHigh + 0.1),
    };
  }

  // No conflict: weighted average of widths
  const avgWidth = bands.reduce((sum, b) =>
    sum + (b.high - b.low) * (b.quality / totalWeight), 0);

  return {
    low: Math.max(0, weightedCenter - avgWidth / 2),
    high: Math.min(1, weightedCenter + avgWidth / 2),
  };
}

/**
 * Canonicalize observations for deterministic hashing.
 */
function canonicalizeObservations(
  observations: SignalObservation[]
): SignalObservation[] {
  return [...observations].sort((a, b) =>
    a.observationId.localeCompare(b.observationId)
  );
}

/**
 * Infer posterior state from world spec and observations.
 * Deterministic: same inputs and seed produce same output.
 */
export function inferPosterior(
  worldSpec: WorldModelSpec,
  observations: SignalObservation[],
  seed: string,
  sourceWeights?: Record<string, number>
): PosteriorState {
  const rng = new SeededRandom(seed);
  const canonicalObs = canonicalizeObservations(observations);

  const variableStates = new Map<string, {
    priorBand: { low: number; high: number };
    posteriorBand: { low: number; high: number };
    observationCount: number;
    provenanceRefs: string[];
  }>();

  // Initialize with priors
  for (const variable of worldSpec.variables) {
    variableStates.set(variable.id, {
      priorBand: variable.priorBand,
      posteriorBand: { ...variable.priorBand },
      observationCount: 0,
      provenanceRefs: [],
    });
  }

  // Collect observation bands for each variable
  const observationBandsByVariable = new Map<string, Array<{
    low: number;
    high: number;
    quality: number;
  }>>();

  for (const observation of canonicalObs) {
    // Find matching observation model
    const model = worldSpec.observationModels.find(m =>
      observation.signalId.match(m.provenancePattern.replace(/\*/g, ".*"))
    );

    if (!model) continue;

    // Check quality threshold
    const quality = computeProvenanceQuality(
      observation.provenance,
      sourceWeights
    );
    if (quality < model.minQualityThreshold) continue;

    // Apply observation to each target variable
    for (const varId of model.targetVariableIds) {
      const variable = worldSpec.variables.find(v => v.id === varId);
      if (!variable) continue;

      const varState = variableStates.get(varId);
      if (!varState) continue;

      const newBand = applyObservationToBand(
        varState.posteriorBand,
        observation,
        model,
        quality
      );

      if (!observationBandsByVariable.has(varId)) {
        observationBandsByVariable.set(varId, []);
      }
      observationBandsByVariable.get(varId)!.push({
        low: newBand.low,
        high: newBand.high,
        quality,
      });

      varState.observationCount++;
      varState.provenanceRefs.push(...observation.provenance.map(p =>
        `${p.sourceId}:${p.checksum.slice(0, 8)}`
      ));
    }
  }

  // Merge observation bands for each variable
  for (const [varId, bands] of observationBandsByVariable) {
    const merged = mergeObservationBands(bands);
    const varState = variableStates.get(varId);
    if (varState) {
      varState.posteriorBand = merged;
    }
  }

  // Compute overall model strength (average provenance quality)
  let totalQuality = 0;
  let qualityCount = 0;
  for (const [, state] of variableStates) {
    if (state.observationCount > 0) {
      totalQuality += state.observationCount / observations.length;
      qualityCount++;
    }
  }
  const modelStrength = qualityCount > 0 ? totalQuality / qualityCount : 0;

  return {
    worldSpecId: worldSpec.id,
    variables: Array.from(variableStates.entries()).map(([varId, state]) => ({
      variableId: varId,
      posteriorBand: state.posteriorBand,
      priorBand: state.priorBand,
      observationCount: state.observationCount,
      provenanceRefs: [...new Set(state.provenanceRefs)],
    })),
    inferenceTimestamp: new Date().toISOString(),
    seed,
    modelStrength,
  };
}

/**
 * Convert evidence events to observation impacts (low-strength by default).
 */
export function observationsToWorldEvidence(
  observations: SignalObservation[],
  evidenceEvents: EvidenceEvent[],
  mappingRules: Array<{
    evidenceType: string;
    effect: "narrow" | "shift" | "widen";
    strength: number;
    targetVariables: string[];
  }>
): SignalObservation[] {
  const result: SignalObservation[] = [...observations];

  for (const event of evidenceEvents) {
    // Find matching mapping rule
    const rule = mappingRules.find(r => {
      // Convert evidenceType wildcard pattern to a safe regular expression:
      // - Escape all regex metacharacters.
      // - Then convert escaped '*' characters into '.*' wildcards.
      const escapedPattern = r.evidenceType.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regexPattern = escapedPattern.replace(/\\\*/g, ".*");
      const regex = new RegExp(`^${regexPattern}$`);
      return regex.test(event.type);
    });

    if (!rule) continue;

    // Create a synthetic observation for this evidence
    // Evidence events get low strength unless explicitly modeled
    const observation: SignalObservation = {
      observationId: `evidence_${event.id}`,
      signalId: `evidence:${event.type}`,
      t: event.capturedAt,
      valueBand: { low: 0.5, high: 0.5 }, // Neutral value
      weightApplied: rule.strength * 0.5, // Evidence is weaker than direct observation
      qualityScore: 0.4, // Evidence without explicit observation model is lower quality
      biasAdjustmentsApplied: [],
      provenance: event.claims
        .filter(c => c.provenance)
        .flatMap(c => c.provenance!),
      sourceId: event.sourceId,
      rawRef: { kind: "evidence", id: event.id },
    };

    result.push(observation);
  }

  return result;
}

