import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeNegotiationExample } from "./examples.js";
import { executeDecision, verifyDecisionTranscript } from "./transcript.js";

// Mock @zeo/id for deterministic ID generation
let idCounter = 0;
vi.mock("@zeo/id", () => ({
  generateId: (prefix = "id") => {
    idCounter += 1;
    return `${prefix}-${idCounter}`;
  },
}));

describe("decision transcript", () => {
  beforeEach(() => {
    idCounter = 0;
  });

  it("produces stable hash for identical inputs", () => {
    // We need consistent IDs for the spec creation too,
    // but the test cares about stability of execution given a spec.
    // So we reset strictly before execution.
    idCounter = 0; // Reset for spec
    const spec = makeNegotiationExample();

    // Capture counter after spec creation
    const counterAfterSpec = idCounter;

    // Run 1
    idCounter = counterAfterSpec;
    const first = executeDecision({ spec, logicalTimestamp: 0 });

    // Run 2
    idCounter = counterAfterSpec;
    const second = executeDecision({ spec, logicalTimestamp: 0 });

    expect(first.transcript.transcript_hash).toBe(second.transcript.transcript_hash);
    expect(first.transcript.transcript_id).toBe(second.transcript.transcript_id);
  });

  it("replay is deterministic", () => {
    idCounter = 0;
    const spec = makeNegotiationExample();
    const counterAfterSpec = idCounter;

    idCounter = counterAfterSpec;
    const baseline = executeDecision({ spec, logicalTimestamp: 0 });

    idCounter = counterAfterSpec;
    const replayed = executeDecision({ spec: baseline.transcript.inputs.decision_spec, logicalTimestamp: baseline.transcript.timestamp });

    expect(replayed.transcript.transcript_hash).toBe(baseline.transcript.transcript_hash);
    expect(replayed.transcript.decision_result_hash).toBe(baseline.transcript.decision_result_hash);
  });

  it("validates required transcript invariants", () => {
    idCounter = 0;
    const transcript = executeDecision({ spec: makeNegotiationExample(), logicalTimestamp: 0 }).transcript;
    expect(verifyDecisionTranscript(transcript)).toEqual({ valid: true, reasons: [] });
  });

  it("records agent adjudication without mutating decision", () => {
    idCounter = 0;
    const spec = makeNegotiationExample();
    const counterAfterSpec = idCounter;

    idCounter = counterAfterSpec;
    const withoutAgent = executeDecision({ spec, logicalTimestamp: 0 });

    idCounter = counterAfterSpec;
    const withAgent = executeDecision({
      spec,
      logicalTimestamp: 0,
      agents: [{
        agentId: "agent-1",
        proposal: "commit_now",
        proposalHash: "abc",
        adjudication: "rejected",
        reason: "boundary violation",
        acceptedSections: [],
        rejectedSections: ["outcome.recommended_action_ids"],
      }],
    });

    expect(withAgent.transcript.decision_result_hash).toBe(withoutAgent.transcript.decision_result_hash);
    expect(withAgent.transcript.agents).toHaveLength(1);
  });
});
