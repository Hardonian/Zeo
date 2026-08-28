import {
  ProvenancePointer,
  QualObservation,
  EvidenceCandidate,
  QualitativeScale,
  QualitativeScaleLevel,
  ScalePack,
  enforceNoFakePrecision,
} from "@zeo/contracts";

export interface ScenarioDraft {
  titleSuggestion: string;
  summary: string;
  extractedEntities: string[];
  candidateActions: Array<{
    id: string;
    label: string;
    kind?: string;
  }>;
  candidateAssumptions: Array<{
    id: string;
    label: string;
    band: { low: number; high: number };
    provenance: ProvenancePointer[];
  }>;
  qualObservations: QualObservation[];
  evidenceCandidates: EvidenceCandidate[];
  warnings: string[];
}

export interface ParseScenarioOptions {
  scales?: QualitativeScale[];
  mappings?: ScalePack["mappings"];
  minBandWidth?: number;
  checksum: string;
}

const DEFAULT_MIN_BAND_WIDTH = 0.15;

const ACTION_PATTERNS = [
  /\b(?:should I|do I|whether to|if I|decision between|choose between|or not)\b/i,
];

const ASSUMPTION_MODALS = [
  /\bmight\b/i,
  /\bprobably\b/i,
  /\bmaybe\b/i,
  /\bpossibly\b/i,
  /\bI think\b/i,
  /\bit seems\b/i,
  /\bI believe\b/i,
  /\bI assume\b/i,
  /\blikely\b/i,
];

const ASSUMPTION_CAUSAL = [
  /\bbecause\b/i,
  /\bso that\b/i,
  /\bif\b(?!\s+so\b)/i,
  /\binsinuates\b/i,
  /\bsuggests\b/i,
];

const HORIZON_PATTERNS = [
  /\b(?:in|within|by|over|during)\s+(?:the\s+)?(?:next|current|coming)?\s*(\d+)\s*(second|minute|hour|day|week|month|quarter|year)s?\b/i,
  /\b(?:short|medium|long)[-\s]?term\b/i,
  /\btoday\b/i,
  /\bthis\s+(?:week|month|quarter|year)\b/i,
  /\b(?:asap|immediately|urgent)\b/i,
];

function hashText(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, "0");
}

function createProvenancePointer(
  text: string,
  start: number,
  end: number,
  checksum: string
): ProvenancePointer {
  return {
    kind: "text",
    sourceId: checksum,
    offset: start,
    length: end - start,
    capturedAt: new Date().toISOString(),
    checksum,
  };
}

function segmentSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function findAllMatches(pattern: RegExp, text: string): RegExpExecArray[] {
  const matches: RegExpExecArray[] = [];
  let match;
  pattern.lastIndex = 0;
  while ((match = pattern.exec(text)) !== null) {
    matches.push(match);
  }
  return matches;
}

function extractEntities(text: string): string[] {
  const entities: string[] = [];
  const patterns = [
    /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g,
    /\b(?:USD|EUR|GBP|JPY|CNY)\s*[\d,]+(?:\.\d+)?\b/g,
    /\b(?:\d{1,3},\d{3}|\d+)(?:\.\d+)?\s*%/g,
  ];

  for (const pattern of patterns) {
    const matches = findAllMatches(pattern, text);
    for (const m of matches) {
      if (m[0].length > 1) {
        entities.push(m[0]);
      }
    }
  }

  return [...new Set(entities)].sort();
}

function extractCandidateActions(
  text: string,
  sentences: string[],
  checksum: string
): ScenarioDraft["candidateActions"] {
  const actions: ScenarioDraft["candidateActions"] = [];
  let actionId = 0;

  for (const sentence of sentences) {
    for (const pattern of ACTION_PATTERNS) {
      if (pattern.test(sentence)) {
        const actionText = sentence.replace(/[.!?]+$/, "").trim();
        actions.push({
          id: `action_${actionId++}`,
          label: actionText.length > 100 ? actionText.substring(0, 100) + "..." : actionText,
          kind: "unknown",
        });
        break;
      }
    }

    const orMatch = /(?:either\s+)?([A-D](?:\)|\.)|\w+)\s*(?:or|vs\.?|versus)\s*([A-D](?:\)|\.)|\w+)/i.exec(
      sentence
    );
    if (orMatch) {
      const part1 = orMatch[1]?.replace(/[.()]/g, "").trim() ?? "option1";
      const part2 = orMatch[2]?.replace(/[.()]/g, "").trim() ?? "option2";
      actions.push({
        id: `action_${actionId++}`,
        label: `${part1} or ${part2}`,
        kind: "binary_choice",
      });
    }
  }

  return actions.sort((a, b) => a.id.localeCompare(b.id));
}

function extractCandidateAssumptions(
  text: string,
  sentences: string[],
  checksum: string
): ScenarioDraft["candidateAssumptions"] {
  const assumptions: ScenarioDraft["candidateAssumptions"] = [];
  let assumptionId = 0;

  for (const sentence of sentences) {
    const textIndex = text.indexOf(sentence);

    for (const pattern of ASSUMPTION_MODALS) {
      if (pattern.test(sentence)) {
        const prov = createProvenancePointer(text, textIndex, textIndex + sentence.length, checksum);

        if (/\bmight\b|\bprobably\b|\bmaybe\b|\bpossibly\b/i.test(sentence)) {
          assumptions.push({
            id: `assumption_${assumptionId++}`,
            label: sentence,
            band: { low: 0.25, high: 0.75 },
            provenance: [prov],
          });
        } else if (/\bI think\b|\bit seems\b|\bI believe\b|\bI assume\b/i.test(sentence)) {
          assumptions.push({
            id: `assumption_${assumptionId++}`,
            label: sentence,
            band: { low: 0.35, high: 0.85 },
            provenance: [prov],
          });
        } else if (/\blikely\b/i.test(sentence)) {
          assumptions.push({
            id: `assumption_${assumptionId++}`,
            label: sentence,
            band: { low: 0.45, high: 0.9 },
            provenance: [prov],
          });
        }
        break;
      }
    }

    for (const pattern of ASSUMPTION_CAUSAL) {
      if (pattern.test(sentence)) {
        const prov = createProvenancePointer(text, textIndex, textIndex + sentence.length, checksum);
        assumptions.push({
          id: `assumption_${assumptionId++}`,
          label: sentence,
          band: { low: 0.2, high: 0.8 },
          provenance: [prov],
        });
        break;
      }
    }
  }

  return assumptions.sort((a, b) => a.id.localeCompare(b.id));
}

function detectHorizon(text: string): { detected: boolean; horizon?: string } {
  for (const pattern of HORIZON_PATTERNS) {
    const match = pattern.exec(text);
    if (match) {
      return { detected: true, horizon: match[0] };
    }
  }
  return { detected: false };
}

function generateQualObservations(
  text: string,
  checksum: string,
  scales: QualitativeScale[] = []
): QualObservation[] {
  const observations: QualObservation[] = [];
  let obsId = 0;
  const now = new Date().toISOString();

  const urgencyKeywords = [
    { pattern: /\burgent\b/i, level: "high" },
    { pattern: /\basap\b/i, level: "high" },
    { pattern: /\bimmediately\b/i, level: "critical" },
    { pattern: /\bsoon\b/i, level: "medium" },
    { pattern: /\bwhenever\b/i, level: "none" },
  ];

  for (const keyword of urgencyKeywords) {
    const match = keyword.pattern.exec(text);
    if (match) {
      const scale = scales.find((s) => s.scaleId === "urgency");
      const level = scale?.levels.find((l: QualitativeScaleLevel) => l.label === keyword.level);
      observations.push({
        id: `qual_obs_${obsId++}`,
        createdAt: now,
        kind: "note_extract",
        scaleId: "urgency",
        levelLabel: keyword.level,
        band: level?.band ?? { low: 0.3, high: 0.7 },
        textProvenance: [
          {
            kind: "text",
            sourceId: checksum,
            offset: match.index,
            length: match[0]?.length ?? 0,
            capturedAt: now,
            checksum,
          },
        ],
        checksum,
      });
    }
  }

  return observations;
}

function generateClarifiers(
  candidateAssumptions: ScenarioDraft["candidateAssumptions"],
  horizonMissing: boolean
): EvidenceCandidate[] {
  const clarifiers: EvidenceCandidate[] = [];
  let clId = 0;

  if (horizonMissing) {
    clarifiers.push({
      id: `clarifier_${clId++}`,
      label: "What is the decision horizon?",
      kind: "question",
      targetVariableIds: [],
      expectedCost: {
        timeMinutes: 5,
        cognitiveLoad: "low",
      },
      reliabilityBand: { low: 0.9, high: 0.99 },
      provenancePlan: {
        wouldHavePointer: true,
        sourceKinds: ["self_report"],
      },
    });
  }

  clarifiers.push({
    id: `clarifier_${clId++}`,
    label: "What defines success for each option?",
    kind: "question",
    targetVariableIds: [],
    expectedCost: {
      timeMinutes: 15,
      cognitiveLoad: "medium",
    },
    reliabilityBand: { low: 0.7, high: 0.95 },
    provenancePlan: {
      wouldHavePointer: true,
      sourceKinds: ["self_report"],
    },
  });

  clarifiers.push({
    id: `clarifier_${clId++}`,
    label: "What are the key constraints (budget, time, irreversibility)?",
    kind: "question",
    targetVariableIds: [],
    expectedCost: {
      timeMinutes: 10,
      cognitiveLoad: "medium",
    },
    reliabilityBand: { low: 0.8, high: 0.98 },
    provenancePlan: {
      wouldHavePointer: true,
      sourceKinds: ["self_report"],
    },
  });

  if (candidateAssumptions.some((a) => a.band.high - a.band.low > 0.4)) {
    clarifiers.push({
      id: `clarifier_${clId++}`,
      label: "What evidence could narrow key assumptions?",
      kind: "question",
      targetVariableIds: [],
      expectedCost: {
        timeMinutes: 30,
        cognitiveLoad: "high",
      },
      reliabilityBand: { low: 0.5, high: 0.85 },
      provenancePlan: {
        wouldHavePointer: true,
        sourceKinds: ["note_extract", "third_party"],
      },
    });
  }

  return clarifiers;
}

function generateTitleSuggestion(text: string, sentences: string[]): string {
  const firstSentence = sentences[0] ?? text;
  const words = firstSentence.split(/\s+/).slice(0, 10);
  const title = words.join(" ");
  if (firstSentence.length > title.length) {
    return title + "...";
  }
  return title;
}

function generateSummary(text: string, sentences: string[]): string {
  if (sentences.length <= 2) {
    return text;
  }
  return sentences.slice(0, 3).join(" ");
}

export function parseScenario(
  text: string,
  options: ParseScenarioOptions
): ScenarioDraft {
  const checksum = options.checksum || hashText(text);
  const scales = options.scales ?? [];
  const sentences = segmentSentences(text);
  const horizon = detectHorizon(text);
  const warnings: string[] = [];

  if (!horizon.detected) {
    warnings.push("Ambiguous or missing decision horizon");
  }

  if (text.split(/\s+/).length < 5) {
    warnings.push("Very short scenario text - limited extraction possible");
  }

  const titleSuggestion = generateTitleSuggestion(text, sentences);
  const summary = generateSummary(text, sentences);
  const entities = extractEntities(text);
  const candidateActions = extractCandidateActions(text, sentences, checksum);
  const candidateAssumptions = extractCandidateAssumptions(text, sentences, checksum);

  for (const assumption of candidateAssumptions) {
    enforceNoFakePrecision({
      band: assumption.band,
      sourceKind: "note_extract",
      hasNumericAnchor: false,
      minWidth: options.minBandWidth ?? DEFAULT_MIN_BAND_WIDTH,
    });
  }

  const qualObservations = generateQualObservations(text, checksum, scales);
  const evidenceCandidates = generateClarifiers(candidateAssumptions, !horizon.detected);

  return {
    titleSuggestion,
    summary,
    extractedEntities: entities,
    candidateActions,
    candidateAssumptions,
    qualObservations,
    evidenceCandidates,
    warnings,
  };
}

export function createDefaultScalePack(): ScalePack {
  return {
    packId: "default-qual-scales",
    version: "0.3.2",
    scales: [
      {
        scaleId: "confidence",
        levels: [
          { label: "very_low", band: { low: 0.0, high: 0.2 } },
          { label: "low", band: { low: 0.15, high: 0.35 } },
          { label: "medium", band: { low: 0.3, high: 0.7 } },
          { label: "high", band: { low: 0.65, high: 0.9 } },
          { label: "very_high", band: { low: 0.85, high: 1.0 } },
        ],
        rules: { monotonic: true, defaultLevel: "medium" },
      },
      {
        scaleId: "urgency",
        levels: [
          { label: "none", band: { low: 0.0, high: 0.1 } },
          { label: "low", band: { low: 0.1, high: 0.3 } },
          { label: "medium", band: { low: 0.25, high: 0.55 } },
          { label: "high", band: { low: 0.5, high: 0.8 } },
          { label: "critical", band: { low: 0.75, high: 1.0 } },
        ],
        rules: { monotonic: true, defaultLevel: "low" },
      },
      {
        scaleId: "trust",
        levels: [
          { label: "distrust", band: { low: 0.0, high: 0.2 } },
          { label: "low", band: { low: 0.15, high: 0.35 } },
          { label: "moderate", band: { low: 0.3, high: 0.6 } },
          { label: "high", band: { low: 0.55, high: 0.85 } },
          { label: "full", band: { low: 0.8, high: 1.0 } },
        ],
        rules: { monotonic: true, defaultLevel: "moderate" },
      },
    ],
    mappings: [],
    createdAt: new Date().toISOString(),
  };
}

