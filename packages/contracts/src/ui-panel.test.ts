import { describe, it, expect } from "vitest";
import {
  isUiPanelManifest,
  assertUiPanelManifest,
  isUiBridgeMessage,
  assertUiBridgeMessage,
  denyDangerousPanel,
  hasElevatedCapabilities,
} from "./ui-panel";

describe("UiPanelManifest validation", () => {
  const validManifest = {
    id: "test-panel",
    title: "Test Panel",
    description: "A test panel",
    route: "/demo",
    slot: "main" as const,
    kind: "react" as const,
    entry: "./panel.tsx",
    version: "1.0.0",
    capabilities: { needsNetwork: true },
    dataDeps: ["DecisionSpec"],
    permissions: { requireUserConfirm: false },
  };

  it("should accept a valid manifest", () => {
    expect(isUiPanelManifest(validManifest)).toBe(true);
  });

  it("should reject a manifest missing required fields", () => {
    const invalid = { ...validManifest, id: undefined };
    expect(isUiPanelManifest(invalid)).toBe(false);
  });

  it("should reject a manifest with invalid slot", () => {
    const invalid = { ...validManifest, slot: "invalid" };
    expect(isUiPanelManifest(invalid)).toBe(false);
  });

  it("should reject a manifest with invalid kind", () => {
    const invalid = { ...validManifest, kind: "vue" };
    expect(isUiPanelManifest(invalid)).toBe(false);
  });

  it("should assert a valid manifest without throwing", () => {
    expect(() => assertUiPanelManifest(validManifest)).not.toThrow();
  });

  it("should throw on invalid manifest", () => {
    expect(() => assertUiPanelManifest({})).toThrow();
  });
});

describe("UiBridgeMessage validation", () => {
  const validMessage = {
    direction: "panel->host",
    requestId: "req-123",
    type: "get_state",
    payload: {},
  };

  it("should accept a valid message", () => {
    expect(isUiBridgeMessage(validMessage)).toBe(true);
  });

  it("should reject a message with invalid direction", () => {
    const invalid = { ...validMessage, direction: "host<-panel" };
    expect(isUiBridgeMessage(invalid)).toBe(false);
  });

  it("should reject a message with invalid type", () => {
    const invalid = { ...validMessage, type: "invalid" };
    expect(isUiBridgeMessage(invalid)).toBe(false);
  });

  it("should accept all valid message types", () => {
    const types = [
      "ping",
      "get_state",
      "set_decision",
      "run_decision",
      "ingest_evidence_note",
      "ingest_signals_batch",
      "export_packet",
      "toast",
      "error",
    ];
    for (const type of types) {
      expect(isUiBridgeMessage({ ...validMessage, type })).toBe(true);
    }
  });
});

describe("denyDangerousPanel", () => {
  it("should return null for safe iframe panels", () => {
    const manifest = {
      id: "safe-iframe",
      title: "Safe",
      route: "/safe",
      slot: "main" as const,
      kind: "iframe" as const,
      entry: "./panel.html",
      version: "1.0.0",
      capabilities: {},
      dataDeps: [],
      permissions: { requireUserConfirm: true },
    };
    expect(denyDangerousPanel(manifest)).toBe(null);
  });

  it("should return denial for iframe with elevated caps without confirmation", () => {
    const manifest = {
      id: "dangerous-iframe",
      title: "Dangerous",
      route: "/dangerous",
      slot: "main" as const,
      kind: "iframe" as const,
      entry: "./panel.html",
      version: "1.0.0",
      capabilities: { needsNetwork: true, needsFiles: true },
      dataDeps: [],
      permissions: { requireUserConfirm: false },
    };
    expect(denyDangerousPanel(manifest)).not.toBe(null);
  });

  it("should return null for react panels even with elevated caps", () => {
    const manifest = {
      id: "react-panel",
      title: "React",
      route: "/react",
      slot: "main" as const,
      kind: "react" as const,
      entry: "./panel.tsx",
      version: "1.0.0",
      capabilities: { needsNetwork: true },
      dataDeps: [],
      permissions: { requireUserConfirm: false },
    };
    expect(denyDangerousPanel(manifest)).toBe(null);
  });
});

describe("hasElevatedCapabilities", () => {
  it("should detect elevated capabilities", () => {
    expect(
      hasElevatedCapabilities({ needsNetwork: true })
    ).toBe(true);
    expect(
      hasElevatedCapabilities({ needsFiles: true })
    ).toBe(true);
    expect(
      hasElevatedCapabilities({ needsCamera: true })
    ).toBe(true);
    expect(hasElevatedCapabilities({})).toBe(false);
  });
});

