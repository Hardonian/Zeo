import { describe, it, expect } from "vitest";
import { DeterministicCache } from "./deterministic-cache.js";

describe("deterministic cache", () => {
  it("generates stable keys for object key order", () => {
    const cache = new DeterministicCache("1.0.0", "v1");
    const a = cache.makeKey({ b: 1, a: 2 }, "m", { t: 1 }, "cfg");
    const b = cache.makeKey({ a: 2, b: 1 }, "m", { t: 1 }, "cfg");
    expect(a.key).toBe(b.key);
    expect(a.inputHash).toBe(b.inputHash);
  });
});
