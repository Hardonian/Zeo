export type ExplanationLevel = "executive" | "operational" | "analytical" | "epistemic";

export interface ExplanationContent {
  level: ExplanationLevel;
  summary: string;
  details: string[];
  provenanceRefs: string[];
  uncertaintyNotes: string[];
}

export interface ExplanationGenerator {
  generate(result: unknown, level: ExplanationLevel): ExplanationContent;
}

export interface AutoSelectionRules {
  riskTierThresholds: Record<string, ExplanationLevel>;
  overrideFrequencyThreshold: number;
  defaultLevel: ExplanationLevel;
}

export interface ExplanationSelectionContext {
  decisionRiskTier: "informational" | "operational" | "strategic" | "existential";
  userInteractionCount: number;
  recentOverrideCount: number;
  userPreference?: ExplanationLevel;
}

export interface ExplanationRecord {
  id: string;
  timestamp: Date;
  decisionId: string;
  level: ExplanationLevel;
  content: ExplanationContent;
  autoSelected: boolean;
}
