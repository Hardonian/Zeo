import { validateCommand } from '@/lib/allowed-commands';
import type { CLIResult } from '@/lib/cli-engine';
import { executeCommand, parseCommand } from '@/lib/cli-engine';
import type { CheckpointEvent, PolicyDecision, ToolTrace } from '@/lib/decision-ledger';
import { planExecution } from '@/lib/execution-planner';
import { IntentKey, classifyIntent } from '@/lib/intent-router';
import { formatNarrative } from '@/lib/narrative-formatter';
import type { WorkflowSpec } from './types';
import { AgentRole } from './types';
import { planExecution } from '@/lib/execution-planner';
import { IntentKey, classifyIntent } from '@/lib/intent-router';
import { formatNarrative } from '@/lib/narrative-formatter';
import type { CheckpointEvent, PolicyDecision, ToolTrace } from '@/lib/decision-ledger';

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
  name: 'UNDERSTAND' | 'STRESS_TEST' | 'IMPROVE' | 'AUTO';
  steps: StepSpec[];
}

export interface WorkflowRunResult {
  intent: IntentKey;
  combinedNarrative: string;
  commands: { command: string; description: string }[];
  cliResults: CLIResult[];
  checkpoints: CheckpointEvent[];
  policyDecisions: PolicyDecision[];
  toolTraces: ToolTrace[];
  workflow: { name: string; steps: string[]; agentRoles?: string[] };
  promptContext: { userQuery: string; normalizedQuery: string; extractedParams: Record<string, string | number | boolean> };
}

function extractStepQuery(userQuery: string, params?: Record<string, string | number | boolean>): string {
  if (!params || Object.keys(params).length === 0) return userQuery;
  const suffix = Object.entries(params).map(([k, v]) => `${k} ${v}`).join(' ');
  return `${userQuery} ${suffix}`.trim();
}

function flattenWorkflow(workflow: WorkflowSpec): WorkflowSpec {
  if (workflow.name !== 'AUTO') return workflow;
  return {
    name: 'AUTO',
    steps: [...DEFAULT_WORKFLOWS.UNDERSTAND.steps, ...DEFAULT_WORKFLOWS.STRESS_TEST.steps, ...DEFAULT_WORKFLOWS.IMPROVE.steps],
  };
}

function addCheckpoint(events: CheckpointEvent[], event: CheckpointEvent): void {
  events.push(event);
}

function nowIso(index: number): string {
  return new Date(Date.now() + index).toISOString();
}

export function runWorkflow(
  workflowSpec: WorkflowSpec,
  input: { userQuery: string; engineVersion: string },
): WorkflowRunResult {
  const workflow = flattenWorkflow(workflowSpec);
  const checkpoints: CheckpointEvent[] = [];
  const policyDecisions: PolicyDecision[] = [];
  const toolTraces: ToolTrace[] = [];
  const commands: { command: string; description: string }[] = [];
  const cliResults: CLIResult[] = [];
  const extractedParams: Record<string, string | number | boolean> = {};

  let eventCounter = 0;
  addCheckpoint(checkpoints, {
    stage: 'start',
    timestamp: nowIso(eventCounter++),
    note: `Workflow ${workflow.name} started`,
  });

  workflow.steps.forEach((step, index) => {
    addCheckpoint(checkpoints, {
      stage: 'step_start',
      timestamp: nowIso(eventCounter++),
      role: step.role,
      intent: step.intent,
      note: `Step ${index + 1} started`,
    });

    const query = extractStepQuery(input.userQuery, step.params);
    if (step.params) {
      Object.assign(extractedParams, step.params);
    }

    const planned = step.commandPlanTemplate
      ? {
          commands: step.commandPlanTemplate.map((command) => ({
            command,
            description: `Template command for ${step.intent}`,
          })),
          intent: step.intent,
        }
      : planExecution(step.intent, query);

    if (planned.error) {
      policyDecisions.push({
        timestamp: nowIso(eventCounter++),
        decision: 'deny',
        reason: planned.error,
        intent: step.intent,
      });
      addCheckpoint(checkpoints, {
        stage: 'step_end',
        timestamp: nowIso(eventCounter++),
        role: step.role,
        intent: step.intent,
        note: `Step ${index + 1} blocked by policy`,
      });
      return;
    }

    for (const plannedCommand of planned.commands) {
      const validationError = validateCommand(plannedCommand.command);
      if (validationError) {
        policyDecisions.push({
          timestamp: nowIso(eventCounter++),
          decision: 'deny',
          reason: validationError,
          command: plannedCommand.command,
          intent: step.intent,
        });
        continue;
      }

      policyDecisions.push({
        timestamp: nowIso(eventCounter++),
        decision: 'allow',
        reason: 'Allowed by command registry',
        command: plannedCommand.command,
        intent: step.intent,
      });

      addCheckpoint(checkpoints, {
        stage: 'execution',
        timestamp: nowIso(eventCounter++),
        role: step.role,
        intent: step.intent,
        command: plannedCommand.command,
        note: 'Command execution started',
      });

      const parsed = parseCommand(plannedCommand.command);
      const cliResult = executeCommand(parsed);
      commands.push(plannedCommand);
      cliResults.push(cliResult);

      const outputHashSeed = cliResult.lines.map((line) => `${line.style}:${line.text}`).join('\n');
      toolTraces.push({
        timestamp: nowIso(eventCounter++),
        tool: 'cli-engine',
        command: plannedCommand.command,
        ok: cliResult.ok,
        outputHash: outputHashSeed,
      });
    }

    addCheckpoint(checkpoints, {
      stage: 'step_end',
      timestamp: nowIso(eventCounter++),
      role: step.role,
      intent: step.intent,
      note: `Step ${index + 1} completed`,
    });
  });

  addCheckpoint(checkpoints, {
    stage: 'finish',
    timestamp: nowIso(eventCounter++),
    note: `Workflow ${workflow.name} finished`,
  });

  const combinedIntent = classifyIntent(input.userQuery).intent;
  const narrative = commands.length
    ? formatNarrative(combinedIntent, cliResults)
    : {
        summary: 'Workflow completed with partial results due to policy guardrails.',
        keyDrivers: ['One or more planned steps were denied by policy and skipped.'],
        recommendedAction: 'Review policy decisions and rerun in Single Analysis mode if needed.',
        confidenceNote: 'Confidence range is reduced because the workflow produced partial execution coverage.',
      };

  return {
    intent: combinedIntent,
    combinedNarrative: narrative.summary,
    commands,
    cliResults,
    checkpoints,
    policyDecisions,
    toolTraces,
    workflow: {
      name: workflow.name,
      steps: workflow.steps.map((step) => step.intent),
      agentRoles: workflow.steps.map((step) => step.role),
    },
    promptContext: {
      userQuery: input.userQuery,
      normalizedQuery: input.userQuery.trim().toLowerCase(),
      extractedParams,
    },
  };
}

export const DEFAULT_WORKFLOWS: Record<'UNDERSTAND' | 'STRESS_TEST' | 'IMPROVE', WorkflowSpec> = {
  UNDERSTAND: {
    name: 'UNDERSTAND',
    steps: [
      { role: AgentRole.ANALYST, intent: IntentKey.GRAPH_SIMULATE },
      { role: AgentRole.SCRIBE, intent: IntentKey.GRAPH_EXPLAIN },
    ],
  },
  STRESS_TEST: {
    name: 'STRESS_TEST',
    steps: [
      { role: AgentRole.SIMULATOR, intent: IntentKey.FLIP_DISTANCE },
      { role: AgentRole.GOVERNANCE_AUDITOR, intent: IntentKey.COUNTERFACTUAL_RUN },
    ],
  },
  IMPROVE: {
    name: 'IMPROVE',
    steps: [
      { role: AgentRole.EVIDENCE_PLANNER, intent: IntentKey.EVIDENCE_RANK },
      { role: AgentRole.EVIDENCE_PLANNER, intent: IntentKey.EVIDENCE_PLAN },
    ],
  },
};
