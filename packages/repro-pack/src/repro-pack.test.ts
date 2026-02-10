import { describe, it, expect } from "vitest";
import {
    buildReproPackContents,
    buildReproPackZip,
    sha256,
} from "./pack-builder.js";
import {
    validatePack,
    parsePack,
    deepDiff,
    replayFromPack,
    EXIT_CODES,
} from "./replay.js";
import { createAssumptionTracker } from "./assumptions.js";
import type { RunData, Assumption, Uncertainty } from "./types.js";

// ─── Test fixtures ──────────────────────────────────────────────────────────

function makeFixtureRunData(): RunData {
    return {
        inputs: { question: "Should we proceed?", budget: 1000 },
        assumptions: [
            {
                key: "discount_rate",
                label: "Discount Rate",
                value: 0.05,
                units: "fraction",
                source: "default",
                rationale: "Standard corporate discount rate",
                sensitivity: "high",
                provenance: { path: "system default" },
            },
            {
                key: "market_growth",
                label: "Market Growth Rate",
                value: 0.03,
                units: "fraction",
                source: "user",
                rationale: "User-specified growth expectation",
                sensitivity: "med",
                provenance: { path: "user input" },
            },
        ],
        uncertaintyMap: {
            discount_rate: {
                kind: "interval",
                params: { low: 0.03, high: 0.08 },
                method: "historical range",
            },
            market_growth: {
                kind: "unknown",
                params: {},
                note: "No reliable forecast available",
            },
        },
        artifacts: {
            flipDistance: { variable: "x", distance: 0.15 },
            voiRankings: [{ candidateId: "c1", score: 0.8 }],
            evidencePlan: { steps: ["measure x", "check y"] },
        },
        outputs: {
            recommendation: "proceed",
            confidence: 0.72,
            explanation: "Benefits outweigh costs under most scenarios",
        },
        events: [
            {
                id: "evt-1",
                timestamp: "2026-01-01T00:00:00Z",
                type: "RUN_STARTED",
                data: { runId: "run-123" },
            },
            {
                id: "evt-2",
                timestamp: "2026-01-01T00:00:01Z",
                type: "ASSUMPTION_APPLIED",
                data: { key: "discount_rate" },
            },
            {
                id: "evt-3",
                timestamp: "2026-01-01T00:00:02Z",
                type: "RUN_COMPLETED",
                data: { runId: "run-123" },
            },
        ],
        seed: "test-seed-42",
    };
}

// ─── Pack builder tests ─────────────────────────────────────────────────────

describe("pack-builder", () => {
    it("produces all required files", () => {
        const runData = makeFixtureRunData();
        const contents = buildReproPackContents(
            { runId: "run-123", tenantId: "tenant-1", actor: "user-1", requestId: "req-abc" },
            runData,
            "1.0.0",
            "abc1234",
        );

        expect(contents["manifest.json"]).toBeDefined();
        expect(contents["inputs.json"]).toBeDefined();
        expect(contents["assumptions.json"]).toBeDefined();
        expect(contents["artifacts/flip_distance.json"]).toBeDefined();
        expect(contents["artifacts/voi_rankings.json"]).toBeDefined();
        expect(contents["artifacts/evidence_plan.json"]).toBeDefined();
        expect(contents["outputs.json"]).toBeDefined();
        expect(contents["events.jsonl"]).toBeDefined();
        expect(contents["checksums.txt"]).toBeDefined();
    });

    it("checksums match file contents", () => {
        const runData = makeFixtureRunData();
        const contents = buildReproPackContents(
            { runId: "run-123", tenantId: "t", actor: "a", requestId: "r" },
            runData,
        );

        const checksumLines = contents["checksums.txt"].split("\n");
        for (const line of checksumLines) {
            const match = line.match(/^([a-f0-9]{64})\s{2}(.+)$/);
            expect(match).not.toBeNull();
            const [, hash, filename] = match!;
            const fileContent = (contents as Record<string, string>)[filename!];
            expect(fileContent).toBeDefined();
            expect(sha256(fileContent!)).toBe(hash);
        }
    });

    it("manifest contains correct metadata", () => {
        const runData = makeFixtureRunData();
        const contents = buildReproPackContents(
            { runId: "run-123", tenantId: "tenant-1", actor: "user-1", requestId: "req-abc" },
            runData,
            "2.0.0",
            "deadbeef",
        );
        const manifest = JSON.parse(contents["manifest.json"]);
        expect(manifest.schemaVersion).toBe("1.0.0");
        expect(manifest.appVersion).toBe("2.0.0");
        expect(manifest.gitSha).toBe("deadbeef");
        expect(manifest.runId).toBe("run-123");
        expect(manifest.tenantId).toBe("tenant-1");
        expect(manifest.requestId).toBe("req-abc");
    });

    it("events are sorted by timestamp", () => {
        const runData = makeFixtureRunData();
        const contents = buildReproPackContents(
            { runId: "r", tenantId: "t", actor: "a", requestId: "r" },
            runData,
        );
        const lines = contents["events.jsonl"].split("\n").filter(Boolean);
        const events = lines.map((l) => JSON.parse(l));
        for (let i = 1; i < events.length; i++) {
            expect(events[i].timestamp >= events[i - 1].timestamp).toBe(true);
        }
    });

    it("produces a valid zip", () => {
        const runData = makeFixtureRunData();
        const contents = buildReproPackContents(
            { runId: "r", tenantId: "t", actor: "a", requestId: "r" },
            runData,
        );
        const zip = buildReproPackZip(contents);
        expect(zip).toBeInstanceOf(Uint8Array);
        expect(zip.length).toBeGreaterThan(0);
        // Check ZIP magic header
        expect(zip[0]).toBe(0x50);
        expect(zip[1]).toBe(0x4b);
        expect(zip[2]).toBe(0x03);
        expect(zip[3]).toBe(0x04);
    });

    it("sanitizes secrets in pack contents", () => {
        const runData = makeFixtureRunData();
        runData.inputs = {
            ...runData.inputs,
            apiKey: "sk-secret1234567890123456",
        };
        const contents = buildReproPackContents(
            { runId: "r", tenantId: "t", actor: "a", requestId: "r" },
            runData,
        );
        expect(contents["inputs.json"]).not.toContain("sk-secret1234567890123456");
        expect(contents["inputs.json"]).toContain("[REDACTED]");
    });
});

// ─── Replay tests ───────────────────────────────────────────────────────────

describe("replay", () => {
    it("validates a correct pack", () => {
        const runData = makeFixtureRunData();
        const contents = buildReproPackContents(
            { runId: "r", tenantId: "t", actor: "a", requestId: "r" },
            runData,
        );
        const result = validatePack(contents);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it("rejects packs with missing files", () => {
        const result = validatePack({ "manifest.json": "{}" });
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
    });

    it("detects checksum tamper", () => {
        const runData = makeFixtureRunData();
        const contents = buildReproPackContents(
            { runId: "r", tenantId: "t", actor: "a", requestId: "r" },
            runData,
        );
        // Tamper with inputs
        const tampered = { ...contents, "inputs.json": '{"tampered": true}' };
        const result = validatePack(tampered);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.includes("Checksum mismatch"))).toBe(true);
    });

    it("parses a pack correctly", () => {
        const runData = makeFixtureRunData();
        const contents = buildReproPackContents(
            { runId: "run-123", tenantId: "t", actor: "a", requestId: "r" },
            runData,
        );
        const parsed = parsePack(contents);
        expect(parsed.manifest.runId).toBe("run-123");
        expect(parsed.assumptions.length).toBe(2);
        expect(parsed.events.length).toBe(3);
    });

    it("deep-diff detects mismatch", () => {
        const a = { result: { score: 0.72, label: "A" } };
        const b = { result: { score: 0.65, label: "A" } };
        const diffs = deepDiff(a, b);
        expect(diffs.length).toBe(1);
        expect(diffs[0]!.path).toBe("/result/score");
        expect(diffs[0]!.expected).toBe(0.72);
        expect(diffs[0]!.actual).toBe(0.65);
    });

    it("deep-diff returns empty for identical objects", () => {
        const obj = { a: [1, 2, 3], b: { c: "d" } };
        expect(deepDiff(obj, JSON.parse(JSON.stringify(obj)))).toHaveLength(0);
    });

    it("replay verify passes on exact match", async () => {
        const runData = makeFixtureRunData();
        const contents = buildReproPackContents(
            { runId: "r", tenantId: "t", actor: "a", requestId: "r" },
            runData,
        );

        // Pipeline that returns identical data (simulating exact replay)
        const pipeline = () => runData;

        const result = await replayFromPack(contents, pipeline, { verify: true });
        expect(result.match).toBe(true);
        expect(result.exitCode).toBe(EXIT_CODES.MATCH);
        expect(result.diffs).toHaveLength(0);
    });

    it("replay verify produces diff report on mismatch", async () => {
        const runData = makeFixtureRunData();
        const contents = buildReproPackContents(
            { runId: "r", tenantId: "t", actor: "a", requestId: "r" },
            runData,
        );

        // Pipeline that returns modified outputs
        const modifiedData: RunData = {
            ...runData,
            outputs: {
                recommendation: "abort",
                confidence: 0.3,
                explanation: "Changed result",
            },
        };
        const pipeline = () => modifiedData;

        const result = await replayFromPack(contents, pipeline, { verify: true });
        expect(result.match).toBe(false);
        expect(result.exitCode).toBe(EXIT_CODES.MISMATCH);
        expect(result.diffs.length).toBeGreaterThan(0);
        // Check the diff report has paths
        expect(result.diffs.some((d) => d.path.includes("/outputs"))).toBe(true);
    });

    it("replay returns INVALID_PACK for broken packs", async () => {
        const pipeline = () => makeFixtureRunData();
        const result = await replayFromPack({ "manifest.json": "{}" }, pipeline);
        expect(result.exitCode).toBe(EXIT_CODES.INVALID_PACK);
    });
});

// ─── Assumption tracker tests ───────────────────────────────────────────────

describe("assumptions", () => {
    it("records assumptions and retrieves them", () => {
        const tracker = createAssumptionTracker();
        const a: Assumption = {
            key: "rate",
            label: "Rate",
            value: 0.05,
            units: "%",
            source: "default",
            rationale: "Standard rate",
            sensitivity: "med",
            provenance: { path: "system" },
        };
        tracker.recordAssumption(a);
        expect(tracker.getAssumptions()).toHaveLength(1);
        expect(tracker.getAssumption("rate")).toEqual(a);
    });

    it("records defaults with convenience method", () => {
        const tracker = createAssumptionTracker();
        tracker.recordDefault("horizon", "Horizon", 30, "days", "Default planning horizon");
        const result = tracker.getAssumption("horizon");
        expect(result).toBeDefined();
        expect(result!.source).toBe("default");
        expect(result!.value).toBe(30);
    });

    it("records system assumptions", () => {
        const tracker = createAssumptionTracker();
        tracker.recordSystemAssumption("precision", "Numeric Precision", 1e-6, "absolute", "IEEE 754 limits");
        expect(tracker.getAssumptionsBySource("system")).toHaveLength(1);
    });

    it("emits ASSUMPTION_APPLIED events", () => {
        const tracker = createAssumptionTracker();
        tracker.recordDefault("x", "X", 1, "unit", "reason");
        const events = tracker.getEvents();
        expect(events).toHaveLength(1);
        expect(events[0]!.type).toBe("ASSUMPTION_APPLIED");
    });

    it("fills unknown uncertainty for unset", () => {
        const tracker = createAssumptionTracker();
        tracker.recordDefault("x", "X", 1, "unit", "reason");
        const map = tracker.getUncertaintyMap();
        expect(map["x"]).toBeDefined();
        expect(map["x"]!.kind).toBe("unknown");
    });

    it("preserves explicitly set uncertainty", () => {
        const tracker = createAssumptionTracker();
        tracker.recordDefault("x", "X", 1, "unit", "reason");
        tracker.setUncertainty("x", {
            kind: "interval",
            params: { low: 0.5, high: 1.5 },
            method: "range estimate",
        });
        const map = tracker.getUncertaintyMap();
        expect(map["x"]!.kind).toBe("interval");
        expect(map["x"]!.params).toEqual({ low: 0.5, high: 1.5 });
    });

    it("unknown uncertainty remains unknown", () => {
        const tracker = createAssumptionTracker();
        tracker.recordDefault("y", "Y", 2, "unit", "reason");
        tracker.markUnknownUncertainty("y", "Cannot be quantified");
        const map = tracker.getUncertaintyMap();
        expect(map["y"]!.kind).toBe("unknown");
        expect(map["y"]!.note).toContain("Cannot be quantified");
    });
});
import { DeterminismGate, DeterminismError } from "./determinism-gate.js";

describe("Determinism Gate", () => {
    it("produces identical RNG sequences for same seed", () => {
        const gate1 = new DeterminismGate();
        gate1.initialize({ seed: "seed-1", manifest: {}, packageHash: "h1" });
        const seq1 = [gate1.getRng().nextFloat(), gate1.getRng().nextFloat()];

        const gate2 = new DeterminismGate();
        gate2.initialize({ seed: "seed-1", manifest: {}, packageHash: "h1" });
        const seq2 = [gate2.getRng().nextFloat(), gate2.getRng().nextFloat()];

        expect(seq1).toEqual(seq2);
    });

    it("freezes time to initialized value", () => {
        const gate = new DeterminismGate();
        const ts = 1700000000000;
        gate.initialize({ seed: "s", timestamp: ts, manifest: {}, packageHash: "h" });
        expect(gate.getClock().now()).toBe(ts);
        expect(gate.getClock().toISOString()).toBe(new Date(ts).toISOString());
    });

    it("throws DETERMINISM_VIOLATION on version drift", () => {
        const gate = new DeterminismGate();
        gate.initialize({ seed: "s", manifest: { appVersion: "1.0.0" }, packageHash: "h" });

        expect(() => {
            gate.checkDrift({ appVersion: "1.1.0", gitSha: "unknown", createdAt: "", tenantId: "", actor: "", requestId: "", runId: "", schemaVersion: "1.0.0" }, "h");
        }).toThrow(DeterminismError);
    });

    it("throws when accessing uninitialized state", () => {
        const gate = new DeterminismGate();
        expect(() => gate.getRng()).toThrow(/Initialize/);
    });
});
