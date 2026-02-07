import type { UiPanelManifest, UiBridgeMessage, UiPanelCapabilities } from "./types.js";
export declare function assertUiPanelManifest(x: unknown): asserts x is UiPanelManifest;
export declare function isUiPanelManifest(x: unknown): x is UiPanelManifest;
export declare function assertUiBridgeMessage(x: unknown): asserts x is UiBridgeMessage;
export declare function isUiBridgeMessage(x: unknown): x is UiBridgeMessage;
export declare function hasElevatedCapabilities(capabilities: UiPanelCapabilities): boolean;
export declare function denyDangerousPanel(manifest: UiPanelManifest): string | null;
export declare function createDenialResponse(manifest: UiPanelManifest): {
    type: "error";
    payload: {
        code: string;
        message: string;
    };
};
//# sourceMappingURL=ui-panel.d.ts.map