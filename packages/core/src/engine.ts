import { QuantEngine } from "./quant-engine.js";
import { runDecision as kernelRunDecision } from "@zeo/kernel";
import type { DecisionSpec, DecisionResult } from "@zeo/contracts";
import type { RunDecisionOpts } from "@zeo/kernel";
export type { RunDecisionOpts };

// Re-export local things
export { QuantEngine } from "./quant-engine.js";

/**
 * Zeo core engine wrapper.
 * Delegates to @zeo/kernel while injecting the Node.js/Core-bound QuantEngine.
 */
export function runDecision(spec: DecisionSpec, opts?: RunDecisionOpts): DecisionResult {
  let quantEngineInstance;

  if (opts?.useQuantEngine) {
    quantEngineInstance = new QuantEngine();
  }

  return kernelRunDecision(spec, {
    ...opts,
    quantEngine: quantEngineInstance
  });
}
