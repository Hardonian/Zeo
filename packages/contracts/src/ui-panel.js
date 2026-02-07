export function assertUiPanelManifest(x) {
    if (!isUiPanelManifest(x)) {
        throw new Error("Invalid UiPanelManifest");
    }
}
export function isUiPanelManifest(x) {
    if (typeof x !== "object" || x === null) {
        return false;
    }
    const m = x;
    return (typeof m.id === "string" &&
        typeof m.title === "string" &&
        typeof m.route === "string" &&
        typeof m.slot === "string" &&
        ["leftSidebar", "main", "rightInspector", "modal", "footer"].includes(m.slot) &&
        typeof m.kind === "string" &&
        ["react", "iframe"].includes(m.kind) &&
        typeof m.entry === "string" &&
        typeof m.version === "string" &&
        typeof m.capabilities === "object" &&
        m.capabilities !== null &&
        typeof m.dataDeps === "object" &&
        Array.isArray(m.dataDeps) &&
        typeof m.permissions === "object" &&
        m.permissions !== null);
}
export function assertUiBridgeMessage(x) {
    if (!isUiBridgeMessage(x)) {
        throw new Error("Invalid UiBridgeMessage");
    }
}
export function isUiBridgeMessage(x) {
    if (typeof x !== "object" || x === null) {
        return false;
    }
    const m = x;
    return (typeof m.direction === "string" &&
        ["panel->host", "host->panel"].includes(m.direction) &&
        typeof m.requestId === "string" &&
        typeof m.type === "string" &&
        [
            "ping",
            "get_state",
            "set_decision",
            "run_decision",
            "ingest_evidence_note",
            "ingest_signals_batch",
            "export_packet",
            "toast",
            "error",
        ].includes(m.type) &&
        m.payload !== undefined);
}
const ELEVATED_CAPABILITIES = [
    "needsNetwork",
    "needsFiles",
    "needsCamera",
    "needsMic",
    "needsOcr",
    "needsStt",
];
export function hasElevatedCapabilities(capabilities) {
    return ELEVATED_CAPABILITIES.some((cap) => capabilities[cap] === true);
}
export function denyDangerousPanel(manifest) {
    if (manifest.kind === "iframe") {
        const hasElevated = hasElevatedCapabilities(manifest.capabilities);
        if (hasElevated && !manifest.permissions.requireUserConfirm) {
            return `Iframe panel "${manifest.id}" requests elevated capabilities without user confirmation. Add requireUserConfirm: true to permissions.`;
        }
    }
    return null;
}
export function createDenialResponse(manifest) {
    const reason = denyDangerousPanel(manifest);
    return {
        type: "error",
        payload: {
            code: "PANEL_DENIED",
            message: reason ?? `Panel "${manifest.id}" was denied for security reasons.`,
        },
    };
}
//# sourceMappingURL=ui-panel.js.map