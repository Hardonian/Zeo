/**
 * Panel configuration — single source of truth for product demo panels.
 * Maps panel slugs to display metadata, CLI commands, and engine routing.
 */

export interface PanelConfig {
  slug: string;
  title: string;
  description: string;
  primaryCommands: string[];
  defaultCommand: string;
  helpText: string;
  engineKey: string;
  sampleDatasetDefault: string;
}

/**
 * @deprecated Use PanelConfig instead. Kept for backward-compat re-export.
 */
export type PanelDemo = PanelConfig & { commands: string[] };

const PANELS: PanelConfig[] = [
  {
    slug: 'counterfactual-lab',
    title: 'Counterfactual Lab',
    description: 'Explore alternative decision paths and flip-distance analysis.',
    primaryCommands: [
      'zeo counterfactual run --dataset sampleA',
      'zeo counterfactual run --dataset sampleB',
      'zeo counterfactual flip-distance --case 1024',
      'zeo counterfactual flip-distance --case 2048',
    ],
    defaultCommand: 'zeo counterfactual run --dataset sampleA',
    helpText:
      'Counterfactual Lab lets you analyze alternative decision paths.\n' +
      'Commands:\n' +
      '  zeo counterfactual run --dataset <name>        Run counterfactual analysis on a dataset\n' +
      '  zeo counterfactual flip-distance --case <id>   Compute flip distance for a specific case\n' +
      'Datasets: sampleA, sampleB',
    engineKey: 'counterfactual',
    sampleDatasetDefault: 'sampleA',
  },
  {
    slug: 'evidence-planner',
    title: 'Evidence Planner',
    description: 'Plan evidence collection and rank by value-of-information.',
    primaryCommands: [
      'zeo evidence rank --budget 100',
      'zeo evidence rank --budget 500',
      'zeo evidence plan --risk low',
      'zeo evidence plan --risk high',
    ],
    defaultCommand: 'zeo evidence rank --budget 100',
    helpText:
      'Evidence Planner ranks evidence sources by expected information gain.\n' +
      'Commands:\n' +
      '  zeo evidence rank --budget <amount>   Rank evidence by VOI within a budget\n' +
      '  zeo evidence plan --risk <level>      Generate a collection plan by risk level\n' +
      'Risk levels: low, medium, high',
    engineKey: 'evidence',
    sampleDatasetDefault: 'sampleA',
  },
  {
    slug: 'decision-graph',
    title: 'Decision Graph',
    description: 'Simulate and explain decision graph paths.',
    primaryCommands: [
      'zeo graph simulate --node A',
      'zeo graph simulate --node B',
      'zeo graph explain --path B->D',
      'zeo graph explain --path A->C->F',
    ],
    defaultCommand: 'zeo graph simulate --node A',
    helpText:
      'Decision Graph lets you simulate and trace decision tree paths.\n' +
      'Commands:\n' +
      '  zeo graph simulate --node <id>     Simulate from a specific node\n' +
      '  zeo graph explain --path <A->B>    Explain a path through the graph\n' +
      'Nodes: A, B, C, D, E, F',
    engineKey: 'graph',
    sampleDatasetDefault: 'sampleA',
  },
  {
    slug: 'uncertainty-ledger',
    title: 'Uncertainty Ledger',
    description: 'Track confidence ranges and belief states with full provenance.',
    primaryCommands: [
      'zeo uncertainty track --dataset sampleA',
      'zeo uncertainty calibrate --case 1024',
      'zeo uncertainty range --case 1025',
      'zeo uncertainty history --dataset sampleB',
    ],
    defaultCommand: 'zeo uncertainty track --dataset sampleA',
    helpText:
      'Uncertainty Ledger tracks confidence intervals and calibration scores.\n' +
      'Commands:\n' +
      '  zeo uncertainty track --dataset <name>     Show confidence ranges for all cases\n' +
      '  zeo uncertainty calibrate --case <id>      Show calibration details for a case\n' +
      '  zeo uncertainty range --case <id>          Display confidence interval breakdown\n' +
      '  zeo uncertainty history --dataset <name>   Show belief-state change log',
    engineKey: 'uncertainty',
    sampleDatasetDefault: 'sampleA',
  },
  {
    slug: 'epistemic-translator',
    title: 'Epistemic Translator',
    description: 'Translate between reasoning frameworks and align team mental models.',
    primaryCommands: [
      'zeo epistemic translate --from bayesian --to frequentist',
      'zeo epistemic translate --from qualitative --to quantitative',
      'zeo epistemic align --dataset sampleA',
      'zeo epistemic glossary',
    ],
    defaultCommand: 'zeo epistemic translate --from bayesian --to frequentist',
    helpText:
      'Epistemic Translator maps concepts between reasoning frameworks.\n' +
      'Commands:\n' +
      '  zeo epistemic translate --from <framework> --to <framework>   Translate between frameworks\n' +
      '  zeo epistemic align --dataset <name>                          Align assumptions across cases\n' +
      '  zeo epistemic glossary                                        Show cross-framework glossary\n' +
      'Frameworks: bayesian, frequentist, qualitative, quantitative',
    engineKey: 'epistemic',
    sampleDatasetDefault: 'sampleA',
  },
  {
    slug: 'governance',
    title: 'OSS Governance',
    description: 'Monitor policy compliance, drift detection, and governance health.',
    primaryCommands: [
      'zeo governance audit --dataset sampleA',
      'zeo governance policy-check --policy risk-threshold',
      'zeo governance drift --dataset sampleB',
      'zeo governance status',
    ],
    defaultCommand: 'zeo governance audit --dataset sampleA',
    helpText:
      'OSS Governance monitors compliance and policy enforcement.\n' +
      'Commands:\n' +
      '  zeo governance audit --dataset <name>         Run governance audit on a dataset\n' +
      '  zeo governance policy-check --policy <name>   Check a specific policy rule\n' +
      '  zeo governance drift --dataset <name>         Detect governance drift\n' +
      '  zeo governance status                         Show overall governance health',
    engineKey: 'governance',
    sampleDatasetDefault: 'sampleA',
  },
  {
    slug: 'kpi-monitor',
    title: 'KPI Health Monitor',
    description: 'Track key performance indicators with uncertainty bands and health scoring.',
    primaryCommands: [
      'zeo kpi health --dataset sampleA',
      'zeo kpi alert --threshold 0.7',
      'zeo kpi trend --metric risk',
      'zeo kpi summary',
    ],
    defaultCommand: 'zeo kpi health --dataset sampleA',
    helpText:
      'KPI Health Monitor tracks performance indicators with uncertainty.\n' +
      'Commands:\n' +
      '  zeo kpi health --dataset <name>       Show KPI health dashboard\n' +
      '  zeo kpi alert --threshold <value>     List KPIs exceeding threshold\n' +
      '  zeo kpi trend --metric <name>         Show trend for a specific metric\n' +
      '  zeo kpi summary                       Show aggregate KPI summary',
    engineKey: 'kpi',
    sampleDatasetDefault: 'sampleA',
  },
];

const PANEL_MAP = new Map<string, PanelConfig>();
for (const panel of PANELS) {
  PANEL_MAP.set(panel.slug, panel);
}

/** Get a panel config by slug, or undefined if not found. */
export function getPanelConfig(slug: string): PanelConfig | undefined {
  return PANEL_MAP.get(slug);
}

/**
 * @deprecated Use getPanelConfig instead.
 */
export function getPanelDemo(slug: string): PanelDemo | undefined {
  const cfg = PANEL_MAP.get(slug);
  if (!cfg) return undefined;
  return { ...cfg, commands: cfg.primaryCommands };
}

/** Get all panel configs. */
export function getAllPanelConfigs(): PanelConfig[] {
  return PANELS;
}

/**
 * @deprecated Use getAllPanelConfigs instead.
 */
export function getAllPanelDemos(): PanelDemo[] {
  return PANELS.map(cfg => ({ ...cfg, commands: cfg.primaryCommands }));
}

/** List all valid panel slugs. */
export function listPanelSlugs(): string[] {
  return PANELS.map(p => p.slug);
}

/** Check if a slug is valid. */
export function isValidPanelSlug(slug: string): boolean {
  return PANEL_MAP.has(slug);
}
