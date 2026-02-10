import {
  createHash,
  createPrivateKey,
  createPublicKey,
  generateKeyPairSync,
  sign as cryptoSign,
  verify as cryptoVerify,
} from "node:crypto";
import { encodeCanonicalJson } from "./canonical-json.js";
import { computeTranscriptHash } from "./hashing.js";
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";

export type CanonicalJson = null | boolean | number | string | CanonicalJson[] | { [k: string]: CanonicalJson };

export interface TranscriptEnvelope {
  envelope_version: "1";
  transcript: Record<string, unknown>;
  transcript_hash: string;
  signatures: TranscriptSignature[];
  attestations: TranscriptAttestation[];
  metadata: Record<string, unknown>;
  parent_envelope_hash?: string;
}

export interface TranscriptSignature {
  algorithm: "ed25519";
  identity_type: "local_key" | "ssh_key" | "external";
  key_fingerprint: string;
  signature_b64: string;
  signing_context: string;
  signed_payload_b64: string;
}

export interface TranscriptAttestation {
  type: string;
  statement: string;
  signer?: string;
}

export interface KeyringEntry {
  id: string;
  label?: string;
  created_at_seq: number;
  notes?: string;
  revoked: boolean;
  public_key_pem: string;
}

export interface TrustProfile {
  subject_type: "agent" | "provider" | "key" | "model";
  subject_id: string;
  counters: {
    runs_total: number;
    verify_pass: number;
    verify_fail: number;
    replay_pass: number;
    replay_fail: number;
    adjudications: { accepted: number; rejected: number; modified: number };
  };
  last_seq: number;
  last_seen_transcript_hash?: string;
  notes?: string;
}

export interface TrustEvent {
  seq: number;
  subject_type: TrustProfile["subject_type"];
  subject_id: string;
  transcript_hash?: string;
  verify: "pass" | "fail";
  replay: "pass" | "fail";
  adjudication?: "accepted" | "rejected" | "modified";
}

const ARRAY_SORT_KEYS = ["id", "key_fingerprint", "subject_id", "transcript_hash", "parent_transcript_hash", "timestamp", "created_at"];

function normalizeString(value: string): string {
  return value.normalize("NFC");
}

function normalizeNumber(value: number): number {
  if (!Number.isFinite(value)) throw new Error("Canonical JSON does not support non-finite numbers");
  if (Object.is(value, -0)) return 0;
  return Number(value.toString());
}

function canonicalizeValue(value: unknown): CanonicalJson {
  if (value === null || typeof value === "boolean") return value as null | boolean;
  if (typeof value === "number") return normalizeNumber(value);
  if (typeof value === "string") return normalizeString(value);
  if (Array.isArray(value)) {
    const canonicalItems = value.map(item => canonicalizeValue(item));
    return [...canonicalItems].sort((a, b) => arraySortKey(a).localeCompare(arraySortKey(b)));
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => [normalizeString(k), canonicalizeValue(v)] as const)
      .sort(([a], [b]) => a.localeCompare(b));
    const out: Record<string, CanonicalJson> = {};
    for (const [k, v] of entries) out[k] = v;
    return out;
  }
  throw new Error(`Unsupported JSON type: ${typeof value}`);
}

function arraySortKey(value: CanonicalJson): string {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const record = value as Record<string, CanonicalJson>;
    for (const key of ARRAY_SORT_KEYS) {
      if (typeof record[key] === "string") return `${key}:${record[key] as string}`;
    }
  }
  return JSON.stringify(value);
}

export function canonicalizeTranscript(input: Record<string, unknown>): CanonicalJson {
  return canonicalizeValue(input);
}

export function canonicalTranscriptBytes(input: Record<string, unknown>): Uint8Array {
  return encodeCanonicalJson(input);
}

export { computeTranscriptHash };

function signingPayload(transcriptHash: string, envelopeVersion: string, signingContext: string): Buffer {
  return Buffer.from(`${signingContext}\n${envelopeVersion}\n${transcriptHash}`, "utf8");
}

export function generateEd25519Keypair(privateKeyPath: string, passphrase?: string): { publicKeyPem: string; fingerprint: string } {
  const keys = generateKeyPairSync("ed25519");
  const privatePem = keys.privateKey.export({
    type: "pkcs8",
    format: "pem",
    ...(passphrase ? { cipher: "aes-256-cbc", passphrase } : {}),
  }).toString();
  const publicPem = keys.publicKey.export({ type: "spki", format: "pem" }).toString();
  mkdirSync(dirname(resolve(privateKeyPath)), { recursive: true });
  writeFileSync(privateKeyPath, privatePem, { encoding: "utf8", mode: 0o600 });
  return { publicKeyPem: publicPem, fingerprint: fingerprintFromPublicKey(publicPem) };
}

export function fingerprintFromPublicKey(publicKeyPem: string): string {
  const der = createPublicKey(publicKeyPem).export({ type: "spki", format: "der" });
  return createHash("sha256").update(der).digest("hex");
}

export function createEnvelope(transcript: Record<string, unknown>, metadata: Record<string, unknown> = {}): TranscriptEnvelope {
  return {
    envelope_version: "1",
    transcript,
    transcript_hash: computeTranscriptHash(transcript),
    signatures: [],
    attestations: [],
    metadata,
  };
}

export function signEnvelopeWithEd25519(
  envelope: TranscriptEnvelope,
  privateKeyPemOrPath: string,
  signingContext = "zeo.transcript.signature.v1",
  passphrase?: string,
): TranscriptEnvelope {
  const keyText = privateKeyPemOrPath.includes("BEGIN") ? privateKeyPemOrPath : readFileSync(resolve(privateKeyPemOrPath), "utf8");
  const privateKey = createPrivateKey({ key: keyText, format: "pem", passphrase });
  const publicPem = createPublicKey(privateKey).export({ type: "spki", format: "pem" }).toString();
  const fingerprint = fingerprintFromPublicKey(publicPem);
  const payload = signingPayload(envelope.transcript_hash, envelope.envelope_version, signingContext);
  const signature = cryptoSign(null, payload, privateKey);
  envelope.signatures.push({
    algorithm: "ed25519",
    identity_type: "local_key",
    key_fingerprint: fingerprint,
    signature_b64: signature.toString("base64"),
    signing_context: signingContext,
    signed_payload_b64: payload.toString("base64"),
  });
  return envelope;
}

export function verifyEnvelope(
  envelope: TranscriptEnvelope,
  resolvePublicKey: (fingerprint: string) => string | null,
): { ok: boolean; errors: string[]; signerFingerprints: string[] } {
  const errors: string[] = [];
  const signerFingerprints: string[] = [];
  const expectedHash = computeTranscriptHash(envelope.transcript);
  if (expectedHash !== envelope.transcript_hash) errors.push("transcript_hash_mismatch");

  for (const sig of envelope.signatures) {
    signerFingerprints.push(sig.key_fingerprint);
    if (sig.algorithm !== "ed25519") {
      errors.push(`unsupported_algorithm:${sig.algorithm}`);
      continue;
    }
    const keyPem = resolvePublicKey(sig.key_fingerprint);
    if (!keyPem) {
      errors.push(`missing_public_key:${sig.key_fingerprint}`);
      continue;
    }
    const payload = signingPayload(envelope.transcript_hash, envelope.envelope_version, sig.signing_context);
    const ok = cryptoVerify(null, payload, createPublicKey(keyPem), Buffer.from(sig.signature_b64, "base64"));
    if (!ok) errors.push(`invalid_signature:${sig.key_fingerprint}`);
  }
  return { ok: errors.length === 0, errors, signerFingerprints };
}

export function computeEnvelopeHash(envelope: TranscriptEnvelope): string {
  const canonical = canonicalizeValue({
    envelope_version: envelope.envelope_version,
    transcript_hash: envelope.transcript_hash,
    signatures: envelope.signatures,
    attestations: envelope.attestations,
    metadata: envelope.metadata,
    parent_envelope_hash: envelope.parent_envelope_hash ?? null,
  });
  return createHash("sha256").update(JSON.stringify(canonical)).digest("hex");
}

export function addPublicKeyToKeyring(keyringDir: string, publicKeyPem: string, label?: string, notes?: string): KeyringEntry {
  mkdirSync(keyringDir, { recursive: true });
  const id = fingerprintFromPublicKey(publicKeyPem);
  const file = join(keyringDir, `${id}.json`);
  let seq = 1;
  if (statSyncSafe(file)) {
    const current = JSON.parse(readFileSync(file, "utf8")) as KeyringEntry;
    seq = current.created_at_seq;
  } else {
    seq = listKeyringEntries(keyringDir).length + 1;
  }
  const entry: KeyringEntry = { id, label, created_at_seq: seq, notes, revoked: false, public_key_pem: publicKeyPem };
  writeFileSync(file, `${JSON.stringify(entry, null, 2)}\n`, "utf8");
  return entry;
}

function statSyncSafe(path: string): boolean {
  try { statSync(path); return true; } catch { return false; }
}

export function listKeyringEntries(keyringDir: string): KeyringEntry[] {
  if (!statSyncSafe(keyringDir)) return [];
  return readdirSync(keyringDir)
    .filter(f => f.endsWith(".json"))
    .map(f => JSON.parse(readFileSync(join(keyringDir, f), "utf8")) as KeyringEntry)
    .sort((a, b) => a.created_at_seq - b.created_at_seq || a.id.localeCompare(b.id));
}

export function revokeKeyringEntry(keyringDir: string, fingerprint: string): KeyringEntry {
  const file = join(keyringDir, `${fingerprint}.json`);
  const entry = JSON.parse(readFileSync(file, "utf8")) as KeyringEntry;
  entry.revoked = true;
  writeFileSync(file, `${JSON.stringify(entry, null, 2)}\n`, "utf8");
  return entry;
}

function trustDirPaths(rootDir: string): { events: string; snapshot: string } {
  const dir = join(rootDir, ".zeo", "trust");
  mkdirSync(dir, { recursive: true });
  return { events: join(dir, "events.log.jsonl"), snapshot: join(dir, "snapshot.json") };
}

export function recordTrustEvent(rootDir: string, partial: Omit<TrustEvent, "seq">): TrustEvent {
  const { events } = trustDirPaths(rootDir);
  const all = readTrustEvents(rootDir);
  const event: TrustEvent = { seq: all.length + 1, ...partial };
  writeFileSync(events, [...all, event].map(e => JSON.stringify(e)).join("\n") + "\n", "utf8");
  return event;
}

export function readTrustEvents(rootDir: string): TrustEvent[] {
  const { events } = trustDirPaths(rootDir);
  if (!statSyncSafe(events)) return [];
  return readFileSync(events, "utf8")
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean)
    .map(l => JSON.parse(l) as TrustEvent)
    .sort((a, b) => a.seq - b.seq);
}

function emptyProfile(subject_type: TrustProfile["subject_type"], subject_id: string): TrustProfile {
  return {
    subject_type,
    subject_id,
    counters: {
      runs_total: 0,
      verify_pass: 0,
      verify_fail: 0,
      replay_pass: 0,
      replay_fail: 0,
      adjudications: { accepted: 0, rejected: 0, modified: 0 },
    },
    last_seq: 0,
  };
}

export function compactTrustProfiles(rootDir: string): TrustProfile[] {
  const { snapshot } = trustDirPaths(rootDir);
  const profiles = new Map<string, TrustProfile>();
  for (const event of readTrustEvents(rootDir)) {
    const key = `${event.subject_type}:${event.subject_id}`;
    const profile = profiles.get(key) ?? emptyProfile(event.subject_type, event.subject_id);
    profile.counters.runs_total += 1;
    profile.counters[event.verify === "pass" ? "verify_pass" : "verify_fail"] += 1;
    profile.counters[event.replay === "pass" ? "replay_pass" : "replay_fail"] += 1;
    if (event.adjudication) profile.counters.adjudications[event.adjudication] += 1;
    profile.last_seq = event.seq;
    if (event.transcript_hash) profile.last_seen_transcript_hash = event.transcript_hash;
    profiles.set(key, profile);
  }
  const result = [...profiles.values()].sort((a, b) => a.subject_type.localeCompare(b.subject_type) || a.subject_id.localeCompare(b.subject_id));
  writeFileSync(snapshot, `${JSON.stringify(result, null, 2)}\n`, "utf8");
  return result;
}

export function deriveTrustTier(profile: TrustProfile, window = 10): "A" | "B" | "C" | "D" {
  const total = Math.min(window, profile.counters.runs_total);
  if (total === 0) return "C";
  if (profile.subject_type === "key" && profile.notes?.includes("revoked")) return "D";
  if (profile.counters.verify_fail > 0 || profile.counters.replay_fail > 0) return "C";
  const accepted = profile.counters.adjudications.accepted;
  const rejected = profile.counters.adjudications.rejected;
  if (profile.counters.verify_pass === profile.counters.runs_total && profile.counters.replay_pass === profile.counters.runs_total) return "A";
  if (accepted >= rejected) return "B";
  return "C";
}

export function verifyTranscriptChain(envelopes: TranscriptEnvelope[]): { ok: boolean; forks: Array<{ parent: string; children: string[] }>; errors: string[] } {
  const errors: string[] = [];
  const byParent = new Map<string, string[]>();
  const existingEnvelopeHashes = new Set(envelopes.map(e => computeEnvelopeHash(e)));
  for (const env of envelopes) {
    if (env.parent_envelope_hash && !existingEnvelopeHashes.has(env.parent_envelope_hash)) {
      errors.push(`missing_parent_envelope:${env.parent_envelope_hash}`);
    }
    const parent = (env.transcript as Record<string, unknown>).parent_transcript_hash;
    if (typeof parent === "string") {
      const list = byParent.get(parent) ?? [];
      list.push(env.transcript_hash);
      byParent.set(parent, list);
    }
  }
  const forks = [...byParent.entries()].filter(([, children]) => children.length > 1).map(([parent, children]) => ({ parent, children: children.sort() }));
  return { ok: errors.length === 0, forks, errors };
}

export function loadEnvelopeFromFile(path: string): TranscriptEnvelope {
  const parsed = JSON.parse(readFileSync(resolve(path), "utf8")) as TranscriptEnvelope;
  if (parsed.envelope_version !== "1") throw new Error("Unsupported envelope_version");
  if (!parsed.transcript || typeof parsed.transcript !== "object") throw new Error("Invalid envelope transcript");
  return parsed;
}

export function inspectEnvelope(envelope: TranscriptEnvelope): Record<string, unknown> {
  return {
    envelope_version: envelope.envelope_version,
    transcript_hash: envelope.transcript_hash,
    signatures: envelope.signatures.map(s => ({ algorithm: s.algorithm, identity_type: s.identity_type, key_fingerprint: s.key_fingerprint, signing_context: s.signing_context })),
    attestations_count: envelope.attestations.length,
    has_parent_envelope_hash: Boolean(envelope.parent_envelope_hash),
    transcript_parent_hash: (envelope.transcript as Record<string, unknown>).parent_transcript_hash ?? null,
  };
}

export function keyringResolver(keyringDir: string): (fingerprint: string) => string | null {
  const cache = new Map(listKeyringEntries(keyringDir).map(e => [e.id, e]));
  return (fingerprint: string): string | null => {
    const entry = cache.get(fingerprint);
    if (!entry || entry.revoked) return null;
    return entry.public_key_pem;
  };
}

export function exportPublicKeyFromPrivate(privateKeyPath: string, passphrase?: string): string {
  const privatePem = readFileSync(resolve(privateKeyPath), "utf8");
  const privateKey = createPrivateKey({ key: privatePem, passphrase });
  return createPublicKey(privateKey).export({ type: "spki", format: "pem" }).toString();
}

export function envelopeFilesInDir(dir: string): string[] {
  return readdirSync(dir)
    .filter(f => f.endsWith(".json"))
    .map(f => join(dir, f))
    .filter(f => {
      try {
        const parsed = JSON.parse(readFileSync(f, "utf8"));
        return parsed && parsed.envelope_version === "1" && parsed.transcript_hash;
      } catch {
        return false;
      }
    })
    .sort((a, b) => basename(a).localeCompare(basename(b)));
}
