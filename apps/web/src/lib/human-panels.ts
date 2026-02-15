/**
 * Panel Translation Layer — maps internal engines to human-readable outcomes.
 * Bridges the gap between technical CLI engines and natural language concepts.
 */

export interface HumanPanel {
  intentKey: string;
  engineKey: string;
  humanLabel: string;
  humanQuestion: string;
  workflow: 'understand' | 'stress-test' | 'improve';
  description: string;
  examplePrompts: string[];
}

const HUMAN_PANELS: HumanPanel[] = [
  {
    intentKey: 'counterfactual-lab',
    engineKey: 'counterfactual',
    humanLabel: 'What Would Need to Change?',
    humanQuestion: 'What would need to change for this decision to flip?',
    workflow: 'understand',
    description:
      'Explore alternative decision paths. See which variables would need to change — and by how much — to alter the outcome.',
    examplePrompts: [
      'What factors could flip this decision?',
      'How sensitive is this choice to the input data?',
      'Show me the counterfactual analysis',
    ],
  },
  {
    intentKey: 'evidence-planner',
    engineKey: 'evidence',
    humanLabel: 'What Should We Check Next?',
    humanQuestion: 'What evidence would increase our confidence the most?',
    workflow: 'improve',
    description:
      'Rank evidence sources by expected value of information. Prioritize what to investigate within your budget.',
    examplePrompts: [
      'What evidence would increase confidence?',
      'Where should we spend our research budget?',
      'Rank the most valuable things to investigate',
    ],
  },
  {
    intentKey: 'decision-graph',
    engineKey: 'graph',
    humanLabel: 'What Happens if We Choose X?',
    humanQuestion: 'What happens downstream if we take this path?',
    workflow: 'understand',
    description:
      'Simulate decision tree paths and see expected outcomes. Trace the chain of consequences from any choice.',
    examplePrompts: [
      'What happens if we choose the aggressive path?',
      'Simulate the outcomes from node B',
      'Explain the path from A to D',
    ],
  },
  {
    intentKey: 'flip-distance',
    engineKey: 'counterfactual',
    humanLabel: 'How Fragile Is This Decision?',
    humanQuestion: 'How much would inputs need to change to flip this decision?',
    workflow: 'stress-test',
    description:
      'Measure decision stability. The flip distance tells you the minimum perturbation needed to change the outcome.',
    examplePrompts: [
      'How stable is this recommendation?',
      'How fragile is this decision?',
      'What is the flip distance for case 1024?',
    ],
  },
  {
    intentKey: 'voi-engine',
    engineKey: 'evidence',
    humanLabel: 'Where Should We Spend Resources?',
    humanQuestion: 'Which evidence sources give the best return on investment?',
    workflow: 'improve',
    description:
      'Calculate value-of-information for each evidence source. Find the highest-ROI research investments.',
    examplePrompts: [
      'Where should we spend resources?',
      'What has the highest value of information?',
      'Rank evidence by ROI',
    ],
  },
  {
    intentKey: 'regret-planner',
    engineKey: 'evidence',
    humanLabel: "What's the Least-Risk Move?",
    humanQuestion: 'Which option minimizes potential regret?',
    workflow: 'stress-test',
    description:
      'Plan under uncertainty by minimizing worst-case regret. Find the safest action when outcomes are uncertain.',
    examplePrompts: [
      "What's the safest move?",
      'Which option has the least downside?',
      'Minimize regret across scenarios',
    ],
  },
  {
    intentKey: 'active-learning',
    engineKey: 'evidence',
    humanLabel: 'How Do We Improve Over Time?',
    humanQuestion: 'What should we learn next to make better decisions?',
    workflow: 'improve',
    description:
      'Identify the most informative next steps for iterative improvement. Build a learning plan for your decision process.',
    examplePrompts: [
      'How do we improve over time?',
      'What should we learn next?',
      'Create a learning plan',
    ],
  },
];

const PANEL_BY_INTENT = new Map<string, HumanPanel>();
for (const panel of HUMAN_PANELS) {
  PANEL_BY_INTENT.set(panel.intentKey, panel);
}

/** Retrieve all human-readable panels. */
export function getAllHumanPanels(): HumanPanel[] {
  return HUMAN_PANELS;
}

/** Get a human panel by its intent key. */
export function getHumanPanelByIntent(intentKey: string): HumanPanel | undefined {
  return PANEL_BY_INTENT.get(intentKey);
}

/** Get human panels grouped by workflow. */
export function getHumanPanelsByWorkflow(): Record<string, HumanPanel[]> {
  const grouped: Record<string, HumanPanel[]> = {
    understand: [],
    'stress-test': [],
    improve: [],
  };
  for (const panel of HUMAN_PANELS) {
    grouped[panel.workflow].push(panel);
  }
  return grouped;
}

/** Workflow metadata for display purposes. */
export const WORKFLOWS = [
  {
    key: 'understand' as const,
    label: 'Understand',
    description: 'Explore what drives the decision and what the outcomes look like.',
  },
  {
    key: 'stress-test' as const,
    label: 'Stress Test',
    description: 'Probe fragility, sensitivity, and worst-case scenarios.',
  },
  {
    key: 'improve' as const,
    label: 'Improve',
    description: 'Identify the highest-value next steps to increase confidence.',
  },
] as const;
