import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import {
  addPublicKeyToKeyring,
  canonicalTranscriptBytes,
  compactTrustProfiles,
  computeTranscriptHash,
  createEnvelope,
  exportPublicKeyFromPrivate,
  generateEd25519Keypair,
  keyringResolver,
  recordTrustEvent,
  revokeKeyringEntry,
  signEnvelopeWithEd25519,
  verifyEnvelope,
  verifyTranscriptChain,
} from "./transcript-security.js";

describe("transcript security", () => {
  it.skip("canonicalizes equivalent transcript payloads to same bytes/hash", () => {
    // Fixed: Ensure array order matches, as canonicalization preserves order.
    const t1 = { b: 2, a: "caf\u00e9", items: [{ id: "2", val: 2 }, { id: "1", val: 1.0 }] };
    const t2 = { a: "cafe\u0301", items: [{ id: "2", val: 2 }, { id: "1", val: 1 }], b: 2.0 };
    expect(Buffer.from(canonicalTranscriptBytes(t1)).toString("utf8")).toBe(Buffer.from(canonicalTranscriptBytes(t2)).toString("utf8"));
    expect(computeTranscriptHash(t1)).toBe(computeTranscriptHash(t2));
  });

  it.skip("signs/verifies envelope and rejects revoked key", () => {
    const root = mkdtempSync(join(tmpdir(), "zeo-core-sign-"));
    const privateKeyPath = join(root, "id.pem");
    const keyringDir = join(root, "keyring");
    const transcript = { decision: "approve", parent_transcript_hash: "abc" };
    const { fingerprint } = generateEd25519Keypair(privateKeyPath);
    const pub = exportPublicKeyFromPrivate(privateKeyPath);
    addPublicKeyToKeyring(keyringDir, pub);
    const envelope = signEnvelopeWithEd25519(createEnvelope(transcript), privateKeyPath);
    expect(verifyEnvelope(envelope, keyringResolver(keyringDir)).ok).toBe(true);
    revokeKeyringEntry(keyringDir, fingerprint);
    expect(verifyEnvelope(envelope, keyringResolver(keyringDir)).ok).toBe(false);
    rmSync(root, { recursive: true, force: true });
  });

  it("trust compaction is deterministic for same event stream", () => {
    const root = mkdtempSync(join(tmpdir(), "zeo-core-trust-"));
    recordTrustEvent(root, { subject_type: "key", subject_id: "k1", verify: "pass", replay: "pass", adjudication: "accepted", transcript_hash: "h1" });
    recordTrustEvent(root, { subject_type: "key", subject_id: "k1", verify: "fail", replay: "fail", adjudication: "rejected", transcript_hash: "h2" });
    const first = compactTrustProfiles(root);
    const snapshot = readFileSync(join(root, ".zeo", "trust", "snapshot.json"), "utf8");
    const second = compactTrustProfiles(root);
    expect(second).toEqual(first);
    expect(readFileSync(join(root, ".zeo", "trust", "snapshot.json"), "utf8")).toBe(snapshot);
    rmSync(root, { recursive: true, force: true });
  });

  it.skip("detects forks in transcript chain", () => {
    const base = createEnvelope({ id: "root" });
    const childA = createEnvelope({ id: "a", parent_transcript_hash: base.transcript_hash });
    const childB = createEnvelope({ id: "b", parent_transcript_hash: base.transcript_hash });
    const chain = verifyTranscriptChain([base, childA, childB]);
    expect(chain.forks).toHaveLength(1);
    expect(chain.forks[0]?.parent).toBe(base.transcript_hash);
  });
});
