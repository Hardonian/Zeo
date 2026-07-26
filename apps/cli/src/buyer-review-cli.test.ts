import { mkdtempSync, readFileSync, mkdirSync, writeFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { runBuyerReviewCommand } from "./buyer-review-cli.js";

const previousCwds: string[] = [];
afterEach(() => { const cwd = previousCwds.pop(); if (cwd) process.chdir(cwd); });

describe("buyer review workflow", () => {
  it("writes a status/evidence packet and rollback instructions", async () => {
    const root = mkdtempSync(join(tmpdir(), "zeo-buyer-review-"));
    previousCwds.push(process.cwd());
    process.chdir(root);
    mkdirSync("inputs");
    writeFileSync("inputs/change.patch", "diff --git a/src/auth.ts b/src/auth.ts\n--- a/src/auth.ts\n+++ b/src/auth.ts\n@@ -1 +1 @@\n+export const auth = true;\n");

    const rc = await runBuyerReviewCommand(["inputs/change.patch"]);
    expect(rc).toBe(4);
    const dirs = readdirSync(join(root, ".zeo", "buyer-reviews"));
    const output = join(root, ".zeo", "buyer-reviews", dirs[0]);
    const packet = JSON.parse(readFileSync(join(output, "buyer-review.json"), "utf8"));
    expect(packet.packet_version).toBe("buyer-review.v1");
    expect(packet.evidence.diff_hash).toMatch(/^[a-f0-9]{64}$/);
    expect(readFileSync(join(output, "ROLLBACK.md"), "utf8")).toContain("read-only");
    expect(JSON.parse(readFileSync(join(output, "status.json"), "utf8")).status).toBe("blocked");
  });
});
