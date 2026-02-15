/**
 * Intent Classification — deterministic keyword-based intent routing.
 *
 * Maps natural language input to a fixed set of IntentKeys.
 * No LLM dependency. Pure string matching with confidence scoring.
 */

export enum IntentKey {
  FLIP_DISTANCE = 'FLIP_DISTANCE',
  COUNTERFACTUAL_RUN = 'COUNTERFACTUAL_RUN',
  EVIDENCE_RANK = 'EVIDENCE_RANK',
  EVIDENCE_PLAN = 'EVIDENCE_PLAN',
  GRAPH_SIMULATE = 'GRAPH_SIMULATE',
  GRAPH_EXPLAIN = 'GRAPH_EXPLAIN',
  REGRET_PLAN = 'REGRET_PLAN',
  ACTIVE_LEARNING_PLAN = 'ACTIVE_LEARNING_PLAN',
  UNKNOWN = 'UNKNOWN',
}

export interface ClassifiedIntent {
  intent: IntentKey;
  confidence: number;
  matchedKeywords: string[];
}

interface KeywordRule {
  intent: IntentKey;
  /** Primary keywords — high-confidence signals. */
  primary: string[];
  /** Secondary keywords — supporting signals that boost confidence. */
  secondary: string[];
}

const KEYWORD_RULES: KeywordRule[] = [
  {
    intent: IntentKey.FLIP_DISTANCE,
    primary: [
      'flip distance',
      'flip-distance',
      'how stable',
      'how fragile',
      'how robust',
      'stability',
      'fragility',
      'robustness',
      'would change',
      'would flip',
      'decision flip',
      'perturbation',
      'minimum change',
    ],
    secondary: ['sensitive', 'sensitivity', 'break', 'threshold', 'margin', 'close to flipping'],
  },
  {
    intent: IntentKey.COUNTERFACTUAL_RUN,
    primary: [
      'counterfactual',
      'what if',
      'alternative path',
      'alternative decision',
      'what would happen',
      'hypothetical',
      'what would need to change',
      'explore alternatives',
    ],
    secondary: ['scenario', 'different', 'change', 'outcome', 'paths'],
  },
  {
    intent: IntentKey.EVIDENCE_RANK,
    primary: [
      'evidence rank',
      'rank evidence',
      'value of information',
      'voi',
      'which evidence',
      'best evidence',
      'spend resources',
      'research budget',
      'highest value',
      'most valuable',
      'increase confidence',
    ],
    secondary: ['evidence', 'information', 'budget', 'invest', 'resource', 'roi', 'confidence'],
  },
  {
    intent: IntentKey.EVIDENCE_PLAN,
    primary: [
      'evidence plan',
      'collection plan',
      'what should we check',
      'what to investigate',
      'gather evidence',
      'plan evidence',
      'check next',
    ],
    secondary: ['plan', 'collect', 'investigate', 'check', 'verify', 'validate'],
  },
  {
    intent: IntentKey.GRAPH_SIMULATE,
    primary: [
      'simulate',
      'simulation',
      'decision tree',
      'decision graph',
      'downstream',
      'what happens if we choose',
      'expected value',
      'path outcome',
    ],
    secondary: ['graph', 'node', 'tree', 'branch', 'outcome', 'consequence'],
  },
  {
    intent: IntentKey.GRAPH_EXPLAIN,
    primary: [
      'explain path',
      'explain decision',
      'trace path',
      'why this path',
      'path breakdown',
      'decision explanation',
      'step by step',
    ],
    secondary: ['explain', 'trace', 'path', 'understand', 'breakdown', 'walk through'],
  },
  {
    intent: IntentKey.REGRET_PLAN,
    primary: [
      'regret',
      'least risk',
      'lowest risk',
      'safest',
      'safe move',
      'minimize risk',
      'minimize regret',
      'worst case',
      'downside',
      'least-risk',
    ],
    secondary: ['risk', 'safe', 'cautious', 'conservative', 'protect', 'hedge'],
  },
  {
    intent: IntentKey.ACTIVE_LEARNING_PLAN,
    primary: [
      'active learning',
      'improve over time',
      'learning plan',
      'learn next',
      'iterative improvement',
      'get better',
      'improve decisions',
    ],
    secondary: ['learn', 'improve', 'iterate', 'better', 'optimize', 'refine'],
  },
];

/**
 * Classify natural language input into a fixed IntentKey.
 *
 * Uses deterministic keyword matching with confidence scoring.
 * Returns UNKNOWN when no intent reaches minimum confidence.
 */
export function classifyIntent(input: string): ClassifiedIntent {
  const lower = input.toLowerCase().trim();

  if (!lower) {
    return { intent: IntentKey.UNKNOWN, confidence: 0, matchedKeywords: [] };
  }

  let bestIntent = IntentKey.UNKNOWN;
  let bestScore = 0;
  let bestMatched: string[] = [];

  for (const rule of KEYWORD_RULES) {
    let score = 0;
    const matched: string[] = [];

    for (const kw of rule.primary) {
      if (lower.includes(kw)) {
        score += 2;
        matched.push(kw);
      }
    }

    for (const kw of rule.secondary) {
      if (lower.includes(kw)) {
        score += 1;
        matched.push(kw);
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestIntent = rule.intent;
      bestMatched = matched;
    }
  }

  // Minimum threshold: at least one primary keyword match (score >= 2)
  // or at least two secondary keyword matches (score >= 2)
  const minThreshold = 2;
  if (bestScore < minThreshold) {
    return { intent: IntentKey.UNKNOWN, confidence: 0, matchedKeywords: bestMatched };
  }

  // Normalize confidence to 0-1 range. Cap at 1.0.
  const maxPossible = 10; // practical maximum for a single rule match
  const confidence = Math.min(bestScore / maxPossible, 1.0);

  return { intent: bestIntent, confidence, matchedKeywords: bestMatched };
}

/** Human-readable label for an IntentKey. */
export function intentLabel(intent: IntentKey): string {
  const labels: Record<IntentKey, string> = {
    [IntentKey.FLIP_DISTANCE]: 'Decision Stability Analysis',
    [IntentKey.COUNTERFACTUAL_RUN]: 'Counterfactual Exploration',
    [IntentKey.EVIDENCE_RANK]: 'Evidence Value Ranking',
    [IntentKey.EVIDENCE_PLAN]: 'Evidence Collection Planning',
    [IntentKey.GRAPH_SIMULATE]: 'Decision Path Simulation',
    [IntentKey.GRAPH_EXPLAIN]: 'Decision Path Explanation',
    [IntentKey.REGRET_PLAN]: 'Regret Minimization Planning',
    [IntentKey.ACTIVE_LEARNING_PLAN]: 'Active Learning Strategy',
    [IntentKey.UNKNOWN]: 'Unknown Intent',
  };
  return labels[intent];
}

/** Get all example prompts for the intent classifier. */
export function getExamplePrompts(): { prompt: string; intent: IntentKey }[] {
  return [
    { prompt: 'How stable is this recommendation?', intent: IntentKey.FLIP_DISTANCE },
    { prompt: 'What evidence would increase confidence?', intent: IntentKey.EVIDENCE_RANK },
    { prompt: 'If risk dropped by 5%, would the decision change?', intent: IntentKey.FLIP_DISTANCE },
    { prompt: "What's the safest move?", intent: IntentKey.REGRET_PLAN },
    { prompt: 'What happens if we choose the aggressive path?', intent: IntentKey.GRAPH_SIMULATE },
    { prompt: 'How do we improve over time?', intent: IntentKey.ACTIVE_LEARNING_PLAN },
    { prompt: 'What would need to change for a different outcome?', intent: IntentKey.COUNTERFACTUAL_RUN },
    { prompt: 'Where should we spend our research budget?', intent: IntentKey.EVIDENCE_RANK },
  ];
}
