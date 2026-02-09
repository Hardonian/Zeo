/**
 * Decision Implication Synthesizer
 * 
 * AI layer that produces decision implications with explicit non-authoritative status.
 * All outputs are tagged as interpretation, never fact.
 */

import type { 
  UUID, 
  ProvenancePointer,
  EpistemicStatus
} from "@zeo/contracts";

export interface DecisionContext {
  decisionId: string;
  decisionTitle: string;
  availableActions: string[];
  assumptions: Array<{ id: string; text: string; confidence: number }>;
  analyticsResults?: Array<{
    type: string;
    finding: string;
    confidence: "low" | "medium" | "high";
  }>;
  calibrationData?: {
    baseRate?: number;
    historicalAccuracy?: number;
  };
  regimeInfo?: {
    currentRegime: string;
    stability: "stable" | "transitioning" | "uncertain";
  };
}

export interface DecisionImplication {
  id: UUID;
  implication: string;
  type: "what_this_means" | "why_might_be_wrong" | "what_to_check_next";
  epistemicStatus: Extract<EpistemicStatus, "belief" | "assumption">;
  confidenceBand: "low" | "medium";
  supportingEvidence: string[];
  caveats: string[];
  requiresValidation: true;
  createdAt: string;
  provenance: ProvenancePointer[];
}

export interface SynthesisResult {
  id: UUID;
  decisionId: string;
  createdAt: string;
  implications: DecisionImplication[];
  isNonAuthoritative: true;
  isInterpretation: true;
  summary: string;
  warning: string; // Always includes non-authoritative disclaimer
}

export interface SynthesisOptions {
  includeActionRecommendations?: boolean;
  includeUncertaintyQuantification?: boolean;
  maxImplications?: number;
}

/**
 * Synthesize decision implications from context.
 * All outputs are explicitly non-authoritative interpretations.
 */
export function synthesizeImplications(
  context: DecisionContext,
  options: SynthesisOptions = {}
): SynthesisResult {
  const resultId = generateUUID();
  const createdAt = new Date().toISOString();
  
  const implications: DecisionImplication[] = [];
  
  // Generate "what this means" implications
  implications.push(...generateWhatThisMeans(context, createdAt));
  
  // Generate "why this might be wrong" implications
  implications.push(...generateWhyMightBeWrong(context, createdAt));
  
  // Generate "what to check next" implications
  implications.push(...generateWhatToCheckNext(context, createdAt));
  
  // Limit implications
  const maxImpl = options.maxImplications ?? 6;
  const limitedImplications = implications.slice(0, maxImpl);
  
  return {
    id: resultId,
    decisionId: context.decisionId,
    createdAt,
    implications: limitedImplications,
    isNonAuthoritative: true,
    isInterpretation: true,
    summary: generateSummary(context, limitedImplications),
    warning: "This is an AI-generated interpretation, not authoritative advice. All implications require human validation."
  };
}

function generateWhatThisMeans(
  context: DecisionContext,
  timestamp: string
): DecisionImplication[] {
  const implications: DecisionImplication[] = [];
  
  // Based on analytics results
  if (context.analyticsResults && context.analyticsResults.length > 0) {
    const strongFindings = context.analyticsResults.filter(r => r.confidence === "high");
    
    for (const finding of strongFindings.slice(0, 2)) {
      implications.push({
        id: generateUUID(),
        implication: `Based on ${finding.type}: ${finding.finding} suggests ${context.availableActions[0] || 'careful consideration'} may be warranted.`,
        type: "what_this_means",
        epistemicStatus: "belief",
        confidenceBand: "medium",
        supportingEvidence: [finding.type],
        caveats: ["Finding may not generalize to current context", "Statistical significance ≠ practical significance"],
        requiresValidation: true,
        createdAt: timestamp,
        provenance: [createProvenance("synthesizer", timestamp)]
      });
    }
  }
  
  // Based on assumptions
  if (context.assumptions.length > 0) {
    const lowConfidenceAssumptions = context.assumptions.filter(a => a.confidence < 0.5);
    
    if (lowConfidenceAssumptions.length > 0) {
      implications.push({
        id: generateUUID(),
        implication: `Decision relies on ${lowConfidenceAssumptions.length} low-confidence assumption(s). Outcome sensitive to these assumptions being wrong.`,
        type: "what_this_means",
        epistemicStatus: "belief",
        confidenceBand: "low",
        supportingEvidence: lowConfidenceAssumptions.map(a => a.id),
        caveats: ["Assumption confidence estimates may themselves be uncertain", "Unknown unknowns not accounted for"],
        requiresValidation: true,
        createdAt: timestamp,
        provenance: [createProvenance("synthesizer", timestamp)]
      });
    }
  }
  
  // Based on regime
  if (context.regimeInfo?.stability === "transitioning") {
    implications.push({
      id: generateUUID(),
      implication: `Current regime is transitioning. Historical patterns may not apply. Consider delaying decision or building in more flexibility.`,
      type: "what_this_means",
      epistemicStatus: "assumption",
      confidenceBand: "low",
      supportingEvidence: ["regime_detection"],
      caveats: ["Regime detection has false positive rate", "Transition may be temporary"],
      requiresValidation: true,
      createdAt: timestamp,
      provenance: [createProvenance("synthesizer", timestamp)]
    });
  }
  
  return implications;
}

function generateWhyMightBeWrong(
  context: DecisionContext,
  timestamp: string
): DecisionImplication[] {
  const implications: DecisionImplication[] = [];
  
  // Data quality concerns
  implications.push({
    id: generateUUID(),
    implication: `Analysis based on available data may be incomplete. Missing variables, measurement error, or selection bias could change conclusions.`,
    type: "why_might_be_wrong",
    epistemicStatus: "assumption",
    confidenceBand: "medium",
    supportingEvidence: [],
    caveats: ["Cannot quantify unknown unknowns", "Bias could be in either direction"],
    requiresValidation: true,
    createdAt: timestamp,
    provenance: [createProvenance("synthesizer", timestamp)]
  });
  
  // Calibration concerns
  if (context.calibrationData?.historicalAccuracy !== undefined && context.calibrationData.historicalAccuracy < 0.6) {
    implications.push({
      id: generateUUID(),
      implication: `Historical accuracy of similar predictions is ${Math.round(context.calibrationData.historicalAccuracy * 100)}%. This decision's predictions likely overconfident.`,
      type: "why_might_be_wrong",
      epistemicStatus: "belief",
      confidenceBand: "medium",
      supportingEvidence: ["calibration_data"],
      caveats: ["Past performance may not predict future accuracy", "This decision may differ from historical baseline"],
      requiresValidation: true,
      createdAt: timestamp,
      provenance: [createProvenance("synthesizer", timestamp)]
    });
  }
  
  // Model misspecification
  implications.push({
    id: generateUUID(),
    implication: `Analytical models simplify reality. Non-linear effects, interactions, or threshold effects not captured could be dominant.`,
    type: "why_might_be_wrong",
    epistemicStatus: "assumption",
    confidenceBand: "medium",
    supportingEvidence: [],
    caveats: ["Model limitations are inherent, not fixable", "More complex models have their own failure modes"],
    requiresValidation: true,
    createdAt: timestamp,
    provenance: [createProvenance("synthesizer", timestamp)]
  });
  
  return implications;
}

function generateWhatToCheckNext(
  context: DecisionContext,
  timestamp: string
): DecisionImplication[] {
  const implications: DecisionImplication[] = [];
  
  // Check critical assumptions
  if (context.assumptions.length > 0) {
    const criticalAssumption = context.assumptions[0];
    implications.push({
      id: generateUUID(),
      implication: `Priority: Validate assumption "${criticalAssumption.text.substring(0, 50)}..." If false, reconsider entire decision framing.`,
      type: "what_to_check_next",
      epistemicStatus: "belief",
      confidenceBand: "medium",
      supportingEvidence: [criticalAssumption.id],
      caveats: ["Assumption may be unverifiable in timeframe", "Partial validation may be best available"],
      requiresValidation: true,
      createdAt: timestamp,
      provenance: [createProvenance("synthesizer", timestamp)]
    });
  }
  
  // Check base rate
  if (context.calibrationData?.baseRate === undefined) {
    implications.push({
      id: generateUUID(),
      implication: `Obtain base rate for this type of decision. Without reference class, cannot assess whether this is above/below average case.`,
      type: "what_to_check_next",
      epistemicStatus: "assumption",
      confidenceBand: "medium",
      supportingEvidence: [],
      caveats: ["Appropriate reference class may be unclear", "Base rates aggregate away important context"],
      requiresValidation: true,
      createdAt: timestamp,
      provenance: [createProvenance("synthesizer", timestamp)]
    });
  }
  
  // Monitor regime
  if (context.regimeInfo?.stability !== "stable") {
    implications.push({
      id: generateUUID(),
      implication: `Monitor for regime stabilization or further shifts. Decision may need revisiting if regime changes significantly.`,
      type: "what_to_check_next",
      epistemicStatus: "belief",
      confidenceBand: "medium",
      supportingEvidence: ["regime_data"],
      caveats: ["Regime changes may be gradual", "False alarms possible"],
      requiresValidation: true,
      createdAt: timestamp,
      provenance: [createProvenance("synthesizer", timestamp)]
    });
  }
  
  return implications;
}

function generateSummary(
  context: DecisionContext,
  implications: DecisionImplication[]
): string {
  const whatMeans = implications.filter(i => i.type === "what_this_means").length;
  const whyWrong = implications.filter(i => i.type === "why_might_be_wrong").length;
  const whatCheck = implications.filter(i => i.type === "what_to_check_next").length;
  
  return `Analysis of "${context.decisionTitle}" generated ${implications.length} implications: ${whatMeans} interpretation(s), ${whyWrong} caution(s), ${whatCheck} recommendation(s). All require validation.`;
}

function createProvenance(sourceId: string, timestamp: string): ProvenancePointer {
  return {
    kind: "text",
    sourceId,
    offset: 0,
    length: 0,
    capturedAt: timestamp,
    checksum: computeChecksum(sourceId + timestamp)
  };
}

function generateUUID(): UUID {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function computeChecksum(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, "0");
}

// End of file

