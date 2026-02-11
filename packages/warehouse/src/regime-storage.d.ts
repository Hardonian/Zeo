import type { RegimeEvent, RegimeState } from "@zeo/contracts";
import type { WarehouseAdapter } from "./interfaces.js";
export interface RegimeWarehouse {
    putRegimeEvent(event: RegimeEvent): Promise<RegimeEvent>;
    getRegimeEvent(id: string): Promise<RegimeEvent | null>;
    listRegimeEvents(options?: {
        domain?: RegimeEvent["domain"];
        signalId?: string;
        since?: string;
        limit?: number;
    }): Promise<RegimeEvent[]>;
    putRegimeState(state: RegimeState): Promise<RegimeState>;
    getRegimeState(domain: RegimeState["domain"], signalId?: string): Promise<RegimeState | null>;
    listRegimeStates(domain?: RegimeState["domain"]): Promise<RegimeState[]>;
    getCurrentRegime(signalId: string): Promise<RegimeState | null>;
    getRegimeHistory(signalId: string, limit?: number): Promise<RegimeEvent[]>;
}
export declare function createRegimeWarehouse(adapter: WarehouseAdapter): RegimeWarehouse;
export declare function createRegimeEvent(params: Omit<RegimeEvent, "id" | "createdAt">): RegimeEvent;
export declare function createRegimeState(params: Omit<RegimeState, "updatedAt">): RegimeState;
//# sourceMappingURL=regime-storage.d.ts.map