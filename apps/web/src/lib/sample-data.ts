/**
 * Deterministic sample datasets for Web CLI demo sandboxes.
 * No randomness — every call returns identical data.
 */

export interface SampleCase {
  id: number;
  label: string;
  riskScore: number;
  cost: number;
  probability: number;
  outcome: string;
}

export interface SampleNode {
  id: string;
  label: string;
  type: 'decision' | 'chance' | 'outcome';
  probability: number;
  value: number;
  children: string[];
}

export interface SampleEdge {
  from: string;
  to: string;
  weight: number;
  label: string;
}

export interface SampleDataset {
  name: string;
  description: string;
  cases: SampleCase[];
  nodes: SampleNode[];
  edges: SampleEdge[];
}

export const sampleA: SampleDataset = {
  name: 'sampleA',
  description: 'Market expansion decision — moderate uncertainty',
  cases: [
    { id: 1024, label: 'Expand East', riskScore: 0.62, cost: 420, probability: 0.71, outcome: 'approve' },
    { id: 1025, label: 'Expand West', riskScore: 0.44, cost: 310, probability: 0.83, outcome: 'approve' },
    { id: 1026, label: 'Hold Position', riskScore: 0.18, cost: 85, probability: 0.92, outcome: 'defer' },
    { id: 1027, label: 'Divest Beta', riskScore: 0.79, cost: 560, probability: 0.38, outcome: 'reject' },
    { id: 1028, label: 'Merge Alpha', riskScore: 0.55, cost: 390, probability: 0.65, outcome: 'approve' },
  ],
  nodes: [
    { id: 'A', label: 'Market Entry', type: 'decision', probability: 1.0, value: 0, children: ['B', 'C'] },
    { id: 'B', label: 'High Growth', type: 'chance', probability: 0.6, value: 800, children: ['D', 'E'] },
    { id: 'C', label: 'Steady State', type: 'chance', probability: 0.4, value: 350, children: ['F'] },
    { id: 'D', label: 'Win Market', type: 'outcome', probability: 0.7, value: 1200, children: [] },
    { id: 'E', label: 'Partial Gain', type: 'outcome', probability: 0.3, value: 400, children: [] },
    { id: 'F', label: 'Break Even', type: 'outcome', probability: 1.0, value: 200, children: [] },
  ],
  edges: [
    { from: 'A', to: 'B', weight: 0.6, label: 'aggressive' },
    { from: 'A', to: 'C', weight: 0.4, label: 'conservative' },
    { from: 'B', to: 'D', weight: 0.7, label: 'success' },
    { from: 'B', to: 'E', weight: 0.3, label: 'partial' },
    { from: 'C', to: 'F', weight: 1.0, label: 'stable' },
  ],
};

export const sampleB: SampleDataset = {
  name: 'sampleB',
  description: 'Infrastructure migration — high-stakes binary outcome',
  cases: [
    { id: 2048, label: 'Cloud Migration', riskScore: 0.35, cost: 720, probability: 0.88, outcome: 'approve' },
    { id: 2049, label: 'Hybrid Setup', riskScore: 0.51, cost: 540, probability: 0.72, outcome: 'approve' },
    { id: 2050, label: 'On-Prem Upgrade', riskScore: 0.28, cost: 380, probability: 0.91, outcome: 'defer' },
    { id: 2051, label: 'Full Rewrite', riskScore: 0.87, cost: 1100, probability: 0.42, outcome: 'reject' },
  ],
  nodes: [
    { id: 'A', label: 'Infra Decision', type: 'decision', probability: 1.0, value: 0, children: ['B', 'C', 'D'] },
    { id: 'B', label: 'Cloud Path', type: 'chance', probability: 0.5, value: 600, children: ['E'] },
    { id: 'C', label: 'Hybrid Path', type: 'chance', probability: 0.3, value: 400, children: ['F'] },
    { id: 'D', label: 'Legacy Path', type: 'chance', probability: 0.2, value: 150, children: ['G'] },
    { id: 'E', label: 'Scale Win', type: 'outcome', probability: 0.88, value: 950, children: [] },
    { id: 'F', label: 'Moderate Gain', type: 'outcome', probability: 0.72, value: 520, children: [] },
    { id: 'G', label: 'Tech Debt', type: 'outcome', probability: 0.91, value: -200, children: [] },
  ],
  edges: [
    { from: 'A', to: 'B', weight: 0.5, label: 'cloud' },
    { from: 'A', to: 'C', weight: 0.3, label: 'hybrid' },
    { from: 'A', to: 'D', weight: 0.2, label: 'legacy' },
    { from: 'B', to: 'E', weight: 0.88, label: 'migrate' },
    { from: 'C', to: 'F', weight: 0.72, label: 'integrate' },
    { from: 'D', to: 'G', weight: 0.91, label: 'maintain' },
  ],
};

export const DATASETS: Record<string, SampleDataset> = {
  sampleA,
  sampleB,
};

export function getDataset(name: string): SampleDataset | undefined {
  return DATASETS[name];
}
