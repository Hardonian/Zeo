/**
 * Hypothesis Generator Module
 *
 * Generates alternative hypotheses, competing explanations,
 * and assesses hypothesis validity for causal humility.
 */

import { nanoid } from "nanoid";

export interface HypothesisCandidate {
  id: string;
  label: string;
  description: string;
  mechanism: string;
  predictors: Array<{ kind: string; id: string }>;
  expectedEffect: { direction: "positive" | "negative" | "mixed"; magnitude: number };
  alternativeTo?: string;
  confidence: number;
  plausibilityScore: number;
  testabilityScore: number;
  parsimonyScore: number;
  notes: string[];
}

export interface GeneratedHypotheses {
  primary: HypothesisCandidate[];
  alternatives: HypothesisCandidate[];
  competing: HypothesisCandidate[];
  rejected: Array<{ reason: string; count: number }>;
}

export interface HypothesisGenerationConfig {
  maxAlternatives?: number;
  minPlausibility?: number;
  includeReverseCausality?: boolean;
  includeConfounder?: boolean;
  includeSelectionBias?: boolean;
}

export interface EvidencePattern {
  observationId: string;
  correlation: number;
  temporalRelation: "before" | "during" | "after" | "simultaneous";
  strength: number;
}

function randomId(): string {
  return nanoid(8);
}

function computePlausibility(
  mechanism: string,
  predictors: Array<{ kind: string; id: string }>,
  domain: string
): number {
  let score = 0.5;

  const mechanismLower = mechanism.toLowerCase();

  if (mechanismLower.includes("cause") || mechanismLower.includes("lead")) {
    score += 0.2;
  }
  if (mechanismLower.includes("prevent") || mechanismLower.includes("protect")) {
    score += 0.1;
  }
  if (mechanismLower.includes("risk") || mechanismLower.includes("increase")) {
    score += 0.1;
  }

  if (predictors.length >= 1) score += 0.1;
  if (predictors.length >= 3) score -= 0.1;

  return Math.min(0.95, Math.max(0.1, score));
}

function computeTestability(
  mechanism: string,
  predictors: Array<{ kind: string; id: string }>
): number {
  let score = 0.6;

  if (predictors.length === 1) score += 0.2;
  else if (predictors.length > 3) score -= 0.15;

  const mechanismLower = mechanism.toLowerCase();
  if (mechanismLower.includes("measurable") || mechanismLower.includes("observable")) {
    score += 0.1;
  }
  if (mechanismLower.includes("experiment")) {
    score += 0.1;
  }

  return Math.min(0.95, Math.max(0.1, score));
}

function computeParsimony(
  predictors: Array<{ kind: string; id: string }>,
  mechanismLength: number
): number {
  if (predictors.length === 0) return 0.3;
  if (predictors.length === 1) return 0.9;
  if (predictors.length === 2) return 0.7;
  if (predictors.length === 3) return 0.5;
  return Math.max(0.2, 0.8 - predictors.length * 0.15);
}

export function generateAlternatives(
  primaryHypothesis: {
    label: string;
    predictors: Array<{ kind: string; id: string }>;
    mechanism: string;
    expectedEffect: { direction: "positive" | "negative" | "mixed"; magnitude: number };
  },
  evidence: EvidencePattern[],
  domain: string,
  config?: HypothesisGenerationConfig
): GeneratedHypotheses {
  const maxAlternatives = config?.maxAlternatives ?? 5;
  const minPlausibility = config?.minPlausibility ?? 0.3;
  const alternatives: HypothesisCandidate[] = [];
  const competing: HypothesisCandidate[] = [];
  const rejected: Array<{ reason: string; count: number }> = [];

  const predictorIds = primaryHypothesis.predictors.map(p => p.id);
  const mechanism = primaryHypothesis.mechanism;

  let reverseCandidate: HypothesisCandidate | null = null;
  let confounderCandidate: HypothesisCandidate | null = null;
  let selectionBiasCandidate: HypothesisCandidate | null = null;
  let spuriousCandidate: HypothesisCandidate | null = null;

  if (config?.includeReverseCausality !== false) {
    reverseCandidate = {
      id: randomId(),
      label: `Reverse Causality: ${primaryHypothesis.label}`,
      description: `Instead of X causing Y, Y may be causing X`,
      mechanism: "The observed effect may be reversed - the outcome influences the predictor rather than vice versa",
      predictors: primaryHypothesis.predictors,
      expectedEffect: {
        direction: primaryHypothesis.expectedEffect.direction === "positive" ? "negative" : "positive",
        magnitude: primaryHypothesis.expectedEffect.magnitude * 0.8,
      },
      alternativeTo: primaryHypothesis.label,
      confidence: 0.6,
      plausibilityScore: computePlausibility(
        "Reverse causation - outcome influences predictor",
        primaryHypothesis.predictors,
        domain
      ),
      testabilityScore: computeTestability(
        "Reverse causation testable through time-lagged analysis",
        primaryHypothesis.predictors
      ),
      parsimonyScore: computeParsimony(primaryHypothesis.predictors, mechanism.length),
      notes: [
        "Requires temporal precedence analysis",
        "Check if outcome predates predictor in time series",
      ],
    };
  }

  if (config?.includeConfounder !== false) {
    const confounderId = `confounder_${randomId()}`;
    confounderCandidate = {
      id: randomId(),
      label: `Unmeasured Confounder: Z`,
      description: "Both X and Y may be caused by an unmeasured third variable Z",
      mechanism: `A latent variable Z influences both ${predictorIds[0] || "the predictor"} and the outcome`,
      predictors: [{ kind: "variable", id: confounderId }],
      expectedEffect: {
        direction: primaryHypothesis.expectedEffect.direction,
        magnitude: primaryHypothesis.expectedEffect.magnitude * 1.1,
      },
      alternativeTo: primaryHypothesis.label,
      confidence: 0.55,
      plausibilityScore: computePlausibility(
        "Confounding by unmeasured variable",
        [{ kind: "variable", id: confounderId }],
        domain
      ),
      testabilityScore: 0.4,
      parsimonyScore: 0.6,
      notes: [
        "Consider propensity score methods",
        "Sensitivity analysis for unmeasured confounding recommended",
      ],
    };
  }

  const correlation = evidence.length > 0 ? evidence[0].correlation : 0;
  const isStrongCorrelation = Math.abs(correlation) > 0.7;

  spuriousCandidate = {
    id: randomId(),
    label: "Spurious Correlation",
    description: "The observed correlation may be coincidental or due to random chance",
    mechanism: "No causal relationship exists; correlation is spurious",
    predictors: primaryHypothesis.predictors,
    expectedEffect: {
      direction: "mixed",
      magnitude: 0.1,
    },
    alternativeTo: primaryHypothesis.label,
    confidence: isStrongCorrelation ? 0.2 : 0.4,
    plausibilityScore: isStrongCorrelation ? 0.2 : 0.5,
    testabilityScore: 0.8,
    parsimonyScore: 0.95,
    notes: [
      "Test with out-of-sample validation",
      "Check correlation stability across time periods",
    ],
  };

  if (config?.includeSelectionBias !== false) {
    selectionBiasCandidate = {
      id: randomId(),
      label: "Selection Bias",
      description: "The observed relationship may be an artifact of how data was collected or selected",
      mechanism: "Non-random selection creates misleading associations",
      predictors: primaryHypothesis.predictors,
      expectedEffect: {
        direction: "mixed",
        magnitude: correlation * 1.2,
      },
      alternativeTo: primaryHypothesis.label,
      confidence: 0.45,
      plausibilityScore: computePlausibility(
        "Selection bias in sample construction",
        primaryHypothesis.predictors,
        domain
      ),
      testabilityScore: 0.5,
      parsimonyScore: 0.7,
      notes: [
        "Assess representativeness of sample",
        "Consider stratified analysis by selection criteria",
      ],
    };
  }

  const candidates = [
    reverseCandidate,
    confounderCandidate,
    selectionBiasCandidate,
    spuriousCandidate,
  ].filter((c): c is HypothesisCandidate => c !== null);

  for (const candidate of candidates) {
    if (candidate.plausibilityScore >= minPlausibility) {
      if (alternatives.length < maxAlternatives) {
        alternatives.push(candidate);
      } else {
        rejected.push({ reason: `Excluded: ${candidate.label}`, count: 1 });
      }
    } else {
      rejected.push({ reason: `Low plausibility: ${candidate.label}`, count: 1 });
    }
  }

  return {
    primary: [{
      id: randomId(),
      label: primaryHypothesis.label,
      description: `Primary hypothesis: ${primaryHypothesis.label}`,
      mechanism: primaryHypothesis.mechanism,
      predictors: primaryHypothesis.predictors,
      expectedEffect: primaryHypothesis.expectedEffect,
      confidence: 0.8,
      plausibilityScore: computePlausibility(
        primaryHypothesis.mechanism,
        primaryHypothesis.predictors,
        domain
      ),
      testabilityScore: computeTestability(
        primaryHypothesis.mechanism,
        primaryHypothesis.predictors
      ),
      parsimonyScore: computeParsimony(
        primaryHypothesis.predictors,
        primaryHypothesis.mechanism.length
      ),
      notes: ["Primary hypothesis based on available evidence"],
    }],
    alternatives,
    competing: [],
    rejected,
  };
}

export function generateCompetingHypotheses(
  hypotheses: Array<{
    label: string;
    mechanism: string;
    predictors: Array<{ kind: string; id: string }>;
    expectedEffect: { direction: "positive" | "negative" | "mixed"; magnitude: number };
  }>,
  evidence: EvidencePattern[]
): HypothesisCandidate[] {
  const competing: HypothesisCandidate[] = [];

  for (let i = 0; i < hypotheses.length; i++) {
    const h = hypotheses[i];
    competing.push({
      id: randomId(),
      label: `Competing ${i + 1}: ${h.label}`,
      description: `Alternative explanation: ${h.mechanism}`,
      mechanism: h.mechanism,
      predictors: h.predictors,
      expectedEffect: h.expectedEffect,
      confidence: 0.5 + Math.random() * 0.3,
      plausibilityScore: computePlausibility(h.mechanism, h.predictors, "general"),
      testabilityScore: computeTestability(h.mechanism, h.predictors),
      parsimonyScore: computeParsimony(h.predictors, h.mechanism.length),
      notes: [
        `Competing hypothesis #${i + 1}`,
        evidence.length > 0
          ? `Evidence correlation: ${evidence[0].correlation.toFixed(2)}`
          : "No evidence available",
      ],
    });
  }

  competing.sort((a, b) => b.confidence - a.confidence);
  return competing;
}

export function rankHypotheses(
  hypotheses: HypothesisCandidate[]
): Array<HypothesisCandidate & {综合Score: number }> {
  const scored = hypotheses.map(h => {
    const 综合Score = (
      h.confidence * 0.3 +
      h.plausibilityScore * 0.3 +
      h.testabilityScore * 0.25 +
      h.parsimonyScore * 0.15
    );

    return {
      ...h,
      综合Score: Math.round(综合Score * 100) / 100,
    };
  });

  scored.sort((a, b) => b.综合Score - a.综合Score);
  return scored;
}

export function formatHypothesisForReview(
  hypothesis: HypothesisCandidate & { 综合Score?: number }
): string {
  const 综合Score = hypothesis.综合Score ?? (
    hypothesis.confidence * 0.3 +
    hypothesis.plausibilityScore * 0.3 +
    hypothesis.testabilityScore * 0.25 +
    hypothesis.parsimonyScore * 0.15
  );

  const lines: string[] = [];

  lines.push(`## ${hypothesis.label}`);
  lines.push(`**Confidence:** ${(hypothesis.confidence * 100).toFixed(0)}%`);
  lines.push(`**Plausibility:** ${(hypothesis.plausibilityScore * 100).toFixed(0)}%`);
  lines.push(`**Testability:** ${(hypothesis.testabilityScore * 100).toFixed(0)}%`);
  lines.push(`**Parsimony:** ${(hypothesis.parsimonyScore * 100).toFixed(0)}%`);
  lines.push(`**综合 Score:** ${(Math.round(综合Score * 100) / 100 * 100).toFixed(0)}%`);
  lines.push("");
  lines.push("**Mechanism:**");
  lines.push(hypothesis.mechanism);
  lines.push("");
  lines.push("**Expected Effect:**");
  lines.push(`Direction: ${hypothesis.expectedEffect.direction}`);
  lines.push(`Magnitude: ${hypothesis.expectedEffect.magnitude.toFixed(2)}`);
  lines.push("");
  lines.push("**Predictors:**");
  for (const p of hypothesis.predictors) {
    lines.push(`- ${p.kind}: ${p.id}`);
  }
  lines.push("");
  lines.push("**Notes:**");
  for (const note of hypothesis.notes) {
    lines.push(`- ${note}`);
  }

  return lines.join("\n");
}

export function createHypothesisGenerationReport(
  result: GeneratedHypotheses,
  ranked: ReturnType<typeof rankHypotheses>
): string {
  const lines: string[] = [];

  lines.push("# Hypothesis Generation Report");
  lines.push("");
  lines.push("## Primary Hypothesis");
  for (const h of result.primary) {
    lines.push(`- ${h.label} (Confidence: ${(h.confidence * 100).toFixed(0)}%)`);
  }
  lines.push("");

  lines.push("## Alternative Explanations");
  if (result.alternatives.length === 0) {
    lines.push("_No significant alternatives generated._");
  } else {
    for (const h of result.alternatives) {
      lines.push(`- ${h.label} (Plausibility: ${(h.plausibilityScore * 100).toFixed(0)}%)`);
    }
  }
  lines.push("");

  lines.push("## Competing Hypotheses");
  if (ranked.length === 0) {
    lines.push("_No competing hypotheses._");
  } else {
    for (const h of ranked.slice(0, 3)) {
      lines.push(`- ${h.label} (Score: ${(h.综合Score * 100).toFixed(0)}%)`);
    }
  }
  lines.push("");

  lines.push("## Rejected Alternatives");
  if (result.rejected.length === 0) {
    lines.push("_No hypotheses were rejected._");
  } else {
    const grouped = result.rejected.reduce((acc, r) => {
      acc[r.reason] = (acc[r.reason] || 0) + r.count;
      return acc;
    }, {} as Record<string, number>);

    for (const [reason, count] of Object.entries(grouped)) {
      lines.push(`- ${reason}: ${count}`);
    }
  }

  return lines.join("\n");
}

export function generateHypothesesFromPattern(
  pattern: {
    observationPattern: string;
    variables: string[];
    correlationDirection: "positive" | "negative";
    strength: number;
  }
): HypothesisCandidate[] {
  const hypotheses: HypothesisCandidate[] = [];

  const varA = pattern.variables[0] || "X";
  const varB = pattern.variables[1] || "Y";

  hypotheses.push({
    id: randomId(),
    label: `Direct Effect: ${varA} → ${varB}`,
    description: `${varA} directly causes changes in ${varB}`,
    mechanism: `Changes in ${varA} lead to changes in ${varB} through a direct causal pathway`,
    predictors: [{ kind: "variable", id: varA }],
    expectedEffect: {
      direction: pattern.correlationDirection,
      magnitude: pattern.strength,
    },
    confidence: 0.7,
    plausibilityScore: 0.8,
    testabilityScore: 0.75,
    parsimonyScore: 0.9,
    notes: ["Most parsimonious explanation"],
  });

  hypotheses.push({
    id: randomId(),
    label: `Reverse Causality: ${varB} → ${varA}`,
    description: `${varB} may be causing ${varA} instead`,
    mechanism: "The observed direction may be reversed",
    predictors: [{ kind: "variable", id: varA }],
    expectedEffect: {
      direction: pattern.correlationDirection === "positive" ? "negative" : "positive",
      magnitude: pattern.strength * 0.7,
    },
    confidence: 0.5,
    plausibilityScore: 0.5,
    testabilityScore: 0.6,
    parsimonyScore: 0.9,
    notes: ["Requires temporal analysis to rule out"],
  });

  if (pattern.variables.length >= 2) {
    const confounder = pattern.variables[2] || "Z";
    hypotheses.push({
      id: randomId(),
      label: `Confounding: ${varA} ← ${confounder} → ${varB}`,
      description: `Both ${varA} and ${varB} may be caused by ${confounder}`,
      mechanism: `Common cause ${confounder} creates spurious association`,
      predictors: [{ kind: "variable", id: confounder }],
      expectedEffect: {
        direction: pattern.correlationDirection,
        magnitude: pattern.strength * 1.1,
      },
      confidence: 0.45,
      plausibilityScore: 0.55,
      testabilityScore: 0.4,
      parsimonyScore: 0.6,
      notes: ["Requires controlling for potential confounders"],
    });
  }

  hypotheses.push({
    id: randomId(),
    label: `Mediation: ${varA} → M → ${varB}`,
    description: `${varA} affects ${varB} through a mediator M`,
    mechanism: "Indirect effect through intermediate variable",
    predictors: [{ kind: "variable", id: "M" }],
    expectedEffect: {
      direction: pattern.correlationDirection,
      magnitude: pattern.strength * 0.6,
    },
    confidence: 0.4,
    plausibilityScore: 0.45,
    testabilityScore: 0.5,
    parsimonyScore: 0.7,
    notes: ["Mediation analysis recommended"],
  });

  return hypotheses;
}
