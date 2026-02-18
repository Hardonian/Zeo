import { describe, it, expect } from "vitest";
import { mkdtempSync, rmSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  activateDeterministicMode,
  deactivateDeterministicMode,
  getDeterministicIdCounter,
} from "@zeo/kernel";
import { makeNegotiationExample } from "./examples.js";
import { runDecision } from "./engine.js";
import {
  createSnapshot,
  saveSnapshot,
  loadSnapshot,
  getDefaultToolRegistry,
  computeOutputHash,
  validateSnapshotEnvironment,
} from "./snapshot.js";
import { replayRun } from "./replay-engine.js";

describe("snapshot replay determinism", () => {
  it("restores snapshot and replays with identical hash", () => {
    const baseDir = mkdtempSync(join(tmpdir(), "zeo-snapshots-"));

    try {
      activateDeterministicMode({ seed: "snapshot-replay-test" });
      const spec = makeNegotiationExample();
      const idOffset = getDeterministicIdCounter();
      const result = runDecision(spec, { depth: 2 });
      deactivateDeterministicMode();

      const snapshot = createSnapshot({
        spec,
        opts: { depth: 2, example: "negotiation" },
        result,
        toolRegistry: getDefaultToolRegistry(),
        durationMs: 1,
        deterministic: true,
        seed: "snapshot-replay-test",
        idCounterOffset: idOffset,
      });

      const path = saveSnapshot(snapshot, baseDir);
      expect(existsSync(path)).toBe(true);

      const loaded = loadSnapshot(snapshot.snapshotId, baseDir);
      expect(loaded).not.toBeNull();
      expect(loaded?.snapshotId).toBe(snapshot.snapshotId);

      const replay = replayRun(snapshot.snapshotId, baseDir, 1);
      expect(replay.verdict).toBe("PASS");
      expect(replay.originalOutputHash).toBe(snapshot.outputHash);
      expect(replay.replayOutputHash).toBe(snapshot.outputHash);
    } finally {
      deactivateDeterministicMode();
      rmSync(baseDir, { recursive: true, force: true });
    }
  });

  it("writes canonical snapshot serialization and validates environment", () => {
    const baseDir = mkdtempSync(join(tmpdir(), "zeo-snapshots-"));

    try {
      activateDeterministicMode({ seed: "snapshot-serialization-test" });
      const spec = makeNegotiationExample();
      const result = runDecision(spec, { depth: 2 });
      deactivateDeterministicMode();

      const snapshot = createSnapshot({
        spec,
        opts: { depth: 2, example: "negotiation" },
        result,
        toolRegistry: getDefaultToolRegistry(),
        durationMs: 1,
        deterministic: true,
        seed: "snapshot-serialization-test",
        idCounterOffset: 0,
      });

      const path = saveSnapshot(snapshot, baseDir);
      const savedContent = readFileSync(path, "utf8").trim();
      expect(savedContent.startsWith("{")).toBe(true);
      expect(JSON.parse(savedContent).pipelineHash).toBe(snapshot.pipelineHash);
      expect(validateSnapshotEnvironment(snapshot).ok).toBe(true);
      expect(computeOutputHash(result)).toBe(snapshot.outputHash);
    } finally {
      deactivateDeterministicMode();
      rmSync(baseDir, { recursive: true, force: true });
    }
  });
});
