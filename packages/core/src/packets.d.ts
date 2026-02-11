import type { DecisionSpec, DecisionResult, ObservationBatch, ZeoError, RegimeState, RunMeta, EvidencePacketJSON } from "@zeo/contracts";
export type { RunMeta, EvidencePacketJSON };
declare const ENGINE_VERSION = "0.2.7";
export interface EvidencePacketOptions {
    decisionSpec: DecisionSpec;
    decisionResult: DecisionResult;
    observationBatch?: ObservationBatch;
    runMeta: RunMeta;
    errors?: ZeoError[];
    currentRegime?: RegimeState;
    regimeAdjustmentsCount?: number;
}
export declare function buildEvidencePacket(options: EvidencePacketOptions): EvidencePacketJSON;
export declare function buildEvidencePacketMarkdown(packet: EvidencePacketJSON): string;
export { ENGINE_VERSION };
//# sourceMappingURL=packets.d.ts.map