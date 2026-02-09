import { nanoid } from "nanoid";
import type {
  ExplanationLevel,
  ExplanationSelectionContext,
  ExplanationRecord,
  ExplanationContent,
  AutoSelectionRules,
} from "./types";

export class ExplanationSelector {
  private defaultRules: AutoSelectionRules = {
    riskTierThresholds: {
      informational: "executive",
      operational: "operational",
      strategic: "analytical",
      existential: "epistemic",
    },
    overrideFrequencyThreshold: 3,
    defaultLevel: "executive",
  };

  private rules: AutoSelectionRules;
  private selectionHistory: ExplanationRecord[] = [];

  constructor(rules?: Partial<AutoSelectionRules>) {
    this.rules = {
      ...this.defaultRules,
      ...rules,
    };
  }

  autoSelectExplanationLevel(
    context: ExplanationSelectionContext,
  ): ExplanationLevel {
    if (context.userPreference) {
      return this.validateLevel(context.userPreference);
    }

    const baseLevel = this.getBaseLevelForRiskTier(context.decisionRiskTier);

    if (this.shouldEscalateLevel(context, baseLevel)) {
      return this.escalateLevel(baseLevel);
    }

    return baseLevel;
  }

  shouldEscalateLevel(
    context: ExplanationSelectionContext,
    currentLevel: ExplanationLevel,
  ): boolean {
    if (context.recentOverrideCount >= this.rules.overrideFrequencyThreshold) {
      return true;
    }

    if (context.userInteractionCount > 10 && currentLevel === "executive") {
      return true;
    }

    if (
      context.decisionRiskTier === "existential" &&
      currentLevel !== "epistemic"
    ) {
      return true;
    }

    if (
      context.decisionRiskTier === "strategic" &&
      currentLevel === "executive"
    ) {
      return true;
    }

    return false;
  }

  recordExplanationSelection(
    decisionId: string,
    level: ExplanationLevel,
    content: ExplanationContent,
    autoSelected: boolean,
  ): ExplanationRecord {
    const record: ExplanationRecord = {
      id: nanoid(),
      timestamp: new Date(),
      decisionId,
      level,
      content,
      autoSelected,
    };

    this.selectionHistory.push(record);

    this.cleanupOldRecords();

    return record;
  }

  getSelectionHistory(
    decisionId?: string,
    limit?: number,
  ): ExplanationRecord[] {
    let history = this.selectionHistory;

    if (decisionId) {
      history = history.filter((r) => r.decisionId === decisionId);
    }

    history = [...history].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    );

    if (limit) {
      history = history.slice(0, limit);
    }

    return history;
  }

  getRecentOverrideCount(windowMs: number = 3600000): number {
    const cutoff = new Date(Date.now() - windowMs);
    return this.selectionHistory.filter(
      (r) => !r.autoSelected && r.timestamp > cutoff,
    ).length;
  }

  getSelectionStats(): {
    totalSelections: number;
    autoSelectedCount: number;
    overrideCount: number;
    levelDistribution: Record<ExplanationLevel, number>;
  } {
    const stats = {
      totalSelections: this.selectionHistory.length,
      autoSelectedCount: 0,
      overrideCount: 0,
      levelDistribution: {
        executive: 0,
        operational: 0,
        analytical: 0,
        epistemic: 0,
      },
    };

    for (const record of this.selectionHistory) {
      if (record.autoSelected) {
        stats.autoSelectedCount++;
      } else {
        stats.overrideCount++;
      }
      stats.levelDistribution[record.level]++;
    }

    return stats;
  }

  updateRules(rules: Partial<AutoSelectionRules>): void {
    this.rules = {
      ...this.rules,
      ...rules,
    };
  }

  private getBaseLevelForRiskTier(
    riskTier: ExplanationSelectionContext["decisionRiskTier"],
  ): ExplanationLevel {
    const level = this.rules.riskTierThresholds[riskTier];
    return level ?? this.rules.defaultLevel;
  }

  private validateLevel(level: ExplanationLevel): ExplanationLevel {
    const validLevels: ExplanationLevel[] = [
      "executive",
      "operational",
      "analytical",
      "epistemic",
    ];
    if (!validLevels.includes(level)) {
      return this.rules.defaultLevel;
    }
    return level;
  }

  private escalateLevel(level: ExplanationLevel): ExplanationLevel {
    const escalationOrder: ExplanationLevel[] = [
      "executive",
      "operational",
      "analytical",
      "epistemic",
    ];
    const currentIndex = escalationOrder.indexOf(level);

    if (currentIndex >= 0 && currentIndex < escalationOrder.length - 1) {
      const nextLevel = escalationOrder[currentIndex + 1];
      if (nextLevel) {
        return nextLevel;
      }
    }

    return level;
  }

  private cleanupOldRecords(): void {
    const maxAgeMs = 7 * 24 * 60 * 60 * 1000;
    const cutoff = new Date(Date.now() - maxAgeMs);
    this.selectionHistory = this.selectionHistory.filter(
      (r) => r.timestamp > cutoff,
    );
  }
}

export function autoSelectExplanationLevel(
  context: ExplanationSelectionContext,
  rules?: Partial<AutoSelectionRules>,
): ExplanationLevel {
  const selector = new ExplanationSelector(rules);
  return selector.autoSelectExplanationLevel(context);
}

export function shouldEscalateLevel(
  context: ExplanationSelectionContext,
  currentLevel: ExplanationLevel,
  rules?: Partial<AutoSelectionRules>,
): boolean {
  const selector = new ExplanationSelector(rules);
  return selector.shouldEscalateLevel(context, currentLevel);
}

export function createDefaultRules(): AutoSelectionRules {
  return {
    riskTierThresholds: {
      informational: "executive",
      operational: "operational",
      strategic: "analytical",
      existential: "epistemic",
    },
    overrideFrequencyThreshold: 3,
    defaultLevel: "executive",
  };
}
