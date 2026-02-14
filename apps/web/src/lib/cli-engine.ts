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
  domain: string;        // "counterfactual" | "evidence" | "graph"
  action: string;        // "run" | "flip-distance" | "rank" | "plan" | "simulate" | "explain"
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
/*  Command handlers                                                   */
/* ------------------------------------------------------------------ */

function handleHelp(): CLIResult {
  return {
    ok: true,
    lines: [
      { text: 'Zeo CLI Demo — Available Commands', style: 'header' },
      separator(50),
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
      { text: 'General:', style: 'info' },
      { text: '  help         Show this help message', style: 'default' },
      { text: '  clear        Clear terminal output', style: 'default' },
    ],
  };
}

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

function handleEvidenceRank(flags: Record<string, string>): CLIResult {
  const budget = parseInt(flags['budget'] || '100', 10);

  interface EvidenceItem {
    source: string;
    voiScore: number;
    cost: number;
    feasible: boolean;
  }

  const evidenceItems: EvidenceItem[] = [
    { source: 'Market Survey', voiScore: 0.84, cost: 35, feasible: true },
    { source: 'Expert Panel', voiScore: 0.72, cost: 80, feasible: true },
    { source: 'Historical Analysis', voiScore: 0.68, cost: 20, feasible: true },
    { source: 'Field Trial', voiScore: 0.91, cost: 200, feasible: true },
    { source: 'Competitor Audit', voiScore: 0.55, cost: 45, feasible: true },
    { source: 'Regression Model', voiScore: 0.63, cost: 15, feasible: true },
  ];

  const sorted = [...evidenceItems].sort((a, b) => b.voiScore - a.voiScore);
  let remaining = budget;
  const selected: (EvidenceItem & { selected: boolean })[] = sorted.map(item => {
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

  const childNodes = dataset.nodes.filter(n => node.children.includes(n.id));
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
      ...(childNodes.length > 0
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
        const lines: OutputLine[] = [
          { text: `  [${n.id}] ${n.label} (${n.type})`, style: 'default' },
        ];
        if (i < edges.length) {
          lines.push({
            text: `      └─ "${edges[i].label}" (weight: ${edges[i].weight.toFixed(2)}) ──▶`,
            style: 'dim',
          });
        }
        return lines;
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

  return {
    ok: false,
    lines: [
      { text: `Unknown domain: ${domain}`, style: 'error' },
      { text: 'Available domains: counterfactual, evidence, graph', style: 'dim' },
      { text: 'Type "help" for full command reference.', style: 'dim' },
    ],
  };
}
