import { describe, it, expect } from "vitest";
import { GameEngine } from "./engine";

describe("game", () => {
  it("should create game engine", () => {
    const engine = new GameEngine();
    expect(engine).toBeDefined();
  });
});
