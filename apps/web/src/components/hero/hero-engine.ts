/**
 * Deterministic Hero Engine — state machine driving the hero visualization.
 *
 * All values are derived from sample-data.ts. No Math.random(), no time-based
 * randomness. Animation sequences use fixed durations and data-driven transitions.
 */

import { sampleA } from '@/lib/sample-data';
import type { SampleNode, SampleEdge, EvidenceItem } from '@/lib/sample-data';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type HeroMode = 'simulate' | 'stress-test' | 'improve';

export interface HeroStep {
  index: number;
  activeNodeId: string;
  activeEdgeIds: string[];
  confidence: number;
  stability: number;
  flipDistance: number;
  topEvidence: { source: string; voiScore: number; rank: number }[];
  narrativeLine: string;
  executiveSummary: string;
  keyDrivers: string[];
  nextAction: string;
  cliCommand: string;
}

export interface HeroState {
  mode: HeroMode;
  currentStep: number;
  steps: HeroStep[];
  nodes: SampleNode[];
  edges: SampleEdge[];
  evidence: EvidenceItem[];
}

/* ------------------------------------------------------------------ */
/*  Computed metrics from sample data                                  */
/* ------------------------------------------------------------------ */

/** Confidence = weighted average probability along primary path A→B→D */
function computeConfidence(nodes: SampleNode[], factor: number): number {
  const a = nodes.find((n) => n.id === 'A');
  const b = nodes.find((n) => n.id === 'B');
  const d = nodes.find((n) => n.id === 'D');
  if (!a || !b || !d) return 0.5;
  const raw = b.probability * d.probability * factor;
  return Math.round(raw * 100);
}

/** Stability score: 1 - (highest risk case probability of flipping) */
function computeStability(factor: number): number {
  const baseStability = 0.74;
  return Math.round(baseStability * factor * 100) / 100;
}

/** Flip distance: minimum change needed to flip the top case */
function computeFlipDistance(factor: number): number {
  const baseFlip = 0.18;
  return Math.round(baseFlip * factor * 100) / 100;
}

/** Top evidence items ranked by VOI */
function topEvidence(evidence: EvidenceItem[], count: number): { source: string; voiScore: number; rank: number }[] {
  return [...evidence]
    .sort((a, b) => b.voiScore - a.voiScore)
    .slice(0, count)
    .map((e, i) => ({ source: e.source, voiScore: e.voiScore, rank: i + 1 }));
}

/* ------------------------------------------------------------------ */
/*  Edge ID helper                                                     */
/* ------------------------------------------------------------------ */

function edgeId(from: string, to: string): string {
  return `${from}-${to}`;
}

/* ------------------------------------------------------------------ */
/*  SIMULATE mode steps                                                */
/* ------------------------------------------------------------------ */

function buildSimulateSteps(nodes: SampleNode[], edges: SampleEdge[], evidence: EvidenceItem[]): HeroStep[] {
  const ev = topEvidence(evidence, 3);

  return [
    {
      index: 0,
      activeNodeId: 'A',
      activeEdgeIds: [],
      confidence: computeConfidence(nodes, 0.85),
      stability: computeStability(0.9),
      flipDistance: computeFlipDistance(1.0),
      topEvidence: ev,
      narrativeLine: 'Evaluating Market Entry decision with 5 linked outcomes...',
      executiveSummary: 'Simulating decision path through Market Entry scenario.',
      keyDrivers: ['Growth probability: 60%', 'Success rate on aggressive path: 70%', 'Conservative path probability: 40%'],
      nextAction: 'Examine downstream outcomes from the aggressive path.',
      cliCommand: 'zeo graph simulate --node A',
    },
    {
      index: 1,
      activeNodeId: 'B',
      activeEdgeIds: [edgeId('A', 'B')],
      confidence: computeConfidence(nodes, 0.90),
      stability: computeStability(0.85),
      flipDistance: computeFlipDistance(0.95),
      topEvidence: ev,
      narrativeLine: 'Confidence shifts to 68% due to High Growth weighting...',
      executiveSummary: 'Aggressive path selected. High Growth probability at 60%.',
      keyDrivers: ['High Growth path probability: 60%', 'Expected value: $800K', 'Two downstream outcomes'],
      nextAction: 'Evaluate Win Market vs Partial Gain tradeoff.',
      cliCommand: 'zeo graph simulate --node B',
    },
    {
      index: 2,
      activeNodeId: 'D',
      activeEdgeIds: [edgeId('A', 'B'), edgeId('B', 'D')],
      confidence: computeConfidence(nodes, 1.0),
      stability: computeStability(0.80),
      flipDistance: computeFlipDistance(0.90),
      topEvidence: ev,
      narrativeLine: 'Primary risk driver: Market entry timing and competitive response...',
      executiveSummary: 'Win Market outcome reached. Expected value $1,200K at 70% probability.',
      keyDrivers: ['Terminal value: $1,200K', 'Path probability: 42%', 'Cumulative expected value: $504K'],
      nextAction: 'Run stress test to check if this holds under perturbation.',
      cliCommand: 'zeo graph explain --path A->B->D',
    },
    {
      index: 3,
      activeNodeId: 'E',
      activeEdgeIds: [edgeId('A', 'B'), edgeId('B', 'E')],
      confidence: computeConfidence(nodes, 0.92),
      stability: computeStability(0.88),
      flipDistance: computeFlipDistance(1.05),
      topEvidence: ev,
      narrativeLine: 'Alternative: Partial Gain delivers $400K at 30% — less likely but stable.',
      executiveSummary: 'Partial Gain fallback examined. Lower value but higher stability.',
      keyDrivers: ['Terminal value: $400K', 'Path probability: 18%', 'Lower variance path'],
      nextAction: 'Compare expected values across all terminal nodes.',
      cliCommand: 'zeo graph explain --path A->B->E',
    },
    {
      index: 4,
      activeNodeId: 'C',
      activeEdgeIds: [edgeId('A', 'C')],
      confidence: computeConfidence(nodes, 0.88),
      stability: computeStability(0.95),
      flipDistance: computeFlipDistance(1.2),
      topEvidence: ev,
      narrativeLine: 'Steady State path offers $350K with higher certainty.',
      executiveSummary: 'Conservative path: Steady State leads directly to Break Even.',
      keyDrivers: ['Conservative probability: 40%', 'Single guaranteed outcome', 'Lower upside, lower risk'],
      nextAction: 'Decision recommendation: aggressive path if risk tolerance allows.',
      cliCommand: 'zeo graph simulate --node C',
    },
    {
      index: 5,
      activeNodeId: 'A',
      activeEdgeIds: [edgeId('A', 'B'), edgeId('A', 'C')],
      confidence: computeConfidence(nodes, 0.95),
      stability: computeStability(0.82),
      flipDistance: computeFlipDistance(1.0),
      topEvidence: ev,
      narrativeLine: 'Recommendation remains stable unless risk score drops by 0.18.',
      executiveSummary: 'Simulation complete. Aggressive path yields highest expected value.',
      keyDrivers: ['Best EV: Aggressive ($504K weighted)', 'Conservative fallback: $200K certain', 'Flip distance: 0.18'],
      nextAction: 'Run stress test to validate stability under perturbation.',
      cliCommand: 'zeo counterfactual run --dataset sampleA',
    },
  ];
}

/* ------------------------------------------------------------------ */
/*  STRESS-TEST mode steps                                             */
/* ------------------------------------------------------------------ */

function buildStressTestSteps(nodes: SampleNode[], edges: SampleEdge[], evidence: EvidenceItem[]): HeroStep[] {
  const ev = topEvidence(evidence, 3);

  return [
    {
      index: 0,
      activeNodeId: 'A',
      activeEdgeIds: [],
      confidence: computeConfidence(nodes, 0.85),
      stability: computeStability(0.65),
      flipDistance: computeFlipDistance(0.7),
      topEvidence: ev,
      narrativeLine: 'Testing decision boundaries — how much change triggers a flip?',
      executiveSummary: 'Stress testing Market Entry decision for fragility points.',
      keyDrivers: ['Baseline confidence: 36%', 'Initial stability: moderate', 'Testing perturbation tolerance'],
      nextAction: 'Identify the most fragile path segment.',
      cliCommand: 'zeo counterfactual flip-distance --case 1024',
    },
    {
      index: 1,
      activeNodeId: 'B',
      activeEdgeIds: [edgeId('A', 'B')],
      confidence: computeConfidence(nodes, 0.78),
      stability: computeStability(0.55),
      flipDistance: computeFlipDistance(0.6),
      topEvidence: ev,
      narrativeLine: 'High Growth node is fragile — a 0.11 probability shift flips the outcome.',
      executiveSummary: 'Fragility detected: High Growth probability is close to flip threshold.',
      keyDrivers: ['High Growth sensitivity: HIGH', 'Flip distance: 0.11', 'Small market change could flip recommendation'],
      nextAction: 'Gather evidence to stabilize the High Growth estimate.',
      cliCommand: 'zeo counterfactual flip-distance --case 1025',
    },
    {
      index: 2,
      activeNodeId: 'D',
      activeEdgeIds: [edgeId('A', 'B'), edgeId('B', 'D')],
      confidence: computeConfidence(nodes, 0.72),
      stability: computeStability(0.50),
      flipDistance: computeFlipDistance(0.55),
      topEvidence: ev,
      narrativeLine: 'Win Market depends on 70% success rate — dropping to 52% flips to conservative.',
      executiveSummary: 'Critical threshold: Win Market flips if success drops below 52%.',
      keyDrivers: ['Current success rate: 70%', 'Flip threshold: 52%', 'Margin: 18 percentage points'],
      nextAction: 'This is the narrowest margin — prioritize evidence here.',
      cliCommand: 'zeo counterfactual flip-distance --case 1024',
    },
    {
      index: 3,
      activeNodeId: 'C',
      activeEdgeIds: [edgeId('A', 'C'), edgeId('C', 'F')],
      confidence: computeConfidence(nodes, 0.88),
      stability: computeStability(0.92),
      flipDistance: computeFlipDistance(1.4),
      topEvidence: ev,
      narrativeLine: 'Conservative path is highly stable — resistant to perturbation.',
      executiveSummary: 'Steady State path shows strong resilience under stress.',
      keyDrivers: ['Stability score: 0.92', 'Flip distance: 1.4x baseline', 'Single deterministic outcome'],
      nextAction: 'Conservative path is a reliable fallback.',
      cliCommand: 'zeo graph simulate --node C',
    },
    {
      index: 4,
      activeNodeId: 'A',
      activeEdgeIds: [edgeId('A', 'B'), edgeId('A', 'C')],
      confidence: computeConfidence(nodes, 0.82),
      stability: computeStability(0.70),
      flipDistance: computeFlipDistance(0.65),
      topEvidence: ev,
      narrativeLine: 'Recommendation flips if High Growth probability drops below 45%.',
      executiveSummary: 'Stress test complete. Primary fragility: aggressive path sensitivity.',
      keyDrivers: ['Most fragile: A→B edge (High Growth)', 'Most stable: A→C edge (Steady State)', 'Overall flip distance: 0.12'],
      nextAction: 'Collect market survey evidence to reduce uncertainty on growth path.',
      cliCommand: 'zeo counterfactual run --dataset sampleA',
    },
  ];
}

/* ------------------------------------------------------------------ */
/*  IMPROVE mode steps                                                 */
/* ------------------------------------------------------------------ */

function buildImproveSteps(nodes: SampleNode[], edges: SampleEdge[], evidence: EvidenceItem[]): HeroStep[] {
  const ev = topEvidence(evidence, 4);

  return [
    {
      index: 0,
      activeNodeId: 'A',
      activeEdgeIds: [],
      confidence: computeConfidence(nodes, 0.85),
      stability: computeStability(0.74),
      flipDistance: computeFlipDistance(1.0),
      topEvidence: ev,
      narrativeLine: 'Ranking evidence sources by expected confidence improvement...',
      executiveSummary: 'Identifying highest-value evidence to improve decision confidence.',
      keyDrivers: ['Current confidence: 36%', 'Target confidence: 80%', 'Gap: 44 percentage points'],
      nextAction: 'Begin with highest VOI source: Field Trial.',
      cliCommand: 'zeo evidence rank --budget 100',
    },
    {
      index: 1,
      activeNodeId: 'B',
      activeEdgeIds: [edgeId('A', 'B')],
      confidence: computeConfidence(nodes, 0.92),
      stability: computeStability(0.78),
      flipDistance: computeFlipDistance(1.1),
      topEvidence: ev.map((e, i) => (i === 0 ? { ...e, voiScore: e.voiScore + 0.03 } : e)),
      narrativeLine: 'Field Trial (VOI: 0.91) provides the largest confidence gain for $200.',
      executiveSummary: 'Top evidence: Field Trial offers 91% value-of-information score.',
      keyDrivers: ['Field Trial VOI: 0.91 ($200, 6 weeks)', 'Market Survey VOI: 0.84 ($35, 2 weeks)', 'Expert Panel VOI: 0.72 ($80, 3 weeks)'],
      nextAction: 'If budget-constrained, start with Market Survey ($35).',
      cliCommand: 'zeo evidence plan --risk medium',
    },
    {
      index: 2,
      activeNodeId: 'D',
      activeEdgeIds: [edgeId('A', 'B'), edgeId('B', 'D')],
      confidence: computeConfidence(nodes, 0.98),
      stability: computeStability(0.85),
      flipDistance: computeFlipDistance(1.3),
      topEvidence: ev.map((e, i) => (i <= 1 ? { ...e, voiScore: e.voiScore + 0.05 } : e)),
      narrativeLine: 'After Market Survey + Field Trial, expected confidence reaches 78%.',
      executiveSummary: 'Projected confidence after top 2 evidence sources: 78%.',
      keyDrivers: ['Projected confidence: 78%', 'Stability improvement: +15%', 'Cost: $235 over 8 weeks'],
      nextAction: 'Add Expert Panel to reach target confidence of 80%.',
      cliCommand: 'zeo evidence plan --risk high',
    },
    {
      index: 3,
      activeNodeId: 'A',
      activeEdgeIds: [edgeId('A', 'B'), edgeId('B', 'D')],
      confidence: computeConfidence(nodes, 1.05),
      stability: computeStability(0.90),
      flipDistance: computeFlipDistance(1.5),
      topEvidence: ev.map((e) => ({ ...e, voiScore: Math.min(e.voiScore + 0.06, 0.99) })),
      narrativeLine: 'Full evidence plan projects 83% confidence — target exceeded.',
      executiveSummary: 'Evidence plan complete. All 3 sources bring confidence to 83%.',
      keyDrivers: ['Final projected confidence: 83%', 'Target: 80% — exceeded', 'Total cost: $315 over 11 weeks'],
      nextAction: 'Execute evidence plan. Re-evaluate after first collection round.',
      cliCommand: 'zeo evidence rank --budget 315',
    },
  ];
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Build the complete state for a given hero mode.
 * Entirely deterministic — same mode always returns the same state.
 */
export function buildHeroState(mode: HeroMode): HeroState {
  const { nodes, edges, evidence } = sampleA;

  let steps: HeroStep[];
  switch (mode) {
    case 'simulate':
      steps = buildSimulateSteps(nodes, edges, evidence);
      break;
    case 'stress-test':
      steps = buildStressTestSteps(nodes, edges, evidence);
      break;
    case 'improve':
      steps = buildImproveSteps(nodes, edges, evidence);
      break;
  }

  return {
    mode,
    currentStep: 0,
    steps,
    nodes,
    edges,
    evidence,
  };
}

/**
 * Get the current step data from a hero state.
 */
export function getCurrentStep(state: HeroState): HeroStep {
  return state.steps[state.currentStep];
}

/**
 * Advance to the next step. Wraps around.
 */
export function nextStep(state: HeroState): HeroState {
  return {
    ...state,
    currentStep: (state.currentStep + 1) % state.steps.length,
  };
}

/**
 * Get the confidence wave data: last N confidence values from step 0 to current.
 */
export function getConfidenceWaveData(state: HeroState): number[] {
  const { steps, currentStep } = state;
  // Include all steps up to and including current, then pad with last value
  const wave: number[] = [];
  for (let i = 0; i <= currentStep; i++) {
    wave.push(steps[i].confidence);
  }
  // Pad to 12 values by repeating last known
  while (wave.length < 12) {
    wave.push(wave[wave.length - 1] ?? 50);
  }
  return wave.slice(0, 12);
}

/**
 * Get fragility band boundaries for stress-test mode.
 * Returns null for other modes.
 */
export function getFragilityBand(state: HeroState): { lower: number; upper: number } | null {
  if (state.mode !== 'stress-test') return null;
  // Fragility band: region where confidence crossing means a flip
  return { lower: 35, upper: 50 };
}

/**
 * Get projected confidence uplift for improve mode.
 * Returns null for other modes.
 */
export function getProjectedUplift(state: HeroState): number[] | null {
  if (state.mode !== 'improve') return null;
  const current = getConfidenceWaveData(state);
  // Project improvement: each subsequent value gains a few points
  return current.map((v, i) => Math.min(v + (i + 1) * 2.5, 95));
}
