import type {
  UiPanelManifest,
  UiBridgeMessage,
  UiPanelCapabilities,
} from "./types.js";

export function assertUiPanelManifest(x: unknown): asserts x is UiPanelManifest {
  if (!isUiPanelManifest(x)) {
    throw new Error("Invalid UiPanelManifest");
  }
}

export function isUiPanelManifest(x: unknown): x is UiPanelManifest {
  if (typeof x !== "object" || x === null) {
    return false;
  }
  const m = x as Record<string, unknown>;
  return (
    typeof m.id === "string" &&
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
    m.permissions !== null
  );
}

export function assertUiBridgeMessage(x: unknown): asserts x is UiBridgeMessage {
  if (!isUiBridgeMessage(x)) {
    throw new Error("Invalid UiBridgeMessage");
  }
}

export function isUiBridgeMessage(x: unknown): x is UiBridgeMessage {
  if (typeof x !== "object" || x === null) {
    return false;
  }
  const m = x as Record<string, unknown>;
  return (
    typeof m.direction === "string" &&
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
    m.payload !== undefined
  );
}

const ELEVATED_CAPABILITIES: (keyof UiPanelCapabilities)[] = [
  "needsNetwork",
  "needsFiles",
  "needsCamera",
  "needsMic",
  "needsOcr",
  "needsStt",
];

export function hasElevatedCapabilities(capabilities: UiPanelCapabilities): boolean {
  return ELEVATED_CAPABILITIES.some((cap) => capabilities[cap] === true);
}

export function denyDangerousPanel(manifest: UiPanelManifest): string | null {
  if (manifest.kind === "iframe") {
    const hasElevated = hasElevatedCapabilities(manifest.capabilities);
    if (hasElevated && !manifest.permissions.requireUserConfirm) {
      return `Iframe panel "${manifest.id}" requests elevated capabilities without user confirmation. Add requireUserConfirm: true to permissions.`;
    }
  }
  return null;
}

export function createDenialResponse(manifest: UiPanelManifest): {
  type: "error";
  payload: { code: string; message: string };
} {
  const reason = denyDangerousPanel(manifest);
  return {
    type: "error",
    payload: {
      code: "PANEL_DENIED",
      message: reason ?? `Panel "${manifest.id}" was denied for security reasons.`,
    },
  };
}
