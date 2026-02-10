import { describe, it, expect } from "vitest";
import { makeNegotiationExample } from "./examples.js";
import { executeDecision, verifyDecisionTranscript } from "./transcript.js";

describe("decision transcript", () => {
  it("produces stable hash for identical inputs", () => {
    const spec = makeNegotiationExample();
    const first = executeDecision({ spec, logicalTimestamp: 0 });
    const second = executeDecision({ spec, logicalTimestamp: 0 });

    expect(first.transcript.transcript_hash).toBe(second.transcript.transcript_hash);
    expect(first.transcript.transcript_id).toBe(second.transcript.transcript_id);
  });

  it("replay is deterministic", () => {
    const spec = makeNegotiationExample();
    const baseline = executeDecision({ spec, logicalTimestamp: 0 });
    const replayed = executeDecision({ spec: baseline.transcript.inputs.decision_spec, logicalTimestamp: baseline.transcript.timestamp });

    expect(replayed.transcript.transcript_hash).toBe(baseline.transcript.transcript_hash);
    expect(replayed.result).toEqual(baseline.result);
  });

  it("validates required transcript invariants", () => {
    const transcript = executeDecision({ spec: makeNegotiationExample(), logicalTimestamp: 0 }).transcript;
    expect(verifyDecisionTranscript(transcript)).toEqual({ valid: true, reasons: [] });
  });

  it("records agent adjudication without mutating decision", () => {
    const spec = makeNegotiationExample();
    const withoutAgent = executeDecision({ spec, logicalTimestamp: 0 });
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

    expect(withAgent.result).toEqual(withoutAgent.result);
    expect(withAgent.transcript.agents).toHaveLength(1);
  });
});
