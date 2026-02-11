import { describe, it, expect } from "vitest";
import { __private__ } from "./analyze-pr-cli.js";

describe("analyze-pr", () => {
  it("extracts modified files deterministically", () => {
    const diff = [
      "diff --git a/src/a.ts b/src/a.ts",
      "+++ b/src/a.ts",
      "diff --git a/infra/main.tf b/infra/main.tf",
      "+++ b/infra/main.tf",
    ].join("\n");
    expect(__private__.parseModifiedFiles(diff)).toEqual(["infra/main.tf", "src/a.ts"]);
  });

  it("scores risk from rule hits", () => {
    const diff = [
      "+++ b/auth/login.ts",
      "+++ b/infra/deploy.yaml",
      "+++ b/prisma/migrations/001.sql",
    ].join("\n");
    const analysis = __private__.buildAnalysis("test.diff", diff, "security-review-pack");
    expect(analysis.risk_score).toBeGreaterThanOrEqual(80);
    expect(analysis.impacted_domains).toEqual(["ENG", "OPS", "SEC"]);
    expect(analysis.policy_impacts).toContain("policy-pack:security-review-pack");
  });
});
