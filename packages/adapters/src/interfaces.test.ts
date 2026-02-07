import { describe, it, expect } from "vitest";
import type { AdapterHealth } from "./interfaces.js";

describe("adapters", () => {
  it("AdapterHealth shape", () => {
    const h: AdapterHealth = { ok: true, vendor: "example" };
    expect(h.ok).toBe(true);
  });
});
