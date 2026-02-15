import { IntentKey } from '@/lib/intent-router';

export enum AgentRole {
  ANALYST = 'ANALYST',
  SIMULATOR = 'SIMULATOR',
  EVIDENCE_PLANNER = 'EVIDENCE_PLANNER',
  GOVERNANCE_AUDITOR = 'GOVERNANCE_AUDITOR',
  SCRIBE = 'SCRIBE',
}

export interface StepSpec {
  role: AgentRole;
  intent: IntentKey;
  params?: Record<string, string | number | boolean>;
  commandPlanTemplate?: string[];
}

export interface WorkflowSpec {
  name: string;
  steps: StepSpec[];
}

export interface WorkflowOption {
  key: string;
  label: string;
  source: 'built-in' | 'plugin';
}
