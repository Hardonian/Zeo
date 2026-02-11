import { describe, it, expect } from "vitest";
import { redactValue } from "./observability.js";

describe("redaction", () => {
  it("redacts secrets and prompt fields", () => {
    const payload = redactValue({ api_key: "secret123", prompt: "hello world", email: "a@b.com" }, "safe") as Record<string, unknown>;
    expect(JSON.stringify(payload)).not.toContain("secret123");
    expect(JSON.stringify(payload)).not.toContain("hello world");
    expect(JSON.stringify(payload)).not.toContain("a@b.com");
  });
});
