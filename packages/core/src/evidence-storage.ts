import { prisma } from "@zeo/db";
import { Manifest, AttestationResult, computeManifestHash, signManifest, computeTreeHash, EvidenceFile, sha256 } from "./evidence-attestation.js";
import { type RunData } from "@zeo/repro-pack";

export interface EvidenceStorage {
    storeEvidence(
        runId: string,
        orgId: string,
        repoId: string,
        bundleZip: Buffer,
        manifest: Manifest,
        attestation: AttestationResult
    ): Promise<void>;
}

export class PrismaEvidenceStorage implements EvidenceStorage {
    async storeEvidence(
        runId: string,
        orgId: string,
        repoId: string,
        bundleZip: Buffer,
        manifest: Manifest,
        attestation: AttestationResult
    ): Promise<void> {

        // Ensure Run exists (upsert)
        // We assume runId is known. In reality, Runner might need to create it if not exists.
        // Spec says "Link attestation to runId".

        // Create Attestation
        await prisma.evidenceAttestation.create({
            data: {
                runId,
                organizationId: orgId,
                repositoryId: repoId,
                manifestHash: attestation.manifestHash,
                bundleHash: attestation.bundleHash,
                treeHash: attestation.treeHash,
                signingMode: attestation.signingMode,
                signature: attestation.signature,
                // publicKeyId: ... (if needed)
            }
        });

        // Store Evidence Objects
        // 1. Valid Zip
        await prisma.evidenceObject.create({
            data: {
                organizationId: orgId,
                runId: runId,
                kind: "zip",
                storageProvider: "db", // Storing in DB blobs is bad practice regarding size, but allowable for "db" provider if just bytes. 
                // Schema says storageKey (string). Use blob? 
                // Schema doesn't have Bytes field. It has storageKey.
                // "storageProvider ('db'|'s3'|'local')".
                // If 'db', we expect a Table to hold bytes or encode as base64 in storageKey ?? 
                // "storageKey" implies a pointer.
                // If provider is DB, usually there's a separate Blob table. I defined generic EvidenceObject.
                // I will assume for 'db' provider I can't store large blob in 'storageKey'.
                // I will implement "local" provider for the blob.
                storageKey: `evidence/${runId}.zip`,
                sizeBytes: bundleZip.length,
                contentHash: attestation.bundleHash
            }
        });

        // Write to local FS if "local"
        // I will write to a local "storage" folder
        const fs = await import("fs/promises");
        const path = await import("path");

        const storageDir = path.resolve(process.cwd(), "storage/evidence");
        await fs.mkdir(storageDir, { recursive: true });
        await fs.writeFile(path.join(storageDir, `${runId}.zip`), bundleZip);

        // 2. Manifest
        const manifestJson = JSON.stringify(manifest);
        await prisma.evidenceObject.create({
            data: {
                organizationId: orgId,
                runId: runId,
                kind: "manifest",
                storageProvider: "local",
                storageKey: `evidence/${runId}-manifest.json`,
                sizeBytes: Buffer.byteLength(manifestJson),
                contentHash: attestation.manifestHash
            }
        });
        await fs.writeFile(path.join(storageDir, `${runId}-manifest.json`), manifestJson);
    }
}
