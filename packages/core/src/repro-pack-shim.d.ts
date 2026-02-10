declare module "@zeo/repro-pack" {
  export type Assumption = {
    key: string;
    label: string;
    value: unknown;
    units: string;
    source: "user" | "default" | "system";
    rationale: string;
    sensitivity: "low" | "med" | "high";
    provenance: { path?: string; derivedFrom?: string[] };
  };

  export type Inference = {
    key: string;
    value: unknown;
    units: string;
    method: string;
    inputs?: string[];
    uncertainty?: Uncertainty;
  };

  export type Uncertainty = {
    kind: "interval" | "stddev" | "distribution" | "unknown";
    params?: Record<string, unknown>;
    note?: string;
  };

  export type BudgetConstraints = {
    maxCost?: { amount: number; units: string };
    maxDuration?: { amount: number; units: string };
  };


  export interface AssumptionTracker {
    recordSystemAssumption(key: string, label: string, value: unknown, units: string, rationale: string): void;
    recordInference(inference: Inference): void;
    getAssumptions(): Assumption[];
    getInferences(): Inference[];
    getUncertaintyMap(): Record<string, Uncertainty>;
  }

  export type RunData = {
    assumptions?: Assumption[];
    uncertaintyMap?: Record<string, Uncertainty>;
    artifacts?: {
      voiRankings?: unknown;
      flipDistance?: unknown;
    };
    events?: Array<{ type?: string }>;
  };

  export function createZip(files: Record<string, string>): Uint8Array;
  export function sha256(content: string): string;
  export function readReproPackZip(buffer: Buffer): Record<string, string>;
}
