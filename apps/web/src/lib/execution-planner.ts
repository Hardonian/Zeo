/**
 * Execution Planner — maps classified intents to CLI command sequences.
 *
 * Deterministic. Uses default sample dataset. Parses simple numeric
 * modifiers from input. Never invents commands outside the registry.
 */

import { IntentKey } from './intent-router';
import { validateCommand } from './allowed-commands';

export interface PlannedCommand {
  command: string;
  description: string;
}

export interface ExecutionPlan {
  commands: PlannedCommand[];
  intent: IntentKey;
  error?: string;
}

/** Extract a numeric value from natural language (e.g., "5%" -> 5, "$200" -> 200). */
function extractNumber(input: string): number | null {
  // Match patterns like: 5%, $200, 100, 0.18
  const match = input.match(/[\$]?(\d+\.?\d*)%?/);
  if (match) {
    return parseFloat(match[1]);
  }
  return null;
}

/** Extract a case ID from input if mentioned. */
function extractCaseId(input: string): number | null {
  const lower = input.toLowerCase();
  // Look for explicit case mentions: "case 1024", "case id 1024", "#1024"
  const caseMatch = lower.match(/(?:case\s*(?:id\s*)?|#)(\d{4})/);
  if (caseMatch) {
    return parseInt(caseMatch[1], 10);
  }
  return null;
}

/** Extract a risk level from input. */
function extractRiskLevel(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes('high risk') || lower.includes('high-risk') || lower.includes('risk high')) {
    return 'high';
  }
  if (lower.includes('medium risk') || lower.includes('moderate') || lower.includes('risk medium')) {
    return 'medium';
  }
  return 'low';
}

/** Extract a node ID from input. */
function extractNodeId(input: string): string {
  const lower = input.toLowerCase();
  // Match "node B", "node a", single uppercase letter mention in graph context
  const nodeMatch = lower.match(/node\s+([a-g])/i);
  if (nodeMatch) {
    return nodeMatch[1].toUpperCase();
  }
  // Check for path mentions like "aggressive" -> B, "conservative" -> C
  if (lower.includes('aggressive') || lower.includes('high growth')) return 'B';
  if (lower.includes('conservative') || lower.includes('steady') || lower.includes('stable')) return 'C';
  return 'A';
}

/** Extract a graph path from input. */
function extractPath(input: string): string {
  // Match explicit path notation: "A->B", "B->D"
  const pathMatch = input.match(/([A-G])\s*->\s*([A-G])(?:\s*->\s*([A-G]))?/i);
  if (pathMatch) {
    let path = `${pathMatch[1].toUpperCase()}->${pathMatch[2].toUpperCase()}`;
    if (pathMatch[3]) {
      path += `->${pathMatch[3].toUpperCase()}`;
    }
    return path;
  }
  return 'B->D';
}

/**
 * Plan execution for a classified intent.
 *
 * Returns an ordered list of CLI commands to execute.
 * All commands are validated against the allowed command registry.
 */
export function planExecution(intent: IntentKey, input: string): ExecutionPlan {
  const commands: PlannedCommand[] = [];

  switch (intent) {
    case IntentKey.FLIP_DISTANCE: {
      const caseId = extractCaseId(input) ?? 1024;
      commands.push({
        command: `zeo counterfactual flip-distance --case ${caseId}`,
        description: `Compute flip distance for case ${caseId}`,
      });
      break;
    }

    case IntentKey.COUNTERFACTUAL_RUN: {
      commands.push({
        command: 'zeo counterfactual run --dataset sampleA',
        description: 'Run counterfactual analysis on sample dataset',
      });
      break;
    }

    case IntentKey.EVIDENCE_RANK: {
      const num = extractNumber(input);
      const budget = num && num > 10 ? Math.round(num) : 100;
      commands.push({
        command: `zeo evidence rank --budget ${budget}`,
        description: `Rank evidence sources within a $${budget} budget`,
      });
      break;
    }

    case IntentKey.EVIDENCE_PLAN: {
      const risk = extractRiskLevel(input);
      commands.push({
        command: `zeo evidence plan --risk ${risk}`,
        description: `Generate evidence collection plan for ${risk} risk level`,
      });
      break;
    }

    case IntentKey.GRAPH_SIMULATE: {
      const nodeId = extractNodeId(input);
      commands.push({
        command: `zeo graph simulate --node ${nodeId}`,
        description: `Simulate decision graph from node ${nodeId}`,
      });
      break;
    }

    case IntentKey.GRAPH_EXPLAIN: {
      const path = extractPath(input);
      commands.push({
        command: `zeo graph explain --path ${path}`,
        description: `Explain decision path ${path}`,
      });
      break;
    }

    case IntentKey.REGRET_PLAN: {
      const risk = extractRiskLevel(input);
      commands.push({
        command: `zeo evidence plan --risk ${risk}`,
        description: `Plan for minimum regret at ${risk} risk level`,
      });
      commands.push({
        command: 'zeo evidence rank --budget 100',
        description: 'Rank evidence to support risk mitigation',
      });
      break;
    }

    case IntentKey.ACTIVE_LEARNING_PLAN: {
      commands.push({
        command: 'zeo evidence rank --budget 100',
        description: 'Identify highest-value evidence to collect',
      });
      commands.push({
        command: 'zeo evidence plan --risk medium',
        description: 'Generate iterative learning plan',
      });
      break;
    }

    case IntentKey.UNKNOWN:
      return {
        commands: [],
        intent,
        error: "I'm not sure what you'd like to analyze. Try asking about decision stability, evidence value, or decision paths.",
      };
  }

  // Validate every planned command against the registry
  for (const planned of commands) {
    const validationError = validateCommand(planned.command);
    if (validationError) {
      return {
        commands: [],
        intent,
        error: `Security check failed: ${validationError}`,
      };
    }
  }

  return { commands, intent };
}
