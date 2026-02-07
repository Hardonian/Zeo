import { describe, it, expect } from "vitest";
import { CausalEngine } from "./engine.js";

describe("causal", () => {
  it("should create causal engine", () => {
    const engine = new CausalEngine();
    expect(engine).toBeDefined();
  });
});