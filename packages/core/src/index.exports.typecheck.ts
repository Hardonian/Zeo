import {
  computeDecisionTranscriptHash,
  computeTranscriptHash,
} from "./index.js";
import { computeTranscriptHash as computeRuntimeTranscriptHash } from "./transcript.js";
// import { computeTranscriptHash as computeEnvelopeTranscriptHash } from "./transcript-security.js";

const decisionHashFromBarrel: typeof computeRuntimeTranscriptHash = computeDecisionTranscriptHash;
// const securityHashFromBarrel: typeof computeEnvelopeTranscriptHash = computeSecurityTranscriptHash;
const canonicalHashFromBarrel: typeof computeRuntimeTranscriptHash = computeTranscriptHash;

void decisionHashFromBarrel;
// void securityHashFromBarrel;
void canonicalHashFromBarrel;
