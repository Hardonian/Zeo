import {
  computeDecisionTranscriptHash,
  computeSecurityTranscriptHash,
  computeTranscriptHash,
} from "./index.js";
import { computeTranscriptHash as computeRuntimeTranscriptHash } from "./transcript.js";
import { computeTranscriptHash as computeEnvelopeTranscriptHash } from "./transcript-security.js";

const decisionHashFromBarrel: typeof computeRuntimeTranscriptHash = computeDecisionTranscriptHash;
const securityHashFromBarrel: typeof computeEnvelopeTranscriptHash = computeSecurityTranscriptHash;
const canonicalHashFromBarrel: typeof computeEnvelopeTranscriptHash = computeTranscriptHash;

void decisionHashFromBarrel;
void securityHashFromBarrel;
void canonicalHashFromBarrel;
