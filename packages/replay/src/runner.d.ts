/**
 * Replay Runner - Deterministic replay pipeline
 *
 * Replays historical cases to measure calibration and produce
 * coverage reports.
 */
import type { ReplayCase, ReplayOptions, ReplayResult } from "@zeo/contracts";
/**
 * Replay a single case through the deterministic pipeline.
 */
export declare function replayCase(replayCase: ReplayCase, options: ReplayOptions): Promise<ReplayResult>;
//# sourceMappingURL=runner.d.ts.map
