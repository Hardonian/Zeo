import { validateCommand } from '@/lib/allowed-commands';
import { IntentKey } from '@/lib/intent-router';
import { DEFAULT_WORKFLOWS } from './orchestrator';
import type { StepSpec, WorkflowOption, WorkflowSpec } from './types';
import { AgentRole } from './types';
import manifest from './workflow-registry.json';

interface ManifestWorkflow {
  name: string;
  label?: string;
  steps: Array<{
    role: string;
    intent: string;
    params?: Record<string, string | number | boolean>;
    commandPlanTemplate?: string[];
  }>;
}

interface ManifestFile {
  version: number;
  workflows: ManifestWorkflow[];
}

const BUILT_IN_OPTIONS: WorkflowOption[] = [
  { key: 'UNDERSTAND', label: 'Understand', source: 'built-in' },
  { key: 'STRESS_TEST', label: 'Stress Test', source: 'built-in' },
  { key: 'IMPROVE', label: 'Improve', source: 'built-in' },
  { key: 'AUTO', label: 'Auto', source: 'built-in' },
];

function isIntentKey(intent: string): intent is IntentKey {
  if (intent === IntentKey.UNKNOWN) {
    return false;
  }
  return Object.values(IntentKey).includes(intent as IntentKey);
}

function isAgentRole(role: string): role is AgentRole {
  return Object.values(AgentRole).includes(role as AgentRole);
}

function parseStep(input: ManifestWorkflow['steps'][number], workflowName: string, index: number): StepSpec | null {
  if (!isAgentRole(input.role) || !isIntentKey(input.intent)) {
    return null;
  }

  if (input.commandPlanTemplate) {
    for (const command of input.commandPlanTemplate) {
      const validationError = validateCommand(command);
      if (validationError) {
        throw new Error(`Invalid command template in workflow ${workflowName} step ${index + 1}: ${validationError}`);
      }
    }
  }

  return {
    role: input.role,
    intent: input.intent,
    params: input.params,
    commandPlanTemplate: input.commandPlanTemplate,
  };
}

function parseManifest(input: ManifestFile): WorkflowSpec[] {
  if (typeof input !== 'object' || input === null || !Array.isArray(input.workflows)) {
    return [];
  }

  const seen = new Set<string>(['UNDERSTAND', 'STRESS_TEST', 'IMPROVE', 'AUTO']);
  const parsed: WorkflowSpec[] = [];

  for (const workflow of input.workflows) {
    if (typeof workflow.name !== 'string' || workflow.name.trim().length === 0 || seen.has(workflow.name)) {
      continue;
    }
    if (!Array.isArray(workflow.steps) || workflow.steps.length === 0 || workflow.steps.length > 6) {
      continue;
    }

    const steps: StepSpec[] = [];
    for (let i = 0; i < workflow.steps.length; i += 1) {
      const parsedStep = parseStep(workflow.steps[i], workflow.name, i);
      if (!parsedStep) {
        steps.length = 0;
        break;
      }
      steps.push(parsedStep);
    }

    if (steps.length === workflow.steps.length) {
      parsed.push({
        name: workflow.name,
        steps,
      });
      seen.add(workflow.name);
    }
  }

  return parsed;
}

const REGISTERED_WORKFLOWS = parseManifest(manifest as ManifestFile);

export function getWorkflowOptions(): WorkflowOption[] {
  const pluginOptions: WorkflowOption[] = REGISTERED_WORKFLOWS.map((workflow) => ({
    key: workflow.name,
    label: toLabel(workflow.name),
    source: 'plugin',
  }));
  return [...BUILT_IN_OPTIONS, ...pluginOptions];
}

function toLabel(name: string): string {
  return name
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function resolveWorkflowSpec(name: string): WorkflowSpec | null {
  if (name === 'UNDERSTAND' || name === 'STRESS_TEST' || name === 'IMPROVE') {
    return DEFAULT_WORKFLOWS[name];
  }

  if (name === 'AUTO') {
    return { name: 'AUTO', steps: [] };
  }

  return REGISTERED_WORKFLOWS.find((workflow) => workflow.name === name) ?? null;
}
