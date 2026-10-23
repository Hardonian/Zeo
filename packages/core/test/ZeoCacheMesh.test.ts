import { describe, expect, it } from "vitest";
import { ZeoCacheMesh } from "../src/cache/ZeoCacheMesh.js";
import { loadZeoCacheMeshConfig } from "../src/config/zeo-cache.config.js";
import { ZeoTaskHarness } from "../src/orchestrator/ZeoTaskHarness.js";
import type { CacheMeshConfig, ZeoProtocolMessage } from "../src/types/cache-mesh.js";

const config: CacheMeshConfig = Object.freeze({
  localDynamoUrl: "http://local.test",
  localAuthToken: "local-token",
  localModelName: "local-model",
  cloudGatewayUrl: "https://cloud.test",
  cloudAuthToken: "cloud-token",
  cloudModelName: "cloud-model",
  speculativePrefillThresholdMs: 500,
  localRequestTimeoutMs: 1_000,
  cloudRequestTimeoutMs: 1_000,
  circuitFailureThreshold: 2,
  circuitCooldownMs: 100,
});

function completion(content: string, promptTokens = 5, completionTokens = 3): Response {
  return new Response(JSON.stringify({
    choices: [{ message: { content } }],
    usage: { prompt_tokens: promptTokens, completion_tokens: completionTokens },
  }), { status: 200, headers: { "Content-Type": "application/json" } });
}

describe("ZeoCacheMesh", () => {
  it("creates the same prefix hash for semantically identical tool manifests", () => {
    const mesh = new ZeoCacheMesh(config);
    const first = mesh.fingerprintPrefix("  System prompt  ", [{ b: { y: 2, x: 1 }, a: "tool" }]);
    const second = mesh.fingerprintPrefix("System prompt", [{ a: "tool", b: { x: 1, y: 2 } }]);

    expect(first).toBe(second);
  });

  it("pins the prefix and removes only closed ephemeral thinking blocks", () => {
    const mesh = new ZeoCacheMesh(config);
    const history: readonly ZeoProtocolMessage[] = Object.freeze([
      Object.freeze({
        role: "assistant" as const,
        content: Object.freeze([
          Object.freeze({ type: "thinking" as const, thinking: "private", ephemeral: true }),
          Object.freeze({ type: "text" as const, text: "retain" }),
        ]),
      }),
    ]);

    const stabilized = mesh.stabilizeContext("system", [], history, "ast_explorer");

    expect(stabilized.messages).toHaveLength(2);
    expect(stabilized.messages[0]?.role).toBe("system");
    expect(stabilized.messages[1]?.content).toEqual([{ type: "text", text: "retain" }]);
    expect(Object.isFrozen(stabilized.messages)).toBe(true);
  });

  it("routes locally and returns parsed immutable response blocks", async () => {
    const requests: string[] = [];
    const mesh = new ZeoCacheMesh(config, {
      fetchImplementation: async (input) => {
        requests.push(input);
        return completion("<think>reasoning</think>answer");
      },
      monotonicNow: (() => {
        let value = 0;
        return () => {
          value += 10;
          return value;
        };
      })(),
    });

    const result = await mesh.executeSessionTurn(
      "ast_explorer",
      "session-1",
      "system",
      [],
      [{ role: "user", content: "inspect" }],
    );

    expect(requests).toEqual(["http://local.test/v1/chat/completions"]);
    expect(result.telemetry.routeSelected).toBe("dynamo_local");
    expect(result.blocks).toEqual([
      { type: "thinking", thinking: "reasoning", ephemeral: true },
      { type: "text", text: "answer" },
    ]);
    expect(Object.isFrozen(result.blocks)).toBe(true);
  });

  it("opens the local circuit and fails over without changing the context", async () => {
    let now = 0;
    const calls: string[] = [];
    const mesh = new ZeoCacheMesh(config, {
      now: () => now,
      fetchImplementation: async (input) => {
        calls.push(input);
        if (input.startsWith("http://local.test")) throw new Error("local engine offline");
        return completion("cloud answer");
      },
    });

    const first = await mesh.executeSessionTurn("lead_architect", "s", "system", [], [{ role: "user", content: "one" }]);
    const second = await mesh.executeSessionTurn("lead_architect", "s", "system", [], [{ role: "user", content: "two" }]);
    const third = await mesh.executeSessionTurn("lead_architect", "s", "system", [], [{ role: "user", content: "three" }]);

    expect(first.telemetry.routeSelected).toBe("frontier_cloud_fallback");
    expect(second.telemetry.routeSelected).toBe("frontier_cloud_fallback");
    expect(third.telemetry.routeSelected).toBe("frontier_cloud_fallback");
    expect(calls.filter((url) => url.startsWith("http://local.test"))).toHaveLength(2);
    expect(mesh.getCircuitState().localCircuitOpen).toBe(true);
    now = 101;
    expect(mesh.getCircuitState().localCircuitOpen).toBe(false);
    expect(mesh.getCircuitState().localFailures).toBe(0);
  });

  it("does not include provider response bodies in a dual-route failure", async () => {
    const mesh = new ZeoCacheMesh(config, {
      fetchImplementation: async (input) => {
        if (input.startsWith("http://local.test")) {
          return new Response("Bearer local-token should not escape", { status: 503 });
        }
        throw new Error("Bearer cloud-token should not escape");
      },
    });

    await expect(mesh.executeSessionTurn(
      "lead_architect",
      "session-3",
      "system",
      [],
      [{ role: "user", content: "inspect" }],
    )).rejects.toThrow("Bearer [redacted]");
    await expect(mesh.executeSessionTurn(
      "lead_architect",
      "session-4",
      "system",
      [],
      [{ role: "user", content: "inspect" }],
    )).rejects.not.toThrow("cloud-token");
  });

  it("runs independent DAG tasks concurrently while preserving input result order", async () => {
    let active = 0;
    let peakActive = 0;
    let started = 0;
    let releaseBoth: (() => void) | undefined;
    const bothStarted = new Promise<void>((resolve) => {
      releaseBoth = resolve;
    });
    const mesh = new ZeoCacheMesh(config, {
      fetchImplementation: async () => {
        active += 1;
        peakActive = Math.max(peakActive, active);
        started += 1;
        if (started === 2) releaseBoth?.();
        await bothStarted;
        active -= 1;
        return completion("local response");
      },
    });
    const harness = new ZeoTaskHarness(mesh, { maxConcurrency: 2 });
    const run = await harness.run({
      sessionId: "session-2",
      tasks: [
        { id: "explore", role: "ast_explorer", systemPrompt: "system", prompt: "find usage" },
        { id: "verify", role: "security_verifier", systemPrompt: "system", prompt: "review boundary" },
        { id: "patch", role: "patch_synthesizer", systemPrompt: "system", prompt: "write patch", dependsOn: ["explore", "verify"] },
      ],
    });

    expect(run.completed).toBe(3);
    expect(run.failed).toBe(0);
    expect(peakActive).toBe(2);
    expect(run.results.map((result) => result.taskId)).toEqual(["explore", "verify", "patch"]);
  });

  it("emits a non-silent speculative-prefill failure", async () => {
    const mesh = new ZeoCacheMesh(config, {
      fetchImplementation: async () => new Response("not available", { status: 503 }),
    });
    const failures: string[] = [];
    mesh.on("speculative_prefill_failed", (event: { readonly reason: string }) => failures.push(event.reason));

    const warmed = await mesh.triggerSpeculativePrefill(
      "system",
      [],
      [{ role: "user", content: "tool pending" }],
      "patch_synthesizer",
      "session-5",
    );

    expect(warmed).toBe(false);
    expect(failures).toEqual(["Dynamo node responded with HTTP 503"]);
  });
});

describe("loadZeoCacheMeshConfig", () => {
  it("reports actionable startup configuration failures without exposing secrets", () => {
    const result = loadZeoCacheMeshConfig({ ZEO_DYNAMO_AUTH_TOKEN: "secret" });
    expect(result.ok).toBe(false);
    if (result.ok === false) {
      expect(result.issues).toContain("ZEO_DYNAMO_URL is required.");
      expect(result.issues.join(" ")).not.toContain("secret");
    }
  });
});
