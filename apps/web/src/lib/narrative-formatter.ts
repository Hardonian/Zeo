/**
 * Narrative Formatter — transforms CLI results into human-readable narratives.
 *
 * Converts raw CLI output lines into structured, plain-English explanations.
 * Lead with explanation, then confidence, then suggested action.
 */

import { IntentKey } from './intent-router';
import type { CLIResult, OutputLine } from './cli-engine';

export interface NarrativeResult {
  summary: string;
  keyDrivers: string[];
  recommendedAction: string;
  confidenceNote: string;
  numericBreakdown?: Record<string, string>;
}

/** Extract key-value pairs from CLI output lines (e.g., "Label: value"). */
function extractKeyValues(lines: OutputLine[]): Record<string, string> {
  const kv: Record<string, string> = {};
  for (const line of lines) {
    const match = line.text.match(/^\s*(.+?):\s+(.+)$/);
    if (match) {
      kv[match[1].trim()] = match[2].trim();
    }
  }
  return kv;
}

/** Extract numeric values from output for breakdown. */
function extractNumericBreakdown(lines: OutputLine[]): Record<string, string> {
  const breakdown: Record<string, string> = {};
  for (const line of lines) {
    const match = line.text.match(/^\s*(.+?):\s+([-\d$.%]+.*)$/);
    if (match && /\d/.test(match[2])) {
      breakdown[match[1].trim()] = match[2].trim();
    }
  }
  return breakdown;
}

function formatFlipDistance(results: CLIResult[]): NarrativeResult {
  const result = results[0];
  const kv = extractKeyValues(result.lines);
  const breakdown = extractNumericBreakdown(result.lines);

  const riskChange = kv['Required Variable Change'] || 'unknown amount';
  const caseLabel = kv['Label'] || 'this case';
  const currentRisk = kv['Current Risk Score'] || 'unknown';
  const interventionCost = kv['Minimum Intervention Cost'] || 'unknown';

  return {
    summary: `This recommendation would change if the risk score shifted by ${riskChange.replace('Risk Score ', '')}. ` +
      `For "${caseLabel}", the current risk score is ${currentRisk}. ` +
      `The lowest-cost intervention is estimated at ${interventionCost}.`,
    keyDrivers: [
      `Risk Score is the primary variable — a change of ${riskChange.replace('Risk Score ', '')} would flip the outcome`,
      `Current risk level: ${currentRisk}`,
      interventionCost !== 'unknown' ? `Minimum intervention cost: ${interventionCost}` : '',
    ].filter(Boolean),
    recommendedAction: 'Focus on variables closest to the flip threshold. Small improvements to the dominant risk factor yield the highest impact.',
    confidenceNote: 'Overall stability is moderate. The flip distance is relatively small, meaning the decision is sensitive to changes in key inputs.',
    numericBreakdown: breakdown,
  };
}

function formatCounterfactualRun(results: CLIResult[]): NarrativeResult {
  const result = results[0];
  const successLine = result.lines.find(l => l.style === 'success');
  const caseCount = successLine?.text.match(/(\d+) cases/)?.[1] || 'multiple';
  const breakdown = extractNumericBreakdown(result.lines);

  return {
    summary: `Counterfactual analysis completed across ${caseCount} cases. ` +
      'Each case shows the risk profile, cost, probability, and outcome classification under the current decision model.',
    keyDrivers: [
      'Risk scores range across the portfolio, indicating diverse risk profiles',
      'Probability estimates span from conservative to high-confidence',
      'Outcome classifications include approve, defer, and reject actions',
    ],
    recommendedAction: 'Review cases with high risk scores and low probability — these are the most uncertain decisions. Consider running flip-distance analysis on borderline cases.',
    confidenceNote: 'Analysis is deterministic and reproducible. Results reflect the static decision model applied to the sample dataset.',
    numericBreakdown: breakdown,
  };
}

function formatEvidenceRank(results: CLIResult[]): NarrativeResult {
  const result = results[0];
  const kv = extractKeyValues(result.lines);
  const breakdown = extractNumericBreakdown(result.lines);
  const budgetInfo = kv['Budget'] || '';

  // Find selected items from output
  const selectedLines = result.lines.filter(l => l.text.includes('SELECTED'));
  const selectedCount = selectedLines.length;

  return {
    summary: `Evidence sources ranked by value-of-information. ${selectedCount} sources selected within the budget constraint. ` +
      (budgetInfo ? `Budget allocation: ${budgetInfo}.` : ''),
    keyDrivers: [
      'Field Trial has the highest VOI score but also the highest cost',
      'Market Survey and Historical Analysis offer the best cost-efficiency',
      'Budget constraints determine which high-value sources are feasible',
    ],
    recommendedAction: 'Start with the highest-ranked affordable evidence sources. If budget allows, the Field Trial offers the single largest information gain.',
    confidenceNote: 'Rankings are based on expected value-of-information scores. Actual information gain depends on evidence quality and relevance to your specific decision context.',
    numericBreakdown: breakdown,
  };
}

function formatEvidencePlan(results: CLIResult[]): NarrativeResult {
  const result = results[0];
  const kv = extractKeyValues(result.lines);
  const breakdown = extractNumericBreakdown(result.lines);
  const timeline = kv['Expected Timeline'] || 'varies by risk level';
  const targetConf = kv['Target Confidence'] || 'depends on risk level';

  const actionLines = result.lines.filter(l => l.text.match(/^\s+\d+\./));
  const actions = actionLines.map(l => l.text.trim());

  return {
    summary: `Evidence collection plan generated with ${actions.length} recommended actions. ` +
      `Expected timeline: ${timeline}. Target confidence: ${targetConf}.`,
    keyDrivers: actions.length > 0
      ? actions.map(a => a.replace(/^\d+\.\s*/, ''))
      : ['Plan actions depend on the selected risk level'],
    recommendedAction: `Execute the plan sequentially. Start with low-cost, high-impact actions. Review confidence after each phase before proceeding to the next.`,
    confidenceNote: `Targeting ${targetConf} confidence within ${timeline}. Actual confidence gains depend on evidence quality and decision complexity.`,
    numericBreakdown: breakdown,
  };
}

function formatGraphSimulate(results: CLIResult[]): NarrativeResult {
  const result = results[0];
  const kv = extractKeyValues(result.lines);
  const breakdown = extractNumericBreakdown(result.lines);
  const ev = kv['Expected Value'] || 'calculated';
  const nodeType = kv['Node Type'] || 'unknown';

  return {
    summary: `Decision graph simulation complete. The expected value from this node is ${ev}. ` +
      `This is a ${nodeType} node with downstream paths leading to different outcomes.`,
    keyDrivers: [
      `Expected Value: ${ev} — this represents the probability-weighted outcome`,
      `Node type: ${nodeType} — ${nodeType === 'decision' ? 'you control this choice' : nodeType === 'chance' ? 'outcome depends on probability' : 'this is a terminal outcome'}`,
      'Downstream paths carry different weights and lead to different terminal values',
    ],
    recommendedAction: 'Compare expected values across alternative paths. The highest-EV path is not always the safest — consider the variance and worst-case outcomes.',
    confidenceNote: 'Simulation uses the decision graph structure with fixed probabilities. Real-world outcomes may differ if probabilities shift.',
    numericBreakdown: breakdown,
  };
}

function formatGraphExplain(results: CLIResult[]): NarrativeResult {
  const result = results[0];
  const kv = extractKeyValues(result.lines);
  const breakdown = extractNumericBreakdown(result.lines);
  const cumulativeProb = kv['Cumulative Probability'] || 'calculated';
  const terminalValue = kv['Terminal Value'] || 'unknown';

  return {
    summary: `Path breakdown complete. Cumulative probability along this path: ${cumulativeProb}. ` +
      `Terminal value: ${terminalValue}.`,
    keyDrivers: [
      `Cumulative probability: ${cumulativeProb} — each step multiplies the path probability`,
      `Terminal value: ${terminalValue}`,
      'Each edge in the path carries a weight representing transition likelihood',
    ],
    recommendedAction: 'Compare this path with alternatives. A high-probability path to a moderate value may be preferable to a low-probability path to a high value.',
    confidenceNote: 'Path probabilities are multiplicative. Small changes in individual edge weights compound along the path.',
    numericBreakdown: breakdown,
  };
}

function formatRegretPlan(results: CLIResult[]): NarrativeResult {
  // Regret plan combines evidence plan + evidence rank
  const planNarrative = results.length > 0 ? formatEvidencePlan([results[0]]) : null;
  const rankNarrative = results.length > 1 ? formatEvidenceRank([results[1]]) : null;

  return {
    summary: 'Regret minimization analysis complete. ' +
      (planNarrative ? planNarrative.summary : 'Evidence collection plan generated.') +
      ' Combined with evidence ranking to identify the safest path forward.',
    keyDrivers: [
      'The safest move prioritizes low-risk evidence collection before major commitments',
      ...(planNarrative ? planNarrative.keyDrivers.slice(0, 2) : []),
      ...(rankNarrative ? ['Top evidence sources identified to support risk mitigation'] : []),
    ],
    recommendedAction: 'Start with the conservative evidence plan. Use the evidence ranking to prioritize which sources to collect first. Re-evaluate after each round.',
    confidenceNote: 'Regret minimization favors actions that perform reasonably well across all scenarios, not just the most likely one.',
  };
}

function formatActiveLearning(results: CLIResult[]): NarrativeResult {
  const rankNarrative = results.length > 0 ? formatEvidenceRank([results[0]]) : null;
  const planNarrative = results.length > 1 ? formatEvidencePlan([results[1]]) : null;

  return {
    summary: 'Active learning strategy generated. ' +
      'The plan identifies the most informative evidence to collect first, creating an iterative improvement loop.',
    keyDrivers: [
      'Start with highest-VOI evidence sources for maximum learning per dollar',
      ...(rankNarrative ? rankNarrative.keyDrivers.slice(0, 1) : []),
      ...(planNarrative ? ['Follow the structured collection plan for systematic improvement'] : []),
      'Re-evaluate priorities after each evidence round — the optimal next step may shift',
    ],
    recommendedAction: 'Collect evidence iteratively. After each round, re-run the analysis to see if priorities have shifted. Stop when additional evidence no longer changes the decision.',
    confidenceNote: 'Active learning converges faster than random evidence collection. Expect the biggest confidence gains in the first 2-3 rounds.',
  };
}

function formatDefault(results: CLIResult[]): NarrativeResult {
  const allLines = results.flatMap(r => r.lines);
  const breakdown = extractNumericBreakdown(allLines);
  const successLines = allLines.filter(l => l.style === 'success').map(l => l.text);

  return {
    summary: 'Analysis complete. ' + (successLines.length > 0 ? successLines.join(' ') : 'Review the technical details below for full output.'),
    keyDrivers: ['See technical details for complete output'],
    recommendedAction: 'Review the detailed output and identify the most relevant metrics for your decision.',
    confidenceNote: 'All analysis is deterministic and reproducible.',
    numericBreakdown: breakdown,
  };
}

/**
 * Format CLI results into a human-readable narrative.
 *
 * Routes to intent-specific formatters for tailored explanations.
 */
export function formatNarrative(intent: IntentKey, results: CLIResult[]): NarrativeResult {
  if (results.length === 0 || results.every(r => !r.ok)) {
    const errorLines = results.flatMap(r => r.lines).filter(l => l.style === 'error');
    return {
      summary: 'The analysis could not be completed.',
      keyDrivers: errorLines.map(l => l.text),
      recommendedAction: 'Check the input and try again. See suggested prompts for examples.',
      confidenceNote: 'No results available.',
    };
  }

  switch (intent) {
    case IntentKey.FLIP_DISTANCE:
      return formatFlipDistance(results);
    case IntentKey.COUNTERFACTUAL_RUN:
      return formatCounterfactualRun(results);
    case IntentKey.EVIDENCE_RANK:
      return formatEvidenceRank(results);
    case IntentKey.EVIDENCE_PLAN:
      return formatEvidencePlan(results);
    case IntentKey.GRAPH_SIMULATE:
      return formatGraphSimulate(results);
    case IntentKey.GRAPH_EXPLAIN:
      return formatGraphExplain(results);
    case IntentKey.REGRET_PLAN:
      return formatRegretPlan(results);
    case IntentKey.ACTIVE_LEARNING_PLAN:
      return formatActiveLearning(results);
    default:
      return formatDefault(results);
  }
}
