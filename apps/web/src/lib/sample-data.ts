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

export interface EvidenceItem {
  source: string;
  voiScore: number;
  cost: number;
  riskMultiplier: number;
  expectedGain: number;
  timeWeeks: number;
}

export interface PolicyRule {
  id: string;
  name: string;
  status: 'pass' | 'fail' | 'warn';
  threshold: number;
  actual: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface KpiMetric {
  name: string;
  value: number;
  target: number;
  lowerBound: number;
  upperBound: number;
  trend: 'up' | 'down' | 'stable';
  health: 'healthy' | 'warning' | 'critical';
}

export interface SampleDataset {
  name: string;
  description: string;
  cases: SampleCase[];
  nodes: SampleNode[];
  edges: SampleEdge[];
  evidence: EvidenceItem[];
  policies: PolicyRule[];
  kpis: KpiMetric[];
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
  evidence: [
    { source: 'Market Survey', voiScore: 0.84, cost: 35, riskMultiplier: 1.0, expectedGain: 29.4, timeWeeks: 2 },
    { source: 'Expert Panel', voiScore: 0.72, cost: 80, riskMultiplier: 1.2, expectedGain: 48.0, timeWeeks: 3 },
    { source: 'Historical Analysis', voiScore: 0.68, cost: 20, riskMultiplier: 0.8, expectedGain: 10.9, timeWeeks: 1 },
    { source: 'Field Trial', voiScore: 0.91, cost: 200, riskMultiplier: 1.5, expectedGain: 121.5, timeWeeks: 6 },
    { source: 'Competitor Audit', voiScore: 0.55, cost: 45, riskMultiplier: 1.1, expectedGain: 27.2, timeWeeks: 2 },
    { source: 'Regression Model', voiScore: 0.63, cost: 15, riskMultiplier: 0.9, expectedGain: 8.5, timeWeeks: 1 },
  ],
  policies: [
    { id: 'P001', name: 'Risk Threshold', status: 'pass', threshold: 0.80, actual: 0.62, severity: 'critical' },
    { id: 'P002', name: 'Cost Cap', status: 'pass', threshold: 600, actual: 420, severity: 'high' },
    { id: 'P003', name: 'Min Confidence', status: 'warn', threshold: 0.75, actual: 0.71, severity: 'medium' },
    { id: 'P004', name: 'Evidence Coverage', status: 'pass', threshold: 3, actual: 5, severity: 'medium' },
    { id: 'P005', name: 'Stakeholder Sign-off', status: 'pass', threshold: 2, actual: 3, severity: 'low' },
    { id: 'P006', name: 'Audit Trail Complete', status: 'pass', threshold: 1, actual: 1, severity: 'low' },
  ],
  kpis: [
    { name: 'Decision Confidence', value: 0.74, target: 0.80, lowerBound: 0.68, upperBound: 0.81, trend: 'up', health: 'warning' },
    { name: 'Evidence Coverage', value: 0.85, target: 0.75, lowerBound: 0.78, upperBound: 0.92, trend: 'up', health: 'healthy' },
    { name: 'Risk Exposure', value: 0.55, target: 0.40, lowerBound: 0.48, upperBound: 0.63, trend: 'down', health: 'warning' },
    { name: 'Governance Score', value: 0.91, target: 0.85, lowerBound: 0.87, upperBound: 0.95, trend: 'stable', health: 'healthy' },
    { name: 'Calibration Error', value: 0.08, target: 0.05, lowerBound: 0.05, upperBound: 0.12, trend: 'down', health: 'warning' },
    { name: 'Provenance Depth', value: 0.93, target: 0.90, lowerBound: 0.89, upperBound: 0.97, trend: 'stable', health: 'healthy' },
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
  evidence: [
    { source: 'Load Testing', voiScore: 0.88, cost: 50, riskMultiplier: 1.0, expectedGain: 44.0, timeWeeks: 2 },
    { source: 'Vendor Assessment', voiScore: 0.76, cost: 30, riskMultiplier: 0.9, expectedGain: 20.5, timeWeeks: 1 },
    { source: 'Migration Pilot', voiScore: 0.94, cost: 150, riskMultiplier: 1.3, expectedGain: 108.8, timeWeeks: 4 },
    { source: 'Security Audit', voiScore: 0.82, cost: 90, riskMultiplier: 1.4, expectedGain: 103.3, timeWeeks: 3 },
    { source: 'Cost Modeling', voiScore: 0.69, cost: 25, riskMultiplier: 0.8, expectedGain: 13.8, timeWeeks: 1 },
  ],
  policies: [
    { id: 'P001', name: 'Risk Threshold', status: 'fail', threshold: 0.50, actual: 0.87, severity: 'critical' },
    { id: 'P002', name: 'Cost Cap', status: 'fail', threshold: 800, actual: 1100, severity: 'critical' },
    { id: 'P003', name: 'Min Confidence', status: 'warn', threshold: 0.80, actual: 0.72, severity: 'high' },
    { id: 'P004', name: 'Evidence Coverage', status: 'pass', threshold: 3, actual: 4, severity: 'medium' },
    { id: 'P005', name: 'Stakeholder Sign-off', status: 'warn', threshold: 3, actual: 2, severity: 'medium' },
    { id: 'P006', name: 'Audit Trail Complete', status: 'pass', threshold: 1, actual: 1, severity: 'low' },
  ],
  kpis: [
    { name: 'Decision Confidence', value: 0.68, target: 0.80, lowerBound: 0.60, upperBound: 0.76, trend: 'down', health: 'critical' },
    { name: 'Evidence Coverage', value: 0.72, target: 0.75, lowerBound: 0.65, upperBound: 0.79, trend: 'stable', health: 'warning' },
    { name: 'Risk Exposure', value: 0.71, target: 0.40, lowerBound: 0.64, upperBound: 0.78, trend: 'up', health: 'critical' },
    { name: 'Governance Score', value: 0.62, target: 0.85, lowerBound: 0.55, upperBound: 0.69, trend: 'down', health: 'critical' },
    { name: 'Calibration Error', value: 0.14, target: 0.05, lowerBound: 0.10, upperBound: 0.18, trend: 'up', health: 'critical' },
    { name: 'Provenance Depth', value: 0.88, target: 0.90, lowerBound: 0.83, upperBound: 0.93, trend: 'stable', health: 'warning' },
  ],
};

export const DATASETS: Record<string, SampleDataset> = {
  sampleA,
  sampleB,
};

export function getDataset(name: string): SampleDataset | undefined {
  return DATASETS[name];
}
