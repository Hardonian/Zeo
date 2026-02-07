import { describe, it, expect } from "vitest";
import { CalibrationEngine } from "./engine.js";

describe("calibration", () => {
  it("should create calibration engine", () => {
    const engine = new CalibrationEngine();
    expect(engine).toBeDefined();
  });
});