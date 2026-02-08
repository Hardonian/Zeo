import type { AnalysisPlan, AnalysisStep, PlanningOptions, PlanningResult } from "@zeo/contracts";
import { v4 as uuidv4 } from "uuid";

export interface PlannerConfig {
  maxSteps: number;
  enableParallelism: boolean;
  priorityThreshold: number;
}

export class AnalysisPlanner {
  private config: PlannerConfig;

  constructor(config: Partial<PlannerConfig> = {}) {
    this.config = {
      maxSteps: 10,
      enableParallelism: true,
      priorityThreshold: 0.5,
      ...config,
    };
  }

  async createPlan(
    objective: string,
    context: Record<string, unknown>,
    options: PlanningOptions = {}
  ): Promise<PlanningResult> {
    const planId = uuidv4();
    const steps = this.generateSteps(objective, context, options);
    
    const plan: AnalysisPlan = {
      id: planId,
      objective,
      steps,
      createdAt: new Date(),
      estimatedDuration: this.estimateDuration(steps),
      metadata: {
        contextKeys: Object.keys(context),
        stepCount: steps.length,
        parallelismEnabled: this.config.enableParallelism,
      },
    };

    return {
      plan,
      confidence: this.calculateConfidence(steps),
      warnings: this.generateWarnings(steps),
    };
  }

  private generateSteps(
    objective: string,
    context: Record<string, unknown>,
    options: PlanningOptions
  ): AnalysisStep[] {
    const steps: AnalysisStep[] = [];
    
    // Step 1: Context validation
    steps.push({
      id: uuidv4(),
      type: "validate",
      description: "Validate input context completeness",
      priority: 1,
      dependencies: [],
      estimatedDuration: 1000,
    });

    // Step 2: Data ingestion (if data sources provided)
    if (options.dataSources && options.dataSources.length > 0) {
      steps.push({
        id: uuidv4(),
        type: "ingest",
        description: `Ingest data from ${options.dataSources.length} source(s)`,
        priority: 2,
        dependencies: [steps[0].id],
        estimatedDuration: 5000 * options.dataSources.length,
      });
    }

    // Step 3: Analysis execution
    steps.push({
      id: uuidv4(),
      type: "analyze",
      description: `Execute analysis: ${objective}`,
      priority: 3,
      dependencies: steps.length > 1 ? [steps[steps.length - 1].id] : [steps[0].id],
      estimatedDuration: 10000,
    });

    // Step 4: Synthesis (if enabled)
    if (options.includeSynthesis !== false) {
      steps.push({
        id: uuidv4(),
        type: "synthesize",
        description: "Synthesize findings into coherent output",
        priority: 4,
        dependencies: [steps[steps.length - 1].id],
        estimatedDuration: 3000,
      });
    }

    // Step 5: Validation
    steps.push({
      id: uuidv4(),
      type: "validate",
      description: "Validate output against epistemic standards",
      priority: 5,
      dependencies: [steps[steps.length - 1].id],
      estimatedDuration: 2000,
    });

    return steps.slice(0, this.config.maxSteps);
  }

  private estimateDuration(steps: AnalysisStep[]): number {
    return steps.reduce((total, step) => total + step.estimatedDuration, 0);
  }

  private calculateConfidence(steps: AnalysisStep[]): number {
    const totalSteps = steps.length;
    const validationSteps = steps.filter((s) => s.type === "validate").length;
    return Math.min(0.95, 0.6 + validationSteps * 0.1 + totalSteps * 0.02);
  }

  private generateWarnings(steps: AnalysisStep[]): string[] {
    const warnings: string[] = [];
    
    if (steps.length >= this.config.maxSteps) {
      warnings.push("Plan reached maximum step limit; consider breaking into sub-analyses");
    }
    
    const hasValidation = steps.some((s) => s.type === "validate");
    if (!hasValidation) {
      warnings.push("No validation steps detected; epistemic confidence may be reduced");
    }

    return warnings;
  }

  optimizePlan(plan: AnalysisPlan): AnalysisPlan {
    const optimizedSteps = this.identifyParallelSteps(plan.steps);
    
    return {
      ...plan,
      steps: optimizedSteps,
      metadata: {
        ...plan.metadata,
        optimized: true,
        parallelGroups: this.computeParallelGroups(optimizedSteps),
      },
    };
  }

  private identifyParallelSteps(steps: AnalysisStep[]): AnalysisStep[] {
    if (!this.config.enableParallelism) return steps;

    return steps.map((step, index) => {
      if (step.priority <= this.config.priorityThreshold) {
        return {
          ...step,
          canParallelize: true,
        };
      }
      return step;
    });
  }

  private computeParallelGroups(steps: AnalysisStep[]): string[][] {
    const groups: string[][] = [];
    const processed = new Set<string>();

    for (const step of steps) {
      if (processed.has(step.id)) continue;

      const group = [step.id];
      processed.add(step.id);

      if (step.canParallelize) {
        for (const other of steps) {
          if (
            other.id !== step.id &&
            !processed.has(other.id) &&
            other.canParallelize &&
            other.priority === step.priority
          ) {
            group.push(other.id);
            processed.add(other.id);
          }
        }
      }

      groups.push(group);
    }

    return groups;
  }
}

export function createPlanner(config?: Partial<PlannerConfig>): AnalysisPlanner {
  return new AnalysisPlanner(config);
}
