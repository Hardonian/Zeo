/**
 * Data integrity enforcer - invariants for safe data ingestion
 */

import type { SignalObservation, ObservationBatch } from "@zeo/contracts";
import type { DataIntegrityRule, IntegrityValidationResult } from "./types.js";
import { IntegrityError } from "./errors.js";

/**
 * Validate no future timestamps
 */
export function validateNoFutureTimestamps(
  observations: SignalObservation[],
  context?: { asOf?: string }
): string[] {
  const violations: string[] = [];
  const now = context?.asOf ? new Date(context.asOf) : new Date();
  const tolerance = 60000; // 1 minute tolerance for clock skew
  const cutoff = new Date(now.getTime() + tolerance);

  for (const obs of observations) {
    const obsTime = new Date(obs.t);
    if (obsTime > cutoff) {
      violations.push(
        `Observation ${obs.observationId} has future timestamp: ${obs.t} (now: ${now.toISOString()})`
      );
    }
  }

  return violations;
}

/**
 * Validate checksums are present and valid
 */
export function validateChecksums(observations: SignalObservation[]): string[] {
  const violations: string[] = [];

  for (const obs of observations) {
    // Check provenance checksums
    for (const prov of obs.provenance) {
      if (!prov.checksum) {
        violations.push(
          `Observation ${obs.observationId} has provenance without checksum`
        );
      }
    }

    // Validate observation has required identifiers
    if (!obs.observationId) {
      violations.push("Observation missing observationId");
    }
  }

  return violations;
}

/**
 * Validate schema compliance
 */
export function validateSchema(observations: SignalObservation[]): string[] {
  const violations: string[] = [];

  for (const obs of observations) {
    // Required fields
    if (!obs.observationId) violations.push(`Observation missing observationId`);
    if (!obs.signalId) violations.push(`Observation ${obs.observationId} missing signalId`);
    if (!obs.t) violations.push(`Observation ${obs.observationId} missing timestamp`);
    if (!obs.sourceId) violations.push(`Observation ${obs.observationId} missing sourceId`);

    // Value band validation
    if (!obs.valueBand) {
      violations.push(`Observation ${obs.observationId} missing valueBand`);
    } else {
      if (typeof obs.valueBand.low !== "number") {
        violations.push(`Observation ${obs.observationId} valueBand.low is not a number`);
      }
      if (typeof obs.valueBand.high !== "number") {
        violations.push(`Observation ${obs.observationId} valueBand.high is not a number`);
      }
      if (obs.valueBand.low < 0 || obs.valueBand.low > 1) {
        violations.push(`Observation ${obs.observationId} valueBand.low out of range [0,1]`);
      }
      if (obs.valueBand.high < 0 || obs.valueBand.high > 1) {
        violations.push(`Observation ${obs.observationId} valueBand.high out of range [0,1]`);
      }
      if (obs.valueBand.low > obs.valueBand.high) {
        violations.push(`Observation ${obs.observationId} valueBand is inverted`);
      }
    }

    // Weight validation
    if (typeof obs.weightApplied !== "number") {
      violations.push(`Observation ${obs.observationId} weightApplied is not a number`);
    } else if (obs.weightApplied < 0 || obs.weightApplied > 1) {
      violations.push(`Observation ${obs.observationId} weightApplied out of range [0,1]`);
    }

    // Quality score validation
    if (typeof obs.qualityScore !== "number") {
      violations.push(`Observation ${obs.observationId} qualityScore is not a number`);
    } else if (obs.qualityScore < 0 || obs.qualityScore > 1) {
      violations.push(`Observation ${obs.observationId} qualityScore out of range [0,1]`);
    }

    // Provenance validation
    if (!Array.isArray(obs.provenance)) {
      violations.push(`Observation ${obs.observationId} provenance is not an array`);
    } else {
      for (let i = 0; i < obs.provenance.length; i++) {
        const prov = obs.provenance[i];
        if (!prov.kind) {
          violations.push(`Observation ${obs.observationId} provenance[${i}] missing kind`);
        }
        if (!prov.sourceId) {
          violations.push(`Observation ${obs.observationId} provenance[${i}] missing sourceId`);
        }
        if (!prov.capturedAt) {
          violations.push(`Observation ${obs.observationId} provenance[${i}] missing capturedAt`);
        }
      }
    }
  }

  return violations;
}

/**
 * Validate stable ordering (observations are sorted by time)
 */
export function validateStableOrdering(observations: SignalObservation[]): string[] {
  const violations: string[] = [];

  if (observations.length < 2) return violations;

  // Group by signal
  const bySignal = new Map<string, SignalObservation[]>();
  for (const obs of observations) {
    const group = bySignal.get(obs.signalId) ?? [];
    group.push(obs);
    bySignal.set(obs.signalId, group);
  }

  // Check each signal is sorted by time
  for (const [signalId, group] of bySignal) {
    const sorted = [...group].sort((a, b) =>
      new Date(a.t).getTime() - new Date(b.t).getTime()
    );

    for (let i = 0; i < group.length; i++) {
      if (group[i].observationId !== sorted[i].observationId) {
        violations.push(
          `Signal ${signalId} observations are not sorted by timestamp`
        );
        break;
      }
    }
  }

  return violations;
}

/**
 * Validate no duplicate observation IDs
 */
export function validateNoDuplicates(observations: SignalObservation[]): string[] {
  const violations: string[] = [];
  const seen = new Set<string>();

  for (const obs of observations) {
    if (seen.has(obs.observationId)) {
      violations.push(`Duplicate observationId: ${obs.observationId}`);
    }
    seen.add(obs.observationId);
  }

  return violations;
}

export const INTEGRITY_RULES: DataIntegrityRule[] = [
  {
    id: "no_future_timestamps",
    name: "No Future Timestamps",
    enabled: true,
    validate: validateNoFutureTimestamps,
  },
  {
    id: "checksums_required",
    name: "Checksums Required",
    enabled: true,
    validate: validateChecksums,
  },
  {
    id: "schema_validation",
    name: "Schema Validation",
    enabled: true,
    validate: validateSchema,
  },
  {
    id: "stable_ordering",
    name: "Stable Ordering",
    enabled: true,
    validate: validateStableOrdering,
  },
  {
    id: "no_duplicates",
    name: "No Duplicate IDs",
    enabled: true,
    validate: validateNoDuplicates,
  },
];

interface IntegrityEnforcer {
  validate(
    observations: SignalObservation[],
    context?: { asOf?: string }
  ): IntegrityValidationResult;
  validateBatch(batch: ObservationBatch): IntegrityValidationResult;
  enforce(
    observations: SignalObservation[],
    context?: { asOf?: string }
  ): void;
  addRule(rule: DataIntegrityRule): void;
  disableRule(ruleId: string): void;
}

export function createIntegrityEnforcer(
  rules: DataIntegrityRule[] = INTEGRITY_RULES
): IntegrityEnforcer {
  const activeRules = new Map(rules.map(r => [r.id, r]));

  return {
    validate(
      observations: SignalObservation[],
      context?: { asOf?: string }
    ): IntegrityValidationResult {
      const violations: IntegrityValidationResult["violations"] = [];

      for (const rule of activeRules.values()) {
        if (!rule.enabled) continue;

        const ruleViolations = rule.validate(observations, context);

        if (ruleViolations.length > 0) {
          violations.push({
            ruleId: rule.id,
            message: rule.name,
            observationIds: observations
              .slice(0, ruleViolations.length)
              .map(o => o.observationId),
          });
        }
      }

      return {
        valid: violations.length === 0,
        violations,
      };
    },

    validateBatch(batch: ObservationBatch): IntegrityValidationResult {
      return this.validate(batch.items);
    },

    enforce(observations: SignalObservation[], context?: { asOf?: string }): void {
      const result = this.validate(observations, context);

      if (!result.valid) {
        const messages = result.violations.map(v => `${v.ruleId}: ${v.message}`);
        throw new IntegrityError("multiple_rules", messages);
      }
    },

    addRule(rule: DataIntegrityRule): void {
      activeRules.set(rule.id, rule);
    },

    disableRule(ruleId: string): void {
      const rule = activeRules.get(ruleId);
      if (rule) {
        rule.enabled = false;
      }
    },
  };
}

