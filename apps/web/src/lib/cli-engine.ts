/**
 * Deterministic CLI command engine for Web CLI demo sandboxes.
 * Pure TypeScript — no backend, no randomness, no async dependencies.
 */

import { getDataset, sampleA } from './sample-data';
import type { SampleDataset, SampleCase, SampleNode, SampleEdge } from './sample-data';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ParsedCommand {
  raw: string;
  program: string;       // "zeo"
  domain: string;        // "counterfactual" | "evidence" | "graph" | ...
  action: string;        // "run" | "flip-distance" | "rank" | ...
  flags: Record<string, string>;
}

export type LineStyle = 'default' | 'header' | 'success' | 'error' | 'dim' | 'info' | 'table-header' | 'table-row' | 'separator';

export interface OutputLine {
  text: string;
  style: LineStyle;
}

export interface CLIResult {
  ok: boolean;
  lines: OutputLine[];
}

/* ------------------------------------------------------------------ */
/*  Parser                                                             */
/* ------------------------------------------------------------------ */

export function parseCommand(input: string): ParsedCommand {
  const trimmed = input.trim();
  const tokens = trimmed.split(/\s+/);

  const program = tokens[0] || '';
  const domain = tokens[1] || '';
  const action = tokens[2] || '';

  const flags: Record<string, string> = {};
  for (let i = 3; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.startsWith('--') && i + 1 < tokens.length) {
      flags[token.slice(2)] = tokens[i + 1];
      i++;
    }
  }

  return { raw: trimmed, program, domain, action, flags };
}

/* ------------------------------------------------------------------ */
/*  Table helpers                                                      */
/* ------------------------------------------------------------------ */

function padRight(s: string, len: number): string {
  if (s.length >= len) return s.slice(0, len);
  return s + ' '.repeat(len - s.length);
}

function separator(width: number): OutputLine {
  return { text: '-'.repeat(width), style: 'separator' };
}

function tableHeader(cols: { label: string; width: number }[]): OutputLine[] {
  const headerLine = cols.map(c => padRight(c.label, c.width)).join('  ');
  const sepLine = cols.map(c => '-'.repeat(c.width)).join('  ');
  return [
    { text: headerLine, style: 'table-header' },
    { text: sepLine, style: 'separator' },
  ];
}

function tableRow(cols: { value: string; width: number }[]): OutputLine {
  return { text: cols.map(c => padRight(c.value, c.width)).join('  '), style: 'table-row' };
}

/* ------------------------------------------------------------------ */
/*  Command handlers — Counterfactual                                  */
/* ------------------------------------------------------------------ */

function handleCounterfactualRun(flags: Record<string, string>): CLIResult {
  const datasetName = flags['dataset'] || 'sampleA';
  const dataset = getDataset(datasetName);

  if (!dataset) {
    return {
      ok: false,
      lines: [
        { text: `Error: dataset "${datasetName}" not found`, style: 'error' },
        { text: 'Available datasets: sampleA, sampleB', style: 'dim' },
      ],
    };
  }

  const lines: OutputLine[] = [
    { text: `Counterfactual Analysis — ${dataset.name}`, style: 'header' },
    { text: dataset.description, style: 'dim' },
    separator(62),
    { text: '', style: 'default' },
    ...tableHeader([
      { label: 'ID', width: 6 },
      { label: 'Label', width: 16 },
      { label: 'Risk', width: 8 },
      { label: 'Cost', width: 8 },
      { label: 'Prob', width: 8 },
      { label: 'Outcome', width: 10 },
    ]),
    ...dataset.cases.map(c => tableRow([
      { value: String(c.id), width: 6 },
      { value: c.label, width: 16 },
      { value: c.riskScore.toFixed(2), width: 8 },
      { value: '$' + c.cost, width: 8 },
      { value: (c.probability * 100).toFixed(0) + '%', width: 8 },
      { value: c.outcome, width: 10 },
    ])),
    { text: '', style: 'default' },
    { text: `${dataset.cases.length} cases analyzed. Deterministic run complete.`, style: 'success' },
  ];

  return { ok: true, lines };
}

function handleCounterfactualFlipDistance(flags: Record<string, string>): CLIResult {
  const caseId = parseInt(flags['case'] || '0', 10);

  // Search all datasets for the case
  let found: { c: SampleCase; ds: SampleDataset } | undefined;
  for (const ds of [sampleA, getDataset('sampleB')!]) {
    const c = ds.cases.find(x => x.id === caseId);
    if (c) { found = { c, ds }; break; }
  }

  if (!found) {
    return {
      ok: false,
      lines: [
        { text: `Error: case ${caseId} not found`, style: 'error' },
        { text: 'Try: --case 1024, --case 1025, --case 2048', style: 'dim' },
      ],
    };
  }

  const { c, ds } = found;
  const flipDelta = -(c.riskScore * 0.29).toFixed(2);
  const interventionCost = Math.round(c.cost * 0.1);
  const confidenceShift = Math.round(c.probability * 17);

  return {
    ok: true,
    lines: [
      separator(50),
      { text: 'Flip Distance Report', style: 'header' },
      separator(50),
      { text: `Case ID:                   ${c.id}`, style: 'default' },
      { text: `Label:                     ${c.label}`, style: 'default' },
      { text: `Dataset:                   ${ds.name}`, style: 'default' },
      { text: `Current Risk Score:        ${c.riskScore.toFixed(2)}`, style: 'default' },
      { text: `Required Variable Change:  Risk Score ${flipDelta}`, style: 'info' },
      { text: `Minimum Intervention Cost: ${interventionCost}`, style: 'info' },
      { text: `Confidence Shift:          +${confidenceShift}%`, style: 'success' },
      { text: `Current Outcome:           ${c.outcome}`, style: 'default' },
      separator(50),
      { text: '', style: 'default' },
      { text: 'Interpretation: The decision flips if the risk score', style: 'dim' },
      { text: `changes by ${flipDelta}. This is the minimum perturbation`, style: 'dim' },
      { text: 'needed to alter the outcome classification.', style: 'dim' },
    ],
  };
}

/* ------------------------------------------------------------------ */
/*  Command handlers — Evidence                                        */
/* ------------------------------------------------------------------ */

function handleEvidenceRank(flags: Record<string, string>): CLIResult {
  const budget = parseInt(flags['budget'] || '100', 10);

  interface RankedItem {
    source: string;
    voiScore: number;
    cost: number;
    feasible: boolean;
    selected: boolean;
  }

  const evidenceItems = [
    { source: 'Market Survey', voiScore: 0.84, cost: 35, feasible: true },
    { source: 'Expert Panel', voiScore: 0.72, cost: 80, feasible: true },
    { source: 'Historical Analysis', voiScore: 0.68, cost: 20, feasible: true },
    { source: 'Field Trial', voiScore: 0.91, cost: 200, feasible: true },
    { source: 'Competitor Audit', voiScore: 0.55, cost: 45, feasible: true },
    { source: 'Regression Model', voiScore: 0.63, cost: 15, feasible: true },
  ];

  const sorted = [...evidenceItems].sort((a, b) => b.voiScore - a.voiScore);
  let remaining = budget;
  const selected: RankedItem[] = sorted.map(item => {
    const sel = item.cost <= remaining;
    if (sel) remaining -= item.cost;
    return { ...item, selected: sel, feasible: item.cost <= budget };
  });

  return {
    ok: true,
    lines: [
      { text: `Evidence Ranking — Budget: $${budget}`, style: 'header' },
      separator(64),
      { text: '', style: 'default' },
      ...tableHeader([
        { label: 'Rank', width: 5 },
        { label: 'Source', width: 20 },
        { label: 'VOI', width: 8 },
        { label: 'Cost', width: 8 },
        { label: 'Status', width: 12 },
      ]),
      ...selected.map((item, i) => tableRow([
        { value: `#${i + 1}`, width: 5 },
        { value: item.source, width: 20 },
        { value: item.voiScore.toFixed(2), width: 8 },
        { value: '$' + item.cost, width: 8 },
        { value: item.selected ? 'SELECTED' : (item.feasible ? 'over-budget' : 'infeasible'), width: 12 },
      ])),
      { text: '', style: 'default' },
      { text: `Budget: $${budget} | Spent: $${budget - remaining} | Remaining: $${remaining}`, style: 'info' },
      { text: `${selected.filter(s => s.selected).length} of ${selected.length} evidence sources selected.`, style: 'success' },
    ],
  };
}

function handleEvidencePlan(flags: Record<string, string>): CLIResult {
  const risk = flags['risk'] || 'low';
  const validRisk = ['low', 'medium', 'high'].includes(risk);

  if (!validRisk) {
    return {
      ok: false,
      lines: [
        { text: `Error: invalid risk level "${risk}"`, style: 'error' },
        { text: 'Valid levels: low, medium, high', style: 'dim' },
      ],
    };
  }

  const plans: Record<string, { actions: string[]; timeline: string; confidence: string }> = {
    low: {
      actions: [
        'Collect existing internal reports',
        'Run desk research on comparable decisions',
        'Validate assumptions with 2 stakeholders',
      ],
      timeline: '1-2 weeks',
      confidence: '70-80%',
    },
    medium: {
      actions: [
        'Commission market survey (n=200)',
        'Conduct expert panel (3 domain experts)',
        'Run historical regression analysis',
        'Perform sensitivity analysis on top 3 variables',
      ],
      timeline: '3-5 weeks',
      confidence: '80-90%',
    },
    high: {
      actions: [
        'Full field trial with control group',
        'Independent external audit',
        'Monte Carlo simulation (10k iterations)',
        'Adversarial red-team review',
        'Stakeholder validation across all departments',
      ],
      timeline: '6-12 weeks',
      confidence: '90-97%',
    },
  };

  const plan = plans[risk];

  return {
    ok: true,
    lines: [
      { text: `Evidence Collection Plan — Risk: ${risk.toUpperCase()}`, style: 'header' },
      separator(50),
      { text: '', style: 'default' },
      { text: 'Recommended Actions:', style: 'info' },
      ...plan.actions.map((a, i) => ({
        text: `  ${i + 1}. ${a}`,
        style: 'default' as LineStyle,
      })),
      { text: '', style: 'default' },
      { text: `Expected Timeline:  ${plan.timeline}`, style: 'default' },
      { text: `Target Confidence:  ${plan.confidence}`, style: 'success' },
      separator(50),
    ],
  };
}

/* ------------------------------------------------------------------ */
/*  Command handlers — Graph                                           */
/* ------------------------------------------------------------------ */

function handleGraphSimulate(flags: Record<string, string>): CLIResult {
  const nodeId = flags['node'] || 'A';
  const dataset = sampleA;
  const node = dataset.nodes.find(n => n.id === nodeId);

  if (!node) {
    return {
      ok: false,
      lines: [
        { text: `Error: node "${nodeId}" not found in graph`, style: 'error' },
        { text: `Available nodes: ${dataset.nodes.map(n => n.id).join(', ')}`, style: 'dim' },
      ],
    };
  }

  const outEdges = dataset.edges.filter(e => e.from === nodeId);

  function computeEV(n: SampleNode): number {
    if (n.children.length === 0) return n.value * n.probability;
    const children = dataset.nodes.filter(ch => n.children.includes(ch.id));
    return children.reduce((sum, ch) => sum + computeEV(ch), 0);
  }

  const ev = computeEV(node);

  return {
    ok: true,
    lines: [
      { text: `Graph Simulation — Node ${node.id}: ${node.label}`, style: 'header' },
      separator(55),
      { text: '', style: 'default' },
      { text: `Node Type:       ${node.type}`, style: 'default' },
      { text: `Probability:     ${(node.probability * 100).toFixed(0)}%`, style: 'default' },
      { text: `Direct Value:    ${node.value}`, style: 'default' },
      { text: `Expected Value:  ${ev.toFixed(1)}`, style: 'info' },
      { text: '', style: 'default' },
      ...(node.children.length > 0
        ? [
            { text: 'Downstream Paths:', style: 'info' as LineStyle },
            ...tableHeader([
              { label: 'Edge', width: 16 },
              { label: 'Target', width: 16 },
              { label: 'Weight', width: 8 },
              { label: 'Type', width: 10 },
            ]),
            ...outEdges.map(e => {
              const target = dataset.nodes.find(n => n.id === e.to);
              return tableRow([
                { value: `${e.from} -> ${e.to}`, width: 16 },
                { value: target?.label || e.to, width: 16 },
                { value: e.weight.toFixed(2), width: 8 },
                { value: target?.type || 'unknown', width: 10 },
              ]);
            }),
          ]
        : [{ text: 'This is a terminal (outcome) node.', style: 'dim' as LineStyle }]),
      { text: '', style: 'default' },
      { text: `Simulation complete. EV = ${ev.toFixed(1)}`, style: 'success' },
    ],
  };
}

function handleGraphExplain(flags: Record<string, string>): CLIResult {
  const pathStr = flags['path'] || '';
  const nodeIds = pathStr.split('->').map(s => s.trim());
  const dataset = sampleA;

  if (nodeIds.length < 2) {
    return {
      ok: false,
      lines: [
        { text: 'Error: path must contain at least 2 nodes (e.g., B->D)', style: 'error' },
        { text: 'Separate nodes with -> (e.g., A->B->D)', style: 'dim' },
      ],
    };
  }

  const nodes: SampleNode[] = [];
  const edges: SampleEdge[] = [];
  let valid = true;

  for (const id of nodeIds) {
    const n = dataset.nodes.find(nd => nd.id === id);
    if (!n) { valid = false; break; }
    nodes.push(n);
  }

  if (!valid) {
    return {
      ok: false,
      lines: [
        { text: `Error: invalid node in path "${pathStr}"`, style: 'error' },
        { text: `Available nodes: ${dataset.nodes.map(n => n.id).join(', ')}`, style: 'dim' },
      ],
    };
  }

  for (let i = 0; i < nodeIds.length - 1; i++) {
    const e = dataset.edges.find(ed => ed.from === nodeIds[i] && ed.to === nodeIds[i + 1]);
    if (!e) { valid = false; break; }
    edges.push(e);
  }

  if (!valid) {
    return {
      ok: false,
      lines: [
        { text: `Error: no direct edge exists for part of path "${pathStr}"`, style: 'error' },
        { text: 'Check available edges in the graph.', style: 'dim' },
      ],
    };
  }

  const cumulativeProb = edges.reduce((p, e) => p * e.weight, 1);
  const terminalNode = nodes[nodes.length - 1];

  return {
    ok: true,
    lines: [
      { text: `Path Explanation: ${pathStr}`, style: 'header' },
      separator(55),
      { text: '', style: 'default' },
      { text: 'Step-by-step breakdown:', style: 'info' },
      { text: '', style: 'default' },
      ...nodes.map((n, i) => {
        const parts: OutputLine[] = [
          { text: `  [${n.id}] ${n.label} (${n.type})`, style: 'default' },
        ];
        if (i < edges.length) {
          parts.push({
            text: `      └─ "${edges[i].label}" (weight: ${edges[i].weight.toFixed(2)}) ──▶`,
            style: 'dim',
          });
        }
        return parts;
      }).flat(),
      { text: '', style: 'default' },
      separator(55),
      { text: `Cumulative Probability:  ${(cumulativeProb * 100).toFixed(1)}%`, style: 'info' },
      { text: `Terminal Value:           ${terminalNode.value}`, style: 'default' },
      { text: `Expected Contribution:   ${(cumulativeProb * terminalNode.value).toFixed(1)}`, style: 'success' },
      separator(55),
    ],
  };
}

/* ------------------------------------------------------------------ */
/*  Command handlers — Uncertainty                                     */
/* ------------------------------------------------------------------ */

function handleUncertaintyTrack(flags: Record<string, string>): CLIResult {
  const datasetName = flags['dataset'] || 'sampleA';
  const dataset = getDataset(datasetName);

  if (!dataset) {
    return {
      ok: false,
      lines: [
        { text: `Error: dataset "${datasetName}" not found`, style: 'error' },
        { text: 'Available datasets: sampleA, sampleB', style: 'dim' },
      ],
    };
  }

  return {
    ok: true,
    lines: [
      { text: `Uncertainty Ledger — ${dataset.name}`, style: 'header' },
      { text: dataset.description, style: 'dim' },
      separator(72),
      { text: '', style: 'default' },
      ...tableHeader([
        { label: 'ID', width: 6 },
        { label: 'Label', width: 16 },
        { label: 'Conf', width: 8 },
        { label: 'Lower', width: 8 },
        { label: 'Upper', width: 8 },
        { label: 'Width', width: 8 },
        { label: 'Grade', width: 8 },
      ]),
      ...dataset.cases.map(c => {
        const width = c.probability * 0.15;
        const lower = c.probability - width;
        const upper = c.probability + width;
        const grade = c.probability >= 0.85 ? 'A' : c.probability >= 0.7 ? 'B' : c.probability >= 0.5 ? 'C' : 'D';
        return tableRow([
          { value: String(c.id), width: 6 },
          { value: c.label, width: 16 },
          { value: (c.probability * 100).toFixed(0) + '%', width: 8 },
          { value: (lower * 100).toFixed(0) + '%', width: 8 },
          { value: (upper * 100).toFixed(0) + '%', width: 8 },
          { value: (width * 200).toFixed(1) + '%', width: 8 },
          { value: grade, width: 8 },
        ]);
      }),
      { text: '', style: 'default' },
      { text: `${dataset.cases.length} cases tracked. All intervals deterministic.`, style: 'success' },
    ],
  };
}

function handleUncertaintyCalibrate(flags: Record<string, string>): CLIResult {
  const caseId = parseInt(flags['case'] || '0', 10);

  let found: { c: SampleCase; ds: SampleDataset } | undefined;
  for (const ds of [sampleA, getDataset('sampleB')!]) {
    const c = ds.cases.find(x => x.id === caseId);
    if (c) { found = { c, ds }; break; }
  }

  if (!found) {
    return {
      ok: false,
      lines: [
        { text: `Error: case ${caseId} not found`, style: 'error' },
        { text: 'Try: --case 1024, --case 1025, --case 2048', style: 'dim' },
      ],
    };
  }

  const { c, ds } = found;
  const brier = ((1 - c.probability) ** 2 * 0.5 + c.probability ** 2 * 0.5).toFixed(4);
  const calibrationError = Math.abs(c.probability - (c.outcome === 'approve' ? 0.8 : c.outcome === 'defer' ? 0.5 : 0.2)).toFixed(3);
  const sharpness = (c.probability * (1 - c.probability)).toFixed(3);

  return {
    ok: true,
    lines: [
      separator(50),
      { text: 'Calibration Report', style: 'header' },
      separator(50),
      { text: `Case ID:              ${c.id}`, style: 'default' },
      { text: `Label:                ${c.label}`, style: 'default' },
      { text: `Dataset:              ${ds.name}`, style: 'default' },
      { text: `Stated Probability:   ${(c.probability * 100).toFixed(0)}%`, style: 'default' },
      { text: `Observed Outcome:     ${c.outcome}`, style: 'default' },
      { text: '', style: 'default' },
      { text: 'Calibration Metrics:', style: 'info' },
      { text: `  Brier Score:          ${brier}`, style: 'default' },
      { text: `  Calibration Error:    ${calibrationError}`, style: 'default' },
      { text: `  Sharpness:            ${sharpness}`, style: 'default' },
      { text: '', style: 'default' },
      { text: parseFloat(calibrationError) < 0.15 ? 'Well-calibrated for this case.' : 'Calibration could be improved.', style: parseFloat(calibrationError) < 0.15 ? 'success' : 'info' },
      separator(50),
    ],
  };
}

function handleUncertaintyRange(flags: Record<string, string>): CLIResult {
  const caseId = parseInt(flags['case'] || '0', 10);

  let found: { c: SampleCase; ds: SampleDataset } | undefined;
  for (const ds of [sampleA, getDataset('sampleB')!]) {
    const c = ds.cases.find(x => x.id === caseId);
    if (c) { found = { c, ds }; break; }
  }

  if (!found) {
    return {
      ok: false,
      lines: [
        { text: `Error: case ${caseId} not found`, style: 'error' },
        { text: 'Try: --case 1024, --case 1025, --case 2048', style: 'dim' },
      ],
    };
  }

  const { c, ds } = found;
  const ci50w = c.probability * 0.08;
  const ci80w = c.probability * 0.13;
  const ci95w = c.probability * 0.18;

  return {
    ok: true,
    lines: [
      { text: `Confidence Interval Breakdown — Case ${c.id}`, style: 'header' },
      separator(52),
      { text: `Label:   ${c.label}`, style: 'default' },
      { text: `Dataset: ${ds.name}`, style: 'dim' },
      { text: '', style: 'default' },
      ...tableHeader([
        { label: 'Interval', width: 12 },
        { label: 'Lower', width: 10 },
        { label: 'Point', width: 10 },
        { label: 'Upper', width: 10 },
      ]),
      tableRow([
        { value: '50% CI', width: 12 },
        { value: ((c.probability - ci50w) * 100).toFixed(1) + '%', width: 10 },
        { value: (c.probability * 100).toFixed(1) + '%', width: 10 },
        { value: ((c.probability + ci50w) * 100).toFixed(1) + '%', width: 10 },
      ]),
      tableRow([
        { value: '80% CI', width: 12 },
        { value: ((c.probability - ci80w) * 100).toFixed(1) + '%', width: 10 },
        { value: (c.probability * 100).toFixed(1) + '%', width: 10 },
        { value: ((c.probability + ci80w) * 100).toFixed(1) + '%', width: 10 },
      ]),
      tableRow([
        { value: '95% CI', width: 12 },
        { value: ((c.probability - ci95w) * 100).toFixed(1) + '%', width: 10 },
        { value: (c.probability * 100).toFixed(1) + '%', width: 10 },
        { value: ((c.probability + ci95w) * 100).toFixed(1) + '%', width: 10 },
      ]),
      { text: '', style: 'default' },
      { text: `Interval widths are proportional to base probability.`, style: 'dim' },
      { text: `All intervals are deterministic and reproducible.`, style: 'success' },
    ],
  };
}

function handleUncertaintyHistory(flags: Record<string, string>): CLIResult {
  const datasetName = flags['dataset'] || 'sampleA';
  const dataset = getDataset(datasetName);

  if (!dataset) {
    return {
      ok: false,
      lines: [
        { text: `Error: dataset "${datasetName}" not found`, style: 'error' },
        { text: 'Available datasets: sampleA, sampleB', style: 'dim' },
      ],
    };
  }

  // Deterministic history: simulate 3 revision rounds per case
  const lines: OutputLine[] = [
    { text: `Belief-State History — ${dataset.name}`, style: 'header' },
    separator(62),
    { text: '', style: 'default' },
  ];

  for (const c of dataset.cases.slice(0, 3)) {
    const p0 = c.probability * 0.85;
    const p1 = c.probability * 0.93;
    const p2 = c.probability;

    lines.push(
      { text: `Case ${c.id}: ${c.label}`, style: 'info' },
      { text: `  Rev 0:  ${(p0 * 100).toFixed(0)}%  (initial prior)`, style: 'default' },
      { text: `  Rev 1:  ${(p1 * 100).toFixed(0)}%  (after evidence round 1)`, style: 'default' },
      { text: `  Rev 2:  ${(p2 * 100).toFixed(0)}%  (after evidence round 2)`, style: 'default' },
      { text: `  Delta:  +${((p2 - p0) * 100).toFixed(0)}pp over 2 revisions`, style: 'success' },
      { text: '', style: 'default' },
    );
  }

  lines.push(
    { text: `Showing 3 of ${dataset.cases.length} cases. All revisions deterministic.`, style: 'dim' },
  );

  return { ok: true, lines };
}

/* ------------------------------------------------------------------ */
/*  Command handlers — Epistemic                                       */
/* ------------------------------------------------------------------ */

function handleEpistemicTranslate(flags: Record<string, string>): CLIResult {
  const from = flags['from'] || '';
  const to = flags['to'] || '';
  const validFrameworks = ['bayesian', 'frequentist', 'qualitative', 'quantitative'];

  if (!validFrameworks.includes(from) || !validFrameworks.includes(to)) {
    return {
      ok: false,
      lines: [
        { text: `Error: invalid framework "${!validFrameworks.includes(from) ? from : to}"`, style: 'error' },
        { text: `Valid frameworks: ${validFrameworks.join(', ')}`, style: 'dim' },
      ],
    };
  }

  if (from === to) {
    return {
      ok: false,
      lines: [
        { text: `Error: source and target frameworks are the same`, style: 'error' },
        { text: 'Pick two different frameworks to translate between.', style: 'dim' },
      ],
    };
  }

  const translations: Record<string, Record<string, { concept: string; mapped: string }[]>> = {
    bayesian: {
      frequentist: [
        { concept: 'Prior probability', mapped: 'Base rate / null hypothesis' },
        { concept: 'Posterior probability', mapped: 'p-value complement (1-p)' },
        { concept: 'Likelihood', mapped: 'Test statistic distribution' },
        { concept: 'Credible interval', mapped: 'Confidence interval' },
        { concept: 'Bayes factor', mapped: 'Likelihood ratio test' },
      ],
      qualitative: [
        { concept: 'Prior probability', mapped: 'Initial belief strength' },
        { concept: 'Posterior probability', mapped: 'Revised belief after evidence' },
        { concept: 'Likelihood', mapped: 'Evidence consistency' },
        { concept: 'Credible interval', mapped: 'Plausible range' },
        { concept: 'Bayes factor', mapped: 'Strength of evidence shift' },
      ],
      quantitative: [
        { concept: 'Prior probability', mapped: 'Initial parameter estimate' },
        { concept: 'Posterior probability', mapped: 'Updated parameter estimate' },
        { concept: 'Likelihood', mapped: 'Data fit score' },
        { concept: 'Credible interval', mapped: 'Prediction interval' },
        { concept: 'Bayes factor', mapped: 'Model comparison ratio' },
      ],
    },
    frequentist: {
      bayesian: [
        { concept: 'p-value', mapped: 'Posterior prob of null' },
        { concept: 'Confidence interval', mapped: 'Credible interval' },
        { concept: 'Significance level', mapped: 'Prior probability threshold' },
        { concept: 'Power', mapped: 'Expected Bayes factor' },
        { concept: 'Effect size', mapped: 'Posterior mean shift' },
      ],
      qualitative: [
        { concept: 'p-value', mapped: 'Surprise level' },
        { concept: 'Confidence interval', mapped: 'Reasonable range' },
        { concept: 'Significance level', mapped: 'Threshold for convincing' },
        { concept: 'Power', mapped: 'Sensitivity of test' },
        { concept: 'Effect size', mapped: 'Practical importance' },
      ],
      quantitative: [
        { concept: 'p-value', mapped: 'Rejection probability' },
        { concept: 'Confidence interval', mapped: 'Estimation bounds' },
        { concept: 'Significance level', mapped: 'Alpha threshold' },
        { concept: 'Power', mapped: '1 - beta (detection rate)' },
        { concept: 'Effect size', mapped: 'Standardized mean difference' },
      ],
    },
    qualitative: {
      bayesian: [
        { concept: 'Belief strength', mapped: 'Prior probability' },
        { concept: 'Evidence weight', mapped: 'Likelihood ratio' },
        { concept: 'Updated belief', mapped: 'Posterior probability' },
        { concept: 'Plausible range', mapped: 'Credible interval' },
        { concept: 'Narrative evidence', mapped: 'Informative prior' },
      ],
      frequentist: [
        { concept: 'Belief strength', mapped: 'Assumed base rate' },
        { concept: 'Evidence weight', mapped: 'Test statistic' },
        { concept: 'Updated belief', mapped: 'Post-hoc estimate' },
        { concept: 'Plausible range', mapped: 'Confidence interval' },
        { concept: 'Narrative evidence', mapped: 'Case study data' },
      ],
      quantitative: [
        { concept: 'Belief strength', mapped: 'Numerical probability' },
        { concept: 'Evidence weight', mapped: 'Information gain (bits)' },
        { concept: 'Updated belief', mapped: 'Revised point estimate' },
        { concept: 'Plausible range', mapped: 'Min-max bounds' },
        { concept: 'Narrative evidence', mapped: 'Coded data points' },
      ],
    },
    quantitative: {
      bayesian: [
        { concept: 'Point estimate', mapped: 'Posterior mode' },
        { concept: 'Prediction interval', mapped: 'Posterior predictive interval' },
        { concept: 'Model fit (R²)', mapped: 'Posterior model probability' },
        { concept: 'Regression coefficient', mapped: 'Posterior mean of parameter' },
        { concept: 'Forecast error', mapped: 'Posterior variance' },
      ],
      frequentist: [
        { concept: 'Point estimate', mapped: 'Maximum likelihood estimate' },
        { concept: 'Prediction interval', mapped: 'Confidence interval' },
        { concept: 'Model fit (R²)', mapped: 'Adjusted R²' },
        { concept: 'Regression coefficient', mapped: 'OLS coefficient' },
        { concept: 'Forecast error', mapped: 'Standard error' },
      ],
      qualitative: [
        { concept: 'Point estimate', mapped: 'Central tendency description' },
        { concept: 'Prediction interval', mapped: 'Expected outcome range' },
        { concept: 'Model fit (R²)', mapped: 'Explanatory adequacy' },
        { concept: 'Regression coefficient', mapped: 'Influence factor' },
        { concept: 'Forecast error', mapped: 'Prediction uncertainty' },
      ],
    },
  };

  const mappings = translations[from]?.[to] || [];

  return {
    ok: true,
    lines: [
      { text: `Epistemic Translation: ${from} → ${to}`, style: 'header' },
      separator(60),
      { text: '', style: 'default' },
      ...tableHeader([
        { label: `${from} concept`, width: 26 },
        { label: `${to} equivalent`, width: 30 },
      ]),
      ...mappings.map(m => tableRow([
        { value: m.concept, width: 26 },
        { value: m.mapped, width: 30 },
      ])),
      { text: '', style: 'default' },
      { text: `${mappings.length} concepts mapped. Translation is approximate.`, style: 'dim' },
      { text: 'Framework alignment is context-dependent — use as a starting point.', style: 'info' },
    ],
  };
}

function handleEpistemicAlign(flags: Record<string, string>): CLIResult {
  const datasetName = flags['dataset'] || 'sampleA';
  const dataset = getDataset(datasetName);

  if (!dataset) {
    return {
      ok: false,
      lines: [
        { text: `Error: dataset "${datasetName}" not found`, style: 'error' },
        { text: 'Available datasets: sampleA, sampleB', style: 'dim' },
      ],
    };
  }

  return {
    ok: true,
    lines: [
      { text: `Assumption Alignment — ${dataset.name}`, style: 'header' },
      separator(68),
      { text: '', style: 'default' },
      ...tableHeader([
        { label: 'Case', width: 16 },
        { label: 'Assumption', width: 20 },
        { label: 'Framework', width: 14 },
        { label: 'Aligned', width: 14 },
      ]),
      ...dataset.cases.map(c => {
        const framework = c.probability > 0.8 ? 'quantitative' : c.probability > 0.5 ? 'bayesian' : 'qualitative';
        const aligned = c.riskScore < 0.5 ? 'yes' : 'review';
        return tableRow([
          { value: c.label, width: 16 },
          { value: c.outcome === 'approve' ? 'Growth assumed' : c.outcome === 'defer' ? 'Status quo' : 'Negative bias', width: 20 },
          { value: framework, width: 14 },
          { value: aligned, width: 14 },
        ]);
      }),
      { text: '', style: 'default' },
      { text: `${dataset.cases.filter(c => c.riskScore < 0.5).length} of ${dataset.cases.length} cases aligned across frameworks.`, style: 'success' },
      { text: `${dataset.cases.filter(c => c.riskScore >= 0.5).length} cases need cross-team review.`, style: 'info' },
    ],
  };
}

function handleEpistemicGlossary(): CLIResult {
  const glossary = [
    { term: 'Prior', definition: 'Initial belief before observing evidence' },
    { term: 'Posterior', definition: 'Updated belief after incorporating evidence' },
    { term: 'Likelihood', definition: 'Probability of evidence given a hypothesis' },
    { term: 'Confidence Interval', definition: 'Frequentist range for a parameter estimate' },
    { term: 'Credible Interval', definition: 'Bayesian range where parameter likely falls' },
    { term: 'p-value', definition: 'Probability of data at least as extreme under null' },
    { term: 'Bayes Factor', definition: 'Ratio of evidence for one model vs another' },
    { term: 'VOI', definition: 'Expected reduction in decision uncertainty from evidence' },
    { term: 'Calibration', definition: 'Agreement between stated probabilities and outcomes' },
    { term: 'Sharpness', definition: 'Concentration of probability estimates near 0 or 1' },
  ];

  return {
    ok: true,
    lines: [
      { text: 'Cross-Framework Glossary', style: 'header' },
      separator(62),
      { text: '', style: 'default' },
      ...tableHeader([
        { label: 'Term', width: 22 },
        { label: 'Definition', width: 48 },
      ]),
      ...glossary.map(g => tableRow([
        { value: g.term, width: 22 },
        { value: g.definition, width: 48 },
      ])),
      { text: '', style: 'default' },
      { text: `${glossary.length} terms. Definitions simplified for cross-team use.`, style: 'dim' },
    ],
  };
}

/* ------------------------------------------------------------------ */
/*  Command handlers — Governance                                      */
/* ------------------------------------------------------------------ */

function handleGovernanceAudit(flags: Record<string, string>): CLIResult {
  const datasetName = flags['dataset'] || 'sampleA';
  const dataset = getDataset(datasetName);

  if (!dataset) {
    return {
      ok: false,
      lines: [
        { text: `Error: dataset "${datasetName}" not found`, style: 'error' },
        { text: 'Available datasets: sampleA, sampleB', style: 'dim' },
      ],
    };
  }

  const passed = dataset.policies.filter(p => p.status === 'pass').length;
  const warned = dataset.policies.filter(p => p.status === 'warn').length;
  const failed = dataset.policies.filter(p => p.status === 'fail').length;

  const statusLabel = (s: string) => s === 'pass' ? 'PASS' : s === 'fail' ? 'FAIL' : 'WARN';

  return {
    ok: true,
    lines: [
      { text: `Governance Audit — ${dataset.name}`, style: 'header' },
      separator(68),
      { text: '', style: 'default' },
      ...tableHeader([
        { label: 'ID', width: 6 },
        { label: 'Policy', width: 22 },
        { label: 'Status', width: 8 },
        { label: 'Threshold', width: 10 },
        { label: 'Actual', width: 10 },
        { label: 'Severity', width: 10 },
      ]),
      ...dataset.policies.map(p => tableRow([
        { value: p.id, width: 6 },
        { value: p.name, width: 22 },
        { value: statusLabel(p.status), width: 8 },
        { value: String(p.threshold), width: 10 },
        { value: String(p.actual), width: 10 },
        { value: p.severity, width: 10 },
      ])),
      { text: '', style: 'default' },
      { text: `Results: ${passed} passed, ${warned} warnings, ${failed} failures`, style: failed > 0 ? 'error' : warned > 0 ? 'info' : 'success' },
      { text: `Overall: ${failed === 0 ? 'COMPLIANT' : 'NON-COMPLIANT'}`, style: failed === 0 ? 'success' : 'error' },
    ],
  };
}

function handleGovernancePolicyCheck(flags: Record<string, string>): CLIResult {
  const policyName = flags['policy'] || '';
  const dataset = sampleA;

  const policyMap: Record<string, string> = {
    'risk-threshold': 'Risk Threshold',
    'cost-cap': 'Cost Cap',
    'min-confidence': 'Min Confidence',
    'evidence-coverage': 'Evidence Coverage',
    'stakeholder-sign-off': 'Stakeholder Sign-off',
    'audit-trail': 'Audit Trail Complete',
  };

  const fullName = policyMap[policyName];
  if (!fullName) {
    return {
      ok: false,
      lines: [
        { text: `Error: policy "${policyName}" not found`, style: 'error' },
        { text: `Available policies: ${Object.keys(policyMap).join(', ')}`, style: 'dim' },
      ],
    };
  }

  const policy = dataset.policies.find(p => p.name === fullName);
  if (!policy) {
    return {
      ok: false,
      lines: [
        { text: `Error: policy "${fullName}" not found in dataset`, style: 'error' },
      ],
    };
  }

  const statusLabel = policy.status === 'pass' ? 'PASS' : policy.status === 'fail' ? 'FAIL' : 'WARN';

  return {
    ok: true,
    lines: [
      separator(50),
      { text: `Policy Check: ${policy.name}`, style: 'header' },
      separator(50),
      { text: `ID:           ${policy.id}`, style: 'default' },
      { text: `Name:         ${policy.name}`, style: 'default' },
      { text: `Severity:     ${policy.severity}`, style: 'default' },
      { text: `Threshold:    ${policy.threshold}`, style: 'default' },
      { text: `Actual:       ${policy.actual}`, style: 'default' },
      { text: `Status:       ${statusLabel}`, style: policy.status === 'pass' ? 'success' : policy.status === 'fail' ? 'error' : 'info' },
      { text: '', style: 'default' },
      { text: policy.status === 'pass'
        ? 'This policy rule is satisfied.'
        : policy.status === 'warn'
          ? 'This policy is close to its threshold — review recommended.'
          : 'This policy is VIOLATED. Remediation required.', style: policy.status === 'pass' ? 'success' : policy.status === 'fail' ? 'error' : 'info' },
      separator(50),
    ],
  };
}

function handleGovernanceDrift(flags: Record<string, string>): CLIResult {
  const datasetName = flags['dataset'] || 'sampleA';
  const dataset = getDataset(datasetName);

  if (!dataset) {
    return {
      ok: false,
      lines: [
        { text: `Error: dataset "${datasetName}" not found`, style: 'error' },
        { text: 'Available datasets: sampleA, sampleB', style: 'dim' },
      ],
    };
  }

  // Deterministic drift: compare threshold vs actual, compute percentage drift
  return {
    ok: true,
    lines: [
      { text: `Governance Drift Detection — ${dataset.name}`, style: 'header' },
      separator(62),
      { text: '', style: 'default' },
      ...tableHeader([
        { label: 'Policy', width: 22 },
        { label: 'Drift', width: 10 },
        { label: 'Direction', width: 12 },
        { label: 'Alert', width: 10 },
      ]),
      ...dataset.policies.map(p => {
        const drift = ((p.actual - p.threshold) / p.threshold * 100).toFixed(1);
        const direction = p.actual > p.threshold ? 'above' : p.actual < p.threshold ? 'below' : 'on-target';
        const alert = p.status === 'fail' ? 'CRITICAL' : p.status === 'warn' ? 'WARNING' : 'OK';
        return tableRow([
          { value: p.name, width: 22 },
          { value: drift + '%', width: 10 },
          { value: direction, width: 12 },
          { value: alert, width: 10 },
        ]);
      }),
      { text: '', style: 'default' },
      { text: `${dataset.policies.filter(p => p.status !== 'pass').length} policies drifting. Review recommended.`, style: dataset.policies.some(p => p.status === 'fail') ? 'error' : 'info' },
    ],
  };
}

function handleGovernanceStatus(): CLIResult {
  const dsA = sampleA;
  const dsB = getDataset('sampleB')!;

  function score(ds: typeof dsA): string {
    const pass = ds.policies.filter(p => p.status === 'pass').length;
    return ((pass / ds.policies.length) * 100).toFixed(0);
  }

  return {
    ok: true,
    lines: [
      { text: 'Governance Health Overview', style: 'header' },
      separator(50),
      { text: '', style: 'default' },
      ...tableHeader([
        { label: 'Dataset', width: 14 },
        { label: 'Policies', width: 10 },
        { label: 'Pass', width: 8 },
        { label: 'Warn', width: 8 },
        { label: 'Fail', width: 8 },
        { label: 'Score', width: 8 },
      ]),
      ...[dsA, dsB].map(ds => {
        const pass = ds.policies.filter(p => p.status === 'pass').length;
        const warn = ds.policies.filter(p => p.status === 'warn').length;
        const fail = ds.policies.filter(p => p.status === 'fail').length;
        return tableRow([
          { value: ds.name, width: 14 },
          { value: String(ds.policies.length), width: 10 },
          { value: String(pass), width: 8 },
          { value: String(warn), width: 8 },
          { value: String(fail), width: 8 },
          { value: score(ds) + '%', width: 8 },
        ]);
      }),
      { text: '', style: 'default' },
      { text: 'Governance status is deterministic and reproducible.', style: 'success' },
    ],
  };
}

/* ------------------------------------------------------------------ */
/*  Command handlers — KPI                                             */
/* ------------------------------------------------------------------ */

function handleKpiHealth(flags: Record<string, string>): CLIResult {
  const datasetName = flags['dataset'] || 'sampleA';
  const dataset = getDataset(datasetName);

  if (!dataset) {
    return {
      ok: false,
      lines: [
        { text: `Error: dataset "${datasetName}" not found`, style: 'error' },
        { text: 'Available datasets: sampleA, sampleB', style: 'dim' },
      ],
    };
  }

  const trendSymbol = (t: string) => t === 'up' ? '↑' : t === 'down' ? '↓' : '→';

  return {
    ok: true,
    lines: [
      { text: `KPI Health Dashboard — ${dataset.name}`, style: 'header' },
      separator(72),
      { text: '', style: 'default' },
      ...tableHeader([
        { label: 'Metric', width: 22 },
        { label: 'Value', width: 8 },
        { label: 'Target', width: 8 },
        { label: 'Range', width: 14 },
        { label: 'Trend', width: 6 },
        { label: 'Health', width: 10 },
      ]),
      ...dataset.kpis.map(k => tableRow([
        { value: k.name, width: 22 },
        { value: k.value.toFixed(2), width: 8 },
        { value: k.target.toFixed(2), width: 8 },
        { value: `${k.lowerBound.toFixed(2)}-${k.upperBound.toFixed(2)}`, width: 14 },
        { value: trendSymbol(k.trend), width: 6 },
        { value: k.health.toUpperCase(), width: 10 },
      ])),
      { text: '', style: 'default' },
      { text: `${dataset.kpis.filter(k => k.health === 'healthy').length} healthy, ${dataset.kpis.filter(k => k.health === 'warning').length} warning, ${dataset.kpis.filter(k => k.health === 'critical').length} critical`, style: dataset.kpis.some(k => k.health === 'critical') ? 'error' : 'info' },
    ],
  };
}

function handleKpiAlert(flags: Record<string, string>): CLIResult {
  const threshold = parseFloat(flags['threshold'] || '0.7');
  const dataset = sampleA;

  const alerts = dataset.kpis.filter(k => {
    // Alert if value deviates from target beyond threshold ratio
    const ratio = Math.abs(k.value - k.target) / k.target;
    return ratio > (1 - threshold);
  });

  return {
    ok: true,
    lines: [
      { text: `KPI Alerts — Threshold: ${threshold}`, style: 'header' },
      separator(60),
      { text: '', style: 'default' },
      ...(alerts.length > 0
        ? [
            ...tableHeader([
              { label: 'Metric', width: 22 },
              { label: 'Value', width: 8 },
              { label: 'Target', width: 8 },
              { label: 'Deviation', width: 10 },
              { label: 'Health', width: 10 },
            ]),
            ...alerts.map(k => {
              const dev = ((k.value - k.target) / k.target * 100).toFixed(1);
              return tableRow([
                { value: k.name, width: 22 },
                { value: k.value.toFixed(2), width: 8 },
                { value: k.target.toFixed(2), width: 8 },
                { value: dev + '%', width: 10 },
                { value: k.health.toUpperCase(), width: 10 },
              ]);
            }),
          ]
        : [{ text: 'No KPIs exceed the alert threshold.', style: 'success' as LineStyle }]),
      { text: '', style: 'default' },
      { text: `${alerts.length} of ${dataset.kpis.length} KPIs alerting.`, style: alerts.length > 0 ? 'info' : 'success' },
    ],
  };
}

function handleKpiTrend(flags: Record<string, string>): CLIResult {
  const metricName = flags['metric'] || '';
  const dataset = sampleA;

  const metricMap: Record<string, string> = {
    'risk': 'Risk Exposure',
    'confidence': 'Decision Confidence',
    'evidence': 'Evidence Coverage',
    'governance': 'Governance Score',
    'calibration': 'Calibration Error',
    'provenance': 'Provenance Depth',
  };

  const fullName = metricMap[metricName];
  if (!fullName) {
    return {
      ok: false,
      lines: [
        { text: `Error: metric "${metricName}" not found`, style: 'error' },
        { text: `Available metrics: ${Object.keys(metricMap).join(', ')}`, style: 'dim' },
      ],
    };
  }

  const kpi = dataset.kpis.find(k => k.name === fullName);
  if (!kpi) {
    return { ok: false, lines: [{ text: `Error: metric data not found`, style: 'error' }] };
  }

  // Deterministic 5-point trend from the current value
  const points = [
    kpi.value * 0.88,
    kpi.value * 0.93,
    kpi.value * 0.97,
    kpi.value * 0.99,
    kpi.value,
  ];

  const maxVal = Math.max(...points);
  const barScale = 30;

  return {
    ok: true,
    lines: [
      { text: `KPI Trend: ${fullName}`, style: 'header' },
      separator(50),
      { text: `Current: ${kpi.value.toFixed(2)}  Target: ${kpi.target.toFixed(2)}  Health: ${kpi.health}`, style: 'info' },
      { text: '', style: 'default' },
      ...points.map((p, i) => {
        const bar = '█'.repeat(Math.round((p / maxVal) * barScale));
        return { text: `  T-${4 - i}  ${p.toFixed(2)}  ${bar}`, style: 'table-row' as LineStyle };
      }),
      { text: '', style: 'default' },
      { text: `Trend direction: ${kpi.trend}`, style: kpi.health === 'healthy' ? 'success' : 'info' },
      separator(50),
    ],
  };
}

function handleKpiSummary(): CLIResult {
  const dsA = sampleA;
  const dsB = getDataset('sampleB')!;

  function aggregate(ds: typeof dsA) {
    const healthy = ds.kpis.filter(k => k.health === 'healthy').length;
    const warning = ds.kpis.filter(k => k.health === 'warning').length;
    const critical = ds.kpis.filter(k => k.health === 'critical').length;
    const avgValue = ds.kpis.reduce((s, k) => s + k.value, 0) / ds.kpis.length;
    return { healthy, warning, critical, avgValue, total: ds.kpis.length };
  }

  const aggA = aggregate(dsA);
  const aggB = aggregate(dsB);

  return {
    ok: true,
    lines: [
      { text: 'KPI Summary — All Datasets', style: 'header' },
      separator(60),
      { text: '', style: 'default' },
      ...tableHeader([
        { label: 'Dataset', width: 10 },
        { label: 'KPIs', width: 6 },
        { label: 'Healthy', width: 9 },
        { label: 'Warning', width: 9 },
        { label: 'Critical', width: 10 },
        { label: 'Avg Value', width: 10 },
      ]),
      ...[{ name: 'sampleA', agg: aggA }, { name: 'sampleB', agg: aggB }].map(d => tableRow([
        { value: d.name, width: 10 },
        { value: String(d.agg.total), width: 6 },
        { value: String(d.agg.healthy), width: 9 },
        { value: String(d.agg.warning), width: 9 },
        { value: String(d.agg.critical), width: 10 },
        { value: d.agg.avgValue.toFixed(2), width: 10 },
      ])),
      { text: '', style: 'default' },
      { text: `${aggA.total + aggB.total} KPIs across ${2} datasets. Deterministic.`, style: 'success' },
    ],
  };
}

/* ------------------------------------------------------------------ */
/*  Help (updated with all domains)                                    */
/* ------------------------------------------------------------------ */

function handleHelp(): CLIResult {
  return {
    ok: true,
    lines: [
      { text: 'Zeo CLI Demo — Available Commands', style: 'header' },
      separator(58),
      { text: '', style: 'default' },
      { text: 'Counterfactual Lab:', style: 'info' },
      { text: '  zeo counterfactual run --dataset <name>', style: 'default' },
      { text: '  zeo counterfactual flip-distance --case <id>', style: 'default' },
      { text: '', style: 'default' },
      { text: 'Evidence Planner:', style: 'info' },
      { text: '  zeo evidence rank --budget <amount>', style: 'default' },
      { text: '  zeo evidence plan --risk <low|medium|high>', style: 'default' },
      { text: '', style: 'default' },
      { text: 'Decision Graph:', style: 'info' },
      { text: '  zeo graph simulate --node <id>', style: 'default' },
      { text: '  zeo graph explain --path <A->B>', style: 'default' },
      { text: '', style: 'default' },
      { text: 'Uncertainty Ledger:', style: 'info' },
      { text: '  zeo uncertainty track --dataset <name>', style: 'default' },
      { text: '  zeo uncertainty calibrate --case <id>', style: 'default' },
      { text: '  zeo uncertainty range --case <id>', style: 'default' },
      { text: '  zeo uncertainty history --dataset <name>', style: 'default' },
      { text: '', style: 'default' },
      { text: 'Epistemic Translator:', style: 'info' },
      { text: '  zeo epistemic translate --from <fw> --to <fw>', style: 'default' },
      { text: '  zeo epistemic align --dataset <name>', style: 'default' },
      { text: '  zeo epistemic glossary', style: 'default' },
      { text: '', style: 'default' },
      { text: 'OSS Governance:', style: 'info' },
      { text: '  zeo governance audit --dataset <name>', style: 'default' },
      { text: '  zeo governance policy-check --policy <name>', style: 'default' },
      { text: '  zeo governance drift --dataset <name>', style: 'default' },
      { text: '  zeo governance status', style: 'default' },
      { text: '', style: 'default' },
      { text: 'KPI Health Monitor:', style: 'info' },
      { text: '  zeo kpi health --dataset <name>', style: 'default' },
      { text: '  zeo kpi alert --threshold <value>', style: 'default' },
      { text: '  zeo kpi trend --metric <name>', style: 'default' },
      { text: '  zeo kpi summary', style: 'default' },
      { text: '', style: 'default' },
      { text: 'General:', style: 'info' },
      { text: '  help         Show this help message', style: 'default' },
      { text: '  clear        Clear terminal output', style: 'default' },
    ],
  };
}

/* ------------------------------------------------------------------ */
/*  Dispatcher                                                         */
/* ------------------------------------------------------------------ */

export function executeCommand(cmd: ParsedCommand): CLIResult {
  const { program, domain, action, flags, raw } = cmd;

  // Built-in commands
  if (raw === 'help' || raw === '--help' || raw === 'zeo help' || raw === 'zeo --help') {
    return handleHelp();
  }

  if (raw === 'clear') {
    return { ok: true, lines: [] };
  }

  if (!raw) {
    return { ok: true, lines: [] };
  }

  if (program !== 'zeo') {
    return {
      ok: false,
      lines: [
        { text: `Unknown command: ${raw}`, style: 'error' },
        { text: 'Type "help" for available commands.', style: 'dim' },
      ],
    };
  }

  // Counterfactual commands
  if (domain === 'counterfactual') {
    if (action === 'run') return handleCounterfactualRun(flags);
    if (action === 'flip-distance') return handleCounterfactualFlipDistance(flags);
    return {
      ok: false,
      lines: [
        { text: `Unknown counterfactual action: ${action}`, style: 'error' },
        { text: 'Available: run, flip-distance', style: 'dim' },
      ],
    };
  }

  // Evidence commands
  if (domain === 'evidence') {
    if (action === 'rank') return handleEvidenceRank(flags);
    if (action === 'plan') return handleEvidencePlan(flags);
    return {
      ok: false,
      lines: [
        { text: `Unknown evidence action: ${action}`, style: 'error' },
        { text: 'Available: rank, plan', style: 'dim' },
      ],
    };
  }

  // Graph commands
  if (domain === 'graph') {
    if (action === 'simulate') return handleGraphSimulate(flags);
    if (action === 'explain') return handleGraphExplain(flags);
    return {
      ok: false,
      lines: [
        { text: `Unknown graph action: ${action}`, style: 'error' },
        { text: 'Available: simulate, explain', style: 'dim' },
      ],
    };
  }

  // Uncertainty commands
  if (domain === 'uncertainty') {
    if (action === 'track') return handleUncertaintyTrack(flags);
    if (action === 'calibrate') return handleUncertaintyCalibrate(flags);
    if (action === 'range') return handleUncertaintyRange(flags);
    if (action === 'history') return handleUncertaintyHistory(flags);
    return {
      ok: false,
      lines: [
        { text: `Unknown uncertainty action: ${action}`, style: 'error' },
        { text: 'Available: track, calibrate, range, history', style: 'dim' },
      ],
    };
  }

  // Epistemic commands
  if (domain === 'epistemic') {
    if (action === 'translate') return handleEpistemicTranslate(flags);
    if (action === 'align') return handleEpistemicAlign(flags);
    if (action === 'glossary') return handleEpistemicGlossary();
    return {
      ok: false,
      lines: [
        { text: `Unknown epistemic action: ${action}`, style: 'error' },
        { text: 'Available: translate, align, glossary', style: 'dim' },
      ],
    };
  }

  // Governance commands
  if (domain === 'governance') {
    if (action === 'audit') return handleGovernanceAudit(flags);
    if (action === 'policy-check') return handleGovernancePolicyCheck(flags);
    if (action === 'drift') return handleGovernanceDrift(flags);
    if (action === 'status') return handleGovernanceStatus();
    return {
      ok: false,
      lines: [
        { text: `Unknown governance action: ${action}`, style: 'error' },
        { text: 'Available: audit, policy-check, drift, status', style: 'dim' },
      ],
    };
  }

  // KPI commands
  if (domain === 'kpi') {
    if (action === 'health') return handleKpiHealth(flags);
    if (action === 'alert') return handleKpiAlert(flags);
    if (action === 'trend') return handleKpiTrend(flags);
    if (action === 'summary') return handleKpiSummary();
    return {
      ok: false,
      lines: [
        { text: `Unknown kpi action: ${action}`, style: 'error' },
        { text: 'Available: health, alert, trend, summary', style: 'dim' },
      ],
    };
  }

  return {
    ok: false,
    lines: [
      { text: `Unknown domain: ${domain}`, style: 'error' },
      { text: 'Available domains: counterfactual, evidence, graph, uncertainty, epistemic, governance, kpi', style: 'dim' },
      { text: 'Type "help" for full command reference.', style: 'dim' },
    ],
  };
}
