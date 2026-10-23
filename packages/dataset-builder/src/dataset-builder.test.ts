import { describe, expect, it } from "vitest";
import { createDatasetBuilder } from "./index.js";

describe("dataset builder", () => {
  it("rejects an inverted time range before invoking a source adapter", async () => {
    const builder = createDatasetBuilder();

    await expect(builder.buildDataset({
      timeRange: {
        start: "2026-02-02T00:00:00.000Z",
        end: "2026-02-01T00:00:00.000Z",
      },
    })).rejects.toThrow("Time range start must be before end");
  });
});
