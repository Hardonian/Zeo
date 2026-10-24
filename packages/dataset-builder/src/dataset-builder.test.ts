import { describe, expect, it } from "vitest";
import {
  createDatasetBuilder,
  filterDatasetByTime,
  validateDataset,
  validateDatasetAsync,
  computeDatasetChecksumSync,
} from "./index.js";
import type { DecisionSpec } from "@zeo/contracts";

describe("dataset builder", () => {
  it("rejects an inverted time range before invoking a source adapter", async () => {
    const builder = createDatasetBuilder();

    await expect(
      builder.buildDataset({
        timeRange: {
          start: "2026-02-02T00:00:00.000Z",
          end: "2026-02-01T00:00:00.000Z",
        },
      })
    ).rejects.toThrow("Time range start must be before end");
  });

  it("rejects equal start and end timestamps", async () => {
    const builder = createDatasetBuilder();

    await expect(
      builder.buildDataset({
        timeRange: {
          start: "2026-02-01T00:00:00.000Z",
          end: "2026-02-01T00:00:00.000Z",
        },
      })
    ).rejects.toThrow("Time range start must be before end");
  });

  it("rejects non-ISO invalid timestamp strings", async () => {
    const builder = createDatasetBuilder();

    await expect(
      builder.buildDataset({
        timeRange: {
          start: "invalid-date",
          end: "2026-02-01T00:00:00.000Z",
        },
      })
    ).rejects.toThrow("Invalid time range format");
  });

  it("builds a valid replay dataset end-to-end with default adapters", async () => {
    const builder = createDatasetBuilder();
    const timeRange = {
      start: "2026-01-01T00:00:00.000Z",
      end: "2026-01-05T00:00:00.000Z",
    };

    const dataset = await builder.buildDataset({
      id: "dataset_test_e2e_01",
      version: "1.0.0",
      createdAt: "2026-01-05T12:00:00.000Z",
      timeRange,
    });

    expect(dataset.id).toBe("dataset_test_e2e_01");
    expect(dataset.version).toBe("1.0.0");
    expect(dataset.catalogHash).toHaveLength(64);
    expect(dataset.sourcesHash).toHaveLength(64);
    expect(dataset.checksum).toHaveLength(64);
    expect(dataset.observations.length).toBeGreaterThanOrEqual(0);
    expect(dataset.batches.length).toBeGreaterThanOrEqual(0);

    const validation = validateDataset(dataset, { verifyChecksums: true });
    expect(validation.valid).toBe(true);
    expect(validation.errors).toEqual([]);

    const asyncValidation = await validateDatasetAsync(dataset, { verifyChecksums: true });
    expect(asyncValidation.valid).toBe(true);
    expect(asyncValidation.errors).toEqual([]);
  });

  it("supports specific adapter selection via adapterIds", async () => {
    const builder = createDatasetBuilder();
    const timeRange = {
      start: "2026-01-01T00:00:00.000Z",
      end: "2026-01-02T00:00:00.000Z",
    };

    const dataset = await builder.buildDataset({
      id: "dataset_test_macro_only",
      adapterIds: ["macro-fred"],
      timeRange,
    });

    expect(dataset.id).toBe("dataset_test_macro_only");
    expect(dataset.adapterVersions).toHaveProperty("macro-fred");
    expect(Object.keys(dataset.adapterVersions)).toEqual(["macro-fred"]);
  });

  it("includes decision templates when includeDecisions is true", async () => {
    const builder = createDatasetBuilder();
    const templates: DecisionSpec[] = [
      {
        id: "dec_hedge_macro_01",
        title: "Hedge Macro Inflation",
        context: "Macro hedging strategy under inflation regime",
        createdAt: "2026-01-01T00:00:00.000Z",
        horizon: "days",
        agents: [],
        actions: [],
        constraints: [],
        assumptions: [],
        objectives: [],
      },
    ];

    const dataset = await builder.buildDataset({
      id: "dataset_test_decisions",
      timeRange: {
        start: "2026-01-01T00:00:00.000Z",
        end: "2026-01-02T00:00:00.000Z",
      },
      includeDecisions: true,
      decisionTemplates: templates,
    });

    expect(dataset.decisions).toHaveLength(1);
    expect(dataset.decisions?.[0]?.id).toBe("dec_hedge_macro_01");
  });

  it("builds from single adapter via buildDatasetFromAdapter", async () => {
    const builder = createDatasetBuilder();
    const dataset = await builder.buildDatasetFromAdapter("macro-fred", {
      start: "2026-01-01T00:00:00.000Z",
      end: "2026-01-02T00:00:00.000Z",
    });

    expect(dataset.id).toMatch(/^dataset_\d+/);
    expect(dataset.adapterVersions).toHaveProperty("macro-fred");
  });

  it("catches structural and integrity errors in validateDataset", () => {
    const invalidDataset: any = {
      id: "wrong_prefix",
      version: "0.1",
      catalogHash: "abc",
      sourcesHash: "def",
      timeRange: {
        start: "2026-02-02T00:00:00.000Z",
        end: "2026-02-01T00:00:00.000Z",
      },
      observations: [],
      batches: [],
      checksum: "invalid_checksum",
    };

    const res = validateDataset(invalidDataset, { verifyChecksums: true });
    expect(res.valid).toBe(false);
    expect(res.errors).toContain("Dataset ID must start with 'dataset_'");
    expect(res.errors).toContain("Time range start must be before end");
  });

  it("detects checksum tampering in validateDataset with verifyChecksums: true", async () => {
    const builder = createDatasetBuilder();
    const dataset = await builder.buildDataset({
      id: "dataset_tamper_test",
      timeRange: {
        start: "2026-01-01T00:00:00.000Z",
        end: "2026-01-02T00:00:00.000Z",
      },
    });

    const tampered = { ...dataset, checksum: "0000000000000000000000000000000000000000000000000000000000000000" };
    const res = validateDataset(tampered, { verifyChecksums: true });
    expect(res.valid).toBe(false);
    expect(res.errors[0]).toContain("Dataset checksum mismatch");
  });

  it("filters dataset chronologically and accurately recomputes checksums", async () => {
    const builder = createDatasetBuilder();
    const original = await builder.buildDataset({
      id: "dataset_filter_test",
      timeRange: {
        start: "2026-01-01T00:00:00.000Z",
        end: "2026-01-10T00:00:00.000Z",
      },
    });

    const narrowed = filterDatasetByTime(original, {
      start: "2026-01-02T00:00:00.000Z",
      end: "2026-01-05T00:00:00.000Z",
    });

    expect(narrowed.timeRange.start).toBe("2026-01-02T00:00:00.000Z");
    expect(narrowed.timeRange.end).toBe("2026-01-05T00:00:00.000Z");
    expect(narrowed.observations.length).toBeLessThanOrEqual(original.observations.length);

    const validation = validateDataset(narrowed, { verifyChecksums: true });
    expect(validation.valid).toBe(true);
    expect(validation.errors).toEqual([]);
    expect(narrowed.checksum).toBe(computeDatasetChecksumSync(narrowed));
  });
});
