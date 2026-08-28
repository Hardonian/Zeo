/**
 * Value Profile Implementation
 *
 * Manages default value functions and per-lens/per-decision overrides.
 */

import type {
  ValueProfile,
  ValueFunction,
  ValueOverride,
  ValueProfileChange
} from "./types.js";

export function createValueProfile(defaultValueFunctionId: string): ValueProfile {
  const now = new Date();

  return {
    id: generateProfileId(),
    defaultValueFunctionId,
    overrides: [],
    changeHistory: [],
    createdAt: now,
    updatedAt: now
  };
}

export function addOverride(
  profile: ValueProfile,
  override: Omit<ValueOverride, "appliedAt">,
  actor: string,
  reason: string
): ValueProfile {
  const now = new Date();

  const fullOverride: ValueOverride = {
    ...override,
    appliedAt: now
  };

  const change: ValueProfileChange = {
    timestamp: now,
    changeType: "override",
    valueFunctionId: override.valueFunctionId,
    previousState: undefined,
    newState: { override: fullOverride },
    actor,
    reason
  };

  return {
    ...profile,
    overrides: [...profile.overrides, fullOverride],
    changeHistory: [...profile.changeHistory, change],
    updatedAt: now
  };
}

export function removeOverride(
  profile: ValueProfile,
  lensId?: string,
  decisionId?: string,
  actor: string = "system",
  reason: string = "Override removed"
): ValueProfile {
  const now = new Date();

  const overrideToRemove = profile.overrides.find(o =>
    o.lensId === lensId && o.decisionId === decisionId
  );

  if (!overrideToRemove) {
    return profile;
  }

  const change: ValueProfileChange = {
    timestamp: now,
    changeType: "update",
    valueFunctionId: overrideToRemove.valueFunctionId,
    previousState: { override: overrideToRemove },
    newState: undefined,
    actor,
    reason
  };

  return {
    ...profile,
    overrides: profile.overrides.filter(o =>
      !(o.lensId === lensId && o.decisionId === decisionId)
    ),
    changeHistory: [...profile.changeHistory, change],
    updatedAt: now
  };
}

export function getEffectiveValueFunctionId(
  profile: ValueProfile,
  context: { lensId?: string; decisionId?: string }
): string {
  const { lensId, decisionId } = context;

  const specificOverride = profile.overrides.find(o =>
    o.lensId === lensId && o.decisionId === decisionId
  );
  if (specificOverride) {
    return specificOverride.valueFunctionId;
  }

  const lensOverride = profile.overrides.find(o =>
    o.lensId === lensId && !o.decisionId
  );
  if (lensOverride) {
    return lensOverride.valueFunctionId;
  }

  const decisionOverride = profile.overrides.find(o =>
    !o.lensId && o.decisionId === decisionId
  );
  if (decisionOverride) {
    return decisionOverride.valueFunctionId;
  }

  return profile.defaultValueFunctionId;
}

export function getOverridesForLens(
  profile: ValueProfile,
  lensId: string
): ValueOverride[] {
  return profile.overrides.filter(o => o.lensId === lensId);
}

export function getOverridesForDecision(
  profile: ValueProfile,
  decisionId: string
): ValueOverride[] {
  return profile.overrides.filter(o => o.decisionId === decisionId);
}

export function getChangeHistory(
  profile: ValueProfile,
  options?: {
    since?: Date;
    until?: Date;
    valueFunctionId?: string;
    limit?: number;
  }
): ValueProfileChange[] {
  let history = [...profile.changeHistory];

  if (options?.since) {
    history = history.filter(c => c.timestamp >= options.since!);
  }

  if (options?.until) {
    history = history.filter(c => c.timestamp <= options.until!);
  }

  if (options?.valueFunctionId) {
    history = history.filter(c => c.valueFunctionId === options.valueFunctionId);
  }

  history.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  if (options?.limit) {
    history = history.slice(0, options.limit);
  }

  return history;
}

export function auditProfileIntegrity(profile: ValueProfile): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  if (!profile.defaultValueFunctionId) {
    issues.push("Profile missing default value function");
  }

  const overrideIds = new Set<string>();
  for (const override of profile.overrides) {
    const key = `${override.lensId || "_"}_${override.decisionId || "_"}`;
    if (overrideIds.has(key)) {
      issues.push(`Duplicate override for lens=${override.lensId}, decision=${override.decisionId}`);
    }
    overrideIds.add(key);
  }

  const historyChronological = [...profile.changeHistory].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
  );

  for (let i = 1; i < historyChronological.length; i++) {
    if (historyChronological[i].timestamp < historyChronological[i-1].timestamp) {
      issues.push(`Change history has non-monotonic timestamps at index ${i}`);
      break;
    }
  }

  return {
    valid: issues.length === 0,
    issues
  };
}

function generateProfileId(): string {
  return `vp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

