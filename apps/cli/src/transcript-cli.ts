import { readFileSync } from "node:fs";
import type { FinalizedDecisionTranscript } from "@zeo/contracts";
import { executeDecision, normalizeTranscriptForReplay, verifyDecisionTranscript } from "@zeo/core";

export interface TranscriptCliArgs {
  command: "verify" | "replay" | "diff" | null;
  file?: string;
  left?: string;
  right?: string;
}

export function parseTranscriptArgs(argv: string[]): TranscriptCliArgs {
  const command = argv[0] === "verify" || argv[0] === "replay" || argv[0] === "diff" ? argv[0] : null;
  if (command === "diff") return { command, left: argv[1], right: argv[2] };
  return { command, file: argv[1] };
}

function loadTranscript(path: string): FinalizedDecisionTranscript {
  return JSON.parse(readFileSync(path, "utf8")) as FinalizedDecisionTranscript;
}


export async function runTranscriptCommand(args: TranscriptCliArgs): Promise<number> {
  if (!args.command) {
    console.error("Usage: zeo transcript <verify|replay|diff> <file>");
    return 1;
  }

  if (args.command === "verify") {
    if (!args.file) {
      console.error("Usage: zeo transcript verify <file>");
      return 1;
    }
    const transcript = loadTranscript(args.file);
    const verified = verifyDecisionTranscript(transcript);
    if (!verified.valid) {
      console.error(`[TRANSCRIPT_INVALID] ${verified.reasons.join(",")}`);
      return 1;
    }
    console.log(`ok ${transcript.transcript_id} ${transcript.transcript_hash}`);
    return 0;
  }

  if (args.command === "replay") {
    if (!args.file) {
      console.error("Usage: zeo transcript replay <file>");
      return 1;
    }
    const transcript = loadTranscript(args.file);
    const verified = verifyDecisionTranscript(transcript);
    if (!verified.valid) {
      console.error(`[TRANSCRIPT_INVALID] ${verified.reasons.join(",")}`);
      return 1;
    }

    const replayed = executeDecision({
      spec: transcript.inputs.decision_spec,
      logicalTimestamp: transcript.timestamp,
      parentTranscriptHash: transcript.parent_transcript_hash,
      agents: transcript.agents,
    });

    const replayedNormalized = normalizeTranscriptForReplay(replayed.transcript);
    const sourceNormalized = normalizeTranscriptForReplay(transcript);
    if (JSON.stringify(replayedNormalized) !== JSON.stringify(sourceNormalized)) {
      console.error("[REPLAY_DIVERGENCE] decision result diverged");
      return 1;
    }

    console.log(`ok replay ${transcript.transcript_id}`);
    return 0;
  }

  if (!args.left || !args.right) {
    console.error("Usage: zeo transcript diff <a> <b>");
    return 1;
  }

  const left = loadTranscript(args.left);
  const right = loadTranscript(args.right);

  const inputChanged = JSON.stringify(left.inputs) !== JSON.stringify(right.inputs);
  const evidenceChanged = JSON.stringify(left.evidence.submitted) !== JSON.stringify(right.evidence.submitted);
  const outcomeChanged = JSON.stringify(left.outcome) !== JSON.stringify(right.outcome);

  console.log(`inputs_changed=${inputChanged}`);
  console.log(`evidence_changed=${evidenceChanged}`);
  console.log(`boundary_flip=${outcomeChanged}`);
  if (outcomeChanged) {
    console.log(`why=counterfactual shift from ${left.counterfactuals.length} to ${right.counterfactuals.length}`);
  }
  return 0;
}
