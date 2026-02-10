import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  addPublicKeyToKeyring,
  compactTrustProfiles,
  createEnvelope,
  deriveTrustTier,
  envelopeFilesInDir,
  exportPublicKeyFromPrivate,
  generateEd25519Keypair,
  inspectEnvelope,
  keyringResolver,
  listKeyringEntries,
  loadEnvelopeFromFile,
  recordTrustEvent,
  revokeKeyringEntry,
  signEnvelopeWithEd25519,
  verifyEnvelope,
  verifyTranscriptChain,
} from "@zeo/core";

export async function runTranscriptCommand(argv: string[]): Promise<number> {
  const [entity, action] = argv;
  try {
    if (entity === "keygen") {
      const keyPath = value(argv, "--out") ?? join(process.cwd(), ".zeo", "keys", "id_ed25519.pem");
      const passphrase = value(argv, "--passphrase");
      mkdirSync(resolve(keyPath, ".."), { recursive: true });
      const key = generateEd25519Keypair(keyPath, passphrase ?? undefined);
      process.stdout.write(`${JSON.stringify({ key_path: keyPath, fingerprint: key.fingerprint, public_key: key.publicKeyPem }, null, 2)}\n`);
      return 0;
    }

    if (entity === "key" && action === "export") {
      const keyPath = value(argv, "--key");
      if (!keyPath) throw new Error("--key is required");
      const publicKey = exportPublicKeyFromPrivate(keyPath, value(argv, "--passphrase") ?? undefined);
      process.stdout.write(`${publicKey.trim()}\n`);
      return 0;
    }

    if (entity === "transcript" && action === "sign") {
      const input = argv[2];
      const keyPath = value(argv, "--key");
      const out = value(argv, "--out");
      if (!input || !keyPath || !out) throw new Error("Usage: zeo transcript sign <transcript.json> --key <path> --out <envelope.json>");
      const transcript = JSON.parse(readFileSync(resolve(input), "utf8")) as Record<string, unknown>;
      const envelope = signEnvelopeWithEd25519(
        createEnvelope(transcript, { created_by: "zeo-cli" }),
        keyPath,
        "zeo.transcript.signature.v1",
        value(argv, "--passphrase") ?? undefined,
      );
      writeFileSync(resolve(out), `${JSON.stringify(envelope, null, 2)}\n`, "utf8");
      process.stdout.write(`${JSON.stringify({ out, transcript_hash: envelope.transcript_hash, signatures: envelope.signatures.length }, null, 2)}\n`);
      return 0;
    }

    if (entity === "transcript" && action === "verify") {
      const input = argv[2];
      if (!input) throw new Error("Usage: zeo transcript verify <envelope.json> [--pubkey <path> | --keyring <dir>]");
      const envelope = loadEnvelopeFromFile(input);
      const pubkeyPath = value(argv, "--pubkey");
      const keyring = value(argv, "--keyring") ?? join(process.cwd(), ".zeo", "keyring");
      const verify = verifyEnvelope(
        envelope,
        pubkeyPath
          ? () => readFileSync(resolve(pubkeyPath), "utf8")
          : keyringResolver(resolve(keyring)),
      );
      process.stdout.write(`${JSON.stringify(verify, null, 2)}\n`);
      return verify.ok ? 0 : 1;
    }

    if (entity === "transcript" && action === "inspect") {
      const input = argv[2];
      if (!input) throw new Error("Usage: zeo transcript inspect <envelope.json>");
      process.stdout.write(`${JSON.stringify(inspectEnvelope(loadEnvelopeFromFile(input)), null, 2)}\n`);
      return 0;
    }

    if (entity === "transcript" && action === "chain" && argv[2] === "verify") {
      const dir = argv[3];
      if (!dir) throw new Error("Usage: zeo transcript chain verify <dir>");
      const envelopes = envelopeFilesInDir(resolve(dir)).map(loadEnvelopeFromFile);
      const result = verifyTranscriptChain(envelopes);
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      return result.ok ? 0 : 1;
    }

    if (entity === "keys" && action === "add") {
      const pubPath = argv[2];
      const keyringDir = value(argv, "--keyring") ?? join(process.cwd(), ".zeo", "keyring");
      if (!pubPath) throw new Error("Usage: zeo keys add <pubkey>");
      const entry = addPublicKeyToKeyring(resolve(keyringDir), readFileSync(resolve(pubPath), "utf8"), value(argv, "--label") ?? undefined, value(argv, "--notes") ?? undefined);
      process.stdout.write(`${JSON.stringify(entry, null, 2)}\n`);
      return 0;
    }

    if (entity === "keys" && action === "list") {
      const keyringDir = value(argv, "--keyring") ?? join(process.cwd(), ".zeo", "keyring");
      process.stdout.write(`${JSON.stringify(listKeyringEntries(resolve(keyringDir)), null, 2)}\n`);
      return 0;
    }

    if (entity === "keys" && action === "revoke") {
      const fingerprint = argv[2];
      const keyringDir = value(argv, "--keyring") ?? join(process.cwd(), ".zeo", "keyring");
      if (!fingerprint) throw new Error("Usage: zeo keys revoke <fingerprint>");
      process.stdout.write(`${JSON.stringify(revokeKeyringEntry(resolve(keyringDir), fingerprint), null, 2)}\n`);
      return 0;
    }

    if (entity === "trust" && action === "record") {
      const envPath = value(argv, "--from");
      if (!envPath) throw new Error("Usage: zeo trust record --from <envelope.json>");
      const root = process.cwd();
      const keyringDir = value(argv, "--keyring") ?? join(root, ".zeo", "keyring");
      const envelope = loadEnvelopeFromFile(envPath);
      const verify = verifyEnvelope(envelope, keyringResolver(resolve(keyringDir)));
      for (const fingerprint of verify.signerFingerprints) {
        recordTrustEvent(root, {
          subject_type: "key",
          subject_id: fingerprint,
          transcript_hash: envelope.transcript_hash,
          verify: verify.ok ? "pass" : "fail",
          replay: "pass",
          adjudication: "modified",
        });
      }
      const profiles = compactTrustProfiles(root);
      process.stdout.write(`${JSON.stringify(profiles, null, 2)}\n`);
      return verify.ok ? 0 : 1;
    }

    if (entity === "trust" && action === "show") {
      const subject = argv[2];
      if (!subject) throw new Error("Usage: zeo trust show <subject_type:subject_id>");
      const profiles = compactTrustProfiles(process.cwd());
      const match = profiles.find(p => `${p.subject_type}:${p.subject_id}` === subject);
      if (!match) throw new Error(`Subject not found: ${subject}`);
      process.stdout.write(`${JSON.stringify({ ...match, tier: deriveTrustTier(match) }, null, 2)}\n`);
      return 0;
    }

    if (entity === "trust" && action === "list") {
      const profiles = compactTrustProfiles(process.cwd()).map(p => ({ ...p, tier: deriveTrustTier(p) }));
      process.stdout.write(`${JSON.stringify(profiles, null, 2)}\n`);
      return 0;
    }

    if (entity === "trust" && action === "compact") {
      process.stdout.write(`${JSON.stringify(compactTrustProfiles(process.cwd()), null, 2)}\n`);
      return 0;
    }

    if (entity === "trust" && action === "reset") {
      rmSync(join(process.cwd(), ".zeo", "trust"), { recursive: true, force: true });
      process.stdout.write('{"ok":true}\n');
      return 0;
    }

    printHelp();
    return 1;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${JSON.stringify({ error: { code: "ZEO_TRANSCRIPT_FAILED", message } })}\n`);
    return 1;
  }
}

function value(argv: string[], flag: string): string | null {
  const idx = argv.indexOf(flag);
  return idx >= 0 ? argv[idx + 1] ?? null : null;
}

function printHelp(): void {
  process.stdout.write(`Zeo transcript/key/trust commands\n`);
}
