import { ZeoCacheMesh } from "../cache/ZeoCacheMesh.js";
import type {
  ExecutionResult,
  ToolExecutionEvent,
  ZeoProtocolMessage,
  ZeoSubagentRole,
  ZeoToolManifest,
} from "../types/cache-mesh.js";

export interface ZeoTaskDefinition {
  readonly id: string;
  readonly role: ZeoSubagentRole;
  readonly systemPrompt: string;
  readonly prompt: string;
  readonly toolManifests?: readonly ZeoToolManifest[];
  readonly dependsOn?: readonly string[];
  readonly expectedTokens?: number;
  readonly pendingTool?: ToolExecutionEvent;
  readonly forceCloudFrontier?: boolean;
}

export interface ZeoTaskPlan {
  readonly sessionId: string;
  readonly tasks: readonly ZeoTaskDefinition[];
}

export interface ZeoTaskSuccess {
  readonly status: "completed";
  readonly taskId: string;
  readonly role: ZeoSubagentRole;
  readonly result: ExecutionResult;
}

export interface ZeoTaskFailure {
  readonly status: "failed";
  readonly taskId: string;
  readonly role: ZeoSubagentRole;
  readonly error: string;
}

export type ZeoTaskResult = ZeoTaskSuccess | ZeoTaskFailure;

export interface ZeoTaskRun {
  readonly sessionId: string;
  readonly results: readonly ZeoTaskResult[];
  readonly completed: number;
  readonly failed: number;
}

/**
 * Executes a validated dependency DAG in deterministic topological order.
 * Individual inference failures become typed task failures so a caller can
 * render a degraded result instead of propagating a user-facing 500.
 */
export class ZeoTaskHarness {
  public constructor(private readonly cacheMesh: ZeoCacheMesh) {}

  public async run(plan: ZeoTaskPlan): Promise<ZeoTaskRun> {
    validatePlan(plan);
    const orderedTasks = topologicalOrder(plan.tasks);
    const results = new Map<string, ZeoTaskResult>();

    for (const task of orderedTasks) {
      const dependencies = (task.dependsOn ?? []).map((dependencyId) => results.get(dependencyId));
      const failedDependency = dependencies.find((dependency): dependency is ZeoTaskFailure => dependency?.status === "failed");
      if (failedDependency !== undefined) {
        results.set(task.id, Object.freeze({
          status: "failed",
          taskId: task.id,
          role: task.role,
          error: `Dependency ${failedDependency.taskId} did not complete: ${failedDependency.error}`,
        }));
        continue;
      }

      const history = buildHistory(task, dependencies);
      const pendingTool = task.pendingTool;
      if (pendingTool !== undefined && this.cacheMesh.shouldSpeculativelyPrefill(pendingTool.estimatedDurationMs)) {
        void this.cacheMesh.triggerSpeculativePrefill(
          task.systemPrompt,
          task.toolManifests ?? [],
          history,
          task.role,
          plan.sessionId,
        );
      }

      try {
        const result = await this.cacheMesh.executeSessionTurn(
          task.role,
          plan.sessionId,
          task.systemPrompt,
          task.toolManifests ?? [],
          history,
          {
            expectedTokens: task.expectedTokens,
            isPendingToolReturn: pendingTool !== undefined,
            forceCloudFrontier: task.forceCloudFrontier,
          },
        );
        results.set(task.id, Object.freeze({ status: "completed", taskId: task.id, role: task.role, result }));
      } catch (error: unknown) {
        results.set(task.id, Object.freeze({
          status: "failed",
          taskId: task.id,
          role: task.role,
          error: describeFailure(error),
        }));
      }
    }

    const orderedResults = plan.tasks.map((task) => results.get(task.id)).filter(isTaskResult);
    const completed = orderedResults.filter((result) => result.status === "completed").length;
    return Object.freeze({
      sessionId: plan.sessionId,
      results: Object.freeze(orderedResults),
      completed,
      failed: orderedResults.length - completed,
    });
  }

}

function validatePlan(plan: ZeoTaskPlan): void {
  if (plan.sessionId.trim() === "") throw new Error("Zeo task plan sessionId must not be empty.");
  if (plan.tasks.length === 0) throw new Error("Zeo task plan must contain at least one task.");

  const taskIds = new Set<string>();
  for (const task of plan.tasks) {
    if (task.id.trim() === "") throw new Error("Zeo task ids must not be empty.");
    if (taskIds.has(task.id)) throw new Error(`Zeo task plan contains duplicate task id: ${task.id}.`);
    if (task.systemPrompt.trim() === "" || task.prompt.trim() === "") {
      throw new Error(`Zeo task ${task.id} requires a systemPrompt and prompt.`);
    }
    if (task.expectedTokens !== undefined && (!Number.isSafeInteger(task.expectedTokens) || task.expectedTokens <= 0)) {
      throw new Error(`Zeo task ${task.id} expectedTokens must be a positive integer.`);
    }
    taskIds.add(task.id);
  }

  for (const task of plan.tasks) {
    for (const dependencyId of task.dependsOn ?? []) {
      if (!taskIds.has(dependencyId)) {
        throw new Error(`Zeo task ${task.id} references missing dependency ${dependencyId}.`);
      }
      if (dependencyId === task.id) throw new Error(`Zeo task ${task.id} cannot depend on itself.`);
    }
  }
}

function topologicalOrder(tasks: readonly ZeoTaskDefinition[]): readonly ZeoTaskDefinition[] {
  const byId = new Map(tasks.map((task) => [task.id, task] as const));
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const ordered: ZeoTaskDefinition[] = [];

  const visit = (taskId: string): void => {
    if (visited.has(taskId)) return;
    if (visiting.has(taskId)) throw new Error(`Zeo task plan has a dependency cycle at ${taskId}.`);
    const task = byId.get(taskId);
    if (task === undefined) throw new Error(`Zeo task plan is missing task ${taskId}.`);
    visiting.add(taskId);
    for (const dependencyId of task.dependsOn ?? []) visit(dependencyId);
    visiting.delete(taskId);
    visited.add(taskId);
    ordered.push(task);
  };

  for (const task of tasks) visit(task.id);
  return Object.freeze(ordered);
}

function buildHistory(
  task: ZeoTaskDefinition,
  dependencies: readonly (ZeoTaskResult | undefined)[],
): readonly ZeoProtocolMessage[] {
  const history: ZeoProtocolMessage[] = [];
  for (const dependency of dependencies) {
    if (dependency?.status !== "completed") continue;
    history.push(Object.freeze({
      role: "assistant",
      content: dependency.result.blocks,
    }));
  }
  history.push(Object.freeze({ role: "user", content: task.prompt }));
  return Object.freeze(history);
}

function isTaskResult(value: ZeoTaskResult | undefined): value is ZeoTaskResult {
  return value !== undefined;
}

function describeFailure(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
