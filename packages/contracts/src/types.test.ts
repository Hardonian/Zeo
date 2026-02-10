import { describe, it, expect } from "vitest";
import type { ProbabilityInterval } from "./types.js";

describe("contracts types", () => {
  it("ProbabilityInterval has low/high", () => {
    const x: ProbabilityInterval = { low: 0.2, high: 0.4 };
    expect(x.low).toBeLessThanOrEqual(x.high);
  });
});

