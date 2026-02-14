/**
 * Panel configuration for Web CLI demo sandboxes.
 * Maps panel slugs to display metadata and example commands.
 */

export interface PanelDemo {
  slug: string;
  title: string;
  description: string;
  commands: string[];
}

const PANELS: PanelDemo[] = [
  {
    slug: 'counterfactual-lab',
    title: 'Counterfactual Lab',
    description: 'Explore alternative decision paths and flip-distance analysis.',
    commands: [
      'zeo counterfactual run --dataset sampleA',
      'zeo counterfactual run --dataset sampleB',
      'zeo counterfactual flip-distance --case 1024',
      'zeo counterfactual flip-distance --case 2048',
    ],
  },
  {
    slug: 'evidence-planner',
    title: 'Evidence Planner',
    description: 'Plan evidence collection and rank by value-of-information.',
    commands: [
      'zeo evidence rank --budget 100',
      'zeo evidence rank --budget 500',
      'zeo evidence plan --risk low',
      'zeo evidence plan --risk high',
    ],
  },
  {
    slug: 'decision-graph',
    title: 'Decision Graph',
    description: 'Simulate and explain decision graph paths.',
    commands: [
      'zeo graph simulate --node A',
      'zeo graph simulate --node B',
      'zeo graph explain --path B->D',
      'zeo graph explain --path A->C->F',
    ],
  },
];

const PANEL_MAP = new Map<string, PanelDemo>();
for (const panel of PANELS) {
  PANEL_MAP.set(panel.slug, panel);
}

export function getPanelDemo(slug: string): PanelDemo | undefined {
  return PANEL_MAP.get(slug);
}

export function getAllPanelDemos(): PanelDemo[] {
  return PANELS;
}

export function isValidPanelSlug(slug: string): boolean {
  return PANEL_MAP.has(slug);
}
