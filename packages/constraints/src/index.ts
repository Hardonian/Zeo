/**
 * Constraint Propagation Engine
 *
 * Prevents ranking or recommending infeasible actions.
 * Supports hard/soft/temporal/budget/irreversibility/legal constraints.
 */

/**
 * Types of constraints
 */
export type ConstraintType = "hard" | "soft" | "temporal" | "budget" | "irreversibility" | "legal" | "ethical";

/**
 * Base constraint interface
 */
export interface BaseConstraint {
  id: string;
  type: ConstraintType;
  description: string;
  createdAt: string;
}

/**
 * Hard constraint - must never be violated
 */
export interface HardConstraint extends BaseConstraint {
  type: "hard";
  predicate: (context: ConstraintContext) => boolean;
  violationMessage: string;
}

/**
 * Soft constraint - penalized in scoring
 */
export interface SoftConstraint extends BaseConstraint {
  type: "soft";
  penalty: number; // 0-1 penalty to apply
  predicate: (context: ConstraintContext) => boolean;
}

/**
 * Temporal constraint - time-based
 */
export interface TemporalConstraint extends BaseConstraint {
  type: "temporal";
  notBefore?: string; // ISO timestamp
  notAfter?: string;  // ISO timestamp
  timeZone?: string;
}

/**
 * Budget constraint - resource limits
 */
export interface BudgetConstraint extends BaseConstraint {
  type: "budget";
  resource: string;
  maxAmount: number;
  currentAmount: number;
  unit: string;
}

/**
 * Irreversibility constraint - actions that cannot be undone
 */
export interface IrreversibilityConstraint extends BaseConstraint {
  type: "irreversibility";
  actionPattern: string; // regex or pattern to match actions
  requiresConfirmation: boolean;
  confirmationThreshold?: number; // minimum confidence required
}

/**
 * Legal constraint - regulatory/legal requirements
 */
export interface LegalConstraint extends BaseConstraint {
  type: "legal";
  jurisdiction: string;
  regulation: string;
  predicate: (context: ConstraintContext) => boolean;
}

/**
 * Ethical constraint - ethical guidelines
 */
export interface EthicalConstraint extends BaseConstraint {
  type: "ethical";
  principle: string; // e.g., "do_no_harm", "fairness", "transparency"
  predicate: (context: ConstraintContext) => boolean;
  severity: "blocking" | "warning";
}

/**
 * Union type for all constraints
 */
export type Constraint =
  | HardConstraint
  | SoftConstraint
  | TemporalConstraint
  | BudgetConstraint
  | IrreversibilityConstraint
  | LegalConstraint
  | EthicalConstraint;

/**
 * Context provided to constraint predicates
 */
export interface ConstraintContext {
  actionId: string;
  actionType: string;
  variables: Record<string, unknown>;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

/**
 * Action node in the constraint graph
 */
export interface ActionNode {
  id: string;
  type: "action";
  actionType: string;
  variables: Record<string, unknown>;
  infeasible: boolean;
  infeasibilityReason?: string;
  dominatedBy?: string; // id of dominating action
  constraints: string[]; // constraint IDs that apply
}

/**
 * Variable node in the constraint graph
 */
export interface VariableNode {
  id: string;
  type: "variable";
  value: unknown;
  constraints: string[];
}

/**
 * Resource node in the constraint graph
 */
export interface ResourceNode {
  id: string;
  type: "resource";
  capacity: number;
  allocated: number;
  unit: string;
}

/**
 * Union type for all graph nodes
 */
export type ConstraintNode = ActionNode | VariableNode | ResourceNode;

/**
 * Edge types in constraint graph
 */
export type EdgeType = "dependency" | "consumption" | "exclusion" | "enables";

/**
 * Edge in constraint graph
 */
export interface ConstraintEdge {
  id: string;
  from: string;
  to: string;
  type: EdgeType;
  weight?: number;
}

/**
 * Constraint graph structure
 */
export interface ConstraintGraph {
  nodes: Map<string, ConstraintNode>;
  edges: Map<string, ConstraintEdge>;
  constraints: Map<string, Constraint>;
}

/**
 * Result of constraint propagation
 */
export interface PropagationResult {
  infeasibleActions: string[];
  dominatedActions: Array<{ actionId: string; dominatedBy: string; reason: string }>;
  softPenalties: Map<string, number>;
  constraintViolations: Array<{ constraintId: string; actionId: string; message: string }>;
}

/**
 * Create a new constraint graph
 */
export function createConstraintGraph(): ConstraintGraph {
  return {
    nodes: new Map(),
    edges: new Map(),
    constraints: new Map(),
  };
}

/**
 * Add a node to the constraint graph
 */
export function addNode(graph: ConstraintGraph, node: ConstraintNode): void {
  graph.nodes.set(node.id, node);
}

/**
 * Add an edge to the constraint graph
 */
export function addEdge(graph: ConstraintGraph, edge: ConstraintEdge): void {
  graph.edges.set(edge.id, edge);
}

/**
 * Add a constraint to the graph
 */
export function addConstraint(graph: ConstraintGraph, constraint: Constraint): void {
  graph.constraints.set(constraint.id, constraint);
}

/**
 * Check if a temporal constraint is satisfied
 */
function checkTemporalConstraint(constraint: TemporalConstraint, timestamp: string): boolean {
  const now = new Date(timestamp);
  
  if (constraint.notBefore) {
    const notBefore = new Date(constraint.notBefore);
    if (now < notBefore) return false;
  }
  
  if (constraint.notAfter) {
    const notAfter = new Date(constraint.notAfter);
    if (now > notAfter) return false;
  }
  
  return true;
}

/**
 * Check if a budget constraint is satisfied
 */
function checkBudgetConstraint(constraint: BudgetConstraint, amount: number): boolean {
  return (constraint.currentAmount + amount) <= constraint.maxAmount;
}

/**
 * Check if an action matches an irreversibility pattern
 */
function matchesIrreversibilityPattern(pattern: string, actionType: string): boolean {
  // Simple string matching - could be expanded to regex
  return actionType.toLowerCase().includes(pattern.toLowerCase());
}

/**
 * Find dependencies of an action
 */
function findDependencies(graph: ConstraintGraph, actionId: string): string[] {
  const deps: string[] = [];
  for (const edge of graph.edges.values()) {
    if (edge.type === "dependency" && edge.to === actionId) {
      deps.push(edge.from);
    }
  }
  return deps;
}

/**
 * Find resources consumed by an action
 */
function findResourceConsumption(graph: ConstraintGraph, actionId: string): Array<{ resourceId: string; edge: ConstraintEdge }> {
  const consumption: Array<{ resourceId: string; edge: ConstraintEdge }> = [];
  for (const edge of graph.edges.values()) {
    if (edge.type === "consumption" && edge.from === actionId) {
      consumption.push({ resourceId: edge.to, edge });
    }
  }
  return consumption;
}

/**
 * Find mutually exclusive actions
 */
function findExclusions(graph: ConstraintGraph, actionId: string): string[] {
  const exclusions: string[] = [];
  for (const edge of graph.edges.values()) {
    if (edge.type === "exclusion") {
      if (edge.from === actionId) exclusions.push(edge.to);
      if (edge.to === actionId) exclusions.push(edge.from);
    }
  }
  return exclusions;
}

/**
 * Propagate constraints through the graph
 */
export function propagateConstraints(
  graph: ConstraintGraph,
  context: Omit<ConstraintContext, "actionId" | "actionType">
): PropagationResult {
  const infeasibleActions: string[] = [];
  const dominatedActions: Array<{ actionId: string; dominatedBy: string; reason: string }> = [];
  const softPenalties = new Map<string, number>();
  const constraintViolations: Array<{ constraintId: string; actionId: string; message: string }> = [];

  // First pass: evaluate all constraints on each action
  for (const node of graph.nodes.values()) {
    if (node.type !== "action") continue;

    const actionContext: ConstraintContext = {
      ...context,
      actionId: node.id,
      actionType: node.actionType,
      variables: { ...context.variables, ...node.variables },
    };

    // Check constraints attached to this action
    for (const constraintId of node.constraints) {
      const constraint = graph.constraints.get(constraintId);
      if (!constraint) continue;

      switch (constraint.type) {
        case "hard": {
          try {
            if (!constraint.predicate(actionContext)) {
              infeasibleActions.push(node.id);
              constraintViolations.push({
                constraintId,
                actionId: node.id,
                message: constraint.violationMessage,
              });
            }
          } catch {
            // Predicate failed to evaluate - treat as violation
            infeasibleActions.push(node.id);
            constraintViolations.push({
              constraintId,
              actionId: node.id,
              message: `Constraint evaluation failed: ${constraint.violationMessage}`,
            });
          }
          break;
        }

        case "soft": {
          try {
            if (!constraint.predicate(actionContext)) {
              const currentPenalty = softPenalties.get(node.id) ?? 0;
              softPenalties.set(node.id, currentPenalty + constraint.penalty);
            }
          } catch {
            // Predicate failed - apply penalty
            const currentPenalty = softPenalties.get(node.id) ?? 0;
            softPenalties.set(node.id, currentPenalty + constraint.penalty);
          }
          break;
        }

        case "temporal": {
          if (!checkTemporalConstraint(constraint, context.timestamp)) {
            infeasibleActions.push(node.id);
            constraintViolations.push({
              constraintId,
              actionId: node.id,
              message: `Temporal constraint violated: not valid at ${context.timestamp}`,
            });
          }
          break;
        }

        case "budget": {
          // Budget constraints are checked during resource allocation
          const consumption = findResourceConsumption(graph, node.id);
          const relevantConsumption = consumption.find(c => c.resourceId === constraint.resource);
          if (relevantConsumption && !checkBudgetConstraint(constraint, relevantConsumption.edge.weight ?? 0)) {
            infeasibleActions.push(node.id);
            constraintViolations.push({
              constraintId,
              actionId: node.id,
              message: `Budget constraint violated for resource ${constraint.resource}`,
            });
          }
          break;
        }

        case "irreversibility": {
          if (matchesIrreversibilityPattern(constraint.actionPattern, node.actionType)) {
            // Mark as requiring confirmation but not infeasible
            // This is informational for the decision maker
          }
          break;
        }

        case "legal": {
          try {
            if (!constraint.predicate(actionContext)) {
              infeasibleActions.push(node.id);
              constraintViolations.push({
                constraintId,
                actionId: node.id,
                message: `Legal constraint violated: ${constraint.regulation} in ${constraint.jurisdiction}`,
              });
            }
          } catch {
            infeasibleActions.push(node.id);
            constraintViolations.push({
              constraintId,
              actionId: node.id,
              message: `Legal constraint evaluation failed: ${constraint.regulation}`,
            });
          }
          break;
        }

        case "ethical": {
          try {
            if (!constraint.predicate(actionContext)) {
              if (constraint.severity === "blocking") {
                infeasibleActions.push(node.id);
              }
              constraintViolations.push({
                constraintId,
                actionId: node.id,
                message: `Ethical constraint violated: ${constraint.principle}`,
              });
            }
          } catch {
            if (constraint.severity === "blocking") {
              infeasibleActions.push(node.id);
            }
            constraintViolations.push({
              constraintId,
              actionId: node.id,
              message: `Ethical constraint evaluation failed: ${constraint.principle}`,
            });
          }
          break;
        }
      }
    }
  }

  // Second pass: check dependencies
  // An action is infeasible if any of its dependencies are infeasible
  // Find all actions that depend on infeasible actions
  for (const infeasibleId of infeasibleActions) {
    for (const edge of graph.edges.values()) {
      if (edge.type === "dependency" && edge.from === infeasibleId) {
        const dependentActionId = edge.to;
        const dependentNode = graph.nodes.get(dependentActionId);
        if (dependentNode && dependentNode.type === "action" && !infeasibleActions.includes(dependentActionId)) {
          dominatedActions.push({
            actionId: dependentActionId,
            dominatedBy: infeasibleId,
            reason: `Dependency ${infeasibleId} is infeasible`,
          });
        }
      }
    }
  }

  // Third pass: check exclusions
  // If two actions are mutually exclusive, the lower-ranked one is dominated
  for (const node of graph.nodes.values()) {
    if (node.type !== "action" || node.infeasible) continue;

    const exclusions = findExclusions(graph, node.id);
    for (const excludedId of exclusions) {
      const excludedNode = graph.nodes.get(excludedId);
      if (excludedNode && excludedNode.type === "action" && !excludedNode.infeasible) {
        // Note: actual dominance would depend on the ranking
        // This marks them as potentially conflicting
        dominatedActions.push({
          actionId: excludedId,
          dominatedBy: node.id,
          reason: `Mutually exclusive with ${node.id}`,
        });
      }
    }
  }

  // Remove duplicates from infeasible actions
  const uniqueInfeasible = [...new Set(infeasibleActions)];

  return {
    infeasibleActions: uniqueInfeasible,
    dominatedActions,
    softPenalties,
    constraintViolations,
  };
}

/**
 * Create a hard constraint
 */
export function createHardConstraint(
  id: string,
  description: string,
  predicate: (context: ConstraintContext) => boolean,
  violationMessage: string
): HardConstraint {
  return {
    id,
    type: "hard",
    description,
    predicate,
    violationMessage,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Create a soft constraint
 */
export function createSoftConstraint(
  id: string,
  description: string,
  penalty: number,
  predicate: (context: ConstraintContext) => boolean
): SoftConstraint {
  return {
    id,
    type: "soft",
    description,
    penalty,
    predicate,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Create a temporal constraint
 */
export function createTemporalConstraint(
  id: string,
  description: string,
  options: { notBefore?: string; notAfter?: string; timeZone?: string }
): TemporalConstraint {
  return {
    id,
    type: "temporal",
    description,
    notBefore: options.notBefore,
    notAfter: options.notAfter,
    timeZone: options.timeZone,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Create a budget constraint
 */
export function createBudgetConstraint(
  id: string,
  description: string,
  resource: string,
  maxAmount: number,
  currentAmount: number,
  unit: string
): BudgetConstraint {
  return {
    id,
    type: "budget",
    description,
    resource,
    maxAmount,
    currentAmount,
    unit,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Create an irreversibility constraint
 */
export function createIrreversibilityConstraint(
  id: string,
  description: string,
  actionPattern: string,
  requiresConfirmation = true,
  confirmationThreshold?: number
): IrreversibilityConstraint {
  return {
    id,
    type: "irreversibility",
    description,
    actionPattern,
    requiresConfirmation,
    confirmationThreshold,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Create a legal constraint
 */
export function createLegalConstraint(
  id: string,
  description: string,
  jurisdiction: string,
  regulation: string,
  predicate: (context: ConstraintContext) => boolean
): LegalConstraint {
  return {
    id,
    type: "legal",
    description,
    jurisdiction,
    regulation,
    predicate,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Create an ethical constraint
 */
export function createEthicalConstraint(
  id: string,
  description: string,
  principle: string,
  predicate: (context: ConstraintContext) => boolean,
  severity: "blocking" | "warning" = "warning"
): EthicalConstraint {
  return {
    id,
    type: "ethical",
    description,
    principle,
    predicate,
    severity,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Create an action node
 */
export function createActionNode(
  id: string,
  actionType: string,
  variables: Record<string, unknown> = {},
  constraintIds: string[] = []
): ActionNode {
  return {
    id,
    type: "action",
    actionType,
    variables,
    infeasible: false,
    constraints: constraintIds,
  };
}

/**
 * Create a dependency edge
 */
export function createDependencyEdge(from: string, to: string): ConstraintEdge {
  return {
    id: `${from}-depends-${to}`,
    from,
    to,
    type: "dependency",
  };
}

/**
 * Create a consumption edge
 */
export function createConsumptionEdge(from: string, to: string, amount: number): ConstraintEdge {
  return {
    id: `${from}-consumes-${to}-${amount}`,
    from,
    to,
    type: "consumption",
    weight: amount,
  };
}

/**
 * Create an exclusion edge
 */
export function createExclusionEdge(action1: string, action2: string): ConstraintEdge {
  return {
    id: `${action1}-excludes-${action2}`,
    from: action1,
    to: action2,
    type: "exclusion",
  };
}

/**
 * Filter infeasible actions from a ranking
 */
export function filterInfeasibleActions<T extends { id: string }>(
  ranking: T[],
  infeasibleIds: Set<string>
): T[] {
  return ranking.filter(item => !infeasibleIds.has(item.id));
}

/**
 * Apply soft penalties to action scores
 */
export function applySoftPenalties<T extends { id: string; score: number }>(
  ranking: T[],
  penalties: Map<string, number>
): T[] {
  return ranking.map(item => {
    const penalty = penalties.get(item.id) ?? 0;
    return {
      ...item,
      score: Math.max(0, item.score - penalty),
    };
  });
}

