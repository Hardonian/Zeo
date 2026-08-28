/**
 * Trust scoring and provenance weighting
 */

import type { SignalObservation, ProvenancePointer } from "@zeo/contracts";
import type { TrustScore, TrustBand, SourceMetadata } from "./types.js";

export const TRUST_BANDS: Record<TrustBand, { minScore: number; maxScore: number; label: string }> = {
  primary: { minScore: 0.8, maxScore: 1.0, label: "Primary Source" },
  secondary: { minScore: 0.5, maxScore: 0.79, label: "Secondary Source" },
  commentary: { minScore: 0.2, maxScore: 0.49, label: "Commentary" },
  quarantined: { minScore: 0, maxScore: 0.19, label: "Quarantined" },
};

export function computeTrustBand(score: number): TrustBand {
  if (score >= TRUST_BANDS.primary.minScore) return "primary";
  if (score >= TRUST_BANDS.secondary.minScore) return "secondary";
  if (score >= TRUST_BANDS.commentary.minScore) return "commentary";
  return "quarantined";
}

export function createSourceMetadata(
  sourceId: string,
  license: string,
  updateCadence: SourceMetadata["updateCadence"],
  reliabilityScore: number,
  knownIssues: string[] = []
): SourceMetadata {
  return {
    sourceId,
    license,
    updateCadence,
    reliabilityBand: computeTrustBand(reliabilityScore),
    reliabilityScore,
    knownIssues,
    lastVerifiedAt: new Date().toISOString(),
  };
}

interface TrustScorer {
  computeScore(observation: SignalObservation, metadata?: SourceMetadata): TrustScore;
  computeBatchScores(
    observations: SignalObservation[],
    metadataMap: Map<string, SourceMetadata>
  ): Map<string, TrustScore>;
  addWarning(observationId: string, warning: string): void;
  getWarnings(observationId: string): string[];
}

export function createTrustScorer(options: {
  provenanceWeight: number;
  recencyWeight: number;
  consistencyWeight: number;
  defaultBand: TrustBand;
}): TrustScorer {
  const warnings = new Map<string, string[]>();

  function computeProvenanceQuality(provenance: ProvenancePointer[]): number {
    if (!provenance || provenance.length === 0) return 0.2;

    let score = 0;
    for (const p of provenance) {
      // Higher score for complete provenance
      if (p.kind === "document" && p.page && p.selector) score += 1;
      else if (p.kind === "image" && p.bbox) score += 0.9;
      else if (p.kind === "audio" && p.startMs !== undefined) score += 0.8;
      else if (p.kind === "text" && p.offset !== undefined) score += 0.7;
      else score += 0.5;

      // Checksum presence bonus
      if (p.checksum) score += 0.1;
    }

    return Math.min(1, score / provenance.length);
  }

  function computeRecency(timestamp: string): number {
    const now = new Date();
    const obsTime = new Date(timestamp);
    const ageHours = (now.getTime() - obsTime.getTime()) / (1000 * 60 * 60);

    // Exponential decay with 24 hour half-life
    const recencyScore = Math.pow(0.5, ageHours / 24);
    return Math.max(0.1, recencyScore); // Floor at 0.1
  }

  function computeConsistency(observation: SignalObservation): number {
    // Check for internal consistency
    const checks: boolean[] = [
      // Value band is valid
      observation.valueBand.low >= 0 && observation.valueBand.high <= 1,
      observation.valueBand.low <= observation.valueBand.high,
      // Weight is in valid range
      observation.weightApplied >= 0 && observation.weightApplied <= 1,
      // Quality score is valid
      observation.qualityScore >= 0 && observation.qualityScore <= 1,
      // Has required fields
      !!observation.observationId,
      !!observation.signalId,
      !!observation.t,
      !!observation.sourceId,
    ];

    const passCount = checks.filter(Boolean).length;
    return passCount / checks.length;
  }

  return {
    computeScore(observation: SignalObservation, metadata?: SourceMetadata): TrustScore {
      const components = {
        sourceReliability: metadata?.reliabilityScore ?? 0.5,
        recency: computeRecency(observation.t),
        provenanceQuality: computeProvenanceQuality(observation.provenance),
        consistency: computeConsistency(observation),
      };

      // Weighted average
      const overall =
        components.sourceReliability * options.provenanceWeight +
        components.recency * options.recencyWeight +
        components.provenanceQuality * options.provenanceWeight +
        components.consistency * options.consistencyWeight;

      const score: TrustScore = {
        overall: Math.min(1, Math.max(0, overall)),
        components,
        band: computeTrustBand(overall),
        warnings: [],
      };

      // Add warnings
      if (components.provenanceQuality < 0.5) {
        score.warnings.push("Low provenance quality");
      }
      if (components.recency < 0.3) {
        score.warnings.push("Observation is stale (>24 hours)");
      }
      if (components.consistency < 0.8) {
        score.warnings.push("Internal consistency issues detected");
      }
      if (metadata?.knownIssues.length) {
        score.warnings.push(...metadata.knownIssues.map(i => `Known issue: ${i}`));
      }

      // Store warnings
      warnings.set(observation.observationId, score.warnings);

      return score;
    },

    computeBatchScores(
      observations: SignalObservation[],
      metadataMap: Map<string, SourceMetadata>
    ): Map<string, TrustScore> {
      const scores = new Map<string, TrustScore>();

      for (const obs of observations) {
        const metadata = metadataMap.get(obs.sourceId);
        const score = this.computeScore(obs, metadata);
        scores.set(obs.observationId, score);
      }

      return scores;
    },

    addWarning(observationId: string, warning: string): void {
      const existing = warnings.get(observationId) ?? [];
      existing.push(warning);
      warnings.set(observationId, existing);
    },

    getWarnings(observationId: string): string[] {
      return warnings.get(observationId) ?? [];
    },
  };
}

