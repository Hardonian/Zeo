import type {
  ExplanationContent,
  ExplanationLevel,
} from "./types.js";

export class ExplanationGeneratorImpl {
  private levelOrder: ExplanationLevel[] = [
    "executive",
    "operational",
    "analytical",
    "epistemic",
  ];

  generateExplanation(
    result: unknown,
    level: ExplanationLevel,
  ): ExplanationContent {
    const base = this.createBaseContent(result);

    switch (level) {
      case "executive":
        return this.generateExecutiveSummary(result, base);
      case "operational":
        return this.generateOperationalDetails(result, base);
      case "analytical":
        return this.generateAnalyticalBreakdown(result, base);
      case "epistemic":
        return this.generateEpistemicFoundation(result, base);
      default:
        throw new Error(`Unknown explanation level: ${level}`);
    }
  }

  private createBaseContent(result: unknown): Partial<ExplanationContent> {
    return {
      provenanceRefs: this.extractProvenanceRefs(result),
      uncertaintyNotes: this.extractUncertaintyNotes(result),
    };
  }

  generateExecutiveSummary(
    result: unknown,
    base: Partial<ExplanationContent> = {},
  ): ExplanationContent {
    const decision = this.extractDecision(result);
    return {
      level: "executive",
      summary: decision
        ? `Recommendation: ${decision}`
        : "Executive summary unavailable",
      details: [
        "High-level assessment of the decision context",
        "Primary recommendation with confidence estimate",
        "Key factors supporting the recommendation",
      ],
      provenanceRefs: base.provenanceRefs ?? [],
      uncertaintyNotes: this.filterToRelevantUncertainty(
        base.uncertaintyNotes ?? [],
        "executive",
      ),
    };
  }

  generateOperationalDetails(
    result: unknown,
    base: Partial<ExplanationContent> = {},
  ): ExplanationContent {
    const executive = this.generateExecutiveSummary(result, base);
    const actions = this.extractActions(result);

    return {
      level: "operational",
      summary: executive.summary,
      details: [
        ...executive.details,
        "Specific actions to implement the recommendation",
        ...actions,
        "Timeline and resource requirements",
        "Dependencies and prerequisites",
        "Success metrics and monitoring approach",
      ],
      provenanceRefs: base.provenanceRefs ?? [],
      uncertaintyNotes: this.filterToRelevantUncertainty(
        base.uncertaintyNotes ?? [],
        "operational",
      ),
    };
  }

  generateAnalyticalBreakdown(
    result: unknown,
    base: Partial<ExplanationContent> = {},
  ): ExplanationContent {
    const operational = this.generateOperationalDetails(result, base);
    const reasoning = this.extractReasoning(result);

    return {
      level: "analytical",
      summary: operational.summary,
      details: [
        ...operational.details,
        "Reasoning process and logical steps:",
        ...reasoning,
        "Alternative options considered:",
        ...this.extractAlternatives(result),
        "Comparative analysis of alternatives",
        "Sensitivity analysis: what would change the recommendation",
      ],
      provenanceRefs: base.provenanceRefs ?? [],
      uncertaintyNotes: this.filterToRelevantUncertainty(
        base.uncertaintyNotes ?? [],
        "analytical",
      ),
    };
  }

  generateEpistemicFoundation(
    result: unknown,
    base: Partial<ExplanationContent> = {},
  ): ExplanationContent {
    const analytical = this.generateAnalyticalBreakdown(result, base);

    return {
      level: "epistemic",
      summary: analytical.summary,
      details: [
        ...analytical.details,
        "Core assumptions underlying the analysis:",
        ...this.extractAssumptions(result),
        "Evidence sources and their limitations:",
        ...this.extractEvidenceSources(result),
        "Confidence calibration: known unknowns and unknown unknowns",
        "Scenarios that would invalidate the conclusion",
        "Recommended actions to reduce key uncertainties",
      ],
      provenanceRefs: base.provenanceRefs ?? [],
      uncertaintyNotes: [
        ...(base.uncertaintyNotes ?? []),
        "All epistemic uncertainties are documented here",
      ],
    };
  }

  ensureConsistency(
    explanations: Map<ExplanationLevel, ExplanationContent>,
  ): boolean {
    const executive = explanations.get("executive");
    const operational = explanations.get("operational");
    const analytical = explanations.get("analytical");
    const epistemic = explanations.get("epistemic");

    if (!executive || !operational || !analytical || !epistemic) {
      throw new Error("Missing explanation levels for consistency check");
    }

    if (!this.hasConsistentSummary(executive, operational)) {
      return false;
    }

    if (!this.hasConsistentSummary(operational, analytical)) {
      return false;
    }

    if (!this.hasConsistentSummary(analytical, epistemic)) {
      return false;
    }

    if (!this.hasConsistentProvenance(explanations)) {
      return false;
    }

    if (!this.hasNoContradictoryUncertainties(explanations)) {
      return false;
    }

    return true;
  }

  private hasConsistentSummary(
    lower: ExplanationContent,
    higher: ExplanationContent,
  ): boolean {
    return higher.summary === lower.summary;
  }

  private hasConsistentProvenance(
    explanations: Map<ExplanationLevel, ExplanationContent>,
  ): boolean {
    const baseProvenance = explanations.get("executive")?.provenanceRefs ?? [];

    for (const [level, content] of explanations) {
      if (level === "executive") continue;

      const current = content.provenanceRefs;
      if (!this.isSuperset(current, baseProvenance)) {
        return false;
      }
    }

    return true;
  }

  private hasNoContradictoryUncertainties(
    explanations: Map<ExplanationLevel, ExplanationContent>,
  ): boolean {
    const allUncertainties = new Map<string, string>();

    for (const [level, content] of explanations) {
      for (const note of content.uncertaintyNotes) {
        const key = note.toLowerCase().trim();
        if (allUncertainties.has(key)) {
          const existing = allUncertainties.get(key);
          if (existing !== note) {
            return false;
          }
        } else {
          allUncertainties.set(key, note);
        }
      }
    }

    return true;
  }

  private isSuperset(superset: string[], subset: string[]): boolean {
    const set = new Set(superset);
    return subset.every((item) => set.has(item));
  }

  private filterToRelevantUncertainty(
    notes: string[],
    level: ExplanationLevel,
  ): string[] {
    const levelIndex = this.levelOrder.indexOf(level);

    return notes.filter((note, index) => {
      const notePriority = Math.floor(index / 2);
      return notePriority <= levelIndex;
    });
  }

  private extractDecision(result: unknown): string | null {
    if (result && typeof result === "object") {
      const r = result as Record<string, unknown>;
      if (typeof r.decision === "string") return r.decision;
      if (typeof r.recommendation === "string") return r.recommendation;
      if (typeof r.conclusion === "string") return r.conclusion;
    }
    return null;
  }

  private extractActions(result: unknown): string[] {
    if (result && typeof result === "object") {
      const r = result as Record<string, unknown>;
      if (Array.isArray(r.actions)) {
        return r.actions.filter((a): a is string => typeof a === "string");
      }
    }
    return ["No specific actions identified"];
  }

  private extractReasoning(result: unknown): string[] {
    if (result && typeof result === "object") {
      const r = result as Record<string, unknown>;
      if (Array.isArray(r.reasoning)) {
        return r.reasoning.filter((r): r is string => typeof r === "string");
      }
    }
    return ["Reasoning process not documented"];
  }

  private extractAlternatives(result: unknown): string[] {
    if (result && typeof result === "object") {
      const r = result as Record<string, unknown>;
      if (Array.isArray(r.alternatives)) {
        return r.alternatives.filter((a): a is string => typeof a === "string");
      }
    }
    return ["Alternative options not evaluated"];
  }

  private extractAssumptions(result: unknown): string[] {
    if (result && typeof result === "object") {
      const r = result as Record<string, unknown>;
      if (Array.isArray(r.assumptions)) {
        return r.assumptions.filter((a): a is string => typeof a === "string");
      }
    }
    return ["Assumptions not explicitly documented"];
  }

  private extractEvidenceSources(result: unknown): string[] {
    if (result && typeof result === "object") {
      const r = result as Record<string, unknown>;
      if (Array.isArray(r.evidenceSources)) {
        return r.evidenceSources.filter((e): e is string => typeof e === "string");
      }
    }
    return ["Evidence sources not fully catalogued"];
  }

  private extractProvenanceRefs(result: unknown): string[] {
    if (result && typeof result === "object") {
      const r = result as Record<string, unknown>;
      if (Array.isArray(r.provenanceRefs)) {
        return r.provenanceRefs.filter((p): p is string => typeof p === "string");
      }
      if (Array.isArray(r.sources)) {
        return r.sources.filter((s): s is string => typeof s === "string");
      }
    }
    return ["provenance:default"];
  }

  private extractUncertaintyNotes(result: unknown): string[] {
    if (result && typeof result === "object") {
      const r = result as Record<string, unknown>;
      if (Array.isArray(r.uncertaintyNotes)) {
        return r.uncertaintyNotes.filter((u): u is string => typeof u === "string");
      }
      if (Array.isArray(r.uncertainties)) {
        return r.uncertainties.filter((u): u is string => typeof u === "string");
      }
    }
    return ["Uncertainty assessment: baseline confidence"];
  }
}

export function generateExplanation(
  result: unknown,
  level: ExplanationLevel,
): ExplanationContent {
  const generator = new ExplanationGeneratorImpl();
  return generator.generateExplanation(result, level);
}

export function ensureConsistency(
  explanations: Map<ExplanationLevel, ExplanationContent>,
): boolean {
  const generator = new ExplanationGeneratorImpl();
  return generator.ensureConsistency(explanations);
}