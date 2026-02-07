import { describe, it, expect } from "vitest";
import { parseArgs } from "./index.js";

describe("parseArgs", () => {
  it("returns defaults when no args given", () => {
    const args = parseArgs([]);
    expect(args.example).toBe("negotiation");
    expect(args.depth).toBe(2);
    expect(args.jsonOnly).toBe(false);
    expect(args.out).toBeUndefined();
  });

  it("parses --example negotiation", () => {
    const args = parseArgs(["--example", "negotiation"]);
    expect(args.example).toBe("negotiation");
  });

  it("parses --example ops", () => {
    const args = parseArgs(["--example", "ops"]);
    expect(args.example).toBe("ops");
  });

  it("ignores invalid --example value", () => {
    const args = parseArgs(["--example", "invalid"]);
    expect(args.example).toBe("negotiation");
  });

  it("parses --depth 2", () => {
    const args = parseArgs(["--depth", "2"]);
    expect(args.depth).toBe(2);
  });

  it("parses --depth 3", () => {
    const args = parseArgs(["--depth", "3"]);
    expect(args.depth).toBe(3);
  });

  it("parses --depth 5", () => {
    const args = parseArgs(["--depth", "5"]);
    expect(args.depth).toBe(5);
  });

  it("ignores out-of-range --depth value", () => {
    const args = parseArgs(["--depth", "6"]);
    expect(args.depth).toBe(2);
  });

  it("parses --json-only flag", () => {
    const args = parseArgs(["--json-only"]);
    expect(args.jsonOnly).toBe(true);
  });

  it("parses --out path", () => {
    const args = parseArgs(["--out", "/tmp/result.json"]);
    expect(args.out).toBe("/tmp/result.json");
  });

  it("parses all flags combined", () => {
    const args = parseArgs(["--example", "ops", "--depth", "3", "--json-only", "--out", "out.json"]);
    expect(args.example).toBe("ops");
    expect(args.depth).toBe(3);
    expect(args.jsonOnly).toBe(true);
    expect(args.out).toBe("out.json");
  });

  it("handles flags in any order", () => {
    const args = parseArgs(["--json-only", "--out", "result.json", "--depth", "3", "--example", "ops"]);
    expect(args.example).toBe("ops");
    expect(args.depth).toBe(3);
    expect(args.jsonOnly).toBe(true);
    expect(args.out).toBe("result.json");
  });
});
