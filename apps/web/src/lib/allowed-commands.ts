/**
 * Command Registry — strict allowlist of executable CLI commands.
 *
 * Only commands in this registry may execute. The execution planner
 * must not produce any command outside this list.
 *
 * No eval. No dynamic function calls. No remote execution.
 */

export interface AllowedCommand {
  domain: string;
  action: string;
  requiredFlags: string[];
  optionalFlags: string[];
  description: string;
}

const ALLOWED_COMMANDS: AllowedCommand[] = [
  // Counterfactual
  {
    domain: 'counterfactual',
    action: 'run',
    requiredFlags: [],
    optionalFlags: ['dataset'],
    description: 'Run counterfactual analysis on a dataset',
  },
  {
    domain: 'counterfactual',
    action: 'flip-distance',
    requiredFlags: [],
    optionalFlags: ['case'],
    description: 'Compute flip distance for a specific case',
  },

  // Evidence
  {
    domain: 'evidence',
    action: 'rank',
    requiredFlags: [],
    optionalFlags: ['budget'],
    description: 'Rank evidence sources by value-of-information',
  },
  {
    domain: 'evidence',
    action: 'plan',
    requiredFlags: [],
    optionalFlags: ['risk'],
    description: 'Generate evidence collection plan by risk level',
  },

  // Graph
  {
    domain: 'graph',
    action: 'simulate',
    requiredFlags: [],
    optionalFlags: ['node'],
    description: 'Simulate from a specific node in the decision graph',
  },
  {
    domain: 'graph',
    action: 'explain',
    requiredFlags: [],
    optionalFlags: ['path'],
    description: 'Explain a path through the decision graph',
  },

  // Uncertainty
  {
    domain: 'uncertainty',
    action: 'track',
    requiredFlags: [],
    optionalFlags: ['dataset'],
    description: 'Show confidence ranges for all cases',
  },
  {
    domain: 'uncertainty',
    action: 'calibrate',
    requiredFlags: [],
    optionalFlags: ['case'],
    description: 'Show calibration details for a case',
  },
  {
    domain: 'uncertainty',
    action: 'range',
    requiredFlags: [],
    optionalFlags: ['case'],
    description: 'Display confidence interval breakdown',
  },
  {
    domain: 'uncertainty',
    action: 'history',
    requiredFlags: [],
    optionalFlags: ['dataset'],
    description: 'Show belief-state change log',
  },

  // Epistemic
  {
    domain: 'epistemic',
    action: 'translate',
    requiredFlags: [],
    optionalFlags: ['from', 'to'],
    description: 'Translate between reasoning frameworks',
  },
  {
    domain: 'epistemic',
    action: 'align',
    requiredFlags: [],
    optionalFlags: ['dataset'],
    description: 'Align assumptions across cases',
  },
  {
    domain: 'epistemic',
    action: 'glossary',
    requiredFlags: [],
    optionalFlags: [],
    description: 'Show cross-framework glossary',
  },

  // Governance
  {
    domain: 'governance',
    action: 'audit',
    requiredFlags: [],
    optionalFlags: ['dataset'],
    description: 'Run governance audit on a dataset',
  },
  {
    domain: 'governance',
    action: 'policy-check',
    requiredFlags: [],
    optionalFlags: ['policy'],
    description: 'Check a specific policy rule',
  },
  {
    domain: 'governance',
    action: 'drift',
    requiredFlags: [],
    optionalFlags: ['dataset'],
    description: 'Detect governance drift',
  },
  {
    domain: 'governance',
    action: 'status',
    requiredFlags: [],
    optionalFlags: [],
    description: 'Show overall governance health',
  },

  // KPI
  {
    domain: 'kpi',
    action: 'health',
    requiredFlags: [],
    optionalFlags: ['dataset'],
    description: 'Show KPI health dashboard',
  },
  {
    domain: 'kpi',
    action: 'alert',
    requiredFlags: [],
    optionalFlags: ['threshold'],
    description: 'List KPIs exceeding alert threshold',
  },
  {
    domain: 'kpi',
    action: 'trend',
    requiredFlags: [],
    optionalFlags: ['metric'],
    description: 'Show trend for a specific metric',
  },
  {
    domain: 'kpi',
    action: 'summary',
    requiredFlags: [],
    optionalFlags: [],
    description: 'Show aggregate KPI summary',
  },
];

const COMMAND_SET = new Set(ALLOWED_COMMANDS.map(c => `${c.domain}:${c.action}`));

/**
 * Check if a domain/action pair is in the allowed command registry.
 * Returns true only for explicitly registered commands.
 */
export function isCommandAllowed(domain: string, action: string): boolean {
  return COMMAND_SET.has(`${domain}:${action}`);
}

/**
 * Validate a full CLI command string.
 * Returns an error message if disallowed, or null if valid.
 */
export function validateCommand(commandStr: string): string | null {
  const tokens = commandStr.trim().split(/\s+/);

  if (tokens[0] !== 'zeo') {
    return `Invalid program: "${tokens[0]}". Only "zeo" commands are allowed.`;
  }

  const domain = tokens[1] || '';
  const action = tokens[2] || '';

  if (!domain) {
    return 'Missing domain in command.';
  }

  if (!action) {
    return `Missing action for domain "${domain}".`;
  }

  if (!isCommandAllowed(domain, action)) {
    return `Command "zeo ${domain} ${action}" is not in the allowed command registry.`;
  }

  return null;
}

/** Get all allowed commands. */
export function getAllAllowedCommands(): AllowedCommand[] {
  return ALLOWED_COMMANDS;
}
